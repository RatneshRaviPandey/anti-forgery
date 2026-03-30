import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { batches, qrCodes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { generateQRCode } from '@/lib/qr/generate';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';

const generateSchema = z.object({
  batchId: z.string().uuid(),
  count: z.number().int().min(1).max(10000),
});

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const body = await req.json();

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const batch = await db.query.batches.findFirst({
    where: and(eq(batches.id, parsed.data.batchId), eq(batches.brandId, brandId)),
  });

  if (!batch) return apiResponse.notFound('Batch not found');

  const remaining = batch.totalUnits - (batch.generatedUnits ?? 0);
  if (parsed.data.count > remaining) {
    return apiResponse.badRequest(`Only ${remaining} units remaining in this batch`);
  }

  const generated: { token: string; verifyUrl: string }[] = [];
  const CHUNK_SIZE = 100;

  for (let i = 0; i < parsed.data.count; i += CHUNK_SIZE) {
    const chunkSize = Math.min(CHUNK_SIZE, parsed.data.count - i);
    const chunk = await Promise.all(
      Array.from({ length: chunkSize }, () =>
        generateQRCode(parsed.data.batchId, batch.productId!, brandId)
      )
    );

    const rows = chunk.map((qr) => ({
      token: qr.token,
      batchId: parsed.data.batchId,
      productId: batch.productId!,
      brandId,
    }));

    await db.insert(qrCodes).values(rows);
    generated.push(...chunk.map((qr) => ({ token: qr.token, verifyUrl: qr.verifyUrl })));
  }

  // Update generated units count
  await db.update(batches)
    .set({ generatedUnits: (batch.generatedUnits ?? 0) + parsed.data.count })
    .where(eq(batches.id, parsed.data.batchId));

  return apiResponse.created({
    batchId: parsed.data.batchId,
    codesGenerated: generated.length,
    codes: generated.slice(0, 50),
  });
}
