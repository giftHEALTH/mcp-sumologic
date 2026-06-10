import type { SumoClient } from '@/sumologic/http.js';
import { parseLooseResponse } from '@/sumologic/schemas.js';

export interface MetricsQueryOptions {
  query: string;
  from?: string;
  to?: string;
  rowId?: string;
  quantization?: number;
  rollup?: string;
}

function buildTimeRange(from?: string, to?: string) {
  if (from && to) {
    return {
      type: 'BeginBoundedTimeRange',
      from: {
        type: 'ExactTimeRangeBoundary',
        boundaryEpoch: Date.parse(from),
      },
      to: {
        type: 'ExactTimeRangeBoundary',
        boundaryEpoch: Date.parse(to),
      },
    };
  }

  return {
    type: 'BeginBoundedTimeRange',
    from: {
      type: 'RelativeTimeRangeBoundary',
      relativeTime: '-15m',
    },
  };
}

export async function queryMetrics(
  client: SumoClient,
  options: MetricsQueryOptions,
) {
  const body = {
    queries: [
      {
        rowId: options.rowId ?? 'A',
        query: options.query,
        quantization: options.quantization ?? 60000,
        rollup: options.rollup ?? 'Avg',
      },
    ],
    timeRange: buildTimeRange(options.from, options.to),
  };

  const raw = await client.post('/api/v1/metricsQueries', body);
  return parseLooseResponse(raw);
}
