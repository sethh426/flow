# Install Java and Maven for AffiliateFlow

Write-Host "=== Installing Java 17 and Maven ===" -ForegroundColor Cyan
Write-Host ""

# Create tools directory
$toolsDir = "$env:USERPROFILE\tools"
if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
    Write-Host "Created tools directory: $toolsDir" -ForegroundColor Green
}

# Java Installation
Write-Host "Installing Java 17 (Eclipse Temurin)..." -ForegroundColor Cyan

$javaUrl = "https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.zip"
$javaZip = "$toolsDir\openjdk-17.zip"
$javaDir = "$toolsDir\jdk-17"

if (Test-Path $javaDir) {
    Write-Host "Java already installed at: $javaDir" -ForegroundColor Yellow
} else {
    Write-Host "Downloading Java 17..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $javaUrl -OutFile $javaZip -UseBasicParsing
        Write-Host "Extracting Java..." -ForegroundColor Yellow
        Expand-Archive -Path $javaZip -DestinationPath $toolsDir -Force
        
        # Rename extracted folder
        $extractedFolder = Get-ChildItem -Path $toolsDir -Filter "jdk-17*" -Directory | Select-Object -First 1
        if ($extractedFolder) {
            Rename-Item -Path $extractedFolder.FullName -NewName "jdk-17" -Force
        }
        
        Remove-Item $javaZip -Force
        Write-Host "Java installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error downloading Java: $_" -ForegroundColor Red
        Write-Host "Please download manually from: https://adoptium.net/temurin/releases/" -ForegroundColor Yellow
    }
}

# Maven Installation
Write-Host ""
Write-Host "Installing Maven..." -ForegroundColor Cyan

$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.zip"
$mavenZip = "$toolsDir\maven.zip"
$mavenDir = "$toolsDir\maven"

if (Test-Path $mavenDir) {
    Write-Host "Maven already installed at: $mavenDir" -ForegroundColor Yellow
} else {
    Write-Host "Downloading Maven..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip -UseBasicParsing
        Write-Host "Extracting Maven..." -ForegroundColor Yellow
        Expand-Archive -Path $mavenZip -DestinationPath $toolsDir -Force
        
        # Rename extracted folder
        $extractedFolder = Get-ChildItem -Path $toolsDir -Filter "apache-maven-*" -Directory | Select-Object -First 1
        if ($extractedFolder) {
            Rename-Item -Path $extractedFolder.FullName -NewName "maven" -Force
        }
        
        Remove-Item $mavenZip -Force
        Write-Host "Maven installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error downloading Maven: $_" -ForegroundColor Red
        Write-Host "Please download manually from: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
    }
}

# Set Environment Variables for Current Session
Write-Host ""
Write-Host "Setting up environment variables..." -ForegroundColor Cyan

$env:JAVA_HOME = "$toolsDir\jdk-17"
$env:M2_HOME = "$toolsDir\maven"
$env:MAVEN_HOME = "$toolsDir\maven"
$env:PATH = "$toolsDir\jdk-17\bin;$toolsDir\maven\bin;$env:PATH"

Write-Host "JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "MAVEN_HOME = $env:MAVEN_HOME" -ForegroundColor Gray

# Add to User PATH permanently
Write-Host ""
Write-Host "Adding to permanent PATH..." -ForegroundColor Cyan

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathsToAdd = @(
    "$toolsDir\jdk-17\bin",
    "$toolsDir\maven\bin"
)

foreach ($pathToAdd in $pathsToAdd) {
    if ($userPath -notlike "*$pathToAdd*") {
        $userPath = "$pathToAdd;$userPath"
    }
}

[Environment]::SetEnvironmentVariable("Path", $userPath, "User")
[Environment]::SetEnvironmentVariable("JAVA_HOME", "$toolsDir\jdk-17", "User")
[Environment]::SetEnvironmentVariable("MAVEN_HOME", "$toolsDir\maven", "User")

Write-Host "Environment variables set!" -ForegroundColor Green

# Verify Installation
Write-Host ""
Write-Host "=== Verifying Installation ===" -ForegroundColor Cyan

try {
    $javaVersion = & "$toolsDir\jdk-17\bin\java.exe" -version 2>&1
    Write-Host "Java Version:" -ForegroundColor Green
    Write-Host $javaVersion[0] -ForegroundColor Gray
} catch {
    Write-Host "Java verification failed" -ForegroundColor Red
}

try {
    $mavenVersion = & "$toolsDir\maven\bin\mvn.cmd" -version 2>&1 | Select-Object -First 1
    Write-Host "Maven Version:" -ForegroundColor Green
    Write-Host $mavenVersion -ForegroundColor Gray
} catch {
    Write-Host "Maven verification failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Close this terminal and open a new one to use Java and Maven" -ForegroundColor Yellow
Write-Host "Or run these commands in this session:" -ForegroundColor Yellow
Write-Host "  `$env:PATH = `"$toolsDir\jdk-17\bin;$toolsDir\maven\bin;`$env:PATH`"" -ForegroundColor Gray
Write-Host ""
Write-Host "Then run: .\build-java-services.ps1" -ForegroundColor Cyan
