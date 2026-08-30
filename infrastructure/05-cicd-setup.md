# Phase 5: CI/CD Pipeline Setup

## Overview
Set up automated build, test, and deployment pipelines using Cloud Build.

## 5.1 Cloud Build Configuration

### Enable Cloud Build
```bash
PROJECT_ID="affiliate-flow-prod"

# Enable Cloud Build API (already enabled in Phase 1)
gcloud services enable cloudbuild.googleapis.com

# Grant Cloud Build permissions
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### Create Build Triggers

#### Master AI Orchestrator Build
```bash
gcloud builds triggers create github \
  --name="build-orchestrator" \
  --repo-name="affiliate-flow" \
  --repo-owner="YOUR_GITHUB_ORG" \
  --branch-pattern="^main$" \
  --build-config="services/master-ai-orchestrator/cloudbuild.yaml" \
  --included-files="services/master-ai-orchestrator/**"
```

#### Product Mapper Build
```bash
gcloud builds triggers create github \
  --name="build-product-mapper" \
  --repo-name="affiliate-flow" \
  --repo-owner="YOUR_GITHUB_ORG" \
  --branch-pattern="^main$" \
  --build-config="services/product-mapper/cloudbuild.yaml" \
  --included-files="services/product-mapper/**"
```

#### Frontend Build & Deploy
```bash
gcloud builds triggers create github \
  --name="build-deploy-frontend" \
  --repo-name="affiliate-flow" \
  --repo-owner="YOUR_GITHUB_ORG" \
  --branch-pattern="^main$" \
  --build-config="client/cloudbuild.yaml" \
  --included-files="client/**"
```

## 5.2 Cloud Build Configuration Files

See the following files for build configs:
- `services/master-ai-orchestrator/cloudbuild.yaml`
- `services/product-mapper/cloudbuild.yaml`
- `client/cloudbuild.yaml`

## 5.3 Deployment Strategies

### Blue-Green Deployment
```bash
# Deploy new version (green)
kubectl apply -f kubernetes/manifests/orchestrator-v2.yaml

# Switch traffic gradually
kubectl patch service orchestrator-service -p '{"spec":{"selector":{"version":"v2"}}}'

# Rollback if needed
kubectl patch service orchestrator-service -p '{"spec":{"selector":{"version":"v1"}}}'
```

### Canary Deployment
```yaml
# In orchestrator deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orchestrator-canary
spec:
  replicas: 1  # Start with 10% traffic
  selector:
    matchLabels:
      app: orchestrator
      version: canary
```

## 5.4 Automated Testing

### Unit Tests in CI
```yaml
# In cloudbuild.yaml
steps:
- name: 'node:20'
  entrypoint: npm
  args: ['test']
  dir: 'services/master-ai-orchestrator'
```

### Integration Tests
```bash
# Create Cloud Build trigger for staging
gcloud builds triggers create github \
  --name="test-integration" \
  --repo-name="affiliate-flow" \
  --repo-owner="YOUR_GITHUB_ORG" \
  --branch-pattern="^develop$" \
  --build-config="tests/integration/cloudbuild.yaml"
```

## 5.5 Continuous Deployment

### ArgoCD Setup (GitOps)
```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

### Create ArgoCD Application
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: affiliate-flow
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/YOUR_ORG/affiliate-flow
    targetRevision: HEAD
    path: infrastructure/kubernetes/manifests
  destination:
    server: https://kubernetes.default.svc
    namespace: affiliate-flow
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## 5.6 Release Management

### Semantic Versioning
```bash
# Tag releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Trigger production deployment
gcloud builds triggers create github \
  --name="deploy-production" \
  --repo-name="affiliate-flow" \
  --repo-owner="YOUR_GITHUB_ORG" \
  --tag-pattern="^v[0-9]+\.[0-9]+\.[0-9]+$" \
  --build-config="cloudbuild-prod.yaml"
```

## Cost Estimation
- Cloud Build: First 120 build-minutes/day free, then $0.003/build-minute
- ArgoCD: Runs on GKE (included in cluster costs)
- Artifact Registry: $0.10/GB stored

Typical CI/CD costs: ~$20-50/month
