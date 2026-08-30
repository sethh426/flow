/**
 * Flow Orchestrator - Backend AI Agent Controller
 * 
 * This is the "brain" that controls Flow's autopilot mode.
 * It plans multi-step workflows and sends commands to the frontend.
 */

require('dotenv').config();
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const WebSocket = require('ws');
const http = require('http');

// Initialize Genkit AI
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-1.5-flash',
});

class FlowOrchestrator {
  constructor() {
    this.clients = new Set();
    this.currentWorkflow = null;
    this.setupHttpServer();
    this.setupWebSocketServer();
  }

  setupHttpServer() {
    // Create HTTP server for health checks
    this.httpServer = http.createServer((req, res) => {
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          clients: this.clients.size,
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }));
      } else if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Flow Orchestrator</h1><p>WebSocket server running. Connect to ws://[host]/flow-autopilot</p>');
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    const PORT = process.env.PORT || 8080;
    this.httpServer.listen(PORT, () => {
      console.log(`🌐 HTTP server running on port ${PORT}`);
    });
  }

  setupWebSocketServer() {
    // Create WebSocket server on the same HTTP server
    const wss = new WebSocket.Server({ 
      server: this.httpServer,
      path: '/flow-autopilot'
    });

    wss.on('connection', (ws) => {
      console.log('🤖 Flow Autopilot client connected');
      this.clients.add(ws);

      ws.on('message', (message) => {
        this.handleClientMessage(ws, JSON.parse(message));
      });

      ws.on('close', () => {
        console.log('🔌 Flow Autopilot client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    const PORT = process.env.PORT || 8080;
    console.log(`🚀 Flow Orchestrator WebSocket server running on port ${PORT}`);
  }

  // Handle messages from frontend
  handleClientMessage(ws, message) {
    switch (message.type) {
      case 'status':
        console.log('📊 Client status:', message.data);
        break;
      case 'complete':
        console.log('✅ Task completed:', message.task);
        this.onTaskComplete(message.task);
        break;
      case 'error':
        console.error('❌ Task error:', message.error);
        break;
    }
  }

  // Send command to all connected clients
  sendCommand(command) {
    const message = JSON.stringify(command);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Main autopilot function - receives high-level goal
  async autopilot(goal) {
    console.log(`🎯 Flow Autopilot Goal: ${goal}`);

    // Step 1: Think about the goal
    this.sendCommand({
      type: 'think',
      message: `Planning how to: ${goal}...`,
    });

    await this.delay(1000);

    // Step 2: Use AI to break down the goal into steps
    const plan = await this.planWorkflow(goal);
    console.log('📋 Workflow Plan:', plan);

    // Step 3: Execute each step
    for (const step of plan.steps) {
      await this.executeStep(step);
    }

    // Step 4: Celebrate completion
    this.sendCommand({
      type: 'celebrate',
      message: '✨ Task completed!',
    });
  }

  // Use AI to plan workflow
  async planWorkflow(goal) {
    try {
      const prompt = `You are Flow, an autonomous AI agent that controls a web application.
      
Goal: ${goal}

Available actions:
- flyTo(selector): Fly to an element (e.g., "#dashboard-button")
- click(selector): Click an element
- type(text): Type text into focused input
- navigate(route): Navigate to a route (e.g., "/dashboard")
- think(message): Show a thought bubble
- celebrate(message): Show celebration animation

Available routes:
- /dashboard - Main dashboard
- /products - Product management
- /trends - Trend analysis
- /content - Content generation
- /analytics - Analytics

Common selectors:
- "#add-product-button" - Add product button
- "#search-input" - Search input
- "#trends-tab" - Trends tab
- ".product-card" - Product cards

Plan a sequence of steps to accomplish the goal. Return JSON:
{
  "steps": [
    { "action": "think", "message": "..." },
    { "action": "flyTo", "target": "#selector" },
    { "action": "click", "target": "#selector" },
    { "action": "navigate", "route": "/path" }
  ]
}`;

      const { response } = await ai.generate({
        prompt,
        config: {
          temperature: 0.7,
        },
      });

      // Parse AI response
      const jsonMatch = response.text().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback plan
      return {
        steps: [
          { action: 'think', message: `Let me help with: ${goal}` },
          { action: 'navigate', route: '/dashboard' },
        ],
      };
    } catch (error) {
      console.error('AI Planning Error:', error);
      return {
        steps: [
          { action: 'think', message: 'Planning...' },
        ],
      };
    }
  }

  // Execute a single step
  async executeStep(step) {
    console.log(`⚡ Executing step:`, step);

    switch (step.action) {
      case 'think':
        this.sendCommand({
          type: 'think',
          message: step.message,
        });
        await this.delay(2000);
        break;

      case 'flyTo':
        this.sendCommand({
          type: 'flyTo',
          target: step.target,
        });
        await this.delay(1500);
        break;

      case 'click':
        this.sendCommand({
          type: 'click',
          target: step.target,
        });
        await this.delay(1000);
        break;

      case 'type':
        this.sendCommand({
          type: 'type',
          data: { text: step.text },
        });
        await this.delay(500 * step.text.length);
        break;

      case 'navigate':
        this.sendCommand({
          type: 'navigate',
          data: { route: step.route },
        });
        await this.delay(2000);
        break;

      case 'celebrate':
        this.sendCommand({
          type: 'celebrate',
          message: step.message,
        });
        await this.delay(2000);
        break;
    }
  }

  // Callback when a task completes
  onTaskComplete(task) {
    // Handle task completion
    console.log(`✅ Task complete: ${task}`);
  }

  // Utility: Delay
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Pre-programmed workflows
  async demoWorkflow() {
    console.log('🎬 Starting demo workflow...');

    const steps = [
      { action: 'think', message: 'Let me show you around!' },
      { action: 'flyTo', target: 'h1' },
      { action: 'think', message: 'This is the dashboard' },
      { action: 'navigate', route: '/dashboard' },
      { action: 'think', message: 'Checking products...' },
      { action: 'flyTo', target: '.product-card' },
      { action: 'celebrate', message: 'Tour complete!' },
    ];

    for (const step of steps) {
      await this.executeStep(step);
    }
  }
}

// Export singleton instance
const orchestrator = new FlowOrchestrator();

module.exports = {
  FlowOrchestrator,
  orchestrator,
};

// CLI for testing
if (require.main === module) {
  console.log('🤖 Flow Orchestrator started!');
  console.log('💡 Try: orchestrator.autopilot("find trending products")');
  console.log('💡 Try: orchestrator.demoWorkflow()');

  // Example: Run demo after 3 seconds
  setTimeout(() => {
    orchestrator.demoWorkflow();
  }, 3000);
}
