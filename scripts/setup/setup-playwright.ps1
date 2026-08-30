# Playwright E2E Testing Setup for AffiliateFlow

Write-Host "🎭 Setting up Playwright E2E Testing..." -ForegroundColor Cyan
Write-Host ""

# Navigate to client directory
Set-Location client

# Install Playwright
Write-Host "📦 Installing Playwright..." -ForegroundColor Yellow
npm install -D @playwright/test@latest

# Install browsers
Write-Host "🌐 Installing browser binaries..." -ForegroundColor Yellow
npx playwright install

# Install additional testing utilities
Write-Host "🔧 Installing testing utilities..." -ForegroundColor Yellow
npm install -D @axe-core/playwright dotenv-cli

Write-Host ""
Write-Host "✅ Playwright installation complete!" -ForegroundColor Green
Write-Host ""

# Navigate back
Set-Location ..

# Create Playwright config
Write-Host "📝 Creating Playwright configuration..." -ForegroundColor Yellow

$playwrightConfig = @"
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like ``await page.goto('/')``. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
"@

Set-Content -Path "client/playwright.config.ts" -Value $playwrightConfig

Write-Host "✅ Configuration created!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run tests: cd client && npm run test:e2e" -ForegroundColor Gray
Write-Host "  2. UI Mode: cd client && npm run test:e2e:ui" -ForegroundColor Gray
Write-Host "  3. View report: cd client && npm run test:e2e:report" -ForegroundColor Gray
Write-Host ""
"@

Set-Content -Path "scripts/setup/setup-playwright.ps1" -Value $content

Write-Host "✅ Setup script created: scripts/setup/setup-playwright.ps1" -ForegroundColor Green
