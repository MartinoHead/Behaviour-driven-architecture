import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/api',
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-api' }]],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/v1/health',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: process.env.BASE_API_URL || 'http://localhost:3000',
  },
});
