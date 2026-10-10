import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const open = async (page, query = "") => {
  const params = new URLSearchParams(
    "clean=1&tier=6&amount=21376&background=transparent&quality=high",
  );
  for (const [key, value] of new URLSearchParams(query.replace(/^&/, ""))) params.set(key, value);
  await page.goto(`/motion-studio?${params}`);
  await page.waitForFunction(
    () =>
      window.motionStudio?.status().duration > 0 && document.querySelector(".d6-hybrid")?.donation6,
  );
  await page.waitForFunction(() => window.motionStudio.status().media[0]?.state !== "loading");
};
const seek = async (page, time) => {
  await page.evaluate((at) => window.motionStudio.renderExportAt(at, true), time);
  if (time < 21.76494)
    await page.waitForFunction(() =>
      window.motionStudio
        .status()
        .media.every((layer) => layer.state === "ready" || layer.state === "gif-fallback"),
    );
  await page.waitForFunction(() =>
    [...document.querySelectorAll("video")].every((v) => !v.seeking),
  );
  await page.waitForTimeout(25);
};
const pose = (page) =>
  page.evaluate(() => {
    const s = document.querySelector(".d6-hybrid").donation6.snapshot();
    return { state: s.state, objects: s.objects, glyph: s.oGlyph, name: s.nameTypography };
  });
const pixels = (page) =>
  page.locator(".d6-renderer canvas").evaluate((canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl2"),
      bytes = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    let drawn = 0,
      camera = 0;
    for (let y = 0; y < canvas.height; y++)
      for (let x = 0; x < canvas.width; x++) {
        const alpha = bytes[(y * canvas.width + x) * 4 + 3];
        if (alpha) drawn++;
        if (
          x >= canvas.width * 0.766 &&
          y >= canvas.height * 0.407 &&
          y < canvas.height * 0.704 &&
          alpha
        )
          camera++;
      }
    return { drawn, camera, error: gl.getError() };
  });

test("Donate6 preserves approved hybrid poses and typography through 8.6 seconds", async ({
  page,
}) => {
  const reference = JSON.parse(
    readFileSync(new URL("./fixtures/donate6-approved-hybrid-poses.json", import.meta.url), "utf8"),
  );
  await open(page, "&nickname=Kaaajka");
  for (const expected of reference.poses) {
    await seek(page, expected.time);
    const actual = await pose(page);
    expect(actual.state).toEqual(expected.state);
    expect(actual.objects).toEqual(expected.objects);
    expect(actual.glyph).toEqual(expected.glyph);
    expect(actual.name).toEqual(expected.name);
  }
});

test("Donate6 reconstructs full-track direct/reverse seeks and exact transparent zero", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await open(page);
  for (const at of [3.6, 3.90095, 4.5, 7.6, 9.8, 11.8, 12.7942, 13.25, 15.5, 18.5, 20.9, 21.5]) {
    await seek(page, at);
    const first = await pose(page);
    await page.locator(".d6-renderer canvas").evaluate((c: HTMLCanvasElement) => {
      const gl = c.getContext("webgl2"),
        bytes = new Uint8Array(c.width * c.height * 4);
      gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      window.firstD6Pixels = bytes;
    });
    await seek(page, 24);
    await seek(page, 0);
    await seek(page, at);
    expect(await pose(page)).toEqual(first);
    const difference = await page
      .locator(".d6-renderer canvas")
      .evaluate((c: HTMLCanvasElement) => {
        const gl = c.getContext("webgl2"),
          bytes = new Uint8Array(c.width * c.height * 4);
        gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
        let sum = 0,
          changed = 0;
        for (let i = 0; i < bytes.length; i++) {
          const d = Math.abs(bytes[i] - window.firstD6Pixels[i]);
          sum += d;
          if (d > 3) changed++;
        }
        return { mean: sum / bytes.length, changed };
      });
    expect(difference.mean).toBeLessThan(0.001);
    expect(difference.changed).toBeLessThan(12);
    expect((await pixels(page)).error).toBe(0);
  }
  await seek(page, 3.90095);
  expect(await page.evaluate(() => window.motionStudio.status().media[0].frame)).toBe(29);
  await seek(page, 0);
  expect((await pixels(page)).drawn).toBe(0);
  await expect(page.locator(".motion-stage")).toHaveCSS("visibility", "hidden");
  expect(errors).toEqual([]);
});

