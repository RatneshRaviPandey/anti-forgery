import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { scans } from '@/lib/db/schema';
import { eq, and, desc, count, gte, lte } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const result = searchParams.get('result');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const conditions = [eq(scans.brandId, brandId)];
  if (result && ['authentic', 'suspicious', 'invalid'].includes(result)) {
    conditions.push(eq(scans.resultStatus, result as 'authentic' | 'suspicious' | 'invalid'));
  }
  if (from) conditions.push(gte(scans.scannedAt, new Date(from)));
  if (to) conditions.push(lte(scans.scannedAt, new Date(to)));

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.select().from(scans).where(where).orderBy(desc(scans.scannedAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: count() }).from(scans).where(where),
  ]);

  return apiResponse.paginated(data, { page, limit, total: totalResult[0].count });
}
