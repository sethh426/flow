#!/usr/bin/env pwsh
# Test Java Services

Write-Host "=== Testing AffiliateFlow Java Services ===" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Analytics Service"; Port=8090; Endpoints=@("/api/analytics/health", "/api/analytics/dashboard", "/actuator/health")}
    @{Name="Data Processing Service"; Port=8091; Endpoints=@("/api/processing/health", "/api/processing/jobs/status", "/actuator/health")}
    @{Name="Integration Service"; Port=8092; Endpoints=@("/api/integration/health", "/api/integration/connectors", "/actuator/health")}
)

function Test-Endpoint {
    param($Url, $ServiceName)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ $Url" -ForegroundColor Green
            
            # Try to parse JSON response
            try {
                $json = $response.Content | ConvertFrom-Json
                if ($json.status) {
                    Write-Host "    Status: $($json.status)" -ForegroundColor Gray
                }
            } catch {
                # Not JSON or no status field
            }
            
            return $true
        } else {
            Write-Host "  ✗ $Url (Status: $($response.StatusCode))" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  ✗ $Url (Error: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

$allPassed = $true

foreach ($service in $services) {
    Write-Host "$($service.Name) (Port $($service.Port))" -ForegroundColor Cyan
    
    $servicePassed = $true
    foreach ($endpoint in $service.Endpoints) {
        $url = "http://localhost:$($service.Port)$endpoint"
        $result = Test-Endpoint -Url $url -ServiceName $service.Name
        if (-not $result) {
            $servicePassed = $false
            $allPassed = $false
        }
    }
    
    if ($servicePassed) {
        Write-Host "  All endpoints passed!" -ForegroundColor Green
    } else {
        Write-Host "  Some endpoints failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

if ($allPassed) {
    Write-Host "=== All Services Healthy ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host "=== Some Services Have Issues ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Make sure services are running:" -ForegroundColor Yellow
    Write-Host "  .\run-java-service.ps1 -Service all" -ForegroundColor Gray
    exit 1
}
