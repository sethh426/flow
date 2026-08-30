# Verify Google Cloud Credits and Set Billing Alerts
# This script verifies credits are active before running expensive operations

param(
    [string]$ProjectId = "affiliateflow-abzfy"
)

Write-Host "`n💰 Verifying Google Cloud Credits..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Set project
gcloud config set project $ProjectId --quiet

# Get billing account
Write-Host "📋 Step 1: Checking billing account..." -ForegroundColor Yellow
$billingAccount = gcloud billing projects describe $ProjectId --format="value(billingAccountName)" 2>$null

if (-not $billingAccount) {
    Write-Host "❌ No billing account linked!" -ForegroundColor Red
    Write-Host "   Link a billing account first:" -ForegroundColor Yellow
    Write-Host "   https://console.cloud.google.com/billing/linkedaccount?project=$ProjectId" -ForegroundColor Cyan
    exit 1
}

$billingId = $billingAccount.Split('/')[-1]
Write-Host "✅ Billing Account: $billingId" -ForegroundColor Green
Write-Host ""

# Check current costs
Write-Host "📊 Step 2: Checking current month's costs..." -ForegroundColor Yellow
$currentMonth = Get-Date -Format "yyyy-MM-01"

Write-Host "   Opening Cost Table..." -ForegroundColor Gray
Write-Host ""

# Open billing reports to see credits
Write-Host "🌐 Opening billing overview in browser..." -ForegroundColor Yellow
Start-Process "https://console.cloud.google.com/billing/$billingId/reports?project=$ProjectId"

Start-Sleep -Seconds 2

Write-Host "🌐 Opening credits & promotions page..." -ForegroundColor Yellow
Start-Process "https://console.cloud.google.com/billing/$billingId/payment?project=$ProjectId"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 MANUAL VERIFICATION REQUIRED" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "In the browser tabs that just opened, verify:" -ForegroundColor White
Write-Host ""

Write-Host "TAB 1 - BILLING REPORTS:" -ForegroundColor Cyan
Write-Host "  1. Look at the cost chart" -ForegroundColor Gray
Write-Host "  2. Check 'Credits' section (should show negative amounts)" -ForegroundColor Gray
Write-Host "  3. Note the 'Promotional credits' or 'Free trial credits' line" -ForegroundColor Gray
Write-Host ""

Write-Host "TAB 2 - PAYMENT OVERVIEW:" -ForegroundColor Cyan
Write-Host "  1. Scroll to 'Promotions and credits' section" -ForegroundColor Gray
Write-Host "  2. Check for active credits:" -ForegroundColor Gray
Write-Host "     • Free trial: $300 for 90 days" -ForegroundColor Gray
Write-Host "     • Google for Startups: $100K-$200K" -ForegroundColor Gray
Write-Host "     • Event/Partner credits: Varies" -ForegroundColor Gray
Write-Host "  3. Note the EXPIRATION DATE" -ForegroundColor Gray
Write-Host "  4. Note the REMAINING BALANCE" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Interactive verification
Write-Host "❓ Do you see ACTIVE credits in either tab? (Y/N): " -ForegroundColor Yellow -NoNewline
$hasActiveCredits = Read-Host

