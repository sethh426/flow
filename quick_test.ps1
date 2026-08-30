# Quick Start Testing Script
# Starts all services and runs tests

Write-Host "🚀 Quick Start - AffiliateFlow Testing" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "client\package.json")) {
    Write-Host "❌ Error: Run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Installing Dependencies" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Cyan
cd client
npm install stripe @stripe/stripe-js 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Warning: Some packages may already be installed" -ForegroundColor Yellow
}
cd ..

Write-Host "✅ Dependencies checked" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Environment Check" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

# Check for service account key
if (Test-Path "serviceAccountKey.json") {
    Write-Host "✅ Service account key found" -ForegroundColor Green
} else {
    Write-Host "❌ serviceAccountKey.json not found in root" -ForegroundColor Red
    Write-Host "   Please add your Firebase service account key" -ForegroundColor Yellow
}

# Check for .env.local
if (Test-Path "client\.env.local") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "⚠️ client\.env.local not found" -ForegroundColor Yellow
    Write-Host "   Creating template..." -ForegroundColor Cyan
    
    $envTemplate = @"
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Service URLs
VISION_ANALYZER_URL=http://localhost:8083
WORKFLOW_EXECUTOR_URL=http://localhost:8082
PRODUCT_MAPPER_URL=http://localhost:8081

# Instagram OAuth (optional for now)
INSTAGRAM_APP_ID=your_test_app_id
INSTAGRAM_APP_SECRET=your_test_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback

# Stripe (optional for now)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
"@
    
    $envTemplate | Out-File -FilePath "client\.env.local" -Encoding UTF8
    Write-Host "   ✅ Template created at client\.env.local" -ForegroundColor Green
    Write-Host "   📝 Please fill in your API keys" -ForegroundColor Yellow
}

Write-Host ""

Write-Host "Step 3: Service Status Check" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Check if ports are available
$ports = @(3000, 8081, 8082, 8083)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        $portsInUse += $port
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "⚠️ Ports already in use: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "   Services may already be running" -ForegroundColor Cyan
} else {
    Write-Host "✅ All ports available" -ForegroundColor Green
}

Write-Host ""

Write-Host "Step 4: Starting Services" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

Write-Host "Choose testing mode:" -ForegroundColor Cyan
Write-Host "  1. Quick Test (Next.js only - uses mock data)"  -ForegroundColor White
Write-Host "  2. Full Test (All services including Vision API)" -ForegroundColor White
Write-Host ""
$mode = Read-Host "Enter choice (1 or 2)"

if ($mode -eq "2") {
    Write-Host ""
    Write-Host "Starting full test mode..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️ Important: Open additional terminals and run:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Terminal 2: .\start_vision_analyzer.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter when services are running..." -ForegroundColor Yellow
    $null = Read-Host
}

Write-Host ""
Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
Write-Host ""

# Start Next.js in a new window
$nextjsJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm run dev" -PassThru

Write-Host "✅ Next.js starting in new window (PID: $($nextjsJob.Id))" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting for server to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Test if server is up
$maxAttempts = 12
$attempt = 0
$serverUp = $false

while ($attempt -lt $maxAttempts -and -not $serverUp) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        $serverUp = $true
        Write-Host "✅ Server is up!" -ForegroundColor Green
    } catch {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

if (-not $serverUp) {
    Write-Host "⚠️ Server may still be starting. Check the Next.js window." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Step 5: Running Tests" -ForegroundColor Yellow
    Write-Host "=====================" -ForegroundColor Yellow
    Write-Host ""
    
    # Run test suite
    .\test_all.ps1
    
    Write-Host ""
    Write-Host "Step 6: Access Application" -ForegroundColor Yellow
    Write-Host "==========================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    
    Write-Host ""
    Write-Host "✅ Application is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs:" -ForegroundColor Cyan
    Write-Host "  • Dashboard: http://localhost:3000" -ForegroundColor White
    Write-Host "  • FlowBot: http://localhost:3000/dashboard?view=8" -ForegroundColor White
    Write-Host "  • Workflows: http://localhost:3000/dashboard?view=9" -ForegroundColor White
    Write-Host ""
    Write-Host "Services Running:" -ForegroundColor Cyan
    Write-Host "  • Next.js: Port 3000 ✅" -ForegroundColor Green
    if ($mode -eq "2") {
        Write-Host "  • Vision Analyzer: Port 8083 (check terminal)" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "Testing Tips:" -ForegroundColor Cyan
Write-Host "  1. Test FlowBot chat functionality" -ForegroundColor White
Write-Host "  2. Try creating a campaign" -ForegroundColor White
Write-Host "  3. Search for products" -ForegroundColor White
Write-Host "  4. Generate content with AI" -ForegroundColor White
Write-Host "  5. Create and execute workflows" -ForegroundColor White
Write-Host ""

Write-Host "To stop services:" -ForegroundColor Cyan
Write-Host "  • Close the Next.js terminal window" -ForegroundColor White
Write-Host "  • Or press Ctrl+C in each service terminal" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation: See TESTING_GUIDE.md for detailed tests" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press Enter to exit this script (services will keep running)..." -ForegroundColor Gray
$null = Read-Host
