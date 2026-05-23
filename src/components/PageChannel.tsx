import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import { action, makeObservable, observable, reaction } from 'mobx';
import type { IReactionDisposer } from 'mobx';

import { EventModel, EventState } from '../models/Event';
import { RouletteEventModel } from '../models/RouletteEvent';
import { NormalEventModel } from '../models/NormalEvent';
import { DonateEventModel } from '../models/DonateEvent';
import { CoinflipEventModel } from '../models/CoinflipEvent';

import RouletteEvent from './RouletteEvent';
import NormalEvent from './NormalEvent';
import DonateEvent from './DonateEvent';
import CoinflipEvent from './CoinflipEvent';
import { OverlayUnavailable } from './OverlayUnavailable';

import { AppConfig } from '../config';

import '../style/app.scss';

import muteImage from '../assets/images/pobrane_2.png';
import censureImage from '../assets/images/pobrane_3.png';
import withoutRImage from '../assets/images/pobrane_1.png';
import dogsImage from '../assets/images/pobrane_5.png';
import rouletteImage from '../assets/images/pobrane_6.webp';
import coinflipImage from '../assets/images/cat_surprised.gif';
import { debugLog } from '../debug';
import { safeJsonParse } from '../protocol/safeJson';
import {
  getRecord,
  isLegacyMainMessage,
} from '../protocol/legacyOverlayProtocol';
import { buildLegacyWsUrl } from '../protocol/legacyWsUrl';
import { createLegacyOverlaySocket } from '../socket/createLegacyOverlaySocket';
import type { LegacyOverlaySocketController } from '../socket/createLegacyOverlaySocket';
import { playOverlayAudio } from '../audio/playOverlayAudio';
import {
  cleanupFixtureAudioUnlockPrompt,
  isRequestedLegacyFixtureReplayActive,
  replayRequestedLegacyFixture,
} from '../dev/replay/legacyReplay';

const images: { [key: string]: any } = {
  mute: muteImage,
  censure: censureImage,
  withoutR: withoutRImage,
  dogs: dogsImage,
  roulette: rouletteImage,
  coinflip: coinflipImage,
};

const randomSounds = [
  AppConfig.assetUrl('/assets/sounds/1.mp3'),
  AppConfig.assetUrl('/assets/sounds/2.mp3'),
  AppConfig.assetUrl('/assets/sounds/3.mp3'),
  AppConfig.assetUrl('/assets/sounds/4.mp3'),
  AppConfig.assetUrl('/assets/sounds/5.mp3'),
  AppConfig.assetUrl('/assets/sounds/6.mp3'),
  AppConfig.assetUrl('/assets/sounds/7.mp3'),
  AppConfig.assetUrl('/assets/sounds/8.mp3'),
  AppConfig.assetUrl('/assets/sounds/9.mp3'),
  AppConfig.assetUrl('/assets/sounds/10.mp3'),
  AppConfig.assetUrl('/assets/sounds/11.mp3'),
];

const dogsSounds = [
  randomSounds[2],
  randomSounds[4],
  randomSounds[5],
  randomSounds[6],
  randomSounds[7],
  randomSounds[8],
  randomSounds[9],
  randomSounds[10],
];

const coinflipSounds = [
  AppConfig.assetUrl('/assets/sounds/12.mp3'),
  AppConfig.assetUrl('/assets/sounds/13.mp3'),
  AppConfig.assetUrl('/assets/sounds/14.mp3'),
  AppConfig.assetUrl('/assets/sounds/15.mp3'),
];

let EVENTS = {};
switch (import.meta.env.VITE_APP_ENV) {
  default:
  case 'prod':
    EVENTS = {
      donate_prepare: ['prepare'],
      prepare_started: ['prepare', 'started'],
      update: ['update'],
      finished: ['finished'],
    };
    break;
  case 'test':
    EVENTS = {
      donate_prepare: ['prepare', 'test'],
      prepare_started: ['prepare', 'started', 't_prepare', 't_started'],
      update: ['update', 't_update'],
      finished: ['finished', 't_finished'],
    };
    break;
}

