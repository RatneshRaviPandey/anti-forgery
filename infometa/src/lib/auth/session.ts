import { randomBytes, createHash } from 'crypto';
import { db } from '@/lib/db';
import { sessions, brandUsers } from '@/lib/db/schema';
import { redis } from '@/lib/redis';
import { addDays, addHours } from 'date-fns';
import { eq, and } from 'drizzle-orm';

const SESSION_DURATION_HOURS = 8;
const SESSION_DURATION_DAYS  = 7;   // Max 7 days for "remember me" (compliance)
const MAX_SESSIONS_PER_USER  = 5;

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export async function createSession({
  userId, brandId, ip, userAgent,
  city, country, remember, mfaVerified,
}: {
  userId:      string;
  brandId:     string;
  ip:          string;
  userAgent:   string;
  city?:       string;
  country?:    string;
  remember:    boolean;
  mfaVerified: boolean;
}) {
  const rawToken     = randomBytes(48).toString('hex');
  const tokenHash    = hashToken(rawToken);
  const rawRefresh   = randomBytes(48).toString('hex');
  const refreshHash  = hashToken(rawRefresh);

  const expiresAt = remember
    ? addDays(new Date(), SESSION_DURATION_DAYS)
    : addHours(new Date(), SESSION_DURATION_HOURS);

  const deviceType = detectDevice(userAgent);

  // Enforce max sessions: remove oldest if exceeded
  const existing = await db.query.sessions.findMany({
    where: and(eq(sessions.userId, userId), eq(sessions.isActive, true)),
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  });

  if (existing.length >= MAX_SESSIONS_PER_USER) {
    const toRevoke = existing.slice(0, existing.length - MAX_SESSIONS_PER_USER + 1);
    for (const s of toRevoke) {
      await revokeSession(s.id);
    }
  }

  const [session] = await db.insert(sessions).values({
    userId,
    brandId,
    sessionToken: tokenHash,
    refreshToken: refreshHash,
    ipAddress:    ip,
    userAgent,
    city,
    country,
    deviceType,
    isActive:     true,
    mfaVerified,
    expiresAt,
  }).returning();

  // Optional Redis cache
  if (redis) {
    const ttl = remember ? SESSION_DURATION_DAYS * 86400 : SESSION_DURATION_HOURS * 3600;
    await redis.set(`session:${tokenHash}`, {
      userId, brandId, mfaVerified, expiresAt: expiresAt.toISOString(),
    }, { ex: ttl });
  }

  return { id: session.id, token: rawToken, refreshToken: rawRefresh, expiresAt };
}

export async function validateSession(rawToken: string): Promise<{
  valid:       boolean;
  userId?:     string;
  brandId?:    string;
  mfaVerified?: boolean;
  role?:       string;
  isSuperAdmin?: boolean;
}> {
  const tokenHash = hashToken(rawToken);

  // Check Redis cache first
  if (redis) {
    const cached = await redis.get<{
      userId: string; brandId: string; mfaVerified: boolean; expiresAt: string;
    }>(`session:${tokenHash}`);
    if (cached) {
      if (new Date(cached.expiresAt) < new Date()) {
        await redis.del(`session:${tokenHash}`);
        return { valid: false };
      }
      // Fetch user role + super admin flag
      const user = await db.query.brandUsers.findFirst({
        where: eq(brandUsers.id, cached.userId),
        columns: { role: true, isSuperAdmin: true },
      });
      return { valid: true, ...cached, role: user?.role ?? 'viewer', isSuperAdmin: user?.isSuperAdmin ?? false };
    }
  }

  // Fallback to DB
  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.sessionToken, tokenHash), eq(sessions.isActive, true)),
  });

  if (!session || session.expiresAt < new Date()) {
    return { valid: false };
  }

  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.id, session.userId!),
    columns: { role: true, isSuperAdmin: true },
  });

  return {
    valid:        true,
    userId:       session.userId!,
    brandId:      session.brandId!,
    mfaVerified:  session.mfaVerified ?? false,
    role:         user?.role ?? 'viewer',
    isSuperAdmin: user?.isSuperAdmin ?? false,
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });
  if (session) {
    await db.update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.id, sessionId));
    if (redis) await redis.del(`session:${session.sessionToken}`);
  }
}

export async function revokeAllSessions(userId: string): Promise<void> {
  const actives = await db.query.sessions.findMany({
    where: and(eq(sessions.userId, userId), eq(sessions.isActive, true)),
  });
  for (const s of actives) {
    await db.update(sessions).set({ isActive: false }).where(eq(sessions.id, s.id));
    if (redis) await redis.del(`session:${s.sessionToken}`);
  }
}

function detectDevice(userAgent: string): string {
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}
