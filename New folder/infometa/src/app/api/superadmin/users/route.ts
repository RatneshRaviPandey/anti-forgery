import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brandUsers, brands } from '@/lib/db/schema';
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
  const brandId = searchParams.get('brandId');

  const conditions = [];
  if (search) conditions.push(ilike(brandUsers.email, `%${search}%`));
  if (brandId) conditions.push(eq(brandUsers.brandId, brandId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db.select({
      id:            brandUsers.id,
      email:         brandUsers.email,
      name:          brandUsers.name,
      role:          brandUsers.role,
      isActive:      brandUsers.isActive,
      isSuperAdmin:  brandUsers.isSuperAdmin,
      brandId:       brandUsers.brandId,
      lastLoginAt:   brandUsers.lastLoginAt,
      lastLoginIp:   brandUsers.lastLoginIp,
      emailVerified: brandUsers.emailVerified,
      mfaEnabled:    brandUsers.mfaEnabled,
      failedAttempts: brandUsers.failedAttempts,
      lockedUntil:   brandUsers.lockedUntil,
      createdAt:     brandUsers.createdAt,
    }).from(brandUsers)
      .where(where)
      .orderBy(desc(brandUsers.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: count() }).from(brandUsers).where(where),
  ]);

  // Enrich with brand name
  const enriched = await Promise.all(data.map(async (user) => {
    let brandName = null;
    if (user.brandId) {
      const brand = await db.query.brands.findFirst({
        where: eq(brands.id, user.brandId),
        columns: { name: true },
      });
      brandName = brand?.name ?? null;
    }
    return { ...user, brandName };
  }));

  return apiResponse.paginated(enriched, { page, limit, total: totalResult[0].count });
}
