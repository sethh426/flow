# Deploy Image Generator to Cloud Run
# This script deploys the image-generator service to Google Cloud Run

Write-Host "🚀 Deploying Image Generator to Cloud Run..." -ForegroundColor Cyan

# Check if GEMINI_API_KEY is set
$geminiKey = $env:GEMINI_API_KEY
if (-not $geminiKey) {
    Write-Host "❌ GEMINI_API_KEY environment variable not set!" -ForegroundColor Red
    Write-Host "   Please set it first:" -ForegroundColor Yellow
    Write-Host '   $env:GEMINI_API_KEY = "REDACTED_SECRET"' -ForegroundColor Yellow
    exit 1
}

# Store in Secret Manager if not already there
Write-Host "📦 Creating secret in Secret Manager..." -ForegroundColor Cyan
Write-Output $geminiKey | gcloud secrets create GEMINI_API_KEY --data-file=- --replication-policy=automatic 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Secret already exists, updating..." -ForegroundColor Yellow
    Write-Output $geminiKey | gcloud secrets versions add GEMINI_API_KEY --data-file=-
}

# Deploy to Cloud Run
Write-Host "🎨 Deploying to Cloud Run..." -ForegroundColor Cyan
Set-Location services\image-generator

gcloud run deploy image-generator `
    --source . `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest `
    --memory 1Gi `
    --cpu 1 `
    --timeout 300 `
    --concurrency 80 `
    --min-instances 0 `
    --max-instances 10

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Get the service URL
    $serviceUrl = gcloud run services describe image-generator --region us-central1 --format="value(status.url)"
    Write-Host ""
    Write-Host "🌐 Service URL: $serviceUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Add this to your .env.local file:" -ForegroundColor White
    Write-Host "      IMAGE_GENERATOR_URL=$serviceUrl" -ForegroundColor Cyan
    Write-Host "   2. Restart your Next.js dev server" -ForegroundColor White
    Write-Host "   3. Test content generation in the Content Studio" -ForegroundColor White
}
else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
}

