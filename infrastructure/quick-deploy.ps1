# Deployment Script for Affiliate Flow
# Usage: .\quick-deploy.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$Component = "all",  # all, infrastructure, services, frontend
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "prod"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Affiliate Flow - Quick Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load configuration
if (Test-Path ".\terraform\terraform.tfvars") {
    Write-Host "✓ Found terraform.tfvars" -ForegroundColor Green
} else {
    Write-Host "✗ terraform.tfvars not found!" -ForegroundColor Red
    Write-Host "Copy terraform.tfvars.example to terraform.tfvars and configure it" -ForegroundColor Yellow
    exit 1
}

# Get project ID from terraform.tfvars
$projectId = (Get-Content ".\terraform\terraform.tfvars" | Select-String "project_id").ToString().Split("=")[1].Trim().Trim('"')
$region = (Get-Content ".\terraform\terraform.tfvars" | Select-String "region").ToString().Split("=")[1].Trim().Trim('"')

Write-Host "Project: $projectId" -ForegroundColor Cyan
Write-Host "Region: $region" -ForegroundColor Cyan
Write-Host ""

function Deploy-Infrastructure {
    Write-Host "Deploying Infrastructure with Terraform..." -ForegroundColor Yellow
    .\deploy.ps1 -Action apply -ProjectId $projectId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Infrastructure deployed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Infrastructure deployment failed" -ForegroundColor Red
        exit 1
    }
}

function Build-And-Push-Image {
    param(
        [string]$ServicePath,
        [string]$ImageName
    )
    
    Write-Host "Building $ImageName..." -ForegroundColor Yellow
    
    $imageTag = "${region}-docker.pkg.dev/${projectId}/affiliate-flow-images/${ImageName}:latest"
    $versionTag = "${region}-docker.pkg.dev/${projectId}/affiliate-flow-images/${ImageName}:$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    docker build -t $imageTag -t $versionTag -f "$ServicePath\Dockerfile" $ServicePath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Built $ImageName" -ForegroundColor Green
        
        Write-Host "Pushing $ImageName to Artifact Registry..." -ForegroundColor Yellow
        docker push $imageTag
        docker push $versionTag
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Pushed $ImageName" -ForegroundColor Green
            return $imageTag
        } else {
            Write-Host "✗ Failed to push $ImageName" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✗ Failed to build $ImageName" -ForegroundColor Red
        exit 1
    }
}

function Deploy-Services {
    Write-Host "Deploying Backend Services..." -ForegroundColor Yellow
    
    # Configure Docker for Artifact Registry
    gcloud auth configure-docker "${region}-docker.pkg.dev"
    
    # Build and push orchestrator
    Build-And-Push-Image -ServicePath "..\services\master-ai-orchestrator" -ImageName "master-ai-orchestrator"
    
    # Build and push product mapper
    Build-And-Push-Image -ServicePath "..\services\product-mapper" -ImageName "product-mapper"
    
    # Deploy to Kubernetes
    Write-Host "Deploying to Kubernetes..." -ForegroundColor Yellow
    
    # Get cluster credentials
    gcloud container clusters get-credentials affiliate-flow-cluster --region=$region --project=$projectId
    
    # Apply manifests
    kubectl apply -f .\kubernetes\manifests\ -n affiliate-flow
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Services deployed to Kubernetes" -ForegroundColor Green
        
        # Wait for rollout
        Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
        kubectl rollout status deployment/master-ai-orchestrator -n affiliate-flow
        kubectl rollout status deployment/product-mapper -n affiliate-flow
        
        Write-Host "✓ All services are running" -ForegroundColor Green
    } else {
        Write-Host "✗ Kubernetes deployment failed" -ForegroundColor Red
        exit 1
    }
}

function Deploy-Frontend {
    Write-Host "Deploying Frontend to Firebase..." -ForegroundColor Yellow
    
    Set-Location "..\client"
    
    # Build
    Write-Host "Building Next.js app..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend built successfully" -ForegroundColor Green
        
        # Deploy
        Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Yellow
        firebase deploy --only hosting --project flow-69826693-f6d27
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Frontend deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Frontend deployment failed" -ForegroundColor Red
            Set-Location "..\infrastructure"
            exit 1
        }
    } else {
        Write-Host "✗ Frontend build failed" -ForegroundColor Red
        Set-Location "..\infrastructure"
        exit 1
    }
    
    Set-Location "..\infrastructure"
}

# Execute deployment based on component
switch ($Component.ToLower()) {
    "infrastructure" {
        Deploy-Infrastructure
    }
    "services" {
        Deploy-Services
    }
    "frontend" {
        Deploy-Frontend
    }
    "all" {
        Deploy-Infrastructure
        Deploy-Services
        Deploy-Frontend
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ Complete Deployment Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access your application:" -ForegroundColor Cyan
        Write-Host "  Frontend: https://flow-69826693-f6d27.web.app" -ForegroundColor White
        Write-Host "  GCP Console: https://console.cloud.google.com/kubernetes/workload?project=$projectId" -ForegroundColor White
        Write-Host ""
        Write-Host "Check deployment status:" -ForegroundColor Cyan
        Write-Host "  kubectl get pods -n affiliate-flow" -ForegroundColor White
        Write-Host "  kubectl get svc -n affiliate-flow" -ForegroundColor White
        Write-Host ""
    }
    default {
        Write-Host "Invalid component: $Component" -ForegroundColor Red
        Write-Host "Valid options: all, infrastructure, services, frontend" -ForegroundColor Yellow
        exit 1
    }
}
