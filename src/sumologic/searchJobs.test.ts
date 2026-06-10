import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SumoClient } from '@/sumologic/http.js';
import {
  createJob,
  deleteJob,
  getMessages,
  getRecords,
  getStatus,
  runSearchJob,
  waitForSearchJob,
} from '@/sumologic/searchJobs.js';

function createMockClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  } as unknown as SumoClient;
}

describe('searchJobs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('createJob posts to search jobs endpoint and parses response', async () => {
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValue({ id: 'job-123', extra: true });

    const result = await createJob(client, {
      query: '*',
      from: '2026-06-09T00:00:00',
      to: '2026-06-10T00:00:00',
      timeZone: 'Asia/Hong_Kong',
    });

    expect(client.post).toHaveBeenCalledWith('/api/v1/search/jobs', {
      query: '*',
      from: '2026-06-09T00:00:00',
      to: '2026-06-10T00:00:00',
      timeZone: 'Asia/Hong_Kong',
    });
    expect(result.id).toBe('job-123');
    expect(result.extra).toBe(true);
  });

  it('getStatus fetches job status by id', async () => {
    const client = createMockClient();
    vi.mocked(client.get).mockResolvedValue({
      state: 'GATHERING RESULTS',
      messageCount: 0,
    });

    const status = await getStatus(client, 'job-123');

    expect(client.get).toHaveBeenCalledWith('/api/v1/search/jobs/job-123');
    expect(status.state).toBe('GATHERING RESULTS');
  });

  it('getMessages passes pagination query params', async () => {
    const client = createMockClient();
    vi.mocked(client.get).mockResolvedValue({ messages: [] });

    await getMessages(client, 'job-123', { limit: 50, offset: 10 });

    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/search/jobs/job-123/messages',
      { limit: 50, offset: 10 },
    );
  });

  it('getRecords passes pagination query params', async () => {
    const client = createMockClient();
    vi.mocked(client.get).mockResolvedValue({ records: [] });

    await getRecords(client, 'job-123', { limit: 25, offset: 5 });

    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/search/jobs/job-123/records',
      { limit: 25, offset: 5 },
    );
  });

  it('deleteJob deletes job by id', async () => {
    const client = createMockClient();
    vi.mocked(client.delete).mockResolvedValue(undefined);

    await deleteJob(client, 'job-123');

    expect(client.delete).toHaveBeenCalledWith('/api/v1/search/jobs/job-123');
  });

  it('waitForSearchJob polls until done', async () => {
    const client = createMockClient();
    vi.mocked(client.get)
      .mockResolvedValueOnce({ state: 'GATHERING RESULTS' })
      .mockResolvedValueOnce({
        state: 'DONE GATHERING RESULTS',
        messageCount: 3,
      });

    const statusPromise = waitForSearchJob(client, 'job-123');
    await vi.advanceTimersByTimeAsync(1000);
    const status = await statusPromise;

    expect(client.get).toHaveBeenCalledTimes(2);
    expect(status.state).toBe('DONE GATHERING RESULTS');
    expect(status.messageCount).toBe(3);
  });

  it('runSearchJob creates job, waits, and returns id', async () => {
    const client = createMockClient();
    vi.mocked(client.post).mockResolvedValue({ id: 'job-456' });
    vi.mocked(client.get).mockResolvedValue({
      state: 'DONE GATHERING RESULTS',
    });

    const jobId = await runSearchJob(client, {
      query: '*',
      from: '2026-06-09T00:00:00',
      to: '2026-06-10T00:00:00',
      timeZone: 'Asia/Hong_Kong',
    });

    expect(jobId).toBe('job-456');
    expect(client.post).toHaveBeenCalledOnce();
    expect(client.get).toHaveBeenCalledOnce();
  });
});
