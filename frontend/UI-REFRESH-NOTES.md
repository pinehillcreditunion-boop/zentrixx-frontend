# Zentrixx dashboard UI refresh

## What changed
- Added `src/banking-dashboard-refresh.css`, a presentation-only styling layer for the authenticated workspace.
- Imported the stylesheet from `src/App.js` after the existing brand stylesheet so it can refine the existing design.
- Refined the shared application shell, sidebar, header, dashboard panels, wallet/action cards, forms, tables, modal surfaces, responsive behavior, focus states, and subtle entrance/hover motion.
- Existing React components, routes, Redux actions, API calls, modal logic, form handlers, and backend integrations were not intentionally changed.

## Environment safety
The source archive contained a frontend `.env` with AWS credential variables. That file has been omitted from this distributable archive because secrets must not be shipped in frontend source or browser bundles. Keep credentials on the backend only, rotate any AWS keys that were present in the uploaded archive, and use backend-generated presigned upload URLs from the browser.

The included `.env.example` states that no AWS credentials are required in the browser.

## Validation
This is a CSS-focused UI update. A production build was not run because dependencies (`node_modules`) are not included in the uploaded archive. Run `npm install` and `npm run build` in your environment before deployment.
