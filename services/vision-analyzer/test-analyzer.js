/**
 * Test script for Vision Analyzer Service
 * Tests all endpoints with sample product images
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8083';

// Sample product images (replace with your own)
const SAMPLE_IMAGES = {
  dress: 'https://n.nordstrommedia.com/id/sr3/d5e5d5e5-5e5e-5e5e-5e5e-5e5e5e5e5e5e.jpeg',
  shoes: 'https://n.nordstrommedia.com/id/sr3/a1b2c3d4-1234-5678-9012-a1b2c3d4e5f6.jpeg',
  // Add more sample URLs
};

async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testImageAnalysis(imageUrl) {
  console.log('\n🔍 Testing Image Analysis...');
  try {
    const response = await axios.post(`${BASE_URL}/analyze`, {
      imageUrl,
      saveToFirestore: false
    });
    
    console.log('✅ Analysis Complete:');
    console.log('  Labels:', response.data.analysis.labels.slice(0, 3));
    console.log('  Colors:', response.data.analysis.colors.slice(0, 3));
    console.log('  Brand Safe:', response.data.analysis.safeSearch.isSafe);
    console.log('  Text Detected:', response.data.analysis.text.fullText.substring(0, 100));
    
    return true;
  } catch (error) {
    console.error('❌ Analysis Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testBrandSafety(imageUrl) {
  console.log('\n🛡️ Testing Brand Safety...');
  try {
    const response = await axios.post(`${BASE_URL}/safety`, {
      imageUrl,
      text: 'Check out this amazing product! 🔥'
    });
    
    console.log('✅ Safety Check Complete:');
    console.log('  Is Safe:', response.data.safety.isSafe);
    console.log('  Recommendation:', response.data.safety.recommendation);
    console.log('  Adult:', response.data.safety.image.adult);
    console.log('  Violence:', response.data.safety.image.violence);
    
    return true;
  } catch (error) {
    console.error('❌ Safety Check Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testOCR(imageUrl) {
  console.log('\n📝 Testing OCR...');
  try {
    const response = await axios.post(`${BASE_URL}/ocr`, {
      imageUrl
    });
    
    console.log('✅ OCR Complete:');
    console.log('  Full Text:', response.data.extraction.fullText.substring(0, 200));
    console.log('  Prices Found:', response.data.extraction.structured.prices);
    console.log('  Discounts:', response.data.extraction.structured.discounts);
    console.log('  Sizes:', response.data.extraction.structured.sizes);
    
    return true;
  } catch (error) {
    console.error('❌ OCR Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Vision Analyzer Tests...\n');
  console.log('📋 Test Configuration:');
  console.log('  Base URL:', BASE_URL);
  console.log('  Sample Image:', SAMPLE_IMAGES.dress);
  
  const results = {
    health: false,
    analysis: false,
    safety: false,
    ocr: false
  };
  
  // Test health check first
  results.health = await testHealthCheck();
  
  if (!results.health) {
    console.log('\n❌ Vision Analyzer service is not running!');
    console.log('💡 Start it with: cd services/vision-analyzer && npm start');
    return;
  }
  
  // Run other tests
  results.analysis = await testImageAnalysis(SAMPLE_IMAGES.dress);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  results.safety = await testBrandSafety(SAMPLE_IMAGES.dress);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.ocr = await testOCR(SAMPLE_IMAGES.dress);
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('  Health Check:', results.health ? '✅' : '❌');
  console.log('  Image Analysis:', results.analysis ? '✅' : '❌');
  console.log('  Brand Safety:', results.safety ? '✅' : '❌');
  console.log('  OCR:', results.ocr ? '✅' : '❌');
  
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n✨ All tests passed! Vision Analyzer is ready to use.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
