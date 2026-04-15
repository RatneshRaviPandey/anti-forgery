import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands, brandUsers, products, batches, scans, alerts } from '@/lib/db/schema';
import { eq, desc, count, ilike, and, sql, inArray, gte } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  const conditions = [];
  if (search) conditions.push(ilike(brands.name, `%${search}%`));
  if (status) conditions.push(eq(brands.status, status as 'active' | 'trial' | 'suspended' | 'churned' | 'pending_verification'));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db.select().from(brands)
      .where(where)
      .orderBy(desc(brands.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: count() }).from(brands).where(where),
  ]);

  // Enrich with counts using subqueries (single query, no N+1)
  const brandIds = data.map(b => b.id);
  if (brandIds.length === 0) {
    return apiResponse.paginated([], { page, limit, total: totalResult[0].count });
  }

  const [userCounts, productCounts, batchCounts, scanCounts, alertCounts, authenticCounts] = await Promise.all([
    db.select({ brandId: brandUsers.brandId, count: count() })
      .from(brandUsers)
      .where(inArray(brandUsers.brandId, brandIds))
      .groupBy(brandUsers.brandId),
    db.select({ brandId: products.brandId, count: count() })
      .from(products)
      .where(inArray(products.brandId, brandIds))
      .groupBy(products.brandId),
    db.select({ brandId: batches.brandId, count: count() })
      .from(batches)
      .where(inArray(batches.brandId, brandIds))
      .groupBy(batches.brandId),
    db.select({ brandId: scans.brandId, count: count() })
      .from(scans)
      .where(inArray(scans.brandId, brandIds))
      .groupBy(scans.brandId),
    db.select({ brandId: alerts.brandId, count: count() })
      .from(alerts)
      .where(and(inArray(alerts.brandId, brandIds), eq(alerts.resolved, false)))
      .groupBy(alerts.brandId),
    db.select({ brandId: scans.brandId, count: count() })
      .from(scans)
      .where(and(inArray(scans.brandId, brandIds), eq(scans.resultStatus, 'authentic')))
      .groupBy(scans.brandId),
  ]);

  const ucMap = Object.fromEntries(userCounts.map(r => [r.brandId, r.count]));
  const pcMap = Object.fromEntries(productCounts.map(r => [r.brandId, r.count]));
  const bcMap = Object.fromEntries(batchCounts.map(r => [r.brandId, r.count]));
  const scMap = Object.fromEntries(scanCounts.map(r => [r.brandId, r.count]));
  const alMap = Object.fromEntries(alertCounts.map(r => [r.brandId, r.count]));
  const auMap = Object.fromEntries(authenticCounts.map(r => [r.brandId, r.count]));

  const enriched = data.map(brand => {
    const scanTotal = scMap[brand.id] ?? 0;
    const authCount = auMap[brand.id] ?? 0;
    const alertCount = alMap[brand.id] ?? 0;
    const productCount = pcMap[brand.id] ?? 0;
    const authRate = scanTotal > 0 ? Math.round((authCount / scanTotal) * 100) : 0;

    // Health Score (0-100)
    let health = 50; // base
    if (brand.status === 'active') health += 15;
    else if (brand.status === 'trial') health += 5;
    if (productCount > 0) health += 10;
    if (scanTotal > 0) health += 10;
    if (authRate >= 95) health += 10;
    else if (authRate >= 80) health += 5;
    if (alertCount === 0) health += 5;
    else if (alertCount > 5) health -= 10;
    if (brand.lastLoginAt && new Date(brand.lastLoginAt).getTime() > Date.now() - 7 * 86400000) health += 5;
    health = Math.max(0, Math.min(100, health));

    return {
      ...brand,
      _userCount: ucMap[brand.id] ?? 0,
      _productCount: productCount,
      _batchCount: bcMap[brand.id] ?? 0,
      _scanCount: scanTotal,
      _activeAlerts: alertCount,
      _authRate: authRate,
      _healthScore: health,
    };
  });

  return apiResponse.paginated(enriched, { page, limit, total: totalResult[0].count });
}
