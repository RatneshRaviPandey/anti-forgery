import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { alerts } from '@/lib/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';

const alertCreateSchema = z.object({
  token: z.string().optional(),
  productId: z.string().uuid().optional(),
  type: z.enum(['duplicate_scan', 'geo_anomaly', 'scan_spike', 'recall', 'deactivated_use']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  details: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const resolved = searchParams.get('resolved');

  const conditions = [eq(alerts.brandId, brandId)];
  if (resolved === 'true') conditions.push(eq(alerts.resolved, true));
  if (resolved === 'false') conditions.push(eq(alerts.resolved, false));

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.select().from(alerts).where(where).orderBy(desc(alerts.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: count() }).from(alerts).where(where),
  ]);

  return apiResponse.paginated(data, { page, limit, total: totalResult[0].count });
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const body = await req.json();

  const parsed = alertCreateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const alert = await db.insert(alerts).values({
    ...parsed.data,
    brandId,
  }).returning();

  return apiResponse.created(alert[0]);
}
