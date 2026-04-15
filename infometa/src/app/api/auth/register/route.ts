import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { brands, brandUsers, passwordHistory } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { validatePasswordStrength } from '@/lib/auth/password-policy';
import { sanitizeObject } from '@/lib/security/sanitize';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { writeAuditLog, SecurityEvents } from '@/lib/security/audit';
import { getClientIP } from '@/lib/utils/geo';
import { addDays } from 'date-fns';

const registerSchema = z.object({
  brandName: z.string().min(2).max(100).trim(),
  industry:  z.enum([
    'dairy', 'pharma', 'cosmetics', 'fmcg', 'agro_products',
    'electronics', 'auto_parts', 'lubricants', 'supplements',
    'beverages', 'luxury', 'industrial_chemicals',
  ]),
  website:   z.string().url().optional().or(z.literal('')),
  phone:     z.string().min(10).max(15).optional().or(z.literal('')),
  country:   z.string().max(2).default('IN'),
  ownerName: z.string().min(2).max(100).trim(),
  email:     z.string().email().toLowerCase().trim(),
  password:  z.string().min(12).max(128),
  acceptedTerms:   z.boolean().refine(v => v === true, 'Must accept terms'),
  acceptedPrivacy: z.boolean().refine(v => v === true, 'Must accept privacy policy'),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  // Rate limit: 5 registrations per hour per IP
  const block = await applyRateLimit(req, `reg:${ip}`, 5, 3600);
  if (block) return block;

  let body: unknown;
  try {
    body = sanitizeObject(await req.json());
  } catch {
    return apiResponse.badRequest('Invalid JSON body');
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { brandName, industry, website, phone, country, ownerName, email, password } = parsed.data;

  // Password strength validation
  const passwordCheck = validatePasswordStrength(password, [email, brandName, ownerName]);
  if (!passwordCheck.valid) {
    return apiResponse.badRequest(passwordCheck.reason!);
  }

  // Check email uniqueness
  const existing = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.email, email),
  });
  if (existing) return apiResponse.badRequest('Email already registered');

  // Hash password
  const hash = await bcrypt.hash(password, 12);

  // Create Brand + Owner (transaction)
  const result = await db.transaction(async (tx) => {
    const [brand] = await tx.insert(brands).values({
      name:       brandName,
      email,
      phone:      phone || null,
      website:    website || null,
      country,
      plan:       'starter',
      status:     'trial',
      emailVerified: false,
      trialEndsAt: addDays(new Date(), 14),
    }).returning();

    const [user] = await tx.insert(brandUsers).values({
      brandId:           brand.id,
      email,
      name:              ownerName,
      passwordHash:      hash,
      role:              'owner',
      emailVerified:     true,
      passwordChangedAt: new Date(),
      acceptedAt:        new Date(),
    }).returning();

    // Record password history
    await tx.insert(passwordHistory).values({
      userId:       user.id,
      passwordHash: hash,
    });

    return { brand, user };
  });

  await writeAuditLog({
    userId:    result.user.id,
    brandId:   result.brand.id,
    action:    SecurityEvents.BRAND_REGISTERED,
    entity:    'brand',
    entityId:  result.brand.id,
    ipAddress: ip,
  });

  return apiResponse.created({
    message: 'Account created successfully.',
    brandId: result.brand.id,
    userId:  result.user.id,
  });
}
