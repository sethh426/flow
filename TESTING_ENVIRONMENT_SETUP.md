# 🧪 TESTING ENVIRONMENT SETUP

## What Needs to Be Done

### ✅ **COMPLETED**
- [x] Authentication System
- [x] Campaign Manager API
- [x] FlowBot System Instructions
- [x] All API routes created

### ⚠️ **MISSING - NEEDS TO BE DONE**

#### 1. **Install Missing Dependencies** ❌
```bash
# Missing from client/package.json:
- stripe
- @stripe/stripe-js
- @google/generative-ai (for content generation)
- firebase-admin (for API routes)
```

#### 2. **Environment Variables** ❌
Need to create `client/.env.local` with:
- NEXT_PUBLIC_GEMINI_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- INSTAGRAM_APP_ID
- INSTAGRAM_APP_SECRET
- All price IDs for Stripe

#### 3. **Service Account Issues** ⚠️
Multiple service account files exist:
- `serviceAccountKey.json`
- `serviceAccountKey-affiliateflow-abzfy.json`
- `serviceAccountKey-studio.json`

Need to consolidate and ensure correct one is used.

#### 4. **API Route Dependencies** ❌
New API routes reference modules that may not be installed:
- Stripe in payment routes
- Firebase Admin in multiple routes
- Instagram OAuth libraries

#### 5. **Test Data** ❌
Need to:
- Seed Firestore with test users
- Create test campaigns
- Set up test product data
- Configure test Instagram account

#### 6. **Service Deployments** ❌
Services created but not deployed:
- vision-analyzer (needs npm install + deployment)
- Existing services need to be started/tested

#### 7. **Integration Points** ❌
Need to verify:
- FlowBot ↔ Vision API connection
- FlowBot ↔ Content Generation connection
- FlowBot ↔ Product Search connection
- FlowBot ↔ Workflows connection

---

## 🚀 IMMEDIATE ACTION PLAN

### **Phase 1: Install Dependencies (15 min)**

```powershell
# 1. Install client dependencies
cd client
npm install stripe @stripe/stripe-js @google/generative-ai firebase-admin

# 2. Install vision-analyzer dependencies
cd ../services/vision-analyzer
npm install

# 3. Verify all services have dependencies
cd ../product-mapper
npm install

cd ../workflow-executor
npm install
```

### **Phase 2: Configure Environment (10 min)**

```powershell
# Copy and configure environment file
copy .env.example client/.env.local
# Then edit client/.env.local with your actual keys
```

### **Phase 3: Start Services (5 min)**

```powershell
# Terminal 1: Vision Analyzer
.\start_vision_analyzer.ps1

# Terminal 2: Development Server
cd client
npm run dev

# Terminal 3: (Optional) Other services
cd services/workflow-executor
npm start
```

### **Phase 4: Run Tests (20 min)**

```powershell
# Run comprehensive test suite
.\test_all_services.ps1
```

---

## 📋 DETAILED MISSING ITEMS

### **A. Package.json Updates Needed**

#### `client/package.json` missing:
```json
{
  "dependencies": {
    "stripe": "^17.3.1",
    "@stripe/stripe-js": "^5.2.0",
    "@google/generative-ai": "^0.21.0",
    "firebase-admin": "^13.0.1"
  }
}
```

### **B. Environment Variables Template**

Create `client/.env.local`:
```env
# Firebase (from serviceAccountKey.json)
FIREBASE_PROJECT_ID=affiliateflow-abzfy
FIREBASE_PRIVATE_KEY="REDACTED_PRIVATE_KEY\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@affiliateflow-abzfy.iam.gserviceaccount.com

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=AIza...your_key_here

# Services URLs (Local Development)
VISION_ANALYZER_URL=http://localhost:8083
WORKFLOW_EXECUTOR_URL=http://localhost:8082
PRODUCT_MAPPER_URL=http://localhost:8081

# Instagram OAuth (Create at developers.facebook.com)
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
INSTAGRAM_ACCOUNT_ID=your_instagram_business_account_id

# Stripe (Get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Affiliate IDs (Optional)
AFFILIATE_ID=your_affiliate_id
NORDSTROM_AFFILIATE_ID=your_nordstrom_id
AMAZON_AFFILIATE_ID=your_amazon_tag
```

### **C. Service Account Consolidation**

You have multiple service account files. Need to:
1. Identify which is the correct/active one
2. Remove duplicates
3. Update references in code

### **D. API Routes That Need Testing**

1. **Content Generation** (`/api/content/generate`)
   - Needs: @google/generative-ai package
   - Test: Caption generation, hashtags, scripts

2. **Vision API** (`/api/vision/*`)
   - Needs: vision-analyzer service running
   - Test: Image analysis, brand safety, OCR

3. **Product Search** (`/api/products/search`)
   - Needs: product-mapper service running
   - Test: Product search, affiliate links

4. **Instagram** (`/api/instagram/*`)
   - Needs: Instagram App configured
   - Test: OAuth flow, posting

