import { describe, expect, it } from "vitest";
import { parseAppEnv, resolveWsUrl } from "./env";

describe("parseAppEnv", () => {
  it("returns prod for prod", () => {
    expect(parseAppEnv("prod")).toBe("prod");
  });

  it("returns test for test", () => {
    expect(parseAppEnv("test")).toBe("test");
  });

  it("returns dev for dev", () => {
    expect(parseAppEnv("dev")).toBe("dev");
  });

  it("returns unknown for missing or unsupported values", () => {
    expect(parseAppEnv(undefined)).toBe("unknown");
    expect(parseAppEnv("staging")).toBe("unknown");
    expect(parseAppEnv(123)).toBe("unknown");
  });
});

describe("resolveWsUrl", () => {
  it("uses provided non-empty websocket URL", () => {
    expect(resolveWsUrl("wss://example.test/ws", "wss://fallback.test/ws")).toBe(
      "wss://example.test/ws",
    );
  });

  it("uses fallback for missing, non-string or empty values", () => {
    expect(resolveWsUrl(undefined, "wss://fallback.test/ws")).toBe("wss://fallback.test/ws");
    expect(resolveWsUrl(123, "wss://fallback.test/ws")).toBe("wss://fallback.test/ws");
    expect(resolveWsUrl("", "wss://fallback.test/ws")).toBe("wss://fallback.test/ws");
  });
});
