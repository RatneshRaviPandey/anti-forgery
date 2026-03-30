import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands, brandUsers, products, batches, qrCodes, scans, alerts } from '@/lib/db/schema';
import { count, eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const [
    brandsCount,
    usersCount,
    productsCount,
    batchesCount,
    codesCount,
    scansCount,
    alertsCount,
    activeAlerts,
  ] = await Promise.all([
    db.select({ count: count() }).from(brands),
    db.select({ count: count() }).from(brandUsers),
    db.select({ count: count() }).from(products),
    db.select({ count: count() }).from(batches),
    db.select({ count: count() }).from(qrCodes),
    db.select({ count: count() }).from(scans),
    db.select({ count: count() }).from(alerts),
    db.select({ count: count() }).from(alerts).where(eq(alerts.resolved, false)),
  ]);

  return apiResponse.success({
    brands:       brandsCount[0].count,
    users:        usersCount[0].count,
    products:     productsCount[0].count,
    batches:      batchesCount[0].count,
    qrCodes:      codesCount[0].count,
    scans:        scansCount[0].count,
    alerts:       alertsCount[0].count,
    activeAlerts: activeAlerts[0].count,
  });
}
