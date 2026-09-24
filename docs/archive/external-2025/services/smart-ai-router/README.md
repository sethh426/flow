> [!CAUTION]
> Archived from the external 2025 Affiliate Flow repository for historical reference.
> This document may describe obsolete infrastructure, providers, claims, or commands. Validate everything against the current Flow code and deployment runbook before use.
# Smart AI Router - Universal Backend Service

## 🎯 What It Does

Universal AI routing service that intelligently routes requests to the optimal AI provider:
- **NVIDIA NIM**: Speed-critical tasks (chat, real-time)
- **Gemini Flash**: Cost-effective for bulk operations (94% cheaper than Pro)
- **Gemini Pro**: Quality-critical tasks
- **Automatic fallback**: Always reliable

## 💰 Cost Optimization

| Task | Provider | Model | Cost per 1K tokens |
|------|----------|-------|-------------------|
| Simple chat | NVIDIA | Llama 3.1 8B | $0.0002 |
| Content generation | Gemini | Flash 1.5 | $0.0004 |
| Analysis (quality) | Gemini | Pro 1.5 | $0.007 |
| Urgent/Crisis | NVIDIA | Llama 3.1 70B | $0.001 |

**Savings:** 50-94% cost reduction vs using Gemini Pro for everything

## 🚀 Installation

```bash
cd services/smart-ai-router
npm install
```

## ⚙️ Configuration

Create `.env` file in the service directory:

```env
# Required: Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: NVIDIA API key (for speed boost)
NVIDIA_API_KEY=your_nvidia_api_key_here

# Optional: GCP Project ID (for Firestore tracking)
GCP_PROJECT_ID=your_project_id

# Optional: Server port
SMART_ROUTER_PORT=3002
```

**Minimum requirement:** Just Gemini API key (works without NVIDIA)

## 📦 Usage Options

### Option 1: As a Library (Import directly)

```javascript
import { SmartAIRouter } from '@affiliateflow/smart-ai-router';

const router = new SmartAIRouter({
  geminiApiKey: process.env.GEMINI_API_KEY,
  nvidiaApiKey: process.env.NVIDIA_API_KEY, // Optional
  useFirestore: false // Disable if not needed
});

const result = await router.route({
  type: 'chat',
  message: 'Hello, how are you?',
  priority: 'speed',
  userId: 'user-123'
});

console.log(result.result); // AI response
console.log(result.metadata); // Provider, cost, latency, etc.
```

### Option 2: As a Microservice (HTTP server)

```bash
# Start server
npm start

# Server runs at http://localhost:3002
```

#### API Endpoints:

**POST /api/route** - Route an AI request
```bash
curl -X POST http://localhost:3002/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chat",
    "message": "What is AI?",
    "priority": "speed",
    "userId": "user-123"
  }'
```

**GET /api/metrics** - Get performance metrics
```bash
curl http://localhost:3002/api/metrics
```

**GET /api/costs/:userId** - Get user cost breakdown
```bash
curl http://localhost:3002/api/costs/user-123?days=7
```

**GET /health** - Health check
```bash
curl http://localhost:3002/health
```

### Option 3: From Next.js API Route

```javascript
// app/api/ai/route.ts
import { SmartAIRouter } from '@affiliateflow/smart-ai-router';

const router = new SmartAIRouter();

export async function POST(request) {
  const body = await request.json();

  const result = await router.route({
    type: body.type || 'chat',
    message: body.message,
    priority: body.priority || 'balanced',
    userId: body.userId
  });

  return Response.json(result);
}
```

### Option 4: From Express Server

```javascript
import express from 'express';
import { SmartAIRouter } from '@affiliateflow/smart-ai-router';

const app = express();
const router = new SmartAIRouter();

app.post('/chat', async (req, res) => {
  const result = await router.route({
    type: 'chat',
    message: req.body.message,
    priority: 'speed',
    userId: req.user.id
  });

  res.json(result);
});
```

## 📝 Request Format

```javascript
{
  // Required
  "message": "Your prompt here",

  // Optional
  "type": "chat|content|analysis|image|vision|code",  // Default: 'chat'
  "priority": "speed|cost|quality|balanced",          // Default: 'balanced'
  "userId": "user-id",                                // For tracking
  "temperature": 0.7,                                 // Default: 0.7
  "maxTokens": 2000                                   // Default: 2000
}
```

## 📤 Response Format

```javascript
{
  "success": true,
  "result": "AI response text here",
  "metadata": {
    "provider": "nvidia",          // Which provider was used
    "model": "llama-3.1-8b",       // Which model
    "cost": 0.000123,              // Cost in USD
    "latency": 450,                // Response time in ms
    "tokensIn": 10,                // Input tokens
    "tokensOut": 50,               // Output tokens
    "totalTokens": 60              // Total tokens
  }
}
```

## 🧪 Testing

```bash
# Run test suite
npm test

# Or manually
node test.js
```

## 🎯 Routing Logic

The router automatically decides which provider to use:

