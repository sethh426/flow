# 🧪 Testing & Stability Checklist

## Quick Start

### Fast Check (30 seconds)
```powershell
.\quick-check.ps1
```
Runs basic health checks without building.

### Full Check (3-5 minutes)
```powershell
.\run-all-checks.ps1
```
Comprehensive validation including build, tests, and security audit.

### Individual Checks
```powershell
cd client

# Health check only
npm run health-check

# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# E2E tests
npm run test:e2e
```

---

## 📋 Manual Verification Checklist

### 1. Navigation Tests ✅
- [ ] Sidebar menu items navigate correctly
- [ ] Quick action buttons work
- [ ] All dashboard routes load
- [ ] Browser back/forward buttons work
- [ ] Mobile menu opens/closes
- [ ] Keyboard shortcuts (Alt+0-9) work

### 2. Component Rendering ✅
- [ ] Dashboard overview loads
- [ ] Campaigns page renders
- [ ] Products page renders
- [ ] Trends page renders
- [ ] Content Studio loads
- [ ] Analytics charts display
- [ ] A/B Testing page works
- [ ] Workflows page renders
- [ ] Scheduler page loads
- [ ] Printify Studio renders

### 3. Theme & Styling ✅
- [ ] Light mode displays correctly
- [ ] Dark mode toggle works
- [ ] Neumorphic components render
- [ ] Responsive breakpoints work
- [ ] Mobile view functional
- [ ] Colors have good contrast
- [ ] Fonts load properly

### 4. User Interactions ✅
- [ ] Forms submit correctly
- [ ] Buttons have hover states
- [ ] Modals open/close
- [ ] Dropdowns work
- [ ] Search inputs functional
- [ ] File uploads work
- [ ] Toast notifications appear

### 5. Data Flow ✅
- [ ] API calls succeed
- [ ] Error handling works
- [ ] Loading states display
- [ ] Empty states show
- [ ] Data persists correctly
- [ ] Pagination works

### 6. Performance ✅
- [ ] Initial load < 3 seconds
- [ ] Navigation instant
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Code splitting works

---

## 🔧 Automated Test Coverage

### Current Tests
| Test Type | Coverage | Status |
|-----------|----------|--------|
| App Health Check | Routes, Components, Config | ✅ Ready |
| TypeScript | Type Safety | ✅ Ready |
| Build Test | Production Build | ✅ Ready |
| Linting | Code Quality | ✅ Ready |
| Security Audit | Dependencies | ✅ Ready |
| E2E Tests | User Flows | ⚠️ Basic |

### Test Execution

#### 1. Health Check (Instant)
```bash
node check-app-health.js
```
Validates:
- ✅ All 12 dashboard routes exist
- ✅ All Flowbite components present
- ✅ Configuration files exist
- ✅ Style files loaded
- ✅ Dependencies installed
- ✅ Navigation properly mapped
- ✅ No anti-patterns (console.logs, query params)

#### 2. Type Check (30s)
```bash
npm run type-check
```
Validates:
- ✅ TypeScript compilation
- ✅ Type safety
- ✅ Import paths
- ✅ Interface contracts

#### 3. Build Test (1-2 min)
```bash
npm run build
```
Validates:
- ✅ Production build succeeds
- ✅ Bundle size acceptable
- ✅ No runtime errors
- ✅ Tree shaking works
- ✅ Static generation

#### 4. E2E Tests (1-2 min)
```bash
npm run test:e2e
```
Tests:
- ✅ Homepage loads
- ✅ Dashboard accessible
- ✅ Navigation works
- ✅ Forms submit
- ✅ API integration

---

## 🐛 Common Issues & Fixes

### Issue: Routes not loading
**Check:**
```powershell
# Verify all route files exist
node check-app-health.js
```
**Fix:** Create missing page.tsx files in /dashboard/*

### Issue: Components not found
**Check:**
```powershell
# Verify imports
npm run type-check
```
**Fix:** Update import paths or create missing components

### Issue: Build fails
**Check:**
```powershell
# Check for TypeScript errors
npm run type-check

# Check for syntax errors
npm run lint
```
**Fix:** Resolve type errors and lint warnings

### Issue: Styles not loading
**Check:**
```bash
# Verify style files exist
ls src/styles/*.css
```
**Fix:** Import missing CSS files in layout.tsx

### Issue: Navigation broken
**Check:**
```bash
# Check for query parameters
grep -r "dashboard?tab=" src/
```
**Fix:** Replace query params with proper routes

---

## 📊 Performance Benchmarks

### Target Metrics
| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ✅ |
| Time to Interactive | < 3s | ✅ |
| Total Blocking Time | < 300ms | ✅ |
| Cumulative Layout Shift | < 0.1 | ✅ |
| Bundle Size (JS) | < 500KB | ⚠️ Check |
| Build Time | < 2 min | ✅ |

### Measure Performance
```bash
# Build and analyze
npm run build

# Check bundle sizes
du -sh .next/static/chunks/*

# Lighthouse test (in browser DevTools)
# Run > Lighthouse > Generate Report
```

---

## 🔒 Security Checklist

### Before Deploy
- [ ] Run `npm audit`
- [ ] Check for exposed API keys
- [ ] Validate environment variables
- [ ] Review CORS settings
- [ ] Check authentication flows
- [ ] Verify HTTPS enforcement
- [ ] Test error boundaries
- [ ] Review console output

### Security Scan
```bash
# Dependency audit
npm audit --production

# Check for secrets
git secrets --scan

# OWASP checks (if installed)
npm run security-check
```

---

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Build succeeds
- [ ] No console.logs in production code
- [ ] Code reviewed

### Configuration
- [ ] Environment variables set
- [ ] API endpoints correct
- [ ] Feature flags configured
- [ ] Analytics enabled
- [ ] Error tracking enabled

### Performance
- [ ] Bundle size acceptable
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting active
- [ ] CDN configured

### Final Validation
```powershell
# Run full check suite
.\run-all-checks.ps1

# Manual smoke test
# 1. Visit all major routes
# 2. Test critical user flows
# 3. Verify on mobile
# 4. Test in production mode
```

---

## 📝 Test Results Log

### Latest Run
```
Date: [Add date]
Passed: __/10 checks
Failed: __/10 checks
Warnings: __

Notes:
- 
```

---

## 🔄 Continuous Integration

### GitHub Actions (Recommended)
Create `.github/workflows/test.yml`:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd client && npm install
      - run: cd client && npm run health-check
      - run: cd client && npm run type-check
      - run: cd client && npm run lint
      - run: cd client && npm run build
```

---

## 📞 Support

### Get Help
- Check DOCUMENTATION_MASTER_INDEX.md
- Review error logs in `.next/`
- Run diagnostic: `npm run health-check`
- Check browser console (F12)

### Report Issues
Include:
1. Error message
2. Steps to reproduce
3. Browser/Node version
4. Screenshot if applicable
5. Output from `npm run health-check`
