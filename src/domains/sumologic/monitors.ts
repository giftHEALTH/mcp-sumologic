import * as Sumo from '@/lib/sumologic/client.js';

export async function searchMonitors(
  client: Sumo.Client,
  options?: { query?: string; limit?: number; offset?: number },
) {
  return client.get('/api/v1/monitors/search', {
    query: options?.query,
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  });
}

export async function getMonitor(client: Sumo.Client, monitorId: string) {
  return client.get(`/api/v1/monitors/${monitorId}`);
}

export async function listHealthEvents(
  client: Sumo.Client,
  options?: { limit?: number },
) {
  return client.get('/api/v1/healthEvents', {
    limit: options?.limit ?? 100,
  });
}
