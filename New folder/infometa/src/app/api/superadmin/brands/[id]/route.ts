import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';

const updateSchema = z.object({
  status:   z.enum(['pending_verification', 'active', 'suspended', 'trial', 'churned']).optional(),
  plan:     z.enum(['starter', 'growth', 'enterprise']).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { id } = await params;
  const brand = await db.query.brands.findFirst({ where: eq(brands.id, id) });
  if (!brand) return apiResponse.notFound('Brand not found');

  return apiResponse.success(brand);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const [updated] = await db.update(brands)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning();

  if (!updated) return apiResponse.notFound('Brand not found');
  return apiResponse.success(updated);
}
