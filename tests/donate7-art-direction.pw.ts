import { expect, test } from "@playwright/test";

for (const amount of [5732, 3000000]) {
  test(`Donate7 ${amount} keeps the transformed paper through Information and reconstructs the impact/handoff`, async ({
    page,
  }) => {
    const message = "Pełna wiadomość pozostaje czytelna. ".repeat(45) + "KONIEC";
    await page.goto(
      `/motion-studio?clean=1&tier=7&quality=high&amount=${amount}&nickname=Kaaajka&message=${encodeURIComponent(message)}`,
    );
    await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.donation-motion[data-money-renderer="ready"]').waitFor();
    const seek = async (at: number) => {
      await page.evaluate((time) => window.motionStudio.renderExportAt(time, true), at);
      await page.waitForFunction(() =>
        [...document.querySelectorAll("video")].every((v) => !v.seeking),
      );
    };
    const pose = () =>
      page.locator(".d7-world,.d7-headline,.d7-donor,.motion-information").evaluateAll((nodes) =>
        nodes.map((n) => {
          const s = getComputedStyle(n),
            b = n.getBoundingClientRect();
          return [
            s.transform,
            s.opacity,
            s.visibility,
            s.display,
            s.clipPath,
            b.x,
            b.y,
            b.width,
            b.height,
          ];
        }),
      );
    for (const at of [20.5, 32.8, 36.9, 37.95, 44.6, 45.3, 46.4]) {
      await seek(at);
      const first = await pose();
      await seek(48);
      await seek(2);
      await seek(at);
      expect(await pose(), `absolute backward pose ${at}`).toEqual(first);
    }
    await seek(46.4);
    await expect(page.locator(".d7-donor")).toBeVisible();
    await expect(page.locator(".information-header")).toBeVisible();
    await expect(page.locator(".information-message")).toHaveText(message);
    await expect(page.locator(".d7-donor > .motion-amount")).not.toBeVisible();
    expect(await page.locator(".d7-money:visible").count()).toBe(0);
    const paper = await page.locator(".d7-donor").boundingBox();
    const information = await page.locator(".motion-information").boundingBox();
    expect(paper.x).toBeLessThan(information.x);
    expect(paper.y).toBeLessThan(information.y);
    expect(paper.x + paper.width).toBeGreaterThan(information.x + information.width);
    expect(paper.y + paper.height).toBeGreaterThan(information.y + information.height);
    expect(paper.y).toBeGreaterThanOrEqual(0);
    expect(paper.y + paper.height).toBeLessThanOrEqual(1080);
    expect(Math.abs(paper.x + paper.width / 2 - 960)).toBeLessThan(1);
    await page.evaluate(() => window.motionStudio.information(12000));
    const header = await page.locator(".information-header").boundingBox();
    await expect
      .poll(() => page.locator(".information-message").evaluate((e) => e.scrollTop), {
        timeout: 10000,
      })
      .toBeGreaterThan(0);
    expect(await page.locator(".information-header").boundingBox()).toEqual(header);
  });
}
