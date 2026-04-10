import { NextRequest } from 'next/server';
import { validateSession, revokeSession } from '@/lib/auth/session';
import { apiResponse } from '@/lib/utils/response';
import { writeAuditLog, SecurityEvents } from '@/lib/security/audit';
import { getClientIP } from '@/lib/utils/geo';
import { hashToken } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token provided');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  // Find and revoke the session by token hash
  const tokenHash = hashToken(token);
  const dbSession = await db.query.sessions.findFirst({
    where: and(eq(sessions.sessionToken, tokenHash), eq(sessions.isActive, true)),
  });

  if (dbSession) {
    await revokeSession(dbSession.id);
  }

  await writeAuditLog({
    userId: session.userId, brandId: session.brandId,
    action: SecurityEvents.LOGOUT,
    entity: 'brand_user', entityId: session.userId,
    ipAddress: getClientIP(req),
  });

  return apiResponse.success({ message: 'Logged out successfully' });
}
