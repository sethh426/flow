# 🧪 Complete Testing Suite - AffiliateFlow

Write-Host "🚀 AffiliateFlow Testing Suite" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3000"
$visionUrl = "http://localhost:8083"
$testUserId = "test-user-123"

# Test results
$results = @{
    passed = 0
    failed = 0
    skipped = 0
}

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null,
        [bool]$Required = $true
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 10
        } else {
            $headers = @{ "Content-Type" = "application/json" }
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Body $Body -Headers $headers -UseBasicParsing -TimeoutSec 10
        }
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            Write-Host "  ✅ PASSED" -ForegroundColor Green
            $results.passed++
            return $true
        } else {
            Write-Host "  ❌ FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            $results.failed++
            return $false
        }
    } catch {
        if ($Required) {
            Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
            $results.failed++
        } else {
            Write-Host "  ⚠️ SKIPPED (Service not running)" -ForegroundColor Yellow
            $results.skipped++
        }
        return $false
    }
}

Write-Host "Phase 1: Service Health Checks" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test Vision Analyzer
Test-Endpoint -Name "Vision Analyzer Health" -Url "$visionUrl/health" -Required $false

# Test Next.js
Test-Endpoint -Name "Next.js Server" -Url "$baseUrl" -Required $true

Write-Host ""
Write-Host "Phase 2: API Endpoint Tests" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Test FlowBot
$flowbotBody = @{
    message = "Hello! What can you help me with?"
    history = @()
} | ConvertTo-Json

Test-Endpoint -Name "FlowBot API" -Url "$baseUrl/api/flowbot" -Method "POST" -Body $flowbotBody

# Test Content Generation
$contentBody = @{
    type = "caption"
    platform = "instagram"
    topic = "summer fashion"
    tone = "trendy"
} | ConvertTo-Json

Test-Endpoint -Name "Content Generation API" -Url "$baseUrl/api/content/generate" -Method "POST" -Body $contentBody

# Test Product Search
$productBody = @{
    query = "dress"
    limit = 5
} | ConvertTo-Json

Test-Endpoint -Name "Product Search API" -Url "$baseUrl/api/products/search" -Method "POST" -Body $productBody

# Test Campaign API (GET)
Test-Endpoint -Name "Campaign List API" -Url "$baseUrl/api/campaigns?userId=$testUserId"

# Test Workflow API (GET)
Test-Endpoint -Name "Workflow List API" -Url "$baseUrl/api/workflows?userId=$testUserId"

Write-Host ""
Write-Host "Phase 3: Vision API Tests" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

$testImageUrl = "https://via.placeholder.com/400x600/4A90E2/ffffff?text=Test+Product"

# Test Image Analysis
$analysisBody = @{
    imageUrl = $testImageUrl
} | ConvertTo-Json

Test-Endpoint -Name "Vision Analysis API" -Url "$baseUrl/api/vision/analyze" -Method "POST" -Body $analysisBody -Required $false

# Test Brand Safety
$safetyBody = @{
    imageUrl = $testImageUrl
    text = "Check out this amazing product!"
} | ConvertTo-Json

Test-Endpoint -Name "Brand Safety API" -Url "$baseUrl/api/vision/safety" -Method "POST" -Body $safetyBody -Required $false

# Test OCR
$ocrBody = @{
    imageUrl = $testImageUrl
} | ConvertTo-Json

Test-Endpoint -Name "OCR API" -Url "$baseUrl/api/vision/ocr" -Method "POST" -Body $ocrBody -Required $false

Write-Host ""
Write-Host "Phase 4: Integration Tests" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Test Campaign Creation
$campaignBody = @{
    name = "Test Campaign"
    description = "Automated test campaign"
    budget = 100
    userId = $testUserId
} | ConvertTo-Json

Test-Endpoint -Name "Campaign Creation" -Url "$baseUrl/api/campaigns" -Method "POST" -Body $campaignBody

# Test Workflow Creation
$workflowBody = @{
    userId = $testUserId
    name = "Test Workflow"
    description = "Automated test workflow"
    niche = "fashion"
    trigger = @{
        type = "manual"
        config = @{}
    }
    stages = @()
    status = "draft"
} | ConvertTo-Json -Depth 10

Test-Endpoint -Name "Workflow Creation" -Url "$baseUrl/api/workflows" -Method "POST" -Body $workflowBody

Write-Host ""
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan
Write-Host "✅ Passed:  $($results.passed)" -ForegroundColor Green
Write-Host "❌ Failed:  $($results.failed)" -ForegroundColor Red
Write-Host "⚠️ Skipped: $($results.skipped)" -ForegroundColor Yellow
Write-Host ""

$total = $results.passed + $results.failed
if ($total -gt 0) {
    $passRate = [math]::Round(($results.passed / $total) * 100, 2)
    Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Fix any failed tests" -ForegroundColor White
Write-Host "2. Start missing services (if skipped)" -ForegroundColor White
Write-Host "3. Test in browser: $baseUrl" -ForegroundColor White
Write-Host "4. Review logs for errors" -ForegroundColor White
Write-Host ""

if ($results.failed -eq 0) {
    Write-Host "🎉 All required tests passed! Ready for manual testing." -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed. Review errors above." -ForegroundColor Yellow
}
