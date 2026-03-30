import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { sql } from 'drizzle-orm';

export async function GET(_req: NextRequest) {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Database check
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    healthy = false;
  }

  // Redis check
  try {
    if (redis) {
      await redis.ping();
      checks.redis = 'ok';
    } else {
      checks.redis = 'not_configured';
    }
  } catch {
    checks.redis = 'error';
    healthy = false;
  }

  const status = healthy ? 200 : 503;

  return Response.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION ?? '1.0.0',
      checks,
    },
    { status }
  );
}
