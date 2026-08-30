# Affiliate Flow - Complete GCP Infrastructure Guide

## 🚀 Quick Start

### Prerequisites Installation
```powershell
# Install gcloud CLI
winget install Google.CloudSDK

# Install Terraform
winget install Hashicorp.Terraform

# Install kubectl
gcloud components install kubectl

# Verify installations
gcloud version
terraform version
kubectl version --client
```

### One-Command Deployment
```powershell
cd infrastructure
.\deploy.ps1 -Action apply -ProjectId "affiliate-flow-prod" -NotificationEmail "your@email.com" -GeminiApiKey "YOUR_KEY"
```

---

## 📋 What You Get

### Complete Production Infrastructure
✅ **GKE Autopilot Cluster** - Fully managed Kubernetes  
✅ **VPC Network** - Secure private networking with Cloud NAT  
✅ **Firestore** - NoSQL database for user data  
✅ **BigQuery** - Analytics and cost tracking  
✅ **Cloud Tasks** - Job queue for AI processing  
✅ **Redis** - Caching layer for performance  
✅ **Secret Manager** - Secure API key storage  
✅ **Cloud Monitoring** - Alerts and dashboards  
✅ **CI/CD Pipeline** - Automated deployments  
✅ **Security** - Audit logging, encryption, DDoS protection  

---

## 📁 Infrastructure Structure

```
infrastructure/
├── README.md                        # This file
├── DEPLOYMENT_CHECKLIST.md          # Step-by-step deployment guide
├── deploy.ps1                       # One-click deployment script
├── .gitignore                       # Security (excludes secrets)
│
├── 01-initial-setup.md              # Phase 1: Project & IAM setup
├── 02-kubernetes-setup.md           # Phase 2: GKE cluster
├── 03-data-layer-setup.md           # Phase 3: Databases & queues
├── 04-ai-infrastructure-setup.md    # Phase 4: Vertex AI & secrets
├── 05-cicd-setup.md                 # Phase 5: Cloud Build & GitOps
├── 06-security-compliance.md        # Phase 6: Security hardening
│
├── terraform/                       # Infrastructure as Code
│   ├── main.tf                      # Root module
│   ├── variables.tf                 # Configuration options
│   ├── terraform.tfvars             # YOUR VALUES (gitignored)
│   └── modules/
│       ├── service-accounts/        # IAM & permissions
│       ├── networking/              # VPC, subnets, firewall
│       ├── gke/                     # Kubernetes cluster
│       ├── data-layer/              # Firestore, BigQuery, Redis
│       ├── ai-infrastructure/       # Secrets, Artifact Registry
│       └── monitoring/              # Alerts & dashboards
│
└── kubernetes/                      # Kubernetes manifests
    └── manifests/
        ├── master-ai-orchestrator.yaml
        └── product-mapper.yaml
```

---

## 🎯 Deployment Options

### Option 1: Terraform (Recommended) ⭐
**Best for:** Production deployments, team collaboration, version control

```powershell
# Step 1: Configure
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Step 2: Deploy
cd ..
.\deploy.ps1 -Action plan    # Preview changes
.\deploy.ps1 -Action apply   # Deploy infrastructure
```

**Benefits:**
- ✅ Infrastructure as Code (version controlled)
- ✅ Repeatable deployments
- ✅ Easy rollbacks
- ✅ Drift detection
- ✅ Team collaboration

### Option 2: Manual Setup
**Best for:** Learning GCP, understanding each component

Follow guides in order:
1. `01-initial-setup.md` - Create project, enable APIs
2. `02-kubernetes-setup.md` - Deploy GKE cluster
3. `03-data-layer-setup.md` - Set up databases
4. `04-ai-infrastructure-setup.md` - Configure AI services
5. `05-cicd-setup.md` - Set up CI/CD
6. `06-security-compliance.md` - Harden security

---

## 💰 Cost Breakdown

### Monthly Costs (Estimated for 10K active users)

