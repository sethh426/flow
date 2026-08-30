# Flow Orchestrator Backend - Production Setup Complete! 🚀

## ✅ What We Just Built

### 1. **Cloud Run Deployment Infrastructure**
- ✅ Dockerfile for containerized deployment
- ✅ Health check endpoint (`/health`)
- ✅ HTTP server with WebSocket support
- ✅ Environment variable configuration
- ✅ Port 8080 (Cloud Run standard)

### 2. **Automated Deployment**
- ✅ `deploy.ps1` - PowerShell deployment script
- ✅ `test-local.ps1` - Local testing script
- ✅ GitHub Actions workflow (`.github/workflows/deploy-flow-orchestrator.yml`)
- ✅ Cloud Build configuration (`cloudbuild.yaml`)
- ✅ Auto-deploy on push to `services/flow-orchestrator/`

### 3. **Frontend Integration**
- ✅ Updated `FlowAutopilot.tsx` for production WebSocket
- ✅ Environment-aware URL configuration
- ✅ Fallback to localhost for development

### 4. **Documentation**
- ✅ `SETUP_GUIDE.md` - Complete setup walkthrough
- ✅ `DEPLOYMENT.md` - Technical deployment reference
- ✅ `.env.example` - Environment variable template
- ✅ Inline code comments

## 🎯 What's Ready to Deploy

**All files committed to GitHub (commit 1c67dff):**
```
✅ services/flow-orchestrator/Dockerfile
✅ services/flow-orchestrator/index.js (updated)
✅ services/flow-orchestrator/deploy.ps1
✅ services/flow-orchestrator/test-local.ps1
✅ services/flow-orchestrator/cloudbuild.yaml
✅ services/flow-orchestrator/SETUP_GUIDE.md
✅ services/flow-orchestrator/DEPLOYMENT.md
✅ .github/workflows/deploy-flow-orchestrator.yml
✅ client/src/components/FlowAutopilot.tsx (updated)
```

## 📋 Next Steps to Get Live

### Step 1: Add GitHub Secret ⚠️ REQUIRED
The GitHub Actions workflow needs the `GEMINI_API_KEY` secret:

```
1. Go to: https://github.com/luxcognita/affiliateflow-unified/settings/secrets/actions
2. Click "New repository secret"
3. Name: GEMINI_API_KEY
4. Value: REDACTED_GOOGLE_API_KEY
5. Click "Add secret"
```

### Step 2: Test Locally (Optional but Recommended)
```powershell
cd services\flow-orchestrator
.\test-local.ps1
```

This will:
- Create `.env` file automatically
- Install dependencies
- Start server on `http://localhost:8080`
- Test WebSocket at `ws://localhost:8080/flow-autopilot`

**Test the health endpoint:**
```powershell
Invoke-WebRequest http://localhost:8080/health
```

### Step 3: Deploy to Cloud Run

**Option A: Manual Deploy (Immediate)**
```powershell
cd services\flow-orchestrator
.\deploy.ps1
```

**Option B: Trigger GitHub Actions (Automatic)**
The workflow is already set up! Just make any small change to trigger it:
```powershell
# Make a small change to trigger deployment
cd services\flow-orchestrator
echo "# Trigger deploy" >> README.md
git add README.md
git commit -m "Trigger orchestrator deployment"
git push origin main
```

**Option C: Manual GitHub Actions Trigger**
1. Go to: https://github.com/luxcognita/affiliateflow-unified/actions/workflows/deploy-flow-orchestrator.yml
2. Click "Run workflow"
3. Select branch: `main`
4. Click "Run workflow"

### Step 4: Get the Cloud Run URL

After deployment completes, get your production URL:
```bash
gcloud run services describe flow-orchestrator --region us-central1 --format "value(status.url)"
```

You'll get something like:
```
https://flow-orchestrator-xxxxx-uc.a.run.app
```

### Step 5: Update Frontend Configuration

**Option A: Environment Variable (Recommended)**
Add to `client/.env.local`:
```env
NEXT_PUBLIC_FLOW_ORCHESTRATOR_WS=wss://flow-orchestrator-xxxxx-uc.a.run.app/flow-autopilot
```

**Option B: Hardcode in Component**
Update `client/src/components/FlowAutopilot.tsx` line 73:
```typescript
: 'wss://flow-orchestrator-YOUR-ACTUAL-URL.a.run.app/flow-autopilot');
```

### Step 6: Rebuild and Deploy Frontend
```powershell
cd client
npm run build
firebase deploy --only hosting
```

