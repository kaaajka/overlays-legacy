import { DonateEventModel } from "../models/DonateEvent";
import { messageContent } from "./messageContent";

export type CreateDonateEventModelFromArgsOptions = {
  fallbackId: unknown;
  emotes?: Record<string, string>;
};

export function createDonateEventModelFromArgs(
  args: Record<string, unknown>,
  { fallbackId, emotes }: CreateDonateEventModelFromArgsOptions,
): DonateEventModel | null {
  const id = typeof args.id === "string" ? args.id : fallbackId;

  if (typeof id !== "string") return null;

  const content = messageContent(typeof args.message === "string" ? args.message : "", emotes);
  return new DonateEventModel({
    id,
    nickname: typeof args.nickname === "string" ? args.nickname : "",
    message: content.text,
    messageRuns: content.runs,
    amount: typeof args.amount === "number" ? args.amount : 0,
    commission: typeof args.commission === "number" ? args.commission : 0,
    audio_url: typeof args.audio_url === "string" ? args.audio_url : null,
    tts_nickname_google_male:
      typeof args.tts_nickname_google_male === "string" ? args.tts_nickname_google_male : "",
    tts_nickname_google_female:
      typeof args.tts_nickname_google_female === "string" ? args.tts_nickname_google_female : "",
    tts_message_google_male:
      typeof args.tts_message_google_male === "string" ? args.tts_message_google_male : "",
    tts_message_google_female:
      typeof args.tts_message_google_female === "string" ? args.tts_message_google_female : "",
    tts_amount_google_male:
      typeof args.tts_amount_google_male === "string" ? args.tts_amount_google_male : "",
    tts_amount_google_female:
      typeof args.tts_amount_google_female === "string" ? args.tts_amount_google_female : "",
    test: typeof args.test === "boolean" ? args.test : false,
    resent: typeof args.resent === "boolean" ? args.resent : false,
  });
}
