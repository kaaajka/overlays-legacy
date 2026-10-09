import { mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
import { lifecyclePlan } from "../src/donations/donationTiming.ts";

const args = process.argv.slice(2);
const option = (key, fallback) => {
  const at = args.indexOf(`--${key}`);
  return at < 0 ? fallback : args[at + 1];
};
const requestPath = option("request");
const request = requestPath
  ? JSON.parse(readFileSync(requestPath))
  : {
      tier: Number(option("tier", 1)),
      range: option("range", "full"),
      fps: Number(option("fps", 60)),
      format: option("format", "mp4"),
      background: option("background", "solid"),
      audio: option("audio", "true") !== "false",
      nickname: option("nickname", "Kaaajka"),
      amount: Number(option("amount", 5732)),
      message: option("message", "Dziękuję za stream!"),
      seed: option("seed", "kaaajka-motion-01"),
      quality: option("quality", "safe"),
      selection:
        option("in") && option("out") ? [Number(option("in")), Number(option("out"))] : null,
      width: Number(option("width", 1920)),
      height: Number(option("height", 1080)),
      voice: option("voice", "scene"),
      url: option("url", "http://127.0.0.1:5173"),
    };
const folder = requestPath
  ? resolve(requestPath, "..")
  : resolve(".motion-exports", `cli-${Date.now()}`);
mkdirSync(folder, { recursive: true });
const frames = resolve(folder, "frames");
mkdirSync(frames, { recursive: true });
const emit = (value) => process.stdout.write(JSON.stringify(value) + "\n");
const run = (command, argv) =>
  new Promise((yes, no) => {
    const child = spawn(command, argv, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "",
      error = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      error += chunk;
    });
    child.on("error", no);
    child.on("close", (code) =>
      code === 0 ? yes(output) : no(Error(`${command} ${code}: ${error.slice(-4000)}`)),
    );
  });
