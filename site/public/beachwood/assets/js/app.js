/* Beachwood · interactions */
(function () {
  'use strict';
  var D = window.BW, E = window.BWEmblem;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var mqMobile = matchMedia('(max-width: 899px)');
  var hasGsap = !!window.gsap;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var lang = store.get('bw-lang') === 'en' ? 'en' : 'ar';
  function t(o) { return o ? (o[lang] != null ? o[lang] : o.ar) : ''; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, u) { return a + (b - a) * u; }
  function sstep(a, b, x) { var u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function waUrl(text) { return 'https://wa.me/' + D.config.whatsapp + '?text=' + encodeURIComponent(text); }
  function openWa(text) { window.open(waUrl(text), '_blank', 'noopener'); }

  /* ---------- emblems ---------- */
  var introSvg = E.mount($('[data-emblem=intro]'), { closed: true });
  $$('[data-emblem=nav],[data-emblem=ticket],[data-emblem=foot]').forEach(function (el) { E.mount(el); });
  var treeSvg = E.mount($('[data-emblem=tree]'), { only: 'tree' });

  /* ---------- contacts ---------- */
  $('#phoneTxt').textContent = D.config.phoneTxt;
  ['#callBtn', '#mbarCall'].forEach(function (s) { $(s).href = 'tel:' + D.config.phone; });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-wa]');
    if (a) { e.preventDefault(); openWa(t(D.wa[a.getAttribute('data-wa')])); return; }
    var b = e.target.closest('[data-wa-svc]');
    if (b) {
      e.preventDefault();
      var s = D.services[+b.getAttribute('data-wa-svc')];
      openWa(lang === 'ar' ? 'أهلًا بيتش وود، عايز عرض سعر لـ ' + s.t.ar : 'Hello Beachwood, I would like a quote for ' + s.t.en);
    }
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- language ---------- */
  function applyStatic() {
    $$('[data-en]').forEach(function (el) {
      if (el.dataset.ar == null) el.dataset.ar = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.ar;
    });
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $('#langBtn').textContent = lang === 'ar' ? 'EN' : 'ع';
    document.title = lang === 'ar' ? 'بيتش وود | Beachwood Interior Finishing' : 'Beachwood | Interior Wood Finishing';
  }

  /* ---------- planks (services) ---------- */
  var plankOn = 0, plankTouched = 0;
  function renderPlanks() {
    $('#planks').innerHTML = D.services.map(function (s, i) {
      return '<article class="plank' + (i === plankOn ? ' on' : '') + '" data-i="' + i + '" tabindex="0" data-cursor="' + (lang === 'ar' ? 'افتح' : 'Open') + '">' +
        '<div class="plank__img"><img src="assets/img/' + s.img + '-sm.webp" srcset="assets/img/' + s.img + '-sm.webp 560w, assets/img/' + s.img + '.webp 896w" sizes="(max-width: 899px) 100vw, 60vw" alt="' + esc(t(s.t)) + '" loading="lazy" decoding="async"></div>' +
        '<span class="plank__bar"></span><span class="plank__no">' + s.no + '</span>' +
        '<span class="plank__label">' + esc(t(s.t)) + '</span>' +
        '<span class="plank__plus" aria-hidden="true"><svg viewBox="0 0 24 24"><use href="#i-plus"/></svg></span>' +
        '<div class="plank__body"><h3>' + esc(t(s.t)) + '</h3><p>' + esc(t(s.d)) + '</p>' +
        '<ul class="plank__items">' + t(s.items).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<a class="btn btn--gold" href="#" data-wa-svc="' + i + '"><svg viewBox="0 0 24 24"><use href="#i-wa"/></svg><span>' + (lang === 'ar' ? 'اطلب عرض سعر' : 'Ask for a quote') + '</span></a></div>' +
        '</article>';
    }).join('');
  }
  function setPlank(i, user) {
    plankOn = (i + D.services.length) % D.services.length;
    if (user) plankTouched = Date.now();
    $$('.plank').forEach(function (p, k) { p.classList.toggle('on', k === plankOn); });
    if (mqMobile.matches && user) {
      // keep the opened plank in view on phones
      var el = $$('.plank')[plankOn];
      setTimeout(function () {
        var r = el.getBoundingClientRect();
        if (r.top < 70 || r.top > innerHeight * .45) scrollToY(scrollY + r.top - 80);
      }, 380);
    }
    setTimeout(function () { if (hasGsap) ScrollTrigger.refresh(); }, 900);
  }
  var hoverT;
  $('#planks').addEventListener('click', function (e) {
    var p = e.target.closest('.plank'); if (!p || e.target.closest('a')) return;
    var i = +p.dataset.i;
    if (mqMobile.matches && i === plankOn) return;
    setPlank(i, true);
  });
  $('#planks').addEventListener('keydown', function (e) {
    var p = e.target.closest('.plank'); if (!p) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPlank(+p.dataset.i, true); }
  });
  $('#planks').addEventListener('pointerover', function (e) {
    if (!fine || mqMobile.matches) return;
    var p = e.target.closest('.plank'); if (!p) return;
    clearTimeout(hoverT);
    hoverT = setTimeout(function () { if (+p.dataset.i !== plankOn) setPlank(+p.dataset.i, true); }, 160);
  });
  $('#planks').addEventListener('pointerleave', function () { clearTimeout(hoverT); });
  var plankInView = false;
  setInterval(function () {
    if (!plankInView || mqMobile.matches || document.hidden || Date.now() - plankTouched < 12000) return;
    setPlank(plankOn + 1, false);
  }, 6000);

  /* ---------- wood library ---------- */
  var woodOn = 0, finish = 'natural';
  function renderSpecies() {
    $('#species').innerHTML = D.woods.map(function (w, i) {
      return '<button type="button" class="sp' + (i === woodOn ? ' on' : '') + '" role="tab" data-i="' + i + '"><i style="filter:' + w.filter + '"></i>' + esc(t(w.n)) + '</button>';
    }).join('');
    showWood(woodOn, true);
  }
  function showWood(i, instant) {
    woodOn = i; var w = D.woods[i];
    $$('.sp').forEach(function (b, k) { b.classList.toggle('on', k === i); });
    $('#swatchWood').style.filter = w.filter;
    $('#swatchTag').textContent = w.tag + ' · ' + w.n.ar;
    var fill = function () {
      $('#woodLatin').textContent = w.latin;
      $('#woodName').textContent = t(w.n);
      $('#woodDesc').textContent = t(w.d);
      $('#woodBest').textContent = t(w.best);
      $('#woodMeters').innerHTML = t(D.meters).map(function (label, k) {
        var segs = ''; for (var s = 0; s < 5; s++) segs += '<i data-on="' + (s < w.m[k] ? 1 : 0) + '"></i>';
        return '<div class="meter"><span>' + esc(label) + '</span><div class="meter__bar">' + segs + '</div></div>';
      }).join('');
      requestAnimationFrame(function () {
        $$('#woodMeters i').forEach(function (seg, k) {
          if (seg.dataset.on === '1') setTimeout(function () { seg.classList.add('on'); }, instant ? 0 : 60 + (k % 5) * 70);
        });
      });
    };
    if (instant || !hasGsap || reduce) { fill(); return; }
    gsap.to('#woodCard', { opacity: 0, y: 10, duration: .25, onComplete: function () { fill(); gsap.to('#woodCard', { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }); } });
    gsap.fromTo('.swatch__wipe', { xPercent: lang === 'ar' ? 120 : -120 }, { xPercent: lang === 'ar' ? -120 : 120, duration: 1.1, ease: 'power2.inOut' });
  }
  var wipe = document.createElement('div'); wipe.className = 'swatch__wipe'; $('#swatch').appendChild(wipe);
  $('#species').addEventListener('click', function (e) { var b = e.target.closest('.sp'); if (b) showWood(+b.dataset.i); });
  $('#finishes').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    finish = b.dataset.finish; $('#swatch').dataset.finish = finish;
    $$('#finishes button').forEach(function (x) { x.classList.toggle('on', x === b); });
  });
  (function () {
    var sw = $('#swatch');
    sw.addEventListener('pointermove', function (e) {
      var r = sw.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      sw.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); sw.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      if (fine) { sw.style.setProperty('--rx', ((.5 - y) * 9).toFixed(2) + 'deg'); sw.style.setProperty('--ry', ((x - .5) * 11).toFixed(2) + 'deg'); }
    });
    sw.addEventListener('pointerleave', function () { sw.style.setProperty('--rx', '0deg'); sw.style.setProperty('--ry', '0deg'); });
  })();

  /* ---------- journey: tree rings ---------- */
  var MAJOR = [42, 78, 114, 150, 186];
  function ringPath(R, seed) {
    var pts = [], n = 90, cx = R * .045, cy = -R * .03;
    for (var k = 0; k <= n; k++) {
      var a = k / n * Math.PI * 2;
      var r = R * (1 + .022 * Math.sin(3 * a + seed) + .014 * Math.sin(7 * a + seed * 2.3) + .008 * Math.sin(13 * a + seed * .7));
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return 'M' + pts.join('L') + 'Z';
  }
  (function buildRings() {
    var g = $('#ringsG'), s = '';
    s += '<circle class="core" cx="0" cy="0" r="16"/>';
    for (var R = 22; R < 200; R += 7.4) s += '<path class="r r--thin" d="' + ringPath(R, R * .37) + '" data-r="' + R + '"/>';
    [[-.6, 30, 160], [2.1, 40, 120], [3.6, 26, 180], [4.9, 50, 110]].forEach(function (c) {
      s += '<line class="ray" x1="' + (Math.cos(c[0]) * c[1]).toFixed(1) + '" y1="' + (Math.sin(c[0]) * c[1]).toFixed(1) + '" x2="' + (Math.cos(c[0]) * c[2]).toFixed(1) + '" y2="' + (Math.sin(c[0]) * c[2]).toFixed(1) + '"/>';
    });
    MAJOR.forEach(function (R, i) {
      s += '<path class="r r--major" data-i="' + i + '" d="' + ringPath(R, i * 1.7 + .4) + '"/>';
      var a = -Math.PI / 2 - .55 + i * .28;
      s += '<circle class="dotm" data-i="' + i + '" cx="' + (Math.cos(a) * R * 1.01 + R * .045).toFixed(1) + '" cy="' + (Math.sin(a) * R * 1.01 - R * .03).toFixed(1) + '" r="5"/>';
    });
    g.innerHTML = s;
    $$('.r--major', g).forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.len = L; });
  })();
  function renderSteps() {
    $('#steps').innerHTML = D.steps.map(function (s, i) {
      return '<li class="step" data-i="' + i + '"><span class="step__n">0' + (i + 1) + '</span><h3>' + esc(t(s.t)) + '</h3><p>' + esc(t(s.d)) + '</p></li>';
    }).join('');
  }
  var ringP = -1;
  function setRings(p) {
    if (Math.abs(p - ringP) < .001) return; ringP = p;
    var f = p * MAJOR.length, active = clamp(Math.floor(f), 0, MAJOR.length - 1);
    $$('#ringsG .r--major').forEach(function (el, i) {
      var u = clamp(f - i, 0, 1); el.style.strokeDashoffset = (+el.dataset.len * (1 - u)).toFixed(1); el.style.opacity = u > .005 ? 1 : 0;
      el.classList.toggle('on', i === active);
    });
    $$('#ringsG .dotm').forEach(function (el, i) { el.classList.toggle('on', i <= active && f > i); el.style.opacity = f > i ? 1 : .25; });
    var maxR = 22 + p * 180;
    $$('#ringsG .r--thin').forEach(function (el) { el.style.opacity = +el.dataset.r <= maxR ? .9 : .12; });
    $('#ringNum').textContent = '0' + (active + 1);
    $$('.step').forEach(function (el, i) { el.classList.toggle('on', i === active); });
  }

  /* ---------- craft details ---------- */
  function renderDetails() {
    $('#details').innerHTML = D.details.map(function (d, i) {
      return '<li class="detail"><b><i>0' + (i + 1) + '</i>' + esc(t(d.t)) + '</b><p>' + esc(t(d.d)) + '</p></li>';
    }).join('');
  }

  /* ---------- projects ---------- */
  var filterOn = 'all';
  function renderGallery() {
    $('#filters').innerHTML = D.filters.map(function (f) {
      return '<button type="button" role="tab" class="' + (f.id === filterOn ? 'on' : '') + '" data-f="' + f.id + '">' + esc(t(f.t)) + '</button>';
    }).join('');
    $('#gallery').innerHTML = D.projects.map(function (p, i) {
      var cls = 'gi' + (p.wide ? ' gi--wide' : '') + (p.img === 'heroM' ? ' gi--tall' : '') + (filterOn !== 'all' && p.cat !== filterOn ? ' out' : '');
      var src = p.img === 'hero' ? 'hero.webp' : p.img + '-sm.webp';
      return '<figure class="' + cls + '" data-i="' + i + '" data-cursor="' + (lang === 'ar' ? 'شوف' : 'View') + '"><img src="assets/img/' + src + '" alt="' + esc(t(p.t)) + '" loading="lazy" decoding="async"><figcaption><b>' + esc(t(p.t)) + '</b><small>' + esc(t(p.p)) + '</small></figcaption></figure>';
    }).join('');
  }
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.dataset.f === filterOn) return;
    filterOn = b.dataset.f;
    $$('#filters button').forEach(function (x) { x.classList.toggle('on', x === b); });
    var items = $$('.gi');
    var show = function () {
      items.forEach(function (el) { var p = D.projects[+el.dataset.i]; el.classList.toggle('out', filterOn !== 'all' && p.cat !== filterOn); });
      var vis = items.filter(function (el) { return !el.classList.contains('out'); });
      if (hasGsap && !reduce) gsap.fromTo(vis, { opacity: 0, y: 26, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .7, stagger: .06, ease: 'power3.out', clearProps: 'transform' });
      if (hasGsap) ScrollTrigger.refresh();
    };
    if (hasGsap && !reduce) gsap.to(items, { opacity: 0, y: -10, duration: .25, stagger: .015, onComplete: show }); else show();
  });
  $('#gallery').addEventListener('click', function (e) {
    var f = e.target.closest('.gi'); if (!f) return;
    var p = D.projects[+f.dataset.i];
    $('#lbImg').src = 'assets/img/' + p.img + '.webp'; $('#lbImg').alt = t(p.t);
    $('#lbCap').textContent = t(p.t) + ' — ' + t(p.p);
    $('#lb').classList.add('open'); $('#lb').setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  });
  function closeLb() { $('#lb').classList.remove('open'); $('#lb').setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); }
  $('#lb').addEventListener('click', function (e) { if (e.target.id === 'lb' || e.target.id === 'lbX') closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLb(); toggleDrawer(false); } });

  /* ---------- quote builder ---------- */
  var Q = { spaces: [], wood: -1, size: -1 };
  function renderQuote() {
    var chips = function (arr, sel, group) {
      return arr.map(function (x, i) {
        var on = Array.isArray(sel) ? sel.indexOf(i) > -1 : sel === i;
        return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-g="' + group + '" data-i="' + i + '" aria-pressed="' + on + '">' + esc(t(x)) + '</button>';
      }).join('');
    };
    $('#qSpaces').innerHTML = chips(D.quote.spaces, Q.spaces, 'spaces');
    $('#qWoods').innerHTML = chips(D.quote.woods, Q.wood, 'wood');
    $('#qSize').innerHTML = chips(D.quote.sizes, Q.size, 'size');
    updateTicket(true);
  }
  function setDD(id, val, quiet) {
    var el = $(id), v = val || '—';
    if (el.textContent === v) return;
    el.textContent = v;
    if (!quiet) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
  }
  function qSummary() {
    var sep = lang === 'ar' ? '، ' : ', ';
    return {
      spaces: Q.spaces.map(function (i) { return t(D.quote.spaces[i]); }).join(sep),
      wood: Q.wood > -1 ? t(D.quote.woods[Q.wood]) : '',
      size: Q.size > -1 ? t(D.quote.sizes[Q.size]) : '',
      name: $('#qName').value.trim(), area: $('#qArea').value.trim()
    };
  }
  function updateTicket(quiet) {
    var s = qSummary();
    setDD('#tSpaces', s.spaces, quiet); setDD('#tWood', s.wood, quiet); setDD('#tSize', s.size, quiet);
    setDD('#tName', s.name, quiet); setDD('#tArea', s.area, quiet);
    var n = [s.spaces, s.wood, s.size, s.name, s.area].filter(Boolean).length;
    $('#tBar').style.width = (n / 5 * 100) + '%';
  }
  document.querySelector('.quote__form').addEventListener('click', function (e) {
    var c = e.target.closest('.chip'); if (!c) return;
    var g = c.dataset.g, i = +c.dataset.i;
    if (g === 'spaces') { var k = Q.spaces.indexOf(i); if (k > -1) Q.spaces.splice(k, 1); else Q.spaces.push(i); }
    if (g === 'wood') Q.wood = Q.wood === i ? -1 : i;
    if (g === 'size') Q.size = Q.size === i ? -1 : i;
    $$('.chip[data-g="' + g + '"]').forEach(function (b) {
      var j = +b.dataset.i, on = g === 'spaces' ? Q.spaces.indexOf(j) > -1 : (g === 'wood' ? Q.wood : Q.size) === j;
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    });
    updateTicket();
  });
  ['#qName', '#qArea'].forEach(function (s) { $(s).addEventListener('input', function () { updateTicket(); }); });
  $('#ticketNo').textContent = '#BW-' + String(Math.floor(1000 + Math.random() * 9000));
  $('#qSend').addEventListener('click', function (e) {
    e.preventDefault();
    var s = qSummary(), L = lang === 'ar';
    var lines = [L ? 'أهلًا بيتش وود، عايز أبدأ مشروع:' : 'Hello Beachwood, I would like to start a project:'];
    if (s.spaces) lines.push((L ? '• المساحات: ' : '• Spaces: ') + s.spaces);
    if (s.wood) lines.push((L ? '• الخشب: ' : '• Wood: ') + s.wood);
    if (s.size) lines.push((L ? '• الحجم: ' : '• Size: ') + s.size);
    if (s.name) lines.push((L ? '• الاسم: ' : '• Name: ') + s.name);
    if (s.area) lines.push((L ? '• المنطقة: ' : '• Area: ') + s.area);
    lines.push((L ? 'كارت رقم ' : 'Card ') + $('#ticketNo').textContent);
    openWa(lines.join('\n'));
  });

  /* ---------- drawer ---------- */
  function toggleDrawer(open) {
    var d = $('#drawer'), b = $('#burger');
    if (open == null) open = !d.classList.contains('open');
    d.classList.toggle('open', open); d.setAttribute('aria-hidden', !open); b.setAttribute('aria-expanded', open);
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    document.body.style.overflow = open ? 'hidden' : '';
  }
  $('#burger').addEventListener('click', function () { toggleDrawer(); });

  /* ---------- smooth scroll + anchors ---------- */
  var lenis = null;
  if (window.Lenis && fine && !reduce) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    if (hasGsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (tm) { lenis.raf(tm * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { (function raf(tm) { lenis.raf(tm); requestAnimationFrame(raf); })(0); }
    lenis.stop();
  }
  function scrollToY(y) { if (lenis) lenis.scrollTo(y, { duration: 1.3 }); else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var el = document.getElementById(id.slice(1)); if (!el) return;
    e.preventDefault(); toggleDrawer(false);
    var navH = parseFloat(getComputedStyle(html).getPropertyValue('--nav')) || 70;
    var y = id === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - (id === '#services' || id === '#quote' ? navH - 1 : 0);
    if (id === '#services' || id === '#woods' || id === '#journey' || id === '#projects' || id === '#visit') y = el.getBoundingClientRect().top + scrollY - navH + 1;
    scrollToY(y);
  });

  /* ---------- nav state ---------- */
  var nav = $('#nav'), lastY = 0, prog = document.createElement('i');
  prog.className = 'nav__progress'; nav.appendChild(prog);
  function onScroll() {
    var y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('is-solid', y > 30);
    var heroEnd = $('#hero').offsetHeight - innerHeight * .5;
    nav.classList.toggle('is-hidden', y > heroEnd && y > lastY + 4 && !$('#drawer').classList.contains('open'));
    if (y < lastY - 4 || y < heroEnd) nav.classList.remove('is-hidden');
    lastY = y;
    prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
    $('#mbar').classList.toggle('show', !document.body.classList.contains('is-loading') && y > 260);
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- hero frames ---------- */
  var N = 41, frames = { d: [], m: [] }, setKey = null, heroP = 0, mobileP = 0;
  var cvs = $('#heroCanvas'), ctx = cvs.getContext('2d');
  function loadSet(k, cb) {
    if (frames[k].length) { cb && cb(); return; }
    var arr = frames[k], first = new Image();
    for (var i = 0; i < N; i++) arr.push(null);
    first.onload = function () { arr[0] = first; cb && cb(); draw(); rest(); };
    first.onerror = rest;
    first.src = 'assets/seq/' + k + '/00.webp';
    function rest() {
      var i = 1;
      (function next() {
        // load in small parallel batches so frame 0..n arrive in order
        for (var b = 0; b < 4 && i < N; b++, i++) (function (j) {
          var im = new Image(); im.decoding = 'async';
          im.onload = function () { arr[j] = im; if (Math.abs(j - curFrame()) < 2) draw(); };
          im.src = 'assets/seq/' + k + '/' + (j < 10 ? '0' : '') + j + '.webp';
        })(i);
        if (i < N) setTimeout(next, 60);
      })();
    }
  }
  function curFrame() { return (mqMobile.matches ? mobileP : clamp(heroP / .94, 0, 1)) * (N - 1); }
  function nearest(arr, i) { for (var d = 0; d < N; d++) { if (arr[i - d]) return arr[i - d]; if (arr[i + d]) return arr[i + d]; } return null; }
  function sizeCanvas() {
    var dpr = Math.min(devicePixelRatio || 1, 2), w = cvs.clientWidth, h = cvs.clientHeight;
    if (!w || !h) return;
    cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr);
    draw();
  }
  function cover(img, alpha) {
    var W = cvs.width, H = cvs.height, iw = img.naturalWidth, ih = img.naturalHeight;
    var s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    var fy = setKey === 'm' ? .42 : .5;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) * fy, dw, dh);
  }
  function draw() {
    var arr = frames[setKey]; if (!arr || !arr.length) return;
    var f = curFrame(), i = Math.floor(f), a = f - i;
    var A = arr[i] || nearest(arr, i); if (!A) return;
    cover(A, 1);
    var B = arr[i + 1]; if (B && a > .01) cover(B, a);
    ctx.globalAlpha = 1;
  }
  function pickSet() {
    var k = mqMobile.matches ? 'm' : 'd';
    if (k === setKey) return;
    setKey = k; loadSet(k, function () { sizeCanvas(); });
  }

  // desktop: the door sits in a framed window, then the window grows to full screen
  var geo = {};
  function heroGeo() {
    var W = innerWidth, H = innerHeight, navH = parseFloat(getComputedStyle(html).getPropertyValue('--nav')) || 76;
    var ww = Math.min(W * .42, 680), it = Math.max(navH + 16, H * .13), ib = H * .07;
    var rtl = html.dir === 'rtl', il = rtl ? W * .055 : W - W * .055 - ww, ir = W - il - ww;
    var dw = Math.max(W, H * 16 / 9), dh = dw * 9 / 16, ox = (W - dw) / 2, oy = (H - dh) / 2;
    var sc = .9, doorX = ox + .4975 * dw, doorY = oy + .45 * dh;
    var cx = il + ww / 2, cy = it + (H - it - ib) / 2;
    var sx = cx - (W / 2 + (doorX - W / 2) * sc), sy = cy - (H / 2 + (doorY - H / 2) * sc);
    // keep the scaled canvas covering the whole window
    sx = clamp(sx, (W - ir) - W / 2 * (1 + sc), il - W / 2 * (1 - sc));
    sy = clamp(sy, (H - ib) - H / 2 * (1 + sc), it - H / 2 * (1 - sc));
    geo = { it: it, ir: ir, ib: ib, il: il, sc: sc, sx: sx, sy: sy };
  }
  var media = $('#heroMedia'), copy = $('#heroCopy'), steps = $$('.hstep'), welcome = $('#heroWelcome'), cue = $('#heroCue'), shade = $('.hero__shade');
  function renderHero(p) {
    heroP = p;
    var e = sstep(.05, .44, p), g = geo;
    var set = function (k, v) { media.style.setProperty(k, v); };
    set('--it', lerp(g.it, 0, e).toFixed(1) + 'px'); set('--ib', lerp(g.ib, 0, e).toFixed(1) + 'px');
    set('--il', lerp(g.il, 0, e).toFixed(1) + 'px'); set('--ir', lerp(g.ir, 0, e).toFixed(1) + 'px');
    set('--rad', lerp(26, 0, e).toFixed(1) + 'px');
    set('--sx', lerp(g.sx, 0, e).toFixed(1) + 'px'); set('--sy', lerp(g.sy, 0, e).toFixed(1) + 'px'); set('--sc', lerp(g.sc, 1, e).toFixed(4));
    $('#heroCanvas').style.transform = 'translate(' + lerp(g.sx, 0, e).toFixed(1) + 'px,' + lerp(g.sy, 0, e).toFixed(1) + 'px) scale(' + lerp(g.sc, 1, e).toFixed(4) + ')';
    var c = sstep(.03, .2, p);
    copy.style.opacity = (1 - c).toFixed(3); copy.style.transform = 'translateY(calc(-46% - ' + (c * 60).toFixed(1) + 'px))';
    copy.style.visibility = c > .99 ? 'hidden' : '';
    cue.style.opacity = (1 - sstep(0, .04, p)).toFixed(3);
    shade.style.opacity = sstep(.32, .5, p).toFixed(3);
    var win = [[.38, .52], [.55, .69], [.72, .85]];
    steps.forEach(function (s, i) {
      var a = win[i][0], b = win[i][1], o = sstep(a, a + .04, p) * (1 - sstep(b - .04, b, p));
      s.style.opacity = o.toFixed(3); s.style.transform = 'translateY(' + ((1 - sstep(a, a + .05, p)) * 30 - sstep(b - .04, b, p) * 20).toFixed(1) + 'px)';
    });
    var w = sstep(.87, .95, p);
    welcome.style.opacity = w.toFixed(3); welcome.style.transform = 'scale(' + (1.06 - w * .06).toFixed(4) + ')';
    draw();
  }
  function resetHeroDesktopStyles() {
    ['--it', '--ir', '--ib', '--il', '--rad'].forEach(function (k) { media.style.removeProperty(k); });
    $('#heroCanvas').style.transform = ''; copy.style.cssText = ''; cue.style.opacity = ''; shade.style.opacity = '';
    steps.forEach(function (s) { s.style.cssText = ''; }); welcome.style.cssText = '';
  }
  function playMobileDoor() {
    if (!mqMobile.matches) return;
    $('#heroReplay').classList.remove('show');
    if (reduce || !hasGsap) { mobileP = 1; draw(); return; }
    var o = { p: 0 };
    gsap.to(o, { p: 1, duration: 4.2, ease: 'power1.inOut', onUpdate: function () { mobileP = o.p; draw(); }, onComplete: function () { $('#heroReplay').classList.add('show'); } });
  }
  $('#heroReplay').addEventListener('click', playMobileDoor);

  /* ---------- manifesto words ---------- */
  var words = [];
  function splitManifesto() {
    var el = $('#manifestoText');
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + esc(w) + '</span>'; }).join(' ');
    words = $$('.w', el);
  }
  function setWords(p) {
    var n = words.length, f = p * (n + 4);
    words.forEach(function (w, i) { w.style.opacity = (.14 + .86 * clamp(f - i, 0, 1)).toFixed(3); });
  }

  /* ---------- full render (language-dependent parts) ---------- */
  function renderAll() {
    applyStatic(); renderPlanks(); renderSpecies(); renderSteps(); renderDetails(); renderGallery(); renderQuote(); splitManifesto();
    ringP = -1;
  }
  renderAll();
  $('#langBtn').addEventListener('click', function () {
    lang = lang === 'ar' ? 'en' : 'ar'; store.set('bw-lang', lang);
    renderAll(); heroGeo();
    if (hasGsap) { ScrollTrigger.refresh(); revealNow(); }
  });

  /* ---------- custom cursor ---------- */
  if (fine && !reduce) {
    var cur = document.createElement('div'); cur.className = 'cursor hide'; cur.innerHTML = '<span></span>'; document.body.appendChild(cur);
    var cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.remove('hide'); var h = e.target.closest && e.target.closest('[data-cursor]'); var on = h && !(h.classList.contains('plank') && h.classList.contains('on')); cur.classList.toggle('big', !!on); if (on) cur.firstChild.textContent = h.dataset.cursor; });
    document.addEventListener('pointerleave', function () { cur.classList.add('hide'); });
    (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)'; requestAnimationFrame(loop); })();
  }

  /* ---------- scroll scenes ---------- */
  function revealNow() {
    // after a language switch, re-rendered blocks should simply be visible
    $$('.planks .plank,.gi,.detail,.step').forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
  }
  function scenes() {
    if (!hasGsap) { $$('.rv').forEach(function (el) { el.classList.remove('rv'); }); return; }
    var mm = gsap.matchMedia();

    // hero (desktop pinned via CSS sticky, scrubbed by scroll position)
    mm.add('(min-width: 900px)', function () {
      heroGeo();
      var st = ScrollTrigger.create({
        trigger: '#hero', start: 'top top', end: 'bottom bottom',
        onUpdate: function (s) { renderHero(s.progress); },
        onRefresh: function (s) { heroGeo(); renderHero(s.progress); }
      });
      renderHero(st.progress || 0);
      return function () { resetHeroDesktopStyles(); };
    });
    mm.add('(max-width: 899px)', function () {
      mobileP = document.body.classList.contains('is-loading') ? 0 : 1; draw();
    });

    // manifesto
    ScrollTrigger.create({ trigger: '#manifestoText', start: 'top 82%', end: 'bottom 45%', onUpdate: function (s) { setWords(s.progress); }, onRefresh: function (s) { setWords(s.progress); } });
    var tr = treeSvg;
    var crown = tr.querySelector('.em-crown'), trunk = tr.querySelector('.em-trunk');
    var lines = $$('.em-grain path, .em-branches path', tr);
    lines.forEach(function (l) { var L = l.getTotalLength(); l.style.strokeDasharray = L; l.style.strokeDashoffset = L; l.style.opacity = 0; });
    gsap.set(trunk, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(crown, { scale: 0, opacity: 0, transformOrigin: '50% 90%' });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.manifesto', start: 'top 75%', end: 'center 45%', scrub: .8 } });
    tl.to(trunk, { scaleY: 1, ease: 'none', duration: .3 })
      .to(crown, { scale: 1, opacity: 1, ease: 'back.out(1.4)', duration: .4 }, .2)
      .to(lines, { strokeDashoffset: 0, opacity: 1, ease: 'none', duration: .5, stagger: .03 }, .35);

    // generic reveals
    var targets = $$('.sec-head, .woods__info>.kicker, .woods__info>.sec-title, .journey__head, .craft__copy, .quote__form>.kicker, .quote__form>.sec-title, .visit__grid>div, .facts .fact, .visit__cards li, .foot__grid>*');
    targets.forEach(function (el) { el.classList.add('rv'); });
    ScrollTrigger.batch(targets, { start: 'top 88%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .08 }); } });

    // planks rise like boards being laid
    ScrollTrigger.create({ trigger: '#planks', start: 'top 80%', once: true, onEnter: function () {
      gsap.fromTo('.plank', { y: 90, opacity: 0, clipPath: 'inset(100% 0 0 0 round 18px)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0 round 18px)', duration: 1.2, ease: 'power3.out', stagger: .08, clearProps: 'clipPath,transform,opacity' });
    } });
    ScrollTrigger.create({ trigger: '#planks', start: 'top 70%', end: 'bottom 30%', onToggle: function (s) { plankInView = s.isActive; } });

    // swatch entrance
    gsap.from('.swatch', { scrollTrigger: { trigger: '.woods', start: 'top 70%' }, y: 80, rotate: -4, opacity: 0, duration: 1.4, ease: 'power3.out' });

    // rings
    ScrollTrigger.create({ trigger: '#steps', start: 'top 55%', end: 'bottom 60%', onUpdate: function (s) { setRings(s.progress); }, onRefresh: function (s) { setRings(s.progress); } });

    // craft parallax + details
    gsap.fromTo('#craftImg', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.craft', start: 'top bottom', end: 'bottom top', scrub: true } });
    ScrollTrigger.batch('.detail', { start: 'top 90%', once: true, onEnter: function (b) { gsap.from(b, { opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: .1 }); } });

    // gallery
    ScrollTrigger.batch('.gi', { start: 'top 92%', once: true, onEnter: function (b) { gsap.from(b, { opacity: 0, y: 50, duration: 1.1, ease: 'power3.out', stagger: .08, clearProps: 'transform' }); } });

    // ticket tilt in
    gsap.from('.ticket', { scrollTrigger: { trigger: '.quote', start: 'top 65%' }, y: 60, rotate: 2, opacity: 0, duration: 1.2, ease: 'power3.out' });

    // active nav link
    ['services', 'woods', 'journey', 'projects', 'visit'].forEach(function (id) {
      ScrollTrigger.create({ trigger: '#' + id, start: 'top 50%', end: 'bottom 50%', onToggle: function (s) {
        $$('.nav__links a').forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.classList.toggle('on', s.isActive); });
      } });
    });
  }

  /* ---------- intro ---------- */
  function heroIn() {
    if (!hasGsap || reduce) return;
    gsap.from('.hero__title .ln>span', { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: .12 });
    gsap.from('.hero__copy .eyebrow, .hero__lead, .hero__cta', { y: 24, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: .1, delay: .25 });
    gsap.from('.hero__media', { opacity: 0, duration: 1.2, ease: 'power2.out' });
  }
  function finishIntro() {
    document.body.classList.remove('is-loading');
    $('#intro').style.display = 'none';
    $('#intro').setAttribute('aria-hidden', 'true');
    $('.brand__emblem').style.visibility = '';
    if (lenis) lenis.start();
    ScrollTrigger && ScrollTrigger.refresh();
    onScroll();
    playMobileDoor();
  }
  function intro() {
    var intro = $('#intro'), svg = introSvg;
    if (!hasGsap || reduce) { finishIntro(); heroIn(); return; }
    var fast = sessionStorage && (function () { try { return sessionStorage.getItem('bw-seen'); } catch (e) { return null; } })();
    try { sessionStorage.setItem('bw-seen', '1'); } catch (e) {}
    $('.brand__emblem').style.visibility = 'hidden';

    var gclip = svg.querySelector('.em-gclip'), frame = svg.querySelector('.em-frame');
    var room = $$('.em-room > g', svg), crown = svg.querySelector('.em-crown'), trunk = svg.querySelector('.em-trunk');
    var lines = $$('.em-grain path, .em-branches path', svg);
    var Lf = frame.getTotalLength();
    gsap.set(gclip, { attr: { width: 0 } });
    gsap.set(frame, { strokeDasharray: Lf, strokeDashoffset: Lf });
    gsap.set(room, { opacity: 0, y: 10 });
    gsap.set(trunk, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(crown, { scale: 0, opacity: 0, transformOrigin: '50% 92%' });
    lines.forEach(function (l) { var L = l.getTotalLength(); gsap.set(l, { strokeDasharray: L, strokeDashoffset: L, opacity: 0 }); });
    gsap.set('#introWord .wordmark__name span', { yPercent: 110, opacity: 0 });
    gsap.set('#introWord .wordmark__sub span', { opacity: 0, y: 8 });
    gsap.set('#introWord .wordmark__sub i', { scaleX: 0 });
    gsap.set('#introWord .wordmark__name', { overflow: 'hidden', paddingBottom: '.06em' });

    var door = { t: 0 };
    var tl = gsap.timeline({ delay: .25, onComplete: exit });
    tl.to(gclip, { attr: { width: 420 }, duration: 1, ease: 'power2.inOut' }, 0)
      .to(frame, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut' }, .25)
      .to(door, { t: 1, duration: 1.4, ease: 'power3.inOut', onUpdate: function () { E.setDoor(svg, door.t); } }, .7)
      .to(room, { opacity: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .1 }, 1.25)
      .to(trunk, { scaleY: 1, duration: .7, ease: 'power3.out' }, .9)
      .to(crown, { scale: 1, opacity: 1, duration: .9, ease: 'back.out(1.5)' }, 1.3)
      .to(lines, { strokeDashoffset: 0, opacity: 1, duration: .8, ease: 'power2.out', stagger: .04 }, 1.55)
      .to('#introWord .wordmark__name span', { yPercent: 0, opacity: 1, duration: .8, ease: 'power4.out', stagger: .045 }, 1.9)
      .to('#introWord .wordmark__sub i', { scaleX: 1, duration: .8, ease: 'power3.inOut' }, 2.3)
      .to('#introWord .wordmark__sub span', { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, 2.45)
      .to({}, { duration: .45 });
    if (fast) tl.timeScale(1.7);
    setTimeout(function () { intro.classList.add('can-skip'); }, 700);
    $('#introSkip').addEventListener('click', function () { tl.progress(1); });

    function exit() {
      // the emblem flies into the nav, the cream curtain lifts
      var from = $('.intro__emblem').getBoundingClientRect(), to = $('.brand__emblem').getBoundingClientRect();
      var s = to.width / from.width;
      var x = to.left - from.left, y = to.top - from.top;
      document.body.classList.add('intro-out');
      var xt = gsap.timeline({ onComplete: finishIntro });
      xt.to('#introWord, .intro__skip', { opacity: 0, y: -10, duration: .4, ease: 'power2.in' }, 0)
        .to('.intro__emblem', { x: x, y: y, scale: s, transformOrigin: '0 0', duration: 1.05, ease: 'power3.inOut' }, .15)
        .to(intro, { backgroundColor: 'rgba(246,239,228,0)', duration: .8, ease: 'power2.inOut' }, .45)
        .to('.intro__grain', { opacity: 0, duration: .5 }, .3)
        .add(heroIn, .5);
    }
  }

  /* ---------- boot ---------- */
  pickSet();
  mqMobile.addEventListener ? mqMobile.addEventListener('change', function () { pickSet(); sizeCanvas(); }) : mqMobile.addListener(function () { pickSet(); sizeCanvas(); });
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { sizeCanvas(); if (!mqMobile.matches) { heroGeo(); renderHero(heroP); } }, 120); });
  scenes();
  sizeCanvas();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (hasGsap) ScrollTrigger.refresh(); });
  intro();
  onScroll();
})();
