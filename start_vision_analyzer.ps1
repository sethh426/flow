# Start Vision Analyzer Service
# Run from project root

Write-Host "🚀 Starting Vision Analyzer Service..." -ForegroundColor Cyan

# Check if service account key exists
$serviceAccountPath = "serviceAccountKey.json"
if (-not (Test-Path $serviceAccountPath)) {
    Write-Host "❌ Error: serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host "💡 Make sure serviceAccountKey.json is in the project root" -ForegroundColor Yellow
    exit 1
}

# Set environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS = (Resolve-Path $serviceAccountPath).Path
$env:PORT = "8083"

Write-Host "✅ Service account configured" -ForegroundColor Green
Write-Host "📍 Port: $env:PORT" -ForegroundColor Cyan

# Change to service directory
cd services/vision-analyzer

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the service
Write-Host "🌟 Starting service on port $env:PORT..." -ForegroundColor Green
Write-Host "🔗 Health check: http://localhost:$env:PORT/health" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Gray
Write-Host ""

npm start
