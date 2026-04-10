import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { brandUsers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { validateSession } from '@/lib/auth/session';
import { createInvitation } from '@/lib/auth/invitation';
import { writeAuditLog, SecurityEvents } from '@/lib/security/audit';
import { getClientIP } from '@/lib/utils/geo';

// GET: List team members for current brand
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  const members = await db.query.brandUsers.findMany({
    where: eq(brandUsers.brandId, session.brandId!),
    columns: {
      id: true, name: true, email: true, role: true, avatarUrl: true,
      isActive: true, lastLoginAt: true, createdAt: true, mfaEnabled: true,
    },
    orderBy: (u, { desc }) => [desc(u.createdAt)],
  });

  return apiResponse.success(members);
}

// POST: Invite a new team member
const inviteSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name:  z.string().min(2).max(100).trim(),
  role:  z.enum(['admin', 'viewer']),
});

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  // Only owners and admins can invite
  if (session.role !== 'owner' && session.role !== 'admin') {
    return apiResponse.forbidden('Only owners and admins can invite team members');
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { email, name, role } = parsed.data;

  try {
    const invite = await createInvitation({
      brandId:         session.brandId!,
      invitedByUserId: session.userId!,
      email,
      role,
    });

    await writeAuditLog({
      userId: session.userId, brandId: session.brandId,
      action: SecurityEvents.TEAM_MEMBER_INVITED,
      entity: 'invitation', entityId: email,
      ipAddress: getClientIP(req),
      after: { email, role },
    });

    return apiResponse.created({
      message:   `Invitation sent to ${email}`,
      expiresAt: invite.expiresAt.toISOString(),
      // In production, send invite via email. For now, return token for dev.
      inviteToken: invite.token,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create invitation';
    return apiResponse.badRequest(message);
  }
}
