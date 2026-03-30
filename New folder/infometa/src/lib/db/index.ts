import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import pg from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || '';

function createDb() {
  if (!databaseUrl) {
    // Placeholder for build time — no actual connection
    const sql = neon('postgresql://placeholder:placeholder@localhost:5432/placeholder');
    return drizzleNeon(sql, { schema });
  }

  // Use Neon HTTP driver for serverless/Neon URLs, otherwise use node-postgres
  if (databaseUrl.includes('neon.tech') || databaseUrl.includes('neon.')) {
    const sql = neon(databaseUrl);
    return drizzleNeon(sql, { schema });
  }

  // Local PostgreSQL via node-postgres (pg)
  const pool = new pg.Pool({ connectionString: databaseUrl });
  return drizzlePg(pool, { schema });
}

export const db = createDb();
