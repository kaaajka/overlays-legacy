import { expect, test } from "@playwright/test";
const ready = async (page) => {
  await page.goto("/motion-studio?tier=1&quality=safe&mode=hero");
  await expect(page.locator("output")).toHaveText("Gotowe");
  await page.evaluate(() => window.motionStudio.prepareSpeech());
};

test("editable PLN content, manual tier, stress data and local visibility", async ({ page }) => {
  await ready(page);
  await page.getByLabel("Nazwa", { exact: true }).fill("PotężnyWidz");
  await page.getByLabel("Kwota PLN", { exact: true }).fill("57,32");
  await page.getByLabel("Wiadomość", { exact: true }).fill("Pełna nowa wiadomość");
  await page.locator("#studio-tier").selectOption("6");
  await expect(page.locator("output")).toHaveText("Gotowe");
  await page.evaluate(() => window.motionStudio.seek(3.90095));
  await expect(page.locator(".motion-name")).toHaveText("PotężnyWidz");
  await expect(page.locator(".motion-amount-number")).toHaveText("57,32");
  await page.evaluate(() => window.motionStudio.information(6000));
  await expect(page.locator(".information-message")).toHaveText("Pełna nowa wiadomość");
  await page.getByLabel("Pokaż Nazwa", { exact: true }).click();
  await expect(page.locator(".motion-name")).toHaveAttribute("data-studio-hidden", "true");
  await page.getByLabel("Pokaż Nazwa", { exact: true }).click();
  await page.getByLabel("Kwota PLN", { exact: true }).fill("1.999");
  await expect(
    page.getByText("Wpisz PLN z maksymalnie dwiema cyframi po przecinku."),
  ).toBeVisible();
});

test("extreme names remain complete and separated across all seven heroes", async ({ page }) => {
  const nickname = "PotężnyWspierającySpołecznośćKaaajkiBezKońca".repeat(3);
  const heroes = [3.06503, 3.66875, 4.82975, 4.52789, 4.82975, 3.90095, 13.21215];
  for (let tier = 1; tier <= 7; tier++) {
    await page.goto(
      `/motion-studio?clean=1&tier=${tier}&quality=safe&time=hero&nickname=${encodeURIComponent(nickname)}&amount=987654321099`,
    );
    await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((time) => window.motionStudio.seek(time + 0.5), heroes[tier - 1]);
    const state = await page.evaluate(() => {
      const name = document.querySelector(".motion-name"),
        amount = document.querySelector(".motion-amount");
      return {
        text: name.textContent,
        size: Number.parseFloat(getComputedStyle(name).fontSize),
        gap: amount.getBoundingClientRect().top - name.getBoundingClientRect().bottom,
        letters: [...name.children].map((node) => getComputedStyle(node).opacity),
      };
    });
    expect(state.text).toBe(nickname);
    expect(state.size).toBeGreaterThanOrEqual(28);
    expect(state.gap).toBeGreaterThan(5);
    expect(state.letters.every((value) => value === "1")).toBe(true);
  }
});

