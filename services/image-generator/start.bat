@echo off
REM Image Generator Service Starter
cd /d "%~dp0"

echo Starting Image Generator Service...
echo.

REM Copy .env if needed
if not exist ".env" (
    echo Creating .env file...
    copy "..\..\.env" ".env" >nul 2>&1
)

REM Activate venv if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Install dependencies if needed
pip install -q -r requirements.txt >nul 2>&1

REM Start the service
echo.
echo Service starting on http://localhost:5001
echo Health check: http://localhost:5001/health
echo Press Ctrl+C to stop
echo.

python api.py
