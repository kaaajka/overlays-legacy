import type { LegacyOverlayEventOrigin } from "./legacyMainOverlayProtocol";

export type MainOverlayMode = "all" | "tip" | "reward";

export const REWARD_LIKE_EVENT_KEYS = new Set([
  "censure",
  "mute",
  "withoutR",
  "dogs",
  "roulette",
  "coinflip",
]);

const NORMAL_MAIN_EVENTS = new Set([
  "prepare",
  "started",
  "update",
  "finished",
  "alertList",
]);
const TEST_MAIN_EVENTS = new Set([
  "test",
  "t_prepare",
  "t_started",
  "t_update",
  "t_finished",
]);

export function shouldHandleMainOverlayEventName(
  event: string,
  testMode: boolean,
): boolean {
  return testMode ? TEST_MAIN_EVENTS.has(event) : NORMAL_MAIN_EVENTS.has(event);
}

export function shouldHandleMainOverlayEvent(
  mode: MainOverlayMode,
  key: string,
  origin?: LegacyOverlayEventOrigin,
): boolean {
  if (mode === "all") return true;
  if (mode === "tip") return key === "donate";
  if (mode === "reward") {
    if (origin === "reward") return true;
    if (origin === "manual") return false;

    return REWARD_LIKE_EVENT_KEYS.has(key);
  }

  return false;
}
