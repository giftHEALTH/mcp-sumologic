import * as Sumo from '@/lib/sumologic/client.js';

export async function getContentByPath(client: Sumo.Client, path: string) {
  return client.get('/api/v2/content/path', { path });
}

export async function getPersonalFolder(client: Sumo.Client) {
  return client.get('/api/v2/content/folders/personal');
}

export async function getFolder(client: Sumo.Client, folderId: string) {
  return client.get(`/api/v2/content/folders/${folderId}`);
}
