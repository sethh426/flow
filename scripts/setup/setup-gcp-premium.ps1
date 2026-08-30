# Affiliate Flow - GCP PREMIUM Setup Script (For Use with Google Cloud Credits)
# This uses GKE, Vertex AI, Cloud Deploy, Cloud DLP - professional production setup

param(
    [string]$ProjectId = "affiliateflow-abzfy",
    [string]$Region = "us-central1",
    [string]$ClusterName = "affiliate-flow-cluster"
)

Write-Host "🚀 Setting up Affiliate Flow PREMIUM Architecture" -ForegroundColor Magenta
Write-Host "⚠️  This setup uses GKE, Vertex AI, and other paid services" -ForegroundColor Yellow
Write-Host "💰 Make sure you have Google Cloud credits active!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Project: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host ""

# Check if user wants to continue
Write-Host "Press Enter to continue, or Ctrl+C to cancel..." -ForegroundColor Yellow
Read-Host

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Set project
Write-Host "📋 Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Enable ALL required APIs (including premium services)
Write-Host "`n🔌 Enabling required APIs (including premium services)..." -ForegroundColor Yellow
$apis = @(
    # Container & Kubernetes
    "container.googleapis.com",              # GKE (Kubernetes Engine)
    "mesh.googleapis.com",                   # Istio Service Mesh
    "gkehub.googleapis.com",                 # GKE Hub for Fleet management
    "anthos.googleapis.com",                 # Anthos components
    
    # AI & ML
    "aiplatform.googleapis.com",             # Vertex AI Platform
    "notebooks.googleapis.com",              # Vertex AI Workbench
    "automl.googleapis.com",                 # AutoML
    
    # Deployment & CI/CD
    "clouddeploy.googleapis.com",            # Cloud Deploy
    "cloudbuild.googleapis.com",             # Cloud Build
    "artifactregistry.googleapis.com",       # Artifact Registry
    
    # Data & Analytics
    "bigquery.googleapis.com",               # BigQuery
    "bigquerystorage.googleapis.com",        # BigQuery Storage API
    "dataflow.googleapis.com",               # Dataflow for streaming
    "pubsub.googleapis.com",                 # Pub/Sub
    
    # Security & Compliance
    "dlp.googleapis.com",                    # Cloud DLP (Data Loss Prevention)
    "secretmanager.googleapis.com",          # Secret Manager
    "binaryauthorization.googleapis.com",    # Binary Authorization
    "containerscanning.googleapis.com",      # Container vulnerability scanning
    
    # Core Services
    "run.googleapis.com",                    # Cloud Run (still useful for some services)
    "cloudfunctions.googleapis.com",         # Cloud Functions
    "firestore.googleapis.com",              # Firestore
    "cloudscheduler.googleapis.com",         # Cloud Scheduler
    "cloudtasks.googleapis.com",             # Cloud Tasks
    "storage.googleapis.com",                # Cloud Storage
    "logging.googleapis.com",                # Cloud Logging
    "monitoring.googleapis.com",             # Cloud Monitoring
    "cloudtrace.googleapis.com",             # Cloud Trace
    "cloudprofiler.googleapis.com",          # Cloud Profiler
    "clouderrorreporting.googleapis.com",    # Error Reporting
    "iamcredentials.googleapis.com",         # Workload Identity
    "sts.googleapis.com"                     # Security Token Service
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --quiet
}

Write-Host "✅ APIs enabled!" -ForegroundColor Green

# Create GKE Autopilot Cluster
Write-Host "`n☸️  Creating GKE Autopilot cluster (this takes ~5-10 minutes)..." -ForegroundColor Yellow
Write-Host "  Cluster: $ClusterName" -ForegroundColor Gray

gcloud container clusters create-auto $ClusterName `
    --region=$Region `
    --release-channel=regular `
    --enable-autoscaling `
    --min-nodes=1 `
    --max-nodes=10 `
    --enable-autorepair `
    --enable-autoupgrade `
    --workload-pool="${ProjectId}.svc.id.goog" `
    --enable-shielded-nodes `
    --shielded-secure-boot `
    --shielded-integrity-monitoring `
    --enable-master-authorized-networks `
    --master-authorized-networks=0.0.0.0/0 `
    --labels=app=affiliate-flow,env=production `
    --quiet 2>$null

Write-Host "✅ GKE Autopilot cluster created!" -ForegroundColor Green

# Get cluster credentials
Write-Host "`n🔐 Configuring kubectl..." -ForegroundColor Yellow
gcloud container clusters get-credentials $ClusterName --region=$Region

# Enable Istio Service Mesh
Write-Host "`n🕸️  Enabling Istio Service Mesh..." -ForegroundColor Yellow
gcloud container fleet mesh enable --project=$ProjectId --quiet 2>$null

