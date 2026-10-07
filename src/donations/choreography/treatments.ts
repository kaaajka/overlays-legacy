import type { MotionTreatment } from "../../motion/types";
import { validateCues } from "./cues";
import { normalizeAnalysis } from "../../audio/motion/normalizeAnalysis";
import a1 from "./donate1/analysis.json";
import a2 from "./donate2/analysis.json";
import a3 from "./donate3/analysis.json";
import a4 from "./donate4/analysis.json";
import a5 from "./donate5/analysis.json";
import a6 from "./donate6/analysis.json";
import a7 from "./donate7/analysis.json";
import { cues as c1 } from "./donate1/cues";
import { cues as c2 } from "./donate2/cues";
import { cues as c3 } from "./donate3/cues";
import { cues as c4 } from "./donate4/cues";
import { cues as c5 } from "./donate5/cues";
import { cues as c6 } from "./donate6/cues";
import { cues as c7 } from "./donate7/cues";
import { cues as c8 } from "./donate8/cues";
import { choreography as d1 } from "./donate1/choreography";
import { choreography as d2 } from "./donate2/choreography";
import { choreography as d3 } from "./donate3/choreography";
import { choreography as d4 } from "./donate4/choreography";
import { choreography as d5 } from "./donate5/choreography";
import { choreography as d6 } from "./donate6/choreography";
import { choreography as d7 } from "./donate7/choreography";
import { choreography as d8 } from "./donate8/choreography";

const durations = [8.03342, 15.46558, 11.6, 12.84544, 16.34508, 21.76494, 46.23397];
const analyses = [a1, a2, a3, a4, a5, a6, a7].map((analysis, i) =>
  normalizeAnalysis(analysis, durations[i], `donation-template-${i + 1}`),
);
analyses.push(analyses[6]);
const cues = [c1, c2, c3, c4, c5, c6, c7, c8];
const identities = [
  ["Turkey two-step", "signal", "#eec692", "#fff2cf", ["DZIĘKI"]],
  ["Masked dance floor", "ember", "#e84531", "#ffcab8", ["DZIĘKI", "ZA WSPARCIE"]],
  ["Rodent rave", "prism", "#ce9759", "#ffe297", ["OMG"]],
  ["Deadpan paper roll", "vault", "#eee4d4", "#f4eee1", ["WOWOW!!", "TAK O!"]],
  ["Arms-wide ovation", "holy", "#e09055", "#ffe0a1", ["HOLY", "MOLY"]],
  ["Heart from the booth", "halo", "#ee7998", "#ffd5df", ["HALO", "HALO"]],
  ["Webcam overload", "takeover", "#bdb6b0", "#ece9dd", ["CO ZA", "POJEB!!!"]],
  ["Say my name · shared Donate7 track", "name", "#bcb8ff", "#f1eaff", ["SAY MY", "NAME"]],
] as const;

export const treatments: MotionTreatment[] = identities.map(
  ([title, motif, color, secondary, words], i) => ({
    tier: i + 1,
    title,
    motif,
    color,
    secondary,
    words: [...words],
    analysis: analyses[i],
    cues: validateCues(cues[i], analyses[i].duration),
  }),
);
export const directors = [d1, d2, d3, d4, d5, d6, d7, d8];

// Matches the existing authoritative configuration by minimum, with no invented tier.
export const liveMinimums = [50, 500, 2500, 5000, 10000, 15000, 30000];
export function treatmentForMinimum(minimum: number): MotionTreatment {
  return treatments[Math.max(0, liveMinimums.indexOf(minimum))];
}
