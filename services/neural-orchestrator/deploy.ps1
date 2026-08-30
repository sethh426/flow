# ===================================================
# Neural Orchestrator - GCP Deployment Script (PowerShell)
# ===================================================
# This script sets up the complete GCP infrastructure
# for the Neural Orchestrator AI backend on Windows
# ===================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 Neural Orchestrator Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check for required tools
function Test-Command {
    param($CommandName)
    return [bool](Get-Command $CommandName -ErrorAction SilentlyContinue)
}

if (-not (Test-Command gcloud)) {
    Write-Host "❌ gcloud CLI not installed. Visit: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command firebase)) {
    Write-Host "❌ Firebase CLI not installed. Run: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command node)) {
    Write-Host "❌ Node.js not installed. Visit: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Load environment variables
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📝 Copy .env.example to .env and configure:" -ForegroundColor Yellow
    Write-Host "   Copy-Item .env.example .env" -ForegroundColor Yellow
    exit 1
}

# Parse .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

# Validate required environment variables
if (-not $env:GCP_PROJECT) {
    Write-Host "❌ GCP_PROJECT not set in .env" -ForegroundColor Red
    exit 1
}

if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "⚠️  ANTHROPIC_API_KEY not set (Claude models will be unavailable)" -ForegroundColor Yellow
}

if (-not $env:OPENAI_API_KEY) {
    Write-Host "⚠️  OPENAI_API_KEY not set (GPT models will be unavailable)" -ForegroundColor Yellow
}

$GCP_REGION = if ($env:GCP_REGION) { $env:GCP_REGION } else { "us-central1" }

Write-Host "📋 Configuration:" -ForegroundColor Green
Write-Host "   Project: $env:GCP_PROJECT"
Write-Host "   Region: $GCP_REGION"
Write-Host ""

# Set GCP project
Write-Host "🔧 Setting GCP project..." -ForegroundColor Cyan
gcloud config set project $env:GCP_PROJECT

# Enable required APIs
Write-Host "🔌 Enabling GCP APIs..." -ForegroundColor Cyan
gcloud services enable `
    aiplatform.googleapis.com `
    cloudfunctions.googleapis.com `
    firestore.googleapis.com `
    pubsub.googleapis.com `
    secretmanager.googleapis.com `
    cloudscheduler.googleapis.com `
    logging.googleapis.com `
    monitoring.googleapis.com

Write-Host "✅ APIs enabled" -ForegroundColor Green

# Create Pub/Sub topics
Write-Host "📡 Creating Pub/Sub topics..." -ForegroundColor Cyan

$topics = @("ai-routing-events", "ai-requests", "ai-responses")

foreach ($topic in $topics) {
    $exists = gcloud pubsub topics describe $topic 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ℹ️  Topic $topic already exists" -ForegroundColor Gray
    } else {
        gcloud pubsub topics create $topic
        Write-Host "   ✅ Created topic: $topic" -ForegroundColor Green
    }
}

# Initialize Firestore (if not already done)
Write-Host "🗄️  Checking Firestore..." -ForegroundColor Cyan
$firestoreExists = gcloud firestore databases describe --database='(default)' 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Firestore already initialized" -ForegroundColor Green
} else {
    Write-Host "   📝 Initializing Firestore..." -ForegroundColor Yellow
    gcloud firestore databases create --region=$GCP_REGION
    Write-Host "   ✅ Firestore initialized" -ForegroundColor Green
}

# Deploy Firestore indexes
Write-Host "📊 Deploying Firestore indexes..." -ForegroundColor Cyan
firebase deploy --only firestore:indexes --project $env:GCP_PROJECT

# Deploy Firestore security rules
Write-Host "🔐 Deploying Firestore security rules..." -ForegroundColor Cyan
firebase deploy --only firestore:rules --project $env:GCP_PROJECT

# Store API keys in Secret Manager
Write-Host "🔑 Storing API keys in Secret Manager..." -ForegroundColor Cyan

if ($env:ANTHROPIC_API_KEY) {
    $secretExists = gcloud secrets describe anthropic-api-key 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   🔄 Updating anthropic-api-key..." -ForegroundColor Yellow
        $env:ANTHROPIC_API_KEY | gcloud secrets versions add anthropic-api-key --data-file=-
    } else {
        Write-Host "   ✨ Creating anthropic-api-key..." -ForegroundColor Cyan
        $env:ANTHROPIC_API_KEY | gcloud secrets create anthropic-api-key --data-file=-
    }
    Write-Host "   ✅ Anthropic API key stored" -ForegroundColor Green
}

if ($env:OPENAI_API_KEY) {
    $secretExists = gcloud secrets describe openai-api-key 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   🔄 Updating openai-api-key..." -ForegroundColor Yellow
        $env:OPENAI_API_KEY | gcloud secrets versions add openai-api-key --data-file=-
    } else {
        Write-Host "   ✨ Creating openai-api-key..." -ForegroundColor Cyan
        $env:OPENAI_API_KEY | gcloud secrets create openai-api-key --data-file=-
    }
    Write-Host "   ✅ OpenAI API key stored" -ForegroundColor Green
}

# Grant Secret Manager access to Cloud Functions service account
Write-Host "🔓 Granting Secret Manager access..." -ForegroundColor Cyan
$PROJECT_NUMBER = gcloud projects describe $env:GCP_PROJECT --format="value(projectNumber)"
$SERVICE_ACCOUNT = "$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

if ($env:ANTHROPIC_API_KEY) {
    gcloud secrets add-iam-policy-binding anthropic-api-key `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/secretmanager.secretAccessor" `
        --quiet
}

if ($env:OPENAI_API_KEY) {
    gcloud secrets add-iam-policy-binding openai-api-key `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/secretmanager.secretAccessor" `
        --quiet
}

Write-Host "   ✅ Permissions granted" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green

# Build TypeScript
Write-Host "🔨 Building TypeScript..." -ForegroundColor Cyan
npm run build
Write-Host "   ✅ Build complete" -ForegroundColor Green

# Deploy Cloud Functions
Write-Host "☁️  Deploying Cloud Functions..." -ForegroundColor Cyan
firebase deploy --only functions --project $env:GCP_PROJECT

Write-Host ""
Write-Host "✨ Deployment Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Endpoints:" -ForegroundColor Cyan
Write-Host "   https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiRoute"
Write-Host "   https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiAnalyze"
Write-Host "   https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiGenerate"
Write-Host "   https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiCode"
Write-Host "   https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiBatch"
Write-Host "   https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiHealth"
Write-Host ""
Write-Host "📊 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test health endpoint:"
Write-Host "      curl https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiHealth"
Write-Host ""
Write-Host "   2. Make a test request:"
Write-Host @"
      curl -X POST https://$GCP_REGION-$($env:GCP_PROJECT).cloudfunctions.net/aiRoute ``
        -H 'Content-Type: application/json' ``
        -d '{\"type\":\"creative\",\"complexity\":\"simple\",\"context\":\"Hello AI!\",\"priority\":\"speed\"}'
"@
Write-Host ""
Write-Host "   3. View logs:"
Write-Host "      npm run logs"
Write-Host ""
Write-Host "   4. Monitor costs:"
Write-Host "      gcloud logging read 'resource.type=\""cloud_function\""' --limit 50 | Select-String cost"
Write-Host ""
Write-Host "🎉 Your AI Neural Orchestrator is live!" -ForegroundColor Green
