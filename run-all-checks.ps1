# Comprehensive Testing & Stability Checks
# Run with: .\run-all-checks.ps1

Write-Host "🚀 Starting Comprehensive App Checks..." -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# ============================================
# 1. Health Check
# ============================================
Write-Host "1️⃣  Running App Health Check..." -ForegroundColor Yellow
Set-Location client
node check-app-health.js
if ($LASTEXITCODE -ne 0) {
    $ErrorCount++
}
Set-Location ..

# ============================================
# 2. TypeScript Type Check
# ============================================
Write-Host ""
Write-Host "2️⃣  Running TypeScript Type Check..." -ForegroundColor Yellow
Set-Location client
npm run type-check 2>&1 | Tee-Object -Variable TypeCheckOutput
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript errors found" -ForegroundColor Red
    $ErrorCount++
} else {
    Write-Host "✅ No TypeScript errors" -ForegroundColor Green
}
Set-Location ..

# ============================================
# 3. Build Test
# ============================================
Write-Host ""
Write-Host "3️⃣  Running Production Build Test..." -ForegroundColor Yellow
Set-Location client
npm run build 2>&1 | Tee-Object -Variable BuildOutput
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    $ErrorCount++
} else {
    Write-Host "✅ Build successful" -ForegroundColor Green
}
Set-Location ..

# ============================================
# 4. Lint Check
# ============================================
Write-Host ""
Write-Host "4️⃣  Running ESLint..." -ForegroundColor Yellow
Set-Location client
npm run lint 2>&1 | Tee-Object -Variable LintOutput
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Linting warnings found" -ForegroundColor Yellow
    $WarningCount++
} else {
    Write-Host "✅ No linting issues" -ForegroundColor Green
}
Set-Location ..

# ============================================
# 5. Dependency Audit
# ============================================
Write-Host ""
Write-Host "5️⃣  Running Dependency Security Audit..." -ForegroundColor Yellow
Set-Location client
npm audit --production 2>&1 | Tee-Object -Variable AuditOutput
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Security vulnerabilities found" -ForegroundColor Yellow
    $WarningCount++
} else {
    Write-Host "✅ No security vulnerabilities" -ForegroundColor Green
}
Set-Location ..

# ============================================
# 6. Check for Unused Dependencies
# ============================================
Write-Host ""
Write-Host "6️⃣  Checking for Unused Dependencies..." -ForegroundColor Yellow
Set-Location client
if (Get-Command depcheck -ErrorAction SilentlyContinue) {
    depcheck
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Unused dependencies found" -ForegroundColor Yellow
        $WarningCount++
    }
} else {
    Write-Host "⚠️  depcheck not installed (npm install -g depcheck)" -ForegroundColor Yellow
}
Set-Location ..

# ============================================
# 7. Check Bundle Size
# ============================================
Write-Host ""
Write-Host "7️⃣  Analyzing Bundle Size..." -ForegroundColor Yellow
Set-Location client
if (Test-Path ".next") {
    # Check for build artifacts
    Write-Host "✅ Build artifacts generated" -ForegroundColor Green
    
    # Check for large bundles
    $LargeBundles = Get-ChildItem -Path ".next/static" -Recurse -File | 
                    Where-Object { $_.Length -gt 1MB } |
                    Select-Object Name, @{Name="Size";Expression={"{0:N2} MB" -f ($_.Length / 1MB)}}
    
    if ($LargeBundles.Count -gt 0) {
        Write-Host "⚠️  Large bundle files detected:" -ForegroundColor Yellow
        $LargeBundles | Format-Table -AutoSize
        $WarningCount++
    } else {
        Write-Host "✅ All bundles under 1MB" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  No build artifacts found. Run build first." -ForegroundColor Yellow
}
Set-Location ..

# ============================================
# 8. Check Environment Variables
# ============================================
Write-Host ""
Write-Host "8️⃣  Checking Environment Configuration..." -ForegroundColor Yellow
Set-Location client

$EnvFiles = @(".env.local", ".env", ".env.example")
$EnvFound = $false

foreach ($file in $EnvFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
        $EnvFound = $true
        
        # Check for placeholder values
        $content = Get-Content $file -Raw
        if ($content -match "your-api-key-here|changeme|placeholder") {
            Write-Host "⚠️  Placeholder values detected in $file" -ForegroundColor Yellow
            $WarningCount++
        }
    }
}

if (-not $EnvFound) {
    Write-Host "⚠️  No environment files found" -ForegroundColor Yellow
    $WarningCount++
}
Set-Location ..

# ============================================
# 9. Check Git Status
# ============================================
Write-Host ""
Write-Host "9️⃣  Checking Git Status..." -ForegroundColor Yellow
$GitStatus = git status --porcelain
if ($GitStatus) {
    $UncommittedFiles = ($GitStatus | Measure-Object).Count
    Write-Host "⚠️  $UncommittedFiles uncommitted changes" -ForegroundColor Yellow
    $WarningCount++
} else {
    Write-Host "✅ Working directory clean" -ForegroundColor Green
}

# ============================================
# 10. Check Node & NPM Versions
# ============================================
Write-Host ""
Write-Host "🔟 Checking Node & NPM Versions..." -ForegroundColor Yellow

$NodeVersion = node -v
$NpmVersion = npm -v

Write-Host "   Node: $NodeVersion" -ForegroundColor Cyan
Write-Host "   NPM:  $NpmVersion" -ForegroundColor Cyan

# Check if versions meet minimum requirements
$NodeMajor = [int]($NodeVersion -replace 'v(\d+)\..*', '$1')
if ($NodeMajor -lt 18) {
    Write-Host "⚠️  Node version below 18" -ForegroundColor Yellow
    $WarningCount++
} else {
    Write-Host "✅ Node version acceptable" -ForegroundColor Green
}

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 COMPREHENSIVE CHECK SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED! App is production-ready." -ForegroundColor Green
} elseif ($ErrorCount -eq 0) {
    Write-Host "✅ No critical errors, but $WarningCount warnings found." -ForegroundColor Yellow
} else {
    Write-Host "❌ $ErrorCount critical errors and $WarningCount warnings found." -ForegroundColor Red
    Write-Host "   Please review and fix before deploying." -ForegroundColor Red
}

Write-Host ""
Write-Host "Errors:   $ErrorCount" -ForegroundColor $(if ($ErrorCount -eq 0) { "Green" } else { "Red" })
Write-Host "Warnings: $WarningCount" -ForegroundColor $(if ($WarningCount -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
