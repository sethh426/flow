# Maven Setup and Java Integration for AffiliateFlow
# Checks for Maven, helps install if missing, and sets up Java services

Write-Host "☕ AffiliateFlow - Java/Maven Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check for Java
Write-Host "1. Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "   ✓ Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Java not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please install Java JDK 17 or higher:" -ForegroundColor Yellow
    Write-Host "   https://adoptium.net/" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Check for Maven
Write-Host ""
Write-Host "2. Checking Maven installation..." -ForegroundColor Yellow
try {
    $mvnVersion = mvn --version 2>&1 | Select-String "Apache Maven" | Select-Object -First 1
    Write-Host "   ✓ Maven found: $mvnVersion" -ForegroundColor Green
    $mavenInstalled = $true
} catch {
    Write-Host "   ❌ Maven not found in PATH" -ForegroundColor Red
    $mavenInstalled = $false
}

if (-not $mavenInstalled) {
    Write-Host ""
    Write-Host "   Maven Installation Options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Option 1 - Using Chocolatey (Recommended):" -ForegroundColor Yellow
    Write-Host "   choco install maven" -ForegroundColor White
    Write-Host ""
    Write-Host "   Option 2 - Manual Download:" -ForegroundColor Yellow
    Write-Host "   1. Download from https://maven.apache.org/download.cgi" -ForegroundColor White
    Write-Host "   2. Extract to C:\Program Files\Apache\maven" -ForegroundColor White
    Write-Host "   3. Add to PATH: C:\Program Files\Apache\maven\bin" -ForegroundColor White
    Write-Host ""
    Write-Host "   Option 3 - Using Scoop:" -ForegroundColor Yellow
    Write-Host "   scoop install maven" -ForegroundColor White
    Write-Host ""
    
    $install = Read-Host "Would you like to install Maven using Chocolatey now? (y/n)"
    if ($install -eq "y") {
        # Check for Chocolatey
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Host ""
            Write-Host "   Installing Maven via Chocolatey..." -ForegroundColor Yellow
            choco install maven -y
            
            Write-Host ""
            Write-Host "   ✓ Maven installed! Please restart PowerShell and run this script again." -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "   ❌ Chocolatey not found. Installing Chocolatey first..." -ForegroundColor Yellow
            Write-Host ""
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
            
            Write-Host ""
            Write-Host "   ✓ Chocolatey installed!" -ForegroundColor Green
            Write-Host "   Now installing Maven..." -ForegroundColor Yellow
            choco install maven -y
            
            Write-Host ""
            Write-Host "   ✓ Maven installed! Please restart PowerShell and run this script again." -ForegroundColor Green
        }
        exit 0
    } else {
        Write-Host ""
        Write-Host "   Please install Maven manually and run this script again." -ForegroundColor Yellow
        exit 1
    }
}

# Maven is installed, proceed with setup
Write-Host ""
Write-Host "3. Creating Java services directory..." -ForegroundColor Yellow
$javaServicesPath = "services/java"
if (-not (Test-Path $javaServicesPath)) {
    New-Item -ItemType Directory -Path $javaServicesPath -Force | Out-Null
    Write-Host "   ✓ Created $javaServicesPath" -ForegroundColor Green
} else {
    Write-Host "   ✓ Directory exists: $javaServicesPath" -ForegroundColor Green
}

# Create Maven parent POM
Write-Host ""
Write-Host "4. Creating Maven parent POM..." -ForegroundColor Yellow
$parentPom = @'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.affiliateflow</groupId>
    <artifactId>affiliateflow-java-parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <name>AffiliateFlow Java Services</name>
    <description>Java-based microservices for AffiliateFlow platform</description>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.boot.version>3.2.0</spring.boot.version>
    </properties>

    <modules>
        <!-- Modules will be added here -->
    </modules>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot Dependencies -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <version>${spring.boot.version}</version>
                </plugin>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.11.0</version>
                    <configuration>
                        <source>${java.version}</source>
                        <target>${java.version}</target>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
</project>
'@

Set-Content -Path "$javaServicesPath/pom.xml" -Value $parentPom
Write-Host "   ✓ Created parent POM" -ForegroundColor Green

Write-Host ""
Write-Host "5. Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Create Java services: .\scripts\setup\create-java-service.ps1" -ForegroundColor Gray
Write-Host "  2. Build all services: cd services/java && mvn clean install" -ForegroundColor Gray
Write-Host "  3. Run tests: mvn test" -ForegroundColor Gray
Write-Host ""
Write-Host "Available templates:" -ForegroundColor Cyan
Write-Host "  - Spring Boot REST API" -ForegroundColor Gray
Write-Host "  - Data Processor Service" -ForegroundColor Gray
Write-Host "  - Selenium Test Suite" -ForegroundColor Gray
Write-Host ""
