import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MusicPlayback } from "./MusicPlayback";

function fakeContext() {
  const sources: {
    onended: (() => void) | null;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    buffer?: AudioBuffer;
  }[] = [];
  const gain = { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() };
  const context = {
    currentTime: 0,
    destination: {},
    createGain: () => gain,
    createBuffer: (_channels: number, length: number, sampleRate: number) => ({
      duration: length / sampleRate,
    }),
    createBufferSource: () => {
      const source = {
        onended: null as (() => void) | null,
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn(),
        connect: vi.fn(),
      };
      sources.push(source);
      return source;
    },
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    decodeAudioData: vi.fn().mockResolvedValue({ duration: 8 }),
  };
  return {
    context,
    gain,
    sources,
    player: new MusicPlayback(0.4, context as unknown as AudioContext),
  };
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("music playback lifecycle", () => {
  it("schedules decoded audio, pauses, seeks, recreates one-shot sources and cleans up", async () => {
    const { context, sources, gain, player } = fakeContext();
    player.setSilentFallback(8);
    const first = player.play();
    await vi.advanceTimersByTimeAsync(0);
    expect(sources[0].start).toHaveBeenCalledWith(0.06, 0);
    context.currentTime = 2.06;
    player.visualSyncOffsetMs = 40;
    expect(player.time).toBeCloseTo(2.04);
    player.pause();
    await first;
    expect(player.time).toBeCloseTo(2);
    expect(sources[0].stop).toHaveBeenCalledTimes(1);
    player.seek(4);
    const second = player.play();
    await vi.advanceTimersByTimeAsync(0);
    expect(sources[1].start).toHaveBeenCalledWith(2.12, 4);
    sources[1].onended();
    await second;
    expect(player.time).toBe(8);
    expect(player.isPlaying).toBe(false);
    player.dispose();
    player.dispose();
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(gain.disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("bounds a hung decoder and recovers to a silent buffer", async () => {
    const { context, player } = fakeContext();
    context.decodeAudioData.mockReturnValue(new Promise(() => {}));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) }),
    );
    const loading = player.load("/hung-test-track", new AbortController().signal);
    const rejected = expect(loading).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(8000);
    await rejected;
    player.setSilentFallback(8);
    expect(player.duration).toBe(8);
    player.dispose();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("aborts loading and active playback without stranded promises or timers", async () => {
    const { sources, player } = fakeContext();
    const abort = new AbortController();
    player.setSilentFallback(10);
    const playing = player.play(abort.signal);
    await vi.advanceTimersByTimeAsync(0);
    abort.abort();
    await playing;
    expect(sources[0].stop).toHaveBeenCalledTimes(1);
    expect(player.isPlaying).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    const alreadyAborted = new AbortController();
    alreadyAborted.abort();
    await expect(player.load("/aborted-test-track", alreadyAborted.signal)).rejects.toThrow();
    player.dispose();
  });
  it("finishes a stalled audio context with a safety watchdog", async () => {
    const { player, sources } = fakeContext();
    player.setSilentFallback(2);
    const playing = player.play();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(7000);
    await playing;
    expect(sources[0].stop).toHaveBeenCalledTimes(1);
    expect(player.time).toBe(2);
    player.dispose();
  });
});
