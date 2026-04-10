import { generateTokenV2, type GenerateTokenInput } from './generator';
import { db } from '@/lib/db';
import { qrCodes, batches } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface BulkGenerateResult {
  batchId:        string;
  totalGenerated: number;
  tokens:         string[];
  generatedAt:    string;
}

export async function generateBatchTokens(
  batchId: string,
  brandId: string,
): Promise<BulkGenerateResult> {
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, batchId),
    with: { product: true },
  });

  if (!batch) throw new Error('Batch not found');
  if (batch.brandId !== brandId) throw new Error('Unauthorized: wrong brand');
  if (batch.isActive) throw new Error('Batch already activated');

  const { totalUnits, productId } = batch;

  const expiryDays = batch.expiryDate
    ? Math.max(
        Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / 86400000),
        30,
      )
    : 365;

  const tokens: string[] = [];
  const CHUNK_SIZE = 1000;
  let dbInserts: {
    token: string; batchId: string; productId: string | null;
    brandId: string | null; status: 'active'; scanCount: number;
  }[] = [];

  for (let seq = 1; seq <= totalUnits; seq++) {
    const input: GenerateTokenInput = {
      brandId,
      productId: productId!,
      batchId,
      sequence: seq,
      expiryDays,
    };

    const token = generateTokenV2(input);
    tokens.push(token);

    dbInserts.push({
      token,
      batchId,
      productId,
      brandId,
      status: 'active',
      scanCount: 0,
    });

    if (dbInserts.length === CHUNK_SIZE || seq === totalUnits) {
      await db.insert(qrCodes).values(dbInserts);
      dbInserts = [];
    }
  }

  await db.update(batches)
    .set({
      isActive:       true,
      generatedUnits: totalUnits,
      activatedAt:    new Date(),
    })
    .where(eq(batches.id, batchId));

  return {
    batchId,
    totalGenerated: totalUnits,
    tokens,
    generatedAt: new Date().toISOString(),
  };
}
