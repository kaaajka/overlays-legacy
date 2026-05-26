import { describe, expect, it } from "vitest";

import {
  type DonationQueueState,
  resolveDonationQueueFinished,
  resolveDonationQueuePush,
  resolveDonationQueueScheduledChange,
  resolveDonationQueueSubmitFirstAlert,
} from "./resolveDonationQueueTransition";

function state(
  overrides: Partial<DonationQueueState<string>> = {},
): DonationQueueState<string> {
  return {
    donateList: [],
    currentDonate: undefined,
    donateAlertQueue: [],
    currentDonateAlert: undefined,
    ...overrides,
  };
}

describe("resolveDonationQueueTransition", () => {
  it("pushes the first donation and asks PageChannel to schedule the delayed start", () => {
    expect(resolveDonationQueuePush(state(), "donate-1")).toEqual({
      state: {
        donateList: ["donate-1"],
        currentDonate: undefined,
        donateAlertQueue: [],
        currentDonateAlert: undefined,
      },
      shouldScheduleDonationChange: true,
      acceptAlertId: undefined,
    });
  });

  it("pushes another donation without changing the current donation", () => {
    expect(
      resolveDonationQueuePush(
        state({
          donateList: ["donate-1"],
          currentDonate: "donate-1",
        }),
        "donate-2",
      ),
    ).toEqual({
      state: {
        donateList: ["donate-1", "donate-2"],
        currentDonate: "donate-1",
        donateAlertQueue: [],
        currentDonateAlert: undefined,
      },
      shouldScheduleDonationChange: false,
      acceptAlertId: undefined,
    });
  });

  it("ignores finish when there is no current donation", () => {
    const currentState = state({ donateList: ["donate-1"] });

    expect(resolveDonationQueueFinished(currentState)).toEqual({
      state: currentState,
      shouldScheduleDonationChange: false,
      acceptAlertId: undefined,
    });
  });

  it("finishes the current donation and lets the delayed transition pick the next one", () => {
    const finished = resolveDonationQueueFinished(
      state({
        donateList: ["donate-1", "donate-2"],
        currentDonate: "donate-1",
      }),
    );

    expect(finished).toMatchObject({
      state: {
        donateList: ["donate-2"],
        currentDonate: undefined,
      },
      shouldScheduleDonationChange: true,
    });

    expect(resolveDonationQueueScheduledChange(finished.state)).toMatchObject({
      state: {
        donateList: ["donate-2"],
        currentDonate: "donate-2",
      },
      shouldScheduleDonationChange: false,
    });
  });

  it("decides to accept the first alert when no alert is active", () => {
    expect(
      resolveDonationQueueSubmitFirstAlert(
        state({ donateAlertQueue: ["alert-1", "alert-2"] }),
      ),
    ).toEqual({
      state: {
        donateList: [],
        currentDonate: undefined,
        donateAlertQueue: ["alert-1", "alert-2"],
        currentDonateAlert: "alert-1",
      },
      shouldScheduleDonationChange: false,
      acceptAlertId: "alert-1",
    });
  });

  it("does not accept the same alert twice while one is active", () => {
    expect(
      resolveDonationQueueSubmitFirstAlert(
        state({
          donateAlertQueue: ["alert-1", "alert-2"],
          currentDonateAlert: "alert-1",
        }),
      ),
    ).toEqual({
      state: {
        donateList: [],
        currentDonate: undefined,
        donateAlertQueue: ["alert-1", "alert-2"],
        currentDonateAlert: "alert-1",
      },
      shouldScheduleDonationChange: false,
      acceptAlertId: undefined,
    });
  });

  it("keeps the 50ms delay as a decision and clears alert state during finish delay", () => {
    const result = resolveDonationQueueScheduledChange(
      state({
        donateList: ["donate-2"],
        donateAlertQueue: ["alert-2"],
        currentDonateAlert: "alert-1",
      }),
      { submitFirstAlert: true },
    );

    expect(result).toEqual({
      state: {
        donateList: ["donate-2"],
        currentDonate: "donate-2",
        donateAlertQueue: ["alert-2"],
        currentDonateAlert: "alert-2",
      },
      shouldScheduleDonationChange: false,
      acceptAlertId: "alert-2",
    });
  });
});
