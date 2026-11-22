/* Lamset Decor · interactions */
(function () {
  'use strict';
  var D = window.LD, LM = window.LamsaMark;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var mqM = matchMedia('(max-width: 899px)');
  var hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger);

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = store.get('ld-lang') === 'en' ? 'en' : 'ar';
  function t(o) { return o ? (o[lang] != null ? o[lang] : o.ar) : ''; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(u) { return u * u * (3 - 2 * u); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function money(n) { return Number(n).toLocaleString('en-US') + (lang === 'ar' ? ' ج.م' : ' EGP'); }
  function waUrl(text) { return 'https://wa.me/' + D.config.whatsapp + '?text=' + encodeURIComponent(text); }
  function openWa(text) { window.open(waUrl(text), '_blank', 'noopener'); }
  function L(ar, en) { return lang === 'ar' ? ar : en; }

  /* ---------- marks ---------- */
  var introSvg = LM.mount($('#introMark'), { build: true });
  $$('[data-mark=nav],[data-mark=core],[data-mark=ticket]').forEach(function (el) { LM.mount(el); });
  var footMark = LM.mount($('[data-mark=foot]')); footMark.classList.add('mark--light');

  /* ---------- contacts ---------- */
  $('#phoneTxt').textContent = D.config.phoneTxt;
  ['#callBtn', '#mbarCall'].forEach(function (s) { $(s).href = 'tel:' + D.config.phone; });
  $('#year').textContent = new Date().getFullYear();
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-wa]');
    if (a) { e.preventDefault(); openWa(t(D.wa[a.getAttribute('data-wa')])); }
  });

  /* ---------- static language ---------- */
  function applyStatic() {
    $$('[data-en]').forEach(function (el) {
      if (el.dataset.ar == null) el.dataset.ar = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.ar;
    });
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $('#langBtn').textContent = lang === 'ar' ? 'EN' : 'ع';
    document.title = L('لمسة ديكور | تصميم داخلي وتشطيب وفرش', 'Lamset Decor | Interior design, finishing & furnishing');
  }

  /* =========================================================
     HERO · bare concrete → plan → finishing → furnished
     ========================================================= */
  var hero = { p: 0, frames: { d: [], m: [] }, set: 'd', w: 0, h: 0, last: -1 };
  var canvas = $('#heroCanvas'), ctx = canvas.getContext('2d');
  var FR = { d: [1120, 630], m: [630, 1120] };
  var PLAN = {
    d: [
      { k: 'poly', pts: '146,2 952,2 745,168 319,168', l: { ar: 'سقف جبس + إضاءة مخفية', en: 'Gypsum ceiling + cove light' }, lp: [548, 120] },
      { k: 'rect', r: [381, 202, 364, 190], l: { ar: 'حائط تجليد خشب', en: 'Wood clad wall' }, lp: [563, 300] },
      { k: 'rect', r: [157, 459, 694, 146], s: 1, l: { ar: 'كنبة L · 6.20 م', en: 'L sofa · 6.20 m' }, lp: [504, 540] },
      { k: 'rect', r: [748, 370, 157, 106], s: 1, l: { ar: 'فوتيه', en: 'Armchair' }, lp: [826, 428] },
      { k: 'ell', c: [540, 405, 92, 22] },
      { k: 'dim', a: [157, 618], b: [851, 618] }
    ],
    m: [
      { k: 'poly', pts: '0,34 630,34 482,269 146,269', l: { ar: 'سقف جبس + إضاءة', en: 'Gypsum + cove light' }, lp: [315, 190] },
      { k: 'rect', r: [176, 356, 289, 310], l: { ar: 'شباك + ستاير', en: 'Window + sheers' }, lp: [320, 420] },
      { k: 'rect', r: [4, 582, 203, 292], s: 1, l: { ar: 'كنبة', en: 'Sofa' }, lp: [105, 740] },
      { k: 'rect', r: [409, 577, 145, 123], s: 1, l: { ar: 'فوتيه', en: 'Chair' }, lp: [482, 642] },
      { k: 'ell', c: [319, 717, 86, 26] },
      { k: 'dim', a: [20, 968], b: [610, 968], l: { ar: '4.20 م', en: '4.20 m' }, lp: [315, 955] }
    ]
  };
  var planEls = [], planLabels = [];

  function pickSet() { return innerWidth / innerHeight < 0.9 ? 'm' : 'd'; }
  function buildPlan() {
    var set = hero.set, f = FR[set], svg = $('#heroPlan');
    svg.setAttribute('viewBox', '0 0 ' + f[0] + ' ' + f[1]);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    var h = '';
    PLAN[set].forEach(function (s) {
      var cls = 'pl' + (s.s ? ' pl--solid' : '');
      if (s.k === 'poly') h += '<polygon class="' + cls + '" points="' + s.pts + '" pathLength="1"/>';
      if (s.k === 'rect') h += '<rect class="' + cls + '" x="' + s.r[0] + '" y="' + s.r[1] + '" width="' + s.r[2] + '" height="' + s.r[3] + '" rx="6" pathLength="1"/>';
      if (s.k === 'ell') h += '<ellipse class="pl pl--solid" cx="' + s.c[0] + '" cy="' + s.c[1] + '" rx="' + s.c[2] + '" ry="' + s.c[3] + '" pathLength="1"/>';
      if (s.k === 'dim') h += '<path class="dim" d="M' + s.a[0] + ' ' + s.a[1] + 'H' + s.b[0] + 'M' + s.a[0] + ' ' + (s.a[1] - 9) + 'v18M' + s.b[0] + ' ' + (s.b[1] - 9) + 'v18" pathLength="1"/>';
      if (s.l) h += '<text x="' + s.lp[0] + '" y="' + s.lp[1] + '" text-anchor="middle" font-size="' + (set === 'm' ? 24 : 16) + '">' + esc(t(s.l)) + '</text>';
    });
    svg.innerHTML = h;
    planEls = $$('polygon,rect,ellipse,path', svg);
    planLabels = $$('text', svg);
    planEls.forEach(function (e) { e.style.strokeDasharray = e.classList.contains('pl--solid') || e.tagName === 'path' ? '1' : '.012 .012'; });
  }
  function buildPins() {
    $('#heroPins').innerHTML = D.pins.map(function (p, i) {
      return '<div class="pin" data-i="' + i + '"><span class="pin__dot"></span><span class="pin__card"><b>' + esc(t(p.t)) + '</b><small>' + esc(t(p.s)) + '</small></span></div>';
    }).join('');
    placePins();
  }
  function cover() {
    var f = FR[hero.set], W = hero.w, H = hero.h;
    var s = Math.max(W / f[0], H / f[1]);
    return { s: s, x: (W - f[0] * s) / 2, y: (H - f[1] * s) / 2 };
  }
  function placePins() {
    var c = cover();
    $$('.pin').forEach(function (el) {
      var p = D.pins[+el.dataset.i][hero.set];
      var x = c.x + p[0] * c.s, y = c.y + p[1] * c.s;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.classList.toggle('pin--l', x > hero.w / 2);
    });
  }
  function loadFrames(set) {
    var n = D.seq[set], arr = hero.frames[set];
    if (arr.length) return;
    for (var i = 0; i < n; i++) {
      var im = new Image(); im.decoding = 'async';
      im.src = 'assets/seq/' + set + '/' + (i < 10 ? '0' : '') + i + '.webp';
      if (i === 0) im.onload = function () { hero.last = -1; drawHero(); };
      arr.push(im);
    }
  }
  function sizeCanvas() {
    var dpr = Math.min(devicePixelRatio || 1, 2);
    hero.w = innerWidth; hero.h = $('#heroPin').clientHeight || innerHeight;
    canvas.width = Math.round(hero.w * dpr); canvas.height = Math.round(hero.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var set = pickSet();
    if (set !== hero.set || !planEls.length) { hero.set = set; loadFrames(set); buildPlan(); }
    buildPins(); hero.last = -1; drawHero(); heroScene(hero.p);
  }
  function frameAt(i) {
    var arr = hero.frames[hero.set];
    for (var k = i; k >= 0; k--) if (arr[k] && arr[k].complete && arr[k].naturalWidth) return arr[k];
    return null;
  }
  function drawHero() {
    var n = D.seq[hero.set];
    var u = ease(seg(hero.p, 0.24, 0.88));
    var i = Math.round(u * (n - 1));
    if (i === hero.last) return;
    var im = frameAt(i); if (!im) return;
    hero.last = i;
    var c = cover(), f = FR[hero.set];
    ctx.drawImage(im, c.x, c.y, f[0] * c.s, f[1] * c.s);
  }
  var stepsLi = [];
  function heroScene(p) {
    hero.p = p;
    drawHero();
    // copy leaves
    var cu = seg(p, 0.03, 0.16);
    $('#heroCopy').style.opacity = 1 - cu;
    $('#heroCopy').style.transform = 'translateY(' + (-60 * cu) + 'px)';
    $('#heroHint').style.opacity = 1 - seg(p, 0, 0.05);
    // plan draws, then fades as the room gets built
    var du = seg(p, 0.06, 0.28), fo = 1 - seg(p, 0.34, 0.46);
    planEls.forEach(function (e, k) {
      var kk = seg(du, k * 0.08, k * 0.08 + 0.55);
      e.style.strokeDashoffset = e.style.strokeDasharray === '1' ? (1 - kk) : 0;
      e.style.opacity = (e.style.strokeDasharray === '1' ? Math.min(1, kk * 5) : kk) * fo;
    });
    planLabels.forEach(function (e, k) { e.style.opacity = seg(du, 0.35 + k * 0.08, 0.6 + k * 0.08) * fo; });
    // pins pop while the frames run
    var fu = seg(p, 0.24, 0.88);
    $$('.pin').forEach(function (el) {
      var at = D.pins[+el.dataset.i].at, on = fu >= at && p < 0.93;
      if (on !== el._on) {
        el._on = on;
        if (hasG) gsap.to(el, { opacity: on ? 1 : 0, scale: on ? 1 : 0.6, duration: 0.5, ease: on ? 'back.out(2)' : 'power2.in' });
        else el.style.opacity = on ? 1 : 0;
      }
    });
    // ending
    var eu = seg(p, 0.9, 0.97), end = $('#heroEnd');
    end.style.opacity = eu; end.style.transform = 'translateY(' + (30 * (1 - eu)) + 'px)';
    end.classList.toggle('on', eu > 0.5);
    // rail
    $('#railFill').style.transform = 'scaleX(' + p + ')';
    $('#railPct').textContent = Math.round(p * 100) + '%';
    var ph = p < 0.3 ? 0 : p < 0.56 ? 1 : p < 0.9 ? 2 : 3;
    if (!stepsLi.length) stepsLi = $$('#heroRail li');
    stepsLi.forEach(function (li, k) { li.classList.toggle('on', k <= ph); });
  }

  /* =========================================================
     NETWORK
     ========================================================= */
  var net = { paths: [], dots: [], you: null, run: false };
  function buildNetwork() {
    var nodes = D.nodes, n = nodes.length, R = 41;
    var pos = nodes.map(function (_, i) {
      var a = (-90 + i * (360 / n) + (lang === 'ar' ? 0 : 0)) * Math.PI / 180;
      return [50 + Math.cos(a) * R, 46 + Math.sin(a) * R * 0.92];
    });
    $('#netNodes').innerHTML = nodes.map(function (nd, i) {
      return '<span class="node" style="left:' + pos[i][0] + '%;top:' + pos[i][1] + '%;transition-delay:' + (i * 0.08) + 's"><i></i>' + esc(t(nd.t)) + '</span>';
    }).join('');
    var s = '<circle class="ring" cx="300" cy="300" r="246"/><circle class="ring" cx="300" cy="300" r="160"/>';
    pos.forEach(function (p, i) {
      var x = p[0] * 6, y = p[1] * 6, mx = (x + 300) / 2 + (y - 300) * 0.18, my = (y + 300) / 2 - (x - 300) * 0.18;
      s += '<path class="ln" id="nl' + i + '" d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' 300 300"/>';
    });
    s += '<path class="ln you" id="nlYou" d="M300 300V586"/>';
    for (var i = 0; i < n + 2; i++) s += '<circle class="pulse" r="4.5" cx="-20" cy="-20"/>';
    $('#netLines').innerHTML = s;
    net.paths = pos.map(function (_, i) { return $('#nl' + i); });
    net.you = $('#nlYou');
    net.dots = $$('#netLines .pulse');
    net.nodes = $$('#netNodes .node');
  }
  function netLoop(ts) {
    if (!net.run) return;
    var T = ts / 1000, n = net.paths.length;
    net.paths.forEach(function (p, i) {
      var L0 = p.getTotalLength(), u = ((T * 0.32 + i / n) % 1);
      var pt = p.getPointAtLength(L0 * u);
      net.dots[i].setAttribute('cx', pt.x); net.dots[i].setAttribute('cy', pt.y);
      net.nodes[i].classList.toggle('hot', u < 0.14);
    });
    var Ly = net.you.getTotalLength();
    [0, 1].forEach(function (k) {
      var u = (T * 0.5 + k * 0.5) % 1, pt = net.you.getPointAtLength(Ly * u);
      var d = net.dots[n + k]; d.setAttribute('cx', pt.x); d.setAttribute('cy', pt.y);
    });
    requestAnimationFrame(netLoop);
  }

  /* =========================================================
     STYLES · compare slider
     ========================================================= */
  var styleOn = 0;
  function renderStyles() {
    $('#styleBar').innerHTML = D.styles.map(function (s, i) {
      return '<button type="button" class="sty' + (i === styleOn ? ' on' : '') + '" data-i="' + i + '"><img src="assets/img/' + s.k + '-sm.webp" alt="" loading="lazy"><span><b>' + esc(t(s.t)) + '</b><small>' + esc(t(s.d)) + '</small></span></button>';
    }).join('');
  }
  var cmp = $('#compare');
  function setX(pct) {
    pct = clamp(pct, 2, 98);
    cmp.style.setProperty('--x', pct + '%');
    $('#cmpHandle').setAttribute('aria-valuenow', Math.round(pct));
  }
  (function () {
    var drag = false;
    function at(e) { var r = cmp.getBoundingClientRect(); setX((e.clientX - r.left) / r.width * 100); }
    cmp.addEventListener('pointerdown', function (e) { drag = true; cmp.setPointerCapture(e.pointerId); at(e); });
    cmp.addEventListener('pointermove', function (e) { if (drag) at(e); });
    cmp.addEventListener('pointerup', function () { drag = false; });
    cmp.addEventListener('pointercancel', function () { drag = false; });
    $('#cmpHandle').addEventListener('keydown', function (e) {
      var v = parseFloat(getComputedStyle(cmp).getPropertyValue('--x')) || 50;
      if (e.key === 'ArrowLeft') setX(v - 5); if (e.key === 'ArrowRight') setX(v + 5);
    });
  })();
  function setStyle(i) {
    if (i === styleOn) return;
    styleOn = i;
    $$('.sty').forEach(function (b, k) { b.classList.toggle('on', k === i); });
    var img = $('#cmpAfter'), src = 'assets/img/' + D.styles[i].k + '.webp';
    var pre = new Image(); pre.src = src;
    if (!hasG || reduce) { img.src = src; return; }
    var w = $('#cmpWipe');
    var go = function () {
      gsap.timeline()
        .fromTo(w, { clipPath: 'circle(0% at 50% 100%)', opacity: 1 }, { clipPath: 'circle(130% at 50% 100%)', duration: 0.6, ease: 'power3.in' })
        .add(function () { img.src = src; })
        .to(w, { clipPath: 'circle(0% at 50% 0%)', duration: 0.8, ease: 'power3.out' }, '+=0.05');
    };
    if (pre.complete) go(); else { pre.onload = go; pre.onerror = go; }
  }
  $('#styleBar').addEventListener('click', function (e) { var b = e.target.closest('.sty'); if (b) setStyle(+b.dataset.i); });

  /* =========================================================
     BAG
     ========================================================= */
  var bag = [];
  try { bag = JSON.parse(store.get('ld-bag') || '[]') || []; } catch (e) { bag = []; }
  function prodById(id) { for (var i = 0; i < D.products.length; i++) if (D.products[i].id === id) return D.products[i]; return null; }
  function itemOf(key) {
    if (key.indexOf('room:') === 0) {
      var a = key.split(':'), room = D.rooms.filter(function (r) { return r.k === a[1]; })[0];
      var sp = room && room.spots[+a[2]];
      return sp && sp.i ? { key: key, t: sp.i.t, s: sp.i.s, price: sp.i.price, unit: sp.i.unit, img: room.k } : null;
    }
    var p = prodById(key); return p ? { key: key, t: p.t, s: p.s, price: p.price, img: p.img } : null;
  }
  function inBag(key) { return bag.indexOf(key) > -1; }
  function saveBag() { store.set('ld-bag', JSON.stringify(bag)); renderBag(); }
  function toggleBag(key) {
    var on = inBag(key);
    if (on) bag.splice(bag.indexOf(key), 1); else bag.push(key);
    saveBag();
    var it = itemOf(key);
    toast(on ? L('اتشالت من قائمة بيتك', 'Removed from your list') : L('اتضافت لقائمة بيتك: ', 'Added to your list: ') + (on ? '' : t(it.t)));
    $('#bagBtn').classList.remove('bump'); void $('#bagBtn').offsetWidth; $('#bagBtn').classList.add('bump');
    syncAddButtons();
    return !on;
  }
  function renderBag() {
    var items = bag.map(itemOf).filter(Boolean), total = 0;
    $('#bagCount').textContent = items.length; $('#mbarCount').textContent = items.length;
    $('#bagBtn').classList.toggle('has', items.length > 0); $('#mbarCount').classList.toggle('has', items.length > 0);
    if (!items.length) {
      $('#bagList').innerHTML = '<div class="sheet__empty"><span data-mark-print></span>' + L('قائمتك فاضية. اختار قطع من «اشتري اللوك» أو «سوق لمسة».', 'Your list is empty. Add pieces from “Shop the look” or the market.') + '</div>';
      LM.mount($('[data-mark-print]'), { only: 'print' });
    } else {
      $('#bagList').innerHTML = items.map(function (it) {
        total += it.price;
        return '<div class="bi"><img src="assets/img/' + it.img + (it.img.indexOf('p-') === 0 ? '' : '-sm') + '.webp" alt=""><div><b>' + esc(t(it.t)) + '</b><small>' + esc(t(it.s)) + '</small><div class="price">' + money(it.price) + (it.unit ? ' <small>' + esc(t(it.unit)) + '</small>' : '') + '</div></div><button type="button" data-rm="' + esc(it.key) + '" aria-label="remove"><svg viewBox="0 0 24 24"><use href="#i-x"/></svg></button></div>';
      }).join('');
    }
    $('#bagTotal').textContent = money(total);
  }
  function openSheet(on) {
    $('#sheet').classList.toggle('open', on); $('#sheet').setAttribute('aria-hidden', !on);
    if (window.lenis) on ? lenis.stop() : lenis.start();
  }
  $('#bagBtn').addEventListener('click', function () { openSheet(true); });
  $('#mbarBag').addEventListener('click', function (e) { e.preventDefault(); openSheet(true); });
  $('#sheet').addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) openSheet(false);
    var r = e.target.closest('[data-rm]'); if (r) { toggleBag(r.dataset.rm); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openSheet(false); });
  $('#bagSend').addEventListener('click', function (e) {
    e.preventDefault();
    var items = bag.map(itemOf).filter(Boolean);
    var lines = items.map(function (it, i) { return (i + 1) + '. ' + t(it.t) + ' (' + money(it.price) + (it.unit ? ' ' + t(it.unit) : '') + ')'; });
    openWa(L('أهلًا لمسة ديكور، عايز أسأل عن القطع دي:\n', 'Hello Lamset Decor, I would like to ask about these pieces:\n') + (lines.join('\n') || L('(لسه ما اخترتش)', '(nothing yet)')));
  });
  var toastT;
  function toast(msg) {
    var el = $('#toast'); el.innerHTML = '<i></i>' + esc(msg); el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  /* =========================================================
     SHOP THE LOOK
     ========================================================= */
  var roomOn = 0, spotOn = 0;
  function renderRooms() {
    $('#roomTabs').innerHTML = D.rooms.map(function (r, i) { return '<button type="button" role="tab" class="' + (i === roomOn ? 'on' : '') + '" data-i="' + i + '">' + esc(t(r.t)) + '</button>'; }).join('');
    var r = D.rooms[roomOn];
    $('#lookImg').innerHTML = '<img src="assets/img/' + r.k + '.webp" alt="' + esc(t(r.t)) + '" decoding="async">' + r.spots.map(function (s, i) {
      return '<button type="button" class="spot' + (i === spotOn ? ' on' : '') + '" data-i="' + i + '" style="left:' + s.x + '%;top:' + s.y + '%" aria-label="' + esc(t(spotItem(r, i).t)) + '"><svg viewBox="0 0 24 24"><use href="#i-plus"/></svg></button>';
    }).join('');
    renderCard();
  }
  function spotItem(r, i) {
    var s = r.spots[i];
    if (s.p) { var p = prodById(s.p); return { key: p.id, t: p.t, s: p.s, price: p.price, m: p.m, img: p.img }; }
    return { key: 'room:' + r.k + ':' + i, t: s.i.t, s: s.i.s, price: s.i.price, unit: s.i.unit };
  }
  function renderCard() {
    var r = D.rooms[roomOn], it = spotItem(r, spotOn), on = inBag(it.key);
    $('#lookCard').innerHTML =
      (it.img ? '<div class="lc__img"><img src="assets/img/' + it.img + '.webp" alt=""></div>' : '<div class="lc__ph"><span data-mark-ph></span></div>') +
      '<div class="lc__body"><span class="lc__src">' + esc(t(it.s)) + '</span><h3>' + esc(t(it.t)) + '</h3>' + (it.m ? '<p class="lc__meta">' + esc(t(it.m)) + '</p>' : '') +
      '<div class="price"><span>' + L('يبدأ من', 'From') + '</span>' + money(it.price) + (it.unit ? '<small>' + esc(t(it.unit)) + '</small>' : '') + '</div></div>' +
      '<button type="button" class="btn ' + (on ? 'btn--line' : 'btn--teal') + ' btn--block" data-add="' + esc(it.key) + '"><svg viewBox="0 0 24 24"><use href="#' + (on ? 'i-check' : 'i-plus') + '"/></svg><span>' + (on ? L('في قائمة بيتك', 'In your list') : L('ضيفها لبيتي', 'Add to my home')) + '</span></button>';
    var ph = $('[data-mark-ph]'); if (ph) LM.mount(ph, { only: 'print' });
    if (hasG && !reduce) gsap.fromTo('#lookCard > *', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' });
  }
  $('#roomTabs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    roomOn = +b.dataset.i; spotOn = 0; renderRooms();
    if (hasG && !reduce) gsap.fromTo('#lookImg img', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power3.inOut' });
  });
  $('#lookImg').addEventListener('click', function (e) {
    var b = e.target.closest('.spot'); if (!b) return;
    spotOn = +b.dataset.i;
    $$('.spot').forEach(function (s, k) { s.classList.toggle('on', k === spotOn); });
    renderCard();
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (!a) return;
    e.preventDefault(); toggleBag(a.dataset.add);
    if (a.closest('#lookCard')) renderCard();
  });

  /* =========================================================
     MARKET
     ========================================================= */
  var catOn = 'all';
  function renderMarket() {
    $('#catChips').innerHTML = D.cats.map(function (c) { return '<button type="button" class="' + (c.k === catOn ? 'on' : '') + '" data-k="' + c.k + '">' + esc(t(c.t)) + '</button>'; }).join('');
    $('#grid').innerHTML = D.products.map(function (p) {
      return '<article class="prod' + (catOn === 'all' || p.cat === catOn ? '' : ' hide') + '" data-cat="' + p.cat + '">' +
        '<div class="prod__img"><img src="assets/img/' + p.img + '.webp" alt="' + esc(t(p.t)) + '" loading="lazy" decoding="async"><span class="prod__src">' + esc(t(p.s)) + '</span></div>' +
        '<div class="prod__body"><h3>' + esc(t(p.t)) + '</h3><p>' + esc(t(p.m)) + '</p>' +
        '<div class="prod__foot"><div class="price">' + money(p.price) + '</div><button type="button" class="add' + (inBag(p.id) ? ' in' : '') + '" data-add="' + p.id + '" aria-label="' + L('ضيف', 'Add') + '"><svg viewBox="0 0 24 24"><use href="#i-plus"/></svg></button></div></div></article>';
    }).join('');
  }
  function syncAddButtons() { $$('.add').forEach(function (b) { b.classList.toggle('in', inBag(b.dataset.add)); }); }
  $('#catChips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    catOn = b.dataset.k;
    $$('#catChips button').forEach(function (x) { x.classList.toggle('on', x === b); });
    var cards = $$('.prod');
    cards.forEach(function (c) { c.classList.toggle('hide', !(catOn === 'all' || c.dataset.cat === catOn)); });
    if (hasG && !reduce) gsap.fromTo($$('.prod:not(.hide)'), { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.05, ease: 'power3.out' });
    if (hasG) ScrollTrigger.refresh();
  });
  if (fine && !reduce) {
    $('#grid').addEventListener('pointermove', function (e) {
      var c = e.target.closest('.prod'); if (!c) return;
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = 'perspective(900px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg) translateY(-4px)';
    });
    $('#grid').addEventListener('pointerout', function (e) {
      var c = e.target.closest('.prod'); if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
    });
  }

  /* =========================================================
     JOURNEY · the crane stacks five floors, then the roof (from the logo)
     ========================================================= */
  function renderJourney() {
    $('#steps').innerHTML = D.steps.map(function (s, i) { return '<li class="step" data-i="' + i + '"><b>' + esc(t(s.t)) + '</b><p>' + esc(t(s.d)) + '</p></li>'; }).join('');
    var f = D.steps.map(function (s, i) { return '<div class="floor" data-i="' + i + '"><span>' + esc(t(s.t)) + '</span><span class="win"><i></i><i></i><i></i></span><small>0' + (i + 1) + '</small></div>'; }).join('');
    f += '<div class="floor roof" data-i="5"><svg viewBox="0 0 400 130"><path d="M18 128V96L200 12l182 84v32" fill="none" stroke="#a9b7aa" stroke-width="22" stroke-linejoin="round"/></svg></div>';
    $('#stack').innerHTML = f;
  }
  var jStep = -1;
  function journeyAt(p) {
    var n = D.steps.length, idx = Math.min(n, Math.floor(p * (n + 1.2)));
    if (idx === jStep) return;
    jStep = idx;
    $$('.step').forEach(function (s, k) { s.classList.toggle('on', k === Math.min(idx, n - 1)); s.classList.toggle('done', k < idx); });
    $$('.floor').forEach(function (fl, k) {
      var on = k <= idx;
      if (fl._on === on) return;
      fl._on = on;
      if (!hasG) { fl.style.opacity = on ? 1 : 0; fl.style.transform = 'none'; return; }
      if (on) {
        gsap.fromTo(fl, { y: -innerHeight * 0.55, opacity: 1, rotate: k % 2 ? 2 : -2 }, { y: 0, rotate: 0, duration: 0.9, ease: 'bounce.out', onComplete: function () { fl.classList.add('lit'); } });
        gsap.fromTo('#hook', { scaleY: 1.8 }, { scaleY: 1, duration: 0.9, ease: 'power2.out' });
      } else { gsap.to(fl, { y: -innerHeight * 0.55, opacity: 0, duration: 0.4, ease: 'power2.in' }); fl.classList.remove('lit'); }
    });
  }

  /* =========================================================
     SERVICES · PARTNERS · GALLERY
     ========================================================= */
  function renderServices() {
    $('#svc').innerHTML = D.services.map(function (s, i) {
      return '<article class="svc__c rv" tabindex="0"><img src="assets/img/' + s.img + '-sm.webp" alt="" loading="lazy" decoding="async"><small>0' + (i + 1) + '</small><h3>' + esc(t(s.t)) + '</h3><p>' + esc(t(s.d)) + '</p></article>';
    }).join('');
  }
  var pType = 0;
  function renderMarquee() {
    var a = D.products.slice(0, 5), b = D.products.slice(5);
    function row(list) {
      var h = list.map(function (p) { return '<span class="mq"><img src="assets/img/' + p.img + '.webp" alt="" loading="lazy">' + esc(t(p.s)) + '</span>'; }).join('');
      return h + h;
    }
    $('#mq1').innerHTML = row(a); $('#mq2').innerHTML = row(b);
  }
  $('#ptypes').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('#ptypes button').forEach(function (x, k) { x.classList.toggle('on', x === b); if (x === b) pType = k; });
  });
  $('#partnerBtn').addEventListener('click', function (e) {
    e.preventDefault();
    var typ = $$('#ptypes button')[pType].textContent;
    openWa(L('أهلًا لمسة ديكور، عندي ' + typ + ' وعايز أبقى شريك معاكم', 'Hello Lamset Decor, I run a ' + typ + ' and would like to become a partner'));
  });
  function renderGallery() {
    $('#track').innerHTML = D.gallery.map(function (g) {
      return '<figure class="gcard"><img src="assets/img/' + g.img + '-sm.webp" srcset="assets/img/' + g.img + '-sm.webp 760w, assets/img/' + g.img + '.webp 1344w" sizes="(max-width: 899px) 80vw, 40vw" alt="' + esc(t(g.t)) + '" loading="lazy" decoding="async"><figcaption>' + esc(t(g.t)) + '</figcaption></figure>';
    }).join('');
  }

  /* =========================================================
     PLAN · brief builder
     ========================================================= */
  var plan = { type: 0, stage: 0, area: 160, rooms: [0, 1, 2], svc: 2, style: 0 };
  try { var sp = JSON.parse(store.get('ld-plan') || 'null'); if (sp) plan = Object.assign(plan, sp); } catch (e) {}
  function chips(el, list, sel, multi) {
    $(el).innerHTML = list.map(function (o, i) {
      var on = multi ? sel.indexOf(i) > -1 : sel === i;
      return '<button type="button" class="' + (on ? 'on' : '') + '" data-i="' + i + '">' + esc(t(o)) + '</button>';
    }).join('');
  }
  var ROOMS_SVG = [[10, 10, 120, 90], [130, 10, 100, 90], [230, 10, 80, 70], [230, 80, 80, 60], [10, 100, 90, 90], [100, 100, 70, 90], [170, 140, 140, 50]];
  function renderPlan() {
    var P = D.plan;
    chips('#pType', P.types, plan.type); chips('#pStage', P.stages, plan.stage); chips('#pRooms', P.rooms, plan.rooms, true);
    chips('#pSvc', P.services, plan.svc); chips('#pStyle', D.styles.map(function (s) { return s.t; }), plan.style);
    $('#pArea').value = plan.area;
    updateTicket();
  }
  function updateTicket() {
    var P = D.plan;
    $('#areaVal').textContent = plan.area + L(' متر', ' m²');
    $('#pArea').style.setProperty('--p', ((plan.area - 50) / 450 * 100) + '%');
    var no = 'LD-' + String(1000 + ((plan.area * 7 + plan.type * 131 + plan.rooms.length * 17 + plan.svc * 53) % 9000));
    $('#ticketNo').textContent = no;
    var rows = [
      [L('المكان', 'Place'), t(P.types[plan.type]) + ' · ' + plan.area + L(' متر', ' m²')],
      [L('الحالة', 'State'), t(P.stages[plan.stage])],
      [L('الأوض', 'Rooms'), plan.rooms.length ? plan.rooms.map(function (i) { return t(P.rooms[i]); }).join('، ') : '—'],
      [L('الخدمة', 'Service'), t(P.services[plan.svc])],
      [L('الستايل', 'Style'), t(D.styles[plan.style].t)]
    ];
    $('#ticketRows').innerHTML = rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
    var s = '<path class="w" d="M6 6H314V194H6Z"/>';
    ROOMS_SVG.forEach(function (r, i) {
      var on = plan.rooms.indexOf(i) > -1;
      s += '<rect class="rm' + (on ? '' : ' off') + '" x="' + (r[0] + 3) + '" y="' + (r[1] + 3) + '" width="' + (r[2] - 6) + '" height="' + (r[3] - 6) + '" rx="6"/>';
      s += '<text x="' + (r[0] + r[2] / 2) + '" y="' + (r[1] + r[3] / 2 + 3) + '" text-anchor="middle">' + esc(t(P.rooms[i])) + '</text>';
    });
    $('#ticketPlan').innerHTML = s;
    store.set('ld-plan', JSON.stringify(plan));
  }
  $('#planForm').addEventListener('click', function (e) {
    var b = e.target.closest('.chips button'); if (!b) return;
    var box = b.parentNode.id, i = +b.dataset.i;
    if (box === 'pRooms') { var k = plan.rooms.indexOf(i); if (k > -1) plan.rooms.splice(k, 1); else plan.rooms.push(i); plan.rooms.sort(); }
    else plan[{ pType: 'type', pStage: 'stage', pSvc: 'svc', pStyle: 'style' }[box]] = i;
    if (box === 'pRooms') b.classList.toggle('on'); else $$('button', b.parentNode).forEach(function (x) { x.classList.toggle('on', x === b); });
    updateTicket();
    if (hasG && !reduce) gsap.fromTo('#ticket', { rotate: lang === 'ar' ? -0.6 : 0.6 }, { rotate: 0, duration: 0.6, ease: 'elastic.out(1,.4)' });
  });
  $('#pArea').addEventListener('input', function () { plan.area = +this.value; updateTicket(); });
  $('#ticketSend').addEventListener('click', function (e) {
    e.preventDefault();
    var P = D.plan, name = $('#pName').value.trim(), where = $('#pArea2').value.trim();
    var msg = L('أهلًا لمسة ديكور، ده طلبي (' + $('#ticketNo').textContent + '):\n', 'Hello Lamset Decor, here is my brief (' + $('#ticketNo').textContent + '):\n') +
      $$('#ticketRows div').map(function (d) { return '• ' + d.children[0].textContent + ': ' + d.children[1].textContent; }).join('\n') +
      (name ? '\n• ' + L('الاسم', 'Name') + ': ' + name : '') + (where ? '\n• ' + L('المنطقة', 'Area') + ': ' + where : '');
    var items = bag.map(itemOf).filter(Boolean);
    if (items.length) msg += '\n' + L('القطع اللي عجبتني: ', 'Pieces I liked: ') + items.map(function (it) { return t(it.t); }).join('، ');
    openWa(msg);
  });

  /* =========================================================
     NAV · drawer · lang · cursor
     ========================================================= */
  var nav = $('#nav');
  function onScrollNav() {
    var heroEnd = $('#hero').offsetTop + $('#hero').offsetHeight - 90;
    nav.classList.toggle('is-solid', scrollY > heroEnd);
  }
  $('#burger').addEventListener('click', function () {
    var open = !$('#drawer').classList.contains('open');
    $('#drawer').classList.toggle('open', open); this.setAttribute('aria-expanded', open); $('#drawer').setAttribute('aria-hidden', !open);
    nav.classList.toggle('is-solid', open || scrollY > $('#hero').offsetHeight - 90);
  });
  $('#drawer').addEventListener('click', function (e) {
    if (e.target.closest('a')) { $('#drawer').classList.remove('open'); $('#burger').setAttribute('aria-expanded', false); }
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var tg = $(id); if (!tg) return;
    e.preventDefault();
    if (window.lenis) lenis.scrollTo(tg, { offset: id === '#top' ? 0 : -60, duration: 1.4 }); else tg.scrollIntoView({ behavior: 'smooth' });
  });
  $('#langBtn').addEventListener('click', function () {
    lang = lang === 'ar' ? 'en' : 'ar'; store.set('ld-lang', lang); renderAll(); if (hasG) ScrollTrigger.refresh();
  });
  if (fine && !reduce) {
    var cur = $('#cursor'), cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); var big = e.target.closest && e.target.closest('a,button,.compare,.prod'); cur.classList.toggle('big', !!big); });
    (function loop() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
  }

  function renderAll() {
    applyStatic(); buildPins(); buildPlan(); heroScene(hero.p); buildNetwork(); renderStyles(); renderRooms(); renderMarket();
    renderJourney(); jStep = -1; journeyAt(window._jp || 0); renderServices(); renderMarquee(); renderGallery(); renderPlan(); renderBag();
    if (hasG) $$('.svc__c').forEach(function (el) { gsap.set(el, { opacity: 1, y: 0 }); });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  applyStatic();
  sizeCanvas();
  buildNetwork(); renderStyles(); renderRooms(); renderMarket(); renderJourney(); renderServices(); renderMarquee(); renderGallery(); renderPlan(); renderBag();
  addEventListener('resize', function () { clearTimeout(window._rz); window._rz = setTimeout(function () { sizeCanvas(); if (hasG) ScrollTrigger.refresh(); }, 150); });

  var lenis = null;
  if (hasG && window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (tm) { lenis.raf(tm * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  addEventListener('scroll', onScrollNav, { passive: true });

  if (hasG) {
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom bottom', onUpdate: function (s) { heroScene(s.progress); } });
    ScrollTrigger.create({ trigger: '#network', start: 'top 80%', end: 'bottom top', onToggle: function (s) { net.run = s.isActive; if (s.isActive) requestAnimationFrame(netLoop); } });
    ScrollTrigger.create({ trigger: '#netViz', start: 'top 75%', once: true, onEnter: function () { $('#netViz').classList.add('net-in'); } });
    gsap.from('.net__core', { scrollTrigger: { trigger: '#netViz', start: 'top 75%' }, scale: 0.4, opacity: 0, duration: 1, ease: 'expo.out' });
    gsap.from('.counter b', { scrollTrigger: { trigger: '.counters', start: 'top 85%' }, y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' });
    ScrollTrigger.create({ trigger: '#compare', start: 'top 70%', once: true, onEnter: function () { var o = { v: 88 }; gsap.to(o, { v: 50, duration: 1.6, ease: 'power3.inOut', onUpdate: function () { setX(o.v); } }); } });
    setX(88);
    if (!mqM.matches) {
      ScrollTrigger.create({ trigger: '#journey', start: 'top top', end: 'bottom bottom', onUpdate: function (s) { window._jp = s.progress; journeyAt(s.progress); } });
      var trackTw = gsap.to('#track', {
        x: function () { var d = $('#track').scrollWidth - innerWidth; return lang === 'ar' ? d : -d; },
        ease: 'none', scrollTrigger: { trigger: '#gallery', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
      });
      gsap.utils.toArray('.gcard img').forEach(function (im) { gsap.to(im, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#gallery', start: 'top top', end: 'bottom bottom', scrub: true } }); });
    } else { journeyAt(1); }
    gsap.utils.toArray('.sec-head, .network__copy, .plan__form, .partners__grid > div:first-child').forEach(function (el) {
      gsap.from(el.children, { scrollTrigger: { trigger: el, start: 'top 82%' }, y: 36, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });
    });
    ScrollTrigger.batch('.svc__c', { start: 'top 88%', onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }); } });
    gsap.set('.svc__c', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.prod', { start: 'top 92%', once: true, onEnter: function (b) { gsap.from(b, { opacity: 0, y: 30, duration: 0.7, stagger: 0.06, ease: 'power3.out' }); } });
  } else {
    heroScene(0); journeyAt(1);
  }

  /* ---------- intro ---------- */
  var seen = (function () { try { return sessionStorage.getItem('ld-intro'); } catch (e) { return null; } })();
  var introDone = false;
  function finishIntro(fast) {
    if (introDone) return; introDone = true;
    try { sessionStorage.setItem('ld-intro', '1'); } catch (e) {}
    var intro = $('#intro');
    var after = function () {
      intro.style.display = 'none';
      document.body.classList.remove('is-loading');
      if (lenis) lenis.start();
      $('.brand__mark').style.opacity = 1;
      $('#mbar').classList.add('on');
      if (hasG) {
        gsap.from('.hero__title .ln > span', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'expo.out' });
        gsap.from('.hero__copy .eyebrow, .hero__lead, .hero__cta, .hero__rail', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08, delay: 0.25, ease: 'power3.out' });
        ScrollTrigger.refresh();
      }
    };
    if (!hasG || fast) { after(); return; }
    gsap.timeline({ onComplete: after })
      .to('.intro__stage', { scale: 0.9, opacity: 0, duration: 0.55, ease: 'power2.in' })
      .to('.intro__grid,.intro__meta,.intro__skip', { opacity: 0, duration: 0.3 }, 0)
      .to('.intro__cols i', { yPercent: -100, duration: 0.9, stagger: { each: 0.06, from: lang === 'ar' ? 'end' : 'start' }, ease: 'expo.inOut' }, 0.35);
  }
  $('#introSkip').addEventListener('click', function () { finishIntro(false); });
  if (!hasG || reduce || seen) {
    if (hasG && seen && !reduce) { gsap.set('#introTag', { opacity: 1 }); finishIntro(false); }
    else finishIntro(true);
  } else {
    var tl = LM.build(introSvg);
    var pc = { v: 0 };
    tl.to(pc, { v: 100, duration: 2.6, ease: 'power1.inOut', onUpdate: function () { $('#introPct').textContent = String(Math.round(pc.v)).padStart(2, '0'); } }, 0)
      .to('#introTag', { opacity: 1, duration: 0.6 }, 2.2)
      .add(function () { finishIntro(false); }, 3.4);
  }
})();
