import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(
  "http://127.0.0.1:5173/motion-studio?tier=6&background=stream&message=" +
    encodeURIComponent("Dziękuję emojiBubbly xdd!"),
);
await page.waitForFunction(() => window.motionStudio?.status().duration > 0);
await page.getByRole("button", { name: "Pełny alert", exact: true }).click();
await page.getByLabel("Czas muzyki", { exact: true }).fill("23");
await page.getByLabel("Loop OUT", { exact: true }).fill("23.2");
await page.getByLabel("Loop IN", { exact: true }).fill("23");
await page.getByRole("button", { name: "Eksport", exact: true }).click();
await page.getByLabel("Zakres eksportu").selectOption("selection");
await page.getByRole("combobox", { name: "Tło", exact: true }).selectOption("stream");
await page.getByRole("button", { name: "Renderuj eksport", exact: true }).click();
await page.getByRole("link", { name: "Pobierz MP4" }).waitFor({ state: "visible", timeout: 60000 });
const link = await page.getByRole("link", { name: "Pobierz MP4" }).getAttribute("href");
const response = await page.request.get(new URL(link, page.url()).href);
if (!response.ok()) throw Error("Export download failed");
await page.screenshot({ path: ".motion-qa/production-2.2/studio-export-complete.png" });
console.log(
  JSON.stringify({
    link,
    bytes: (await response.body()).length,
    status: await page.locator(".export-progress").innerText(),
  }),
);
await browser.close();
