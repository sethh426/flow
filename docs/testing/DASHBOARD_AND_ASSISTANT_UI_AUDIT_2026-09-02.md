# Flow dashboard and assistant UI audit

- Audit date: 2026-09-02
- Branch: `codex/live-affiliateflow-backend`
- Firebase project: `flowearlyadopters`
- Live Hosting version: `4e1942fae6250fc4`
- Application URL: <https://flowearlyadopters.web.app/app/dashboard/>
- Runtime mode: mock/configuration mode; no live publishing, payments, or automation

## Outcome

The official Flow application now uses one responsive command-center shell across the dashboard and control pages. The production artifact was built, deployed to the Firebase preview channel, checked at phone, tablet, and desktop widths, and then promoted to the existing live Hosting site.

The audit removed the layout collisions that previously affected the sidebar, preview banner, dashboard controls, Flow Assistant, and workflow builder. The checked production dashboard has no horizontal page overflow at 390 pixels, the assistant fills the phone viewport, and a clean production browser session reported no console warnings or errors.

## Current live structure

The `flowearlyadopters` Hosting site continues to serve three surfaces from one deployment:

| URL | Surface | Source |
| --- | --- | --- |
| `/` | Flow Early Adopters | `flow-early-adopters/` |
| `/investors/` | Investor overview | `flowinvestorglance-temp/public/` |
| `/app/` | Official Flow application | static export from `client/` |

The official application is intentionally compiled with `NEXT_PUBLIC_API_MODE=mock`. The visible preview banner and assistant copy make this limitation explicit. This deployment does not activate billable or external actions.

## Changes completed

### Shared shell and navigation

- Aligned the desktop content offset with the 18rem navigation width.
- Positioned the desktop sidebar, mobile drawer, menu control, and overlay below the responsive preview banner.
- Rebuilt the sidebar header and navigation density so important destinations remain readable without colliding with the footer.
- Added a compact `Flow Console` mobile identity and removed the mobile status-dot squeeze.
- Corrected Trends, Automation, and Print Studio links to existing routes.
- Changed the command header to stack until wide desktop sizes, preserving the search, notification, and assistant controls.
- Added route-aware titles for nested dashboard controls.

### Dashboard

- Reorganized the overview hierarchy and reduced duplicate navigation.
- Replaced the large secondary navigation cards with compact, contained controls.
- Removed the fixed quick-navigation overlay that covered dashboard content.
- Improved metric spacing, responsive action wrapping, card contrast, and mobile timestamp behavior.
- Replaced unsupported dynamic Tailwind color strings with static classes.

### Flow Assistant

- Replaced competing assistant launchers with one header control.
- Removed random notifications and the proactive overlay bubble.
- Added a bounded desktop/tablet dialog and a true full-viewport phone layout.
- Added an explicit close control, starter prompts, responsive prompt wrapping, accessible labels, a stable input area, and scroll-contained messages.
- Added deterministic mock guidance for products, campaigns, analytics, workflows, and trends.
- Prevented calls to the unavailable `/api/flowbot` endpoint while the app is in mock mode.
- Marked mock guidance as non-live and avoided claims that an external action occurred.

### Workflow control page

- Removed the internal fixed Material UI drawer that overlapped the application navigation.
- Replaced the 100vw/100vh workspace assumption with a contained responsive palette and canvas.
- Stacked palette actions on narrow screens.
- Preserved a large visual canvas while preventing page-level horizontal overflow.

### Legacy global CSS

Several old global rules were responsible for unrelated components breaking each other. The audit removed or narrowed rules that:

- applied paint/layout containment to the body, drawers, dialogs, and modals;
- forced every mobile element to use the same border radius;
- forced broad button-like class matches into an inline-flex button shape;
- capped every class containing `Dialog` at 90vw;
- forced all Material UI boxes to expose horizontal overflow.

## Responsive smoke-test matrix

| Surface | Phone 390 x 844 | Tablet 768 x 1024 | Desktop 1440 x 1000 |
| --- | --- | --- | --- |
| Dashboard shell | Pass | Pass | Pass |
| Navigation/drawer | Pass | Pass | Pass |
| Flow Assistant open/close | Pass | Pass | Pass |
| Mock assistant response | Pass | Pass | Pass |
| Starter prompt containment | Pass | Pass | Pass |
| Workflow builder | Pass | Pass | Pass |
| Page-level horizontal overflow | None | None | None on checked routes |

Desktop route checks covered:

- `/dashboard/`
- `/dashboard/trends/`
- `/dashboard/analytics/`
- `/dashboard/campaigns/`
- `/dashboard/products/`
- `/dashboard/workflows/`
- `/campaigns/`
- `/products/`
- `/analytics/`
- `/content-studio/`
- `/workflows/`

The first ten routes passed the initial overflow audit. `/workflows/` exposed the old full-viewport builder assumption; it was refactored and then passed the follow-up desktop and phone checks.

## Verification evidence

- `npm run build` in `hosting/flow-unified`: passed.
- Early Adopters build: passed.
- Next.js 15.5.3 static export: passed, 46 routes.
- Firebase preview deployment: passed at <https://flowearlyadopters--shared-host-preview-l3mszyo2.web.app> (expires 2026-09-09).
- Preview dashboard, assistant, navigation, tablet prompt grid, and mobile workflow checks: passed.
- Production Firebase Hosting deployment: passed, version `4e1942fae6250fc4`.
- Production phone dashboard: no page-level horizontal overflow.
- Production phone assistant: full viewport width and local mock response path confirmed.
- Fresh production browser console: no errors; one expected warning that Firebase client configuration is intentionally absent in mock mode.
- Focused ESLint for the changed shell, dashboard, and assistant files: passed.
- Portable secret-pattern scan: passed.
- `git diff --check`: passed.

The build still prints the expected missing-Firebase warning because this artifact deliberately omits live Firebase browser configuration. The repository-wide type check continues to fail in the previously documented AI, shared UI, integration, analytics, test, and service areas. Full-file lint for the historical workflow builder also reports its existing explicit-`any`, hook-dependency, and unused-code debt (22 errors and 17 warnings). The production Next build still bypasses those global gates.

## Remaining work

The UI is now suitable for endpoint-by-endpoint configuration, but the application remains a mock-mode frontend. Before changing it to live mode:

1. deploy and verify the authenticated `affiliateflow-abzfy` API candidate;
2. supply the Firebase public web configuration at build time;
3. verify user token forwarding, allowed origins, Firestore rules, and ownership checks;
4. connect one product/campaign workflow at a time and keep destructive or billable actions disabled until tested;
5. fix the existing repository-wide TypeScript, lint, and dependency-security debt.

For the wider application and service inventory, use [Current state and structure](../CURRENT_STATE_AND_STRUCTURE.md), [Endpoint and service audit](../integration/ENDPOINT_AND_SERVICE_AUDIT.md), and [AffiliateFlow function review](../integration/AFFILIATEFLOW_FUNCTION_REVIEW.md).
