import { chromium } from 'playwright';

(async () => {
  // Launch browser in non-headless mode so you can interact
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Go directly to Gemini API quota page (Service Quotas)
  await page.goto('https://console.cloud.google.com/apis/api/gemini.googleapis.com/quotas', { waitUntil: 'domcontentloaded' });
  console.log('Opened Gemini API Quotas page.');

  // Wait for user to log in and page to load
  await page.waitForSelector('text=Quotas', { timeout: 180000 });
  console.log('Quotas page loaded.');

  // Try to select the first quota row (if present)
  const quotaRow = await page.$('tr[data-row-key]');
  if (quotaRow) {
    await quotaRow.click();
    console.log('Selected the first quota row.');
  }

  // Try to find and click "Edit Quotas" or "Request higher quota"
  const editSelector = 'text=Edit Quotas';
  const requestSelector = 'text=Request higher quota';
  let clicked = false;

  if (await page.$(editSelector)) {
    await page.click(editSelector);
    console.log('Clicked Edit Quotas.');
    clicked = true;
  } else if (await page.$(requestSelector)) {
    await page.click(requestSelector);
    console.log('Clicked Request higher quota.');
    clicked = true;
  }

  // If a quota request form appears, try to fill it with example data
  if (clicked) {
    // Wait for form fields to appear (best effort, selectors may change)
    try {
      await page.waitForSelector('input[type="number"], input[type="text"]', { timeout: 10000 });
      // Fill the first input with a higher value (example: 100000)
      const inputs = await page.$$('input[type="number"], input[type="text"]');
      if (inputs.length > 0) {
        await inputs[0].fill('100000');
        console.log('Filled quota request value with 100000 (example).');
      }
      // Optionally fill a justification textarea
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.fill('Requesting higher quota for production use of Gemini API.');
        console.log('Filled justification textarea.');
      }
      // Try to click the submit/request button (best effort)
      const submitButton = await page.$('button:has-text("Submit"), button:has-text("Request"), button:has-text("Send")');
      if (submitButton) {
        await submitButton.click();
        console.log('Clicked submit/request button.');
      } else {
        console.log('Please review and submit the quota request form manually if needed.');
      }
    } catch (e) {
      console.log('Could not auto-fill quota request form fields:', e.message);
      console.log('Please review and submit the quota request form manually if needed.');
    }
  } else {
    console.log('Please manually request a quota increase for Gemini API.');
  }

  // Wait for user to complete quota request
  await page.waitForTimeout(600000); // 10 minutes
  await browser.close();
})();
