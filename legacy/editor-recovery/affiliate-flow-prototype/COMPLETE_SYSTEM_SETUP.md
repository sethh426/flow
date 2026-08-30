# 🚀 Complete System Setup Guide
## Affiliate Flow - End-to-End Integration

**Project:** flow-69826693-f6d27  
**Status:** Frontend deployed, backend needs connection  
**Goal:** Connect all pieces so changes flow through the entire system

---

## 📊 Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE HOSTING                             │
│            https://flow-69826693-f6d27.web.app                   │
│                  (client/out - Static Export)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Calls API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API (server.js)                      │
│                    Port 3001 (local dev)                         │
│              Cloud Functions/Run (production)                    │
│                                                                   │
│  Routes: /api/products, /api/stats, /api/categories             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Read/Write
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                            │
│                  flow-69826693-f6d27                             │
│                                                                   │
│  Collections:                                                    │
│  - products: Scraped products from affiliates                    │
│  - stats: Dashboard statistics                                   │
│  - categories: Product categories with counts                    │
│  - users: User authentication data                               │
│  - campaigns: AI-generated content campaigns                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Services Write Here
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES                                 │
│                                                                   │
│  1. Product Mapper (services/product-mapper/)                    │
│     - Maps affiliate products to categories                      │
│     - Writes to Firestore products collection                    │
│                                                                   │
│  2. Trend Finder (services/trend-finder/)                        │
│     - Finds trending products/topics                             │
│     - Writes to Firestore trends collection                      │
│                                                                   │
│  3. Master AI Orchestrator (services/master-ai-orchestrator/)   │
│     - Coordinates AI content generation                          │
│     - Writes to Firestore campaigns collection                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 What's Working

✅ **Frontend Deployed:** https://flow-69826693-f6d27.web.app  
✅ **Firebase Project:** flow-69826693-f6d27 configured  
✅ **Firebase SDK:** Client-side Firebase initialized (`client/src/lib/firebase-config.ts`)  
✅ **Firestore Rules:** Security rules configured for users, products, campaigns  
✅ **Backend API:** `server.js` has endpoints for products, stats, categories  
✅ **Environment Variables:** All API keys configured in `.env.local`

---

## ❌ What's NOT Working

🔴 **Frontend → Backend API:** Frontend calls `http://localhost:3001` but server not running  
🔴 **Backend → Firestore:** `server.js` uses Firebase Admin SDK but might not be connected  
🔴 **Microservices → Firestore:** Services exist but not actively writing data  
🔴 **Authentication:** Firebase Auth enabled but login/signup not fully wired  
🔴 **Data Seeding:** No initial data in Firestore (empty collections)  
🔴 **Production API:** No Cloud Function/Cloud Run deployed for production API

---

## 🎯 Action Plan

### Phase 1: Connect Backend API to Firestore
**Goal:** Get server.js running and connected to Firestore

1. **Verify Firebase Admin SDK Setup**
   ```powershell
   # Check serviceAccountKey.json exists
   Get-Content .\serviceAccountKey.json | ConvertFrom-Json | Select-Object project_id, client_email
   ```

2. **Start Backend Server**
   ```powershell
   # In root directory
   node server.js
   ```
   Should see: `Server running on port 3001`

3. **Test API Endpoints**
   ```powershell
   # Test health check
   curl http://localhost:3001/api
   
   # Test products endpoint
   curl http://localhost:3001/api/products
   
   # Test stats endpoint
   curl http://localhost:3001/api/stats
   ```

### Phase 2: Seed Firestore with Initial Data
**Goal:** Add sample data so dashboard has something to display

1. **Run Seed Script**
   ```powershell
   node seed-demo-data.js
   ```

2. **Verify Data in Firestore**
   - Open https://console.firebase.google.com/project/flow-69826693-f6d27/firestore
   - Check collections: `products`, `stats`, `categories`

### Phase 3: Connect Frontend to Backend
**Goal:** Make frontend call backend API

