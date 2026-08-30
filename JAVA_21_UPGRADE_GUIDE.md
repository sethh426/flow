# Java 21 Upgrade Guide

## Current Status
- **Current Java Installation**: JDK 17 (located at `C:\Program Files\Microsoft\jdk-17.0.16.8-hotspot`)
- **Project Configuration**: Already set to Java 21 in all pom.xml files
- **Issue**: Need to upgrade JDK installation to match project requirements

## What is Java 21?
Java 21 is the latest Long-Term Support (LTS) version released in September 2023. It includes:
- Virtual Threads (Project Loom) - lightweight concurrency
- Pattern Matching enhancements
- Sequenced Collections
- Record Patterns
- String Templates (Preview)
- Better performance and security

## Installation Steps

### Option 1: Using Microsoft Build of OpenJDK (Recommended)
```powershell
# Download and install Microsoft Build of OpenJDK 21
# Visit: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21

# Or use winget (Windows Package Manager)
winget install Microsoft.OpenJDK.21
```

### Option 2: Using Eclipse Temurin (AdoptiumJDK)
```powershell
# Using winget
winget install EclipseAdoptium.Temurin.21.JDK
```

### Option 3: Using Oracle JDK 21
```powershell
# Download from: https://www.oracle.com/java/technologies/downloads/#java21
# Run the installer
```

## Configuration Steps

### 1. Set JAVA_HOME Environment Variable
After installation, set JAVA_HOME (replace path with your actual installation):

```powershell
# For current session
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.x.x-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Set permanently (requires running as Administrator or through System Properties)
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Microsoft\jdk-21.x.x-hotspot', [System.EnvironmentVariableTarget]::Machine)
```

### 2. Verify Installation
```powershell
# Check Java version
java -version
# Should show: openjdk version "21.x.x"

# Check Maven can find Java
mvn -version
# Should show: Java version: 21.x.x

# Check JAVA_HOME
echo $env:JAVA_HOME
```

### 3. Build Your Services
Once Java 21 is installed and configured:

```powershell
# Navigate to each service and build
cd services\java\analytics-service
mvn clean install

cd ..\data-processing-service
mvn clean install

cd ..\integration-service
mvn clean install
```

## Current Project Configuration

All three Java services are already configured for Java 21:

### analytics-service/pom.xml
```xml
<properties>
    <java.version>21</java.version>
    <spring-roo.version>2.0.0.RELEASE</spring-roo.version>
</properties>
```

### data-processing-service/pom.xml
```xml
<properties>
    <java.version>21</java.version>
</properties>
```

### integration-service/pom.xml
```xml
<properties>
    <java.version>21</java.version>
</properties>
```

All services use **Spring Boot 3.3.5**, which fully supports Java 21.

## Benefits of Java 21 for Your Project

1. **Virtual Threads**: Better scalability for I/O-intensive operations in your integration and analytics services
2. **Performance**: ~10-15% better performance in many workloads
3. **Pattern Matching**: Cleaner code with enhanced switch expressions
4. **Security**: Latest security patches and improvements
5. **Long-term Support**: Supported until September 2028

## Quick Setup Script

Create and run this PowerShell script to automate the setup:

```powershell
# install-java21.ps1

Write-Host "Installing Microsoft Build of OpenJDK 21..." -ForegroundColor Green
winget install Microsoft.OpenJDK.21

Write-Host "`nFinding JDK 21 installation..." -ForegroundColor Green
$jdk21Path = Get-ChildItem "C:\Program Files\Microsoft" -Filter "jdk-21*" -Directory | Select-Object -First 1 -ExpandProperty FullName

if ($jdk21Path) {
    Write-Host "Found JDK 21 at: $jdk21Path" -ForegroundColor Green
    
    # Set for current session
    $env:JAVA_HOME = $jdk21Path
    $env:PATH = "$jdk21Path\bin;$env:PATH"
    
    Write-Host "`nJAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
    Write-Host "`nVerifying installation..." -ForegroundColor Yellow
    java -version
    
    Write-Host "`nTo set JAVA_HOME permanently, run PowerShell as Administrator and execute:" -ForegroundColor Cyan
    Write-Host "[System.Environment]::SetEnvironmentVariable('JAVA_HOME', '$jdk21Path', [System.EnvironmentVariableTarget]::Machine)" -ForegroundColor White
} else {
    Write-Host "JDK 21 not found. Please install it manually." -ForegroundColor Red
}
```

## Troubleshooting

### Issue: "JAVA_HOME is not defined correctly"
**Solution**: Ensure JAVA_HOME points to the JDK directory (not the bin folder)
```powershell
# Correct: C:\Program Files\Microsoft\jdk-21.0.x-hotspot
# Wrong: C:\Program Files\Microsoft\jdk-21.0.x-hotspot\bin
```

### Issue: Maven still uses old Java version
**Solution**: Restart your terminal/IDE after setting JAVA_HOME

### Issue: Multiple Java versions installed
**Solution**: Ensure PATH has the correct JDK first, or use Maven Toolchains to specify Java version per project

## Next Steps

1. ✅ Install JDK 21
2. ✅ Set JAVA_HOME
3. ✅ Verify with `java -version` and `mvn -version`
4. ✅ Build all services
5. ✅ Run tests to ensure compatibility
6. ✅ Update your CI/CD pipelines to use Java 21

Your project is already configured for Java 21 - you just need to install it!
