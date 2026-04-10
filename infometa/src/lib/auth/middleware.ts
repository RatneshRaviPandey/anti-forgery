import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands, brandUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { validateSession } from '@/lib/auth/session';

// Skip auth when no auth infra is configured (local dev with seed data)
const isAuthConfigured = Boolean(process.env.ENABLE_AUTH);

export async function requireAuth(req: NextRequest) {
  if (!isAuthConfigured) return null;

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('Authentication required');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid or expired session');

  return null;
}

export async function getBrandIdFromSession(req: NextRequest): Promise<string> {
  if (!isAuthConfigured) {
    const firstBrand = await db.query.brands.findFirst();
    if (!firstBrand) throw new Error('No brands found. Run: npm run db:seed');
    return firstBrand.id;
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('No auth token');

  const session = await validateSession(token);
  if (!session.valid || !session.brandId) throw new Error('Invalid session');

  return session.brandId;
}

// Portal-specific: returns full session info
export async function requirePortalAuth(req: NextRequest): Promise<{
  userId: string; brandId: string; role: string;
} | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
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
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return { error: apiResponse.unauthorized('Authentication required'), session: null };

  const session = await validateSession(token);
  if (!session.valid) return { error: apiResponse.unauthorized('Invalid session'), session: null };
  if (!session.isSuperAdmin) return { error: apiResponse.forbidden('Super admin access required'), session: null };

  return { error: null, session };
}
