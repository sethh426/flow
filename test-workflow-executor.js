/**
 * Test Workflow Executor
 * 
 * Simple test to verify workflow execution works
 */

import workflowTemplates from '../client/src/data/workflowTemplates.js';

// Simulate a simple workflow execution
const testWorkflow = {
  id: 'test-workflow',
  userId: 'test-user',
  name: 'Test Workflow',
  productType: 'physical',
  status: 'active',
  stages: [
    {
      id: 'stage-1',
      name: 'Test Stage',
      description: 'Simple test stage',
      order: 1,
      triggers: [
        {
          id: 'trigger-1',
          type: 'manual',
          config: { type: 'manual' },
          enabled: true
        }
      ],
      actions: [
        {
          id: 'action-1',
          type: 'notification',
          name: 'Send Test Notification',
          description: 'Test notification',
          config: {
            message: 'Workflow executed successfully!'
          }
        }
      ],
      conditions: [],
      settings: {
        timeout: 30000,
        continueOnError: false
      }
    }
  ],
  metadata: {
    automationLevel: 95,
    averageExecutionTime: 0,
    successRate: 0,
    totalExecutions: 0,
    tags: ['test'],
    category: 'Test',
    description: 'Test workflow'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

console.log('🧪 Testing Workflow Executor\n');

console.log('📦 Available Templates:');
workflowTemplates.forEach((template, index) => {
  console.log(`  ${index + 1}. ${template.icon} ${template.name}`);
  console.log(`     - ${template.estimatedAutomation}% automation`);
  console.log(`     - ${template.stages.length} stages`);
  console.log(`     - Category: ${template.category}`);
  console.log('');
});

console.log('✅ Test workflow structure:');
console.log(JSON.stringify(testWorkflow, null, 2));

console.log('\n🚀 To execute workflows:');
console.log('1. Start the executor: .\\start-workflow-executor.ps1');
console.log('2. Execute via API:');
console.log('   POST http://localhost:8080/api/workflows/test-workflow/execute');
console.log('   Body: { "productUrl": "https://amazon.com/..." }');
console.log('');
console.log('3. Or use the UI at http://localhost:3000/workflows');
