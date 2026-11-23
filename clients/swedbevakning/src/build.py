# -*- coding: utf-8 -*-
"""Static site generator for Swedbevakning.
  python3 src/build.py          -> preview build (base https://web.theplanetco.com/swedbevakning/, noindex)
  python3 src/build.py --prod   -> production build into dist-prod/ (base https://swedbevakning.se/, indexable)
Swedish at the root, English under /en/. Same slugs in both languages."""
import os, sys, html, json, datetime, shutil
from content import CO, SERVICES, AREAS, DISTRICTS, INDUSTRIES, UI

SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SRC)
PROD = "--prod" in sys.argv
BASE = "https://swedbevakning.se/" if PROD else "https://web.theplanetco.com/swedbevakning/"
OUT = os.path.join(ROOT, "dist-prod") if PROD else ROOT
V = "1"
TODAY = datetime.date.today().isoformat()
YEAR = datetime.date.today().year


def esc(s):
    return html.escape(str(s), quote=True)


class Ctx:
    def __init__(self, lang, slug):
        self.lang, self.slug = lang, slug
        self.depth = (0 if slug == "index" else slug.count("/") + 1) + (1 if lang == "en" else 0)
        self.u = UI[lang]

    def rel(self, path):
        return "../" * self.depth + path

    def link(self, slug, lang=None):
        lang = lang or self.lang
        p = ("en/" if lang == "en" else "") + ("" if slug == "index" else slug + "/")
        return self.rel(p) if p else (self.rel("") or "./")

    def abs(self, slug, lang=None):
        lang = lang or self.lang
        return BASE + ("en/" if lang == "en" else "") + ("" if slug == "index" else slug + "/")


ICONS = {
    "store": '<path d="M7 18 10 8h28l3 10"/><path d="M7 18c0 3 2.2 5 5.2 5s5.3-2 5.3-5c0 3 2.2 5 5.3 5h.4c3 0 5.3-2 5.3-5 0 3 2.3 5 5.3 5S41 21 41 18"/><path d="M10 23v17h28V23"/><path d="M20 40V30h8v10"/>',
    "event": '<path d="M24 6v6M10.5 11.5l4 4M37.5 11.5l-4 4"/><path d="M8 40c2-9 8.5-15 16-15s14 6 16 15Z"/><path d="M17 40c1-4.5 3.6-7 7-7s6 2.5 7 7"/>',
    "patrol": '<path d="M24 5 9 11v11c0 9.6 6.4 17.6 15 20 8.6-2.4 15-10.4 15-20V11L24 5Z"/><path d="M24 15v10l6 4"/><circle cx="24" cy="25" r="1.5" fill="currentColor"/>',
    "parking": '<rect x="7" y="7" width="34" height="34" rx="9"/><path d="M19 34V14h7a6 6 0 0 1 0 12h-7"/>',
    "camera": '<path d="M6 14 33 8l3 10-27 6Z"/><path d="M36 18 42 16"/><path d="M15 23 14 34h-7"/><circle cx="29" cy="14" r="1.5" fill="currentColor"/>',
    "search": '<circle cx="21" cy="21" r="13"/><path d="m31 31 10 10"/><path d="M16 21h10M21 16v10"/>',
    "build": '<path d="M6 41h36"/><path d="M10 41V20h12v21"/><path d="M22 41V12l14 6v23"/><path d="M14 26h4M14 32h4M27 24h4M27 30h4"/>',
    "office": '<rect x="9" y="6" width="22" height="35" rx="2"/><path d="M31 18h8v23h-8"/><path d="M15 13h3M22 13h3M15 20h3M22 20h3M15 27h3M22 27h3M18 41v-6h4v6"/>',
    "home": '<path d="M6 22 24 7l18 15"/><path d="M11 18v23h26V18"/><path d="M20 41V29h8v12"/>',
    "gov": '<path d="M6 17 24 7l18 10Z"/><path d="M9 41h30M11 21v15M19 21v15M29 21v15M37 21v15M7 41h34"/>',
    "bolt": '<path d="M27 4 10 27h12l-3 17 19-24H26Z"/>',
    "server": '<rect x="8" y="7" width="32" height="10" rx="2.5"/><rect x="8" y="19" width="32" height="10" rx="2.5"/><rect x="8" y="31" width="32" height="10" rx="2.5"/><path d="M14 12h.1M14 24h.1M14 36h.1M22 12h12M22 24h12M22 36h12"/>',
    "train": '<rect x="11" y="5" width="26" height="29" rx="7"/><path d="M11 20h26M17 34l-5 8M31 34l5 8M18 27h.1M30 27h.1"/>',
    "hotel": '<path d="M6 36V12M6 28h36v8M42 28v-5a6 6 0 0 0-6-6H22v11"/><circle cx="14" cy="21" r="4"/>',
    "person": '<circle cx="24" cy="15" r="8"/><path d="M8 42c1.6-8.5 8-13 16-13s14.4 4.5 16 13"/>',
    "phone": '<path d="M14.6 6h-5A3.6 3.6 0 0 0 6 9.8C6.9 27 21 41.1 38.2 42a3.6 3.6 0 0 0 3.8-3.6v-5l-8.6-3.4-4 4A27 27 0 0 1 14 18.6l4-4L14.6 6Z"/>',
    "mail": '<rect x="5" y="10" width="38" height="28" rx="5"/><path d="m7 13 17 13 17-13"/>',
    "pin": '<path d="M24 43s14-12.6 14-24a14 14 0 0 0-28 0c0 11.4 14 24 14 24Z"/><circle cx="24" cy="19" r="5"/>',
    "clock": '<circle cx="24" cy="24" r="18"/><path d="M24 13v11l7 5"/>',
    "arrow": '<path d="M10 24h28M28 14l10 10-10 10"/>',
    "check": '<path d="m10 25 9 9 19-19"/>',
    "shield": '<path d="M24 5 9 11v11c0 9.6 6.4 17.6 15 20 8.6-2.4 15-10.4 15-20V11L24 5Z"/><path d="m17 24 5 5 9-10"/>',
}


def icon(name, cls="ic"):
    return f'<svg class="{cls}" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g></svg>'


