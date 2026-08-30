/**
 * HTTP Server for Smart AI Router
 * 
 * This creates an Express server around the router
 * so it can be called via HTTP from any client
 */

import express from 'express';
import cors from 'cors';
import { SmartAIRouter } from './index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize router with error handling
let router;
try {
  router = new SmartAIRouter({
    useFirestore: false // Disable Firestore for now to avoid auth issues
  });
} catch (error) {
  console.error('❌ Failed to initialize SmartAIRouter:', error);
  process.exit(1);
}

/**
 * POST /api/route
 * Main endpoint - route an AI request
 * 
 * Body:
 * {
 *   "type": "chat|content|analysis|image|vision|code",
 *   "message": "your prompt here",
 *   "priority": "speed|cost|quality|balanced",
 *   "userId": "user-123",
 *   "temperature": 0.7,
 *   "maxTokens": 2000
 * }
 */
app.post('/api/route', async (req, res) => {
  try {
    const result = await router.route(req.body);
    res.json(result);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metrics
 * Get current performance metrics
 */
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = router.getMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/costs/:userId
 * Get cost breakdown for a specific user
 * Query params: ?days=7
 */
app.get('/api/costs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 7;
    
    const costs = await router.getUserCosts(userId, days);
    res.json({
      success: true,
      userId,
      days,
      costs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reset-metrics
 * Reset metrics (for testing)
 */
app.post('/api/reset-metrics', (req, res) => {
  router.resetMetrics();
  res.json({
    success: true,
    message: 'Metrics reset'
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'smart-ai-router',
    version: '1.0.0',
    providers: {
      gemini: router.gemini ? '✅' : '❌',
      nvidia: router.nvidiaApiKey ? '✅' : '⚠️ Not configured',
      firestore: router.useFirestore ? '✅' : '⚠️ Disabled'
    },
    uptime: process.uptime()
  });
});

/**
 * GET /
 * Root endpoint - API documentation
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Smart AI Router',
    version: '1.0.0',
    description: 'Universal AI routing service - intelligently routes requests to optimal providers',
    endpoints: {
      'POST /api/route': 'Route an AI request to optimal provider',
      'GET /api/metrics': 'Get performance metrics',
      'GET /api/costs/:userId': 'Get user cost breakdown',
      'GET /health': 'Health check',
      'POST /api/reset-metrics': 'Reset metrics (testing)'
    },
    providers: ['NVIDIA NIM', 'Google Gemini'],
    documentation: 'See README.md for usage examples'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const PORT = process.env.SMART_ROUTER_PORT || 3002;

// Add process error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('   Smart AI Router Server Started');
  console.log('========================================');
  console.log(`   Port: ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Docs: http://localhost:${PORT}/`);
  console.log('========================================');
  console.log('');
});

export { app, router };
