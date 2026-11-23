# -*- coding: utf-8 -*-
"""Static generator for alashi.se.

  python3 src/build.py            -> preview build  : dist/alashi   (+ site/public/alashi), base /alashi/, noindex
  python3 src/build.py --prod     -> production build: dist/alashi-se, base /, indexable, .htaccess + sitemap

Both builds point canonical/hreflang at https://alashi.se/...
"""
import json, os, shutil, sys, html, datetime
sys.path.insert(0, os.path.dirname(__file__))
from content import BIZ, SERVICES, T, PAGES, HOME, ABOUT, CONTACT, PRIVACY

PROD = "--prod" in sys.argv
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
BASE = "/" if PROD else "/alashi/"
OUT = os.path.join(REPO, "dist", "alashi-se" if PROD else "alashi")
DOMAIN = BIZ["domain"]
V = "4"
TODAY = datetime.date.today().isoformat()
esc = html.escape

# ------------------------------------------------------------------ helpers
def path_for(page, lang):
    """URL path (without base) for a page key or service key."""
    pre = "" if lang == "sv" else "en/"
    svc = next((s for s in SERVICES if s["key"] == page), None)
    slug = svc["slug"][lang] if svc else PAGES[page][lang]
    return pre + (slug + "/" if slug else "")

def href(page, lang):
    return BASE + path_for(page, lang)

def canon(page, lang):
    return DOMAIN + "/" + path_for(page, lang)

def svc(key):
    return next(s for s in SERVICES if s["key"] == key)

ICONS = {
    "shoe": '<path d="M5 42c0-5 3-9 8-11l9-5c3-2 5-5 6-8h7c1 4 4 7 9 8l10 2c6 1 9 5 9 10v4H5z"/><path d="M5 46h58"/><path class="dash" d="M14 36c10 2 30 2 44 1"/><path d="M28 18c2 3 5 5 8 6"/>',
    "needle": '<path d="M10 54L50 14"/><ellipse cx="48.5" cy="15.5" rx="2" ry="4.5" transform="rotate(45 48.5 15.5)"/><path class="dash" d="M50 14c8 6 0 16-9 18s-19 2-21 10 7 12 15 7"/>',
    "hanger": '<path d="M27 19a5 5 0 1 1 5 5c-2 0-4 2-4 4v3"/><path d="M28 31L6 46c-2 1-1 4 1 4h50c2 0 3-3 1-4L36 31"/><path class="dash" d="M14 50h36"/>',
    "key": '<circle cx="18" cy="32" r="10"/><circle cx="18" cy="32" r="3"/><path d="M28 32h30"/><path d="M50 32v8M56 32v6M43 32v5"/>',
}

def icon(name, cls="ico"):
    return f'<svg class="{cls}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[name]}</svg>'

LOGO = ('<svg class="logo" viewBox="0 0 200 64" role="img" aria-label="Alashi"><rect width="200" height="64" rx="3" fill="#BE1D2D"/>'
        '<path d="M10 9.5h180M10 54.5h180" stroke="#fff" stroke-width="2.4"/>'
        '<text x="100" y="45" text-anchor="middle" fill="#fff" font-family="Inter Tight,Arial Narrow,Arial,sans-serif" font-weight="800" font-size="36" letter-spacing="3">ALASHI</text></svg>')

PHONE_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>'
PIN_ICO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
ARROW = '<svg class="arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

