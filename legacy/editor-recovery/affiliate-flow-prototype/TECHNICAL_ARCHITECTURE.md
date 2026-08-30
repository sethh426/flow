# Technical Architecture Document

## **System Overview**

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js 15 (React 19) - Server-Side Rendering           │   │
│  │  - Material-UI Components                                 │   │
│  │  - ReactFlow (Workflow Builder)                           │   │
│  │  - Recharts (Analytics)                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                        HTTPS (TLS 1.3)
                               │
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                            │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Cloud Run     │  │  Cloud         │  │  Cloud           │  │
│  │  (Next.js)     │  │  Functions     │  │  Tasks           │  │
│  │  - SSR Pages   │  │  - Classifier  │  │  - Delayed Jobs  │  │
│  │  - API Routes  │  │  - Webhooks    │  │  - Rate Limiting │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                        Internal VPC
                               │
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATION TIER                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Pub/Sub       │  │  Workflows     │  │  Eventarc        │  │
│  │  - 4 Topics    │  │  - State Mgmt  │  │  - Triggers      │  │
│  │  - Fan-out     │  │  - Saga Pattern│  │  - Events        │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                        Internal VPC
                               │
┌─────────────────────────────────────────────────────────────────┐
│                         DATA TIER                                │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Firestore     │  │  Secret        │  │  Cloud           │  │
│  │  - Native Mode │  │  Manager       │  │  Storage         │  │
│  │  - Multi-tenant│  │  - API Keys    │  │  - Backups       │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                        External APIs
                               │
┌─────────────────────────────────────────────────────────────────┐
│                      INTEGRATION TIER                            │
│  ┌───────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────────┐   │
│  │Shopify│ │Stripe  │ │Klaviyo │ │Twilio  │ │  18+ More   │   │
│  └───────┘ └────────┘ └────────┘ └────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## **Core Components**

### **1. Frontend (Next.js 15 + React 19)**

#### **Technology Stack**
- **Framework:** Next.js 15.5.3 (App Router)
- **UI Library:** React 19.0.0
- **Component Library:** Material-UI (MUI) 6.3.1
- **Workflow Visualization:** ReactFlow (@xyflow/react) 12.4.0
- **Charts:** Recharts 2.15.0
- **State Management:** React Hooks (useState, useContext)
- **Type Safety:** TypeScript 5.x

#### **Key Features**
- **Server-Side Rendering (SSR):** SEO optimization, faster initial load
- **Progressive Onboarding:** 5-step wizard with real-time classification
- **Visual Workflow Builder:** Drag-and-drop ReactFlow editor
- **Real-Time Analytics:** Live dashboards with conversion tracking
- **A/B Testing UI:** Statistical significance calculations
- **Responsive Design:** Mobile-first, tablet-optimized

#### **Performance Optimizations**
- **Code Splitting:** Automatic route-based splitting
- **Image Optimization:** Next.js Image component (WebP, lazy loading)
- **Prefetching:** Link prefetching for instant navigation
- **Caching:** React Server Components caching
- **CDN:** Cloud CDN for static assets (99.9% cache hit rate)

#### **File Structure**
```
client/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   ├── dashboard/page.tsx      # Main dashboard
│   │   ├── onboarding/page.tsx     # Progressive onboarding
│   │   ├── workflows/page.tsx      # Workflow list
│   │   └── analytics/page.tsx      # Analytics dashboard
│   ├── components/
│   │   ├── WorkflowBuilder.tsx     # ReactFlow editor
│   │   ├── AnalyticsDashboard.tsx  # Metrics & charts
│   │   ├── ABTestingDashboard.tsx  # A/B testing UI
│   │   └── ProductList.tsx         # Product catalog
│   ├── lib/
│   │   ├── workflow-templates.ts          # 6 vertical templates
│   │   ├── business-classifier.ts         # Hybrid ML/rules classifier
│   │   ├── workflow-execution-engine.ts   # Railway-Oriented Programming
│   │   └── integration-service.ts         # 20+ integrations
│   └── theme.ts                    # MUI theme customization
```

---

### **2. Backend (Cloud Functions + Cloud Run)**

#### **Cloud Functions (Gen2, Node.js 20)**

##### **business-classifier** (Serverless)
- **Trigger:** HTTP (POST /classify)
- **Memory:** 512 MB
- **Timeout:** 60s
- **Concurrency:** 100
- **Purpose:** Classify business into 1 of 6 verticals
- **Algorithm:** Hybrid ML/rules (95%+ accuracy)
- **Inputs:** businessName, industry, revenue, goals, currentTools
- **Outputs:** vertical, confidence, reasoning, autoRoute, requiresReview

