import { z } from 'zod';
import { queryMetrics } from '@/domains/sumologic/metrics.js';
import type { ToolDefinition } from '@/tools/types.js';

export const metricsTools: ToolDefinition[] = [
  {
    name: 'query_metrics',
    description:
      'Run a Sumo Logic metrics query. Returns time-series data for the given metric query.',
    schema: {
      query: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
      rowId: z.string().optional(),
      quantization: z.number().int().positive().optional(),
      rollup: z.string().optional(),
    },
    handler: async (client, { query, from, to, rowId, quantization, rollup }) =>
      queryMetrics(client, {
        query: query as string,
        from: from as string | undefined,
        to: to as string | undefined,
        rowId: rowId as string | undefined,
        quantization: quantization as number | undefined,
        rollup: rollup as string | undefined,
      }),
  },
];
