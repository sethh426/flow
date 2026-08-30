# This script automates the full workflow: start, wait, and test product-mapper

param(
    [int]$Port = 8081,
    [string]$ServicePath = "services/product-mapper",
    [string]$AffiliateUrl = "https://www.nordstrom.com/sr?keyword=shoes",
    [string]$Query = "shoes"
)

# Remove old error log
$errorLog = Join-Path $ServicePath "product-mapper-error.log"
if (Test-Path $errorLog) { Remove-Item $errorLog }

# Start the service in the background
Write-Host "Starting product-mapper service on port $Port..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\\start_product_mapper.ps1 -Port $Port -ServicePath '$ServicePath'" | Out-Null

# Wait for the service to be up
$maxAttempts = 15
$attempt = 0
$serviceUp = $false
while ($attempt -lt $maxAttempts -and -not $serviceUp) {
    try {
        Invoke-RestMethod -Uri "http://localhost:$Port/map" -Method Post -ContentType "application/json" -Body "{`"affiliateUrl`":`"$AffiliateUrl`",`"query`":`"$Query`"}" -TimeoutSec 3 | Out-Null
        $serviceUp = $true
    } catch {
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if (-not $serviceUp) {
    Write-Host "Service did not start on port $Port after $($maxAttempts*2) seconds."
    if (Test-Path $errorLog) {
        Write-Host "--- product-mapper-error.log ---"
        Get-Content $errorLog -Tail 40
    }
    exit 1
}

# Run the actual test and print the result
Write-Host "Testing /map endpoint on port $Port..."
try {
    $result = Invoke-RestMethod -Uri "http://localhost:$Port/map" -Method Post -ContentType "application/json" -Body "{`"affiliateUrl`":`"$AffiliateUrl`",`"query`":`"$Query`"}"
    Write-Host "Response:"
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Request failed."
    if (Test-Path $errorLog) {
        Write-Host "--- product-mapper-error.log ---"
        Get-Content $errorLog -Tail 40
    }
    exit 1
}
