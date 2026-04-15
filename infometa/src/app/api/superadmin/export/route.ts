import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brands, products, batches, scans, alerts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get('brandId');
  const type = searchParams.get('type') || 'all'; // all, products, scans, alerts

  if (!brandId) {
    return NextResponse.json({ success: false, error: 'brandId required' }, { status: 400 });
  }

  const brand = await db.query.brands.findFirst({ where: eq(brands.id, brandId) });
  if (!brand) {
    return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
  }

  const rows: string[] = [];

  if (type === 'all' || type === 'products') {
    const data = await db.select().from(products).where(eq(products.brandId, brandId)).orderBy(desc(products.createdAt));
    rows.push('=== PRODUCTS ===');
    rows.push('Name,SKU,Industry,Category,Active,Created');
    data.forEach(p => rows.push(`"${p.name}","${p.sku}","${p.industry}","${p.category ?? ''}",${p.isActive},${p.createdAt}`));
    rows.push('');
  }

  if (type === 'all' || type === 'batches') {
    const data = await db.select().from(batches).where(eq(batches.brandId, brandId)).orderBy(desc(batches.createdAt));
    rows.push('=== BATCHES ===');
    rows.push('BatchCode,TotalUnits,Generated,MfgDate,ExpiryDate,Active');
    data.forEach(b => rows.push(`"${b.batchCode}",${b.totalUnits},${b.generatedUnits},"${b.manufactureDate ?? ''}","${b.expiryDate ?? ''}",${b.isActive}`));
    rows.push('');
  }

  if (type === 'all' || type === 'scans') {
    const data = await db.select().from(scans).where(eq(scans.brandId, brandId)).orderBy(desc(scans.scannedAt)).limit(1000);
    rows.push('=== SCANS (last 1000) ===');
    rows.push('Token,Result,City,Country,ScannedAt');
    data.forEach(s => rows.push(`"${(s.token ?? '').slice(0, 50)}","${s.resultStatus}","${s.city ?? ''}","${s.country ?? ''}","${s.scannedAt}"`));
    rows.push('');
  }

  if (type === 'all' || type === 'alerts') {
    const data = await db.select().from(alerts).where(eq(alerts.brandId, brandId)).orderBy(desc(alerts.createdAt));
    rows.push('=== ALERTS ===');
    rows.push('Type,Severity,Resolved,ScanCount,CreatedAt');
    data.forEach(a => rows.push(`"${a.type}","${a.severity}",${a.resolved},${a.scanCount},"${a.createdAt}"`));
  }

  const csv = rows.join('\n');
  const filename = `${brand.name.replace(/[^a-zA-Z0-9]/g, '_')}_export_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
