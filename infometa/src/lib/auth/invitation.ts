import { randomBytes, createHash } from 'crypto';
import { db } from '@/lib/db';
import { invitations, brandUsers } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { addHours } from 'date-fns';

const INVITE_EXPIRES_HOURS = 48;

export async function createInvitation({
  brandId, invitedByUserId, email, role,
}: {
  brandId:         string;
  invitedByUserId: string;
  email:           string;
  role:            'owner' | 'admin' | 'viewer';
}): Promise<{ token: string; expiresAt: Date }> {
  // Check if user already exists in this brand
  const existing = await db.query.brandUsers.findFirst({
    where: and(eq(brandUsers.email, email), eq(brandUsers.brandId, brandId)),
  });
  if (existing) throw new Error('User is already a member of this brand');

  const rawToken   = randomBytes(32).toString('hex');
  const tokenHash  = createHash('sha256').update(rawToken).digest('hex');
  const expiresAt  = addHours(new Date(), INVITE_EXPIRES_HOURS);

  await db.insert(invitations).values({
    brandId,
    invitedBy: invitedByUserId,
    email,
    role,
    token: tokenHash,
    tokenExpiresAt: expiresAt,
  });

  return { token: rawToken, expiresAt };
}

export async function validateInvitation(rawToken: string): Promise<{
  valid: boolean;
  invitation?: typeof invitations.$inferSelect;
}> {
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const invite = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.token, tokenHash),
      isNull(invitations.acceptedAt),
      isNull(invitations.revokedAt),
    ),
  });

  if (!invite) return { valid: false };
  if (invite.tokenExpiresAt < new Date()) return { valid: false };

  return { valid: true, invitation: invite };
}

export async function acceptInvitation(rawToken: string, userId: string): Promise<void> {
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  await db.update(invitations)
    .set({ acceptedAt: new Date() })
    .where(eq(invitations.token, tokenHash));
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  await db.update(invitations)
    .set({ revokedAt: new Date() })
    .where(eq(invitations.id, invitationId));
}
