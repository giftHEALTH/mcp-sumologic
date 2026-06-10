import { loadConfig } from '@/config.js';
import type { SumoClient } from '@/sumologic/http.js';
import {
  deleteJob,
  getMessages,
  getRecords,
  runSearchJob,
} from '@/sumologic/searchJobs.js';
import { resolveTimeRange } from '@/sumologic/timeRange.js';

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
  timeZone?: string;
  defaultLimit?: number;
}

async function executeSearchJob(
  client: SumoClient,
  query: string,
  options?: SearchOptions,
): Promise<string> {
  const config = loadConfig();
  const { from, to } = resolveTimeRange(options);

  return runSearchJob(client, {
    query,
    from,
    to,
    timeZone: options?.timeZone ?? config.searchTimeZone,
  });
}

export async function searchLogs(
  client: SumoClient,
  query: string,
  options?: SearchOptions,
): Promise<SearchLogsResult> {
  const config = loadConfig();
  const limit = options?.limit ?? options?.defaultLimit ?? config.defaultLimit;

  try {
    const jobId = await executeSearchJob(client, query, options);
    const messages = await getMessages(client, jobId, { limit, offset: 0 });
    await deleteJob(client, jobId);

    return {
      messages: messages.messages,
    };
  } catch (error) {
    console.error('Sumo Logic search error:', error);
    throw error;
  }
}

export async function searchAggregate(
  client: SumoClient,
  query: string,
  options?: SearchOptions,
): Promise<SearchAggregateResult> {
  const config = loadConfig();
  const limit = options?.limit ?? options?.defaultLimit ?? config.defaultLimit;

  try {
    const jobId = await executeSearchJob(client, query, options);
    const records = await getRecords(client, jobId, { limit, offset: 0 });
    await deleteJob(client, jobId);

    return {
      records: records.records,
    };
  } catch (error) {
    console.error('Sumo Logic aggregate search error:', error);
    throw error;
  }
}
