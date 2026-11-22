# -*- coding: utf-8 -*-
"""Static site generator for AAA For Intellectual Property.
Run:  python3 src/build.py   -> ./*.html (Arabic, root) and ./en/*.html (English)
"""
import os, re, json, sys, html as H
from content import *

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = '4'
L = 'ar'
LANGS = ['ar', 'en', 'fr', 'es', 'de', 'zh', 'ru']
LNAME = {'ar': 'العربية', 'en': 'English', 'fr': 'Français', 'es': 'Español', 'de': 'Deutsch', 'zh': '中文', 'ru': 'Русский'}
LCODE = {'ar': 'ع', 'en': 'EN', 'fr': 'FR', 'es': 'ES', 'de': 'DE', 'zh': '中', 'ru': 'RU'}
_I18N = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'i18n')
sys.path.insert(0, _I18N)
IDX = {s: i for i, s in enumerate(json.load(open(os.path.join(_I18N, 'keys.json'), encoding='utf-8')))}
TR = {l: __import__(l).T for l in LANGS[2:]}
MISS = set()
HQ = {'ar': 'القاهرة · المقر', 'en': 'CAIRO · HQ', 'fr': 'LE CAIRE · SIÈGE', 'es': 'EL CAIRO · SEDE', 'de': 'KAIRO · SITZ', 'zh': '开罗 · 总部', 'ru': 'КАИР · ШТАБ'}

PAGES = ['index', 'about', 'services', 'protection', 'litigation', 'corporate', 'related',
         'jurisdictions', 'team', 'policies', 'contact']
SERVICE_PAGES = ('protection', 'litigation', 'corporate', 'related')


def t(x):
    if isinstance(x, tuple):
        if L == 'ar':
            return x[1]
        if L == 'en':
            return x[0]
        i = IDX.get(x[0])
        if i is None:
            MISS.add(x[0])
            return x[0]
        return TR[L][i]
    return x


def lurl(lang, page):
    """Relative link from the current page to `page` in `lang`."""
    return A('') + ('' if lang == 'ar' else lang + '/') + href(page)


def e(x):
    return H.escape(t(x), quote=True)


def A(p=''):
    return ('' if L == 'ar' else '../') + p


def href(p):
    return 'index.html' if p == 'index' else p + '.html'


def ar():
    return L == 'ar'


# ------------------------------------------------------------------ icons
IC = {
    'arrow': '<path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    'wa': '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/>',
    'mail': '<path d="M3 6h18v12H3zM3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    'phone': '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    'clock': '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    'pin': '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    'check': '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    'plus': '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    'fb': '<path fill="currentColor" d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3A21 21 0 0 0 14.6 2C12.2 2 10.6 3.5 10.6 6.2v2.3H8v3.3h2.6V22H14V11.8h2.7l.4-3.3z"/>',
    'ig': '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/>',
    'li': '<path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/>',
    'x': '<path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/>',
}


