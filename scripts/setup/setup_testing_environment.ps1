# 🧪 Complete Testing Suite Setup Script
# Run from project root: .\setup_testing_environment.ps1

Write-Host "🚀 AffiliateFlow Testing Environment Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# Function to check command existence
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function to display step
function Write-Step($number, $message) {
    Write-Host ""
    Write-Host "📍 Step $number : $message" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
}

# Function to display success
function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

# Function to display error
function Write-Error2($message) {
    Write-Host "❌ $message" -ForegroundColor Red
    $script:ErrorCount++
}

# Function to display warning
function Write-Warning2($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
    $script:WarningCount++
}

# Function to display info
function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================
Write-Step 1 "Checking Prerequisites"

if (Test-Command node) {
    $nodeVersion = node --version
    Write-Success "Node.js installed: $nodeVersion"
} else {
    Write-Error2 "Node.js not found! Install from https://nodejs.org"
}

if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Success "npm installed: $npmVersion"
} else {
    Write-Error2 "npm not found!"
}

if (Test-Command git) {
    Write-Success "Git installed"
} else {
    Write-Warning2 "Git not found (optional)"
}

# Check for service account key
if (Test-Path "serviceAccountKey.json") {
    Write-Success "Service account key found"
} else {
    Write-Error2 "serviceAccountKey.json not found!"
    Write-Info "Download from Firebase Console > Project Settings > Service Accounts"
}

# ============================================================================
# STEP 2: Install Client Dependencies
# ============================================================================
Write-Step 2 "Installing Client Dependencies"

cd client

Write-Info "Installing missing packages..."
$packages = @(
    "stripe",
    "@stripe/stripe-js",
    "@google/generative-ai",
    "firebase-admin"
)

foreach ($package in $packages) {
    Write-Host "  Installing $package..." -ForegroundColor Gray
    npm install $package --legacy-peer-deps 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$package installed"
    } else {
        Write-Error2 "Failed to install $package"
    }
}

cd ..

# ============================================================================
# STEP 3: Install Service Dependencies
# ============================================================================
Write-Step 3 "Installing Service Dependencies"

# Vision Analyzer
if (Test-Path "services/vision-analyzer") {
    Write-Info "Installing vision-analyzer dependencies..."
    cd services/vision-analyzer
    if (Test-Path "package.json") {
        npm install --legacy-peer-deps 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "vision-analyzer dependencies installed"
        } else {
            Write-Error2 "Failed to install vision-analyzer dependencies"
        }
    }
    cd ../..
}

# Workflow Executor
if (Test-Path "services/workflow-executor") {
    Write-Info "Installing workflow-executor dependencies..."
    cd services/workflow-executor
    if (Test-Path "package.json") {
        npm install --legacy-peer-deps 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "workflow-executor dependencies installed"
        } else {
            Write-Warning2 "Failed to install workflow-executor dependencies"
        }
    }
    cd ../..
}

# Product Mapper
if (Test-Path "services/product-mapper") {
    Write-Info "Installing product-mapper dependencies..."
    cd services/product-mapper
    if (Test-Path "package.json") {
        npm install --legacy-peer-deps 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "product-mapper dependencies installed"
        } else {
            Write-Warning2 "Failed to install product-mapper dependencies"
        }
    }
    cd ../..
}

# ============================================================================
# STEP 4: Check Environment Configuration
# ============================================================================
Write-Step 4 "Checking Environment Configuration"

if (Test-Path "client/.env.local") {
    Write-Success "client/.env.local exists"
    
    # Check for required keys
    $envContent = Get-Content "client/.env.local" -Raw
    
    $requiredKeys = @(
        "NEXT_PUBLIC_GEMINI_API_KEY",
        "FIREBASE_PROJECT_ID"
    )
    
    foreach ($key in $requiredKeys) {
        if ($envContent -match $key) {
            Write-Success "$key configured"
        } else {
            Write-Warning2 "$key not found in .env.local"
        }
    }
    
} else {
    Write-Warning2 "client/.env.local not found"
    Write-Info "Creating template .env.local file..."
    
    $envTemplate = @"
# Firebase
FIREBASE_PROJECT_ID=affiliateflow-abzfy
FIREBASE_PRIVATE_KEY="get-from-serviceAccountKey.json"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@affiliateflow-abzfy.iam.gserviceaccount.com

# Gemini AI (REQUIRED)
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Service URLs (Local Development)
VISION_ANALYZER_URL=http://localhost:8083
WORKFLOW_EXECUTOR_URL=http://localhost:8082
PRODUCT_MAPPER_URL=http://localhost:8081

# Instagram OAuth (Optional - for testing Instagram features)
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
INSTAGRAM_ACCOUNT_ID=your_instagram_business_account_id

# Stripe (Optional - for testing payments)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxx

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
"@
    
    $envTemplate | Out-File -FilePath "client/.env.local" -Encoding UTF8
    Write-Success "Template .env.local created"
    Write-Warning2 "Please edit client/.env.local with your actual API keys!"
}

# ============================================================================
# STEP 5: Check Firebase Configuration
# ============================================================================
Write-Step 5 "Checking Firebase Configuration"

