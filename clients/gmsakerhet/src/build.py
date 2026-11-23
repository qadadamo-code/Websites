# -*- coding: utf-8 -*-
"""Static site generator for GMS Säkerhet. Run: python3 src/build.py
Swedish at the root, English under /en/. Same slugs in both languages."""
import os, html, json, math, datetime
from content import CO, SERVICES, UI, PLACES, FIELD

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "2"
BASE = CO["base"]
TODAY = datetime.date.today().isoformat()


def esc(s):
    return html.escape(s, quote=True)


class Ctx:
    def __init__(self, lang, slug):
        self.lang, self.slug = lang, slug
        self.depth = (0 if slug == "index" else slug.count("/") + 1) + (1 if lang == "en" else 0)
        self.u = UI[lang]

    def rel(self, path):
        """relative link from current page to site-root path (e.g. 'assets/x.css')"""
        return "../" * self.depth + path

    def link(self, slug, lang=None):
        lang = lang or self.lang
        p = ("en/" if lang == "en" else "") + ("" if slug == "index" else slug + "/")
        return self.rel(p) if p else (self.rel("") or "./")

    def abs(self, slug, lang=None):
        lang = lang or self.lang
        return BASE + ("en/" if lang == "en" else "") + ("" if slug == "index" else slug + "/")


ICONS = {
    "guard": '<path d="M24 5 9 11v11c0 9.6 6.4 17.6 15 20 8.6-2.4 15-10.4 15-20V11L24 5Z"/><circle cx="24" cy="20" r="5"/><path d="M15.5 33c1.8-4.2 5-6.3 8.5-6.3s6.7 2.1 8.5 6.3"/>',
    "badge": '<path d="m24 4 4.6 4.3 6.2-.6 1.6 6 5.4 3.2-2.3 5.8 2.3 5.8-5.4 3.2-1.6 6-6.2-.6L24 41.4l-4.6-4.3-6.2.6-1.6-6-5.4-3.2 2.3-5.8-2.3-5.8 5.4-3.2 1.6-6 6.2.6Z"/><path d="m17.5 22.6 4.4 4.4 8.6-8.6"/>',
    "heart": '<path d="M24 40S7 30.5 7 18.6C7 13.3 11 9 16 9c3.4 0 6.3 2 8 4.8C25.7 11 28.6 9 32 9c5 0 9 4.3 9 9.6C41 30.5 24 40 24 40Z"/><path d="M14 22h6l2.5-4.5 4 9L29 22h5"/>',
    "event": '<path d="M6 40h36"/><path d="M10 40V24l14-9 14 9v16"/><path d="M19 40v-8h10v8"/><path d="M24 15V6l7 2.5L24 11"/>',
    "parking": '<rect x="7" y="7" width="34" height="34" rx="8"/><path d="M19 34V14h7a6 6 0 0 1 0 12h-7"/>',
    "alarm": '<path d="M24 41a4 4 0 0 0 4-4h-8a4 4 0 0 0 4 4Z"/><path d="M12 33h24l-3-5V20a9 9 0 0 0-18 0v8l-3 5Z"/><path d="M6 15c1-4 3-7 6-9M42 15c-1-4-3-7-6-9"/>',
    "phone": '<path d="M14.6 6h-5A3.6 3.6 0 0 0 6 9.8C6.9 27 21 41.1 38.2 42a3.6 3.6 0 0 0 3.8-3.6v-5l-8.6-3.4-4 4A27 27 0 0 1 14 18.6l4-4L14.6 6Z"/>',
    "mail": '<rect x="5" y="10" width="38" height="28" rx="5"/><path d="m7 13 17 13 17-13"/>',
    "pin": '<path d="M24 43s14-12.6 14-24a14 14 0 0 0-28 0c0 11.4 14 24 14 24Z"/><circle cx="24" cy="19" r="5"/>',
    "clock": '<circle cx="24" cy="24" r="18"/><path d="M24 13v11l7 5"/>',
    "arrow": '<path d="M10 24h28M28 14l10 10-10 10"/>',
    "check": '<path d="m10 25 9 9 19-19"/>',
    "ig": '<rect x="7" y="7" width="34" height="34" rx="10"/><circle cx="24" cy="24" r="8"/><circle cx="34.5" cy="13.5" r="1.6" fill="currentColor"/>',
    "fb": '<path d="M27 42V26h5.5l1-6.5H27v-4c0-1.9.9-3.5 3.6-3.5H34V6.4A40 40 0 0 0 29 6c-5 0-8.5 3-8.5 8.7v4.8H15V26h5.5v16"/>',
}


def photo(c, name, pos="50% 50%", alt="", lazy=True, cls=""):
    return f'<img{" class=\"" + cls + "\"" if cls else ""} src="{c.rel("assets/photos/" + name + ".webp")}" alt="{esc(alt)}" style="object-position:{pos}"{" loading=\"lazy\"" if lazy else ""} decoding="async">'


