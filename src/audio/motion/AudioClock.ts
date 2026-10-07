import { clamp } from "./audioBindings";

export type OutputClock = Pick<AudioContext, "currentTime" | "getOutputTimestamp">;
export function audibleContextTime(context: OutputClock, performanceMs: number): number {
  try {
    const stamp = context.getOutputTimestamp?.();
    if (
      stamp &&
      stamp.contextTime > 0 &&
      stamp.performanceTime > 0 &&
      performanceMs >= stamp.performanceTime &&
      performanceMs - stamp.performanceTime < 1000
    ) {
      return Math.min(
        context.currentTime,
        stamp.contextTime + (performanceMs - stamp.performanceTime) / 1000,
      );
    }
  } catch {
    /* Older CEF builds may expose a non-working timestamp method. */
  }
  return context.currentTime;
}

export function synchronizedTime(
  clock: number,
  scheduledStart: number,
  sourceOffset: number,
  duration: number,
  visualSyncOffsetMs = 0,
): number {
  // Do not draw before a future scheduled start, even with a positive visual offset.
  return clamp(
    sourceOffset +
      Math.max(0, clock - scheduledStart) +
      (clock >= scheduledStart ? visualSyncOffsetMs / 1000 : 0),
    0,
    duration,
  );
}

export function readVisualSyncOffset(search: string): number {
  const value = Number(new URLSearchParams(search).get("visualSyncOffsetMs") ?? 0);
  return Number.isFinite(value) ? clamp(value, -500, 500) : 0;
}
