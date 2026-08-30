# Phase 6: Security & Compliance

## Overview
Implement security best practices, compliance requirements, and audit logging.

## 6.1 Security Hardening

### Enable VPC Service Controls
```bash
PROJECT_ID="affiliate-flow-prod"

# Create access policy
gcloud access-context-manager policies create \
  --organization=$ORGANIZATION_ID \
  --title="Affiliate Flow Security Policy"

# Create service perimeter
gcloud access-context-manager perimeters create affiliate_flow_perimeter \
  --title="Affiliate Flow Perimeter" \
  --resources=projects/$PROJECT_ID \
  --restricted-services=storage.googleapis.com,bigquery.googleapis.com \
  --policy=$POLICY_ID
```

### Enable Binary Authorization
```bash
# Enable Binary Authorization
gcloud services enable binaryauthorization.googleapis.com

# Create attestor
gcloud container binauthz attestors create prod-attestor \
  --attestation-authority-note=projects/$PROJECT_ID/notes/prod-note \
  --attestation-authority-note-project=$PROJECT_ID

# Update GKE cluster
gcloud container clusters update affiliate-flow-cluster \
  --enable-binauthz \
  --region=us-central1
```

## 6.2 Secret Management

### Rotate Secrets Automatically
```bash
# Create Cloud Function for secret rotation
gcloud functions deploy rotateSecrets \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=./functions/rotate-secrets \
  --entry-point=rotate_secrets \
  --trigger-topic=rotate-secrets-topic \
  --service-account=affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com

# Schedule rotation (every 90 days)
gcloud scheduler jobs create pubsub rotate-secrets-job \
  --location=us-central1 \
  --schedule="0 0 1 */3 *" \
  --topic=rotate-secrets-topic \
  --message-body='{"action":"rotate"}'
```

### Enable Secret Manager Audit Logging
```bash
# Enable Data Access audit logs for Secret Manager
gcloud projects set-iam-policy $PROJECT_ID policy.yaml
```

policy.yaml:
```yaml
auditConfigs:
- auditLogConfigs:
  - logType: DATA_READ
  - logType: DATA_WRITE
  service: secretmanager.googleapis.com
```

## 6.3 Network Security

### Cloud Armor (DDoS Protection)
```bash
# Create security policy
gcloud compute security-policies create affiliate-flow-armor \
  --description="DDoS and WAF protection"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy=affiliate-flow-armor \
  --expression="true" \
  --action=rate-based-ban \
  --rate-limit-threshold-count=100 \
  --rate-limit-threshold-interval-sec=60 \
  --ban-duration-sec=600

# Add geo-blocking (example: block specific countries)
gcloud compute security-policies rules create 2000 \
  --security-policy=affiliate-flow-armor \
  --expression="origin.region_code == 'CN' || origin.region_code == 'RU'" \
  --action=deny-403

# Attach to load balancer
gcloud compute backend-services update BACKEND_SERVICE \
  --security-policy=affiliate-flow-armor
```

### Private Service Connect
```bash
# Create private connection to Google APIs
gcloud compute addresses create google-apis \
  --global \
  --purpose=VPC_PEERING \
  --prefix-length=16 \
  --network=affiliate-flow-vpc

gcloud services vpc-peerings connect \
  --service=servicenetworking.googleapis.com \
  --ranges=google-apis \
  --network=affiliate-flow-vpc
```

## 6.4 Compliance & Audit Logging

### Enable All Audit Logs
```bash
# Get current IAM policy
gcloud projects get-iam-policy $PROJECT_ID > current-policy.yaml

# Add audit config to policy
cat >> current-policy.yaml <<EOF
auditConfigs:
- auditLogConfigs:
  - logType: ADMIN_READ
  - logType: DATA_READ
  - logType: DATA_WRITE
  service: allServices
EOF

# Set updated policy
gcloud projects set-iam-policy $PROJECT_ID current-policy.yaml
```

### Export Logs to BigQuery
```bash
# Create audit log sink
gcloud logging sinks create audit-logs-sink \
  bigquery.googleapis.com/projects/$PROJECT_ID/datasets/audit_logs \
  --log-filter='logName:"cloudaudit.googleapis.com"'

# Create compliance log sink
gcloud logging sinks create compliance-logs \
  bigquery.googleapis.com/projects/$PROJECT_ID/datasets/compliance_logs \
  --log-filter='protoPayload.methodName=~"iam.googleapis.com|secretmanager.googleapis.com"'
```

