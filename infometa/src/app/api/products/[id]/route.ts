import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { productUpdateSchema } from '@/lib/validations/product.schema';
import { apiResponse } from '@/lib/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { id } = await params;

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.brandId, brandId)),
  });

  if (!product) return apiResponse.notFound('Product not found');
  return apiResponse.success(product);
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

  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const updated = await db.update(products)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.brandId, brandId)))
    .returning();

  if (updated.length === 0) return apiResponse.notFound('Product not found');
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

  const deleted = await db.delete(products)
    .where(and(eq(products.id, id), eq(products.brandId, brandId)))
    .returning();

  if (deleted.length === 0) return apiResponse.notFound('Product not found');
  return apiResponse.success({ message: 'Product deleted' });
}
