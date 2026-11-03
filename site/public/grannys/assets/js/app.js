/* Granny's Secrets — site logic */
(() => {
  'use strict';
  const C = window.GS_CONFIG, CATS = window.GS_CATS, MENU = window.GS_MENU, DAILY = window.GS_DAILY, SECRETS = window.GS_SECRETS, REVIEWS = window.GS_REVIEWS;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 760;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  let lang = store.get('gs-lang', 'ar') === 'en' ? 'en' : 'ar';
  const L = o => (o ? (lang === 'ar' ? o.ar : (o.en || o.ar)) : '');
  const D = o => (lang === 'ar' ? o.dAr : o.dEn);
  const money = n => `${Math.round(n).toLocaleString('en-US')} ${lang === 'ar' ? 'ج.م' : 'EGP'}`;
  const byId = id => MENU.find(m => m.id === id);
  const catOf = id => CATS.find(c => c.id === id);
  const img = it => `assets/food/${it.id}.webp`;
  const wa = msg => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  const T = (ar, en) => (lang === 'ar' ? ar : en);
  const DAYS = { ar: ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
  const TAGS = { best: { ar: 'الأكثر طلبًا', en: 'Best seller', c: '' }, new: { ar: 'جديد', en: 'New', c: 'badge--new' }, chef: { ar: 'اختيار الشيف', en: "Chef's pick", c: 'badge--chef' } };
  const ICON = {
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ======================================================
     LANGUAGE
     ====================================================== */
  function applyLang(first) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'جراني سيكرتس | Granny\'s Secrets — أكل البيت زي ما تيتة بتعمله' : "Granny's Secrets — Home food, the way Granny makes it";
    $('#search').placeholder = T('دوّر على أكلة… ملوخية، محشي، أم علي', 'Search a dish… molokhia, mahshi, Om Ali');
    store.set('gs-lang', lang);
    renderAll();
    if (!first && window.ScrollTrigger) { scenes.forEach(s => s.layout()); ScrollTrigger.refresh(); }
  }

  /* ======================================================
     RENDER
     ====================================================== */
  function renderMarquee() {
    const words = lang === 'ar'
      ? ['سمنة بلدي', 'طبيخ كل يوم', 'بهارات مطحونة في البيت', 'توصيل سخن', 'محشي ملفوف بالإيد', 'من غير مواد حافظة', 'عزومات كاملة']
      : ['Real ghee', 'Cooked every day', 'Hand-ground spices', 'Delivered hot', 'Hand-rolled mahshi', 'No preservatives', 'Whole feasts'];
    const one = words.map(w => `<span>${w}<img src="assets/img/logo/leaf-c.webp" alt=""></span>`).join('');
    $('#marquee').innerHTML = one + one;
  }

  let todayPick = null;
  function renderToday(pickId) {
    const dow = new Date().getDay();
    const id = pickId || DAILY[dow];
    todayPick = byId(id);
    const dayIdx = +Object.keys(DAILY).find(k => DAILY[k] === id);
    $('#todayDay').textContent = DAYS[lang][isNaN(dayIdx) ? dow : dayIdx];
    $('#todayName').textContent = L(todayPick);
    $('#todayDesc').textContent = D(todayPick);
    $('#todayPrice').textContent = money(todayPick.price);
    const im = $('#todayImg');
    if (!im.src.endsWith(img(todayPick))) {
      im.style.opacity = 0;
      const n = new Image(); n.onload = () => { im.src = n.src; im.alt = L(todayPick); im.style.opacity = 1; }; n.src = img(todayPick);
    }
    const order = [6, 0, 1, 2, 3, 4, 5]; // Saturday first (Egyptian week)
    $('#week').innerHTML = order.map(d => {
      const it = byId(DAILY[d]);
      return `<li data-d="${d}" class="${it.id === id ? 'on' : ''} ${d === dow ? 'today-mark' : ''}"><b>${DAYS[lang][d]}</b><span>${L(it)}</span></li>`;
    }).join('');
    const st = $('#stampText'); st.textContent = "DISH OF THE DAY • GRANNY'S SECRETS • "; st.setAttribute('textLength', 452); st.setAttribute('lengthAdjust', 'spacing');
  }

  function renderPromise() {
    const P = [
      { ic: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16h20l-2 24a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3Z"/><path d="M12 16h24M18 10h12l2 6H16Z"/><path d="M19 27c3 2 7 2 10 0"/></svg>', ar: 'سمنة بلدي حقيقية', en: 'Real ghee', dAr: 'مفيش زيوت مهدرجة ولا سمن صناعي.', dEn: 'No hydrogenated oils, no margarine.' },
      { ic: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 24h32a16 16 0 0 1-32 0Z"/><path d="M28 24 38 8"/><circle cx="18" cy="20" r="1.5" fill="currentColor"/><circle cx="23" cy="18" r="1.5" fill="currentColor"/></svg>', ar: 'بهارات بإيدينا', en: 'Spices ground by hand', dAr: 'بنحمّص ونطحن البهارات في المطبخ.', dEn: 'We toast and grind them in our kitchen.' },
      { ic: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="14"/><path d="M24 18v8l5 4M20 6h8"/></svg>', ar: 'بيتطبخ النهارده', en: 'Cooked today', dAr: 'مش أكل امبارح. كل طلب طازة.', dEn: "Never yesterday's food. Every order is fresh." },
      { ic: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 18h32v20a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3Z"/><path d="M8 18l4-8h24l4 8M20 26c2-2 2-4 0-6M28 26c2-2 2-4 0-6"/></svg>', ar: 'يوصلك سخن', en: 'Arrives hot', dAr: 'تغليف محكم بيحافظ على السخونية.', dEn: 'Sealed packaging that keeps the heat in.' }
    ];
    $('#promise').innerHTML = P.map(p => `<div class="pr reveal">${p.ic}<h3>${L(p)}</h3><p>${D(p)}</p></div>`).join('');
  }

  function qtyOf(id) { return cart.filter(c => c.id === id).reduce((a, c) => a + c.qty, 0); }
  function buyHtml(it, small) {
    const q = qtyOf(it.id);
    if (q) return `<div class="step" data-id="${it.id}"><button type="button" data-act="dec" aria-label="-">−</button><b>${q}</b><button type="button" data-act="inc" aria-label="+">+</button></div>`;
    return `<button class="add" type="button" data-act="add" data-id="${it.id}" aria-label="${T('ضيف', 'Add')}">${ICON.plus}${small ? '' : `<span>${T('ضيف', 'Add')}</span>`}</button>`;
  }
  function cardHtml(it) {
    const tag = it.tag ? `<span class="badge ${TAGS[it.tag].c}">${L(TAGS[it.tag])}</span>` : '';
    const sv = it.serves > 1 ? `<span class="serves">${T(`يكفي ${it.serves} أفراد`, `Serves ${it.serves}`)}</span>` : '';
    return `<article class="card" data-id="${it.id}" data-q="${(it.ar + ' ' + it.en + ' ' + it.dAr + ' ' + it.dEn).toLowerCase()}">
      <div class="card__img"><img src="${img(it)}" alt="${L(it)}" loading="lazy" width="640" height="640">${tag}${sv}</div>
      <div class="card__body"><h4>${L(it)}</h4><p>${D(it)}</p>
        <div class="card__foot"><b class="price">${money(it.price)}</b><span class="buy">${buyHtml(it)}</span></div></div></article>`;
  }
  function renderTabs() {
    $('#tabsIn').innerHTML = CATS.map(c => `<button class="tab" type="button" data-c="${c.id}"><small>${c.no}</small>${L(c)}</button>`).join('');
  }
  function renderMenu() {
    $('#menuBody').innerHTML = CATS.map(c => `<div class="mcat" id="cat-${c.id}" data-c="${c.id}">
      <div class="mcat__head"><h3><small>${c.no}</small>${L(c)}</h3><p>${lang === 'ar' ? c.noteAr : c.noteEn}</p></div>
      <div class="grid">${MENU.filter(m => m.cat === c.id).map(cardHtml).join('')}</div></div>`).join('');
    filterMenu();
  }
  function renderChapters() {
    $$('.chapter').forEach(sec => {
      const ids = (sec.dataset.feature || '').split(',').filter(Boolean);
      const cat = catOf(sec.dataset.cat);
      $('.chap__items', sec).innerHTML = ids.map(id => {
        const it = byId(id);
        return `<div class="mini" data-id="${id}"><img src="${img(it)}" alt="" loading="lazy"><div><h5>${L(it)}</h5><span>${money(it.price)}</span></div><span class="buy">${buyHtml(it, true)}</span></div>`;
      }).join('') + `<a class="chap__all" href="#cat-${cat.id}">${T('كل ' + cat.ar, 'All ' + cat.en)} ${ICON.arrow}</a>`;
    });
  }
  function renderSecrets() {
    $('#secretCards').innerHTML = SECRETS.map((s, i) => `<div class="rc reveal" tabindex="0" role="button"><div class="rc__in">
      <div class="rc__f"><span class="rc__n">0${i + 1}</span><p class="rc__t">${L(s)}</p><p class="rc__q">${lang === 'ar' ? s.qAr : s.qEn}</p><span class="rc__tap">${T('اقلب الكارت', 'Flip the card')} ↻</span></div>
      <div class="rc__b"><img src="assets/img/logo/leaf-c.webp" alt=""><p>${lang === 'ar' ? s.aAr : s.aEn}</p></div></div></div>`).join('');
  }
  function renderInfo() {
    const I = [
      { ic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>', t: T('مواعيد المطبخ', 'Kitchen hours'), d: L(C.hoursNum) },
      { ic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>', t: T('التوصيل', 'Delivery'), d: `${L(C.area)} · ${T('رسوم التوصيل', 'fee')} ${money(C.deliveryFee)}` },
      { ic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>', t: T('العزومات', 'Feasts'), d: T('اطلب قبلها بيوم علشان نطبخلك على مهلنا.', 'Order a day ahead so we can cook slowly for you.') }
    ];
    $('#info').innerHTML = I.map(i => `<div class="reveal">${i.ic}<p><b>${i.t}</b><span>${i.d}</span></p></div>`).join('');
  }
  function renderQuotes() {
    $('#quotes').innerHTML = REVIEWS.map(r => `<figure class="q reveal"><span class="stars">★★★★★</span><p>${lang === 'ar' ? r.ar : r.en}</p><b>${lang === 'ar' ? r.n : r.nEn}</b></figure>`).join('');
  }
  function renderFooter() {
    const msg = T('أهلاً Granny\'s Secrets، عايز أسأل عن…', "Hi Granny's Secrets, I'd like to ask about…");
    $('#finalWa').href = wa(msg); $('#footWa').href = wa(msg);
    $('#footTel').href = 'tel:' + C.phone.replace(/\s/g, ''); $('#footTel').textContent = C.phone;
    $('#footHours').textContent = L(C.hoursNum); $('#footArea').textContent = L(C.area);
    $('#year').textContent = new Date().getFullYear();
    const S = {
      instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21Z"/></svg>',
      tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.2 1.6 3.6 3.8 3.8v3a7 7 0 0 1-3.8-1.2v6.3A5.6 5.6 0 1 1 11 9.3v3.1a2.6 2.6 0 1 0 2.5 2.6V3Z"/></svg>'
    };
    $('#socials').innerHTML = Object.keys(S).map(k => `<a href="${C[k]}" aria-label="${k}" target="_blank" rel="noopener">${S[k]}</a>`).join('');
  }
  function renderAll() {
    renderMarquee(); renderToday(todayPick && todayPick.id); renderPromise(); renderTabs(); renderMenu(); renderChapters();
    renderSecrets(); renderInfo(); renderQuotes(); renderFooter(); renderCart(); fillWhen(); fillPay();
    observeReveals();
  }

  /* ---------- search ---------- */
  function filterMenu() {
    const q = ($('#search').value || '').trim().toLowerCase();
    let any = false;
    $$('.mcat').forEach(cat => {
      let n = 0;
      $$('.card', cat).forEach(c => { const ok = !q || c.dataset.q.includes(q); c.hidden = !ok; if (ok) n++; });
      cat.hidden = !n; if (n) any = true;
    });
    $('#menuEmpty').hidden = any;
  }

  /* ======================================================
     CART
     ====================================================== */
  let cart = store.get('gs-cart', []).filter(c => byId(c.id));
  let mode = 'delivery', when = 'asap';
  const saveCart = () => { store.set('gs-cart', cart); renderCart(); refreshBuys(); };
  function addToCart(id, q = 1, note = '', fromEl) {
    const key = id + '|' + note.trim();
    const line = cart.find(c => c.key === key);
    if (line) line.qty += q; else cart.push({ key, id, qty: q, note: note.trim() });
    saveCart();
    const it = byId(id);
    toast(T(`اتضاف: ${it.ar}`, `Added: ${it.en}`));
    if (fromEl) fly(fromEl, it);
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  function changeQty(id, d) {
    // change the last line of this dish
    const lines = cart.filter(c => c.id === id); const line = lines[lines.length - 1];
    if (!line) return;
    line.qty += d; if (line.qty <= 0) cart = cart.filter(c => c !== line);
    saveCart();
  }
  function totals() {
    const sub = cart.reduce((a, c) => a + byId(c.id).price * c.qty, 0);
    const fee = mode === 'delivery' && sub > 0 && sub < C.freeDeliveryOver ? C.deliveryFee : 0;
    return { sub, fee, tot: sub + fee, n: cart.reduce((a, c) => a + c.qty, 0) };
  }
  function renderCart() {
    const t = totals();
    $('#cartCount').textContent = t.n; $('#cartBtn').classList.toggle('has', t.n > 0);
    $('#obarN').textContent = t.n; $('#obarT').textContent = money(t.tot); $('#obar').classList.toggle('show', t.n > 0);
    $('#cart').classList.toggle('empty', !t.n);
    $('#cart').classList.toggle('pickup', mode === 'pickup');
    $('#cartList').innerHTML = cart.map((c, i) => {
      const it = byId(c.id);
      return `<div class="ci"><img src="${img(it)}" alt=""><div><h5>${L(it)}</h5>${c.note ? `<small>${c.note}</small>` : ''}<b class="price">${money(it.price * c.qty)}</b></div>
        <div class="step" data-line="${i}"><button type="button" data-lact="dec">−</button><b>${c.qty}</b><button type="button" data-lact="inc">+</button></div></div>`;
    }).join('');
    $('#cSub').textContent = money(t.sub); $('#cFee').textContent = t.fee ? money(t.fee) : T('مجاني', 'Free');
    $('#cTot').textContent = money(t.tot);
    const left = C.freeDeliveryOver - t.sub;
    $('#cFree').textContent = left > 0 ? T(`فاضلك ${money(left)} والتوصيل يبقى مجاني`, `${money(left)} more for free delivery`) : T('التوصيل عليك مجاني', 'Your delivery is free');
  }
  function refreshBuys() {
    $$('.buy').forEach(b => {
      const host = b.closest('[data-id]'); if (!host) return;
      const it = byId(host.dataset.id); b.innerHTML = buyHtml(it, !!b.closest('.mini'));
    });
  }
  function fly(from, it) {
    if (reduce) return;
    const f = $('#fly'), r = from.getBoundingClientRect();
    const target = isMobile() ? $('#obar') : $('#cartBtn'); const tr = target.getBoundingClientRect();
    f.style.backgroundImage = `url(${img(it)})`;
    gsap.killTweensOf(f);
    gsap.fromTo(f, { x: r.left + r.width / 2 - 27, y: r.top + r.height / 2 - 27, opacity: 1, scale: 1 },
      { x: tr.left + tr.width / 2 - 27, y: tr.top + tr.height / 2 - 27, scale: .35, duration: .8, ease: 'power2.in', onComplete: () => gsap.to(f, { opacity: 0, duration: .2 }) });
  }
  let toastT;
  function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

  function openCart(v) {
    $('#cart').classList.toggle('open', v); $('#cart').setAttribute('aria-hidden', !v);
    document.body.classList.toggle('cart-open', v); lock(v);
  }
  function lock(v) { if (lenis) v ? lenis.stop() : lenis.start(); document.documentElement.style.overflow = v ? 'hidden' : ''; }

  function fillWhen() {
    const now = new Date();
    $('#daySel').innerHTML = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() + i);
      const label = i === 0 ? T('النهارده', 'Today') : i === 1 ? T('بكرة', 'Tomorrow') : `${DAYS[lang][d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
      return `<option value="${i}">${label}</option>`;
    }).join('');
    fillTimes();
  }
  function fillTimes() {
    const day = +$('#daySel').value || 0, now = new Date();
    const opts = [];
    for (let h = 12; h <= 22; h++) for (const m of [0, 30]) {
      if (h === 22 && m === 30) continue;
      if (day === 0 && (h * 60 + m) < now.getHours() * 60 + now.getMinutes() + 75) continue;
      const hh = h > 12 ? h - 12 : h, ap = T(h < 12 ? 'ص' : 'م', h < 12 ? 'am' : 'pm');
      opts.push(`<option value="${h}:${m}">${hh}:${m ? '30' : '00'} ${ap}</option>`);
    }
    $('#timeSel').innerHTML = opts.join('') || `<option value="">${T('مفيش مواعيد النهارده، اختار بكرة', 'No slots left today, pick tomorrow')}</option>`;
  }
  function fillPay() {
    const P = [['cash', 'كاش عند الاستلام', 'Cash on delivery'], ['instapay', 'إنستاباي', 'InstaPay'], ['wallet', 'محفظة إلكترونية (فودافون كاش)', 'Mobile wallet (Vodafone Cash)']];
    const v = $('#paySel').value;
    $('#paySel').innerHTML = P.map(p => `<option value="${p[0]}">${T(p[1], p[2])}</option>`).join('');
    if (v) $('#paySel').value = v;
  }
  function sendOrder() {
    const f = $('#orderForm'), g = n => (f.elements[n].value || '').trim();
    const need = ['name', 'phone'].concat(mode === 'delivery' ? ['area', 'address'] : []);
    let bad = null;
    need.forEach(n => { const ok = !!g(n) && (n !== 'phone' || g(n).replace(/\D/g, '').length >= 10); f.elements[n].closest('.fld').classList.toggle('err', !ok); if (!ok && !bad) bad = f.elements[n]; });
    if (bad) { bad.focus(); toast(T('كمّل بياناتك علشان نقدر نوصلك', 'Please complete your details')); return; }
    const t = totals();
    const when = whenVal();
    const pay = $('#paySel').selectedOptions[0].textContent;
    const lines = cart.map(c => { const it = byId(c.id); return `${c.qty} × ${L(it)} = ${money(it.price * c.qty)}${c.note ? `\n   ${T('ملاحظة', 'Note')}: ${c.note}` : ''}`; });
    const msg = [
      T("طلب جديد من موقع Granny's Secrets", "New order from the Granny's Secrets website"),
      '',
      `${T('الاسم', 'Name')}: ${g('name')}`,
      `${T('الموبايل', 'Mobile')}: ${g('phone')}`,
      `${T('نوع الطلب', 'Type')}: ${mode === 'delivery' ? T('توصيل', 'Delivery') : T('استلام من المطبخ', 'Pickup')}`,
      mode === 'delivery' ? `${T('العنوان', 'Address')}: ${g('area')} - ${g('address')}` : null,
      `${T('الميعاد', 'Time')}: ${when}`,
      `${T('الدفع', 'Payment')}: ${pay}`,
      '',
      `— ${T('الطلب', 'Order')} —`,
      ...lines,
      '',
      `${T('الأصناف', 'Subtotal')}: ${money(t.sub)}`,
      mode === 'delivery' ? `${T('التوصيل', 'Delivery')}: ${t.fee ? money(t.fee) : T('مجاني', 'Free')}` : null,
      `${T('الإجمالي', 'Total')}: ${money(t.tot)}`,
      g('notes') ? `\n${T('ملاحظات', 'Notes')}: ${g('notes')}` : null
    ].filter(x => x !== null).join('\n');
    store.set('gs-info', { name: g('name'), phone: g('phone'), area: g('area'), address: g('address') });
    window.open(wa(msg), '_blank');
  }
  function whenVal() {
    if (when === 'asap') return T('في أقرب وقت', 'As soon as possible');
    const ds = $('#daySel').selectedOptions[0], ts = $('#timeSel').selectedOptions[0];
    return `${ds ? ds.textContent : ''} ${ts ? ts.textContent : ''}`.trim();
  }

  /* ---------- item sheet ---------- */
  let shItem = null, shQty = 1;
  function openSheet(id) {
    shItem = byId(id); shQty = 1;
    const c = catOf(shItem.cat);
    $('#shImg').src = img(shItem); $('#shImg').alt = L(shItem);
    $('#shCat').textContent = `${c.no} · ${L(c)}`;
    $('#shName').textContent = L(shItem); $('#shDesc').textContent = D(shItem);
    $('#shMeta').textContent = shItem.serves > 1 ? T(`يكفي ${shItem.serves} أفراد`, `Serves ${shItem.serves}`) : T('يكفي فرد واحد', 'Serves one');
    $('#shNote').value = ''; $('#shNote').placeholder = T('مثلاً: من غير بصل، شطة زيادة…', 'e.g. no onion, extra spicy…');
    updSheet();
    $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false');
    document.body.classList.add('sheet-open'); lock(true);
  }
  function updSheet() { $('#shQty').textContent = shQty; $('#shPrice').textContent = money(shItem.price * shQty); }
  function closeSheet() { $('#sheet').classList.remove('open'); $('#sheet').setAttribute('aria-hidden', 'true'); document.body.classList.remove('sheet-open'); lock(false); }

  /* ======================================================
     EVENTS
     ====================================================== */
  function bind() {
    document.addEventListener('click', e => {
      const t = e.target;
      const act = t.closest('[data-act]');
      if (act) {
        e.stopPropagation(); e.preventDefault();
        const id = act.dataset.id || act.closest('[data-id]').dataset.id;
        if (act.dataset.act === 'add') addToCart(id, 1, '', act);
        else if (act.dataset.act === 'inc') changeQty(id, 1);
        else changeQty(id, -1);
        return;
      }
      const card = t.closest('.card'); if (card) { openSheet(card.dataset.id); return; }
      const mini = t.closest('.mini'); if (mini) { openSheet(mini.dataset.id); return; }
      const lact = t.closest('[data-lact]');
      if (lact) {
        const i = +lact.closest('[data-line]').dataset.line, line = cart[i];
        line.qty += lact.dataset.lact === 'inc' ? 1 : -1; if (line.qty <= 0) cart.splice(i, 1); saveCart(); return;
      }
      const tab = t.closest('.tab'); if (tab) { goTo('#cat-' + tab.dataset.c, -(isMobile() ? 120 : 140)); return; }
      const wk = t.closest('.week li'); if (wk) { renderToday(DAILY[wk.dataset.d]); return; }
      const rc = t.closest('.rc'); if (rc) { rc.classList.toggle('flip'); return; }
      const a = t.closest('a[href^="#"]');
      if (a && a.getAttribute('href').length > 1) {
        e.preventDefault();
        if (a.hasAttribute('data-cclose')) openCart(false);
        document.body.classList.remove('menu-open');
        const h = a.getAttribute('href');
        goTo(h, h.startsWith('#cat-') ? -(isMobile() ? 120 : 140) : h === '#menu' ? 0 : 0);
      }
    });
    $('#cartBtn').onclick = () => openCart(true);
    $('#obar').onclick = () => openCart(true);
    $$('[data-cclose]').forEach(el => el.addEventListener('click', () => openCart(false)));
    $$('[data-close]').forEach(el => el.addEventListener('click', closeSheet));
    $('#shMinus').onclick = () => { shQty = Math.max(1, shQty - 1); updSheet(); };
    $('#shPlus').onclick = () => { shQty = Math.min(50, shQty + 1); updSheet(); };
    $('#shAdd').onclick = () => { addToCart(shItem.id, shQty, $('#shNote').value, $('#shAdd')); closeSheet(); };
    $('#todayAdd').onclick = e => addToCart(todayPick.id, 1, '', e.currentTarget);
    $('#langBtn').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; applyLang(); };
    $('#burger').onclick = () => document.body.classList.toggle('menu-open');
    $('#search').addEventListener('input', () => { filterMenu(); ScrollTrigger.refresh(); });
    $$('#modeSeg button').forEach(b => b.onclick = () => { mode = b.dataset.m; $$('#modeSeg button').forEach(x => x.classList.toggle('on', x === b)); renderCart(); });
    $$('#whenSeg button').forEach(b => b.onclick = () => { when = b.dataset.w; $$('#whenSeg button').forEach(x => x.classList.toggle('on', x === b)); $('#whenBox').hidden = when !== 'later'; });
    $('#daySel').onchange = fillTimes;
    $('#sendBtn').onclick = sendOrder;
    $('#orderForm').addEventListener('input', e => { const f = e.target.closest('.fld'); if (f) f.classList.remove('err'); });
    const info = store.get('gs-info', null);
    if (info) Object.keys(info).forEach(k => { if ($('#orderForm').elements[k]) $('#orderForm').elements[k].value = info[k] || ''; });
    addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); openCart(false); document.body.classList.remove('menu-open'); } });
  }

  /* ======================================================
     SCROLL: Lenis + canvas scenes
     ====================================================== */
  let lenis;
  const scenes = [];
  function goTo(sel, offset = 0) {
    const el = typeof sel === 'string' ? $(sel) : sel; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.5 }); else scrollTo({ top: el.getBoundingClientRect().top + scrollY + offset, behavior: 'smooth' });
  }

  function makeScene(sec) {
    const n = +sec.dataset.n, dir = sec.dataset.seq, fx = +sec.dataset.fx || .5, fy = +sec.dataset.fy || .5;
    const isHero = sec.id === 'hero';
    const cv = $('.scene__cv', sec), ctx = cv.getContext('2d', { alpha: false });
    const frames = new Array(n); let loaded = false, lastKey = -1, lastW = 0, lastH = 0, textRight = true, p = 0;
    const bar = $('.scene__bar i', sec), chap = $$('.chap > *', sec);
    function load() {
      if (loaded) return; loaded = true;
      for (let i = 0; i < n; i++) {
        const im = new Image(); im.decoding = 'async';
        im.onload = () => { frames[i] = im; lastKey = -1; if (i === 0 || Math.abs(i - Math.round(p * (n - 1))) < 3) draw(); };
        im.src = `assets/seq/${dir}/${String(i + 1).padStart(2, '0')}.webp`;
      }
    }
    function layout() {
      const ref = isHero ? $('#heroCopy') : $('.chap', sec);
      if (ref) { const r = ref.getBoundingClientRect(); textRight = r.left + r.width / 2 > innerWidth / 2; }
      lastW = 0; size();
    }
    function size() {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (w === lastW && Math.abs(h - lastH) < 120 && cv.width > 2) return; // ignore phone URL-bar jitter
      lastW = w; lastH = h;
      const dpr = Math.min(devicePixelRatio || 1, isMobile() ? 2 : 1.25);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); lastKey = -1; draw();
    }
    function geom(im) {
      const W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight;
      let s, tx, ty;
      if (isMobile()) {
        if (isHero) { s = Math.max(W * 1.95 / iw, H * .5 / ih); tx = .5; ty = .33; }
        else { s = Math.max(W / iw, H / ih) * 1.04; tx = .5; ty = .5; }
      } else {
        s = Math.max(W / iw, H / ih) * 1.1; tx = textRight ? .37 : .63; ty = .5;
      }
      const dw = iw * s, dh = ih * s;
      return { W, H, dw, dh, dx: W * tx - fx * dw, dy: H * ty - fy * dh };
    }
    function extend(g) {
      // stretch the frame's own edges into any uncovered area, so there are never bars
      const { W, H } = g; const dx = Math.round(g.dx), dy = Math.round(g.dy), r = Math.round(g.dx + g.dw), b = Math.round(g.dy + g.dh);
      if (dx > 0) ctx.drawImage(cv, dx + 1, 0, 2, H, 0, 0, dx + 1, H);
      if (r < W) ctx.drawImage(cv, r - 3, 0, 2, H, r - 1, 0, W - r + 1, H);
      if (dy > 0) ctx.drawImage(cv, 0, dy + 1, W, 2, 0, 0, W, dy + 1);
      if (b < H) ctx.drawImage(cv, 0, b - 3, W, 2, 0, b - 1, W, H - b + 1);
    }
    function draw() {
      const fp = clamp(p * 1.04) * (n - 1), i = Math.floor(fp), f = fp - i;
      let a = frames[i]; if (!a) for (let k = i; k >= 0; k--) if (frames[k]) { a = frames[k]; break; }
      if (!a) return;
      const key = i * 20 + Math.round(f * 16) + (frames[i + 1] ? 0 : 5000);
      if (key === lastKey) return; lastKey = key;
      const g = geom(a);
      ctx.fillStyle = '#1c0a0a'; ctx.fillRect(0, 0, g.W, g.H);
      ctx.drawImage(a, g.dx, g.dy, g.dw, g.dh);
      const b = frames[i + 1]; if (b && f > .03) { ctx.globalAlpha = f; ctx.drawImage(b, g.dx, g.dy, g.dw, g.dh); ctx.globalAlpha = 1; }
      extend(g);
    }
    function render(v) {
      p = v; draw();
      if (bar) bar.style.transform = `scaleX(${v})`;
      chap.forEach((el, k) => {
        const o = clamp((v - (.03 + k * .045)) / .08);
        el.style.opacity = o; el.style.transform = `translateY(${(1 - o) * 30}px)`;
      });
    }
    ScrollTrigger.create({ trigger: sec, start: 'top 300%', onEnter: load, onEnterBack: load });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: s => render(s.progress), onRefresh: s => render(s.progress) });
    if (isHero) load();
    const api = { layout, size, sec };
    scenes.push(api);
    requestAnimationFrame(layout);
    render(0);
    return api;
  }

  function heroScroll() {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: .5 } });
    tl.to('#heroCopy', { opacity: 0, y: -60, duration: .16, ease: 'none' }, .1)
      .to('.scroll-hint', { opacity: 0, duration: .05 }, 0)
      .to('.hero__steam', { opacity: 1, duration: .08 }, .28)
      .to('.hero__steam path', { strokeDashoffset: 0, duration: .25, stagger: .04, ease: 'none' }, .28)
      .fromTo('#heroSecret', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .14 }, .4)
      .to('.hero__steam', { opacity: 0, y: -60, duration: .14 }, .7)
      .to('#heroSecret', { opacity: 0, y: -40, duration: .12 }, .78)
      .fromTo('#heroFacts', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .12 }, .8)
      .to({}, { duration: .08 }, .92);
  }

  function navSpy() {
    const nav = $('#nav'), hero = $('#hero');
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY, end = hero.offsetHeight - innerHeight * .6;
      const dark = y < end;
      nav.classList.toggle('solid', !dark);
      const hide = !dark && y > lastY + 4 && !document.body.classList.contains('menu-open');
      const show = y < lastY - 4 || dark;
      if (hide) nav.classList.add('hide'); else if (show) nav.classList.remove('hide');
      document.body.classList.toggle('nav-shown', !nav.classList.contains('hide'));
      lastY = y;
    };
    if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // active tab
    $$('.mcat').forEach(m => ScrollTrigger.create({
      trigger: m, start: 'top 45%', end: 'bottom 45%',
      onToggle: s => { if (s.isActive) setTab(m.dataset.c); }
    }));
    // active nav link
    ['#today', '#menu', '#stories', '#feasts', '#secrets', '#how'].forEach(id => {
      const el = $(id); if (!el) return;
      ScrollTrigger.create({ trigger: el, start: 'top 50%', end: id === '#stories' ? () => '+=' + ($('#feasts').offsetTop - el.offsetTop) : 'bottom 50%', onToggle: s => $$('.nav__links a').forEach(a => a.classList.toggle('on', s.isActive && a.getAttribute('href') === id)) });
    });
  }
  let curTab = '';
  function setTab(c) {
    if (c === curTab) return; curTab = c;
    $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.c === c));
    const t = $(`.tab[data-c="${c}"]`), box = $('#tabsIn');
    if (t && box) {
      const tr = t.getBoundingClientRect(), br = box.getBoundingClientRect();
      box.scrollBy({ left: (tr.left + tr.width / 2) - (br.left + br.width / 2), behavior: 'smooth' });
    }
  }

  let io;
  function observeReveals() {
    if (reduce || !('IntersectionObserver' in window)) return;
    if (!io) io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal:not(.in), .card:not(.in), .mcat__head:not(.in), .sec-head:not(.in), .steps li:not(.in)').forEach(el => io.observe(el));
  }

  /* ======================================================
     LOGO ANIMATION
     ====================================================== */
  function idleLogo(root) {
    $$('.ls-st', root).forEach((s, i) => gsap.to(s, { y: -14 - i * 2, skewX: i % 2 ? 5 : -5, opacity: .45, duration: 1.5 + i * .25, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .3 }));
    gsap.to($('.ls-leaf', root), { rotate: 7, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
  function buildLogoTl(root) {
    const el = $('.ls-oval ellipse', root); el.setAttribute('pathLength', 100);
    gsap.set(el, { strokeDasharray: 100, strokeDashoffset: 100 });
    gsap.set($('.ls-plate', root), { clipPath: 'inset(0 50% 0 50%)' });
    gsap.set($$('.ls-st', root), { clipPath: 'inset(100% 0 0 0)' });
    gsap.set([$('.ls-w1', root), $('.ls-w2', root)], { opacity: 0, y: 40, filter: 'blur(10px)' });
    gsap.set($('.ls-leaf', root), { scale: 0, rotate: -50 });
    gsap.set($('.ls-tag', root), { opacity: 0, y: 14 });
    const tl = gsap.timeline({ paused: true });
    tl.to(el, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0)
      .to($('.ls-plate', root), { clipPath: 'inset(0 0% 0 0%)', duration: .8, ease: 'power3.out' }, .3)
      .to($$('.ls-st', root), { clipPath: 'inset(0% 0 0 0)', duration: .9, stagger: .12, ease: 'power2.out' }, .7)
      .to($('.ls-w1', root), { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, ease: 'power3.out' }, .9)
      .to($('.ls-w2', root), { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, ease: 'power3.out' }, 1.15)
      .to($('.ls-leaf', root), { scale: 1, rotate: 0, duration: 1, ease: 'elastic.out(1,.5)' }, 1.55)
      .to($('.ls-tag', root), { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, 1.75)
      .add(() => idleLogo(root), 1.9);
    return tl;
  }
  function intro() {
    const fast = !!sessionStorage.getItem('gs-intro');
    try { sessionStorage.setItem('gs-intro', 1); } catch (e) {}
    const logoTl = buildLogoTl($('#introLogo'));
    const tl = gsap.timeline({ onComplete: endIntro });
    tl.add(logoTl.play(), 0)
      .to('.intro__line', { opacity: 1, duration: .5 }, .8)
      .to({}, { duration: .1 }, 2.4)
      .addLabel('lift', fast ? 1.6 : 2.6)
      .to('.intro__line', { opacity: 0, duration: .3 }, 'lift')
      .to('#introLogo', { y: () => -innerHeight * .45, scale: .55, opacity: 0, duration: 1, ease: 'power3.in' }, 'lift')
      .to('.intro__paper', { yPercent: -102, borderBottomLeftRadius: '50% 18%', borderBottomRightRadius: '50% 18%', duration: 1.15, ease: 'power3.inOut' }, 'lift+=.15')
      .to('.intro__skip', { opacity: 0, duration: .3 }, 'lift')
      .add(heroIn, 'lift+=.75');
    if (fast) tl.timeScale(1.6);
    $('#introSkip').onclick = () => tl.progress(1);
    if (reduce) tl.progress(1);
  }
  let introEnded = false;
  function endIntro() {
    if (introEnded) return; introEnded = true;
    $('#intro').classList.add('done'); $('#intro').style.display = 'none';
    document.body.classList.remove('is-intro');
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }
  let heroDone = false;
  function heroIn() {
    if (heroDone) return; heroDone = true;
    const lines = $$('#heroCopy .hero__title [lang="' + lang + '"] .ln');
    gsap.from(lines, { yPercent: 110, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out', clearProps: 'transform,opacity' });
    gsap.from(['#heroCopy .kicker', '#heroCopy .hero__sub', '#heroCopy .hero__cta', '.scroll-hint'], { y: 26, opacity: 0, duration: 1, stagger: .1, delay: .25, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  function finalLogo() {
    const src = $('#introLogo');
    const box = $('#finalLogo');
    box.innerHTML = src.innerHTML;
    box.classList.add('logo-stage');
    const tl = buildLogoTl(box);
    ScrollTrigger.create({ trigger: box, start: 'top 80%', once: true, onEnter: () => tl.play() });
  }

  /* ======================================================
     BOOT
     ====================================================== */
  function boot() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }
    applyLang(true);
    bind();
    $$('.scene').forEach(makeScene);
    heroScroll();
    navSpy();
    finalLogo();
    intro();
    let lastMob = isMobile(), rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const m = isMobile();
        scenes.forEach(s => (m !== lastMob ? s.layout() : s.size()));
        if (m !== lastMob) { lastMob = m; ScrollTrigger.refresh(); }
      }, 120);
    });
    addEventListener('orientationchange', () => setTimeout(() => { scenes.forEach(s => s.layout()); ScrollTrigger.refresh(); }, 300));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
