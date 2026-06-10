import { z } from 'zod';
import {
  getMonitor,
  listHealthEvents,
  searchMonitors,
} from '@/domains/sumologic/monitors.js';
import type { ToolDefinition } from '@/tools/types.js';

export const monitorsTools: ToolDefinition[] = [
  {
    name: 'search_monitors',
    description: 'Search Sumo Logic monitors.',
    schema: {
      query: z.string().optional(),
      limit: z.number().int().positive().max(1000).optional(),
      offset: z.number().int().min(0).optional(),
    },
    handler: async (client, { query, limit, offset }) =>
      searchMonitors(client, {
        query: query as string | undefined,
        limit: limit as number | undefined,
        offset: offset as number | undefined,
      }),
  },
  {
    name: 'get_monitor',
    description: 'Get a Sumo Logic monitor by ID.',
    schema: {
      monitorId: z.string(),
    },
    handler: async (client, { monitorId }) =>
      getMonitor(client, monitorId as string),
  },
  {
    name: 'list_health_events',
    description: 'List Sumo Logic health events.',
    schema: {
      limit: z.number().int().positive().max(1000).optional(),
    },
    handler: async (client, { limit }) =>
      listHealthEvents(client, {
        limit: limit as number | undefined,
      }),
  },
];
