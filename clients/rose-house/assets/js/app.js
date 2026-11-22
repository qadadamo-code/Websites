/* Rose House Furniture — UI */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const C = RH.config;
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const catName = id => (RH.cats.find(c => c.id === id) || {}).name || '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- images with fallback ---------- */
  const src = (u, w = 900) => /^(assets|https?:)/.test(u) ? u : `https://images.unsplash.com/photo-${u}?auto=format&fit=crop&w=${w}&q=70`;
  function loadImg(img) {
    const w = +img.dataset.w || 900;
    const tried = (img._tried = img._tried || []);
    const first = img.dataset.u;
    const pool = [first, ...(RH.pool[img.dataset.cat] || []), ...RH.pool.any];
    const next = pool.find(u => u && !tried.includes(u));
    if (!next || tried.length > 4) { img.closest('.ph')?.classList.add('fail'); img.remove(); return; }
    tried.push(next);
    img.src = src(next, w);
  }
  function hookImg(img) {
    if (img._hooked) return; img._hooked = true;
    img.decoding = 'async';
    img.addEventListener('load', () => img.classList.add('ok'));
    img.addEventListener('error', () => loadImg(img));
    loadImg(img);
  }
  const ph = (u, cat, w = 900, cls = '', lazy = true) => `<div class="ph ${cls}"><img data-u="${u}" data-cat="${cat}" data-w="${w}" ${lazy ? 'loading="lazy"' : ''} alt=""></div>`;
  const hookAll = (root = document) => $$('img[data-u]', root).forEach(hookImg);

  /* ---------- whatsapp links ---------- */
  const wa = msg => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-wa]');
    if (a) { e.preventDefault(); window.open(wa(a.dataset.wa), '_blank', 'noopener'); }
  });
  $('#infoAddr').textContent = C.address;
  $('#infoHours').textContent = C.hours;
  $('#infoPhone').textContent = C.phone; $('#infoPhone').href = 'tel:' + C.phone;
  $('#callBtn').href = 'tel:' + C.phone;
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- marquee ---------- */
  const mq = ['ركنات', 'أنتريهات', 'غرف نوم', 'سفرة', 'تسريحات', 'مكاتب', 'جلسات خارجية', 'تفصيل على المقاس', 'توصيل وتركيب'];
  $('#marquee').innerHTML = [...mq, ...mq, ...mq].map(t => `<span>${t}</span>`).join('');

  /* ---------- worlds + cats ---------- */
  const countIn = cat => RH.products.filter(p => p.cat === cat).length;
  $('#worldsGrid').innerHTML = RH.worlds.map(w => `
    <article class="world rv" data-world="${w.id}">
      ${ph(w.img, w.id === 'home' ? 'living' : w.id, 1100)}
      <span class="world__en">${w.en}</span>
      <div class="world__body"><h3>${w.name}</h3><p>${w.line}</p><span class="world__go">تسوّق القسم <i>←</i></span></div>
    </article>`).join('');
  $('#catsGrid').innerHTML = RH.cats.map(c => `
    <button class="cat rv" data-cat="${c.id}">${ph(c.img, c.id, 200)}<span><b>${c.name}</b><small>${countIn(c.id)} موديل</small></span></button>`).join('');
  $('#footCats').innerHTML = RH.cats.slice(0, 7).map(c => `<li><a href="#shop" data-cat="${c.id}">${c.name}</a></li>`).join('');

  /* ---------- shop ---------- */
  let state = { cat: 'all', q: '', sort: 'feat', limit: 12, all: false };
  $('#more').addEventListener('click', () => { state.all = true; renderGrid(); });
  const chips = [{ id: 'all', name: 'الكل' }, ...RH.cats];
  $('#chips').innerHTML = chips.map(c => `<button class="chip${c.id === 'all' ? ' is-on' : ''}" data-chip="${c.id}">${c.name}<small>${c.id === 'all' ? RH.products.length : countIn(c.id)}</small></button>`).join('');

  const heart = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  function card(p) {
    const sale = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
    const badge = p.badge ? `<span class="badge${/خصم/.test(p.badge) ? ' sale' : ''}">${p.badge}</span>` : (sale ? `<span class="badge sale">خصم ${sale}%</span>` : '');
    return `<article class="card" data-id="${p.id}">
      <div class="card__media" data-quick="${p.id}">
        ${badge}
        <button class="wish${wish.has(p.id) ? ' is-on' : ''}" data-wish="${p.id}" aria-label="أضف للمفضلة">${heart}</button>
        <div class="ph" style="position:absolute;inset:0"><img data-u="${p.img[0]}" data-cat="${p.cat}" data-w="700" loading="lazy" alt="${p.name}">${p.img[1] ? `<img class="alt" data-u="${p.img[1]}" data-cat="${p.cat}" data-w="700" loading="lazy" alt="">` : ''}</div>
        <button class="card__quick">عرض سريع</button>
      </div>
      <div class="card__body">
        <span class="card__cat">${catName(p.cat)}</span>
        <h3>${p.name}</h3>
        <div class="card__dots">${p.colors.slice(0, 5).map(c => `<i style="--c:${RH.colors[c] || '#ccc'}" title="${c}"></i>`).join('')}</div>
        <div class="card__row">
          <div class="price">${p.old ? `<s>${fmt(p.old)} ج.م</s>` : ''}${fmt(p.price)} <small>ج.م</small></div>
          <button class="add" data-add="${p.id}" aria-label="أضف للسلة"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
      </div>
    </article>`;
  }
  function renderGrid(animate = true) {
    let list = RH.products.filter(p => (state.cat === 'all' || p.cat === state.cat) &&
      (!state.q || (p.name + catName(p.cat) + p.material + p.desc).includes(state.q)));
    if (state.sort === 'low') list.sort((a, b) => a.price - b.price);
    if (state.sort === 'high') list.sort((a, b) => b.price - a.price);
    if (state.sort === 'fast') list.sort((a, b) => a.days - b.days);
    const g = $('#grid');
    const total = list.length;
    if (!state.all) list = list.slice(0, state.limit);
    g.innerHTML = list.map(card).join('');
    $('#more').hidden = state.all || total <= state.limit;
    $('#more').textContent = `عرض كل الموديلات (${total})`;
    $('#empty').hidden = list.length > 0;
    hookAll(g);
    if (animate && window.gsap && !reduce) gsap.fromTo(g.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: 'power3.out', overwrite: true });
    window.ScrollTrigger && ScrollTrigger.refresh();
  }
  function setCat(id, scroll) {
    state.cat = id; state.all = false;
    $$('.chip').forEach(c => c.classList.toggle('is-on', c.dataset.chip === id));
    renderGrid();
    if (scroll) goTo('#shop');
  }
  $('#chips').addEventListener('click', e => { const c = e.target.closest('[data-chip]'); if (c) setCat(c.dataset.chip); });
  let qT; $('#search').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => { state.q = e.target.value.trim(); renderGrid(); }, 200); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });
  document.addEventListener('click', e => {
    const c = e.target.closest('.cat[data-cat], .footer [data-cat]');
    if (c) { e.preventDefault(); setCat(c.dataset.cat, true); return; }
    const w = e.target.closest('[data-world]');
    if (w) { const first = RH.cats.find(c => c.world === w.dataset.world); setCat(w.dataset.world === 'home' ? 'all' : first.id, true); }
  });

  /* ---------- storage (cart + wishlist) ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  let cart = store.get('rh-cart', []);
  const wish = new Set(store.get('rh-wish', []));
  const byId = id => RH.products.find(p => p.id === id);
  function badgeCount(el, n) { el.textContent = n; el.classList.toggle('has', n > 0); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function saveCart() { store.set('rh-cart', cart); badgeCount($('#cartCount'), cart.reduce((s, i) => s + i.q, 0)); }
  function saveWish() { store.set('rh-wish', [...wish]); badgeCount($('#wishCount'), wish.size); }
  function addToCart(id, q = 1, color) {
    const p = byId(id); color = color || p.colors[0];
    const ex = cart.find(i => i.id === id && i.color === color);
    ex ? ex.q += q : cart.push({ id, q, color });
    saveCart(); toast(`اتضافت «${p.name}» للسلة`);
  }
  function toggleWish(id, btn) {
    wish.has(id) ? wish.delete(id) : wish.add(id);
    $$(`[data-wish="${id}"]`).forEach(b => b.classList.toggle('is-on', wish.has(id)));
    saveWish(); if (wish.has(id)) toast('اتضافت للمفضلة ♥');
    if (btn && window.gsap) gsap.fromTo(btn, { scale: .6 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' });
    if ($('#drawer').classList.contains('is-open') && drawerMode === 'wish') renderDrawer();
  }
  saveCart(); saveWish();

  let tT; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('is-on'); clearTimeout(tT); tT = setTimeout(() => el.classList.remove('is-on'), 2200); }

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]'); if (add) { e.stopPropagation(); addToCart(add.dataset.add); flyToCart(add); return; }
    const wb = e.target.closest('[data-wish]'); if (wb) { e.stopPropagation(); toggleWish(wb.dataset.wish, wb); return; }
    const q = e.target.closest('[data-quick]'); if (q) { openQuick(q.dataset.quick); }
  });
  function flyToCart(from) {
    if (!window.gsap || reduce) return;
    const a = from.getBoundingClientRect(), b = $('#openCart').getBoundingClientRect();
    const dot = document.createElement('i');
    dot.style.cssText = `position:fixed;z-index:150;width:16px;height:16px;border-radius:50%;background:#d7141e;left:${a.left + a.width / 2 - 8}px;top:${a.top + a.height / 2 - 8}px;pointer-events:none`;
    document.body.appendChild(dot);
    gsap.to(dot, { x: b.left - a.left, y: b.top - a.top, scale: .4, duration: .8, ease: 'power2.in', onComplete: () => dot.remove() });
  }

  /* ---------- quick view ---------- */
  function openQuick(id) {
    const p = byId(id); if (!p) return;
    let qty = 1, color = p.colors[0];
    $('#qv').innerHTML = `
      <div class="qv__media">${ph(p.img[0], p.cat, 1200, 'qv-main', false)}
        <div class="qv__thumbs">${p.img.map((u, i) => `<button class="${i ? '' : 'is-on'}" data-img="${u}">${ph(u, p.cat, 200)}</button>`).join('')}</div>
      </div>
      <div class="qv__info">
        <span class="card__cat">${catName(p.cat)}${p.badge ? ' · ' + p.badge : ''}</span>
        <h3>${p.name}</h3>
        <div class="price">${p.old ? `<s>${fmt(p.old)} ج.م</s>` : ''}${fmt(p.price)} <small>ج.م</small></div>
        <p class="qv__desc">${p.desc}</p>
        <div><b style="font-size:14px">اللون: <span id="qvColor">${color}</span></b><div class="swatches">${p.colors.map((c, i) => `<button class="sw${i ? '' : ' is-on'}" style="--c:${RH.colors[c]}" data-c="${c}" title="${c}"></button>`).join('')}</div></div>
        <dl class="specs">
          <div><dt>المقاسات</dt><dd>${p.dims}</dd></div>
          <div><dt>الخامات</dt><dd>${p.material}</dd></div>
          <div><dt>مدة التنفيذ</dt><dd>${p.days} يوم عمل</dd></div>
          ${p.seats ? `<div><dt>عدد المقاعد</dt><dd>${p.seats} أفراد</dd></div>` : ''}
          <div><dt>الضمان</dt><dd>15 سنة على الهيكل — سنتين على القماش والإسفنج</dd></div>
        </dl>
        <div class="qv__actions">
          <div class="qty"><button data-q="1">+</button><span id="qvQty">1</span><button data-q="-1">−</button></div>
          <button class="btn btn--red" id="qvAdd">أضف للسلة</button>
          <button class="btn btn--ghost" id="qvWa">اطلب على واتساب</button>
        </div>
        <p class="qv__note">المقاسات والألوان قابلة للتعديل حسب طلبك بدون تكلفة إضافية في أغلب الموديلات.</p>
      </div>`;
    hookAll($('#qv'));
    const box = $('#qv');
    box.onclick = e => {
      const t = e.target.closest('[data-img]');
      if (t) { $$('.qv__thumbs button', box).forEach(b => b.classList.toggle('is-on', b === t)); const m = $('.qv-main img', box) || $('.qv-main', box).appendChild(document.createElement('img')); m._tried = []; m.dataset.u = t.dataset.img; m.classList.remove('ok'); loadImg(m); }
      const s = e.target.closest('[data-c]');
      if (s) { color = s.dataset.c; $$('.sw', box).forEach(b => b.classList.toggle('is-on', b === s)); $('#qvColor').textContent = color; }
      const q = e.target.closest('[data-q]');
      if (q) { qty = Math.max(1, qty + +q.dataset.q); $('#qvQty').textContent = qty; }
      if (e.target.closest('#qvAdd')) { addToCart(p.id, qty, color); closeModal(); }
      if (e.target.closest('#qvWa')) window.open(wa(`أهلًا روز هاوس 👋\nمهتم بـ: ${p.name}\nاللون: ${color}\nالكمية: ${qty}\nالسعر المعروض: ${fmt(p.price)} ج.م\nممكن تفاصيل أكتر؟`), '_blank', 'noopener');
    };
    $('#modal').classList.add('is-open'); $('#modal').setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
  }
  function closeModal() { $('#modal').classList.remove('is-open'); $('#modal').setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
  $('#modal').addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });

  /* ---------- drawer ---------- */
  let drawerMode = 'cart';
  function renderDrawer() {
    const body = $('#drawerBody'), foot = $('#drawerFoot');
    if (drawerMode === 'wish') {
      $('#drawerTitle').textContent = 'المفضلة';
      const items = [...wish].map(byId).filter(Boolean);
      body.innerHTML = items.length ? items.map(p => `<div class="line-item">${ph(p.img[0], p.cat, 200)}<div><b>${p.name}</b><small>${fmt(p.price)} ج.م</small><br><button class="rm" data-wish="${p.id}">إزالة</button></div><button class="add" data-add="${p.id}"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button></div>`).join('') : '<p class="drawer__empty">لسه مفيش حاجة في المفضلة.<br>دوس ♥ على أي قطعة عجبتك.</p>';
      foot.innerHTML = '';
    } else {
      $('#drawerTitle').textContent = 'سلة الطلبات';
      const tot = cart.reduce((s, i) => s + byId(i.id).price * i.q, 0);
      body.innerHTML = cart.length ? cart.map((i, k) => { const p = byId(i.id); return `<div class="line-item">${ph(p.img[0], p.cat, 200)}<div><b>${p.name}</b><small>${i.color} · ${fmt(p.price)} ج.م</small><div class="qty"><button data-cq="${k}" data-d="1">+</button><span>${i.q}</span><button data-cq="${k}" data-d="-1">−</button></div></div><button class="rm" data-crm="${k}">حذف</button></div>`; }).join('') : '<p class="drawer__empty">السلة فاضية.<br>تصفّح المعرض واختار اللي يعجبك.</p>';
      foot.innerHTML = cart.length ? `<div class="tot"><span>الإجمالي التقريبي</span><b>${fmt(tot)} ج.م</b></div><button class="btn btn--red btn--block" id="checkout">أكّد الطلب على واتساب</button><small style="text-align:center;color:var(--muted);font-size:12.5px">الدفع: كاش، إنستاباي، فودافون كاش أو تحويل بنكي — بعد تأكيد المقاسات.</small>` : '';
    }
    hookAll(body);
  }
  function openDrawer(mode) { drawerMode = mode; renderDrawer(); $('#drawer').classList.add('is-open'); lenis && lenis.stop(); }
  function closeDrawer() { $('#drawer').classList.remove('is-open'); lenis && lenis.start(); }
  $('#openCart').onclick = () => openDrawer('cart');
  $('#openWish').onclick = () => openDrawer('wish');
  $('#drawer').addEventListener('click', e => {
    if (e.target.closest('[data-dclose]')) closeDrawer();
    const q = e.target.closest('[data-cq]'); if (q) { const it = cart[+q.dataset.cq]; it.q = Math.max(1, it.q + +q.dataset.d); saveCart(); renderDrawer(); }
    const r = e.target.closest('[data-crm]'); if (r) { cart.splice(+r.dataset.crm, 1); saveCart(); renderDrawer(); }
    if (e.target.closest('[data-add]')) setTimeout(renderDrawer, 0);
    if (e.target.closest('#checkout')) {
      const lines = cart.map(i => { const p = byId(i.id); return `• ${p.name} (${i.color}) × ${i.q} = ${fmt(p.price * i.q)} ج.م`; });
      const tot = cart.reduce((s, i) => s + byId(i.id).price * i.q, 0);
      window.open(wa(`أهلًا روز هاوس 👋\nعايز أطلب:\n${lines.join('\n')}\n\nالإجمالي: ${fmt(tot)} ج.م\nمستني تأكيد المقاسات وميعاد التسليم.`), '_blank', 'noopener');
    }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDrawer(); closeLb(); } });

  /* ---------- hero swatches ---------- */
  const heroColors = ['بيج رملي', 'رمادي فحمي', 'كحلي', 'أخضر زيتي', 'تيراكوتا', 'أحمر روز', 'أوف وايت'];
  $('#heroSwatches').innerHTML = heroColors.map((c, i) => `<button class="sw${i ? '' : ' is-on'}" style="--c:${RH.colors[c]}" data-hc="${RH.colors[c]}" title="${c}"></button>`).join('');
  $('#heroSwatches').addEventListener('click', e => {
    const s = e.target.closest('[data-hc]'); if (!s) return;
    $$('#heroSwatches .sw').forEach(b => b.classList.toggle('is-on', b === s));
    dispatchEvent(new CustomEvent('rh:color', { detail: s.dataset.hc }));
  });

  /* ---------- hotspots ---------- */
  const hsTxt = [
    ['مسند ظهر مزدوج', 'طبقتين إسفنج بكثافات مختلفة: صلبة للدعم وناعمة للراحة.'],
    ['قعدة متهبطش', 'إسفنج 35 كثافة ملفوف فايبر 300 جرام، بضمان سنتين ضد الهبوط.'],
    ['ذراع بزاوية مدروسة', 'ارتفاع 62 سم مناسب للسند والنوم، بحشو ناعم وحواف مستديرة.'],
    ['خياطة مزدوجة', 'غرزة مزدوجة بخيط نايلون مقاوم للشد على كل الحواف.']
  ];
  hookAll($('#hotspots'));
  $('#hotspots').addEventListener('click', e => {
    const h = e.target.closest('.hs'); if (!h) return;
    const on = !h.classList.contains('is-on');
    $$('.hs').forEach(x => x.classList.remove('is-on'));
    const card = $('#hsCard');
    if (on) { h.classList.add('is-on'); const [b, p] = hsTxt[+h.dataset.t]; $('b', card).textContent = b; $('p', card).textContent = p; card.classList.add('is-on'); }
    else card.classList.remove('is-on');
  });

  /* ---------- configurator ---------- */
  const cfg = { model: 'ركنة L', base: 32000, len: 300, fabric: 'قطيفة مستورد', k: 1, color: 'بيج رملي' };
  const cfgColors = ['بيج رملي', 'رمادي فحمي', 'رمادي فاتح', 'كحلي', 'أخضر زيتي', 'بترولي', 'تيراكوتا', 'موستردة', 'أحمر روز', 'أوف وايت', 'روز باودر', 'جوزي'];
  $('#cfgSwatches').innerHTML = cfgColors.map((c, i) => `<button class="sw${i ? '' : ' is-on'}" style="--c:${RH.colors[c]}" data-cc="${c}" title="${c}"></button>`).join('');
  const shapes = {
    'ركنة L': L => `<rect x="${150 - L / 2}" y="40" width="${L}" height="38" rx="10"/><rect x="${150 + L / 2 - 58}" y="40" width="58" height="96" rx="10"/><rect x="${150 - L / 2}" y="28" width="${L}" height="22" rx="10" class="bk"/>`,
    'ركنة U': L => `<rect x="${150 - L / 2}" y="40" width="${L}" height="38" rx="10"/><rect x="${150 - L / 2}" y="40" width="54" height="96" rx="10"/><rect x="${150 + L / 2 - 54}" y="40" width="54" height="96" rx="10"/><rect x="${150 - L / 2}" y="28" width="${L}" height="22" rx="10" class="bk"/>`,
    'كنبة 3 مقاعد': L => `<rect x="${150 - L / 2}" y="60" width="${L}" height="50" rx="12"/><rect x="${150 - L / 2}" y="44" width="${L}" height="26" rx="12" class="bk"/><rect x="${150 - L / 2 - 6}" y="56" width="20" height="58" rx="8" class="bk"/><rect x="${150 + L / 2 - 14}" y="56" width="20" height="58" rx="8" class="bk"/>`,
    'أنتريه كامل': L => `<rect x="${150 - L / 2}" y="26" width="${L * .6}" height="40" rx="10"/><rect x="${150 - L / 2 + L * .66}" y="26" width="${L * .34}" height="40" rx="10"/><rect x="${150 - L * .28}" y="104" width="${L * .56}" height="40" rx="10"/><rect x="${150 - L * .16}" y="74" width="${L * .32}" height="22" rx="4" class="tb"/>`
  };
  function shade(hex, a) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; r = Math.min(255, Math.max(0, r + a)); g = Math.min(255, Math.max(0, g + a)); b = Math.min(255, Math.max(0, b + a)); return `rgb(${r},${g},${b})`; }
  function renderCfg() {
    const L = 120 + (cfg.len - 180) / 240 * 150;
    const hex = RH.colors[cfg.color];
    $('#cfgShape').innerHTML = shapes[cfg.model](L);
    $$('#cfgShape rect').forEach(r => r.setAttribute('fill', r.classList.contains('bk') ? shade(hex, -28) : r.classList.contains('tb') ? '#c9a45c' : hex));
    const price = (cfg.base + (cfg.len - 180) * 95) * cfg.k;
    $('#cfgPrice').textContent = fmt(Math.round(price / 100) * 100);
    $('#lenOut').textContent = cfg.len + ' سم';
    $('#colorOut').textContent = cfg.color;
    $('#len').style.setProperty('--p', ((cfg.len - 180) / 240 * 100) + '%');
    $('#cfgList').innerHTML = `<li><small>الموديل</small>${cfg.model}</li><li><small>الطول</small>${cfg.len} سم</li><li><small>الخامة</small>${cfg.fabric}</li><li><small>اللون</small>${cfg.color}</li>`;
  }
  $$('.opts').forEach(g => g.addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (!o) return;
    $$('.opt', g).forEach(x => x.classList.toggle('is-on', x === o));
    if (g.dataset.key === 'model') { cfg.model = o.dataset.v; cfg.base = +o.dataset.base; }
    else { cfg.fabric = o.dataset.v; cfg.k = +o.dataset.k; }
    renderCfg();
    window.gsap && gsap.fromTo('#cfgShape', { scale: .92, transformOrigin: '50% 50%', opacity: .4 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' });
  }));
  $('#len').addEventListener('input', e => { cfg.len = +e.target.value; renderCfg(); });
  $('#cfgSwatches').addEventListener('click', e => { const s = e.target.closest('[data-cc]'); if (!s) return; cfg.color = s.dataset.cc; $$('#cfgSwatches .sw').forEach(b => b.classList.toggle('is-on', b === s)); renderCfg(); });
  $('#cfgSend').addEventListener('click', e => { e.preventDefault(); window.open(wa(`أهلًا روز هاوس 👋\nعايز أفصّل:\n• الموديل: ${cfg.model}\n• الطول: ${cfg.len} سم\n• الخامة: ${cfg.fabric}\n• اللون: ${cfg.color}\nالسعر التقريبي من الموقع: ${$('#cfgPrice').textContent} ج.م\nمحتاج تصميم 3D وعرض سعر نهائي.`), '_blank', 'noopener'); });
  renderCfg();

  /* ---------- projects ---------- */
  $('#projTrack').innerHTML = RH.projects.map((p, i) => `
    <article class="proj" data-proj="${i}">${ph(p.img[0], 'any', 1000)}
      <span class="proj__n">${String(i + 1).padStart(2, '0')}</span>
      <div class="proj__body"><span class="proj__type">${p.type}</span><h3>${p.title}</h3><p>${p.place} — ${p.note}</p>
      <div class="proj__meta"><span><b>${p.pieces}</b>قطعة</span><span><b>${p.days}</b>يوم</span><span><b>${p.img.length}</b>صور</span></div></div>
    </article>`).join('') + `<article class="proj proj--end"><h3>مشروعك<br><em>الجاي هنا</em></h3><p style="color:rgba(255,255,255,.7)">ابعتلنا صور المكان ونقترح عليك تصميم كامل.</p><a class="btn btn--red" data-wa="أهلًا روز هاوس، عايز أفرش" href="#">ابدأ مشروعك</a></article>`;
  // lightbox
  let lb = { list: [], i: 0, title: '' };
  function showLb() { const im = $('#lbImg'); im.src = src(lb.list[lb.i], 1600); $('#lbCap').textContent = `${lb.title} — ${lb.i + 1} / ${lb.list.length}`; }
  function closeLb() { $('#lightbox').classList.remove('is-open'); lenis && lenis.start(); }
  $('#projTrack').addEventListener('click', e => { const p = e.target.closest('[data-proj]'); if (!p || dragMoved) return; const d = RH.projects[+p.dataset.proj]; lb = { list: d.img, i: 0, title: d.title }; showLb(); $('#lightbox').classList.add('is-open'); lenis && lenis.stop(); });
  $('#lightbox').addEventListener('click', e => { if (e.target.closest('[data-lclose]') || e.target.id === 'lightbox') closeLb(); });
  $('#lbNext').onclick = () => { lb.i = (lb.i + 1) % lb.list.length; showLb(); };
  $('#lbPrev').onclick = () => { lb.i = (lb.i - 1 + lb.list.length) % lb.list.length; showLb(); };
  let dragMoved = false;

  /* ---------- reviews ---------- */
  $('#reviews').innerHTML = RH.reviews.map(r => `<article class="rev rv"><span class="rev__stars">★★★★★</span><p>«${r.text}»</p><div><b>${r.name}</b><small>${r.place}</small></div></article>`).join('');

  /* ---------- lead form ---------- */
  $('#leadForm').addEventListener('submit', e => {
    e.preventDefault(); const f = new FormData(e.target);
    window.open(wa(`طلب زيارة مهندس 🏠\nالاسم: ${f.get('name')}\nالموبايل: ${f.get('phone')}\nالمنطقة: ${f.get('area') || '-'}\nمحتاج: ${f.get('need')}`), '_blank', 'noopener');
    toast('تمام! هنكلمك في أقرب وقت');
  });

  /* ---------- nav ---------- */
  const nav = $('#nav');
  $('#burger').onclick = () => nav.classList.toggle('open');
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- smooth scroll + animations ---------- */
  let lenis = null;
  function goTo(sel) { const el = $(sel); if (!el) return; lenis ? lenis.scrollTo(el, { offset: -10, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' }); }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || a.hasAttribute('data-wa')) return;
    const h = a.getAttribute('href'); if (h.length < 2) return;
    e.preventDefault(); goTo(h);
  });

  hookAll();
  renderGrid(false);

  const hasGsap = window.gsap && window.ScrollTrigger;
  if (!hasGsap) { $('#loader').classList.add('is-done'); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // hide nav on scroll down
  let lastY = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { const y = s.scroll(); nav.classList.toggle('is-hidden', y > lastY && y > 400 && !nav.classList.contains('open')); lastY = y; } });
  // active link
  $$('#navLinks a').forEach(a => { const t = $(a.getAttribute('href')); t && ScrollTrigger.create({ trigger: t, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('is-on', s.isActive) }); });

  // split headings into words
  $$('.split').forEach(h => {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; } const o = document.createElement('span'); o.className = 'w'; o.innerHTML = `<span>${w}</span>`; frag.appendChild(o); }); c.replaceWith(frag); }
      else if (c.nodeType === 1 && !c.classList.contains('w')) walk(c);
    });
    walk(h);
    gsap.from($$('.w>span', h), { yPercent: 110, rotate: 4, duration: 1, stagger: .06, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  $$('.sec-lead, .sec-head .eyebrow').forEach(el => { if (el.closest('.hero')) return; gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }); });
  ScrollTrigger.batch('.rv', { start: 'top 90%', onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'power3.out' }) });
  // world parallax
  $$('.world .ph img, .proj .ph img').forEach(img => gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.world,.proj') || img, start: 'top bottom', end: 'bottom top', scrub: true } }));
  // layers
  gsap.from('.layers li', { x: -40, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.layers', start: 'top 80%' } });
  gsap.fromTo('.hotspots img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.hotspots', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.hs', { scale: 0, duration: .6, stagger: .15, ease: 'back.out(3)', scrollTrigger: { trigger: '.hotspots', start: 'top 60%' } });
  // counters
  $$('[data-count]').forEach(el => { const o = { v: 0 }; gsap.to(o, { v: +el.dataset.count, duration: 2.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = (el.hasAttribute('data-plus') ? '+' : '') + fmt(o.v) }); });
  // process line
  gsap.to('#procFill', { width: '100%', ease: 'none', scrollTrigger: { trigger: '.process__grid', start: 'top 75%', end: 'bottom 60%', scrub: true } });
  gsap.from('.process__grid article', { y: 50, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.process__grid', start: 'top 80%' } });
  gsap.from('.cfg__form, .cfg__summary', { y: 60, opacity: 0, stagger: .15, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cfg', start: 'top 80%' } });
  gsap.from('.lead', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.lead', start: 'top 85%' } });

  // projects: horizontal pinned scroll (RTL: track moves to the right)
  const track = $('#projTrack');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => dist(), ease: 'none', scrollTrigger: { trigger: '.projects', pin: '.projects__pin', start: 'top top', end: () => '+=' + dist(), scrub: .6, invalidateOnRefresh: true } });

  /* ---------- hero timeline (text overlay) ---------- */
  const steps = $$('.step');
  const intro = $('#heroIntro');
  gsap.from('.hero__title .line>span', { yPercent: 110, duration: 1.2, stagger: .12, ease: 'power4.out', delay: .2, paused: true, id: 'heroIn' });
  const heroIn = gsap.getById('heroIn');
  const heroFade = gsap.fromTo(['.hero__lead', '.hero__cta', '.scroll-hint', '.hero__intro .eyebrow'], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .08, ease: 'power3.out', paused: true });
  const win = [[.13, .27], [.27, .41], [.41, .55], [.55, .69], [.71, 1.01]];
  let curStep = -1;
  function setStep(i) {
    if (i === curStep) return;
    steps.forEach((s, k) => {
      if (k === i) { s.classList.add('is-on'); gsap.to(s, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out', overwrite: true }); }
      else { s.classList.remove('is-on'); gsap.to(s, { autoAlpha: 0, y: k < i ? -30 : 30, duration: .4, ease: 'power2.in', overwrite: true }); }
    });
    curStep = i;
  }
  const meterFill = $('#meterFill'), meterPct = $('#meterPct'), meter = $('#heroMeter'), tag = $('#heroTag');
  let tagOn = false;
  ScrollTrigger.create({
    trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: s => {
      const p = s.progress;
      RH.heroP = p;
      dispatchEvent(new CustomEvent('rh:hero', { detail: p }));
      const io = gsap.utils.clamp(0, 1, (p - .03) / .08);
      gsap.set(intro, { autoAlpha: 1 - io, y: -60 * io });
      const i = win.findIndex(([a, b]) => p >= a && p < b);
      setStep(i);
      const ap = gsap.utils.clamp(0, 1, (p - .1) / .6);
      meterFill.style.strokeDashoffset = 119.4 * (1 - ap);
      meterPct.textContent = Math.round(ap * 100) + '%';
      gsap.set(meter, { opacity: gsap.utils.clamp(0, 1, (p - .08) * 12) * (p > .97 ? 0 : 1) });
      document.querySelector('.hero__bg').style.setProperty('--grid', String(1 - ap * .7));
      const want = p > .78;
      if (want !== tagOn) { tagOn = want; gsap.to(tag, { autoAlpha: want ? 1 : 0, y: want ? 0 : 20, duration: .5, ease: 'power3.out' }); }
    }
  });

  /* ---------- loader ---------- */
  const loader = $('#loader');
  requestAnimationFrame(() => loader.classList.add('go'));
  let loaded = 0; const bar = $('#loaderBar');
  const tick = setInterval(() => { loaded = Math.min(loaded + 7 + Math.random() * 12, RH.ready3d ? 100 : 88); bar.style.width = loaded + '%'; }, 120);
  function done() { clearInterval(tick); bar.style.width = '100%'; setTimeout(() => { loader.classList.add('is-done'); heroIn.play(); heroFade.play(); ScrollTrigger.refresh(); }, 350); }
  const minT = new Promise(r => setTimeout(r, 1600));
  const ready = new Promise(r => { if (RH.ready3d) r(); addEventListener('rh:ready', r, { once: true }); setTimeout(r, 4500); });
  Promise.all([minT, ready]).then(done);
  addEventListener('load', () => ScrollTrigger.refresh());
})();
