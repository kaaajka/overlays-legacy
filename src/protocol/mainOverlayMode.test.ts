import { describe, expect, it } from "vitest";
import { REWARD_LIKE_EVENT_KEYS, shouldHandleMainOverlayEvent } from "./mainOverlayMode";

describe("main overlay mode filtering", () => {
  it("accepts every legacy main event key in all mode", () => {
    for (const key of ["donate", "roulette", "coinflip", "censure", "unknown-key"]) {
      expect(shouldHandleMainOverlayEvent("all", key)).toBe(true);
    }
  });

  it("accepts only donate events in tip mode", () => {
    expect(shouldHandleMainOverlayEvent("tip", "donate")).toBe(true);

    for (const key of ["roulette", "coinflip", "censure", "unknown-key"]) {
      expect(shouldHandleMainOverlayEvent("tip", key)).toBe(false);
    }
  });

  it("accepts reward-like legacy event keys in reward mode", () => {
    for (const key of ["censure", "mute", "withoutR", "dogs", "roulette", "coinflip"]) {
      expect(REWARD_LIKE_EVENT_KEYS.has(key)).toBe(true);
      expect(shouldHandleMainOverlayEvent("reward", key)).toBe(true);
    }
  });

  it("rejects donate and unknown keys in reward mode", () => {
    for (const key of ["donate", "unknown-key"]) {
      expect(shouldHandleMainOverlayEvent("reward", key)).toBe(false);
    }
  });
});
