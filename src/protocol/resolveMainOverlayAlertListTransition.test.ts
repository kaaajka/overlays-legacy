import { describe, expect, it } from "vitest";

import { resolveMainOverlayAlertListTransition } from "./resolveMainOverlayAlertListTransition";

describe("resolveMainOverlayAlertListTransition", () => {
  it("Zachowuje typ prawidłowych identyfikatorów z kolejki", () => {
    expect(
      resolveMainOverlayAlertListTransition(["old"], "set", {
        list: ["a", 1, "b", null, -1, 1.5, ""],
      }),
    ).toEqual({
      queue: ["a", 1, "b"],
      shouldSubmitFirstAlert: true,
    });
  });

  it("Dodaje i usuwa zero bez mylenia go z identyfikatorem tekstowym", () => {
    const added = resolveMainOverlayAlertListTransition(["0"], "add", { id: 0 });
    expect(added.queue).toEqual(["0", 0]);
    expect(resolveMainOverlayAlertListTransition(added.queue, "delete", { id: 0 }).queue).toEqual([
      "0",
    ]);
  });

  it("ignores malformed set lists", () => {
    expect(resolveMainOverlayAlertListTransition(["old"], "set", { list: "nope" })).toEqual({
      queue: ["old"],
      shouldSubmitFirstAlert: false,
    });
  });

  it("adds a new alert id and asks PageChannel to submit the first alert", () => {
    expect(resolveMainOverlayAlertListTransition(["a"], "add", { id: "b" })).toEqual({
      queue: ["a", "b"],
      shouldSubmitFirstAlert: true,
    });
  });

  it("ignores duplicate alert ids", () => {
    expect(resolveMainOverlayAlertListTransition(["a"], "add", { id: "a" })).toEqual({
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
    expect(resolveMainOverlayAlertListTransition(["a"], "unknown", { id: "b" })).toEqual({
      queue: ["a"],
      shouldSubmitFirstAlert: false,
    });
  });
});
