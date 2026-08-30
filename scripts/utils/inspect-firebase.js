import { getDb } from './firebase.js';

async function inspectFirebase() {
  const db = getDb();
  
  try {
    console.log('\n=== INSPECTING FIREBASE DATABASE ===\n');
    
    // List all collections
    const collections = await db.listCollections();
    console.log('📁 Collections found:');
    collections.forEach(collection => {
      console.log(`  - ${collection.id}`);
    });
    
    // Check each collection for data
    for (const collection of collections) {
      console.log(`\n📊 Collection: ${collection.id}`);
      const snapshot = await collection.limit(5).get();
      console.log(`   Documents: ${snapshot.size}`);
      
      if (!snapshot.empty) {
        console.log('   Sample data:');
        snapshot.forEach((doc, index) => {
          console.log(`\n   [${index + 1}] Document ID: ${doc.id}`);
          const data = doc.data();
          console.log('   ' + JSON.stringify(data, null, 2).split('\n').join('\n   '));
        });
      }
    }
    
    // Check for specific collections that might exist
    const checkCollections = ['products', 'stats', 'users', 'trends', 'categories', 'flows', 'affiliates'];
    console.log('\n\n=== CHECKING SPECIFIC COLLECTIONS ===\n');
    
    for (const collectionName of checkCollections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        if (!snapshot.empty) {
          console.log(`✅ ${collectionName}: ${snapshot.size} documents found`);
        }
      } catch (error) {
        // Collection doesn't exist or error accessing it
      }
    }
    
  } catch (error) {
    console.error('Error inspecting Firebase:', error);
  }
}

inspectFirebase();
