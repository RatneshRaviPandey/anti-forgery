import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { brandKeys, brands } from '@/lib/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';

const createSchema = z.object({
  brandId:    z.string().uuid(),
  expiryDays: z.number().int().min(30).max(3650).default(365),
  notes:      z.string().max(500).optional(),
});

// GET /api/superadmin/brand-keys — List all brand keys
export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId');

  const conditions = [];
  if (brandId) conditions.push(eq(brandKeys.brandId, brandId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const keys = await db.select({
    id:            brandKeys.id,
    keyId:         brandKeys.keyId,
    brandId:       brandKeys.brandId,
    brandName:     brandKeys.brandName,
    version:       brandKeys.version,
    isActive:      brandKeys.isActive,
    issuedAt:      brandKeys.issuedAt,
    expiresAt:     brandKeys.expiresAt,
    revokedAt:     brandKeys.revokedAt,
    lastUsedAt:    brandKeys.lastUsedAt,
    verifyCount:   brandKeys.verifyCount,
    notes:         brandKeys.notes,
    createdAt:     brandKeys.createdAt,
    // NOTE: encryptionKey is NOT returned in list view
  }).from(brandKeys)
    .where(where)
    .orderBy(desc(brandKeys.createdAt));

  return apiResponse.success(keys);
}

// POST /api/superadmin/brand-keys — Create a new brand key
export async function POST(req: NextRequest) {
  const { error, session } = await requireSuperAdmin(req);
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { brandId, expiryDays, notes } = parsed.data;

  // Verify brand exists
  const brand = await db.query.brands.findFirst({ where: eq(brands.id, brandId) });
  if (!brand) return apiResponse.notFound('Brand not found');

  // Generate unique key ID and encryption key
  const keyId = 'bk_' + randomBytes(6).toString('hex');
  const encryptionKey = randomBytes(32).toString('hex'); // 256 bits

  // Determine version (increment from latest key for this brand)
  const existing = await db.select({ count: count() })
    .from(brandKeys)
    .where(eq(brandKeys.brandId, brandId));
  const version = (existing[0]?.count ?? 0) + 1;

  const expiresAt = new Date(Date.now() + expiryDays * 86400000);

  const [key] = await db.insert(brandKeys).values({
    keyId,
    brandId,
    brandName: brand.name,
    encryptionKey,
    version,
    isActive: true,
    expiresAt,
    createdBy: session!.userId,
    notes,
  }).returning();

  // Return the full key file (only shown once at creation!)
  return apiResponse.created({
    message: 'Brand key created. Save the key file — the encryption key is shown only once.',
    keyFile: {
      keyId,
      brandName:     brand.name,
      brandCode:     brand.name.replace(/\s+/g, '_').toUpperCase().slice(0, 20),
      encryptionKey,
      version,
      issuedAt:      key.issuedAt?.toISOString(),
      expiresAt:     expiresAt.toISOString(),
    },
    keyDbId: key.id,
  });
}
