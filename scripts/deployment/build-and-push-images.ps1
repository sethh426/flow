# Build and Push Docker Images to Artifact Registry
# Project: affiliateflow-abzfy
# Region: us-central1

$PROJECT_ID = "affiliateflow-abzfy"
$REGION = "us-central1"
$REPO = "$REGION-docker.pkg.dev/$PROJECT_ID/affiliate-flow-images"

Write-Host "🐳 Building and Pushing Docker Images" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configure Docker for Artifact Registry
Write-Host "🔧 Configuring Docker authentication..." -ForegroundColor Yellow
gcloud auth configure-docker $REGION-docker.pkg.dev

# Services to build
$services = @(
    @{
        name = "master-ai-orchestrator"
        path = "services/master-ai-orchestrator"
        port = "8080"
    },
    @{
        name = "product-mapper"
        path = "services/product-mapper"
        port = "8081"
    },
    @{
        name = "trend-finder"
        path = "services/trend-finder"
        port = "8082"
    },
    @{
        name = "image-generator"
        path = "services/image-generator"
        port = "8083"
    }
)

foreach ($service in $services) {
    $serviceName = $service.name
    $servicePath = $service.path
    $imageTag = "$REPO/${serviceName}:latest"
    
    Write-Host ""
    Write-Host "📦 Building $serviceName..." -ForegroundColor Yellow
    
    # Check if Dockerfile exists
    $dockerfilePath = "$servicePath/Dockerfile"
    if (-not (Test-Path $dockerfilePath)) {
        Write-Host "  ⚠️  Dockerfile not found at $dockerfilePath, creating basic Dockerfile..." -ForegroundColor Yellow
        
        # Determine if it's Node.js or Python
        if (Test-Path "$servicePath/package.json") {
            # Node.js service
            $dockerfile = @"
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE $($service.port)

CMD ["node", "index.js"]
"@
        } elseif (Test-Path "$servicePath/requirements.txt") {
            # Python service
            $dockerfile = @"
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE $($service.port)

CMD ["python", "api.py"]
"@
        } else {
            Write-Host "  ❌ Cannot determine service type (no package.json or requirements.txt)" -ForegroundColor Red
            continue
        }
        
        Set-Content -Path $dockerfilePath -Value $dockerfile
        Write-Host "  ✓ Created Dockerfile" -ForegroundColor Green
    }
    
    # Build image
    Write-Host "  Building image: $imageTag" -ForegroundColor Gray
    docker build -t $imageTag $servicePath
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Build failed for $serviceName" -ForegroundColor Red
        continue
    }
    
    Write-Host "  ✓ Built successfully" -ForegroundColor Green
    
    # Push image
    Write-Host "  Pushing to Artifact Registry..." -ForegroundColor Gray
    docker push $imageTag
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Push failed for $serviceName" -ForegroundColor Red
        continue
    }
    
    Write-Host "  ✓ Pushed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All images built and pushed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update deployments to use new images:" -ForegroundColor Gray
Write-Host "   kubectl rollout restart deployment -n affiliate-flow" -ForegroundColor White
Write-Host ""
Write-Host "2. Check rollout status:" -ForegroundColor Gray
Write-Host "   kubectl rollout status deployment/master-ai-orchestrator -n affiliate-flow" -ForegroundColor White
Write-Host ""
