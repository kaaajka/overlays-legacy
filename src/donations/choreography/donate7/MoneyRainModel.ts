import gsap from "gsap";
import type { QualityTier } from "../../../motion/types";
import { seededRandom } from "../../../motion/random";

export type MoneyDepth = "back" | "mid" | "front";
export const moneyBudgets = { high: 540, medium: 310, safe: 135 };
export const moneyStates = [
  { at: 3.6, name: "first sparse bills", density: 0.04, front: 0, scale: 0.92 },
  { at: 8.1, name: "buildup", density: 0.22, front: 0.18, scale: 0.95 },
  { at: 12.3, name: "recognizable rain", density: 0.55, front: 0.38, scale: 1 },
  { at: 15.49932, name: "hero storm", density: 0.85, front: 0.8, scale: 1.07 },
  { at: 18.4, name: "donor reading", density: 0.26, front: 0.12, scale: 1 },
  { at: 22.89488, name: "renewed storm", density: 0.72, front: 0.65, scale: 1.03 },
  { at: 28.6, name: "false calm", density: 0.09, front: 0, scale: 0.98 },
  { at: 30.26721, name: "rebuild", density: 0.66, front: 0.5, scale: 1.02 },
  { at: 36.2, name: "final approach", density: 0.9, front: 0.65, scale: 1.03 },
  { at: 37.65116, name: "amount priority", density: 0.4, front: 0.1, scale: 1 },
  { at: 38.85, name: "final money storm", density: 1, front: 1, scale: 1.1 },
  { at: 41.6, name: "afterglow", density: 0.42, front: 0.25, scale: 1 },
  { at: 43.75, name: "decay", density: 0, front: 0, scale: 0.98 },
] as const;

type Bill = {
  depth: MoneyDepth;
  born: number;
  life: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  drift: number;
  turn: number;
  phase: number;
  flutter: number;
  frequency: number;
  opacity: number;
  rank: number;
};
export type MoneyPose = {
  id: number;
  depth: MoneyDepth;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  alpha: number;
};

/** Seeded finite emission inventory; the score is GSAP, rendering is Pixi.
 * Closed-form terminal fall/air flutter has no accumulated integration state.
 * Physics2D's ballistic acceleration is intentionally not used for terminal paper drag.
 */
export class MoneyRainModel {
  readonly envelope = { density: 0, front: 0, scale: 1, fade: 1, fold: 0 };
  readonly timeline = gsap.timeline({ paused: true });
  private bills: Bill[] = [];
  constructor(seed: string) {
    this.timeline.set(this.envelope, { density: 0, front: 0, scale: 1, fade: 1 }, 0);
    for (const state of moneyStates)
      this.timeline.to(
        this.envelope,
        {
          density: state.density,
          front: state.front,
          scale: state.scale,
          duration: state.name === "amount priority" ? 0.25 : 0.75,
          ease: "sine.inOut",
        },
        state.at,
      );
    this.timeline.to(this.envelope, { fade: 0, duration: 1.9, ease: "sine.inOut" }, 44.25);
    this.timeline.to(this.envelope, { fold: 0.35, duration: 0.7, ease: "sine.inOut" }, 28.6);
    this.timeline.to(this.envelope, { fold: 1, duration: 0.45, ease: "sine.inOut" }, 29.3);
    this.timeline.to(this.envelope, { fold: 0, duration: 1.65, ease: "sine.inOut" }, 30.36721);
    const random = seededRandom(`${seed}:pixi-money-rain`);
    // Candidate emission is sampled from the authored GSAP score at birth.
    // Frame history and render frequency never decide whether a note exists.
    for (const depth of ["back", "mid", "front"] as const) {
      const rate = depth === "back" ? 25 : depth === "mid" ? 75 : 2.8;
      for (let born = 3.6; born < 43.75; born += 1 / rate) {
        this.timeline.seek(born, true);
        const gate = random();
        if (gate > this.envelope.density * (depth === "front" ? this.envelope.front : 1)) continue;
        const speed =
          depth === "back"
            ? 115 + random() * 75
            : depth === "mid"
              ? 200 + random() * 150
              : 510 + random() * 220;
        const y = -80 - random() * 140;
        this.bills.push({
          depth,
          born,
          life: (1220 - y) / speed,
          x: random(),
          y,
          speed,
          size:
            depth === "back"
              ? 28 + random() * 20
              : depth === "mid"
                ? 55 + random() * 38
                : 145 + random() * 80,
          drift: (random() - 0.5) * (depth === "front" ? 27 : 18),
          turn: (random() - 0.5) * (depth === "front" ? 2.4 : 1.1),
          phase: random() * Math.PI * 2,
          flutter: 8 + random() * (depth === "front" ? 24 : 18),
          frequency: 1.1 + random() * 2.1,
          opacity:
            depth === "back"
              ? 0.2 + random() * 0.2
              : depth === "mid"
                ? 0.62 + random() * 0.23
                : 0.48 + random() * 0.24,
          rank: random(),
        });
      }
    }
    this.timeline.seek(0, true);
  }
  sample(time: number, width = 1920, quality: QualityTier = "high"): MoneyPose[] {
    this.timeline.seek(Math.max(0, time), true);
    if (time <= 0 || time >= 46.23397) return [];
    const threshold = quality === "high" ? 1 : quality === "medium" ? 0.58 : 0.25;
    const result: MoneyPose[] = [];
    for (let id = 0; id < this.bills.length; id++) {
      const b = this.bills[id],
        age = time - b.born;
      if (age < 0 || age > b.life || b.rank > threshold) continue;
      const flutter = age * b.frequency + b.phase;
      const alpha =
        b.opacity *
        this.envelope.fade *
        (b.depth === "front"
          ? 0.2 + this.envelope.front * 0.8
          : 0.55 + this.envelope.density * 0.45);
      result.push({
        id,
        depth: b.depth,
        x: -100 + b.x * (width + 200) + b.drift * age + Math.sin(flutter) * b.flutter,
        y: b.y + b.speed * age,
        scaleX: (b.size / 56) * this.envelope.scale,
        scaleY:
          (b.size / 56) * this.envelope.scale * (0.18 + 0.82 * Math.abs(Math.sin(flutter * 0.73))),
        rotation: b.phase + b.turn * age + Math.sin(flutter * 0.6) * 0.2,
        alpha,
      });
    }
    // Stable priority downsampling avoids birth-order starvation of the front plane.
    if (result.length > moneyBudgets[quality]) {
      result.sort((a, b) => this.bills[a.id].rank - this.bills[b.id].rank);
      result.length = moneyBudgets[quality];
    }
    return result;
  }
  chapter(time: number) {
    return [...moneyStates].reverse().find((s) => time >= s.at)?.name ?? "clear";
  }
  dispose() {
    this.timeline.kill();
    this.bills = [];
  }
}
