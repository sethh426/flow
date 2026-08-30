# Flow Orchestrator - Backend Production Setup

## 🎯 Overview
This guide walks through deploying the Flow Orchestrator backend to Google Cloud Run, enabling Flow's autonomous autopilot mode in production.

## 📋 What We're Deploying

**Flow Orchestrator Backend:**
- WebSocket server for real-time AI agent control
- Genkit AI integration with Gemini 1.5 Flash
- Cloud Run deployment (autoscaling, WebSocket support)
- Health monitoring and logging

## 🚀 Quick Start

### 1. Test Locally First
```powershell
cd services\flow-orchestrator
.\test-local.ps1
```

This will:
- Create `.env` file with your Gemini API key
- Install dependencies
- Start server on `http://localhost:8080`
- WebSocket available at `ws://localhost:8080/flow-autopilot`

**Test the health endpoint:**
```powershell
Invoke-WebRequest http://localhost:8080/health
```

### 2. Deploy to Production

**Option A: Automated (PowerShell)**
```powershell
cd services\flow-orchestrator
.\deploy.ps1
```

**Option B: Manual (gcloud)**
```bash
# Build and push image
gcloud builds submit --tag gcr.io/affiliateflow-abzfy/flow-orchestrator

# Deploy to Cloud Run
gcloud run deploy flow-orchestrator \
  --image gcr.io/affiliateflow-abzfy/flow-orchestrator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --port 8080 \
  --timeout 3600 \
  --set-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### 3. Setup GitHub Secret for Auto-Deploy

Add `GEMINI_API_KEY` to GitHub Secrets:

1. Go to: https://github.com/luxcognita/affiliateflow-unified/settings/secrets/actions
2. Click "New repository secret"
3. Name: `GEMINI_API_KEY`
4. Value: Your Gemini API key from `client/.env.local`
5. Click "Add secret"

Now every push to `services/flow-orchestrator/` will auto-deploy!

### 4. Update Frontend Configuration

After deployment, you'll get a Cloud Run URL like:
```
https://flow-orchestrator-xxxxx-uc.a.run.app
```

**Update the frontend:**

1. Add to `client/.env.local`:
```env
NEXT_PUBLIC_FLOW_ORCHESTRATOR_WS=wss://flow-orchestrator-xxxxx-uc.a.run.app/flow-autopilot
```

2. Or update `client/src/components/FlowAutopilot.tsx` line 73:
```typescript
: 'wss://flow-orchestrator-YOUR-URL-HERE.a.run.app/flow-autopilot');
```

3. Rebuild and redeploy frontend:
```powershell
cd client
npm run build
firebase deploy --only hosting
```

## 🧪 Testing the Deployment

### Health Check
```bash
curl https://flow-orchestrator-xxxxx-uc.a.run.app/health
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

### WebSocket Connection Test
Create a test HTML file:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Flow Orchestrator Test</h1>
  <div id="status">Connecting...</div>
  <script>
    const ws = new WebSocket('wss://flow-orchestrator-xxxxx-uc.a.run.app/flow-autopilot');
    ws.onopen = () => document.getElementById('status').innerText = '✅ Connected!';
    ws.onerror = (e) => document.getElementById('status').innerText = '❌ Error: ' + e;
  </script>
