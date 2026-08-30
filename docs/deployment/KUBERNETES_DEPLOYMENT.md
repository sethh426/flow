# Kubernetes Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Google Cloud SDK installed and configured
- kubectl installed
- Docker installed (for building images)
- GEMINI_API_KEY environment variable set

### Step 1: Deploy Cluster
```powershell
.\scripts\deployment\deploy-k8s-cluster.ps1
```

This script will:
- Enable required GCP APIs
- Create GKE cluster (if needed)
- Set up Artifact Registry
- Create namespace and secrets
- Deploy all services

### Step 2: Build and Push Images
```powershell
.\scripts\deployment\build-and-push-images.ps1
```

This script will:
- Build Docker images for all services
- Push images to Artifact Registry
- Auto-generate Dockerfiles if missing

### Step 3: Verify Deployment
```powershell
.\scripts\deployment\troubleshoot-k8s.ps1
```

This script checks:
- Cluster connectivity
- Pod status
- Service availability
- Resource usage

## 📦 Architecture

```
┌─────────────────────────────────────────────────┐
│              GKE Cluster                        │
│  ┌───────────────────────────────────────────┐ │
│  │         Namespace: affiliate-flow         │ │
│  │                                           │ │
│  │  ┌────────────────┐  ┌─────────────┐    │ │
│  │  │ Orchestrator   │  │   Redis     │    │ │
│  │  │   (2 pods)     │  │  (1 pod)    │    │ │
│  │  └────────────────┘  └─────────────┘    │ │
│  │                                           │ │
│  │  ┌────────────────┐  ┌─────────────┐    │ │
│  │  │ Product Mapper │  │ Trend Finder│    │ │
│  │  │   (3 pods)     │  │  (2 pods)   │    │ │
│  │  └────────────────┘  └─────────────┘    │ │
│  │                                           │ │
│  │  ┌────────────────────────────────────┐  │ │
│  │  │         Ingress Controller         │  │ │
│  │  └────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## 🎛️ Management

### Interactive Management Console
```powershell
.\scripts\deployment\manage-k8s-cluster.ps1
```

Features:
- Check cluster status
- View pod logs
- Restart deployments
- Scale services
- Port forwarding
- Ingress management

### Common Commands

#### View all resources
```powershell
kubectl get all -n affiliate-flow
```

#### Check pod status
```powershell
kubectl get pods -n affiliate-flow -w
```

#### View logs
```powershell
kubectl logs -f deployment/master-ai-orchestrator -n affiliate-flow
```

#### Restart a deployment
```powershell
kubectl rollout restart deployment/product-mapper -n affiliate-flow
```

#### Scale a deployment
```powershell
kubectl scale deployment/product-mapper --replicas=5 -n affiliate-flow
```

#### Port forward to local machine
```powershell
kubectl port-forward service/orchestrator-service 8080:80 -n affiliate-flow
```

## 🔧 Configuration

### Project Settings
- **Project ID**: affiliateflow-abzfy
- **Region**: us-central1
- **Cluster Name**: affiliateflow-cluster

### Services

| Service | Port | Replicas | Resources |
|---------|------|----------|-----------|
| master-ai-orchestrator | 8080 | 2 | 512Mi-1Gi RAM, 500m-1000m CPU |
| product-mapper | 8081 | 3 | 256Mi-512Mi RAM, 250m-500m CPU |
| trend-finder | 8082 | 2 | 256Mi-512Mi RAM, 250m-500m CPU |
| redis | 6379 | 1 | 256Mi-512Mi RAM, 250m-500m CPU |

### Auto-scaling
- Product Mapper: 1-10 pods (70% CPU)
- Trend Finder: 1-5 pods (70% CPU)

## 🐳 Docker Images

Images are stored in Artifact Registry:
```
us-central1-docker.pkg.dev/affiliateflow-abzfy/affiliate-flow-images/
  ├── master-ai-orchestrator:latest
  ├── product-mapper:latest
  ├── trend-finder:latest
  └── image-generator:latest
```

## 🔐 Secrets Management

### Gemini API Key
```powershell
kubectl create secret generic gemini-api \
  --from-literal=api-key=YOUR_API_KEY \
  --namespace=affiliate-flow
```

### Update existing secret
```powershell
kubectl delete secret gemini-api -n affiliate-flow
kubectl create secret generic gemini-api \
  --from-literal=api-key=NEW_API_KEY \
  --namespace=affiliate-flow
```

## 🌐 Ingress & Networking

### Configure Domain
Edit `infrastructure/kubernetes/manifests/ingress.yaml`:
```yaml
spec:
  tls:
  - hosts:
    - api.yourdomain.com  # Your domain
    secretName: affiliate-flow-tls
  rules:
  - host: api.yourdomain.com  # Your domain
```

### Install NGINX Ingress Controller
```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### Install cert-manager (for SSL)
```powershell
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

## 📊 Monitoring

### View resource usage
```powershell
kubectl top nodes
kubectl top pods -n affiliate-flow
```

### Watch pod status
```powershell
kubectl get pods -n affiliate-flow --watch
```

### View events
```powershell
kubectl get events -n affiliate-flow --sort-by='.lastTimestamp'
```

## 🔍 Troubleshooting

### Pod won't start
```powershell
kubectl describe pod <pod-name> -n affiliate-flow
kubectl logs <pod-name> -n affiliate-flow
```

### Image pull errors
```powershell
# Verify image exists
gcloud artifacts docker images list us-central1-docker.pkg.dev/affiliateflow-abzfy/affiliate-flow-images

# Re-authenticate Docker
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Service not accessible
```powershell
# Check service endpoints
kubectl get endpoints -n affiliate-flow

# Test from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -n affiliate-flow -- wget -O- http://orchestrator-service
```

### Memory/CPU issues
```powershell
# Check resource usage
kubectl top pods -n affiliate-flow

# Scale down temporarily
kubectl scale deployment/product-mapper --replicas=1 -n affiliate-flow
```

## 🧹 Cleanup

### Delete all deployments
```powershell
kubectl delete namespace affiliate-flow
```

### Delete cluster
```powershell
gcloud container clusters delete affiliateflow-cluster --region=us-central1 --project=affiliateflow-abzfy
```

### Delete Artifact Registry repository
```powershell
gcloud artifacts repositories delete affiliate-flow-images --location=us-central1 --project=affiliateflow-abzfy
```

## 💰 Cost Optimization

### Scale down when not in use
```powershell
kubectl scale deployment --all --replicas=0 -n affiliate-flow
```

### Scale back up
```powershell
kubectl scale deployment/master-ai-orchestrator --replicas=2 -n affiliate-flow
kubectl scale deployment/product-mapper --replicas=3 -n affiliate-flow
kubectl scale deployment/trend-finder --replicas=2 -n affiliate-flow
```

### Use smaller nodes
Edit `deploy-k8s-cluster.ps1`:
```powershell
$MACHINE_TYPE = "e2-small"  # Instead of e2-standard-4
```

## 📚 Additional Resources

- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)

## 🆘 Support

For issues with:
- **GKE**: Run `.\scripts\deployment\troubleshoot-k8s.ps1`
- **Images**: Check Artifact Registry console
- **Services**: View logs with `kubectl logs -f <pod-name> -n affiliate-flow`
- **Networking**: Check ingress with `kubectl describe ingress -n affiliate-flow`
