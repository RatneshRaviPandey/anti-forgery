import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { brandUsers } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';

// GET: list all super admin users
export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const admins = await db.query.brandUsers.findMany({
    where: eq(brandUsers.isSuperAdmin, true),
    orderBy: [desc(brandUsers.createdAt)],
    columns: {
      id: true, email: true, name: true, role: true,
      isActive: true, isSuperAdmin: true, lastLoginAt: true,
      lastLoginIp: true, createdAt: true,
    },
  });

  return apiResponse.success(admins);
}

// POST: create new super admin
const createSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(12).max(128),
  brandId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { name, email, password, brandId } = parsed.data;

  // Check email uniqueness
  const existing = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.email, email),
  });
  if (existing) return apiResponse.badRequest('Email already in use');

  const hash = await bcrypt.hash(password, 12);

  const [admin] = await db.insert(brandUsers).values({
    brandId,
    email,
    name,
    passwordHash: hash,
    role: 'owner',
    isActive: true,
    emailVerified: true,
    isSuperAdmin: true,
    passwordChangedAt: new Date(),
  }).returning();

  return apiResponse.created({ id: admin.id, email: admin.email, name: admin.name });
}
