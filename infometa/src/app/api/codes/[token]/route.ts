import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { qrCodes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { token } = await params;

  const code = await db.query.qrCodes.findFirst({
    where: and(eq(qrCodes.token, token), eq(qrCodes.brandId, brandId)),
    with: { product: true, batch: true },
  });

  if (!code) return apiResponse.notFound('Code not found');
  return apiResponse.success(code);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { token } = await params;
  const body = await req.json();

  if (body.action === 'deactivate') {
    const updated = await db.update(qrCodes)
      .set({
        status: 'deactivated',
        deactivatedAt: new Date(),
        deactivatedBy: 'admin',
      })
      .where(and(eq(qrCodes.token, token), eq(qrCodes.brandId, brandId)))
      .returning();

    if (!updated.length) return apiResponse.notFound('Code not found');
    return apiResponse.success(updated[0]);
  }

  return apiResponse.badRequest('Invalid action. Supported: deactivate');
}
