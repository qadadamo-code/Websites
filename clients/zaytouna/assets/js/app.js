(() => {
  const S = window.STORE, L = window.ZLOGO, doc = document.documentElement;
  const $ = (q, c = document) => c.querySelector(q), $$ = (q, c = document) => [...c.querySelectorAll(q)];
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  let lang = doc.lang === 'en' ? 'en' : 'ar';
  const T = (ar, en) => lang === 'en' ? en : ar;
  const money = n => (Math.round(n * 100) / 100).toLocaleString('en-US') + ' ₪';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth < 760;
  const hasG = !!window.gsap;
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  const P = Object.fromEntries(S.products.map((p, i) => [p.id, { ...p, rank: i }]));
  const CAT = Object.fromEntries(S.cats.map(c => [c.id, c]));
  const ZONE = Object.fromEntries(S.zones.map((z, i) => [z.id, { ...z, letter: 'ABCD'[i] }]));
  const inCat = id => S.products.filter(p => p.c === id);
  const inZone = id => S.products.filter(p => CAT[p.c].z === id);
  const NS = 'http://www.w3.org/2000/svg';
  const pathEl = d => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); return p; };
  const img = id => `assets/img/p/${id}.webp`;

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
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    veg: '<path d="M14 8c-5 0-9 4-10 12 8-1 12-5 12-10"/><path d="M14 8l2 2M15 4c0 2 1 3 3 3M18 3c-1 2-1 3 0 4 1 1 2 1 4 0"/>',
    fruit: '<path d="M12 7c-4-2-8 1-8 6s3 9 6 9c1 0 1.5-.5 2-.5s1 .5 2 .5c3 0 6-4 6-9s-4-8-8-6Z"/><path d="M12 7c0-2 1-4 3-5"/>',
    bread: '<path d="M4 11a4 4 0 0 1 1-7.8C7 2.5 9.5 3 12 3s5-.5 7 .2A4 4 0 0 1 20 11v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="M9 9v3M15 9v3"/>',
    meat: '<path d="M3.5 13.5C3.5 8 7.8 4 13 4c4.4 0 7.5 2.8 7.5 6.3 0 5.7-5.8 9.7-11.4 9.7-3.6 0-5.6-2.4-5.6-6.5Z"/><path d="M8 15c1.5 1 4 1 6-.5"/><circle cx="14.5" cy="9.5" r="2"/>',
    grain: '<path d="M12 22V8M12 12c-3 0-4-2-4-4 3 0 4 2 4 4ZM12 12c3 0 4-2 4-4-3 0-4 2-4 4ZM12 17c-3 0-4-2-4-4 3 0 4 2 4 4ZM12 17c3 0 4-2 4-4-3 0-4 2-4 4ZM12 7c-1-1-1-3 0-5 1 2 1 4 0 5Z"/>',
    oil: '<path d="M10 2h4v3l2 3v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-3Z"/><path d="M12 12c-1.5 2-1.5 3.5 0 4.5 1.5-1 1.5-2.5 0-4.5Z"/>',
    can: '<ellipse cx="12" cy="5" rx="7" ry="2.5"/><path d="M5 5v14c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5M5 10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    honey: '<path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z"/><path d="M8 3h8v4H8zM10 12l2-1 2 1v2l-2 1-2-1Z"/>',
    dumbbell: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
    spray: '<path d="M8 9h7l1 3v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9Z"/><path d="M9 9V5h4l3-2M13 5h3M18 6h2M18 9h3"/>',
    roll: '<ellipse cx="8" cy="12" rx="4" ry="8"/><path d="M8 4h9c2.2 0 4 3.6 4 8s-1.8 8-4 8H8"/><ellipse cx="8" cy="12" rx="1.3" ry="2.6"/>',
    care: '<path d="M9 2h6v4H9zM8 6h8l1 4v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V10Z"/><path d="M10 13h4M12 11v4"/>',
    baby: '<circle cx="12" cy="9" r="6"/><path d="M9.5 9h.01M14.5 9h.01M10 11.5c1 1 3 1 4 0M12 3c1 0 2-1 1.5-2M7 21c0-3 2.2-5 5-5s5 2 5 5"/>',
    leaf: '<path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15Z"/><path d="M5 19 13 11"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z"/><circle cx="8" cy="8" r="1.5"/>',
    all: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'
  };
  const ic = n => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  const arrow = '<svg viewBox="0 0 24 24" class="arr" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const waIc = '<svg viewBox="0 0 24 24" class="wa-ic" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.1-4.7-4.1-4.9-4.3-.1-.2-1.2-1.6-1.2-3s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5l1 2.4c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.4 1.5 2.7 1.7.3.1.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2.3 1.1c.3.2.5.2.6.4.1.1.1.7-.2 1.3Z"/></svg>';

  /* ---------- cart state ---------- */
  let cart = store.get('zt-cart', {});
  Object.keys(cart).forEach(k => { if (!P[k]) delete cart[k]; });
  const cartQty = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((a, [k, q]) => a + P[k].p * q, 0);
  const cartSave = () => Object.entries(cart).reduce((a, [k, q]) => a + ((P[k].o || P[k].p) - P[k].p) * q, 0);
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
    renderMarquee(); renderAbar(); renderZones(); renderDeals(); renderShop(true); renderPicks(); renderCart(); renderPopular();
    if (!first) { splitAll(); hasG && ScrollTrigger.refresh(); }
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
    topup: () => T('مرحبا 👋 بدي أشحن رصيد لرقمي، شو المتوفر؟', 'Hi 👋 I would like to top up my mobile line. What is available?'),
    ask: v => T(`مرحبا الزيتونة ماركت 👋 بدوّر على: ${v}\nمتوفر عندكم؟ وقديش سعره؟`, `Hi Al Zaytouna Market 👋 I'm looking for: ${v}\nDo you have it, and how much is it?`)
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-wa],[data-tel],[data-mail],[data-map],[data-fb],[data-ig]');
    if (!a) return;
    e.preventDefault();
    let url;
    if (a.dataset.wa !== undefined) url = waLink(a.dataset.wa === 'ask' ? WA.ask(a.dataset.v || '') : WA[a.dataset.wa || 'hello']());
    else if (a.dataset.tel !== undefined) { location.href = 'tel:' + S.phone; return; }
    else if (a.dataset.mail !== undefined) { location.href = 'mailto:' + S.email; return; }
    else if (a.dataset.map !== undefined) url = S.map;
    else if (a.dataset.fb !== undefined) url = S.facebook;
    else url = 'https://instagram.com/' + S.instagram;
    window.open(url, '_blank', 'noopener');
  });
  const askBtn = v => `<a href="#" class="btn btn-wa sm ask" data-wa="ask" data-v="${esc(v)}">${waIc}<span>${T('اطلب «' + esc(v) + '» عالواتساب', 'Ask for “' + esc(v) + '” on WhatsApp')}</span></a>`;

  /* ---------- header ---------- */
  const hd = $('#hd'); let lastY = 0;
  function onScroll(y) {
    hd.classList.toggle('solid', y > 60);
    const hide = y > lastY + 4 && y > 600 && !doc.classList.contains('nav-open') && !sugOpen;
    if (hide) hd.classList.add('hide');
    if (y < lastY - 4) hd.classList.remove('hide');
    doc.classList.toggle('hd-hidden', hd.classList.contains('hide'));
    lastY = y;
  }
  $('#burger').addEventListener('click', () => doc.classList.toggle('nav-open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => doc.classList.remove('nav-open')));

  /* ---------- marquee ---------- */
  function renderMarquee() {
    const words = lang === 'en'
      ? ['Shopping', 'Bill payments', 'Mobile top-up', 'Al Zaytouna.. makes it all better!', S.products.length + '+ products', 'Order on WhatsApp', 'Beit Jala']
      : ['تسوّق', 'دفع فواتير', 'شحن رصيد', 'الزيتونة.. بتفش الغل!', 'أكثر من ' + S.products.length + ' صنف', 'اطلب عالواتساب', 'بيت جالا'];
    const one = words.map(w => `<span>${w}<svg viewBox="0 0 24 24"><path d="M12 2c4 3 6 7 4 12-1 3-3 5-4 8-1-3-3-5-4-8-2-5 0-9 4-12Z"/></svg></span>`).join('');
    $('#mq').innerHTML = one + one + one;
  }

  /* ---------- search engine ---------- */
  const norm = s => String(s).toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/[^\p{L}\p{N}\s]/gu, ' ');
  const SYN = [
    'رز ارز rice', 'حليب milk', 'لبن لبنه زبادي رايب yogurt laban labneh', 'جبن جبنه cheese', 'بيض eggs egg', 'خبز عيش كماج كعك bread pita',
    'دجاج جاج فراخ chicken', 'لحم لحمه عجل خروف meat beef lamb', 'بندوره طماطم tomato tomatoes', 'بطاطا بطاطس potato potatoes fries', 'شيبس تشيبس chips crisps',
    'كولا بيبسي كوكا غازيه cola soda', 'مي ماء مياه water', 'عصير juice', 'قهوه نسكافيه coffee', 'شاي tea', 'زيت oil', 'سكر sugar', 'طحين دقيق flour',
    'معكرونه مكرونه باستا سباغيتي pasta spaghetti', 'تونه تونا tuna', 'شوكولاته شوكولا شوكلاته chocolate choco', 'بسكوت بسكويت biscuit biscuits cookies',
    'حفاض حفاضات بامبرز diapers diaper', 'محارم مناديل كلينكس tissues tissue napkins', 'تواليت حمام toilet', 'صابون soap', 'شامبو shampoo',
    'منظف منظفات تنظيف cleaner detergent', 'كلور مبيض bleach', 'جلي dish', 'مكسرات قضامه nuts', 'فستق pistachio pistachios', 'بهارات بهار spices spice',
    'عسل honey', 'مربى jam', 'ايس بوظه ice cream', 'مجمد مثلج frozen', 'فواكه فاكهه fruit', 'خضار خضره vegetables veg', 'حلويات حلو sweets candy',
    'طاقه energy', 'بروتين protein', 'طفل اطفال بيبي رضع baby kids', 'فول foul fava', 'حمص hummus chickpeas', 'زعتر zaatar', 'زيتون olives olive',
    'سمك fish', 'جمبري قريدس shrimp', 'موز banana bananas', 'تفاح apple apples', 'برتقال orange oranges', 'ليمون lemon lemons', 'بصل onion onions'
  ].map(g => norm(g).split(/\s+/));
  const HAY = {};
  S.products.forEach(p => {
    const c = CAT[p.c], z = S.zones.find(z => z.id === c.z);
    const words = s => norm(s).split(/\s+/).filter(Boolean).flatMap(w => w.startsWith('ال') && w.length > 3 ? [w, w.slice(2)] : [w]);
    HAY[p.id] = { ar: words(p.ar), name: words(p.ar + ' ' + p.en), cat: words(c.ar + ' ' + c.en + ' ' + z.ar + ' ' + z.en) };
  });
  function variants(t) {
    const v = new Set([t]);
    if (t.startsWith('ال') && t.length > 3) v.add(t.slice(2));
    if (t.startsWith('و') && t.length > 3) v.add(t.slice(1));
    [...v].forEach(x => { if (x.length > 4 && /(ات|ين|ون)$/.test(x)) v.add(x.slice(0, -2)); if (x.length > 3 && /[هs]$/.test(x)) v.add(x.slice(0, -1)); });
    [...v].forEach(x => SYN.forEach(g => { if (g.some(e => e === x || (x.length >= 3 && e.startsWith(x)))) g.forEach(e => { if (e.length >= 3 || e === x) v.add(e); }); }));
    return [...v];
  }
  const hit = (words, v) => words.some(w => w.startsWith(v) || (v.length >= 5 && w.includes(v)));
  function search(query, cat = 'all') {
    const toks = norm(query).split(/\s+/).filter(Boolean);
    const base = S.products.filter(p => cat === 'all' || p.c === cat);
    if (!toks.length) return base;
    const vs = toks.map(variants);
    const out = [];
    base.forEach(p => {
      const h = HAY[p.id]; let score = 0;
      for (const v of vs) {
        if (v.some(x => hit(h.name, x))) score += hit(h.name, v[0]) ? 5 : v.some(x => hit(h.ar, x)) ? 4 : 3;
        else if (v.some(x => hit(h.cat, x))) score += 1;
        else return;
      }
      out.push([score, p]);
    });
    return out.sort((a, b) => b[0] - a[0] || P[a[1].id].rank - P[b[1].id].rank).map(x => x[1]);
  }
  function searchCats(query) {
    const toks = norm(query).split(/\s+/).filter(Boolean);
    if (!toks.length) return [];
    return S.cats.filter(c => toks.every(t => variants(t).some(x => hit(norm(c.ar + ' ' + c.en).split(/\s+/).flatMap(w => w.startsWith('ال') ? [w, w.slice(2)] : [w]), x))));
  }

  /* ---------- aisle bar (sticky directory strip) ---------- */
  function renderAbar() {
    let html = `<button class="ab-i" data-ab="all">${ic('all')}<span>${T('كل الممرات', 'All aisles')}</span></button>`;
    S.zones.forEach(z => {
      html += `<span class="ab-z">${ZONE[z.id].letter}<i>${z[lang]}</i></span>`;
      S.cats.filter(c => c.z === z.id).forEach(c => { html += `<button class="ab-i" data-ab="${c.id}">${ic(c.icon)}<span>${c[lang]}</span></button>`; });
    });
    $('#abar').innerHTML = html;
    markAbar();
  }
  let spy = 'all';
  function markAbar() {
    const on = cur !== 'all' ? cur : spy;
    $$('#abar .ab-i').forEach(b => b.classList.toggle('on', b.dataset.ab === on));
  }
  function centerAbar() {
    const b = $('#abar .ab-i.on'); if (!b) return;
    const bar = $('#abar'), br = bar.getBoundingClientRect(), r = b.getBoundingClientRect();
    bar.scrollBy({ left: (r.left + r.width / 2) - (br.left + br.width / 2), behavior: 'smooth' });
  }
  $('#abar').addEventListener('click', e => { const b = e.target.closest('[data-ab]'); if (b) goAisle(b.dataset.ab); });
  function goAisle(id) {
    const wasGrid = mode() === 'grid';
    cur = 'all'; q = ''; $('#q').value = '';
    if (wasGrid) renderShop();
    spy = id; markAbar(); centerAbar();
    requestAnimationFrame(() => scrollToEl(id === 'all' ? '#shop' : '#shelf-' + id, id === 'all' ? -10 : -(barOffset() + 10)));
  }
  const barOffset = () => (doc.classList.contains('hd-hidden') ? 0 : $('#hd').offsetHeight) + $('#abar').offsetHeight;

  /* ---------- zones directory ---------- */
  function renderZones() {
    $('#zones').innerHTML = S.zones.map(z => {
      const zz = ZONE[z.id], items = inZone(z.id), cats = S.cats.filter(c => c.z === z.id);
      const PIC = { care: 'g13_02' };
      const pics = cats.slice(0, 4).map(c => P[PIC[c.id]] || inCat(c.id)[0]).map(p => `<img src="${img(p.id)}" alt="" loading="lazy">`).join('');
      return `<article class="zone z-${z.id}">
        <header class="zone-hd"><span class="zone-l">${zz.letter}</span><div><small>${T('جناح', 'Wing')} ${zz.letter}</small><h3>${z[lang]}</h3></div><span class="zone-n"><b>${items.length}</b> ${T('صنف', 'items')}</span></header>
        <div class="zone-pics">${pics}</div>
        <ul class="zone-list">${cats.map(c => `<li><button type="button" data-go="${c.id}"><b>${c.aisle}</b><span class="zl-ic">${ic(c.icon)}</span><span class="zl-n">${c[lang]}</span><small>${inCat(c.id).length}</small>${arrow}</button></li>`).join('')}</ul>
      </article>`;
    }).join('');
  }
  $('#zones').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) goAisle(b.dataset.go); });

  /* ---------- deals ---------- */
  const deals = () => S.products.filter(p => p.o);
  const off = p => Math.round((1 - p.p / p.o) * 100);
  function renderDeals() {
    $('#dlRail').innerHTML = deals().map(p => `<article class="dl" data-id="${p.id}">
      <span class="dl-off">-${off(p)}%</span>
      <div class="dl-media" data-qv="${p.id}"><img src="${img(p.id)}" alt="${esc(p[lang])}" loading="lazy"></div>
      <div class="dl-b"><small>${CAT[p.c][lang]}</small><h3>${p[lang]}</h3>
      <div class="dl-ft"><span class="price">${p.p}<small>₪</small></span><s>${p.o} ₪</s><span class="ctl">${ctrlSm(p.id)}</span></div></div>
    </article>`).join('');
    $('#dlCount').textContent = deals().length;
  }
  function tick() {
    const now = new Date(), end = new Date(now);
    end.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7)); end.setHours(0, 0, 0, 0);
    let s = Math.max(0, Math.floor((end - now) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const parts = [d, Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60];
    $$('#cd b').forEach((b, i) => b.textContent = String(parts[i]).padStart(2, '0'));
  }
  tick(); setInterval(tick, 1000);

  /* ---------- shop ---------- */
  let cur = 'all', q = '', sort = 'pop';
  const PAGE = mobile() ? 12 : 24; let shown = PAGE;
  const mode = () => (cur === 'all' && !q.trim() && sort === 'pop') ? 'shelves' : 'grid';
  const tagName = { hot: ['الأكثر طلبًا', 'Best seller'], new: ['وصل جديد', 'Just in'], value: ['توفير', 'Great value'] };
  function ctrl(id) {
    const n = cart[id] || 0;
    return n ? `<div class="qty" data-id="${id}"><button type="button" data-d="-1" aria-label="-">−</button><output>${n}</output><button type="button" data-d="1" aria-label="+">+</button></div>`
      : `<button class="add" type="button" data-add="${id}">${plus}<span>${T('أضف', 'Add')}</span></button>`;
  }
  function ctrlSm(id) { const n = cart[id] || 0; return n ? `<div class="qty" data-id="${id}"><button type="button" data-d="-1">−</button><output>${n}</output><button type="button" data-d="1">+</button></div>` : `<button class="add" type="button" data-add="${id}" aria-label="${T('أضف', 'Add')}">${plus}</button>`; }
  function badge(p) {
    if (p.o) return `<span class="badge off">-${off(p)}%</span>`;
    return p.tag ? `<span class="badge ${p.tag}">${T(...tagName[p.tag])}</span>` : '';
  }
  function card(p) {
    return `<article class="card" data-id="${p.id}">
      ${badge(p)}
      <div class="card-media" data-qv="${p.id}"><img src="${img(p.id)}" alt="${esc(p[lang])}" loading="lazy" width="400" height="400"></div>
      <div class="card-body">
        <span class="card-aisle">${T('ممر', 'Aisle')} ${CAT[p.c].aisle} · ${CAT[p.c][lang]}</span>
        <h3>${p[lang]}</h3>
        <span class="card-size"><bdi dir="ltr">${p.s}</bdi></span>
        <div class="card-ft"><span class="price">${p.p}<small>₪</small>${p.o ? `<s>${p.o}</s>` : ''}</span><span class="ctl">${ctrl(p.id)}</span></div>
      </div>
    </article>`;
  }
  function sorted(list) {
    if (sort === 'low') return [...list].sort((a, b) => a.p - b.p);
    if (sort === 'high') return [...list].sort((a, b) => b.p - a.p);
    if (sort === 'deal') return [...list].sort((a, b) => (b.o ? off(b) : 0) - (a.o ? off(a) : 0));
    return list;
  }
  function renderShelves() {
    const SH = mobile() ? 8 : 12;
    $('#shelves').innerHTML = S.zones.map(z => `<div class="sh-zone"><h3 class="sh-zh"><span>${ZONE[z.id].letter}</span>${T('جناح ' + z.ar, z.en)}</h3>` +
      S.cats.filter(c => c.z === z.id).map(c => {
        const items = inCat(c.id);
        return `<section class="shelf" id="shelf-${c.id}" data-cat="${c.id}">
          <header class="sh-hd"><span class="sh-no">${T('ممر', 'Aisle')} ${c.aisle}</span><h4>${ic(c.icon)}${c[lang]}</h4><button class="sh-all" type="button" data-all="${c.id}">${T('الممر كامل', 'Whole aisle')} <small>${items.length}</small>${arrow}</button></header>
          <div class="sh-row">${items.slice(0, SH).map(card).join('')}${items.length > SH ? `<button class="sh-more" type="button" data-all="${c.id}"><b>+${items.length - SH}</b><span>${T('شوف باقي الممر', 'See the rest')}</span>${arrow}</button>` : ''}</div>
          <div class="sh-edge"></div>
        </section>`;
      }).join('') + '</div>').join('');
    spyShelves();
  }
  function renderGrid(keep) {
    const list = sorted(search(q, cur));
    const g = $('#grid');
    const label = [cur !== 'all' ? `${T('ممر', 'Aisle')} ${CAT[cur].aisle} · ${CAT[cur][lang]}` : '', q.trim() ? `«${esc(q.trim())}»` : ''].filter(Boolean).join(' · ');
    $('#gridHd').innerHTML = `<button class="back" type="button" id="backBtn">${arrow}<span>${T('رجوع لكل الممرات', 'Back to all aisles')}</span></button>${label ? `<h3>${label}</h3>` : `<h3>${T('كل المنتجات', 'All products')}</h3>`}`;
    if (list.length) g.innerHTML = list.slice(0, shown).map(card).join('');
    else {
      const sugg = S.products.filter(p => p.tag === 'hot').slice(0, mobile() ? 4 : 6);
      g.innerHTML = `<div class="empty-res"><p><b>${T('ما لقينا «' + esc(q.trim()) + '» على الرفوف أونلاين.', 'We couldn’t find “' + esc(q.trim()) + '” online.')}</b><br>${T('بس أكيد عنا أصناف أكثر بالمحل، ابعتلنا وبنجهّزه إلك.', 'The store stocks much more than what is listed here. Send us a message and we will get it ready.')}</p>${askBtn(q.trim())}<p class="er-sub">${T('أو جرّب من الأكثر طلبًا:', 'Or try our best sellers:')}</p></div>` + sugg.map(card).join('');
    }
    $('#resCount').textContent = list.length + ' ' + T('صنف', 'items');
    $('#moreBtn').parentElement.classList.toggle('hide', list.length <= shown);
    if (hasG && !reduce && !keep) gsap.fromTo($$('.card', g).slice(0, 24), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'expo.out', stagger: .025, clearProps: 'transform,opacity' });
  }
  function renderShop(keep) {
    const m = mode();
    $('#shop').dataset.mode = m;
    $('#resCount').textContent = m === 'shelves' ? S.products.length + ' ' + T('صنف في', 'items in') + ' ' + S.cats.length + ' ' + T('ممر', 'aisles') : '';
    if (m === 'shelves') { if (!$('#shelves').children.length || keep) renderShelves(); $('#moreBtn').parentElement.classList.add('hide'); }
    else renderGrid(keep);
    markAbar();
    hasG && ScrollTrigger.refresh();
  }
  function openAisle(id) { cur = id; q = ''; $('#q').value = ''; shown = PAGE; renderShop(); markAbar(); centerAbar(); scrollToEl('#shop', -10); }
  document.addEventListener('click', e => {
    const all = e.target.closest('[data-all]'); if (all) { openAisle(all.dataset.all); return; }
    if (e.target.closest('#backBtn')) { cur = 'all'; q = ''; $('#q').value = ''; $('#hq').value = ''; sort = 'pop'; $('#sort').value = 'pop'; renderShop(true); scrollToEl('#shop', -10); }
  });
  function syncCards(id) {
    $$(`[data-id="${id}"] .ctl`).forEach(el => { el.innerHTML = el.closest('.pk,.dl') ? ctrlSm(id) : ctrl(id); });
  }
  // delegated product events
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { const id = add.dataset.add; const im = add.closest('.card,.pk,.dl')?.querySelector('img'); setQty(id, (cart[id] || 0) + 1, im); return; }
    const d = e.target.closest('.qty[data-id] button');
    if (d) { const id = d.parentElement.dataset.id; const im = d.closest('.card,.pk,.dl,.ci-row')?.querySelector('img'); setQty(id, (cart[id] || 0) + +d.dataset.d, +d.dataset.d > 0 && !d.closest('.ci-row') ? im : null); return; }
    const qv = e.target.closest('[data-qv]:not(button)');
    if (qv && P[qv.dataset.qv]) openQV(qv.dataset.qv);
  });
  $('#moreBtn').addEventListener('click', () => { shown += PAGE; renderGrid(true); });
  let qt;
  $('#q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { q = e.target.value; shown = PAGE; renderShop(); }, 180); });
  $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(qt); q = e.target.value; shown = PAGE; renderShop(); e.target.blur(); } });
  $('#sort').addEventListener('change', e => { sort = e.target.value; shown = PAGE; renderShop(); });
  function applySearch(v) {
    q = v; cur = 'all'; shown = PAGE; $('#q').value = v; renderShop();
    scrollToEl('#shop', -10);
  }

  /* shelf scroll-spy: highlights the aisle you're walking through */
  let spyIO;
  function spyShelves() {
    spyIO && spyIO.disconnect();
    spyIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && mode() === 'shelves') { spy = e.target.dataset.cat; markAbar(); centerAbar(); } }), { rootMargin: '-45% 0px -50% 0px' });
    $$('.shelf').forEach(s => spyIO.observe(s));
  }
  // drag-to-scroll for all horizontal rails (mouse)
  function dragScroll(el) {
    let down = false, sx = 0, sl = 0, moved = false;
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.target.closest('button,input')) return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
    addEventListener('pointerup', () => { down = false; });
    el.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; el.classList.add('dragging'); } el.scrollLeft = sl - dx; });
    el.addEventListener('click', e => { el.classList.remove('dragging'); if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }
  document.addEventListener('pointerdown', e => { const r = e.target.closest('.sh-row,.pk-rail,.dl-rail'); if (r && !r.dataset.drag) { r.dataset.drag = 1; dragScroll(r); r.dispatchEvent(new PointerEvent('pointerdown', e)); } });

  /* ---------- picks ---------- */
  function renderPicks() {
    const list = S.products.filter(p => p.tag === 'hot');
    $('#pkRail').innerHTML = list.map(p => `<article class="pk" data-id="${p.id}"><img src="${img(p.id)}" alt="${esc(p[lang])}" loading="lazy" data-qv="${p.id}"><div class="pk-b"><div><small>${CAT[p.c][lang]}</small><h3>${p[lang]}</h3><p>${p.p} ₪</p></div><span class="ctl">${ctrlSm(p.id)}</span></div></article>`).join('');
  }
  const dirSign = () => lang === 'ar' ? -1 : 1;
  [['#pkPrev', '#pkRail', -1], ['#pkNext', '#pkRail', 1], ['#dlPrev', '#dlRail', -1], ['#dlNext', '#dlRail', 1]].forEach(([b, r, s]) => $(b).addEventListener('click', () => $(r).scrollBy({ left: 340 * s * dirSign(), behavior: 'smooth' })));

  /* ---------- quick view ---------- */
  let qvId = null, qvQ = 1;
  function openQV(id) {
    const p = P[id]; qvId = id; qvQ = cart[id] || 1;
    $('#qvImg').src = img(id); $('#qvImg').alt = p[lang];
    $('#qvAisle').textContent = T('ممر', 'Aisle') + ' ' + CAT[p.c].aisle + ' · ' + CAT[p.c][lang];
    $('#qvName').textContent = p[lang]; $('#qvSize').innerHTML = '<bdi dir="ltr">' + p.s + '</bdi>';
    $('#qvPrice').innerHTML = money(p.p) + (p.o ? ` <s>${money(p.o)}</s> <span class="qv-off">-${off(p)}%</span>` : '');
    $('#qvQty').textContent = qvQ;
    $('#qvAdd span').textContent = cart[id] ? T('حدّث السلة', 'Update basket') : T('أضف للسلة', 'Add to basket');
    const rel = inCat(p.c).filter(x => x.id !== id).slice(0, 4);
    $('#qvRel').innerHTML = `<small>${T('من نفس الممر', 'From the same aisle')}</small><div>${rel.map(r => `<img src="${img(r.id)}" alt="${esc(r[lang])}" title="${esc(r[lang])}" data-qv="${r.id}">`).join('')}</div>`;
    $('#qv').classList.add('open'); lockScroll(true);
  }
  function closeQV() { if (!$('#qv').classList.contains('open')) return; $('#qv').classList.remove('open'); lockScroll(false); }
  $$('[data-qv="-"],[data-qv="+"]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); qvQ = Math.max(1, Math.min(99, qvQ + (b.dataset.qv === '+' ? 1 : -1))); $('#qvQty').textContent = qvQ; }));
  $('#qvAdd').addEventListener('click', () => { setQty(qvId, qvQ, $('#qvImg')); closeQV(); });
  $('#qvClose').addEventListener('click', closeQV);
  $('#qv').addEventListener('click', e => { if (e.target.id === 'qv') closeQV(); });

  /* ---------- cart drawer ---------- */
  function renderCart() {
    const n = cartQty(), tot = cartTotal(), sv = cartSave();
    $$('.js-count').forEach(el => { el.textContent = n; el.classList.toggle('zero', !n); });
    $('#drCount').textContent = n ? `(${n} ${T('قطعة', 'items')})` : '';
    $('#drawer').classList.toggle('is-empty', !n);
    $('#drTotal').textContent = money(tot);
    $('#drSave').innerHTML = sv ? T('وفّرت ', 'You save ') + `<b>${money(sv)}</b>` : '';
    $('#drBody').innerHTML = Object.entries(cart).map(([id, qn]) => { const p = P[id]; return `<div class="ci-row"><img src="${img(id)}" alt=""><div><h4>${p[lang]}</h4><p><bdi dir="ltr">${p.s}</bdi> · ${p.p} ₪</p></div><div><div class="qty" data-id="${id}"><button type="button" data-d="-1">−</button><output>${qn}</output><button type="button" data-d="1">+</button></div><p class="lt">${money(p.p * qn)}</p></div></div>`; }).join('');
  }
  function openCart() { closeSearch(); $('#toast').classList.remove('show'); doc.classList.add('cart-open'); lockScroll(true); }
  function closeCart() { if (!doc.classList.contains('cart-open')) return; doc.classList.remove('cart-open'); lockScroll(false); }
  $$('.js-cart').forEach(b => b.addEventListener('click', openCart));
  $('#drClose').addEventListener('click', closeCart); $('#scrim').addEventListener('click', closeCart);
  $$('[data-close]').forEach(a => a.addEventListener('click', closeCart));
  $('#drClear').addEventListener('click', () => { const ids = Object.keys(cart); cart = {}; store.set('zt-cart', cart); ids.forEach(syncCards); renderCart(); });
  const form = $('#drForm');
  const draft = store.get('zt-form', {});
  ['name', 'addr', 'note'].forEach(k => { if (draft[k]) form[k].value = draft[k]; });
  if (draft.mode) { const r = form.querySelector(`[value=${draft.mode}]`); if (r) r.checked = true; }
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
      T('عدد القطع: ', 'Items: ') + cartQty(),
      T('المجموع التقريبي: ', 'Estimated total: ') + money(cartTotal()),
      T('الاسم: ', 'Name: ') + form.name.value.trim(),
      T('طريقة الاستلام: ', 'Receive by: ') + (del ? T('توصيل للبيت', 'Home delivery') : T('استلام من المحل', 'Store pick-up')),
      del ? T('العنوان: ', 'Address: ') + form.addr.value.trim() : '',
      form.note.value.trim() ? T('ملاحظات: ', 'Notes: ') + form.note.value.trim() : ''
    ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i > 0)).join('\n');
    window.open(waLink(msg), '_blank', 'noopener');
  });

  /* ---------- header search with live suggestions ---------- */
  const hq = $('#hq'), hsug = $('#hsug'); let sugOpen = false, sugIdx = -1;
  function sugHTML(v) {
    const cats = searchCats(v).slice(0, 3), list = search(v).slice(0, 6);
    let h = cats.map(c => `<button type="button" class="sg sg-cat" data-sgc="${c.id}">${ic(c.icon)}<span>${T('ممر', 'Aisle')} ${c.aisle} · <b>${c[lang]}</b></span><small>${inCat(c.id).length}</small></button>`).join('');
    h += list.map(p => `<button type="button" class="sg" data-sgp="${p.id}"><img src="${img(p.id)}" alt=""><span><b>${p[lang]}</b><small>${CAT[p.c][lang]} · <bdi dir="ltr">${p.s}</bdi></small></span><em>${p.p} ₪</em></button>`).join('');
    const total = search(v).length;
    if (total) h += `<button type="button" class="sg sg-all" data-sga="1">${T('شوف كل النتائج', 'See all results')} (${total}) ${arrow}</button>`;
    else h += `<div class="sg-empty"><p>${T('ما لقينا «' + esc(v) + '» أونلاين، بس ممكن يكون بالمحل.', 'No “' + esc(v) + '” online, but the store may have it.')}</p>${askBtn(v)}</div>`;
    return h;
  }
  function showSug() {
    const v = hq.value.trim();
    if (!v) { hideSug(); return; }
    hsug.innerHTML = sugHTML(v); hsug.classList.add('open'); sugOpen = true; sugIdx = -1;
  }
  function hideSug() { hsug.classList.remove('open'); sugOpen = false; }
  let ht; hq.addEventListener('input', () => { clearTimeout(ht); ht = setTimeout(showSug, 90); });
  hq.addEventListener('focus', () => { hd.classList.remove('hide'); doc.classList.remove('hd-hidden'); hq.value.trim() && showSug(); });
  hq.addEventListener('keydown', e => {
    const items = $$('.sg', hsug);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle('kb', i === sugIdx)); return; }
    if (e.key === 'Enter') { e.preventDefault(); if (sugIdx >= 0 && items[sugIdx]) items[sugIdx].click(); else { hideSug(); hq.blur(); applySearch(hq.value.trim()); } }
    if (e.key === 'Escape') { hideSug(); hq.blur(); }
  });
  $('#hsForm').addEventListener('submit', e => { e.preventDefault(); hideSug(); applySearch(hq.value.trim()); });
  hsug.addEventListener('click', e => {
    const p = e.target.closest('[data-sgp]'), c = e.target.closest('[data-sgc]'), a = e.target.closest('[data-sga]');
    if (p) { hideSug(); openQV(p.dataset.sgp); } else if (c) { hideSug(); hq.value = ''; openAisle(c.dataset.sgc); } else if (a) { hideSug(); applySearch(hq.value.trim()); }
  });
  document.addEventListener('pointerdown', e => { if (sugOpen && !e.target.closest('.hd-search')) hideSug(); });

  /* ---------- search overlay (mobile + shortcut) ---------- */
  const sov = $('#sov');
  const POP = [['رز', 'Rice'], ['حليب', 'Milk'], ['زيت زيتون', 'Olive oil'], ['دجاج', 'Chicken'], ['خبز', 'Bread'], ['قهوة', 'Coffee'], ['حفاضات', 'Diapers'], ['شوكولاتة', 'Chocolate'], ['منظفات', 'Cleaner'], ['برينجلز', 'Pringles']];
  function renderPopular() { $('#sPop').innerHTML = `<small>${T('الأكثر بحثًا', 'Popular searches')}</small>` + POP.map(([a, b]) => `<button type="button" data-pop="${T(a, b)}">${T(a, b)}</button>`).join(''); }
  $('#sPop').addEventListener('click', e => { const b = e.target.closest('[data-pop]'); if (b) { $('#sq').value = b.dataset.pop; renderSres(b.dataset.pop); } });
  function openSearch() { closeCart(); doc.classList.remove('nav-open'); sov.classList.add('open'); lockScroll(true); setTimeout(() => $('#sq').focus(), 120); renderSres($('#sq').value); }
  function closeSearch() { if (!sov.classList.contains('open')) return; sov.classList.remove('open'); lockScroll(false); }
  function renderSres(v) {
    v = v.trim();
    $('#sPop').style.display = v ? 'none' : '';
    const cats = v ? searchCats(v) : [];
    const list = v ? search(v) : S.products.filter(p => p.o).slice(0, 12);
    $('#sCats').innerHTML = cats.map(c => `<button type="button" data-sgc="${c.id}">${ic(c.icon)}${c[lang]} <small>${inCat(c.id).length}</small></button>`).join('');
    $('#sMeta').innerHTML = v ? (list.length ? `${list.length} ${T('نتيجة', 'results')} <button type="button" id="sAll">${T('اعرضها بالمتجر', 'Show in shop')} ${arrow}</button>` : '') : T('عروض الأسبوع', 'This week’s deals');
    $('#sres').innerHTML = list.length ? list.slice(0, 30).map(p => `<div class="sres" data-sid="${p.id}"><img src="${img(p.id)}" alt="" loading="lazy"><div>${p[lang]}<b>${p.p} ₪${p.o ? ` <s>${p.o}</s>` : ''}</b></div><span class="ctl">${ctrlSm(p.id)}</span></div>`).join('')
      : `<div class="empty-res"><p><b>${T('ما لقينا «' + esc(v) + '» أونلاين.', 'No “' + esc(v) + '” online.')}</b><br>${T('ابعتلنا اسمه وبنشوفلك إياه بالمحل.', 'Send us the name and we will check the store for you.')}</p>${askBtn(v)}</div>`;
  }
  $$('.js-search').forEach(b => b.addEventListener('click', openSearch));
  $('#sovClose').addEventListener('click', closeSearch);
  let st; $('#sq').addEventListener('input', e => { clearTimeout(st); st = setTimeout(() => renderSres(e.target.value), 90); });
  $('#sq').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v && search(v).length) { closeSearch(); applySearch(v); } else renderSres(v); e.target.blur(); } });
  sov.addEventListener('click', e => {
    if (e.target.closest('.ctl')) return;
    const s = e.target.closest('[data-sid]'), c = e.target.closest('[data-sgc]');
    if (s) { openQV(s.dataset.sid); }
    else if (c) { closeSearch(); openAisle(c.dataset.sgc); }
    else if (e.target.closest('#sAll')) { const v = $('#sq').value.trim(); closeSearch(); applySearch(v); }
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('#qv').classList.contains('open')) closeQV(); else { closeCart(); closeSearch(); doc.classList.remove('nav-open'); } }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); if (getComputedStyle($('.hd-search')).display !== 'none') { hq.focus(); scrollY < 10 || hd.classList.remove('hide'); } else openSearch(); }
  });

  /* ---------- fly to cart + toast ---------- */
  function fly(im) {
    const btn = mobile() ? $('#bnCart') : $('#cartBtn');
    const tgt = btn.getBoundingClientRect();
    btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
    if (!im || reduce || !hasG) return;
    const r = im.getBoundingClientRect();
    const c = im.cloneNode(); c.className = 'fly'; c.removeAttribute('loading'); c.removeAttribute('data-qv');
    Object.assign(c.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
    document.body.appendChild(c);
    gsap.to(c, { left: tgt.left + tgt.width / 2 - 20, top: tgt.top + tgt.height / 2 - 20, width: 40, height: 40, borderRadius: 20, opacity: .3, duration: .8, ease: 'power3.in', onComplete: () => c.remove() });
  }
  let tt; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800); }

  /* ---------- scroll helpers ---------- */
  let lenis = null, locks = 0;
  function lockScroll(on) { locks = Math.max(0, locks + (on ? 1 : -1)); const l = locks > 0; doc.classList.toggle('no-scroll', l); if (lenis) l ? lenis.stop() : lenis.start(); }
  function scrollToEl(sel, offset = -10) { const el = typeof sel === 'string' ? $(sel) : sel; if (!el) return; const top = Math.max(0, el.getBoundingClientRect().top + scrollY + offset); if (lenis) { lenis.resize(); lenis.scrollTo(top, { force: true }); } else window.scrollTo({ top, behavior: 'smooth' }); }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const h = a.getAttribute('href'); if (h.length > 1 && $(h)) { e.preventDefault(); scrollToEl(h); } else if (h === '#top') { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }); } }));

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
      .to('.door-r', { xPercent: 105, duration: 1.4, ease: 'expo.inOut' }, fast ? 1.5 : 3.0)
      .to('.door-l', { xPercent: -105, duration: 1.4, ease: 'expo.inOut' }, '<')
      .to('.intro-skip', { opacity: 0, duration: .3 }, '<');
    $('.intro-skip').addEventListener('click', () => tl.progress(.999));
    try { sessionStorage.setItem('zt-intro', 1); } catch (e) {}
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
      .from('.hero-cta > *', { y: 24, opacity: 0, duration: 1, stagger: .1 }, .75)
      .from('.hero-stats li', { y: 20, opacity: 0, duration: 1, stagger: .1 }, .9)
      .from('.fl', { y: 120, opacity: 0, duration: 1.6, stagger: .15 }, .6);
    $$('.count').forEach(el => { const o = { v: 0 }; gsap.to(o, { v: +el.dataset.to, duration: 2, delay: 1, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) }); });
  }
  function scrollFX() {
    if (!hasG || reduce) return;
    gsap.to('.hero-media video', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-in', { y: -60, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
    $$('.fl').forEach((f, i) => gsap.to(f, { y: -120 - i * 60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
    ScrollTrigger.batch('.zone', { start: 'top 90%', onEnter: b => gsap.fromTo(b, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .1 }), once: true });
    gsap.from('.dl', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: '.dl-rail', start: 'top 88%' } });
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
  $$('[data-n=products]').forEach(el => el.dataset.to = S.products.length);
  $$('[data-n=aisles]').forEach(el => el.dataset.to = S.cats.length);
  applyLang(true);
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', e => { onScroll(e.scroll); hasG && ScrollTrigger.update(); });
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  } else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  lockScroll(true);
  runIntro(() => { lockScroll(false); heroIn(); });
  splitAll(); scrollFX(); onScroll(scrollY);
  const deep = new URLSearchParams(location.search).get('q');
  if (deep) setTimeout(() => applySearch(deep), 1800);
})();
