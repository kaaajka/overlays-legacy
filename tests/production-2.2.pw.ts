import { expect, test } from "@playwright/test";
const heroes = [3.06503, 3.66875, 4.82975, 4.52789, 4.82975, 3.90095, 13.21215];
test("32-char names and realistic PLN amounts form separate readable units in all seven scenes", async ({
  page,
}) => {
  test.setTimeout(180000);
  for (let tier = 1; tier <= 7; tier++)
    for (const nickname of ["Kaaajka", "Michaś", "A".repeat(32)])
      for (const amount of ["500", "5732", "213769", "9999999", "100000000"]) {
        await page.goto(
          `/motion-studio?clean=1&tier=${tier}&time=${heroes[tier - 1] + 0.5}&nickname=${encodeURIComponent(nickname)}&amount=${amount}&quality=safe`,
        );
        await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
        await page.evaluate(() => document.fonts.ready);
        const boxes = await page.evaluate(() => {
          const name = document.querySelector(".motion-name"),
            amount = document.querySelector(".motion-amount");
          const n = name.getBoundingClientRect(),
            a = amount.getBoundingClientRect();
          return {
            name: name.textContent,
            n: { left: n.left, right: n.right, bottom: n.bottom },
            a: { left: a.left, right: a.right, top: a.top, bottom: a.bottom },
          };
        });
        expect(boxes.name).toBe(nickname);
        expect(boxes.a.top - boxes.n.bottom).toBeGreaterThan(4);
        expect(boxes.a.left).toBeGreaterThan(60);
        expect(boxes.a.right).toBeLessThan(1860);
        expect(boxes.a.bottom).toBeLessThan(1020);
      }
});
test("intrinsic Information is stable across reading seeks, emoji frames and body-only overflow", async ({
  page,
}) => {
  await page.goto("/motion-studio?tier=6&message=Dzięki!");
  await expect(page.locator("output")).toHaveText("Gotowe");
  await page.evaluate(() => window.motionStudio.information());
  const short = await page.locator(".motion-information").boundingBox();
  expect(short.height).toBeLessThan(220);
  await page
    .getByLabel("Wiadomość", { exact: true })
    .fill("Dzięki za stream! ".repeat(15).slice(0, 225));
  await page.evaluate(() => window.motionStudio.information());
  const normal = await page.locator(".motion-information").boundingBox();
  expect(normal.height).toBeGreaterThan(short.height);
  expect(normal.height).toBeLessThan(600);
  await page.getByLabel("Wiadomość", { exact: true }).fill("emojiBubbly xdd emojiBubbly");
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("canvas.information-emote")].every(
        (c) => c.getAttribute("data-emote-state") === "ready",
      ),
    { timeout: 15000 },
  );
  await page.getByRole("button", { name: "Pełny alert", exact: true }).click();
  await page.waitForFunction(() => window.motionStudio?.status().mode === "full");
  const start = await page.evaluate(() => window.motionStudio.status().plan.informationStart);
  await page.evaluate((at) => window.motionStudio.seek(at), start + 1);
  const first = await page.locator(".motion-information").boundingBox();
  const frame = await page
    .locator("canvas.information-emote")
    .first()
    .evaluate((c: HTMLCanvasElement) => c.toDataURL());
  await page.evaluate((at) => window.motionStudio.seek(at), start + 2);
  expect(await page.locator(".motion-information").boundingBox()).toEqual(first);
  await page.evaluate((at) => window.motionStudio.seek(at), start + 1);
  expect(
    await page
      .locator("canvas.information-emote")
      .first()
      .evaluate((c: HTMLCanvasElement) => c.toDataURL()),
  ).toEqual(frame);
  // Defensive input comes through URL, outside normal 225-character Studio authoring.
  await page.goto(
    "/motion-studio?tier=6&message=" +
      encodeURIComponent("Pełna treść musi pozostać. ".repeat(80) + "KONIEC"),
  );
  await expect(page.locator("output")).toHaveText("Gotowe");
  await page.evaluate(() => window.motionStudio.information(5500));
  const header = await page.locator(".information-header").boundingBox();
  await expect
    .poll(() => page.locator(".information-message").evaluate((e) => e.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.locator(".information-header").boundingBox()).toEqual(header);
});
test("empty HTTP 204 reports transport evidence; manual retry refetches, restores time and clears warning", async ({
  page,
}) => {
  await page.route("**/__studio-assets/music/5", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
  await page.goto("/motion-studio?tier=5");
  await expect(page.locator("output")).toContainText("BŁĄD MUZYKI");
  await page.getByRole("button", { name: "Edytuj czas alertu" }).click();
  await page.getByLabel("Czas alertu").fill("3.5");
  await page.getByLabel("Czas alertu").press("Enter");
  await page.getByRole("button", { name: "Eksport", exact: true }).click();
  await expect(page.locator(".audio-export-warning")).toBeVisible();
  await page.unroute("**/__studio-assets/music/5");
  await page.getByRole("button", { name: "Ponów wczytanie muzyki" }).click();
  await expect(page.locator("output")).toHaveText("Gotowe");
  expect(await page.evaluate(() => window.motionStudio.status().time)).toBeCloseTo(3.5, 4);
  expect(
    await page.evaluate(() => window.motionStudio.status()["audioDiagnostic"].receivedBytes),
  ).toBeGreaterThan(400000);
  await expect(page.locator(".audio-export-warning")).toHaveCount(0);
});
test("context help works with focus, click and Escape", async ({ page }) => {
  await page.goto("/motion-studio");
  await expect(page.locator("output")).toHaveText("Gotowe");
  const help = page.getByRole("button", { name: "Pomoc: Ziarno losowania" });
  await help.focus();
  await expect(page.getByRole("tooltip")).toContainText("ten sam układ");
  await help.click();
  await expect(help).toHaveAttribute("aria-expanded", "true");
  await help.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});
