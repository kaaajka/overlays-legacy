import { describe, expect, it } from "vitest";
import { MoneyRainModel, moneyBudgets } from "./MoneyRainModel";

describe("Pixi money rain's absolute-time inventory", () => {
  it("reconstructs direct, backward, restarted and dropped-frame poses without integration", () => {
    const model = new MoneyRainModel("qa"),
      fresh = new MoneyRainModel("qa");
    const expected = fresh.sample(38.4);
    for (const t of [2, 38.4, 42, 7, 0, 38.4]) model.sample(t);
    expect(model.sample(38.4)).toEqual(expected);
    for (let at = 0; at <= 38.4; at += 0.3) model.sample(at);
    expect(model.sample(38.4)).toEqual(expected);
    const other = new MoneyRainModel("other");
    expect(other.sample(38.4)).not.toEqual(expected);
    for (const m of [model, fresh, other]) m.dispose();
  });
  it.each([
    "high",
    "medium",
    "safe",
  ] as const)("%s covers the complete frame during heavy rain and stays bounded", (quality) => {
    const model = new MoneyRainModel("qa");
    for (const width of [1728, 1920, 2580, 3840]) {
      const population = [16.8, 24.5, 38.4, 40.3, 42].flatMap((t) => {
        const poses = model.sample(t, width, quality);
        expect(poses.length).toBeLessThanOrEqual(moneyBudgets[quality]);
        return poses.filter((p) => p.y >= 0 && p.y <= 1080 && p.x >= 0 && p.x <= width);
      });
      for (const region of [
        (p) => p.x < width * 0.2,
        (p) => p.x > width * 0.8,
        (p) => p.x > width * 0.4 && p.x < width * 0.6,
        (p) => p.y < 270,
        (p) => p.y > 400 && p.y < 700,
        (p) => p.y > 810,
      ])
        expect(population.filter(region).length).toBeGreaterThan(4);
      expect(population.some((p) => p.depth === "front")).toBe(true);
      expect(population.filter((p) => p.depth === "mid").length).toBeGreaterThan(
        population.filter((p) => p.depth === "back").length,
      );
    }
    expect(model.sample(0)).toEqual([]);
    expect(model.sample(46.23397)).toEqual([]);
    model.dispose();
  });
  it("paper falls down, drifts less than it falls, and never sees donor geometry", () => {
    const model = new MoneyRainModel("qa");
    const first = model.sample(24, 1920),
      second = new Map(model.sample(24.1, 1920).map((p) => [p.id, p]));
    for (const p of first) {
      const next = second.get(p.id);
      if (!next) continue;
      expect(next.y).toBeGreaterThan(p.y);
      expect(Math.abs(next.x - p.x)).toBeLessThan((next.y - p.y) * 0.8);
    }
    expect(new Set(first.map((p) => p.rotation.toFixed(2))).size).toBeGreaterThan(50);
    expect(new Set(first.map((p) => p.scaleY.toFixed(2))).size).toBeGreaterThan(20);
    model.dispose();
  });
  it("the chapter fold is an absolute score envelope, fully reversible and absent at frame zero", () => {
    const model = new MoneyRainModel("fold");
    model.sample(29.8);
    expect(model.envelope.fold).toBe(1);
    model.sample(31);
    const partial = model.envelope.fold;
    expect(partial).toBeGreaterThan(0);
    expect(partial).toBeLessThan(1);
    model.sample(40);
    expect(model.envelope.fold).toBe(0);
    model.sample(31);
    expect(model.envelope.fold).toBe(partial);
    model.sample(0);
    expect(model.envelope.fold).toBe(0);
    model.dispose();
  });
});
