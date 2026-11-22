(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const CFG = window.NB_CONFIG, MENU = window.NB_MENU, CATS = window.NB_CATS, MOODS = window.NB_MOODS;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  const isEn = () => root.lang === 'en';
  const T = (ar, en) => isEn() ? en : ar;
  const money = n => `${n}<em>${T(CFG.currency.ar, CFG.currency.en)}</em>`;
  const byId = Object.fromEntries(MENU.map(m => [m.id, m]));
  const CUTS = new Set(window.NB_CUTS || []);
  const cutOf = m => m && m.img && m.img.startsWith('p-') && CUTS.has(m.img.slice(2)) ? 'cut-' + m.img.slice(2) : null;
  if (reduced) root.classList.add('reduced');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- i18n ---------- */
  function applyLang() {
    const en = isEn();
    $$('[data-en]').forEach(el => {
      if (!el.dataset.ar) el.dataset.ar = el.innerHTML;
      el.innerHTML = en ? el.dataset.en : el.dataset.ar;
    });
    $$('[data-en-ph]').forEach(el => {
      if (!el.dataset.arPh) el.dataset.arPh = el.placeholder;
      el.placeholder = en ? el.dataset.enPh : el.dataset.arPh;
    });
    $('#langBtn').textContent = en ? 'ع' : 'EN';
    document.title = en ? 'Naama Bay Cafe | A garden on the Nile — Tahta, Sohag' : 'كافيه خليج نعمة | Naama Bay Cafe — طهطا، سوهاج';
    renderMenu(); renderMood(); renderTray(); renderSig();
  }
  $('#langBtn').addEventListener('click', () => {
    const en = !isEn();
    root.lang = en ? 'en' : 'ar'; root.dir = en ? 'ltr' : 'rtl';
    try { localStorage.setItem('nb-lang', root.lang); } catch (e) {}
    applyLang(); ScrollTrigger.refresh();
  });

  /* ---------- theme ---------- */
  $('#themeBtn').addEventListener('click', () => {
    const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = t;
    try { localStorage.setItem('nb-theme', t); } catch (e) {}
    toast(t === 'dark' ? T('السهرة بدأت 🌙', 'Night mode on 🌙') : T('صباح النيل ☀️', 'Good morning ☀️'));
  });

  /* ---------- header ---------- */
  const hdr = $('#hdr');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    hdr.classList.toggle('solid', y > heroLen() * .97 || document.body.classList.contains('nav-open'));
    hdr.classList.toggle('hide', y > lastY && y > 400 && !document.body.classList.contains('nav-open'));
    lastY = y;
  }, { passive: true });
  $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduced && !weak && window.Lenis) {
    lenis = new Lenis({ lerp: .14, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = $(id); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -80 }); else el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- toast ---------- */
  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); }

  /* ---------- whatsapp ---------- */
  const wa = txt => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(txt)}`;
  $('#fabWa').href = wa(T('أهلًا خليج نعمة 👋', 'Hello Naama Bay 👋'));

  /* =========================================================
     HERO — real time-lapse (afternoon → sunset → night) scrubbed by scroll
     ========================================================= */
  const SEQ_N = 73;
  const canvas = $('#heroCanvas'), ctx = canvas.getContext('2d');
  const mobileSeq = () => innerWidth / innerHeight < .8;
  let seqKind = null, frames = [], curF = 0;
  function loadSeq() {
    const kind = mobileSeq() ? 'm' : 'd';
    if (kind === seqKind) return;
    seqKind = kind; frames = new Array(SEQ_N);
    // coarse pass first (every 6th frame), then fill the gaps
    const order = [];
    for (let i = 0; i < SEQ_N; i += 6) order.push(i);
    for (let i = 0; i < SEQ_N; i++) if (i % 6) order.push(i);
    let k = 0;
    const next = () => {
      if (k >= order.length || kind !== seqKind) return;
      const i = order[k++], im = new Image();
      im.decoding = 'async';
      im.onload = () => { frames[i] = im; if (i === 0) { sizeCanvas(); canvas.classList.add('ready'); } if (Math.abs(i - curF) < 3) draw(curF); next(); };
      im.onerror = next;
      im.src = `assets/seq/${kind}/${String(i).padStart(3, '0')}.webp`;
    };
    for (let c = 0; c < 4; c++) next();
  }
  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    draw(curF);
  }
  const nearest = i => { for (let d = 0; d < SEQ_N; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; } return null; };
  function cover(im, alpha) {
    const cw = canvas.width, ch = canvas.height, s = Math.max(cw / im.width, ch / im.height);
    const w = im.width * s, h = im.height * s;
    ctx.globalAlpha = alpha; ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function draw(f) {
    curF = f;
    const i = Math.floor(f), t = f - i;
    const a = frames[i] || nearest(i); if (!a) return;
    cover(a, 1);
    const b = frames[i + 1];
    if (b && t > .02) cover(b, t);   // blend neighbours for smooth motion
    ctx.globalAlpha = 1;
  }

  const heroLen = () => innerHeight * (innerWidth < 720 ? 1.6 : 1.9);
  function heroTimeline() {
    loadSeq();
    const st = { f: 0 };
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to(st, { f: SEQ_N - 1, duration: .86, onUpdate: () => draw(st.f) }, 0)
      .to('.hero-poster, .hero-canvas', { scale: 1.08, duration: 1 }, 0)
      .to('.hc1', { opacity: 0, y: -50, duration: .08 }, .12)
      .to('#scrollHint', { opacity: 0, duration: .05 }, .04)
      .fromTo('.hc2', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .08 }, .3)
      .to('.hc2', { opacity: 0, y: -50, duration: .08 }, .48)
      .fromTo('.hc3', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .08 }, .62)
      .to('.hc3', { opacity: 0, y: -50, duration: .08 }, .78)
      .fromTo('.hc4', { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .1 }, .86)
      .to({}, { duration: .04 }, .96);

    // clock: 4:00 PM → 5:30 sunset → 11:30 PM
    const kf = [[0, 960], [.45, 1050], [.75, 1350], [1, 1410]];
    const clockTxt = $('#clockTxt'), clockAm = $('#clockAmPm'), bar = $('#heroBar'), hps = $$('.hp');
    const setClock = p => {
      let m = kf[0][1];
      for (let i = 1; i < kf.length; i++) if (p <= kf[i][0]) { const [p0, m0] = kf[i - 1], [p1, m1] = kf[i]; m = m0 + (m1 - m0) * (p - p0) / (p1 - p0); break; } else m = kf[i][1];
      m = Math.round(m / 5) * 5; let h = Math.floor(m / 60), mm = m % 60; const pm = h >= 12; h = h % 12 || 12;
      clockTxt.textContent = `${h}:${String(mm).padStart(2, '0')}`; clockAm.textContent = pm ? T('م', 'PM') : T('ص', 'AM');
      bar.style.transform = `scaleX(${p})`;
      const ph = p < .36 ? 0 : p < .62 ? 1 : 2; hps.forEach((e, i) => e.classList.toggle('on', i === ph));
    };
    setClock(0);

    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: () => '+=' + heroLen(),
      pin: '.hero-pin', pinSpacing: true, scrub: reduced ? true : .6, animation: tl,
      onUpdate: s => setClock(s.progress)
    });
    addEventListener('resize', () => { loadSeq(); sizeCanvas(); });
  }

  /* ---------- intro: real logo, light sweep, wordmark, lift ---------- */
  function intro() {
    const it = $('#intro');
    if (reduced) { it.remove(); return Promise.resolve(); }
    return new Promise(res => {
      let done = false;
      const finish = () => { if (done) return; done = true; it.remove(); res(); };
      const tl = gsap.timeline({ onComplete: finish });
      gsap.set('.intro-word span', { yPercent: 110 });
      tl.from('.intro-glow', { scale: .3, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0)
        .from('.intro-logo', { scale: .62, y: 40, opacity: 0, filter: 'blur(16px)', duration: 1.15, ease: 'expo.out' }, .1)
        .fromTo('.intro-shine', { backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0', duration: 1, ease: 'power2.inOut' }, .65)
        .to('.intro-word span', { yPercent: 0, duration: .9, ease: 'expo.out' }, .7)
        .from('.intro-line', { scaleX: 0, duration: .7, ease: 'power3.inOut' }, .95)
        .from('.intro-sub', { opacity: 0, letterSpacing: '.9em', duration: .8, ease: 'power3.out' }, 1.05)
        .to('.intro-inner', { y: -40, opacity: 0, scale: .96, duration: .55, ease: 'power3.in' }, 1.95)
        .to('.intro-glow', { scale: 1.6, opacity: 0, duration: .7, ease: 'power2.in' }, 1.95)
        .to(it, { yPercent: -100, duration: .85, ease: 'expo.inOut' }, 2.2);
      it.addEventListener('click', () => tl.timeScale(3));
    });
  }

  /* ---------- reveals ---------- */
  function reveals() {
    if (reduced) return;
    ScrollTrigger.batch('.reveal', { start: 'top 88%', onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out' }) });
    $$('[data-count]').forEach(el => {
      const n = +el.dataset.count;
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to({ v: 0 }, { v: n, duration: 1.6, ease: 'power2.out', onUpdate() { el.textContent = Math.round(this.targets()[0].v); } }) });
    });
    gsap.to('.sm-a', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.story', scrub: true } });
    gsap.to('.sm-b', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.story', scrub: true } });
    gsap.from('.g', { y: 60, opacity: 0, stagger: .07, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.gal-grid', start: 'top 85%' } });
    $$('.space').forEach(sp => {
      gsap.fromTo(sp.querySelector('.sp-media'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: sp, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(sp, { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: sp, start: 'top 90%' } });
      gsap.from(sp.querySelector('.sp-body'), { y: 30, opacity: 0, duration: 1, delay: .2, ease: 'power3.out', scrollTrigger: { trigger: sp, start: 'top 80%' } });
    });
    gsap.from('.ev', { y: 50, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.ev-grid', start: 'top 85%' } });
  }

  /* ---------- tray ---------- */
  let tray = {};
  try { tray = JSON.parse(localStorage.getItem('nb-tray') || '{}'); } catch (e) {}
  const saveTray = () => { try { localStorage.setItem('nb-tray', JSON.stringify(tray)); } catch (e) {} };
  function addItem(id, btn) {
    tray[id] = (tray[id] || 0) + 1; saveTray(); renderTray();
    const m = byId[id]; toast(T(`اتضاف للصينية: ${m.ar}`, `Added to tray: ${m.en}`));
    if (btn && !reduced) gsap.fromTo(btn, { scale: .7 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    gsap.fromTo('#trayBtn', { rotate: -12 }, { rotate: 0, duration: .6, ease: 'elastic.out(1,.4)' });
  }
  const thumb = m => cutOf(m) ? `<img class="cut" src="assets/img/${cutOf(m)}.webp" alt="" loading="lazy">` : m.img ? `<img src="assets/img/${m.img}.webp" alt="" loading="lazy">` : `<span class="ph0"></span>`;
  function renderTray() {
    const ids = Object.keys(tray).filter(k => tray[k] > 0 && byId[k]);
    const count = ids.reduce((a, k) => a + tray[k], 0), total = ids.reduce((a, k) => a + tray[k] * byId[k].p, 0);
    const c = $('#trayCount'); c.textContent = count; c.classList.toggle('on', count > 0);
    $('#drawerList').innerHTML = ids.length ? ids.map(k => { const m = byId[k]; return `<div class="dl">${thumb(m)}<div class="dl-t"><b>${T(m.ar, m.en)}</b><small>${m.p} × ${tray[k]}</small></div><div class="qty"><button data-q="-1" data-id="${k}"><svg><use href="#ico-minus"/></svg></button><span>${tray[k]}</span><button data-q="1" data-id="${k}"><svg><use href="#ico-plus"/></svg></button></div></div>`; }).join('')
      : `<p class="tray-empty">${T('الصينية فاضية. ضيف حاجة من المنيو ☕', 'Your tray is empty. Add something from the menu ☕')}</p>`;
    $('#drawerTotal').innerHTML = money(total);
    $('#trayMini').innerHTML = ids.length ? ids.map(k => { const m = byId[k]; return `<div class="tm">${thumb(m)}<b>${T(m.ar, m.en)} × ${tray[k]}</b><span>${m.p * tray[k]}</span></div>`; }).join('')
      : `<p class="tray-empty">${T('عايز مشروبك يبقى جاهز أول ما توصل؟', 'Want your drink ready when you arrive?')} <a href="#menu">${T('اختار من المنيو', 'Pick from the menu')}</a></p>`;
  }
  $('#drawerList').addEventListener('click', e => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    const id = b.dataset.id; tray[id] = Math.max(0, (tray[id] || 0) + +b.dataset.q); if (!tray[id]) delete tray[id]; saveTray(); renderTray();
  });
  const drawer = $('#drawer'), scrim = $('#scrim');
  const openDrawer = o => { drawer.classList.toggle('open', o); scrim.classList.toggle('on', o); drawer.setAttribute('aria-hidden', !o); };
  $('#trayBtn').addEventListener('click', () => openDrawer(true));
  $('#drawerX').addEventListener('click', () => openDrawer(false));
  scrim.addEventListener('click', () => { openDrawer(false); closeSheet(); });
  $('#drawerGo').addEventListener('click', () => openDrawer(false));
  document.addEventListener('click', e => { const b = e.target.closest('.add[data-add]'); if (b) addItem(b.dataset.add, b); });

  /* ---------- signature showcase (floating cut-outs) ---------- */
  const SIG = window.NB_SIG;
  let shI = 0, shTimer = null, shTween = null;
  const pad2 = n => String(n).padStart(2, '0');
  function renderSig() {
    $('#shThumbs').innerHTML = SIG.map((x, i) => { const m = byId[x.id]; return `<button class="st ${i === shI ? 'on' : ''}" data-sh="${i}" aria-label="${T(m.ar, m.en)}"><img src="assets/img/${cutOf(m) || m.img}.webp" alt="" loading="lazy"></button>`; }).join('');
    shInfo(shI, false);
  }
  function shInfo(i) {
    const x = SIG[i], m = byId[x.id], c = CATS.find(k => k.id === m.c);
    $('#shInfo').innerHTML = `<span class="si-tag">${T(c.ar, c.en)}</span><h3>${T(m.ar, m.en)}</h3><p>${T(x.ar2, x.en2)}</p><div class="si-meta"><div><small>${T('أحلى وقت ليها', 'Best time')}</small><b>${T(x.whenAr, x.whenEn)}</b></div><div><small>${T('بتتقدم', 'Served')}</small><b>${T(x.tempAr, x.tempEn)}</b></div><div><small>${T('التصنيف', 'Type')}</small><b>${T('توقيع خليج نعمة', 'Signature')}</b></div></div><div class="si-buy"><span class="price">${money(m.p)}</span><button class="btn btn-sun" data-open="${m.id}">${T('اطلبها', 'Order it')}</button></div>`;
    $('#shIdx').textContent = pad2(i + 1); $('#shNum').textContent = pad2(i + 1);
    $$('.st').forEach((b, k) => b.classList.toggle('on', k === i));
  }
  function shGo(i, user) {
    i = (i + SIG.length) % SIG.length; if (i === shI && !user) return;
    const dir = i > shI ? 1 : -1; shI = i;
    const img = $('#shImg'), m = byId[SIG[i].id], src = `assets/img/${cutOf(m) || m.img}.webp`;
    if (reduced) { img.src = src; shInfo(i); return; }
    const pre = new Image(); pre.src = src;
    gsap.timeline()
      .to(img, { xPercent: -30 * dir, rotate: -14 * dir, scale: .7, opacity: 0, duration: .45, ease: 'power3.in' })
      .to('#shInfo > *', { y: -16, opacity: 0, stagger: .03, duration: .3, ease: 'power2.in' }, 0)
      .to('#shNum', { opacity: 0, y: -30, duration: .3 }, 0)
      .add(() => { img.src = src; shInfo(i); })
      .fromTo(img, { xPercent: 30 * dir, rotate: 14 * dir, scale: .7, opacity: 0 }, { xPercent: 0, rotate: 0, scale: 1, opacity: 1, duration: .9, ease: 'expo.out' })
      .from('#shInfo > *', { y: 22, opacity: 0, stagger: .05, duration: .6, ease: 'power3.out' }, '<.05')
      .fromTo('#shNum', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '<');
    shAuto();
  }
  function shAuto() {
    if (reduced) return;
    if (shTween) shTween.kill();
    shTween = gsap.fromTo('#shBar', { scaleX: 0 }, { scaleX: 1, duration: 6, ease: 'none', onComplete: () => shGo(shI + 1) });
    if (!shVisible) shTween.pause();
  }
  let shVisible = false;
  function setupShow() {
    $('#shThumbs').addEventListener('click', e => { const b = e.target.closest('[data-sh]'); if (b) shGo(+b.dataset.sh, true); });
    $('#shPrev').addEventListener('click', () => shGo(shI - 1, true));
    $('#shNext').addEventListener('click', () => shGo(shI + 1, true));
    if (!reduced) {
      gsap.to('#shImg', { y: -18, rotate: 2, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.sp-shadow', { scaleX: .82, opacity: .6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      const prod = $('#shProduct');
      prod.addEventListener('pointermove', e => { const r = prod.getBoundingClientRect(); gsap.to('#shImg', { x: ((e.clientX - r.left) / r.width - .5) * 30, duration: .8, ease: 'power3.out', overwrite: 'auto' }); });
      prod.addEventListener('pointerleave', () => gsap.to('#shImg', { x: 0, duration: .8 }));
      ScrollTrigger.create({ trigger: '.show', start: 'top 70%', end: 'bottom 20%', onToggle: s => { shVisible = s.isActive; if (shTween) s.isActive ? shTween.play() : shTween.pause(); } });
      gsap.from('.show-product', { scale: .8, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.show-stage', start: 'top 75%' } });
      gsap.from('.st', { y: 30, opacity: 0, stagger: .06, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.show-stage', start: 'top 75%' } });
    }
    shAuto();
  }

  /* ---------- item sheet ---------- */
  let shItem = null, shQty = 1;
  const sheet = $('#sheet');
  function openSheet(id) {
    const m = byId[id]; if (!m) return; shItem = m; shQty = 1;
    const c = CATS.find(k => k.id === m.c), cut = cutOf(m);
    $('#sheetMedia').innerHTML = cut ? `<img src="assets/img/${cut}.webp" alt="${T(m.ar, m.en)}">` : m.img ? `<img class="photo" src="assets/img/${m.img}.webp" alt="${T(m.ar, m.en)}">` : `<svg class="sh-cup"><use href="#ico-cup"/></svg>`;
    const sig = SIG.find(x => x.id === id);
    const desc = sig ? T(sig.ar2, sig.en2) : m.dar ? T(m.dar, m.den) : T('من منيو خليج نعمة، بيتحضر طازة أول ما تطلبه.', 'From the Naama Bay menu, freshly made when you order.');
    const opts = m.c === 'hot' ? [['سكر عادي', 'Regular sugar'], ['سكر خفيف', 'Light sugar'], ['من غير سكر', 'No sugar']]
      : m.c === 'fresh' || m.c === 'shake' || m.c === 'iced' ? [['تلج عادي', 'Regular ice'], ['تلج خفيف', 'Light ice'], ['من غير تلج', 'No ice']]
      : m.c === 'shisha' ? [['حجر واحد', 'One head'], ['حجرين', 'Two heads']] : [];
    $('#sheetBody').innerHTML = `<span class="si-tag">${T(c.ar, c.en)}</span><h3>${T(m.ar, m.en)}</h3><p>${desc}</p>${opts.length ? `<div class="sh-opts">${opts.map((o, k) => `<button class="${k ? '' : 'on'}" data-opt>${T(o[0], o[1])}</button>`).join('')}</div>` : '<div class="sh-opts"></div>'}<div class="sh-buy"><span class="price" id="shPrice">${money(m.p)}</span><div class="sh-qty"><button data-sq="-1" aria-label="-"><svg><use href="#ico-minus"/></svg></button><span id="shQ">1</span><button data-sq="1" aria-label="+"><svg><use href="#ico-plus"/></svg></button></div></div><button class="btn btn-sun" id="shAdd">${T('ضيف للصينية', 'Add to tray')}</button>`;
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false'); scrim.classList.add('on');
    if (lenis) lenis.stop();
    if (!reduced) {
      gsap.fromTo('.sheet-card', { y: innerWidth < 720 ? 300 : 40, opacity: 0, scale: innerWidth < 720 ? 1 : .96 }, { y: 0, opacity: 1, scale: 1, duration: .6, ease: 'expo.out' });
      gsap.fromTo('#sheetMedia > *', { scale: .6, rotate: -10, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .9, delay: .1, ease: 'back.out(1.4)' });
    }
  }
  function closeSheet() {
    if (!sheet.classList.contains('open')) return;
    const done = () => { sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true'); };
    if (!drawer.classList.contains('open')) scrim.classList.remove('on');
    if (lenis) lenis.start();
    if (reduced) done(); else gsap.to('.sheet-card', { y: 30, opacity: 0, duration: .3, ease: 'power2.in', onComplete: done });
  }
  sheet.addEventListener('click', e => {
    if (e.target === sheet || e.target.closest('#sheetX')) return closeSheet();
    const q = e.target.closest('[data-sq]');
    if (q) { shQty = Math.max(1, Math.min(20, shQty + +q.dataset.sq)); $('#shQ').textContent = shQty; $('#shPrice').innerHTML = money(shItem.p * shQty); return; }
    const o = e.target.closest('[data-opt]');
    if (o) { $$('[data-opt]', sheet).forEach(b => b.classList.remove('on')); o.classList.add('on'); return; }
    if (e.target.closest('#shAdd')) { for (let k = 0; k < shQty; k++) tray[shItem.id] = (tray[shItem.id] || 0) + 1; saveTray(); renderTray(); toast(T(`اتضاف للصينية: ${shItem.ar} × ${shQty}`, `Added to tray: ${shItem.en} × ${shQty}`)); gsap.fromTo('#trayBtn', { rotate: -12 }, { rotate: 0, duration: .6, ease: 'elastic.out(1,.4)' }); closeSheet(); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheet(); openDrawer(false); } });
  document.addEventListener('click', e => {
    if (e.target.closest('.add')) return;
    const o = e.target.closest('[data-open]'); if (o) openSheet(o.dataset.open);
  });

  /* ---------- mood ---------- */
  let mood = 'dusk';
  const moodBg = { dawn: 'hero-day', noon: 'hero-day', dusk: 'hero-dusk', night: 'hero-night' };
  function renderMood() {
    $('#moodTabs').innerHTML = MOODS.map(m => `<button class="mood-tab ${m.id === mood ? 'on' : ''}" data-mood="${m.id}"><span class="mt-ico mt-${m.id}"></span><span><b>${T(m.ar, m.en)}</b><small>${m.time}</small></span></button>`).join('');
    const m = MOODS.find(x => x.id === mood);
    const st = $('#moodStage'); st.style.backgroundImage = `url(assets/img/${moodBg[mood]}${innerWidth < 720 ? '-m' : ''}.webp)`;
    st.innerHTML = `<h3>${T(m.ar, m.en)}</h3><p>${T(m.ar2, m.en2)}</p><div class="mood-items">${m.items.map(id => { const it = byId[id]; return `<div class="mood-item" data-open="${id}"><div class="mi-img">${cutOf(it) ? `<img class="cut" src="assets/img/${cutOf(it)}.webp" alt="" loading="lazy">` : it.img ? `<img src="assets/img/${it.img}.webp" alt="" loading="lazy">` : '<svg><use href="#ico-cup"/></svg>'}</div><b>${T(it.ar, it.en)}</b><div class="mi-row"><span>${money(it.p)}</span><button class="add" data-add="${id}" aria-label="add"><svg><use href="#ico-plus"/></svg></button></div></div>`; }).join('')}</div>`;
    if (!reduced) gsap.from('#moodStage .mood-item', { y: 24, opacity: 0, stagger: .07, duration: .5, ease: 'power2.out' });
  }
  $('#moodTabs').addEventListener('click', e => { const b = e.target.closest('[data-mood]'); if (!b) return; mood = b.dataset.mood; renderMood(); });

  /* ---------- menu ---------- */
  let cat = 'hot', q = '';
  function renderMenu() {
    $('#cats').innerHTML = CATS.map(c => `<button class="cat ${c.id === cat && !q ? 'on' : ''}" data-cat="${c.id}">${T(c.ar, c.en)}</button>`).join('');
    const norm = s => s.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    const list = q ? MENU.filter(m => norm(m.ar + ' ' + m.en).includes(norm(q))) : MENU.filter(m => m.c === cat);
    const feat = list.filter(m => m.img), rest = list.filter(m => !m.img);
    $('#menuFeature').innerHTML = feat.map(m => { const c = cutOf(m); return `<article class="mf" data-open="${m.id}"><div class="mf-img ${c ? 'cut' : 'photo'}"><img src="assets/img/${c || m.img}.webp" alt="${T(m.ar, m.en)}" loading="lazy">${m.real ? `<span class="tag real">${T('صورة حقيقية', 'Real photo')}</span>` : m.t === 'sig' ? `<span class="tag">${T('توقيع خليج نعمة', 'Signature')}</span>` : m.t === 'hot' ? `<span class="tag">${T('اختيار الشتا', 'Winter pick')}</span>` : ''}</div><div class="mf-body"><b>${T(m.ar, m.en)}</b>${m.dar ? `<small>${T(m.dar, m.den)}</small>` : ''}<div class="mf-row"><span class="price">${money(m.p)}</span><button class="add" data-add="${m.id}" aria-label="add"><svg><use href="#ico-plus"/></svg></button></div></div></article>`; }).join('');
    $('#menuList').innerHTML = rest.length || feat.length ? rest.map(m => `<div class="ml" data-open="${m.id}"><b>${T(m.ar, m.en)}</b><span class="dots"></span><span class="price">${money(m.p)}</span><button class="add" data-add="${m.id}" aria-label="add"><svg><use href="#ico-plus"/></svg></button></div>`).join('')
      : `<p class="empty">${T('مش لاقيين ده… اسألنا على واتساب', "Can't find it… ask us on WhatsApp")}</p>`;
    if (!reduced) { gsap.from('#menuFeature .mf', { y: 40, opacity: 0, stagger: .05, duration: .6, ease: 'power3.out', clearProps: 'transform,opacity' }); gsap.from('#menuFeature .mf-img', { scale: .6, rotate: -8, stagger: .05, duration: .9, ease: 'back.out(1.5)', clearProps: 'transform' }); gsap.from('#menuList .ml', { y: 16, opacity: 0, stagger: .02, duration: .4, ease: 'power2.out', clearProps: 'all' }); }
  }
  $('#cats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; q = ''; $('#menuSearch').value = ''; renderMenu(); });
  $('#menuSearch').addEventListener('input', e => { q = e.target.value.trim(); renderMenu(); });

  /* ---------- planner ---------- */
  const today = new Date(); const iso = d => d.toISOString().slice(0, 10);
  $('#plDate').value = iso(new Date(today.getTime() + 30 * 864e5)); $('#plDate').min = iso(today);
  $('#bkDate').value = iso(today); $('#bkDate').min = iso(today);
  const g = $('#plGuests'); g.addEventListener('input', () => $('#plGuestsOut').textContent = g.value);
  const single = (wrapSel, cls) => $(wrapSel).addEventListener('click', e => { const b = e.target.closest('.' + cls); if (!b) return; $$('.' + cls, $(wrapSel)).forEach(x => x.classList.remove('on')); b.classList.add('on'); });
  single('#plTypes', 'chip'); single('#bkArea', 'area');
  const pick = v => { const [a, e] = v.split('|'); return T(a, e); };
  $('#planner').addEventListener('submit', e => {
    e.preventDefault();
    const type = pick($('#plTypes .on').dataset.v);
    const extras = $$('#plExtras input:checked').map(i => pick(i.value)).join('، ') || T('لا شيء', 'None');
    const msg = T(`أهلًا خليج نعمة 👋\nعايز أخطط لمناسبة:\n• النوع: ${type}\n• عدد الضيوف: ${g.value}\n• التاريخ: ${$('#plDate').value}\n• إضافات: ${extras}\nممكن تفاصيل الأسعار؟`,
      `Hello Naama Bay 👋\nI'd like to plan an occasion:\n• Type: ${type}\n• Guests: ${g.value}\n• Date: ${$('#plDate').value}\n• Extras: ${extras}\nCould you share the prices?`);
    open(wa(msg), '_blank');
  });

  /* ---------- booking ---------- */
  let guests = 4;
  $$('.stepper [data-step]').forEach(b => b.addEventListener('click', () => { guests = Math.min(40, Math.max(1, guests + +b.dataset.step)); $('#bkGuests').textContent = guests; }));
  $('#bookForm').addEventListener('submit', e => {
    e.preventDefault();
    const ids = Object.keys(tray).filter(k => tray[k] > 0 && byId[k]);
    const items = ids.map(k => `  - ${T(byId[k].ar, byId[k].en)} × ${tray[k]}`).join('\n');
    const total = ids.reduce((a, k) => a + tray[k] * byId[k].p, 0);
    const notes = $('#bkNotes').value.trim();
    const msg = T(`أهلًا خليج نعمة 👋\nحجز ترابيزة:\n• الاسم: ${$('#bkName').value}\n• عدد الأفراد: ${guests}\n• اليوم: ${$('#bkDate').value}\n• الساعة: ${$('#bkTime').value}\n• القعدة: ${pick($('#bkArea .on').dataset.v)}${items ? `\n• طلب مسبق:\n${items}\n  الإجمالي التقريبي: ${total} ج.م` : ''}${notes ? `\n• ملاحظات: ${notes}` : ''}`,
      `Hello Naama Bay 👋\nTable booking:\n• Name: ${$('#bkName').value}\n• Guests: ${guests}\n• Day: ${$('#bkDate').value}\n• Time: ${$('#bkTime').value}\n• Corner: ${pick($('#bkArea .on').dataset.v)}${items ? `\n• Pre-order:\n${items}\n  Approx. total: ${total} EGP` : ''}${notes ? `\n• Notes: ${notes}` : ''}`);
    open(wa(msg), '_blank');
  });

  /* ---------- map ---------- */
  $('#mapBtn').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('كافيه خليج نعمة طهطا سوهاج');
  const mapObs = new IntersectionObserver(es => { if (es[0].isIntersecting) { $('#mapFrame').src = `https://maps.google.com/maps?q=${encodeURIComponent(CFG.mapQuery)}&z=13&output=embed`; mapObs.disconnect(); } }, { rootMargin: '400px' });
  mapObs.observe($('#mapFrame'));
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- boot ---------- */
  applyLang();
  heroTimeline();
  setupShow();
  reveals();
  intro().then(() => {
    if (!reduced) gsap.from('.hc1 > *', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out' });
    ScrollTrigger.refresh();
  });
  let rw = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 80) { rw = innerWidth; ScrollTrigger.refresh(); } });
})();
