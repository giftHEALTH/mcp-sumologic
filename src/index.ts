import { config as loadDotenv } from 'dotenv';
import { loadConfig } from '@/config.js';
import { createServer } from '@/server.js';
import { createSumoClient } from '@/sumologic/http.js';
import { runHttpTransport } from '@/transports/http.js';
import { runStdioTransport } from '@/transports/stdio.js';

loadDotenv();

const appConfig = loadConfig();
const sumoClient = createSumoClient({
  endpoint: appConfig.endpoint,
  sumoApiId: appConfig.sumoApiId,
  sumoApiKey: appConfig.sumoApiKey,
});

const mode = process.argv[2];

async function main(): Promise<void> {
  if (mode === 'http') {
    runHttpTransport(sumoClient, appConfig);
    return;
  }

  const server = createServer(sumoClient);
  await runStdioTransport(server);
}

main().catch((error) => {
  console.error('Failed to start Sumologic MCP server:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.error('Shutting down Sumologic MCP server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down Sumologic MCP server...');
  process.exit(0);
});
