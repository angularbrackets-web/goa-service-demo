import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against production builds: the compiled NestJS API and
 * `vite preview` serving the built web app (which proxies /api to the API).
 * Run `npm run build` first (the root `npm run e2e` script does this).
 */
export const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://demo:demo@localhost:5432/road_reports_test';
export const STAFF_TOKEN = 'e2e-staff-token-1234567890';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run db:deploy -w apps/api && npm run start -w apps/api',
      url: 'http://localhost:3000/api/health',
      env: {
        DATABASE_URL: databaseUrl,
        STAFF_API_TOKEN: STAFF_TOKEN,
        PORT: '3000',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run preview -w apps/web',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
