import { describe, expect, it } from "vitest";

import { parseOverlayRoute } from "./parseOverlayRoute";

const uuid = "94bdf886-1c70-11eb-adc1-0242ac120011";

const overlay = (type: "TIP_ALERT" | "SUB_GOAL" | "FOLLOW_GOAL" | "QUEUE", legacy: boolean) => ({
  kind: "overlay" as const,
  type,
  accountId: uuid,
  legacy,
});

describe("parseOverlayRoute", () => {
  it("parses a valid modern TIP_ALERT route", () => {
    expect(parseOverlayRoute(`/TIP_ALERT/${uuid}`)).toEqual(overlay("TIP_ALERT", false));
  });

  it("parses a valid modern REWARD_ALERT route as TIP_ALERT", () => {
    expect(parseOverlayRoute(`/REWARD_ALERT/${uuid}`)).toEqual(overlay("TIP_ALERT", false));
  });

  it("parses a valid modern SUB_GOAL route", () => {
    expect(parseOverlayRoute(`/SUB_GOAL/${uuid}`)).toEqual(overlay("SUB_GOAL", false));
  });

  it("parses a valid modern FOLLOW_GOAL route", () => {
    expect(parseOverlayRoute(`/FOLLOW_GOAL/${uuid}`)).toEqual(overlay("FOLLOW_GOAL", false));
  });

  it("parses a valid modern QUEUE route", () => {
    expect(parseOverlayRoute(`/QUEUE/${uuid}`)).toEqual(overlay("QUEUE", false));
  });

  it("parses legacy /channel/:uuid as TIP_ALERT", () => {
    expect(parseOverlayRoute(`/channel/${uuid}`)).toEqual(overlay("TIP_ALERT", true));
  });

  it("parses legacy /channel/:uuid/subs as SUB_GOAL", () => {
    expect(parseOverlayRoute(`/channel/${uuid}/subs`)).toEqual(overlay("SUB_GOAL", true));
  });

  it("parses legacy /channel/:uuid/followers as FOLLOW_GOAL", () => {
    expect(parseOverlayRoute(`/channel/${uuid}/followers`)).toEqual(overlay("FOLLOW_GOAL", true));
  });

  it("parses legacy /channel/:uuid/queue as QUEUE", () => {
    expect(parseOverlayRoute(`/channel/${uuid}/queue`)).toEqual(overlay("QUEUE", true));
  });

  it("rejects an invalid UUID", () => {
    expect(parseOverlayRoute("/QUEUE/not-a-uuid")).toEqual({
      kind: "not_found",
      reason: "invalid_uuid",
    });
  });

  it("rejects an invalid UUID for REWARD_ALERT", () => {
    expect(parseOverlayRoute("/REWARD_ALERT/not-a-uuid")).toEqual({
      kind: "not_found",
      reason: "invalid_uuid",
    });
  });

  it("rejects a missing UUID", () => {
    expect(parseOverlayRoute("/QUEUE/")).toEqual({
      kind: "not_found",
      reason: "missing_uuid",
    });
  });

  it("rejects a missing UUID for REWARD_ALERT", () => {
    expect(parseOverlayRoute("/REWARD_ALERT/")).toEqual({
      kind: "not_found",
      reason: "missing_uuid",
    });
  });

  it("rejects an unsupported route", () => {
    expect(parseOverlayRoute(`/UNKNOWN/${uuid}`)).toEqual({
      kind: "not_found",
      reason: "unsupported_route",
    });
  });

  it("ignores query strings if included", () => {
    expect(
      parseOverlayRoute(`/TIP_ALERT/${uuid}?fixture=main-donate-prepare&muteAudio=true`),
    ).toEqual(overlay("TIP_ALERT", false));
  });

  it("ignores query strings for REWARD_ALERT", () => {
    expect(parseOverlayRoute(`/REWARD_ALERT/${uuid}?fixture=main-donate-prepare`)).toEqual(
      overlay("TIP_ALERT", false),
    );
  });

  it("accepts a trailing slash consistently", () => {
    expect(parseOverlayRoute(`/channel/${uuid}/queue/`)).toEqual(overlay("QUEUE", true));
  });

  it("rejects unsupported extra path segments", () => {
    expect(parseOverlayRoute(`/TIP_ALERT/${uuid}/extra`)).toEqual({
      kind: "not_found",
      reason: "unsupported_route",
    });
  });
});
