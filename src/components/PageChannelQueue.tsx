import { observer } from 'mobx-react';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { action, makeObservable, observable, runInAction } from 'mobx';

import { AppConfig } from '../config';
import { QueueEventModel } from '../models/QueueEvent';
import { debugLog } from '../debug';
import { safeJsonParse } from '../protocol/safeJson';
import { isLegacyQueueMessage } from '../protocol/legacyOverlayProtocol';

@observer
export class PageChannelQueue extends React.Component<
  IPageChannelQueueProps & RouteComponentProps<{ id: string }>,
  {}
> {
  connecting: boolean = true;
  queue: QueueEventModel[] = [];

  private ws?: WebSocket;
  private timeout: number = 250;
  private connectInterval?: ReturnType<typeof setTimeout>;

  constructor(
    props: IPageChannelQueueProps & RouteComponentProps<{ id: string }>,
  ) {
    super(props);

    makeObservable(this, {
      connecting: observable,
      queue: observable,

      setConnecting: action,
    });
  }

  componentDidMount() {
    this.closeConnection();
    this.createConnection(this.accountKey);
  }

  componentWillUnmount() {
    this.closeConnection();
  }

  render() {
    const canDraw = !this.connecting && this.queue.length > 1;

    const queueItems = this.queue.slice(1).map((item) => (
      <li className={'queueItem'}>
        {item.username} - {item.name}
      </li>
    ));

    return (
      <div className={'queue'}>
        {!!this.connecting && <h1>Łączenie...</h1>}
        {canDraw && (
          <>
            <h1 className={'queueString'}>Kolejka:</h1>
            <ol className={'queueList'}>{queueItems}</ol>
          </>
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
    const ws = new WebSocket(AppConfig.ws + `/queue?account=${accountKey}`);

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
        this.queue = [];
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
      if (!isLegacyQueueMessage(json)) {
        debugLog('Ignored unknown legacy queue websocket payload', json);
        return;
      }

      runInAction(() => {
        if (json.key === 'set') {
          this.queue = json.args.list.map((el) => new QueueEventModel(el));
        } else if (json.key === 'add') {
          const existingEvent = this.queue.find((e) => e.id === json.args.id);
          if (!existingEvent) this.queue.push(new QueueEventModel(json.args));
        } else if (json.key === 'delete') {
          const index = this.queue.findIndex((e) => e.id === json.args.id);
          if (index > -1) this.queue.splice(index, 1);
        }
      });
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

interface IPageChannelQueueProps {}
