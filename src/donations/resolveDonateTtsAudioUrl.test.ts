import { describe, expect, it } from "vitest";

import {
  resolveDonateTtsAudioUrl,
  TEST_DONATE_TTS_AUDIO_URL,
} from "./resolveDonateTtsAudioUrl";

describe("resolveDonateTtsAudioUrl", () => {
  it("returns local TTS audio for test donation message TTS", () => {
    expect(
      resolveDonateTtsAudioUrl("/ttscache/abc.mp3", {
        isTestDonate: true,
        kind: "tts-message",
      }),
    ).toBe(TEST_DONATE_TTS_AUDIO_URL);
  });

  it("returns null for test donation nickname TTS", () => {
    expect(
      resolveDonateTtsAudioUrl("/ttscache/abc.mp3", {
        isTestDonate: true,
        kind: "tts-nickname",
      }),
    ).toBeNull();
  });

  it("returns null for test donation amount TTS", () => {
    expect(
      resolveDonateTtsAudioUrl("/ttscache/abc.mp3", {
        isTestDonate: true,
        kind: "tts-amount",
      }),
    ).toBeNull();
  });

  it("returns original URL for normal donation TTS kinds", () => {
    const originalUrl = "https://cdn.example.com/tts.mp3";

    expect(
      resolveDonateTtsAudioUrl(originalUrl, {
        isTestDonate: false,
        kind: "tts-nickname",
      }),
    ).toBe(originalUrl);
    expect(
      resolveDonateTtsAudioUrl(originalUrl, {
        isTestDonate: false,
        kind: "tts-amount",
      }),
    ).toBe(originalUrl);
    expect(
      resolveDonateTtsAudioUrl(originalUrl, {
        isTestDonate: false,
        kind: "tts-message",
      }),
    ).toBe(originalUrl);
  });

  it("keeps null and undefined for normal donations", () => {
    expect(
      resolveDonateTtsAudioUrl(null, {
        isTestDonate: false,
        kind: "tts-message",
      }),
    ).toBeNull();
    expect(
      resolveDonateTtsAudioUrl(undefined, {
        isTestDonate: false,
        kind: "tts-message",
      }),
    ).toBeUndefined();
  });

  it("ignores original legacy Tipply URL for test donation message TTS", () => {
    expect(
      resolveDonateTtsAudioUrl("https://tipply.pl/ttscache/abc.mp3", {
        isTestDonate: true,
        kind: "tts-message",
      }),
    ).toBe(TEST_DONATE_TTS_AUDIO_URL);
  });

  it("ignores original Tipply S3 URL for test donation message TTS", () => {
    expect(
      resolveDonateTtsAudioUrl(
        "https://tipply-prod-data.s3.waw.io.cloud.ovh.net/tips/tts/abc.mp3",
        { isTestDonate: true, kind: "tts-message" },
      ),
    ).toBe(TEST_DONATE_TTS_AUDIO_URL);
  });
});
