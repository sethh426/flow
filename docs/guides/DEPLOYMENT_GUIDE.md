# 🚀 Quick Start Deployment Guide

## Prerequisites
- GCP account with billing enabled
- Node.js 20+ installed
- GitHub repository access
- Domain name (optional)

## Step 1: Local Development Setup (15 minutes)

### 1.1 Install Dependencies
```bash
cd client
npm install
```

### 1.2 Configure Environment Variables
Create `client/.env.local`:
```env
# Firebase/Firestore
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 1.3 Run Development Server
```bash
npm run dev
```

Navigate to:
- Dashboard: `http://localhost:3000/dashboard`
- Onboarding: `http://localhost:3000/onboarding`
- Flow-Finder: `http://localhost:3000/flow-finder`
- Flow-a-Gram: `http://localhost:3000/flow-a-gram`
- FlowTime: `http://localhost:3000/flowtime`
- Workflows: `http://localhost:3000/workflows`

---

## Step 2: GCP Project Setup (30 minutes)

### 2.1 Create GCP Project
```bash
# Set project variables
export PROJECT_ID="affiliate-flow-prod"
export PROJECT_NUMBER="123456789"  # Get from GCP console
export REGION="us-central1"

# Create project
gcloud projects create $PROJECT_ID --name="Affiliate Flow Production"

# Set as active project
gcloud config set project $PROJECT_ID

# Link billing account
gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2.2 Enable Required APIs
```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  pubsub.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  cloudtasks.googleapis.com \
  workflows.googleapis.com \
  eventarc.googleapis.com \
  run.googleapis.com \
  cloudscheduler.googleapis.com
```

### 2.3 Create Service Accounts
```bash
# Main service account
gcloud iam service-accounts create affiliate-flow-sa \
  --description="Main service account for Affiliate Flow" \
  --display-name="Affiliate Flow SA"

# Workflow orchestrator
gcloud iam service-accounts create workflow-orchestrator-sa \
  --description="Service account for workflow orchestration" \
  --display-name="Workflow Orchestrator SA"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:workflow-orchestrator-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/workflows.invoker"
```

---

## Step 3: Firestore Setup (15 minutes)

### 3.1 Create Firestore Database
```bash
# Create Firestore in Native mode
gcloud firestore databases create --region=$REGION
```

### 3.2 Deploy Security Rules
Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public workflow templates
    match /workflow_templates/{templateId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // User businesses
    match /businesses/{businessId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // User workflows
    match /user_workflows/{workflowId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 3.3 Deploy Indexes
Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "businesses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "vertical", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_workflows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

### 3.4 Seed Workflow Templates
```bash
# Run seed script
node scripts/seed-workflow-templates.js
```

---

## Step 4: Secret Manager (10 minutes)

### 4.1 Store API Keys
```bash
# Shopify
echo -n "YOUR_SHOPIFY_KEY" | gcloud secrets create shopify-api-key --data-file=-

# Stripe
echo -n "YOUR_STRIPE_KEY" | gcloud secrets create stripe-api-key --data-file=-

# Klaviyo
echo -n "YOUR_KLAVIYO_KEY" | gcloud secrets create klaviyo-api-key --data-file=-

# Gemini
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=-
```

### 4.2 Grant Access
```bash
for SECRET in shopify-api-key stripe-api-key klaviyo-api-key gemini-api-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:affiliate-flow-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

## Step 5: Deploy Cloud Functions (20 minutes)

### 5.1 Business Classifier Function
Create `functions/classifier/index.js`:
```javascript
const { Firestore } = require('@google-cloud/firestore');
const { classifyBusinessComplete } = require('./business-classifier');

const firestore = new Firestore();

exports.classifyBusiness = async (req, res) => {
  try {
    const { businessProfile } = req.body;
    
    // Run classification
    const result = classifyBusinessComplete(businessProfile);
    
    // Store result
    await firestore.collection('classifications').add({
      ...result,
      timestamp: new Date(),
      businessProfile: businessProfile,
    });
    
    res.json(result);
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

Deploy:
```bash
cd functions/classifier
gcloud functions deploy classifyBusiness \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=. \
  --entry-point=classifyBusiness \
  --trigger-http \
  --allow-unauthenticated=false \
  --service-account=affiliate-flow-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --timeout=540s
```

---

## Step 6: Deploy Next.js App (15 minutes)

### 6.1 Build for Production
```bash
cd client
npm run build
```

### 6.2 Deploy to Cloud Run
```bash
# Build container
gcloud builds submit --tag gcr.io/$PROJECT_ID/affiliate-flow-web

