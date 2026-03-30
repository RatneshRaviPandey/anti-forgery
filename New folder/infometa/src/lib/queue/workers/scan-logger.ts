import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '@/lib/db';
import { scans, qrCodes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getGeoFromIP, hashIP } from '@/lib/utils/geo';
import type { ScanLogJob } from '@/lib/queue';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl ? new IORedis(redisUrl, { maxRetriesPerRequest: null }) : null;

export const scanLoggerWorker = connection
  ? new Worker<ScanLogJob>(
      'scan-logger',
      async (job) => {
        const { token, resultStatus, ip, userAgent, productId, brandId } = job.data;

        const geo = await getGeoFromIP(ip);
        const ipHash = hashIP(ip);

        await db.insert(scans).values({
          token,
          resultStatus,
          productId: productId ?? null,
          brandId: brandId ?? null,
          city: geo?.city ?? null,
          country: geo?.country ?? 'IN',
          lat: geo?.lat?.toString() ?? null,
          lng: geo?.lng?.toString() ?? null,
          ipHash,
          userAgent,
          deviceHash: null,
          sessionId: null,
        });

        // Update QR code scan stats
        await db.update(qrCodes)
          .set({
            scanCount: sql`${qrCodes.scanCount} + 1`,
            lastScannedAt: new Date(),
            lastScannedCity: geo?.city ?? null,
            firstScannedAt: sql`COALESCE(${qrCodes.firstScannedAt}, NOW())`,
          })
          .where(eq(qrCodes.token, token));
      },
      { connection, concurrency: 10 }
    )
  : null;

if (scanLoggerWorker) {
  scanLoggerWorker.on('completed', (job) => {
    console.log(`[scan-logger] Completed job ${job.id}`);
  });
  scanLoggerWorker.on('failed', (job, err) => {
    console.error(`[scan-logger] Failed job ${job?.id}:`, err.message);
  });
}
