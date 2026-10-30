# Planet Web — web.theplanetco.com

The site that sells Planet's website-building service. Arabic first (`/ar/`), English at `/en/`.

## Stack
- Next.js 15 (static export) + TypeScript + Tailwind CSS 4
- Motion (Framer Motion), Lenis smooth scroll, a canvas planet (no 3D library)
- PHP endpoints for the brief form and payment receipts (HostApp has no Node.js)

## Edit content
All text lives in `content/ar.ts` and `content/en.ts` (same shape). Prices, add-ons, FAQ, sectors, templates, blog posts and payment details are there.

Payment details for Planet: fill `pay.methods[].detail` in both files. For InstaPay also add the QR image at `public/pay/instapay-qr.png`.

Analytics: set `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_META_PIXEL_ID` before building.

## Run and build
```bash
npm install
npm run dev     # http://localhost:3000/ar/
npm run build   # outputs the static site to out/
```

## Deploy to HostApp
1. In HostApp, create the subdomain `web.theplanetco.com` and enable SSL.
2. Run `npm run build`.
3. Upload everything inside `out/` (including `.htaccess` and `api/`) to the subdomain's document root via File Manager or FTP.
4. Check `public/api/config.php`: form emails go to `info@theplanetco.com` from `no-reply@theplanetco.com`. Create that mailbox (or change the address) so mail is delivered.
5. Make sure `api/uploads/` is writable by PHP. It is blocked from public access by its own `.htaccess`. Submissions are also logged there as CSV.