def icon(name, cls="ic"):
    return f'<svg class="{cls}" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g></svg>'


LOGO_SVG = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo.svg"), encoding="utf-8").read()


def logo(c, cls="logo"):
    return f'<svg class="{cls}" viewBox="0 0 230 60" role="img" aria-label="GMS Säkerhet"><use href="#gms-logo"/></svg>'


# ---------------------------------------------------------------- layout
def head(c, title, desc, slug, extra_ld=None, noindex=False):
    alt = "en" if c.lang == "sv" else "sv"
    ld = [org_ld(c)]
    if extra_ld:
        ld += extra_ld
    lds = "\n".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    return f'''<!doctype html>
<html lang="{c.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
{'<meta name="robots" content="noindex">' if noindex else '<meta name="robots" content="index,follow,max-image-preview:large">'}
<link rel="canonical" href="{c.abs(slug)}">
<link rel="alternate" hreflang="sv" href="{c.abs(slug, 'sv')}">
<link rel="alternate" hreflang="en" href="{c.abs(slug, 'en')}">
<link rel="alternate" hreflang="x-default" href="{c.abs(slug, 'sv')}">
<meta name="theme-color" content="#0b0b0c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GMS Säkerhet">
<meta property="og:locale" content="{'sv_SE' if c.lang == 'sv' else 'en_GB'}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{c.abs(slug)}">
<meta property="og:image" content="{BASE}assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="SE-AC"><meta name="geo.placename" content="Umeå"><meta name="geo.position" content="{CO['lat']};{CO['lng']}"><meta name="ICBM" content="{CO['lat']}, {CO['lng']}">
<link rel="icon" href="{c.rel('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="{c.rel('assets/img/apple-touch-icon.png')}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{c.rel('assets/css/site.css')}?v={V}">
{lds}
</head>
'''


def org_ld(c):
    return {
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "SecurityService"] if False else "LocalBusiness",
        "@id": BASE + "#org",
        "name": CO["name"],
        "alternateName": ["GMS Säkerhet", "GMS AB", "Green Multikonsult & Säkerhet"],
        "description": UI[c.lang]["home_desc"],
        "url": BASE,
        "logo": BASE + "assets/img/logo.png",
        "image": BASE + "assets/img/og.jpg",
        "telephone": CO["phone_e164"],
        "email": CO["email"],
        "foundingDate": CO["founded"],
        "vatID": "SE559405398401",
        "taxID": CO["orgnr"],
        "priceRange": "$$",
        "address": {"@type": "PostalAddress", "streetAddress": CO["street"], "postalCode": CO["zip"].replace(" ", ""),
                    "addressLocality": CO["city"], "addressRegion": CO["region"], "addressCountry": "SE"},
        "geo": {"@type": "GeoCoordinates", "latitude": CO["lat"], "longitude": CO["lng"]},
        "areaServed": [{"@type": "City", "name": n} for n in ["Umeå", "Holmsund", "Sävar", "Vännäs", "Hörnefors", "Robertsfors", "Nordmaling", "Vindeln"]] + [{"@type": "AdministrativeArea", "name": "Västerbottens län"}],
        "openingHoursSpecification": {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "00:00", "closes": "23:59"},
        "sameAs": [CO["instagram"], CO["facebook"], "https://gmsakerhet.com/"],
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
    nav = "".join(
        f'<a href="{c.link(s)}"{" aria-current=\"page\"" if s == cur else ""}>{esc(n)}</a>' for s, n in u["nav"][1:])
    return f'''<body class="pg-{cur}">
<a class="skip" href="#main">{u["skip"]}</a>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{LOGO_SVG}</defs></svg>
<header class="hdr" id="hdr">
  <a class="hdr-logo" href="{c.link('index')}" aria-label="GMS Säkerhet – {u['nav'][0][1]}">{logo(c)}</a>
  <nav class="hdr-nav" aria-label="Main">{nav}</nav>
  <div class="hdr-end">
    <span class="duty" aria-live="off"><i></i><b class="duty-l">{u["on_duty"]}</b><span class="duty-t" data-clock>--:--</span></span>
    <a class="lang" href="{c.link(c.slug, alt)}" hreflang="{alt}" lang="{alt}">{"EN" if alt == "en" else "SV"}</a>
    <a class="btn btn-sm" href="{c.link('kontakt')}">{u["cta"]}</a>
    <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
</header>
<div class="mnav" id="mnav" hidden>
  <nav>{"".join(f'<a href="{c.link(s)}">{esc(n)}</a>' for s, n in u["nav"])}</nav>
  <div class="mnav-foot"><a href="tel:{CO['phone_e164']}">{icon('phone')}{CO['phone']}</a><a href="mailto:{CO['email']}">{icon('mail')}{CO['email']}</a><a class="lang" href="{c.link(c.slug, alt)}" hreflang="{alt}">{UI[alt]['lang_name']}</a></div>
</div>
'''


