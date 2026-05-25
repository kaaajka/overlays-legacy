import React from "react";
import { observer } from "mobx-react";
import { action, makeObservable, observable, reaction } from "mobx";
import type { RouterCompatProps } from "../routing/routerCompat";
import type { IReactionDisposer } from "mobx";

import { type EventModel, EventState } from "../models/Event";
import { RouletteEventModel } from "../models/RouletteEvent";
import type { IRouletteItemSchema } from "../models/RouletteItem";
import { NormalEventModel } from "../models/NormalEvent";
import type { DonateEventModel } from "../models/DonateEvent";
import { CoinflipEventModel } from "../models/CoinflipEvent";
import type { ICoinflipSegmentSchema } from "../models/CoinflipSegment";

import RouletteEvent from "./RouletteEvent";
import NormalEvent from "./NormalEvent";
import DonateEvent from "./DonateEvent";
import CoinflipEvent from "./CoinflipEvent";
import { OverlayUnavailable } from "./OverlayUnavailable";

import { AppConfig } from "../config";
import "../style/app.scss";

import muteImage from "../assets/images/alerts/mute-alert.png";
import censureImage from "../assets/images/alerts/censure-alert.png";
import withoutRImage from "../assets/images/alerts/without-r-alert.png";
import dogsImage from "../assets/images/alerts/dogs-reward-alert.png";
import rouletteImage from "../assets/images/alerts/roulette-alert.webp";
import coinflipImage from "../assets/images/alerts/coinflip-alert.gif";
import { debugLog } from "../debug";
import { safeJsonParse } from "../protocol/safeJson";
import type { MainOverlayMode } from "../protocol/mainOverlayMode";
import { resolveMainOverlayAlertListTransition } from "../protocol/resolveMainOverlayAlertListTransition";
import { resolveMainOverlayEventAction } from "../protocol/resolveMainOverlayEventAction";
import { buildMainOverlaySocketUrl } from "../socket/buildOverlaySocketUrl";
import { createLegacyOverlaySocket } from "../socket/createLegacyOverlaySocket";
import type { LegacyOverlaySocketController } from "../socket/createLegacyOverlaySocket";
import { playOverlayAudio } from "../audio/playOverlayAudio";
import {
  resolveCoinflipPrepareSoundUrl,
  resolveRewardRandomSoundUrl,
} from "../assets/resolveOverlayAssetUrl";
import {
  cleanupFixtureAudioUnlockPrompt,
  isRequestedLegacyFixtureReplayActive,
  replayRequestedLegacyFixture,
} from "../dev/replay/legacyReplay";
import { createDonateEventModelFromArgs } from "../donations/createDonateEventModelFromArgs";

const images: Record<string, string> = {
  mute: muteImage,
  censure: censureImage,
  withoutR: withoutRImage,
  dogs: dogsImage,
  roulette: rouletteImage,
  coinflip: coinflipImage,
};

const randomSounds = [
  resolveRewardRandomSoundUrl(1),
  resolveRewardRandomSoundUrl(2),
  resolveRewardRandomSoundUrl(3),
  resolveRewardRandomSoundUrl(4),
  resolveRewardRandomSoundUrl(5),
  resolveRewardRandomSoundUrl(6),
  resolveRewardRandomSoundUrl(7),
  resolveRewardRandomSoundUrl(8),
  resolveRewardRandomSoundUrl(9),
  resolveRewardRandomSoundUrl(10),
  resolveRewardRandomSoundUrl(11),
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
  resolveCoinflipPrepareSoundUrl(1),
  resolveCoinflipPrepareSoundUrl(2),
  resolveCoinflipPrepareSoundUrl(3),
  resolveCoinflipPrepareSoundUrl(4),
];

type PageChannelProps = RouterCompatProps & {
  mode?: MainOverlayMode;
  testMode?: boolean;
};

@observer
export class PageChannel extends React.Component<PageChannelProps> {
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

