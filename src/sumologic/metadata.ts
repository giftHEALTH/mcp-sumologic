import type { SumoClient } from '@/sumologic/http.js';
import { parseLooseResponse } from '@/sumologic/schemas.js';

export async function listCollectors(
  client: SumoClient,
  options?: { limit?: number; offset?: number },
) {
  const raw = await client.get('/api/v1/collectors', {
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  });
  return parseLooseResponse(raw);
}

export async function getCollector(client: SumoClient, collectorId: number) {
  const raw = await client.get(`/api/v1/collectors/${collectorId}`);
  return parseLooseResponse(raw);
}

export async function listSources(
  client: SumoClient,
  collectorId: number,
  options?: { limit?: number; offset?: number },
) {
  const raw = await client.get(`/api/v1/collectors/${collectorId}/sources`, {
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  });
  return parseLooseResponse(raw);
}

export async function listPartitions(
  client: SumoClient,
  options?: { limit?: number; token?: string },
) {
  const raw = await client.get('/api/v1/partitions', {
    limit: options?.limit ?? 100,
    token: options?.token,
  });
  return parseLooseResponse(raw);
}

export async function listFields(client: SumoClient) {
  const raw = await client.get('/api/v1/fields');
  return parseLooseResponse(raw);
}

export async function listScheduledViews(client: SumoClient) {
  const raw = await client.get('/api/v1/scheduledViews');
  return parseLooseResponse(raw);
}