def footer(c):
    u = c.u
    svc = "".join(f'<li><a href="{c.link("tjanster/" + s["slug"])}">{esc(s[c.lang]["name"])}</a></li>' for s in SERVICES)
    nav = "".join(f'<li><a href="{c.link(s)}">{esc(n)}</a></li>' for s, n in u["nav"])
    return f'''<footer class="ftr">
  <div class="ftr-cta wrap">
    <p class="ftr-big">{esc(u["contact_title"])}</p>
    <div class="ftr-cta-b"><a class="btn" href="{c.link('kontakt')}">{u["cta"]}{icon('arrow')}</a><a class="btn btn-ghost" href="tel:{CO['phone_e164']}">{icon('phone')}{CO['phone']}</a></div>
  </div>
  <div class="ftr-grid wrap">
    <div class="ftr-brand">{logo(c)}<p>{esc(u["footer_tag"])}</p>
      <div class="soc"><a href="{CO['instagram']}" rel="noopener" target="_blank" aria-label="Instagram">{icon('ig')}</a><a href="{CO['facebook']}" rel="noopener" target="_blank" aria-label="Facebook">{icon('fb')}</a></div></div>
    <div><h3>{u["nav"][1][1]}</h3><ul>{svc}</ul></div>
    <div><h3>GMS</h3><ul>{nav}</ul></div>
    <div><h3>{u["nav"][4][1]}</h3>
      <address>{CO['street']}<br>{CO['zip']} {CO['city']}</address>
      <p><a href="tel:{CO['phone_e164']}">{CO['phone']}</a><br><a href="mailto:{CO['email']}">{CO['email']}</a></p>
      <p class="muted">{u["hours"]}: {u["hours_v"]}</p></div>
  </div>
  <div class="ftr-bot wrap"><span>© {datetime.date.today().year} {esc(CO['name'])}. {u["rights"]}</span><span>{u["orgnr"]} {CO['orgnr']}</span></div>
</footer>
<a class="fab" href="tel:{CO['phone_e164']}" aria-label="{u['call']}">{icon('phone')}</a>
<script src="{c.rel('assets/js/vendor/gsap.min.js')}" defer></script>
<script src="{c.rel('assets/js/vendor/ScrollTrigger.min.js')}" defer></script>
<script src="{c.rel('assets/js/vendor/lenis.min.js')}" defer></script>
<script src="{c.rel('assets/js/site.js')}?v={V}" defer></script>
</body>
</html>
'''


def contact_form(c, compact=False):
    u = c.u
    opts = "".join(f'<option value="{esc(s[c.lang]["name"])}">{esc(s[c.lang]["name"])}</option>' for s in SERVICES)
    return f'''<form class="cform" action="{c.rel('contact.php')}" method="post" data-ok="{esc(u['f_ok'])}" data-err="{esc(u['f_err'])}">
  <input type="hidden" name="lang" value="{c.lang}">
  <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
  <div class="frow"><label class="fld"><span>{u['f_name']}</span><input name="name" required autocomplete="name"></label>
  <label class="fld"><span>{u['f_company']}</span><input name="company" autocomplete="organization"></label></div>
  <div class="frow"><label class="fld"><span>{u['f_email']}</span><input type="email" name="email" required autocomplete="email"></label>
  <label class="fld"><span>{u['f_phone']}</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel"></label></div>
  <label class="fld"><span>{u['f_service']}</span><select name="service"><option value="">{u['f_service_any']}</option>{opts}</select></label>
  <label class="fld"><span>{u['f_msg']}</span><textarea name="message" rows="{3 if compact else 5}" required></textarea></label>
  <label class="chk"><input type="checkbox" name="callback" value="1"><i></i>{u['f_callback']}</label>
  <div class="fsend"><button class="btn" type="submit">{u['f_send']}{icon('arrow')}</button><small>{u['f_privacy']}</small></div>
  <p class="fmsg" role="status" aria-live="polite"></p>
</form>'''


def contact_cards(c):
    u = c.u
    maps = "https://www.google.com/maps/search/?api=1&query=" + "Nygatan+22,+903+27+Ume%C3%A5"
    return f'''<ul class="ccards">
  <li><a href="tel:{CO['phone_e164']}">{icon('phone')}<small>{u['phone']}</small><b>{CO['phone']}</b></a></li>
  <li><a href="mailto:{CO['email']}">{icon('mail')}<small>{u['email']}</small><b>{CO['email']}</b></a></li>
  <li><a href="{maps}" target="_blank" rel="noopener">{icon('pin')}<small>{u['address']}</small><b>{CO['street']}, {CO['zip']} {CO['city']}</b></a></li>
  <li><div>{icon('clock')}<small>{u['hours']}</small><b>{u['hours_v']}</b></div></li>
</ul>'''


