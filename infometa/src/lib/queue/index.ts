import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl ? new IORedis(redisUrl, { maxRetriesPerRequest: null }) : null;

const defaultOpts = {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
};

export const scanLoggerQueue = connection
  ? new Queue('scan-logger', { connection, ...defaultOpts })
  : null;

export const alertEngineQueue = connection
  ? new Queue('alert-engine', { connection, ...defaultOpts })
  : null;

export const qrGeneratorQueue = connection
  ? new Queue('qr-generator', { connection, ...defaultOpts })
  : null;

export const emailNotifierQueue = connection
  ? new Queue('email-notifier', { connection, ...defaultOpts })
  : null;

// Job types
export interface ScanLogJob {
  token: string;
  resultStatus: 'authentic' | 'suspicious' | 'invalid';
  ip: string;
  userAgent: string;
  productId?: string;
  brandId?: string;
}

export interface AlertEngineJob {
  token: string;
  scanCount: number;
  brandId: string;
  productId?: string;
  city?: string;
  country?: string;
}

export interface QRGeneratorJob {
  batchId: string;
  productId: string;
  brandId: string;
  count: number;
}

export interface EmailNotifierJob {
  to: string;
  template: 'alert' | 'welcome' | 'weekly_report';
  data: Record<string, unknown>;
}
