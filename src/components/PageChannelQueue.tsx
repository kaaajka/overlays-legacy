import { observer } from "mobx-react";
import React from "react";
import { action, makeObservable, observable, runInAction } from "mobx";
import type { RouterCompatProps } from "../routing/routerCompat";

import { OverlayUnavailable } from "./OverlayUnavailable";

import { AppConfig } from "../config";
import { QueueEventModel } from "../models/QueueEvent";
import { debugLog } from "../debug";
import { safeJsonParse } from "../protocol/safeJson";
import { isLegacyQueueMessage } from "../protocol/legacyOverlayProtocol";
import { buildQueueOverlaySocketUrl } from "../socket/buildOverlaySocketUrl";
import { createLegacyOverlaySocket } from "../socket/createLegacyOverlaySocket";
import type { LegacyOverlaySocketController } from "../socket/createLegacyOverlaySocket";
import {
  cleanupFixtureAudioUnlockPrompt,
  replayRequestedLegacyFixture,
} from "../dev/replay/legacyReplay";

type PageChannelChildProps = RouterCompatProps & {
  testMode?: boolean;
};

@observer
export class PageChannelQueue extends React.Component<PageChannelChildProps> {
  connecting: boolean = true;
  connectionFailed: boolean = false;
  queue: QueueEventModel[] = [];

  private socket?: LegacyOverlaySocketController;

  constructor(props: RouterCompatProps) {
    super(props);

    makeObservable(this, {
      connecting: observable,
      connectionFailed: observable,
      queue: observable,

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
  }

  render() {
    if (this.connectionFailed) return <OverlayUnavailable />;

    const canDraw = !this.connecting && this.queue.length > 1;

    const queueItems = this.queue.slice(1).map((item) => (
      <li key={item.id} className={"queueItem"}>
        {item.username} - {item.name}
      </li>
    ));

    return (
      <div className={"queue"}>
        {!!this.connecting && <h1>Łączenie...</h1>}
        {canDraw && (
          <>
            <h1 className={"queueString"}>Kolejka:</h1>
            <ol className={"queueList"}>{queueItems}</ol>
          </>
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
      url: buildQueueOverlaySocketUrl(AppConfig.ws, accountKey, this.testMode),
      label: "queue",
      onOpen: () => {
        this.setConnectionFailed(false);
        if (this.connecting) this.setConnecting(false);
      },
      onClose: () => {
        runInAction(() => {
          this.queue = [];
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
    if (!isLegacyQueueMessage(json)) {
      debugLog("Ignored unknown legacy queue websocket payload", json);
      return;
    }

    runInAction(() => {
      if (json.key === "set") {
        this.queue = json.args.list.map((el) => new QueueEventModel(el));
      } else if (json.key === "add") {
        const existingEvent = this.queue.find((e) => e.id === json.args.id);
        if (!existingEvent) this.queue.push(new QueueEventModel(json.args));
      } else if (json.key === "delete") {
        const index = this.queue.findIndex((e) => e.id === json.args.id);
        if (index > -1) this.queue.splice(index, 1);
      }
    });
  }

  get testMode(): boolean {
    return this.props.testMode === true;
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
