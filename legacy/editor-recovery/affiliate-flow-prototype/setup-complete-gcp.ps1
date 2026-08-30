# Complete GCP Infrastructure Setup - PowerShell Version
# Run this locally to set up everything

param(
    [string]$ProjectId = "affiliateflow-abzfy",
    [string]$Region = "us-central1",
    [string]$GitHubUsername = ""
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AffiliateFlow - Complete GCP Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check gcloud
if (!(Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Google Cloud SDK not found. Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Check Firebase CLI
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "WARNING: Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Check Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git not found. Install from: https://git-scm.com/downloads" -ForegroundColor Red
    exit 1
}

Write-Host "Prerequisites check complete`n" -ForegroundColor Green

# Set active project
Write-Host "Setting GCP project to: $ProjectId" -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable all required APIs
Write-Host "`nEnabling required GCP APIs..." -ForegroundColor Yellow
$apis = @(
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "compute.googleapis.com",
    "container.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "storage.googleapis.com",
    "aiplatform.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --project=$ProjectId 2>$null
}

Write-Host "APIs enabled`n" -ForegroundColor Green

# Initialize Firebase
Write-Host "Initializing Firebase..." -ForegroundColor Yellow
firebase use $ProjectId

# Initialize Git if not already
if (!(Test-Path ".git")) {
    Write-Host "`nInitializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - Complete GCP setup"
}

# Create GitHub repository instructions
if ($GitHubUsername) {
    Write-Host "`nSetting up GitHub repository..." -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/new" -ForegroundColor Cyan
    Write-Host "   2. Repository name: affiliateflow-unified" -ForegroundColor Cyan
    Write-Host "   3. Choose Private" -ForegroundColor Cyan
    Write-Host "   4. Don't initialize with README" -ForegroundColor Cyan
    Write-Host "`n   After creating, run:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/$GitHubUsername/affiliateflow-unified.git" -ForegroundColor Green
    Write-Host "   git branch -M main" -ForegroundColor Green
    Write-Host "   git push -u origin main" -ForegroundColor Green
}

# Setup Workload Identity Federation
Write-Host "`nSetting up Workload Identity Federation..." -ForegroundColor Yellow
Write-Host "   Run the Bash script on WSL or Git Bash:" -ForegroundColor Cyan
Write-Host "   bash setup-workload-identity.sh" -ForegroundColor Green

# Create service account for local development
Write-Host "`nCreating local development service account..." -ForegroundColor Yellow
$saName = "local-dev-$env:USERNAME"
$saEmail = "$saName@$ProjectId.iam.gserviceaccount.com"

gcloud iam service-accounts create $saName `
    --display-name="Local Development - $env:USERNAME" `
    --project=$ProjectId 2>$null

# Grant roles
$roles = @(
    "roles/firebase.admin",
    "roles/cloudfunctions.developer",
    "roles/storage.admin",
    "roles/aiplatform.user"
)

foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:$saEmail" `
        --role="$role" `
        --condition=None 2>$null
}

# Create service account key
Write-Host "Downloading service account key..." -ForegroundColor Yellow
$keyPath = "serviceAccountKey-$ProjectId.json"
gcloud iam service-accounts keys create $keyPath `
    --iam-account=$saEmail `
    --project=$ProjectId

Write-Host "Service account key saved to: $keyPath`n" -ForegroundColor Green

# Update .env files
Write-Host "Updating environment configuration..." -ForegroundColor Yellow

# Create .env.local for development
$envContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$ProjectId

# GCP Configuration  
GCP_PROJECT_ID=$ProjectId
GCP_REGION=$Region

# Service Account
GOOGLE_APPLICATION_CREDENTIALS=./$keyPath

# Backend API (update after Cloud Functions deployment)
NEXT_PUBLIC_API_URL=https://api-XXXXX-uc.a.run.app
"@

Set-Content -Path ".env.local" -Value $envContent

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "NEXT STEPS:`n" -ForegroundColor Yellow

Write-Host "1. Setup GitHub Repository:" -ForegroundColor Cyan
Write-Host "   - Create repo at: https://github.com/new" -ForegroundColor White
Write-Host "   - Name: affiliateflow-unified (Private)" -ForegroundColor White
Write-Host "   - Then run:" -ForegroundColor White
Write-Host "     git remote add origin https://github.com/YOUR_USERNAME/affiliateflow-unified.git" -ForegroundColor Green
Write-Host "     git push -u origin main`n" -ForegroundColor Green

Write-Host "2. Setup Workload Identity Federation:" -ForegroundColor Cyan
Write-Host "   - Run: bash setup-workload-identity.sh" -ForegroundColor Green
Write-Host "   - Add secrets to GitHub repo (will be provided by script)`n" -ForegroundColor White

Write-Host "3. Deploy Infrastructure:" -ForegroundColor Cyan
Write-Host "   - Go to GitHub -> Actions -> Setup GCP Infrastructure -> Run workflow`n" -ForegroundColor Green

Write-Host "4. Deploy Application:" -ForegroundColor Cyan
Write-Host "   - Make any change and push to main branch" -ForegroundColor White
Write-Host "   - GitHub Actions will automatically deploy!`n" -ForegroundColor White

Write-Host "5. Start Local Development:" -ForegroundColor Cyan
Write-Host "   cd client" -ForegroundColor Green
Write-Host "   npm install" -ForegroundColor Green
Write-Host "   npm run dev`n" -ForegroundColor Green

Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Documentation: SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host "Service account key: $keyPath" -ForegroundColor Yellow
Write-Host "`nYou're all set! Work locally and changes auto-deploy!" -ForegroundColor Green
