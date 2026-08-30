# Pre-Flight Check - Simplified
$ErrorActionPreference = "Continue"

Write-Host "`n========================================"  -ForegroundColor Cyan
Write-Host "Affiliate Flow - Pre-Flight Check" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# Check gcloud auth
Write-Host "1. GCP Authentication..." -ForegroundColor Yellow
$account = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if ($account) {
    Write-Host "   ✓ Authenticated: $account" -ForegroundColor Green
} else {
    Write-Host "   ✗ Not authenticated" -ForegroundColor Red
    $allGood = $false
}

# Check project
Write-Host "`n2. GCP Project..." -ForegroundColor Yellow
$project = gcloud config get-value project 2>$null
if ($project -eq "flow-69826693-f6d27") {
    Write-Host "   ✓ Project: flow-69826693-f6d27" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Project: $project" -ForegroundColor Yellow
    Write-Host "   Run: gcloud config set project flow-69826693-f6d27" -ForegroundColor Gray
}

# Check terraform.tfvars
Write-Host "`n3. Terraform Configuration..." -ForegroundColor Yellow
if (Test-Path ".\terraform\terraform.tfvars") {
    $content = Get-Content ".\terraform\terraform.tfvars" -Raw
    if ($content -match 'sethpina54@gmail.com') {
        Write-Host "   ✓ Configured with email" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Email may not be set" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ terraform.tfvars missing" -ForegroundColor Red
    $allGood = $false
}

# Check tools
Write-Host "`n4. Required Tools..." -ForegroundColor Yellow
$null = terraform version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Terraform installed" -ForegroundColor Green
} else {
    Write-Host "   ✗ Terraform missing" -ForegroundColor Red
    $allGood = $false
}

$null = kubectl version --client 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ kubectl installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠ kubectl missing (optional)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✓ Ready to Deploy!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  .\deploy.ps1 -Action plan`n" -ForegroundColor White
} else {
    Write-Host "✗ Setup Required" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    Write-Host "Fix errors above, then try again.`n" -ForegroundColor Yellow
}
