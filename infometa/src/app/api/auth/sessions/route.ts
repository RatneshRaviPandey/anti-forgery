import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { validateSession, revokeSession } from '@/lib/auth/session';
import { writeAuditLog, SecurityEvents } from '@/lib/security/audit';
import { getClientIP } from '@/lib/utils/geo';

// GET: List all active sessions for current user
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  const activeSessions = await db.query.sessions.findMany({
    where: and(eq(sessions.userId, session.userId!), eq(sessions.isActive, true)),
    orderBy: (s, { desc }) => [desc(s.lastActiveAt)],
    columns: {
      id: true, ipAddress: true, city: true, country: true,
      deviceType: true, lastActiveAt: true, createdAt: true,
      userAgent: true,
    },
  });

  return apiResponse.success(activeSessions);
}

// DELETE: Revoke a specific session
export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('id');
  if (!sessionId) return apiResponse.badRequest('Session ID required');

  // Verify the session belongs to the user
  const targetSession = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId), eq(sessions.userId, session.userId!)),
  });
  if (!targetSession) return apiResponse.notFound('Session not found');

  await revokeSession(sessionId);

  await writeAuditLog({
    userId: session.userId, brandId: session.brandId,
    action: SecurityEvents.SESSION_REVOKED,
    entity: 'session', entityId: sessionId,
    ipAddress: getClientIP(req),
  });

  return apiResponse.success({ message: 'Session revoked' });
}
