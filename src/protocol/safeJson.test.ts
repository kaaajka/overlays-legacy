import { describe, expect, it } from 'vitest';

import { safeJsonParse } from './safeJson';

describe('safeJsonParse', () => {
  it('returns a parsed object for valid JSON', () => {
    expect(safeJsonParse('{"event":"queue","key":"set"}')).toEqual({
      event: 'queue',
      key: 'set',
    });
  });

  it('returns null for invalid JSON', () => {
    expect(safeJsonParse('{"event":')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(safeJsonParse('')).toBeNull();
  });
});
