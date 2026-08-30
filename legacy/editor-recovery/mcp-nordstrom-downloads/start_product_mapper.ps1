
param(
    [int]$Port = 8081,
    [string]$ServicePath = "services/product-mapper"
)

# Kill any process using the specified port
Write-Host "Killing any process using port $Port..."
$pids = netstat -ano | Select-String ":$Port" | ForEach-Object { $_.ToString().Split()[-1] } | Select-Object -Unique
if ($pids) {
    foreach ($proc in $pids) {
        try {
            Stop-Process -Id $proc -Force -ErrorAction Stop
            Write-Host "Killed process $proc on port $Port."
        } catch {
            Write-Host ("Could not kill process {0}: {1}" -f $proc, $_)
        }
    }
} else {
    Write-Host "No process found on port $Port."
}

# Install dependencies if needed
Write-Host "Ensuring dependencies are installed in $ServicePath..."
Push-Location $ServicePath
if (!(Test-Path "node_modules")) {
    npm install
}
# Ensure Playwright browsers are installed
npx playwright install
Pop-Location

# Start the service on the specified port
Write-Host "Starting service in $ServicePath on port $Port..."
$env:PORT = $Port
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $ServicePath; $env:PORT=$Port; node index.js"