def radar(c):
    pts = []
    R = 230  # px for 60km
    for name, km, brg in PLACES:
        r = km / 60 * R
        x = 260 + r * math.sin(math.radians(brg))
        y = 260 - r * math.cos(math.radians(brg))
        anchor = "end" if x < 260 else "start"
        dx = -12 if x < 260 else 12
        pts.append(f'<g class="rp" style="--d:{brg / 360:.2f}"><circle cx="{x:.1f}" cy="{y:.1f}" r="4"/><text x="{x + dx:.1f}" y="{y + 4:.1f}" text-anchor="{anchor}">{name}</text></g>')
    rings = "".join(f'<circle cx="260" cy="260" r="{k / 60 * R:.1f}"/><text class="rk" x="{260 + 4}" y="{260 - k / 60 * R - 6:.1f}">{k} km</text>' for k in (15, 30, 45, 60))
    # stylised coastline (Gulf of Bothnia to the south-east)
    coast = "M60,520 C120,470 170,440 205,400 S250,340 300,330 S360,300 380,260 S430,190 470,150 S510,90 520,60"
    return f'''<svg class="radar" viewBox="0 0 520 520" role="img" aria-label="Umeå & Västerbotten">
  <defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--brand)" stop-opacity=".18"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></radialGradient>
  <linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--brand)" stop-opacity="0"/><stop offset="1" stop-color="var(--brand)" stop-opacity=".55"/></linearGradient>
  <clipPath id="rc"><circle cx="260" cy="260" r="232"/></clipPath></defs>
  <g clip-path="url(#rc)"><path class="sea" d="{coast} L520,520 Z"/><path class="coast" d="{coast}"/><text class="sea-l" x="430" y="420">Bottenviken</text></g>
  <circle cx="260" cy="260" r="232" fill="url(#rg)"/>
  <g class="rings">{rings}</g>
  <path class="cross" d="M260 28v464M28 260h464"/>
  <g class="sweep"><path d="M260 260 L260 28 A232 232 0 0 1 424 96 Z" fill="url(#sw)" transform="rotate(-45 260 260)"/></g>
  {''.join(pts)}
  <g class="hq"><circle class="pulse" cx="260" cy="260" r="10"/><circle cx="260" cy="260" r="7"/><text x="276" y="252">Umeå · GMS</text></g>
</svg>'''


