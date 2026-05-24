import { describe, expect, it } from "vitest";
import { REWARD_LIKE_EVENT_KEYS, shouldHandleMainOverlayEvent } from "./mainOverlayMode";

describe("main overlay mode filtering", () => {
  it("accepts every legacy main event key in all mode", () => {
    for (const key of ["donate", "roulette", "coinflip", "censure", "unknown-key"]) {
      expect(shouldHandleMainOverlayEvent("all", key)).toBe(true);
    }
  });

  it("keeps all mode independent from optional origin metadata", () => {
    expect(shouldHandleMainOverlayEvent("all", "donate", "manual")).toBe(true);
    expect(shouldHandleMainOverlayEvent("all", "unknown-key", "reward")).toBe(true);
  });

  it("accepts only donate events in tip mode", () => {
    expect(shouldHandleMainOverlayEvent("tip", "donate")).toBe(true);

    for (const key of ["roulette", "coinflip", "censure", "unknown-key"]) {
      expect(shouldHandleMainOverlayEvent("tip", key)).toBe(false);
    }
  });

  it("keeps tip mode key-based even when optional origin metadata is present", () => {
    expect(shouldHandleMainOverlayEvent("tip", "donate", "manual")).toBe(true);
    expect(shouldHandleMainOverlayEvent("tip", "roulette", "reward")).toBe(false);
  });

  it("accepts reward-like legacy event keys in reward mode when origin is missing", () => {
    for (const key of ["censure", "mute", "withoutR", "dogs", "roulette", "coinflip"]) {
      expect(REWARD_LIKE_EVENT_KEYS.has(key)).toBe(true);
      expect(shouldHandleMainOverlayEvent("reward", key)).toBe(true);
    }
  });

  it("rejects donate and unknown keys in reward mode when origin is missing", () => {
    for (const key of ["donate", "unknown-key"]) {
      expect(shouldHandleMainOverlayEvent("reward", key)).toBe(false);
    }
  });

  it("prefers reward origin in reward mode when origin metadata is present", () => {
    expect(shouldHandleMainOverlayEvent("reward", "donate", "reward")).toBe(true);
    expect(shouldHandleMainOverlayEvent("reward", "unknown-key", "reward")).toBe(true);
    expect(shouldHandleMainOverlayEvent("reward", "roulette", "reward")).toBe(true);
  });

  it("rejects manual origin in reward mode when origin metadata is present", () => {
    expect(shouldHandleMainOverlayEvent("reward", "donate", "manual")).toBe(false);
    expect(shouldHandleMainOverlayEvent("reward", "roulette", "manual")).toBe(false);
    expect(shouldHandleMainOverlayEvent("reward", "unknown-key", "manual")).toBe(false);
  });
});
