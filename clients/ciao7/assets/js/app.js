/* Ciao 7 Pizza — interactions (Planet) */
(() => {
  const D = window.CIAO, C = D.config;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  const isMobile = () => innerWidth <= 760;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ---------- */
  let lang = store.get('ciao-lang', 'ar');
  const T = {
    ar: { egp: 'ج.م', from: 'يبدأ من', add: 'أضف', added: 'تمت الإضافة للسلة', items: 'صنف', empty: 'السلة فاضية.. والبيتزا زعلانة', emptyCta: 'روح للمنيو', sub: 'المجموع', del: 'التوصيل', disc: 'خصم', tot: 'الإجمالي', name: 'الاسم', phone: 'الموبايل', addr: 'العنوان بالتفصيل', notes: 'ملاحظات', table: 'رقم الطاولة (اختياري)', promo: 'كود الخصم', needItems: 'أضف أصنافاً للسلة أولاً', needName: 'اكتب اسمك من فضلك', needAddr: 'اكتب العنوان للتوصيل', promoOk: 'تم تفعيل خصم {p}%', promoBad: 'الكود غير صحيح', size: 'الحجم', crust: 'العجينة', spinAgain: 'لفّ تاني', win: 'مبروك! وقفت على السبعة', winTxt: 'استخدم الكود في السلة لخصم {p}% على طلبك.', luck: 'الحظ اختار لك', addIt: 'أضفها للسلة', copy: 'تم نسخ الكود', bookSent: 'جاري فتح واتساب..', greet: ['Ciao!', 'أهلاً!', 'جعان؟', 'Buongiorno!', 'Mamma mia!', 'Andiamo!'], egg: 'Mamma mia! لقيت السر السابع', guests: 'أشخاص', cartMini: 'في سلتك {n} أصناف بقيمة {t}', cartMiniEmpty: 'سلتك فاضية. اختر من المنيو الأول.', occ: ['عادي', 'عيد ميلاد', 'عائلي', 'رومانسي', 'عمل'] },
    en: { egp: 'EGP', from: 'from', add: 'Add', added: 'Added to your order', items: 'items', empty: 'Your cart is empty… and the pizza is sad', emptyCta: 'Go to menu', sub: 'Subtotal', del: 'Delivery', disc: 'Discount', tot: 'Total', name: 'Name', phone: 'Mobile', addr: 'Full address', notes: 'Notes', table: 'Table no. (optional)', promo: 'Promo code', needItems: 'Add something to your cart first', needName: 'Please add your name', needAddr: 'Please add a delivery address', promoOk: '{p}% off applied', promoBad: 'Invalid code', size: 'Size', crust: 'Crust', spinAgain: 'Spin again', win: 'Lucky you! You hit the 7', winTxt: 'Use this code in the cart for {p}% off.', luck: 'Luck picked', addIt: 'Add to cart', copy: 'Code copied', bookSent: 'Opening WhatsApp…', greet: ['Ciao!', 'Hello!', 'Hungry?', 'Buongiorno!', 'Mamma mia!', 'Andiamo!'], egg: 'Mamma mia! You found the 7th secret', guests: 'guests', cartMini: '{n} items in your cart, {t}', cartMiniEmpty: 'Your cart is empty. Pick from the menu first.', occ: ['Casual', 'Birthday', 'Family', 'Romantic', 'Business'] }
  };
  const t = (k, v = {}) => String(T[lang][k]).replace(/\{(\w+)\}/g, (_, x) => v[x]);
  const L = o => o[lang] ?? o.ar;
  const nm = it => lang === 'ar' ? it.ar : it.en;
  const ds = it => lang === 'ar' ? it.dAr : it.dEn;
  const money = n => `${Math.round(n).toLocaleString('en-US')} ${t('egp')}`;
  const wa = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    store.set('ciao-lang', lang);
    renderDynamic();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  /* ---------- static fills ---------- */
  function fillInfo() {
    $('#infoHours').textContent = lang === 'ar' ? C.hoursAr : C.hoursEn;
    $('#infoAddr').textContent = lang === 'ar' ? C.addressAr : C.addressEn;
    const tel = `tel:${C.phoneIntl}`;
    [$('#infoPhone'), $('#footPhone')].forEach(a => { a.href = tel; a.textContent = C.phone; a.style.direction = 'ltr'; });
    $('#footAddr').textContent = lang === 'ar' ? C.addressAr : C.addressEn;
    $('#footHours').textContent = lang === 'ar' ? C.hoursAr : C.hoursEn;
    const hi = lang === 'ar' ? 'أهلاً تشاو 7! عندي سؤال' : 'Ciao 7! I have a question';
    $('#footWa').href = wa(hi); $('#fabWa').href = wa(hi);
    $('#year').textContent = new Date().getFullYear();
    $('#socials').innerHTML = [
      ['instagram', '<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm6-1.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" fill="currentColor"/>'],
      ['facebook', '<path d="M14 9V7c0-.8.5-1 1-1h2V2h-3c-3 0-4 2-4 4.5V9H7v4h3v9h4v-9h3l.5-4H14Z" fill="currentColor"/>'],
      ['tiktok', '<path d="M16 2c.3 2.4 1.8 4 4 4.2v3.5c-1.5 0-2.9-.4-4-1.2v6.7A6.2 6.2 0 1 1 9.8 9v3.6a2.7 2.7 0 1 0 2.7 2.7V2H16Z" fill="currentColor"/>']
    ].map(([k, p]) => `<a href="${C[k]}" aria-label="${k}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24">${p}</svg></a>`).join('');
    $('#footCats').innerHTML = D.cats.map(c => `<a href="#menu" data-goto-cat="${c.id}">${L(c)}</a>`).join('');
  }

  /* ---------- helpers ---------- */
  const byId = new Map(D.menu.map(i => [i.id, i]));
  D.offers.forEach(o => byId.set(o.id, { ...o, c: 'offer', dAr: o.dAr, dEn: o.dEn }));
  const catOf = id => D.cats.find(c => c.id === id);
  const basePrice = it => it.ps ? it.ps[0] : it.p;
  let toastT;
  function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

  /* ======================================================
     LOADER + HERO LOGO ASSEMBLY
     ====================================================== */
  const LAYERS = { seven: [105, 470, 453, 936], word: [315, 412, 1164, 961], slice: [633, 184, 981, 505], sliceR: [711, 398, 996, 505], sliceL: [375, 235, 639, 505], base: [450, 839, 861, 1048], ring: [314, 202, 1143, 1005], all: [105, 184, 1164, 1048] };
  let introDone = false, heroP = 0;
  function syncAll() { const a = $('.lp[data-k="all"]'); if (a) a.classList.toggle('is-on', introDone && heroP < 0.012); }
  function placeLayers() {
    $$('.lp').forEach(el => {
      const b = LAYERS[el.dataset.k]; const S = 1254;
      Object.assign(el.style, { left: b[0] / S * 100 + '%', top: b[1] / S * 100 + '%', width: (b[2] - b[0]) / S * 100 + '%' });
    });
  }

  function loadImg(src) { return new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(i); i.src = src; }); }

  async function boot() {
    placeLayers();
    fillInfo();
    renderAll();
    const bar = $('#loadBar');
    const crit = [...$$('.lp img').map(i => i.src), 'assets/seq/pizza/01.webp'];
    let done = 0;
    await Promise.all(crit.map(s => loadImg(s).then(() => { done++; bar.style.width = (done / crit.length * 100) + '%'; })));
    if (document.fonts && document.fonts.ready) await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
    initScroll();
    $('#loader').classList.add('is-done');
    document.body.classList.remove('is-loading');
    intro();
  }

  function intro() {
    const g = gsap; const im = k => $(`.lp[data-k="${k}"] img`);
    if (reduce) { introDone = true; syncAll(); g.set('.hero__copy>*', { opacity: 1, y: 0 }); g.set('#bubble', { scale: 1, rotate: 0 }); return; }
    const tl = g.timeline({ delay: .15 });
    tl.from(im('ring'), { scale: 0, rotate: -200, opacity: 0, duration: 1.1, ease: 'expo.out', transformOrigin: '50% 50%' })
      .from(im('sliceL'), { x: -380, y: -260, rotate: -140, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, .15)
      .from(im('sliceR'), { x: 380, y: -160, rotate: 160, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, .25)
      .from(im('slice'), { y: -620, rotate: 70, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' }, .35)
      .from(im('word'), { scale: .2, y: 160, opacity: 0, duration: .9, ease: 'back.out(1.7)' }, .7)
      .from(im('seven'), { y: -900, rotate: -40, duration: 1.15, ease: 'bounce.out' }, .85)
      .from(im('base'), { y: 220, opacity: 0, duration: .8, ease: 'expo.out' }, 1.1)
      .to('#bubble', { scale: 1, rotate: -4, duration: .7, ease: 'back.out(3)' }, 1.7)
      .to('.hero__copy>*', { opacity: 1, y: 0, duration: .9, stagger: .12, ease: 'expo.out' }, 1.3)
      .add(() => {
        introDone = true; syncAll();
        g.to('#logoStage', { y: -10, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        g.to('#bubble', { y: -6, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      });
    floaters();
  }

  function floaters() {
    const wrap = $('#floaters');
    const shapes = [
      '<svg viewBox="-12 -12 24 24" width="34"><circle r="10" fill="#b3261e"/><circle cx="-3" cy="-2" r="1.5" fill="#7d1510"/><circle cx="3" cy="3" r="1.3" fill="#7d1510"/></svg>',
      '<svg viewBox="-12 -12 24 24" width="38"><path d="M0 -10 C8 -4 8 5 0 10 C-8 5 -8 -4 0 -10Z" fill="#2f7d32"/><path d="M0 -9 V9" stroke="#1f5a22" stroke-width="1"/></svg>',
      '<svg viewBox="-12 -12 24 24" width="30"><circle r="9" fill="#e2412b"/><circle r="5.5" fill="#f06a4f"/><circle cx="-2" cy="-1" r="1.2" fill="#f6d34f"/><circle cx="2" cy="2" r="1.2" fill="#f6d34f"/></svg>',
      '<svg viewBox="-12 -12 24 24" width="30"><path d="M-9 2 Q0 -12 9 2 Z" fill="#e6d6b8"/><rect x="-3" y="1" width="6" height="7" rx="2" fill="#d8c4a0"/></svg>',
      '<svg viewBox="-12 -12 24 24" width="26"><rect x="-7" y="-7" width="14" height="14" rx="3" fill="#f6c453"/><circle cx="-2" cy="-1" r="1.6" fill="#e0a52d"/></svg>',
      '<svg viewBox="-12 -12 24 24" width="24"><circle r="6" fill="none" stroke="#1d1a17" stroke-width="4"/></svg>'
    ];
    const n = isMobile() ? 6 : 16, items = [];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div'); el.className = 'floater';
      el.innerHTML = shapes[i % shapes.length];
      const depth = .3 + Math.random() * 1.2;
      el.style.left = (Math.random() * 96) + '%'; el.style.top = (8 + Math.random() * 84) + '%';
      el.style.opacity = (.35 + depth * .35).toFixed(2); el.style.transform = `scale(${depth})`;
      wrap.appendChild(el); items.push({ el, depth });
      gsap.fromTo(el, { scale: 0 }, { scale: depth, duration: .8, delay: 1.2 + i * .05, ease: 'back.out(2)' });
      gsap.to(el.firstChild, { y: `random(-24,24)`, x: `random(-14,14)`, rotate: `random(-60,60)`, duration: `random(3,6)`, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
    if (!isMobile()) {
      const qs = items.map(o => ({ x: gsap.quickTo(o.el, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(o.el, 'y', { duration: 1.2, ease: 'power3' }), d: o.depth }));
      addEventListener('pointermove', e => {
        const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
        qs.forEach(q => { q.x(-dx * 60 * q.d); q.y(-dy * 50 * q.d); });
      });
    }
  }

  /* hero bubble + 7 easter egg */
  let gi = 0, sevenClicks = 0, sevenT;
  function bindHeroFun() {
    $('#bubble').addEventListener('click', () => {
      gi = (gi + 1) % T[lang].greet.length; const b = $('#bubble'); b.textContent = T[lang].greet[gi];
      gsap.fromTo(b, { scale: .6, rotate: -14 }, { scale: 1, rotate: -4, duration: .6, ease: 'back.out(3)' });
    });
    const seven = $('.lp[data-k="seven"]');
    seven.addEventListener('click', () => {
      const al = $('.lp[data-k="all"]'); al.classList.add('is-hold'); clearTimeout(al._t); al._t = setTimeout(() => al.classList.remove('is-hold'), 700);
      gsap.fromTo(seven.firstElementChild, { rotate: -14, scale: 1.1 }, { rotate: 0, scale: 1, duration: .6, ease: 'elastic.out(1,.4)' });
      sevenClicks++; clearTimeout(sevenT); sevenT = setTimeout(() => sevenClicks = 0, 2500);
      if (sevenClicks >= 7) { sevenClicks = 0; pizzaRain(); toast(t('egg')); }
    });
    $('#footLogo').addEventListener('click', pizzaRain);
  }
  function pizzaRain() {
    if (reduce) return;
    const r = $('#rain');
    for (let i = 0; i < 28; i++) {
      const d = document.createElement('div'); d.className = 'drop';
      d.innerHTML = `<svg viewBox="0 0 60 60" width="${30 + Math.random() * 30}"><path d="M30 56 L6 10 Q30 0 54 10 Z" fill="#f6c453" stroke="#d9893b" stroke-width="5" stroke-linejoin="round"/><circle cx="24" cy="20" r="5" fill="#b3261e"/><circle cx="36" cy="28" r="5" fill="#b3261e"/><circle cx="29" cy="40" r="4" fill="#b3261e"/></svg>`;
      d.style.left = Math.random() * 100 + '%'; r.appendChild(d);
      gsap.to(d, { y: innerHeight + 160, rotate: `random(-360,360)`, duration: `random(1.6,3.2)`, delay: Math.random() * .8, ease: 'power1.in', onComplete: () => d.remove() });
    }
  }

  /* ======================================================
     SCROLL: Lenis + scenes
     ====================================================== */
  let lenis;
  function initScroll() {
    gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.Lenis && !reduce) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    heroScroll();
    $$('.scene').forEach(makeScene);
    setteScroll();
    navSpy();
    goodIn();
  }
  function goTo(sel, offset = 0) {
    const el = typeof sel === 'string' ? $(sel) : sel; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' });
  }

  function heroScroll() {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: .6, onUpdate: self => { heroP = self.progress; syncAll(); } } });
    const lp = k => `.lp[data-k="${k}"]`;
    tl.to('#heroCopy', { opacity: 0, y: -80, duration: .4 }, .05)
      .to('.scroll-hint', { opacity: 0, duration: .1 }, 0)
      .to('#bubble', { scale: 0, duration: .2 }, .05)
      .to(lp('seven'), { xPercent: -140, yPercent: 30, rotate: -35, duration: 1 }, .1)
      .to(lp('word'), { xPercent: 40, yPercent: 60, rotate: 8, duration: 1 }, .1)
      .to(lp('slice'), { xPercent: 90, yPercent: -150, rotate: 40, duration: 1 }, .1)
      .to(lp('sliceL'), { xPercent: -170, yPercent: -140, rotate: -60, duration: 1 }, .1)
      .to(lp('sliceR'), { xPercent: 200, yPercent: -40, rotate: 70, duration: 1 }, .1)
      .to(lp('base'), { yPercent: 160, duration: 1 }, .1)
      .to(lp('ring'), { scale: 1.6, opacity: 0, duration: 1 }, .1)
      .to('.hero__ring', { opacity: 0, scale: 1.4, duration: .8 }, .1)
      .to('#heroLogo', { scale: isMobile() ? 1.05 : 1.15, duration: 1 }, .1)
      .to('.hero__stage', { opacity: 0, duration: .3 }, .85);
  }

  function makeScene(sec) {
    const n = +sec.dataset.n, dir = sec.dataset.seq, fx = +sec.dataset.fx || .5;
    const cv = $('.scene__cv', sec), ctx = cv.getContext('2d');
    const frames = new Array(n); let loaded = false, last = -1, lastKey = -1, lastW = 0, lastH = 0;
    const steps = $$('.step', sec), word = $('.scene__word', sec), bar = $('.scene__progress i', sec);
    function load() {
      if (loaded) return; loaded = true;
      for (let i = 0; i < n; i++) {
        const im = new Image(); im.decoding = 'async';
        im.onload = () => { frames[i] = im; if (i === 0 || Math.abs(i - last) < 2) { lastKey = -1; draw(state.p); } };
        im.src = `assets/seq/${dir}/${String(i + 1).padStart(2, '0')}.webp`;
      }
    }
    function size() {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (w === lastW && Math.abs(h - lastH) < 160 && cv.width) return; // ignore mobile URL-bar resizes
      lastW = w; lastH = h;
      const dpr = Math.min(devicePixelRatio || 1, isMobile() ? 1.5 : 2);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); lastKey = -1; draw(state.p);
    }
    function cover(im, alpha) {
      const W = cv.width, H = cv.height, iw = im.naturalWidth, ih = im.naturalHeight;
      const s = Math.max(W / iw, H / ih) * (isMobile() ? 1.05 : 1.02);
      const dw = iw * s, dh = ih * s;
      let dx = (W - dw) / 2;
      // keep the food in view: on wide screens push it away from the text, on phones centre the focal point
      if (isMobile()) dx = clamp(W / 2 - fx * dw, W - dw, 0);
      else dx = clamp(W * .36 - fx * dw, W - dw, 0);
      const dy = isMobile() ? (H - dh) * .3 : (H - dh) / 2;
      ctx.globalAlpha = alpha; ctx.drawImage(im, dx, dy, dw, dh); ctx.globalAlpha = 1;
    }
    const state = { p: 0 };
    function draw(p) {
      const fp = clamp(p * 1.08) * (n - 1), i = Math.floor(fp), f = fp - i;
      const a = frames[i] || frames.slice(0, i + 1).reverse().find(Boolean);
      if (!a) return;
      const key = i * 16 + Math.round(f * 12) + (frames[i + 1] ? 0 : 1000);
      if (key === lastKey) return; lastKey = key;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
      cover(a, 1);
      const b = frames[i + 1]; if (b && f > .02) cover(b, f);
      last = i;
    }
    function render(p) {
      state.p = p; draw(p);
      const k = steps.length;
      steps.forEach((s, i) => {
        const a = i / k, b = (i + 1) / k;
        let o;
        if (i === 0) o = p < b - .06 ? 1 : 1 - clamp((p - (b - .06)) / .06);
        else if (i === k - 1) o = clamp((p - a) / .07);
        else o = Math.min(clamp((p - a) / .07), 1 - clamp((p - (b - .06)) / .06));
        const y = (1 - o) * (p < a + .05 ? 40 : -30);
        s.style.opacity = o; s.style.transform = `translateY(${y}px)`; s.classList.toggle('on', o > .5);
      });
      if (word) word.style.transform = `translateX(${(p - .5) * -18}vw)`;
      if (bar) bar.style.transform = `scaleX(${p})`;
    }
    ScrollTrigger.create({ trigger: sec, start: 'top 400%', onEnter: load, onEnterBack: load });
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: s => render(s.progress), onRefresh: s => render(s.progress) });
    addEventListener('resize', size);
    requestAnimationFrame(size);
    if (dir === 'pizza') load();
    render(0);
  }

  /* ---------- 7 secrets ---------- */
  const SETTE = [
    { ar: 'دقيق إيطالي 00', en: 'Italian 00 flour', it: 'Farina 00', dAr: 'أنعم أنواع الدقيق، يمنح العجينة مرونة وخفة.', dEn: 'The finest flour for a stretchy, light dough.', ic: '<svg viewBox="0 0 80 80"><path d="M20 24 Q40 14 60 24 L64 70 H16Z" fill="#fbf1de" stroke="#0b0908" stroke-width="3"/><path d="M28 24 Q40 8 52 24" fill="none" stroke="#0b0908" stroke-width="3"/><text x="40" y="56" text-anchor="middle" font-family="Bowlby One" font-size="16" fill="#d01f25">00</text></svg>' },
    { ar: 'تخمير 48 ساعة', en: '48-hour rise', it: 'Lievitazione lenta', dAr: 'الصبر يصنع فقاعات الهواء ويجعلها أسهل في الهضم.', dEn: 'Patience makes the air bubbles and easier digestion.', ic: '<svg viewBox="0 0 80 80"><circle cx="40" cy="42" r="28" fill="#fbf1de" stroke="#0b0908" stroke-width="3"/><path d="M40 24 V42 L52 50" stroke="#d01f25" stroke-width="4" stroke-linecap="round" fill="none"/><rect x="34" y="8" width="12" height="6" rx="2" fill="#0b0908"/></svg>' },
    { ar: 'صلصة مطهية ببطء', en: 'Slow-cooked sauce', it: 'Pomodoro', dAr: 'طماطم ناضجة، ثوم، أوريجانو.. وساعات على نار هادئة.', dEn: 'Ripe tomatoes, garlic, oregano and hours on a low flame.', ic: '<svg viewBox="0 0 80 80"><circle cx="40" cy="46" r="26" fill="#d01f25" stroke="#0b0908" stroke-width="3"/><path d="M30 20 Q40 28 50 20 Q44 30 40 22 Q36 30 30 20Z" fill="#3f8a2e" stroke="#0b0908" stroke-width="2"/><circle cx="32" cy="40" r="5" fill="#fff" opacity=".35"/></svg>' },
    { ar: 'موتزاريلا حقيقية', en: 'Real mozzarella', it: 'Mozzarella', dAr: 'جبنة تذوب وتشدّ.. لا بدائل ولا تقليد.', dEn: 'Cheese that melts and stretches. No substitutes.', ic: '<svg viewBox="0 0 80 80"><path d="M12 56 L40 20 L68 56Z" fill="#f6c453" stroke="#0b0908" stroke-width="3" stroke-linejoin="round"/><circle cx="36" cy="44" r="5" fill="#e0a52d"/><circle cx="50" cy="48" r="3.5" fill="#e0a52d"/><circle cx="42" cy="32" r="3" fill="#e0a52d"/></svg>' },
    { ar: 'فرن على 400 درجة', en: 'A 400° oven', it: 'Forno', dAr: '90 ثانية فقط، تكفي لحواف منتفخة ومحمّصة.', dEn: 'Just 90 seconds for puffy, charred edges.', ic: '<svg viewBox="0 0 80 80"><path d="M40 70 C18 66 16 44 30 30 C30 42 36 44 38 40 C34 28 42 16 50 10 C48 24 64 32 62 50 C60 64 50 70 40 70Z" fill="#d01f25" stroke="#0b0908" stroke-width="3"/><path d="M40 66 C30 62 30 52 36 46 C38 52 42 52 44 48 C50 54 50 64 40 66Z" fill="#f5b83d"/></svg>' },
    { ar: 'ريحان وزيت زيتون', en: 'Basil & olive oil', it: 'Basilico', dAr: 'لمسة خضراء ورشة ذهبية في النهاية.', dEn: 'A green touch and a golden drizzle at the end.', ic: '<svg viewBox="0 0 80 80"><path d="M40 10 C62 26 62 54 40 70 C18 54 18 26 40 10Z" fill="#3f8a2e" stroke="#0b0908" stroke-width="3"/><path d="M40 16 V66 M40 34 L28 26 M40 46 L52 38" stroke="#1f5a22" stroke-width="2.5" fill="none"/></svg>' },
    { ar: 'السرّ السابع: الحب', en: 'The 7th: love', it: 'Amore', dAr: 'لا يُباع ولا يُشترى.. لكنك ستتذوقه في كل قطعة.', dEn: "Can't be bought or sold, but you'll taste it in every slice.", ic: '<svg viewBox="0 0 80 80"><path d="M40 68 C10 48 10 22 28 18 C36 16 40 24 40 26 C40 24 44 16 52 18 C70 22 70 48 40 68Z" fill="#fbf1de" stroke="#0b0908" stroke-width="3"/></svg>' }
  ];
  function renderSette() {
    $('#setteTrack').innerHTML = SETTE.map((s, i) => `<article class="sc"><div class="sc__n">${i + 1}</div><div class="sc__ic">${s.ic}</div><h3>${L(s)}</h3><p>${lang === 'ar' ? s.dAr : s.dEn}</p><span class="sc__it">${s.it}</span></article>`).join('');
  }
  function setteScroll() {
    const track = $('#setteTrack');
    if (isMobile()) return; // phones get a native swipe carousel (CSS)
    ScrollTrigger.create({
      trigger: '#sette', start: 'top top', end: 'bottom bottom',
      onUpdate: s => {
        const dist = Math.max(0, track.scrollWidth - innerWidth);
        const x = s.progress * dist * (document.dir === 'rtl' ? 1 : -1);
        track.style.transform = `translateX(${x}px)`;
      }
    });
  }

  /* ======================================================
     MENU WHEEL
     ====================================================== */
  let curCat = 'classic';
  const W = { rot: 0, pops: D.cats.map(() => 0) };
  const N = D.cats.length, SEG = 360 / N, RO = 250, RI = 230;
  const rad = d => d * Math.PI / 180;
  const pt = (r, a) => [+(Math.cos(rad(a)) * r).toFixed(2), +(Math.sin(rad(a)) * r).toFixed(2)];
  function wedge(r, a0, a1) { const [x0, y0] = pt(r, a0), [x1, y1] = pt(r, a1); return `M0 0 L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`; }
  function slicePattern(c, i, a) {
    // a: bisector angle (deg, wheel local)
    const R = (() => { let s = i * 97 + 11; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
    const pts = k => Array.from({ length: k }, () => { const aa = a - SEG / 2 + 6 + R() * (SEG - 12), rr = 60 + R() * (RI - 80); return pt(rr, aa); });
    let s = '';
    const fill = { classic: '#f6c453', special: '#f4bd4a', pasta: '#f1dfb0', feteer: '#e9a95a', sweet: '#5a2d17', starters: '#4f8f34', hot: '#5b3020', cold: '#2a9d93' }[c.id];
    s += `<path d="${wedge(RO, a - SEG / 2, a + SEG / 2)}" fill="#d9893b"/>`;
    s += `<path d="${wedge(RI, a - SEG / 2 + .6, a + SEG / 2 - .6)}" fill="${fill}"/>`;
    if (c.id === 'classic') pts(7).forEach(([x, y]) => s += `<circle cx="${x}" cy="${y}" r="14" fill="#b3261e"/><circle cx="${x - 4}" cy="${y - 3}" r="2" fill="#7d1510"/>`);
    if (c.id === 'special') pts(10).forEach(([x, y], j) => s += j % 3 === 0 ? `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#1d1a17" stroke-width="4"/>` : j % 3 === 1 ? `<path d="M${x - 9} ${y} q9 -10 18 0" stroke="${j % 2 ? '#3f8a2e' : '#d23a22'}" stroke-width="5" fill="none" stroke-linecap="round"/>` : `<circle cx="${x}" cy="${y}" r="10" fill="#b3261e"/>`);
    if (c.id === 'pasta') pts(9).forEach(([x, y], j) => s += `<path d="M${x - 14} ${y} q7 -12 14 0 t14 0" stroke="#e8c27a" stroke-width="5" fill="none" stroke-linecap="round" transform="rotate(${j * 40} ${x} ${y})"/>`);
    if (c.id === 'feteer') for (let k = 1; k < 6; k++) s += `<path d="${wedge(RI - k * 34, a - SEG / 2 + 1, a + SEG / 2 - 1).replace(/^M0 0 L[^A]+/, m => 'M' + m.split('L')[1])}" fill="none" stroke="#b86a28" stroke-width="2" opacity=".6"/>`;
    if (c.id === 'sweet') { pts(14).forEach(([x, y]) => s += `<circle cx="${x}" cy="${y}" r="2.4" fill="#fffaf0"/>`); pts(4).forEach(([x, y]) => s += `<path d="M${x - 16} ${y} q8 10 16 0 t16 0" stroke="#c9822b" stroke-width="4" fill="none" stroke-linecap="round"/>`); }
    if (c.id === 'starters') pts(8).forEach(([x, y], j) => s += `<path transform="translate(${x} ${y}) rotate(${j * 50})" d="M0 -14 C11 -6 11 6 0 14 C-11 6 -11 -6 0 -14Z" fill="${j % 2 ? '#86c24f' : '#a7d36a'}"/>`);
    if (c.id === 'hot') pts(9).forEach(([x, y], j) => s += `<g transform="translate(${x} ${y}) rotate(${j * 37})"><ellipse rx="9" ry="12" fill="#2b150a"/><path d="M0 -10 q-4 10 0 20" stroke="#5b3020" stroke-width="2" fill="none"/></g>`);
    if (c.id === 'cold') pts(7).forEach(([x, y], j) => s += j % 2 ? `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="4" fill="#fff" opacity=".45" transform="rotate(${j * 20} ${x} ${y})"/>` : `<circle cx="${x}" cy="${y}" r="13" fill="#f6e15a"/><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#fff6a8" stroke-width="2"/>`);
    return s;
  }
  function renderWheel() {
    const host = $('#wheel');
    let s = `<svg viewBox="-290 -290 580 580" role="group" aria-label="Menu wheel"><circle r="270" fill="#14100e" stroke="rgba(242,214,162,.14)" stroke-width="2"/><g id="wRot">`;
    D.cats.forEach((c, i) => {
      const a = -90 + i * SEG;
      const [lx, ly] = pt(158, a);
      s += `<g class="slice" data-i="${i}" data-cat="${c.id}" tabindex="0" role="button" aria-label="${L(c)}"><g class="sl-in">${slicePattern(c, i, a)}</g>
        <g class="lblg" data-x="${lx}" data-y="${ly}" transform="translate(${lx} ${ly})"><text class="lbl" text-anchor="middle" dominant-baseline="middle">${L(c)}</text></g></g>`;
    });
    s += `</g><circle r="66" fill="#0b0908" stroke="#d01f25" stroke-width="4"/><text class="wheel__center" text-anchor="middle" y="-6">Ciao 7</text><text id="wIt" text-anchor="middle" y="22" font-family="Readex Pro" font-size="13" fill="#f5b83d"></text></svg>`;
    host.innerHTML = s;
    $$('.slice', host).forEach(g => {
      const go = () => selectCat(g.dataset.cat, true);
      g.addEventListener('click', go);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    applyWheel();
  }
  function applyWheel() {
    const rot = $('#wRot'); if (!rot) return;
    rot.setAttribute('transform', `rotate(${W.rot})`);
    $$('#wheel .slice').forEach((g, i) => {
      const a = -90 + i * SEG, p = W.pops[i];
      $('.sl-in', g).setAttribute('transform', `translate(${(Math.cos(rad(a)) * p).toFixed(2)} ${(Math.sin(rad(a)) * p).toFixed(2)})`);
      const lb = $('.lblg', g); const x = +lb.dataset.x + Math.cos(rad(a)) * p, y = +lb.dataset.y + Math.sin(rad(a)) * p;
      lb.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${-W.rot})`);
    });
  }
  function targetAngle() { return innerWidth <= 1080 ? 90 : (document.dir === 'rtl' ? 180 : 0); }
  function selectCat(id, fromWheel) {
    curCat = id;
    const i = D.cats.findIndex(c => c.id === id); const c = D.cats[i];
    const bis = -90 + i * SEG;
    let want = targetAngle() - bis;
    // shortest rotation path
    let d = ((want - W.rot) % 360 + 540) % 360 - 180;
    const to = { rot: W.rot + d };
    D.cats.forEach((_, j) => to['p' + j] = j === i ? 28 : 0);
    const st = { rot: W.rot }; D.cats.forEach((_, j) => st['p' + j] = W.pops[j]);
    gsap.to(st, { ...to, duration: reduce ? 0 : 1.1, ease: 'expo.out', onUpdate: () => { W.rot = st.rot; D.cats.forEach((_, j) => W.pops[j] = st['p' + j]); applyWheel(); } });
    $('#wheel').classList.add('has-sel');
    $$('#wheel .slice').forEach(g => g.classList.toggle('sel', g.dataset.cat === id));
    const it = $('#wIt'); if (it) it.textContent = c.it;
    $$('.chip').forEach(ch => ch.classList.toggle('is-on', ch.dataset.cat === id));
    const chip = $(`.chip[data-cat="${id}"]`); if (chip && chip.scrollIntoView) chip.parentElement.scrollTo({ left: chip.offsetLeft - 40, behavior: 'smooth' });
    renderItems();
    if (fromWheel && innerWidth <= 1080) setTimeout(() => goTo('#chips', -90), 250);
  }
  function renderChips() {
    $('#chips').innerHTML = D.cats.map(c => `<button class="chip ${c.id === curCat ? 'is-on' : ''}" role="tab" data-cat="${c.id}" type="button"><i style="background:${c.color}"></i>${L(c)}</button>`).join('');
    $$('.chip').forEach(b => b.addEventListener('click', () => selectCat(b.dataset.cat)));
  }
  const TAGS = { best: { ar: 'الأكثر طلباً', en: 'Best seller' }, veg: { ar: 'نباتي', en: 'Veggie' }, sig: { ar: 'توقيعنا', en: 'Signature' }, hot: { ar: 'حار', en: 'Spicy' } };
  function glow(c) { return { classic: 'rgba(208,31,37,.3)', special: 'rgba(245,165,36,.28)', pasta: 'rgba(242,214,162,.22)', feteer: 'rgba(224,138,46,.3)', sweet: 'rgba(138,74,43,.4)', starters: 'rgba(63,138,46,.3)', hot: 'rgba(160,80,40,.35)', cold: 'rgba(47,163,154,.3)' }[c]; }
  function cardHtml(it) {
    const tag = it.tag ? `<span class="card__tag ${it.tag}">${L(TAGS[it.tag])}</span>` : '';
    const pr = it.ps ? `<span class="from">${t('from')}</span> ${it.ps[0]} <small>${t('egp')}</small>` : `${it.p} <small>${t('egp')}</small>`;
    return `<article class="card" data-id="${it.id}" style="--glow:${glow(it.c)}" tabindex="0">
      <div class="card__art">${tag}${CiaoArt(it)}</div>
      <h4>${nm(it)}</h4><div class="card__it">${it.it}</div><p>${ds(it)}</p>
      <div class="card__foot"><span class="price">${pr}</span><button class="add" type="button" aria-label="${t('add')}" data-add="${it.id}">+</button></div></article>`;
  }
  function renderItems() {
    const c = catOf(curCat), list = D.menu.filter(i => i.c === curCat);
    $('#panelTitle').innerHTML = `<h3>${L(c)}</h3><span>${c.it}</span><small>${list.length} ${t('items')}</small>`;
    const box = $('#items'); box.innerHTML = list.map(cardHtml).join('');
    if (!reduce) gsap.fromTo($$('.card', box), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: 'expo.out' });
    $$('.card', box).forEach(card => {
      const id = +card.dataset.id;
      card.addEventListener('click', e => { if (e.target.closest('[data-add]')) return; openModal(id); });
      card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(id); });
    });
    $$('[data-add]', box).forEach(b => b.addEventListener('click', e => {
      e.stopPropagation(); const it = byId.get(+b.dataset.add);
      if (it.ps) openModal(it.id); else addToCart({ id: it.id }, 1, b.closest('.card').querySelector('.art'));
    }));
  }

  /* ======================================================
     MODAL
     ====================================================== */
  let mItem = null, mSize = 1, mCrust = 'classic', mQty = 1;
  function openModal(id) {
    const it = byId.get(id); if (!it) return; mItem = it; mQty = 1; mSize = it.ps ? Math.min(1, it.ps.length - 1) : 0; mCrust = 'classic';
    $('#mArt').innerHTML = CiaoArt(it); $('#mArt').style.setProperty('--glow', glow(it.c));
    $('#mIt').textContent = it.it; $('#mName').textContent = nm(it); $('#mDesc').textContent = ds(it); $('#mNote').value = '';
    const isPizza = it.ps && !it.nutella && !it.lotus;
    $('#mSizes').innerHTML = it.ps ? it.ps.map((p, i) => { const s = D.sizes.pizza[i]; return `<button type="button" data-s="${i}" class="${i === mSize ? 'is-on' : ''}">${L(s)}<small>${s.cm}cm · ${p} ${t('egp')}</small></button>`; }).join('') : '';
    $('#mCrust').innerHTML = isPizza ? D.crusts.map(c => `<button type="button" data-c="${c.k}" class="${c.k === mCrust ? 'is-on' : ''}">${L(c)}<small>${c.p ? '+' + c.p + ' ' + t('egp') : '—'}</small></button>`).join('') : '';
    $$('#mSizes button').forEach(b => b.onclick = () => { mSize = +b.dataset.s; $$('#mSizes button').forEach(x => x.classList.toggle('is-on', x === b)); updM(); });
    $$('#mCrust button').forEach(b => b.onclick = () => { mCrust = b.dataset.c; $$('#mCrust button').forEach(x => x.classList.toggle('is-on', x === b)); updM(); });
    updM();
    $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false'); lock(true);
  }
  function unitPrice(e) {
    const it = byId.get(e.id); let p = it.ps ? it.ps[e.size ?? 0] : it.p;
    if (e.crust) p += (D.crusts.find(c => c.k === e.crust) || { p: 0 }).p; return p;
  }
  function updM() { $('#mQty').textContent = mQty; $('#mPrice').textContent = money(unitPrice({ id: mItem.id, size: mSize, crust: $('#mCrust').innerHTML ? mCrust : null }) * mQty); }
  function closeModal() { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true'); lock(false); }
  function bindModal() {
    $$('#modal [data-close]').forEach(b => b.addEventListener('click', closeModal));
    $('#mMinus').onclick = () => { mQty = Math.max(1, mQty - 1); updM(); };
    $('#mPlus').onclick = () => { mQty = Math.min(20, mQty + 1); updM(); };
    $('#mAdd').onclick = () => {
      addToCart({ id: mItem.id, size: mItem.ps ? mSize : undefined, crust: $('#mCrust').innerHTML ? mCrust : undefined, note: $('#mNote').value.trim() }, mQty, $('#mArt .art'));
      closeModal();
    };
    addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); openCart(false); } });
  }
  function lock(v) { if (lenis) v ? lenis.stop() : lenis.start(); document.documentElement.style.overflow = v ? 'hidden' : ''; }

  /* ======================================================
     CART
     ====================================================== */
  let cart = store.get('ciao-cart', []);
  let mode = 'delivery', promo = store.get('ciao-promo', '');
  const keyOf = e => [e.id, e.size ?? '', e.crust ?? '', e.note ?? ''].join('|');
  function addToCart(e, q, fromEl) {
    const k = keyOf(e), ex = cart.find(x => keyOf(x) === k);
    if (ex) ex.q += q; else cart.push({ ...e, q });
    saveCart(); toast(t('added')); fly(fromEl);
    const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  }
  function fly(el) {
    if (!el || reduce) return;
    const r = el.getBoundingClientRect(), c = $('#cartBtn').getBoundingClientRect();
    const f = document.createElement('div'); f.className = 'flyer'; f.innerHTML = el.outerHTML;
    Object.assign(f.style, { left: r.left + r.width / 2 - 30 + 'px', top: r.top + r.height / 2 - 30 + 'px' });
    document.body.appendChild(f);
    gsap.to(f, { x: c.left + c.width / 2 - (r.left + r.width / 2), y: c.top + c.height / 2 - (r.top + r.height / 2), scale: .3, rotate: 360, duration: .9, ease: 'power2.in', onComplete: () => f.remove() });
  }
  function saveCart() { store.set('ciao-cart', cart); renderCart(); }
  const sub = () => cart.reduce((s, e) => s + unitPrice(e) * e.q, 0);
  const count = () => cart.reduce((s, e) => s + e.q, 0);
  const promoOn = () => C.luckyCode && promo && promo.toUpperCase() === C.luckyCode;
  function totals() {
    const s = sub(), dl = mode === 'delivery' && s ? C.deliveryFee : 0, dc = promoOn() ? Math.round(s * C.luckyPct / 100) : 0;
    return { s, dl, dc, tot: s + dl - dc };
  }
  function lineDesc(e) {
    const it = byId.get(e.id), bits = [];
    if (e.size !== undefined && it.ps) bits.push(L(D.sizes.pizza[e.size]));
    if (e.crust && e.crust !== 'classic') bits.push(L(D.crusts.find(c => c.k === e.crust)));
    if (e.note) bits.push(e.note);
    return bits.join(' · ');
  }
  function renderCart() {
    $('#cartCount').textContent = count();
    const list = $('#cartList');
    if (!cart.length) {
      list.innerHTML = `<div class="empty"><svg viewBox="0 0 120 80"><path d="M20 70 L60 8 L100 70Z" fill="#f6c453" stroke="#d9893b" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="48" r="4" fill="#0b0908"/><circle cx="70" cy="48" r="4" fill="#0b0908"/><path d="M50 62 q10 -8 20 0" stroke="#0b0908" stroke-width="3" fill="none"/></svg><p>${t('empty')}</p><button class="btn btn--red" type="button" id="emptyGo">${t('emptyCta')}</button></div>`;
      $('#emptyGo').onclick = () => { openCart(false); goTo('#menu'); };
    } else {
      list.innerHTML = cart.map((e, i) => { const it = byId.get(e.id); return `<div class="ci"><div>${it.c === 'offer' ? '<svg class="art" viewBox="0 0 60 60"><rect x="4" y="12" width="52" height="36" rx="8" fill="#d01f25"/><text x="30" y="36" text-anchor="middle" font-family="Bowlby One" font-size="16" fill="#f2d6a2">7</text></svg>' : CiaoArt(it)}</div><div><b>${nm(it)}</b><small>${lineDesc(e)}</small><span class="ci__p">${money(unitPrice(e) * e.q)}</span></div><div class="qty"><button type="button" data-q="${i}" data-d="-1">−</button><b>${e.q}</b><button type="button" data-q="${i}" data-d="1">+</button></div></div>`; }).join('');
      $$('[data-q]', list).forEach(b => b.onclick = () => { const e = cart[+b.dataset.q]; e.q += +b.dataset.d; if (e.q <= 0) cart.splice(+b.dataset.q, 1); saveCart(); });
    }
    const tt = totals();
    $('#sums').innerHTML = `<div><span>${t('sub')}</span><span>${money(tt.s)}</span></div>` + (tt.dl ? `<div><span>${t('del')}</span><span>${money(tt.dl)}</span></div>` : '') + (tt.dc ? `<div><span>${t('disc')} (${C.luckyCode})</span><span>−${money(tt.dc)}</span></div>` : '') + `<div class="tot"><span>${t('tot')}</span><span>${money(tt.tot)}</span></div>`;
    $('#promoMsg').textContent = promo ? (promoOn() ? t('promoOk', { p: C.luckyPct }) : t('promoBad')) : '';
    const mini = cart.length ? t('cartMini', { n: count(), t: money(tt.s) }) : t('cartMiniEmpty');
    $('#paneCartT').textContent = mini; $('#paneCartD').textContent = mini;
  }
  function setMode(m) {
    mode = m;
    $$('#mode button').forEach(b => b.classList.toggle('is-on', b.dataset.mode === m));
    $('#cAddr').hidden = m !== 'delivery';
    $('#cTimeRow').hidden = m === 'delivery';
    $('#cTable').hidden = m !== 'dinein';
    renderCart();
  }
  function openCart(v, m) {
    if (m) setMode(m);
    $('#drawer').classList.toggle('open', v); $('#drawer').setAttribute('aria-hidden', !v); lock(v);
  }
  function placeholders() {
    $('#cName').placeholder = t('name'); $('#cPhone').placeholder = t('phone'); $('#cAddr').placeholder = t('addr');
    $('#cNotes').placeholder = t('notes'); $('#cTable').placeholder = t('table'); $('#cPromo').placeholder = t('promo');
  }
  function sendOrder() {
    if (!cart.length) { toast(t('needItems')); return; }
    const name = $('#cName').value.trim(); if (!name) { toast(t('needName')); $('#cName').focus(); return; }
    if (mode === 'delivery' && !$('#cAddr').value.trim()) { toast(t('needAddr')); $('#cAddr').focus(); return; }
    const tt = totals(), ar = lang === 'ar';
    const modeTxt = { delivery: ar ? 'توصيل' : 'Delivery', takeaway: ar ? 'تيك أواي (استلام)' : 'Takeaway (pickup)', dinein: ar ? 'في المطعم' : 'Dine-in' }[mode];
    let m = ar ? `مرحباً تشاو 7! 🍕\nطلب جديد: ${modeTxt}\n\n` : `Ciao 7! 🍕\nNew order: ${modeTxt}\n\n`;
    cart.forEach(e => { const it = byId.get(e.id), d = lineDesc(e); m += `• ${e.q}× ${nm(it)}${d ? ` (${d})` : ''} = ${money(unitPrice(e) * e.q)}\n`; });
    m += `\n${t('sub')}: ${money(tt.s)}`;
    if (tt.dl) m += `\n${t('del')}: ${money(tt.dl)}`;
    if (tt.dc) m += `\n${t('disc')} ${C.luckyCode}: −${money(tt.dc)}`;
    m += `\n${t('tot')}: ${money(tt.tot)}\n\n`;
    m += `${t('name')}: ${name}\n`;
    const ph = $('#cPhone').value.trim(); if (ph) m += `${t('phone')}: ${ph}\n`;
    if (mode === 'delivery') m += `${t('addr')}: ${$('#cAddr').value.trim()}\n`;
    else { m += `${ar ? 'الميعاد' : 'Time'}: ${$('#cTime').value}\n`; if (mode === 'dinein' && $('#cTable').value.trim()) m += `${ar ? 'الطاولة' : 'Table'}: ${$('#cTable').value.trim()}\n`; }
    const nt = $('#cNotes').value.trim(); if (nt) m += `${t('notes')}: ${nt}\n`;
    store.set('ciao-who', { name, ph, addr: $('#cAddr').value.trim() });
    window.open(wa(m), '_blank', 'noopener');
  }
  function bindCart() {
    $('#cartBtn').onclick = () => openCart(true);
    $$('[data-close-cart]').forEach(b => b.addEventListener('click', () => openCart(false)));
    $$('#mode button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
    $('#sendOrder').onclick = sendOrder;
    $('#cPromo').value = promo;
    $('#cPromo').addEventListener('input', e => { promo = e.target.value.trim(); store.set('ciao-promo', promo); renderCart(); });
    const who = store.get('ciao-who', null); if (who) { $('#cName').value = who.name || ''; $('#cPhone').value = who.ph || ''; $('#cAddr').value = who.addr || ''; }
    $$('[data-open-cart]').forEach(b => b.addEventListener('click', () => { if (!cart.length) { toast(t('cartMiniEmpty')); goTo('#menu'); return; } openCart(true, b.dataset.openCart); }));
    setMode('delivery');
  }

  /* ======================================================
     OFFERS + ROULETTE
     ====================================================== */
  function renderOffers() {
    $('#tickets').innerHTML = D.offers.map((o, i) => `<article class="ticket"><span class="ticket__big7">7</span><span class="ticket__it">${['Duo', 'Famiglia', 'Sette'][i]}</span><h3>${nm(o)}</h3><p>${lang === 'ar' ? o.dAr : o.dEn}</p><div class="ticket__perf"></div><div class="ticket__foot"><span class="ticket__price">${o.p} <small>${t('egp')}</small><s>${o.old}</s></span><button class="add" type="button" data-offer="${o.id}" aria-label="${t('add')}">+</button></div></article>`).join('');
    $$('[data-offer]').forEach(b => b.onclick = () => addToCart({ id: +b.dataset.offer }, 1, b));
  }
  const RPICKS = [2, 11, 12, 14, 1, 8, 16];
  let rRot = 0, spinning = false;
  function renderRoulette() {
    const n = 8, seg = 360 / n;
    let s = `<svg viewBox="-210 -210 420 420"><circle r="204" fill="#0b0908" stroke="#f5b83d" stroke-width="6"/><g id="rRot">`;
    for (let i = 0; i < n; i++) {
      const a0 = -90 - seg / 2 + i * seg, a1 = a0 + seg, isSeven = i === 7;
      const fill = isSeven ? '#f5b83d' : i % 2 ? '#f2d6a2' : '#d01f25';
      const [x0, y0] = pt(190, a0), [x1, y1] = pt(190, a1), am = a0 + seg / 2, [tx, ty] = pt(isSeven ? 120 : 118, am);
      const label = isSeven ? '7' : nm(byId.get(RPICKS[i]));
      s += `<path d="M0 0 L${x0} ${y0} A190 190 0 0 1 ${x1} ${y1}Z" fill="${fill}" stroke="#0b0908" stroke-width="3"/>`;
      s += `<text x="${tx}" y="${ty}" transform="rotate(${am + 90} ${tx} ${ty})" text-anchor="middle" dominant-baseline="middle" font-family="${isSeven ? 'Bowlby One' : lang === 'ar' ? 'Lalezar' : 'Readex Pro'}" font-weight="700" font-size="${isSeven ? 54 : lang === 'ar' ? 19 : 13}" fill="${isSeven ? '#d01f25' : i % 2 ? '#0b0908' : '#fff'}">${label}</text>`;
    }
    for (let i = 0; i < 16; i++) { const [x, y] = pt(197, i * 22.5); s += `<circle cx="${x}" cy="${y}" r="4" fill="${i % 2 ? '#fff' : '#f5b83d'}"/>`; }
    s += `</g><circle r="40" fill="#0b0908" stroke="#f5b83d" stroke-width="5"/><text text-anchor="middle" dominant-baseline="middle" font-family="Pacifico" font-size="17" fill="#f2d6a2">Ciao</text></svg>`;
    $('#rWheel').innerHTML = s;
    $('#rRot').setAttribute('transform', `rotate(${rRot})`);
  }
  function spin() {
    if (spinning) return; spinning = true;
    const n = 8, seg = 360 / n, k = Math.random() < .14 ? 7 : Math.floor(Math.random() * 7);
    // slice k centre sits at (-90 + k*seg); pointer is at -90 → rotate by -k*seg
    const target = rRot + 360 * 6 + ((-k * seg - rRot) % 360 + 360) % 360 + (Math.random() * 20 - 10);
    const st = { r: rRot };
    $('#spinResult').innerHTML = '';
    gsap.to(st, { r: target, duration: reduce ? .1 : 4.6, ease: 'power4.out', onUpdate: () => $('#rRot').setAttribute('transform', `rotate(${st.r})`), onComplete: () => { rRot = target % 360; spinning = false; result(k); } });
  }
  function result(k) {
    const box = $('#spinResult');
    $('#spinBtn').querySelectorAll('[lang]').forEach(s => s.textContent = T[s.lang].spinAgain);
    if (k === 7 && C.luckyCode) {
      box.innerHTML = `<div class="rres rres--win"><div><b>${t('win')}</b><p class="muted" style="color:#fff">${t('winTxt', { p: C.luckyPct })}</p><code>${C.luckyCode}</code></div></div>`;
      promo = C.luckyCode; store.set('ciao-promo', promo); $('#cPromo').value = promo; renderCart(); pizzaRain();
      try { navigator.clipboard && navigator.clipboard.writeText(C.luckyCode); } catch (e) { }
      return;
    }
    const it = byId.get(RPICKS[k] || RPICKS[0]);
    box.innerHTML = `<div class="rres">${CiaoArt(it)}<div style="flex:1"><span class="muted">${t('luck')}</span><b>${nm(it)}</b></div><button class="btn btn--red" type="button" id="rAdd">${t('addIt')}</button></div>`;
    $('#rAdd').onclick = () => openModal(it.id);
  }

  /* ---------- goodness, reviews, dictionary ---------- */
  const GOOD = [
    { ar: 'الطماطم', en: 'Tomato', dAr: 'غنية بالليكوبين، مضاد أكسدة يمتصه الجسم أفضل حين تُطهى الطماطم مع زيت الزيتون.', dEn: 'Rich in lycopene, an antioxidant your body absorbs better when tomatoes are cooked with olive oil.', ic: '<svg viewBox="0 0 66 66"><circle cx="33" cy="38" r="24" fill="#d01f25"/><path d="M22 14 Q33 22 44 14 Q38 26 33 18 Q28 26 22 14Z" fill="#3f8a2e"/><circle cx="25" cy="32" r="5" fill="#fff" opacity=".3"/></svg>' },
    { ar: 'الجبنة', en: 'Cheese', dAr: 'مصدر طيب للبروتين والكالسيوم، وصديق قديم للعظام القوية.', dEn: 'A good source of protein and calcium, an old friend of strong bones.', ic: '<svg viewBox="0 0 66 66"><path d="M8 48 L33 14 L58 48Z" fill="#f6c453"/><circle cx="30" cy="38" r="5" fill="#e0a52d"/><circle cx="42" cy="42" r="3" fill="#e0a52d"/></svg>' },
    { ar: 'العجينة المختمرة', en: 'Slow dough', dAr: 'التخمير الطويل يكسر جزءاً من النشويات، فتصبح أخف على المعدة وتعطيك طاقة تدوم.', dEn: 'Long fermentation breaks down some starches, making it lighter and giving lasting energy.', ic: '<svg viewBox="0 0 66 66"><ellipse cx="33" cy="40" rx="26" ry="16" fill="#e7a95a"/><ellipse cx="33" cy="36" rx="22" ry="12" fill="#f4d79a"/><circle cx="26" cy="34" r="2.5" fill="#e7a95a"/><circle cx="38" cy="38" r="2" fill="#e7a95a"/></svg>' },
    { ar: 'الخضار وزيت الزيتون', en: 'Veggies & olive oil', dAr: 'ألياف وفيتامينات من الخضار، ودهون صحية من زيت الزيتون في كل قطعة.', dEn: 'Fibre and vitamins from the veggies, healthy fats from olive oil, in every slice.', ic: '<svg viewBox="0 0 66 66"><path d="M33 8 C52 22 52 46 33 60 C14 46 14 22 33 8Z" fill="#3f8a2e"/><path d="M33 12 V56" stroke="#1f5a22" stroke-width="2"/></svg>' }
  ];
  function renderGood() { $('#goodCards').innerHTML = GOOD.map(g => `<div class="gc"><div class="gc__ic">${g.ic}</div><h3>${L(g)}</h3><p>${lang === 'ar' ? g.dAr : g.dEn}</p></div>`).join(''); }
  function goodIn() { if (reduce) return; gsap.from('.gc', { y: 50, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '#goodCards', start: 'top 80%' } }); }
  function renderReviews() {
    const card = r => `<div class="rv"><div class="rv__stars">${'★'.repeat(r.r)}${'☆'.repeat(5 - r.r)}</div><p>${L(r)}</p><div class="rv__who">${r.n}</div></div>`;
    const a = D.reviews.map(card).join(''), b = [...D.reviews].reverse().map(card).join('');
    $('#mq1').innerHTML = a + a; $('#mq2').innerHTML = b + b;
  }
  const DICT = [
    ['Ciao!', 'تشاو', 'chow', { ar: 'أهلاً / مع السلامة', en: 'Hi / Bye' }, { ar: 'تُقال عند اللقاء وعند الوداع.. وعند وصول البيتزا.', en: 'Hello, goodbye, and "my pizza is here".' }],
    ['Grazie', 'جراتسيه', 'GRAHT-see-eh', { ar: 'شكراً', en: 'Thank you' }, { ar: 'للشيف، وللجبنة، وللحياة.', en: 'To the chef, to the cheese, to life.' }],
    ['Buonissimo!', 'بوونيسّيمو', 'bwoh-NEES-see-mo', { ar: 'لذيذ جداً!', en: 'Super tasty!' }, { ar: 'قلها بصوت عالٍ بعد أول قضمة.', en: 'Say it loud after the first bite.' }],
    ['Mamma mia!', 'ماما ميا', 'MAHM-ma MEE-ah', { ar: 'يا سلام!', en: 'Oh my!' }, { ar: 'رد الفعل الرسمي على خيط الجبنة.', en: 'The official reaction to a cheese pull.' }],
    ['Al dente', 'آل دِنتي', 'al DEN-teh', { ar: 'متماسكة تحت السنّ', en: 'Firm to the bite' }, { ar: 'هكذا نطبخ المكرونة دائماً.', en: 'How we always cook our pasta.' }],
    ['Formaggio', 'فورماجّو', 'for-MAHD-jo', { ar: 'جبنة', en: 'Cheese' }, { ar: '"Extra formaggio" يعني جبنة زيادة. نعرف أنك ستطلبها.', en: '"Extra formaggio". We know you will.' }],
    ['Basta!', 'باستا', 'BAH-sta', { ar: 'كفاية!', en: 'Enough!' }, { ar: 'تُقال لكل شيء.. إلا البيتزا. ولا تخلط بينها وبين Pasta!', en: 'For everything except pizza. And not to be confused with pasta!' }]
  ];
  function renderDict() {
    $('#dictGrid').innerHTML = DICT.map(d => `<div class="flip" tabindex="0"><div class="flip__in"><div class="flip__f"><i>${lang === 'ar' ? d[1] : d[2]}</i><b>${d[0]}</b><small>${lang === 'ar' ? 'اضغط للمعنى' : 'Tap to flip'}</small></div><div class="flip__b"><b>${L(d[3])}</b><span>${L(d[4])}</span></div></div></div>`).join('');
    $$('.flip').forEach(f => { f.onclick = () => f.classList.toggle('on'); f.onkeydown = e => { if (e.key === 'Enter') f.classList.toggle('on'); }; });
  }

  /* ---------- booking ---------- */
  let guests = 2, occ = 0;
  function renderBook() {
    $('#guests').innerHTML = [1, 2, 3, 4, 5, 6, 8, '10+'].map(g => `<button type="button" data-g="${g}" class="${String(g) === String(guests) ? 'is-on' : ''}">${g}</button>`).join('');
    $$('#guests button').forEach(b => b.onclick = () => { guests = b.dataset.g; $$('#guests button').forEach(x => x.classList.toggle('is-on', x === b)); });
    $('#occ').innerHTML = T[lang].occ.map((o, i) => `<button type="button" data-o="${i}" class="${i === occ ? 'is-on' : ''}">${o}</button>`).join('');
    $$('#occ button').forEach(b => b.onclick = () => { occ = +b.dataset.o; $$('#occ button').forEach(x => x.classList.toggle('is-on', x === b)); });
  }
  function bindBook() {
    const f = $('#tableForm');
    const d = new Date(); const iso = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    f.date.value = iso; f.date.min = iso;
    const who = store.get('ciao-who', null); if (who) { f.name.value = who.name || ''; f.phone.value = who.ph || ''; }
    f.addEventListener('submit', e => {
      e.preventDefault(); const ar = lang === 'ar';
      let m = ar ? `مرحباً تشاو 7! 🍕\nأريد حجز طاولة\n\n` : `Ciao 7! 🍕\nI'd like to book a table\n\n`;
      m += `${t('name')}: ${f.name.value}\n${t('phone')}: ${f.phone.value}\n`;
      m += `${ar ? 'اليوم' : 'Date'}: ${f.date.value}\n${ar ? 'الساعة' : 'Time'}: ${f.time.value}\n`;
      m += `${ar ? 'عدد الأشخاص' : 'Guests'}: ${guests}\n${ar ? 'المناسبة' : 'Occasion'}: ${T[lang].occ[occ]}\n`;
      if (f.notes.value.trim()) m += `${t('notes')}: ${f.notes.value.trim()}\n`;
      store.set('ciao-who', { ...(store.get('ciao-who', {}) || {}), name: f.name.value, ph: f.phone.value });
      toast(t('bookSent')); window.open(wa(m), '_blank', 'noopener');
    });
    $$('.tab').forEach(b => b.onclick = () => {
      $$('.tab').forEach(x => x.classList.toggle('is-on', x === b));
      $$('.pane').forEach(p => p.classList.toggle('is-on', p.dataset.pane === b.dataset.tab));
    });
  }

  /* ---------- nav ---------- */
  function navSpy() {
    const nav = $('#nav');
    ScrollTrigger.create({ start: 80, onUpdate: s => nav.classList.toggle('is-solid', s.scroll() > 80) });
    nav.classList.toggle('is-solid', scrollY > 80);
    $$('#navLinks a').forEach(a => {
      const sec = $(a.getAttribute('href')); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('is-on', s.isActive) });
    });
  }
  function bindNav() {
    const nav = $('#nav');
    $('#burger').onclick = () => nav.classList.toggle('open');
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      const href = a.getAttribute('href'); if (href.length < 2) return;
      e.preventDefault(); nav.classList.remove('open');
      const cat = a.dataset.gotoCat; if (cat) selectCat(cat);
      goTo(href === '#top' ? 0 : href, href === '#menu' && cat ? 0 : 0);
    });
    $('#langBtn').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; applyLang(); };
  }

  /* ---------- render ---------- */
  function renderDynamic() {
    fillInfo(); renderSette(); renderWheel(); renderChips(); selectCat(curCat); renderOffers(); renderRoulette();
    renderGood(); renderReviews(); renderDict(); renderBook(); placeholders(); renderCart();
    $('#bubble').textContent = T[lang].greet[gi];
    $('#spinBtn').querySelectorAll('[lang]').forEach(s => s.textContent = s.lang === 'ar' ? (spinning ? s.textContent : s.textContent) : s.textContent);
  }
  function renderAll() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    renderDynamic(); bindModal(); bindCart(); bindBook(); bindNav(); bindHeroFun();
    $('#spinBtn').onclick = spin;
    addEventListener('resize', () => { clearTimeout(window.__rz); window.__rz = setTimeout(() => { selectCat(curCat); }, 200); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
