const TIPPLY_BASE_URL = "https://tipply.pl";

export function resolveBackendAudioUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
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
