import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { db } from '@/lib/db';
import { alerts, qrCodes, scans } from '@/lib/db/schema';
import { eq, and, count, gte } from 'drizzle-orm';
import type { AlertEngineJob } from '@/lib/queue';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl ? new IORedis(redisUrl, { maxRetriesPerRequest: null }) : null;

const DUPLICATE_SCAN_THRESHOLD = 5;
const SCAN_SPIKE_THRESHOLD = 50;

export const alertEngineWorker = connection
  ? new Worker<AlertEngineJob>(
      'alert-engine',
      async (job) => {
        const { token, scanCount, brandId, productId, city, country } = job.data;

        // Check for duplicate scan alerts
        if (scanCount >= DUPLICATE_SCAN_THRESHOLD) {
          await db.insert(alerts).values({
            token,
            productId: productId ?? null,
            brandId,
            type: 'duplicate_scan',
            severity: scanCount >= 20 ? 'critical' : scanCount >= 10 ? 'high' : 'medium',
            details: { scanCount, city, country },
            scanCount,
          });

          // Mark code as suspicious
          await db.update(qrCodes)
            .set({ status: 'suspicious' })
            .where(eq(qrCodes.token, token));
        }

        // Check for scan spike (many different tokens from same brand in short time)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentScans = await db.select({ count: count() })
          .from(scans)
          .where(and(eq(scans.brandId, brandId), gte(scans.scannedAt, oneHourAgo)));

        if (recentScans[0].count >= SCAN_SPIKE_THRESHOLD) {
          // Check if we already have a recent spike alert
          const existingSpike = await db.query.alerts.findFirst({
            where: and(
              eq(alerts.brandId, brandId),
              eq(alerts.type, 'scan_spike'),
              eq(alerts.resolved, false),
              gte(alerts.createdAt, oneHourAgo)
            ),
          });

          if (!existingSpike) {
            await db.insert(alerts).values({
              brandId,
              type: 'scan_spike',
              severity: 'high',
              details: { scansInLastHour: recentScans[0].count },
              scanCount: recentScans[0].count,
            });
          }
        }
      },
      { connection, concurrency: 5 }
    )
  : null;

if (alertEngineWorker) {
  alertEngineWorker.on('completed', (job) => {
    console.log(`[alert-engine] Completed job ${job.id}`);
  });
  alertEngineWorker.on('failed', (job, err) => {
    console.error(`[alert-engine] Failed job ${job?.id}:`, err.message);
  });
}
