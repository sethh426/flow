# Firebase consolidation report

- Assessment date: 2026-09-06
- Canonical destination: `flowearlyadopters`
- Current public host: <https://flowearlyadopters.web.app>
- Decision status: preserve first; migrate selected resources only after validation; no project deletion was performed

## Decision

Flow should become one product on one canonical Firebase project. The safest destination is `flowearlyadopters` because it already owns the accepted public domain and serves all three intended surfaces:

- `/` — early-adopter landing and waitlist;
- `/investors/` — recovered investor presentation;
- `/app/` — the official Flow application.

Firebase projects cannot be merged in place. Consolidation therefore means exporting unique evidence, redeploying selected functions and data behind verified contracts, moving the client configuration, validating production, and only then retiring redundant projects. This assessment made no destructive changes.

## Verified project inventory

| Project | Verified resources | Consolidation decision |
| --- | --- | --- |
| `flowearlyadopters` | One web app, one Hosting site, Firestore collections `meta` and `waitlist_signups`; no deployed Functions or Extensions | Canonical host and eventual backend destination |
| `affiliateflow-abzfy` | One web app, Hosting, ten deployed functions, and Firestore collections for products, model/performance records, routing archives, stats, and tests | Source backend. Migrate only selected, tested contracts and unique data into the canonical project |
| `flow-69826693-f6d27` | Product Mapper Hosting, one `api` function, named database `flow`, and a default database | Preserve as reference until migration sign-off; do not use as another frontend |
| `flowinvestorglance` | Static Hosting only; no registered Firebase app, Function, Extension, or Firestore database | Retirement candidate because the intended presentation already exists on the canonical host |
| `appy-32f2xp` | Two web registrations, one Python audit function, two extension functions, two installed Storage extensions, one connector document, and six small Storage objects | Archive/reference. Do not merge its runtime blindly |

## Product Mapper comparison

The product collections were compared directly through the Firestore API:

- `affiliateflow-abzfy/(default)/products`: 52 documents;
- `flow-69826693-f6d27/flow/products`: 52 documents;
- overlapping document IDs: 52;
- common fields: the same 12 fields on both sides;
- content result: all 52 records are semantically identical when timestamp representation is ignored.

There is therefore no product-data copy to perform from Product Mapper. Copying these records would create duplicate ownership and migration risk without preserving new business information. Its UI and function remain reference material until the canonical product-management workflow replaces them.

## Investor-host comparison

The canonical host returns the intended investor presentation at `/investors/`. The standalone `flowinvestorglance.web.app` host serves an older Affiliate Flow marketing frontend and has no other Firebase runtime resources. It should remain untouched until the shared route is accepted, then be disabled or redirected with explicit owner approval.

## `appy-32f2xp` findings

The only Firestore business configuration is `connectors/Nordstrom`. It is preserved verbatim as [an unverified historical reference](../recovery/firebase/appy-32f2xp-nordstrom-connector-reference.json). The selectors and URL have not been validated against the current retailer site, terms, affiliate permissions, or anti-automation rules, so the connector must not be activated as production code.

The Storage bucket exposes six small historical objects (12,738 bytes total):

| Object | Bytes | Recovery state |
| --- | ---: | --- |
| `.gitignore` | 156 | Inventory only |
| `firestoreSaveProduct.js` | 979 | Inventory only |
| `gemini_costs_graph.py` | 873 | Inventory only |
| `open_gemini_quota_automated.js` | 4,804 | Inventory only |
| `run_all.ps1` | 1,934 | Inventory only |
| `trendsProductSuggestAndContent.js` | 3,992 | Inventory only |

The object download endpoint returned `403` because billing is closed, so their contents are not claimed as recovered. Their names and metadata are preserved here for a future authorized export. The installed image-label and image-text-extraction extensions are generic experiments, not evidence that the main Flow runtime depends on them.

## Safe migration sequence

1. Keep `flowearlyadopters` Hosting as the canonical public surface and continue preview-channel validation before every promotion.
2. Replace fabricated default data with honest empty, setup, preview, draft, queued, failed, and verified states.
3. Define one versioned API contract and Firestore ownership model for users, products, plans, campaigns, assets, publications, events, and recommendations.
4. Prepare canonical Firestore rules, indexes, Auth providers, service identities, secrets, budgets, and rollback exports.
5. Redeploy only the selected `affiliateflow-abzfy` functions behind authenticated `/api/v1/**` endpoints in a non-production environment first.
6. Migrate unique backend collections with counts and checksums. Do not import Product Mapper's duplicate product collection.
7. Point a preview build at the canonical backend and verify identity, tenant isolation, idempotency, observability, and failure behavior.
8. Promote the tested build, monitor it, and obtain explicit acceptance.
9. Only after acceptance, retire or redirect `flowinvestorglance`, then archive `flow-69826693-f6d27` and `appy-32f2xp`. Deletion is a separate, explicit decision.

## What was deliberately not merged

- No Cloud Function was copied or redeployed.
- No Firestore document was written, moved, or deleted.
- No Extension was installed in the canonical project.
- No Firebase project or Hosting site was disabled.
- No historical connector was activated.

This keeps the live site stable while giving Flow a concrete path from several experiments to one accountable application.