def icon(k, cls='ic'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{IC[k]}</svg>'


# ------------------------------------------------------------------ the seal (logo rebuilt as vector)
def _a(x):
    """One 'A' of the AAA mark: flat apex, triangular counter (evenodd)."""
    y = 118
    pts = [(0, 105), (30, 0), (62, 0), (92, 105), (66, 105), (59.5, 82), (32.5, 82), (26, 105)]
    o = 'M' + ' L'.join(f'{x + a:.1f} {y + b:.1f}' for a, b in pts) + 'Z'
    c = f'M{x + 37:.1f} {y + 63}L{x + 46:.1f} {y + 27}L{x + 55:.1f} {y + 63}Z'
    return o + c


def seal(cls='seal', sid='s', title=True):
    import math
    dots = ''.join(
        f'<circle class="s-dot" cx="{300 + 246 * math.cos(math.radians(i * 360 / 48 - 90)):.1f}" cy="{300 + 246 * math.sin(math.radians(i * 360 / 48 - 90)):.1f}" r="4.6"/>'
        for i in range(48) if not (abs(246 * math.sin(math.radians(i * 360 / 48 - 90))) < 70))
    aaa = ''.join(f'<path class="s-a" d="{_a(x)}" fill-rule="evenodd"/>' for x in (154, 254, 354))
    lbl = f'<title>{e(BRAND)}</title>' if title else ''
    return f'''<svg class="{cls}" viewBox="0 0 600 600" role="img" aria-label="{e(BRAND)}">{lbl}
<defs><clipPath id="{sid}c"><circle cx="300" cy="300" r="280"/></clipPath>
<linearGradient id="{sid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C9A574"/><stop offset=".45" stop-color="#A57F55"/><stop offset=".7" stop-color="#E2C89A"/><stop offset="1" stop-color="#93704A"/></linearGradient>
<linearGradient id="{sid}sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<g class="s-body">
<circle class="s-disc" cx="300" cy="300" r="280" fill="#fff"/>
<path class="s-ring" fill="#1E2766" fill-rule="evenodd" d="M300 20a280 280 0 1 0 0 560a280 280 0 1 0 0-560zM300 88a212 212 0 1 1 0 424a212 212 0 1 1 0-424z"/>
<circle class="s-hair" cx="300" cy="300" r="291" fill="none" stroke="url(#{sid}g)" stroke-width="2"/>
<g class="s-dots" fill="#fff">{dots}</g>
<g clip-path="url(#{sid}c)"><rect class="s-band" x="0" y="232" width="600" height="136" fill="#fff"/></g>
<rect class="s-line s-l1" x="38" y="236" width="524" height="7" fill="#1E2766"/>
<rect class="s-line s-l2" x="38" y="356" width="524" height="7" fill="#1E2766"/>
<text class="s-t1" x="300" y="306" text-anchor="middle" textLength="500" lengthAdjust="spacingAndGlyphs" fill="#1E2766">FOR INTELLECTUAL PROPERTY</text>
<text class="s-t2" x="292" y="341" text-anchor="middle" textLength="300" lengthAdjust="spacing" fill="#1E2766">ABDELHAMED ADEL</text>
<g class="s-tm"><circle cx="487" cy="332" r="12" fill="none" stroke="#1E2766" stroke-width="2.4"/><text x="487" y="336.5" text-anchor="middle" font-size="11" font-weight="700" fill="#1E2766" font-family="Manrope,Arial,sans-serif">TM</text></g>
<g class="s-aaa" fill="url(#{sid}g)">{aaa}</g>
<g class="s-scales" fill="url(#{sid}g)">
  <g class="s-stand"><rect x="262" y="462" width="76" height="9" rx="1.5"/><rect x="274" y="452" width="52" height="9" rx="1.5"/><rect x="292" y="398" width="16" height="54"/><rect x="286" y="394" width="28" height="6" rx="2"/><circle cx="300" cy="384" r="8"/></g>
  <g class="s-beam"><path d="M232 397q68-10 136 0v5q-68-9-136 0z"/><circle cx="232" cy="399.5" r="4"/><circle cx="368" cy="399.5" r="4"/>
    <g class="s-pan s-pan-l"><path d="M232 401L216 437M232 401L248 437" stroke="url(#{sid}g)" stroke-width="2.2" fill="none"/><path d="M210 437h44a22 11 0 0 1-44 0z"/></g>
    <g class="s-pan s-pan-r"><path d="M368 401L352 437M368 401L384 437" stroke="url(#{sid}g)" stroke-width="2.2" fill="none"/><path d="M346 437h44a22 11 0 0 1-44 0z"/></g>
  </g>
</g>
<g clip-path="url(#{sid}c)"><rect class="s-shine" x="-260" y="-40" width="160" height="700" fill="url(#{sid}sh)" transform="rotate(18 300 300)" opacity="0"/></g>
</g></svg>'''


def guilloche_frame():
    return '<canvas class="gl" aria-hidden="true"></canvas>'


# ------------------------------------------------------------------ layout pieces
def head(page, title, desc):
    full = f'{t(BRAND)} | {t(TAGLINE)}' if page == 'index' else f'{title} | {t(BRAND)}'
    alts = '\n'.join(f'<link rel="alternate" hreflang="{l}" href="{lurl(l, page)}">' for l in LANGS)
    gf = {'zh': 'family=Noto+Sans+SC:wght@300;400;500;700',
          'ru': 'family=Manrope:wght@300..800&family=IBM+Plex+Mono:wght@400;500'}.get(L)
    gfl = f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?{gf}&display=swap">' if gf else ''
    pre_ar = f'<link rel="preload" href="{A("assets/fonts/IBMPlexSansArabic-600n-arabic.woff2")}" as="font" type="font/woff2" crossorigin>' if ar() else f'<link rel="preload" href="{A("assets/fonts/InterTight-300_700n-latin.woff2")}" as="font" type="font/woff2" crossorigin>'
    return f'''<!doctype html>
<html lang="{L}" dir="{'rtl' if ar() else 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{H.escape(full)}</title>
<meta name="description" content="{H.escape(desc)}">
<meta name="theme-color" content="#0B1033">
<meta property="og:title" content="{H.escape(full)}">
<meta property="og:description" content="{H.escape(desc)}">
<meta property="og:image" content="{A('assets/img/og.jpg')}">
{alts}
<script>(function(d){{d.classList.add('js');try{{var m=localStorage.getItem('aaa-theme');if(m==='dark')d.setAttribute('data-theme','dark')}}catch(e){{}}}})(document.documentElement)</script>
<link rel="icon" href="{A('assets/img/favicon.svg')}" type="image/svg+xml">
{pre_ar}
<link rel="preload" href="{A('assets/fonts/Manrope-300_800n-latin.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{A('assets/css/fonts.css')}?v={V}">
{gfl}
<link rel="stylesheet" href="{A('assets/css/aaa.css')}?v={V}">
</head>
<body class="pg-{page}" data-page="{page}">
<a class="skip" href="#main">{e(('Skip to content', 'تخطَّ إلى المحتوى'))}</a>
'''


def brand_mark(cls=''):
    return f'''<span class="bm {cls}"><svg class="bm-seal" viewBox="0 0 600 600" aria-hidden="true"><use href="#seal-sym"/></svg><span class="bm-t"><b>AAA</b><small>{e(('For Intellectual Property', 'للملكية الفكرية'))}</small></span></span>'''


def sprite():
    s = seal('', 'sy', title=False)
    inner = s[s.index('>') + 1:s.rindex('</svg>')]
    return f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="seal-sym" viewBox="0 0 600 600">{inner}</symbol></svg>'


def is_cur(k, page):
    return k == page or (k == 'services' and page in SERVICE_PAGES)


def header(page):
    langs = ''.join(f'<a href="{lurl(l, page)}" hreflang="{l}" lang="{l}"{" aria-current=true" if l == L else ""}><b>{LCODE[l]}</b><span>{LNAME[l]}</span></a>' for l in LANGS)
    items = ''
    for k, n in NAV[1:]:
        cur = ' aria-current="page"' if is_cur(k, page) else ''
        if k == 'services':
            sub = ''.join(f'<a class="dd-i" href="{a["key"]}.html"><span class="dd-n">{a["n"]}</span><span class="dd-t">{e(a["name"])}</span><span class="dd-d">{e(a["lead"])}</span></a>' for a in AREAS)
            items += f'<li class="has-dd"><a href="services.html"{cur}>{e(n)}<svg viewBox="0 0 10 6" class="caret"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></a><div class="dd"><div class="dd-in">{sub}</div></div></li>'
        elif k != 'contact':
            items += f'<li><a href="{href(k)}"{cur}>{e(n)}</a></li>'
    return f'''{sprite()}
<header class="hdr" id="hdr">
  <div class="hdr-in">
    <a class="hdr-brand" href="index.html" aria-label="{e(BRAND)}">{brand_mark()}</a>
    <nav class="nav" aria-label="main"><ul>{items}</ul></nav>
    <div class="hdr-act">
      <button class="thm" type="button" aria-label="Light / Dark"><svg class="thm-s" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><svg class="thm-m" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg></button>
      <div class="lng"><button class="lang" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Language"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span>{LCODE[L]}</span></button><div class="lng-m">{langs}</div></div>
      <a class="btn btn-gold btn-sm hdr-cta" href="contact.html"><span>{e(('Contact Us', 'تواصل معنا'))}</span></a>
      <button class="burger" aria-label="menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>
{menu(page)}'''


def menu(page):
    nav = ''.join(f'<li><a href="{href(k)}"{" aria-current=page" if is_cur(k, page) else ""}><span class="mo-n">{i + 1:02d}</span><span class="mo-t">{e(n)}</span></a></li>' for i, (k, n) in enumerate(NAV))
    svc = ''.join(f'<a href="{a["key"]}.html">{e(a["name"])}</a>' for a in AREAS)
    return f'''<div class="mo" id="mo" aria-hidden="true">
  {guilloche_frame()}
  <div class="mo-in">
    <ul class="mo-nav">{nav}</ul>
    <div class="mo-side">
      <div class="mo-k">{e(('Practice areas', 'مجالات الممارسة'))}</div>
      <div class="mo-svc">{svc}</div>
      <div class="mo-k">{e(('Direct line', 'تواصل مباشر'))}</div>
      <a class="mo-c" href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener" dir="ltr">{CONTACT['phone']}</a>
      <a class="mo-c" href="mailto:{CONTACT['email']}">{CONTACT['email']}</a>
      <div class="mo-lng">{''.join(f'<a href="{lurl(l, page)}" hreflang="{l}" lang="{l}"{" aria-current=true" if l == L else ""}>{LNAME[l]}</a>' for l in LANGS)}</div>
    </div>
  </div>
</div>'''


def socials(cls='soc'):
    s = [('fb', CONTACT['fb'], 'Facebook'), ('ig', CONTACT['ig'], 'Instagram'), ('li', CONTACT['li'], 'LinkedIn'), ('x', CONTACT['x'], 'X')]
    return f'<div class="{cls}">' + ''.join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{n}">{icon(k)}</a>' for k, u, n in s) + '</div>'


def footer():
    svc = ''.join(f'<li><a href="{a["key"]}.html">{e(a["name"])}</a></li>' for a in AREAS)
    firm = ''.join(f'<li><a href="{href(k)}">{e(n)}</a></li>' for k, n in NAV[1:] if k != 'services')
    hours = ''.join(f'<li><span>{e(d)}</span><b dir="ltr">{e(h)}</b></li>' for d, h in HOURS)
    return f'''<footer class="ftr">
  {guilloche_frame()}
  <div class="wrap">
    <div class="ftr-hero">
      <svg class="ftr-seal" viewBox="0 0 600 600" aria-hidden="true"><use href="#seal-sym"/></svg>
      <div><p class="ftr-k">{e(('Don’t wait.', 'لا تنتظر.'))}</p>
      <h2 class="ftr-h">{e(('The sooner you have a plan, the better your chances.', 'كلما وضعت خطتك مبكراً، كانت فرصك أفضل.'))}</h2>
      <div class="ftr-cta"><a class="btn btn-gold" href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener">{icon('wa')}<span>{e(('WhatsApp us', 'راسلنا واتساب'))}</span></a><a class="btn btn-line" href="contact.html"><span>{e(('Send an inquiry', 'أرسل استفساراً'))}</span>{icon('arrow', 'ic flip')}</a></div></div>
    </div>
    <div class="ftr-cols">
      <div class="ftr-brand">{brand_mark('bm-lg')}<p>{e(('An Intellectual Property law firm based in Cairo, with representation worldwide.', 'مكتب محاماة متخصص في الملكية الفكرية، مقرّه القاهرة، وله تمثيل حول العالم.'))}</p>{socials()}</div>
      <div><h4>{e(('Practice', 'الممارسة'))}</h4><ul>{svc}</ul></div>
      <div><h4>{e(('The Firm', 'المكتب'))}</h4><ul>{firm}</ul></div>
      <div><h4>{e(('Contact', 'تواصل'))}</h4><ul class="ftr-c"><li><a href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener" dir="ltr">{CONTACT['phone']}</a></li><li><a href="mailto:{CONTACT['email']}">{CONTACT['email']}</a></li><li><a href="mailto:{CONTACT['pr_email']}">{CONTACT['pr_email']}</a></li><li>{e(CONTACT['city'])}</li></ul><ul class="ftr-h2">{hours}</ul></div>
    </div>
    <div class="ftr-micro" aria-hidden="true"><span>{('AAA FOR INTELLECTUAL PROPERTY · POWER OF PROTECTION · ' * 8)}</span></div>
    <div class="ftr-bot"><span>© 2026 {e(BRAND)}. {e(('All rights reserved.', 'جميع الحقوق محفوظة.'))}</span><a href="policies.html">{e(('Policies & disclaimer', 'السياسات وإخلاء المسؤولية'))}</a></div>
  </div>
</footer>
<a class="wa-fab" href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener" aria-label="WhatsApp">{icon('wa')}</a>'''


def scripts(page):
    extra = f'<script src="{A("assets/js/map-data.js")}?v={V}" defer></script>' if page in ('index', 'jurisdictions') else ''
    return f'''<script src="{A('assets/js/vendor/gsap.min.js')}" defer></script>
<script src="{A('assets/js/vendor/ScrollTrigger.min.js')}" defer></script>
<script src="{A('assets/js/vendor/lenis.min.js')}" defer></script>
{extra}<script src="{A('assets/js/app.js')}?v={V}" defer></script>
</body></html>'''


# ------------------------------------------------------------------ shared blocks
def eyebrow(txt, n=None):
    num = f'<span class="eb-n">{n}</span>' if n else ''
    return f'<div class="eb">{num}<span class="eb-l"></span><span>{e(txt)}</span></div>'


def title(txt, tag='h2', cls=''):
    """Title with words wrapped for reveal; segment in {braces} gets the gold italic accent.
    Chinese has no spaces, so it is wrapped per character (Latin runs stay whole)."""
    s = t(txt)
    out = []
    for seg in re.split(r'(\{[^}]*\})', s):
        if not seg:
            continue
        acc = seg.startswith('{')
        seg = seg.strip('{}')
        toks = re.findall(r'[A-Za-z0-9+&.\-]+|\s+|.', seg) if L == 'zh' else re.split(r'(\s+)', seg)
        for w in toks:
            if not w:
                continue
            if w.isspace():
                out.append(' ')
            else:
                out.append(f'<span class="w{" ac" if acc else ""}"><span>{H.escape(w)}</span></span>')
    return f'<{tag} class="tt {cls}">{"".join(out).strip()}</{tag}>'


def page_hero(page, n, kicker, ttl, lead, crumbs=None):
    cr = f'<a href="index.html">{e(NAV[0][1])}</a>'
    for c in (crumbs or []):
        cr += f'<i>/</i><a href="{c[0]}">{e(c[1])}</a>'
    cr += f'<i>/</i><span>{e(kicker)}</span>'
    return f'''<section class="ph">
  {guilloche_frame()}
  <svg class="ph-seal" viewBox="0 0 600 600" aria-hidden="true"><g fill="none" stroke="#C9A574"><circle cx="300" cy="300" r="290" stroke-width="1"/><circle cx="300" cy="300" r="280" stroke-width="2"/><circle cx="300" cy="300" r="212" stroke-width="2"/><circle cx="300" cy="300" r="246" stroke-width="6" stroke-dasharray="1 15" stroke-linecap="round"/><path d="M38 239h524M38 360h524" stroke-width="2"/></g><g fill="none" stroke="#C9A574" stroke-width="2">{''.join(f'<path d="{_a(x)}"/>' for x in (154, 254, 354))}</g></svg>
  <div class="wrap ph-in">
    <nav class="crumbs" aria-label="breadcrumb">{cr}</nav>
    <div class="ph-doc"><span>DOC. AAA/{n}</span><span class="ph-dl"></span><span>{e(kicker)}</span></div>
    {title(ttl, 'h1', 'ph-t')}
    <p class="ph-lead rv">{e(lead)}</p>
  </div>
  <div class="ph-strip" aria-hidden="true"><span>{('® · ™ · © · PATENT · DESIGN · ' * 12)}</span></div>
</section>'''


def cta_band():
    return f'''<section class="cta">
  <div class="wrap cta-in rv">
    <div class="cta-stamp" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="cta-c" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs><text><textPath href="#cta-c">PROTECTED · REGISTERED · ENFORCED · </textPath></text><circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" stroke-width="1"/><text x="100" y="112" text-anchor="middle" class="cta-r">®</text></svg></div>
    <div class="cta-txt">
      {title(('Have an {inquiry?}', 'لديك {استفسار؟}'), 'h2')}
      <p>{e(POLICY_PLAIN)}</p>
    </div>
    <div class="cta-act"><a class="btn btn-navy" href="contact.html"><span>{e(('Start the conversation', 'ابدأ المحادثة'))}</span>{icon('arrow', 'ic flip')}</a><a class="btn btn-line-d" href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener">{icon('wa')}<span dir="ltr">{CONTACT['phone']}</span></a></div>
  </div>
</section>'''


def right_card(r, i, link=True):
    tag = 'a' if link else 'div'
    hr = f' href="protection.html#{r["key"]}"' if link else ''
    return f'''<{tag} class="cert holo rv"{hr} style="--d:{i * 0.06:.2f}s">
  <div class="cert-top"><span class="cert-no">REG. {r['code']}-{i + 1:03d}</span><span class="cert-st">{e(('Protected', 'محميّ'))}</span></div>
  <div class="cert-g g-{r['key']}" aria-hidden="true">{glyph(r['key'])}</div>
  <h3>{e(r['name'])}</h3>
  <p>{e(r['short'])}</p>
  <span class="cert-more">{e(('Details', 'التفاصيل'))}{icon('arrow', 'ic flip')}</span>
</{tag}>'''


def glyph(k):
    G = {
        'trademarks': '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44"/><text x="60" y="74" text-anchor="middle">TM</text></svg>',
        'patents': '<svg viewBox="0 0 120 120"><path d="M60 18a26 26 0 0 0-15 47v10h30V65a26 26 0 0 0-15-47zM47 84h26M50 93h20M60 36v18M52 46h16"/></svg>',
        'designs': '<svg viewBox="0 0 120 120"><path d="M60 16l38 22v44L60 104 22 82V38z"/><path d="M60 16v44l38 22M60 60L22 82"/></svg>',
        'copyrights': '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44"/><path d="M76 46a20 20 0 1 0 0 28"/></svg>',
        'plant': '<svg viewBox="0 0 120 120"><path d="M60 104V52M60 70c-24 0-32-18-32-36 22 0 32 14 32 36zM60 58c0-22 12-36 34-36 0 22-10 36-34 36z"/></svg>',
        'domains': '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="44"/><path d="M16 60h88M60 16c-16 18-16 70 0 88M60 16c16 18 16 70 0 88M24 38h72M24 82h72"/></svg>',
    }
    return G[k]


# ------------------------------------------------------------------ pages
def p_index():
    rights = ''.join(right_card(r, i) for i, r in enumerate(RIGHTS))
    areas = ''.join(f'''<a class="ar-row rv" href="{a['key']}.html">
  <span class="ar-n">{a['n']}</span>
  <span class="ar-name">{e(a['name'])}</span>
  <span class="ar-items">{' · '.join(e(x) for x in a['items'])}</span>
  <span class="ar-go">{icon('arrow', 'ic flip')}</span>
</a>''' for a in AREAS)
    why = ''.join(f'''<li class="cl rv"><span class="cl-n">§ {i + 1:02d}</span><div><h3>{e(a)}</h3><p>{e(b)}</p></div>{'<span class="stamp">' + e(('Free of charge', 'بدون رسوم')) + '</span>' if f else ''}</li>''' for i, (a, b, f) in enumerate(WHY))
    stats = ''.join(f'<div class="st rv"><b><span class="cnt" data-to="{n}">{n}</span><em>{e(s)}</em></b><span>{e(l)}</span></div>' for n, s, l in STATS)
    proc = ''.join(f'''<li class="pr-s"><span class="pr-dot"></span><span class="pr-k">{e(k)}</span><h3>{e(a)}</h3><p>{e(b)}</p></li>''' for a, b, k in PROCESS)
    beliefs = ''.join(f'<div class="bl rv"><span class="bl-n">0{i + 1}</span><h3>{e(a)}</h3><p>{e(b)}</p></div>' for i, (a, b) in enumerate(BELIEFS))
    jl = ''.join(f'<button class="jt" data-r="{j["key"]}"><span class="jt-c">{j["code"]}</span><span>{e(j["name"])}</span></button>' for j in JUR[:7])
    d = DIRECTORS[0]
    return f'''{intro()}
<section class="hero">
  {guilloche_frame()}
  <div class="hero-grain" aria-hidden="true"></div>
  <div class="wrap hero-in">
    <div class="hero-txt">
      <div class="hero-eb"><span class="hero-dot"></span>{e(('Intellectual Property Law Firm · Cairo', 'مكتب محاماة للملكية الفكرية · القاهرة'))}</div>
      <h1 class="hero-t"><span class="w"><span>{e(('Power of', 'قوّة'))}</span></span> <span class="w ac"><span>{e(('Protection.', 'الحماية.'))}</span></span></h1>
      <p class="hero-p">{e(('A well-established Intellectual Property law firm providing professional services in trademarks, patents, industrial designs & copyrights — across Egypt, the Middle East and Africa.', 'مكتب محاماة راسخ في الملكية الفكرية، يقدّم خدمات مهنية في العلامات التجارية وبراءات الاختراع والنماذج الصناعية وحقوق المؤلف، في مصر والشرق الأوسط وأفريقيا.'))}</p>
      <div class="hero-cta"><a class="btn btn-gold" href="contact.html"><span>{e(('Protect your rights', 'احمِ حقوقك'))}</span>{icon('arrow', 'ic flip')}</a><a class="btn btn-line" href="services.html"><span>{e(('Our services', 'خدماتنا'))}</span></a></div>
    </div>
    <div class="hero-seal-wrap">
      <svg class="hero-ring" viewBox="0 0 700 700" aria-hidden="true"><defs><path id="hr-c" d="M350 350m-322 0a322 322 0 1 1 644 0a322 322 0 1 1-644 0"/></defs><text><textPath href="#hr-c" textLength="2010">{'AAA FOR INTELLECTUAL PROPERTY ✦ POWER OF PROTECTION ✦ TRADEMARKS ✦ PATENTS ✦ DESIGNS ✦ COPYRIGHTS ✦ '}</textPath></text></svg>
      <div class="hero-seal tilt">{seal('seal hero-s', 'h')}</div>
    </div>
  </div>
  <div class="wrap hero-strip">
    <div><span>{e(('Reg. No.', 'رقم القيد'))}</span><b dir="ltr">AAA-IP / EG</b></div>
    <div><span>{e(('Jurisdiction', 'النطاق'))}</span><b>{e(('Egypt · Middle East · Africa', 'مصر · الشرق الأوسط · أفريقيا'))}</b></div>
    <div><span>{e(('Record', 'السجل'))}</span><b>{e(('5000+ successful cases', '+5000 قضية ناجحة'))}</b></div>
    <div><span>{e(('Status', 'الحالة'))}</span><b class="ok"><i></i>{e(('Protected', 'محميّ'))}</b></div>
  </div>
</section>

<div class="mq" aria-hidden="true"><div class="mq-t">{''.join(f'<span>{e(r["name"])}</span><i>✦</i>' for r in RIGHTS) * 3}</div></div>

<section class="sec paper intro-s">
  <div class="wrap two">
    <div>{eyebrow(('Welcome', 'أهلاً بك'), '01')}{title(('Your interests {become ours.}', 'مصالحك {تصبح مصالحنا.}'))}</div>
    <div class="intro-r">
      <p class="lead rv">{e(WELCOME)}</p>
      <p class="rv">{e(ABOUT)}</p>
      <a class="lnk rv" href="about.html">{e(('About the firm', 'تعرّف على المكتب'))}{icon('arrow', 'ic flip')}</a>
    </div>
  </div>
  <div class="wrap stats">{stats}</div>
</section>

<section class="sec ink rights-s">
  {guilloche_frame()}
  <div class="wrap">
    <div class="sh">{eyebrow(('The Register', 'سجلّ الحقوق'), '02')}{title(('Six rights. {One firm} to protect them all.', 'ست حقوق. {مكتب واحد} يحميها جميعاً.'))}<p class="sh-p rv">{e(('Every idea you own deserves a certificate. We file, prosecute and defend the full spectrum of intellectual property.', 'كل فكرة تملكها تستحق شهادة. نتولّى إيداع الطيف الكامل من حقوق الملكية الفكرية ومتابعته والدفاع عنه.'))}</p></div>
    <div class="certs">{rights}</div>
  </div>
</section>

<section class="sec paper areas-s">
  <div class="wrap">
    <div class="sh sh-row">{eyebrow(('Practice Areas', 'مجالات الممارسة'), '03')}{title(('Four departments, {one standard.}', 'أربع إدارات، {ومعيار واحد.}'))}</div>
    <div class="ar-list">{areas}</div>
  </div>
</section>

<section class="sec ink2 proc-s">
  <div class="wrap">
    <div class="sh">{eyebrow(('From filing to protection', 'من الإيداع إلى الحماية'), '04')}{title(('The life of an {Egyptian trademark.}', 'رحلة {علامة تجارية} في مصر.'))}<p class="sh-p rv">{e(('Six stages, each with its deadline. Our reminder system tracks every one of them for you.', 'ست مراحل، لكل منها موعدها. ونظام التذكير لدينا يتابعها جميعاً نيابةً عنك.'))}</p></div>
    <ol class="pr">{proc}<li class="pr-line" aria-hidden="true"><span></span></li></ol>
  </div>
</section>

<section class="sec paper why-s">
  <div class="wrap two why">
    <div class="why-l">{eyebrow(('Why AAA', 'لماذا AAA'), '05')}{title(('Two privileges, {never one without the other.}', 'ميزتان، {لا تنفصل إحداهما عن الأخرى.}'))}<p class="rv">{e(('High-quality service and competitive charges — written into how we work, clause by clause.', 'خدمة عالية الجودة وأتعاب تنافسية، مكتوبة في طريقة عملنا، بنداً بنداً.'))}</p>
      <div class="why-seal" aria-hidden="true"><svg viewBox="0 0 600 600"><use href="#seal-sym"/></svg></div></div>
    <ol class="clauses">{why}</ol>
  </div>
</section>

<section class="sec ink map-s">
  <div class="wrap">
    <div class="sh sh-row">{eyebrow(('Jurisdictions', 'النطاق الدولي'), '06')}{title(('Protected {wherever} your client needs.', 'حماية {أينما} احتاج عميلك.'))}</div>
    <div class="map-box rv"><canvas class="map" data-mode="teaser" data-hq="{HQ[L]}" aria-label="{e(('World map of AAA jurisdictions', 'خريطة نطاق عمل AAA'))}"></canvas>
      <div class="map-tabs">{jl}</div>
    </div>
    <p class="map-note rv">{e(NETWORK)} <a class="lnk" href="jurisdictions.html">{e(('Explore jurisdictions', 'استكشف النطاق الدولي'))}{icon('arrow', 'ic flip')}</a></p>
  </div>
</section>

<section class="sec paper bel-s">
  <div class="wrap">
    <div class="sh">{eyebrow(('Our Beliefs', 'قناعاتنا'), '07')}{title(('The backbone of {our service model.}', 'العمود الفقري {لنموذج خدماتنا.}'))}</div>
    <div class="bls">{beliefs}</div>
  </div>
</section>

<section class="sec ink2 lead-s">
  <div class="wrap lead-in">
    <div class="medal rv" aria-hidden="true"><canvas class="medal-g"></canvas>{medal_name(d)}</div>
    <div>
      {eyebrow(('Founder', 'المؤسس'), '08')}
      <blockquote class="q rv">“{e(d['role'])}”</blockquote>
      <div class="q-by rv"><b>{e(d['name'])}</b><span>{e(d['title'])}</span></div>
      <a class="lnk rv" href="team.html">{e(('Meet the team', 'تعرّف على الفريق'))}{icon('arrow', 'ic flip')}</a>
    </div>
  </div>
</section>
{cta_band()}'''


def intro():
    return f'''<div class="intro" id="intro" aria-hidden="true">
  <svg class="intro-g" viewBox="-400 -400 800 800"></svg>
  <div class="intro-seal">{seal('seal intro-s', 'i', title=False)}</div>
  <div class="intro-cap"><span>{e(('POWER OF PROTECTION', 'قوّة الحماية'))}</span></div>
  <div class="intro-reg"><span class="intro-c">0000</span><span>/ REG.</span></div>
  <button class="intro-skip">{e(('Skip', 'تخطَّ'))}</button>
</div>'''


def medal_name(d):
    n = t(d['name']).rsplit(' ', 1)
    return f'<span class="mn"><b>{H.escape(n[0])}</b><b>{H.escape(n[1])}</b><i></i><small>{e(d["title"])}</small></span>'


def p_about():
    why = ''.join(f'<li class="cl rv"><span class="cl-n">§ {i + 1:02d}</span><div><h3>{e(a)}</h3><p>{e(b)}</p></div>{"<span class=stamp>" + e(("Free of charge", "بدون رسوم")) + "</span>" if f else ""}</li>' for i, (a, b, f) in enumerate(WHY))
    serve = ''.join(f'<div class="sv rv"><span class="sv-n">0{i + 1}</span><h3>{e(a)}</h3><p>{e(b)}</p></div>' for i, (a, b) in enumerate(SERVE))
    beliefs = ''.join(f'<div class="bl rv"><span class="bl-n">0{i + 1}</span><h3>{e(a)}</h3><p>{e(b)}</p></div>' for i, (a, b) in enumerate(BELIEFS))
    return f'''{page_hero('about', '01', ('The Firm', 'عن المكتب'), ('A firm built on {the power of protection.}', 'مكتب قام على {قوّة الحماية.}'), WELCOME)}
<section class="sec paper">
  <div class="wrap two">
    <div>{eyebrow(('About us', 'من نحن'), 'I')}{title(('One of the most active {IP firms} in Egypt.', 'من أنشط {مكاتب الملكية الفكرية} في مصر.'))}</div>
    <div class="intro-r"><p class="lead rv">{e(ABOUT)}</p><p class="rv">{e(NETWORK)}</p></div>
  </div>
</section>
<section class="sec ink goal-s">
  {guilloche_frame()}
  <div class="wrap goal">
    {eyebrow(('Our main goal', 'هدفنا الأساسي'), 'II')}
    <p class="goal-t rv">{e(GOAL)}</p>
  </div>
</section>
<section class="sec paper">
  <div class="wrap two">
    <div>{eyebrow(('Treat your IP', 'اعتنِ بملكيتك الفكرية'), 'III')}{title(('No less than {the standard.}', 'لا أقل من {المعيار.}'))}</div>
    <div class="intro-r"><p class="lead rv">{e(TREAT)}</p><p class="rv">{e(TRAINING)}</p></div>
  </div>
</section>
<section class="sec ink2">
  <div class="wrap">
    <div class="sh">{eyebrow(('Our beliefs', 'قناعاتنا'), 'IV')}{title(('Learning that {never stops.}', 'تعلّم {لا يتوقف.}'))}<p class="sh-p rv">{e(BELIEF_LONG)}</p></div>
    <div class="bls dark">{beliefs}</div>
  </div>
</section>
<section class="sec paper why-s">
  <div class="wrap two why">
    <div class="why-l">{eyebrow(('Why us?', 'لماذا نحن؟'), 'V')}{title(('Both privileges, {in writing.}', 'الميزتان معاً، {مكتوبتان.}'))}<p class="rv">{e(('We provide you both privileges: high-quality services plus competitive charges, without affecting our service quality.', 'نقدّم لك الميزتين معاً: خدمات عالية الجودة وأتعاب تنافسية، دون المساس بجودة خدماتنا.'))}</p></div>
    <ol class="clauses">{why}</ol>
  </div>
</section>
<section class="sec ink">
  {guilloche_frame()}
  <div class="wrap">
    <div class="sh">{eyebrow(('Who we serve', 'لمن نعمل'), 'VI')}{title(('From a single idea {to a global portfolio.}', 'من فكرة واحدة {إلى محفظة عالمية.}'))}</div>
    <div class="svs">{serve}</div>
  </div>
</section>
{cta_band()}'''


def p_services():
    blocks = ''.join(f'''<a class="sa rv" href="{a['key']}.html">
  <div class="sa-top"><span class="sa-n">{a['n']}</span><span class="sa-doc">AAA/{a['n']}</span></div>
  <h2>{e(a['name'])}</h2>
  <p>{e(a['lead'])}</p>
  <ul>{''.join(f'<li>{icon("check")}{e(x)}</li>' for x in a['items'])}</ul>
  <span class="cert-more">{e(('Open department', 'افتح القسم'))}{icon('arrow', 'ic flip')}</span>
</a>''' for a in AREAS)
    rights = ''.join(right_card(r, i) for i, r in enumerate(RIGHTS))
    return f'''{page_hero('services', '02', ('Services', 'الخدمات'), ('A full spectrum of {intellectual property.}', 'الطيف الكامل من {الملكية الفكرية.}'), ('To assist small, medium and large organizations & individuals to establish, protect & enforce their intellectual property rights.', 'لمساعدة المؤسسات الصغيرة والمتوسطة والكبيرة والأفراد على إنشاء حقوق ملكيتهم الفكرية وحمايتها وإنفاذها.'))}
<section class="sec paper">
  <div class="wrap"><div class="sas">{blocks}</div></div>
</section>
<section class="sec ink rights-s">
  {guilloche_frame()}
  <div class="wrap">
    <div class="sh">{eyebrow(('The rights we protect', 'الحقوق التي نحميها'), '01')}{title(('Six certificates, {one register.}', 'ست شهادات، {وسجلّ واحد.}'))}</div>
    <div class="certs">{rights}</div>
  </div>
</section>
{cta_band()}'''


def svc_nav(cur):
    return '<nav class="sn">' + ''.join(f'<a href="{a["key"]}.html"{" aria-current=page" if a["key"] == cur else ""}><span>{a["n"]}</span>{e(a["name"])}</a>' for a in AREAS) + '</nav>'


def p_protection():
    tabs = ''.join(f'<a class="rt" href="#{r["key"]}"><span class="rt-g">{glyph(r["key"])}</span><span>{e(r["name"])}</span></a>' for r in RIGHTS)
    secs = ''
    for i, r in enumerate(RIGHTS):
        items = ''.join(f'<li class="rv"><span class="it-n">{i + 1}.{j + 1}</span><p>{e(x)}</p></li>' for j, x in enumerate(r['items']))
        secs += f'''<article class="rd" id="{r['key']}">
  <div class="rd-side">
    <div class="rd-cert holo"><span class="cert-no">REG. {r['code']}-{i + 1:03d}</span><div class="cert-g">{glyph(r['key'])}</div><span class="rd-code">{r['code']}</span></div>
  </div>
  <div class="rd-main">
    {eyebrow(r['name'], f'01.{i + 1}')}
    <h2 class="rd-t rv">{e(r['short'])}</h2>
    <p class="rd-intro rv">{e(r['intro'])}</p>
    <ol class="its">{items}</ol>
  </div>
</article>'''
    a = AREAS[0]
    return f'''{page_hero('protection', '02.1', a['name'], ('Register it. {Own it.} Defend it.', 'سجّلها. {امتلكها.} ودافع عنها.'), a['lead'], [('services.html', NAV[2][1])])}
<section class="sec paper sv-page">
  <div class="wrap">{svc_nav('protection')}<div class="rts">{tabs}</div>{secs}</div>
</section>
{cta_band()}'''


def p_litigation():
    a = AREAS[1]
    rows = ''.join(f'''<article class="lt rv">
  <div class="lt-n">{x['n']}</div>
  <div class="lt-m"><h2>{e(x['name'])}</h2><p>{e(x['text'])}</p></div>
  <ul class="lt-p">{''.join(f'<li>{icon("check")}{e(p)}</li>' for p in x['points'])}</ul>
</article>''' for x in LITIGATION)
    return f'''{page_hero('litigation', '02.2', a['name'], ('When rights are challenged, {we enforce them.}', 'حين تُمسّ الحقوق، {نتولّى إنفاذها.}'), a['lead'], [('services.html', NAV[2][1])])}
<section class="sec paper sv-page">
  <div class="wrap">{svc_nav('litigation')}<div class="lts">{rows}</div></div>
</section>
<section class="sec ink2 gavel-s">
  <div class="wrap two">
    <div>{eyebrow(('Cease & desist', 'إنذار الكفّ عن التعدي'), '§')}{title(('Resolved to a {successful conclusion.}', 'حتى {النهاية الناجحة.}'))}</div>
    <div class="intro-r"><p class="lead rv">{e(('In every infringement — trademark, patent, design or copyright — we prepare the cease and desist letter and pursue the situation until it is resolved. Where needed, we take it to court.', 'في كل حالة تعدٍّ، على علامة أو براءة أو نموذج أو حق مؤلف، نُعدّ إنذار الكفّ عن التعدي ونتابع الحالة حتى تُحسم، وإن لزم الأمر نمضي بها إلى القضاء.'))}</p></div>
  </div>
</section>
{cta_band()}'''


def p_corporate():
    a = AREAS[2]
    rows = ''.join(f'<div class="cp rv"><span class="cp-n">03.{i + 1}</span><h3>{e(x["name"])}</h3><p>{e(x["text"])}</p></div>' for i, x in enumerate(CORPORATE))
    return f'''{page_hero('corporate', '02.3', a['name'], ('Companies built on {solid legal ground.}', 'شركات تقوم على {أرض قانونية صلبة.}'), a['lead'], [('services.html', NAV[2][1])])}
<section class="sec paper sv-page">
  <div class="wrap">{svc_nav('corporate')}
    <div class="two cp-head"><div>{eyebrow(('Companies Services & Incorporation Department', 'إدارة خدمات الشركات والتأسيس'), '03')}{title(('Led by a {companies incorporation attorney.}', 'بقيادة {محامي تأسيس الشركات.}'))}</div><p class="lead rv">{e(('Our Companies Services & Incorporation Department is directed by Mr. Mohamed Adel, Consultant & Partner — handling the life of your company from incorporation to restructuring.', 'تتولّى إدارة خدمات الشركات والتأسيس، بإدارة الأستاذ محمد عادل المستشار والشريك، حياة شركتك من التأسيس حتى إعادة الهيكلة.'))}</p></div>
    <div class="cps">{rows}</div>
  </div>
</section>
{cta_band()}'''


def p_related():
    a = AREAS[3]
    rows = ''.join(f'<article class="lt rv"><div class="lt-n">{x["n"]}</div><div class="lt-m"><h2>{e(x["name"])}</h2><p>{e(x["text"])}</p></div></article>' for x in RELATED)
    return f'''{page_hero('related', '02.4', a['name'], ('The details that {complete a brand.}', 'التفاصيل التي {تكتمل بها العلامة.}'), a['lead'], [('services.html', NAV[2][1])])}
<section class="sec paper sv-page">
  <div class="wrap">{svc_nav('related')}<div class="lts">{rows}</div></div>
</section>
{cta_band()}'''


def p_jurisdictions():
    tabs = ''.join(f'<button class="jt" data-r="{j["key"]}" role="tab"><span class="jt-c">{j["code"]}</span><span>{e(j["name"])}</span></button>' for j in JUR)
    panels = ''
    for j in JUR:
        blocks = ''.join(f'<div class="jb"><h3>{e(h)}</h3><ul>{"".join(f"<li>{e(x)}</li>" for x in items)}</ul></div>' for h, items in j['blocks'])
        if not j['blocks']:
            blocks = f'<div class="jb jb-cta"><a class="btn btn-navy" href="contact.html"><span>{e(("Have an inquiry?", "لديك استفسار؟"))}</span>{icon("arrow", "ic flip")}</a></div>'
        panels += f'''<div class="jp" data-r="{j['key']}" role="tabpanel" hidden>
  <div class="jp-h"><span class="jp-code">{j['code']}</span><div><h2>{e(j['name'])}</h2><p class="jp-o">{e(j['office'])}</p></div></div>
  <p class="jp-lead">{e(j['lead'])}</p>
  <div class="jbs">{blocks}</div>
</div>'''
    return f'''{page_hero('jurisdictions', '03', ('Jurisdictions', 'النطاق الدولي'), ('From Cairo, {to anywhere} your client needs.', 'من القاهرة، {إلى أي مكان} يحتاجه عميلك.'), NETWORK)}
<section class="sec ink map-s jur">
  <div class="wrap">
    <div class="map-box big"><canvas class="map" data-mode="full" data-hq="{HQ[L]}" aria-label="{e(('Interactive jurisdictions map', 'خريطة تفاعلية للنطاق الدولي'))}"></canvas></div>
    <div class="jts" role="tablist">{tabs}</div>
  </div>
</section>
<section class="sec paper">
  <div class="wrap"><div class="jps">{panels}</div>
  <p class="fine rv">{e(('Information summarised from official sources for general guidance only — see our disclaimer.', 'معلومات ملخّصة من المصادر الرسمية للإرشاد العام فقط، راجع إخلاء المسؤولية.'))} <a href="policies.html">{e(('Disclaimer', 'إخلاء المسؤولية'))}</a></p></div>
</section>
{cta_band()}'''


def p_team():
    dirs = ''.join(f'''<article class="dr rv">
  <div class="medal" aria-hidden="true"><canvas class="medal-g"></canvas>{medal_name(d)}</div>
  <div class="dr-m"><span class="dr-k">{e(d['title'])}</span><h2>{e(d['name'])}</h2><p>{e(d['role'])}</p>
  <a class="lnk" href="mailto:{d.get('mail', CONTACT['email'])}">{icon('mail')}<span>{e(('Contact', 'تواصل'))}</span></a></div>
</article>''' for d in DIRECTORS)
    team = ''.join(f'''<div class="tm rv" style="--d:{i * 0.04:.2f}s"><div class="tm-m" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-4 3.8-6.2 7.5-6.2s6.7 2.2 7.5 6.2"/></svg></div><h3>{e(n)}</h3><p>{e(r)}</p></div>''' for i, (ini, n, r) in enumerate(TEAM))
    return f'''{page_hero('team', '04', ('Our Team', 'فريق العمل'), ('A well-trained {work group.}', 'فريق عمل {مدرَّب.}'), TRAINING)}
<section class="sec paper">
  <div class="wrap">
    <div class="sh">{eyebrow(('Directors of the managements', 'مديرو الإدارات'), 'I')}{title(('The partners who {lead each department.}', 'الشركاء الذين {يقودون كل إدارة.}'))}</div>
    <div class="drs">{dirs}</div>
  </div>
</section>
<section class="sec ink">
  {guilloche_frame()}
  <div class="wrap">
    <div class="sh">{eyebrow(('The work group', 'فريق العمل'), 'II')}{title(('One entity, {many disciplines.}', 'كيان واحد، {وتخصصات متعددة.}'))}<p class="sh-p rv">{e(('When our team carries out a task, they work as one entity and facilitate internal communication.', 'حين يؤدي فريقنا مهمة، يعمل ككيان واحد ويُيسّر التواصل الداخلي.'))}</p></div>
    <div class="tms">{team}</div>
  </div>
</section>
{cta_band()}'''


def p_policies():
    main = ''.join(f'<li class="rv">{e(x)}</li>' for x in POLICY_MAIN)
    bill = ''.join(f'<li class="rv">{e(x)}</li>' for x in POLICY_BILLING)
    return f'''{page_hero('policies', '05', ('Policies', 'السياسات'), ('Clear terms, {plainly written.}', 'شروط واضحة، {بلغة بسيطة.}'), POLICY_PLAIN)}
<section class="sec paper">
  <div class="wrap doc">
    <div class="doc-c rv">
      <div class="doc-h"><span>AAA/05.1</span><h2>{e(('Our main policy', 'سياستنا الأساسية'))}</h2></div>
      <ol class="doc-l">{main}</ol>
    </div>
    <div class="doc-c rv">
      <div class="doc-h"><span>AAA/05.2</span><h2>{e(('Billing policy', 'سياسة الفوترة'))}</h2></div>
      <ol class="doc-l">{bill}</ol>
    </div>
    <div class="doc-c rv">
      <div class="doc-h"><span>AAA/05.3</span><h2>{e(('Disclaimer', 'إخلاء المسؤولية'))}</h2></div>
      <p class="doc-p">{e(DISCLAIMER)}</p>
    </div>
  </div>
</section>
{cta_band()}'''


def p_contact():
    opts = ''.join(f'<option>{e(a["name"])}</option>' for a in AREAS)
    hours = ''.join(f'<li><span>{e(d)}</span><b dir="ltr">{e(h)}</b></li>' for d, h in HOURS)
    return f'''{page_hero('contact', '06', ('Contact', 'تواصل معنا'), ('Let us help you figure out {your best next steps.}', 'دعنا نساعدك في تحديد {خطوتك التالية.}'), ('Don’t wait — the sooner you have a plan of action, the better your chances of taking the correct steps.', 'لا تنتظر؛ فكلما وضعت خطتك مبكراً، زادت فرصك في اتخاذ الخطوات الصحيحة.'))}
<section class="sec paper">
  <div class="wrap ct">
    <form class="form rv" id="inq" novalidate>
      <div class="form-h"><span>{e(('Inquiry form', 'نموذج استفسار'))}</span><span dir="ltr">AAA/IN-<b class="form-no">0001</b></span></div>
      <div class="f2">
        <label class="fl"><span>{e(('Full name', 'الاسم الكامل'))}</span><input name="name" required autocomplete="name"></label>
        <label class="fl"><span>{e(('Company', 'الشركة'))}</span><input name="company" autocomplete="organization"></label>
      </div>
      <div class="f2">
        <label class="fl"><span>{e(('Email', 'البريد الإلكتروني'))}</span><input name="email" type="email" required autocomplete="email" dir="ltr"></label>
        <label class="fl"><span>{e(('Phone / WhatsApp', 'الهاتف / واتساب'))}</span><input name="phone" type="tel" autocomplete="tel" dir="ltr"></label>
      </div>
      <label class="fl"><span>{e(('Practice area', 'مجال الخدمة'))}</span><select name="area">{opts}</select></label>
      <label class="fl"><span>{e(('Your message', 'رسالتك'))}</span><textarea name="msg" rows="5" required></textarea></label>
      <div class="form-a"><button class="btn btn-navy" type="submit" data-via="wa">{icon('wa')}<span>{e(('Send via WhatsApp', 'أرسل عبر واتساب'))}</span></button><button class="btn btn-line-d" type="submit" data-via="mail">{icon('mail')}<span>{e(('Send via email', 'أرسل بالبريد'))}</span></button></div>
      <p class="form-err" hidden>{e(('Please fill in your name, a valid email and your message.', 'يُرجى إدخال الاسم وبريد إلكتروني صحيح ورسالتك.'))}</p>
    </form>
    <aside class="ct-side">
      <a class="ct-c rv" href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener">{icon('wa')}<span><small>{e(('WhatsApp', 'واتساب'))}</small><b dir="ltr">{CONTACT['phone']}</b></span></a>
      <a class="ct-c rv" href="mailto:{CONTACT['email']}">{icon('mail')}<span><small>{e(('General inquiries', 'الاستفسارات العامة'))}</small><b>{CONTACT['email']}</b></span></a>
      <a class="ct-c rv" href="mailto:{CONTACT['ceo_email']}">{icon('mail')}<span><small>{e(('CEO office', 'مكتب الرئيس التنفيذي'))}</small><b>{CONTACT['ceo_email']}</b></span></a>
      <a class="ct-c rv" href="mailto:{CONTACT['pr_email']}">{icon('mail')}<span><small>{e(('Public relations', 'العلاقات العامة'))}</small><b>{CONTACT['pr_email']}</b></span></a>
      <div class="ct-c rv">{icon('pin')}<span><small>{e(('Headquarters', 'المقر الرئيسي'))}</small><b>{e(CONTACT['city'])}</b></span></div>
      <div class="ct-h rv">{icon('clock')}<div><small>{e(('Working hours', 'مواعيد العمل'))}</small><ul>{hours}</ul></div></div>
      {socials('soc soc-d')}
    </aside>
  </div>
</section>'''


META = {
    'index': (('Home', 'الرئيسية'), ABOUT),
    'about': (('The Firm', 'عن المكتب'), WELCOME),
    'services': (('Services', 'الخدمات'), ('Trademarks, patents, industrial designs, copyrights, plant variety, domain names, litigation, anti-counterfeit and companies services.', 'العلامات التجارية وبراءات الاختراع والنماذج الصناعية وحقوق المؤلف والأصناف النباتية وأسماء النطاقات والتقاضي ومكافحة التقليد وخدمات الشركات.')),
    'protection': (AREAS[0]['name'], AREAS[0]['lead']),
    'litigation': (AREAS[1]['name'], AREAS[1]['lead']),
    'corporate': (AREAS[2]['name'], AREAS[2]['lead']),
    'related': (AREAS[3]['name'], AREAS[3]['lead']),
    'jurisdictions': (('Jurisdictions', 'النطاق الدولي'), NETWORK),
    'team': (('Our Team', 'فريق العمل'), TRAINING),
    'policies': (('Policies', 'السياسات'), POLICY_PLAIN),
    'contact': (('Contact', 'تواصل معنا'), ('WhatsApp ' + CONTACT['phone'] + ' · ' + CONTACT['email'], 'واتساب ' + CONTACT['phone'] + ' · ' + CONTACT['email'])),
}


def build():
    global L
    for L in LANGS:
        out = ROOT if L == 'ar' else os.path.join(ROOT, L)
        os.makedirs(out, exist_ok=True)
        for p in PAGES:
            ttl, desc = META[p]
            body = globals()['p_' + p]()
            doc = head(p, t(ttl), t(desc)) + header(p) + f'<main id="main">{body}</main>' + footer() + scripts(p)
            open(os.path.join(out, href(p)), 'w', encoding='utf-8').write(doc)
    print('built', len(PAGES) * len(LANGS), 'pages')
    if MISS:
        print('UNTRANSLATED:', *sorted(MISS), sep='\n  ')


if __name__ == '__main__':
    build()
