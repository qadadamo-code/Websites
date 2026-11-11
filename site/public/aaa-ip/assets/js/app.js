/* AAA For Intellectual Property — interactions */
(function () {
  'use strict';
  const D = document, W = window, html = D.documentElement;
  const RTL = html.dir === 'rtl';
  const reduce = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = W.matchMedia('(max-width: 760px)').matches;
  const DPR = Math.min(W.devicePixelRatio || 1, mobile ? 1.5 : 2);
  const $ = (s, r = D) => r.querySelector(s);
  const $$ = (s, r = D) => Array.from(r.querySelectorAll(s));
  const hasG = !!W.gsap;
  if (hasG && W.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------- smooth scroll */
  let lenis = null;
  if (W.Lenis && !reduce && !mobile) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  D.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const tg = D.getElementById(a.getAttribute('href').slice(1));
    if (!tg) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(tg, { offset: -140 }); else W.scrollTo({ top: tg.getBoundingClientRect().top + scrollY - 140, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------------------------------------------------------------- header + menu */
  const hdr = $('#hdr');
  let lastY = 0;
  function onScroll() {
    const y = W.scrollY;
    hdr.classList.toggle('sc', y > 40);
    hdr.classList.toggle('hide', y > 400 && y > lastY + 4 && !D.body.classList.contains('menu-open'));
    if (y < lastY - 4) hdr.classList.remove('hide');
    lastY = y;
  }
  W.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('.burger'), mo = $('#mo');
  burger && burger.addEventListener('click', () => {
    const open = !D.body.classList.contains('menu-open');
    D.body.classList.toggle('menu-open', open);
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    mo.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
    D.body.style.overflow = open ? 'hidden' : '';
  });

  /* ---------------------------------------------------------------- guilloche engine */
  const GOLD = '201,165,116';
  function sizeCanvas(c) {
    const r = c.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (c._w !== w || c._h !== h) { c._w = w; c._h = h; c.width = w * DPR; c.height = h * DPR; }
    const ctx = c.getContext('2d'); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); return ctx;
  }
  // woven rosette: several bands, each built of two phase-shifted sine families
  function rosette(ctx, cx, cy, R, t, o) {
    const layers = o.layers || 14, n = o.n || 18, N = o.N || 520, prog = o.prog == null ? 1 : o.prog;
    for (let k = 0; k < layers; k++) {
      const base = R * (o.inner || 0.32) + (R * (1 - (o.inner || 0.32))) * (k / (layers - 1));
      const amp = R * (o.amp || 0.05) * (0.6 + 0.4 * Math.sin(k * 0.7));
      for (let f = 0; f < 2; f++) {
        ctx.beginPath();
        const ph = (f ? Math.PI / n : 0) + k * 0.22 + t * (f ? -1 : 1) * (o.speed || 0.12);
        const end = Math.max(2, Math.floor(N * prog));
        for (let i = 0; i <= end; i++) {
          const a = (i / N) * Math.PI * 2;
          const r = base + amp * Math.sin(n * a + ph) + amp * 0.45 * Math.sin((n * 2 + 1) * a - ph * 1.3);
          const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        const fade = 1 - Math.abs(k / (layers - 1) - 0.55) * 1.1;
        ctx.strokeStyle = `rgba(${o.rgb || GOLD},${(o.alpha || 0.22) * Math.max(0.15, fade)})`;
        ctx.lineWidth = o.lw || 0.7;
        ctx.stroke();
      }
    }
  }
  function waves(ctx, w, h, y0, t, o) {
    const lines = o.lines || 18, gap = o.gap || 7;
    for (let k = 0; k < lines; k++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y = y0 + k * gap + Math.sin(x * 0.012 + k * 0.32 + t * 0.4) * 14 + Math.sin(x * 0.031 - t * 0.25 + k * 0.1) * 5;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(${o.rgb || GOLD},${(o.alpha || 0.16) * (1 - Math.abs(k / lines - 0.5))})`;
      ctx.lineWidth = 0.7; ctx.stroke();
    }
  }
  const GL = [];
  $$('.gl').forEach(c => {
    const host = c.parentElement;
    let kind = 'band';
    if (host.classList.contains('hero')) kind = 'hero';
    else if (host.classList.contains('ph')) kind = 'ph';
    else if (host.classList.contains('ftr')) kind = 'ftr';
    else if (host.classList.contains('mo')) kind = 'mo';
    GL.push({ c, kind, vis: false, prog: kind === 'hero' ? 0 : 1 });
  });
  function drawGL(g, t) {
    const ctx = sizeCanvas(g.c), w = g.c._w, h = g.c._h;
    ctx.clearRect(0, 0, w, h);
    if (g.kind === 'hero') {
      const s = $('.hero-seal-wrap'); const r = s.getBoundingClientRect(), hr = g.c.getBoundingClientRect();
      const cx = r.left - hr.left + r.width / 2, cy = r.top - hr.top + r.height / 2;
      rosette(ctx, cx, cy, Math.max(w, h) * (mobile ? 0.62 : 0.5), t, { layers: mobile ? 12 : 20, n: 24, N: mobile ? 360 : 640, amp: 0.035, inner: 0.42, alpha: 0.2, prog: g.prog });
      rosette(ctx, cx, cy, r.width * 0.68, -t * 0.8, { layers: 8, n: 36, N: mobile ? 360 : 560, amp: 0.05, inner: 0.78, alpha: 0.32, prog: g.prog });
      waves(ctx, w, h, h - 120, t, { lines: 16, gap: 6, alpha: 0.14 });
    } else if (g.kind === 'ph') {
      const cx = RTL ? w * 0.12 : w * 0.88;
      rosette(ctx, cx, h * 0.45, Math.min(w, 900) * 0.42, t, { layers: mobile ? 10 : 16, n: 20, N: mobile ? 320 : 520, alpha: 0.22 });
      waves(ctx, w, h, h - 90, t, { lines: 12, gap: 6, alpha: 0.12 });
    } else if (g.kind === 'ftr') {
      rosette(ctx, RTL ? w * 0.9 : w * 0.1, 160, 420, t, { layers: 14, n: 22, N: 480, alpha: 0.16 });
    } else if (g.kind === 'mo') {
      rosette(ctx, w * 0.5, h * 0.55, Math.max(w, h) * 0.55, t, { layers: 14, n: 20, N: 420, alpha: 0.14 });
    } else {
      waves(ctx, w, h, 40, t, { lines: 14, gap: 7, alpha: 0.13 });
      rosette(ctx, RTL ? w * 0.06 : w * 0.94, h * 0.9, Math.min(520, w * 0.5), t, { layers: 12, n: 18, N: 420, alpha: 0.13 });
    }
  }
  if ('IntersectionObserver' in W) {
    const io = new IntersectionObserver(es => es.forEach(e => { const g = GL.find(x => x.c === e.target); if (g) g.vis = e.isIntersecting; }), { rootMargin: '80px' });
    GL.forEach(g => io.observe(g.c));
  } else GL.forEach(g => g.vis = true);
  let T0 = performance.now(), lastF = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (now - lastF < (mobile ? 48 : 33)) return; lastF = now;
    const t = (now - T0) / 1000;
    GL.forEach(g => { if (g.vis && (g.kind !== 'mo' || D.body.classList.contains('menu-open'))) drawGL(g, reduce ? 0 : t); });
    medals.forEach(m => m.vis && drawMedal(m, reduce ? 0 : t));
  }
  // medal guilloche (founder / directors)
  const medals = $$('.medal-g').map(c => ({ c, vis: true }));
  function drawMedal(m, t) {
    const ctx = sizeCanvas(m.c), w = m.c._w, h = m.c._h; ctx.clearRect(0, 0, w, h);
    rosette(ctx, w / 2, h / 2, w * 0.5, t * 0.6, { layers: 10, n: 16, N: 300, amp: 0.06, inner: 0.25, alpha: 0.4, lw: 0.6 });
  }
  if ('IntersectionObserver' in W) {
    const io2 = new IntersectionObserver(es => es.forEach(e => { const m = medals.find(x => x.c === e.target); if (m) m.vis = e.isIntersecting; }));
    medals.forEach(m => io2.observe(m.c));
  }
  requestAnimationFrame(loop);

  /* ---------------------------------------------------------------- seal helpers */
  const NS = 'http://www.w3.org/2000/svg';
  function balance(svg, deg) {
    const beam = $('.s-beam', svg); if (!beam) return;
    beam.setAttribute('transform', `rotate(${deg} 300 399)`);
    $('.s-pan-l', svg).setAttribute('transform', `rotate(${-deg} 232 401)`);
    $('.s-pan-r', svg).setAttribute('transform', `rotate(${-deg} 368 401)`);
  }
  function swing(svg, from, dur) {
    if (!hasG) return balance(svg, 0);
    const p = { a: from };
    return gsap.to(p, { a: 0, duration: dur || 2.2, ease: 'elastic.out(1,0.28)', onUpdate: () => balance(svg, p.a) });
  }

  /* ---------------------------------------------------------------- reveals */
  function heroIn() {
    const hero = $('.hero'); if (!hero || !hasG) return;
    const g = GL.find(x => x.kind === 'hero');
    gsap.to(g, { prog: 1, duration: 2.4, ease: 'power2.out' });
    const tl = gsap.timeline();
    tl.to('.hero-t .w>span', { y: 0, duration: 1.2, stagger: 0.12, ease: 'expo.out' })
      .from('.hero-eb', { opacity: 0, y: 14, duration: 0.8 }, 0)
      .from('.hero-p, .hero-cta', { opacity: 0, y: 20, duration: 0.9, stagger: 0.1 }, 0.35)
      .from('.hero-strip>div', { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.6)
      .from('.hero-seal', { scale: 0.86, opacity: 0, rotate: -12, duration: 1.4, ease: 'expo.out' }, 0)
      .from('.hero-ring', { opacity: 0, duration: 1.6 }, 0.3);
    const svg = $('.hero-s');
    if (svg) { tl.add(() => swing(svg, 16, 2.6), 0.5); }
  }
  function revealAll() {
    if (!hasG || !W.ScrollTrigger || reduce) { $$('.rv, .tt .w>span').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
    $$('.tt').forEach(tt => {
      if (tt.closest('.hero') || tt.closest('.ph')) return;
      gsap.to($$('.w>span', tt), { y: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: tt, start: 'top 88%' } });
    });
    ScrollTrigger.batch('.rv', {
      start: 'top 90%',
      onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out', overwrite: true })
    });
    // counters
    $$('.cnt').forEach(el => {
      const to = +el.dataset.to; const o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) }) });
      el.textContent = '0';
    });
    // process line
    const pr = $('.pr');
    if (pr) {
      const steps = $$('.pr-s', pr);
      gsap.from(steps, { opacity: 0, y: 30, stagger: 0.12, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: pr, start: 'top 80%' } });
      ScrollTrigger.create({
        trigger: pr, start: 'top 75%', end: 'bottom 55%', scrub: true,
        onUpdate: s => {
          const line = $('.pr-line span', pr); if (line) line.style.transform = `scaleX(${s.progress})`;
          steps.forEach((st, i) => st.classList.toggle('on', s.progress >= i / (steps.length - 1) - 0.02));
        }
      });
    }
    // page hero seal parallax
    $$('.ph-seal').forEach(s => gsap.to(s, { rotate: 40, yPercent: -30, ease: 'none', scrollTrigger: { trigger: s.parentElement, start: 'top top', end: 'bottom top', scrub: true } }));
    // why seal swing when it appears
    $$('.why-seal').forEach(s => gsap.from(s, { rotate: -25, scale: 0.8, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 90%' } }));
    // page hero title
    $$('.ph .tt .w>span').forEach(() => {});
  }

  /* ---------------------------------------------------------------- holographic cards + tilt */
  $$('.holo').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%'); el.style.setProperty('--hx', (x * 100) + '%');
    });
  });
  const tilt = $('.tilt');
  if (tilt && !mobile && !reduce) {
    const svg = $('svg', tilt); let swingLock = true; setTimeout(() => swingLock = false, 4200); let cur = 0, target = 0, rx = 0, ry = 0, trx = 0, try_ = 0;
    W.addEventListener('pointermove', e => {
      const r = tilt.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / W.innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / W.innerHeight;
      trx = -dy * 14; try_ = dx * 18; target = Math.max(-12, Math.min(12, dx * 26));
    });
    (function tk() {
      rx += (trx - rx) * 0.06; ry += (try_ - ry) * 0.06; cur += (target - cur) * 0.05;
      tilt.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      if (!swingLock) balance(svg, cur);
      requestAnimationFrame(tk);
    })();
    tilt.addEventListener('pointerleave', () => { target = 0; });
  }

  /* ---------------------------------------------------------------- intro */
  function runIntro(done) {
    const it = $('#intro');
    if (!it) return done();
    let seen = false; try { seen = sessionStorage.getItem('aaa-intro') === '1'; } catch (e) {}
    if (seen || reduce || !hasG) { it.remove(); return done(); }
    try { sessionStorage.setItem('aaa-intro', '1'); } catch (e) {}
    if (lenis) lenis.stop(); D.body.style.overflow = 'hidden';
    const svg = $('.intro-s', it), G = $('.intro-g', it);
    // guilloche paths for the intro
    const paths = [];
    for (let k = 0; k < 16; k++) {
      const base = 120 + k * 15, amp = 9 + (k % 4) * 3, n = 24;
      for (let f = 0; f < 2; f++) {
        let d = '';
        for (let i = 0; i <= 720; i++) {
          const a = i / 720 * Math.PI * 2, ph = f ? Math.PI / n : 0;
          const r = base + amp * Math.sin(n * a + ph + k * 0.25) + amp * 0.4 * Math.sin((2 * n + 1) * a - ph);
          d += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1);
        }
        const p = D.createElementNS(NS, 'path'); p.setAttribute('d', d + 'Z'); p.setAttribute('pathLength', '1');
        p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; p.style.opacity = (0.15 + 0.5 * (1 - Math.abs(k / 15 - 0.5) * 2)).toFixed(2);
        G.appendChild(p); paths.push(p);
      }
    }
    // drawing overlay for the ring
    const draw = D.createElementNS(NS, 'circle');
    draw.setAttribute('cx', 300); draw.setAttribute('cy', 300); draw.setAttribute('r', 246); draw.setAttribute('fill', 'none');
    draw.setAttribute('stroke', '#1E2766'); draw.setAttribute('stroke-width', 68); draw.setAttribute('pathLength', 1);
    draw.setAttribute('transform', 'rotate(-90 300 300)'); draw.style.strokeDasharray = '1'; draw.style.strokeDashoffset = '1';
    const body = $('.s-body', svg); body.insertBefore(draw, $('.s-hair', svg));
    const hair = $('.s-hair', svg); hair.setAttribute('pathLength', 1); hair.style.strokeDasharray = '1'; hair.style.strokeDashoffset = '1';
    gsap.set($('.s-ring', svg), { opacity: 0 });
    gsap.set($('.s-disc', svg), { scale: 0, svgOrigin: '300 300' });
    gsap.set($$('.s-dot', svg), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set([$('.s-l1', svg), $('.s-l2', svg), $('.s-band', svg)], { scaleX: 0, svgOrigin: '300 300' });
    gsap.set([$('.s-t1', svg), $('.s-t2', svg)], { opacity: 0, y: 14 });
    gsap.set($$('.s-a', svg), { opacity: 0, scale: 2.4, transformOrigin: '50% 100%' });
    gsap.set($('.s-stand', svg), { opacity: 0, y: -60 });
    gsap.set($('.s-beam', svg), { opacity: 0 });
    gsap.set($('.s-tm', svg), { scale: 0, transformOrigin: '50% 50%' });
    balance(svg, -22);
    const cnt = $('.intro-c', it), o = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(paths, { strokeDashoffset: 0, duration: 2.2, stagger: { each: 0.03, from: 'center' }, ease: 'power2.inOut' }, 0)
      .to(G, { rotate: 25, duration: 5, ease: 'none' }, 0)
      .to(o, { v: 5000, duration: 3.6, ease: 'power2.inOut', onUpdate: () => cnt.textContent = String(Math.round(o.v)).padStart(4, '0') }, 0)
      .to($('.s-disc', svg), { scale: 1, duration: 0.9, ease: 'expo.out' }, 0.5)
      .to(hair, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.6)
      .to(draw, { strokeDashoffset: 0, duration: 1.0, ease: 'power3.inOut' }, 0.75)
      .set($('.s-ring', svg), { opacity: 1 }, 1.75).set(draw, { opacity: 0 }, 1.75)
      .to($$('.s-dot', svg), { scale: 1, duration: 0.35, stagger: 0.022, ease: 'back.out(3)' }, 1.6)
      .to([$('.s-band', svg), $('.s-l1', svg), $('.s-l2', svg)], { scaleX: 1, duration: 0.7, ease: 'expo.out' }, 2.0)
      .to($('.s-t1', svg), { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 2.25)
      .to($('.s-t2', svg), { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 2.4);
    $$('.s-a', svg).forEach((a, i) => {
      const at = 2.55 + i * 0.16;
      tl.to(a, { opacity: 1, scale: 1, duration: 0.42, ease: 'power4.in' }, at)
        .add(() => { ripple(svg); gsap.fromTo($('.intro-seal', it), { x: 0 }, { x: (i % 2 ? 4 : -4), duration: 0.05, yoyo: true, repeat: 3, clearProps: 'x' }); }, at + 0.4);
    });
    tl.to($('.s-stand', svg), { opacity: 1, y: 0, duration: 0.6, ease: 'bounce.out' }, 3.15)
      .to($('.s-beam', svg), { opacity: 1, duration: 0.2 }, 3.4)
      .add(() => swing(svg, -22, 2.2), 3.4)
      .to($('.s-tm', svg), { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 3.6)
      .fromTo($('.s-shine', svg), { attr: { x: -260 }, opacity: 1 }, { attr: { x: 760 }, duration: 1.1, ease: 'power2.inOut' }, 3.8)
      .from($('.intro-cap span', it), { yPercent: 110, duration: 0.8, ease: 'expo.out' }, 3.6)
      .to({}, { duration: 0.5 });
    function ripple(s) {
      const c = D.createElementNS(NS, 'circle'); c.setAttribute('cx', 300); c.setAttribute('cy', 175); c.setAttribute('r', 40);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#C9A574'); c.setAttribute('stroke-width', 2); $('.s-body', s).appendChild(c);
      gsap.to(c, { attr: { r: 330 }, opacity: 0, duration: 1.1, ease: 'expo.out', onComplete: () => c.remove() });
    }
    let ended = false;
    function finish() {
      if (ended) return; ended = true;
      tl.kill();
      gsap.timeline({ onComplete: () => { it.remove(); D.body.style.overflow = ''; if (lenis) lenis.start(); } })
        .to($('.intro-seal', it), { scale: 0.7, opacity: 0, duration: 0.8, ease: 'expo.in' }, 0)
        .to([G, $('.intro-cap', it), $('.intro-reg', it), $('.intro-skip', it)], { opacity: 0, duration: 0.5 }, 0)
        .to(it, { clipPath: 'circle(0% at 50% 50%)', duration: 1, ease: 'expo.inOut' }, 0.35)
        .add(done, 0.75);
    }
    $('.intro-skip', it).addEventListener('click', finish);
    it.style.clipPath = 'circle(150% at 50% 50%)';
  }

  /* ---------------------------------------------------------------- world map */
  const M = W.AAA_MAP;
  const CAIRO = [31.2, 30.0];
  const NAMES = {};
  $$('.jt').forEach(b => { NAMES[b.dataset.r] = b.textContent.trim(); });
  function initMap(c) {
    if (!M) return;
    const mode = c.dataset.mode;
    const pts = [], cent = {};
    M.rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i]; if (ch === '.') continue;
        const lon = M.lon0 + i * M.step, lat = M.lat0 - j * M.step;
        if (lon < -130 || lon > 160 || lat < -42) continue;
        pts.push({ lon, lat, r: ch, ph: Math.random() * 6.28 });
        if (ch !== 'W') { (cent[ch] = cent[ch] || [0, 0, 0]); cent[ch][0] += lon; cent[ch][1] += lat; cent[ch][2]++; }
      }
    });
    Object.keys(cent).forEach(k => { const v = cent[k]; cent[k] = [v[0] / v[2], v[1] / v[2]]; });
    cent.F = [20, 5]; cent.U = [12, 48];
    const LON0 = -130, LON1 = 160, LAT0 = 76, LAT1 = -42;
    let active = mode === 'full' ? 'E' : 'E', hover = null, vis = true, t0 = performance.now(), arcT = 0;
    function proj(lon, lat, w, h) {
      const sx = w / (LON1 - LON0), sy = h / (LAT0 - LAT1), s = Math.min(sx, sy);
      const ox = (w - s * (LON1 - LON0)) / 2, oy = (h - s * (LAT0 - LAT1)) / 2;
      return [ox + (lon - LON0) * s, oy + (LAT0 - lat) * s, s];
    }
    function frame(now) {
      requestAnimationFrame(frame);
      if (!vis) return;
      const ctx = sizeCanvas(c), w = c._w, h = c._h, t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const s = proj(0, 0, w, h)[2], rad = Math.max(0.9, s * M.step * 0.3);
      const sel = hover || active;
      for (const p of pts) {
        const [x, y] = proj(p.lon, p.lat, w, h);
        let col, rr = rad;
        if (p.r === 'E') { col = `rgba(255,236,200,${0.85 + 0.15 * Math.sin(t * 3 + p.ph)})`; rr = rad * 1.25; }
        else if (p.r === sel) { col = `rgba(226,200,154,${0.75 + 0.25 * Math.sin(t * 2.4 + p.ph)})`; rr = rad * 1.15; }
        else if (p.r === 'W') col = 'rgba(190,196,230,.16)';
        else col = 'rgba(201,165,116,.34)';
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.283); ctx.fill();
      }
      // Cairo beacon
      const [cx, cy] = proj(CAIRO[0], CAIRO[1], w, h);
      const pulse = (t % 2) / 2;
      ctx.strokeStyle = `rgba(226,200,154,${1 - pulse})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, 4 + pulse * s * 6, 0, 6.283); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, Math.max(2.5, rad * 1.4), 0, 6.283); ctx.fill();
      // arc to selected region
      if (sel && sel !== 'E' && cent[sel]) {
        const [tx, ty] = proj(cent[sel][0], cent[sel][1], w, h);
        const mx = (cx + tx) / 2, my = Math.min(cy, ty) - Math.hypot(tx - cx, ty - cy) * 0.35;
        const k = Math.min(1, (now - arcT) / 900);
        ctx.strokeStyle = 'rgba(226,200,154,.85)'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 20;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        const N = 40; for (let i = 1; i <= N * k; i++) { const u = i / N; const x = (1 - u) * (1 - u) * cx + 2 * (1 - u) * u * mx + u * u * tx, y = (1 - u) * (1 - u) * cy + 2 * (1 - u) * u * my + u * u * ty; ctx.lineTo(x, y); }
        ctx.stroke(); ctx.setLineDash([]);
        if (k >= 1) { ctx.fillStyle = '#E2C89A'; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, 6.283); ctx.fill(); }
        // label
        if (NAMES[sel] && k >= 1) {
          ctx.font = `600 ${Math.max(11, Math.min(14, w / 70))}px ${getComputedStyle(D.body).fontFamily}`;
          ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(NAMES[sel].replace(/^\S+\s/, ''), tx, ty - 14);
        }
      }
      ctx.font = `700 ${Math.max(10, Math.min(13, w / 80))}px Manrope, sans-serif`; ctx.fillStyle = '#E2C89A'; ctx.textAlign = 'center';
      ctx.textAlign = RTL ? 'left' : 'right'; ctx.fillText(html.lang === 'ar' ? 'القاهرة · المقر' : 'CAIRO · HQ', RTL ? cx + 12 : cx - 12, cy + 4);
    }
    requestAnimationFrame(frame);
    if ('IntersectionObserver' in W) new IntersectionObserver(es => vis = es[0].isIntersecting).observe(c);
    function setActive(r, user) {
      if (r === active) return; active = r; arcT = performance.now();
      $$('.jt').forEach(b => b.classList.toggle('on', b.dataset.r === r));
      $$('.jp').forEach(p => p.hidden = p.dataset.r !== r);
      if (user) userPicked = true;
    }
    let userPicked = false;
    $$('.jt').forEach(b => {
      b.addEventListener('click', () => setActive(b.dataset.r, true));
      if (mode === 'teaser') b.addEventListener('pointerenter', () => setActive(b.dataset.r, true));
    });
    // initial state
    active = null; setActive('E');
    if (mode === 'teaser') {
      const order = ['E', 'G', 'O', 'R', 'U', 'S', 'A']; let i = 0;
      setInterval(() => { if (userPicked || !vis) return; i = (i + 1) % order.length; setActive(order[i]); }, 2400);
    }
    // hover/click on map (full)
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      let best = null, bd = 1e9;
      for (const p of pts) { if (p.r === 'W') continue; const [px, py] = proj(p.lon, p.lat, c._w, c._h); const d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; best = p; } }
      const s = proj(0, 0, c._w, c._h)[2];
      const nh = best && bd < (s * 4) ** 2 && NAMES[best.r] ? best.r : null;
      if (nh !== hover) { hover = nh; arcT = performance.now(); }
      c.style.cursor = hover ? 'pointer' : '';
    });
    c.addEventListener('pointerleave', () => { hover = null; });
    c.addEventListener('click', () => { if (hover) { setActive(hover, true); hover = null; } });
  }

  /* ---------------------------------------------------------------- protection tabs scrollspy */
  const rts = $$('.rt');
  if (rts.length && 'IntersectionObserver' in W) {
    const io3 = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) rts.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('.rd').forEach(s => io3.observe(s));
  }

  /* ---------------------------------------------------------------- form */
  const form = $('#inq');
  if (form) {
    const no = $('.form-no', form); if (no) no.textContent = String(1000 + Math.floor(Math.random() * 8999));
    let via = 'wa';
    $$('button[type=submit]', form).forEach(b => b.addEventListener('click', () => via = b.dataset.via));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(form), err = $('.form-err', form);
      const ok = f.get('name').trim() && /\S+@\S+\.\S+/.test(f.get('email')) && f.get('msg').trim();
      err.hidden = !!ok; if (!ok) return;
      const AR = html.lang === 'ar';
      const lines = [
        (AR ? 'استفسار جديد من الموقع' : 'New website inquiry') + ' — AAA/IN-' + (no ? no.textContent : ''),
        (AR ? 'الاسم: ' : 'Name: ') + f.get('name'),
        f.get('company') ? (AR ? 'الشركة: ' : 'Company: ') + f.get('company') : '',
        (AR ? 'البريد: ' : 'Email: ') + f.get('email'),
        f.get('phone') ? (AR ? 'الهاتف: ' : 'Phone: ') + f.get('phone') : '',
        (AR ? 'المجال: ' : 'Area: ') + f.get('area'),
        '', f.get('msg')
      ].filter(x => x !== null);
      const body = lines.join('\n');
      if (via === 'mail') location.href = 'mailto:Info@AAA-IP.com?subject=' + encodeURIComponent('Inquiry — ' + f.get('area')) + '&body=' + encodeURIComponent(body);
      else W.open('https://wa.me/201122417017?text=' + encodeURIComponent(body), '_blank', 'noopener');
    });
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    $$('canvas.map').forEach(initMap);
    if (D.body.dataset.page === 'index') runIntro(() => { heroIn(); revealAll(); });
    else {
      if (hasG) gsap.to('.ph .tt .w>span', { y: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', delay: 0.1 });
      revealAll();
    }
    // hero-less pages: seal in page hero swings? (watermark only)
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
