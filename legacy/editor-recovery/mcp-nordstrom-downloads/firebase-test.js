import { getDb } from './firebase.js';

async function testFirebase() {
  try {
    const db = await getDb();
    // Add a test document to a 'test' collection
    const docRef = await db.collection('test').add({
      message: 'Hello from Firebase!',
      timestamp: new Date().toISOString()
    });
    console.log('Test document written with ID:', docRef.id);
    // Read back the document
    const doc = await docRef.get();
    console.log('Document data:', doc.data());
  } catch (error) {
    console.error('Firebase test failed:', error);
  }
}

testFirebase();
