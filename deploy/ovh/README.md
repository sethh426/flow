# Flow Studio on OVH

## Current sidecar deployment (2026-10-22)

`studio-sidecar.compose.yml` runs the Studio API on the existing
`intothebattle_default` Docker network. It has no public port. The existing
IntoTheBattle Caddy routes only `/api/studio/*` to `flow-studio:8787` and
continues serving its app for every other path. The route is live at
`https://intothebattle.com/api/studio/status`; Flow's client on Firebase
Hosting uses that HTTPS origin. `intothebattle-Caddyfile.candidate` records
exactly the Caddy config deployed on the VPS. Its old version is backed up
under `/opt/intothebattle/backups/flow-cutover-20261021/`.

The ignored `deploy/ovh/.env` on the VPS contains the server-held Groq key,
`FLOW_STUDIO_PROVIDER=groq`, an explicit model, and the exact allowed Flow
origins. Keep it mode 0600 and out of Git. From `/opt/flow`:

```bash
docker compose -f deploy/ovh/studio-sidecar.compose.yml up -d --build
docker compose -f deploy/ovh/studio-sidecar.compose.yml ps
```

A future IntoTheBattle deploy may replace its Caddyfile. Draft
[IntoTheBattle PR #6](https://github.com/sethh426/Intothebattle/pull/6)
carries the `/api/studio/*` handle into that project's source. Merge and
verify it before the next automated release; keep the sidecar network attached.
The sidecar usage quota requires one replica and its persistent `studio_usage`
volume. Roll back the
route by restoring the backed-up Caddyfile and reloading Caddy, then stop the
sidecar with `docker compose -f deploy/ovh/studio-sidecar.compose.yml down`
(without `-v`). Keep the existing IntoTheBattle volumes intact.

Only authenticated creative generation is provided by this endpoint. Client
starter drafts and local export remain separate. A live temporary Firebase
account produced a schema-valid AI creative through this endpoint and was
then deleted. Human Google sign-in through the Flow browser UI is not yet
tested.

## Earlier full-domain cutover plan (not performed)

This Compose project serves Flow's static export and its Studio API on the
same HTTPS domain. Firebase Authentication stays on project
`affiliateflow-abzfy` with Firebase billing off. The IntoTheBattle app and its
PostgreSQL/media volumes must be backed up and then stopped before this stack
can bind ports 80 and 443. Do not delete those volumes: they are the rollback.

## Preflight before changing the live domain

1. Confirm that `intothebattle.com` and `www.intothebattle.com` still resolve
   to the VPS selected for Flow. On 2026-10-19 both resolved to
   `15.204.175.46`, matching `vps-6dd634b1.vps.ovh.us`. Recheck at cutover.
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
