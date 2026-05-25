import { DonateEventModel } from "../models/DonateEvent";

export type CreateDonateEventModelFromArgsOptions = {
  fallbackId: unknown;
};

function normalizeDonateMessage(message: string): string {
  return message.replaceAll(/<img(?:.*?)alt="(.*?)"(?:.*?)>/g, (_match, p1) =>
    p1 ? p1 : "",
  );
}

export function createDonateEventModelFromArgs(
  args: Record<string, unknown>,
  { fallbackId }: CreateDonateEventModelFromArgsOptions,
): DonateEventModel | null {
  const id = typeof args.id === "string" ? args.id : fallbackId;

  if (typeof id !== "string") return null;

  return new DonateEventModel({
    id,
    nickname: typeof args.nickname === "string" ? args.nickname : "",
    message:
      typeof args.message === "string"
        ? normalizeDonateMessage(args.message)
        : "",
    amount: typeof args.amount === "number" ? args.amount : 0,
    commission: typeof args.commission === "number" ? args.commission : 0,
    audio_url: typeof args.audio_url === "string" ? args.audio_url : null,
    tts_nickname_google_male:
      typeof args.tts_nickname_google_male === "string"
        ? args.tts_nickname_google_male
        : "",
    tts_nickname_google_female:
      typeof args.tts_nickname_google_female === "string"
        ? args.tts_nickname_google_female
        : "",
    tts_message_google_male:
      typeof args.tts_message_google_male === "string"
        ? args.tts_message_google_male
        : "",
    tts_message_google_female:
      typeof args.tts_message_google_female === "string"
        ? args.tts_message_google_female
        : "",
    tts_amount_google_male:
      typeof args.tts_amount_google_male === "string"
        ? args.tts_amount_google_male
        : "",
    tts_amount_google_female:
      typeof args.tts_amount_google_female === "string"
        ? args.tts_amount_google_female
        : "",
    test: typeof args.test === "boolean" ? args.test : false,
    resent: typeof args.resent === "boolean" ? args.resent : false,
  });
}
