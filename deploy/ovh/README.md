# Flow Studio on OVH

This is a separate, single-replica API for the existing Firebase Spark hosted
client. It does not need Firebase Functions, Firestore, or a service account key.
It verifies Firebase ID-token signatures against Google's published certificates.
It cannot detect token revocation until token expiry; the current API surface only
creates drafts and does not expose account data.

1. Put this checkout in its own directory on the VPS. Do not replace another
   site's Caddy configuration or Docker project.
2. Copy `deploy/ovh/env.example` to `deploy/ovh/.env`, chmod it `600`, and
   supply a server-side OpenAI key and a verified compatible model ID.
3. Run `docker compose -f deploy/ovh/compose.yml up -d --build` from the repo
   root. The port is accessible only on the VPS loopback address.
4. Give the API its own DNS name pointing to the VPS. Configure an existing
   HTTPS reverse proxy for that host with `reverse_proxy 127.0.0.1:8787`, or
   provision an isolated proxy. Check `https://<api-host>/healthz` and
   `/api/studio/status` before publishing the host to clients.
5. Build the static client with `NEXT_PUBLIC_FLOW_STUDIO_API_ORIGIN=https://<api-host>`.
   Run its checks, then deploy **Hosting only** to `affiliateflow-abzfy`.

Keep `.env` and the provider key off GitHub and out of the static client. The
daily limit is 20 attempts per Firebase user and 200 total attempts (UTC),
stored on `studio_usage`. These are cost ceilings, not guarantees of cost.
Run one replica; this file-backed limit is not a distributed rate limiter.
The frontend's other production job endpoints still target the existing
Firebase backend and have no OVH implementation; the status response disables
AI media controls. Starter drafts and local export remain local.
