# AffiliateFlow Unified - Merge Plan

## 🎯 Objective
Merge Firebase Studio's AI platform with Local Production's affiliate features, keeping Firebase Studio's layout.

## 📊 Current State

### Firebase Studio (affiliateflow-abzfy) - THE BASE
- **Project**: AI-powered content creation platform
- **Framework**: Next.js 14 + Google Genkit
- **Features**: 15 AI flows, brand ambassador, trend analysis, TTS, content generation
- **UI**: Advanced Radix UI components, shadcn/ui
- **Status**: ✅ In Firebase Studio, needs GitHub backup

### Local Production (flow-69826693-f6d27) - FEATURES TO PORT
- **Project**: Affiliate management dashboard  
- **Features**: Product CRUD, Categories, Analytics, Firebase integration
- **Backend**: Cloud Functions, Firebase Admin SDK
- **Infrastructure**: Terraform GCP setup (6 modules, 26 files)
- **Status**: ✅ Deployed at https://flow-69826693-f6d27.web.app

## 🔄 Merge Strategy

### Phase 1: Backup & Clone (IMMEDIATE)
1. ✅ Backup Firebase Studio to GitHub
2. ✅ Clone locally
3. ✅ Setup development environment

### Phase 2: Integrate Affiliate Features
1. **Add Product Management**
   - Copy `client/src/components/ProductList.tsx`
   - Add product creation/edit forms
   - Integrate with Firebase Studio's existing Firebase setup

2. **Add Category System**
   - Copy `client/src/components/CategoryBreakdown.tsx`
   - Create category management pages
   - Add to navigation

3. **Add Analytics Dashboard**
   - Copy `client/src/components/DashboardContent.tsx`
   - Integrate stats API
   - Create analytics page using Firebase Studio's layout

4. **Port Firebase Backend**
   - Copy `functions/index.js` → Firebase Studio
   - Update to use affiliateflow-abzfy Firebase project
   - Deploy Cloud Functions

5. **Add Service Account**
   - Copy `serviceAccountKey.json` (flow-69826693-f6d27)
   - Create new service account for affiliateflow-abzfy
   - Update all Firebase connections

### Phase 3: Unify Configuration
1. **Firebase Project**
   - Primary: `affiliateflow-abzfy`
   - Migrate data from `flow-69826693-f6d27` if needed
   - Update all environment variables

2. **Navigation Structure**
   ```
   Home (AI Dashboard)
   ├── AI Features
   │   ├── Content Generator
   │   ├── Brand Ambassador
   │   ├── Trend Analysis
   │   ├── Audience Finder
   │   └── Scheduler
   ├── Affiliate Management (NEW)
   │   ├── Products
   │   ├── Categories  
   │   ├── Analytics
   │   └── Performance
   └── Settings
       ├── Connections
       ├── Profile
       └── Usage
   ```

3. **File Structure**
   ```
   src/
   ├── ai/                    (Keep - Firebase Studio)
   │   ├── flows/
   │   ├── tools/
   │   └── schemas/
   ├── app/
   │   ├── (existing)         (Keep - Firebase Studio)
   │   ├── products/          (Add - Local Production)
   │   ├── categories/        (Add - Local Production)
   │   └── analytics/         (Add - Local Production)
   ├── components/
   │   ├── ui/                (Keep - Firebase Studio)
   │   ├── ProductList.tsx    (Add - Local Production)
   │   ├── CategoryBreakdown.tsx (Add - Local Production)
   │   └── DashboardContent.tsx  (Add - Local Production)
   └── services/
       └── affiliate/         (Add - Local Production)
           ├── products.ts
           ├── categories.ts
           └── analytics.ts
   ```

### Phase 4: Infrastructure & Deployment
1. **Port GCP Infrastructure**
   - Copy `infrastructure/` folder
   - Update project IDs to `affiliateflow-abzfy`
   - Document deployment process

2. **Environment Variables**
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=affiliateflow-abzfy
   
   # AI (existing)
   GOOGLE_GENAI_API_KEY=...
   
   # Backend (new)
   NEXT_PUBLIC_API_URL=https://YOUR-FUNCTION-URL
   ```

3. **Deployment**
   - Firebase Hosting for frontend
   - Cloud Functions for backend
   - Optional: GCP infrastructure for scaling

### Phase 5: Testing
1. ✅ All AI flows working
2. ✅ Product management CRUD
3. ✅ Category system
4. ✅ Analytics dashboard
5. ✅ Firebase connections
6. ✅ Cloud Functions
7. ✅ End-to-end workflows

## 📝 Action Items

### Immediate (Today)
- [ ] Backup Firebase Studio to GitHub
- [ ] Clone locally
- [ ] Verify environment setup

### Week 1
- [ ] Add product management pages
- [ ] Integrate category system
- [ ] Port analytics dashboard
- [ ] Setup Firebase backend

### Week 2
- [ ] Deploy Cloud Functions
- [ ] Test all integrations
- [ ] Update documentation
- [ ] Deploy to production

## 🎯 Success Criteria

✅ All AI features from Firebase Studio working
✅ All affiliate features from Local Production working
✅ Unified navigation and layout
✅ Single Firebase project (affiliateflow-abzfy)
✅ Deployed and accessible
✅ Documentation updated

## 📚 Files to Copy from Local Production

```
client/src/components/
├── ProductList.tsx
├── CategoryBreakdown.tsx
├── DashboardContent.tsx
└── Sidebar.tsx

client/src/app/
└── api/ (if any API routes)

functions/
└── index.js (Cloud Functions)

serviceAccountKey.json (create new for affiliateflow-abzfy)

infrastructure/ (optional GCP setup)
```

## 🚀 Next Steps

1. **YOU**: Backup Firebase Studio to GitHub now
2. **ME**: Guide you through cloning and setup
3. **WE**: Integrate features step by step
4. **DEPLOY**: New unified application

---

**Ready to start? Let's backup Firebase Studio first!** 🎯
