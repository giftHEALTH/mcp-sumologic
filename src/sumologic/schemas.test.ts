import { describe, expect, it } from 'vitest';
import {
  jobResponseSchema,
  looseResponseSchema,
  messagesResponseSchema,
  parseLooseResponse,
  recordsResponseSchema,
  statusResponseSchema,
} from '@/sumologic/schemas.js';

describe('schemas', () => {
  it('parses job responses and keeps passthrough fields', () => {
    const parsed = jobResponseSchema.parse({
      id: 'job-1',
      status: 202,
      custom: 'value',
    });

    expect(parsed.id).toBe('job-1');
    expect(parsed.custom).toBe('value');
  });

  it('rejects invalid job responses', () => {
    expect(() => jobResponseSchema.parse({ status: 202 })).toThrow();
  });

  it('parses status responses', () => {
    const parsed = statusResponseSchema.parse({
      state: 'DONE GATHERING RESULTS',
      messageCount: 10,
      extraField: true,
    });

    expect(parsed.state).toBe('DONE GATHERING RESULTS');
    expect(parsed.extraField).toBe(true);
  });

  it('parses messages and records responses', () => {
    const messages = messagesResponseSchema.parse({
      messages: [{ map: { _raw: 'hello' }, traceId: 'abc' }],
    });
    const records = recordsResponseSchema.parse({
      records: [{ map: { count: '5' } }],
    });

    expect(messages.messages[0].traceId).toBe('abc');
    expect(records.records[0].map?.count).toBe('5');
  });

  it('parseLooseResponse accepts objects and arrays', () => {
    expect(parseLooseResponse({ collectors: [] })).toEqual({ collectors: [] });
    expect(parseLooseResponse([{ id: 1 }])).toEqual([{ id: 1 }]);
  });

  it('rejects invalid loose responses', () => {
    expect(() => looseResponseSchema.parse('invalid')).toThrow();
  });
});
