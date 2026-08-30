# GCP Integration Setup Guide

## Overview

This guide walks you through setting up comprehensive Google Cloud Platform (GCP) integration for AffiliateFlow.

## 🚀 Features Implemented

### 110 GCP Integration Features:

1. **Cloud Storage (15 features)**
   - File upload/download
   - Signed URLs
   - Lifecycle policies
   - Public/private access control
   - Resumable uploads

2. **BigQuery Analytics (15 features)**
   - SQL queries with pagination
   - Data insertion & streaming
   - Time-series analysis
   - Materialized views
   - Cost estimation

3. **Vertex AI / AI Platform (15 features)**
   - Model predictions
   - AutoML training
   - Text generation
   - Image generation
   - Embeddings

4. **Cloud Vision API (10 features)**
   - Label detection
   - Text recognition (OCR)
   - Face detection
   - Logo detection
   - Safe search

5. **Cloud Natural Language (10 features)**
   - Sentiment analysis
   - Entity extraction
   - Syntax analysis
   - Content classification
   - Text summarization

6. **Cloud Translation (10 features)**
   - Multi-language translation
   - Batch translation
   - Language detection
   - HTML translation
   - Custom glossaries

7. **Secret Manager (5 features)**
   - Secure secret storage
   - Version management
   - Access control
   - Secret rotation

8. **Cloud Pub/Sub (10 features)**
   - Message publishing
   - Batch messaging
   - Topic management
   - Subscriptions
   - Dead letter queues

9. **Cloud Run (10 features)**
   - Serverless deployment
   - Auto-scaling
   - Traffic splitting
   - Custom domains

10. **Cloud Functions (10 features)**
    - Event-driven functions
    - HTTP triggers
    - Background processing
    - Scheduled jobs

## 📋 Prerequisites

1. **Google Cloud Account**
   - Create account at https://cloud.google.com
   - Enable billing
   - $300 free credits for new users

2. **GCP Project**
   - Create new project: `affiliateflow-abzfy` (or your name)
   - Note your Project ID

3. **Enable Required APIs**
   ```bash
   gcloud services enable storage.googleapis.com
   gcloud services enable bigquery.googleapis.com
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable vision.googleapis.com
   gcloud services enable language.googleapis.com
   gcloud services enable translate.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable pubsub.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable cloudfunctions.googleapis.com
   ```

## 🔧 Installation Steps

### Step 1: Install GCloud CLI

**Windows:**
```powershell
# Download and install from:
# https://cloud.google.com/sdk/docs/install

# Or use PowerShell:
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

**macOS:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Step 2: Initialize GCloud

```bash
# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project affiliateflow-abzfy

# Set default region
gcloud config set compute/region us-central1
```

### Step 3: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create affiliateflow-sa \
    --display-name="AffiliateFlow Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding affiliateflow-abzfy \
    --member="serviceAccount:affiliateflow-sa@affiliateflow-abzfy.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding affiliateflow-abzfy \
    --member="serviceAccount:affiliateflow-sa@affiliateflow-abzfy.iam.gserviceaccount.com" \
    --role="roles/bigquery.admin"

gcloud projects add-iam-policy-binding affiliateflow-abzfy \
    --member="serviceAccount:affiliateflow-sa@affiliateflow-abzfy.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding affiliateflow-abzfy \
    --member="serviceAccount:affiliateflow-sa@affiliateflow-abzfy.iam.gserviceaccount.com" \
    --role="roles/cloudtranslate.user"

gcloud projects add-iam-policy-binding affiliateflow-abzfy \
    --member="serviceAccount:affiliateflow-sa@affiliateflow-abzfy.iam.gserviceaccount.com" \
    --role="roles/secretmanager.admin"

gcloud projects add-iam-policy-binding affiliateflow-abzfy \
    --member="serviceAccount:affiliateflow-sa@affiliateflow-abzfy.iam.gserviceaccount.com" \
    --role="roles/pubsub.admin"

# Create and download key
gcloud iam service-accounts keys create ~/affiliateflow-key.json \
    --iam-account=affiliateflow-sa@affiliateflow-abzfy.iam.gserviceaccount.com
```

### Step 4: Create Cloud Storage Bucket

```bash
# Create bucket
gsutil mb -l us-central1 gs://affiliateflow-storage

# Set CORS policy (for web uploads)
cat > cors.json << EOF
[
  {
    "origin": ["http://localhost:3000", "https://affiliateflow-abzfy.web.app"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://affiliateflow-storage

# Set lifecycle policy (auto-delete old files)
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://affiliateflow-storage
```

### Step 5: Create BigQuery Dataset