test("word correction keeps its inspection position and creates a reviewable reaction", async ({
  page,
}) => {
  await page.goto("/motion-studio?tier=6&quality=safe");
  await expect(page.locator("output")).toHaveText("Gotowe");
  await page.locator(".word-region").first().click();
  const at = await page.evaluate(() => window.motionStudio.status().time);
  await page.getByRole("textbox", { name: "Słowo / fraza" }).fill("reviewed");
  await page.getByRole("button", { name: "Użyj jako punkt reakcji wokalnej" }).click();
  await expect(page.getByRole("heading", { name: "Zatwierdzono", exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBe(at);
  await expect(page.locator('.timeline-region[title*="vocal-reviewed"]')).toHaveCount(1);
});

test("zoom, selection loop, cue navigation and keyboard precision", async ({ page }) => {
  await ready(page);
  await page.getByLabel("Powiększenie osi czasu").fill("8");
  expect(
    await page.locator(".timeline-content").evaluate((el) => el.getBoundingClientRect().width),
  ).toBeGreaterThan(7000);
  await page.getByLabel("Loop IN", { exact: true }).fill("0.2");
  await page.getByLabel("Loop OUT", { exact: true }).fill("0.5");
  await page.getByRole("button", { name: "Zapętl zakres", exact: true }).click();
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBeLessThan(0.6);
  await page.getByRole("button", { name: "Pauza", exact: true }).click();
  await page.getByRole("button", { name: "Od początku", exact: true }).click();
  await page.locator("h2").first().click();
  await page.keyboard.press("Shift+ArrowRight");
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBeCloseTo(0.05, 3);
  await page.keyboard.press("ArrowDown");
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBeGreaterThan(0.05);
  await page.keyboard.press("Home");
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBe(0);
});

test("actual full alert enters information, plays three local TTS stages and completes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const task = window as typeof window & {
      spoken: string[];
      activeSpeech: Set<HTMLMediaElement>;
    };
    task.spoken = [];
    task.activeSpeech = new Set();
    const play = HTMLMediaElement.prototype.play,
      pause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.play = function () {
      if (this.src.includes("/tts/audio/")) {
        task.spoken.push(this.src.split("/").at(-1));
        task.activeSpeech.add(this);
        this.addEventListener("ended", () => task.activeSpeech.delete(this), { once: true });
      }
      return play.call(this);
    };
    HTMLMediaElement.prototype.pause = function () {
      task.activeSpeech.delete(this);
      return pause.call(this);
    };
  });
  await ready(page);
  await page.getByLabel("Nazwa", { exact: true }).fill("WidzFull");
  await page
    .getByLabel("Wiadomość", { exact: true })
    .fill("Cała wiadomość pozostaje w czasie mowy.");
  await page.getByRole("button", { name: "Pełny alert", exact: true }).click();
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status()["phase"]), { timeout: 15000 })
    .toBe("tts-nickname");
  await expect(page.locator(".information-message")).toBeVisible();
  await expect(page.locator(".information-header strong")).toHaveText("WidzFull");
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status()["phase"]), { timeout: 5000 })
    .toBe("tts-amount");
  await expect(page.locator(".information-message")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status()["phase"]), { timeout: 5000 })
    .toBe("tts-message");
  await expect(page.locator(".information-message")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status()["phase"]), { timeout: 8000 })
    .toBe("complete");
  const clips = await page.evaluate(() => window.motionStudio.status().speech);
  expect(clips.map((c) => c.name)).toEqual(["nickname", "amount", "message"]);
  expect(clips[0].text).toBe("WidzFull");
  expect(clips[2].text).toBe("Cała wiadomość pozostaje w czasie mowy.");
  expect(await page.evaluate(() => window["activeSpeech"].size)).toBe(0);
  expect(await page.locator("video[src]").count()).toBe(0);
});

test("restart during TTS cancels speech; failed TTS still finishes", async ({ page }) => {
  await ready(page);
  await page.getByRole("button", { name: "Pełny alert", exact: true }).click();
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status()["phase"]), { timeout: 15000 })
    .toBe("tts-nickname");
  await page.getByRole("button", { name: "Od początku", exact: true }).click();
  await page.waitForTimeout(2200);
  expect(await page.evaluate(() => window.motionStudio.status()["phase"])).toBe("hero");
  expect(await page.evaluate(() => window.motionStudio.status().playing)).toBe(false);
  await page.route("**/__studio/tts/audio/*", (route) => route.abort());
  await page.getByLabel("Wiadomość", { exact: true }).fill("Nowy klip po błędzie");
  await page.getByRole("button", { name: "Odtwórz", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.motionStudio.status()["phase"]), { timeout: 20000 })
    .toBe("hero");
  await expect(page.locator("output")).toContainText("BŁĄD ODTWARZANIA");
  expect(await page.locator(".motion-studio").count()).toBe(1);
});

test("Studio requests a deterministic selection export and reports a downloadable result", async ({
  page,
}) => {
  await ready(page);
  await page.getByLabel("Nazwa", { exact: true }).fill("ExportWidz");
  await page.getByLabel("Loop IN", { exact: true }).fill("3");
  await page.getByLabel("Loop OUT", { exact: true }).fill("3.1");
  await page.getByRole("button", { name: "Eksport", exact: true }).click();
  await page.getByLabel("Zakres eksportu").selectOption("selection");
  await page.getByRole("button", { name: "Renderuj eksport", exact: true }).click();
  await expect(page.getByRole("link", { name: "Pobierz MP4" })).toBeVisible({ timeout: 30000 });
  const href = await page.getByRole("link", { name: "Pobierz MP4" }).getAttribute("href");
  const file = await page.request.get(href);
  expect(file.ok()).toBe(true);
  expect(file.headers()["content-type"]).toBe("video/mp4");
  expect((await file.body()).length).toBeGreaterThan(1000);
});
