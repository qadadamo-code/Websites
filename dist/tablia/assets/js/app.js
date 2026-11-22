(() => {
  'use strict';
  const D = window.TB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const fmt = n => Number(n).toLocaleString('en-US');

  /* ================= i18n ================= */
  const T = {
    ar: {},
    en: {
      'ld': 'Setting the tablia…', 'brand': 'Tablia', 'brand.tag': 'Catering · Home food',
      'nav.meals': 'Daily meals', 'nav.khair': 'Charity meals', 'nav.events': 'Events', 'nav.gallery': 'Our work', 'nav.contact': 'Contact',
      'cta.wa': 'Chat on WhatsApp', 'cta.call': 'Call us',
      'hero.eye': 'Daily meals · Cairo & Giza', 'hero.h1': 'Home cooking,', 'hero.h2': 'served on your tablia', 'hero.h3': 'every day.',
      'hero.p': 'Mahshi, molokhia, Dawood Basha kofta, tagines… a complete meal with rice, bread, pickles and dessert, from our kitchen to your home or office.',
      'hero.cta1': "Pick today's meal", 'st.1': 'daily meals', 'st.2': 'starting from', 'st.3': 'followers trust us',
      'egp': 'EGP', 'egp.long': 'EGP', 'stamp.from': 'from',
      'story.k': 'Why Tablia?', 'story.h': 'Just like the family table…<br>without the effort or the dishes.',
      'story.p': 'The tablia is the low round table every Egyptian family gathers around. That is why every meal we make is complete: the main dish, rice, bread, pickles and even dessert. Order for yourself, your family, or your whole team.',
      's1.h': 'Pick your meal', 's1.p': '12 daily meals at clear fixed prices, plus add-ons.',
      's2.h': 'Set your tablia', 's2.p': 'Every meal you add lands on your tablia, then send the whole order in one message.',
      's3.h': 'Delivered hot', 's3.p': 'Confirm the evening before or early morning so it arrives right on time.',
      'meals.k': 'Daily meals menu', 'meals.h': "What's on the tablia today?", 'meals.p': 'Every meal is complete with bread, pickles and dessert. Tap a plate to see what is in it, and add what you like to your tablia.',
      'f.all': 'All', 'f.eco': 'Value 75 – 90', 'f.mid': 'Chicken & kofta', 'f.big': 'Tagines & mahshi',
      'ad.h': 'Add-ons', 'ad.p': 'Add them to any order on your tablia',
      'note': 'Please confirm your order the evening before or on the morning of the order day, so we can prepare it on time.',
      'of.k': 'For companies & offices', 'of.h': "Your whole team's lunch… in one order.", 'of.p': 'Send us the headcount, meals and time, and we prepare daily or weekly team lunches with the same home taste.', 'of.cta': 'Order office lunch',
      'kh.k': 'Charity meals', 'kh.h': 'You bring the good intention…<br><em>we handle the cooking and delivery.</em>', 'kh.p': 'Meals from 50 EGP, so the good reaches those who need it. Choose the meals and quantity, we prepare and deliver.',
      'kh.meals': 'meals', 'kh.cta': 'Order charity meals', 'total': 'Total',
      'ev.k': 'For your events too', 'ev.h': 'Host without the hassle.', 'ev.p': 'High tea, set menus, open buffets and finger food… prices per person, we prepare and set up while you enjoy.',
      't.hightea': 'High Tea', 't.set': 'Set Menu', 't.buffet': 'Open Buffet', 't.finger': 'Finger Food',
      'q.h': 'Request a quote for your event', 'q.p': 'Fill in the details and we reply on WhatsApp with everything.', 'q.pkg': 'Package', 'q.n': 'Guests', 'q.d': 'Event date', 'q.a': 'Area', 'q.a.ph': 'e.g. Nasr City', 'q.est': 'Initial estimate', 'q.cta': 'Send request on WhatsApp',
      'g.k': 'Real work, real events', 'g.h': 'Details make the difference.', 'g.p': 'Photos from events and buffets we served. As one guest put it: “Their food is fancy and the details make the difference!”',
      'c.k': 'Ready for your order', 'c.h': 'Every dish, made with love.', 'c.area': 'Delivering across Cairo & Giza', 'c.hours': 'Taking orders all day',
      'f.brand': 'Tablia Catering', 'fab': 'My tablia', 'fab.m': 'meals',
      'dr.h': 'Your tablia', 'dr.empty': 'Your tablia is empty… pick a meal.', 'dr.del': 'Delivery details', 'dr.name': 'Name', 'dr.addr': 'Address / area', 'dr.today': 'Today', 'dr.tom': 'Tomorrow', 'dr.time': 'Delivery window', 'dr.notes': 'Notes', 'dr.fee': '+ delivery depends on area', 'dr.send': 'Send order on WhatsApp',
      'swipe': 'Swipe to see more packages', 'tm.1': '12 – 3 pm', 'tm.2': '3 – 6 pm', 'tm.3': '6 – 9 pm',
      // dynamic
      'add': 'Add', 'per': 'per person', 'min': 'from {n} guests', 'ask': 'Request this package', 'fa': 'First selection', 'fb': 'Second selection', 'fx': 'Service', 'fpc': 'per piece',
      'added': 'Added to your tablia ✓', 'empty': 'Add a meal first', 'khempty': 'Choose at least one meal', 'inc': 'What is in it', 'tag.fav': 'Favorite', 'tag.chef': "Chef's pick",
      'mq': ['Mixed mahshi', 'Molokhia', 'Dawood Basha', 'Mombar', 'Meat tagine', 'Stuffed chicken', 'Alexandrian liver', 'Chicken pané', 'Shawarma', 'Om Ali']
    }
  };
  // Arabic defaults come from the HTML; collect them once
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (!(k in T.ar)) T.ar[k] = el.innerHTML; });
  $$('[data-ph]').forEach(el => { T.ar[el.dataset.ph] = el.getAttribute('placeholder'); });
  Object.assign(T.ar, {
    'add': 'أضف', 'per': 'للفرد', 'min': 'يبدأ من {n} فرد', 'ask': 'اطلب الباكدج ده', 'fa': 'الأصناف الأولى', 'fb': 'الأصناف الثانية', 'fx': 'الخدمة', 'fpc': 'للقطعة',
    'added': 'اتضافت لطبليتك ✓', 'empty': 'ضيف وجبة الأول', 'khempty': 'اختار وجبة واحدة على الأقل', 'inc': 'مكونات الوجبة', 'tag.fav': 'الأكثر طلبًا', 'tag.chef': 'ترشيح الشيف',
    'mq': ['محشي مشكل', 'ملوخية', 'كفتة داود باشا', 'ممبار', 'طاجن لحمة', 'فراخ محشية', 'كبدة اسكندراني', 'فراخ بانيه', 'شاورما', 'أم علي']
  });

  let lang = store.get('tb-lang', 'ar') === 'en' ? 'en' : 'ar';
  const t = k => (T[lang][k] !== undefined ? T[lang][k] : T.ar[k]);
  const L = o => (o && typeof o === 'object' ? (o[lang] || o.ar) : o);

  function applyLang() {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach(el => { const v = t(el.dataset.i18n); if (v !== undefined) el.innerHTML = v; });
    $$('[data-ph]').forEach(el => el.setAttribute('placeholder', t(el.dataset.ph)));
    $('#langBtn').textContent = lang === 'ar' ? 'EN' : 'ع';
    document.title = lang === 'ar' ? 'طبلية كاترينج | أكل بيتي يومي يوصلك لحد بابك' : 'Tablia Catering | Daily Egyptian home food, delivered';
    renderAll();
  }

  /* ================= plates helpers ================= */
  const plateImg = id => `assets/img/meals/m${id}.webp`;
  function ringLayout(n, opt = {}) {
    // returns positions for n plates on a tablia (percent offsets)
    const out = [];
    if (n <= 0) return out;
    if (n === 1) return [{ x: 0, y: 0, s: opt.single || 46 }];
    const center = n >= 5;
    const around = center ? n - 1 : n;
    const R = opt.R || (around <= 3 ? 22 : 30);
    const s = opt.s || (around <= 3 ? 40 : around <= 5 ? 33 : 29);
    for (let i = 0; i < around; i++) {
      const a = (i / around) * Math.PI * 2 - Math.PI / 2;
      out.push({ x: Math.cos(a) * R, y: Math.sin(a) * R, s });
    }
    if (center) out.push({ x: 0, y: 0, s: opt.cs || s + 3 });
    return out;
  }
  function plateEl(id, p, rot) {
    const d = document.createElement('div');
    d.className = 'plate';
    d.style.cssText = `--x:${p.x}%;--y:${p.y}%;--s:${p.s}%;--rot:${rot || 0}deg`;
    d.innerHTML = `<img src="${plateImg(id)}" alt="" draggable="false">`;
    return d;
  }

  /* ================= hero tablia ================= */
  const heroIds = [8, 1, 11, 4, 12, 6, 10];
  function buildHero() {
    const ring = $('#heroRing'); ring.innerHTML = '';
    const pos = ringLayout(7, { R: 30.5, s: 31, cs: 35 });
    heroIds.forEach((id, i) => ring.appendChild(plateEl(id, pos[i], i * 37)));
  }

  /* ================= marquee ================= */
  function buildMarq() {
    const words = t('mq');
    const html = words.map(w => `<span>${w}</span>`).join('');
    $('#marq').innerHTML = html + html;
  }

  /* ================= cart ================= */
  const cart = store.get('tb-cart', { m: {}, a: {} });
  if (!cart.m) cart.m = {}; if (!cart.a) cart.a = {};
  const saveCart = () => store.set('tb-cart', cart);
  const mealById = id => D.meals.find(m => m.id === +id);
  const cartCount = () => Object.values(cart.m).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart.m).reduce((s, [id, q]) => s + mealById(id).price * q, 0) + Object.entries(cart.a).reduce((s, [id, q]) => s + D.addons.find(a => a.id === id).price * q, 0);

  function stepperHTML(q, kind, id) {
    return `<span class="stepper" data-kind="${kind}" data-id="${id}"><button type="button" data-d="-1" aria-label="-">−</button><b>${q}</b><button type="button" data-d="1" aria-label="+">+</button></span>`;
  }
  function addBtnHTML(id) {
    const q = cart.m[id] || 0;
    return q ? stepperHTML(q, 'm', id) : `<button type="button" class="add" data-add="${id}"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>${t('add')}</button>`;
  }

  function setMeal(id, q, fromEl) {
    const prev = cart.m[id] || 0;
    q = Math.max(0, Math.min(99, q));
    if (q) cart.m[id] = q; else delete cart.m[id];
    saveCart();
    if (q > prev && fromEl) flyToFab(id, fromEl);
    if (q > prev) toast(t('added'));
    refreshCartUI();
  }
  function setAddon(id, q) {
    q = Math.max(0, Math.min(99, q));
    if (q) cart.a[id] = q; else delete cart.a[id];
    saveCart(); refreshCartUI();
  }

  function refreshCartUI() {
    const n = cartCount(), tot = cartTotal();
    $$('[data-count]').forEach(el => el.textContent = n);
    $('#fabTotal').textContent = fmt(tot);
    $('#drTotal').textContent = fmt(tot);
    $('#fab').classList.toggle('show', n > 0 || Object.keys(cart.a).length > 0);
    // card buttons
    $$('.meal').forEach(card => { const f = $('.meal-foot .act', card); if (f) f.innerHTML = addBtnHTML(card.dataset.id); });
    const sh = $('#sheetCard .act'); if (sh) sh.innerHTML = addBtnHTML(sh.dataset.id);
    // fab ring (unique meals, up to 5)
    const ids = Object.keys(cart.m).slice(0, 5);
    const fr = $('#fabRing'); fr.innerHTML = '';
    ringLayout(ids.length, { R: 24, s: 44, single: 70, cs: 44 }).forEach((p, i) => fr.appendChild(plateEl(ids[i], p, i * 50)));
    renderDrawer();
  }

  function renderDrawer() {
    // tablia with each unit as a plate (up to 8)
    const units = [];
    Object.entries(cart.m).forEach(([id, q]) => { for (let i = 0; i < q; i++) units.push(id); });
    const shown = units.slice(0, 8);
    const ring = $('#drRing'); ring.innerHTML = '';
    ringLayout(shown.length).forEach((p, i) => ring.appendChild(plateEl(shown[i], p, i * 41)));
    $('#drEmpty').style.display = units.length ? 'none' : '';
    $('#drList').innerHTML = Object.entries(cart.m).map(([id, q]) => {
      const m = mealById(id);
      return `<li><img src="${plateImg(m.img)}" alt=""><div><h5>${L(m)}</h5><small>${m.price} ${t('egp')} × ${q} = <b>${fmt(m.price * q)}</b></small></div>${stepperHTML(q, 'm', id)}</li>`;
    }).join('');
    $('#drAddons').innerHTML = D.addons.map(a => `<li>${L(a)} <b>${a.price}</b>${stepperHTML(cart.a[a.id] || 0, 'a', a.id)}</li>`).join('');
  }

  function flyToFab(id, fromEl) {
    if (reduce || !window.gsap) return;
    const src = fromEl.getBoundingClientRect();
    const fab = $('#fab'); const wasHidden = !fab.classList.contains('show');
    fab.classList.add('show');
    const dst = $('.fab-t').getBoundingClientRect();
    const f = document.createElement('img');
    f.src = plateImg(mealById(id).img); f.className = 'flyer';
    const size = Math.min(src.width, 220);
    Object.assign(f.style, { width: size + 'px', height: size + 'px', left: (src.left + src.width / 2 - size / 2) + 'px', top: (src.top + src.height / 2 - size / 2) + 'px' });
    document.body.appendChild(f);
    const dx = dst.left + dst.width / 2 - (src.left + src.width / 2);
    const dy = dst.top + dst.height / 2 - (src.top + src.height / 2);
    gsap.timeline({ onComplete() { f.remove(); fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); } })
      .to(f, { duration: wasHidden ? .9 : .75, x: dx, y: dy, rotation: 300, scale: dst.width / size, ease: 'power2.inOut' })
      .to(f, { duration: .15, opacity: 0 });
  }

  /* ================= meals grid ================= */
  const group = m => m.price <= 90 && m.id !== 1 ? 'eco' : (m.id === 1 || m.price >= 200 ? 'big' : 'mid');
  let curFilter = 'all';
  function renderMeals() {
    $('#mealGrid').innerHTML = D.meals.map(m => `
      <article class="meal" data-id="${m.id}" data-g="${group(m)}${m.price <= 90 ? ' eco' : ''}">
        <div class="meal-plate" data-open="${m.id}" role="button" tabindex="0" aria-label="${L(m)}"><img src="${plateImg(m.img)}" alt="${L(m)}" loading="lazy" width="560" height="560"></div>
        <span class="meal-no">${String(m.id).padStart(2, '0')}</span>
        ${m.tag ? `<span class="meal-tag ${m.tag}">${t('tag.' + m.tag)}</span>` : ''}
        <h3>${L(m)}</h3>
        <div class="chips">${L(m.inc).map(x => `<span>${x}</span>`).join('')}</div>
        <div class="meal-foot"><span class="price">${m.price}<small>${t('egp')}</small></span><span class="act" data-id="${m.id}">${addBtnHTML(m.id)}</span></div>
      </article>`).join('');
    applyFilter(curFilter, true);
  }
  function applyFilter(f, silent) {
    curFilter = f;
    $$('.meal-filter button').forEach(b => b.classList.toggle('on', b.dataset.f === f));
    $$('.meal').forEach(c => c.classList.toggle('hide', !(f === 'all' || c.dataset.g.split(' ').includes(f))));
    if (!silent && window.ScrollTrigger) ScrollTrigger.refresh();
  }

  function renderAddonsList() {
    $('#addonList').innerHTML = D.addons.map(a => `<li>${L(a)} <b>${a.price} ${t('egp')}</b><button type="button" data-addon="${a.id}" aria-label="+">+</button></li>`).join('');
  }

  /* ================= sheet ================= */
  function openSheet(id) {
    const m = mealById(id);
    $('#sheetCard').innerHTML = `
      <button class="x" data-close aria-label="close">×</button>
      <div class="sh-img"><img src="${plateImg(m.img)}" alt="${L(m)}"></div>
      <div class="sh-body">
        <span class="meal-no" style="position:static">${String(m.id).padStart(2, '0')}</span>
        <h3>${L(m)}</h3>
        <p class="kicker" style="margin:10px 0 0">${t('inc')}</p>
        <ul>${L(m.inc).map(x => `<li>${x}</li>`).join('')}</ul>
        <div class="meal-foot"><span class="price">${m.price}<small>${t('egp')}</small></span><span class="act" data-id="${m.id}">${addBtnHTML(m.id)}</span></div>
      </div>`;
    openLayer('#sheet');
  }

  /* ================= khair ================= */
  const kh = store.get('tb-kh', {});
  function renderKhair() {
    $('#khairGrid').innerHTML = D.khair.map(k => `
      <div class="kh ${kh[k.id] ? 'has' : ''}" data-id="${k.id}">
        <span class="kp">${k.price}<small>${t('egp')}</small></span>
        <h4>${L(k)}</h4><p>${L(k.inc)}</p>
        ${stepperHTML(kh[k.id] || 0, 'k', k.id)}
      </div>`).join('');
    updKhair();
  }
  function updKhair() {
    const n = Object.values(kh).reduce((a, b) => a + b, 0);
    const tot = D.khair.reduce((s, k) => s + (kh[k.id] || 0) * k.price, 0);
    $('#khCount').textContent = n; $('#khTotal').textContent = fmt(tot);
    const goal = n <= 10 ? 10 : n <= 50 ? 50 : n <= 100 ? 100 : Math.ceil(n / 100) * 100;
    $('#kmArc').style.strokeDashoffset = 327 - 327 * Math.min(1, n / goal);
  }
  function setKhair(id, q) {
    q = Math.max(0, Math.min(999, q));
    if (q) kh[id] = q; else delete kh[id];
    store.set('tb-kh', kh);
    const card = $(`.kh[data-id="${id}"]`);
    if (card) { card.classList.toggle('has', !!q); $('.stepper b', card).textContent = q; }
    updKhair();
  }

  /* ================= events ================= */
  let curTab = 'hightea';
  function pkgCard(p, key) {
    return `<article class="pkg">
      <div class="pkg-h"><div><h3>${L(p.name)}</h3>${p.min ? `<span class="min">${t('min').replace('{n}', p.min)}</span>` : ''}</div>
      <div class="pp"><b>${p.price}</b><small>${t('egp')} / ${t('per')}</small></div></div>
      ${p.groups.map(g => `<h5>${L(g.t)}</h5><ul>${L(g.i).map(x => `<li>${x}</li>`).join('')}</ul>`).join('')}
      ${p.note ? `<p class="pnote">${L(p.note)}</p>` : ''}
      <div class="pkg-gap"></div>
      <button type="button" class="btn btn-maroon" data-pkg="${key}">${t('ask')}</button>
    </article>`;
  }
  function renderEvents() {
    $$('#evTabs button').forEach(b => b.classList.toggle('on', b.dataset.t === curTab));
    const P = $('#evPanel');
    P.classList.toggle('is-finger', curTab === 'finger'); $('#evSwipe').classList.toggle('off', curTab === 'finger');
    if (curTab === 'finger') {
      const row = r => `<div class="frow"><span>${lang === 'ar' ? r[0] : r[1]}</span><b>${r[2]}</b></div>`;
      P.innerHTML = `<div class="finger">
        <div class="fcol"><h4>${t('fa')}</h4>${D.finger.a.map(row).join('')}</div>
        <div class="fcol"><h4>${t('fb')}</h4>${D.finger.b.map(row).join('')}</div>
        <div class="fcol dark"><h4>${t('fx')}</h4>${D.finger.extra.map(row).join('')}<p style="font-size:13px;opacity:.7;margin-top:12px">${lang === 'ar' ? 'الأسعار بالجنيه للقطعة · النقل على حسب المكان' : 'Prices in EGP per piece · transport depends on location'}</p>
        <button type="button" class="btn btn-gold" style="margin-top:18px;width:100%" data-pkg="finger">${t('ask')}</button></div>
      </div>`;
    } else {
      P.innerHTML = D.events[curTab].map((p, i) => pkgCard(p, curTab + ':' + i)).join('');
    }
    if (window.gsap && !reduce) gsap.from(P.children, { y: 30, opacity: 0, duration: .6, stagger: .07, ease: 'power3.out', clearProps: 'all' });
  }
  function renderQuoteSelect() {
    const sel = $('#qPkg'); const cur = sel.value;
    let html = '';
    ['hightea', 'set', 'buffet'].forEach(k => D.events[k].forEach((p, i) => { html += `<option value="${k}:${i}">${L(p.name)} · ${p.price} ${t('egp')}</option>`; }));
    html += `<option value="finger">${lang === 'ar' ? 'فنجر فود (حسب الاختيار)' : 'Finger food (custom)'}</option>`;
    sel.innerHTML = html; if (cur) sel.value = cur;
    calcQuote();
  }
  function pkgByKey(k) { if (k === 'finger') return null; const [g, i] = k.split(':'); return D.events[g][+i]; }
  function calcQuote() {
    const p = pkgByKey($('#qPkg').value); const n = Math.max(0, +$('#qN').value || 0);
    $('#qEst').textContent = p ? fmt(p.price * n) : '—';
  }

  /* ================= gallery ================= */
  function buildGallery() {
    const fig = i => `<figure><img src="assets/img/real/r${i}.webp" alt="" loading="lazy" width="272" height="272"></figure>`;
    const a = [1, 2, 3, 4, 5, 6], b = [7, 8, 9, 10, 11, 12];
    $('#gRow1').innerHTML = [...a, ...a].map(fig).join('');
    $('#gRow2').innerHTML = [...b, ...b].map(fig).join('');
  }

  /* ================= whatsapp ================= */
  const wa = msg => `https://wa.me/${D.wa}?text=${encodeURIComponent(msg)}`;
  const openWA = msg => window.open(wa(msg), '_blank', 'noopener');
  function waGeneral(kind) {
    if (kind === 'office') return lang === 'ar' ? 'أهلاً طبلية 👋\nعايز أطلب غدا يومي لفريق شغل.\nعدد الأفراد: \nالمكان: \nالمواعيد: ' : 'Hello Tablia 👋\nI would like daily lunch for my team.\nHeadcount: \nLocation: \nSchedule: ';
    return lang === 'ar' ? 'أهلاً طبلية 👋 عايز أستفسر عن الوجبات اليومية.' : 'Hello Tablia 👋 I would like to ask about your daily meals.';
  }
  function sendOrder() {
    if (!cartCount()) { toast(t('empty')); return; }
    const ar = lang === 'ar';
    const lines = Object.entries(cart.m).map(([id, q]) => { const m = mealById(id); return `• ${q} × ${L(m)} (${m.price}) = ${fmt(m.price * q)}`; });
    const ad = Object.entries(cart.a).map(([id, q]) => { const a = D.addons.find(x => x.id === id); return `• ${q} × ${L(a)} (${a.price}) = ${fmt(a.price * q)}`; });
    const day = $('#fDay .on').dataset.v;
    const time = $('#fTime').selectedOptions[0].textContent;
    const msg = [
      ar ? '🍽️ طلب جديد من موقع طبلية' : '🍽️ New order from Tablia website',
      '',
      ar ? 'الوجبات:' : 'Meals:', ...lines,
      ...(ad.length ? ['', ar ? 'الإضافات:' : 'Add-ons:', ...ad] : []),
      '',
      `${ar ? 'الإجمالي' : 'Total'}: ${fmt(cartTotal())} ${ar ? 'جنيه' : 'EGP'} ${ar ? '(+ التوصيل)' : '(+ delivery)'}`,
      `${ar ? 'اليوم' : 'Day'}: ${day === 'today' ? (ar ? 'النهارده' : 'Today') : (ar ? 'بكرة' : 'Tomorrow')} · ${time}`,
      `${ar ? 'الاسم' : 'Name'}: ${$('#fName').value.trim() || '-'}`,
      `${ar ? 'العنوان' : 'Address'}: ${$('#fAddr').value.trim() || '-'}`,
      ...($('#fNotes').value.trim() ? [`${ar ? 'ملاحظات' : 'Notes'}: ${$('#fNotes').value.trim()}`] : [])
    ].join('\n');
    openWA(msg);
  }
  function sendKhair() {
    const n = Object.values(kh).reduce((a, b) => a + b, 0);
    if (!n) { toast(t('khempty')); return; }
    const ar = lang === 'ar';
    const lines = D.khair.filter(k => kh[k.id]).map(k => `• ${kh[k.id]} × ${L(k)} (${k.price}) = ${fmt(kh[k.id] * k.price)}`);
    const tot = D.khair.reduce((s, k) => s + (kh[k.id] || 0) * k.price, 0);
    openWA([ar ? '🤲 طلب وجبات الخير من موقع طبلية' : '🤲 Charity meals order from Tablia website', '', ...lines, '', `${ar ? 'عدد الوجبات' : 'Meals'}: ${n}`, `${ar ? 'الإجمالي' : 'Total'}: ${fmt(tot)} ${ar ? 'جنيه' : 'EGP'}`, ar ? 'مكان التوزيع/التوصيل: ' : 'Delivery/distribution place: '].join('\n'));
  }
  function sendQuote(e) {
    e.preventDefault();
    const ar = lang === 'ar'; const k = $('#qPkg').value; const p = pkgByKey(k);
    const n = +$('#qN').value || 0;
    openWA([
      ar ? '🎉 طلب عرض سعر لمناسبة' : '🎉 Event quote request',
      `${ar ? 'الباكدج' : 'Package'}: ${$('#qPkg').selectedOptions[0].textContent}`,
      `${ar ? 'عدد الأفراد' : 'Guests'}: ${n}`,
      `${ar ? 'التاريخ' : 'Date'}: ${$('#qD').value || '-'}`,
      `${ar ? 'المنطقة' : 'Area'}: ${$('#qA').value.trim() || '-'}`,
      ...(p ? [`${ar ? 'تقدير مبدئي' : 'Estimate'}: ${fmt(p.price * n)} ${ar ? 'جنيه' : 'EGP'}`] : [])
    ].join('\n'));
  }

  /* ================= layers ================= */
  let lenis = null;
  function openLayer(sel) { const el = $(sel); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); document.body.style.overflow = 'hidden'; }
  function closeLayers() { $$('.drawer,.sheet').forEach(el => { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }); lenis && lenis.start(); document.body.style.overflow = ''; }
  let tt; function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800); }
  function scrollToEl(el) { if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.3 }); else el.scrollIntoView({ behavior: 'smooth' }); }

  function renderAll() {
    buildMarq(); renderMeals(); renderAddonsList(); renderKhair(); renderEvents(); renderQuoteSelect(); refreshCartUI();
  }

  /* ================= events wiring ================= */
  document.addEventListener('click', e => {
    const tg = e.target;
    const add = tg.closest('[data-add]');
    if (add) { const id = add.dataset.add; const card = add.closest('.meal') || add.closest('.sheet-card'); setMeal(id, (cart.m[id] || 0) + 1, card ? ($('.meal-plate', card) || $('.sh-img img', card)) : add); return; }
    const st = tg.closest('.stepper button');
    if (st) {
      const s = st.closest('.stepper'); const d = +st.dataset.d; const id = s.dataset.id;
      if (s.dataset.kind === 'm') { const card = s.closest('.meal'); setMeal(id, (cart.m[id] || 0) + d, d > 0 && card ? $('.meal-plate', card) : null); }
      else if (s.dataset.kind === 'a') setAddon(id, (cart.a[id] || 0) + d);
      else if (s.dataset.kind === 'k') setKhair(id, (kh[id] || 0) + d);
      return;
    }
    const ad = tg.closest('[data-addon]');
    if (ad) { setAddon(ad.dataset.addon, (cart.a[ad.dataset.addon] || 0) + 1); toast(t('added')); return; }
    const op = tg.closest('[data-open]'); if (op) { openSheet(op.dataset.open); return; }
    if (tg.closest('[data-close]')) { closeLayers(); return; }
    const w = tg.closest('[data-wa]'); if (w) { e.preventDefault(); openWA(waGeneral(w.dataset.wa)); return; }
    const pk = tg.closest('[data-pkg]');
    if (pk) { $('#qPkg').value = pk.dataset.pkg; calcQuote(); scrollToEl($('#quote')); return; }
    const f = tg.closest('.meal-filter button'); if (f) { applyFilter(f.dataset.f); return; }
    const tb = tg.closest('#evTabs button'); if (tb) { curTab = tb.dataset.t; renderEvents(); return; }
    const sg = tg.closest('#fDay button'); if (sg) { $$('#fDay button').forEach(b => b.classList.toggle('on', b === sg)); return; }
    const a = tg.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) { const el = $(a.getAttribute('href')); if (el) { e.preventDefault(); closeMnav(); scrollToEl(el); } }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLayers(); closeMnav(); } if (e.key === 'Enter' && e.target.matches('[data-open]')) openSheet(e.target.dataset.open); });
  $('#fab').addEventListener('click', () => openLayer('#drawer'));
  $('#hdrCart').addEventListener('click', () => openLayer('#drawer'));
  $('#sendOrder').addEventListener('click', sendOrder);
  $('#khSend').addEventListener('click', e => { e.preventDefault(); sendKhair(); });
  $('#quote').addEventListener('submit', sendQuote);
  ['#qPkg', '#qN'].forEach(s => $(s).addEventListener('input', calcQuote));
  $('#langBtn').addEventListener('click', () => { lang = lang === 'ar' ? 'en' : 'ar'; store.set('tb-lang', lang); applyLang(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  const burger = $('#burger'), mnav = $('#mnav');
  function closeMnav() { burger.classList.remove('on'); mnav.classList.remove('open'); mnav.setAttribute('aria-hidden', 'true'); }
  burger.addEventListener('click', () => { const o = !mnav.classList.contains('open'); burger.classList.toggle('on', o); mnav.classList.toggle('open', o); mnav.setAttribute('aria-hidden', String(!o)); });
  $('#yr').textContent = new Date().getFullYear();
  // default date for quote: +7 days
  try { const d = new Date(Date.now() + 7 * 864e5); $('#qD').value = d.toISOString().slice(0, 10); $('#qD').min = new Date().toISOString().slice(0, 10); } catch (e) {}

  /* ================= header ================= */
  let lastY = 0;
  function onScroll(y) {
    const h = $('#hdr');
    h.classList.toggle('solid', y > window.innerHeight * .75);
    h.classList.toggle('hide', y > 300 && y > lastY + 4 && !mnav.classList.contains('open'));
    if (y < lastY - 4) h.classList.remove('hide');
    lastY = y;
  }

  /* ================= boot ================= */
  buildHero(); buildGallery(); applyLang();

  function startMotion() {
    if (!window.gsap || reduce) { $$('.hero-h .ln>span').forEach(s => s.style.transform = 'none'); return; }
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && matchMedia('(pointer:fine)').matches) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on('scroll', e => { ScrollTrigger.update(); onScroll(e.scroll); });
      gsap.ticker.add(time => lenis.raf(time * 1000)); gsap.ticker.lagSmoothing(0);
    } else {
      addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    }

    // hero intro
    const plates = $$('#heroRing .plate');
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('#heroTablia', { scale: .6, rotation: -120, opacity: 0, duration: 1.5 })
      .from(plates, { opacity: 0, scale: 1.9, y: -60, duration: .9, stagger: .11, ease: 'back.out(1.4)', clearProps: 'opacity' }, '-=.9')
      .from('.hero-h .ln>span', { yPercent: 110, duration: 1.1, stagger: .12 }, .2)
      .from(['.eyebrow', '.hero-p', '.hero-cta', '.hero-stats'], { y: 24, opacity: 0, duration: .9, stagger: .1 }, .6)
      .from('.price-stamp', { scale: 0, rotation: -90, duration: 1, ease: 'back.out(2)' }, 1.4);
    // idle spin + scroll spin
    const spin = gsap.to('#heroRing', { rotation: 360, duration: 120, repeat: -1, ease: 'none' });
    gsap.to('#heroWrap', { rotation: -50, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-txt', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    // hover parallax (desktop)
    if (matchMedia('(pointer:fine)').matches) {
      const st = $('.hero-stage');
      $('.hero').addEventListener('mousemove', e => {
        const r = st.getBoundingClientRect(); const x = (e.clientX - r.left - r.width / 2) / r.width; const y = (e.clientY - r.top - r.height / 2) / r.height;
        gsap.to('#heroTablia', { x: x * 22, y: y * 22, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
        spin.timeScale(1 + Math.abs(x) * 6);
      });
    }

    // story image parallax
    gsap.to('.story-img img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.story-img', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.story-img', { clipPath: 'inset(12% 12% 12% 12% round 40px)', ease: 'none', scrollTrigger: { trigger: '.story-img', start: 'top 95%', end: 'top 35%', scrub: true } });

    // reveals
    const rv = (sel, opts = {}) => $$(sel).forEach(el => gsap.from(el, Object.assign({ y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }, opts)));
    rv('.sec-head, .story-head, .khair-head > div:first-child, .office-in > div, .c-txt');
    rv('.steps li', { x: lang === 'ar' ? -40 : 40, y: 0 });
    rv('.addons, .quote, .khair-meter, .c-logo, .note');
    ScrollTrigger.batch('.meal', { start: 'top 92%', once: true, onEnter: b => gsap.from(b, { y: 60, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out' }) });
    ScrollTrigger.batch('.meal-plate img', { start: 'top 95%', once: true, onEnter: b => gsap.from(b, { rotation: -140, scale: .7, duration: 1.4, stagger: .08, ease: 'power3.out', clearProps: 'transform' }) });
    ScrollTrigger.batch('.kh', { start: 'top 92%', once: true, onEnter: b => gsap.from(b, { y: 40, opacity: 0, duration: .8, stagger: .06, ease: 'power3.out' }) });
    // count up
    $$('[data-count-to]').forEach(el => { const n = +el.dataset.countTo; const o = { v: 0 }; gsap.to(o, { v: n, duration: 1.8, delay: 1, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }); });
  }

  // loader
  const imgs = [$('.ld-logo'), ...$$('#heroRing img')];
  let loaded = 0; const bar = $('#ldBar');
  const done = () => { if (document.body.classList.contains('is-loading')) { document.body.classList.remove('is-loading'); $('#loader').classList.add('done'); startMotion(); } };
  imgs.forEach(im => { const f = () => { loaded++; bar.style.width = (loaded / imgs.length * 100) + '%'; if (loaded >= imgs.length) setTimeout(done, 250); }; if (im.complete) f(); else { im.addEventListener('load', f, { once: true }); im.addEventListener('error', f, { once: true }); } });
  setTimeout(done, 3500);
})();
