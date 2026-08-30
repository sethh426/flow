import { getDb } from './firebase.js';

async function testFirebaseConnection() {
  try {
    const db = getDb();
    console.log('✅ Connected to Firebase project:', process.env.FIREBASE_PROJECT_ID);
    
    // Try to read a collection
    const snapshot = await db.collection('products').limit(1).get();
    console.log('✅ Successfully queried Firestore');
    console.log('Documents in products collection:', snapshot.size);
    
    // List all collections
    const collections = await db.listCollections();
    console.log('\nAvailable collections:');
    for (const collection of collections) {
      console.log(`- ${collection.id}`);
    }
  } catch (error) {
    console.error('❌ Error connecting to Firebase:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testFirebaseConnection();