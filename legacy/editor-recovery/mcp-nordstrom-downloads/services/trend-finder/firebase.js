import admin from "firebase-admin";
import 'dotenv/config';

let db;

export function getDb() {
  if (!db) {
    admin.initializeApp();
    db = admin.firestore();
    console.log('✅ Firestore connected successfully.');
  }
  return db;
}
