import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { Firestore } from '@google-cloud/firestore';
import { NeuralOrchestrator } from './index';

const db = new Firestore();
let orchestrator: NeuralOrchestrator | null = null;

function getOrchestrator(): NeuralOrchestrator {
  if (!orchestrator) {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'affiliateflow-abzfy';
    orchestrator = new NeuralOrchestrator(projectId);
  }
  return orchestrator;
}

/**
 * Unified API endpoint - handles all /api/* requests
 * This replaces the Next.js API routes that were moved to _api_backup
 */
export const api = onRequest({
  timeoutSeconds: 540,
  memory: '2GiB',
  maxInstances: 100,
  cors: true,
}, async (req, res) => {
  const path = req.path;
  const method = req.method;

  logger.info(`API Request: ${method} ${path}`, { 
    body: req.body,
    query: req.query,
  });

  try {
    // Route to appropriate handler
    if (path.startsWith('/api/flowbot')) {
      return await handleFlowbot(req, res);
    } else if (path.startsWith('/api/analytics')) {
      return await handleAnalytics(req, res);
    } else if (path.startsWith('/api/campaigns')) {
      return await handleCampaigns(req, res);
    } else if (path.startsWith('/api/products')) {
      return await handleProducts(req, res);
    } else if (path.startsWith('/api/intelligence')) {
      return await handleIntelligence(req, res);
    } else if (path.startsWith('/api/workflows')) {
      return await handleWorkflows(req, res);
    } else if (path.startsWith('/api/content')) {
      return await handleContent(req, res);
    } else if (path.startsWith('/api/trends')) {
      return await handleTrends(req, res);
    } else if (path.startsWith('/api/health')) {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    } else {
      return res.status(404).json({ error: 'API endpoint not found', path });
    }
  } catch (error: any) {
    logger.error(`API Error: ${method} ${path}`, error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Handle Flowbot chat requests
 */
async function handleFlowbot(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, history, userId } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Use neural orchestrator for intelligent routing
  const result = await getOrchestrator().execute({
    type: 'conversational',
    complexity: 'complex',
    context: `${history ? 'Previous conversation:\n' + JSON.stringify(history) + '\n\n' : ''}User question: ${question}`,
    priority: 'quality',
  });

  // Save to memory if userId provided
  if (userId) {
    await db.collection('flowbot_conversations').add({
      userId,
      question,
      answer: result.text,
      timestamp: new Date(),
      model: result.model,
      cost: result.cost,
    });
  }

  return res.json({
    answer: result.text,
    model: result.model,
    timestamp: new Date().toISOString(),
    cost: result.cost,
  });
}

/**
 * Handle Analytics requests
 */
async function handleAnalytics(req: any, res: any) {
  const path = req.path;

  // GET /api/analytics - get analytics data
  if (req.method === 'GET' && path === '/api/analytics') {
    const { timeRange = '7d', userId } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    const days = parseInt(timeRange.replace('d', '')) || 7;
    startDate.setDate(startDate.getDate() - days);

    // Query analytics from Firestore
    let query = db.collection('analytics')
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .orderBy('timestamp', 'desc');

    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.limit(1000).get();
    const analytics = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, data: analytics });
  }

  // GET /api/analytics/summary - get summary stats
  if (req.method === 'GET' && path === '/api/analytics/summary') {
    const { userId } = req.query;

    // Get summary stats from Firestore aggregations
    const summaryDoc = await db.collection('analytics_summary')
      .doc(userId || 'global')
      .get();

    if (!summaryDoc.exists) {
      return res.json({
        success: true,
        data: {
          totalRevenue: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalImpressions: 0,
        },
      });
    }

    return res.json({ success: true, data: summaryDoc.data() });
  }

  return res.status(404).json({ error: 'Analytics endpoint not found' });
}

/**
 * Handle Campaign requests
 */
async function handleCampaigns(req: any, res: any) {
  // GET /api/campaigns - list campaigns
  if (req.method === 'GET' && req.path === '/api/campaigns') {
    const { userId, status } = req.query;

    let query = db.collection('campaigns');

    if (userId) {
      query = query.where('userId', '==', userId) as any;
    }
    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(100).get();
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, data: campaigns });
  }

  // POST /api/campaigns - create campaign
  if (req.method === 'POST' && req.path === '/api/campaigns') {
    const campaignData = req.body;

    const docRef = await db.collection('campaigns').add({
      ...campaignData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: campaignData.status || 'draft',
    });

    const doc = await docRef.get();
    return res.json({ 
      success: true, 
      data: { id: doc.id, ...doc.data() },
    });
  }

  // GET /api/campaigns/[id] - get campaign by ID
  const idMatch = req.path.match(/^\/api\/campaigns\/([^\/]+)$/);
  if (req.method === 'GET' && idMatch) {
    const campaignId = idMatch[1];
    const doc = await db.collection('campaigns').doc(campaignId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  }

  // PATCH /api/campaigns/[id] - update campaign
  if (req.method === 'PATCH' && idMatch) {
    const campaignId = idMatch[1];
    const updates = req.body;

    await db.collection('campaigns').doc(campaignId).update({
      ...updates,
      updatedAt: new Date(),
    });

    const doc = await db.collection('campaigns').doc(campaignId).get();
    return res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  }

  // DELETE /api/campaigns/[id] - delete campaign
  if (req.method === 'DELETE' && idMatch) {
    const campaignId = idMatch[1];
    await db.collection('campaigns').doc(campaignId).delete();

    return res.json({ success: true, message: 'Campaign deleted' });
  }

  return res.status(404).json({ error: 'Campaign endpoint not found' });
}