| Component | Cost | Notes |
|-----------|------|-------|
| **Compute** |
| GKE Autopilot | $200-500 | Scales with usage |
| Cloud Functions | $20-50 | First 2M invocations free |
| **Networking** |
| Cloud NAT | $45 | Fixed cost |
| Load Balancer | $18 | Fixed + traffic |
| **Data** |
| Firestore | $50-100 | $0.18/GB + operations |
| BigQuery | $50-100 | $5/TB storage, $6.25/TB scanned |
| Redis 5GB | $170 | Fixed for HA tier |
| Cloud Storage | $20-50 | Depends on usage |
| **AI** |
| Gemini API | $130-200 | ~50K generations/month |
| Vertex AI | $50 | Monitoring & endpoints |
| **Security** |
| Secret Manager | $10 | $0.06/secret/month |
| Cloud Armor | $20 | Optional DDoS protection |
| **Monitoring** |
| Cloud Logging | $20-40 | 50GB free, then $0.50/GB |
| Cloud Monitoring | $30 | Metrics & dashboards |
| **TOTAL** | **$833-1,383** | **~$1,000/month average** |

### Cost Optimization Tips
1. **Use Gemini Flash** (2x cheaper) for 80% of content generation
2. **Enable BigQuery partitioning** to reduce scanning costs
3. **Set Cloud Storage lifecycle policies** to archive old data
4. **Use committed use discounts** for Redis (save 37%)
5. **Set budget alerts** at $500, $750, $1000
6. **Review unused resources** monthly

---

## 🔒 Security Features

✅ **Network Security**
- Private GKE cluster (no public endpoints)
- Cloud NAT for egress only
- Firewall rules (deny-all by default)
- Cloud Armor DDoS protection

✅ **Data Security**
- Encryption at rest (Google-managed keys)
- Encryption in transit (TLS 1.3)
- CMEK available for sensitive data
- Secret Manager for API keys

✅ **Access Control**
- Workload Identity (no service account keys in pods)
- Least privilege IAM roles
- Service account impersonation
- Audit logging for all changes

✅ **Compliance**
- Audit logs exported to BigQuery
- Binary Authorization for containers
- Vulnerability scanning
- Regular security patching

---

## 📊 Monitoring & Alerts

### Configured Alerts
1. **High Error Rate** - Triggers if error rate > 5%
2. **High Latency** - Triggers if P95 latency > 2s
3. **High AI Cost** - Triggers if daily AI cost > $100
4. **IAM Changes** - Alerts on permission modifications
5. **Service Down** - HTTP uptime checks

### Dashboards
- **Application Performance** - Request rates, latencies, errors
- **AI Metrics** - Generation counts, costs, quality scores
- **Infrastructure Health** - CPU, memory, disk, network
- **Cost Analysis** - Daily spend by service

### Log Sinks
- **Audit Logs** → BigQuery (compliance)
- **Application Logs** → Cloud Logging (debugging)
- **Security Events** → Pub/Sub → Incident response

---

## 🔄 CI/CD Pipeline

### Automated Workflows

```mermaid
GitHub Push → Cloud Build → Tests → Build Image → Scan → Deploy to GKE
```

**Triggers:**
- `main` branch push → Deploy to production
- `develop` branch push → Deploy to staging
- `v*` tags → Create versioned release

**Steps:**
1. Run unit tests
2. Run security scans (Trivy)
3. Build Docker image
4. Push to Artifact Registry
5. Deploy to GKE
6. Run smoke tests

### Manual Deployment
```powershell
# Build and push manually
cd services/master-ai-orchestrator
docker build -t us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:v1.0.0 .
docker push us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:v1.0.0

# Deploy to Kubernetes
kubectl set image deployment/master-ai-orchestrator master-ai-orchestrator=us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:v1.0.0 -n affiliate-flow
```

---

## 🚨 Disaster Recovery

### Backup Strategy
- **Firestore:** Daily exports to Cloud Storage (auto)
- **BigQuery:** Table snapshots every 7 days
- **Redis:** HA mode with automatic failover
- **Secrets:** Version history in Secret Manager

