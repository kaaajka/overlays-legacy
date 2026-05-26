import { resolvePublicAssetUrl } from "../assets/resolveOverlayAssetUrl";

export const TEST_DONATE_TTS_AUDIO_PATH = "assets/sounds/shared/tipply-test-tts.mp3";
export const TEST_DONATE_TTS_AUDIO_URL = resolvePublicAssetUrl(TEST_DONATE_TTS_AUDIO_PATH);

export type DonateTtsAudioKind = "tts-nickname" | "tts-amount" | "tts-message";

export function resolveDonateTtsAudioUrl<TOriginalUrl extends string | null | undefined>(
  originalUrl: TOriginalUrl,
  {
    isTestDonate,
    kind,
  }: {
    isTestDonate: boolean;
    kind: DonateTtsAudioKind;
  },
): string | null | TOriginalUrl {
  if (isTestDonate) {
    return kind === "tts-message" ? TEST_DONATE_TTS_AUDIO_URL : null;
  }

  return originalUrl;
}