@observer
export class PageChannel extends React.Component<
  IPageChannelProps & RouteComponentProps<{ id: string }>,
  {}
> {
  connecting: boolean = true;
  connectionFailed: boolean = false;
  currentEvent: EventModel | undefined = undefined;
  currentPlaying: HTMLAudioElement | undefined = undefined;

  donateList: DonateEventModel[] = [];
  currentDonate: DonateEventModel | undefined = undefined;

  private socket?: LegacyOverlaySocketController;
  private changeDonateTimeout?: ReturnType<typeof setTimeout>;
  private disposeAccountKeyReaction?: IReactionDisposer;

  private donateAlertQueue: string[] = [];
  private currentDonateAlert?: string;

  constructor(props: IPageChannelProps & RouteComponentProps<{ id: string }>) {
    super(props);

    makeObservable(this, {
      connecting: observable,
      connectionFailed: observable,
      currentEvent: observable,
      currentPlaying: observable,
      donateList: observable,
      currentDonate: observable,

      setConnecting: action,
      setConnectionFailed: action,
      setCurrentEvent: action,
      setCurrentPlaying: action,
      pushDonate: action,
      donateFinished: action.bound,
    });

    this.disposeAccountKeyReaction = reaction(
      () => this.accountKey,
      (accountKey) => {
        this.closeConnection();
        this.createConnection(accountKey);
      },
    );
  }

  componentDidMount() {
    this.closeConnection();

    const didReplayFixture = replayRequestedLegacyFixture((payload) =>
      this.handleLegacyMessage(payload),
    );
    if (didReplayFixture) {
      this.setConnecting(false);
      return;
    }

    this.createConnection(this.accountKey);
  }

  componentWillUnmount() {
    cleanupFixtureAudioUnlockPrompt();

    this.disposeAccountKeyReaction?.();
    this.disposeAccountKeyReaction = undefined;

    this.closeConnection();
  }

  render() {
    if (this.connectionFailed) return <OverlayUnavailable />;

    return (
      <div>
        {this.connecting && <h1>Łączenie...</h1>}
        {!this.connecting && !!this.currentDonate && (
          <DonateEvent
            donate={this.currentDonate}
            onFinished={this.donateFinished}
          />
        )}

        {!this.connecting &&
          !!this.currentEvent &&
          (this.currentEvent instanceof RouletteEventModel ? (
            <RouletteEvent images={images} event={this.currentEvent} />
          ) : this.currentEvent instanceof CoinflipEventModel ? (
            <CoinflipEvent images={images} event={this.currentEvent} />
          ) : (
            <NormalEvent
              images={images}
              event={this.currentEvent as NormalEventModel}
            />
          ))}
      </div>
    );
  }

  setConnecting(state: boolean) {
    if (this.connecting !== state) this.connecting = state;
  }

  setConnectionFailed(state: boolean) {
    if (this.connectionFailed !== state) this.connectionFailed = state;
  }

  setCurrentEvent(event?: EventModel) {
    this.currentEvent = event;
  }

  setCurrentPlaying(url?: string) {
    if (typeof url !== 'undefined') {
      if (this.currentPlaying) {
        this.currentPlaying.pause();
        this.currentPlaying = undefined;
      }

      this.currentPlaying = playOverlayAudio({
        url,
        volume: 0.3,
        label: 'Legacy overlay event sound',
        mutedFixtureAudioKind: 'template',
      }) ?? undefined;
    } else {
      if (this.currentPlaying) {
        this.currentPlaying.pause();

        this.currentPlaying = undefined;
      }
    }
  }

  donateFinished() {
    if (!this.currentDonate) return;

    this.donateList = this.donateList.slice(1);
    this.currentDonate = undefined;

    if (this.changeDonateTimeout) clearTimeout(this.changeDonateTimeout);

    this.changeDonateTimeout = setTimeout(
      action(() => {
        this.currentDonateAlert = undefined;

        this.submitFirstAlert();

        if (this.donateList.length) this.currentDonate = this.donateList[0];
      }),
      50,
    );
  }

  pushDonate(donate: DonateEventModel) {
    this.donateList.push(donate);

    if (!this.currentDonate) {
      if (this.changeDonateTimeout) clearTimeout(this.changeDonateTimeout);

      this.changeDonateTimeout = setTimeout(
        action(() => {
          if (this.donateList.length) this.currentDonate = this.donateList[0];
        }),
        50,
      );
    }
  }

  private closeConnection() {
    if (this.changeDonateTimeout) clearTimeout(this.changeDonateTimeout);

    this.setCurrentEvent(undefined);
    this.setCurrentPlaying(undefined);

    this.socket?.disconnect();
    this.socket = undefined;
  }

  private createConnection(accountKey: string) {
    if (isRequestedLegacyFixtureReplayActive()) {
      debugLog('Skipped legacy main websocket connection during fixture replay');
      return;
    }

    this.socket = createLegacyOverlaySocket({
      url: buildLegacyWsUrl(AppConfig.ws, accountKey, 'main'),
      label: 'main',
      onOpen: () => {
        this.setConnectionFailed(false);
        if (this.connecting) this.setConnecting(false);
      },
      onClose: () => {
        this.setCurrentEvent(undefined);
      },
      onMessage: (data) => {
        this.handleLegacyMessage(safeJsonParse(data));
      },
      onFailure: () => {
        this.setConnecting(false);
        this.setConnectionFailed(true);
      },
    });

    this.socket.connect();
  }

  private handleLegacyMessage(payload: unknown) {
    const json = payload;
    if (!isLegacyMainMessage(json)) {
      debugLog('Ignored unknown legacy main websocket payload', json);
      return;
    }

    const args = getRecord(json.args);

    if (json.event === 'prepare' && json.key === 'playSound') {
      const volume = typeof args?.volume === 'number' ? args.volume : undefined;
      const url = typeof args?.url === 'string' ? args.url : undefined;

      if (typeof volume !== 'number' || !url) return;

      playOverlayAudio({
        url,
        volume,
        label: 'Legacy overlay playSound',
        mutedFixtureAudioKind: 'fallback',
      });
    } else if (
      EVENTS['donate_prepare'].includes(json.event) &&
      json.key === 'donate' &&
      args
    ) {
      const preparedArgs = {
        id: typeof args.id === 'string' ? args.id : json.id,
        nickname: typeof args.nickname === 'string' ? args.nickname : '',
        message:
          typeof args.message === 'string'
            ? this.prepareDonateMessage(args.message)
            : '',
        amount: typeof args.amount === 'number' ? args.amount : 0,
        commission: typeof args.commission === 'number' ? args.commission : 0,
        audio_url: typeof args.audio_url === 'string' ? args.audio_url : null,
        tts_nickname_google_male:
          typeof args.tts_nickname_google_male === 'string'
            ? args.tts_nickname_google_male
            : '',
        tts_nickname_google_female:
          typeof args.tts_nickname_google_female === 'string'
            ? args.tts_nickname_google_female
            : '',
        tts_message_google_male:
          typeof args.tts_message_google_male === 'string'
            ? args.tts_message_google_male
            : '',
        tts_message_google_female:
          typeof args.tts_message_google_female === 'string'
            ? args.tts_message_google_female
            : '',
        tts_amount_google_male:
          typeof args.tts_amount_google_male === 'string'
            ? args.tts_amount_google_male
            : '',
        tts_amount_google_female:
          typeof args.tts_amount_google_female === 'string'
            ? args.tts_amount_google_female
            : '',
        test: typeof args.test === 'boolean' ? args.test : false,
        resent: typeof args.resent === 'boolean' ? args.resent : false,
      };
      this.pushDonate(new DonateEventModel(preparedArgs));
    } else if (json.event === 'alertList' && args) {
      if (json.key === 'set' && Array.isArray(args.list)) {
        this.donateAlertQueue = args.list.filter(
          (item): item is string => typeof item === 'string',
        );

        this.submitFirstAlert();
      } else if (json.key === 'add' && typeof args.id === 'string') {
        const index = this.donateAlertQueue.indexOf(args.id);

        if (index === -1) {
          this.donateAlertQueue.push(args.id);

          this.submitFirstAlert();
        }
      } else if (json.key === 'delete' && typeof args.id === 'string') {
        const index = this.donateAlertQueue.indexOf(args.id);

        if (index > -1) this.donateAlertQueue.splice(index, 1);
      }
    } else {
      if (EVENTS['prepare_started'].includes(json.event) && args) {
        const params = {
          id: json.id,
          key: json.key,
          name: typeof args.name === 'string' ? args.name : '',
          description:
            typeof args.description === 'string' ? args.description : '',
        };
        let event: EventModel;
        switch (json.key) {
          case 'roulette':
            event = new RouletteEventModel({
              ...params,
              items: Array.isArray(args.items) ? (args.items as any[]) : [],
            });
            break;
          case 'coinflip':
            event = new CoinflipEventModel({
              ...params,
              segments: Array.isArray(args.segments)
                ? (args.segments as any[])
                : [],
            });
            break;
          default:
            event = new NormalEventModel(params);
            break;
        }

        const isPrepareState = ['t_prepare', 'prepare'].includes(json.event);
        const toUpdate: {
          state: EventState;
          time?: number;
          winner?: number;
          coin_landing_side?: number;
        } = { state: isPrepareState ? EventState.PREPARE : EventState.STARTED };

        if (isPrepareState) {
          let list: string[];
          switch (json.key) {
            case 'dogs':
              list = dogsSounds;
              break;
            case 'coinflip':
              list = coinflipSounds;
              break;
            default:
              list = randomSounds;
              break;
          }
          const randomSound = list[Math.floor(Math.random() * list.length)];

          this.setCurrentPlaying(randomSound);
        } else {
          if (
            ['roulette', 'coinflip'].includes(json.key) &&
            typeof args.winner === 'number'
          )
            toUpdate.winner = args.winner;
          if (
            json.key === 'coinflip' &&
            typeof args.coin_landing_side === 'number'
          )
            toUpdate.coin_landing_side = args.coin_landing_side;

          if (typeof args.time === 'number') toUpdate.time = args.time;
        }

        event.update(toUpdate);

        this.setCurrentEvent(event);
      } else if (EVENTS['update'].includes(json.event) && args) {
        if (
          this.currentEvent &&
          this.currentEvent.id === json.id &&
          typeof args.key === 'string'
        ) {
          this.currentEvent.update({ [args.key]: args.value });
        }
      } else if (EVENTS['finished'].includes(json.event)) {
        if (this.currentEvent && this.currentEvent.id === json.id)
          this.setCurrentEvent(undefined);
      }
    }
  }

  private prepareDonateMessage(message: string) {
    let output = message;
    // output = output.replaceAll('/default/light/1.0', '/default/light/2.0');
    // return ReactHTMLParser(output);
    output = output.replaceAll(
      /<img(?:.*?)alt="(.*?)"(?:.*?)>/g,
      (match, p1) => (p1 ? p1 : ''),
    );
    return output;
  }

  private submitFirstAlert() {
    if (!this.currentDonateAlert && !!this.donateAlertQueue.length) {
      this.currentDonateAlert = this.donateAlertQueue[0];

      this.socket?.send(
        JSON.stringify({
          type: 'acceptAlert',
          args: {
            id: this.currentDonateAlert,
          },
        }),
      );
    }
  }

  get accountKey(): string {
    const {
      match: {
        params: { id },
      },
    } = this.props;

    return id;
  }
}

interface IPageChannelProps {}
