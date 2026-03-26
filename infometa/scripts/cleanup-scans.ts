import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/lib/db/schema';
import { lt } from 'drizzle-orm';

async function main() {
  const days = parseInt(process.argv[2] ?? '90');
  console.log(`🧹 Cleaning up scans older than ${days} days...`);

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const deleted = await db.delete(schema.scans)
    .where(lt(schema.scans.scannedAt, cutoff))
    .returning({ id: schema.scans.id });

  console.log(`✅ Deleted ${deleted.length} old scan records`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