  constructor(props: PageChannelProps) {
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
    if (typeof url !== "undefined") {
      if (this.currentPlaying) {
        this.currentPlaying.pause();
        this.currentPlaying = undefined;
      }

      this.currentPlaying =
        playOverlayAudio({
          url,
          volume: 0.3,
          label: "Legacy overlay event sound",
          mutedFixtureAudioKind: "template",
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
      debugLog(
        "Skipped legacy main websocket connection during fixture replay",
      );
      return;
    }

    this.socket = createLegacyOverlaySocket({
      url: buildMainOverlaySocketUrl(AppConfig.ws, accountKey, this.testMode),
      label: "main",
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
    const action = resolveMainOverlayEventAction(payload, {
      mode: this.mode,
      testMode: this.testMode,
    });

    if (action.type === "ignore" && action.reason === "unknown_payload") {
      debugLog("Ignored unknown legacy main websocket payload", payload);
      return;
    }

    if (action.type === "ignore" && action.reason === "inactive_event_name") {
      debugLog(
        "Ignored legacy main websocket payload outside active test mode",
        {
          testMode: this.testMode,
          event: action.message.event,
          key: action.message.key,
        },
      );
      return;
    }

    if (
      action.type === "ignore" &&
      action.reason === "inactive_overlay_mode"
    ) {
      debugLog(
        "Ignored legacy main websocket payload outside active overlay mode",
        {
          mode: this.mode,
          event: action.message.event,
          key: action.message.key,
          origin: action.message.origin,
        },
      );
      return;
    }

    if (
      action.type === "ignore" &&
      action.reason === "missing_prepare_started_args"
    ) {
      debugLog(
        "Ignored malformed legacy prepare/started payload",
        action.message,
      );
      return;
    }

    if (
      action.type === "ignore" &&
      action.reason === "malformed_roulette_started_args"
    ) {
      debugLog(
        "Ignored malformed legacy roulette started payload",
        action.message,
      );
      return;
    }

    if (
      action.type === "ignore" &&
      action.reason === "malformed_coinflip_started_args"
    ) {
      debugLog(
        "Ignored malformed legacy coinflip started payload",
        action.message,
      );
      return;
    }

    if (action.type === "ignore" && action.reason === "malformed_update_args") {
      debugLog("Ignored malformed legacy update payload", action.message);
      return;
    }

    if (action.type === "ignore") return;

    const { message: json } = action;

    if (action.type === "play_sound") {
      const { args } = action;
      const volume = typeof args?.volume === "number" ? args.volume : undefined;
      const url = typeof args?.url === "string" ? args.url : undefined;

      if (typeof volume !== "number" || !url) return;

      playOverlayAudio({
        url,
        volume,
        label: "Legacy overlay playSound",
        mutedFixtureAudioKind: "fallback",
      });
    } else if (action.type === "donate_prepare") {
      const { args } = action;
      const donate = createDonateEventModelFromArgs(args, {
        fallbackId: json.id,
      });

      if (donate) this.pushDonate(donate);
    } else if (action.type === "alert_list") {
      const { args } = action;
      const transition = resolveMainOverlayAlertListTransition(
        this.donateAlertQueue,
        json.key,
        args,
      );

      this.donateAlertQueue = transition.queue;

      if (transition.shouldSubmitFirstAlert) {
        this.submitFirstAlert();
      }
    } else if (action.type === "prepare_started") {
      const { args } = action;
      const isPrepareState = action.state === "prepare";
      const params = {
        id: json.id,
        key: json.key,
        name: typeof args.name === "string" ? args.name : "",
        description:
          typeof args.description === "string" ? args.description : "",
      };
      let event: EventModel;
      switch (json.key) {
        case "roulette":
          event = new RouletteEventModel({
            ...params,
            items: Array.isArray(args.items)
              ? (args.items as IRouletteItemSchema[])
              : [],
          });
          break;
        case "coinflip":
          event = new CoinflipEventModel({
            ...params,
            segments: Array.isArray(args.segments)
              ? (args.segments as ICoinflipSegmentSchema[])
              : [],
          });
          break;
        default:
          event = new NormalEventModel(params);
          break;
      }
      const toUpdate: {
        state: EventState;
        time?: number;
        winner?: number;
        coin_landing_side?: number;
      } = { state: isPrepareState ? EventState.PREPARE : EventState.STARTED };

      if (isPrepareState) {
        let list: string[];
        switch (json.key) {
          case "dogs":
            list = dogsSounds;
            break;
          case "coinflip":
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
          ["roulette", "coinflip"].includes(json.key) &&
          typeof args.winner === "number"
        )
          toUpdate.winner = args.winner;
        if (
          json.key === "coinflip" &&
          typeof args.coin_landing_side === "number"
        )
          toUpdate.coin_landing_side = args.coin_landing_side;

        if (typeof args.time === "number") toUpdate.time = args.time;
      }

      event.update(toUpdate);

      this.setCurrentEvent(event);
    } else if (action.type === "update") {
      const { args } = action;
      if (this.currentEvent && this.currentEvent.id === json.id) {
        this.currentEvent.update({ [args.key]: args.value });
      }
    } else if (action.type === "finished") {
      if (this.currentEvent && this.currentEvent.id === json.id)
        this.setCurrentEvent(undefined);
    }
  }

  private submitFirstAlert() {
    if (!this.currentDonateAlert && this.donateAlertQueue.length > 0) {
      this.currentDonateAlert = this.donateAlertQueue[0];

      this.socket?.send(
        JSON.stringify({
          type: "acceptAlert",
          args: {
            id: this.currentDonateAlert,
          },
        }),
      );
    }
  }

  get testMode(): boolean {
    return this.props.testMode === true;
  }

  get mode(): MainOverlayMode {
    return this.props.mode ?? "all";
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
