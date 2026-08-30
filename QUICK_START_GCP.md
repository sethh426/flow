# ⚡ GCP Free Tier Quick Reference

## 🎯 Can We Do All 8 Phases? YES! (with smart substitutions)

### ✅ What We CAN Do (FREE or <$10/month)

| Phase | Original Plan | Free Tier Alternative | Cost |
|-------|--------------|----------------------|------|
| **Phase 1: Foundation** | GCP Project + APIs | ✅ Same | $0 |
| **Phase 2: Container** | GKE Autopilot ($73/mo) | ✅ Cloud Run | $0-5 |
| **Phase 3: Data Layer** | Firestore + BigQuery | ✅ Firestore + Firebase Analytics | $0 |
| **Phase 4: AI/ML** | Vertex AI ($$$$) | ✅ Gemini API Direct | $0-1 |
| **Phase 5: Integration** | Apigee ($150/mo) | ✅ Cloud Functions | $0 |
| **Phase 6: Security** | Cloud DLP ($$$) | ✅ Secret Manager + Cloud Armor | $0 |
| **Phase 7: Monitoring** | Same | ✅ Cloud Monitoring/Logging | $0 |
| **Phase 8: Deployment** | Cloud Deploy ($15/mo) | ✅ GitHub Actions | $0 |

**Total: $5-10/month** instead of $300+/month! 🎉

---

## 🚀 Quick Start (30 Minutes)

### Step 1: Run Setup Script (5 min)
```powershell
cd C:\Users\sethp\Downloads\Affiliate-Flow-Prototype
.\setup-gcp-free-tier.ps1
```

Creates:
- ✅ 4 service accounts
- ✅ 4 storage buckets
- ✅ 4 Cloud Tasks queues
- ✅ 4 Pub/Sub topics
- ✅ 3 Cloud Scheduler jobs
- ✅ 6 Secret Manager secrets
- ✅ Artifact Registry

### Step 2: Add Secrets (5 min)
```powershell
# Gemini API Key
echo "REDACTED_GOOGLE_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Firebase Config
gcloud secrets versions add FIREBASE_CONFIG --data-file=serviceAccountKey.json

# Generate webhook secret
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
echo $secret | gcloud secrets versions add WEBHOOK_SECRET --data-file=-
```

### Step 3: Deploy Image Generator (10 min)
```powershell
cd services\image-generator
gcloud run deploy image-generator `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated
```

### Step 4: Initialize Firestore (5 min)
1. Go to: https://console.firebase.google.com/project/affiliateflow-abzfy/firestore
2. Create collections: `users`, `brands`, `campaigns`, `content`, `analytics`, `conversations`

### Step 5: Test Everything (5 min)
```powershell
# Test Cloud Scheduler
gcloud scheduler jobs run daily-trend-discovery --location=us-central1

# Test website
Start-Process https://affiliateflow-abzfy.web.app

# Test FlowBot AI
# Click purple chat icon, ask: "What can you help me with?"
```

---

## 💰 Free Tier Limits (Don't Exceed These!)

| Service | Free Limit | Our Usage | Status |
|---------|-----------|-----------|--------|
| Cloud Run | 2M requests/month | ~100K | ✅ Safe |
| Firestore Reads | 50K/day | ~10K | ✅ Safe |
| Firestore Writes | 20K/day | ~5K | ✅ Safe |
| Storage | 5GB | ~1GB | ✅ Safe |
| Cloud Functions | 2M invocations | ~50K | ✅ Safe |
| Cloud Tasks | 1M tasks/month | ~50K | ✅ Safe |
| Cloud Scheduler | 3 jobs FREE | 3 jobs | ✅ At limit |
| Secret Manager | 6 secrets FREE | 6 secrets | ✅ At limit |
| Gemini API | 60 req/min | ~20 req/min | ✅ Safe |

---

## 🔥 What We're NOT Doing (Too Expensive)

### ❌ AVOID These Services:
- **GKE/Kubernetes**: $73/month minimum → Use Cloud Run instead
- **Vertex AI Training**: $$$$ → Use Gemini API directly
- **Apigee**: $150/month → Use Cloud Functions
- **Dataflow Streaming**: $$$ → Use Pub/Sub + Functions
- **Cloud DLP**: $$$ → Use client-side validation
- **Cloud Deploy**: $15/target → Use GitHub Actions
- **Cloud NAT**: $45/month → Let Cloud Run handle it
- **Load Balancer**: $18/month → Use Firebase Hosting CDN

---

## 📊 Current Infrastructure Status

### ✅ Already Deployed
- Firebase Hosting (production site)
- Cloud Run: Flow Orchestrator
- Gemini API integration
- FlowBot AI working
- Dashboard enhanced

### 🔄 Ready to Deploy
- Image Generator service (Python)
- Cloud Functions for webhooks
- Firestore collections
- Cloud Scheduler jobs

### 📋 Not Started
- Advanced analytics
- User authentication
- Payment processing
- Affiliate network integrations

---

## 🎯 Priority Actions (Next 1 Hour)

1. **Run `setup-gcp-free-tier.ps1`** ← DO THIS FIRST
2. Add secret values (Gemini API key, Firebase config)
3. Deploy Image Generator service
4. Initialize Firestore collections
5. Test Cloud Scheduler jobs
6. Verify monitoring dashboards

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `FREE_TIER_STRATEGY.md` | Complete strategy and architecture |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step implementation (all 8 phases) |
| `setup-gcp-free-tier.ps1` | Automated GCP setup script |
| `terraform/main.tf` | Infrastructure as Code |
| `terraform/README.md` | Terraform usage guide |

---

## 🆘 Troubleshooting

### "API not enabled"
```powershell
gcloud services enable [SERVICE_NAME].googleapis.com
```

### "Permission denied"
```powershell
gcloud auth login
gcloud config set project affiliateflow-abzfy
```

### "Already exists"
```powershell
# Resources might exist from manual creation - it's OK!
# Script handles this gracefully
```

### Check costs
https://console.cloud.google.com/billing

### View logs
```powershell
gcloud logging read --limit 50
```

---

## ✨ Summary

**WE CAN DO ALL 8 PHASES!**

But we use smart, cost-effective alternatives:
- Cloud Run instead of GKE ($0-5 vs $73)
- Gemini API instead of Vertex AI ($0-1 vs $$$)
- Cloud Functions instead of Apigee ($0 vs $150)
- GitHub Actions instead of Cloud Deploy ($0 vs $15)

**Total Cost: $5-10/month** for a production-ready affiliate marketing platform! 🚀

**Next Step:** Run `.\setup-gcp-free-tier.ps1`
