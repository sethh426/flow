/**
 * Workflow Execution Engine
 * 
 * Handles all workflow execution including:
 * - Trigger listeners (scheduled, events, webhooks)
 * - Action executors (content generation, social posting, email, etc.)
 * - Condition evaluation
 * - Error handling and retries
 * - Analytics and metrics tracking
 */

import express from 'express';
import admin from 'firebase-admin';
import cron from 'node-cron';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, '../../serviceAccountKey.json');
let db;

try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  process.exit(1);
}

const app = express();
app.use(express.json());

// ============================================================================
// EXECUTION CONTEXT MANAGER
// ============================================================================

class ExecutionContext {
  constructor(workflowId, executionId) {
    this.workflowId = workflowId;
    this.executionId = executionId;
    this.input = {};
    this.variables = {};
    this.stageResults = {};
    this.errors = [];
    this.startTime = Date.now();
  }

  setVariable(key, value) {
    this.variables[key] = value;
  }

  getVariable(key) {
    return this.variables[key];
  }

  setStageResult(stageId, result) {
    this.stageResults[stageId] = result;
  }

  getStageResult(stageId) {
    return this.stageResults[stageId];
  }

  addError(error) {
    this.errors.push({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      retryCount: error.retryCount || 0
    });
  }

  // Variable interpolation - replace {{variable}} with actual values
  interpolate(text) {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const parts = path.trim().split('.');
      let value = this;
      
      for (const part of parts) {
        if (part === 'input') value = this.input;
        else if (part === 'variables') value = this.variables;
        else if (part.startsWith('stage-')) value = this.stageResults[part];
        else value = value?.[part];
      }
      
      return value !== undefined ? value : match;
    });
  }
}

// ============================================================================
// CONDITION EVALUATOR
// ============================================================================

class ConditionEvaluator {
  static evaluate(condition, context) {
    const value = context.getVariable(condition.field) || context.input[condition.field];
    const expected = condition.value;

    switch (condition.operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'greater_than':
        return Number(value) > Number(expected);
      case 'less_than':
        return Number(value) < Number(expected);
      case 'greater_than_or_equal':
        return Number(value) >= Number(expected);
      case 'less_than_or_equal':
        return Number(value) <= Number(expected);
      case 'contains':
        return String(value).includes(String(expected));
      case 'not_contains':
        return !String(value).includes(String(expected));
      case 'starts_with':
        return String(value).startsWith(String(expected));
      case 'ends_with':
        return String(value).endsWith(String(expected));
      case 'matches_regex':
        return new RegExp(expected).test(String(value));
      case 'is_empty':
        return !value || value.length === 0;
      case 'is_not_empty':
        return value && value.length > 0;
      default:
        return false;
    }
  }

  static evaluateGroup(conditionGroup, context) {
    if (!conditionGroup || !conditionGroup.conditions) return true;

    const results = conditionGroup.conditions.map(condition => {
      if (condition.conditions) {
        // Nested group
        return this.evaluateGroup(condition, context);
      }
      return this.evaluate(condition, context);
    });

    switch (conditionGroup.logic) {
      case 'OR':
        return results.some(r => r);
      case 'NOT':
        return !results.every(r => r);
      case 'AND':
      default:
        return results.every(r => r);
    }
  }
}

// ============================================================================
// ACTION EXECUTORS
// ============================================================================

