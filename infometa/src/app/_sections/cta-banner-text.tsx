'use client';

import { usePlatformStats } from '@/hooks/use-platform-stats';

export function CTABannerText() {
  const { stats, formatStat } = usePlatformStats();
  const brandCount = stats ? formatStat(stats.totalBrands) : '…';

  return (
    <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
      Join {brandCount} brands using Infometa to fight counterfeiting, protect
      consumers, and build trust — with real-time QR-based product authentication.
    </p>
  );
}
