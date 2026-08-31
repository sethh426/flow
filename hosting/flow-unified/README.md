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
