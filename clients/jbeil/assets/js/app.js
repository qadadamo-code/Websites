/* Jbeil — site logic. Built by Planet. */
(() => {
  'use strict';

  // ===== Config: change the WhatsApp number here =====
  const CONFIG = {
    whatsapp: '201203101104', // TODO: replace with Jbeil's own WhatsApp number (international format, no +)
  };

  const MENU = window.JBEIL_MENU || [];
  const ITEMS = {};
  MENU.forEach(c => c.items.forEach(i => { ITEMS[i.id] = Object.assign({ cat: c.key }, i); }));

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const fmt = n => Number(n).toLocaleString('en-US');

  // ===== i18n =====
  const T = {
    'nav.story': ['حكايتنا', 'Our Story'], 'nav.menu': ['المنيو', 'Menu'], 'nav.sig': ['وجبة جبيل', 'Jbeil Meal'],
    'nav.reserve': ['احجز طاولة', 'Book a Table'], 'nav.visit': ['زورنا', 'Visit'],
    'hero.kicker': ['مطبخ لبناني على الفحم · مساكن شيراتون', 'Lebanese charcoal kitchen · Masaken Sheraton'],
    'hero.t1': ['طعم جبيل', 'Taste of Jbeil,'], 'hero.t2': ['على فحم القاهرة', 'on Cairo charcoal'],
    'hero.sub': ['من المدينة اللي علّمت العالم الحروف… جبنالك أبجدية الأكل اللبناني: شاورما على الفحم، طاووق متبّل، كفتة وحمص بزيت زيتون.',
      'From the city that gave the world its first alphabet, we bring you the ABC of Lebanese food: charcoal shawarma, marinated tawouk, kofta and hummus in golden olive oil.'],
    'hero.order': ['اطلب دلوقتي', 'Order now'], 'hero.reserve': ['احجز طاولة', 'Book a table'],
    'hero.rating': ['+1000 تقييم على طلبات', '1000+ ratings on Talabat'], 'hero.scroll': ['انزل', 'Scroll'],
    'story.e1': ['01 — المدينة', '01 — The City'],
    'story.h1': ['جبيل… أقدم مدينة عايشة، ومنها خرجت أول أبجدية للعالم.', 'Jbeil, the oldest living city, where the world’s first alphabet was born.'],
    'story.p1': ['الفينيقيين في جبيل كتبوا أول حروف. إحنا كتبنا بيها المنيو: كل قسم عندنا ليه حرف، وكل طبق ليه حكاية.', 'The Phoenicians of Jbeil wrote the first letters. We used them to write our menu: every section has a letter, every dish has a story.'],
    'story.e2': ['02 — الفحم', '02 — The Fire'],
    'story.h2': ['فحم حقيقي، تتبيلة لبنانية، وخبز طالع سخن.', 'Real charcoal, Lebanese marinades, bread straight from the heat.'],
    'story.p2': ['المسحّب والطاووق والكفتة بيتشووا قدامك على الفحم، والثومية بتتعمل كل يوم بإيدينا.', 'Msahhab, tawouk and kofta are grilled over live coals, and our toum is whipped by hand every single day.'],
    'story.e3': ['03 — القاهرة', '03 — Cairo'],
    'story.h3': ['من جبيل لمساكن شيراتون: نفس الطعم، على بعد خطوة منك.', 'From Jbeil to Masaken Sheraton: the same taste, one step away.'],
    'story.p3': ['تيك أواي، دليفري، أو قعدة على الترابيزة مع الصحاب. اختار وإحنا علينا الباقي.', 'Takeaway, delivery, or a long table with friends. You choose, we handle the rest.'],
    'story.cta': ['افتح المنيو', 'Open the menu'],
    'sig.e': ['الطبق اللي على اسمنا', 'The dish that carries our name'], 'sig.h': ['وجبة جبيل', 'Jbeil Meal'],
    'sig.p': ['2 سيخ كفتة، سيخ طاووق، ربع فرخة، رز بسمتي، ثومية، مخلل و2 سمبوسك جبنة. كل اللي بتحبه في طبق واحد.', '2 kofta skewers, a tawouk skewer, quarter chicken, basmati rice, toum, pickles and 2 cheese sambousek. Everything you love on one plate.'],
    'sig.l1': ['كفتة على الفحم', 'Charcoal kofta'], 'sig.l2': ['شيش طاووق', 'Shish tawouk'], 'sig.l3': ['ربع فرخة', 'Quarter chicken'], 'sig.l4': ['سمبوسك جبنة', 'Cheese sambousek'],
    'cur': ['ج.م', 'EGP'], 'add': ['أضف للطلب', 'Add to order'], 'add.s': ['أضف', 'Add'],
    'menu.e': ['أبجدية جبيل', 'The Jbeil Alphabet'], 'menu.h': ['المنيو', 'The Menu'],
    'menu.p': ['7 أقسام، كل قسم ليه حرف فينيقي. الأسعار بالجنيه المصري.', '7 sections, each with its own Phoenician letter. Prices in Egyptian pounds.'],
    'menu.search': ['دوّر على صنف… شاورما، حمص، كفتة', 'Search… shawarma, hummus, kofta'],
    'menu.none': ['مفيش نتايج. جرّب كلمة تانية.', 'No matches. Try another word.'],
    'menu.items': ['صنف', 'items'], 'menu.sig': ['الأكثر طلبًا', 'Signature'],
    'res.e': ['ترابيزتك جاهزة', 'Your table is waiting'], 'res.h': ['احجز طاولة', 'Book a table'],
    'res.p': ['املأ البيانات وهنأكد معاك الحجز على واتساب في دقايق.', 'Fill in the details and we’ll confirm on WhatsApp within minutes.'],
    'res.send': ['ابعت الحجز على واتساب', 'Send booking on WhatsApp'],
    'f.name': ['الاسم', 'Name'], 'f.phone': ['رقم الموبايل', 'Mobile number'], 'f.date': ['اليوم', 'Date'], 'f.time': ['الساعة', 'Time'],
    'f.guests': ['عدد الأفراد', 'Guests'], 'f.notes': ['ملاحظات', 'Notes'],
    'f.o1': ['قعدة عادية', 'Casual'], 'f.o2': ['عيد ميلاد', 'Birthday'], 'f.o3': ['عزومة عيلة', 'Family'], 'f.o4': ['شغل', 'Business'],
    'v.e': ['زورنا', 'Visit us'], 'v.h': ['جبيل، مساكن شيراتون', 'Jbeil, Masaken Sheraton'],
    'v.addr': ['شارع عبد الحميد بدوي، مساكن شيراتون، مصر الجديدة، القاهرة', 'Abdel Hamid Badawi St., Masaken Sheraton, Heliopolis, Cairo'],
    'v.t1': ['تيك أواي', 'Takeaway'], 'v.t2': ['دليفري', 'Delivery'], 'v.t3': ['قعدة في المطعم', 'Dine-in'],
    'v.wa': ['كلّمنا واتساب', 'WhatsApp us'], 'v.map': ['افتح الخريطة', 'Open map'], 'v.talabat': ['اطلب من طلبات', 'Order on Talabat'],
    'foot.p': ['طعم لبنان الأصيل في مساكن شيراتون، القاهرة.', 'Authentic Lebanese flavors in Masaken Sheraton, Cairo.'],
    'fab': ['طلبك', 'Your order'],
    'cart.h': ['طلبك', 'Your order'], 'cart.empty': ['الطلب لسه فاضي. اختار من المنيو.', 'Your order is empty. Pick something from the menu.'],
    'cart.delivery': ['دليفري', 'Delivery'], 'cart.pickup': ['تيك أواي', 'Takeaway'], 'cart.dinein': ['في المطعم', 'Dine-in'],
    'cart.addr': ['العنوان بالتفصيل', 'Full address'], 'cart.total': ['الإجمالي', 'Total'],
    'cart.hint': ['الأسعار من غير خدمة التوصيل. هنأكد معاك الطلب على واتساب.', 'Prices exclude delivery. We’ll confirm your order on WhatsApp.'],
    'cart.send': ['ابعت الطلب على واتساب', 'Send order on WhatsApp'],
    'toast.added': ['اتضاف للطلب', 'Added to your order'], 'toast.fill': ['كمّل البيانات المطلوبة', 'Please complete the required fields'],
    'toast.empty': ['اختار أصناف الأول', 'Add some items first'],
    'scene.live': ['على الفحم دلوقتي', 'On the coals now'],
    'sc.grill.h': ['كل سيخ بيتركب قدامك… ويطلع على الترابيزة سخن.', 'Every skewer, built in front of you and served hot.'],
    'sc.grill.s1': ['الأسياخ', 'Skewers'], 'sc.grill.s2': ['الخضار المشوية', 'Charred veg'], 'sc.grill.s3': ['جاهز', 'Ready'],
    'sc.sand.h': ['ساندوتش بيتلف في ثانية', 'Wrapped in a second'],
    'sc.sand.p': ['خبز لبناني رقيق، حشوة على الفحم، وثومية جبيل. اسحب وشوفه بيتجمع.', 'Thin Lebanese bread, charcoal fillings and Jbeil toum. Scroll and watch it come together.'],
    'sc.cold.h': ['حمص بيتشكّل بالمعلقة، وزيت زيتون بيلمع.', 'Hummus swirled by spoon, finished with shining olive oil.'],
    'sc.cold.s1': ['الحمص', 'Hummus'], 'sc.cold.s2': ['زيت الزيتون', 'Olive oil'], 'sc.cold.s3': ['التقديم', 'Served'],
    'sc.hot.h': ['مقبلات طالعة من الزيت مقرمشة', 'Hot mezze, straight from the fryer'],
    'sc.hot.p': ['كبة، سمبوسك لحمة وجبنة، وورق عنب. قطعة قطعة بتتجمع في طبق واحد.', 'Kebbe, meat and cheese sambousek and vine leaves, piece by piece on one plate.'],
    'sc.sauce.h': ['الثومية سر جبيل', 'Toum is the Jbeil secret'],
    'sc.sauce.p': ['ثومية، ثوم حار، طحينة، دبس رمان وسيراتشا. ضيف اللي يكمل طبقك.', 'Toum, spicy garlic, tahini, pomegranate molasses and sriracha. Add what completes your plate.']
  };
  let lang = (new URLSearchParams(location.search).get('lang') || store.get('jb_lang', 'ar')) === 'en' ? 'en' : 'ar';
  const t = k => (T[k] ? T[k][lang === 'en' ? 1 : 0] : k);

  function applyLang() {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === 'en' ? 'ltr' : 'rtl';
    $$('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (el.classList.contains('split')) { el.textContent = v; splitEl(el); } else el.textContent = v;
    });
    $$('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
    $('#langBtn span').textContent = lang === 'en' ? 'ع' : 'EN';
    document.title = lang === 'en' ? 'Jbeil | Lebanese Restaurant in Masaken Sheraton, Cairo' : 'جُبيل | Jbeil — مطعم لبناني في مساكن شيراتون';
    renderMarquee();
  }

  function splitEl(el) {
    const txt = el.textContent;
    el.innerHTML = '';
    // Arabic letters must stay joined, so split by word there; Latin by word too for clean wraps.
    txt.split(' ').forEach((w, i, a) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w;
      el.appendChild(s);
      if (i < a.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }

  // ===== Marquee =====
  function renderMarquee() {
    const words = lang === 'en'
      ? ['Shawarma', 'Shish Tawouk', 'Kofta', 'Hummus', 'Tabbouleh', 'Kebbe', 'Sambousek', 'Toum', 'Fatteh', 'Msahhab']
      : ['شاورما', 'شيش طاووق', 'كفتة', 'حمص', 'تبولة', 'كبة', 'سمبوسك', 'ثومية', 'فتة', 'مسحّب'];
    const row = words.map(w => `<span>${w}</span>`).join('');
    $('#marquee').innerHTML = row + row + row + row;
  }

  // ===== Menu render =====
  const SCENES = {
    grill: { type: 'seq', dir: 'assets/seq/grill/', frames: 61, h: 'sc.grill.h', steps: ['sc.grill.s1', 'sc.grill.s2', 'sc.grill.s3'] },
    sandwich: { type: 'strips', img: 'assets/img/m/516778804.webp', h: 'sc.sand.h', p: 'sc.sand.p' },
    cold: { type: 'seq', dir: 'assets/seq/hummus/', frames: 61, h: 'sc.cold.h', steps: ['sc.cold.s1', 'sc.cold.s2', 'sc.cold.s3'] },
    hot: { type: 'shatter', img: 'assets/img/m/615402011.webp', h: 'sc.hot.h', p: 'sc.hot.p' },
    sauces: { type: 'orbit', imgs: [721414532, 2986486874, 2986502823, 516778812, 516778825, 516778822], h: 'sc.sauce.h', p: 'sc.sauce.p' }
  };

  function sceneHTML(key) {
    const s = SCENES[key]; if (!s) return '';
    if (s.type === 'seq') return `
      <div class="scene scene--seq" data-scene="seq" data-dir="${s.dir}" data-frames="${s.frames}">
        <canvas></canvas><div class="scene__shade"></div>
        <div class="scene__tag"><i></i><span data-i18n="scene.live">${t('scene.live')}</span></div>
        <div class="scene__copy"><h4 data-i18n="${s.h}">${t(s.h)}</h4>
          <div class="scene__steps">${s.steps.map(k => `<span data-i18n="${k}">${t(k)}</span>`).join('')}</div></div>
      </div>`;
    if (s.type === 'strips') return `
      <div class="scene scene--strips" data-scene="strips">
        <div class="strips">${Array.from({ length: 9 }, (_, i) => `<i style="background-image:url(${s.img});background-size:900% 100%;background-position:${(i / 8) * 100}% 50%"></i>`).join('')}</div>
        <div class="scene__copy"><h4 data-i18n="${s.h}">${t(s.h)}</h4><p data-i18n="${s.p}">${t(s.p)}</p></div>
      </div>`;
    if (s.type === 'shatter') {
      const C = 8, R = 6; let tiles = '';
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) tiles += `<i style="background-image:url(${s.img});background-position:${(c / (C - 1)) * 100}% ${(r / (R - 1)) * 100}%"></i>`;
      return `<div class="scene scene--shatter" data-scene="shatter"><div class="shatter">${tiles}</div>
        <div class="scene__copy"><h4 data-i18n="${s.h}">${t(s.h)}</h4><p data-i18n="${s.p}">${t(s.p)}</p></div></div>`;
    }
    if (s.type === 'orbit') return `
      <div class="scene scene--orbit" data-scene="orbit">
        <div class="orbit"><div class="orbit__ring"></div><div class="orbit__center">𐤄</div>
          ${s.imgs.map(id => `<img src="assets/img/m/${id}.webp" alt="" loading="lazy">`).join('')}</div>
        <div class="scene__copy"><h4 data-i18n="${s.h}">${t(s.h)}</h4><p data-i18n="${s.p}">${t(s.p)}</p></div>
      </div>`;
    return '';
  }

  function cardHTML(i) {
    const name = lang === 'en' ? i.en : i.ar, alt = lang === 'en' ? i.ar : i.en;
    const desc = lang === 'en' ? i.den : i.dar;
    const img = i.img ? `<img src="${i.img}" alt="${name}" loading="lazy" decoding="async">` : `<div class="card__ph">${(MENU.find(c => c.key === i.cat) || {}).glyph || '𐤀'}</div>`;
    return `<article class="card" data-id="${i.id}" data-q="${(i.ar + ' ' + i.en + ' ' + i.dar + ' ' + i.den).toLowerCase()}">
      <div class="card__img">${img}${i.sig ? `<span class="card__badge">${t('menu.sig')}</span>` : ''}</div>
      <div class="card__body"><h4 class="card__name">${name}</h4><div class="card__alt">${alt}</div>
        <p class="card__desc">${desc}</p>
        <div class="card__foot"><span class="card__price">${fmt(i.price)} <small>${t('cur')}</small></span><span class="card__ctl" data-ctl="${i.id}"></span></div></div>
    </article>`;
  }

  function renderMenu() {
    $('#cats').innerHTML = MENU.map(c => `<a href="#cat-${c.key}" data-cat="${c.key}"><span class="g">${c.glyph}</span><span>${lang === 'en' ? c.en : c.ar}</span></a>`).join('');
    $('#menuBody').innerHTML = MENU.map(c => `
      <section class="cat" id="cat-${c.key}" data-cat="${c.key}">
        <div class="cat__head"><div class="cat__title"><span class="cat__glyph">${c.glyph}</span>
          <h3><span class="cn">${lang === 'en' ? c.en : c.ar}</span><small class="ca">${lang === 'en' ? c.ar : c.en}</small></h3></div>
          <span class="cat__count">${c.items.length} ${t('menu.items')}</span></div>
        ${sceneHTML(c.key)}
        <div class="grid">${c.items.map(cardHTML).join('')}</div>
      </section>`).join('');
    renderControls();
  }

  function rerenderMenuText() {
    $$('#cats a').forEach(a => { const c = MENU.find(x => x.key === a.dataset.cat); a.lastElementChild.textContent = lang === 'en' ? c.en : c.ar; });
    $$('.cat').forEach(sec => {
      const c = MENU.find(x => x.key === sec.dataset.cat);
      $('.cn', sec).textContent = lang === 'en' ? c.en : c.ar;
      $('.ca', sec).textContent = lang === 'en' ? c.ar : c.en;
      $('.cat__count', sec).textContent = `${c.items.length} ${t('menu.items')}`;
      $('.grid', sec).innerHTML = c.items.map(cardHTML).join('');
    });
    renderControls();
    filterMenu();
  }

  // ===== Cart =====
  let cart = store.get('jb_cart', {});
  Object.keys(cart).forEach(id => { if (!ITEMS[id]) delete cart[id]; });
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((a, [id, q]) => a + ITEMS[id].price * q, 0);

  function setQty(id, q, fromEl) {
    q = Math.max(0, Math.min(99, q));
    const prev = cart[id] || 0;
    if (q) cart[id] = q; else delete cart[id];
    store.set('jb_cart', cart);
    renderControls(); renderCart();
    if (q > prev) {
      toast(t('toast.added'));
      const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
      if (fromEl) flyToCart(fromEl);
    }
  }

  function renderControls() {
    $$('[data-ctl]').forEach(el => {
      const id = el.dataset.ctl, q = cart[id] || 0;
      el.innerHTML = q
        ? `<span class="qty"><button type="button" data-dec="${id}" aria-label="-">−</button><output>${q}</output><button type="button" data-inc="${id}" aria-label="+">+</button></span>`
        : `<button class="add" type="button" data-inc="${id}">+ ${t('add.s')}</button>`;
    });
  }

  function renderCart() {
    const n = cartCount(), total = cartTotal();
    const cc = $('#cartCount'); cc.textContent = n; cc.classList.toggle('has', n > 0);
    $('#fabTotal').textContent = fmt(total);
    $('#fab').classList.toggle('show', n > 0 && !$('#drawer').classList.contains('open'));
    $('#cartTotal').textContent = fmt(total);
    $('#cartEmpty').style.display = n ? 'none' : '';
    $('#checkout').style.display = n ? '' : 'none';
    $('#cartList').innerHTML = Object.entries(cart).map(([id, q]) => {
      const i = ITEMS[id]; const name = lang === 'en' ? i.en : i.ar;
      return `<li>${i.img ? `<img src="${i.img}" alt="">` : `<span class="ph">𐤀</span>`}
        <div><div class="n">${name}</div><div class="p">${fmt(i.price * q)} ${t('cur')}</div></div>
        <span class="qty"><button type="button" data-dec="${id}">−</button><output>${q}</output><button type="button" data-inc="${id}">+</button></span></li>`;
    }).join('');
  }

  function flyToCart(el) {
    const card = el.closest('.card'); const img = card && $('.card__img img', card);
    if (!img || reduce) return;
    const a = img.getBoundingClientRect(), b = $('#cartBtn').getBoundingClientRect();
    const f = img.cloneNode(); Object.assign(f.style, { position: 'fixed', zIndex: 99, left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', borderRadius: '16px', objectFit: 'cover', pointerEvents: 'none', transition: 'all .8s cubic-bezier(.5,-0.2,.3,1)' });
    document.body.appendChild(f);
    requestAnimationFrame(() => Object.assign(f.style, { left: b.left + 'px', top: b.top + 'px', width: '40px', height: '40px', borderRadius: '50%', opacity: '.3' }));
    setTimeout(() => f.remove(), 850);
  }

  let orderType = 'delivery';
  function openDrawer(v) {
    const d = $('#drawer'); d.classList.toggle('open', v); d.setAttribute('aria-hidden', !v);
    lockScroll(v); renderCart();
  }

  function wa(text) { window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener'); }

  function validate(form, names) {
    let ok = true;
    names.forEach(n => { const el = form.elements[n]; const bad = !el.value.trim(); el.classList.toggle('err', bad); if (bad) ok = false; });
    if (!ok) toast(t('toast.fill'));
    return ok;
  }

  function sendOrder() {
    if (!cartCount()) return toast(t('toast.empty'));
    const f = $('#checkout');
    const req = ['name', 'phone']; if (orderType === 'delivery') req.push('address');
    if (!validate(f, req)) return;
    const en = lang === 'en';
    const typeLabel = { delivery: en ? 'Delivery' : 'دليفري', pickup: en ? 'Takeaway' : 'تيك أواي', dinein: en ? 'Dine-in' : 'في المطعم' }[orderType];
    const lines = Object.entries(cart).map(([id, q]) => { const i = ITEMS[id]; return `• ${q} × ${en ? i.en : i.ar} = ${fmt(i.price * q)} EGP`; });
    const msg = [
      en ? 'New order from the Jbeil website' : 'طلب جديد من موقع جبيل', '',
      ...lines, '',
      `${en ? 'Total' : 'الإجمالي'}: ${fmt(cartTotal())} EGP`,
      `${en ? 'Type' : 'نوع الطلب'}: ${typeLabel}`,
      `${en ? 'Name' : 'الاسم'}: ${f.elements.name.value.trim()}`,
      `${en ? 'Phone' : 'الموبايل'}: ${f.elements.phone.value.trim()}`,
      orderType === 'delivery' ? `${en ? 'Address' : 'العنوان'}: ${f.elements.address.value.trim()}` : '',
      f.elements.notes.value.trim() ? `${en ? 'Notes' : 'ملاحظات'}: ${f.elements.notes.value.trim()}` : ''
    ].filter((l, i) => l !== '' || i === 1 || i === lines.length + 2).join('\n').trim();
    wa(msg);
  }

  // ===== Reservation =====
  let guests = 2, occasion = 'normal';
  function initReserve() {
    const f = $('#resForm');
    const today = new Date(); const iso = d => d.toISOString().slice(0, 10);
    f.elements.date.min = iso(today); f.elements.date.value = iso(today);
    $$('[data-g]', f).forEach(b => b.addEventListener('click', () => { guests = Math.max(1, Math.min(40, guests + +b.dataset.g)); $('#guests').textContent = guests; }));
    $$('#occasion .chip').forEach(c => c.addEventListener('click', () => { $$('#occasion .chip').forEach(x => x.classList.remove('is-on')); c.classList.add('is-on'); occasion = c.dataset.v; }));
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(f, ['name', 'phone', 'date', 'time'])) return;
      const en = lang === 'en';
      const occ = $('#occasion .chip.is-on').textContent;
      const msg = [
        en ? 'Table booking request — Jbeil website' : 'طلب حجز طاولة من موقع جبيل', '',
        `${en ? 'Name' : 'الاسم'}: ${f.elements.name.value.trim()}`,
        `${en ? 'Phone' : 'الموبايل'}: ${f.elements.phone.value.trim()}`,
        `${en ? 'Date' : 'اليوم'}: ${f.elements.date.value}`,
        `${en ? 'Time' : 'الساعة'}: ${f.elements.time.value}`,
        `${en ? 'Guests' : 'عدد الأفراد'}: ${guests}`,
        `${en ? 'Occasion' : 'المناسبة'}: ${occ}`,
        f.elements.notes.value.trim() ? `${en ? 'Notes' : 'ملاحظات'}: ${f.elements.notes.value.trim()}` : ''
      ].filter(Boolean).join('\n');
      wa(msg);
    });
  }

  // ===== Search =====
  function filterMenu() {
    const q = ($('#search').value || '').trim().toLowerCase();
    let any = false;
    $$('.cat').forEach(sec => {
      let n = 0;
      $$('.card', sec).forEach(c => { const m = !q || c.dataset.q.includes(q); c.style.display = m ? '' : 'none'; if (m) n++; });
      const sc = $('.scene', sec); if (sc) sc.style.display = q ? 'none' : '';
      sec.style.display = n ? '' : 'none'; if (n) any = true;
    });
    $('#noResult').hidden = any;
    if (hasGsap) ScrollTrigger.refresh();
  }

  // ===== Toast =====
  let tt;
  function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800); }

  // ===== Scroll / Lenis =====
  let lenis = null;
  function lockScroll(v) { if (lenis) v ? lenis.stop() : lenis.start(); document.documentElement.style.overflow = v ? 'hidden' : ''; }
  function goTo(el) { if (!el) return; const off = -(window.innerWidth < 960 ? 120 : 130); if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.3 }); else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + off, behavior: 'smooth' }); }

  // ===== Embers =====
  function embers() {
    const c = $('#embers'); if (!c || reduce) return;
    const x = c.getContext('2d'); let W, H, P = [];
    const rs = () => { const d = Math.min(devicePixelRatio, 2); W = c.width = c.offsetWidth * d; H = c.height = c.offsetHeight * d; };
    rs(); addEventListener('resize', rs);
    const N = innerWidth < 700 ? 34 : 70;
    const mk = () => ({ x: Math.random() * W, y: H + Math.random() * H * .3, r: Math.random() * 2.2 + .6, v: Math.random() * .9 + .4, s: Math.random() * 6.28, a: Math.random() * .6 + .3 });
    for (let i = 0; i < N; i++) { const p = mk(); p.y = Math.random() * H; P.push(p); }
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(c);
    (function loop() {
      if (vis) {
        x.clearRect(0, 0, W, H);
        P.forEach(p => {
          p.y -= p.v * 1.4; p.s += .02; p.x += Math.sin(p.s) * .6;
          if (p.y < -10) Object.assign(p, mk());
          const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, `rgba(255,190,110,${p.a})`); g.addColorStop(1, 'rgba(240,120,40,0)');
          x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, p.r * 4, 0, 6.28); x.fill();
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  // ===== Frame sequence =====
  function seqPlayer(scene) {
    const canvas = $('canvas', scene), ctx = canvas.getContext('2d');
    const dir = scene.dataset.dir, N = +scene.dataset.frames;
    const imgs = new Array(N); let loaded = false, cur = 0;
    const pad = i => String(i + 1).padStart(3, '0');
    function load() {
      if (loaded) return; loaded = true;
      for (let i = 0; i < N; i++) { const im = new Image(); im.decoding = 'async'; im.src = `${dir}${pad(i)}.webp`; im.onload = () => { if (i === cur || (i === 0 && !imgs[cur])) draw(cur); }; imgs[i] = im; }
    }
    function size() { const d = Math.min(devicePixelRatio, 2); canvas.width = canvas.offsetWidth * d; canvas.height = canvas.offsetHeight * d; draw(cur); }
    function draw(i) {
      cur = i; let im = imgs[i];
      if (!im || !im.complete || !im.naturalWidth) { for (let k = i; k >= 0; k--) { if (imgs[k] && imgs[k].complete && imgs[k].naturalWidth) { im = imgs[k]; break; } } }
      if (!im || !im.naturalWidth) return;
      const W = canvas.width, H = canvas.height, s = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
    }
    new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '120% 0px' }).observe(scene);
    addEventListener('resize', size); size();
    return { draw, N };
  }

  function initScenes() {
    $$('.scene[data-scene=seq]').forEach(sc => {
      const p = seqPlayer(sc); const steps = $$('.scene__steps span', sc);
      const set = pr => { p.draw(Math.min(p.N - 1, Math.round(pr * (p.N - 1)))); steps.forEach((s, i) => s.classList.toggle('on', pr >= i / steps.length - .02)); };
      if (!hasGsap || reduce) { set(1); return; }
      ScrollTrigger.create({ trigger: sc, start: 'center center', end: '+=110%', pin: true, scrub: true, anticipatePin: 1, onUpdate: s => set(s.progress) });
      set(0);
    });
    if (!hasGsap || reduce) return;
    $$('.scene[data-scene=strips]').forEach(sc => {
      const strips = $$('.strips i', sc);
      gsap.fromTo(strips, { yPercent: i => (i % 2 ? 110 : -110), opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: sc, start: 'top 85%', end: 'center 50%', scrub: 1 } });
    });
    $$('.scene[data-scene=shatter]').forEach(sc => {
      const tiles = $$('.shatter i', sc);
      gsap.fromTo(tiles, {
        x: () => gsap.utils.random(-260, 260), y: () => gsap.utils.random(-200, 200), rotation: () => gsap.utils.random(-120, 120), scale: () => gsap.utils.random(.2, .8), opacity: 0
      }, { x: 0, y: 0, rotation: 0, scale: 1.02, opacity: 1, ease: 'power2.out', stagger: { each: .012, from: 'random' }, scrollTrigger: { trigger: sc, start: 'top 85%', end: 'center 45%', scrub: 1 } });
    });
    $$('.scene[data-scene=orbit]').forEach(sc => {
      const imgs = $$('.orbit img', sc), R = () => $('.orbit', sc).offsetWidth / 2;
      const st = { a: 0 };
      const place = () => imgs.forEach((im, i) => { const a = st.a + i / imgs.length * Math.PI * 2; im.style.transform = `translate(${Math.cos(a) * R()}px,${Math.sin(a) * R()}px)`; });
      place();
      gsap.to(st, { a: Math.PI * 2, ease: 'none', onUpdate: place, scrollTrigger: { trigger: sc, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from(imgs, { scale: 0, stagger: .08, ease: 'back.out(2)', scrollTrigger: { trigger: sc, start: 'top 75%' } });
    });
    // cards reveal
    ScrollTrigger.batch('.card', { start: 'top 92%', once: true, onEnter: b => gsap.fromTo(b, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'power3.out', overwrite: true }) });
  }

  // ===== Category sync =====
  function initCats() {
    const links = $$('#cats a');
    links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); goTo($(a.getAttribute('href'))); }));
    const set = key => {
      links.forEach(a => a.classList.toggle('is-on', a.dataset.cat === key));
      const on = links.find(a => a.dataset.cat === key);
      if (on) { const nav = $('#cats'); nav.scrollTo({ left: on.offsetLeft - nav.offsetWidth / 2 + on.offsetWidth / 2, behavior: 'smooth' }); }
    };
    if (hasGsap) $$('.cat').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: s => s.isActive && set(sec.dataset.cat) }));
    set(MENU[0] && MENU[0].key);
  }

  // ===== Main animations =====
  function initMotion() {
    if (!hasGsap || reduce) { $$('[data-reveal]').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); return; }

    // hero intro
    const tl = gsap.timeline({ delay: .1 });
    tl.from('.hero__title .w', { yPercent: 120, rotate: 4, duration: 1.1, ease: 'power4.out', stagger: .08 })
      .to('.hero [data-reveal]', { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out' }, '-=.7')
      .from('.hero__glyphs span', { opacity: 0, scale: .6, duration: 1.6, stagger: .15, ease: 'power2.out' }, 0);
    gsap.to('.hero__media video', { scale: 1.25, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__inner', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
    $$('.hero__glyphs span').forEach((g, i) => gsap.to(g, { y: (i % 2 ? -1 : 1) * 140, rotate: (i % 2 ? 12 : -12), ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));

    // story horizontal
    const track = $('#storyTrack');
    const rtl = () => document.documentElement.dir === 'rtl';
    const dist = () => track.scrollWidth - innerWidth;
    track.style.flexDirection = rtl() ? 'row-reverse' : 'row';
    gsap.fromTo(track, { x: () => (rtl() ? -dist() : 0) }, {
      x: () => (rtl() ? 0 : -dist()), ease: 'none',
      scrollTrigger: { trigger: '.story', pin: '.story__pin', start: 'top top', end: () => '+=' + dist() * 1.1, scrub: 1, invalidateOnRefresh: true, onUpdate: s => gsap.set('#storyBar', { scaleX: s.progress }) }
    });
    const alpha = $('#alpha');
    alpha.innerHTML = '𐤀𐤁𐤂𐤃𐤄𐤅𐤆𐤇𐤈𐤉𐤊𐤋𐤌𐤍𐤎𐤏𐤐𐤑𐤒𐤓𐤔𐤕'.match(/[\s\S]{2}/g).map(g => `<span>${g}</span>`).join('');
    gsap.fromTo('#alpha span', { opacity: 0, y: 40, rotate: -20 }, { opacity: 1, y: 0, rotate: 0, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: '.story', start: 'top 70%', end: 'top top', scrub: 1 } });
    gsap.from('.panel--intro h2, .panel--intro p', { y: 50, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.story', start: 'top 60%' } });
    gsap.fromTo('.panel__photo img', { scale: 1.35 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top top', end: () => '+=' + dist(), scrub: true } });
    gsap.from('.panel__stack img', { scale: 0, rotate: -30, stagger: .1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.story', start: () => 'top+=' + dist() * .7 + ' top', toggleActions: 'play none none reverse' } });

    // signature tiles
    const box = $('#sigTiles'); const src = box.dataset.src; const C = 6;
    box.innerHTML = Array.from({ length: C * C }, (_, k) => { const r = Math.floor(k / C), c = k % C; return `<i style="background-image:url(${src});background-position:${c / (C - 1) * 100}% ${r / (C - 1) * 100}%"></i>`; }).join('');
    const tiles = $$('#sigTiles i');
    const sigTl = gsap.timeline({ scrollTrigger: { trigger: '.sig', start: 'top top', end: '+=120%', pin: '.sig__pin', scrub: 1, anticipatePin: 1 } });
    sigTl.fromTo(tiles, {
      x: () => gsap.utils.random(-400, 400), y: () => gsap.utils.random(-300, 300), z: 0, rotationZ: () => gsap.utils.random(-180, 180), scale: () => gsap.utils.random(.1, .6), opacity: 0
    }, { x: 0, y: 0, rotationZ: 0, scale: 1.02, opacity: 1, ease: 'power3.out', stagger: { each: .015, from: 'edges' }, duration: 1 })
      .fromTo(box, { clipPath: 'circle(160% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)', ease: 'power2.inOut', duration: .35 }, .75)
      .from('#sigParts li', { y: 20, opacity: 0, stagger: .12, duration: .4 }, .3)
      .from('.sig__title', { letterSpacing: '.2em', opacity: 0, duration: .6 }, 0);

    // menu title
    gsap.from('.menu__title .w', { yPercent: 110, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '.menu__title', start: 'top 85%' } });
    // reserve plates
    gsap.from('.plate', { scale: 0, rotate: -90, stagger: .1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.reserve', start: 'top 70%' } });
    gsap.to('.table', { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.reserve', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.reserve__card', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.reserve', start: 'top 70%' } });
    gsap.from('.visit__info > *', { y: 30, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.visit', start: 'top 75%' } });
    gsap.from('.foot__big', { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  // ===== Nav =====
  function initNav() {
    const nav = $('#nav'); let last = 0;
    const onScroll = y => {
      nav.classList.toggle('is-solid', y > 40);
      const hide = y > last && y > 400 && !nav.classList.contains('is-open');
      nav.classList.toggle('is-hidden', hide);
      document.body.classList.toggle('nav-shown', !hide);
      last = y;
    };
    if (lenis) lenis.on('scroll', e => onScroll(e.scroll)); else addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    $('#burger').addEventListener('click', () => nav.classList.toggle('is-open'));
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2 || a.closest('#cats')) return;
      const el = $(id); if (!el) return; e.preventDefault(); nav.classList.remove('is-open');
      if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -10, duration: 1.4 }); else el.scrollIntoView({ behavior: 'smooth' });
    }));
  }

  // ===== Events =====
  function initEvents() {
    document.addEventListener('click', e => {
      const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), add = e.target.closest('[data-add]');
      if (inc) { const id = inc.dataset.inc; setQty(id, (cart[id] || 0) + 1, inc); }
      else if (dec) { const id = dec.dataset.dec; setQty(id, (cart[id] || 0) - 1); }
      else if (add) { const id = add.dataset.add; setQty(id, (cart[id] || 0) + 1); }
      if (e.target.closest('[data-close]')) openDrawer(false);
    });
    $('#cartBtn').addEventListener('click', () => openDrawer(true));
    $('#fab').addEventListener('click', () => openDrawer(true));
    addEventListener('keydown', e => { if (e.key === 'Escape') openDrawer(false); });
    $$('#orderType button').forEach(b => b.addEventListener('click', () => {
      $$('#orderType button').forEach(x => x.classList.remove('is-on')); b.classList.add('is-on'); orderType = b.dataset.v;
      $('#checkout .addr').style.display = orderType === 'delivery' ? '' : 'none';
    }));
    $('#sendOrder').addEventListener('click', sendOrder);
    let st; $('#search').addEventListener('input', () => { clearTimeout(st); st = setTimeout(filterMenu, 160); });
    $('#langBtn').addEventListener('click', () => {
      lang = lang === 'en' ? 'ar' : 'en'; store.set('jb_lang', lang);
      applyLang(); rerenderMenuText(); renderCart();
      const track = $('#storyTrack'); track.style.flexDirection = lang === 'ar' ? 'row-reverse' : 'row';
      if (hasGsap) ScrollTrigger.refresh();
    });
    $('#waLink').href = `https://wa.me/${CONFIG.whatsapp}`;
  }

  // ===== Loader =====
  function loader(done) {
    const L = $('#loader'), g = $('#loaderGlyphs');
    g.innerHTML = ['𐤂', '𐤁', '𐤉', '𐤋'].map(x => `<span>${x}</span>`).join('');
    const bar = $('#loadBar');
    const critical = ['assets/video/hero.jpg', 'assets/seq/grill/001.webp', 'assets/img/m/516778818.webp'];
    let n = 0; const tick = () => { n++; bar.style.width = (n / critical.length * 100) + '%'; };
    const ps = critical.map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => { tick(); r(); }; i.src = s; }));
    const fontReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const minT = new Promise(r => setTimeout(r, reduce ? 0 : 1500));
    if (hasGsap && !reduce) {
      gsap.to('#loaderGlyphs span', { opacity: 1, y: 0, stagger: .12, duration: .5, ease: 'power3.out' });
      gsap.to('#loaderGlyphs span', { opacity: 0, y: -30, stagger: .08, duration: .4, delay: 1, ease: 'power2.in' });
      gsap.to('.loader__logo', { opacity: 1, scale: 1, duration: .7, delay: 1.25, ease: 'power3.out' });
    }
    Promise.race([Promise.all([...ps, fontReady, minT]), new Promise(r => setTimeout(r, 4500))]).then(() => {
      setTimeout(() => { L.classList.add('is-done'); document.body.classList.remove('is-loading'); done(); setTimeout(() => L.remove(), 1100); }, reduce ? 0 : 450);
    });
  }

  // ===== Boot =====
  applyLang();
  renderMenu();
  renderCart();
  initReserve();
  initEvents();
  if (hasGsap && window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tm => lenis.raf(tm * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if (reduce) document.documentElement.classList.add('reduce');
  initNav();
  embers();
  loader(() => {
    initMotion();
    initScenes();
    initCats();
    const v = $('#heroVideo'); if (v) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 300);
    if (location.hash && $(location.hash)) setTimeout(() => goTo($(location.hash)), 500);
  });
})();
