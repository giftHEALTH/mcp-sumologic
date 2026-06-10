export function safeStringify(obj: unknown): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    },
    2,
  );
}

export function toolSuccess(result: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: safeStringify(result),
      },
    ],
  };
}

export function toolError(err: unknown) {
  const error = err instanceof Error ? err : new Error('Unknown error');
  return {
    content: [
      {
        type: 'text' as const,
        text: `Error: ${error.message}`,
      },
    ],
  };
}

export async function runTool<T>(
  handler: () => Promise<T>,
): Promise<ReturnType<typeof toolSuccess>> {
  try {
    return toolSuccess(await handler());
  } catch (err) {
    return toolError(err);
  }
}
