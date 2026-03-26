import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { brandUsers, passwordHistory } from '@/lib/db/schema';
import { apiResponse } from '@/lib/utils/response';
import { validateInvitation, acceptInvitation } from '@/lib/auth/invitation';
import { validatePasswordStrength } from '@/lib/auth/password-policy';
import { sanitizeObject } from '@/lib/security/sanitize';
import { getClientIP } from '@/lib/utils/geo';
import { applyRateLimit } from '@/lib/security/rate-limit';

const acceptSchema = z.object({
  token:    z.string().min(32),
  name:     z.string().min(2).max(100).trim(),
  password: z.string().min(12).max(128),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const block = await applyRateLimit(req, `invite:${ip}`, 5, 3600);
  if (block) return block;

  let body: unknown;
  try {
    body = sanitizeObject(await req.json());
  } catch {
    return apiResponse.badRequest('Invalid JSON');
  }

  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { token, name, password } = parsed.data;

  const result = await validateInvitation(token);
  if (!result.valid || !result.invitation) {
    return apiResponse.badRequest('Invalid or expired invitation');
  }

  const { invitation } = result;

  const passwordCheck = validatePasswordStrength(password, [invitation.email, name]);
  if (!passwordCheck.valid) return apiResponse.badRequest(passwordCheck.reason!);

  const hash = await bcrypt.hash(password, 12);

  const [user] = await db.insert(brandUsers).values({
    brandId:           invitation.brandId,
    email:             invitation.email,
    name,
    passwordHash:      hash,
    role:              invitation.role ?? 'viewer',
    emailVerified:     true,
    passwordChangedAt: new Date(),
    invitedBy:         invitation.invitedBy,
    invitedAt:         invitation.createdAt,
    acceptedAt:        new Date(),
  }).returning();

  await db.insert(passwordHistory).values({
    userId:       user.id,
    passwordHash: hash,
  });

  await acceptInvitation(token, user.id);

  return apiResponse.created({
    message: 'Account created. You can now log in.',
    userId:  user.id,
  });
}
