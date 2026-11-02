/* WESTEROS — site behaviour: preload, scroll scenes, menu, cart, i18n */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const MENU = window.WESTEROS_MENU || [];
  const WA = '201080080478';
  const IMG = k => `assets/img/menu/${k}.webp`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------------- i18n ---------------- */
  const T = {
    ar: {
      'nav.menu': 'المنيو', 'nav.new': 'الجديد', 'nav.sweet': 'الحلو والمشروبات', 'nav.offers': 'العروض', 'nav.visit': 'زورنا', 'nav.order': 'اطلب الآن',
      'hero.kicker': 'مدينة نصر · برجر آند مور', 'hero.t1': 'كل طبقة', 'hero.t2': 'محسوبة.',
      'hero.lead': 'لحم صافي، بريوش محمص، وشيدر بيسيح على مهله. انزل بالراحة… وشوف البرجر بيتبني قدامك.',
      'lbl.bun': 'بريوش محمص', 'lbl.cheddar': 'شيدر أمريكي', 'lbl.beef': 'لحم صافي 100%', 'lbl.veg': 'خس · طماطم · بصل', 'lbl.sauce': 'صوص ويستروس',
      'hero.signature': 'التوقيع بتاعنا', 'hero.classic': 'كلاسيك بيف برجر', 'hero.scroll': 'انزل', egp: 'ج.م',
      'cta.addClassic': 'ضيفه لطلبك', 'cta.fullMenu': 'المنيو كامل', 'cta.add': 'ضيف للطلب',
      'story.kicker': 'مين إحنا', 'story.title': 'برجر بيتعمل بمزاج، مش بالعافية.',
      'story.p1': 'ويستروس اتولد في مدينة نصر عشان يقدّم برجر يتاكل ويتفكر فيه: عيش بريوش بيتحمّص لحظة الطلب، لحم صافي ودجاج متتبل على طريقتنا، وصوصات معمولة في مطبخنا بأسامي هتحفظها من أول قضمة.',
      'story.s1': 'صنف في المنيو', 'story.s2': 'صوصات من مطبخنا', 'story.s3': 'قسم في المنيو',
      'new.kicker': 'جديد على المنيو', 'new.t1': 'كوردن بلو', 'new.sub': 'قطعة دجاج 190 جرام محشية موتزريلا وسلامي، متغلفة ومقرمشة، وجوه بريوش طري. تلات شخصيات… اختار بتاعتك.',
      'sand.kicker': 'من البرجر… للساندويتش', 'sand.title': 'كولونيل', 'sand.lead': 'عيش فينا طري، قطع دجاج كرسبي، رانش وصوص ستارك المدخن، وموتزريلا سايحة فوق الكل.',
      'sand.s1': 'عيش فينا طري بالسمسم', 'sand.s2': 'خس فريش', 'sand.s3': 'قطع فيليه دجاج كرسبي', 'sand.s4': 'صوص رانش + ستارك المدخن', 'sand.s5': 'موتزريلا سايحة',
      'menu.kicker': 'المنيو الكامل', 'menu.title': 'اختار… وإحنا علينا الباقي', 'menu.sub': 'كل الأصناف والأسعار محدّثة من فرعنا في مدينة نصر. دوس على أي صنف للتفاصيل، وضيفه لطلبك.',
      'menu.search': 'دوّر على صنف…', 'menu.empty': 'مفيش صنف بالاسم ده. جرّب كلمة تانية.', 'menu.items': 'صنف', 'menu.all': 'الكل',
      'sweet.kicker': 'بعد البرجر', 'sweet.t1': 'الجانب', 'sweet.t2': 'الحلو.', 'sweet.sub': 'ميلك شيك بطبقات كريمة وصوصات بتنزل على الكوباية، وكرانشي كيك سخنة جنبها فنجان قهوة تركي.',
      'fizz.kicker': 'موكتيل وإيطاليان صودا', 'fizz.title': 'انتعش بين القضمة والتانية.', 'fizz.sub': 'مانجو وبرتقال فريش، خوخ وتفاح أحمر، عسل وليمون وجراندين… كلها على مياه فوارة وتلج كتير.',
      'offers.kicker': 'عروض وبوكسات', 'offers.title': 'جاي مع الشلة؟', 'offers.sub': 'بوكسات معمولة للمشاركة، بأسعار أوفر من الطلب لوحده.', save: 'وفّر',
      'fit.kicker': 'وجبات صحية', 'fit.title': 'متابع الماكروز؟ إحنا كمان.', 'fit.sub': 'صدر دجاج مشوي 200 جرام، والسعرات والبروتين مكتوبين بالظبط.',
      'mac.kcal': 'سعرة', 'mac.p': 'بروتين', 'mac.c': 'كارب', 'mac.f': 'دهون',
      'visit.kicker': 'زورنا', 'visit.title': 'مدينة نصر، المنطقة الأولى.', 'visit.addr': 'قصاد مسجد فاطمة الزهراء، جنب جنينة مول.',
      'visit.f1t': 'توصيل واستلام', 'visit.f1': 'اطلب دليفري أو عدّي خد طلبك من الفرع.', 'visit.f2t': 'الدفع', 'visit.f2': 'كاش عند الاستلام.', 'visit.f3t': 'تليفون وواتساب',
      'visit.wa': 'كلّمنا واتساب', 'visit.dir': 'الاتجاهات', 'visit.online': 'اطلب أونلاين', 'foot.city': 'مدينة نصر، القاهرة',
      'cart.title': 'طلبك', 'cart.pickup': 'استلام من الفرع', 'cart.delivery': 'توصيل', 'cart.name': 'الاسم', 'cart.addr': 'العنوان بالتفصيل',
      'cart.note': 'ملاحظات (من غير بصل، صوص زيادة…)', 'cart.total': 'الإجمالي', 'cart.send': 'ابعت الطلب على واتساب',
      'cart.hint': 'هيتفتح واتساب برسالة جاهزة بالطلب، وفريق ويستروس هيأكد معاك.', 'cart.empty': 'السلة فاضية', 'cart.emptySub': 'ضيف أي صنف من المنيو وهيظهر هنا.',
      'toast.added': 'اتضاف لطلبك ✓', 'toast.empty': 'ضيف صنف الأول', 'toast.addr': 'اكتب العنوان للتوصيل',
      'wa.head': 'طلب جديد من موقع ويستروس', 'wa.total': 'الإجمالي', 'wa.mode': 'النوع', 'wa.name': 'الاسم', 'wa.addr': 'العنوان', 'wa.note': 'ملاحظات', 'wa.fee': '(مصاريف التوصيل حسب المنطقة)',
      new: 'جديد', hot: 'حار', off: 'خصم'
    },
    en: {
      'nav.menu': 'Menu', 'nav.new': 'New', 'nav.sweet': 'Sweets & Drinks', 'nav.offers': 'Offers', 'nav.visit': 'Visit', 'nav.order': 'Order now',
      'hero.kicker': 'Nasr City · burger & more', 'hero.t1': 'Every layer', 'hero.t2': 'counts.',
      'hero.lead': 'Pure beef, toasted brioche and cheddar that melts slowly. Scroll down and watch the burger build itself.',
      'lbl.bun': 'Toasted brioche', 'lbl.cheddar': 'American cheddar', 'lbl.beef': '100% pure beef', 'lbl.veg': 'Lettuce · tomato · onion', 'lbl.sauce': 'Westeros sauce',
      'hero.signature': 'Our signature', 'hero.classic': 'Classic Beef Burger', 'hero.scroll': 'Scroll', egp: 'EGP',
      'cta.addClassic': 'Add to order', 'cta.fullMenu': 'Full menu', 'cta.add': 'Add to order',
      'story.kicker': 'Who we are', 'story.title': 'Burgers made with intent, never in a rush.',
      'story.p1': 'Westeros was born in Nasr City to serve burgers worth thinking about: brioche toasted the moment you order, pure beef and chicken seasoned our way, and house sauces with names you will remember after the first bite.',
      'story.s1': 'items on the menu', 'story.s2': 'house sauces', 'story.s3': 'menu sections',
      'new.kicker': 'New on the menu', 'new.t1': 'Cordon Bleu', 'new.sub': 'A 190g chicken piece stuffed with mozzarella and salami, crumbed and crunchy, inside a soft brioche. Three characters. Pick yours.',
      'sand.kicker': 'From burger… to sandwich', 'sand.title': 'Colonel', 'sand.lead': 'Soft Vienna bun, crispy chicken bites, ranch and smoky Stark sauce, with melted mozzarella over everything.',
      'sand.s1': 'Soft sesame Vienna bun', 'sand.s2': 'Fresh lettuce', 'sand.s3': 'Crispy chicken bites', 'sand.s4': 'Ranch + smoky Stark sauce', 'sand.s5': 'Melted mozzarella',
      'menu.kicker': 'The full menu', 'menu.title': 'You choose. We handle the rest.', 'menu.sub': 'Every item and price is live from our Nasr City branch. Tap any item for details and add it to your order.',
      'menu.search': 'Search the menu…', 'menu.empty': 'Nothing matches that. Try another word.', 'menu.items': 'items', 'menu.all': 'All',
      'sweet.kicker': 'After the burger', 'sweet.t1': 'The sweet', 'sweet.t2': 'side.', 'sweet.sub': 'Milkshakes stacked with cream and sauce running down the cup, and warm crunchy cakes served with Turkish coffee.',
      'fizz.kicker': 'Mocktails & Italian soda', 'fizz.title': 'Refresh between bites.', 'fizz.sub': 'Mango and fresh orange, peach and red apple, honey, lemon and grenadine. All on sparkling water and plenty of ice.',
      'offers.kicker': 'Offers & boxes', 'offers.title': 'Coming with the crew?', 'offers.sub': 'Boxes built for sharing, priced lower than ordering each item alone.', save: 'Save',
      'fit.kicker': 'Health meals', 'fit.title': 'Tracking macros? So are we.', 'fit.sub': '200g grilled chicken breast, with calories and protein written down exactly.',
      'mac.kcal': 'kcal', 'mac.p': 'protein', 'mac.c': 'carbs', 'mac.f': 'fats',
      'visit.kicker': 'Visit us', 'visit.title': 'Nasr City, First District.', 'visit.addr': 'Opposite Fatima Al-Zahraa Mosque, next to Geneina Mall.',
      'visit.f1t': 'Delivery & pickup', 'visit.f1': 'Order delivery or pick up from the branch.', 'visit.f2t': 'Payment', 'visit.f2': 'Cash on delivery or pickup.', 'visit.f3t': 'Phone & WhatsApp',
      'visit.wa': 'WhatsApp us', 'visit.dir': 'Directions', 'visit.online': 'Order online', 'foot.city': 'Nasr City, Cairo',
      'cart.title': 'Your order', 'cart.pickup': 'Pickup', 'cart.delivery': 'Delivery', 'cart.name': 'Name', 'cart.addr': 'Full address',
      'cart.note': 'Notes (no onions, extra sauce…)', 'cart.total': 'Total', 'cart.send': 'Send order on WhatsApp',
      'cart.hint': 'WhatsApp opens with your order ready to send, and the Westeros team will confirm it.', 'cart.empty': 'Your bag is empty', 'cart.emptySub': 'Add anything from the menu and it shows up here.',
      'toast.added': 'Added to your order ✓', 'toast.empty': 'Add an item first', 'toast.addr': 'Add your address for delivery',
      'wa.head': 'New order from the Westeros website', 'wa.total': 'Total', 'wa.mode': 'Type', 'wa.name': 'Name', 'wa.addr': 'Address', 'wa.note': 'Notes', 'wa.fee': '(delivery fee depends on area)',
      new: 'New', hot: 'Spicy', off: 'off'
    }
  };
  let lang = store.get('wst-lang', 'ar');
  if (!T[lang]) lang = 'ar';
  const t = k => (T[lang][k] ?? T.ar[k] ?? k);
  const N = o => (lang === 'en' ? o.en : o.ar);
  const D = o => (lang === 'en' ? (o.den || o.dar) : (o.dar || o.den));

  function applyLang() {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $('#langBtn').textContent = lang === 'ar' ? 'EN' : 'ع';
    document.title = lang === 'ar' ? 'ويستروس | WESTEROS burger & more — مدينة نصر' : 'WESTEROS burger & more — Nasr City, Cairo';
  }

  /* ---------------- data helpers ---------------- */
  const byId = new Map();
  const catOf = new Map();
  MENU.forEach(c => c.items.forEach(i => { if (!byId.has(i.id)) { byId.set(i.id, i); catOf.set(i.id, c); } }));
  const cat = id => MENU.find(c => c.id === id) || { items: [] };
  const money = n => `${n}`;
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  /* ---------------- logo ---------------- */
  async function loadLogo() {
    try {
      const svg = await (await fetch('assets/img/logo.svg')).text();
      $$('[data-logo]').forEach(el => { el.innerHTML = svg; });
    } catch (e) {}
  }

  /* ---------------- frames ---------------- */
  function loadFrames(dir, n) {
    return Array.from({ length: n }, (_, i) => {
      const im = new Image();
      im.decoding = 'async';
      im.src = `assets/img/seq/${dir}/${String(i + 1).padStart(3, '0')}.webp`;
      return im;
    });
  }
  const burgerFrames = loadFrames('burger', 48);
  const sandFrames = loadFrames('sandwich', 62);

  function preload(onProgress) {
    const all = [...burgerFrames, ...sandFrames.slice(0, 6)];
    let done = 0;
    return new Promise(res => {
      const tick = () => { done++; onProgress(done / all.length); if (done >= all.length) res(); };
      all.forEach(im => { if (im.complete && im.naturalWidth) tick(); else { im.onload = tick; im.onerror = tick; } });
      setTimeout(res, 9000);
    });
  }

  /* ---------------- canvas scene ---------------- */
  function makeScene(canvas, frames, opts) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, last = -1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      last = -1; draw(cur);
    }
    let cur = 0;
    function place(im) {
      const fw = im.naturalWidth || opts.w, fh = im.naturalHeight || opts.h;
      const o = opts.layout(W, H, fw, fh);
      return o;
    }
    function draw(p) {
      cur = p;
      const f = Math.max(0, Math.min(frames.length - 1, p * (frames.length - 1)));
      const a = Math.floor(f), b = Math.min(frames.length - 1, a + 1), k = f - a;
      const key = Math.round(f * 100);
      if (key === last) return; last = key;
      const A = frames[a], B = frames[b];
      if (!A.complete || !A.naturalWidth) return;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const o = place(A);
      ctx.globalAlpha = 1; ctx.drawImage(A, o.x, o.y, o.w, o.h);
      if (opts.blend && k > 0.01 && B.complete && B.naturalWidth) { ctx.globalAlpha = k; ctx.drawImage(B, o.x, o.y, o.w, o.h); ctx.globalAlpha = 1; }
    }
    window.addEventListener('resize', size);
    frames.forEach((im, i) => { if (i === 0) im.addEventListener('load', () => { last = -1; draw(cur); }); });
    size();
    return { draw, size };
  }

  const heroLayout = (W, H, fw, fh) => {
    const portrait = W / H < 0.9;
    let s = (H * 0.94) / fh;
    if (portrait) s = Math.min(Math.max(W / fw, H / fh), (W * 1.85) / fw);
    const w = fw * s, h = fh * s;
    const cy = portrait ? H * 0.4 : H * 0.5;
    return { x: (W - w) / 2, y: cy - h / 2, w, h };
  };
  const sandLayout = (W, H, fw, fh) => {
    const portrait = W / H < 0.9;
    const rtl = document.documentElement.dir === 'rtl';
    let s, cx, cy;
    if (portrait) { s = (W * 1.25) / fw; cx = W / 2; cy = H * 0.3; }
    else { s = Math.min(H / fh * 1.05, (W * 0.66) / fw); cx = rtl ? W * 0.33 : W * 0.67; cy = H * 0.5; }
    const w = fw * s, h = fh * s;
    return { x: cx - w / 2, y: cy - h / 2, w, h };
  };

  /* ---------------- rendering ---------------- */
  function badges(i, isNew) {
    let b = '';
    if (isNew) b += `<span class="badge">${t('new')}</span>`;
    if (i.was) b += `<span class="badge badge--dark">−${i.was - i.p} ${t('egp')}</span>`;
    if (i.hot) b += `<span class="badge badge--hot">🌶 ${t('hot')}</span>`;
    return b;
  }
  const priceHtml = i => `<div class="price"><b>${money(i.p)}</b><small>${t('egp')}</small>${i.was ? `<s>${i.was}</s>` : ''}</div>`;

  function cardHtml(i, mini) {
    const isNew = catOf.get(i.id)?.id === 'cordon-bleu' || i.id === 160564;
    return `<article class="card${mini ? ' card--mini' : ''}" data-id="${i.id}" data-search="${esc((i.ar + ' ' + i.en + ' ' + i.dar + ' ' + i.den).toLowerCase())}">
      <div class="card__media"><div class="card__badges">${badges(i, isNew)}</div><img loading="lazy" decoding="async" src="${IMG(i.img)}" width="${i.w}" height="${i.h}" alt="${esc(N(i))}"></div>
      <h4>${esc(N(i))}</h4><div class="en">${esc(i.en)}</div>
      <p>${esc(D(i) || ' ')}</p>
      <div class="card__foot">${priceHtml(i)}<button class="add" type="button" data-add="${i.id}" aria-label="${t('cta.add')}">+</button></div>
    </article>`;
  }

  function renderMenu() {
    $('#menuCats').innerHTML = MENU.map((c, n) => `<a class="cat-pill${n === 0 ? ' on' : ''}" href="#c-${c.id}" data-cat="${c.id}"><img src="${IMG(c.img)}" alt="" loading="lazy">${esc(N(c))}</a>`).join('');
    $('#menuList').innerHTML = MENU.map((c, n) => `<section class="mcat" id="c-${c.id}" data-cat="${c.id}">
      <div class="mcat__head"><div class="mcat__num">${String(n + 1).padStart(2, '0')}</div><div><h3>${esc(N(c))}</h3><span>${esc(lang === 'en' ? c.ar : c.en)}</span></div><div class="mcat__count">${c.items.length} ${t('menu.items')}</div></div>
      <div class="grid">${c.items.map(i => cardHtml(i)).join('')}</div></section>`).join('');
  }

  function renderNew() {
    $('#newGrid').innerHTML = cat('cordon-bleu').items.map(i => `<article class="bleu" data-id="${i.id}">
      <span class="bleu__tag">${t('save')} ${i.was - i.p} ${t('egp')}</span>
      <div class="bleu__img"><img src="${IMG(i.img)}" alt="${esc(N(i))}" loading="lazy"></div>
      <h3>${esc(N(i))}</h3><div class="en">${esc(i.en)}</div>
      <p>${esc(D(i))}</p>
      <div class="bleu__buy"><div class="bleu__price"><b>${i.p}</b><small>${t('egp')}</small><s>${i.was}</s></div><button class="btn btn--gold btn--sm" type="button" data-add="${i.id}">${t('cta.add')}</button></div>
    </article>`).join('');
  }

  function renderSweet() {
    const shakes = cat('shakes').items;
    const cakes = cat('desserts').items.filter(i => i.id !== 157820);
    const coffee = byId.get(157820);
    const html = [...shakes.slice(0, 3), ...cakes.slice(0, 1), ...shakes.slice(3), ...cakes.slice(1), coffee].filter(Boolean).map(i => {
      const isCake = catOf.get(i.id).id === 'desserts';
      return `<div class="shake${isCake ? ' shake--cake' : ''}" data-id="${i.id}"><div class="shake__img"><img src="${IMG(i.img)}" alt="${esc(N(i))}" loading="lazy"></div>
        <h4>${esc(N(i))}</h4><div class="en">${esc(i.en)}</div><div class="p">${i.p} <small>${t('egp')}</small></div></div>`;
    }).join('');
    $('#sweetTrack').innerHTML = html + '<div class="sweet__word" aria-hidden="true">SWEET</div>';
  }

  function renderFizz() {
    const items = [...cat('mocktails').items, ...cat('soda').items];
    $('#fizzList').innerHTML = items.map(i => `<div class="fizz__row" data-id="${i.id}"><img src="${IMG(i.img)}" alt="" loading="lazy"><div><b>${esc(N(i))}</b><span>${esc(D(i))}</span></div>${priceHtml(i)}<button class="add" type="button" data-add="${i.id}" aria-label="${t('cta.add')}">+</button></div>`).join('');
    const pos = [
      { id: 148638, l: 4, t: 8, w: 30, sp: -1.2, r: -8 },
      { id: 148640, l: 36, t: 0, w: 27, sp: 1.6, r: 6 },
      { id: 145623, l: 66, t: 14, w: 28, sp: -0.8, r: 10 },
      { id: 148639, l: 16, t: 50, w: 30, sp: 1.1, r: 4 },
      { id: 145624, l: 52, t: 46, w: 31, sp: -1.6, r: -6 }
    ];
    $('#fizzStage').innerHTML = pos.map(p => { const i = byId.get(p.id); return `<img src="${IMG(i.img)}" alt="" data-speed="${p.sp}" style="left:${p.l}%;top:${p.t}%;width:${p.w}%;rotate:${p.r}deg" loading="lazy">`; }).join('');
    const bub = $('.fizz__bubbles');
    if (!bub.children.length) {
      bub.innerHTML = Array.from({ length: 26 }, () => { const s = 6 + Math.random() * 26; return `<i style="left:${Math.random() * 100}%;width:${s}px;height:${s}px;animation-duration:${8 + Math.random() * 12}s;animation-delay:-${Math.random() * 18}s;--dx:${(Math.random() - .5) * 80}px"></i>`; }).join('');
    }
  }

  function renderOffers() {
    $('#offersGrid').innerHTML = cat('offers').items.map(i => {
      const pct = i.was ? Math.round((1 - i.p / i.was) * 100) : 0;
      return `<article class="offer" data-id="${i.id}">
        ${i.was ? `<div class="offer__save"><span>${t('save')}</span><b>${pct}%</b></div>` : ''}
        <div class="offer__media"><img src="${IMG(i.img)}" alt="${esc(N(i))}" loading="lazy"></div>
        <div class="offer__body"><h4>${esc(N(i))}</h4><p>${esc(D(i))}</p>
        <div class="card__foot">${priceHtml(i)}<button class="add" type="button" data-add="${i.id}" aria-label="${t('cta.add')}">+</button></div></div></article>`;
    }).join('');
  }

  function macroHtml(m) {
    if (!m) return '';
    const max = [700, 60, 80, 20];
    const lab = ['mac.kcal', 'mac.p', 'mac.c', 'mac.f'];
    return m.map((v, k) => `<div class="macro"><b>${v}${k ? '<small style="font-size:.5em">g</small>' : ''}</b><span>${t(lab[k])}</span><i style="--v:0%" data-v="${Math.min(100, v / max[k] * 100)}%"></i></div>`).join('');
  }
  function renderFit() {
    const items = [...cat('fit').items.filter(i => i.mac)];
    $('#fitGrid').innerHTML = items.map(i => `<article class="fitc" data-id="${i.id}"><div class="fitc__img"><img src="${IMG(i.img)}" alt="${esc(N(i))}" loading="lazy"></div>
      <h4>${esc(N(i))}</h4><p>${esc(D(i))}</p><div class="macros">${macroHtml(i.mac)}</div>
      <div class="card__foot">${priceHtml(i)}<button class="add" type="button" data-add="${i.id}" aria-label="${t('cta.add')}">+</button></div></article>`).join('');
  }

  function renderAll() {
    renderMenu(); renderNew(); renderSweet(); renderFizz(); renderOffers(); renderFit(); renderCart();
  }

  /* ---------------- cart ---------------- */
  let cart = store.get('wst-cart', {});
  const cartItems = () => Object.entries(cart).map(([id, q]) => ({ i: byId.get(+id), q })).filter(x => x.i && x.q > 0);
  const cartTotal = () => cartItems().reduce((s, x) => s + x.i.p * x.q, 0);
  function addToCart(id, q = 1, el) {
    if (!byId.has(+id)) return;
    cart[id] = (cart[id] || 0) + q; store.set('wst-cart', cart);
    renderCart(); toast(t('toast.added'));
    const fab = $('#cartFab'); fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
    if (el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); flyTo(el, byId.get(+id)); }
  }
  function flyTo(el, item) {
    if (reduce || !window.gsap) return;
    const from = el.getBoundingClientRect(), to = $('#cartFab').getBoundingClientRect();
    const im = document.createElement('img'); im.src = IMG(item.img);
    Object.assign(im.style, { position: 'fixed', zIndex: 140, width: '70px', left: from.left + from.width / 2 - 35 + 'px', top: from.top + from.height / 2 - 35 + 'px', pointerEvents: 'none' });
    document.body.appendChild(im);
    gsap.to(im, { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: .25, rotate: 25, duration: .8, ease: 'power3.in', onComplete: () => im.remove() });
  }
  function setQty(id, q) { if (q <= 0) delete cart[id]; else cart[id] = q; store.set('wst-cart', cart); renderCart(); }
  function renderCart() {
    const items = cartItems(); const n = items.reduce((s, x) => s + x.q, 0); const tot = cartTotal();
    $('#cartCount').textContent = n;
    $('#cartFabTotal').textContent = n ? `${tot} ${t('egp')}` : '';
    $('#cartFab').classList.toggle('show', n > 0);
    $('#cartTotal').textContent = `${tot} ${t('egp')}`;
    $('#cartList').innerHTML = items.length ? items.map(({ i, q }) => `<div class="line"><img src="${IMG(i.img)}" alt=""><div><b>${esc(N(i))}</b><small>${i.p * q} ${t('egp')}</small></div>
      <div class="qty"><button type="button" data-q="${i.id}" data-d="-1">−</button><span>${q}</span><button type="button" data-q="${i.id}" data-d="1">+</button></div></div>`).join('')
      : `<div class="drawer__empty"><b>${t('cart.empty')}</b>${t('cart.emptySub')}</div>`;
  }
  function openDrawer(v) { $('#drawer').classList.toggle('open', v); $('#drawer').setAttribute('aria-hidden', !v); lockScroll(v); }
  function sendOrder() {
    const items = cartItems();
    if (!items.length) { toast(t('toast.empty')); return; }
    const mode = $('input[name="mode"]:checked').value;
    const name = $('#cName').value.trim(), addr = $('#cAddr').value.trim(), note = $('#cNote').value.trim();
    if (mode === 'delivery' && !addr) { toast(t('toast.addr')); $('#cAddr').focus(); return; }
    const L = [`🍔 *${t('wa.head')}*`, '━━━━━━━━━━'];
    items.forEach(({ i, q }) => L.push(`${q}× ${N(i)} — ${i.p * q} ${t('egp')}`));
    L.push('━━━━━━━━━━', `*${t('wa.total')}: ${cartTotal()} ${t('egp')}*`);
    if (mode === 'delivery') L.push(t('wa.fee'));
    L.push(`${t('wa.mode')}: ${t(mode === 'delivery' ? 'cart.delivery' : 'cart.pickup')}`);
    if (name) L.push(`${t('wa.name')}: ${name}`);
    if (mode === 'delivery') L.push(`${t('wa.addr')}: ${addr}`);
    if (note) L.push(`${t('wa.note')}: ${note}`);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(L.join('\n'))}`, '_blank', 'noopener');
  }

  /* ---------------- modal ---------------- */
  let mItem = null, mQty = 1;
  function openModal(id) {
    const i = byId.get(+id); if (!i) return;
    mItem = i; mQty = 1;
    $('#mImg').src = IMG(i.img); $('#mImg').alt = N(i);
    $('#mCat').textContent = N(catOf.get(i.id));
    $('#mName').textContent = N(i) + (i.hot ? ' 🌶' : '');
    $('#mEn').textContent = lang === 'en' ? i.ar : i.en;
    $('#mDesc').textContent = D(i) || '';
    const mac = $('#mMac'); mac.innerHTML = macroHtml(i.mac); mac.hidden = !i.mac;
    requestAnimationFrame(() => $$('#mMac i').forEach(b => b.style.setProperty('--v', b.dataset.v)));
    updM(); $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false'); lockScroll(true);
  }
  function updM() { $('#mQty').textContent = mQty; $('#mPrice').textContent = `${mItem.p * mQty} ${t('egp')}`; }
  function closeModal() { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true'); lockScroll(false); }

  let lenis = null;
  function lockScroll(v) { if (lenis) v ? lenis.stop() : lenis.start(); document.documentElement.style.overflow = v ? 'hidden' : ''; }

  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }

  /* ---------------- events ---------------- */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); e.stopPropagation(); addToCart(add.dataset.add, 1, add); return; }
    const q = e.target.closest('[data-q]');
    if (q) { const id = q.dataset.q; setQty(id, (cart[id] || 0) + +q.dataset.d); return; }
    if (e.target.closest('[data-close]')) { closeModal(); openDrawer(false); return; }
    const pill = e.target.closest('.cat-pill');
    if (pill) { e.preventDefault(); goTo($('#c-' + pill.dataset.cat), -150); return; }
    const card = e.target.closest('[data-id]');
    if (card && !e.target.closest('a')) { openModal(card.dataset.id); return; }
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) { const tg = $(a.getAttribute('href')); if (tg) { e.preventDefault(); document.body.classList.remove('menu-open'); goTo(tg, 0); } }
  });
  function goTo(el, offset) { if (!el) return; if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 }); else el.scrollIntoView({ behavior: 'smooth' }); }
  $('#cartFab').addEventListener('click', () => openDrawer(true));
  $('#sendOrder').addEventListener('click', sendOrder);
  $('#mMinus').addEventListener('click', () => { mQty = Math.max(1, mQty - 1); updM(); });
  $('#mPlus').addEventListener('click', () => { mQty++; updM(); });
  $('#mAdd').addEventListener('click', () => { addToCart(mItem.id, mQty, $('#mAdd')); closeModal(); });
  $$('input[name="mode"]').forEach(r => r.addEventListener('change', () => { $('#cAddr').hidden = $('input[name="mode"]:checked').value !== 'delivery'; }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); openDrawer(false); } });
  $('#navBurger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar'; store.set('wst-lang', lang);
    applyLang(); renderAll(); bindMenuSpy(); bindSweet(); bindFizz(); bindTilt(); bindFit();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
    sand && sand.size();
  });

  // search
  $('#menuSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    let any = false;
    $$('.mcat').forEach(sec => {
      let n = 0;
      $$('.card', sec).forEach(c => { const ok = !q || c.dataset.search.includes(q); c.hidden = !ok; if (ok) n++; });
      sec.hidden = n === 0; if (n) any = true;
    });
    $('#menuEmpty').hidden = any;
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  /* ---------------- motion ---------------- */
  let hero, sand;
  function bindHero() {
    hero = makeScene($('#burgerCanvas'), burgerFrames, { w: 800, h: 640, layout: heroLayout, blend: true });
    const labels = $$('.hero__labels li'), cv = $('#burgerCanvas');
    const A = $('.hero__copy--a'), C = $('.hero__copy--c'), word = $('.hero__word'), hint = $('#scrollHint'), bar = $('#heroBar');
    const fade = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
    const render = p => {
      hero.draw(Math.min(1, fade(p, 0.04, 0.8)));
      const oa = 1 - fade(p, 0.08, 0.2);
      A.style.opacity = oa; A.style.visibility = oa < 0.02 ? 'hidden' : 'visible';
      A.style.translate = `0 ${-fade(p, 0.08, 0.2) * 40}px`;
      labels.forEach(li => {
        const at = +li.dataset.at; const o = fade(p, at, at + 0.06) * (1 - fade(p, 0.7, 0.78));
        li.style.opacity = o; li.style.transform = `translateX(${(1 - o) * (li.classList.contains('r') ? 20 : -20)}px)`;
      });
      const sh = innerWidth > 900 ? fade(p, 0.74, 0.88) * innerWidth * 0.13 * (document.documentElement.dir === 'rtl' ? -1 : 1) : 0;
      cv.style.translate = `${sh}px 0`;
      const oc = fade(p, 0.8, 0.9);
      C.style.opacity = oc; C.style.visibility = oc < 0.02 ? 'hidden' : 'visible'; C.style.translate = `0 ${(1 - oc) * 30}px`;
      word.style.transform = `translate(-50%,-50%) scale(${1 + p * 0.25})`; word.style.opacity = 1 - fade(p, 0.75, 0.95) * 0.6;
      hint.style.opacity = 1 - fade(p, 0, 0.05);
      bar.style.transform = `scaleX(${p})`;
    };
    render(0);
    if (window.ScrollTrigger) ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => render(s.progress) });
    else window.addEventListener('scroll', () => { const r = $('#hero').getBoundingClientRect(); render(Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)))); });
  }
  function bindSand() {
    sand = makeScene($('#sandCanvas'), sandFrames, { w: 1120, h: 640, layout: sandLayout, blend: false });
    const steps = $$('.sand__steps li'), bar = $('#sandBar');
    const render = p => {
      const q = Math.min(1, Math.max(0, (p - 0.04) / 0.82));
      sand.draw(q);
      steps.forEach(li => li.classList.toggle('on', q >= +li.dataset.at));
      bar.style.transform = `scaleX(${p})`;
    };
    render(0);
    ScrollTrigger.create({ trigger: '#sandwich', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => render(s.progress) });
    // lazy-load rest of sandwich frames already in flight
  }

  let spyTriggers = [];
  function bindMenuSpy() {
    if (!window.ScrollTrigger) return;
    spyTriggers.forEach(s => s.kill()); spyTriggers = [];
    const cats = $('#menuCats');
    $$('.mcat').forEach(sec => {
      spyTriggers.push(ScrollTrigger.create({
        trigger: sec, start: 'top 60%', end: 'bottom 60%',
        onToggle: s => {
          if (!s.isActive) return;
          $$('.cat-pill').forEach(p => p.classList.toggle('on', p.dataset.cat === sec.dataset.cat));
          const pill = $(`.cat-pill[data-cat="${sec.dataset.cat}"]`);
          if (pill) { const r = pill.offsetLeft - cats.clientWidth / 2 + pill.clientWidth / 2; cats.scrollTo({ left: r, behavior: 'smooth' }); }
        }
      }));
    });
    ScrollTrigger.batch('.mcat .card', {
      start: 'top 92%', once: true,
      onEnter: els => gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out', stagger: .06, overwrite: true })
    });
  }

  let sweetTween = null;
  function bindSweet() {
    if (!window.ScrollTrigger) return;
    if (sweetTween) { sweetTween.scrollTrigger && sweetTween.scrollTrigger.kill(); sweetTween.kill(); }
    const track = $('#sweetTrack');
    gsap.set(track, { x: 0 });
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const dir = document.documentElement.dir === 'rtl' ? 1 : -1;
    sweetTween = gsap.to(track, {
      x: () => dir * dist(), ease: 'none',
      scrollTrigger: { trigger: '#sweet', start: 'top top', end: () => '+=' + dist(), pin: '.sweet__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    $$('.shake img', track).forEach((im, k) => {
      gsap.fromTo(im, { y: 60 * (k % 2 ? 1 : -1), rotate: k % 2 ? 8 : -8 }, {
        y: -40 * (k % 2 ? 1 : -1), rotate: k % 2 ? -4 : 4, ease: 'none',
        scrollTrigger: { trigger: im.closest('.shake'), containerAnimation: sweetTween, start: dir > 0 ? 'right left' : 'left right', end: dir > 0 ? 'left right' : 'right left', scrub: true, horizontal: true }
      });
    });
  }

  function bindFizz() {
    if (!window.gsap) return;
    $$('#fizzStage img').forEach((im, k) => {
      const sp = +im.dataset.speed;
      gsap.to(im, { y: sp * -120, ease: 'none', scrollTrigger: { trigger: '#fizz', start: 'top bottom', end: 'bottom top', scrub: true } });
      if (!reduce) gsap.to(im, { rotate: `+=${k % 2 ? 6 : -6}`, x: k % 2 ? 10 : -10, duration: 2.6 + k * .4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });
  }

  function bindFit() {
    if (!window.ScrollTrigger) return;
    ScrollTrigger.create({ trigger: '#fitGrid', start: 'top 80%', once: true, onEnter: () => $$('#fitGrid .macro i').forEach(b => b.style.setProperty('--v', b.dataset.v)) });
  }

  function bindTilt() {
    if (!matchMedia('(hover:hover)').matches) return;
    $$('.bleu').forEach(c => {
      const img = $('.bleu__img img', c);
      c.onmousemove = e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotateY: x * 10, rotateX: -y * 10, duration: .6, ease: 'power3.out', transformPerspective: 900 });
        gsap.to(img, { x: x * 24, y: y * 16, rotate: x * 6, duration: .6, ease: 'power3.out' });
      };
      c.onmouseleave = () => { gsap.to(c, { rotateY: 0, rotateX: 0, duration: .8 }); gsap.to(img, { x: 0, y: 0, rotate: 0, duration: .8 }); };
    });
    if (!reduce) $$('.bleu__img img').forEach((im, k) => gsap.to(im, { yPercent: -5, duration: 2.2 + k * .3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  }

  function bindGeneral() {
    // reveal
    $$('.reveal').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    // word reveal
    $$('.reveal-words').forEach(el => {
      const txt = el.textContent; el.innerHTML = txt.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' ');
      gsap.from($$('.w>span', el), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    // count up
    $$('[data-count]').forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
    // section heads
    $$('.sec-head .title, .fizz__copy .title, .visit .title').forEach(el => gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    // new cards
    gsap.from('.bleu', { y: 120, opacity: 0, rotate: (i) => (i - 1) * 4, duration: 1.2, ease: 'power4.out', stagger: .12, scrollTrigger: { trigger: '#newGrid', start: 'top 80%' } });
    gsap.from('.offer', { y: 80, opacity: 0, duration: 1, ease: 'power3.out', stagger: .07, scrollTrigger: { trigger: '#offersGrid', start: 'top 82%' } });
    gsap.from('.fitc', { y: 80, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, scrollTrigger: { trigger: '#fitGrid', start: 'top 82%' } });
    // footer word
    gsap.from('.foot__word', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: '.foot', start: 'top 85%' } });
    // band skew on velocity
    const band = $('.band__track');
    ScrollTrigger.create({ onUpdate: s => { const v = gsap.utils.clamp(-12, 12, s.getVelocity() / 300); gsap.to(band, { skewX: v, duration: .4, overwrite: true }); } });
  }

  function bindNav() {
    const nav = $('#nav'); let lastY = 0;
    const links = $$('.nav__links a');
    const onScroll = y => {
      nav.classList.toggle('scrolled', y > 40);
      const down = y > lastY && y > 300;
      nav.classList.toggle('hide', down && !document.body.classList.contains('menu-open'));
      document.body.classList.toggle('nav-visible', !down);
      lastY = y;
    };
    if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else window.addEventListener('scroll', () => onScroll(scrollY));
    links.forEach(a => {
      const sec = $(a.getAttribute('href')); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('on', s.isActive) });
    });
  }

  function bindCursor() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const c = $('#cursor'); const xTo = gsap.quickTo(c, 'x', { duration: .25 }), yTo = gsap.quickTo(c, 'y', { duration: .25 });
    addEventListener('mousemove', e => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener('mouseover', e => c.classList.toggle('big', !!e.target.closest('a,button,.card,.bleu,.shake,.offer,.fitc,.fizz__row')));
    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4 }); });
      b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    $('#year').textContent = new Date().getFullYear();
    applyLang();
    await loadLogo();
    renderAll();
    const fill = $('.loader__fill'), pct = $('#loadPct');
    await preload(p => { const v = Math.round(p * 100); fill.style.setProperty('--p', v + '%'); pct.textContent = v; });
    fill.style.setProperty('--p', '100%'); pct.textContent = 100;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      if (window.Lenis && !reduce) {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      }
      bindHero(); bindSand(); bindMenuSpy(); bindSweet(); bindFizz(); bindFit(); bindTilt(); bindGeneral(); bindNav(); bindCursor();
    } else {
      $$('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
      bindHero();
    }
    setTimeout(() => {
      $('#loader').classList.add('done'); document.body.classList.remove('is-loading');
      if (window.gsap) gsap.from('.hero__copy--a > *', { y: 50, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: .1, delay: .2 });
      window.ScrollTrigger && ScrollTrigger.refresh();
    }, 350);
  }
  boot();
})();
