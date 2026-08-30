# 🔐 LocalTunnel Access Information

## 🌐 Your Public URL
**https://affiliateflow-demo.loca.lt**

## 🔑 Tunnel Password
**`66.195.220.96`**

This is your public IP address. Enter this when accessing the tunnel for the first time.

---

## 📱 How to Access

### First Visit (Any Device)
1. Go to: https://affiliateflow-demo.loca.lt
2. You'll see a security page
3. Enter password: **`66.195.220.96`**
4. Click "Submit" or press Enter
5. You're in! The page won't ask again for 7 days

### Share With Others
Send them:
- **URL:** https://affiliateflow-demo.loca.lt
- **Password:** `66.195.220.96`

They only need to enter it once per device.

---

## 🔒 Why the Password?

LocalTunnel uses this security page to:
- ✅ Prevent abuse of free tunnels
- ✅ Confirm you trust the link sender
- ✅ Protect against unauthorized access

The password is your public IP - it verifies the connection comes from your network.

---

## 🚀 Bypass for API Requests

For API calls (webhooks, automation), bypass the password page by adding a custom header:

```bash
# Using curl
curl -H "Bypass-Tunnel-Reminder: true" \
  https://affiliateflow-demo.loca.lt/api/ai-costs

# Or use a custom User-Agent
curl -H "User-Agent: MyApp/1.0" \
  https://affiliateflow-demo.loca.lt/api/flowbot
```

---

## 📊 Access Your App Now

### Desktop Browser
1. Visit: https://affiliateflow-demo.loca.lt
2. Password: `66.195.220.96`
3. Use your app!

### Mobile Device
1. Open browser on phone
2. Navigate to: https://affiliateflow-demo.loca.lt
3. Enter: `66.195.220.96`
4. Test FlowBot and content generation!

### API Testing
```bash
# FlowBot API
curl -H "Bypass-Tunnel-Reminder: true" \
  -X POST https://affiliateflow-demo.loca.lt/api/flowbot \
  -H "Content-Type: application/json" \
  -d '{"question":"Hi!","history":[]}'

# Content Generation
curl -H "Bypass-Tunnel-Reminder: true" \
  -X POST https://affiliateflow-demo.loca.lt/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"caption","platform":"instagram","topic":"coffee"}'

# AI Costs
curl -H "Bypass-Tunnel-Reminder: true" \
  https://affiliateflow-demo.loca.lt/api/ai-costs
```

---

## 💡 Pro Tips

### For Demos
- Share URL + password ahead of time
- Visitors only enter password once
- Works great for client presentations

### For Team Testing
- Send credentials to team channel
- Everyone can access from their devices
- Password valid for 7 days per device

### For Development
- Use custom User-Agent for API calls
- Bypass page for automated testing
- Monitor requests in your terminal

---

## 🔄 If Password Changes

Your password (public IP) changes if:
- You restart your router
- Your ISP assigns a new IP
- You connect to a different network

**Get new password anytime:**
```powershell
Invoke-RestMethod -Uri https://loca.lt/mytunnelpassword
```

---

## 🎯 What to Share

### For Visitors
Send this message:
```
Check out my app!
URL: https://affiliateflow-demo.loca.lt
Password: 66.195.220.96

(Enter password on first visit - you won't see it again for 7 days)
```

### For Developers/API Users
```
API Base URL: https://affiliateflow-demo.loca.lt
Add header: Bypass-Tunnel-Reminder: true
Or use custom User-Agent header
```

---

## ✅ Ready to Access

Your app is live and waiting!

**URL:** https://affiliateflow-demo.loca.lt  
**Password:** `66.195.220.96`

Enter the password and start using your AI-powered AffiliateFlow app from anywhere! 🚀
