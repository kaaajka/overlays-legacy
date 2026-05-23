import { debugLog } from "../debug";
import {
  getMutedFixtureAudioDelayMs,
  isDevFixtureAudioMuted,
  type MutedFixtureAudioKind,
} from "../dev/replay/legacyReplay";

export type PlayOverlayAudioOptions = {
  url: string;
  volume?: number;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  label?: string;
  mutedFixtureAudioKind?: MutedFixtureAudioKind;
};

export function playOverlayAudio(options: PlayOverlayAudioOptions): HTMLAudioElement | null {
  const {
    url,
    volume = 1,
    onEnded,
    onError,
    label = "overlay audio",
    mutedFixtureAudioKind,
  } = options;

  if (!url) return null;

  if (isDevFixtureAudioMuted()) {
    const simulatedDelayMs = getMutedFixtureAudioDelayMs({
      kind: mutedFixtureAudioKind,
      label,
    });

    debugLog("Skipped overlay audio during muted fixture replay", {
      url,
      label,
      simulatedDelayMs,
    });

    if (onEnded) {
      window.setTimeout(() => {
        try {
          onEnded();
        } catch (callbackError) {
          debugLog(`${label} ended callback failed safely`, {
            url,
            error: callbackError,
          });
        }
      }, simulatedDelayMs);
    }

    return null;
  }

  const audio = new Audio(url);
  audio.volume = Math.min(1, Math.max(0, volume));

  if (onEnded) audio.onended = onEnded;
  audio.onerror = (error) => {
    debugLog(`${label} load failed safely`, { url, error });
    try {
      onError?.(error);
    } catch (callbackError) {
      debugLog(`${label} error callback failed safely`, {
        url,
        error: callbackError,
      });
    }
  };

  audio.play().catch((error) => {
    debugLog(`${label} play failed safely`, { url, error });
    try {
      onError?.(error);
    } catch (callbackError) {
      debugLog(`${label} error callback failed safely`, {
        url,
        error: callbackError,
      });
    }
  });

  return audio;
}
