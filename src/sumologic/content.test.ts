import { describe, expect, it, vi } from 'vitest';
import type { SumoClient } from '@/sumologic/http.js';
import {
  getContentByPath,
  getFolder,
  getPersonalFolder,
} from '@/sumologic/content.js';

function createClient() {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
  } as unknown as SumoClient;
}

describe('content', () => {
  it('getContentByPath fetches content by path', async () => {
    const client = createClient();

    await getContentByPath(client, '/Library/Admin/SavedSearches');

    expect(client.get).toHaveBeenCalledWith('/api/v2/content/path', {
      path: '/Library/Admin/SavedSearches',
    });
  });

  it('getPersonalFolder fetches the personal folder', async () => {
    const client = createClient();

    await getPersonalFolder(client);

    expect(client.get).toHaveBeenCalledWith('/api/v2/content/folders/personal');
  });

  it('getFolder fetches a folder by id', async () => {
    const client = createClient();

    await getFolder(client, 'folder-1');

    expect(client.get).toHaveBeenCalledWith('/api/v2/content/folders/folder-1');
  });
});
