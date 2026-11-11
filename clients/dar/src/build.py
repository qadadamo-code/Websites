# -*- coding: utf-8 -*-
"""Static site generator for the DAR ME site.
Run:  python3 src/build.py   -> writes ./*.html (Arabic) and ./en/*.html (English)
"""
import os, html as H
from content import *
from legal import TERMS, PRIVACY
from icons import icon

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = '7'  # cache-buster for css/js
L = 'ar'


def t(x):
    """Pick language from (en, ar) pair; plain strings pass through."""
    if isinstance(x, tuple):
        return x[1] if L == 'ar' else x[0]
    return x


def e(x):
    return H.escape(t(x), quote=True)


def A(p=''):
    return ('' if L == 'ar' else '../') + p


def href(page):
    return 'index.html' if page == 'index' else page + '.html'


def num(n, suf=''):
    """Static number with thousands separators (digits 0-9)."""
    s = f'{int(n):,}' if len(n) > 4 else n
    return s + suf


def label(txt, cls=''):
    return f'<div class="lbl {cls}"><i></i><span>{e(txt)}</span></div>'


def btn(txt, link, kind='red', ico='arrow', attrs=''):
    return f'<a class="btn btn-{kind}" href="{link}" {attrs}><span class="btn-bar"></span><span class="btn-t">{e(txt)}</span>{icon(ico, "btn-i")}</a>'


def split_title(a, b, tag='h1', cls=''):
    return f'<{tag} class="ttl {cls}"><span class="ln"><span>{e(a)}</span></span><span class="ln accent"><span>{e(b)}</span></span></{tag}>'


# ------------------------------------------------------------------ layout
def head(page, title, desc):
    other = '../' if L == 'ar' else ''
    ar_url = ('' if L == 'ar' else '../') + href(page)
    en_url = ('en/' if L == 'ar' else '') + href(page)
    full = f'{title} | DAR ME' if page != 'index' else 'DAR ME | ' + t(TAGLINE)
    return f'''<!doctype html>
<html lang="{L}" dir="{'rtl' if L == 'ar' else 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{H.escape(full)}</title>
<meta name="description" content="{H.escape(desc)}">
<meta name="theme-color" content="#030303">
<meta property="og:title" content="{H.escape(full)}">
<meta property="og:description" content="{H.escape(desc)}">
<meta property="og:image" content="{A('assets/img/brand/og.webp')}">
<link rel="alternate" hreflang="ar" href="{ar_url}">
<link rel="alternate" hreflang="en" href="{en_url}">
<link rel="icon" href="{A('assets/img/brand/favicon.png')}">
<link rel="preload" href="{A('assets/fonts/Figtree-300_800-latin.woff2')}" as="font" type="font/woff2" crossorigin>
{'<link rel="preload" href="' + A('assets/fonts/NotoKufiArabic-300_800-arabic.woff2') + '" as="font" type="font/woff2" crossorigin>' if L == 'ar' else ''}
<link rel="stylesheet" href="{A('assets/css/fonts.css')}?v={V}">
<link rel="stylesheet" href="{A('assets/css/dar.css')}?v={V}">
</head>
<body class="pg-{page}" data-page="{page}">
<a class="skip" href="#main">{e(('Skip to main content', 'تخطَّ إلى المحتوى'))}</a>
'''


def logo_svg(cls='logo'):
    return f'<svg class="{cls}" viewBox="0 0 3226 693" aria-label="DAR ME" role="img"><use href="#darme"/></svg>'


def sprite():
    # Logo fill injected by JS too, but a static symbol keeps it crisp without JS.
    import re
    d = open(os.path.join(ROOT, 'assets/js/logo-data.js')).read()
    fill = re.search(r'fill:"([^"]+)"', d).group(1)
    return f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="darme" viewBox="0 0 3226 693"><path fill="currentColor" fill-rule="evenodd" d="{fill}"/></symbol></svg>'


def header(page):
    other_lang = 'English' if L == 'ar' else 'العربية'
    other_href = ('en/' if L == 'ar' else '../') + href(page)
    items = ''
    for k, name in NAV:
        cur = ' aria-current="page"' if (k == page or (k == 'services' and page in ('automate', 'transform', 'comply', 'upskill'))) else ''
        if k == 'services':
            sub = ''.join(f'<a href="{p["key"]}.html" class="mm-i"><span class="mm-n">{p["n"]}</span><img src="{A("assets/img/brand/" + p["sub"])}" alt="DAR ME {p["name"][0]}" class="mm-sub"><span class="mm-t">{e(p["name"])}</span><span class="mm-d">{e(p["short"])}</span></a>' for p in PILLARS)
            items += f'<li class="has-mm"><a href="services.html"{cur}>{e(name)}<svg viewBox="0 0 10 6" class="caret"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></a><div class="mm"><div class="mm-in">{sub}</div></div></li>'
        else:
            items += f'<li><a href="{href(k)}"{cur}>{e(name)}</a></li>'
    return f'''{sprite()}
<header class="hdr" id="hdr">
  <div class="hdr-in">
    <a class="brand" href="index.html" aria-label="DAR ME">{logo_svg('logo hdr-logo')}</a>
    <nav class="nav" aria-label="main"><ul>{items}</ul></nav>
    <div class="hdr-act">
      <a class="lang" href="{other_href}" hreflang="{'en' if L == 'ar' else 'ar'}" lang="{'en' if L == 'ar' else 'ar'}">{other_lang}</a>
      <a class="btn btn-red btn-sm hdr-cta" href="contact.html"><span class="btn-bar"></span><span class="btn-t">{e(('Contact Us', 'تواصل معنا'))}</span></a>
      <button class="burger" aria-label="menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>
{menu_overlay(page)}
'''


