import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { scans, qrCodes, products } from '@/lib/db/schema';
import { eq, and, count, sql, gte, desc } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') ?? '30d';

  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [scansByDay, scansByResult, scansByCity, topProducts] = await Promise.all([
    db.select({
      date: sql<string>`DATE(${scans.scannedAt})`,
      count: count(),
    })
      .from(scans)
      .where(and(eq(scans.brandId, brandId), gte(scans.scannedAt, since)))
      .groupBy(sql`DATE(${scans.scannedAt})`)
      .orderBy(sql`DATE(${scans.scannedAt})`),

    db.select({
      result: scans.resultStatus,
      count: count(),
    })
      .from(scans)
      .where(and(eq(scans.brandId, brandId), gte(scans.scannedAt, since)))
      .groupBy(scans.resultStatus),

    db.select({
      city: scans.city,
      count: count(),
    })
      .from(scans)
      .where(and(eq(scans.brandId, brandId), gte(scans.scannedAt, since)))
      .groupBy(scans.city)
      .orderBy(desc(count()))
      .limit(10),

    db.select({
      productId: scans.productId,
      count: count(),
    })
      .from(scans)
      .where(and(eq(scans.brandId, brandId), gte(scans.scannedAt, since)))
      .groupBy(scans.productId)
      .orderBy(desc(count()))
      .limit(10),
  ]);

  return apiResponse.success({
    period,
    scansByDay,
    scansByResult,
    scansByCity,
    topProducts,
  });
}
