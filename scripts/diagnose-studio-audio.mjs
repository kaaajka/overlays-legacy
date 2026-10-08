import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const root = ".motion-qa/production-2.2/audio";
mkdirSync(root, { recursive: true });
const origin = "http://127.0.0.1:5173";
const browser = await chromium.launch(
  process.argv.includes("--chrome") ? { channel: "chrome" } : {},
);
const records = [];
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.exposeFunction("recordDecode", (record) => {
  if (record.bytes) {
    const bytes = Buffer.from(record.bytes);
    record.sha256 = createHash("sha256").update(bytes).digest("hex");
    if (record.error) writeFileSync(`${root}/failure-${records.length}.bin`, bytes);
    delete record.bytes;
  }
  records.push(record);
});
await page.addInitScript(() => {
  const originalFetch = window.fetch;
  const urls = new WeakMap();
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (/donation-template-0[4-7]|__studio-assets\/music/.test(response.url)) {
      const arrayBuffer = response.arrayBuffer.bind(response);
      response.arrayBuffer = async () => {
        const bytes = await arrayBuffer();
        urls.set(bytes, {
          url: response.url,
          http: response.status,
          mime: response.headers.get("Content-Type"),
          length: response.headers.get("Content-Length"),
        });
        return bytes;
      };
    }
    return response;
  };
  const decode = AudioContext.prototype.decodeAudioData;
  AudioContext.prototype.decodeAudioData = async function (bytes, ...args) {
    const metadata = urls.get(bytes);
    if (!metadata) return decode.call(this, bytes, ...args);
    const record = {
      ...metadata,
      bytes: Array.from(new Uint8Array(bytes)),
      sampleRate: this.sampleRate,
      contextState: this.state,
      started: performance.now(),
      signature: Array.from(new Uint8Array(bytes).slice(0, 16)),
    };
    try {
      const buffer = await decode.call(this, bytes, ...args);
      let sum = 0;
      for (const value of buffer.getChannelData(0)) sum += value * value;
      record.rms = Math.sqrt(sum / buffer.length);
      record.duration = buffer.duration;
      record.decodedRate = buffer.sampleRate;
      return buffer;
    } catch (error) {
      record.error = { name: error.name, message: error.message };
      throw error;
    } finally {
      record.finishedState = this.state;
      await window.recordDecode(record);
    }
  };
});
// Actual app: each reload has a new module cache and new MusicPlayback context.
for (let attempt = 0; attempt < 100; attempt++) {
  await page.goto(`${origin}/motion-studio?tier=5&quality=safe`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const status = document.querySelector(".studio-status")?.textContent;
    return status && !status.includes("Loading music") && !status.includes("Wczytywanie muzyki");
  });
  await page.waitForTimeout(50);
  if (attempt % 25 === 0) console.log(`Actual Donate5 app load ${attempt + 1}/100`);
}
for (const tier of [4, 6, 7]) {
  await page.goto(`${origin}/motion-studio?tier=${tier}&quality=safe`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1200);
}
await page.goto(`${origin}/motion-studio?tier=4&quality=safe`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(900);
for (const tier of [5, 6, 5, 4, 5, 6, 5]) {
  await page.locator("#studio-tier").selectOption(String(tier));
  await page.waitForTimeout(900);
}
writeFileSync(
  `${root}/${process.argv.includes("--chrome") ? "chrome" : "chromium"}-actual-path.json`,
  JSON.stringify({ browser: browser.version(), records }, null, 2),
);
console.log(
  JSON.stringify({
    browser: browser.version(),
    loads: records.length,
    failed: records.filter((r) => r.error).length,
    firstFailure: records.find((r) => r.error),
  }),
);
await browser.close();
