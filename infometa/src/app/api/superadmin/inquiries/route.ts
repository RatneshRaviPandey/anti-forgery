import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { inquiries } from '@/lib/db/schema';
import { desc, count, eq, and } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')));
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  const conditions = [];
  if (type) conditions.push(eq(inquiries.type, type as 'contact' | 'demo_request' | 'counterfeit_report' | 'feedback' | 'support'));
  if (status) conditions.push(eq(inquiries.status, status as 'new' | 'in_progress' | 'resolved' | 'closed'));
  if (priority) conditions.push(eq(inquiries.priority, priority as 'low' | 'medium' | 'high' | 'urgent'));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, totalResult] = await Promise.all([
    db.select().from(inquiries)
      .where(where)
      .orderBy(desc(inquiries.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: count() }).from(inquiries).where(where),
  ]);

  return apiResponse.paginated(data, { page, limit, total: totalResult[0].count });
}
