/**
 * Test script for all intelligence API endpoints
 */

const testUserId = 'test-user-123';
const baseUrl = 'http://localhost:3000';

async function testAPI(endpoint, data) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log(`\n✅ ${endpoint}:`);
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`\n❌ ${endpoint} failed:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Intelligence API Endpoints...\n');

  // Test 1: Content Prediction
  console.log('\n=== TEST 1: Content Prediction ===');
  await testAPI('/api/intelligence/predict-content', {
    userId: testUserId,
    content: {
      contentType: 'post',
      platform: 'instagram',
      content: 'Check out this amazing sustainable fashion brand! 🌱👗 #EcoFriendly',
      hashtags: ['#SustainableFashion', '#EcoFriendly', '#GreenLiving'],
      scheduledTime: new Date('2025-10-30T19:00:00')
    }
  });

  // Test 2: Revenue Forecast
  console.log('\n=== TEST 2: Revenue Forecast ===');
  await testAPI('/api/intelligence/forecast-revenue', {
    userId: testUserId,
    action: 'forecast',
    period: 'month'
  });

  // Test 3: Optimize Budget
  console.log('\n=== TEST 3: Budget Optimization ===');
  await testAPI('/api/intelligence/forecast-revenue', {
    userId: testUserId,
    action: 'optimizeBudget'
  });

  // Test 4: Detect Trends
  console.log('\n=== TEST 4: Trend Detection ===');
  await testAPI('/api/intelligence/detect-trends', {
    userId: testUserId,
    action: 'detectEmerging',
    niche: 'sustainable fashion',
    limit: 5
  });

  // Test 5: Find Opportunities
  console.log('\n=== TEST 5: Trend Opportunities ===');
  await testAPI('/api/intelligence/detect-trends', {
    userId: testUserId,
    action: 'findOpportunities'
  });

  // Test 6: AI Router Stats
  console.log('\n=== TEST 6: AI Router Stats ===');
  await testAPI('/api/intelligence/ai-router', {
    userId: testUserId,
    action: 'getStats'
  });

  // Test 7: Track Budget
  console.log('\n=== TEST 7: AI Budget Tracking ===');
  await testAPI('/api/intelligence/ai-router', {
    userId: testUserId,
    action: 'trackBudget',
    monthlyBudget: 100
  });

  // Test 8: Analyze Efficiency
  console.log('\n=== TEST 8: Routing Efficiency ===');
  await testAPI('/api/intelligence/ai-router', {
    userId: testUserId,
    action: 'analyzeEfficiency'
  });

  console.log('\n\n✨ All tests complete!\n');
}

runTests().catch(console.error);
