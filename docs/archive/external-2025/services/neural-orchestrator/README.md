> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Neural Orchestrator - Enterprise AI Backend

Enterprise-grade AI neural network backend with multi-model orchestration, intelligent routing, and real-time performance optimization.

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloud Functions (Firebase/GCP)                  │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ aiRoute  │ aiAnalyze│aiGenerate│  aiCode  │  aiBatch │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Neural Orchestrator Core                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Multi-Factor Routing Algorithm                      │  │
│  │  • Task Type Matching (40%)                          │  │
│  │  • Priority-Based Scoring (30%)                      │  │
│  │  • Complexity Adjustment (20%)                       │  │
│  │  • Historical Performance (10%)                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Intelligent Fallback Chain                          │  │
│  │  Gemini Flash → Claude Haiku → GPT-4o → Claude       │  │
│  │  Sonnet → Gemini Pro                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└────────┬──────────┬──────────┬──────────┬──────────────────┘
         │          │          │          │
         ▼          ▼          ▼          ▼
    ┌─────────┬─────────┬─────────┬─────────┐
    │ Vertex  │Anthropic│ OpenAI  │  Cache  │
    │   AI    │   API   │   API   │Firestore│
    │ (Gemini)│(Claude) │(GPT-4)  │         │
    └─────────┴─────────┴─────────┴─────────┘
         │          │          │          │
         ▼          ▼          ▼          ▼
    ┌─────────────────────────────────────────┐
    │        Performance Tracking              │
    │  • Real-time Metrics (Firestore)        │
    │  • Event Publishing (Pub/Sub)           │
    │  • Decision Caching (1hr TTL)           │
    │  • Rate Limit Management                │
    └─────────────────────────────────────────┘
```

## 🚀 Features

### Multi-Model Orchestration
- **6 AI Models**: Gemini 2.0 Flash, Gemini 1.5 Pro, Claude 3.5 Sonnet, Claude 3.5 Haiku, GPT-4 Turbo, GPT-4o
- **Intelligent Routing**: Neural algorithm selects optimal model based on task, complexity, priority
- **Automatic Fallback**: 5-tier fallback chain ensures 99.9% availability
- **Batch Processing**: Process up to 50 requests concurrently

### Performance Optimization
- **Decision Caching**: 1-hour TTL cache for routing decisions
- **Historical Learning**: Models improve based on past performance
- **Rate Limit Management**: Automatic load balancing across models
- **Real-time Monitoring**: Firestore-based metrics tracking

### Advanced Capabilities
- **Task-Specific Routing**: Creative, Analytical, Conversational, Coding, Visual
- **Complexity Awareness**: Simple, Medium, Complex task handling
- **Priority Modes**: Speed, Quality, Cost optimization
- **Context Length Handling**: Up to 2M tokens (Gemini 1.5 Pro)

## 📦 Installation

```bash
cd services/neural-orchestrator
npm install
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
GCP_PROJECT=your-gcp-project-id
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
```

### Firebase Configuration

Initialize Firebase:

```bash
firebase init functions
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Pub/Sub

### GCP Services Setup

```bash
# Enable required APIs
gcloud services enable \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  pubsub.googleapis.com \
  secretmanager.googleapis.com \
  cloudfunctions.googleapis.com

# Create Pub/Sub topics
gcloud pubsub topics create ai-routing-events
gcloud pubsub topics create ai-requests
gcloud pubsub topics create ai-responses

# Create Firestore collections (auto-created on first use)
# - model-performance
# - routing-cache
# - routing-decisions
# - performance-aggregates
```

## 🏗️ Build & Deploy

### Local Development

```bash
# Build TypeScript
npm run build

# Run locally with emulators
npm run serve

# Watch mode for development
npm run watch
```

### Deploy to GCP

```bash
# Deploy all functions
npm run deploy

# Deploy specific function
firebase deploy --only functions:aiRoute

# View logs
npm run logs
```

## 📚 API Reference

### POST /aiRoute
Main routing endpoint for AI requests.

**Request:**
```json
{
  "type": "creative" | "analytical" | "conversational" | "coding" | "visual",
  "complexity": "simple" | "medium" | "complex",
  "context": "Your prompt here",
  "priority": "speed" | "quality" | "cost",
  "maxTokens": 4096,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "AI generated response",
    "tokensUsed": 1234,
    "model": "gemini-2.0-flash-exp",
    "latency": 450,
    "cost": 0.0003085,
    "confidence": 0.95
  },
  "timestamp": "2025-10-24T12:00:00.000Z"
}
```

### POST /aiAnalyze
Content analysis endpoint.

**Request:**
```json
{
  "content": "Content to analyze",
  "analysisType": "sentiment" | "keywords" | "summary" | "general",
  "priority": "speed" | "quality" | "cost"
}
```

### POST /aiGenerate
Creative content generation.

**Request:**
```json
{
  "prompt": "Your creative prompt",
  "format": "text" | "markdown" | "html",
  "tone": "professional" | "casual" | "technical",
  "length": "short" | "medium" | "long",
  "priority": "quality"
}
```

### POST /aiCode
Code generation and assistance.

