import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/api',
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-api' }]],
  use: {
    baseURL: process.env.BASE_API_URL || 'http://localhost:3000',
  },
});
