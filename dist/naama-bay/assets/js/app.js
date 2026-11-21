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
    renderMenu(); renderMood(); renderTray();
  }
  $('#langBtn').addEventListener('click', () => {
    const en = !isEn();
    root.lang = en ? 'en' : 'ar'; root.dir = en ? 'ltr' : 'rtl';
    try { localStorage.setItem('nb-lang', root.lang); } catch (e) {}
    applyLang(); setupSpaces(); ScrollTrigger.refresh();
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
  hdr.classList.add('solid');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    hdr.classList.toggle('hide', y > lastY && y > 400 && !document.body.classList.contains('nav-open'));
    lastY = y;
  }, { passive: true });
  $('#burger').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('nav-open')));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduced && !weak && window.Lenis) {
    lenis = new Lenis({ lerp: .1 });
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
     HERO SCENE — a whole day on the Nile
     ========================================================= */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent && parent.appendChild(el); return el; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function buildScene() {
    // stars
    const stars = $('#stars');
    for (let i = 0; i < 120; i++) mk('circle', { cx: rnd() * 1600, cy: rnd() * 420, r: rnd() < .12 ? 2.4 : 1.2 + rnd() * .8, fill: '#fff', opacity: .4 + rnd() * .6 }, stars);
    // palms on far bank
    const palms = $('#palms');
    for (let x = 20; x < 1600; x += 46 + rnd() * 60) {
      if ((x > 240 && x < 370) || (x > 970 && x < 1100)) continue;
      const h = 34 + rnd() * 34, y = 552 - rnd() * 8, lean = (rnd() - .5) * 10;
      const tx = x + lean, ty = y - h;
      mk('path', { d: `M${x - 2} ${y} Q${x + lean * .3} ${y - h / 2} ${tx - 1.5} ${ty} L${tx + 1.5} ${ty} Q${x + lean * .3 + 3} ${y - h / 2} ${x + 2} ${y}Z` }, palms);
      for (let k = 0; k < 6; k++) {
        const a = (-160 + k * 28 + (rnd() - .5) * 10) * Math.PI / 180, L = 14 + rnd() * 8;
        const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L + 6;
        const cx = tx + Math.cos(a) * L * .55, cy = ty + Math.sin(a) * L * .55 - 5;
        mk('path', { d: `M${tx} ${ty} Q${cx} ${cy - 3} ${ex} ${ey} Q${cx} ${cy + 3} ${tx} ${ty}Z` }, palms);
      }
    }
    // glitter (sun reflection)
    const gl = $('#glitter');
    for (let i = 0; i < 42; i++) {
      const y = 600 + Math.pow(rnd(), 1.4) * 290, spread = 30 + (y - 600) * .35;
      mk('rect', { x: 800 + (rnd() - .5) * spread * 2 - 10, y, width: 12 + rnd() * 46 * (y / 700), height: 2 + rnd() * 2.5, rx: 2, class: 'gl', style: `animation-delay:${(-rnd() * 2).toFixed(2)}s` }, gl);
    }
    // night reflections (neon + gold streaks)
    const nr = $('#nightRefl');
    [[290, '#FFD58A'], [334, '#FFD58A'], [1010, '#FFD58A'], [1074, '#FF4FA3'], [620, '#7FD0C6'], [1420, '#FF4FA3']].forEach(([x, c]) => {
      for (let i = 0; i < 9; i++) mk('rect', { x: x - 6 + (rnd() - .5) * 10, y: 598 + i * 11, width: 10 + rnd() * 10, height: 3, rx: 1.5, fill: c, opacity: (1 - i / 10) * .8, class: 'gl', style: `animation-delay:${(-rnd() * 2).toFixed(2)}s` }, nr);
    });
    // terrace posts
    const posts = $('#posts');
    for (let x = 40; x < 1600; x += 170) mk('rect', { x, y: 688, width: 14, height: 90, rx: 3 }, posts);
    // bulbs along wire
    const wire = $('#wire'), bulbs = $('#bulbs'), L = wire.getTotalLength();
    for (let i = 1; i < 26; i++) {
      const p = wire.getPointAtLength(L * i / 26);
      const g = mk('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, bulbs);
      mk('line', { x1: 0, y1: 0, x2: 0, y2: 14, stroke: '#2A2A2A', 'stroke-width': 2 }, g);
      mk('circle', { cx: 0, cy: 26, r: 34, fill: 'url(#bulbG)', class: 'glow', opacity: 0 }, g);
      mk('circle', { cx: 0, cy: 22, r: 8, fill: '#8A8A80', class: 'core' }, g);
    }
    // boat lights along sail edge + mast
    const bl = $('#boatLights');
    for (let i = 0; i <= 12; i++) { const t = i / 12; mk('circle', { cx: -8 + 100 * t, cy: -228 + 218 * t, r: 3.2 }, bl); }
    for (let i = 0; i <= 9; i++) { const t = i / 9; mk('circle', { cx: -120 + 240 * t, cy: 6 + Math.sin(t * Math.PI) * 10, r: 3 }, bl); }
    const st = document.createElement('style');
    st.textContent = '.gl{animation:glit 1.8s ease-in-out infinite alternate}@keyframes glit{from{opacity:.15}to{opacity:1}}';
    document.head.appendChild(st);
  }

  function heroTimeline() {
    const sky = ['#sky0', '#sky1', '#sky2'], wat = ['#wat0', '#wat1'];
    const P = {
      day:   { sky: ['#7EC3E6', '#BFE3F0', '#FCE9C8'], wat: ['#8FC9D9', '#2E7E98'], cliffs: '#DDB582', cliffs2: '#C99A64', bank: '#3D6B4F', houses: '#C9A87F', ground: '#1E3B2E', lawn: '#2F6B45', rail: '#F4EFE6', sail: '#F7EEDC', glit: '#FFF6DA' },
      dusk:  { sky: ['#40508E', '#E8805A', '#FFC86E'], wat: ['#E09A62', '#4A3F6B'], cliffs: '#D27F4C', cliffs2: '#A85E3C', bank: '#2E2B3A', houses: '#8A5A4A', ground: '#16121D', lawn: '#2A3528', rail: '#F0D7C2', sail: '#F6C9A0', glit: '#FFD27A' },
      night: { sky: ['#040B1F', '#0C1C40', '#1C2B58'], wat: ['#0D1D3B', '#040A1A'], cliffs: '#18213D', cliffs2: '#121A32', bank: '#060D1B', houses: '#111A2E', ground: '#03070F', lawn: '#0A1913', rail: '#3E4D6B', sail: '#3B4561', glit: '#FFD27A' }
    };
    const set = (sel, attr, v) => gsap.set(sel, { attr: { [attr]: v } });
    gsap.set('#sun', { x: 790, y: 150 });
    gsap.set('#moon', { y: 120 });
    gsap.set('#felucca', { x: 1780, y: 668, scale: .62, transformOrigin: '50% 50%' });
    gsap.set('#birds', { x: 880, y: 250 });
    if (innerWidth / innerHeight < 1) { gsap.set('#table', { attr: { transform: 'translate(905 770) scale(.8)' } }); gsap.set('#birds', { display: 'none' }); }

    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    const phase = (to, at, dur) => {
      sky.forEach((s, i) => tl.to(s, { attr: { 'stop-color': to.sky[i] }, duration: dur }, at));
      wat.forEach((s, i) => tl.to(s, { attr: { 'stop-color': to.wat[i] }, duration: dur }, at));
      [['#cliffs', to.cliffs], ['#cliffs2', to.cliffs2], ['#bank', to.bank], ['#houses', to.houses], ['#terrace>path:first-child', to.ground], ['#lawn', to.lawn], ['#posts', to.rail], ['#sail', to.sail], ['#glitter', to.glit]]
        .forEach(([s, c]) => tl.to(s, { attr: { fill: c }, duration: dur }, at));
      tl.to('#rail', { attr: { stroke: to.rail }, duration: dur }, at);
    };
    // 0 → 1 timeline units = whole hero scroll
    tl.to('#sun', { x: 800, y: 430, duration: .45 }, 0)
      .to('#sun', { x: 800, y: 650, duration: .2 }, .45)
      .to('#birds', { x: 1450, y: 170, duration: .45 }, 0)
      .to('#birds', { opacity: 0, duration: .1 }, .4)
      .to('#felucca', { x: -260, duration: 1 }, 0);
    phase(P.dusk, .18, .3);
    phase(P.night, .52, .22);
    tl.to('#glitter', { opacity: .9, duration: .2 }, .2)
      .to('#glitter', { opacity: 0, duration: .1 }, .56)
      .to('#stars', { opacity: 1, duration: .2 }, .6)
      .to('#moon', { opacity: 1, y: 0, duration: .3 }, .62)
      .to('#winLights', { opacity: 1, duration: .1 }, .55)
      .to('#nightRefl', { opacity: 1, duration: .15 }, .62)
      .to('#boatLights', { opacity: 1, duration: .08 }, .58)
      .to('#bulbs .core', { attr: { fill: '#FFE7A8' }, duration: .02, stagger: .004 }, .56)
      .to('#bulbs .glow', { opacity: 1, duration: .02, stagger: .004 }, .56)
      // copy
      .to('.hc1', { opacity: 0, y: -40, duration: .08 }, .14)
      .to('#scrollHint', { opacity: 0, duration: .05 }, .06)
      .fromTo('.hc2', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .08 }, .3)
      .to('.hc2', { opacity: 0, y: -40, duration: .08 }, .48)
      .fromTo('.hc3', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .08 }, .64)
      .to('.hc3', { opacity: 0, y: -40, duration: .08 }, .8)
      .fromTo('.hc4', { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .1 }, .88)
      .to({}, { duration: .06 }, .98);

    // clock
    const kf = [[0, 400], [.45, 1050], [.75, 1380], [1, 1425]];
    const clockTxt = $('#clockTxt'), clockAm = $('#clockAmPm');
    const setClock = p => {
      let m = kf[0][1];
      for (let i = 1; i < kf.length; i++) if (p <= kf[i][0]) { const [p0, m0] = kf[i - 1], [p1, m1] = kf[i]; m = m0 + (m1 - m0) * (p - p0) / (p1 - p0); break; } else m = kf[i][1];
      m = Math.round(m / 5) * 5; let h = Math.floor(m / 60), mm = m % 60; const pm = h >= 12; h = h % 12 || 12;
      clockTxt.textContent = `${h}:${String(mm).padStart(2, '0')}`; clockAm.textContent = pm ? T('م', 'PM') : T('ص', 'AM');
    };
    setClock(0);

    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: () => '+=' + innerHeight * (innerWidth < 720 ? 2.6 : 3.2),
      pin: '.hero-pin', pinSpacing: true, scrub: reduced ? true : .8, animation: tl,
      onUpdate: s => setClock(s.progress)
    });
  }

  /* ---------- intro ---------- */
  function intro() {
    const it = $('#intro');
    if (reduced) { it.remove(); return Promise.resolve(); }
    return new Promise(res => {
      const tl = gsap.timeline({ onComplete: () => { it.remove(); res(); } });
      gsap.set('.ib-outline', { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
      gsap.set('.intro-mark', { opacity: 0 });
      tl.to('.ib-outline', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
        .to('.ib-outline', { fillOpacity: 1, duration: .4 }, '-=.25')
        .set('.intro-mark', { opacity: 1 });
      tl.fromTo('.intro-mark', { clipPath: 'inset(100% 0 0 0)', y: 20 }, { clipPath: 'inset(0% 0 0 0)', y: 0, duration: .9, ease: 'power3.out' }, '-=.2')
        .from('.intro-word span', { y: 40, opacity: 0, stagger: .14, duration: .6, ease: 'back.out(1.6)' }, '-=.35')
        .from('.intro-sub', { opacity: 0, letterSpacing: '.6em', duration: .6 }, '-=.3')
        .to('.intro-badge', { scale: .9, duration: .5, ease: 'power2.in' }, '+=.5')
        .to('#intro', { clipPath: 'circle(0% at 50% 50%)', duration: .8, ease: 'power3.inOut' }, '-=.15');
      gsap.set('#intro', { clipPath: 'circle(150% at 50% 50%)' });
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
    gsap.to('.ph-gate', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.story', scrub: true } });
    gsap.to('.ph-ring', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.story', scrub: true } });
    gsap.from('.pol', { y: 80, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.polaroids', start: 'top 85%' } });
    gsap.from('.ev', { y: 50, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.ev-grid', start: 'top 85%' } });
  }

  /* ---------- horizontal spaces ---------- */
  let spacesST = null;
  function setupSpaces() {
    const track = $('#spacesTrack');
    if (spacesST) { spacesST.kill(); spacesST = null; gsap.set(track, { x: 0 }); }
    if (innerWidth < 900 || reduced) { track.style.overflowX = 'auto'; track.style.width = 'auto'; return; }
    track.style.overflowX = ''; track.style.width = '';
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const dir = isEn() ? -1 : 1;
    const tw = gsap.to(track, { x: () => dir * dist(), ease: 'none' });
    spacesST = ScrollTrigger.create({ trigger: '#spaces', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, animation: tw, invalidateOnRefresh: true });
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
  const thumb = m => m.img ? `<img src="assets/img/${m.img}.webp" alt="" loading="lazy">` : `<span class="ph0"></span>`;
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
  scrim.addEventListener('click', () => openDrawer(false));
  $('#drawerGo').addEventListener('click', () => openDrawer(false));
  document.addEventListener('click', e => { const b = e.target.closest('.add[data-add]'); if (b) addItem(b.dataset.add, b); });

  /* ---------- mood ---------- */
  let mood = 'dusk';
  const moodBg = { dawn: 'linear-gradient(160deg,#5FAFD6 0%,#9BD0E6 50%,#F6D7A6 100%)', noon: 'linear-gradient(160deg,#2F8FC7 0%,#5DB6DF 60%,#BFE6F2 100%)', dusk: 'linear-gradient(160deg,#3D4C8A 0%,#C2626A 55%,#F4A04A 100%)', night: 'linear-gradient(160deg,#030918 0%,#0C1C40 60%,#2A2363 100%)' };
  function renderMood() {
    $('#moodTabs').innerHTML = MOODS.map(m => `<button class="mood-tab ${m.id === mood ? 'on' : ''}" data-mood="${m.id}"><span class="mt-ico mt-${m.id}"></span><span><b>${T(m.ar, m.en)}</b><small>${m.time}</small></span></button>`).join('');
    const m = MOODS.find(x => x.id === mood);
    const st = $('#moodStage'); st.style.background = moodBg[mood];
    st.innerHTML = `<h3>${T(m.ar, m.en)}</h3><p>${T(m.ar2, m.en2)}</p><div class="mood-items">${m.items.map(id => { const it = byId[id]; return `<div class="mood-item"><div class="mi-img">${it.img ? `<img src="assets/img/${it.img}.webp" alt="" loading="lazy">` : '<svg><use href="#ico-cup"/></svg>'}</div><b>${T(it.ar, it.en)}</b><div class="mi-row"><span>${money(it.p)}</span><button class="add" data-add="${id}" aria-label="add"><svg><use href="#ico-plus"/></svg></button></div></div>`; }).join('')}</div>`;
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
    $('#menuFeature').innerHTML = feat.map(m => `<article class="mf"><div class="mf-img"><img src="assets/img/${m.img}.webp" alt="${T(m.ar, m.en)}" loading="lazy">${m.real ? `<span class="tag real">${T('صورة حقيقية', 'Real photo')}</span>` : m.t === 'sig' ? `<span class="tag">${T('توقيع خليج نعمة', 'Naama signature')}</span>` : m.t === 'hot' ? `<span class="tag">${T('اختيار الشتا', 'Winter pick')}</span>` : ''}</div><div class="mf-body"><b>${T(m.ar, m.en)}</b>${m.dar ? `<small>${T(m.dar, m.den)}</small>` : ''}<div class="mf-row"><span class="price">${money(m.p)}</span><button class="add" data-add="${m.id}" aria-label="add"><svg><use href="#ico-plus"/></svg></button></div></div></article>`).join('');
    $('#menuList').innerHTML = rest.length || feat.length ? rest.map(m => `<div class="ml"><b>${T(m.ar, m.en)}</b><span class="dots"></span><span class="price">${money(m.p)}</span><button class="add" data-add="${m.id}" aria-label="add"><svg><use href="#ico-plus"/></svg></button></div>`).join('')
      : `<p class="empty">${T('مش لاقيين ده… اسألنا على واتساب', "Can't find it… ask us on WhatsApp")}</p>`;
    if (!reduced) gsap.from('#menuFeature .mf, #menuList .ml', { y: 20, opacity: 0, stagger: .03, duration: .45, ease: 'power2.out', clearProps: 'all' });
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
  buildScene();
  applyLang();
  heroTimeline();
  setupSpaces();
  reveals();
  intro().then(() => {
    if (!reduced) gsap.from('.hc1 > *', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out' });
    ScrollTrigger.refresh();
  });
  let rw = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - rw) > 80) { rw = innerWidth; setupSpaces(); ScrollTrigger.refresh(); } });
})();
