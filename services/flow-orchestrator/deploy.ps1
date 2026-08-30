# Deploy Flow Orchestrator to Cloud Run
# This script builds and deploys the backend orchestrator to Google Cloud Run

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Flow Orchestrator to Cloud Run..." -ForegroundColor Cyan

# Configuration
$PROJECT_ID = "affiliateflow-abzfy"
$SERVICE_NAME = "flow-orchestrator"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI not found. Please install Google Cloud SDK." -ForegroundColor Red
    exit 1
}

# Set the project
Write-Host "📋 Setting project to $PROJECT_ID..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "🔧 Enabling Cloud Run and Container Registry APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Navigate to orchestrator directory
Set-Location -Path "$PSScriptRoot"

# Build the Docker image
Write-Host "🐋 Building Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag $IMAGE_NAME

# Get the Gemini API key from client/.env.local
$ENV_FILE = "..\..\client\.env.local"
if (Test-Path $ENV_FILE) {
    $GEMINI_KEY = Get-Content $ENV_FILE | Select-String "NEXT_PUBLIC_GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1] }
    Write-Host "✅ Found Gemini API key" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env.local found. You'll need to set GEMINI_API_KEY manually." -ForegroundColor Yellow
    $GEMINI_KEY = ""
}

# Deploy to Cloud Run
Write-Host "☁️  Deploying to Cloud Run..." -ForegroundColor Yellow

$deployArgs = @(
    "run", "deploy", $SERVICE_NAME,
    "--image", $IMAGE_NAME,
    "--platform", "managed",
    "--region", $REGION,
    "--allow-unauthenticated",
    "--memory", "512Mi",
    "--cpu", "1",
    "--min-instances", "0",
    "--max-instances", "10",
    "--port", "8080",
    "--timeout", "3600"
)

if ($GEMINI_KEY) {
    $deployArgs += "--set-env-vars"
    $deployArgs += "GEMINI_API_KEY=$GEMINI_KEY,NODE_ENV=production"
}

& gcloud @deployArgs

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format "value(status.url)"

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Service URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host "🔌 WebSocket URL: $($SERVICE_URL -replace 'https://', 'wss://')/flow-autopilot" -ForegroundColor Cyan
Write-Host ""
Write-Host "Update your frontend to use this WebSocket URL:" -ForegroundColor Yellow
Write-Host "  client/src/components/FlowAutopilot.tsx" -ForegroundColor White
Write-Host ""
