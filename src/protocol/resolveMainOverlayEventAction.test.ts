import { describe, expect, it } from "vitest";

import { resolveMainOverlayEventAction } from "./resolveMainOverlayEventAction";

const donationArgs = {
  nickname: "Ada",
  message: "hello",
  amount: 10,
};

const rewardArgs = {
  name: "Reward",
  description: "Reward description",
};

function resolve(
  payload: unknown,
  mode: "all" | "tip" | "reward" = "all",
  testMode = false,
) {
  return resolveMainOverlayEventAction(payload, { mode, testMode });
}

describe("resolveMainOverlayEventAction", () => {
  it("accepts normal donation prepare in normal mode", () => {
    expect(
      resolve({
        event: "prepare",
        key: "donate",
        id: "donate-1",
        args: donationArgs,
      }).type,
    ).toBe("donate_prepare");
  });

  it("ignores test donation in normal mode", () => {
    expect(
      resolve({
        event: "test",
        key: "donate",
        id: "donate-1",
        args: donationArgs,
      }),
    ).toMatchObject({ type: "ignore", reason: "inactive_event_name" });
  });

  it("accepts test donation in test mode", () => {
    expect(
      resolve(
        {
          event: "test",
          key: "donate",
          id: "donate-1",
          args: donationArgs,
        },
        "all",
        true,
      ).type,
    ).toBe("donate_prepare");
  });

  it("ignores normal donation in test mode", () => {
    expect(
      resolve(
        {
          event: "prepare",
          key: "donate",
          id: "donate-1",
          args: donationArgs,
        },
        "all",
        true,
      ),
    ).toMatchObject({ type: "ignore", reason: "inactive_event_name" });
  });

  it("accepts normal started, update, and finished events in normal mode", () => {
    expect(
      resolve({
        event: "started",
        key: "dogs",
        id: "reward-1",
        args: rewardArgs,
      }).type,
    ).toBe("prepare_started");
    expect(
      resolve({
        event: "update",
        key: "dogs",
        id: "reward-1",
        args: { key: "time", value: 5 },
      }).type,
    ).toBe("update");
    expect(
      resolve({
        event: "finished",
        key: "dogs",
        id: "reward-1",
        args: {},
      }).type,
    ).toBe("finished");
  });

  it("accepts t_prepare, t_started, t_update, and t_finished in test mode", () => {
    expect(
      resolve(
        {
          event: "t_prepare",
          key: "dogs",
          id: "reward-1",
          args: rewardArgs,
        },
        "all",
        true,
      ),
    ).toMatchObject({ type: "prepare_started", state: "prepare" });
    expect(
      resolve(
        {
          event: "t_started",
          key: "dogs",
          id: "reward-1",
          args: rewardArgs,
        },
        "all",
        true,
      ),
    ).toMatchObject({ type: "prepare_started", state: "started" });
    expect(
      resolve(
        {
          event: "t_update",
          key: "dogs",
          id: "reward-1",
          args: { key: "time", value: 5 },
        },
        "all",
        true,
      ).type,
    ).toBe("update");
    expect(
      resolve(
        {
          event: "t_finished",
          key: "dogs",
          id: "reward-1",
          args: {},
        },
        "all",
        true,
      ).type,
    ).toBe("finished");
  });

  it("makes TIP_ALERT ignore rewards", () => {
    expect(
      resolve(
        {
          event: "prepare",
          key: "dogs",
          id: "reward-1",
          args: rewardArgs,
        },
        "tip",
      ),
    ).toMatchObject({ type: "ignore", reason: "inactive_overlay_mode" });
  });

  it("makes REWARD_ALERT ignore donations", () => {
    expect(
      resolve(
        {
          event: "prepare",
          key: "donate",
          id: "donate-1",
          args: donationArgs,
        },
        "reward",
      ),
    ).toMatchObject({ type: "ignore", reason: "inactive_overlay_mode" });
  });

  it("makes ALERTS accept donation and reward according to mode and testMode rules", () => {
    expect(
      resolve({
        event: "prepare",
        key: "donate",
        id: "donate-1",
        args: donationArgs,
      }).type,
    ).toBe("donate_prepare");
    expect(
      resolve({
        event: "prepare",
        key: "dogs",
        id: "reward-1",
        args: rewardArgs,
      }).type,
    ).toBe("prepare_started");
    expect(
      resolve(
        {
          event: "t_prepare",
          key: "dogs",
          id: "reward-1",
          args: rewardArgs,
        },
        "all",
        true,
      ).type,
    ).toBe("prepare_started");
  });

  it("ignores unknown events", () => {
    expect(
      resolve({
        event: "unknown",
        key: "donate",
        id: "donate-1",
        args: donationArgs,
      }),
    ).toMatchObject({ type: "ignore", reason: "inactive_event_name" });
  });

  it("accepts alertList only in normal mode", () => {
    expect(
      resolve({
        event: "alertList",
        key: "set",
        id: "alert-list-1",
        args: { list: ["a", "b"] },
      }).type,
    ).toBe("alert_list");
  });

  it("ignores alertList in test mode", () => {
    expect(
      resolve(
        {
          event: "alertList",
          key: "set",
          id: "alert-list-1",
          args: { list: ["a", "b"] },
        },
        "all",
        true,
      ),
    ).toMatchObject({ type: "ignore", reason: "inactive_event_name" });
  });
});
