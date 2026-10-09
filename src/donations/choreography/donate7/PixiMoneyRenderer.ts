import gsap from "gsap";
import {
  Container,
  Particle,
  ParticleContainer,
  Texture,
  WebGLRenderer,
  PixiPlugin,
} from "../../../motion/toolbox/pixi";
import { VERSION, Ticker, Rectangle } from "pixi.js";
import type { QualityTier } from "../../../motion/types";
import { MoneyRainModel, moneyBudgets } from "./MoneyRainModel";
import type { MoneyDepth, MoneyPose } from "./MoneyRainModel";
import { PaperGateFilter } from "./PaperGateFilter";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI({ VERSION }); // Only alpha is used; no plugin-created filters/graphics.
let activeRenderers = 0;
export type MoneyStats = {
  state: "loading" | "ready" | "degraded" | "disposed";
  renderer: "PIXI";
  backend: string;
  reason?: string;
  sprites: number;
  back: number;
  mid: number;
  front: number;
  renderMs: number;
  quality: QualityTier;
  drawCalls: null;
  activeRenderers: number;
  ticker: boolean;
  chapter: string;
  filters: string[];
  backingPixels: number;
};
export class PixiMoneyRenderer {
  readonly model: MoneyRainModel;
  readonly ready: Promise<void>;
  readonly stats: MoneyStats;
  private renderer = new WebGLRenderer();
  private stage = new Container();
  private paperGate = new PaperGateFilter();
  private planes: Record<MoneyDepth, ParticleContainer>;
  private pools: Record<MoneyDepth, Particle[]> = { back: [], mid: [], front: [] };
  private texture: Texture;
  private disposed = false;
  private initialized = false;
  private width = 1920;
  private time = 0;
  private last: MoneyPose[] = [];
  constructor(
    private canvas: HTMLCanvasElement,
    seed: string,
    private quality: QualityTier,
    image: HTMLImageElement,
  ) {
    this.model = new MoneyRainModel(seed);
    this.stats = {
      state: "loading",
      renderer: "PIXI",
      backend: "initializing WebGL",
      sprites: 0,
      back: 0,
      mid: 0,
      front: 0,
      renderMs: 0,
      quality,
      drawCalls: null,
      activeRenderers,
      ticker: false,
      chapter: "clear",
      filters: [],
      backingPixels: 0,
    };
    this.planes = Object.fromEntries(
      (["back", "mid", "front"] as const).map((depth) => {
        const plane = new ParticleContainer({
          dynamicProperties: { position: true, rotation: true, vertex: true, color: true },
        });
        this.stage.addChild(plane);
        return [depth, plane];
      }),
    ) as Record<MoneyDepth, ParticleContainer>;
    // PixiPlugin controls an authored plane envelope on the SAME paused score.
    this.model.timeline.set(this.planes.front, { pixi: { alpha: 1 } }, 0);
    this.model.timeline.to(this.planes.front, { pixi: { alpha: 0.22 }, duration: 0.3 }, 37.65116);
    this.model.timeline.to(this.planes.front, { pixi: { alpha: 1 }, duration: 0.8 }, 38.85);
    this.ready = this.initialize(image);
  }
  private lost = (event: Event) => {
    event.preventDefault();
    this.degrade("WebGL context lost; money disabled, source and speech retained");
  };
  private async initialize(image: HTMLImageElement) {
    try {
      await image.decode();
      if (this.disposed) return;
      await this.renderer.init({
        canvas: this.canvas,
        width: this.width,
        height: 1080,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: false,
        resolution: this.resolution(),
        powerPreference: "high-performance",
        manageImports: false,
        textureGCActive: false,
        gcActive: false,
      });
      this.initialized = true;
      activeRenderers++;
      if (this.disposed) {
        this.releaseRenderer();
        return;
      }
      // Decorative output has no hit testing. Detaching the event target also removes
      // Pixi's optional interaction ticker; renderer init must not create a second RAF.
      this.renderer.events?.setTargetElement(null);
      // Pixi8.22 starts a scheduler ticker even with GC disabled. This finite,
      // explicitly disposed scene has no timed maintenance jobs; remove that listener too.
      this.renderer.scheduler.destroy();
      if (Ticker.system.count === 0) Ticker.system.stop();
      if (Ticker.shared.count === 0) Ticker.shared.stop();
      this.texture = Texture.from(image, true);
      this.canvas.addEventListener("webglcontextlost", this.lost);
      this.stats.state = "ready";
      this.stats.backend = `WebGL${this.renderer.context.webGLVersion}`;
      this.resize(this.width);
      this.render(this.time);
    } catch (error) {
      if (!this.disposed) this.degrade(String(error));
    }
  }
  private resolution() {
    const pixels =
      this.quality === "high" ? 2_100_000 : this.quality === "medium" ? 1_500_000 : 900_000;
    return Math.min(1, Math.sqrt(pixels / (this.width * 1080)));
  }
  resize(width: number) {
    this.width = width;
    if (!this.initialized || this.disposed) return;
    this.renderer.resize(width, 1080, this.resolution());
    this.stage.filterArea = new Rectangle(0, 0, width, 1080);
    this.stats.backingPixels = this.canvas.width * this.canvas.height;
  }
  setQuality(quality: QualityTier) {
    if (quality === this.quality) return;
    this.quality = this.stats.quality = quality;
    this.resize(this.width);
  }
  render(time: number) {
    this.time = time;
    if (this.stats.state !== "ready" || this.disposed) return;
    const started = performance.now();
    try {
      const poses = this.model.sample(time, this.width, this.quality);
      const fold = this.model.envelope.fold;
      const useGate = this.quality !== "safe" && fold > 0.001;
      this.paperGate.fold = fold;
      this.stage.filters = useGate ? [this.paperGate] : null;
      // SAFE retains the same restraint beat using a cheap opacity envelope.
      this.stage.alpha = this.quality === "safe" ? 1 - fold * 0.94 : 1;
      this.stats.filters = useGate ? ["Paper fold matte (custom GLSL)"] : [];
      this.last = poses;
      const counts = { back: 0, mid: 0, front: 0 };
      for (const pose of poses) {
        const pool = this.pools[pose.depth],
          index = counts[pose.depth]++;
        if (!pool[index]) {
          pool[index] = new Particle({ texture: this.texture, anchorX: 0.5, anchorY: 0.5 });
          this.planes[pose.depth].addParticle(pool[index]);
        }
        Object.assign(pool[index], {
          x: pose.x,
          y: pose.y,
          scaleX: pose.scaleX,
          scaleY: pose.scaleY,
          rotation: pose.rotation,
          alpha: pose.alpha,
        });
      }
      for (const depth of ["back", "mid", "front"] as const)
        for (let i = counts[depth]; i < this.pools[depth].length; i++)
          this.pools[depth][i].alpha = 0;
      this.renderer.render({ container: this.stage, clear: true });
      Object.assign(this.stats, counts, {
        sprites: poses.length,
        renderMs: performance.now() - started,
        chapter: this.model.chapter(time),
        activeRenderers,
      });
    } catch (error) {
      this.degrade(String(error));
    }
  }
  snapshot() {
    return {
      ...this.stats,
      activeRenderers,
      ticker: Ticker.system.started || Ticker.shared.started,
      tickerListeners: { system: Ticker.system.count, shared: Ticker.shared.count },
      budget: moneyBudgets[this.quality],
    };
  }
  // Used by deterministic/distribution QA; no state mutation or clock ownership.
  poses() {
    return this.last.map((pose) => ({ ...pose }));
  }
  clear() {
    this.time = 0;
    this.last = [];
    this.stats.sprites = this.stats.back = this.stats.mid = this.stats.front = 0;
    if (this.initialized && !this.disposed) this.renderer.clear();
  }
  private releaseRenderer() {
    this.canvas.removeEventListener("webglcontextlost", this.lost);
    if (this.initialized) {
      this.initialized = false;
      activeRenderers--;
      this.renderer.destroy({ removeView: false });
      if (Ticker.system.count === 0) Ticker.system.stop();
      if (Ticker.shared.count === 0) Ticker.shared.stop();
    }
  }
  private degrade(reason: string) {
    this.stats.state = "degraded";
    this.stats.backend = "unavailable";
    this.stats.reason = reason;
    this.stats.sprites = this.stats.back = this.stats.mid = this.stats.front = 0;
    this.stats.filters = [];
    this.last = [];
    this.releaseRenderer();
    this.canvas.width = this.canvas.height = 1;
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stats.state = "disposed";
    this.model.dispose();
    this.releaseRenderer();
    this.stage.destroy({ children: true });
    this.paperGate.destroy();
    this.texture?.destroy(true);
    this.last = [];
    this.canvas.width = this.canvas.height = 1;
  }
}
