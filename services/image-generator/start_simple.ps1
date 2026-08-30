# Image Generator Service - Simple Starter
# Quick script to start the Python Image Generator service

Write-Host "Starting Image Generator Service..." -ForegroundColor Cyan

# Move to script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Copy API key from root if .env doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $rootEnv = "..\..\.env"
    if (Test-Path $rootEnv) {
        $apiKey = Get-Content $rootEnv | Select-String "^GEMINI_API_KEY=" | Select-Object -First 1
        if ($apiKey) {
            $apiKey | Out-File ".env" -Encoding UTF8
            Write-Host ".env created" -ForegroundColor Green
        } else {
            Write-Host "ERROR: No GEMINI_API_KEY found in root .env" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "ERROR: Root .env not found" -ForegroundColor Red
        exit 1
    }
}

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate venv
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt

# Create output directory
if (-not (Test-Path "generated_images")) {
    New-Item -ItemType Directory -Path "generated_images" | Out-Null
}

# Start the service
Write-Host ""
Write-Host "Starting API on http://localhost:5001" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:5001/health" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$env:FLASK_APP = "api.py"
python api.py
