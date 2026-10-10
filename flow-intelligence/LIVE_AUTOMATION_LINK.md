# Live automation-services link — 2026-10-10

Authorized request: add the ChatGPT-built Flow client site to the live Firebase site.

Added “Automation Services” to the existing navigation at https://flowearlyadopters.web.app/ . It links to https://flow-automation-intake.mr-pipper33.chatgpt.site/solutions with source/medium/campaign labels. The navigation wraps on narrow screens and uses 44px link targets. This is a link to the existing hosted client intake, not an embedded ChatGPT conversation.

## Deployment evidence

- Previous version: `sites/flowearlyadopters/versions/32611915de2b39c0`.
- New version: `sites/flowearlyadopters/versions/93976edb01dcb350`.
- Live release: `sites/flowearlyadopters/releases/1791656584005000`.
- All 256 file paths retained; authenticated file-hash comparison showed only `/index.html` changed. Hosting configuration matched the previous version.
- Live GET verified the homepage returns 200 and contains the correct link; existing `/app/` and `/investors/` return 200.
- Browser visual/interaction validation was not performed; HTTP checks do not establish the complete older app works.

## Reproducibility and source drift

`flow-early-adopters/add-automation-link.cjs` applies the idempotent change to either the current live HTML or repository HTML. Applied to both. The older repository root HTML differs from the live site: the deployment therefore reused the exact current Hosting file hashes and configuration, uploading only the patched homepage. Do not deploy the repository's entire older public directory over the live app without first reconciling this drift.

Deployment followed the official [Firebase Hosting REST process](https://firebase.google.com/docs/hosting/api-deploy): gzip/SHA256, complete file inventory, upload required content, finalize and release. The first finalize response omitted `fileCount`; release was stopped until finalized status, full file inventory, unchanged hashes/config and unchanged latest release were independently checked.

The prior version remains available for rollback. Billing, backend, Firestore rules, app bundle, investor files and client-intake storage were not changed by this patch.

Next: verify actual visitor-to-intake conversion; the link itself does not generate traffic or prove new clients.
