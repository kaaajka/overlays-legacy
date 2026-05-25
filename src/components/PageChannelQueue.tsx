import { useEffect, useRef, useState } from "react";
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

export function PageChannelQueue(props: PageChannelChildProps) {
  const [connecting, setConnecting] = useState(true);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [queue, setQueue] = useState<QueueEventModel[]>([]);
  const socketRef = useRef<LegacyOverlaySocketController>();

  const testMode = props.testMode === true;
  const {
    match: {
      params: { id: accountKey },
    },
  } = props;

  useEffect(() => {
    let isActive = true;

    const setConnectingSafely = (state: boolean) => {
      if (isActive) {
        setConnecting((current) => (current === state ? current : state));
      }
    };

    const setConnectionFailedSafely = (state: boolean) => {
      if (isActive) {
        setConnectionFailed((current) => (current === state ? current : state));
      }
    };

    const setQueueSafely = (
      updater:
        | QueueEventModel[]
        | ((current: QueueEventModel[]) => QueueEventModel[]),
    ) => {
      if (isActive) {
        setQueue(updater);
      }
    };

    const closeConnection = () => {
      socketRef.current?.disconnect();
      socketRef.current = undefined;
    };

    const handleLegacyMessage = (payload: unknown) => {
      const json = payload;
      if (!isLegacyQueueMessage(json)) {
        debugLog("Ignored unknown legacy queue websocket payload", json);
        return;
      }

      if (json.key === "set") {
        setQueueSafely(json.args.list.map((el) => new QueueEventModel(el)));
      } else if (json.key === "add") {
        setQueueSafely((current) => {
          const existingEvent = current.find((e) => e.id === json.args.id);
          if (existingEvent) return current;

          return [...current, new QueueEventModel(json.args)];
        });
      } else if (json.key === "delete") {
        setQueueSafely((current) => {
          const index = current.findIndex((e) => e.id === json.args.id);
          if (index === -1) return current;

          return current.filter((_event, eventIndex) => eventIndex !== index);
        });
      }
    };

    const didReplayFixture = replayRequestedLegacyFixture((payload) =>
      handleLegacyMessage(payload),
    );
    if (didReplayFixture) {
      setConnectingSafely(false);
      return () => {
        isActive = false;
        cleanupFixtureAudioUnlockPrompt();
        closeConnection();
      };
    }

    socketRef.current = createLegacyOverlaySocket({
      url: buildQueueOverlaySocketUrl(AppConfig.ws, accountKey, testMode),
      label: "queue",
      onOpen: () => {
        setConnectionFailedSafely(false);
        setConnectingSafely(false);
      },
      onClose: () => {
        setQueueSafely([]);
      },
      onMessage: (data) => {
        handleLegacyMessage(safeJsonParse(data));
      },
      onFailure: () => {
        setConnectingSafely(false);
        setConnectionFailedSafely(true);
      },
    });

    socketRef.current.connect();

    return () => {
      isActive = false;
      cleanupFixtureAudioUnlockPrompt();
      closeConnection();
    };
  }, [accountKey, testMode]);

  if (connectionFailed) return <OverlayUnavailable />;

  const canDraw = !connecting && queue.length > 1;

  const queueItems = queue.slice(1).map((item) => (
    <li key={item.id} className={"queueItem"}>
      {item.username} - {item.name}
    </li>
  ));

  return (
    <div className={"queue"}>
      {!!connecting && <h1>Łączenie...</h1>}
      {canDraw && (
        <>
          <h1 className={"queueString"}>Kolejka:</h1>
          <ol className={"queueList"}>{queueItems}</ol>
        </>
      )}
    </div>
  );
}
