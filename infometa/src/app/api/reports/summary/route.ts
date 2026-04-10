import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { scans, qrCodes, alerts, products, batches, brands } from '@/lib/db/schema';
import { eq, and, count, sql, gte } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { redis } from '@/lib/redis';
import { REDIS_KEYS, TTL } from '@/lib/redis/keys';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);

  // Check Redis cache
  if (redis) {
    const cached = await redis.get(`${REDIS_KEYS.dashboardKpis(brandId)}`);
    if (cached) return apiResponse.success(cached);
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    totalBatches,
    totalCodes,
    activeCodes,
    totalScans,
    recentScans,
    authenticScans,
    suspiciousScans,
    invalidScans,
    openAlerts,
    dailyScans,
  ] = await Promise.all([
    db.select({ count: count() }).from(products).where(eq(products.brandId, brandId)),
    db.select({ count: count() }).from(batches).where(eq(batches.brandId, brandId)),
    db.select({ count: count() }).from(qrCodes).where(eq(qrCodes.brandId, brandId)),
    db.select({ count: count() }).from(qrCodes).where(and(eq(qrCodes.brandId, brandId), eq(qrCodes.status, 'active'))),
    db.select({ count: count() }).from(scans).where(eq(scans.brandId, brandId)),
    db.select({ count: count() }).from(scans).where(and(eq(scans.brandId, brandId), gte(scans.scannedAt, thirtyDaysAgo))),
    db.select({ count: count() }).from(scans).where(and(eq(scans.brandId, brandId), eq(scans.resultStatus, 'authentic'))),
    db.select({ count: count() }).from(scans).where(and(eq(scans.brandId, brandId), eq(scans.resultStatus, 'suspicious'))),
    db.select({ count: count() }).from(scans).where(and(eq(scans.brandId, brandId), eq(scans.resultStatus, 'invalid'))),
    db.select({ count: count() }).from(alerts).where(and(eq(alerts.brandId, brandId), eq(alerts.resolved, false))),
    db.select({
      date: sql<string>`DATE(${scans.scannedAt})`,
      count: count(),
    })
      .from(scans)
      .where(and(eq(scans.brandId, brandId), gte(scans.scannedAt, sevenDaysAgo)))
      .groupBy(sql`DATE(${scans.scannedAt})`)
      .orderBy(sql`DATE(${scans.scannedAt})`),
  ]);

  const summary = {
    products: totalProducts[0].count,
    batches: totalBatches[0].count,
    totalCodes: totalCodes[0].count,
    activeCodes: activeCodes[0].count,
    totalScans: totalScans[0].count,
    recentScans: recentScans[0].count,
    authenticScans: authenticScans[0].count,
    suspiciousScans: suspiciousScans[0].count,
    invalidScans: invalidScans[0].count,
    openAlerts: openAlerts[0].count,
    authenticRate: totalScans[0].count > 0
      ? Math.round((authenticScans[0].count / totalScans[0].count) * 100)
      : 0,
    dailyScans,
  };

  // Cache for 5 minutes
  if (redis) {
    await redis.set(`${REDIS_KEYS.dashboardKpis(brandId)}`, JSON.stringify(summary), { ex: TTL.DASHBOARD });
  }

  return apiResponse.success(summary);
}
