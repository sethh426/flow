# Affiliate Flow - GCP Infrastructure Deployment Script
# This script deploys the complete infrastructure using Terraform

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "plan",  # plan, apply, destroy
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "affiliate-flow-prod",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1",
    
    [Parameter(Mandatory=$false)]
    [string]$NotificationEmail = "",
    
    [Parameter(Mandatory=$false)]
    [string]$GeminiApiKey = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Affiliate Flow Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud version 2>&1
    Write-Host "✓ gcloud CLI found" -ForegroundColor Green
} catch {
    Write-Host "✗ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Check if terraform is installed
try {
    $terraformVersion = terraform version
    Write-Host "✓ Terraform found" -ForegroundColor Green
} catch {
    Write-Host "✗ Terraform not found. Please install: https://www.terraform.io/downloads" -ForegroundColor Red
    exit 1
}

# Check if kubectl is installed
try {
    $kubectlVersion = kubectl version --client 2>&1
    Write-Host "✓ kubectl found" -ForegroundColor Green
} catch {
    Write-Host "⚠ kubectl not found. Install if you need to manage Kubernetes" -ForegroundColor Yellow
}

Write-Host ""

# Set project
Write-Host "Setting GCP project to: $ProjectId" -ForegroundColor Yellow
gcloud config set project $ProjectId

# Create terraform backend bucket if it doesn't exist
$bucketName = "affiliate-flow-terraform-state"
Write-Host "Checking Terraform state bucket..." -ForegroundColor Yellow
$bucketExists = gsutil ls gs://$bucketName 2>&1 | Select-String -Pattern $bucketName

if (-not $bucketExists) {
    Write-Host "Creating Terraform state bucket: gs://$bucketName" -ForegroundColor Yellow
    gsutil mb -p $ProjectId -c STANDARD -l $Region gs://$bucketName
    gsutil versioning set on gs://$bucketName
    Write-Host "✓ Bucket created with versioning enabled" -ForegroundColor Green
} else {
    Write-Host "✓ Terraform state bucket exists" -ForegroundColor Green
}

Write-Host ""

# Navigate to terraform directory
Set-Location -Path "$PSScriptRoot\terraform"

# Initialize Terraform
Write-Host "Initializing Terraform..." -ForegroundColor Yellow
terraform init -upgrade

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Terraform initialization failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Terraform initialized" -ForegroundColor Green
Write-Host ""

# Create terraform.tfvars if it doesn't exist
$tfvarsFile = "terraform.tfvars"
if (-not (Test-Path $tfvarsFile)) {
    Write-Host "Creating terraform.tfvars file..." -ForegroundColor Yellow
    
    if (-not $NotificationEmail) {
        $NotificationEmail = Read-Host "Enter notification email for alerts"
    }
    
    if (-not $GeminiApiKey) {
        $GeminiApiKey = Read-Host "Enter Gemini API Key" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($GeminiApiKey)
        $GeminiApiKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
    
    $tfvarsContent = @"
project_id         = "$ProjectId"
region             = "$Region"
notification_email = "$NotificationEmail"
gemini_api_key     = "$GeminiApiKey"
environment        = "prod"
"@
    
    Set-Content -Path $tfvarsFile -Value $tfvarsContent
    Write-Host "✓ terraform.tfvars created" -ForegroundColor Green
    Write-Host "⚠ Remember to add terraform.tfvars to .gitignore!" -ForegroundColor Yellow
}

Write-Host ""

# Execute Terraform action
switch ($Action.ToLower()) {
    "plan" {
        Write-Host "Running Terraform plan..." -ForegroundColor Yellow
        terraform plan -out=tfplan
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Terraform plan completed successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "  1. Review the plan above" -ForegroundColor White
            Write-Host "  2. Run: .\deploy.ps1 -Action apply" -ForegroundColor White
            Write-Host ""
        }
    }
    
    "apply" {
        Write-Host "Applying Terraform configuration..." -ForegroundColor Yellow
        Write-Host "⚠ This will create real GCP resources and incur costs!" -ForegroundColor Yellow
        $confirm = Read-Host "Continue? (yes/no)"
        
        if ($confirm -eq "yes") {
            terraform apply tfplan
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "========================================" -ForegroundColor Green
                Write-Host "✓ Infrastructure deployed successfully!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                Write-Host ""
                
                # Get outputs
                Write-Host "Infrastructure Details:" -ForegroundColor Cyan
                terraform output
                
                Write-Host ""
                Write-Host "Next steps:" -ForegroundColor Cyan
                Write-Host "  1. Configure kubectl: gcloud container clusters get-credentials affiliate-flow-cluster --region=$Region" -ForegroundColor White
                Write-Host "  2. Deploy applications: kubectl apply -f ../kubernetes/manifests/" -ForegroundColor White
                Write-Host "  3. Check deployment status: kubectl get pods -n affiliate-flow" -ForegroundColor White
                Write-Host ""
            } else {
                Write-Host "✗ Terraform apply failed" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Deployment cancelled" -ForegroundColor Yellow
        }
    }
    
    "destroy" {
        Write-Host "⚠ WARNING: This will DESTROY all infrastructure!" -ForegroundColor Red
        $confirm = Read-Host "Type 'DESTROY' to confirm"
        
        if ($confirm -eq "DESTROY") {
            terraform destroy
        } else {
            Write-Host "Destruction cancelled" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "Invalid action: $Action" -ForegroundColor Red
        Write-Host "Valid actions: plan, apply, destroy" -ForegroundColor Yellow
        exit 1
    }
}
