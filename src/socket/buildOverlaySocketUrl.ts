function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function buildQuery(accountId: string, testMode = false): string {
  const query = `account=${encodeURIComponent(accountId)}`;

  return testMode ? `${query}&test=true` : query;
}

function buildChildOverlaySocketUrl(
  baseUrl: string,
  accountId: string,
  path: string,
  testMode = false,
): string {
  return `${normalizeBaseUrl(baseUrl)}/${path}?${buildQuery(accountId, testMode)}`;
}

export function buildMainOverlaySocketUrl(
  baseUrl: string,
  accountId: string,
  testMode = false,
): string {
  return `${normalizeBaseUrl(baseUrl)}?${buildQuery(accountId, testMode)}`;
}

export function buildSubsOverlaySocketUrl(
  baseUrl: string,
  accountId: string,
  testMode = false,
): string {
  return buildChildOverlaySocketUrl(baseUrl, accountId, "subs", testMode);
}

export function buildFollowersOverlaySocketUrl(
  baseUrl: string,
  accountId: string,
  testMode = false,
): string {
  return buildChildOverlaySocketUrl(baseUrl, accountId, "followers", testMode);
}

export function buildQueueOverlaySocketUrl(
  baseUrl: string,
  accountId: string,
  testMode = false,
): string {
  return buildChildOverlaySocketUrl(baseUrl, accountId, "queue", testMode);
}
