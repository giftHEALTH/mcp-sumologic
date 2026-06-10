import type { SearchResultItem } from '@/sumologic/schemas.js';
import {
  addressPatterns,
  creditCardPatterns,
  emailPattern,
  isLikelyPhoneNumber,
  isPartOfUrl,
  phonePatterns,
  ssnPattern,
} from '@/pii/patterns.js';

export function maskSensitiveInfo(text: string): string {
  if (typeof text !== 'string') {
    return text;
  }

  let maskedText = text;

  maskedText = maskedText.replace(emailPattern, '[EMAIL REDACTED]');

  creditCardPatterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, '[CARD NUMBER REDACTED]');
  });

  phonePatterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, (match, _offset, string) => {
      if (isPartOfUrl(match, string)) {
        return match;
      }
      return isLikelyPhoneNumber(match) ? '[PHONE REDACTED]' : match;
    });
  });

  let previousMaskedText = '';
  while (previousMaskedText !== maskedText) {
    previousMaskedText = maskedText;
    phonePatterns.forEach((pattern) => {
      maskedText = maskedText.replace(pattern, (match, _offset, string) => {
        if (isPartOfUrl(match, string)) {
          return match;
        }
        return isLikelyPhoneNumber(match) ? '[PHONE REDACTED]' : match;
      });
    });
  }

  addressPatterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, '[ADDRESS REDACTED]');
  });

  maskedText = maskedText.replace(ssnPattern, '[SSN REDACTED]');

  return maskedText;
}

export function maskSearchResultItem(
  message: SearchResultItem,
): SearchResultItem {
  if (message.map && typeof message.map === 'object') {
    const plainMap: Record<string, string> = {};
    Object.keys(message.map).forEach((key) => {
      const rawValue = message.map?.[key]?.toString() ?? '';

      if (key === '_raw' || key === 'response') {
        plainMap[key] = maskSensitiveInfo(rawValue);
      } else {
        plainMap[key] = rawValue;
      }
    });

    const maskedRaw =
      typeof message._raw === 'string'
        ? maskSensitiveInfo(message._raw)
        : message._raw;

    return {
      ...message,
      map: plainMap,
      _raw: maskedRaw,
    };
  }

  const result = { ...message };

  if (typeof result._raw === 'string') {
    result._raw = maskSensitiveInfo(result._raw);
  }

  if (typeof result.response === 'string') {
    result.response = maskSensitiveInfo(result.response);
  }

  return result;
}

export function maskSearchResultItems(items: SearchResultItem[]): unknown[] {
  return items.map((item) => maskSearchResultItem(item));
}