/**
 * Handle Product requests
 */
async function handleProducts(req: any, res: any) {
  // GET /api/products - list products
  if (req.method === 'GET' && req.path === '/api/products') {
    const { userId, category, status } = req.query;

    let query = db.collection('products');

    if (userId) {
      query = query.where('userId', '==', userId) as any;
    }
    if (category) {
      query = query.where('category', '==', category) as any;
    }
    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(100).get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, data: products });
  }

  // POST /api/products - create product
  if (req.method === 'POST' && req.path === '/api/products') {
    const productData = req.body;

    const docRef = await db.collection('products').add({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    return res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  }

  // Handle product by ID routes
  const idMatch = req.path.match(/^\/api\/products\/([^\/]+)(\/.*)?$/);
  if (idMatch) {
    const productId = idMatch[1];
    const subPath = idMatch[2] || '';

    // GET /api/products/[id]
    if (req.method === 'GET' && !subPath) {
      const doc = await db.collection('products').doc(productId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.json({
        success: true,
        data: { id: doc.id, ...doc.data() },
      });
    }

    // PATCH /api/products/[id]
    if (req.method === 'PATCH' && !subPath) {
      const updates = req.body;

      await db.collection('products').doc(productId).update({
        ...updates,
        updatedAt: new Date(),
      });

      const doc = await db.collection('products').doc(productId).get();
      return res.json({
        success: true,
        data: { id: doc.id, ...doc.data() },
      });
    }

    // DELETE /api/products/[id]
    if (req.method === 'DELETE' && !subPath) {
      await db.collection('products').doc(productId).delete();
      return res.json({ success: true, message: 'Product deleted' });
    }
  }

  return res.status(404).json({ error: 'Product endpoint not found' });
}

/**
 * Handle Intelligence/AI requests
 */
async function handleIntelligence(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const path = req.path;

  // AI Router - intelligent model selection
  if (path === '/api/intelligence/ai-router') {
    const { prompt, taskType, priority } = req.body;

    const result = await getOrchestrator().execute({
      type: taskType || 'general',
      complexity: 'complex',
      context: prompt,
      priority: priority || 'cost',
    });

    return res.json({
      success: true,
      result: result.text,
      model: result.model,
      cost: result.cost,
      latency: result.latency,
    });
  }

  // Detect Trends
  if (path === '/api/intelligence/detect-trends') {
    const { data, timeRange } = req.body;

    const prompt = `Analyze the following data and detect trends:\n\nData: ${JSON.stringify(data)}\nTime Range: ${timeRange || '30 days'}`;

    const result = await getOrchestrator().execute({
      type: 'analytical',
      complexity: 'complex',
      context: prompt,
      priority: 'quality',
    });

    return res.json({
      success: true,
      trends: result.text,
      model: result.model,
    });
  }

  // Predict Content Performance
  if (path === '/api/intelligence/predict-content') {
    const { content, platform } = req.body;

    const prompt = `Predict the performance of this content on ${platform}:\n\n${content}`;

    const result = await getOrchestrator().execute({
      type: 'analytical',
      complexity: 'medium',
      context: prompt,
      priority: 'cost',
    });

    return res.json({
      success: true,
      prediction: result.text,
      model: result.model,
    });
  }

  // Forecast Revenue
  if (path === '/api/intelligence/forecast-revenue') {
    const { historicalData, timeframe } = req.body;

    const prompt = `Forecast revenue for the next ${timeframe} based on this historical data:\n\n${JSON.stringify(historicalData)}`;

    const result = await getOrchestrator().execute({
      type: 'analytical',
      complexity: 'complex',
      context: prompt,
      priority: 'quality',
    });

    return res.json({
      success: true,
      forecast: result.text,
      model: result.model,
    });
  }

  return res.status(404).json({ error: 'Intelligence endpoint not found' });
}

/**
 * Handle Workflow requests
 */
async function handleWorkflows(req: any, res: any) {
  // GET /api/workflows - list workflows
  if (req.method === 'GET' && req.path === '/api/workflows') {
    const { userId } = req.query;

    let query = db.collection('workflows');

    if (userId) {
      query = query.where('userId', '==', userId) as any;
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(100).get();
    const workflows = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, data: workflows });
  }

  // POST /api/workflows - create workflow
  if (req.method === 'POST' && req.path === '/api/workflows') {
    const workflowData = req.body;

    const docRef = await db.collection('workflows').add({
      ...workflowData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await docRef.get();
    return res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  }

  // POST /api/workflows/execute - execute a workflow
  if (req.method === 'POST' && req.path === '/api/workflows/execute') {
    const { workflowId, input } = req.body;

    // Create execution record
    const executionRef = await db.collection('workflow_executions').add({
      workflowId,
      input,
      status: 'running',
      startedAt: new Date(),
    });

    // Execute workflow (simplified - would call actual workflow executor)
    logger.info(`Executing workflow ${workflowId}`, { executionId: executionRef.id });

    return res.json({
      success: true,
      executionId: executionRef.id,
      status: 'running',
    });
  }

  return res.status(404).json({ error: 'Workflow endpoint not found' });
}

/**
 * Handle Content generation requests
 */
async function handleContent(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.path === '/api/content/generate') {
    const { productName, description, platform, tone } = req.body;

    const prompt = `Generate ${platform} content for this product:\n\nProduct: ${productName}\nDescription: ${description}\nTone: ${tone || 'professional'}`;

    const result = await getOrchestrator().execute({
      type: 'creative',
      complexity: 'medium',
      context: prompt,
      priority: 'quality',
    });

    return res.json({
      success: true,
      content: result.text,
      model: result.model,
      cost: result.cost,
    });
  }

  return res.status(404).json({ error: 'Content endpoint not found' });
}

/**
 * Handle Trends discovery requests
 */
async function handleTrends(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.path === '/api/trends/discover') {
    const { category, timeRange } = req.body;

    const prompt = `Discover current trending topics in the ${category} category over the ${timeRange || 'past 7 days'}`;

    const result = await getOrchestrator().execute({
      type: 'analytical',
      complexity: 'medium',
      context: prompt,
      priority: 'cost',
    });

    // Store trends in Firestore
    await db.collection('trends').add({
      category,
      trends: result.text,
      timestamp: new Date(),
      model: result.model,
    });

    return res.json({
      success: true,
      trends: result.text,
      model: result.model,
    });
  }

  return res.status(404).json({ error: 'Trends endpoint not found' });
}
