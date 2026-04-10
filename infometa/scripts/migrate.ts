import 'dotenv/config';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import { migrate as migrateNeon } from 'drizzle-orm/neon-http/migrator';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

async function main() {
  console.log('🔄 Running database migrations...');

  const url = process.env.DATABASE_URL!;
  const isNeon = url.includes('neon.tech') || url.includes('neon.');

  if (isNeon) {
    const sql = neon(url);
    const db = drizzleNeon(sql);
    await migrateNeon(db, { migrationsFolder: './drizzle' });
  } else {
    const pool = new pg.Pool({ connectionString: url });
    const db = drizzlePg(pool);
    await migratePg(db, { migrationsFolder: './drizzle' });
    await pool.end();
  }

  console.log('✅ Migrations completed successfully');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
