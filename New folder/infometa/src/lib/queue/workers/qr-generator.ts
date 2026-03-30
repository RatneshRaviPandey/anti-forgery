import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '@/lib/db';
import { qrCodes, batches } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateQRCode } from '@/lib/qr/generate';
import type { QRGeneratorJob } from '@/lib/queue';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl ? new IORedis(redisUrl, { maxRetriesPerRequest: null }) : null;

export const qrGeneratorWorker = connection
  ? new Worker<QRGeneratorJob>(
      'qr-generator',
      async (job) => {
        const { batchId, productId, brandId, count: totalCount } = job.data;
        const CHUNK_SIZE = 100;
        let generated = 0;

        for (let i = 0; i < totalCount; i += CHUNK_SIZE) {
          const chunkSize = Math.min(CHUNK_SIZE, totalCount - i);
          const chunk = await Promise.all(
            Array.from({ length: chunkSize }, () =>
              generateQRCode(batchId, productId, brandId)
            )
          );

          const rows = chunk.map((qr) => ({
            token: qr.token,
            batchId,
            productId,
            brandId,
          }));

          await db.insert(qrCodes).values(rows);
          generated += chunkSize;

          // Report progress
          await job.updateProgress(Math.round((generated / totalCount) * 100));
        }

        // Update batch generated count
        await db.update(batches)
          .set({ generatedUnits: generated })
          .where(eq(batches.id, batchId));

        return { generated };
      },
      { connection, concurrency: 2 }
    )
  : null;

if (qrGeneratorWorker) {
  qrGeneratorWorker.on('completed', (job, result) => {
    console.log(`[qr-generator] Completed job ${job.id}: generated ${result.generated} codes`);
  });
  qrGeneratorWorker.on('failed', (job, err) => {
    console.error(`[qr-generator] Failed job ${job?.id}:`, err.message);
  });
}
