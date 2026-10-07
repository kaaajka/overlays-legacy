export const clamp = (n: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));
export type Binding = {
  input?: [number, number];
  output?: [number, number];
  deadzone?: number;
  curve?: number;
  gate?: number;
  invert?: boolean;
  scale?: number;
  offset?: number;
};
export function mapAudio(value: number, binding: Binding = {}): number {
  const [lo, hi] = binding.input ?? [0, 1];
  const [outLo, outHi] = binding.output ?? [0, 1];
  let n = clamp((value - lo) / Math.max(0.00001, hi - lo));
  if (n < (binding.deadzone ?? 0) || n < (binding.gate ?? 0)) n = 0;
  n = n ** (binding.curve ?? 1);
  if (binding.invert) n = 1 - n;
  return (outLo + n * (outHi - outLo)) * (binding.scale ?? 1) + (binding.offset ?? 0);
}
/** Time-domain smoothing, independent of visual frame count; used for offline samples. */
export const smoothAudio = (previous: number, next: number, elapsed: number, seconds: number) =>
  previous + (next - previous) * (1 - Math.exp(-Math.max(0, elapsed) / Math.max(0.001, seconds)));

export const atmosphereBinding: Binding = { input: [0.12, 0.9], curve: 1.6, output: [0, 0.18] };
export const glintBinding: Binding = { deadzone: 0.18, curve: 2, output: [0, 0.35] };
