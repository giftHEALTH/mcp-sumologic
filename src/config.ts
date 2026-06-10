import { z } from 'zod';

const envSchema = z.object({
  ENDPOINT: z.string().default('https://api.us2.sumologic.com/api/v1'),
  SUMO_API_ID: z.string().default(''),
  SUMO_API_KEY: z.string().default(''),
  PORT: z.coerce.number().default(3006),
  SEARCH_TIME_ZONE: z.string().default('Asia/Hong_Kong'),
  DEFAULT_LIMIT: z.coerce.number().default(100),
});

export type AppConfig = {
  endpoint: string;
  sumoApiId: string;
  sumoApiKey: string;
  port: number;
  searchTimeZone: string;
  defaultLimit: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse(env);

  if (!parsed.SUMO_API_ID || !parsed.SUMO_API_KEY) {
    console.error(
      'Warning: SUMO_API_ID and/or SUMO_API_KEY not set — API calls will fail',
    );
  }

  return {
    endpoint: parsed.ENDPOINT,
    sumoApiId: parsed.SUMO_API_ID,
    sumoApiKey: parsed.SUMO_API_KEY,
    port: parsed.PORT,
    searchTimeZone: parsed.SEARCH_TIME_ZONE,
    defaultLimit: parsed.DEFAULT_LIMIT,
  };
}
