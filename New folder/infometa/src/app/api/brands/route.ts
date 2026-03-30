import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands } from '@/lib/db/schema';
import { desc, count, ilike, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { brandCreateSchema } from '@/lib/validations/brand.schema';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const search = searchParams.get('search');

  const conditions = [];
  if (search) conditions.push(ilike(brands.name, `%${search}%`));
  const where = conditions.length ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db.select().from(brands).where(where).orderBy(desc(brands.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: count() }).from(brands).where(where),
  ]);

  return apiResponse.paginated(data, { page, limit, total: totalResult[0].count });
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const parsed = brandCreateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const brand = await db.insert(brands).values(parsed.data).returning();
  return apiResponse.created(brand[0]);
}