test("Donate6 long names and amounts stay centered, GPU resources stable at all qualities/aspects", async ({
  page,
}) => {
  for (const [width, height] of [
    [1920, 1080],
    [1920, 1200],
    [2520, 1080],
    [3840, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    for (const quality of ["high", "medium", "safe"]) {
      await open(
        page,
        `&width=${width}&height=${height}&quality=${quality}&nickname=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef&amount=29999`,
      );
      await seek(page, 13.45);
      const s = await page.evaluate(() =>
        document.querySelector(".d6-hybrid").donation6.snapshot(),
      );
      expect(s.renderer).toBe("three");
      expect(s.quality).toBe(quality);
      expect(s.nameTypography.lines).toBe(2);
      expect(s.nameTypography.horizontalDistortion).toBe(false);
      expect(s.renderInfo.geometries).toBeGreaterThanOrEqual(15);
      expect(s.renderInfo.geometries).toBeLessThanOrEqual(16);
      // Three uploads lazily: hidden lower call and unused poster allocate only when needed.
      expect(s.renderInfo.textures).toBeGreaterThanOrEqual(3);
      expect(s.renderInfo.textures).toBeLessThanOrEqual(5);
      expect(Math.abs((s.bounds.reply.left + s.bounds.reply.right) / 2 - 960)).toBeLessThan(2);
      expect(s.bounds.reply.left).toBeGreaterThan(280);
      expect(s.bounds.reply.right).toBeLessThan(1640);
      await expect(page.locator(".motion-name")).toHaveText("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef");
      await expect(page.locator(".motion-amount-number")).toHaveText("299,99");
      expect((await pixels(page)).camera).toBe(0);
    }
  }
});

test("Donate6 integrated message preserves all Unicode content, paginates and reverses its physical outro", async ({
  page,
}) => {
  const message = `${"Pełna wiadomość z polskimi znakami. ".repeat(60)}KONIEC`;
  await open(page, `&message=${encodeURIComponent(message)}`);
  // Freeze the actual plan before testing its endpoint: auto-prepared speech
  // can legitimately extend the original minimum reading hold.
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  const snapshot = () =>
    page.evaluate(() => document.querySelector(".d6-hybrid").donation6.snapshot());
  await seek(page, 22.2);
  await expect(page.locator(".information-message")).toHaveText(message);
  expect(await page.locator("video[src]").count()).toBe(1);
  expect((await pixels(page)).drawn).toBeGreaterThan(1000);
  const first = await snapshot();
  expect(first.messageChapter.fullMessage).toBe(message);
  expect(first.messageChapter.lines.join("")).toBe(message);
  expect(first.messageChapter.pages).toBeGreaterThan(5);
  expect(first.messageChapter.stableFrontFacing).toBe(true);
  // Owner requested a compact reading ribbon. Assert actual onscreen type size,
  // rather than the old oversized surface's arbitrary world-space font size.
  expect(first.readingTypePixels1080.message * (720 / 1080)).toBeGreaterThanOrEqual(23);
  const plan = await page.evaluate(() => window.motionStudio.status().plan);
  await seek(page, plan.informationStart + plan.informationDuration - 0.1);
  const last = await snapshot();
  expect(last.messageChapter.page).toBe(last.messageChapter.pages);
  expect(last.messageChapter.pageLines.join("")).toContain("KONIEC");
  expect(last.objects).toEqual(first.objects);
  expect(last.state).toEqual(first.state);
  await seek(page, plan.duration - 0.2);
  expect((await snapshot()).messageChapter.open).toBeLessThan(1);
  expect((await snapshot()).objects[0].scale[0]).toBeLessThan(0.8);
  await seek(page, plan.duration);
  expect((await pixels(page)).drawn).toBe(0);
  await seek(page, 22.2);
  const restored = await snapshot();
  expect(restored.messageChapter).toEqual(first.messageChapter);
  expect(restored.objects).toEqual(first.objects);
  expect(restored.state).toEqual(first.state);
  await seek(page, 0);
  expect((await pixels(page)).drawn).toBe(0);
  await seek(page, 3.90095);
  expect(await page.evaluate(() => window.motionStudio.status().media[0].frame)).toBe(29);
});

test("Donate6 compact TTS preserves legible type and clears gameplay/HUD at 1080p and 720p", async ({
  page,
}) => {
  const name = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
  const message = "Pełna wiadomość, którą nadal trzeba wygodnie przeczytać. ".repeat(8);
  for (const [width, height] of [
    [1920, 1080],
    [1280, 720],
  ]) {
    await page.setViewportSize({ width, height });
    await open(
      page,
      `&width=${width}&height=${height}&nickname=${name}&message=${encodeURIComponent(message)}`,
    );
    await seek(page, 23);
    const s = await page.evaluate(() => document.querySelector(".d6-hybrid").donation6.snapshot());
    const b = s.bounds.message;
    expect((b.right - b.left) / 1920).toBeGreaterThanOrEqual(0.3);
    expect((b.right - b.left) / 1920).toBeLessThanOrEqual(0.4);
    expect((b.bottom - b.top) / 1080).toBeGreaterThanOrEqual(0.15);
    expect((b.bottom - b.top) / 1080).toBeLessThanOrEqual(0.2);
    expect(b.top).toBeGreaterThan(1080 * 0.72);
    expect(b.bottom).toBeLessThan(1080 - 50);
    expect(s.messageChapter.donorNameLines.join("")).toBe(name);
    expect(s.messageChapter.pageLines.length).toBeLessThanOrEqual(3);
    expect((s.readingTypePixels1080.message * height) / 1080).toBeGreaterThanOrEqual(
      height === 720 ? 23 : 34,
    );
    expect((s.readingTypePixels1080.nickname * height) / 1080).toBeGreaterThanOrEqual(
      height === 720 ? 15 : 22,
    );
    expect(s.readingTypePixels1080.amount).toBeLessThan(45);
    // Actual alpha, not just a DOM/geometry box: authored content cannot cover
    // the central action, scoreboard, webcam or lower-right boost HUD at rest.
    const coverage = await page
      .locator(".d6-renderer canvas")
      .evaluate((canvas: HTMLCanvasElement) => {
        const g = canvas.getContext("webgl2"),
          data = new Uint8Array(canvas.width * canvas.height * 4);
        g.readPixels(0, 0, canvas.width, canvas.height, g.RGBA, g.UNSIGNED_BYTE, data);
        const zones = [
          [0.25, 0.2, 0.74, 0.64],
          [0.39, 0, 0.62, 0.13],
          [0.766, 0.3, 1, 0.75],
          [0.84, 0.77, 1, 1],
        ];
        return zones.map(([left, top, right, bottom]) => {
          let count = 0;
          for (let y = Math.floor(top * canvas.height); y < bottom * canvas.height; y++)
            for (let x = Math.floor(left * canvas.width); x < right * canvas.width; x++)
              if (data[((canvas.height - 1 - y) * canvas.width + x) * 4 + 3]) count++;
          return count;
        });
      });
    expect(coverage).toEqual([0, 0, 0, 0]);
    expect(s.messageChapter.stableFrontFacing).toBe(true);
    expect((await pixels(page)).error).toBe(0);
  }
});

test("Donate6 waits for its actual self-hosted glyph face before building GPU textures", async ({
  page,
}) => {
  let release: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/roboto-flex*woff2*", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/motion-studio?tier=6&clean=1", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-fonts-ready", "false");
  expect(await page.locator(".d6-renderer canvas").count()).toBe(0);
  release();
  await expect(page.locator(".donation-motion")).toHaveAttribute("data-fonts-ready", "true");
  await page.waitForFunction(() => document.querySelector(".d6-hybrid")?.donation6);
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".d6-hybrid").donation6.snapshot().nameTypography
          .horizontalDistortion,
    ),
  ).toBe(false);
});

