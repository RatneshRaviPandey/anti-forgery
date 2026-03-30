import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { batches, products } from '@/lib/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { batchCreateSchema } from '@/lib/validations/batch.schema';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));

  const where = eq(batches.brandId, brandId);

  const [data, totalResult] = await Promise.all([
    db.select().from(batches).where(where).orderBy(desc(batches.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: count() }).from(batches).where(where),
  ]);

  return apiResponse.paginated(data, { page, limit, total: totalResult[0].count });
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const body = await req.json();

  const parsed = batchCreateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  // Verify product belongs to brand
  const product = await db.query.products.findFirst({
    where: and(eq(products.id, parsed.data.productId), eq(products.brandId, brandId)),
  });
  if (!product) return apiResponse.badRequest('Product not found or does not belong to your brand');

  const batch = await db.insert(batches).values({
    ...parsed.data,
    brandId,
  }).returning();

  return apiResponse.created(batch[0]);
}
