# -*- coding: utf-8 -*-
"""Static site generator for STERN IP. Run: python3 src/build.py"""
import os, html
from data import *

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = "8"
LANG = "ar"


def T(en, ar):
    return ar if LANG == "ar" else en


def esc(s):
    return html.escape(s, quote=True)


def A():  # asset prefix
    return "assets/" if LANG == "ar" else "../assets/"


def link(slug):
    """link to a page in the current language"""
    page, _, frag = slug.partition("#")
    page = page or "index"
    f = ("" if page == "index" else page + ".html") or "./"
    if page == "index":
        f = "./"
    return f + ("#" + frag if frag else "")


def other_lang_link(slug):
    page = slug if slug != "index" else ""
    tgt = (page + ".html") if page else ""
    if LANG == "ar":
        return "en/" + tgt if tgt else "en/"
    return "../" + tgt if tgt else "../"


# ---------------------------------------------------------------- brand marks
_uid = [0]


def eagle(cls="", tone="light", rays=False):
    """tone: light (silver on dark), brand (original navy gradient), ink (mono)"""
    _uid[0] += 1
    gid = "eg%d" % _uid[0]
    if tone == "brand":
        stops = '<stop offset="0" stop-color="#02032b"/><stop offset=".55" stop-color="#16326e"/><stop offset="1" stop-color="#2d4f8d"/>'
    elif tone == "glow":
        stops = '<stop offset="0" stop-color="#2a4c8f"/><stop offset=".5" stop-color="#5d83cc"/><stop offset="1" stop-color="#9fbaf0"/>'
    else:
        stops = '<stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#dfe7f6"/><stop offset="1" stop-color="#a9bde6"/>'
    r = ""
    if rays:
        hx, hy = HEART
        r = '<g class="e-rays">' + "".join(
            '<line x1="%d" y1="%d" x2="%d" y2="%d"/>' % (hx, hy, x, y) for x, y in RAY_TIPS) + "</g>"
    return ('<svg class="eagle %s" viewBox="0 6 604 224" aria-hidden="true" focusable="false">'
            '<defs><linearGradient id="%s" x1="0" x2="1" y1="0" y2="0">%s</linearGradient></defs>%s'
            '<path class="e-fill" fill="url(#%s)" fill-rule="evenodd" d="%s"/></svg>') % (cls, gid, stops, r, gid, EAGLE_D)


def logo(tone="light"):
    return ('<a class="logo" href="%s" aria-label="STERN IPR">%s<span class="lw"><b>STERN IPR</b><i>INTELLECTUAL PROPERTY</i></span></a>'
            % (link("index"), eagle("logo-e", tone)))


ICONS = {
    "tm": '<circle cx="24" cy="24" r="17"/><path d="M15 19h10M20 19v12M27 31V19l4 7 4-7v12"/>',
    "pt": '<path d="M24 6a12 12 0 0 1 7 21.7V33H17v-5.3A12 12 0 0 1 24 6Z"/><path d="M18 38h12M20 42h8M24 17v9M20 21l4-4 4 4"/>',
    "ds": '<path d="M8 36 24 8l16 28Z"/><circle cx="24" cy="27" r="6"/><path d="M8 36h32"/>',
    "um": '<circle cx="24" cy="24" r="6"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/>',
    "cr": '<circle cx="24" cy="24" r="17"/><path d="M29.5 18.5a8 8 0 1 0 0 11"/>',
    "lt": '<path d="M24 7v34M14 41h20M10 13h28M16 13 10 27a6 6 0 0 0 12 0Zm16 0-6 14a6 6 0 0 0 12 0Z"/>',
    "arrow": '<path d="M10 24h28M28 14l10 10-10 10"/>',
    "mail": '<rect x="6" y="11" width="36" height="26" rx="3"/><path d="m7 13 17 13 17-13"/>',
    "phone": '<path d="M14 6h7l3 9-5 3a24 24 0 0 0 11 11l3-5 9 3v7a4 4 0 0 1-4 4A32 32 0 0 1 10 10a4 4 0 0 1 4-4Z"/>',
    "pin": '<path d="M24 43s14-12.4 14-23a14 14 0 0 0-28 0c0 10.6 14 23 14 23Z"/><circle cx="24" cy="20" r="5"/>',
    "wa": '<path d="M8 40l2.6-8A16 16 0 1 1 17 38Z"/><path d="M18 17c0 7 6 13 13 13l2-3-4-2-2 2c-2-1-4-3-5-5l2-2-2-4Z"/>',
    "star": '<path d="m24 6 4.6 12.4L42 19l-10.5 8.3L35 41l-11-7.6L13 41l3.5-13.7L6 19l13.4-.6Z"/>',
    "shield": '<path d="M24 5 40 11v11c0 10-7 18-16 21C15 40 8 32 8 22V11Z"/><path d="m17 24 5 5 9-10"/>',
    "globe": '<circle cx="24" cy="24" r="17"/><path d="M7 24h34M24 7c-9 9-9 25 0 34M24 7c9 9 9 25 0 34"/>',
    "plus": '<path d="M24 12v24M12 24h24"/>',
}


