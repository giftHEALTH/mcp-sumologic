import { z } from 'zod';
import {
  getCollector,
  listCollectors,
  listFields,
  listPartitions,
  listScheduledViews,
  listSources,
} from '@/domains/sumologic/metadata.js';
import type { ToolDefinition } from '@/tools/types.js';

export const metadataTools: ToolDefinition[] = [
  {
    name: 'list_collectors',
    description: 'List Sumo Logic collectors.',
    schema: {
      limit: z.number().int().positive().max(1000).optional(),
      offset: z.number().int().min(0).optional(),
    },
    handler: async (client, { limit, offset }) =>
      listCollectors(client, {
        limit: limit as number | undefined,
        offset: offset as number | undefined,
      }),
  },
  {
    name: 'get_collector',
    description: 'Get a Sumo Logic collector by ID.',
    schema: {
      collectorId: z.number().int().positive(),
    },
    handler: async (client, { collectorId }) =>
      getCollector(client, collectorId as number),
  },
  {
    name: 'list_sources',
    description: 'List sources for a Sumo Logic collector.',
    schema: {
      collectorId: z.number().int().positive(),
      limit: z.number().int().positive().max(1000).optional(),
      offset: z.number().int().min(0).optional(),
    },
    handler: async (client, { collectorId, limit, offset }) =>
      listSources(client, collectorId as number, {
        limit: limit as number | undefined,
        offset: offset as number | undefined,
      }),
  },
  {
    name: 'list_partitions',
    description:
      'List Sumo Logic partitions (useful for discovering index and source category routing).',
    schema: {
      limit: z.number().int().positive().max(1000).optional(),
      token: z.string().optional(),
    },
    handler: async (client, { limit, token }) =>
      listPartitions(client, {
        limit: limit as number | undefined,
        token: token as string | undefined,
      }),
  },
  {
    name: 'list_fields',
    description: 'List configured Sumo Logic fields.',
    schema: {},
    handler: async (client) => listFields(client),
  },
  {
    name: 'list_scheduled_views',
    description: 'List Sumo Logic scheduled views.',
    schema: {},
    handler: async (client) => listScheduledViews(client),
  },
];
