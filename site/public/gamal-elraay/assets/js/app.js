/* Gamal Elraay Furniture — app */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var D = window.GR, I = window.GR_I18N, L = window.GR_LOGO;
  var isMobile = function () { return window.matchMedia('(max-width:860px)').matches; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var stReady = false;
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };

  /* ---------- language ---------- */
  var params = new URLSearchParams(location.search);
  var lang = params.get('lang') || store.get('gr-lang', 'ar');
  if (!I[lang]) lang = 'ar';
  var t = function (k) { return (I[lang] && I[lang][k]) || I.ar[k] || I.en[k] || ''; };

  /* ---------- logo ---------- */
  var gid = 0;
  var OFF = { word: [60, 370], furn: [90, 478], mark: [210, 530] };
  function pathEl(n) { return '<path transform="translate(' + OFF[n][0] + ' ' + OFF[n][1] + ') scale(.3333333)" d="' + L[n] + '"/>'; }
  function gradDef(id) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DA86"/><stop offset=".45" stop-color="#D9A93C"/><stop offset="1" stop-color="#9C6B1C"/></linearGradient></defs>';
  }
  function drawLogo(svg, kind) {
    var id = 'grg' + (gid++);
    var parts = kind === 'mark' ? ['mark'] : kind === 'word' ? ['word'] : kind === 'wordfurn' ? ['word', 'furn'] : ['word', 'furn', 'mark'];
    svg.innerHTML = gradDef(id) + '<g fill="url(#' + id + ')" fill-rule="evenodd">' + parts.map(pathEl).join('') + '</g>';
  }
  $$('[data-logo]').forEach(function (s) { drawLogo(s, s.getAttribute('data-logo')); });

  /* ---------- intro ---------- */
  var intro = $('#intro');
  var introDone = false;
  function endIntro() {
    if (introDone) return; introDone = true;
    intro.classList.add('is-done');
    document.body.classList.remove('is-locked');
    setTimeout(function () { intro.style.display = 'none'; }, 1200);
    startHeroHint();
  }
  (function runIntro() {
    var seen = false;
    try { seen = sessionStorage.getItem('gr-intro') === '1'; } catch (e) {}
    if (seen || window.matchMedia('(prefers-reduced-motion:reduce)').matches) { intro.style.display = 'none'; introDone = true; return; }
    document.body.classList.add('is-locked');
    try { sessionStorage.setItem('gr-intro', '1'); } catch (e) {}
    var mark = $('#introMark');
    var id = 'grgi';
    mark.innerHTML = gradDef(id) + pathEl('mark');
    var p = mark.querySelector('path');
    var len = 0; try { len = p.getTotalLength(); } catch (e) { len = 9000; }
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    p.getBoundingClientRect();
    p.style.transition = 'stroke-dashoffset 2.1s cubic-bezier(.6,.05,.3,1), fill .9s ease, stroke-width .9s ease';
    requestAnimationFrame(function () { p.style.strokeDashoffset = 0; });
    setTimeout(function () { p.style.fill = 'url(#' + id + ')'; p.style.strokeWidth = '0'; }, 1900);
    drawLogo($('#introWord'), 'wordfurn');
    setTimeout(function () { intro.classList.add('is-word'); }, 2300);
    setTimeout(endIntro, 3500);
    $('#introSkip').addEventListener('click', endIntro);
  })();

  /* ---------- theme ---------- */
  $('#themeBtn').addEventListener('click', function () {
    var next = root.dataset.theme === 'day' ? 'night' : 'day';
    root.dataset.theme = next;
    try { localStorage.setItem('gr-theme', next); } catch (e) {}
    $('meta[name="theme-color"]').setAttribute('content', next === 'day' ? '#F6F1E8' : '#0b0a08');
  });

  /* ---------- contacts ---------- */
  function wa(msg) { return 'https://wa.me/' + D.config.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function bindContacts() {
    $$('[data-wa]').forEach(function (a) { a.href = wa(t('wa.hello') + ' Gamal Elraay Furniture'); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-wa-msg]').forEach(function (a) { a.href = wa(t('wa.hello') + ': ' + t(a.getAttribute('data-wa-msg'))); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-tel]').forEach(function (a) { a.href = 'tel:' + D.config.phone; if (a.classList.contains('num')) a.textContent = D.config.phoneDisplay; });
  }

  /* ---------- language UI ---------- */
  function buildLangUI() {
    var menu = $('#langMenu'), m2 = $('#mnavLangs');
    menu.innerHTML = ''; m2.innerHTML = '';
    window.GR_LANGS.forEach(function (l) {
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

  function setLang(code) {
    lang = code; store.set('gr-lang', code);
    var meta = window.GR_LANGS.filter(function (l) { return l.code === code; })[0];
    root.lang = code; root.dir = meta.dir;
    $('#langShort').textContent = meta.short;
    document.title = t('meta.title');
    var u = new URL(location.href); if (code === 'ar') u.searchParams.delete('lang'); else u.searchParams.set('lang', code);
    history.replaceState(null, '', u.toString());
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    buildLangUI();
    renderStatement(); renderMarquee(); renderCollections(); renderStudio(); renderShop(); renderCraft(); renderTailor(); renderList();
    bindContacts();
    if (stReady) { setupCollectionsScroll(); setupStatement(); setupCraft(); ScrollTrigger.refresh(); }
  }

  /* ---------- statement ---------- */
  function renderStatement() {
    var el = $('#statement'), txt = t('statement');
    var tokens = lang === 'zh' ? txt.split('') : txt.split(/\s+/);
    var goldIdx = Math.floor(tokens.length * 0.55);
    el.innerHTML = tokens.map(function (w, i) {
      var g = (lang === 'zh' ? (i > goldIdx && i < goldIdx + 6) : (i === goldIdx || i === goldIdx + 1)) ? ' gold' : '';
      return '<span class="w' + g + '">' + w + '</span>';
    }).join(lang === 'zh' ? '' : ' ');
  }
  var stmtST;
  function setupStatement() {
    if (stmtST) stmtST.kill();
    var ws = $$('#statement .w');
    stmtST = ScrollTrigger.create({
      trigger: '.statement', start: 'top 70%', end: 'bottom 60%', scrub: true,
      onUpdate: function (s) { var n = Math.round(s.progress * ws.length); ws.forEach(function (w, i) { w.classList.toggle('on', i < n); }); }
    });
  }

  /* ---------- marquee ---------- */
  function renderMarquee() {
    var words = ['col.classic', 'col.living', 'col.corner', 'col.bedroom', 'col.dining', 'col.office'].map(t);
    var html = words.concat(words).map(function (w) { return '<span>' + w + '</span>'; }).join('');
    $('#marq').innerHTML = html + html;
  }

  /* ---------- collections ---------- */
  function renderCollections() {
    $('#colsTrack').innerHTML = D.collections.map(function (c) {
      return '<article class="colcard" data-col="' + c.id + '"><img src="assets/img/' + c.img + '.webp" alt="' + t('col.' + c.id) + '" loading="lazy"><span class="colcard__frame"></span><span class="colcard__n num">' + c.n + '</span><div class="colcard__body"><h3>' + t('col.' + c.id) + '</h3><p>' + t('col.' + c.id + '.d') + '</p></div></article>';
    }).join('');
    $('#colsDots').innerHTML = D.collections.map(function (c, i) { return '<i class="' + (i ? '' : 'on') + '"></i>'; }).join('');
    $$('.colcard').forEach(function (card) {
      card.addEventListener('click', function () {
        var map = { classic: 'classic', living: 'living', corner: 'living', bedroom: 'bedroom', kids: 'bedroom', dining: 'dining', office: 'decor' };
        filterShop(map[card.dataset.col] || 'all');
        go('#showroom');
      });
    });
    var tr = $('#colsTrack');
    tr.onscroll = function () {
      var cards = $$('.colcard'), best = 0, bd = 1e9, mid = tr.getBoundingClientRect().left + tr.clientWidth / 2;
      cards.forEach(function (c, i) { var r = c.getBoundingClientRect(); var d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      $$('#colsDots i').forEach(function (d, i) { d.classList.toggle('on', i === best); });
    };
  }
  var colsST;
  function setupCollectionsScroll() {
    if (colsST) { colsST.kill(); colsST = null; }
    var tr = $('#colsTrack'); gsap.set(tr, { x: 0 });
    if (isMobile()) return;
    var dist = function () { return Math.max(0, tr.scrollWidth - window.innerWidth); };
    var rtl = root.dir === 'rtl';
    colsST = ScrollTrigger.create({
      trigger: '.cols', pin: '.cols__pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: 0.6, invalidateOnRefresh: true,
      animation: gsap.to(tr, { x: function () { return rtl ? dist() : -dist(); }, ease: 'none' })
    });
  }

  /* ---------- fabric studio ---------- */
  var fabIdx = 0, fabFront = 'A';
  function renderStudio() {
    $('#swatches').innerHTML = D.fabrics.map(function (f, i) {
      return '<button class="sw" role="radio" aria-checked="' + (i === fabIdx) + '" aria-label="' + t('fab.' + f.id) + '" title="' + t('fab.' + f.id) + '" style="--c:' + f.c + '" data-i="' + i + '"><i></i></button>';
    }).join('');
    $$('#swatches .sw').forEach(function (b) { b.addEventListener('click', function () { setFabric(+b.dataset.i); }); });
    // preload
    D.fabrics.forEach(function (f) { var im = new Image(); im.src = 'assets/img/' + f.img + '.webp'; });
    updateFabText();
  }
  function updateFabText() {
    var f = D.fabrics[fabIdx];
    $('#fabName').textContent = t('fab.' + f.id);
    var a = $('#fabCta'); a.href = wa(t('wa.fabric') + ' ' + t('fab.' + f.id)); a.target = '_blank'; a.rel = 'noopener';
  }
  function setFabric(i) {
    if (i === fabIdx) return;
    fabIdx = i;
    $$('#swatches .sw').forEach(function (b, k) { b.setAttribute('aria-checked', k === i); });
    var a = $('#fabA'), b = $('#fabB');
    var show = fabFront === 'A' ? b : a, hide = fabFront === 'A' ? a : b;
    show.src = 'assets/img/' + D.fabrics[i].img + '.webp';
    show.classList.add('is-on'); hide.classList.remove('is-on');
    fabFront = fabFront === 'A' ? 'B' : 'A';
    var w = $('#fabWipe'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go');
    updateFabText();
  }

  /* ---------- shop ---------- */
  var list = store.get('gr-list', []);
  var curCat = 'all';
  function prodById(id) { return D.products.filter(function (p) { return p.id === id; })[0]; }
  function pname(p) { return p.name[lang] || p.name.en; }
  function renderShop() {
    var cats = ['all', 'classic', 'living', 'bedroom', 'dining', 'decor'];
    $('#chips').innerHTML = cats.map(function (c) { return '<button class="chip' + (c === curCat ? ' is-on' : '') + '" data-c="' + c + '">' + (c === 'all' ? t('shop.all') : t('cat.' + c)) + '</button>'; }).join('');
    $$('#chips .chip').forEach(function (b) { b.addEventListener('click', function () { filterShop(b.dataset.c); }); });
    $('#grid').innerHTML = D.products.map(function (p) {
      var on = list.indexOf(p.id) > -1;
      return '<article class="card rv" data-cat="' + p.cat + '" data-id="' + p.id + '">' +
        '<div class="card__img" data-qv><img src="assets/img/' + p.id + '.webp" alt="' + pname(p) + '" loading="lazy"></div>' +
        '<div class="card__body"><span class="card__cat">' + t('cat.' + p.cat) + '</span><h3>' + pname(p) + '</h3>' +
        '<div class="card__row"><span class="card__price">' + t('shop.from') + ' <b class="num">' + fmt(p.price) + '</b> ' + t('shop.currency') + '</span>' +
        '<button class="heart' + (on ? ' on' : '') + '" data-heart aria-label="' + t('shop.add') + '"><svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.4-7.5 10-7.5 10z"/></svg></button></div></div></article>';
    }).join('');
    $$('#grid .card').forEach(function (c) {
      c.querySelector('[data-heart]').addEventListener('click', function () { toggleList(c.dataset.id); });
      c.querySelector('[data-qv]').addEventListener('click', function () { openModal(c.dataset.id); });
    });
    filterShop(curCat, true);
    observeReveal();
  }
  function filterShop(cat, silent) {
    curCat = cat;
    $$('#chips .chip').forEach(function (b) { b.classList.toggle('is-on', b.dataset.c === cat); });
    $$('#grid .card').forEach(function (c) { c.classList.toggle('is-hidden', cat !== 'all' && c.dataset.cat !== cat); });
    if (!silent && window.ScrollTrigger) ScrollTrigger.refresh();
  }
  function toggleList(id) {
    var i = list.indexOf(id);
    if (i > -1) list.splice(i, 1); else list.push(id);
    store.set('gr-list', list);
    $$('[data-id="' + id + '"] [data-heart]').forEach(function (h) { h.classList.toggle('on', i < 0); });
    var lb = $('#listBtn'); lb.classList.remove('bump'); void lb.offsetWidth; lb.classList.add('bump');
    renderList(); updateModalBtn();
  }
  function renderList() {
    $('#listCount').textContent = list.length;
    $('#listBtn').classList.toggle('has', list.length > 0);
    var body = $('#drawerBody');
    if (!list.length) { body.innerHTML = '<p class="drawer__empty">' + t('list.empty') + '</p>'; $('#drawerSend').style.display = 'none'; return; }
    $('#drawerSend').style.display = '';
    body.innerHTML = list.map(function (id) {
      var p = prodById(id); if (!p) return '';
      return '<div class="li"><img src="assets/img/' + p.id + '.webp" alt=""><div><h4>' + pname(p) + '</h4><p>' + t('shop.from') + ' <span class="num">' + fmt(p.price) + '</span> ' + t('shop.currency') + '</p></div><button class="x" data-rm="' + p.id + '" aria-label="remove">×</button></div>';
    }).join('');
    $$('[data-rm]').forEach(function (b) { b.addEventListener('click', function () { toggleList(b.dataset.rm); }); });
    var msg = t('wa.list') + '\n' + list.map(function (id, k) { var p = prodById(id); return p ? (k + 1) + '. ' + pname(p) + ' (' + t('shop.from') + ' ' + fmt(p.price) + ' ' + t('shop.currency') + ')' : ''; }).join('\n');
    var s = $('#drawerSend'); s.href = wa(msg); s.target = '_blank'; s.rel = 'noopener';
  }
  function openDrawer(o) { $('#drawer').classList.toggle('is-open', o); $('#drawer').setAttribute('aria-hidden', !o); if (window.__lenis) o ? __lenis.stop() : __lenis.start(); }
  $('#listBtn').addEventListener('click', function () { openDrawer(true); });
  $('#drawerX').addEventListener('click', function () { openDrawer(false); });
  $('#drawer').addEventListener('click', function (e) { if (e.target === this) openDrawer(false); });

  var mId = null;
  function openModal(id) {
    var p = prodById(id); if (!p) return; mId = id;
    $('#modalImg').src = 'assets/img/' + p.id + '.webp'; $('#modalImg').alt = pname(p);
    $('#modalCat').textContent = t('cat.' + p.cat);
    $('#modalName').textContent = pname(p);
    $('#modalPrice').innerHTML = t('shop.from') + ' <b class="num">' + fmt(p.price) + '</b> ' + t('shop.currency');
    $('#modalWa').href = wa(t('wa.hello') + ': ' + pname(p));
    updateModalBtn();
    $('#modal').classList.add('is-open'); $('#modal').setAttribute('aria-hidden', 'false');
    if (window.__lenis) __lenis.stop();
  }
  function updateModalBtn() { if (!mId) return; var on = list.indexOf(mId) > -1; $('#modalAdd').textContent = on ? t('shop.added') : t('shop.add'); }
  function closeModal() { $('#modal').classList.remove('is-open'); $('#modal').setAttribute('aria-hidden', 'true'); mId = null; if (window.__lenis) __lenis.start(); }
  $('#modalAdd').addEventListener('click', function () { if (mId) toggleList(mId); });
  $('#modalX').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); openDrawer(false); } });

  /* ---------- craft ---------- */
  function renderCraft() {
    $('#craftMedia').innerHTML = D.craft.map(function (c, i) { return '<img src="assets/img/' + c.img + '.webp" alt="" class="' + (i ? '' : 'is-on') + '" loading="lazy">'; }).join('');
    $('#craftMedia').setAttribute('data-n', '01');
    $('#craftList').innerHTML = D.craft.map(function (c, i) {
      return '<li class="' + (i ? '' : 'is-on') + '"><img src="assets/img/' + c.img + '.webp" alt="" loading="lazy"><span class="num">0' + c.id + '</span><h3>' + t('craft.' + c.id + '.t') + '</h3><p>' + t('craft.' + c.id + '.p') + '</p></li>';
    }).join('');
  }
  var craftSTs = [];
  function setupCraft() {
    craftSTs.forEach(function (s) { s.kill(); }); craftSTs = [];
    var lis = $$('#craftList li'), imgs = $$('#craftMedia img');
    lis.forEach(function (li, i) {
      craftSTs.push(ScrollTrigger.create({
        trigger: li, start: 'top 60%', end: 'bottom 60%',
        onToggle: function (s) { if (!s.isActive) return; lis.forEach(function (l, k) { l.classList.toggle('is-on', k === i); }); imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); }); $('#craftMedia').setAttribute('data-n', '0' + (i + 1)); }
      }));
    });
  }

  /* ---------- tailor ---------- */
  var sel = { room: null, piece: null, style: null, fabric: null };
  function renderTailor() {
    $$('.opts').forEach(function (box) {
      var g = box.dataset.group;
      box.innerHTML = D.tailor[g].map(function (v) {
        var label = g === 'fabric' ? t('fab.' + v) : t('opt.' + v);
        var sw = g === 'fabric' ? '<i style="--c:' + D.fabrics.filter(function (f) { return f.id === v; })[0].c + '"></i>' : '';
        return '<button type="button" class="opt" data-v="' + v + '" aria-pressed="' + (sel[g] === v) + '">' + sw + label + '</button>';
      }).join('');
      $$('.opt', box).forEach(function (b) {
        b.addEventListener('click', function () { sel[g] = sel[g] === b.dataset.v ? null : b.dataset.v; $$('.opt', box).forEach(function (o) { o.setAttribute('aria-pressed', o.dataset.v === sel[g]); }); updateTicket(); });
      });
    });
    updateTicket();
  }
  function selLabel(g) { var v = sel[g]; if (!v) return null; return g === 'fabric' ? t('fab.' + v) : t('opt.' + v); }
  function updateTicket() {
    var f = $('#tailorForm');
    var rows = [['tailor.room', selLabel('room')], ['tailor.piece', selLabel('piece')], ['tailor.style', selLabel('style')], ['tailor.fabric', selLabel('fabric')], ['tailor.size', f.size.value.trim() || null]];
    $('#ticketList').innerHTML = rows.map(function (r) { return '<div><dt>' + t(r[0]) + '</dt><dd class="' + (r[1] ? '' : 'empty') + '">' + (r[1] || '—') + '</dd></div>'; }).join('');
  }
  $('#tailorForm').addEventListener('input', updateTicket);
  $('#tailorForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, lines = [t('wa.tailor') + ' — Gamal Elraay', ''];
    [['tailor.room', selLabel('room')], ['tailor.piece', selLabel('piece')], ['tailor.style', selLabel('style')], ['tailor.fabric', selLabel('fabric')], ['tailor.size', f.size.value.trim()], ['tailor.name', f.name.value.trim()], ['tailor.phone', f.phone.value.trim()], ['tailor.notes', f.notes.value.trim()]]
      .forEach(function (r) { if (r[1]) lines.push(t(r[0]) + ': ' + r[1]); });
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------- nav ---------- */
  function setNav(o) {
    document.body.classList.toggle('nav-open', o);
    document.body.classList.toggle('is-locked', o);
    if (window.__lenis) o ? __lenis.stop() : __lenis.start();
    onScroll(window.scrollY);
  }
  $('#burger').addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  function go(hash) {
    var el = $(hash); if (!el) return;
    if (window.__lenis) __lenis.scrollTo(el, { offset: hash === '#collections' || hash === '#top' ? 0 : -40, duration: 1.4 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); if (document.body.classList.contains('nav-open')) setNav(false); go(h);
  });

  /* ---------- reveal ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observeReveal() { $$('.rv:not(.in)').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; if (io) io.observe(el); else el.classList.add('in'); }); }
  $$('.h2, .lead, .studio__stage, .ticket, .form, .promise, .visit__card').forEach(function (el) { el.classList.add('rv'); });

  /* ---------- hero frames ---------- */
  var FR = 73, frames = [], loaded = 0, cur = -1;
  var cv = $('#heroCanvas'), cx = cv.getContext('2d');
  function src(i) { return 'assets/seq/f' + String(i + 1).padStart(3, '0') + '.webp'; }
  function sizeCanvas() { var dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; cur = -1; }
  function draw(i) {
    i = Math.max(0, Math.min(FR - 1, i));
    var im = frames[i];
    if (!im || !im.complete || !im.naturalWidth) { for (var k = i; k >= 0; k--) if (frames[k] && frames[k].complete && frames[k].naturalWidth) { im = frames[k]; break; } }
    if (!im) return;
    var W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight;
    var portrait = W / H < 1, s, w, h, x, y;
    if (portrait) { s = Math.max(W * 1.22 / iw, H * 0.4 / ih); w = iw * s; h = ih * s; x = (W - w) / 2; y = H * 0.6 - h / 2; }
    else { s = Math.max(W / iw, H / ih) * 0.86; w = iw * s; h = ih * s; x = (W - w) / 2; y = H - h * 0.96; }
    cx.fillStyle = '#050403'; cx.fillRect(0, 0, W, H);
    cx.drawImage(im, x, y, w, h);
    // feather the frame edges into the background
    var e = Math.max(40, W * 0.08), g;
    g = cx.createLinearGradient(x, 0, x + e, 0); g.addColorStop(0, '#050403'); g.addColorStop(1, 'rgba(5,4,3,0)'); cx.fillStyle = g; cx.fillRect(x - 2, y, e, h);
    g = cx.createLinearGradient(x + w, 0, x + w - e, 0); g.addColorStop(0, '#050403'); g.addColorStop(1, 'rgba(5,4,3,0)'); cx.fillStyle = g; cx.fillRect(x + w - e, y, e + 2, h);
    g = cx.createLinearGradient(0, y, 0, y + e * 1.4); g.addColorStop(0, '#050403'); g.addColorStop(1, 'rgba(5,4,3,0)'); cx.fillStyle = g; cx.fillRect(x, y - 2, w, e * 1.4);
    g = cx.createLinearGradient(0, y + h, 0, y + h - e); g.addColorStop(0, '#050403'); g.addColorStop(1, 'rgba(5,4,3,0)'); cx.fillStyle = g; cx.fillRect(x, y + h - e, w, e + 2);
  }
  function loadFrames() {
    for (var i = 0; i < FR; i++) {
      (function (i) {
        var im = new Image(); im.decoding = 'async'; im.src = src(i);
        im.onload = function () { loaded++; if (i === 0 || i === cur) draw(Math.max(cur, 0)); };
        frames[i] = im;
      })(i);
    }
  }
  sizeCanvas(); loadFrames();
  window.addEventListener('resize', function () { sizeCanvas(); draw(curFrame); });
  var curFrame = 0, step = 0;
  function startHeroHint() {}

  /* ---------- header / bbar ---------- */
  var lastY = 0, hdrHidden = false;
  function onScroll(y) {
    var hdr = $('#hdr'), navOpen = document.body.classList.contains('nav-open');
    var mob = isMobile();
    var hh = $('#hero').offsetHeight - window.innerHeight;
    hdr.classList.toggle('is-solid', navOpen || (mob ? y > 24 : y > hh - 10));
    // phones: hide while scrolling down, show again on scroll up
    var dy = y - lastY;
    if (mob && !navOpen) {
      if (y < 80) hdrHidden = false;
      else if (dy > 6) hdrHidden = true;
      else if (dy < -6) hdrHidden = false;
    } else hdrHidden = false;
    hdr.classList.toggle('is-hidden', hdrHidden);
    lastY = y;
    $('.bbar').classList.toggle('show', y > window.innerHeight * 0.6);
    $('.hero__hint').style.opacity = y > 60 ? 0 : 1;
  }

  /* ---------- init ---------- */
  setLang(lang);
  draw(0);

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger); stReady = true;
    var lenis = null;
    if (window.Lenis && !window.matchMedia('(prefers-reduced-motion:reduce)').matches && !window.matchMedia('(hover:none),(pointer:coarse)').matches) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', function (e) { ScrollTrigger.update(); onScroll(e.scroll); });
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
    }
    var steps = $$('.hero__step');
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.3,
      onUpdate: function (s) {
        var p = s.progress;
        var fp = Math.min(1, Math.max(0, (p - 0.06) / 0.78));
        var f = Math.round(fp * (FR - 1));
        if (f !== curFrame) { curFrame = f; requestAnimationFrame(function () { draw(curFrame); }); }
        $('#heroBar').style.transform = 'scaleX(' + p + ')';
        $('.hero__grid').style.setProperty('--grid', String(Math.max(0, 1 - fp * 2.2)));
        var ns = p < 0.3 ? 0 : p < 0.66 ? 1 : 2;
        if (ns !== step) { step = ns; steps.forEach(function (el, i) { el.classList.toggle('is-on', i === ns); }); }
      }
    });
    gsap.to('.visit__bg', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.visit', start: 'top bottom', end: 'bottom top', scrub: true } });
    setupCollectionsScroll(); setupStatement(); setupCraft();
    var lastW = window.innerWidth;
    window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - lastW) > 40) { lastW = window.innerWidth; setupCollectionsScroll(); ScrollTrigger.refresh(); } });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  } else {
    window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });
  }
  onScroll(window.scrollY);
  observeReveal();
})();
