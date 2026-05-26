import { describe, expect, it } from "vitest";

import { shouldShowAudioUnlockPrompt } from "./legacyReplay";

describe("shouldShowAudioUnlockPrompt", () => {
  it("returns true for fixture replay", () => {
    expect(shouldShowAudioUnlockPrompt("?fixture=main-donate-prepare")).toBe(true);
  });

  it("returns true for runtime test mode", () => {
    expect(shouldShowAudioUnlockPrompt("?test=true")).toBe(true);
  });

  it("returns true for runtime test mode with fixture replay", () => {
    expect(shouldShowAudioUnlockPrompt("?test=true&fixture=main-donate-prepare")).toBe(true);
  });

  it("returns false without fixture replay or runtime test mode", () => {
    expect(shouldShowAudioUnlockPrompt("")).toBe(false);
  });

  it("returns false for disabled runtime test mode", () => {
    expect(shouldShowAudioUnlockPrompt("?test=false")).toBe(false);
  });
});
