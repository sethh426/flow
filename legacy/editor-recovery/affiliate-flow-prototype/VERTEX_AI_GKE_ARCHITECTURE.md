# FlowBot Production Architecture
# Vertex AI + GKE + Cloud Run Implementation

## 🎯 **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                     AFFILIATEFLOW                            │
│                   (Next.js Frontend)                         │
│              http://localhost:3000                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ API Requests
               ▼
┌─────────────────────────────────────────────────────────────┐
│              FLOW ORCHESTRATOR                               │
│           (Cloud Run - Node.js)                              │
│                                                              │
│  • Request routing                                           │
│  • Action parsing                                            │
│  • State management                                          │
│  • Response formatting                                       │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├─────────────────┬──────────────────┬─────────┐
               ▼                 ▼                  ▼         ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────┐  ┌──────────┐
│   VERTEX AI      │  │   AI WORKERS     │  │ SERVICES │  │ DATABASE │
│                  │  │   (GKE Pods)     │  │          │  │          │
│ • Gemini Pro     │  │                  │  │ Vision   │  │ Firestore│
│ • PaLM 2         │  │ Content Gen      │  │ Product  │  │ BigQuery │
│ • Codey          │  │ Trend Finder     │  │ Workflow │  │ Redis    │
│ • Imagen 2       │  │ Image Gen        │  │ MCP      │  │          │
└──────────────────┘  │ Video Gen        │  └──────────┘  └──────────┘
                      │ Analytics        │
                      │ AB Testing       │
                      └──────────────────┘
```

---

## 📦 **Component Architecture**

### **1. Flow Orchestrator (Cloud Run)**
**Purpose:** Main entry point, routes requests to AI workers

```javascript
// services/flow-orchestrator/index.js
const express = require('express');
const { VertexAI } = require('@google-cloud/aiplatform');
const { Firestore } = require('@google-cloud/firestore');
const axios = require('axios');

const app = express();
app.use(express.json());

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: 'us-central1'
});

// Flow Orchestrator - Main Logic
app.post('/api/flow', async (req, res) => {
  const { message, history, userId } = req.body;
  
  try {
    // 1. Parse user intent with Vertex AI
    const intent = await parseIntent(message);
    
    // 2. Route to appropriate worker
    const result = await routeToWorker(intent, message, userId);
    
    // 3. Execute action if needed
    if (result.action) {
      const actionResult = await executeAction(result.action, userId);
      result.data = actionResult;
    }
    
    // 4. Format response
    const response = await formatResponse(result, message);
    
    res.json(response);
  } catch (error) {
    console.error('Flow error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse user intent using Vertex AI
async function parseIntent(message) {
  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40
    }
  });
  
  const prompt = `
Analyze this user message and extract:
1. Intent (navigate, create, search, analyze, etc.)
2. Entity (campaign, product, content, trend, etc.)
3. Parameters (name, category, date, etc.)

Message: "${message}"

Return JSON:
{
  "intent": "string",
  "entity": "string", 
  "params": {}
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response);
}

// Route to appropriate GKE worker
async function routeToWorker(intent, message, userId) {
  const workerMap = {
    'create_content': process.env.CONTENT_WORKER_URL,
    'find_trends': process.env.TREND_WORKER_URL,
    'analyze_image': process.env.VISION_WORKER_URL,
    'generate_image': process.env.IMAGE_GEN_WORKER_URL,
    'create_campaign': process.env.CAMPAIGN_WORKER_URL,
    'get_analytics': process.env.ANALYTICS_WORKER_URL
  };
  
  const workerUrl = workerMap[intent.intent];
  
  if (!workerUrl) {
    // Default to FlowBot conversational AI
    return await conversationalResponse(message, userId);
  }
  
  // Call specialized worker
  const response = await axios.post(workerUrl, {
    intent,
    message,
    userId
  });
  
  return response.data;
}

// Execute action commands
async function executeAction(action, userId) {
  const { type, parameters } = action;
  
  switch (type) {
    case 'navigate':
      return { redirect: `/dashboard/${parameters.page}` };
      
    case 'createCampaign':
      return await createCampaign(userId, parameters);
      
    case 'findTrends':
      return await findTrends(parameters.category);
      
    case 'searchProducts':
      return await searchProducts(parameters.query);
      
    case 'getAnalytics':
      return await getAnalytics(userId, parameters.period);
      
    default:
      return { message: 'Action not implemented' };
  }
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Flow Orchestrator running on port ${PORT}`);
});
```

---

### **2. GKE Workers (Kubernetes Pods)**

#### **Content Generation Worker**
```javascript
// k8s/workers/content-generator/index.js
const express = require('express');
const { VertexAI } = require('@google-cloud/aiplatform');