5. **Stripe** (`/api/stripe/*`)
   - Needs: Stripe account + products configured
   - Test: Checkout, webhooks

6. **Workflows** (`/api/workflows/*`)
   - Needs: Firebase Admin
   - Test: CRUD operations, execution

### **E. Missing Test Scripts**

Need to create:
- `test_content_generation.ps1`
- `test_vision_api.ps1`
- `test_product_search.ps1`
- `test_instagram_oauth.ps1`
- `test_stripe_checkout.ps1`
- `test_workflows.ps1`

### **F. Database Seeding**

Need to populate Firestore with:
- Test users with different plan levels
- Sample campaigns
- Test workflows
- Analytics data for dashboard

### **G. Instagram App Setup**

Need to:
1. Create Meta Developer account
2. Create new app
3. Add Instagram Basic Display
4. Configure OAuth redirect URLs
5. Get App ID and Secret

### **H. Stripe Setup**

Need to:
1. Create Stripe account
2. Create products (Pro, Business)
3. Create price IDs for monthly/yearly
4. Set up webhook endpoint
5. Get webhook secret

---

## 🎯 PRIORITY ORDER

### **HIGH PRIORITY** (Do First)
1. ✅ Install npm dependencies
2. ✅ Create .env.local file
3. ✅ Consolidate service account files
4. ✅ Test basic app startup (npm run dev)
5. ✅ Verify Firebase connection

### **MEDIUM PRIORITY** (Do Second)
6. ✅ Start vision-analyzer service
7. ✅ Test FlowBot basic functionality
8. ✅ Test content generation API
9. ✅ Test product search API
10. ✅ Seed test data

### **LOW PRIORITY** (Do Later)
11. ⏳ Set up Instagram OAuth (requires Meta approval)
12. ⏳ Configure Stripe products
13. ⏳ Deploy to production
14. ⏳ Set up monitoring

---

## 🔍 QUICK STATUS CHECK

Run this to see what's working:
```powershell
# Check if services are running
curl http://localhost:3000/api/health
curl http://localhost:8083/health
curl http://localhost:8082/health
curl http://localhost:8081/health

# Check if Firebase is accessible
node check-firebase-data.js

# Check API keys
node test-api-keys.js
```

---

## 📝 NEXT STEPS

### **Step 1: Install Dependencies**
```powershell
cd client
npm install stripe @stripe/stripe-js @google/generative-ai firebase-admin
```

### **Step 2: Create Environment File**
```powershell
# Create client/.env.local with all keys
notepad client/.env.local
```

### **Step 3: Verify Service Account**
```powershell
# Check which service account is correct
node inspect-firebase.js
```

### **Step 4: Start Testing**
```powershell
# Start dev server
cd client
npm run dev

# In another terminal, start vision service
.\start_vision_analyzer.ps1

# Test FlowBot
# Open http://localhost:3000
# Ask: "Generate an Instagram caption about summer fashion"
```

---

## ⚠️ KNOWN ISSUES

1. **Grid Component Error**: InstagramScheduler.tsx has MUI Grid errors (minor, won't break app)
2. **Stripe Module**: Not installed yet, payment routes will fail
3. **Instagram OAuth**: Requires external setup (Meta Developer account)
4. **Vision Service**: Needs Google Cloud Vision API enabled
5. **Service Account**: Multiple files exist, need to pick correct one

---

## ✅ WHAT'S READY TO TEST NOW

Even without full setup, you can test:
- ✅ Authentication (sign up/login)
- ✅ Campaign Manager (CRUD operations)
- ✅ FlowBot basic chat
- ✅ Dashboard UI
- ✅ Navigation

---

## 📊 COMPLETION STATUS

| Feature | Code Complete | Dependencies | Config | Tests | Status |
|---------|--------------|--------------|--------|-------|--------|
| Authentication | ✅ | ✅ | ✅ | ⚠️ | **READY** |
| Campaign Manager | ✅ | ✅ | ✅ | ⚠️ | **READY** |
| FlowBot Chat | ✅ | ✅ | ✅ | ⚠️ | **READY** |
| Content Generation | ✅ | ❌ | ❌ | ❌ | **BLOCKED** |
| Vision API | ✅ | ❌ | ❌ | ❌ | **BLOCKED** |
| Product Search | ✅ | ⚠️ | ❌ | ❌ | **PARTIAL** |
| Instagram OAuth | ✅ | ❌ | ❌ | ❌ | **BLOCKED** |
| Stripe Payments | ✅ | ❌ | ❌ | ❌ | **BLOCKED** |
| Workflows | ✅ | ⚠️ | ❌ | ❌ | **PARTIAL** |

**Legend:**
- ✅ Complete
- ⚠️ Partial
- ❌ Blocked/Missing

---

## 🚀 LET'S START!

**First Command:**
```powershell
cd client
npm install stripe @stripe/stripe-js @google/generative-ai firebase-admin
```

**Then:**
```powershell
npm run dev
```

**This will tell us exactly what's missing!**
