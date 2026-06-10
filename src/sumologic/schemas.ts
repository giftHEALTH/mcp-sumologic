import { z } from 'zod';

export const jobResponseSchema = z
  .object({
    id: z.string(),
    status: z.number().optional(),
    code: z.string().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export const statusResponseSchema = z
  .object({
    state: z.string(),
    messageCount: z.number().optional(),
    recordCount: z.number().optional(),
    histogramBuckets: z.array(z.unknown()).optional(),
    pendingErrors: z.array(z.unknown()).optional(),
    pendingWarnings: z.array(z.unknown()).optional(),
  })
  .passthrough();

const searchResultItemSchema = z
  .object({
    map: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

export const messagesResponseSchema = z
  .object({
    fields: z.array(z.unknown()).optional(),
    messages: z.array(searchResultItemSchema),
  })
  .passthrough();

export const recordsResponseSchema = z
  .object({
    fields: z.array(z.unknown()).optional(),
    records: z.array(searchResultItemSchema),
  })
  .passthrough();

export const passthroughResponseSchema = z.record(z.string(), z.unknown());

export const looseResponseSchema = z.union([
  passthroughResponseSchema,
  z.array(z.unknown()),
]);

export function parseLooseResponse(raw: unknown): unknown {
  return looseResponseSchema.parse(raw);
}

export type JobResponse = z.infer<typeof jobResponseSchema>;
export type StatusResponse = z.infer<typeof statusResponseSchema>;
export type MessagesResponse = z.infer<typeof messagesResponseSchema>;
export type RecordsResponse = z.infer<typeof recordsResponseSchema>;
export type SearchResultItem = z.infer<typeof searchResultItemSchema>;
