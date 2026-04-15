import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { brandUsers, loginAttempts } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';
import { verifyTOTP } from '@/lib/auth/mfa';
import { createSession } from '@/lib/auth/session';
import { writeAuditLog, SecurityEvents } from '@/lib/security/audit';
import { sanitizeObject } from '@/lib/security/sanitize';
import { getClientIP, getGeoFromIP } from '@/lib/utils/geo';
import { applyRateLimit } from '@/lib/security/rate-limit';

const loginSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(1).max(128),
  mfaCode:  z.string().length(6).optional(),
  remember: z.boolean().default(false),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES     = 30;

export async function POST(req: NextRequest) {
  const ip  = getClientIP(req);
  const geo = await getGeoFromIP(ip);

  // Rate limit: 10 login attempts per 15 min per IP
  const block = await applyRateLimit(req, `login:${ip}`, 10, 900);
  if (block) return block;

  let body: unknown;
  try {
    body = sanitizeObject(await req.json());
  } catch {
    return apiResponse.badRequest('Invalid JSON body');
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { email, password, mfaCode, remember } = parsed.data;

  // Find user
  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.email, email),
  });

  if (!user || !user.passwordHash) {
    await recordFailedAttempt(email, ip, 'user_not_found', req);
    await new Promise(r => setTimeout(r, 500));
    return apiResponse.unauthorized('Invalid email or password');
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return apiResponse.unauthorized(`Account locked. Try again in ${remainingMinutes} minutes.`);
  }

  if (!user.isActive) {
    return apiResponse.unauthorized('Account deactivated. Contact support.');
  }

  // Verify password
  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    await recordFailedAttempt(email, ip, 'invalid_password', req);

    const newFailedCount = (user.failedAttempts ?? 0) + 1;
    const shouldLock     = newFailedCount >= MAX_FAILED_ATTEMPTS;

    await db.update(brandUsers)
      .set({
        failedAttempts: newFailedCount,
        lockedUntil:    shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null,
      })
      .where(eq(brandUsers.id, user.id));

    if (shouldLock) {
      await writeAuditLog({
        userId: user.id, brandId: user.brandId!,
        action: SecurityEvents.ACCOUNT_LOCKED,
        entity: 'brand_user', entityId: user.id, ipAddress: ip,
      });
      return apiResponse.unauthorized(
        `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`
      );
    }

    return apiResponse.unauthorized('Invalid email or password');
  }

  // MFA check
  if (user.mfaEnabled && user.mfaSecret) {
    if (!mfaCode) {
      return NextResponse.json({
        success:     false,
        mfaRequired: true,
        message:     'MFA verification required',
      }, { status: 200 });
    }

    const mfaValid = await verifyTOTP(user.mfaSecret, mfaCode);
    if (!mfaValid) {
      await recordFailedAttempt(email, ip, 'invalid_mfa', req);
      return apiResponse.unauthorized('Invalid MFA code');
    }
  }

  // Reset failed attempts + update login info
  await db.update(brandUsers)
    .set({
      failedAttempts: 0,
      lockedUntil:    null,
      lastLoginAt:    new Date(),
      lastLoginIp:    ip,
      lastLoginCity:  geo?.city,
    })
    .where(eq(brandUsers.id, user.id));

  // Create session
  const session = await createSession({
    userId:      user.id,
    brandId:     user.brandId!,
    ip,
    userAgent:   req.headers.get('user-agent') ?? '',
    city:        geo?.city,
    country:     geo?.country,
    remember,
    mfaVerified: user.mfaEnabled ? true : false,
  });

  await recordSuccessAttempt(email, ip, req);

  await writeAuditLog({
    userId: user.id, brandId: user.brandId!,
    action: SecurityEvents.LOGIN_SUCCESS,
    entity: 'brand_user', entityId: user.id, ipAddress: ip,
    after:  { city: geo?.city, country: geo?.country },
  });

  // Build response with httpOnly secure cookie
  // Remember me: 7 days max (not 30), regular: 8 hours
  const maxAge = remember ? 7 * 86400 : 8 * 3600;
  const isSecure = process.env.NODE_ENV === 'production';

  const response = NextResponse.json({
    success: true,
    data: {
      expiresAt: session.expiresAt.toISOString(),
      sessionId: session.id,
      user: {
        id:                 user.id,
        name:               user.name,
        email:              user.email,
        role:               user.role,
        brandId:            user.brandId,
        mfaEnabled:         user.mfaEnabled,
        mustChangePassword: user.mustChangePassword,
        isSuperAdmin:       user.isSuperAdmin ?? false,
      },
    },
  });

  // Set httpOnly secure cookie — not accessible via JavaScript
  response.cookies.set('infometa-session', session.token, {
    httpOnly: true,
    secure:   isSecure,
    sameSite: 'strict',
    path:     '/',
    maxAge,
  });

  return response;
}

async function recordFailedAttempt(
  email: string, ip: string, reason: string, req: NextRequest,
): Promise<void> {
  await db.insert(loginAttempts).values({
    email, ipAddress: ip, success: false,
    failureReason: reason,
    userAgent: req.headers.get('user-agent') ?? '',
  }).catch(() => {});
}

async function recordSuccessAttempt(
  email: string, ip: string, req: NextRequest,
): Promise<void> {
  await db.insert(loginAttempts).values({
    email, ipAddress: ip, success: true,
    userAgent: req.headers.get('user-agent') ?? '',
  }).catch(() => {});
}
