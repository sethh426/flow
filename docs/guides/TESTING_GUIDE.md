# 🧪 Testing Environment Setup Guide

**Date:** October 19, 2025  
**Purpose:** Complete testing environment for AffiliateFlow platform

---

## 📋 PRE-TESTING CHECKLIST

### ✅ **1. Install Dependencies**

```powershell
# Install client dependencies (including Stripe)
cd client
npm install stripe @stripe/stripe-js @google/generative-ai

# Install vision-analyzer dependencies
cd ../services/vision-analyzer
npm install

# Install workflow-executor dependencies (if running locally)
cd ../workflow-executor
npm install

# Install product-mapper dependencies (if running locally)
cd ../product-mapper
npm install
```

### ✅ **2. Environment Configuration**

Create `client/.env.local`:
```env
# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Service URLs (local testing)
VISION_ANALYZER_URL=http://localhost:8083
WORKFLOW_EXECUTOR_URL=http://localhost:8082
PRODUCT_MAPPER_URL=http://localhost:8081

# Instagram OAuth (TEST CREDENTIALS - get from Meta Developer Portal)
INSTAGRAM_APP_ID=your_test_app_id
INSTAGRAM_APP_SECRET=your_test_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
INSTAGRAM_ACCOUNT_ID=your_test_account_id

# Stripe (TEST MODE KEYS)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_test_pro_monthly
STRIPE_PRO_YEARLY_PRICE_ID=price_test_pro_yearly
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_test_business_monthly
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_test_business_yearly

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Affiliate IDs (optional for testing)
AFFILIATE_ID=test-affiliate-id
NORDSTROM_AFFILIATE_ID=test-nordstrom-id
AMAZON_AFFILIATE_TAG=test-amazon-tag
```

Create `services/vision-analyzer/.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=../../serviceAccountKey.json
PORT=8083
```

### ✅ **3. Google Cloud Setup**

```powershell
# Set service account credentials
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\sethp\Downloads\Affiliate-Flow-Prototype\serviceAccountKey.json"

# Enable APIs (if not already enabled)
gcloud services enable vision.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable workflows.googleapis.com
```

---

## 🚀 TESTING SERVICES

### **Option 1: All Services Local**

```powershell
# Terminal 1: Vision Analyzer
.\start_vision_analyzer.ps1

# Terminal 2: Workflow Executor (optional for now)
cd services\workflow-executor
npm start

# Terminal 3: Product Mapper (optional for now)
cd services\product-mapper
npm start

# Terminal 4: Next.js Dev Server
cd client
npm run dev
```

### **Option 2: Next.js Only (Services Mock)**

```powershell
# Just start Next.js - API routes will use mock data
cd client
npm run dev
```

---

## 🧪 TEST SUITES

### **1. Vision API Tests**

**Test Script:** `test_vision_api.ps1`

```powershell
# Test health check
curl http://localhost:8083/health

# Test image analysis
curl -X POST http://localhost:8083/analyze `
  -H "Content-Type: application/json" `
  -d '{
    "imageUrl": "https://via.placeholder.com/400x600/4A90E2/ffffff?text=Test+Product"
  }'

# Test brand safety
curl -X POST http://localhost:8083/safety `
  -H "Content-Type: application/json" `
  -d '{
    "imageUrl": "https://via.placeholder.com/400x600",
    "text": "Check out this amazing product!"
  }'

# Test OCR
curl -X POST http://localhost:8083/ocr `
  -H "Content-Type: application/json" `
  -d '{
    "imageUrl": "https://via.placeholder.com/400x600"
  }'
```

### **2. Content Generation Tests**

**Test Script:** `test_content_api.ps1`

```powershell
# Test caption generation
curl -X POST http://localhost:3000/api/content/generate `
  -H "Content-Type: application/json" `
  -d '{
    "type": "caption",
    "platform": "instagram",
    "topic": "summer fashion trends",
    "tone": "trendy",
    "includeHashtags": true
  }'

# Test hashtag generation
curl -X POST http://localhost:3000/api/content/generate `
  -H "Content-Type: application/json" `
  -d '{
    "type": "hashtags",
    "platform": "instagram",
    "topic": "fitness motivation"
  }'

# Test reel script
curl -X POST http://localhost:3000/api/content/generate `
  -H "Content-Type: application/json" `
  -d '{
    "type": "reel-script",
    "platform": "instagram",
    "topic": "product unboxing",
    "tone": "exciting"
  }'
```

### **3. Product Discovery Tests**

**Test Script:** `test_product_api.ps1`

```powershell
# Test product search
curl -X POST http://localhost:3000/api/products/search `
  -H "Content-Type: application/json" `
  -d '{
    "query": "red dress",
    "source": "all",
    "minPrice": 50,
    "maxPrice": 200,
    "limit": 10
  }'

# Test trending products
curl http://localhost:3000/api/products/search?category=fashion
```

