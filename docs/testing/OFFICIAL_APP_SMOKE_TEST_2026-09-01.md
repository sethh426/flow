# Official app UI smoke test

- Date: 2026-09-01
- Production site: <https://flowearlyadopters.web.app>
- Official app: <https://flowearlyadopters.web.app/app/>
- Firebase Hosting version: `0fd12c588300ed60`
- Preview channel: <https://flowearlyadopters--shared-host-preview-l3mszyo2.web.app>
- Runtime mode: configuration/mock mode; live Firebase data, payments, publishing, and automation remain disconnected

## Result

The shared Firebase Hosting deployment passes the UI smoke test at desktop and mobile sizes. The existing Early Adopters site remains at `/`, and the optimized official application remains isolated below `/app/` on the same `flowearlyadopters` Hosting site.

The official app now has consistent dark-theme contrast, readable headings and supporting copy, restored gradients, responsive controls, and unobstructed authentication forms. No browser runtime errors were observed. The remaining Firebase messages are expected warnings caused by the intentionally absent live client configuration.

## Routes exercised

| Route | Desktop | Mobile (390 x 844) | Result |
| --- | --- | --- | --- |
| `/` | Yes | Yes | Early Adopters site renders and its `/app/` link remains available |
| `/app/` | Yes | Yes | Hero, feature sections, calls to action, and gradients are readable |
| `/app/dashboard/` | Yes | Yes | Header, KPI cards, navigation, and action buttons render without horizontal overflow |
| `/app/analytics/` | Preview | Yes | Route renders without an error boundary or console error |
| `/app/campaigns/` | Preview | Yes | Route renders without an error boundary or console error |
| `/app/content-studio/` | Preview | Yes | Route renders without an error boundary or console error |
| `/app/products/` | Preview | Yes | Route renders without an error boundary or console error |
| `/app/workflows/` | Preview | Yes | Route renders without an error boundary or console error |
| `/app/auth/login/` | Yes | Yes | Form remains fully visible after the assistant timer fires |

The core route sweep was performed on the Firebase preview built from the exact unified output promoted to production. Production was then rechecked at `/app/` and `/app/auth/login/`, including a delayed check after the assistant timer.

## UI problems corrected

1. Renamed custom `--spacing-*` variables that collided with Tailwind v4 and reduced `max-w-2xl` content to 64 pixels.
2. Replaced the compiled Flowbite stylesheet import with the Flowbite plugin and explicit content sources, removing duplicate utilities that defeated dark-mode rules.
3. Moved global typography rules into Tailwind's base layer so component utilities can control size and color.
4. Bound dark tokens and Material UI styling to the application's `.dark` theme class instead of the operating-system media query.
5. Migrated obsolete `bg-gradient-to-*` utilities to Tailwind v4 `bg-linear-to-*` utilities across the active client.
6. Replaced hard-coded white/black Material UI surfaces and labels with theme tokens.
7. Removed the Flow Assistant and onboarding side effects from landing and authentication routes, including deployments mounted at `/app`.
8. Hid the proactive assistant card at mobile sizes and made its desktop surface theme-aware.

## Verification commands

| Check | Result |
| --- | --- |
| Unified build (`hosting/flow-unified`) | Passed; Early Adopters and all 46 official-app static routes exported |
| Focused ESLint on layout/theme/assistant files | Passed with 0 errors and 5 existing warnings |
| Repository diff check | Passed |
| Secret-pattern check | Passed |
| Browser console | 0 runtime errors; expected mock-mode Firebase warnings only |
| Standalone TypeScript check | Existing baseline still fails with 158 error lines |

The TypeScript failures are existing recovery debt and are not hidden by this report. Nine occur in files that received only mechanical gradient-class replacements; the reported errors concern pre-existing analytics, error typing, and product-domain types. Next.js continues to bypass TypeScript and lint gates during production builds, as documented in the main current-state report.

## Remaining UI and product work

- Connect Firebase client configuration and authenticated services only after the endpoint/security activation work is approved.
- Repair the 158-error TypeScript baseline and re-enable build-time type enforcement.
- Convert the route sweep into a small repeatable Playwright CI suite.
- Review the lower dashboard sections and specialist editors with realistic content at tablet widths.
- Keep future production deployments behind the same preview-channel smoke test.
