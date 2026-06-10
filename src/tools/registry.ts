import { z } from 'zod';
import {
  getContentByPath,
  getFolder,
  getPersonalFolder,
} from '@/sumologic/content.js';
import {
  getCollector,
  listCollectors,
  listFields,
  listPartitions,
  listScheduledViews,
  listSources,
} from '@/sumologic/metadata.js';
import { queryMetrics } from '@/sumologic/metrics.js';
import {
  getMonitor,
  listHealthEvents,
  searchMonitors,
} from '@/sumologic/monitors.js';
import { searchAggregate, searchLogs } from '@/sumologic/search.js';
import { defineTool } from '@/tools/defineTool.js';

export const searchTools = [
  defineTool({
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
      const cleanedQuery = query.replace(/\n/g, '');
      return searchLogs(client, cleanedQuery, { from, to, limit });
    },
  }),
  defineTool({
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
      const cleanedQuery = query.replace(/\n/g, '');
      return searchAggregate(client, cleanedQuery, { from, to, limit });
    },
  }),
];

export const metadataTools = [
  defineTool({
    name: 'list_collectors',
    description: 'List Sumo Logic collectors.',
    schema: {
      limit: z.number().int().positive().max(1000).optional(),
      offset: z.number().int().min(0).optional(),
    },
    handler: async (client, { limit, offset }) =>
      listCollectors(client, { limit, offset }),
  }),
  defineTool({
    name: 'get_collector',
    description: 'Get a Sumo Logic collector by ID.',
    schema: {
      collectorId: z.number().int().positive(),
    },
    handler: async (client, { collectorId }) =>
      getCollector(client, collectorId),
  }),
  defineTool({
    name: 'list_sources',
    description: 'List sources for a Sumo Logic collector.',
    schema: {
      collectorId: z.number().int().positive(),
      limit: z.number().int().positive().max(1000).optional(),
      offset: z.number().int().min(0).optional(),
    },
    handler: async (client, { collectorId, limit, offset }) =>
      listSources(client, collectorId, { limit, offset }),
  }),
  defineTool({
    name: 'list_partitions',
    description:
      'List Sumo Logic partitions (useful for discovering index and source category routing).',
    schema: {
      limit: z.number().int().positive().max(1000).optional(),
      token: z.string().optional(),
    },
    handler: async (client, { limit, token }) =>
      listPartitions(client, { limit, token }),
  }),
  defineTool({
    name: 'list_fields',
    description: 'List configured Sumo Logic fields.',
    schema: {},
    handler: async (client) => listFields(client),
  }),
  defineTool({
    name: 'list_scheduled_views',
    description: 'List Sumo Logic scheduled views.',
    schema: {},
    handler: async (client) => listScheduledViews(client),
  }),
];

export const metricsTools = [
  defineTool({
    name: 'query_metrics',
    description:
      'Run a Sumo Logic metrics query. Returns time-series data for the given metric query.',
    schema: {
      query: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
      rowId: z.string().optional(),
      quantization: z.number().int().positive().optional(),
      rollup: z.string().optional(),
    },
    handler: async (client, { query, from, to, rowId, quantization, rollup }) =>
      queryMetrics(client, { query, from, to, rowId, quantization, rollup }),
  }),
];

export const monitorsTools = [
  defineTool({
    name: 'search_monitors',
    description: 'Search Sumo Logic monitors.',
    schema: {
      query: z.string().optional(),
      limit: z.number().int().positive().max(1000).optional(),
      offset: z.number().int().min(0).optional(),
    },
    handler: async (client, { query, limit, offset }) =>
      searchMonitors(client, { query, limit, offset }),
  }),
  defineTool({
    name: 'get_monitor',
    description: 'Get a Sumo Logic monitor by ID.',
    schema: {
      monitorId: z.string(),
    },
    handler: async (client, { monitorId }) => getMonitor(client, monitorId),
  }),
  defineTool({
    name: 'list_health_events',
    description: 'List Sumo Logic health events.',
    schema: {
      limit: z.number().int().positive().max(1000).optional(),
    },
    handler: async (client, { limit }) => listHealthEvents(client, { limit }),
  }),
];

export const contentTools = [
  defineTool({
    name: 'get_content_by_path',
    description: 'Get Sumo Logic library content by path.',
    schema: {
      path: z.string(),
    },
    handler: async (client, { path }) => getContentByPath(client, path),
  }),
  defineTool({
    name: 'get_personal_folder',
    description: 'Get the personal content folder for the authenticated user.',
    schema: {},
    handler: async (client) => getPersonalFolder(client),
  }),
  defineTool({
    name: 'get_folder',
    description: 'Get a Sumo Logic content folder by ID.',
    schema: {
      folderId: z.string(),
    },
    handler: async (client, { folderId }) => getFolder(client, folderId),
  }),
];

export const allTools = [
  ...searchTools,
  ...metadataTools,
  ...metricsTools,
  ...monitorsTools,
  ...contentTools,
];

export const toolNames = allTools.map((tool) => tool.name);

export type { AnyToolDef } from '@/tools/defineTool.js';
