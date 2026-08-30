# Spring Roo + Maven Integration for AffiliateFlow
# Creates Java microservices with Spring Boot

Write-Host "🦘 Setting up Spring Roo + Maven for AffiliateFlow..." -ForegroundColor Cyan
Write-Host ""

$PROJECT_ROOT = "C:\Users\sethp\Downloads\Affiliate-Flow-Prototype"
$JAVA_SERVICES_DIR = "$PROJECT_ROOT\services\java"

# Create Java services directory
Write-Host "📁 Creating Java services directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $JAVA_SERVICES_DIR | Out-Null

# Check if Maven is in PATH
Write-Host "🔍 Checking Maven installation..." -ForegroundColor Yellow
try {
    $mvnCheck = Get-Command mvn -ErrorAction Stop
    Write-Host "✓ Maven is installed at: $($mvnCheck.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ Maven not found in PATH" -ForegroundColor Red
    Write-Host "Please install Maven:" -ForegroundColor Yellow
    Write-Host "  choco install maven" -ForegroundColor White
    Write-Host "  OR download from: https://maven.apache.org/download.cgi" -ForegroundColor White
    exit 1
}

# Check if Java is installed
Write-Host ""
Write-Host "☕ Checking Java installation..." -ForegroundColor Yellow
try {
    $javaCheck = Get-Command java -ErrorAction Stop
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✓ Java is installed: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found" -ForegroundColor Red
    Write-Host "Install with: choco install openjdk17" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Prerequisites satisfied!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Creating Spring Boot microservices..." -ForegroundColor Cyan
Write-Host ""

# Change to Java services directory
Set-Location $JAVA_SERVICES_DIR

# Service 1: Analytics Service
Write-Host "📊 Creating Analytics Service..." -ForegroundColor Yellow
if (-not (Test-Path "analytics-service")) {
    mvn archetype:generate -DgroupId=com.affiliateflow -DartifactId=analytics-service -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.4 -DinteractiveMode=false
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Analytics Service created" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Analytics Service already exists" -ForegroundColor Yellow
}

# Service 2: Data Processing Service
Write-Host ""
Write-Host "⚙️  Creating Data Processing Service..." -ForegroundColor Yellow
if (-not (Test-Path "data-processing-service")) {
    mvn archetype:generate -DgroupId=com.affiliateflow -DartifactId=data-processing-service -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.4 -DinteractiveMode=false
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Data Processing Service created" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Data Processing Service already exists" -ForegroundColor Yellow
}

# Service 3: Integration Service
Write-Host ""
Write-Host "🔗 Creating Integration Service..." -ForegroundColor Yellow
if (-not (Test-Path "integration-service")) {
    mvn archetype:generate -DgroupId=com.affiliateflow -DartifactId=integration-service -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.4 -DinteractiveMode=false
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Integration Service created" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Integration Service already exists" -ForegroundColor Yellow
}

Set-Location $PROJECT_ROOT

Write-Host ""
Write-Host "✅ Java microservices structure created!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Structure:" -ForegroundColor Cyan
Write-Host "services/java/" -ForegroundColor White
Write-Host "  - analytics-service/       (Data analytics and reporting)" -ForegroundColor Gray
Write-Host "  - data-processing-service/ (ETL and batch processing)" -ForegroundColor Gray
Write-Host "  - integration-service/     (External system integrations)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update pom.xml files with Spring Boot dependencies" -ForegroundColor Gray
Write-Host "2. Add Spring Roo shell scripts" -ForegroundColor Gray
Write-Host "3. Generate entities and repositories with Roo" -ForegroundColor Gray
Write-Host "4. Build and run services" -ForegroundColor Gray
Write-Host ""
