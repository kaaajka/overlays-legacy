import type { QualityTier } from "./types";

export const qualityBudgets = {
  high: { scale: 0.8, particles: 520, pixels: 4_000_000 },
  medium: { scale: 0.55, particles: 220, pixels: 2_000_000 },
  safe: { scale: 0, particles: 0, pixels: 1 },
} as const;

export function selectQuality(webgl2: boolean, cores: number, requested?: string): QualityTier {
  if (!webgl2 || requested === "safe") return "safe";
  if (requested === "high") return "high";
  if (requested === "medium" || cores < 8) return "medium";
  return "high";
}

/** A sustained slow window reduces detail. No timing, layout or cue edits. */
export class QualityGovernor {
  private samples = 0;
  private slow = 0;
  constructor(public tier: QualityTier) {}
  record(frameMs: number): boolean {
    if (frameMs > 250 || frameMs <= 0) return false;
    this.samples++;
    if (frameMs > 23) this.slow++;
    if (this.samples < 120) return false;
    const reduce = this.slow / this.samples > 0.35 && this.tier !== "safe";
    this.samples = 0;
    this.slow = 0;
    if (reduce) this.tier = this.tier === "high" ? "medium" : "safe";
    return reduce;
  }
}
