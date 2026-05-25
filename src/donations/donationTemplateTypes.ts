import type { ComponentType } from "react";

import type { DonateEventModel } from "../models/DonateEvent";

export type DonateTemplateSound = {
  url: string;
  volume: number;
};

export type DonateTemplateVoiceType = "GOOGLE_POLISH_MALE" | "GOOGLE_POLISH_FEMALE";

export type DonateTemplateSpeech = {
  readAmount: boolean;
  readMessage: boolean;
  readNickname: boolean;
  voiceType: DonateTemplateVoiceType;
  volume: number;
};

export type DonateTemplateComponentProps = {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
};

export type DonateTemplateConfig = {
  minAmount: number;
  amountWithoutCommission: boolean;
  images: string[];
  sound: DonateTemplateSound;
  speech: DonateTemplateSpeech;
  template: ComponentType<DonateTemplateComponentProps>;
};
