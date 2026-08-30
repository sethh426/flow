# Test Flow Orchestrator Locally
# This script runs the orchestrator on localhost for testing

$ErrorActionPreference = "Stop"

Write-Host "🧪 Testing Flow Orchestrator Locally..." -ForegroundColor Cyan

# Check for .env file
$ENV_FILE = ".env"
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    
    # Get Gemini API key from client/.env.local
    $CLIENT_ENV = "..\..\client\.env.local"
    if (Test-Path $CLIENT_ENV) {
        $GEMINI_KEY = Get-Content $CLIENT_ENV | Select-String "NEXT_PUBLIC_GEMINI_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1] }
        
        @"
GEMINI_API_KEY=$GEMINI_KEY
PORT=8080
NODE_ENV=development
"@ | Out-File -FilePath $ENV_FILE -Encoding UTF8
        
        Write-Host "✅ Created .env file with Gemini API key" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find client/.env.local. Please create .env manually." -ForegroundColor Red
        Write-Host "   Copy .env.example and add your GEMINI_API_KEY" -ForegroundColor Yellow
        exit 1
    }
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host ""
Write-Host "🚀 Starting Flow Orchestrator on port 8080..." -ForegroundColor Green
Write-Host "   Health Check: http://localhost:8080/health" -ForegroundColor Cyan
Write-Host "   WebSocket: ws://localhost:8080/flow-autopilot" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start