```bash
# Create dataset
bq mk -d \
    --location=US \
    affiliateflow_analytics

# Create tables
bq mk -t affiliateflow_analytics.user_events \
    event_id:STRING,user_id:STRING,event_type:STRING,timestamp:TIMESTAMP,properties:JSON

bq mk -t affiliateflow_analytics.products \
    product_id:STRING,name:STRING,price:FLOAT,category:STRING,created_at:TIMESTAMP

bq mk -t affiliateflow_analytics.campaigns \
    campaign_id:STRING,name:STRING,status:STRING,budget:FLOAT,created_at:TIMESTAMP

bq mk -t affiliateflow_analytics.conversions \
    conversion_id:STRING,campaign_id:STRING,product_id:STRING,revenue:FLOAT,timestamp:TIMESTAMP
```

### Step 6: Setup Pub/Sub Topics

```bash
# Create topics
gcloud pubsub topics create affiliate-events
gcloud pubsub topics create affiliate-analytics
gcloud pubsub topics create affiliate-notifications
gcloud pubsub topics create affiliate-conversions

# Create subscriptions
gcloud pubsub subscriptions create event-processor-sub \
    --topic=affiliate-events \
    --ack-deadline=60

gcloud pubsub subscriptions create analytics-aggregator-sub \
    --topic=affiliate-analytics \
    --ack-deadline=60

gcloud pubsub subscriptions create notification-handler-sub \
    --topic=affiliate-notifications \
    --ack-deadline=60
```

### Step 7: Configure Environment Variables

Create `.env.local` in your project root:

```bash
# GCP Configuration
NEXT_PUBLIC_GCP_PROJECT_ID=affiliateflow-abzfy
NEXT_PUBLIC_GCP_REGION=us-central1
NEXT_PUBLIC_GCP_BUCKET=affiliateflow-storage

# Service Account (Server-side only - DO NOT expose to client)
GCP_SERVICE_ACCOUNT_KEY=<paste-your-service-account-json-here>

# Or use key file path
GOOGLE_APPLICATION_CREDENTIALS=./affiliateflow-key.json

# BigQuery
BIGQUERY_DATASET=affiliateflow_analytics

# Pub/Sub
PUBSUB_TOPIC_EVENTS=affiliate-events
PUBSUB_TOPIC_ANALYTICS=affiliate-analytics
```

### Step 8: Install Dependencies

```bash
cd client

# Install GCP SDKs
npm install @google-cloud/storage
npm install @google-cloud/bigquery
npm install @google-cloud/aiplatform
npm install @google-cloud/vision
npm install @google-cloud/language
npm install @google-cloud/translate
npm install @google-cloud/secret-manager
npm install @google-cloud/pubsub
```

## 🧪 Testing the Integration

### Test Cloud Storage

```typescript
import { gcpService } from '@/services/gcpIntegrationService';

// Upload file
const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
const result = await gcpService.storage.uploadFile(file, 'uploads/test.txt', {
  makePublic: true
});

console.log('Uploaded:', result.publicUrl);

// List files
const files = await gcpService.storage.listFiles('uploads/');
console.log('Files:', files);
```

### Test BigQuery

```typescript
// Query data
const results = await gcpService.bigQuery.query(`
  SELECT product_id, name, COUNT(*) as views
  FROM \`affiliateflow_analytics.user_events\`
  WHERE event_type = 'product_view'
  GROUP BY product_id, name
  ORDER BY views DESC
  LIMIT 10
`);

console.log('Top products:', results);

// Insert data
await gcpService.bigQuery.insertRows('user_events', [
  {
    event_id: 'evt_123',
    user_id: 'user_456',
    event_type: 'product_view',
    timestamp: new Date().toISOString(),
    properties: { product_id: 'prod_789' }
  }
]);
```

### Test Vertex AI

```typescript
// Generate text
const response = await gcpService.vertexAI.generateText(
  'Write a product description for a wireless mouse',
  'text-bison',
  { temperature: 0.7, maxTokens: 200 }
);

console.log('Generated text:', response.text);

// Get embeddings
const embeddings = await gcpService.vertexAI.generateEmbeddings([
  'Product description 1',
  'Product description 2'
]);

console.log('Embeddings:', embeddings);
```

### Test Cloud Vision

```typescript
// Analyze image
const labels = await gcpService.vision.detectLabels(
  'https://example.com/product-image.jpg'
);

console.log('Image labels:', labels);

// OCR
const text = await gcpService.vision.detectText(
  'https://example.com/document.jpg'
);

console.log('Extracted text:', text.fullText);
```

### Test Translation

```typescript
// Translate text
const translations = await gcpService.translate.translate(
  'Hello, welcome to AffiliateFlow',
  'es' // Spanish
);

console.log('Translation:', translations[0].translatedText);

// Batch translate
const batchResults = await gcpService.translate.translateBatch(
  ['Hello', 'Goodbye', 'Thank you'],
  ['es', 'fr', 'de']
);

