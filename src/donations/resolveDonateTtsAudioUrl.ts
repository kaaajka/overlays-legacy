export const TEST_DONATE_TTS_AUDIO_URL = "/assets/sounds/shared/tipply-test-tts.mp3";

export function resolveDonateTtsAudioUrl<TOriginalUrl extends string | null | undefined>(
  originalUrl: TOriginalUrl,
  { isTestDonate }: { isTestDonate: boolean },
): string | TOriginalUrl {
  if (isTestDonate) return TEST_DONATE_TTS_AUDIO_URL;

  return originalUrl;
}