def photo(c, name, pos="50% 50%", alt="", lazy=True, cls=""):
    return (f'<img{" class=" + chr(34) + cls + chr(34) if cls else ""} src="{c.rel("assets/photos/" + name + ".webp")}" alt="{esc(alt)}" '
            f'style="object-position:{pos}"{" loading=" + chr(34) + "lazy" + chr(34) if lazy else ""} decoding="async">')


LOGO_SVG = open(os.path.join(SRC, "logo.svg"), encoding="utf-8").read()


def mark(cls="mk"):
    return f'<svg class="{cls}" viewBox="0 0 100 100" aria-hidden="true"><use href="#sb-mark"/></svg>'


def brand(c):
    return f'<span class="brand">{mark("brand-mk")}<span class="brand-t"><b>SWEDBEVAKNING</b><small>{"Säkerhet sedan 2019" if c.lang == "sv" else "Security since 2019"}</small></span></span>'


# ---------------------------------------------------------------- layout
def head(c, title, desc, slug, extra_ld=None, noindex=False):
    ld = [org_ld(c)] + (extra_ld or [])
    lds = "\n".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    robots = "noindex,nofollow" if (noindex or not PROD) else "index,follow,max-image-preview:large"
    return f'''<!doctype html>
<html lang="{c.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{c.abs(slug)}">
<link rel="alternate" hreflang="sv" href="{c.abs(slug, 'sv')}">
<link rel="alternate" hreflang="en" href="{c.abs(slug, 'en')}">
<link rel="alternate" hreflang="x-default" href="{c.abs(slug, 'sv')}">
<meta name="theme-color" content="#05044D">
<meta name="author" content="{CO['name']}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Swedbevakning">
<meta property="og:locale" content="{'sv_SE' if c.lang == 'sv' else 'en_GB'}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{c.abs(slug)}">
<meta property="og:image" content="{BASE}assets/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="SE-AB"><meta name="geo.placename" content="Stockholm"><meta name="geo.position" content="{CO['lat']};{CO['lng']}"><meta name="ICBM" content="{CO['lat']}, {CO['lng']}">
<link rel="icon" href="{c.rel('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="{c.rel('assets/img/apple-touch-icon.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800;900&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{c.rel('assets/css/site.css')}?v={V}">
{lds}
</head>
'''


def org_ld(c):
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "additionalType": "https://schema.org/ProfessionalService",
        "@id": BASE + "#org",
        "name": CO["name"],
        "alternateName": ["Swedbevakning", "Swed Bevakning"],
        "description": UI[c.lang]["home_desc"],
        "url": BASE,
        "logo": BASE + "assets/img/logo.png",
        "image": BASE + "assets/img/og.jpg",
        "telephone": CO["phone_e164"],
        "email": CO["email"],
        "foundingDate": CO["founded"],
        "priceRange": "$$",
        "address": {"@type": "PostalAddress", "streetAddress": CO["street"], "postalCode": CO["zip"].replace(" ", ""),
                    "addressLocality": CO["city"], "addressRegion": CO["region"], "addressCountry": "SE"},
        "geo": {"@type": "GeoCoordinates", "latitude": CO["lat"], "longitude": CO["lng"]},
        "contactPoint": [{"@type": "ContactPoint", "telephone": CO["phone_e164"], "contactType": "customer service", "availableLanguage": ["sv", "en"]},
                         {"@type": "ContactPoint", "telephone": CO["switch_e164"], "contactType": "switchboard"}],
        "areaServed": [{"@type": "AdministrativeArea", "name": "Stockholms län"}] + [{"@type": "City", "name": a["name"]} for a in AREAS],
        "openingHoursSpecification": {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "00:00", "closes": "23:59"},
        "hasOfferCatalog": {"@type": "OfferCatalog", "name": UI[c.lang]["svc_kicker"], "itemListElement": [
            {"@type": "Offer", "itemOffered": {"@type": "Service", "name": s[c.lang]["name"], "url": c.abs("tjanster/" + s["slug"])}} for s in SERVICES]},
    }


