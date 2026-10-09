import { expect, test } from "@playwright/test";

async function load(page, quality = "high") {
  await page.goto(
    `/motion-studio?clean=1&tier=7&quality=${quality}&background=transparent&seed=pixi-test&nickname=Kaaajka&amount=5732`,
  );
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.locator('.donation-motion[data-money-renderer="ready"]').waitFor();
}
async function seek(page, time) {
  await page.evaluate((t) => window.motionStudio.renderExportAt(t, false), time);
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].every((v) => !v.seeking),
  );
}
test("Pixi full-screen money has exact backward/restart poses, three depths, no private ticker and clean zero", async ({
  page,
}) => {
  await load(page);
  await seek(page, 38.4);
  const first = await page.evaluate(() => window.motionStudio.moneyFrame());
  for (const t of [2, 42, 0, 38.4]) await seek(page, t);
  expect(await page.evaluate(() => window.motionStudio.moneyFrame())).toEqual(first);
  await seek(page, 0);
  expect(await page.evaluate(() => window.motionStudio.moneyFrame())).toEqual([]);
  await page.evaluate(() => window.motionStudio.play());
  await page.waitForFunction(() => window.motionStudio.status().playing);
  await page.evaluate(() => window.motionStudio.pause());
  await seek(page, 38.4);
  expect(await page.evaluate(() => window.motionStudio.moneyFrame())).toEqual(first);
  const status = await page.evaluate(() => window.motionStudio.status().money);
  expect(status).toMatchObject({
    state: "ready",
    renderer: "PIXI",
    backend: "WebGL2",
    ticker: false,
    activeRenderers: 1,
  });
  await seek(page, 46.23397);
  expect(await page.evaluate(() => window.motionStudio.moneyFrame())).toEqual([]);
});
test("all money qualities cover both edges and upper/middle/lower stage with dominant MID and sparse FRONT", async ({
  page,
}) => {
  for (const quality of ["high", "medium", "safe"]) {
    await load(page, quality);
    const all = [];
    for (const t of [16.8, 24.5, 38.4, 40.3, 42]) {
      await seek(page, t);
      const { money, poses } = await page.evaluate(() => ({
        money: window.motionStudio.status().money,
        poses: window.motionStudio.moneyFrame(),
      }));
      expect(money.sprites).toBeLessThanOrEqual(money.budget);
      expect(money.ticker).toBe(false);
      all.push(...poses.filter((p) => p.x >= 0 && p.x <= 1920 && p.y >= 0 && p.y <= 1080));
    }
    for (const region of [
      (p) => p.x < 384,
      (p) => p.x > 1536,
      (p) => p.x > 768 && p.x < 1152,
      (p) => p.y < 270,
      (p) => p.y > 400 && p.y < 700,
      (p) => p.y > 810,
    ])
      expect(all.filter(region).length).toBeGreaterThan(4);
    expect(all.filter((p) => p.depth === "mid").length).toBeGreaterThan(
      all.filter((p) => p.depth === "back").length,
    );
    expect(all.filter((p) => p.depth === "front").length).toBeGreaterThan(0);
    expect(all.filter((p) => p.depth === "front").length / all.length).toBeLessThan(0.08);
  }
});
test("Pixi recreation does not accumulate renderers, canvases or interaction tickers", async ({
  page,
}) => {
  await load(page);
  for (let cycle = 0; cycle < 4; cycle++) {
    await seek(page, 29.8);
    expect(await page.evaluate(() => window.motionStudio.status().money.state)).toBe("ready");
    await seek(page, 40.3);
    expect(await page.locator(".d7-money").count()).toBe(1);
    expect(await page.evaluate(() => window.motionStudio.status().money.activeRenderers)).toBe(1);
    await page.evaluate(() => window.motionStudio.selectTier(1));
    await expect(page.locator(".d7-money")).toHaveCount(0);
    await page.evaluate(() => window.motionStudio.selectTier(7));
    await page.locator('.donation-motion[data-money-renderer="ready"]').waitFor();
  }
  await seek(page, 40.3);
  expect(await page.evaluate(() => window.motionStudio.status().money)).toMatchObject({
    activeRenderers: 1,
    ticker: false,
    state: "ready",
  });
});
test("WebGL context loss reports degradation while source, donor and complete speech lifecycle survive", async ({
  page,
}) => {
  test.setTimeout(85000);
  await load(page, "safe");
  await seek(page, 16.8);
  await page
    .locator(".d7-money")
    .evaluate((canvas) =>
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await seek(page, 16.8);
  expect(await page.evaluate(() => window.motionStudio.status().money)).toMatchObject({
    state: "degraded",
    activeRenderers: 0,
    sprites: 0,
  });
  expect(await page.locator(".motion-name").first().textContent()).toBe("Kaaajka");
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  await page.evaluate(() => window.motionStudio.playFull());
  await page.waitForFunction(() => window.motionStudio.status().phase === "complete", null, {
    timeout: 70000,
  });
  expect(await page.evaluate(() => window.motionStudio.status().money.state)).toBe("degraded");
});
test("WebGL initialization failure is explicit and leaves the DOM scene readable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (this.classList.contains("d7-money") && /webgl/.test(type)) return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto("/motion-studio?clean=1&tier=7&quality=safe");
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.locator('.donation-motion[data-money-renderer="degraded"]').waitFor();
  await seek(page, 16.8);
  expect(await page.evaluate(() => window.motionStudio.status().money.state)).toBe("degraded");
  expect(
    await page
      .locator(".motion-amount")
      .first()
      .evaluate((n) => getComputedStyle(n).opacity),
  ).toBe("1");
});

