import {
  buildQueryString,
  normalizeRoot,
  parseSetCookieHeader,
} from '@/sumologic/http.js';
import { defaultTimeRange, formatLocalIso } from '@/sumologic/timeRange.js';
import { describe, expect, it, jest } from '@jest/globals';
import { maskSensitiveInfo } from '@/pii/index.js';

describe('normalizeRoot', () => {
  it('strips trailing slash and api version suffix', () => {
    expect(normalizeRoot('https://api.us2.sumologic.com/api/v1/')).toBe(
      'https://api.us2.sumologic.com',
    );
  });

  it('leaves root unchanged when no api suffix', () => {
    expect(normalizeRoot('https://api.us2.sumologic.com')).toBe(
      'https://api.us2.sumologic.com',
    );
  });
});

describe('buildQueryString', () => {
  it('serializes defined query params', () => {
    expect(buildQueryString({ limit: 10, offset: 0, token: undefined })).toBe(
      '?limit=10&offset=0',
    );
  });

  it('returns empty string when query is empty', () => {
    expect(buildQueryString()).toBe('');
  });
});

describe('parseSetCookieHeader', () => {
  it('extracts cookie name and value', () => {
    expect(parseSetCookieHeader('AWSALB=abc123; Path=/; HttpOnly')).toEqual({
      name: 'AWSALB',
      value: 'abc123',
    });
  });

  it('returns null for invalid cookie header', () => {
    expect(parseSetCookieHeader('invalid')).toBeNull();
  });
});

describe('defaultTimeRange', () => {
  it('returns local ISO timestamps 24 hours apart', () => {
    const fixedNow = new Date('2026-06-10T15:30:45');
    jest.useFakeTimers();
    jest.setSystemTime(fixedNow);

    const range = defaultTimeRange();
    expect(range.to).toBe(formatLocalIso(fixedNow));
    expect(range.from).toBe(
      formatLocalIso(new Date(fixedNow.getTime() - 24 * 60 * 60 * 1000)),
    );

    jest.useRealTimers();
  });
});

describe('maskSensitiveInfo', () => {
  it('redacts email addresses', () => {
    expect(maskSensitiveInfo('contact user@example.com today')).toBe(
      'contact [EMAIL REDACTED] today',
    );
  });

  it('redacts phone numbers', () => {
    expect(maskSensitiveInfo('call 833-376-1995 now')).toBe(
      'call [PHONE REDACTED] now',
    );
  });
});