class ActionExecutor {
  static async execute(action, context) {
    console.log(`Executing action: ${action.type} - ${action.name}`);

    try {
      switch (action.type) {
        case 'generate_content':
          return await this.generateContent(action, context);
        case 'edit_image':
          return await this.editImage(action, context);
        case 'post_instagram':
        case 'post_tiktok':
        case 'post_facebook':
        case 'post_pinterest':
          return await this.postSocial(action, context);
        case 'send_email':
          return await this.sendEmail(action, context);
        case 'send_sms':
          return await this.sendSMS(action, context);
        case 'generate_affiliate_link':
          return await this.generateAffiliateLink(action, context);
        case 'track_click':
          return await this.trackClick(action, context);
        case 'track_conversion':
          return await this.trackConversion(action, context);
        case 'calculate_commission':
          return await this.calculateCommission(action, context);
        case 'fetch_data':
          return await this.fetchData(action, context);
        case 'save_to_database':
          return await this.saveToDatabase(action, context);
        case 'update_record':
          return await this.updateRecord(action, context);
        case 'call_api':
          return await this.callAPI(action, context);
        case 'webhook_post':
          return await this.webhookPost(action, context);
        case 'wait':
          return await this.wait(action, context);
        case 'conditional_branch':
          return await this.conditionalBranch(action, context);
        case 'notification':
          return await this.sendNotification(action, context);
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Action execution failed: ${action.type}`, error);
      throw error;
    }
  }

  // Content Generation
  static async generateContent(action, context) {
    const config = action.config;
    const url = 'https://image-generator-871326713343.us-central1.run.app/generate';
    
    const prompt = context.interpolate(config.prompt || 'Generate product image');
    
    const response = await axios.post(url, {
      prompt,
      templateId: config.templateId,
      count: config.count || 1
    });

    return {
      images: response.data.images,
      content: response.data.content
    };
  }

  // Image Editing
  static async editImage(action, context) {
    const config = action.config;
    const imageUrl = context.interpolate(config.imageUrl);
    const prompt = context.interpolate(config.prompt);

    // Call image editing service
    const response = await axios.post('https://image-generator-871326713343.us-central1.run.app/edit', {
      imageUrl,
      prompt,
      maskData: config.maskData
    });

    return { editedImageUrl: response.data.editedImageUrl };
  }

  // Social Media Posting
  static async postSocial(action, context) {
    const config = action.config;
    const platform = config.platform;
    const imageUrl = context.interpolate(config.content?.imageUrl);
    const text = context.interpolate(config.content?.text);

    // Save to Firestore for manual posting (or integrate with social APIs)
    await db.collection('scheduled_posts').add({
      platform,
      imageUrl,
      text,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      workflowId: context.workflowId,
      executionId: context.executionId
    });

    return { platform, status: 'scheduled', imageUrl, text };
  }

  // Email
  static async sendEmail(action, context) {
    const config = action.config;
    const to = context.interpolate(config.to);
    const subject = context.interpolate(config.subject);
    const template = config.template;

    // Save to Firestore for email service to pick up
    await db.collection('email_queue').add({
      to,
      subject,
      template,
      variables: config.variables || {},
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { to, subject, status: 'queued' };
  }

  // SMS
  static async sendSMS(action, context) {
    const config = action.config;
    const to = context.interpolate(config.to);
    const message = context.interpolate(config.message);

    await db.collection('sms_queue').add({
      to,
      message,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { to, status: 'queued' };
  }

  // Affiliate Links
  static async generateAffiliateLink(action, context) {
    const config = action.config;
    const productUrl = context.interpolate(config.productUrl || context.input.productUrl);
    const network = config.network;

    // Simple affiliate link generation (would integrate with actual networks)
    const trackingId = `aff-${Date.now()}`;
    const affiliateLink = `${productUrl}?tag=${network}-${trackingId}`;

    // Save tracking info
    await db.collection('affiliate_links').add({
      productUrl,
      affiliateLink,
      network,
      trackingId,
      clicks: 0,
      conversions: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { affiliateLink, trackingId };
  }

  // Click Tracking
  static async trackClick(action, context) {
    const config = action.config;
    const trackingId = context.interpolate(config.trackingId);

    await db.collection('affiliate_links')
      .where('trackingId', '==', trackingId)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.update({ clicks: admin.firestore.FieldValue.increment(1) });
        });
      });

    await db.collection('clicks').add({
      trackingId,
      metadata: config.metadata || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { trackingId, tracked: true };
  }

  // Conversion Tracking
  static async trackConversion(action, context) {
    const config = action.config;
    const trackingId = context.interpolate(config.trackingId || config.userId);
    const amount = Number(context.interpolate(config.amount));
    const commission = Number(context.interpolate(config.commission));

    await db.collection('conversions').add({
      trackingId,
      amount,
      commission,
      status: 'completed',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { trackingId, amount, commission };
  }

  // Commission Calculation
  static async calculateCommission(action, context) {
    const config = action.config;
    const rate = Number(config.rate);
    const productPrice = Number(context.interpolate(config.productPrice));
    const commission = productPrice * rate;

    context.setVariable('commission', commission);
    return { commission, rate, productPrice };
  }

  // Data Fetching
  static async fetchData(action, context) {
    const config = action.config;
    const source = context.interpolate(config.source);

    // Call scraping service or API
    const response = await axios.get(source);
    return response.data;
  }

  // Database Save
  static async saveToDatabase(action, context) {
    const config = action.config;
    const collection = config.collection;
    const data = config.data;

    // Interpolate all data fields
    const interpolatedData = {};
    for (const [key, value] of Object.entries(data)) {
      interpolatedData[key] = context.interpolate(value);
    }

    const docRef = await db.collection(collection).add({
      ...interpolatedData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: docRef.id, collection };
  }

  // Database Update
  static async updateRecord(action, context) {
    const config = action.config;
    const collection = config.collection;
    const documentId = context.interpolate(config.documentId);
    const data = config.data;

    await db.collection(collection).doc(documentId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: documentId, updated: true };
  }

  // API Call
  static async callAPI(action, context) {
    const config = action.config;
    const url = context.interpolate(config.url);
    const method = config.method || 'GET';
    const body = config.body;

    const response = await axios({
      method,
      url,
      data: body,
      headers: config.headers || {}
    });

    return response.data;
  }

  // Webhook
  static async webhookPost(action, context) {
    const config = action.config;
    const url = context.interpolate(config.url);
    const payload = config.payload || context.variables;

    await axios.post(url, payload);
    return { webhookSent: true, url };
  }

  // Wait
  static async wait(action, context) {
    const config = action.config;
    const duration = config.duration; // milliseconds

    await new Promise(resolve => setTimeout(resolve, duration));
    return { waited: duration };
  }

  // Conditional Branch
  static async conditionalBranch(action, context) {
    const config = action.config;
    const condition = config.condition;
    
    const result = ConditionEvaluator.evaluate(condition, context);
    context.setVariable('branch_result', result);
    
    return { conditionMet: result };
  }

  // Notification
  static async sendNotification(action, context) {
    const config = action.config;
    const message = context.interpolate(config.message);
    
    console.log(`📬 Notification: ${message}`);
    
    return { notificationSent: true, message };
  }
}

// ============================================================================
// WORKFLOW EXECUTOR
// ============================================================================

class WorkflowExecutor {
  static async executeWorkflow(workflow, input = {}) {
    const executionId = `exec-${Date.now()}`;
    const context = new ExecutionContext(workflow.id, executionId);
    context.input = input;

    console.log(`\n🚀 Starting workflow execution: ${workflow.name} (${executionId})`);

    // Create execution record
    const executionRef = await db.collection('workflow_executions').add({
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      startTime: admin.firestore.FieldValue.serverTimestamp(),
      input,
      context: {}
    });

    try {
      // Execute stages in order
      for (const stage of workflow.stages.sort((a, b) => a.order - b.order)) {
        console.log(`\n  📍 Stage ${stage.order}: ${stage.name}`);

        // Check stage conditions
        if (stage.conditions && stage.conditions.length > 0) {
          const conditionsMet = stage.conditions.every(condition => 
            ConditionEvaluator.evaluate(condition, context)
          );

          if (!conditionsMet) {
            console.log(`  ⏭️  Skipping stage - conditions not met`);
            continue;
          }
        }

        // Execute actions
        const stageResult = { actions: [] };

        for (const action of stage.actions) {
          try {
            const result = await this.executeActionWithRetry(
              action,
              context,
              stage.settings?.retryPolicy
            );
            
            stageResult.actions.push({
              actionId: action.id,
              type: action.type,
              result,
              status: 'success'
            });

            console.log(`    ✅ ${action.name || action.type}: Success`);
          } catch (error) {
            console.error(`    ❌ ${action.name || action.type}: Failed`, error.message);
            
            stageResult.actions.push({
              actionId: action.id,
              type: action.type,
              error: error.message,
              status: 'failed'
            });

            context.addError(error);

            if (!stage.settings?.continueOnError) {
              throw error;
            }
          }
        }

        context.setStageResult(stage.id, stageResult);
      }

      // Update execution record - SUCCESS
      await executionRef.update({
        status: 'completed',
        endTime: admin.firestore.FieldValue.serverTimestamp(),
        context: context.variables,
        stageResults: context.stageResults,
        errors: context.errors
      });

      console.log(`\n✅ Workflow completed successfully: ${workflow.name}`);

      return {
        executionId,
        status: 'completed',
        results: context.stageResults
      };

    } catch (error) {
      // Update execution record - FAILED
      await executionRef.update({
        status: 'failed',
        endTime: admin.firestore.FieldValue.serverTimestamp(),
        error: error.message,
        errors: context.errors
      });

      console.error(`\n❌ Workflow failed: ${workflow.name}`, error.message);

      throw error;
    }
  }

  static async executeActionWithRetry(action, context, retryPolicy) {
    const maxAttempts = retryPolicy?.maxAttempts || 3;
    const backoffStrategy = retryPolicy?.backoffStrategy || 'exponential';
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await ActionExecutor.execute(action, context);
      } catch (error) {
        lastError = error;
        lastError.retryCount = attempt;
        
        if (attempt < maxAttempts) {
          const delay = this.calculateBackoff(attempt, backoffStrategy);
          console.log(`    🔄 Retry ${attempt}/${maxAttempts} after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  static calculateBackoff(attempt, strategy) {
    switch (strategy) {
      case 'exponential':
        return Math.pow(2, attempt) * 1000; // 2s, 4s, 8s, ...
      case 'linear':
        return attempt * 2000; // 2s, 4s, 6s, ...
      case 'fixed':
      default:
        return 2000; // 2s
    }
  }
}

// ============================================================================
// TRIGGER LISTENERS
// ============================================================================

// Scheduled Trigger Listener (Cron)
const scheduledTriggers = new Map();

async function setupScheduledTriggers() {
  console.log('📅 Setting up scheduled triggers...');

  const workflowsSnapshot = await db.collection('workflows')
    .where('status', '==', 'active')
    .get();

  workflowsSnapshot.forEach(doc => {
    const workflow = doc.data();
    
    workflow.stages?.forEach(stage => {
      stage.triggers?.forEach(trigger => {
        if (trigger.type === 'scheduled' && trigger.enabled) {
          const cronExpression = trigger.config.cronExpression;
          const triggerId = `${workflow.id}-${stage.id}-${trigger.id}`;

          if (cron.validate(cronExpression)) {
            const task = cron.schedule(cronExpression, async () => {
              console.log(`\n⏰ Scheduled trigger fired: ${workflow.name}`);
              try {
                await WorkflowExecutor.executeWorkflow(workflow);
              } catch (error) {
                console.error('Scheduled execution failed:', error);
              }
            });

            scheduledTriggers.set(triggerId, task);
            console.log(`  ✅ Scheduled: ${workflow.name} - ${cronExpression}`);
          }
        }
      });
    });
  });
}

// Event Trigger Listener (Firestore)
async function setupEventTriggers() {
  console.log('📡 Setting up event triggers...');

  const workflowsSnapshot = await db.collection('workflows')
    .where('status', '==', 'active')
    .get();

  workflowsSnapshot.forEach(doc => {
    const workflow = doc.data();
    
    workflow.stages?.forEach(stage => {
      stage.triggers?.forEach(trigger => {
        if (trigger.type === 'event' && trigger.enabled) {
          const collection = trigger.config.collection;
          const changeType = trigger.config.changeType;

          // Listen to Firestore changes
          db.collection(collection).onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
              if (change.type === changeType || changeType === 'any') {
                console.log(`\n📨 Event trigger fired: ${workflow.name}`);
                WorkflowExecutor.executeWorkflow(workflow, {
                  eventData: change.doc.data(),
                  eventType: change.type
                }).catch(console.error);
              }
            });
          });

          console.log(`  ✅ Event listener: ${collection} (${changeType})`);
        }
      });
    });
  });
}

