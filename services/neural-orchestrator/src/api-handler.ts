import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { Firestore } from '@google-cloud/firestore';
import { DecodedIdToken } from 'firebase-admin/auth';
import type { NeuralOrchestrator } from './index';
import {
  handleCors,
  isAdmin,
  isLiveAiEnabled,
  requireFirebaseUser,
  requireLiveAi,
} from './http-security';

const db = new Firestore();
let orchestrator: NeuralOrchestrator | null = null;

async function getOrchestrator(): Promise<NeuralOrchestrator> {
  if (!orchestrator) {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'affiliateflow-abzfy';
    const { NeuralOrchestrator } = await import('./index');
    orchestrator = new NeuralOrchestrator(projectId);
  }
  return orchestrator;
}

function boundedString(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function timestampValue(value: any): number {
  if (value?.toMillis) return value.toMillis();
  const parsed = new Date(value || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function canManageDocument(data: any, user: DecodedIdToken): boolean {
  return data?.userId === user.uid || isAdmin(user);
}

function withoutProtectedFields(body: any): Record<string, unknown> {
  const source = body && typeof body === 'object' ? body : {};
  const { id, userId, createdAt, updatedAt, ...safe } = source;
  return safe;
}

/**
 * Unified API endpoint - handles all /api/* requests
 * This replaces the Next.js API routes that were moved to _api_backup
 */
export const api = onRequest({
  timeoutSeconds: 120,
  memory: '512MiB',
  maxInstances: 10,
  concurrency: 40,
  cors: false,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  const path = req.path;
  const method = req.method;

  if (path === '/api/health') {
    if (method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.json({
      status: 'ok',
      service: 'affiliateflow-api',
      version: '2026-09-01',
      authentication: 'Firebase ID token required outside this health route',
      aiEnabled: isLiveAiEnabled(),
      timestamp: new Date().toISOString(),
    });
  }

  const user = await requireFirebaseUser(req, res);
  if (!user) {
    return;
  }

  logger.info('Authenticated API request', {
    method,
    path,
    userId: user.uid,
  });

  try {
    // Route to appropriate handler
    if (path.startsWith('/api/flowbot')) {
      return await handleFlowbot(req, res, user);
    } else if (path.startsWith('/api/analytics')) {
      return await handleAnalytics(req, res, user);
    } else if (path.startsWith('/api/campaigns')) {
      return await handleCampaigns(req, res, user);
    } else if (path.startsWith('/api/products')) {
      return await handleProducts(req, res, user);
    } else if (path.startsWith('/api/intelligence')) {
      return await handleIntelligence(req, res, user);
    } else if (path.startsWith('/api/workflows')) {
      return await handleWorkflows(req, res, user);
    } else if (path.startsWith('/api/content') || path === '/api/generate-content') {
      return await handleContent(req, res, user);
    } else if (path.startsWith('/api/trends')) {
      return await handleTrends(req, res, user);
    } else if (
      path.startsWith('/api/ab-tests') ||
      path.startsWith('/api/social-') ||
      path.startsWith('/api/messages') ||
      path.startsWith('/api/image')
    ) {
      return res.status(501).json({
        error: 'This operation is not implemented in the live API.',
        code: 'NOT_IMPLEMENTED',
        path,
      });
    } else {
      return res.status(404).json({ error: 'API endpoint not found', path });
    }
  } catch (error: any) {
    logger.error(`API Error: ${method} ${path}`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle Flowbot chat requests
 */
async function handleFlowbot(req: any, res: any, user: DecodedIdToken) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireLiveAi(res)) return;

  const question = boundedString(req.body?.question || req.body?.message, 8000);
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-20) : [];

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // Use neural orchestrator for intelligent routing
  const result = await (await getOrchestrator()).execute({
    type: 'conversational',
    complexity: 'complex',
    context: `${history ? 'Previous conversation:\n' + JSON.stringify(history) + '\n\n' : ''}User question: ${question}`,
    priority: 'quality',
  });

  await db.collection('flowbot_conversations').add({
    userId: user.uid,
    question,
    answer: result.text,
    timestamp: new Date(),
    model: result.model,
    cost: result.cost,
  });

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
async function handleAnalytics(req: any, res: any, user: DecodedIdToken) {
  const path = req.path;

  // GET /api/analytics - get analytics data
  if (req.method === 'GET' && path === '/api/analytics') {
    const { timeRange = '7d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    const days = Math.min(Math.max(parseInt(String(timeRange).replace('d', '')) || 7, 1), 90);
    startDate.setDate(startDate.getDate() - days);

    const snapshot = await db.collection('analytics')
      .where('userId', '==', user.uid)
      .limit(1000)
      .get();
    const analytics = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => {
        const timestamp = timestampValue(item.timestamp);
        return timestamp >= startDate.getTime() && timestamp <= endDate.getTime();
      })
      .sort((a: any, b: any) => timestampValue(b.timestamp) - timestampValue(a.timestamp));

    return res.json({ success: true, data: analytics });
  }

  // GET /api/analytics/summary - get summary stats
  if (req.method === 'GET' && path === '/api/analytics/summary') {
    const summaryDoc = await db.collection('analytics_summary')
      .doc(user.uid)
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
async function handleCampaigns(req: any, res: any, user: DecodedIdToken) {
  // GET /api/campaigns - list campaigns
  if (req.method === 'GET' && req.path === '/api/campaigns') {
    const status = boundedString(req.query?.status, 40);
    const snapshot = await db.collection('campaigns')
      .where('userId', '==', user.uid)
      .limit(100)
      .get();
    const campaigns = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => !status || item.status === status)
      .sort((a: any, b: any) => timestampValue(b.createdAt) - timestampValue(a.createdAt));

    return res.json({ success: true, data: campaigns });
  }

  // POST /api/campaigns - create campaign
  if (req.method === 'POST' && req.path === '/api/campaigns') {
    const campaignData = withoutProtectedFields(req.body);
    const name = boundedString((campaignData as any).name, 160);

    if (!name) {
      return res.status(400).json({ error: 'Campaign name is required.' });
    }

    const docRef = await db.collection('campaigns').add({
      ...campaignData,
      name,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: boundedString((campaignData as any).status, 40) || 'draft',
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

    if (!canManageDocument(doc.data(), user)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  }

  // PATCH /api/campaigns/[id] - update campaign
  if (req.method === 'PATCH' && idMatch) {
    const campaignId = idMatch[1];
    const existing = await db.collection('campaigns').doc(campaignId).get();

    if (!existing.exists) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    if (!canManageDocument(existing.data(), user)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updates = withoutProtectedFields(req.body);

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
    const existing = await db.collection('campaigns').doc(campaignId).get();

    if (!existing.exists) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    if (!canManageDocument(existing.data(), user)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await db.collection('campaigns').doc(campaignId).delete();

    return res.json({ success: true, message: 'Campaign deleted' });
  }

  return res.status(404).json({ error: 'Campaign endpoint not found' });
}

/**
 * Handle Product requests
 */
async function handleProducts(req: any, res: any, user: DecodedIdToken) {
  // GET /api/products - list products
  if (req.method === 'GET' && req.path === '/api/products') {
    const category = boundedString(req.query?.category, 80);
    const status = boundedString(req.query?.status, 40);
    const snapshot = await db.collection('products').limit(200).get();
    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => !item.userId || item.userId === user.uid || isAdmin(user))
      .filter((item: any) => !category || item.category === category)
      .filter((item: any) => !status || item.status === status)
      .sort((a: any, b: any) => {
        const aTime = timestampValue(a.createdAt || a.timestamp);
        const bTime = timestampValue(b.createdAt || b.timestamp);
        return bTime - aTime;
      })
      .slice(0, 100);

    return res.json({ success: true, data: products });
  }

  // POST /api/products - create product
  if (req.method === 'POST' && req.path === '/api/products') {
    const productData = withoutProtectedFields(req.body);
    const name = boundedString(
      (productData as any).name || (productData as any).title,
      200,
    );

    if (!name) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const docRef = await db.collection('products').add({
      ...productData,
      name,
      userId: user.uid,
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

      const productData = doc.data();
      if (productData?.userId && !canManageDocument(productData, user)) {
        return res.status(403).json({ error: 'Access denied.' });
      }

      return res.json({
        success: true,
        data: { id: doc.id, ...doc.data() },
      });
    }

    // PATCH /api/products/[id]
    if (req.method === 'PATCH' && !subPath) {
      const existing = await db.collection('products').doc(productId).get();

      if (!existing.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (!canManageDocument(existing.data(), user)) {
        return res.status(403).json({ error: 'Only the product owner can update it.' });
      }

      const updates = withoutProtectedFields(req.body);

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
      const existing = await db.collection('products').doc(productId).get();

      if (!existing.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (!canManageDocument(existing.data(), user)) {
        return res.status(403).json({ error: 'Only the product owner can delete it.' });
      }

      await db.collection('products').doc(productId).delete();
      return res.json({ success: true, message: 'Product deleted' });
    }
  }

  return res.status(404).json({ error: 'Product endpoint not found' });
}

/**
 * Handle Intelligence/AI requests
 */
async function handleIntelligence(req: any, res: any, user: DecodedIdToken) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireLiveAi(res)) return;

  const path = req.path;

  // AI Router - intelligent model selection
  if (path === '/api/intelligence/ai-router') {
    const { prompt, taskType, priority } = req.body;

    const result = await (await getOrchestrator()).execute({
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

    const result = await (await getOrchestrator()).execute({
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

    const result = await (await getOrchestrator()).execute({
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

    const result = await (await getOrchestrator()).execute({
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
async function handleWorkflows(req: any, res: any, user: DecodedIdToken) {
  // GET /api/workflows - list workflows
  if (req.method === 'GET' && req.path === '/api/workflows') {
    const snapshot = await db.collection('workflows')
      .where('userId', '==', user.uid)
      .limit(100)
      .get();
    const workflows = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => timestampValue(b.createdAt) - timestampValue(a.createdAt));

    return res.json({ success: true, data: workflows });
  }

  // POST /api/workflows - create workflow
  if (req.method === 'POST' && req.path === '/api/workflows') {
    const workflowData = withoutProtectedFields(req.body);
    const name = boundedString((workflowData as any).name, 160);

    if (!name) {
      return res.status(400).json({ error: 'Workflow name is required.' });
    }

    const docRef = await db.collection('workflows').add({
      ...workflowData,
      name,
      userId: user.uid,
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
    return res.status(501).json({
      error: 'Workflow execution is not implemented in the live API.',
      code: 'WORKFLOW_EXECUTOR_NOT_CONNECTED',
    });
  }

  return res.status(404).json({ error: 'Workflow endpoint not found' });
}

/**
 * Handle Content generation requests
 */
async function handleContent(req: any, res: any, user: DecodedIdToken) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireLiveAi(res)) return;

  if (req.path === '/api/content/generate' || req.path === '/api/generate-content') {
    const { productName, description, platform, tone } = req.body;

    const prompt = `Generate ${platform} content for this product:\n\nProduct: ${productName}\nDescription: ${description}\nTone: ${tone || 'professional'}`;

    const result = await (await getOrchestrator()).execute({
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
async function handleTrends(req: any, res: any, user: DecodedIdToken) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireLiveAi(res)) return;

  if (req.path === '/api/trends/discover') {
    const { category, timeRange } = req.body;

    const prompt = `Discover current trending topics in the ${category} category over the ${timeRange || 'past 7 days'}`;

    const result = await (await getOrchestrator()).execute({
      type: 'analytical',
      complexity: 'medium',
      context: prompt,
      priority: 'cost',
    });

    // Store trends in Firestore
    await db.collection('trends').add({
      userId: user.uid,
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
