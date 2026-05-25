import {
  getLegacyMainArgsRecord,
  isLegacyCoinflipStartedArgs,
  isLegacyMainMessage,
  isLegacyRouletteStartedArgs,
  isLegacyUpdateArgs,
  type LegacyMainMessage,
  type LegacyUpdateArgs,
} from "./legacyMainOverlayProtocol";
import {
  type MainOverlayMode,
  shouldHandleMainOverlayEvent,
  shouldHandleMainOverlayEventName,
} from "./mainOverlayMode";

type MainOverlayEventActionBase = {
  message: LegacyMainMessage;
};

export type MainOverlayEventIgnoreReason =
  | "unknown_payload"
  | "inactive_event_name"
  | "inactive_overlay_mode"
  | "missing_prepare_started_args"
  | "malformed_roulette_started_args"
  | "malformed_coinflip_started_args"
  | "malformed_update_args"
  | "unsupported_event";

export type MainOverlayEventAction =
  | {
      type: "ignore";
      reason: "unknown_payload";
    }
  | (MainOverlayEventActionBase & {
      type: "ignore";
      reason: Exclude<MainOverlayEventIgnoreReason, "unknown_payload">;
    })
  | (MainOverlayEventActionBase & {
      type: "play_sound";
      args: Record<string, unknown> | undefined;
    })
  | (MainOverlayEventActionBase & {
      type: "donate_prepare";
      args: Record<string, unknown>;
    })
  | (MainOverlayEventActionBase & {
      type: "alert_list";
      args: Record<string, unknown>;
    })
  | (MainOverlayEventActionBase & {
      type: "prepare_started";
      args: Record<string, unknown>;
      state: "prepare" | "started";
    })
  | (MainOverlayEventActionBase & {
      type: "update";
      args: LegacyUpdateArgs;
    })
  | (MainOverlayEventActionBase & {
      type: "finished";
    });

export type ResolveMainOverlayEventActionOptions = {
  mode: MainOverlayMode;
  testMode: boolean;
};

const NORMAL_DONATE_PREPARE_EVENTS = new Set(["prepare"]);
const TEST_DONATE_PREPARE_EVENTS = new Set(["test", "t_prepare"]);
const NORMAL_PREPARE_STARTED_EVENTS = new Set(["prepare", "started"]);
const TEST_PREPARE_STARTED_EVENTS = new Set(["t_prepare", "t_started"]);

function isDonatePrepareEvent(event: string, testMode: boolean): boolean {
  return testMode
    ? TEST_DONATE_PREPARE_EVENTS.has(event)
    : NORMAL_DONATE_PREPARE_EVENTS.has(event);
}

function isPrepareStartedEvent(event: string, testMode: boolean): boolean {
  return testMode
    ? TEST_PREPARE_STARTED_EVENTS.has(event)
    : NORMAL_PREPARE_STARTED_EVENTS.has(event);
}

function isUpdateEvent(event: string, testMode: boolean): boolean {
  return testMode ? event === "t_update" : event === "update";
}

function isFinishedEvent(event: string, testMode: boolean): boolean {
  return testMode ? event === "t_finished" : event === "finished";
}

function ignore(
  message: LegacyMainMessage,
  reason: Exclude<MainOverlayEventIgnoreReason, "unknown_payload">,
): MainOverlayEventAction {
  return { type: "ignore", reason, message };
}

export function resolveMainOverlayEventAction(
  payload: unknown,
  { mode, testMode }: ResolveMainOverlayEventActionOptions,
): MainOverlayEventAction {
  if (!isLegacyMainMessage(payload)) {
    return { type: "ignore", reason: "unknown_payload" };
  }

  if (!shouldHandleMainOverlayEventName(payload.event, testMode)) {
    return ignore(payload, "inactive_event_name");
  }

  const args = getLegacyMainArgsRecord(payload);

  if (!shouldHandleMainOverlayEvent(mode, payload.key, payload.origin)) {
    return ignore(payload, "inactive_overlay_mode");
  }

  if (payload.event === "prepare" && payload.key === "playSound") {
    return { type: "play_sound", message: payload, args };
  }

  if (
    isDonatePrepareEvent(payload.event, testMode) &&
    payload.key === "donate"
  ) {
    return args
      ? { type: "donate_prepare", message: payload, args }
      : ignore(payload, "unsupported_event");
  }

  if (payload.event === "alertList") {
    return args
      ? { type: "alert_list", message: payload, args }
      : ignore(payload, "unsupported_event");
  }

  if (isPrepareStartedEvent(payload.event, testMode)) {
    if (!args) return ignore(payload, "missing_prepare_started_args");

    const isPrepareState =
      payload.event === "prepare" || payload.event === "t_prepare";

    if (
      !isPrepareState &&
      payload.key === "roulette" &&
      !isLegacyRouletteStartedArgs(args)
    ) {
      return ignore(payload, "malformed_roulette_started_args");
    }

    if (
      !isPrepareState &&
      payload.key === "coinflip" &&
      !isLegacyCoinflipStartedArgs(args)
    ) {
      return ignore(payload, "malformed_coinflip_started_args");
    }

    return {
      type: "prepare_started",
      message: payload,
      args,
      state: isPrepareState ? "prepare" : "started",
    };
  }

  if (isUpdateEvent(payload.event, testMode)) {
    return isLegacyUpdateArgs(args)
      ? { type: "update", message: payload, args }
      : ignore(payload, "malformed_update_args");
  }

  if (isFinishedEvent(payload.event, testMode)) {
    return { type: "finished", message: payload };
  }

  return ignore(payload, "unsupported_event");
}
