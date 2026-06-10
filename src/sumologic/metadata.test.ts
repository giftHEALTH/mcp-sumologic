import { describe, expect, it, vi } from 'vitest';
import type { SumoClient } from '@/sumologic/http.js';
import {
  getCollector,
  listCollectors,
  listFields,
  listPartitions,
  listScheduledViews,
  listSources,
} from '@/sumologic/metadata.js';

function createClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
  } as unknown as SumoClient;
}

describe('metadata', () => {
  it('listCollectors fetches collectors with pagination defaults', async () => {
    const client = createClient();

    await listCollectors(client);

    expect(client.get).toHaveBeenCalledWith('/api/v1/collectors', {
      limit: 100,
      offset: 0,
    });
  });

  it('getCollector fetches a collector by id', async () => {
    const client = createClient();

    await getCollector(client, 42);

    expect(client.get).toHaveBeenCalledWith('/api/v1/collectors/42');
  });

  it('listSources fetches sources for a collector', async () => {
    const client = createClient();

    await listSources(client, 42, { limit: 10, offset: 5 });

    expect(client.get).toHaveBeenCalledWith('/api/v1/collectors/42/sources', {
      limit: 10,
      offset: 5,
    });
  });

  it('listPartitions fetches partitions', async () => {
    const client = createClient();

    await listPartitions(client, { token: 'next' });

    expect(client.get).toHaveBeenCalledWith('/api/v1/partitions', {
      limit: 100,
      token: 'next',
    });
  });

  it('listFields fetches configured fields', async () => {
    const client = createClient();

    await listFields(client);

    expect(client.get).toHaveBeenCalledWith('/api/v1/fields');
  });

  it('listScheduledViews fetches scheduled views', async () => {
    const client = createClient();

    await listScheduledViews(client);

    expect(client.get).toHaveBeenCalledWith('/api/v1/scheduledViews');
  });
});
