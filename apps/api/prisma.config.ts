import { defineConfig } from 'prisma/config';

// Prisma 7 reads connection details from here instead of schema.prisma.
// Load apps/api/.env when present (CI sets DATABASE_URL directly).
try {
  process.loadEnvFile();
} catch {
  // no .env file - rely on the environment
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // `prisma generate` does not need a real database, so fall back to a
    // placeholder rather than failing `npm install` on a fresh clone.
    url:
      process.env.DATABASE_URL ??
      'postgresql://demo:demo@localhost:5432/road_reports',
  },
});
