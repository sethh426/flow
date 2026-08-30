# Check Status of All Services

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AffiliateFlow - Service Status Check" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Vision Analyzer"; Port=8083},
    @{Name="Workflow Executor"; Port=8081},
    @{Name="Product Mapper"; Port=8082},
    @{Name="Next.js App"; Port=3000}
)

foreach ($service in $services) {
    $url = "http://localhost:$($service.Port)/health"
    if ($service.Port -eq 3000) {
        $url = "http://localhost:3000/api/health"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Host "[ONLINE]  $($service.Name) - Port $($service.Port)" -ForegroundColor Green
    } catch {
        Write-Host "[OFFLINE] $($service.Name) - Port $($service.Port)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Tip: Services may take 15-30 seconds to start on first run" -ForegroundColor Yellow
Write-Host ""
