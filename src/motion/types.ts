export type Band = "subBass" | "bass" | "lowMid" | "mid" | "upperMid" | "presence" | "brilliance";
export type MusicAnalysis = {
  schemaVersion: 1;
  source: string;
  duration: number;
  bpm: number;
  beats: number[];
  downbeats: number[];
  onsets: { at: number; strength: number }[];
  sampleInterval: number;
  loudness: number[];
  bands: Record<Band, number[]>;
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
