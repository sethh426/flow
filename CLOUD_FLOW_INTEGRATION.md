# 🚀 FlowBot Cloud Integration Guide

## Overview

This guide explains how to migrate your current FlowBot from local Gemini API calls to a **production-ready Vertex AI + GKE architecture**.

---

## 🎯 **Current vs. Cloud Architecture**

### **Current Setup (Local)**
```
User → Next.js API Route → Gemini API → Response
```

**Limitations:**
- ❌ No scalability
- ❌ API rate limits
- ❌ Single point of failure
- ❌ No specialized workers
- ❌ Limited to Gemini Pro

### **Cloud Setup (Production)**
```
User → Next.js → Cloud Run Orchestrator → GKE Workers → Vertex AI Models → Response
                                      ↓
                                  BigQuery (Analytics)
                                      ↓
                                  Firestore (State)
```

**Benefits:**
- ✅ Auto-scaling (handle millions of requests)
- ✅ Specialized AI workers
- ✅ Multiple AI models (Gemini, PaLM, Imagen, Codey)
- ✅ Advanced analytics with BigQuery
- ✅ Production-grade reliability
- ✅ Cost-optimized

---

## 📋 **Quick Start (3 Options)**

### **Option 1: Cloud Run Only (Recommended for Start)**
**Cost:** ~$5-20/month  
**Setup Time:** 10 minutes

```bash
# Run the setup script
chmod +x setup_cloud_flow.sh
./setup_cloud_flow.sh

# Choose option 1 when prompted
# This deploys a simple Flow Orchestrator to Cloud Run
```

### **Option 2: Full GKE + Cloud Run**
**Cost:** ~$150-300/month  
**Setup Time:** 30 minutes

```bash
# Run the setup script
chmod +x setup_cloud_flow.sh
./setup_cloud_flow.sh

# Choose option 2 when prompted
# This deploys full architecture with specialized workers
```

### **Option 3: Manual Setup**
Follow the detailed steps in `VERTEX_AI_GKE_ARCHITECTURE.md`

---

## 🔧 **Integration Steps**

### **Step 1: Deploy Cloud Infrastructure**

```bash
# Make sure you're in the project root
cd c:\Users\sethp\Downloads\Affiliate-Flow-Prototype

# Run setup
./setup_cloud_flow.sh
```

### **Step 2: Update Environment Variables**

Add to `client/.env.local`:

```env
# Cloud Flow Configuration
FLOW_ORCHESTRATOR_URL=https://flow-orchestrator-xxx.run.app
ENABLE_CLOUD_FLOW=true

# Keep existing Gemini API key as fallback
NEXT_PUBLIC_GEMINI_API_KEY=your_existing_key
```

### **Step 3: Update FlowBot API Route**

Replace the contents of `client/src/app/api/flowbot/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { question, history, userId } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check if cloud flow is enabled
    const useCloudFlow = process.env.ENABLE_CLOUD_FLOW === 'true';
    const orchestratorUrl = process.env.FLOW_ORCHESTRATOR_URL;

    if (useCloudFlow && orchestratorUrl) {
      // Use Cloud Run orchestrator
      const response = await fetch(`${orchestratorUrl}/api/flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          history,
          userId: userId || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error('Cloud flow failed, falling back to local');
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Fallback to local Gemini API (existing code)
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // ... rest of your existing code ...
    
  } catch (error) {
    console.error('FlowBot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
```

### **Step 4: Test the Integration**

```bash
# Start your Next.js dev server
cd client
npm run dev

# Open http://localhost:3000
# Try FlowBot: "Find trending products in fashion"
```

---

## 🧪 **Testing Cloud Deployment**

### **Test Cloud Run Orchestrator Directly**

```bash
# Get your orchestrator URL from the setup output
ORCHESTRATOR_URL="https://flow-orchestrator-xxx.run.app"

# Test basic message
curl -X POST $ORCHESTRATOR_URL/api/flow \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, tell me what you can do",
    "userId": "test-user"
  }'

# Test trend finding
curl -X POST $ORCHESTRATOR_URL/api/flow \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find trending products in fashion",
    "userId": "test-user"
  }'

# Test content generation
curl -X POST $ORCHESTRATOR_URL/api/flow \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Generate an Instagram caption about summer fashion",
    "userId": "test-user"
  }'
