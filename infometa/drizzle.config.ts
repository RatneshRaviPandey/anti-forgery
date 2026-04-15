import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || 'pglite';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  ...(databaseUrl === 'pglite'
    ? {
        dialect: 'postgresql',
        driver: 'pglite',
        dbCredentials: { url: './pgdata' },
      }
    : {
        dialect: 'postgresql',
        dbCredentials: { url: databaseUrl },
      }),
  verbose: true,
  strict: true,
});
