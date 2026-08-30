import admin from "firebase-admin";
import 'dotenv/config';

// Test Firebase configuration with explicit project ID
async function testFirebaseConfig() {
  try {
    console.log('Testing Firebase configuration...');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

    // Initialize Firebase with explicit project ID from service account
    admin.initializeApp({
      projectId: 'affiliateflow-abzfy'
    });

    const db = admin.firestore();
    console.log('✅ Firestore connected successfully.');

    // Try to list collections to verify connection
    const collections = await db.listCollections();
    console.log('Available collections:', collections.map(col => col.id));

    // Try to write a test document
    const testDoc = await db.collection('test').doc('test-doc').set({
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Test document written successfully');

    // Clean up test document
    await db.collection('test').doc('test-doc').delete();
    console.log('✅ Test document cleaned up');

    console.log('🎉 Firebase configuration test passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase configuration test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testFirebaseConfig();
