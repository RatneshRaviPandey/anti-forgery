import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { scans, alerts } from '@/lib/db/schema';
import { eq, and, count, gte, sql } from 'drizzle-orm';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';
import crypto from 'crypto';

const webhookSchema = z.object({
  token: z.string(),
  event: z.enum(['scan', 'alert', 'deactivation']),
  data: z.record(z.string(), z.unknown()).optional(),
});

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-webhook-signature');
  const rawBody = await req.text();

  if (signature && !verifyWebhookSignature(rawBody, signature)) {
    return apiResponse.unauthorized('Invalid webhook signature');
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return apiResponse.badRequest('Invalid JSON');
  }

  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const { event, data } = parsed.data;

  switch (event) {
    case 'scan':
      // Log scan event for external integrations
      return apiResponse.success({ received: true, event: 'scan' });

    case 'alert':
      // External alert notification
      return apiResponse.success({ received: true, event: 'alert' });

    case 'deactivation':
      // External deactivation request
      return apiResponse.success({ received: true, event: 'deactivation' });

    default:
      return apiResponse.badRequest('Unknown event type');
  }
}
