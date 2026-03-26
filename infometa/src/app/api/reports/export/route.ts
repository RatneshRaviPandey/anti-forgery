import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { scans, qrCodes, products, alerts } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { requireAuth, getBrandIdFromSession } from '@/lib/auth/middleware';
import { apiResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  const brandId = await getBrandIdFromSession(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'scans'; // scans | alerts | codes
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const format = searchParams.get('format') ?? 'csv';

  if (format !== 'csv') return apiResponse.badRequest('Only CSV format is currently supported');

  let rows: Record<string, unknown>[] = [];
  let headers: string[] = [];

  const conditions = [eq(scans.brandId, brandId)];
  if (from) conditions.push(gte(scans.scannedAt, new Date(from)));
  if (to) conditions.push(lte(scans.scannedAt, new Date(to)));

  if (type === 'scans') {
    headers = ['id', 'token', 'result', 'city', 'country', 'scannedAt'];
    const data = await db.select().from(scans)
      .where(and(...conditions))
      .orderBy(desc(scans.scannedAt))
      .limit(10000);
    rows = data.map((s) => ({
      id: s.id,
      token: s.token,
      result: s.resultStatus,
      city: s.city ?? '',
      country: s.country ?? '',
      scannedAt: s.scannedAt?.toISOString() ?? '',
    }));
  } else if (type === 'alerts') {
    headers = ['id', 'type', 'severity', 'resolved', 'createdAt'];
    const data = await db.select().from(alerts)
      .where(eq(alerts.brandId, brandId))
      .orderBy(desc(alerts.createdAt))
      .limit(10000);
    rows = data.map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity ?? '',
      resolved: a.resolved ? 'Yes' : 'No',
      createdAt: a.createdAt?.toISOString() ?? '',
    }));
  } else if (type === 'codes') {
    headers = ['token', 'status', 'scanCount', 'lastScannedAt', 'lastScannedCity'];
    const data = await db.select().from(qrCodes)
      .where(eq(qrCodes.brandId, brandId))
      .orderBy(desc(qrCodes.createdAt))
      .limit(10000);
    rows = data.map((c) => ({
      token: c.token,
      status: c.status ?? '',
      scanCount: c.scanCount ?? 0,
      lastScannedAt: c.lastScannedAt?.toISOString() ?? '',
      lastScannedCity: c.lastScannedCity ?? '',
    }));
  } else {
    return apiResponse.badRequest('Invalid export type. Supported: scans, alerts, codes');
  }

  const csvLines = [headers.join(',')];
  for (const row of rows) {
    csvLines.push(headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','));
  }

  return new Response(csvLines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