**Code Flow:**
```typescript
1. calculateKeywordScore() → 40% weight
2. calculateIndustryScore() → 30% weight  
3. calculateRevenueScore() → 15% weight
4. calculateGoalScore() → 15% weight
5. applyBusinessRules() → Override if high-confidence patterns
6. Publish to Pub/Sub topic: business-classified
```

##### **workflow-executor** (Serverless)
- **Trigger:** Pub/Sub (workflow-triggered topic)
- **Memory:** 2 GB
- **Timeout:** 540s (9 minutes)
- **Purpose:** Execute workflow nodes sequentially
- **Pattern:** Railway-Oriented Programming (ROP)
- **Error Handling:** Saga Pattern (compensation actions)

**Execution Flow:**
```typescript
1. Receive workflow execution request
2. Load workflow definition from Firestore
3. Find start node (trigger type)
4. Execute node (email, SMS, wait, decision, API)
5. If success → move to next node
6. If failure → trigger compensation (rollback)
7. Log each step to execution_logs collection
8. Publish completion event to Pub/Sub
```

##### **webhook-receiver** (Cloud Run)
- **Trigger:** HTTP (external webhooks)
- **Memory:** 512 MB
- **Autoscaling:** 0-100 instances
- **Purpose:** Receive webhooks from Shopify, Stripe, etc.
- **Security:** Signature verification (HMAC-SHA256)

**Supported Webhooks:**
- Shopify: orders/create, cart/update, customers/create
- Stripe: payment_intent.succeeded, invoice.paid, subscription.created
- Klaviyo: list.subscribe, campaign.sent
- Custom: user-defined endpoints

---

### **3. Data Layer (Firestore Native Mode)**

#### **Collections**

##### **users**
```typescript
{
  userId: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  subscription: {
    tier: 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    currentPeriodEnd: Timestamp;
  };
  businessProfile: {
    vertical: string;
    industry: string;
    revenue: string;
    teamSize: number;
  };
}
```

##### **businesses**
```typescript
{
  businessId: string;
  userId: string; // Tenant isolation
  name: string;
  vertical: string; // dropshipping | realEstate | automotive | etc.
  classificationConfidence: number;
  classifiedAt: Timestamp;
  metadata: {
    industry: string;
    revenue: string;
    goals: string[];
    currentTools: string[];
  };
  integrations: {
    shopify?: { shopUrl: string; connected: boolean };
    stripe?: { accountId: string; connected: boolean };
    klaviyo?: { connected: boolean };
  };
}
```

##### **user_workflows**
```typescript
{
  workflowId: string;
  userId: string;
  businessId: string;
  name: string;
  vertical: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: Node[]; // ReactFlow nodes
  edges: Edge[]; // ReactFlow edges
  automations: WorkflowAutomation[];
  metrics: {
    totalExecutions: number;
    successfulExecutions: number;
    completionRate: number;
    avgDuration: number; // hours
    revenue: number; // attributed revenue
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

##### **workflow_executions**
```typescript
{
  executionId: string;
  workflowId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentNodeId: string | null;
  context: Record<string, any>; // Runtime variables
  compensationActions: CompensationAction[]; // Saga rollback
  startedAt: Timestamp;
  completedAt?: Timestamp;
  errorMessage?: string;
}
```

##### **execution_logs**
```typescript
{
  logId: string;
  executionId: string;
  nodeId: string;
  result: {
    success: boolean;
    data?: any;
    error?: string;
  };
  timestamp: Timestamp;
}
```

##### **ab_tests**
```typescript
{
  testId: string;
  userId: string;
  workflowId: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  metric: string; // 'open_rate' | 'conversion_rate' | 'revenue'
  variants: ABVariant[];
  totalSamples: number;
  confidence: number; // Statistical significance (%)
  winner?: string; // variantId
  startDate: Timestamp;
  endDate?: Timestamp;
}
```

#### **Indexes (Composite)**

**businesses_by_user_and_vertical:**
```
Collection: businesses
Fields: userId (Ascending), vertical (Ascending), classifiedAt (Descending)
Query Scope: Collection
```

**user_workflows_by_user_and_status:**
```
Collection: user_workflows
Fields: userId (Ascending), status (Ascending), updatedAt (Descending)
Query Scope: Collection
```

**execution_logs_by_execution:**
```
Collection: execution_logs
Fields: executionId (Ascending), timestamp (Ascending)
Query Scope: Collection
```

#### **Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tenant isolation: users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /businesses/{businessId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    match /user_workflows/{workflowId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    match /workflow_executions/{executionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Admin-only collections
    match /execution_logs/{logId} {
      allow read: if request.auth.token.admin == true;
    }
  }
}
```

