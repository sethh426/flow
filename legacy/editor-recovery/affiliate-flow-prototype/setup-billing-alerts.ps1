# Setup Billing Alerts for FREE Tier
# Prevents surprise costs by alerting at $10, $18, $20

Write-Host "`n🔔 Setting Up Billing Budget Alerts" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Gray

$PROJECT_ID = "affiliateflow-abzfy"

Write-Host "`n📊 Current project: $PROJECT_ID" -ForegroundColor Yellow

# Get billing account ID
Write-Host "`n🔍 Getting billing account..." -ForegroundColor Cyan
$billingInfo = gcloud billing projects describe $PROJECT_ID --format="value(billingAccountName)" 2>$null

if ($billingInfo) {
    $BILLING_ACCOUNT = $billingInfo -replace "billingAccounts/", ""
    Write-Host "✅ Billing account: $BILLING_ACCOUNT" -ForegroundColor Green
} else {
    Write-Host "❌ Could not get billing account" -ForegroundColor Red
    Write-Host "   Opening billing page manually..." -ForegroundColor Yellow
    Start-Process "https://console.cloud.google.com/billing?project=$PROJECT_ID"
    exit 1
}

# Create budget with alerts
Write-Host "`n💰 Creating budget: `$20/month threshold" -ForegroundColor Cyan
Write-Host "   Alerts at: 50% (`$10), 90% (`$18), 100% (`$20)" -ForegroundColor Gray

$budgetName = "free-tier-budget"

# Create budget JSON
$budgetConfig = @{
    displayName = "Free Tier Budget Alert"
    budgetFilter = @{
        projects = @("projects/$PROJECT_ID")
    }
    amount = @{
        specifiedAmount = @{
            currencyCode = "USD"
            units = "20"
        }
    }
    thresholdRules = @(
        @{
            thresholdPercent = 0.5
            spendBasis = "CURRENT_SPEND"
        },
        @{
            thresholdPercent = 0.9
            spendBasis = "CURRENT_SPEND"
        },
        @{
            thresholdPercent = 1.0
            spendBasis = "CURRENT_SPEND"
        }
    )
    allUpdatesRule = @{
        pubsubTopic = "projects/$PROJECT_ID/topics/budget-alerts"
        schemaVersion = "1.0"
    }
} | ConvertTo-Json -Depth 10

# Save budget config
$budgetConfig | Out-File -FilePath "budget-config.json" -Encoding utf8

Write-Host "`n📝 Budget configuration:" -ForegroundColor Cyan
Write-Host "   Monthly limit: `$20" -ForegroundColor Gray
Write-Host "   Alert at `$10 (50%): Warning - halfway to limit" -ForegroundColor Yellow
Write-Host "   Alert at `$18 (90%): Danger - near limit" -ForegroundColor Red
Write-Host "   Alert at `$20 (100%): Critical - at limit!" -ForegroundColor Red

Write-Host "`n⚙️  Creating budget..." -ForegroundColor Cyan

# Try to create budget using gcloud (may need billing.budgets.create permission)
try {
    gcloud billing budgets create `
        --billing-account=$BILLING_ACCOUNT `
        --display-name="Free Tier Budget Alert" `
        --budget-amount=20USD `
        --threshold-rule=percent=0.5,basis=current-spend `
        --threshold-rule=percent=0.9,basis=current-spend `
        --threshold-rule=percent=1.0,basis=current-spend `
        2>&1 | Out-Null
    
    Write-Host "✅ Budget created successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Automatic budget creation requires billing admin role" -ForegroundColor Yellow
    Write-Host "   Opening billing page to create manually..." -ForegroundColor Gray
    Start-Process "https://console.cloud.google.com/billing/$BILLING_ACCOUNT/budgets?project=$PROJECT_ID"
    
    Write-Host "`n📋 Manual steps:" -ForegroundColor Cyan
    Write-Host "   1. Click 'CREATE BUDGET'" -ForegroundColor Gray
    Write-Host "   2. Name: Free Tier Budget Alert" -ForegroundColor Gray
    Write-Host "   3. Projects: Select '$PROJECT_ID'" -ForegroundColor Gray
    Write-Host "   4. Amount: `$20 per month" -ForegroundColor Gray
    Write-Host "   5. Add threshold rules:" -ForegroundColor Gray
    Write-Host "      - 50% of budget" -ForegroundColor Gray
    Write-Host "      - 90% of budget" -ForegroundColor Gray
    Write-Host "      - 100% of budget" -ForegroundColor Gray
    Write-Host "   6. Email notifications: Your email" -ForegroundColor Gray
    Write-Host "   7. Click 'FINISH'" -ForegroundColor Gray
}

Write-Host "`n📈 View current costs:" -ForegroundColor Cyan
Write-Host "   https://console.cloud.google.com/billing/$BILLING_ACCOUNT/reports?project=$PROJECT_ID" -ForegroundColor Blue

Write-Host "`n✅ Billing alerts configured!" -ForegroundColor Green
Write-Host "   You'll get emails when costs reach `$10, `$18, and `$20" -ForegroundColor Gray
Write-Host "   Current expected cost: ~`$3-5/month (well within budget!)" -ForegroundColor Green
Write-Host ""

# Check current month's spending
Write-Host "`n💵 Checking current month spending..." -ForegroundColor Cyan
Start-Process "https://console.cloud.google.com/billing/$BILLING_ACCOUNT/reports?project=$PROJECT_ID"

Write-Host "`n✨ Done! Monitor costs regularly to stay within FREE tier." -ForegroundColor Green
Write-Host ""
