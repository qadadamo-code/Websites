/* لمّة · Lamma Kitchen — front-end */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => Number(n).toLocaleString('en-US');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IMG = k => /^(https?:|\/|uploads\/)/.test(k) ? k : `assets/img/${k}.webp`;
  const IMGS = k => /^(https?:|\/|uploads\/)/.test(k) ? k : `assets/img/${k}-s.webp`;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  let DATA = null, CART = store.get('lamma-cart', []), activeCat = 'all', query = '';

  /* ---------- intro ---------- */
  document.body.classList.add('loading');
  const hideIntro = () => { $('#intro').classList.add('out'); document.body.classList.remove('loading'); };
  const introSeen = sessionStorage.getItem('lamma-intro');
  setTimeout(hideIntro, introSeen ? 300 : 2100);
  try { sessionStorage.setItem('lamma-intro', '1'); } catch {}

  /* ---------- theme ---------- */
  $('#themeBtn').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    $('meta[name=theme-color]').content = t === 'dark' ? '#3B0B1F' : '#FBF4E8';
    try { localStorage.setItem('lamma-theme', t); } catch {}
  });

  /* ---------- header ---------- */
  const hdr = $('#hdr');
  addEventListener('scroll', () => hdr.classList.toggle('stuck', scrollY > 30), { passive: true });
  const setHH = () => document.documentElement.style.setProperty('--hh', hdr.offsetHeight + 'px');
  setHH(); addEventListener('resize', setHH);

  /* ---------- toast ---------- */
  let tt;
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); };

  /* ---------- data ---------- */
  async function load() {
    try {
      const r = await fetch('api/menu.php', { cache: 'no-store' });
      if (!r.ok) throw 0;
      const j = await r.json();
      if (!j.items) throw 0;
      return j;
    } catch {
      const r = await fetch('data/menu.json', { cache: 'no-store' });
      return r.json();
    }
  }

  const S = () => DATA.settings || {};
  const waLink = text => `https://wa.me/${(S().whatsapp || '201203101104').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  const catName = id => (DATA.cats.find(c => c.id === id) || {}).name || '';
  const minPrice = it => it.variants.length ? Math.min(...it.variants.map(v => +v.price)) : null;

  function applySettings() {
    const s = S();
    if (s.announce) $('#announceText').textContent = s.announce; else $('#announce').hidden = true;
    if (s.phone) { $('#fPhone').textContent = s.phone; $('#fPhone').href = 'tel:' + s.phone.replace(/\s/g, ''); }
    $('#fWa').href = waLink('أهلًا لمّة 👋');
    if (s.area) $('#fArea').textContent = s.area;
    if (s.hours) $('#fHours').textContent = s.hours;
    if (s.facebook && s.facebook !== '#') $('#fFb').href = s.facebook; else $('#fFb').remove();
    if (s.instagram && s.instagram !== '#') $('#fIg').href = s.instagram; else $('#fIg').remove();
    if (s.deliveryNote) $('#drNote').textContent = s.deliveryNote;
    $('#yr').textContent = new Date().getFullYear();
    const n = DATA.items.length; const st = $('[data-count]'); if (st) st.textContent = n;
  }

  /* ---------- marquee + categories ---------- */
  function renderMarquee() {
    const names = ['محشي مشكل', 'طاجن بامية باللحمة', 'مكرونة بشاميل', 'حمام محشي فريك', 'ورق عنب بدبس الرمان', 'فراخ بالسمن البلدي', 'ملوخية بالطشة', 'رقاق لحمة', 'كبسة فراخ', 'فتة بالخل والتوم'];
    const html = names.map(n => `<span>${n}</span>`).join('');
    $('#marquee').innerHTML = html + html;
  }
  function renderCats() {
    $('#catsRail').innerHTML = DATA.cats.map(c => `<button class="cat reveal" data-cat="${esc(c.id)}"><img src="${IMGS(c.img)}" alt="" loading="lazy"><b>${esc(c.name)}<small>${DATA.items.filter(i => i.cat === c.id).length} صنف</small></b></button>`).join('');
    $$('#catsRail .cat').forEach(b => b.addEventListener('click', () => { setCat(b.dataset.cat); $('#menu').scrollIntoView(); }));
    $('#chips').innerHTML = `<button class="chip on" data-cat="all">الكل <i>${DATA.items.length}</i></button>` +
      DATA.cats.map(c => `<button class="chip" data-cat="${esc(c.id)}">${esc(c.name)} <i>${DATA.items.filter(i => i.cat === c.id).length}</i></button>`).join('');
    $$('#chips .chip').forEach(b => b.addEventListener('click', () => setCat(b.dataset.cat)));
  }
  function setCat(id) {
    activeCat = id;
    $$('#chips .chip').forEach(b => b.classList.toggle('on', b.dataset.cat === id));
    const on = $(`#chips .chip[data-cat="${id}"]`), ch = $('#chips'); if (on) ch.scrollTo({ left: on.offsetLeft - ch.clientWidth / 2 + on.offsetWidth / 2, behavior: 'smooth' });
    const c = DATA.cats.find(x => x.id === id);
    $('#catNote').textContent = c ? c.note || '' : 'المنيو كله قدامك.. دوس على أي صنف عشان تختار الحجم';
    renderGrid();
  }

  /* ---------- menu grid ---------- */
  const norm = s => String(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْ]/g, '').toLowerCase();
  const rotOf = it => { const same = DATA.items.filter(x => x.img === it.img); return same.indexOf(it) % 4; };
  function renderGrid() {
    const q = norm(query.trim());
    const list = DATA.items.filter(i => (activeCat === 'all' || i.cat === activeCat) && (!q || norm(i.name + ' ' + i.desc + ' ' + catName(i.cat)).includes(q)));
    $('#empty').hidden = list.length > 0;
    $('#grid').innerHTML = list.map(i => {
      const mp = minPrice(i), off = i.available === false;
      const price = mp === null ? `<small>${esc(i.note || 'السعر بالطلب')}</small><b>اسأل علينا</b>`
        : `<small>${i.variants.length > 1 ? 'يبدأ من' : esc(i.variants[0].label)}</small><b>${fmt(mp)}<span>ج</span></b>`;
      return `<article class="card${off ? ' off' : ''}" data-id="${esc(i.id)}">
        <div class="card__img"><img class="rot${rotOf(i)}" src="${IMGS(i.img)}" alt="${esc(i.name)}" loading="lazy" width="400" height="400">${i.badge ? `<span class="badge${i.badge.includes('عرض') ? '' : ' gold'}">${esc(i.badge)}</span>` : ''}${off ? '<div class="soldout"><span>خلص النهارده</span></div>' : ''}</div>
        <div class="card__body"><h3>${esc(i.name)}</h3><p>${esc(i.desc || catName(i.cat))}</p>
        <div class="card__foot"><div class="price">${price}</div><button class="add" aria-label="ضيف ${esc(i.name)}"${off ? ' disabled' : ''}>+</button></div></div></article>`;
    }).join('');
    const io = new IntersectionObserver(es => es.forEach((e, k) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), (k % 6) * 50); io.unobserve(e.target); } }), { rootMargin: '0px 0px -40px' });
    $$('#grid .card').forEach(c => { io.observe(c); if (!c.classList.contains('off')) c.addEventListener('click', () => openSheet(c.dataset.id)); });
  }
  $('#search').addEventListener('input', e => { query = e.target.value; if (query && activeCat !== 'all') setCat('all'); else renderGrid(); });

  /* ---------- item sheet ---------- */
  let cur = null, curV = 0, curQ = 1;
  function openSheet(id) {
    const it = DATA.items.find(i => i.id === id); if (!it) return;
    cur = it; curV = 0; curQ = 1;
    $('#shImg').src = IMG(it.img); $('#shImg').alt = it.name; $('#shImg').className = rotOf(it) === 2 ? 'rot2' : '';
    $('#shCat').textContent = catName(it.cat);
    $('#shName').textContent = it.name;
    $('#shDesc').textContent = it.desc || (it.note ? it.note : 'معمول طازة يوم الطلب، بنفس طعم البيت.');
    $('#shNote').value = '';
    $('#shVars').innerHTML = it.variants.length
      ? it.variants.map((v, k) => `<button class="var${k ? '' : ' on'}" data-v="${k}"><span>${esc(v.label)}</span><b>${fmt(v.price)} ج</b></button>`).join('')
      : `<div class="var on"><span>${esc(it.note || 'السعر بالطلب')}</span><b>نأكدلك السعر</b></div>`;
    $$('#shVars .var[data-v]').forEach(b => b.addEventListener('click', () => { curV = +b.dataset.v; $$('#shVars .var').forEach(x => x.classList.toggle('on', x === b)); sheetPrice(); }));
    sheetPrice();
    $('#sheet').hidden = false; document.body.style.overflow = 'hidden';
  }
  function sheetPrice() {
    $('#shQty').textContent = curQ;
    const v = cur.variants[curV];
    $('#shPrice').textContent = v ? fmt(v.price * curQ) + ' ج' : 'السعر يتأكد';
  }
  $$('#sheet [data-q]').forEach(b => b.addEventListener('click', () => { curQ = Math.max(1, Math.min(50, curQ + +b.dataset.q)); sheetPrice(); }));
  const closeSheet = () => { $('#sheet').hidden = true; document.body.style.overflow = ''; };
  $$('#sheet [data-close]').forEach(b => b.addEventListener('click', closeSheet));
  $('#shAdd').addEventListener('click', () => {
    const v = cur.variants[curV];
    addToCart({ id: cur.id, name: cur.name, label: v ? v.label : (cur.note || 'السعر بالطلب'), price: v ? +v.price : null, img: cur.img, note: $('#shNote').value.trim() }, curQ);
    closeSheet();
  });

  /* ---------- cart ---------- */
  const keyOf = l => [l.id, l.label, l.note || ''].join('|');
  function addToCart(line, qty = 1, silent) {
    const k = keyOf(line), ex = CART.find(l => keyOf(l) === k);
    if (ex) ex.qty += qty; else CART.push({ ...line, qty });
    saveCart();
    if (!silent) {
      toast(`اتضاف ${line.name} للمّتك ✓`);
      [$('#cartBtn'), $('#fab')].forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    }
  }
  const total = () => CART.reduce((s, l) => s + (l.price || 0) * l.qty, 0);
  const count = () => CART.reduce((s, l) => s + l.qty, 0);
  function saveCart() { store.set('lamma-cart', CART); renderCart(); }
  function renderCart() {
    const n = count(), t = total();
    $('#cartCount').textContent = n; $('#fabCount').textContent = n; $('#fabTotal').textContent = fmt(t) + ' ج';
    $('#fab').classList.toggle('show', n > 0);
    $('#drCount').textContent = n ? `(${n} صنف)` : '';
    $('#drEmpty').hidden = n > 0; $('#checkout').hidden = !n; $('#drFoot').hidden = !n;
    $('#drTotal').textContent = fmt(t) + ' ج' + (CART.some(l => l.price === null) ? ' +' : '');
    $('#lines').innerHTML = CART.map((l, k) => `<li class="line"><img src="${IMGS(l.img)}" alt="">
      <div><b>${esc(l.name)}</b><small>${esc(l.label)}${l.note ? ' · ' + esc(l.note) : ''}</small><span class="lp">${l.price === null ? 'السعر يتأكد' : fmt(l.price * l.qty) + ' ج'}</span></div>
      <div class="qty"><button data-k="${k}" data-d="1" aria-label="زوّد">+</button><output>${l.qty}</output><button data-k="${k}" data-d="-1" aria-label="قلّل">−</button></div></li>`).join('');
    $$('#lines [data-k]').forEach(b => b.addEventListener('click', () => {
      const l = CART[+b.dataset.k]; l.qty += +b.dataset.d; if (l.qty <= 0) CART.splice(+b.dataset.k, 1); saveCart();
    }));
  }
  const openDrawer = () => { $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeDrawer = () => { $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  $('#cartBtn').addEventListener('click', openDrawer); $('#fab').addEventListener('click', openDrawer);
  $$('#drawer [data-close]').forEach(b => b.addEventListener('click', closeDrawer));
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeSheet(); } });

  // remember checkout fields
  const CO = store.get('lamma-customer', {});
  $$('#checkout [name]').forEach(f => { if (CO[f.name] && ['name', 'phone', 'addr', 'pay'].includes(f.name)) f.value = CO[f.name]; });

  $('#sendWa').addEventListener('click', () => {
    const f = $('#checkout');
    if (!f.reportValidity()) return;
    const d = Object.fromEntries(new FormData(f));
    const phone = d.phone.replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g, '');
    if (phone.length < 10) { toast('اكتب رقم موبايل صحيح'); f.phone.focus(); return; }
    store.set('lamma-customer', { name: d.name, phone: d.phone, addr: d.addr, pay: d.pay });
    const lines = CART.map(l => `• ${l.qty} × ${l.name} (${l.label})${l.note ? ` [${l.note}]` : ''} = ${l.price === null ? 'يتأكد' : fmt(l.price * l.qty) + ' ج'}`);
    const msg = ['أهلًا لمّة 👋 عايز أطلب:', '', ...lines, '', `الإجمالي: ${fmt(total())} ج${CART.some(l => l.price === null) ? ' + أصناف سعرها يتأكد' : ''} (من غير التوصيل)`, '',
      `الاسم: ${d.name}`, `الموبايل: ${d.phone}`, `العنوان: ${d.addr}`, `المعاد: ${d.day} · ${d.time}`, `الدفع: ${d.pay}`, d.notes ? `ملاحظات: ${d.notes}` : ''].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n');
    fetch('api/order.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: d, lines: CART, total: total() }), keepalive: true }).catch(() => {});
    open(waLink(msg), '_blank');
    toast('الأوردر اتفتح في الواتساب.. ابعته وإحنا هنرد عليك 💛');
  });

  /* ---------- lamma builder ---------- */
  const find = (name, lbl) => {
    const it = DATA.items.find(i => i.name === name && i.available !== false); if (!it || !it.variants.length) return null;
    const v = (lbl && it.variants.find(x => x.label.includes(lbl))) || it.variants[0];
    return { it, v };
  };
  let mood = 'family', plan = [];
  function buildPlan(n) {
    const c = d => Math.max(1, Math.ceil(n / d));
    const tray = n <= 5 ? ['وسط', 1] : ['كبير', c(10)];
    const tag = n <= 4 ? ['وسط باللحمة', 1] : ['كبير باللحمة', c(7)];
    const P = {
      family: [['محشي مشكل', null, c(4)], ['فراخ محمرة بالسمن البلدي', null, c(3)], ['طاجن بامية', tag[0], tag[1]], ['أرز بالشعرية', null, c(4)], ['سلطة خضراء', null, c(6)]],
      feast: [['حمام محشي أرز', null, c(4)], ['لحمة كباب حلة', null, c(4)], ['مكرونة بشاميل', tray[0], tray[1]], ['محشي ورق عنب', null, c(5)], ['أرز بسمتي بالمكسرات والزبيب', null, c(4)], ['سلطة زبادي', null, c(8)], ['سلطة طحينة', null, c(8)]],
      light: [['مكرونة بشاميل', tray[0], tray[1]], ['لازانيا فراخ وجبن', tray[0], tray[1]], ['سمبوسك جبنة', null, c(8)], ['شوربة لسان عصفور', null, n], ['سلطة خضراء', null, c(6)]]
    }[mood];
    return P.map(([name, lbl, q]) => { const f = find(name, lbl); return f && { ...f, q }; }).filter(Boolean);
  }
  function renderBuilder() {
    const n = +$('#pplRange').value;
    $('#ppl').textContent = n;
    $('#pplRange').style.setProperty('--p', ((n - 2) / 28 * 100) + '%');
    plan = buildPlan(n);
    const t = plan.reduce((s, p) => s + p.v.price * p.q, 0);
    $('#buildList').innerHTML = plan.map((p, k) => `<li style="animation-delay:${k * 40}ms"><span>${p.q} × ${esc(p.it.name)}<small>${esc(p.v.label)}</small></span><b>${fmt(p.v.price * p.q)} ج</b></li>`).join('');
    $('#buildTotal').textContent = fmt(t) + ' ج';
    $('#buildPer').textContent = `يعني حوالي ${fmt(Math.round(t / n))} ج للفرد`;
    const imgs = [...new Set(plan.map(p => p.it.img))].slice(0, 5);
    $('#plateStack').innerHTML = imgs.map((im, k) => `<img src="${IMGS(im)}" alt="" style="animation-delay:${k * 60}ms">`).join('');
  }
  let bt; $('#pplRange').addEventListener('input', () => { $('#ppl').textContent = $('#pplRange').value; clearTimeout(bt); bt = setTimeout(renderBuilder, 60); });
  $$('#moods .mood').forEach(b => b.addEventListener('click', () => { mood = b.dataset.mood; $$('#moods .mood').forEach(x => x.classList.toggle('on', x === b)); renderBuilder(); }));
  $('#buildAdd').addEventListener('click', () => {
    plan.forEach(p => addToCart({ id: p.it.id, name: p.it.name, label: p.v.label, price: +p.v.price, img: p.it.img, note: '' }, p.q, true));
    toast(`اللمّة اتضافت للسلة: ${plan.length} أصناف ✓`); openDrawer();
  });

  /* ---------- offers ---------- */
  function renderOffers() {
    const offs = (DATA.offers || []).filter(o => o.active !== false);
    if (!offs.length) { $('#offers').hidden = true; $$('a[href="#offers"]').forEach(a => a.remove()); return; }
    $('#offersRow').innerHTML = offs.map(o => {
      const save = o.old && o.old > o.price ? o.old - o.price : 0;
      return `<article class="offer reveal"><div class="offer__img"><img src="${IMG(o.img)}" alt="${esc(o.title)}" loading="lazy">${save ? `<span class="offer__save">وفّر<b>${fmt(save)}</b>جنيه</span>` : ''}</div>
      <div class="offer__body"><h3>${esc(o.title)}</h3><p>${esc(o.desc)}</p><div class="offer__foot"><div class="offer__price"><b>${fmt(o.price)} ج</b>${o.old ? `<s>${fmt(o.old)}</s>` : ''}</div><button class="btn btn--red" data-offer="${esc(o.id)}">ضيف العرض</button></div></div></article>`;
    }).join('');
    $$('[data-offer]').forEach(b => b.addEventListener('click', () => {
      const o = offs.find(x => x.id === b.dataset.offer);
      addToCart({ id: o.id, name: 'عرض ' + o.title, label: o.desc, price: +o.price, img: o.img, note: '' });
    }));
  }

  /* ---------- custom order ---------- */
  $('#customForm').addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const msg = ['أهلًا لمّة 👋 عندي طلب مخصوص:', '', `الاسم: ${d.name}`, `نوع الطلب: ${d.type}`, d.ppl ? `عدد الأفراد: ${d.ppl}` : '', d.date ? `المعاد: ${d.date}` : '', `التفاصيل: ${d.msg}`].filter(Boolean).join('\n');
    open(waLink(msg), '_blank');
  });

  /* ---------- PWA install + share ---------- */
  let deferred = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) $('#installBtn').textContent = 'لمّة متضافة على موبايلك ✓';
  $('#installBtn').addEventListener('click', async () => {
    if (standalone) return;
    if (deferred) { deferred.prompt(); const r = await deferred.userChoice; if (r.outcome === 'accepted') toast('تمام! لمّة بقت على شاشتك 💛'); deferred = null; return; }
    if (isIOS) { $('#iosHint').hidden = false; return; }
    $('#iosHint').hidden = false;
    $('#iosHint').innerHTML = 'من قايمة المتصفح (⋮) اختار «Add to Home screen» أو «تثبيت التطبيق».';
  });
  $('#shareBtn').addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    if (navigator.share) { try { await navigator.share({ title: 'لمّة · أكل بيتي', text: 'جرّب أكل لمّة.. أكل بيت بجد 😋', url }); } catch {} }
    else { try { await navigator.clipboard.writeText(url); toast('اللينك اتنسخ ✓'); } catch { prompt('انسخ اللينك', url); } }
  });
  if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

  /* ---------- reveals ---------- */
  function reveals() {
    $$('.sec__head,.story__img,.story__text,.how__steps li,.builder__card,.custom__card,.app>*').forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -60px' });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ---------- go ---------- */
  load().then(d => {
    DATA = d;
    applySettings(); renderMarquee(); renderCats(); setCat('all'); renderBuilder(); renderOffers(); renderCart(); reveals();
    const h = location.hash.match(/^#cat-(\w+)/); if (h) setCat(h[1]);
  }).catch(() => { $('#grid').innerHTML = '<p class="empty">حصلت مشكلة في تحميل المنيو، جرّب تعمل ريفريش.</p>'; });
})();
