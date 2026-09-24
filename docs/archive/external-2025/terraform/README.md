> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Affiliate Flow - Terraform Infrastructure

This directory contains Terraform configuration for managing Affiliate Flow's GCP infrastructure optimized for the **free tier**.

## 📋 Prerequisites

1. **Terraform** installed (v1.0+): https://www.terraform.io/downloads
2. **gcloud CLI** installed and authenticated: https://cloud.google.com/sdk/docs/install
3. **GCP Project** created: `affiliateflow-abzfy`

## 🚀 Quick Start

### 1. Initialize Terraform

```powershell
cd terraform
terraform init
```

This downloads the Google Cloud provider and prepares Terraform.

### 2. Review the Plan

```powershell
terraform plan
```

This shows you everything that will be created without making changes.

### 3. Apply the Configuration

```powershell
terraform apply
```

Type `yes` when prompted. This creates:
- ✅ 17 GCP APIs enabled
- ✅ 4 service accounts
- ✅ IAM role bindings
- ✅ 6 Secret Manager secrets
- ✅ 4 Cloud Storage buckets
- ✅ 4 Cloud Tasks queues
- ✅ 4 Pub/Sub topics + subscriptions
- ✅ 3 Cloud Scheduler jobs
- ✅ 1 Artifact Registry repository

## 📊 What Gets Created

### Service Accounts
- `affiliate-flow-orchestrator` - Master AI coordinator
- `affiliate-flow-content-gen` - Content generation
- `affiliate-flow-image-gen` - Image generation
- `affiliate-flow-analytics` - Analytics processing

### Storage Buckets
- `affiliateflow-abzfy-content` - Generated content (90-day lifecycle)
- `affiliateflow-abzfy-images` - AI-generated images (CORS enabled)
- `affiliateflow-abzfy-backups` - Database backups (365-day lifecycle)
- `affiliateflow-abzfy-temp` - Temporary files (1-day lifecycle)

### Cloud Tasks Queues
- `content-generation` - Content creation tasks (10/sec, max 100 concurrent)
- `image-generation` - Image creation tasks (5/sec, max 50 concurrent)
- `webhook-processing` - Webhook events (50/sec, max 200 concurrent)
- `analytics-jobs` - Analytics processing (1/sec, max 10 concurrent)

### Pub/Sub Topics
- `content-requests` - Content generation requests (1-day retention)
- `image-requests` - Image generation requests (1-day retention)
- `webhook-events` - Incoming webhooks (7-day retention)
- `analytics-events` - Analytics events (30-day retention)

### Cloud Scheduler Jobs (3 FREE per month)
- `daily-trend-discovery` - Runs at 8 AM EST daily
- `weekly-analytics` - Runs 9 AM EST every Monday
- `daily-cleanup` - Runs at 2 AM EST daily

### Secret Manager (6 FREE secrets)
- `GEMINI_API_KEY` - Gemini API key
- `FIREBASE_CONFIG` - Firebase configuration
- `NORDSTROM_API_KEY` - Nordstrom API key
- `WEBHOOK_SECRET` - Webhook validation secret
- `ADMIN_API_KEY` - Admin API key
- `DATABASE_URL` - Database connection string

## 💰 Cost Analysis

All services stay within FREE tier limits:

| Service | Free Tier Limit | Our Usage | Cost |
|---------|----------------|-----------|------|
| Cloud Run | 2M requests/month | ~100K/month | $0-3 |
| Cloud Functions | 2M invocations/month | ~50K/month | $0 |
| Firestore | 50K reads, 20K writes/day | ~10K reads/day | $0 |
| Cloud Storage | 5GB (with Firebase) | ~1GB | $0 |
| Cloud Tasks | 1M tasks/month | ~50K/month | $0 |
| Pub/Sub | 10GB/month | ~1GB/month | $0 |
| Cloud Scheduler | 3 jobs FREE | 3 jobs | $0 |
| Secret Manager | 6 secrets FREE | 6 secrets | $0 |
| Cloud Build | 120 min/day | ~30 min/day | $0 |
| Artifact Registry | 0.5GB | ~0.3GB | $0 |
| Cloud Logging | 50GB/month | ~10GB/month | $0 |
| Cloud Monitoring | Free allotment | Within limits | $0 |

