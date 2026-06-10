export interface SumoClientOptions {
  endpoint: string;
  sumoApiId: string;
  sumoApiKey: string;
}

export function normalizeRoot(endpoint: string): string {
  const trimmed = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  return trimmed.replace(/\/api\/v\d+$/, '');
}

export function buildQueryString(
  query?: Record<string, string | number | undefined>,
): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function parseSetCookieHeader(
  cookie: string,
): { name: string; value: string } | null {
  const [pair] = cookie.split(';');
  const separatorIndex = pair.indexOf('=');
  if (separatorIndex === -1) {
    return null;
  }

  const name = pair.slice(0, separatorIndex).trim();
  const value = pair.slice(separatorIndex + 1).trim();
  if (!name) {
    return null;
  }

  return { name, value };
}

export class SumoClient {
  private readonly sumoApiId: string;
  private readonly sumoApiKey: string;
  readonly root: string;
  private cookies = new Map<string, string>();

  constructor(options: SumoClientOptions) {
    this.sumoApiId = options.sumoApiId;
    this.sumoApiKey = options.sumoApiKey;
    this.root = normalizeRoot(options.endpoint);
  }

  get cookieCount(): number {
    return this.cookies.size;
  }

  getCookie(name: string): string | undefined {
    return this.cookies.get(name);
  }

  captureCookies(response: Response): void {
    for (const cookie of response.headers.getSetCookie()) {
      const parsed = parseSetCookieHeader(cookie);
      if (parsed) {
        this.cookies.set(parsed.name, parsed.value);
      }
    }
  }

  async get(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<unknown> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return this.request('GET', `${normalizedPath}${buildQueryString(query)}`);
  }

  async post(path: string, body?: unknown): Promise<unknown> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return this.request('POST', normalizedPath, body);
  }

  async delete(path: string): Promise<void> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    await this.request('DELETE', normalizedPath);
  }

  private authHeader(): string {
    const credentials = `${this.sumoApiId}:${this.sumoApiKey}`;
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

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    if (!this.sumoApiId || !this.sumoApiKey) {
      throw new Error(
        'Sumo Logic credentials are not configured (SUMO_API_ID / SUMO_API_KEY)',
      );
    }

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
      return undefined;
    }

    return JSON.parse(text) as unknown;
  }
}

export function createSumoClient(options: SumoClientOptions): SumoClient {
  return new SumoClient(options);
}
