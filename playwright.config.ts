import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke tests against the production build (`vite preview`).
 * Run `npm run build` first. Tests tagged @slow download Pyodide from jsDelivr.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    // The service worker would precache the whole build on every fresh page;
    // e2e/pwa.spec.ts turns it back on for the offline tests.
    serviceWorkers: 'block',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
