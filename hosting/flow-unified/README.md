# Unified Flow Firebase Hosting

This package assembles three independently maintained surfaces for the existing
`flowearlyadopters` Firebase Hosting site:

- `/` — Early Adopters landing page
- `/investors/` — investor overview
- `/app/` — statically exported Flow application

The application is intentionally built with `NEXT_PUBLIC_API_MODE=mock` until
the production API has authentication, working billing, configured provider
credentials, and endpoint parity with the client. The preview banner makes that
state visible to users.

## Build and preview

```powershell
cd C:\Users\sethp\flow\hosting\flow-unified
npm run build
firebase hosting:channel:deploy shared-host-preview --expires 7d --project flowearlyadopters
```

The build output lives in `.dist/` and is intentionally ignored by Git. Deploy
the live channel only after checking `/`, `/investors/`, and `/app/` on the
preview URL.

## Live API build

The live build is fail-closed: it requires the API origin and the public
Firebase Web App configuration at build time. These Firebase browser values
identify the app; private provider and service-account secrets must never be
placed in `NEXT_PUBLIC_*` variables or committed.

```powershell
$env:FLOW_API_URL = 'https://us-central1-affiliateflow-abzfy.cloudfunctions.net/api'
$env:NEXT_PUBLIC_FIREBASE_API_KEY = 'replace-me'
$env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'affiliateflow-abzfy.firebaseapp.com'
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'affiliateflow-abzfy'
$env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'affiliateflow-abzfy.firebasestorage.app'
$env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '<sender ID>'
$env:NEXT_PUBLIC_FIREBASE_APP_ID = '<Firebase Web App ID>'
npm run build:live
```

Do not run `firebase deploy --only hosting` until the authenticated API health
check works and the live build has passed a preview-channel smoke test.
