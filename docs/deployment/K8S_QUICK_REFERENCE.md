# AffiliateFlow Kubernetes Quick Reference

## 🚀 Deployment Commands

### Initial Setup
```powershell
# 1. Deploy cluster and services
.\scripts\deployment\deploy-k8s-cluster.ps1

# 2. Build and push Docker images
.\scripts\deployment\build-and-push-images.ps1

# 3. Verify everything is working
.\scripts\deployment\troubleshoot-k8s.ps1
```

## 🎛️ Daily Operations

### Check Status
```powershell
kubectl get all -n affiliate-flow
kubectl get pods -n affiliate-flow
kubectl get services -n affiliate-flow
```

### View Logs
```powershell
# Orchestrator
kubectl logs -f deployment/master-ai-orchestrator -n affiliate-flow

# Product Mapper
kubectl logs -f deployment/product-mapper -n affiliate-flow

# Trend Finder
kubectl logs -f deployment/trend-finder -n affiliate-flow

# Redis
kubectl logs -f deployment/redis -n affiliate-flow
```

### Restart Services
```powershell
# Restart all
kubectl rollout restart deployment -n affiliate-flow

# Restart specific service
kubectl rollout restart deployment/master-ai-orchestrator -n affiliate-flow
```

### Scale Services
```powershell
# Scale up
kubectl scale deployment/product-mapper --replicas=5 -n affiliate-flow

# Scale down
kubectl scale deployment/product-mapper --replicas=1 -n affiliate-flow

# Scale all to zero (save costs)
kubectl scale deployment --all --replicas=0 -n affiliate-flow
```

## 🔧 Configuration Updates

### Update Environment Variables
```powershell
# Edit deployment
kubectl edit deployment/master-ai-orchestrator -n affiliate-flow

# Or update via manifest
kubectl apply -f infrastructure/kubernetes/manifests/master-ai-orchestrator.yaml
```

### Update Secrets
```powershell
# Update Gemini API key
kubectl delete secret gemini-api -n affiliate-flow
kubectl create secret generic gemini-api --from-literal=api-key=NEW_KEY -n affiliate-flow

# Restart to pick up new secret
kubectl rollout restart deployment -n affiliate-flow
```

## 🐳 Image Management

### Build New Images
```powershell
.\scripts\deployment\build-and-push-images.ps1
```

### Force Pull New Images
```powershell
# Delete pods to force pull
kubectl delete pods -l app=orchestrator -n affiliate-flow

# Or restart deployment
kubectl rollout restart deployment/master-ai-orchestrator -n affiliate-flow
```

### Manual Build & Push
```powershell
# Build
docker build -t us-central1-docker.pkg.dev/affiliateflow-abzfy/affiliate-flow-images/SERVICE:latest ./services/SERVICE

# Push
docker push us-central1-docker.pkg.dev/affiliateflow-abzfy/affiliate-flow-images/SERVICE:latest

# Update deployment
kubectl rollout restart deployment/SERVICE -n affiliate-flow
```

## 🔍 Debugging

### Get Pod Details
```powershell
# List all pods
kubectl get pods -n affiliate-flow

# Describe specific pod
kubectl describe pod POD_NAME -n affiliate-flow

# Get pod YAML
kubectl get pod POD_NAME -n affiliate-flow -o yaml
```

### Execute Commands in Pod
```powershell
# Get shell access
kubectl exec -it POD_NAME -n affiliate-flow -- /bin/sh

# Run single command
kubectl exec POD_NAME -n affiliate-flow -- ls -la

# For Node.js services
kubectl exec POD_NAME -n affiliate-flow -- node --version
```

### Port Forwarding
```powershell
# Orchestrator
kubectl port-forward service/orchestrator-service 8080:80 -n affiliate-flow

# Product Mapper
kubectl port-forward service/product-mapper-service 8081:80 -n affiliate-flow

# Redis
kubectl port-forward service/redis-service 6379:6379 -n affiliate-flow
```

## 📊 Monitoring

### Resource Usage
```powershell
# Node usage
kubectl top nodes

# Pod usage
kubectl top pods -n affiliate-flow

# Specific pod
kubectl top pod POD_NAME -n affiliate-flow
```

### Events & Status
```powershell
# Recent events
kubectl get events -n affiliate-flow --sort-by='.lastTimestamp'

# Watch pod status
kubectl get pods -n affiliate-flow --watch

# Deployment rollout status
kubectl rollout status deployment/master-ai-orchestrator -n affiliate-flow
```

## 🌐 Networking

### Check Services
```powershell
# List services
kubectl get services -n affiliate-flow

# Service details
kubectl describe service orchestrator-service -n affiliate-flow

# Service endpoints
kubectl get endpoints -n affiliate-flow
```

### Check Ingress
```powershell
# List ingress
kubectl get ingress -n affiliate-flow

# Ingress details
kubectl describe ingress affiliate-flow-ingress -n affiliate-flow
```

