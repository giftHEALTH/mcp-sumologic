import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SumoClient } from '@/sumologic/http.js';
import type { AnyToolDef } from '@/tools/defineTool.js';
import { allTools } from '@/tools/registry.js';
import { runTool } from '@/tools/format.js';

function registerTool(
  server: McpServer,
  client: SumoClient,
  tool: AnyToolDef,
): void {
  server.tool(tool.name, tool.description, tool.schema, async (args) =>
    runTool(() => tool.handler(client, args)),
  );
}

export function createServer(client: SumoClient): McpServer {
  const server = new McpServer({
    name: 'mcp-sumologic',
    version: '1.0.0',
  });

  for (const tool of allTools as AnyToolDef[]) {
    registerTool(server, client, tool);
  }

  return server;
}
