import { describe, expect, it } from "vitest";

import { resolveMainOverlayAlertListTransition } from "./resolveMainOverlayAlertListTransition";

describe("resolveMainOverlayAlertListTransition", () => {
  it("sets the alert queue from string list items only", () => {
    expect(
      resolveMainOverlayAlertListTransition(["old"], "set", {
        list: ["a", 1, "b", null],
      }),
    ).toEqual({
      queue: ["a", "b"],
      shouldSubmitFirstAlert: true,
    });
  });

  it("ignores malformed set lists", () => {
    expect(
      resolveMainOverlayAlertListTransition(["old"], "set", { list: "nope" }),
    ).toEqual({
      queue: ["old"],
      shouldSubmitFirstAlert: false,
    });
  });

  it("adds a new alert id and asks PageChannel to submit the first alert", () => {
    expect(
      resolveMainOverlayAlertListTransition(["a"], "add", { id: "b" }),
    ).toEqual({
      queue: ["a", "b"],
      shouldSubmitFirstAlert: true,
    });
  });

  it("ignores duplicate alert ids", () => {
    expect(
      resolveMainOverlayAlertListTransition(["a"], "add", { id: "a" }),
    ).toEqual({
      queue: ["a"],
      shouldSubmitFirstAlert: false,
    });
  });

  it("removes the first matching alert id without submitting a new first alert", () => {
    expect(
      resolveMainOverlayAlertListTransition(["a", "b", "b", "c"], "delete", {
        id: "b",
      }),
    ).toEqual({
      queue: ["a", "b", "c"],
      shouldSubmitFirstAlert: false,
    });
  });

  it("ignores unsupported alert list operations", () => {
    expect(
      resolveMainOverlayAlertListTransition(["a"], "unknown", { id: "b" }),
    ).toEqual({
      queue: ["a"],
      shouldSubmitFirstAlert: false,
    });
  });
});