### Test Service Connectivity
```powershell
# From within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -n affiliate-flow -- wget -O- http://orchestrator-service

# DNS test
kubectl run -it --rm debug --image=busybox --restart=Never -n affiliate-flow -- nslookup orchestrator-service
```

## 🔄 Updates & Rollbacks

### Update Deployment
```powershell
# Apply updated manifest
kubectl apply -f infrastructure/kubernetes/manifests/DEPLOYMENT.yaml

# Check rollout
kubectl rollout status deployment/DEPLOYMENT_NAME -n affiliate-flow
```

### Rollback
```powershell
# Rollback to previous version
kubectl rollout undo deployment/master-ai-orchestrator -n affiliate-flow

# Rollback to specific revision
kubectl rollout undo deployment/master-ai-orchestrator --to-revision=2 -n affiliate-flow

# View rollout history
kubectl rollout history deployment/master-ai-orchestrator -n affiliate-flow
```

## 🧹 Cleanup & Maintenance

### Delete Resources
```powershell
# Delete specific deployment
kubectl delete deployment master-ai-orchestrator -n affiliate-flow

# Delete all in namespace
kubectl delete all --all -n affiliate-flow

# Delete namespace (removes everything)
kubectl delete namespace affiliate-flow
```

### Restart Cluster
```powershell
# Get cluster credentials
gcloud container clusters get-credentials affiliateflow-cluster --region=us-central1 --project=affiliateflow-abzfy

# Verify connection
kubectl cluster-info
```

## 💾 Backup & Restore

### Export Resources
```powershell
# Export all manifests
kubectl get all -n affiliate-flow -o yaml > backup.yaml

# Export specific deployment
kubectl get deployment master-ai-orchestrator -n affiliate-flow -o yaml > orchestrator-backup.yaml
```

### Restore
```powershell
kubectl apply -f backup.yaml
```

## ⚡ Performance Tuning

### Horizontal Pod Autoscaler
```powershell
# Check HPA status
kubectl get hpa -n affiliate-flow

# Describe HPA
kubectl describe hpa product-mapper-hpa -n affiliate-flow

# Create/update HPA
kubectl autoscale deployment product-mapper --min=2 --max=10 --cpu-percent=70 -n affiliate-flow
```

### Resource Limits
```powershell
# View resource requests/limits
kubectl describe pod POD_NAME -n affiliate-flow | grep -A 5 "Limits:"
```

## 🔐 Security

### View Secrets
```powershell
# List secrets
kubectl get secrets -n affiliate-flow

# Describe secret (won't show values)
kubectl describe secret gemini-api -n affiliate-flow

# Get secret value (base64 encoded)
kubectl get secret gemini-api -n affiliate-flow -o jsonpath='{.data.api-key}' | base64 --decode
```

### Service Accounts
```powershell
# List service accounts
kubectl get serviceaccounts -n affiliate-flow

# Describe service account
kubectl describe serviceaccount orchestrator-sa -n affiliate-flow
```

## 📋 Useful Aliases

Add to PowerShell profile (`$PROFILE`):
```powershell
# Kubernetes aliases
function kgp { kubectl get pods -n affiliate-flow @args }
function kgd { kubectl get deployments -n affiliate-flow @args }
function kgs { kubectl get services -n affiliate-flow @args }
function kl { kubectl logs -f @args -n affiliate-flow }
function ke { kubectl exec -it @args -n affiliate-flow -- /bin/sh }
function kd { kubectl describe @args -n affiliate-flow }
function ka { kubectl apply -f @args }
function kdel { kubectl delete @args -n affiliate-flow }
```

## 🆘 Emergency Commands

### Pods Crashing
```powershell
# 1. Check logs
kubectl logs POD_NAME -n affiliate-flow --previous

# 2. Describe pod for events
kubectl describe pod POD_NAME -n affiliate-flow

# 3. Delete pod (will recreate)
kubectl delete pod POD_NAME -n affiliate-flow
```

### Out of Resources
```powershell
# 1. Check resource usage
kubectl top nodes
kubectl top pods -n affiliate-flow

# 2. Scale down non-critical services
kubectl scale deployment/trend-finder --replicas=1 -n affiliate-flow

# 3. Delete completed jobs/pods
kubectl delete pod --field-selector=status.phase==Succeeded -n affiliate-flow
```

### Image Pull Failures
```powershell
# 1. Re-authenticate
gcloud auth configure-docker us-central1-docker.pkg.dev

# 2. Verify image exists
gcloud artifacts docker images list us-central1-docker.pkg.dev/affiliateflow-abzfy/affiliate-flow-images

# 3. Check service account permissions
kubectl describe pod POD_NAME -n affiliate-flow | grep -A 10 "Events:"
```

## 📞 Quick Support

- **Interactive Manager**: `.\scripts\deployment\manage-k8s-cluster.ps1`
- **Troubleshooter**: `.\scripts\deployment\troubleshoot-k8s.ps1`
- **Full Docs**: `docs\deployment\KUBERNETES_DEPLOYMENT.md`
