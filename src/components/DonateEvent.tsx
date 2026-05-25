import React from "react";
import { observer } from "mobx-react";

import type { DonateEventModel } from "../models/DonateEvent";
import { debugLog } from "../debug";
import { resolveBackendAudioUrl } from "../audio/resolveBackendAudioUrl";
import {
  resolveDonationAudioUrl,
  resolveDonationGifUrl,
} from "../assets/resolveOverlayAssetUrl";
import {
  getMutedFixtureAudioDelayMs,
  isDevFixtureAudioMuted,
  type MutedFixtureAudioKind,
} from "../dev/replay/legacyReplay";

import Donate1 from "./donations/Donate1";
import Donate2 from "./donations/Donate2";
import Donate3 from "./donations/Donate3";
import Donate4 from "./donations/Donate4";
import Donate5 from "./donations/Donate5";
import Donate6 from "./donations/Donate6";
import Donate7 from "./donations/Donate7";
import Donate8 from "./donations/Donate8";
import Donate10 from "./donations/Donate10";

type DonateTemplateSound = {
  url: string;
  volume: number;
};

type DonateTemplateVoiceType = "GOOGLE_POLISH_MALE" | "GOOGLE_POLISH_FEMALE";

type DonateTemplateSpeech = {
  readAmount: boolean;
  readMessage: boolean;
  readNickname: boolean;
  voiceType: DonateTemplateVoiceType;
  volume: number;
};

type DonateTemplateComponentProps = {
  donate: DonateEventModel;
  images: string[];
  withCommission: boolean;
};

type DonateTemplateConfig = {
  amount: number;
  amountWithoutCommission: boolean;
  images: string[];
  sound: DonateTemplateSound;
  speech: DonateTemplateSpeech;
  template: React.ComponentType<DonateTemplateComponentProps>;
};