test("Donate6 WebM failure retains original GIF texture and the full information lifecycle", async ({
  page,
}) => {
  await page.route("**/donation-template-06.webm", (route) => route.abort());
  await open(page);
  await seek(page, 13.25);
  expect(await page.evaluate(() => window.motionStudio.status().media[0].state)).toBe(
    "gif-fallback",
  );
  expect((await pixels(page)).drawn).toBeGreaterThan(1000);
  await expect(page.locator(".source-fallback")).toHaveAttribute("src", /donation-template-06.gif/);
  await seek(page, 22.2);
  expect((await pixels(page)).drawn).toBeGreaterThan(1000);
  expect(
    await page.evaluate(
      () =>
        document.querySelector(".d6-hybrid").donation6.snapshot().messageChapter.stableFrontFacing,
    ),
  ).toBe(true);
});

test("Donate6 context loss gives readable DOM fallback, cleanup kills old renderer, restart restores source", async ({
  page,
}) => {
  await open(page);
  await seek(page, 13.25);
  await page.evaluate(() => {
    window.oldD6 = document.querySelector(".d6-hybrid").donation6;
    const gl = document.querySelector(".d6-renderer canvas").getContext("webgl2");
    gl.getExtension("WEBGL_lose_context").loseContext();
  });
  await expect(page.locator(".d6-hybrid")).toHaveAttribute("data-renderer", "dom-fallback");
  await expect(page.locator(".motion-amount-number")).toBeVisible();
  expect(await page.locator(".d6-renderer canvas").count()).toBe(0);
  await seek(page, 22.2);
  await expect(page.locator(".information-message")).toBeVisible();
  const fallback = await page.locator(".motion-information").boundingBox();
  expect(fallback.width / 1920).toBeLessThanOrEqual(0.4);
  expect(fallback.height / 1080).toBeLessThanOrEqual(0.23);
  expect(fallback.y).toBeGreaterThan(1080 * 0.7);
  await page.evaluate(() => window.motionStudio.seek(0));
  await seek(page, 3.90095);
  expect(await page.evaluate(() => window.motionStudio.status().media[0].frame)).toBe(29);
  await page.evaluate(() => window.motionStudio.selectTier(5));
  await expect(page.locator(".d6-hybrid")).toHaveCount(0);
  expect(await page.evaluate(() => window.oldD6.snapshot().disposed)).toBe(true);
});

