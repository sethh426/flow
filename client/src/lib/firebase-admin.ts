/**
 * Firebase Admin SDK initialization for server-side operations
 */

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Hardened Firebase Admin initialization.
 * - Won't throw during Next.js build if credentials are absent.
 * - Defers file system access until actually needed.
 * - Supports FIREBASE_SERVICE_ACCOUNT (JSON string) or serviceAccountKey*.json fallback.
 */

let app: App | null = null;
let db: Firestore | null = null;
let initAttempted = false;

function tryInit() {
  if (initAttempted) return { app, db };
  initAttempted = true;
  try {
    if (!getApps().length) {
      let credentialSource: any = null;
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          credentialSource = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (e) {
          console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT env var is not valid JSON');
        }
      }
      if (!credentialSource) {
        // Attempt common filenames (non-fatal if missing)
        const candidates = [
          '../../../../serviceAccountKey.json',
          '../../../../serviceAccountKey-affiliateflow-abzfy.json',
          '../../../../serviceAccountKey-studio.json'
        ];
        for (const path of candidates) {
          try {
            credentialSource = require(path);
            console.log(`✅ Loaded service account from ${path}`);
            break;
          } catch (_) { /* swallow */ }
        }
      }
      if (!credentialSource) {
        console.warn('⚠️ Firebase Admin not initialized (no credentials found). API routes using Firestore should guard usage.');
        return { app: null, db: null };
      }
      app = initializeApp({ credential: cert(credentialSource) });
      db = getFirestore(app);
      console.log('✅ Firebase Admin initialized (lazy)');
    } else {
      app = getApps()[0];
      db = getFirestore(app);
    }
  } catch (err) {
    console.error('❌ Firebase Admin init failed (non-fatal):', err);
    app = null;
    db = null;
  }
  return { app, db };
}

export function getDb(): Firestore | null {
  if (!db) tryInit();
  return db;
}

export function getAdminApp(): App | null {
  if (!app) tryInit();
  return app;
}

export function isFirebaseReady(): boolean {
  return !!getDb();
}

export { app, db };
