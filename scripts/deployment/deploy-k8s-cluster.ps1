# Kubernetes Cluster Deployment Script for AffiliateFlow
# Project: affiliateflow-abzfy
# Region: us-central1

$PROJECT_ID = "affiliateflow-abzfy"
$REGION = "us-central1"
$CLUSTER_NAME = "affiliateflow-cluster"
$MACHINE_TYPE = "e2-standard-4"
$NUM_NODES = 3

Write-Host "🚀 AffiliateFlow Kubernetes Deployment" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Google Cloud SDK not found. Please install from: https://cloud.google.com/sdk/install" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Google Cloud SDK found" -ForegroundColor Green

# Set project
Write-Host "📋 Setting GCP project to: $PROJECT_ID" -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host ""
Write-Host "🔧 Enabling required GCP APIs..." -ForegroundColor Yellow
$apis = @(
    "container.googleapis.com",
    "artifactregistry.googleapis.com",
    "compute.googleapis.com",
    "cloudbuild.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --project=$PROJECT_ID
}

Write-Host "✓ APIs enabled" -ForegroundColor Green

# Check if cluster exists
Write-Host ""
Write-Host "🔍 Checking for existing cluster..." -ForegroundColor Yellow
$clusterExists = gcloud container clusters list --project=$PROJECT_ID --region=$REGION --filter="name:$CLUSTER_NAME" --format="value(name)" 2>$null

if ($clusterExists) {
    Write-Host "✓ Cluster '$CLUSTER_NAME' already exists" -ForegroundColor Green
    $createCluster = Read-Host "Do you want to use the existing cluster? (y/n)"
    if ($createCluster -ne "y") {
        Write-Host "⚠️  Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "❌ Cluster not found. Creating new cluster..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating GKE cluster with:" -ForegroundColor Cyan
    Write-Host "  Name: $CLUSTER_NAME" -ForegroundColor Gray
    Write-Host "  Region: $REGION" -ForegroundColor Gray
    Write-Host "  Machine Type: $MACHINE_TYPE" -ForegroundColor Gray
    Write-Host "  Nodes: $NUM_NODES" -ForegroundColor Gray
    Write-Host ""
    
    gcloud container clusters create $CLUSTER_NAME `
        --region=$REGION `
        --machine-type=$MACHINE_TYPE `
        --num-nodes=$NUM_NODES `
        --enable-autoscaling `
        --min-nodes=1 `
        --max-nodes=10 `
        --enable-autorepair `
        --enable-autoupgrade `
        --workload-pool=$PROJECT_ID.svc.id.goog `
        --project=$PROJECT_ID
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Cluster creation failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Cluster created successfully" -ForegroundColor Green
}

# Get cluster credentials
Write-Host ""
Write-Host "🔑 Getting cluster credentials..." -ForegroundColor Yellow
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION --project=$PROJECT_ID

Write-Host "✓ Credentials configured" -ForegroundColor Green

# Create Artifact Registry repository
Write-Host ""
Write-Host "📦 Setting up Artifact Registry..." -ForegroundColor Yellow
$repoExists = gcloud artifacts repositories list --project=$PROJECT_ID --location=$REGION --filter="name:affiliate-flow-images" --format="value(name)" 2>$null

if (-not $repoExists) {
    Write-Host "Creating Artifact Registry repository..." -ForegroundColor Gray
    gcloud artifacts repositories create affiliate-flow-images `
        --repository-format=docker `
        --location=$REGION `
        --description="AffiliateFlow Docker images" `
        --project=$PROJECT_ID
    
    Write-Host "✓ Repository created" -ForegroundColor Green
} else {
    Write-Host "✓ Repository already exists" -ForegroundColor Green
}

# Create Kubernetes namespace
Write-Host ""
Write-Host "📁 Creating Kubernetes namespace..." -ForegroundColor Yellow
kubectl create namespace affiliate-flow --dry-run=client -o yaml | kubectl apply -f -

Write-Host "✓ Namespace ready" -ForegroundColor Green

# Create Gemini API secret
Write-Host ""
Write-Host "🔐 Setting up Gemini API secret..." -ForegroundColor Yellow
$geminiKey = $env:GEMINI_API_KEY

if (-not $geminiKey) {
    Write-Host "⚠️  GEMINI_API_KEY environment variable not set" -ForegroundColor Yellow
    $geminiKey = Read-Host "Enter your Gemini API key"
}

if ($geminiKey) {
    kubectl create secret generic gemini-api `
        --from-literal=api-key=$geminiKey `
        --namespace=affiliate-flow `
        --dry-run=client -o yaml | kubectl apply -f -
    
    Write-Host "✓ Gemini API secret created" -ForegroundColor Green
} else {
    Write-Host "⚠️  Skipping Gemini API secret (you'll need to create this manually)" -ForegroundColor Yellow
}

# Deploy Redis
Write-Host ""
Write-Host "🗄️  Deploying Redis..." -ForegroundColor Yellow
kubectl apply -f infrastructure/kubernetes/manifests/redis.yaml

Write-Host "✓ Redis deployed" -ForegroundColor Green

# Deploy services
Write-Host ""
Write-Host "🚢 Deploying services..." -ForegroundColor Yellow

$manifests = @(
    "master-ai-orchestrator.yaml",
    "product-mapper.yaml",
    "trend-finder.yaml",
    "ingress.yaml"
)

foreach ($manifest in $manifests) {
    $manifestPath = "infrastructure/kubernetes/manifests/$manifest"
    if (Test-Path $manifestPath) {
        Write-Host "  Deploying $manifest..." -ForegroundColor Gray
        kubectl apply -f $manifestPath
    } else {
        Write-Host "  ⚠️  $manifest not found" -ForegroundColor Yellow
    }
}

Write-Host "✓ Services deployed" -ForegroundColor Green

# Wait for deployments
Write-Host ""
Write-Host "⏳ Waiting for deployments to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment --all -n affiliate-flow

# Show status
Write-Host ""
Write-Host "📊 Deployment Status:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""
kubectl get all -n affiliate-flow

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build and push Docker images:" -ForegroundColor Gray
Write-Host "   .\scripts\deployment\build-and-push-images.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2. Check pod status:" -ForegroundColor Gray
Write-Host "   kubectl get pods -n affiliate-flow" -ForegroundColor White
Write-Host ""
Write-Host "3. View logs:" -ForegroundColor Gray
Write-Host "   kubectl logs -f deployment/master-ai-orchestrator -n affiliate-flow" -ForegroundColor White
Write-Host ""
Write-Host "4. Configure ingress domain in ingress.yaml" -ForegroundColor Gray
Write-Host ""