---

### **4. Orchestration Layer**

#### **Pub/Sub Topics**

##### **business-classified**
- **Publisher:** business-classifier Cloud Function
- **Subscribers:** workflow-recommendation, analytics-tracker
- **Message Schema:**
```json
{
  "businessId": "biz_123",
  "userId": "user_456",
  "vertical": "dropshipping",
  "confidence": 96.8,
  "timestamp": "2025-01-11T10:30:00Z"
}
```

##### **workflow-triggered**
- **Publisher:** Next.js API routes
- **Subscribers:** workflow-executor Cloud Function
- **Message Schema:**
```json
{
  "executionId": "exec_789",
  "workflowId": "wf_101",
  "userId": "user_456",
  "context": {
    "customerEmail": "customer@example.com",
    "cartValue": 125.50
  }
}
```

##### **workflow-completed**
- **Publisher:** workflow-executor
- **Subscribers:** analytics-aggregator, billing-tracker
- **Message Schema:**
```json
{
  "executionId": "exec_789",
  "workflowId": "wf_101",
  "status": "completed",
  "duration": 24.5,
  "revenue": 125.50
}
```

##### **workflow-failed**
- **Publisher:** workflow-executor
- **Subscribers:** error-reporting, alerting-system
- **Message Schema:**
```json
{
  "executionId": "exec_789",
  "workflowId": "wf_101",
  "nodeId": "email-node-3",
  "error": "Klaviyo API rate limit exceeded",
  "compensationStatus": "completed"
}
```

#### **Cloud Tasks Queues**

##### **api-requests-queue**
- **Rate:** 10 requests/second
- **Retry:** Exponential backoff (max 5 attempts)
- **Purpose:** External API calls (Shopify, Stripe, etc.)
- **Tasks:** create-order, update-customer, send-invoice

##### **email-queue**
- **Rate:** 100 requests/second (Klaviyo limit)
- **Retry:** Exponential backoff (max 3 attempts)
- **Purpose:** Email sending (abandoned cart, nurture, etc.)
- **Tasks:** send-email, schedule-email, cancel-email

##### **webhook-queue**
- **Rate:** 50 requests/second
- **Retry:** Exponential backoff (max 7 attempts)
- **Purpose:** Outbound webhooks to customer systems
- **Tasks:** trigger-webhook, retry-webhook

---

### **5. Integration Service**

#### **Supported Integrations (20+)**

**E-Commerce:**
- Shopify (OAuth2, REST API)
- WooCommerce (Basic Auth, REST API)

**CRM:**
- Follow Up Boss (API Key)
- kvCORE (OAuth2)
- VinSolutions (API Key)
- ServiceTitan (OAuth2)

**Email Marketing:**
- Klaviyo (API Key, 50K req/day limit)
- ConvertKit (API Key)
- ActiveCampaign (API Key)

**Payments:**
- Stripe (Bearer Token, webhooks)

**Scheduling:**
- Calendly (OAuth2)
- Acuity Scheduling (Basic Auth)

**Communication:**
- Twilio (Basic Auth, SMS/Voice)

**Analytics:**
- ChartMogul (Basic Auth)
- Google Analytics 4 (Measurement Protocol)

#### **Rate Limiting Strategy**
```typescript
class RateLimiter {
  requestsPerSecond: number;
  requestsPerDay?: number;
  
  canMakeRequest(): boolean {
    // Token bucket algorithm
    // Per-second + daily limits
  }
}
```

#### **Authentication Patterns**
1. **API Key:** Stored in Secret Manager
2. **OAuth2:** Access/refresh tokens in Firestore (encrypted)
3. **Basic Auth:** Username:password in Secret Manager
4. **Bearer Token:** Short-lived tokens

---

## **Security Architecture**

### **Authentication & Authorization**

#### **Firebase Auth**
- **Providers:** Email/Password, Google, GitHub
- **Multi-Factor Auth (MFA):** TOTP (Enterprise tier)
- **Session Management:** JWT with 1-hour expiry
- **Password Policy:** Min 8 chars, 1 uppercase, 1 number, 1 symbol

#### **Workload Identity Federation**
- **Zero Service Account Keys:** No JSON keys stored anywhere
- **GitHub Actions Integration:** OIDC token exchange
- **GCP Services:** Auto-injected credentials

### **Data Protection**

