import type { AudioFeatures, Band, Cue, MusicAnalysis } from "../../motion/types";
import { clamp } from "./audioBindings";
import { rhythmMarks } from "./musicIntelligence";

export const bands: Band[] = [
  "subBass",
  "bass",
  "lowMid",
  "mid",
  "upperMid",
  "presence",
  "brilliance",
];
export function countThrough(sorted: number[], time: number): number {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (sorted[mid] <= time) low = mid + 1;
    else high = mid;
  }
  return low;
}
const sample = (values: number[] | undefined, index: number): number => {
  if (!values?.length) return 0;
  const floor = Math.floor(index);
  return clamp(
    (values[Math.min(floor, values.length - 1)] ?? 0) * (1 - (index % 1)) +
      (values[Math.min(floor + 1, values.length - 1)] ?? 0) * (index % 1),
  );
};

/** Absolute-time features: scrubbing backward and dropped frames produce the same result. */
export function featuresAt(analysis: MusicAnalysis | undefined, time: number): AudioFeatures {
  const frame = Math.max(0, time) / (analysis?.sampleInterval || 0.05);
  const result = Object.fromEntries(
    bands.map((band) => [band, sample(analysis?.bands?.[band], frame)]),
  ) as AudioFeatures;
  result.loudness = sample(analysis?.loudness, frame);
  const beats = analysis ? rhythmMarks(analysis).map((mark) => mark.at) : [];
  const beatIndex = countThrough(beats, time) - 1;
  const beat = beats[beatIndex] ?? 0;
  const interval = (beats[beatIndex + 1] ?? beat + 60 / (analysis?.bpm || 120)) - beat;
  result.beatPhase = clamp((time - beat) / Math.max(0.01, interval));
  result.barPhase = ((Math.max(0, beatIndex) % 4) + result.beatPhase) / 4;
  const downbeats = analysis ? rhythmMarks(analysis, true).map((mark) => mark.at) : [];
  const barIndex = countThrough(downbeats, time) - 1;
  if (barIndex >= 0 && downbeats[barIndex + 1] !== undefined)
    result.barPhase = clamp(
      (time - downbeats[barIndex]) / (downbeats[barIndex + 1] - downbeats[barIndex]),
    );
  const onsets = analysis?.onsets ?? [];
  const onsetIndex =
    countThrough(
      onsets.map((o) => o.at),
      time,
    ) - 1;
  const onset = onsets[onsetIndex];
  result.onset = onset ? onset.strength * Math.exp(-Math.max(0, time - onset.at) / 0.09) : 0;
  result.kick = result.onset * result.bass;
  const kicks =
    analysis?.intelligence?.measured.drumEvents.filter((event) => event.kind === "kick-like") ?? [];
  const kick =
    kicks[
      countThrough(
        kicks.map((event) => event.at),
        time,
      ) - 1
    ];
  if (kick) result.kick = kick.strength * Math.exp(-Math.max(0, time - kick.at) / 0.09);
  return result;
}

/** Discrete events report every crossed ID; seeks reset the cursor explicitly. */
export class CueLatch {
  private cursor = -1;
  private serial = 0;
  advance(cues: Cue[], time: number): { id: number; cue: Cue }[] {
    const next =
      countThrough(
        cues.map((c) => c.at),
        time,
      ) - 1;
    const crossed = cues
      .slice(this.cursor + 1, next + 1)
      .map((cue) => ({ id: ++this.serial, cue }));
    this.cursor = next;
    return crossed;
  }
  seek(cues: Cue[], time: number): void {
    this.cursor =
      countThrough(
        cues.map((c) => c.at),
        time,
      ) - 1;
  }
}
