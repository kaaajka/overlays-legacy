import { useEffect, useRef, useState } from "react";
import type { RouterCompatProps } from "../routing/routerCompat";

import Goal from "./Goal";
import { OverlayUnavailable } from "./OverlayUnavailable";

import { AppConfig } from "../config";
import { debugLog } from "../debug";
import { safeJsonParse } from "../protocol/safeJson";
import { isLegacyGoalMessage } from "../protocol/legacyOverlayProtocol";
import { buildSubsOverlaySocketUrl } from "../socket/buildOverlaySocketUrl";
import { createLegacyOverlaySocket } from "../socket/createLegacyOverlaySocket";
import type { LegacyOverlaySocketController } from "../socket/createLegacyOverlaySocket";
import {
  cleanupFixtureAudioUnlockPrompt,
  replayRequestedLegacyFixture,
} from "../dev/replay/legacyReplay";

type PageChannelChildProps = RouterCompatProps & {
  testMode?: boolean;
};

export function PageChannelSubs(props: PageChannelChildProps) {
  const [connecting, setConnecting] = useState(true);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const [current, setCurrent] = useState<number | undefined>(undefined);
  const [goal, setGoal] = useState<number | undefined>(undefined);
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
        setConnecting((value) => (value === state ? value : state));
      }
    };

    const setConnectionFailedSafely = (state: boolean) => {
      if (isActive) {
        setConnectionFailed((value) => (value === state ? value : state));
      }
    };

    const setCurrentSafely = (value: number | undefined) => {
      if (isActive) {
        setCurrent(value);
      }
    };

    const setGoalSafely = (value: number | undefined) => {
      if (isActive) {
        setGoal(value);
      }
    };

    const closeConnection = () => {
      socketRef.current?.disconnect();
      socketRef.current = undefined;
    };

    const handleLegacyMessage = (payload: unknown) => {
      const json = payload;
      if (!isLegacyGoalMessage(json)) {
        debugLog("Ignored unknown legacy goal websocket payload", json);
        return;
      }

      switch (json.type) {
        case "set":
          setCurrentSafely(json.args.current);
          setGoalSafely(json.args.goal);
          break;
        case "update":
          if (typeof json.args.current !== "undefined")
            setCurrentSafely(json.args.current);
          if (typeof json.args.goal !== "undefined")
            setGoalSafely(json.args.goal);
          break;
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
      url: buildSubsOverlaySocketUrl(AppConfig.ws, accountKey, testMode),
      label: "subs",
      onOpen: () => {
        setConnectionFailedSafely(false);
        setConnectingSafely(false);
      },
      onClose: () => {
        setCurrentSafely(undefined);
        setGoalSafely(undefined);
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

  const canDraw =
    !connecting && typeof current !== "undefined" && typeof goal !== "undefined";

  return (
    <div className={"subGoal"}>
      {!!connecting && <h1>Łączenie...</h1>}
      {canDraw && <Goal current={current} goal={goal} type={"subs"} />}
    </div>
  );
}
