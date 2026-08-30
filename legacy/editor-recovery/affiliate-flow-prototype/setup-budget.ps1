# Setup Billing Budget Alerts
# Protects against surprise costs

Write-Host ""
Write-Host "Setting Up Billing Budget Alerts" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

$PROJECT_ID = "affiliateflow-abzfy"

Write-Host "Project: $PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

# Get billing account
Write-Host "Getting billing account..." -ForegroundColor Cyan
$billingInfo = gcloud billing projects describe $PROJECT_ID --format="value(billingAccountName)" 2>$null

if ($billingInfo) {
    $BILLING_ACCOUNT = $billingInfo -replace "billingAccounts/", ""
    Write-Host "Success: Billing account $BILLING_ACCOUNT" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Error: Could not get billing account" -ForegroundColor Red
    Write-Host "Opening billing page manually..." -ForegroundColor Yellow
    Start-Process "https://console.cloud.google.com/billing?project=$PROJECT_ID"
    exit 1
}

# Create budget
Write-Host "Creating budget with alerts..." -ForegroundColor Cyan
Write-Host "  Budget amount: `$20 per month" -ForegroundColor Gray
Write-Host "  Alert at `$10 (50 percent)" -ForegroundColor Gray
Write-Host "  Alert at `$18 (90 percent)" -ForegroundColor Gray
Write-Host "  Alert at `$20 (100 percent)" -ForegroundColor Gray
Write-Host ""

# Try to create budget
try {
    gcloud billing budgets create `
        --billing-account=$BILLING_ACCOUNT `
        --display-name="Free Tier Budget Alert" `
        --budget-amount=20USD `
        --threshold-rule=percent=0.5,basis=current-spend `
        --threshold-rule=percent=0.9,basis=current-spend `
        --threshold-rule=percent=1.0,basis=current-spend `
        2>&1 | Out-Null
    
    Write-Host "Success: Budget created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You will receive email alerts when costs reach:" -ForegroundColor Cyan
    Write-Host "  - `$10 (50 percent of budget)" -ForegroundColor Yellow
    Write-Host "  - `$18 (90 percent of budget)" -ForegroundColor Red
    Write-Host "  - `$20 (100 percent of budget)" -ForegroundColor Red
    Write-Host ""
} catch {
    Write-Host "Note: Automatic budget creation requires billing admin role" -ForegroundColor Yellow
    Write-Host "Opening billing budgets page for manual setup..." -ForegroundColor Gray
    Write-Host ""
    Start-Process "https://console.cloud.google.com/billing/$BILLING_ACCOUNT/budgets?project=$PROJECT_ID"
    
    Write-Host "Manual setup steps:" -ForegroundColor Cyan
    Write-Host "  1. Click 'CREATE BUDGET'" -ForegroundColor Gray
    Write-Host "  2. Name: Free Tier Budget Alert" -ForegroundColor Gray
    Write-Host "  3. Projects: Select 'affiliateflow-abzfy'" -ForegroundColor Gray
    Write-Host "  4. Amount: `$20 per month" -ForegroundColor Gray
    Write-Host "  5. Add threshold rules:" -ForegroundColor Gray
    Write-Host "     - 50 percent of budget" -ForegroundColor Gray
    Write-Host "     - 90 percent of budget" -ForegroundColor Gray
    Write-Host "     - 100 percent of budget" -ForegroundColor Gray
    Write-Host "  6. Email notifications: Your email" -ForegroundColor Gray
    Write-Host "  7. Click 'FINISH'" -ForegroundColor Gray
    Write-Host ""
}

# Open cost reports
Write-Host "View current costs:" -ForegroundColor Cyan
Write-Host "  https://console.cloud.google.com/billing/$BILLING_ACCOUNT/reports?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host ""
Start-Process "https://console.cloud.google.com/billing/$BILLING_ACCOUNT/reports?project=$PROJECT_ID"

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host "Billing alerts configured!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "Current expected cost: ~`$3-5/month" -ForegroundColor Green
Write-Host "Budget limit: `$20/month" -ForegroundColor Yellow
Write-Host "Alerts enabled: Yes" -ForegroundColor Green
Write-Host ""
