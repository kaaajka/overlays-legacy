import { useCallback, useEffect, useRef, useState } from "react";
import type { RouterCompatProps } from "../routing/routerCompat";

import type { EventModel } from "../models/Event";
import { RouletteEventModel } from "../models/RouletteEvent";
import type { NormalEventModel } from "../models/NormalEvent";
import type { DonateEventModel } from "../models/DonateEvent";
import { CoinflipEventModel } from "../models/CoinflipEvent";

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
import { createMainOverlayEventModelFromAction } from "../protocol/createMainOverlayEventModelFromAction";
import { resolveMainOverlayEventUpdate } from "../protocol/resolveMainOverlayEventUpdate";
import { buildMainOverlaySocketUrl } from "../socket/buildOverlaySocketUrl";
import { createLegacyOverlaySocket } from "../socket/createLegacyOverlaySocket";
import type { LegacyOverlaySocketController } from "../socket/createLegacyOverlaySocket";
import { playOverlayAudio } from "../audio/playOverlayAudio";
import {
  cleanupFixtureAudioUnlockPrompt,
  isRequestedLegacyFixtureReplayActive,
  requestTestOverlayAudioUnlockPrompt,
  replayRequestedLegacyFixture,
} from "../dev/replay/legacyReplay";
import { createDonateEventModelFromArgs } from "../donations/createDonateEventModelFromArgs";
import {
  type DonationQueueState,
  type DonationQueueTransition,
  resolveDonationQueueFinished,
  resolveDonationQueuePush,
  resolveDonationQueueScheduledChange,
  resolveDonationQueueSubmitFirstAlert,
} from "../donations/resolveDonationQueueTransition";
import { resolvePrepareSoundUrl } from "../protocol/resolvePrepareSoundUrl";

const images: Record<string, string> = {
  mute: muteImage,
  censure: censureImage,
  withoutR: withoutRImage,
  dogs: dogsImage,
  roulette: rouletteImage,
  coinflip: coinflipImage,
};

type PageChannelProps = RouterCompatProps & {
  mode?: MainOverlayMode;
  testMode?: boolean;
};

