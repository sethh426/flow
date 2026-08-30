# Quick Setup Script for Affiliate Flow Infrastructure
# This script helps you configure everything before deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Email = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Affiliate Flow - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if terraform.tfvars exists
if (Test-Path ".\terraform\terraform.tfvars") {
    Write-Host "✓ terraform.tfvars already exists" -ForegroundColor Green
    $overwrite = Read-Host "Overwrite? (yes/no)"
    if ($overwrite -ne "yes") {
        Write-Host "Setup cancelled" -ForegroundColor Yellow
        exit 0
    }
}

# Get email if not provided
if (-not $Email) {
    $Email = Read-Host "Enter your email for monitoring alerts"
}

# Validate email
if ($Email -notmatch "^[^@]+@[^@]+\.[^@]+$") {
    Write-Host "✗ Invalid email format" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Project ID: flow-69826693-f6d27" -ForegroundColor White
Write-Host "  Region: us-central1" -ForegroundColor White
Write-Host "  Email: $Email" -ForegroundColor White
Write-Host "  Gemini API: Configured" -ForegroundColor White
Write-Host ""

# Update terraform.tfvars with email
$tfvarsContent = Get-Content ".\terraform\terraform.tfvars" -Raw
$tfvarsContent = $tfvarsContent -replace 'notification_email = "your-email@example.com"', "notification_email = `"$Email`""
Set-Content -Path ".\terraform\terraform.tfvars" -Value $tfvarsContent

Write-Host "✓ Configuration updated" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$prereqOk = $true

# Check gcloud
try {
    $null = gcloud version 2>&1
    Write-Host "✓ gcloud CLI installed" -ForegroundColor Green
} catch {
    Write-Host "✗ gcloud CLI not found - Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    $prereqOk = $false
}

# Check terraform
try {
    $null = terraform version 2>&1
    Write-Host "✓ Terraform installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Terraform not found - Install from: https://www.terraform.io/downloads" -ForegroundColor Red
    $prereqOk = $false
}

# Check kubectl
try {
    $null = kubectl version --client 2>&1
    Write-Host "✓ kubectl installed" -ForegroundColor Green
} catch {
    Write-Host "⚠ kubectl not found - Run: gcloud components install kubectl" -ForegroundColor Yellow
}

# Check docker
try {
    $null = docker --version 2>&1
    Write-Host "✓ Docker installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found - Install from: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    $prereqOk = $false
}

Write-Host ""

if (-not $prereqOk) {
    Write-Host "✗ Please install missing prerequisites before continuing" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Authenticate with GCP:" -ForegroundColor White
Write-Host "     gcloud auth login" -ForegroundColor Gray
Write-Host "     gcloud config set project flow-69826693-f6d27" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Create Terraform state bucket:" -ForegroundColor White
Write-Host "     gsutil mb gs://affiliate-flow-terraform-state" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Deploy infrastructure:" -ForegroundColor White
Write-Host "     .\deploy.ps1 -Action plan" -ForegroundColor Gray
Write-Host "     .\deploy.ps1 -Action apply" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Or deploy everything at once:" -ForegroundColor White
Write-Host "     .\quick-deploy.ps1 -Component all" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: See START_HERE.md" -ForegroundColor Cyan
Write-Host ""
