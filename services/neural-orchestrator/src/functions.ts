import { onRequest } from 'firebase-functions/v2/https';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import type { NeuralOrchestrator } from './index';
import {
  handleCors,
  isLiveAiEnabled,
  requireFirebaseUser,
  requireLiveAi,
} from './http-security';

// Export the unified API handler
export { api } from './api-handler';

let orchestrator: NeuralOrchestrator | null = null;

async function getOrchestrator(): Promise<NeuralOrchestrator> {
  if (!orchestrator) {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'affiliateflow-abzfy';
    const { NeuralOrchestrator } = await import('./index');
    orchestrator = new NeuralOrchestrator(projectId);
  }
  return orchestrator;
}

/**
 * Main AI routing endpoint
 * POST /aiRoute
 * Body: AIRequest
 */
export const aiRoute = onRequest({
  timeoutSeconds: 120,
  memory: '2GiB',
  maxInstances: 10,
  invoker: 'private',
  cors: false,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await requireFirebaseUser(req, res);
  if (!user || !requireLiveAi(res)) return;

  try {
    logger.info('AI route request received', { userId: user.uid });
    const request = req.body;
    
    if (!request.type || !request.complexity || !request.context || !request.priority) {
      res.status(400).json({ 
        error: 'Missing required fields: type, complexity, context, priority' 
      });
      return;
    }

    const result = await (await getOrchestrator()).execute(request);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error('AI routing error:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

/**
 * Content analysis endpoint
 * POST /aiAnalyze
 */
export const aiAnalyze = onRequest({
  timeoutSeconds: 120,
  memory: '1GiB',
  maxInstances: 10,
  invoker: 'private',
  cors: false,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await requireFirebaseUser(req, res);
  if (!user || !requireLiveAi(res)) return;

  try {
    const { content, analysisType = 'general', priority = 'quality' } = req.body;
    
    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    const result = await (await getOrchestrator()).execute({
      type: 'analytical',
      complexity: 'complex',
      context: `Perform ${analysisType} analysis on this content:\n\n${content}`,
      priority: priority as any,
    });

    res.json({
      success: true,
      analysis: result.text,
      meta: {
        model: result.model,
        tokensUsed: result.tokensUsed,
        latency: result.latency,
        cost: result.cost,
      },
    });
  } catch (error: any) {
    logger.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * Creative content generation endpoint
 * POST /aiGenerate
 */
export const aiGenerate = onRequest({
  timeoutSeconds: 120,
  memory: '1GiB',
  maxInstances: 10,
  invoker: 'private',
  cors: false,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await requireFirebaseUser(req, res);
  if (!user || !requireLiveAi(res)) return;

  try {
    const { 
      prompt, 
      format = 'text', 
      tone = 'professional',
      length = 'medium',
      priority = 'quality',
    } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const complexityMap = {
      'short': 'simple',
      'medium': 'medium',
      'long': 'complex',
    };

    const result = await (await getOrchestrator()).execute({
      type: 'creative',
      complexity: (complexityMap[length as keyof typeof complexityMap] || 'medium') as any,
      context: `Generate ${format} content with ${tone} tone:\n\n${prompt}`,
      priority: priority as any,
    });

    res.json({
      success: true,
      content: result.text,
      meta: {
        model: result.model,
        tokensUsed: result.tokensUsed,
        latency: result.latency,
        cost: result.cost,
      },
    });
  } catch (error: any) {
    logger.error('Generation error:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
});

/**
 * Code generation and assistance endpoint
 * POST /aiCode
 */
export const aiCode = onRequest({
  timeoutSeconds: 120,
  memory: '2GiB',
  maxInstances: 5,
  invoker: 'private',
  cors: false,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await requireFirebaseUser(req, res);
  if (!user || !requireLiveAi(res)) return;

  try {
    const { task, language, framework, context } = req.body;
    
    if (!task) {
      res.status(400).json({ error: 'Task description is required' });
      return;
    }

    const fullContext = `
Language: ${language || 'any'}
Framework: ${framework || 'any'}
Task: ${task}
${context ? `Additional Context: ${context}` : ''}

Provide complete, production-ready code with explanations.
    `.trim();

    const result = await (await getOrchestrator()).execute({
      type: 'coding',
      complexity: 'complex',
      context: fullContext,
      priority: 'quality',
    });

    res.json({
      success: true,
      code: result.text,
      meta: {
        model: result.model,
        tokensUsed: result.tokensUsed,
        latency: result.latency,
        cost: result.cost,
      },
    });
  } catch (error: any) {
    logger.error('Code generation error:', error);
    res.status(500).json({ error: 'Code generation failed' });
  }
});

/**
 * Batch processing endpoint
 * POST /aiBatch
 */
export const aiBatch = onRequest({
  timeoutSeconds: 120,
  memory: '4GiB',
  maxInstances: 3,
  invoker: 'private',
  cors: false,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await requireFirebaseUser(req, res);
  if (!user || !requireLiveAi(res)) return;

  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      res.status(400).json({ error: 'requests array is required' });
      return;
    }

    if (requests.length > 50) {
      res.status(400).json({ error: 'Maximum 50 requests per batch' });
      return;
    }

    logger.info(`Processing batch of ${requests.length} requests`);
    const results = await (await getOrchestrator()).executeBatch(requests);

    const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0);
    const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;

    res.json({
      success: true,
      results,
      summary: {
        totalRequests: requests.length,
        successCount: results.filter(r => r.model !== 'error').length,
        totalCost,
        totalTokens,
        avgLatency,
      },
    });
  } catch (error: any) {
    logger.error('Batch processing error:', error);
    res.status(500).json({ error: 'Batch processing failed' });
  }
});

/**
 * System health and metrics endpoint
 * GET /aiHealth
 */
export const aiHealth = onRequest({
  timeoutSeconds: 60,
  memory: '512MiB',
  maxInstances: 3,
  invoker: 'private',
  cors: false,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.json({
    success: true,
    status: 'healthy',
    aiEnabled: isLiveAiEnabled(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Pub/Sub event handler for async AI processing
 */
export const aiEventProcessor = onMessagePublished({
  topic: 'ai-requests',
  memory: '2GiB',
  timeoutSeconds: 540,
}, async (event) => {
  try {
    const request = event.data.message.json;
    if (!isLiveAiEnabled()) {
      logger.warn('Skipping async AI request because live AI is disabled', {
        requestId: request?.requestId,
      });
      return;
    }

    logger.info('Processing async AI request', {
      requestId: request?.requestId,
      type: request?.type,
    });
    
    const result = await (await getOrchestrator()).execute(request);
    
    // Publish result to response topic
    const { PubSub } = await import('@google-cloud/pubsub');
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'affiliateflow-abzfy';
    const pubsub = new PubSub({ projectId });
    await pubsub.topic('ai-responses').publishMessage({
      json: {
        requestId: request.requestId,
        result,
        timestamp: new Date().toISOString(),
      },
    });
    
    logger.info('Async AI request completed', {
      requestId: request?.requestId,
      model: result.model,
      cost: result.cost,
    });
  } catch (error: any) {
    logger.error('Async processing error:', error);
    throw error;
  }
});

/**
 * Scheduled cleanup of old cache and metrics
 * Runs daily at 2 AM
 */
export const cleanupScheduled = onSchedule({
  schedule: '0 2 * * *',
  timeZone: 'America/New_York',
  memory: '1GiB',
}, async (event) => {
  try {
    logger.info('Running scheduled cleanup');
    
    const { Firestore } = await import('@google-cloud/firestore');
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'affiliateflow-abzfy';
    const firestore = new Firestore({ projectId });
    
    // Delete cache entries older than 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const oldCache = await firestore
      .collection('routing_cache')
      .where('timestamp', '<', oneDayAgo)
      .limit(450)
      .get();
    
    const batch = firestore.batch();
    oldCache.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    
    logger.info(`Cleaned up ${oldCache.size} old cache entries`);
    
    // Archive old routing decisions (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const oldDecisions = await firestore
      .collection('routing_decisions')
      .where('timestamp', '<', sevenDaysAgo)
      // Each document uses two writes (archive plus delete). Staying below
      // 250 documents keeps the batch under Firestore's 500-write limit.
      .limit(225)
      .get();
    
    const archiveBatch = firestore.batch();
    oldDecisions.docs.forEach(doc => {
      archiveBatch.set(
        firestore.collection('routing_decisions_archive').doc(doc.id),
        doc.data()
      );
      archiveBatch.delete(doc.ref);
    });
    await archiveBatch.commit();
    
    logger.info(`Archived ${oldDecisions.size} old routing decisions`);
  } catch (error: any) {
    logger.error('Cleanup error:', error);
    throw error;
  }
});

/**
 * Real-time model performance monitoring
 * Aggregates metrics every hour
 */
export const aggregateMetrics = onSchedule({
  schedule: '0 * * * *', // Every hour
  timeZone: 'America/New_York',
  memory: '1GiB',
}, async (event) => {
  try {
    logger.info('Aggregating performance metrics');
    
    const { Firestore } = await import('@google-cloud/firestore');
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'affiliateflow-abzfy';
    const firestore = new Firestore({ projectId });
    
    const metrics = await firestore
      .collection('model_performance')
      .get();
    
    const aggregated: any = {
      timestamp: new Date(),
      totalRequests: 0,
      totalCost: 0,
      models: {},
    };
    
    metrics.forEach(doc => {
      const data = doc.data();
      aggregated.totalRequests += data.totalCount || 0;
      aggregated.totalCost += data.totalCost || 0;
      
      const [modelId] = doc.id.split('-');
      if (!aggregated.models[modelId]) {
        aggregated.models[modelId] = {
          requests: 0,
          cost: 0,
          avgLatency: 0,
        };
      }
      
      aggregated.models[modelId].requests += data.totalCount || 0;
      aggregated.models[modelId].cost += data.totalCost || 0;
      aggregated.models[modelId].avgLatency = data.avgLatency || 0;
    });
    
    await firestore
      .collection('performance_aggregates')
      .add(aggregated);
    
    logger.info('Metrics aggregated', {
      totalRequests: aggregated.totalRequests,
      totalCost: aggregated.totalCost,
      modelCount: Object.keys(aggregated.models).length,
    });
  } catch (error: any) {
    logger.error('Aggregation error:', error);
    throw error;
  }
});
