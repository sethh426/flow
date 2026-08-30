# 🎭 Playwright Testing - Quick Reference

## 🚀 Common Commands

```powershell
# Start dev server (required first!)
npm run dev

# Run all tests (headless)
npm run test:e2e

# Run with UI (BEST for development)
npm run test:e2e:ui

# Generate new tests (record your actions)
npm run test:e2e:codegen

# Debug failing tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run automated test suite
.\run-automated-tests.ps1
```

## 🔍 Using Playwright Inspector

### Method 1: UI Mode ⭐ RECOMMENDED
```powershell
npm run test:e2e:ui
```
- Watch mode (auto-reruns)
- Time travel debugging
- Pick locator tool
- Visual test runner

### Method 2: Codegen (Record Tests)
```powershell
npm run test:e2e:codegen
```
1. Browser opens
2. Interact with app
3. Code generates automatically
4. Copy & paste into test file

### Method 3: Trace Viewer (Debug Failed Tests)
```powershell
# After test fails
npx playwright show-trace test-results/<test-name>/trace.zip
```

## 📝 Test File Locations

```
client/tests/e2e/
├── critical-flows.spec.ts      ⭐ Main user journeys
├── visual-regression.spec.ts   📸 Screenshot tests
├── accessibility.spec.ts       ♿ A11y compliance
├── dashboard.spec.ts
├── content-studio.spec.ts
└── api.spec.ts
```

## ✍️ Quick Test Template

```typescript
import { test, expect } from '@playwright/test';

test('my feature works', async ({ page }) => {
  // 1. Navigate
  await page.goto('/my-page');
  
  // 2. Interact
  await page.click('text=Button');
  
  // 3. Verify
  await expect(page.locator('.result')).toBeVisible();
  
  // 4. Screenshot (optional)
  await page.screenshot({ path: 'test-results/my-feature.png' });
});
```

## 🎯 Best Selectors (in order of preference)

1. **Role-based** (Best):
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   ```

2. **Text content**:
   ```typescript
   page.locator('text=Click me')
   ```

3. **Test IDs**:
   ```typescript
   page.locator('[data-testid="submit-btn"]')
   ```

4. **CSS** (Last resort):
   ```typescript
   page.locator('.btn-primary')
   ```

## 🐛 Common Issues & Fixes

### Test times out
```typescript
test.setTimeout(60000); // Increase timeout
await page.waitForLoadState('networkidle');
```

### Element not found
```typescript
await page.waitForSelector('.my-element');
// Or use auto-waiting locators:
await page.locator('.my-element').click(); // Waits automatically
```

### Flaky test
```typescript
// Disable animations
await expect(page).toHaveScreenshot({ animations: 'disabled' });

// Wait for loading to finish
await page.waitForSelector('.loading', { state: 'hidden' });
```

## 📊 Test Reports

```powershell
# HTML report (interactive)
npm run test:e2e:report

# JSON results
cat test-results/results.json

# JUnit XML (for CI)
cat test-results/junit.xml
```

## 🎬 Recording New Tests

```powershell
# Start recording
npm run test:e2e:codegen

# Actions to record:
1. Navigate to page
2. Fill form fields
3. Click buttons
4. Verify results

# Generated code appears in Inspector
# Copy → Paste into test file
```

## 🔄 Visual Regression

```powershell
# Update all snapshots
npx playwright test --update-snapshots

# Update specific test
npx playwright test visual-regression --update-snapshots

# Compare differences
npm run test:e2e:report
```

## ⚡ Pro Tips

1. **Always run `npm run dev` first** before testing
2. **Use UI mode during development** for instant feedback
3. **Use codegen to discover selectors** instead of guessing
4. **Check trace viewer** for failed tests (has full timeline)
5. **Mask dynamic content** in screenshots:
   ```typescript
   await expect(page).toHaveScreenshot({
     mask: [page.locator('.timestamp')]
   });
   ```

---

📖 **Full Guide:** See `PLAYWRIGHT_TESTING_GUIDE.md`