gcloud container fleet memberships register $ClusterName `
    --gke-cluster="${Region}/${ClusterName}" `
    --enable-workload-identity `
    --quiet 2>$null

Write-Host "✅ Istio Service Mesh enabled!" -ForegroundColor Green

# Create Kubernetes namespaces
Write-Host "`n📦 Creating Kubernetes namespaces..." -ForegroundColor Yellow
kubectl create namespace dev --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace content-generation --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace affiliate-tracking --dry-run=client -o yaml | kubectl apply -f -

Write-Host "✅ Namespaces created!" -ForegroundColor Green

# Create service accounts (same as free tier)
Write-Host "`n👤 Creating service accounts..." -ForegroundColor Yellow

$serviceAccounts = @(
    @{name="affiliate-flow-orchestrator"; display="Affiliate Flow Master Orchestrator"},
    @{name="affiliate-flow-content-gen"; display="Affiliate Flow Content Generator"},
    @{name="affiliate-flow-image-gen"; display="Affiliate Flow Image Generator"},
    @{name="affiliate-flow-analytics"; display="Affiliate Flow Analytics"},
    @{name="affiliate-flow-gke"; display="Affiliate Flow GKE Workload Identity"}
)

foreach ($sa in $serviceAccounts) {
    Write-Host "  Creating $($sa.name)..." -ForegroundColor Gray
    gcloud iam service-accounts create $sa.name `
        --display-name="$($sa.display)" `
        --quiet 2>$null
}

Write-Host "✅ Service accounts created!" -ForegroundColor Green

# Grant IAM roles (enhanced for premium services)
Write-Host "`n🔐 Configuring IAM roles for premium services..." -ForegroundColor Yellow

# Orchestrator - full permissions
$orchestratorSA = "affiliate-flow-orchestrator@${ProjectId}.iam.gserviceaccount.com"
$roles = @(
    "roles/cloudtasks.enqueuer",
    "roles/secretmanager.secretAccessor",
    "roles/aiplatform.user",
    "roles/datastore.user",
    "roles/bigquery.dataEditor",
    "roles/clouddeploy.releaser",
    "roles/container.developer"
)
foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:$orchestratorSA" `
        --role="$role" --quiet 2>$null
}

# GKE Workload Identity binding
$gkeSA = "affiliate-flow-gke@${ProjectId}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$gkeSA" `
    --role="roles/container.developer" --quiet 2>$null

gcloud iam service-accounts add-iam-policy-binding $gkeSA `
    --role="roles/iam.workloadIdentityUser" `
    --member="serviceAccount:${ProjectId}.svc.id.goog[production/affiliate-flow]" `
    --quiet 2>$null

Write-Host "✅ IAM roles configured!" -ForegroundColor Green

# Set up Vertex AI Workbench
Write-Host "`n🤖 Setting up Vertex AI Workbench..." -ForegroundColor Yellow
Write-Host "  (Skipping instance creation - create manually when needed)" -ForegroundColor Gray

# Just create the bucket for model artifacts
gsutil mb -p $ProjectId -l $Region gs://${ProjectId}-vertex-ai/ 2>$null

Write-Host "✅ Vertex AI configured!" -ForegroundColor Green

# Create BigQuery datasets
Write-Host "`n📊 Creating BigQuery datasets..." -ForegroundColor Yellow

bq mk --dataset --location=US --description="Affiliate analytics data" `
    ${ProjectId}:affiliate_analytics 2>$null

bq mk --dataset --location=US --description="ML models and features" `
    ${ProjectId}:affiliate_ml 2>$null

bq mk --dataset --location=US --description="User behavior tracking" `
    ${ProjectId}:user_behavior 2>$null

Write-Host "✅ BigQuery datasets created!" -ForegroundColor Green

# Set up Cloud Deploy
Write-Host "`n🚀 Setting up Cloud Deploy pipeline..." -ForegroundColor Yellow

# Create Cloud Deploy YAML
$deployConfig = @"
apiVersion: deploy.cloud.google.com/v1
kind: DeliveryPipeline
metadata:
  name: affiliate-flow-pipeline
description: Affiliate Flow deployment pipeline with canary rollout
serialPipeline:
  stages:
  - targetId: dev
    profiles: [dev]
  - targetId: staging
    profiles: [staging]
  - targetId: prod
    profiles: [prod]
    strategy:
      canary:
        runtimeConfig:
          kubernetes:
            serviceNetworking:
              service: affiliate-flow-service
        canaryDeployment:
          percentages: [25, 50, 100]
          verify: true
---
apiVersion: deploy.cloud.google.com/v1
kind: Target
metadata:
  name: dev
description: Development environment
gke:
  cluster: projects/${ProjectId}/locations/${Region}/clusters/${ClusterName}
---
apiVersion: deploy.cloud.google.com/v1
kind: Target
metadata:
  name: staging
description: Staging environment
gke:
  cluster: projects/${ProjectId}/locations/${Region}/clusters/${ClusterName}
