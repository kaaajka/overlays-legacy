import type { MotionTreatment, QualityTier } from "../types";
import { seededRandom } from "../random";
import { rhythmMarks } from "../../audio/motion/musicIntelligence";
import { spectacleCues } from "../../donations/choreography/donate7/show";

export function cashWaves(treatment: MotionTreatment) {
  if (treatment.tier < 5 || treatment.tier > 7) return [];
  if (treatment.tier === 7)
    return spectacleCues
      .filter((cue) => cue.kind === "bill")
      .map((cue) => ({ at: cue.at, intensity: cue.power }))
      .sort((a, b) => a.at - b.at);
  const cue = (name: string) => treatment.cues.find((cue) => cue.name === name).at;
  const hero = cue("heroDrop");
  const waves = [
    { at: hero, intensity: 1 },
    { at: hero + 0.48, intensity: 0.6 },
  ];
  for (const [index, mark] of rhythmMarks(treatment.analysis, true).entries()) {
    if (mark.at < hero + 1 || mark.at > treatment.analysis.duration - 2 || index % 2) continue;
    waves.push({ at: mark.at, intensity: treatment.tier === 6 ? 0.25 : 0.5 });
  }
  for (const authored of treatment.analysis.intelligence?.authored.cues ?? [])
    if (authored.group === "money") waves.push({ at: authored.at, intensity: authored.intensity });
  return waves.sort((a, b) => a.at - b.at);
}
/** Absolute-time bills, no simulation accumulation or private RAF. SAFE preserves a smaller cash signature. */
export class CashRenderer {
  private context: CanvasRenderingContext2D;
  private random: number[];
  private waves: ReturnType<typeof cashWaves>;
  private width = 1920;
  private donor = { x: 960, y: 540, width: 480, height: 180 };
  setDonor(bounds: { x: number; y: number; width: number; height: number }) {
    this.donor = bounds;
  }
  constructor(
    private canvas: HTMLCanvasElement,
    private treatment: MotionTreatment,
    seed: string,
    private quality: QualityTier,
    private depth: "back" | "front" = "back",
  ) {
    this.context = canvas.getContext("2d");
    if (!this.context) throw new Error("Canvas2D unavailable");
    const random = seededRandom(seed);
    this.random = Array.from({ length: 400 }, () => random());
    this.waves = cashWaves(treatment);
    canvas.width = 1920;
    canvas.height = 1080;
  }
  setQuality(quality: QualityTier) {
    this.quality = quality;
  }
  resize(width: number) {
    this.width = width;
    // Geometry is independent of backing resolution; cap large desktop canvases.
    const scale = Math.min(1, Math.sqrt(4_000_000 / (width * 1080)));
    this.canvas.width = Math.round(width * scale);
    this.canvas.height = Math.round(1080 * scale);
    this.context.setTransform(scale, 0, 0, scale, 0, 0);
  }
  clear() {
    this.context.clearRect(0, 0, this.width, 1080);
  }
  render(time: number, intensity: number) {
    this.clear();
    const c = this.context;
    const tier = this.treatment.tier;
    const count = this.quality === "safe" ? 14 : this.quality === "medium" ? 40 : 72;
    const limit = tier === 6 ? 12 : count;
    // Density lives in brief authored waves, never continuous passive rain.
    let drawn = 0;
    for (const wave of this.waves) {
      const age = time - wave.at;
      if (age < 0 || age > 2.8) continue;
      for (
        let index = 0;
        index < Math.ceil(limit * wave.intensity * (0.7 + intensity * 0.3));
        index++
      ) {
        const a = this.random[index * 4],
          b = this.random[index * 4 + 1],
          d = this.random[index * 4 + 2];
        const t = age - b * 0.25;
        if (t < 0) continue;
        // Stable physical depth, never disappear when entering an invisible text rectangle.
        if ((index % 7 === 0 ? "front" : "back") !== this.depth) continue;
        let x: number, y: number;
        if (tier === 5) {
          x = this.donor.x + (a - 0.5) * this.width * 0.47 * t;
          y = this.donor.y + 240 - 750 * t + 340 * t * t;
        } else if (tier === 6) {
          x = this.donor.x + 480 - t * 380 + (a - 0.5) * 140;
          y = this.donor.y + 180 - Math.sin(Math.min(1, t / 2.3) * Math.PI) * 150 + (b - 0.5) * 100;
        } else {
          x = a * this.width + (b - 0.5) * 270 * t;
          y = -60 + t * (380 + d * 170);
        }
        if (x < -100 || x > this.width + 100 || y > 1180) continue;
        if (drawn++ >= limit) return;
        c.save();
        c.translate(x, y);
        c.rotate((a - 0.5) * 3 + t * (b - 0.5) * 2);
        c.globalAlpha =
          Math.min(0.78, wave.intensity) * Math.min(1, t * 8) * Math.max(0, 1 - t / 2.8);
        // Continuous paths at both depths; avoid a bright wall behind white donor copy.
        const dx = Math.max(0, Math.abs(x - this.donor.x) - this.donor.width / 2);
        const dy = Math.max(0, Math.abs(y - this.donor.y) - this.donor.height / 2);
        const minimum = this.depth === "front" ? 0.35 : 0.14;
        c.globalAlpha *= minimum + (1 - minimum) * Math.min(1, Math.hypot(dx, dy) / 160);
        c.fillStyle = tier === 6 ? "#ffd5df" : "#f8e2b3";
        c.strokeStyle = "#524133";
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(-31, -15, 62, 30, 3);
        c.fill();
        c.stroke();
        c.strokeRect(-24, -10, 48, 20);
        c.beginPath();
        c.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
        c.stroke();
        c.font = "bold 9px Poppins";
        c.fillStyle = "#524133";
        c.textAlign = "center";
        c.fillText("zł", 0, 3);
        c.restore();
      }
    }
  }
  dispose() {
    this.clear();
    this.canvas.width = 1;
    this.canvas.height = 1;
  }
}
