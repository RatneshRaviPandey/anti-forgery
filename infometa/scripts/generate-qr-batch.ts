import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateQRCode } from '../src/lib/qr/generate';

async function main() {
  const batchId = process.argv[2];
  if (!batchId) {
    console.error('Usage: npx tsx scripts/generate-qr-batch.ts <batch-id>');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const batch = await db.query.batches.findFirst({
    where: eq(schema.batches.id, batchId),
  });

  if (!batch) {
    console.error(`Batch ${batchId} not found`);
    process.exit(1);
  }

  const remaining = batch.totalUnits - (batch.generatedUnits ?? 0);
  if (remaining <= 0) {
    console.log('All units already generated');
    process.exit(0);
  }

  console.log(`Generating ${remaining} QR codes for batch ${batch.batchCode}...`);

  const CHUNK = 50;
  let generated = 0;

  for (let i = 0; i < remaining; i += CHUNK) {
    const size = Math.min(CHUNK, remaining - i);
    const qrs = await Promise.all(
      Array.from({ length: size }, () =>
        generateQRCode(batchId, batch.productId!, batch.brandId!)
      )
    );

    await db.insert(schema.qrCodes).values(
      qrs.map((qr) => ({
        token: qr.token,
        batchId,
        productId: batch.productId!,
        brandId: batch.brandId!,
      }))
    );

    generated += size;
    console.log(`  ${generated}/${remaining} codes generated`);
  }

  await db.update(schema.batches)
    .set({ generatedUnits: batch.totalUnits, isActive: true, activatedAt: new Date() })
    .where(eq(schema.batches.id, batchId));

  console.log(`✅ Generated ${generated} QR codes and activated batch`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
