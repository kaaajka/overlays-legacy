import { observer } from 'mobx-react';
import React from 'react';
import { action, makeObservable, observable, runInAction } from 'mobx';
import type { RouterCompatProps } from '../routing/routerCompat';

import Goal from './Goal';
import { OverlayUnavailable } from './OverlayUnavailable';

import { AppConfig } from '../config';
import { debugLog } from '../debug';
import { safeJsonParse } from '../protocol/safeJson';
import { isLegacyGoalMessage } from '../protocol/legacyOverlayProtocol';
import { buildLegacyWsUrl } from '../protocol/legacyWsUrl';
import { createLegacyOverlaySocket } from '../socket/createLegacyOverlaySocket';
import type { LegacyOverlaySocketController } from '../socket/createLegacyOverlaySocket';
import {
  cleanupFixtureAudioUnlockPrompt,
  replayRequestedLegacyFixture,
} from '../dev/replay/legacyReplay';

@observer
export class PageChannelFollowers extends React.Component<
  IPageChannelFollowersProps & RouterCompatProps,
  {}
> {
  connecting: boolean = true;
  connectionFailed: boolean = false;
  current: number | undefined = undefined;
  goal: number | undefined = undefined;

  private socket?: LegacyOverlaySocketController;

  private testTimeout?: any;

  constructor(props: IPageChannelFollowersProps & RouterCompatProps) {
    super(props);

    makeObservable(this, {
      connecting: observable,
      connectionFailed: observable,
      current: observable,
      goal: observable,

      setConnecting: action,
      setConnectionFailed: action,
    });
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
    this.closeConnection();

    if (this.testTimeout) clearInterval(this.testTimeout);
  }

  render() {
    if (this.connectionFailed) return <OverlayUnavailable />;

    const canDraw =
      !this.connecting &&
      typeof this.current !== 'undefined' &&
      typeof this.goal !== 'undefined';

    return (
      <div className={'subGoal'}>
        {!!this.connecting && <h1>Łączenie...</h1>}

        {canDraw && (
          <Goal current={this.current} goal={this.goal} type={'followers'} />
        )}
      </div>
    );
  }

  setConnecting(state: boolean) {
    if (this.connecting !== state) this.connecting = state;
  }

  setConnectionFailed(state: boolean) {
    if (this.connectionFailed !== state) this.connectionFailed = state;
  }

  private closeConnection() {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  private createConnection(accountKey: string) {
    this.socket = createLegacyOverlaySocket({
      url: buildLegacyWsUrl(AppConfig.ws, accountKey, 'followers'),
      label: 'followers',
      onOpen: () => {
        this.setConnectionFailed(false);
        if (this.connecting) this.setConnecting(false);
      },
      onClose: () => {
        runInAction(() => {
          this.current = undefined;
          this.goal = undefined;
        });
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
    if (!isLegacyGoalMessage(json)) {
      debugLog('Ignored unknown legacy goal websocket payload', json);
      return;
    }

    switch (json.type) {
      case 'set':
        runInAction(() => {
          this.current = json.args.current;
          this.goal = json.args.goal;
        });
        break;
      case 'update':
        runInAction(() => {
          if (typeof json.args.current !== 'undefined')
            this.current = json.args.current;
          if (typeof json.args.goal !== 'undefined') this.goal = json.args.goal;
        });
        break;
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

interface IPageChannelFollowersProps {}
