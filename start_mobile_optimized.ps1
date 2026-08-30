# Quick Start - Mobile Optimized Build

Write-Host "🚀 Starting Affiliate Flow with Mobile Optimizations..." -ForegroundColor Cyan

# Navigate to client directory
Set-Location -Path "client"

# Check if build exists
if (Test-Path "out") {
    Write-Host "✅ Using existing optimized build" -ForegroundColor Green
} else {
    Write-Host "📦 Building optimized version for mobile..." -ForegroundColor Yellow
    npm run build
}

# Get local IP
$localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📱 MOBILE OPTIMIZED APP IS READY!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Local:   http://localhost:3000" -ForegroundColor White
Write-Host "📱 Mobile:  http://${localIp}:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Performance improvements:" -ForegroundColor Cyan
Write-Host "   • Code splitting enabled" -ForegroundColor White
Write-Host "   • Mobile animations reduced" -ForegroundColor White
Write-Host "   • Optimized bundle size" -ForegroundColor White
Write-Host "   • Lazy loading implemented" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Starting development server..." -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev
