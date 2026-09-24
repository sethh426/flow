> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# GCP Infrastructure Setup for Affiliate Flow
# Phase-based deployment strategy

## Phase 1: Foundation & Security (Months 1-3)

### 1. Enable Required APIs
```bash
gcloud services enable \
  cloudfunctions.googleapis.com \
  pubsub.googleapis.com \
  firestore.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  cloudtasks.googleapis.com \
  workflows.googleapis.com \
  eventarc.googleapis.com \
  run.googleapis.com
```

### 2. Workload Identity Federation (Eliminate Service Account Keys)
```bash
# Create Workload Identity Pool
gcloud iam workload-identity-pools create affiliate-flow-pool \
  --location="global" \
  --description="Workload Identity Pool for Affiliate Flow" \
  --display-name="Affiliate Flow Pool"

# Create Provider for GitHub Actions
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location="global" \
  --workload-identity-pool="affiliate-flow-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository_owner=='luxcognita'"

# Grant permissions to Workload Identity
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/affiliate-flow-pool/attribute.repository/luxcognita/affiliateflow-unified" \
  --role="roles/cloudfunctions.developer"
```

### 3. Secret Manager Setup
```bash
# Create secrets for API keys
gcloud secrets create shopify-api-key --data-file=- <<< "YOUR_SHOPIFY_KEY"
gcloud secrets create stripe-api-key --data-file=- <<< "YOUR_STRIPE_KEY"
gcloud secrets create klaviyo-api-key --data-file=- <<< "YOUR_KLAVIYO_KEY"
gcloud secrets create gemini-api-key --data-file=- <<< "YOUR_GEMINI_KEY"

# Grant access to Cloud Functions
gcloud secrets add-iam-policy-binding shopify-api-key \
  --member="serviceAccount:affiliate-flow-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Service Accounts (Minimal Permissions)
```bash
# Create dedicated service accounts
gcloud iam service-accounts create affiliate-flow-sa \
  --description="Service account for Affiliate Flow Cloud Functions" \
  --display-name="Affiliate Flow SA"

gcloud iam service-accounts create workflow-orchestrator-sa \
  --description="Service account for workflow orchestration" \
  --display-name="Workflow Orchestrator SA"

# Grant minimal required roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:affiliate-flow-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:workflow-orchestrator-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/workflows.invoker"
```

### 5. Firestore Multi-Tenancy Setup
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tenant isolation
    match /tenants/{tenantId}/{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.tenantId == tenantId;
    }

    // Business profiles with classification
    match /businesses/{businessId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && (request.auth.uid == resource.data.ownerId
            || request.auth.token.admin == true);
    }

    // Workflow templates (read-only for users)
    match /workflow_templates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }

    // User workflows
    match /user_workflows/{workflowId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }

    // Execution logs (audit trail)
    match /execution_logs/{logId} {
      allow read: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

### 6. Firestore Indexes
```json
{
  "indexes": [
    {
      "collectionGroup": "businesses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "vertical", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_workflows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "lastExecuted", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "execution_logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "workflowId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Phase 2: Classification & Routing (Months 4-6)

### 7. Cloud Function: Business Classifier
```bash
gcloud functions deploy classifyBusiness \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=./functions/classifier \
  --entry-point=classifyBusiness \
  --trigger-http \
  --allow-unauthenticated=false \
  --service-account=affiliate-flow-sa@PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars=FIRESTORE_DATABASE="(default)" \
  --max-instances=100 \
  --timeout=540s
```

### 8. Pub/Sub Topics for Event Distribution
```bash
# Create topics
gcloud pubsub topics create business-classified
gcloud pubsub topics create workflow-triggered
gcloud pubsub topics create workflow-completed
gcloud pubsub topics create workflow-failed

# Create subscriptions
gcloud pubsub subscriptions create business-classified-sub \
  --topic=business-classified \
  --ack-deadline=60 \
  --message-retention-duration=7d

gcloud pubsub subscriptions create workflow-triggered-sub \
  --topic=workflow-triggered \
  --ack-deadline=300 \
  --message-retention-duration=7d
```

### 9. Cloud Tasks for Rate-Limited API Calls
```bash
# Create queue for API rate limiting
gcloud tasks queues create api-requests \
  --max-dispatches-per-second=10 \
  --max-concurrent-dispatches=50 \
  --max-attempts=5 \
  --min-backoff=1s \
  --max-backoff=300s \
  --max-retry-duration=3600s

# Create queue for email sending
gcloud tasks queues create email-queue \
  --max-dispatches-per-second=100 \
  --max-concurrent-dispatches=200

# Create queue for webhook processing
gcloud tasks queues create webhook-queue \
  --max-dispatches-per-second=50 \
  --max-concurrent-dispatches=100
```

### 10. Workflows: State Machine Orchestration
```yaml
# workflow-orchestrator.yaml
main:
  params: [input]
  steps:
    - classify:
        call: http.post
        args:
          url: https://REGION-PROJECT_ID.cloudfunctions.net/classifyBusiness
          auth:
            type: OIDC
          body:
            businessProfile: ${input.profile}
        result: classification

    - checkConfidence:
        switch:
          - condition: ${classification.body.confidence >= 95}
            next: autoRoute
          - condition: ${classification.body.confidence >= 70}
            next: routeWithMonitoring
          - condition: true
            next: manualReview

    - autoRoute:
        call: http.post
        args:
          url: https://REGION-PROJECT_ID.cloudfunctions.net/activateWorkflow
          auth:
            type: OIDC
          body:
            vertical: ${classification.body.vertical}
            businessId: ${input.businessId}
            autoApproved: true
        next: complete

    - routeWithMonitoring:
        call: http.post
        args:
          url: https://REGION-PROJECT_ID.cloudfunctions.net/activateWorkflow
          auth:
            type: OIDC
          body:
            vertical: ${classification.body.vertical}
            businessId: ${input.businessId}
            requiresMonitoring: true
        next: scheduleReview

    - scheduleReview:
        call: googleapis.cloudscheduler.v1.projects.locations.jobs.create
        args:
          parent: projects/PROJECT_ID/locations/REGION
          body:
            schedule: "0 9 * * 1"  # Weekly Monday 9 AM
            timeZone: "America/Los_Angeles"
            httpTarget:
              uri: https://REGION-PROJECT_ID.cloudfunctions.net/reviewWorkflow
              httpMethod: POST
              body: ${base64.encode(json.encode({"businessId": input.businessId}))}
        next: complete

    - manualReview:
        call: http.post
        args:
          url: https://REGION-PROJECT_ID.cloudfunctions.net/queueForReview
          auth:
            type: OIDC
          body:
            businessId: ${input.businessId}
            classification: ${classification.body}
            reason: "Low confidence score"
        next: complete

    - complete:
        return: ${classification}
```

Deploy workflow:
```bash
gcloud workflows deploy workflow-orchestrator \
  --source=workflow-orchestrator.yaml \
  --service-account=workflow-orchestrator-sa@PROJECT_ID.iam.gserviceaccount.com \
  --location=us-central1
```

## Phase 3: Expand Verticals (Months 7-9)

### 11. Eventarc Triggers for Automation
```bash
# Trigger on Firestore business creation
gcloud eventarc triggers create business-created-trigger \
  --location=us-central1 \
  --destination-run-service=classify-business-service \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.firestore.document.v1.created" \
  --event-filters="database=(default)" \
  --event-filters-path-pattern="document=businesses/{businessId}" \
  --service-account=affiliate-flow-sa@PROJECT_ID.iam.gserviceaccount.com

# Trigger on workflow completion
gcloud eventarc triggers create workflow-completed-trigger \
  --location=us-central1 \
  --destination-run-service=analytics-processor \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.pubsub.topic.v1.messagePublished" \
  --event-filters="topic=workflow-completed" \
  --service-account=affiliate-flow-sa@PROJECT_ID.iam.gserviceaccount.com
```

### 12. Cloud Run Services for Long-Running Tasks
```bash
# Deploy workflow executor
gcloud run deploy workflow-executor \
  --source=./services/workflow-executor \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated=false \
  --service-account=affiliate-flow-sa@PROJECT_ID.iam.gserviceaccount.com \
  --memory=2Gi \
  --cpu=2 \
  --timeout=3600s \
  --max-instances=50 \
  --set-env-vars=NODE_ENV=production

# Deploy webhook receiver
gcloud run deploy webhook-receiver \
  --source=./services/webhook-receiver \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated=true \
  --service-account=affiliate-flow-sa@PROJECT_ID.iam.gserviceaccount.com \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60s \
  --max-instances=100
```

## Phase 4: Security & Compliance

### 13. VPC Service Controls (Prevent Data Exfiltration)
```bash
# Create access policy
gcloud access-context-manager policies create \
  --title="Affiliate Flow Access Policy" \
  --organization=ORGANIZATION_ID

# Create service perimeter
gcloud access-context-manager perimeters create affiliate_flow_perimeter \
  --title="Affiliate Flow Perimeter" \
  --resources=projects/PROJECT_NUMBER \
  --restricted-services=storage.googleapis.com,firestore.googleapis.com \
  --access-levels=BASIC_LEVEL \
  --policy=POLICY_ID
```

### 14. Audit Logging
```bash
# Enable Data Access logs
gcloud logging sinks create affiliate-flow-audit-sink \
  gs://affiliate-flow-audit-logs \
  --log-filter='protoPayload.serviceName="firestore.googleapis.com" OR protoPayload.serviceName="cloudfunctions.googleapis.com"'

# Create log-based metrics
gcloud logging metrics create workflow_execution_count \
  --description="Count of workflow executions" \
  --log-filter='resource.type="cloud_function" AND jsonPayload.event="workflow_executed"'

gcloud logging metrics create classification_accuracy \
  --description="Classification confidence scores" \
  --log-filter='resource.type="cloud_function" AND jsonPayload.event="business_classified"' \
  --value-extractor='EXTRACT(jsonPayload.confidence)'
```

### 15. Monitoring & Alerting
```bash
# Create alert for low classification confidence
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Low Classification Confidence" \
  --condition-display-name="Confidence < 70%" \
  --condition-threshold-value=70 \
  --condition-threshold-duration=60s \
  --condition-threshold-comparison=COMPARISON_LT \
  --condition-threshold-filter='metric.type="logging.googleapis.com/user/classification_accuracy"'

# Create alert for failed workflows
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Workflow Failures" \
  --condition-display-name="Failure rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s \
  --condition-threshold-comparison=COMPARISON_GT
```

## Deployment Checklist

### Phase 1 (Months 1-3)
- [ ] Enable all required GCP APIs
- [ ] Configure Workload Identity Federation
- [ ] Set up Secret Manager with all API keys
- [ ] Create service accounts with minimal IAM roles
- [ ] Deploy Firestore with security rules
- [ ] Create Firestore indexes
- [ ] Deploy initial Cloud Function (webhook handler)
- [ ] Test with one vertical (Digital Products or Trade Services)

### Phase 2 (Months 4-6)
- [ ] Deploy business classifier Cloud Function
- [ ] Set up Pub/Sub topics and subscriptions
- [ ] Configure Cloud Tasks queues
- [ ] Deploy Workflows orchestrator
- [ ] Implement progressive onboarding flow
- [ ] Test classification with 100+ sample businesses
- [ ] Validate 95%+ auto-routing accuracy

### Phase 3 (Months 7-9)
- [ ] Add 3 additional verticals (Dropshipping, Real Estate, Automotive)
- [ ] Deploy Eventarc triggers
- [ ] Deploy Cloud Run services for long-running tasks
- [ ] Implement A/B testing for classification logic
- [ ] Build analytics dashboards
- [ ] Load testing (simulate 1000+ concurrent users)

### Phase 4 (Months 10-12)
- [ ] Add remaining verticals (Personal Brand, Hybrid)
- [ ] Configure VPC Service Controls
- [ ] Enable comprehensive audit logging
- [ ] Set up monitoring dashboards
- [ ] Create alert policies
- [ ] Security audit and penetration testing
- [ ] FTC Safeguards Rule compliance review (automotive)
- [ ] Document incident response procedures

## Cost Optimization

### Expected Monthly Costs (Production)
- Cloud Functions: $50-200 (100K invocations)
- Cloud Run: $100-300 (24/7 services)
- Firestore: $100-500 (1M reads, 500K writes)
- Pub/Sub: $10-50 (10M messages)
- Cloud Tasks: $5-20 (100K tasks)
- Workflows: $20-100 (10K executions)
- Secret Manager: $1-5
- Logging: $50-200
- **Total: $336-1,375/month**

### Free Tier Utilization
- Cloud Functions: 2M invocations/month free
- Cloud Run: 2M requests/month free
- Firestore: 50K reads, 20K writes/day free
- Pub/Sub: 10 GB/month free

## Security Best Practices

1. **No Service Account Keys**: Use Workload Identity Federation exclusively
2. **Principle of Least Privilege**: Each service account has minimal required permissions
3. **Secret Rotation**: Rotate API keys quarterly
4. **Audit Everything**: Log all sensitive operations
5. **Data Encryption**: Use CMEK for Firestore (enterprise)
6. **Network Isolation**: VPC Service Controls prevent data exfiltration
7. **Compliance**: FTC Safeguards Rule for financial services (automotive)

## Disaster Recovery

- **RTO (Recovery Time Objective)**: 1 hour
- **RPO (Recovery Point Objective)**: 5 minutes
- **Backup Strategy**: Firestore automated daily backups, 30-day retention
- **Failover**: Multi-region deployment (us-central1 primary, us-east1 failover)

---

*Last Updated: October 11, 2025*
*Status: Ready for Phase 1 deployment*