def menu_overlay(page):
    nav = ''.join(f'<li><a href="{href(k)}"><span class="mo-n">0{i+1}</span><span class="mo-t">{e(n)}</span>{icon("arrow","mo-a")}</a></li>' for i, (k, n) in enumerate(NAV))
    pills = ''.join(f'<a class="mo-p" href="{p["key"]}.html"><img src="{A("assets/img/brand/" + p["sub"])}" alt=""><span>{e(p["short"])}</span></a>' for p in PILLARS)
    return f'''<div class="mo" id="mo" aria-hidden="true">
  <div class="mo-grid"></div>
  <div class="mo-in">
    <div class="mo-col"><div class="mo-k">{e(('Navigate', 'تصفّح'))}</div><ul class="mo-nav">{nav}</ul></div>
    <div class="mo-col mo-side"><div class="mo-k">{e(('Four Pillars', 'الركائز الأربع'))}</div>{pills}
      <div class="mo-contact"><a href="tel:{CONTACT['tel']}" dir="ltr">{CONTACT['phone']}</a><a href="mailto:{CONTACT['email']}">{CONTACT['email']}</a></div>
    </div>
  </div>
</div>'''


def x_icon():
    return '<svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>'


def socials():
    return f'''<div class="soc">
<a href="tel:{CONTACT['tel']}" aria-label="Phone">{icon('phone')}</a>
<a href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener" aria-label="WhatsApp">{icon('wa')}</a>
<a href="mailto:{CONTACT['email']}" aria-label="Email">{icon('mail')}</a>
<a href="{CONTACT['linkedin']}" target="_blank" rel="noopener" aria-label="LinkedIn">{icon('in')}</a>
<a href="{CONTACT['x']}" target="_blank" rel="noopener" aria-label="X">{x_icon()}</a>
</div>'''


def footer():
    svc = ''.join(f'<li><a href="{p["key"]}.html">{e(p["name"])}</a></li>' for p in PILLARS)
    comp = ''.join(f'<li><a href="{href(k)}">{e(n)}</a></li>' for k, n in NAV[1:])
    addr = '<br>'.join(H.escape(x) for x in t(ADDRESS_LINES))
    return f'''<footer class="ftr">
  <div class="ftr-glow"></div>
  <div class="wrap">
    <div class="ftr-top">
      <div class="ftr-brand">
        {logo_svg('logo ftr-logo')}
        <p class="ftr-tag">{e(TAGLINE)}</p>
        <p class="ftr-p">{e(ENT_DELIVERY)}</p>
        {socials()}
      </div>
      <div class="ftr-cols">
        <div><h4>{e(('Services', 'الخدمات'))}</h4><ul>{svc}</ul></div>
        <div><h4>{e(('Company', 'الشركة'))}</h4><ul>{comp}</ul></div>
        <div><h4>{e(('Legal', 'قانوني'))}</h4><ul><li><a href="terms.html">{e(TERMS['title'])}</a></li><li><a href="privacy.html">{e(PRIVACY['title'])}</a></li></ul></div>
        <div><h4>{e(('Contact', 'تواصل'))}</h4><p class="ftr-addr">{addr}</p><p><a href="tel:{CONTACT['tel']}" dir="ltr">{CONTACT['phone']}</a><br><a href="mailto:{CONTACT['email']}">{CONTACT['email']}</a></p></div>
      </div>
    </div>
    <div class="ftr-mark" aria-hidden="true">{logo_svg('logo')}</div>
    <div class="ftr-bot">
      <span>© DAR ME. {e(('Since 2006. Enterprise technology delivery across Saudi Arabia and the GCC.', 'منذ 2006. تنفيذ تقني مؤسسي في المملكة العربية السعودية ودول الخليج.'))}</span>
      <span class="ftr-legal">{e(LEGAL_NAME)}</span>
    </div>
  </div>
</footer>
<a class="wa-fab" href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener" aria-label="WhatsApp">{icon('wa')}</a>
'''


def intro():
    return f'''<div class="intro" id="intro" aria-hidden="true">
  <div class="intro-grid"></div>
  <div class="intro-stage">
    <svg class="intro-logo" viewBox="-60 -60 3346 813">
      <defs>
        <mask id="im" maskUnits="userSpaceOnUse" x="-60" y="-60" width="3346" height="813"><g class="im-strokes" fill="none" stroke="#fff" stroke-width="150" stroke-linecap="round" stroke-linejoin="round"></g></mask>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g class="im-traces" fill="none" stroke="#E50914" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity=".9"></g>
      <use href="#darme" class="im-fill" mask="url(#im)" style="color:#fff"/>
      <g class="im-sparks" filter="url(#glow)"></g>
    </svg>
    <div class="intro-meta"><span class="intro-k">LOADING INTELLIGENCE</span><span class="intro-c">000</span></div>
    <div class="intro-bar"><i></i></div>
    <div class="intro-tag">{e(TAGLINE)}</div>
  </div>
  <div class="intro-door d1"></div><div class="intro-door d2"></div>
</div>'''


def scripts(extra=''):
    return f'''<script src="{A('assets/js/vendor/gsap.min.js')}"></script>
<script src="{A('assets/js/vendor/ScrollTrigger.min.js')}"></script>
<script src="{A('assets/js/vendor/lenis.min.js')}"></script>
<script src="{A('assets/js/land.js')}?v={V}"></script>
<script src="{A('assets/js/fields.js')}?v={V}"></script>
<script src="{A('assets/js/app.js')}?v={V}"></script>
{extra}
</body></html>'''


def page(pagekey, title, desc, body, with_intro=False):
    return head(pagekey, title, desc) + (intro() if with_intro else '<div class="wipe" id="wipe"><i></i></div>') + header(pagekey) + f'<main id="main">{body}</main>' + footer() + scripts()


# ------------------------------------------------------------------ shared blocks
def stat_block(stats, cls=''):
    out = ''
    for i, s in enumerate(stats):
        n, suf, lab = s[0], s[1], s[2]
        cnt = s[3] if len(s) > 3 else True
        out += f'''<div class="st"><div class="st-k">{'0' + str(i + 1) if i < 9 else i + 1}</div><div class="st-n" dir="ltr"><span class="cnt" data-to="{n}" data-sep="{1 if len(n) > 4 else 0}" data-count="{1 if cnt else 0}">{num(n)}</span><em>{suf}</em></div><div class="st-l">{e(lab)}</div><svg class="st-spark" viewBox="0 0 120 24" preserveAspectRatio="none"><path d="M0 20 L15 18 L30 19 L45 14 L60 15 L75 10 L90 11 L105 5 L120 3"/></svg></div>'''
    return f'<div class="stats {cls}" style="--n:{len(stats)}">{out}</div>'


