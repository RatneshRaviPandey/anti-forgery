import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brandUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { validateSession } from '@/lib/auth/session';
import { generateMFASecret, verifyTOTP } from '@/lib/auth/mfa';
import { writeAuditLog, SecurityEvents } from '@/lib/security/audit';
import { getClientIP } from '@/lib/utils/geo';
import { z } from 'zod';

// GET: Generate MFA secret + QR URL for setup
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.id, session.userId!),
  });
  if (!user) return apiResponse.unauthorized('User not found');

  if (user.mfaEnabled) return apiResponse.badRequest('MFA is already enabled');

  const brand = await db.query.brands.findFirst({
    where: eq(require('@/lib/db/schema').brands.id, session.brandId!),
  });

  const mfa = await generateMFASecret(user.email, brand?.name ?? 'Infometa');

  // Store encrypted secret temporarily (not yet verified)
  await db.update(brandUsers)
    .set({ mfaSecret: mfa.encryptedSecret })
    .where(eq(brandUsers.id, user.id));

  return apiResponse.success({
    otpauthUrl:  mfa.otpauthUrl,
    secret:      mfa.secret,
    backupCodes: mfa.backupCodes,
  });
}

// POST: Verify TOTP code to confirm MFA setup
const confirmSchema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  const body = await req.json();
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.id, session.userId!),
  });
  if (!user || !user.mfaSecret) return apiResponse.badRequest('MFA setup not initiated');

  const valid = await verifyTOTP(user.mfaSecret, parsed.data.code);
  if (!valid) return apiResponse.badRequest('Invalid MFA code. Try again.');

  await db.update(brandUsers)
    .set({ mfaEnabled: true })
    .where(eq(brandUsers.id, user.id));

  await writeAuditLog({
    userId: user.id, brandId: session.brandId,
    action: SecurityEvents.MFA_ENABLED,
    entity: 'brand_user', entityId: user.id,
    ipAddress: getClientIP(req),
  });

  return apiResponse.success({ message: 'MFA enabled successfully' });
}

// DELETE: Disable MFA
export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  await db.update(brandUsers)
    .set({ mfaEnabled: false, mfaSecret: null })
    .where(eq(brandUsers.id, session.userId!));

  await writeAuditLog({
    userId: session.userId, brandId: session.brandId,
    action: SecurityEvents.MFA_DISABLED,
    entity: 'brand_user', entityId: session.userId,
    ipAddress: getClientIP(req),
  });

  return apiResponse.success({ message: 'MFA disabled' });
}
