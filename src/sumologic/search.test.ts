import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SumoClient } from '@/sumologic/http.js';

vi.mock('@/config.js', () => ({
  loadConfig: vi.fn(() => ({
    endpoint: 'https://api.us2.sumologic.com/api/v1',
    sumoApiId: 'id',
    sumoApiKey: 'key',
    port: 3006,
    searchTimeZone: 'Asia/Hong_Kong',
    defaultLimit: 100,
  })),
}));

vi.mock('@/sumologic/searchJobs.js', () => ({
  runSearchJob: vi.fn(),
  getMessages: vi.fn(),
  getRecords: vi.fn(),
  deleteJob: vi.fn(),
}));

import { loadConfig } from '@/config.js';
import { searchAggregate, searchLogs } from '@/sumologic/search.js';
import {
  deleteJob,
  getMessages,
  getRecords,
  runSearchJob,
} from '@/sumologic/searchJobs.js';

function createClient() {
  return {} as SumoClient;
}

describe('search', () => {
  const client = createClient();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(runSearchJob).mockResolvedValue('job-1');
    vi.mocked(getMessages).mockResolvedValue({
      messages: [{ map: { _raw: 'email user@example.com' } }],
    });
    vi.mocked(getRecords).mockResolvedValue({
      records: [{ map: { _raw: 'phone 833-376-1995' } }],
    });
    vi.mocked(deleteJob).mockResolvedValue(undefined);
  });

  it('searchLogs masks messages and always deletes the job', async () => {
    const result = await searchLogs(client, 'error | count', {
      limit: 25,
    });

    expect(runSearchJob).toHaveBeenCalledWith(client, {
      query: 'error | count',
      from: expect.any(String),
      to: expect.any(String),
      timeZone: 'Asia/Hong_Kong',
    });
    expect(getMessages).toHaveBeenCalledWith(client, 'job-1', {
      limit: 25,
      offset: 0,
    });
    expect(deleteJob).toHaveBeenCalledWith(client, 'job-1');
    expect(result.messages[0]).toMatchObject({
      map: { _raw: 'email [EMAIL REDACTED]' },
    });
  });

  it('searchAggregate masks records and always deletes the job', async () => {
    const result = await searchAggregate(client, 'error | count by _source');

    expect(getRecords).toHaveBeenCalledWith(client, 'job-1', {
      limit: 100,
      offset: 0,
    });
    expect(deleteJob).toHaveBeenCalledWith(client, 'job-1');
    expect(result.records[0]).toMatchObject({
      map: { _raw: 'phone [PHONE REDACTED]' },
    });
  });

  it('prefers explicit limit over config defaultLimit', async () => {
    vi.mocked(loadConfig).mockReturnValue({
      endpoint: 'https://api.us2.sumologic.com/api/v1',
      sumoApiId: 'id',
      sumoApiKey: 'key',
      port: 3006,
      searchTimeZone: 'Asia/Hong_Kong',
      defaultLimit: 100,
    });

    await searchLogs(client, '*', { limit: 42 });

    expect(getMessages).toHaveBeenCalledWith(client, 'job-1', {
      limit: 42,
      offset: 0,
    });
  });

  it('rethrows search log errors after logging', async () => {
    const error = new Error('search failed');
    vi.mocked(runSearchJob).mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(searchLogs(client, '*')).rejects.toThrow('search failed');
    expect(errorSpy).toHaveBeenCalledWith('Sumo Logic search error:', error);
  });

  it('rethrows aggregate errors after logging', async () => {
    const error = new Error('aggregate failed');
    vi.mocked(runSearchJob).mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(searchAggregate(client, '*')).rejects.toThrow(
      'aggregate failed',
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'Sumo Logic aggregate search error:',
      error,
    );
  });
});
