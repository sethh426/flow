# Phase 3: Data Layer Setup

## Overview
Configure Firestore, BigQuery, and Cloud Tasks for data persistence and processing.

## 3.1 Firestore Setup

### Enable Firestore in Native Mode
```bash
PROJECT_ID="affiliate-flow-prod"

# Create Firestore database (Native mode)
gcloud firestore databases create \
  --location=us-central \
  --type=firestore-native

# Deploy Firestore rules
firebase deploy --only firestore:rules --project=$PROJECT_ID

# Deploy Firestore indexes
firebase deploy --only firestore:indexes --project=$PROJECT_ID
```

### Create Composite Indexes
```bash
# Create indexes for common queries
gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=userId,order=ASCENDING \
  --field-config=field-path=createdAt,order=DESCENDING

gcloud firestore indexes composite create \
  --collection-group=products \
  --field-config=field-path=status,order=ASCENDING \
  --field-config=field-path=createdAt,order=DESCENDING

gcloud firestore indexes composite create \
  --collection-group=userFlowCoins \
  --field-config=field-path=userId,order=ASCENDING \
  --field-config=field-path=timestamp,order=DESCENDING
```

## 3.2 BigQuery Setup

### Create Datasets
```bash
# Analytics dataset
bq mk \
  --dataset \
  --location=US \
  --description="Affiliate Flow analytics data" \
  ${PROJECT_ID}:affiliate_analytics

# Financial dataset
bq mk \
  --dataset \
  --location=US \
  --description="Financial and billing data" \
  ${PROJECT_ID}:affiliate_finance

# AI metrics dataset
bq mk \
  --dataset \
  --location=US \
  --description="AI performance and cost metrics" \
  ${PROJECT_ID}:ai_metrics
```

### Create Tables
```bash
# User activity table
bq mk \
  --table \
  ${PROJECT_ID}:affiliate_analytics.user_activity \
  user_id:STRING,event_type:STRING,event_timestamp:TIMESTAMP,session_id:STRING,page_url:STRING,metadata:JSON

# Product performance table
bq mk \
  --table \
  ${PROJECT_ID}:affiliate_analytics.product_performance \
  product_id:STRING,user_id:STRING,views:INTEGER,clicks:INTEGER,conversions:INTEGER,revenue:FLOAT,date:DATE

# Flow Coins transactions
bq mk \
  --table \
  ${PROJECT_ID}:affiliate_finance.flowcoins_transactions \
  transaction_id:STRING,user_id:STRING,amount:INTEGER,type:STRING,timestamp:TIMESTAMP,metadata:JSON

# AI generation metrics
bq mk \
  --table \
  ${PROJECT_ID}:ai_metrics.generation_stats \
  request_id:STRING,user_id:STRING,model:STRING,input_tokens:INTEGER,output_tokens:INTEGER,latency_ms:INTEGER,cost_usd:FLOAT,timestamp:TIMESTAMP
```

### Set Up Streaming Inserts
```bash
# Grant BigQuery Data Editor to service accounts
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-analytics@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"
```

## 3.3 Cloud Tasks Setup

### Create Task Queues
```bash
REGION="us-central1"

# AI processing queue
gcloud tasks queues create ai-processing-queue \
  --location=$REGION \
  --max-dispatches-per-second=100 \
  --max-concurrent-dispatches=50 \
  --max-attempts=5 \
  --min-backoff=10s \
  --max-backoff=300s

# Content generation queue
gcloud tasks queues create content-generation-queue \
  --location=$REGION \
  --max-dispatches-per-second=50 \
  --max-concurrent-dispatches=25 \
  --max-attempts=3 \
  --min-backoff=5s \
  --max-backoff=120s

# Product mapping queue
gcloud tasks queues create product-mapping-queue \
  --location=$REGION \
  --max-dispatches-per-second=200 \
  --max-concurrent-dispatches=100 \
  --max-attempts=5 \
  --min-backoff=5s \
  --max-backoff=180s

# Analytics processing queue
gcloud tasks queues create analytics-queue \
  --location=$REGION \
  --max-dispatches-per-second=500 \
  --max-concurrent-dispatches=200 \
  --max-attempts=3 \
  --min-backoff=2s \
  --max-backoff=60s
```

### Grant Task Queue Permissions
```bash
# Allow orchestrator to create tasks
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudtasks.enqueuer"

# Allow workers to process tasks
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-content-gen@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudtasks.taskRunner"
```

## 3.4 Cloud Storage Setup

### Create Storage Buckets
```bash
# User generated content
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-user-content

# AI generated images
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://${PROJECT_ID}-ai-images

# Backups
gsutil mb -p $PROJECT_ID -c NEARLINE -l $REGION gs://${PROJECT_ID}-backups

# Logs archive
gsutil mb -p $PROJECT_ID -c COLDLINE -l $REGION gs://${PROJECT_ID}-logs-archive
```

### Set Bucket Lifecycle Policies
```bash
# Auto-delete old backups after 90 days
cat > backup-lifecycle.json <<EOF
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

gsutil lifecycle set backup-lifecycle.json gs://${PROJECT_ID}-backups

# Archive logs older than 30 days
cat > logs-lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "SetStorageClass", "storageClass": "ARCHIVE"},
        "condition": {"age": 30}
      },
      {
        "action": {"type": "Delete"},
        "condition": {"age": 365}
      }
    ]
  }
}
EOF

gsutil lifecycle set logs-lifecycle.json gs://${PROJECT_ID}-logs-archive
```

## 3.5 Cloud Memorystore (Redis)

### Create Redis Instance for Caching
```bash
gcloud redis instances create affiliate-flow-cache \
  --size=5 \
  --region=$REGION \
  --redis-version=redis_7_0 \
  --tier=standard \
  --network=affiliate-flow-vpc \
  --enable-auth \
  --maintenance-window-day=sunday \
  --maintenance-window-hour=2
```

## Cost Estimation
- Firestore: ~$0.18 per GB stored + $0.06 per 100K reads
- BigQuery: ~$5/TB stored + $6.25/TB scanned
- Cloud Tasks: First 1M operations free, then $0.40 per million
- Cloud Storage: ~$0.02-0.12/GB depending on class
- Redis (5GB Standard): ~$170/month

Total Data Layer: ~$200-400/month (scales with usage)
