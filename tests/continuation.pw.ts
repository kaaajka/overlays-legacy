import { test, expect } from "@playwright/test";
const ready = async (page, url = "/motion-studio") => {
  await page.goto(url);
  await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  await page.evaluate(() => document.fonts.ready);
};
const state = (page) => page.evaluate(() => window.motionStudio.status());
test("Information pixels are independent of opacity animation history in every scene", async ({
  page,
}) => {
  for (let tier = 1; tier <= 7; tier++) {
    await ready(page, `/motion-studio?clean=1&tier=${tier}&background=solid&quality=safe`);
    const heroEnd = (await state(page)).duration;
    const render = async (time) => {
      await page.evaluate((time) => window.motionStudio.renderExportAt(time, true), time);
      await page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
    };
    await render(heroEnd + 0.5);
    const direct = await page.screenshot();
    await render(heroEnd - 0.03);
    await render(heroEnd + 0.5);
    expect(await page.screenshot()).toEqual(direct);
  }
});
test("a preview render failure preserves editable data and timeline", async ({ page }) => {
  await page.route("**/src/motion/engine/DonationScene.tsx*", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "import React from '/node_modules/.vite/deps/react.js'; export const DonationScene=React.forwardRef(function BrokenPreview(){throw new Error('QA injected scene failure');});",
    }),
  );
  await page.goto("/motion-studio");
  await expect(page.getByRole("alert")).toContainText("Podgląd przerwano");
  await expect(page.locator(".timeline-scroll")).toBeVisible();
  await page.getByLabel("Nazwa", { exact: true }).fill("Victor po błędzie");
  await expect(page.getByLabel("Nazwa", { exact: true })).toHaveValue("Victor po błędzie");
  await expect(page.getByRole("button", { name: "Ponów podgląd" })).toBeVisible();
});
const editTime = async (page, text) => {
  await page.getByRole("button", { name: "Edytuj czas alertu" }).click();
  await page
    .getByLabel("Czas alertu", { exact: true })
    .fill(Number.isFinite(Number(text)) ? Number(text).toFixed(3) : text);
  await page.getByLabel("Czas alertu", { exact: true }).press("Enter");
};
test("fresh product, nullable range, current TTS and resumable complete axis", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await ready(page);
  expect(await page.locator("#studio-tier").inputValue()).toBe("1");
  const initial = await state(page);
  expect(initial.mode).toBe("full");
  expect(initial.selection).toBeNull();
  expect(initial.loop).toBe(false);
  await page.getByLabel("Nazwa", { exact: true }).fill("Victor");
  await page.getByLabel("Kwota PLN", { exact: true }).fill("2137,69");
  await page.getByLabel("Wiadomość", { exact: true }).fill("To jest zupełnie nowa wiadomość");
  expect((await state(page)).speechDirty).toBe(true);
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  const now = await state(page);
  expect(now.speech.map((c) => c.text)).toEqual([
    "Victor",
    "dwa tysiące sto trzydzieści siedem złotych, sześćdziesiąt dziewięć groszy",
    "To jest zupełnie nowa wiadomość",
  ]);
  expect(
    now.speech.every(
      (c) => c.duration > 0 && c.hash.length === 64 && c.provider === "Windows SAPI",
    ),
  ).toBe(true);
  await editTime(page, "0:03.438");
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Pauza", exact: true }).click();
  const paused = (await state(page)).time;
  expect(paused).toBeGreaterThan(3.6);
  await page.waitForTimeout(200);
  expect((await state(page)).time).toBe(paused);
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Pauza", exact: true }).click();
  expect((await state(page)).time).toBeGreaterThan(paused + 0.2);
  for (const stage of now.plan.stages) {
    await editTime(page, String((stage.start + stage.end) / 2));
    expect(await page.locator(".motion-studio").count()).toBe(1);
  }
  await page.getByRole("button", { name: "Od początku", exact: true }).click();
  expect((await state(page)).time).toBe(0);
  expect(errors).toEqual([]);
});
test("Full loops reconstruct hero, TTS, crossing phases and outro", async ({ page }) => {
  await ready(page);
  const s = await state(page),
    a = s.plan.stages.find((x) => x.name === "tts-amount"),
    n = s.plan.stages.find((x) => x.name === "tts-nickname"),
    o = s.plan.stages.find((x) => x.name === "outro");
  for (const [start, end] of [
    [1, 1.4],
    [s.duration - 0.2, s.duration + 0.2],
    [a.start + 0.1, a.start + 0.5],
    [n.end - 0.2, n.end + 0.2],
    [o.start + 0.1, o.start + 0.4],
  ]) {
    await page.getByLabel("Loop IN", { exact: true }).fill(String(start));
    await page.getByLabel("Loop OUT", { exact: true }).fill(String(end));
    const loop = page.getByRole("button", { name: "Zapętl zakres", exact: true });
    if ((await loop.getAttribute("aria-pressed")) !== "true") await loop.click();
    await editTime(page, String(start));
    await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
    await page.waitForTimeout(1300);
    await page.getByRole("button", { name: "Pauza", exact: true }).click();
    const at = (await state(page)).time;
    expect(at).toBeGreaterThanOrEqual(start - 0.03);
    expect(at).toBeLessThanOrEqual(end + 0.03);
  }
  await page.getByRole("button", { name: "Wyczyść zakres", exact: true }).click();
  await expect.poll(async () => (await state(page)).selection).toBeNull();
  expect((await state(page)).loop).toBe(false);
  expect(await page.locator(".range-handle").count()).toBe(0);
});
test("inline validation, keyboard dialog, global axis and center geometry", async ({ page }) => {
  await ready(page);
  await editTime(page, "12.438");
  const at = (await state(page)).time;
  await page.getByRole("button", { name: "Edytuj czas alertu" }).click();
  await page.getByLabel("Czas alertu", { exact: true }).fill("nonsense");
  await page.getByLabel("Czas alertu", { exact: true }).press("Enter");
  await expect(page.getByRole("alert")).toContainText("Wpisz czas");
  expect((await state(page)).time).toBe(at);
  await page.getByLabel("Czas alertu", { exact: true }).press("Escape");
  await page.locator(".studio-brand").click();
  await page.keyboard.press("Shift+/");
  await expect(page.getByRole("dialog", { name: "Skróty klawiszowe" })).toBeVisible();
  const commands = await page.locator(".studio-shortcuts dd").evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }),
  );
  expect(commands).toHaveLength(11);
  expect(commands.every((command) => command.width > 200 && command.height < 40)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const duration = (await state(page)).timelineDuration;
  for (const zoom of [1, 4, 16, 64, 128]) {
    await page.getByLabel("Powiększenie osi czasu", { exact: true }).fill(String(zoom));
    for (const fraction of [0.1, 0.5, 0.9]) {
      await editTime(page, String(duration * fraction));
      const center = page.getByRole("button", { name: "Wyśrodkuj głowicę", exact: true });
      if (zoom === 1) {
        await expect(center).toBeDisabled();
        continue;
      }
      await center.click();
      const geometry = await page.evaluate(() => {
        const host = document.querySelector(".timeline-scroll").getBoundingClientRect();
        const header = document.querySelector(".track-label").getBoundingClientRect().width;
        const head = document
          .querySelector(".timeline-global-overlay .timeline-playhead")
          .getBoundingClientRect();
        const bodies = [...document.querySelectorAll(".timeline-body")].map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, width: r.width };
        });
        return { delta: head.x - (host.x + header + (host.width - header) / 2), bodies };
      });
      expect(Math.abs(geometry.delta)).toBeLessThan(3);
      expect(
        Math.max(...geometry.bodies.map((x) => x.width)) -
          Math.min(...geometry.bodies.map((x) => x.width)),
      ).toBeLessThan(0.1);
      expect(
        Math.max(...geometry.bodies.map((x) => x.x)) - Math.min(...geometry.bodies.map((x) => x.x)),
      ).toBeLessThan(0.1);
    }
  }
  expect(await page.locator(".timeline-playhead").count()).toBe(1);
});
for (const [width, height] of [
  [1280, 720],
  [1920, 1080],
  [1920, 1200],
  [2560, 1080],
  [3440, 1440],
  [3840, 1080],
  [3840, 2160],
  [5120, 1440],
])
  test(`all seven output compositions ${width}×${height}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height });
    for (let tier = 1; tier <= 7; tier++) {
      await ready(
        page,
        `/motion-studio?clean=1&tier=${tier}&width=${width}&height=${height}&quality=safe&nickname=${"W".repeat(32)}&amount=100000000&message=${"a".repeat(225)}`,
      );
      const hero = await page.evaluate(
        () => window.motionStudio.exportMetadata().cues.find((x) => x.name === "heroDrop").at,
      );
      await page.evaluate((at) => window.motionStudio.renderExportAt(at + 0.6, false), hero);
      await page.waitForTimeout(120);
      const bounds = await page.evaluate(() => {
        const root = document.querySelector(".donation-motion").getBoundingClientRect();
        const stage = document.querySelector(".motion-stage").getBoundingClientRect();
        const selectors = [".motion-name", ".motion-amount", ".source-media"];
        const elements = selectors
          .flatMap((sel) => [...document.querySelectorAll(sel)])
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, w: r.width, h: r.height };
          });
        return {
          root: { w: root.width, h: root.height },
          stage: { w: stage.width, h: stage.height },
          elements,
        };
      });
      expect(bounds.stage.w / bounds.stage.h).toBeCloseTo(width / height, 3);
      for (const b of bounds.elements) {
        expect(b.x).toBeGreaterThan(-1);
        expect(b.y).toBeGreaterThan(-1);
        expect(b.right).toBeLessThan(width + 1);
        expect(b.bottom).toBeLessThan(height + 1);
      }
      await page.evaluate(() => window.motionStudio.seek(0));
      await expect(page.locator(".donation-motion")).toHaveAttribute("data-time-zero", "true");
      await page.evaluate(() => window.motionStudio.information(16000));
      const card = await page.locator(".motion-information").boundingBox();
      expect(card.width).toBeLessThan(width * 0.8);
      expect(card.height).toBeLessThan(height * 0.8);
    }
  });
test("voice override changes immutable clips and durations", async ({ page }) => {
  await ready(page);
  const before = (await state(page)).speech;
  const voices = await page
    .getByLabel("Głos czytania")
    .locator("option")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("value")).filter((x) => x !== "scene"));
  expect(voices.length).toBeGreaterThan(0);
  if (voices.length > 1) {
    await page.getByLabel("Głos czytania").selectOption(voices[1]);
    await page.evaluate(() => window.motionStudio.prepareSpeech());
    const after = (await state(page)).speech;
    expect(after[0].voiceIdentity).not.toBe(before[0].voiceIdentity);
    expect(after[0].hash).not.toBe(before[0].hash);
  }
});

test("monitor anchor, two-axis pan and navigator edge zoom are actual DOM operations", async ({
  page,
}) => {
  await ready(page);
  const host = page.locator(".viewer-viewport");
  await page.getByLabel("Powiększenie podglądu", { exact: true }).selectOption("1");
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  const rect = await host.boundingBox();
  const x = rect.x + rect.width * 0.4,
    y = rect.y + rect.height * 0.4;
  const point = () =>
    page.evaluate(
      ({ x, y }) => {
        const r = document.querySelector(".stage-frame").getBoundingClientRect();
        const scale = Number(document.querySelector(".stage-frame").getAttribute("data-scale"));
        return { x: (x - r.x) / scale, y: (y - r.y) / scale };
      },
      { x, y },
    );
  const before = await point();
  await page.mouse.move(x, y);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -300);
  await page.keyboard.up("Control");
  await page.waitForTimeout(120);
  const after = await point();
  expect(Math.abs(after.x - before.x)).toBeLessThan(3);
  expect(Math.abs(after.y - before.y)).toBeLessThan(3);
  const pan = await host.evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }));
  await page.mouse.wheel(0, 150);
  await page.keyboard.down("Shift");
  await page.mouse.wheel(0, 140);
  await page.keyboard.up("Shift");
  await page.waitForTimeout(100);
  const next = await host.evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }));
  expect(next.x).toBeGreaterThan(pan.x);
  expect(next.y).toBeGreaterThan(pan.y);
  await page.getByLabel("Powiększenie osi czasu", { exact: true }).fill("4");
  const nav = page.locator(".navigator-window"),
    edge = page.getByRole("button", { name: "Prawa krawędź widoku" });
  const right = await edge.boundingBox();
  await page.mouse.move(right.x + right.width / 2, right.y + right.height / 2);
  await page.mouse.down();
  await page.mouse.move(right.x + 90, right.y + right.height / 2, { steps: 8 });
  await page.mouse.up();
  expect(
    Number(await page.getByLabel("Powiększenie osi czasu", { exact: true }).inputValue()),
  ).toBeLessThan(4);
  const windowRect = await nav.boundingBox();
  const initial = await page.locator(".timeline-scroll").evaluate((el) => el.scrollLeft);
  await page.mouse.move(windowRect.x + windowRect.width / 2, windowRect.y + windowRect.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    windowRect.x + windowRect.width / 2 + 110,
    windowRect.y + windowRect.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  expect(await page.locator(".timeline-scroll").evaluate((el) => el.scrollLeft)).toBeGreaterThan(
    initial,
  );
});

test("installed shell survives offline reload and reports missing local services", async ({
  page,
}) => {
  test.setTimeout(40000);
  await ready(page);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.waitForFunction(() => document.documentElement.dataset.studioOfflineReady === "true");
  await page.context().setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(".motion-studio")).toBeVisible({ timeout: 20000 });
  await expect(page.getByText("Usługi lokalne są niedostępne", { exact: true })).toBeVisible({
    timeout: 10000,
  });
  expect(await page.locator(".studio-brand").count()).toBe(1);
  await page.context().setOffline(false);
});

for (const format of [
  "1280x720",
  "1920x1080",
  "1920x1200",
  "2560x1080",
  "3440x1440",
  "3840x1080",
  "3840x2160",
  "5120x1440",
])
  test(`actual amount fitting across seven scenes ${format}`, async ({ page }) => {
    test.setTimeout(180000);
    await ready(page);
    await page.getByLabel("Format podglądu", { exact: true }).selectOption(format);
    await page.getByLabel("Nazwa", { exact: true }).fill("W".repeat(32));
    for (let tier = 1; tier <= 7; tier++) {
      await page.locator("#studio-tier").selectOption(String(tier));
      await page.waitForFunction(
        (tier) => window.motionStudio.status().media[0]?.tier === tier,
        tier,
      );
      const hero = await page.evaluate(
        () => window.motionStudio.exportMetadata().cues.find((c) => c.name === "heroDrop").at,
      );
      const timings = await page.evaluate(() =>
        window.motionStudio.exportMetadata().cues.map((c) => c.at),
      );
      for (const amount of [
        "0,01",
        "1",
        "2",
        "5",
        "21",
        "22",
        "57,32",
        "2137,69",
        "9999,99",
        "15000",
        "99999,99",
        "1000000",
      ]) {
        await page.getByLabel("Kwota PLN", { exact: true }).fill(amount);
        await page.evaluate(
          () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
        );
        await page.evaluate((at) => window.motionStudio.seek(at + 0.6), hero);
        const fit = await page.evaluate(() => {
          const root = document.querySelector(".donation-motion").getBoundingClientRect();
          const name = document.querySelector(".motion-name").getBoundingClientRect(),
            amount = document.querySelector(".motion-amount").getBoundingClientRect();
          return {
            name: { left: name.left - root.left, right: name.right - root.left, w: name.width },
            amount: {
              left: amount.left - root.left,
              right: amount.right - root.left,
              w: amount.width,
            },
            width: root.width,
            overlap:
              Math.min(name.right, amount.right) - Math.max(name.left, amount.left) > 1 &&
              Math.min(name.bottom, amount.bottom) - Math.max(name.top, amount.top) > 1,
            text: document.querySelector(".motion-amount").textContent,
          };
        });
        expect(fit.name.left).toBeGreaterThan(-1);
        expect(fit.amount.left).toBeGreaterThan(-1);
        expect(fit.name.right).toBeLessThan(fit.width + 1);
        expect(fit.amount.right).toBeLessThan(fit.width + 1);
        expect(fit.overlap).toBe(false);
        expect(fit.text).toContain("zł");
        expect(
          await page.evaluate(() => window.motionStudio.exportMetadata().cues.map((c) => c.at)),
        ).toEqual(timings);
      }
    }
  });
