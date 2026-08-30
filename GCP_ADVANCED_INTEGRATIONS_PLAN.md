# 🚀 GCP Advanced Integrations Implementation Plan

## Overview

This document outlines the implementation of advanced workflow logic, vision capabilities, and MCP (Model Context Protocol) integration on Google Cloud Platform for AffiliateFlow.

---

## 📊 Current Infrastructure Assessment

### ✅ **Already Implemented**

#### **1. Workflow Infrastructure**
- ✅ `services/workflow-executor/` - Execution engine with cron, triggers, action executors
- ✅ `services/flow-orchestrator/` - WebSocket-based AI agent controller
- ✅ `services/master-ai-orchestrator/` - Multi-provider AI orchestration system
- ✅ `workflows/trend-pipeline.yaml` - Cloud Workflows YAML definition
- ✅ `.github/workflows/` - GitHub Actions CI/CD pipelines
- ✅ `client/src/components/WorkflowBuilder.tsx` - Visual workflow builder UI
- ✅ `client/src/components/FlowChart.tsx` - Pre-built workflow templates

#### **2. MCP Infrastructure**
- ✅ `services/mcp-integration/` - MCP server integration (filesystem, Firebase)
- ✅ `claude-pro-mcp/` - Claude Pro MCP server
- ✅ Product caching and data source connections

#### **3. AI Infrastructure**
- ✅ Gemini 1.5 Flash integration
- ✅ Multi-provider support (OpenAI, Anthropic, Google)
- ✅ Firebase Firestore for data persistence
- ✅ Secret Manager for API key management

### ⏳ **Missing Components**

#### **1. Vision API Integration** ❌
- No Google Vision API integration
- No image analysis for products
- No brand safety checks
- No OCR for text extraction
- No content moderation

#### **2. Imagen API for Image Generation** ❌
- No AI image generation capabilities
- No product mockup generation
- No social media graphics creation

#### **3. Workflow API Endpoints** ❌
- No REST API for workflow execution
- No workflow CRUD operations in Next.js
- No integration with frontend WorkflowBuilder

#### **4. Advanced MCP Capabilities** ❌
- No tool calling support
- No real-time data updates
- Limited data sources (only Nordstrom filesystem)
- No Amazon API integration

#### **5. Cloud Workflows Deployment** ❌
- Workflow YAML exists but not deployed to GCP
- No Cloud Workflows triggers configured
- No workflow monitoring/logging

---

## 🎯 Implementation Priority

### **Phase 1: Vision API & Image Generation (WEEK 2-3)**
Enable AI-powered image analysis and generation

### **Phase 2: Workflow API & Execution (WEEK 3-4)**
Connect visual workflow builder to execution engine

### **Phase 3: Advanced MCP Integration (WEEK 4-5)**
Expand data sources and tool calling

### **Phase 4: Cloud Workflows Deployment (WEEK 5-6)**
Deploy to GCP with monitoring

---

## 📦 Required VS Code Extensions

Based on your workflow needs, here are recommended extensions:

```vscode-extensions
bierner.markdown-mermaid,awehook.vscode-blink-mind,github.vscode-github-actions
```

**Why these extensions:**
1. **Markdown Mermaid Support** - Visualize workflow diagrams directly in markdown
2. **Blink Mind** - Create visual mind maps for workflow planning
3. **GitHub Actions** - Manage CI/CD workflows visually

---

## 🔧 Phase 1: Vision API & Image Generation

### **1.1 Install Required Packages**

```bash
# Add to services/image-generator/package.json
npm install @google-cloud/vision @google-cloud/aiplatform
```

### **1.2 Vision API Service Structure**

```
services/
├── vision-analyzer/
│   ├── index.js              (Vision API integration)
│   ├── analyzers/
│   │   ├── product-analyzer.js    (Product image analysis)
│   │   ├── brand-safety.js        (Brand safety checks)
│   │   ├── ocr-extractor.js       (Text extraction)
│   │   └── content-moderator.js   (Content moderation)
│   ├── package.json
│   └── Dockerfile
└── image-generator/
    ├── index.js              (Imagen API integration)
    ├── generators/
    │   ├── product-mockup.js      (Product mockup generation)
    │   ├── social-graphics.js     (Social media graphics)
    │   └── brand-assets.js        (Brand asset generation)
    ├── package.json
    └── Dockerfile
```

### **1.3 API Route Structure**

```
client/src/app/api/
├── vision/
│   ├── analyze/route.ts           (Image analysis endpoint)
│   ├── ocr/route.ts               (OCR endpoint)
│   └── safety/route.ts            (Brand safety check)
└── images/
    ├── generate/route.ts          (Generate images)
    └── mockup/route.ts            (Product mockup generation)
```

### **1.4 Key Features to Implement**

