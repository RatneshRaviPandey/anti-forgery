import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brandKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

// PUT /api/superadmin/brand-keys/[id] — Revoke a brand key
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  if (body.action === 'revoke') {
    const [updated] = await db.update(brandKeys)
      .set({ isActive: false, revokedAt: new Date() })
      .where(eq(brandKeys.id, id))
      .returning();

    if (!updated) return apiResponse.notFound('Key not found');
    return apiResponse.success({ message: 'Key revoked', keyId: updated.keyId });
  }

  return apiResponse.badRequest('Unknown action');
}

// DELETE /api/superadmin/brand-keys/[id] — Not supported (keys are only revoked)
export async function DELETE() {
  return apiResponse.badRequest('Brand keys cannot be deleted, only revoked.');
}
