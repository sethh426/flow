> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Affiliate Flow - Complete Infrastructure Guide

## Quick Start

### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed
- `terraform` installed
- `kubectl` installed

### One-Command Deployment
```powershell
# Clone or navigate to project
cd infrastructure

# Run deployment script
.\deploy.ps1 -Action plan
.\deploy.ps1 -Action apply
```

## Infrastructure Components

### 1. **Core Infrastructure** (`01-initial-setup.md`)
- GCP Project setup
- Service accounts
- IAM roles
- Workload Identity Federation

### 2. **Kubernetes** (`02-kubernetes-setup.md`)
- GKE Autopilot cluster
- Workload Identity binding
- Artifact Registry
- Cluster add-ons (Ingress, Cert-Manager, KEDA)

### 3. **Data Layer** (`03-data-layer-setup.md`)
- Firestore (primary database)
- BigQuery (analytics)
- Cloud Tasks (job queues)
- Cloud Storage (files/backups)
- Redis (caching)

### 4. **AI Infrastructure** (`04-ai-infrastructure-setup.md`)
- Vertex AI setup
- Secret Manager (API keys)
- Quota management
- Cost tracking
- Performance monitoring

## Terraform Structure

```
terraform/
├── main.tf                          # Root module
├── variables.tf                     # Input variables
├── terraform.tfvars                 # Your values (gitignored)
└── modules/
    ├── service-accounts/           # IAM & service accounts
    ├── networking/                 # VPC, subnets, firewall
    ├── gke/                        # Kubernetes cluster
    ├── data-layer/                 # Databases & queues
    ├── ai-infrastructure/          # AI services & secrets
    └── monitoring/                 # Alerts & dashboards
```

## Deployment Options

### Option 1: Terraform (Recommended)
```powershell
cd infrastructure
.\deploy.ps1 -Action plan
.\deploy.ps1 -Action apply
```

**Benefits:**
- Infrastructure as code
- Version controlled
- Repeatable deployments
- Easy rollbacks
- State management

### Option 2: Manual gcloud Commands
Follow the setup guides in order:
1. `01-initial-setup.md`
2. `02-kubernetes-setup.md`
3. `03-data-layer-setup.md`
4. `04-ai-infrastructure-setup.md`

**Use when:**
- Learning GCP services
- Troubleshooting specific components
- One-off configurations

## Configuration

### Required Environment Variables
Create `terraform/terraform.tfvars`:
```hcl
project_id         = "affiliate-flow-prod"
region             = "us-central1"
notification_email = "your-email@example.com"
gemini_api_key     = "YOUR_GEMINI_API_KEY"
```

### Optional Customizations
```hcl
cluster_name           = "custom-cluster-name"
min_nodes              = 2
max_nodes              = 20
backup_retention_days  = 90
```

## Cost Estimation

### Monthly Costs (10K active users)
| Component | Cost |
|-----------|------|
| GKE Autopilot | $200-500 |
| Cloud NAT | $45 |
| Redis (5GB) | $170 |
| BigQuery | $50-100 |
| Cloud Storage | $20-50 |
| Cloud Tasks | <$10 |
| AI (Gemini) | $130-200 |
| Monitoring | $50 |
| **TOTAL** | **$665-1,125/month** |

### Cost Optimization Tips
1. Use Gemini Flash (2x cheaper) for simple content
2. Enable BigQuery partitioning and clustering
3. Set up Cloud Storage lifecycle policies
4. Use committed use discounts for Redis
5. Monitor with Budget Alerts

## Deployment Workflow

### Initial Setup
```powershell
# 1. Set up Terraform backend
gsutil mb gs://affiliate-flow-terraform-state
gsutil versioning set on gs://affiliate-flow-terraform-state

# 2. Initialize Terraform
cd terraform
terraform init

# 3. Plan deployment
terraform plan -out=tfplan

# 4. Review and apply
terraform apply tfplan
```

