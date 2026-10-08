import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const folder = "docs/assets/donate7-creative",
  tmp = ".motion-qa/donate7-capture";
mkdirSync(folder, { recursive: true });
mkdirSync(tmp, { recursive: true });
const mode = process.argv[2] ?? "performance";
const browser = await chromium.launch({
  args: ["--autoplay-policy=no-user-gesture-required", "--enable-precise-memory-info"],
});
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
if (mode === "record")
  await page.addInitScript(() => {
    const original = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (...args) {
      const result = original.apply(this, args);
      if (args[0] instanceof AudioDestinationNode && this.context instanceof AudioContext) {
        let tap = window.__qaTap;
        if (!tap || tap.context !== this.context) {
          tap = { context: this.context, destination: this.context.createMediaStreamDestination() };
          window.__qaTap = tap;
        }
        original.call(this, tap.destination);
      }
      return result;
    };
  });
async function load(width, height, quality = "high") {
  await page.setViewportSize({ width, height });
  await page.goto(
    `http://127.0.0.1:5173/motion-studio?clean=1&tier=7&width=${width}&height=${height}&background=stream&quality=${quality}&nickname=Kaaajka&amount=5732`,
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
}
if (mode === "record") {
  await load(1920, 1080);
  console.log("record: loaded");
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  console.log("record: speech prepared");
  await page.waitForFunction(() => Boolean(window.__qaTap?.destination), { timeout: 10000 });
  console.log("record: audio tap ready");
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  let recording = true;
  cdp.on("Page.screencastFrame", async (event) => {
    if (recording) {
      const name = `frame-${String(frames.length).padStart(5, "0")}.jpg`;
      writeFileSync(`${tmp}/${name}`, Buffer.from(event.data, "base64"));
      frames.push({ name, time: event.metadata.timestamp });
    }
    await cdp.send("Page.screencastFrameAck", { sessionId: event.sessionId });
  });
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 88,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 2,
  });
  const audioStart = await page.evaluate(() => {
    window.__qaChunks = [];
    window.__qaRecorder = new MediaRecorder(window.__qaTap.destination.stream, {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 192000,
    });
    window.__qaRecorder.ondataavailable = (e) => window.__qaChunks.push(e.data);
    window.__qaRecorder.start();
    return Date.now() / 1000;
  });
  await page.evaluate(() => window.motionStudio.playFull());
  const phases = [];
  const samples = [];
  for (let i = 0; i < 750; i++) {
    const s = await page.evaluate(() => window.motionStudio.status());
    if (phases.at(-1)?.phase !== s.phase) phases.push({ phase: s.phase, time: s.time });
    samples.push({ time: s.time, quality: s.quality, spectacle: s.spectacle });
    if (s.phase === "complete") break;
    await page.waitForTimeout(100);
  }
  const final = await page.evaluate(() => window.motionStudio.status());
  if (final.phase !== "complete") throw Error("Full capture did not complete");
  const audio = await page.evaluate(async () => {
    await new Promise((resolve) => {
      window.__qaRecorder.onstop = resolve;
      window.__qaRecorder.stop();
    });
    const buffer = await new Blob(window.__qaChunks, { type: "audio/webm" }).arrayBuffer();
    let out = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 32768)
      out += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return btoa(out);
  });
  writeFileSync(`${tmp}/actual-audio.webm`, Buffer.from(audio, "base64"));
  recording = false;
  await cdp.send("Page.stopScreencast");
  const concat = `${frames
    .map(
      (f, i) =>
        `file '${f.name}'\nduration ${Math.max(0.001, (frames[i + 1]?.time ?? f.time + 1 / 30) - f.time)}`,
    )
    .join("\n")}\nfile '${frames.at(-1).name}'\n`;
  writeFileSync(`${tmp}/frames.txt`, concat);
  const offset = audioStart - frames[0].time;
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      `${tmp}/frames.txt`,
      "-itsoffset",
      String(offset),
      "-i",
      `${tmp}/actual-audio.webm`,
      "-c:v",
      "libx264",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      `${folder}/donate7-full-realtime-audio.mp4`,
    ],
    { encoding: "utf8", windowsHide: true },
  );
  if (result.status !== 0) throw Error(result.stderr);
  writeFileSync(
    `${folder}/realtime-recording.json`,
    JSON.stringify(
      {
        method:
          "CDP live screencast with capture timestamps + actual WebAudio output tap; no offline replacement sound",
        audioOffsetSeconds: offset,
        frames: frames.length,
        firstFrame: frames[0].time,
        lastFrame: frames.at(-1).time,
        phases,
        final,
        errors,
        samples,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      mode,
      frames: frames.length,
      phase: final.phase,
      phases: phases.map((p) => p.phase),
      audioOffsetSeconds: offset,
      errors,
    }),
  );
} else {
  const results = [];
  for (const [width, height] of [
    [1920, 1080],
    [2560, 1440],
    [3440, 1440],
    [3840, 2160],
    [5120, 1440],
  ]) {
    await load(width, height);
    await page.evaluate(() => window.motionStudio.seek(12));
    await page.evaluate(() => {
      window.__qaFrames = [];
      window.__qaCosts = [];
      let previous = performance.now();
      window.__qaSample = true;
      const sample = (now) => {
        if (!window.__qaSample) return;
        const s = window.motionStudio.status();
        if (s.playing) {
          window.__qaFrames.push(now - previous);
          window.__qaCosts.push({ time: s.time, ...s.spectacle, quality: s.quality });
        }
        previous = now;
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.evaluate(() => window.motionStudio.play());
    await page.waitForFunction(() => window.motionStudio.status().time > 24, { timeout: 20000 });
    const data = await page.evaluate(() => {
      window.__qaSample = false;
      const frames = window.__qaFrames.filter((n) => n < 1000);
      const values = window.__qaCosts;
      const quantile = (a, p) => [...a].sort((a, b) => a - b)[Math.floor((a.length - 1) * p)];
      return {
        samples: frames.length,
        frameMedianMs: quantile(frames, 0.5),
        frameP95Ms: quantile(frames, 0.95),
        frameP99Ms: quantile(frames, 0.99),
        rendererP95Ms: quantile(
          values.map((v) => v.renderMs),
          0.95,
        ),
        peakParticles: Math.max(...values.map((v) => v.particles)),
        maxBackingPixels: Math.max(...values.map((v) => v.backingPixels)),
        qualityStart: values[0]?.quality,
        qualityEnd: values.at(-1)?.quality,
        heapBytes: performance.memory?.usedJSHeapSize,
        media: window.motionStudio.status().media,
        userAgent: navigator.userAgent,
      };
    });
    await page.evaluate(() => window.motionStudio.pause());
    results.push({ width, height, ...data });
    console.log(JSON.stringify(results.at(-1)));
  }
  writeFileSync(
    `${folder}/performance.json`,
    JSON.stringify(
      {
        conditions:
          "Headless Chromium on this host, actual audio-clock playback 12–24 seconds, no concurrent QA, deviceScaleFactor1. Includes browser/compositor cadence; renderer timing measures Canvas2D submission only, not GPU raster.",
        results,
        errors,
      },
      null,
      2,
    ),
  );
}
await browser.close();