def crumbs_ld(c, items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": c.abs(s)} for i, (s, n) in enumerate(items)]}


def header(c):
    u = c.u
    alt = "en" if c.lang == "sv" else "sv"
    cur = c.slug.split("/")[0]
    nav = "".join(f'<a href="{c.link(s)}"{" aria-current=" + chr(34) + "page" + chr(34) if s == cur else ""}>{esc(n)}</a>' for s, n in u["nav"][1:-1])
    return f'''<body class="pg-{cur}">
<a class="skip" href="#main">{u["skip"]}</a>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{LOGO_SVG}</defs></svg>
<header class="hdr" id="hdr">
  <a class="hdr-logo" href="{c.link('index')}" aria-label="Swedbevakning – {u['nav'][0][1]}">{brand(c)}</a>
  <nav class="hdr-nav" aria-label="Main">{nav}<a href="{c.link('kontakta')}"{" aria-current=" + chr(34) + "page" + chr(34) if cur == "kontakta" else ""}>{u['nav'][-1][1]}</a></nav>
  <div class="hdr-end">
    <span class="duty"><i></i><b>{u["on_duty"]}</b><span data-clock>--:--</span></span>
    <a class="lang" href="{c.link(c.slug, alt)}" hreflang="{alt}" lang="{alt}">{alt.upper()}</a>
    <a class="btn btn-sm" href="tel:{CO['phone_e164']}">{icon('phone')}<span>{CO['phone']}</span></a>
    <button class="burger" aria-label="{u['menu']}" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
</header>
<div class="mnav" id="mnav" hidden>
  <nav>{"".join(f'<a href="{c.link(s)}"><small>0{i + 1}</small>{esc(n)}</a>' for i, (s, n) in enumerate(u["nav"]))}</nav>
  <div class="mnav-foot"><a href="tel:{CO['phone_e164']}">{icon('phone')}{CO['phone']}</a><a href="mailto:{CO['email']}">{icon('mail')}{CO['email']}</a><a class="lang" href="{c.link(c.slug, alt)}" hreflang="{alt}">{UI[alt]['lang_name']}</a></div>
</div>
'''


def footer(c):
    u = c.u
    svc = "".join(f'<li><a href="{c.link("tjanster/" + s["slug"])}">{esc(s[c.lang]["name"])}</a></li>' for s in SERVICES)
    areas = "".join(f'<li><a href="{c.link("omraden/" + a["slug"])}">{esc(a["name"] if not (c.lang == "en" and a["slug"] == "goteborg") else "Gothenburg")}</a></li>' for a in AREAS)
    nav = "".join(f'<li><a href="{c.link(s)}">{esc(n)}</a></li>' for s, n in u["nav"])
    return f'''<footer class="ftr">
  <div class="ftr-cta wrap">
    <div class="ftr-mk">{mark()}</div>
    <p class="ftr-big">{esc(u["hero_l1"])} <em>{esc(u["hero_l2"])}</em></p>
    <div class="ftr-cta-b"><a class="btn btn-light" href="{c.link('kontakta')}">{u["cta"]}{icon('arrow')}</a><a class="btn btn-ghost" href="tel:{CO['phone_e164']}">{icon('phone')}{CO['phone']}</a></div>
  </div>
  <div class="ftr-grid wrap">
    <div class="ftr-brand">{brand(c)}<p>{esc(u["footer_tag"])}</p><p class="legal">{u["footer_legal"]} · {u["story"][0][0]}</p></div>
    <div><h3>{u["nav"][1][1]}</h3><ul>{svc}</ul></div>
    <div><h3>{u["nav"][2][1]}</h3><ul>{areas}</ul></div>
    <div><h3>Swedbevakning</h3><ul>{nav}</ul></div>
    <div><h3>{u["nav"][-1][1]}</h3>
      <address>{CO['street']}<br>{CO['zip']} {CO['city']}</address>
      <p><a href="tel:{CO['phone_e164']}">{CO['phone']}</a><br><span class="muted">{u['switch']}</span> <a href="tel:{CO['switch_e164']}">{CO['switch']}</a><br><a href="mailto:{CO['email']}">{CO['email']}</a></p></div>
  </div>
  <div class="ftr-bot wrap"><span>© {YEAR} {esc(CO['name'])}. {u["rights"]}</span><span>{u["hours_v"]}</span></div>
</footer>
<a class="fab" href="tel:{CO['phone_e164']}" aria-label="{u['call']}">{icon('phone')}</a>
<script src="{c.rel('assets/js/vendor/gsap.min.js')}" defer></script>
<script src="{c.rel('assets/js/vendor/ScrollTrigger.min.js')}" defer></script>
<script src="{c.rel('assets/js/vendor/lenis.min.js')}" defer></script>
<script src="{c.rel('assets/js/site.js')}?v={V}" defer></script>
</body>
</html>
'''


def contact_form(c, compact=False, preset=""):
    u = c.u
    opts = "".join(f'<option value="{esc(s[c.lang]["name"])}"{" selected" if s[c.lang]["name"] == preset else ""}>{esc(s[c.lang]["name"])}</option>' for s in SERVICES)
    return f'''<form class="cform" action="{c.rel('contact.php')}" method="post" data-ok="{esc(u['f_ok'])}" data-err="{esc(u['f_err'])}">
  <input type="hidden" name="lang" value="{c.lang}">
  <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
  <div class="frow"><label class="fld"><input name="name" required autocomplete="name" placeholder=" "><span>{u['f_name']} *</span></label>
  <label class="fld"><input name="company" autocomplete="organization" placeholder=" "><span>{u['f_company']}</span></label></div>
  <div class="frow"><label class="fld"><input type="email" name="email" required autocomplete="email" placeholder=" "><span>{u['f_email']} *</span></label>
  <label class="fld"><input type="tel" name="phone" required autocomplete="tel" inputmode="tel" placeholder=" "><span>{u['f_phone']} *</span></label></div>
  <label class="fld fld-sel"><select name="service"><option value="">{u['f_service_any']}</option>{opts}</select><span>{u['f_service']}</span></label>
  <label class="fld"><textarea name="message" rows="{3 if compact else 5}" required placeholder=" "></textarea><span>{u['f_msg']} *</span></label>
  <div class="fsend"><button class="btn" type="submit">{u['f_send']}{icon('arrow')}</button><small>{u['f_privacy']}</small></div>
  <p class="fmsg" role="status" aria-live="polite"></p>
</form>'''


def contact_cards(c):
    u = c.u
    maps = "https://www.google.com/maps/search/?api=1&query=Lindev%C3%A4gen+92,+120+48+Enskede+G%C3%A5rd"
    return f'''<ul class="ccards">
  <li><a href="tel:{CO['phone_e164']}">{icon('phone')}<small>{u['phone']}</small><b>{CO['phone']}</b></a></li>
  <li><a href="tel:{CO['switch_e164']}">{icon('phone')}<small>{u['switch']}</small><b>{CO['switch']}</b></a></li>
  <li><a href="mailto:{CO['email']}">{icon('mail')}<small>{u['email']}</small><b>{CO['email']}</b></a></li>
  <li><a href="{maps}" target="_blank" rel="noopener">{icon('pin')}<small>{u['address']}</small><b>{CO['street']}, {CO['zip']} {CO['city']}</b></a></li>
</ul>'''


def area_name(c, a):
    return "Gothenburg" if (c.lang == "en" and a["slug"] == "goteborg") else a["name"]


def stockholm_map(c, focus=None):
    """Stylised map of Stockholm: Mälaren from the west, Saltsjön + archipelago to the east."""
    u = c.u
    water = ('<path class="w" d="M0 228C40 214 80 236 120 226S190 198 222 214 250 246 270 244 292 232 306 240 318 262 336 258 360 236 384 240 420 254 452 250 480 232 520 236 560 252 600 246V300C566 304 540 292 510 300S470 326 440 318 404 292 380 296 350 318 330 300 306 286 286 288 262 300 240 292 200 268 160 280 80 300 0 290Z"/>'
             '<path class="w" d="M600 120C570 130 548 160 520 168S470 160 452 182 470 222 500 214 560 190 600 196Z"/>'
             '<path class="w" d="M600 330C560 340 530 372 500 380S440 400 430 430 470 470 520 458 580 420 600 420Z"/>'
             '<path class="w" d="M210 150C230 120 262 110 282 120S300 160 284 176 236 190 222 178Z" opacity=".55"/>'
             '<path class="w" d="M160 360C190 344 214 352 222 372S208 412 186 410 150 384 160 360Z" opacity=".5"/>')
    isles = "".join(f'<ellipse class="w" cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" opacity=".5"/>' for x, y, rx, ry in [(560, 300, 12, 6), (540, 330, 7, 4), (575, 270, 6, 4), (520, 400, 10, 5), (585, 360, 8, 5), (470, 360, 6, 4)])
    roads = '<path class="rd" d="M300 0V520M0 250H600M120 80 300 250 480 420M110 430 300 250 500 80"/>'
    dist = "".join(f'<g class="dt"><circle cx="{x}" cy="{y}" r="2.6"/><text x="{x - 7 if n in ("Kungsholmen", "Solna", "Huddinge") else x + 7}" y="{y + 3}" text-anchor="{"end" if n in ("Kungsholmen", "Solna", "Huddinge") else "start"}">{esc(n)}</text></g>' for n, x, y in DISTRICTS)
    pins = ""
    for a in AREAS:
        if a["x"] is None or a["slug"] == "stockholm":
            continue
        lab = u["hq"] if a["kind"] == "hq" else u["office"]
        on = " on" if focus == a["slug"] else ""
        pins += (f'<a class="pin{on} pin-{a["kind"]}" href="{c.link("omraden/" + a["slug"])}" aria-label="{esc(a["name"])} – {esc(lab)}">'
                 f'<circle class="pulse" cx="{a["x"]}" cy="{a["y"]}" r="16"/><circle class="dot" cx="{a["x"]}" cy="{a["y"]}" r="8"/>'
                 f'<text class="pn" x="{a["x"] + 16}" y="{a["y"] - 4}">{esc(a["name"])}</text><text class="pl" x="{a["x"] + 16}" y="{a["y"] + 11}">{esc(lab.upper())}</text></a>')
    return f'''<svg class="smap" viewBox="0 0 600 520" role="img" aria-label="{esc(u['area_title'])}">
  <defs><radialGradient id="eye" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#8fa8ff" stop-opacity=".22"/><stop offset="1" stop-color="#8fa8ff" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" stroke-opacity=".07"/></pattern></defs>
  <rect width="600" height="520" fill="url(#grid)"/>{water}{isles}{roads}
  <g class="scan"><circle cx="300" cy="250" r="230" fill="url(#eye)"/><path d="M300 250 300 20A230 230 0 0 1 462 87Z" class="beam"/></g>
  <circle class="rng" cx="300" cy="250" r="90"/><circle class="rng" cx="300" cy="250" r="170"/>
  {dist}{pins}
  <text class="compass" x="570" y="34" text-anchor="middle">N</text><path class="compass-a" d="M570 40v22M564 48l6-8 6 8"/>
</svg>'''


def sweden_mini(c):
    pts = {"stockholm": (128, 238), "malmo": (52, 352), "goteborg": (34, 270)}
    dots = "".join(f'<a href="{c.link("omraden/" + k)}"><circle cx="{x}" cy="{y}" r="5"/><text x="{x + 9}" y="{y + 4}">{esc(area_name(c, next(a for a in AREAS if a["slug"] == k)))}</text></a>' for k, (x, y) in pts.items())
    # very simplified outline of southern+central Sweden
    return f'''<svg class="swe" viewBox="0 0 200 380" role="img" aria-label="Stockholm · Malmö · Göteborg">
  <path d="M120 4C130 30 150 52 148 86S132 140 140 170 160 214 150 236 124 252 116 274 100 318 84 336 66 368 50 372 40 348 38 330 26 304 18 280 24 252 42 236 58 200 66 160 82 120 96 80 104 40Z"/>
  <path class="ln" d="M128 238 52 352M128 238 34 270"/>{dots}</svg>'''


# ---------------------------------------------------------------- page parts
def svc_tabs(c):
    u = c.u
    tabs = "".join(f'<button class="svx-tab{" on" if i == 0 else ""}" role="tab" aria-selected="{"true" if i == 0 else "false"}" aria-controls="svx-{s["slug"]}" id="svt-{s["slug"]}">'
                   f'<span class="n">0{i + 1}</span><span class="t"><small>{esc(s[c.lang]["tag"])}</small>{esc(s[c.lang]["name"])}</span>{icon("arrow")}</button>' for i, s in enumerate(SERVICES))
    panels = ""
    for i, s in enumerate(SERVICES):
        d = s[c.lang]
        fors = "".join(f'<li>{icon("check")}{esc(x)}</li>' for x in d["for"])
        panels += f'''<article class="svx-p{" on" if i == 0 else ""}" role="tabpanel" id="svx-{s["slug"]}" aria-labelledby="svt-{s["slug"]}">
  <div class="svx-img">{photo(c, s["photo"], s["pos"], d["name"] + " – Swedbevakning")}<span class="svx-ic">{icon(s["icon"])}</span></div>
  <div class="svx-b"><p class="kicker">0{i + 1} · {esc(d["tag"])}</p><h3>{esc(d["name"])}</h3><p>{esc(d["short"])}</p>
  <p class="svx-for">{u["svc_for"]}</p><ul>{fors}</ul>
  <div class="svx-cta"><a class="btn" href="{c.link("tjanster/" + s["slug"])}">{u["read_more"]}{icon("arrow")}</a><a class="lnk" href="{c.link("kontakta")}">{u["quote_for"]}</a></div></div>
</article>'''
    return f'<div class="svx"><div class="svx-tabs" role="tablist">{tabs}</div><div class="svx-panels">{panels}</div></div>'


def process(c):
    return "".join(f'<li><span class="pn">0{i + 1}</span><h3>{esc(h)}</h3><p>{esc(p)}</p></li>' for i, (h, p) in enumerate(c.u["process"]))


def industries(c):
    return "".join(f'<li>{icon(k)}<span>{esc(n)}</span></li>' for k, n in INDUSTRIES[c.lang])


def faq_html(c):
    return "".join(f'<details><summary>{esc(q)}<i></i></summary><p>{esc(a)}</p></details>' for q, a in c.u["faq"])


def faq_ld(c):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in c.u["faq"]]}


