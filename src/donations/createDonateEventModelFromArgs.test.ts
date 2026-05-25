import { describe, expect, it } from "vitest";

import { createDonateEventModelFromArgs } from "./createDonateEventModelFromArgs";
import { DonateEventModel } from "../models/DonateEvent";

describe("createDonateEventModelFromArgs", () => {
  it("creates DonateEventModel from a valid payload", () => {
    const model = createDonateEventModelFromArgs(
      {
        id: "donate-1",
        nickname: "Ada",
        message: "dzieki",
        amount: 42,
        commission: 3,
        audio_url: "audio.mp3",
        test: true,
        resent: true,
      },
      { fallbackId: "fallback-id" },
    );

    expect(model).toBeInstanceOf(DonateEventModel);
    expect(model).toMatchObject({
      id: "donate-1",
      nickname: "Ada",
      message: "dzieki",
      amount: 42,
      commission: 3,
      audio_url: "audio.mp3",
      test: true,
      resent: true,
    });
  });

  it("falls back to message id and zero amount like PageChannel did", () => {
    const model = createDonateEventModelFromArgs(
      {
        nickname: "Ada",
      },
      { fallbackId: "message-id" },
    );

    expect(model).toMatchObject({
      id: "message-id",
      amount: 0,
      commission: 0,
      message: "",
      audio_url: null,
      test: false,
      resent: false,
    });
  });

  it("returns null when no string id is available", () => {
    expect(
      createDonateEventModelFromArgs({}, { fallbackId: undefined }),
    ).toBeNull();
  });

  it("normalizes image tags in message to their alt text", () => {
    const model = createDonateEventModelFromArgs(
      {
        message: 'hej <img src="x.png" alt="Kappa" />!',
      },
      { fallbackId: "donate-1" },
    );

    expect(model?.message).toBe("hej Kappa!");
  });

  it("copies TTS fields without changes", () => {
    const model = createDonateEventModelFromArgs(
      {
        tts_nickname_google_male: "nick-male.mp3",
        tts_nickname_google_female: "nick-female.mp3",
        tts_message_google_male: "message-male.mp3",
        tts_message_google_female: "message-female.mp3",
        tts_amount_google_male: "amount-male.mp3",
        tts_amount_google_female: "amount-female.mp3",
      },
      { fallbackId: "donate-1" },
    );

    expect(model).toMatchObject({
      tts_nickname_google_male: "nick-male.mp3",
      tts_nickname_google_female: "nick-female.mp3",
      tts_message_google_male: "message-male.mp3",
      tts_message_google_female: "message-female.mp3",
      tts_amount_google_male: "amount-male.mp3",
      tts_amount_google_female: "amount-female.mp3",
    });
  });

  it("ignores unknown fields while creating the model", () => {
    const model = createDonateEventModelFromArgs(
      {
        id: "donate-1",
        amount: 12,
        unknown: "ignored",
      },
      { fallbackId: "fallback-id" },
    );

    expect(model).toMatchObject({
      id: "donate-1",
      amount: 12,
    });
  });
});
