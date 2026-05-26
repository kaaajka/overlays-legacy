import { describe, expect, it } from "vitest";

import {
  resolveDonateTtsAudioUrl,
  TEST_DONATE_TTS_AUDIO_URL,
} from "./resolveDonateTtsAudioUrl";

describe("resolveDonateTtsAudioUrl", () => {
  it("returns local TTS audio for test donations", () => {
    expect(
      resolveDonateTtsAudioUrl("/ttscache/abc.mp3", {
        isTestDonate: true,
      }),
    ).toBe(TEST_DONATE_TTS_AUDIO_URL);
  });

  it("returns original URL for normal donations", () => {
    expect(
      resolveDonateTtsAudioUrl("https://cdn.example.com/tts.mp3", {
        isTestDonate: false,
      }),
    ).toBe("https://cdn.example.com/tts.mp3");
  });

  it("keeps null and undefined for normal donations", () => {
    expect(resolveDonateTtsAudioUrl(null, { isTestDonate: false })).toBeNull();
    expect(resolveDonateTtsAudioUrl(undefined, { isTestDonate: false })).toBeUndefined();
  });

  it("ignores original legacy Tipply URL for test donations", () => {
    expect(
      resolveDonateTtsAudioUrl("https://tipply.pl/ttscache/abc.mp3", {
        isTestDonate: true,
      }),
    ).toBe(TEST_DONATE_TTS_AUDIO_URL);
  });

  it("ignores original Tipply S3 URL for test donations", () => {
    expect(
      resolveDonateTtsAudioUrl(
        "https://tipply-prod-data.s3.waw.io.cloud.ovh.net/tips/tts/abc.mp3",
        { isTestDonate: true },
      ),
    ).toBe(TEST_DONATE_TTS_AUDIO_URL);
  });
});
