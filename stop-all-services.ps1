# AffiliateFlow - Stop All Services
# This script stops all Next.js and LocalTunnel processes

$ErrorActionPreference = "Continue"

Write-Host "🛑 Stopping AffiliateFlow Services..." -ForegroundColor Red
Write-Host ""

# Stop Next.js processes
Write-Host "Stopping Next.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {
    $_.ProcessName -eq "node" -and (
        $_.CommandLine -like "*next dev*" -or
        $_.CommandLine -like "*next\dist\bin\next*" -or
        $_.CommandLine -like "*npm run dev*"
    )
}

if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Stopped $($nodeProcesses.Count) Next.js process(es)" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Next.js processes found" -ForegroundColor Gray
}

# Stop LocalTunnel processes
Write-Host "Stopping LocalTunnel processes..." -ForegroundColor Yellow
$tunnelProcesses = Get-Process | Where-Object {
    $_.ProcessName -like "*lt*" -or
    $_.CommandLine -like "*localtunnel*"
}

if ($tunnelProcesses) {
    $tunnelProcesses | Stop-Process -Force
    Write-Host "✅ Stopped $($tunnelProcesses.Count) LocalTunnel process(es)" -ForegroundColor Green
} else {
    Write-Host "⚠️  No LocalTunnel processes found" -ForegroundColor Gray
}

# Close PowerShell windows (optional - commented out to avoid closing this window)
# Get-Process powershell | Where-Object { $_.MainWindowTitle -like "*Next.js*" -or $_.MainWindowTitle -like "*LocalTunnel*" } | Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ All services stopped!" -ForegroundColor Green
Write-Host ""
Write-Host "To restart services, run: .\start-all-services.ps1" -ForegroundColor Cyan
Write-Host ""