def story(c):
    return "".join(f'<li class="st"><b class="st-y">{esc(y)}</b><div><h3>{esc(h)}</h3><p>{esc(p)}</p></div></li>' for y, h, p in c.u["story"])


def facts(c):
    return "".join(f'<li><b>{esc(a)}</b><span>{esc(b)}</span></li>' for a, b in c.u["facts"])


def area_cards(c, exclude=None):
    u = c.u
    out = ""
    for a in AREAS:
        if a["slug"] == exclude:
            continue
        lab = u["hq"] if a["kind"] == "hq" else (u["office"] if a["kind"] == "office" else ("Stockholms län" if a["slug"] == "stockholm" else u["also"] + " " + area_name(c, a)))
        out += f'<a class="acard" href="{c.link("omraden/" + a["slug"])}"><small>{esc(lab)}</small><b>{esc(area_name(c, a))}</b>{icon("arrow")}</a>'
    return out


def contact_section(c, title=None, sub=None, preset="", compact=False):
    u = c.u
    return f'''<section class="sec contact" id="kontakt">
  <div class="wrap contact-g"><div><p class="kicker">{u['contact_kicker']}</p><h2 class="h2 split">{esc(title or u['contact_title'])}</h2><p class="lead">{esc(sub or u['contact_sub'])}</p>{contact_cards(c)}</div>
  {contact_form(c, compact, preset)}</div>
</section>'''


