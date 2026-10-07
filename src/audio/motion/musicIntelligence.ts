import type { MusicAnalysis, MusicIntelligence, TimedRegion, TimingMark } from "../../motion/types";

const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const unit = (value: unknown) => (finite(value) ? Math.max(0, Math.min(1, value)) : 0);
const array = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
/** Sanitizes untrusted authoring JSON; correction precedence requires the exact source hash. */
export function normalizeIntelligence(
  value: unknown,
  duration: number,
  hash?: string,
): MusicIntelligence {
  const raw = (value ?? {}) as Partial<MusicIntelligence>;
  const marks = (value: unknown): TimingMark[] =>
    array(value)
      .filter((item) => finite(item.at) && item.at >= 0 && item.at <= duration)
      .map((item) => ({
        at: item.at as number,
        confidence: unit(item.confidence),
        approved: item.approved === true,
        source: String(item.source ?? "unspecified"),
      }))
      .sort((a, b) => a.at - b.at);
  const regions = (value: unknown): TimedRegion[] =>
    array(value)
      .filter(
        (item) =>
          finite(item.start) &&
          finite(item.end) &&
          item.start >= 0 &&
          item.end > item.start &&
          item.end <= duration,
      )
      .map((item) => ({
        start: item.start as number,
        end: item.end as number,
        text: typeof item.text === "string" ? item.text : undefined,
        label: typeof item.label === "string" ? item.label : undefined,
        confidence: unit(item.confidence),
        approved: item.approved === true,
        source: String(item.source ?? "unspecified"),
      }))
      .sort((a, b) => a.start - b.start);
  const samples = (value: unknown) => (Array.isArray(value) ? value.map(unit) : []);
  const authored = raw.authored?.sourceSha256 === hash && hash ? raw.authored : undefined;
  return {
    measured: {
      waveform: Array.isArray(raw.measured?.waveform)
        ? raw.measured.waveform
            .filter((pair) => Array.isArray(pair) && pair.length === 2 && pair.every(finite))
            .map((pair) => pair.map((n) => Math.max(-1, Math.min(1, n))))
        : [],
      drums: samples(raw.measured?.drums),
      vocals: samples(raw.measured?.vocals),
      drumEvents: array(raw.measured?.drumEvents)
        .filter((item) => finite(item.at) && item.at >= 0 && item.at <= duration)
        .map((item) => ({
          at: item.at as number,
          kind: String(item.kind ?? "accent"),
          strength: unit(item.strength),
          confidence: unit(item.confidence),
          source: String(item.source ?? "unspecified"),
        }))
        .sort((a, b) => a.at - b.at),
    },
    inferred: {
      beats: marks(raw.inferred?.beats),
      downbeats: marks(raw.inferred?.downbeats),
      sections: regions(raw.inferred?.sections),
      vocalPhrases: regions(raw.inferred?.vocalPhrases),
      words: regions(raw.inferred?.words),
    },
    authored: {
      sourceSha256: authored?.sourceSha256,
      beats: marks(authored?.beats).filter((item) => item.approved),
      downbeats: marks(authored?.downbeats).filter((item) => item.approved),
      sections: regions(authored?.sections).filter((item) => item.approved),
      vocalPhrases: regions(authored?.vocalPhrases).filter((item) => item.approved),
      words: regions(authored?.words).filter((item) => item.approved),
      cues: array(authored?.cues)
        .filter((item) => finite(item.at) && item.at >= 0 && item.at <= duration)
        .map((item) => ({
          at: item.at as number,
          name: String(item.name ?? "accent"),
          intensity: unit(item.intensity),
          group: String(item.group ?? "typography"),
        }))
        .sort((a, b) => a.at - b.at),
    },
    provenance: raw.provenance && typeof raw.provenance === "object" ? raw.provenance : {},
  };
}
export function rhythmMarks(analysis: MusicAnalysis, downbeats = false): TimingMark[] {
  const key = downbeats ? "downbeats" : "beats";
  const data = analysis.intelligence;
  return data?.authored[key].length
    ? [
        ...data.authored[key],
        ...(data.inferred[key] ?? []).filter(
          (mark) => !data.authored[key].some((corrected) => Math.abs(corrected.at - mark.at) < 0.3),
        ),
      ].sort((a, b) => a.at - b.at)
    : data?.inferred[key].length
      ? data.inferred[key]
      : analysis[key].map((at) => ({
          at,
          confidence: 0.25,
          approved: false,
          source: "librosa v1 estimate",
        }));
}
export function vocalRegions(analysis: MusicAnalysis, words = false): TimedRegion[] {
  const key = words ? "words" : "vocalPhrases";
  const data = analysis.intelligence;
  return data?.authored[key].length
    ? [
        ...data.authored[key],
        ...(data.inferred[key] ?? []).filter(
          (region) =>
            !data.authored[key].some(
              (corrected) => region.start < corrected.end && region.end > corrected.start,
            ),
        ),
      ].sort((a, b) => a.start - b.start)
    : (data?.inferred[key] ?? []);
}
export function regionAt(regions: TimedRegion[], time: number): TimedRegion | undefined {
  return regions.find((region) => time >= region.start && time < region.end);
}
