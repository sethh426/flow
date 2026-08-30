# Create Kubernetes Secrets from Environment
# This script creates secrets in Kubernetes cluster

param(
    [Parameter(Mandatory=$false)]
    [string]$Namespace = "affiliate-flow"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating Kubernetes Secrets..." -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is configured
try {
    kubectl cluster-info | Out-Null
    Write-Host "✓ Connected to Kubernetes cluster" -ForegroundColor Green
} catch {
    Write-Host "✗ Not connected to Kubernetes cluster" -ForegroundColor Red
    Write-Host "Run: gcloud container clusters get-credentials affiliate-flow-cluster --region=us-central1" -ForegroundColor Yellow
    exit 1
}

# Create namespace if it doesn't exist
Write-Host "Creating namespace: $Namespace" -ForegroundColor Yellow
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

# Gemini API Key
Write-Host ""
Write-Host "Creating Gemini API secret..." -ForegroundColor Yellow
$geminiKey = Read-Host "Enter Gemini API Key (or press Enter to skip)" -AsSecureString
if ($geminiKey.Length -gt 0) {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($geminiKey)
    $plainGeminiKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    kubectl create secret generic gemini-api `
        --from-literal=api-key=$plainGeminiKey `
        --namespace=$Namespace `
        --dry-run=client -o yaml | kubectl apply -f -
    
    Write-Host "✓ Gemini API secret created" -ForegroundColor Green
}

# Firebase Admin
Write-Host ""
Write-Host "Creating Firebase Admin secret..." -ForegroundColor Yellow
$firebasePath = Read-Host "Enter path to serviceAccountKey.json (or press Enter to skip)"
if ($firebasePath -and (Test-Path $firebasePath)) {
    kubectl create secret generic firebase-admin `
        --from-file=serviceAccountKey.json=$firebasePath `
        --namespace=$Namespace `
        --dry-run=client -o yaml | kubectl apply -f -
    
    Write-Host "✓ Firebase Admin secret created" -ForegroundColor Green
} elseif ($firebasePath) {
    Write-Host "✗ File not found: $firebasePath" -ForegroundColor Red
}

# Nordstrom API (optional)
Write-Host ""
Write-Host "Creating Nordstrom API secret (optional)..." -ForegroundColor Yellow
$nordstromKey = Read-Host "Enter Nordstrom API Key (or press Enter to skip)" -AsSecureString
if ($nordstromKey.Length -gt 0) {
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($nordstromKey)
    $plainNordstromKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    kubectl create secret generic nordstrom-api `
        --from-literal=api-key=$plainNordstromKey `
        --namespace=$Namespace `
        --dry-run=client -o yaml | kubectl apply -f -
    
    Write-Host "✓ Nordstrom API secret created" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Secrets created successfully" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verify secrets:" -ForegroundColor Cyan
Write-Host "  kubectl get secrets -n $Namespace" -ForegroundColor White
Write-Host ""
