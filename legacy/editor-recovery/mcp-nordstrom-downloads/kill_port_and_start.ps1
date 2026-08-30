# PowerShell script to kill any process on a given port and start a Node.js service

param(
    [int]$Port = 8080,
    [string]$ServicePath = "services/trend-finder",
    [string]$NodeScript = "index.js",
    [string]$ServiceAccountKey = "C:\Users\sethp\Downloads\mcp-nordstrom\serviceAccountKey.json"
)

# Kill any process using the port
$tcpConn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
if ($tcpConn) {
    $procId = $tcpConn.OwningProcess
    Write-Host "Killing process $procId using port $Port..."
    Stop-Process -Id $procId -Force
    Start-Sleep -Seconds 2
}

# Set environment variable for Firestore credentials
$env:GOOGLE_APPLICATION_CREDENTIALS = $ServiceAccountKey

# Start the service
Write-Host "Starting Node.js service in $ServicePath on port $Port..."
Set-Location $ServicePath
$env:PORT = $Port
npm start