**Request:**
```json
{
  "task": "Create a React component",
  "language": "typescript",
  "framework": "react",
  "context": "Additional requirements"
}
```

### POST /aiBatch
Batch processing (max 50 requests).

**Request:**
```json
{
  "requests": [
    { "type": "creative", "complexity": "simple", ... },
    { "type": "analytical", "complexity": "medium", ... }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "summary": {
    "totalRequests": 10,
    "successCount": 10,
    "totalCost": 0.0045,
    "totalTokens": 15230,
    "avgLatency": 1250
  }
}
```

### GET /aiHealth
System health and metrics.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "metrics": {
    "totalRequests": 125000,
    "successRate": 0.998,
    "avgLatency": 1150,
    "totalCost": 145.67,
    "modelStats": {
      "gemini-2.0-flash-exp": {
        "requests": 75000,
        "successes": 74800,
        "failures": 200,
        "avgLatency": 450,
        "totalCost": 18.75
      }
    }
  }
}
```

## 🎯 Model Selection Logic

### Task Type Scoring

**Creative Tasks:**
- GPT-4 Turbo: 105 points (creative-writing + multimodal + GPT bonus)
- GPT-4o: 85 points
- Gemini 1.5 Pro: 65 points

**Analytical Tasks:**
- Claude 3.5 Sonnet: 135 points (reasoning + analysis + accuracy + long-context)
- Gemini 1.5 Pro: 130 points
- GPT-4 Turbo: 90 points

**Coding Tasks:**
- Claude 3.5 Sonnet: 150 points (coding + reasoning + analysis + Claude bonus)
- Claude 3.5 Haiku: 95 points
- GPT-4o: 60 points

**Visual/Multimodal:**
- Gemini 2.0 Flash: 140 points (multimodal + visual + Gemini bonus)
- GPT-4o: 130 points
- Gemini 1.5 Pro: 110 points

## 📊 Performance Benchmarks

| Model | Avg Latency | Cost/1K Tokens | Max Tokens | Best For |
|-------|-------------|----------------|------------|----------|
| Gemini 2.0 Flash | 400ms | $0.00025 | 1M | Speed, Cost |
| Gemini 1.5 Pro | 2000ms | $0.00125 | 2M | Long context |
| Claude 3.5 Sonnet | 1500ms | $0.003 | 200K | Coding, Reasoning |
| Claude 3.5 Haiku | 800ms | $0.0008 | 200K | Fast coding |
| GPT-4 Turbo | 3000ms | $0.01 | 128K | Creative writing |
| GPT-4o | 1200ms | $0.005 | 128K | Multimodal |

## 🔐 Security

- API keys stored in GCP Secret Manager
- Rate limiting per model
- Request validation and sanitization
- CORS enabled with origin restrictions
- Firestore security rules enforced

## 📈 Monitoring & Analytics

### Firestore Collections

**model-performance**: Real-time performance metrics per model/task
**routing-cache**: Routing decision cache (1hr TTL)
**routing-decisions**: Historical routing log
**performance-aggregates**: Hourly aggregated metrics
**rate-limits**: Real-time rate limit tracking

### Pub/Sub Topics

**ai-routing-events**: Routing decision events
**ai-requests**: Async request queue
**ai-responses**: Async response delivery

### Scheduled Jobs

**cleanupScheduled**: Daily cleanup (2 AM ET)
- Removes cache entries >24hrs
- Archives routing decisions >7 days

**aggregateMetrics**: Hourly aggregation
- Calculates per-model statistics
- Stores in performance-aggregates collection

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch
```

Example test request:

```typescript
const response = await fetch('https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/aiRoute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'creative',
    complexity: 'medium',
    context: 'Write a product description for wireless headphones',
    priority: 'quality',
  }),
});

const data = await response.json();
console.log(data);
```

## 🔄 Fallback Chain

1. **Gemini 2.0 Flash** - Fastest, most cost-effective
2. **Claude 3.5 Haiku** - Fast, good for coding
3. **GPT-4o** - Balanced performance
4. **Claude 3.5 Sonnet** - High quality
5. **Gemini 1.5 Pro** - Maximum capability

If all models fail, returns error with degradation notice.

## 💰 Cost Optimization

- **Automatic routing** to cheapest suitable model
- **Caching** prevents duplicate expensive requests
- **Batch processing** amortizes overhead
- **Rate limiting** prevents quota overage
- **Performance tracking** identifies cost-effective models

Average cost per request: **$0.0003 - $0.003**

## 🚨 Error Handling

- 3 automatic retries with exponential backoff
- 5-tier fallback chain
- Graceful degradation
- Error logging to Cloud Logging
- Failed request tracking in Firestore

## 📞 Support

For issues or questions:
1. Check Cloud Logging: `gcloud logging read`
2. Review Firestore metrics
3. Check /aiHealth endpoint
4. Review Pub/Sub message queues

## 🎓 Best Practices

1. **Use batch processing** for multiple requests
2. **Set appropriate priority** (speed/quality/cost)
3. **Cache results** at application level when possible
4. **Monitor costs** via /aiHealth endpoint
5. **Use simple complexity** when appropriate
6. **Specify task type** accurately for optimal routing

## 📜 License

Proprietary - AffiliateFlow Platform
