import { describe, expect, it } from "vitest";
import {
  buildFixtureLinks,
  buildHomeBaseUrl,
  buildOverlayLinks,
  generatorLegendItems,
  generatorWarning,
} from "./Home";

describe("Home overlay link generator", () => {
  it("does not generate usable private URLs when account UUID is empty", () => {
    expect(buildOverlayLinks("https://overlay.test", "")).toEqual([]);
    expect(buildOverlayLinks("https://overlay.test", "   ")).toEqual([]);
    expect(buildFixtureLinks("https://overlay.test", "")).toEqual([]);
    expect(buildFixtureLinks("https://overlay.test", "   ")).toEqual([]);
  });

  it("generates normal links for every explicit overlay route", () => {
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
  });

  it("generates test mode links for every explicit overlay route", () => {
    const links = buildOverlayLinks(
      "https://overlay.test/base/",
      "94bdf886-1c70-11eb-adc1-0242ac120011",
    );

    expect(links.map((link) => link.testUrl)).toEqual([
      "https://overlay.test/base/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
      "https://overlay.test/base/TIP_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
      "https://overlay.test/base/REWARD_ALERT/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
      "https://overlay.test/base/SUB_GOAL/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
      "https://overlay.test/base/FOLLOW_GOAL/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
      "https://overlay.test/base/QUEUE/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
    ]);
    expect(links[0].testUrl).toBe(
      "https://overlay.test/base/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?test=true",
    );
  });

  it("generates fixture QA links", () => {
    const links = buildFixtureLinks(
      "https://overlay.test/base/",
      "94bdf886-1c70-11eb-adc1-0242ac120011",
    );

    expect(links.map((link) => `${link.type}:${link.fixture}`)).toEqual([
      "ALERTS:main-donate-prepare",
      "ALERTS:main-donate-html-message",
      "ALERTS:main-donate-without-audio-url",
      "ALERTS:main-roulette-started",
      "ALERTS:main-roulette-flow",
      "ALERTS:main-coinflip-started",
      "SUB_GOAL:subs-set",
      "FOLLOW_GOAL:followers-set",
      "QUEUE:queue-set",
    ]);
    expect(links[0].url).toBe(
      "https://overlay.test/base/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare",
    );
  });

  it("generates muted fixture QA links", () => {
    const links = buildFixtureLinks(
      "https://overlay.test/base/",
      "94bdf886-1c70-11eb-adc1-0242ac120011",
    );

    expect(links[0].mutedUrl).toBe(
      "https://overlay.test/base/ALERTS/94bdf886-1c70-11eb-adc1-0242ac120011?fixture=main-donate-prepare&muteAudio=true",
    );
    expect(links.every((link) => link.mutedUrl.endsWith("&muteAudio=true"))).toBe(
      true,
    );
  });

  it("contains generator warning and legend entries", () => {
    expect(generatorWarning).toBe("Overlay URLs should be treated as private.");
    expect(generatorLegendItems).toContain("ALERTS - all alerts");
    expect(generatorLegendItems).toContain(
      "test=true - runtime test payloads from backend",
    );
    expect(generatorLegendItems).toContain("fixture - local dev replay");
    expect(generatorLegendItems).toContain(
      "muteAudio=true - silent fixture replay",
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
