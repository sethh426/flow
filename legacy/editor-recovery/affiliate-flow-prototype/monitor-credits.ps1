# Monitor GCP Credit Usage in Real-Time
# Run this to see current costs and remaining credits

param(
    [string]$ProjectId = "affiliateflow-abzfy"
)

Write-Host "`n💰 GCP Credit Usage Monitor" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Load saved credit info
if (Test-Path "gcp-credits-verified.json") {
    $creditInfo = Get-Content "gcp-credits-verified.json" | ConvertFrom-Json
    Write-Host "📄 Loaded credit info from verification:" -ForegroundColor Gray
    Write-Host "   Initial credits: `$$($creditInfo.amount)" -ForegroundColor Gray
    Write-Host "   Expiry date: $($creditInfo.expiry)" -ForegroundColor Gray
    Write-Host "   Verified: $($creditInfo.verifiedDate)" -ForegroundColor Gray
    Write-Host ""
}

# Get billing account
$billingAccount = gcloud billing projects describe $ProjectId --format="value(billingAccountName)" 2>$null
$billingId = $billingAccount.Split('/')[-1]

Write-Host "🌐 Opening real-time cost dashboard..." -ForegroundColor Yellow
Start-Process "https://console.cloud.google.com/billing/$billingId/reports?project=$ProjectId"

Write-Host ""
Write-Host "📊 In the dashboard, check:" -ForegroundColor Yellow
Write-Host "  1. Total costs this month (top right)" -ForegroundColor Gray
Write-Host "  2. Credits applied (negative amounts in chart)" -ForegroundColor Gray
Write-Host "  3. Projected costs (forecast line)" -ForegroundColor Gray
Write-Host "  4. Cost breakdown by service" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 KEY THINGS TO VERIFY:" -ForegroundColor Cyan
Write-Host "  • Credits show as NEGATIVE amounts" -ForegroundColor Gray
Write-Host "  • Total cost - Credits = Your actual charge" -ForegroundColor Gray
Write-Host "  • Your actual charge should be near $0" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  If credits aren't applying automatically:" -ForegroundColor Yellow
Write-Host "  1. Credits apply at END of billing period" -ForegroundColor Gray
Write-Host "  2. Some services may not be credit-eligible" -ForegroundColor Gray
Write-Host "  3. Check eligibility: https://cloud.google.com/free/docs/free-cloud-features#free-trial" -ForegroundColor Gray
Write-Host ""

# Query current month costs (requires permissions)
Write-Host "📈 Attempting to fetch current costs..." -ForegroundColor Yellow

$currentMonth = Get-Date -Format "yyyy-MM"
$query = "SELECT 
  service.description,
  ROUND(SUM(cost), 2) as total_cost,
  ROUND(SUM(IFNULL((SELECT SUM(amount) FROM UNNEST(credits)), 0)), 2) as total_credits
FROM \`$ProjectId.billing_export.gcp_billing_export_v1_*\`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
GROUP BY service.description
ORDER BY total_cost DESC
LIMIT 10"

Write-Host "   Querying BigQuery billing export..." -ForegroundColor Gray
bq query --use_legacy_sql=false --format=prettyjson "$query" 2>$null | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Cost data retrieved!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Billing export not set up yet" -ForegroundColor Yellow
    Write-Host "   Set it up here: https://console.cloud.google.com/billing/export" -ForegroundColor Gray
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if any expensive services are running
Write-Host "🔍 Checking for expensive services..." -ForegroundColor Yellow
Write-Host ""

# Check GKE
$gkeClusters = gcloud container clusters list --format="value(name)" 2>$null
if ($gkeClusters) {
    Write-Host "  ⚠️  GKE Clusters found:" -ForegroundColor Yellow
    foreach ($cluster in $gkeClusters) {
        Write-Host "     • $cluster (~$73/month)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✅ No GKE clusters (saving $73/month)" -ForegroundColor Green
}

# Check Cloud Run
$cloudRunServices = gcloud run services list --format="value(metadata.name)" 2>$null
if ($cloudRunServices) {
    $serviceCount = ($cloudRunServices | Measure-Object).Count
    Write-Host "  ✅ Cloud Run services: $serviceCount (free tier: 2M req/mo)" -ForegroundColor Green
}

# Check Vertex AI
$vertexEndpoints = gcloud ai endpoints list --region=us-central1 --format="value(name)" 2>$null
if ($vertexEndpoints) {
    Write-Host "  ⚠️  Vertex AI endpoints found:" -ForegroundColor Yellow
    foreach ($endpoint in $vertexEndpoints) {
        Write-Host "     • $endpoint (costs vary)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✅ No Vertex AI endpoints deployed" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 To stop credit usage immediately:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Delete GKE cluster:" -ForegroundColor Cyan
Write-Host "  gcloud container clusters delete [CLUSTER_NAME] --region=us-central1" -ForegroundColor Gray
Write-Host ""
Write-Host "Delete Vertex AI endpoint:" -ForegroundColor Cyan
Write-Host "  gcloud ai endpoints delete [ENDPOINT_ID] --region=us-central1" -ForegroundColor Gray
Write-Host ""
Write-Host "Cloud Run (free tier - no action needed)" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