def page_hero(c, kicker, h1, lead, crumbs, img=None, pos="50% 50%"):
    bc = "".join(f'<li><a href="{c.link(s)}">{esc(n)}</a></li>' for s, n in crumbs[:-1]) + f'<li aria-current="page">{esc(crumbs[-1][1])}</li>'
    bg = f'<div class="phero-bg">{photo(c, img, pos, "", lazy=False)}</div>' if img else ""
    return f'''<section class="phero">{bg}
  <svg class="phero-mk" viewBox="0 0 100 100" aria-hidden="true"><use href="#sb-eagle"/></svg>
  <div class="wrap phero-in"><ol class="bc">{bc}</ol><p class="kicker">{esc(kicker)}</p><h1 class="h1 split">{esc(h1)}</h1><p class="lead">{esc(lead)}</p></div>
</section>'''


# ---------------------------------------------------------------- pages
def page_home(c):
    u = c.u
    marquee = "".join(f'<span>{esc(m)}</span>{mark("mq-mk")}' for m in u["marquee"]) * 2
    meta = "".join(f'<li><b>{esc(a)}</b><span>{esc(b)}</span></li>' for a, b in u["hero_meta"])
    words = " ".join(f'<span class="tw">{esc(w)}</span>' for w in u["think_p"].split())
    site_ld = {"@context": "https://schema.org", "@type": "WebSite", "name": "Swedbevakning", "url": BASE, "inLanguage": ["sv", "en"]}
    letters = "".join(f'<tspan>{ch}</tspan>' for ch in "SWEDBEVAKNING")
    offices = "".join(f'<li><a href="{c.link("omraden/" + a["slug"])}"><b>{esc(a["name"])}{" (HK)" if a["kind"] == "hq" else ""}</b><small>{u["hq"] if a["kind"] == "hq" else u["office"]}</small>{icon("arrow")}</a></li>' for a in AREAS if a["kind"] in ("hq", "office"))
    return head(c, u["home_title"], u["home_desc"], "index", [faq_ld(c), site_ld]) + header(c) + f'''
<div class="intro" id="intro" aria-hidden="true">
  <svg class="intro-logo" viewBox="0 0 100 100">
    <defs><clipPath id="ic-fill"><rect class="ic-rect" x="0" y="0" width="100" height="100"/></clipPath><path id="ia" d="M17.5 32Q50 10.5 82.5 30.5" fill="none"/></defs>
    <circle class="il-ring" cx="50" cy="50" r="48.6" pathLength="1"/>
    <g clip-path="url(#ic-fill)"><use class="il-shield" href="#sb-eagle"/></g>
    <path class="il-edge" pathLength="1" d="M14.5 21.5Q50-.5 85.5 21.5L85 44.5C72 41 58 36.5 49 37C41 37.5 32 42.5 26 46.5C23.5 48 23 49.5 25.5 50.8C27 49 30.5 48 34.5 48.3C41 49 47 56 51 66C54.5 75 56.5 85 57.5 93.5L50.5 97C38 89 22 68 17 45C15.5 37 14.6 28 14.5 21.5Z"/>
    <text class="il-text" font-family="Inter Tight,Arial Black,sans-serif" font-weight="900" font-size="6.6" letter-spacing=".3"><textPath href="#ia" startOffset="50%" text-anchor="middle">{letters}</textPath></text>
    <circle class="il-glint" cx="50" cy="42" r="2.2"/>
  </svg>
  <p class="intro-word"><b>SWEDBEVAKNING</b><span>{esc(u["hero_l1"])} {esc(u["hero_l2"])}</span></p>
  <span class="intro-line"></span>
</div>
<main id="main">
<section class="hero" id="hero">
  <div class="hero-bg">{photo(c, "night", "50% 60%", "", lazy=False, cls="hb-dim")}{photo(c, "night", "50% 60%", "", lazy=False, cls="hb-lit")}</div>
  <div class="hero-grid" aria-hidden="true"></div>
  <svg class="hero-mk" viewBox="0 0 100 100" aria-hidden="true"><use href="#sb-eagle"/></svg>
  <div class="hero-in wrap">
    <p class="pill hero-k"><i></i>{esc(u['hero_kicker'])}</p>
    <h1 class="hero-h"><span class="ln"><span>{esc(u['hero_l1'])}</span></span><span class="ln ln2"><span>{esc(u['hero_l2'])}</span></span></h1>
    <p class="hero-sub">{esc(u['hero_sub'])}</p>
    <div class="hero-cta"><a class="btn btn-light" href="{c.link('kontakta')}">{u['cta']}{icon('arrow')}</a><a class="btn btn-ghost" href="{c.link('tjanster')}">{u['nav'][1][1]}</a></div>
    <ul class="hero-meta">{meta}</ul>
  </div>
  <p class="hero-hint" aria-hidden="true"><i></i>{esc(u['hero_hint'])}</p>
  <a class="hero-scroll" href="#tjanster" aria-label="{u['scroll']}"><span>{u['scroll']}</span><i></i></a>
</section>

<div class="marquee" aria-hidden="true"><div class="mq-t">{marquee}</div></div>

<section class="sec svcs" id="tjanster">
  <div class="wrap">
    <div class="sec-h sec-h-row"><div><p class="kicker">{u['svc_kicker']}</p><h2 class="h2 split">{esc(u['svc_title'])}</h2></div><p class="lead">{esc(u['svc_sub'])}</p></div>
    {svc_tabs(c)}
  </div>
</section>

<section class="sec think">
  <div class="wrap think-g">
    <div class="think-t"><p class="kicker">{u['think_kicker']}</p><h2 class="h2 split">{esc(u['think_title'])}</h2><p class="think-p">{words}</p></div>
    <ol class="proc">{process(c)}</ol>
  </div>
</section>

<section class="facts-s"><ul class="facts wrap">{facts(c)}</ul></section>

<section class="story" id="om-oss">
  <div class="story-pin">
    <div class="wrap story-h"><p class="kicker">{u['story_kicker']}</p><h2 class="h2">{esc(u['story_title'])}</h2><p class="lead">{esc(u['story_sub'])}</p></div>
    <ol class="story-track">{story(c)}</ol>
    <div class="story-bar" aria-hidden="true"><i></i></div>
  </div>
</section>

<section class="sec area">
  <div class="wrap area-g">
    <div class="area-t"><p class="kicker">{u['area_kicker']}</p><h2 class="h2 split">{esc(u['area_title'])}</h2><p class="lead">{esc(u['area_sub'])}</p>
      <ul class="offices">{offices}</ul>
      <div class="also"><span>{u['also']}</span><a href="{c.link('omraden/malmo')}">Malmö</a><a href="{c.link('omraden/goteborg')}">{area_name(c, AREAS[5])}</a></div></div>
    <div class="area-r">{stockholm_map(c)}</div>
  </div>
</section>

<section class="sec ind">
  <div class="wrap"><div class="sec-h sec-h-row"><div><p class="kicker">{u['ind_kicker']}</p><h2 class="h2 split">{esc(u['ind_title'])}</h2></div><p class="lead">{esc(u['ind_sub'])}</p></div>
  <ul class="ind-g">{industries(c)}</ul></div>
</section>

<section class="jobs-band">
  <div class="jobs-ph">{photo(c, "guard-car", "70% 35%", "Swedbevakning väktare")}</div>
  <div class="wrap jobs-in"><div><p class="kicker">{u['jobs_kicker']}</p><h2 class="h2">{esc(u['jobs_title'])}</h2><p class="lead">{esc(u['jobs_sub'])}</p></div>
  <a class="btn btn-light" href="{c.link('jobba-hos-oss')}">{u['jobs_cta']}{icon('arrow')}</a></div>
</section>

<section class="sec faq">
  <div class="wrap faq-g"><div class="sec-h"><p class="kicker">{u['faq_kicker']}</p><h2 class="h2 split">{esc(u['faq_title'])}</h2></div>
  <div class="faq-l">{faq_html(c)}</div></div>
</section>
{contact_section(c)}
</main>
''' + footer(c)