1. **Update Environment Variable**
   - Dev: `NEXT_PUBLIC_API_URL=http://localhost:3001`
   - Prod: `NEXT_PUBLIC_API_URL=https://YOUR_CLOUD_FUNCTION_URL`

2. **Start Frontend Dev Server**
   ```powershell
   cd client
   npm run dev
   ```
   Open http://localhost:3000/dashboard

3. **Verify Data Loads**
   - Dashboard should show products, stats, categories
   - Check browser console for any errors

### Phase 4: Enable Firebase Authentication
**Goal:** Wire up login/signup pages

1. **Enable Auth Providers in Firebase Console**
   - Email/Password ✅
   - Google (optional)
   - GitHub (optional)

2. **Update Login/Signup Pages**
   - Already use Firebase Auth SDK
   - Just need to test them

3. **Test Authentication Flow**
   - Go to /signup → Create account
   - Go to /login → Sign in
   - Should redirect to /dashboard

### Phase 5: Connect Microservices
**Goal:** Get product-mapper and other services writing to Firestore

1. **Update Product Mapper**
   ```powershell
   cd services/product-mapper
   npm install
   npm start
   ```

2. **Update Master AI Orchestrator**
   ```powershell
   cd services/master-ai-orchestrator
   npm install
   npm start
   ```

3. **Verify Services Write to Firestore**
   - Check Firestore console for new products
   - Check logs for successful writes

### Phase 6: Deploy to Production
**Goal:** Make everything work on Firebase Hosting

**Option A: Deploy Backend as Cloud Function**
```powershell
# Create functions directory if not exists
mkdir functions -Force
cd functions
npm init -y
npm install express cors firebase-admin

# Copy server.js logic to functions/index.js
# Deploy
firebase deploy --only functions
```

**Option B: Deploy Backend as Cloud Run** (Recommended for microservices)
```powershell
# Create Dockerfile for server.js
# Build and deploy to Cloud Run
gcloud run deploy affiliate-flow-api --source .
```

**Deploy Frontend**
```powershell
cd client
npm run build
firebase deploy --only hosting
```

---

## 🗂️ Firestore Collections Schema

### `products` Collection
```javascript
{
  id: "auto-generated",
  name: "Product Name",
  category: "clothing",
  price: "$29.99",
  status: "pending" | "mapped",
  source: "nordstrom" | "shopstyle" | "amazon",
  approved: false,
  timestamp: "2025-01-10T12:00:00Z",
  userId: "user-uid" // For multi-tenant isolation
}
```

### `stats` Collection
```javascript
// Document ID: "current"
{
  totalProducts: 150,
  mappedProducts: 120,
  pendingProducts: 30,
  categoryBreakdown: {
    "clothing": 50,
    "shoes": 30,
    "accessories": 40,
    "beauty": 30
  },
  lastUpdateTime: "2025-01-10T12:00:00Z"
}
```

### `categories` Collection
```javascript
{
  id: "auto-generated",
  name: "clothing",
  count: 50,
  source: "trending" | "new",
  timestamp: "2025-01-10T12:00:00Z"
}
```

### `users` Collection
```javascript
{
  id: "user-uid", // From Firebase Auth
  email: "user@example.com",
  displayName: "John Doe",
  subscription: "free" | "pro" | "premium",
  createdAt: "2025-01-10T12:00:00Z",
  businessType: "affiliate" | "ecommerce" | "consultant"
}
```

### `campaigns` Collection
```javascript
{
  id: "auto-generated",
  userId: "user-uid",
  title: "Spring Fashion Trends 2025",
  content: "AI-generated blog post...",
  products: ["product-id-1", "product-id-2"],
  status: "draft" | "published",
  createdAt: "2025-01-10T12:00:00Z"
}
```

---

## 🔑 Environment Variables Checklist

