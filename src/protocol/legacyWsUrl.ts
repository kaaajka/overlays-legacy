export type LegacyOverlaySocketKind = "main" | "subs" | "followers" | "queue";

const LEGACY_SOCKET_PATH: Record<LegacyOverlaySocketKind, string> = {
  main: "",
  subs: "/subs",
  followers: "/followers",
  queue: "/queue",
};

export function buildLegacyWsUrl(
  baseUrl: string,
  accountKey: string,
  kind: LegacyOverlaySocketKind,
): string {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const path = LEGACY_SOCKET_PATH[kind];
  const account = encodeURIComponent(accountKey);

  return `${normalizedBaseUrl}${path}?account=${account}`;
}
