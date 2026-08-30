# Deploy Workflow Executor to Cloud Run

Write-Host "🚀 Deploying Workflow Executor to Cloud Run..." -ForegroundColor Cyan

$PROJECT_ID = "affiliateflow-abzfy"
$SERVICE_NAME = "workflow-executor"
$REGION = "us-central1"

# Navigate to service directory
Set-Location -Path "services\workflow-executor"

Write-Host "📦 Building and deploying service..." -ForegroundColor Yellow

gcloud run deploy $SERVICE_NAME `
  --source . `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --memory 1Gi `
  --cpu 1 `
  --timeout 600 `
  --max-instances 10 `
  --project $PROJECT_ID

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Workflow Executor deployed successfully!" -ForegroundColor Green
    
    # Get the service URL
    $SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format "value(status.url)"
    
    Write-Host ""
    Write-Host "📍 Service URL: $SERVICE_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 API Endpoints:" -ForegroundColor Yellow
    Write-Host "  - Execute Workflow: POST $SERVICE_URL/api/workflows/:workflowId/execute"
    Write-Host "  - Webhook Trigger: POST $SERVICE_URL/api/webhooks/:workflowId/:triggerId"
    Write-Host "  - Get Execution: GET $SERVICE_URL/api/executions/:executionId"
    Write-Host "  - Health Check: GET $SERVICE_URL/health"
    Write-Host ""
    Write-Host "💡 Add to client/.env.local:" -ForegroundColor Yellow
    Write-Host "WORKFLOW_EXECUTOR_URL=$SERVICE_URL"
    Write-Host ""
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Set-Location -Path "..\..\"