def page_services(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("tjanster", u["nav"][1][1])]
    rows = "".join(f'''<a class="srow" href="{c.link('tjanster/' + s['slug'])}"><span class="n">0{i + 1}</span><div class="srow-img">{photo(c, s['photo'], s['pos'], s[c.lang]['name'])}</div>
  <div class="srow-t"><small>{esc(s[c.lang]['tag'])}</small><h2>{esc(s[c.lang]['name'])}</h2><p>{esc(s[c.lang]['short'])}</p></div><span class="srow-a">{icon('arrow')}</span></a>''' for i, s in enumerate(SERVICES))
    return head(c, u["services_page_title"], u["services_page_desc"], "tjanster", [crumbs_ld(c, crumbs), faq_ld(c)]) + header(c) + '<main id="main">' + page_hero(c, u["svc_kicker"], u["services_h"], u["svc_sub"], crumbs, "building", "50% 55%") + f'''
<section class="sec"><div class="wrap srows">{rows}</div></section>
<section class="sec think"><div class="wrap think-g"><div class="think-t"><p class="kicker">{u['think_kicker']}</p><h2 class="h2 split">{esc(u['think_title'])}</h2></div><ol class="proc">{process(c)}</ol></div></section>
<section class="sec ind"><div class="wrap"><div class="sec-h sec-h-row"><div><p class="kicker">{u['ind_kicker']}</p><h2 class="h2 split">{esc(u['ind_title'])}</h2></div><p class="lead">{esc(u['ind_sub'])}</p></div><ul class="ind-g">{industries(c)}</ul></div></section>
<section class="sec faq"><div class="wrap faq-g"><div class="sec-h"><p class="kicker">{u['faq_kicker']}</p><h2 class="h2 split">{esc(u['faq_title'])}</h2></div><div class="faq-l">{faq_html(c)}</div></div></section>
{contact_section(c)}
</main>''' + footer(c)


def page_service(c, s):
    u = c.u
    d = s[c.lang]
    slug = "tjanster/" + s["slug"]
    crumbs = [("index", u["breadcrumb_home"]), ("tjanster", u["nav"][1][1]), (slug, d["name"])]
    svc_ld = {"@context": "https://schema.org", "@type": "Service", "name": d["name"], "serviceType": d["name"], "description": d["desc"],
              "provider": {"@id": BASE + "#org"}, "areaServed": [{"@type": "City", "name": a["name"]} for a in AREAS], "url": c.abs(slug)}
    pts = "".join(f'<li><span class="pn">0{i + 1}</span><div><h3>{esc(a)}</h3><p>{esc(b)}</p></div></li>' for i, (a, b) in enumerate(d["points"]))
    fors = "".join(f'<li>{icon("check")}{esc(x)}</li>' for x in d["for"])
    others = "".join(f'<a class="mini" href="{c.link("tjanster/" + o["slug"])}">{icon(o["icon"])}<small>{esc(o[c.lang]["tag"])}</small><b>{esc(o[c.lang]["name"])}</b></a>' for o in SERVICES if o is not s)
    cities = "".join(f'<a href="{c.link("omraden/" + a["slug"])}">{esc(d["name"])} · {esc(area_name(c, a))}</a>' for a in AREAS)
    return head(c, d["title"], d["desc"], slug, [crumbs_ld(c, crumbs), svc_ld]) + header(c) + '<main id="main">' + page_hero(c, d["tag"], d["name"], d["lead"], crumbs, s["photo"], s["pos"]) + f'''
<section class="sec"><div class="wrap sv-g">
  <div><p class="kicker">{u['svc_page_what']}</p><ol class="pts">{pts}</ol></div>
  <aside class="sv-side"><div class="sv-ph">{photo(c, s['photo'], s['pos'], d['name'] + ' – Swedbevakning', lazy=False)}<span class="svx-ic">{icon(s['icon'])}</span></div>
  <div class="sv-box"><h2 class="h3">{u['svc_for']}</h2><ul class="ticks">{fors}</ul>
  <a class="btn" href="#kontakt">{u['cta']}{icon('arrow')}</a><a class="sv-call" href="tel:{CO['phone_e164']}">{icon('phone')}{CO['phone']}</a></div></aside>
</div></section>
<section class="sec think"><div class="wrap think-g"><div class="think-t"><p class="kicker">{u['think_kicker']}</p><h2 class="h2 split">{esc(u['think_title'])}</h2></div><ol class="proc">{process(c)}</ol></div></section>
{contact_section(c, u['svc_page_cta'].format(name=d['name'].lower()), None, d['name'], True)}
<section class="sec"><div class="wrap"><div class="sec-h"><p class="kicker">{u['svc_page_other']}</p></div><div class="minis">{others}</div><div class="citylinks">{cities}</div></div></section>
</main>''' + footer(c)