### **4. Workflow API Tests**

**Test Script:** `test_workflow_api.ps1`

```powershell
# Create workflow
$workflowId = curl -X POST http://localhost:3000/api/workflows `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user-123",
    "name": "Daily Instagram Content",
    "description": "Automated daily posting",
    "niche": "fashion",
    "trigger": {
      "type": "schedule",
      "config": {"cron": "0 9 * * *"}
    },
    "stages": [
      {
        "id": "stage-1",
        "type": "action",
        "action": {
          "type": "findTrends",
          "config": {"category": "fashion"}
        }
      }
    ],
    "status": "active"
  }'

# List workflows
curl "http://localhost:3000/api/workflows?userId=test-user-123"

# Execute workflow
curl -X POST "http://localhost:3000/api/workflows/$workflowId/execute" `
  -H "Content-Type: application/json" `
  -d '{"input": {}}'
```

### **5. FlowBot Integration Tests**

**Test Script:** `test_flowbot.ps1`

```powershell
# Test basic conversation
curl -X POST http://localhost:3000/api/flowbot `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Hello! What can you help me with?",
    "history": []
  }'

# Test vision integration
curl -X POST http://localhost:3000/api/flowbot `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Analyze this image: https://via.placeholder.com/400",
    "history": []
  }'

# Test content generation
curl -X POST http://localhost:3000/api/flowbot `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Generate an Instagram caption about summer fashion",
    "history": []
  }'

# Test workflow creation
curl -X POST http://localhost:3000/api/flowbot `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Create a workflow to post daily Instagram content at 9 AM",
    "history": []
  }'
```

### **6. Campaign API Tests**

**Test Script:** `test_campaign_api.ps1`

```powershell
# Create campaign
curl -X POST http://localhost:3000/api/campaigns `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Summer Sale",
    "description": "Promote summer products",
    "budget": 500,
    "startDate": "2025-06-01",
    "endDate": "2025-08-31",
    "userId": "test-user-123"
  }'

# List campaigns
curl "http://localhost:3000/api/campaigns?userId=test-user-123"
```

---

## 🎯 END-TO-END TEST SCENARIOS

### **Scenario 1: Complete Content Pipeline**

```powershell
# 1. Search for products
$products = curl -X POST http://localhost:3000/api/products/search `
  -H "Content-Type: application/json" `
  -d '{"query": "summer dress", "limit": 1}'

# 2. Analyze product image
$analysis = curl -X POST http://localhost:3000/api/vision/analyze `
  -H "Content-Type: application/json" `
  -d '{
    "imageUrl": "[USE_PRODUCT_IMAGE_URL_FROM_STEP_1]"
  }'

# 3. Generate content
$content = curl -X POST http://localhost:3000/api/content/generate `
  -H "Content-Type: application/json" `
  -d '{
    "type": "caption",
    "platform": "instagram",
    "topic": "summer fashion",
    "productInfo": {
      "name": "[FROM_STEP_1]",
      "price": "[FROM_STEP_1]"
    }
  }'

# 4. Check brand safety
$safety = curl -X POST http://localhost:3000/api/vision/safety `
  -H "Content-Type: application/json" `
  -d '{
    "imageUrl": "[PRODUCT_IMAGE]",
    "text": "[GENERATED_CAPTION]"
  }'

# 5. Schedule post (if safe)
curl -X POST http://localhost:3000/api/instagram/post `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "test-user-123",
    "imageUrl": "[PRODUCT_IMAGE]",
    "caption": "[GENERATED_CAPTION]",
    "schedule": "2025-10-20T09:00:00"
  }'
```

### **Scenario 2: FlowBot Orchestration**

```powershell
# Ask FlowBot to do everything
curl -X POST http://localhost:3000/api/flowbot `
  -H "Content-Type: application/json" `
  -d '{
    "message": "Find trending summer dresses, analyze the best one, create an Instagram post, check if its safe, and schedule it for tomorrow at 9 AM",
    "history": []
  }'
```

---

## 📊 PERFORMANCE BENCHMARKS

### **Target Metrics**

| Endpoint | Target Response Time | Acceptable |
|----------|---------------------|------------|
| `/api/flowbot` | < 2s | < 5s |
| `/api/content/generate` | < 3s | < 8s |
| `/api/vision/analyze` | < 2s | < 5s |
| `/api/products/search` | < 1s | < 3s |
| `/api/workflows` | < 500ms | < 1s |
| `/api/campaigns` | < 300ms | < 1s |

### **Load Testing** (Optional)

```powershell
# Install artillery (if needed)
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 http://localhost:3000/api/campaigns
```

---

## 🐛 DEBUGGING TOOLS

