# Start Workflow Executor Locally

Write-Host "🚀 Starting Workflow Executor Service..." -ForegroundColor Cyan

# Navigate to service directory
Set-Location -Path "services\workflow-executor"

Write-Host "📍 Service will run on http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 Available Endpoints:" -ForegroundColor Green
Write-Host "  - Execute Workflow: POST http://localhost:8080/api/workflows/:workflowId/execute"
Write-Host "  - Webhook Trigger: POST http://localhost:8080/api/webhooks/:workflowId/:triggerId"
Write-Host "  - Get Execution: GET http://localhost:8080/api/executions/:executionId"
Write-Host "  - Health Check: GET http://localhost:8080/health"
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start the service
npm start
