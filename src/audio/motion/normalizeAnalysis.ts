import type { MusicAnalysis } from "../../motion/types";
import { bands } from "./AudioFeatureBus";
import { normalizeIntelligence } from "./musicIntelligence";

/** Bundled analysis is immutable in production; invalid authoring data still degrades safely. */
export function normalizeAnalysis(input: unknown, duration: number, source: string): MusicAnalysis {
  const candidate = input as Partial<MusicAnalysis> | undefined;
  const samples = (values: unknown) =>
    Array.isArray(values)
      ? values.map((n) =>
          typeof n === "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0,
        )
      : [];
  const timestamps = (values: unknown) =>
    Array.isArray(values)
      ? values
          .filter(
            (n): n is number =>
              typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= duration,
          )
          .sort((a, b) => a - b)
      : [];
  if (
    (candidate?.schemaVersion === 1 || candidate?.schemaVersion === 2) &&
    candidate.duration > 0 &&
    Number.isFinite(candidate.duration) &&
    candidate.sampleInterval > 0 &&
    bands.every((band) => Array.isArray(candidate.bands?.[band])) &&
    Array.isArray(candidate.loudness) &&
    Array.isArray(candidate.onsets) &&
    Array.isArray(candidate.beats) &&
    Array.isArray(candidate.downbeats)
  )
    return {
      ...candidate,
      intelligence:
        candidate.schemaVersion === 2
          ? normalizeIntelligence(
              candidate.intelligence,
              candidate.duration,
              candidate.sourceSha256,
            )
          : undefined,
    } as MusicAnalysis;
  return {
    schemaVersion: 1,
    source,
    duration,
    bpm: 120,
    sampleInterval: 0.05,
    beats: timestamps(candidate?.beats),
    downbeats: [],
    onsets: [],
    loudness: samples(candidate?.loudness),
    bands: Object.fromEntries(
      bands.map((band) => [band, samples(candidate?.bands?.[band])]),
    ) as MusicAnalysis["bands"],
  };
}
