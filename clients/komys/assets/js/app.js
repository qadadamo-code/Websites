/* Komy's Furniture — app */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var D = window.KM, I = window.KM_I18N, root = document.documentElement;
  var isTouch = window.matchMedia('(pointer:coarse)').matches;
  var isMobile = function () { return window.matchMedia('(max-width:860px)').matches; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var qs = new URLSearchParams(location.search);
  var lang = qs.get('lang') || store.get('km-lang', 'ar');
  if (!I[lang]) lang = 'ar';
  var t = function (k) { return (I[lang] && I[lang][k]) || I.ar[k] || ''; };
  var egp = function (n) { return fmt(n) + ' <em>' + t('shop.egp') + '</em>'; };

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll (desktop only) ---------- */
  var lenis = null;
  if (!isTouch && window.Lenis && !qs.has('nolenis')) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(el) { if (!el) return; if (lenis) lenis.scrollTo(el, { offset: -60 }); else el.scrollIntoView({ behavior: 'smooth' }); }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { var id = a.getAttribute('href'); if (id.length < 2) { e.preventDefault(); if (lenis) lenis.scrollTo(0); else scrollTo({ top: 0, behavior: 'smooth' }); return; } var el = $(id); if (el) { e.preventDefault(); setNav(false); scrollToEl(el); } });
  });

  /* ---------- intro ---------- */
  var intro = $('#intro');
  function endIntro() { if (intro.classList.contains('is-done')) return; intro.classList.add('is-done'); document.body.style.overflow = ''; setTimeout(function () { intro.style.display = 'none'; }, 1000); }
  if (sessionStorage && (function () { try { return sessionStorage.getItem('km-intro'); } catch (e) { return null; } })()) { intro.style.display = 'none'; intro.classList.add('is-done'); }
  else {
    try { sessionStorage.setItem('km-intro', '1'); } catch (e) {}
    requestAnimationFrame(function () { intro.classList.add('is-draw'); });
    setTimeout(function () { intro.classList.add('is-fill'); }, 1300);
    setTimeout(function () { intro.classList.add('is-word'); }, 1500);
    setTimeout(endIntro, 2900);
    $('#introSkip').addEventListener('click', endIntro);
  }

  /* ---------- theme ---------- */
  function themeColor() { $('meta[name="theme-color"]').setAttribute('content', root.dataset.theme === 'night' ? '#13100D' : '#F4EDE3'); }
  themeColor();
  $('#themeBtn').addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'night' ? 'day' : 'night';
    store.set('km-theme', root.dataset.theme); themeColor();
  });

  /* ---------- nav / header ---------- */
  function setNav(open) { document.body.classList.toggle('nav-open', open); if (lenis) { open ? lenis.stop() : lenis.start(); } document.body.style.overflow = open ? 'hidden' : ''; }
  $('#burger').addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
  var hdr = $('#hdr'), lastY = 0, hero = $('#hero');
  function onScroll() {
    var y = window.scrollY, heroEnd = hero.offsetHeight - window.innerHeight;
    hdr.classList.toggle('is-solid', y > heroEnd - 10);
    if (!document.body.classList.contains('nav-open')) hdr.classList.toggle('is-hide', y > lastY && y > heroEnd + 200);
    lastY = y;
    $('.fab-wa').classList.toggle('on', y > heroEnd);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- contacts ---------- */
  function wa(msg) { return 'https://wa.me/' + D.config.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function bindContacts() {
    $$('[data-wa]').forEach(function (a) { a.href = wa(t('wa.hello')); a.target = '_blank'; a.rel = 'noopener'; });
    $$('[data-tel]').forEach(function (a) { a.href = 'tel:' + D.config.phone; });
    $$('[data-phone]').forEach(function (s) { s.textContent = D.config.phoneDisplay; });
  }

  /* ---------- language ---------- */
  function applyLang() {
    root.lang = lang; root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('meta.title');
    $('#langLbl').textContent = lang === 'ar' ? 'EN' : 'ع';
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    bindContacts(); renderRooms(); renderStudio(); renderShop(); renderPlanner(); renderPerks(); renderFormRooms(); renderList();
    ScrollTrigger.refresh();
  }
  $('#langBtn').addEventListener('click', function () {
    lang = lang === 'ar' ? 'en' : 'ar'; store.set('km-lang', lang);
    var u = new URL(location.href); u.searchParams.set('lang', lang); history.replaceState(null, '', u);
    applyLang(); setupRooms();
  });

  /* ---------- HERO: one room, one day ---------- */
  var cv = $('#heroCv'), ctx = cv.getContext('2d'), N = 73, frames = [], cur = -1, loaded = 0;
  function src(i) { return 'assets/seq/f' + String(i + 1).padStart(3, '0') + '.webp'; }
  for (var i = 0; i < N; i++) { (function (i) { var im = new Image(); im.decoding = 'async'; im.onload = function () { loaded++; if (i === 0 || i === cur) draw(cur < 0 ? 0 : cur, true); }; im.src = src(i); frames[i] = im; })(i); }
  function size() { var dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; draw(cur < 0 ? 0 : cur, true); }
  function draw(idx, force) {
    if (idx === cur && !force) return;
    var im = frames[idx];
    if (!im || !im.complete || !im.naturalWidth) { for (var j = idx; j >= 0; j--) { if (frames[j] && frames[j].complete && frames[j].naturalWidth) { im = frames[j]; break; } } if (!im || !im.naturalWidth) return; }
    cur = idx;
    var cw = cv.width, ch = cv.height, iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(cw / iw, ch / ih);
    var w = iw * s, h = ih * s, x = (cw - w) / 2, y = (ch - h) / 2;
    if (cw / ch < 1) x = Math.min(0, Math.max(cw - w, cw / 2 - w * 0.36)); // portrait: keep sofa + window
    ctx.drawImage(im, x, y, w, h);
  }
  window.addEventListener('resize', size); size();
  var steps = $$('.hstep'), arcOn = $('#arcOn'), orb = $('#orb'), clock = $('#clockTxt'), bar = $('#heroBar'), hint = $('.hero__hint');
  var arcLen = arcOn.getTotalLength();
  arcOn.style.strokeDasharray = arcLen; arcOn.style.strokeDashoffset = arcLen;
  ScrollTrigger.create({
    trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: function (st) {
      var p = st.progress, fp = Math.min(1, p / 0.86);
      draw(Math.min(N - 1, Math.round(fp * (N - 1))));
      var si = p < 0.24 ? 0 : p < 0.52 ? 1 : p < 0.8 ? 2 : 3;
      steps.forEach(function (s, k) { s.classList.toggle('is-on', k === si); });
      var mins = 7 * 60 + fp * (16 * 60); // 07:00 → 23:00
      var hh = Math.floor(mins / 60), mm = Math.floor(mins % 60 / 15) * 15;
      clock.textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      arcOn.style.strokeDashoffset = arcLen * (1 - fp);
      var pt = arcOn.getPointAtLength(arcLen * fp); orb.setAttribute('cx', pt.x); orb.setAttribute('cy', pt.y);
      orb.style.fill = fp > 0.6 ? '#E9ECFF' : '#FFD9A0';
      bar.style.transform = 'scaleX(' + p + ')';
      hint.style.opacity = p > 0.04 ? 0 : 0.85;
    }
  });

  /* ---------- stats counters ---------- */
  $$('[data-count]').forEach(function (el) {
    var n = +el.dataset.count, plus = el.hasAttribute('data-plus');
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
      var o = { v: 0 }; gsap.to(o, { v: n, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = (plus ? '+' : '') + fmt(o.v); } });
    } });
  });

  /* ---------- rooms ---------- */
  function renderRooms() {
    $('#roomsTrack').innerHTML = D.rooms.map(function (r, i) {
      return '<article class="room" data-room="' + r.id + '"><img src="' + r.img + '" alt="' + t('room.' + r.id) + '" loading="lazy"><span class="room__n">0' + (i + 1) + '</span><span class="room__c">' + r.count + ' ' + t('rooms.pieces') + '</span><div class="room__b"><h3>' + t('room.' + r.id) + '</h3><p>' + t('room.' + r.id + '.d') + '</p><span class="room__go">' + t('rooms.view') + ' <svg><use href="#i-arrow"/></svg></span></div></article>';
    }).join('');
    $$('.room').forEach(function (r) { r.addEventListener('click', function () { var c = r.dataset.room; var map = { living: 'living', bedroom: 'bedroom', dining: 'dining', office: 'office', outdoor: 'outdoor' }; filterShop(map[c] || 'all'); scrollToEl($('#shop')); }); });
  }
  var roomsST = null;
  function setupRooms() {
    if (roomsST) { roomsST.scrollTrigger && roomsST.scrollTrigger.kill(); roomsST.kill(); roomsST = null; gsap.set('#roomsTrack', { x: 0 }); }
    if (isMobile()) return;
    var track = $('#roomsTrack');
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var dir = root.dir === 'rtl' ? 1 : -1;
    roomsST = gsap.to(track, { x: function () { return dir * dist(); }, ease: 'none', scrollTrigger: { trigger: '.rooms', start: 'top top', end: function () { return '+=' + dist(); }, pin: '.rooms__pin', scrub: 0.6, invalidateOnRefresh: true } });
  }

  /* ---------- fabric studio ---------- */
  var st = { fab: 'clay', size: '300' }, sizeK = { '240': 0.84, '300': 1, '360': 1.22 };
  function fabObj() { return D.fabrics.filter(function (f) { return f.id === st.fab; })[0]; }
  function renderStudio() {
    var imgs = $('#stImgs');
    if (!imgs.children.length) imgs.innerHTML = D.fabrics.map(function (f) { return '<img data-f="' + f.id + '" src="' + f.img + '" alt="" loading="lazy">'; }).join('');
    $('#stSw').innerHTML = D.fabrics.map(function (f) { return '<button class="sw" role="radio" aria-checked="' + (f.id === st.fab) + '" data-v="' + f.id + '" style="--c:' + f.c + '" aria-label="' + t('fab.' + f.id) + '" title="' + t('fab.' + f.id) + '"></button>'; }).join('');
    $('#stSize').innerHTML = ['240', '300', '360'].map(function (s) { return '<button type="button" aria-pressed="' + (s === st.size) + '" data-v="' + s + '">' + t('size.' + s) + '</button>'; }).join('');
    $$('#stSw .sw').forEach(function (b) { b.addEventListener('click', function () { st.fab = b.dataset.v; $$('#stSw .sw').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); updStudio(); }); });
    $$('#stSize button').forEach(function (b) { b.addEventListener('click', function () { st.size = b.dataset.v; $$('#stSize button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); updStudio(); }); });
    updStudio();
  }
  function updStudio() {
    var f = fabObj();
    $$('#stImgs img').forEach(function (im) { im.classList.toggle('on', im.dataset.f === st.fab); });
    $('#stFabName').textContent = t('fab.' + f.id);
    var badge = $('#stBadge'); badge.textContent = t('fab.' + f.id); badge.style.setProperty('--sw', f.c);
    var price = (D.sofaBase + f.add) * sizeK[st.size];
    $('#stPrice').innerHTML = fmt(Math.round(price / 100) * 100) + ' <small style="font-size:.8rem;color:var(--mute)">' + t('shop.egp') + '</small>';
    $('#stOrder').href = wa(t('wa.studio') + ' — ' + t('fab.' + f.id) + ' — ' + t('size.' + st.size) + ' — ' + fmt(Math.round(price / 100) * 100) + ' ' + t('shop.egp'));
    $('#stOrder').target = '_blank';
  }
  // before / after: morning vs night
  (function () {
    var box = $('#compare'), top = $('#cmpTop'), hd = $('#cmpHandle'), drag = false;
    function set(x) { var r = box.getBoundingClientRect(); var p = Math.min(1, Math.max(0, (x - r.left) / r.width)); top.style.clipPath = 'inset(0 ' + ((1 - p) * 100) + '% 0 0)'; hd.style.left = (p * 100) + '%'; }
    box.addEventListener('pointerdown', function (e) { drag = true; set(e.clientX); });
    window.addEventListener('pointermove', function (e) { if (drag) set(e.clientX); });
    window.addEventListener('pointerup', function () { drag = false; });
    ScrollTrigger.create({ trigger: box, start: 'top 75%', once: true, onEnter: function () { var o = { p: 0.5 }; gsap.timeline().to(o, { p: 0.72, duration: 0.9, ease: 'power2.inOut', onUpdate: u }).to(o, { p: 0.3, duration: 1.1, ease: 'power2.inOut', onUpdate: u }).to(o, { p: 0.5, duration: 0.8, ease: 'power2.inOut', onUpdate: u }); function u() { top.style.clipPath = 'inset(0 ' + ((1 - o.p) * 100) + '% 0 0)'; hd.style.left = (o.p * 100) + '%'; } } });
  })();

  /* ---------- shop ---------- */
  var curCat = 'all', list = store.get('km-list', []);
  function prod(id) { return D.products.filter(function (p) { return p.id === id; })[0]; }
  function renderShop() {
    var cats = ['all', 'living', 'dining', 'bedroom', 'office', 'outdoor'];
    $('#chips').innerHTML = cats.map(function (c) { return '<button class="chip' + (c === curCat ? ' is-on' : '') + '" data-c="' + c + '">' + (c === 'all' ? t('shop.all') : t('cat.' + c)) + '</button>'; }).join('');
    $$('#chips .chip').forEach(function (b) { b.addEventListener('click', function () { filterShop(b.dataset.c); }); });
    $('#grid').innerHTML = D.products.map(function (p) {
      var on = list.indexOf(p.id) > -1;
      return '<article class="card rv" data-id="' + p.id + '" data-cat="' + p.cat + '"><div class="card__img"><img src="assets/img/' + p.id + '.webp" alt="' + t('p.' + p.id) + '" loading="lazy">' +
        (p.tag ? '<span class="card__tag' + (p.tag === 'new' ? ' card__tag--new' : '') + '">' + t('tag.' + p.tag) + '</span>' : '') +
        '<div class="card__acts"><button data-heart class="' + (on ? 'on' : '') + '" aria-label="' + t('shop.add') + '"><svg><use href="#i-heart"/></svg></button><button data-qv aria-label="' + t('shop.view') + '"><svg><use href="#i-eye"/></svg></button></div></div>' +
        '<div class="card__b"><small>' + t('cat.' + p.cat) + '</small><h3>' + t('p.' + p.id) + '</h3><div class="price"><b>' + egp(p.price) + '</b>' + (p.old ? '<s>' + fmt(p.old) + '</s>' : '') + '</div><span class="inst">' + t('shop.fromInst') + ' · ' + fmt(Math.ceil(p.price / 12 / 10) * 10) + ' ' + t('shop.month') + '</span></div></article>';
    }).join('');
    $$('#grid .card').forEach(function (c) {
      c.querySelector('[data-heart]').addEventListener('click', function (e) { e.stopPropagation(); toggleList(c.dataset.id); });
      c.querySelector('[data-qv]').addEventListener('click', function (e) { e.stopPropagation(); openModal(c.dataset.id); });
      c.querySelector('.card__img img').addEventListener('click', function () { openModal(c.dataset.id); });
    });
    filterShop(curCat, true); reveal();
  }
  function filterShop(cat, silent) {
    curCat = cat;
    $$('#chips .chip').forEach(function (b) { b.classList.toggle('is-on', b.dataset.c === cat); });
    $$('#grid .card').forEach(function (c) { c.classList.toggle('is-hidden', cat !== 'all' && c.dataset.cat !== cat); });
    if (!silent) ScrollTrigger.refresh();
  }
  function toggleList(id) {
    var i = list.indexOf(id); if (i > -1) list.splice(i, 1); else list.push(id);
    store.set('km-list', list);
    $$('#grid .card[data-id="' + id + '"] [data-heart]').forEach(function (b) { b.classList.toggle('on', list.indexOf(id) > -1); });
    var lb = $('#listBtn'); lb.classList.remove('bump'); void lb.offsetWidth; lb.classList.add('bump');
    renderList(); updModalBtn(id);
  }
  function renderList() {
    var c = $('#listCount'); c.textContent = list.length; c.classList.toggle('on', list.length > 0);
    var tot = 0;
    $('#drItems').innerHTML = list.length ? list.map(function (id) { var p = prod(id); tot += p.price; return '<div class="di"><img src="assets/img/' + id + '.webp" alt=""><div><b>' + t('p.' + id) + '</b><span>' + fmt(p.price) + ' ' + t('shop.egp') + '</span></div><button class="icon" data-rm="' + id + '" aria-label="remove"><svg><use href="#i-x"/></svg></button></div>'; }).join('') : '<p class="empty">' + t('list.empty') + '</p>';
    $('#drTotal').textContent = fmt(tot) + ' ' + t('shop.egp');
    $$('[data-rm]').forEach(function (b) { b.addEventListener('click', function () { toggleList(b.dataset.rm); }); });
    var msg = t('wa.list') + '\n' + list.map(function (id) { return '• ' + t('p.' + id) + ' — ' + fmt(prod(id).price) + ' ' + t('shop.egp'); }).join('\n') + '\n' + t('list.total') + ': ' + fmt(tot) + ' ' + t('shop.egp');
    var s = $('#drSend'); s.href = wa(msg); s.target = '_blank'; s.style.pointerEvents = list.length ? '' : 'none'; s.style.opacity = list.length ? '' : '.5';
  }
  function openLayer(el) { el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); if (lenis) lenis.stop(); document.body.style.overflow = 'hidden'; }
  function closeLayer(el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); document.body.style.overflow = ''; }
  $('#listBtn').addEventListener('click', function () { openLayer($('#drawer')); });
  $('#drClear').addEventListener('click', function () { list.slice().forEach(toggleList); });
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeLayer(b.closest('.drawer,.modal')); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { $$('.drawer.open,.modal.open').forEach(closeLayer); setNav(false); } });
  var mdId = null;
  function updModalBtn(id) { if (id !== mdId) return; var on = list.indexOf(id) > -1, b = $('#mdAdd'); b.textContent = on ? '♥ ' + t('shop.added') : '♡ ' + t('shop.add'); b.classList.toggle('is-on', on); }
  function openModal(id) {
    var p = prod(id); mdId = id;
    $('#mdImg').src = 'assets/img/' + id + '.webp'; $('#mdCat').textContent = t('cat.' + p.cat); $('#mdName').textContent = t('p.' + id); $('#mdDesc').textContent = t('pd.' + id);
    $('#mdPrice').innerHTML = egp(p.price); $('#mdOld').textContent = p.old ? fmt(p.old) : '';
    $('#mdInst').textContent = t('shop.fromInst') + ' · ' + fmt(Math.ceil(p.price / 12 / 10) * 10) + ' ' + t('shop.month');
    var a = $('#mdAsk'); a.href = wa(t('wa.item') + ' ' + t('p.' + id) + ' (' + fmt(p.price) + ' ' + t('shop.egp') + ')'); a.target = '_blank';
    updModalBtn(id); openLayer($('#modal'));
  }
  $('#mdAdd').addEventListener('click', function () { if (mdId) toggleList(mdId); });

  /* ---------- planner ---------- */
  var pl = { room: 'living', size: 'm', mood: 'warm' };
  function renderPlanner() {
    $('#plRoom').innerHTML = D.planner.rooms.map(function (r) { return '<button type="button" data-v="' + r.id + '" aria-pressed="' + (r.id === pl.room) + '">' + t('pr.' + r.id) + '</button>'; }).join('');
    $('#plSize').innerHTML = D.planner.sizes.map(function (s) { return '<button type="button" data-v="' + s.id + '" aria-pressed="' + (s.id === pl.size) + '">' + t('ps.' + s.id) + '</button>'; }).join('');
    $('#plMood').innerHTML = D.planner.moods.map(function (m) { return '<button type="button" class="mood" data-v="' + m.id + '" aria-pressed="' + (m.id === pl.mood) + '"><span>' + m.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' + t('pm.' + m.id) + '</button>'; }).join('');
    [['#plRoom', 'room'], ['#plSize', 'size'], ['#plMood', 'mood']].forEach(function (g) {
      $$(g[0] + ' button').forEach(function (b) { b.addEventListener('click', function () { pl[g[1]] = b.dataset.v; $$(g[0] + ' button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); updPlan(true); }); });
    });
    updPlan();
  }
  function updPlan(anim) {
    var r = D.planner.rooms.filter(function (x) { return x.id === pl.room; })[0], s = D.planner.sizes.filter(function (x) { return x.id === pl.size; })[0], m = D.planner.moods.filter(function (x) { return x.id === pl.mood; })[0];
    var price = Math.round(r.base * s.k * (pl.mood === 'bold' ? 1.15 : 1) / 1000) * 1000;
    var title = t('pr.' + r.id) + ' · ' + t('pm.' + m.id);
    $('#tkTitle').textContent = title;
    $('#tkPal').innerHTML = m.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('');
    $('#tkInc').textContent = t('inc.' + r.id);
    $('#tkPrice').innerHTML = fmt(price) + ' <small style="font-size:.85rem;color:var(--mute)">' + t('shop.egp') + '</small>';
    var a = $('#tkSend'); a.href = wa(t('wa.plan') + '\n' + title + ' (' + t('ps.' + s.id) + ')\n' + t('inc.' + r.id) + '\n' + t('plan.from') + ' ' + fmt(price) + ' ' + t('shop.egp')); a.target = '_blank';
    if (anim) { var tk = $('#ticket'); tk.classList.remove('flash'); void tk.offsetWidth; tk.classList.add('flash'); }
  }

  /* ---------- perks marquee ---------- */
  function renderPerks() {
    var h = [1, 2, 3, 4].map(function (k) { return '<span>' + t('perk.' + k) + '</span>'; }).join('');
    $('#perks').innerHTML = h + h + h + h;
  }

  /* ---------- form ---------- */
  function renderFormRooms() {
    $('#fRoom').innerHTML = '<option value="">' + t('f.pick') + '</option>' + D.rooms.map(function (r) { return '<option>' + t('room.' + r.id) + '</option>'; }).join('');
  }
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    var msg = t('wa.hello') + '\n' + t('f.name') + ': ' + f.name.value + '\n' + t('f.phone') + ': ' + f.phone.value + (f.room.value ? '\n' + t('f.room') + ': ' + f.room.value : '') + (f.msg.value ? '\n' + f.msg.value : '');
    window.open(wa(msg), '_blank', 'noopener');
  });

  /* ---------- reveals / parallax ---------- */
  function reveal() {
    $$('.rv:not(.bound)').forEach(function (el) { el.classList.add('bound'); ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { el.classList.add('in'); } }); });
  }
  $$('.sec-head, .rooms__head, .studio__grid, .compare, .q, .ticket, .steps li, .rev, .visit__box, .visit__media, .stat').forEach(function (el) { el.classList.add('rv'); });
  gsap.to('.craft__media img', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: '.craft__media', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- boot ---------- */
  applyLang(); setupRooms(); reveal(); onScroll();
  var rw = window.innerWidth;
  window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - rw) > 80) { rw = window.innerWidth; setupRooms(); ScrollTrigger.refresh(); } });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
