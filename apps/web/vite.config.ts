import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The browser only ever talks to its own origin; /api is proxied to NestJS.
// Same config serves `vite` (dev) and `vite preview` (e2e against a build).
const apiProxy = {
  '/api': process.env.API_URL ?? 'http://localhost:3000',
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: apiProxy },
  preview: { port: 4173, proxy: apiProxy },
  build: {
    // The GoA web components ship as one ~1.1 MB (≈330 kB gzip) bundle.
    // Accepted for a demo; a production service would measure and code-split.
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
  },
});
