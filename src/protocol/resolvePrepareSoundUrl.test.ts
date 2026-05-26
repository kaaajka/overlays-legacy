import { describe, expect, it } from "vitest";

import { resolvePrepareSoundUrl } from "./resolvePrepareSoundUrl";

describe("resolvePrepareSoundUrl", () => {
  it("returns undefined when there is no sound", () => {
    expect(
      resolvePrepareSoundUrl("silent", {
        soundsByKey: { silent: null },
      }),
    ).toBeUndefined();
  });

  it("returns a single sound", () => {
    expect(
      resolvePrepareSoundUrl("single", {
        soundsByKey: { single: "/sound.mp3" },
      }),
    ).toBe("/sound.mp3");
  });

  it("selects one item from a sound list", () => {
    expect(
      resolvePrepareSoundUrl("list", {
        random: () => 0.75,
        soundsByKey: { list: ["one.mp3", "two.mp3", "three.mp3"] },
      }),
    ).toBe("three.mp3");
  });

  it("returns undefined for an empty array", () => {
    expect(
      resolvePrepareSoundUrl("empty", {
        random: () => 0,
        soundsByKey: { empty: [] },
      }),
    ).toBeUndefined();
  });

  it("returns undefined for malformed sound input", () => {
    expect(
      resolvePrepareSoundUrl("bad", {
        soundsByKey: { bad: 123 },
      }),
    ).toBeUndefined();
  });

  it("uses current key-specific and fallback prepare sound lists", () => {
    expect(resolvePrepareSoundUrl("dogs", { random: () => 0 })).toContain(
      "assets/sounds/rewards/random/random-03.mp3",
    );
    expect(resolvePrepareSoundUrl("coinflip", { random: () => 0 })).toContain(
      "assets/sounds/rewards/coinflip/coinflip-prepare-01.mp3",
    );
    expect(resolvePrepareSoundUrl("roulette", { random: () => 0 })).toContain(
      "assets/sounds/rewards/random/random-01.mp3",
    );
  });
});
