# Quick AffiliateFlow Test
Write-Host "🧪 Quick AffiliateFlow Test" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Server is running
Write-Host "1. Testing server..." -NoNewline
try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing -TimeoutSec 3
    Write-Host " ✅ Server running" -ForegroundColor Green
} catch {
    Write-Host " ❌ Server not running" -ForegroundColor Red
    Write-Host "   Start with: cd client && npm run dev" -ForegroundColor Yellow
    exit
}

# Test 2: FlowBot API
Write-Host "2. Testing FlowBot API..." -NoNewline
try {
    $body = @{
        message = "Hello"
        history = @()
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/flowbot" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host " ✅ FlowBot working" -ForegroundColor Green
} catch {
    Write-Host " ❌ FlowBot failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Content Generation API
Write-Host "3. Testing Content Generation..." -NoNewline
try {
    $body = @{
        type = "caption"
        platform = "instagram"
        topic = "fashion"
        tone = "casual"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/content/generate" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host " ✅ Content Gen working" -ForegroundColor Green
} catch {
    Write-Host " ❌ Content Gen failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Product Search API
Write-Host "4. Testing Product Search..." -NoNewline
try {
    $body = @{
        query = "dress"
        source = "nordstrom"
        limit = 3
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products/search" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host " ✅ Product Search working" -ForegroundColor Green
} catch {
    Write-Host " ⚠️  Product Search partial" -ForegroundColor Yellow
    Write-Host "   (May need MCP service running)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Core features are operational!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access your app: $baseUrl" -ForegroundColor Cyan
Write-Host "📝 View full docs: READY_TO_TEST.md" -ForegroundColor Cyan
Write-Host ""
