import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup of expired entries to prevent memory leak
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();
function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of inMemoryStore) {
    if (entry.resetAt < now) inMemoryStore.delete(key);
  }
}

export async function applyRateLimit(
  _req: NextRequest,
  limiterKey: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<NextResponse | null> {
  // Use Redis if available
  if (redis) {
    const key = `rl:${limiterKey}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    if (current > maxRequests) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait.' },
        { status: 429 },
      );
    }
    return null;
  }

  // Fallback to in-memory rate limiting
  cleanupExpiredEntries();
  const now = Date.now();
  const entry = inMemoryStore.get(limiterKey);

  if (!entry || entry.resetAt < now) {
    inMemoryStore.set(limiterKey, { count: 1, resetAt: now + windowSeconds * 1000 });
    return null;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait.' },
      { status: 429 },
    );
  }

  return null;
}