def icon(k, cls="ic"):
    return '<svg class="%s" viewBox="0 0 48 48" aria-hidden="true">%s</svg>' % (cls, ICONS[k])


def arrow():
    return icon("arrow", "ic-arr")


# ---------------------------------------------------------------- chrome
NAV = [
    ("about", "The Firm", "الشركة", [("about", "About STERN IP", "عن ستيرن"), ("chairman", "Chairman", "رئيس مجلس الإدارة"), ("team", "Our Team", "فريق العمل")]),
    ("practice", "Practice", "مجالات الممارسة", [("practice", "All practice areas", "كل مجالات الممارسة"), ("trademarks", "Trademarks", "العلامات التجارية"), ("patents", "Patents", "براءات الاختراع"), ("designs", "Designs & Utility Models", "النماذج الصناعية ونماذج المنفعة")]),
    ("jurisdictions", "Jurisdictions", "نطاق التغطية", None),
    ("clients", "Clients", "العملاء", None),
    ("insights", "Insights", "المستجدات", None),
]


def header(slug):
    items = []
    for s, en, ar, sub in NAV:
        active = " on" if (slug == s or (sub and slug in [x[0] for x in sub])) else ""
        if sub:
            dd = "".join('<a href="%s">%s</a>' % (link(x[0]), T(x[1], x[2])) for x in sub)
            items.append('<div class="ni has%s"><a href="%s">%s<svg viewBox="0 0 10 6"><path d="m1 1 4 4 4-4"/></svg></a><div class="dd">%s</div></div>' % (active, link(s), T(en, ar), dd))
        else:
            items.append('<div class="ni%s"><a href="%s">%s</a></div>' % (active, link(s), T(en, ar)))
    mob = []
    n = 0
    for s, en, ar, sub in NAV:
        n += 1
        mob.append('<a class="mm-l" href="%s"><em>0%d</em>%s</a>' % (link(s), n, T(en, ar)))
        if sub:
            mob.append('<div class="mm-sub">' + "".join('<a href="%s">%s</a>' % (link(x[0]), T(x[1], x[2])) for x in sub[1:] if x[0] != s or True) + "</div>")
    mob.append('<a class="mm-l" href="%s"><em>0%d</em>%s</a>' % (link("contact"), n + 1, T("Contact", "تواصل معنا")))
    return f'''
<header class="hd" id="hd">
  <div class="hd-in">
    {logo()}
    <nav class="nav" aria-label="{T('Main','القائمة الرئيسية')}">{''.join(items)}</nav>
    <div class="hd-act">
      <a class="lang" href="{other_lang_link(slug)}" hreflang="{T('ar','en')}" lang="{T('ar','en')}">{T('العربية','EN')}</a>
      <a class="btn btn-s" href="{link('contact')}"><span>{T('Contact us','تواصل معنا')}</span></a>
      <button class="burger" id="burger" aria-label="{T('Menu','القائمة')}" aria-expanded="false"><i></i><i></i></button>
    </div>
  </div>
</header>
<div class="mm" id="mm" aria-hidden="true">
  <div class="mm-bg">{eagle('mm-e','light')}</div>
  <div class="mm-in">{''.join(mob)}</div>
  <div class="mm-ft"><a href="mailto:{EMAIL}">{EMAIL}</a><a href="tel:+{PHONE_RAW}" dir="ltr">{PHONE_INTL}</a><a class="lang" href="{other_lang_link(slug)}">{T('العربية','English')}</a></div>
</div>'''


