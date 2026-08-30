import admin from "firebase-admin";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export function getDb() {
  if (!db) {
    // Check if Firebase app already exists
    const appName = 'trend-finder';
    let app;
    
    try {
      app = admin.app(appName);
    } catch (err) {
      // App doesn't exist, create it
      const serviceAccountPath = path.join(__dirname, '..', '..', 'serviceAccountKey.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        console.error('❌ serviceAccountKey.json not found at:', serviceAccountPath);
        throw new Error('Firebase service account key not found');
      }

      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

      app = admin.initializeApp({
        projectId: 'flow-69826693-f6d27',
        credential: admin.credential.cert(serviceAccount)
      }, appName);
    }
    
    db = admin.firestore(app);
    console.log('✅ Trend Finder connected to Firestore: flow-69826693-f6d27');
  }
  return db;
}
