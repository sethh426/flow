# Install and Configure Java 21 (Latest LTS)
# Run this script to upgrade from Java 17 to Java 21

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Java 21 Installation Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

Write-Host "Step 1: Installing Microsoft Build of OpenJDK 21..." -ForegroundColor Green
Write-Host "This is the latest Long-Term Support (LTS) version of Java" -ForegroundColor Yellow
Write-Host ""

try {
    # Install JDK 21 using winget
    winget install Microsoft.OpenJDK.21 --silent --accept-source-agreements --accept-package-agreements
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ JDK 21 installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Installation may have issues. Exit code: $LASTEXITCODE" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error installing JDK 21: $_" -ForegroundColor Red
    Write-Host "Please install manually from: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Locating JDK 21 installation..." -ForegroundColor Green

# Search for JDK 21 installation
$possiblePaths = @(
    "C:\Program Files\Microsoft",
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Java"
)

$jdk21Path = $null
foreach ($basePath in $possiblePaths) {
    if (Test-Path $basePath) {
        $found = Get-ChildItem $basePath -Filter "jdk-21*" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $jdk21Path = $found.FullName
            break
        }
    }
}

if (-not $jdk21Path) {
    Write-Host "✗ Could not find JDK 21 installation." -ForegroundColor Red
    Write-Host "Please check the installation manually." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found JDK 21 at: $jdk21Path" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Configuring environment variables..." -ForegroundColor Green

# Set JAVA_HOME for current session
$env:JAVA_HOME = $jdk21Path
$env:PATH = "$jdk21Path\bin;$env:PATH"

Write-Host "✓ JAVA_HOME set for current session: $env:JAVA_HOME" -ForegroundColor Green

# Try to set permanently if running as admin
if ($isAdmin) {
    Write-Host "✓ Running as Administrator - setting permanent environment variables..." -ForegroundColor Green
    
    try {
        [System.Environment]::SetEnvironmentVariable('JAVA_HOME', $jdk21Path, [System.EnvironmentVariableTarget]::Machine)
        
        # Update PATH to include new Java
        $machinePath = [System.Environment]::GetEnvironmentVariable('PATH', [System.EnvironmentVariableTarget]::Machine)
        
        # Remove old Java paths
        $pathArray = $machinePath -split ';' | Where-Object { 
            $_ -notlike "*\jdk-*\bin" -and $_ -notlike "*\Java\*\bin" 
        }
        
        # Add new Java path at the beginning
        $newPath = @("$jdk21Path\bin") + $pathArray -join ';'
        [System.Environment]::SetEnvironmentVariable('PATH', $newPath, [System.EnvironmentVariableTarget]::Machine)
        
        Write-Host "✓ Environment variables set permanently!" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Could not set permanent variables: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Not running as Administrator - environment variables set for current session only" -ForegroundColor Yellow
    Write-Host "To set permanently, run PowerShell as Administrator and execute:" -ForegroundColor Cyan
    Write-Host "[System.Environment]::SetEnvironmentVariable('JAVA_HOME', '$jdk21Path', [System.EnvironmentVariableTarget]::Machine)" -ForegroundColor White
}

Write-Host ""
Write-Host "Step 4: Verifying installation..." -ForegroundColor Green
Write-Host ""

# Verify Java
Write-Host "Java Version:" -ForegroundColor Cyan
java -version
Write-Host ""

# Verify Maven
Write-Host "Maven Configuration:" -ForegroundColor Cyan
$mvnCheck = mvn -version 2>&1
if ($LASTEXITCODE -eq 0) {
    $mvnCheck
    Write-Host ""
    Write-Host "✓ Maven is correctly configured with Java 21!" -ForegroundColor Green
} else {
    Write-Host "⚠ Maven check failed. You may need to restart your terminal." -ForegroundColor Yellow
    Write-Host "Error: $mvnCheck" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✓ Java 21 (Latest LTS) installed" -ForegroundColor Green
Write-Host "✓ JAVA_HOME configured" -ForegroundColor Green
Write-Host "✓ PATH updated" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Close and reopen your terminal/IDE" -ForegroundColor White
Write-Host "2. Run: java -version (should show 21.x.x)" -ForegroundColor White
Write-Host "3. Build your services:" -ForegroundColor White
Write-Host "   cd services\java\analytics-service; mvn clean install" -ForegroundColor Gray
Write-Host "   cd services\java\data-processing-service; mvn clean install" -ForegroundColor Gray
Write-Host "   cd services\java\integration-service; mvn clean install" -ForegroundColor Gray
Write-Host ""

if (-not $isAdmin) {
    Write-Host "⚠ IMPORTANT: To make JAVA_HOME permanent, run PowerShell as Administrator and execute this script again." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Java 21 features you can now use:" -ForegroundColor Cyan
Write-Host "• Virtual Threads for better concurrency" -ForegroundColor White
Write-Host "• Pattern Matching enhancements" -ForegroundColor White
Write-Host "• Sequenced Collections" -ForegroundColor White
Write-Host "• Record Patterns" -ForegroundColor White
Write-Host "• Improved performance and security" -ForegroundColor White
Write-Host ""
Write-Host "✓ Setup complete!" -ForegroundColor Green
