import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { brandUsers, brands } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const SUPER_ADMIN_EMAIL    = 'superadmin@infometa.in';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin@2026!';
const SUPER_ADMIN_NAME     = 'Super Admin';

async function seedSuperAdmin() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  // Check if super admin already exists
  const existing = await db.select().from(brandUsers).where(eq(brandUsers.email, SUPER_ADMIN_EMAIL));
  if (existing.length > 0) {
    console.log('Super admin already exists:', SUPER_ADMIN_EMAIL);
    await pool.end();
    return;
  }

  // Get or create a system brand for the super admin
  let systemBrand = await db.select().from(brands).where(eq(brands.name, 'Infometa Platform'));
  if (systemBrand.length === 0) {
    const [created] = await db.insert(brands).values({
      name:           'Infometa Platform',
      email:          'platform@infometa.in',
      plan:           'enterprise',
      status:         'active',
      isActive:       true,
      emailVerified:  true,
      emailVerifiedAt: new Date(),
      country:        'IN',
    }).returning();
    systemBrand = [created];
  }

  const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  const [admin] = await db.insert(brandUsers).values({
    brandId:           systemBrand[0].id,
    email:             SUPER_ADMIN_EMAIL,
    name:              SUPER_ADMIN_NAME,
    passwordHash:      hash,
    role:              'owner',
    isSuperAdmin:      true,
    isActive:          true,
    emailVerified:     true,
    passwordChangedAt: new Date(),
    acceptedAt:        new Date(),
  }).returning();

  console.log('Super admin created successfully!');
  console.log('  Email:', SUPER_ADMIN_EMAIL);
  console.log('  Password:', SUPER_ADMIN_PASSWORD);
  console.log('  User ID:', admin.id);
  console.log('  Brand:', systemBrand[0].name);

  await pool.end();
}

seedSuperAdmin().catch(console.error);
