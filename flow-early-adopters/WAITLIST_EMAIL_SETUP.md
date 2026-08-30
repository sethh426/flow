# Waitlist Email Notifications Setup

## Overview
Your waitlist form now collects:
- Name
- Email
- How would you use Flow? (use case)

Email notifications are sent to **Info@IntelliSeth.com** for every signup.

## Current Implementation

### Form Fields
1. **Name** - Required text field
2. **Email** - Required email field with validation
3. **How would you use Flow?** - Required multiline text field (3 rows)
   - Placeholder: "Tell us about your goals and how Flow could help..."
   - Helper text: "e.g., Growing my Instagram following, Selling digital products, etc."

### Email Notification
Using FormSubmit.co (no backend required):
- Sends to: Info@IntelliSeth.com
- Subject: "New Flow Waitlist Signup: [Name]"
- Format: Table layout
- Contains: Name, Email, Use Case

### Live Counter
- Real-time Firestore listener updates the counter automatically
- Shows: X / 500 spots filled
- Progress bar with gradient animation
- Updates instantly when new signups occur

## Data Stored in Firebase

Each signup creates a document in `waitlist_signups` collection:
```javascript
{
  name: "User Name",
  email: "user@example.com",
  useCase: "Their response about how they'd use Flow",
  createdAt: [Firebase Timestamp],
  userAgent: "Browser info",
  screenResolution: "1920x1080",
  referrer: "direct or referring URL",
  timezone: "America/New_York",
  language: "en-US"
}
```

The counter is stored in `meta/waitlist` document:
```javascript
{
  count: 123,
  updatedAt: [Firebase Timestamp]
}
```

## Alternative Email Solutions

### Option 1: FormSubmit.co (Currently Implemented)
✅ **Pros:**
- No backend needed
- Free
- Works immediately
- Table format emails

❌ **Cons:**
- First time requires email verification
- External dependency

### Option 2: Firebase Cloud Functions (Recommended for Production)

Install Firebase Functions:
```powershell
cd flow-early-adopters
firebase init functions
```

Create `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Configure email transport (use Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use App Password, not regular password
  }
});

exports.sendWaitlistEmail = functions.firestore
  .document('waitlist_signups/{signupId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    const mailOptions = {
      from: 'Flow Waitlist <noreply@flowearlyadopters.web.app>',
      to: 'Info@IntelliSeth.com',
      subject: `New Flow Waitlist Signup: ${data.name}`,
      html: `
        <h2>New Waitlist Signup</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Use Case</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.useCase}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Signed Up</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.createdAt.toDate().toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Timezone</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${data.timezone}</td>
          </tr>
        </table>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });
```

Deploy:
```powershell
firebase deploy --only functions
```

### Option 3: SendGrid (Enterprise Solution)

1. Sign up at sendgrid.com
2. Get API key
3. Use Firebase Cloud Function with SendGrid SDK

## Firestore Security Rules

Create/update `firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read the waitlist counter
    match /meta/waitlist {
      allow read: if true;
      allow write: if false; // Only server-side
    }
    
    // Allow creating signups, but not reading/updating/deleting
    match /waitlist_signups/{signupId} {
      allow create: if request.resource.data.keys().hasAll(['name', 'email', 'useCase', 'createdAt'])
                    && request.resource.data.email is string
                    && request.resource.data.email.matches('.*@.*[.].*')
                    && request.resource.data.name.size() > 0
                    && request.resource.data.useCase.size() > 0;
      allow read, update, delete: if false; // Only admin access
    }
  }
}
```

Deploy rules:
```powershell
firebase deploy --only firestore:rules
```

## Testing

1. **Test the form**: Visit https://flowearlyadopters.web.app
2. **Fill out all fields** including the new "How would you use Flow?" field
3. **Submit the form**
4. **Check your email** at Info@IntelliSeth.com
5. **Verify Firebase**: Check Firestore console for the new document
6. **Watch the counter**: It should increment in real-time

## Viewing Responses

### In Firebase Console:
1. Go to https://console.firebase.google.com
2. Select project: flowearlyadopters
3. Navigate to Firestore Database
4. View `waitlist_signups` collection
5. Each document shows all signup data including use cases

### Export to CSV:
Use Firebase CLI or console to export data for analysis.

## FormSubmit.co First-Time Setup

**Important**: The first email sent to Info@IntelliSeth.com via FormSubmit.co requires verification:

1. User submits form
2. FormSubmit sends verification email to Info@IntelliSeth.com
3. **You must click the verification link** in that email
4. After verification, all future submissions work automatically

**Note**: This only happens once per email address.

## Troubleshooting

### Counter not updating?
- Check browser console for errors
- Verify Firebase initialization
- Check Firestore rules allow reading `meta/waitlist`

### Email not received?
- Check spam folder
- Verify FormSubmit.co email was verified (first-time only)
- Check browser console for fetch errors
- Consider switching to Cloud Functions for reliability

### Form not submitting?
- Check all required fields are filled
- Open browser DevTools → Console for errors
- Verify Firebase connection

## Next Steps

1. ✅ Form collecting use case data
2. ✅ Email notifications set up
3. ✅ Live counter working with real-time updates
4. 🔄 Consider Cloud Functions for production
5. 🔄 Set up automated email responses to users
6. 🔄 Create admin dashboard to view all signups
