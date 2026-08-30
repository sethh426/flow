// firestoreSaveProduct.js
// Utility to save product + story to Firestore for AffiliateFlow automation

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin if not already initialized
if (!global._firebaseApp) {
  global._firebaseApp = initializeApp({
    credential: cert(serviceAccount)
  });
}
const db = getFirestore();

/**
 * Save a product (with story) to Firestore for a user
 * @param {string} userId
 * @param {object} product - { name, price, image, url, itemNumber, story }
 * @returns {Promise<string>} - Firestore document ID
 */
async function saveProductToFirestore(userId, product) {
  const docRef = await db.collection('users').doc(userId).collection('products').add(product);
  return docRef.id;
}

module.exports = { saveProductToFirestore };
