/* Disha's Catering — interactions */
(function () {
  'use strict';
  var CFG = window.DISHA_CONFIG, SETS = window.DISHA_SETS;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var isPhone = window.matchMedia('(max-width: 760px)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!window.gsap && !!window.ScrollTrigger;
  if (reduced || !hasGsap) document.documentElement.classList.add('reduced');
  var LANG = 'ar';
  try { LANG = localStorage.getItem('disha-lang') || 'ar'; } catch (e) {}

  /* ---------- icons ---------- */
  var S = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
  var ICO = {
    rice: S('<path d="M3 13h18a9 9 0 0 1-18 0Z"/><path d="M7 13c0-3 2.2-5 5-5s5 2 5 5"/><path d="M9 10.5h.01M12 9.5h.01M15 10.5h.01"/>'),
    kofta: S('<rect x="3" y="9" width="15" height="6" rx="3" transform="rotate(-20 10 12)"/><path d="M17 6l4-2"/>'),
    beef: S('<path d="M4 14c0-5 4-9 9-9 4 0 7 3 7 6 0 5-5 8-10 8-3.5 0-6-2-6-5Z"/><path d="M9 12c1-2 3-3 5-3"/>'),
    chicken: S('<path d="M15 4a5 5 0 0 1 3 9l-5 5-2-2 5-5"/><path d="M11 16l-4 4M7 20l-2-1 1-2"/>'),
    can: S('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M7 7h10M7 17h10"/>'),
    turkey: S('<ellipse cx="12" cy="12" rx="8" ry="6"/><path d="M8 12c2-2 6-2 8 0"/>'),
    samosa: S('<path d="M12 4 21 19H3Z"/><path d="M9 15h6"/>'),
    bech: S('<rect x="4" y="7" width="16" height="11" rx="2"/><path d="M4 11h16M8 7v-2M16 7v-2"/>'),
    leaf: S('<path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15Z"/><path d="M5 19 13 11"/>'),
    skewer: S('<path d="M4 20 20 4"/><rect x="8" y="10" width="5" height="5" rx="1" transform="rotate(45 10.5 12.5)"/><rect x="12" y="6" width="5" height="5" rx="1" transform="rotate(45 14.5 8.5)"/>'),
    breast: S('<path d="M5 15c0-6 5-10 11-10 2 0 3 1 3 3 0 7-6 11-11 11-2 0-3-2-3-4Z"/><path d="M9 14l6-6M8 11l4-4"/>'),
    cloche: S('<path d="M3 18h18M5 18a7 7 0 0 1 14 0"/><path d="M12 8V6M10 6h4"/>'),
    plate: S('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><path d="M2 4v6M22 4v16"/>'),
    heart: S('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/>')
  };
  $$('[data-ico]').forEach(function (el) { el.innerHTML = ICO[el.dataset.ico] || ''; });

  /* ---------- i18n ---------- */
  var T = {
    person: { ar: 'فرد', en: 'person' },
    people: { ar: 'أفراد', en: 'people' },
    setN: { ar: 'سيت منيو اقتصادي', en: 'Economy set menu' },
    addOrder: { ar: 'ضيف للطلب', en: 'Add to order' },
    howMany: { ar: 'عدد الأفراد', en: 'People' },
    perPerson: { ar: 'للفرد', en: 'per person' },
    added: { ar: 'اتضاف للطلب', en: 'Added to your order' },
    addonOn: { ar: 'عرض الـ 50 جنيه اتضاف لكل فرد', en: '50 EGP offer added for every person' },
    pickSet: { ar: 'اختار عدد الأفراد لسِت واحد على الأقل', en: 'Choose people for at least one set' },
    fillReq: { ar: 'من فضلك اكتب الاسم والموبايل والتاريخ', en: 'Please add your name, phone and date' },
    fillArea: { ar: 'من فضلك اكتب العنوان أو المنطقة', en: 'Please add your address or area' },
    hint_event: { ar: 'بوفيه كامل لمناسبتك: سخانات، تقديم، وتنظيم.', en: 'A full buffet for your event: chafing dishes, serving and setup.' },
    hint_table: { ar: 'حجز سفرة/ترابيزة مجهّزة بالسِت منيو لعدد ضيوفك في المكان اللي تختاره.', en: 'A dressed table served with set menus for your guests, at the venue you choose.' },
    hint_tasting: { ar: 'تعالى دوق الأصناف قبل المناسبة ونتفق على كل حاجة.', en: 'Taste the dishes before your event and agree on every detail.' },
    occ: { ar: ['خطوبة', 'كتب كتاب', 'عيد ميلاد', 'عزومة عيلة', 'سبوع / عقيقة', 'غدا شركة', 'رمضان / إفطار', 'مناسبة تانية'],
           en: ['Engagement', 'Katb ketab', 'Birthday', 'Family gathering', 'Sebou', 'Office lunch', 'Ramadan iftar', 'Other'] },
    style: { ar: ['بوفيه مفتوح بالسخانات', 'سِت منيو مغلّف', 'سفرة متقدّمة على الترابيزة'],
             en: ['Open buffet with chafing dishes', 'Packed set menus', 'Served at the table'] },
    marquee: { ar: ['Disha’s Catering', 'بوفيه يليق بفرحتك', 'Fresh · Homemade · Elegant', 'وتنظيم يخليك مرتاح'],
               en: ['Disha’s Catering', 'A buffet worthy of your celebration', 'Fresh · Homemade · Elegant', 'Organised so you can relax'] }
  };
  var t = function (k) { return T[k][LANG]; };
  var cur = function () { return CFG.currency[LANG]; };

  function applyLang() {
    var html = document.documentElement;
    html.lang = LANG; html.dir = LANG === 'ar' ? 'rtl' : 'ltr';
    $$('[data-en]').forEach(function (el) {
      if (!el.hasAttribute('data-ar')) el.setAttribute('data-ar', el.innerHTML);
      el.innerHTML = LANG === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-ar');
    });
    $('#langBtn').textContent = LANG === 'ar' ? 'EN' : 'ع';
    renderSets(); renderOrderList(); renderChips(); renderMarquee(); updateOrder(); setTab(curTab, true);
    $$('.cur').forEach(function (e) { e.textContent = cur(); });
    if (hasGsap) requestAnimationFrame(function () { ScrollTrigger.refresh(); });
  }

  /* ---------- marquee ---------- */
  function renderMarquee() {
    var words = t('marquee'), h = '';
    for (var r = 0; r < 4; r++) words.forEach(function (w) { h += '<span>' + w + '</span>'; });
    $('#marquee').innerHTML = h;
  }

  /* ---------- sets (plate cut into slices that assemble) ---------- */
  var SLICES = 8;
  function wedge(i) {
    var a0 = (i / SLICES) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / SLICES) * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2, R = 75;
    var p = function (a) { return (50 + R * Math.cos(a)).toFixed(2) + '% ' + (50 + R * Math.sin(a)).toFixed(2) + '%'; };
    return 'polygon(50% 50%,' + p(a0) + ',' + p(am) + ',' + p(a1) + ')';
  }
  function renderSets() {
    var box = $('#sets'), jump = $('#menuJump');
    var h = '', j = '';
    SETS.forEach(function (s) {
      var src = 'assets/img/' + s.img + (isPhone ? '-s' : '') + '.webp';
      var sl = '';
      for (var i = 0; i < SLICES; i++) sl += '<div class="slice" style="background-image:url(' + src + ');clip-path:' + wedge(i) + ';-webkit-clip-path:' + wedge(i) + '"></div>';
      h += '<article class="set" id="set-' + s.id + '" data-set="' + s.id + '">' +
        '<div class="set__num" aria-hidden="true">0' + s.id + '</div>' +
        '<div class="set__plate"><div class="shadow"></div>' + sl +
        '<span class="set__ribbon">' + t('setN') + ' ' + s.id + '</span>' +
        '<span class="set__price"><b>' + s.price + '</b><small>' + cur() + ' ' + t('perPerson') + '</small></span></div>' +
        '<div class="set__body">' +
        '<span class="set__label">Set 0' + s.id + '</span>' +
        '<h3 class="set__name">' + s.name[LANG] + '</h3>' +
        '<p class="set__tag">' + s.tag[LANG] + '</p>' +
        '<ul class="set__items">' + s.items.map(function (it) { return '<li><span class="i">' + ICO[it.i] + '</span>' + it[LANG] + '</li>'; }).join('') + '</ul>' +
        '<div class="set__actions">' + qtyHtml(s.id) + '<span class="qty__lbl">' + t('howMany') + '</span>' +
        '<button class="btn btn--brown" type="button" data-add="' + s.id + '">' + t('addOrder') + '</button></div>' +
        '</div></article>';
      j += '<a href="#set-' + s.id + '" data-jump="' + s.id + '"><b>0' + s.id + '</b>' + s.name[LANG] + '</a>';
    });
    box.innerHTML = h; jump.innerHTML = j;
    if (setsAnimated) animateSets();
  }
  function qtyHtml(id) {
    return '<div class="qty" data-qty="' + id + '"><button type="button" data-d="-5" aria-label="-">−</button>' +
      '<input type="number" inputmode="numeric" min="0" max="999" value="' + (STATE.q[id] || 0) + '" aria-label="qty">' +
      '<button type="button" data-d="5" aria-label="+">+</button></div>';
  }

  /* ---------- order ---------- */
  var STATE = { q: {}, addon: false };
  try { var sv = JSON.parse(localStorage.getItem('disha-order') || 'null'); if (sv && sv.q) STATE = sv; } catch (e) {}
  function save() { try { localStorage.setItem('disha-order', JSON.stringify(STATE)); } catch (e) {} }
  function renderOrderList() {
    $('#orderList').innerHTML = SETS.map(function (s) {
      return '<div class="oitem' + (STATE.q[s.id] ? ' is-on' : '') + '" data-o="' + s.id + '">' +
        '<img src="assets/img/' + s.img + '-s.webp" alt="" loading="lazy" width="76" height="76">' +
        '<div><h4>' + s.name[LANG] + '</h4><p>' + s.items.map(function (i) { return i[LANG]; }).join(' · ') + '</p>' +
        '<span class="pr">' + s.price + ' ' + cur() + '</span></div>' + qtyHtml(s.id) + '</div>';
    }).join('');
    $('#addonAll').checked = !!STATE.addon;
  }
  function totals() {
    var n = 0, sum = 0;
    SETS.forEach(function (s) { var q = STATE.q[s.id] || 0; n += q; sum += q * s.price; });
    if (STATE.addon) sum += n * CFG.addon.price;
    return { n: n, sum: sum };
  }
  function updateOrder() {
    var tt = totals(), lines = '';
    SETS.forEach(function (s) {
      var q = STATE.q[s.id] || 0; if (!q) return;
      lines += '<div class="ln"><span>' + s.name[LANG] + ' × ' + q + '</span><b>' + (q * s.price) + '</b></div>';
    });
    if (STATE.addon && tt.n) lines += '<div class="ln"><span>' + CFG.addon.name[LANG] + ' × ' + tt.n + '</span><b>' + (tt.n * CFG.addon.price) + '</b></div>';
    $('#orderSum').innerHTML = lines || '<p class="muted">' + (LANG === 'ar' ? 'اختار عدد الأفراد لأي سِت.' : 'Choose the number of people for any set.') + '</p>';
    $('#orderTotal').textContent = tt.sum + ' ' + cur();
    $('#barCount').textContent = tt.n; $('#barTotal').textContent = tt.sum;
    $$('[data-qty]').forEach(function (q) { var v = STATE.q[q.dataset.qty] || 0; var inp = $('input', q); if (document.activeElement !== inp) inp.value = v; });
    $$('.oitem').forEach(function (o) { o.classList.toggle('is-on', !!STATE.q[o.dataset.o]); });
    barVis();
    save();
  }
  function setQ(id, v) { v = Math.max(0, Math.min(999, parseInt(v, 10) || 0)); STATE.q[id] = v; updateOrder(); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]');
    if (b) { var q = b.closest('[data-qty]'); var id = q.dataset.qty; var c = STATE.q[id] || 0; var d = +b.dataset.d; var nv = c + d; if (c === 0 && d > 0) nv = 10; if (nv < 0) nv = 0; setQ(id, nv); return; }
    var a = e.target.closest('[data-add]');
    if (a) { var sid = a.dataset.add; if (!STATE.q[sid]) setQ(sid, 10); toast(t('added')); fly(a); return; }
  });
  document.addEventListener('input', function (e) {
    var q = e.target.closest('[data-qty]'); if (q) { STATE.q[q.dataset.qty] = Math.max(0, Math.min(999, parseInt(e.target.value, 10) || 0)); updateOrder(); }
  });
  $('#addonAll').addEventListener('change', function () { STATE.addon = this.checked; updateOrder(); });
  $('#offerAdd').addEventListener('click', function () {
    STATE.addon = true; $('#addonAll').checked = true; updateOrder(); toast(t('addonOn'));
    if (!totals().n) scrollTo('#order');
  });
  function fly(btn) {
    if (!hasGsap || reduced) return;
    var r = btn.getBoundingClientRect(), dot = document.createElement('i');
    dot.style.cssText = 'position:fixed;z-index:70;width:16px;height:16px;border-radius:50%;background:#C8742E;left:' + (r.left + r.width / 2) + 'px;top:' + r.top + 'px;pointer-events:none';
    document.body.appendChild(dot);
    var bar = $('#orderBar').getBoundingClientRect();
    gsap.to(dot, { duration: .7, ease: 'power2.in', left: bar.left + 30, top: bar.top + 18, scale: .4, onComplete: function () { dot.remove(); } });
  }
  var orderInView = false;
  function barVis() { $('#orderBar').classList.toggle('is-on', totals().n > 0 && !orderInView); $('#fabWa').classList.toggle('solo', !(totals().n > 0 && !orderInView)); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { orderInView = en[0].isIntersecting; barVis(); }, { threshold: .15 }).observe($('#order'));
  }

  function wa(msg) { window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg), '_blank'); }
  function showErr(el, m) { el.textContent = m; el.hidden = !m; }

  $('#orderForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, err = $('#orderErr'), tt = totals();
    if (!tt.n) { showErr(err, t('pickSet')); scrollTo('#orderList'); return; }
    if (!f.name.value.trim() || !f.phone.value.trim() || !f.date.value) { showErr(err, t('fillReq')); return; }
    if (!f.area.value.trim()) { showErr(err, t('fillArea')); return; }
    showErr(err, '');
    var ar = LANG === 'ar', L = [];
    L.push(ar ? 'طلب جديد من موقع Disha\'s Catering' : 'New order from Disha\'s Catering website');
    L.push('');
    SETS.forEach(function (s) { var q = STATE.q[s.id] || 0; if (q) L.push('• ' + s.name[LANG] + ' (' + (ar ? 'سيت ' : 'Set ') + s.id + ') × ' + q + ' = ' + (q * s.price) + ' ' + cur()); });
    if (STATE.addon) L.push('• ' + CFG.addon.name[LANG] + ' × ' + tt.n + ' = ' + (tt.n * CFG.addon.price) + ' ' + cur());
    L.push((ar ? 'الإجمالي التقريبي: ' : 'Estimated total: ') + tt.sum + ' ' + cur());
    L.push('');
    L.push((ar ? 'الاسم: ' : 'Name: ') + f.name.value.trim());
    L.push((ar ? 'الموبايل: ' : 'Phone: ') + f.phone.value.trim());
    L.push((ar ? 'ميعاد التسليم: ' : 'Delivery: ') + f.date.value + (f.time.value ? ' ' + f.time.value : ''));
    L.push((ar ? 'العنوان: ' : 'Address: ') + f.area.value.trim());
    if (f.notes.value.trim()) L.push((ar ? 'ملاحظات: ' : 'Notes: ') + f.notes.value.trim());
    wa(L.join('\n'));
  });

  /* ---------- booking ---------- */
  var curTab = 'event', occ = 0, sty = 0;
  function renderChips() {
    $('#occChips').innerHTML = t('occ').map(function (o, i) { return '<button type="button" class="chip' + (i === occ ? ' is-on' : '') + '" data-occ="' + i + '">' + o + '</button>'; }).join('');
    $('#styleChips').innerHTML = t('style').map(function (o, i) { return '<button type="button" class="chip' + (i === sty ? ' is-on' : '') + '" data-sty="' + i + '">' + o + '</button>'; }).join('');
  }
  $('#bookForm').addEventListener('click', function (e) {
    var c = e.target.closest('[data-occ]'); if (c) { occ = +c.dataset.occ; renderChips(); return; }
    var s = e.target.closest('[data-sty]'); if (s) { sty = +s.dataset.sty; renderChips(); return; }
    var tb = e.target.closest('[data-tab]'); if (tb) setTab(tb.dataset.tab);
  });
  function setTab(k, silent) {
    curTab = k;
    $$('.tab').forEach(function (b) { b.classList.toggle('is-on', b.dataset.tab === k); });
    $$('#bookForm [data-for]').forEach(function (f) { f.hidden = f.dataset.for.split(' ').indexOf(k) < 0; });
    $('#tabHint').textContent = t('hint_' + k);
    if (k === 'table' && !silent) { sty = 2; renderChips(); }
  }
  var g = $('#guests'); g.addEventListener('input', function () { $('#guestOut').textContent = g.value; });
  $('#bookForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = this, err = $('#bookErr'), ar = LANG === 'ar';
    if (!f.name.value.trim() || !f.phone.value.trim() || !f.date.value) { showErr(err, t('fillReq')); return; }
    showErr(err, '');
    var title = { event: ar ? 'حجز بوفيه مناسبة' : 'Event buffet booking', table: ar ? 'حجز سفرة / ترابيزة' : 'Table setup booking', tasting: ar ? 'طلب موعد تذوّق' : 'Tasting visit request' }[curTab];
    var L = [title + (ar ? ' من موقع Disha\'s Catering' : ' from Disha\'s Catering website'), ''];
    if (curTab !== 'tasting') {
      L.push((ar ? 'المناسبة: ' : 'Occasion: ') + t('occ')[occ]);
      L.push((ar ? 'عدد الضيوف: ' : 'Guests: ') + g.value);
      L.push((ar ? 'شكل الخدمة: ' : 'Service: ') + t('style')[sty]);
    }
    L.push((ar ? 'التاريخ: ' : 'Date: ') + f.date.value + (f.time.value ? ' ' + f.time.value : ''));
    if (curTab !== 'tasting' && f.area.value.trim()) L.push((ar ? 'المكان: ' : 'Venue: ') + f.area.value.trim());
    var tt = totals();
    if (tt.n && curTab !== 'tasting') L.push((ar ? 'السِت المختار من الموقع: ' : 'Chosen sets: ') + SETS.filter(function (s) { return STATE.q[s.id]; }).map(function (s) { return s.name[LANG] + ' × ' + STATE.q[s.id]; }).join('، '));
    L.push('');
    L.push((ar ? 'الاسم: ' : 'Name: ') + f.name.value.trim());
    L.push((ar ? 'الموبايل: ' : 'Phone: ') + f.phone.value.trim());
    if (f.notes.value.trim()) L.push((ar ? 'ملاحظات: ' : 'Notes: ') + f.notes.value.trim());
    wa(L.join('\n'));
  });

  /* ---------- contacts ---------- */
  var waLink = 'https://wa.me/' + CFG.whatsapp;
  $('#fabWa').href = waLink; $('#footWa').href = waLink;
  $('#footTel').href = 'tel:' + CFG.phone; $('#footPhone').textContent = CFG.phone;
  $('#footIg').href = CFG.instagram;
  $('#year').textContent = new Date().getFullYear();
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  $$('input[type=date]').forEach(function (d) { d.min = today.toISOString().slice(0, 10); });

  /* ---------- toast ---------- */
  var tT;
  function toast(m) { var el = $('#toast'); el.textContent = m; el.classList.add('is-on'); clearTimeout(tT); tT = setTimeout(function () { el.classList.remove('is-on'); }, 2200); }

  /* ---------- nav ---------- */
  var nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', function () { burger.classList.toggle('is-open'); links.classList.toggle('is-open'); nav.classList.add('is-solid'); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) { burger.classList.remove('is-open'); links.classList.remove('is-open'); } });
  $('#langBtn').addEventListener('click', function () { LANG = LANG === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('disha-lang', LANG); } catch (e) {} applyLang(); });

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduced && !isPhone && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
    if (hasGsap) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (tm) { lenis.raf(tm * 1000); }); gsap.ticker.lagSmoothing(0); }
  }
  function scrollTo(sel) { var el = $(sel); if (!el) return; if (lenis) lenis.scrollTo(el, { offset: -80 }); else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' }); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); scrollTo(h);
  });
  function onScroll() { nav.classList.toggle('is-solid', scrollY > 60); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- frame sequences ---------- */
  function Seq(canvas, dir, n) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.dir = dir; this.n = n; this.img = []; this.cur = -1; this.loaded = 0;
    var self = this;
    this.resize = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5), r = self.c.getBoundingClientRect();
      self.c.width = Math.round(r.width * dpr); self.c.height = Math.round(r.height * dpr); var k = self.cur; self.cur = -1; self.draw(Math.max(k, 0));
    };
    addEventListener('resize', this.resize);
  }
  Seq.prototype.load = function (onEach) {
    var self = this;
    for (var i = 0; i < this.n; i++) (function (i) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { self.loaded++; if (i === 0 || self.cur === i) { var k = self.cur; self.cur = -1; self.draw(Math.max(k, 0)); } if (onEach) onEach(self.loaded / self.n); };
      im.onerror = function () { self.loaded++; if (onEach) onEach(self.loaded / self.n); };
      im.src = self.dir + (i + 1 < 10 ? '0' : '') + (i + 1) + '.webp'; self.img[i] = im;
    })(i);
    return this;
  };
  Seq.prototype.draw = function (i) {
    i = Math.max(0, Math.min(this.n - 1, Math.round(i)));
    if (i === this.cur) return;
    var im = this.img[i];
    if (!im || !im.complete || !im.naturalWidth) { for (var j = i; j >= 0; j--) { if (this.img[j] && this.img[j].complete && this.img[j].naturalWidth) { im = this.img[j]; break; } } if (!im || !im.naturalWidth) return; }
    this.cur = i;
    var cw = this.c.width, ch = this.c.height, s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    var w = im.naturalWidth * s, h = im.naturalHeight * s;
    this.ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  /* ---------- loader ---------- */
  var heroSeq = null, buildSeq = null;
  function finishLoad() {
    var l = $('#loader'); l.classList.add('is-done'); document.body.classList.remove('is-loading');
    introHero();
  }
  var bar = $('#loadBar');
  if (!isPhone) {
    heroSeq = new Seq($('#heroCanvas'), 'assets/seq/lid/', 61);
    heroSeq.resize();
    var done = false;
    heroSeq.load(function (p) { bar.style.width = (p * 100) + '%'; if (p >= 1 && !done) { done = true; finishLoad(); } });
    setTimeout(function () { if (!done) { done = true; finishLoad(); } }, 5000);
  } else {
    var v = $('#heroVideo');
    v.src = 'assets/video/lid.mp4'; v.preload = 'auto';
    var fin = false, go = function () { if (fin) return; fin = true; bar.style.width = '100%'; setTimeout(finishLoad, 250); };
    v.addEventListener('loadeddata', go); setTimeout(go, 2200);
    bar.style.width = '60%';
  }

  function introHero() {
    if (isPhone) { var v = $('#heroVideo'); var p = v.play(); if (p && p.catch) p.catch(function () {}); v.addEventListener('ended', function () { $('.hero__steam').style.opacity = 1; }); setTimeout(function () { $('.hero__steam').style.opacity = 1; }, 3500); }
    if (!hasGsap || reduced) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__title .w', { yPercent: 110, duration: 1.1, stagger: .12 })
      .from('.hero .kicker, .hero__sub, .hero__cta, .hero__price', { y: 24, opacity: 0, duration: .8, stagger: .08 }, '-=.7')
      .from('.nav', { y: -30, opacity: 0, duration: .6 }, '-=.8');
  }

  /* ---------- scroll scenes ---------- */
  var setsAnimated = false, setCtx = null;
  function animateSets() {
    setsAnimated = true;
    if (!hasGsap || reduced) return;
    if (setCtx) setCtx.revert();
    setCtx = gsap.context(function () { $$('.set').forEach(function (set) {
      var slices = $$('.slice', set), items = $$('.set__items li', set), price = $('.set__price', set), rib = $('.set__ribbon', set), num = $('.set__num', set);
      var rtl = document.documentElement.dir === 'rtl';
      // each slice starts pushed out along its own angle, rotated, then they close into one plate
      var from = slices.map(function (s, i) {
        var a = ((i + .5) / SLICES) * Math.PI * 2 - Math.PI / 2, d = isPhone ? 60 : 160;
        return { x: Math.cos(a) * d, y: Math.sin(a) * d, rotation: (i % 2 ? 1 : -1) * (isPhone ? 12 : 28), opacity: 0 };
      });
      slices.forEach(function (s, i) { gsap.set(s, from[i]); });
      gsap.set(items, { opacity: 0, x: rtl ? 30 : -30 });
      gsap.set([price, rib], { scale: 0, opacity: 0 });
      var tl = gsap.timeline({ paused: isPhone });
      slices.forEach(function (s, i) { tl.to(s, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1, ease: 'power3.out' }, i * .05); });
      tl.to(items, { opacity: 1, x: 0, stagger: .08, duration: .5, ease: 'power2.out' }, .35)
        .to(rib, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2)' }, .7)
        .to(price, { scale: 1, opacity: 1, rotation: -10, duration: .55, ease: 'back.out(2.4)' }, .85);
      if (isPhone) {
        ScrollTrigger.create({ trigger: set, start: 'top 70%', once: true, onEnter: function () { tl.duration(1.4).play(); } });
      } else {
        ScrollTrigger.create({ trigger: set, start: 'top 80%', end: 'center 55%', scrub: .8, animation: tl });
        gsap.fromTo($('.set__plate', set), { rotation: -14 }, { rotation: 8, ease: 'none', scrollTrigger: { trigger: set, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.fromTo(num, { yPercent: -30 }, { yPercent: -70, ease: 'none', scrollTrigger: { trigger: set, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      ScrollTrigger.create({ trigger: set, start: 'top 50%', end: 'bottom 50%', onToggle: function (st) { if (st.isActive) $$('[data-jump]').forEach(function (a) { a.classList.toggle('is-on', a.dataset.jump == set.dataset.set); }); } });
    }); });
    ScrollTrigger.refresh();
  }

  function scenes() {
    if (!hasGsap || reduced) { $$('[data-rise]').forEach(function (e) { e.style.opacity = 1; e.style.transform = 'none'; }); animateSets(); phoneBuild(); return; }
    gsap.registerPlugin(ScrollTrigger);

    // hero: lid lifts with scroll
    if (heroSeq) {
      var o = { f: 0 };
      gsap.to(o, { f: 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: .6 }, onUpdate: function () { heroSeq.draw(o.f); $('.hero__steam').style.opacity = Math.max(0, (o.f - 20) / 30); } });
      gsap.to('.hero__inner', { yPercent: -18, opacity: .0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '70% bottom', end: 'bottom bottom', scrub: true } });
      gsap.to('.hero__scroll', { opacity: 0, scrollTrigger: { trigger: '.hero', start: 'top top', end: '15% top', scrub: true } });
    }

    // plate assembly
    if (!isPhone) {
      buildSeq = new Seq($('#buildCanvas'), 'assets/seq/plate/', 61);
      buildSeq.resize();
      ScrollTrigger.create({ trigger: '.build', start: 'top 160%', once: true, onEnter: function () { buildSeq.load(); } });
      var b = { f: 0 }, steps = $$('.build__steps li');
      gsap.to(b, { f: 60, ease: 'none', scrollTrigger: { trigger: '.build', start: 'top top', end: 'bottom bottom', scrub: .5 }, onUpdate: function () {
        buildSeq.draw(b.f); var k = Math.min(3, Math.floor(b.f / 15.5)); steps.forEach(function (s, i) { s.classList.toggle('is-on', i <= k); });
      } });
      gsap.from('.build__text > *', { y: 40, opacity: 0, stagger: .1, duration: .8, scrollTrigger: { trigger: '.build', start: 'top 70%' } });
      gsap.fromTo('.build__media', { scale: .8, rotation: -20 }, { scale: 1, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.build', start: 'top bottom', end: 'top top', scrub: true } });
    } else phoneBuild();

    // promises
    gsap.utils.toArray('[data-rise]').forEach(function (el) {
      gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.from('.promise .ico', { scale: 0, rotation: -90, stagger: .1, duration: .7, ease: 'back.out(2)', scrollTrigger: { trigger: '.promise__grid', start: 'top 80%' } });

    // menu header
    gsap.from('.menu__head > *', { y: 40, opacity: 0, stagger: .1, duration: .8, scrollTrigger: { trigger: '.menu__head', start: 'top 80%' } });
    animateSets();

    // offer: pieces snap into an equation
    var otl = gsap.timeline({ scrollTrigger: { trigger: '#offerEq', start: 'top 75%' } });
    otl.from('.offer__pic', { clipPath: 'circle(0% at 50% 50%)', duration: 1.1, ease: 'power3.inOut' })
      .from('.offer__parts .part, .offer__parts > b', { y: 30, opacity: 0, stagger: .09, duration: .5, ease: 'back.out(2)' }, '-=.6')
      .from('.offer__stamp', { scale: 0, rotation: -120, duration: .8, ease: 'back.out(1.8)' }, '-=.2');
    gsap.from('.offer .h2, .offer .lead', { y: 30, opacity: 0, stagger: .1, scrollTrigger: { trigger: '.offer', start: 'top 75%' } });

    // order cards
    gsap.from('#orderList .oitem', { y: 30, opacity: 0, stagger: .07, duration: .6, scrollTrigger: { trigger: '#orderList', start: 'top 85%' } });

    // events + kitchen parallax (desktop only)
    if (!isPhone) {
      gsap.fromTo('.events__media img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.events__media', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.kitchen__img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.kitchen', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  }

  function phoneBuild() {
    var v = $('#buildVideo'); if (!v || !isPhone) return;
    var started = false;
    new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { if (!started) { v.src = 'assets/video/plate.mp4'; started = true; } var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (started) v.pause();
      });
    }, { threshold: .35 }).observe(v);
  }

  /* phone and desktop use different scenes: rebuild when the window crosses the breakpoint */
  var mq = window.matchMedia('(max-width: 760px)');
  var onMq = function () { if (mq.matches !== isPhone) location.reload(); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);

  /* ---------- boot ---------- */
  applyLang();
  scenes();
  if (hasGsap) addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
