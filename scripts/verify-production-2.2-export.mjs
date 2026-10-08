import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(".motion-qa/production-2.2/export");
mkdirSync(root, { recursive: true });
const base = {
  tier: 6,
  range: "selection",
  fps: 60,
  format: "mp4",
  background: "solid",
  audio: false,
  nickname: "Kaaajka",
  amount: 5732,
  message: "Dziękuję za stream!",
  seed: "kaaajka-motion-01",
  quality: "safe",
  selection: [3.9, 4.1],
  url: "http://127.0.0.1:5173",
};
function render(name, changes = {}) {
  const folder = resolve(root, name);
  mkdirSync(folder, { recursive: true });
  if (process.argv.includes("--resume")) {
    try {
      return { folder, manifest: JSON.parse(readFileSync(resolve(folder, "manifest.json"))) };
    } catch {
      // Continue normally when an interrupted verification has no completed render.
    }
  }
  const request = resolve(folder, "request.json");
  writeFileSync(request, JSON.stringify({ ...base, ...changes }));
  const result = spawnSync(
    process.execPath,
    ["scripts/render-donation.mjs", "--request", request],
    {
      windowsHide: true,
      encoding: "utf8",
      maxBuffer: 4e6,
    },
  );
  assert.equal(result.status, 0, result.stderr);
  return { folder, manifest: JSON.parse(readFileSync(resolve(folder, "manifest.json"))) };
}
function pixel(file, alpha = false) {
  const args = [
    "-v",
    "error",
    ...(alpha ? ["-c:v", "libvpx-vp9"] : []),
    "-i",
    file,
    "-vf",
    "format=rgba,crop=1:1:10:10",
    "-frames:v",
    "1",
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgba",
    "-",
  ];
  const decoded = spawnSync("ffmpeg", args, { windowsHide: true, maxBuffer: 1e6 });
  assert.equal(decoded.status, 0, decoded.stderr.toString());
  return [...decoded.stdout];
}
function alphaPlane(file, video = false) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      ...(video ? ["-c:v", "libvpx-vp9"] : []),
      "-i",
      file,
      "-vf",
      "format=rgba,alphaextract",
      "-frames:v",
      "1",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "gray",
      "-",
    ],
    { windowsHide: true, maxBuffer: 4e6 },
  );
  assert.equal(result.status, 0, result.stderr.toString());
  assert.equal(result.stdout.length, 1920 * 1080);
  return result.stdout;
}
const first = render("solid-a"),
  repeat = render("solid-b");
const expected = first.manifest.hashes;
assert.deepEqual(repeat.manifest.hashes, expected);
const stream = render("stream", { background: "stream", selection: [0, 0.1] });
const transparent = render("transparent", {
  format: "webm",
  background: "transparent",
  selection: [3.9, 4.0],
});
const streamCorner = pixel(resolve(stream.folder, "frames/000000.png"));
const alphaCorner = pixel(resolve(transparent.folder, "frames/000000.png"));
const decodedAlphaCorner = pixel(resolve(transparent.folder, "export.webm"), true);
assert.equal(streamCorner[3], 255);
assert.equal(alphaCorner[3], 0);
assert.equal(decodedAlphaCorner[3], 0);
assert.notDeepEqual(streamCorner.slice(0, 3), [34, 38, 46]);
const sourceAlpha = alphaPlane(resolve(transparent.folder, "frames/000000.png"));
const decodedAlpha = alphaPlane(resolve(transparent.folder, "export.webm"), true);
let maxAlphaDifference = 0,
  alphaDifferenceSum = 0,
  zeroAlpha = 0,
  opaqueAlpha = 0;
for (let i = 0; i < sourceAlpha.length; i++) {
  const delta = Math.abs(sourceAlpha[i] - decodedAlpha[i]);
  maxAlphaDifference = Math.max(maxAlphaDifference, delta);
  alphaDifferenceSum += delta;
  zeroAlpha += sourceAlpha[i] === 0 ? 1 : 0;
  opaqueAlpha += sourceAlpha[i] === 255 ? 1 : 0;
}
assert.ok(zeroAlpha / sourceAlpha.length > 0.5);
assert.ok(opaqueAlpha > 10000); // Visible donation content survives over transparent margins.
assert.ok(maxAlphaDifference <= 1);

// Fully transparent exported frame zero, then nonzero content in the same WebM.
const zero = render("zero", { format: "webm", background: "transparent", selection: [0, 0.1] });
const initialAlpha = alphaPlane(resolve(zero.folder, "frames/000000.png"));
assert.ok(initialAlpha.every((value) => value === 0));
const zeroTiers = [];
for (let tier = 1; tier <= 7; tier++) {
  const initial = render(`zero-tier-${tier}`, {
    tier,
    format: "webm",
    background: "transparent",
    selection: [0, 0.05],
  });
  const alpha = alphaPlane(resolve(initial.folder, "frames/000000.png"));
  assert.ok(alpha.every((value) => value === 0));
  zeroTiers.push(tier);
}
const fullAudio = render("donate5-full-stream-30", {
  tier: 5,
  fps: 30,
  range: "full",
  mode: "full",
  background: "stream",
  audio: true,
  message: "Dziękuję emojiBubbly xdd!",
});
const info = render("info-a", {
  range: "selection",
  selection: [21.9, 22.1],
  mode: "full",
  audio: false,
  message: "emojiBubbly xdd",
});
const infoRepeat = render("info-b", {
  range: "selection",
  selection: [21.9, 22.1],
  mode: "full",
  audio: false,
  message: "emojiBubbly xdd",
});
assert.deepEqual(info.manifest.hashes, infoRepeat.manifest.hashes);
const evidence = {
  solidHashes: expected,
  repeatedHashesIdentical: true,
  productionV22HashesIdentical: true,
  selection: base.selection,
  frameCount: first.manifest.count,
  duration: first.manifest.duration,
  streamCorner,
  transparentPngCorner: alphaCorner,
  decodedVp9Corner: decodedAlphaCorner,
  alphaComparison: {
    maxAlphaDifference,
    meanDifference: alphaDifferenceSum / sourceAlpha.length,
    transparentFraction: zeroAlpha / sourceAlpha.length,
    opaquePixels: opaqueAlpha,
  },
  zeroAlpha: "all zero",
  zeroTiers,
  fullAudio: {
    count: fullAudio.manifest.count,
    duration: fullAudio.manifest.duration,
    audio: fullAudio.manifest.request.audio,
    fps: 30,
  },
  informationRepeatedHashes: info.manifest.hashes,
  streamManifest: { count: stream.manifest.count, background: stream.manifest.request.background },
  transparentManifest: {
    count: transparent.manifest.count,
    background: transparent.manifest.request.background,
  },
};
writeFileSync(resolve(root, "verification.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
