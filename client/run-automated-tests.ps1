# Automated Testing Suite with Playwright
# Run all automated tests and generate reports

Write-Host "🎭 Starting Automated Testing Suite..." -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$TestsPassed = 0
$TestsFailed = 0

# ============================================
# 1. Pre-Test Health Check
# ============================================
Write-Host "1️⃣  Running Pre-Test Health Check..." -ForegroundColor Yellow
node check-app-health.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Health check issues detected, but continuing with tests..." -ForegroundColor Yellow
}
Write-Host ""

# ============================================
# 2. Start Dev Server (if not running)
# ============================================
Write-Host "2️⃣  Checking Dev Server..." -ForegroundColor Yellow
$DevServerRunning = $false
try {
    $Response = Invoke-WebRequest -Uri "http://localhost:3000" -Method HEAD -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($Response.StatusCode -eq 200) {
        $DevServerRunning = $true
        Write-Host "✅ Dev server already running on port 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Dev server not running. Please start it with 'npm run dev' in another terminal" -ForegroundColor Yellow
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# ============================================
# 3. Install Playwright Browsers (if needed)
# ============================================
Write-Host "3️⃣  Checking Playwright Browsers..." -ForegroundColor Yellow
if (-not (Test-Path "$env:USERPROFILE\.cache\ms-playwright")) {
    Write-Host "Installing Playwright browsers..." -ForegroundColor Yellow
    npx playwright install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Playwright browsers" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Playwright browsers ready" -ForegroundColor Green
Write-Host ""

# ============================================
# 4. Run E2E Tests
# ============================================
Write-Host "4️⃣  Running End-to-End Tests..." -ForegroundColor Yellow
Write-Host "   Running tests in Chromium, Firefox, and WebKit..." -ForegroundColor Cyan
npm run test:e2e 2>&1 | Tee-Object -Variable TestOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All E2E tests passed" -ForegroundColor Green
    $TestsPassed++
} else {
    Write-Host "❌ Some E2E tests failed" -ForegroundColor Red
    $TestsFailed++
    $ErrorCount++
}
Write-Host ""

# ============================================
# 5. Generate Test Report
# ============================================
Write-Host "5️⃣  Generating Test Reports..." -ForegroundColor Yellow
if (Test-Path "playwright-report") {
    Write-Host "✅ HTML report available at: playwright-report/index.html" -ForegroundColor Green
    Write-Host "   Run 'npm run test:e2e:report' to open it" -ForegroundColor Cyan
}
if (Test-Path "test-results") {
    Write-Host "✅ Test results saved to: test-results/" -ForegroundColor Green
}
Write-Host ""

# ============================================
# 6. Run Accessibility Tests
# ============================================
Write-Host "6️⃣  Running Accessibility Tests..." -ForegroundColor Yellow
npx playwright test tests/e2e/accessibility.spec.ts 2>&1 | Tee-Object -Variable A11yOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Accessibility tests passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Accessibility issues detected (non-blocking)" -ForegroundColor Yellow
}
Write-Host ""

# ============================================
# 7. Test Coverage Summary
# ============================================
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📊 AUTOMATED TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Suites:" -ForegroundColor Yellow
Write-Host "  • Homepage Tests" -ForegroundColor White
Write-Host "  • Dashboard Tests" -ForegroundColor White
Write-Host "  • Workflows Tests" -ForegroundColor White
Write-Host "  • Content Studio Tests" -ForegroundColor White
Write-Host "  • API Tests" -ForegroundColor White
Write-Host "  • Accessibility Tests" -ForegroundColor White
Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "✅ ALL AUTOMATED TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. View detailed report: npm run test:e2e:report" -ForegroundColor White
    Write-Host "  2. Run tests with UI: npm run test:e2e:ui" -ForegroundColor White
    Write-Host "  3. Debug failing tests: npm run test:e2e:debug" -ForegroundColor White
    Write-Host "  4. Generate new tests: npm run test:e2e:codegen" -ForegroundColor White
} else {
    Write-Host "❌ Some tests failed. Please review the output above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Debugging Options:" -ForegroundColor Cyan
    Write-Host "  1. Open test report: npm run test:e2e:report" -ForegroundColor White
    Write-Host "  2. Run tests with UI: npm run test:e2e:ui" -ForegroundColor White
    Write-Host "  3. Debug mode: npm run test:e2e:debug" -ForegroundColor White
    Write-Host "  4. View traces in Playwright Inspector" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