def next_step(title):
    return f'''<section class="next" data-theme="dark">
  <canvas class="fx" data-fx="pulse"></canvas>
  <div class="wrap next-in">
    {label(('Next Step', 'الخطوة التالية'))}
    <h2 class="next-t rv-words">{e(title)}</h2>
    <p class="next-p rv">{e(NEXT_P)}</p>
    <div class="next-a rv">{btn(CTA_EXPERTS, 'contact.html', 'red', 'arrow', 'data-magnetic')}<a class="next-wa" href="https://wa.me/{CONTACT['wa']}" target="_blank" rel="noopener">{icon('wa')}<span dir="ltr">{CONTACT['phone']}</span></a></div>
  </div>
</section>'''


def updates():
    return f'''<section class="upd">
  <div class="wrap upd-in">
    <div class="upd-img rv"><img src="{A('assets/img/brand/updates.webp')}" alt="DAR ME on LinkedIn" loading="lazy" width="800" height="800"></div>
    <div class="upd-tx">
      {label(('Updates', 'آخر المستجدات'))}
      <p class="upd-p rv-words">{e(UPDATES)}</p>
      <div class="upd-a rv">
        <a class="chip-l" href="{CONTACT['linkedin']}" target="_blank" rel="noopener">{icon('in')}<span>LinkedIn</span></a>
        <a class="chip-l" href="{CONTACT['x']}" target="_blank" rel="noopener">{x_icon()}<span>X</span></a>
      </div>
    </div>
  </div>
</section>'''


def engagement(dark=True):
    nodes = ''
    for i, (ic, ttl, p) in enumerate(ENGAGEMENT):
        nodes += f'''<div class="eg-n" data-i="{i}"><div class="eg-dot"><span>{icon(ic)}</span></div><div class="eg-k">0{i+1}</div><h3>{e(ttl)}</h3><p>{e(p)}</p></div>'''
    return f'''<section class="eg">
  <div class="wrap">
    <div class="sec-h">{label(ENG_LABEL)}<h2 class="h2 rv-words">{e(ENG_TITLE)}</h2><p class="lead rv">{e(ENG_P)}</p></div>
    <div class="eg-track"><div class="eg-line"><i></i><b></b></div>{nodes}</div>
  </div>
</section>'''


def partners_strip(keys, title=('Technology Partners', 'شركاء التقنية')):
    logos = []
    for k in keys:
        logos += PARTNERS[k]
    items = ''.join(f'<div class="pl"><img src="{A("assets/img/partners/" + f + ".webp")}" alt="{H.escape(n)}" loading="lazy"></div>' for f, n in logos)
    if len(logos) < 6:
        grid = f'<div class="pl-grid">{items}</div>'
    else:
        grid = f'<div class="mq"><div class="mq-in">{items}{items}</div></div>'
    return f'''<section class="pts">
  <div class="wrap pts-h">{label(title)}</div>
  {grid}
</section>'''


def caps_grid(caps, title):
    cards = ''
    for i, (ic, ttl, p) in enumerate(caps):
        cards += f'''<article class="cap" data-tilt><div class="cap-top"><span class="cap-i">{icon(ic)}</span><span class="cap-n">{i+1:02d}</span></div><h3>{e(ttl)}</h3><p>{e(p)}</p><span class="cap-line"></span></article>'''
    return f'''<section class="caps">
  <div class="wrap">
    <div class="sec-h row">{label(('Capabilities', 'القدرات'))}<h2 class="h2 rv-words">{e(title)}</h2></div>
    <div class="cap-grid n{len(caps)}">{cards}</div>
  </div>
</section>'''


def page_hero(lbl, t1, t2, p, fx, sub=None, crumbs=None, stats=None, ctas=True):
    crumb = ''
    if crumbs:
        crumb = '<nav class="crumb" aria-label="breadcrumb"><a href="index.html">' + e(('Home', 'الرئيسية')) + '</a>' + ''.join(f'<span>/</span><a href="{u}">{e(n)}</a>' for n, u in crumbs) + '</nav>'
    subimg = f'<img class="ph-sub" src="{A("assets/img/brand/" + sub)}" alt="">' if sub else ''
    st = stat_block(stats, 'ph-stats') if stats else ''
    cta = f'<div class="ph-a">{btn(CTA_EXPERTS, "contact.html", "red", "arrow", "data-magnetic")}{btn(CTA_SERVICES_S, "services.html", "ghost", "chev")}</div>' if ctas else ''
    return f'''<section class="ph" data-fxwrap>
  <canvas class="fx ph-fx" data-fx="{fx}"></canvas>
  <div class="ph-vig"></div>
  <div class="wrap ph-in">
    {crumb}
    {subimg}
    {label(lbl)}
    {split_title(t1, t2)}
    <p class="ph-p">{e(p)}</p>
    {cta}
  </div>
  {('<div class="wrap">' + st + '</div>') if st else ''}
  <div class="ph-scroll"><i></i><span>{e(('Scroll', 'مرّر'))}</span></div>
</section>'''


def approach(lbl, ttl, p, side=''):
    return f'''<section class="appr">
  <div class="wrap appr-in">
    <div class="appr-h">{label(lbl)}<h2 class="h2 rv-words">{e(ttl)}</h2></div>
    <div class="appr-b"><p class="big-p rv-lines">{e(p)}</p>{side}</div>
  </div>
</section>'''


