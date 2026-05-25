export type MainOverlayAlertListTransition = {
  queue: string[];
  shouldSubmitFirstAlert: boolean;
};

export function resolveMainOverlayAlertListTransition(
  currentQueue: readonly string[],
  key: string | undefined,
  args: Record<string, unknown>,
): MainOverlayAlertListTransition {
  if (key === "set") {
    if (!Array.isArray(args.list)) {
      return { queue: [...currentQueue], shouldSubmitFirstAlert: false };
    }

    return {
      queue: args.list.filter((item): item is string => typeof item === "string"),
      shouldSubmitFirstAlert: true,
    };
  }

  if (key === "add") {
    if (typeof args.id !== "string" || currentQueue.includes(args.id)) {
      return { queue: [...currentQueue], shouldSubmitFirstAlert: false };
    }

    return {
      queue: [...currentQueue, args.id],
      shouldSubmitFirstAlert: true,
    };
  }

  if (key === "delete") {
    if (typeof args.id !== "string") {
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
