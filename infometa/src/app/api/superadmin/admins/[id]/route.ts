import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brandUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireSuperAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  // Prevent self-deactivation
  if (id === session?.userId && body.isActive === false) {
    return apiResponse.badRequest('Cannot deactivate your own account');
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;
  if (typeof body.isSuperAdmin === 'boolean') updates.isSuperAdmin = body.isSuperAdmin;

  const [updated] = await db.update(brandUsers)
    .set(updates)
    .where(eq(brandUsers.id, id))
    .returning();

  if (!updated) return apiResponse.notFound('Admin not found');
  return apiResponse.success(updated);
}
