# Quick Health Check - Fast validation without full build
# Run with: .\quick-check.ps1

Write-Host "⚡ Running Quick Health Checks..." -ForegroundColor Cyan
Write-Host ""

$issues = 0

# 1. Node Health Check
Write-Host "1️⃣  App Structure Check..." -ForegroundColor Yellow
Set-Location client
node check-app-health.js
if ($LASTEXITCODE -ne 0) { $issues++ }
Set-Location ..

# 2. Quick Type Check
Write-Host ""
Write-Host "2️⃣  TypeScript Quick Check..." -ForegroundColor Yellow
Set-Location client
npm run type-check 2>&1 | Select-Object -First 20
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript errors detected" -ForegroundColor Red
    $issues++
} else {
    Write-Host "✅ TypeScript OK" -ForegroundColor Green
}
Set-Location ..

# 3. Check for syntax errors
Write-Host ""
Write-Host "3️⃣  Syntax Check..." -ForegroundColor Yellow
Set-Location client
$lintResult = npm run lint 2>&1 | Select-String "error|warning" | Select-Object -First 10
if ($lintResult) {
    Write-Host "⚠️  Linting issues found:" -ForegroundColor Yellow
    $lintResult | ForEach-Object { Write-Host "   $_" }
    $issues++
} else {
    Write-Host "✅ No syntax errors" -ForegroundColor Green
}
Set-Location ..

# 4. Check server status
Write-Host ""
Write-Host "4️⃣  Checking Dev Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Dev server running on port 3001" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Dev server not responding on port 3001" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
if ($issues -eq 0) {
    Write-Host "✅ Quick check passed! Ready to code." -ForegroundColor Green
} else {
    Write-Host "⚠️  Found $issues issues. Run .\run-all-checks.ps1 for details" -ForegroundColor Yellow
}
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host ""