console.log('Batch translations:', batchResults);
```

### Test Pub/Sub

```typescript
// Publish message
const messageId = await gcpService.pubsub.publishMessage(
  'affiliate-events',
  {
    event: 'product_created',
    product_id: 'prod_123',
    timestamp: Date.now()
  }
);

console.log('Published message:', messageId);

// Pull messages
const messages = await gcpService.pubsub.pullMessages(
  'event-processor-sub',
  10
);

console.log('Received messages:', messages);

// Acknowledge
await gcpService.pubsub.acknowledgeMessages(
  'event-processor-sub',
  messages.map(m => m.ackId)
);
```

## 💰 Cost Optimization

### Free Tier Limits

1. **Cloud Storage**: 5GB/month
2. **BigQuery**: 1TB queries/month, 10GB storage
3. **Vertex AI**: Varies by model
4. **Cloud Vision**: 1,000 units/month
5. **Cloud Translation**: 500,000 characters/month
6. **Pub/Sub**: 10GB/month

### Best Practices

1. **Use Caching**: All services have built-in caching (see `costOptimization` in config)
2. **Batch Operations**: Use batch methods to reduce API calls
3. **Set Lifecycle Policies**: Auto-delete old data
4. **Monitor Usage**: Set up budget alerts
5. **Use Appropriate Regions**: Choose nearest region

### Cost Monitoring

```bash
# View current costs
gcloud billing accounts list
gcloud billing budgets list --billing-account=<ACCOUNT_ID>

# Set budget alert
gcloud billing budgets create \
    --billing-account=<ACCOUNT_ID> \
    --display-name="Monthly Budget" \
    --budget-amount=100 \
    --threshold-rule=percent=50 \
    --threshold-rule=percent=90
```

## 🔐 Security Best Practices

1. **Never commit service account keys** to git
2. **Use Secret Manager** for sensitive data
3. **Enable IAM roles** with least privilege
4. **Rotate keys regularly** (every 90 days)
5. **Enable audit logging**
6. **Use VPC Service Controls** for production

## 📊 Monitoring & Logging

```bash
# View logs
gcloud logging read "resource.type=gcs_bucket" --limit 10
gcloud logging read "resource.type=bigquery_project" --limit 10

# Create log-based metrics
gcloud logging metrics create api_errors \
    --description="Count of API errors" \
    --log-filter='severity>=ERROR'

# Set up alerts
gcloud alpha monitoring policies create \
    --notification-channels=<CHANNEL_ID> \
    --display-name="High Error Rate" \
    --condition-threshold-value=10
```

## 🚀 Deployment

### Deploy to Cloud Run

```bash
# Build container
gcloud builds submit --tag gcr.io/affiliateflow-abzfy/affiliateflow

# Deploy
gcloud run deploy affiliateflow \
    --image gcr.io/affiliateflow-abzfy/affiliateflow \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars="GCP_PROJECT_ID=affiliateflow-abzfy"
```

### Deploy Cloud Functions

```bash
# Deploy function
gcloud functions deploy processImage \
    --runtime nodejs20 \
    --trigger-http \
    --allow-unauthenticated \
    --entry-point processImage \
    --source ./functions
```

## 📚 Additional Resources

- [GCP Documentation](https://cloud.google.com/docs)
- [Cloud Storage Guide](https://cloud.google.com/storage/docs)
- [BigQuery Guide](https://cloud.google.com/bigquery/docs)
- [Vertex AI Guide](https://cloud.google.com/vertex-ai/docs)
- [Cloud Vision Guide](https://cloud.google.com/vision/docs)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

## 🆘 Troubleshooting

### Authentication Errors

```bash
# Re-authenticate
gcloud auth application-default login

# Check credentials
gcloud auth list
```

### API Not Enabled

```bash
# List enabled APIs
gcloud services list --enabled

# Enable missing API
gcloud services enable <SERVICE_NAME>
```

### Permission Errors

```bash
# Check IAM roles
gcloud projects get-iam-policy affiliateflow-abzfy

# Add missing role
gcloud projects add-iam-policy-binding affiliateflow-abzfy \
    --member="serviceAccount:..." \
    --role="roles/..."
```

## ✅ Next Steps

1. ✅ GCP integration services created (110 features)
2. ✅ Configuration files set up
3. ✅ API routes implemented
4. 🔄 Follow setup guide to enable GCP services
5. 🔄 Configure environment variables
6. 🔄 Test integrations
7. 🔄 Deploy to production

## 🎉 You're Ready!

Your AffiliateFlow platform now has comprehensive GCP integration with 110+ features for:
- File storage and management
- Advanced analytics
- AI/ML capabilities
- Image and text analysis
- Multi-language support
- Secure secrets management
- Event-driven architecture

Start building powerful affiliate marketing features with enterprise-grade infrastructure!