// ============================================================================
// API ROUTES
// ============================================================================

// Manual trigger endpoint
app.post('/api/workflows/:workflowId/execute', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const input = req.body;

    const workflowDoc = await db.collection('workflows').doc(workflowId).get();
    
    if (!workflowDoc.exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflow = workflowDoc.data();
    const result = await WorkflowExecutor.executeWorkflow(workflow, input);

    res.json(result);
  } catch (error) {
    console.error('Manual execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook trigger endpoint
app.post('/api/webhooks/:workflowId/:triggerId', async (req, res) => {
  try {
    const { workflowId, triggerId } = req.params;
    const payload = req.body;

    const workflowDoc = await db.collection('workflows').doc(workflowId).get();
    
    if (!workflowDoc.exists) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflow = workflowDoc.data();
    
    console.log(`\n🔗 Webhook trigger fired: ${workflow.name}`);
    const result = await WorkflowExecutor.executeWorkflow(workflow, {
      webhookPayload: payload,
      triggerId
    });

    res.json(result);
  } catch (error) {
    console.error('Webhook execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get execution status
app.get('/api/executions/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const executionSnapshot = await db.collection('workflow_executions')
      .where('executionId', '==', executionId)
      .limit(1)
      .get();

    if (executionSnapshot.empty) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    const execution = executionSnapshot.docs[0].data();
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'workflow-executor',
    scheduledTriggers: scheduledTriggers.size,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  console.log(`\n🚀 Workflow Executor running on port ${PORT}`);
  
  try {
    await setupScheduledTriggers();
    await setupEventTriggers();
    console.log('\n✅ All triggers initialized successfully\n');
  } catch (error) {
    console.error('❌ Trigger setup error:', error);
  }
});

export default app;
