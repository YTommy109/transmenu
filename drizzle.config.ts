import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// .env.local を読み込む
config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Environment variable DATABASE_URL is not set.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
});
