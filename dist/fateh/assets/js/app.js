/* فاتح الشهية | app */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const CFG = window.FT_CONFIG, T = window.FT_I18N, MENU = window.FT_MENU, B = window.FT_BUILDER, SOFRA = window.FT_SOFRA;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  let lang = root.lang === 'en' ? 'en' : 'ar';
  const li = () => (lang === 'en' ? 1 : 0);
  const t = k => (T[lang][k] ?? T.ar[k] ?? k);
  const tx = pair => pair[li()];
  const fmt = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const cur = () => t('cur');

  /* ---------- intro ---------- */
  window.addEventListener('load', () => setTimeout(() => $('#intro').classList.add('done'), 1500));
  setTimeout(() => $('#intro').classList.add('done'), 3500);

  /* ---------- header ---------- */
  const hdr = $('#hdr');
  const onScroll = () => { hdr.classList.toggle('solid', scrollY > 40); $('#fab').classList.toggle('show', scrollY > innerHeight * 1.2); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#navBtn').onclick = () => document.body.classList.toggle('nav-open');
  $$('#nav a').forEach(a => a.onclick = () => document.body.classList.remove('nav-open'));

  /* ---------- theme ---------- */
  $('#themeBtn').onclick = () => {
    const nt = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nt; store.set('fth-theme', nt); cur_f = -1; draw();
    $('meta[name=theme-color]').content = nt === 'dark' ? '#150D0A' : '#E3261C';
  };

  /* ---------- i18n ---------- */
  function applyLang() {
    root.lang = lang; root.dir = lang === 'en' ? 'ltr' : 'rtl';
    $$('[data-i]').forEach(el => { const v = t(el.dataset.i); if (typeof v === 'string') el.textContent = v; });
    $$('[data-ph]').forEach(el => el.placeholder = t(el.dataset.ph));
    $$('.cur').forEach(el => el.textContent = cur());
    $('#langBtn span').textContent = lang === 'en' ? 'ع' : 'EN';
    document.title = lang === 'en' ? 'Fateh El Shahia | Foul · Falafel · Koshari' : 'فاتح الشهية | فول · فلافل · كشري';
    if (typeof draw === 'function') { cur_f = -1; draw(); }
    renderTicker(); renderTrio(); renderBuilder(); renderSofra(); renderMenu(); renderCart();
    $('#waBtn').href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(t('waGeneral'));
    $('#callBtn').href = 'tel:' + CFG.phone;
  }
  $('#langBtn').onclick = () => { lang = lang === 'en' ? 'ar' : 'en'; store.set('fth-lang', lang); applyLang(); };

  /* ---------- ticker ---------- */
  function renderTicker() {
    const words = lang === 'en' ? ['Koshari', 'Falafel', 'Foul', 'Breakfast', 'Fresh daily', 'Buffet'] : ['كشري', 'فلافل', 'فول', 'فطار', 'طازج يومياً', 'بوفية'];
    const html = words.map(w => `<span>${w}</span>`).join('');
    $('#ticker').innerHTML = html + html + html + html;
  }

  /* ---------- trio ---------- */
  function renderTrio() {
    const ids = ['koshari', 'falafel', 'foul'];
    $('#trioGrid').innerHTML = ids.map((id, i) => {
      const c = MENU.find(m => m.id === id);
      const min = Math.min(...c.items.flatMap(it => it.o.map(o => o.p)));
      return `<a class="tcard rv" href="#menu" data-cat="${id}">
        <div class="tcard-img"><img src="assets/img/${c.img}.webp" alt="${tx(c.t)}" loading="lazy"><span class="tcard-num">${i + 1}</span></div>
        <div class="tcard-body"><h3>${tx(c.t)}</h3><p>${tx(c.s)}</p>
          <div class="tcard-foot"><div><small>${t('from')}</small><b>${fmt(min)}<em>${cur()}</em></b></div><span class="link-arrow">${t('seeMenu')} ${lang === 'en' ? '→' : '←'}</span></div>
        </div></a>`;
    }).join('');
    $$('#trioGrid .tcard').forEach(a => a.addEventListener('click', () => { activeCat = a.dataset.cat; renderMenu(); }));
    observe();
  }

  /* ---------- koshari builder ---------- */
  const bs = { size: 1, extras: new Set(['dakka']), spice: 1, qty: 1 };
  const layerColors = { rice: '#FBF3E2', lentil: '#6B4A2E', pasta: '#F0BE54', chickp: '#E8C489', tomato: '#C92F1F', crisp: '#B9701F' };
  function renderBuilder() {
    $('#bSizes').innerHTML = B.sizes.map((s, i) => `<button data-i2="${i}" class="${i === bs.size ? 'on' : ''}">${tx(s.l)}<small>${fmt(s.p)} ${cur()}</small></button>`).join('');
    $('#bExtras').innerHTML = B.extras.map(e => `<button class="chip ${bs.extras.has(e.id) ? 'on' : ''}" data-e="${e.id}">${tx(e.l)}<em>${e.p ? '+' + fmt(e.p) : (lang === 'en' ? 'free' : 'مجاناً')}</em></button>`).join('');
    $('#legend').innerHTML = B.layers.map(l => `<span><i style="background:${layerColors[l.id]}"></i>${tx(l.l)}</span>`).join('');
    $$('#bSizes button').forEach(b => b.onclick = () => { bs.size = +b.dataset.i2; renderBuilder(); });
    $$('#bExtras .chip').forEach(b => b.onclick = () => { const id = b.dataset.e; bs.extras.has(id) ? bs.extras.delete(id) : bs.extras.add(id); renderBuilder(); });
    drawBowl(); priceBuilder();
  }
  function drawBowl() {
    const s = B.sizes[bs.size], ex = bs.extras;
    const base = { rice: 22, lentil: 16, pasta: 18, chickp: 10, tomato: 10, crisp: 9 };
    if (ex.has('chick')) base.chickp += 8;
    if (ex.has('sauce')) base.tomato += 8;
    if (ex.has('onion')) base.crisp += 8;
    const sum = Object.values(base).reduce((a, b) => a + b, 0);
    const fill = s.h * 100;
    $('#layers').style.height = fill + '%';
    const wrap = $('#layers');
    const existing = {};
    $$('.layer', wrap).forEach(el => existing[el.dataset.k] = el);
    B.layers.forEach(l => {
      let el = existing[l.id];
      if (!el) { el = document.createElement('div'); el.className = 'layer l-' + l.c; el.dataset.k = l.id; wrap.appendChild(el); }
      el.dataset.l = tx(l.l);
      el.style.height = (base[l.id] / sum * 100) + '%';
    });
    const tops = [];
    if (ex.has('egg')) tops.push(['🥚', 34, 4]);
    if (ex.has('liver')) tops.push(['🥩', 58, 6]);
    if (ex.has('dakka')) tops.push(['🧄', 18, 14]);
    if (bs.spice > 0) tops.push(['🌶️', 74, 12]);
    const topY = 100 - fill;
    $('#toppings').innerHTML = tops.map(([e, x, dy]) => `<span class="top" style="left:${x}%;top:calc(${topY}% - ${30 - dy}px)">${e}</span>`).join('');
    $('#chiliMeter').innerHTML = [1, 2, 3].map(i => `<span class="${i <= bs.spice ? 'on' : ''}">🌶️</span>`).join('');
    $('#spiceLbl').textContent = t('spice')[bs.spice];
  }
  function builderUnit() {
    return B.sizes[bs.size].p + B.extras.filter(e => bs.extras.has(e.id)).reduce((a, e) => a + e.p, 0);
  }
  function priceBuilder() { $('#bPrice').textContent = fmt(builderUnit() * bs.qty); $('#bQty').textContent = bs.qty; }
  $('#bSpice').oninput = e => { bs.spice = +e.target.value; drawBowl(); };
  $('#bMinus').onclick = () => { bs.qty = Math.max(1, bs.qty - 1); priceBuilder(); };
  $('#bPlus').onclick = () => { bs.qty = Math.min(30, bs.qty + 1); priceBuilder(); };
  $('#bAdd').onclick = () => {
    const s = B.sizes[bs.size];
    const ex = B.extras.filter(e => bs.extras.has(e.id));
    const name = [T.ar.myKoshari, T.en.myKoshari];
    const label = [0, 1].map(k => [s.l[k], ...ex.map(e => e.l[k]), T[k ? 'en' : 'ar'].spice[bs.spice]].join(' + '));
    addCart({ key: 'b:' + bs.size + ':' + [...bs.extras].sort().join(',') + ':' + bs.spice, n: name, l: label, p: builderUnit() }, bs.qty);
  };

  /* ---------- sofra ---------- */
  let people = 4;
  function renderSofra() {
    $('#pVal').textContent = people; $('#pRange').value = people;
    $('.people-v span').textContent = people === 1 ? t('person1') : t('persons');
    let total = 0;
    $('#trayList').innerHTML = SOFRA.map(s => { const q = s.q(people); total += q * s.p; return `<div><i>${s.ic}</i>${tx(s.n)}<b>× ${q}</b></div>`; }).join('');
    $('#sPrice').textContent = fmt(total);
    $('#sPer').textContent = fmt(Math.round(total / people * 10) / 10) + ' ' + cur();
    $('#trayIcons').innerHTML = SOFRA.map(s => `<span>${s.ic} ${s.q(people)}</span>`).join('');
  }
  const setPeople = n => { people = Math.min(20, Math.max(1, n)); renderSofra(); $$('#trayList div').forEach(d => { d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); }); };
  $('#pMinus').onclick = () => setPeople(people - 1);
  $('#pPlus').onclick = () => setPeople(people + 1);
  $('#pRange').oninput = e => setPeople(+e.target.value);
  $('#sAdd').onclick = () => { SOFRA.forEach(s => addCart({ key: 's:' + s.k, n: s.n, l: ['', ''], p: s.p }, s.q(people), true)); toast(); };

  /* ---------- menu ---------- */
  let activeCat = 'all', query = '';
  function renderMenu() {
    $('#tabs').innerHTML = `<button class="tab ${activeCat === 'all' ? 'on' : ''}" data-c="all">${t('all')}</button>` +
      MENU.map(c => `<button class="tab ${activeCat === c.id ? 'on' : ''}" data-c="${c.id}"><img src="assets/img/${c.img}-s.webp" alt="">${tx(c.t)}</button>`).join('');
    $$('#tabs .tab').forEach(b => b.onclick = () => { activeCat = b.dataset.c; renderMenu(); });
    const q = query.trim().toLowerCase();
    const cats = MENU.filter(c => activeCat === 'all' || c.id === activeCat).map(c => ({ ...c, items: c.items.filter(it => !q || it.n.join(' ').toLowerCase().includes(q) || it.d.join(' ').toLowerCase().includes(q)) })).filter(c => c.items.length);
    $('#menuGrid').innerHTML = cats.length ? cats.map(c => `<div class="menu-cat">
      <div class="menu-cat-head"><img src="assets/img/${c.img}-s.webp" alt="" loading="lazy"><div><h3>${tx(c.t)}</h3><p>${tx(c.s)}</p></div></div>
      <div class="menu-items">${c.items.map((it, ii) => `<div class="mi">
        <div class="mi-top"><h4>${tx(it.n)}</h4>${it.tag ? `<span class="tag">${tx(it.tag)}</span>` : ''}</div>
        <p>${tx(it.d)}</p>
        <div class="mi-opts">${it.o.map((o, oi) => `<button class="opt" data-c="${c.id}" data-it="${MENU.find(m => m.id === c.id).items.indexOf(it)}" data-o="${oi}">${it.o.length > 1 ? tx(o.l) + ' · ' : ''}<b>${fmt(o.p)} ${cur()}</b><i>+</i></button>`).join('')}</div>
      </div>`).join('')}</div></div>`).join('') : `<p class="no-res">${t('noRes')}</p>`;
    $$('#menuGrid .opt').forEach(b => b.onclick = () => {
      const it = MENU.find(m => m.id === b.dataset.c).items[+b.dataset.it], o = it.o[+b.dataset.o];
      addCart({ key: `m:${b.dataset.c}:${b.dataset.it}:${b.dataset.o}`, n: it.n, l: it.o.length > 1 ? o.l : ['', ''], p: o.p }, 1);
      b.classList.add('added'); b.querySelector('i').textContent = '✓';
      setTimeout(() => { b.classList.remove('added'); b.querySelector('i').textContent = '+'; }, 1100);
    });
  }
  $('#q').oninput = e => { query = e.target.value; renderMenu(); };

  /* ---------- cart ---------- */
  let cart = [];
  try { cart = JSON.parse(store.get('fth-cart') || '[]'); } catch (e) { cart = []; }
  let otype = 'pickup';
  function saveCart() { store.set('fth-cart', JSON.stringify(cart)); }
  function addCart(item, qty, silent) {
    const ex = cart.find(c => c.key === item.key);
    ex ? ex.q += qty : cart.push({ ...item, q: qty });
    saveCart(); renderCart();
    const cb = $('#cartBtn'); cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump');
    if (!silent) toast();
  }
  function renderCart() {
    const count = cart.reduce((a, c) => a + c.q, 0), total = cart.reduce((a, c) => a + c.q * c.p, 0);
    $('#cartCount').textContent = count; $('#fabCount').textContent = count;
    $('#cartTotal').textContent = fmt(total) + ' ' + cur();
    $('#cartList').innerHTML = cart.length ? cart.map((c, i) => `<div class="ci"><div><b>${tx(c.n)}</b>${tx(c.l) ? `<small>${tx(c.l)}</small>` : ''}<small>${fmt(c.p)} ${cur()}</small></div>
      <div class="qty"><button data-m="${i}">−</button><b>${c.q}</b><button data-p="${i}">+</button></div></div>`).join('') : `<p class="cart-empty">🍲<br>${t('cartEmpty')}</p>`;
    $$('#cartList [data-m]').forEach(b => b.onclick = () => { const c = cart[+b.dataset.m]; c.q--; if (c.q <= 0) cart.splice(+b.dataset.m, 1); saveCart(); renderCart(); });
    $$('#cartList [data-p]').forEach(b => b.onclick = () => { cart[+b.dataset.p].q++; saveCart(); renderCart(); });
  }
  const drawer = $('#drawer');
  const openCart = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); };
  const closeCart = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); };
  $('#cartBtn').onclick = openCart;
  $('#fab').onclick = e => { if (cart.length) { e.preventDefault(); openCart(); } };
  $$('[data-close]').forEach(b => b.onclick = closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  $$('#oType button').forEach(b => b.onclick = () => { otype = b.dataset.v; $$('#oType button').forEach(x => x.classList.toggle('on', x === b)); $('#cAddr').hidden = otype !== 'delivery'; });
  $('#sendWa').onclick = () => {
    if (!cart.length) { toast(t('cartEmpty')); return; }
    const total = cart.reduce((a, c) => a + c.q * c.p, 0);
    const lines = [t('waHello'), ''];
    cart.forEach(c => lines.push(`• ${c.q} × ${tx(c.n)}${tx(c.l) ? ' (' + tx(c.l) + ')' : ''} = ${fmt(c.q * c.p)} ${cur()}`));
    lines.push('', `${t('waTotal')}: ${fmt(total)} ${cur()}`);
    const name = $('#cName').value.trim(); if (name) lines.push(`${t('waName')}: ${name}`);
    lines.push(`${t('waType')}: ${t(otype)}`);
    const addr = $('#cAddr').value.trim(); if (otype === 'delivery' && addr) lines.push(`${t('waAddr')}: ${addr}`);
    location.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
  };
  let tt;
  function toast(msg) { const el = $('#toast'); el.textContent = msg || t('added'); el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1600); }

  /* ---------- reveal ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 }) : null;
  function observe() { $$('.rv:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in')); }
  $$('.sec-head, .builder-panel, .bowl-stage, .sofra-copy, .sofra-art, .store, .story-copy, .visit-in').forEach(el => el.classList.add('rv'));

  /* ---------- hero scroll sequence ---------- */
  const canvas = $('#seq'), ctx = canvas.getContext('2d');
  const isM = matchMedia('(max-width:760px)').matches;
  const FR = window.FT_FRAMES || 0;
  const frames = []; let loaded = 0, cur_f = -1;
  function size() { const r = canvas.getBoundingClientRect(); canvas.width = r.width * Math.min(devicePixelRatio, 2); canvas.height = r.height * Math.min(devicePixelRatio, 2); cur_f = -1; draw(); }
  function drawImg(img) {
    const cw = canvas.width, ch = canvas.height, ir = img.width / img.height, cr = cw / ch;
    let w, h; if (ir > cr) { h = ch; w = h * ir; } else { w = cw; h = w / ir; }
    if (!isM && cw > 900) { w *= 1.12; h *= 1.12; ctx.drawImage(img, cw - w, (ch - h) / 2, w, h); }
    else ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function draw() {
    if (!FR) return;
    const hero = $('#hero'), r = hero.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (hero.offsetHeight - innerHeight)));
    let i = Math.round(p * (FR - 1));
    while (i > 0 && !(frames[i] && frames[i].complete && frames[i].naturalWidth)) i--;
    if (i === cur_f || !frames[i] || !frames[i].naturalWidth) return;
    cur_f = i; drawImg(frames[i]);
    if (i > 0) $('#seqPoster').style.opacity = 0;
  }
  if (FR) {
    for (let i = 0; i < FR; i++) {
      const img = new Image(); img.decoding = 'async';
      img.src = `assets/seq/${isM ? 'm' : 'd'}/${String(i + 1).padStart(3, '0')}.webp`;
      img.onload = () => { loaded++; if (i === 0) { size(); } };
      frames.push(img);
    }
    addEventListener('scroll', () => requestAnimationFrame(draw), { passive: true });
    addEventListener('resize', size);
  }

  applyLang();
  observe();
})();