test("Donate6 edits rebuild message ink, keep real TTS pagination timing and survive quality remounts", async ({
  page,
}) => {
  await open(page, "&clean=0&message=Stara%20wiadomość");
  await seek(page, 23);
  await page.getByLabel("Wiadomość", { exact: true }).fill("Nowa wiadomość. ".repeat(13));
  await page.getByLabel("Nazwa", { exact: true }).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef");
  await page.getByLabel("Kwota PLN", { exact: true }).fill("299.99");
  await page.evaluate(() => window.motionStudio.prepareSpeech());
  const plan = await page.evaluate(() => window.motionStudio.status().plan);
  const speech = plan.stages.find((stage) => stage.name === "tts-message");
  await seek(page, speech.start - 0.1);
  const snapshot = () =>
    page.evaluate(() => document.querySelector(".d6-hybrid").donation6.snapshot());
  expect((await snapshot()).messageChapter.page).toBe(1);
  await seek(page, speech.end - 0.1);
  const last = await snapshot();
  expect(last.messageChapter.pages).toBeGreaterThan(1);
  expect(last.messageChapter.page).toBe(last.messageChapter.pages);
  expect(last.messageChapter.fullMessage).toBe("Nowa wiadomość. ".repeat(13));
  expect(last.nameTypography.lines).toBe(2);
  await expect(page.locator(".motion-amount-number")).toHaveText("299,99");
  await page.selectOption("#studio-quality", "safe");
  await seek(page, speech.end - 0.1);
  expect((await snapshot()).messageChapter).toEqual(last.messageChapter);
  expect((await snapshot()).quality).toBe("safe");
  expect((await pixels(page)).error).toBe(0);
});