# ------------------------------------------------------------------ home
def home():
    pills_rows = ''
    for i, p in enumerate(PILLARS):
        caps = ''.join(f'<li>{e(c)}</li>' for c in p['caps'])
        tech = ''.join(f'<li>{H.escape(x)}</li>' for x in p['tech'])
        pills_rows += f'''<article class="md-p" data-i="{i}" id="m-{p['key']}">
  <div class="md-pk"><span class="md-n">{p['n']}</span><img class="md-sub" src="{A('assets/img/brand/' + p['sub'])}" alt="DAR ME {p['name'][0]}"></div>
  <h3 class="md-t">{e(p['name'])}</h3>
  <p class="md-d">{e(p['home'])}</p>
  <div class="md-cols"><div><h4>{e(('Capabilities', 'القدرات'))}</h4><ul class="tags">{caps}</ul></div><div><h4>{e(('Technologies', 'التقنيات'))}</h4><ul class="tags t2" dir="ltr">{tech}</ul></div></div>
  {btn(('Explore', 'استكشف'), p['key'] + '.html', 'ghost', 'arrow')}
</article>'''
    seg = ''
    import math
    # 4 arcs in the model ring
    for i, p in enumerate(PILLARS):
        a0 = -90 + i * 90 + 4
        a1 = a0 + 82
        r = 200
        x0, y0 = 260 + r * math.cos(math.radians(a0)), 260 + r * math.sin(math.radians(a0))
        x1, y1 = 260 + r * math.cos(math.radians(a1)), 260 + r * math.sin(math.radians(a1))
        am = math.radians((a0 + a1) / 2)
        lx, ly = 260 + 248 * math.cos(am), 260 + 248 * math.sin(am)
        seg += f'<path class="md-arc" data-i="{i}" d="M{x0:.1f},{y0:.1f} A{r},{r} 0 0 1 {x1:.1f},{y1:.1f}"/>'
        seg += f'<text class="md-lab" data-i="{i}" x="{lx:.1f}" y="{ly:.1f}" text-anchor="middle" dominant-baseline="middle">{p["n"]}</text>'
    ticks = ''.join(f'<line x1="260" y1="34" x2="260" y2="{42 if k % 5 else 48}" transform="rotate({k*6} 260 260)"/>' for k in range(60))
    clients = ''.join(f'<div class="cl"><img src="{A("assets/img/clients/" + f + ".webp")}" alt="{e(n)}" loading="lazy"></div>' for f, n, s in CLIENTS)
    body = f'''
<section class="hero" data-fxwrap>
  <canvas class="fx hero-fx" data-fx="map"></canvas>
  <div class="hero-vig"></div>
  <div class="hero-hud" aria-hidden="true">
    <span class="hud tl">N 26°17′ · E 50°12′</span><span class="hud tr" dir="ltr">AL KHOBAR · HQ</span>
    <span class="hud bl">KSA · KWT · BHR · UAE · JOR</span><span class="hud br"><b class="live"></b> {e(('Operations online', 'العمليات متصلة'))}</span>
  </div>
  <div class="wrap hero-in">
    {label(SINCE)}
    {split_title(TAG_1, TAG_2, 'h1', 'hero-t')}
    <p class="hero-s">{e(('Clarity, Control, and Confidence for Complex Operations.', 'وضوحٌ وتحكّمٌ وثقة للعمليات المعقّدة.'))}</p>
    <p class="hero-p">{e(('Automation, transformation, and compliance for regulated environments, delivered as one integrated model.', 'الأتمتة والتحوّل والامتثال للبيئات الخاضعة للتنظيم، تُقدَّم ضمن نموذج واحد متكامل.'))}</p>
    <div class="hero-a">{btn(CTA_EXPERTS, 'contact.html', 'red', 'arrow', 'data-magnetic')}{btn(CTA_SERVICES, 'services.html', 'ghost', 'chev')}</div>
  </div>
  <div class="wrap hero-stats">{stat_block(STATS_HOME, 'tele')}</div>
</section>

<section class="model" id="model">
  <div class="wrap">
    <div class="sec-h">{label(('The DAR ME Model', 'نموذج DAR ME'))}<h2 class="h2 rv-words">{e(('Four Capabilities. One Integrated Operating Model.', 'أربع قدرات. نموذج تشغيلي واحد متكامل.'))}</h2><p class="lead rv">{e(SERVICES['p'])}</p></div>
    <div class="md">
      <div class="md-vis"><div class="md-sticky">
        <svg class="md-ring" viewBox="0 0 520 520" aria-hidden="true">
          <g class="md-ticks">{ticks}</g>
          <circle class="md-c0" cx="260" cy="260" r="200"/>
          <circle class="md-c1" cx="260" cy="260" r="150"/>
          <circle class="md-c2" cx="260" cy="260" r="110"/>
          {seg}
          <g class="md-rot"><circle cx="260" cy="60" r="5" class="md-dot"/></g>
        </svg>
        <div class="md-core">{logo_svg('logo')}<span>{e(('Integrated Operating Model', 'نموذج تشغيلي متكامل'))}</span></div>
        <div class="md-now"><span class="md-now-n">01</span><span class="md-now-t">{e(PILLARS[0]['name'])}</span></div>
      </div></div>
      <div class="md-list">{pills_rows}</div>
    </div>
  </div>
</section>

<section class="clients-sec" data-theme="light">
  <div class="wrap">
    <div class="sec-h row">{label(CLIENTS_LABEL, 'dk')}<h2 class="h2 rv-words">{e(CLIENTS_TITLE)}</h2></div>
    <div class="cl-grid">{clients}</div>
    <div class="cl-more rv">{btn(('View All Clients', 'جميع العملاء'), 'clients.html', 'dark', 'arrow')}</div>
  </div>
</section>

{engagement()}

<section class="creds">
  <div class="wrap creds-in">
    <a class="cred rv" href="automate.html">
      <div class="cred-img"><img src="{A('assets/img/brand/blueprism-gold.webp')}" alt="SS&C Blue Prism Certified Partner 2026 Gold" loading="lazy"></div>
      <div class="cred-tx">{label(AUTOMATE['bp_l'])}<h3>{e(AUTOMATE['bp_t'])}</h3><p>{e(AUTOMATE['bp_p'])}</p></div>
    </a>
    <a class="cred rv" href="upskill.html">
      <div class="cred-img ph"><img src="{A('assets/img/brand/isc2.webp')}" alt="ISC2 Official Training Partner" loading="lazy"></div>
      <div class="cred-tx">{label(UPSKILL['isc_l'])}<h3>{e(UPSKILL['isc_t'])}</h3><p>{e(UPSKILL['isc_p'])}</p></div>
    </a>
  </div>
</section>

{partners_strip(['automate', 'transform', 'comply', 'upskill'], ('Technology Ecosystem', 'المنظومة التقنية'))}
{updates()}
{next_step(ABOUT['next'])}
'''
    return page('index', 'DAR ME', t(ENT_DELIVERY), body, with_intro=True)


