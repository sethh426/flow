# 🚀 Phase-by-Phase Implementation Guide
# Practical steps to implement GCP infrastructure on FREE tier

## ✅ PHASE 1: Foundation Setup (10 minutes)

### Step 1.1: Verify Current Setup
```powershell
# Check current project
gcloud config get-value project
# Should show: affiliateflow-abzfy

# List enabled APIs
gcloud services list --enabled
```

**Already Done:**
- ✅ Project created: affiliateflow-abzfy
- ✅ 14+ APIs enabled
- ✅ Firebase Hosting configured
- ✅ Cloud Run service deployed

### Step 1.2: Run Automated Setup Script
```powershell
# Navigate to project root
cd C:\Users\sethp\Downloads\Affiliate-Flow-Prototype

# Run the free tier setup
.\setup-gcp-free-tier.ps1
```

**What this creates:**
- ✅ Service accounts (4)
- ✅ IAM roles configured
- ✅ Secret Manager placeholders (6)
- ✅ Storage buckets (4)
- ✅ Cloud Tasks queues (4)
- ✅ Pub/Sub topics (4)
- ✅ Cloud Scheduler jobs (3)

**Cost: $0** (all within free tier)

### Step 1.3: Add Secret Values
```powershell
# Add Gemini API key
echo "REDACTED_GOOGLE_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Add Firebase config (copy from Firebase Console)
gcloud secrets versions add FIREBASE_CONFIG --data-file=serviceAccountKey.json

# Generate webhook secret
$webhookSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
echo $webhookSecret | gcloud secrets versions add WEBHOOK_SECRET --data-file=-

# Generate admin API key
$adminKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
echo $adminKey | gcloud secrets versions add ADMIN_API_KEY --data-file=-
```

**Status:** Foundation Complete ✅

---

## ✅ PHASE 2: Container Infrastructure (Already Done!)

**What We Have:**
- ✅ Cloud Run: Flow Orchestrator deployed
- ✅ Container Registry: Images stored
- ✅ Automatic scaling: Scales to zero when idle

**Current Cost:** ~$3-5/month (within budget)

### What to Deploy Next:
```powershell
# Deploy Image Generator service
cd services\image-generator
gcloud run deploy image-generator `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --service-account affiliate-flow-image-gen@affiliateflow-abzfy.iam.gserviceaccount.com `
  --set-env-vars "GEMINI_API_KEY=REDACTED_GOOGLE_API_KEY"
```

**Estimated Additional Cost:** $1-2/month

---

## ✅ PHASE 3: Data Layer Setup (30 minutes)

### Step 3.1: Initialize Firestore Collections

**Option A: Use Firebase Console**
1. Go to: https://console.firebase.google.com/project/affiliateflow-abzfy/firestore
2. Create collections manually:
   - `users` - User profiles and settings
   - `brands` - Brand partnerships
   - `campaigns` - Marketing campaigns
   - `content` - Generated content
   - `analytics` - Performance metrics
   - `conversations` - FlowBot chat history

**Option B: Use Script** (Recommended)
```powershell
# Create Firestore initialization script
cd C:\Users\sethp\Downloads\Affiliate-Flow-Prototype
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Create initial collections with sample docs
async function initCollections() {
  // Users collection
  await db.collection('users').doc('_init').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'system'
  });
  
  // Brands collection
  await db.collection('brands').doc('_init').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'system'
  });
  
  // Campaigns collection
  await db.collection('campaigns').doc('_init').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'system'
  });
  
  // Content collection
  await db.collection('content').doc('_init').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'system'
  });
  
  // Analytics collection
  await db.collection('analytics').doc('_init').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'system'
  });
  
  // Conversations collection (for FlowBot)
  await db.collection('conversations').doc('_init').set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'system'
  });
  
  console.log('✅ Firestore collections initialized!');
  process.exit(0);
}

initCollections().catch(console.error);
"
```

