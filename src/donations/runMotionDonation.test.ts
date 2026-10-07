import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { messageReadingMs, runMotionDonation } from "./runMotionDonation";
import {
  resolveDonationQueueFinished,
  resolveDonationQueuePush,
  resolveDonationQueueScheduledChange,
} from "./resolveDonationQueueTransition";
import type { DonationQueueState } from "./resolveDonationQueueTransition";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("motion → information → Tipply → existing queue", () => {
  it("keeps the queue occupied until music, ordered TTS and readable hold finish", async () => {
    const calls: string[] = [];
    let releaseMusic: () => void;
    const done = vi.fn();
    const steps = ["nickname", "amount", "message"].map((label) => ({ label }));
    const sequence = runMotionDonation(
      {
        music: () =>
          new Promise((resolve) => {
            releaseMusic = resolve;
            calls.push("music");
          }),
        information: () => {
          calls.push("information");
        },
        speech: async (tts) => {
          for (const step of tts) calls.push(step.label);
        },
        outro: () => {
          calls.push("outro");
        },
        finished: done,
      },
      steps,
      "Dzięki!",
      new AbortController().signal,
    );
    await vi.advanceTimersByTimeAsync(10000);
    expect(done).not.toHaveBeenCalled();
    releaseMusic();
    await vi.advanceTimersByTimeAsync(5500);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(650);
    await sequence;
    expect(calls).toEqual(["music", "information", "nickname", "amount", "message", "outro"]);
    expect(done).toHaveBeenCalledTimes(1);
  });
  it("finishes despite music, scene and speech failures", async () => {
    const done = vi.fn();
    const speech = vi.fn().mockRejectedValue(new Error("TTS failed"));
    const sequence = runMotionDonation(
      {
        music: async () => {
          throw new Error("decode");
        },
        information: () => {
          throw new Error("visual");
        },
        speech,
        outro: () => {
          throw new Error();
        },
        finished: done,
      },
      [],
      "",
      new AbortController().signal,
      true,
    );
    await vi.runAllTimersAsync();
    await sequence;
    expect(speech).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
  });
  it("cancels read holds without a stale completion", async () => {
    const abort = new AbortController();
    const done = vi.fn();
    const sequence = runMotionDonation(
      {
        music: async () => {},
        information: () => {},
        speech: async () => {},
        outro: () => {},
        finished: done,
      },
      [],
      "long ".repeat(1000),
      abort.signal,
    );
    await vi.advanceTimersByTimeAsync(10);
    abort.abort();
    await sequence;
    expect(done).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("advances the existing FIFO reducer and never prioritizes a larger incoming donation", async () => {
    type Donation = { id: string; amount: number };
    let state: DonationQueueState<Donation> = {
      donateList: [],
      currentDonate: undefined,
      donateAlertQueue: [],
      currentDonateAlert: undefined,
    };
    state = resolveDonationQueuePush(state, { id: "first", amount: 50 }).state;
    state = resolveDonationQueueScheduledChange(state).state;
    state = resolveDonationQueuePush(state, { id: "large", amount: 99999 }).state;
    expect(state.currentDonate.id).toBe("first");
    const sequence = runMotionDonation(
      {
        music: async () => {},
        information: () => {},
        speech: async () => {},
        outro: () => {},
        finished: () => {
          state = resolveDonationQueueFinished(state).state;
          state = resolveDonationQueueScheduledChange(state).state;
        },
      },
      [],
      "",
      new AbortController().signal,
      true,
    );
    await vi.runAllTimersAsync();
    await sequence;
    expect(state.currentDonate.id).toBe("large");
  });
  it("extends display time for the complete message rather than truncating it", () => {
    expect(messageReadingMs("x".repeat(1800))).toBe(105000);
  });
});
