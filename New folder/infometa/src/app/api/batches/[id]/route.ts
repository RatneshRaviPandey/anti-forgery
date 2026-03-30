import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { batches } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { batchUpdateSchema } from '@/lib/validations/batch.schema';
import { apiResponse } from '@/lib/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { id } = await params;

  const batch = await db.query.batches.findFirst({
    where: and(eq(batches.id, id), eq(batches.brandId, brandId)),
    with: { product: true },
  });

  if (!batch) return apiResponse.notFound('Batch not found');
  return apiResponse.success(batch);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { id } = await params;
  const body = await req.json();

  const parsed = batchUpdateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const updated = await db.update(batches)
    .set({ ...parsed.data })
    .where(and(eq(batches.id, id), eq(batches.brandId, brandId)))
    .returning();

  if (!updated.length) return apiResponse.notFound('Batch not found');
  return apiResponse.success(updated[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { id } = await params;

  const deleted = await db.delete(batches)
    .where(and(eq(batches.id, id), eq(batches.brandId, brandId)))
    .returning();

  if (!deleted.length) return apiResponse.notFound('Batch not found');
  return apiResponse.success({ deleted: true });
}
