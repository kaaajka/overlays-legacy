import { debugLog } from "../debug";
import {
  getMutedFixtureAudioDelayMs,
  isDevFixtureAudioMuted,
  type MutedFixtureAudioKind,
} from "../dev/replay/legacyReplay";

const DEFAULT_LOAD_TIMEOUT_MS = 8_000;
const DEFAULT_TTS_PLAY_TIMEOUT_MS = 30_000;
const DEFAULT_LONG_SOUND_TIMEOUT_MS = 60_000;

type OverlayAudioSequenceTimer = ReturnType<typeof setTimeout>;

export type OverlayAudioSequenceStepKind = "long-sound" | "tts";

export type OverlayAudioSequenceStep = {
  url?: string | null;
  volume?: number;
  label?: string;
  kind?: OverlayAudioSequenceStepKind;
  mutedFixtureAudioKind?: MutedFixtureAudioKind;
  onBeforePlay?: () => void;
  timeoutMs?: number;
};

export type PlayOverlayAudioSequenceOptions = {
  signal?: AbortSignal;
  loadTimeoutMs?: number;
  ttsPlayTimeoutMs?: number;
  longSoundTimeoutMs?: number;
};

function isAbortError(error: unknown): boolean {
  return (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  );
}

function toSafeVolume(volume: number | undefined): number {
  if (typeof volume !== "number") return 1;

  return Math.min(1, Math.max(0, volume));
}

function getStepTimeoutMs(
  step: OverlayAudioSequenceStep,
  options: Required<
    Pick<PlayOverlayAudioSequenceOptions, "ttsPlayTimeoutMs" | "longSoundTimeoutMs">
  >,
): number {
  if (typeof step.timeoutMs === "number") return step.timeoutMs;

  return step.kind === "tts" ? options.ttsPlayTimeoutMs : options.longSoundTimeoutMs;
}

function isSignalAborted(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true;
}

function waitForMutedFixtureAudio(
  step: OverlayAudioSequenceStep,
  signal: AbortSignal | undefined,
): Promise<void> {
  const simulatedDelayMs = getMutedFixtureAudioDelayMs({
    kind: step.mutedFixtureAudioKind,
    label: step.label,
  });

  debugLog("Skipped overlay audio during muted fixture replay", {
    url: step.url,
    label: step.label,
    simulatedDelayMs,
  });

  return new Promise((resolve) => {
    if (isSignalAborted(signal)) {
      resolve();
      return;
    }

    const timeout = setTimeout(resolve, simulatedDelayMs);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}

function runBeforePlay(step: OverlayAudioSequenceStep): void {
  try {
    step.onBeforePlay?.();
  } catch (error) {
    debugLog("Overlay audio before-play callback failed safely", {
      url: step.url,
      label: step.label,
      error,
    });
  }
}

function cleanupAudio(audio: HTMLAudioElement): void {
  audio.pause();
  audio.removeAttribute("src");

  try {
    audio.load();
  } catch (error) {
    debugLog("Overlay audio cleanup failed safely", error);
  }
}

function playOverlayAudioStep(
  step: OverlayAudioSequenceStep,
  options: Required<
    Pick<
      PlayOverlayAudioSequenceOptions,
      "loadTimeoutMs" | "ttsPlayTimeoutMs" | "longSoundTimeoutMs"
    >
  > &
    Pick<PlayOverlayAudioSequenceOptions, "signal">,
): Promise<void> {
  const { signal } = options;

  if (!step.url || isSignalAborted(signal)) return Promise.resolve();

  if (isDevFixtureAudioMuted()) {
    runBeforePlay(step);
    return waitForMutedFixtureAudio(step, signal);
  }

  return new Promise((resolve) => {
    if (isSignalAborted(signal)) {
      resolve();
      return;
    }

    const audio = new Audio(step.url ?? "");
    const timers = new Set<OverlayAudioSequenceTimer>();
    let settled = false;

    audio.volume = toSafeVolume(step.volume);

    const removeListeners = () => {
      audio.removeEventListener("canplaythrough", onCanPlayThrough);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
    };

    const clearTimers = () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }

      timers.clear();
    };

    const finish = (shouldCleanupAudio: boolean) => {
      if (settled) return;

      settled = true;
      clearTimers();
      removeListeners();

      if (shouldCleanupAudio) {
        cleanupAudio(audio);
      }

      resolve();
    };

    let beforePlayCalled = false;

    const runBeforePlayOnce = () => {
      if (beforePlayCalled) return;

      beforePlayCalled = true;
      runBeforePlay(step);
    };

    const failSafely = (message: string, error: unknown) => {
      if (!isAbortError(error)) {
        debugLog(message, { url: step.url, error });
      }

      if (!isSignalAborted(signal)) {
        runBeforePlayOnce();
      }

      finish(true);
    };

    const onAbort = () => {
      finish(true);
    };

    const onEnded = () => {
      finish(false);
    };

    const onError = (error: unknown) => {
      failSafely("Overlay audio load failed safely", error);
    };

    let loadTimeout: OverlayAudioSequenceTimer;

    const onCanPlayThrough = () => {
      clearTimeout(loadTimeout);
      timers.delete(loadTimeout);

      if (isSignalAborted(signal)) {
        finish(true);
        return;
      }

      runBeforePlayOnce();

      const playTimeout = setTimeout(() => {
        debugLog("Overlay audio play timed out safely", {
          url: step.url,
          label: step.label,
          timeoutMs: getStepTimeoutMs(step, options),
        });
        finish(true);
      }, getStepTimeoutMs(step, options));

      timers.add(playTimeout);

      audio.play().catch((error) => {
        failSafely("Overlay audio play failed safely", error);
      });
    };

    loadTimeout = setTimeout(() => {
      debugLog("Overlay audio load timed out safely", {
        url: step.url,
        label: step.label,
        timeoutMs: options.loadTimeoutMs,
      });
      if (!isSignalAborted(signal)) {
        runBeforePlayOnce();
      }
      finish(true);
    }, options.loadTimeoutMs);

    timers.add(loadTimeout);

    signal?.addEventListener("abort", onAbort, { once: true });
    audio.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
    audio.addEventListener("ended", onEnded, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

export async function playOverlayAudioSequence(
  steps: OverlayAudioSequenceStep[],
  options: PlayOverlayAudioSequenceOptions = {},
): Promise<void> {
  const resolvedOptions = {
    signal: options.signal,
    loadTimeoutMs: options.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS,
    ttsPlayTimeoutMs: options.ttsPlayTimeoutMs ?? DEFAULT_TTS_PLAY_TIMEOUT_MS,
    longSoundTimeoutMs: options.longSoundTimeoutMs ?? DEFAULT_LONG_SOUND_TIMEOUT_MS,
  };

  for (const step of steps) {
    if (isSignalAborted(resolvedOptions.signal)) return;

    try {
      await playOverlayAudioStep(step, resolvedOptions);
    } catch (error) {
      debugLog("Overlay audio sequence step failed safely", {
        url: step.url,
        label: step.label,
        error,
      });
    }
  }
}
