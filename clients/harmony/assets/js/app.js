/* محطة الانسجام | Harmony Station — site logic (AR/EN, train motion, board menu, ticket cart → WhatsApp) */
(function () {
  'use strict';
  const CONFIG = { wa: '201203101104', phone: '+201203101104' };

  /* ---------------- menu data (from the client's printed menu) ---------------- */
  const CATS = [
    { id: 'box', ar: 'علب الانسجام', en: 'Harmony Boxes', img: 'box' },
    { id: 'mix', ar: 'الميكسات', en: 'Mixes', img: 'mix' },
    { id: 'tagine', ar: 'الطواجن', en: 'Tagines', img: 'tagine' },
    { id: 'hawawshi', ar: 'الحواوشي', en: 'Hawawshi', img: 'hawawshi' }
  ];
  // [id, cat, ar, en, price, mozzarellaPrice?]
  const MENU = [
    ['b1', 'box', 'علبة إنسجام صغيرة', 'Harmony Box, Small', 20],
    ['b2', 'box', 'علبة إنسجام سوبر', 'Harmony Box, Super', 30],
    ['b3', 'box', 'علبة إنسجام الدبابة', 'Harmony Box, "The Tank"', 50],
    ['m1', 'mix', 'ميكس كبدة إنسجام', 'Liver Harmony Mix', 30],
    ['m2', 'mix', 'ميكس سجق إنسجام', 'Sausage Harmony Mix', 30],
    ['m3', 'mix', 'ميكس شاورما إنسجام', 'Shawarma Harmony Mix', 35],
    ['m4', 'mix', 'ميكس سوسيس إنسجام', 'Frankfurter Harmony Mix', 35],
    ['t1', 'tagine', 'طاجن سادة', 'Plain Tagine', 20, 35],
    ['t2', 'tagine', 'طاجن كبدة', 'Liver Tagine', 25, 40],
    ['t3', 'tagine', 'طاجن لحمة', 'Meat Tagine', 25, 40],
    ['t4', 'tagine', 'طاجن شاورما', 'Shawarma Tagine', 35, 50],
    ['t5', 'tagine', 'طاجن سجق', 'Sausage Tagine', 35, 50],
    ['t6', 'tagine', 'طاجن سوسيس', 'Frankfurter Tagine', 35, 50],
    ['h1', 'hawawshi', 'حواوشي بلدي', 'Baladi Hawawshi', 20, 30],
    ['h2', 'hawawshi', 'حواوشي كفتة سوبر', 'Super Kofta Hawawshi', 30, 40],
    ['h3', 'hawawshi', 'حواوشي مخصوص كفتة', 'Special Kofta Hawawshi', 40, 50]
  ].map(r => ({ id: r[0], cat: r[1], ar: r[2], en: r[3], price: r[4], mz: r[5] || 0 }));
  const BY_ID = Object.fromEntries(MENU.map(m => [m.id, m]));
  const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => innerWidth <= 760;
  const img = k => `assets/img/${k}.webp`;

  /* ---------------- i18n ---------------- */
  const T = {
    ar: {
      title: 'محطة الانسجام | مكرونة وطواجن وحواوشي في منيل شيحة',
      brand: 'محطة الانسجام', 'brand.tag': 'مكرونة · طواجن · حواوشي', cur: 'ج.م', from: 'من',
      'ld.dep': 'رحلة الطعم · القيام حالًا',
      'nav.journey': 'القطر', 'nav.oven': 'الطاجن', 'nav.menu': 'المنيو', 'nav.offer': 'العروض', 'nav.visit': 'العنوان', 'nav.deliver': 'التوصيل والدفع',
      'cta.order': 'اطلب دلوقتي', 'cta.menu': 'شوف المنيو', 'cta.wa': 'اطلب على واتساب', 'cta.add': 'ضيف للتذكرة',
      'hero.eyebrow': 'منيل شيحة · الجيزة · مفتوحين 24 ساعة', 'hero.small': 'محطة', 'hero.big': 'الانسجام', 'hero.plate': 'ميكسات',
      'hero.sub': 'مكرونة وطواجن وحواوشي وميكسات على كيفك 👌', 'hero.t1': 'صنف على المنيو', 'hero.t2': 'ج.م أول سعر', 'hero.t3': 'توصيل لحد البيت', 'hero.scroll': 'القطر داخل على الرصيف',
      'j.eyebrow': 'اركب معانا', 'j.title': 'أربع عربيات… <em>وكل عربية طعم</em>',
      'cat.box': 'علب الانسجام', 'cat.mix': 'الميكسات', 'cat.tagine': 'الطواجن', 'cat.hawawshi': 'الحواوشي',
      'wg.box': 'مكرونة بالصلصة الحمراء… بطعم لا يقاوم', 'wg.mix': 'كبدة، سجق، شاورما، سوسيس… على كيفك', 'wg.tagine': 'طالعة من الفرن… والموتزاريلا بتشد', 'wg.hawawshi': 'رغيف مقرمش وحشوة كفتة متبلة',
      'oven.eyebrow': 'المحطة الجاية: الفرن', 'oven.title': 'الغزالة رايقة لما <em>الطاجن يبقى واخد حقه في الفرن!</em>',
      'oven.s1': 'مكرونة بالرد صوص', 'oven.s2': 'كبدة، لحمة، شاورما، سجق أو سوسيس', 'oven.s3': 'طبقة موتزاريلا بتشد معاك لآخر الشارع', 'oven.cta': 'اختار طاجنك',
      'mix.eyebrow': 'ميكسات على كيفك', 'mix.title': 'علبة مكرونة… <em>وإنت تختار اللي ينزل فوقها</em>',
      'mix.s1': 'ميكس كبدة إنسجام', 'mix.s2': 'ميكس سجق إنسجام', 'mix.s3': 'ميكس شاورما وسوسيس إنسجام', 'mix.cta': 'اطلب الميكس',
      'menu.eyebrow': 'لوحة المواعيد · 25 صنف', 'menu.title': 'المنيو <em>كامل بالأسعار</em>',
      'menu.lead': 'اختار الرصيف، وضيف اللي نفسك فيه للتذكرة. الطواجن والحواوشي ليهم نسخة بالموتزاريلا.',
      'menu.board': 'المغادرة من محطة الانسجام', 'menu.col1': 'الصنف', 'menu.col2': 'السعر', 'menu.pf': 'رصيف',
      'menu.note': '* الطواجن والميكسات حسب الطلب. الأسعار بالجنيه المصري.', 'menu.paper': 'شوف المنيو المطبوع',
      'menu.mz': 'بالموتزاريلا', 'menu.plain': 'عادي', 'menu.orMz': 'أو بالموتزاريلا',
      'offer.eyebrow': 'عرض حصري', 'offer.title': 'اطلب 4… <em>والخامس علينا</em>', 'offer.lead': 'عرض لفترة محدودة في أيام مختارة. ابعتلنا على واتساب واسأل عن مواعيد العرض الجاي.', 'offer.cta': 'اسأل عن العرض',
      'offer.tk': 'تذكرة هدية · 4 + 1', 'offer.l1': 'علبة انسجام أي مقاس', 'offer.g1': 'علبة هدية', 'offer.l2': 'أكياس انسجام', 'offer.g2': 'كيس هدية', 'offer.l3': 'رغيف حواوشي', 'offer.g3': 'رغيف هدية', 'offer.l4': 'طاجن أي نوع', 'offer.g4': 'طاجن هدية', 'offer.stub': 'هدية',
      'del.eyebrow': 'خدمة التوصيل', 'del.title': 'الطلب يتحرك من المحطة… <em>ويوصلك سخن</em>', 'del.a': 'المحطة', 'del.b': 'بيتك',
      'del.s1t': 'اختار من المنيو', 'del.s1p': 'ضيف الأصناف للتذكرة واختار توصيل أو استلام.', 'del.s2t': 'ابعت على واتساب', 'del.s2p': 'الطلب بيتكتب لوحده بالأسعار والإجمالي.', 'del.s3t': 'ادفع زي ما تحب', 'del.s3p': 'كاش عند الاستلام، أو إنستاباي، أو فودافون كاش.',
      'pay.ask': 'اطلب الرقم على واتساب', 'wa.pay': 'أهلًا محطة الانسجام 👋 عايز رقم الدفع (إنستاباي / فودافون كاش).', 'pay.insta': 'إنستا باي', 'pay.voda': 'فودافون كاش', 'pay.hot': 'الطلبات والتوصيل', 'pay.copy': 'انسخ الرقم', 'pay.copied': 'اتنسخ الرقم ✓',
      'visit.eyebrow': 'محطتنا', 'visit.title': 'تعالى <em>زورنا</em>', 'visit.addr': 'العنوان', 'visit.addrV': 'منيل شيحة، شارع النقطة القديمة بجوار الوحدة الصحية - شارع الجرن، الجيزة',
      'visit.hours': 'مواعيد العمل', 'visit.hoursV': 'مفتوحين 24 ساعة، طول أيام الأسبوع', 'visit.phone': 'الطلبات والتوصيل', 'visit.mail': 'البريد', 'visit.maps': 'افتح في خرائط Google',
      'ftr.about': 'مكرونة بالصلصة الحمراء… بطعم لا يقاوم. طواجن، حواوشي وميكسات على كيفك.',
      'cart.title': 'تذكرة طلبك', 'cart.items': 'صنف', 'cart.view': 'عرض التذكرة', 'cart.delivery': 'توصيل', 'cart.pickup': 'استلام من المحطة', 'cart.name': 'الاسم', 'cart.addr': 'العنوان بالتفصيل', 'cart.note': 'ملاحظات (اختياري)',
      'cart.subtotal': 'الإجمالي', 'cart.send': 'ابعت الطلب على واتساب', 'cart.empty': 'التذكرة لسه فاضية. اختار من المنيو واركب معانا 🚂', 'cart.added': 'اتضاف للتذكرة 🎫',
      marquee: ['مكرونة بالصلصة الحمراء', 'طواجن بالموتزاريلا', 'حواوشي بلدي وكفتة', 'ميكسات على كيفك', 'توصيل 24 ساعة', 'منيل شيحة · الجيزة'],
      flaps: ['مكرونة', 'طواجن', 'حواوشي', 'ميكسات'], flapEnd: ['محطة', 'الانسجام'],
      'wa.hello': 'أهلًا محطة الانسجام 👋 عايز أطلب.', 'wa.offer': 'أهلًا محطة الانسجام 👋 إمتى عرض 4 + 1 الجاي؟', 'wa.order': 'أهلًا محطة الانسجام 🚂 عايز أطلب:', 'wa.total': 'الإجمالي', 'wa.type': 'نوع الطلب', 'wa.name': 'الاسم', 'wa.addr': 'العنوان', 'wa.note': 'ملاحظات'
    },
    en: {
      title: 'Harmony Station | Pasta, Tagines & Hawawshi in Menyal Shiha',
      brand: 'Harmony Station', 'brand.tag': 'Pasta · Tagines · Hawawshi', cur: 'EGP', from: 'from',
      'ld.dep': 'Flavour express · departing now',
      'nav.journey': 'The train', 'nav.oven': 'Tagines', 'nav.menu': 'Menu', 'nav.offer': 'Offers', 'nav.visit': 'Find us', 'nav.deliver': 'Delivery & payment',
      'cta.order': 'Order now', 'cta.menu': 'See the menu', 'cta.wa': 'Order on WhatsApp', 'cta.add': 'Add to ticket',
      'hero.eyebrow': 'Menyal Shiha · Giza · Open 24 hours', 'hero.small': 'Harmony', 'hero.big': 'STATION', 'hero.plate': 'MIXES',
      'hero.sub': 'Pasta, tagines, hawawshi and mixes, just the way you like 👌', 'hero.t1': 'items on the menu', 'hero.t2': 'EGP starting price', 'hero.t3': 'delivery to your door', 'hero.scroll': 'The train is pulling in',
      'j.eyebrow': 'All aboard', 'j.title': 'Four wagons… <em>four flavours</em>',
      'cat.box': 'Harmony Boxes', 'cat.mix': 'Mixes', 'cat.tagine': 'Tagines', 'cat.hawawshi': 'Hawawshi',
      'wg.box': 'Red-sauce pasta… irresistible', 'wg.mix': 'Liver, sausage, shawarma, frankfurters… your call', 'wg.tagine': 'Straight from the oven, with stretchy mozzarella', 'wg.hawawshi': 'Crispy bread, spiced kofta filling',
      'oven.eyebrow': 'Next stop: the oven', 'oven.title': 'Everything’s right when <em>the tagine gets its time in the oven!</em>',
      'oven.s1': 'Pasta in red sauce', 'oven.s2': 'Liver, meat, shawarma, sausage or frankfurters', 'oven.s3': 'A mozzarella layer that stretches down the street', 'oven.cta': 'Pick your tagine',
      'mix.eyebrow': 'Mixes your way', 'mix.title': 'A box of pasta… <em>you choose what lands on top</em>',
      'mix.s1': 'Liver Harmony Mix', 'mix.s2': 'Sausage Harmony Mix', 'mix.s3': 'Shawarma & Frankfurter Mix', 'mix.cta': 'Order a mix',
      'menu.eyebrow': 'Departures board · 25 items', 'menu.title': 'The full menu <em>with prices</em>',
      'menu.lead': 'Pick a platform and add what you crave to your ticket. Tagines and hawawshi come with a mozzarella option.',
      'menu.board': 'Departures from Harmony Station', 'menu.col1': 'Item', 'menu.col2': 'Price', 'menu.pf': 'Platform',
      'menu.note': '* Tagines and mixes are made to order. Prices in Egyptian pounds.', 'menu.paper': 'See the printed menu',
      'menu.mz': 'with mozzarella', 'menu.plain': 'Regular', 'menu.orMz': 'or with mozzarella',
      'offer.eyebrow': 'Exclusive offer', 'offer.title': 'Order 4… <em>the 5th is on us</em>', 'offer.lead': 'A limited-time offer on selected days. Message us on WhatsApp to ask when it runs next.', 'offer.cta': 'Ask about the offer',
      'offer.tk': 'Gift ticket · 4 + 1', 'offer.l1': 'Harmony boxes, any size', 'offer.g1': 'free box', 'offer.l2': 'Harmony bags', 'offer.g2': 'free bag', 'offer.l3': 'Hawawshi loaves', 'offer.g3': 'free loaf', 'offer.l4': 'Tagines, any kind', 'offer.g4': 'free tagine', 'offer.stub': 'FREE',
      'del.eyebrow': 'Delivery service', 'del.title': 'Your order leaves the station… <em>and arrives hot</em>', 'del.a': 'Station', 'del.b': 'Your home',
      'del.s1t': 'Pick from the menu', 'del.s1p': 'Add items to your ticket and choose delivery or pickup.', 'del.s2t': 'Send on WhatsApp', 'del.s2p': 'Your order is written for you with prices and total.', 'del.s3t': 'Pay your way', 'del.s3p': 'Cash on delivery, InstaPay or Vodafone Cash.',
      'pay.ask': 'Ask for the number on WhatsApp', 'wa.pay': 'Hello Harmony Station 👋 Please send me the payment number (InstaPay / Vodafone Cash).', 'pay.insta': 'InstaPay', 'pay.voda': 'Vodafone Cash', 'pay.hot': 'Orders & delivery', 'pay.copy': 'Copy number', 'pay.copied': 'Number copied ✓',
      'visit.eyebrow': 'Our station', 'visit.title': 'Come <em>visit us</em>', 'visit.addr': 'Address', 'visit.addrV': 'Menyal Shiha, Old Police Point St., next to the Health Unit (El Gorn St.), Giza',
      'visit.hours': 'Opening hours', 'visit.hoursV': 'Open 24 hours, 7 days a week', 'visit.phone': 'Orders & delivery', 'visit.mail': 'Email', 'visit.maps': 'Open in Google Maps',
      'ftr.about': 'Red-sauce pasta… irresistible. Tagines, hawawshi and mixes your way.',
      'cart.title': 'Your ticket', 'cart.items': 'items', 'cart.view': 'View ticket', 'cart.delivery': 'Delivery', 'cart.pickup': 'Pick up', 'cart.name': 'Name', 'cart.addr': 'Full address', 'cart.note': 'Notes (optional)',
      'cart.subtotal': 'Total', 'cart.send': 'Send order on WhatsApp', 'cart.empty': 'Your ticket is empty. Pick from the menu and hop on 🚂', 'cart.added': 'Added to your ticket 🎫',
      marquee: ['Red-sauce pasta', 'Mozzarella tagines', 'Baladi & kofta hawawshi', 'Mixes your way', '24-hour delivery', 'Menyal Shiha · Giza'],
      flaps: ['PASTA', 'TAGINE', 'HAWAWSHI', 'MIXES'], flapEnd: ['HARMONY', 'STATION'],
      'wa.hello': 'Hello Harmony Station 👋 I’d like to order.', 'wa.offer': 'Hello Harmony Station 👋 When is the next 4 + 1 offer?', 'wa.order': 'Hello Harmony Station 🚂 I’d like to order:', 'wa.total': 'Total', 'wa.type': 'Order type', 'wa.name': 'Name', 'wa.addr': 'Address', 'wa.note': 'Notes'
    }
  };
  const qs = new URLSearchParams(location.search).get('lang');
  let LANG = qs === 'en' || qs === 'ar' ? qs : (safeGet('hs_lang') || 'ar');
  if (LANG !== 'en') LANG = 'ar';
  const t = k => (T[LANG][k] !== undefined ? T[LANG][k] : T.ar[k] !== undefined ? T.ar[k] : k);
  const nm = m => (LANG === 'en' ? m.en : m.ar);
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function applyLang() {
    const h = document.documentElement;
    h.lang = LANG; h.dir = LANG === 'en' ? 'ltr' : 'rtl';
    document.title = t('title');
    $$('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    $$('[data-ph]').forEach(el => { el.placeholder = t(el.dataset.ph); });
  }

  /* ---------------- contacts ---------------- */
  const waURL = txt => `https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(txt)}`;
  function wireContacts() {
    $$('.wa-link').forEach(a => { a.href = waURL(t('wa.' + (a.dataset.waText || 'hello'))); });
    $$('.copy[data-copy]').forEach(b => b.addEventListener('click', () => {
      const n = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(n) : Promise.reject()).then(() => toast(t('pay.copied'))).catch(() => { prompt('', n); });
    }));
    $('#year').textContent = new Date().getFullYear();
  }

  function buildMarquee() {
    const items = t('marquee');
    const html = items.map(s => `<span>${s}</span>`).join('');
    $('#marquee').innerHTML = html + html + html + html;
  }

  /* ---------------- loader ---------------- */
  function loader(done) {
    const box = $('#ldFlaps');
    const end = t('flapEnd'), words = t('flaps');
    const mk = () => { box.innerHTML = ''; return end.map(() => { const f = document.createElement('div'); f.className = 'flap-word'; box.appendChild(f); return f; }); };
    const flaps = mk();
    const setW = (el, w) => { el.innerHTML = [...(LANG === 'en' ? w : [w])].map(c => `<span class="flap">${c}</span>`).join(''); };
    let i = 0;
    const tick = setInterval(() => { flaps.forEach((f, k) => setW(f, words[(i + k * 2) % words.length])); i++; }, 160);
    const imgs = ['hero.webp', 'logo.webp', 'box.webp', 'mix.webp', 'tagine.webp', 'hawawshi.webp'];
    if (isMobile()) imgs[0] = 'hero-m.webp';
    let loaded = 0, shown = 0;
    imgs.forEach(s => { const im = new Image(); im.onload = im.onerror = () => loaded++; im.src = img(s.replace('.webp', '')); });
    const t0 = performance.now();
    const train = $('#ldTrain'), num = $('#ldNum');
    (function step() {
      const target = Math.min(loaded / imgs.length, (performance.now() - t0) / 1400);
      shown += (target * 100 - shown) * 0.12;
      const p = Math.min(100, Math.round(shown));
      num.textContent = p;
      const w = train.parentElement.clientWidth - 64;
      train.style.transform = `translateX(${-w * p / 100}px)`;
      if (p >= 99) {
        clearInterval(tick);
        flaps.forEach((f, k) => setW(f, end[k]));
        setTimeout(() => { $('#loader').classList.add('done'); document.body.classList.remove('is-loading'); done(); }, 650);
        return;
      }
      requestAnimationFrame(step);
    })();
  }

  /* ---------------- steam particles ---------------- */
  function steam(canvas, opts) {
    const ctx = canvas.getContext('2d');
    let W, H, parts = [], run = true;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    function size() { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 128;
    const sg = sprite.getContext('2d'); const g = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,240,225,.55)'); g.addColorStop(.5, 'rgba(240,220,200,.18)'); g.addColorStop(1, 'rgba(240,220,200,0)');
    sg.fillStyle = g; sg.fillRect(0, 0, 128, 128);
    function spawn() {
      const o = opts.origin();
      parts.push({ x: o.x + (Math.random() - .5) * opts.spread, y: o.y, vx: opts.vx() , vy: -(.4 + Math.random() * .9) * opts.speed, s: opts.size * (.5 + Math.random() * .6), g: 1 + Math.random() * .8, a: 0, life: 0, max: 220 + Math.random() * 160 });
    }
    function loop() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (let k = 0; k < opts.rate; k++) if (parts.length < opts.max) spawn();
      parts = parts.filter(p => p.life < p.max);
      for (const p of parts) {
        p.life++; p.x += p.vx; p.y += p.vy; p.vy *= .995; p.s += p.g * .35;
        const lf = p.life / p.max; p.a = lf < .15 ? lf / .15 : 1 - (lf - .15) / .85;
        ctx.globalAlpha = p.a * opts.alpha;
        ctx.drawImage(sprite, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loop);
    }
    loop();
    return { stop() { run = false; }, start() { if (!run) { run = true; loop(); } } };
  }

  /* ---------------- board menu ---------------- */
  let curCat = 'box';
  function priceChars(n) { return String(n).split('').map(c => `<span class="ch">${c}</span>`).join(''); }
  function buildTabs() {
    $('#tabs').innerHTML = CATS.map((c, i) => `<button class="pf${c.id === curCat ? ' on' : ''}" data-cat="${c.id}" role="tab"><small>${t('menu.pf')} ${i + 1}</small>${LANG === 'en' ? c.en : c.ar}</button>`).join('');
    $$('#tabs .pf').forEach(b => b.addEventListener('click', () => { curCat = b.dataset.cat; $$('#tabs .pf').forEach(x => x.classList.toggle('on', x === b)); renderRows(true); }));
  }
  function renderRows(flip) {
    const items = MENU.filter(m => m.cat === curCat);
    $('#rows').innerHTML = items.map(m => `
      <div class="row" data-id="${m.id}">
        <div class="row-name"><img src="${img(CAT[m.cat].img)}" alt="" loading="lazy"><div><b>${nm(m)}</b>${m.mz ? `<small>${t('menu.orMz')} · ${m.mz} ${t('cur')}</small>` : ''}</div></div>
        <div class="row-price">${priceChars(m.price)}<span class="cur">${t('cur')}</span></div>
        <button class="row-add" aria-label="${t('cta.add')}">+</button>
      </div>`).join('');
    $$('#rows .row').forEach(r => r.addEventListener('click', e => {
      const m = BY_ID[r.dataset.id];
      if (e.target.closest('.row-add') && !m.mz) { addToCart(m.id, 0, 1, r.querySelector('img')); return; }
      openSheet(m);
    }));
    if (flip && !reduce) flipChars();
    if (window.gsap && flip) gsap.from('#rows .row', { opacity: 0, y: 14, stagger: .05, duration: .4, ease: 'power2.out' });
  }
  function flipChars() {
    $$('#rows .ch').forEach((ch, i) => {
      const final = ch.textContent; let n = 0;
      const iv = setInterval(() => { ch.textContent = n > 6 + (i % 4) ? final : Math.floor(Math.random() * 10); if (n++ > 6 + (i % 4)) clearInterval(iv); }, 55);
    });
  }
  function clock() {
    const el = $('#clock');
    const f = () => { try { el.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Cairo' }).format(new Date()); } catch (e) { const d = new Date(); el.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); } };
    f(); setInterval(f, 15000);
  }

  /* ---------------- item sheet ---------------- */
  let sh = { m: null, mz: 0, q: 1 };
  function openSheet(m) {
    sh = { m, mz: 0, q: 1 };
    $('#shImg').src = img(CAT[m.cat].img);
    $('#shName').textContent = nm(m);
    $('#shOpt').innerHTML = m.mz ? `<button class="on" data-mz="0">${t('menu.plain')}<small>${m.price} ${t('cur')}</small></button><button data-mz="1">${t('menu.mz')}<small>${m.mz} ${t('cur')}</small></button>` : '';
    $$('#shOpt button').forEach(b => b.addEventListener('click', () => { sh.mz = +b.dataset.mz; $$('#shOpt button').forEach(x => x.classList.toggle('on', x === b)); updSheet(); }));
    updSheet(); openLayer('#sheet');
  }
  function updSheet() {
    const p = sh.mz ? sh.m.mz : sh.m.price;
    $('#shQty').textContent = sh.q; $('#shPrice').textContent = `${p * sh.q} ${t('cur')}`;
  }
  function wireSheet() {
    $('#shMinus').addEventListener('click', () => { sh.q = Math.max(1, sh.q - 1); updSheet(); });
    $('#shPlus').addEventListener('click', () => { sh.q = Math.min(20, sh.q + 1); updSheet(); });
    $('#shAdd').addEventListener('click', () => { addToCart(sh.m.id, sh.mz, sh.q, $('#shImg')); closeLayers(); });
  }

  /* ---------------- layers ---------------- */
  let lenis = null;
  function openLayer(sel) { const el = $(sel); el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); }
  function closeLayers() { $$('.sheet,.drawer,.lightbox').forEach(el => { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }); lenis && lenis.start(); }

  /* ---------------- cart ---------------- */
  let cart = [];
  try { cart = JSON.parse(safeGet('hs_cart') || '[]').filter(c => BY_ID[c.id]); } catch (e) { cart = []; }
  let otype = 'delivery';
  const unit = c => (c.mz ? BY_ID[c.id].mz : BY_ID[c.id].price);
  const label = c => nm(BY_ID[c.id]) + (c.mz ? ` (${t('menu.mz')})` : '');
  function save() { safeSet('hs_cart', JSON.stringify(cart)); }
  function addToCart(id, mz, q, fromEl) {
    const ex = cart.find(c => c.id === id && c.mz === mz);
    if (ex) ex.q += q; else cart.push({ id, mz, q });
    save(); renderCart(); toast(t('cart.added'));
    if (fromEl) fly(fromEl);
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  function renderCart() {
    const n = cart.reduce((s, c) => s + c.q, 0), tot = cart.reduce((s, c) => s + c.q * unit(c), 0);
    $('#cartCount').textContent = n; $('#fabCount').textContent = n; $('#fabTotal').textContent = tot; $('#drTotal').textContent = tot;
    $('#fab').classList.toggle('show', n > 0);
    $('#drItems').innerHTML = n ? cart.map((c, i) => `
      <div class="ci"><img src="${img(CAT[BY_ID[c.id].cat].img)}" alt=""><div><b>${label(c)}</b><small>${unit(c)} × ${c.q} = ${unit(c) * c.q} ${t('cur')}</small></div>
      <div class="qty"><button data-i="${i}" data-d="-1">−</button><b>${c.q}</b><button data-i="${i}" data-d="1">+</button></div></div>`).join('') : `<p class="dr-empty">${t('cart.empty')}</p>`;
    $$('#drItems .qty button').forEach(b => b.addEventListener('click', () => {
      const c = cart[+b.dataset.i]; c.q += +b.dataset.d; if (c.q <= 0) cart.splice(+b.dataset.i, 1); save(); renderCart();
    }));
  }
  function wireCart() {
    $('#cartBtn').addEventListener('click', () => openLayer('#drawer'));
    $('#fab').addEventListener('click', () => openLayer('#drawer'));
    $$('[data-close]').forEach(el => el.addEventListener('click', closeLayers));
    addEventListener('keydown', e => { if (e.key === 'Escape') closeLayers(); });
    $$('#seg button').forEach(b => b.addEventListener('click', () => { otype = b.dataset.type; $$('#seg button').forEach(x => x.classList.toggle('on', x === b)); $('#fAddr').style.display = otype === 'delivery' ? '' : 'none'; }));
    $('#sendWa').addEventListener('click', () => {
      if (!cart.length) { toast(t('cart.empty')); return; }
      const L = [t('wa.order'), ''];
      cart.forEach(c => L.push(`• ${label(c)} × ${c.q} = ${unit(c) * c.q} ${t('cur')}`));
      L.push('', `${t('wa.total')}: ${cart.reduce((s, c) => s + c.q * unit(c), 0)} ${t('cur')}`);
      L.push(`${t('wa.type')}: ${t(otype === 'delivery' ? 'cart.delivery' : 'cart.pickup')}`);
      const nmv = $('#fName').value.trim(), ad = $('#fAddr').value.trim(), no = $('#fNote').value.trim();
      if (nmv) L.push(`${t('wa.name')}: ${nmv}`);
      if (ad && otype === 'delivery') L.push(`${t('wa.addr')}: ${ad}`);
      if (no) L.push(`${t('wa.note')}: ${no}`);
      window.open(waURL(L.join('\n')), '_blank');
    });
    $('#paperBtn').addEventListener('click', () => openLayer('#lightbox'));
  }
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }
  function fly(fromEl) {
    if (reduce || !window.gsap) return;
    const r = fromEl.getBoundingClientRect(), to = $('#cartBtn').getBoundingClientRect();
    const f = document.createElement('img'); f.src = fromEl.src; f.className = 'fly'; document.body.appendChild(f);
    gsap.fromTo(f, { left: r.left + r.width / 2 - 40, top: r.top + r.height / 2 - 40, scale: 1, opacity: 1 },
      { left: to.left + to.width / 2 - 40, top: to.top + to.height / 2 - 40, scale: .2, opacity: .3, duration: .8, ease: 'power2.in', onComplete: () => f.remove() });
  }

  /* ---------------- image sequences ---------------- */
  function loadSeq(name, n) {
    const frames = new Array(n);
    for (let i = 0; i < n; i++) { const im = new Image(); im.decoding = 'async'; im.src = `assets/seq/${name}/${String(i + 1).padStart(2, '0')}.webp`; frames[i] = im; }
    return frames;
  }
  function drawFrame(canvas, frames, idx) {
    const im = frames[idx]; if (!im || !im.complete || !im.naturalWidth) return false;
    const ctx = canvas.getContext('2d'), s = canvas.clientWidth * Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(s)) { canvas.width = canvas.height = Math.round(s); }
    ctx.drawImage(im, 0, 0, canvas.width, canvas.height); return true;
  }

  /* ---------------- motion ---------------- */
  function scrollToEl(el) { if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.2 }); else el.scrollIntoView({ behavior: 'smooth' }); }
  function motion() {
    const hdr = $('#hdr'); let lastY = 0;
    const onScroll = y => { hdr.classList.toggle('solid', y > 40); hdr.classList.toggle('hide', y > lastY && y > 500 && !document.body.classList.contains('nav-open')); lastY = y; };
    if (!reduce && window.Lenis && matchMedia('(pointer:fine)').matches) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on('scroll', e => { ScrollTrigger.update(); onScroll(e.scroll); });
      gsap.ticker.add(time => lenis.raf(time * 1000)); gsap.ticker.lagSmoothing(0);
    } else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return; const el = $(id); if (!el) return;
      e.preventDefault(); document.body.classList.remove('nav-open');
      if (a.dataset.jump) { curCat = a.dataset.jump; buildTabs(); renderRows(true); }
      scrollToEl(el);
    }));
    $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));

    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    // hero steam + parallax
    const hs = steam($('#steam'), {
      origin: () => { const c = $('#steam'); return isMobile() ? { x: c.clientWidth * .5, y: c.clientHeight * .7 } : { x: c.clientWidth * (LANG === 'en' ? .81 : .19), y: c.clientHeight * .33 }; },
      spread: 40, vx: () => (Math.random() - .5) * .5 + (isMobile() ? 0 : (LANG === 'en' ? -.25 : .25)), speed: 1.4, size: 120, rate: 1, max: 90, alpha: .55
    });
    ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', onLeave: () => hs.stop(), onEnterBack: () => hs.start() });
    gsap.to('#heroImg', { scale: 1.12, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-inner', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 20%', scrub: true } });

    // the train
    const train = $('#train');
    const puff = steam($('#puff'), { origin: () => ({ x: 80, y: 290 }), spread: 10, vx: () => 1.1 + Math.random() * .8, speed: 1.6, size: 44, rate: 1, max: 70, alpha: .8 });
    const wheels = $$('.wh', train), rod = $('.rod', train), dishes = $$('.wg-dish', train);
    const tw = () => train.scrollWidth;
    const startX = () => innerWidth * (isMobile() ? .45 : .55);
    const endX = () => -(tw() - innerWidth * (isMobile() ? .92 : .82));
    gsap.set(train, { x: startX() });
    let lastX = startX(), rot = 0;
    const jt = gsap.fromTo(train, { x: startX }, {
      x: endX, ease: 'none',
      scrollTrigger: {
        trigger: '#journey', start: 'top top', end: () => '+=' + (tw() + innerWidth) * .9, pin: '.journey-pin', scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: () => {
          const x = gsap.getProperty(train, 'x'); rot += (x - lastX) / 41 * (180 / Math.PI); lastX = x;
          wheels.forEach(w => w.style.transform = `rotate(${rot}deg)`);
          const a = rot * Math.PI / 180; rod.style.transform = `translate(${Math.cos(a) * 12}px,${Math.sin(a) * 12}px)`;
        },
        onLeave: () => puff.stop(), onEnterBack: () => puff.start()
      }
    });
    dishes.forEach((d, i) => gsap.to(d, { y: -8, rotation: i % 2 ? 2 : -2, duration: 1.4 + i * .2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

    // sequences
    [['#seqTagine', 'tagine', '#oven'], ['#seqMix', 'mix', '#mixes']].forEach(([cv, name, sec]) => {
      const canvas = $(cv); let frames = null; const N = 48; const state = { f: 0 };
      const steps = $$('.scene-steps li', $(sec));
      const ensure = () => { if (!frames) { frames = loadSeq(name, N); frames[0].onload = () => drawFrame(canvas, frames, 0); } };
      ScrollTrigger.create({ trigger: sec, start: 'top 180%', onEnter: ensure, onEnterBack: ensure });
      gsap.to(state, {
        f: N - 1, ease: 'none', snap: 'f',
        scrollTrigger: { trigger: sec, start: 'top top', end: '+=180%', pin: $('.scene-pin', $(sec)), scrub: .4,
          onUpdate: self => { steps.forEach((li, k) => li.classList.toggle('on', self.progress >= k / steps.length * .9)); } },
        onUpdate: () => { ensure(); drawFrame(canvas, frames, Math.round(state.f)); }
      });
      gsap.from($('.scene-copy', $(sec)).children, { y: 30, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 60%' } });
      addEventListener('resize', () => frames && drawFrame(canvas, frames, Math.round(state.f)));
    });

    // headings reveal
    $$('.sec-head, .offer-copy, .visit-copy').forEach(el => gsap.from(el.children, { y: 30, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }));
    gsap.from('.board', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.board', start: 'top 85%', onEnter: () => flipChars() } });
    gsap.fromTo('#offerTicket', { rotation: -12, x: LANG === 'en' ? 120 : -120, opacity: 0 }, { rotation: -3, x: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '#offer', start: 'top 70%' } });
    gsap.from('.tk-lines li', { x: LANG === 'en' ? -30 : 30, opacity: 0, stagger: .1, duration: .6, scrollTrigger: { trigger: '#offer', start: 'top 60%' } });
    $$('.step, .pay-card').forEach((el, i) => gsap.from(el, { y: 40, opacity: 0, duration: .8, delay: (i % 3) * .08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    gsap.from('.map', { scale: .92, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.map', start: 'top 85%' } });

    // delivery route scooter
    const path = $('#routePath'), sc = $('#scooter'), route = $('#route'), svg = $('.route-svg');
    const placeScooter = p => {
      const L = path.getTotalLength(), pt = path.getPointAtLength(L * p);
      const w = route.clientWidth, h = route.clientHeight;
      let x = pt.x / 1000 * w; if (LANG !== 'en') x = w - x;
      sc.style.left = x + 'px'; sc.style.top = (pt.y / 120 * h) + 'px';
    };
    placeScooter(0);
    ScrollTrigger.create({ trigger: '#route', start: 'top 85%', end: 'bottom 30%', scrub: true, onUpdate: s => placeScooter(s.progress) });

    addEventListener('load', () => ScrollTrigger.refresh());
  }

  function intro() {
    if (!window.gsap || reduce) return;
    const tl = gsap.timeline();
    tl.from('.hero-bg img', { scale: 1.25, duration: 2.2, ease: 'power3.out' }, 0)
      .from('.hero .eyebrow', { y: 20, opacity: 0, duration: .6 }, .2)
      .from('.sign-small', { y: -80, rotation: -12, opacity: 0, duration: .9, ease: 'bounce.out' }, .3)
      .from('.sign-big', { scale: .6, opacity: 0, duration: 1, ease: 'back.out(1.8)' }, .45)
      .from('.sign-plate', { y: 30, opacity: 0, duration: .6, ease: 'back.out(2)' }, .8)
      .from('.hero-sub, .hero-ctas', { y: 24, opacity: 0, stagger: .1, duration: .7 }, .9)
      .from('.hero-tickets li', { y: 30, opacity: 0, rotation: -6, stagger: .1, duration: .6, ease: 'back.out(2)' }, 1.05);
  }

  function init() {
    applyLang(); wireContacts(); buildMarquee(); buildTabs(); renderRows(false); clock(); wireSheet(); wireCart(); renderCart();
    $('#fAddr').style.display = '';
    $('#langBtn').addEventListener('click', () => {
      const nl = LANG === 'ar' ? 'en' : 'ar'; safeSet('hs_lang', nl);
      const u = new URL(location.href); u.searchParams.set('lang', nl); u.hash = ''; location.href = u.toString();
    });
    if (qs) safeSet('hs_lang', LANG);
    motion();
    loader(() => { intro(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
