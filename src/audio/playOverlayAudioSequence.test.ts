import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { playOverlayAudioSequence } from "./playOverlayAudioSequence";

vi.mock("../debug", () => ({
  debugLog: vi.fn(),
}));

vi.mock("../dev/replay/legacyReplay", () => ({
  getMutedFixtureAudioDelayMs: vi.fn(() => 0),
  isDevFixtureAudioMuted: vi.fn(() => false),
}));

type MockAudioEvent = "canplaythrough" | "ended" | "error";

class MockAudio {
  static instances: MockAudio[] = [];

  volume = 1;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  listeners = new Map<MockAudioEvent, Set<(event?: unknown) => void>>();

  constructor(public readonly src: string) {
    MockAudio.instances.push(this);
  }

  addEventListener(event: MockAudioEvent, callback: (event?: unknown) => void) {
    const listeners = this.listeners.get(event) ?? new Set<(event?: unknown) => void>();
    listeners.add(callback);
    this.listeners.set(event, listeners);
  }

  removeEventListener(event: MockAudioEvent, callback: (event?: unknown) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: MockAudioEvent, value?: unknown) {
    for (const callback of this.listeners.get(event) ?? []) {
      callback(value);
    }
  }

  listenerCount(event: MockAudioEvent) {
    return this.listeners.get(event)?.size ?? 0;
  }
}

const latestAudio = () => {
  const audio = MockAudio.instances[MockAudio.instances.length - 1];

  if (!audio) throw new Error("Expected mock audio instance");

  return audio;
};

const waitForMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("playOverlayAudioSequence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("plays non-empty audio steps in order", async () => {
    const events: string[] = [];
    const promise = playOverlayAudioSequence([
      {
        url: "/template.mp3",
        volume: 0.4,
        label: "template",
        onBeforePlay: () => events.push("template:before-play"),
      },
      {
        url: "/tts.mp3",
        volume: 0.8,
        label: "tts",
        onBeforePlay: () => events.push("tts:before-play"),
      },
    ]);

    expect(MockAudio.instances).toHaveLength(1);
    expect(latestAudio().src).toBe("/template.mp3");
    expect(latestAudio().volume).toBe(0.4);

    latestAudio().emit("canplaythrough");
    await waitForMicrotasks();
    events.push("template:after-play");
    latestAudio().emit("ended");
    await waitForMicrotasks();

    expect(MockAudio.instances).toHaveLength(2);
    expect(latestAudio().src).toBe("/tts.mp3");
    expect(latestAudio().volume).toBe(0.8);

    latestAudio().emit("canplaythrough");
    await waitForMicrotasks();
    events.push("tts:after-play");
    latestAudio().emit("ended");

    await promise;

    expect(events).toEqual([
      "template:before-play",
      "template:after-play",
      "tts:before-play",
      "tts:after-play",
    ]);
  });

  it("skips empty and missing URLs", async () => {
    const promise = playOverlayAudioSequence([
      { url: null, label: "null" },
      { url: "", label: "empty" },
      { label: "missing" },
      { url: "/real.mp3", label: "real" },
    ]);

    await waitForMicrotasks();

    expect(MockAudio.instances).toHaveLength(1);
    expect(latestAudio().src).toBe("/real.mp3");

    latestAudio().emit("canplaythrough");
    latestAudio().emit("ended");

    await promise;
  });

  it("continues to the next step when playback fails", async () => {
    const promise = playOverlayAudioSequence([
      { url: "/broken.mp3", label: "broken" },
      { url: "/next.mp3", label: "next" },
    ]);

    expect(MockAudio.instances).toHaveLength(1);
    latestAudio().play.mockRejectedValueOnce(new Error("play failed"));
    latestAudio().emit("canplaythrough");
    await waitForMicrotasks();

    expect(MockAudio.instances).toHaveLength(2);
    expect(latestAudio().src).toBe("/next.mp3");

    latestAudio().emit("canplaythrough");
    latestAudio().emit("ended");

    await promise;
  });

  it("runs before-play callback when audio load fails before playback", async () => {
    const onBeforePlay = vi.fn();
    const promise = playOverlayAudioSequence([
      { url: "/broken-load.mp3", label: "broken-load", onBeforePlay },
    ]);

    const audio = latestAudio();
    audio.emit("error", new Error("load failed"));

    await promise;

    expect(onBeforePlay).toHaveBeenCalledTimes(1);
  });

  it("runs before-play callback when audio load times out before playback", async () => {
    const onBeforePlay = vi.fn();
    const promise = playOverlayAudioSequence(
      [{ url: "/never-loads.mp3", label: "never-loads", onBeforePlay }],
      { loadTimeoutMs: 8_000 },
    );

    await vi.advanceTimersByTimeAsync(8_000);
    await promise;

    expect(onBeforePlay).toHaveBeenCalledTimes(1);
  });

  it("does not run before-play callback twice when playback fails after loading", async () => {
    const onBeforePlay = vi.fn();
    const promise = playOverlayAudioSequence([
      { url: "/play-rejects.mp3", label: "play-rejects", onBeforePlay },
    ]);

    latestAudio().play.mockRejectedValueOnce(new Error("play failed"));
    latestAudio().emit("canplaythrough");

    await promise;

    expect(onBeforePlay).toHaveBeenCalledTimes(1);
  });

  it("cancels the active step and does not start later steps", async () => {
    const abortController = new AbortController();
    const onBeforePlay = vi.fn();
    const promise = playOverlayAudioSequence(
      [
        { url: "/active.mp3", label: "active", onBeforePlay },
        { url: "/stale.mp3", label: "stale" },
      ],
      { signal: abortController.signal },
    );

    expect(MockAudio.instances).toHaveLength(1);
    const activeAudio = latestAudio();

    activeAudio.emit("canplaythrough");
    await waitForMicrotasks();

    abortController.abort();
    await promise;

    expect(onBeforePlay).toHaveBeenCalledTimes(1);
    expect(activeAudio.pause).toHaveBeenCalledTimes(1);
    expect(activeAudio.removeAttribute).toHaveBeenCalledWith("src");
    expect(activeAudio.load).toHaveBeenCalledTimes(1);
    expect(MockAudio.instances).toHaveLength(1);
  });

  it("does not run before-play callback when cancelled before audio loads", async () => {
    const abortController = new AbortController();
    const onBeforePlay = vi.fn();
    const promise = playOverlayAudioSequence(
      [{ url: "/active.mp3", label: "active", onBeforePlay }],
      { signal: abortController.signal },
    );

    abortController.abort();
    await promise;

    expect(onBeforePlay).not.toHaveBeenCalled();
  });

  it("cleans up event listeners after a step finishes", async () => {
    const promise = playOverlayAudioSequence([{ url: "/audio.mp3", label: "audio" }]);

    const audio = latestAudio();
    expect(audio.listenerCount("canplaythrough")).toBe(1);
    expect(audio.listenerCount("ended")).toBe(1);
    expect(audio.listenerCount("error")).toBe(1);

    audio.emit("canplaythrough");
    audio.emit("ended");

    await promise;

    expect(audio.listenerCount("canplaythrough")).toBe(0);
    expect(audio.listenerCount("ended")).toBe(0);
    expect(audio.listenerCount("error")).toBe(0);
  });

  it("does not hang forever when audio never becomes playable", async () => {
    const promise = playOverlayAudioSequence([{ url: "/never-loads.mp3", label: "never-loads" }], {
      loadTimeoutMs: 8_000,
    });

    const audio = latestAudio();

    await vi.advanceTimersByTimeAsync(8_000);
    await promise;

    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.removeAttribute).toHaveBeenCalledWith("src");
    expect(audio.load).toHaveBeenCalledTimes(1);
  });

  it("uses the longer default timeout for long sounds", async () => {
    const promise = playOverlayAudioSequence([{ url: "/long.mp3", kind: "long-sound" }]);

    const audio = latestAudio();
    audio.emit("canplaythrough");

    await vi.advanceTimersByTimeAsync(59_999);
    expect(audio.pause).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await promise;

    expect(audio.pause).toHaveBeenCalledTimes(1);
  });

  it("uses the shorter default timeout for TTS sounds", async () => {
    const promise = playOverlayAudioSequence([{ url: "/tts.mp3", kind: "tts" }]);

    const audio = latestAudio();
    audio.emit("canplaythrough");

    await vi.advanceTimersByTimeAsync(29_999);
    expect(audio.pause).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await promise;

    expect(audio.pause).toHaveBeenCalledTimes(1);
  });
});
