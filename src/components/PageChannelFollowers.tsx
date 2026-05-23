import { observer } from 'mobx-react';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { action, makeObservable, observable, runInAction } from 'mobx';

import Goal from './Goal';
import { OverlayUnavailable } from './OverlayUnavailable';

import { AppConfig } from '../config';
import { debugLog } from '../debug';
import { safeJsonParse } from '../protocol/safeJson';
import { isLegacyGoalMessage } from '../protocol/legacyOverlayProtocol';
import { buildLegacyWsUrl } from '../protocol/legacyWsUrl';
import {
  cleanupFixtureAudioUnlockPrompt,
  replayRequestedLegacyFixture,
} from '../dev/replay/legacyReplay';

@observer
export class PageChannelFollowers extends React.Component<
  IPageChannelFollowersProps & RouteComponentProps<{ id: string }>,
  {}
> {
  connecting: boolean = true;
  connectionFailed: boolean = false;
  current: number | undefined = undefined;
  goal: number | undefined = undefined;

  private ws?: WebSocket;
  private timeout: number = 250;
  private failedConnectionAttempts = 0;
  private connectInterval?: ReturnType<typeof setTimeout>;

  private testTimeout?: any;

  constructor(
    props: IPageChannelFollowersProps & RouteComponentProps<{ id: string }>,
  ) {
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
    if (this.connectInterval) clearTimeout(this.connectInterval);

    if (this.ws) {
      this.ws.close();
      this.ws.onopen = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.onmessage = null;
      this.ws = undefined;
    }
  }

  private createConnection(accountKey: string) {
    const ws = new WebSocket(
      buildLegacyWsUrl(AppConfig.ws, accountKey, 'followers'),
    );

    ws.onopen = () => {
      debugLog('connected websocket followers component');

      this.failedConnectionAttempts = 0;
      this.setConnectionFailed(false);
      this.timeout = 250;

      if (this.connecting) this.setConnecting(false);

      if (this.connectInterval) clearTimeout(this.connectInterval);
    };
    ws.onerror = (error) => {
      debugLog('Legacy followers websocket error. Closing socket.', error);

      ws.close();
    };
    ws.onclose = (e) => {
      this.failedConnectionAttempts += 1;

      runInAction(() => {
        this.current = undefined;
        this.goal = undefined;
      });

      if (this.failedConnectionAttempts >= 5) {
        debugLog('Legacy followers websocket failed repeatedly. Showing unavailable overlay.', e.reason);
        this.ws = undefined;
        this.setConnecting(false);
        this.setConnectionFailed(true);
        return;
      }

      debugLog(
        `Socket is closed. Reconnect will be attempted in ${Math.min(10000 / 1000, (this.timeout + this.timeout) / 1000)} second.`,
        e.reason,
      );

      this.timeout = this.timeout + this.timeout;
      this.connectInterval = setTimeout(
        () => {
          if (!this.ws || this.ws.readyState === WebSocket.CLOSED)
            this.createConnection(accountKey);
        },
        Math.min(10000, this.timeout),
      );
    };
    ws.onmessage = ({ isTrusted, data }) => {
      if (!isTrusted || typeof data !== 'string') return;

      this.handleLegacyMessage(safeJsonParse(data));
    };

    this.ws = ws;
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
