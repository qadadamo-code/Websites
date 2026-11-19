/* مأكولات التيسير — app */
(() => {
  const C = window.TS_CONFIG, CATS = window.TS_CATS, MENU = window.TS_MENU, PRIZES = window.TS_PRIZES;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const H = document.documentElement;
  const IMG = n => `assets/img/${n}.webp`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let L = H.lang === 'en' ? 1 : 0;
  const t = (ar, en) => L ? en : ar;
  const tx = a => Array.isArray(a) ? a[L] : a;
  const money = n => Math.round(n).toLocaleString('en-US');
  const cur = () => C.currency[L];
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* ---------- i18n ---------- */
  function applyLang() {
    H.lang = L ? 'en' : 'ar'; H.dir = L ? 'ltr' : 'rtl';
    $$('[data-en]').forEach(el => {
      if (el.dataset.ar === undefined) el.dataset.ar = el.dataset.arHtml || el.innerHTML;
      el.innerHTML = L ? el.dataset.en : el.dataset.ar;
    });
    $$('[data-ar-html]').forEach(el => { if (!el.dataset.en) el.innerHTML = el.dataset.arHtml; });
    $$('[data-en-ph]').forEach(el => { if (el.dataset.arPh === undefined) el.dataset.arPh = el.placeholder; el.placeholder = L ? el.dataset.enPh : el.dataset.arPh; });
    $('#langBtn').textContent = L ? 'ع' : 'EN';
    document.title = L ? 'Tayseer Foods | A taste like no other – Dairut' : 'مأكولات التيسير | Tayseer Foods – ديروط';
    $('#addr').textContent = C.address[L];
    fillTicker(); renderCats(); renderMenu(); renderDeals(); renderTops(); updatePizza(); updateMeter(); updateGrill(); renderCart(); setOpen(); buildSpin(); wheelSet(wIdx, true);
  }
  $('#langBtn').onclick = () => { L = 1 - L; store.set('ts-lang', L ? 'en' : 'ar'); const u = new URL(location); u.searchParams.set('lang', L ? 'en' : 'ar'); history.replaceState(null, '', u); applyLang(); window.ScrollTrigger && ScrollTrigger.refresh(); };
  $('#themeBtn').onclick = () => { const n = H.dataset.theme === 'dark' ? 'light' : 'dark'; H.dataset.theme = n; try { localStorage.setItem('ts-theme', n); } catch (e) {} };

  /* ---------- contacts ---------- */
  const wa = msg => `https://wa.me/${C.whatsapp}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
  $('#waFloat').href = wa(); $('#waLink').href = wa(); $('#mbWa').href = wa();
  $('#telLink').href = 'tel:' + C.phone; $('#telLink').textContent = C.phone;
  $('#mailLink').href = 'mailto:' + C.email; $('#mailLink').textContent = C.email;
  $('#mapLink').href = C.map; $('#yr').textContent = new Date().getFullYear();

  function setOpen() {
    let h; try { h = +new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Cairo' }).format(new Date()); } catch (e) { h = new Date().getHours(); }
    const open = C.closeHour < C.openHour ? (h >= C.openHour || h < C.closeHour) : (h >= C.openHour && h < C.closeHour);
    const p = $('#openPill'); p.classList.toggle('closed', !open);
    $('span', p).textContent = open ? t('مفتوح دلوقتي', 'Open now') : t('مقفول · بنفتح 11 الصبح', 'Closed · opens 11 AM');
  }

  /* ---------- ticker ---------- */
  function fillTicker() {
    const words = L ? ['Syrian Shawarma', 'Crêpe', 'Eastern Pizza', 'Feteer', 'Charcoal Grill', 'Uncle Tayseer Meal', 'Delivery'] : ['شاورما سوري', 'كريب', 'بيتزا شرقي وغربي', 'فطير مشلتت', 'مشويات على الفحم', 'وجبة عم تيسير', 'دليفري لحد البيت'];
    const s = words.map(w => `<span>${w}</span>`).join('');
    $('#tkRow').innerHTML = s + s + s + s;
  }

  /* ---------- toast ---------- */
  let tT; function toast(m) { const e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(tT); tT = setTimeout(() => e.classList.remove('show'), 2200); }

  /* ================= CART ================= */
  let cart = store.get('ts-cart', []), promo = store.get('ts-promo', null), ordType = 'delivery';
  const save = () => { store.set('ts-cart', cart); store.set('ts-promo', promo); };
  function addToCart(it) {
    const key = it.key || (it.id + '|' + (it.opt ? it.opt[0] : '') + '|' + (it.note || ''));
    const ex = cart.find(c => c.key === key);
    if (ex) ex.qty += it.qty || 1; else cart.push({ ...it, key, qty: it.qty || 1 });
    save(); renderCart();
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    toast(t('اتضاف للسلة ✓ ', 'Added to cart ✓ ') + tx(it.name));
  }
  function totals() {
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    let disc = 0, del = ordType === 'delivery' ? (sub >= C.freeDeliveryOver ? 0 : C.deliveryFee) : 0;
    if (promo) { if (C.promo[promo]) disc = sub * C.promo[promo]; if (promo === 'FREEDEL') del = 0; }
    if (cart.some(c => c.id === 'ml2')) del = 0;
    if (!cart.length) del = 0;
    return { sub, disc, del, tot: Math.max(0, sub - disc + del) };
  }
  function renderCart() {
    const n = cart.reduce((s, c) => s + c.qty, 0);
    $('#cartCount').textContent = n;
    $('#cart').classList.toggle('empty', !cart.length);
    $('#cartItems').innerHTML = cart.map((c, i) => `
      <div class="ci"><img src="${IMG(c.img)}" alt="">
        <div><h5>${tx(c.name)}</h5>${c.opt ? `<small>${tx(c.opt)}</small>` : ''}${c.note ? `<small>✎ ${c.note}</small>` : ''}</div>
        <div><div class="stepper"><button data-q="${i}" data-d="-1">−</button><b>${c.qty}</b><button data-q="${i}" data-d="1">+</button></div><div class="ci-p">${money(c.price * c.qty)} ${cur()}</div></div>
      </div>`).join('');
    const T = totals();
    $('#sSub').textContent = money(T.sub) + ' ' + cur();
    $('#sDisc').textContent = '− ' + money(T.disc) + ' ' + cur(); $('#sDiscRow').style.display = T.disc ? '' : 'none';
    $('#sDel').textContent = T.del ? money(T.del) + ' ' + cur() : t('مجاني', 'Free');
    $('#sTot').textContent = money(T.tot) + ' ' + cur();
    $('#mbTotal').textContent = money(T.tot);
    if (promo) { $('#promoIn').value = promo; promoMsg(); }
  }
  function promoMsg() {
    const p = PRIZES.find(x => x.code === promo);
    $('#promoMsg').textContent = promo ? (C.promo[promo] ? t(`تم تطبيق خصم ${C.promo[promo] * 100}%`, `${C.promo[promo] * 100}% discount applied`) : p ? t('هدية: ', 'Gift: ') + tx([p.ar, p.en]) : '') : '';
  }
  $('#cartItems').addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const c = cart[+b.dataset.q]; c.qty += +b.dataset.d; if (c.qty <= 0) cart.splice(+b.dataset.q, 1); save(); renderCart();
  });
  $('#promoBtn').onclick = () => {
    const v = $('#promoIn').value.trim().toUpperCase();
    if (C.promo[v] || PRIZES.some(p => p.code === v)) { promo = v; save(); renderCart(); promoMsg(); }
    else { promo = null; save(); renderCart(); $('#promoMsg').textContent = t('الكود ده مش شغال', 'Invalid code'); }
  };
  const openCart = () => { $('#cart').classList.add('open'); $('#cart').setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); };
  const closeCart = () => { $('#cart').classList.remove('open'); $('#cart').setAttribute('aria-hidden', 'true'); lenis && lenis.start(); };
  $('#cartBtn').onclick = openCart; $('#mbCart').onclick = openCart;
  $$('[data-close-cart]').forEach(e => e.addEventListener('click', closeCart));
  segInit('#ordType', v => { ordType = v; $('#cart').classList.toggle('pickup', v === 'pickup'); $('[name=addr]', $('#cartForm')).required = v === 'delivery'; renderCart(); });
  $('[name=addr]', $('#cartForm')).required = true;
  $('#cartForm').addEventListener('submit', e => {
    e.preventDefault(); if (!cart.length) return;
    const f = new FormData(e.target), T = totals();
    const lines = cart.map(c => `• ${c.qty} × ${tx(c.name)}${c.opt ? ' (' + tx(c.opt) + ')' : ''}${c.note ? ' – ' + c.note : ''} = ${money(c.price * c.qty)}`);
    const p = promo && PRIZES.find(x => x.code === promo);
    const msg = [
      t('🍽️ أوردر جديد – مأكولات التيسير', '🍽️ New order – Tayseer Foods'), '',
      ...lines, '',
      t('المجموع: ', 'Subtotal: ') + money(T.sub) + ' ' + cur(),
      T.disc ? t('الخصم: ', 'Discount: ') + money(T.disc) + ` (${promo})` : '',
      p && !C.promo[promo] ? t('🎁 هدية العجلة: ', '🎁 Wheel gift: ') + tx([p.ar, p.en]) + ` (${promo})` : '',
      t('التوصيل: ', 'Delivery: ') + (T.del ? money(T.del) : t('مجاني', 'Free')),
      t('الإجمالي: ', 'Total: ') + money(T.tot) + ' ' + cur(), '',
      t('النوع: ', 'Type: ') + (ordType === 'delivery' ? t('توصيل', 'Delivery') : t('استلام من المحل', 'Pickup')),
      t('الاسم: ', 'Name: ') + f.get('name'),
      t('الموبايل: ', 'Phone: ') + f.get('phone'),
      ordType === 'delivery' ? t('العنوان: ', 'Address: ') + f.get('addr') : ''
    ].filter(x => x !== '').join('\n');
    window.open(wa(msg), '_blank');
  });

  /* ================= MENU ================= */
  let activeCat = 'all', q = '';
  function renderCats() {
    $('#catScroll').innerHTML = `<button class="cat ${activeCat === 'all' ? 'on' : ''}" data-c="all"><img src="${IMG('tray')}" alt="">${t('الكل', 'All')}</button>` +
      CATS.map(c => `<button class="cat ${activeCat === c.id ? 'on' : ''}" data-c="${c.id}"><img src="${IMG(c.img)}" alt="">${tx(c.n)}</button>`).join('');
  }
  $('#catScroll').addEventListener('click', e => { const b = e.target.closest('.cat'); if (!b) return; activeCat = b.dataset.c; renderCats(); renderMenu(); scrollToEl('#menu', -10); });
  const minPrice = m => Array.isArray(m.p) ? Math.min(...m.p.map(o => o[2])) : m.p;
  const tagLbl = { best: ['الأكثر طلباً', 'Best seller'], hot: ['🔥 ناري', '🔥 Hot'], new: ['جديد', 'New'] };
  let crepeFilter = null;
  function renderMenu() {
    const qq = q.trim().toLowerCase();
    let html = '';
    CATS.forEach(c => {
      if (activeCat !== 'all' && activeCat !== c.id) return;
      let items = MENU.filter(m => m.cat === c.id && (!qq || (m.n.join(' ') + m.d.join(' ')).toLowerCase().includes(qq)));
      if (c.id === 'crepe' && crepeFilter) items = items.filter(m => (m.img === 'sweet') === (crepeFilter === 'sweet'));
      if (!items.length) return;
      html += `<h3 class="mcat-title">${tx(c.n)} <small>${tx(c.s)}</small></h3>`;
      html += items.map(m => `
        <article class="item" data-id="${m.id}">
          ${m.tag ? `<span class="tag tag-${m.tag}">${tx(tagLbl[m.tag])}</span>` : ''}
          <div class="item-img"><img src="${IMG(m.img)}" alt="${tx(m.n)}" loading="lazy"></div>
          <h4>${tx(m.n)}</h4><p>${tx(m.d)}</p>
          <div class="item-foot"><span class="item-price">${Array.isArray(m.p) ? `<small>${t('من', 'from')}</small>` : ''}${money(minPrice(m))} <small>${cur()}</small></span><button class="item-add" aria-label="add">+</button></div>
        </article>`).join('');
    });
    $('#menuGrid').innerHTML = html || `<p class="menu-empty">${t('مفيش أكلة بالاسم ده… جرّب كلمة تانية', 'No dish found… try another word')}</p>`;
  }
  $('#search').addEventListener('input', e => { q = e.target.value; activeCat = 'all'; renderCats(); renderMenu(); });
  $('#menuGrid').addEventListener('click', e => {
    const card = e.target.closest('.item'); if (!card) return;
    const m = MENU.find(x => x.id === card.dataset.id);
    if (e.target.closest('.item-add') && !Array.isArray(m.p)) { addToCart({ id: m.id, name: m.n, price: m.p, img: m.img }); return; }
    openSheet(m);
  });

  /* ---------- sheet ---------- */
  let sh = { m: null, opt: 0, qty: 1 };
  function openSheet(m) {
    sh = { m, opt: 0, qty: 1 };
    $('#shImg').src = IMG(m.img); $('#shName').textContent = tx(m.n); $('#shDesc').textContent = tx(m.d); $('#shNote').value = '';
    $('#shOpts').innerHTML = Array.isArray(m.p) ? m.p.map((o, i) => `<div class="opt ${i ? '' : 'on'}" data-i="${i}"><span>${L ? o[1] : o[0]}</span><b>${money(o[2])} ${cur()}</b></div>`).join('') : '';
    shUpdate(); $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false'); lenis && lenis.stop();
  }
  const closeSheet = () => { $('#sheet').classList.remove('open'); $('#sheet').setAttribute('aria-hidden', 'true'); lenis && lenis.start(); };
  function shUpdate() { const m = sh.m, p = Array.isArray(m.p) ? m.p[sh.opt][2] : m.p; $('#shQty').textContent = sh.qty; $('#shPrice').textContent = money(p * sh.qty); }
  $('#shOpts').addEventListener('click', e => { const o = e.target.closest('.opt'); if (!o) return; sh.opt = +o.dataset.i; $$('.opt', $('#shOpts')).forEach(x => x.classList.toggle('on', x === o)); shUpdate(); });
  $('#shMinus').onclick = () => { sh.qty = Math.max(1, sh.qty - 1); shUpdate(); };
  $('#shPlus').onclick = () => { sh.qty++; shUpdate(); };
  $('#shAdd').onclick = () => {
    const m = sh.m, o = Array.isArray(m.p) ? m.p[sh.opt] : null;
    addToCart({ id: m.id, name: m.n, opt: o ? [o[0], o[1]] : null, price: o ? o[2] : m.p, img: m.img, qty: sh.qty, note: $('#shNote').value.trim() });
    closeSheet();
  };
  $$('[data-close]').forEach(e => e.addEventListener('click', closeSheet));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); closeCart(); } });
  $$('[data-add]').forEach(b => b.addEventListener('click', () => { const m = MENU.find(x => x.id === b.dataset.add); addToCart({ id: m.id, name: m.n, price: m.p, img: m.img }); }));

  /* ---------- deals ---------- */
  function renderDeals() {
    const ids = ['ml1', 'ml5', 'ml3', 'ml4', 'sh6'];
    $('#deals').innerHTML = ids.map(id => { const m = MENU.find(x => x.id === id); return `<div class="deal" data-id="${id}"><div><h4>${tx(m.n)}</h4><p>${tx(m.d)}</p></div><div class="dp">${money(minPrice(m))} <small>${cur()}</small></div><img src="${IMG(m.img === 'shawarma' ? 'shawarma' : m.img)}" alt=""></div>`; }).join('');
  }
  $('#deals').addEventListener('click', e => { const d = e.target.closest('.deal'); if (d) openSheet(MENU.find(x => x.id === d.dataset.id)); });

  /* ---------- seg helper ---------- */
  function segInit(sel, cb) { const el = $(sel); el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('button', el).forEach(x => x.classList.toggle('on', x === b)); cb(b.dataset.v); }); }

  /* ================= SHAWARMA METER ================= */
  const meterRate = { chicken: 3.8, beef: 4.8, mix: 4.3 }; let meterT = 'chicken';
  const mr = $('#meterRange');
  $('#meterRuler').innerHTML = [25, 50, 75, 100, 125, 150].map(v => `<span style="inset-inline-start:${(v - 25) / 125 * 100}%">${v}</span>`).join('');
  function updateMeter() {
    const cm = +mr.value, pct = (cm - 25) / 125 * 100;
    mr.style.setProperty('--p', pct + '%');
    $('#mwRoll').style.width = (14 + pct * .84) + '%';
    $('#meterCm').textContent = cm;
    $('#meterPpl').textContent = Math.max(1, Math.round(cm / 22));
    $('#meterPrice').textContent = money(Math.round(cm * meterRate[meterT] / 5) * 5);
  }
  mr.addEventListener('input', updateMeter);
  segInit('#meterType', v => { meterT = v; updateMeter(); });
  $('#meterAdd').onclick = () => {
    const cm = +mr.value, tn = { chicken: ['فراخ', 'Chicken'], beef: ['لحمة', 'Beef'], mix: ['ميكس', 'Mix'] }[meterT];
    addToCart({ id: 'meter', key: 'meter-' + cm + meterT, name: ['شاورما بالمتر', 'Shawarma by the meter'], opt: [`${cm} سم – ${tn[0]}`, `${cm} cm – ${tn[1]}`], price: Math.round(cm * meterRate[meterT] / 5) * 5, img: 'shawarma' });
  };

  /* ================= PIZZA LAB ================= */
  const pzBase = [70, 100, 135], pzDoughX = { western: 0, eastern: 0, stuffed: [20, 30, 40] };
  const TOPS = [
    { id: 'pep', n: ['بيبروني', 'Pepperoni'], p: 20, k: 't-pep', c: 9 },
    { id: 'chk', n: ['فراخ', 'Chicken'], p: 25, k: 't-chk', c: 10 },
    { id: 'sau', n: ['سجق', 'Sausage'], p: 20, k: 't-sau', c: 10 },
    { id: 'shr', n: ['جمبري', 'Shrimp'], p: 40, k: 't-shr', c: 8 },
    { id: 'msh', n: ['مشروم', 'Mushroom'], p: 12, k: 't-msh', c: 10 },
    { id: 'olv', n: ['زيتون', 'Olives'], p: 8, k: 't-olv', c: 14 },
    { id: 'grn', n: ['فلفل', 'Peppers'], p: 8, k: 't-grn', c: 14 },
    { id: 'jal', n: ['هالابينو', 'Jalapeño'], p: 10, k: 't-jal', c: 10 }
  ];
  let pz = { size: 1, dough: 'western', tops: new Set(['pep', 'olv']) };
  const rnd = s => () => (s = (s * 9301 + 49297) % 233280) / 233280;
  function renderTops() { $('#pzTops').innerHTML = TOPS.map(tp => `<button class="chip ${pz.tops.has(tp.id) ? 'on' : ''}" data-t="${tp.id}">${tx(tp.n)} <small>+${tp.p}</small></button>`).join(''); }
  function drawLayer(newId) {
    const lay = $('#pzLayer');
    if (!newId) lay.innerHTML = '';
    TOPS.forEach((tp, ti) => {
      if (!pz.tops.has(tp.id)) { $$('.' + tp.k, lay).forEach(e => e.remove()); return; }
      if (newId && newId !== tp.id) return;
      const r = rnd(ti * 97 + 13); let h = '';
      for (let i = 0; i < tp.c; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 42; h += `<i class="${tp.k}" style="left:${50 + Math.cos(a) * d}%;top:${50 + Math.sin(a) * d}%;transform:rotate(${r() * 360}deg);animation-delay:${i * 35}ms"></i>`; }
      lay.insertAdjacentHTML('beforeend', h);
    });
  }
  const pzPrice = () => pzBase[pz.size] + (pz.dough === 'stuffed' ? pzDoughX.stuffed[pz.size] : 0) + [...pz.tops].reduce((s, id) => s + TOPS.find(x => x.id === id).p * [0.8, 1, 1.3][pz.size], 0);
  function updatePizza() {
    const el = $('#pz'); el.style.width = [62, 76, 90][pz.size] + '%'; el.className = 'pz ' + pz.dough;
    $('#pzPrice').textContent = money(Math.round(pzPrice() / 5) * 5);
    const names = [...pz.tops].map(id => tx(TOPS.find(x => x.id === id).n));
    $('#pzSum').textContent = [t(['صغير', 'وسط', 'كبير'][pz.size], ['Small', 'Medium', 'Large'][pz.size]), t({ western: 'غربي', eastern: 'شرقي', stuffed: 'أطراف جبنة' }[pz.dough], { western: 'Western', eastern: 'Eastern', stuffed: 'Cheese crust' }[pz.dough]), ...names].join(' · ');
  }
  segInit('#pzSize', v => { pz.size = +v; updatePizza(); });
  segInit('#pzDough', v => { pz.dough = v; updatePizza(); });
  $('#pzTops').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; const id = b.dataset.t; if (pz.tops.has(id)) pz.tops.delete(id); else pz.tops.add(id); b.classList.toggle('on'); drawLayer(pz.tops.has(id) ? id : null); if (!pz.tops.has(id)) drawLayer(); updatePizza(); });
  $('#pzAdd').onclick = () => { const s = $('#pzSum').textContent; addToCart({ id: 'pzlab', key: 'pz-' + s, name: ['بيتزا على مزاجي', 'My custom pizza'], opt: [s, s], price: Math.round(pzPrice() / 5) * 5, img: 'pizza' }); };
  drawLayer();

  /* crepe split */
  $$('.split-side').forEach(b => b.addEventListener('click', () => { crepeFilter = b.dataset.filter; activeCat = 'crepe'; renderCats(); renderMenu(); scrollToEl('#menu'); setTimeout(() => crepeFilter = null, 100); }));

  /* ================= GRILL CALC ================= */
  let gc = { ppl: 4, h: 0.28 };
  const GR = [{ id: 'gr1', n: ['كفتة', 'Kofta'], kg: 450, sh: .4 }, { id: 'gr2', n: ['شيش طاووق', 'Shish tawook'], kg: 370, sh: .35 }, { id: 'gr3', n: ['كباب', 'Kebab'], kg: 650, sh: .25 }];
  const q4 = v => Math.max(.25, Math.round(v * 4) / 4);
  const kgTxt = v => L ? v + ' kg' : ({ 0.25: 'ربع كيلو', 0.5: 'نص كيلو', 0.75: '¾ كيلو', 1: 'كيلو' }[v] || v + ' كيلو');
  function gcMix() { const tot = gc.ppl * gc.h; return GR.map(g => ({ ...g, w: q4(tot * g.sh) })); }
  function updateGrill() {
    const mix = gcMix(); $('#gcPpl').textContent = gc.ppl;
    $('#gcMix').innerHTML = mix.map(g => `<div><span>${tx(g.n)} · ${kgTxt(g.w)}</span><b>${money(Math.round(g.w * g.kg / 5) * 5)}</b></div>`).join('') + `<div><span>${t('عيش وسلطات وطحينة', 'Bread, salads & tahini')}</span><b>${t('هدية', 'Free')}</b></div>`;
    $('#gcPrice').textContent = money(mix.reduce((s, g) => s + Math.round(g.w * g.kg / 5) * 5, 0));
  }
  $('#gcMinus').onclick = () => { gc.ppl = Math.max(1, gc.ppl - 1); updateGrill(); };
  $('#gcPlus').onclick = () => { gc.ppl = Math.min(30, gc.ppl + 1); updateGrill(); };
  segInit('#gcHunger', v => { gc.h = +v; updateGrill(); });
  $('#gcAdd').onclick = () => { const mix = gcMix(); addToCart({ id: 'grilltray', key: 'gt-' + gc.ppl + gc.h, name: [`صينية مشويات لـ ${gc.ppl} أفراد`, `Grill tray for ${gc.ppl}`], opt: [mix.map(g => g.n[0] + ' ' + kgTxt(g.w)).join(' + '), mix.map(g => g.n[1] + ' ' + g.w + 'kg').join(' + ')], price: mix.reduce((s, g) => s + Math.round(g.w * g.kg / 5) * 5, 0), img: 'grill' }); };

  /* ================= SPIN WHEEL ================= */
  let spinRot = 0;
  function buildSpin() {
    const n = PRIZES.length, R = 190, cx = 200, cy = 200; let s = '';
    s += `<circle cx="200" cy="200" r="198" fill="#141312"/>`;
    PRIZES.forEach((p, i) => {
      const a0 = (i / n) * 2 * Math.PI - Math.PI / 2 - Math.PI / n, a1 = a0 + 2 * Math.PI / n;
      const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
      const fill = i % 2 ? '#1f1c19' : '#FFB80F', col = i % 2 ? '#FFB80F' : '#1a1306';
      const am = (a0 + a1) / 2, deg = am * 180 / Math.PI;
      s += `<path d="M200 200 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}Z" fill="${fill}"/>`;
      s += `<text x="${cx + 118 * Math.cos(am)}" y="${cy + 118 * Math.sin(am)}" fill="${col}" font-family="Alexandria,Inter Tight" font-weight="800" font-size="17" text-anchor="middle" dominant-baseline="middle" transform="rotate(${deg} ${cx + 118 * Math.cos(am)} ${cy + 118 * Math.sin(am)})">${L ? p.en : p.ar}</text>`;
    });
    for (let i = 0; i < 40; i++) { const a = i / 40 * 2 * Math.PI, r1 = 191, r2 = 198; const p1 = [200 + r1 * Math.cos(a - .05), 200 + r1 * Math.sin(a - .05)], p2 = [200 + r1 * Math.cos(a + .05), 200 + r1 * Math.sin(a + .05)], p3 = [200 + (r2 + 0) * Math.cos(a), 200 + (r2 + 0) * Math.sin(a)]; s += `<path d="M${p1} L${p2} L${p3}Z" fill="#FFB80F" opacity=".9"/>`; }
    s += `<circle cx="200" cy="200" r="50" fill="#141312"/>`;
    const w = $('#spinWheel'); w.innerHTML = `<g id="spinG" style="transform-origin:200px 200px;transform:rotate(${spinRot}deg)">${s}</g>`;
    const today = new Date().toDateString(), last = store.get('ts-spin', null);
    if (last && last.d === today) { $('#spinBtn').disabled = true; showPrize(last.i, true); }
  }
  function showPrize(i, old) {
    const p = PRIZES[i];
    $('#spinRes').innerHTML = `${old ? t('لفّتك النهارده: ', 'Today\'s spin: ') : t('مبروك! كسبت ', 'You won ')}<b>${L ? p.en : p.ar}</b><br><span class="code">${p.code}</span>`;
  }
  $('#spinBtn').onclick = () => {
    const btn = $('#spinBtn'); if (btn.disabled) return; btn.disabled = true;
    const n = PRIZES.length, i = Math.floor(Math.random() * n);
    spinRot = 360 * 6 - i * (360 / n) + (Math.random() - .5) * (360 / n) * .6;
    const g = $('#spinG'); g.style.transition = 'transform 5s cubic-bezier(.12,.7,.08,1)'; g.style.transform = `rotate(${spinRot}deg)`;
    setTimeout(() => { showPrize(i); promo = PRIZES[i].code; save(); renderCart(); store.set('ts-spin', { d: new Date().toDateString(), i }); toast(t('الكود اتحط في سلتك 🎉', 'Code added to your cart 🎉')); }, 5100);
  };

  /* ================= BOOKING ================= */
  let bookT = 'table'; segInit('#bookType', v => bookT = v);
  const bd = $('[name=date]', $('#bookForm')); bd.min = new Date().toISOString().slice(0, 10); bd.value = bd.min;
  $('#bookForm').addEventListener('submit', e => {
    e.preventDefault(); const f = new FormData(e.target);
    const msg = [bookT === 'table' ? t('📅 حجز ترابيزة – مأكولات التيسير', '📅 Table booking – Tayseer Foods') : t('🎉 طلب حفلة / مناسبة – مأكولات التيسير', '🎉 Party / event request – Tayseer Foods'), '',
      t('الاسم: ', 'Name: ') + f.get('name'), t('الموبايل: ', 'Phone: ') + f.get('phone'), t('التاريخ: ', 'Date: ') + f.get('date'), t('الوقت: ', 'Time: ') + f.get('time'), t('العدد: ', 'Guests: ') + f.get('guests'),
      f.get('notes') ? t('ملاحظات: ', 'Notes: ') + f.get('notes') : ''].filter(Boolean).join('\n');
    window.open(wa(msg), '_blank');
  });

  /* ================= WHEEL (stations) ================= */
  const WCATS = CATS.slice(0, 6); let wIdx = 0;
  const STEP = 360 / 12; // stations spaced 30° on the dial; dial spins to bring each to top
  function buildDial() {
    let s = `<circle cx="500" cy="500" r="430" fill="none" stroke="rgba(255,184,15,.35)" stroke-width="2"/><circle cx="500" cy="500" r="300" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1.5" stroke-dasharray="4 10"/>`;
    for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, r1 = 452, r2 = 478, w = .028; s += `<path d="M${500 + r1 * Math.cos(a - w)} ${500 + r1 * Math.sin(a - w)} L${500 + r1 * Math.cos(a + w)} ${500 + r1 * Math.sin(a + w)} L${500 + r2 * Math.cos(a)} ${500 + r2 * Math.sin(a)}Z" fill="#FFB80F"/>`; }
    $('#wdRing').innerHTML = s;
    $('#wdItems').innerHTML = WCATS.map((c, i) => { const a = (-90 + i * STEP) * Math.PI / 180, r = 37; return `<div class="wd-item" data-i="${i}" style="left:${50 + Math.cos(a) * r}%;top:${50 + Math.sin(a) * r}%"><img src="${IMG(c.img)}" alt=""><span>${tx(c.n)}</span></div>`; }).join('');
    $('#wiDots').innerHTML = WCATS.map((c, i) => `<button data-i="${i}" aria-label="${c.id}"></button>`).join('');
  }
  buildDial();
  const words = ['SHAWARMA', 'CRÊPE', 'PIZZA', 'FETEER', 'SANDWICH', 'GRILL'];
  function wheelSet(i, force) {
    if (i === wIdx && !force) return; const dir = i > wIdx ? 1 : -1; wIdx = i; const c = WCATS[i];
    $$('.wd-item').forEach((e, k) => { e.classList.toggle('on', k === i); $('span', e).textContent = tx(WCATS[k].n); });
    $$('#wiDots button').forEach((e, k) => e.classList.toggle('on', k === i));
    $('#wiNum').textContent = String(i + 1).padStart(2, '0') + ' / 06';
    $('#wiName').textContent = tx(c.n); $('#wiSub').textContent = tx(c.s);
    $('#wiFrom').textContent = Math.min(...MENU.filter(m => m.cat === c.id).map(minPrice));
    $('#wheelWord').textContent = words[i];
    $('#wheelGlow').style.background = `radial-gradient(circle, ${c.glow}55, transparent 60%)`;
    const img = $('#wheelImg');
    if (window.gsap && !force && !reduced) {
      gsap.timeline().to(img, { x: -120 * dir * (L ? 1 : -1), rotate: -25 * dir, scale: .6, opacity: 0, duration: .28, ease: 'power2.in' })
        .add(() => { img.src = IMG(c.img); })
        .fromTo(img, { x: 120 * dir * (L ? 1 : -1), rotate: 25 * dir, scale: .6, opacity: 0 }, { x: 0, rotate: 0, scale: 1, opacity: 1, duration: .6, ease: 'back.out(1.4)' });
    } else img.src = IMG(c.img);
  }
  $('#wiBtn').addEventListener('click', e => { e.preventDefault(); activeCat = WCATS[wIdx].id; renderCats(); renderMenu(); scrollToEl('#menu'); });

  /* ================= SCROLL / MOTION ================= */
  let lenis = null;
  function scrollToEl(sel, off = 0) { const el = $(sel); if (!el) return; if (lenis) lenis.scrollTo(el, { offset: off }); else el.scrollIntoView({ behavior: 'smooth' }); }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h.length > 1 && $(h)) { e.preventDefault(); scrollToEl(h); $('#nav').classList.remove('open'); } }));
  $('#navBtn').onclick = () => $('#nav').classList.toggle('open');

  // sparks canvas
  function sparks(cv, opts) {
    const ctx = cv.getContext('2d'); let W, Hh, P = [], dpr = Math.min(2, devicePixelRatio || 1), run = false;
    const size = () => { W = cv.offsetWidth; Hh = cv.offsetHeight; cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const spawn = () => ({ x: opts.x() * W, y: Hh * (opts.y0 || 1) + Math.random() * 20, vx: (Math.random() - .5) * .6, vy: -(Math.random() * 1.6 + .6) * (opts.speed || 1), life: 0, max: 120 + Math.random() * 160, r: Math.random() * 2 + .6 });
    for (let i = 0; i < opts.n; i++) { const p = spawn(); p.y = Math.random() * Hh; p.life = Math.random() * p.max; P.push(p); }
    const loop = () => {
      if (!run) return; ctx.clearRect(0, 0, W, Hh); ctx.globalCompositeOperation = 'lighter';
      P.forEach((p, i) => { p.life++; p.x += p.vx + Math.sin((p.life + i) * .05) * .4; p.y += p.vy; const k = 1 - p.life / p.max; if (k <= 0 || p.y < -10) { P[i] = spawn(); return; }
        ctx.beginPath(); ctx.fillStyle = `rgba(255,${150 + Math.random() * 60 | 0},40,${k})`; ctx.shadowBlur = 8; ctx.shadowColor = '#ff8a1f'; ctx.arc(p.x, p.y, p.r * k + .3, 0, 7); ctx.fill(); });
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(es => es.forEach(e => { run = e.isIntersecting; if (run) loop(); })).observe(cv);
  }
  if (!reduced) {
    sparks($('#sparks'), { n: innerWidth < 700 ? 40 : 80, x: () => (H.dir === 'rtl' ? .3 : .7) + (Math.random() - .5) * .35, y0: .8 });
    sparks($('#embers'), { n: innerWidth < 700 ? 50 : 110, x: () => Math.random(), y0: 1, speed: 1.3 });
  }

  // hero float: mouse parallax
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    const fl = $$('.hf'); addEventListener('mousemove', e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; fl.forEach((f, i) => { const d = (i + 1) * 14; f.style.translate = `${x * d}px ${y * d}px`; }); });
  }

  // header + mobile bar
  const hdr = $('#hdr'), mbar = $('#mbar');
  const onScroll = () => { const y = scrollY; hdr.classList.toggle('solid', y > 60); mbar.classList.toggle('show', y > innerHeight * .8); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function startMotion() {
    if (!window.gsap || reduced) { $$('.reveal').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); wheelFallback(); return; }
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) { lenis = new Lenis({ lerp: .1, smoothWheel: true }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }

    // hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-bg img', { scale: 1.35, duration: 2.2, ease: 'power2.out' }, 0)
      .from('.ht-line>span', { yPercent: 110, duration: 1.1, stagger: .12 }, .2)
      .from('.reveal-h', { y: 30, opacity: 0, duration: .9, stagger: .1 }, .5)
      .from('.hf-badge', { scale: .4, rotate: -90, opacity: 0, duration: 1.4, ease: 'back.out(1.4)' }, .4)
      .from('.hf', { y: 120, opacity: 0, rotate: -20, duration: 1.2, stagger: .12, ease: 'back.out(1.3)' }, .6)
      .from('.hdr', { y: -80, opacity: 0, duration: .8 }, .3);
    if (innerWidth <= 860) gsap.to('.hf-burger', { opacity: .95, duration: 1, delay: 1 });
    gsap.to('.hero-bg img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy', { y: -80, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-float', { y: -160, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // wheel pin
    const dial = $('#wheelDial'), items = $$('.wd-item');
    const N = WCATS.length;
    ScrollTrigger.create({
      trigger: '#wheel', start: 'top top', end: () => '+=' + innerHeight * (N + .5), pin: true, scrub: true, anticipatePin: 1,
      onUpdate: self => {
        const pos = self.progress * (N - 1);
        const rot = -pos * STEP;
        dial.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
        items.forEach(it => it.style.transform = `rotate(${-rot}deg)`);
        wheelSet(Math.round(pos));
        $('#wheelWord').style.transform = `translate(calc(-50% + ${(pos % 1 - .5) * -60}px),-50%)`;
      }
    });
    $$('#wiDots button, .wd-item').forEach(b => b.addEventListener('click', () => {
      const st = ScrollTrigger.getAll().find(s => s.trigger === $('#wheel')); const i = +b.dataset.i;
      const y = st.start + (st.end - st.start) * (i / (N - 1)); lenis ? lenis.scrollTo(y) : scrollTo(0, y);
    }));
    gsap.from('.wheel-head', { y: 60, opacity: 0, duration: 1, scrollTrigger: { trigger: '#wheel', start: 'top 70%' } });

    // reveals
    $$('.reveal').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } }));
    $$('.sec-head .h2, .grill-copy .h2').forEach(el => gsap.from(el, { y: 70, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    gsap.to('.grill-bg', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.grill', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('#trayImg', { rotate: -60 }, { rotate: 60, ease: 'none', scrollTrigger: { trigger: '.family', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.family-tray', { scale: .7, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.family', start: 'top 75%' } });
    ScrollTrigger.batch('.item', { start: 'top 92%', onEnter: b => gsap.fromTo(b, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .7, ease: 'power3.out', overwrite: true }) });
    ScrollTrigger.batch('.deal', { start: 'top 90%', onEnter: b => gsap.from(b, { y: 60, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out' }) });
    gsap.from('.split-side img', { y: 80, rotate: 15, opacity: 0, stagger: .15, duration: 1.2, ease: 'back.out(1.3)', scrollTrigger: { trigger: '.lab-split', start: 'top 80%' } });
    // nav active
    ['wheel', 'menu', 'labs', 'offers', 'book', 'visit'].forEach(id => ScrollTrigger.create({ trigger: '#' + id, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) $$('.nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id)); } }));
    addEventListener('load', () => ScrollTrigger.refresh());
  }
  function wheelFallback() {
    let i = 0; setInterval(() => { i = (i + 1) % WCATS.length; $('#wheelDial').style.transform = `translate(-50%,-50%) rotate(${-i * STEP}deg)`; $$('.wd-item').forEach(it => it.style.transform = `rotate(${i * STEP}deg)`); wheelSet(i); }, 3000);
  }

  /* ================= INTRO ================= */
  function intro(done) {
    const el = $('#intro');
    if (!window.gsap || reduced || sessionStorage.getItem('ts-intro')) { el.remove(); done(); return; }
    try { sessionStorage.setItem('ts-intro', 1); } catch (e) {}
    gsap.timeline({ onComplete: () => { el.remove(); } })
      .from('.il-ring', { rotate: -240, scale: .3, opacity: 0, duration: 1.3, ease: 'expo.out' })
      .from('.il-core', { scale: .5, opacity: 0, duration: .9, ease: 'back.out(1.6)' }, .35)
      .to('.intro-bar i', { width: '100%', duration: 1.2, ease: 'power2.inOut' }, 0)
      .to('.il-ring', { rotate: 120, duration: 1.2, ease: 'power2.inOut' }, 1.1)
      .add(done, 1.7)
      .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: .9, ease: 'expo.inOut' }, 1.6);
    gsap.set(el, { clipPath: 'circle(150% at 50% 50%)' });
  }

  applyLang();
  intro(startMotion);
})();
