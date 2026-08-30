# Flow Orchestrator - Production Deployment Guide

## Overview
The Flow Orchestrator is deployed as a WebSocket server on Google Cloud Run, providing the backend "brain" for Flow's autonomous autopilot mode.

## Architecture
- **Service**: Cloud Run (managed, autoscaling)
- **Protocol**: WebSocket over HTTP/2
- **Port**: 8080 (required by Cloud Run)
- **Health Check**: `/health` endpoint
- **WebSocket Path**: `/flow-autopilot`

## Deployment

### Prerequisites
1. Google Cloud SDK installed
2. Authenticated with GCP: `gcloud auth login`
3. Project set: `gcloud config set project affiliateflow-abzfy`

### Deploy to Production
```powershell
cd services\flow-orchestrator
.\deploy.ps1
```

This will:
1. Enable required GCP APIs
2. Build Docker image using Cloud Build
3. Deploy to Cloud Run with WebSocket support
4. Set environment variables (GEMINI_API_KEY)
5. Output the production WebSocket URL

### Manual Deployment
```bash
# Build image
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
  --set-env-vars GEMINI_API_KEY=your_key,NODE_ENV=production
```

## Environment Variables
- `GEMINI_API_KEY` - Google AI API key for Genkit
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (production/development)

## Frontend Configuration
Update the WebSocket URL in `client/src/components/FlowAutopilot.tsx`:

```typescript
// Local development
const ws = new WebSocket('ws://localhost:8080/flow-autopilot');

// Production
const ws = new WebSocket('wss://flow-orchestrator-xxxxx-uc.a.run.app/flow-autopilot');
```

## Monitoring

### Health Check
```bash
curl https://flow-orchestrator-xxxxx-uc.a.run.app/health
```

### Logs
```bash
gcloud run logs read flow-orchestrator --region us-central1 --limit 50
```

### Metrics
View in Cloud Console:
https://console.cloud.google.com/run/detail/us-central1/flow-orchestrator/metrics

## Scaling
- **Min Instances**: 0 (scales to zero when idle)
- **Max Instances**: 10
- **Memory**: 512Mi
- **CPU**: 1 vCPU
- **Timeout**: 3600s (1 hour for long WebSocket connections)

## Cost Estimation
- **Idle**: $0 (scales to zero)
- **Active**: ~$0.0003/hour per instance
- **Requests**: First 2 million free
- **Estimated**: <$5/month for typical usage

## Security
- CORS enabled for `affiliateflow-abzfy.web.app`
- WebSocket authentication via connection tokens (future)
- Environment variables stored in Cloud Run secrets

## Troubleshooting

### WebSocket Connection Fails
1. Check Cloud Run logs for errors
2. Verify GEMINI_API_KEY is set
3. Test health endpoint
4. Check CORS headers

### High Latency
1. Consider increasing CPU allocation
2. Set min-instances > 0 to avoid cold starts
3. Use Cloud Run in same region as frontend

### Deployment Fails
1. Check Cloud Build logs
2. Verify Dockerfile syntax
3. Ensure all dependencies in package.json
4. Check GCP quotas and billing

## Local Development
```bash
cd services/flow-orchestrator
npm install
PORT=8080 GEMINI_API_KEY=your_key npm start
```

Access at: http://localhost:8080
WebSocket: ws://localhost:8080/flow-autopilot

## Updates
To update the deployed service:
```bash
# Make code changes
cd services/flow-orchestrator

# Redeploy
./deploy.ps1
```

Changes deploy in ~2-3 minutes.
