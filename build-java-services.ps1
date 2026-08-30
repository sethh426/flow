# Build Java Services for AffiliateFlow

Write-Host "Building AffiliateFlow Java Services" -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Analytics Service"; Path="services/java/analytics-service"; Port=8090}
    @{Name="Data Processing Service"; Path="services/java/data-processing-service"; Port=8091}
    @{Name="Integration Service"; Path="services/java/integration-service"; Port=8092}
)

# Check if Maven is available
$mavenCmd = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mavenCmd) {
    Write-Host "Maven not found in PATH. Checking common locations..." -ForegroundColor Yellow
    
    $commonPaths = @(
        "C:\Program Files\Apache\maven\bin\mvn.cmd",
        "C:\Program Files\Maven\bin\mvn.cmd"
    )
    
    $found = $false
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            Write-Host "Found Maven at: $path" -ForegroundColor Green
            $mavenCmd = $path
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "Maven not found!" -ForegroundColor Red
        Write-Host "Install Maven from https://maven.apache.org/download.cgi" -ForegroundColor Yellow
        exit 1
    }
} else {
    $mavenCmd = "mvn"
}

Write-Host "Using Maven: $mavenCmd" -ForegroundColor Green
Write-Host ""

# Build each service
foreach ($service in $services) {
    Write-Host "Building $($service.Name)..." -ForegroundColor Cyan
    Write-Host "Location: $($service.Path)" -ForegroundColor Gray
    
    Push-Location $service.Path
    
    try {
        & $mavenCmd clean package -DskipTests
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: $($service.Name) built!" -ForegroundColor Green
            
            $jar = Get-ChildItem -Path "target" -Filter "*.jar" -Exclude "*-sources.jar","*-javadoc.jar" | Select-Object -First 1
            if ($jar) {
                Write-Host "  JAR: $($jar.Name)" -ForegroundColor Gray
            }
        } else {
            Write-Host "FAILED: $($service.Name)" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
    
    Write-Host ""
}

Write-Host "Build Complete!" -ForegroundColor Green