#### **Product Image Analysis**
```javascript
// Analyze product images for:
- Label detection (identify product type)
- Logo detection (brand identification)
- Safe search (brand safety)
- Object localization (product positioning)
- Color analysis (dominant colors)
- Text detection (product labels, prices)
```

#### **Brand Safety Checks**
```javascript
// Before publishing content:
- Adult content detection
- Violence detection
- Racy content detection
- Medical content detection
- Spoof detection
```

#### **AI Image Generation**
```javascript
// Generate images with Imagen 3:
- Product mockups (clothes on models, products in use)
- Social media graphics (posts, stories, ads)
- Brand assets (logos, banners, thumbnails)
- Lifestyle imagery (aspirational product shots)
```

---

## 🔧 Phase 2: Workflow API & Execution

### **2.1 Workflow API Endpoints**

```typescript
// client/src/app/api/workflows/route.ts
GET    /api/workflows              - List all workflows
POST   /api/workflows              - Create new workflow
GET    /api/workflows/[id]         - Get workflow details
PATCH  /api/workflows/[id]         - Update workflow
DELETE /api/workflows/[id]         - Delete workflow
POST   /api/workflows/[id]/execute - Execute workflow
GET    /api/workflows/[id]/status  - Get execution status
POST   /api/workflows/[id]/pause   - Pause workflow
POST   /api/workflows/[id]/resume  - Resume workflow
```

### **2.2 Workflow Execution Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │         WorkflowBuilder.tsx                       │  │
│  │  - Visual workflow editor                         │  │
│  │  - Drag & drop nodes                             │  │
│  │  - Configure triggers/actions                    │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                 │
│                        ▼ POST /api/workflows             │
│  ┌──────────────────────────────────────────────────┐  │
│  │     API Route: /api/workflows/route.ts           │  │
│  │  - Validate workflow definition                  │  │
│  │  - Store in Firestore                           │  │
│  │  - Send to execution engine                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│             Backend Services (GCP)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │    services/workflow-executor/index.js           │  │
│  │  - Listen for workflow triggers                  │  │
│  │  - Execute actions sequentially                 │  │
│  │  - Handle conditions & loops                    │  │
│  │  - Track execution state                        │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                 │
│         ┌──────────────┴──────────────┐                 │
│         ▼                              ▼                 │
│  ┌─────────────┐              ┌──────────────┐         │
│  │ Cron Jobs   │              │ Event Queue  │         │
│  │ (Scheduled) │              │ (Real-time)  │         │
│  └─────────────┘              └──────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### **2.3 Workflow Definition Schema**

```typescript
interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  niche: string; // E-commerce, POD, Affiliate, etc.
  trigger: {
    type: 'schedule' | 'event' | 'webhook' | 'manual';
    config: {
      // For schedule: cron expression
      // For event: event type
      // For webhook: webhook URL
    };
  };
  stages: WorkflowStage[];
  status: 'active' | 'paused' | 'draft';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  executionCount: number;
  lastExecutedAt?: Timestamp;
}

interface WorkflowStage {
  id: string;
  type: 'action' | 'condition' | 'loop' | 'parallel';
  action?: {
    type: string; // 'createContent', 'publishPost', 'sendEmail', etc.
    config: Record<string, any>;
  };
  condition?: {
    expression: string; // e.g., "{{stage-1.result.success}} == true"
    truePath: string[];  // Stage IDs to execute if true
    falsePath: string[]; // Stage IDs to execute if false
  };
  nextStageId?: string;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number; // ms
  };
}
```

### **2.4 Integration with FlowBot**

```typescript
// When FlowBot detects workflow commands:
// "Create a workflow to post daily Instagram content"

// FlowBot calls:
POST /api/workflows
{
  "name": "Daily Instagram Content",
  "niche": "E-commerce",
  "trigger": {
    "type": "schedule",
    "config": { "cron": "0 9 * * *" } // 9 AM daily
  },
  "stages": [
    {
      "type": "action",
      "action": {
        "type": "createContent",
        "config": { "platform": "instagram", "topic": "trending" }
      }
    },
    {
      "type": "action",
      "action": {
        "type": "publishPost",
        "config": { "platform": "instagram", "content": "{{stage-1.result}}" }
      }
    }
  ]
}
```

---

## 🔧 Phase 3: Advanced MCP Integration

### **3.1 MCP Tool Calling Architecture**

