import type { z } from 'zod';
import type { Client } from '@/lib/sumologic/client.js';

export type ToolSchema = Record<string, z.ZodTypeAny>;

export interface ToolDefinition {
  name: string;
  description: string;
  schema: ToolSchema;
  handler: (client: Client, args: Record<string, unknown>) => Promise<unknown>;
}
