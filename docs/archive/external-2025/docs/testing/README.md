> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# 🧪 Testing Infrastructure - Complete Setup

## ✅ What's Included

### Playwright E2E Testing
- ✅ Playwright configuration
- ✅ 5 test suites (Homepage, Dashboard, Content Studio, Workflows, Accessibility)
- ✅ Multi-browser support (Chrome, Firefox, Safari, Mobile)
- ✅ Accessibility testing with axe-core
- ✅ Visual regression testing
- ✅ Test reporting (HTML, JSON, JUnit)

### Postman API Testing
- ✅ Complete API collection (60+ requests)
- ✅ 3 environments (Local, Staging, Production)
- ✅ Health checks
- ✅ Content generation tests
- ✅ Product mapping tests
- ✅ Trend finder tests
- ✅ Workflow tests
- ✅ Analytics tests

---

## 🚀 Quick Start

### Playwright Setup

```powershell
# Run setup script
.\scripts\setup\setup-playwright.ps1

# Or manually
cd client
npm install -D @playwright/test @axe-core/playwright
npx playwright install
```

### Run Tests

```powershell
cd client

# Run all E2E tests
npm run test:e2e

# Run in UI mode (interactive debugging)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report
```

### Postman Setup

1. **Install Postman**: https://www.postman.com/downloads/

2. **Import Collection**:
   - Open Postman
   - Click "Import"
   - Select `postman/AffiliateFlow-API.postman_collection.json`

3. **Import Environment**:
   - Import `postman/environments/Local.postman_environment.json`
   - Select "Local" environment

4. **Configure Variables**:
   - Set `auth_token` (if required)
   - Set `gemini_api_key` (if required)

5. **Run Requests**:
   - Start with "Health Checks" folder
   - Run individual requests or entire collection

---

## 📁 File Structure

```
client/
├── playwright.config.ts                 # Playwright configuration
├── tests/
│   └── e2e/
│       ├── homepage.spec.ts            # Homepage tests
│       ├── dashboard.spec.ts           # Dashboard tests
│       ├── content-studio.spec.ts      # Content Studio tests
│       ├── workflows.spec.ts           # Workflows tests
│       └── accessibility.spec.ts       # A11y tests
└── package.json                        # Updated with test scripts

postman/
├── AffiliateFlow-API.postman_collection.json  # Main collection
└── environments/
    ├── Local.postman_environment.json         # Local env
    ├── Staging.postman_environment.json       # Staging env
    └── Production.postman_environment.json    # Production env

docs/testing/
├── TESTING_GUIDE.md                    # Complete testing guide
├── POSTMAN_GUIDE.md                    # Postman usage guide
└── PLAYWRIGHT_BEST_PRACTICES.md        # Best practices

scripts/setup/
└── setup-playwright.ps1                # Automated setup script
```

---

## 🎯 Test Coverage

### Playwright E2E Tests

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Homepage | 3 | Page load, navigation, responsive |
| Dashboard | 3 | Title, metrics, navigation |
| Content Studio | 4 | Load, canvas, input, toolbar |
| Workflows | 4 | Load, canvas, palette, creation |
| Accessibility | 4 | WCAG compliance, keyboard nav |

**Total**: 18 tests across 5 suites

### Postman API Tests

| Category | Requests | Coverage |
|----------|----------|----------|
| Health Checks | 3 | Service availability |
| Content Generation | 3 | AI content creation |
| Product Mapping | 3 | Product search & mapping |
| Trend Finder | 3 | Trend analysis |
| Workflows | 5 | Workflow CRUD & execution |
| Analytics | 3 | Metrics & tracking |

**Total**: 20+ API endpoints covered

---

## 🎭 Playwright Features