### Recovery Time Objectives (RTO)
- **Application:** < 15 minutes (redeploy from images)
- **Database:** < 1 hour (restore from backup)
- **Full infrastructure:** < 4 hours (Terraform redeploy)

### Disaster Scenarios

**Scenario 1: Pod Crashes**
```powershell
# Kubernetes auto-restarts
# If persistent, check logs:
kubectl logs -f deployment/master-ai-orchestrator -n affiliate-flow
```

**Scenario 2: Deployment Failure**
```powershell
# Rollback to previous version
kubectl rollout undo deployment/master-ai-orchestrator -n affiliate-flow
```

**Scenario 3: Region Outage**
```powershell
# Failover to different region (requires multi-region setup)
gcloud container clusters get-credentials affiliate-flow-cluster --region=us-east1
```

**Scenario 4: Data Corruption**
```powershell
# Restore Firestore from backup
gcloud firestore import gs://affiliate-flow-prod-backups/2025-10-10
```

---

## 🛠️ Common Operations

### Scale Services
```powershell
# Manual scaling
kubectl scale deployment master-ai-orchestrator --replicas=5 -n affiliate-flow

# Auto-scaling (already configured via HPA)
kubectl get hpa -n affiliate-flow
```

### Update Configuration
```powershell
# Update secret
kubectl create secret generic gemini-api --from-literal=api-key=NEW_KEY -n affiliate-flow --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to pick up new secret
kubectl rollout restart deployment/master-ai-orchestrator -n affiliate-flow
```

### View Metrics
```powershell
# CPU/Memory usage
kubectl top pods -n affiliate-flow

# Application metrics
gcloud monitoring time-series list --filter='metric.type="custom.googleapis.com/api/latency"'
```

### Debug Issues
```powershell
# Get pod logs
kubectl logs -f POD_NAME -n affiliate-flow

# Shell into container
kubectl exec -it POD_NAME -n affiliate-flow -- /bin/sh

# Describe pod for events
kubectl describe pod POD_NAME -n affiliate-flow
```

---

## 📚 Additional Resources

### Documentation
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment
- [GCP Documentation](https://cloud.google.com/docs) - Official GCP docs
- [Terraform Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs) - Terraform GCP
- [Kubernetes Docs](https://kubernetes.io/docs/) - Kubernetes reference

### Support
- **GCP Support:** https://cloud.google.com/support
- **Firebase Support:** https://firebase.google.com/support
- **Community:** Stack Overflow, Reddit r/googlecloud

### Project Files
- [Project Overview](../PROJECT_OVERVIEW.md) - Architecture details
- [API Documentation](../DOCUMENTATION_INDEX.md) - API reference
- [Quick Reference](../QUICK_REFERENCE.md) - Command cheat sheet

---

## ⚡ Next Steps

After infrastructure deployment:

1. ✅ **Verify all services running**
   ```powershell
   kubectl get pods -n affiliate-flow
   ```

2. ✅ **Test API endpoints**
   ```powershell
   curl https://YOUR_DOMAIN/api/health
   ```

3. ✅ **Deploy frontend**
   ```powershell
   cd client
   npm run build
   firebase deploy --only hosting
   ```

4. ✅ **Seed initial data**
   ```powershell
   node seed-demo-data.js
   ```

5. ✅ **Configure custom domain** (optional)
   - Add DNS records
   - Configure SSL certificate

6. ✅ **Set up monitoring dashboards**
   - Import pre-built dashboards
   - Create custom alerts

7. ✅ **Run load tests**
   - Test autoscaling
   - Verify performance

---

## 🎉 You're All Set!

Your production-grade Affiliate Flow infrastructure is ready. This setup provides:

✅ **99.9% uptime** with GKE Autopilot  
✅ **Auto-scaling** for traffic spikes  
✅ **Cost optimization** with smart AI routing  
✅ **Security** with encryption and audit logging  
✅ **Monitoring** with alerts and dashboards  
✅ **CI/CD** for rapid deployments  

Need help? Check the troubleshooting section or review the detailed guides in this directory.

**Happy deploying! 🚀**
