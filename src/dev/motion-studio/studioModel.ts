export { lifecyclePlan } from "../../donations/donationTiming";
import type { MotionTreatment } from "../../motion/types";
import { mediaAssets } from "../../motion/media/SourceMedia";

/** Human-facing PLN input: round decimal digits as integers, never multiply a binary float. */
export function parsePln(value: string): number | undefined {
  const match = /^\s*(\d{1,10})(?:[,.](\d{1,2}))?\s*$/.exec(value);
  if (!match) return undefined;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : undefined;
}
export function timecode(seconds: number): string {
  const ms = Math.round(Math.max(0, seconds) * 1000);
  return `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
}
export function mediaRegions(treatment: MotionTreatment) {
  const asset = mediaAssets[treatment.tier - 1];
  if (!asset) return [];
  const hero = treatment.cues.find((cue) => cue.name === "heroDrop").at;
  const pre = treatment.cues.find((cue) => cue.name === "preDrop").at;
  const start = Math.max(pre, hero - (asset.holdBeforeHero ?? 0.1));
  const end = hero + (asset.holdAfterHero ?? 0.18);
  return [
    { start: 0, end: start, label: "source loop" },
    { start, end, label: `pose ${asset.heroSourceTime.toFixed(3)} s · HOLD` },
    { start: end, end: treatment.analysis.duration, label: "resume from pose → loop" },
  ];
}
export const stressPresets = {
  nickname: {
    short: "M",
    normal: "Kaaajka",
    long: "BardzoDługiNickZPolskimiZnakami",
    extreme: "PotężnyWspierającySpołecznośćKaaajkiBezKońca".repeat(3),
  },
  message: {
    short: "Dzięki!",
    normal: "Kaaajka, dzięki za stream i świetną społeczność!",
    long: "Dzięki za wszystkie wspólne wieczory. ".repeat(30) + "KONIEC WIADOMOŚCI",
    extreme: "Pełna wiadomość musi pozostać czytelna. ".repeat(160) + "OSTATNIA LINIA",
  },
  amount: { long: "12345.67", extreme: "9876543210.99" },
};
