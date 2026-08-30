# AffiliateFlow - Stop All Services
# This script kills all node processes (stops all services)

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AffiliateFlow - Stopping All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Find all node processes
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($proc in $nodeProcesses) {
        Write-Host "  Stopping process: $($proc.Id)" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host ""
    Write-Host "[OK] All services stopped" -ForegroundColor Green
} else {
    Write-Host "[INFO] No Node.js processes found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All services have been stopped." -ForegroundColor Green
Write-Host ""
