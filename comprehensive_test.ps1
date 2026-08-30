# Comprehensive AffiliateFlow Testing Script
# Tests all major API endpoints and features

Write-Host "🧪 AffiliateFlow Comprehensive Testing Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$passed = 0
$failed = 0
$skipped = 0

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Body = @{},
        [bool]$ExpectSuccess = $true
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow -NoNewline
    
    try {
        $jsonBody = $Body | ConvertTo-Json -Depth 10
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        }
        
        if ($ExpectSuccess) {
            Write-Host " ✅ PASSED" -ForegroundColor Green
            $script:passed++
            return $response
        } else {
            Write-Host " ⚠️ UNEXPECTED SUCCESS" -ForegroundColor Yellow
            $script:failed++
            return $null
        }
    }
    catch {
        if (-not $ExpectSuccess) {
            Write-Host " ✅ PASSED (Expected failure)" -ForegroundColor Green
            $script:passed++
            return $null
        } else {
            Write-Host " ❌ FAILED" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:failed++
            return $null
        }
    }
}

# Check if server is running
Write-Host "🔍 Pre-flight Check" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running on $baseUrl" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Server is not running on $baseUrl" -ForegroundColor Red
    Write-Host "Please start the server with: cd client && npm run dev" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# TEST SUITE 1: FlowBot API
# ============================================================================
Write-Host "📝 Test Suite 1: FlowBot API" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint `
    -Name "FlowBot - Basic greeting" `
    -Method "POST" `
    -Url "$baseUrl/api/flowbot" `
    -Body @{
        message = "Hello"
        history = @()
    }

Test-Endpoint `
    -Name "FlowBot - Capabilities query" `
    -Method "POST" `
    -Url "$baseUrl/api/flowbot" `
    -Body @{
        message = "What can you do?"
        history = @()
    }

Test-Endpoint `
    -Name "FlowBot - Content generation request" `
    -Method "POST" `
    -Url "$baseUrl/api/flowbot" `
    -Body @{
        message = "Generate an Instagram caption about summer fashion"
        history = @()
    }

Test-Endpoint `
    -Name "FlowBot - Empty message (should fail)" `
    -Method "POST" `
    -Url "$baseUrl/api/flowbot" `
    -Body @{
        message = ""
        history = @()
    } `
    -ExpectSuccess $false

Write-Host ""

# ============================================================================
# TEST SUITE 2: Content Generation API
# ============================================================================
Write-Host "🎨 Test Suite 2: Content Generation API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint `
    -Name "Content Gen - Instagram caption" `
    -Method "POST" `
    -Url "$baseUrl/api/content/generate" `
    -Body @{
        type = "caption"
        platform = "instagram"
        topic = "summer fashion"
        tone = "casual"
    }

Test-Endpoint `
    -Name "Content Gen - TikTok script" `
    -Method "POST" `
    -Url "$baseUrl/api/content/generate" `
    -Body @{
        type = "script"
        platform = "tiktok"
        topic = "product review"
        duration = 60
    }

Test-Endpoint `
    -Name "Content Gen - Blog post" `
    -Method "POST" `
    -Url "$baseUrl/api/content/generate" `
    -Body @{
        type = "blog"
        topic = "affiliate marketing tips"
        length = "short"
    }

Test-Endpoint `
    -Name "Content Gen - Missing required fields (should fail)" `
    -Method "POST" `
    -Url "$baseUrl/api/content/generate" `
    -Body @{
        type = "caption"
    } `
    -ExpectSuccess $false

Write-Host ""

# ============================================================================
# TEST SUITE 3: Product Search API
# ============================================================================
Write-Host "🔍 Test Suite 3: Product Search API" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint `
    -Name "Product Search - Nordstrom dresses" `
    -Method "POST" `
    -Url "$baseUrl/api/products/search" `
    -Body @{
        query = "dresses"
        source = "nordstrom"
        limit = 5
    }

Test-Endpoint `
    -Name "Product Search - Multi-source" `
    -Method "POST" `
    -Url "$baseUrl/api/products/search" `
    -Body @{
        query = "sneakers"
        sources = @("nordstrom", "amazon")
        limit = 10
    }

Test-Endpoint `
    -Name "Product Search - Empty query (should fail)" `
    -Method "POST" `
    -Url "$baseUrl/api/products/search" `
    -Body @{
        query = ""
    } `
    -ExpectSuccess $false

Write-Host ""

# ============================================================================
# TEST SUITE 4: Campaign API
# ============================================================================
Write-Host "📊 Test Suite 4: Campaign API" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏭️  SKIPPED - Requires authentication" -ForegroundColor Yellow
$script:skipped += 3
Write-Host ""

# ============================================================================
# TEST SUITE 5: Workflow API
# ============================================================================
Write-Host "⚙️  Test Suite 5: Workflow API" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏭️  SKIPPED - Requires authentication" -ForegroundColor Yellow
$script:skipped += 3
Write-Host ""

# ============================================================================
# TEST SUITE 6: Vision API
# ============================================================================
Write-Host "👁️  Test Suite 6: Vision API" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$testImageUrl = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b"

Test-Endpoint `
    -Name "Vision - Image analysis" `
    -Method "POST" `
    -Url "$baseUrl/api/vision/analyze" `
    -Body @{
        imageUrl = $testImageUrl
    }

Test-Endpoint `
    -Name "Vision - Brand safety check" `
    -Method "POST" `
    -Url "$baseUrl/api/vision/safety" `
    -Body @{
        imageUrl = $testImageUrl
    }

Test-Endpoint `
    -Name "Vision - OCR text extraction" `
    -Method "POST" `
    -Url "$baseUrl/api/vision/ocr" `
    -Body @{
        imageUrl = $testImageUrl
    }

Write-Host ""

# ============================================================================
# TEST SUITE 7: Instagram OAuth
# ============================================================================
Write-Host "📸 Test Suite 7: Instagram OAuth" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏭️  SKIPPED - Requires Instagram App configuration" -ForegroundColor Yellow
$script:skipped += 2
Write-Host ""

# ============================================================================
# TEST SUITE 8: Stripe Payment
# ============================================================================
Write-Host "💳 Test Suite 8: Stripe Payment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏭️  SKIPPED - Requires Stripe configuration" -ForegroundColor Yellow
$script:skipped += 2
Write-Host ""

# ============================================================================
# RESULTS SUMMARY
# ============================================================================
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$total = $passed + $failed + $skipped
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 2) } else { 0 }

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "✅ Passed:   $passed" -ForegroundColor Green
Write-Host "❌ Failed:   $failed" -ForegroundColor Red
Write-Host "⏭️  Skipped:  $skipped" -ForegroundColor Yellow
Write-Host "Pass Rate:  $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 All tests passed! Your application is working correctly!" -ForegroundColor Green
} elseif ($failed -le 2) {
    Write-Host "⚠️  Some tests failed. Review the errors above." -ForegroundColor Yellow
} else {
    Write-Host "❌ Multiple tests failed. Check your configuration and services." -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 Notes:" -ForegroundColor Cyan
Write-Host "- Authentication tests skipped (requires logged-in user)" -ForegroundColor Gray
Write-Host "- Instagram/Stripe tests skipped (requires API configuration)" -ForegroundColor Gray
Write-Host "- Vision API tests may fail if service is not running" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Access your app: $baseUrl" -ForegroundColor Cyan
Write-Host ""
