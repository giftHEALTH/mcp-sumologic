import type { SumoClient } from '@/sumologic/http.js';
import {
  jobResponseSchema,
  messagesResponseSchema,
  recordsResponseSchema,
  statusResponseSchema,
  type JobResponse,
  type MessagesResponse,
  type RecordsResponse,
  type StatusResponse,
} from '@/sumologic/schemas.js';

export interface SearchJobParams {
  query: string;
  from: string;
  to: string;
  timeZone: string;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

const DONE_STATE = 'DONE GATHERING RESULTS';
const POLL_INTERVAL_MS = 1000;

export async function createJob(
  client: SumoClient,
  params: SearchJobParams,
): Promise<JobResponse> {
  const raw = await client.post('/api/v1/search/jobs', params);
  return jobResponseSchema.parse(raw);
}

export async function getStatus(
  client: SumoClient,
  jobId: string,
): Promise<StatusResponse> {
  const raw = await client.get(`/api/v1/search/jobs/${jobId}`);
  return statusResponseSchema.parse(raw);
}

export async function getMessages(
  client: SumoClient,
  jobId: string,
  pagination: PaginationParams,
): Promise<MessagesResponse> {
  const raw = await client.get(`/api/v1/search/jobs/${jobId}/messages`, {
    limit: pagination.limit,
    offset: pagination.offset,
  });
  return messagesResponseSchema.parse(raw);
}

export async function getRecords(
  client: SumoClient,
  jobId: string,
  pagination: PaginationParams,
): Promise<RecordsResponse> {
  const raw = await client.get(`/api/v1/search/jobs/${jobId}/records`, {
    limit: pagination.limit,
    offset: pagination.offset,
  });
  return recordsResponseSchema.parse(raw);
}

export async function deleteJob(
  client: SumoClient,
  jobId: string,
): Promise<void> {
  await client.delete(`/api/v1/search/jobs/${jobId}`);
}

export async function waitForSearchJob(
  client: SumoClient,
  jobId: string,
): Promise<StatusResponse> {
  let status = await getStatus(client, jobId);

  while (status.state !== DONE_STATE) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    status = await getStatus(client, jobId);
  }

  return status;
}

export async function runSearchJob(
  client: SumoClient,
  params: SearchJobParams,
): Promise<string> {
  const job = await createJob(client, params);
  await waitForSearchJob(client, job.id);
  return job.id;
}
