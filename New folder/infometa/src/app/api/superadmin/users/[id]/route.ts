import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { brandUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';
import { revokeAllSessions } from '@/lib/auth/session';

const updateSchema = z.object({
  isActive:   z.boolean().optional(),
  role:       z.enum(['owner', 'admin', 'viewer']).optional(),
  lockedUntil: z.literal(null).optional(),
  failedAttempts: z.literal(0).optional(),
  resetPassword: z.string().min(12).max(128).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { id } = await params;
  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.id, id),
    columns: {
      passwordHash: false,
      mfaSecret: false,
    },
  });
  if (!user) return apiResponse.notFound('User not found');

  return apiResponse.success(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.role) updates.role = parsed.data.role;
  if (parsed.data.lockedUntil === null) {
    updates.lockedUntil = null;
    updates.failedAttempts = 0;
  }
  if (parsed.data.resetPassword) {
    updates.passwordHash = await bcrypt.hash(parsed.data.resetPassword, 12);
    updates.mustChangePassword = true;
    updates.passwordChangedAt = new Date();
    // Revoke all sessions so they must re-login
    await revokeAllSessions(id);
  }

  const [updated] = await db.update(brandUsers)
    .set(updates)
    .where(eq(brandUsers.id, id))
    .returning();

  if (!updated) return apiResponse.notFound('User not found');
  return apiResponse.success({
    id: updated.id, email: updated.email, name: updated.name,
    role: updated.role, isActive: updated.isActive,
  });
}