### Step 3.2: Set Up Firestore Indexes

Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "content",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "campaigns",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "userId", "order": "ASCENDING"},
        {"fieldPath": "status", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "analytics",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "campaignId", "order": "ASCENDING"},
        {"fieldPath": "timestamp", "order": "DESCENDING"}
      ]
    }
  ]
}
```

Deploy indexes:
```powershell
firebase deploy --only firestore:indexes
```

**Cost: $0** (within free tier: 1GB storage, 50K reads/day)

---

## ✅ PHASE 4: AI Infrastructure (Already Done!)

**What We Have:**
- ✅ Gemini 1.5 Flash API integrated
- ✅ Direct API calls (no Vertex AI costs)
- ✅ Genkit SDK for flow orchestration
- ✅ FlowBot AI working

**Current AI Costs:** ~$0.01/day (within free tier: 60 req/min)

### What to Add:
```javascript
// services/master-ai-orchestrator/cost-tracker.js
const admin = require('firebase-admin');
const db = admin.firestore();

async function trackAICost(usage) {
  await db.collection('ai-costs').add({
    model: usage.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    estimatedCost: usage.inputTokens * 0.00000015 + usage.outputTokens * 0.0000006,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}
```

**Status:** AI infrastructure complete ✅

---

## ✅ PHASE 5: Integration & Automation (1 hour)

### Step 5.1: Create Webhook Handler

```javascript
// functions/webhooks/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.handleWebhook = functions.https.onRequest(async (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;
  
  // Validate webhook signature
  const signature = req.headers['x-webhook-signature'];
  if (signature !== secret) {
    return res.status(401).send('Unauthorized');
  }
  
  // Process webhook
  const event = req.body;
  
  // Store in Firestore
  await admin.firestore().collection('webhook-events').add({
    event: event,
    processedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Queue for processing
  // (handled by Cloud Tasks)
  
  res.status(200).send('OK');
});
```

Deploy:
```powershell
firebase deploy --only functions
```

**Cost:** $0 (within 2M invocations/month free tier)

### Step 5.2: Test Cloud Scheduler Jobs

```powershell
# Test trend discovery job
gcloud scheduler jobs run daily-trend-discovery --location=us-central1

# Test analytics job
gcloud scheduler jobs run weekly-analytics --location=us-central1

# Test cleanup job
gcloud scheduler jobs run daily-cleanup --location=us-central1

# View logs
gcloud logging read "resource.type=cloud_scheduler_job" --limit 20
```

### Step 5.3: Set Up Cloud Tasks

```javascript
// services/flow-orchestrator/task-enqueuer.js
const {CloudTasksClient} = require('@google-cloud/tasks');
const client = new CloudTasksClient();

async function enqueueContentGeneration(request) {
  const project = 'affiliateflow-abzfy';
  const queue = 'content-generation';
  const location = 'us-central1';
  const url = 'https://flow-orchestrator-292572827197.us-central1.run.app/tasks/content';
  
  const parent = client.queuePath(project, location, queue);
  
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: url,
      headers: {'Content-Type': 'application/json'},
      body: Buffer.from(JSON.stringify(request)).toString('base64'),
    },
  };
  
  const [response] = await client.createTask({parent, task});
  return response;
}
```

**Cost:** $0 (within 1M tasks/month free tier)

---

## ✅ PHASE 6: Security Implementation (30 minutes)

### Step 6.1: Configure Secret Manager Access

```powershell
# Grant service accounts access to secrets
gcloud secrets add-iam-policy-binding GEMINI_API_KEY `
  --member="serviceAccount:affiliate-flow-orchestrator@affiliateflow-abzfy.iam.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding FIREBASE_CONFIG `
  --member="serviceAccount:affiliate-flow-content-gen@affiliateflow-abzfy.iam.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor"
```

### Step 6.2: Enable Cloud Armor (DDoS Protection)

```powershell
# Create security policy
gcloud compute security-policies create affiliate-flow-security `
  --description "Security policy for Affiliate Flow"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 `
  --security-policy affiliate-flow-security `
  --expression "true" `
  --action "rate-based-ban" `
  --rate-limit-threshold-count 100 `
  --rate-limit-threshold-interval-sec 60 `
  --ban-duration-sec 600
```

**Cost:** $0 (within 1M requests/month free tier)