### Client (`.env.local`)
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=REDACTED_GOOGLE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flow-69826693-f6d27.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flow-69826693-f6d27
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flow-69826693-f6d27.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001  # Dev
# NEXT_PUBLIC_API_URL=https://your-cloud-function-url  # Prod

# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=REDACTED_GOOGLE_API_KEY
```

### Backend (root `.env`)
```bash
# Firebase Admin
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
FIREBASE_PROJECT_ID=flow-69826693-f6d27

# Gemini AI
GEMINI_API_KEY=REDACTED_GOOGLE_API_KEY

# Server
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## 🧪 Testing the Complete Flow

### 1. **Start Backend**
```powershell
# Terminal 1
node server.js
```

### 2. **Start Frontend**
```powershell
# Terminal 2
cd client
npm run dev
```

### 3. **Seed Data**
```powershell
# Terminal 3
node seed-demo-data.js
```

### 4. **Test in Browser**
1. Open http://localhost:3000
2. Click "Sign Up" → Create account
3. Login → Should redirect to /dashboard
4. Dashboard should show:
   - Products list
   - Stats (total, mapped, pending)
   - Category breakdown

### 5. **Verify Firestore**
- Open Firebase Console
- Check Firestore collections have data
- Check Firebase Auth has your user

---

## 🚀 Quick Commands

```powershell
# Start backend server
node server.js

# Start frontend dev server
cd client; npm run dev

# Build frontend for production
cd client; npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Seed demo data
node seed-demo-data.js

# Test API endpoints
curl http://localhost:3001/api/products
curl http://localhost:3001/api/stats
curl http://localhost:3001/api/categories

# Start product mapper service
cd services/product-mapper; npm start

# Start AI orchestrator service
cd services/master-ai-orchestrator; npm start
```

---

## 🔍 Troubleshooting

### Frontend shows "No products"
- ✅ Check server.js is running on port 3001
- ✅ Check `NEXT_PUBLIC_API_URL` in `.env.local`
- ✅ Check Firestore has data (run seed-demo-data.js)
- ✅ Check browser console for CORS errors

### "Firebase not initialized" error
- ✅ Check all `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local`
- ✅ Restart dev server after changing env vars
- ✅ Check `client/src/lib/firebase-config.ts` imports correctly

### API returns 500 error
- ✅ Check `serviceAccountKey.json` exists in root
- ✅ Check Firebase Admin SDK is initialized in `firebase.js`
- ✅ Check Firestore collections exist

### Login/Signup doesn't work
- ✅ Enable Email/Password auth in Firebase Console
- ✅ Check Firebase Auth SDK initialized in `client/src/lib/firebase-config.ts`
- ✅ Check browser console for auth errors

---

## 📝 Next Steps After Setup

1. **Add Real Product Scraping**
   - Configure affiliate APIs (Nordstrom, Amazon, etc.)
   - Run scrapers to populate Firestore

2. **Enable AI Content Generation**
   - Test Gemini API integration
   - Generate blog posts/social media content

3. **Add Payment Processing**
   - Configure Stripe (mock implementation exists)
   - Enable subscription plans

4. **Deploy Microservices to Cloud Run**
   - Containerize services
   - Deploy to Google Cloud Run
   - Connect via Cloud Tasks/Pub/Sub

5. **Set Up Monitoring**
   - Cloud Logging for backend
   - Firebase Analytics for frontend
   - Error tracking (Sentry, etc.)

---

## 🎯 Current Priority

**IMMEDIATE NEXT STEP:**
```powershell
# 1. Start backend server
node server.js

# 2. In new terminal, seed data
node seed-demo-data.js

# 3. In new terminal, start frontend
cd client; npm run dev

# 4. Open browser to http://localhost:3000/dashboard
```

**EXPECTED RESULT:**  
Dashboard shows products, stats, and categories from Firestore!

---

**Last Updated:** January 10, 2025  
**Project ID:** flow-69826693-f6d27  
**Deployed URL:** https://flow-69826693-f6d27.web.app
