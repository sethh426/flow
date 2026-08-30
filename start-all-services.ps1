# AffiliateFlow - Start All Services
# This script starts the Next.js frontend and LocalTunnel in separate windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting AffiliateFlow Services..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$ClientPath = "c:\Users\sethp\Downloads\Affiliate-Flow-Prototype\client"
$RootPath = "c:\Users\sethp\Downloads\Affiliate-Flow-Prototype"
$Port = 3000
$TunnelSubdomain = "affiliateflow-demo"

# Kill existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {
    ($_.ProcessName -eq "node" -and $_.CommandLine -like "*next dev*") -or
    ($_.ProcessName -like "*lt*") -or
    ($_.CommandLine -like "*localtunnel*")
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

# Start Next.js in a new window
Write-Host "▶️  Starting Next.js frontend on port $Port..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ClientPath' ; Write-Host 'Next.js Development Server' -ForegroundColor Cyan ; npm run dev"
) -WindowStyle Normal

Start-Sleep -Seconds 5

# Verify Next.js is running
Write-Host "🔍 Verifying Next.js startup..." -ForegroundColor Yellow
$retries = 0
$maxRetries = 10
$nextjsRunning = $false

while ($retries -lt $maxRetries -and -not $nextjsRunning) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port" -TimeoutSec 3 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Next.js is running on http://localhost:$Port" -ForegroundColor Green
            $nextjsRunning = $true
        }
    } catch {
        $retries++
        Write-Host "   Waiting for Next.js... retry $retries of $maxRetries" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $nextjsRunning) {
    Write-Host "❌ Failed to start Next.js. Please check the Next.js window for errors." -ForegroundColor Red
    exit 1
}

# Start LocalTunnel in a new window
Write-Host "🌐 Starting LocalTunnel..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$RootPath' ; Write-Host 'LocalTunnel Service' -ForegroundColor Cyan ; npx localtunnel --port $Port --subdomain $TunnelSubdomain"
) -WindowStyle Normal

Start-Sleep -Seconds 8

# Verify LocalTunnel
Write-Host "🔍 Verifying LocalTunnel..." -ForegroundColor Yellow
$tunnelRetries = 0
$maxTunnelRetries = 5
$tunnelRunning = $false

while ($tunnelRetries -lt $maxTunnelRetries -and -not $tunnelRunning) {
    try {
        $response = Invoke-WebRequest -Uri "https://$TunnelSubdomain.loca.lt" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ LocalTunnel is active at https://$TunnelSubdomain.loca.lt" -ForegroundColor Green
            $tunnelRunning = $true
        }
    } catch {
        $tunnelRetries++
        Write-Host "   Waiting for LocalTunnel... retry $tunnelRetries of $maxTunnelRetries" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

if (-not $tunnelRunning) {
    Write-Host "⚠️  LocalTunnel may not be ready yet. Check the LocalTunnel window." -ForegroundColor Yellow
}

# Display status
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ AffiliateFlow Services Started Successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Service URLs:" -ForegroundColor White
Write-Host "   Local:        http://localhost:$Port" -ForegroundColor Gray
Write-Host "   Public:       https://$TunnelSubdomain.loca.lt" -ForegroundColor Gray
Write-Host "   Neural AI:    https://us-central1-affiliateflow-abzfy.cloudfunctions.net" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Neural AI Functions Deployed:" -ForegroundColor White
Write-Host "   • aiRoute      - Main AI routing endpoint" -ForegroundColor Gray
Write-Host "   • aiGenerate   - Creative content generation" -ForegroundColor Gray
Write-Host "   • aiAnalyze    - Content analysis" -ForegroundColor Gray
Write-Host "   • aiCode       - Code generation" -ForegroundColor Gray
Write-Host "   • aiBatch      - Batch processing" -ForegroundColor Gray
Write-Host "   • aiHealth     - System health metrics" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Management:" -ForegroundColor White
Write-Host "   • Two PowerShell windows opened (Next.js + LocalTunnel)" -ForegroundColor Gray
Write-Host "   • Close those windows to stop services" -ForegroundColor Gray
Write-Host "   • Re-run this script to restart everything" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Test AI Integration:" -ForegroundColor White
Write-Host "   1. Visit https://$TunnelSubdomain.loca.lt" -ForegroundColor Gray
Write-Host "   2. Navigate to Content Studio" -ForegroundColor Gray
Write-Host "   3. Click 'Generate with AI'" -ForegroundColor Gray
Write-Host "   4. Check snackbar for model info (e.g., 'gemini-2.0-flash-exp')" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window (services will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
