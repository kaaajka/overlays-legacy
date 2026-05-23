export type LegacyRecord = Record<string, unknown>;

export interface LegacyBaseMessage {
  event: string;
  key: string;
  id: string;
  args?: unknown;
}

export interface LegacyQueueItem {
  id: string;
  name: string;
  username: string;
}

export interface LegacyQueueSetMessage extends LegacyBaseMessage {
  event: 'queue';
  key: 'set';
  args: {
    list: LegacyQueueItem[];
  };
}

export interface LegacyQueueAddMessage extends LegacyBaseMessage {
  event: 'queue';
  key: 'add';
  args: LegacyQueueItem;
}

export interface LegacyQueueDeleteMessage extends LegacyBaseMessage {
  event: 'queue';
  key: 'delete';
  args: {
    id: string;
  };
}

export type LegacyQueueMessage =
  | LegacyQueueSetMessage
  | LegacyQueueAddMessage
  | LegacyQueueDeleteMessage;

export interface LegacyGoalMessage {
  type: 'set' | 'update';
  args: {
    current?: number;
    goal?: number;
  };
}

export interface LegacyMainMessage extends LegacyBaseMessage {
  args?: LegacyRecord;
}

export function isObject(value: unknown): value is LegacyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasString(value: LegacyRecord, key: string): boolean {
  return typeof value[key] === 'string';
}

export function getRecord(value: unknown): LegacyRecord | undefined {
  return isObject(value) ? value : undefined;
}

export function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function isLegacyMainMessage(value: unknown): value is LegacyMainMessage {
  if (!isObject(value)) return false;
  if (!hasString(value, 'event') || !hasString(value, 'key') || !hasString(value, 'id')) {
    return false;
  }

  if ((value.event === 'prepare' || value.event === 't_prepare') && value.key === 'donate') {
    return isObject(value.args);
  }

  return true;
}

export function isLegacyGoalMessage(value: unknown): value is LegacyGoalMessage {
  if (!isObject(value)) return false;
  if (value.type !== 'set' && value.type !== 'update') return false;

  const args = getRecord(value.args);
  if (!args) return false;

  const current = args.current;
  const goal = args.goal;

  return (
    (typeof current === 'undefined' || getNumber(current) !== undefined) &&
    (typeof goal === 'undefined' || getNumber(goal) !== undefined)
  );
}

export function isLegacyQueueItem(value: unknown): value is LegacyQueueItem {
  if (!isObject(value)) return false;

  return hasString(value, 'id') && hasString(value, 'name') && hasString(value, 'username');
}

export function isLegacyQueueMessage(value: unknown): value is LegacyQueueMessage {
  if (!isLegacyMainMessage(value)) return false;
  if (value.event !== 'queue') return false;

  const args = getRecord(value.args);
  if (!args) return false;

  if (value.key === 'set') {
    return Array.isArray(args.list) && args.list.every(isLegacyQueueItem);
  }

  if (value.key === 'add') {
    return isLegacyQueueItem(args);
  }

  if (value.key === 'delete') {
    return hasString(args, 'id');
  }

  return false;
}
