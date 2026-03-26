import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { alerts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { id } = await params;

  const updated = await db.update(alerts)
    .set({
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: 'admin',
    })
    .where(and(eq(alerts.id, id), eq(alerts.brandId, brandId)))
    .returning();

  if (!updated.length) return apiResponse.notFound('Alert not found');
  return apiResponse.success(updated[0]);
}
