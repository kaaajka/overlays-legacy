import { expect, it } from "vitest";
import { lifecyclePlan, parsePln, timecode } from "./studioModel";
it("PLN parsing preserves cents and rejects ambiguous or unsafe entries", () => {
  expect(parsePln("57,32")).toBe(5732);
  expect(parsePln("250.00")).toBe(25000);
  expect(parsePln("0.01")).toBe(1);
  expect(parsePln("1.999")).toBeUndefined();
  expect(parsePln("-1")).toBeUndefined();
  expect(parsePln("1e3")).toBeUndefined();
});
it("full export plan keeps information across speech and the readable hold", () => {
  const plan = lifecyclePlan(8, "Hello", [
    { name: "nickname", duration: 2 },
    { name: "amount", duration: 2 },
    { name: "message", duration: 3 },
  ]);
  expect(plan.stages.find((s) => s.name === "information").end).toBe(15);
  expect(plan.duration).toBe(15.65);
  expect(timecode(13.212)).toBe("00:13.212");
  expect(lifecyclePlan(8, "Long ".repeat(100), []).informationDuration).toBeGreaterThan(30);
});