### **1. Check Service Status**

```powershell
# Check all services
curl http://localhost:8083/health  # Vision Analyzer
curl http://localhost:8082/health  # Workflow Executor
curl http://localhost:8081/health  # Product Mapper
curl http://localhost:3000/api/flowbot  # Next.js (returns error but service is up)
```

### **2. View Logs**

```powershell
# Next.js logs (in terminal running npm run dev)

# Vision Analyzer logs
cd services\vision-analyzer
npm run dev  # Shows real-time logs

# Firebase logs
firebase functions:log
```

### **3. Database Inspection**

```powershell
# Open Firestore console
firebase open firestore

# Or use Firebase Emulator UI
firebase emulators:start
```

---

## ✅ TEST RESULTS CHECKLIST

### **Before Going Live**

- [ ] All services start without errors
- [ ] Vision API analyzes images successfully
- [ ] Content generation produces quality output
- [ ] Product search returns results
- [ ] Workflows can be created and executed
- [ ] Campaigns CRUD operations work
- [ ] FlowBot responds intelligently
- [ ] Instagram OAuth flow works
- [ ] Stripe checkout creates sessions
- [ ] Webhooks process correctly
- [ ] All API routes return proper status codes
- [ ] Error handling works gracefully
- [ ] No console errors in frontend
- [ ] Mobile responsive design works
- [ ] Performance meets benchmarks

---

## 🚨 COMMON ISSUES & FIXES

### **Issue 1: Vision Analyzer Won't Start**

```powershell
# Fix: Check service account key
$env:GOOGLE_APPLICATION_CREDENTIALS
Test-Path $env:GOOGLE_APPLICATION_CREDENTIALS

# If missing, set it:
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\sethp\Downloads\Affiliate-Flow-Prototype\serviceAccountKey.json"
```

### **Issue 2: "Module not found: stripe"**

```powershell
# Fix: Install Stripe
cd client
npm install stripe @stripe/stripe-js
```

### **Issue 3: CORS Errors**

```javascript
// Fix: Already handled in services with:
app.use(cors());
```

### **Issue 4: Firebase Admin Errors**

```powershell
# Fix: Check serviceAccountKey.json exists in root
Test-Path serviceAccountKey.json
```

### **Issue 5: Gemini API Rate Limits**

```javascript
// Fix: Add rate limiting or upgrade to paid tier
// Free tier: 15 requests/minute
// Paid tier: 1,000 requests/minute
```

---

## 📱 BROWSER TESTING

### **Test in Multiple Browsers**

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile Chrome (responsive mode)
- [ ] Mobile Safari (responsive mode)

### **Test All Pages**

- [ ] `/` - Landing/Login page
- [ ] `/dashboard` - Main dashboard
- [ ] `/dashboard?view=0` - Overview
- [ ] `/dashboard?view=1` - Campaigns
- [ ] `/dashboard?view=2` - Products
- [ ] `/dashboard?view=3` - Content Calendar
- [ ] `/dashboard?view=5` - Analytics
- [ ] `/dashboard?view=8` - FlowBot
- [ ] `/dashboard?view=9` - Workflows

---

## 🎬 VIDEO TESTING SCRIPT

Record a demo video testing:

1. **Login** - Show authentication
2. **Dashboard Tour** - Navigate all sections
3. **Product Search** - Find and display products
4. **Content Generation** - Generate Instagram caption
5. **Vision Analysis** - Analyze product image
6. **Workflow Creation** - Create automated workflow
7. **Campaign Management** - Create and manage campaign
8. **FlowBot** - Chat and get AI assistance
9. **Post Scheduling** - Schedule Instagram post
10. **Upgrade Flow** - Test Stripe checkout

---

## 🚀 PRODUCTION READINESS

### **Security Checklist**

- [ ] Environment variables not committed to git
- [ ] API keys in `.env.local` (gitignored)
- [ ] Service account key not in repo
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled on API routes
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Firestore)
- [ ] XSS protection (React handles this)
- [ ] HTTPS enforced in production

### **Performance Checklist**

- [ ] Images optimized and lazy-loaded
- [ ] API responses cached where appropriate
- [ ] Database queries optimized
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled
- [ ] Code splitting implemented
- [ ] Service worker for offline support (optional)

---

## 📞 SUPPORT RESOURCES

- **Firebase Console:** https://console.firebase.google.com
- **Google Cloud Console:** https://console.cloud.google.com
- **Stripe Dashboard:** https://dashboard.stripe.com/test/dashboard
- **Meta Developer Portal:** https://developers.facebook.com
- **Project Documentation:** All `*.md` files in root

---

**Ready to Test?** Run: `.\test_all.ps1`

**Last Updated:** October 19, 2025  
**Status:** 🧪 Testing Environment Ready!
