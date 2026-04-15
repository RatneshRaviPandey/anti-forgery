import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { apiResponse } from '@/lib/utils/response';
import { sanitizeObject } from '@/lib/security/sanitize';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { getClientIP } from '@/lib/utils/geo';

const reportSchema = z.object({
  token:   z.string().min(1).max(1000),
  message: z.string().max(2000).optional().default('Reported as counterfeit'),
  email:   z.string().email().optional(),
  name:    z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const block = await applyRateLimit(req, `report:${ip}`, 10, 3600);
  if (block) return block;

  let body: unknown;
  try {
    body = sanitizeObject(await req.json());
  } catch {
    return apiResponse.badRequest('Invalid JSON body');
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { token, message, email, name } = parsed.data;

  const result = await db.insert(inquiries).values({
    type: 'counterfeit_report',
    name: name || 'Anonymous',
    email: email || 'anonymous@infometa.in',
    subject: 'Counterfeit Product Report',
    message,
    token,
    priority: 'high',
    ipAddress: ip,
    userAgent: req.headers.get('user-agent') ?? null,
  }).returning();

  const inquiry = result[0];

  console.log('[Counterfeit Report]', { id: inquiry.id, token: token.slice(0, 40) });

  return apiResponse.success({ id: inquiry.id, message: 'Report submitted. Thank you for helping fight counterfeiting.' });
}
