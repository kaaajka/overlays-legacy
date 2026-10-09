import { expect, it } from "vitest";
import { cashWaves } from "./CashRenderer";
import { treatments } from "../../donations/choreography/treatments";
it("cash belongs to selected tiers and authored musical windows", () => {
  for (const treatment of treatments.slice(0, 4)) expect(cashWaves(treatment)).toEqual([]);
  const top = cashWaves(treatments[6]);
  expect(top.map((w) => w.at)).toContain(38.00116);
  expect(cashWaves(treatments[5])[0].at).toBe(3.90095);
  expect(top).toEqual(cashWaves(treatments[6]));
});
