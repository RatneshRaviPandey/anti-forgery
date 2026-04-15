import { db } from '@/lib/db';
import { brands, scans, products } from '@/lib/db/schema';
import { count, gte, sql } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';

// Cache in-memory for 10 minutes (public endpoint, no auth needed)
let cachedStats: { data: Record<string, unknown>; expiresAt: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  const now = Date.now();

  // Return cached if fresh
  if (cachedStats && cachedStats.expiresAt > now) {
    return apiResponse.success(cachedStats.data);
  }

  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalBrands,
    totalScans,
    recentScans,
    totalProducts,
  ] = await Promise.all([
    db.select({ count: count() }).from(brands),
    db.select({ count: count() }).from(scans),
    db.select({ count: count() }).from(scans).where(gte(scans.scannedAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(products),
  ]);

  // Industries count from enum (static — 12 supported)
  const industriesCovered = 12;

  const data = {
    totalVerifications: totalScans[0].count,
    monthlyVerifications: recentScans[0].count,
    totalBrands: totalBrands[0].count,
    totalProducts: totalProducts[0].count,
    industriesCovered,
    uptimePercent: 99.99,
  };

  cachedStats = { data, expiresAt: now + CACHE_TTL };

  return apiResponse.success(data);
}
