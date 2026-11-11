#!/usr/bin/env python3
"""BloomMark multi-page generator. Run: python3 src/build.py  (writes *.html in the site root)."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = '5'

PAGES = ['index', 'firm', 'practice', 'process', 'egypt', 'insights', 'contact']
NAV = ['firm', 'practice', 'process', 'egypt', 'insights', 'contact']
NEXT = {'index': 'firm', 'firm': 'practice', 'practice': 'process', 'process': 'egypt', 'egypt': 'insights', 'insights': 'contact', 'contact': 'index'}
NAVKEY = {'firm': 'firm', 'practice': 'practice', 'process': 'process', 'egypt': 'egypt', 'insights': 'insights', 'contact': 'contact', 'index': 'home'}
ARROW = '<svg viewBox="0 0 24 24" class="arr"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

def href(p): return 'index.html' if p == 'index' else p + '.html'

HEAD = '''<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>BloomMark IP</title>
<meta name="description" content="">
<meta name="theme-color" content="#f4f2ee">
<meta property="og:type" content="website">
<meta property="og:title" content="BloomMark IP | Intellectual Property Services — Cairo">
<meta property="og:description" content="Trademarks, patents, designs, copyrights and IP litigation in Egypt & MENA since 2007.">
<link rel="icon" type="image/svg+xml" href="assets/brand/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@200;300;400;500;600&family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=Bodoni+Moda:opsz,wght@6..96,500&family=Readex+Pro:wght@200;300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap" rel="stylesheet">
<link id="zhFonts" rel="stylesheet" media="none" data-href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600&display=swap">
<link rel="stylesheet" href="assets/css/style.css?v=%(v)s">
<link rel="stylesheet" href="assets/css/v3.css?v=%(v)s">
<script>try{if(localStorage.getItem('bm-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}</script>
<script>try{var l=new URLSearchParams(location.search).get('lang')||localStorage.getItem('bm-lang');if(l&&l!=='ar'){document.documentElement.lang=l==='zh'?'zh-Hans':l;document.documentElement.dir='ltr'}}catch(e){}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LegalService","name":"BloomMark for Intellectual Property Services Ltd","alternateName":"بلوم مارك لخدمات الملكية الفكرية","foundingDate":"2007","email":"info@bloommark-ip.com","telephone":"+201207820109","url":"https://bloommark-ip.com","address":{"@type":"PostalAddress","streetAddress":"Building No. 23, Office No. 1, Ground Floor, Green Hills Compound, Nasr City","addressLocality":"Cairo","addressCountry":"EG"}}</script>
</head>
<body class="is-loading" data-page="%(page)s">

<div class="pt" id="pt" aria-hidden="true">
  <div class="pt-panel"></div>
  <div class="pt-center"><svg class="pt-mark" id="ptMark"></svg><div class="pt-line"><i id="ptBar"></i></div><p class="pt-txt" data-t="loader"></p></div>
</div>

<div class="cur" id="cur" aria-hidden="true"><i class="cur-dot"></i><i class="cur-ring"><span id="curLbl"></span></i></div>

<header class="hdr" id="hdr">
  <div class="hdr-in">
    <a href="index.html" class="brand pl" aria-label="BloomMark IP">
      <svg class="brand-mark" id="brandMark"></svg>
      <span class="brand-txt"><b>BloomMark</b><small>IP PROTECTION</small></span>
    </a>
    <nav class="nav" id="nav">
%(nav)s
    </nav>
    <div class="hdr-act">
      <button class="theme-btn" id="themeBtn" aria-label="Day / night mode"><svg class="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg><svg class="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/></svg></button>
      <div class="lang" id="lang">
        <button class="lang-btn" id="langBtn" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg><span id="langCur">عربي</span></button>
        <div class="lang-menu" id="langMenu">
          <button data-lang="ar">العربية</button><button data-lang="en">English</button><button data-lang="fr">Français</button><button data-lang="es">Español</button><button data-lang="de">Deutsch</button><button data-lang="zh">中文</button><button data-lang="ru">Русский</button>
        </div>
      </div>
      <a href="contact.html" class="btn btn-shine btn-sm hide-m pl" data-t="nav.cta"></a>
      <button class="burger" id="burger" aria-label="Menu"><i></i><i></i></button>
    </div>
  </div>
</header>

<div class="mnav" id="mnav">
%(mnav)s
</div>

<main id="top">
'''

PAGEHEAD = '''<section class="ph light">
  <canvas class="ph-canvas" aria-hidden="true"></canvas>
  <div class="ph-idx" aria-hidden="true">%(idx)s</div>
  <div class="wrap ph-in">
    <p class="ph-crumb"><a href="index.html" class="pl" data-t="nav.home"></a><span>/</span><span data-t="nav.%(navkey)s"></span></p>
    <h1 class="ph-t" data-t="pg.heads.%(key)s.t"></h1>
    <p class="ph-s" data-t="pg.heads.%(key)s.s"></p>
  </div>
  <div class="ph-scroll" aria-hidden="true"><i></i></div>
</section>
'''

FOOT = '''
<a class="next pl" href="%(nexthref)s">
  <span class="next-k" data-t="pg.next"></span>
  <span class="next-t"><span data-t="nav.%(nextkey)s"></span>''' + ARROW + '''</span>
  <span class="next-fill" aria-hidden="true"></span>
</a>
</main>

<footer class="ftr dark">
  <div class="wrap">
    <div class="ftr-top">
      <div class="ftr-brand"><svg id="footMark"></svg><p data-t="footer.tag"></p></div>
      <nav class="ftr-nav">
%(fnav)s
      </nav>
      <div class="ftr-langs" id="ftrLangs"><button data-lang="ar">العربية</button><button data-lang="en">English</button><button data-lang="fr">Français</button><button data-lang="es">Español</button><button data-lang="de">Deutsch</button><button data-lang="zh">中文</button><button data-lang="ru">Русский</button></div>
    </div>
    <div class="ftr-word" aria-hidden="true">BloomMark</div>
    <div class="ftr-bot"><span>© 2007–<span id="yr">2026</span> · <span data-t="footer.rights"></span></span><a href="#top" data-t="footer.top"></a></div>
  </div>
</footer>

<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-bg" data-close></div>
  <aside class="drawer-panel" role="dialog" aria-modal="true">
    <button class="drawer-x" data-close aria-label="close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div id="drawerBody"></div>
  </aside>
</div>

<script src="assets/js/vendor/gsap.min.js"></script>
<script src="assets/js/vendor/ScrollTrigger.min.js"></script>
<script src="assets/js/vendor/lenis.min.js"></script>
<script src="assets/js/logo-data.js?v=%(v)s"></script>
%(extra)s<script src="assets/js/content.js?v=%(v)s"></script>
<script src="assets/js/content-xl.js?v=%(v)s"></script>
<script src="assets/js/pages.js?v=%(v)s"></script>
<script src="assets/js/app.js?v=%(v)s"></script>
%(module)s</body>
</html>
'''

BODY = {}

BODY['index'] = '''<section class="h3d light" id="hero">
  <canvas id="gl" class="h3d-gl" aria-hidden="true"></canvas>
  <div class="h3d-fallback" aria-hidden="true"><svg id="heroMono"></svg></div>
  <div class="h3d-grid" aria-hidden="true"></div>
  <div class="h3d-vig" aria-hidden="true"></div>
  <div class="wrap h3d-in">
    <p class="pill reveal-up"><span class="pill-dot"></span><span data-t="hero.eyebrow"></span></p>
    <h1 class="hero-h h3d-h">
      <span class="hl hl-1"><span data-t="hero.t1"></span> <em data-t="hero.t2"></em></span>
      <span class="hl hl-3"><span class="rot" id="rot"></span></span>
    </h1>
    <div class="h3d-low">
      <p class="hero-sub" id="heroSub" data-t="hero.sub"></p>
      <div class="hero-cta reveal-up">
        <a href="contact.html" class="btn btn-shine pl"><span data-t="hero.cta1"></span>''' + ARROW + '''</a>
        <a href="practice.html" class="btn btn-ghost pl" data-t="hero.cta2"></a>
      </div>
    </div>
  </div>
  <div class="h3d-hint reveal-up" aria-hidden="true"><span class="h3d-mouse"><i></i></span><span data-t="pg.home.drag"></span></div>
  <div class="h3d-coords reveal-up" aria-hidden="true"><span>30.04° N</span><span>31.24° E</span><span>CAIRO · EST. 2007</span></div>
</section>

<div class="svc-strip" aria-hidden="true"><div class="wrap svc-strip-in" id="marquee"></div></div>

<section class="sec light hintro">
  <div class="wrap">
    <p class="kicker" data-t="pg.home.introK"></p>
    <p class="statement big" id="statement" data-src="pg.home.intro"></p>
  </div>
</section>

<section class="sec paper2 hidx" id="hidx">
  <div class="wrap">
    <div class="sec-head row"><div><p class="kicker" data-t="pg.home.indexK"></p><h2 class="h2 split" data-t="pg.home.indexT"></h2></div></div>
    <ol class="idx-list" id="idxList"></ol>
  </div>
  <div class="idx-float" id="idxFloat" aria-hidden="true"><div class="idx-float-in"><span class="idx-ico" id="idxIco"></span><p id="idxTxt"></p></div></div>
</section>

<section class="hstats dark">
  <div class="wrap hstats-in" id="stats"></div>
</section>

<section class="sec light hportals">
  <div class="wrap portals">
    <a href="firm.html" class="portal pl p-firm">
      <span class="portal-k" data-t="pg.home.firmK"></span>
      <h3 data-t="pg.home.firmT"></h3>
      <p data-t="pg.home.firmP"></p>
      <span class="portal-go"><span data-t="pg.home.firmCta"></span>''' + ARROW + '''</span>
      <svg class="portal-mark" id="portalMark"></svg>
    </a>
    <a href="process.html" class="portal pl p-proc">
      <span class="portal-k" data-t="pg.home.procK"></span>
      <h3 data-t="pg.home.procT"></h3>
      <ol class="portal-steps" id="portalSteps"></ol>
      <span class="portal-go"><span data-t="pg.home.procCta"></span>''' + ARROW + '''</span>
    </a>
    <a href="egypt.html" class="portal pl p-egy">
      <span class="portal-k" data-t="pg.home.egyptK"></span>
      <h3 data-t="pg.home.egyptT"></h3>
      <div class="portal-nums" id="portalNums"></div>
      <span class="portal-go"><span data-t="pg.home.egyptCta"></span>''' + ARROW + '''</span>
    </a>
  </div>
</section>

<section class="sec paper2 hnews">
  <div class="wrap">
    <div class="sec-head row"><div><p class="kicker" data-t="pg.home.newsK"></p><h2 class="h2 split" data-t="insights.title"></h2></div><a href="insights.html" class="btn btn-dark pl"><span data-t="pg.home.newsCta"></span>''' + ARROW + '''</a></div>
    <div class="news" id="news"></div>
  </div>
</section>

<section class="hcta dark">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap hcta-in">
    <h2 class="hcta-t split" data-t="pg.home.ctaT"></h2>
    <a href="contact.html" class="hcta-btn pl"><span data-t="pg.home.ctaB"></span>''' + ARROW + '''</a>
  </div>
</section>
'''

BODY['firm'] = '''<section class="sec light" id="firm">
  <div class="wrap">
    <p class="kicker" data-t="firm.kicker"></p>
    <p class="statement" id="statement" data-src="firm.statement"></p>
    <div class="firm-cols" id="firmCols"></div>
    <figure class="chair beam-card">
      <div class="chair-mark"><svg id="chairMark"></svg></div>
      <div class="chair-body">
        <p class="kicker" data-t="firm.chairKicker"></p>
        <blockquote class="chair-q" data-t="firm.chairQuote"></blockquote>
        <p class="chair-p" data-t="firm.chairBody"></p>
        <figcaption class="chair-sign"><svg class="sig" id="sigMark"></svg><span data-t="firm.chairSign"></span></figcaption>
      </div>
    </figure>
  </div>
</section>
<section class="sec paper2" id="values">
  <div class="wrap">
    <div class="sec-head"><p class="kicker" data-t="values.kicker"></p><h2 class="h2 split" data-t="values.title"></h2></div>
    <div class="values" id="values-grid"></div>
  </div>
</section>
<section class="sec dark net" id="network">
  <div class="wrap net-in">
    <div class="net-txt">
      <p class="kicker" data-t="network.kicker"></p>
      <h2 class="h2 split" data-t="network.title"></h2>
      <p class="lead" data-t="network.sub"></p>
      <ul class="net-pts" id="netPts"></ul>
    </div>
    <div class="globe-box"><canvas id="globe" aria-hidden="true"></canvas><span class="globe-label" id="globeLabel"></span></div>
  </div>
</section>
'''

BODY['practice'] = '''<section class="hz light" id="hz">
  <div class="hz-bar"><span class="hz-hint" data-t="pg.practiceHint"></span><div class="hz-dots" id="hzDots"></div><span class="hz-count"><b id="hzNum">01</b> / 06</span></div>
  <div class="hz-track" id="hzTrack"></div>
  <div class="hz-prog"><i id="hzProg"></i></div>
</section>
'''

BODY['process'] = '''<section class="ring-sec light" id="ringSec">
  <div class="wrap ring-in">
    <div class="ring-vis">
      <svg viewBox="0 0 200 200" class="ring-svg"><circle cx="100" cy="100" r="88" class="ring-bg"/><circle cx="100" cy="100" r="88" class="ring-fg" id="ringFg"/></svg>
      <div class="ring-ticks" id="ringTicks"></div>
      <div class="ring-num"><b id="ringNum">01</b><span>/ 06</span></div>
    </div>
    <div class="ring-txt" id="ringTxt"></div>
  </div>
</section>
<section class="sec paper2 ring-list-sec">
  <div class="wrap">
    <div class="sec-head"><p class="kicker" data-t="process.kicker"></p><h2 class="h2 split" data-t="process.title"></h2><p class="lead" data-t="process.sub"></p></div>
    <ol class="steps steps-grid" id="steps"></ol>
  </div>
</section>
'''

BODY['egypt'] = '''<section class="sec dark" id="egypt">
  <div class="wrap">
    <div class="sec-head"><p class="kicker" data-t="egypt.kicker"></p><h2 class="h2 split" data-t="egypt.title"></h2><p class="lead" data-t="egypt.sub"></p></div>
    <div class="terms" id="terms"></div>
    <div class="treaties"><h3 class="h3" data-t="egypt.treatiesTitle"></h3><ul id="treaties"></ul><p class="fine" data-t="egypt.note"></p></div>
  </div>
</section>
<section class="sec light" id="req">
  <div class="wrap">
    <div class="sec-head"><p class="kicker" data-t="req.kicker"></p><h2 class="h2 split" data-t="req.title"></h2><p class="lead" data-t="req.sub"></p></div>
    <div class="tabs" id="tabs" role="tablist"><span class="tab-ind" id="tabInd"></span></div>
    <div class="tab-panel" id="tabPanel"></div>
  </div>
</section>
'''

BODY['insights'] = '''<section class="sec light" id="insights">
  <div class="wrap">
    <div class="sec-head row"><div><p class="kicker" data-t="insights.kicker"></p><h2 class="h2 split" data-t="insights.title"></h2></div>
      <a class="btn btn-dark" target="_blank" rel="noopener" href="https://www.linkedin.com/in/bloommark-ip-ltd-mena-region-5b4b47244/"><span data-t="insights.more"></span><svg viewBox="0 0 24 24" class="arr"><path d="M7 17L17 7M9 7h8v8"/></svg></a></div>
    <div class="news news-big" id="news"></div>
  </div>
</section>
'''

BODY['contact'] = '''<section class="sec dark contact" id="contact">
  <div class="wrap">
    <div class="ct">
      <div class="ct-info">
        <div class="ct-blk"><h4 data-t="contact.addrH"></h4><p data-t="contact.addr"></p></div>
        <div class="ct-blk"><h4 data-t="contact.phoneH"></h4><p><a href="tel:+201207820109" dir="ltr">+20 120 782 0109</a><br><a href="https://wa.me/201116162530" target="_blank" rel="noopener" dir="ltr">+20 111 616 2530</a></p></div>
        <div class="ct-blk"><h4 data-t="contact.mailH"></h4><ul class="mails" id="mails"></ul></div>
        <div class="ct-blk"><h4 data-t="contact.hoursH"></h4><p data-t="contact.hours"></p></div>
        <div class="ct-soc">
          <a href="https://wa.me/201116162530" target="_blank" rel="noopener" class="btn btn-shine btn-sm"><svg viewBox="0 0 24 24" class="ico-wa"><path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z"/><path d="M8.5 8.8c.2-.6.6-.7 1-.7l.6.1 1 2.1-.6.9c.5 1 1.3 1.8 2.3 2.3l.9-.6 2.1 1c0 .5-.1 1-.7 1.3-.6.3-1.6.4-3.2-.4a8 8 0 01-3.2-3.2c-.6-1.4-.4-2.300-.2-2.8z"/></svg><span data-t="contact.wa"></span></a>
          <a href="https://www.linkedin.com/in/bloommark-ip-ltd-mena-region-5b4b47244/" target="_blank" rel="noopener" class="soc" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M4 9h3.5v11H4zM5.8 3.5a2 2 0 110 4 2 2 0 010-4zM10 9h3.3v1.6c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.2 2.4 4.2 5.5V20h-3.5v-5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H10z"/></svg></a>
          <a href="https://www.facebook.com/bloom.mark.2025" target="_blank" rel="noopener" class="soc" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8.5V6.8c0-.8.2-1.300 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.100 1.500-4.100 4.300v2H7.7V12h2.7v9.8H14V12h2.7l.4-3.500z"/></svg></a>
        </div>
      </div>
      <form class="ct-form beam-card" id="form" novalidate>
        <div class="f-row">
          <label><span data-t="contact.form.name"></span><input name="name" required autocomplete="name"></label>
          <label><span data-t="contact.form.company"></span><input name="company" autocomplete="organization"></label>
        </div>
        <label><span data-t="contact.form.email"></span><input name="email" type="email" required autocomplete="email" dir="ltr"></label>
        <label><span data-t="contact.form.service"></span><select name="service" id="svcSelect"></select></label>
        <label><span data-t="contact.form.msg"></span><textarea name="msg" rows="4"></textarea></label>
        <div class="f-act">
          <button type="submit" class="btn btn-shine"><span data-t="contact.form.send"></span>''' + ARROW + '''</button>
          <a href="#" id="mailLink" class="f-mail" data-t="contact.form.mail"></a>
        </div>
        <p class="f-ok" id="formOk" data-t="contact.form.ok"></p>
      </form>
    </div>
    <div class="map"><iframe title="BloomMark map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Green%20Hills%20Compound%20Nasr%20City%20Cairo&amp;z=14&amp;output=embed"></iframe></div>
  </div>
</section>
'''

IMPORTMAP = '''<script type="importmap">{"imports":{"three":"./assets/js/vendor/three.module.min.js"}}</script>
<script type="module" src="assets/js/gl.js?v=%s"></script>
''' % V

for page in PAGES:
    nav = '\n'.join('      <a href="%s" class="pl%s" data-t="nav.%s"></a>' % (href(n), ' act' if n == page else '', n) for n in NAV)
    mnav = '\n'.join('  <a href="%s" class="pl" data-n="%02d"><span data-t="nav.%s"></span></a>' % (href(n), i + 1, n) for i, n in enumerate(['index'] + NAV)).replace('nav.index', 'nav.home')
    fnav = '\n'.join('        <a href="%s" class="pl" data-t="nav.%s"></a>' % (href(n), NAVKEY[n]) for n in ['index'] + NAV)
    html = HEAD % {'v': V, 'page': page, 'nav': nav, 'mnav': mnav}
    if page != 'index':
        html += PAGEHEAD % {'idx': {'firm': '01', 'practice': '02', 'process': '03', 'egypt': '04', 'insights': '05', 'contact': '06'}[page], 'key': page, 'navkey': page}
    html += BODY[page]
    nx = NEXT[page]
    html += FOOT % {'v': V, 'nexthref': href(nx), 'nextkey': NAVKEY[nx], 'fnav': fnav,
                    'extra': '<script src="assets/js/land.js?v=%s"></script>\n' % V if page == 'firm' else '',
                    'module': IMPORTMAP if page == 'index' else ''}
    open(os.path.join(ROOT, href(page)), 'w').write(html)
    print('wrote', href(page))
