# Full Deployment Script for AffiliateFlow

Write-Host "🚀 Starting Full AffiliateFlow Deployment..." -ForegroundColor Green

# 1. Install MCP Server Dependencies
Write-Host "`n📦 Installing MCP Server dependencies..." -ForegroundColor Yellow
cd mcp-firebase-server
npm install
cd ..

# 2. Install Function Dependencies  
Write-Host "`n📦 Installing Cloud Functions dependencies..." -ForegroundColor Yellow
cd functions
npm install
cd ..

# 3. Deploy Everything to Firebase
Write-Host "`n☁️  Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "`nYour endpoints:" -ForegroundColor Cyan
Write-Host "  API: https://us-central1-flow-69826693-f6d27.cloudfunctions.net/api"
Write-Host "  Analytics: https://us-central1-flow-69826693-f6d27.cloudfunctions.net/getAnalytics"
Write-Host "  Webhook: https://us-central1-flow-69826693-f6d27.cloudfunctions.net/webhookProductImport"
Write-Host "  Studio App: https://studio.firebase.google.com/flow-69826693"
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Set GEMINI_API_KEY in Firebase Functions config"
Write-Host "  2. Set WEBHOOK_API_KEY in Firebase Functions config"
Write-Host "  3. Configure Cloud Scheduler for scheduledProductScraper"
Write-Host "  4. Add MCP server to Claude Desktop settings"
