import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

declare global {
  interface Window {
    motionStudio?: {
      seek: (time: number) => void;
      information: (readingMs: number) => void;
      status: () => {
        duration: number;
        time: number;
        quality: string;
        playing: boolean;
        media: {
          time: number;
          decodedTime: number;
          frame: number;
          state: string;
          frozen: boolean;
        }[];
      };
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
    if (tier <= 7)
      await page.waitForFunction(() =>
        window.motionStudio.status().media.every((layer) => layer.state === "ready"),
      );
    for (const [label, delta] of [
      ["initial", -hero],
      ["before", -0.05],
      ["exact", 0],
      ["after", 0.05],
      ["settle", 3],
    ] as const) {
      await page.evaluate((time) => window.motionStudio.seek(time), hero + delta);
      if (tier <= 7) {
        await page.waitForFunction(() =>
          [...document.querySelectorAll<HTMLVideoElement>(".source-video")].every(
            (video) => !video.seeking && video.readyState >= 2,
          ),
        );
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
      }
      if (tier <= 7)
        await expect
          .poll(() =>
            page.evaluate(() =>
              Math.max(
                ...window.motionStudio
                  .status()
                  .media.map((layer) => Math.abs(layer.decodedTime - layer.time)),
              ),
            ),
          )
          .toBeLessThan(0.035);
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
          [".motion-amount", ".motion-name"].map((selector) => {
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
    expect(await page.locator(".donation-motion").getAttribute("data-quality")).toBe(
      tier <= 4 ? "safe" : "high",
    );
    // Canvas bytes prove alpha; no golden GPU-pixel assertion or vendor-specific exact colors.
    const alpha =
      tier <= 4
        ? null
        : await page.evaluate((time) => {
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
    if (alpha) {
      expect(alpha.error).toBe(0);
      expect(alpha.transparent).toBeGreaterThan(0.35);
      expect(alpha.drawn).toBeGreaterThan(0.001);
    }
    if (tier <= 7) {
      expect(await page.locator(".motion-emblem").count()).toBe(0);
      await page.waitForFunction(() =>
        [...document.querySelectorAll<HTMLVideoElement>("video")].every(
          (video) => !video.seeking && video.readyState >= 2,
        ),
      );
      const fidelity = await page.evaluate(async () => {
        const video = document.querySelector<HTMLVideoElement>("video");
        const pose = new Image();
        pose.src = video.poster;
        await pose.decode();
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(video, 0, 0);
        const actual = context.getImageData(0, 0, canvas.width, canvas.height).data;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(pose, 0, 0);
        const expected = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let error = 0,
          alphaError = 0,
          count = 0;
        for (let i = 0; i < actual.length; i += 4) {
          alphaError += Math.abs(actual[i + 3] - expected[i + 3]) / 255;
          if (expected[i + 3] > 240) {
            for (let channel = 0; channel < 3; channel++)
              error += Math.abs(actual[i + channel] - expected[i + channel]);
            count += 3;
          }
        }
        return { rgb: error / Math.max(1, count), alpha: alphaError / (actual.length / 4) };
      });
      writeFileSync(`${artifacts}/donate${tier}-fidelity.json`, JSON.stringify(fidelity));
      expect(fidelity.rgb).toBeLessThan(3);
      expect(fidelity.alpha).toBeLessThan(0.015);
      const media = await page.evaluate(() => window.motionStudio.status().media);
      expect(media.every((layer) => layer.frozen)).toBe(true);
      expect(
        await page.locator(`.source-media[data-media-tier="${tier}"]`).count(),
      ).toBeGreaterThan(0);
    }
    await page.evaluate(() => window.motionStudio.information(6000));
    await expect(page.locator(".information-message")).toBeVisible();
    expect(await page.locator("video[src]").count()).toBe(0);
    if (tier <= 7) await expect(page.locator(".scene-content")).toHaveCSS("display", "none");
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    await page.screenshot({
      path: `${artifacts}/donate${tier}-information.png`,
      omitBackground: true,
    });
    expect(errors).toEqual([]);
  });
}

test("all seven openings match after fresh initialization, backward seek and Restart", async ({
  page,
}) => {
  for (let tier = 1; tier <= 7; tier++) {
    await page.goto(`/motion-studio?tier=${tier}&quality=safe`);
    await expect(page.locator("output")).toHaveText("Ready");
    const opening = () =>
      page.evaluate(() => ({
        time: window.motionStudio.status().time,
        layers: [...document.querySelectorAll(".motion-name, .motion-amount, .source-media")].map(
          (element) => {
            const style = getComputedStyle(element);
            return {
              selector: element.className,
              opacity: style.opacity,
              visibility: style.visibility,
              transform: Array.from(
                new DOMMatrixReadOnly(
                  style.transform === "none" ? undefined : style.transform,
                ).toFloat64Array(),
              ),
            };
          },
        ),
        media: window.motionStudio.status().media.map((layer) => [layer.time, layer.frame]),
      }));
    const fresh = await opening();
    expect(fresh.time).toBe(0);
    expect(
      fresh.layers
        .filter((layer) => !layer.selector.includes("source-media"))
        .map((layer) => layer.opacity),
    ).toEqual(["0", "0"]);
    const mediaOpacity = fresh.layers
      .filter((layer) => layer.selector.includes("source-media"))
      .map((layer) => layer.opacity);
    expect(mediaOpacity.filter((opacity) => opacity === "0.25")).toHaveLength(1);
    expect(mediaOpacity.every((opacity) => opacity === "0" || opacity === "0.25")).toBe(true);
    await page.evaluate((time) => window.motionStudio.seek(time), heroes[tier - 1] + 3);
    await page.evaluate(() => window.motionStudio.seek(0));
    expect(await opening()).toEqual(fresh);
    await page.evaluate((time) => window.motionStudio.seek(time), heroes[tier - 1]);
    await page.getByRole("button", { name: "Restart", exact: true }).click();
    expect(await opening()).toEqual(fresh);
  }
});

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

test("failed WebM uses original GIF and information releases the fallback", async ({ page }) => {
  await page.route("**/assets/donations/media/*.webm", (route) => route.abort());
  await page.goto("/motion-studio?clean=1&tier=2&time=hero&quality=safe");
  await expect
    .poll(() => page.evaluate(() => window.motionStudio?.status().media[0]?.state))
    .toBe("gif-fallback");
  expect(await page.locator(".source-fallback").first().getAttribute("src")).toContain(
    "gif/donation-template-02.gif",
  );
  await page.evaluate(() => window.motionStudio.information(6000));
  expect(await page.locator("video[src], .source-fallback[src]").count()).toBe(0);
});

test("source video corrects after a main-thread stall and backwards inspection", async ({
  page,
}) => {
  await page.goto("/motion-studio?tier=2");
  await expect(page.locator("output")).toHaveText("Ready");
  await page.waitForFunction(() =>
    window.motionStudio.status().media.every((layer) => layer.state === "ready"),
  );
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const start = performance.now();
    while (performance.now() - start < 500) {
      /* stall */
    }
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.max(
          ...window.motionStudio
            .status()
            .media.map((layer) => Math.abs(layer.decodedTime - layer.time)),
        ),
      ),
    )
    .toBeLessThan(0.15);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.evaluate(() => window.motionStudio.seek(3.66875));
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status().media[0].decodedTime))
    .toBeCloseTo(2.52, 2);
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
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-quality", "safe");
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
