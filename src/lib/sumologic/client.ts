import queryString from 'query-string';
import * as types from '@/lib/sumologic/types.js';

const defaultPaginationOptions: types.IPaginationOptions = {
  limit: 40,
  offset: 0,
};

export function normalizeRoot(endpoint: string): string {
  const trimmed = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  return trimmed.replace(/\/api\/v\d+$/, '');
}

export class Client {
  private params: types.IClientOptions;
  readonly root: string;
  private cookies = new Map<string, string>();

  constructor(params: types.IClientOptions) {
    this.params = params;
    this.root = normalizeRoot(params.endpoint);
  }

  public get<T = unknown>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const queryStringValue =
      query && Object.keys(query).length > 0
        ? `?${queryString.stringify(query, { skipNull: true, skipEmptyString: true })}`
        : '';

    return this.request<T>('GET', `${normalizedPath}${queryStringValue}`);
  }

  public post<T = unknown>(path: string, body?: unknown): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return this.request<T>('POST', normalizedPath, body);
  }

  public deleteRequest(path: string): Promise<void> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return this.request<void>('DELETE', normalizedPath);
  }

  public job(params: types.IJobOptions): Promise<types.IJob> {
    return this.post('/api/v1/search/jobs', params);
  }

  public status(id: string): Promise<types.IStatus> {
    return this.get(`/api/v1/search/jobs/${id}`);
  }

  public messages(
    id: string,
    params: Partial<types.IPaginationOptions> = defaultPaginationOptions,
  ): Promise<types.IMessages> {
    const query = this.paginationQuery({
      ...defaultPaginationOptions,
      ...params,
    });

    return this.get(`/api/v1/search/jobs/${id}/messages?${query}`);
  }

  public records(
    id: string,
    params: Partial<types.IPaginationOptions> = defaultPaginationOptions,
  ): Promise<types.IRecords> {
    const query = this.paginationQuery({
      ...defaultPaginationOptions,
      ...params,
    });

    return this.get(`/api/v1/search/jobs/${id}/records?${query}`);
  }

  public delete(id: string): Promise<void> {
    return this.deleteRequest(`/api/v1/search/jobs/${id}`);
  }

  private paginationQuery(params: types.IPaginationOptions): string {
    return queryString.stringify(params);
  }

  private authHeader(): string {
    const credentials = `${this.params.sumoApiId}:${this.params.sumoApiKey}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  private cookieHeader(): string | undefined {
    if (this.cookies.size === 0) {
      return undefined;
    }

    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  private captureCookies(response: Response): void {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const name = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();
      if (name) {
        this.cookies.set(name, value);
      }
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.root}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      Authorization: this.authHeader(),
      Accept: 'application/json',
    };

    const cookie = this.cookieHeader();
    if (cookie) {
      headers.Cookie = cookie;
    }

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    this.captureCookies(response);

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`${response.status} - ${text}`);
    }

    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }
}

const client = (params: types.IClientOptions): Client => new Client(params);

export { client };
export * from './types.js';
