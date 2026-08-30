import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize source (affiliateflow-abzfy)
const sourceCredentials = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
const sourceApp = admin.initializeApp({
  credential: admin.credential.cert(sourceCredentials)
}, 'source');
const sourceDb = sourceApp.firestore();

// Initialize destination (flow-69826693-f6d27)
const destCredentials = JSON.parse(readFileSync('./serviceAccountKey-studio.json', 'utf8'));
const destApp = admin.initializeApp({
  credential: admin.credential.cert(destCredentials),
  projectId: 'flow-69826693-f6d27'
}, 'destination');
const destDb = destApp.firestore();
destDb.settings({ databaseId: 'flow' });

async function migrateCollection(collectionName) {
  console.log(`\nMigrating ${collectionName}...`);
  
  const snapshot = await sourceDb.collection(collectionName).get();
  console.log(`Found ${snapshot.size} documents in ${collectionName}`);
  
  const batch = destDb.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const docRef = destDb.collection(collectionName).doc(doc.id);
    batch.set(docRef, doc.data());
    count++;
  });
  
  await batch.commit();
  console.log(`✅ Migrated ${count} documents to ${collectionName}`);
}

async function migrate() {
  try {
    console.log('Starting data migration...');
    console.log('Source: affiliateflow-abzfy');
    console.log('Destination: flow-69826693-f6d27');
    
    await migrateCollection('products');
    await migrateCollection('stats');
    await migrateCollection('test');
    
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
