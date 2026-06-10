import { describe, expect, it } from 'vitest';
import {
  runTool,
  safeStringify,
  toolError,
  toolSuccess,
} from '@/tools/format.js';

describe('format', () => {
  it('safeStringify handles circular references', () => {
    const obj: Record<string, unknown> = { name: 'test' };
    obj.self = obj;

    expect(safeStringify(obj)).toContain('[Circular Reference]');
  });

  it('toolSuccess wraps JSON text content', () => {
    const result = toolSuccess({ ok: true });

    expect(result).toEqual({
      content: [{ type: 'text', text: '{\n  "ok": true\n}' }],
    });
  });

  it('toolError wraps error messages', () => {
    const result = toolError(new Error('boom'));

    expect(result).toEqual({
      content: [{ type: 'text', text: 'Error: boom' }],
    });
  });

  it('runTool returns success content', async () => {
    const result = await runTool(async () => ({ value: 1 }));

    expect(result.content[0].text).toBe('{\n  "value": 1\n}');
  });

  it('runTool returns error content on failure', async () => {
    const result = await runTool(async () => {
      throw new Error('failed');
    });

    expect(result.content[0].text).toBe('Error: failed');
  });
});
