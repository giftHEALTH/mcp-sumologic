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
npm test             # Run Jest tests
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check

# Docker
docker build -t ghcr.io/gifthealth/mcp-sumologic .
docker run -i --rm -e SUMO_API_ID -e SUMO_API_KEY ghcr.io/gifthealth/mcp-sumologic
docker run --rm --env-file .env -p 3006:3006 ghcr.io/gifthealth/mcp-sumologic node dist/index.js http
docker-compose up --build -d
```

## Architecture

```
src/
├── index.ts                      # MCP server setup (stdio default, HTTP opt-in)
├── tools/                        # Tool registry and per-area tool definitions
├── domains/sumologic/
│   ├── search.ts                 # Log search (messages) and aggregation (records)
│   ├── metadata.ts               # Collectors, sources, partitions, fields, scheduled views
│   ├── metrics.ts                # Metrics queries
│   ├── monitors.ts               # Monitors and health events
│   └── content.ts                # Library content and folders
├── lib/sumologic/
│   ├── client.ts                 # Generic Sumo Logic HTTP client (v1 + v2 paths)
│   └── types.ts                  # TypeScript interfaces for Sumo Logic API
└── utils/pii.ts                  # PII masking for search results
```

### Request Flow

1. **MCP entry** (`index.ts`): Registers tools from `tools/` registry. stdio is default; pass `http` CLI arg for Express on port 3006.
2. **Tools** (`tools/*.ts`): Zod schemas + handlers that call domain modules and return JSON text.
3. **Search** (`domains/sumologic/search.ts`): Creates search job, polls until `DONE GATHERING RESULTS`, fetches messages or records, deletes job. Default time range is last 24 hours, timezone `Asia/Hong_Kong`.
4. **HTTP client** (`lib/sumologic/client.ts`): Normalizes API root from `ENDPOINT`, exposes `get`/`post` for `/api/v1` and `/api/v2` paths plus search-job helpers.
5. **PII filtering** (`utils/pii.ts`): Applied to `_raw` and `response` fields in search messages/records.

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

## Environment Variables

Required in `.env`:
- `SUMO_API_ID` — API access ID
- `SUMO_API_KEY` — API access key
- `ENDPOINT` — Sumo Logic API base URL (default: `https://api.us2.sumologic.com/api/v1`)
- `PORT` — Server port for HTTP mode (default: 3006)
