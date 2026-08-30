# Affiliate Flow - Infrastructure Command Reference

## Quick Commands

### Project Setup
```powershell
# Set project
gcloud config set project affiliate-flow-prod

# Get project info
gcloud projects describe affiliate-flow-prod

# List enabled APIs
gcloud services list --enabled
```

### Infrastructure Deployment
```powershell
# Deploy everything
cd infrastructure
.\quick-deploy.ps1 -Component all

# Deploy only infrastructure
.\deploy.ps1 -Action apply

# Deploy only services
.\quick-deploy.ps1 -Component services

# Deploy only frontend
.\quick-deploy.ps1 -Component frontend
```

### Kubernetes Management
```powershell
# Get cluster credentials
gcloud container clusters get-credentials affiliate-flow-cluster --region=us-central1

# View all pods
kubectl get pods -n affiliate-flow

# View services
kubectl get svc -n affiliate-flow

# View deployments
kubectl get deployments -n affiliate-flow

# View logs
kubectl logs -f deployment/master-ai-orchestrator -n affiliate-flow

# Scale deployment
kubectl scale deployment master-ai-orchestrator --replicas=5 -n affiliate-flow

# Restart deployment
kubectl rollout restart deployment/master-ai-orchestrator -n affiliate-flow

# Rollback deployment
kubectl rollout undo deployment/master-ai-orchestrator -n affiliate-flow

# View rollout status
kubectl rollout status deployment/master-ai-orchestrator -n affiliate-flow

# Shell into pod
kubectl exec -it POD_NAME -n affiliate-flow -- /bin/sh

# Port forward
kubectl port-forward service/orchestrator-service 8080:80 -n affiliate-flow
```

### Secret Management
```powershell
# Create secrets
cd infrastructure/kubernetes
.\create-secrets.ps1

# View secrets
kubectl get secrets -n affiliate-flow

# Describe secret
kubectl describe secret gemini-api -n affiliate-flow

# Update secret
kubectl create secret generic gemini-api --from-literal=api-key=NEW_KEY -n affiliate-flow --dry-run=client -o yaml | kubectl apply -f -

# Delete secret
kubectl delete secret SECRET_NAME -n affiliate-flow
```

### Container Registry
```powershell
# Configure Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# List images
gcloud artifacts docker images list us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images

# Delete image
gcloud artifacts docker images delete us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/IMAGE:TAG
```

### Build & Deploy
```powershell
# Build orchestrator
cd services/master-ai-orchestrator
docker build -t us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:latest .
docker push us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:latest

# Build product mapper
cd ../product-mapper
docker build -t us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/product-mapper:latest .
docker push us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/product-mapper:latest

# Deploy to Kubernetes
kubectl set image deployment/master-ai-orchestrator master-ai-orchestrator=us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:latest -n affiliate-flow
```

### Monitoring & Logs
```powershell
# View Cloud Logs
gcloud logging read "resource.type=k8s_container AND resource.labels.namespace_name=affiliate-flow" --limit 50

# Stream logs
gcloud logging tail "resource.type=k8s_container AND resource.labels.namespace_name=affiliate-flow"

# View metrics
kubectl top pods -n affiliate-flow
kubectl top nodes

# Get HPA status
kubectl get hpa -n affiliate-flow

# View events
kubectl get events -n affiliate-flow --sort-by='.lastTimestamp'
```

### Database Operations
```powershell
# Firestore export
gcloud firestore export gs://affiliate-flow-prod-backups/$(Get-Date -Format 'yyyy-MM-dd')

# Firestore import
gcloud firestore import gs://affiliate-flow-prod-backups/2025-10-10

# BigQuery query
bq query --use_legacy_sql=false 'SELECT * FROM `affiliate_analytics.user_activity` LIMIT 10'

# Redis CLI
kubectl run redis-client --rm -it --image=redis:7-alpine -n affiliate-flow -- redis-cli -h REDIS_HOST -a REDIS_AUTH
```

### Cost Management
```powershell
# View billing
gcloud billing accounts list
gcloud billing projects describe affiliate-flow-prod

# Export billing to BigQuery
gcloud beta billing accounts set-iam-policy BILLING_ACCOUNT billing-export-policy.yaml

# Query costs
bq query --use_legacy_sql=false 'SELECT service.description, SUM(cost) as total_cost FROM `billing_export.gcp_billing_export_v1_BILLING_ID` WHERE _PARTITIONTIME >= "2025-10-01" GROUP BY service.description ORDER BY total_cost DESC'
```

### Security
```powershell
# List IAM policies
gcloud projects get-iam-policy affiliate-flow-prod

# Add IAM member
gcloud projects add-iam-policy-binding affiliate-flow-prod --member="user:email@example.com" --role="roles/viewer"

# List secrets
gcloud secrets list

# Access secret
gcloud secrets versions access latest --secret=gemini-api-key

# Rotate secret
gcloud secrets versions add gemini-api-key --data-file=-
```

### Troubleshooting
```powershell
# Describe pod for debugging
kubectl describe pod POD_NAME -n affiliate-flow

# Get pod YAML
kubectl get pod POD_NAME -n affiliate-flow -o yaml

# Check resource quotas
kubectl describe resourcequota -n affiliate-flow

# Check network policies
kubectl get networkpolicies -n affiliate-flow

# Test DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup orchestrator-service.affiliate-flow.svc.cluster.local

# Check cluster info
kubectl cluster-info
kubectl get nodes
kubectl describe node NODE_NAME
```

### Cleanup
```powershell
# Delete deployment
kubectl delete deployment DEPLOYMENT_NAME -n affiliate-flow

# Delete service
kubectl delete service SERVICE_NAME -n affiliate-flow

# Delete namespace (WARNING: deletes everything!)
kubectl delete namespace affiliate-flow

# Destroy infrastructure (WARNING!)
cd infrastructure
terraform destroy
```

### Terraform Commands
```powershell
# Initialize
cd infrastructure/terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources
terraform state list

# Import existing resource
terraform import module.gke.google_container_cluster.primary projects/affiliate-flow-prod/locations/us-central1/clusters/affiliate-flow-cluster

# Refresh state
terraform refresh

# Format code
terraform fmt -recursive

# Validate
terraform validate

# Destroy
terraform destroy
```

### Cloud Build
```powershell
# List builds
gcloud builds list --limit=10

# View build logs
gcloud builds log BUILD_ID

# Trigger build manually
gcloud builds submit --config=cloudbuild.yaml .

# List triggers
gcloud builds triggers list

# Run trigger
gcloud builds triggers run TRIGGER_NAME
```

### Firebase
```powershell
# Deploy hosting
cd client
firebase deploy --only hosting

# Deploy functions
firebase deploy --only functions

# Deploy firestore rules
firebase deploy --only firestore:rules

# Deploy firestore indexes
firebase deploy --only firestore:indexes

# View hosting logs
firebase hosting:channel:list

# Rollback hosting
firebase hosting:rollback
```

### Health Checks
```powershell
# Check service health
curl http://LOAD_BALANCER_IP/health

# Test internal service
kubectl run curl --rm -it --image=curlimages/curl -- curl orchestrator-service.affiliate-flow.svc.cluster.local/health

# Check ingress
kubectl get ingress -n affiliate-flow
kubectl describe ingress affiliate-flow-ingress -n affiliate-flow
```
