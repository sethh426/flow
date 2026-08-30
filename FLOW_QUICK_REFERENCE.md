# FlowBot Cloud Architecture - Quick Reference

## 🎯 **Architecture Layers**

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1: Frontend (Next.js)                        │
│  • User interface                                   │
│  • FlowBot chat component                           │
│  • API route: /api/flowbot                          │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  LAYER 2: Flow Orchestrator (Cloud Run)             │
│  • Request routing                                  │
│  • Intent parsing with Vertex AI                    │
│  • Worker coordination                              │
│  • Response formatting                              │
└──────────────┬──────────────────────────────────────┘
               │
               ├────────┬────────┬────────┬────────┐
               ▼        ▼        ▼        ▼        ▼
┌──────────────────────────────────────────────────────┐
│  LAYER 3: AI Workers (GKE Pods)                      │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Content    │  │   Trend     │  │   Image     │ │
│  │  Generator  │  │   Finder    │  │  Generator  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Analytics  │  │   Vision    │  │   Product   │ │
│  │   Worker    │  │  Analyzer   │  │   Search    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  LAYER 4: AI Models (Vertex AI)                      │
│  • Gemini Pro (text generation)                      │
│  • Imagen 2 (image generation)                       │
│  • Codey (code generation)                           │
│  • PaLM 2 (embeddings)                               │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────┐
│  LAYER 5: Data Layer                                 │
│  • BigQuery (analytics)                              │
│  • Firestore (state/user data)                       │
│  • Cloud Storage (media)                             │
│  • Redis (caching)                                   │
└──────────────────────────────────────────────────────┘
```

---

## 📝 **Key Components**

### **1. Flow Orchestrator** (Cloud Run)
- **Purpose:** Main entry point, routes to workers
- **Language:** Node.js/Express
- **Port:** 8080
- **Scaling:** 0-10 instances
- **Cost:** ~$5-30/month

### **2. Content Generator** (GKE)
- **Purpose:** AI content creation
- **Model:** Gemini Pro
- **Replicas:** 2-10 (auto-scaled)
- **Cost:** ~$50-150/month

### **3. Trend Finder** (GKE)
- **Purpose:** Find trending products
- **Data:** BigQuery + Google Trends
- **Replicas:** 1-5
- **Cost:** ~$30-100/month

### **4. Image Generator** (GKE)
- **Purpose:** AI image creation
- **Model:** Imagen 2
- **Replicas:** 1-5
- **Cost:** ~$40-120/month

---

## 🚀 **Deployment Commands**

```bash
# Quick deploy (Cloud Run only)
./setup_cloud_flow.sh

# Full deploy (GKE + Cloud Run)
./deploy-full-stack.sh

# Deploy single worker
kubectl apply -f k8s/workers/content-generator.yaml

# Scale worker
kubectl scale deployment content-generator --replicas=5 -n affiliateflow

# View logs
kubectl logs -f -l app=content-generator -n affiliateflow

# Update orchestrator
gcloud run deploy flow-orchestrator --source ./services/flow-orchestrator
```

---

## 📊 **Monitoring Commands**

```bash
# Check all services
kubectl get all -n affiliateflow

# View resource usage
kubectl top pods -n affiliateflow

# Check Cloud Run status
gcloud run services list

# View logs
gcloud run services logs read flow-orchestrator --limit=100

# Check BigQuery jobs
bq ls -j --max_results=10
```

---

## 💰 **Cost Breakdown**

| Component | Base Cost | At Scale |
|-----------|-----------|----------|
| GKE Cluster (3 nodes) | $100/mo | $150/mo |
| Cloud Run Orchestrator | $5/mo | $30/mo |
| Vertex AI (Gemini) | $10/mo | $50/mo |
| Vertex AI (Imagen) | $15/mo | $80/mo |
| BigQuery | $5/mo | $25/mo |
| Load Balancer | $18/mo | $20/mo |
| Cloud Storage | $5/mo | $15/mo |
| **Total** | **$158/mo** | **$370/mo** |

---

## 🔧 **Configuration Files**

```
project/
├── k8s/
│   ├── deployments/
│   │   └── flow-workers.yaml       # Worker deployments
│   ├── services/
│   │   └── flow-services.yaml      # K8s services
│   └── autoscaling/
│       └── hpa.yaml                 # Horizontal pod autoscaler
│
├── services/
│   ├── flow-orchestrator/
│   │   ├── index.js                 # Main orchestrator
│   │   ├── package.json
│   │   └── Dockerfile
│   └── workers/
│       ├── content-generator/
│       ├── trend-finder/
│       └── image-generator/
│
└── docs/
    ├── VERTEX_AI_GKE_ARCHITECTURE.md
    ├── CLOUD_FLOW_INTEGRATION.md
    └── FLOW_QUICK_REFERENCE.md (this file)
