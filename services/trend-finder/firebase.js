import admin from 'firebase-admin';

const appName = 'trend-finder';
let firebaseApp;
let db;

function getFirebaseApp() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    firebaseApp = admin.app(appName);
  } catch {
    const projectId =
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.PROJECT_ID;

    firebaseApp = admin.initializeApp(projectId ? { projectId } : {}, appName);
  }

  return firebaseApp;
}

export function getDb() {
  if (!db) {
    db = admin.firestore(getFirebaseApp());
  }

  return db;
}

export function verifyIdToken(token) {
  return admin.auth(getFirebaseApp()).verifyIdToken(token);
}