let browser;
try {
  if (![30, 60].includes(request.fps) || !["mp4", "webm"].includes(request.format))
    throw Error("Unsupported FPS/format");
  if (request.format === "mp4" && request.background === "transparent")
    throw Error("H.264 cannot preserve alpha");
  const width = request.width ?? 1920,
    height = request.height ?? 1080;
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width % 2 ||
    height % 2 ||
    width < 320 ||
    height < 240 ||
    width > 8192 ||
    height > 4320 ||
    width * height > 34_000_000
  )
    throw Error("Invalid output dimensions");
  const query = new URLSearchParams({
    clean: "1",
    width: String(width),
    height: String(height),
    voice: request.voice ?? "scene",
    tier: String(request.tier),
    seed: request.seed,
    quality: request.quality,
    background: request.background,
    nickname: request.nickname,
    amount: String(request.amount),
    message: request.message,
    commission: String((request.commission ?? 0) / 100),
    ...(request.streamFrame ? { streamFrame: request.streamFrame } : {}),
  });
  browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  await page.routeWebSocket("**", (socket) => socket.close());
  await page.goto(`${request.url}/motion-studio?${query}`);
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0, { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  if (request.tier === 7) {
    await page.waitForFunction(() => {
      const state = document.querySelector(".donation-motion")?.dataset.moneyRenderer;
      return state === "ready" || state === "degraded";
    });
  }
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".studio-stream")].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  await page.waitForFunction(() =>
    [...document.querySelectorAll("canvas.information-emote")].every(
      (canvas) => canvas.dataset.emoteState === "ready" || canvas.dataset.emoteState === "fallback",
    ),
  );
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  const metadata = await page.evaluate(() => window.motionStudio.exportMetadata());
  const speech = metadata.currentSpeech;
  if (
    request.speech &&
    JSON.stringify(
      request.speech.map((c) => [c.name, c.text, c.voiceIdentity, c.hash, c.duration]),
    ) !== JSON.stringify(speech.map((c) => [c.name, c.text, c.voiceIdentity, c.hash, c.duration]))
  )
    throw Error("Current speech differs from immutable export request");
  const plan = lifecyclePlan(
    metadata.duration,
    metadata.semanticMessage,
    speech.filter((clip) => metadata.speech[clip.name]),
  );
  const full = request.range === "full" || request.mode === "full";
  let start = 0,
    end = request.range === "full" ? plan.duration : metadata.duration;
  if (request.range === "selection") {
    [start, end] = request.selection;
  }
  if (request.range === "cue") {
    const cue =
      metadata.cues.find((cue) => cue.name === request.cue) ??
      metadata.cues.find((cue) => cue.name === "heroDrop");
    start = Math.max(0, cue.at - 0.75);
    end = Math.min(metadata.duration, cue.at + 1.5);
  }
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end <= start ||
    end > plan.duration
  )
    throw Error("Invalid export range");
  const duration = end - start,
    count = Math.ceil(duration * request.fps);
  if (count > 72000) throw Error("Export exceeds 20 minutes");
  const hashes = {};
  for (let frame = 0; frame < count; frame++) {
    const time = start + frame / request.fps;
    await page.evaluate(({ time, full }) => window.motionStudio.renderExportAt(time, full), {
      time,
      full,
    });
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("video")).every(
          (video) =>
            !video.getAttribute("src") ||
            (!video.seeking && video.readyState >= 2) ||
            video.dataset.mediaState === "gif-fallback",
        ),
      { timeout: 10000 },
    );
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const states = await page.evaluate(() => window.motionStudio.status().media);
    if (states.some((layer) => layer.state === "gif-fallback"))
      throw Error(
        "Deterministic export requires controlled WebM media; original GIF fallback is playback-only",
      );
    const file = resolve(frames, `${String(frame).padStart(6, "0")}.png`);
    const bytes = await page.screenshot({
      path: file,
      omitBackground: request.background === "transparent",
    });
    if (frame === 0 || frame === count - 1 || frame === Math.floor(count / 2))
      hashes[frame] = createHash("sha256").update(bytes).digest("hex");
    if (frame % 10 === 0)
      emit({ state: "rendering", progress: (frame / count) * 0.85, frame, totalFrames: count });
  }
  await browser.close();
  browser = undefined;
  emit({ state: "encoding", progress: 0.85 });
  const ff = [
    "-v",
    "error",
    "-y",
    "-framerate",
    String(request.fps),
    "-i",
    resolve(frames, "%06d.png"),
  ];
  const inputs = [];
  if (request.audio) {
    // Original music is authoritative. No separated stems enter the export mix.
    ff.push("-i", resolve("public", metadata.musicUrl.replace(/^\//, "")));
    inputs.push({ index: 1, delay: 0, gain: metadata.musicVolume });
    if (full)
      for (const stage of plan.stages.filter((stage) => stage.name.startsWith("tts-"))) {
        const name = stage.name.slice(4),
          clip = speech.find((clip) => clip.name === name);
        const index = inputs.length + 1;
        ff.push("-i", resolve(".studio-tts", clip.key + ".wav"));
        inputs.push({ index, delay: stage.start, gain: metadata.speechVolume });
      }
    const filters = inputs.map(
      (input) =>
        `[${input.index}:a]volume=${input.gain},adelay=${Math.round(input.delay * 1000)}:all=1[a${input.index}]`,
    );
    filters.push(
      `${inputs.map((input) => `[a${input.index}]`).join("")}amix=inputs=${inputs.length}:normalize=0,atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[audio]`,
    );
    ff.push("-filter_complex", filters.join(";"), "-map", "0:v", "-map", "[audio]");
    ff.push("-c:a", request.format === "mp4" ? "aac" : "libopus");
  } else ff.push("-an");
  if (request.format === "mp4")
    ff.push(
      "-c:v",
      "libx264",
      "-crf",
      "18",
      "-preset",
      "fast",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
    );
  else
    ff.push(
      "-c:v",
      "libvpx-vp9",
      "-lossless",
      "1",
      "-pix_fmt",
      request.background === "transparent" ? "yuva420p" : "yuv420p",
      "-auto-alt-ref",
      "0",
      "-row-mt",
      "1",
      "-cpu-used",
      "4",
    );
  const file = resolve(folder, `export.${request.format}`);
  ff.push("-frames:v", String(count), "-t", String(count / request.fps), file);
  await run("ffmpeg", ff);
  const probe = JSON.parse(
    await run("ffprobe", [
      "-v",
      "error",
      "-count_frames",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      file,
    ]),
  );
  const video = probe.streams.find((stream) => stream.codec_type === "video");
  if (
    video.width !== width ||
    video.height !== height ||
    Number(video.nb_read_frames) !== count ||
    video.r_frame_rate !== `${request.fps}/1`
  )
    throw Error("Encoded dimensions/FPS/frame count mismatch");
  if (
    Boolean(probe.streams.some((stream) => stream.codec_type === "audio")) !==
    Boolean(request.audio)
  )
    throw Error("Audio stream mismatch");
  writeFileSync(
    resolve(folder, "manifest.json"),
    JSON.stringify(
      {
        request,
        analysisSha256: createHash("sha256")
          .update(JSON.stringify(metadata.analysis))
          .digest("hex"),
        analysis: metadata.analysis,
        start,
        end,
        count,
        duration: count / request.fps,
        plan,
        speech,
        hashes,
        probe,
        bytes: statSync(file).size,
      },
      null,
      2,
    ),
  );
  emit({ state: "complete", progress: 1, file, frames: count, duration: count / request.fps });
} catch (error) {
  process.stderr.write(String(error) + "\n");
  process.exitCode = 1;
} finally {
  await browser?.close();
}
