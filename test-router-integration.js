/**
 * Test Smart AI Router Integration
 * 
 * Tests FlowBot, Content Generation, and AI Costs endpoints
 */

const BASE_URL = 'http://localhost:3001';

async function testFlowBot() {
  console.log('\n📝 Testing FlowBot API with Smart AI Router...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/flowbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Hi Flow! How can you help me grow my business?',
        history: []
      })
    });

    const data = await response.json();
    
    if (data.answer) {
      console.log('✅ FlowBot Response:');
      console.log(data.answer.substring(0, 200) + '...\n');
      
      if (data.action) {
        console.log('🎯 Action Detected:', data.action.type);
        console.log('📋 Parameters:', JSON.stringify(data.action.parameters, null, 2));
      }
    } else {
      console.error('❌ FlowBot Error:', data.error);
    }
  } catch (error) {
    console.error('❌ FlowBot API Error:', error.message);
  }
}

async function testContentGeneration() {
  console.log('\n✍️  Testing Content Generation API with Smart AI Router...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'caption',
        platform: 'instagram',
        topic: 'morning coffee routine',
        tone: 'casual',
        length: 'short',
        includeHashtags: true,
        includeCTA: true
      })
    });

    const data = await response.json();
    
    if (data.success && data.content) {
      console.log('✅ Generated Caption:');
      console.log(data.content.caption);
      console.log('\n📊 Metadata:', JSON.stringify(data.metadata, null, 2));
      
      if (data.content._aiMetrics) {
        console.log('\n💰 AI Metrics:');
        console.log(`  Cost: $${data.content._aiMetrics.cost?.toFixed(6)}`);
        console.log(`  Tokens: ${data.content._aiMetrics.tokens}`);
        console.log(`  Latency: ${data.content._aiMetrics.latency}ms`);
      }
    } else {
      console.error('❌ Content Generation Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Content API Error:', error.message);
  }
}

async function testAICosts() {
  console.log('\n💰 Testing AI Costs API...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-costs`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ AI Router Metrics:');
      console.log('━'.repeat(50));
      console.log(`Total Requests: ${data.metrics.totalRequests}`);
      console.log(`Total Cost: ${data.metrics.totalCost}`);
      console.log(`Avg Cost/Request: ${data.metrics.avgCostPerRequest}`);
      console.log(`Avg Latency: ${data.metrics.avgLatency}`);
      console.log('\n📊 Token Usage:');
      console.log(`  Input: ${data.metrics.tokens.input}`);
      console.log(`  Output: ${data.metrics.tokens.output}`);
      console.log(`  Total: ${data.metrics.tokens.total}`);
      console.log('\n💵 Cost Breakdown:');
      console.log(`  Input Cost: ${data.metrics.costBreakdown.inputCost}`);
      console.log(`  Output Cost: ${data.metrics.costBreakdown.outputCost}`);
      console.log('\n📈 Projections:');
      console.log(`  Cost per 1,000 requests: ${data.metrics.projections.costPer1000Requests}`);
      console.log(`  Estimated monthly cost: ${data.metrics.projections.costPerMonth}`);
      console.log('━'.repeat(50));
    } else {
      console.error('❌ AI Costs Error:', data.error);
    }
  } catch (error) {
    console.error('❌ AI Costs API Error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Smart AI Router Integration Tests');
  console.log('═'.repeat(50));
  
  // Run tests sequentially
  await testFlowBot();
  await testContentGeneration();
  await testAICosts();
  
  console.log('\n✅ All tests complete!');
}

// Run tests
runTests().catch(console.error);
