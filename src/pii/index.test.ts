import { describe, expect, it } from 'vitest';
import {
  maskSearchResultItem,
  maskSearchResultItems,
  maskSensitiveInfo,
} from '@/pii/index.js';

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

  it('redacts credit card numbers', () => {
    expect(maskSensitiveInfo('card 4111111111111111')).toBe(
      'card [CARD NUMBER REDACTED]',
    );
  });

  it('redacts SSN-like dashed patterns via phone rules', () => {
    expect(maskSensitiveInfo('ssn 123-45-6789')).toBe('ssn [PHONE REDACTED]');
  });

  it('redacts street addresses', () => {
    expect(maskSensitiveInfo('live at 123 Main Street')).toBe(
      'live at [ADDRESS REDACTED]',
    );
  });

  it('skips phone-like strings inside URLs', () => {
    expect(
      maskSensitiveInfo('see https://example.com/833-376-1995 for details'),
    ).toBe('see https://example.com/833-376-1995 for details');
  });
});

describe('maskSearchResultItem', () => {
  it('masks _raw and response fields in map entries', () => {
    const masked = maskSearchResultItem({
      map: {
        _raw: 'email user@example.com',
        response: 'phone 833-376-1995',
        host: 'app-1',
      },
    });

    expect(masked.map).toEqual({
      _raw: 'email [EMAIL REDACTED]',
      response: 'phone [PHONE REDACTED]',
      host: 'app-1',
    });
  });

  it('masks top-level _raw and response fields', () => {
    const masked = maskSearchResultItem({
      _raw: 'email user@example.com',
      response: 'phone 833-376-1995',
    });

    expect(masked._raw).toBe('email [EMAIL REDACTED]');
    expect(masked.response).toBe('phone [PHONE REDACTED]');
  });
});

describe('maskSearchResultItems', () => {
  it('masks every item in the array', () => {
    const masked = maskSearchResultItems([
      { map: { _raw: 'email user@example.com' } },
      { _raw: 'phone 833-376-1995' },
    ]);

    expect(masked).toHaveLength(2);
    expect(masked[0]).toMatchObject({
      map: { _raw: 'email [EMAIL REDACTED]' },
    });
    expect(masked[1]).toMatchObject({
      _raw: 'phone [PHONE REDACTED]',
    });
  });
});
