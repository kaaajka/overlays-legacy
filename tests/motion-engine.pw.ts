import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

declare global {
  interface Window {
    motionStudio?: {
      seek: (time: number) => void;
      information: (readingMs: number) => void;
      status: () => { duration: number; time: number; quality: string; playing: boolean };
    };
    motionQueueObserved: string[];
    motionRafCalls: number;
  }
}

const heroes = [3.06503, 3.66875, 4.82975, 4.52789, 4.82975, 3.90095, 13.21215, 13.21215];
const artifacts = ".motion-qa";
mkdirSync(artifacts, { recursive: true });

for (let tier = 1; tier <= 8; tier++) {
  test(`Donate${tier} deterministic hero, readable information and transparent canvas`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/motion-studio?clean=1&tier=${tier}&background=transparent&quality=high`);
    await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
    await page.evaluate(() => document.fonts.ready);
    const hero = heroes[tier - 1];
    for (const [label, delta] of [
      ["before", -0.05],
      ["exact", 0],
      ["after", 0.05],
    ] as const) {
      await page.evaluate((time) => window.motionStudio.seek(time), hero + delta);
      if (delta >= 0) {
        const separation = await page.evaluate(() => {
          const name = document.querySelector(".motion-name").getBoundingClientRect();
          const letters = [...document.querySelectorAll(".motion-amount-number > div")].map(
            (el) => el.getBoundingClientRect().top,
          );
          return Math.min(...letters) - name.bottom;
        });
        expect(separation).toBeGreaterThan(5);
      }
      await page.screenshot({
        path: `${artifacts}/donate${tier}-${label}.png`,
        omitBackground: true,
      });
    }
    const state = () =>
      page.evaluate(() =>
        Object.fromEntries(
          [".motion-amount", ".motion-emblem", ".motion-word", ".motion-name"].map((selector) => {
            const style = getComputedStyle(document.querySelector(selector));
            return [selector, [style.opacity, style.transform, style.visibility]];
          }),
        ),
      );
    await page.evaluate((time) => window.motionStudio.seek(time), hero);
    const first = await state();
    await page.evaluate(() => window.motionStudio.seek(0));
    await page.evaluate((time) => window.motionStudio.seek(time), hero + 4);
    await page.evaluate((time) => window.motionStudio.seek(time), hero);
    expect(await state()).toEqual(first);
    expect(
      await page.locator(".motion-amount").evaluate((el) => getComputedStyle(el).opacity),
    ).toBe("1");
    expect(await page.locator(".donation-motion").getAttribute("data-quality")).toBe("high");
    // Canvas bytes prove alpha; no golden GPU-pixel assertion or vendor-specific exact colors.
    const alpha = await page.evaluate((time) => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      const gl = canvas.getContext("webgl2");
      window.motionStudio.seek(time);
      const bytes = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      let transparent = 0,
        drawn = 0;
      for (let i = 3; i < bytes.length; i += 4) {
        if (bytes[i] < 20) transparent++;
        if (bytes[i] > 30) drawn++;
      }
      return {
        transparent: transparent / (bytes.length / 4),
        drawn: drawn / (bytes.length / 4),
        error: gl.getError(),
      };
    }, hero);
    expect(alpha.error).toBe(0);
    expect(alpha.transparent).toBeGreaterThan(0.35);
    expect(alpha.drawn).toBeGreaterThan(0.001);
    await page.evaluate(() => window.motionStudio.information(6000));
    await expect(page.locator(".information-message")).toBeVisible();
    await page.screenshot({
      path: `${artifacts}/donate${tier}-information.png`,
      omitBackground: true,
    });
    expect(errors).toEqual([]);
  });
}

test("SAFE preserves the authored hero and information without WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === "webgl2") return null;
      return original.apply(this, [kind, ...args]);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/motion-studio?clean=1&tier=6&time=hero&background=checker");
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-quality", "safe");
  expect(await page.locator(".motion-amount").evaluate((el) => getComputedStyle(el).opacity)).toBe(
    "1",
  );
  await page.screenshot({ path: `${artifacts}/donate6-safe.png` });
});

test("music decode failure retains clock fallback and seeks", async ({ page }) => {
  await page.route("**/assets/donations/audio/*", (route) => route.abort());
  await page.goto("/motion-studio?clean=1&tier=6&time=hero");
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  expect((await page.evaluate(() => window.motionStudio.status())).duration).toBeCloseTo(
    21.76494,
    3,
  );
  await expect(page.locator(".motion-amount")).toBeVisible();
});

test("fixture donations complete FIFO with GPU failure and no idle animation loop", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const taskWindow = window;
    taskWindow.motionQueueObserved = [];
    taskWindow.motionRafCalls = 0;
    const original = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      taskWindow.motionRafCalls++;
      return original(callback);
    };
    new MutationObserver(() => {
      const node = document.querySelector(".donation-motion");
      if (node && !taskWindow.motionQueueObserved.includes(node.getAttribute("data-donation-id")))
        taskWindow.motionQueueObserved.push(node.getAttribute("data-donation-id"));
    }).observe(document, { childList: true, subtree: true });
  });
  const sockets: string[] = [];
  page.on("websocket", (socket) => {
    // Vite's HMR socket is expected in development; a backend account socket is not.
    if (!socket.url().startsWith("ws://127.0.0.1:5173/")) sockets.push(socket.url());
  });
  await page.goto(
    "/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-motion-queue&muteAudio=1&fast=1&motionQuality=safe",
  );
  await expect
    .poll(() => page.evaluate(() => window.motionQueueObserved))
    .toEqual(["motion-queue-1", "motion-queue-2", "motion-queue-3"]);
  await expect(page.locator(".donation-motion")).toHaveCount(0);
  expect(sockets).toEqual([]);
  await page.waitForTimeout(200);
  const previous = await page.evaluate(() => window.motionRafCalls);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.motionRafCalls)).toBeLessThanOrEqual(previous + 1);
});

test("long message scroll reaches every line and holds the final text", async ({ page }) => {
  const message = `${"Kaaajka, dzięki za stream! ".repeat(160)}OSTATNIA LINIA WIADOMOŚCI`;
  await page.goto(`/motion-studio?clean=1&tier=6&message=${encodeURIComponent(message)}`);
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => window.motionStudio.information(6000));
  await page.waitForTimeout(5800);
  const scroll = await page.locator(".information-message").evaluate((el) => ({
    top: el.scrollTop,
    overflow: el.scrollHeight - el.clientHeight,
    text: el.textContent,
  }));
  expect(scroll.top).toBeCloseTo(scroll.overflow, 0);
  expect(scroll.text.endsWith("OSTATNIA LINIA WIADOMOŚCI")).toBe(true);
});

test("WebGL context loss preserves the same hero timing and falls back", async ({ page }) => {
  await page.goto("/motion-studio?clean=1&tier=6&time=hero&quality=high");
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() =>
    document
      .querySelector("canvas")
      .getContext("webgl2")
      .getExtension("WEBGL_lose_context")
      .loseContext(),
  );
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-quality", "safe");
  await page.evaluate(() => window.motionStudio.seek(3.90095));
  expect(await page.locator(".motion-amount").evaluate((el) => getComputedStyle(el).opacity)).toBe(
    "1",
  );
});

test("calibration produces a short clock-scheduled flash", async ({ page }) => {
  await page.goto("/motion-studio?tier=6&visualSyncOffsetMs=33");
  await expect(page.locator("output")).toHaveText("Ready");
  await page.getByRole("button", { name: "Schedule click + flash" }).click();
  await expect
    .poll(() => page.locator(".calibration-flash").evaluate((el) => getComputedStyle(el).opacity), {
      intervals: [10],
      timeout: 2000,
    })
    .toBe("1");
  await expect
    .poll(() => page.locator(".calibration-flash").evaluate((el) => getComputedStyle(el).opacity), {
      intervals: [10],
      timeout: 2000,
    })
    .toBe("0");
});

test("detail changes and seeded replay preserve inspection time and reinitialize GPU", async ({
  page,
}) => {
  await page.goto("/motion-studio?tier=6&time=hero&quality=high");
  await expect(page.locator("output")).toHaveText("Ready");
  await page.locator("#studio-quality").selectOption("safe");
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-quality", "safe");
  expect(await page.locator(".motion-amount").evaluate((el) => getComputedStyle(el).opacity)).toBe(
    "1",
  );
  await page.locator("#studio-quality").selectOption("high");
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-quality", "high");
  await page.locator("#studio-seed").fill("replay-seed-2");
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-quality", "high");
  expect(await page.locator("#studio-time").inputValue()).toBe("3.901");
  await page.locator("#studio-tier").selectOption("3");
  await expect(page.locator(".motion-amount-number")).toHaveText("25,00");
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-quality", "high");
});

test("audio clock catches up after a dropped visual frame and supports pause/restart", async ({
  page,
}) => {
  await page.goto("/motion-studio?tier=6");
  await expect(page.locator("output")).toHaveText("Ready");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => window.motionStudio.status().time);
  await page.evaluate(() => {
    const start = performance.now();
    while (performance.now() - start < 500) {
      /* Simulate busy main thread. */
    }
  });
  const after = await page.evaluate(() => window.motionStudio.status().time);
  expect(after - before).toBeGreaterThan(0.4);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await page.evaluate(() => window.motionStudio.status().time);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBe(paused);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBe(0);
  writeFileSync(
    `${artifacts}/clock-stall.json`,
    JSON.stringify({ before, after, paused }, null, 2),
  );
  await page.screenshot({ path: `${artifacts}/studio-desktop.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${artifacts}/studio-mobile.png`, fullPage: true });
});
