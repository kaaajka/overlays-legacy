import type { OverlayAudioSequenceStep } from "../audio/playOverlayAudioSequence";
import { waitAbortable } from "../audio/motion/wait";

export type DonationSequencePort = {
  music: () => Promise<void>;
  information: (readingMs: number) => void;
  speech: (steps: OverlayAudioSequenceStep[]) => Promise<void>;
  outro: () => void;
  finished: () => void;
};
export function messageReadingMs(message: string): number {
  return Math.max(5500, 5000 + (message.length / 18) * 1000);
}

/** Integration with the existing queue consists ONLY of the supplied completion callback. */
export async function runMotionDonation(
  port: DonationSequencePort,
  speech: OverlayAudioSequenceStep[],
  message: string,
  signal: AbortSignal,
  fast = false,
): Promise<void> {
  const readingMs = fast ? 0 : messageReadingMs(message);
  try {
    try {
      await port.music();
    } catch (error) {
      console.warn("Donation music failed; continuing to information/TTS", error);
    }
    if (signal.aborted) return;
    try {
      port.information(readingMs);
    } catch (error) {
      console.warn("Donation information visual degraded", error);
    }
    await Promise.allSettled([port.speech(speech), waitAbortable(readingMs, signal)]);
    if (signal.aborted) return;
    try {
      port.outro();
    } catch {
      /* Completion is independent of rendering. */
    }
    await waitAbortable(fast ? 0 : 650, signal);
  } finally {
    if (!signal.aborted) port.finished();
  }
}
