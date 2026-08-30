# 🚀 Quick Start Guide - Smart AI Router

## Install Dependencies

```powershell
cd services/smart-ai-router
npm install
```

## Configure Environment

```powershell
# Copy example env file
cp .env.example .env

# Edit .env and add your Gemini API key
notepad .env
```

**Minimum required:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Test the Router

### Option 1: Run test suite
```powershell
npm test
```

### Option 2: Use as library (no server needed)

Create `quick-test.js`:
```javascript
import { SmartAIRouter } from './index.js';

const router = new SmartAIRouter({
  useFirestore: false // Disable for local testing
});

const result = await router.route({
  type: 'chat',
  message: 'Say hello',
  priority: 'balanced'
});

console.log('Response:', result.result);
console.log('Cost:', result.metadata.cost);
console.log('Provider:', result.metadata.provider);
```

Run it:
```powershell
node quick-test.js
```

### Option 3: Start HTTP server

```powershell
npm start
```

Server runs at: http://localhost:3002

Test with curl:
```powershell
curl -X POST http://localhost:3002/api/route -H "Content-Type: application/json" -d '{\"type\":\"chat\",\"message\":\"Hello\",\"priority\":\"speed\"}'
```

Or test in browser:
- Health check: http://localhost:3002/health
- API docs: http://localhost:3002/

## Use from Your App

### From Next.js API route:

```javascript
// app/api/ai/route.ts
import { SmartAIRouter } from '../../../../services/smart-ai-router/index.js';

const router = new SmartAIRouter();

export async function POST(request) {
  const { message } = await request.json();
  
  const result = await router.route({
    type: 'chat',
    message,
    priority: 'speed'
  });
  
  return Response.json(result);
}
```

### From existing Express server:

```javascript
import { SmartAIRouter } from '../services/smart-ai-router/index.js';

const aiRouter = new SmartAIRouter();

app.post('/api/chat', async (req, res) => {
  const result = await aiRouter.route({
    type: 'chat',
    message: req.body.message,
    userId: req.user.id
  });
  
  res.json(result);
});
```

## Expected Output

```json
{
  "success": true,
  "result": "Hello! I'm here to help you with...",
  "metadata": {
    "provider": "gemini",
    "model": "gemini-1.5-flash",
    "cost": 0.000023,
    "latency": 1234,
    "tokensIn": 5,
    "tokensOut": 42,
    "totalTokens": 47
  }
}
```

## Add NVIDIA (Optional - for speed boost)

1. Get API key from https://build.nvidia.com/
2. Add to `.env`:
   ```env
   NVIDIA_API_KEY=nvapi-xxxxx
   ```
3. Restart service
4. Chat requests will now use NVIDIA (5-10x faster!)

## Check Metrics

```powershell
curl http://localhost:3002/api/metrics
```

Returns:
```json
{
  "providers": {
    "gemini": {
      "requests": 10,
      "avgLatency": 1200,
      "totalCost": 0.00456
    }
  },
  "totalCost": 0.00456
}
```

## Troubleshooting

**"Cannot find module"**
```powershell
npm install
```

**"Missing GEMINI_API_KEY"**
```powershell
# Make sure .env file exists and has:
GEMINI_API_KEY=your_key_here
```

**"Port 3002 already in use"**
```powershell
# Change port in .env:
SMART_ROUTER_PORT=3003
```

## Next Steps

1. ✅ Router working with Gemini
2. 🔧 Add NVIDIA key when ready (optional)
3. 🔌 Integrate into your Next.js app
4. 📊 Monitor costs and performance
5. 🤖 Build autonomous FlowBot (Phase 2)

---

**You're all set! The router is universal and ready to use. 🚀**
