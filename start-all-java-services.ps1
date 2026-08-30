# AffiliateFlow Combined Java Services

param([switch]$Stop)

if ($Stop) {
    Write-Host "Stopping all Java services..." -ForegroundColor Yellow
    Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "All services stopped" -ForegroundColor Green
    exit 0
}

Write-Host "Starting AffiliateFlow Java Services" -ForegroundColor Cyan

# Java path
$javaExe = "C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot\bin\java.exe"

# Start services in new windows
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Analytics Service' -ForegroundColor Cyan; cd services\java\analytics-service; & '$javaExe' -jar target\analytics-service-1.0.0-SNAPSHOT.jar"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Processing Service' -ForegroundColor Cyan; cd services\java\data-processing-service; & '$javaExe' -jar target\data-processing-service-1.0.0-SNAPSHOT.jar"
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Integration Service' -ForegroundColor Cyan; cd services\java\integration-service; & '$javaExe' -jar target\integration-service-1.0.0-SNAPSHOT.jar"

Write-Host "Waiting for services..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test
Write-Host "Testing..." -ForegroundColor Cyan
$ok = 0

try {
    Invoke-WebRequest -Uri "http://localhost:8090/api/analytics/health" -UseBasicParsing | Out-Null
    Write-Host "Analytics: OK" -ForegroundColor Green
    $ok++
} catch { Write-Host "Analytics: FAIL" -ForegroundColor Red }

try {
    Invoke-WebRequest -Uri "http://localhost:8091/api/processing/health" -UseBasicParsing | Out-Null
    Write-Host "Processing: OK" -ForegroundColor Green
    $ok++
} catch { Write-Host "Processing: FAIL" -ForegroundColor Red }

try {
    Invoke-WebRequest -Uri "http://localhost:8092/api/integration/health" -UseBasicParsing | Out-Null
    Write-Host "Integration: OK" -ForegroundColor Green
    $ok++
} catch { Write-Host "Integration: FAIL" -ForegroundColor Red }

Write-Host ""
Write-Host "$ok/3 services running" -ForegroundColor $(if ($ok -eq 3) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Cyan
Write-Host "  http://localhost:8090/api/analytics/*"
Write-Host "  http://localhost:8091/api/processing/*"
Write-Host "  http://localhost:8092/api/integration/*"
Write-Host ""
Write-Host "To stop: .\start-all-java-services.ps1 -Stop" -ForegroundColor Yellow
