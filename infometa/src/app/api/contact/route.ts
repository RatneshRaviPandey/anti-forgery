import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { apiResponse } from '@/lib/utils/response';
import { sanitizeObject } from '@/lib/security/sanitize';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { getClientIP } from '@/lib/utils/geo';

const contactSchema = z.object({
  name:     z.string().min(1).max(100).trim(),
  company:  z.string().max(100).trim().optional().default(''),
  email:    z.string().email().trim(),
  phone:    z.string().max(20).trim().optional().default(''),
  industry: z.string().max(50).trim().optional().default(''),
  subject:  z.string().max(100).trim().optional().default(''),
  message:  z.string().min(1).max(5000).trim(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const block = await applyRateLimit(req, `contact:${ip}`, 5, 3600);
  if (block) return block;

  let body: unknown;
  try {
    body = sanitizeObject(await req.json());
  } catch {
    return apiResponse.badRequest('Invalid JSON body');
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { name, email, subject, message, company, industry, phone } = parsed.data;

  // Determine inquiry type based on subject
  const subjectLower = (subject || '').toLowerCase();
  const type = subjectLower.includes('demo') ? 'demo_request' as const
    : subjectLower.includes('report') || subjectLower.includes('counterfeit') ? 'counterfeit_report' as const
    : subjectLower.includes('support') ? 'support' as const
    : subjectLower.includes('feedback') ? 'feedback' as const
    : 'contact' as const;

  const priority = type === 'counterfeit_report' ? 'high' as const
    : type === 'demo_request' ? 'medium' as const
    : 'low' as const;

  // Store in database
  const result = await db.insert(inquiries).values({
    type,
    name,
    email,
    phone: phone || null,
    company: company || null,
    industry: industry || null,
    subject: subject || null,
    message,
    priority,
    ipAddress: ip,
    userAgent: req.headers.get('user-agent') ?? null,
  }).returning();

  const inquiry = result[0];

  console.log('[Inquiry]', { id: inquiry.id, type, name, email, subject });

  // Try to send email notification (fire-and-forget)
  try {
    const { sendAlertEmail } = await import('@/lib/email');
    await sendAlertEmail(
      process.env.EMAIL_FROM ?? 'contact@infometa.in',
      `[${type.replace('_', ' ').toUpperCase()}] ${subject || 'New inquiry'} from ${name}`,
      `<p><strong>From:</strong> ${name} (${email})</p>
<p><strong>Company:</strong> ${company || 'N/A'} | <strong>Industry:</strong> ${industry || 'N/A'}</p>
<p><strong>Phone:</strong> ${phone || 'N/A'}</p>
<p><strong>Type:</strong> ${type} | <strong>Priority:</strong> ${priority}</p>
<hr/><p>${message.replace(/\n/g, '<br/>')}</p>
<p><a href="https://infometa.in/admin/inquiries">View in Admin Panel</a></p>`,
    );
  } catch { /* email not configured */ }

  return apiResponse.success({ id: inquiry.id, message: 'Message received. We will get back to you within 24 hours.' });
}