test("Donate6 live production waits for longer actual speech, resolves its outro and stops the sole frame loop", async ({
  page,
}) => {
  // Accelerate only the test music input; exercise the real DonateEvent and queue.
  const silence = Buffer.alloc(44 + 4800);
  silence.write("RIFF");
  silence.writeUInt32LE(silence.length - 8, 4);
  silence.write("WAVEfmt ", 8);
  silence.writeUInt32LE(16, 16);
  silence.writeUInt16LE(1, 20);
  silence.writeUInt16LE(1, 22);
  silence.writeUInt32LE(8000, 24);
  silence.writeUInt32LE(16000, 28);
  silence.writeUInt16LE(2, 32);
  silence.writeUInt16LE(16, 34);
  silence.write("data", 36);
  silence.writeUInt32LE(4800, 40);
  const longerSpeech = Buffer.alloc(44 + 8000 * 2 * 8);
  silence.copy(longerSpeech, 0, 0, 44);
  longerSpeech.writeUInt32LE(longerSpeech.length - 8, 4);
  longerSpeech.writeUInt32LE(longerSpeech.length - 44, 40);
  const fixture = JSON.parse(readFileSync("src/dev/fixtures/main-donate-prepare.json", "utf8"));
  Object.assign(fixture.args, {
    amount: 21376,
    commission: 0,
    message: "HALO!",
    nickname: "Kaaajka",
  });
  for (const voice of ["male", "female"])
    for (const part of ["nickname", "amount", "message"])
      fixture.args[`tts_${part}_google_${voice}`] = `/__qa-d6-tts/${part}.wav`;
  await page.route("**/src/dev/fixtures/main-donate-prepare.json*", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `export default ${JSON.stringify(fixture)}`,
    }),
  );
  await page.route("**/donation-template-06.mpga", (route) =>
    route.fulfill({ contentType: "audio/wav", body: silence }),
  );
  await page.route("**/__qa-d6-tts/*.wav", (route) =>
    route.fulfill({
      contentType: "audio/wav",
      headers: { "access-control-allow-origin": "*" },
      body: route.request().url().endsWith("message.wav") ? longerSpeech : silence,
    }),
  );
  await page.addInitScript(() => {
    window.d6Frames = 0;
    const request = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      // Count the production sampler; GSAP's existing auto-sleep housekeeping
      // callback does not animate this scene and is not its audio-clock loop.
      if (callback.name === "frame") window.d6Frames++;
      return request(callback);
    };
  });
  await page.goto(
    "/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&motionQuality=high",
  );
  await page
    .locator("button")
    .filter({ hasText: /audio|dźwięk/i })
    .first()
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".d6-hybrid")?.donation6?.snapshot().information?.speech?.duration > 7,
  );
  await page.waitForFunction(
    () => document.querySelector(".d6-hybrid").donation6.snapshot().information.elapsed > 6,
  );
  const visual = await page.evaluate(() =>
    document.querySelector(".d6-hybrid").donation6.snapshot(),
  );
  expect(visual.messageChapter.open).toBe(1);
  expect(visual.messageChapter.stableFrontFacing).toBe(true);
  expect(visual.information.reading).toBeGreaterThan(7);
  await page.evaluate(() => {
    window.lastD6 = document.querySelector(".d6-hybrid").donation6;
  });
  await expect(page.locator(".donation-motion")).toHaveCount(0, { timeout: 16000 });
  expect(await page.evaluate(() => window.lastD6.snapshot().disposed)).toBe(true);
  const frames = await page.evaluate(() => window.d6Frames);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.d6Frames)).toBeLessThanOrEqual(frames + 1);
});

