> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Workflow Execution Engine

Complete workflow automation engine for AffiliateFlow.

## Features

### 🎯 **Trigger Types**
- **Manual** - Execute on demand via API
- **Scheduled** - Cron-based execution (e.g., daily at 9 AM)
- **Event** - Firestore document changes
- **Webhook** - HTTP POST endpoints
- **API** - Direct API calls
- **Previous Stage** - Cascade from completed stages

### ⚡ **Action Types** (20+ Supported)

**Content Generation:**
- `generate_content` - AI content creation
- `edit_image` - Imagen 3 editing
- `create_video` - Video generation
- `optimize_seo` - SEO optimization

**Social Publishing:**
- `post_instagram` - Instagram posts
- `post_tiktok` - TikTok videos
- `post_facebook` - Facebook posts
- `post_pinterest` - Pinterest pins
- `publish_blog` - Blog publishing

**Communication:**
- `send_email` - Email sending
- `send_sms` - SMS notifications

**Affiliate:**
- `generate_affiliate_link` - Create tracked links
- `track_click` - Record clicks
- `track_conversion` - Track sales
- `calculate_commission` - Compute earnings

**Data Operations:**
- `fetch_data` - Web scraping
- `save_to_database` - Firestore writes
- `update_record` - Update documents
- `delete_record` - Delete data

**External:**
- `call_api` - HTTP requests
- `webhook_post` - Webhook calls

**Utilities:**
- `wait` - Delays
- `conditional_branch` - If/then logic
- `loop` - Iterations
- `notification` - Notifications

### 🔍 **Condition Operators** (12 Types)
- `equals`, `not_equals`
- `greater_than`, `less_than`
- `greater_than_or_equal`, `less_than_or_equal`
- `contains`, `not_contains`
- `starts_with`, `ends_with`
- `matches_regex`, `is_empty`, `is_not_empty`

### 🔄 **Error Handling**
- Automatic retries with backoff strategies:
  - **Exponential**: 2s, 4s, 8s, ...
  - **Linear**: 2s, 4s, 6s, ...
  - **Fixed**: 2s intervals
- Configurable max attempts (default: 3)
- Continue-on-error support

### 📊 **Analytics**
- Execution tracking
- Success/failure rates
- Performance metrics
- Error logging

## API Endpoints

### Execute Workflow (Manual Trigger)
```bash
POST /api/workflows/:workflowId/execute
Content-Type: application/json

{
  "productUrl": "https://amazon.com/...",
  "customData": {...}
}
```

### Webhook Trigger
```bash
POST /api/webhooks/:workflowId/:triggerId
Content-Type: application/json

{
  "event": "purchase",
  "amount": 99.99
}
```

### Get Execution Status
```bash
GET /api/executions/:executionId
```

### Health Check
```bash
GET /health
```

## Installation

```bash
cd services/workflow-executor
npm install
```

## Environment Variables

```bash
PORT=8080                    # Server port
GOOGLE_APPLICATION_CREDENTIALS=../../serviceAccountKey.json
```

## Running Locally

```bash
npm start
```

## Deployment to Cloud Run

```bash
gcloud run deploy workflow-executor \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 600 \
  --project affiliateflow-abzfy
```

## Example: Physical Product Workflow

```javascript
const workflow = {
  id: 'physical-product-flow',
  name: 'Physical Product Promotion',
  productType: 'physical',
  status: 'active',
  stages: [
    {
      id: 'stage-1',
      name: 'Product Discovery',
      order: 1,
      triggers: [
        {
          type: 'manual',
          enabled: true
        }
      ],
      actions: [
        {
          type: 'fetch_data',
          name: 'Scrape Product',
          config: {
            source: '{{input.productUrl}}',
            extract: ['name', 'price', 'images']
          }
        },
        {
          type: 'generate_affiliate_link',
          name: 'Create Affiliate Link',
          config: {
            network: 'amazon',
            productUrl: '{{input.productUrl}}'
          }
        }
      ]
    },
    {
      id: 'stage-2',
      name: 'Content Creation',
      order: 2,
      triggers: [
        {
          type: 'previous_stage',
          config: {
            stageId: 'stage-1',
            condition: 'success'
          }
        }
      ],
      actions: [
        {
          type: 'generate_content',
          name: 'Generate Images',
          config: {
            templateId: 'product-card',
            count: 3
          }
        }
      ]
    },
    {
      id: 'stage-3',
      name: 'Publishing',
      order: 3,
      triggers: [
        {
          type: 'scheduled',
          config: {
            cronExpression: '0 9 * * *', // 9 AM daily
            timezone: 'America/New_York'
          }
        }
      ],
      actions: [
        {
          type: 'post_instagram',
          name: 'Post to Instagram',
          config: {
            platform: 'instagram',
            content: {
              imageUrl: '{{stage-2.images[0]}}',
              text: '{{stage-2.caption}}'
            }
          }
        }
      ]
    }
  ]
};

// Execute
const result = await WorkflowExecutor.executeWorkflow(workflow, {
  productUrl: 'https://amazon.com/dp/B08N5WRWNW'
});
```

## Variable Interpolation

Use `{{variable}}` syntax to reference:
- Input data: `{{input.productUrl}}`
- Stage results: `{{stage-1.affiliateLink}}`
- Context variables: `{{variables.commission}}`
- Current data: `{{product.name}}`

## Execution Context

Each workflow execution maintains:
- **Input** - Initial trigger data
- **Variables** - Runtime variables
- **Stage Results** - Output from each stage
- **Errors** - Error tracking with retries

## Monitoring

View executions in Firestore:
- Collection: `workflow_executions`
- Real-time status updates
- Complete execution history
- Error logs and metrics

## Architecture

```
┌─────────────────────────────────────────┐
│       Workflow Executor Service          │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │     Trigger Listeners               │ │
│  │  - Scheduled (Cron)                 │ │
│  │  - Event (Firestore)                │ │
│  │  - Webhook (HTTP)                   │ │
│  │  - Manual (API)                     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Workflow Executor                │ │
│  │  - Execute stages in order          │ │
│  │  - Evaluate conditions               │ │
│  │  - Handle retries                    │ │
│  │  - Track metrics                     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Action Executors (20+)           │ │
│  │  - Content generation                │ │
│  │  - Social posting                    │ │
│  │  - Email/SMS                         │ │
│  │  - Affiliate tracking                │ │
│  │  - Data operations                   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   Condition Evaluator                │ │
│  │  - 12 operators                      │ │
│  │  - Nested logic (AND/OR/NOT)         │ │
│  └────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
           │                   │
           ▼                   ▼
     ┌──────────┐        ┌──────────┐
     │ Firestore│        │ External │
     │          │        │ Services │
     └──────────┘        └──────────┘
```

## Production Checklist

- [ ] Deploy to Cloud Run
- [ ] Set up scheduled triggers
- [ ] Configure event listeners
- [ ] Test webhook endpoints
- [ ] Monitor execution logs
- [ ] Set up alerts for failures
- [ ] Configure retry policies
- [ ] Enable analytics tracking

## Next Steps

1. **Deploy Service**: Deploy to Cloud Run
2. **Create Workflows**: Use WorkflowBuilder UI
3. **Set Up Triggers**: Configure cron schedules
4. **Test Execution**: Run test workflows
5. **Monitor**: Check Firestore for execution logs

## Support

For issues or questions, see the main project documentation.
