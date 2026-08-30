# Flow early-adopter site

This is the static Firebase Hosting source associated with [flowearlyadopters.web.app](https://flowearlyadopters.web.app). The deployed HTML found during recovery is close to, but not byte-for-byte identical with, this local version.

## Local preview

```powershell
npm ci
npm run dev
```

Copy `public/config.example.js` to `public/config.js` and fill in the public Firebase web-app values if you need real waitlist submissions. `config.js` is ignored by Git.

The old browser-side Gemini integration was replaced with an optional `aiEndpoint` setting. That endpoint must be an authenticated backend that keeps provider API keys server-side. The legacy `get-signups.html` client-side admin login is disabled in the public source; replace it with Firebase Authentication and server-enforced authorization before use.

Deployment is intentionally not automatic. Review `SECURITY.md`, Firebase rules, the selected project, and the generated output before manually deploying from this directory.