const templates: DonateTemplateConfig[] = [
  {
    amount: 50,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("1.gif")],
    sound: {
      url: resolveDonationAudioUrl("1.mpga"),
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
    amount: 500,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("2.gif")],
    sound: {
      url: resolveDonationAudioUrl("2.mpga"),
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
    amount: 2500,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("3.gif")],
    sound: {
      url: resolveDonationAudioUrl("3.mpga"),
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
    amount: 5000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("4.gif")],
    sound: {
      url: resolveDonationAudioUrl("4.mpga"),
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
    amount: 10000,
    //amount: 9000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("5.gif")],
    sound: {
      url: resolveDonationAudioUrl("5.mp3"),
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
    amount: 15000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("6.gif")],
    sound: {
      url: resolveDonationAudioUrl("6.mpga"),
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

  /*{
        amount: 20000,
        amountWithoutCommission: true,
        images: [resolveDonationGifUrl("6.gif")],
        sound: {
            url: resolveDonationAudioUrl("7.mp3"),
            volume: 1,
        },
        speech: {
            readAmount: true,
            readMessage: true,
            readNickname: true,
            voiceType: "GOOGLE_POLISH_FEMALE",
            volume: 0.4,
        },
        template: Donate9
    },*/

  {
    amount: 30000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("7.gif")],
    sound: {
      url: resolveDonationAudioUrl("7.mp3"),
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

  {
    amount: 40000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("7.gif")],
    sound: {
      url: resolveDonationAudioUrl("7.mp3"),
      volume: 1,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_FEMALE",
      volume: 0.4,
    },
    template: Donate8,
  },

  {
    amount: 50000,
    amountWithoutCommission: true,
    images: [resolveDonationGifUrl("7.gif")],
    sound: {
      url: resolveDonationAudioUrl("7.mp3"),
      volume: 1,
    },
    speech: {
      readAmount: true,
      readMessage: true,
      readNickname: true,
      voiceType: "GOOGLE_POLISH_FEMALE",
      volume: 0.4,
    },
    template: Donate10,
  },
];

@observer
export default class DonateEvent extends React.Component<
  IDonateEventProps,
  { shouldRender: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { shouldRender: false };
  }

  componentDidMount() {
    this.startDonateSequence();
  }

  componentDidUpdate(prevProps: Readonly<IDonateEventProps>) {
    if (prevProps.donate.id !== this.props.donate.id) {
      this.startDonateSequence();
    }
  }

  render() {
    const { donate } = this.props;
    const { template: TemplateComponent, images, amountWithoutCommission } = this.findTemplate();
    const { shouldRender } = this.state;

    if (!TemplateComponent || !shouldRender) return null;

    return (
      <TemplateComponent donate={donate} images={images} withCommission={amountWithoutCommission} />
    );
  }

  private startDonateSequence() {
    const { sound, speech } = this.findTemplate();

    this.runDonate(sound, speech).catch((error) => {
      debugLog("Donate sequence failed safely", error);
      this.finishDonate();
    });
  }

  private async runDonate(sound: DonateTemplateSound, speech: DonateTemplateSpeech) {
    const { donate } = this.props;

    if (sound.url.length > 0) {
      await this.playSound(sound.url, sound.volume, true, "Donate template audio", "template");
    }

    if (speech.readNickname) {
      const speechNicknamePath =
        speech.voiceType === "GOOGLE_POLISH_MALE"
          ? donate.tts_nickname_google_male
          : donate.tts_nickname_google_female;
      const speechNicknameUrl = resolveBackendAudioUrl(speechNicknamePath);
      if (speechNicknameUrl) {
        await this.playSound(
          speechNicknameUrl,
          speech.volume,
          false,
          "Donate nickname TTS",
          "tts-nickname",
        );
      }
    }
    if (speech.readAmount) {
      const speechAmountPath =
        speech.voiceType === "GOOGLE_POLISH_MALE"
          ? donate.tts_amount_google_male
          : donate.tts_amount_google_female;
      const speechAmountUrl = resolveBackendAudioUrl(speechAmountPath);
      if (speechAmountUrl) {
        await this.playSound(
          speechAmountUrl,
          speech.volume,
          false,
          "Donate amount TTS",
          "tts-amount",
        );
      }
    }
    if (speech.readMessage) {
      const speechMessagePath =
        speech.voiceType === "GOOGLE_POLISH_MALE"
          ? donate.tts_message_google_male
          : donate.tts_message_google_female;
      const speechMessageUrl = resolveBackendAudioUrl(speechMessagePath);
      if (speechMessageUrl) {
        await this.playSound(
          speechMessageUrl,
          speech.volume,
          false,
          "Donate message TTS",
          "tts-message",
        );
      }
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });

    this.finishDonate();
  }

  private finishDonate() {
    const { onFinished } = this.props;

    this.setState({ shouldRender: false });

    onFinished?.();
  }

  private playSound(
    url: string,
    volume: number,
    shouldSetState: boolean = false,
    label: string = "Donate audio",
    mutedFixtureAudioKind: MutedFixtureAudioKind = "fallback",
  ): Promise<void> {
    const safeVolume = typeof volume === "number" ? Math.min(1, Math.max(0, volume)) : 1;

    if (isDevFixtureAudioMuted()) {
      const simulatedDelayMs = getMutedFixtureAudioDelayMs({
        kind: mutedFixtureAudioKind,
        label,
      });

      debugLog("Skipped overlay audio during muted fixture replay", {
        url,
        label,
        simulatedDelayMs,
      });

      if (shouldSetState) {
        this.setState({ shouldRender: true });
      }

      return new Promise((resolve) => {
        window.setTimeout(resolve, simulatedDelayMs);
      });
    }

    return new Promise((resolve) => {
      const audio = new Audio(url);

      audio.volume = safeVolume;

      const finishSafely = () => {
        resolve();
      };

      audio.addEventListener("canplaythrough", () => {
        if (shouldSetState) {
          this.setState({ shouldRender: true });
        }

        audio.play().catch((error) => {
          debugLog("Donate audio play failed safely", { url, error });
          finishSafely();
        });
      });

      audio.addEventListener("ended", finishSafely);
      audio.addEventListener("error", (error) => {
        debugLog("Donate audio load failed safely", { url, error });
        finishSafely();
      });
    });
  }

  private findTemplate() {
    const { donate } = this.props;

    templates.sort((a, b) => {
      if (a.amount === b.amount) return 0;

      return a.amount > b.amount ? 1 : -1;
    });

    let selected: DonateTemplateConfig | undefined;

    for (let i = 0; i < templates.length; i++) {
      const min = templates[i].amount;
      const max = templates[i + 1] ? templates[i + 1].amount : null;

      if (max === null) {
        if (donate.amount >= min) selected = templates[i];
      } else {
        if (donate.amount >= min && donate.amount <= max) selected = templates[i];
      }
    }

    if (!selected) return templates[0];

    return selected;
  }
}

interface IDonateEventProps {
  donate: DonateEventModel;
  onFinished: () => void;
}
