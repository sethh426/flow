# PowerShell script to install dependencies and start both services in new windows

# Start trend-finder
Start-Process powershell -ArgumentList 'cd services\trend-finder; npm install; npm start'

# Start product-mapper
Start-Process powershell -ArgumentList 'cd services\product-mapper; npm install; npm start'

Write-Host "Both services are starting in new PowerShell windows."
