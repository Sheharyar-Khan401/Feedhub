import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'on',
    video: 'retain-on-failure',
  },
});
