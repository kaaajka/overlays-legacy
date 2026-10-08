import { describe, expect, it } from "vitest";
import { spokenAmount, speechSafeText } from "./spokenAmount";
import { parseTimecode } from "./Timecode";
describe("current Polish speech", () => {
  it.each([
    [1, "zero złotych, jeden grosz"],
    [100, "jeden złoty"],
    [200, "dwa złote"],
    [500, "pięć złotych"],
    [2100, "dwadzieścia jeden złotych"],
    [2200, "dwadzieścia dwa złote"],
    [5732, "pięćdziesiąt siedem złotych, trzydzieści dwa grosze"],
    [213769, "dwa tysiące sto trzydzieści siedem złotych, sześćdziesiąt dziewięć groszy"],
    [
      9999999,
      "dziewięćdziesiąt dziewięć tysięcy dziewięćset dziewięćdziesiąt dziewięć złotych, dziewięćdziesiąt dziewięć groszy",
    ],
    [100000000, "milion złotych"],
    [112, "jeden złoty, dwanaście groszy"],
    [122, "jeden złoty, dwadzieścia dwa grosze"],
  ])("speaks %i cents grammatically", (amount, text) =>
    expect(spokenAmount(Number(amount))).toBe(text));
  it("removes transport markup and CDN URLs from spoken input", () =>
    expect(speechSafeText('Hej <img src="https://cdn.7tv.app/a"/> https://example.com xdd')).toBe(
      "Hej xdd",
    ));
});
describe("inline timecode", () => {
  it.each([
    ["12.438", 12.438],
    ["0:12.438", 12.438],
    ["00:12.438", 12.438],
    ["01:12.438", 72.438],
    ["0:12,4", 12.4],
  ])("accepts %s", (input, at) => expect(parseTimecode(String(input))).toBe(at));
  it.each(["abc", "", "00:62.438", "-1", "12.4385"])("rejects %s without inventing zero", (input) =>
    expect(parseTimecode(input)).toBeUndefined());
});
