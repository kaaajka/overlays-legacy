import { describe, expect, it } from "vitest";
import {
  audibleContextTime,
  readVisualSyncOffset,
  synchronizedTime,
} from "../audio/motion/AudioClock";
import { CueLatch, featuresAt } from "../audio/motion/AudioFeatureBus";
import { mapAudio, smoothAudio } from "../audio/motion/audioBindings";
import { normalizeAnalysis } from "../audio/motion/normalizeAnalysis";
import { validateCues } from "../donations/choreography/cues";
import {
  liveMinimums,
  treatmentForMinimum,
  treatments,
} from "../donations/choreography/treatments";
import { motionIntensity, seededRandom } from "./random";
import { QualityGovernor, selectQuality } from "./quality";

describe("audio-authoritative synchronization", () => {
  it("does not accumulate drift after a 500 ms visual stall", () => {
    expect(synchronizedTime(7.5, 2, 0, 10)).toBe(5.5);
    expect(synchronizedTime(8, 2, 0, 10)).toBe(6);
    expect(synchronizedTime(8, 2, 1.5, 10, 40)).toBe(7.54);
  });
  it("bounds scheduled start and end", () => {
    expect(synchronizedTime(1, 2, 0, 10, 100)).toBe(0);
    expect(synchronizedTime(30, 2, 0, 10)).toBe(10);
    expect(readVisualSyncOffset("?visualSyncOffsetMs=900")).toBe(500);
    expect(readVisualSyncOffset("?visualSyncOffsetMs=broken")).toBe(0);
  });
  it("projects valid device timestamps and rejects stale or zero timestamps", () => {
    const clock = {
      currentTime: 10,
      getOutputTimestamp: () => ({ contextTime: 9.8, performanceTime: 1000 }),
    };
    expect(audibleContextTime(clock, 1100)).toBeCloseTo(9.9);
    expect(audibleContextTime(clock, 5000)).toBe(10);
    expect(
      audibleContextTime(
        { ...clock, getOutputTimestamp: () => ({ contextTime: 0, performanceTime: 0 }) },
        1100,
      ),
    ).toBe(10);
    expect(
      audibleContextTime(
        {
          ...clock,
          getOutputTimestamp: () => {
            throw new Error();
          },
        },
        1100,
      ),
    ).toBe(10);
  });
});

describe("authored tiers and feature bus", () => {
  it.each(treatments)("validates all cues and analysis for Donate$tier", (treatment) => {
    expect(validateCues(treatment.cues, treatment.analysis.duration)).toBe(treatment.cues);
    expect(treatment.analysis.schemaVersion).toBe(2);
    expect(treatment.analysis.loudness.length).toBeGreaterThan(100);
    expect(treatment.analysis.bands.bass.length).toBe(treatment.analysis.loudness.length);
    expect(treatment.analysis.beats.every((beat) => beat <= treatment.analysis.duration)).toBe(
      true,
    );
    const hero = treatment.cues.find((c) => c.name === "heroDrop").at;
    const a = featuresAt(treatment.analysis, hero);
    featuresAt(treatment.analysis, hero + 3);
    expect(featuresAt(treatment.analysis, hero)).toEqual(a);
    expect(Object.values(a).every((n) => n >= 0 && n <= 1)).toBe(true);
  });
  it("rejects unsorted, duplicate, missing and out-of-track cues", () => {
    const cues = treatments[0].cues;
    expect(() => validateCues([...cues].reverse(), 10)).toThrow();
    expect(() => validateCues([...cues, cues.at(-1)], 10)).toThrow();
    expect(() => validateCues(cues.slice(0, -1), 10)).toThrow();
    expect(() => validateCues(cues, 1)).toThrow();
  });
  it("keeps live thresholds unchanged and marks Donate8 as shared-track Studio only", () => {
    expect(liveMinimums).toEqual([50, 500, 2500, 5000, 10000, 15000, 30000]);
    expect(treatmentForMinimum(30000).tier).toBe(7);
    expect(treatments[7].analysis).toBe(treatments[6].analysis);
  });
  it("latches every crossed cue across dropped frames, with increasing event IDs", () => {
    const latch = new CueLatch();
    const cues = treatments[5].cues;
    expect(latch.advance(cues, 0).map((e) => e.cue.name)).toEqual(["intro"]);
    const events = latch.advance(cues, 4);
    expect(events.map((e) => e.cue.name)).toContain("heroDrop");
    expect(events.map((e) => e.id)).toEqual([2, 3, 4, 5, 6]);
    expect(latch.advance(cues, 4)).toEqual([]);
    latch.seek(cues, 0);
    expect(latch.advance(cues, 4)[0].id).toBe(7);
  });
  it("supplies neutral features without analysis", () => {
    const features = featuresAt(undefined, 3);
    expect(features.bass).toBe(0);
    expect(features.onset).toBe(0);
    expect(Object.values(features).every(Number.isFinite)).toBe(true);
  });
  it("retains authored duration and neutral features with missing or malformed analysis", () => {
    const degraded = normalizeAnalysis(undefined, 21.76494, "donation-template-06.mpga");
    expect(degraded.duration).toBe(21.76494);
    expect(featuresAt(degraded, 3.90095).bass).toBe(0);
    expect(validateCues(treatments[5].cues, degraded.duration)).toHaveLength(8);
    const malformed = normalizeAnalysis(
      { schemaVersion: 99, beats: [-1, 3, 1, 999], loudness: [NaN, 0.5, 2] },
      4,
      "bad",
    );
    expect(malformed.beats).toEqual([1, 3]);
    expect(malformed.loudness).toEqual([0, 0.5, 1]);
  });
});

describe("detail and bindings", () => {
  it("replays seeded details and bounds optional intensity", () => {
    const a = seededRandom("donation-1");
    const b = seededRandom("donation-1");
    const c = seededRandom("donation-2");
    const first = Array.from({ length: 32 }, a);
    expect(Array.from({ length: 32 }, b)).toEqual(first);
    expect(Array.from({ length: 32 }, c)).not.toEqual(first);
    expect(first.every((n) => n >= 0 && n < 1)).toBe(true);
    expect(motionIntensity(15000, 15000, 30000)).toBe(0);
    expect(motionIntensity(22500, 15000, 30000)).toBe(0.5);
    expect(motionIntensity(1e8, 15000, 30000)).toBe(1);
  });
  it("selects capability fallback and reduces sustained slow rendering", () => {
    expect(selectQuality(false, 16, "high")).toBe("safe");
    expect(selectQuality(true, 4)).toBe("medium");
    expect(selectQuality(true, 16)).toBe("high");
    const governor = new QualityGovernor("high");
    for (let i = 0; i < 120; i++) governor.record(30);
    expect(governor.tier).toBe("medium");
    expect(treatments[5].cues.find((c) => c.name === "heroDrop").at).toBe(3.90095);
  });
  it("remaps, gates, curves and smooths independent of frame count", () => {
    expect(mapAudio(0.5, { input: [0, 1], output: [2, 6], curve: 2 })).toBe(3);
    expect(mapAudio(0.1, { gate: 0.2 })).toBe(0);
    expect(mapAudio(0.1, { deadzone: 0.2, invert: true, scale: 2, offset: 1 })).toBe(3);
    const oneStep = smoothAudio(0, 1, 1, 0.3);
    let manySteps = 0;
    for (let i = 0; i < 60; i++) manySteps = smoothAudio(manySteps, 1, 1 / 60, 0.3);
    expect(manySteps).toBeCloseTo(oneStep, 10);
  });
});
