import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(".motion-qa/studio-2.1/export");
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
const expected = {
  0: "05b669fff058560db47c3b162a297e53e29e33bf742beaff1ff4a41e4e402f6c",
  6: "40011ceb482586a4b51c7028caed672c543b03077b62d31b0326a2661f9cc5fb",
  11: "ea604b1169ca043ad57d57cfe2a5c517e56859b510ac62f7f5354055c3e074e0",
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
assert.deepEqual(first.manifest.hashes, expected);
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

// Exercise the same local endpoint as the UI, including a selected custom frame.
const custom =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGP8zwACTGCSAQANHQEDgslx/wAAAABJRU5ErkJggg==";
const submit = () =>
  fetch(`${base.url}/__studio/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...base,
      background: "stream",
      streamFrame: custom,
      selection: [0, 0.1],
    }),
  });
let job;
const cachedJobIndex = process.argv.indexOf("--custom-job");
if (cachedJobIndex >= 0) {
  // Resume against a completed probe when another authoring export owns the worker.
  const response = await fetch(`${base.url}/__studio/export/${process.argv[cachedJobIndex + 1]}`);
  assert.equal(response.status, 200);
  job = await response.json();
} else {
  const response = await submit();
  assert.equal(
    response.status,
    202,
    `Local export worker is busy or unavailable (${response.status})`,
  );
  job = await response.json();
}
const deadline = Date.now() + 60000;
while (["rendering", "encoding"].includes(job.state) && Date.now() < deadline) {
  await new Promise((done) => setTimeout(done, 500));
  job = await (await fetch(`${base.url}/__studio/export/${job.id}`)).json();
}
assert.equal(job.state, "complete", JSON.stringify(job));
const customFolder = resolve(".motion-exports", job.id);
const customCorner = pixel(resolve(customFolder, "frames/000000.png"));
assert.deepEqual(customCorner, [255, 0, 0, 255]);
assert.equal((await fetch(`${base.url}/__studio/export/${job.id}/stream`)).status, 200);
const evidence = {
  solidHashes: expected,
  repeatedHashesIdentical: true,
  productionV2HashesIdentical: true,
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
  customStreamCorner: customCorner,
  customJob: job.id,
  streamManifest: { count: stream.manifest.count, background: stream.manifest.request.background },
  transparentManifest: {
    count: transparent.manifest.count,
    background: transparent.manifest.request.background,
  },
};
writeFileSync(resolve(root, "verification.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