# ------------------------------------------------------------------ schema
def org_schema(lang):
    t = T[lang]
    d = {
        "@type": ["LocalBusiness", "DryCleaningOrLaundry"],
        "@id": DOMAIN + "/#business",
        "name": "Alashi Skrädderi, Skomakeri, Nyckelservice & Kemtvätt",
        "alternateName": ["Alashi", BIZ["legal"]],
        "legalName": BIZ["legal"],
        "taxID": BIZ["orgnr"],
        "url": DOMAIN + "/",
        "logo": DOMAIN + "/assets/img/logo-512.png",
        "image": DOMAIN + "/assets/img/og.jpg",
        "telephone": BIZ["phone_e164"],
        "email": BIZ["email"],
        "foundingDate": BIZ["founded"],
        "priceRange": "$$",
        "description": HOME[lang]["desc"],
        "address": {"@type": "PostalAddress", "streetAddress": BIZ["street"], "postalCode": BIZ["zip"].replace(" ", ""),
                    "addressLocality": BIZ["city"], "addressRegion": BIZ["region"], "addressCountry": BIZ["country"]},
        "areaServed": {"@type": "City", "name": "Umeå"},
        "hasMap": BIZ["maps"],
        "knowsLanguage": ["sv", "en"],
        "hasOfferCatalog": {"@type": "OfferCatalog", "name": t["nav_services"], "itemListElement": [
            {"@type": "OfferCatalog", "name": s["name"][lang], "url": canon(s["key"], lang),
             "itemListElement": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": n}} for n, _ in s["items"][lang]]}
            for s in SERVICES]},
    }
    if BIZ["hours"]:
        spec = []
        for days, o, c in BIZ["hours"]:
            dd = {"Mo-Fr": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}.get(days) or [
                {"Mo": "Monday", "Tu": "Tuesday", "We": "Wednesday", "Th": "Thursday", "Fr": "Friday", "Sa": "Saturday", "Su": "Sunday"}[days]]
            spec.append({"@type": "OpeningHoursSpecification", "dayOfWeek": dd, "opens": o, "closes": c})
        d["openingHoursSpecification"] = spec
    return d

def website_schema(lang):
    return {"@type": "WebSite", "@id": DOMAIN + "/#website", "url": DOMAIN + "/", "name": "Alashi", "inLanguage": lang,
            "publisher": {"@id": DOMAIN + "/#business"}}

def crumbs(items):
    return {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]}

