function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatLocalIso(date: Date): string {
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(
      '-',
    ) +
    'T' +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(
      ':',
    )
  );
}

export function defaultTimeRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return {
    from: formatLocalIso(from),
    to: formatLocalIso(to),
  };
}

export function resolveTimeRange(timeRange?: { from?: string; to?: string }): {
  from: string;
  to: string;
} {
  const defaults = defaultTimeRange();
  return {
    from: timeRange?.from ?? defaults.from,
    to: timeRange?.to ?? defaults.to,
  };
}
