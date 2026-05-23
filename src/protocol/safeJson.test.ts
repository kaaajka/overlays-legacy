import { beforeEach, describe, expect, it, vi } from 'vitest';

import { debugLog } from '../debug';
import { safeJsonParse } from './safeJson';

vi.mock('../debug', () => ({
  debugLog: vi.fn(),
}));

const mockedDebugLog = vi.mocked(debugLog);

beforeEach(() => {
  mockedDebugLog.mockClear();
});

describe('safeJsonParse', () => {
  it('returns a parsed object for valid JSON', () => {
    expect(safeJsonParse('{"event":"queue","key":"set"}')).toEqual({
      event: 'queue',
      key: 'set',
    });
  });

  it('returns null for invalid JSON', () => {
    expect(safeJsonParse('{"event":')).toBeNull();
    expect(mockedDebugLog).toHaveBeenCalledWith(
      'Ignored invalid legacy websocket JSON payload',
      expect.any(SyntaxError),
    );
  });

  it('returns null for an empty string', () => {
    expect(safeJsonParse('')).toBeNull();
    expect(mockedDebugLog).toHaveBeenCalledWith(
      'Ignored invalid legacy websocket JSON payload',
      expect.any(SyntaxError),
    );
  });
});
