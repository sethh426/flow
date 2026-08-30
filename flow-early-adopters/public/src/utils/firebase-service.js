export class FirebaseService {
    static async initialize() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK not loaded, using mock service');
                return this.initializeMockService();
            }

            if (!firebase.apps.length) {
                const config = await this.getConfig();
                firebase.initializeApp(config);
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    firebase.analytics();
                }
            }
            return firebase.app();
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            return this.initializeMockService();
        }
    }

    static async getConfig() {
        const config = window.FLOW_PUBLIC_CONFIG?.firebase;
        if (!config?.apiKey || !config?.appId) {
            throw new Error('Firebase public configuration is missing');
        }
        return config;
    }

    static async addToWaitlist(userData) {
        try {
            const db = firebase.firestore();
            const docRef = await db.collection('waitlist_signups').add({
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                referrer: document.referrer || 'direct'
            });

            // Increment counter
            await db.collection('meta').doc('waitlist').set({
                count: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            return docRef.id;
        } catch (error) {
            console.error('Waitlist signup failed:', error);
            throw new Error(`Waitlist signup failed: ${error.message}`);
        }
    }

    static initializeMockService() {
        console.warn('Using mock Firebase service for development');
        let mockCount = 0;
        return {
            firestore: () => ({
                collection: () => ({
                    add: async (data) => {
                        mockCount++;
                        console.log('Mock signup:', data);
                        return { id: `mock-${Date.now()}-${mockCount}` };
                    }
                })
            })
        };
    }
}
