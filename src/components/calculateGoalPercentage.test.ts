import { describe, expect, it } from "vitest";

import { calculateGoalPercentage } from "./calculateGoalPercentage";

describe("calculateGoalPercentage", () => {
  it("returns current divided by goal for valid values", () => {
    expect(calculateGoalPercentage(50, 100)).toBe(0.5);
  });

  it("caps progress at 1", () => {
    expect(calculateGoalPercentage(150, 100)).toBe(1);
  });

  it("returns 0 for zero goal", () => {
    expect(calculateGoalPercentage(50, 0)).toBe(0);
  });

  it("returns 0 for negative goal", () => {
    expect(calculateGoalPercentage(50, -100)).toBe(0);
  });

  it("returns 0 for negative current", () => {
    expect(calculateGoalPercentage(-50, 100)).toBe(0);
  });

  it("returns 0 for NaN and Infinity", () => {
    expect(calculateGoalPercentage(Number.NaN, 100)).toBe(0);
    expect(calculateGoalPercentage(50, Number.NaN)).toBe(0);
    expect(calculateGoalPercentage(Number.POSITIVE_INFINITY, 100)).toBe(0);
    expect(calculateGoalPercentage(50, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
