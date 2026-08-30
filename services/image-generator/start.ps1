# Image Generator Service - Setup and Start Script
# This script sets up and starts the Python Image Generator service

Write-Host "Image Generator Service - Setup & Start" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Step 1: Check if .env exists, if not copy from root
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    # Try to get GEMINI_API_KEY from root .env
    $rootEnv = "..\..\.env"
    if (Test-Path $rootEnv) {
        $apiKey = Get-Content $rootEnv | Where-Object { $_ -match "^GEMINI_API_KEY=" } | Select-Object -First 1
        if ($apiKey) {
            Set-Content -Path ".env" -Value $apiKey
            Write-Host ".env file created with API key from root" -ForegroundColor Green
        } else {
            Copy-Item ".env.example" ".env"
            Write-Host "Please edit .env and add your GEMINI_API_KEY" -ForegroundColor Yellow
            Write-Host "Get your key from: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Copy-Item ".env.example" ".env"
        Write-Host "Please edit .env and add your GEMINI_API_KEY" -ForegroundColor Yellow
        Write-Host "Get your key from: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ".env file exists" -ForegroundColor Green
}

# Step 2: Check Python installation
Write-Host ""
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Please install Python 3.9+ from python.org" -ForegroundColor Red
    exit 1
}

# Step 3: Check if virtual environment exists
Write-Host ""
Write-Host "📦 Setting up virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment exists" -ForegroundColor Green
}

# Step 4: Activate virtual environment and install dependencies
Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow

# Activate venv and install packages
& .\venv\Scripts\Activate.ps1

# Check if packages are installed
$packagesInstalled = $false
try {
    python -c "import flask; import google.genai" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $packagesInstalled = $true
        Write-Host "✅ Dependencies already installed" -ForegroundColor Green
    }
} catch {
    $packagesInstalled = $false
}

if (-not $packagesInstalled) {
    Write-Host "Installing from requirements.txt..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Step 5: Create generated_images directory
Write-Host ""
Write-Host "📁 Creating output directory..." -ForegroundColor Yellow
if (-not (Test-Path "generated_images")) {
    New-Item -ItemType Directory -Path "generated_images" | Out-Null
    Write-Host "✅ created generated_images directory" -ForegroundColor Green
} else {
    Write-Host "✅ generated_images directory exists" -ForegroundColor Green
}

# Step 6: Test imports
Write-Host ""
Write-Host "🧪 Testing imports..." -ForegroundColor Yellow
$testResult = python -c @"
import sys
try:
    from google import genai
    from google.genai import types
    from flask import Flask
    from flask_cors import CORS
    print('SUCCESS')
except ImportError as e:
    print(f'ERROR: {e}')
    sys.exit(1)
"@

if ($testResult -eq "SUCCESS") {
    Write-Host "✅ All imports working correctly" -ForegroundColor Green
} else {
    Write-Host "❌ Import error: $testResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Attempting to fix..." -ForegroundColor Yellow
    pip install --upgrade google-genai flask flask-cors
    exit 1
}

# Step 7: Start the service
Write-Host ""
Write-Host "🚀 Starting Image Generator API on port 5001..." -ForegroundColor Cyan
Write-Host "   - Health check: http://localhost:5001/health" -ForegroundColor Gray
Write-Host "   - Generate image: POST http://localhost:5001/api/generate-image" -ForegroundColor Gray
Write-Host "   - Edit image: POST http://localhost:5001/api/edit-image" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Set Flask environment variables
$env:FLASK_APP = "api.py"
$env:FLASK_ENV = "development"

# Start the Flask app
python api.py
