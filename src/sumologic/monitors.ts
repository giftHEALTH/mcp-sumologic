import type { SumoClient } from '@/sumologic/http.js';
import { parseLooseResponse } from '@/sumologic/schemas.js';

export async function searchMonitors(
  client: SumoClient,
  options?: { query?: string; limit?: number; offset?: number },
) {
  const raw = await client.get('/api/v1/monitors/search', {
    query: options?.query,
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  });
  return parseLooseResponse(raw);
}

export async function getMonitor(client: SumoClient, monitorId: string) {
  const raw = await client.get(`/api/v1/monitors/${monitorId}`);
  return parseLooseResponse(raw);
}

export async function listHealthEvents(
  client: SumoClient,
  options?: { limit?: number },
) {
  const raw = await client.get('/api/v1/healthEvents', {
    limit: options?.limit ?? 100,
  });
  return parseLooseResponse(raw);
}