```javascript
// services/mcp-integration/tools.js

export const mcpTools = {
  // Product Search Tools
  searchNordstrom: async (query, filters) => {
    // Search Nordstrom products
    // Returns: product data with affiliate links
  },
  
  searchAmazon: async (query, filters) => {
    // Search Amazon products via API
    // Returns: product data with affiliate links
  },
  
  // Data Analysis Tools
  analyzeProductTrends: async (category, timeframe) => {
    // Analyze product trends
    // Returns: trending products, price changes, popularity
  },
  
  // Content Tools
  extractProductInfo: async (url) => {
    // Extract product details from URL
    // Returns: title, price, description, images
  },
  
  // Integration Tools
  getInstagramMetrics: async (postId) => {
    // Get Instagram post performance
    // Returns: likes, comments, reach, engagement
  },
  
  getAnalytics: async (period) => {
    // Get analytics data
    // Returns: revenue, clicks, conversions
  }
};
```

### **3.2 MCP Server Expansion**

```javascript
// Add new MCP servers for different data sources

// services/mcp-integration/servers/
├── nordstrom-server.js    - Nordstrom API integration
├── amazon-server.js       - Amazon Product Advertising API
├── instagram-server.js    - Instagram Graph API
├── analytics-server.js    - Analytics data access
└── firestore-server.js    - Firestore data access
```

### **3.3 Real-Time Data Updates**

```javascript
// services/mcp-integration/realtime-sync.js

class RealtimeMCPSync {
  constructor() {
    this.subscriptions = new Map();
  }
  
  // Subscribe to product price changes
  async subscribeToPriceChanges(productIds) {
    // Watch product prices
    // Notify when prices drop
    // Trigger workflow: "Post deal alert"
  }
  
  // Subscribe to trending topics
  async subscribeToTrends(niche) {
    // Monitor trending topics in niche
    // Notify when new trend detected
    // Trigger workflow: "Create trend-based content"
  }
  
  // Subscribe to competitor activity
  async subscribeToCompetitors(competitors) {
    // Monitor competitor posts/products
    // Notify of new activity
    // Trigger workflow: "Analyze & respond"
  }
}
```

---

## 🔧 Phase 4: Cloud Workflows Deployment

### **4.1 Deploy Workflow YAML to GCP**

```bash
# Deploy trend-pipeline workflow
gcloud workflows deploy trend-pipeline \
  --source=workflows/trend-pipeline.yaml \
  --location=us-central1
```

### **4.2 Enhanced Workflow YAML**

```yaml
# workflows/complete-affiliate-pipeline.yaml

main:
  params: [input]
  steps:
    # Step 1: Find trending products
    - find_trends:
        call: http.post
        args:
          url: ${TREND_FINDER_URL}/find
          body:
            niche: ${input.niche}
            platform: ${input.platform}
        result: trends
    
    # Step 2: Search products for each trend
    - search_products:
        parallel:
          for:
            value: trend
            in: ${trends.body.trends}
          steps:
            - call_product_mapper:
                call: http.post
                args:
                  url: ${PRODUCT_MAPPER_URL}/search
                  body:
                    trend: ${trend}
                    affiliateNetwork: "nordstrom"
                result: products
    
    # Step 3: Analyze images with Vision API
    - analyze_images:
        parallel:
          for:
            value: product
            in: ${products.body.products}
          steps:
            - call_vision_api:
                call: http.post
                args:
                  url: ${VISION_API_URL}/analyze
                  body:
                    imageUrl: ${product.imageUrl}
                    checkBrandSafety: true
                result: imageAnalysis
    
    # Step 4: Generate content with AI
    - generate_content:
        call: http.post
        args:
          url: ${CONTENT_GENERATOR_URL}/generate
          body:
            products: ${products.body.products}
            imageAnalysis: ${imageAnalysis.body}
            platform: "instagram"
        result: content
    
    # Step 5: Quality check
    - quality_check:
        call: http.post
        args:
          url: ${FLOWBOT_URL}/quality-check
          body:
            content: ${content.body}
        result: qualityResult
    
    # Step 6: Schedule/publish if approved
    - publish_content:
        switch:
          - condition: ${qualityResult.body.approved}
            steps:
              - schedule_post:
                  call: http.post
                  args:
                    url: ${SCHEDULER_URL}/schedule
                    body:
                      content: ${content.body}
                      scheduledTime: ${input.publishTime}
    
    # Step 7: Log results
    - log_execution:
        call: http.post
        args:
          url: ${FIRESTORE_URL}/log
          body:
            workflowId: ${input.workflowId}
            status: "completed"
            results: ${content.body}
    
    - return_result:
        return: ${content.body}
```

### **4.3 Cloud Scheduler Setup**

```bash
# Create scheduled trigger for daily content generation
gcloud scheduler jobs create http daily-content-gen \
  --schedule="0 9 * * *" \
  --uri="https://workflowexecutions.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/workflows/trend-pipeline/executions" \
  --message-body='{"niche":"E-commerce","platform":"instagram"}' \
  --oauth-service-account-email=SERVICE_ACCOUNT@PROJECT_ID.iam.gserviceaccount.com
```

---

## 🔧 Implementation Steps

