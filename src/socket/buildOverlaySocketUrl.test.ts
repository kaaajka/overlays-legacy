import { describe, expect, it } from "vitest";

import {
  buildFollowersOverlaySocketUrl,
  buildMainOverlaySocketUrl,
  buildQueueOverlaySocketUrl,
  buildSubsOverlaySocketUrl,
} from "./buildOverlaySocketUrl";

describe("overlay socket URL builders", () => {
  it("builds main overlay URL from a base without trailing slash", () => {
    expect(buildMainOverlaySocketUrl("wss://example.test/ws", "account-uuid")).toBe(
      "wss://example.test/ws?account=account-uuid",
    );
  });

  it("builds main overlay URL from a base with trailing slash", () => {
    expect(buildMainOverlaySocketUrl("wss://example.test/ws/", "account-uuid")).toBe(
      "wss://example.test/ws?account=account-uuid",
    );
  });

  it("encodes account IDs", () => {
    expect(buildMainOverlaySocketUrl("wss://example.test/ws", "uuid with/slash")).toBe(
      "wss://example.test/ws?account=uuid%20with%2Fslash",
    );
  });

  it("builds subs overlay URL", () => {
    expect(buildSubsOverlaySocketUrl("wss://example.test/ws", "account-uuid")).toBe(
      "wss://example.test/ws/subs?account=account-uuid",
    );
  });

  it("builds followers overlay URL", () => {
    expect(buildFollowersOverlaySocketUrl("wss://example.test/ws/", "account-uuid")).toBe(
      "wss://example.test/ws/followers?account=account-uuid",
    );
  });

  it("builds queue overlay URL", () => {
    expect(buildQueueOverlaySocketUrl("wss://example.test/ws", "account-uuid")).toBe(
      "wss://example.test/ws/queue?account=account-uuid",
    );
  });
});
