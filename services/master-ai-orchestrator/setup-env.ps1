param(
    [string]$ProjectId = "",
    [string]$Region = "us-central1",
    [string]$GeminiApiKey = ""
)

if ($ProjectId) {
    $env:GOOGLE_CLOUD_PROJECT = $ProjectId
    $env:PROJECT_ID = $ProjectId
}

if ($Region) {
    $env:REGION = $Region
}

if ($GeminiApiKey) {
    $env:GEMINI_API_KEY = $GeminiApiKey
}

if (-not $env:PORT) {
    $env:PORT = "8090"
}

Write-Host "Master AI Orchestrator environment configured" -ForegroundColor Green
Write-Host "  GOOGLE_CLOUD_PROJECT: $($env:GOOGLE_CLOUD_PROJECT)"
Write-Host "  REGION: $($env:REGION)"
Write-Host "  GEMINI_API_KEY configured: $([bool]$env:GEMINI_API_KEY)"
Write-Host "  PORT: $($env:PORT)"
