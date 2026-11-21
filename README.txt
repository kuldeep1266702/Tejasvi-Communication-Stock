# Tejasvi Communication — Stock Record

## Project structure
- `index.html` — website structure
- `css/styles.css` — responsive design and styling
- `js/app.js` — inventory, search/filter, admin demo login and browser storage

## Run locally
1. Extract the ZIP file.
2. Open `index.html` in a modern browser (Chrome recommended).
3. Select **Admin dashboard**.
4. Demo password: `tejasvi123`.
5. Add products, colour, RAM, storage, quantity, price and product photo.

## Important prototype limitations
- This version saves records in `localStorage` in the current browser/device.
- It does not yet synchronize stock across different phones or computers.
- The demo password is visible in the JavaScript and is NOT secure for a public site.
- Product images uploaded in the demo are stored in browser storage and are limited to 2 MB each.
- Sample entries are illustrative. Replace them with your real stock.

## Before public launch
Connect a hosted database (for example Supabase), real authentication with server-side authorization, cloud image storage, backups, and HTTPS hosting. Do not use the demo password for production.