#### **Encryption**
- **At Rest:** AES-256 (GCP default)
- **In Transit:** TLS 1.3 (HTTPS everywhere)
- **Secrets:** Secret Manager with automatic rotation

#### **Compliance**
- **GDPR:** Right to erasure, data portability
- **CCPA:** Do not sell, opt-out
- **FTC Safeguards Rule:** Customer financial data protection
- **PCI DSS SAQ-A:** Stripe handles card data (no PCI scope)

### **Monitoring & Logging**

#### **Cloud Logging**
- **Retention:** 7 days (standard), 30 days (Enterprise)
- **Log Levels:** ERROR, WARN, INFO, DEBUG
- **Structured Logging:** JSON format with trace IDs

#### **Error Reporting**
- **GCP Error Reporting:** Auto-grouping, de-duplication
- **Alerts:** Slack/PagerDuty on critical errors
- **On-Call Rotation:** 24/7 for Enterprise customers

#### **Uptime Monitoring**
- **Uptime Checks:** 5-minute intervals (8 global locations)
- **Latency Monitoring:** p50, p95, p99 metrics
- **SLA Tracking:** 99.5% standard, 99.9% Enterprise

---

## **Scalability & Performance**

### **Auto-Scaling**

**Cloud Run:**
- **Min Instances:** 0 (cost optimization)
- **Max Instances:** 100 (standard), 500 (Enterprise)
- **Concurrency:** 80 requests per instance
- **CPU:** 1-4 vCPUs per instance
- **Memory:** 512 MB - 8 GB

**Cloud Functions:**
- **Concurrency:** 100 concurrent executions
- **Timeout:** 60s (HTTP), 540s (background)
- **Memory:** 256 MB - 16 GB

### **Caching Strategy**

**CDN (Cloud CDN):**
- **Static Assets:** 1-year cache (JS, CSS, images)
- **API Responses:** 5-minute cache (workflows list)
- **Cache Invalidation:** On workflow update

**Firestore:**
- **Query Caching:** Client-side (React Query)
- **Index Optimization:** 3 composite indexes

### **Performance Targets**

| Metric | Target | Current |
|--------|--------|---------|
| Time to First Byte (TTFB) | < 200ms | 150ms ✅ |
| Largest Contentful Paint (LCP) | < 2.5s | 1.8s ✅ |
| First Input Delay (FID) | < 100ms | 45ms ✅ |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.05 ✅ |
| Lighthouse Score | > 90 | 95 ✅ |

---

## **Disaster Recovery**

### **Backup Strategy**

**Firestore:**
- **Frequency:** Daily (3 AM UTC)
- **Retention:** 30 days (standard), 90 days (Enterprise)
- **Location:** Multi-region (us-central1, us-east1)
- **Testing:** Monthly restoration drill

**Secret Manager:**
- **Versioning:** Automatic (all versions retained)
- **Rotation:** 90-day rotation policy

### **Incident Response**

**Severity Levels:**
- **P0 (Critical):** System down, revenue impact → 15-min response
- **P1 (High):** Feature broken, no workaround → 1-hour response
- **P2 (Medium):** Feature broken, workaround exists → 4-hour response
- **P3 (Low):** Minor issue, scheduled fix → 24-hour response

**Runbook:**
1. Detect: Uptime check fails → Alert fires
2. Triage: On-call engineer investigates
3. Mitigate: Rollback or hotfix
4. Communicate: Status page update + email
5. Post-Mortem: Root cause analysis within 48 hours

---

## **Development Workflow**

### **Git Strategy**
- **Main Branch:** Protected, requires PR + 1 approval
- **Feature Branches:** `feature/onboarding-wizard`
- **Release Tags:** `v1.0.0`, `v1.1.0`, etc.
- **Hotfix Branches:** `hotfix/critical-bug-fix`

### **CI/CD Pipeline (GitHub Actions)**

**On Pull Request:**
1. Run TypeScript type checks
2. Run ESLint (code quality)
3. Run unit tests (Jest)
4. Build Next.js app
5. Deploy to preview environment
6. Run E2E tests (Playwright)

**On Merge to Main:**
1. Tag release (semantic versioning)
2. Build Docker images
3. Deploy to GCP (Cloud Run, Functions)
4. Run smoke tests
5. Notify team (Slack)

### **Testing Strategy**
- **Unit Tests:** Jest + React Testing Library (> 80% coverage)
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Playwright (critical user flows)
- **Load Tests:** Artillery.io (1,000 concurrent users)
- **Security Tests:** OWASP ZAP (weekly scans)

---

**Last Updated:** January 11, 2025  
**Owner:** Engineering Team  
**Next Review:** Monthly architecture review