### Create BigQuery Dataset for Audit Logs
```bash
bq mk \
  --dataset \
  --location=US \
  --description="Audit and compliance logs" \
  ${PROJECT_ID}:audit_logs
```

## 6.5 Data Encryption

### Customer-Managed Encryption Keys (CMEK)
```bash
# Create key ring
gcloud kms keyrings create affiliate-flow-keyring \
  --location=us-central1

# Create encryption key
gcloud kms keys create data-encryption-key \
  --location=us-central1 \
  --keyring=affiliate-flow-keyring \
  --purpose=encryption

# Grant Cloud Storage access to key
gsutil kms authorize \
  -k projects/$PROJECT_ID/locations/us-central1/keyRings/affiliate-flow-keyring/cryptoKeys/data-encryption-key

# Create bucket with CMEK
gsutil mb \
  -p $PROJECT_ID \
  -c STANDARD \
  -l us-central1 \
  -b on \
  --encryption-key=projects/$PROJECT_ID/locations/us-central1/keyRings/affiliate-flow-keyring/cryptoKeys/data-encryption-key \
  gs://${PROJECT_ID}-encrypted-data
```

### Enable Application-Level Encryption
```javascript
// In services/master-ai-orchestrator/encryption.js
const { Kms } = require('@google-cloud/kms');
const kms = new Kms();

async function encryptSensitiveData(data) {
  const keyName = 'projects/PROJECT_ID/locations/us-central1/keyRings/affiliate-flow-keyring/cryptoKeys/data-encryption-key';
  
  const [result] = await kms.encrypt({
    name: keyName,
    plaintext: Buffer.from(data),
  });
  
  return result.ciphertext;
}
```

## 6.6 Vulnerability Scanning

### Container Scanning
```bash
# Enable Container Scanning API
gcloud services enable containerscanning.googleapis.com

# Configure automatic scanning
gcloud artifacts repositories set-iam-policy affiliate-flow-images \
  --location=us-central1 \
  policy-container-scanning.yaml
```

### Dependency Scanning
```yaml
# In cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/npm'
  args: ['audit', '--audit-level=moderate']
  
- name: 'aquasec/trivy'
  args: ['image', '--severity', 'HIGH,CRITICAL', '$IMAGE']
```

## 6.7 Identity & Access Management

### Least Privilege Principle
```bash
# Remove overly permissive roles
gcloud projects remove-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:BAD_SERVICE_ACCOUNT" \
  --role="roles/owner"

# Use fine-grained custom roles
gcloud iam roles create affiliateFlowOrchestrator \
  --project=$PROJECT_ID \
  --title="Affiliate Flow Orchestrator" \
  --permissions="cloudtasks.tasks.create,secretmanager.versions.access,aiplatform.endpoints.predict"
```

### Service Account Impersonation
```bash
# Allow specific users to impersonate service accounts
gcloud iam service-accounts add-iam-policy-binding \
  affiliate-flow-orchestrator@${PROJECT_ID}.iam.gserviceaccount.com \
  --member="user:admin@example.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --condition=None
```

## 6.8 Monitoring & Alerting for Security

### Security Command Center
```bash
# Enable Security Command Center
gcloud services enable securitycenter.googleapis.com

# Create notification config
gcloud scc notifications create security-alerts \
  --organization=$ORGANIZATION_ID \
  --pubsub-topic=projects/$PROJECT_ID/topics/security-alerts \
  --filter="category=\"CRITICAL\""
```

### Create Security Alerts
```bash
# Alert on IAM changes
gcloud alpha monitoring policies create \
  --notification-channels=$NOTIFICATION_CHANNEL_ID \
  --display-name="IAM Policy Change Alert" \
  --condition-display-name="IAM policy modified" \
  --condition-filter='resource.type="project" AND protoPayload.methodName="SetIamPolicy"'
```

## 6.9 Incident Response

### Create Incident Response Runbook
See: `security/incident-response-runbook.md`

### Configure Automated Responses
```bash
# Cloud Function for automated incident response
gcloud functions deploy respondToIncident \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=./functions/incident-response \
  --entry-point=respond_to_incident \
  --trigger-topic=security-incidents
```

## Cost Estimation
- VPC Service Controls: Free
- Binary Authorization: Free
- Cloud KMS: $0.06/key version/month + $0.03 per 10K operations
- Security Command Center: Standard tier free, Premium ~$350/month
- Cloud Armor: $0.75/policy/month + $0.50 per million requests

Security costs: ~$50-100/month (Standard) or ~$400-500/month (Premium)