def page_areas(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("omraden", u["nav"][2][1])]
    return head(c, u["areas_page_title"], u["areas_page_desc"], "omraden", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["nav"][2][1], u["areas_h"], u["areas_lead"], crumbs, "pano", "50% 60%") + f'''
<section class="sec area"><div class="wrap area-g"><div class="area-t"><p class="kicker">{u['area_kicker']}</p><h2 class="h2 split">{esc(u['area_title'])}</h2><p class="lead">{esc(u['area_sub'])}</p><div class="acards">{area_cards(c)}</div></div>
<div class="area-r">{stockholm_map(c)}</div></div></section>
<section class="sec swe-s"><div class="wrap swe-g"><div>{sweden_mini(c)}</div><div><p class="kicker">{u['also']}</p><h2 class="h2 split">Stockholm · Malmö · {esc(area_name(c, AREAS[5]))}</h2><p class="lead">{esc(UI[c.lang]['faq'][1][1])}</p></div></div></section>
{contact_section(c)}
</main>''' + footer(c)


def page_area(c, a):
    u = c.u
    d = a[c.lang]
    slug = "omraden/" + a["slug"]
    nm = area_name(c, a)
    crumbs = [("index", u["breadcrumb_home"]), ("omraden", u["nav"][2][1]), (slug, nm)]
    ld = {"@context": "https://schema.org", "@type": "Service", "name": d["h1"], "serviceType": "Security services", "provider": {"@id": BASE + "#org"},
          "areaServed": {"@type": "City", "name": a["name"]}, "url": c.abs(slug), "description": d["desc"]}
    svcs = "".join(f'<a class="mini" href="{c.link("tjanster/" + s["slug"])}">{icon(s["icon"])}<small>{esc(s[c.lang]["tag"])}</small><b>{esc(s[c.lang]["name"])}</b><span>{esc(s[c.lang]["short"])}</span></a>' for s in SERVICES)
    visual = stockholm_map(c, a["slug"]) if a["x"] is not None or a["slug"] == "stockholm" else sweden_mini(c)
    img = {"stockholm": "pano", "malmo": "street", "goteborg": "event"}.get(a["slug"], "building")
    return head(c, d["title"], d["desc"], slug, [crumbs_ld(c, crumbs), ld]) + header(c) + '<main id="main">' + page_hero(c, u["area_kicker"] if a["x"] is not None else u["also"] + " " + nm, d["h1"], d["lead"], crumbs, img, "50% 55%") + f'''
<section class="sec area"><div class="wrap area-g"><div class="area-t"><p class="kicker">Swedbevakning · {esc(nm)}</p><h2 class="h2 split">{esc(u['area_svcs'].format(name=nm))}</h2><p class="lead">{esc(d['body'])}</p>
<ul class="ticks">{"".join(f'<li>{icon("check")}<span><b>{esc(f[0])}</b> · {esc(f[1])}</span></li>' for f in u['facts'])}</ul></div><div class="area-r">{visual}</div></div></section>
<section class="sec"><div class="wrap"><div class="minis minis-l">{svcs}</div></div></section>
{contact_section(c)}
<section class="sec"><div class="wrap"><div class="sec-h"><p class="kicker">{u['areas_all']}</p></div><div class="acards acards-row">{area_cards(c, a['slug'])}</div></div></section>
</main>''' + footer(c)


def page_about(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("om-oss", u["nav"][3][1])]
    words = " ".join(f'<span class="tw">{esc(w)}</span>' for w in u["think_p"].split())
    return head(c, u["about_title"], u["about_desc"], "om-oss", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["story_kicker"], u["about_h"], u["about_lead"], crumbs, "pano", "50% 60%") + f'''
<section class="facts-s"><ul class="facts wrap">{facts(c)}</ul></section>
<section class="sec think"><div class="wrap think-g"><div class="think-t"><p class="kicker">{u['think_kicker']}</p><h2 class="h2 split">{esc(u['think_title'])}</h2><p class="think-p">{words}</p></div>
<div class="ab-ph">{photo(c, 'guard-car', '70% 35%', 'Swedbevakning')}</div></div></section>
<section class="sec"><div class="wrap"><div class="sec-h"><p class="kicker">{u['story_kicker']}</p><h2 class="h2 split">{esc(u['story_title'])}</h2></div><ol class="vstory">{story(c)}</ol></div></section>
<section class="sec think"><div class="wrap think-g"><div class="think-t"><p class="kicker">{u['process'][0][0]} → {u['process'][-1][0]}</p><h2 class="h2 split">{esc(u['svc_title'])}</h2></div><ol class="proc">{process(c)}</ol></div></section>
{contact_section(c)}
</main>''' + footer(c)


