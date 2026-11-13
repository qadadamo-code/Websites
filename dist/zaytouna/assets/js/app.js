(() => {
  const S = window.STORE, L = window.ZLOGO, doc = document.documentElement;
  const $ = (q, c = document) => c.querySelector(q), $$ = (q, c = document) => [...c.querySelectorAll(q)];
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  let lang = doc.lang === 'en' ? 'en' : 'ar';
  const T = (ar, en) => lang === 'en' ? en : ar;
  const money = n => (Math.round(n * 100) / 100).toLocaleString('en-US') + ' ₪';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  const P = Object.fromEntries(S.products.map((p, i) => [p.id, { ...p, rank: i }]));
  const CAT = Object.fromEntries(S.cats.map(c => [c.id, c]));
  const NS = 'http://www.w3.org/2000/svg';
  const pathEl = d => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); return p; };

  /* ---------- logo marks ---------- */
  $$('.lg-tree').forEach(g => { g.appendChild(pathEl(L.trunk)); L.leaves.forEach(d => g.appendChild(pathEl(d))); });

  /* ---------- icons ---------- */
  const ICONS = {
    drink: '<path d="M7 3h10l-1.2 17a1.5 1.5 0 0 1-1.5 1.4H9.7A1.5 1.5 0 0 1 8.2 20Z"/><path d="M7.4 8h9.2M12 3V1.5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
    cup: '<path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6Z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 2c0 2 2 2 2 4M12 2c0 2 2 2 2 4"/>',
    choco: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 9h14M5 15h14M12 3v18"/>',
    chips: '<path d="M6 3h12l-1 4 1 4-1 4 1 4-1 2H7l-1-2 1-4-1-4 1-4-1-4Z"/><path d="M9 10c1.5 1 4.5 1 6 0"/>',
    milk: '<path d="M8 2h8v3l2 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9l2-4Z"/><path d="M6 13h12M8 5h8"/>',
    jar: '<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M7 3h10v4H7zM9 13h6"/>',
    snow: '<path d="M12 2v20M4 6l16 12M20 6 4 18"/><path d="m9 3 3 2 3-2M9 21l3-2 3 2"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>'
  };
  const ic = n => `<svg viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;
  const arrow = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const plus = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';

  /* ---------- cart state ---------- */
  let cart = store.get('zt-cart', {});
  Object.keys(cart).forEach(k => { if (!P[k]) delete cart[k]; });
  const cartQty = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((a, [k, q]) => a + P[k].p * q, 0);
  function setQty(id, q, src) {
    const before = cart[id] || 0;
    q = Math.max(0, Math.min(99, q));
    if (q) cart[id] = q; else delete cart[id];
    store.set('zt-cart', cart);
    if (q > before && src) fly(src);
    if (q > before && !before) toast(T('انضاف للسلة: ', 'Added: ') + P[id][lang]);
    syncCards(id); renderCart();
  }

  /* ---------- i18n ---------- */
  const tEls = $$('[data-en]');
  tEls.forEach(el => el.dataset.ar = el.innerHTML);
  const phEls = $$('[data-ph-en]');
  phEls.forEach(el => el.dataset.phAr = el.getAttribute('placeholder') || '');
  function applyLang(first) {
    doc.lang = lang; doc.dir = lang === 'ar' ? 'rtl' : 'ltr';
    tEls.forEach(el => el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.ar);
    phEls.forEach(el => el.setAttribute('placeholder', lang === 'en' ? el.dataset.phEn : el.dataset.phAr));
    $$('[data-phone]').forEach(el => el.textContent = S.phoneDisplay);
    $$('[data-email]').forEach(el => el.textContent = S.email);
    document.title = T('الزيتونة ماركت | كل شي للبيت بمكان واحد – بيت جالا', 'Al Zaytouna Market | Everything for home, in one place – Beit Jala');
    renderMarquee(); renderDir(); renderChips(); renderGrid(true); renderPicks(); renderCart();
    if (!first) { splitAll(); ScrollTrigger && ScrollTrigger.refresh(); }
  }
  $('#langBtn').addEventListener('click', () => { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('zt-lang', lang); } catch (e) {} applyLang(); });

  /* ---------- theme ---------- */
  function setThemeColor() { $('meta[name=theme-color]').setAttribute('content', doc.dataset.theme === 'dark' ? '#08180F' : '#F6F0DC'); }
  setThemeColor();
  $('#themeBtn').addEventListener('click', () => {
    doc.dataset.theme = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('zt-theme', doc.dataset.theme); } catch (e) {}
    setThemeColor();
  });

  /* ---------- links ---------- */
  const waLink = msg => 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(msg);
  const WA = {
    hello: () => T('مرحبا الزيتونة ماركت 👋 حابب أطلب/أستفسر عن:', 'Hi Al Zaytouna Market 👋 I would like to order / ask about:'),
    bills: () => T('مرحبا 👋 بدي أدفع فاتورة عندكم. شو الفواتير اللي بتستقبلوها؟', 'Hi 👋 I would like to pay a bill. Which bills do you accept?'),
    topup: () => T('مرحبا 👋 بدي أشحن رصيد لرقمي، شو المتوفر؟', 'Hi 👋 I would like to top up my mobile line. What is available?')
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-wa],[data-tel],[data-mail],[data-map],[data-fb],[data-ig]');
    if (!a) return;
    e.preventDefault();
    let url;
    if (a.dataset.wa !== undefined) url = waLink(WA[a.dataset.wa || 'hello']());
    else if (a.dataset.tel !== undefined) { location.href = 'tel:' + S.phone; return; }
    else if (a.dataset.mail !== undefined) { location.href = 'mailto:' + S.email; return; }
    else if (a.dataset.map !== undefined) url = S.map;
    else if (a.dataset.fb !== undefined) url = S.facebook;
    else url = 'https://instagram.com/' + S.instagram;
    window.open(url, '_blank', 'noopener');
  });

  /* ---------- header ---------- */
  const hd = $('#hd'); let lastY = 0;
  function onScroll(y) {
    hd.classList.toggle('solid', y > 60);
    hd.classList.toggle('hide', y > lastY + 4 && y > 500 && !doc.classList.contains('nav-open'));
    if (y < lastY - 4) hd.classList.remove('hide');
    lastY = y;
    $('#fab').classList.toggle('show', cartQty() > 0 && y > 400);
  }
  $('#burger').addEventListener('click', () => doc.classList.toggle('nav-open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => doc.classList.remove('nav-open')));

  /* ---------- marquee ---------- */
  function renderMarquee() {
    const leaf = `<svg viewBox="0 0 780 600"><path d="${L.leaves[8]}" transform="translate(-200 -60) scale(1.6)"/></svg>`;
    const words = lang === 'en'
      ? ['Shopping', 'Bill payments', 'Mobile top-up', 'Al Zaytouna.. makes it all better!', 'Order on WhatsApp', 'Beit Jala']
      : ['تسوّق', 'دفع فواتير', 'شحن رصيد', 'الزيتونة.. بتفش الغل!', 'اطلب عالواتساب', 'بيت جالا'];
    const one = words.map(w => `<span>${w}<svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:var(--gold2);stroke:none"><path d="M12 2c4 3 6 7 4 12-1 3-3 5-4 8-1-3-3-5-4-8-2-5 0-9 4-12Z"/></svg></span>`).join('');
    $('#mq').innerHTML = one + one + one + one;
  }

  /* ---------- directory ---------- */
  function renderDir() {
    $('#dirGrid').innerHTML = S.cats.map((c, i) => {
      const items = S.products.filter(p => p.c === c.id);
      const pics = items.slice(0, 3).map((p, j) => `<img src="assets/img/p/${p.id}.webp" alt="" loading="lazy" style="--rt:${[-8, 4, 10][j]}deg">`).join('');
      return `<article class="dir" data-go="${c.id}" tabindex="0">
        <div class="dir-top"><span class="dir-no">${T('ممر', 'AISLE')} ${c.aisle}</span><span class="dir-ic">${ic(c.icon)}</span></div>
        <div class="dir-txt"><h3>${c[lang]}</h3><p>${items.length} ${T('صنف', 'items')}</p><span class="dir-go">${T('ادخل الممر', 'Enter aisle')} ${arrow}</span></div>
        <div class="dir-stack">${pics}</div>
      </article>`;
    }).join('');
    $$('.dir').forEach(d => {
      const go = () => { cur = d.dataset.go; shown = PAGE; renderChips(); renderGrid(); scrollToEl('#shop'); };
      d.addEventListener('click', go);
      d.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    });
  }

  /* ---------- shop ---------- */
  let cur = 'all', q = '', sort = 'pop';
  const PAGE = innerWidth < 760 ? 12 : 20; let shown = PAGE;
  function renderChips() {
    const all = [{ id: 'all', ar: 'كل الممرات', en: 'All aisles', n: S.products.length }].concat(S.cats.map(c => ({ ...c, n: S.products.filter(p => p.c === c.id).length })));
    $('#chips').innerHTML = all.map(c => `<button class="chip${c.id === cur ? ' on' : ''}" data-cat="${c.id}">${c.icon ? ic(c.icon).replace('<svg', '<svg width="16" height="16"') : ''}${c[lang]} <small>${c.n}</small></button>`).join('');
    $$('#chips .chip').forEach(b => b.addEventListener('click', () => {
      cur = b.dataset.cat; shown = PAGE; renderChips(); renderGrid();
      b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }));
  }
  const norm = s => s.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  function filtered(query = q, cat = cur) {
    const nq = norm(query.trim());
    let list = S.products.filter(p => (cat === 'all' || p.c === cat) && (!nq || norm(p.ar + ' ' + p.en + ' ' + CAT[p.c].ar + ' ' + CAT[p.c].en).includes(nq)));
    if (sort === 'low') list = [...list].sort((a, b) => a.p - b.p);
    if (sort === 'high') list = [...list].sort((a, b) => b.p - a.p);
    if (sort === 'pop') list = [...list].sort((a, b) => (!!b.tag - !!a.tag) || (P[a.id].rank - P[b.id].rank));
    return list;
  }
  const tagName = { hot: ['الأكثر طلبًا', 'Best seller'], new: ['وصل جديد', 'Just in'], value: ['توفير', 'Great value'] };
  function ctrl(id) {
    const n = cart[id] || 0;
    return n ? `<div class="qty" data-id="${id}"><button type="button" data-d="-1" aria-label="-">−</button><output>${n}</output><button type="button" data-d="1" aria-label="+">+</button></div>`
      : `<button class="add" type="button" data-add="${id}">${plus}<span>${T('أضف', 'Add')}</span></button>`;
  }
  function card(p) {
    return `<article class="card" data-id="${p.id}">
      ${p.tag ? `<span class="badge ${p.tag}">${T(...tagName[p.tag])}</span>` : ''}
      <div class="card-media" data-qv="${p.id}"><img src="assets/img/p/${p.id}.webp" alt="${p[lang]}" loading="lazy" width="392" height="392"></div>
      <div class="card-body">
        <span class="card-aisle">${T('ممر', 'Aisle')} ${CAT[p.c].aisle} · ${CAT[p.c][lang]}</span>
        <h3>${p[lang]}</h3>
        <span class="card-size"><bdi dir="ltr">${p.s}</bdi></span>
        <div class="card-ft"><span class="price">${p.p}<small>₪</small></span><span class="ctl">${ctrl(p.id)}</span></div>
      </div>
    </article>`;
  }
  function renderGrid(keep) {
    const list = filtered();
    const g = $('#grid');
    g.innerHTML = list.length ? list.slice(0, shown).map(card).join('') : `<p class="empty-res">${T('ما لقينا شي بهالاسم.. جرّب كلمة ثانية أو اسألنا عالواتساب.', 'Nothing found. Try another word, or ask us on WhatsApp.')}</p>`;
    $('#resCount').textContent = list.length + ' ' + T('صنف', 'items');
    $('#moreBtn').parentElement.classList.toggle('hide', list.length <= shown);
    if (hasG && !reduce && !keep) gsap.fromTo($$('.card', g), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'expo.out', stagger: .03, clearProps: 'transform' });
    ScrollTrigger && ScrollTrigger.refresh();
  }
  function syncCards(id) {
    $$(`.card[data-id="${id}"] .ctl, .pk[data-id="${id}"] .ctl`).forEach(el => {
      if (el.closest('.pk')) el.innerHTML = ctrlPk(id); else el.innerHTML = ctrl(id);
    });
  }
  // delegated grid events
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { const id = add.dataset.add; const img = add.closest('.card,.pk')?.querySelector('img'); setQty(id, (cart[id] || 0) + 1, img); return; }
    const d = e.target.closest('.qty[data-id] button');
    if (d) { const id = d.parentElement.dataset.id; const img = d.closest('.card,.pk,.ci-row')?.querySelector('img'); setQty(id, (cart[id] || 0) + +d.dataset.d, +d.dataset.d > 0 && !d.closest('.ci-row') ? img : null); return; }
    const qv = e.target.closest('[data-qv]:not(button)');
    if (qv) openQV(qv.dataset.qv);
  });
  $('#moreBtn').addEventListener('click', () => { shown += PAGE; renderGrid(true); });
  let qt; $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { q = e.target.value; shown = PAGE; renderGrid(); }, 160); });
  $('#sort').addEventListener('change', e => { sort = e.target.value; renderGrid(); });

  /* ---------- picks ---------- */
  function ctrlPk(id) { const n = cart[id] || 0; return n ? `<div class="qty" data-id="${id}"><button type="button" data-d="-1">−</button><output>${n}</output><button type="button" data-d="1">+</button></div>` : `<button class="add" type="button" data-add="${id}" aria-label="add">${plus}</button>`; }
  function renderPicks() {
    const list = S.products.filter(p => p.tag === 'hot');
    $('#pkRail').innerHTML = list.map(p => `<article class="pk" data-id="${p.id}"><img src="assets/img/p/${p.id}.webp" alt="${p[lang]}" loading="lazy" data-qv="${p.id}"><div class="pk-b"><div><h3>${p[lang]}</h3><p>${p.p} ₪</p></div><span class="ctl">${ctrlPk(p.id)}</span></div></article>`).join('');
  }
  const rail = $('#pkRail');
  const dirSign = () => lang === 'ar' ? -1 : 1;
  $('#pkNext').addEventListener('click', () => rail.scrollBy({ left: 340 * dirSign(), behavior: 'smooth' }));
  $('#pkPrev').addEventListener('click', () => rail.scrollBy({ left: -340 * dirSign(), behavior: 'smooth' }));
  // drag to scroll
  (() => { let down = false, sx = 0, sl = 0, moved = false; rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; }); addEventListener('pointerup', () => { down = false; }); rail.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true; rail.scrollLeft = sl - dx; }); rail.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true); })();

  /* ---------- quick view ---------- */
  let qvId = null, qvQ = 1;
  function openQV(id) {
    const p = P[id]; qvId = id; qvQ = cart[id] || 1;
    $('#qvImg').src = `assets/img/p/${id}.webp`; $('#qvImg').alt = p[lang];
    $('#qvAisle').textContent = T('ممر', 'Aisle') + ' ' + CAT[p.c].aisle + ' · ' + CAT[p.c][lang];
    $('#qvName').textContent = p[lang]; $('#qvSize').innerHTML = '<bdi dir="ltr">' + p.s + '</bdi>';
    $('#qvPrice').textContent = money(p.p); $('#qvQty').textContent = qvQ;
    $('#qvAdd span').textContent = cart[id] ? T('حدّث السلة', 'Update basket') : T('أضف للسلة', 'Add to basket');
    $('#qv').classList.add('open'); lockScroll(true);
  }
  function closeQV() { $('#qv').classList.remove('open'); lockScroll(false); }
  $$('[data-qv="-"],[data-qv="+"]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); qvQ = Math.max(1, Math.min(99, qvQ + (b.dataset.qv === '+' ? 1 : -1))); $('#qvQty').textContent = qvQ; }));
  $('#qvAdd').addEventListener('click', () => { const img = $('#qvImg'); setQty(qvId, qvQ, img); closeQV(); });
  $('#qvClose').addEventListener('click', closeQV);
  $('#qv').addEventListener('click', e => { if (e.target.id === 'qv') closeQV(); });

  /* ---------- cart drawer ---------- */
  function renderCart() {
    const n = cartQty(), tot = cartTotal();
    $('#cartCount').textContent = n; $('#fabCount').textContent = n; $('#fabTotal').textContent = money(tot);
    $('#drCount').textContent = n ? `(${n} ${T('قطعة', 'items')})` : '';
    $('#drawer').classList.toggle('is-empty', !n);
    $('#drTotal').textContent = money(tot);
    $('#drBody').innerHTML = Object.entries(cart).map(([id, qn]) => { const p = P[id]; return `<div class="ci-row"><img src="assets/img/p/${id}.webp" alt=""><div><h4>${p[lang]}</h4><p><bdi dir="ltr">${p.s}</bdi> · ${p.p} ₪</p></div><div><div class="qty" data-id="${id}"><button type="button" data-d="-1">−</button><output>${qn}</output><button type="button" data-d="1">+</button></div><p class="lt">${money(p.p * qn)}</p></div></div>`; }).join('');
    $('#fab').classList.toggle('show', n > 0 && scrollY > 400);
  }
  function openCart() { doc.classList.add('cart-open'); lockScroll(true); }
  function closeCart() { doc.classList.remove('cart-open'); lockScroll(false); }
  $('#cartBtn').addEventListener('click', openCart); $('#fab').addEventListener('click', openCart);
  $('#drClose').addEventListener('click', closeCart); $('#scrim').addEventListener('click', closeCart);
  $$('[data-close]').forEach(a => a.addEventListener('click', closeCart));
  $('#drClear').addEventListener('click', () => { cart = {}; store.set('zt-cart', cart); Object.keys(P).forEach(syncCards); renderCart(); });
  const form = $('#drForm');
  const draft = store.get('zt-form', {});
  ['name', 'addr', 'note'].forEach(k => { if (draft[k]) form[k].value = draft[k]; });
  if (draft.mode) form.querySelector(`[value=${draft.mode}]`).checked = true;
  function modeSync() { const del = form.mode.value === 'delivery'; form.addr.style.display = del ? '' : 'none'; form.addr.required = del; }
  form.addEventListener('change', modeSync); modeSync();
  form.addEventListener('input', () => store.set('zt-form', { name: form.name.value, addr: form.addr.value, note: form.note.value, mode: form.mode.value }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const lines = Object.entries(cart).map(([id, qn], i) => `${i + 1}) ${P[id][lang]} (${P[id].s}) × ${qn} = ${money(P[id].p * qn)}`);
    const del = form.mode.value === 'delivery';
    const msg = [
      T('مرحبا الزيتونة ماركت 👋', 'Hi Al Zaytouna Market 👋'),
      T('طلب جديد من الموقع 🛒', 'New order from the website 🛒'),
      '',
      ...lines,
      '',
      T('المجموع التقريبي: ', 'Estimated total: ') + money(cartTotal()),
      T('الاسم: ', 'Name: ') + form.name.value.trim(),
      T('طريقة الاستلام: ', 'Receive by: ') + (del ? T('توصيل للبيت', 'Home delivery') : T('استلام من المحل', 'Store pick-up')),
      del ? T('العنوان: ', 'Address: ') + form.addr.value.trim() : '',
      form.note.value.trim() ? T('ملاحظات: ', 'Notes: ') + form.note.value.trim() : ''
    ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i > 0)).join('\n');
    window.open(waLink(msg), '_blank', 'noopener');
  });

  /* ---------- search overlay ---------- */
  const sov = $('#sov');
  function openSearch() { sov.classList.add('open'); lockScroll(true); setTimeout(() => $('#sq').focus(), 200); renderSres(''); }
  function closeSearch() { sov.classList.remove('open'); lockScroll(false); }
  function renderSres(v) {
    const list = v.trim() ? filtered(v, 'all') : S.products.filter(p => p.tag).slice(0, 12);
    $('#sres').innerHTML = list.slice(0, 24).map(p => `<div class="sres" data-sid="${p.id}"><img src="assets/img/p/${p.id}.webp" alt="" loading="lazy"><div>${p[lang]}<b>${p.p} ₪</b></div></div>`).join('') || `<p class="empty-res">${T('ما في نتائج', 'No results')}</p>`;
  }
  $('#searchBtn').addEventListener('click', openSearch);
  $('#sovClose').addEventListener('click', closeSearch);
  $('#sq').addEventListener('input', e => renderSres(e.target.value));
  $('#sres').addEventListener('click', e => { const s = e.target.closest('[data-sid]'); if (s) { closeSearch(); openQV(s.dataset.sid); } });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeQV(); closeCart(); closeSearch(); doc.classList.remove('nav-open'); } if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); } });

  /* ---------- fly to cart + toast ---------- */
  function fly(img) {
    const btn = innerWidth < 760 && $('#fab').classList.contains('show') ? $('#fab') : $('#cartBtn');
    const tgt = btn.getBoundingClientRect();
    btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
    if (!img || reduce || !hasG) return;
    const r = img.getBoundingClientRect();
    const c = img.cloneNode(); c.className = 'fly'; c.removeAttribute('loading');
    Object.assign(c.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    document.body.appendChild(c);
    gsap.to(c, { left: tgt.left + tgt.width / 2 - 20, top: tgt.top + tgt.height / 2 - 20, width: 40, height: 40, borderRadius: 20, opacity: .3, duration: .8, ease: 'power3.in', onComplete: () => c.remove() });
  }
  let tt; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800); }

  /* ---------- scroll helpers ---------- */
  let lenis = null;
  function lockScroll(on) { doc.classList.toggle('no-scroll', on); if (lenis) on ? lenis.stop() : lenis.start(); }
  function scrollToEl(sel) { const el = $(sel); if (lenis) lenis.scrollTo(el, { offset: -10 }); else el.scrollIntoView({ behavior: 'smooth' }); }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h.length > 1 && $(h)) { e.preventDefault(); scrollToEl(h); } }));

  /* ---------- split text ---------- */
  function splitAll() {
    $$('.split').forEach(el => {
      const txt = el.textContent.trim();
      el.innerHTML = txt.split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      if (hasG && !reduce) gsap.fromTo($$('.w>span', el), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
  }

  /* ---------- intro: the doors ---------- */
  function buildIntroTree() {
    const svg = $('.intro-tree');
    const gt = $('.i-trunk', svg), gl = $('.i-leaves', svg), gw = $('.i-word', svg);
    gt.appendChild(pathEl(L.trunk)); L.leaves.forEach(d => gl.appendChild(pathEl(d))); gw.appendChild(pathEl(L.word));
    return { gt, gl, gw };
  }
  function runIntro(done) {
    const intro = $('#intro');
    const seen = sessionStorage.getItem('zt-intro');
    if (!hasG || reduce) { intro.remove(); done(); return; }
    const { gt, gl, gw } = buildIntroTree();
    const leaves = $$('path', gl);
    leaves.forEach(p => { const b = p.getBBox(); p.style.transformOrigin = `${b.x + b.width / 2}px ${b.y + b.height}px`; });
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { intro.remove(); } });
    const fast = !!seen;
    tl.set(gt, { clipPath: 'inset(100% 0 0 0)' })
      .to(gt, { clipPath: 'inset(0% 0 0 0)', duration: fast ? .5 : 1.1, ease: 'power3.inOut' }, .15)
      .from(leaves, { scale: 0, opacity: 0, rotate: () => gsap.utils.random(-40, 40), duration: fast ? .5 : .8, ease: 'back.out(2.2)', stagger: { each: fast ? .006 : .018, from: 'start' } }, fast ? .35 : .7)
      .from(gw, { y: 40, opacity: 0, duration: .8 }, fast ? .6 : 1.4)
      .to('.intro-line', { opacity: 1, duration: .8 }, fast ? .7 : 1.7)
      .to('.intro-center', { scale: .9, opacity: 0, duration: .6, ease: 'power2.in' }, fast ? 1.4 : 2.9)
      .add(() => { intro.classList.add('done'); done(); }, fast ? 1.6 : 3.1)
      .to('.door-r', { xPercent: lang === 'ar' ? 105 : 105, duration: 1.4, ease: 'expo.inOut' }, fast ? 1.5 : 3.0)
      .to('.door-l', { xPercent: -105, duration: 1.4, ease: 'expo.inOut' }, '<')
      .to('.intro-skip', { opacity: 0, duration: .3 }, '<');
    $('.intro-skip').addEventListener('click', () => tl.progress(.999));
    sessionStorage.setItem('zt-intro', 1);
  }

  /* ---------- hero + scroll animations ---------- */
  function heroIn() {
    const v = $('#heroVid'); v.play && v.play().catch(() => {});
    if (!hasG || reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('.hero-media video', { scale: 1.3 }, { scale: 1.12, duration: 2.4 }, 0)
      .from('.eyebrow', { y: 20, opacity: 0, duration: 1 }, .2)
      .from('.hero-h .ln>*', { yPercent: 110, duration: 1.3, stagger: .12 }, .3)
      .from('.hero-p', { y: 24, opacity: 0, duration: 1 }, .6)
      .from('.hero-cta .btn', { y: 24, opacity: 0, duration: 1, stagger: .1 }, .75)
      .from('.hero-stats li', { y: 20, opacity: 0, duration: 1, stagger: .1 }, .9)
      .from('.fl', { y: 120, opacity: 0, rotate: 0, duration: 1.6, stagger: .15 }, .6);
    $$('.count').forEach(el => { const o = { v: 0 }; gsap.to(o, { v: +el.dataset.to, duration: 2, delay: 1, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }); });
  }
  function scrollFX() {
    if (!hasG || reduce) return;
    gsap.to('.hero-media video', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-in', { y: -60, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
    $$('.fl').forEach((f, i) => gsap.to(f, { y: -120 - i * 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
    ScrollTrigger.batch('.dir', { start: 'top 90%', onEnter: b => gsap.fromTo(b, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .08 }), once: true });
    gsap.from('.steps li', { y: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
    gsap.fromTo('.band-vid', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.svc', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.svc-grid', start: 'top 85%' } });
    gsap.from('.sl-h span, .sl-h em', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.slogan', start: 'top 70%' } });
    gsap.fromTo('.sl-media video', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.slogan', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.visit-media', { clipPath: 'inset(12% 12% 12% 12% round 30px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.visit', start: 'top 75%' } });
    gsap.from('.contact-list li', { x: lang === 'ar' ? -30 : 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.contact-list', start: 'top 88%' } });
    gsap.from('.pk', { x: lang === 'ar' ? -80 : 80, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.pk-rail', start: 'top 85%' } });
  }
  // pause offscreen videos
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' });
  $$('video').forEach(v => vio.observe(v));

  /* ---------- boot ---------- */
  $('#yr').textContent = new Date().getFullYear();
  applyLang(true);
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', e => { onScroll(e.scroll); ScrollTrigger && ScrollTrigger.update(); });
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  } else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  lockScroll(true);
  runIntro(() => { lockScroll(false); heroIn(); });
  splitAll(); scrollFX(); onScroll(scrollY);
})();
