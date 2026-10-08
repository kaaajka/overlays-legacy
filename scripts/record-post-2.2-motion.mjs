import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const full = process.argv.includes("--full");
const folder = resolve(`.motion-qa/continuation/${full ? "full-motion" : "normal-motion"}`);
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({
  channel: "chrome",
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const rows = [];
for (let tier = 1; tier <= 7; tier++) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: folder, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(
    `http://127.0.0.1:5173/motion-studio?clean=1&tier=${tier}&background=stream&quality=safe&mode=${full ? "full" : "hero"}`,
  );
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  const meta = await page.evaluate(() => window.motionStudio.exportMetadata());
  const hero = meta.cues.find((c) => c.name === "heroDrop").at;
  // Exact quarter-second authored inspection supplements normal-speed recording.
  for (const offset of [-0.25, 0, 0.25, 0.5, 0.75, 1]) {
    await page.evaluate((at) => window.motionStudio.renderExportAt(at, false), hero + offset);
    await page.waitForFunction(() =>
      [...document.querySelectorAll("video")].every((v) => !v.seeking),
    );
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    await page.screenshot({
      path: resolve(folder, `donate${tier}-hero-${offset}.jpg`),
      type: "jpeg",
      quality: 80,
    });
  }
  await page.evaluate(() => window.motionStudio.seek(0));
  await page.evaluate(
    (full) => (full ? window.motionStudio.playFull() : window.motionStudio.play()),
    full,
  );
  const started = Date.now(),
    samples = [];
  while (true) {
    await page.waitForTimeout(200);
    const state = await page.evaluate(() => window.motionStudio.status());
    samples.push({ time: state.time, phase: state.phase, media: state.media });
    if (!state.playing) {
      assert.equal(state.phase, "complete");
      break;
    }
    assert.ok(Date.now() - started < 90000, "complete alert timeout");
  }
  assert.deepEqual(errors, []);
  const last = samples.at(-1);
  if (full) {
    assert.ok(last.time > meta.duration + 0.65, "Full recording ended at hero boundary");
    for (const clip of meta.currentSpeech)
      assert.ok(
        samples.some((s) => s.phase === `tts-${clip.name}`),
        `Missing ${clip.name} stage`,
      );
  }
  const video = page.video();
  await context.close();
  await video.saveAs(resolve(folder, `donate${tier}-normal.webm`));
  const row = {
    tier,
    wallSeconds: (Date.now() - started) / 1000,
    speech: meta.currentSpeech,
    last,
    samples,
    video: resolve(folder, `donate${tier}-normal.webm`),
  };
  rows.push(row);
  console.log(JSON.stringify({ tier, wallSeconds: row.wallSeconds, last }));
}
writeFileSync(
  resolve(folder, "runtime.json"),
  JSON.stringify(
    {
      browser: await browser.version(),
      capture:
        "1280×720 recorded from1920×1080 viewport; recorder30fps, engine/native source clocks unchanged",
      quality: "safe",
      rows,
    },
    null,
    2,
  ),
);
await browser.close();
