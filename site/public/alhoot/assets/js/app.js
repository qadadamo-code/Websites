(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.AH_CONFIG, T = window.AH_I18N, FISH = window.AH_FISH, COOK = window.AH_COOK, SIDES = window.AH_SIDES,
    CATS = window.AH_CATS, MENU = window.AH_MENU, JOUR = window.AH_JOURNEY, PROM = window.AH_PROMISE;
  const root = document.documentElement;
  let lang = root.lang === 'en' ? 'en' : 'ar';
  const L = () => (lang === 'en' ? 1 : 0);
  const t = k => T[lang][k] ?? k;
  const tx = a => (Array.isArray(a) ? a[L()] : a);
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const fmtKg = w => (Math.round(w * 100) / 100).toFixed(2);
  const cur = () => t('cur');
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const ICON = {
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    fresh: '<svg viewBox="0 0 24 24"><path d="M3 12c3-5 8-7 13-5l5-3-1 6c-2 5-8 8-13 6l-4 4 1-5c-1-1-1-2-1-3z"/><circle cx="15" cy="10" r="1"/></svg>',
    scale: '<svg viewBox="0 0 24 24"><path d="M5 20h14M12 4v16M6 8h12M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z"/></svg>',
    fire: '<svg viewBox="0 0 24 24"><path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7z"/></svg>',
    clean: '<svg viewBox="0 0 24 24"><path d="M14 3l7 7-9 9H5v-7zM9 8l7 7M3 21h8"/></svg>'
  };

  /* ---------- theme + lang ---------- */
  $('#themeBtn').onclick = () => { const n = root.dataset.theme === 'light' ? 'dark' : 'light'; root.dataset.theme = n; try { localStorage.setItem('ah-theme', n); } catch (e) {} };
  $('#langBtn').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('ah-lang', lang); } catch (e) {} applyLang(); };
  function applyLang() {
    root.lang = lang; root.dir = lang === 'en' ? 'ltr' : 'rtl';
    $('#langBtn span').textContent = lang === 'en' ? 'ع' : 'EN';
    $$('[data-i]').forEach(el => { const v = T[lang][el.dataset.i]; if (v != null) el.textContent = v; });
    $$('[data-ph]').forEach(el => el.placeholder = t(el.dataset.ph));
    document.title = lang === 'en' ? 'Al Hoot Seafood | Fish · Shrimp · Seafood' : 'أسماك الحوت | سمك · جمبري · مأكولات بحرية';
    $('#iHours').textContent = tx(CFG.hours); $('#iAddr').textContent = tx(CFG.address);
    $('#iPhone').textContent = CFG.phone; $('#iPhone').href = 'tel:' + CFG.phone;
    $('#waFloat').href = 'https://wa.me/' + CFG.whatsapp;
    $('#yr').textContent = new Date().getFullYear();
    renderTicker(); renderMarket(); renderJourney(); renderSig(); renderFeast(); renderTabs(); renderMenu(); renderPromise(); renderTypes(); renderCart();
  }

  /* ---------- header / nav ---------- */
  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('solid', scrollY > innerHeight * 0.6);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#navBtn').onclick = () => document.body.classList.toggle('nav-open');
  $$('#nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  /* ---------- intro ---------- */
  addEventListener('load', () => setTimeout(() => { $('#intro').classList.add('out'); document.body.classList.add('ready'); }, 1300));
  setTimeout(() => { $('#intro').classList.add('out'); document.body.classList.add('ready'); }, 4000);

  /* ---------- ticker ---------- */
  function renderTicker() {
    const words = lang === 'en'
      ? ['Sea bream', 'Sea bass', 'Grey mullet', 'Jumbo prawns', 'Crab', 'Calamari', 'Clams', 'Sayadeya rice', 'Seafood soup', 'Singari']
      : ['دنيس', 'قاروص', 'بوري', 'جمبري جامبو', 'كابوريا', 'سبيط', 'جندوفلي', 'أرز صيادية', 'شوربة سي فود', 'سنجاري'];
    const html = words.map(w => `<span>${w}</span>`).join('');
    $('#ticker').innerHTML = html + html;
  }

  /* ---------- market ---------- */
  const mk = store.get('ah-mk', { fish: 'bream', w: 1, cook: 'grill', sides: ['rice', 'salad', 'tahini'] });
  const fishOf = () => FISH.find(f => f.id === mk.fish) || FISH[0];
  function buildTicks() {
    let g = '';
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI + (i / 12) * Math.PI, mj = i % 4 === 0;
      const r1 = mj ? 70 : 76, r2 = 84;
      const x1 = 110 + r1 * Math.cos(a), y1 = 120 + r1 * Math.sin(a), x2 = 110 + r2 * Math.cos(a), y2 = 120 + r2 * Math.sin(a);
      g += `<line class="tk${mj ? ' mj' : ''}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      if (mj) { const xt = 110 + 58 * Math.cos(a), yt = 120 + 58 * Math.sin(a) + 4; g += `<text x="${xt.toFixed(1)}" y="${yt.toFixed(1)}">${i / 4}</text>`; }
    }
    $('#ticks').innerHTML = g;
  }
  buildTicks();
  function renderMarket() {
    $$('.market .lead').forEach(el => el.textContent = t('marketP'));
    $('#fishRow').innerHTML = FISH.map(f => `<button class="fish ${f.id === mk.fish ? 'on' : ''}" data-f="${f.id}">
      <img src="assets/img/${f.img}-s.webp" alt="${tx(f.n)}" loading="lazy"><div class="fb"><b>${tx(f.n)}</b><small>${fmt(f.p)} ${t('perKg')}</small></div></button>`).join('');
    $$('#fishRow .fish').forEach(b => b.onclick = () => { mk.fish = b.dataset.f; const f = fishOf(); if (!f.m.includes(mk.cook)) mk.cook = f.m[0]; renderMarket(); });
    const ws = [0.5, 1, 1.5, 2, 3];
    $('#wQuick').innerHTML = ws.map(w => `<button data-w="${w}" class="${w === mk.w ? 'on' : ''}">${w} ${t('kg')}</button>`).join('');
    $$('#wQuick button').forEach(b => b.onclick = () => { mk.w = +b.dataset.w; renderMarket(); });
    const f = fishOf();
    $('#cookRow').innerHTML = COOK.map(c => `<button data-c="${c.id}" class="${c.id === mk.cook ? 'on' : ''}" ${f.m.includes(c.id) ? '' : 'disabled'}>
      <i>${c.ic}</i><b>${tx(c.n)}</b><small>${tx(c.d)}</small>${c.p ? `<em>+${c.p}/${t('kg')}</em>` : ''}</button>`).join('');
    $$('#cookRow button').forEach(b => b.onclick = () => { mk.cook = b.dataset.c; renderMarket(); });
    $('#sidesRow').innerHTML = SIDES.map(s => `<button class="chip ${mk.sides.includes(s.id) ? 'on' : ''}" data-s="${s.id}">${tx(s.n)}<em>+${s.p}</em></button>`).join('');
    $$('#sidesRow .chip').forEach(b => b.onclick = () => { const id = b.dataset.s; mk.sides = mk.sides.includes(id) ? mk.sides.filter(x => x !== id) : [...mk.sides, id]; renderMarket(); });
    updateScale();
  }
  function mkPrice() {
    const f = fishOf(), c = COOK.find(x => x.id === mk.cook);
    const fish = f.p * mk.w, cook = c.p * mk.w;
    const sides = SIDES.filter(s => mk.sides.includes(s.id)).reduce((a, s) => a + s.p, 0);
    return { fish, cook, sides, total: fish + cook + sides };
  }
  function updateScale() {
    $('#wRange').value = mk.w;
    $('#wVal').textContent = fmtKg(mk.w);
    const ang = -90 + (mk.w / 3) * 180;
    $('#needle').style.transform = `rotate(${ang}deg)`;
    const serves = Math.max(1, Math.round(mk.w / 0.4));
    $('#servesN').textContent = serves;
    $('#servesL').textContent = serves === 1 ? t('person1') : t('persons');
    $$('#wQuick button').forEach(b => b.classList.toggle('on', +b.dataset.w === mk.w));
    const f = fishOf(), c = COOK.find(x => x.id === mk.cook), pr = mkPrice();
    $('#rImg').src = `assets/img/${f.img}-s.webp`;
    $('#rName').textContent = `${tx(f.n)} · ${tx(c.n)}`;
    $('#rDesc').textContent = tx(f.d);
    const sidesNames = SIDES.filter(s => mk.sides.includes(s.id)).map(s => tx(s.n)).join('، ');
    $('#rLines').innerHTML = `
      <div><span>${t('fishLine')} (${fmtKg(mk.w)} ${t('kg')} × ${fmt(f.p)})</span><b>${fmt(pr.fish)} ${cur()}</b></div>
      <div><span>${t('cookLine')}: ${tx(c.n)}</span><b>${pr.cook ? fmt(pr.cook) + ' ' + cur() : t('free')}</b></div>
      <div><span>${t('sidesLine')}${sidesNames ? ': ' + sidesNames : ''}</span><b>${fmt(pr.sides)} ${cur()}</b></div>`;
    const el = $('#rTotal'), from = +el.dataset.v || 0, to = pr.total; el.dataset.v = to;
    const st = performance.now();
    (function step(n) { const k = Math.min(1, (n - st) / 450); el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(st);
    store.set('ah-mk', mk);
  }
  $('#wRange').oninput = e => { mk.w = +e.target.value; updateScale(); };
  $('#mkAdd').onclick = () => {
    const f = fishOf(), c = COOK.find(x => x.id === mk.cook), pr = mkPrice();
    const sides = SIDES.filter(s => mk.sides.includes(s.id));
    const name = [0, 1].map(k => `${f.n[k]} ${fmtKg(mk.w)} ${k ? 'kg' : 'كجم'} · ${c.n[k]}`);
    const det = [0, 1].map(k => sides.map(s => s.n[k]).join(k ? ', ' : '، '));
    addCart({ key: `m:${f.id}:${mk.w}:${c.id}:${[...mk.sides].sort()}`, n: name, l: det, p: pr.total, img: f.img }, 1);
  };

  /* ---------- journey ---------- */
  function renderJourney() {
    $('#jTrack').innerHTML = JOUR.map((j, i) => `<article class="jcard"><img src="assets/img/${j.img}.webp" alt="" loading="lazy"><div class="jc"><span class="jn">0${i + 1}</span><h3>${tx(j.n)}</h3><p>${tx(j.d)}</p></div></article>`).join('');
    journeyScroll();
  }
  function journeyScroll() {
    if (matchMedia('(max-width:760px)').matches) return;
    const sec = $('#journey'), track = $('#jTrack');
    const r = sec.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (sec.offsetHeight - innerHeight)));
    const max = track.scrollWidth - innerWidth;
    const x = p * Math.max(0, max);
    track.style.transform = `translate3d(${lang === 'en' ? -x : x}px,0,0)`;
    $('#jLine').style.width = (p * 100) + '%';
  }

  /* ---------- signatures ---------- */
  function renderSig() {
    const items = MENU.filter(m => m.sig);
    $('#sigGrid').innerHTML = items.map(m => `<article class="scard rv" data-id="${m.id}"><img src="assets/img/${m.img}${m.img === 'feast' ? '' : ''}.webp" alt="${tx(m.n)}" loading="lazy">
      <div class="sc"><h3>${tx(m.n)}</h3><p>${tx(m.d)}</p><div class="sf"><b>${fmt(m.p)} <small>${cur()}</small></b><span class="plus">${ICON.plus}</span></div></div></article>`).join('');
    $$('#sigGrid .scard').forEach(c => c.onclick = () => openSheet(c.dataset.id));
    observe();
  }

  /* ---------- feast ---------- */
  const fs = { g: 4, want: new Set(['shrimp', 'calamari', 'soup']) };
  const P = id => MENU.find(m => m.id === id).p;
  function feastItems() {
    const g = fs.g, w = fs.want, out = [];
    const fishKg = Math.max(0.5, Math.round(g * (w.has('shrimp') ? 0.3 : 0.4) * 4) / 4);
    out.push({ ic: '🐟', n: [`دنيس مشوي ردة`, 'Bran-grilled sea bream'], q: fishKg, unit: 'kg', p: 460 * fishKg });
    if (w.has('shrimp')) { const k = Math.max(0.25, Math.round(g * 0.12 * 4) / 4); out.push({ ic: '🦐', n: ['جمبري جامبو مشوي', 'Grilled jumbo prawns'], q: k, unit: 'kg', p: 880 * k }); }
    if (w.has('crab')) { const q = Math.ceil(g / 3); out.push({ ic: '🦀', n: ['كابوريا صوص الحوت', 'Al Hoot spicy crab'], q, p: P('c1') * q }); }
    if (w.has('calamari')) { const q = Math.ceil(g / 3); out.push({ ic: '🦑', n: ['كاليماري مقلي', 'Fried calamari'], q, p: P('q1') * q }); }
    if (w.has('soup')) out.push({ ic: '🍲', n: ['شوربة سي فود', 'Seafood soup'], q: g, p: P('p1') * g });
    out.push({ ic: '🍚', n: ['أرز صيادية', 'Sayadeya rice'], q: g, p: P('r1') * g });
    const mz = Math.ceil(g / 4); out.push({ ic: '🥗', n: ['طبق مقبلات الحوت', 'Hoot mezze board'], q: mz, p: P('a5') * mz });
    return out;
  }
  function renderFeast(pop) {
    $('#gVal').textContent = fs.g; $('#gRange').value = fs.g;
    const wl = [['shrimp', '🦐', 'wantShrimp'], ['calamari', '🦑', 'wantCalamari'], ['crab', '🦀', 'wantCrab'], ['soup', '🍲', 'wantSoup']];
    $('#wants').innerHTML = wl.map(([id, ic, k]) => `<button class="chip ${fs.want.has(id) ? 'on' : ''}" data-w="${id}">${ic} ${t(k)}</button>`).join('');
    $$('#wants .chip').forEach(b => b.onclick = () => { const id = b.dataset.w; fs.want.has(id) ? fs.want.delete(id) : fs.want.add(id); renderFeast(true); });
    const items = feastItems(); let tot = 0;
    $('#fList').innerHTML = items.map(i => { tot += i.p; return `<div><i>${i.ic}</i><span>${tx(i.n)}</span><b>${i.unit ? fmtKg(i.q) + ' ' + t('kg') : '× ' + i.q}</b></div>`; }).join('');
    $('#fTotal').textContent = fmt(tot);
    $('#fPer').textContent = fmt(tot / fs.g) + ' ' + cur();
    if (pop) $$('#fList div').forEach(d => { d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); });
  }
  const setG = n => { fs.g = Math.min(30, Math.max(2, n)); renderFeast(true); };
  $('#gMinus').onclick = () => setG(fs.g - 1);
  $('#gPlus').onclick = () => setG(fs.g + 1);
  $('#gRange').oninput = e => setG(+e.target.value);
  $('#fAdd').onclick = () => {
    const items = feastItems(), tot = items.reduce((a, i) => a + i.p, 0);
    const n = [`سفرة عزومة لـ ${fs.g} أفراد`, `Feast table for ${fs.g}`];
    const l = [0, 1].map(k => items.map(i => `${i.n[k]} ${i.unit ? fmtKg(i.q) + (k ? 'kg' : 'كجم') : '×' + i.q}`).join(k ? ', ' : '، '));
    addCart({ key: 'f:' + fs.g + ':' + [...fs.want].sort(), n, l, p: tot, img: 'feast' }, 1);
  };

  /* ---------- menu ---------- */
  let activeCat = 'all', query = '';
  function renderTabs() {
    const all = [{ id: 'all', n: ['الكل', 'All'] }, ...CATS];
    $('#tabs').innerHTML = all.map(c => `<button data-c="${c.id}" class="${c.id === activeCat ? 'on' : ''}">${tx(c.n)}</button>`).join('');
    $$('#tabs button').forEach(b => b.onclick = () => { activeCat = b.dataset.c; renderTabs(); renderMenu(); });
  }
  function renderMenu() {
    const q = query.trim().toLowerCase();
    const list = MENU.filter(m => (activeCat === 'all' || m.c === activeCat) && (!q || (m.n.join(' ') + ' ' + m.d.join(' ')).toLowerCase().includes(q)));
    $('#menuGrid').innerHTML = list.length ? list.map(m => `<button class="mi" data-id="${m.id}"><img src="assets/img/${m.img}-s.webp" alt="" loading="lazy">
      <span class="mb"><b>${tx(m.n)}</b><p>${tx(m.d)}</p><span class="mf"><strong>${fmt(m.p)} <small>${cur()}</small></strong><span class="add">${ICON.plus}</span></span></span></button>`).join('')
      : `<p class="empty">${t('noRes')}</p>`;
    $$('#menuGrid .mi').forEach(b => b.onclick = () => openSheet(b.dataset.id));
  }
  $('#q').oninput = e => { query = e.target.value; if (query) { activeCat = 'all'; renderTabs(); } renderMenu(); };

  /* ---------- sheet ---------- */
  let sh = null, shQ = 1;
  function openSheet(id) {
    sh = MENU.find(m => m.id === id); if (!sh) return; shQ = 1;
    $('#shImg').src = `assets/img/${sh.img}.webp`; $('#shName').textContent = tx(sh.n); $('#shDesc').textContent = tx(sh.d);
    $('#shPrice').textContent = fmt(sh.p); $('#shQty').textContent = 1;
    $('#sheet').classList.add('on');
  }
  const closeSheet = () => $('#sheet').classList.remove('on');
  $('#shClose').onclick = closeSheet;
  $('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };
  $('#shMinus').onclick = () => { shQ = Math.max(1, shQ - 1); $('#shQty').textContent = shQ; $('#shPrice').textContent = fmt(sh.p * shQ); };
  $('#shPlus').onclick = () => { shQ = Math.min(30, shQ + 1); $('#shQty').textContent = shQ; $('#shPrice').textContent = fmt(sh.p * shQ); };
  $('#shAdd').onclick = () => { addCart({ key: 'i:' + sh.id, n: sh.n, l: ['', ''], p: sh.p, img: sh.img }, shQ); closeSheet(); };

  /* ---------- promise ---------- */
  function renderPromise() {
    $('#prGrid').innerHTML = PROM.map(p => `<div class="pr rv"><span class="ic">${ICON[p.ic]}</span><h3>${tx(p.n)}</h3><p>${tx(p.d)}</p></div>`).join('');
    observe();
  }

  /* ---------- booking ---------- */
  let bType = 'typeDine';
  function renderTypes() {
    $('#types').innerHTML = ['typeDine', 'typeDel', 'typeTake', 'typeEvent'].map(k => `<button type="button" class="chip ${k === bType ? 'on' : ''}" data-k="${k}">${t(k)}</button>`).join('');
    $$('#types .chip').forEach(b => b.onclick = () => { bType = b.dataset.k; renderTypes(); });
  }
  const dateIn = $('#book [name=date]'); dateIn.min = new Date().toISOString().slice(0, 10); dateIn.value = dateIn.min;
  $('#book').onsubmit = e => {
    e.preventDefault(); const f = new FormData(e.target);
    const lines = [t('waBook'), '', `• ${t('bookType')}: ${t(bType)}`, `• ${t('bookName')}: ${f.get('name')}`, `• ${t('bookPhone')}: ${f.get('phone')}`, `• ${t('bookDate')}: ${f.get('date')} ${f.get('time')}`, `• ${t('bookPeople')}: ${f.get('people')}`];
    if (f.get('note')) lines.push(`• ${t('bookNote')}: ${f.get('note')}`);
    location.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
  };

  /* ---------- cart ---------- */
  let cart = store.get('ah-cart', []);
  function addCart(item, q) {
    const ex = cart.find(c => c.key === item.key);
    ex ? ex.q += q : cart.push({ ...item, q });
    store.set('ah-cart', cart); renderCart(); toast();
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  function renderCart() {
    const n = cart.reduce((a, c) => a + c.q, 0);
    $('#cartCount').textContent = n;
    if (!cart.length) {
      $('#drList').innerHTML = `<div class="dr-empty"><img src="assets/img/mark.svg" alt="">${t('cartEmpty')}</div>`;
      $('#drFoot').style.display = 'none'; return;
    }
    $('#drFoot').style.display = '';
    $('#drList').innerHTML = cart.map((c, i) => `<div class="dr-item"><img src="assets/img/${c.img}-s.webp" alt=""><div class="di"><b>${tx(c.n)}</b>${tx(c.l) ? `<small>${tx(c.l)}</small>` : ''}
      <div class="dq"><strong>${fmt(c.p * c.q)} ${cur()}</strong><div class="stepper"><button data-i="${i}" data-d="-1">−</button><b>${c.q}</b><button data-i="${i}" data-d="1">+</button></div></div></div></div>`).join('');
    $$('#drList .stepper button').forEach(b => b.onclick = () => { const c = cart[+b.dataset.i]; c.q += +b.dataset.d; if (c.q <= 0) cart.splice(+b.dataset.i, 1); store.set('ah-cart', cart); renderCart(); });
    const sub = cart.reduce((a, c) => a + c.p * c.q, 0), del = sub >= CFG.freeOver ? 0 : CFG.delivery;
    $('#drSub').textContent = fmt(sub) + ' ' + cur();
    $('#drDel').textContent = del ? fmt(del) + ' ' + cur() : t('free');
    $('#drNote').textContent = del ? `${t('freeDel')} ${fmt(CFG.freeOver)} ${cur()}` : '';
    $('#drTot').textContent = fmt(sub + del) + ' ' + cur();
  }
  const openDr = () => { $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); };
  const closeDr = () => { $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); };
  $('#cartBtn').onclick = openDr; $('#drClose').onclick = closeDr; $('#scrim').onclick = closeDr;
  $('#drClear').onclick = () => { cart = []; store.set('ah-cart', cart); renderCart(); };
  $('#drSend').onclick = () => {
    const sub = cart.reduce((a, c) => a + c.p * c.q, 0), del = sub >= CFG.freeOver ? 0 : CFG.delivery;
    const lines = [t('waHello'), ''];
    cart.forEach(c => { lines.push(`• ${tx(c.n)} × ${c.q} = ${fmt(c.p * c.q)} ${cur()}`); if (tx(c.l)) lines.push(`   (${tx(c.l)})`); });
    lines.push('', `${t('subtotal')}: ${fmt(sub)} ${cur()}`, `${t('deliveryL')}: ${del ? fmt(del) + ' ' + cur() : t('free')}`, `${t('total')}: ${fmt(sub + del)} ${cur()}`);
    location.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
  };
  let tt;
  function toast(msg) { const el = $('#toast'); el.textContent = msg || t('added'); el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1600); }
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeDr(); closeSheet(); } });

  /* ---------- reveal ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 }) : null;
  function observe() { $$('.rv:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in')); }
  $$('.sec-head, .mk-main, .receipt, .feast-copy, .feast-card, .visit-art, .book').forEach(el => el.classList.add('rv'));

  /* ---------- hero scroll sequence + depth ---------- */
  const canvas = $('#seq'), ctx = canvas.getContext('2d');
  const isM = matchMedia('(max-width:760px)').matches;
  const FR = CFG.frames || 0;
  const frames = []; let curF = -1;
  function size() { const r = canvas.getBoundingClientRect(); canvas.width = r.width * Math.min(devicePixelRatio, 2); canvas.height = r.height * Math.min(devicePixelRatio, 2); curF = -1; draw(); }
  function drawImg(img) {
    const cw = canvas.width, ch = canvas.height, ir = img.width / img.height, cr = cw / ch;
    let w, h; if (ir > cr) { h = ch; w = h * ir; } else { w = cw; h = w / ir; }
    const x = isM ? (cw - w) / 2 : cw - w;
    ctx.drawImage(img, x, (ch - h) / 2, w, h);
  }
  function heroP() { const hero = $('#hero'), r = hero.getBoundingClientRect(); return Math.min(1, Math.max(0, -r.top / (hero.offsetHeight - innerHeight))); }
  function draw() {
    const p = heroP();
    $('#depthFill').style.height = (p * 100) + '%';
    $('#depthVal').textContent = Math.round(p * 120) + 'm';
    if (!FR) return;
    let i = Math.round(p * (FR - 1));
    while (i > 0 && !(frames[i] && frames[i].complete && frames[i].naturalWidth)) i--;
    if (i === curF || !frames[i] || !frames[i].naturalWidth) return;
    curF = i; drawImg(frames[i]);
    $('#seqPoster').style.opacity = 0;
  }
  if (FR) {
    for (let i = 0; i < FR; i++) {
      const img = new Image(); img.decoding = 'async';
      img.src = `assets/seq/${isM ? 'm' : 'd'}/${String(i + 1).padStart(3, '0')}.webp`;
      img.onload = () => { if (i === 0) size(); };
      frames.push(img);
    }
    addEventListener('resize', size);
  }
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { draw(); journeyScroll(); ticking = false; }); }, { passive: true });
  addEventListener('resize', journeyScroll);

  applyLang();
  observe();
  draw();
})();