# ------------------------------------------------------------------ about
def about():
    regions = ''.join(f'<li class="{"hq" if r[4] else ""}"><span class="rg-dot"></span><span>{H.escape(r[1] if L == "ar" else r[0])}</span>{"<em>HQ</em>" if r[4] else ""}</li>' for r in REGIONS)
    pill_cards = ''.join(f'<a class="ap-p rv" href="{p["key"]}.html"><span class="ap-n">{p["n"]}</span><img src="{A("assets/img/brand/" + p["sub"])}" alt="DAR ME {p["name"][0]}"><p>{e(p["home"])}</p>{icon("arrow", "ap-a")}</a>' for p in PILLARS)
    years = ''.join(f'<span style="--i:{i}">{y}</span>' for i, y in enumerate(range(2006, 2027)))
    body = f'''
{page_hero(ABOUT['label'], TAG_1, TAG_2, ABOUT['p'], 'timeline', crumbs=[(('About', 'من نحن'), 'about.html')], stats=ABOUT['stats'])}

<section class="yrs">
  <div class="yrs-band" aria-hidden="true"><div class="yrs-in">{years}</div></div>
  <div class="wrap yrs-c">
    <div class="yrs-big" dir="ltr"><span class="cnt" data-to="20" data-count="1">20</span></div>
    <div class="yrs-t">{label(('Two Decades', 'عقدان من الخبرة'))}<p class="big-p rv-lines">{e(('Two decades of operational intelligence for complex environments.', 'عقدان من الذكاء التشغيلي للبيئات المعقّدة.'))}</p></div>
  </div>
</section>

{approach(ABOUT['om_l'], ABOUT['om_t'], ABOUT['om_p'])}

<section class="ap-pills">
  <div class="wrap">
    <div class="sec-h row">{label(('The DAR ME Model', 'نموذج DAR ME'))}<h2 class="h2 rv-words">{e(('Four Capabilities. One Integrated Operating Model.', 'أربع قدرات. نموذج تشغيلي واحد متكامل.'))}</h2></div>
    <div class="ap-grid">{pill_cards}</div>
  </div>
</section>

<section class="rg">
  <canvas class="fx rg-fx" data-fx="map" data-zoom="1"></canvas>
  <div class="wrap rg-in">
    {label(CLIENTS_PAGE['regions_l'])}
    <h2 class="h2 rv-words">{e(CLIENTS_PAGE['regions_t'])}</h2>
    <p class="lead rv">{e(ENT_DELIVERY)}</p>
    <ul class="rg-list rv">{regions}</ul>
  </div>
</section>

{engagement()}
{updates()}
{next_step(ABOUT['next'])}
'''
    return page('about', t(('About', 'من نحن')), t(ABOUT['p']), body)


# ------------------------------------------------------------------ services
def services():
    rows = ''
    for i, p in enumerate(PILLARS):
        caps = ''.join(f'<li>{e(c)}</li>' for c in p['caps'])
        tech = ''.join(f'<li>{H.escape(x)}</li>' for x in p['tech'])
        rows += f'''<article class="sv rv-card" id="{p['key']}">
  <a class="sv-link" href="{p['key']}.html" aria-label="{e(p['name'])}"></a>
  <div class="sv-n">{p['n']}</div>
  <div class="sv-h"><img class="sv-sub" src="{A('assets/img/brand/' + p['sub'])}" alt="DAR ME {p['name'][0]}"><h2>{e(p['name'])}</h2><p class="sv-d">{e(p['svc'])}</p></div>
  <div class="sv-b">
    <div><h4>{e(('Capabilities', 'القدرات'))}</h4><ul class="tags">{caps}</ul></div>
    <div><h4>{e(('Technologies', 'التقنيات'))}</h4><ul class="tags t2" dir="ltr">{tech}</ul></div>
  </div>
  <span class="sv-go">{e(('Explore', 'استكشف'))}{icon('arrow')}</span>
  <canvas class="fx sv-fx" data-fx="{p['key']}" data-mini="1"></canvas>
</article>'''
    body = f'''
{page_hero(SERVICES['label'], SERVICES['t1'], SERVICES['t2'], SERVICES['p'], 'network', crumbs=[(('Services', 'الخدمات'), 'services.html')])}
<section class="svs"><div class="wrap">{rows}</div></section>
{engagement()}
{partners_strip(['automate', 'transform', 'comply', 'upskill'], ('Technology Ecosystem', 'المنظومة التقنية'))}
{next_step(SERVICES['next'])}
'''
    return page('services', t(('Services', 'الخدمات')), t(SERVICES['p']), body)


# ------------------------------------------------------------------ pillar pages
def pillar_crumbs(p):
    return [(('Services', 'الخدمات'), 'services.html'), (p['name'], p['key'] + '.html')]


