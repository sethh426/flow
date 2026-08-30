# 🚀 Quick Start Guide - Neural Orchestrator

This guide will get your AI Neural Orchestrator deployed and running in under 30 minutes.

## Prerequisites Checklist

- [ ] Google Cloud Platform account with billing enabled
- [ ] `gcloud` CLI installed ([Download](https://cloud.google.com/sdk/docs/install))
- [ ] `firebase` CLI installed: `npm install -g firebase-tools`
- [ ] Node.js 20+ installed ([Download](https://nodejs.org/))
- [ ] Anthropic API key ([Get one](https://console.anthropic.com/))
- [ ] OpenAI API key ([Get one](https://platform.openai.com/api-keys))

## 5-Minute Setup

### 1. Configure Environment

```powershell
# Navigate to the neural orchestrator directory
cd services/neural-orchestrator

# Copy environment template
Copy-Item .env.example .env

# Edit .env with your credentials
notepad .env
```

**Required values in `.env`:**
```env
GCP_PROJECT=your-project-id          # From GCP Console
ANTHROPIC_API_KEY=sk-ant-xxxxx       # From Anthropic Console
OPENAI_API_KEY=sk-xxxxx              # From OpenAI Platform
```

### 2. Authenticate

```powershell
# Login to GCP
gcloud auth login

# Login to Firebase
firebase login

# Set your GCP project
gcloud config set project YOUR_PROJECT_ID
```

### 3. Deploy

```powershell
# Run the deployment script (PowerShell)
.\deploy.ps1

# Or use bash if you have Git Bash/WSL
bash deploy.sh
```

The script will:
- ✅ Enable required GCP APIs (10 services)
- ✅ Create Pub/Sub topics (3 topics)
- ✅ Initialize Firestore database
- ✅ Store API keys in Secret Manager
- ✅ Deploy Firestore indexes and security rules
- ✅ Build TypeScript code
- ✅ Deploy 9 Cloud Functions

**Estimated time:** 5-10 minutes

## Verify Deployment

### Test Health Endpoint

```powershell
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/aiHealth
```

**Expected response:**
```json
{
  "success": true,
  "status": "healthy",
  "metrics": {
    "totalRequests": 0,
    "successRate": 1.0,
    ...
  }
}
```

### Test AI Route Endpoint

```powershell
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/aiRoute `
  -H "Content-Type: application/json" `
  -d '{
    "type": "creative",
    "complexity": "simple",
    "context": "Write a tagline for wireless headphones",
    "priority": "speed"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "text": "Untangle Your Sound - Wireless Freedom Awaits",
    "tokensUsed": 12,
    "model": "gemini-2.0-flash-exp",
    "latency": 450,
    "cost": 0.000003,
    "confidence": 0.95
  }
}
```

## Common Use Cases

### 1. Content Generation

```javascript
const response = await fetch('https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/aiGenerate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Write a product description for eco-friendly yoga mats',
    format: 'markdown',
    tone: 'professional',
    length: 'medium',
    priority: 'quality'
  })
});
```

### 2. Code Generation

```javascript
const response = await fetch('https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/aiCode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: 'Create a React hook for API data fetching with loading states',
    language: 'typescript',
    framework: 'react'
  })
});
```

### 3. Content Analysis

```javascript
const response = await fetch('https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/aiAnalyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Your blog post or content here...',
    analysisType: 'sentiment',
    priority: 'quality'
  })
});
```

### 4. Batch Processing

```javascript
const response = await fetch('https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/aiBatch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requests: [
      { type: 'creative', complexity: 'simple', context: 'Tagline for shoes', priority: 'speed' },
      { type: 'analytical', complexity: 'medium', context: 'Analyze market trends', priority: 'quality' },
      { type: 'coding', complexity: 'complex', context: 'Build a React component', priority: 'quality' }
    ]
  })
});
```

## Monitoring

### View Logs

```powershell
# All function logs
npm run logs

# Specific function
firebase functions:log --only aiRoute

# Real-time logs
gcloud logging tail "resource.type=cloud_function"
```

### Check Costs

```powershell
# View cost-related logs
gcloud logging read 'resource.type="cloud_function"' --limit 100 | Select-String "cost"

# Or check the health endpoint
curl https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/aiHealth
```

### Firestore Metrics

Navigate to Firestore in GCP Console and view:
- `model_performance` - Real-time performance per model
- `routing_decisions` - Historical routing logs
- `performance_aggregates` - Hourly aggregated stats

## Cost Optimization Tips

1. **Use Priority Wisely**
   - `speed`: Routes to cheapest models (Gemini Flash, Claude Haiku)
   - `quality`: Routes to best models (Claude Sonnet, GPT-4)
   - `cost`: Explicitly optimizes for lowest cost

2. **Set Appropriate Complexity**
   - `simple`: Uses faster, cheaper models
   - `medium`: Balanced routing
   - `complex`: Uses reasoning-heavy models

3. **Cache at Application Level**
   - The orchestrator caches for 1 hour internally
   - Add your own caching for repeated requests

4. **Use Batch Processing**
   - Process multiple requests together
   - Reduces overhead costs

5. **Monitor Daily Costs**
   ```powershell
   curl https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/aiHealth | jq '.metrics.totalCost'
   ```

## Troubleshooting

### "Permission Denied" Errors

```powershell
# Re-authenticate
gcloud auth login
gcloud auth application-default login

# Verify project
gcloud config get-value project
```

### "API Not Enabled" Errors

```powershell
# Re-run the deployment script
.\deploy.ps1

# Or manually enable
gcloud services enable aiplatform.googleapis.com cloudfunctions.googleapis.com
```

### TypeScript Build Errors

```powershell
# Clean install
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

### Function Deployment Fails

```powershell
# Check quotas
gcloud alpha billing quotas list --project=YOUR_PROJECT_ID

# Redeploy specific function
firebase deploy --only functions:aiRoute
```

## Next Steps

### 1. Integrate with Your Frontend

Create a client service:

```typescript
// src/services/ai-client.ts
export class AIClient {
  constructor(private baseUrl: string) {}

  async generate(prompt: string, options = {}) {
    const response = await fetch(`${this.baseUrl}/aiGenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, ...options })
    });
    return response.json();
  }

  async analyze(content: string, type = 'general') {
    const response = await fetch(`${this.baseUrl}/aiAnalyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, analysisType: type })
    });
    return response.json();
  }

  async code(task: string, language: string) {
    const response = await fetch(`${this.baseUrl}/aiCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, language })
    });
    return response.json();
  }
}

// Usage
const aiClient = new AIClient('https://us-central1-YOUR-PROJECT.cloudfunctions.net');
const result = await aiClient.generate('Write a product description');
```

### 2. Set Up Monitoring Dashboard

Create a Cloud Monitoring dashboard:

1. Go to GCP Console → Monitoring → Dashboards
2. Create new dashboard
3. Add charts for:
   - Request volume (Cloud Functions invocations)
   - Latency (Execution time)
   - Error rate (5xx responses)
   - Costs (custom metric from logs)

### 3. Configure Alerts

```powershell
# High error rate alert
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="AI Orchestrator High Error Rate" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s
```

## Support & Resources

- **Documentation**: See [README.md](README.md)
- **API Reference**: See "API Reference" section in README
- **GCP Console**: https://console.cloud.google.com
- **Firebase Console**: https://console.firebase.google.com
- **Cloud Logging**: GCP Console → Logging
- **Firestore**: GCP Console → Firestore

## Estimated Costs

### Development/Testing
- ~$5-10/month with light usage
- Free tier covers most development

### Production (1,000 requests/day)
- **AI Models**: ~$20-25/month
  - Gemini Flash: $0.175/day
  - Claude Haiku: $0.16/day
  - GPT-4o: $0.50/day
- **Cloud Functions**: ~$5/month
- **Firestore**: ~$1/month
- **Total**: ~$25-30/month

### Production (10,000 requests/day)
- **AI Models**: ~$200-250/month
- **Cloud Functions**: ~$15/month
- **Firestore**: ~$5/month
- **Total**: ~$220-270/month

Set budget alerts to avoid surprises!

---

**🎉 You're all set!** Your enterprise AI backend is now live and ready to power intelligent features in your application.
