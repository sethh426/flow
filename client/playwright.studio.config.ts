import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/studio",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/serve-export.mjs",
    env: { PORT: "3173" },
    url: "http://127.0.0.1:3173",
    reuseExistingServer: false,
  },
});