```

---

## 🎯 **Common Tasks**

### **Add New Worker**
1. Create worker directory: `services/workers/my-worker/`
2. Add Dockerfile and code
3. Build: `docker build -t gcr.io/PROJECT/my-worker .`
4. Push: `docker push gcr.io/PROJECT/my-worker`
5. Deploy: `kubectl apply -f k8s/deployments/my-worker.yaml`

### **Update Worker**
1. Make code changes
2. Build new image: `docker build -t gcr.io/PROJECT/worker:v2 .`
3. Update deployment: `kubectl set image deployment/worker worker=gcr.io/PROJECT/worker:v2`

### **Scale Up/Down**
```bash
# Manual scaling
kubectl scale deployment content-generator --replicas=5

# Auto-scaling
kubectl autoscale deployment content-generator --min=2 --max=10 --cpu-percent=70
```

### **View Costs**
```bash
# GKE costs
gcloud billing budgets list

# Vertex AI usage
gcloud ai endpoints list

# BigQuery costs
bq ls -j --format=json | jq '.[] | .statistics.totalBytesProcessed'
```

---

## 🆘 **Emergency Procedures**

### **Service Down**
```bash
# Check status
kubectl get pods -n affiliateflow

# Restart service
kubectl rollout restart deployment/content-generator -n affiliateflow

# View logs
kubectl logs -l app=content-generator --tail=100 -n affiliateflow
```

### **High Costs**
```bash
# Check what's running
gcloud compute instances list
kubectl get deployments -n affiliateflow

# Scale down
kubectl scale deployment --all --replicas=1 -n affiliateflow

# Delete unused services
gcloud run services delete UNUSED_SERVICE
```

### **API Errors**
```bash
# Check orchestrator
curl https://flow-orchestrator-xxx.run.app/health

# View errors
gcloud run services logs read flow-orchestrator \
  --region=us-central1 \
  --limit=50 \
  | grep ERROR
```

---

## ✅ **Health Checks**

```bash
# All systems check
./health-check.sh

# Individual checks
curl https://flow-orchestrator-xxx.run.app/health
kubectl get pods -n affiliateflow -o wide
gcloud run services describe flow-orchestrator
```

---

## 📞 **Support Resources**

- **GCP Console:** https://console.cloud.google.com
- **Vertex AI:** https://console.cloud.google.com/vertex-ai
- **GKE Clusters:** https://console.cloud.google.com/kubernetes
- **Cloud Run:** https://console.cloud.google.com/run
- **BigQuery:** https://console.cloud.google.com/bigquery

---

## 🔑 **Environment Variables**

```env
# In Next.js (.env.local)
FLOW_ORCHESTRATOR_URL=https://flow-orchestrator-xxx.run.app
ENABLE_CLOUD_FLOW=true

# In Cloud Run (set via gcloud)
GCP_PROJECT_ID=affiliateflow-abzfy
CONTENT_WORKER_URL=http://content-generator-service.affiliateflow
TREND_WORKER_URL=http://trend-finder-service.affiliateflow
VERTEX_AI_LOCATION=us-central1

# In GKE Pods (via ConfigMap)
GEMINI_MODEL=gemini-pro
IMAGEN_MODEL=imagegeneration@006
BIGQUERY_DATASET=trends
```

---

**Quick Start:** `./setup_cloud_flow.sh` 🚀