def automate():
    p = PILLARS[0]
    D = AUTOMATE
    sectors = ''.join(f'<li>{e(s)}</li>' for s in D['sectors'])
    regions = ''.join(f'<li>{H.escape(r[1] if L == "ar" else r[0])}</li>' for r in REGIONS)
    side = f'<div class="appr-side"><div><h4>{e(("Industries", "القطاعات"))}</h4><ul class="tags">{sectors}</ul></div><div><h4>{e(("Delivered Regionally", "حضور إقليمي"))}</h4><ul class="tags">{regions}</ul></div></div>'
    body = f'''
{page_hero(D['label'], D['t1'], D['t2'], D['p'], 'automate', p['sub'], pillar_crumbs(p), D['stats'])}
{caps_grid(D['caps'], D['caps_t'])}
{approach(D['appr_l'], D['appr_t'], D['appr_p'], side)}
<section class="bp">
  <div class="wrap bp-in">
    <div class="bp-card rv"><img src="{A('assets/img/brand/blueprism-gold.webp')}" alt="SS&C Blue Prism Certified Partner 2026 Implementation Gold" loading="lazy"><div class="bp-shine"></div></div>
    <div class="bp-tx">{label(D['bp_l'])}<h2 class="h2 rv-words">{e(D['bp_t'])}</h2><p class="lead rv">{e(D['bp_p'])}</p></div>
  </div>
</section>
{partners_strip(['automate'])}
{next_step(D['next'])}
'''
    return page('automate', t(p['name']), t(D['p']), body)


def transform():
    p = PILLARS[1]
    D = TRANSFORM
    body = f'''
{page_hero(D['label'], D['t1'], D['t2'], D['p'], 'transform', p['sub'], pillar_crumbs(p), D['stats'])}
{caps_grid(D['caps'], D['caps_t'])}
{approach(D['appr_l'], D['appr_t'], D['appr_p'])}
{partners_strip(['transform'])}
{next_step(D['next'])}
'''
    return page('transform', t(p['name']), t(D['p']), body)


def comply():
    p = PILLARS[2]
    D = COMPLY
    import math
    # five-domain radial
    nodes = ''
    tabs = ''
    panels = ''
    for i, (ic, nm, desc, items) in enumerate(D['domains']):
        a = math.radians(-90 + i * 72)
        x, y = 50 + 38 * math.cos(a), 50 + 38 * math.sin(a)
        nodes += f'<button class="dm-node" data-i="{i}" style="--x:{x:.2f}%;--y:{y:.2f}%"><span class="dm-ic">{icon(ic)}</span><span class="dm-nm">{e(nm)}</span></button>'
        chips = ''.join(f'<li>{e(c)}</li>' for c in items)
        panels += f'<div class="dm-panel{" on" if i == 0 else ""}" data-i="{i}"><div class="dm-pk">0{i+1} / 05</div><h3>{e(nm)}</h3><p>{e(desc)}</p><ul class="tags">{chips}</ul></div>'
    lines = ''.join(f'<line x1="50" y1="50" x2="{50 + 38 * math.cos(math.radians(-90 + i * 72)):.2f}" y2="{50 + 38 * math.sin(math.radians(-90 + i * 72)):.2f}" data-i="{i}"/>' for i in range(5))
    layer = ''.join(f'<div class="ly rv-card"><span class="ly-i">{icon(ic)}</span><h3>{e(n)}</h3><p>{e(d)}</p></div>' for ic, n, d in D['layer'])
    chal = ''.join(f'<div class="chl rv-in"><span class="chl-n">{i+1:02d}</span><span class="chl-i">{icon(ic)}</span><h3>{e(n)}</h3><p>{e(d)}</p></div>' for i, (ic, n, d) in enumerate(D['challenges']))
    core = ''
    for i, (n, d, val, use) in enumerate(D['core']):
        vl = ''.join(f'<li>{icon("chev", "ic-s")}<span>{e(v)}</span></li>' for v in val)
        ul = ''.join(f'<li>{e(u)}</li>' for u in use)
        core += f'''<details class="acc"{" open" if i == 0 else ""}><summary><span class="acc-n">{i+1:02d}</span><span class="acc-t">{e(n)}</span><span class="acc-x"></span></summary><div class="acc-b"><p class="acc-p">{e(d)}</p><div class="acc-cols"><div><h4>{e(D['value_l'])}</h4><ul class="vl">{vl}</ul></div><div><h4>{e(D['use_l'])}</h4><ul class="tags">{ul}</ul></div></div></div></details>'''
    om = ''
    for i, (n, d) in enumerate(D['om']):
        om += f'<div class="om-s" data-i="{i}"><div class="om-k">0{i+1}</div><h3>{e(n)}</h3><p>{e(d)}</p></div>'
    aud = ''.join(f'<div class="au rv-card"><span class="au-i">{icon(ic)}</span><h3>{e(n)}</h3><p>{e(d)}</p></div>' for ic, n, d in D['aud'])
    body = f'''
{page_hero(D['label'], D['t1'], D['t2'], D['p'], 'comply', p['sub'], pillar_crumbs(p))}
{caps_grid(D['caps'], D['caps_t'])}

<section class="dm">
  <div class="wrap">
    <div class="sec-h">{label(D['gov_l'])}<h2 class="h2 rv-words">{e(D['gov_t'])}</h2><p class="lead rv">{e(D['gov_p'])}</p></div>
    <div class="dm-in">
      <div class="dm-vis">
        <svg class="dm-svg" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" class="dm-orb"/><circle cx="50" cy="50" r="24" class="dm-orb2"/>{lines}<circle cx="50" cy="50" r="38" class="dm-sweep"/></svg>
        <div class="dm-core"><b>DAR ME</b><span>Comply</span></div>
        {nodes}
      </div>
      <div class="dm-panels">
        <div class="dm-intro">{label(D['sol_l'])}<h3 class="h3">{e(D['sol_t'])}</h3><p>{e(D['sol_p'])}</p></div>
        {panels}
      </div>
    </div>
  </div>
</section>

<section class="layer">
  <div class="wrap">
    <div class="sec-h">{label(D['layer_l'])}<h2 class="h2 rv-words">{e(D['layer_t'])}</h2><p class="lead rv">{e(D['layer_p'])}</p></div>
    <div class="ly-grid">{layer}</div>
  </div>
</section>

<section class="chal" data-theme="light">
  <div class="wrap">
    <div class="sec-h row">{label(D['ch_l'], 'dk')}<h2 class="h2 rv-words">{e(D['ch_t'])}</h2></div>
    <div class="chl-grid">{chal}</div>
  </div>
</section>

<section class="core">
  <div class="wrap core-in">
    <div class="sec-h sticky-h">{label(D['core_l'])}<h2 class="h2 rv-words">{e(D['core_t'])}</h2><p class="lead rv">{e(D['core_p'])}</p></div>
    <div class="accs">{core}</div>
  </div>
</section>

<section class="om">
  <div class="wrap">
    <div class="sec-h">{label(D['om_l'])}<h2 class="h2 om-t rv-words" dir="auto">{e(D['om_t'])}</h2><p class="lead rv">{e(D['om_p'])}</p></div>
    <div class="om-wrap"><svg class="om-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="84"/><circle cx="100" cy="100" r="84" class="om-prog"/></svg><div class="om-grid">{om}</div></div>
  </div>
</section>

<section class="aud">
  <div class="wrap">
    <div class="sec-h row">{label(D['aud_l'])}<h2 class="h2 rv-words">{e(D['aud_t'])}</h2></div>
    <div class="au-grid">{aud}</div>
  </div>
</section>

{partners_strip(['comply'], ('Technology Partner', 'الشريك التقني'))}
{next_step(D['next'])}
'''
    return page('comply', t(p['name']), t(D['p']), body)


