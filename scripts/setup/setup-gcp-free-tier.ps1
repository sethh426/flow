# Affiliate Flow - GCP Free Tier Setup Script
# This script sets up all the GCP services we can use for FREE or cheap

param(
    [string]$ProjectId = "affiliateflow-abzfy",
    [string]$Region = "us-central1"
)

Write-Host "🚀 Setting up Affiliate Flow on GCP Free Tier" -ForegroundColor Green
Write-Host "Project: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "📋 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable required APIs (all free tier compatible)
Write-Host "`n🔌 Enabling required APIs..." -ForegroundColor Yellow
$apis = @(
    "run.googleapis.com",                    # Cloud Run (2M requests/month FREE)
    "cloudfunctions.googleapis.com",         # Cloud Functions (2M invocations/month FREE)
    "firestore.googleapis.com",              # Firestore (1GB, 50K reads/day FREE)
    "secretmanager.googleapis.com",          # Secret Manager (6 secrets FREE)
    "cloudscheduler.googleapis.com",         # Cloud Scheduler (3 jobs FREE)
    "cloudtasks.googleapis.com",             # Cloud Tasks (1M tasks/month FREE in us-central1)
    "pubsub.googleapis.com",                 # Pub/Sub (10GB/month FREE)
    "cloudbuild.googleapis.com",             # Cloud Build (120 build-minutes/day FREE)
    "artifactregistry.googleapis.com",       # Artifact Registry (0.5GB FREE)
    "logging.googleapis.com",                # Cloud Logging (50GB/month FREE)
    "monitoring.googleapis.com",             # Cloud Monitoring (FREE allotment)
    "cloudtrace.googleapis.com",             # Cloud Trace (FREE tier)
    "clouderrorreporting.googleapis.com",    # Error Reporting (FREE)
    "iamcredentials.googleapis.com",         # Workload Identity (FREE)
    "sts.googleapis.com",                    # Security Token Service (FREE)
    "aiplatform.googleapis.com",             # Vertex AI (for Gemini API)
    "storage.googleapis.com"                 # Cloud Storage (5GB FREE with Firebase)
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --quiet
}

Write-Host "✅ APIs enabled!" -ForegroundColor Green

# Create service accounts
Write-Host "`n👤 Creating service accounts..." -ForegroundColor Yellow

# Master orchestrator service account
$orchestratorSA = "affiliate-flow-orchestrator"
Write-Host "  Creating $orchestratorSA..." -ForegroundColor Gray
gcloud iam service-accounts create $orchestratorSA `
    --display-name="Affiliate Flow Master Orchestrator" `
    --description="Primary service account for AI orchestration" `
    --quiet 2>$null

# Content generator service account
$contentGenSA = "affiliate-flow-content-gen"
Write-Host "  Creating $contentGenSA..." -ForegroundColor Gray
gcloud iam service-accounts create $contentGenSA `
    --display-name="Affiliate Flow Content Generator" `
    --description="Service account for content generation services" `
    --quiet 2>$null

# Image generator service account
$imageGenSA = "affiliate-flow-image-gen"
Write-Host "  Creating $imageGenSA..." -ForegroundColor Gray
gcloud iam service-accounts create $imageGenSA `
    --display-name="Affiliate Flow Image Generator" `
    --description="Service account for AI image generation" `
    --quiet 2>$null

# Analytics service account
$analyticsSA = "affiliate-flow-analytics"
Write-Host "  Creating $analyticsSA..." -ForegroundColor Gray
gcloud iam service-accounts create $analyticsSA `
    --display-name="Affiliate Flow Analytics" `
    --description="Service account for analytics and reporting" `
    --quiet 2>$null

Write-Host "✅ Service accounts created!" -ForegroundColor Green

# Grant IAM roles
Write-Host "`n🔐 Configuring IAM roles..." -ForegroundColor Yellow

