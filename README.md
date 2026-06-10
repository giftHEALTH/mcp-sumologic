[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/samwang0723-mcp-sumologic-badge.png)](https://mseep.ai/app/samwang0723-mcp-sumologic)

# MCP Sumo Logic

A Model Context Protocol (MCP) server that integrates with Sumo Logic's API to perform log searches.

## Features

- Search Sumo Logic logs using custom queries
- Configurable time ranges for searches
- Error handling and detailed logging
- stdio transport by default (works with MCP clients and `docker run -i`)
- Optional Streamable HTTP transport for remote deployments

## Environment Variables

```env
SUMO_API_ID=your_api_id   # Required
SUMO_API_KEY=your_api_key # Required
ENDPOINT=https://api.us2.sumologic.com/api/v1  # Optional (defaults to gifthealth US2)
PORT=3006                  # Optional (HTTP mode only)
```

## Quick Start (stdio)

Pull and run the published image from GHCR:

```bash
docker run -i --rm \
  -e SUMO_API_ID=... \
  -e SUMO_API_KEY=... \
  ghcr.io/gifthealth/mcp-sumologic
```

### MCP Client Configuration

```json
{
  "mcpServers": {
    "sumologic": {
      "command": "docker run -i --rm -e SUMO_API_ID -e SUMO_API_KEY ghcr.io/gifthealth/mcp-sumologic",
      "env": {
        "SUMO_API_ID": "...",
        "SUMO_API_KEY": "..."
      }
    }
  }
}
```

## Transports

The server supports two transports, selected by CLI argument:

| Mode | Command | Use case |
|------|---------|----------|
| **stdio** (default) | `node dist/index.js` | MCP clients, `docker run -i` |
| **http** | `node dist/index.js http` | Remote HTTP/SSE deployment on port 3006 |

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with `SUMO_API_ID` and `SUMO_API_KEY`
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start          # stdio (default)
   npm run start:http # HTTP on port 3006
   ```

## Docker Setup

### stdio (default)

```bash
docker build -t ghcr.io/gifthealth/mcp-sumologic .
docker run -i --rm \
  -e SUMO_API_ID=... \
  -e SUMO_API_KEY=... \
  ghcr.io/gifthealth/mcp-sumologic
```

### HTTP (opt-in)

```bash
docker run -p 3006:3006 --env-file .env \
  ghcr.io/gifthealth/mcp-sumologic \
  node dist/index.js http
```

Or use Docker Compose (runs HTTP mode on port 3006):

```bash
docker-compose up --build -d
```

## Usage

The server exposes a `search_sumologic` tool that accepts the following parameters:

- `query` (required): The Sumo Logic search query
- `from` (optional): Start time in ISO 8601 format
- `to` (optional): End time in ISO 8601 format

Example query:
```typescript
const query = '_index={index} | json auto | fields log_identifier';
const results = await search(sumoClient, query, {
  from: '2024-02-23T00:00:00Z',
  to: '2024-02-24T00:00:00Z',
});
```

## Error Handling

The server includes comprehensive error handling and logging:
- API errors are caught and logged with details
- Search job status is monitored and logged
- Network and authentication issues are properly handled

## Development

To run in development mode:
```bash
npm run dev          # stdio (default)
npm run dev:http     # HTTP on port 3006
```

For testing:
```bash
npm test
```

## Makefile

Common tasks are available via `make`:

| Command              | Description                                  |
|----------------------|----------------------------------------------|
| `make install`       | Install dependencies                         |
| `make build`         | Build the project                            |
| `make start`         | Start the server (stdio)                     |
| `make dev`           | Start in development mode (auto-reload)      |
| `make clean`         | Remove `dist/` and `node_modules/`           |
| `make lint`          | Run ESLint                                   |
| `make test`          | Run tests                                    |
| `make docker-build`  | Build Docker image                           |
| `make docker-run`    | Run container with `.env` file on port 3006  |
| `make docker-compose`| Start services via Docker Compose            |
| `make docker-down`   | Stop Docker Compose services                 |
