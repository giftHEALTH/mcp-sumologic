import * as Sumo from '@/lib/sumologic/client.js';

export async function listCollectors(
  client: Sumo.Client,
  options?: { limit?: number; offset?: number },
) {
  return client.get('/api/v1/collectors', {
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  });
}

export async function getCollector(client: Sumo.Client, collectorId: number) {
  return client.get(`/api/v1/collectors/${collectorId}`);
}

export async function listSources(
  client: Sumo.Client,
  collectorId: number,
  options?: { limit?: number; offset?: number },
) {
  return client.get(`/api/v1/collectors/${collectorId}/sources`, {
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  });
}

export async function listPartitions(
  client: Sumo.Client,
  options?: { limit?: number; token?: string },
) {
  return client.get('/api/v1/partitions', {
    limit: options?.limit ?? 100,
    token: options?.token,
  });
}

export async function listFields(client: Sumo.Client) {
  return client.get('/api/v1/fields');
}

export async function listScheduledViews(client: Sumo.Client) {
  return client.get('/api/v1/scheduledViews');
}
