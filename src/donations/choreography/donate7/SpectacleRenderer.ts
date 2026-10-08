import type { AudioFeatures, EffectParameters, QualityTier } from "../../../motion/types";
import { seededRandom } from "../../../motion/random";
import { spectacleBudgets, spectacleCues } from "./show";
import type { SpectacleCue } from "./show";

type Depth = "back" | "mid" | "front";
type Geometry = { x: number; y: number; width: number; height: number };
type Particle = {
  cue: SpectacleCue;
  index: number;
  a: number;
  b: number;
  c: number;
  d: number;
  depth: Depth;
};
const palette = ["#f3a08f", "#ed7eaa", "#ffe7c7", "#66d4dd", "#fff4e5"];
const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Donate7's finite show inventory. Positions are analytic: seek history never enters the frame. */
export class SpectacleRenderer {
  private contexts: Record<Depth, CanvasRenderingContext2D>;
  private inventory: Particle[];
  private width = 1920;
  private donor: Geometry = { x: 650, y: 650, width: 500, height: 220 };
  stats = {
    particles: 0,
    back: 0,
    mid: 0,
    front: 0,
    renderMs: 0,
    backingPixels: 0,
  };

  constructor(
    private canvases: Record<Depth, HTMLCanvasElement>,
    seed: string,
    private quality: QualityTier,
    private emote: HTMLImageElement,
  ) {
    this.contexts = Object.fromEntries(
      Object.entries(canvases).map(([depth, canvas]) => {
        const context = canvas.getContext("2d");
        if (!context) throw Error("Donate7 spectacle requires Canvas2D");
        return [depth, context];
      }),
    ) as Record<Depth, CanvasRenderingContext2D>;
    const random = seededRandom(`${seed}:donate7-show`);
    this.inventory = spectacleCues.flatMap((cue) =>
      Array.from({ length: cue.count }, (_, index) => ({
        cue,
        index,
        a: random(),
        b: random(),
        c: random(),
        d: random(),
        depth:
          cue.kind === "spark"
            ? "back"
            : index % 9 === 0
              ? "front"
              : index % 3 === 0
                ? "mid"
                : "back",
      })),
    );
    this.resize(1920);
  }

