# Testing Guide for AffiliateFlow

## 🎭 Playwright E2E Testing

### Setup

```powershell
# Install Playwright and browsers
.\scripts\setup\setup-playwright.ps1

# Or manually:
cd client
npm install -D @playwright/test @axe-core/playwright
npx playwright install
```

### Running Tests

```powershell
cd client

# Run all tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/homepage.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests matching pattern
npx playwright test --grep "dashboard"
```

### Viewing Reports

```powershell
# View HTML report
npm run test:e2e:report

# Report opens at: http://localhost:9323
```

### Test Structure

```
client/tests/e2e/
├── homepage.spec.ts          # Homepage tests
├── dashboard.spec.ts         # Dashboard tests
├── content-studio.spec.ts    # Content Studio tests
├── workflows.spec.ts         # Workflow Builder tests
└── accessibility.spec.ts     # A11y tests
```

### Writing Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Your test code
    const element = page.getByRole('button', { name: /click me/i });
    await expect(element).toBeVisible();
    await element.click();
  });
});
```

### Code Generation

Generate test code by recording interactions:

```powershell
cd client
npm run test:e2e:codegen
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** before assertions
3. **Test user flows**, not implementation details
4. **Use accessibility selectors** (getByRole, getByLabel)
5. **Keep tests independent** - no shared state
6. **Use Page Object Model** for complex pages

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📮 Postman API Testing

### Setup

1. Install Postman from https://www.postman.com/downloads/
2. Import collection: `postman/AffiliateFlow-API.postman_collection.json`
3. Import environment: `postman/environments/Local.postman_environment.json`

### Collections

**AffiliateFlow-API Collection** includes:

1. **Health Checks**
   - API Health
   - Orchestrator Health
   - Product Mapper Health

2. **Content Generation**
   - Generate Content
   - Generate Image
   - Get Content History

3. **Product Mapping**
   - Search Products
   - Get Product Details
   - Map Content to Products

4. **Trend Finder**
   - Get Current Trends
   - Analyze Trend
   - Get Trend Suggestions

5. **Workflows**
   - List Workflows
   - Create Workflow
   - Get Workflow
   - Execute Workflow
   - Delete Workflow

6. **Analytics**
   - Get Dashboard Stats
   - Get Performance Metrics
   - Track Event

### Environments

Three pre-configured environments:

1. **Local** - http://localhost:3000
2. **Staging** - https://staging.affiliateflow.com
3. **Production** - https://affiliateflow.com

### Variables

Configure these in your environment:

- `base_url` - Frontend URL
- `api_url` - API backend URL
- `auth_token` - Authentication token
- `gemini_api_key` - Gemini API key

### Running Collections

#### Via Postman UI
1. Select environment (Local/Staging/Production)
2. Run entire collection or individual requests
3. View response and test results

#### Via Newman (CLI)
```powershell
# Install Newman
npm install -g newman

# Run collection
newman run postman/AffiliateFlow-API.postman_collection.json `
  -e postman/environments/Local.postman_environment.json `
  --reporters cli,html `
  --reporter-html-export newman-report.html

# Run specific folder
newman run postman/AffiliateFlow-API.postman_collection.json `
  --folder "Health Checks"
```

### Writing Tests

Add tests in the "Tests" tab of each request:

```javascript
// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Verify response structure
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData).to.have.property('status');
});

// Save variables
pm.test("Save auth token", function () {
    const jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.token);
});

// Response time check
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

### Pre-request Scripts

Run code before requests:

```javascript
// Set timestamp
pm.environment.set("timestamp", new Date().toISOString());

// Generate random data
pm.environment.set("random_id", _.random(1000, 9999));

// Log request
console.log(`Making request to: ${pm.request.url}`);
```

### Monitor & Alerts

Set up monitors in Postman to:
- Run collections on schedule
- Monitor API uptime
- Alert on failures
- Track performance trends

---

## 🧪 Test Strategy

### Test Pyramid

```
        /\
       /  \  E2E Tests (Playwright)
      /____\
     /      \
    / API    \ API Tests (Postman)
   /  Tests   \
  /____________\
 /              \
/ Unit Tests     \ Unit Tests (Jest/Vitest)
/________________\
```

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **API Tests**: All endpoints tested
- **E2E Tests**: Critical user flows
- **Accessibility**: WCAG 2.1 AA compliance

### Testing Schedule

**Local Development**:
- Run relevant tests before commit
- Use test:e2e:ui for debugging

**Pre-commit**:
- Unit tests
- Linting
- Type checking

**CI/CD Pipeline**:
- All unit tests
- All API tests
- E2E smoke tests
- Build verification

**Nightly**:
- Full E2E test suite
- Performance tests
- Accessibility audit
- Security scan

---

## 📊 Reporting

### Playwright Reports

- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/junit.xml`

### Postman/Newman Reports

- **CLI Output**: Real-time in terminal
- **HTML Report**: `newman-report.html`
- **JSON Results**: For programmatic analysis

### Metrics to Track

1. **Test Count**: Total, passed, failed, skipped
2. **Coverage**: Code coverage percentage
3. **Duration**: Test execution time
4. **Flakiness**: Test stability over time
5. **Trends**: Pass/fail trends over time

---

## 🔧 Troubleshooting

### Playwright Issues

**Tests timeout**:
```typescript
test.setTimeout(60000); // Increase timeout to 60s
```

**Element not found**:
```typescript
// Wait for element
await page.waitForSelector('[data-testid="element"]');

// Use more specific selectors
await page.getByRole('button', { name: 'Submit' });
```

**Flaky tests**:
```typescript
// Wait for network idle
await page.waitForLoadState('networkidle');

// Retry assertions
await expect(async () => {
  const text = await page.textContent('.status');
  expect(text).toBe('Ready');
}).toPass({ timeout: 5000 });
```

### Postman Issues

**Variables not set**:
- Check environment is selected
- Verify variable names match
- Check scope (global vs environment)

**Authentication fails**:
- Verify auth_token is set
- Check token expiry
- Confirm auth header format

**Request timeout**:
- Increase timeout in Settings
- Check API is running
- Verify network connectivity

---

## 📚 Resources

**Playwright**:
- [Documentation](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

**Postman**:
- [Documentation](https://learning.postman.com/)
- [Newman CLI](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/)
- [Testing Scripts](https://learning.postman.com/docs/writing-scripts/test-scripts/)

**Accessibility**:
- [Axe-core](https://github.com/dequelabs/axe-core)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
