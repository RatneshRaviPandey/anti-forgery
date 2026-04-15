import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands, brandUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { validateSession } from '@/lib/auth/session';

// Auth bypass is ONLY allowed in non-production environments
const isAuthConfigured = Boolean(process.env.ENABLE_AUTH);
if (!isAuthConfigured && process.env.NODE_ENV === 'production') {
  throw new Error('ENABLE_AUTH must be set to true in production. Refusing to start with authentication disabled.');
}

export async function requireAuth(req: NextRequest) {
  if (!isAuthConfigured) return null;

  const token = extractToken(req);
  if (!token) return apiResponse.unauthorized('Authentication required');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid or expired session');

  return null;
}

/** Extract auth token from httpOnly cookie (preferred) or Authorization header (fallback) */
function extractToken(req: NextRequest): string | null {
  return req.cookies.get('infometa-session')?.value
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
    ?? null;
}

export async function getBrandIdFromSession(req: NextRequest): Promise<string> {
  if (!isAuthConfigured) {
    const firstBrand = await db.query.brands.findFirst();
    if (!firstBrand) throw new Error('No brands found. Run: npm run db:seed');
    return firstBrand.id;
  }

  const token = extractToken(req);
  if (!token) throw new Error('No auth token');

  const session = await validateSession(token);
  if (!session.valid || !session.brandId) throw new Error('Invalid session');

  return session.brandId;
}

// Portal-specific: returns full session info
export async function requirePortalAuth(req: NextRequest): Promise<{
  userId: string; brandId: string; role: string;
} | null> {
  const token = extractToken(req);
  if (!token) return null;

  const session = await validateSession(token);
  if (!session.valid) return null;

  return {
    userId:  session.userId!,
    brandId: session.brandId!,
    role:    session.role ?? 'viewer',
  };
}

// Super admin check
export async function requireSuperAdmin(req: NextRequest) {
  const token = extractToken(req);
  if (!token) return { error: apiResponse.unauthorized('Authentication required'), session: null };

  const session = await validateSession(token);
  if (!session.valid) return { error: apiResponse.unauthorized('Invalid session'), session: null };
  if (!session.isSuperAdmin) return { error: apiResponse.forbidden('Super admin access required'), session: null };

  return { error: null, session };
}
