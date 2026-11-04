/* الشوَّا | Alshawwa — site logic (AR/EN, motion, menu, cart → WhatsApp) */
(function () {
  'use strict';
  const C = window.SH_CONFIG, CATS = window.SH_CATS, GROUPS = window.SH_GROUPS, SIZES = window.SH_SIZES;
  const MENU = window.SH_MENU.map(r => ({ id: r[0], cat: r[1], ar: r[2], en: r[3], price: r[4], img: r[5], feat: !!r[6] }));
  const BY_ID = Object.fromEntries(MENU.map(m => [m.id, m]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = n => Number(n).toLocaleString('en-US');
  const imgSrc = k => `assets/img/dish/${k}.webp`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------ i18n */
  const T = {
    ar: {
      brand: 'الشوَّا', cur: 'ج.م',
      'nav.build': 'ابنِ طبقك', 'nav.sig': 'الأطباق المميزة', 'nav.menu': 'المنيو', 'nav.story': 'حكايتنا', 'nav.visit': 'الموقع والتواصل',
      'cta.order': 'اطلب الآن', 'cta.menu': 'شوف المنيو', 'cta.wa': 'اطلب عبر واتساب', 'cta.add': 'أضف للطلب', 'cta.call': 'اتصل بينا', 'cta.maps': 'افتح في خرائط Google',
      'hero.eyebrow': 'مشويات على الفحم الطبيعي · مدينتي', 'hero.sub': 'طعم الفحم الأصيل، من الأول للآخر.',
      'hero.f1': 'صنف على المنيو', 'hero.f2': 'فحم طبيعي', 'hero.f3b': 'يومي', 'hero.f3': 'لحوم بلدية طازجة', 'hero.tagS': 'كيلو كباب', 'hero.scroll': 'انزل وشوف الطبق بيتبني',
      'build.eyebrow': 'اتفرج الطبق وهو بيتبني', 'build.title': 'كل طبق بيتبني <em>على الجمر</em>',
      's1.title': 'كيلو كباب', 's1.a': 'صاج سوري سخن', 's1.b': 'كباب بلدي متتبل يومها', 's1.c': 'طماطم وفلفل على الفحم', 's1.d': 'بصل مشوي وبقدونس وسماق',
      's2.title': 'دجاجة كاملة على الفحم', 's2.a': 'فرخة كاملة متتبلة بخلطتنا', 's2.b': 'تستوي على مهل فوق الجمر', 's2.c': 'طماطم وفلفل مشوي', 's2.d': 'فصوص ثوم محمّرة',
      's3.title': 'سندويش راب فيليه', 's3.a': 'رغيف صاج مفرود', 's3.b': 'مكعبات فيليه من على الفحم', 's3.c': 'مخلل وبطاطس', 's3.d': 'ثومية على الوش',
      'sig.eyebrow': 'اختيارات رواد الشوَّا', 'sig.title': 'الأطباق <em>المميزة</em>',
      'menu.eyebrow': '62 صنف · اختار على ذوقك', 'menu.title': 'المنيو <em>كامل</em>', 'menu.lead': 'اختار على ذوقك، وخلّي الباقي علينا.', 'menu.search': 'دوّر على صنف…', 'menu.all': 'الكل', 'menu.none': 'مفيش صنف بالاسم ده', 'menu.from': 'من', 'menu.feat': 'مميز',
      'story.eyebrow': 'حكايتنا', 'story.big': 'طعم الفحم الأصيل<br><em>من الأول للآخر</em>',
      'story.p': 'بدأنا في الشوَّا برؤية واضحة: إعادة الاعتبار للشواء الشرقي الأصيل على جمر الفحم الطبيعي، حيث لا أسرار سوى اللحم البلدي الطازج، والنار الهادئة، والشغف بالإتقان.',
      'p1.t': 'فحم طبيعي أصيل', 'p1.s': 'نقاء النار والنكهة', 'p1.p': 'لا نستخدم الغاز أو الشوايات الكهربائية مطلقًا. كل سيخ وكل قطعة لحم تنضج على جمر أخشاب طبيعية مختارة بعناية، لتمنحكم نكهة التدخين الأصيلة التي لا تُضاهى.',
      'p2.t': 'لحوم بلدية طازجة يوميًا', 'p2.s': 'لا حلول وسط في الجودة', 'p2.p': 'نختار ذبائحنا اليومية من أفضل المزارع البلدية. لحوم طازجة تُفرم وتُتبل يومًا بيوم بدون أي إضافات صناعية أو مواد حافظة، لنضمن العصارة والنقاء التام.',
      'p3.t': 'تتبيلات سرية متوارثة', 'p3.s': 'سر الصنعة وخبرة السنين', 'p3.p': 'خلطات بهارات خاصة متوارثة تُبرز طعم اللحم الأصيل ولا تخفيه. توازن دقيق بين الأعشاب الطبيعية والبهارات الشرقية ليخرج كل طبق بأعلى معايير التذوق.',
      'p4.t': 'ضيافة أهل مدينتي', 'p4.s': 'خدمة دافئة ووصول سريع', 'p4.p': 'من قلب مدينتي، نقدم لزبائننا تجربة طعام استثنائية سواء في صالتنا الدافئة أو عبر توصيل سريع ومحكم يحافظ على سخونة المشويات ونضارتها.',
      'band.t': 'جاهز لتجربة الطعم الحقيقي؟', 'band.p': 'طلبات سريعة، عزومات، ووجبات عائلية. ابعتلنا على واتساب وطلبك يوصلك سخن.',
      'visit.eyebrow': 'زيارتكم تسعدنا', 'visit.title': 'الموقع <em>والتواصل</em>', 'visit.lead': 'نسعد باستقبالكم في صالتنا المكيفة أو بتوصيل طلباتكم ساخنة وطازجة لباب البيت.',
      'visit.addr': 'العنوان', 'visit.orders': 'الطلبات والحجز', 'visit.ordersS': 'للطلبات السريعة وحجز العزومات والوجبات العائلية', 'visit.follow': 'تابعنا وشاهد أحدث الفيديوهات',
      'ftr.about': 'مشويات على الفحم الطبيعي في قلب مدينتي. طعم أصيل، خامات يومية، خدمة مخلصة.', 'ftr.links': 'روابط سريعة', 'ftr.contact': 'تواصل معنا', 'ftr.rights': 'جميع الحقوق محفوظة',
      'cart.title': 'طلبك', 'cart.items': 'صنف', 'cart.view': 'عرض الطلب', 'cart.delivery': 'توصيل', 'cart.pickup': 'استلام من المطعم', 'cart.name': 'الاسم', 'cart.addr': 'العنوان (المجموعة / العمارة / الشقة)', 'cart.note': 'ملاحظات (اختياري)',
      'cart.subtotal': 'الإجمالي', 'cart.send': 'ابعت الطلب على واتساب', 'cart.empty': 'طلبك لسه فاضي. اختار من المنيو وابدأ.', 'cart.added': 'اتضاف للطلب 🔥',
      marquee: ['فحم طبيعي 100%', 'لحوم بلدية يوميًا', 'تتبيلات متوارثة', 'كرافت زون · مدينتي', 'BBQ & MORE'],
      'wa.hello': 'مرحبًا! أود الاستفسار عن الطلبات والتوصيل.', 'wa.order': 'مرحبًا الشوَّا 🔥 عايز أطلب:', 'wa.total': 'الإجمالي', 'wa.type': 'نوع الطلب', 'wa.name': 'الاسم', 'wa.addr': 'العنوان', 'wa.note': 'ملاحظات', 'wa.tax': '(قبل الضريبة والخدمة)'
    },
    en: {
      brand: 'Alshawwa', cur: 'EGP',
      'nav.build': 'Build a plate', 'nav.sig': 'Signatures', 'nav.menu': 'Menu', 'nav.story': 'Our story', 'nav.visit': 'Location & contact',
      'cta.order': 'Order now', 'cta.menu': 'See the menu', 'cta.wa': 'Order on WhatsApp', 'cta.add': 'Add to order', 'cta.call': 'Call us', 'cta.maps': 'Open in Google Maps',
      'hero.eyebrow': 'Natural charcoal grills · Madinaty', 'hero.sub': 'The authentic taste of charcoal, from first bite to last.',
      'hero.f1': 'dishes on the menu', 'hero.f2': 'natural charcoal', 'hero.f3b': 'Daily', 'hero.f3': 'fresh local meat', 'hero.tagS': '1 kg Kebab', 'hero.scroll': 'Scroll to watch it build',
      'build.eyebrow': 'Watch every plate come together', 'build.title': 'Every plate is built <em>over embers</em>',
      's1.title': '1 kg Kebab', 's1.a': 'Warm Syrian saj bread', 's1.b': 'Local kebab, marinated daily', 's1.c': 'Charcoal tomatoes & peppers', 's1.d': 'Grilled onion, parsley & sumac',
      's2.title': 'Whole Charcoal Chicken', 's2.a': 'Whole chicken in our marinade', 's2.b': 'Slow-cooked over the coals', 's2.c': 'Grilled tomatoes & peppers', 's2.d': 'Roasted garlic cloves',
      's3.title': 'Fillet Wrap', 's3.a': 'Open saj bread', 's3.b': 'Charcoal beef fillet cubes', 's3.c': 'Pickles & fries', 's3.d': 'Garlic sauce on top',
      'sig.eyebrow': 'Our regulars’ favourites', 'sig.title': 'Signature <em>dishes</em>',
      'menu.eyebrow': '62 dishes · choose your favourites', 'menu.title': 'The full <em>menu</em>', 'menu.lead': 'Choose your favourites. We’ll take care of the rest.', 'menu.search': 'Search the menu…', 'menu.all': 'All', 'menu.none': 'No dish matches that name', 'menu.from': 'from', 'menu.feat': 'Signature',
      'story.eyebrow': 'Our story', 'story.big': 'The authentic taste of charcoal<br><em>from first bite to last</em>',
      'story.p': 'Alshawwa started with a clear vision: to bring back authentic eastern grilling over natural charcoal, with no secrets beyond fresh local meat, a patient fire and a passion for getting it right.',
      'p1.t': 'Real natural charcoal', 'p1.s': 'Pure fire, pure flavour', 'p1.p': 'We never use gas or electric grills. Every skewer and every cut cooks over embers of carefully chosen natural wood, giving you that authentic smoky flavour.',
      'p2.t': 'Fresh local meat, daily', 'p2.s': 'No compromise on quality', 'p2.p': 'We choose our meat daily from the best local farms. Fresh cuts, minced and marinated day by day with no additives or preservatives, for juiciness and purity.',
      'p3.t': 'Secret inherited marinades', 'p3.s': 'Craft and years of experience', 'p3.p': 'Our own inherited spice blends bring out the true taste of the meat instead of hiding it, a careful balance of natural herbs and eastern spices.',
      'p4.t': 'Madinaty hospitality', 'p4.s': 'Warm service, fast delivery', 'p4.p': 'From the heart of Madinaty, we serve a memorable meal in our cosy dining room or through fast, careful delivery that keeps the grills hot and fresh.',
      'band.t': 'Ready for the real taste?', 'band.p': 'Quick orders, gatherings and family meals. Message us on WhatsApp and your order arrives hot.',
      'visit.eyebrow': 'We’d love to see you', 'visit.title': 'Location <em>& contact</em>', 'visit.lead': 'Join us in our air-conditioned dining room, or get your order delivered hot and fresh to your door.',
      'visit.addr': 'Address', 'visit.orders': 'Orders & bookings', 'visit.ordersS': 'Quick orders, gatherings and family meal bookings', 'visit.follow': 'Follow us for our latest videos',
      'ftr.about': 'Natural charcoal grills in the heart of Madinaty. Authentic taste, fresh cuts daily, gracious hospitality.', 'ftr.links': 'Quick links', 'ftr.contact': 'Contact us', 'ftr.rights': 'All rights reserved',
      'cart.title': 'Your order', 'cart.items': 'items', 'cart.view': 'View order', 'cart.delivery': 'Delivery', 'cart.pickup': 'Pick up', 'cart.name': 'Name', 'cart.addr': 'Address (group / building / flat)', 'cart.note': 'Notes (optional)',
      'cart.subtotal': 'Total', 'cart.send': 'Send order on WhatsApp', 'cart.empty': 'Your order is empty. Pick something from the menu.', 'cart.added': 'Added to your order 🔥',
      marquee: ['100% natural charcoal', 'Fresh local meat daily', 'Inherited marinades', 'Craft Zone · Madinaty', 'BBQ & MORE'],
      'wa.hello': 'Hello! I’d like to ask about orders and delivery.', 'wa.order': 'Hello Alshawwa 🔥 I’d like to order:', 'wa.total': 'Total', 'wa.type': 'Order type', 'wa.name': 'Name', 'wa.addr': 'Address', 'wa.note': 'Notes', 'wa.tax': '(before VAT & service)'
    }
  };
  let lang = 'ar';
  try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('sh-lang') || 'ar'; } catch (e) {}
  if (!T[lang]) lang = 'ar';
  const t = k => (T[lang][k] ?? T.ar[k] ?? k);
  const nm = m => (lang === 'en' ? m.en : m.ar);

  const wa = text => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`;

  function applyLang() {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'الشوَّا | مشويات على الفحم في مدينتي' : 'Alshawwa | Charcoal BBQ in Madinaty';
    $$('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (/<[a-z]/i.test(v)) el.innerHTML = v; else el.textContent = v;
    });
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $('.ht-ar').textContent = lang === 'ar' ? 'الشوَّا' : 'ALSHAWWA';
    $$('.wa-link').forEach(a => { a.href = wa(t('wa.' + (a.dataset.waText || 'hello'))); });
    $('#hdrOrder').href = wa(t('wa.hello'));
    $('#addrLink').textContent = lang === 'ar' ? C.addressAr : C.addressEn;
    $('#ftrAddr').textContent = lang === 'ar' ? C.addressAr : C.addressEn;
    $('#taxNote').textContent = lang === 'ar' ? C.taxAr : C.taxEn;
    $('#cartTax').textContent = lang === 'ar' ? C.taxAr : C.taxEn;
    buildMarquee(); buildSig(); buildTabs(); renderMenu(); renderCart();
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 50);
  }

  /* static contact wiring */
  function wireContacts() {
    $('#addrLink').href = C.mapsUrl;
    $('#mapsBtn').href = C.mapsUrl;
    $('#phoneLink').href = 'tel:' + C.phoneIntl; $('#phoneLink').textContent = C.phone;
    $('#ftrPhone').href = 'tel:' + C.phoneIntl; $('#ftrPhone').textContent = C.phone;
    $('#bandCall').href = 'tel:' + C.phoneIntl;
    $('#mapFrame').src = C.mapsEmbed;
    const ico = {
      ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
      fb: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 8V6c0-.9.6-1 1-1h3V1h-4c-4 0-5 3-5 5v2H6v4h3v11h5V12h3.5l.5-4h-4Z"/></svg>',
      tt: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.2v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.8 5.8 0 1 0 5 5.8V9a7.4 7.4 0 0 0 4.3 1.4V7.2a4.3 4.3 0 0 1-3.2-1.4Z"/></svg>'
    };
    $('#socials').innerHTML =
      `<a href="${C.instagram}" target="_blank" rel="noopener">${ico.ig}Instagram</a>` +
      `<a href="${C.facebook}" target="_blank" rel="noopener">${ico.fb}Facebook</a>` +
      `<a href="${C.tiktok}" target="_blank" rel="noopener">${ico.tt}TikTok</a>`;
  }

  /* ------------------------------------------------ marquee */
  let marqueeTween;
  function buildMarquee() {
    const tr = $('#marquee');
    const words = T[lang].marquee;
    const one = words.map(w => `<span>${w}<i></i></span>`).join('');
    tr.innerHTML = one + one + one + one;
    if (window.gsap && !reduce) {
      if (marqueeTween) marqueeTween.kill();
      gsap.set(tr, { x: 0 });
      const w = tr.scrollWidth / 4;
      marqueeTween = gsap.to(tr, { x: (lang === 'ar' ? w : -w), duration: 28, ease: 'none', repeat: -1 });
    }
  }

  /* ------------------------------------------------ menu grouping */
  const SIZE_CATS = ['meat', 'chicken', 'drinks'];
  function sizeOf(m) {
    if (m.id === 'chicken-h') return SIZES['chicken-h'];
    const suf = m.id.split('-').pop();
    return SIZES[suf];
  }
  function cards() {
    const out = []; const seen = {};
    MENU.forEach(m => {
      if (SIZE_CATS.includes(m.cat) && GROUPS[m.img]) {
        const key = m.cat + ':' + m.img;
        if (!seen[key]) { seen[key] = { key, cat: m.cat, img: m.img, title: GROUPS[m.img], items: [], feat: false }; out.push(seen[key]); }
        seen[key].items.push(m); if (m.feat) seen[key].feat = true;
      } else {
        out.push({ key: m.id, cat: m.cat, img: m.img, title: { ar: m.ar, en: m.en }, items: [m], feat: m.feat });
      }
    });
    return out;
  }
  const CARDS = cards();
  const CARD_BY_KEY = Object.fromEntries(CARDS.map(c => [c.key, c]));
  let activeCat = 'all', query = '';

  function buildTabs() {
    const tabs = $('#tabs');
    const all = `<button class="tab ${activeCat === 'all' ? 'on' : ''}" data-cat="all">${t('menu.all')} <small>${MENU.length}</small></button>`;
    tabs.innerHTML = all + CATS.map(c => `<button class="tab ${activeCat === c.id ? 'on' : ''}" data-cat="${c.id}">${lang === 'ar' ? c.ar : c.en} <small>${MENU.filter(m => m.cat === c.id).length}</small></button>`).join('');
  }
  function cardHTML(c) {
    const prices = c.items.map(i => i.price);
    const min = Math.min(...prices);
    const multi = c.items.length > 1;
    const sizes = multi ? `<div class="m-sizes">${c.items.map(i => `<span>${(sizeOf(i) || {})[lang] || nm(i)}</span>`).join('')}</div>` : '';
    return `<article class="m-card" data-card="${c.key}" tabindex="0">
      ${c.feat ? `<span class="m-badge">${t('menu.feat')}</span>` : ''}
      <div class="m-img"><img src="${imgSrc(c.img)}" alt="${c.title[lang]}" loading="lazy"></div>
      <div class="m-info">
        <h4>${c.title[lang]}</h4>${sizes}
        <div class="m-row">
          <span class="m-price">${multi ? `<small>${t('menu.from')}</small>` : ''}${fmt(min)}<em>${t('cur')}</em></span>
          <button class="m-add" data-quick="${c.key}" aria-label="add">+</button>
        </div>
      </div>
    </article>`;
  }
  function renderMenu() {
    const body = $('#menuBody');
    const q = query.trim().toLowerCase();
    const match = c => !q || c.title.ar.includes(q) || c.title.en.toLowerCase().includes(q) || c.items.some(i => i.ar.includes(q) || i.en.toLowerCase().includes(q));
    let html = '';
    CATS.forEach(cat => {
      if (activeCat !== 'all' && activeCat !== cat.id) return;
      const list = CARDS.filter(c => c.cat === cat.id && match(c));
      if (!list.length) return;
      html += `<div class="m-cat" id="cat-${cat.id}">
        <div class="m-cat-head"><h3>${lang === 'ar' ? cat.ar : cat.en}</h3><span>${MENU.filter(m => m.cat === cat.id).length}</span></div>
        <div class="m-grid">${list.map(cardHTML).join('')}</div></div>`;
    });
    body.innerHTML = html || `<p class="m-empty">${t('menu.none')}</p>`;
    if (window.gsap && !reduce) {
      gsap.fromTo($$('.m-card', body), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .025, ease: 'power3.out', overwrite: true });
    }
  }
  function wireMenu() {
    $('#tabs').addEventListener('click', e => {
      const b = e.target.closest('.tab'); if (!b) return;
      activeCat = b.dataset.cat; buildTabs(); renderMenu();
      const top = $('#menu').getBoundingClientRect().top + scrollY + 120;
      if (scrollY > top + 40 || scrollY < top - 400) scrollToY(top);
      ScrollTrigger && ScrollTrigger.refresh();
    });
    $('#search').addEventListener('input', e => { query = e.target.value; renderMenu(); });
    $('#menuBody').addEventListener('click', e => {
      const q = e.target.closest('[data-quick]');
      if (q) { e.stopPropagation(); const c = CARD_BY_KEY[q.dataset.quick]; if (c.items.length > 1) openSheet(c); else { addToCart(c.items[0].id, 1); flyTo(q.closest('.m-card').querySelector('img')); } return; }
      const card = e.target.closest('.m-card'); if (card) openSheet(CARD_BY_KEY[card.dataset.card]);
    });
    $('#menuBody').addEventListener('keydown', e => { if (e.key === 'Enter') { const card = e.target.closest('.m-card'); if (card) openSheet(CARD_BY_KEY[card.dataset.card]); } });
  }

  /* ------------------------------------------------ signature */
  const SIG = ['kebab-1', 'fillet-1', 'chops-1', 'chicken-w', 'shish-1', 'mos-1', 'kunafa'];
  function buildSig() {
    $('#sigTrack').innerHTML = SIG.map((id, i) => {
      const m = BY_ID[id];
      return `<article class="sig-card">
        <span class="sig-n">${String(i + 1).padStart(2, '0')}</span>
        <div class="sig-img"><img src="${imgSrc(m.img)}" alt="${nm(m)}" loading="lazy"></div>
        <h3>${nm(m)}</h3>
        <div class="sig-row"><b>${fmt(m.price)}<em>${t('cur')}</em></b><button class="plus" data-add="${id}" aria-label="add">+</button></div>
      </article>`;
    }).join('');
  }

  /* ------------------------------------------------ sheet */
  let sheetCard = null, sheetSel = null, sheetQty = 1;
  function openSheet(c) {
    sheetCard = c; sheetSel = c.items[0].id; sheetQty = 1;
    $('#shImg').src = imgSrc(c.img); $('#shImg').alt = c.title[lang];
    const cat = CATS.find(x => x.id === c.cat);
    $('#shCat').textContent = lang === 'ar' ? cat.ar : cat.en;
    $('#shName').textContent = c.title[lang];
    const sz = $('#shSizes');
    if (c.items.length > 1) {
      sz.style.display = '';
      sz.innerHTML = c.items.map((i, k) => `<button class="size ${k === 0 ? 'on' : ''}" data-id="${i.id}"><span>${nm(i)}</span><b>${fmt(i.price)}</b></button>`).join('');
    } else { sz.style.display = 'none'; sz.innerHTML = ''; }
    updSheet();
    $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false');
    lenis && lenis.stop();
    if (window.gsap && !reduce) gsap.fromTo('#shImg', { rotate: -40, scale: .7, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: .9, ease: 'expo.out' });
  }
  function updSheet() {
    $('#shQty').textContent = sheetQty;
    $('#shPrice').textContent = fmt(BY_ID[sheetSel].price * sheetQty) + ' ' + t('cur');
  }
  function closeAll() {
    $$('.drawer,.sheet').forEach(d => { d.classList.remove('open'); d.setAttribute('aria-hidden', 'true'); });
    lenis && lenis.start();
  }
  function wireSheet() {
    $('#shSizes').addEventListener('click', e => {
      const b = e.target.closest('.size'); if (!b) return;
      $$('.size').forEach(x => x.classList.toggle('on', x === b)); sheetSel = b.dataset.id; updSheet();
    });
    $('#shMinus').onclick = () => { sheetQty = Math.max(1, sheetQty - 1); updSheet(); };
    $('#shPlus').onclick = () => { sheetQty++; updSheet(); };
    $('#shAdd').onclick = () => { addToCart(sheetSel, sheetQty); flyTo($('#shImg')); closeAll(); };
    $$('[data-close]').forEach(el => el.addEventListener('click', closeAll));
    addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  }

  /* ------------------------------------------------ cart */
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('sh-cart') || '{}') || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(k => { if (!BY_ID[k]) delete cart[k]; });
  let orderType = 'delivery';
  const save = () => { try { localStorage.setItem('sh-cart', JSON.stringify(cart)); } catch (e) {} };
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(cart).reduce((a, [k, q]) => a + BY_ID[k].price * q, 0);

  function addToCart(id, q) {
    cart[id] = (cart[id] || 0) + q; save(); renderCart();
    toast(t('cart.added') + ' · ' + nm(BY_ID[id]));
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  function renderCart() {
    const n = count();
    $('#cartCount').textContent = n; $('#cartBtn').classList.toggle('has', n > 0);
    $('#cartBarCount').textContent = n; $('#cartBarTotal').textContent = fmt(total()) + ' ' + t('cur');
    $('#cartBar').classList.toggle('show', n > 0);
    const box = $('#cartItems');
    if (!n) { box.innerHTML = `<div class="c-empty"><img src="assets/img/logo.webp" alt="">${t('cart.empty')}</div>`; }
    else box.innerHTML = Object.entries(cart).map(([k, q]) => {
      const m = BY_ID[k];
      return `<div class="c-item"><img src="${imgSrc(m.img)}" alt=""><div><h5>${nm(m)}</h5><small>${fmt(m.price * q)}</small></div>
        <div class="qty"><button data-dec="${k}">−</button><b>${q}</b><button data-inc="${k}">+</button></div></div>`;
    }).join('');
    $('#cartTotal').textContent = fmt(total()) + ' ' + t('cur');
    $('#sendOrder').disabled = !n;
    $('#cAddr').style.display = orderType === 'delivery' ? '' : 'none';
  }
  function openCart() { $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false'); lenis && lenis.stop(); }
  function wireCart() {
    $('#cartBtn').onclick = openCart; $('#cartBar').onclick = openCart;
    $('#cartItems').addEventListener('click', e => {
      const i = e.target.dataset.inc, d = e.target.dataset.dec;
      if (i) cart[i]++;
      if (d) { cart[d]--; if (cart[d] <= 0) delete cart[d]; }
      if (i || d) { save(); renderCart(); }
    });
    $('#orderType').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      orderType = b.dataset.type; $$('#orderType button').forEach(x => x.classList.toggle('on', x === b)); renderCart();
    });
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-add]'); if (!a) return;
      addToCart(a.dataset.add, 1);
      const img = a.closest('.sig-card, .scene-pin')?.querySelector('img, canvas'); if (img) flyTo(img);
    });
    $('#sendOrder').onclick = () => {
      if (!count()) return;
      const L = [t('wa.order'), ''];
      Object.entries(cart).forEach(([k, q]) => { const m = BY_ID[k]; L.push(`• ${q} × ${nm(m)}  =  ${fmt(m.price * q)} ${t('cur')}`); });
      L.push('', `${t('wa.total')}: ${fmt(total())} ${t('cur')} ${t('wa.tax')}`);
      L.push(`${t('wa.type')}: ${t(orderType === 'delivery' ? 'cart.delivery' : 'cart.pickup')}`);
      const name = $('#cName').value.trim(), addr = $('#cAddr').value.trim(), note = $('#cNote').value.trim();
      if (name) L.push(`${t('wa.name')}: ${name}`);
      if (addr && orderType === 'delivery') L.push(`${t('wa.addr')}: ${addr}`);
      if (note) L.push(`${t('wa.note')}: ${note}`);
      window.open(wa(L.join('\n')), '_blank');
    };
  }
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 1800); }
  function flyTo(src) {
    if (!src || !window.gsap || reduce) return;
    const r = src.getBoundingClientRect(), tgt = (getComputedStyle($('#cartBar')).display !== 'none' ? $('#cartBar') : $('#cartBtn')).getBoundingClientRect();
    const ghost = document.createElement('img');
    ghost.src = src.tagName === 'IMG' ? src.src : imgSrc('kebab');
    Object.assign(ghost.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: Math.min(r.width, 220) + 'px', zIndex: 170, pointerEvents: 'none' });
    document.body.appendChild(ghost);
    gsap.to(ghost, { left: tgt.left + tgt.width / 2 - 20, top: tgt.top + tgt.height / 2 - 20, width: 40, rotate: 360, opacity: .2, duration: .8, ease: 'power3.in', onComplete: () => ghost.remove() });
  }

  /* ------------------------------------------------ embers */
  function embers(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'); let W, H, dpr, parts = [], run = true;
    const N = opts.n || (innerWidth < 800 ? 45 : 90);
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const spawn = (y) => ({ x: Math.random() * W, y: y ?? H + 10, r: Math.random() * 2.2 + .6, vy: -(Math.random() * 1.1 + .35), vx: (Math.random() - .5) * .5, life: Math.random() * .6 + .4, ph: Math.random() * 6.28, hue: 18 + Math.random() * 25 });
    size(); addEventListener('resize', size);
    for (let i = 0; i < N; i++) parts.push(spawn(Math.random() * H));
    const io = new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run) loop(); });
    io.observe(canvas);
    function loop() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      parts.forEach((p, i) => {
        p.ph += .03; p.x += p.vx + Math.sin(p.ph) * .35; p.y += p.vy;
        const a = Math.max(0, Math.min(1, p.y / H)) * p.life;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue},100%,70%,${a})`); g.addColorStop(1, `hsla(${p.hue},100%,50%,0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.28); ctx.fill();
        if (p.y < -20) parts[i] = spawn();
      });
      requestAnimationFrame(loop);
    }
    if (!reduce) loop();
    return { stop() { run = false; io.disconnect(); } };
  }

  /* ------------------------------------------------ frame sequences */
  const seqs = {};
  function loadSeq(name, n) {
    if (seqs[name]) return seqs[name];
    const s = { imgs: [], loaded: 0, n };
    for (let i = 1; i <= n; i++) {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => { s.loaded++; s.onload && s.onload(i - 1); };
      im.src = `assets/seq/${name}/${String(i).padStart(2, '0')}.webp`;
      s.imgs.push(im);
    }
    return (seqs[name] = s);
  }
  function drawFrame(canvas, s, idx) {
    let im = s.imgs[idx];
    if (!im || !im.complete || !im.naturalWidth) { // nearest loaded frame
      for (let d = 1; d < s.n; d++) { const a = s.imgs[idx - d], b = s.imgs[idx + d]; if (a && a.complete && a.naturalWidth) { im = a; break; } if (b && b.complete && b.naturalWidth) { im = b; break; } }
    }
    if (!im || !im.naturalWidth) return;
    const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const ctx = canvas.getContext('2d');
    ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  }

  /* ------------------------------------------------ smooth scroll */
  let lenis = null;
  function scrollToY(y) { if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: 'smooth' }); }

  function motion() {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    }
    // anchor links
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return; const el = $(id); if (!el) return;
      e.preventDefault(); document.body.classList.remove('nav-open'); scrollToY(id === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - 70);
    }));

    // header state
    let lastY = 0;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
      const y = self.scroll(); const h = $('#hdr');
      h.classList.toggle('scrolled', y > 40);
      h.classList.toggle('hide', y > 600 && y > lastY && !document.body.classList.contains('nav-open'));
      lastY = y;
    } });

    // hero parallax
    gsap.to('.hero-stage', { yPercent: 18, scale: .92, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy', { yPercent: -12, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.orbit-a', { y: -30, rotate: 25, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.orbit-b', { y: 24, rotate: -20, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.orbit-c', { y: -18, rotate: 30, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    // headings reveal
    $$('.sec-title, .story-big, .eyebrow, .menu-lead, .story-p, .visit-lead, .band-copy > *').forEach(el => {
      gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.from('.pillar', { y: 80, opacity: 0, rotate: lang === 'ar' ? -3 : 3, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.pillars', start: 'top 80%' } });
    gsap.from('.band-dish', { xPercent: lang === 'ar' ? 40 : -40, rotate: -90, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.band', start: 'top 75%' } });
    gsap.to('.band-dish', { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.visit-map', { clipPath: 'inset(0 0 100% 0 round 30px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.visit-map', start: 'top 80%' } });
    gsap.from('.visit-list li', { y: 30, opacity: 0, stagger: .1, duration: .8, scrollTrigger: { trigger: '.visit-list', start: 'top 85%' } });

    // build scenes
    $$('.scene').forEach(sc => {
      const name = sc.dataset.seq, n = +sc.dataset.frames;
      const canvas = $('.scene-canvas', sc), steps = $$('.steps li', sc), bar = $('.scene-progress span', sc), ring = $('.scene-ring', sc);
      const s = loadSeq(name, n);
      let cur = 0;
      s.onload = i => { if (i === 0 || i === cur) drawFrame(canvas, s, cur); };
      gsap.set($('.scene-copy', sc).children, { opacity: 0, y: 40 });
      ScrollTrigger.create({
        trigger: sc, start: 'top top', end: 'bottom bottom', scrub: true,
        onEnter: () => gsap.to($('.scene-copy', sc).children, { opacity: 1, y: 0, stagger: .08, duration: .8, ease: 'power3.out' }),
        onUpdate: self => {
          const p = self.progress;
          const f = Math.min(n - 1, Math.floor(gsap.utils.clamp(0, 1, (p - .05) / .8) * n));
          if (f !== cur) { cur = f; requestAnimationFrame(() => drawFrame(canvas, s, cur)); }
          steps.forEach((li, i) => li.classList.toggle('on', p > .08 + i * .2));
          bar.style.transform = `scaleX(${p})`;
          ring.style.setProperty('--rot', (p * 360) + 'deg');
        }
      });
      gsap.fromTo($('.scene-media', sc), { scale: .75, rotate: -20 }, { scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: sc, start: 'top bottom', end: 'top top', scrub: true } });
      addEventListener('resize', () => drawFrame(canvas, s, cur));
    });

    // signature horizontal scroll
    const mm = gsap.matchMedia();
    mm.add('(min-width: 0px)', () => {
      const track = $('#sigTrack');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tw = gsap.to(track, { x: () => (lang === 'ar' ? dist() : -dist()), ease: 'none',
        scrollTrigger: { trigger: '.sig', start: 'top top', end: () => '+=' + dist(), pin: '.sig-pin', scrub: 1, invalidateOnRefresh: true } });
      $$('.sig-card').forEach(card => {
        gsap.from($('.sig-img img', card), { rotate: -120, scale: .5, opacity: 0, ease: 'power2.out',
          scrollTrigger: { trigger: card, containerAnimation: tw, start: lang === 'ar' ? 'right 5%' : 'left 95%', end: lang === 'ar' ? 'right 45%' : 'left 55%', scrub: true, horizontal: true } });
      });
      return () => {};
    });

    // keep the floating WhatsApp button out of the way in pinned scenes
    ['#build', '#signature'].forEach(sel => ScrollTrigger.create({ trigger: sel, start: 'top 60%', end: 'bottom 40%', onToggle: st => $('.fab-wa').classList.toggle('away', st.isActive) }));

    // active nav
    ['build', 'signature', 'menu', 'story', 'visit'].forEach(id => {
      ScrollTrigger.create({ trigger: '#' + id, start: 'top 50%', end: 'bottom 50%', onToggle: s => { const a = $(`.hdr-nav a[href="#${id}"]`); a && a.classList.toggle('on', s.isActive); } });
    });
  }

  /* ------------------------------------------------ loader */
  function intro() {
    const sp = embers($('#loaderSparks'), { n: 70 });
    const logo = $('.loader-logo');
    // preload: first frames of each scene + key images
    const urls = ['assets/img/dish/kebab.webp', 'assets/img/dish/chops.webp', 'assets/img/dish/shish.webp', 'assets/img/logo.webp'];
    $$('.scene').forEach(sc => urls.push(`assets/seq/${sc.dataset.seq}/01.webp`));
    let done = 0; const total = urls.length; const st = { v: 0 };
    const tick = () => { const v = Math.round(st.v); $('#loaderNum').textContent = v; $('#loaderBar').style.width = v + '%'; };
    if (window.gsap) gsap.to(logo, { opacity: 1, scale: 1, duration: 1, ease: 'expo.out' }); else logo.style.opacity = 1;
    const finish = () => {
      if (finish.d) return; finish.d = true;
      const end = () => {
        sp.stop(); $('#loader').remove(); document.body.classList.remove('is-loading');
        if (window.gsap) {
          gsap.from('.hero-title .ht-ar', { yPercent: 60, opacity: 0, filter: 'blur(20px)', duration: 1.4, ease: 'expo.out' });
          gsap.from(['.hero .eyebrow', '.ht-en', '.hero-sub', '.hero-ctas', '.hero-facts li'], { y: 30, opacity: 0, stagger: .08, duration: 1, delay: .2, ease: 'power3.out' });
          gsap.from('.hero-plate', { scale: .3, rotate: -200, opacity: 0, duration: 1.8, ease: 'expo.out' });
          gsap.from('.orbit, .price-tag', { scale: 0, opacity: 0, stagger: .12, duration: 1, delay: .6, ease: 'back.out(1.6)' });
          document.body.classList.add('ready');
          ScrollTrigger.refresh();
        }
      };
      if (window.gsap) gsap.to('#loader', { clipPath: 'circle(0% at 50% 50%)', duration: 1, ease: 'expo.inOut', onComplete: end, delay: .15 }); else end();
    };
    urls.forEach(u => { const im = new Image(); im.onload = im.onerror = () => { done++; if (window.gsap) gsap.to(st, { v: done / total * 100, duration: .4, onUpdate: tick, onComplete: () => done === total && finish() }); else if (done === total) finish(); }; im.src = u; });
    setTimeout(finish, 6000);
  }

  /* ------------------------------------------------ init */
  function init() {
    wireContacts();
    applyLang();
    wireMenu(); wireSheet(); wireCart();
    $('#langBtn').onclick = () => {
      lang = lang === 'ar' ? 'en' : 'ar';
      try { localStorage.setItem('sh-lang', lang); } catch (e) {}
      // rebuild direction-dependent scroll animations
      location.search = '?lang=' + lang;
    };
    $('#burger').onclick = () => document.body.classList.toggle('nav-open');
    embers($('#embers'));
    if (window.gsap && window.ScrollTrigger) motion();
    intro();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
