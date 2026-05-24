import { describe, expect, it } from "vitest";

import mainAlertListSet from "../dev/fixtures/main-alert-list-set.json";
import mainCoinflipStarted from "../dev/fixtures/main-coinflip-started.json";
import mainDonatePrepare from "../dev/fixtures/main-donate-prepare.json";
import mainRouletteStarted from "../dev/fixtures/main-roulette-started.json";
import {
  getLegacyMainArgs,
  getLegacyMainArgsRecord,
  hasStringKey,
  isLegacyCoinflipStartedArgs,
  isLegacyMainMessage,
  isLegacyOverlayEventOrigin,
  isLegacyRouletteStartedArgs,
  isLegacyUpdateArgs,
  isRecord,
  type LegacyMainEventKey,
  type LegacyMainEventName,
} from "./legacyMainOverlayProtocol";

describe("legacy main overlay protocol guards", () => {
  it("exposes the expected legacy main event and key unions", () => {
    const eventName: LegacyMainEventName = "prepare";
    const eventKey: LegacyMainEventKey = "donate";

    expect(eventName).toBe("prepare");
    expect(eventKey).toBe("donate");
  });

  it("detects plain records", () => {
    expect(isRecord({ event: "prepare" })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
  });

  it("detects string properties on records", () => {
    expect(hasStringKey({ key: "donate" }, "key")).toBe(true);
    expect(hasStringKey({ key: 1 }, "key")).toBe(false);
    expect(hasStringKey({}, "key")).toBe(false);
  });

  it("detects optional overlay event origin values", () => {
    expect(isLegacyOverlayEventOrigin("reward")).toBe(true);
    expect(isLegacyOverlayEventOrigin("manual")).toBe(true);
    expect(isLegacyOverlayEventOrigin("donate")).toBe(false);
    expect(isLegacyOverlayEventOrigin(undefined)).toBe(false);
  });

  it("returns args only when args is a record", () => {
    const args = getLegacyMainArgs({
      event: "prepare",
      key: "donate",
      id: "1",
      args: { value: 1 },
    });

    expect(args).toEqual({ value: 1 });
    expect(
      getLegacyMainArgs({ event: "prepare", key: "donate", id: "1", args: "nope" }),
    ).toBeUndefined();
    expect(getLegacyMainArgs({ event: "prepare", key: "donate", id: "1" })).toBeUndefined();
  });

  it("accepts valid legacy main fixtures", () => {
    expect(isLegacyMainMessage(mainAlertListSet)).toBe(true);
    expect(isLegacyMainMessage(mainDonatePrepare)).toBe(true);
    expect(isLegacyMainMessage(mainRouletteStarted)).toBe(true);
    expect(isLegacyMainMessage(mainCoinflipStarted)).toBe(true);
  });

  it("rejects non-record payloads", () => {
    expect(isLegacyMainMessage(null)).toBe(false);
    expect(isLegacyMainMessage("not-json-object")).toBe(false);
    expect(isLegacyMainMessage([])).toBe(false);
  });

  it("rejects messages without required string event/key/id fields", () => {
    expect(isLegacyMainMessage({ key: "donate", id: "1" })).toBe(false);
    expect(isLegacyMainMessage({ event: "prepare", id: "1" })).toBe(false);
    expect(isLegacyMainMessage({ event: "prepare", key: "donate" })).toBe(false);
    expect(isLegacyMainMessage({ event: "prepare", key: "donate", id: 1 })).toBe(false);
  });

  it("requires donate prepare args to be a record", () => {
    expect(isLegacyMainMessage({ event: "prepare", key: "donate", id: "1", args: {} })).toBe(
      true,
    );
    expect(isLegacyMainMessage({ event: "prepare", key: "donate", id: "1" })).toBe(false);
    expect(
      isLegacyMainMessage({ event: "prepare", key: "donate", id: "1", args: "nope" }),
    ).toBe(false);
  });


  it("returns args record through the main args helper", () => {
    const message = { event: "update", key: "roulette", id: "1", args: { key: "time", value: 10 } };

    expect(getLegacyMainArgsRecord(message)).toEqual({ key: "time", value: 10 });
  });

  it("accepts valid update args", () => {
    expect(isLegacyUpdateArgs({ key: "time", value: 10 })).toBe(true);
    expect(isLegacyUpdateArgs({ key: "winner", value: undefined })).toBe(true);
  });

  it("rejects update args missing key", () => {
    expect(isLegacyUpdateArgs({ value: 10 })).toBe(false);
    expect(isLegacyUpdateArgs({ key: 10, value: 10 })).toBe(false);
  });

  it("accepts valid roulette started args", () => {
    expect(isLegacyRouletteStartedArgs({ items: [], winner: 50 })).toBe(true);
  });

  it("rejects roulette started args missing items", () => {
    expect(isLegacyRouletteStartedArgs({ winner: 50 })).toBe(false);
  });

  it("rejects roulette started args when winner is not a number", () => {
    expect(isLegacyRouletteStartedArgs({ items: [], winner: "50" })).toBe(false);
  });

  it("accepts valid coinflip started args", () => {
    expect(isLegacyCoinflipStartedArgs({ segments: [] })).toBe(true);
  });

  it("rejects coinflip started args missing segments", () => {
    expect(isLegacyCoinflipStartedArgs({ winner: 1 })).toBe(false);
  });

  it("accepts optional valid origin metadata", () => {
    expect(
      isLegacyMainMessage({
        event: "started",
        key: "roulette",
        id: "1",
        origin: "reward",
        args: {},
      }),
    ).toBe(true);
    expect(
      isLegacyMainMessage({
        event: "started",
        key: "roulette",
        id: "1",
        origin: "manual",
        args: {},
      }),
    ).toBe(true);
  });

  it("rejects invalid origin metadata when present", () => {
    expect(
      isLegacyMainMessage({
        event: "started",
        key: "roulette",
        id: "1",
        origin: "unknown",
        args: {},
      }),
    ).toBe(false);
  });

  it("accepts unknown main event keys at the guard layer for legacy compatibility", () => {
    expect(
      isLegacyMainMessage({
        event: "unknown-legacy-event",
        key: "unknown-key",
        id: "unknown-id",
        args: {},
      }),
    ).toBe(true);
  });
});
