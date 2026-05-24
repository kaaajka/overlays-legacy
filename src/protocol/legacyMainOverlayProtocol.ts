export type LegacyMainEventName = "prepare" | "started" | "update" | "finished" | "alertList" | "test";

export type LegacyOverlayEventOrigin = "reward" | "manual";

export type LegacyMainEventKey =
  | "donate"
  | "censure"
  | "mute"
  | "withoutR"
  | "dogs"
  | "roulette"
  | "coinflip"
  | "playSound";

export type LegacyMainMessage = {
  event: string;
  id?: string;
  key?: string;
  origin?: LegacyOverlayEventOrigin;
  args?: unknown;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function hasStringKey(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "string";
}

export function getLegacyMainArgs(value: LegacyMainMessage): Record<string, unknown> | undefined {
  return isRecord(value.args) ? value.args : undefined;
}

export function isLegacyOverlayEventOrigin(value: unknown): value is LegacyOverlayEventOrigin {
  return value === "reward" || value === "manual";
}

export function isLegacyMainMessage(value: unknown): value is LegacyMainMessage {
  if (!isRecord(value)) return false;
  if (!hasStringKey(value, "event") || !hasStringKey(value, "key") || !hasStringKey(value, "id")) {
    return false;
  }

  if ("origin" in value && !isLegacyOverlayEventOrigin(value.origin)) {
    return false;
  }

  if ((value.event === "prepare" || value.event === "t_prepare") && value.key === "donate") {
    return isRecord(value.args);
  }

  return true;
}
