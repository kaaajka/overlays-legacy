import { debugLog } from '../debug';

export type PlayOverlayAudioOptions = {
  url: string;
  volume?: number;
  onEnded?: () => void;
  onError?: (error: unknown) => void;
  label?: string;
};

export function playOverlayAudio(
  options: PlayOverlayAudioOptions,
): HTMLAudioElement | null {
  const { url, volume = 1, onEnded, onError, label = 'overlay audio' } = options;

  if (!url) return null;

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
