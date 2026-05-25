export type OverlayWidgetType =
  | "ALERTS"
  | "TIP_ALERT"
  | "REWARD_ALERT"
  | "SUB_GOAL"
  | "FOLLOW_GOAL"
  | "QUEUE";

export type OverlayRoute =
  | {
      kind: "overlay";
      type: OverlayWidgetType;
      accountId: string;
      testMode: boolean;
    }
  | {
      kind: "home";
    }
  | {
      kind: "not_found";
      reason: "missing_uuid" | "invalid_uuid" | "unsupported_route";
    };

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const modernRouteTypes: Record<string, OverlayWidgetType> = {
  ALERTS: "ALERTS",
  TIP_ALERT: "TIP_ALERT",
  REWARD_ALERT: "REWARD_ALERT",
  SUB_GOAL: "SUB_GOAL",
  FOLLOW_GOAL: "FOLLOW_GOAL",
  QUEUE: "QUEUE",
};

function getPathname(input: string): string {
  const withoutQuery = input.split(/[?#]/, 1)[0] ?? "";
  const normalized = withoutQuery.replace(/\/+$/, "");

  return normalized.length > 0 ? normalized : "/";
}

function normalizePath(input: string): string[] {
  return getPathname(input).split("/").filter(Boolean);
}

function getTestMode(input: string): boolean {
  const queryIndex = input.indexOf("?");
  if (queryIndex === -1) return false;

  const hashIndex = input.indexOf("#", queryIndex);
  const query = input.slice(
    queryIndex + 1,
    hashIndex === -1 ? undefined : hashIndex,
  );

  return new URLSearchParams(query).get("test") === "true";
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
  const [root, accountId, ...extraSegments] = segments;

  if (!root) {
    return { kind: "home" };
  }

  const modernType = modernRouteTypes[root];

  if (modernType) {
    if (extraSegments.length > 0) {
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
      testMode: getTestMode(input),
    };
  }

  return { kind: "not_found", reason: "unsupported_route" };
}
