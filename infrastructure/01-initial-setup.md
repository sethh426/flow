# Affiliate Flow - GCP Infrastructure Setup Guide

## Overview
This guide provides step-by-step instructions for setting up production-grade infrastructure on Google Cloud Platform for Affiliate Flow.

## Prerequisites
- Google Cloud Account with billing enabled
- `gcloud` CLI installed and configured
- `kubectl` installed
- Terraform installed (optional but recommended)
- Project Owner or Editor permissions

## Phase 1: Initial GCP Project Setup

### 1.1 Create the Project
```bash
# Create the project
gcloud projects create affiliate-flow-prod --name="Affiliate Flow Production"

# Set as default project
gcloud config set project affiliate-flow-prod

# Link billing account (replace with your billing account ID)
gcloud billing projects link affiliate-flow-prod --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 1.2 Enable Required APIs
```bash
# Enable all required APIs in one command
gcloud services enable \
  container.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  aiplatform.googleapis.com \
  bigquery.googleapis.com \
  firestore.googleapis.com \
  cloudtasks.googleapis.com \
  compute.googleapis.com \
  cloudresourcemanager.googleapis.com \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  pubsub.googleapis.com \
  dataflow.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudscheduler.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  cloudtrace.googleapis.com \
  cloudprofiler.googleapis.com
```

### 1.3 Create Service Accounts
```bash
# Master AI Orchestrator service account
gcloud iam service-accounts create affiliate-flow-orchestrator \
  --display-name="Affiliate Flow Master AI Orchestrator"

# Content Generation service account
gcloud iam service-accounts create affiliate-flow-content-gen \
  --display-name="Affiliate Flow Content Generation"

# Analytics service account
gcloud iam service-accounts create affiliate-flow-analytics \
  --display-name="Affiliate Flow Analytics"

# Financial Processing service account
gcloud iam service-accounts create affiliate-flow-finance \
  --display-name="Affiliate Flow Financial Processing"
```

### 1.4 Grant IAM Roles
```bash
PROJECT_ID="affiliate-flow-prod"

# Orchestrator permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudtasks.enqueuer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Content Gen permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-content-gen@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-content-gen@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Analytics permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-analytics@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:affiliate-flow-analytics@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/dataflow.worker"
```

### 1.5 Set Up Workload Identity Federation
```bash
# Create workload identity pool
gcloud iam workload-identity-pools create affiliate-flow-pool \
  --location="global" \
  --display-name="Affiliate Flow Workload Identity Pool"

# Create provider for GitHub Actions (example)
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="affiliate-flow-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository_owner=='YOUR_GITHUB_ORG'"
```

## Phase 2: Networking Setup

### 2.1 Create VPC Network
```bash
# Create VPC
gcloud compute networks create affiliate-flow-vpc \
  --subnet-mode=custom \
  --bgp-routing-mode=regional

# Create GKE subnet
gcloud compute networks subnets create affiliate-flow-gke-subnet \
  --network=affiliate-flow-vpc \
  --region=us-central1 \
  --range=10.0.0.0/20 \
  --secondary-range pods=10.4.0.0/14 \
  --secondary-range services=10.0.16.0/20 \
  --enable-private-ip-google-access

# Create Cloud Router
gcloud compute routers create affiliate-flow-router \
  --network=affiliate-flow-vpc \
  --region=us-central1

# Create Cloud NAT
gcloud compute routers nats create affiliate-flow-nat \
  --router=affiliate-flow-router \
  --region=us-central1 \
  --nat-all-subnet-ip-ranges \
  --auto-allocate-nat-external-ips
```

### 2.2 Configure Firewall Rules
```bash
# Allow internal communication
gcloud compute firewall-rules create allow-internal \
  --network=affiliate-flow-vpc \
  --allow=tcp,udp,icmp \
  --source-ranges=10.0.0.0/8

# Allow health checks
gcloud compute firewall-rules create allow-health-checks \
  --network=affiliate-flow-vpc \
  --allow=tcp \
  --source-ranges=35.191.0.0/16,130.211.0.0/22
```

## Next Steps
1. Review Phase 3: Kubernetes Engine Setup (see `02-kubernetes-setup.md`)
2. Configure Phase 4: Data Layer (see `03-data-layer-setup.md`)
3. Set up Phase 5: AI Infrastructure (see `04-ai-infrastructure-setup.md`)

## Important Notes
- Replace `YOUR_BILLING_ACCOUNT_ID` with your actual GCP billing account ID
- Replace `YOUR_GITHUB_ORG` with your GitHub organization name
- Review and adjust region settings based on your target audience
- All commands assume you have appropriate permissions

## Cost Estimation
Initial setup (excluding workload costs):
- VPC: Free (up to quota limits)
- Cloud NAT: ~$45/month per gateway
- Firewall Rules: Free
- Service Accounts: Free

See `cost-estimation.md` for detailed pricing breakdown.
