import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const folder = ".motion-qa/v2";
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const heroes = [3.06503, 3.66875, 4.82975, 4.52789, 4.82975, 3.90095, 13.21215];
const ready = async () => {
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => document.fonts.ready);
};
const settle = async () => {
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("video")).every(
      (video) => !video.getAttribute("src") || (!video.seeking && video.readyState >= 2),
    ),
  );
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
};
for (let tier = 1; tier <= 7; tier++) {
  await page.goto(
    `http://127.0.0.1:5173/motion-studio?clean=1&tier=${tier}&quality=high&background=transparent`,
  );
  await ready();
  for (const [name, time] of [
    ["hero", heroes[tier - 1] + 0.5],
    ["rhythm", heroes[tier - 1] + 2.2],
    ...(tier === 7 ? [["late", 37.8]] : []),
  ]) {
    await page.evaluate((time) => window.motionStudio.seek(time), time);
    await settle();
    await page.screenshot({ path: `${folder}/donate${tier}-${name}.png`, omitBackground: true });
  }
}
await page.goto("http://127.0.0.1:5173/motion-studio?tier=6&time=hero");
await ready();
await settle();
await page.screenshot({ path: `${folder}/studio-desktop.png` });
await page.locator(".word-region").first().click();
await page.screenshot({ path: `${folder}/studio-inspector.png` });
await page.evaluate(() => window.motionStudio.seek(3.90095));
await page.getByRole("button", { name: "Export", exact: true }).click();
await page.screenshot({ path: `${folder}/studio-export.png` });
await page.getByRole("button", { name: "Donation data", exact: true }).click();
await page.getByRole("button", { name: "extreme", exact: true }).first().click();
await page.getByLabel("Amount PLN", { exact: true }).fill("9876543210.99");
await page.evaluate(() => window.motionStudio.seek(4.4));
await settle();
await page.screenshot({ path: `${folder}/studio-extreme.png` });
await page
  .getByLabel("Message", { exact: true })
  .fill("Pełna wiadomość pozostaje czytelna. ".repeat(80) + "OSTATNIA LINIA");
await page.evaluate(() => window.motionStudio.information(6000));
await page.screenshot({ path: `${folder}/studio-information.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: `${folder}/studio-mobile.png`, fullPage: true });
await page.setViewportSize({ width: 1920, height: 1080 });
const extreme = "PotężnyWspierającySpołecznośćKaaajkiBezKońca".repeat(3);
await page.goto(
  `http://127.0.0.1:5173/motion-studio?clean=1&tier=6&time=hero&nickname=${encodeURIComponent(extreme)}&amount=987654321099&background=solid`,
);
await ready();
await settle();
await page.screenshot({ path: `${folder}/extreme-full-stage.png` });
writeFileSync(
  `${folder}/capture.json`,
  JSON.stringify(
    { heroes, desktop: [1920, 1080], mobile: [390, 844], time: new Date().toISOString() },
    null,
    2,
  ),
);
await browser.close();
