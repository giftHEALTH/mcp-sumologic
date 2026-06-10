import { config } from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { randomUUID } from 'node:crypto';
import * as Sumo from '@/lib/sumologic/client.js';
import { allTools, toolNames } from '@/tools/index.js';
import { runTool } from '@/tools/helpers.js';

config();

const DEFAULT_ENDPOINT = 'https://api.us2.sumologic.com/api/v1';

const sumoClient = Sumo.client({
  endpoint: process.env.ENDPOINT || DEFAULT_ENDPOINT,
  sumoApiId: process.env.SUMO_API_ID || '',
  sumoApiKey: process.env.SUMO_API_KEY || '',
});

function createServer(): McpServer {
  const server = new McpServer({
    name: 'mcp-sumologic',
    version: '1.0.0',
  });

  for (const tool of allTools) {
    server.tool(tool.name, tool.description, tool.schema, async (args) =>
      runTool(() => tool.handler(sumoClient, args)),
    );
  }

  return server;
}

async function runStdioServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Sumologic Server running on stdio');
}

async function runHttpServer() {
  const app = express();
  app.use(express.json());

  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'mcp-sumologic',
      version: '1.0.0',
      enabled_tools: toolNames,
    });
  });

  app.post('/mcp', async (req, res) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            transports[newSessionId] = transport;
            console.log(`New MCP session initialized: ${newSessionId}`);
          },
        });

        transport.onclose = () => {
          if (transport.sessionId) {
            console.log(`MCP session closed: ${transport.sessionId}`);
            delete transports[transport.sessionId];
          }
        };

        const server = createServer();
        await server.connect(transport);
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  const handleSessionRequest = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  };

  app.get('/mcp', handleSessionRequest);
  app.delete('/mcp', handleSessionRequest);

  const port = parseInt(process.env.PORT || '3006', 10);

  app.listen(port, '0.0.0.0', () => {
    console.log(`MCP Sumologic Server running on http://0.0.0.0:${port}`);
    console.log(`Health check available at http://0.0.0.0:${port}/health`);
    console.log(`MCP endpoint available at http://0.0.0.0:${port}/mcp`);
  });
}

const mode = process.argv[2];
const main = mode === 'http' ? runHttpServer : runStdioServer;
main().catch((error) => {
  console.error('Failed to start Sumologic MCP server:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.error('Shutting down Sumologic MCP server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down Sumologic MCP server...');
  process.exit(0);
});
