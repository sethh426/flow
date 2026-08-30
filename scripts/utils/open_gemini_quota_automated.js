import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Go to Gemini API quota page
  await page.goto('https://console.cloud.google.com/apis/api/gemini.googleapis.com/quotas', { waitUntil: 'domcontentloaded' });
  console.log('Opened Gemini API Quotas page.');

  // Step 1: Wait for login if needed
  let loggedIn = false;
  try {
    await page.waitForSelector('input[type="email"], input[type="password"], button:has-text("Next")', { timeout: 30000 });
    console.log('Login form detected. Please log in.');
    // Wait for login to complete (look for Google Cloud Console UI)
    await page.waitForSelector('div[role="navigation"], #cloud-shell-launcher', { timeout: 180000 });
    loggedIn = true;
    console.log('Login complete.');
  } catch (e) {
    // If login form not found, assume already logged in
    loggedIn = true;
    console.log('No login form detected, continuing.');
  }

  // Step 2: Wait for project selector if present
  try {
    const projectSelector = await page.$('div[aria-label*="Select a project"], button[aria-label*="Select a project"]');
    if (projectSelector) {
      await projectSelector.click();
      console.log('Project selector opened. Please select the correct project for Gemini API.');
      // Wait for user to select project
      await page.waitForTimeout(20000);
    }
  } catch (e) {
    console.log('No project selector found or error:', e.message);
  }

  // Step 3: Wait for quotas UI, try multiple selectors and longer timeout
  let quotasLoaded = false;
  try {
    await Promise.race([
      page.waitForSelector('text=Quotas', { timeout: 120000 }),
      page.waitForSelector('h1:has-text("Quotas")', { timeout: 120000 }),
      page.waitForSelector('div:has-text("Quota")', { timeout: 120000 }),
      page.waitForSelector('button:has-text("Edit Quotas")', { timeout: 120000 }),
      page.waitForSelector('button:has-text("Request higher quota")', { timeout: 120000 })
    ]);
    quotasLoaded = true;
    console.log('Quotas UI detected.');
  } catch (e) {
    console.log('Could not detect quotas UI after 2 minutes. Please check login or page load.');
  }

  if (quotasLoaded) {
    // Try to select the first quota row (if present)
    const quotaRow = await page.$('tr[data-row-key], tr');
    if (quotaRow) {
      await quotaRow.click();
      console.log('Selected a quota row.');
    }

    // Try to find and click Edit/Request buttons with more robust selectors
    const editButton = await page.$('button:has-text("Edit Quotas"), [aria-label*="Edit Quotas"]');
    const requestButton = await page.$('button:has-text("Request higher quota"), [aria-label*="Request higher quota"]');
    let clicked = false;
    if (editButton) {
      await editButton.click();
      console.log('Clicked Edit Quotas.');
      clicked = true;
    } else if (requestButton) {
      await requestButton.click();
      console.log('Clicked Request higher quota.');
      clicked = true;
    }

    if (clicked) {
      try {
        await page.waitForSelector('input[type="number"], input[type="text"]', { timeout: 20000 });
        const inputs = await page.$$('input[type="number"], input[type="text"]');
        if (inputs.length > 0) {
          await inputs[0].fill('100000');
          console.log('Filled quota request value with 100000 (example).');
        }
        const textarea = await page.$('textarea');
        if (textarea) {
          await textarea.fill('Requesting higher quota for production use of Gemini API.');
          console.log('Filled justification textarea.');
        }
        // Try more robust submit selectors
        const submitButton = await page.$('button:has-text("Submit"), button:has-text("Request"), button:has-text("Send"), [type="submit"]');
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
      console.log('Could not find Edit Quotas or Request higher quota button. Please proceed manually.');
    }
  } else {
    console.log('Please log in if prompted, select the correct project, and proceed manually in the opened browser window.');
  }

  // Keep browser open for manual intervention
  await page.waitForTimeout(900000); // 15 minutes
  await browser.close();
})();