def page_jobs(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("jobba-hos-oss", u["nav"][4][1])]
    what = "".join(f'<li>{icon("check")}{esc(x)}</li>' for x in u["jobs_what"])
    how = "".join(f'<li><span class="pn">0{i + 1}</span><p>{esc(x)}</p></li>' for i, x in enumerate(u["jobs_how"]))
    subj = "Ans%C3%B6kan%20%E2%80%93%20Swedbevakning" if c.lang == "sv" else "Application%20%E2%80%93%20Swedbevakning"
    return head(c, u["jobs_title_page"], u["jobs_desc_page"], "jobba-hos-oss", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["jobs_kicker"], u["jobs_h"], u["jobs_lead"], crumbs, "guard-car", "70% 35%") + f'''
<section class="sec"><div class="wrap jb-g">
  <div class="jb-c"><h2 class="h3">{u['jobs_what_h']}</h2><ul class="ticks">{what}</ul></div>
  <div class="jb-c"><h2 class="h3">{u['jobs_how_h']}</h2><ol class="how">{how}</ol></div>
</div></section>
<section class="jobs-band"><div class="jobs-ph">{photo(c, "event", "50% 45%", "")}</div><div class="wrap jobs-in"><div><h2 class="h2">{esc(u['jobs_title'])}</h2><p class="lead">{esc(u['jobs_sub'])}</p></div>
<a class="btn btn-light" href="mailto:{CO['jobs']}?subject={subj}">{icon('mail')}{u['jobs_apply_btn']}</a></div></section>
</main>''' + footer(c)


def page_contact(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("kontakta", u["nav"][-1][1])]
    return head(c, u["contact_title_page"], u["contact_desc_page"], "kontakta", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["nav"][-1][1], u["contact_h"], u["contact_lead"], crumbs) + f'''
<section class="sec contact"><div class="wrap contact-g"><div>{contact_cards(c)}<p class="jobs-note">{icon('mail')}<span>{esc(u['jobs_kicker'])}: <a href="mailto:{CO['jobs']}">{CO['jobs']}</a></span></p></div>{contact_form(c)}</div></section>
<section class="sec area"><div class="wrap area-g"><div class="area-t"><p class="kicker">{u['area_kicker']}</p><h2 class="h2 split">{esc(u['area_title'])}</h2><div class="acards">{area_cards(c)}</div></div><div class="area-r">{stockholm_map(c, 'enskede')}</div></div></section>
</main>''' + footer(c)


def page_404(c):
    u = c.u
    return head(c, "404 | Swedbevakning", u["notfound"], "404", noindex=True) + header(c) + f'''<main id="main"><section class="phero p404"><svg class="phero-mk" viewBox="0 0 100 100" aria-hidden="true"><use href="#sb-eagle"/></svg><div class="wrap phero-in"><p class="kicker">404</p><h1 class="h1">{u['notfound']}</h1><p class="lead"><a class="btn btn-light" href="{c.link('index')}">{u['back_home']}{icon('arrow')}</a></p></div></section></main>''' + footer(c)


# ---------------------------------------------------------------- write
def write(lang, slug, htmlstr):
    p = os.path.join(OUT, *(["en"] if lang == "en" else []), *([] if slug == "index" else slug.split("/")), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(htmlstr)


def main():
    if PROD:
        if os.path.isdir(OUT):
            shutil.rmtree(OUT)
        shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(OUT, "assets"))
        shutil.copy(os.path.join(ROOT, "contact.php"), OUT)
    urls = []
    for lang in ("sv", "en"):
        pages = [("index", page_home), ("tjanster", page_services), ("omraden", page_areas), ("om-oss", page_about), ("jobba-hos-oss", page_jobs), ("kontakta", page_contact)]
        for slug, fn in pages:
            write(lang, slug, fn(Ctx(lang, slug)))
            urls.append((Ctx(lang, slug), slug))
        for s in SERVICES:
            slug = "tjanster/" + s["slug"]
            write(lang, slug, page_service(Ctx(lang, slug), s))
            urls.append((Ctx(lang, slug), slug))
        for a in AREAS:
            slug = "omraden/" + a["slug"]
            write(lang, slug, page_area(Ctx(lang, slug), a))
            urls.append((Ctx(lang, slug), slug))
    c = Ctx("sv", "404")
    c.depth = 0
    prefix = "/" if PROD else "/swedbevakning/"
    open(os.path.join(OUT, "404.html"), "w", encoding="utf-8").write(
        page_404(c).replace('href="assets/', f'href="{prefix}assets/').replace('src="assets/', f'src="{prefix}assets/').replace('href="./"', f'href="{prefix}"').replace('href="en/', f'href="{prefix}en/').replace('href="tjanster/', f'href="{prefix}tjanster/').replace('href="omraden/', f'href="{prefix}omraden/').replace('href="om-oss/', f'href="{prefix}om-oss/').replace('href="jobba-hos-oss/', f'href="{prefix}jobba-hos-oss/').replace('href="kontakta/', f'href="{prefix}kontakta/').replace('action="contact.php"', f'action="{prefix}contact.php"'))
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for cx, slug in urls:
        pr = "1.0" if slug == "index" else ("0.9" if slug.startswith(("tjanster", "omraden")) else "0.7")
        sm.append(f'<url><loc>{cx.abs(slug)}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority>'
                  f'<xhtml:link rel="alternate" hreflang="sv" href="{cx.abs(slug, "sv")}"/><xhtml:link rel="alternate" hreflang="en" href="{cx.abs(slug, "en")}"/></url>')
    sm.append("</urlset>")
    open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm))
    robots = f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n" if PROD else "User-agent: *\nDisallow: /\n"
    open(os.path.join(OUT, "robots.txt"), "w").write(robots)
    if PROD:
        # old Lovable URLs -> new
        open(os.path.join(OUT, ".htaccess"), "w").write(
            "Options -Indexes\nErrorDocument 404 /404.html\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n"
            "RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]\nRewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]\n"
            "RewriteRule ^kontakta$ /kontakta/ [L,R=301]\nRewriteRule ^tjanster$ /tjanster/ [L,R=301]\n"
            "<IfModule mod_expires.c>\nExpiresActive On\nExpiresByType image/webp \"access plus 1 year\"\nExpiresByType text/css \"access plus 1 month\"\nExpiresByType application/javascript \"access plus 1 month\"\n</IfModule>\n")
    print("built", len(urls), "pages", "PROD" if PROD else "preview")


if __name__ == "__main__":
    main()
