(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var I = window.AF_I18N, D = window.AF_DATA, LANGS = window.AF_LANGS;
  var touch = window.matchMedia('(pointer:coarse)').matches;
  var isMobile = function () { return window.matchMedia('(max-width:860px)').matches; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };
  var LI = { ar: 0, en: 1, fr: 2, es: 3, de: 4, zh: 5, ru: 6 };

  /* ---------- language ---------- */
  var params = new URLSearchParams(location.search);
  var lang = params.get('lang') || store.get('af-lang', 'ar');
  if (!I[lang]) lang = 'ar';
  var t = function (k) { return (I[lang] && I[lang][k]) || I.en[k] || I.ar[k] || ''; };
  var pname = function (p) { return p.n[LI[lang]] || p.n[1]; };

  /* ---------- logo ---------- */
  $$('[data-logo]').forEach(function (s) { s.innerHTML = window.AF_LOGO.inner; s.setAttribute('aria-hidden', 'true'); });

  /* ---------- gsap ---------- */
  var hasG = !!window.gsap && !!window.ScrollTrigger;
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  var lenis = null;
  if (window.Lenis && !touch) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (tm) { lenis.raf(tm * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { (function raf(tm) { lenis.raf(tm); requestAnimationFrame(raf); })(); }
  }
  function scrollToEl(el) {
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - (el.id === 'top' ? 0 : 60);
    if (lenis) lenis.scrollTo(y, { duration: 1.4 }); else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* ---------- intro ---------- */
  var intro = $('#intro');
  function endIntro() {
    if (!intro || intro.classList.contains('is-out')) return;
    intro.classList.add('is-out');
    document.body.style.overflow = '';
    setTimeout(function () { intro.style.display = 'none'; $('.fab').classList.add('show'); if (hasG) ScrollTrigger.refresh(); }, 1150);
  }
  if (store.get('af-intro', 0) > Date.now() - 1000 * 60 * 30) { intro.style.display = 'none'; setTimeout(function () { $('.fab').classList.add('show'); }, 400); }
  else {
    document.body.style.overflow = 'hidden';
    store.set('af-intro', Date.now());
    requestAnimationFrame(function () { setTimeout(function () { intro.classList.add('is-in'); }, 80); });
    $$('.intro__logo .lg-fo path').forEach(function (p, i) { p.style.transitionDelay = (0.08 * i) + 's'; });
    $$('.intro__logo .lg-ar path').forEach(function (p, i) { p.style.transitionDelay = (0.55 + 0.07 * i) + 's'; });
    setTimeout(endIntro, 2700);
    $('#introSkip').addEventListener('click', endIntro);
  }

  /* ---------- theme ---------- */
  $('#themeBtn').addEventListener('click', function () {
    var n = root.dataset.theme === 'night' ? 'day' : 'night';
    root.dataset.theme = n; store.set('af-theme', n);
    $('meta[name="theme-color"]').setAttribute('content', n === 'night' ? '#0d0c0c' : '#f3f1ee');
  });

  /* ---------- header ---------- */
  var hdr = $('#hdr'), lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    var heroEnd = $('#hero').offsetHeight - window.innerHeight * 0.6;
    hdr.classList.toggle('is-solid', y > (isMobile() ? 24 : heroEnd));
    if (!document.body.classList.contains('nav-open')) hdr.classList.toggle('is-hidden', y > lastY && y > 300 && y > heroEnd);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function setNav(o) {
    document.body.classList.toggle('nav-open', o);
    document.body.style.overflow = o ? 'hidden' : '';
    if (lenis) o ? lenis.stop() : lenis.start();
    if (o) hdr.classList.remove('is-hidden');
  }
  $('#burger').addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var el = $(id); if (!el) return;
      e.preventDefault(); setNav(false); scrollToEl(el);
    });
  });

  /* ---------- contacts ---------- */
  function wa(msg) { return 'https://wa.me/' + D.config.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function bindContacts() {
    $$('[data-wa]').forEach(function (a) { a.href = wa(t('wa.hello') + ' — Artix Fofana'); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-tel]').forEach(function (a) { a.href = 'tel:' + D.config.phone; a.textContent = D.config.phoneDisplay; });
  }

  /* ---------- language UI ---------- */
  function buildLangUI() {
    var menu = $('#langMenu'), m2 = $('#mnavLangs');
    menu.innerHTML = ''; m2.innerHTML = '';
    LANGS.forEach(function (l) {
      var li = document.createElement('li');
      li.innerHTML = '<button role="option" data-l="' + l.code + '" aria-selected="' + (l.code === lang) + '"><span>' + l.label + '</span><small>' + l.short + '</small></button>';
      menu.appendChild(li);
      var b = document.createElement('button');
      b.textContent = l.label; b.dataset.l = l.code; b.setAttribute('aria-selected', l.code === lang);
      m2.appendChild(b);
    });
    $$('[data-l]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.l); $('#lang').classList.remove('is-open'); setNav(false); }); });
  }
  $('#langBtn').addEventListener('click', function (e) { e.stopPropagation(); var o = $('#lang').classList.toggle('is-open'); this.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function () { $('#lang').classList.remove('is-open'); });

  function setLang(code, first) {
    lang = code; store.set('af-lang', code);
    var meta = LANGS.filter(function (l) { return l.code === code; })[0];
    root.lang = code; root.dir = meta.dir;
    $('#langShort').textContent = meta.short;
    if (!first) { var u = new URL(location.href); if (code === 'ar') u.searchParams.delete('lang'); else u.searchParams.set('lang', code); history.replaceState(null, '', u); }
    $$('[data-i18n]').forEach(function (el) { var v = t(el.getAttribute('data-i18n')); if (v) el.textContent = v; });
    document.title = 'Artix Fofana | ' + t('ft.tag');
    buildLangUI(); bindContacts(); if (!first) draw(cur);
    renderManifesto(); renderChips(); renderProducts(); renderMaterials(); renderSectors(); renderProjects(); renderClients(); renderTypes(); renderRFQ();
    if (hasG && !first) { setupProjects(); setupManifesto(); setTimeout(function () { ScrollTrigger.refresh(); }, 60); }
  }

  /* ---------- manifesto words ---------- */
  function renderManifesto() {
    var txt = t('man.text'), hl = t('man.hl'), el = $('#manText');
    var cjk = lang === 'zh';
    var hlStart = txt.indexOf(hl), hlEnd = hlStart + hl.length;
    var tokens = [], pos = 0;
    if (cjk) { for (var i = 0; i < txt.length; i++) tokens.push({ w: txt[i], s: i }); }
    else { txt.split(/(\s+)/).forEach(function (w) { if (w.trim()) tokens.push({ w: w, s: pos }); pos += w.length; }); }
    el.innerHTML = tokens.map(function (tk) {
      var on = hlStart > -1 && tk.s >= hlStart && tk.s < hlEnd;
      return '<span class="w' + (on ? ' hl' : '') + '">' + tk.w + '</span>';
    }).join(cjk ? '' : ' ');
  }
  var manST = null;
  function setupManifesto() {
    if (!hasG) { $$('#manText .w').forEach(function (w) { w.classList.add('on'); }); return; }
    if (manST) manST.kill();
    var ws = $$('#manText .w');
    manST = ScrollTrigger.create({
      trigger: '#manText', start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length); ws.forEach(function (w, i) { w.classList.toggle('on', i < n); }); }
    });
  }

  /* ---------- catalog ---------- */
  var curCat = 'all';
  var rfq = store.get('af-rfq', []);
  function renderChips() {
    $('#chips').innerHTML = D.cats.map(function (c) { return '<button data-cat="' + c + '" class="' + (c === curCat ? 'on' : '') + '">' + t('cat.' + c) + '</button>'; }).join('');
    $$('#chips button').forEach(function (b) {
      b.addEventListener('click', function () {
        curCat = b.dataset.cat;
        $$('#chips button').forEach(function (x) { x.classList.toggle('on', x === b); });
        filterProducts(true);
      });
    });
  }
  function renderProducts() {
    $('#pgrid').innerHTML = D.products.map(function (p) {
      var inR = rfq.indexOf(p.img) > -1;
      return '<article class="pcard' + (inR ? ' in-rfq' : '') + '" data-id="' + p.img + '" data-cat="' + p.cat + '">' +
        '<div class="pcard__img"><span class="pcard__pg">CAT.25 · ' + (lang === 'ar' ? t('cat.page') + ' ' : 'P.') + String(p.page).padStart(2, '0') + '</span>' +
        '<img src="assets/img/p/' + p.img + '.webp" alt="' + p.n[1] + ' — Artix Fofana" loading="lazy" width="640" height="640"></div>' +
        '<div class="pcard__body"><small>' + t('cat.collection') + ' · ' + t('cat.' + p.cat) + '</small><h3>' + pname(p) + '</h3>' +
        '<button class="pcard__add" type="button"><span>' + (inR ? t('cat.added') : t('cat.add')) + '</span><i>+</i></button></div></article>';
    }).join('');
    $$('.pcard__add').forEach(function (b) {
      b.addEventListener('click', function () { toggleRFQ(b.closest('.pcard').dataset.id); });
    });
    filterProducts(false);
  }
  function filterProducts(anim) {
    var shown = [];
    $$('.pcard').forEach(function (c) {
      var ok = curCat === 'all' || c.dataset.cat === curCat;
      c.classList.toggle('hide', !ok);
      if (ok) shown.push(c);
    });
    if (anim && hasG) gsap.fromTo(shown, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .6, stagger: .04, ease: 'power3.out' });
    if (hasG) ScrollTrigger.refresh();
  }
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove('show'); }, 1800);
  }
  function toggleRFQ(id) {
    var i = rfq.indexOf(id);
    if (i > -1) { rfq.splice(i, 1); toast(t('toast.removed')); } else { rfq.push(id); toast(t('toast.added')); }
    store.set('af-rfq', rfq);
    var card = $('.pcard[data-id="' + id + '"]');
    if (card) { var on = rfq.indexOf(id) > -1; card.classList.toggle('in-rfq', on); $('.pcard__add span', card).textContent = on ? t('cat.added') : t('cat.add'); }
    renderRFQ();
  }
  function renderRFQ() {
    $$('[data-rfq-count]').forEach(function (b) { b.textContent = rfq.length; });
    document.body.classList.toggle('has-rfq', rfq.length > 0);
    var list = $('#rfqList');
    if (!rfq.length) { list.innerHTML = '<li class="empty">' + t('q.none') + '</li>'; return; }
    list.innerHTML = rfq.map(function (id) {
      var p = D.products.filter(function (x) { return x.img === id; })[0]; if (!p) return '';
      return '<li><img src="assets/img/p/' + id + '.webp" alt=""><span>' + pname(p) + '</span><button type="button" data-rm="' + id + '" aria-label="remove">×</button></li>';
    }).join('');
    $$('[data-rm]').forEach(function (b) { b.addEventListener('click', function () { toggleRFQ(b.dataset.rm); }); });
  }

  /* ---------- materials ---------- */
  function renderMaterials() {
    var items = t('mat.items').split('|');
    var html = items.map(function (w) { return '<span>' + w + '</span>'; }).join('');
    $('#matTrack').innerHTML = html + html;
  }

  /* ---------- sectors ---------- */
  function renderSectors() {
    $('#secGrid').innerHTML = D.sectors.map(function (s, i) {
      return '<article class="sec"><img src="assets/img/ai/' + s.img + '.webp" alt="" loading="lazy"><div class="sec__body"><b>0' + (i + 1) + '</b><h3>' + t('sec.' + s.key) + '</h3><p>' + t('sec.' + s.key + 'D') + '</p></div></article>';
    }).join('');
  }

  /* ---------- projects ---------- */
  function renderProjects() {
    $('#ptrack').innerHTML = D.projects.map(function (p) {
      return '<figure class="pitem ' + p.w + '"><img src="assets/img/prj/' + p.img + '.webp" alt="' + (p.brand || t(p.cap)) + ' — Artix Fofana project" loading="lazy">' +
        '<figcaption>' + (p.brand ? '<b>' + p.brand + '</b>' : '') + '<span>' + t(p.cap) + '</span></figcaption></figure>';
    }).join('');
  }
  var prjTween = null;
  function setupProjects() {
    if (!hasG) return;
    if (prjTween) { prjTween.scrollTrigger && prjTween.scrollTrigger.kill(); prjTween.kill(); prjTween = null; gsap.set('#ptrack', { x: 0 }); }
    if (isMobile()) return;
    var track = $('#ptrack');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var dir = root.dir === 'rtl' ? 1 : -1;
    if (root.dir === 'rtl') { track.style.marginInlineStart = '0'; }
    prjTween = gsap.to(track, {
      x: function () { return dir * dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.projects', start: 'top top', end: function () { return '+=' + dist(); }, pin: '.projects__pin', scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 }
    });
  }

  /* ---------- clients ---------- */
  function renderClients() {
    var a = D.clientsA.map(function (n) { return '<span>' + n + '</span>'; }).join('');
    var b = D.clientsB.map(function (n) { return '<span>' + n + '</span>'; }).join('');
    $('#cliA').innerHTML = a + a; $('#cliB').innerHTML = b + b;
  }

  /* ---------- form ---------- */
  function renderTypes() {
    var cur = $('#qType').value;
    $('#qType').innerHTML = t('q.types').split('|').map(function (x) { return '<option>' + x + '</option>'; }).join('');
    if (cur) $('#qType').selectedIndex = Math.max(0, Array.prototype.findIndex.call($('#qType').options, function (o) { return o.text === cur; }));
  }
  $('#qForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, name = f.name.value.trim();
    if (!name) { f.name.classList.add('err'); f.name.focus(); toast(t('q.err')); return; }
    f.name.classList.remove('err');
    var lines = ['*' + t('q.msg') + '*', '', t('q.name') + ': ' + name];
    if (f.company.value.trim()) lines.push(t('q.company') + ': ' + f.company.value.trim());
    lines.push(t('q.type') + ': ' + f.type.value);
    if (f.qty.value.trim()) lines.push(t('q.qty') + ': ' + f.qty.value.trim());
    if (f.city.value.trim()) lines.push(t('q.city') + ': ' + f.city.value.trim());
    if (rfq.length) {
      lines.push('', t('q.items') + ':');
      rfq.forEach(function (id, i) { var p = D.products.filter(function (x) { return x.img === id; })[0]; if (p) lines.push((i + 1) + '. ' + pname(p) + ' (Catalog 2025 p.' + p.page + ')'); });
    }
    if (f.notes.value.trim()) lines.push('', t('q.notes') + ': ' + f.notes.value.trim());
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------- hero sequence ---------- */
  var FR = 73, frames = [], canvas = $('#heroCanvas'), ctx = canvas.getContext('2d'), cur = 0;
  function src(i) { return 'assets/seq/f' + String(i + 1).padStart(3, '0') + '.webp'; }
  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(cur);
  }
  function draw(i) {
    var img = frames[i];
    if (!img || !img.complete || !img.naturalWidth) { for (var k = i; k >= 0; k--) { if (frames[k] && frames[k].complete && frames[k].naturalWidth) { img = frames[k]; break; } } }
    if (!img || !img.naturalWidth) return;
    var cw = canvas.width, ch = canvas.height, iw = img.naturalWidth, ih = img.naturalHeight;
    var rtl = root.dir === 'rtl', CH = 0.6, BG = '#0c0a09';
    var s, w, h, x, y;
    if (cw / ch < 0.9) { /* portrait: chair in the upper part, text below */
      h = ch * 0.52; s = h / ih; w = iw * s;
      if (w < cw * 1.05) { w = cw * 1.05; s = w / iw; h = ih * s; }
      x = cw / 2 - CH * w; y = ch * 0.06;
    } else { /* landscape: chair on the side opposite the text */
      s = Math.max(ch / ih, (cw * 0.9) / iw); w = iw * s; h = ih * s;
      x = cw * 0.7 - CH * w; y = (ch - h) / 2;
      x = Math.min(x, cw * 0.32); if (x + w < cw) x = cw - w;
    }
    ctx.save();
    if (rtl) { ctx.translate(cw, 0); ctx.scale(-1, 1); }
    ctx.fillStyle = BG; ctx.fillRect(0, 0, cw, ch);
    if (x > 0) ctx.drawImage(img, 0, 0, 2, ih, 0, y, x + 2, h); /* stretch edge column into the gap */
    ctx.drawImage(img, x, y, w, h);
    if (y > 0 || y + h < ch) {
      var g1 = ctx.createLinearGradient(0, y, 0, y + h * 0.18); g1.addColorStop(0, BG); g1.addColorStop(1, 'rgba(12,10,9,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, y - 1, cw, h * 0.18);
      var g2 = ctx.createLinearGradient(0, y + h * 0.7, 0, y + h); g2.addColorStop(0, 'rgba(12,10,9,0)'); g2.addColorStop(1, BG);
      ctx.fillStyle = g2; ctx.fillRect(0, y + h * 0.7, cw, h * 0.3 + 1);
    }
    if (x > 0) { var g3 = ctx.createLinearGradient(x, 0, x + w * 0.2, 0); g3.addColorStop(0, BG); g3.addColorStop(1, 'rgba(12,10,9,0)'); ctx.fillStyle = g3; ctx.fillRect(0, 0, x + w * 0.2, ch); }
    ctx.restore();
  }
  for (var i = 0; i < FR; i++) {
    (function (k) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { if (k === 0 || k === cur) draw(cur); };
      frames[k] = im;
      setTimeout(function () { im.src = src(k); }, k === 0 ? 0 : 120 + k * 12);
    })(i);
  }
  window.addEventListener('resize', function () { sizeCanvas(); });
  sizeCanvas();
  var steps = $$('#heroSteps li'), bar = $('#heroBar');
  function heroProgress(p) {
    var f = Math.min(FR - 1, Math.round(p * 1.15 * (FR - 1)));
    if (f !== cur) { cur = f; draw(f); }
    bar.style.transform = 'scaleX(' + p + ')';
    var si = p < 0.3 ? 0 : p < 0.66 ? 1 : 2;
    steps.forEach(function (s, j) { s.classList.toggle('on', j === si); });
  }
  if (hasG) {
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: function (s) { heroProgress(s.progress); } });
    gsap.to('.hero__content', { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top+=55% top', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- counters ---------- */
  function counters() {
    $$('[data-count]').forEach(function (el) {
      var end = +el.dataset.count, plain = el.hasAttribute('data-plain'), suf = el.dataset.suffix || '';
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return; io.disconnect();
          var start = plain ? end - 40 : 0, t0 = performance.now(), dur = 1600;
          (function step(now) {
            var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
            var v = Math.round(start + (end - start) * e);
            el.textContent = (plain ? v : fmt(v)) + suf;
            if (k < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: .5 });
      io.observe(el);
    });
  }

  /* ---------- reveals ---------- */
  function reveals() {
    var els = $$('.sechead, .fac, .why__item, .stat, .hq__img, .hq__body, .form, .rfq');
    els.forEach(function (e) { e.classList.add('rv'); });
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
    var g = $('#growth');
    var io2 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { g.classList.add('in'); io2.disconnect(); } }, { threshold: .4 });
    io2.observe(g);
  }

  /* ---------- process ---------- */
  function process() {
    var items = $$('#procList li'), imgs = $$('.process__frame img'), num = $('#procNum');
    function act(i) {
      items.forEach(function (l, j) { l.classList.toggle('on', j === i); });
      imgs.forEach(function (m, j) { m.classList.toggle('on', j === i); });
      num.textContent = '0' + (i + 1);
    }
    items.forEach(function (li, i) {
      if (hasG) ScrollTrigger.create({ trigger: li, start: 'top 62%', end: 'bottom 62%', onToggle: function (s) { if (s.isActive) act(i); } });
    });
  }

  /* ---------- parallax ---------- */
  function parallax() {
    if (!hasG) return;
    $$('.fac__img img').forEach(function (im) { gsap.fromTo(im, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im.closest('.fac'), start: 'top bottom', end: 'bottom top', scrub: true } }); });
    gsap.fromTo('.materials__bg img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.materials', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- init ---------- */
  setLang(lang, true);
  setupManifesto();
  setupProjects();
  counters(); reveals(); process(); parallax();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { setupProjects(); if (hasG) ScrollTrigger.refresh(); }, 250); });
  window.addEventListener('load', function () { if (hasG) ScrollTrigger.refresh(); });
})();
