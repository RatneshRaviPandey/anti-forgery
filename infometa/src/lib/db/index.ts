import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { neon } from '@neondatabase/serverless';
import pg from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || '';

function createDb() {
  if (!databaseUrl || databaseUrl === 'pglite') {
    // Embedded PGlite for local development — no server needed
    const client = new PGlite('./pgdata');
    return drizzlePglite(client, { schema });
  }

  // Use Neon HTTP driver for serverless/Neon URLs
  if (databaseUrl.includes('neon.tech') || databaseUrl.includes('neon.')) {
    const sql = neon(databaseUrl);
    return drizzleNeon(sql, { schema });
  }

  // Local PostgreSQL via node-postgres (pg)
  const pool = new pg.Pool({ connectionString: databaseUrl });
  return drizzlePg(pool, { schema });
}

export const db = createDb();
