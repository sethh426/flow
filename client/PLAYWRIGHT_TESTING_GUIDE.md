# 🎭 Automated Testing Guide with Playwright

Complete guide for running automated tests, using Playwright Inspector, and maintaining test coverage.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Available Test Commands](#available-test-commands)
3. [Using Playwright Inspector](#using-playwright-inspector)
4. [Test Organization](#test-organization)
5. [Creating New Tests](#creating-new-tests)
6. [Visual Regression Testing](#visual-regression-testing)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
# Already done if you've run npm install
npm install
```

### 2. Install Playwright Browsers
```powershell
npx playwright install
```

### 3. Start Dev Server
```powershell
# In one terminal
npm run dev
```

### 4. Run Tests
```powershell
# In another terminal
npm run test:e2e
```

---

## 📝 Available Test Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all E2E tests in headless mode |
| `npm run test:e2e:ui` | Run tests with Playwright UI (best for development) |
| `npm run test:e2e:headed` | Run tests in headed mode (see browser) |
| `npm run test:e2e:debug` | Run tests in debug mode |
| `npm run test:e2e:report` | Open HTML test report |
| `npm run test:e2e:codegen` | Generate tests using Playwright Codegen |

### PowerShell Scripts

```powershell
# Run complete automated test suite
.\run-automated-tests.ps1

# Run all checks including tests
.\run-all-checks.ps1
```

---

## 🔍 Using Playwright Inspector

### Method 1: UI Mode (Recommended)
```powershell
npm run test:e2e:ui
```

**Features:**
- ✅ Visual test runner
- ✅ Watch mode (re-runs on file changes)
- ✅ Time travel debugging
- ✅ Pick locator tool
- ✅ Screenshot comparison

### Method 2: Debug Mode
```powershell
npm run test:e2e:debug
```

**Features:**
- ✅ Step-by-step execution
- ✅ Pause at breakpoints
- ✅ Inspect page state
- ✅ Console output

### Method 3: Codegen (Generate Tests)
```powershell
npm run test:e2e:codegen
```

**How to use:**
1. Command opens browser
2. Navigate and interact with your app
3. Playwright records your actions
4. Copy generated test code
5. Paste into test file

**Example Recording Session:**
```powershell
# Start recording
npm run test:e2e:codegen

# Now interact with the app:
# 1. Click "Get Started"
# 2. Fill out form
# 3. Click "Submit"
# 4. Copy generated code from Inspector
```

### Method 4: Trace Viewer (Post-Mortem Debugging)
```powershell
# Run test that creates trace
npm run test:e2e

# Open trace from failed test
npx playwright show-trace test-results/<test-name>/trace.zip
```

**Features:**
- ✅ Complete timeline of test execution
- ✅ Network activity
- ✅ Console logs
- ✅ Screenshots at each step
- ✅ DOM snapshots

---

## 📁 Test Organization

```
client/tests/e2e/
├── accessibility.spec.ts      # WCAG compliance tests
├── api.spec.ts                # API endpoint tests
├── content-studio.spec.ts     # Content creation tests
├── critical-flows.spec.ts     # End-to-end user journeys ⭐
├── dashboard.spec.ts          # Dashboard functionality
├── homepage.spec.ts           # Landing page tests
├── visual-regression.spec.ts  # Screenshot comparison ⭐
└── workflows.spec.ts          # Workflow builder tests
```

### Test Categories

| Category | Purpose | Example |
|----------|---------|---------|
| **Critical Flows** | Essential user journeys | Sign up → Create Campaign → Publish |
| **Feature Tests** | Specific feature validation | Content Studio, Workflow Builder |
| **API Tests** | Backend endpoint validation | `/api/products`, `/api/campaigns` |
| **Accessibility** | WCAG compliance | Color contrast, keyboard navigation |
| **Visual Regression** | UI consistency | Screenshot comparisons |

---

## ✍️ Creating New Tests

### 1. Generate Test with Codegen

```powershell
# Start recording on your local dev server
npx playwright codegen http://localhost:3000
```

**Steps:**
1. Interact with your app
2. Playwright generates test code
3. Copy code from Inspector
4. Create new test file

### 2. Manual Test Creation

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // 1. Navigate
    await page.goto('/your-page');
    
    // 2. Interact
    await page.click('button:has-text("Click Me")');
    
    // 3. Assert
    await expect(page.locator('.result')).toBeVisible();
    
    // 4. Screenshot (optional)
    await page.screenshot({ path: 'test-results/feature.png' });
  });
});
```

### 3. Best Practices

✅ **DO:**
- Use descriptive test names
- Wait for network idle: `await page.waitForLoadState('networkidle')`
- Use semantic selectors: `page.getByRole('button', { name: 'Submit' })`
- Take screenshots on critical steps
- Group related tests with `test.describe()`

❌ **DON'T:**
- Rely on brittle selectors (CSS classes that might change)
- Use fixed timeouts unless necessary
- Make tests dependent on each other
- Test implementation details

---

## 📸 Visual Regression Testing

### Update Snapshots

```powershell
# Update all screenshots
npx playwright test --update-snapshots

# Update specific test
npx playwright test visual-regression --update-snapshots
```

### Compare Visual Changes

```powershell
# Run visual tests
npm run test:e2e tests/e2e/visual-regression.spec.ts

# View differences in HTML report
npm run test:e2e:report
```

### Tolerance Configuration

In `playwright.config.ts`:
```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,        // Allow 100 different pixels
    threshold: 0.2,            // 20% threshold
  }
}
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: cd client && npm ci
      
      - name: Install Playwright Browsers
        run: cd client && npx playwright install --with-deps
      
      - name: Build app
        run: cd client && npm run build
      
      - name: Start server
        run: cd client && npm start &
      
      - name: Run tests
        run: cd client && npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: client/playwright-report/
```

### Local CI Simulation

```powershell
# Run tests as they would run in CI
$env:CI="true"
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Issue: Tests timeout

**Solution:**
```typescript
// Increase timeout for slow pages
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  await page.goto('/slow-page');
});
```

### Issue: Element not found

**Solution:**
```typescript
// Wait for element before interacting
await page.waitForSelector('button:has-text("Submit")');
await page.click('button:has-text("Submit")');

// Or use auto-waiting locators
const button = page.locator('button:has-text("Submit")');
await button.click(); // Waits automatically
```

### Issue: Flaky tests

**Solutions:**
1. **Use waitForLoadState:**
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

2. **Add explicit waits:**
   ```typescript
   await page.waitForSelector('.loading-indicator', { state: 'hidden' });
   ```

3. **Enable retries:**
   ```typescript
   test.describe.configure({ retries: 2 });
   ```

### Issue: Visual snapshots differ

**Check:**
1. Different screen sizes?
2. Animations enabled?
3. Dynamic content (dates, random data)?

**Solution:**
```typescript
await expect(page).toHaveScreenshot('page.png', {
  animations: 'disabled',      // Disable animations
  mask: [page.locator('.dynamic-content')], // Mask dynamic areas
});
```

---

## 📊 Test Coverage

### Current Coverage

| Area | Tests | Status |
|------|-------|--------|
| Homepage | 1 | ✅ |
| Dashboard | 10 | ✅ |
| Campaigns | 1 | ✅ |
| Products | 1 | ✅ |
| Content Studio | 1 | ✅ |
| Workflows | 1 | ✅ |
| Analytics | 1 | ✅ |
| Accessibility | 1 | ✅ |
| Visual Regression | 10 | ✅ |
| **TOTAL** | **27** | **✅** |

---

## 🎯 Next Steps

1. **Run first test:**
   ```powershell
   npm run test:e2e:ui
   ```

2. **Generate a test:**
   ```powershell
   npm run test:e2e:codegen
   ```

3. **View test report:**
   ```powershell
   npm run test:e2e:report
   ```

4. **Set up CI/CD:**
   - Add GitHub Actions workflow
   - Configure test environments
   - Set up test reporting

---

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library](https://testing-library.com/docs/queries/about)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)

---

## 💡 Pro Tips

1. **Use Playwright Inspector's "Pick Locator" tool** to find the best selectors
2. **Run tests in UI mode during development** for instant feedback
3. **Use trace viewer** to debug failing tests without re-running
4. **Update snapshots carefully** - review visual changes before accepting
5. **Add tests for bugs** before fixing them to prevent regression

---

**Happy Testing! 🎭**
