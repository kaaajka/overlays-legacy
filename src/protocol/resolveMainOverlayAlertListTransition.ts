export type OverlayAlertId = string | number;

export type MainOverlayAlertListTransition = {
  queue: OverlayAlertId[];
  shouldSubmitFirstAlert: boolean;
};

function isAlertId(id: unknown): id is OverlayAlertId {
  return (
    (typeof id === "string" && id.length > 0) ||
    (typeof id === "number" && Number.isSafeInteger(id) && id >= 0)
  );
}

export function resolveMainOverlayAlertListTransition(
  currentQueue: readonly OverlayAlertId[],
  key: string | undefined,
  args: Record<string, unknown>,
): MainOverlayAlertListTransition {
  if (key === "set") {
    if (!Array.isArray(args.list)) {
      return { queue: [...currentQueue], shouldSubmitFirstAlert: false };
    }

    return {
      queue: args.list.filter(isAlertId),
      shouldSubmitFirstAlert: true,
    };
  }

  if (key === "add") {
    if (!isAlertId(args.id) || currentQueue.includes(args.id)) {
      return { queue: [...currentQueue], shouldSubmitFirstAlert: false };
    }

    return {
      queue: [...currentQueue, args.id],
      shouldSubmitFirstAlert: true,
    };
  }

  if (key === "delete") {
    if (!isAlertId(args.id)) {
      return { queue: [...currentQueue], shouldSubmitFirstAlert: false };
    }

    const nextQueue = [...currentQueue];
    const index = nextQueue.indexOf(args.id);

    if (index > -1) nextQueue.splice(index, 1);

    return {
      queue: nextQueue,
      shouldSubmitFirstAlert: false,
    };
  }

  return { queue: [...currentQueue], shouldSubmitFirstAlert: false };
}