### Step 6.3: Configure Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Campaigns owned by user
    match /campaigns/{campaignId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Content owned by user
    match /content/{contentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Analytics - read only for owners
    match /analytics/{docId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow write: if false; // Only backend can write
    }
    
    // Public reads for brands
    match /brands/{brandId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

Deploy:
```powershell
firebase deploy --only firestore:rules
```

---

## ✅ PHASE 7: Monitoring Setup (20 minutes)

### Step 7.1: Create Monitoring Dashboard

Go to: https://console.cloud.google.com/monitoring/dashboards

Create dashboard with charts:
1. **Cloud Run Requests** (request count, latency)
2. **Firestore Operations** (reads, writes)
3. **Cloud Tasks** (enqueue rate, execution time)
4. **AI API Calls** (request count, token usage)
5. **Error Rate** (4xx, 5xx responses)

### Step 7.2: Set Up Alerts

```powershell
# Create alert for high error rate
gcloud alpha monitoring policies create `
  --notification-channels=CHANNEL_ID `
  --display-name="High Error Rate" `
  --condition-display-name="Error rate > 5%" `
  --condition-threshold-value=0.05 `
  --condition-threshold-duration=300s
```

### Step 7.3: Enable Structured Logging

```javascript
// services/flow-orchestrator/logger.js
const {Logging} = require('@google-cloud/logging');
const logging = new Logging();
const log = logging.log('affiliate-flow');

function logEvent(severity, message, metadata = {}) {
  const entry = log.entry(
    {
      resource: {type: 'cloud_run_revision'},
      severity: severity,
    },
    {
      message: message,
      ...metadata,
      timestamp: new Date().toISOString(),
    }
  );
  
  log.write(entry);
}
```

**Cost:** $0 (within 50GB/month free tier)

---

## ✅ PHASE 8: Launch Preparation (1 hour)

### Step 8.1: Run Full Test Suite

```powershell
# Test all services
cd client
npm run test

cd ../services/flow-orchestrator
npm test

cd ../image-generator
python test.py
```

### Step 8.2: Load Testing

```powershell
# Install Apache Bench
# Or use: https://loader.io (free tier: 10K clients/test)

# Test Flow Orchestrator
ab -n 1000 -c 10 https://flow-orchestrator-292572827197.us-central1.run.app/health

# Test Frontend
ab -n 1000 -c 10 https://affiliateflow-abzfy.web.app/
```

### Step 8.3: Backup Setup

```powershell
# Create automated Firestore backup
gcloud firestore operations list

# Schedule daily backups to Cloud Storage
gcloud scheduler jobs create http firestore-backup `
  --location=us-central1 `
  --schedule="0 3 * * *" `
  --uri="https://firestore.googleapis.com/v1/projects/affiliateflow-abzfy/databases/(default):exportDocuments" `
  --http-method=POST `
  --message-body='{"outputUriPrefix":"gs://affiliateflow-abzfy-backups"}'
```

### Step 8.4: Final Checklist

- [ ] All services deployed
- [ ] Secrets configured
- [ ] Firestore collections created
- [ ] Security rules deployed
- [ ] Monitoring dashboards created
- [ ] Alert policies configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] GitHub Actions configured

---

## 💰 Final Cost Estimate

| Service | Monthly Cost |
|---------|--------------|
| Cloud Run (2 services) | $3-5 |
| Firestore | $0 (free tier) |
| Cloud Storage | $0 (free tier) |
| Cloud Functions | $0 (free tier) |
| Cloud Tasks | $0 (free tier) |
| Cloud Scheduler | $0 (3 jobs free) |
| Secret Manager | $0 (6 secrets free) |
| Pub/Sub | $0 (free tier) |
| Monitoring | $0 (free tier) |
| **TOTAL** | **$3-5/month** ✅ |

## 🎯 Next Steps

1. **Run setup script:** `.\setup-gcp-free-tier.ps1`
2. **Add secret values** (Gemini API key, etc.)
3. **Deploy Image Generator** service
4. **Initialize Firestore** collections
5. **Test everything** end-to-end
6. **Launch!** 🚀

## 📚 Documentation

- [FREE_TIER_STRATEGY.md](./FREE_TIER_STRATEGY.md) - Full strategy
- [terraform/](./terraform/) - Infrastructure as Code
- [setup-gcp-free-tier.ps1](./setup-gcp-free-tier.ps1) - Automated setup

---

**Status:** Ready to implement! All phases mapped to FREE tier services. 🎉