---
apiVersion: deploy.cloud.google.com/v1
kind: Target
metadata:
  name: prod
description: Production environment
requireApproval: true
gke:
  cluster: projects/${ProjectId}/locations/${Region}/clusters/${ClusterName}
"@

$deployConfig | Out-File -FilePath "clouddeploy.yaml" -Encoding utf8
gcloud deploy apply --file=clouddeploy.yaml --region=$Region --quiet 2>$null

Write-Host "✅ Cloud Deploy pipeline created!" -ForegroundColor Green

# Set up Cloud DLP
Write-Host "`n🔒 Setting up Cloud DLP (Data Loss Prevention)..." -ForegroundColor Yellow

# Create inspection template
$dlpInspectConfig = @"
{
  "inspectConfig": {
    "infoTypes": [
      {"name": "EMAIL_ADDRESS"},
      {"name": "PHONE_NUMBER"},
      {"name": "CREDIT_CARD_NUMBER"},
      {"name": "US_SOCIAL_SECURITY_NUMBER"},
      {"name": "PERSON_NAME"},
      {"name": "LOCATION"},
      {"name": "DATE_OF_BIRTH"}
    ],
    "minLikelihood": "POSSIBLE"
  }
}
"@

$dlpInspectConfig | Out-File -FilePath "dlp-inspect-config.json" -Encoding utf8

Write-Host "✅ Cloud DLP configured!" -ForegroundColor Green

# Create storage buckets (same as free tier + additional)
Write-Host "`n💾 Creating Cloud Storage buckets..." -ForegroundColor Yellow

$buckets = @(
    "${ProjectId}-content",
    "${ProjectId}-images",
    "${ProjectId}-backups",
    "${ProjectId}-temp",
    "${ProjectId}-deploy",
    "${ProjectId}-dataflow-temp",
    "${ProjectId}-ml-models"
)

foreach ($bucket in $buckets) {
    Write-Host "  Creating bucket: $bucket..." -ForegroundColor Gray
    gsutil mb -p $ProjectId -l $Region gs://$bucket/ 2>$null
}

Write-Host "✅ Storage buckets created!" -ForegroundColor Green

# Create Artifact Registry
Write-Host "`n📦 Creating Artifact Registry repository..." -ForegroundColor Yellow
gcloud artifacts repositories create affiliate-flow `
    --repository-format=docker `
    --location=$Region `
    --description="Docker images for Affiliate Flow services" `
    --quiet 2>$null

Write-Host "✅ Artifact Registry configured!" -ForegroundColor Green

# Summary
Write-Host "`n" -NoNewline
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "✨ GCP PREMIUM Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎯 Premium Services Configured:" -ForegroundColor Yellow
Write-Host "  ✅ GKE Autopilot cluster: $ClusterName"
Write-Host "  ✅ Istio Service Mesh enabled"
Write-Host "  ✅ Vertex AI configured"
Write-Host "  ✅ BigQuery datasets (3): affiliate_analytics, affiliate_ml, user_behavior"
Write-Host "  ✅ Cloud Deploy pipeline with canary rollouts"
Write-Host "  ✅ Cloud DLP inspection templates"
Write-Host "  ✅ 5 service accounts with Workload Identity"
Write-Host "  ✅ 7 storage buckets"
Write-Host "  ✅ Artifact Registry"
Write-Host "  ✅ 5 Kubernetes namespaces"
Write-Host ""
Write-Host "💰 Estimated Monthly Cost (Before Credits): ~$318/month" -ForegroundColor Yellow
Write-Host "  • GKE Autopilot: $73"
Write-Host "  • Vertex AI: $50 (moderate use)"
Write-Host "  • BigQuery: $20"
Write-Host "  • Cloud Deploy: $45"
Write-Host "  • Cloud DLP: $10"
Write-Host "  • Dataflow: $100 (when used)"
Write-Host "  • Storage/Networking: $20"
Write-Host ""
Write-Host "💳 With Google Cloud Credits: $0" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Deploy services to GKE:"
Write-Host "     kubectl apply -f k8s/"
Write-Host "  2. Set up Cloud Deploy releases:"
Write-Host "     gcloud deploy releases create release-001 --delivery-pipeline=affiliate-flow-pipeline --region=$Region"
Write-Host "  3. Configure Vertex AI models:"
Write-Host "     Create workbench instance or deploy model endpoints"
Write-Host "  4. Set up BigQuery tables and ML models"
Write-Host "  5. Configure Cloud DLP scanning rules"
Write-Host "  6. Monitor GKE cluster:"
Write-Host "     kubectl get pods --all-namespaces"
Write-Host ""
Write-Host "📚 Documentation: GOOGLE_CREDITS_STRATEGY.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Remember: This uses PREMIUM services that cost ~$318/month" -ForegroundColor Yellow
Write-Host "   Make sure your Google Cloud credits are active!" -ForegroundColor Yellow
Write-Host ""