# Deploy to Cloud Run
gcloud run deploy affiliate-flow-web \
  --image gcr.io/$PROJECT_ID/affiliate-flow-web \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --service-account=affiliate-flow-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --memory=2Gi \
  --cpu=2 \
  --max-instances=10
```

### 6.3 Get URL
```bash
gcloud run services describe affiliate-flow-web \
  --region=$REGION \
  --format='value(status.url)'
```

---

## Step 7: Setup Pub/Sub & Cloud Tasks (10 minutes)

### 7.1 Create Topics
```bash
gcloud pubsub topics create business-classified
gcloud pubsub topics create workflow-triggered
gcloud pubsub topics create workflow-completed
```

### 7.2 Create Task Queues
```bash
gcloud tasks queues create api-requests \
  --max-dispatches-per-second=10

gcloud tasks queues create email-queue \
  --max-dispatches-per-second=100
```

---

## Step 8: Testing (30 minutes)

### 8.1 Test Onboarding Flow
1. Navigate to `/onboarding`
2. Complete all 5 steps
3. Verify classification confidence > 70%
4. Check Firestore for saved data

### 8.2 Test Classification
```bash
curl -X POST https://$REGION-$PROJECT_ID.cloudfunctions.net/classifyBusiness \
  -H "Content-Type: application/json" \
  -d '{
    "businessProfile": {
      "businessName": "Austin Plumbing Co",
      "industry": "residential plumbing services",
      "monthlyRevenue": "50k-100k",
      "teamSize": "2-5",
      "primaryGoal": "automate-follow-ups"
    }
  }'
```

Expected response:
```json
{
  "vertical": "tradeServices",
  "confidence": 96,
  "autoRoute": true,
  "requiresReview": false
}
```

### 8.3 Test Workflow Templates
```bash
# Query Firestore
gcloud firestore documents list workflow_templates
```

---

## Step 9: Monitoring & Alerts (15 minutes)

### 9.1 Create Dashboard
```bash
# Navigate to Cloud Console > Monitoring > Dashboards
# Create custom dashboard with:
# - Cloud Function invocations
# - Cloud Run request count
# - Firestore read/write ops
# - Classification confidence histogram
```

### 9.2 Setup Alerts
```bash
# Low classification confidence alert
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="Low Classification Confidence" \
  --condition-threshold-value=70 \
  --condition-threshold-comparison=COMPARISON_LT
```

---

## Step 10: Production Checklist ✅

### Pre-Launch
- [ ] All environment variables set
- [ ] Firestore security rules deployed
- [ ] Secret Manager configured
- [ ] Service accounts created with minimal permissions
- [ ] Cloud Functions deployed and tested
- [ ] Next.js app deployed to Cloud Run
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring dashboard created
- [ ] Alert policies configured

### Post-Launch
- [ ] Test onboarding flow end-to-end
- [ ] Verify all 6 vertical templates load
- [ ] Test classification with 10+ sample businesses
- [ ] Monitor error rates (target: < 1%)
- [ ] Check latency (target: < 2s for onboarding)
- [ ] Review costs daily for first week
- [ ] Collect user feedback
- [ ] Iterate on classification accuracy

---

## Quick Reference

### Important URLs
- **Production App:** `https://affiliate-flow-web-HASH-uc.a.run.app`
- **Classifier Function:** `https://$REGION-$PROJECT_ID.cloudfunctions.net/classifyBusiness`
- **Cloud Console:** `https://console.cloud.google.com/`
- **Firebase Console:** `https://console.firebase.google.com/`

### Useful Commands
```bash
# View logs
gcloud logging read "resource.type=cloud_function" --limit=50

# Check function status
gcloud functions describe classifyBusiness --region=$REGION

# View Firestore data
gcloud firestore documents list businesses

# Check costs
gcloud billing projects describe $PROJECT_ID
```

### Support Resources
- GCP Documentation: https://cloud.google.com/docs
- Firebase Documentation: https://firebase.google.com/docs
- Next.js Documentation: https://nextjs.org/docs

---

## Estimated Deployment Time
- **Total Time:** 2-3 hours
- **Cost:** $0 (free tier covers initial deployment)
- **Monthly Operating Cost:** $50-100 (first 100 users)

---

## Next Steps After Deployment
1. Invite 10 beta users
2. Monitor classification accuracy
3. Collect feedback on onboarding
4. A/B test different workflows
5. Optimize conversion funnels
6. Scale to 100+ users
7. Launch public beta

---

*Last Updated: October 11, 2025*  
*Status: Ready for Production Deployment*  
*Estimated First User: < 4 hours from now!*
