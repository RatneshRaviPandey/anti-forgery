import 'dotenv/config';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import pg from 'pg';
import * as schema from '../src/lib/db/schema';
import { v4 as uuid } from 'uuid';

function createDb() {
  const url = process.env.DATABASE_URL!;
  if (url.includes('neon.tech') || url.includes('neon.')) {
    const sql = neon(url);
    return { db: drizzleNeon(sql, { schema }), pool: null };
  }
  const pool = new pg.Pool({ connectionString: url });
  return { db: drizzlePg(pool, { schema }), pool };
}

async function main() {
  console.log('🌱 Seeding database...');

  const { db, pool } = createDb();

  // ── Brands ──────────────────────────────────────────
  const brandIds = [uuid(), uuid(), uuid()];
  await db.insert(schema.brands).values([
    { id: brandIds[0], name: 'PureVeda Organics', email: 'admin@pureveda.in', phone: '+91-9876543210', plan: 'enterprise', website: 'https://pureveda.in' },
    { id: brandIds[1], name: 'TrustPharma India', email: 'ops@trustpharma.in', phone: '+91-9123456789', plan: 'growth', website: 'https://trustpharma.in' },
    { id: brandIds[2], name: 'AgroSafe Exports', email: 'verify@agrosafe.com', phone: '+91-8765432100', plan: 'starter', website: 'https://agrosafe.com' },
  ]).onConflictDoNothing();

  // ── Products ────────────────────────────────────────
  const productData = [
    { brandIdx: 0, name: 'Organic Ghee 1L', sku: 'PV-GH-001', industry: 'dairy' as const },
    { brandIdx: 0, name: 'Cold-Pressed Mustard Oil', sku: 'PV-MO-002', industry: 'dairy' as const },
    { brandIdx: 0, name: 'Organic Honey 500g', sku: 'PV-HN-003', industry: 'dairy' as const },
    { brandIdx: 0, name: 'Turmeric Powder 200g', sku: 'PV-TP-004', industry: 'fmcg' as const },
    { brandIdx: 0, name: 'Ashwagandha Capsules', sku: 'PV-AC-005', industry: 'supplements' as const },
    { brandIdx: 1, name: 'Paracetamol 500mg', sku: 'TP-PA-001', industry: 'pharma' as const },
    { brandIdx: 1, name: 'Amoxicillin 250mg', sku: 'TP-AM-002', industry: 'pharma' as const },
    { brandIdx: 1, name: 'Vitamin D3 Drops', sku: 'TP-VD-003', industry: 'pharma' as const },
    { brandIdx: 1, name: 'Insulin Glargine', sku: 'TP-IG-004', industry: 'pharma' as const },
    { brandIdx: 1, name: 'Cough Syrup 100ml', sku: 'TP-CS-005', industry: 'pharma' as const },
    { brandIdx: 2, name: 'Basmati Rice 5kg', sku: 'AS-BR-001', industry: 'agro_products' as const },
    { brandIdx: 2, name: 'Alphonso Mango Pulp', sku: 'AS-MP-002', industry: 'agro_products' as const },
    { brandIdx: 2, name: 'Cardamom Export Grade', sku: 'AS-CE-003', industry: 'agro_products' as const },
    { brandIdx: 2, name: 'Saffron 1g', sku: 'AS-SF-004', industry: 'agro_products' as const },
    { brandIdx: 2, name: 'Organic Tea Leaves', sku: 'AS-TL-005', industry: 'beverages' as const },
  ];

  const productIds: string[] = [];
  for (const p of productData) {
    const id = uuid();
    productIds.push(id);
    await db.insert(schema.products).values({
      id,
      brandId: brandIds[p.brandIdx],
      name: p.name,
      sku: p.sku,
      industry: p.industry,
      description: `Premium quality ${p.name} with anti-counterfeit protection`,
    }).onConflictDoNothing();
  }

  // ── Batches ─────────────────────────────────────────
  const batchIds: string[] = [];
  for (let i = 0; i < 30; i++) {
    const id = uuid();
    batchIds.push(id);
    const productIdx = i % productIds.length;
    const brandIdx = productData[productIdx].brandIdx;
    const month = String((i % 12) + 1).padStart(2, '0');
    await db.insert(schema.batches).values({
      id,
      productId: productIds[productIdx],
      brandId: brandIds[brandIdx],
      batchCode: `BATCH-2025-${String(i + 1).padStart(3, '0')}`,
      manufactureDate: `2025-${month}-01`,
      expiryDate: `2026-${month}-01`,
      totalUnits: 100,
      generatedUnits: 100,
      isActive: true,
      activatedAt: new Date(),
    }).onConflictDoNothing();
  }

  // ── QR Codes ────────────────────────────────────────
  const crypto = await import('crypto');
  const codeTokens: string[] = [];
  for (let i = 0; i < 3000; i++) {
    const batchIdx = i % batchIds.length;
    const productIdx = Math.floor(batchIdx / 2) % productIds.length;
    const brandIdx = productData[productIdx].brandIdx;
    const token = crypto.randomBytes(16).toString('hex');
    codeTokens.push(token);

    await db.insert(schema.qrCodes).values({
      token,
      batchId: batchIds[batchIdx],
      productId: productIds[productIdx],
      brandId: brandIds[brandIdx],
      status: i % 50 === 0 ? 'suspicious' : i % 100 === 0 ? 'deactivated' : 'active',
    }).onConflictDoNothing();
  }

  // ── Scans ───────────────────────────────────────────
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const results: ('authentic' | 'suspicious' | 'invalid')[] = ['authentic', 'authentic', 'authentic', 'authentic', 'suspicious', 'invalid'];

  for (let i = 0; i < 500; i++) {
    const tokenIdx = i % codeTokens.length;
    const productIdx = Math.floor(tokenIdx / 100) % productIds.length;
    const brandIdx = productData[productIdx].brandIdx;
    const daysAgo = Math.floor(Math.random() * 30);
    const scannedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    await db.insert(schema.scans).values({
      token: codeTokens[tokenIdx],
      productId: productIds[productIdx],
      brandId: brandIds[brandIdx],
      resultStatus: results[i % results.length],
      city: cities[i % cities.length],
      country: 'IN',
      lat: String(18.5 + Math.random() * 10),
      lng: String(72.8 + Math.random() * 8),
      scannedAt,
      ipHash: crypto.randomBytes(8).toString('hex'),
      userAgent: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36',
    });
  }

  // ── Alerts ──────────────────────────────────────────
  const alertTypes: ('duplicate_scan' | 'geo_anomaly' | 'scan_spike' | 'recall' | 'deactivated_use')[] = [
    'duplicate_scan', 'geo_anomaly', 'scan_spike', 'recall', 'deactivated_use',
  ];
  const severities = ['low', 'medium', 'high', 'critical'];

  for (let i = 0; i < 12; i++) {
    const brandIdx = i % 3;
    await db.insert(schema.alerts).values({
      token: codeTokens[i],
      brandId: brandIds[brandIdx],
      type: alertTypes[i % alertTypes.length],
      severity: severities[i % severities.length],
      details: { note: `Seed alert #${i + 1}` },
      scanCount: Math.floor(Math.random() * 20) + 3,
      resolved: i < 4,
      resolvedAt: i < 4 ? new Date() : null,
    });
  }

  console.log('✅ Seeding completed:');
  console.log('   3 brands, 15 products, 30 batches');
  console.log('   3000 QR codes, 500 scans, 12 alerts');
  if (pool) await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
