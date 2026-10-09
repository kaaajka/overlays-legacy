import type { MusicAnalysis, QualityTier } from "../../../motion/types";

/** Editorial cues anchored to measured onsets / incumbent hero, never inferred lyrics. */
export const donate7Show = {
  signal: 4.45823,
  co: 13.20054,
  za: 13.87392,
  hero: 15.49932,
  response: 18.2,
  reprise: 22.89488,
  exchange: 25.44907,
  recovery: 28.6,
  calm: 29.45,
  recruit: 30.26721,
  final: 37.65116,
  afterglow: 40.91356,
  exit: 43.75,
} as const;

export const spectacleBudgets: Record<
  QualityTier,
  { particles: number; pixels: number; trails: boolean }
> = {
  high: { particles: 480, pixels: 2_000_000, trails: true },
  medium: { particles: 260, pixels: 1_200_000, trails: true },
  safe: { particles: 110, pixels: 650_000, trails: false },
};

export type SpectacleKind = "bill" | "paper" | "streamer" | "spark";
export type SpectacleCue = {
  at: number;
  kind: SpectacleKind;
  count: number;
  life: number;
  power: number;
  emitter: "corners" | "top" | "left" | "right" | "sweep";
};

/** Distinct emitters and delayed secondary action, not a uniform random-rain preset. */
export const spectacleCues: SpectacleCue[] = [
  {
    at: donate7Show.hero,
    kind: "bill",
    count: 76,
    life: 3.7,
    power: 0.8,
    emitter: "corners",
  },
  {
    at: donate7Show.hero + 0.12,
    kind: "paper",
    count: 140,
    life: 4,
    power: 0.8,
    emitter: "corners",
  },
  {
    at: donate7Show.hero + 0.24,
    kind: "streamer",
    count: 8,
    life: 3.8,
    power: 0.8,
    emitter: "corners",
  },
  {
    at: donate7Show.hero + 0.18,
    kind: "spark",
    count: 64,
    life: 1.9,
    power: 0.7,
    emitter: "left",
  },
  {
    at: donate7Show.response,
    kind: "bill",
    count: 22,
    life: 3.5,
    power: 0.5,
    emitter: "top",
  },
  {
    at: donate7Show.reprise,
    kind: "bill",
    count: 84,
    life: 4,
    power: 0.9,
    emitter: "top",
  },
  {
    at: donate7Show.reprise + 0.12,
    kind: "paper",
    count: 150,
    life: 4,
    power: 0.9,
    emitter: "top",
  },
  {
    at: donate7Show.reprise + 0.18,
    kind: "spark",
    count: 72,
    life: 2,
    power: 0.8,
    emitter: "right",
  },
  {
    at: donate7Show.reprise + 0.24,
    kind: "streamer",
    count: 8,
    life: 3.8,
    power: 0.8,
    emitter: "corners",
  },
  {
    at: donate7Show.exchange,
    kind: "bill",
    count: 26,
    life: 3.2,
    power: 0.5,
    emitter: "corners",
  },
  {
    at: 26.6,
    kind: "paper",
    count: 35,
    life: 2.4,
    power: 0.4,
    emitter: "top",
  },
  {
    at: donate7Show.final + 0.35,
    kind: "bill",
    count: 110,
    life: 4.2,
    power: 1,
    emitter: "sweep",
  },
  {
    at: donate7Show.final + 0.12,
    kind: "paper",
    count: 210,
    life: 4.4,
    power: 1,
    emitter: "corners",
  },
  {
    at: donate7Show.final + 0.7,
    kind: "streamer",
    count: 12,
    life: 4.4,
    power: 1,
    emitter: "corners",
  },
  {
    at: donate7Show.final + 0.5,
    kind: "spark",
    count: 88,
    life: 2.5,
    power: 1,
    emitter: "left",
  },
  {
    at: donate7Show.final + 1.1,
    kind: "spark",
    count: 88,
    life: 2.5,
    power: 1,
    emitter: "right",
  },
  {
    at: donate7Show.afterglow,
    kind: "bill",
    count: 25,
    life: 3.5,
    power: 0.5,
    emitter: "top",
  },
  {
    at: 44.14113,
    kind: "bill",
    count: 3,
    life: 1.8,
    power: 0.8,
    emitter: "sweep",
  },
];

/** Sparse, measured micro events. Nearby detections merge rather than stacking tweens. */
export function monitorEvents(analysis: MusicAnalysis) {
  let previous = -1;
  return analysis.onsets.filter((event) => {
    if (event.at - previous < 0.085 || event.at > donate7Show.exit) return false;
    previous = event.at;
    return true;
  });
}
