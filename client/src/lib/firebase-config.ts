/**
 * Firebase Client Configuration
 * Initialize Firebase Auth and Firestore for the client app.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { z } from 'zod';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const configurationSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().regex(/^[a-zA-Z0-9.-]+$/),
  projectId: z.string().min(1),
  appId: z.string().min(1),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
});
let isFirebaseConfigured = false;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function configure(input: unknown): boolean {
  const parsed = configurationSchema.safeParse(input);
  if (!parsed.success) return false;
  try {
    app = getApps().length === 0 ? initializeApp(parsed.data) : getApp();
    if (app.options.projectId !== parsed.data.projectId) return false;
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    return true;
  } catch {
    app = null;
    auth = null;
    db = null;
    return false;
  }
}
configure(firebaseConfig);

let initialization: Promise<boolean> | null = null;
/** Load only public configuration from the current Hosting origin, never a remote secret store. */
export function ensureFirebase(): Promise<boolean> {
  if (isFirebaseConfigured) return Promise.resolve(true);
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (initialization) return initialization;
  initialization = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch('/__/firebase/init.json', {
        signal: controller.signal,
        credentials: 'same-origin',
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
      return configure(await response.json());
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  })();
  return initialization.then((ready) => {
    if (!ready) initialization = null;
    return ready;
  });
}

export { auth, db, isFirebaseConfigured };

export { app as default };