### **Week 2-3: Vision & Image Generation**

1. **Set up Google Vision API**
   ```bash
   gcloud services enable vision.googleapis.com
   gcloud services enable aiplatform.googleapis.com
   ```

2. **Create vision-analyzer service**
   - Implement product image analysis
   - Add brand safety checks
   - Build OCR extraction
   - Deploy to Cloud Run

3. **Create image-generator service**
   - Implement Imagen 3 integration
   - Add product mockup generation
   - Create social graphics templates
   - Deploy to Cloud Run

4. **Add API routes to Next.js**
   - `/api/vision/analyze`
   - `/api/vision/safety`
   - `/api/images/generate`
   - `/api/images/mockup`

5. **Connect to FlowBot**
   - Update FlowBot system instruction with vision capabilities
   - Add `analyzeImage(url)` ACTION
   - Add `generateImage(prompt, style)` ACTION

### **Week 3-4: Workflow API & Execution**

1. **Create workflow API routes**
   - Implement full CRUD operations
   - Add execution endpoints
   - Add status monitoring

2. **Connect WorkflowBuilder to API**
   - Save visual workflows to Firestore
   - Load workflows from API
   - Enable workflow execution from UI

3. **Enhance workflow-executor service**
   - Add API trigger support
   - Implement parallel execution
   - Add error handling & retries

4. **Test workflow templates**
   - Product Launch Workflow
   - Daily Content Generation
   - Email Nurture Campaign
   - A/B Testing Workflow

### **Week 4-5: Advanced MCP**

1. **Add Amazon API integration**
   - Set up Product Advertising API
   - Implement product search
   - Add affiliate link generation

2. **Implement tool calling**
   - Create tool registry
   - Add tool execution engine
   - Connect to FlowBot

3. **Add real-time subscriptions**
   - Price change monitoring
   - Trend detection
   - Competitor tracking

4. **Expand data sources**
   - Instagram Graph API
   - TikTok API
   - Pinterest API
   - Email marketing platforms

### **Week 5-6: Cloud Workflows Deployment**

1. **Deploy workflows to GCP**
   - Deploy trend-pipeline.yaml
   - Deploy complete-affiliate-pipeline.yaml
   - Set up monitoring

2. **Configure Cloud Scheduler**
   - Daily content generation
   - Weekly analytics reports
   - Monthly performance reviews

3. **Add monitoring & logging**
   - Cloud Logging integration
   - Error alerting
   - Performance metrics

4. **Test end-to-end flows**
   - Manual trigger test
   - Scheduled execution test
   - Event-based trigger test

---

## 💰 Cost Estimates

### **Vision API**
- **Label Detection:** $1.50 per 1,000 images
- **Safe Search:** $1.50 per 1,000 images
- **OCR:** $1.50 per 1,000 images
- **Logo Detection:** $1.50 per 1,000 images

**Estimated Monthly Cost (1,000 images/month):** $6

### **Imagen API**
- **Image Generation:** $0.03 per image
- **Estimated Monthly Cost (500 images/month):** $15

### **Cloud Workflows**
- **Executions:** $0.025 per 1,000 internal steps
- **Estimated Monthly Cost (10,000 executions):** $2.50

### **Cloud Run (Services)**
- **vision-analyzer:** ~$5/month (minimal traffic)
- **image-generator:** ~$10/month (GPU instances)
- **workflow-executor:** ~$10/month (always-on)

**Total Estimated Monthly Cost:** ~$48.50

---

## 🎯 Success Metrics

### **Performance**
- Workflow execution time: < 30 seconds
- Image analysis time: < 2 seconds
- Image generation time: < 5 seconds
- API response time: < 1 second

### **Reliability**
- Workflow success rate: > 95%
- Service uptime: > 99.9%
- Error recovery rate: > 90%

### **Business Impact**
- Content creation time: Reduced by 90%
- Image analysis accuracy: > 95%
- Brand safety compliance: 100%
- Workflow automation: 80% of tasks

---

## 📚 Next Steps

1. **Install recommended VS Code extensions** (see top of document)
2. **Review existing workflow infrastructure**
3. **Start with Phase 1: Vision API integration**
4. **Then proceed with Phases 2-4 sequentially**

---

## 🔗 Related Documentation

- `FLOWBOT_SYSTEM_INSTRUCTION.md` - Complete FlowBot capabilities
- `FLOWBOT_IMPLEMENTATION_ROADMAP.md` - ACTION command implementation
- `AFFILIATE_FLOW_ARCHITECTURE.md` - Overall system architecture
- `services/workflow-executor/README.md` - Workflow execution details
- `services/mcp-integration/README.md` - MCP integration details

---

**Last Updated:** October 19, 2025
**Status:** Phase 1 Ready to Start
**Next Milestone:** Vision API Integration Complete
