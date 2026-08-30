# AffiliateFlow - Start All Services
# This script starts all microservices and the Next.js dev server

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AffiliateFlow - Starting All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if services directories exist
$services = @(
    @{Name="Vision Analyzer"; Path="services\vision-analyzer"; Port=8083},
    @{Name="Workflow Executor"; Path="services\workflow-executor"; Port=8081},
    @{Name="Product Mapper"; Path="services\product-mapper"; Port=8082}
)

$servicesToStart = @()

foreach ($service in $services) {
    if (Test-Path $service.Path) {
        Write-Host "[OK] Found: $($service.Name)" -ForegroundColor Green
        $servicesToStart += $service
    } else {
        Write-Host "[SKIP] Not found: $($service.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""

if ($servicesToStart.Count -eq 0) {
    Write-Host "[INFO] No services found. Starting Next.js only..." -ForegroundColor Yellow
} else {
    Write-Host "Starting $($servicesToStart.Count) service(s)..." -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($service in $servicesToStart) {
        Write-Host "  Starting: $($service.Name) on port $($service.Port)..." -ForegroundColor Gray
        
        # Start each service in a new PowerShell window
        Start-Process powershell -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd '$($service.Path)'; Write-Host '[$($service.Name)] Installing dependencies...' -ForegroundColor Yellow; npm install --silent; Write-Host '[$($service.Name)] Starting on port $($service.Port)...' -ForegroundColor Green; npm start"
        )
        
        Start-Sleep -Milliseconds 500
    }
    
    Write-Host ""
    Write-Host "[OK] Services starting in separate windows" -ForegroundColor Green
}

# Wait a bit for services to initialize
Write-Host ""
Write-Host "Waiting 5 seconds for services to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Start Next.js dev server
Write-Host ""
Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd client; Write-Host '[Next.js] Starting development server...' -ForegroundColor Green; npm run dev"
)

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services Running:" -ForegroundColor Cyan
Write-Host ""

foreach ($service in $servicesToStart) {
    Write-Host "  - $($service.Name): http://localhost:$($service.Port)" -ForegroundColor Gray
}

Write-Host "  - Next.js App: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Wait 10-20 seconds for all services to start" -ForegroundColor Gray
Write-Host "  2. Open http://localhost:3000 in your browser" -ForegroundColor Gray
Write-Host "  3. Sign up or log in" -ForegroundColor Gray
Write-Host "  4. Try FlowBot:" -ForegroundColor Gray
Write-Host "     - 'Find fashion trends'" -ForegroundColor DarkGray
Write-Host "     - 'Analyze this image: [url]'" -ForegroundColor DarkGray
Write-Host "     - 'Create a content workflow'" -ForegroundColor DarkGray
Write-Host ""
Write-Host "To check service health:" -ForegroundColor Yellow
Write-Host "  Visit: http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  Close all PowerShell windows or run: .\stop_all_services.ps1" -ForegroundColor Gray
Write-Host ""
