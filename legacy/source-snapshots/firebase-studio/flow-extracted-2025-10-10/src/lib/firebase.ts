
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// We use 'any' to allow for a null/undefined state when not configured.
let app: FirebaseApp | any;
let db: Firestore | any;


// Check if Firebase is configured
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
    } catch (e) {
        console.error("Caught an error during Firebase initialization:", e);
        // We will not throw an error here to allow the app to build even without firebase keys.
        // Components that use 'db' should handle the case where it might be undefined.
        app = null;
        db = null;
    }
} else {
    console.warn(`
FIREBASE CONFIGURATION WARNING: Your Firebase environment variables are missing.

The application will run in a limited mode without database connectivity.
Some features like saving products, usage logging, and feedback submission will not work.
The app will use pre-defined mock data for display purposes.

To enable full functionality, please follow these steps:
1. Create a Firebase project at https://console.firebase.google.com/
2. Add a Web App and copy the 'firebaseConfig' object.
3. Create a file named '.env' in your project's root directory.
4. Add your Firebase keys to the '.env' file, like this:
   NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
   ...and so on for all keys.
5. After saving the file, you MUST restart your development server.
`);
  app = null;
  db = null;
}


export { app, db };
