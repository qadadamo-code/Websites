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
    renderMenu(); renderMood(); renderTray(); renderSig();
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

  const heroLen = () => innerHeight * (innerWidth < 720 ? 2.6 : 3.4);
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

  /* ---------- signatures (pinned horizontal) ---------- */
  function renderSig() {
    $('#sigTrack').innerHTML = window.NB_SIG.map((x, i) => {
      const m = byId[x.id], c = CATS.find(k => k.id === m.c);
      return `<article class="sc"><div class="sc-body"><span class="sc-num">${String(i + 1).padStart(2, '0')}</span><span class="sc-tag">${T(c.ar, c.en)}</span><h3>${T(m.ar, m.en)}</h3><p>${T(x.ar2, x.en2)}</p><div class="sc-row"><span class="price">${money(m.p)}</span><button class="add" data-add="${m.id}" aria-label="add"><svg><use href="#ico-plus"/></svg></button></div></div><div class="sc-media"><img src="assets/img/${m.img}.webp" alt="${T(m.ar, m.en)}" loading="lazy"></div></article>`;
    }).join('');
  }
  let sigST = null;
  function setupSpaces() {
    const track = $('#sigTrack');
    if (sigST) { sigST.kill(); sigST = null; gsap.set(track, { x: 0 }); }
    if (innerWidth <= 720 || reduced) return;
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const dir = isEn() ? -1 : 1;
    const tw = gsap.to(track, { x: () => dir * dist(), ease: 'none' });
    sigST = ScrollTrigger.create({ trigger: '.sig-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, animation: tw, invalidateOnRefresh: true });
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
    gsap.to('.sm-a', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.story', scrub: true } });
    gsap.to('.sm-b', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.story', scrub: true } });
    gsap.from('.g', { y: 60, opacity: 0, stagger: .07, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.gal-grid', start: 'top 85%' } });
    const pans = $$('.panel');
    pans.forEach((pn, i) => {
      if (i < pans.length - 1) gsap.to(pn.querySelector('.pn-media'), { scale: .9, opacity: .4, ease: 'none', scrollTrigger: { trigger: pans[i + 1], start: 'top bottom', end: 'top top', scrub: true } });
      gsap.from(pn.querySelector('.pn-body'), { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: pn, start: 'top 55%' } });
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
  const moodBg = { dawn: 'hero-day', noon: 'hero-day', dusk: 'hero-dusk', night: 'hero-night' };
  function renderMood() {
    $('#moodTabs').innerHTML = MOODS.map(m => `<button class="mood-tab ${m.id === mood ? 'on' : ''}" data-mood="${m.id}"><span class="mt-ico mt-${m.id}"></span><span><b>${T(m.ar, m.en)}</b><small>${m.time}</small></span></button>`).join('');
    const m = MOODS.find(x => x.id === mood);
    const st = $('#moodStage'); st.style.backgroundImage = `url(assets/img/${moodBg[mood]}${innerWidth < 720 ? '-m' : ''}.webp)`;
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
