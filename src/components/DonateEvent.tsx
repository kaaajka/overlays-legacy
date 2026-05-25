import { useCallback, useEffect, useRef, useState } from "react";

import { playOverlayAudioSequence } from "../audio/playOverlayAudioSequence";
import { resolveBackendAudioUrl } from "../audio/resolveBackendAudioUrl";
import { debugLog } from "../debug";
import type {
  DonateTemplateSound,
  DonateTemplateSpeech,
} from "../donations/donationTemplateTypes";
import { resolveDonationTemplate } from "../donations/resolveDonationTemplate";
import type { DonateEventModel } from "../models/DonateEvent";

export default function DonateEvent({ donate, onFinished }: IDonateEventProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const isMountedRef = useRef(false);
  const sequenceIdRef = useRef(0);
  const finishedSequenceIdRef = useRef<number | null>(null);
  const activeTimeoutsRef = useRef(new Map<number, () => void>());
  const audioAbortControllerRef = useRef<AbortController | null>(null);
  const donateRef = useRef(donate);
  const onFinishedRef = useRef(onFinished);

  donateRef.current = donate;
  onFinishedRef.current = onFinished;
  const donateId = donate.id;

  const isCurrentSequence = useCallback((sequenceId: number) => {
    return isMountedRef.current && sequenceId === sequenceIdRef.current;
  }, []);

  const cancelAudioSequence = useCallback(() => {
    audioAbortControllerRef.current?.abort();
    audioAbortControllerRef.current = null;
  }, []);

  const clearActiveTimeouts = useCallback(() => {
    activeTimeoutsRef.current.forEach((resolve, timeout) => {
      window.clearTimeout(timeout);
      resolve();
    });

    activeTimeoutsRef.current.clear();
  }, []);

  const sleep = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        activeTimeoutsRef.current.delete(timeout);
        resolve();
      }, ms);

      activeTimeoutsRef.current.set(timeout, resolve);
    });
  }, []);

  const finishDonate = useCallback(
    (sequenceId: number) => {
      if (!isCurrentSequence(sequenceId)) return;
      if (finishedSequenceIdRef.current === sequenceId) return;

      finishedSequenceIdRef.current = sequenceId;

      setShouldRender(false);

      onFinishedRef.current?.();
    },
    [isCurrentSequence],
  );

  const runDonate = useCallback(
    async (
      sequenceId: number,
      donateSnapshot: DonateEventModel,
      sound: DonateTemplateSound,
      speech: DonateTemplateSpeech,
    ) => {
      if (!isCurrentSequence(sequenceId)) return;

      const speechNicknamePath =
        speech.voiceType === "GOOGLE_POLISH_MALE"
          ? donateSnapshot.tts_nickname_google_male
          : donateSnapshot.tts_nickname_google_female;
      const speechAmountPath =
        speech.voiceType === "GOOGLE_POLISH_MALE"
          ? donateSnapshot.tts_amount_google_male
          : donateSnapshot.tts_amount_google_female;
      const speechMessagePath =
        speech.voiceType === "GOOGLE_POLISH_MALE"
          ? donateSnapshot.tts_message_google_male
          : donateSnapshot.tts_message_google_female;

      await playOverlayAudioSequence(
        [
          {
            url: sound.url,
            volume: sound.volume,
            label: "Donate template audio",
            kind: "long-sound",
            mutedFixtureAudioKind: "template",
            onBeforePlay: () => {
              if (isCurrentSequence(sequenceId)) {
                setShouldRender(true);
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
        { signal: audioAbortControllerRef.current?.signal },
      );
      if (!isCurrentSequence(sequenceId)) return;

      await sleep(1500);
      if (!isCurrentSequence(sequenceId)) return;

      finishDonate(sequenceId);
    },
    [finishDonate, isCurrentSequence, sleep],
  );

  const startDonateSequence = useCallback(() => {
    sequenceIdRef.current += 1;
    finishedSequenceIdRef.current = null;
    cancelAudioSequence();
    clearActiveTimeouts();
    setShouldRender(false);

    const sequenceId = sequenceIdRef.current;
    const donateSnapshot = donateRef.current;
    audioAbortControllerRef.current = new AbortController();
    const { sound, speech } = resolveDonationTemplate(donateSnapshot.amount);

    runDonate(sequenceId, donateSnapshot, sound, speech).catch((error) => {
      debugLog("Donate sequence failed safely", error);
      finishDonate(sequenceId);
    });
  }, [cancelAudioSequence, clearActiveTimeouts, finishDonate, runDonate]);

  useEffect(() => {
    if (donateRef.current.id !== donateId) return;

    isMountedRef.current = true;
    startDonateSequence();

    return () => {
      isMountedRef.current = false;
      sequenceIdRef.current += 1;
      cancelAudioSequence();
      clearActiveTimeouts();
    };
  }, [donateId, cancelAudioSequence, clearActiveTimeouts, startDonateSequence]);

  const { template: TemplateComponent, images, amountWithoutCommission } = resolveDonationTemplate(
    donate.amount,
  );

  if (!TemplateComponent || !shouldRender) return null;

  return (
    <TemplateComponent donate={donate} images={images} withCommission={amountWithoutCommission} />
  );
}

interface IDonateEventProps {
  donate: DonateEventModel;
  onFinished: () => void;
}
