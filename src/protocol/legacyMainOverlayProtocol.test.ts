import { describe, expect, it } from "vitest";

import mainAlertListSet from "../dev/fixtures/main-alert-list-set.json";
import mainCoinflipStarted from "../dev/fixtures/main-coinflip-started.json";
import mainDonatePrepare from "../dev/fixtures/main-donate-prepare.json";
import mainRouletteStarted from "../dev/fixtures/main-roulette-started.json";
import {
  getLegacyMainArgs,
  hasStringKey,
  isLegacyMainMessage,
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
