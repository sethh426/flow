#!/usr/bin/env pwsh
# Run a specific Java service

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("analytics", "processing", "integration", "all")]
    [string]$Service = "analytics"
)

$services = @{
    "analytics" = @{
        Name = "Analytics Service"
        Path = "services/java/analytics-service"
        Port = 8090
        Jar = "analytics-service-1.0.0-SNAPSHOT.jar"
    }
    "processing" = @{
        Name = "Data Processing Service"
        Path = "services/java/data-processing-service"
        Port = 8091
        Jar = "data-processing-service-1.0.0-SNAPSHOT.jar"
    }
    "integration" = @{
        Name = "Integration Service"
        Path = "services/java/integration-service"
        Port = 8092
        Jar = "integration-service-1.0.0-SNAPSHOT.jar"
    }
}

function Start-JavaService {
    param($ServiceConfig)
    
    Write-Host "Starting $($ServiceConfig.Name)..." -ForegroundColor Cyan
    Write-Host "Port: $($ServiceConfig.Port)" -ForegroundColor Gray
    
    $jarPath = Join-Path $ServiceConfig.Path "target" $ServiceConfig.Jar
    
    if (-not (Test-Path $jarPath)) {
        Write-Host "JAR not found: $jarPath" -ForegroundColor Red
        Write-Host "Run .\build-java-services.ps1 first to build the services" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "Starting service..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    java -jar $jarPath
    
    return $true
}

if ($Service -eq "all") {
    Write-Host "Starting all Java services..." -ForegroundColor Cyan
    Write-Host "Note: Services will run in separate terminals" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($key in $services.Keys) {
        $config = $services[$key]
        $jarPath = Join-Path $config.Path "target" $config.Jar
        
        if (Test-Path $jarPath) {
            Write-Host "Starting $($config.Name) on port $($config.Port)..." -ForegroundColor Green
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "java -jar '$jarPath'"
        } else {
            Write-Host "Skipping $($config.Name) - JAR not found" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "All services started in separate terminals!" -ForegroundColor Green
} else {
    $config = $services[$Service]
    if (-not $config) {
        Write-Host "Unknown service: $Service" -ForegroundColor Red
        Write-Host "Available services: analytics, processing, integration, all" -ForegroundColor Yellow
        exit 1
    }
    
    Start-JavaService -ServiceConfig $config
}
