import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { eq, and, desc, count, ilike } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const batchId = searchParams.get('batchId');
  const status = searchParams.get('status');

  const conditions = [eq(qrCodes.brandId, brandId)];
  if (batchId) conditions.push(eq(qrCodes.batchId, batchId));
  if (status && ['active', 'suspicious', 'deactivated'].includes(status)) {
    conditions.push(eq(qrCodes.status, status as 'active' | 'suspicious' | 'deactivated'));
  }

  const where = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.select().from(qrCodes).where(where).orderBy(desc(qrCodes.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select({ count: count() }).from(qrCodes).where(where),
  ]);

  return apiResponse.paginated(data, { page, limit, total: totalResult[0].count });
}
