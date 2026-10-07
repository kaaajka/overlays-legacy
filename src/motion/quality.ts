import type { QualityTier } from "./types";

export const qualityBudgets = {
  high: { scale: 0.8, particles: 520 },
  medium: { scale: 0.55, particles: 220 },
  safe: { scale: 0, particles: 0 },
} as const;

export function selectQuality(webgl2: boolean, cores: number, requested?: string): QualityTier {
  if (!webgl2 || requested === "safe") return "safe";
  if (requested === "high") return "high";
  if (requested === "medium" || cores < 8) return "medium";
  return "high";
}

/** A sustained slow window reduces detail once. No timing, layout or cue edits. */
export class QualityGovernor {
  private samples = 0;
  private slow = 0;
  constructor(public tier: QualityTier) {}
  record(frameMs: number): boolean {
    if (frameMs > 250 || frameMs <= 0) return false;
    this.samples++;
    if (frameMs > 23) this.slow++;
    if (this.samples < 120) return false;
    const reduce = this.slow / this.samples > 0.35 && this.tier === "high";
    this.samples = 0;
    this.slow = 0;
    if (reduce) this.tier = "medium";
    return reduce;
  }
}
