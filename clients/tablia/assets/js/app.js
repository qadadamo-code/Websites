/* Tablia «طبلية» — public site. Menu, cart → WhatsApp, occasion booking, motion. */
(() => {
  'use strict';
  const D = window.TB || { menu: [], packages: [], config: {}, offers: {} };
  const C = D.config || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => Math.round(+n || 0).toLocaleString('en-US');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = !!window.gsap && !reduce;
  if (!hasG) document.documentElement.classList.add('no-motion');

  /* ---------- index ---------- */
  const ITEMS = {}, CATS = {};
  D.menu.forEach(c => { CATS[c.id] = c; c.items.forEach((it, i) => { it.cat = c.id; it.no = i + 1; ITEMS[it.id] = it; }); });
  const sizesOf = it => it.sizes && it.sizes.length ? it.sizes : [{ l: '', p: it.price, w: it.was }];
  const img = it => it.image || 'assets/brand/badge.webp';
  const selSize = {};               // item id -> chosen size index

  /* ---------- toast ---------- */
  let tt;
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2600); };

  /* ---------- cart ---------- */
  const KEY = 'tb-cart-v2';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(l => ITEMS[l.id] && l.q > 0); } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const line = (id, s) => cart.find(l => l.id === id && l.s === s);
  const qtyOf = (id, s) => (line(id, s) || {}).q || 0;
  const setQty = (id, s, q) => {
    q = Math.max(0, Math.min(200, q));
    const l = line(id, s);
    if (l) { if (q) l.q = q; else cart = cart.filter(x => x !== l); } else if (q) cart.push({ id, s, q });
    save(); refresh(id);
  };
  const count = () => cart.reduce((a, l) => a + l.q, 0);
  const priceOf = l => (sizesOf(ITEMS[l.id])[l.s] || sizesOf(ITEMS[l.id])[0]).p;
  const subtotal = () => cart.reduce((a, l) => a + priceOf(l) * l.q, 0);

  /* ---------- controls ---------- */
  const control = (it) => {
    if (it.soldout) return '<span class="soldout">خلص النهارده</span>';
    const s = selSize[it.id] || 0, q = qtyOf(it.id, s);
    return q
      ? `<div class="qty" data-id="${it.id}"><button data-act="dec" aria-label="أقل">−</button><b>${q}</b><button data-act="inc" aria-label="زيادة">+</button></div>`
      : `<button class="add" data-act="add" data-id="${it.id}"><i>+</i> على الطبلية</button>`;
  };
  const priceHtml = (it) => {
    const z = sizesOf(it)[selSize[it.id] || 0];
    return `${z.w ? `<s>${fmt(z.w)}</s>` : ''}${fmt(z.p)} <small>جنيه</small>`;
  };
  function refresh(id) {
    $$(`[data-item="${id}"]`).forEach(el => {
      const it = ITEMS[id];
      const c = $('.ctl', el); if (c) c.innerHTML = control(it);
      const p = $('.price', el); if (p) p.innerHTML = priceHtml(it);
    });
    badge();
    if ($('#cartLayer').classList.contains('is-open')) renderDrawer();
  }

  /* ---------- today (meal cards) ---------- */
  const mealCard = (it) => {
    const feat = /الأكثر/.test(it.tag || '');
    const inc = (it.desc || '').split('•').map(s => s.trim()).filter(Boolean);
    const sizeTag = it.tag && !feat ? `<span class="meal__tag meal__tag--size">${esc(it.tag)}</span>` : '';
    return `<article class="meal${feat ? ' is-feat' : ''}${it.soldout ? ' is-out' : ''}" data-item="${it.id}">
      <div class="meal__img" data-open="${it.id}"><img src="${esc(img(it))}" alt="${esc(it.name)}" loading="lazy" width="600" height="450">
        <span class="meal__no">${it.no}</span>${feat ? `<span class="meal__tag">${esc(it.tag)}</span>` : sizeTag}${it.badge ? `<span class="meal__tag">${esc(it.badge)}</span>` : ''}</div>
      <div class="meal__body"><h3 class="meal__name">${esc(it.name)}</h3>
        ${inc.length ? `<ul class="inc">${inc.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        <div class="meal__foot"><span class="price">${priceHtml(it)}</span><span class="ctl">${control(it)}</span></div></div></article>`;
  };
  const mealGrid = $('#mealGrid');
  function renderMeals(cat) {
    if (!mealGrid || !CATS[cat]) return;
    mealGrid.innerHTML = CATS[cat].items.map(mealCard).join('');
    if (hasG && document.body.classList.contains('ready')) gsap.from($$('.meal', mealGrid), { y: 40, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out', clearProps: 'all' });
  }
  const mealTabs = $$('#mealTabs button');
  mealTabs.forEach(b => b.addEventListener('click', () => { mealTabs.forEach(x => x.classList.toggle('is-on', x === b)); renderMeals(b.dataset.cat); }));
  if (mealTabs[0]) renderMeals(mealTabs[0].dataset.cat);

  /* ---------- kitchen menu ---------- */
  const miRow = (it) => {
    const sz = sizesOf(it), multi = sz.length > 1;
    return `<article class="mi" data-item="${it.id}" data-name="${esc(it.name)}">
      <div class="mi__img" data-open="${it.id}"><img src="${esc(img(it))}" alt="${esc(it.name)}" loading="lazy" width="300" height="300"></div>
      <div class="mi__main"><div class="mi__top"><div><h4 class="mi__name">${esc(it.name)}</h4>
        <div class="mi__unit">${esc(it.unit || (sz.length === 1 && sz[0].l ? sz[0].l : ''))}${it.badge ? ` · <b style="color:var(--red)">${esc(it.badge)}</b>` : ''}</div></div></div>
        ${multi ? `<div class="sizes" role="group" aria-label="الكمية">${sz.map((z, i) => `<button data-size="${i}" class="${(selSize[it.id] || 0) === i ? 'is-on' : ''}">${esc(z.l)}</button>`).join('')}</div>` : ''}
        <div class="mi__row"><span class="price">${priceHtml(it)}</span><span class="ctl">${control(it)}</span></div></div></article>`;
  };
  $$('[data-list]').forEach(el => { const c = CATS[el.dataset.list]; if (c) el.innerHTML = c.items.map(miRow).join(''); });

  // search
  const sIn = $('#menuSearch');
  const norm = s => String(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْ]/g, '').trim();
  sIn && sIn.addEventListener('input', () => {
    const q = norm(sIn.value); let any = false;
    $$('.mcat').forEach(cat => {
      let n = 0;
      $$('.mi', cat).forEach(m => { const ok = !q || norm(m.dataset.name).includes(q); m.hidden = !ok; if (ok) n++; });
      cat.hidden = !n; if (n) any = true;
    });
    $('#menuEmpty').hidden = any;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  let lenis = null;
  const go = (t, off = -80) => { if (typeof t === 'string') t = $(t); if (!t) return; lenis ? lenis.scrollTo(t, { offset: off }) : window.scrollTo({ top: t.getBoundingClientRect().top + scrollY + off, behavior: 'smooth' }); };
  $$('#menuChips button').forEach(b => b.addEventListener('click', () => {
    if (sIn && sIn.value) { sIn.value = ''; sIn.dispatchEvent(new Event('input')); }
    go('#cat-' + b.dataset.cat, -(innerWidth < 640 ? 200 : 160));
  }));

  /* ---------- one click handler for all item controls ---------- */
  document.addEventListener('click', e => {
    const sz = e.target.closest('[data-size]');
    if (sz) { const el = sz.closest('[data-item]'), id = el.dataset.item; selSize[id] = +sz.dataset.size; $$(`[data-item="${id}"] [data-size]`).forEach(b => b.classList.toggle('is-on', +b.dataset.size === selSize[id])); refresh(id); return; }
    const a = e.target.closest('[data-act]');
    if (a) {
      const holder = a.closest('[data-id]') || a, id = holder.dataset.id || a.dataset.id; if (!ITEMS[id]) return;
      const s = selSize[id] || 0, q = qtyOf(id, s);
      if (a.dataset.act === 'add' || a.dataset.act === 'inc') { setQty(id, s, q + 1); if (a.dataset.act === 'add') { fly(a, ITEMS[id]); toast('«' + ITEMS[id].name + '» نزلت على طبليتك'); } }
      if (a.dataset.act === 'dec') setQty(id, s, q - 1);
      return;
    }
    const o = e.target.closest('[data-open]'); if (o) { openSheet(o.dataset.open); }
  });

  function fly(from, it) {
    const fab = $('#fab').classList.contains('is-on') ? $('#fab .fab__t') : $('#cartBtn');
    if (!hasG || !fab) return bump();
    const card = from.closest('[data-item]'); const src = card && $('img', card);
    const r1 = (src || from).getBoundingClientRect(), r2 = fab.getBoundingClientRect();
    const f = document.createElement('img'); f.className = 'fly'; f.src = img(it); document.body.appendChild(f);
    gsap.set(f, { left: r1.left + r1.width / 2 - 35, top: r1.top + r1.height / 2 - 35 });
    gsap.timeline({ onComplete: () => { f.remove(); bump(); } })
      .to(f, { left: r2.left + r2.width / 2 - 35, duration: .75, ease: 'power1.inOut' }, 0)
      .to(f, { top: r2.top + r2.height / 2 - 35, duration: .75, ease: 'back.in(1.4)' }, 0)
      .to(f, { scale: .3, rotate: 200, duration: .75, ease: 'power2.in' }, 0);
  }
  function bump() { ['#cartBtn', '#fab'].forEach(s => { const el = $(s); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }); }
  function badge() {
    const n = count();
    $('#cartCount').textContent = n; $('#fabCount').textContent = n;
    $('#fab').classList.toggle('is-on', n > 0);
    const ids = [...new Set(cart.map(l => l.id))].slice(0, 5);
    $('#fabPlates').innerHTML = ids.map((id, i) => { const a = (i / Math.max(ids.length, 1)) * Math.PI * 2 - Math.PI / 2, r = ids.length > 1 ? 11 : 0; return `<img src="${esc(img(ITEMS[id]))}" alt="" style="left:${13 + Math.cos(a) * r}px;top:${13 + Math.sin(a) * r}px">`; }).join('');
  }

  /* ---------- item sheet ---------- */
  function openSheet(id) {
    const it = ITEMS[id]; if (!it) return;
    const inc = (it.desc || '').split('•').map(s => s.trim()).filter(Boolean), sz = sizesOf(it);
    $('#sheetBody').innerHTML = `<div data-item="${it.id}"><div class="sheet__img"><img src="${esc(img(it))}" alt="${esc(it.name)}"></div>
      <div class="sheet__body"><p class="kicker" style="margin:0"><span class="dot"></span> ${esc(CATS[it.cat].title)}</p><h3>${esc(it.name)}</h3>
      ${inc.length ? `<ul class="inc">${inc.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${it.unit ? `<p class="mi__unit" style="margin:0">${esc(it.unit)}</p>` : ''}
      ${sz.length > 1 ? `<div class="sizes">${sz.map((z, i) => `<button data-size="${i}" class="${(selSize[it.id] || 0) === i ? 'is-on' : ''}">${esc(z.l)}</button>`).join('')}</div>` : ''}
      <div class="sheet__row"><span class="price">${priceHtml(it)}</span><span class="ctl">${control(it)}</span></div></div></div>`;
    openLayer('#sheetLayer');
  }

  /* ---------- layers ---------- */
  function openLayer(sel) { $(sel).classList.add('is-open'); $(sel).setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); document.body.style.overflow = 'hidden'; }
  function closeLayers() { $$('.layer.is-open').forEach(l => { l.classList.remove('is-open'); l.setAttribute('aria-hidden', 'true'); }); lenis && lenis.start(); document.body.style.overflow = ''; }
  document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeLayers(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLayers(); document.body.classList.remove('nav-open'); } });
  ['#cartBtn', '#fab'].forEach(s => $(s).addEventListener('click', () => { renderDrawer(); openLayer('#cartLayer'); }));

  /* ---------- drawer ---------- */
  const CH = C.charges || {};
  let oType = 'توصيل', coupon = null;
  const daySel = $('#daySel');
  (() => {
    const names = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const lab = i === 0 ? 'النهارده' : i === 1 ? 'بكرة' : names[d.getDay()];
      daySel.insertAdjacentHTML('beforeend', `<option value="${iso}"${i === 1 ? ' selected' : ''}>${lab} ${d.getDate()}/${d.getMonth() + 1}</option>`);
    }
  })();
  const zones = CH.zones || [];
  if (zones.length) { $('#zoneFld').hidden = false; $('#zoneSel').innerHTML = zones.map(z => `<option value="${esc(z.name)}">${esc(z.name)}${z.fee ? ' · ' + fmt(z.fee) + ' جنيه' : ' · مجانًا'}</option>`).join(''); }
  $$('#typeSeg button').forEach(b => b.addEventListener('click', () => {
    oType = b.dataset.v; $$('#typeSeg button').forEach(x => x.classList.toggle('is-on', x === b));
    $('#addrFld').hidden = oType !== 'توصيل'; $('#zoneFld').hidden = oType !== 'توصيل' || !zones.length; renderTotals();
  }));
  $('#zoneSel').addEventListener('change', renderTotals);
  function calc() {
    const sub = subtotal();
    let disc = 0;
    if (coupon) disc = coupon.type === 'fixed' ? Math.min(sub, coupon.value) : Math.round(sub * coupon.value / 100);
    const net = Math.max(0, sub - disc);
    const service = (CH.serviceTypes || []).includes(oType) ? Math.round(net * (CH.service || 0) / 100) : 0;
    const vat = Math.round((net + service) * (CH.vat || 0) / 100);
    let delivery = 0;
    if (oType === 'توصيل') {
      delivery = CH.deliveryFee || 0;
      const z = zones.find(z => z.name === $('#zoneSel').value); if (z) delivery = z.fee;
      if (CH.freeOver && net >= CH.freeOver) delivery = 0;
    }
    return { sub, disc, service, vat, delivery, total: net + service + vat + delivery };
  }
  function renderTotals() {
    const t = calc(), row = (a, b, cls = '') => `<div class="${cls}"><span>${a}</span><span>${b}</span></div>`;
    $('#totals').innerHTML = (cart.length ? row('المجموع', fmt(t.sub) + ' جنيه') : '') + (t.disc ? row('خصم ' + esc(coupon.code), '− ' + fmt(t.disc) + ' جنيه') : '')
      + (t.service ? row('خدمة', fmt(t.service) + ' جنيه') : '') + (t.vat ? row('ضريبة', fmt(t.vat) + ' جنيه') : '')
      + (oType === 'توصيل' && cart.length ? row('التوصيل', t.delivery ? fmt(t.delivery) + ' جنيه' : (CH.deliveryFee || zones.length ? 'مجانًا' : 'حسب المنطقة')) : '')
      + row('الإجمالي', fmt(t.total) + ' جنيه', 'grand');
    $('#sendOrder').disabled = !cart.length;
  }
  function renderDrawer() {
    $('#cartEmpty').hidden = !!cart.length; $('#orderForm').hidden = !cart.length;
    $('#cartList').innerHTML = cart.map(l => {
      const it = ITEMS[l.id], z = sizesOf(it)[l.s] || sizesOf(it)[0];
      return `<div class="cl"><img src="${esc(img(it))}" alt=""><div><div class="cl__n">${esc(it.name)}</div><div class="cl__s">${z.l ? esc(z.l) + ' · ' : ''}${fmt(z.p)} جنيه</div></div>
        <div class="qty" data-line="${l.id}|${l.s}"><button data-l="dec">−</button><b>${l.q}</b><button data-l="inc">+</button></div></div>`;
    }).join('');
    const ids = [...new Set(cart.map(l => l.id))].slice(0, 7);
    $('#drawerTablia').innerHTML = ids.map((id, i) => { const a = (i / Math.max(ids.length, 1)) * Math.PI * 2 - Math.PI / 2, r = ids.length > 1 ? 50 : 0; return `<img src="${esc(img(ITEMS[id]))}" alt="" style="left:${58 + Math.cos(a) * r}px;top:${58 + Math.sin(a) * r}px">`; }).join('');
    renderTotals();
  }
  $('#cartList').addEventListener('click', e => {
    const b = e.target.closest('[data-l]'); if (!b) return;
    const [id, s] = b.parentNode.dataset.line.split('|'); const q = qtyOf(id, +s);
    setQty(id, +s, q + (b.dataset.l === 'inc' ? 1 : -1)); renderDrawer();
  });
  $('#couponBtn').addEventListener('click', async () => {
    const code = $('#couponIn').value.trim(), msg = $('#couponMsg');
    if (!code) return;
    try {
      const r = await fetch('api/coupon.php?code=' + encodeURIComponent(code) + '&total=' + subtotal()).then(r => r.json());
      if (r.ok) { coupon = { code: r.code, type: /جنيه/.test(r.label) ? 'fixed' : 'percent', value: parseFloat(r.label) || 0 }; msg.className = 'coupon__msg ok'; }
      else { coupon = null; msg.className = 'coupon__msg bad'; }
      msg.textContent = r.msg; renderTotals();
    } catch (e) { msg.className = 'coupon__msg bad'; msg.textContent = 'تعذّر التحقق من الكود دلوقتي'; }
  });
  const wa = (num, text) => 'https://wa.me/' + num + '?text=' + encodeURIComponent(text);
  $('#sendOrder').addEventListener('click', async () => {
    const f = $('#orderForm'); if (!cart.length) return;
    const fd = Object.fromEntries(new FormData(f));
    if (!fd.name.trim() || !fd.phone.trim()) { toast('اكتب اسمك ورقم موبايلك'); (fd.name.trim() ? f.phone : f.name).focus(); return; }
    if (oType === 'توصيل' && !fd.address.trim()) { toast('اكتب عنوان التوصيل'); f.address.focus(); return; }
    const t = calc();
    if (oType === 'توصيل' && CH.minOrder && t.sub - t.disc < CH.minOrder) { toast('أقل طلب للتوصيل ' + fmt(CH.minOrder) + ' جنيه'); return; }
    const btn = $('#sendOrder'); btn.disabled = true;
    const win = window.open('', '_blank');
    let res = null;
    try {
      res = await fetch('api/order.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fd, type: oType, coupon: coupon ? coupon.code : '', items: cart.map(l => ({ id: l.id, size: l.s, qty: l.q })) }) }).then(r => r.json());
    } catch (e) { res = null; }
    if (res && res.ok === false) { btn.disabled = false; if (win) win.close(); toast(res.msg || 'حصلت مشكلة، جرّب تاني'); return; }
    const ok = res && res.ok;
    const sub = ok ? res.subtotal : t.sub, disc = ok ? res.discount : t.disc, del = ok ? res.delivery : t.delivery, total = ok ? res.total : t.total;
    const dayTxt = daySel.options[daySel.selectedIndex].text;
    const lines = cart.map(l => { const it = ITEMS[l.id], z = sizesOf(it)[l.s] || sizesOf(it)[0]; return `• ${l.q} × ${it.name}${z.l ? ' (' + z.l + ')' : ''} = ${fmt(z.p * l.q)} جنيه`; });
    const msg = [`طلب جديد من موقع طبلية${ok && res.no ? ' #' + res.no : ''}`, '', ...lines, '',
      `المجموع: ${fmt(sub)} جنيه`, disc ? `الخصم (${coupon ? coupon.code : ''}): ${fmt(disc)} جنيه` : null,
      del ? `التوصيل: ${fmt(del)} جنيه` : null, `الإجمالي: ${fmt(total)} جنيه`, '',
      `الاسم: ${fd.name}`, `الموبايل: ${fd.phone}`, `النوع: ${oType}`, `اليوم: ${dayTxt} · ${fd.slot}`,
      oType === 'توصيل' ? `العنوان: ${fd.zone ? fd.zone + ' - ' : ''}${fd.address}` : null, fd.notes ? `ملاحظات: ${fd.notes}` : null].filter(x => x !== null).join('\n');
    const url = wa(C.whatsapp, msg);
    if (win) win.location.href = url; else location.href = url;
    const had = cart.map(l => l.id);
    cart = []; save(); coupon = null; $('#couponMsg').textContent = ''; $('#couponIn').value = '';
    had.forEach(refresh); badge(); renderDrawer();
    btn.disabled = false; closeLayers(); toast('طلبك اتبعت.. بالهنا والشفا مقدمًا');
  });

  /* ---------- packages + booking ---------- */
  const P = D.packages || [];
  const packGrid = $('#packGrid'), bkPack = $('#bkPack');
  const typeName = t => t === 'buffet' ? 'أوبن بوفيه' : 'سِت منيو';
  function packCard(p) {
    const list = (t, arr, ol) => arr && arr.length ? `<h4>${t}</h4>${ol ? `<ol>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : `<div class="pills">${arr.map(x => `<span>${esc(x)}</span>`).join('')}</div>`}` : '';
    return `<article class="pack${p.tag ? ' is-feat' : ''}"><div class="pack__top"><div class="pack__name"><b>${esc(p.name)}</b>${p.tag && p.tag !== p.name ? `<i>${esc(p.tag)}</i>` : ''}</div>
      <div class="pack__price"><b>${fmt(p.price)}</b><small>جنيه للفرد</small></div></div>
      ${p.min ? `<p class="pack__min">يبدأ من ${p.min} فرد</p>` : ''}
      ${list('الأطباق الرئيسية', p.mains, true)}${list('المقبلات', p.apps, true)}${list(p.type === 'buffet' ? 'مختارات من السلطات' : 'السلطات', p.salads)}${list('الحلو', p.sweets)}
      ${p.sweetsAlt ? `<p class="pack__alt">${esc(p.sweetsAlt)}</p>` : ''}
      <button class="btn btn--red" data-book="${p.id}">احجز الباقة دي</button></article>`;
  }
  function renderPacks(type) {
    packGrid.innerHTML = P.filter(p => p.type === type).map(packCard).join('');
    if (hasG && document.body.classList.contains('ready')) gsap.from($$('.pack', packGrid), { y: 40, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', clearProps: 'all' });
  }
  if (packGrid) {
    $$('#packTabs button').forEach(b => b.addEventListener('click', () => { $$('#packTabs button').forEach(x => x.classList.toggle('is-on', x === b)); renderPacks(b.dataset.type); }));
    if (!P.some(p => p.type === 'buffet')) $('#packTabs').hidden = true;
    renderPacks(P.some(p => p.type === 'set') ? 'set' : 'buffet');
    bkPack.innerHTML = P.map(p => `<option value="${p.id}">${typeName(p.type)} · ${esc(p.name)} (${fmt(p.price)} جنيه/فرد)</option>`).join('') + '<option value="">عزومة حسب الطلب (من المنيو)</option>';
    const g = $('#bkGuests');
    const upd = () => {
      const p = P.find(x => x.id === bkPack.value), n = +g.value; $('#bkGuestsOut').textContent = n;
      $('#bkTotal').textContent = p ? fmt(p.price * n) : '—';
      $('#bkHint').textContent = p && p.min && n < p.min ? `الباقة دي بتبدأ من ${p.min} فرد، ولأعداد أقل كلّمنا نظبطلك عرض.` : 'السعر النهائي بيتأكد مع فريق طبلية حسب العدد والمكان والتاريخ.';
    };
    g.addEventListener('input', upd); bkPack.addEventListener('change', upd); upd();
    const dt = $('#bkDate'); const d0 = new Date(); d0.setDate(d0.getDate() + 2); dt.min = d0.toISOString().slice(0, 10);
    packGrid.addEventListener('click', e => {
      const b = e.target.closest('[data-book]'); if (!b) return;
      bkPack.value = b.dataset.book; const p = P.find(x => x.id === b.dataset.book); if (p && p.min && +g.value < p.min) g.value = p.min; upd();
      go('#book', -100);
    });
    $('#bookForm').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target)); const p = P.find(x => x.id === bkPack.value), n = +g.value;
      const win = window.open('', '_blank'); let res = null;
      try { res = await fetch('api/reserve.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fd, package: bkPack.value, guests: n }) }).then(r => r.json()); } catch (err) {}
      if (res && res.ok === false) { if (win) win.close(); toast(res.msg || 'حصلت مشكلة'); return; }
      const msg = ['حجز مناسبة من موقع طبلية' + (res && res.code ? ' (' + res.code + ')' : ''), '',
        `الباقة: ${p ? typeName(p.type) + ' · ' + p.name + ' · ' + fmt(p.price) + ' جنيه للفرد' : 'عزومة حسب الطلب'}`, `عدد الضيوف: ${n} فرد`, p ? `الإجمالي التقريبي: ${fmt(p.price * n)} جنيه` : null,
        `المناسبة: ${fd.occasion}`, `التاريخ: ${fd.date}${fd.time ? ' · ' + fd.time : ''}`, fd.address ? `المنطقة: ${fd.address}` : null, '',
        `الاسم: ${fd.name}`, `الموبايل: ${fd.phone}`, fd.notes ? `ملاحظات: ${fd.notes}` : null].filter(x => x !== null).join('\n');
      const url = wa(C.whatsapp, msg); if (win) win.location.href = url; else location.href = url;
      e.target.reset(); toast('حجزك وصلنا، هنكلّمك نأكّد التفاصيل');
    });
  }

  /* ---------- theme ---------- */
  $('#themeBtn').addEventListener('click', () => {
    const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark'; try { localStorage.setItem('tb-theme', r.dataset.theme); } catch (e) {}
  });

  /* ---------- nav ---------- */
  $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
    const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); closeLayers(); document.body.classList.remove('nav-open');
    go(t, -80);
  });
  let lastY = 0;
  const hdr = $('#hdr');
  function onScroll(y) {
    const down = y > lastY && y > 300; hdr.classList.toggle('is-hidden', down); document.body.classList.toggle('hdr-hidden', down); lastY = y;
  }

  badge();

  /* ---------- motion ---------- */
  let started = false;
  function startMotion() {
    if (started) return; started = true; document.body.classList.add('ready');
    if (!hasG) { addEventListener('scroll', () => onScroll(scrollY), { passive: true }); return; }
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !matchMedia('(pointer: coarse)').matches) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on('scroll', e => { ScrollTrigger.update(); onScroll(e.scroll); });
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    } else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero__title .ln', { yPercent: 60, opacity: 0, duration: 1, stagger: .12 })
      .from('.hero .kicker, .hero__sub, .hero__cta, .hero__facts', { y: 24, opacity: 0, duration: .8, stagger: .08 }, '-=.6')
      .from('.tablia__top', { scale: .4, rotate: -90, opacity: 0, duration: 1.1, ease: 'back.out(1.3)' }, 0)
      .from('.plate', { scale: 0, opacity: 0, duration: .6, stagger: .06, ease: 'back.out(2)' }, .35)
      .from('.tablia__mama', { y: 60, opacity: 0, scale: .8, duration: 1, ease: 'back.out(1.4)' }, .5)
      .from('.stamp', { scale: 0, rotate: -120, duration: .9, ease: 'back.out(1.6)' }, .9);
    const ring = $('#heroRing');
    if (ring) {
      const spin = gsap.to(ring, { rotate: 360, duration: 90, ease: 'none', repeat: -1 });
      const counter = gsap.to('.plate img', { rotate: -360, duration: 90, ease: 'none', repeat: -1 });
      ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', onUpdate: s => { const k = 1 + Math.min(8, Math.abs(s.getVelocity()) / 250); spin.timeScale(k); counter.timeScale(k); gsap.to([spin, counter], { timeScale: 1, duration: 1.2, overwrite: false }); } });
    }
    gsap.to('.tablia__mama', { y: -8, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
    gsap.to('#heroArt', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

    $$('.sec__head, .mama__copy > *, .vow, .mcat__head, .steps li, .book__calc, .book__form, .contact__card, .note, .seg').forEach(el => {
      gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    ScrollTrigger.batch('.meal, .pack', { start: 'top 92%', once: true, onEnter: b => gsap.from(b, { y: 40, opacity: 0, duration: .7, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' }) });
    gsap.from('.mama__portrait', { scale: .8, rotate: -6, opacity: 0, duration: 1.2, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.mama', start: 'top 70%', once: true } });
    ScrollTrigger.batch('.mi', { start: 'top 94%', once: true, onEnter: b => gsap.from(b, { y: 30, opacity: 0, duration: .6, stagger: .05, ease: 'power2.out', clearProps: 'transform,opacity' }) });
    const oh = $('.occ__hero img'); if (oh) gsap.fromTo(oh, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.occ__hero', start: 'top bottom', end: 'bottom top', scrub: true } });

    const navLinks = $$('.hdr__nav a');
    navLinks.forEach(a => { const t = $(a.getAttribute('href')); if (t) ScrollTrigger.create({ trigger: t, start: 'top 45%', end: 'bottom 45%', onToggle: s => s.isActive && navLinks.forEach(x => x.classList.toggle('is-on', x === a)) }); });
    const chips = $$('#menuChips button');
    chips.forEach(b => { const t = $('#cat-' + b.dataset.cat); if (t) ScrollTrigger.create({ trigger: t, start: 'top 45%', end: 'bottom 45%', onToggle: s => { if (s.isActive) { chips.forEach(x => x.classList.toggle('is-on', x === b)); const p = b.parentNode; p.scrollTo({ left: b.offsetLeft - p.clientWidth / 2 + b.clientWidth / 2, behavior: 'smooth' }); } } }); });
  }

  /* ---------- logo intro: the tablia is set, Mama Rehab arrives calmly, the name is written ---------- */
  function finishIntro() { const el = $('#intro'); if (el) el.remove(); document.body.classList.remove('is-loading'); startMotion(); }
  function intro() {
    const el = $('#intro'); if (!el) return startMotion();
    let seen = false; try { seen = sessionStorage.getItem('tb-intro') === '1'; sessionStorage.setItem('tb-intro', '1'); } catch (e) {}
    if (!hasG) return finishIntro();
    gsap.set('.lg-en', { clipPath: 'inset(0 100% 0 0)' }); gsap.set('.lg-ar', { clipPath: 'inset(0 0 0 100%)' }); gsap.set('.intro__line', { y: 10 }); gsap.set(el, { clipPath: 'circle(150% at 50% 45%)' });
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.intro__ring', { scale: 1, duration: 1, ease: 'expo.out' })
      .from('.lg-badge img', { y: 40, scale: .7, opacity: 0, duration: 1, ease: 'back.out(1.3)' }, .15)
      .to('.lg-ar', { clipPath: 'inset(0 0 0 0%)', duration: .8, ease: 'power2.inOut' }, .6)
      .to('.lg-en', { clipPath: 'inset(0 0% 0 0)', duration: .7, ease: 'power2.inOut' }, .8)
      .to('.lg-steam', { opacity: .85, duration: .4 }, .9)
      .fromTo('.lg-steam path', { strokeDasharray: 90, strokeDashoffset: 90 }, { strokeDashoffset: -90, duration: 1.8, stagger: .18, ease: 'sine.inOut' }, .9)
      .to('.lg-badge img', { rotate: 2.5, duration: .4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.25)
      .to('.intro__line', { opacity: 1, y: 0, duration: .6 }, 1.3)
      .to(el, { clipPath: 'circle(0% at 50% 45%)', duration: .9, ease: 'expo.inOut', onComplete: finishIntro }, 2.7);
    if (seen) tl.timeScale(1.8);
  }
  if (document.readyState === 'complete') intro(); else addEventListener('load', intro);
  setTimeout(() => { if ($('#intro')) finishIntro(); }, 8000);
})();
