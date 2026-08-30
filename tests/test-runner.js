/**
 * JavaScript Test Runner
 * Run with: node test-runner.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const VISION_URL = 'http://localhost:8083';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const results = {
  passed: 0,
  failed: 0,
  skipped: 0
};

async function testEndpoint(name, url, method = 'GET', data = null, required = true) {
  process.stdout.write(`${colors.yellow}Testing: ${name}${colors.reset}\n`);
  
  try {
    const config = {
      method,
      url,
      timeout: 10000
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`  ${colors.green}✅ PASSED${colors.reset}`);
      results.passed++;
      return true;
    } else {
      console.log(`  ${colors.red}❌ FAILED (Status: ${response.status})${colors.reset}`);
      results.failed++;
      return false;
    }
  } catch (error) {
    if (required) {
      console.log(`  ${colors.red}❌ FAILED: ${error.message}${colors.reset}`);
      results.failed++;
    } else {
      console.log(`  ${colors.yellow}⚠️ SKIPPED (Service not running)${colors.reset}`);
      results.skipped++;
    }
    return false;
  }
}

async function runTests() {
  console.log(`${colors.cyan}🚀 AffiliateFlow Test Suite${colors.reset}`);
  console.log(`${colors.cyan}=============================${colors.reset}\n`);
  
  // Phase 1: Health Checks
  console.log(`${colors.cyan}Phase 1: Service Health Checks${colors.reset}`);
  await testEndpoint('Next.js Server', BASE_URL, 'GET', null, true);
  await testEndpoint('Vision Analyzer', `${VISION_URL}/health`, 'GET', null, false);
  console.log('');
  
  // Phase 2: API Tests
  console.log(`${colors.cyan}Phase 2: API Endpoint Tests${colors.reset}`);
  
  await testEndpoint('FlowBot API', `${BASE_URL}/api/flowbot`, 'POST', {
    message: 'Hello! What can you help me with?',
    history: []
  });
  
  await testEndpoint('Content Generation', `${BASE_URL}/api/content/generate`, 'POST', {
    type: 'caption',
    platform: 'instagram',
    topic: 'summer fashion',
    tone: 'trendy'
  });
  
  await testEndpoint('Product Search', `${BASE_URL}/api/products/search`, 'POST', {
    query: 'dress',
    limit: 5
  });
  
  await testEndpoint('Campaign List', `${BASE_URL}/api/campaigns?userId=test-user-123`);
  
  await testEndpoint('Workflow List', `${BASE_URL}/api/workflows?userId=test-user-123`);
  
  console.log('');
  
  // Phase 3: Vision API Tests
  console.log(`${colors.cyan}Phase 3: Vision API Tests${colors.reset}`);
  
  const testImageUrl = 'https://via.placeholder.com/400x600/4A90E2/ffffff?text=Test+Product';
  
  await testEndpoint('Vision Analysis', `${BASE_URL}/api/vision/analyze`, 'POST', {
    imageUrl: testImageUrl
  }, false);
  
  await testEndpoint('Brand Safety', `${BASE_URL}/api/vision/safety`, 'POST', {
    imageUrl: testImageUrl,
    text: 'Check out this amazing product!'
  }, false);
  
  console.log('');
  
  // Results
  console.log(`${colors.cyan}Test Summary${colors.reset}`);
  console.log(`${colors.cyan}============${colors.reset}`);
  console.log(`${colors.green}✅ Passed:  ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed:  ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️ Skipped: ${results.skipped}${colors.reset}\n`);
  
  const total = results.passed + results.failed;
  if (total > 0) {
    const passRate = ((results.passed / total) * 100).toFixed(2);
    const color = passRate >= 80 ? colors.green : passRate >= 60 ? colors.yellow : colors.red;
    console.log(`${color}Pass Rate: ${passRate}%${colors.reset}\n`);
  }
  
  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All required tests passed!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ Some tests failed. Review errors above.${colors.reset}`);
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Test suite failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
