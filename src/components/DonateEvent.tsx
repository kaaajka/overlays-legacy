import { useEffect, useRef } from "react";
import { playOverlayAudioSequence } from "../audio/playOverlayAudioSequence";
import { resolveBackendAudioUrl } from "../audio/resolveBackendAudioUrl";
import { MusicPlayback } from "../audio/motion/MusicPlayback";
import { readVisualSyncOffset } from "../audio/motion/AudioClock";
import { resolveDonateTtsAudioUrl } from "../donations/resolveDonateTtsAudioUrl";
import { resolveDonationTemplate } from "../donations/resolveDonationTemplate";
import { treatmentForMinimum } from "../donations/choreography/treatments";
import { runMotionDonation } from "../donations/runMotionDonation";
import { isDevFixtureAudioMuted, isDevFixtureFastMode } from "../dev/replay/legacyReplay";
import type { DonateEventModel } from "../models/DonateEvent";
import { DonationScene } from "../motion/engine/DonationScene";
import type { DonationSceneHandle } from "../motion/engine/DonationScene";
import { SceneErrorBoundary } from "../motion/engine/SceneErrorBoundary";

export default function DonateEvent({
  donate,
  onFinished,
}: {
  donate: DonateEventModel;
  onFinished: () => void;
}) {
  const scene = useRef<DonationSceneHandle>();
  const finished = useRef(onFinished);
  finished.current = onFinished;
  const config = resolveDonationTemplate(donate.amount);
  const treatment = treatmentForMinimum(config.minAmount);
  const snapshot = useRef(donate);
  snapshot.current = donate;

  useEffect(() => {
    const current = snapshot.current;
    if (current.id !== donate.id) return;
    const abort = new AbortController();
    let playback: MusicPlayback;
    let raf = 0;
    let previousFrame = 0;
    let completed = false;
    const fast = isDevFixtureFastMode();
    const { speech } = config;
    const male = speech.voiceType === "GOOGLE_POLISH_MALE";
    const url = (path: string, kind: "tts-nickname" | "tts-amount" | "tts-message") => {
      const resolved = resolveDonateTtsAudioUrl(path, { isTestDonate: current.test, kind });
      return current.test ? resolved : resolveBackendAudioUrl(resolved);
    };
    const steps = [
      {
        url: speech.readNickname
          ? url(
              male ? current.tts_nickname_google_male : current.tts_nickname_google_female,
              "tts-nickname",
            )
          : null,
        label: "Donate nickname TTS",
        mutedFixtureAudioKind: "tts-nickname" as const,
      },
      {
        url: speech.readAmount
          ? url(
              male ? current.tts_amount_google_male : current.tts_amount_google_female,
              "tts-amount",
            )
          : null,
        label: "Donate amount TTS",
        mutedFixtureAudioKind: "tts-amount" as const,
      },
      {
        url: speech.readMessage
          ? url(
              male ? current.tts_message_google_male : current.tts_message_google_female,
              "tts-message",
            )
          : null,
        label: "Donate message TTS",
        mutedFixtureAudioKind: "tts-message" as const,
      },
    ].map((step) => ({ ...step, volume: speech.volume, kind: "tts" as const }));
    const frame = (now: number) => {
      if (abort.signal.aborted) return;
      scene.current?.renderAt(playback.time, previousFrame ? now - previousFrame : 16.67, true);
      previousFrame = now;
      raf = requestAnimationFrame(frame);
    };
    void runMotionDonation(
      {
        async music() {
          if (fast) {
            scene.current?.renderAt(treatment.analysis.duration);
            return;
          }
          playback = new MusicPlayback(config.sound.volume);
          playback.visualSyncOffsetMs = readVisualSyncOffset(window.location.search);
          playback.setMuted(isDevFixtureAudioMuted());
          try {
            await playback.load(config.sound.url, abort.signal);
          } catch (error) {
            if (abort.signal.aborted) return;
            console.warn("Template decode failed; using silent audio-clock fallback", error);
            playback.setSilentFallback(treatment.analysis.duration);
          }
          if (abort.signal.aborted) return;
          scene.current?.renderAt(0);
          raf = requestAnimationFrame(frame);
          try {
            await playback.play(abort.signal);
          } finally {
            cancelAnimationFrame(raf);
            playback.dispose();
          }
        },
        information: (ms) => scene.current?.information(ms),
        speech: (ttsSteps) => playOverlayAudioSequence(ttsSteps, { signal: abort.signal }),
        outro: () => scene.current?.outro(),
        finished() {
          if (completed) return;
          completed = true;
          finished.current();
        },
      },
      steps,
      current.message,
      abort.signal,
      fast,
    ).catch((error) => console.warn("Donation sequence completed after failure", error));
    return () => {
      abort.abort();
      cancelAnimationFrame(raf);
      playback?.dispose();
    };
  }, [donate.id, config, treatment]);

  return (
    <SceneErrorBoundary
      key={donate.id}
      donate={donate}
      netAmount={config.amountWithoutCommission ? donate.amount - donate.commission : donate.amount}
    >
      <DonationScene
        key={donate.id}
        ref={scene}
        donate={donate}
        treatment={treatment}
        netAmount={
          config.amountWithoutCommission ? donate.amount - donate.commission : donate.amount
        }
        quality={new URLSearchParams(window.location.search).get("motionQuality") ?? undefined}
      />
    </SceneErrorBoundary>
  );
}
