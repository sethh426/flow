# 🚀 30-Minute Setup Script
# This will get your ENTIRE app working!

Write-Host "`n🎯 AFFILIATE FLOW - COMPLETE SETUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Step 1: Create .env.local
Write-Host "📝 Step 1: Creating .env.local file..." -ForegroundColor Yellow

$envContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=REDACTED_GOOGLE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flow-69826693-f6d27.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flow-69826693-f6d27
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flow-69826693-f6d27.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Gemini AI (Optional - for AI features)
NEXT_PUBLIC_GEMINI_API_KEY=

# Social Media OAuth (Add when you get credentials)
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TIKTOK_CLIENT_ID=
TIKTOK_CLIENT_SECRET=
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=
"@

Set-Content -Path "client\.env.local" -Value $envContent
Write-Host "   ✅ Created client/.env.local" -ForegroundColor Green

# Step 2: Instructions
Write-Host "`n🔥 Step 2: Enable Firebase Authentication" -ForegroundColor Yellow
Write-Host "   1. Open: https://console.firebase.google.com/project/flow-69826693-f6d27/authentication" -ForegroundColor White
Write-Host "   2. Click 'Get Started' if needed" -ForegroundColor White
Write-Host "   3. Click 'Sign-in method' tab" -ForegroundColor White
Write-Host "   4. Enable 'Email/Password' (toggle on + save)" -ForegroundColor White
Write-Host "   5. Enable 'Google' (toggle on + save)" -ForegroundColor White
Write-Host "`n   Press ANY KEY after you've enabled auth..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 3: Clean and start
Write-Host "`n🧹 Step 3: Cleaning and starting dev server..." -ForegroundColor Yellow

Set-Location client

# Kill any existing Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "   ✅ Cleaned up old processes" -ForegroundColor Green

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "   📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start dev server
Write-Host "`n🚀 Starting Next.js dev server..." -ForegroundColor Yellow
Write-Host "   Server will start at: http://localhost:3000" -ForegroundColor Green
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n📋 TESTING CHECKLIST:" -ForegroundColor Cyan
Write-Host "   1. Signup: http://localhost:3000/signup" -ForegroundColor White
Write-Host "   2. Login: http://localhost:3000/login" -ForegroundColor White
Write-Host "   3. Dashboard: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host "   4. Social Media: http://localhost:3000/social-media" -ForegroundColor White
Write-Host "   5. Analytics: http://localhost:3000/analytics" -ForegroundColor White
Write-Host "   6. Campaigns: http://localhost:3000/campaigns" -ForegroundColor White
Write-Host "   7. Products: http://localhost:3000/products" -ForegroundColor White
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

npm run dev
