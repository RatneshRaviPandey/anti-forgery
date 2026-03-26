import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, and, ilike, desc, count } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { productCreateSchema } from '@/lib/validations/product.schema';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { searchParams } = new URL(req.url);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const search = searchParams.get('search');
  const industry = searchParams.get('industry');

  const conditions = [eq(products.brandId, brandId)];
  if (search) conditions.push(ilike(products.name, `%${search}%`));
  if (industry) conditions.push(eq(products.industry, industry as typeof products.industry.enumValues[number]));

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.select().from(products)
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: count() }).from(products).where(where),
  ]);

  return apiResponse.paginated(data, { page, limit, total: totalResult[0].count });
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const body = await req.json();

  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const product = await db.insert(products).values({
    ...parsed.data,
    brandId,
  }).returning();

  return apiResponse.created(product[0]);
}
