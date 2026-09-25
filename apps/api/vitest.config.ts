import { defineConfig } from 'vitest/config';

// Unit tests: fast, no database, no network.
export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.spec.ts'],
    setupFiles: ['test/setup.ts'],
  },
});
