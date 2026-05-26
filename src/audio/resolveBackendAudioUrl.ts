const TIPPLY_BASE_URL = "https://tipply.pl";
const TIPPLY_TTS_STORAGE_BASE_URL =
  "https://tipply-prod-data.s3.waw.io.cloud.ovh.net/tips/tts";

function resolveLegacyTipplyTtsCacheUrl(value: string): string | null {
  if (value.startsWith("/ttscache/")) {
    return `${TIPPLY_TTS_STORAGE_BASE_URL}/${value.slice("/ttscache/".length)}`;
  }

  if (!/^https?:\/\//i.test(value)) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.hostname !== "tipply.pl" || !url.pathname.startsWith("/ttscache/")) {
    return null;
  }

  return `${TIPPLY_TTS_STORAGE_BASE_URL}/${url.pathname.slice("/ttscache/".length)}`;
}

export function resolveBackendAudioUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const legacyTtsCacheUrl = resolveLegacyTipplyTtsCacheUrl(trimmed);

  if (legacyTtsCacheUrl) {
    return legacyTtsCacheUrl;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `${TIPPLY_BASE_URL}${trimmed}`;
  }

  return `${TIPPLY_BASE_URL}/${trimmed}`;
}