# ---------------------------------------------------------------- pages
def page_home(c):
    u = c.u
    svc_cards = "".join(f'''<a class="svc" href="{c.link('tjanster/' + s['slug'])}" data-i="{i + 1:02d}">
  <span class="svc-n">{i + 1:02d}</span><div class="svc-img">{photo(c, s['photo'], s['pos'], s[c.lang]['name'] + ' – GMS Umeå')}</div>{icon(s['icon'], 'ic svc-ic')}
  <h3>{esc(s[c.lang]['name'])}</h3><p class="svc-k">{esc(s[c.lang]['kicker'])}</p><p>{esc(s[c.lang]['short'])}</p>
  <span class="svc-more">{u['read_more']}{icon('arrow')}</span></a>''' for i, s in enumerate(SERVICES))
    shift = "".join(f'<li class="sh" data-t="{t}"><time>{t}</time><h3>{esc(h)}</h3><p>{esc(p)}</p></li>' for t, h, p in u["shift"])
    ticks = "".join(f'<line x1="200" y1="{14 if h % 6 == 0 else 22}" x2="200" y2="34" transform="rotate({h * 15} 200 200)" class="{"tk tk-b" if h % 6 == 0 else "tk"}"/>' for h in range(24))
    nums = "".join(f'<text x="{200 + 150 * math.sin(math.radians(h * 15)):.1f}" y="{200 - 150 * math.cos(math.radians(h * 15)) + 5:.1f}" text-anchor="middle">{h:02d}</text>' for h in range(0, 24, 3))
    facts = "".join(f'<li><b data-count>{esc(a)}</b><span>{esc(b)}</span></li>' for a, b in u["facts"])
    values = "".join(f'<li class="val"><span class="val-n">0{i + 1}</span><h3>{esc(h)}</h3><p>{esc(p)}</p></li>' for i, (h, p) in enumerate(u["values"]))
    proc = "".join(f'<li><span>{i + 1}</span><h3>{esc(h)}</h3><p>{esc(p)}</p></li>' for i, (h, p) in enumerate(u["process"]))
    faq = "".join(f'<details><summary>{esc(q)}<i></i></summary><p>{esc(a)}</p></details>' for q, a in u["faq"])
    marquee = "".join(f'<span>{esc(m)}</span><i>✦</i>' for m in u["marquee"]) * 2
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in u["faq"]]}
    site_ld = {"@context": "https://schema.org", "@type": "WebSite", "name": "GMS Säkerhet", "url": BASE, "inLanguage": ["sv", "en"]}
    li = 0 if c.lang == "sv" else 1
    field = "".join(f'<figure class="fcard">{photo(c, n, pos, cap[li] + " – GMS Säkerhet Umeå")}<figcaption><small>{esc(cat[li])}</small>{esc(cap[li])}</figcaption></figure>' for n, pos, cat, cap in FIELD)
    return head(c, u["home_title"], u["home_desc"], "index", [faq_ld, site_ld]) + header(c) + f'''
<div class="intro" id="intro" aria-hidden="true">
  <svg class="intro-ring" viewBox="0 0 400 400"><circle class="ir1" cx="200" cy="200" r="180"/><circle class="ir2" cx="200" cy="200" r="150"/><g class="ir-ticks">{ticks}</g></svg>
  <svg class="intro-logo" viewBox="0 0 240 270">
    <defs><mask id="io-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="112"><rect width="100" height="112" fill="#fff"/><path class="io-band" d="M58 8 8 58" stroke="#000" stroke-width="6.5"/><path class="io-band" d="M76 10 10 76" stroke="#000" stroke-width="6.5"/></mask></defs>
    <g transform="translate(70 6)"><path class="io-outer" pathLength="1" d="M50 5C40 10 26 13 12 14v32c0 26 16 46 38 58 22-12 38-32 38-58V14C74 13 60 10 50 5Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>
    <path class="io-inner" d="M50 19c-8 4-18 6.5-27 7.5V47c0 19 11 35 27 44 16-9 27-25 27-44V26.5C68 25.5 58 23 50 19Z" fill="currentColor" mask="url(#io-cut)"/>
    <rect class="io-base" x="32" y="120" width="36" height="5" rx="2.5" fill="currentColor"/></g>
    <text class="io-gms" x="124" y="200" text-anchor="middle" font-family="Inter Tight,Arial,sans-serif" font-weight="700" font-size="54" letter-spacing="16"><tspan>G</tspan><tspan>M</tspan><tspan>S</tspan></text>
    <text class="io-sub" x="122" y="236" text-anchor="middle" font-family="Inter Tight,Arial,sans-serif" font-weight="600" font-size="14" letter-spacing="9">SÄKERHET · UMEÅ</text>
  </svg>
  <span class="intro-scan"></span>
</div>
<main id="main">
<section class="hero" id="hero">
  <canvas class="hero-city" id="city" aria-hidden="true"></canvas>
  <div class="hero-beam" aria-hidden="true"></div>
  <div class="hero-in wrap">
    <p class="kicker hero-k">{esc(u['hero_kicker'])}</p>
    <h1 class="hero-h"><span class="ln"><span>{esc(u['hero_l1'])}</span></span><span class="ln ln2"><span>{esc(u['hero_l2'])}</span></span></h1>
    <p class="hero-sub">{esc(u['hero_sub'])}</p>
    <div class="hero-cta"><a class="btn" href="{c.link('kontakt')}">{u['cta']}{icon('arrow')}</a><a class="btn btn-ghost" href="tel:{CO['phone_e164']}">{icon('phone')}{CO['phone']}</a></div>
  </div>
  <div class="hero-side" aria-hidden="true">
    <svg class="dial" viewBox="0 0 400 400"><circle class="d0" cx="200" cy="200" r="190"/><circle class="d1" cx="200" cy="200" r="170"/>{ticks}<g class="dnum">{nums}</g><line class="hand" x1="200" y1="200" x2="200" y2="60"/><circle cx="200" cy="200" r="6" class="hub"/></svg>
    <p class="dial-l"><span>{u['local_time']}</span><b data-clock>--:--</b></p>
  </div>
  <p class="hero-hint" aria-hidden="true"><i></i>{esc(u['hero_hint'])}</p>
  <a class="hero-scroll" href="#tjanster" aria-label="{u['scroll']}"><span>{u['scroll']}</span><i></i></a>
</section>

<div class="marquee" aria-hidden="true"><div class="mq-t">{marquee}</div></div>

<section class="sec svcs" id="tjanster">
  <div class="wrap">
    <div class="sec-h"><p class="kicker">{u['svc_kicker']}</p><h2 class="h2 split">{esc(u['svc_title'])}</h2><p class="lead">{esc(u['svc_sub'])}</p></div>
    <div class="svc-grid">{svc_cards}</div>
  </div>
</section>

<section class="field" aria-label="{esc(u['field_kicker'])}">
  <div class="wrap"><div class="sec-h"><p class="kicker">{u['field_kicker']}</p><h2 class="h2 split">{esc(u['field_title'])}</h2><p class="lead">{esc(u['field_sub'])}</p></div></div>
  <div class="field-track">{field}</div>
</section>
<div class="tape" aria-hidden="true"></div>

<section class="shift" id="natt">
  <div class="shift-pin">
    <div class="shift-l wrap">
      <div class="shift-h"><p class="kicker">{u['shift_kicker']}</p><h2 class="h2">{esc(u['shift_title'])}</h2><p class="lead">{esc(u['shift_sub'])}</p></div>
      <div class="shift-dial" aria-hidden="true">
        <svg viewBox="0 0 400 400"><circle class="d1" cx="200" cy="200" r="170"/><circle class="sd-arc" cx="200" cy="200" r="182" pathLength="1"/>{ticks}<g class="dnum">{nums}</g><line class="hand sd-hand" x1="200" y1="200" x2="200" y2="48"/><circle cx="200" cy="200" r="6" class="hub"/></svg>
        <b class="sd-time">18:00</b>
      </div>
      <ol class="sh-list">{shift}</ol>
    </div>
  </div>
</section>

<section class="facts-s"><ul class="facts wrap">{facts}</ul></section>

<section class="sec area">
  <div class="wrap area-g">
    <div class="area-t"><p class="kicker">{u['area_kicker']}</p><h2 class="h2 split">{esc(u['area_title'])}</h2><p class="lead">{esc(u['area_sub'])}</p>
      <ul class="towns">{''.join(f'<li>{p[0]}</li>' for p in PLACES)}</ul></div>
    <div class="area-r">{radar(c)}</div>
  </div>
</section>

<section class="sec values">
  <div class="wrap"><div class="sec-h"><p class="kicker">{u['values_kicker']}</p><h2 class="h2 split">{esc(u['values_title'])}</h2></div>
  <ol class="val-list">{values}</ol></div>
</section>

<section class="sec proc">
  <div class="wrap"><div class="sec-h"><p class="kicker">{u['process_kicker']}</p><h2 class="h2 split">{esc(u['process_title'])}</h2></div>
  <ol class="proc-list">{proc}</ol></div>
</section>

<section class="jobs-band">
  <div class="wrap jobs-in"><div><p class="kicker">{u['jobs_kicker']}</p><h2 class="h2">{esc(u['jobs_title'])}</h2><p class="lead">{esc(u['jobs_sub'])}</p></div>
  <a class="btn" href="{c.link('jobba-hos-oss')}">{u['jobs_cta']}{icon('arrow')}</a></div>
</section>

<section class="sec faq">
  <div class="wrap faq-g"><div class="sec-h"><p class="kicker">{u['faq_kicker']}</p><h2 class="h2 split">{esc(u['faq_title'])}</h2></div>
  <div class="faq-l">{faq}</div></div>
</section>

<section class="sec contact" id="kontakt">
  <div class="wrap contact-g"><div><p class="kicker">{u['contact_kicker']}</p><h2 class="h2 split">{esc(u['contact_title'])}</h2><p class="lead">{esc(u['contact_sub'])}</p>{contact_cards(c)}</div>
  {contact_form(c)}</div>
</section>
</main>
''' + footer(c)


