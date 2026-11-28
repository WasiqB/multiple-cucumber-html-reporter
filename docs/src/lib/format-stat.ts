export interface ProjectStatSnapshot {
  stars: number;
  dependents: number;
  monthlyDownloads: number;
  weeklyDownloads: number;
}

function formatCompact(value: number, divisor: number, suffix: string, nextSuffix?: string): string {
  const scaled = value / divisor;
  if (nextSuffix && scaled >= 999.5) return formatCompact(value, divisor * 1000, nextSuffix);

  const digits = scaled >= 9.95 ? 0 : 1;
  const rounded = digits === 0 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  if (digits === 1 && rounded >= 10) return `${Math.round(scaled)}${suffix}+`;

  const text = digits === 0 ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
  return `${text}${suffix}+`;
}

/** Compact marketing format: 290+, 6.3K+, 1.2M+. */
export function formatStatValue(value: number): string {
  const absolute = Math.max(0, Math.round(value));
  if (absolute >= 1_000_000) return formatCompact(absolute, 1_000_000, 'M');
  if (absolute >= 1_000) return formatCompact(absolute, 1_000, 'K', 'M');
  return `${absolute}+`;
}
