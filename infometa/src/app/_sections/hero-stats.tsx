'use client';

import { usePlatformStats } from '@/hooks/use-platform-stats';

export function HeroLiveBadge() {
  const { stats, formatStat } = usePlatformStats();
  const label = stats
    ? `Live — ${formatStat(stats.monthlyVerifications)} verifications this month`
    : 'Live — verifications this month';

  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      {label}
    </div>
  );
}

export function HeroStatsRow() {
  const { stats, formatStat } = usePlatformStats();

  const items = [
    { label: 'verifications', value: stats ? formatStat(stats.totalVerifications) : '—' },
    { label: 'brands', value: stats ? formatStat(stats.totalBrands) : '—' },
    { label: 'uptime', value: stats ? `${stats.uptimePercent}%` : '—' },
  ];

  return (
    <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/70">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          {item.value} {item.label}
        </span>
      ))}
    </div>
  );
}
