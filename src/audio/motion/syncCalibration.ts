import { audibleContextTime } from "./AudioClock";

/** Flash derives from the same scheduled clock as the click. No visual timeout. */
export async function runSyncCalibration(
  flash: HTMLElement,
  offsetMs: number,
  signal: AbortSignal,
): Promise<void> {
  const context = new AudioContext({ latencyHint: "interactive" });
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  let raf = 0;
  let watchdog: ReturnType<typeof setTimeout>;
  const cleanup = () => {
    cancelAnimationFrame(raf);
    clearTimeout(watchdog);
    flash.style.opacity = "0";
    oscillator.disconnect();
    gain.disconnect();
    void context.close().catch(() => {});
  };
  try {
    await context.resume();
    if (signal.aborted) return;
    const start = context.currentTime + 1;
    oscillator.frequency.value = 1200;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.035);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.05);
    await new Promise<void>((resolve) => {
      const finish = () => {
        signal.removeEventListener("abort", finish);
        resolve();
      };
      signal.addEventListener("abort", finish, { once: true });
      watchdog = setTimeout(finish, 4000);
      const frame = () => {
        const clock = audibleContextTime(context, performance.now());
        const time = clock - start + offsetMs / 1000;
        flash.style.opacity = time >= 0 && time <= 0.05 ? "1" : "0";
        if (clock < start + 0.25) raf = requestAnimationFrame(frame);
        else finish();
      };
      raf = requestAnimationFrame(frame);
    });
  } finally {
    cleanup();
  }
}
