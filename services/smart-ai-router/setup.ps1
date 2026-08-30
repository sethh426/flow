# Smart AI Router - Installation & Setup
# Run this script to install and test the service

Write-Host ""
Write-Host "🚀 ======================================" -ForegroundColor Cyan
Write-Host "   Smart AI Router - Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to service directory
$servicePath = "services\smart-ai-router"
if (-not (Test-Path $servicePath)) {
    Write-Host "❌ Error: Service directory not found" -ForegroundColor Red
    Write-Host "   Expected: $servicePath" -ForegroundColor Yellow
    exit 1
}

Set-Location $servicePath
Write-Host "📁 Working directory: $servicePath" -ForegroundColor Green
Write-Host ""

# Check for package.json
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creating .env file..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env and add your API keys" -ForegroundColor Yellow
    Write-Host "   Minimum required: GEMINI_API_KEY" -ForegroundColor Yellow
    Write-Host ""
    
    # Ask if user wants to edit now
    $edit = Read-Host "Would you like to edit .env now? (y/n)"
    if ($edit -eq "y" -or $edit -eq "Y") {
        notepad .env
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

Write-Host ""

# Check if GEMINI_API_KEY is set
$envContent = Get-Content ".env" -Raw
if ($envContent -match "GEMINI_API_KEY=(?!your_)(.+)") {
    Write-Host "✅ GEMINI_API_KEY is configured" -ForegroundColor Green
    $canTest = $true
} else {
    Write-Host "⚠️  GEMINI_API_KEY not configured" -ForegroundColor Yellow
    Write-Host "   Edit .env and add your Gemini API key to run tests" -ForegroundColor Yellow
    $canTest = $false
}

Write-Host ""

# Ask to run tests
if ($canTest) {
    $runTest = Read-Host "Would you like to run the test suite now? (y/n)"
    if ($runTest -eq "y" -or $runTest -eq "Y") {
        Write-Host ""
        Write-Host "🧪 Running tests..." -ForegroundColor Cyan
        Write-Host ""
        npm test
        Write-Host ""
    }
}

# Show next steps
Write-Host ""
Write-Host "🎉 ======================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure API keys in .env:" -ForegroundColor White
Write-Host "   notepad .env" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Run tests:" -ForegroundColor White
Write-Host "   npm test" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Start HTTP server (optional):" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Or import as library in your code:" -ForegroundColor White
Write-Host "   import { SmartAIRouter } from './services/smart-ai-router'" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md (full docs)" -ForegroundColor White
Write-Host "   - QUICKSTART.md (quick guide)" -ForegroundColor White
Write-Host "   - SERVICE_COMPLETE.md (summary)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ready to use! 🚀" -ForegroundColor Green
Write-Host ""
