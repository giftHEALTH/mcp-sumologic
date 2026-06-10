import { z } from 'zod';
import { searchAggregate, searchLogs } from '@/domains/sumologic/search.js';
import type { ToolDefinition } from '@/tools/types.js';

export const searchTools: ToolDefinition[] = [
  {
    name: 'search_logs',
    description:
      'Run a Sumo Logic log search and return raw messages. Use for non-aggregation queries.',
    schema: {
      query: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.number().int().positive().max(1000).optional(),
    },
    handler: async (client, { query, from, to, limit }) => {
      const cleanedQuery = String(query).replace(/\n/g, '');
      return searchLogs(client, cleanedQuery, {
        from: from as string | undefined,
        to: to as string | undefined,
        limit: limit as number | undefined,
      });
    },
  },
  {
    name: 'search_aggregate',
    description:
      'Run a Sumo Logic aggregation query and return records (e.g. count by, group by).',
    schema: {
      query: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.number().int().positive().max(1000).optional(),
    },
    handler: async (client, { query, from, to, limit }) => {
      const cleanedQuery = String(query).replace(/\n/g, '');
      return searchAggregate(client, cleanedQuery, {
        from: from as string | undefined,
        to: to as string | undefined,
        limit: limit as number | undefined,
      });
    },
  },
];
