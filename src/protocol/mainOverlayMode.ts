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