**Total Estimated Cost: $0-5/month** ✅

## 🔧 Managing Infrastructure

### View Current State

```powershell
terraform show
```

### Update Infrastructure

1. Edit `main.tf`
2. Run `terraform plan` to preview changes
3. Run `terraform apply` to apply changes

### Destroy Everything (BE CAREFUL!)

```powershell
terraform destroy
```

This deletes ALL infrastructure managed by Terraform.

### Add Secret Values

Terraform creates the secrets but doesn't add values. Add them manually:

```powershell
# Example: Add Gemini API key
echo "REDACTED_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Add other secrets similarly
gcloud secrets versions add FIREBASE_CONFIG --data-file=path/to/config.json
gcloud secrets versions add NORDSTROM_API_KEY --data-file=-
# etc.
```

## 📚 Variables

Customize by editing `main.tf` variables:

```hcl
variable "project_id" {
  default = "affiliateflow-abzfy"  # Your GCP project ID
}

variable "region" {
  default = "us-central1"  # Primary region (for FREE Cloud Tasks)
}

variable "environment" {
  default = "production"  # Environment name
}
```

## 🔍 Outputs

After applying, Terraform shows useful information:

```
Outputs:

service_accounts = {
  "analytics" = "affiliate-flow-analytics@affiliateflow-abzfy.iam.gserviceaccount.com"
  "content_gen" = "affiliate-flow-content-gen@affiliateflow-abzfy.iam.gserviceaccount.com"
  "image_gen" = "affiliate-flow-image-gen@affiliateflow-abzfy.iam.gserviceaccount.com"
  "orchestrator" = "affiliate-flow-orchestrator@affiliateflow-abzfy.iam.gserviceaccount.com"
}

storage_buckets = {
  "backups" = "affiliateflow-abzfy-backups"
  "content" = "affiliateflow-abzfy-content"
  "images" = "affiliateflow-abzfy-images"
  "temp" = "affiliateflow-abzfy-temp"
}
# ... etc
```

## 🎯 Next Steps After Terraform Apply

1. **Add Secret Values** (see above)
2. **Deploy Services to Cloud Run**:
   ```powershell
   cd services/flow-orchestrator
   gcloud run deploy flow-orchestrator `
     --source . `
     --platform managed `
     --region us-central1 `
     --service-account affiliate-flow-orchestrator@affiliateflow-abzfy.iam.gserviceaccount.com
   ```

3. **Set up Firestore Collections**:
   - Use Firebase Console
   - Or use Firestore REST API
   - Collections: users, brands, campaigns, content, analytics

4. **Configure Monitoring**:
   - Cloud Monitoring dashboards
   - Alerting policies
   - Log-based metrics

5. **Test Integrations**:
   - Cloud Tasks enqueueing
   - Pub/Sub publishing
   - Cloud Scheduler jobs
   - Secret Manager access

## 📖 Best Practices

1. **Always run `terraform plan` before `apply`**
2. **Commit `terraform.tfstate` to private repo** (contains sensitive data)
3. **Use workspaces for multiple environments**: `terraform workspace new staging`
4. **Enable state locking** with Cloud Storage backend (prevents concurrent changes)
5. **Review outputs after apply** to get service account emails, bucket names, etc.

## 🔒 Security Notes

- Service accounts follow principle of least privilege
- Secret Manager handles all sensitive data
- IAM roles are minimal for each service
- Buckets have lifecycle policies to reduce costs
- CORS configured only for production domains

## 📞 Troubleshooting

### "API not enabled" errors
Wait a few minutes after first apply. APIs take time to enable.

### "Already exists" errors
Resources might exist from manual creation. Import them:
```powershell
terraform import google_service_account.orchestrator projects/affiliateflow-abzfy/serviceAccounts/affiliate-flow-orchestrator@affiliateflow-abzfy.iam.gserviceaccount.com
```

### Cost concerns
Monitor costs at: https://console.cloud.google.com/billing

### State file issues
Back up `terraform.tfstate` frequently!

## 🎓 Learn More

- [Terraform Google Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GCP Free Tier](https://cloud.google.com/free)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