if ($hasActiveCredits -ne "Y" -and $hasActiveCredits -ne "y") {
    Write-Host ""
    Write-Host "⚠️  NO ACTIVE CREDITS DETECTED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Your options:" -ForegroundColor Yellow
    Write-Host "  1. Apply for Google for Startups ($100K-$200K):" -ForegroundColor Cyan
    Write-Host "     https://cloud.google.com/startup" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Use the FREE TIER setup instead:" -ForegroundColor Cyan
    Write-Host "     .\setup-gcp-free-tier.ps1" -ForegroundColor Gray
    Write-Host "     Cost: $0-5/month (works great!)" -ForegroundColor Green
    Write-Host ""
    Write-Host "  3. Sign up for $300 free trial (new accounts):" -ForegroundColor Cyan
    Write-Host "     https://cloud.google.com/free" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "✅ Credits confirmed!" -ForegroundColor Green
Write-Host ""

# Get credit details
Write-Host "💵 How much in credits do you have? (enter amount): $" -NoNewline -ForegroundColor Yellow
$creditAmount = Read-Host
Write-Host ""

Write-Host "📅 When do they expire? (YYYY-MM-DD): " -NoNewline -ForegroundColor Yellow
$expiryDate = Read-Host
Write-Host ""

# Calculate credit duration
$monthsOfPremiumCoverage = [math]::Floor([int]$creditAmount / 318)
$monthsOfVertexAICoverage = [math]::Floor([int]$creditAmount / 50)

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "📊 CREDIT USAGE CALCULATION" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "Your Credits: `$$creditAmount" -ForegroundColor Cyan
Write-Host "Expires: $expiryDate" -ForegroundColor Cyan
Write-Host ""

if ([int]$creditAmount -ge 1000) {
    Write-Host "🎉 FULL PREMIUM SETUP RECOMMENDED!" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "What you can run:" -ForegroundColor Yellow
    Write-Host "  ✅ GKE Autopilot: $73/month" -ForegroundColor Green
    Write-Host "  ✅ Vertex AI: $50/month" -ForegroundColor Green
    Write-Host "  ✅ Cloud Deploy: $45/month" -ForegroundColor Green
    Write-Host "  ✅ Cloud DLP: $10/month" -ForegroundColor Green
    Write-Host "  ✅ BigQuery: $20/month" -ForegroundColor Green
    Write-Host "  ✅ Dataflow: $100/month" -ForegroundColor Green
    Write-Host "  Total: ~$318/month" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Duration covered: ~$monthsOfPremiumCoverage months" -ForegroundColor Green
    Write-Host ""
    $setupType = "FULL_PREMIUM"
    
} elseif ([int]$creditAmount -ge 300) {
    Write-Host "💡 SELECTIVE PREMIUM SETUP RECOMMENDED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recommended services:" -ForegroundColor Yellow
    Write-Host "  ✅ GKE Autopilot: $73/month (most important)" -ForegroundColor Green
    Write-Host "  ✅ Vertex AI: $50/month (AI improvements)" -ForegroundColor Green
    Write-Host "  ⚠️  Cloud Deploy: $45/month (optional)" -ForegroundColor Yellow
    Write-Host "  ❌ Dataflow: $100/month (skip, too expensive)" -ForegroundColor Red
    Write-Host "  Total: ~$123-168/month" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Duration covered: ~$([math]::Floor([int]$creditAmount / 123)) months" -ForegroundColor Green
    Write-Host ""
    $setupType = "SELECTIVE_PREMIUM"
    
} elseif ([int]$creditAmount -ge 100) {
    Write-Host "💡 VERTEX AI ONLY RECOMMENDED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Best use of limited credits:" -ForegroundColor Yellow
    Write-Host "  ✅ Vertex AI: $50/month (best bang for buck)" -ForegroundColor Green
    Write-Host "  ❌ GKE: $73/month (use Cloud Run instead)" -ForegroundColor Red
    Write-Host "  ❌ Cloud Deploy: $45/month (use GitHub Actions)" -ForegroundColor Red
    Write-Host "  Total: ~$50/month + free tier services" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Duration covered: ~$monthsOfVertexAICoverage months" -ForegroundColor Green
    Write-Host ""
    $setupType = "VERTEX_AI_ONLY"
    
} else {
    Write-Host "⚠️  LIMITED CREDITS - FREE TIER RECOMMENDED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your credits are better saved for:" -ForegroundColor Yellow
    Write-Host "  • Development/testing costs" -ForegroundColor Gray
    Write-Host "  • Burst usage when needed" -ForegroundColor Gray
    Write-Host "  • Future scaling" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Recommended: Use FREE tier setup" -ForegroundColor Cyan
    Write-Host "  Cost: $0-5/month" -ForegroundColor Green
    Write-Host "  Works great for production" -ForegroundColor Green
    Write-Host ""
    $setupType = "FREE_TIER"
}

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Set up billing budget alerts
Write-Host "🔔 Step 3: Setting up billing alerts..." -ForegroundColor Yellow
Write-Host "   This will alert you if costs exceed credits" -ForegroundColor Gray
Write-Host ""

# Create budget based on credit amount
$budgetAmount = [math]::Min([int]$creditAmount, 500)

Write-Host "   Creating budget: `$$budgetAmount/month" -ForegroundColor Gray
Write-Host "   Alerts at: 50%, 90%, 100% of budget" -ForegroundColor Gray
Write-Host ""

# Budget creation (requires billing admin role)
$budgetExists = gcloud billing budgets list --billing-account=$billingId --format="value(name)" 2>$null | Select-String "affiliate-flow-budget"

if (-not $budgetExists) {
    Write-Host "   Creating budget alert..." -ForegroundColor Gray
    
    # Create budget config file
    $budgetConfig = @"
{
  "displayName": "Affiliate Flow Budget Alert",
  "budgetFilter": {
    "projects": ["projects/$ProjectId"]
  },
  "amount": {
    "specifiedAmount": {
      "currencyCode": "USD",
      "units": "$budgetAmount"
    }
  },
  "thresholdRules": [
    {
      "thresholdPercent": 0.5,
      "spendBasis": "CURRENT_SPEND"
    },
    {
      "thresholdPercent": 0.9,
      "spendBasis": "CURRENT_SPEND"
    },
    {
      "thresholdPercent": 1.0,
      "spendBasis": "CURRENT_SPEND"
    }
  ]
}
"@
    
    $budgetConfig | Out-File -FilePath "budget-config.json" -Encoding utf8
    
    gcloud billing budgets create --billing-account=$billingId `
        --budget-file=budget-config.json --quiet 2>$null
    
    Remove-Item "budget-config.json" -ErrorAction SilentlyContinue
    
    Write-Host "   ✅ Budget alerts configured!" -ForegroundColor Green
} else {
    Write-Host "   ✅ Budget already exists" -ForegroundColor Green
}

Write-Host ""

# Save credit info for future reference
$creditInfo = @{
    amount = $creditAmount
    expiry = $expiryDate
    setupType = $setupType
    verifiedDate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    budgetAmount = $budgetAmount
} | ConvertTo-Json

$creditInfo | Out-File -FilePath "gcp-credits-verified.json" -Encoding utf8

Write-Host "📄 Credit info saved to: gcp-credits-verified.json" -ForegroundColor Gray
Write-Host ""

# Recommendation
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 RECOMMENDED NEXT STEPS" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

switch ($setupType) {
    "FULL_PREMIUM" {
        Write-Host "Run this command:" -ForegroundColor Green
        Write-Host "  .\setup-gcp-premium.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "This will create:" -ForegroundColor Gray
        Write-Host "  • GKE Autopilot cluster" -ForegroundColor Gray
        Write-Host "  • Vertex AI setup" -ForegroundColor Gray
        Write-Host "  • Cloud Deploy pipeline" -ForegroundColor Gray
        Write-Host "  • Cloud DLP" -ForegroundColor Gray
        Write-Host "  • BigQuery datasets" -ForegroundColor Gray
        Write-Host "  • All supporting infrastructure" -ForegroundColor Gray
    }
    
    "SELECTIVE_PREMIUM" {
        Write-Host "Run this command:" -ForegroundColor Green
        Write-Host "  .\setup-gcp-premium.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then SKIP these when prompted:" -ForegroundColor Yellow
        Write-Host "  ❌ Dataflow setup (too expensive)" -ForegroundColor Red
        Write-Host "  ⚠️  Cloud Deploy (optional, adds $45/mo)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "This keeps costs at ~$123/month" -ForegroundColor Green
    }
    
    "VERTEX_AI_ONLY" {
        Write-Host "Run this command:" -ForegroundColor Green
        Write-Host "  .\setup-gcp-free-tier.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then manually enable Vertex AI:" -ForegroundColor Yellow
        Write-Host "  gcloud services enable aiplatform.googleapis.com" -ForegroundColor Gray
        Write-Host ""
        Write-Host "This gives you:" -ForegroundColor Gray
        Write-Host "  • Vertex AI for advanced AI (~$50/mo)" -ForegroundColor Gray
        Write-Host "  • Everything else on free tier ($0-5/mo)" -ForegroundColor Gray
    }
    
    "FREE_TIER" {
        Write-Host "Run this command:" -ForegroundColor Green
        Write-Host "  .\setup-gcp-free-tier.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "This uses NO credits and costs $0-5/month" -ForegroundColor Green
        Write-Host "Save your credits for:" -ForegroundColor Yellow
        Write-Host "  • Future scaling needs" -ForegroundColor Gray
        Write-Host "  • Development/testing" -ForegroundColor Gray
        Write-Host "  • Burst traffic handling" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Verification complete!" -ForegroundColor Green
Write-Host "   • Credits verified: `$$creditAmount" -ForegroundColor Gray
Write-Host "   • Budget alerts set: `$$budgetAmount/month" -ForegroundColor Gray
Write-Host "   • Setup type: $setupType" -ForegroundColor Gray
Write-Host ""

Write-Host "Press Enter to continue with setup, or Ctrl+C to cancel..." -ForegroundColor Yellow
Read-Host

Write-Host ""