def page_hero(c, kicker, h1, lead, crumbs):
    u = c.u
    bc = "".join(f'<li><a href="{c.link(s)}">{esc(n)}</a></li>' for s, n in crumbs[:-1]) + f'<li aria-current="page">{esc(crumbs[-1][1])}</li>'
    return f'''<section class="phero">
  <canvas class="hero-city" id="city" aria-hidden="true"></canvas>
  <div class="wrap phero-in"><ol class="bc">{bc}</ol><p class="kicker">{esc(kicker)}</p><h1 class="h1 split">{esc(h1)}</h1><p class="lead">{esc(lead)}</p></div>
</section>'''


def page_services(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("tjanster", u["nav"][1][1])]
    rows = "".join(f'''<a class="srow" href="{c.link('tjanster/' + s['slug'])}"><span class="svc-n">{i + 1:02d}</span>{icon(s['icon'], 'ic')}
  <div><h2>{esc(s[c.lang]['name'])}</h2><p>{esc(s[c.lang]['short'])}</p></div><span class="srow-a">{icon('arrow')}</span></a>''' for i, s in enumerate(SERVICES))
    return head(c, u["services_page_title"], u["services_page_desc"], "tjanster", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["svc_kicker"], u["svc_title"], u["svc_sub"], crumbs) + f'''
<section class="sec"><div class="wrap srows">{rows}</div></section>
<section class="sec proc"><div class="wrap"><div class="sec-h"><p class="kicker">{u['process_kicker']}</p><h2 class="h2 split">{esc(u['process_title'])}</h2></div>
<ol class="proc-list">{''.join(f'<li><span>{i + 1}</span><h3>{esc(h)}</h3><p>{esc(p)}</p></li>' for i, (h, p) in enumerate(u['process']))}</ol></div></section>
</main>''' + footer(c)