def faq_schema(faq):
    return {"@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}

def ldjson(graph):
    return '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":")) + "</script>"

# ------------------------------------------------------------------ chrome
def head(lang, page, title, desc, graph, extra=""):
    t = T[lang]
    alt_sv, alt_en = canon(page, "sv"), canon(page, "en")
    robots = '<meta name="robots" content="index,follow,max-image-preview:large">' if PROD else '<meta name="robots" content="noindex,nofollow">'
    intro = ''
    if page == "home":
        intro = "<script>try{if(!sessionStorage.getItem('al-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro')}catch(e){}</script>"
    return f'''<!doctype html>
<html lang="{t["lang"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
{robots}
<link rel="canonical" href="{canon(page, lang)}">
<link rel="alternate" hreflang="sv-SE" href="{alt_sv}">
<link rel="alternate" hreflang="en" href="{alt_en}">
<link rel="alternate" hreflang="x-default" href="{alt_sv}">
<meta name="theme-color" content="#BE1D2D">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Alashi">
<meta property="og:locale" content="{t["locale"]}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canon(page, lang)}">
<meta property="og:image" content="{DOMAIN}/assets/img/og.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="SE-AC"><meta name="geo.placename" content="Umeå">
<link rel="icon" href="{BASE}assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="{BASE}favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="{BASE}assets/img/apple-touch-icon.png">
<link rel="manifest" href="{BASE}site.webmanifest">
<link rel="preload" href="{BASE}assets/fonts/inter-tight.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{BASE}assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{BASE}assets/css/site.css?v={V}">
{intro}
{ldjson(graph)}
{extra}
</head>'''

def header(lang, page):
    t = T[lang]
    other = t["other"]
    svc_links = "".join(f'<a href="{href(s["key"], lang)}">{icon(s["icon"], "mi")}<span>{s["name"][lang]}</span></a>' for s in SERVICES)
    cur = lambda p: ' aria-current="page"' if p == page else ''
    return f'''<body class="pg-{page}">
<a class="skip" href="#main">{t["skip"]}</a>
{intro_markup(lang) if page == "home" else ""}
<header class="hdr" id="hdr">
  <div class="wrap hdr-in">
    <a class="brand" href="{href("home", lang)}" aria-label="Alashi – {t["home"]}">{LOGO}</a>
    <nav class="nav" id="nav" aria-label="{t["menu"]}">
      <div class="dd">
        <button class="dd-btn" aria-expanded="false" aria-controls="dd-svc">{t["nav_services"]}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
        <div class="dd-menu" id="dd-svc">{svc_links}</div>
      </div>
      <a href="{href("about", lang)}"{cur("about")}>{t["nav_about"]}</a>
      <a href="{href("contact", lang)}"{cur("contact")}>{t["nav_contact"]}</a>
      <a class="lang" href="{href(page, other)}" hreflang="{other}" lang="{other}">{other.upper()}</a>
      <a class="btn btn-red nav-call" href="tel:{BIZ["phone_e164"]}">{PHONE_ICO}<span>{BIZ["phone_display"]}</span></a>
    </nav>
    <button class="burger" id="burger" aria-label="{t["menu"]}" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>
  </div>
</header>
<main id="main">'''

def intro_markup(lang):
    letters = "".join(f'<span style="--i:{i}">{c}</span>' for i, c in enumerate("ALASHI"))
    return f'''<div class="intro-ov" id="intro" aria-hidden="true">
  <div class="intro-band"><i class="r1"></i><i class="r2"></i><div class="intro-word">{letters}</div></div>
  <svg class="intro-stitch" viewBox="0 0 600 20" preserveAspectRatio="none"><path d="M0 10 H600" pathLength="1"/></svg>
  <p class="intro-sub">{T[lang]["intro_sub"]}</p>
</div>'''

def hours_html(lang):
    t = T[lang]
    if not BIZ["hours"]:
        return f'<p class="muted">{t["hours_tbd"]}</p>'
    rows = "".join(f'<li><span>{t["days"][d]}</span><span>{o}–{c}</span></li>' for d, o, c in BIZ["hours"])
    return f'<ul class="hours">{rows}</ul>'

def visit_block(lang, h=None):
    t = T[lang]
    return f'''<section class="visit" id="besok">
  <div class="wrap visit-in">
    <div class="visit-info reveal">
      <p class="eyebrow">{t["since"]}</p>
      <h2>{h or t["cta_h"]}</h2>
      <p class="lead">{t["cta_p"]}</p>
      <dl class="nap">
        <div><dt>{t["address"]}</dt><dd><a href="{BIZ["maps"]}" rel="noopener" target="_blank">{BIZ["street"]}, {BIZ["zip"]} {BIZ["city"]}</a></dd></div>
        <div><dt>{t["phone"]}</dt><dd><a href="tel:{BIZ["phone_e164"]}">{BIZ["phone_display"]}</a></dd></div>
        <div><dt>{t["email"]}</dt><dd><a href="mailto:{BIZ["email"]}">{BIZ["email"]}</a></dd></div>
        <div><dt>{t["hours"]}</dt><dd>{hours_html(lang)}</dd></div>
      </dl>
      <div class="btns"><a class="btn btn-red" href="tel:{BIZ["phone_e164"]}">{PHONE_ICO}{t["call"]}</a><a class="btn btn-ghost" href="{BIZ["maps"]}" target="_blank" rel="noopener">{PIN_ICO}{t["directions"]}</a></div>
    </div>
    <div class="map reveal" data-src="{BIZ["maps_embed"]}">
      <div class="map-ph">
        <svg class="map-art" viewBox="0 0 400 300" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><path d="M0 70 L400 40M0 160 L400 150M0 250 L400 270M80 0 L60 300M190 0 L210 300M310 0 L330 300M0 110 C120 90 260 130 400 95"/></g><path d="M0 205 C90 185 160 230 260 210 S360 190 400 200" stroke="currentColor" stroke-width="10" opacity=".25" fill="none"/></svg>
        <span class="pin">{PIN_ICO}</span>
        <button class="btn btn-light map-btn">{t["map_btn"]}</button>
        <small>{t["map_note"]}</small>
      </div>
    </div>
  </div>
</section>'''

def footer(lang, page):
    t = T[lang]
    year = datetime.date.today().year
    svc_links = "".join(f'<li><a href="{href(s["key"], lang)}">{s["name"][lang]} i Umeå</a></li>' if lang == "sv" else f'<li><a href="{href(s["key"], lang)}">{s["name"][lang]} in Umeå</a></li>' for s in SERVICES)
    return f'''</main>
<footer class="ftr">
  <div class="stitch-line" aria-hidden="true"></div>
  <div class="wrap ftr-in">
    <div class="ftr-brand">
      <a href="{href("home", lang)}" aria-label="Alashi">{LOGO}</a>
      <p>{t["footer_about"]}</p>
    </div>
    <div><h3>{t["nav_services"]}</h3><ul>{svc_links}</ul></div>
    <div><h3>Alashi</h3><ul><li><a href="{href("about", lang)}">{t["nav_about"]}</a></li><li><a href="{href("contact", lang)}">{t["nav_contact"]}</a></li><li><a href="{href("privacy", lang)}">{t["privacy"]}</a></li><li><a href="{href(page, t["other"])}" hreflang="{t["other"]}">{t["switch"]}</a></li></ul></div>
    <div><h3>{t["nav_contact"]}</h3>
      <address>{BIZ["street"]}<br>{BIZ["zip"]} {BIZ["city"]}<br><a href="tel:{BIZ["phone_e164"]}">{BIZ["phone_display"]}</a><br><a href="mailto:{BIZ["email"]}">{BIZ["email"]}</a></address>
    </div>
  </div>
  <div class="wrap ftr-bot"><span>© {year} {BIZ["legal"]} · Org.nr {BIZ["orgnr"]} · {t["rights"]}</span><span>{t["made"]} <a href="https://theplanetco.com" rel="noopener" target="_blank">Planet Creative Marketing</a></span></div>
</footer>
<a class="fab" href="tel:{BIZ["phone_e164"]}" aria-label="{t["call"]}">{PHONE_ICO}</a>
<script src="{BASE}assets/js/site.js?v={V}" defer></script>
</body>
</html>'''

def faq_block(lang, faq, h=None):
    items = "".join(f'<details class="qa"><summary><span>{esc(q)}</span><i></i></summary><p>{esc(a)}</p></details>' for q, a in faq)
    return f'<section class="faq"><div class="wrap faq-in"><h2 class="reveal">{h or T[lang]["faq"]}</h2><div class="qas reveal">{items}</div></div></section>'

def steps_block(lang):
    t = T[lang]
    st = "".join(f'<li class="step reveal" style="--d:{i}"><span class="num">0{i+1}</span><h3>{a}</h3><p>{b}</p></li>' for i, (a, b) in enumerate(t["steps"]))
    return f'<section class="steps"><div class="wrap"><h2 class="reveal">{t["how"]}</h2><ol class="step-list">{st}</ol><svg class="steps-stitch" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 C250 0 350 40 500 20 S800 0 1000 20" pathLength="1"/></svg></div></section>'

def tag_card(s, lang, i, h="h3"):
    return f'''<a class="tag reveal" style="--d:{i}" href="{href(s["key"], lang)}">
  <span class="tag-hole" aria-hidden="true"></span>
  <span class="tag-no">No. 0{i+1}</span>
  {icon(s["icon"], "ico draw")}
  <{h}>{s["name"][lang]}</{h}>
  <p>{s["short"][lang]}</p>
  <span class="tag-more">{T[lang]["readmore"]}{ARROW}</span>
  <span class="tag-perf" aria-hidden="true"></span>
</a>'''

# ------------------------------------------------------------------ pages
def page_home(lang):
    t, h = T[lang], HOME[lang]
    graph = [org_schema(lang), website_schema(lang),
             {"@type": "WebPage", "@id": canon("home", lang) + "#webpage", "url": canon("home", lang), "name": h["title"], "inLanguage": lang,
              "isPartOf": {"@id": DOMAIN + "/#website"}, "about": {"@id": DOMAIN + "/#business"}},
             faq_schema(h["faq"])]
    marquee = "".join(f"<span>{m}</span><i>✦</i>" for m in h["marquee"])
    tags = "".join(tag_card(s, lang, i) for i, s in enumerate(SERVICES))
    hero_tags = "".join(f'<div class="ht ht{i}" style="--i:{i}"><span class="tag-hole"></span><span class="tag-no">No. 0{i+1}</span>{icon(s["icon"], "ico draw")}<b>{s["name"][lang]}</b></div>' for i, s in enumerate(SERVICES))
    chips = "".join(f'<button class="chip{" on" if i == 0 else ""}" role="tab" aria-selected="{"true" if i == 0 else "false"}" data-k="{k}">{icon(svc(k)["icon"], "ci")}{n}</button>' for i, (n, k, _) in enumerate(h["picker"]))
    panels = "".join(
        f'<div class="pk-panel{" on" if i == 0 else ""}" data-k="{k}" role="tabpanel"><ul>{"".join(f"<li>{x}</li>" for x in items)}</ul><a class="btn btn-red" href="{href(k, lang)}">{svc(k)["name"][lang]} – {t["readmore"].lower()}{ARROW}</a></div>'
        for i, (n, k, items) in enumerate(h["picker"]))
    stats = "".join(f'<div class="stat reveal" style="--d:{i}"><b data-count="{n}">{n}</b><span>{l}</span></div>' for i, (n, l) in enumerate(h["stats"]))
    specs = "".join(f'<li class="reveal" style="--d:{i}"><span class="sp-n">0{i+1}</span><div><h3>{a}</h3><p>{b}</p></div></li>' for i, (a, b) in enumerate(h["specs"]))
    body = f'''
<section class="hero">
  <svg class="hero-thread" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 830 C 260 760 420 860 640 800 S 900 640 1060 700 S 1320 820 1460 700" pathLength="1"/></svg>
  <div class="wrap hero-in">
    <div class="hero-copy">
      <p class="eyebrow hero-eb">{PIN_ICO}{h["eyebrow"]}</p>
      <h1 class="hero-h"><span class="ln"><span>{h["h1a"]}</span></span><span class="ln"><span class="red">{h["h1b"]}</span></span></h1>
      <p class="lead hero-lead">{h["lead"]}</p>
      <div class="btns hero-btns"><a class="btn btn-red" href="tel:{BIZ["phone_e164"]}">{PHONE_ICO}{t["call"]} · {BIZ["phone_display"]}</a><a class="btn btn-ghost" href="#besok">{PIN_ICO}{t["directions"]}</a></div>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="ht-stack">{hero_tags}</div>
      <div class="ht-string"></div>
    </div>
  </div>
</section>
<div class="marquee" aria-hidden="true"><div class="mq-track">{marquee}{marquee}</div></div>

<section class="services" id="tjanster">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">{t["tagline"]}</p><h2>{h["services_h"]}</h2><p class="lead">{h["services_p"]}</p></div>
    <div class="tags">{tags}</div>
  </div>
</section>

<section class="picker">
  <div class="wrap pk-in">
    <div class="reveal"><h2>{h["picker_h"]}</h2><p class="lead">{h["picker_p"]}</p></div>
    <div class="pk reveal"><div class="chips" role="tablist">{chips}</div><div class="pk-panels">{panels}</div></div>
  </div>
</section>

{steps_block(lang)}

<section class="about-strip">
  <div class="wrap ab-in">
    <div class="ab-copy reveal"><p class="eyebrow">{t["since"]}</p><h2>{h["about_h"]}</h2><p>{h["about_p"]}</p><a class="link" href="{href("about", lang)}">{t["nav_about"]}{ARROW}</a></div>
    <div class="stats">{stats}</div>
  </div>
</section>

<section class="specs"><div class="wrap"><h2 class="reveal">{h["spec_h"]}</h2><ul class="spec-list">{specs}</ul></div></section>

{faq_block(lang, h["faq"])}
{visit_block(lang)}'''
    return head(lang, "home", h["title"], h["desc"], graph) + header(lang, "home") + body + footer(lang, "home")

def page_service(s, lang):
    t = T[lang]
    k = s["key"]
    url = canon(k, lang)
    graph = [org_schema(lang),
             {"@type": "Service", "@id": url + "#service", "name": s["h1"][lang], "serviceType": s["name"][lang], "url": url,
              "description": s["desc"][lang], "provider": {"@id": DOMAIN + "/#business"}, "areaServed": {"@type": "City", "name": "Umeå"},
              "hasOfferCatalog": {"@type": "OfferCatalog", "name": s["name"][lang], "itemListElement": [
                  {"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "description": d}} for n, d in s["items"][lang]]}},
             crumbs([(t["home"], canon("home", lang)), (s["name"][lang], url)]),
             faq_schema(s["faq"][lang])]
    items = "".join(f'<li class="it reveal" style="--d:{i%3}"><span class="it-n">{i+1:02d}</span><h3>{a}</h3><p>{b}</p></li>' for i, (a, b) in enumerate(s["items"][lang]))
    body_secs = "".join(f'<div class="prose-block reveal"><h2>{a}</h2><p>{b}</p></div>' for a, b in s["body"][lang])
    others = "".join(tag_card(o, lang, i) for i, o in enumerate(SERVICES) if o["key"] != k)
    others = others  # keep numbering by original index
    others = "".join(tag_card(o, lang, SERVICES.index(o)) for o in SERVICES if o["key"] != k)
    body = f'''
<nav class="crumbs wrap" aria-label="Breadcrumb"><a href="{href("home", lang)}">{t["home"]}</a><span>/</span><span aria-current="page">{s["name"][lang]}</span></nav>
<section class="phero">
  <div class="wrap phero-in">
    <div class="phero-copy">
      <p class="eyebrow">{s["kicker"][lang]}</p>
      <h1 class="hero-h"><span class="ln"><span>{s["h1"][lang].rsplit(" ", 2)[0]}</span></span><span class="ln"><span class="red">{" ".join(s["h1"][lang].rsplit(" ", 2)[1:])}</span></span></h1>
      <p class="lead">{s["lead"][lang]}</p>
      <div class="btns"><a class="btn btn-red" href="tel:{BIZ["phone_e164"]}">{PHONE_ICO}{t["call"]} · {BIZ["phone_display"]}</a><a class="btn btn-ghost" href="#besok">{PIN_ICO}{BIZ["street"]}</a></div>
    </div>
    <div class="phero-art" aria-hidden="true"><div class="big-tag"><span class="tag-hole"></span><span class="tag-no">No. 0{SERVICES.index(s)+1}</span>{icon(s["icon"], "ico draw")}<b>{s["name"][lang]}</b><span class="tag-perf"></span></div></div>
  </div>
</section>
<section class="items"><div class="wrap"><h2 class="reveal">{t["what"]}</h2><ul class="item-grid">{items}</ul></div></section>
<section class="prose"><div class="wrap prose-in">{body_secs}</div></section>
{steps_block(lang)}
{faq_block(lang, s["faq"][lang])}
<section class="services more"><div class="wrap"><h2 class="reveal">{t["other_services"]}</h2><div class="tags tags-3">{others}</div></div></section>
{visit_block(lang)}'''
    return head(lang, k, s["title"][lang], s["desc"][lang], graph) + header(lang, k) + body + footer(lang, k)

def simple_page(lang, page, data, inner, graph_extra=None):
    t = T[lang]
    graph = [org_schema(lang), crumbs([(t["home"], canon("home", lang)), (data["h1"], canon(page, lang))])] + (graph_extra or [])
    body = f'''
<nav class="crumbs wrap" aria-label="Breadcrumb"><a href="{href("home", lang)}">{t["home"]}</a><span>/</span><span aria-current="page">{data["h1"]}</span></nav>
<section class="phero phero-s"><div class="wrap"><h1 class="hero-h"><span class="ln"><span>{data["h1"]}</span></span></h1>{f'<p class="lead">{data["lead"]}</p>' if data.get("lead") else ""}</div></section>
{inner}'''
    return head(lang, page, data["title"], data["desc"], graph) + header(lang, page) + body + footer(lang, page)

def page_about(lang):
    d = ABOUT[lang]
    h = HOME[lang]
    paras = "".join(f'<p class="reveal">{p}</p>' for p in d["paras"])
    stats = "".join(f'<div class="stat reveal" style="--d:{i}"><b data-count="{n}">{n}</b><span>{l}</span></div>' for i, (n, l) in enumerate(h["stats"]))
    inner = f'<section class="prose"><div class="wrap prose-in prose-about"><div class="about-text">{paras}</div><div class="stats stats-col">{stats}</div></div></section>' + \
            f'<section class="services more"><div class="wrap"><div class="tags">{"".join(tag_card(s, lang, i) for i, s in enumerate(SERVICES))}</div></div></section>' + visit_block(lang)
    return simple_page(lang, "about", d, inner, [{"@type": "AboutPage", "url": canon("about", lang), "name": d["title"], "about": {"@id": DOMAIN + "/#business"}}])

def page_contact(lang):
    d = CONTACT[lang]
    form = f'''<section class="cform"><div class="wrap cf-in"><form class="form reveal" id="cform" data-mail="{BIZ["email"]}">
<h2>{d["form_h"]}</h2>
<label><span>{d["f_name"]}</span><input name="name" autocomplete="name" required></label>
<label><span>{d["f_phone"]}</span><input name="phone" type="tel" autocomplete="tel"></label>
<label><span>{d["f_msg"]}</span><textarea name="msg" rows="5" required></textarea></label>
<button class="btn btn-red" type="submit">{d["f_send"]}{ARROW}</button>
<small class="muted">{d["f_note"]}</small>
</form></div></section>'''
    inner = visit_block(lang, d["h1"]) + form
    return simple_page(lang, "contact", d, inner, [{"@type": "ContactPage", "url": canon("contact", lang), "name": d["title"], "about": {"@id": DOMAIN + "/#business"}}])

def page_privacy(lang):
    d = PRIVACY[lang]
    inner = '<section class="prose"><div class="wrap prose-in prose-narrow">' + "".join(f"<p>{p}</p>" for p in d["paras"]) + "</div></section>"
    return simple_page(lang, "privacy", d, inner)

def page_404():
    lang = "sv"
    t = T[lang]
    links = "".join(f'<a class="btn btn-ghost" href="{href(s["key"], lang)}">{s["name"][lang]}</a>' for s in SERVICES)
    body = f'''<section class="phero phero-s nf"><div class="wrap"><p class="eyebrow">404</p><h1 class="hero-h"><span class="ln"><span>{t["notfound_h"]}</span></span></h1><p class="lead">{t["notfound_p"]}</p><div class="btns"><a class="btn btn-red" href="{href("home", lang)}">{t["home"]}</a>{links}</div></div></section>'''
    h = head(lang, "home", "404 – " + t["notfound_h"] + " | Alashi", t["notfound_p"], [org_schema(lang)]).replace('<meta name="robots" content="index,follow,max-image-preview:large">', '<meta name="robots" content="noindex">')
    return h + header(lang, "home").replace("pg-home", "pg-404") + body + footer(lang, "home")

# ------------------------------------------------------------------ write
def write(rel, content):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(OUT, "assets"))
    for f in ("favicon.ico",):
        src = os.path.join(ROOT, "static", f)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(OUT, f))
    urls = []
    for lang in ("sv", "en"):
        write(path_for("home", lang) + "index.html", page_home(lang)); urls.append("home")
        for s in SERVICES:
            write(path_for(s["key"], lang) + "index.html", page_service(s, lang))
        write(path_for("about", lang) + "index.html", page_about(lang))
        write(path_for("contact", lang) + "index.html", page_contact(lang))
        write(path_for("privacy", lang) + "index.html", page_privacy(lang))
    write("404.html", page_404())
    write("site.webmanifest", json.dumps({"name": "Alashi Umeå", "short_name": "Alashi", "start_url": BASE, "display": "standalone",
                                          "background_color": "#F5F1EA", "theme_color": "#BE1D2D",
                                          "icons": [{"src": BASE + "assets/img/logo-512.png", "sizes": "512x512", "type": "image/png"}]}))
    pages = ["home"] + [s["key"] for s in SERVICES] + ["about", "contact", "privacy"]
    # sitemap with hreflang alternates
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for p in pages:
        for lang in ("sv", "en"):
            pr = {"home": "1.0", "privacy": "0.2"}.get(p, "0.8" if lang == "sv" else "0.6")
            sm.append(f'<url><loc>{canon(p, lang)}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority>'
                      f'<xhtml:link rel="alternate" hreflang="sv-SE" href="{canon(p, "sv")}"/><xhtml:link rel="alternate" hreflang="en" href="{canon(p, "en")}"/>'
                      f'<xhtml:link rel="alternate" hreflang="x-default" href="{canon(p, "sv")}"/></url>')
    sm.append("</urlset>")
    if PROD:
        write("sitemap.xml", "\n".join(sm))
        write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /wp-admin/\nDisallow: /wp-login.php\n\nSitemap: {DOMAIN}/sitemap.xml\n")
        write(".htaccess", htaccess())
    else:
        write("sitemap-preview.xml", "\n".join(sm))
    print("built", OUT, "pages:", len(pages) * 2 + 1)

def htaccess():
    redirects = []
    for s in SERVICES:
        for old in s["old"]:
            redirects.append(f"RewriteRule ^{old}/?$ /{path_for(s['key'], 'sv')} [R=301,L]")
    redirects += ["RewriteRule ^contacts/?$ /kontakt/ [R=301,L]", "RewriteRule ^services/?$ /#tjanster [R=301,L,NE]"]
    return f"""# alashi.se – generated by clients/alashi/src/build.py
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On
# HTTPS + no www
RewriteCond %{{HTTPS}} off [OR]
RewriteCond %{{HTTP_HOST}} ^www\\. [NC]
RewriteRule ^ https://alashi.se%{{REQUEST_URI}} [R=301,L]

# Old WordPress URLs -> new pages (keeps link value)
{chr(10).join(redirects)}

# Hacked spam pages from the old WordPress: tell Google they are gone for good (410)
RewriteRule ^(wp-admin|wp-includes|wp-content|wp-json|xmlrpc\\.php|wp-login\\.php|feed|comments/feed|author|category|tag|blog-[a-z0-9-]+|about-style-[0-9]+)(/.*)?$ - [G,L]
RewriteCond %{{QUERY_STRING}} (^|&)(p|s|cat|page_id|attachment_id)= [NC]
RewriteRule ^ - [G,L]
RewriteCond %{{REQUEST_FILENAME}} !-f
RewriteCond %{{REQUEST_FILENAME}} !-d
RewriteCond %{{REQUEST_URI}} !^/(en|kontakt|om-oss|integritetspolicy|skomakare-umea|skraddare-umea|kemtvatt-umea|nyckelkopiering-umea)(/|$)
RewriteCond %{{REQUEST_URI}} !^/404\\.html$
RewriteRule ^ - [G,L]
</IfModule>
ErrorDocument 410 /404.html

<IfModule mod_headers.c>
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Strict-Transport-Security "max-age=31536000"
<FilesMatch "\\.(css|js|woff2|svg|png|jpg|webp|ico)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\\.html$">
Header set Cache-Control "public, max-age=600"
</FilesMatch>
</IfModule>
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml application/json application/xml text/xml
</IfModule>
AddType application/manifest+json .webmanifest
"""

if __name__ == "__main__":
    main()
