#!/bin/bash

# ===================================================
# Neural Orchestrator - GCP Deployment Script
# ===================================================
# This script sets up the complete GCP infrastructure
# for the Neural Orchestrator AI backend
# ===================================================

set -e  # Exit on error

echo "🚀 Neural Orchestrator Deployment"
echo "=================================="
echo ""

# Check for required tools
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud CLI not installed. Visit: https://cloud.google.com/sdk/docs/install"; exit 1; }
command -v firebase >/dev/null 2>&1 || { echo "❌ Firebase CLI not installed. Run: npm install -g firebase-tools"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed. Visit: https://nodejs.org/"; exit 1; }

# Load environment variables
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  echo "📝 Copy .env.example to .env and configure:"
  echo "   cp .env.example .env"
  exit 1
fi

source .env

# Validate required environment variables
if [ -z "$GCP_PROJECT" ]; then
  echo "❌ GCP_PROJECT not set in .env"
  exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️  ANTHROPIC_API_KEY not set (Claude models will be unavailable)"
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "⚠️  OPENAI_API_KEY not set (GPT models will be unavailable)"
fi

echo "📋 Configuration:"
echo "   Project: $GCP_PROJECT"
echo "   Region: ${GCP_REGION:-us-central1}"
echo ""

# Set GCP project
echo "🔧 Setting GCP project..."
gcloud config set project $GCP_PROJECT

# Enable required APIs
echo "🔌 Enabling GCP APIs..."
gcloud services enable \
  aiplatform.googleapis.com \
  cloudfunctions.googleapis.com \
  firestore.googleapis.com \
  pubsub.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com

echo "✅ APIs enabled"

# Create Pub/Sub topics
echo "📡 Creating Pub/Sub topics..."

topics=("ai-routing-events" "ai-requests" "ai-responses")

for topic in "${topics[@]}"; do
  if gcloud pubsub topics describe $topic >/dev/null 2>&1; then
    echo "   ℹ️  Topic $topic already exists"
  else
    gcloud pubsub topics create $topic
    echo "   ✅ Created topic: $topic"
  fi
done

# Initialize Firestore (if not already done)
echo "🗄️  Checking Firestore..."
if gcloud firestore databases describe --database='(default)' >/dev/null 2>&1; then
  echo "   ✅ Firestore already initialized"
else
  echo "   📝 Initializing Firestore..."
  gcloud firestore databases create --region=${GCP_REGION:-us-central1}
  echo "   ✅ Firestore initialized"
fi

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes --project $GCP_PROJECT

# Deploy Firestore security rules
echo "🔐 Deploying Firestore security rules..."
firebase deploy --only firestore:rules --project $GCP_PROJECT

# Store API keys in Secret Manager
echo "🔑 Storing API keys in Secret Manager..."

if [ -n "$ANTHROPIC_API_KEY" ]; then
  if gcloud secrets describe anthropic-api-key >/dev/null 2>&1; then
    echo "   🔄 Updating anthropic-api-key..."
    echo -n "$ANTHROPIC_API_KEY" | gcloud secrets versions add anthropic-api-key --data-file=-
  else
    echo "   ✨ Creating anthropic-api-key..."
    echo -n "$ANTHROPIC_API_KEY" | gcloud secrets create anthropic-api-key --data-file=-
  fi
  echo "   ✅ Anthropic API key stored"
fi

if [ -n "$OPENAI_API_KEY" ]; then
  if gcloud secrets describe openai-api-key >/dev/null 2>&1; then
    echo "   🔄 Updating openai-api-key..."
    echo -n "$OPENAI_API_KEY" | gcloud secrets versions add openai-api-key --data-file=-
  else
    echo "   ✨ Creating openai-api-key..."
    echo -n "$OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=-
  fi
  echo "   ✅ OpenAI API key stored"
fi

# Grant Secret Manager access to Cloud Functions service account
echo "🔓 Granting Secret Manager access..."
PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

if [ -n "$ANTHROPIC_API_KEY" ]; then
  gcloud secrets add-iam-policy-binding anthropic-api-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet
fi

if [ -n "$OPENAI_API_KEY" ]; then
  gcloud secrets add-iam-policy-binding openai-api-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet
fi

echo "   ✅ Permissions granted"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "   ✅ Dependencies installed"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build
echo "   ✅ Build complete"

# Deploy Cloud Functions
echo "☁️  Deploying Cloud Functions..."
firebase deploy --only functions --project $GCP_PROJECT

echo ""
echo "✨ Deployment Complete!"
echo "=================================="
echo ""
echo "🎯 Endpoints:"
echo "   https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiRoute"
echo "   https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiAnalyze"
echo "   https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiGenerate"
echo "   https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiCode"
echo "   https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiBatch"
echo "   https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiHealth"
echo ""
echo "📊 Next Steps:"
echo "   1. Test health endpoint:"
echo "      curl https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiHealth"
echo ""
echo "   2. Make a test request:"
echo "      curl -X POST https://${GCP_REGION:-us-central1}-${GCP_PROJECT}.cloudfunctions.net/aiRoute \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"type\":\"creative\",\"complexity\":\"simple\",\"context\":\"Hello AI!\",\"priority\":\"speed\"}'"
echo ""
echo "   3. View logs:"
echo "      npm run logs"
echo ""
echo "   4. Monitor costs:"
echo "      gcloud logging read 'resource.type=\"cloud_function\"' --limit 50 | grep cost"
echo ""
echo "🎉 Your AI Neural Orchestrator is live!"
