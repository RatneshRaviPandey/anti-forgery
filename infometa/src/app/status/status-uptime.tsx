'use client';

import { usePlatformStats } from '@/hooks/use-platform-stats';

export function StatusUptime() {
  const { stats } = usePlatformStats();

  return (
    <div className="mb-8 text-center">
      <p className="text-3xl font-bold text-foreground">
        {stats ? `${stats.uptimePercent}%` : '—'}
      </p>
      <p className="text-secondary">Uptime over the last 90 days</p>
    </div>
  );
}
