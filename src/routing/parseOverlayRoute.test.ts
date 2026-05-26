import { describe, expect, it } from "vitest";

import { parseOverlayRoute } from "./parseOverlayRoute";

const uuid = "94bdf886-1c70-11eb-adc1-0242ac120011";

const overlay = (
  type:
    | "ALERTS"
    | "TIP_ALERT"
    | "REWARD_ALERT"
    | "SUB_GOAL"
    | "FOLLOW_GOAL"
    | "QUEUE",
  testMode = false,
) => ({
  kind: "overlay" as const,
  type,
  accountId: uuid,
  testMode,
});

describe("parseOverlayRoute", () => {
  it("parses home route", () => {
    expect(parseOverlayRoute("/")).toEqual({ kind: "home" });
  });

  it("parses generator route", () => {
    expect(parseOverlayRoute("/generate")).toEqual({ kind: "generator" });
  });

  it("parses a valid modern ALERTS route", () => {
    expect(parseOverlayRoute(`/ALERTS/${uuid}`)).toEqual(overlay("ALERTS"));
  });

  it("parses a valid modern TIP_ALERT route", () => {
    expect(parseOverlayRoute(`/TIP_ALERT/${uuid}`)).toEqual(
      overlay("TIP_ALERT"),
    );
  });

  it("parses a valid modern REWARD_ALERT route", () => {
    expect(parseOverlayRoute(`/REWARD_ALERT/${uuid}`)).toEqual(
      overlay("REWARD_ALERT"),
    );
  });

  it("parses a valid modern SUB_GOAL route", () => {
    expect(parseOverlayRoute(`/SUB_GOAL/${uuid}`)).toEqual(overlay("SUB_GOAL"));
  });

  it("parses a valid modern FOLLOW_GOAL route", () => {
    expect(parseOverlayRoute(`/FOLLOW_GOAL/${uuid}`)).toEqual(
      overlay("FOLLOW_GOAL"),
    );
  });

  it("parses a valid modern QUEUE route", () => {
    expect(parseOverlayRoute(`/QUEUE/${uuid}`)).toEqual(overlay("QUEUE"));
  });

  it("sets testMode only for test=true", () => {
    expect(parseOverlayRoute(`/ALERTS/${uuid}?test=true`)).toEqual(
      overlay("ALERTS", true),
    );
  });

  it("does not set testMode for test=false", () => {
    expect(parseOverlayRoute(`/ALERTS/${uuid}?test=false`)).toEqual(
      overlay("ALERTS"),
    );
  });

  it("does not set testMode when test query param is missing", () => {
    expect(
      parseOverlayRoute(`/ALERTS/${uuid}?fixture=main-donate-prepare`),
    ).toEqual(overlay("ALERTS"));
  });

  it("does not set testMode for other query params", () => {
    expect(
      parseOverlayRoute(
        `/TIP_ALERT/${uuid}?fixture=main-donate-prepare&muteAudio=true`,
      ),
    ).toEqual(overlay("TIP_ALERT"));
  });

  it("rejects legacy /channel/:uuid", () => {
    expect(parseOverlayRoute(`/channel/${uuid}`)).toEqual({
      kind: "not_found",
      reason: "unsupported_route",
    });
  });

  it("rejects legacy /channel/:uuid/subs", () => {
    expect(parseOverlayRoute(`/channel/${uuid}/subs`)).toEqual({
      kind: "not_found",
      reason: "unsupported_route",
    });
  });

  it("rejects legacy /test/channel/:uuid", () => {
    expect(parseOverlayRoute(`/test/channel/${uuid}`)).toEqual({
      kind: "not_found",
      reason: "unsupported_route",
    });
  });

  it("rejects an invalid UUID for ALERTS", () => {
    expect(parseOverlayRoute("/ALERTS/not-a-uuid")).toEqual({
      kind: "not_found",
      reason: "invalid_uuid",
    });
  });

  it("rejects a missing UUID for ALERTS", () => {
    expect(parseOverlayRoute("/ALERTS/")).toEqual({
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

  it("accepts a trailing slash consistently", () => {
    expect(parseOverlayRoute(`/QUEUE/${uuid}/`)).toEqual(overlay("QUEUE"));
  });

  it("rejects unsupported extra path segments", () => {
    expect(parseOverlayRoute(`/TIP_ALERT/${uuid}/extra`)).toEqual({
      kind: "not_found",
      reason: "unsupported_route",
    });
  });
});
