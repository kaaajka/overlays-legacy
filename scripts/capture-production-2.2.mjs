import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const folder = ".motion-qa/production-2.2";
mkdirSync(folder, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const heroes = [3.06503, 3.66875, 4.82975, 4.52789, 4.82975, 3.90095, 13.21215];
const settle = async () => {
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].every(
      (v) => !v.getAttribute("src") || (!v.seeking && v.readyState >= 2),
    ),
  );
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
};
const ready = async () => {
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => document.fonts.ready);
};
const measurements = [];
for (let tier = 1; tier <= 7; tier++) {
  for (const background of ["stream", "solid", "checker"]) {
    await page.goto(
      `http://127.0.0.1:5173/motion-studio?clean=1&tier=${tier}&quality=high&background=${background}`,
    );
    await ready();
    for (const [state, time] of background === "stream"
      ? [
          ["zero", 0],
          ["initial", 0.15],
          ["hero", heroes[tier - 1] + 0.5],
          ["settle", heroes[tier - 1] + 2.2],
        ]
      : [["hero", heroes[tier - 1] + 0.5]]) {
      await page.evaluate((t) => window.motionStudio.seek(t), time);
      await settle();
      await page.screenshot({ path: `${folder}/donate${tier}-${background}-${state}.png` });
    }
  }
}
const cases = [
  ["short", "Dzięki!", "Kaaajka"],
  ["default", "Dziękuję za stream!", "Kaaajka"],
  ["100", "Świetny stream i najlepsza społeczność. ".repeat(4).slice(0, 100), "Kaaajka"],
  [
    "225",
    "Dzięki za wszystkie wspólne wieczory i świetną społeczność. ".repeat(6).slice(0, 225),
    "Kaaajka",
  ],
  ["one", "Dzięki emojiBubbly!", "Kaaajka"],
  ["several", "emojiBubbly xdd Ale stream! xdd emojiBubbly", "Kaaajka"],
  ["consecutive", "emojiBubbly emojiBubbly xdd xdd", "Kaaajka"],
  [
    "max-emotes",
    "Dzięki za stream! ".repeat(14).slice(0, 200) + " emojiBubbly xdd xdd xdd ",
    "Kaaajka",
  ],
  ["max-name-short", "Dzięki!", "A".repeat(32)],
  [
    "max-name-225",
    "Dzięki za wszystkie wspólne wieczory i świetną społeczność. ".repeat(6).slice(0, 225),
    "A".repeat(32),
  ],
];
for (const [name, message, nickname] of cases) {
  await page.goto(
    "http://127.0.0.1:5173/motion-studio?clean=1&tier=6&background=stream&message=" +
      encodeURIComponent(message) +
      "&nickname=" +
      encodeURIComponent(nickname),
  );
  await ready();
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("canvas.information-emote")].every(
        (c) => c.dataset.emoteState === "ready" || c.dataset.emoteState === "fallback",
      ),
    { timeout: 15000 },
  );
  await page.evaluate(() => window.motionStudio.information(6000));
  await page.screenshot({ path: `${folder}/info-${name}.png` });
  measurements.push({
    name,
    chars: message.length,
    ...(await page.locator(".motion-information").evaluate((e) => ({
      width: e.offsetWidth,
      height: e.offsetHeight,
      bodyHeight: e.querySelector(".information-message").clientHeight,
      bodyScroll: e.querySelector(".information-message").scrollHeight,
    }))),
  });
}
for (const size of [
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1680, 900],
  [1920, 1080],
  [2560, 1440],
]) {
  await page.setViewportSize({ width: size[0], height: size[1] });
  await page.goto("http://127.0.0.1:5173/motion-studio?tier=6&time=hero&background=stream");
  await ready();
  await settle();
  await page.screenshot({ path: `${folder}/studio-${size[0]}x${size[1]}.png` });
}
await page.setViewportSize({ width: 1920, height: 1080 });
await page.getByRole("button", { name: "Pomoc: Ziarno losowania" }).click();
await page.screenshot({ path: `${folder}/studio-help.png` });
await page.getByRole("button", { name: "Eksport", exact: true }).click();
await page.screenshot({ path: `${folder}/studio-export.png` });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: `${folder}/studio-desktop-gate.png` });
writeFileSync(`${folder}/information-matrix.json`, JSON.stringify(measurements, null, 2));
console.log(JSON.stringify(measurements));
await browser.close();
