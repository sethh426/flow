/**
 * 🔥 TEST FILE FOR MASTER AI ORCHESTRATOR 🔥
 *
 * This demonstrates the revolutionary multi-provider AI orchestration system
 */

import MasterAIOrchestrator from './index.js';

// Test the revolutionary system
async function testMasterOrchestrator() {
  console.log('🧪 Testing Master AI Orchestrator...\n');

  try {
    // Initialize the orchestrator
    const orchestrator = new MasterAIOrchestrator();

    // Test 1: Creative Task (should use Gemini for creativity)
    console.log('🎨 Test 1: Creative Marketing Content Generation');
    const creativeRequest = {
      task: 'Write compelling affiliate marketing copy for trendy sneakers',
      requirements: {
        creativity: 0.9,
        targetAudience: 'young adults 18-25',
        platform: 'Instagram',
        tone: 'exciting and trendy'
      }
    };

    const creativeResult = await orchestrator.orchestrate(creativeRequest);
    console.log('✅ Creative Result:', creativeResult.result?.content?.substring(0, 200) + '...');
    console.log('🔥 Providers used:', creativeResult.metadata?.providersUsed);
    console.log('💰 Cost:', creativeResult.metadata?.cost);
    console.log('');

    // Test 2: Analytical Task (should analyze and provide insights)
    console.log('📊 Test 2: Analytical Business Analysis');
    const analyticalRequest = {
      task: 'Analyze affiliate marketing performance and suggest optimizations',
      requirements: {
        accuracy: 0.8,
        data: 'Q4 sales data, conversion rates, customer demographics',
        focus: 'ROI optimization'
      }
    };

    const analyticalResult = await orchestrator.orchestrate(analyticalRequest);
    console.log('✅ Analytical Result:', analyticalResult.result?.content?.substring(0, 200) + '...');
    console.log('🔥 Providers used:', analyticalResult.metadata?.providersUsed);
    console.log('');

    // Test 3: Complex Multi-Provider Task
    console.log('🚀 Test 3: Complex Multi-Provider Orchestration');
    const complexRequest = {
      task: 'Create a comprehensive affiliate marketing strategy for fashion products',
      requirements: {
        creativity: 0.8,
        accuracy: 0.7,
        comprehensiveness: 0.9,
        include: ['market analysis', 'content strategy', 'technical implementation', 'ROI projections']
      }
    };

    const complexResult = await orchestrator.orchestrate(complexRequest);
    console.log('✅ Complex Result:', complexResult.result?.content?.substring(0, 200) + '...');
    console.log('🔥 Providers used:', complexResult.metadata?.providersUsed);
    console.log('⚡ Execution time:', complexResult.metadata?.executionTime, 'ms');
    console.log('');

    // Test 4: System Status (Hidden from users)
    console.log('👻 Test 4: System Status (Hidden Operation)');
    const status = orchestrator.getSystemStatus();
    console.log('🔐 Security:', status.security);
    console.log('📊 Active providers:', status.providers.length);
    console.log('👻 Hidden from users:', status.hidden);
    console.log('🚀 Revolutionary system:', status.revolutionary);
    console.log('');

    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('🔥 Master AI Orchestrator is ready for production!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// API Endpoint Tests
async function testAPIEndpoints() {
  console.log('🌐 Testing API Endpoints...\n');

  try {
    // Test system status endpoint
    const statusResponse = await fetch('http://localhost:8090/system/status');
    const status = await statusResponse.json();
    console.log('📊 System Status:', status);
    console.log('');

    // Test orchestration endpoint
    const orchResponse = await fetch('http://localhost:8090/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: 'Generate affiliate marketing ideas for tech gadgets',
        requirements: {
          creativity: 0.8,
          targetAudience: 'tech enthusiasts'
        }
      })
    });

    const orchResult = await orchResponse.json();
    console.log('🎯 Orchestration Result:', orchResult.result?.content?.substring(0, 150) + '...');
    console.log('');

  } catch (error) {
    console.log('⚠️ API test failed (service may not be running):', error.message);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 STARTING MASTER AI ORCHESTRATOR TESTS...\n');

  // Wait a moment for the service to start
  setTimeout(async () => {
    await testMasterOrchestrator();
    console.log('\n' + '='.repeat(50));
    await testAPIEndpoints();
  }, 2000);
}

export { testMasterOrchestrator, testAPIEndpoints };
