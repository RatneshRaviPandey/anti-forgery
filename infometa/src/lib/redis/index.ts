import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

function createRedisClient() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Return a no-op client for build time / when env vars are not set
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export const redis = createRedisClient();

// Rate limiter: 30 verify requests per minute per IP
export const verifyRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: 'rl:verify',
    })
  : null;

// Rate limiter: 10 API requests per minute for general APIs
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'rl:api',
    })
  : null;
