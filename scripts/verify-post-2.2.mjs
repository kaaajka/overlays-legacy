import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";

// Reproducible acceptance evidence: raw alpha, native dimensions and preview/export parity.
const output = resolve(".motion-qa/continuation/final");
mkdirSync(output, { recursive: true });
const formats = [
  [1280, 720],
  [1920, 1080],
  [1920, 1200],
  [2560, 1080],
  [3440, 1440],
  [3840, 1080],
  [3840, 2160],
  [5120, 1440],
];
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const settled = async () => {
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].every(
      (v) => !v.getAttribute("src") || (!v.seeking && v.readyState >= 2),
    ),
  );
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
};
const zero = [];
for (const [width, height] of formats) {
  await page.setViewportSize({ width, height });
  for (let tier = 1; tier <= 7; tier++) {
    const query = new URLSearchParams({
      clean: "1",
      tier: String(tier),
      width: String(width),
      height: String(height),
      background: "transparent",
      quality: "safe",
    });
    await page.goto(`http://127.0.0.1:5173/motion-studio?${query}`);
    await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.motionStudio.renderExportAt(0, false));
    await settled();
    const path = resolve(output, `zero-${tier}-${width}x${height}.png`);
    await page.screenshot({ path, omitBackground: true });
    zero.push({ tier, width, height, path });
  }
}
writeFileSync(resolve(output, "zero-input.json"), JSON.stringify(zero));
// PIL checks EVERY alpha pixel, rather than a representative corner or a DOM flag.
const python =
  process.env.STUDIO_QA_PYTHON ??
  "C:/Users/michas/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const alpha = spawnSync(
  python,
  [
    "-c",
    "import json,sys;from PIL import Image;rows=json.load(open(sys.argv[1]));\nfor r in rows:\n im=Image.open(r['path']).convert('RGBA');r['alphaExtrema']=im.getchannel('A').getextrema();assert r['alphaExtrema']==(0,0),r\nprint(json.dumps(rows))",
    resolve(output, "zero-input.json"),
  ],
  { windowsHide: true, encoding: "utf8", maxBuffer: 1e6 },
);
assert.equal(alpha.status, 0, alpha.stderr);
const zeroVerified = JSON.parse(alpha.stdout);
const exports = [];
for (let i = 0; i < formats.length; i++) {
  const [width, height] = formats[i],
    tier = (i % 7) + 1;
  const folder = resolve(output, `export-${tier}-${width}x${height}`);
  mkdirSync(folder, { recursive: true });
  const request = {
    tier,
    width,
    height,
    range: "selection",
    mode: "hero",
    selection: [0, 0.03],
    fps: 30,
    format: "webm",
    background: "transparent",
    audio: false,
    nickname: "Victor",
    amount: 213769,
    message: "Aktualna wiadomość",
    voice: "scene",
    quality: "safe",
    seed: "kaaajka-motion-01",
    url: "http://127.0.0.1:5173",
  };
  const path = resolve(folder, "request.json");
  writeFileSync(path, JSON.stringify(request));
  const rendered = process.argv.includes("--resume")
    ? { status: 0, stderr: "" }
    : spawnSync(process.execPath, ["scripts/render-donation.mjs", "--request", path], {
        windowsHide: true,
        encoding: "utf8",
        maxBuffer: 2e6,
      });
  assert.equal(rendered.status, 0, rendered.stderr);
  const manifest = JSON.parse(readFileSync(resolve(folder, "manifest.json")));
  const video = manifest.probe.streams.find((s) => s.codec_type === "video");
  assert.equal(video.width, width);
  assert.equal(video.height, height);
  const decoded = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-c:v",
      "libvpx-vp9",
      "-i",
      resolve(folder, "export.webm"),
      "-vf",
      "alphaextract",
      "-frames:v",
      "1",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "gray",
      "-",
    ],
    { windowsHide: true, maxBuffer: width * height + 1e6 },
  );
  assert.equal(decoded.status, 0, decoded.stderr.toString());
  assert.equal(decoded.stdout.length, width * height);
  assert.ok(decoded.stdout.every((v) => v === 0));
  exports.push({
    tier,
    width,
    height,
    count: manifest.count,
    alphaMax: 0,
    pngHash: manifest.hashes[0],
    path: resolve(folder, "export.webm"),
  });
}
const heroExports = [];
for (let i = 0; i < formats.length; i++) {
  const [width, height] = formats[i],
    tier = (i % 7) + 1;
  await page.setViewportSize({ width, height });
  const data = {
    tier,
    width,
    height,
    nickname: "Victor",
    amount: 213769,
    message: "Aktualna wiadomość",
    voice: "scene",
    quality: "safe",
    seed: "kaaajka-motion-01",
    background: "transparent",
  };
  const query = new URLSearchParams({ ...data, clean: "1" });
  await page.goto(`http://127.0.0.1:5173/motion-studio?${query}`);
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => document.fonts.ready);
  const start = await page.evaluate(
    () => window.motionStudio.exportMetadata().cues.find((c) => c.name === "heroDrop").at + 0.65,
  );
  const folder = resolve(output, `hero-export-${tier}-${width}x${height}`);
  mkdirSync(folder, { recursive: true });
  const request = {
    ...data,
    range: "selection",
    mode: "hero",
    selection: [start, start + 0.05],
    fps: 30,
    format: "webm",
    audio: false,
    url: "http://127.0.0.1:5173",
  };
  const path = resolve(folder, "request.json");
  writeFileSync(path, JSON.stringify(request));
  const rendered = spawnSync(process.execPath, ["scripts/render-donation.mjs", "--request", path], {
    windowsHide: true,
    encoding: "utf8",
    maxBuffer: 2e6,
  });
  assert.equal(rendered.status, 0, rendered.stderr);
  await page.evaluate((time) => window.motionStudio.renderExportAt(time, false), start);
  await settled();
  const bytes = await page.screenshot({ omitBackground: true });
  const hash = createHash("sha256").update(bytes).digest("hex");
  const manifest = JSON.parse(readFileSync(resolve(folder, "manifest.json")));
  assert.equal(hash, manifest.hashes[0], `Hero export ${tier} ${width}x${height}`);
  heroExports.push({ tier, width, height, start, count: manifest.count, hash });
}
// Current Full Alert export must reuse exact generated WAVs and match clean preview PNGs.
const fullFolder = resolve(
  process.env.STUDIO_QA_FULL_EXPORT ?? ".motion-qa/continuation/final/full",
);
const full = JSON.parse(readFileSync(resolve(fullFolder, "manifest.json")));
const request = full.request;
await page.setViewportSize({ width: request.width, height: request.height });
const query = new URLSearchParams({
  clean: "1",
  tier: String(request.tier),
  width: String(request.width),
  height: String(request.height),
  voice: request.voice,
  background: request.background,
  nickname: request.nickname,
  amount: String(request.amount),
  message: request.message,
  seed: request.seed,
  quality: request.quality,
});
await page.goto(`${request.url}/motion-studio?${query}`);
await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => window.motionStudio.prepareSpeech());
await page.waitForFunction(() =>
  [...document.querySelectorAll(".studio-stream")].every((v) => v.complete && v.naturalWidth),
);
const current = await page.evaluate(() => window.motionStudio.exportMetadata().currentSpeech);
assert.deepEqual(
  current.map((c) => [c.name, c.text, c.voiceIdentity, c.hash, c.duration]),
  full.speech.map((c) => [c.name, c.text, c.voiceIdentity, c.hash, c.duration]),
);
const parity = [];
for (const frame of Object.keys(full.hashes).map(Number)) {
  await page.evaluate(
    (time) => window.motionStudio.renderExportAt(time, true),
    full.start + frame / request.fps,
  );
  await settled();
  const bytes = await page.screenshot({ path: resolve(output, `full-preview-${frame}.png`) });
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(hash, full.hashes[frame], `Full preview frame ${frame}`);
  parity.push({ frame, hash });
}
const speechSignals = [];
for (const clip of full.speech) {
  const bytes = readFileSync(resolve(".studio-tts", clip.file));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), clip.hash);
  const stage = full.plan.stages.find((s) => s.name === `tts-${clip.name}`);
  const decoded = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-ss",
      String(stage.start + 0.1),
      "-i",
      resolve(fullFolder, "export.mp4"),
      "-t",
      String(Math.min(0.5, clip.duration - 0.1)),
      "-f",
      "f32le",
      "-ac",
      "1",
      "-",
    ],
    { windowsHide: true, maxBuffer: 1e6 },
  );
  assert.equal(decoded.status, 0, decoded.stderr.toString());
  let sum = 0;
  for (let k = 0; k + 4 <= decoded.stdout.length; k += 4) sum += decoded.stdout.readFloatLE(k) ** 2;
  const rms = Math.sqrt(sum / (decoded.stdout.length / 4));
  assert.ok(rms > 0.0001, `${clip.name} silent`);
  speechSignals.push({ ...clip, rms, stageStart: stage.start });
}
assert.deepEqual(errors, []);
await browser.close();
const result = {
  zero: zeroVerified,
  exports,
  heroExports,
  full: {
    request,
    count: full.count,
    duration: full.duration,
    encodedDuration: full.probe.format.duration,
    parity,
    speechSignals,
  },
  errors,
};
writeFileSync(resolve(output, "acceptance.json"), JSON.stringify(result, null, 2));
console.log(
  JSON.stringify({
    zero: zeroVerified.length,
    exports: exports.length,
    parity: parity.length,
    speechSignals: speechSignals.map((c) => ({ name: c.name, rms: c.rms })),
    errors,
  }),
);