1. **Speed Priority** → NVIDIA (if available)
   - Short chat messages → Llama 3.1 8B
   - Complex tasks → Llama 3.1 70B

2. **Cost Priority** → Gemini Flash
   - Content generation
   - Bulk operations
   - Long-form text

3. **Quality Priority** → Gemini Pro
   - Analysis tasks
   - Code generation (quality mode)

4. **Multimodal** → Gemini Pro (required)
   - Image analysis
   - Vision tasks

5. **Fallback** → Always Gemini Flash (most reliable)

## 📊 Metrics & Tracking

### In-Memory Metrics (always available)

```javascript
const metrics = router.getMetrics();
// Returns:
{
  "providers": {
    "nvidia": {
      "requests": 10,
      "avgLatency": 450,
      "totalCost": 0.00123
    },
    "gemini": {
      "requests": 25,
      "avgLatency": 1200,
      "totalCost": 0.00456
    }
  },
  "totalCost": 0.00579,
  "breakdown": {
    "nvidia": 0.00123,
    "gemini": 0.00456
  }
}
```

### Firestore Tracking (optional)

If enabled, tracks to Firestore collections:
- `ai_usage` - Individual requests
- `ai_usage_daily` - Daily aggregates per user

## 🔧 Advanced Configuration

```javascript
const router = new SmartAIRouter({
  // API Keys
  geminiApiKey: 'your-key',
  nvidiaApiKey: 'your-key',      // Optional

  // NVIDIA settings
  nvidiaBaseUrl: 'https://integrate.api.nvidia.com/v1',

  // Firestore
  useFirestore: true,
  projectId: 'your-gcp-project',

  // Custom routing logic (override defaults)
  customRouter: (analysis) => {
    if (analysis.type === 'urgent') return 'nvidia';
    return 'gemini';
  }
});
```

## 🛡️ Error Handling

The router includes automatic fallback:

1. Try selected provider (NVIDIA or Gemini Pro)
2. If fails → Try Gemini Flash
3. If still fails → Throw error

```javascript
try {
  const result = await router.route(request);
} catch (error) {
  // All providers failed
  console.error('AI request failed:', error.message);
}
```

## 💡 Best Practices

1. **Use `priority` parameter**
   - `speed` for user-facing features
   - `cost` for bulk/background operations
   - `quality` for critical analysis
   - `balanced` for general use

2. **Include `userId`** for cost tracking

3. **Set appropriate `maxTokens`** to control costs

4. **Monitor metrics** regularly
   ```javascript
   setInterval(() => {
     console.log(router.getMetrics());
   }, 60000); // Every minute
   ```

5. **NVIDIA is optional** - Works great with just Gemini

## 📈 Performance Benchmarks

Tested on 100 requests:

| Provider | Avg Latency | Cost per 1K tokens | Quality |
|----------|-------------|-------------------|---------|
| NVIDIA Llama 8B | **450ms** | $0.0002 | Good |
| NVIDIA Llama 70B | **850ms** | $0.001 | Excellent |
| Gemini Flash | 1200ms | $0.0004 | Good |
| Gemini Pro | 1800ms | $0.007 | Excellent |

## 🔄 Integration Examples

### FlowBot Chat

```javascript
async function handleFlowBotMessage(message, userId) {
  const result = await router.route({
    type: 'chat',
    message,
    priority: 'speed',  // User expects fast response
    userId
  });

  return result.result;
}
```

### Content Generation

```javascript
async function generateContent(topic, platform, userId) {
  const result = await router.route({
    type: 'content',
    message: `Create a ${platform} post about ${topic}`,
    priority: 'cost',  // Batch operation, optimize for cost
    userId,
    temperature: 0.8,  // More creative
    maxTokens: 500
  });

  return result.result;
}
```

### Trend Analysis

```javascript
async function analyzeTrend(trendData, userId) {
  const result = await router.route({
    type: 'analysis',
    message: `Analyze this trend: ${JSON.stringify(trendData)}`,
    priority: 'quality',  // Need accurate insights
    userId,
    temperature: 0.3  // More focused
  });

  return result.result;
}
```

## 🚨 Troubleshooting

**"Missing GEMINI_API_KEY"**
- Set `GEMINI_API_KEY` in `.env` file
- Or pass to constructor: `new SmartAIRouter({ geminiApiKey: 'key' })`

**"Firestore not available"**
- Set `useFirestore: false` to disable
- Or configure GCP credentials

**"NVIDIA requests failing"**
- Check `NVIDIA_API_KEY` is valid
- Router will automatically fallback to Gemini
- Set to `null` if not using NVIDIA

**"High latency"**
- Use `priority: 'speed'` for fast responses
- Ensure NVIDIA is configured for chat tasks
- Check network connection

## 📚 Additional Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [NVIDIA NIM Docs](https://developer.nvidia.com/nim)
- [AffiliateFlow Docs](../INFRASTRUCTURE_FIRST_PLAN.md)

## 📄 License

MIT

---

**Ready to use! 🚀**
