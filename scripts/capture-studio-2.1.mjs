import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const folder = ".motion-qa/studio-2.1";
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const metrics = [];
for (const [width, height] of [
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1680, 900],
  [1920, 1080],
  [2560, 1440],
  [1024, 600],
]) {
  await page.setViewportSize({ width, height });
  await page.goto("http://127.0.0.1:5173/motion-studio?tier=6&quality=safe");
  if (width >= 1280) {
    await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.motionStudio.seek(4.4));
  }
  if (width < 1280)
    await page
      .getByRole("heading", { name: "Motion Studio requires a desktop-sized viewport." })
      .waitFor();
  await page.screenshot({ path: `${folder}/workspace-${width}x${height}.png` });
  metrics.push(
    await page.evaluate(() => {
      const stage = document.querySelector(".stage-frame")?.getBoundingClientRect(),
        viewer = document.querySelector(".viewer-viewport")?.getBoundingClientRect();
      return {
        viewport: [innerWidth, innerHeight],
        document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
        stage: stage?.toJSON(),
        viewer: viewer?.toJSON(),
      };
    }),
  );
}
await page.setViewportSize({ width: 1680, height: 900 });
await page.goto("http://127.0.0.1:5173/motion-studio?tier=6&quality=safe");
await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
await page.evaluate(() => document.fonts.ready);
await page.getByRole("button", { name: "Full Alert", exact: true }).click();
await page.locator('[data-tts="amount"]').click();
await page.screenshot({ path: `${folder}/full-alert-inspector.png` });
await page.getByRole("button", { name: "Export", exact: true }).click();
await page.screenshot({ path: `${folder}/export-panel.png` });
await page.getByRole("button", { name: "Maximize stage", exact: true }).click();
await page.screenshot({ path: `${folder}/stage-maximized.png` });
await page.getByRole("button", { name: "Restore workspace", exact: true }).first().click();
await page.getByRole("button", { name: "Maximize timeline", exact: true }).click();
await page.screenshot({ path: `${folder}/timeline-maximized.png` });
await page.getByRole("button", { name: "Restore workspace", exact: true }).first().click();
writeFileSync(`${folder}/workspace-metrics.json`, JSON.stringify(metrics, null, 2) + "\n");
await browser.close();
