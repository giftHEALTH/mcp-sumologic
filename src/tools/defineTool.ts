import { z } from 'zod';
import type { SumoClient } from '@/sumologic/http.js';

export interface ToolDef<S extends z.ZodRawShape> {
  name: string;
  description: string;
  schema: S;
  handler: (
    client: SumoClient,
    args: z.infer<z.ZodObject<S>>,
  ) => Promise<unknown>;
}

export function defineTool<S extends z.ZodRawShape>(
  def: ToolDef<S>,
): ToolDef<S> {
  return def;
}

export type AnyToolDef = ToolDef<z.ZodRawShape>;
