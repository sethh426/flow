# Affiliate Flow - Production Deployment Checklist

## Pre-Deployment Checklist

### Infrastructure Setup
- [ ] GCP Project created and configured
- [ ] Billing account linked
- [ ] All required APIs enabled
- [ ] Service accounts created with proper permissions
- [ ] Workload Identity configured
- [ ] VPC network and subnets created
- [ ] Cloud NAT configured
- [ ] Firewall rules set up

### GKE Cluster
- [ ] GKE Autopilot cluster created
- [ ] Cluster credentials configured locally
- [ ] Kubernetes namespaces created
- [ ] Workload Identity bindings configured
- [ ] NGINX Ingress Controller installed
- [ ] Cert-Manager installed for SSL
- [ ] KEDA installed for autoscaling

### Data Layer
- [ ] Firestore database initialized
- [ ] Firestore rules deployed
- [ ] Firestore indexes created
- [ ] BigQuery datasets created
- [ ] BigQuery tables schema deployed
- [ ] Cloud Tasks queues configured
- [ ] Cloud Storage buckets created
- [ ] Bucket lifecycle policies set
- [ ] Redis instance provisioned

### AI Infrastructure
- [ ] Gemini API key stored in Secret Manager
- [ ] Vertex AI APIs enabled
- [ ] AI quota limits configured
- [ ] Cost tracking BigQuery views created
- [ ] Billing export to BigQuery configured

### Security
- [ ] All secrets moved to Secret Manager
- [ ] Service account keys rotated
- [ ] Audit logging enabled
- [ ] VPC Service Controls configured (optional)
- [ ] Binary Authorization enabled (optional)
- [ ] Cloud Armor policies created
- [ ] CMEK configured for sensitive data (optional)

### Monitoring & Alerting
- [ ] Cloud Monitoring notification channels created
- [ ] Alert policies configured:
  - [ ] High error rate alert
  - [ ] High latency alert
  - [ ] High AI cost alert
  - [ ] IAM change alert
- [ ] Uptime checks configured
- [ ] Log sinks to BigQuery created
- [ ] Custom dashboards created

### CI/CD
- [ ] Cloud Build triggers created
- [ ] GitHub repository connected
- [ ] Build configuration files committed
- [ ] Container images built and pushed to Artifact Registry
- [ ] ArgoCD installed (if using GitOps)
- [ ] Deployment pipelines tested

## Deployment Steps

### 1. Deploy Infrastructure with Terraform
```powershell
cd infrastructure
.\deploy.ps1 -Action plan
.\deploy.ps1 -Action apply
```

**Verify:**
- [ ] All Terraform resources created successfully
- [ ] No errors in Terraform output
- [ ] GKE cluster accessible

### 2. Configure Kubernetes Secrets
```powershell
kubectl create secret generic gemini-api -n affiliate-flow --from-literal=api-key=$GEMINI_API_KEY
kubectl create secret generic firebase-admin -n affiliate-flow --from-file=serviceAccountKey.json
```

**Verify:**
- [ ] Secrets created in affiliate-flow namespace
- [ ] Secrets contain correct values

### 3. Build and Push Container Images
```powershell
# Configure Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build orchestrator
cd services/master-ai-orchestrator
docker build -t us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:v1.0.0 .
docker push us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/master-ai-orchestrator:v1.0.0

# Build product mapper
cd ../product-mapper
docker build -t us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/product-mapper:v1.0.0 .
docker push us-central1-docker.pkg.dev/affiliate-flow-prod/affiliate-flow-images/product-mapper:v1.0.0
```

**Verify:**
- [ ] Images visible in Artifact Registry
- [ ] Image tags correct
- [ ] No critical vulnerabilities in scans

### 4. Deploy Kubernetes Manifests
```powershell
# Update image references in manifests
kubectl apply -f infrastructure/kubernetes/manifests/ -n affiliate-flow
```

**Verify:**
- [ ] All deployments successful
- [ ] Pods running: `kubectl get pods -n affiliate-flow`
- [ ] Services created: `kubectl get svc -n affiliate-flow`
- [ ] No CrashLoopBackOff errors

### 5. Deploy Frontend to Firebase Hosting
```powershell
cd client
npm run build
firebase deploy --only hosting --project flow-69826693-f6d27
```

**Verify:**
- [ ] Build completed without errors
- [ ] Deployment successful
- [ ] Website accessible at https://flow-69826693-f6d27.web.app

### 6. Initialize Firestore Data
```powershell
node seed-demo-data.js
```

**Verify:**
- [ ] Demo data populated
- [ ] Firestore rules working correctly
- [ ] Indexes built successfully

### 7. Configure Custom Domain (Optional)
```powershell
# Add custom domain in Firebase Console
firebase hosting:channel:deploy production --only hosting
```

**Verify:**
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] Domain accessible

## Post-Deployment Verification

### Functional Testing
- [ ] User registration works
- [ ] User login works
- [ ] Product search returns results
- [ ] AI content generation works
- [ ] Product mapping works
- [ ] Flow Coins system functional
- [ ] Analytics tracking works

### Performance Testing
- [ ] Response times < 2s for API calls
- [ ] Page load times < 3s
- [ ] AI generation < 10s
- [ ] No memory leaks detected
- [ ] Autoscaling triggers properly

### Security Testing
- [ ] Authentication required for protected routes
- [ ] API keys not exposed in client
- [ ] CORS configured correctly
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] Rate limiting working

### Monitoring
- [ ] Metrics appearing in Cloud Monitoring
- [ ] Logs flowing to Cloud Logging
- [ ] Alerts triggering correctly (test)
- [ ] Dashboards showing data
- [ ] Cost tracking active in BigQuery

## Rollback Plan

If deployment fails:

### 1. Rollback Kubernetes Deployment
```powershell
kubectl rollout undo deployment/master-ai-orchestrator -n affiliate-flow
kubectl rollout undo deployment/product-mapper -n affiliate-flow
```

### 2. Rollback Frontend
```powershell
firebase hosting:rollback --project flow-69826693-f6d27
```

### 3. Rollback Infrastructure (if needed)
```powershell
cd infrastructure
terraform apply -target=module.MODULE_NAME tfplan-previous
```

## Production Checklist

### Daily Operations
- [ ] Check error logs
- [ ] Review cost dashboard
- [ ] Monitor AI usage metrics
- [ ] Check autoscaling events

### Weekly Operations
- [ ] Review security alerts
- [ ] Check backup integrity
- [ ] Review performance metrics
- [ ] Update dependencies (if patches available)

### Monthly Operations
- [ ] Security audit
- [ ] Cost optimization review
- [ ] Capacity planning review
- [ ] Disaster recovery drill

## Emergency Contacts

- **On-Call Engineer**: [Your Contact]
- **GCP Support**: cloud.google.com/support
- **Firebase Support**: firebase.google.com/support

## Documentation Links

- [Infrastructure README](infrastructure/README.md)
- [API Documentation](docs/api.md)
- [Runbook](docs/runbook.md)
- [Incident Response](security/incident-response.md)

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Sign-off**: _____________
