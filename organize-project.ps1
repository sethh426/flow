# AffiliateFlow Project Organization Script
Write-Host "Starting Project Organization..." -ForegroundColor Cyan

# Create directories
$dirs = @("docs/guides", "docs/architecture", "docs/status", "config", "scripts/deployment", "scripts/testing", "scripts/setup", "scripts/monitoring", "scripts/utils")
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
    Write-Host "Created $d" -ForegroundColor Green
}

# Move architecture docs
Write-Host "`nOrganizing documentation..." -ForegroundColor Yellow
$archDocs = @("AFFILIATE_FLOW_ARCHITECTURE.md", "TECHNICAL_ARCHITECTURE.md", "VERTEX_AI_GKE_ARCHITECTURE.md")
foreach ($doc in $archDocs) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "docs/architecture/" -Force
        Write-Host "Moved $doc" -ForegroundColor Green
    }
}

# Move guide docs
$guideDocs = @("SETUP_GUIDE.md", "DEPLOYMENT_GUIDE.md", "TESTING_GUIDE.md", "LOCAL_DEV_GUIDE.md", "QUICK_START.md", "QUICK_REFERENCE.md")
foreach ($doc in $guideDocs) {
    if (Test-Path $doc) {
        Move-Item -Path $doc -Destination "docs/guides/" -Force
        Write-Host "Moved $doc" -ForegroundColor Green
    }
}

# Move status/summary docs
Get-ChildItem -Filter "*STATUS*.md" | Move-Item -Destination "docs/status/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "*SUMMARY*.md" | Move-Item -Destination "docs/status/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "*COMPLETE*.md" | Move-Item -Destination "docs/status/" -Force -ErrorAction SilentlyContinue

# Move remaining .md files to docs
Get-ChildItem -Filter "*.md" -Exclude "README.md" | Move-Item -Destination "docs/" -Force -ErrorAction SilentlyContinue

# Move scripts
Write-Host "`nOrganizing scripts..." -ForegroundColor Yellow
Get-ChildItem -Filter "deploy*.ps1" | Move-Item -Destination "scripts/deployment/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "test*.ps1" | Move-Item -Destination "scripts/testing/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "setup*.ps1" | Move-Item -Destination "scripts/setup/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "*monitor*.ps1" | Move-Item -Destination "scripts/monitoring/" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "*check*.ps1" | Move-Item -Destination "scripts/monitoring/" -Force -ErrorAction SilentlyContinue

# Move utility JS files
$utilJs = @("scrape.js", "seed-*.js", "check-*.js", "create-*.js", "fix-*.js", "migrate-*.js", "inspect-*.js", "open*.js")
foreach ($pattern in $utilJs) {
    Get-ChildItem -Filter $pattern -ErrorAction SilentlyContinue | Move-Item -Destination "scripts/utils/" -Force -ErrorAction SilentlyContinue
}

# Move Python scripts
Get-ChildItem -Filter "*.py" | Move-Item -Destination "scripts/utils/" -Force -ErrorAction SilentlyContinue

# Move config files
Write-Host "`nOrganizing config files..." -ForegroundColor Yellow
$configs = @("firebase.json", "firestore.indexes.json", "firestore.rules", "firestore-enhanced.*")
foreach ($cfg in $configs) {
    Get-ChildItem -Filter $cfg -ErrorAction SilentlyContinue | Move-Item -Destination "config/" -Force -ErrorAction SilentlyContinue
}

# Clean up logs
Get-ChildItem -Filter "*-debug.log" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "*-error.log" | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "`nProject organization complete!" -ForegroundColor Green
Write-Host "Review the new structure and update any hardcoded paths" -ForegroundColor Yellow
