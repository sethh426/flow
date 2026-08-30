export class WaitlistService {
    static async submitSignup(formData) {
        try {
            // Check if Firebase is available
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                return await this.submitToFirebase(formData);
            } else {
                console.warn('Firebase not available, using mock submission');
                return await this.mockSubmit(formData);
            }
        } catch (error) {
            console.error('Waitlist submission error:', error);
            throw error;
        }
    }

    static async submitToFirebase(formData) {
        const db = firebase.firestore();
        
        // Check for duplicate email
        const existingSignup = await db.collection('waitlist_signups')
            .where('email', '==', formData.email.toLowerCase())
            .limit(1)
            .get();

        if (!existingSignup.empty) {
            throw new Error('This email is already on the waitlist');
        }

        // Add new signup
        const signupData = {
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            url: formData.url?.trim() || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            referrer: document.referrer || 'direct',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
        };

        const docRef = await db.collection('waitlist_signups').add(signupData);

        // Increment counter and get position
        const counterDoc = await db.collection('meta').doc('waitlist').get();
        const currentCount = counterDoc.exists ? (counterDoc.data().count || 0) : 0;
        const position = currentCount + 1;

        await db.collection('meta').doc('waitlist').set({
            count: firebase.firestore.FieldValue.increment(1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'waitlist_signup', {
                event_category: 'engagement',
                event_label: formData.name,
                value: position
            });
        }

        return {
            success: true,
            docId: docRef.id,
            position: position,
            message: 'Successfully joined the waitlist!'
        };
    }

    static async mockSubmit(formData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock validation
        const mockEmails = ['test@test.com', 'duplicate@example.com'];
        if (mockEmails.includes(formData.email.toLowerCase())) {
            throw new Error('This email is already on the waitlist');
        }

        console.log('Mock waitlist signup:', formData);

        return {
            success: true,
            docId: `mock-${Date.now()}`,
            position: Math.floor(Math.random() * 100) + 300,
            message: 'Mock signup successful'
        };
    }

    static async getWaitlistCount() {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                const db = firebase.firestore();
                const counterDoc = await db.collection('meta').doc('waitlist').get();
                return counterDoc.exists ? (counterDoc.data().count || 0) : 0;
            }
            // Mock count
            return 347;
        } catch (error) {
            console.error('Failed to get waitlist count:', error);
            return 347; // Fallback
        }
    }
}
