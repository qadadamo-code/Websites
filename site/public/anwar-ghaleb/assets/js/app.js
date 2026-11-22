/* Anwar Ghaleb — app logic (i18n, catalogue, studio UI, lab, cart, motion) */
(function () {
  'use strict';
  const D = window.AG, TT = window.T, LANGS = window.LANGS;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const html = document.documentElement;

  /* ---------- language ---------- */
  const qsLang = new URLSearchParams(location.search).get('lang');
  let lang = LANGS.includes(qsLang) ? qsLang : store.get('ag-lang', 'ar');
  if (!LANGS.includes(lang)) lang = 'ar';
  const LI = () => LANGS.indexOf(lang);
  const t = k => (TT[k] ? (TT[k][LI()] || TT[k][1]) : k);
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const money = n => `${fmt(n)}<small>${t('currency')}</small>`;
  const pById = id => D.products.find(p => p.id === id);
  const img = (id, v = 0) => `assets/img/p/${id}_${v}.webp`;
  window.AGI = { t, get lang() { return lang; } };

  let gfLoaded = false;
  function ensureFonts() {
    if (gfLoaded || !['zh', 'ru'].includes(lang)) return;
    gfLoaded = true;
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700;800&display=swap';
    document.head.appendChild(l);
  }

  function applyLang() {
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    ensureFonts();
    $$('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); });
    $$('[data-iph]').forEach(el => { el.placeholder = t(el.dataset.iph); });
    // non-Arabic: Latin wordmark in header/footer
    $$('.logo-t .wm').forEach(el => {
      if (lang === 'ar') { el.innerHTML = 'أنور <span class="g">ع<i></i></span>الب'; el.classList.remove('lat'); }
      else { el.textContent = lang === 'ru' ? 'Анвар Галеб' : 'Anwar Ghaleb'; el.classList.add('lat'); }
    });
    $$('.ftr .logo-t small').forEach(el => el.textContent = lang === 'ar' ? 'ANWAR GHALEB' : t('brandSub'));
    $('#langCode').textContent = lang.toUpperCase();
    $$('#langMenu button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
    document.title = `${t('brand')} | ${t('brandSub')}`;
    renderAll();
    window.dispatchEvent(new CustomEvent('ag:lang', { detail: lang }));
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 60);
  }
  function buildLangMenu() {
    $('#langMenu').innerHTML = LANGS.map(l => `<button data-l="${l}"><span>${window.LANG_NAMES[l]}</span><small>${l.toUpperCase()}</small></button>`).join('');
    $('#langBtn').addEventListener('click', e => { e.stopPropagation(); $('#lang').classList.toggle('open'); });
    document.addEventListener('click', () => $('#lang').classList.remove('open'));
    $$('#langMenu button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.l; store.set('ag-lang', lang); applyLang(); }));
  }

  /* ---------- theme ---------- */
  $('#themeBtn').addEventListener('click', () => {
    const n = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = n; store.set('ag-theme', n);
    $('meta[name="theme-color"]').content = n === 'dark' ? '#0A0B12' : '#F3F4F7';
    window.dispatchEvent(new CustomEvent('ag:theme', { detail: n }));
  });
  try { const th = localStorage.getItem('ag-theme'); if (th) html.dataset.theme = JSON.parse(th); } catch (e) {}

  /* ---------- marquee ---------- */
  const MQ = ['USB-C', 'GaN 65W', 'MagSafe', 'Qi2', 'Bluetooth 5.4', 'ANC', '9H Glass', 'PD 3.1', '240W', 'IP68', 'Hi-Res', 'AMOLED'];
  $('#mq').innerHTML = [...MQ, ...MQ].map(x => `<span>${x}</span>`).join('');

  /* ---------- categories ---------- */
  const CAT_IMG = { cases: 'c1_0', chargers: 'ch1_0', cables: 'cb1_0', audio: 'a3_0', power: 'p2_1', protection: 'g1_0', wearables: 'w1_0', car: 'k1_0' };
  const CAT_TINT = { cases: 'rgba(80,70,255,.35)', chargers: 'rgba(212,255,58,.18)', cables: 'rgba(80,70,255,.28)', audio: 'rgba(212,255,58,.16)', power: 'rgba(122,112,255,.3)', protection: 'rgba(120,200,255,.22)', wearables: 'rgba(80,70,255,.3)', car: 'rgba(212,255,58,.15)' };
  const CAT_CLS = { cases: 'big', audio: 'wide' };
  const ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function renderCats() {
    $('#bento').innerHTML = D.cats.map(c => {
      const n = D.products.filter(p => p.cat === c).length;
      return `<a class="cat ${CAT_CLS[c] || ''} rv" href="#shop" data-cat="${c}" style="--tint:${CAT_TINT[c]}">
        <span class="cnt">${String(n).padStart(2, '0')} · ${t('items')}</span>
        <img src="assets/img/p/${CAT_IMG[c]}.webp" alt="" loading="lazy">
        <h3>${t('cat_' + c)}</h3><p>${t('cd_' + c)}</p><span class="go">${ARROW}</span></a>`;
    }).join('');
    $$('#bento .cat').forEach(a => a.addEventListener('click', e => { e.preventDefault(); filter.cat = a.dataset.cat; renderShop(); scrollToEl('#shop'); }));
  }

  /* ---------- shop ---------- */
  const filter = { cat: 'all', q: '', sort: 'f' };
  const SYN = { 'شاحن': 'chargers', 'شواحن': 'chargers', 'كفر': 'cases', 'جراب': 'cases', 'كفرات': 'cases', 'كابل': 'cables', 'وصلة': 'cables', 'سماعة': 'audio', 'سماعات': 'audio', 'سبيكر': 'audio', 'باور': 'power', 'بطارية': 'power', 'حماية': 'protection', 'اسكرينة': 'protection', 'سكرينة': 'protection', 'زجاج': 'protection', 'ساعة': 'wearables', 'ساعات': 'wearables', 'سيارة': 'car', 'حامل': 'car', 'charger': 'chargers', 'case': 'cases', 'cable': 'cables', 'buds': 'audio', 'earbuds': 'audio', 'speaker': 'audio', 'headphones': 'audio', 'power': 'power', 'bank': 'power', 'glass': 'protection', 'watch': 'wearables', 'car': 'car', 'mount': 'car' };
  const tint = hex => { const h = hex.replace('#', ''); const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return `rgba(${r},${g},${b},.55)`; };
  function matches(p, q) {
    if (!q) return true;
    const hay = [p.n, t('cat_' + p.cat), ...p.f.map(f => t('f_' + f)), ...p.f.map(f => TT['f_' + f][1])].join(' ').toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w) || (SYN[w] && SYN[w] === p.cat) || Object.keys(SYN).some(k => k.startsWith(w) && w.length > 2 && SYN[k] === p.cat));
  }
  function renderChips() {
    const all = [['all', D.products.length], ...D.cats.map(c => [c, D.products.filter(p => p.cat === c).length])];
    $('#chips').innerHTML = all.map(([c, n]) => `<button class="chip ${filter.cat === c ? 'on' : ''}" data-c="${c}">${c === 'all' ? t('all') : t('cat_' + c)} <em>${n}</em></button>`).join('');
    $$('#chips .chip').forEach(b => b.addEventListener('click', () => { filter.cat = b.dataset.c; renderShop(); }));
  }
  function card(p) {
    const v0 = p.v[0];
    return `<article class="card" data-id="${p.id}" style="--tint:${tint(v0[0])}">
      ${p.tag ? `<span class="tag ${p.tag}">${t('tag_' + p.tag)}</span>` : ''}
      <button class="qvb" aria-label="${t('view')}"><svg viewBox="0 0 24 24"><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/></svg></button>
      <div class="pic"><img src="${img(p.id)}" alt="${p.n}" loading="lazy" width="720" height="720"></div>
      <div class="body">
        <span class="cat-l">${t('cat_' + p.cat)}</span>
        <h3>${p.n}</h3>
        <div class="feats">${p.f.slice(0, 2).map(f => `<span>${t('f_' + f)}</span>`).join('')}</div>
        <div class="row">
          <div class="price">${p.old ? `<s>${fmt(p.old)}</s>` : ''}${money(p.price)}</div>
          ${p.v.length > 1 ? `<div class="dots">${p.v.map((v, i) => `<button style="--c:${v[0]}" data-v="${i}" class="${i ? '' : 'on'}" aria-label="colour ${i + 1}"></button>`).join('')}</div>` : ''}
          <button class="addb" aria-label="${t('add')}"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
        </div>
      </div></article>`;
  }
  function renderShop() {
    renderChips();
    let list = D.products.filter(p => (filter.cat === 'all' || p.cat === filter.cat) && matches(p, filter.q));
    if (filter.sort === 'l') list = list.slice().sort((a, b) => a.price - b.price);
    if (filter.sort === 'h') list = list.slice().sort((a, b) => b.price - a.price);
    const g = $('#grid'); g.innerHTML = list.map(card).join('');
    $('#empty').hidden = list.length > 0;
    $('#emptyWa').href = wa(t('waAsk') + (filter.q ? `: ${filter.q}` : ''));
    $$('.card', g).forEach(c => {
      const p = pById(c.dataset.id); let vi = 0;
      $$('.dots button', c).forEach(b => b.addEventListener('click', () => {
        vi = +b.dataset.v; $$('.dots button', c).forEach(x => x.classList.toggle('on', x === b));
        const im = $('.pic img', c); im.style.opacity = 0; setTimeout(() => { im.src = img(p.id, vi); im.onload = () => im.style.opacity = 1; }, 150);
        c.style.setProperty('--tint', tint(p.v[vi][0]));
      }));
      $('.addb', c).addEventListener('click', e => { addToCart({ id: p.id, v: vi }); const b = e.currentTarget; b.classList.add('ok'); b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12l4 4 10-10"/></svg>'; setTimeout(() => { b.classList.remove('ok'); b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>'; }, 1400); flyTo($('.pic img', c)); });
      $('.qvb', c).addEventListener('click', () => openQV(p, vi));
      $('.pic', c).addEventListener('click', () => openQV(p, vi));
    });
    if (window.gsap) gsap.fromTo($$('.card', g), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .04, ease: 'power3.out', overwrite: true });
  }
  $('#q').addEventListener('input', e => { filter.q = e.target.value.trim(); renderShop(); });
  $('#sort').addEventListener('change', e => { filter.sort = e.target.value; renderShop(); });

  /* ---------- quick view ---------- */
  function openQV(p, vi = 0) {
    let q = 1;
    const qv = $('#qv');
    const draw = () => {
      $('#qvImg').style.setProperty('--tint', tint(p.v[vi][0]));
      $('#qvImg').innerHTML = `<img src="${img(p.id, vi)}" alt="${p.n}">`;
      $('#qvBody').innerHTML = `<span class="cat-l" style="color:var(--tx3);font-size:13px">${t('cat_' + p.cat)}</span><h3>${p.n}</h3>
        <div class="price">${p.old ? `<s>${fmt(p.old)}</s>` : ''}${money(p.price)}</div>
        <ul>${p.f.map(f => `<li>${t('f_' + f)}</li>`).join('')}</ul>
        ${p.v.length > 1 ? `<div><small style="color:var(--tx3);font-size:13px">${t('colors')}</small><div class="dots" style="margin-top:8px">${p.v.map((v, i) => `<button style="--c:${v[0]};width:28px;height:28px" data-v="${i}" class="${i === vi ? 'on' : ''}"></button>`).join('')}</div></div>` : ''}
        <div class="qv-act"><div class="qty"><button data-q="-1">−</button><b>${q}</b><button data-q="1">+</button></div><button class="btn pri" id="qvAdd">${t('add')}</button></div>
        <p class="note" style="margin:0">${t('samplePrices')}</p>`;
      $$('#qvBody .dots button').forEach(b => b.addEventListener('click', () => { vi = +b.dataset.v; draw(); }));
      $$('#qvBody [data-q]').forEach(b => b.addEventListener('click', () => { q = Math.max(1, q + +b.dataset.q); $('#qvBody .qty b').textContent = q; }));
      $('#qvAdd').addEventListener('click', () => { addToCart({ id: p.id, v: vi }, q); closeQV(); });
    };
    draw(); qv.hidden = false;
    if (window.gsap) { gsap.fromTo('.modal-card', { y: 40, opacity: 0, scale: .97 }, { y: 0, opacity: 1, scale: 1, duration: .55, ease: 'power3.out' }); gsap.fromTo('.modal-bg', { opacity: 0 }, { opacity: 1, duration: .4 }); }
    lenis && lenis.stop();
  }
  function closeQV() { $('#qv').hidden = true; lenis && lenis.start(); }
  $$('#qv [data-close]').forEach(b => b.addEventListener('click', closeQV));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeQV(); closeCart(); } });

  /* ---------- cart ---------- */
  let cart = store.get('ag-cart', []);
  const keyOf = it => it.custom ? 'x' + JSON.stringify(it.custom) : it.id + '|' + it.v;
  function itemInfo(it) {
    if (it.custom) { const c = it.custom; return { name: t('customCase'), sub: `${c.model} · ${t('m_' + c.mat)}${c.name ? ' · “' + c.name + '”' : ''}`, price: c.price, img: c.img }; }
    const p = pById(it.id); if (!p) return null;
    return { name: p.n, sub: t('cat_' + p.cat), price: p.price, img: img(p.id, it.v) };
  }
  function addToCart(it, q = 1) {
    const k = keyOf(it); const ex = cart.find(x => keyOf(x) === k);
    if (ex) ex.q += q; else cart.push(Object.assign({ q }, it));
    saveCart(); toast(t('added'));
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  function saveCart() { store.set('ag-cart', cart); renderCart(); }
  function renderCart() {
    const n = cart.reduce((s, x) => s + x.q, 0);
    const ce = $('#cartCount'); ce.textContent = n; ce.classList.toggle('has', n > 0);
    const list = $('#drList');
    if (!cart.length) { list.innerHTML = `<div class="dr-empty"><span class="ic"><b>ع<i></i></b></span><p>${t('cartEmpty')}</p></div>`; $('#drFoot').style.display = 'none'; return; }
    $('#drFoot').style.display = '';
    let tot = 0;
    list.innerHTML = cart.map((it, i) => { const inf = itemInfo(it); if (!inf) return ''; tot += inf.price * it.q; return `<div class="dr-item"><img src="${inf.img}" alt=""><div><b>${inf.name}</b><small>${inf.sub}</small><div class="qty"><button data-i="${i}" data-d="-1">−</button><b>${it.q}</b><button data-i="${i}" data-d="1">+</button></div></div><div style="display:grid;justify-items:end;gap:6px"><button class="rm" data-rm="${i}" aria-label="remove"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button><span class="p">${fmt(inf.price * it.q)} ${t('currency')}</span></div></div>`; }).join('');
    $('#drTotal').textContent = `${fmt(tot)} ${t('currency')}`;
    $$('#drList [data-d]').forEach(b => b.addEventListener('click', () => { const it = cart[+b.dataset.i]; it.q += +b.dataset.d; if (it.q < 1) cart.splice(+b.dataset.i, 1); saveCart(); }));
    $$('#drList [data-rm]').forEach(b => b.addEventListener('click', () => { cart.splice(+b.dataset.rm, 1); saveCart(); }));
  }
  function openCart() { $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); }
  function closeCart() { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
  $('#cartBtn').addEventListener('click', openCart);
  $$('[data-dclose]').forEach(b => b.addEventListener('click', closeCart));
  const wa = msg => `https://wa.me/${D.whatsapp}?text=${encodeURIComponent(msg)}`;
  $('#sendWa').addEventListener('click', () => {
    let tot = 0;
    const lines = cart.map(it => { const inf = itemInfo(it); tot += inf.price * it.q; return `• ${inf.name} (${inf.sub}) × ${it.q} = ${fmt(inf.price * it.q)} ${t('currency')}`; });
    const msg = [t('waHello'), '', ...lines, '', `${t('subtotal')}: ${fmt(tot)} ${t('currency')}`, `${t('name')}: ${$('#oName').value}`, `${t('address')}: ${$('#oAddr').value}`, $('#oNotes').value ? `${t('notes')}: ${$('#oNotes').value}` : ''].filter(x => x !== null).join('\n');
    window.open(wa(msg), '_blank');
  });

  /* fly-to-cart */
  function flyTo(src) {
    if (!src || !window.gsap) return;
    const r = src.getBoundingClientRect(), c = $('#cartBtn').getBoundingClientRect();
    const f = src.cloneNode(); Object.assign(f.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', zIndex: 99, pointerEvents: 'none', objectFit: 'contain' });
    document.body.appendChild(f);
    gsap.to(f, { left: c.left + c.width / 2 - 20, top: c.top + c.height / 2 - 20, width: 40, height: 40, opacity: .2, duration: .8, ease: 'power3.in', onComplete: () => f.remove() });
  }
  let toastT;
  function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }

  /* ---------- studio ---------- */
  const S = D.studio;
  const st = store.get('ag-studio', null) || { model: 0, mat: 0, color: 0, name: '' };
  function stPrice() { return S.materials[st.mat][1] + (st.name.trim() ? S.engrave : 0); }
  function emitStudio() { window.dispatchEvent(new CustomEvent('ag:studio', { detail: { mat: S.materials[st.mat][0], color: S.colors[st.color], name: st.name, model: S.models[st.model] } })); store.set('ag-studio', st); }
  function renderStudio() {
    $('#stModels').innerHTML = S.models.map((m, i) => `<button class="${i === st.model ? 'on' : ''}" data-i2="${i}">${m}</button>`).join('');
    $('#stMats').innerHTML = S.materials.map((m, i) => `<button class="${i === st.mat ? 'on' : ''}" data-i2="${i}">${t('m_' + m[0])}</button>`).join('');
    $('#stColors').innerHTML = S.colors.map((c, i) => `<button class="${i === st.color ? 'on' : ''}" data-i2="${i}" style="--c:${c}" aria-label="${c}"></button>`).join('');
    $('#stName').value = st.name;
    $('#stPrice').textContent = fmt(stPrice());
    const bind = (sel, key) => $$(sel + ' button').forEach(b => b.addEventListener('click', () => { st[key] = +b.dataset.i2; renderStudio(); emitStudio(); }));
    bind('#stModels', 'model'); bind('#stMats', 'mat'); bind('#stColors', 'color');
  }
  $('#stName').addEventListener('input', e => { st.name = e.target.value; $('#stPrice').textContent = fmt(stPrice()); emitStudio(); });
  $('#stAdd').addEventListener('click', () => {
    const shot = window.AGStudioShot ? window.AGStudioShot() : img('c1', 0);
    addToCart({ custom: { model: S.models[st.model], mat: S.materials[st.mat][0], color: S.colors[st.color], name: st.name.trim(), price: stPrice(), img: shot } });
    flyTo($('#studioGL'));
  });

  /* ---------- lab ---------- */
  const LAB = [[15, 55, 'ch4'], [20, 30, 'ch3'], [35, 25, 'ch2'], [65, 20, 'ch1']];
  const OLD = 85; let labSel = 3, labAnim;
  function renderLab() {
    $('#labPhones').innerHTML = [['old', t('labOld'), OLD], ['fast', `Volt ${LAB[labSel][0]}W`, LAB[labSel][1]]].map(([k, l, m]) => `<div class="lp ${k}"><h4>${l}</h4><div class="lp-ph"><div class="lp-fill"></div><div class="lp-pct">8%</div></div><div class="lp-t"><b>${m}</b> ${t('labTo50')}</div></div>`).join('');
    $('#labW').innerHTML = LAB.map((x, i) => `<button class="${i === labSel ? 'on' : ''}" data-i2="${i}">${x[0]}W</button>`).join('');
    $$('#labW button').forEach(b => b.addEventListener('click', () => { labSel = +b.dataset.i2; renderLab(); runLab(); }));
    $('#labX').textContent = (OLD / LAB[labSel][1]).toFixed(1) + '×';
    const p = pById(LAB[labSel][2]);
    $('#labRec').innerHTML = `<img src="${img(p.id)}" alt=""><div><small>${t('labRec')}</small><b>${p.n}</b> · ${fmt(p.price)} ${t('currency')}</div>`;
    $('#labRec').onclick = e => { e.preventDefault(); openQV(p, 0); };
  }
  function runLab() {
    if (!window.gsap) return;
    labAnim && labAnim.kill();
    const fills = $$('.lp-fill'), pcts = $$('.lp-pct'); const T0 = 5;
    const mins = [OLD, LAB[labSel][1]];
    labAnim = gsap.timeline();
    mins.forEach((m, i) => {
      const o = { v: 8 };
      labAnim.to(o, { v: 50, duration: T0 * m / OLD, ease: 'none', onUpdate: () => { fills[i].style.height = o.v + '%'; pcts[i].textContent = Math.round(o.v) + '%'; } }, 0);
    });
  }
  $('#labRun').addEventListener('click', runLab);

  /* ---------- bundles ---------- */
  function renderBundles() {
    $('#bundleGrid').innerHTML = D.bundles.map((b, i) => {
      const ps = b.items.map(pById), sum = ps.reduce((s, p) => s + p.price, 0), now = Math.round(sum * (1 - b.save / 100) / 10) * 10;
      return `<div class="bundle ${i === 1 ? 'feat' : ''} rv"><span class="b-save">-${b.save}%</span><div class="b-pics">${ps.map(p => `<img src="${img(p.id)}" alt="" loading="lazy">`).join('')}</div>
        <h3>${t('b_' + b.id)}</h3><p>${t('bd_' + b.id)}</p>
        <div class="row"><div class="price"><s>${fmt(sum)}</s>${money(now)}</div><button class="btn ${i === 1 ? 'ghost' : 'pri'}" data-b="${b.id}">${t('addBundle')}</button></div></div>`;
    }).join('');
    $$('#bundleGrid [data-b]').forEach(btn => btn.addEventListener('click', () => { const b = D.bundles.find(x => x.id === btn.dataset.b); b.items.forEach(id => addToCart({ id, v: 0 })); toast(`${t('b_' + b.id)} · ${t('added')}`); }));
  }

  /* ---------- why & reviews ---------- */
  const WHY_IC = [
    '<path d="M12 2.5 4 5.5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10v-6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M9 7.5h6M10 18h4"/><path d="m3 9 2-2M21 9l-2-2"/>',
    '<path d="M2.5 7h11v9h-11z"/><path d="M13.5 10h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    '<path d="M4 9a8 8 0 0 1 14-3l2 2"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M4 20v-4h4"/>',
    '<rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M2.5 10h19M6.5 15h4"/>',
    '<path d="M4 18.5V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8z"/><path d="M8.5 9h7M8.5 12h4"/>'];
  function renderWhy() {
    $('#whyGrid').innerHTML = WHY_IC.map((ic, i) => `<div class="wy rv"><span class="n">0${i + 1}</span><i><svg viewBox="0 0 24 24">${ic}</svg></i><h3>${t('w' + (i + 1) + 't')}</h3><p>${t('w' + (i + 1) + 'd')}</p></div>`).join('');
  }
  const REV = [['محمود س.', 'Mahmoud S.', 'Volt GaN 65W'], ['سارة ع.', 'Sara A.', 'Atelier Leather'], ['يوسف ك.', 'Youssef K.', 'Aura Buds Lite']];
  function renderRevs() {
    $('#revGrid').innerHTML = REV.map((r, i) => `<div class="rev rv"><div class="stars">★★★★★</div><q>${t('r' + (i + 1))}</q><div class="who"><span class="av">${(lang === 'ar' ? r[0] : r[1])[0]}</span><div><b>${lang === 'ar' ? r[0] : r[1]}</b><small>${r[2]}</small></div></div></div>`).join('');
  }

  /* ---------- contact ---------- */
  function renderContact() {
    const w = wa(t('waAsk'));
    ['#ctaWa', '#infoWa', '#fab'].forEach(s => $(s).href = w);
    $('#infoWa').textContent = D.phone;
    $('#infoMail').href = 'mailto:' + D.email; $('#infoMail').textContent = D.email;
    $('#yr').textContent = new Date().getFullYear();
  }

  function renderAll() { renderCats(); renderShop(); renderStudio(); renderLab(); renderBundles(); renderWhy(); renderRevs(); renderContact(); renderCart(); revealBind(); }

  /* ---------- nav / header ---------- */
  $('#burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $$('#nav a, .logo, .btns a, .scroll').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h && h.startsWith('#')) { e.preventDefault(); document.body.classList.remove('menu-open'); scrollToEl(h); } }));
  let lenis = null;
  function scrollToEl(h) { const el = h === '#top' ? 0 : $(h); if (lenis) lenis.scrollTo(el, { offset: -80, duration: 1.4 }); else (el ? el.scrollIntoView({ behavior: 'smooth' }) : scrollTo({ top: 0, behavior: 'smooth' })); }

  /* ---------- motion ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function revealBind() {
    if (!window.gsap || !window.ScrollTrigger) { $$('.rv').forEach(e => e.classList.remove('rv')); return; }
    $$('.rv').forEach(el => {
      if (el._rv) return; el._rv = 1;
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, delay: (+el.dataset.d || 0) });
    });
  }
  function counters() {
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count, dec = +el.dataset.dec || 0, o = { v: 0 };
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', delay: .4, onUpdate: () => el.textContent = o.v.toFixed(dec) });
    });
  }
  function heroIn() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hdr', { y: -30, opacity: 0, duration: 1 }, 0)
      .from('.eyebrow', { y: 20, opacity: 0, duration: .9 }, .1)
      .from('.h1 .ln > span', { yPercent: 110, duration: 1.2, stagger: .12 }, .15)
      .from('.hero .lead', { y: 20, opacity: 0, duration: 1 }, .45)
      .from('.btns > *', { y: 20, opacity: 0, duration: .9, stagger: .08 }, .55)
      .from('.stats li', { y: 20, opacity: 0, duration: .9, stagger: .07 }, .65)
      .from('.hero-batt', { x: lang === 'ar' ? -40 : 40, opacity: 0, duration: 1 }, .8);
    counters();
    // battery fills while you scroll through hero
    const o = { v: 12 };
    const setB = v => { $('#battPct').textContent = Math.round(v) + '%'; $('#battBar').style.width = v + '%'; };
    gsap.to(o, { v: 46, duration: 2.4, ease: 'power2.out', delay: .9, onUpdate: () => setB(o.v), onComplete: () => {
      ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => setB(46 + s.progress * 54) });
    } });
  }
  function intro(done) {
    const el = $('#intro');
    if (reduce || sessionStorage.getItem('ag-intro')) { el.remove(); done(); return; }
    try { sessionStorage.setItem('ag-intro', '1'); } catch (e) {}
    const o = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => { el.remove(); } });
    tl.to('.intro .ic', { scale: 1, opacity: 1, duration: .8, ease: 'back.out(1.6)' })
      .to(o, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { $('#introPct').textContent = Math.round(o.v); $('.intro-bar span').style.width = o.v + '%'; } }, .3)
      .to('.intro .ic b i', { scale: 1, duration: .5, ease: 'back.out(3)' }, 1.55)
      .to('.intro .ic', { boxShadow: '0 0 0 14px rgba(212,255,58,.0), 0 0 80px rgba(212,255,58,.55)', duration: .35 }, 1.6)
      .add(done, 1.95)
      .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: .9, ease: 'power3.inOut' }, 2.0);
    el.style.clipPath = 'circle(150% at 50% 50%)';
  }

  function initMotion() {
    if (!window.gsap) { $('#intro') && $('#intro').remove(); return; }
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tm => lenis.raf(tm * 1000)); gsap.ticker.lagSmoothing(0);
      window.AGLenis = lenis;
    }
    const hdr = $('#hdr');
    ScrollTrigger.create({ start: 40, onToggle: s => hdr.classList.toggle('scrolled', s.isActive) });
    // active nav
    $$('#nav a').forEach(a => { const s = $(a.getAttribute('href')); if (s) ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: x => a.classList.toggle('on', x.isActive) }); });
    // headings
    $$('.sec-head').forEach(h => gsap.from(h.children, { y: 40, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 85%' } }));
    gsap.from('.st-stage', { scale: .92, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '#studio', start: 'top 75%' } });
    ScrollTrigger.create({ trigger: '#lab', start: 'top 55%', once: true, onEnter: runLab });
    gsap.to('#ctaPath', { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.cta-card', start: 'top 75%' } });
    gsap.from('.cta-info li', { x: lang === 'ar' ? -30 : 30, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.cta-card', start: 'top 70%' } });
    revealBind();
    intro(heroIn);
  }

  buildLangMenu();
  applyLang();
  initMotion();
  setTimeout(emitStudio, 50);
  window.addEventListener('ag:scene-ready', emitStudio);
})();
