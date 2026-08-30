# Quick Setup - Deploy Firestore Rules and Initialize Data
# Simple script without special characters

Write-Host ""
Write-Host "AffiliateFlow - Quick Setup"
Write-Host "========================================================"
Write-Host ""

$PROJECT_ID = "affiliateflow-abzfy"

# Set project
Write-Host "Setting GCP project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Deploy Firestore rules
Write-Host ""
Write-Host "Deploying Firestore security rules..."
if (Test-Path ".\firestore-enhanced.rules") {
    Copy-Item ".\firestore-enhanced.rules" ".\firestore.rules" -Force
    firebase deploy --only firestore:rules --project $PROJECT_ID
    Write-Host "Success: Security rules deployed"
} else {
    Write-Host "Warning: Enhanced rules not found"
}

# Deploy Firestore indexes
Write-Host ""
Write-Host "Deploying Firestore indexes..."
if (Test-Path ".\firestore-enhanced.indexes.json") {
    Copy-Item ".\firestore-enhanced.indexes.json" ".\firestore.indexes.json" -Force
    firebase deploy --only firestore:indexes --project $PROJECT_ID
    Write-Host "Success: Indexes deployed"
} else {
    Write-Host "Warning: Enhanced indexes not found"
}

# Initialize Firestore with sample data
Write-Host ""
Write-Host "Initializing Firestore with sample data..."
if (Test-Path ".\firestore-setup.js") {
    node firestore-setup.js
} else {
    Write-Host "Warning: Setup script not found"
}

Write-Host ""
Write-Host "========================================================"
Write-Host "Setup Complete!"
Write-Host "========================================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Enable Firebase Auth: https://console.firebase.google.com/project/$PROJECT_ID/authentication"
Write-Host "  2. Set billing alerts: .\setup-billing-alerts.ps1"
Write-Host "  3. Test your site: https://affiliateflow-abzfy.web.app"
Write-Host ""