if (Test-Path "serviceAccountKey.json") {
    try {
        $serviceAccount = Get-Content "serviceAccountKey.json" | ConvertFrom-Json
        Write-Success "Service account key is valid JSON"
        Write-Info "Project ID: $($serviceAccount.project_id)"
        Write-Info "Client Email: $($serviceAccount.client_email)"
    } catch {
        Write-Error2 "Service account key is not valid JSON"
    }
} else {
    Write-Error2 "serviceAccountKey.json not found"
}

# Check for multiple service account files
$serviceAccountFiles = Get-ChildItem -Filter "serviceAccountKey*.json"
if ($serviceAccountFiles.Count -gt 1) {
    Write-Warning2 "Multiple service account files found:"
    foreach ($file in $serviceAccountFiles) {
        Write-Host "    - $($file.Name)" -ForegroundColor Gray
    }
    Write-Info "Consider consolidating to a single serviceAccountKey.json"
}

# ============================================================================
# STEP 6: Create Test Database
# ============================================================================
Write-Step 6 "Creating Test Data"

Write-Info "Creating test-data-seeder.js..."

$seederScript = @"
// Test Data Seeder for AffiliateFlow
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Create test user
    const testUser = {
      email: 'test@affiliateflow.com',
      displayName: 'Test User',
      plan: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      onboardingComplete: true
    };

    await db.collection('users').doc('test-user-123').set(testUser);
    console.log('✅ Test user created');

    // Create test campaign
    const testCampaign = {
      userId: 'test-user-123',
      name: 'Summer Fashion Campaign',
      description: 'Promote summer fashion trends',
      status: 'active',
      budget: 1000,
      spent: 250,
      clicks: 1250,
      conversions: 45,
      revenue: 2340,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('campaigns').add(testCampaign);
    console.log('✅ Test campaign created');

    // Create test workflow
    const testWorkflow = {
      userId: 'test-user-123',
      name: 'Daily Content Automation',
      description: 'Automatically post daily Instagram content',
      niche: 'fashion',
      trigger: {
        type: 'schedule',
        config: { cron: '0 9 * * *' }
      },
      stages: [
        { type: 'action', action: { type: 'findTrends' } },
        { type: 'action', action: { type: 'createContent' } }
      ],
      status: 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      executionCount: 0
    };

    await db.collection('workflows').add(testWorkflow);
    console.log('✅ Test workflow created');

    console.log('✅ Test data seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData();
"@

$seederScript | Out-File -FilePath "seed-test-data.js" -Encoding UTF8
Write-Success "Test data seeder created"

Write-Info "Run 'node seed-test-data.js' to populate test data"

# ============================================================================
# STEP 7: Create Test Scripts
# ============================================================================
Write-Step 7 "Creating Test Scripts"

# Create quick test script
$quickTest = @"
# Quick Test Script
# Tests all API endpoints

Write-Host "🧪 Running Quick Tests..." -ForegroundColor Cyan

`$baseUrl = "http://localhost:3000"

# Test health endpoint
Write-Host "`nTesting FlowBot API..."
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/flowbot" -Method POST -Body (@{message="Hello";history=@()} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ FlowBot API working" -ForegroundColor Green
} catch {
    Write-Host "❌ FlowBot API failed" -ForegroundColor Red
}

# Test content generation
Write-Host "`nTesting Content Generation API..."
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/content/generate" -Method POST -Body (@{type="caption";platform="instagram";topic="test"} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Content Generation API working" -ForegroundColor Green
} catch {
    Write-Host "❌ Content Generation API failed" -ForegroundColor Red
}

# Test product search
Write-Host "`nTesting Product Search API..."
try {
    `$response = Invoke-RestMethod -Uri "`$baseUrl/api/products/search" -Method POST -Body (@{query="dress";limit=5} | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Product Search API working" -ForegroundColor Green
} catch {
    Write-Host "❌ Product Search API failed" -ForegroundColor Red
}

Write-Host "`n✅ Quick tests complete!" -ForegroundColor Green
"@

$quickTest | Out-File -FilePath "quick_test_apis.ps1" -Encoding UTF8
Write-Success "quick_test_apis.ps1 created"

# ============================================================================
# STEP 8: Summary
# ============================================================================
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Setup Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ($ErrorCount -eq 0 -and $WarningCount -eq 0) {
    Write-Host "🎉 Perfect! Everything is ready!" -ForegroundColor Green
} elseif ($ErrorCount -eq 0) {
    Write-Host "✅ Setup complete with $WarningCount warnings" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Setup complete with $ErrorCount errors and $WarningCount warnings" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit client/.env.local with your API keys" -ForegroundColor White
Write-Host "2. Run: node seed-test-data.js" -ForegroundColor White
Write-Host "3. Start dev server: cd client && npm run dev" -ForegroundColor White
Write-Host "4. (Optional) Start vision service: .\start_vision_analyzer.ps1" -ForegroundColor White
Write-Host "5. Run tests: .\quick_test_apis.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access your app at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# END
# ============================================================================
