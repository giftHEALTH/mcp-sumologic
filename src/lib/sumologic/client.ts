import queryString from 'query-string';
import { mergeRight } from 'ramda';
import requestPromise from 'request-promise-native';
import * as types from '@/lib/sumologic/types.js';

const defaultPaginationOptions: types.IPaginationOptions = {
  limit: 40,
  offset: 0,
};

export function normalizeRoot(endpoint: string): string {
  const trimmed = endpoint.endsWith('/')
    ? endpoint.slice(0, -1)
    : endpoint;
  return trimmed.replace(/\/api\/v\d+$/, '');
}

export class Client {
  private httpClient: types.HttpClient;
  private params: types.IClientOptions;
  readonly root: string;

  constructor(httpClient: types.HttpClient, params: types.IClientOptions) {
    this.httpClient = httpClient;
    this.params = params;
    this.root = normalizeRoot(params.endpoint);
  }

  public get<T = unknown>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): PromiseLike<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const queryStringValue =
      query && Object.keys(query).length > 0
        ? `?${queryString.stringify(query, { skipNull: true, skipEmptyString: true })}`
        : '';

    return this.httpClient.get(
      this.options({
        url: `${normalizedPath}${queryStringValue}`,
      }),
    );
  }

  public post<T = unknown>(path: string, body?: unknown): PromiseLike<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return this.httpClient.post(
      this.options({
        body,
        url: normalizedPath,
      }),
    );
  }

  public deleteRequest(path: string): PromiseLike<void> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return this.httpClient.delete(this.options({ url: normalizedPath }));
  }

  public job(params: types.IJobOptions): PromiseLike<types.IJob> {
    return this.post('/api/v1/search/jobs', params);
  }

  public status(id: string): PromiseLike<types.IStatus> {
    return this.get(`/api/v1/search/jobs/${id}`);
  }

  public messages(
    id: string,
    params: Partial<types.IPaginationOptions> = defaultPaginationOptions,
  ): PromiseLike<types.IMessages> {
    const query = this.paginationQuery(
      mergeRight(defaultPaginationOptions, params),
    );

    return this.get(`/api/v1/search/jobs/${id}/messages?${query}`);
  }

  public records(
    id: string,
    params: Partial<types.IPaginationOptions> = defaultPaginationOptions,
  ): PromiseLike<types.IRecords> {
    const query = this.paginationQuery(
      mergeRight(defaultPaginationOptions, params),
    );

    return this.get(`/api/v1/search/jobs/${id}/records?${query}`);
  }

  public delete(id: string): PromiseLike<void> {
    return this.deleteRequest(`/api/v1/search/jobs/${id}`);
  }

  private paginationQuery(params: types.IPaginationOptions): string {
    return queryString.stringify(params);
  }

  private options(options: types.IHttpCallOptions): types.HttpClientOptions {
    const defaultOptions = {
      auth: {
        pass: this.params.sumoApiKey,
        user: this.params.sumoApiId,
      },
      jar: true,
      json: true,
    };

    const path = options.url?.startsWith('/') ? options.url : `/${options.url}`;

    const requestOptions = {
      ...options,
      url: this.root + path,
    };

    return mergeRight(requestOptions, defaultOptions);
  }
}

const client = (params: types.IClientOptions): Client =>
  new Client(requestPromise, params);

export { client };
export * from './types.js';
