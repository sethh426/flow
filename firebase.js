import admin from "firebase-admin";
import fs from 'fs';
import 'dotenv/config'; // Make sure env variables are loaded

let db;

export function getDb() {
  if (!db) {
    // Force correct project ID for Google IDX and clear any cached config
    process.env.GOOGLE_CLOUD_PROJECT = 'flow-69826693-f6d27';
    process.env.FIREBASE_PROJECT_ID = 'flow-69826693-f6d27';

    const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

    admin.initializeApp({
      projectId: 'flow-69826693-f6d27',
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('✅ Firestore connected successfully to flow-69826693-f6d27 (Google IDX)');
  }
  return db;
}