test("Donate6 production FIFO carries dynamic data, ordered TTS and releases each GPU/audio context", async ({ page }) => {
  const wave = Buffer.alloc(44 + 1600);
  wave.write("RIFF"); wave.writeUInt32LE(wave.length - 8, 4); wave.write("WAVEfmt ", 8);
  wave.writeUInt32LE(16, 16); wave.writeUInt16LE(1, 20); wave.writeUInt16LE(1, 22);
  wave.writeUInt32LE(8000, 24); wave.writeUInt32LE(16000, 28);
  wave.writeUInt16LE(2, 32); wave.writeUInt16LE(16, 34);
  wave.write("data", 36); wave.writeUInt32LE(1600, 40);
  const base = JSON.parse(readFileSync("src/dev/fixtures/main-donate-prepare.json", "utf8"));
  const donations = ["Pierwszy donor", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef"].map((nickname, index) => {
    const fixture = structuredClone(base), id = `d6-release-fifo-${index}`;
    Object.assign(fixture, { id });
    Object.assign(fixture.args, { id, nickname, amount: index ? 29999 : 21376, commission: 0, message: index ? "" : "HALO!" });
    for (const voice of ["male", "female"])
      for (const part of ["nickname", "amount", "message"])
        fixture.args[`tts_${part}_google_${voice}`] = `/__qa-d6-fifo/${index}/${part}.wav`;
    return { payload: fixture, delayMs: index * 100 };
  });
  await page.route("**/src/dev/replay/fixtureIndex.ts*", route => route.fulfill({
    contentType: "application/javascript",
    body: `export const getLegacyFixture=()=>${JSON.stringify(donations)};export const listLegacyFixtureNames=()=>['main-donate-prepare'];`,
  }));
  await page.route("**/donation-template-06.mpga", route => route.fulfill({ contentType: "audio/wav", body: wave }));
  await page.route("**/__qa-d6-fifo/**/*.wav", route => route.fulfill({ contentType: "audio/wav", headers: { "access-control-allow-origin": "*" }, body: wave }));
  await page.addInitScript(() => {
    window.d6ReleaseObserved = []; window.d6ReleaseContexts = []; window.d6ReleaseSpeech = [];
    const Audio = window.AudioContext;
    window.AudioContext = class extends Audio {
      constructor(...args) { super(...args); window.d6ReleaseContexts.push(this); }
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (this.src.includes("/__qa-d6-fifo/")) window.d6ReleaseSpeech.push(new URL(this.src).pathname);
      return play.apply(this, args);
    };
    new MutationObserver(() => {
      const root = document.querySelector(".donation-motion"), host = root?.querySelector(".d6-hybrid"), api = host?.donation6;
      if (!api || window.d6ReleaseObserved.some(s => s.id === root.dataset.donationId)) return;
      window.d6ReleaseObserved.push({ id: root.dataset.donationId, nickname: host.dataset.nickname, amount: host.dataset.amount, api, gl: host.querySelector("canvas").getContext("webgl2") });
    }).observe(document, { childList: true, subtree: true, attributes: true });
  });
  await page.goto("/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&motionQuality=high");
  await page.locator("button").filter({ hasText: /audio|dźwięk/i }).first().click();
  await expect.poll(() => page.evaluate(() => window.d6ReleaseObserved.map(s => s.id)), { timeout: 20000 }).toEqual(["d6-release-fifo-0", "d6-release-fifo-1"]);
  await expect(page.locator(".donation-motion")).toHaveCount(0, { timeout: 15000 });
  const final = await page.evaluate(() => ({
    observed: window.d6ReleaseObserved.map(s => ({ id: s.id, nickname: s.nickname, amount: s.amount, disposed: s.api.snapshot().disposed, contextLost: s.gl.isContextLost() })),
    speech: window.d6ReleaseSpeech,
    contexts: window.d6ReleaseContexts.map(context => context.state),
    canvases: document.querySelectorAll(".d6-renderer canvas").length,
  }));
  expect(final.observed.map(s => s.nickname)).toEqual(["Pierwszy donor", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef"]);
  expect(final.observed.every(s => s.disposed && s.contextLost)).toBe(true);
  expect(final.canvases).toBe(0);
  expect(final.contexts.filter(state => state === "closed").length).toBeGreaterThanOrEqual(2);
  // One existing dev-fixture unlock context may remain; both donation clocks must close.
  expect(final.contexts.filter(state => state !== "closed").length).toBeLessThanOrEqual(1);
  expect(final.speech).toEqual([0, 1].flatMap(index => ["nickname", "amount", "message"].map(part => `/__qa-d6-fifo/${index}/${part}.wav`)));
});