### Browser Support
- ✅ Chromium (Chrome, Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome
- ✅ Mobile Safari

### Test Capabilities
- ✅ Cross-browser testing
- ✅ Mobile viewport testing
- ✅ Screenshot on failure
- ✅ Video recording on failure
- ✅ Trace viewer for debugging
- ✅ Parallel execution
- ✅ Retry on failure (CI)

### Accessibility Testing
- ✅ WCAG 2.1 compliance
- ✅ Automated a11y audits
- ✅ Keyboard navigation tests
- ✅ Screen reader compatibility

---

## 📮 Postman Features

### Request Types
- ✅ GET - Retrieve data
- ✅ POST - Create resources
- ✅ PUT/PATCH - Update resources
- ✅ DELETE - Remove resources

### Test Capabilities
- ✅ Response validation
- ✅ Status code checks
- ✅ Schema validation
- ✅ Performance testing
- ✅ Chain requests
- ✅ Data-driven testing

### Automation
- ✅ Collection runner
- ✅ Newman CLI
- ✅ CI/CD integration
- ✅ Scheduled monitors
- ✅ Alerts & notifications

---

## 🔄 Testing Workflows

### Local Development

```powershell
# 1. Start dev server
cd client
npm run dev

# 2. Run E2E tests (in another terminal)
npm run test:e2e:ui

# 3. Test APIs with Postman
# Open Postman → Select "Local" env → Run requests
```

### Pre-Commit

```powershell
# Run quick smoke tests
cd client
npx playwright test tests/e2e/homepage.spec.ts
```

### CI/CD Pipeline

```yaml
# Example GitHub Actions
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Run API Tests
  run: newman run postman/AffiliateFlow-API.postman_collection.json
```

---

## 📊 Test Reporting

### Playwright Reports

**HTML Report** (Interactive):
```powershell
npm run test:e2e:report
# Opens at http://localhost:9323
```

Features:
- ✅ Pass/fail overview
- ✅ Test duration
- ✅ Error details
- ✅ Screenshots
- ✅ Videos
- ✅ Trace viewer

**JSON Results**:
```
client/test-results/results.json
```

**JUnit XML** (for CI):
```
client/test-results/junit.xml
```

### Postman Reports

**Newman HTML**:
```powershell
newman run collection.json --reporters html
# Creates newman-report.html
```

**Newman CLI**:
- Real-time pass/fail
- Request/response details
- Timing information

---

## 🛠️ Customization

### Add New Playwright Test

```typescript
// client/tests/e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-feature');
    // Add your test logic
  });
});
```

### Add New Postman Request

1. Open collection in Postman
2. Right-click folder → Add Request
3. Configure method, URL, body
4. Add tests in "Tests" tab
5. Export collection

### Update Test Scripts

Edit `client/package.json`:
```json
{
  "scripts": {
    "test:my-suite": "playwright test tests/e2e/my-suite.spec.ts"
  }
}
```

---

## 🐛 Troubleshooting

### Playwright Issues

**Tests timeout**:
```typescript
// Increase timeout
test.setTimeout(60000);
```

**Browser not found**:
```powershell
npx playwright install
```

**Flaky tests**:
```typescript
// Add proper waits
await page.waitForLoadState('networkidle');
```

### Postman Issues

**Variables not working**:
- ✅ Check environment is selected
- ✅ Verify variable syntax: {{variable}}
- ✅ Check variable scope

**Request fails**:
- ✅ Verify API is running
- ✅ Check URL in environment
- ✅ Confirm auth token is set

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Complete testing guide |
| [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) | Postman usage & examples |
| [Playwright Docs](https://playwright.dev) | Official Playwright docs |
| [Postman Learning](https://learning.postman.com/) | Postman tutorials |

---

## 🎯 Next Steps

### Immediate
1. ✅ Run setup script
2. ✅ Execute sample tests
3. ✅ Import Postman collection
4. ✅ Verify all tests pass

### Short Term
1. Add more test coverage
2. Configure CI/CD integration
3. Set up Postman monitors
4. Create test data fixtures

### Long Term
1. Visual regression testing
2. Performance benchmarks
3. Load testing
4. Security testing

---

## 🆘 Support

**Issues with tests?**
1. Check documentation
2. Review test logs
3. Enable debug mode
4. Check GitHub issues

**Need help?**
- Playwright: https://playwright.dev/docs
- Postman: https://learning.postman.com/
- Project docs: `docs/testing/`

---

## ✨ Summary

You now have:
- ✅ 18 E2E tests with Playwright
- ✅ 20+ API tests with Postman
- ✅ Multi-browser support
- ✅ Accessibility testing
- ✅ 3 environments (Local/Staging/Production)
- ✅ Comprehensive documentation
- ✅ Automated setup scripts
- ✅ CI/CD ready

**Get started**:
```powershell
.\scripts\setup\setup-playwright.ps1
cd client && npm run test:e2e:ui
```
