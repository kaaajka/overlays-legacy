import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const ready = async (page, tier = 6) => {
  await page.goto(`/motion-studio?tier=${tier}&quality=safe&mode=hero`);
  await expect(page.locator("output")).toHaveText("Gotowe");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(()=>window.motionStudio.prepareSpeech());
};
const stageBox = async (page) => page.locator(".stage-frame").boundingBox();
const noOverflow = async (page) =>
  expect(
    await page.evaluate(() => ({
      x: document.documentElement.scrollWidth > innerWidth,
      y: document.documentElement.scrollHeight > innerHeight,
    })),
  ).toEqual({ x: false, y: false });
for (const [width, height] of [
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1680, 900],
  [1920, 1080],
  [2560, 1440],
])
  test(`docked desktop fits ${width} × ${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await ready(page);
    await noOverflow(page);
    const box = await stageBox(page);
    expect(box.width).toBeGreaterThan(440);
    expect(box.height).toBeGreaterThan(240);
    expect(box.width / box.height).toBeCloseTo(16 / 9, 3);
    await expect(page.getByRole("button", { name: "Odtwórz", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Eksport", exact: true })).toBeVisible();
  });
test("unsupported desktop and phone render only the blocking screen", async ({ page }) => {
  for (const size of [
    { width: 1024, height: 600 },
    { width: 390, height: 844 },
    { width: 1920, height: 650 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/motion-studio");
    await expect(
      page.getByRole("heading", { name: "Motion Studio wymaga dużego okna przeglądarki." }),
    ).toBeVisible();
    await expect(page.locator(".motion-studio")).toHaveCount(0);
    await expect(page.locator(".donation-motion")).toHaveCount(0);
    await noOverflow(page);
  }
});
test("pane resize, collapse, maximize, restore and persistence keep Stage fitted", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1680, height: 900 });
  await ready(page);
  const start = await page.evaluate(() => window.motionStudio.status().workspace);
  const divider = await page
    .getByRole("separator", { name: "Zmień szerokość warstw" })
    .boundingBox();
  await page.mouse.move(divider.x + 2, divider.y + 80);
  await page.mouse.down();
  await page.mouse.move(divider.x + 70, divider.y + 80, { steps: 5 });
  await page.mouse.up();
  expect(
    (await page.evaluate(() => window.motionStudio.status().workspace)).horizontal[0],
  ).toBeGreaterThan(start.horizontal[0]);
  const right = await page
    .getByRole("separator", { name: "Zmień szerokość inspektora" })
    .boundingBox();
  await page.mouse.move(right.x + 2, right.y + 80);
  await page.mouse.down();
  await page.mouse.move(right.x - 40, right.y + 80, { steps: 5 });
  await page.mouse.up();
  const timeline = await page
    .getByRole("separator", { name: "Zmień wysokość osi czasu" })
    .boundingBox();
  await page.mouse.move(timeline.x + 100, timeline.y + 2);
  await page.mouse.down();
  await page.mouse.move(timeline.x + 100, timeline.y - 50, { steps: 5 });
  await page.mouse.up();
  const before = await page.evaluate(() => window.motionStudio.status().workspace);
  await page.getByRole("button", { name: "Powiększ Podgląd · 1920 × 1080", exact: true }).click();
  expect((await stageBox(page)).width).toBeGreaterThan(1000);
  await page.getByRole("button", { name: "Przywróć układ", exact: true }).first().click();
  const restored = await page.evaluate(() => window.motionStudio.status().workspace);
  restored.horizontal.forEach((n, i) => {
    expect(n).toBeCloseTo(before.horizontal[i], 4);
  });
  restored.vertical.forEach((n, i) => {
    expect(n).toBeCloseTo(before.vertical[i], 4);
  });
  await page.getByRole("button", { name: "Powiększ Oś czasu", exact: true }).click();
  expect((await page.locator('[data-panel="timeline"]').boundingBox()).height).toBeGreaterThan(800);
  await page.getByRole("button", { name: "Przywróć układ", exact: true }).first().click();
  await page.getByRole("button", { name: "Pokaż / ukryj warstwy" }).click();
  expect((await page.locator('[data-panel="tree"]').boundingBox())?.width ?? 0).toBeLessThan(1);
  await page.getByRole("button", { name: "Pokaż / ukryj warstwy" }).click();
  await page.getByRole("button", { name: "Pokaż / ukryj inspektor" }).click();
  await page.getByRole("button", { name: "Pokaż / ukryj inspektor" }).click();
  await noOverflow(page);
  const persisted = await page.evaluate(() => window.motionStudio.status().workspace);
  await page.reload();
  await expect(page.locator("output")).toHaveText("Gotowe");
  const reloaded = await page.evaluate(() => window.motionStudio.status().workspace);
  reloaded.horizontal.forEach((n, i) => {
    expect(n).toBeCloseTo(persisted.horizontal[i], 4);
  });
  await page.getByRole("button", { name: "Przywróć domyślny układ" }).click();
  await page.getByRole("separator", { name: "Zmień szerokość warstw" }).press("ArrowRight");
  await page.reload();
  await expect(page.locator("output")).toHaveText("Gotowe");
  expect(
    (await page.evaluate(() => window.motionStudio.status().workspace)).horizontal[0],
  ).toBeGreaterThan(14);
});
test("manual viewer zoom and hard clipping remain local; text editing remains selectable", async ({
  page,
}) => {
  await ready(page);
  await page.getByLabel("Powiększenie podglądu").selectOption("1");
  await noOverflow(page);
  expect(
    await page.locator(".viewer-viewport").evaluate((node) => node.scrollWidth > node.clientWidth),
  ).toBe(true);
  expect(
    await page.locator(".stage-frame").evaluate((node) => ({
      overflow: getComputedStyle(node).overflow,
      contain: getComputedStyle(node).contain,
    })),
  ).toEqual({ overflow: "hidden", contain: "paint" });
  expect(
    await page.locator(".timeline-toolbar").evaluate((node) => getComputedStyle(node).userSelect),
  ).toBe("none");
  await page.getByLabel("Nazwa", { exact: true }).fill("Editable text");
  await page.getByLabel("Nazwa", { exact: true }).press("Control+a");
  expect(
    await page
      .getByLabel("Nazwa", { exact: true })
      .evaluate((node) => node.selectionEnd - node.selectionStart),
  ).toBe(13);
  await page.getByLabel("Powiększenie podglądu").selectOption("fit");
  await page.getByLabel("Tło podglądu").selectOption("transparent");
  await expect(page.locator(".studio-stream")).toHaveCount(0);
});
test("Full timeline uses shared overlap and deterministically seeks information/outro", async ({
  page,
}) => {
  await ready(page);
  const hero = await page.evaluate(() => window.motionStudio.status().duration);
  await page.getByRole("button", { name: "Pełny alert", exact: true }).click();
  const status = await page.evaluate(() => window.motionStudio.status());
  const speech = status.speech;
  expect(status.timelineDuration).toBeGreaterThan(hero);
  expect(status.plan.informationStart).toBeCloseTo(hero, 4);
  const information = status.plan.stages.find((s) => s.name === "information");
  for (const clip of speech) {
    const stage = status.plan.stages.find((s) => s.name === `tts-${clip.name}`);
    expect(stage.end - stage.start).toBeCloseTo(clip.duration, 5);
    expect(information.start).toBeLessThanOrEqual(stage.start);
    expect(information.end).toBeGreaterThanOrEqual(stage.end);
    await expect(page.locator(`[data-tts="${clip.name}"]`)).toHaveCount(1);
  }
  await page.getByRole("button", { name: "Edytuj czas alertu" }).click();
  await page.getByLabel("Czas alertu", { exact: true }).fill((hero + 2).toFixed(3));
  await page.getByLabel("Czas alertu", { exact: true }).press("Enter");
  await expect(page.locator(".information-message")).toBeVisible();
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBeCloseTo(hero + 2, 3);
  const outro = status.plan.stages.find((s) => s.name === "outro");
  await page.getByRole("button", { name: "Edytuj czas alertu" }).click();
  await page.getByLabel("Czas alertu", { exact: true }).fill((outro.start + 0.325).toFixed(3));
  await page.getByLabel("Czas alertu", { exact: true }).press("Enter");
  expect(
    await page
      .locator(".donation-motion")
      .evaluate((node) => Number(getComputedStyle(node).opacity)),
  ).toBeCloseTo(0.5, 3);
  await page.getByRole("button", { name: "Edytuj czas alertu" }).click();
  await page.getByLabel("Czas alertu", { exact: true }).fill(status.plan.duration.toFixed(3));
  await page.getByLabel("Czas alertu", { exact: true }).press("Enter");
  expect(await page.evaluate(() => window.motionStudio.status().phase)).toBe("complete");
});
test("native PCM from actual speech accompanies highlights, direct preview and complete Full Alert", async ({
  page,
}) => {
  test.setTimeout(50000);
  await page.addInitScript(() => {
    window["speechMeasurements"] = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (this.src.includes("/tts/audio/"))
        this.addEventListener(
          "playing",
          () => {
            const audio = this;
            const context = new AudioContext();
            const source = context.createMediaElementSource(audio);
            const analyser = context.createAnalyser();
            source.connect(analyser);
            analyser.connect(context.destination);
            void context.resume();
            setTimeout(() => {
              const values = new Float32Array(analyser.fftSize);
              analyser.getFloatTimeDomainData(values);
              window["speechMeasurements"].push({
                file: audio.src.split("/").at(-1),
                time: audio.currentTime,
                paused: audio.paused,
                rms: Math.sqrt(values.reduce((sum, n) => sum + n * n, 0) / values.length),
              });
            }, 350);
            audio.addEventListener("ended", () => void context.close(), { once: true });
          },
          { once: true },
        );
      return play.call(this);
    };
  });
  await ready(page);
  await page.getByRole("button", { name: "Pełny alert", exact: true }).click();
  const speech = await page.evaluate(() => window.motionStudio.status().speech);
  for (const clip of speech) {
    await page.locator(`[data-tts="${clip.name}"]`).dblclick();
    await expect(page.locator(`[data-tts="${clip.name}"]`)).toHaveClass(/audible/);
    await expect
      .poll(() =>
        page.evaluate(
          (file) => window["speechMeasurements"].filter((m) => m.file === file).length,
          clip.key,
        ),
      )
      .toBe(1);
    await page.getByRole("button", { name: "Od początku", exact: true }).click();
  }
  const measurements = await page.evaluate(() => window["speechMeasurements"]);
  for (const sample of measurements) {
    expect(sample.time).toBeGreaterThan(0.1);
    expect(sample.paused).toBe(false);
    expect(sample.rms).toBeGreaterThan(0.00001);
  }
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  for (const clip of speech) {
    await expect
      .poll(() => page.evaluate(() => window.motionStudio.status().audibleTts), { timeout: 30000 })
      .toBe(clip.name);
    await expect(page.locator(`[data-tts="${clip.name}"]`)).toHaveClass(/audible/);
    const at = await page.evaluate(() => window.motionStudio.status().time);
    const stage = (await page.evaluate(() => window.motionStudio.status().plan)).stages.find(
      (s) => s.name === `tts-${clip.name}`,
    );
    expect(at).toBeGreaterThanOrEqual(stage.start - 0.05);
    expect(at).toBeLessThan(stage.end + 0.2);
  }
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status().phase), { timeout: 8000 })
    .toBe("complete");
  const final = await page.evaluate(() => window.motionStudio.status());
  expect(final.time).toBeCloseTo(final.timelineDuration, 4);
});
test("pointer range/scrub, context actions, wheel zoom and sticky headers remain local", async ({
  page,
}) => {
  await ready(page);
  const ruler = await page.locator(".ruler .timeline-body").boundingBox();
  await page.mouse.move(ruler.x + 150, ruler.y + 15);
  await page.keyboard.down("Shift");
  await page.mouse.down();
  await page.mouse.move(ruler.x + 250, ruler.y + 15, { steps: 5 });
  await page.mouse.up();
  await page.keyboard.up("Shift");
  const selection = await page.evaluate(() => window.motionStudio.status().selection);
  expect(selection[1] - selection[0]).toBeGreaterThan(0.3);
  expect(await page.evaluate(() => getSelection().toString())).toBe("");
  await page.locator(".cue-marker.hero").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Przejdź do punktu" }).click();
  expect(await page.evaluate(() => window.motionStudio.status().cue)).toBe("heroDrop");
  await page.mouse.move(ruler.x + 350, ruler.y + 50);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -300);
  await page.keyboard.up("Control");
  expect(Number(await page.getByLabel("Powiększenie osi czasu").inputValue())).toBeGreaterThan(1);
  await noOverflow(page);
});
test("real stream reference is local and explicit audio failure remains visible", async ({
  page,
}) => {
  await ready(page);
  await expect(page.locator(".studio-stream")).toHaveAttribute(
    "src",
    "/__studio-assets/stream/kaaajka-rocket-league.jpg",
  );
  expect(await page.locator(".studio-stream").evaluate((image) => image.naturalWidth)).toBe(2560);
  await page.route(/\/(?:assets\/donations\/audio|__studio-assets\/music)\//, (route) =>
    route.abort(),
  );
  await page.locator("#studio-tier").selectOption("5");
  await expect(page.locator("output")).toContainText("BŁĄD MUZYKI");
  await expect(page.locator("output")).toContainText("donation-template-05.mp3");
  await expect(page.locator("output")).toContainText("TRYB BEZGŁOŚNY");
});

test("Center playhead uses the actual sticky-header viewport at early and late times", async ({
  page,
}) => {
  await ready(page);
  await page.getByLabel("Powiększenie osi czasu", { exact: true }).fill("8");
  for (const at of [3.9, 18]) {
    await page.getByRole("button", { name: "Edytuj czas alertu" }).click();
    await page.getByLabel("Czas alertu", { exact: true }).fill(String(at));
    await page.getByLabel("Czas alertu", { exact: true }).press("Enter");
    await page.getByRole("button", { name: "Wyśrodkuj głowicę", exact: true }).click();
    const delta = await page.evaluate(() => {
      const viewport = document.querySelector(".timeline-scroll").getBoundingClientRect();
      const playhead = document
        .querySelector(".timeline-global-overlay .timeline-playhead")
        .getBoundingClientRect();
      return playhead.x - (viewport.x + 150 + (viewport.width - 150) / 2);
    });
    expect(Math.abs(delta)).toBeLessThan(3);
  }
});

test("failed direct speech is explicitly labelled without an audible highlight", async ({
  page,
}) => {
  await ready(page);
  await page.route("**/__studio/tts/audio/*", (route) => route.abort());
  await page.getByRole("button", { name: "Pełny alert", exact: true }).click();
  await page.locator('[data-tts="nickname"]').dblclick();
  await expect(page.locator("output")).toContainText("BŁĄD CZYTANIA");

  await expect(page.locator(".tts-region.audible")).toHaveCount(0);
});

test("custom frame selection remains local and transparent preview excludes it", async ({
  page,
}) => {
  await ready(page);
  await page.getByLabel("Własny obraz streama").setInputFiles({
    name: "local-reference.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGP8zwACTGCSAQANHQEDgslx/wAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(page.locator(".studio-stream")).toHaveAttribute("src", /^blob:/);
  await page.getByLabel("Tło podglądu", { exact: true }).selectOption("transparent");
  await expect(page.locator(".studio-stream")).toHaveCount(0);
  await page.getByLabel("Tło podglądu", { exact: true }).selectOption("stream");
  await expect(page.locator(".studio-stream")).toHaveAttribute("src", /^blob:/);
  await page.reload();
  await expect(page.locator(".studio-stream")).toHaveAttribute(
    "src",
    "/__studio-assets/stream/kaaajka-rocket-league.jpg",
  );
});
for (let tier = 1; tier <= 7; tier++)
  test(`Donate${tier} actual music decodes non-silent PCM`, async ({ page }) => {
    await ready(page, tier);
    const file = JSON.parse(
      readFileSync(`src/donations/choreography/donate${tier}/analysis.json`, "utf8"),
    ).source;
    const result = await page.evaluate(async (file) => {
      const context = new AudioContext();
      try {
        const response = await fetch(`/assets/donations/audio/${file}`);
        const audio = await context.decodeAudioData(await response.arrayBuffer());
        const values = audio.getChannelData(0);
        let sum = 0;
        for (const n of values) sum += n * n;
        return {
          duration: audio.duration,
          rms: Math.sqrt(sum / values.length),
          status: response.status,
        };
      } finally {
        await context.close();
      }
    }, file);
    expect(result.status).toBe(200);
    expect(result.rms).toBeGreaterThan(0.01);
    expect(result.duration).toBeGreaterThan(7);
  });
