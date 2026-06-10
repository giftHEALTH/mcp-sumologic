import type { SumoClient } from '@/sumologic/http.js';
import { parseLooseResponse } from '@/sumologic/schemas.js';

export async function getContentByPath(client: SumoClient, path: string) {
  const raw = await client.get('/api/v2/content/path', { path });
  return parseLooseResponse(raw);
}

export async function getPersonalFolder(client: SumoClient) {
  const raw = await client.get('/api/v2/content/folders/personal');
  return parseLooseResponse(raw);
}

export async function getFolder(client: SumoClient, folderId: string) {
  const raw = await client.get(`/api/v2/content/folders/${folderId}`);
  return parseLooseResponse(raw);
}
