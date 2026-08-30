# Flow Waitlist Email Setup Guide

## 🎯 Goal
Capture emails from the waitlist form and automatically send welcome emails to new signups.

---

## ✅ Recommended: ConvertKit (Free up to 1,000 subscribers)

### Setup Steps:

1. **Create ConvertKit Account**
   - Go to https://convertkit.com
   - Sign up for free (no credit card required for first 1,000 subscribers)

2. **Create a Form**
   - Dashboard → Forms → Create Form
   - Choose "Inline" form
   - Name it: "Flow Early Adopters Waitlist"
   - Copy the Form ID from the URL (e.g., `1234567`)

3. **Get Your API Key**
   - Settings → Advanced → API Secret
   - Copy your API Key

4. **Update `index.html`**
   Replace lines 283-297 with:
   ```javascript
   // ConvertKit Integration
   fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
           api_key: 'YOUR_API_KEY',
           email: email,
           first_name: name,
           fields: { role: role }
       })
   }).then(response => response.json())
     .then(data => console.log('ConvertKit success:', data))
     .catch(err => console.error('ConvertKit error:', err));
   ```

5. **Create Welcome Email Sequence**
   - Dashboard → Sequences → Create Sequence
   - Name: "Flow Welcome Series"
   - Email 1 (Immediate):
     ```
     Subject: 🎉 You're on the Flow waitlist!
     
     Hey {{first_name}}!
     
     Welcome to the first 500 creators shaping the future of Flow! 🚀
     
     Here's what happens next:
     
     ✅ You're officially locked in for founding member perks (lifetime 50% off)
     ✅ Beta access in March 2026 (1-2 weeks before public launch)
     ✅ Free 1-on-1 onboarding call with our team
     
     Want to move up the list faster?
     Share Flow with friends: https://flowearlyadopters.web.app
     (Every 3 referrals = 10 spots higher in line)
     
     Questions? Just reply to this email.
     
     Let's build something amazing together,
     Seth Pina
     Founder, Flow
     ```

6. **Set Up Automation**
   - Forms → Your Form → Settings
   - Add to Sequence: "Flow Welcome Series"
   - Tag subscribers: "early-adopter"

---

## Alternative: HubSpot (Free up to 2,000 contacts)

### Setup Steps:

1. **Create HubSpot Account**
   - Go to https://hubspot.com
   - Sign up for free CRM + Marketing Hub

2. **Create a Form**
   - Marketing → Lead Capture → Forms
   - Create form with fields: Name, Email, Role
   - Copy Portal ID and Form GUID from form embed code

3. **Update `index.html`**
   Replace lines 283-297 with:
   ```javascript
   // HubSpot Integration
   fetch('https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/YOUR_FORM_GUID', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
           fields: [
               { name: 'email', value: email },
               { name: 'firstname', value: name },
               { name: 'role', value: role }
           ],
           context: {
               pageUri: 'https://flowearlyadopters.web.app',
               pageName: 'Flow Early Adopters Waitlist'
           }
       })
   }).then(response => response.json())
     .then(data => console.log('HubSpot success:', data))
     .catch(err => console.error('HubSpot error:', err));
   ```

4. **Create Welcome Email**
   - Marketing → Email → Create Email
   - Use same email template as ConvertKit above

5. **Set Up Workflow**
   - Automation → Workflows → Create Workflow
   - Trigger: Form submission (your form)
   - Action: Send email (your welcome email)
   - Tag contact: "early-adopter"

---

## Quick Win: Zapier Integration (No Coding)

If you want to get started in 5 minutes without touching code:

1. **Sign up for Zapier** (free tier works)
2. **Create Zap:**
   - Trigger: Webhook (Catch Hook) - you'll get a webhook URL
   - Action: Gmail (Send Email) or your email service
3. **Update `index.html`** line 286:
   ```javascript
   fetch('YOUR_ZAPIER_WEBHOOK_URL', {
       method: 'POST',
       body: JSON.stringify({ name, email, role })
   });
   ```

---

## 📊 Bonus: Google Sheets Backup

Add this line after the email service fetch to save all signups to Google Sheets:

```javascript
// Google Sheets backup (via Zapier or Apps Script)
fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
    method: 'POST',
    body: JSON.stringify({ name, email, role, timestamp: new Date().toISOString() })
});
```

---

## 🔐 Security Note

Never commit API keys to GitHub! Use environment variables or Firebase Functions to keep keys secure.

Better approach (requires Firebase Functions):
1. Move email integration to a Firebase Cloud Function
2. Call the function from your form
3. Function securely handles API keys server-side

---

## 📈 Recommended: Add Analytics

Track signup conversions:

```javascript
// Google Analytics 4
gtag('event', 'waitlist_signup', {
    'role': role,
    'timestamp': Date.now()
});

// Facebook Pixel
fbq('track', 'Lead', { content_name: 'Flow Waitlist' });
```

---

## Need Help?

Email seth@intelliseth.com with subject "Flow Waitlist Email Setup"
