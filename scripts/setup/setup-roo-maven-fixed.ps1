# Spring Roo + Maven integration for the recovered Flow Java services.

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$javaServicesDirectory = Join-Path $projectRoot 'services\java'
$serviceNames = @(
    'analytics-service',
    'data-processing-service',
    'integration-service'
)

Write-Host 'Checking Java and Maven prerequisites for Flow...' -ForegroundColor Cyan
$mavenCommand = Get-Command mvn -ErrorAction Stop
$javaCommand = Get-Command java -ErrorAction Stop
Write-Host "Maven: $($mavenCommand.Source)" -ForegroundColor Green
Write-Host "Java: $($javaCommand.Source)" -ForegroundColor Green

New-Item -ItemType Directory -Force -Path $javaServicesDirectory | Out-Null
$originalLocation = Get-Location

try {
    Set-Location -LiteralPath $javaServicesDirectory

    foreach ($serviceName in $serviceNames) {
        if (Test-Path -LiteralPath $serviceName) {
            Write-Host "$serviceName already exists; leaving it unchanged." -ForegroundColor Yellow
            continue
        }

        Write-Host "Creating $serviceName..." -ForegroundColor Cyan
        & $mavenCommand.Source archetype:generate `
            '-DgroupId=com.affiliateflow' `
            "-DartifactId=$serviceName" `
            '-DarchetypeArtifactId=maven-archetype-quickstart' `
            '-DarchetypeVersion=1.4' `
            '-DinteractiveMode=false'

        if ($LASTEXITCODE -ne 0) {
            throw "Maven failed while creating $serviceName."
        }
    }
} finally {
    Set-Location -LiteralPath $originalLocation
}

Write-Host 'Java service structure is ready under services/java.' -ForegroundColor Green
