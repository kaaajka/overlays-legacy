import { describe, expect, it } from "vitest";

import followersSet from "../dev/fixtures/followers-set.json";
import followersUpdate from "../dev/fixtures/followers-update.json";
import mainAlertListSet from "../dev/fixtures/main-alert-list-set.json";
import mainCoinflipPrepare from "../dev/fixtures/main-coinflip-prepare.json";
import mainCoinflipStarted from "../dev/fixtures/main-coinflip-started.json";
import mainDonatePrepare from "../dev/fixtures/main-donate-prepare.json";
import mainDonateHtmlMessage from "../dev/fixtures/main-donate-html-message.json";
import mainDonateWithoutAudioUrl from "../dev/fixtures/main-donate-without-audio-url.json";
import mainRoulettePrepare from "../dev/fixtures/main-roulette-prepare.json";
import mainRouletteStarted from "../dev/fixtures/main-roulette-started.json";
import queueAdd from "../dev/fixtures/queue-add.json";
import queueDelete from "../dev/fixtures/queue-delete.json";
import queueSet from "../dev/fixtures/queue-set.json";
import subsSet from "../dev/fixtures/subs-set.json";
import subsUpdate from "../dev/fixtures/subs-update.json";
import {
  isLegacyGoalMessage,
  isLegacyMainMessage,
  isLegacyQueueMessage,
} from "./legacyOverlayProtocol";

describe("legacy queue protocol guards", () => {
  it("accepts the valid queue set fixture", () => {
    expect(isLegacyQueueMessage(queueSet)).toBe(true);
  });

  it("accepts the valid queue add fixture", () => {
    expect(isLegacyQueueMessage(queueAdd)).toBe(true);
  });

  it("accepts the valid queue delete fixture", () => {
    expect(isLegacyQueueMessage(queueDelete)).toBe(true);
  });

  it("rejects a queue message without args", () => {
    const { args: _args, ...withoutArgs } = queueSet;

    expect(isLegacyQueueMessage(withoutArgs)).toBe(false);
  });

  it("rejects a queue set message whose list is not an array", () => {
    expect(
      isLegacyQueueMessage({
        ...queueSet,
        args: {
          list: "not-an-array",
        },
      }),
    ).toBe(false);
  });
});

describe("legacy goal protocol guards", () => {
  it("accepts the valid subs set fixture", () => {
    expect(isLegacyGoalMessage(subsSet)).toBe(true);
  });

  it("accepts the valid subs update fixture", () => {
    expect(isLegacyGoalMessage(subsUpdate)).toBe(true);
  });

  it("accepts the valid followers set fixture", () => {
    expect(isLegacyGoalMessage(followersSet)).toBe(true);
  });

  it("accepts the valid followers update fixture", () => {
    expect(isLegacyGoalMessage(followersUpdate)).toBe(true);
  });

  it("rejects a goal message without args", () => {
    const { args: _args, ...withoutArgs } = subsSet;

    expect(isLegacyGoalMessage(withoutArgs)).toBe(false);
  });

  it("rejects current as a string", () => {
    expect(
      isLegacyGoalMessage({
        ...subsSet,
        args: {
          current: "13",
          goal: 25,
        },
      }),
    ).toBe(false);
  });
});

describe("legacy main overlay protocol guards", () => {
  it("accepts the valid alertList fixture", () => {
    expect(isLegacyMainMessage(mainAlertListSet)).toBe(true);
  });

  it("accepts the valid donate prepare fixture", () => {
    expect(isLegacyMainMessage(mainDonatePrepare)).toBe(true);
  });

  it("accepts donate prepare with audio_url null", () => {
    expect(isLegacyMainMessage(mainDonatePrepare)).toBe(true);
    expect(mainDonatePrepare.args.audio_url).toBeNull();
  });

  it("accepts donate prepare with only male TTS fields", () => {
    expect(isLegacyMainMessage(mainDonateWithoutAudioUrl)).toBe(true);
    expect("tts_nickname_google_female" in mainDonateWithoutAudioUrl.args).toBe(false);
    expect("tts_message_google_female" in mainDonateWithoutAudioUrl.args).toBe(false);
    expect("tts_amount_google_female" in mainDonateWithoutAudioUrl.args).toBe(false);
  });

  it("accepts donate prepare with an HTML message", () => {
    expect(isLegacyMainMessage(mainDonateHtmlMessage)).toBe(true);
    expect(mainDonateHtmlMessage.args.message).toContain("<img");
  });

  it("does not require backend-only payment fields on donate args", () => {
    expect(isLegacyMainMessage(mainDonatePrepare)).toBe(true);
    expect("email" in mainDonatePrepare.args).toBe(false);
    expect("payment_id" in mainDonatePrepare.args).toBe(false);
    expect("receiver_id" in mainDonatePrepare.args).toBe(false);
  });

  it("rejects a raw Tipply top-level webhook as a frontend main websocket message", () => {
    expect(
      isLegacyMainMessage({
        nickname: "Michaś",
        receiver_id: "a15cc713-554f-4e8e-b25b-45a0cc77650c",
        amount: 300,
        message: "debugowanie...",
        commission: 29,
        test: false,
        resent: false,
      }),
    ).toBe(false);
  });

  it("rejects malformed donate prepare without args", () => {
    expect(
      isLegacyMainMessage({
        event: "prepare",
        key: "donate",
        id: "donate-without-args",
      }),
    ).toBe(false);
  });

  it("rejects malformed donate prepare when args is not an object", () => {
    expect(
      isLegacyMainMessage({
        event: "prepare",
        key: "donate",
        id: "donate-with-string-args",
        args: "not-an-object",
      }),
    ).toBe(false);
  });

  it("accepts the valid roulette prepare fixture", () => {
    expect(isLegacyMainMessage(mainRoulettePrepare)).toBe(true);
  });

  it("accepts the valid roulette started fixture", () => {
    expect(isLegacyMainMessage(mainRouletteStarted)).toBe(true);
  });

  it("accepts the valid coinflip prepare fixture", () => {
    expect(isLegacyMainMessage(mainCoinflipPrepare)).toBe(true);
  });

  it("accepts the valid coinflip started fixture", () => {
    expect(isLegacyMainMessage(mainCoinflipStarted)).toBe(true);
  });

  it("accepts unknown main events at the guard layer for legacy compatibility", () => {
    expect(
      isLegacyMainMessage({
        event: "unknown-legacy-event",
        key: "unknown-key",
        id: "unknown-id",
        args: {},
      }),
    ).toBe(true);
  });

  it("rejects malformed main messages without id", () => {
    expect(
      isLegacyMainMessage({
        event: "prepare",
        key: "donate",
        args: {},
      }),
    ).toBe(false);
  });
});
