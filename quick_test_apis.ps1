# Quick Test Script
# Tests all API endpoints

Write-Host "ðŸ§ª Running Quick Tests..." -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test health endpoint
Write-Host "
Testing FlowBot API..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flowbot" -Method POST -Body (@{message="Hello";history=@()} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "âœ… FlowBot API working" -ForegroundColor Green
} catch {
    Write-Host "âŒ FlowBot API failed" -ForegroundColor Red
}

# Test content generation
Write-Host "
Testing Content Generation API..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/content/generate" -Method POST -Body (@{type="caption";platform="instagram";topic="test"} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "âœ… Content Generation API working" -ForegroundColor Green
} catch {
    Write-Host "âŒ Content Generation API failed" -ForegroundColor Red
}

# Test product search
Write-Host "
Testing Product Search API..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products/search" -Method POST -Body (@{query="dress";limit=5} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "âœ… Product Search API working" -ForegroundColor Green
} catch {
    Write-Host "âŒ Product Search API failed" -ForegroundColor Red
}

Write-Host "
âœ… Quick tests complete!" -ForegroundColor Green
