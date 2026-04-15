'use client';

import { useEffect, useState } from 'react';

export interface PlatformStats {
  totalVerifications: number;
  monthlyVerifications: number;
  totalBrands: number;
  totalProducts: number;
  industriesCovered: number;
  uptimePercent: number;
}

// Module-level cache — shared across all components using this hook in a single page load
let cached: { data: PlatformStats; fetchedAt: number } | null = null;
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K+`;
  if (n === 0) return '0';
  return `${n}+`;
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(cached?.data ?? null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached && Date.now() - cached.fetchedAt < CLIENT_CACHE_TTL) {
      setStats(cached.data);
      setLoading(false);
      return;
    }

    fetch('/api/stats')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          cached = { data: res.data, fetchedAt: Date.now() };
          setStats(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, formatStat };
}