</body>
</html>
```

### View Logs
```bash
gcloud run logs read flow-orchestrator --region us-central1 --limit 50
```

## 📊 Monitoring

### Cloud Console
- Service: https://console.cloud.google.com/run/detail/us-central1/flow-orchestrator
- Logs: https://console.cloud.google.com/logs/query
- Metrics: CPU, Memory, Request Count, Latency

### Key Metrics to Watch
- **Active Connections**: Number of WebSocket clients
- **CPU Usage**: Should be <50% under normal load
- **Memory**: Should stay under 400Mi
- **Request Latency**: <100ms for health checks
- **Cold Start Time**: 2-5 seconds

## 🔒 Security

### Current Setup
- ✅ GEMINI_API_KEY stored in Secret Manager
- ✅ Allow unauthenticated (public WebSocket endpoint)
- ⚠️  No WebSocket authentication (coming soon)

### Future Enhancements
- [ ] Add WebSocket connection tokens
- [ ] Implement CORS restrictions
- [ ] Rate limiting per client
- [ ] Request authentication middleware

## 💰 Cost Estimation

**Cloud Run Pricing:**
- CPU: $0.00002400/vCPU-second
- Memory: $0.00000250/GiB-second
- Requests: First 2M free, then $0.40/million

**Estimated Monthly Cost:**
- Low usage (few hours/day): <$1
- Medium usage (24/7 with 1-2 clients): $3-5
- High usage (24/7 with 10+ clients): $10-15

**Scaling to zero when idle = $0!**

## 🛠️ Troubleshooting

### Problem: WebSocket connection fails
**Check:**
1. Service deployed successfully: `gcloud run services list`
2. Logs for errors: `gcloud run logs read flow-orchestrator`
3. Health endpoint responds: `curl https://your-url/health`
4. Correct WebSocket URL (wss:// not https://)

### Problem: "GEMINI_API_KEY not found"
**Solution:**
```bash
# Create the secret
echo -n "YOUR_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Grant access
PROJECT_NUMBER=$(gcloud projects describe affiliateflow-abzfy --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Redeploy
./deploy.ps1
```

### Problem: High latency or cold starts
**Solutions:**
1. Set min-instances to 1: `--min-instances 1` (costs ~$5/month)
2. Increase CPU: `--cpu 2`
3. Use Cloud Run in same region as frontend

### Problem: GitHub Actions deployment fails
**Check:**
1. `GEMINI_API_KEY` secret exists in GitHub
2. Workload Identity Federation configured
3. Cloud Build API enabled
4. Service account has Cloud Run Admin role

## 📚 Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (Next.js on Firebase Hosting)     │
│  - FlowAutopilot.tsx component              │
│  - WebSocket client                         │
└────────────────┬────────────────────────────┘
                 │ wss://
                 │ WebSocket Connection
                 ▼
┌─────────────────────────────────────────────┐
│  Backend (Cloud Run)                        │
│  - Flow Orchestrator                        │
│  - WebSocket Server (port 8080)             │
│  - Health Check Endpoint                    │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Genkit AI (Gemini 1.5 Flash)        │  │
│  │  - Workflow planning                 │  │
│  │  - Command generation                │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🔄 Update Process

### Making Changes
1. Edit code in `services/flow-orchestrator/`
2. Test locally: `.\test-local.ps1`
3. Commit and push to GitHub
4. GitHub Actions auto-deploys to Cloud Run
5. Changes live in 2-3 minutes

### Manual Deploy
```powershell
cd services\flow-orchestrator
.\deploy.ps1
```

## ✅ Deployment Checklist

Before deploying:
- [ ] Test locally with `.\test-local.ps1`
- [ ] Health endpoint returns 200
- [ ] WebSocket connects successfully
- [ ] Gemini API key is valid
- [ ] All dependencies in package.json

After deploying:
- [ ] Health check passes
- [ ] WebSocket URL works
- [ ] Frontend .env updated
- [ ] Frontend rebuilt and deployed
- [ ] Test Flow autopilot in production
- [ ] Monitor logs for errors
- [ ] Check metrics in Cloud Console

## 🎓 Next Steps

1. **Test the full autopilot flow:**
   - Open production site
   - Enable Flow autopilot
   - Watch Flow fly around the UI

2. **Add authentication:**
   - Implement connection tokens
   - Add user session validation

3. **Enhance AI capabilities:**
   - More complex workflow planning
   - Multi-step task execution
   - Learning from user interactions

4. **Scale for production:**
   - Set min-instances for faster response
   - Add load balancing
   - Implement rate limiting

## 📞 Support

**Issues?**
- Check logs: `gcloud run logs read flow-orchestrator`
- View metrics: Cloud Console
- Test health: `curl https://your-url/health`

**Questions?**
See `DEPLOYMENT.md` for detailed documentation.