  setQuality(quality: QualityTier) {
    if (this.quality === quality) return;
    this.quality = quality;
    this.resize(this.width);
  }
  setDonor(geometry: Geometry) {
    this.donor = geometry;
  }
  resize(width: number) {
    this.width = width;
    const scale = Math.min(1, Math.sqrt(spectacleBudgets[this.quality].pixels / (width * 1080)));
    for (const [depth, canvas] of Object.entries(this.canvases)) {
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(1080 * scale);
      this.contexts[depth as Depth].setTransform(scale, 0, 0, scale, 0, 0);
    }
    this.stats.backingPixels = Object.values(this.canvases).reduce(
      (sum, c) => sum + c.width * c.height,
      0,
    );
  }
  clear() {
    for (const context of Object.values(this.contexts)) {
      // Rounded backing dimensions can extend beyond the logical transform by a fraction of a pixel.
      // Clear in backing coordinates so edge pixels never retain a previous seek's particles.
      context.save();
      context.resetTransform();
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.restore();
    }
    this.stats.particles = this.stats.back = this.stats.mid = this.stats.front = 0;
  }
  render(time: number, effects: EffectParameters, features: AudioFeatures) {
    const start = performance.now();
    this.clear();
    if (time <= 0 || time >= 46.23397) return;
    const budget = spectacleBudgets[this.quality];
    const active = spectacleCues.filter(
      (cue) => time >= cue.at - (cue.kind === "spark" ? 0.32 : 0) && time < cue.at + cue.life,
    );
    const total = active.reduce((sum, cue) => sum + cue.count, 0);
    const ratio = Math.min(
      this.quality === "high" ? 1 : this.quality === "medium" ? 0.58 : 0.24,
      budget.particles / Math.max(1, total),
    );
    // Per-emitter quotas preserve all signature types even when density is reduced.
    for (const particle of this.inventory) {
      const { cue, index, a, b, c: r, d, depth } = particle;
      if (!active.includes(cue) || index >= Math.max(1, Math.floor(cue.count * ratio))) continue;
      const age = time - cue.at;
      const delay = cue.kind === "spark" ? 0 : depth === "front" ? b * 0.6 : b * 0.12;
      const t = age - delay;
      if (t < 0 && cue.kind !== "spark") continue;
      if (this.stats.particles >= budget.particles) break;
      const context = this.contexts[depth];
      const side = index % 2 ? 1 : -1;
      const origin = side < 0 ? 0 : this.width;
      const depthScale = depth === "back" ? 0.6 : depth === "mid" ? 1 : 2.2;
      let x: number, y: number;
      if (cue.kind === "spark") {
        const cx = this.width * (cue.emitter === "left" ? 0.19 : 0.81);
        const cy = cue.emitter === "left" ? 255 : 335;
        if (t < 0) {
          if (index !== 0) continue;
          const launch = clamp((t + 0.32) / 0.32);
          context.strokeStyle = "#ffe7c7";
          context.lineWidth = 2;
          context.globalAlpha = launch * 0.65;
          context.beginPath();
          context.moveTo(cx, 880 - (880 - cy) * Math.max(0, launch - 0.07));
          context.lineTo(cx, 880 - (880 - cy) * launch);
          context.stroke();
          if (index === 0) this.stats.particles++;
          continue;
        }
        const secondary = index % 5 === 0 ? 0.23 : 0;
        const life = Math.max(0, t - secondary);
        const angle = (index / cue.count) * Math.PI * 2 + a * 0.08;
        const speed = (135 + b * 190) * cue.power;
        const radius = speed * (1 - Math.exp(-life * 1.9));
        x = cx + Math.cos(angle) * radius;
        y = cy + Math.sin(angle) * radius + 65 * life * life;
        context.globalAlpha = clamp(1 - t / cue.life) * (secondary ? clamp(life * 10) : 1) * 0.85;
        context.strokeStyle = palette[index % palette.length];
        context.lineWidth = secondary ? 1.8 : 2.6;
        context.beginPath();
        context.moveTo(
          x - Math.cos(angle) * (budget.trails ? 17 : 3),
          y - Math.sin(angle) * (budget.trails ? 17 : 3),
        );
        context.lineTo(x, y);
        context.stroke();
        context.fillStyle = "#fff4e5";
        context.fillRect(x - 1.5, y - 1.5, 3, 3);
      } else {
        const drag = (1 - Math.exp(-t * 0.52)) / 0.52;
        if (cue.emitter === "top") {
          x = a * this.width + Math.sin(t * 2 + b * 6) * (20 + r * 30);
          y = -70 + t * (210 + d * 130) + 55 * t * t;
        } else if (cue.emitter === "sweep" && depth === "front") {
          x = -160 + (this.width + 320) * (t / 1.65 + a * 0.22);
          // Foreground routes are authored around real donor geometry, never deleted in a rectangle.
          y =
            side < 0
              ? Math.max(80, this.donor.y - this.donor.height / 2 - 370) +
                b * 80 +
                Math.sin(t * 2 + a * 6) * 30
              : this.donor.y + this.donor.height / 2 + 180 + b * 160 + Math.sin(t * 2 + a * 6) * 35;
        } else {
          x = origin - side * (190 + a * 740) * drag * cue.power;
          y = 1020 - (620 + r * 400) * t * cue.power + (165 + d * 50) * t * t;
        }
        // Continuous trajectory deflection around measured donor bounds, never a mask or alpha hole.
        if (cue.kind !== "streamer") {
          const dx = (x - this.donor.x) / (this.donor.width / 2 + 90);
          const dy = (y - this.donor.y) / (this.donor.height / 2 + 95);
          const influence = Math.exp(-(dx * dx + dy * dy) * 1.3);
          x += Math.tanh(dx * 3) * influence * 180;
          y += Math.tanh(dy * 3) * influence * 130;
        }
        context.save();
        context.translate(x, y);
        context.rotate(a * 6 + t * (b - 0.5) * 5);
        context.globalAlpha =
          (depth === "back" ? 0.48 : depth === "mid" ? 0.84 : 0.92) *
          clamp(t * 12) *
          clamp((cue.life - age) / 0.6) *
          (0.9 + features.onset * 0.1);
        context.scale(depthScale, depthScale);
        context.fillStyle = palette[index % palette.length];
        if (cue.kind === "bill") {
          context.scale(1, 0.55 + Math.abs(Math.cos(t * 3 + d * 6)) * 0.45);
          context.fillStyle = "#f7dfad";
          context.strokeStyle = "#654c42";
          context.lineWidth = 1.5;
          context.beginPath();
          context.roundRect(-32, -15, 64, 30, 3);
          context.fill();
          context.stroke();
          context.strokeRect(-25, -10, 50, 20);
          context.beginPath();
          context.ellipse(0, 0, 9, 10, 0, 0, Math.PI * 2);
          context.stroke();
          context.fillStyle = "#654c42";
          context.font = "700 10px Poppins";
          context.textAlign = "center";
          context.fillText("zł", 0, 3);
          if (budget.trails && depth === "front") {
            context.globalAlpha *= 0.14;
            context.fillStyle = "#ffe7c7";
            context.fillRect(-95, -9, 53, 18);
          }
        } else if (cue.kind === "streamer") {
          context.strokeStyle = palette[index % palette.length];
          context.lineWidth = 6;
          context.beginPath();
          const height = 120 + b * 150;
          const point = (length: number) => {
            const phase = length * 13 + t * 3 + a * 6;
            return {
              x: Math.sin(phase) * (10 + length * 32),
              y: length * height,
              tangent: Math.cos(phase) * 13 * (10 + length * 32) + Math.sin(phase) * 32,
            };
          };
          let previous = point(0);
          context.moveTo(previous.x, previous.y);
          for (let p = 1; p <= 16; p++) {
            const next = point(p / 16);
            context.bezierCurveTo(
              previous.x + previous.tangent / 48,
              previous.y + height / 48,
              next.x - next.tangent / 48,
              next.y - height / 48,
              next.x,
              next.y,
            );
            previous = next;
          }
          context.stroke();
        } else if (index % 32 === 0 && this.emote?.complete && this.emote.naturalWidth) {
          context.drawImage(this.emote, -16, -16, 32, 32);
        } else {
          const w = index % 3 === 0 ? 4 : 8 + a * 7;
          const h = index % 3 === 0 ? 30 : 7 + b * 9;
          context.scale(0.35 + Math.abs(Math.cos(t * 5 + r * 4)) * 0.65, 1);
          context.fillRect(-w / 2, -h / 2, w, h);
        }
        context.restore();
      }
      this.stats.particles++;
      this.stats[depth]++;
    }
    // GSAP's chapter envelope is authoritative for the final release, not an independent ticker.
    if (effects.travel < 1)
      for (const context of Object.values(this.contexts)) {
        context.save();
        context.globalCompositeOperation = "destination-in";
        context.globalAlpha = clamp(effects.travel);
        context.fillStyle = "#000";
        context.fillRect(0, 0, this.width, 1080);
        context.restore();
      }
    this.stats.renderMs = performance.now() - start;
  }
  dispose() {
    this.clear();
    this.inventory = [];
    for (const canvas of Object.values(this.canvases)) canvas.width = canvas.height = 1;
  }
}
