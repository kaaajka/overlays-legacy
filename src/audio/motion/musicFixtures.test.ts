import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { treatments } from "../../donations/choreography/treatments";
import { normalizeAnalysis } from "./normalizeAnalysis";
it.each(
  treatments.slice(0, 7),
)("Donate$tier has deterministic source-matched v2 fixtures and honest inference", (treatment) => {
  const raw = JSON.parse(
    readFileSync(`src/donations/choreography/donate${treatment.tier}/analysis.json`, "utf8"),
  );
  const original = readFileSync(`public/assets/donations/audio/${raw.source}`);
  expect(createHash("sha256").update(original).digest("hex")).toBe(raw.sourceSha256);
  const a = normalizeAnalysis(raw, raw.duration, raw.source),
    b = normalizeAnalysis(raw, raw.duration, raw.source);
  expect(a).toEqual(b);
  expect(a.intelligence.measured.waveform).toHaveLength(800);
  expect(a.intelligence.provenance.stems["status"]).toBe("ready");
  for (const key of ["beats", "downbeats"]) {
    const list = a.intelligence.inferred[key];
    expect(list.map((mark) => mark.at)).toEqual(list.map((mark) => mark.at).sort((a, b) => a - b));
    expect(
      list.every((mark) => !mark.approved && mark.at >= 0 && mark.at <= a.duration && mark.source),
    ).toBe(true);
  }
  for (const key of ["words", "vocalPhrases"])
    expect(
      a.intelligence.inferred[key].every(
        (region) =>
          region.start >= 0 &&
          region.end > region.start &&
          region.end <= a.duration &&
          !region.approved,
      ),
    ).toBe(true);
  expect(a.intelligence.authored.sourceSha256).toBe(raw.sourceSha256);
  expect(a.intelligence.authored.sections.every((region) => region.approved)).toBe(true);
});
it.skipIf(!existsSync("dist/assets"))(
  "production entry excludes Studio, worker, test speech and heavy authoring imports",
  () => {
    const main = readFileSync("src/main.tsx", "utf8");
    expect(main).toContain("import.meta.env.DEV");
    for (const file of readdirSync("dist/assets").filter((file) => file.endsWith(".js"))) {
      const bundle = readFileSync(`dist/assets/${file}`, "utf8");
      for (const forbidden of [
        "__studio/export",
        "/__studio-assets/speech",
        "render-donation.mjs",
        "demucs_onnx",
        "load_faster_whisper",
      ])
        expect(bundle).not.toContain(forbidden);
    }
  },
);
