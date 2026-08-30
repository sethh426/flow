# 🚀 Affiliate Flow - Quick Start Script
# This script starts all required services for the application

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 Affiliate Flow - Starting Application" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check environment files
Write-Host "🔍 Checking configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "   ❌ .env file not found!" -ForegroundColor Red
    exit 1
}
if (!(Test-Path "client\.env.local")) {
    Write-Host "   ❌ client\.env.local file not found!" -ForegroundColor Red
    exit 1
}
if (!(Test-Path "serviceAccountKey.json")) {
    Write-Host "   ❌ serviceAccountKey.json file not found!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ All configuration files found" -ForegroundColor Green
Write-Host ""

# Load environment variables
Write-Host "🔑 Verifying API keys..." -ForegroundColor Yellow
$envContent = Get-Content .env
$geminiKey = ($envContent | Where-Object { $_ -like "GEMINI_API_KEY=*" }) -replace "GEMINI_API_KEY=", ""
$firebaseKey = ($envContent | Where-Object { $_ -like "FIREBASE_API_KEY=*" }) -replace "FIREBASE_API_KEY=", ""

if ($geminiKey) {
    Write-Host "   ✅ Gemini API Key: $($geminiKey.Substring(0, 20))..." -ForegroundColor Green
} else {
    Write-Host "   ❌ Gemini API Key not found!" -ForegroundColor Red
}

if ($firebaseKey) {
    Write-Host "   ✅ Firebase API Key: $($firebaseKey.Substring(0, 20))..." -ForegroundColor Green
} else {
    Write-Host "   ❌ Firebase API Key not found!" -ForegroundColor Red
}
Write-Host ""

# Install dependencies if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (!(Test-Path "client\node_modules")) {
    Write-Host "   📥 Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
} else {
    Write-Host "   ✅ Client dependencies already installed" -ForegroundColor Green
}

if (!(Test-Path "services\master-ai-orchestrator\node_modules")) {
    Write-Host "   📥 Installing AI orchestrator dependencies..." -ForegroundColor Yellow
    Set-Location services\master-ai-orchestrator
    npm install
    Set-Location ..\..
} else {
    Write-Host "   ✅ AI orchestrator dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Start services
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎯 Starting Services..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting services in new windows..." -ForegroundColor Yellow
Write-Host "   1️⃣  Next.js Client (http://localhost:3000)" -ForegroundColor Cyan
Write-Host "   2️⃣  Master AI Orchestrator (http://localhost:3001)" -ForegroundColor Cyan
Write-Host ""

# Start Next.js client in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; Write-Host '🎨 Starting Next.js Client...' -ForegroundColor Cyan; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start AI Orchestrator in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\services\master-ai-orchestrator'; Write-Host '🤖 Starting Master AI Orchestrator...' -ForegroundColor Cyan; npm start"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Services Starting!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Application URLs:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   🤖 AI API:    http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "📚 Quick Links:" -ForegroundColor Yellow
Write-Host "   📖 API Setup: API_KEYS_SETUP.md" -ForegroundColor White
Write-Host "   🎨 Flow Assistant: FLOW_ASSISTANT_ENHANCED.md" -ForegroundColor White
Write-Host "   📋 Architecture: AFFILIATE_FLOW_ARCHITECTURE.md" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Press Ctrl+C in the service windows to stop them" -ForegroundColor Cyan
Write-Host ""
