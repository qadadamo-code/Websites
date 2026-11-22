# Barcode Cafe — website

Static site (HTML + CSS + JS). No build step, no Node.js on the server. Upload the whole `barcode-cafe` folder to any static/PHP host and open `index.html`.

## Edit content
Everything editable lives in `assets/js/menu.js`:
- `BARCODE_CONFIG`: WhatsApp number, email, address, hours, social links, optional `openingDate` (shows a countdown when set).
- `BARCODE_MENU`: chapters (each with its own scroll video) and items (name, price in EGP, sub-group, optional tag). This is the official Barcode drinks menu; shisha is still to be added.
- `BARCODE_MOODS`: the "mood scanner" combos (item ids from the menu).

## How orders and bookings work
- Menu items go into a receipt-style cart (saved in the browser). Sending opens WhatsApp (`wa.me/201203101104`) with the full order prefilled, or an email to `info@theplanetco.com`.
- The reservation "boarding pass" sends a prefilled WhatsApp or email message.

## Media
- `assets/seq/<name>/001-048.jpg`: frames of the AI-generated section videos. They are drawn on a canvas and scrubbed by scroll.
- `assets/img/*.jpg`: section stills. `assets/brand/*`: logo variants made from the client's PDF.

Libraries (vendored): GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13. Fonts: brand fonts GE SS Two (Arabic) and Century Gothic (English) are used when available (drop webfont files in assets/fonts to self-host); Almarai and Didact Gothic are the fallbacks.