```

---

## 📊 **Monitoring & Analytics**

### **View Logs**

```bash
# Cloud Run logs
gcloud run services logs read flow-orchestrator \
  --region=us-central1 \
  --limit=50

# GKE logs (if using GKE)
kubectl logs -n affiliateflow -l app=content-generator --tail=50
```

### **View Metrics**

```bash
# Check Cloud Run metrics
gcloud run services describe flow-orchestrator \
  --region=us-central1 \
  --format="table(status.traffic)"

# GKE cluster status
kubectl get all -n affiliateflow
```

### **Query BigQuery Analytics**

```sql
-- View trending products analysis
SELECT 
  category,
  product,
  AVG(score) as avg_score,
  COUNT(*) as mentions
FROM `affiliateflow-abzfy.trends.current`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY category, product
ORDER BY avg_score DESC
LIMIT 10;
```

---

## 💰 **Cost Management**

### **Estimated Monthly Costs**

| Deployment | Cost Range | Best For |
|-----------|-----------|----------|
| **Cloud Run Only** | $5-20 | Testing, low traffic |
| **Cloud Run + GKE (small)** | $50-100 | Growing startup |
| **Cloud Run + GKE (production)** | $150-300 | High traffic, full features |

### **Cost Optimization Tips**

1. **Start with Cloud Run only** - Add GKE when you need it
2. **Use preemptible nodes** - Save 60-80% on GKE costs
3. **Set autoscaling limits** - Prevent runaway costs
4. **Use caching** - Reduce API calls
5. **Monitor usage** - Set up budget alerts

```bash
# Set budget alert
gcloud billing budgets create \
  --billing-account=YOUR_BILLING_ACCOUNT \
  --display-name="AffiliateFlow Budget" \
  --budget-amount=300USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

---

## 🔄 **Rollback Plan**

If you need to rollback to local Gemini:

1. **Set environment variable:**
   ```env
   ENABLE_CLOUD_FLOW=false
   ```

2. **Restart Next.js:**
   ```bash
   npm run dev
   ```

3. **Your app will automatically use local Gemini API**

---

## 🚀 **Next Steps**

### **Immediate (After Setup)**
1. ✅ Deploy Flow Orchestrator to Cloud Run
2. ✅ Update environment variables
3. ✅ Test basic FlowBot functionality
4. ✅ Monitor initial requests

### **Week 1**
1. ⏳ Add specialized workers (content, trends, vision)
2. ⏳ Set up BigQuery analytics
3. ⏳ Configure autoscaling
4. ⏳ Add error monitoring

### **Month 1**
1. ⏳ Deploy to GKE for scaling
2. ⏳ Add advanced AI models (Imagen, Codey)
3. ⏳ Implement caching layer
4. ⏳ Set up CI/CD pipeline

---

## 🆘 **Troubleshooting**

### **"Cloud flow failed" error**
```bash
# Check if orchestrator is running
curl https://flow-orchestrator-xxx.run.app/health

# View logs
gcloud run services logs read flow-orchestrator --region=us-central1 --limit=50
```

### **"Vertex AI quota exceeded"**
```bash
# Check quota
gcloud services list --enabled | grep aiplatform

# Request quota increase
# Visit: https://console.cloud.google.com/iam-admin/quotas
```

### **High costs**
```bash
# Check what's running
gcloud run services list
kubectl get all -n affiliateflow

# Scale down or delete unused resources
gcloud run services delete UNUSED_SERVICE
```

---

## 📚 **Additional Resources**

- **Full Architecture:** `VERTEX_AI_GKE_ARCHITECTURE.md`
- **Setup Script:** `setup_cloud_flow.sh`
- **Vertex AI Docs:** https://cloud.google.com/vertex-ai/docs
- **GKE Docs:** https://cloud.google.com/kubernetes-engine/docs
- **Cloud Run Docs:** https://cloud.google.com/run/docs

---

## ✅ **Checklist**

Before going to production:

- [ ] Deployed Flow Orchestrator to Cloud Run
- [ ] Updated environment variables
- [ ] Tested FlowBot with cloud backend
- [ ] Set up monitoring and alerts
- [ ] Configured budget limits
- [ ] Tested rollback procedure
- [ ] Documented team onboarding
- [ ] Set up CI/CD (optional)
- [ ] Load tested (optional)
- [ ] Added custom domain (optional)

---

**Ready to deploy!** Run `./setup_cloud_flow.sh` to get started! 🚀