# Orchestrator roles
Write-Host "  Granting roles to $orchestratorSA..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${orchestratorSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/cloudtasks.enqueuer" --quiet 2>$null
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${orchestratorSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/secretmanager.secretAccessor" --quiet 2>$null
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${orchestratorSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/aiplatform.user" --quiet 2>$null
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${orchestratorSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/datastore.user" --quiet 2>$null

# Content generator roles
Write-Host "  Granting roles to $contentGenSA..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${contentGenSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/aiplatform.user" --quiet 2>$null
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${contentGenSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/secretmanager.secretAccessor" --quiet 2>$null

# Image generator roles
Write-Host "  Granting roles to $imageGenSA..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${imageGenSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/aiplatform.user" --quiet 2>$null
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${imageGenSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/storage.objectAdmin" --quiet 2>$null

# Analytics roles
Write-Host "  Granting roles to $analyticsSA..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${analyticsSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/bigquery.dataEditor" --quiet 2>$null
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:${analyticsSA}@${ProjectId}.iam.gserviceaccount.com" `
    --role="roles/datastore.viewer" --quiet 2>$null

Write-Host "✅ IAM roles configured!" -ForegroundColor Green

# Create secrets in Secret Manager
Write-Host "`n🔒 Setting up Secret Manager (6 secrets FREE)..." -ForegroundColor Yellow

# Check if secrets exist
$secrets = @(
    "GEMINI_API_KEY",
    "FIREBASE_CONFIG",
    "NORDSTROM_API_KEY",
    "WEBHOOK_SECRET",
    "ADMIN_API_KEY",
    "DATABASE_URL"
)

foreach ($secret in $secrets) {
    Write-Host "  Creating secret: $secret..." -ForegroundColor Gray
    # Create secret (will fail silently if exists)
    gcloud secrets create $secret --replication-policy="automatic" --quiet 2>$null
}

Write-Host "✅ Secret Manager configured! (Add values manually)" -ForegroundColor Green

# Create Firestore database
Write-Host "`n🗄️ Setting up Firestore Native Mode..." -ForegroundColor Yellow
Write-Host "  Note: If database already exists, this will be skipped" -ForegroundColor Gray
gcloud firestore databases create --region=$Region --quiet 2>$null
Write-Host "✅ Firestore configured!" -ForegroundColor Green

# Create Cloud Storage buckets
Write-Host "`n💾 Creating Cloud Storage buckets..." -ForegroundColor Yellow

$buckets = @(
    "${ProjectId}-content",
    "${ProjectId}-images",
    "${ProjectId}-backups",
    "${ProjectId}-temp"
)

foreach ($bucket in $buckets) {
    Write-Host "  Creating bucket: $bucket..." -ForegroundColor Gray
    gsutil mb -p $ProjectId -l $Region gs://$bucket/ 2>$null
}

Write-Host "✅ Storage buckets created!" -ForegroundColor Green

# Create Cloud Tasks queues
Write-Host "`n📬 Creating Cloud Tasks queues (1M tasks/month FREE in us-central1)..." -ForegroundColor Yellow

$queues = @(
    "content-generation",
    "image-generation",
    "webhook-processing",
    "analytics-jobs"
)

foreach ($queue in $queues) {
    Write-Host "  Creating queue: $queue..." -ForegroundColor Gray
    gcloud tasks queues create $queue --location=$Region --quiet 2>$null
}

Write-Host "✅ Cloud Tasks queues created!" -ForegroundColor Green

# Create Pub/Sub topics
Write-Host "`n📢 Creating Pub/Sub topics (10GB/month FREE)..." -ForegroundColor Yellow

$topics = @(
    "content-requests",
    "image-requests",
    "webhook-events",
    "analytics-events"
)

foreach ($topic in $topics) {
    Write-Host "  Creating topic: $topic..." -ForegroundColor Gray
    gcloud pubsub topics create $topic --quiet 2>$null
}

Write-Host "✅ Pub/Sub topics created!" -ForegroundColor Green

# Create Cloud Scheduler jobs (3 FREE jobs)
Write-Host "`n⏰ Creating Cloud Scheduler jobs (3 FREE jobs)..." -ForegroundColor Yellow

# Job 1: Daily trend discovery
Write-Host "  Creating job: daily-trend-discovery..." -ForegroundColor Gray
gcloud scheduler jobs create http daily-trend-discovery `
    --location=$Region `
    --schedule="0 8 * * *" `
    --uri="https://flow-orchestrator-292572827197.us-central1.run.app/trends/discover" `
    --http-method=POST `
    --quiet 2>$null

# Job 2: Weekly analytics report
Write-Host "  Creating job: weekly-analytics..." -ForegroundColor Gray
gcloud scheduler jobs create http weekly-analytics `
    --location=$Region `
    --schedule="0 9 * * 1" `
    --uri="https://flow-orchestrator-292572827197.us-central1.run.app/analytics/weekly" `
    --http-method=POST `
    --quiet 2>$null

# Job 3: Daily cleanup
Write-Host "  Creating job: daily-cleanup..." -ForegroundColor Gray
gcloud scheduler jobs create http daily-cleanup `
    --location=$Region `
    --schedule="0 2 * * *" `
    --uri="https://flow-orchestrator-292572827197.us-central1.run.app/maintenance/cleanup" `
    --http-method=POST `
    --quiet 2>$null

Write-Host "✅ Cloud Scheduler jobs created!" -ForegroundColor Green

# Create Artifact Registry repository
Write-Host "`n📦 Creating Artifact Registry repository (0.5GB FREE)..." -ForegroundColor Yellow
gcloud artifacts repositories create affiliate-flow `
    --repository-format=docker `
    --location=$Region `
    --description="Docker images for Affiliate Flow services" `
    --quiet 2>$null

Write-Host "✅ Artifact Registry configured!" -ForegroundColor Green

# Summary
Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✨ GCP Free Tier Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Configured Services:" -ForegroundColor Yellow
Write-Host "  ✅ 17 APIs enabled (all free tier compatible)"
Write-Host "  ✅ 4 service accounts created"
Write-Host "  ✅ IAM roles configured"
Write-Host "  ✅ 6 secrets in Secret Manager (FREE tier: 6 secrets)"
Write-Host "  ✅ Firestore Native Mode database"
Write-Host "  ✅ 4 Cloud Storage buckets (5GB FREE with Firebase)"
Write-Host "  ✅ 4 Cloud Tasks queues (1M tasks/month FREE)"
Write-Host "  ✅ 4 Pub/Sub topics (10GB/month FREE)"
Write-Host "  ✅ 3 Cloud Scheduler jobs (3 jobs FREE)"
Write-Host "  ✅ Artifact Registry (0.5GB FREE)"
Write-Host ""
Write-Host "💰 Estimated Monthly Cost: $5-10" -ForegroundColor Green
Write-Host "  • Cloud Run: $3-5 (2M requests/month FREE, then pay-per-use)"
Write-Host "  • Firestore: $0 (within FREE tier limits)"
Write-Host "  • Storage: $0 (within FREE tier limits)"
Write-Host "  • Functions: $0 (within FREE tier limits)"
Write-Host "  • Everything else: $0 (FREE tier)"
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Add secret values:"
Write-Host "     gcloud secrets versions add GEMINI_API_KEY --data-file=-"
Write-Host "  2. Deploy services to Cloud Run:"
Write-Host "     cd services/flow-orchestrator && gcloud run deploy"
Write-Host "  3. Set up Firestore collections:"
Write-Host "     Use Firebase Console or CLI"
Write-Host "  4. Configure monitoring dashboards"
Write-Host "  5. Test all integrations"
Write-Host ""
Write-Host "📚 Documentation: FREE_TIER_STRATEGY.md" -ForegroundColor Cyan
Write-Host ""
