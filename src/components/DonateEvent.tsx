import React from "react";
import { observer } from "mobx-react";

import { playOverlayAudioSequence } from "../audio/playOverlayAudioSequence";
import { resolveBackendAudioUrl } from "../audio/resolveBackendAudioUrl";
import { debugLog } from "../debug";
import type {
  DonateTemplateSound,
  DonateTemplateSpeech,
} from "../donations/donationTemplateTypes";
import { resolveDonationTemplate } from "../donations/resolveDonationTemplate";
import type { DonateEventModel } from "../models/DonateEvent";

@observer
export default class DonateEvent extends React.Component<
  IDonateEventProps,
  { shouldRender: boolean }
> {
  private isComponentMounted = false;
  private sequenceId = 0;
  private activeTimeouts = new Map<number, () => void>();
  private audioAbortController: AbortController | null = null;

  constructor(props) {
    super(props);
    this.state = { shouldRender: false };
  }

  componentDidMount() {
    this.isComponentMounted = true;
    this.startDonateSequence();
  }

  componentDidUpdate(prevProps: Readonly<IDonateEventProps>) {
    if (prevProps.donate.id !== this.props.donate.id) {
      this.startDonateSequence();
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
    this.sequenceId += 1;
    this.cancelAudioSequence();
    this.clearActiveTimeouts();
  }

  render() {
    const { donate } = this.props;
    const { template: TemplateComponent, images, amountWithoutCommission } = resolveDonationTemplate(
      donate.amount,
    );
    const { shouldRender } = this.state;

    if (!TemplateComponent || !shouldRender) return null;

    return (
      <TemplateComponent
        donate={donate}
        images={images}
        withCommission={amountWithoutCommission}
      />
    );
  }

  private startDonateSequence() {
    this.sequenceId += 1;
    this.cancelAudioSequence();
    this.clearActiveTimeouts();

    const sequenceId = this.sequenceId;
    this.audioAbortController = new AbortController();
    const { sound, speech } = resolveDonationTemplate(this.props.donate.amount);

    this.runDonate(sequenceId, sound, speech).catch((error) => {
      debugLog("Donate sequence failed safely", error);
      this.finishDonate(sequenceId);
    });
  }

  private async runDonate(
    sequenceId: number,
    sound: DonateTemplateSound,
    speech: DonateTemplateSpeech,
  ) {
    const { donate } = this.props;

    if (!this.isCurrentSequence(sequenceId)) return;

    const speechNicknamePath =
      speech.voiceType === "GOOGLE_POLISH_MALE"
        ? donate.tts_nickname_google_male
        : donate.tts_nickname_google_female;
    const speechAmountPath =
      speech.voiceType === "GOOGLE_POLISH_MALE"
        ? donate.tts_amount_google_male
        : donate.tts_amount_google_female;
    const speechMessagePath =
      speech.voiceType === "GOOGLE_POLISH_MALE"
        ? donate.tts_message_google_male
        : donate.tts_message_google_female;

    await playOverlayAudioSequence(
      [
        {
          url: sound.url,
          volume: sound.volume,
          label: "Donate template audio",
          kind: "long-sound",
          mutedFixtureAudioKind: "template",
          onBeforePlay: () => {
            if (this.isCurrentSequence(sequenceId)) {
              this.setState({ shouldRender: true });
            }
          },
        },
        {
          url: speech.readNickname ? resolveBackendAudioUrl(speechNicknamePath) : null,
          volume: speech.volume,
          label: "Donate nickname TTS",
          kind: "tts",
          mutedFixtureAudioKind: "tts-nickname",
        },
        {
          url: speech.readAmount ? resolveBackendAudioUrl(speechAmountPath) : null,
          volume: speech.volume,
          label: "Donate amount TTS",
          kind: "tts",
          mutedFixtureAudioKind: "tts-amount",
        },
        {
          url: speech.readMessage ? resolveBackendAudioUrl(speechMessagePath) : null,
          volume: speech.volume,
          label: "Donate message TTS",
          kind: "tts",
          mutedFixtureAudioKind: "tts-message",
        },
      ],
      { signal: this.audioAbortController?.signal },
    );
    if (!this.isCurrentSequence(sequenceId)) return;

    await this.sleep(sequenceId, 1500);
    if (!this.isCurrentSequence(sequenceId)) return;

    this.finishDonate(sequenceId);
  }

  private finishDonate(sequenceId: number) {
    if (!this.isCurrentSequence(sequenceId)) return;

    const { onFinished } = this.props;

    this.setState({ shouldRender: false });

    onFinished?.();
  }

  private sleep(_sequenceId: number, ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        this.activeTimeouts.delete(timeout);
        resolve();
      }, ms);

      this.activeTimeouts.set(timeout, resolve);
    });
  }

  private isCurrentSequence(sequenceId: number) {
    return this.isComponentMounted && sequenceId === this.sequenceId;
  }

  private cancelAudioSequence() {
    this.audioAbortController?.abort();
    this.audioAbortController = null;
  }

  private clearActiveTimeouts() {
    this.activeTimeouts.forEach((resolve, timeout) => {
      window.clearTimeout(timeout);
      resolve();
    });

    this.activeTimeouts.clear();
  }
}

interface IDonateEventProps {
  donate: DonateEventModel;
  onFinished: () => void;
}