### Deploy Application Services
```powershell
# 1. Get cluster credentials
gcloud container clusters get-credentials affiliate-flow-cluster --region=us-central1

# 2. Create secrets
kubectl create secret generic gemini-api -n affiliate-flow --from-literal=api-key=$GEMINI_API_KEY

# 3. Deploy services
kubectl apply -f kubernetes/manifests/

# 4. Check deployment
kubectl get pods -n affiliate-flow
kubectl get services -n affiliate-flow
```

### Build and Push Container Images
```powershell
# Configure Docker for Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build and push orchestrator
cd services/master-ai-orchestrator
docker build -t us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:latest .
docker push us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:latest

# Build and push product mapper
cd ../product-mapper
docker build -t us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/product-mapper:latest .
docker push us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/product-mapper:latest
```

## Monitoring & Maintenance

### View Logs
```powershell
# GKE logs
kubectl logs -f deployment/master-ai-orchestrator -n affiliate-flow

# Cloud Logging
gcloud logging read "resource.type=k8s_container AND resource.labels.namespace_name=affiliate-flow" --limit 50
```

### Check Metrics
```powershell
# Cloud Monitoring dashboards
gcloud monitoring dashboards list

# View specific metrics
gcloud monitoring time-series list --filter='metric.type="custom.googleapis.com/ai/daily_cost"'
```

### Alerts
All alerts are configured to email: `notification_email` from terraform.tfvars

Configured alerts:
- High error rate (>5%)
- High API latency (>2s P95)
- High AI costs (>$100/day)
- Service downtime

## Troubleshooting

### Terraform Issues
```powershell
# Reset state
terraform refresh

# Import existing resources
terraform import module.gke.google_container_cluster.primary projects/affiliate-flow-prod/locations/us-central1/clusters/affiliate-flow-cluster

# Force unlock state
terraform force-unlock LOCK_ID
```

### Kubernetes Issues
```powershell
# Check pod status
kubectl describe pod POD_NAME -n affiliate-flow

# View events
kubectl get events -n affiliate-flow --sort-by='.lastTimestamp'

# Restart deployment
kubectl rollout restart deployment/master-ai-orchestrator -n affiliate-flow
```

### Permission Issues
```powershell
# Verify service account permissions
gcloud projects get-iam-policy affiliate-flow-prod --flatten="bindings[].members" --filter="bindings.members:affiliate-flow-orchestrator@*"

# Add missing permission
gcloud projects add-iam-policy-binding affiliate-flow-prod --member="serviceAccount:affiliate-flow-orchestrator@affiliate-flow-prod.iam.gserviceaccount.com" --role="roles/cloudtasks.enqueuer"
```

## Security Best Practices

1. **Never commit secrets to git**
   - Add `terraform.tfvars` to `.gitignore`
   - Use Secret Manager for all API keys

2. **Enable audit logging**
   ```powershell
   gcloud logging sinks create audit-logs \
     gs://affiliate-flow-prod-logs-archive \
     --log-filter='logName:"cloudaudit.googleapis.com"'
   ```

3. **Rotate service account keys**
   ```powershell
   gcloud iam service-accounts keys create new-key.json \
     --iam-account=affiliate-flow-orchestrator@affiliate-flow-prod.iam.gserviceaccount.com
   ```

4. **Enable Binary Authorization** (for production)
   ```powershell
   gcloud container clusters update affiliate-flow-cluster \
     --enable-binauthz \
     --region=us-central1
   ```

## Next Steps

After infrastructure is deployed:
1. ✅ Verify all services are running
2. ✅ Test AI orchestration endpoints
3. ✅ Configure custom domain (if needed)
4. ✅ Set up CI/CD pipeline
5. ✅ Enable backup automation
6. ✅ Configure monitoring dashboards
7. ✅ Run load tests

## Support Resources

- [GCP Documentation](https://cloud.google.com/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- Project issues: See `PROJECT_REPORT.md`
