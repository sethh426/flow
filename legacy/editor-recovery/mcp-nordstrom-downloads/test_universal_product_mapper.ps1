# Universal product-mapper automation script
param(
    [string]$AffiliateUrl = "https://www.nordstrom.com/sr?keyword=shoes",
    [string]$Query = "shoes",
    [int]$Port = 8081,
    [string]$UserId = "user123",
    [float]$MatchThreshold = 0.5,
    [string]$SelectorsJson = ""
)

# Build selectors object if provided
$selectors = $null
if ($SelectorsJson -ne "") {
    $selectors = $SelectorsJson | ConvertFrom-Json
}

# Build request body
$body = @{ affiliateUrl = $AffiliateUrl; query = $Query; userId = $UserId; matchThreshold = $MatchThreshold }
if ($selectors) { $body.selectors = $selectors }

# Convert to JSON
$jsonBody = $body | ConvertTo-Json -Depth 5

# Wait for the service to be up
$maxAttempts = 15
$attempt = 0
$serviceUp = $false
while ($attempt -lt $maxAttempts -and -not $serviceUp) {
    try {
        Invoke-RestMethod -Uri "http://localhost:$Port/map" -Method Post -ContentType "application/json" -Body $jsonBody -TimeoutSec 3 | Out-Null
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
try {
    $result = Invoke-RestMethod -Uri "http://localhost:$Port/map" -Method Post -ContentType "application/json" -Body $jsonBody
    Write-Host "Response:"
    $result | ConvertTo-Json -Depth 8
} catch {
    Write-Host "Request failed."
    exit 1
}
