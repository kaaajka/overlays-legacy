import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";
// Playwright's pinned PNG decoder keeps screenshot comparison off the live GPU surface.
const playwrightRequire = createRequire(createRequire(import.meta.url).resolve("@playwright/test"));
const coreRequire = createRequire(playwrightRequire.resolve("playwright"));
const { PNG } = coreRequire("playwright-core/lib/utilsBundle");
const load = async (page, quality = "high", w = 1920, h = 1080, amount = "5732") => {
  await page.setViewportSize({ width: w, height: h });
  await page.goto(
    `/motion-studio?clean=1&tier=7&width=${w}&height=${h}&background=transparent&quality=${quality}&nickname=${"W".repeat(32)}&amount=${amount}`,
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.donation-motion[data-fonts-ready="true"]').waitFor();
  await page.locator('.donation-motion[data-money-renderer="ready"]').waitFor();
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
};
const seek = async (page, at) => {
  await page.evaluate((t) => window.motionStudio.renderExportAt(t, false), at);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].every((v) => !v.seeking),
  );
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
};
test("Donate7 exact frames reconstruct after reverse seeks; zero, three depths, calm and Information stay clean", async ({
  page,
}) => {
  await load(page);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const at of [15.49932, 16.24932, 23.64488, 37.65116, 38.40116, 45]) {
    await seek(page, at);
    const first = PNG.sync.read(await page.screenshot()).data;
    const headline = await page
      .locator(".d7-slam > div")
      .evaluateAll((chars) => chars.map((c) => getComputedStyle(c).transform));
    const pose = () =>
      page.locator(".d7-show *").evaluateAll((nodes) =>
        nodes.map((node) => {
          const style = getComputedStyle(node),
            box = node.getBoundingClientRect();
          return [
            style.transform,
            style.opacity,
            style.visibility,
            style.fontVariationSettings,
            box.x,
            box.y,
            box.width,
            box.height,
          ];
        }),
      );
    const firstPose = await pose();
    await seek(page, at + 0.25);
    await seek(page, at);
    expect(
      await page
        .locator(".d7-slam > div")
        .evaluateAll((chars) => chars.map((c) => getComputedStyle(c).transform)),
      `adjacent backwards ${at}`,
    ).toEqual(headline);
    await seek(page, 2);
    await seek(page, at);
    const repeated = PNG.sync.read(await page.screenshot()).data;
    expect(await pose(), `exact glyph/source/donor geometry ${at}`).toEqual(firstPose);
    let changed = 0;
    for (let i = 0; i < first.length; i += 4)
      if ([0, 1, 2, 3].some((channel) => Math.abs(first[i + channel] - repeated[i + channel]) > 24))
        changed++;
    // SwiftShader rerasterizes transformed glyph/shadow edges after a backwards seek.
    // The outlined variable type rerasterizes more edges than Version A.
    // Bound that host-specific raster difference to0.2%; ALL computed poses remain exact above.
    // Analytic particle drawing/reconstruction is independently checked in renderer unit tests.
    expect(changed, `seek ${at}`).toBeLessThanOrEqual(4147);
  }
  await seek(page, 38.45);
  const stats = await page.evaluate(() => window.motionStudio.status().spectacle);
  expect(stats.particles).toBeLessThanOrEqual(480);
  for (const depth of ["back", "mid", "front"]) expect(stats[depth]).toBeGreaterThan(0);
  await seek(page, 29.65);
  expect((await page.evaluate(() => window.motionStudio.status().spectacle)).particles).toBe(0);
  await seek(page, 0);
  const zero = PNG.sync.read(await page.screenshot({ omitBackground: true })).data;
  // Test the actual exported frame, including the shared frame-zero visibility gate.
  expect(
    zero.some((v, i) => i % 4 === 3 && v > 0),
    "transparent frame zero",
  ).toBe(false);
  await seek(page, 46.23397);
  expect((await page.evaluate(() => window.motionStudio.status().spectacle)).particles).toBe(0);
  await page.evaluate(() => window.motionStudio.information());
  expect(await page.locator(".d7-spectacle:visible").count()).toBe(0);
  expect(
    await page.evaluate(() => window.motionStudio.status().media.every((m) => m.state === "idle")),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("Donate7 geometry covers four aspect ratios and all requested amounts without inflating source", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const [w, h] of [
    [1920, 1080],
    [1920, 1200],
    [3440, 1440],
    [5120, 1440],
  ])
    for (const amount of [
      "500",
      "5732",
      "99999",
      "213769",
      "1500000",
      "9999999",
      "100000000",
      "999999999999",
    ]) {
      await load(page, "safe", w, h, amount);
      for (const previous of [0, 38.45]) {
        await seek(page, previous);
        await seek(page, 15.49932);
        expect(
          await page
            .locator(".motion-amount-number > div")
            .evaluateAll((chars) =>
              chars.every((char) => Number(getComputedStyle(char).opacity) === 1),
            ),
        ).toBe(true);
        expect(
          await page
            .locator(".motion-amount")
            .evaluate((node) => Number(getComputedStyle(node).opacity)),
        ).toBe(1);
      }
      await seek(page, 38.45);
      const boxes = await page.evaluate(() => {
        const n = document.querySelector(".motion-name").getBoundingClientRect(),
          a = document.querySelector(".motion-amount").getBoundingClientRect(),
          v = document.querySelector(".d7-main-monitor").getBoundingClientRect();
        return {
          n: { right: n.right, bottom: n.bottom, left: n.left },
          a: { right: a.right, top: a.top, left: a.left },
          sourceWidth: v.width,
          paper: (() => {
            const p = document.querySelector(".d7-donor").getBoundingClientRect();
            return { center: p.x + p.width / 2, bottom: p.bottom };
          })(),
          name: document.querySelector(".motion-name").textContent,
        };
      });
      expect(boxes.name).toBe("W".repeat(32));
      expect(boxes.a.top - boxes.n.bottom).toBeGreaterThan(4);
      expect(boxes.a.right).toBeLessThan(w);
      expect(boxes.a.left).toBeGreaterThan(0);
      expect(Math.abs(boxes.paper.center - w / 2)).toBeLessThan(w * 0.02);
      expect(boxes.paper.bottom).toBeLessThan(h);
      expect(boxes.sourceWidth / (h / 1080)).toBeLessThan(280);
    }
});

