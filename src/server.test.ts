import { beforeEach, describe, expect, it, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createServer } from '@/server.js';
import { createSumoClient } from '@/sumologic/http.js';

vi.mock('@/sumologic/metadata.js', () => ({
  listFields: vi.fn().mockResolvedValue({ fields: [] }),
}));

import { listFields } from '@/sumologic/metadata.js';

describe('createServer', () => {
  beforeEach(() => {
    vi.mocked(listFields).mockResolvedValue({ fields: [] });
  });

  it('registers all 15 tools on the MCP server', () => {
    const registrations: string[] = [];
    const toolSpy = vi
      .spyOn(McpServer.prototype, 'tool')
      .mockImplementation((name) => {
        registrations.push(name as string);
        return {} as ReturnType<McpServer['tool']>;
      });

    const client = createSumoClient({
      endpoint: 'https://api.us2.sumologic.com/api/v1',
      sumoApiId: 'id',
      sumoApiKey: 'key',
    });

    const server = createServer(client);

    expect(server).toBeInstanceOf(McpServer);
    expect(registrations).toEqual([
      'search_logs',
      'search_aggregate',
      'list_collectors',
      'get_collector',
      'list_sources',
      'list_partitions',
      'list_fields',
      'list_scheduled_views',
      'query_metrics',
      'search_monitors',
      'get_monitor',
      'list_health_events',
      'get_content_by_path',
      'get_personal_folder',
      'get_folder',
    ]);

    toolSpy.mockRestore();
  });

  it('wraps registered tool handlers with runTool', async () => {
    let registeredHandler: ((args: unknown) => Promise<unknown>) | undefined;
    const toolSpy = vi
      .spyOn(McpServer.prototype, 'tool')
      .mockImplementation((_name, _description, _schema, handler) => {
        if (_name === 'list_fields') {
          registeredHandler = handler as typeof registeredHandler;
        }
        return {} as ReturnType<McpServer['tool']>;
      });

    const client = createSumoClient({
      endpoint: 'https://api.us2.sumologic.com/api/v1',
      sumoApiId: 'id',
      sumoApiKey: 'key',
    });

    createServer(client);

    expect(registeredHandler).toBeDefined();
    const result = await registeredHandler!({});

    expect(listFields).toHaveBeenCalledWith(client);
    expect(result).toEqual({
      content: [{ type: 'text', text: '{\n  "fields": []\n}' }],
    });

    toolSpy.mockRestore();
  });
});
