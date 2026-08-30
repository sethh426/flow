/**
 * 🔍 COMPREHENSIVE FIREBASE CONNECTION TEST
 * Tests ALL Firebase connections in the Affiliate Flow system
 */

let passed = 0;
let failed = 0;

console.log('\n🔥 FIREBASE CONNECTION TEST SUITE\n');
console.log('Testing all Firebase connections in the system...\n');

// Test 1: Root firebase.js
console.log('📍 Test 1: Root firebase.js (server.js backend)');
try {
  const { getDb } = await import('./firebase.js');
  const db = getDb();
  console.log('  ✅ Root Firebase connected');
  passed++;
} catch (err) {
  console.log('  ❌ Root Firebase FAILED:', err.message);
  failed++;
}

// Test 2: Product Mapper
console.log('\n📍 Test 2: Product Mapper Service');
try {
  const { getDb } = await import('./services/product-mapper/firebase.js');
  const db = getDb();
  
  // Try to write a test document
  await db.collection('_connection_test').doc('product-mapper').set({
    service: 'product-mapper',
    tested: new Date().toISOString(),
    status: 'connected'
  });
  
  console.log('  ✅ Product Mapper connected');
  console.log('  ✅ Write test successful');
  
  // Clean up
  await db.collection('_connection_test').doc('product-mapper').delete();
  passed++;
} catch (err) {
  console.log('  ❌ Product Mapper FAILED:', err.message);
  failed++;
}

// Test 3: Trend Finder
console.log('\n📍 Test 3: Trend Finder Service');
try {
  const { getDb } = await import('./services/trend-finder/firebase.js');
  const db = getDb();
  
  // Try to write a test document
  await db.collection('_connection_test').doc('trend-finder').set({
    service: 'trend-finder',
    tested: new Date().toISOString(),
    status: 'connected'
  });
  
  console.log('  ✅ Trend Finder connected');
  console.log('  ✅ Write test successful');
  
  // Clean up
  await db.collection('_connection_test').doc('trend-finder').delete();
  passed++;
} catch (err) {
  console.log('  ❌ Trend Finder FAILED:', err.message);
  failed++;
}

// Test 4: Master AI Orchestrator
console.log('\n📍 Test 4: Master AI Orchestrator');
try {
  const { getDb } = await import('./services/master-ai-orchestrator/firebase.js');
  const db = getDb();
  
  // Try to write a test document
  await db.collection('_connection_test').doc('ai-orchestrator').set({
    service: 'ai-orchestrator',
    tested: new Date().toISOString(),
    status: 'connected'
  });
  
  console.log('  ✅ AI Orchestrator connected');
  console.log('  ✅ Write test successful');
  
  // Clean up
  await db.collection('_connection_test').doc('ai-orchestrator').delete();
  passed++;
} catch (err) {
  console.log('  ❌ AI Orchestrator FAILED:', err.message);
  failed++;
}

// Test 5: Verify actual data exists
console.log('\n📍 Test 5: Verify Firestore Data');
try {
  const { getDb } = await import('./firebase.js');
  const db = getDb();
  
  const productsSnapshot = await db.collection('products').limit(1).get();
  const statsDoc = await db.collection('stats').doc('current').get();
  const categoriesSnapshot = await db.collection('categories').limit(1).get();
  
  console.log('  ✅ Products collection:', productsSnapshot.size > 0 ? 'HAS DATA' : 'EMPTY');
  console.log('  ✅ Stats document:', statsDoc.exists ? 'EXISTS' : 'MISSING');
  console.log('  ✅ Categories collection:', categoriesSnapshot.size > 0 ? 'HAS DATA' : 'EMPTY');
  
  if (statsDoc.exists) {
    const stats = statsDoc.data();
    console.log('    📊 Total Products:', stats.totalProducts);
    console.log('    📊 Mapped:', stats.mappedProducts);
    console.log('    📊 Pending:', stats.pendingProducts);
  }
  
  passed++;
} catch (err) {
  console.log('  ❌ Data verification FAILED:', err.message);
  failed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(50) + '\n');

if (failed === 0) {
  console.log('🎉 ALL FIREBASE CONNECTIONS WORKING!\n');
  process.exit(0);
} else {
  console.log('⚠️  SOME CONNECTIONS FAILED - CHECK LOGS ABOVE\n');
  process.exit(1);
}
