import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// Chromium-Pfad: normal installiert Playwright den Browser selbst (npx playwright install chromium).
// PW_CHROMIUM_PATH erlaubt einen vorinstallierten Browser (z. B. in Sandboxes/CI).
const executablePath =
  process.env.PW_CHROMIUM_PATH && existsSync(process.env.PW_CHROMIUM_PATH) ? process.env.PW_CHROMIUM_PATH : undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    launchOptions: { executablePath },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } } },
    { name: 'mobil', use: { ...devices['Pixel 7'], launchOptions: { executablePath } } },
  ],
  webServer: {
    // --ignore-lock: Astro 7 würde sonst einen Hintergrund-Daemon starten, Playwright sähe „exited early“
    command: 'npx astro preview --port 4321 --ignore-lock',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
