import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

export function createRateLimiter(prefix: string, requests: number, window: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    analytics: true,
    prefix: `rl:${prefix}`,
  });
}
