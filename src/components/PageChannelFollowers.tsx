import { observer } from 'mobx-react';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { action, makeObservable, observable, runInAction } from 'mobx';

import Goal from './Goal';

import { AppConfig } from '../config';
import { debugLog } from '../debug';
import { safeJsonParse } from '../protocol/safeJson';
import { isLegacyGoalMessage } from '../protocol/legacyOverlayProtocol';

@observer
export class PageChannelFollowers extends React.Component<
  IPageChannelFollowersProps & RouteComponentProps<{ id: string }>,
  {}
> {
  connecting: boolean = true;
  current: number | undefined = undefined;
  goal: number | undefined = undefined;

  private ws?: WebSocket;
  private timeout: number = 250;
  private connectInterval?: ReturnType<typeof setTimeout>;

  private testTimeout?: any;

  constructor(
    props: IPageChannelFollowersProps & RouteComponentProps<{ id: string }>,
  ) {
    super(props);

    makeObservable(this, {
      connecting: observable,
      current: observable,
      goal: observable,

      setConnecting: action,
    });
  }

  componentDidMount() {
    this.closeConnection();
    this.createConnection(this.accountKey);
  }

  componentWillUnmount() {
    this.closeConnection();

    if (this.testTimeout) clearInterval(this.testTimeout);
  }

  render() {
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
    const ws = new WebSocket(AppConfig.ws + `/followers?account=${accountKey}`);

    ws.onopen = () => {
      debugLog('connected websocket main component');

      this.timeout = 250;

      if (this.connecting) this.setConnecting(false);

      if (this.connectInterval) clearTimeout(this.connectInterval);
    };
    ws.onerror = () => {
      console.error('Socket encountered error: ', 'Closing socket');

      ws.close();
    };
    ws.onclose = (e) => {
      debugLog(
        `Socket is closed. Reconnect will be attempted in ${Math.min(10000 / 1000, (this.timeout + this.timeout) / 1000)} second.`,
        e.reason,
      );

      runInAction(() => {
        this.current = undefined;
        this.goal = undefined;
      });

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

      const json = safeJsonParse(data);
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
    };

    this.ws = ws;
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
