import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { brandUsers, passwordHistory } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { validateSession, revokeAllSessions } from '@/lib/auth/session';
import { validatePasswordStrength } from '@/lib/auth/password-policy';
import { writeAuditLog, SecurityEvents } from '@/lib/security/audit';
import { getClientIP } from '@/lib/utils/geo';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(12).max(128),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get('infometa-session')?.value
    ?? req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { currentPassword, newPassword } = parsed.data;

  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.id, session.userId!),
  });
  if (!user || !user.passwordHash) return apiResponse.unauthorized('Invalid user');

  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return apiResponse.unauthorized('Current password is incorrect');

  // Validate new password strength
  const check = validatePasswordStrength(newPassword, [user.email, user.name]);
  if (!check.valid) return apiResponse.badRequest(check.reason!);

  // Check password history (last 5)
  const history = await db.query.passwordHistory.findMany({
    where: eq(passwordHistory.userId, user.id),
    orderBy: [desc(passwordHistory.createdAt)],
    limit: 5,
  });

  for (const entry of history) {
    if (await bcrypt.compare(newPassword, entry.passwordHash)) {
      return apiResponse.badRequest('Cannot reuse a recent password');
    }
  }

  const hash = await bcrypt.hash(newPassword, 12);

  await db.update(brandUsers)
    .set({
      passwordHash:       hash,
      passwordChangedAt:  new Date(),
      mustChangePassword: false,
    })
    .where(eq(brandUsers.id, user.id));

  await db.insert(passwordHistory).values({
    userId:       user.id,
    passwordHash: hash,
  });

  await writeAuditLog({
    userId: user.id, brandId: session.brandId,
    action: SecurityEvents.PASSWORD_CHANGED,
    entity: 'brand_user', entityId: user.id,
    ipAddress: getClientIP(req),
  });

  // Revoke all existing sessions — user must re-login with new password
  await revokeAllSessions(user.id);

  return apiResponse.success({ message: 'Password changed successfully. Please log in again.' });
}
