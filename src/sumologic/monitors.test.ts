import { describe, expect, it, vi } from 'vitest';
import type { SumoClient } from '@/sumologic/http.js';
import {
  getMonitor,
  listHealthEvents,
  searchMonitors,
} from '@/sumologic/monitors.js';

function createClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
  } as unknown as SumoClient;
}

describe('monitors', () => {
  it('searchMonitors searches monitors with defaults', async () => {
    const client = createClient();

    await searchMonitors(client);

    expect(client.get).toHaveBeenCalledWith('/api/v1/monitors/search', {
      query: undefined,
      limit: 100,
      offset: 0,
    });
  });

  it('getMonitor fetches a monitor by id', async () => {
    const client = createClient();

    await getMonitor(client, 'monitor-1');

    expect(client.get).toHaveBeenCalledWith('/api/v1/monitors/monitor-1');
  });

  it('listHealthEvents fetches health events', async () => {
    const client = createClient();

    await listHealthEvents(client, { limit: 25 });

    expect(client.get).toHaveBeenCalledWith('/api/v1/healthEvents', {
      limit: 25,
    });
  });
});
