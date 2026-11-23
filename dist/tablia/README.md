# Tablia «طبلية» — website + dashboard

PHP + JSON, no database, no build step. Live: web.theplanetco.com/tablia and tabliacatering.rest.

- `index.php` public site (Mama Rehab identity, today's meals, kitchen menu by kilo/tray, buffet & set-menu packages, ordering and occasion booking to WhatsApp).
- `api/` order, reserve, coupon, data. Prices are always recalculated on the server (`item_sizes()` in `inc/core.php`).
- `admin/` dashboard: orders, kitchen plan per delivery day, occasions with deposits, customers, items with sizes, categories, packages, discounts, delivery charges, reports, WhatsApp sender, users/roles, activity log + undo, backups.
- `data/seed.json` initial menu. Live data lives in `storage/*.json` (created on first run, never overwritten by deploys). Change live data from the dashboard.
