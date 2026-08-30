import { chromium } from 'playwright';

(async () => {
  // Launch browser in non-headless mode so you can interact
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Go to Google Cloud Console billing page
  await page.goto('https://console.cloud.google.com/billing', { waitUntil: 'domcontentloaded' });
  console.log('Opened Google Cloud Billing page.');

  // Wait for user to log in
  await page.waitForSelector('text=Billing accounts', { timeout: 180000 });
  console.log('Billing accounts loaded.');

  // Try to find a link to "Manage billing accounts" or "Upgrade"
  // This is a best-effort guess, as Google may change UI
  const upgradeSelector = 'text=Upgrade' // Button or link
  const manageSelector = 'text=Manage billing accounts';

  if (await page.$(upgradeSelector)) {
    await page.click(upgradeSelector);
    console.log('Clicked Upgrade. Please follow the on-screen instructions to enable billing.');
  } else if (await page.$(manageSelector)) {
    await page.click(manageSelector);
    console.log('Clicked Manage billing accounts. Please select your account and enable billing.');
  } else {
    console.log('Please manually select your billing account and enable billing for Gemini API.');
  }

  // Wait for user to complete billing setup
  await page.waitForTimeout(600000); // 10 minutes
  await browser.close();
})();
