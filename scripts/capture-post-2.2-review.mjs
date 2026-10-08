import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const folder = "docs/assets/post-2.2/review-1";
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const [width, height] of [
  [1920, 1080],
  [5120, 1440],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(
    `http://127.0.0.1:5173/motion-studio?clean=1&tier=5&width=${width}&height=${height}&background=stream&quality=high&nickname=${"W".repeat(32)}&amount=100000000`,
  );
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => document.fonts.ready);
  const hero = await page.evaluate(
    () => window.motionStudio.exportMetadata().cues.find((c) => c.name === "heroDrop").at,
  );
  await page.evaluate((at) => window.motionStudio.renderExportAt(at + 0.65, false), hero);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].every((v) => !v.seeking),
  );
  await page.screenshot({
    path: `${folder}/donate5-${width}x${height}.jpg`,
    type: "jpeg",
    quality: 85,
  });
}
await page.setViewportSize({ width: 1920, height: 1080 });
await page.goto("http://127.0.0.1:5173/motion-studio?tier=6");
await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
await page.evaluate(() => window.motionStudio.prepareSpeech());
await page.keyboard.press("Shift+/");
await page.screenshot({ path: `${folder}/shortcuts.jpg`, type: "jpeg", quality: 85 });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173/motion-studio");
await page.locator(".studio-desktop-required").waitFor();
await page.screenshot({ path: `${folder}/studio-390x844.jpg`, type: "jpeg", quality: 85 });
await browser.close();
