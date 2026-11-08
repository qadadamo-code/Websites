/* Al Dali Furniture KSA — interactions */
(() => {
  const D = window.AD, LG = window.ALDALI_LOGO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const qs = new URLSearchParams(location.search);
  let L = qs.get('lang') || (function () { try { return localStorage.getItem('ad_lang'); } catch (e) { return null; } })() || 'ar';
  if (L !== 'en') L = 'ar';
  const T = o => (o && (o[L] !== undefined ? o[L] : o.ar)) || '';
  const isMob = () => innerWidth <= 700;
  const fmt = n => Number(n).toLocaleString('en-US');
  const cur = () => T(D.config.currency);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- language ---------- */
  function applyStaticLang() {
    document.documentElement.lang = L;
    document.documentElement.dir = L === 'ar' ? 'rtl' : 'ltr';
    $$('[data-en]').forEach(el => {
      if (el.dataset.ar === undefined) el.dataset.ar = el.innerHTML;
      el.innerHTML = L === 'en' ? el.dataset.en : el.dataset.ar;
    });
    $('#langBtn').textContent = L === 'ar' ? 'EN' : 'ع';
    if (L === 'en') document.title = 'Al Dali Furniture KSA | Your home, room by room';
  }
  applyStaticLang();
  $('#langBtn').addEventListener('click', () => {
    const nl = L === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('ad_lang', nl); sessionStorage.setItem('ad_intro', '1'); sessionStorage.setItem('ad_y', String(scrollY)); } catch (e) {}
    const u = new URL(location.href); u.searchParams.set('lang', nl); location.href = u.toString();
  });

  /* ---------- whatsapp ---------- */
  const wa = msg => `https://wa.me/${D.config.whatsapp}?text=${encodeURIComponent(msg)}`;
  const WA_MSG = {
    hello: { ar: 'مرحبا الدالي للمفروشات، أبغى أستفسر عن تأثيث بيتي.', en: 'Hello Al Dali Furniture, I would like to ask about furnishing my home.' },
    visit: { ar: 'مرحبا، وين أقرب معرض للدالي للمفروشات؟ وأبغى أحجز زيارة.', en: 'Hello, where is the nearest Al Dali showroom? I would like to book a visit.' }
  };
  $$('[data-wa]').forEach(a => { a.href = wa(T(WA_MSG[a.dataset.wa])); a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- logo ---------- */
  function logoHTML(txt = true, cls = '') {
    const p = LG.p;
    const path = (k, c) => `<path class="lg-${c || k}" d="${p[k]}"/>`;
    return `<div class="logo ${cls}"><svg viewBox="${LG.vb}" aria-hidden="true">${path('swoosh')}${path('d')}${path('house')}${path('a1')}${path('lam')}${path('a2')}${path('dots')}</svg>${txt ? '<span class="logo__txt"><i>FURNITURE</i><b>KSA</b></span>' : ''}</div>`;
  }
  $('#introLogo').innerHTML = logoHTML(true);
  $('#navLogo').innerHTML = logoHTML(true);
  $('#footLogo').innerHTML = logoHTML(true);
  $('#manifestoMark').innerHTML = logoHTML(false);
  $('#planLogo').innerHTML = logoHTML(false);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- smooth scroll ---------- */
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = $(id); if (!el) return;
    e.preventDefault(); lenis.scrollTo(el, { offset: id === '#top' ? 0 : -70, duration: 1.4 });
  }));

  /* ---------- hero frames ---------- */
  const N = 64, frames = new Array(N);
  const cvs = $('#heroCanvas'), ctx = cvs.getContext('2d');
  let curF = 0, loaded = 0;
  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cvs.width = cvs.clientWidth * dpr; cvs.height = cvs.clientHeight * dpr; draw(curF, true);
  }
  function nearest(i) { for (let d = 0; d < N; d++) { if (frames[i - d] && frames[i - d].complete && frames[i - d].naturalWidth) return frames[i - d]; if (frames[i + d] && frames[i + d].complete && frames[i + d].naturalWidth) return frames[i + d]; } return null; }
  let lastDrawn = -1;
  function draw(i, force) {
    i = Math.max(0, Math.min(N - 1, Math.round(i)));
    if (i === lastDrawn && !force) return;
    const img = nearest(i); if (!img) return;
    lastDrawn = i;
    const cw = cvs.width, ch = cvs.height, iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
    const fx = isMob() ? .42 : .5;
    ctx.drawImage(img, (cw - w) * fx, (ch - h) / 2, w, h);
  }
  function loadFrames(onProg) {
    return new Promise(res => {
      const order = [0, N - 1]; for (let i = 1; i < N - 1; i++) order.push(i);
      let done = 0;
      order.forEach((i, k) => {
        const im = new Image(); im.decoding = 'async';
        im.onload = im.onerror = () => { done++; loaded = done; onProg && onProg(done / N); if (i === 0) draw(0, true); if (done === N) res(); };
        setTimeout(() => { im.src = `assets/seq/f${String(i + 1).padStart(3, '0')}.webp`; }, k < 2 ? 0 : 10 + k * 6);
        frames[i] = im;
      });
    });
  }
  addEventListener('resize', () => { sizeCanvas(); });

  /* ---------- intro ---------- */
  const skipIntro = (() => { try { return sessionStorage.getItem('ad_intro') === '1'; } catch (e) { return false; } })();
  const intro = $('#intro');
  function prepDraw(el) {
    const len = el.getTotalLength ? el.getTotalLength() : 3000;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0, stroke: '#fff', strokeWidth: 7 });
    return len;
  }
  function runIntro() {
    sizeCanvas();
    const bar = $('#introBar');
    const fp = loadFrames(p => gsap.to(bar, { width: (p * 100) + '%', duration: .3, overwrite: true }));
    if (skipIntro || reduce) {
      intro.remove(); document.body.classList.remove('is-loading'); afterIntro(true);
      try { const y = +sessionStorage.getItem('ad_y'); sessionStorage.removeItem('ad_y'); if (y) setTimeout(() => lenis.scrollTo(y, { immediate: true }), 60); } catch (e) {}
      return;
    }
    const lg = $('#introLogo');
    const q = c => lg.querySelector('.lg-' + c);
    ['d', 'swoosh'].forEach(c => prepDraw(q(c)));
    gsap.set([q('a1'), q('lam'), q('a2')], { opacity: 0, y: -160 });
    gsap.set(q('house'), { opacity: 0, y: 140, scale: .5, transformOrigin: '50% 100%' });
    gsap.set(q('dots'), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(lg.querySelector('.logo__txt i'), { opacity: 0, letterSpacing: '1.1em' });
    gsap.set(lg.querySelector('.logo__txt b'), { opacity: 0, y: 24 });
    const tl = gsap.timeline({ delay: .25 });
    tl.to(q('d'), { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
      .to(q('d'), { fillOpacity: 1, strokeWidth: 0, duration: .35 }, '-=.15')
      .to(q('house'), { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.6)' }, '-=.35')
      .to([q('a2'), q('lam'), q('a1')], { opacity: 1, y: 0, duration: .7, stagger: .12, ease: 'power4.out' }, '-=.45')
      .to(q('swoosh'), { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, '-=.35')
      .to(q('swoosh'), { fillOpacity: 1, strokeWidth: 0, duration: .3 }, '-=.15')
      .to(q('dots'), { scale: 1, duration: .6, ease: 'elastic.out(1,.45)', stagger: .08 }, '-=.2')
      .to(lg.querySelector('.logo__txt i'), { opacity: 1, letterSpacing: '.32em', duration: 1, ease: 'power3.out' }, '-=.6')
      .to(lg.querySelector('.logo__txt b'), { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, '-=.7');
    const minTime = new Promise(r => tl.eventCallback('onComplete', r));
    const maxWait = new Promise(r => setTimeout(r, 6500));
    Promise.all([minTime, Promise.race([fp.then(() => 0), new Promise(r => setTimeout(r, 1200))])]).then(() => Promise.race([Promise.resolve(), maxWait])).then(() => {
      try { sessionStorage.setItem('ad_intro', '1'); } catch (e) {}
      const out = gsap.timeline({ onComplete: () => { intro.remove(); } });
      out.to(lg, { scale: .82, opacity: 0, duration: .6, ease: 'power2.in' })
        .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' }, '-=.15')
        .add(() => { document.body.classList.remove('is-loading'); afterIntro(false); }, '-=.75');
      intro.classList.add('done');
    });
  }

  /* ---------- after intro ---------- */
  function afterIntro(instant) {
    lenis.start();
    const lines = $$('.hero__title .line > *');
    if (!instant) {
      gsap.from(lines, { yPercent: 110, duration: 1.2, stagger: .1, ease: 'power4.out' });
      gsap.from(['.hero__copy .eyebrow', '.hero__lead', '.hero__btns', '.hero__steps', '.hero__scroll'], { opacity: 0, y: 30, duration: 1, stagger: .08, delay: .35, ease: 'power3.out' });
      const nv = $('#nav'); nv.classList.add('hide'); setTimeout(() => nv.classList.remove('hide'), 450);
    }
    buildScroll();
  }

  /* ---------- marquee ---------- */
  (function () {
    const words = D.rooms.map(r => T(r).t).concat(L === 'ar' ? ['بيتك بذوقك'] : ['Your home, your taste']);
    const one = words.map(w => `<span>${w}</span>`).join('');
    $('#marquee').innerHTML = one + one + one + one;
  })();

  /* ---------- manifesto words ---------- */
  (function () {
    const el = $('#manifesto');
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  })();

  /* ---------- house plan ---------- */
  const PLAN = {
    dining: [20, 20, 220, 220], corners: [240, 20, 300, 260], majlis: [540, 20, 240, 260],
    bedroom: [20, 240, 260, 300], kids: [280, 280, 170, 140], dressing: [280, 420, 170, 120],
    office: [450, 280, 150, 260], entrance: [600, 280, 180, 260]
  };
  function glyph(id, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2 - 12;
    const R = (a, b, c, d, r = 4, f) => `<rect ${f ? 'class="f"' : ''} x="${a}" y="${b}" width="${c}" height="${d}" rx="${r}"/>`;
    const C = (a, b, r, f) => `<circle ${f ? 'class="f"' : ''} cx="${a}" cy="${b}" r="${r}"/>`;
    switch (id) {
      case 'bedroom': return R(cx - 50, cy - 70, 100, 12, 3, 1) + R(cx - 50, cy - 58, 100, 110, 6) + R(cx - 42, cy - 50, 38, 20, 6, 1) + R(cx + 4, cy - 50, 38, 20, 6, 1) + R(cx - 50, cy + 18, 100, 34, 0, 1) + R(cx - 82, cy - 68, 26, 26, 3) + R(cx + 56, cy - 68, 26, 26, 3) + R(cx - 48, cy + 70, 96, 22, 3);
      case 'corners': return `<path class="f" d="M${cx - 110} ${cy - 70} h220 v34 h-186 v110 h-34 z"/>` + C(cx + 20, cy + 10, 30) + R(cx - 40, cy + 70, 140, 14, 3) + R(cx + 60, cy - 30, 44, 44, 10);
      case 'dining': return R(cx - 34, cy - 60, 68, 120, 30, 1) + [-40, 0, 40].map(d => R(cx - 62, cy + d - 10, 18, 20, 4) + R(cx + 44, cy + d - 10, 18, 20, 4)).join('') + R(cx - 10, cy - 84, 20, 16, 4) + R(cx - 10, cy + 68, 20, 16, 4);
      case 'majlis': return `<path class="f" d="M${x + 22} ${y + 34} h${w - 44} v26 h-${w - 96} v${h - 110} h-26 z"/><path class="f" d="M${x + w - 22} ${y + 60} v${h - 110} h-26 v-${h - 110} z"/>` + C(cx + 4, cy + 26, 26) + C(cx + 4, cy + 26, 10, 1);
      case 'kids': return R(cx - 56, cy - 34, 44, 74, 6) + `<path d="M${cx - 56} ${cy - 34} l22 -18 l22 18"/>` + C(cx + 30, cy + 10, 26, 1) + R(cx + 10, cy - 46, 50, 12, 3);
      case 'dressing': return R(x + 14, y + 16, w - 28, 16, 2, 1) + R(x + 14, y + 32, 16, h - 60, 2, 1) + R(cx - 22, cy - 2, 44, 26, 4) + C(cx + 50, cy + 14, 10);
      case 'office': return R(cx - 46, cy - 52, 92, 40, 4, 1) + C(cx, cy + 6, 14) + R(x + 14, y + h - 70, w - 28, 12, 2, 1);
      case 'entrance': return R(cx - 50, y + 22, 100, 18, 9, 1) + C(cx, y + 18, 12) + `<path d="M${x + w - 70} ${y + h - 14} a56 56 0 0 1 56 -56"/><line x1="${x + w - 14}" y1="${y + h - 70}" x2="${x + w - 14}" y2="${y + h - 14}"/>` + R(cx - 60, cy + 30, 70, 18, 4);
    }
    return '';
  }
  (function buildPlan() {
    let s = '';
    D.rooms.forEach((r, i) => {
      const [x, y, w, h] = PLAN[r.id];
      s += `<g class="room" data-id="${r.id}" tabindex="0" role="button" aria-label="${T(r).t}"><rect class="rbg" x="${x}" y="${y}" width="${w}" height="${h}"/><g class="rfur">${glyph(r.id, x, y, w, h)}</g><text class="rnum" x="${x + 14}" y="${y + 22}" style="text-anchor:start">${r.n}</text><text x="${x + w / 2}" y="${y + h - 18}">${shortName(r)}</text></g>`;
    });
    s += `<rect class="plan-wall" x="20" y="20" width="760" height="520" rx="6"/><path class="plan-door" d="M690 540 a60 60 0 0 0 -60 -60"/>`;
    $('#floor').innerHTML = s;
    $$('#floor .room').forEach(g => {
      g.addEventListener('click', () => { selectRoom(g.dataset.id, true); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRoom(g.dataset.id, true); } });
    });
  })();
  function shortName(r) {
    const m = { bedroom: ['غرفة النوم', 'Bedroom'], corners: ['المعيشة', 'Living'], dining: ['السفرة', 'Dining'], majlis: ['المجلس', 'Majlis'], kids: ['الأطفال', 'Kids'], entrance: ['المدخل', 'Entrance'], office: ['المكتب', 'Office'], dressing: ['الدريسنج', 'Dressing'] };
    return m[r.id][L === 'ar' ? 0 : 1];
  }
  let curRoom = null;
  function selectRoom(id, user) {
    if (id === curRoom) { if (user && isMob()) lenis.scrollTo('#roomCard', { offset: -80 }); return; }
    curRoom = id;
    const r = D.rooms.find(x => x.id === id), t = T(r);
    $$('#floor .room').forEach(g => g.classList.toggle('on', g.dataset.id === id));
    const card = $('#roomCard'), img = $('#rcImg');
    const fill = () => {
      img.src = `assets/img/${r.img}.webp`; img.alt = t.t;
      $('#rcN').textContent = r.n; $('#rcT').textContent = t.t; $('#rcS').textContent = t.s; $('#rcD').textContent = t.d;
      $('#rcItems').innerHTML = t.items.map(i => `<li>${i}</li>`).join('');
      $('#rcWa').href = wa(L === 'ar' ? `مرحبا الدالي، أبغى أفرش ${t.t}. ممكن تفاصيل؟` : `Hello Al Dali, I want to furnish my ${t.t.toLowerCase()}. Can you share details?`);
      $('#rcWa').target = '_blank';
      $('#rcShop').dataset.room = D.filters.some(f => f.id === id) ? id : 'all';
    };
    if (!user) { fill(); return; }
    gsap.timeline()
      .to([img, '.house__body > *'], { opacity: 0, y: 12, duration: .25, stagger: .02 })
      .add(fill)
      .fromTo(img, { opacity: 1, y: 0, clipPath: 'inset(0 0 100% 0)', scale: 1.08 }, { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: .8, ease: 'power3.out' })
      .to('.house__body > *', { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power3.out' }, '-=.6');
    if (isMob()) setTimeout(() => lenis.scrollTo('#roomCard', { offset: -80 }), 120);
  }
  selectRoom('corners', false);
  $('#rcShop').addEventListener('click', () => { setFilter($('#rcShop').dataset.room || 'all'); });

  /* ---------- rooms track ---------- */
  (function () {
    $('#roomsTrack').innerHTML = D.rooms.map(r => { const t = T(r); return `
      <article class="rcard" data-id="${r.id}"><img src="assets/img/${r.img}-sm.webp" srcset="assets/img/${r.img}-sm.webp 760w, assets/img/${r.img}.webp 1500w" sizes="(max-width:700px) 78vw, 34vw" alt="${t.t}" loading="lazy">
      <span class="rcard__n">${r.n} / 08</span>
      <div class="rcard__body"><h3>${t.t}</h3><p>${t.s}</p><span class="rcard__go">${L === 'ar' ? 'افتح الغرفة' : 'Open the room'} ${L === 'ar' ? '←' : '→'}</span></div></article>`; }).join('') +
      `<article class="rcard rcard--end">${logoHTML(true)}<h3>${L === 'ar' ? 'وكل زاوية ثانية في بيتك… <b>نفرشها بذوقك.</b>' : 'And every other corner of your home, <b>furnished your way.</b>'}</h3><a class="btn btn--white" href="#plan">${L === 'ar' ? 'صمّم بيتك' : 'Plan your home'}</a></article>`;
    $$('.rcard[data-id]').forEach(c => c.addEventListener('click', () => {
      lenis.scrollTo('#house', { offset: -70, duration: 1.4, onComplete: () => selectRoom(c.dataset.id, true) });
    }));
    $('.rcard--end a').addEventListener('click', e => { e.preventDefault(); lenis.scrollTo('#plan', { offset: -60 }); });
  })();

  /* ---------- taste ---------- */
  let tasteIdx = 0, tasteAuto = null, tasteBusy = false, tasteUser = false;
  (function () {
    $('#tasteTabs').innerHTML = D.styles.map((s, i) => `<button role="tab" data-i="${i}">${T(s).t}</button>`).join('');
    $$('#tasteTabs button').forEach(b => b.addEventListener('click', () => { tasteUser = true; stopTasteAuto(); setTaste(+b.dataset.i); }));
    setTaste(0, true);
  })();
  function setTaste(i, instant) {
    if (tasteBusy && !instant) return;
    const s = D.styles[i], t = T(s);
    $$('#tasteTabs button').forEach((b, k) => b.classList.toggle('on', k === i));
    const txt = () => {
      $('#tasteT').textContent = t.t; $('#tasteK').textContent = t.k; $('#tasteD').textContent = t.d; $('#tasteF').textContent = t.f;
      $('#tasteLabel').textContent = t.t;
      $('#tastePal').innerHTML = s.pal.map(c => `<span style="background:${c}"></span>`).join('');
      $('#tasteWa').href = wa(L === 'ar' ? `مرحبا الدالي، عجبني ذوق «${t.t}» وأبغى أفرش بيتي بنفس الأسلوب.` : `Hello Al Dali, I love the "${t.t}" style and want my home furnished like it.`);
      $('#tasteWa').target = '_blank';
    };
    if (instant) { $('#tasteA').src = `assets/img/${s.img}.webp`; txt(); tasteIdx = i; return; }
    if (i === tasteIdx) return;
    tasteBusy = true;
    const on = $('.taste__img.is-on'), off = $$('.taste__img').find(x => x !== on);
    const fromStart = L === 'ar' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    off.src = `assets/img/${s.img}.webp`;
    const go = () => {
      gsap.set(off, { zIndex: 2, clipPath: fromStart }); gsap.set(on, { zIndex: 1 });
      gsap.timeline({ onComplete: () => { on.classList.remove('is-on'); off.classList.add('is-on'); gsap.set(on, { clipPath: fromStart }); tasteBusy = false; } })
        .to(off, { clipPath: 'inset(0 0 0 0%)', duration: 1.1, ease: 'power4.inOut' })
        .fromTo(off, { scale: 1.08 }, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0)
        .to(['#tasteT', '#tasteK', '#tasteD', '#tasteF'], { opacity: 0, y: -10, duration: .25, stagger: .03 }, 0)
        .add(txt, .3)
        .to(['#tasteT', '#tasteK', '#tasteD', '#tasteF'], { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out' }, .35);
    };
    if (off.complete && off.naturalWidth) go(); else { off.onload = () => { off.onload = null; go(); }; }
    tasteIdx = i;
  }
  function startTasteAuto() { if (tasteUser || tasteAuto) return; tasteAuto = setInterval(() => setTaste((tasteIdx + 1) % D.styles.length), 4200); }
  function stopTasteAuto() { clearInterval(tasteAuto); tasteAuto = null; }

  /* ---------- quiz ---------- */
  let qi = 0, score = {};
  function renderQ() {
    const box = $('#quizBox');
    if (qi >= D.quiz.length) return renderRes();
    const q = D.quiz[qi];
    box.innerHTML = `<div class="quiz__count">${D.quiz.map((_, k) => `<i class="${k <= qi ? 'on' : ''}"></i>`).join('')}</div>
      <p class="quiz__q">${T(q)}</p><div class="quiz__opts">${q.o.map((o, k) => `<button data-k="${k}">${T(o)}</button>`).join('')}</div>`;
    gsap.from(box.children, { opacity: 0, y: 16, duration: .5, stagger: .06, ease: 'power3.out' });
    $$('.quiz__opts button', box).forEach(b => b.addEventListener('click', () => {
      const o = q.o[+b.dataset.k]; for (const k in o.s) score[k] = (score[k] || 0) + o.s[k];
      gsap.to(box.children, { opacity: 0, y: -12, duration: .25, onComplete: () => { qi++; renderQ(); } });
    }));
  }
  function renderRes() {
    const best = D.styles.map(s => ({ s, v: score[s.id] || 0 })).sort((a, b) => b.v - a.v)[0].s, t = T(best);
    const idx = D.styles.indexOf(best);
    $('#quizBox').innerHTML = `<div class="quiz__res"><img src="assets/img/${best.img}.webp" alt="${t.t}"><div>
      <p class="eyebrow">${L === 'ar' ? 'ذوقك الأقرب' : 'Your closest taste'}</p><h4>${t.t}</h4><p>${t.d} ${t.f}.</p>
      <div class="btns"><a class="btn btn--red" target="_blank" rel="noopener" href="${wa(L === 'ar' ? `مرحبا الدالي، سويت اختبار الذوق وطلع ذوقي «${t.t}». أبغى اقتراحات لبيتي.` : `Hello Al Dali, my taste test result is "${t.t}". I would like suggestions for my home.`)}">${L === 'ar' ? 'أرسل نتيجتي' : 'Send my result'}</a>
      <button class="btn btn--line" id="qSee">${L === 'ar' ? 'شوف الغرفة' : 'See the room'}</button>
      <button class="btn btn--line" id="qAgain">${L === 'ar' ? 'أعد' : 'Retake'}</button></div></div></div>`;
    gsap.from('.quiz__res > *', { opacity: 0, y: 20, duration: .7, stagger: .1, ease: 'power3.out' });
    $('#qAgain').addEventListener('click', () => { qi = 0; score = {}; renderQ(); });
    $('#qSee').addEventListener('click', () => { tasteUser = true; stopTasteAuto(); lenis.scrollTo('.taste__stage', { offset: -100, onComplete: () => setTaste(idx) }); });
  }
  renderQ();

  /* ---------- shop ---------- */
  let list = (() => { try { return JSON.parse(localStorage.getItem('ad_list') || '[]'); } catch (e) { return []; } })();
  const saveList = () => { try { localStorage.setItem('ad_list', JSON.stringify(list)); } catch (e) {} };
  const roomName = id => { const r = D.rooms.find(x => x.id === id); return r ? T(r).t : ''; };
  const heart = '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>';
  const tagTxt = { new: { ar: 'جديد', en: 'New' }, best: { ar: 'الأكثر طلبًا', en: 'Best seller' }, custom: { ar: 'تفصيل', en: 'Made to measure' } };
  (function () {
    $('#filters').innerHTML = D.filters.map(f => `<button data-f="${f.id}">${T(f)}</button>`).join('');
    $$('#filters button').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));
    $('#shopGrid').innerHTML = D.products.map(p => { const t = T(p); return `
      <article class="pcard" data-id="${p.id}" data-room="${p.room}">
        ${p.tag ? `<span class="pcard__tag">${T(tagTxt[p.tag])}</span>` : ''}
        <button class="pcard__add" aria-label="add" data-add="${p.id}">${heart}</button>
        <div class="pcard__img"><img src="assets/prod/${p.img}.webp" alt="${t.t}" loading="lazy"></div>
        <div class="pcard__body"><span class="pcard__room">${roomName(p.room)}</span><h3 class="pcard__t">${t.t}</h3><p class="pcard__s">${t.s}</p>
        <div class="pcard__foot"><span class="pcard__price"><small>${L === 'ar' ? 'من' : 'from'}</small>${fmt(p.price)} <small>${cur()}</small></span><span class="swatches">${p.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span></div></div>
      </article>`; }).join('');
    $$('.pcard').forEach(c => c.addEventListener('click', e => {
      if (e.target.closest('[data-add]')) { e.stopPropagation(); toggleList(c.dataset.id); return; }
      openModal(c.dataset.id);
    }));
    setFilter('all', true); syncList();
  })();
  function setFilter(f, instant) {
    $$('#filters button').forEach(b => b.classList.toggle('on', b.dataset.f === f));
    const cards = $$('.pcard');
    const show = c => f === 'all' || c.dataset.room === f || (f === 'dining' && c.dataset.id === 'coffee');
    if (instant) { cards.forEach(c => c.classList.toggle('hide', !show(c))); return; }
    gsap.to(cards, { opacity: 0, y: 14, duration: .2, stagger: .01, onComplete: () => {
      cards.forEach(c => c.classList.toggle('hide', !show(c)));
      gsap.fromTo(cards.filter(show), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, stagger: .05, ease: 'power3.out' });
      ScrollTrigger.refresh();
    } });
  }
  function toggleList(id) {
    const i = list.indexOf(id);
    if (i > -1) list.splice(i, 1); else list.push(id);
    saveList(); syncList();
    const p = D.products.find(x => x.id === id);
    toast(i > -1 ? (L === 'ar' ? 'انشالت من قائمة بيتي' : 'Removed from your list') : (L === 'ar' ? `أضفنا ${T(p).t} لقائمة بيتي` : `${T(p).t} added to your list`));
    if (i === -1) gsap.fromTo('#listBtn', { scale: 1.3 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' });
  }
  function syncList() {
    $$('[data-add]').forEach(b => b.classList.toggle('on', list.includes(b.dataset.add)));
    const c = $('#listCount'); c.textContent = list.length; c.classList.toggle('on', list.length > 0);
    const ul = $('#drawerList'); const items = list.map(id => D.products.find(p => p.id === id)).filter(Boolean);
    ul.innerHTML = items.map(p => `<li><img src="assets/prod/${p.img}.webp" alt=""><div><b>${T(p).t}</b><span>${fmt(p.price)} ${cur()}</span></div><button data-rm="${p.id}" aria-label="remove">×</button></li>`).join('');
    $$('[data-rm]', ul).forEach(b => b.addEventListener('click', () => toggleList(b.dataset.rm)));
    $('#drawer').classList.toggle('empty', !items.length);
    const sum = items.reduce((a, p) => a + p.price, 0);
    $('#drawerSum').textContent = `${fmt(sum)} ${cur()}`;
    const msg = L === 'ar'
      ? `مرحبا الدالي للمفروشات، هذي قائمة بيتي:\n${items.map((p, k) => `${k + 1}. ${T(p).t} (من ${fmt(p.price)} ر.س)`).join('\n')}\nالإجمالي التقريبي: ${fmt(sum)} ر.س`
      : `Hello Al Dali Furniture, here is my home list:\n${items.map((p, k) => `${k + 1}. ${T(p).t} (from ${fmt(p.price)} SAR)`).join('\n')}\nEstimated total: ${fmt(sum)} SAR`;
    $('#drawerWa').href = wa(msg); $('#drawerWa').target = '_blank';
    const mAdd = $('#mAdd'); if (mAdd.dataset.id) mAdd.textContent = list.includes(mAdd.dataset.id) ? (L === 'ar' ? 'في قائمة بيتي ✓' : 'In my list ✓') : (L === 'ar' ? 'أضف لقائمة بيتي' : 'Add to my home list');
  }
  $('#listBtn').addEventListener('click', () => { $('#drawer').classList.add('open'); lenis.stop(); });
  $$('[data-dclose]').forEach(b => b.addEventListener('click', () => { $('#drawer').classList.remove('open'); lenis.start(); }));

  function openModal(id) {
    const p = D.products.find(x => x.id === id), t = T(p);
    $('#mImg').src = `assets/prod/${p.img}.webp`; $('#mImg').alt = t.t;
    $('#mRoom').textContent = roomName(p.room); $('#mT').textContent = t.t; $('#mS').textContent = t.s;
    $('#mSize').textContent = t.size; $('#mPrice').textContent = `${fmt(p.price)} ${cur()}`;
    let col = 0;
    const setWa = () => { $('#mWa').href = wa(L === 'ar' ? `مرحبا الدالي، أبغى أطلب «${t.t}» (لون رقم ${col + 1}). ممكن التفاصيل والسعر النهائي؟` : `Hello Al Dali, I would like to order "${t.t}" (colour ${col + 1}). Could you share details and final price?`); $('#mWa').target = '_blank'; };
    $('#mColors').innerHTML = p.colors.map((c, k) => `<i style="background:${c}" class="${k ? '' : 'on'}" data-k="${k}"></i>`).join('');
    $$('#mColors i').forEach(i => i.addEventListener('click', () => { col = +i.dataset.k; $$('#mColors i').forEach(x => x.classList.toggle('on', x === i)); setWa(); }));
    setWa();
    $('#mAdd').dataset.id = id; syncList();
    $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false'); lenis.stop();
    gsap.fromTo('#mImg', { scale: .85, opacity: 0, rotate: L === 'ar' ? 4 : -4 }, { scale: 1, opacity: 1, rotate: 0, duration: .8, delay: .1, ease: 'power3.out' });
  }
  $('#mAdd').addEventListener('click', () => toggleList($('#mAdd').dataset.id));
  const closeModal = () => { $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true'); lenis.start(); };
  $$('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); $('#drawer').classList.remove('open'); lenis.start(); } });

  let toastT;
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }

  /* ---------- promises, steps ---------- */
  $('#promises').innerHTML = D.promises.map((p, i) => `<div><i>0${i + 1}</i><b>${T(p)[0]}</b><span>${T(p)[1]}</span></div>`).join('');
  $('#steps').innerHTML = D.steps.map((s, i) => `<li data-n="0${i + 1}"><h3>${T(s)[0]}</h3><p>${T(s)[1]}</p></li>`).join('');

  /* ---------- planner ---------- */
  (function () {
    $('#pickRooms').innerHTML = D.rooms.map(r => `<button type="button" data-v="${r.id}">${T(r).t}</button>`).join('');
    $('#pickStyle').innerHTML = D.styles.map(s => `<button type="button" data-v="${s.id}">${T(s).t}</button>`).join('') + `<button type="button" data-v="help">${L === 'ar' ? 'ساعدوني أختار' : 'Help me choose'}</button>`;
    $('#pCity').innerHTML = D.cities.map(c => `<option>${T(c)}</option>`).join('');
    $$('#pickRooms button').forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));
    $$('#pickStyle button').forEach(b => b.addEventListener('click', () => { $$('#pickStyle button').forEach(x => x.classList.toggle('on', x === b)); }));
    $('#planner').addEventListener('submit', e => {
      e.preventDefault();
      const rooms = $$('#pickRooms .on').map(b => b.textContent), style = ($('#pickStyle .on') || {}).textContent || '-';
      const ar = L === 'ar';
      const msg = (ar ? 'مرحبا الدالي للمفروشات، أبغى أفرش بيتي:\n' : 'Hello Al Dali Furniture, I want to furnish my home:\n') +
        `${ar ? 'الغرف' : 'Rooms'}: ${rooms.length ? rooms.join('، ') : (ar ? 'البيت كامل' : 'Whole home')}\n` +
        `${ar ? 'الذوق' : 'Taste'}: ${style}\n${ar ? 'المدينة' : 'City'}: ${$('#pCity').value}\n${ar ? 'نوع البيت' : 'Home type'}: ${$('#pType').value}\n` +
        `${ar ? 'الاسم' : 'Name'}: ${$('#pName').value}\n${ar ? 'الجوال' : 'Mobile'}: ${$('#pPhone').value}` + ($('#pNote').value ? `\n${ar ? 'ملاحظات' : 'Notes'}: ${$('#pNote').value}` : '');
      window.open(wa(msg), '_blank');
    });
  })();

  /* ---------- scroll scenes ---------- */
  function buildScroll() {
    // nav state
    const nav = $('#nav'), mbar = $('.mbar');
    let lastY = 0;
    lenis.on('scroll', ({ scroll }) => {
      const heroEnd = $('#hero').offsetHeight - innerHeight * .2;
      nav.classList.toggle('solid', scroll > heroEnd);
      nav.classList.toggle('hide', scroll > innerHeight && scroll > lastY + 2 && !$('#modal').classList.contains('open'));
      if (scroll < lastY - 2) nav.classList.remove('hide');
      mbar.classList.toggle('on', scroll > innerHeight * .6);
      lastY = scroll;
    });

    // hero scrub
    const steps = $$('#heroSteps li');
    const em = $('.hero__title em');
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: st => {
        const p = st.progress, fp = Math.min(1, p / .88);
        draw(fp * (N - 1));
        $('#heroProg').style.transform = `scaleX(${p})`;
        const s = fp < .3 ? 0 : fp < .8 ? 1 : 2;
        steps.forEach((li, i) => li.classList.toggle('on', i === s));
        em.style.setProperty('--u', Math.max(0, Math.min(1, (fp - .75) / .2)));
      }
    });
    gsap.to('.hero__copy', { yPercent: -8, opacity: .0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'bottom 140%', end: 'bottom 100%', scrub: true } });

    // manifesto words
    const words = $$('#manifesto .w');
    ScrollTrigger.create({ trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: st => { const n = Math.round(st.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); } });
    gsap.fromTo('#manifestoMark', { y: 80, rotate: -6 }, { y: -60, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'bottom top', scrub: true } });

    // plan rooms draw-in
    gsap.from('#floor .room', { opacity: 0, scale: .92, transformOrigin: '50% 50%', duration: .7, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '#floor', start: 'top 75%' } });
    const wall = $('#floor .plan-wall'); const wl = wall.getTotalLength();
    gsap.fromTo(wall, { strokeDasharray: wl, strokeDashoffset: wl }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', scrollTrigger: { trigger: '#floor', start: 'top 75%' } });

    // rooms horizontal
    const track = $('#roomsTrack');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const sign = L === 'ar' ? 1 : -1;
    const hz = gsap.to(track, { x: () => sign * dist(), ease: 'none' });
    ScrollTrigger.create({ trigger: '.rooms', pin: '.rooms__pin', start: 'top top', end: () => '+=' + dist(), scrub: .6, animation: hz, invalidateOnRefresh: true,
      onUpdate: st => { $('#roomsBar').style.transform = `scaleX(${st.progress})`; } });
    $$('.rcard img').forEach(img => gsap.fromTo(img, { xPercent: -6 * sign }, { xPercent: 6 * sign, ease: 'none', scrollTrigger: { trigger: img.parentNode, containerAnimation: hz, start: 'left right', end: 'right left', scrub: true } }));

    // taste autoplay while visible
    ScrollTrigger.create({ trigger: '.taste__stage', start: 'top 70%', end: 'bottom 20%', onToggle: st => st.isActive ? startTasteAuto() : stopTasteAuto() });

    // film
    const v = $('#filmVideo');
    ScrollTrigger.create({ trigger: '.film', start: 'top 90%', end: 'bottom top', onToggle: st => { if (st.isActive) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); } });
    gsap.fromTo(v, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.film', start: 'top bottom', end: 'bottom top', scrub: true } });

    // process line
    const pl = $('#processLine path');
    if (pl) { const l = pl.getTotalLength(); gsap.fromTo(pl, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.process__wrap', start: 'top 80%', end: 'bottom 60%', scrub: true } }); }

    // reveals
    const rv = $$('.sec-head, .house__card, .house__plan, .taste__view, .taste__info, .quiz, .pcard, .process__steps li, .planner, .plan__copy, .vcard, .promises > div, .film__t');
    gsap.set(rv, { opacity: 0, y: 46 });
    ScrollTrigger.batch(rv, { start: 'top 88%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'power3.out', overwrite: true }) });

    // logo watermark in planner
    gsap.from('#planLogo path', { opacity: 0, y: 30, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '#planLogo', start: 'top 85%' } });

    ScrollTrigger.refresh();
  }

  runIntro();
})();
