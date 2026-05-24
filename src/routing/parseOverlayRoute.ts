export type OverlayWidgetType = "ALERTS" | "TIP_ALERT" | "REWARD_ALERT" | "SUB_GOAL" | "FOLLOW_GOAL" | "QUEUE";

export type OverlayRoute =
  | {
      kind: "overlay";
      type: OverlayWidgetType;
      accountId: string;
      legacy: boolean;
    }
  | {
      kind: "not_found";
      reason: "missing_uuid" | "invalid_uuid" | "unsupported_route";
    };

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const modernRouteTypes: Record<string, OverlayWidgetType> = {
  ALERTS: "ALERTS",
  TIP_ALERT: "TIP_ALERT",
  REWARD_ALERT: "REWARD_ALERT",
  SUB_GOAL: "SUB_GOAL",
  FOLLOW_GOAL: "FOLLOW_GOAL",
  QUEUE: "QUEUE",
};

const legacyRouteTypes: Record<string, OverlayWidgetType> = {
  subs: "SUB_GOAL",
  followers: "FOLLOW_GOAL",
  queue: "QUEUE",
};

function normalizePath(input: string): string[] {
  const withoutQuery = input.split(/[?#]/, 1)[0] ?? "";
  const normalized = withoutQuery.replace(/\/+$/, "");
  const path = normalized.length > 0 ? normalized : "/";

  return path.split("/").filter(Boolean);
}

function validateUuid(accountId: string | undefined): OverlayRoute | null {
  if (!accountId) {
    return { kind: "not_found", reason: "missing_uuid" };
  }

  if (!uuidRegex.test(accountId)) {
    return { kind: "not_found", reason: "invalid_uuid" };
  }

  return null;
}

export function parseOverlayRoute(input: string): OverlayRoute {
  const segments = normalizePath(input);
  const [root, accountId, legacyWidgetSegment, ...extraSegments] = segments;

  if (!root) {
    return { kind: "not_found", reason: "unsupported_route" };
  }

  const modernType = modernRouteTypes[root];

  if (modernType) {
    if (legacyWidgetSegment || extraSegments.length > 0) {
      return { kind: "not_found", reason: "unsupported_route" };
    }

    const uuidError = validateUuid(accountId);

    if (uuidError) {
      return uuidError;
    }

    return {
      kind: "overlay",
      type: modernType,
      accountId,
      legacy: false,
    };
  }

  if (root === "channel") {
    if (extraSegments.length > 0) {
      return { kind: "not_found", reason: "unsupported_route" };
    }

    const uuidError = validateUuid(accountId);

    if (uuidError) {
      return uuidError;
    }

    if (!legacyWidgetSegment) {
      return {
        kind: "overlay",
        type: "TIP_ALERT",
        accountId,
        legacy: true,
      };
    }

    const type = legacyRouteTypes[legacyWidgetSegment];

    if (!type) {
      return { kind: "not_found", reason: "unsupported_route" };
    }

    return {
      kind: "overlay",
      type,
      accountId,
      legacy: true,
    };
  }

  return { kind: "not_found", reason: "unsupported_route" };
}
