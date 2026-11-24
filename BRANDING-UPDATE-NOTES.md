# Zentrixx Bank visitor experience update

## What changed
- Standardized visitor-page navigation behavior across About, Cards, Contact, FAQ, Current Account and Savings pages.
- Added a real accessible mobile navigation toggle with expanded state, scrollable mobile menu, clear login/sign-up actions and responsive breakpoints.
- Unified visitor navigation, page-title and footer styling around Zentrixx navy, blue and gold brand colors.
- Replaced the legacy box/shadow preloader with a centered Zentrixx-branded mark and subtle pulse animation.
- Replaced the military-themed legacy hero image used by the old template with the consumer-banking visual already present in the project, and updated the corresponding CSS background reference.
- Removed legacy military gallery styling from the application stylesheet.
- Replaced outdated, unrelated bank-history and employee-payment copy in visitor-facing pages with brand-neutral Zentrixx messaging.
- Corrected visitor footer links for Current Account and Privacy Policy.

## Build note
The project dependencies could not be fully installed in the execution environment: `npm ci` timed out and `react-scripts` was unavailable afterward. Run `npm install` (or `npm ci`) in your development environment, then `npm run build` to verify against your local Node/npm setup.

## Premium design-system pass
- Introduced a centralized Zentrixx palette (deep navy, confident blue, restrained gold, cool neutral surfaces) and consistent typography, radii, borders, focus states and elevation.
- Applied a shared visual layer across public marketing pages, legacy visitor-template pages, authentication/onboarding screens and the signed-in banking workspace.
- Refined the public-site hero, navigation, calls to action and feature cards; aligned dashboard navigation, workspace surfaces, account summaries, quick actions and transaction tables.
- Replaced remaining legacy green accents and orange chart accents in component styles with the unified blue-and-gold brand colors.
- Added responsive refinements and reduced-motion accessibility support. Existing routes, components and business logic were left intact.
