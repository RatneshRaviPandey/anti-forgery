import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands, brandUsers, products, batches } from '@/lib/db/schema';
import { eq, desc, count, ilike, and } from 'drizzle-orm';
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

  // Enrich with user count and product count per brand
  const enriched = await Promise.all(data.map(async (brand) => {
    const [userCount, productCount, batchCount] = await Promise.all([
      db.select({ count: count() }).from(brandUsers).where(eq(brandUsers.brandId, brand.id)),
      db.select({ count: count() }).from(products).where(eq(products.brandId, brand.id)),
      db.select({ count: count() }).from(batches).where(eq(batches.brandId, brand.id)),
    ]);
    return {
      ...brand,
      _userCount: userCount[0].count,
      _productCount: productCount[0].count,
      _batchCount: batchCount[0].count,
    };
  }));

  return apiResponse.paginated(enriched, { page, limit, total: totalResult[0].count });
}
