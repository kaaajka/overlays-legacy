import {
  resolveDonationAudioUrl,
  resolveDonationGifUrl,
} from "../assets/resolveOverlayAssetUrl";
import Donate1 from "../components/donations/Donate1";
import Donate2 from "../components/donations/Donate2";
import Donate3 from "../components/donations/Donate3";
import Donate4 from "../components/donations/Donate4";
import Donate5 from "../components/donations/Donate5";
import Donate6 from "../components/donations/Donate6";
import Donate7 from "../components/donations/Donate7";

import type { DonateTemplateConfig } from "./donationTemplateTypes";

export const donationTemplates: DonateTemplateConfig[] = [
  {
    minAmount: 50,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl(1)],
    sound: {
      url: resolveDonationAudioUrl(1),
      volume: 0.4,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_MALE",
      volume: 0.4,
    },
    template: Donate1,
  },
  {
    minAmount: 500,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl(2)],
    sound: {
      url: resolveDonationAudioUrl(2),
      volume: 0.14,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_MALE",
      volume: 0.4,
    },
    template: Donate2,
  },

  {
    minAmount: 2500,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl(3)],
    sound: {
      url: resolveDonationAudioUrl(3),
      volume: 0.3,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_FEMALE",
      volume: 0.4,
    },
    template: Donate3,
  },

  {
    minAmount: 5000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl(4)],
    sound: {
      url: resolveDonationAudioUrl(4),
      volume: 0.4,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_FEMALE",
      volume: 0.4,
    },
    template: Donate4,
  },

  {
    minAmount: 10000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl(5)],
    sound: {
      url: resolveDonationAudioUrl(5),
      volume: 0.3,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_FEMALE",
      volume: 0.4,
    },
    template: Donate5,
  },

  {
    minAmount: 15000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl(6)],
    sound: {
      url: resolveDonationAudioUrl(6),
      volume: 1,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_FEMALE",
      volume: 0.4,
    },
    template: Donate6,
  },

  {
    minAmount: 30000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl(7)],
    sound: {
      url: resolveDonationAudioUrl(7),
      volume: 1,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_FEMALE",
      volume: 0.4,
    },
    template: Donate7,
  },
];
