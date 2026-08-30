# Check Google Cloud Credits and Recommend Setup
# This script checks your billing account and recommends the best setup

param(
    [string]$ProjectId = "affiliateflow-abzfy"
)

Write-Host "💰 Checking Google Cloud Credits..." -ForegroundColor Cyan
Write-Host ""

# Set project
gcloud config set project $ProjectId --quiet

# Get billing account
Write-Host "📋 Fetching billing information..." -ForegroundColor Yellow
$billingAccount = gcloud billing projects describe $ProjectId --format="value(billingAccountName)" 2>$null

if (-not $billingAccount) {
    Write-Host "❌ No billing account found for project $ProjectId" -ForegroundColor Red
    Write-Host "   Please link a billing account first:" -ForegroundColor Yellow
    Write-Host "   https://console.cloud.google.com/billing/linkedaccount?project=$ProjectId" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Billing Account: $billingAccount" -ForegroundColor Green
Write-Host ""

# Open billing page to check credits
Write-Host "🌐 Opening billing page to check credits..." -ForegroundColor Yellow
Write-Host "   Look for 'Promotions and credits' section" -ForegroundColor Gray
Write-Host ""

Start-Process "https://console.cloud.google.com/billing/$($billingAccount.Split('/')[-1])/payment?project=$ProjectId"

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "💡 Credit Detection Guide" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "In the billing page that just opened, look for:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣  Free Trial Credits:" -ForegroundColor Yellow
Write-Host "   • Amount: $300" -ForegroundColor Gray
Write-Host "   • Duration: 90 days from signup" -ForegroundColor Gray
Write-Host "   • Status: Check 'Free trial status' section" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Promotional Credits:" -ForegroundColor Yellow
Write-Host "   • Look in 'Promotions and credits' section" -ForegroundColor Gray
Write-Host "   • Common amounts: $50-$500 (from events)" -ForegroundColor Gray
Write-Host "   • Google for Startups: $100K-$200K" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Credit Expiration:" -ForegroundColor Yellow
Write-Host "   • Check expiration dates" -ForegroundColor Gray
Write-Host "   • Plan usage before expiry" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ask user about credits
Write-Host "Do you have active Google Cloud credits? (Y/N): " -ForegroundColor Yellow -NoNewline
$hasCredits = Read-Host

Write-Host ""

if ($hasCredits -eq "Y" -or $hasCredits -eq "y" -or $hasCredits -eq "yes" -or $hasCredits -eq "Yes") {
    # User has credits - recommend premium
    Write-Host "🎉 Great! Let's use the PREMIUM architecture!" -ForegroundColor Green
    Write-Host ""
    Write-Host "How much in credits do you have? (enter amount): $" -NoNewline -ForegroundColor Yellow
    $creditAmount = Read-Host
    Write-Host ""
    
    if ([int]$creditAmount -ge 300) {
        # Sufficient credits for full premium
        Write-Host "✨ You have enough credits for FULL PREMIUM setup!" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "Recommended Services:" -ForegroundColor Yellow
        Write-Host "  ✅ GKE Autopilot ($73/mo) - Production Kubernetes" -ForegroundColor Green
        Write-Host "  ✅ Vertex AI ($50/mo) - Advanced AI capabilities" -ForegroundColor Green
        Write-Host "  ✅ Cloud Deploy ($45/mo) - Progressive deployments" -ForegroundColor Green
        Write-Host "  ✅ Cloud DLP ($10/mo) - Compliance & security" -ForegroundColor Green
        Write-Host "  ✅ BigQuery Unlimited ($20/mo) - Advanced analytics" -ForegroundColor Green
        Write-Host "  ✅ Dataflow ($100/mo) - Real-time streaming" -ForegroundColor Green
        Write-Host ""
        Write-Host "Total: ~$318/month COVERED by your credits" -ForegroundColor Green
        Write-Host "Months covered: ~$([math]::Floor([int]$creditAmount / 318))" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🚀 Run: .\setup-gcp-premium.ps1" -ForegroundColor Magenta
        Write-Host ""
        
    } elseif ([int]$creditAmount -ge 100) {
        # Partial premium
        Write-Host "💡 You have credits for SELECTIVE PREMIUM setup!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Recommended Services:" -ForegroundColor Yellow
        Write-Host "  ✅ GKE Autopilot ($73/mo) - Most important upgrade" -ForegroundColor Green
        Write-Host "  ✅ Vertex AI ($50/mo) - Better AI than free Gemini API" -ForegroundColor Green
        Write-Host "  ⚠️  Cloud Deploy ($45/mo) - Consider if you need progressive rollouts" -ForegroundColor Yellow
        Write-Host "  ❌ Dataflow ($100/mo) - Skip, use Pub/Sub + Functions instead" -ForegroundColor Red
        Write-Host ""
        Write-Host "Recommended Total: ~$123/month" -ForegroundColor Yellow
        Write-Host "Months covered: ~$([math]::Floor([int]$creditAmount / 123))" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🚀 Run: .\setup-gcp-premium.ps1" -ForegroundColor Magenta
        Write-Host "   (Then skip Dataflow setup)" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        # Small credits - hybrid approach
        Write-Host "💡 Limited credits - HYBRID approach recommended!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Recommended Services:" -ForegroundColor Yellow
        Write-Host "  ✅ Vertex AI ($50/mo) - Best bang for buck" -ForegroundColor Green
        Write-Host "  ⚠️  Everything else: Use FREE tier" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Total: ~$50/month" -ForegroundColor Yellow
        Write-Host "Months covered: ~$([math]::Floor([int]$creditAmount / 50))" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🚀 Run: .\setup-gcp-free-tier.ps1" -ForegroundColor Cyan
        Write-Host "   Then enable Vertex AI manually" -ForegroundColor Gray
        Write-Host ""
    }
    
} else {
    # No credits - recommend free tier
    Write-Host "📊 No problem! Let's use the FREE TIER architecture!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Recommended Services:" -ForegroundColor Yellow
    Write-Host "  ✅ Cloud Run ($0-5/mo) - 2M requests/month FREE" -ForegroundColor Green
    Write-Host "  ✅ Firestore ($0/mo) - 50K reads, 20K writes/day FREE" -ForegroundColor Green
    Write-Host "  ✅ Cloud Functions ($0/mo) - 2M invocations/month FREE" -ForegroundColor Green
    Write-Host "  ✅ Gemini API ($0/mo) - 60 req/min FREE" -ForegroundColor Green
    Write-Host "  ✅ Cloud Tasks ($0/mo) - 1M tasks/month FREE" -ForegroundColor Green
    Write-Host "  ✅ Secret Manager ($0/mo) - 6 secrets FREE" -ForegroundColor Green
    Write-Host ""
    Write-Host "Total: $0-5/month" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Run: .\setup-gcp-free-tier.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Tip: Apply for Google for Startups to get $100K-$200K in credits:" -ForegroundColor Yellow
    Write-Host "   https://cloud.google.com/startup" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 More Information:" -ForegroundColor Yellow
Write-Host "  • Free Tier Strategy: FREE_TIER_STRATEGY.md" -ForegroundColor Gray
Write-Host "  • Credits Strategy: GOOGLE_CREDITS_STRATEGY.md" -ForegroundColor Gray
Write-Host "  • Implementation Guide: IMPLEMENTATION_GUIDE.md" -ForegroundColor Gray
Write-Host ""
