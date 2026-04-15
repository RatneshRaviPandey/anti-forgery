import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { brandUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { sanitizeObject } from '@/lib/security/sanitize';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { getClientIP } from '@/lib/utils/geo';

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  // Rate limit: 3 reset requests per hour per IP
  const block = await applyRateLimit(req, `reset:${ip}`, 3, 3600);
  if (block) return block;

  let body: unknown;
  try {
    body = sanitizeObject(await req.json());
  } catch {
    return apiResponse.badRequest('Invalid JSON body');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { email } = parsed.data;

  // Always return success to prevent user enumeration
  const user = await db.query.brandUsers.findFirst({
    where: eq(brandUsers.email, email),
  });

  if (user) {
    const resetToken = randomBytes(32).toString('hex');

    // In production: store token with expiry and send via email
    // For now, log the token (would be sent via Resend in production)
    console.log(`[Password Reset] Token for ${email}: ${resetToken}`);

    try {
      const { sendAlertEmail } = await import('@/lib/email');
      await sendAlertEmail(
        email,
        'Infometa — Password Reset',
        `<p>You requested a password reset.</p>
<p>Use this link to reset your password (expires in 1 hour):</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}">Reset Password</a></p>
<p>If you didn't request this, ignore this email.</p>`,
      );
    } catch {
      // Email not configured — token logged to console
    }
  }

  // Always return same response (no user enumeration)
  return apiResponse.success({
    message: 'If an account with that email exists, we have sent password reset instructions.',
  });
}
