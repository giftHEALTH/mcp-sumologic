import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defaultTimeRange,
  formatLocalIso,
  resolveTimeRange,
} from '@/sumologic/timeRange.js';

describe('timeRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T15:30:45'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats local ISO timestamps without timezone offset', () => {
    expect(formatLocalIso(new Date('2026-06-10T15:30:45'))).toBe(
      '2026-06-10T15:30:45',
    );
  });

  it('returns a 24 hour default time range', () => {
    const range = defaultTimeRange();

    expect(range.to).toBe('2026-06-10T15:30:45');
    expect(range.from).toBe('2026-06-09T15:30:45');
  });

  it('resolveTimeRange prefers explicit overrides', () => {
    const range = resolveTimeRange({
      from: '2026-06-01T00:00:00',
      to: '2026-06-02T00:00:00',
    });

    expect(range).toEqual({
      from: '2026-06-01T00:00:00',
      to: '2026-06-02T00:00:00',
    });
  });

  it('resolveTimeRange falls back to defaults for missing values', () => {
    const range = resolveTimeRange({ from: '2026-06-01T00:00:00' });

    expect(range.from).toBe('2026-06-01T00:00:00');
    expect(range.to).toBe('2026-06-10T15:30:45');
  });
});
