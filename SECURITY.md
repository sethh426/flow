# Security

## Immediate owner actions

1. Rotate or revoke the Gemini API key embedded in the currently deployed `flowearlyadopters.web.app` HTML. A browser-side generative-AI key cannot be kept secret.
2. Revoke and replace every service-account key that ever appeared in the original local AffiliateFlow Git history or recovery archives.
3. Configure GitHub Actions with workload identity federation where possible. Avoid long-lived JSON service-account keys and Firebase CI tokens.
4. Review Firebase rules and replace the client-side credentials in `flow-early-adopters/public/get-signups.html` with real Firebase Authentication plus server-enforced authorization before using that page.

## Repository rules

- Never commit `.env`, `terraform.tfvars`, service-account JSON, private keys, access tokens, or raw recovery archives.
- Keep public Firebase client configuration separate from privileged server credentials.
- Call Gemini and other billable/private APIs from an authenticated backend, not directly from browser JavaScript with a key.
- Deployment workflows remain manual until their project IDs, permissions, and secrets have been reviewed for this repository.

Check the tree before every push:

```powershell
./scripts/security/sanitize-secrets.ps1 -Check
git status --short --ignored
```

The sanitizer covers common key formats and hard-coded assignments, but it is not a substitute for provider-side secret scanning and credential rotation.

