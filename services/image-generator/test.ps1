# Test Image Generator Service
# Quick test script to verify image generation

$ErrorActionPreference = "Stop"

Write-Host "🎨 Testing Image Generator Service..." -ForegroundColor Cyan

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found. Please install Python 3.11 or higher." -ForegroundColor Red
    exit 1
}

# Navigate to service directory
Set-Location -Path "$PSScriptRoot"

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    
    # Get Gemini API key from client/.env.local
    $CLIENT_ENV = "..\..\client\.env.local"
    if (Test-Path $CLIENT_ENV) {
        $GEMINI_KEY = Get-Content $CLIENT_ENV | Select-String "NEXT_PUBLIC_GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1] }
        
        "GEMINI_API_KEY=$GEMINI_KEY" | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Created .env file with Gemini API key" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find client/.env.local. Please create .env manually." -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
python -m pip install -r requirements.txt --quiet

# Run test generation
Write-Host ""
Write-Host "🎨 Generating test images..." -ForegroundColor Green
Write-Host ""

python image_generator.py

Write-Host ""
Write-Host "✅ Test complete! Check the generated_images/ directory." -ForegroundColor Green
Write-Host ""
Write-Host "To start the API server:" -ForegroundColor Yellow
Write-Host "  python api.py" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at:" -ForegroundColor Yellow
Write-Host "  http://localhost:5001" -ForegroundColor Cyan
Write-Host "  http://localhost:5001/health" -ForegroundColor Cyan
Write-Host ""
