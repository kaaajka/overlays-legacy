function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function buildChildOverlaySocketUrl(baseUrl: string, accountId: string, path: string): string {
  return `${normalizeBaseUrl(baseUrl)}/${path}?account=${encodeURIComponent(accountId)}`;
}

export function buildMainOverlaySocketUrl(baseUrl: string, accountId: string): string {
  return `${normalizeBaseUrl(baseUrl)}?account=${encodeURIComponent(accountId)}`;
}

export function buildSubsOverlaySocketUrl(baseUrl: string, accountId: string): string {
  return buildChildOverlaySocketUrl(baseUrl, accountId, "subs");
}

export function buildFollowersOverlaySocketUrl(baseUrl: string, accountId: string): string {
  return buildChildOverlaySocketUrl(baseUrl, accountId, "followers");
}

export function buildQueueOverlaySocketUrl(baseUrl: string, accountId: string): string {
  return buildChildOverlaySocketUrl(baseUrl, accountId, "queue");
}