def upskill():
    p = PILLARS[3]
    D = UPSKILL
    body = f'''
{page_hero(D['label'], D['t1'], D['t2'], D['p'], 'upskill', p['sub'], pillar_crumbs(p), D['stats'])}
{caps_grid(D['caps'], D['caps_t'])}
{approach(D['why_l'], D['why_t'], D['why_p'], '<div class="v2030 rv"><span>VISION</span><b dir="ltr">2030</b><em>' + e(('Human Capability Development', 'تنمية القدرات البشرية')) + '</em></div>')}
<section class="isc">
  <div class="isc-bg"><img src="{A('assets/img/brand/isc2.webp')}" alt="" loading="lazy"></div>
  <div class="wrap isc-in">
    {label(D['isc_l'])}
    <h2 class="h2 rv-words">{e(D['isc_t'])}</h2>
    <p class="lead rv">{e(D['isc_p'])}</p>
    <div class="isc-certs rv" dir="ltr"><span>CISSP</span><span>CCSP</span><span>SSCP</span></div>
    <div class="rv">{btn(D['isc_b'], 'https://www.isc2.org/', 'ghost', 'arrow', 'target="_blank" rel="noopener"')}</div>
  </div>
</section>
{partners_strip(['upskill'])}
{next_step(D['next'])}
'''
    return page('upskill', t(p['name']), t(D['p']), body)


# ------------------------------------------------------------------ clients
def clients():
    chips = f'<button class="flt on" data-f="all">{e(CLIENTS_PAGE["all"])}<em>{len(CLIENTS)}</em></button>'
    for k, n in SECTORS.items():
        c = sum(1 for x in CLIENTS if x[2] == k)
        chips += f'<button class="flt" data-f="{k}">{e(n)}<em>{c}</em></button>'
    cards = ''
    for i, (f, n, s) in enumerate(CLIENTS):
        cards += f'<figure class="cc" data-s="{s}"><span class="cc-n">{i+1:02d}</span><div class="cc-img"><img src="{A("assets/img/clients/" + f + ".webp")}" alt="{e(n)}" loading="lazy"></div><figcaption><b>{e(n)}</b><span>{e(SECTORS[s])}</span></figcaption></figure>'
    regions = ''.join(f'<li class="{"hq" if r[4] else ""}"><span class="rg-dot"></span><span>{H.escape(r[1] if L == "ar" else r[0])}</span>{"<em>HQ</em>" if r[4] else ""}</li>' for r in REGIONS)
    body = f'''
{page_hero(CLIENTS_PAGE['label'], CLIENTS_PAGE['t1'], CLIENTS_PAGE['t2'], CLIENTS_PAGE['p'], 'constellation', crumbs=[(('Clients', 'عملاؤنا'), 'clients.html')], ctas=False)}
<section class="cls" data-theme="light">
  <div class="wrap">
    <div class="flts" role="tablist">{chips}</div>
    <div class="cc-grid">{cards}</div>
  </div>
</section>
<section class="rg">
  <canvas class="fx rg-fx" data-fx="map" data-zoom="1"></canvas>
  <div class="wrap rg-in">
    {label(CLIENTS_PAGE['regions_l'])}
    <h2 class="h2 rv-words">{e(CLIENTS_PAGE['regions_t'])}</h2>
    <ul class="rg-list rv">{regions}</ul>
  </div>
</section>
{next_step(CLIENTS_PAGE['next'])}
'''
    return page('clients', t(('Clients', 'عملاؤنا')), t(CLIENTS_PAGE['p']), body)


