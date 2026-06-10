import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SumoClient } from '@/sumologic/http.js';
import { allTools, toolNames } from '@/tools/registry.js';

vi.mock('@/sumologic/search.js', () => ({
  searchLogs: vi.fn().mockResolvedValue({ messages: [] }),
  searchAggregate: vi.fn().mockResolvedValue({ records: [] }),
}));

vi.mock('@/sumologic/metadata.js', () => ({
  listCollectors: vi.fn().mockResolvedValue({ collectors: [] }),
  getCollector: vi.fn().mockResolvedValue({ collector: {} }),
  listSources: vi.fn().mockResolvedValue({ sources: [] }),
  listPartitions: vi.fn().mockResolvedValue({ partitions: [] }),
  listFields: vi.fn().mockResolvedValue({ fields: [] }),
  listScheduledViews: vi.fn().mockResolvedValue({ scheduledViews: [] }),
}));

vi.mock('@/sumologic/metrics.js', () => ({
  queryMetrics: vi.fn().mockResolvedValue({ results: [] }),
}));

vi.mock('@/sumologic/monitors.js', () => ({
  searchMonitors: vi.fn().mockResolvedValue({ monitors: [] }),
  getMonitor: vi.fn().mockResolvedValue({ monitor: {} }),
  listHealthEvents: vi.fn().mockResolvedValue({ healthEvents: [] }),
}));

vi.mock('@/sumologic/content.js', () => ({
  getContentByPath: vi.fn().mockResolvedValue({ content: {} }),
  getPersonalFolder: vi.fn().mockResolvedValue({ folder: {} }),
  getFolder: vi.fn().mockResolvedValue({ folder: {} }),
}));

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
import { z } from 'zod';

const client = {} as SumoClient;

const handlerArgs: Record<string, Record<string, unknown>> = {
  search_logs: { query: 'error\n| count', limit: 10 },
  search_aggregate: { query: 'error | count by _source' },
  list_collectors: { limit: 5, offset: 2 },
  get_collector: { collectorId: 1 },
  list_sources: { collectorId: 1, limit: 10 },
  list_partitions: { token: 'next' },
  list_fields: {},
  list_scheduled_views: {},
  query_metrics: { query: 'metric=cpu' },
  search_monitors: { query: 'status:critical' },
  get_monitor: { monitorId: 'monitor-1' },
  list_health_events: { limit: 25 },
  get_content_by_path: { path: '/Library/Admin' },
  get_personal_folder: {},
  get_folder: { folderId: 'folder-1' },
};

describe('defineTool', () => {
  it('returns the tool definition unchanged', () => {
    const tool = defineTool({
      name: 'example',
      description: 'example tool',
      schema: { value: z.string() },
      handler: async () => ({ ok: true }),
    });

    expect(tool.name).toBe('example');
  });
});

describe('registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports 15 unique tools', () => {
    expect(allTools).toHaveLength(15);
    expect(new Set(toolNames).size).toBe(15);
    expect(toolNames).toEqual(allTools.map((tool) => tool.name));
  });

  it.each(allTools.map((tool) => [tool.name, tool]))(
    'invokes handler for %s',
    async (name, tool) => {
      await tool.handler(client, handlerArgs[name as string] ?? {});

      switch (name) {
        case 'search_logs':
          expect(searchLogs).toHaveBeenCalledWith(client, 'error| count', {
            from: undefined,
            to: undefined,
            limit: 10,
          });
          break;
        case 'search_aggregate':
          expect(searchAggregate).toHaveBeenCalledWith(
            client,
            'error | count by _source',
            { from: undefined, to: undefined, limit: undefined },
          );
          break;
        case 'list_collectors':
          expect(listCollectors).toHaveBeenCalledWith(client, {
            limit: 5,
            offset: 2,
          });
          break;
        case 'get_collector':
          expect(getCollector).toHaveBeenCalledWith(client, 1);
          break;
        case 'list_sources':
          expect(listSources).toHaveBeenCalledWith(client, 1, {
            limit: 10,
            offset: undefined,
          });
          break;
        case 'list_partitions':
          expect(listPartitions).toHaveBeenCalledWith(client, {
            limit: undefined,
            token: 'next',
          });
          break;
        case 'list_fields':
          expect(listFields).toHaveBeenCalledWith(client);
          break;
        case 'list_scheduled_views':
          expect(listScheduledViews).toHaveBeenCalledWith(client);
          break;
        case 'query_metrics':
          expect(queryMetrics).toHaveBeenCalledWith(client, {
            query: 'metric=cpu',
            from: undefined,
            to: undefined,
            rowId: undefined,
            quantization: undefined,
            rollup: undefined,
          });
          break;
        case 'search_monitors':
          expect(searchMonitors).toHaveBeenCalledWith(client, {
            query: 'status:critical',
            limit: undefined,
            offset: undefined,
          });
          break;
        case 'get_monitor':
          expect(getMonitor).toHaveBeenCalledWith(client, 'monitor-1');
          break;
        case 'list_health_events':
          expect(listHealthEvents).toHaveBeenCalledWith(client, { limit: 25 });
          break;
        case 'get_content_by_path':
          expect(getContentByPath).toHaveBeenCalledWith(
            client,
            '/Library/Admin',
          );
          break;
        case 'get_personal_folder':
          expect(getPersonalFolder).toHaveBeenCalledWith(client);
          break;
        case 'get_folder':
          expect(getFolder).toHaveBeenCalledWith(client, 'folder-1');
          break;
        default:
          throw new Error(`Missing assertion for tool: ${name}`);
      }
    },
  );
});
