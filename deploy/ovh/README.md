# Cut over intothebattle.com to Flow on OVH

This Compose project serves Flow's static export and its Studio API on the
same HTTPS domain. Firebase Authentication stays on project
`affiliateflow-abzfy` with Firebase billing off. The IntoTheBattle app and its
PostgreSQL/media volumes must be backed up and then stopped before this stack
can bind ports 80 and 443. Do not delete those volumes: they are the rollback.

## Preflight before changing the live domain

1. Confirm that `intothebattle.com` and `www.intothebattle.com` resolve to the
   actual VPS selected for Flow. The installed IntoTheBattle deployment may be
   on a different server from the OVH VPS discovered in account email. If DNS
   points elsewhere, change it only after Flow passes local VPS health checks.
2. Obtain SSH access and verify the host fingerprint against the OVH console.
   Inspect `docker compose ps`, free memory/disk, and `/opt/intothebattle` on
   that server. Save a verified database/media backup and a copy of its Compose
   config and environment using the existing IntoTheBattle backup runbook.
   Disable its GitHub Actions production auto-deploy before the cutover so a
   later push cannot reclaim ports 80 and 443.
3. In Firebase Authentication for `affiliateflow-abzfy`, add
   `intothebattle.com` to Authorized domains. Keep the project's existing
   `affiliateflow-abzfy.firebaseapp.com` auth domain for this build. Confirm
   Google sign-in is enabled and test it after the cutover. Public Firebase
   web config comes from the same project; do not use IntoTheBattle credentials.
4. Copy `deploy/ovh/env.example` to `deploy/ovh/.env`, mode 0600. Fill the
   actual Firebase *web* app values, `FLOW_STUDIO_MODEL`, and the server-only
   `FLOW_STUDIO_OPENAI_KEY`. The public web API key and app ID are safe in the
   client build; the provider key must never enter the client build or Git.

## Cutover

From the verified VPS, stage this Flow checkout in `/opt/flow` and run
`docker compose --env-file deploy/ovh/.env -f deploy/ovh/compose.yml build`.
Check the generated static export and test the Studio process on the Compose
network. Then stop the old IntoTheBattle Compose project **without `down -v`**,
preserving its database and media volumes. Run:

```bash
docker compose --env-file deploy/ovh/.env -f deploy/ovh/compose.yml up -d
docker compose --env-file deploy/ovh/.env -f deploy/ovh/compose.yml ps
```

Flow's Caddy claims the existing domain and issues HTTPS certificates. Verify
`https://intothebattle.com/`, `/healthz`, and `/api/studio/status`; confirm
the latter reports `configured: true`. Then test Firebase Google sign-in and
one authenticated creative request end-to-end. `www.intothebattle.com`
redirects to the apex. If DNS does not yet target this VPS, update the apex A
record and `www` record after the local checks, without altering mail records.

## Rollback

If the site or sign-in fails, stop Flow with
`docker compose --env-file deploy/ovh/.env -f deploy/ovh/compose.yml down`
(no `-v`), restore the previous DNS if it changed, and restart the existing
IntoTheBattle Compose project from its original directory and environment.
Verify its homepage, health check, and a signed-in route. Retain the backup and
database/media volumes until recovery is tested.

The Studio API verifies Firebase tokens with Google's public certificates and
cannot detect revocation until token expiry. It caps attempts at 20 per user
and 200 total per UTC day, using the persistent `studio_usage` volume and one
replica. These are cost ceilings, not guarantees of cost. It handles creative
generation only; AI narration, scene visuals, Veo footage, job persistence,
and publishing are not connected in this OVH stack. Starter drafts and local
video export continue to work. The separate Firebase Hosting site is left
available as a fallback URL; this cutover does not enable Firebase billing.
