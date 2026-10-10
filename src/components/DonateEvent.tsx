import { useEffect, useRef } from "react";
import { playOverlayAudioSequence } from "../audio/playOverlayAudioSequence";
import { resolveBackendAudioUrl } from "../audio/resolveBackendAudioUrl";
import { MusicPlayback } from "../audio/motion/MusicPlayback";
import { audibleContextTime, readVisualSyncOffset } from "../audio/motion/AudioClock";
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
    const integrated = treatment.tier === 6 && !fast;
    let phase: "music" | "information" | "outro" = "music";
    let informationOrigin = 0;
    let outroOrigin = 0;
    let readingMs = 0;
    let speechWindow: { start: number; duration: number } | undefined;
    const clock = () => (playback ? audibleContextTime(playback.context, performance.now()) : 0);
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
    ].map((step) => ({
      ...step,
      volume: speech.volume,
      kind: "tts" as const,
      ...(integrated && step.mutedFixtureAudioKind === "tts-message"
        ? {
            onPlaying: (audio: HTMLAudioElement) => {
              if (Number.isFinite(audio.duration) && audio.duration > 0) {
                speechWindow = { start: clock() - informationOrigin, duration: audio.duration };
              }
            },
            timeoutMs: Math.max(60000, current.message.length * 160 + 10000),
          }
        : {}),
    }));
    const frame = (now: number) => {
      if (abort.signal.aborted) return;
      if (phase === "information") {
        const elapsedMs = Math.max(0, clock() - informationOrigin) * 1000;
        // The queue, not the minimum reading hold, decides when speech is finished.
        // Do not start the sampled outro while a longer TTS clip is still playing.
        scene.current?.informationAt(
          elapsedMs,
          Math.max(
            readingMs,
            elapsedMs,
            speechWindow ? (speechWindow.start + speechWindow.duration) * 1000 : 0,
          ),
          speechWindow,
          true,
        );
      } else if (phase === "outro") scene.current?.outroAt(Math.max(0, clock() - outroOrigin));
      else
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
            if (!integrated) {
              cancelAnimationFrame(raf);
              playback.dispose();
            }
          }
        },
        information: (ms) => {
          readingMs = ms;
          informationOrigin = clock();
          phase = "information";
          scene.current?.information(ms);
        },
        speech: (ttsSteps) => playOverlayAudioSequence(ttsSteps, { signal: abort.signal }),
        outro: () => {
          phase = "outro";
          outroOrigin = clock();
          scene.current?.outro();
        },
        finished() {
          if (completed) return;
          completed = true;
          cancelAnimationFrame(raf);
          playback?.dispose();
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
