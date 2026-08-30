/**
 * Test Script for Intelligence API Endpoints
 * Run with: node test-intelligence-api.js
 */

const API_BASE = 'http://localhost:3000/api/intelligence';
const TEST_USER_ID = 'test-user-123';

async function testAPI(endpoint, method = 'POST', body = null) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`\n🧪 Testing ${method} ${url}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', JSON.stringify(data, null, 2).substring(0, 300) + '...');
      return data;
    } else {
      console.log('❌ Error:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Intelligence API Tests\n');
  console.log('=' .repeat(60));

  // Test 1: Content Prediction
  console.log('\n📊 Test 1: Content Prediction');
  await testAPI('/predict-content', 'POST', {
    userId: TEST_USER_ID,
    content: {
      contentType: 'post',
      platform: 'instagram',
      content: '🔥 Check out this amazing sustainable fashion collection! #EcoStyle #Fashion',
      hashtags: ['#EcoStyle', '#Fashion'],
      scheduledTime: new Date().toISOString()
    }
  });

  // Test 2: Revenue Forecast
  console.log('\n💰 Test 2: Revenue Forecast');
  await testAPI('/forecast-revenue', 'POST', {
    userId: TEST_USER_ID,
    action: 'forecast',
    period: 'month'
  });

  // Test 3: Budget Optimization
  console.log('\n📈 Test 3: Budget Optimization');
  await testAPI('/forecast-revenue', 'POST', {
    userId: TEST_USER_ID,
    action: 'optimizeBudget'
  });

  // Test 4: Detect Trends
  console.log('\n🔍 Test 4: Detect Emerging Trends');
  await testAPI('/detect-trends', 'POST', {
    userId: TEST_USER_ID,
    action: 'detectEmerging',
    niche: 'sustainable fashion',
    limit: 5
  });

  // Test 5: Find Trend Opportunities
  console.log('\n🎯 Test 5: Find Trend Opportunities');
  await testAPI('/detect-trends', 'POST', {
    userId: TEST_USER_ID,
    action: 'findOpportunities'
  });

  // Test 6: AI Router Stats
  console.log('\n🤖 Test 6: AI Router Stats');
  await testAPI('/ai-router', 'POST', {
    userId: TEST_USER_ID,
    action: 'getStats'
  });

  // Test 7: AI Router - Route Task
  console.log('\n🎯 Test 7: AI Router - Route Task');
  await testAPI('/ai-router', 'POST', {
    userId: TEST_USER_ID,
    action: 'route',
    task: {
      type: 'generateCaption',
      complexity: 'simple',
      context: 'social media post',
      maxTokens: 100
    }
  });

  // Test 8: Quick Trend Detection (GET)
  console.log('\n⚡ Test 8: Quick Trend Detection (GET)');
  await testAPI(`/detect-trends?userId=${TEST_USER_ID}`, 'GET');

  // Test 9: Quick AI Stats (GET)
  console.log('\n⚡ Test 9: Quick AI Stats (GET)');
  await testAPI(`/ai-router?userId=${TEST_USER_ID}`, 'GET');

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
  console.log('Next step: Visit http://localhost:3000/intelligence-test');
  console.log('to see the UI components in action.\n');
}

// Run tests
runTests().catch(console.error);
