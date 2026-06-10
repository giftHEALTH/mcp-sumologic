import { describe, expect, it, vi } from 'vitest';
import type { SumoClient } from '@/sumologic/http.js';
import { queryMetrics } from '@/sumologic/metrics.js';

function createClient() {
  return {
    post: vi.fn().mockResolvedValue({ ok: true }),
  } as unknown as SumoClient;
}

describe('metrics', () => {
  it('queryMetrics posts a metrics query with defaults', async () => {
    const client = createClient();

    await queryMetrics(client, { query: 'metric=cpu' });

    expect(client.post).toHaveBeenCalledWith('/api/v1/metricsQueries', {
      queries: [
        {
          rowId: 'A',
          query: 'metric=cpu',
          quantization: 60000,
          rollup: 'Avg',
        },
      ],
      timeRange: {
        type: 'BeginBoundedTimeRange',
        from: {
          type: 'RelativeTimeRangeBoundary',
          relativeTime: '-15m',
        },
      },
    });
  });

  it('queryMetrics uses explicit time boundaries when provided', async () => {
    const client = createClient();
    const from = '2026-06-09T00:00:00';
    const to = '2026-06-10T00:00:00';

    await queryMetrics(client, {
      query: 'metric=cpu',
      from,
      to,
      rowId: 'B',
      quantization: 30000,
      rollup: 'Max',
    });

    expect(client.post).toHaveBeenCalledWith('/api/v1/metricsQueries', {
      queries: [
        {
          rowId: 'B',
          query: 'metric=cpu',
          quantization: 30000,
          rollup: 'Max',
        },
      ],
      timeRange: {
        type: 'BeginBoundedTimeRange',
        from: {
          type: 'ExactTimeRangeBoundary',
          boundaryEpoch: Date.parse(from),
        },
        to: {
          type: 'ExactTimeRangeBoundary',
          boundaryEpoch: Date.parse(to),
        },
      },
    });
  });
});