const app = express();
app.use(express.json());

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: 'us-central1'
});

app.post('/generate', async (req, res) => {
  const { type, platform, topic, tone } = req.body;
  
  try {
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro'
    });
    
    const prompt = buildContentPrompt(type, platform, topic, tone);
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    res.json({
      success: true,
      content,
      metadata: {
        platform,
        type,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function buildContentPrompt(type, platform, topic, tone) {
  return `Generate ${type} content for ${platform}.
Topic: ${topic}
Tone: ${tone}

Requirements:
- ${platform === 'instagram' ? 'Include 5-10 hashtags' : ''}
- ${platform === 'tiktok' ? 'Max 150 chars, hook in first 3 seconds' : ''}
- ${tone} tone throughout
- Include call-to-action
- Optimize for engagement

Return ONLY the content, no explanations.`;
}

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Content Generator Worker running on port ${PORT}`);
});
```

#### **Trend Finder Worker**
```javascript
// k8s/workers/trend-finder/index.js
const express = require('express');
const { VertexAI } = require('@google-cloud/aiplatform');
const { BigQuery } = require('@google-cloud/bigquery');
const axios = require('axios');

const app = express();
app.use(express.json());

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: 'us-central1'
});

const bigquery = new BigQuery();

app.post('/find-trends', async (req, res) => {
  const { category } = req.body;
  
  try {
    // 1. Query BigQuery for historical trend data
    const historicalTrends = await queryTrendHistory(category);
    
    // 2. Fetch real-time Google Trends data
    const googleTrends = await fetchGoogleTrends(category);
    
    // 3. Analyze with Vertex AI
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro'
    });
    
    const prompt = `Analyze these trends for ${category}:
    
Historical: ${JSON.stringify(historicalTrends)}
Current: ${JSON.stringify(googleTrends)}

Return top 5 trending products/topics with:
- Name
- Growth rate
- Search volume
- Opportunity score (1-10)
- Content angle suggestions

Format as JSON array.`;

    const result = await model.generateContent(prompt);
    const trends = JSON.parse(result.response.text());
    
    // 4. Store in BigQuery for future analysis
    await storeTrends(category, trends);
    
    res.json({
      success: true,
      trends,
      category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function queryTrendHistory(category) {
  const query = `
    SELECT product_name, avg(search_volume) as volume
    FROM \`${process.env.GCP_PROJECT_ID}.trends.historical\`
    WHERE category = @category
    AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    GROUP BY product_name
    ORDER BY volume DESC
    LIMIT 20
  `;
  
  const [rows] = await bigquery.query({
    query,
    params: { category }
  });
  
  return rows;
}

async function fetchGoogleTrends(category) {
  // Use Google Trends API or scraping service
  const response = await axios.get(
    `https://trends.google.com/trends/api/explore?category=${category}`
  );
  return response.data;
}

async function storeTrends(category, trends) {
  const dataset = bigquery.dataset('trends');
  const table = dataset.table('current');
  
  const rows = trends.map(trend => ({
    category,
    product: trend.name,
    growth_rate: trend.growth,
    volume: trend.volume,
    score: trend.score,
    timestamp: new Date().toISOString()
  }));
  
  await table.insert(rows);
}

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Trend Finder Worker running on port ${PORT}`);
});
```

---

### **3. Kubernetes Configuration**

#### **Deployment YAML**
```yaml
# k8s/deployments/flow-workers.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: content-generator
  namespace: affiliateflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: content-generator
  template:
    metadata:
      labels:
        app: content-generator
    spec:
      containers:
      - name: content-generator
        image: gcr.io/${PROJECT_ID}/content-generator:latest
        ports:
        - containerPort: 8081
        env:
        - name: GCP_PROJECT_ID
          value: "affiliateflow-abzfy"
        - name: VERTEX_AI_LOCATION
          value: "us-central1"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8081
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trend-finder
  namespace: affiliateflow
spec:
  replicas: 2
  selector:
    matchLabels:
      app: trend-finder
  template:
    metadata:
      labels:
        app: trend-finder
    spec:
      containers:
      - name: trend-finder
        image: gcr.io/${PROJECT_ID}/trend-finder:latest
        ports:
        - containerPort: 8082
        env:
        - name: GCP_PROJECT_ID
          value: "affiliateflow-abzfy"
        - name: BIGQUERY_DATASET
          value: "trends"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: image-generator
  namespace: affiliateflow
spec:
  replicas: 2
  selector:
    matchLabels:
      app: image-generator
  template:
    metadata:
      labels:
        app: image-generator
    spec:
      containers:
      - name: image-generator
        image: gcr.io/${PROJECT_ID}/image-generator:latest
        ports:
        - containerPort: 8083
        env:
        - name: GCP_PROJECT_ID
          value: "affiliateflow-abzfy"
        - name: VERTEX_AI_MODEL
          value: "imagegeneration@006"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

#### **Service YAML**
```yaml
# k8s/services/flow-services.yaml
apiVersion: v1
kind: Service
metadata:
  name: content-generator-service
  namespace: affiliateflow
spec:
  selector:
    app: content-generator
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8081
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: trend-finder-service
  namespace: affiliateflow
spec:
  selector:
    app: trend-finder
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8082
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: image-generator-service
  namespace: affiliateflow
spec:
  selector:
    app: image-generator
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8083
  type: ClusterIP
```

#### **Horizontal Pod Autoscaler**
```yaml
# k8s/autoscaling/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: content-generator-hpa
  namespace: affiliateflow
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: content-generator
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

### **4. Vertex AI Integration**

#### **Vertex AI Model Registry**
```javascript
// lib/vertex-ai-models.js
const { VertexAI } = require('@google-cloud/aiplatform');

class VertexAIModels {
  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID,
      location: 'us-central1'
    });
  }
  
  // Content Generation with Gemini Pro
  async generateContent(prompt, config = {}) {
    const model = this.vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: config.temperature || 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: config.maxTokens || 2048
      }
    });
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  
  // Image Generation with Imagen 2
  async generateImage(description, style = 'photorealistic') {
    const model = this.vertexAI.preview.getGenerativeModel({
      model: 'imagegeneration@006'
    });
    
    const request = {
      prompt: description,
      numberOfImages: 1,
      aspectRatio: '1:1',
      personGeneration: 'allow_adult',
      safetySetting: 'block_some',
      mode: style
    };
    
    const [response] = await model.predict(request);
    return response.images[0];
  }
  
  // Code Generation with Codey
  async generateCode(description, language = 'javascript') {
    const model = this.vertexAI.preview.getGenerativeModel({
      model: 'code-bison@002'
    });
    
    const prompt = `Generate ${language} code for: ${description}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
  
  // Embeddings for semantic search
  async createEmbedding(text) {
    const model = this.vertexAI.preview.getGenerativeModel({
      model: 'textembedding-gecko@003'
    });
    
    const result = await model.embedContent(text);
    return result.embeddings.values;
  }
}

module.exports = new VertexAIModels();
```

---

### **5. Deployment Scripts**

#### **Build & Deploy Script**
```bash
#!/bin/bash
# deploy-flow-workers.sh

set -e

PROJECT_ID="affiliateflow-abzfy"
REGION="us-central1"
CLUSTER_NAME="affiliateflow-cluster"

echo "🚀 Deploying FlowBot Workers to GKE..."

# 1. Build Docker images
echo "📦 Building Docker images..."
docker build -t gcr.io/${PROJECT_ID}/content-generator:latest ./k8s/workers/content-generator
docker build -t gcr.io/${PROJECT_ID}/trend-finder:latest ./k8s/workers/trend-finder
docker build -t gcr.io/${PROJECT_ID}/image-generator:latest ./k8s/workers/image-generator

# 2. Push to Container Registry
echo "☁️  Pushing to GCR..."
docker push gcr.io/${PROJECT_ID}/content-generator:latest
docker push gcr.io/${PROJECT_ID}/trend-finder:latest
docker push gcr.io/${PROJECT_ID}/image-generator:latest

# 3. Create GKE cluster (if not exists)
echo "🔧 Setting up GKE cluster..."
gcloud container clusters create ${CLUSTER_NAME} \
  --zone=${REGION}-a \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10 \
  --enable-autorepair \
  --enable-autoupgrade \
  || echo "Cluster already exists"

# 4. Get cluster credentials
gcloud container clusters get-credentials ${CLUSTER_NAME} --zone=${REGION}-a

# 5. Create namespace
kubectl create namespace affiliateflow || echo "Namespace exists"

# 6. Deploy workers
echo "🚢 Deploying workers..."
kubectl apply -f k8s/deployments/flow-workers.yaml
kubectl apply -f k8s/services/flow-services.yaml
kubectl apply -f k8s/autoscaling/hpa.yaml

# 7. Wait for deployments
echo "⏳ Waiting for deployments..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/content-generator -n affiliateflow
kubectl wait --for=condition=available --timeout=300s \
  deployment/trend-finder -n affiliateflow

# 8. Deploy Flow Orchestrator to Cloud Run
echo "☁️  Deploying Flow Orchestrator to Cloud Run..."
gcloud run deploy flow-orchestrator \
  --source ./services/flow-orchestrator \
  --region=${REGION} \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=${PROJECT_ID} \
  --set-env-vars CONTENT_WORKER_URL=http://content-generator-service.affiliateflow.svc.cluster.local \
  --set-env-vars TREND_WORKER_URL=http://trend-finder-service.affiliateflow.svc.cluster.local \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=10

echo "✅ Deployment complete!"
echo "📊 Check status: kubectl get all -n affiliateflow"
```

---

## 📊 **Cost Optimization**

### **Estimated Monthly Costs**

| Component | Configuration | Monthly Cost |
|-----------|--------------|--------------|
| **GKE Cluster** | 3 n1-standard-2 nodes | ~$150 |
| **Cloud Run** | Flow Orchestrator (2 CPU, 2GB) | ~$30 |
| **Vertex AI** | Gemini Pro API calls (100K/month) | ~$35 |
| **BigQuery** | 1TB storage + 1TB queries | ~$25 |
| **Cloud Storage** | 500GB images/assets | ~$10 |
| **Load Balancer** | HTTP(S) Load Balancer | ~$20 |
| **Total** | | **~$270/month** |

### **Optimization Strategies**

1. **Preemptible Nodes** - Save 60-80% on GKE costs
2. **Autoscaling** - Scale down during off-peak hours
3. **Caching** - Redis for frequently accessed data
4. **Batch Processing** - Process multiple requests together

---

## 🚀 **Quick Start**

```bash
# 1. Enable GCP APIs
gcloud services enable \
  aiplatform.googleapis.com \
  container.googleapis.com \
  run.googleapis.com \
  bigquery.googleapis.com

# 2. Set project
gcloud config set project affiliateflow-abzfy

# 3. Deploy everything
./deploy-flow-workers.sh

# 4. Update Next.js to use orchestrator
# In client/.env.local:
FLOW_ORCHESTRATOR_URL=https://flow-orchestrator-xxx.run.app
```

---

## 📝 **Testing**

```bash
# Test Flow Orchestrator
curl -X POST https://flow-orchestrator-xxx.run.app/api/flow \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find trending products in fashion",
    "userId": "test-user-123"
  }'

# Test Content Generator directly
kubectl port-forward -n affiliateflow \
  svc/content-generator-service 8081:80

curl -X POST http://localhost:8081/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "caption",
    "platform": "instagram",
    "topic": "summer fashion",
    "tone": "casual"
  }'
```

---

This architecture gives you:
✅ **Scalability** - Handle millions of requests
✅ **Reliability** - Auto-healing, auto-scaling
✅ **Performance** - Specialized workers for each task
✅ **Cost-effective** - Pay only for what you use
✅ **Production-ready** - Enterprise-grade infrastructure

Want me to implement any specific component first? 🚀
