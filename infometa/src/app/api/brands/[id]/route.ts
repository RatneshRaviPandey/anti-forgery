import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { brands } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { brandUpdateSchema } from '@/lib/validations/brand.schema';
import { apiResponse } from '@/lib/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  const { id } = await params;

  const brand = await db.query.brands.findFirst({ where: eq(brands.id, id) });
  if (!brand) return apiResponse.notFound('Brand not found');
  return apiResponse.success(brand);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  const { id } = await params;
  const body = await req.json();

  const parsed = brandUpdateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const updated = await db.update(brands)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(brands.id, id))
    .returning();

  if (updated.length === 0) return apiResponse.notFound('Brand not found');
  return apiResponse.success(updated[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  const { id } = await params;

  const deleted = await db.delete(brands).where(eq(brands.id, id)).returning();
  if (deleted.length === 0) return apiResponse.notFound('Brand not found');
  return apiResponse.success({ message: 'Brand deleted' });
}
