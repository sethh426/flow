# Phase 4: AI Infrastructure Setup

## Overview
Configure Vertex AI, Gemini API, and AI orchestration infrastructure.

## 4.1 Vertex AI Setup

### Enable Vertex AI APIs
```bash
PROJECT_ID="affiliate-flow-prod"
REGION="us-central1"

# Already enabled in Phase 1, verify:
gcloud services list --enabled | grep aiplatform
```

### Create Vertex AI Endpoints

#### Deploy Gemini Models
```bash
# Configure Gemini Pro for content generation
gcloud ai endpoints create \
  --region=$REGION \
  --display-name="gemini-pro-content-generation"

# Note: Gemini models are accessed via API, not deployed endpoints
# The above is for custom model deployments if needed
```

### Set Up Model Monitoring
```bash
# Create monitoring job for AI quality metrics
gcloud ai model-monitoring-jobs create \
  --region=$REGION \
  --display-name="affiliate-flow-ai-monitoring" \
  --monitoring-config-from-file=monitoring-config.yaml
```

## 4.2 Secret Manager for API Keys

### Store Sensitive Credentials
```bash
# Gemini API Key
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Grant access to orchestrator
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:affiliate-flow-content-gen@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Nordstrom API credentials
echo -n "$NORDSTROM_API_KEY" | gcloud secrets create nordstrom-api-key \
  --data-file=- \
  --replication-policy="automatic"

gcloud secrets add-iam-policy-binding nordstrom-api-key \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Firebase Admin credentials
gcloud secrets create firebase-admin-sdk \
  --data-file=serviceAccountKey.json \
  --replication-policy="automatic"

gcloud secrets add-iam-policy-binding firebase-admin-sdk \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 4.3 AI Quota Management

### Set Up Quota Alerts
```bash
# Create quota alert for Vertex AI
gcloud alpha monitoring policies create \
  --notification-channels=$NOTIFICATION_CHANNEL_ID \
  --display-name="Vertex AI Quota Alert" \
  --condition-display-name="Vertex AI usage > 80%" \
  --condition-threshold-value=0.8 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="aiplatform.googleapis.com/Model" AND metric.type="aiplatform.googleapis.com/quota/allocation/usage"'
```

### Configure Rate Limiting
```bash
# Set quotas for Gemini API
gcloud alpha services quota update \
  --service=generativelanguage.googleapis.com \
  --consumer=projects/$PROJECT_ID \
  --metric=generativelanguage.googleapis.com/quota/generate_content_requests \
  --value=1000 \
  --unit=1/min/{project}
```

## 4.4 AI Cost Tracking

### Set Up BigQuery Cost Analysis
```bash
# Create view for AI cost tracking
bq mk \
  --use_legacy_sql=false \
  --view='
SELECT 
  DATE(timestamp) as date,
  model,
  COUNT(*) as total_requests,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(cost_usd) as total_cost,
  AVG(latency_ms) as avg_latency_ms
FROM `'${PROJECT_ID}'.ai_metrics.generation_stats`
GROUP BY date, model
ORDER BY date DESC, total_cost DESC
' \
  ${PROJECT_ID}:ai_metrics.daily_cost_summary
```

### Export Billing Data
```bash
# Enable billing export to BigQuery
gcloud billing accounts list

# Set billing export (replace BILLING_ACCOUNT_ID)
gcloud beta billing accounts set-iam-policy $BILLING_ACCOUNT_ID \
  --billing-export-dataset=${PROJECT_ID}:affiliate_finance.billing_export
```

## 4.5 AI Orchestration Services

### Deploy Master AI Orchestrator
See `kubernetes/manifests/master-ai-orchestrator.yaml`

Key features:
- Multi-model routing (Gemini Pro, Gemini Flash)
- Cost optimization
- Quality scoring
- Fallback strategies
- Rate limiting

### Deploy Content Generation Pipeline
```bash
# Cloud Function for content generation
gcloud functions deploy generateContent \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./services/ai-orchestrator \
  --entry-point=generateContent \
  --trigger-http \
  --allow-unauthenticated=false \
  --service-account=affiliate-flow-content-gen@${PROJECT_ID}.iam.gserviceaccount.com \
  --set-env-vars="PROJECT_ID=${PROJECT_ID},GEMINI_API_KEY_SECRET=gemini-api-key" \
  --memory=512MB \
  --timeout=300s \
  --min-instances=1 \
  --max-instances=100
```

## 4.6 AI Model Versioning

### Set Up Model Registry
```bash
# Create artifact repository for model versions
gcloud artifacts repositories create ai-models \
  --repository-format=python \
  --location=$REGION \
  --description="AI model versions and configs"
```

### Version Control for Prompts
```bash
# Store prompt templates in Firestore
# See: services/ai-orchestrator/prompt-templates/
```

## 4.7 AI Performance Monitoring

### Create Dashboards
```bash
# Cloud Monitoring dashboard for AI metrics
gcloud monitoring dashboards create --config-from-file=dashboards/ai-performance.json
```

### Set Up Alerts
```bash
# Alert on high AI costs
gcloud alpha monitoring policies create \
  --notification-channels=$NOTIFICATION_CHANNEL_ID \
  --display-name="High AI Cost Alert" \
  --condition-display-name="Daily AI cost > $100" \
  --condition-threshold-value=100 \
  --condition-threshold-duration=3600s \
  --condition-filter='resource.type="global" AND metric.type="custom.googleapis.com/ai/daily_cost"'

# Alert on high latency
gcloud alpha monitoring policies create \
  --notification-channels=$NOTIFICATION_CHANNEL_ID \
  --display-name="High AI Latency" \
  --condition-display-name="P95 latency > 5s" \
  --condition-threshold-value=5000 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_function" AND metric.type="cloudfunctions.googleapis.com/function/execution_times"'
```

## Cost Estimation

### AI Infrastructure Costs:
- Gemini Pro: $0.00025/1K chars input, $0.0005/1K chars output
- Gemini Flash: $0.000125/1K chars input, $0.00025/1K chars output
- Secret Manager: $0.06 per secret per month + $0.03 per 10K accesses
- Cloud Functions: $0.40 per million invocations + compute time
- Vertex AI Monitoring: ~$50/month

### Example Monthly AI Costs (10K users, 5 products/user/month):
- 50K content generations/month
- Avg 2000 input chars, 1000 output chars per generation
- Using Gemini Flash (80%) + Gemini Pro (20%)

Calculation:
- Flash: 40K × (2000×$0.000125 + 1000×$0.00025) = $20
- Pro: 10K × (2000×$0.00025 + 1000×$0.0005) = $10
- Infrastructure: ~$100

**Total AI costs: ~$130-200/month for 50K generations**
