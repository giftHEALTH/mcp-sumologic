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
docker run --pull=always -i --rm \
  -e SUMO_API_ID=... \
  -e SUMO_API_KEY=... \
  ghcr.io/gifthealth/mcp-sumologic
```

### MCP Client Configuration

```json
{
  "mcpServers": {
    "sumologic": {
      "command": "docker run --pull=always -i --rm -e SUMO_API_ID -e SUMO_API_KEY ghcr.io/gifthealth/mcp-sumologic",
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
docker run --pull=always -i --rm \
  -e SUMO_API_ID=... \
  -e SUMO_API_KEY=... \
  ghcr.io/gifthealth/mcp-sumologic
```

### HTTP (opt-in)

```bash
docker run --pull=always -p 3006:3006 --env-file .env \
  ghcr.io/gifthealth/mcp-sumologic \
  node dist/index.js http
```

Or use Docker Compose (runs HTTP mode on port 3006):

```bash
docker-compose up --build -d
```

## Usage

All tools are read-only. Search tools accept optional `from`/`to` ISO timestamps and `limit` (default 100).

### Search

| Tool | Description |
|------|-------------|
| `search_logs` | Raw log messages (non-aggregation queries) |
| `search_aggregate` | Aggregation records (`count by`, `group by`, etc.) |

Example — list source categories:

```
query: _sourceCategory=* | count by _sourceCategory | sort by _count desc
```

Use `search_aggregate` for the above; use `search_logs` for raw log lines.

### Data discovery

| Tool | Description |
|------|-------------|
| `list_collectors` | List collectors |
| `get_collector` | Get collector by ID |
| `list_sources` | List sources for a collector |
| `list_partitions` | List partitions (index/source category routing) |
| `list_fields` | List configured fields |
| `list_scheduled_views` | List scheduled views |

### Metrics

| Tool | Description |
|------|-------------|
| `query_metrics` | Run a metrics query (`query`, optional `from`/`to`, `quantization`, `rollup`) |

### Monitoring

| Tool | Description |
|------|-------------|
| `search_monitors` | Search monitors |
| `get_monitor` | Get monitor by ID |
| `list_health_events` | List health events |

### Content

| Tool | Description |
|------|-------------|
| `get_content_by_path` | Get library content by path |
| `get_personal_folder` | Get personal content folder |
| `get_folder` | Get folder by ID |

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
npm test              # run Vitest suite once
npm run test:watch    # watch mode
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
