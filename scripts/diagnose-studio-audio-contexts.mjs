import { chromium } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
const folder = ".motion-qa/production-2.2/audio";
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto("http://127.0.0.1:5173/motion-studio?tier=5");
await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
const records = await page.evaluate(async () => {
  const { MusicPlayback } = await import("/src/audio/motion/MusicPlayback.ts");
  const records = [];
  let playback;
  const nativeFetch = window.fetch;
  for (const mode of [
    "same-context",
    "fresh-context",
    "http-cache-request",
    "cache-bust",
    "decoded-cache",
  ]) {
    playback = new MusicPlayback(0.5);
    for (let i = 0; i < 100; i++) {
      if (mode === "fresh-context") {
        playback.dispose();
        playback = new MusicPlayback(0.5);
      }
      window.fetch = (input, options) =>
        nativeFetch(input, {
          ...options,
          ...(mode === "http-cache-request" ? { cache: "force-cache" } : {}),
        });
      await playback.load(
        "/assets/donations/audio/donation-template-05.mp3",
        new AbortController().signal,
        {
          fetchUrl: "/__studio-assets/music/5" + (mode === "cache-bust" ? "?probe=" + i : ""),
          fresh: mode !== "decoded-cache",
          onDiagnostic: (record) => records.push({ mode, attempt: i, ...record }),
        },
      );
    }
    playback.dispose();
  }
  window.fetch = nativeFetch;
  for (const tier of [4, 6, 7]) {
    playback = new MusicPlayback(0.5);
    await playback.load(
      "/assets/donations/audio/donation-template-0" + tier + (tier === 7 ? ".mp3" : ".mpga"),
      new AbortController().signal,
      {
        fetchUrl:
          tier === 7
            ? "/__studio-assets/music/7"
            : "/assets/donations/audio/donation-template-0" +
              tier +
              (tier === 7 ? ".mp3" : ".mpga"),
        fresh: true,
        onDiagnostic: (r) => records.push({ mode: "comparison", tier, ...r }),
      },
    );
    playback.dispose();
  }
  return records;
});
writeFileSync(
  folder + "/chrome-context-cache-matrix.json",
  JSON.stringify({ browser: browser.version(), records }, null, 2),
);
console.log(
  JSON.stringify({
    count: records.length,
    failed: records.filter((r) => r.error).length,
    modes: [...new Set(records.map((r) => r.mode))],
  }),
);
await page.addInitScript(() => {
  window.audioProbe = [];
  const createGain = AudioContext.prototype.createGain;
  AudioContext.prototype.createGain = function () {
    const gain = createGain.call(this),
      analyser = this.createAnalyser();
    analyser.fftSize = 256;
    gain.connect(analyser);
    window.audioProbe.push(analyser);
    return gain;
  };
});
await page.reload();
await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
let rms = 0;
for (let i = 0; i < 15; i++) {
  await page.waitForTimeout(100);
  rms = Math.max(
    rms,
    await page.evaluate(() =>
      Math.max(
        ...window.audioProbe.map((a) => {
          const d = new Float32Array(a.fftSize);
          a.getFloatTimeDomainData(d);
          return Math.sqrt(d.reduce((s, v) => s + v * v, 0) / d.length);
        }),
      ),
    ),
  );
}
const state = await page.evaluate(() => window.motionStudio.status());
writeFileSync(
  folder + "/chrome-native-play.json",
  JSON.stringify(
    {
      browser: browser.version(),
      rms,
      time: state.time,
      playing: state.playing,
      diagnostic: state.audioDiagnostic,
    },
    null,
    2,
  ),
);
if (!(rms > 0.001 && state.time > 1 && state.playing)) throw Error("No advancing audible music");
console.log(JSON.stringify({ nativePlayRms: rms, seconds: state.time }));
await browser.close();
