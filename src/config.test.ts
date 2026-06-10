import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '@/config.js';

describe('loadConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('applies defaults when env vars are missing', () => {
    const config = loadConfig({});

    expect(config).toEqual({
      endpoint: 'https://api.us2.sumologic.com/api/v1',
      sumoApiId: '',
      sumoApiKey: '',
      port: 3006,
      searchTimeZone: 'Asia/Hong_Kong',
      defaultLimit: 100,
    });
  });

  it('coerces numeric env vars', () => {
    const config = loadConfig({
      PORT: '4000',
      DEFAULT_LIMIT: '250',
      SUMO_API_ID: 'id',
      SUMO_API_KEY: 'key',
    });

    expect(config.port).toBe(4000);
    expect(config.defaultLimit).toBe(250);
  });

  it('warns when credentials are missing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    loadConfig({});

    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: SUMO_API_ID and/or SUMO_API_KEY not set — API calls will fail',
    );
  });

  it('does not warn when credentials are present', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    loadConfig({
      SUMO_API_ID: 'id',
      SUMO_API_KEY: 'key',
    });

    expect(errorSpy).not.toHaveBeenCalled();
  });
});