def page_service(c, s):
    u = c.u
    d = s[c.lang]
    crumbs = [("index", u["breadcrumb_home"]), ("tjanster", u["nav"][1][1]), ("tjanster/" + s["slug"], d["name"])]
    svc_ld = {"@context": "https://schema.org", "@type": "Service", "name": d["name"], "serviceType": d["name"], "description": d["desc"],
              "provider": {"@id": BASE + "#org"}, "areaServed": {"@type": "AdministrativeArea", "name": "Västerbottens län"}, "url": c.abs("tjanster/" + s["slug"])}
    pts = "".join(f'<li>{icon("check")}<div><h3>{esc(a)}</h3><p>{esc(b)}</p></div></li>' for a, b in d["points"])
    fors = "".join(f'<li>{esc(x)}</li>' for x in d["for"])
    others = "".join(f'<a class="svc svc-sm" href="{c.link("tjanster/" + o["slug"])}">{icon(o["icon"], "ic svc-ic")}<h3>{esc(o[c.lang]["name"])}</h3><span class="svc-more">{u["read_more"]}{icon("arrow")}</span></a>' for o in SERVICES if o is not s)
    return head(c, d["title"], d["desc"], "tjanster/" + s["slug"], [crumbs_ld(c, crumbs), svc_ld]) + header(c) + '<main id="main">' + page_hero(c, d["kicker"], d["name"], d["lead"], crumbs) + f'''
<section class="sec"><div class="wrap sv-g">
  <div><div class="sv-photo">{photo(c, s['photo'], s['pos'], d['name'] + ' i Umeå – GMS', lazy=False)}</div><p class="kicker">{u['svc_page_what']}</p><ul class="pts">{pts}</ul></div>
  <aside class="sv-side"><div class="sv-icon">{icon(s['icon'], 'ic')}</div><h2 class="h3">{u['svc_page_for']}</h2><ul class="tags">{fors}</ul>
  <a class="btn" href="{c.link('kontakt')}">{u['cta']}{icon('arrow')}</a><a class="sv-call" href="tel:{CO['phone_e164']}">{icon('phone')}{CO['phone']}</a></aside>
</div></section>
<section class="sec contact"><div class="wrap contact-g"><div><h2 class="h2 split">{esc(u['svc_page_cta_t'].format(name=d['name'].lower() if c.lang == 'sv' else d['name'].lower()))}</h2><p class="lead">{esc(u['svc_page_cta_s'])}</p>{contact_cards(c)}</div>{contact_form(c, True)}</div></section>
<section class="sec"><div class="wrap"><div class="sec-h"><p class="kicker">{u['svc_page_other']}</p></div><div class="svc-grid svc-grid-sm">{others}</div></div></section>
</main>''' + footer(c)


def page_about(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("om-oss", u["nav"][2][1])]
    blocks = "".join(f'<article class="ab"><span class="val-n">0{i + 1}</span><h2 class="h3">{esc(h)}</h2><p>{esc(p)}</p></article>' for i, (h, p) in enumerate(u["about_blocks"]))
    values = "".join(f'<li class="val"><span class="val-n">0{i + 1}</span><h3>{esc(h)}</h3><p>{esc(p)}</p></li>' for i, (h, p) in enumerate(u["values"]))
    facts = "".join(f'<li><b>{esc(a)}</b><span>{esc(b)}</span></li>' for a, b in u["facts"])
    return head(c, u["about_title"], u["about_desc"], "om-oss", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["nav"][2][1], u["about_h"], u["about_lead"], crumbs) + f'''
<section class="facts-s"><ul class="facts wrap">{facts}</ul></section>
<section class="sec"><div class="wrap"><div class="ph-hero">{photo(c, 'team-street', '50% 40%', 'GMS team – Umeå', lazy=False)}</div><div class="duo"><div class="ab-g" style="grid-template-columns:1fr">{blocks}</div><div class="ph-hero">{photo(c, 'mall-duo', '50% 40%', 'GMS väktare')}</div></div></div></section>
<section class="sec values"><div class="wrap"><div class="sec-h"><p class="kicker">{u['values_kicker']}</p><h2 class="h2 split">{esc(u['values_title'])}</h2></div><ol class="val-list">{values}</ol></div></section>
<section class="sec team"><div class="wrap team-g"><div><p class="kicker">GMS</p><h2 class="h2 split">{u['team_h']}</h2><p class="lead">{esc(u['team_p'])}</p></div>
<ul class="team-v">{''.join(f'<li>{esc(v)}</li>' for v in u['team_vals'])}</ul></div></section>
</main>''' + footer(c)


