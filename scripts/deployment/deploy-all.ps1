# AffiliateFlow Complete Deployment - One Command
# Deploys everything to GKE

param(
    [switch]$SkipCluster,
    [switch]$SkipImages,
    [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║         AffiliateFlow Complete Deployment             ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Pre-flight checks
Write-Host "🔍 Pre-flight Checks..." -ForegroundColor Yellow
Write-Host ""

# Check gcloud
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Google Cloud SDK not found" -ForegroundColor Red
    Write-Host "   Install from: https://cloud.google.com/sdk/install" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Google Cloud SDK" -ForegroundColor Green

# Check kubectl
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl not found" -ForegroundColor Red
    Write-Host "   Install with: gcloud components install kubectl" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ kubectl" -ForegroundColor Green

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Docker not found (required for image building)" -ForegroundColor Yellow
    if (-not $SkipImages) {
        Write-Host "   Install from: https://docker.com/get-started" -ForegroundColor Yellow
        $skipDockerChoice = Read-Host "Continue without Docker? (will skip image building) (y/n)"
        if ($skipDockerChoice -eq "y") {
            $SkipImages = $true
        } else {
            exit 1
        }
    }
} else {
    Write-Host "✓ Docker" -ForegroundColor Green
}

# Check Gemini API Key
if (-not $env:GEMINI_API_KEY) {
    Write-Host "⚠️  GEMINI_API_KEY not set" -ForegroundColor Yellow
    $geminiKey = Read-Host "Enter your Gemini API key (or press Enter to skip)"
    if ($geminiKey) {
        $env:GEMINI_API_KEY = $geminiKey
    }
}
if ($env:GEMINI_API_KEY) {
    Write-Host "✓ Gemini API Key" -ForegroundColor Green
} else {
    Write-Host "⚠️  Gemini API Key not configured (will need to add manually later)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy Cluster
if (-not $SkipCluster) {
    Write-Host "📦 Step 1/3: Deploying GKE Cluster..." -ForegroundColor Cyan
    Write-Host ""
    
    $deployScript = ".\scripts\deployment\deploy-k8s-cluster.ps1"
    if (Test-Path $deployScript) {
        & $deployScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "❌ Cluster deployment failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Deployment script not found: $deployScript" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Cluster deployment complete!" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping cluster deployment" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 2: Build and Push Images
if (-not $SkipImages) {
    Write-Host "🐳 Step 2/3: Building and Pushing Docker Images..." -ForegroundColor Cyan
    Write-Host ""
    
    $buildScript = ".\scripts\deployment\build-and-push-images.ps1"
    if (Test-Path $buildScript) {
        & $buildScript
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "⚠️  Some images may have failed to build" -ForegroundColor Yellow
            $continue = Read-Host "Continue anyway? (y/n)"
            if ($continue -ne "y") {
                exit 1
            }
        }
    } else {
        Write-Host "❌ Build script not found: $buildScript" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Images built and pushed!" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping image building" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 3: Verify Deployment
if (-not $SkipVerify) {
    Write-Host "✓ Step 3/3: Verifying Deployment..." -ForegroundColor Cyan
    Write-Host ""
    
    Start-Sleep -Seconds 5
    
    $troubleshootScript = ".\scripts\deployment\troubleshoot-k8s.ps1"
    if (Test-Path $troubleshootScript) {
        & $troubleshootScript
    } else {
        Write-Host "⚠️  Troubleshoot script not found, running basic checks..." -ForegroundColor Yellow
        Write-Host ""
        kubectl get all -n affiliate-flow
    }
} else {
    Write-Host "⏭️  Skipping verification" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║            🎉 DEPLOYMENT COMPLETE! 🎉                  ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Your AffiliateFlow cluster is now running!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Check pod status:" -ForegroundColor Yellow
Write-Host "   kubectl get pods -n affiliate-flow" -ForegroundColor White
Write-Host ""
Write-Host "2. View service logs:" -ForegroundColor Yellow
Write-Host "   kubectl logs -f deployment/master-ai-orchestrator -n affiliate-flow" -ForegroundColor White
Write-Host ""
Write-Host "3. Access services locally:" -ForegroundColor Yellow
Write-Host "   kubectl port-forward service/orchestrator-service 8080:80 -n affiliate-flow" -ForegroundColor White
Write-Host ""
Write-Host "4. Manage cluster:" -ForegroundColor Yellow
Write-Host "   .\scripts\deployment\manage-k8s-cluster.ps1" -ForegroundColor White
Write-Host ""
Write-Host "5. Configure domain (optional):" -ForegroundColor Yellow
Write-Host "   Edit infrastructure/kubernetes/manifests/ingress.yaml" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Full Guide: docs/deployment/KUBERNETES_DEPLOYMENT.md" -ForegroundColor Gray
Write-Host "   Quick Ref:  docs/deployment/K8S_QUICK_REFERENCE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "🆘 Need help?" -ForegroundColor Cyan
Write-Host "   Run: .\scripts\deployment\troubleshoot-k8s.ps1" -ForegroundColor Gray
Write-Host ""
