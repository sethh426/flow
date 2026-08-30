#!/bin/bash
# Quick Setup Script for Vertex AI + GKE FlowBot
# Run this to deploy FlowBot to Google Cloud

set -e

PROJECT_ID="affiliateflow-abzfy"
REGION="us-central1"
CLUSTER_NAME="affiliateflow-cluster"

echo "🚀 FlowBot Cloud Setup"
echo "====================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Set project
echo "📌 Setting GCP project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
  aiplatform.googleapis.com \
  container.googleapis.com \
  run.googleapis.com \
  bigquery.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  --quiet

echo "✅ APIs enabled"
echo ""

# Create BigQuery dataset for trends
echo "📊 Creating BigQuery dataset..."
bq mk --dataset --location=US ${PROJECT_ID}:trends || echo "Dataset already exists"
bq mk --table ${PROJECT_ID}:trends.historical \
  product_name:STRING,category:STRING,search_volume:INTEGER,date:DATE \
  || echo "Table already exists"
bq mk --table ${PROJECT_ID}:trends.current \
  category:STRING,product:STRING,growth_rate:FLOAT,volume:INTEGER,score:INTEGER,timestamp:TIMESTAMP \
  || echo "Table already exists"

echo "✅ BigQuery setup complete"
echo ""

# Option: Create GKE cluster OR use Cloud Run only
echo "Choose deployment option:"
echo "1) Cloud Run only (simpler, cheaper)"
echo "2) GKE + Cloud Run (scalable, production)"
read -p "Enter choice (1 or 2): " CHOICE

if [ "$CHOICE" == "2" ]; then
  echo "🚢 Creating GKE cluster (this may take 5-10 minutes)..."
  gcloud container clusters create $CLUSTER_NAME \
    --zone=${REGION}-a \
    --num-nodes=2 \
    --machine-type=n1-standard-1 \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=5 \
    --enable-autorepair \
    --enable-autoupgrade \
    --preemptible \
    || echo "Cluster already exists"
  
  # Get credentials
  gcloud container clusters get-credentials $CLUSTER_NAME --zone=${REGION}-a
  
  # Create namespace
  kubectl create namespace affiliateflow || echo "Namespace exists"
  
  echo "✅ GKE cluster ready"
else
  echo "📦 Using Cloud Run only deployment"
fi

echo ""
echo "☁️  Deploying Flow Orchestrator to Cloud Run..."

# Deploy Flow Orchestrator
cd services/flow-orchestrator 2>/dev/null || {
  echo "Creating flow-orchestrator service..."
  mkdir -p services/flow-orchestrator
  
  # Create minimal orchestrator
  cat > services/flow-orchestrator/index.js << 'EOF'
const express = require('express');
const { VertexAI } = require('@google-cloud/aiplatform');
const app = express();
app.use(express.json());

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'affiliateflow-abzfy',
  location: 'us-central1'
});

app.post('/api/flow', async (req, res) => {
  const { message, userId } = req.body;
  
  try {
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-pro'
    });
    
    const result = await model.generateContent(message);
    const response = result.response.text();
    
    res.json({ 
      answer: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(\`Flow Orchestrator running on port \${PORT}\`);
});
EOF

  cat > services/flow-orchestrator/package.json << 'EOF'
{
  "name": "flow-orchestrator",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@google-cloud/aiplatform": "^3.0.0"
  }
}
EOF

  cat > services/flow-orchestrator/Dockerfile << 'EOF'
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
EOF

  cd services/flow-orchestrator
}

# Deploy to Cloud Run
gcloud run deploy flow-orchestrator \
  --source . \
  --region=$REGION \
  --allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=$PROJECT_ID \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --quiet

echo "✅ Flow Orchestrator deployed"
echo ""

# Get the URL
ORCHESTRATOR_URL=$(gcloud run services describe flow-orchestrator \
  --region=$REGION \
  --format='value(status.url)')

echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "🌐 Flow Orchestrator URL:"
echo "   $ORCHESTRATOR_URL"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Add to your .env.local:"
echo "   FLOW_ORCHESTRATOR_URL=$ORCHESTRATOR_URL"
echo ""
echo "2. Test the API:"
echo "   curl -X POST $ORCHESTRATOR_URL/api/flow \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Hello FlowBot\", \"userId\": \"test\"}'"
echo ""
echo "3. Update your Next.js FlowBot route to use this URL"
echo ""
echo "💰 Estimated cost: ~\$5-20/month (depending on usage)"
echo ""
echo "📚 Full docs: VERTEX_AI_GKE_ARCHITECTURE.md"
echo ""
