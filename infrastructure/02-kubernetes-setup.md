# Phase 2: Kubernetes Engine Setup

## Overview
Set up Google Kubernetes Engine (GKE) cluster with autopilot mode for production workloads.

## 2.1 Create GKE Cluster

### Autopilot Cluster (Recommended for Production)
```bash
PROJECT_ID="affiliate-flow-prod"
CLUSTER_NAME="affiliate-flow-cluster"
REGION="us-central1"

gcloud container clusters create-auto $CLUSTER_NAME \
  --region=$REGION \
  --network=affiliate-flow-vpc \
  --subnetwork=affiliate-flow-gke-subnet \
  --cluster-secondary-range-name=pods \
  --services-secondary-range-name=services \
  --enable-private-nodes \
  --enable-private-endpoint \
  --master-ipv4-cidr=172.16.0.0/28 \
  --release-channel=regular \
  --workload-pool=${PROJECT_ID}.svc.id.goog \
  --enable-stackdriver-kubernetes \
  --enable-cloud-logging \
  --enable-cloud-monitoring
```

### Get Cluster Credentials
```bash
gcloud container clusters get-credentials $CLUSTER_NAME --region=$REGION
```

## 2.2 Configure Workload Identity

### Bind Service Accounts to Kubernetes Service Accounts
```bash
# Create Kubernetes namespace
kubectl create namespace affiliate-flow

# Create Kubernetes service accounts
kubectl create serviceaccount orchestrator-sa -n affiliate-flow
kubectl create serviceaccount content-gen-sa -n affiliate-flow
kubectl create serviceaccount analytics-sa -n affiliate-flow

# Bind to GCP service accounts
gcloud iam service-accounts add-iam-policy-binding \
  affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:${PROJECT_ID}.svc.id.goog[affiliate-flow/orchestrator-sa]"

gcloud iam service-accounts add-iam-policy-binding \
  affiliate-flow-content-gen@${PROJECT_ID}.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:${PROJECT_ID}.svc.id.goog[affiliate-flow/content-gen-sa]"

gcloud iam service-accounts add-iam-policy-binding \
  affiliate-flow-analytics@${PROJECT_ID}.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:${PROJECT_ID}.svc.id.goog[affiliate-flow/analytics-sa]"

# Annotate Kubernetes service accounts
kubectl annotate serviceaccount orchestrator-sa \
  -n affiliate-flow \
  iam.gke.io/gcp-service-account=affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com

kubectl annotate serviceaccount content-gen-sa \
  -n affiliate-flow \
  iam.gke.io/gcp-service-account=affiliate-flow-content-gen@${PROJECT_ID}.iam.gserviceaccount.com

kubectl annotate serviceaccount analytics-sa \
  -n affiliate-flow \
  iam.gke.io/gcp-service-account=affiliate-flow-analytics@${PROJECT_ID}.iam.gserviceaccount.com
```

## 2.3 Set Up Artifact Registry

```bash
# Create Docker repository
gcloud artifacts repositories create affiliate-flow-images \
  --repository-format=docker \
  --location=$REGION \
  --description="Affiliate Flow container images"

# Configure Docker authentication
gcloud auth configure-docker ${REGION}-docker.pkg.dev
```

## 2.4 Install Cluster Add-ons

### Install NGINX Ingress Controller
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### Install Cert-Manager for SSL
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Install Keda for Autoscaling
```bash
kubectl apply -f https://github.com/kedacore/keda/releases/download/v2.12.0/keda-2.12.0.yaml
```

## 2.5 Create Kubernetes Secrets

```bash
# Firebase Admin SDK
kubectl create secret generic firebase-admin \
  -n affiliate-flow \
  --from-file=serviceAccountKey.json=../serviceAccountKey.json

# Gemini API Key
kubectl create secret generic gemini-api \
  -n affiliate-flow \
  --from-literal=api-key=$GEMINI_API_KEY

# Nordstrom API credentials (if applicable)
kubectl create secret generic nordstrom-api \
  -n affiliate-flow \
  --from-literal=api-key=$NORDSTROM_API_KEY
```

## 2.6 Deploy Core Services

See `kubernetes/` directory for deployment manifests:
- `manifests/master-ai-orchestrator.yaml`
- `manifests/product-mapper.yaml`
- `manifests/trend-finder.yaml`
- `manifests/client-frontend.yaml`

```bash
# Apply all manifests
kubectl apply -f kubernetes/manifests/ -n affiliate-flow
```

## Cost Estimation
GKE Autopilot (estimated):
- Control Plane: Free
- Node resources: ~$200-500/month (based on actual usage)
- Load Balancer: ~$18/month
- Ingress: ~$0.025 per GB processed

Total: ~$220-520/month (scales with traffic)
