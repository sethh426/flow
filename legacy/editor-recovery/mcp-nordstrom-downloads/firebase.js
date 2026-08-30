import admin from "firebase-admin";
import 'dotenv/config'; // Make sure env variables are loaded

let db;

export function getDb() {
  if (!db) {
    // The SDK will automatically find and use the service account key
    // from the GOOGLE_APPLICATION_CREDENTIALS environment variable.
    admin.initializeApp();
    db = admin.firestore();
    console.log('✅ Firestore connected successfully.');
  }
  return db;
}
