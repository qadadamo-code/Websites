/* Al Badawy Furniture — app */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var D = window.BD, I = window.BD_I18N, L = window.BD_LOGO;
  var isMobile = function () { return window.matchMedia('(max-width:860px)').matches; };
  var isTouch = window.matchMedia('(hover:none),(pointer:coarse)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- language ---------- */
  var params = new URLSearchParams(location.search);
  var lang = params.get('lang') || store.get('bd-lang', 'ar');
  if (!I[lang]) lang = 'ar';
  var t = function (k) { return (I[lang] && I[lang][k]) || I.ar[k] || ''; };

  /* ---------- logo ---------- */
  var gid = 0;
  function grad(id) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8A5A12"/><stop offset=".42" stop-color="#D9A640"/><stop offset=".68" stop-color="#F7D77C"/><stop offset="1" stop-color="#C8902C"/></linearGradient></defs>';
  }
  function drawLogo(svg, kind) {
    var id = 'bdg' + (gid++), g = '';
    if (kind === 'mark') g = '<path d="' + L.mark.d + '"/>';
    else if (kind === 'name') g = '<path d="' + L.ar.d + '"/><path transform="translate(0 232)" d="' + L.en.d + '"/>';
    else g = '<path d="' + L.mark.d + '"/><path transform="translate(0 1472)" d="' + L.ar.d + '"/><path transform="translate(0 1704)" d="' + L.en.d + '"/>';
    svg.innerHTML = grad(id) + '<g fill="url(#' + id + ')" fill-rule="evenodd">' + g + '</g>';
  }
  $$('[data-logo]').forEach(function (s) { drawLogo(s, s.getAttribute('data-logo')); });

  /* ---------- intro ---------- */
  var intro = $('#intro'), introDone = false;
  function endIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add('is-done');
    document.body.classList.remove('is-locked');
    setTimeout(function () { intro.style.display = 'none'; }, 1100);
  }
  (function runIntro() {
    var seen = false;
    try { seen = sessionStorage.getItem('bd-intro') === '1'; } catch (e) {}
    if (seen || reduce) { intro.style.display = 'none'; introDone = true; return; }
    document.body.classList.add('is-locked');
    try { sessionStorage.setItem('bd-intro', '1'); } catch (e) {}
    var mark = $('#introMark');
    mark.innerHTML = grad('bdgi') + '<path fill-rule="evenodd" d="' + L.mark.d + '"/>';
    var p = mark.querySelector('path');
    var len = 0; try { len = p.getTotalLength(); } catch (e) { len = 30000; }
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    p.getBoundingClientRect();
    p.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.6,.05,.3,1), fill .9s ease, stroke-width .9s ease';
    requestAnimationFrame(function () { p.style.strokeDashoffset = 0; });
    setTimeout(function () { p.style.fill = 'url(#bdgi)'; p.style.strokeWidth = '0'; }, 1900);
    drawLogo($('#introName'), 'name');
    setTimeout(function () { intro.classList.add('is-name'); }, 2300);
    setTimeout(endIntro, 3600);
    $('#introSkip').addEventListener('click', endIntro);
  })();

  /* ---------- night sky ---------- */
  var sky = $('#sky'), sx = sky.getContext('2d'), stars = [], skyOn = false, skyRaf = 0;
  function sizeSky() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    sky.width = innerWidth * dpr; sky.height = innerHeight * dpr;
    sx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(innerWidth * innerHeight / 9000);
    stars = [];
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.3 + .3, p: Math.random() * 6.28, s: .6 + Math.random() * 1.6, g: Math.random() < .08 });
  }
  function drawSky(time) {
    sx.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], a = .35 + .65 * (.5 + .5 * Math.sin(s.p + time / 1000 * s.s));
      sx.globalAlpha = a;
      sx.fillStyle = s.g ? '#F4D37A' : '#FFFFFF';
      if (s.g) { sx.save(); sx.translate(s.x, s.y); sx.rotate(Math.PI / 4); sx.fillRect(-s.r * 1.6, -s.r * 1.6, s.r * 3.2, s.r * 3.2); sx.restore(); }
      else { sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.28); sx.fill(); }
    }
    sx.globalAlpha = 1;
    if (skyOn && !reduce) skyRaf = requestAnimationFrame(drawSky);
  }
  function setSky() {
    skyOn = root.dataset.theme === 'night';
    cancelAnimationFrame(skyRaf);
    if (skyOn) { if (!stars.length) sizeSky(); skyRaf = requestAnimationFrame(drawSky); }
  }
  window.addEventListener('resize', function () { if (stars.length) sizeSky(); });

  /* ---------- theme ---------- */
  function applyTheme() {
    $('meta[name="theme-color"]').setAttribute('content', root.dataset.theme === 'night' ? '#0C1322' : '#FBF6EE');
    setSky(); if (window.__heroDraw) __heroDraw();
  }
  $('#themeBtn').addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'night' ? 'day' : 'night';
    store.set('bd-theme', root.dataset.theme);
    try { localStorage.setItem('bd-theme', root.dataset.theme); } catch (e) {}
    applyTheme();
  });

  /* ---------- contacts ---------- */
  function wa(msg) { return 'https://wa.me/' + D.config.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function bindContacts() {
    $$('[data-wa]').forEach(function (a) { a.href = wa(t('wa.hello')); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-tel]').forEach(function (a) { a.href = 'tel:' + D.config.phone; if (a.classList.contains('num')) a.textContent = D.config.phoneDisplay; });
  }

  /* ---------- language UI ---------- */
  function buildLangUI() {
    var html = '', mh = '';
    window.BD_LANGS.forEach(function (l) {
      html += '<li><button data-l="' + l.code + '" role="option" aria-selected="' + (l.code === lang) + '">' + l.label + '<small>' + l.short + '</small></button></li>';
      mh += '<button data-l="' + l.code + '" aria-selected="' + (l.code === lang) + '">' + l.label + '</button>';
    });
    $('#langMenu').innerHTML = html; $('#mnavLangs').innerHTML = mh;
    $$('[data-l]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.l); $('#lang').classList.remove('is-open'); setNav(false); }); });
  }
  $('#langBtn').addEventListener('click', function (e) { e.stopPropagation(); var o = $('#lang').classList.toggle('is-open'); this.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function () { $('#lang').classList.remove('is-open'); });

  function setLang(code) {
    lang = I[code] ? code : 'ar';
    var meta = window.BD_LANGS.filter(function (l) { return l.code === lang; })[0];
    root.lang = lang; root.dir = meta.dir;
    store.set('bd-lang', lang);
    document.title = t('meta.title');
    $('#langShort').textContent = meta.short;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
    buildLangUI(); bindContacts();
    renderMarquee(); renderStatement(); renderAges(); renderWorlds(); renderStudio(); renderSafety(); renderShop(); renderList(); renderProc(); renderFaq();
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 60);
  }

  /* ---------- marquee + statement ---------- */
  function renderMarquee() {
    var w = t('marq').split('|');
    $('#marq').innerHTML = w.concat(w).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('');
  }
  var stmtST = null;
  function renderStatement() {
    var words = t('stmt.txt').split(/\s+/);
    $('#stmt').innerHTML = words.map(function (w) { return '<span class="w">' + esc(w) + '</span>'; }).join(' ');
    if (window.ScrollTrigger) setupStatement();
  }
  function setupStatement() {
    if (stmtST) stmtST.kill();
    var ws = $$('#stmt .w');
    stmtST = ScrollTrigger.create({ trigger: '.stmt', start: 'top 70%', end: 'bottom 60%', scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length * 1.1); ws.forEach(function (w, i) { w.classList.toggle('on', i < n); }); } });
  }

  /* ---------- ages ---------- */
  var ageIdx = 0;
  function renderAges() {
    $('#agesRail').innerHTML = '<span class="ages__pill" id="agesPill"></span>' + D.ages.map(function (a, i) {
      return '<button class="ages__tab' + (i === ageIdx ? ' is-on' : '') + '" role="tab" data-i="' + i + '"><b>' + esc(t('age.' + a.id + '.t')) + '</b><small>' + esc(t('age.' + a.id + '.l')) + '</small></button>';
    }).join('');
    $('#agesMedia').innerHTML = D.ages.map(function (a, i) { return '<img src="assets/img/' + a.img + '.webp" alt="" loading="lazy" decoding="async"' + (i === ageIdx ? ' class="is-on"' : '') + '>'; }).join('');
    $$('.ages__tab').forEach(function (b) { b.addEventListener('click', function () { setAge(+b.dataset.i); }); });
    setAge(ageIdx, true);
  }
  function setAge(i, quiet) {
    ageIdx = i; var a = D.ages[i];
    $$('.ages__tab').forEach(function (b, k) { b.classList.toggle('is-on', k === i); b.setAttribute('aria-selected', k === i); });
    $$('#agesMedia img').forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
    var tab = $$('.ages__tab')[i], pill = $('#agesPill');
    if (tab && pill) {
      var r = tab.getBoundingClientRect(), pr = $('#agesRail').getBoundingClientRect();
      var off = root.dir === 'rtl' ? pr.right - r.right : r.left - pr.left;
      pill.style.insetInlineStart = off + 'px'; pill.style.width = r.width + 'px';
    }
    var info = $('#agesInfo');
    info.classList.remove('anim'); void info.offsetWidth;
    info.innerHTML = '<span class="ages__age">' + esc(t('age.' + a.id + '.l')) + '</span><h3>' + esc(t('age.' + a.id + '.t')) + '</h3><p>' + esc(t('age.' + a.id + '.p')) + '</p><ul class="ticks">' +
      t('age.' + a.id + '.f').split('|').map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul><a class="btn btn--gold" target="_blank" rel="noopener" href="' + wa(t('wa.ask') + ': ' + t('age.' + a.id + '.t') + ' (' + t('age.' + a.id + '.l') + ')') + '">' + esc(t('ages.cta')) + '</a>';
    if (!quiet) info.classList.add('anim');
  }
  window.addEventListener('resize', function () { setAge(ageIdx, true); });

  /* ---------- worlds ---------- */
  function renderWorlds() {
    $('#worldsTrack').innerHTML = D.worlds.map(function (w, i) {
      return '<article class="wcard" style="--tint:' + w.tint + '" data-id="' + w.id + '"><img src="assets/img/' + w.img + '.webp" alt="" loading="lazy" decoding="async"><span class="wcard__num"><span>' + String(i + 1).padStart(2, '0') + '</span></span>' +
        '<div class="wcard__body"><h3>' + esc(t('w.' + w.id + '.t')) + '</h3><p>' + esc(t('w.' + w.id + '.p')) + '</p><a class="wcard__go" target="_blank" rel="noopener" href="' + wa(t('wa.ask') + ': ' + t('w.' + w.id + '.t')) + '">' + esc(t('worlds.ask')) + ' ↗</a></div></article>';
    }).join('');
    $('#worldsDots').innerHTML = D.worlds.map(function (w, i) { return '<i class="' + (i ? '' : 'on') + '"></i>'; }).join('');
    var tr = $('#worldsTrack');
    tr.onscroll = function () {
      var cards = $$('.wcard'), mid = innerWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, i) { var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      $$('#worldsDots i').forEach(function (d, i) { d.classList.toggle('on', i === best); });
    };
  }
  var worldsST = null;
  function setupWorldsScroll() {
    if (worldsST) { worldsST.kill(); worldsST = null; gsap.set('#worldsTrack', { clearProps: 'transform' }); }
    if (isMobile()) return;
    var tr = $('#worldsTrack');
    var dist = function () { return Math.max(0, tr.scrollWidth - innerWidth); };
    worldsST = ScrollTrigger.create({
      trigger: '.worlds', pin: '.worlds__pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: .6, invalidateOnRefresh: true,
      animation: gsap.to(tr, { x: function () { return root.dir === 'rtl' ? dist() : -dist(); }, ease: 'none' })
    });
  }

  /* ---------- studio ---------- */
  var st = store.get('bd-studio', { tone: 0, size: 0, addons: ['canopy'], name: '' });
  function renderStudio() {
    $('#tones').innerHTML = D.tones.map(function (x, i) { return '<button type="button" class="tone" role="radio" style="--c:' + x.c + '" aria-checked="' + (i === st.tone) + '" aria-label="' + esc(t('tone.' + x.id)) + '" title="' + esc(t('tone.' + x.id)) + '" data-i="' + i + '"></button>'; }).join('');
    $('#sizes').innerHTML = D.sizes.map(function (x, i) { return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === st.size) + '" class="num">' + esc(t('size.' + x.id)) + '</button>'; }).join('');
    $('#addons').innerHTML = D.addons.map(function (x) { return '<label class="addon"><input type="checkbox" value="' + x.id + '"' + (st.addons.indexOf(x.id) > -1 ? ' checked' : '') + '><span>' + esc(t('addon.' + x.id)) + '</span></label>'; }).join('');
    $$('#tones .tone').forEach(function (b) { b.addEventListener('click', function () { setTone(+b.dataset.i); }); });
    $$('#sizes button').forEach(function (b) { b.addEventListener('click', function () { st.size = +b.dataset.i; $$('#sizes button').forEach(function (x, k) { x.setAttribute('aria-pressed', k === st.size); }); calc(); }); });
    $$('#addons input').forEach(function (c) { c.addEventListener('change', function () { st.addons = $$('#addons input:checked').map(function (x) { return x.value; }); calc(); }); });
    D.tones.forEach(function (x) { var im = new Image(); im.src = 'assets/img/' + x.img + '.webp'; });
    $('#kidName').value = st.name;
    setTone(st.tone, true); updatePlaque(); calc();
  }
  var front = 0;
  function setTone(i, instant) {
    st.tone = i;
    $$('#tones .tone').forEach(function (b, k) { b.setAttribute('aria-checked', k === i); });
    $('#toneLabel').textContent = t('tone.' + D.tones[i].id);
    var a = $('#studioImg'), b = $('#studioImg2'), src = 'assets/img/' + D.tones[i].img + '.webp';
    if (instant) { a.src = src; a.classList.remove('is-off'); b.classList.add('is-off'); front = 0; }
    else {
      var show = front === 0 ? b : a, hide = front === 0 ? a : b;
      show.src = src; show.classList.remove('is-off'); hide.classList.add('is-off'); front = 1 - front;
    }
    calc();
  }
  function updatePlaque() {
    var n = $('#kidName').value.trim();
    $('#plaqueName').textContent = n || t('studio.default');
    var p = $('#plaque'); p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
  }
  $('#kidName').addEventListener('input', function () { st.name = this.value; updatePlaque(); calc(); });
  function calc() {
    var total = D.basePrice + D.sizes[st.size].price;
    st.addons.forEach(function (id) { var a = D.addons.filter(function (x) { return x.id === id; })[0]; if (a) total += a.price; });
    $('#total').textContent = fmt(total);
    store.set('bd-studio', st);
    var lines = [t('wa.studio'),
      '• ' + t('studio.tone') + ': ' + t('tone.' + D.tones[st.tone].id),
      '• ' + t('studio.size') + ': ' + t('size.' + D.sizes[st.size].id),
      '• ' + t('studio.addons') + ': ' + (st.addons.length ? st.addons.map(function (id) { return t('addon.' + id); }).join('، ') : '—')];
    if (st.name.trim()) lines.push('• ' + t('studio.name') + ': ' + st.name.trim());
    lines.push('• ' + t('studio.est') + ': ' + fmt(total) + ' ' + t('shop.currency'));
    $('#studioSend').href = wa(lines.join('\n'));
  }
  $('#studioForm').addEventListener('submit', function (e) { e.preventDefault(); });

  /* ---------- safety ---------- */
  var ICONS = [
    '<path d="M4 20V10a6 6 0 0 1 6-6h10"/><path d="M4 20h16"/>',
    '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
    '<path d="M12 21V11"/><path d="M12 11c-4 0-7-2.5-7-6 3 0 7 1.5 7 6zM12 13c3.5 0 6-2 6-5-2.5 0-6 1.2-6 5z"/>',
    '<rect x="5" y="3" width="11" height="18" rx="2"/><path d="M16 7h4M20 5v4M9 11h3"/>',
    '<path d="M3 17h18M5 17V9M19 17V9M3 9h18M9 9v8M15 9v8"/>',
    '<path d="M7 20h10M12 20V9"/><path d="M8 13l4-4 4 4"/><circle cx="12" cy="5" r="1.6"/>'
  ];
  var BGS = ['var(--blush)', 'var(--sky)', 'var(--sage)', 'var(--honey)', '#D9CBEA', '#F2D3B7'];
  function renderSafety() {
    $('#safetyList').innerHTML = [1, 2, 3, 4, 5, 6].map(function (n, i) {
      return '<li class="rv"><i style="--bgc:' + BGS[i] + '"><svg viewBox="0 0 24 24">' + ICONS[i] + '</svg></i><b>' + esc(t('safe.' + n + '.t')) + '</b><span>' + esc(t('safe.' + n + '.p')) + '</span></li>';
    }).join('');
    $('#sealTxt').textContent = t('safety.seal').repeat(lang === 'ar' ? 1 : 2);
    observeReveal();
  }

  /* ---------- before / after ---------- */
  var baBox = $('#baBox');
  $('#baRange').addEventListener('input', function () { baBox.style.setProperty('--p', this.value + '%'); });

  /* ---------- shop ---------- */
  var list = store.get('bd-list', []), curCat = 'all';
  function prod(id) { return D.products.filter(function (p) { return p.id === id; })[0]; }
  function pn(p) { return t('p.' + p.id + '.n'); }
  var heart = '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/></svg>';
  function renderShop() {
    var cats = ['all', 'beds', 'storage', 'study', 'baby'];
    $('#chips').innerHTML = cats.map(function (c) { return '<button class="chip' + (c === curCat ? ' is-on' : '') + '" data-c="' + c + '">' + esc(c === 'all' ? t('shop.all') : t('cat.' + c)) + '</button>'; }).join('');
    $$('#chips .chip').forEach(function (b) { b.addEventListener('click', function () { filterShop(b.dataset.c); }); });
    $('#grid').innerHTML = D.products.map(function (p) {
      return '<article class="card rv" data-id="' + p.id + '" data-cat="' + p.cat + '"><div class="card__img" data-qv><img src="assets/img/' + p.img + '.webp" alt="' + esc(pn(p)) + '" loading="lazy" decoding="async">' +
        (p.tag ? '<span class="card__tag' + (p.tag === 'new' ? ' card__tag--new' : '') + '">' + esc(t('tag.' + p.tag)) + '</span>' : '') +
        '</div><button class="card__heart' + (list.indexOf(p.id) > -1 ? ' on' : '') + '" data-heart aria-label="save">' + heart + '</button>' +
        '<div class="card__body"><span class="card__cat">' + esc(t('cat.' + p.cat)) + '</span><h3>' + esc(pn(p)) + '</h3><div class="card__row"><span class="card__price"><small>' + esc(t('shop.from')) + '</small> <span class="num">' + fmt(p.price) + '</span> <small>' + esc(t('shop.currency')) + '</small></span><button class="card__qv" data-qv aria-label="view">↗</button></div></div></article>';
    }).join('');
    $$('#grid .card').forEach(function (c) {
      c.querySelector('[data-heart]').addEventListener('click', function () { toggleList(c.dataset.id); });
      $$('[data-qv]', c).forEach(function (q) { q.addEventListener('click', function () { openModal(c.dataset.id); }); });
    });
    filterShop(curCat); observeReveal();
  }
  function filterShop(c) {
    curCat = c;
    $$('#chips .chip').forEach(function (b) { b.classList.toggle('is-on', b.dataset.c === c); });
    $$('#grid .card').forEach(function (el) { el.classList.toggle('is-hidden', c !== 'all' && el.dataset.cat !== c); });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  function toggleList(id) {
    var i = list.indexOf(id);
    if (i > -1) list.splice(i, 1); else list.push(id);
    store.set('bd-list', list);
    $$('[data-id="' + id + '"] [data-heart]').forEach(function (h) { h.classList.toggle('on', i < 0); });
    if (mId === id) $('#mHeart').textContent = list.indexOf(id) > -1 ? t('shop.saved') : t('shop.save');
    renderList();
  }
  function renderList() {
    $('#listCount').textContent = list.length;
    $('#listBtn').classList.toggle('has', list.length > 0);
    var body = $('#drawerBody');
    if (!list.length) { body.innerHTML = '<p class="empty">' + esc(t('list.empty')) + '</p>'; $('#listSend').href = wa(t('wa.hello')); return; }
    body.innerHTML = list.map(function (id) { var p = prod(id); return p ? '<div class="li"><img src="assets/img/' + p.img + '.webp" alt=""><div><b>' + esc(pn(p)) + '</b><small>' + esc(t('shop.from')) + ' <span class="num">' + fmt(p.price) + '</span> ' + esc(t('shop.currency')) + '</small></div><button class="x" data-rm="' + id + '" aria-label="remove">✕</button></div>' : ''; }).join('');
    $$('[data-rm]').forEach(function (b) { b.addEventListener('click', function () { toggleList(b.dataset.rm); }); });
    $('#listSend').href = wa(t('wa.list') + '\n' + list.map(function (id, k) { var p = prod(id); return p ? (k + 1) + '. ' + pn(p) + ' (' + t('shop.from') + ' ' + fmt(p.price) + ' ' + t('shop.currency') + ')' : ''; }).join('\n'));
  }
  function lockScroll(o) { if (window.__lenis) o ? __lenis.stop() : __lenis.start(); document.body.classList.toggle('is-locked', o); }
  function openDrawer(o) { $('#drawer').classList.toggle('is-open', o); $('#drawer').setAttribute('aria-hidden', !o); lockScroll(o); }
  $('#listBtn').addEventListener('click', function () { openDrawer(true); });
  $('#drawerX').addEventListener('click', function () { openDrawer(false); });
  $('#drawer').addEventListener('click', function (e) { if (e.target === this) openDrawer(false); });
  var mId = null;
  function openModal(id) {
    var p = prod(id); if (!p) return; mId = id;
    $('#mImg').src = 'assets/img/' + p.img + '.webp'; $('#mImg').alt = pn(p);
    $('#mCat').textContent = t('cat.' + p.cat); $('#mName').textContent = pn(p); $('#mDesc').textContent = t('p.' + p.id + '.d');
    $('#mPrice').textContent = fmt(p.price);
    $('#mWa').href = wa(t('wa.ask') + ': ' + pn(p) + ' (' + t('shop.from') + ' ' + fmt(p.price) + ' ' + t('shop.currency') + ')');
    $('#mHeart').textContent = list.indexOf(id) > -1 ? t('shop.saved') : t('shop.save');
    $('#modal').classList.add('is-open'); $('#modal').setAttribute('aria-hidden', 'false'); lockScroll(true);
  }
  function closeModal() { $('#modal').classList.remove('is-open'); $('#modal').setAttribute('aria-hidden', 'true'); mId = null; lockScroll(false); }
  $('#modalX').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  $('#mHeart').addEventListener('click', function () { if (mId) toggleList(mId); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); openDrawer(false); setNav(false); } });

  /* ---------- process + faq ---------- */
  var PROC_IMG = ['room_empty', 'craft_sketch', 'craft_workshop', 'hero_room'];
  function renderProc() {
    $('#procList').innerHTML = [1, 2, 3, 4].map(function (n, i) {
      return '<li class="rv"><div class="proc__dot"><b class="num">' + n + '</b></div><div class="proc__img"><img src="assets/img/' + PROC_IMG[i] + '.webp" alt="" loading="lazy" decoding="async"></div><h3>' + esc(t('proc.' + n + '.t')) + '</h3><p>' + esc(t('proc.' + n + '.p')) + '</p></li>';
    }).join('');
    observeReveal();
  }
  function renderFaq() {
    $('#faqList').innerHTML = [1, 2, 3, 4, 5].map(function (n) {
      return '<div class="qa' + (n === 1 ? ' is-open' : '') + '"><button aria-expanded="' + (n === 1) + '">' + esc(t('faq.' + n + '.q')) + '<i>+</i></button><div class="qa__a"><div><p>' + esc(t('faq.' + n + '.a')) + '</p></div></div></div>';
    }).join('');
    $$('.qa button').forEach(function (b) { b.addEventListener('click', function () { var q = b.parentNode, o = !q.classList.contains('is-open'); q.classList.toggle('is-open', o); b.setAttribute('aria-expanded', o); setTimeout(function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 500); }); });
  }

  /* ---------- reveal ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observeReveal() { $$('.rv:not(.in)').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); }); }

  /* ---------- mobile nav ---------- */
  function setNav(o) { document.body.classList.toggle('nav-open', o); lockScroll(o); }
  $('#burger').addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  $$('.mnav nav a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });

  /* ---------- anchors ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = a.getAttribute('href'); if (h.length < 2) return;
      var el = $(h); if (!el) return;
      e.preventDefault();
      var target = h === '#top' ? 0 : el;
      if (window.__lenis) __lenis.scrollTo(target, { offset: h === '#top' ? 0 : -80, duration: 1.3 });
      else window.scrollTo({ top: h === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' });
    });
  });

  /* ---------- hero frames ---------- */
  var cv = $('#heroCanvas'), cx = cv.getContext('2d'), N = D.config.frames, frames = new Array(N), cur = 0, heroP = 0;
  function src(i) { return 'assets/seq/f' + String(i + 1).padStart(3, '0') + '.webp'; }
  function load(i) { if (frames[i]) return; var im = new Image(); im.decoding = 'async'; im.onload = function () { if (i === cur || i === 0) draw(); }; im.src = src(i); frames[i] = im; }
  function sizeCv() { var dpr = Math.min(devicePixelRatio || 1, 2); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; draw(); }
  function nearest(i) { for (var d = 0; d < N; d++) { var a = frames[i - d], b = frames[i + d]; if (a && a.complete && a.naturalWidth) return a; if (b && b.complete && b.naturalWidth) return b; } return null; }
  function draw() {
    var im = nearest(cur); if (!im) return;
    var W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight;
    var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    var fx = isMobile() ? 0.47 : 0.5; // keep the bed centred on phones
    cx.drawImage(im, (W - dw) * fx, (H - dh) * 0.5, dw, dh);
  }
  window.__heroDraw = function () {
    var night = root.dataset.theme === 'night';
    $('#heroNight').style.opacity = night ? Math.max(0, Math.min(1, (heroP - 0.8) / 0.15)) : 0;
    $('#heroNight').style.objectPosition = (isMobile() ? 47 : 50) + '% 50%';
  };
  load(0);
  (function preload() { var i = 1; (function next() { if (i >= N) return; load(i); i += 1; setTimeout(next, i < 12 ? 0 : 30); })(); })();
  window.addEventListener('resize', sizeCv);
  sizeCv();

  /* ---------- header + scroll ---------- */
  var lastY = 0, hidden = false;
  function onScroll(y) {
    var hdr = $('#hdr'), navOpen = document.body.classList.contains('nav-open');
    var dy = y - lastY; lastY = y;
    if (!navOpen) {
      if (y < 80) hidden = false;
      else if (dy > 6) hidden = true;
      else if (dy < -6) hidden = false;
    } else hidden = false;
    hdr.classList.toggle('is-hidden', hidden);
    $('.hero__hint').style.opacity = y > 60 ? 0 : 1;
    $('.fab').classList.toggle('on', y > innerHeight * 0.8);
  }

  /* ---------- boot ---------- */
  root.dataset.theme = root.dataset.theme || 'day';
  setLang(lang);
  applyTheme();

  function boot() {
    if (!window.gsap || !window.ScrollTrigger) { window.addEventListener('scroll', function () { onScroll(scrollY); }, { passive: true }); return; }
    gsap.registerPlugin(ScrollTrigger);
    var lenis = null;
    if (window.Lenis && !reduce && !isTouch) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', function (e) { ScrollTrigger.update(); onScroll(e.scroll); });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener('scroll', function () { onScroll(scrollY); }, { passive: true });
    }
    var steps = $$('.hero__step');
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: .3,
      onUpdate: function (s) {
        heroP = s.progress;
        var f = Math.min(N - 1, Math.round(heroP * (N - 1) * 1.08));
        if (f !== cur) { cur = f; draw(); }
        $('#heroBar').style.transform = 'scaleX(' + heroP + ')';
        var k = heroP < .3 ? 0 : heroP < .66 ? 1 : 2;
        steps.forEach(function (el, i) { el.classList.toggle('is-on', i === k); });
        __heroDraw();
      }
    });
    setupStatement();
    setupWorldsScroll();
    var wasMob = isMobile();
    window.addEventListener('resize', function () { if (isMobile() !== wasMob) { wasMob = isMobile(); setupWorldsScroll(); ScrollTrigger.refresh(); } });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  boot();
})();
