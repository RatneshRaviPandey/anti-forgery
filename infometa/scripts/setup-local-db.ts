import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

async function setup() {
  console.log('Setting up PGlite database...');
  
  const client = new PGlite('./pgdata');
  const db = drizzle(client, { schema });

  // Create enums
  const enums = [
    `DO $$ BEGIN CREATE TYPE plan AS ENUM ('starter', 'growth', 'enterprise'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE code_status AS ENUM ('active', 'suspicious', 'deactivated'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE scan_result AS ENUM ('authentic', 'suspicious', 'invalid'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE alert_type AS ENUM ('duplicate_scan', 'geo_anomaly', 'scan_spike', 'recall', 'deactivated_use'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE industry AS ENUM ('dairy', 'pharma', 'cosmetics', 'fmcg', 'agro_products', 'electronics', 'auto_parts', 'lubricants', 'supplements', 'beverages', 'luxury', 'industrial_chemicals'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE brand_status AS ENUM ('pending_verification', 'active', 'suspended', 'trial', 'churned'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('owner', 'admin', 'viewer'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
  ];

  for (const e of enums) {
    await db.execute(sql.raw(e));
  }

  // Create tables
  const tables = [
    // brands
    `CREATE TABLE IF NOT EXISTS brands (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      logo_url TEXT,
      website TEXT,
      plan plan DEFAULT 'starter',
      is_active BOOLEAN DEFAULT true,
      api_key TEXT UNIQUE,
      api_key_hash TEXT,
      settings JSONB DEFAULT '{}',
      status brand_status DEFAULT 'pending_verification',
      email_verified BOOLEAN DEFAULT false,
      email_verified_at TIMESTAMP,
      mfa_enabled BOOLEAN DEFAULT false,
      mfa_secret TEXT,
      trial_ends_at TIMESTAMP,
      last_login_at TIMESTAMP,
      login_count INTEGER DEFAULT 0,
      failed_login_count INTEGER DEFAULT 0,
      locked_until TIMESTAMP,
      password_changed_at TIMESTAMP,
      onboarding_complete BOOLEAN DEFAULT false,
      onboarding_step INTEGER DEFAULT 0,
      timezone TEXT DEFAULT 'Asia/Kolkata',
      country TEXT DEFAULT 'IN',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // products
    `CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      industry industry NOT NULL,
      description TEXT,
      image_url TEXT,
      category TEXT,
      is_active BOOLEAN DEFAULT true,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // batches
    `CREATE TABLE IF NOT EXISTS batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      brand_id UUID REFERENCES brands(id),
      batch_code TEXT UNIQUE NOT NULL,
      manufacture_date DATE,
      expiry_date DATE,
      total_units INTEGER NOT NULL,
      generated_units INTEGER DEFAULT 0,
      activated_at TIMESTAMP,
      is_active BOOLEAN DEFAULT false,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // qr_codes
    `CREATE TABLE IF NOT EXISTS qr_codes (
      token TEXT PRIMARY KEY,
      batch_id UUID REFERENCES batches(id),
      product_id UUID REFERENCES products(id),
      brand_id UUID REFERENCES brands(id),
      status code_status DEFAULT 'active',
      scan_count INTEGER DEFAULT 0,
      unique_locations INTEGER DEFAULT 0,
      first_scanned_at TIMESTAMP,
      last_scanned_at TIMESTAMP,
      last_scanned_city TEXT,
      deactivated_at TIMESTAMP,
      deactivated_by TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // scans
    `CREATE TABLE IF NOT EXISTS scans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT NOT NULL,
      product_id UUID,
      brand_id UUID,
      scanned_at TIMESTAMP DEFAULT NOW(),
      result_status scan_result NOT NULL,
      city TEXT,
      country TEXT DEFAULT 'IN',
      lat DECIMAL(9,6),
      lng DECIMAL(9,6),
      device_hash TEXT,
      user_agent TEXT,
      ip_hash TEXT,
      session_id TEXT
    )`,

    // alerts
    `CREATE TABLE IF NOT EXISTS alerts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT,
      product_id UUID,
      brand_id UUID REFERENCES brands(id),
      type alert_type NOT NULL,
      severity TEXT DEFAULT 'medium',
      details JSONB DEFAULT '{}',
      scan_count INTEGER,
      locations JSONB DEFAULT '[]',
      resolved BOOLEAN DEFAULT false,
      resolved_at TIMESTAMP,
      resolved_by TEXT,
      email_sent_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // users
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      brand_id UUID REFERENCES brands(id),
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'viewer',
      avatar_url TEXT,
      last_login_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // audit_logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      brand_id UUID,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      before JSONB,
      after JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // brand_users
    `CREATE TABLE IF NOT EXISTS brand_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      supabase_uid TEXT UNIQUE,
      brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      role user_role DEFAULT 'viewer',
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      mfa_enabled BOOLEAN DEFAULT false,
      mfa_secret TEXT,
      last_login_at TIMESTAMP,
      last_login_ip TEXT,
      last_login_city TEXT,
      failed_attempts INTEGER DEFAULT 0,
      locked_until TIMESTAMP,
      password_changed_at TIMESTAMP,
      must_change_password BOOLEAN DEFAULT false,
      is_super_admin BOOLEAN DEFAULT false,
      invited_by UUID,
      invited_at TIMESTAMP,
      accepted_at TIMESTAMP,
      preferences JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // sessions
    `CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES brand_users(id) ON DELETE CASCADE,
      brand_id UUID REFERENCES brands(id),
      session_token TEXT UNIQUE NOT NULL,
      refresh_token TEXT UNIQUE,
      ip_address TEXT,
      user_agent TEXT,
      city TEXT,
      country TEXT,
      device_type TEXT,
      is_active BOOLEAN DEFAULT true,
      mfa_verified BOOLEAN DEFAULT false,
      expires_at TIMESTAMP NOT NULL,
      last_active_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // invitations
    `CREATE TABLE IF NOT EXISTS invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
      invited_by UUID REFERENCES brand_users(id),
      email TEXT NOT NULL,
      role user_role DEFAULT 'viewer',
      token TEXT UNIQUE NOT NULL,
      token_expires_at TIMESTAMP NOT NULL,
      accepted_at TIMESTAMP,
      revoked_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // password_history
    `CREATE TABLE IF NOT EXISTS password_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES brand_users(id) ON DELETE CASCADE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // login_attempts
    `CREATE TABLE IF NOT EXISTS login_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      ip_address TEXT,
      success BOOLEAN NOT NULL,
      failure_reason TEXT,
      user_agent TEXT,
      attempted_at TIMESTAMP DEFAULT NOW()
    )`,

    // brand_keys
    `CREATE TABLE IF NOT EXISTS brand_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key_id TEXT UNIQUE NOT NULL,
      brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
      brand_name TEXT NOT NULL,
      encryption_key TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT true,
      issued_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP,
      last_used_at TIMESTAMP,
      verify_count INTEGER DEFAULT 0,
      created_by UUID,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,
  ];

  for (const t of tables) {
    await db.execute(sql.raw(t));
    const tableName = t.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    console.log(`  ✓ ${tableName}`);
  }

  // Insert sample data
  console.log('\nSeeding sample data...');
  
  await db.execute(sql.raw(`
    INSERT INTO brands (id, name, email, plan, status, is_active)
    VALUES 
      ('a0000000-0000-0000-0000-000000000001', 'Amul', 'admin@amul.coop', 'enterprise', 'active', true),
      ('a0000000-0000-0000-0000-000000000002', 'Cipla', 'admin@cipla.com', 'growth', 'active', true),
      ('a0000000-0000-0000-0000-000000000003', 'Himalaya', 'admin@himalaya.com', 'starter', 'active', true)
    ON CONFLICT (id) DO NOTHING
  `));
  console.log('  ✓ brands (3 sample)');

  await db.execute(sql.raw(`
    INSERT INTO products (id, brand_id, name, sku, industry)
    VALUES
      ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Amul Butter 500g', 'AMUL-BTR-500', 'dairy'),
      ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Cipla Crocin', 'CIPLA-CRO-10', 'pharma'),
      ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Himalaya Neem Face Wash', 'HIM-NFW-150', 'cosmetics')
    ON CONFLICT (id) DO NOTHING
  `));
  console.log('  ✓ products (3 sample)');

  await db.execute(sql.raw(`
    INSERT INTO batches (id, product_id, brand_id, batch_code, total_units, is_active, activated_at)
    VALUES
      ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'AMUL-2026-Q1-001', 1000, true, NOW()),
      ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'CIPLA-2026-Q1-001', 5000, true, NOW())
    ON CONFLICT (id) DO NOTHING
  `));
  console.log('  ✓ batches (2 sample)');

  // Verify
  const result = await db.execute(sql.raw(`SELECT count(*) as cnt FROM brands`));
  console.log(`\n✅ Database ready! ${result.rows[0].cnt} brands in database.`);
  
  await client.close();
  process.exit(0);
}

setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