### Step 7: Test in Production! 🎉
1. Open https://affiliateflow-abzfy.web.app
2. Check browser console for: `🤖 Flow Autopilot connected to orchestrator`
3. Watch Flow fly around the UI!

## 🧪 Testing the Deployment

### Health Check
```powershell
Invoke-WebRequest https://flow-orchestrator-xxxxx-uc.a.run.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "clients": 0,
  "uptime": 123.45,
  "timestamp": "2025-10-11T..."
}
```

### View Logs
```bash
gcloud run logs read flow-orchestrator --region us-central1 --limit 50
```

### Monitor Metrics
Cloud Console: https://console.cloud.google.com/run/detail/us-central1/flow-orchestrator

## 🔍 Troubleshooting

### "GEMINI_API_KEY secret not found"
**Solution:** Add the secret to GitHub (Step 1 above)

### "Workload Identity Federation error"
**Solution:** The workflow uses existing WIF setup from Firebase deployment

### "WebSocket connection failed"
**Solutions:**
1. Check Cloud Run logs for errors
2. Verify service is deployed: `gcloud run services list`
3. Test health endpoint first
4. Ensure frontend has correct WebSocket URL (wss:// not ws://)

### "Build failed in GitHub Actions"
**Solutions:**
1. Check Docker build logs
2. Verify all dependencies in package.json
3. Ensure Dockerfile syntax is correct
4. Check Cloud Build API is enabled

## 💰 Cost Estimate

**Cloud Run Pricing:**
- Scales to zero when idle = $0
- Active usage: ~$0.0003/hour
- Estimated monthly: $3-5 for typical usage

**First deployment uses free tier credits!**

## 📊 Architecture Overview

```
┌──────────────────────────────────────────────┐
│  Production Frontend                         │
│  https://affiliateflow-abzfy.web.app         │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  FlowAutopilot Component               │ │
│  │  - Reads NEXT_PUBLIC_FLOW_ORCHESTRATOR │ │
│  │  - Connects via WebSocket              │ │
│  └────────────────────────────────────────┘ │
└─────────────────────┬────────────────────────┘
                      │ wss://
                      │ WebSocket Connection
                      ▼
┌──────────────────────────────────────────────┐
│  Cloud Run (us-central1)                     │
│  https://flow-orchestrator-xxxxx.a.run.app   │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Flow Orchestrator                     │ │
│  │  - Port 8080                           │ │
│  │  - Health: /health                     │ │
│  │  - WebSocket: /flow-autopilot          │ │
│  │                                        │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │  Genkit AI                       │ │ │
│  │  │  - Gemini 1.5 Flash              │ │ │
│  │  │  - Workflow planning             │ │ │
│  │  │  - Command generation            │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Environment Variables:                      │
│  - NODE_ENV=production                       │
│  - GEMINI_API_KEY (from Secret Manager)     │
└──────────────────────────────────────────────┘
```

## 🎓 What This Enables

1. **Autonomous Agent in Production**
   - Flow can fly around the UI
   - AI-powered workflow planning
   - Real-time command execution

2. **Scalable Backend**
   - Autoscales based on demand
   - Scales to zero when idle
   - WebSocket support for real-time

3. **Automated Deployments**
   - Push to GitHub → Auto-deploy
   - No manual intervention needed
   - Continuous delivery pipeline

## ✅ Deployment Checklist

Before deploying:
- [x] Dockerfile created
- [x] deploy.ps1 script created
- [x] GitHub Actions workflow configured
- [x] FlowAutopilot.tsx updated
- [x] Documentation written
- [ ] GEMINI_API_KEY added to GitHub Secrets ⚠️
- [ ] Test locally (optional)

After deploying:
- [ ] Health check passes
- [ ] WebSocket URL obtained
- [ ] Frontend .env updated
- [ ] Frontend rebuilt and deployed
- [ ] Test Flow autopilot in production
- [ ] Monitor logs for errors

## 🚀 Ready to Deploy!

Everything is set up and committed to GitHub. Just:

1. **Add GEMINI_API_KEY to GitHub Secrets** (5 minutes)
2. **Run `.\deploy.ps1`** or trigger GitHub Actions (2-3 minutes)
3. **Update frontend with WebSocket URL** (2 minutes)
4. **Rebuild and deploy frontend** (3 minutes)

**Total time: ~15 minutes to production! 🎉**

---

**Questions?** See `SETUP_GUIDE.md` for detailed walkthrough.
**Issues?** Check `DEPLOYMENT.md` for troubleshooting.
