import { describe, expect, it } from "vitest";
import { buildHomeBaseUrl, buildOverlayLinks } from "./Home";

describe("Home overlay link generator", () => {
  it("does not generate usable private URLs when account UUID is empty", () => {
    expect(buildOverlayLinks("https://overlay.test", "")).toEqual([]);
    expect(buildOverlayLinks("https://overlay.test", "   ")).toEqual([]);
  });

  it("generates normal and test links for every explicit overlay route", () => {
    const links = buildOverlayLinks(
      "https://overlay.test/base/",
      "94bdf886-1c70-11eb-adc1-0242ac120011",
    );

    expect(links.map((link) => link.type)).toEqual([
      "ALERTS",
      "TIP_ALERT",
      "REWARD_ALERT",
      "SUB_GOAL",
      "FOLLOW_GOAL",
      "QUEUE",
    ]);
    expect(links[0].normalUrl).toBe(
      "https://overlay.test/base/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011",
    );
    expect(links[0].testUrl).toBe(
      "https://overlay.test/base/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
    );
  });

  it("uses current origin and base path", () => {
    expect(buildHomeBaseUrl("https://overlay.test/", "/test/")).toBe(
      "https://overlay.test/test",
    );
    expect(buildHomeBaseUrl("https://overlay.test/", "/")).toBe(
      "https://overlay.test",
    );
  });
});
