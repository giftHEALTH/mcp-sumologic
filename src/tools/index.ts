import { contentTools } from '@/tools/contentTools.js';
import { metadataTools } from '@/tools/metadataTools.js';
import { metricsTools } from '@/tools/metricsTools.js';
import { monitorsTools } from '@/tools/monitorsTools.js';
import { searchTools } from '@/tools/searchTools.js';
import type { ToolDefinition } from '@/tools/types.js';

export const allTools: ToolDefinition[] = [
  ...searchTools,
  ...metadataTools,
  ...metricsTools,
  ...monitorsTools,
  ...contentTools,
];

export const toolNames = allTools.map((tool) => tool.name);

export * from '@/tools/types.js';
