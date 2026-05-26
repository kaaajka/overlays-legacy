import { describe, expect, it } from "vitest";

import { resolveBackendAudioUrl } from "./resolveBackendAudioUrl";

describe("resolveBackendAudioUrl", () => {
  it("rewrites legacy Tipply TTS absolute paths to storage URLs", () => {
    expect(resolveBackendAudioUrl("/ttscache/abc.mp3")).toBe(
      "https://tipply-prod-data.s3.waw.io.cloud.ovh.net/tips/tts/abc.mp3",
    );
  });

  it("rewrites legacy Tipply TTS https URLs to storage URLs", () => {
    expect(resolveBackendAudioUrl("https://tipply.pl/ttscache/abc.mp3")).toBe(
      "https://tipply-prod-data.s3.waw.io.cloud.ovh.net/tips/tts/abc.mp3",
    );
  });

  it("rewrites legacy Tipply TTS http URLs to storage URLs", () => {
    expect(resolveBackendAudioUrl("http://tipply.pl/ttscache/abc.mp3")).toBe(
      "https://tipply-prod-data.s3.waw.io.cloud.ovh.net/tips/tts/abc.mp3",
    );
  });

  it("keeps absolute https URLs unchanged", () => {
    expect(resolveBackendAudioUrl("https://cdn.example.com/file.mp3")).toBe(
      "https://cdn.example.com/file.mp3",
    );
  });

  it("keeps absolute http URLs unchanged", () => {
    expect(resolveBackendAudioUrl("http://cdn.example.com/file.mp3")).toBe(
      "http://cdn.example.com/file.mp3",
    );
  });

  it("normalizes protocol-relative URLs to https", () => {
    expect(resolveBackendAudioUrl("//cdn.example.com/file.mp3")).toBe(
      "https://cdn.example.com/file.mp3",
    );
  });

  it("prefixes Tipply for absolute paths", () => {
    expect(resolveBackendAudioUrl("/upload/file.mp3")).toBe("https://tipply.pl/upload/file.mp3");
  });

  it("prefixes Tipply for relative paths", () => {
    expect(resolveBackendAudioUrl("upload/file.mp3")).toBe("https://tipply.pl/upload/file.mp3");
  });

  it("returns null for null, undefined and empty values", () => {
    expect(resolveBackendAudioUrl(null)).toBeNull();
    expect(resolveBackendAudioUrl(undefined)).toBeNull();
    expect(resolveBackendAudioUrl("")).toBeNull();
    expect(resolveBackendAudioUrl("   ")).toBeNull();
  });
});