# ------------------------------------------------------------------ contact
def contact():
    C = CONTACT_PAGE
    opts = ''.join(f'<option>{e(o)}</option>' for o in C['f_opts'])
    addr = '<br>'.join(H.escape(x) for x in t(ADDRESS_LINES))
    body = f'''
<section class="ct">
  <canvas class="fx ct-fx" data-fx="map" data-zoom="2"></canvas>
  <div class="ph-vig"></div>
  <div class="wrap ct-in">
    <div class="ct-l">
      <nav class="crumb"><a href="index.html">{e(('Home', 'الرئيسية'))}</a><span>/</span><a href="contact.html">{e(('Contact', 'تواصل معنا'))}</a></nav>
      {label(C['label'])}
      {split_title(C['t1'], C['t2'])}
      <p class="ph-p">{e(C['p'])}</p>
      <div class="ct-cards">
        <a class="ctc" href="{CONTACT['maps']}" target="_blank" rel="noopener"><span class="ctc-i">{icon('pin')}</span><span class="ctc-k">{e(C['hq'])}</span><span class="ctc-v">{addr}</span><span class="ctc-go">{e(C['nav'])} {icon('arrow', 'ic-s')}</span></a>
        <a class="ctc" href="tel:{CONTACT['tel']}"><span class="ctc-i">{icon('phone')}</span><span class="ctc-k">{e(C['call'])}</span><span class="ctc-v" dir="ltr">{CONTACT['phone']}</span></a>
        <a class="ctc" href="mailto:{CONTACT['email']}"><span class="ctc-i">{icon('mail')}</span><span class="ctc-k">{e(C['email'])}</span><span class="ctc-v">{CONTACT['email']}</span></a>
      </div>
    </div>
    <form class="form" id="cform" novalidate data-wa="{CONTACT['wa']}" data-mail="{CONTACT['email']}">
      <div class="form-h"><span class="live"></span><span>{e(('Secure inquiry channel', 'قناة استفسار آمنة'))}</span><span class="form-id" dir="ltr">DAR-ME / {e(('INQUIRY', 'INQUIRY'))}</span></div>
      <label class="fl"><input name="name" required placeholder=" " autocomplete="name"><span>{e(C['f_name'])}</span></label>
      <div class="f2">
        <label class="fl"><input name="email" type="email" required placeholder=" " autocomplete="email"><span>{e(C['f_email'])}</span></label>
        <label class="fl"><input name="phone" type="tel" placeholder=" " dir="ltr" autocomplete="tel"><span>{e(C['f_phone'])}</span></label>
      </div>
      <label class="fl"><input name="company" placeholder=" " autocomplete="organization"><span>{e(C['f_company'])}</span></label>
      <label class="fl sel"><select name="service" required><option value="" selected disabled>{e(C['f_select'])}</option>{opts}</select><span>{e(C['f_service'])}</span></label>
      <label class="fl"><textarea name="msg" rows="4" placeholder=" "></textarea><span>{e(C['f_msg'])}</span></label>
      <div class="form-a">
        <button type="submit" class="btn btn-red" data-via="mail"><span class="btn-bar"></span><span class="btn-t">{e(C['f_send'])}</span>{icon('mail', 'btn-i')}</button>
        <button type="submit" class="btn btn-ghost" data-via="wa"><span class="btn-bar"></span><span class="btn-t">{e(C['f_wa'])}</span>{icon('wa', 'btn-i')}</button>
      </div>
      <p class="form-err" role="alert"></p>
    </form>
  </div>
</section>
<section class="mapsec">
  <div class="map-frame"><iframe title="DAR ME HQ" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Mohamadiya%20Towers%20Dhahran%20Street%20Al%20Khobar&z=15&output=embed"></iframe></div>
  <div class="map-card"><div class="map-k">{e(C['company'])}</div><div class="map-v">{addr}</div><a href="{CONTACT['maps']}" target="_blank" rel="noopener">{e(C['maps'])} {icon('arrow', 'ic-s')}</a></div>
</section>
'''
    return page('contact', t(('Contact', 'تواصل معنا')), t(C['p']), body)


# ------------------------------------------------------------------ legal
def legal(key, D):
    toc = ''
    secs = ''
    for i, (ttl, en, ar) in enumerate(D['sections']):
        blocks = ar if L == 'ar' else en
        inner = ''
        for b in blocks:
            if isinstance(b, tuple) and b[0] == 'ul':
                inner += '<ul>' + ''.join(f'<li>{H.escape(x)}</li>' for x in b[1]) + '</ul>'
            else:
                inner += f'<p>{H.escape(b)}</p>'
        toc += f'<li><a href="#s{i+1}"><span>{i+1:02d}</span>{e(ttl)}</a></li>'
        secs += f'<section id="s{i+1}" class="lg-s"><h2><span>{i+1:02d}</span>{e(ttl)}</h2>{inner}</section>'
    n = len(D['sections']) + 1
    addr = H.escape(t(ADDRESS))
    secs += f'<section id="s{n}" class="lg-s"><h2><span>{n:02d}</span>{e(("Contact", "التواصل"))}</h2><p>{e(LEGAL_NAME)}<br>{addr}<br>{e(("Email", "البريد الإلكتروني"))}: <a href="mailto:{CONTACT["email"]}">{CONTACT["email"]}</a><br>{e(("Phone", "الهاتف"))}: <a href="tel:{CONTACT["tel"]}" dir="ltr">{CONTACT["phone"]}</a></p></section>'
    toc += f'<li><a href="#s{n}"><span>{n:02d}</span>{e(("Contact", "التواصل"))}</a></li>'
    body = f'''
<section class="lg-h">
  <canvas class="fx" data-fx="network" data-dim="1"></canvas>
  <div class="wrap"><nav class="crumb"><a href="index.html">{e(('Home', 'الرئيسية'))}</a><span>/</span><span>{e(('Legal', 'قانوني'))}</span></nav>{label(('Legal', 'قانوني'))}<h1 class="ttl"><span class="ln"><span>{e(D['title'])}</span></span></h1><p class="ph-p">{e(D['intro'])}</p></div>
</section>
<section class="lg"><div class="wrap lg-in"><aside class="lg-toc"><ol>{toc}</ol></aside><div class="lg-body">{secs}</div></div></section>
'''
    return page(key, t(D['title']), t(D['intro'])[:150], body)


PAGES = {
    'index': home, 'about': about, 'services': services, 'automate': automate, 'transform': transform,
    'comply': comply, 'upskill': upskill, 'clients': clients, 'contact': contact,
    'terms': lambda: legal('terms', TERMS), 'privacy': lambda: legal('privacy', PRIVACY),
}


def build():
    global L
    for lang in ('ar', 'en'):
        L = lang
        out = ROOT if lang == 'ar' else os.path.join(ROOT, 'en')
        os.makedirs(out, exist_ok=True)
        for k, fn in PAGES.items():
            with open(os.path.join(out, href(k)), 'w', encoding='utf-8') as f:
                f.write(fn())
    print('built', len(PAGES) * 2, 'pages')


if __name__ == '__main__':
    build()
