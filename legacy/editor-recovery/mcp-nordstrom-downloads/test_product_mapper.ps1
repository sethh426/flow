param(
    [string]$AffiliateUrl = "https://www.nordstrom.com/sr?keyword=shoes",
    [string]$Query = "shoes",
    [int]$Port = 8081
)

# Wait for the service to be up
$maxAttempts = 10
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
    exit 1
}

# Run the actual test and print the result
Write-Host "Testing /map endpoint on port $Port..."
$result = Invoke-RestMethod -Uri "http://localhost:$Port/map" -Method Post -ContentType "application/json" -Body "{`"affiliateUrl`":`"$AffiliateUrl`",`"query`":`"$Query`"}"
Write-Host "Response:"
$result | ConvertTo-Json -Depth 5
