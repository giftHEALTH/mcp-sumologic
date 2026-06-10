import moment from 'moment';
import * as Sumo from '@/lib/sumologic/client.js';
import { maskSearchResultItems } from '@/utils/pii.js';

export interface SearchLogsResult {
  messages: unknown[];
}

export interface SearchAggregateResult {
  records: unknown[];
}

export interface SearchOptions {
  from?: string;
  to?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 100;
const SEARCH_TIME_ZONE = 'Asia/Hong_Kong';

function resolveTimeRange(timeRange?: { from?: string; to?: string }) {
  const defaultTimeRange = {
    from: moment().subtract(1, 'day').toISOString(true).slice(0, 19),
    to: moment().toISOString(true).slice(0, 19),
  };

  return {
    ...defaultTimeRange,
    ...(timeRange?.from && { from: timeRange.from }),
    ...(timeRange?.to && { to: timeRange.to }),
  };
}

async function waitForSearchJob(client: Sumo.Client, jobId: string) {
  let status: Sumo.IStatus;

  do {
    status = await client.status(jobId);
    if (status.state !== 'DONE GATHERING RESULTS') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (status.state !== 'DONE GATHERING RESULTS');

  return status;
}

async function runSearchJob(
  client: Sumo.Client,
  query: string,
  timeRange?: { from?: string; to?: string },
): Promise<string> {
  const { from, to } = resolveTimeRange(timeRange);

  const { id } = await client.job({
    query,
    from,
    to,
    timeZone: SEARCH_TIME_ZONE,
  });

  await waitForSearchJob(client, id);
  return id;
}

export async function searchLogs(
  client: Sumo.Client,
  query: string,
  options?: SearchOptions,
): Promise<SearchLogsResult> {
  const limit = options?.limit ?? DEFAULT_LIMIT;

  try {
    const jobId = await runSearchJob(client, query, options);
    const messages = await client.messages(jobId, { limit, offset: 0 });
    await client.delete(jobId);

    return {
      messages: maskSearchResultItems(messages.messages),
    };
  } catch (error) {
    console.error('Sumo Logic search error:', error);
    throw error;
  }
}

export async function searchAggregate(
  client: Sumo.Client,
  query: string,
  options?: SearchOptions,
): Promise<SearchAggregateResult> {
  const limit = options?.limit ?? DEFAULT_LIMIT;

  try {
    const jobId = await runSearchJob(client, query, options);
    const records = await client.records(jobId, { limit, offset: 0 });
    await client.delete(jobId);

    return {
      records: maskSearchResultItems(records.records),
    };
  } catch (error) {
    console.error('Sumo Logic aggregate search error:', error);
    throw error;
  }
}
