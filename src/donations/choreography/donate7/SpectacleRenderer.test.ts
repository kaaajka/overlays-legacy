import { describe, expect, it } from "vitest";
import { SpectacleRenderer } from "./SpectacleRenderer";
import { spectacleBudgets, spectacleCues } from "./show";
const features = { onset: 0.8 } as Parameters<SpectacleRenderer["render"]>[2];
const effects = { atmosphere: 0, burst: 0, tension: 0, ring: 0, travel: 1 };
function fixture(quality: "high" | "medium" | "safe" = "high", seed = "fixed") {
  const calls: unknown[][] = [];
  const canvas = () => {
    const surface = { width: 0, height: 0, getContext: () => context };
    const context = new Proxy(
      {},
      {
        set(target, prop, value) {
          calls.push(["set", String(prop), value]);
          return Reflect.set(target, prop, value);
        },
        get(_target, prop) {
          if (prop === "canvas") return surface;
          return (...args: unknown[]) => calls.push([String(prop), ...args]);
        },
      },
    );
    return surface as unknown as HTMLCanvasElement;
  };
  const canvases = { back: canvas(), mid: canvas(), front: canvas() };
  const renderer = new SpectacleRenderer(canvases, seed, quality, null);
  return { renderer, canvases, calls };
}
describe("Donate7 deterministic spectacle", () => {
  it("reconstructs the same drawing after a backward seek and changes with seed", () => {
    const { renderer, calls } = fixture();
    calls.length = 0;
    renderer.render(38.45, effects, features);
    const first = JSON.stringify(calls);
    renderer.render(14, effects, features);
    calls.length = 0;
    renderer.render(38.45, effects, features);
    expect(JSON.stringify(calls)).toBe(first);
    const other = fixture("high", "other");
    other.calls.length = 0;
    other.renderer.render(38.45, effects, features);
    expect(JSON.stringify(other.calls)).not.toBe(first);
  });
  it.each([
    "high",
    "medium",
    "safe",
  ] as const)("%s preserves all three depths and bounds every frame and backing size", (quality) => {
    const { renderer, canvases } = fixture(quality);
    renderer.resize(3840);
    let peak = 0;
    for (let at = 0; at < 47; at += 0.071) {
      renderer.render(at, effects, features);
      peak = Math.max(peak, renderer.stats.particles);
      expect(renderer.stats.particles).toBeLessThanOrEqual(spectacleBudgets[quality].particles);
    }
    renderer.render(38.45, effects, features);
    expect(renderer.stats.back).toBeGreaterThan(0);
    expect(renderer.stats.mid).toBeGreaterThan(0);
    expect(renderer.stats.front).toBeGreaterThan(0);
    expect(peak).toBeGreaterThan(30);
    expect(renderer.stats.backingPixels).toBeLessThan(spectacleBudgets[quality].pixels * 3 + 5000);
    renderer.dispose();
    expect(Object.values(canvases).every((c) => c.width === 1 && c.height === 1)).toBe(true);
  });
  it("has a particle-free false calm, four finite fireworks and clean zero/end", () => {
    expect(spectacleCues.filter((c) => c.kind === "spark")).toHaveLength(4);
    const { renderer } = fixture();
    for (const at of [0, 34.2, 46.23397]) {
      renderer.render(at, effects, features);
      expect(renderer.stats.particles).toBe(0);
    }
  });
  it("clears the complete rounded backing buffer, including fractional logical edges", () => {
    const { renderer, canvases, calls } = fixture();
    renderer.resize(3840);
    calls.length = 0;
    renderer.clear();
    const clear = calls.filter(([method]) => method === "clearRect");
    expect(clear).toEqual(
      Object.values(canvases).map((c) => ["clearRect", 0, 0, c.width, c.height]),
    );
    expect(calls.filter(([method]) => method === "resetTransform")).toHaveLength(3);
  });
});
