import { describe, expect, it } from "vitest";
import { normalizeAnalysis } from "./normalizeAnalysis";
import { normalizeIntelligence, rhythmMarks, regionAt, vocalRegions } from "./musicIntelligence";
import a1 from "../../donations/choreography/donate1/analysis.json";
describe("music intelligence v2", () => {
  it("migrates v1 without inventing downbeats or lyrics", () => {
    const analysis = normalizeAnalysis({ ...a1, schemaVersion: 1 }, 8.03342, "source");
    expect(analysis.intelligence).toBeUndefined();
    expect(vocalRegions(analysis, true)).toEqual([]);
    expect(rhythmMarks(analysis, true)).toEqual([]);
  });
  it("sanitizes invalid regions, sorts time and keeps confidence bounded", () => {
    const data = normalizeIntelligence(
      {
        inferred: {
          words: [
            { start: 2, end: 3, text: "A", confidence: 2 },
            { start: -1, end: 1 },
            { start: 1, end: 1.5, text: "B", confidence: 0.5 },
            { start: 3, end: 7 },
          ],
        },
      },
      5,
    );
    expect(data.inferred.words.map((w) => w.text)).toEqual(["B", "A"]);
    expect(data.inferred.words[1].confidence).toBe(1);
    expect(regionAt(data.inferred.words, 1.2)?.text).toBe("B");
    expect(regionAt(data.inferred.words, 1.5)).toBeUndefined();
  });
  it("approved source-matched corrections take precedence; wrong hashes are ignored", () => {
    const raw = {
      inferred: { beats: [{ at: 1 }], words: [{ start: 1, end: 2, text: "guess" }] },
      authored: {
        sourceSha256: "abc",
        beats: [{ at: 1.2, approved: true }],
        words: [
          { start: 1.1, end: 1.8, text: "corrected", approved: true },
          { start: 2, end: 3, text: "unapproved" },
        ],
      },
    };
    const analysis = {
      ...normalizeAnalysis({ ...a1, schemaVersion: 1 }, 8.03342, "source"),
      intelligence: normalizeIntelligence(raw, 8.03342, "abc"),
    };
    expect(rhythmMarks(analysis)[0].at).toBe(1.2);
    expect(vocalRegions(analysis, true)[0].text).toBe("corrected");
    expect(normalizeIntelligence(raw, 8.03342, "wrong").authored.words).toEqual([]);
  });
  it("optional model failures still leave deterministic safe authoring data", () => {
    const data = normalizeIntelligence({ provenance: { stems: { status: "failed" } } }, 10);
    expect(data.measured.drumEvents).toEqual([]);
    expect(data.provenance.stems).toEqual({ status: "failed" });
    expect(normalizeIntelligence(null, 10)).toEqual(normalizeIntelligence(null, 10));
  });
});
