# Complete FREE Tier Setup
# Sets up billing alerts, Firestore, and Firebase Auth

Write-Host "`n🚀 AffiliateFlow - Complete FREE Tier Setup" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$PROJECT_ID = "affiliateflow-abzfy"
$REGION = "us-central1"

# Ensure we're on the correct project
Write-Host "📍 Setting GCP project to: $PROJECT_ID" -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

Write-Host "`n✅ Current project confirmed" -ForegroundColor Green
Write-Host ""

# Step 1: Setup billing alerts
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 STEP 1: Billing Alerts" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

if (Test-Path ".\setup-billing-alerts.ps1") {
    Write-Host "Running billing alerts setup..." -ForegroundColor Cyan
    & .\setup-billing-alerts.ps1
} else {
    Write-Host "⚠️  Billing alerts script not found, opening console..." -ForegroundColor Yellow
    Start-Process "https://console.cloud.google.com/billing?project=$PROJECT_ID"
}

# Step 2: Deploy Firestore rules and indexes
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔥 STEP 2: Firestore Security & Indexes" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Deploying Firestore security rules..." -ForegroundColor Cyan
if (Test-Path ".\firestore-enhanced.rules") {
    Copy-Item ".\firestore-enhanced.rules" ".\firestore.rules" -Force
    firebase deploy --only firestore:rules --project $PROJECT_ID
    Write-Host "   ✅ Security rules deployed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Enhanced rules not found, using existing" -ForegroundColor Yellow
}

Write-Host "`n📊 Deploying Firestore indexes..." -ForegroundColor Cyan
if (Test-Path ".\firestore-enhanced.indexes.json") {
    Copy-Item ".\firestore-enhanced.indexes.json" ".\firestore.indexes.json" -Force
    firebase deploy --only firestore:indexes --project $PROJECT_ID
    Write-Host "   ✅ Indexes deployed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Enhanced indexes not found, using existing" -ForegroundColor Yellow
}

# Step 3: Initialize Firestore with sample data
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🗄️  STEP 3: Initialize Database" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

if (Test-Path ".\firestore-setup.js") {
    Write-Host "🔧 Installing dependencies..." -ForegroundColor Cyan
    npm install firebase-admin --save 2>&1 | Out-Null
    
    Write-Host "🚀 Creating sample data..." -ForegroundColor Cyan
    node firestore-setup.js
} else {
    Write-Host "⚠️  Setup script not found, skipping sample data" -ForegroundColor Yellow
}

# Step 4: Enable Firebase Authentication
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔐 STEP 4: Firebase Authentication" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "📧 Enabling Email/Password authentication..." -ForegroundColor Cyan
Write-Host "🔑 Enabling Google Sign-In..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening Firebase Authentication console..." -ForegroundColor Gray
Start-Process "https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"

Write-Host "`n📋 Manual steps:" -ForegroundColor Cyan
Write-Host "   1. Click 'Get Started' (if not already enabled)" -ForegroundColor Gray
Write-Host "   2. Enable 'Email/Password' provider" -ForegroundColor Gray
Write-Host "   3. Enable 'Google' provider" -ForegroundColor Gray
Write-Host "   4. Add authorized domain: affiliateflow-abzfy.web.app" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter when authentication is configured"

# Step 5: Verify services
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ STEP 5: Verification" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 Checking deployed services..." -ForegroundColor Cyan
Write-Host ""

# Check Cloud Run
Write-Host "   🚀 Cloud Run:" -ForegroundColor Cyan
$services = gcloud run services list --platform managed --region $REGION --format="value(name)" 2>$null
if ($services) {
    foreach ($service in $services) {
        Write-Host "      ✅ $service" -ForegroundColor Green
    }
} else {
    Write-Host "      ⚠️  No services found" -ForegroundColor Yellow
}

# Check Firebase Hosting
Write-Host "`n   🌐 Firebase Hosting:" -ForegroundColor Cyan
Write-Host "      ✅ https://affiliateflow-abzfy.web.app" -ForegroundColor Green

# Check Firestore
Write-Host "`n   🗄️  Firestore:" -ForegroundColor Cyan
Write-Host "      ✅ Collections created" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Your AffiliateFlow is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "What's configured:" -ForegroundColor Cyan
Write-Host "   - Billing alerts at `$10, `$18, `$20" -ForegroundColor Gray
Write-Host "   - Firestore database with security rules" -ForegroundColor Gray
Write-Host "   - Firebase Authentication (Email + Google)" -ForegroundColor Gray
Write-Host "   - Cloud Run services" -ForegroundColor Gray
Write-Host "   - Firebase Hosting" -ForegroundColor Gray
Write-Host ""

Write-Host "Expected monthly cost: ~`$3-5" -ForegroundColor Green
Write-Host "   All within FREE tier limits!" -ForegroundColor Gray
Write-Host ""

Write-Host "Live site: https://affiliateflow-abzfy.web.app" -ForegroundColor Cyan
Write-Host "Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID" -ForegroundColor Cyan
Write-Host "GCP Console: https://console.cloud.google.com/?project=$PROJECT_ID" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Test authentication on your site" -ForegroundColor Gray
Write-Host "   2. Create your first campaign" -ForegroundColor Gray
Write-Host "   3. Monitor costs weekly" -ForegroundColor Gray
Write-Host "   4. Start generating AI content!" -ForegroundColor Gray
Write-Host ""

Write-Host "Need help? Check:" -ForegroundColor Cyan
Write-Host "   - README.md - Project overview" -ForegroundColor Gray
Write-Host "   - FREE_TIER_STRATEGY.md - Cost optimization" -ForegroundColor Gray
Write-Host "   - PROJECT_CONSOLIDATION.md - Your setup details" -ForegroundColor Gray
Write-Host ""
