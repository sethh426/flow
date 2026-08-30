# 📥 Download Your Firebase Service Account Key

## Step 1: Go to Firebase Console

**Click this link to go directly to the Service Accounts page:**

🔗 **https://console.firebase.google.com/project/flow-69826693-f6d27/settings/serviceaccounts/adminsdk**

## Step 2: Generate New Private Key

1. You should see a button that says **"Generate new private key"**
2. Click it
3. A dialog will appear - click **"Generate key"**
4. A JSON file will download to your Downloads folder

## Step 3: Replace the File

The downloaded file will be named something like:
`flow-69826693-f6d27-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`

**Replace your current serviceAccountKey.json:**

```powershell
# In PowerShell, run:
cd c:\Users\sethp\Downloads\Affiliate-Flow-Prototype

# Move the downloaded file (adjust the filename to match what you downloaded)
Copy-Item "C:\Users\sethp\Downloads\flow-69826693-f6d27-*.json" serviceAccountKey.json
```

## Step 4: Verify It Worked

```powershell
node -e "const fs = require('fs'); const sa = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8')); console.log('Project ID:', sa.project_id); console.log('Client Email:', sa.client_email);"
```

Should show:
- `Project ID: flow-69826693-f6d27`
- `Client Email: firebase-adminsdk-*@flow-69826693-f6d27.iam.gserviceaccount.com`

## Step 5: Restart Your App

```powershell
# Stop the current dev server (Ctrl+C in the terminal)
# Then restart:
cd client
npm run dev
```

---

## Alternative: Copy-Paste Method

If you can't download the file, you can copy-paste the JSON:

1. Open: https://console.firebase.google.com/project/flow-69826693-f6d27/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Open the downloaded JSON file in a text editor
4. Copy all the contents
5. Paste into `serviceAccountKey.json` in your project

---

**Once you have the correct key, your app will be fully functional! 🚀**