def footer():
    cols = [
        (T("The Firm", "الشركة"), [("about", T("About STERN IP", "عن ستيرن")), ("chairman", T("Chairman’s message", "كلمة رئيس مجلس الإدارة")), ("team", T("Our team", "فريق العمل")), ("clients", T("Clients", "العملاء"))]),
        (T("Practice", "الممارسة"), [("trademarks", T("Trademarks", "العلامات التجارية")), ("patents", T("Patents", "براءات الاختراع")), ("designs", T("Industrial designs", "النماذج الصناعية")), ("designs#utility", T("Utility models", "نماذج المنفعة")), ("designs#copyright", T("Copyrights", "حقوق المؤلف"))]),
        (T("Explore", "استكشف"), [("jurisdictions", T("Jurisdictions", "نطاق التغطية")), ("insights", T("Insights", "المستجدات")), ("contact", T("Contact", "تواصل معنا")), ("privacy", T("Privacy policy", "سياسة الخصوصية"))]),
    ]
    c = "".join('<div class="fc"><h4>%s</h4>%s</div>' % (h, "".join('<a href="%s">%s</a>' % (link(s), t) for s, t in L)) for h, L in cols)
    return f'''
<footer class="ft">
  <div class="ft-rays" aria-hidden="true"></div>
  <div class="wrap">
    <div class="ft-top">
      <div class="ft-brand">{logo()}
        <p>{T('An intellectual property law firm based in Cairo, Egypt, with representation worldwide.','مكتب محاماة متخصص في الملكية الفكرية، مقرّه القاهرة، وله تمثيل حول العالم.')}</p>
        <p class="ft-motto">{T('Power in protecting.','قوّةٌ في الحماية.')}</p>
      </div>
      {c}
      <div class="fc fc-c"><h4>{T('Cairo headquarters','المقر الرئيسي – القاهرة')}</h4>
        <p>{T('P.O. Box 6 El-Malek El-Saleh, Code 11559, Cairo, Egypt','ص.ب 6 الملك الصالح، الرمز البريدي 11559، القاهرة، مصر')}</p>
        <a href="mailto:{EMAIL}">{EMAIL}</a>
        <a href="tel:+{PHONE_RAW}" dir="ltr">{PHONE_INTL}</a>
      </div>
    </div>
    <div class="ft-bot">
      <span>© 2026 STERN IP LTD. {T('All rights reserved.','جميع الحقوق محفوظة.')}</span>
      <span class="ft-mark">{T('Trademarks · Patents · Designs · Copyrights','علامات تجارية · براءات اختراع · نماذج صناعية · حقوق مؤلف')}</span>
    </div>
  </div>
</footer>
<a class="wa" href="https://wa.me/{PHONE_RAW}" target="_blank" rel="noopener" aria-label="WhatsApp">{icon('wa')}</a>'''


INTRO_GUARD = "<script>document.documentElement.classList.add('h3d');setTimeout(function(){document.documentElement.classList.remove('h3d')},4500)</script>"


