import {
  buildFollowersOverlaySocketUrl,
  buildMainOverlaySocketUrl,
  buildQueueOverlaySocketUrl,
  buildSubsOverlaySocketUrl,
} from "../socket/buildOverlaySocketUrl";

export type LegacyOverlaySocketKind = "main" | "subs" | "followers" | "queue";

export function buildLegacyWsUrl(
  baseUrl: string,
  accountKey: string,
  kind: LegacyOverlaySocketKind,
): string {
  switch (kind) {
    case "main":
      return buildMainOverlaySocketUrl(baseUrl, accountKey);
    case "subs":
      return buildSubsOverlaySocketUrl(baseUrl, accountKey);
    case "followers":
      return buildFollowersOverlaySocketUrl(baseUrl, accountKey);
    case "queue":
      return buildQueueOverlaySocketUrl(baseUrl, accountKey);
  }
}