def page_jobs(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("jobba-hos-oss", u["nav"][3][1])]
    req = "".join(f'<li>{icon("check")}{esc(x)}</li>' for x in u["jobs_req"])
    off = "".join(f'<li>{icon("check")}{esc(x)}</li>' for x in u["jobs_offer"])
    subj = "Ansökan%20%E2%80%93%20v%C3%A4ktare" if c.lang == "sv" else "Application%20%E2%80%93%20security%20guard"
    return head(c, u["jobs_title_page"], u["jobs_desc_page"], "jobba-hos-oss", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["jobs_kicker"], u["jobs_h"], u["jobs_lead"], crumbs) + f'''
<section class="sec"><div class="wrap"><div class="ph-hero" style="margin-bottom:18px">{photo(c, 'team-event', '50% 55%', 'GMS team', lazy=False)}</div></div><div class="wrap jb-g">
  <div class="jb-c"><h2 class="h3">{u['jobs_req_h']}</h2><ul class="ticks">{req}</ul></div>
  <div class="jb-c"><h2 class="h3">{u['jobs_offer_h']}</h2><ul class="ticks">{off}</ul></div>
</div></section>
<section class="jobs-band"><div class="wrap jobs-in"><div><h2 class="h2">{u['jobs_apply_h']}</h2><p class="lead">{esc(u['jobs_apply_p'])}</p></div>
<a class="btn" href="mailto:{CO['email']}?subject={subj}">{icon('mail')}{u['jobs_apply_btn']}</a></div></section>
<section class="sec team"><div class="wrap team-g"><div><h2 class="h2 split">{u['team_h']}</h2><p class="lead">{esc(u['team_p'])}</p></div><ul class="team-v">{''.join(f'<li>{esc(v)}</li>' for v in u['team_vals'])}</ul></div></section>
</main>''' + footer(c)


def page_contact(c):
    u = c.u
    crumbs = [("index", u["breadcrumb_home"]), ("kontakt", u["nav"][4][1])]
    return head(c, u["contact_title_page"], u["contact_desc_page"], "kontakt", [crumbs_ld(c, crumbs)]) + header(c) + '<main id="main">' + page_hero(c, u["contact_kicker"], u["contact_title"], u["contact_sub"], crumbs) + f'''
<section class="sec contact"><div class="wrap contact-g"><div>{contact_cards(c)}<div class="mini-radar">{radar(c)}</div></div>{contact_form(c)}</div></section>
</main>''' + footer(c)


def page_404(c):
    u = c.u
    return head(c, "404 | GMS Säkerhet", u["notfound"], "404", noindex=True) + header(c) + f'''<main id="main"><section class="phero p404"><canvas class="hero-city" id="city" aria-hidden="true"></canvas><div class="wrap phero-in"><p class="kicker">404</p><h1 class="h1">{u['notfound']}</h1><a class="btn" href="{c.link('index')}">{u['back_home']}{icon('arrow')}</a></div></section></main>''' + footer(c)


# ---------------------------------------------------------------- write
def write(lang, slug, htmlstr):
    p = os.path.join(ROOT, *(["en"] if lang == "en" else []), *([] if slug == "index" else slug.split("/")), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(htmlstr)
    return p


def main():
    urls = []
    for lang in ("sv", "en"):
        pages = [("index", page_home), ("tjanster", page_services), ("om-oss", page_about), ("jobba-hos-oss", page_jobs), ("kontakt", page_contact)]
        for slug, fn in pages:
            write(lang, slug, fn(Ctx(lang, slug)))
            urls.append((Ctx(lang, slug), slug))
        for s in SERVICES:
            slug = "tjanster/" + s["slug"]
            write(lang, slug, page_service(Ctx(lang, slug), s))
            urls.append((Ctx(lang, slug), slug))
    # 404 (sv), placed at root as 404.html with absolute-ish depth 0
    c = Ctx("sv", "404")
    c.depth = 0
    open(os.path.join(ROOT, "404.html"), "w", encoding="utf-8").write(page_404(c).replace('href="assets/', f'href="/gmsakerhet/assets/').replace('src="assets/', 'src="/gmsakerhet/assets/'))
    # sitemap
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for cx, slug in urls:
        pr = "1.0" if slug == "index" else ("0.9" if slug.startswith("tjanster") else "0.7")
        sm.append(f'<url><loc>{cx.abs(slug)}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority>'
                  f'<xhtml:link rel="alternate" hreflang="sv" href="{cx.abs(slug, "sv")}"/><xhtml:link rel="alternate" hreflang="en" href="{cx.abs(slug, "en")}"/></url>')
    sm.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm))
    open(os.path.join(ROOT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
    print("built", len(urls), "pages")


if __name__ == "__main__":
    main()
