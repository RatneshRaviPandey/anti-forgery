import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { batches, qrCodes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { generateQRCode } from '@/lib/qr/generate';
import { apiResponse } from '@/lib/utils/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { id } = await params;

  const batch = await db.query.batches.findFirst({
    where: and(eq(batches.id, id), eq(batches.brandId, brandId)),
  });

  if (!batch) return apiResponse.notFound('Batch not found');
  if (batch.isActive) return apiResponse.badRequest('Batch is already activated');

  const remaining = batch.totalUnits - (batch.generatedUnits ?? 0);
  if (remaining <= 0) return apiResponse.badRequest('All units already generated');

  const generated: { token: string; verifyUrl: string }[] = [];

  // Generate QR codes in chunks to avoid memory issues
  const CHUNK_SIZE = 100;
  for (let i = 0; i < remaining; i += CHUNK_SIZE) {
    const chunkSize = Math.min(CHUNK_SIZE, remaining - i);
    const chunk = await Promise.all(
      Array.from({ length: chunkSize }, () =>
        generateQRCode(id, batch.productId!, brandId)
      )
    );

    const rows = chunk.map((qr) => ({
      token: qr.token,
      batchId: id,
      productId: batch.productId!,
      brandId,
    }));

    await db.insert(qrCodes).values(rows);
    generated.push(...chunk.map((qr) => ({ token: qr.token, verifyUrl: qr.verifyUrl })));
  }

  // Activate batch
  await db.update(batches)
    .set({
      isActive: true,
      activatedAt: new Date(),
      generatedUnits: batch.totalUnits,
    })
    .where(eq(batches.id, id));

  return apiResponse.success({
    batchId: id,
    activated: true,
    codesGenerated: generated.length,
    codes: generated.slice(0, 50), // Return first 50 for preview
  });
}