def page(slug, title, desc, body, cls="", extra_js=()):
    a = A()
    alt = other_lang_link(slug)
    js = "".join('<script src="%sjs/%s?v=%s" defer></script>' % (a, j, V) for j in extra_js)
    return f'''<!doctype html>
<html lang="{LANG}" dir="{T('ltr','rtl')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#050a1f">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<link rel="alternate" hreflang="{T('ar','en')}" href="{alt}">
<link rel="icon" href="{a}img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="{a}fonts/{T('Sora-300_700-latin.woff2','NotoSansArabic-300_700-arabic.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{a}css/fonts.css?v={V}">
<link rel="stylesheet" href="{a}css/stern.css?v={V}">
{INTRO_GUARD if slug=="index" else ""}</head>
<body class="{cls} l-{LANG}" data-page="{slug}">
<a class="skip" href="#main">{T('Skip to content','تخطَّ إلى المحتوى')}</a>
{header(slug)}
<main id="main">
{body}
</main>
{footer()}
<script src="{a}js/vendor/gsap.min.js?v={V}" defer></script>
<script src="{a}js/vendor/ScrollTrigger.min.js?v={V}" defer></script>
<script src="{a}js/vendor/lenis.min.js?v={V}" defer></script>
{js}
<script src="{a}js/app.js?v={V}" defer></script>
</body>
</html>'''


def kicker(t, n=None):
    return '<p class="kk">%s<span>%s</span></p>' % (('<em>%s</em>' % n) if n else "", t)


def page_hero(slug, kick, title, lead, crumbs=None, art=""):
    cr = '<nav class="crumb"><a href="%s">%s</a><i>/</i><span>%s</span></nav>' % (link("index"), T("Home", "الرئيسية"), crumbs or kick)
    return f'''
<section class="ph">
  <canvas class="ph-cv" data-rays></canvas>
  <div class="ph-eagle ph-3d" aria-hidden="true"><img src="{A()}img/3d/{T('e-34','e-34r')}.webp" alt="" width="1400" height="560" decoding="async"></div>
  <div class="wrap ph-in">
    {cr}
    {kicker(kick)}
    <h1 class="ph-t" data-split>{title}</h1>
    <p class="ph-l">{lead}</p>
    {art}
  </div>
</section>'''


def cta():
    return f'''
<section class="cta">
  <canvas class="cta-cv" data-rays="burst"></canvas>
  <div class="wrap cta-in">
    {kicker(T('Extension','امتداد لمكتبك'))}
    <h2 data-split>{T('Our office is an extension of your office.','مكتبنا امتدادٌ لمكتبك.')}</h2>
    <p>{T('Ask us for a fee quotation free of charge and get a response within 24 hours. Our quoted charges are highly competitive and inclusive of all disbursements up to registration.','اطلب عرض أتعاب مجانيًا واحصل على الرد خلال 24 ساعة. أتعابنا تنافسية للغاية وتشمل جميع المصروفات حتى التسجيل.')}</p>
    <div class="cta-b"><a class="btn btn-l" href="{link('contact')}"><span>{T('Request a free quotation','اطلب عرض أتعاب مجاني')}</span>{arrow()}</a>
    <a class="btn btn-g" href="mailto:{EMAIL}"><span>{EMAIL}</span></a></div>
  </div>
</section>'''


def build():
    global LANG
    import pages
    for LANG_ in ("ar", "en"):
        LANG = LANG_
        pages.LANG = LANG_
        out = ROOT if LANG == "ar" else os.path.join(ROOT, "en")
        os.makedirs(out, exist_ok=True)
        for slug, fn in pages.PAGES:
            _uid[0] = 0
            html_ = fn()
            with open(os.path.join(out, slug + ".html"), "w", encoding="utf-8") as f:
                f.write(html_)
    print("built", len(pages.PAGES) * 2, "pages")


if __name__ == "__main__":
    import sys
    sys.modules["build"] = sys.modules["__main__"]
    build()
