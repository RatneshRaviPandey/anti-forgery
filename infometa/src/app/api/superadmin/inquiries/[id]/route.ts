import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';
import { z } from 'zod';

const updateSchema = z.object({
  status:   z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes:    z.string().max(5000).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireSuperAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error.flatten());

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.priority) updates.priority = parsed.data.priority;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  if (parsed.data.status === 'resolved') {
    updates.resolvedAt = new Date();
    updates.resolvedBy = session?.userId ?? 'admin';
  }

  const [updated] = await db.update(inquiries)
    .set(updates)
    .where(eq(inquiries.id, id))
    .returning();

  if (!updated) return apiResponse.notFound('Inquiry not found');

  return apiResponse.success(updated);
}
