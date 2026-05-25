import { describe, expect, it } from "vitest";
import { resolveWsUrl } from "./env";

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
