import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { brandUsers, brands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('infometa-session')?.value
    ?? req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return apiResponse.unauthorized('No token');

  const session = await validateSession(token);
  if (!session.valid) return apiResponse.unauthorized('Invalid session');

  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.id, session.userId!),
  });
  if (!user) return apiResponse.unauthorized('User not found');

  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, session.brandId!),
  });

  return apiResponse.success({
    user: {
      id:                 user.id,
      name:               user.name,
      email:              user.email,
      role:               user.role,
      brandId:            user.brandId,
      avatarUrl:          user.avatarUrl,
      mfaEnabled:         user.mfaEnabled,
      mustChangePassword: user.mustChangePassword,
      isSuperAdmin:       user.isSuperAdmin ?? false,
    },
    brand: brand ? {
      id:           brand.id,
      name:         brand.name,
      logo:         brand.logoUrl,
      plan:         brand.plan,
      status:       brand.status,
      trialEndsAt:  brand.trialEndsAt?.toISOString() ?? null,
      isActive:     brand.isActive,
    } : null,
  });
}
