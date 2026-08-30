#!/usr/bin/env pwsh

Write-Host "🚀 Starting Flow Platform Deployment..." -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path ".\firebase.json")) {
    Write-Host "❌ Error: firebase.json not found. Are you in the flow-early-adopters directory?" -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "`n📦 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to Firebase
Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --config .\firebase.json --project flowearlyadopters --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Site: https://flowearlyadopters.web.app" -ForegroundColor Cyan
    
    # Optional: Run Lighthouse audit
    $runAudit = Read-Host "`nRun Lighthouse audit? (y/n)"
    if ($runAudit -eq "y") {
        Write-Host "`n🔍 Running Lighthouse audit..." -ForegroundColor Yellow
        npx lighthouse https://flowearlyadopters.web.app --output html --output-path ./lighthouse-report.html
        Write-Host "✅ Lighthouse report generated: lighthouse-report.html" -ForegroundColor Green
    }
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
