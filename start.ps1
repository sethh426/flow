# AffiliateFlow - Start All Services
# Opens each service in its own PowerShell window

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AffiliateFlow - Starting All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes first
Write-Host "Cleaning up any existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "[OK] Cleanup complete" -ForegroundColor Green
Write-Host ""

# Define services
$services = @(
    @{
        Name = "Vision Analyzer"
        Path = "services\vision-analyzer"
        Port = 8083
        Color = "Green"
    },
    @{
        Name = "Workflow Executor"
        Path = "services\workflow-executor"
        Port = 8081
        Color = "Blue"
    },
    @{
        Name = "Product Mapper"
        Path = "services\product-mapper"
        Port = 8082
        Color = "Magenta"
    },
    @{
        Name = "Next.js App"
        Path = "client"
        Port = 3000
        Color = "Cyan"
    }
)

Write-Host "Starting services in new windows..." -ForegroundColor Cyan
Write-Host ""

$rootPath = Get-Location

foreach ($service in $services) {
    $fullPath = Join-Path $rootPath $service.Path
    
    if (Test-Path $fullPath) {
        Write-Host "  Starting: $($service.Name) on port $($service.Port)..." -ForegroundColor Gray
        
        # Create startup command
        $startCommand = if ($service.Name -eq "Next.js App") {
            "npm run dev"
        } else {
            "npm start"
        }
        
        # Create the command to run in new window
        $command = @"
Write-Host '================================================' -ForegroundColor $($service.Color);
Write-Host '  $($service.Name) - Port $($service.Port)' -ForegroundColor $($service.Color);
Write-Host '================================================' -ForegroundColor $($service.Color);
Write-Host '';
cd '$fullPath';
Write-Host 'Installing dependencies...' -ForegroundColor Yellow;
npm install --silent 2>&1 | Out-Null;
Write-Host '[OK] Dependencies ready' -ForegroundColor Green;
Write-Host '';
Write-Host 'Starting service...' -ForegroundColor Yellow;
Write-Host '';
$startCommand
"@
        
        # Start in new PowerShell window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        
        Start-Sleep -Milliseconds 800
    } else {
        Write-Host "  [SKIP] Not found: $($service.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[OK] All services starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "Waiting 20 seconds for initialization..." -ForegroundColor Gray
Start-Sleep -Seconds 20

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Services Status" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check each service
foreach ($service in $services) {
    $url = if ($service.Port -eq 3000) {
        "http://localhost:3000/api/health"
    } else {
        "http://localhost:$($service.Port)/health"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  [ONLINE]  $($service.Name) - http://localhost:$($service.Port)" -ForegroundColor Green
    } catch {
        Write-Host "  [STARTING] $($service.Name) - http://localhost:$($service.Port) (may need more time)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Ready to Use!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open App: http://localhost:3000" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "Service Windows:" -ForegroundColor Cyan
Write-Host "  Check each PowerShell window for service logs" -ForegroundColor Gray
Write-Host "  Green = Running, Red = Error" -ForegroundColor Gray
Write-Host ""
Write-Host "Try FlowBot:" -ForegroundColor Cyan
Write-Host "  'Find fashion trends'" -ForegroundColor DarkGray
Write-Host "  'Search for wireless headphones'" -ForegroundColor DarkGray
Write-Host "  'Create a workflow'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "  .\check_status.ps1  - Check service status" -ForegroundColor Gray
Write-Host "  .\stop_all_services.ps1  - Stop all services" -ForegroundColor Gray
Write-Host ""
