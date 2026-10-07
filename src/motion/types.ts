export type Band = "subBass" | "bass" | "lowMid" | "mid" | "upperMid" | "presence" | "brilliance";
export type MusicAnalysis = {
  schemaVersion: 1 | 2;
  source: string;
  duration: number;
  bpm: number;
  beats: number[];
  downbeats: number[];
  onsets: { at: number; strength: number }[];
  sampleInterval: number;
  loudness: number[];
  bands: Record<Band, number[]>;
  sourceSha256?: string;
  intelligence?: MusicIntelligence;
};
export type TimingMark = { at: number; confidence: number; approved: boolean; source: string };
export type TimedRegion = {
  start: number;
  end: number;
  text?: string;
  label?: string;
  confidence: number;
  approved: boolean;
  source: string;
};
export type MusicIntelligence = {
  measured: {
    waveform: number[][];
    drums: number[];
    vocals: number[];
    drumEvents: {
      at: number;
      kind: string;
      strength: number;
      confidence: number;
      source: string;
    }[];
  };
  inferred: {
    beats: TimingMark[];
    downbeats: TimingMark[];
    sections: TimedRegion[];
    vocalPhrases: TimedRegion[];
    words: TimedRegion[];
  };
  authored: {
    sourceSha256?: string;
    beats: TimingMark[];
    downbeats: TimingMark[];
    sections: TimedRegion[];
    vocalPhrases: TimedRegion[];
    words: TimedRegion[];
    cues: { at: number; name: string; intensity: number; group: string }[];
  };
  provenance: Record<string, unknown>;
};
export type CueName =
  | "intro"
  | "firstImpact"
  | "donorReveal"
  | "buildStart"
  | "preDrop"
  | "heroDrop"
  | "settle"
  | "information";
export type Cue = { name: CueName; at: number; intensity: number };
export type Motif = "signal" | "ember" | "prism" | "vault" | "holy" | "halo" | "takeover" | "name";
export type MotionTreatment = {
  tier: number;
  title: string;
  motif: Motif;
  color: string;
  secondary: string;
  words: string[];
  cues: Cue[];
  analysis: MusicAnalysis;
};
export type AudioFeatures = Record<Band, number> & {
  loudness: number;
  onset: number;
  kick: number;
  beatPhase: number;
  barPhase: number;
};
export type EffectParameters = {
  atmosphere: number;
  burst: number;
  tension: number;
  ring: number;
  travel: number;
};
export type QualityTier = "high" | "medium" | "safe";
