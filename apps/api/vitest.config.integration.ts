import { defineConfig } from 'vitest/config';

// Integration tests: boot the real Nest app against a real PostgreSQL database
// (docker compose locally, a service container in CI).
export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.integration.spec.ts'],
    setupFiles: ['test/setup.ts'],
    fileParallelism: false, // tests share one database
    testTimeout: 20_000,
  },
});
