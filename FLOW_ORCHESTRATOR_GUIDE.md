# 🤖 Flow Orchestrator - Quick Start Guide

## What is Flow Orchestrator?

Flow Orchestrator is the **autonomous AI brain** that controls the FlowAutopilot system. It plans multi-step workflows and sends commands to the frontend to visually control the app.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Flow Orchestrator                        │
│                  (Backend AI Controller)                     │
│  - AI Planning (Gemini)                                      │
│  - Workflow Execution                                        │
│  - WebSocket Server (ws://localhost:3001)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ WebSocket Commands
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    FlowAutopilot                             │
│                 (Frontend Controller)                        │
│  - Visual Flight Animations                                  │
│  - Particle Trails & Effects                                │
│  - Element Interaction                                       │
└─────────────────────────────────────────────────────────────┘
```

## Running the Orchestrator

### Start the Server
```powershell
cd services\flow-orchestrator
npm start
```

### Server Details
- **WebSocket URL**: `ws://localhost:3001/flow-autopilot`
- **Port**: 3001
- **Protocol**: WebSocket

## Available Commands

The orchestrator sends these commands to the frontend:

### 1. **think** - Show thought bubble
```javascript
{
  type: 'think',
  message: 'Planning my next move...'
}
```

### 2. **flyTo** - Fly to element
```javascript
{
  type: 'flyTo',
  target: '#add-product-button'  // CSS selector
}
```

### 3. **click** - Click element
```javascript
{
  type: 'click',
  target: '.product-card'
}
```

### 4. **type** - Type text
```javascript
{
  type: 'type',
  data: { text: 'Hello World!' }
}
```

### 5. **navigate** - Navigate to route
```javascript
{
  type: 'navigate',
  data: { route: '/dashboard' }
}
```

### 6. **celebrate** - Celebration animation
```javascript
{
  type: 'celebrate',
  message: '✨ Task completed!'
}
```

## Using the Orchestrator

### 1. Auto-Pilot Mode (AI Planning)
Give Flow a high-level goal and it will plan and execute the steps:

```javascript
const { orchestrator } = require('./services/flow-orchestrator');

// Tell Flow what you want
await orchestrator.autopilot('find trending products');
await orchestrator.autopilot('create a new social post');
await orchestrator.autopilot('analyze product performance');
```

### 2. Demo Workflow (Pre-programmed)
Run a pre-programmed demo:

```javascript
await orchestrator.demoWorkflow();
```

This will:
1. Show "Let me show you around!" thought
2. Fly to the page title
3. Navigate to dashboard
4. Check products
5. Celebrate completion

### 3. Custom Workflows
Create your own workflows:

```javascript
const steps = [
  { action: 'think', message: 'Starting analysis...' },
  { action: 'navigate', route: '/trends' },
  { action: 'flyTo', target: '#trends-chart' },
  { action: 'click', target: '.refresh-button' },
  { action: 'celebrate', message: 'Analysis complete!' }
];

for (const step of steps) {
  await orchestrator.executeStep(step);
}
```

## How AI Planning Works

1. **You provide a goal**: `"find trending products"`

2. **AI analyzes the goal** using Gemini and your app context:
   - Available routes: `/dashboard`, `/products`, `/trends`, `/content`
   - Available selectors: `#add-product-button`, `.product-card`, etc.
   - Available actions: `flyTo`, `click`, `navigate`, etc.

3. **AI generates a plan**:
   ```json
   {
     "steps": [
       { "action": "think", "message": "Looking for trends..." },
       { "action": "navigate", "route": "/trends" },
       { "action": "flyTo", "target": "#trends-filter" },
       { "action": "click", "target": ".category-fashion" },
       { "action": "celebrate", "message": "Found trending products!" }
     ]
   }
   ```

4. **Orchestrator executes** each step with proper timing and animations

## Testing

### Check if server is running:
```powershell
# You should see WebSocket server message
netstat -ano | findstr :3001
```

### Connect from browser console:
```javascript
const ws = new WebSocket('ws://localhost:3001/flow-autopilot');
ws.onmessage = (msg) => console.log('Received:', JSON.parse(msg.data));
ws.send(JSON.stringify({ type: 'status', data: 'connected' }));
```

### Send test command:
```javascript
// In Node.js (orchestrator running)
orchestrator.sendCommand({
  type: 'think',
  message: 'Testing connection!'
});
```

## Integration with Frontend

The **FlowAutopilot** component is already integrated in `ClientLayout.tsx`:

```tsx
import FlowAutopilot from '@/components/FlowAutopilot';

// Inside layout:
<FlowAutopilot />
```

It automatically:
- ✅ Connects to `ws://localhost:3001/flow-autopilot`
- ✅ Listens for commands
- ✅ Executes visual animations
- ✅ Reports status back to orchestrator

## Example Use Cases

### 1. Product Analysis Workflow
```javascript
await orchestrator.autopilot('analyze top performing products');
```
Flow will:
1. Navigate to analytics
2. Find product performance metrics
3. Click on top products
4. Show insights

### 2. Content Creation Workflow
```javascript
await orchestrator.autopilot('create a social media post about trending fashion');
```
Flow will:
1. Navigate to trends
2. Find fashion trends
3. Navigate to content creator
4. Fill in the form
5. Schedule the post

### 3. Audience Research Workflow
```javascript
await orchestrator.autopilot('find target audience for athletic wear');
```
Flow will:
1. Navigate to audience finder
2. Enter "athletic wear"
3. Run analysis
4. Show results

## Configuration

### Environment Variables
Create `services/flow-orchestrator/.env`:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

### Customize AI Model
Edit `services/flow-orchestrator/index.js`:

```javascript
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-1.5-flash',  // Change model here
});
```

## Troubleshooting

### WebSocket not connecting?
- Check if orchestrator is running: `npm start`
- Check port 3001 is not in use
- Check browser console for connection errors

### AI not planning correctly?
- Verify `GEMINI_API_KEY` is set in `.env`
- Check console for AI errors
- Simplify the goal to test

### Commands not executing?
- Check FlowAutopilot is mounted in UI
- Check WebSocket connection in browser console
- Verify selectors exist in DOM

## Next Steps

1. **Add more pre-programmed workflows** for common tasks
2. **Train AI with app-specific knowledge** (add to prompt)
3. **Add voice commands** to trigger autopilot
4. **Create dashboard controls** to start/stop autopilot
5. **Add recording mode** to create workflows by example

## MCP Integration (Future)

Flow Orchestrator can be extended to work like an MCP server:

```javascript
// Register tools that Flow can use
orchestrator.registerTool('searchProducts', async (params) => {
  // Call your product search API
});

orchestrator.registerTool('createPost', async (params) => {
  // Call your content creation API
});

// AI can now use these tools in workflows
await orchestrator.autopilot('find products and create a post');
```

---

**Built with ❤️ by the AffiliateFlow Team**
