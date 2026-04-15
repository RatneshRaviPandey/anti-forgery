import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/qr/verify';
import { isV3Token, verifyTokenV3 } from '@/lib/tokens/v3/decryptor';
import { redis, verifyRateLimiter } from '@/lib/redis';
import { REDIS_KEYS, TTL } from '@/lib/redis/keys';
import { apiResponse } from '@/lib/utils/response';
import { getClientIP, hashIP, getGeoFromIP } from '@/lib/utils/geo';
import { logger } from '@/lib/monitoring/logger';
import { db } from '@/lib/db';
import { scans, qrCodes, brandKeys } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const startTime = Date.now();
  const { token } = await params;
  const clientIP = getClientIP(req);

  // Rate limiting
  if (verifyRateLimiter) {
    const { success: rateLimitOk } = await verifyRateLimiter.limit(clientIP);
    if (!rateLimitOk) {
      return apiResponse.tooManyRequests('Too many verification requests. Please wait.');
    }
  }

  // Input validation
  if (!token || token.length < 8 || token.length > 1000) {
    return apiResponse.badRequest('Invalid token format');
  }

  try {
    // Check Redis cache
    if (redis) {
      const cacheKey = REDIS_KEYS.verifyToken(token);
      const cached = await redis.get<object>(cacheKey);
      if (cached) {
        logger.info({ token, source: 'cache', latency: Date.now() - startTime }, 'verify:hit');
        return apiResponse.success(cached);
      }
    }

    // Route to appropriate verification method
    let result;
    if (isV3Token(token)) {
      // V3: Self-contained encrypted token — decrypt using brand key
      result = await verifyTokenV3(token);
    } else {
      // V1/V2: Database lookup
      result = await verifyToken(token);
    }

    // Cache result
    if (redis) {
      await redis.set(REDIS_KEYS.verifyToken(token), result, { ex: TTL.VERIFY });
    }

    // Log scan — resolve brandId from the verification result
    const geo = await getGeoFromIP(clientIP);
    let scanBrandId: string | undefined;
    if (isV3Token(token) && result.status === 'authentic') {
      // Extract keyId from token format: IMT3.{keyId}.{encrypted}
      const keyId = token.split('.')[1];
      if (keyId) {
        const key = await db.query.brandKeys.findFirst({
          where: eq(brandKeys.keyId, keyId),
          columns: { brandId: true },
        });
        if (key) scanBrandId = key.brandId ?? undefined;
      }
    }
    // Map V3-specific statuses to the scans table's status enum
    const scanStatus = (['authentic', 'suspicious', 'invalid'] as const).includes(
      result.status as 'authentic' | 'suspicious' | 'invalid'
    ) ? result.status as 'authentic' | 'suspicious' | 'invalid' : 'invalid';
    await db.insert(scans).values({
      token,
      brandId: scanBrandId,
      resultStatus: scanStatus,
      scannedAt: new Date(), // JavaScript Date is always UTC internally
      ipHash: hashIP(clientIP),
      userAgent: req.headers.get('user-agent') ?? undefined,
      city: geo?.city,
      country: geo?.country,
      lat: geo?.lat?.toString(),
      lng: geo?.lng?.toString(),
    }).catch((err) => logger.error({ err }, 'scan:insert:error'));

    // Get scan count for this token from scans table
    const [scanRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(scans)
      .where(sql`${scans.token} = ${token}`);
    const scanCount = scanRow?.count ?? 1;

    // Inject scanCount into the result
    if ('product' in result && result.status !== 'invalid') {
      (result as unknown as Record<string, unknown>).scanCount = scanCount;
    }

    // Increment scan count for DB-based tokens (qr_codes table)
    if (!isV3Token(token) && result.status !== 'invalid') {
      db.execute(sql`
        UPDATE qr_codes
        SET scan_count = scan_count + 1,
            last_scanned_at = NOW(),
            last_scanned_city = ${geo?.city ?? 'Unknown'},
            first_scanned_at = COALESCE(first_scanned_at, NOW())
        WHERE token = ${token}
      `).catch((err) => logger.error({ err }, 'scan:update:error'));
    }

    // Invalidate cache so next scan gets fresh count
    if (redis && result.status !== 'invalid') {
      redis.del(REDIS_KEYS.verifyToken(token)).catch(() => {});
    }

    logger.info({ token, status: result.status, latency: Date.now() - startTime }, 'verify:db');
    return apiResponse.success(result);
  } catch (error) {
    logger.error({ token, error }, 'verify:error');
    return apiResponse.serverError('Verification service temporarily unavailable');
  }
}
