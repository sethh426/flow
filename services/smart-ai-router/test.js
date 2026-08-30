/**
 * Test script for Smart AI Router
 * Run: node test.js
 */

import { SmartAIRouter } from './index.js';
import dotenv from 'dotenv';

dotenv.config();

async function testRouter() {
  console.log('🧪 Testing Smart AI Router...\n');
  
  // Initialize router
  const router = new SmartAIRouter({
    useFirestore: false // Disable Firestore for local testing
  });
  
  console.log('✅ Router initialized\n');
  
  // Test 1: Simple chat (should use NVIDIA if available, else Gemini Flash)
  console.log('📝 Test 1: Simple chat message');
  try {
    const result1 = await router.route({
      type: 'chat',
      message: 'Say hello in one sentence',
      priority: 'speed',
      userId: 'test-user-1'
    });
    
    console.log('Result:', result1.result);
    console.log('Provider:', result1.metadata.provider);
    console.log('Model:', result1.metadata.model);
    console.log('Cost:', `$${result1.metadata.cost}`);
    console.log('Latency:', `${result1.metadata.latency}ms`);
    console.log('✅ Test 1 passed\n');
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message, '\n');
  }
  
  // Test 2: Content generation (should use Gemini Flash for cost)
  console.log('📝 Test 2: Content generation');
  try {
    const result2 = await router.route({
      type: 'content',
      message: 'Write a short Instagram caption about coffee (max 50 words)',
      priority: 'cost',
      userId: 'test-user-1'
    });
    
    console.log('Result:', result2.result);
    console.log('Provider:', result2.metadata.provider);
    console.log('Model:', result2.metadata.model);
    console.log('Cost:', `$${result2.metadata.cost}`);
    console.log('Latency:', `${result2.metadata.latency}ms`);
    console.log('✅ Test 2 passed\n');
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message, '\n');
  }
  
  // Test 3: Analysis task (should use Gemini Pro for quality)
  console.log('📝 Test 3: Analysis task');
  try {
    const result3 = await router.route({
      type: 'analysis',
      message: 'Analyze the benefits of morning exercise in 3 bullet points',
      priority: 'quality',
      userId: 'test-user-1'
    });
    
    console.log('Result:', result3.result);
    console.log('Provider:', result3.metadata.provider);
    console.log('Model:', result3.metadata.model);
    console.log('Cost:', `$${result3.metadata.cost}`);
    console.log('Latency:', `${result3.metadata.latency}ms`);
    console.log('✅ Test 3 passed\n');
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message, '\n');
  }
  
  // Test 4: Speed priority (should use NVIDIA if available)
  console.log('📝 Test 4: Speed priority');
  try {
    const result4 = await router.route({
      type: 'chat',
      message: 'What is 2+2?',
      priority: 'speed',
      userId: 'test-user-1'
    });
    
    console.log('Result:', result4.result);
    console.log('Provider:', result4.metadata.provider);
    console.log('Model:', result4.metadata.model);
    console.log('Cost:', `$${result4.metadata.cost}`);
    console.log('Latency:', `${result4.metadata.latency}ms`);
    console.log('✅ Test 4 passed\n');
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message, '\n');
  }
  
  // Show final metrics
  console.log('📊 Final Metrics:');
  const metrics = router.getMetrics();
  console.log(JSON.stringify(metrics, null, 2));
  console.log('\n✅ All tests complete!');
}

// Run tests
testRouter().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