test("Studio quality switching recreates exactly one Pixi renderer and reports actual tools", async ({
  page,
}) => {
  await page.goto("/motion-studio?tier=7&quality=high");
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  for (const quality of ["safe", "medium", "high"]) {
    await page.locator("#studio-quality").selectOption(quality);
    await page.locator('.donation-motion[data-money-renderer="ready"]').waitFor();
    await seek(page, 40.3);
    expect(await page.evaluate(() => window.motionStudio.status().money)).toMatchObject({
      quality,
      activeRenderers: 1,
      ticker: false,
      state: "ready",
    });
  }
  // Diagnostics exist in the Inspector even when its tab is not selected.
  expect(await page.evaluate(() => window.motionStudio.status().money.renderer)).toBe("PIXI");
  const visibility = page.getByRole("button", { name: "Pokaż Gotówka", exact: true });
  await visibility.click();
  await expect(page.locator(".d7-money")).toHaveCSS("visibility", "hidden");
  await visibility.click();
  await expect(page.locator(".d7-money")).toHaveCSS("visibility", "visible");
});

test("the shared camera and continuous paper thread reconstruct the fold/unfold transition, including its shader", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await load(page);
  await expect(page.locator(".d7-world > .d7-money")).toHaveCount(1);
  await expect(page.locator(".d7-world > .d7-show")).toHaveCount(1);
  await expect(page.locator(".d7-world .d7-spectacle")).toHaveCount(3);
  const pose = () =>
    page.evaluate(() => ({
      camera: getComputedStyle(document.querySelector(".d7-world")).transform,
      path: document.querySelector(".d7-spine-ink").getAttribute("d"),
      title: getComputedStyle(document.querySelector(".d7-headline")).transform,
      filters: window.motionStudio.status().money.filters,
      money: window.motionStudio.moneyFrame(),
    }));
  await seek(page, 29.8);
  const folded = await pose();
  expect(folded.filters).toEqual(["Paper fold matte (custom GLSL)"]);
  expect(
    await page.locator(".d7-headline").evaluate((n) => Number(getComputedStyle(n).opacity)),
  ).toBeGreaterThan(0.2);
  await seek(page, 32.2);
  const open = await pose();
  expect(open.filters).toEqual([]);
  expect(open.path).not.toBe(folded.path);
  await seek(page, 2);
  await seek(page, 29.8);
  expect(await pose()).toEqual(folded);
  await seek(page, 32.2);
  expect(await pose()).toEqual(open);
  expect(await page.evaluate(() => window.motionStudio.status().money.state)).toBe("ready");
  expect(errors).toEqual([]);
});