export function PageChannel(props: PageChannelProps) {
  const [connecting, setConnectingState] = useState(true);
  const [connectionFailed, setConnectionFailedState] = useState(false);
  const [currentEvent, setCurrentEventState] = useState<EventModel | undefined>();
  const [currentDonate, setCurrentDonateState] = useState<DonateEventModel | undefined>();

  const socketRef = useRef<LegacyOverlaySocketController>();
  const currentPlayingRef = useRef<HTMLAudioElement>();
  const donateListRef = useRef<DonateEventModel[]>([]);
  const currentEventRef = useRef<EventModel | undefined>();
  const currentDonateRef = useRef<DonateEventModel | undefined>();
  const donateAlertQueueRef = useRef<string[]>([]);
  const currentDonateAlertRef = useRef<string | undefined>();
  const changeDonateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isMountedRef = useRef(false);
  const modeRef = useRef<MainOverlayMode>("all");
  const testModeRef = useRef(false);

  const {
    match: {
      params: { id: accountKey },
    },
    mode,
    testMode,
  } = props;

  modeRef.current = mode ?? "all";
  testModeRef.current = testMode === true;

  const setConnecting = useCallback((state: boolean) => {
    if (!isMountedRef.current) return;
    setConnectingState((current) => (current !== state ? state : current));
  }, []);

  const setConnectionFailed = useCallback((state: boolean) => {
    if (!isMountedRef.current) return;
    setConnectionFailedState((current) => (current !== state ? state : current));
  }, []);

  const setCurrentEvent = useCallback((event?: EventModel) => {
    currentEventRef.current = event;
    if (!isMountedRef.current) return;
    setCurrentEventState(event);
  }, []);

  const setCurrentDonate = useCallback((donate?: DonateEventModel) => {
    currentDonateRef.current = donate;
    if (!isMountedRef.current) return;
    setCurrentDonateState(donate);
  }, []);

  const setCurrentPlaying = useCallback((url?: string) => {
    if (typeof url !== "undefined") {
      if (currentPlayingRef.current) {
        currentPlayingRef.current.pause();
        currentPlayingRef.current = undefined;
      }

      currentPlayingRef.current =
        playOverlayAudio({
          url,
          volume: 0.3,
          label: "Legacy overlay event sound",
          mutedFixtureAudioKind: "template",
        }) ?? undefined;

      return;
    }

    if (currentPlayingRef.current) {
      currentPlayingRef.current.pause();
      currentPlayingRef.current = undefined;
    }
  }, []);

  const getDonationQueueState = useCallback((): DonationQueueState<DonateEventModel> => {
    return {
      donateList: donateListRef.current,
      currentDonate: currentDonateRef.current,
      donateAlertQueue: donateAlertQueueRef.current,
      currentDonateAlert: currentDonateAlertRef.current,
    };
  }, []);

  const applyDonationQueueState = useCallback(
    (state: DonationQueueState<DonateEventModel>) => {
      donateListRef.current = [...state.donateList];
      setCurrentDonate(state.currentDonate);
      donateAlertQueueRef.current = [...state.donateAlertQueue];
      currentDonateAlertRef.current = state.currentDonateAlert;
    },
    [setCurrentDonate],
  );

  const acceptDonationAlert = useCallback(
    (id: DonationQueueTransition<DonateEventModel>["acceptAlertId"]) => {
      if (!id) return;

      socketRef.current?.send(
        JSON.stringify({
          type: "acceptAlert",
          args: {
            id,
          },
        }),
      );
    },
    [],
  );

  const submitFirstAlert = useCallback(() => {
    const transition = resolveDonationQueueSubmitFirstAlert(getDonationQueueState());

    currentDonateAlertRef.current = transition.state.currentDonateAlert;
    acceptDonationAlert(transition.acceptAlertId);
  }, [acceptDonationAlert, getDonationQueueState]);

  const scheduleDonationChange = useCallback(
    (submitFirstAlertAfterDelay: boolean) => {
      if (changeDonateTimeoutRef.current) clearTimeout(changeDonateTimeoutRef.current);

      changeDonateTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        const transition = resolveDonationQueueScheduledChange(
          getDonationQueueState(),
          { submitFirstAlert: submitFirstAlertAfterDelay },
        );

        applyDonationQueueState(transition.state);
        acceptDonationAlert(transition.acceptAlertId);
      }, 50);
    },
    [acceptDonationAlert, applyDonationQueueState, getDonationQueueState],
  );

  const donateFinished = useCallback(() => {
    const transition = resolveDonationQueueFinished(getDonationQueueState());
    applyDonationQueueState(transition.state);

    if (transition.shouldScheduleDonationChange) scheduleDonationChange(true);
  }, [applyDonationQueueState, getDonationQueueState, scheduleDonationChange]);

  const pushDonate = useCallback(
    (donate: DonateEventModel) => {
      const transition = resolveDonationQueuePush(getDonationQueueState(), donate);
      applyDonationQueueState(transition.state);

      if (transition.shouldScheduleDonationChange) scheduleDonationChange(false);
    },
    [applyDonationQueueState, getDonationQueueState, scheduleDonationChange],
  );

  const handleLegacyMessage = useCallback(
    (payload: unknown) => {
      const action = resolveMainOverlayEventAction(payload, {
        mode: modeRef.current,
        testMode: testModeRef.current,
      });

      if (action.type === "ignore" && action.reason === "unknown_payload") {
        debugLog("Ignored unknown legacy main websocket payload", payload);
        return;
      }

      if (action.type === "ignore" && action.reason === "inactive_event_name") {
        debugLog("Ignored legacy main websocket payload outside active test mode", {
          testMode: testModeRef.current,
          event: action.message.event,
          key: action.message.key,
        });
        return;
      }

      if (action.type === "ignore" && action.reason === "inactive_overlay_mode") {
        debugLog("Ignored legacy main websocket payload outside active overlay mode", {
          mode: modeRef.current,
          event: action.message.event,
          key: action.message.key,
          origin: action.message.origin,
        });
        return;
      }

      if (action.type === "ignore" && action.reason === "missing_prepare_started_args") {
        debugLog("Ignored malformed legacy prepare/started payload", action.message);
        return;
      }

      if (action.type === "ignore" && action.reason === "malformed_roulette_started_args") {
        debugLog("Ignored malformed legacy roulette started payload", action.message);
        return;
      }

      if (action.type === "ignore" && action.reason === "malformed_coinflip_started_args") {
        debugLog("Ignored malformed legacy coinflip started payload", action.message);
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

        if (donate) pushDonate(donate);
      } else if (action.type === "alert_list") {
        const { args } = action;
        const transition = resolveMainOverlayAlertListTransition(
          donateAlertQueueRef.current,
          json.key,
          args,
        );

        donateAlertQueueRef.current = transition.queue;

        if (transition.shouldSubmitFirstAlert) {
          submitFirstAlert();
        }
      } else if (action.type === "prepare_started") {
        const { args } = action;
        const isPrepareState = action.state === "prepare";

        if (isPrepareState) {
          setCurrentPlaying(resolvePrepareSoundUrl(json.key));
        }

        const event = createMainOverlayEventModelFromAction({
          id: json.id,
          key: json.key,
          state: action.state,
          args,
        });

        if (event) setCurrentEvent(event);
      } else if (action.type === "update") {
        const { args } = action;
        if (currentEventRef.current && currentEventRef.current.id === json.id) {
          const nextEvent = resolveMainOverlayEventUpdate(currentEventRef.current, args);

          setCurrentEvent(nextEvent);
        }
      } else if (action.type === "finished") {
        if (currentEventRef.current && currentEventRef.current.id === json.id)
          setCurrentEvent(undefined);
      }
    },
    [pushDonate, setCurrentEvent, setCurrentPlaying, submitFirstAlert],
  );

  const closeConnection = useCallback(() => {
    if (changeDonateTimeoutRef.current) clearTimeout(changeDonateTimeoutRef.current);

    setCurrentEvent(undefined);
    setCurrentPlaying(undefined);

    socketRef.current?.disconnect();
    socketRef.current = undefined;
  }, [setCurrentEvent, setCurrentPlaying]);

  const createConnection = useCallback(
    (nextAccountKey: string) => {
      if (isRequestedLegacyFixtureReplayActive()) {
        debugLog("Skipped legacy main websocket connection during fixture replay");
        return;
      }

      const socket = createLegacyOverlaySocket({
        url: buildMainOverlaySocketUrl(AppConfig.ws, nextAccountKey, testModeRef.current),
        label: "main",
        onOpen: () => {
          setConnectionFailed(false);
          setConnecting(false);
        },
        onClose: () => {
          setCurrentEvent(undefined);
        },
        onMessage: (data) => {
          handleLegacyMessage(safeJsonParse(data));
        },
        onFailure: () => {
          setConnecting(false);
          setConnectionFailed(true);
        },
      });

      socketRef.current = socket;
      socket.connect();
    },
    [handleLegacyMessage, setConnecting, setConnectionFailed, setCurrentEvent],
  );

  useEffect(() => {
    isMountedRef.current = true;
    closeConnection();

    const didReplayFixture = replayRequestedLegacyFixture((payload) =>
      handleLegacyMessage(payload),
    );
    if (didReplayFixture) {
      setConnecting(false);
      return () => {
        cleanupFixtureAudioUnlockPrompt();
        isMountedRef.current = false;
        closeConnection();
      };
    }

    requestTestOverlayAudioUnlockPrompt();
    createConnection(accountKey);

    return () => {
      cleanupFixtureAudioUnlockPrompt();
      isMountedRef.current = false;
      closeConnection();
    };
  }, [accountKey, closeConnection, createConnection, handleLegacyMessage, setConnecting]);

  if (connectionFailed) return <OverlayUnavailable />;

  return (
    <div>
      {connecting && <h1>Łączenie...</h1>}
      {!connecting && !!currentDonate && (
        <DonateEvent donate={currentDonate} onFinished={donateFinished} />
      )}

      {!connecting &&
        !!currentEvent &&
        (currentEvent instanceof RouletteEventModel ? (
          <RouletteEvent images={images} event={currentEvent} />
        ) : currentEvent instanceof CoinflipEventModel ? (
          <CoinflipEvent images={images} event={currentEvent} />
        ) : (
          <NormalEvent images={images} event={currentEvent as NormalEventModel} />
        ))}
    </div>
  );
}
