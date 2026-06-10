import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SumoClient,
  buildQueryString,
  createSumoClient,
  normalizeRoot,
  parseSetCookieHeader,
} from '@/sumologic/http.js';

function mockResponse(options: {
  status?: number;
  body?: string;
  setCookie?: string[];
}): Response {
  const headers = new Headers();
  for (const cookie of options.setCookie ?? []) {
    headers.append('Set-Cookie', cookie);
  }

  return new Response(options.body ?? '', {
    status: options.status ?? 200,
    headers,
  });
}

describe('normalizeRoot', () => {
  it('strips trailing slash and api version suffix', () => {
    expect(normalizeRoot('https://api.us2.sumologic.com/api/v1/')).toBe(
      'https://api.us2.sumologic.com',
    );
  });

  it('leaves root unchanged when no api suffix', () => {
    expect(normalizeRoot('https://api.us2.sumologic.com')).toBe(
      'https://api.us2.sumologic.com',
    );
  });
});

describe('buildQueryString', () => {
  it('serializes defined query params', () => {
    expect(buildQueryString({ limit: 10, offset: 0, token: undefined })).toBe(
      '?limit=10&offset=0',
    );
  });

  it('returns empty string when query is empty', () => {
    expect(buildQueryString()).toBe('');
  });
});

describe('parseSetCookieHeader', () => {
  it('extracts cookie name and value', () => {
    expect(parseSetCookieHeader('AWSALB=abc123; Path=/; HttpOnly')).toEqual({
      name: 'AWSALB',
      value: 'abc123',
    });
  });

  it('returns null for invalid cookie header', () => {
    expect(parseSetCookieHeader('invalid')).toBeNull();
  });
});

describe('SumoClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createClient() {
    return createSumoClient({
      endpoint: 'https://api.us2.sumologic.com/api/v1',
      sumoApiId: 'access-id',
      sumoApiKey: 'access-key',
    });
  }

  it('throws when credentials are missing', async () => {
    const client = createSumoClient({
      endpoint: 'https://api.us2.sumologic.com/api/v1',
      sumoApiId: '',
      sumoApiKey: '',
    });

    await expect(client.get('/api/v1/fields')).rejects.toThrow(
      'Sumo Logic credentials are not configured',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends basic auth and accept headers on GET', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: '{"ok":true}' }));

    const client = createClient();
    await client.get('/api/v1/fields');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.us2.sumologic.com/api/v1/fields');
    expect(init.method).toBe('GET');
    expect(init.headers).toMatchObject({
      Authorization: `Basic ${Buffer.from('access-id:access-key').toString('base64')}`,
      Accept: 'application/json',
    });
    expect(init.headers).not.toHaveProperty('Content-Type');
  });

  it('serializes query params on GET', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: '{}' }));

    const client = createClient();
    await client.get('/api/v1/collectors', { limit: 10, offset: 0 });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'https://api.us2.sumologic.com/api/v1/collectors?limit=10&offset=0',
    );
  });

  it('sends JSON body and content-type on POST', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: '{"id":"job-1"}' }));

    const client = createClient();
    await client.post('/api/v1/search/jobs', {
      query: '*',
      from: 'a',
      to: 'b',
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      'Content-Type': 'application/json',
    });
    expect(init.body).toBe(JSON.stringify({ query: '*', from: 'a', to: 'b' }));
  });

  it('captures cookies and sends them on subsequent requests', async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockResponse({
          body: '{"id":"job-1"}',
          setCookie: ['AWSALB=abc123; Path=/; HttpOnly'],
        }),
      )
      .mockResolvedValueOnce(mockResponse({ body: '{"state":"DONE"}' }));

    const client = createClient();
    await client.post('/api/v1/search/jobs', { query: '*' });
    await client.get('/api/v1/search/jobs/job-1');

    expect(client.cookieCount).toBe(1);
    expect(client.getCookie('AWSALB')).toBe('abc123');

    const [, secondInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(secondInit.headers).toMatchObject({
      Cookie: 'AWSALB=abc123',
    });
  });

  it('throws with status and body on non-2xx responses', async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ status: 401, body: 'Unauthorized' }),
    );

    const client = createClient();
    await expect(client.get('/api/v1/fields')).rejects.toThrow(
      '401 - Unauthorized',
    );
  });

  it('returns undefined for empty response bodies', async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: '' }));

    const client = createClient();
    await expect(
      client.delete('/api/v1/search/jobs/job-1'),
    ).resolves.toBeUndefined();
  });

  it('normalizes endpoint root on construction', () => {
    const client = new SumoClient({
      endpoint: 'https://api.us2.sumologic.com/api/v1/',
      sumoApiId: 'id',
      sumoApiKey: 'key',
    });

    expect(client.root).toBe('https://api.us2.sumologic.com');
  });
});
