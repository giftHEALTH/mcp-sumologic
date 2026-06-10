# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server for Sumo Logic. Exposes read-only tools for log search, aggregation, metadata discovery, metrics, monitors, and content via stdio (default) or Streamable HTTP.

## Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript (tsc + tsc-alias for path aliases)
npm start            # Run compiled server (stdio)
npm run start:http   # Run HTTP server on port 3006
npm run dev          # Dev mode with nodemon + tsx (auto-reload)
npm test             # Run Vitest suite once
npm run test:watch   # Watch mode
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check

# Docker
docker build -t ghcr.io/gifthealth/mcp-sumologic .
docker run --pull=always -i --rm -e SUMO_API_ID -e SUMO_API_KEY ghcr.io/gifthealth/mcp-sumologic
docker run --pull=always --rm --env-file .env -p 3006:3006 ghcr.io/gifthealth/mcp-sumologic node dist/index.js http
docker-compose up --build -d
```

## Architecture

```
src/
├── index.ts                      # Thin entry: load config, pick transport
├── config.ts                     # Zod-validated env (creds optional + stderr warning)
├── server.ts                     # createServer() — registers tools from registry
├── transports/
│   ├── stdio.ts                  # StdioServerTransport
│   └── http.ts                   # Express + Streamable HTTP (/health, /mcp)
├── tools/
│   ├── defineTool.ts             # Generic tool helper (preserves zod inference)
│   ├── format.ts                 # JSON formatting + runTool error wrapper
│   └── registry.ts               # All 15 tool definitions
├── sumologic/
│   ├── http.ts                   # SumoClient (fetch, auth, cookie jar, get/post/delete)
│   ├── searchJobs.ts             # Search job lifecycle + poll
│   ├── schemas.ts                # Zod response schemas (strict jobs, loose admin)
│   ├── timeRange.ts              # Native defaultTimeRange (no moment)
│   ├── search.ts                 # Log search (messages) and aggregation (records)
│   ├── metadata.ts               # Collectors, sources, partitions, fields, scheduled views
│   ├── metrics.ts                # Metrics queries
│   ├── monitors.ts               # Monitors and health events
│   └── content.ts                # Library content and folders
```

### Request Flow

1. **Entry** (`index.ts`): Loads dotenv + `loadConfig()`, creates `SumoClient`, picks stdio or HTTP transport.
2. **Server** (`server.ts`): Builds `McpServer`, registers all tools from `tools/registry.ts` via `defineTool`.
3. **Tools** (`tools/registry.ts`): Zod schemas with inferred handler args (no casts); call sumologic domain modules; return JSON via `tools/format.ts`.
4. **Search** (`sumologic/search.ts` + `searchJobs.ts`): Creates search job, polls until `DONE GATHERING RESULTS`, fetches messages or records, deletes job. Default time range is last 24 hours; timezone from `SEARCH_TIME_ZONE` (default `Asia/Hong_Kong`).
5. **HTTP client** (`sumologic/http.ts`): Normalizes API root from `ENDPOINT`, Basic auth, cookie jar for search-job affinity, `URLSearchParams` for query strings.

### MCP Tools (read-only)

| Tool | Purpose |
|------|---------|
| `search_logs` | Raw log messages |
| `search_aggregate` | Aggregation records (`count by`, etc.) |
| `list_collectors`, `get_collector`, `list_sources` | Collector/source discovery |
| `list_partitions`, `list_fields`, `list_scheduled_views` | Metadata discovery |
| `query_metrics` | Metrics time-series queries |
| `search_monitors`, `get_monitor`, `list_health_events` | Monitoring |
| `get_content_by_path`, `get_personal_folder`, `get_folder` | Library content |

### Key Technical Details

- **ESM modules**: `"type": "module"` in package.json — all imports use `.js` extensions
- **Path aliases**: `@/*` maps to `src/*` (tsconfig paths + `tsc-alias` for build, `tsx` handles in dev)
- **Transport**: stdio default; HTTP opt-in via `node dist/index.js http`
- **Health endpoint**: `GET /health` returns service status and enabled tools (HTTP mode)
- **Type safety**: `defineTool()` preserves zod inference; single cast at MCP SDK boundary in `server.ts`
- **Response validation**: Strict zod schemas for search jobs; loose passthrough for admin/list endpoints

## Environment Variables

- `SUMO_API_ID` — API access ID (optional at boot; API calls fail without it)
- `SUMO_API_KEY` — API access key (optional at boot)
- `ENDPOINT` — Sumo Logic API base URL (default: `https://api.us2.sumologic.com/api/v1`)
- `PORT` — Server port for HTTP mode (default: 3006)
- `SEARCH_TIME_ZONE` — Default search timezone (default: `Asia/Hong_Kong`)
- `DEFAULT_LIMIT` — Default search result limit (default: 100)