test("Donate7 cold font loads precede glyph measurement and money uses the original project asset", async ({
  page,
}) => {
  await page.route(/\.woff2(?:\?|$)/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await load(page, "safe");
  const fonts = await page.evaluate(() => [
    document.fonts.check('700 132px "DynaPuff Variable"', "POJEB!!!"),
    document.fonts.check('800 52px "Roboto Flex Variable"', "Łąęśźżółń"),
  ]);
  expect(fonts).toEqual([true, true]);
  expect(
    await page.locator(".d7-banknote-asset").evaluate((i: HTMLImageElement) => ({
      src: i.currentSrc,
      loaded: i.complete && i.naturalWidth > 0,
    })),
  ).toEqual({ src: expect.stringContaining("banknote-particle.png"), loaded: true });
  await seek(page, 16.8);
  const first = await page.locator(".d7-slam").boundingBox();
  await seek(page, 0);
  await page.evaluate(() => window.motionStudio.play());
  await page.waitForFunction(() => window.motionStudio.status().playing);
  await page.evaluate(() => window.motionStudio.pause());
  await seek(page, 16.8);
  expect(await page.locator(".d7-slam").boundingBox()).toEqual(first);
});
test("Donate7 full normal speed completes the existing nickname/amount/message/outro lifecycle", async ({
  page,
}) => {
  test.setTimeout(80000);
  await load(page, "safe");
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  await page.evaluate(() => window.motionStudio.playFull());
  const phases = new Set();
  await page.waitForFunction(() => window.motionStudio.status().playing);
  for (let i = 0; i < 650; i++) {
    const s = await page.evaluate(() => window.motionStudio.status());
    phases.add(s.phase);
    if (s.phase === "complete") break;
    await page.waitForTimeout(100);
  }
  for (const phase of ["hero", "tts-nickname", "tts-amount", "tts-message", "outro", "complete"])
    expect(phases.has(phase), JSON.stringify([...phases])).toBe(true);
});
