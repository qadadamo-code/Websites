/* DAR ME — interactions */
(function () {
  const D = document, H = D.documentElement, B = D.body;
  const RTL = H.dir === 'rtl';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = !!window.gsap;
  H.classList.add('js');
  const $ = (s, r) => (r || D).querySelector(s);
  const $$ = (s, r) => Array.from((r || D).querySelectorAll(s));
  if (hasG && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !REDUCED) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const el = $(id); if (!el) return;
    e.preventDefault(); lenis ? lenis.scrollTo(el, { offset: -90 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- header ---------- */
  const hdr = $('#hdr'); let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    hdr.classList.toggle('scrolled', y > 20);
    if (!B.classList.contains('menu-open')) hdr.classList.toggle('hide', y > 500 && y > lastY + 2);
    if (y < lastY - 2) hdr.classList.remove('hide');
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- menu ---------- */
  const burger = $('.burger'), mo = $('#mo');
  burger && burger.addEventListener('click', () => {
    const open = !B.classList.contains('menu-open');
    B.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); mo.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ---------- text splitting ---------- */
  function splitWords(el, inner) {
    // keep runs of Latin words together so mixed Arabic/English keeps its reading order
    const raw = el.textContent.trim().split(/\s+/), words = [], ar = /[؀-ۿ]/;
    raw.forEach((w) => { const last = words[words.length - 1]; if (RTL && last && !ar.test(w) && !ar.test(last)) words[words.length - 1] = last + ' ' + w; else words.push(w); });
    el.innerHTML = words.map((w) => inner ? `<span class="w"><span>${w}</span></span>` : `<span class="w">${w}</span>`).join(' ');
    return $$('.w', el);
  }
  $$('.rv-words').forEach((el) => splitWords(el, true));
  $$('.rv-lines').forEach((el) => splitWords(el, false));

  /* ---------- counters ---------- */
  function fmt(n, sep) { n = Math.round(n); return sep ? n.toLocaleString('en-US') : String(n); }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.to, sep = el.dataset.sep === '1';
    if (el.dataset.count === '0' || REDUCED || !hasG) { el.textContent = fmt(to, sep); return; }
    const o = { v: 0 }; gsap.to(o, { v: to, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v, sep)) });
  }
  $$('.cnt').forEach((el) => { if (el.dataset.count === '1' && !REDUCED && hasG) el.textContent = '0'; });

  /* ---------- reveals ---------- */
  function setupReveals() {
    if (!hasG || REDUCED) {
      $$('.rv,.rv-card').forEach((el) => (el.style.opacity = 1, el.style.transform = 'none'));
      $$('.rv-words .w>span').forEach((s) => (s.style.transform = 'none'));
      $$('.rv-lines .w').forEach((s) => s.classList.add('on'));
      $$('.cnt').forEach(count); $$('.stats').forEach((s) => s.classList.add('in'));
      return;
    }
    $$('.rv').forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
    $$('.rv-words').forEach((el) => gsap.to($$('.w>span', el), { y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.035, scrollTrigger: { trigger: el, start: 'top 86%' } }));
    ScrollTrigger.batch('.rv-card', { start: 'top 90%', onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }) });
    gsap.set('.cap > :not(.cap-line), .rv-in > *', { opacity: 0, y: 30 });
    ScrollTrigger.batch('.cap, .rv-in', { start: 'top 90%', onEnter: (els) => els.forEach((c, i) => gsap.to(c.querySelectorAll(':scope > :not(.cap-line)'), { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: i * 0.08 })) });
    $$('.rv-lines').forEach((el) => {
      const ws = $$('.w', el);
      ScrollTrigger.create({ trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: (s) => { const n = Math.floor(s.progress * ws.length * 1.05); ws.forEach((w, i) => w.classList.toggle('on', i < n)); } });
    });
    $$('.stats').forEach((s) => ScrollTrigger.create({ trigger: s, start: 'top 92%', once: true, onEnter: () => { s.classList.add('in'); $$('.cnt', s).forEach(count); } }));
    $$('.cnt').forEach((c) => { if (!c.closest('.stats')) ScrollTrigger.create({ trigger: c, start: 'top 85%', once: true, onEnter: () => count(c) }); });
    $$('.lbl i').forEach((i) => gsap.from(i, { scaleX: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: i, start: 'top 92%' } }));
    // parallax on footer mark
    const mark = $('.ftr-mark');
    if (mark) gsap.from(mark, { yPercent: 40, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- hero entrance ---------- */
  let heroDone = false;
  function heroIn() {
    if (heroDone) return; heroDone = true;
    const lines = $$('.hero .ttl .ln>span, .ph .ttl .ln>span, .ct .ttl .ln>span, .lg-h .ttl .ln>span');
    if (!hasG || REDUCED) return;
    const tl = gsap.timeline();
    tl.from(lines, { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: 0.1 })
      .from('.hero .lbl, .ph .lbl, .ct .lbl, .crumb, .ph-sub, .lg-h .lbl', { opacity: 0, y: 14, duration: 0.8, ease: 'power3.out' }, 0.1)
      .from('.hero-s, .hero-p, .ph-p, .hero-a > *, .ph-a > *, .form', { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.07 }, 0.35)
      .fromTo('.ct-cards > *', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08, clearProps: 'opacity,transform' }, 0.45)
      .from('.hero-hud .hud', { opacity: 0, duration: 1.2, stagger: 0.1 }, 0.6);
    const hs = $('.hero-stats .stats, .ph-stats');
    if (hs) tl.add(() => { hs.classList.add('in'); $$('.cnt', hs).forEach(count); }, 0.7);
  }

  /* ---------- intro (home, once per session) ---------- */
  const STROKES = [
    // D
    'M44,44 H240 C400,44 496,190 496,346 C496,502 400,649 240,649 H44',
    // A
    'M610,645 L880,40 L1170,645', 'M820,649 H1090',
    // R
    'M1347,649 V44 H1580 C1690,44 1756,120 1756,224 C1756,328 1690,404 1580,404 H1347', 'M1560,430 L1790,650',
    // M
    'M1958,649 V60 L2234,440 L2513,60 V649',
    // E
    'M2704,44 H3119', 'M2704,348 H3119', 'M2704,648 H3119',
    // (R)
    'M3190,672 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0',
  ];
  function runIntro(done) {
    const intro = $('#intro');
    let seen = false; try { seen = sessionStorage.getItem('dar-intro') === '1'; } catch (e) {}
    if (!intro || seen || REDUCED || !hasG) { if (intro) intro.remove(); H.classList.add('no-intro'); done(); return; }
    try { sessionStorage.setItem('dar-intro', '1'); } catch (e) {}
    if (lenis) lenis.stop();
    B.style.overflow = 'hidden';
    const NS = 'http://www.w3.org/2000/svg';
    const gm = $('.im-strokes', intro), gt = $('.im-traces', intro), gs = $('.im-sparks', intro);
    const items = STROKES.map((d) => {
      const m = D.createElementNS(NS, 'path'); m.setAttribute('d', d); gm.appendChild(m);
      const tr = D.createElementNS(NS, 'path'); tr.setAttribute('d', d); gt.appendChild(tr);
      const sp = D.createElementNS(NS, 'circle'); sp.setAttribute('r', 16); sp.setAttribute('fill', '#fff'); sp.style.opacity = 0; gs.appendChild(sp);
      const len = m.getTotalLength();
      [m, tr].forEach((p) => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
      return { m, tr, sp, len };
    });
    const counter = $('.intro-c', intro), bar = $('.intro-bar i', intro);
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    const cnt = { v: 0 };
    tl.to('.intro-grid', { opacity: 1, duration: 1.2 }, 0)
      .to(cnt, { v: 100, duration: 3.1, ease: 'power1.inOut', onUpdate: () => { counter.textContent = String(Math.round(cnt.v)).padStart(3, '0'); } }, 0.1)
      .to(bar, { scaleX: 1, duration: 3.1, ease: 'power1.inOut' }, 0.1);
    // current traces each stroke, the white letter follows behind
    const order = [[0], [1, 2], [3, 4], [5], [6, 7, 8], [9]];
    let at = 0.25;
    order.forEach((grp, gi) => {
      grp.forEach((idx, k) => {
        const it = items[idx], dur = gi === 4 ? 0.42 : gi === 5 ? 0.3 : 0.62, st = at + k * (gi === 4 ? 0.1 : 0.16);
        const pos = { u: 0 };
        tl.to(it.tr, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, st)
          .to(it.sp, { opacity: 1, duration: 0.1 }, st)
          .to(pos, { u: 1, duration: dur, ease: 'power2.inOut', onUpdate: () => { const p = it.tr.getPointAtLength(pos.u * it.len); it.sp.setAttribute('cx', p.x); it.sp.setAttribute('cy', p.y); } }, st)
          .to(it.sp, { opacity: 0, duration: 0.25 }, st + dur - 0.05)
          .to(it.m, { strokeDashoffset: 0, duration: dur * 1.05, ease: 'power2.inOut' }, st + 0.14);
      });
      at += gi === 4 ? 0.5 : 0.48;
    });
    tl.to(gt, { opacity: 0, duration: 0.6 }, at + 0.3)
      .to('.intro-tag', { opacity: 1, letterSpacing: RTL ? '0.04em' : '0.22em', duration: 1, ease: 'power3.out' }, at + 0.1)
      .addLabel('fly', Math.max(at + 0.9, 3.4));
    // fly logo into the header, then split the doors
    tl.add(() => {
      const stage = $('.intro-logo', intro), target = $('.hdr-logo');
      const a = stage.getBoundingClientRect(), b = target.getBoundingClientRect();
      // the drawn logo sits inside a padded viewBox (-60 -60 3346 813)
      const sx = (b.width / (a.width * 3226 / 3346));
      const ax = a.left + a.width * (60 / 3346), ay = a.top + a.height * (60 / 813);
      intro.style.background = 'transparent';
      gsap.to('.intro-meta, .intro-bar, .intro-tag, .intro-grid', { opacity: 0, duration: 0.4 });
      gsap.to(stage, { x: b.left - ax, y: b.top - ay, scale: sx, transformOrigin: '0 0', duration: 1.1, ease: 'expo.inOut' });
      gsap.to('.intro-door.d1', { yPercent: -100, duration: 1.2, ease: 'expo.inOut', delay: 0.15 });
      gsap.to('.intro-door.d2', { yPercent: 100, duration: 1.2, ease: 'expo.inOut', delay: 0.15 });
      gsap.delayedCall(0.55, done);
      gsap.delayedCall(1.15, () => { target.style.opacity = 1; gsap.to(stage, { opacity: 0, duration: 0.2, onComplete: () => { intro.remove(); B.style.overflow = ''; if (lenis) lenis.start(); } }); });
    }, 'fly');
    $('.hdr-logo').style.opacity = 0;
  }

  /* ---------- inner page wipe ---------- */
  function wipeOut(done) {
    const w = $('#wipe');
    if (!w || !hasG || REDUCED) { if (w) w.remove(); done(); return; }
    gsap.timeline().fromTo('#wipe i', { scaleX: 0.2 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' })
      .to('#wipe i', { scaleX: 40, opacity: 0, duration: 0.5, ease: 'power3.in' })
      .to(w, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '-=0.2')
      .add(done, '-=0.55')
      .add(() => w.remove());
  }
  // internal link transitions
  D.addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href') || '';
    if (!/\.html(\?|#|$)/.test(href) || /^(https?:|mailto:|tel:)/.test(href) || href.startsWith('#')) return;
    if (!hasG || REDUCED) return;
    e.preventDefault();
    const ov = D.createElement('div'); ov.className = 'wipe'; ov.innerHTML = '<i></i>'; ov.style.transform = 'translateY(100%)'; B.appendChild(ov);
    gsap.timeline().to(ov, { y: 0, duration: 0.6, ease: 'expo.inOut' }).fromTo($('i', ov), { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, '-=0.15').add(() => { location.href = a.href; });
  });
  addEventListener('pageshow', (e) => { if (e.persisted) $$('.wipe').forEach((w) => w.remove()); });

  /* ---------- model ring (home) ---------- */
  function setupModel() {
    const list = $$('.md-p'); if (!list.length) return;
    const arcs = $$('.md-arc'), labs = $$('.md-lab'), nowN = $('.md-now-n'), nowT = $('.md-now-t');
    const set = (i) => {
      list.forEach((p, k) => p.classList.toggle('on', k === i));
      arcs.forEach((a, k) => a.classList.toggle('on', k === i)); labs.forEach((a, k) => a.classList.toggle('on', k === i));
      if (nowN) { nowN.textContent = '0' + (i + 1); nowT.textContent = $('.md-t', list[i]).textContent; }
    };
    set(0);
    if (!hasG) { list.forEach((p) => p.classList.add('on')); return; }
    list.forEach((p, i) => ScrollTrigger.create({ trigger: p, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => s.isActive && set(i) }));
  }

  /* ---------- engagement ---------- */
  function setupEngagement() {
    $$('.eg-track').forEach((tr) => {
      const nodes = $$('.eg-n', tr), line = $('.eg-line', tr);
      const upd = (p) => { if (line) { line.style.setProperty('--p', p); line.style.setProperty('--o', p > 0.01 && p < 0.99 ? 1 : 0); } nodes.forEach((n, i) => n.classList.toggle('on', p >= i / (nodes.length - 1) - 0.02)); };
      if (!hasG || REDUCED) { upd(1); return; }
      const mob = matchMedia('(max-width:640px)').matches;
      ScrollTrigger.create({ trigger: tr, start: mob ? 'top 75%' : 'top 70%', end: mob ? 'bottom 55%' : 'top 25%', scrub: 0.6, onUpdate: (s) => upd(s.progress) });
    });
  }

  /* ---------- comply domains ---------- */
  function setupDomains() {
    const nodes = $$('.dm-node'); if (!nodes.length) return;
    const panels = $$('.dm-panel'), lines = $$('.dm-svg line');
    let cur = 0, auto = true;
    const set = (i) => { cur = i; nodes.forEach((n, k) => n.classList.toggle('on', k === i)); panels.forEach((p, k) => p.classList.toggle('on', k === i)); lines.forEach((l, k) => l.classList.toggle('on', k === i)); };
    nodes.forEach((n, i) => { n.addEventListener('click', () => { auto = false; set(i); }); n.addEventListener('mouseenter', () => { auto = false; set(i); }); });
    set(0);
    setInterval(() => { if (auto && !document.hidden) set((cur + 1) % nodes.length); }, 4200);
  }

  /* ---------- operating model cycle (comply) ---------- */
  function setupOM() {
    const w = $('.om-wrap'); if (!w) return;
    const steps = $$('.om-s', w), ring = $('.om-ring', w);
    const upd = (p) => { ring && ring.style.setProperty('--p', p); steps.forEach((s, i) => s.classList.toggle('on', p >= i / steps.length + 0.05)); };
    if (!hasG || REDUCED) { upd(1); return; }
    ScrollTrigger.create({ trigger: w, start: 'top 75%', end: 'bottom 50%', scrub: 0.5, onUpdate: (s) => upd(s.progress) });
  }

  /* ---------- client filters ---------- */
  function setupFilters() {
    const btns = $$('.flt'); if (!btns.length) return;
    const cards = $$('.cc');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.classList.toggle('on', x === b));
      const f = b.dataset.f;
      cards.forEach((c) => c.classList.toggle('off', f !== 'all' && c.dataset.s !== f));
      if (hasG) gsap.fromTo(cards.filter((c) => !c.classList.contains('off')), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
    if (hasG && !REDUCED) ScrollTrigger.batch('.cc', { start: 'top 92%', onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' }) });
  }

  /* ---------- contact form ---------- */
  function setupForm() {
    const f = $('#cform'); if (!f) return;
    let via = 'mail';
    $$('button[type=submit]', f).forEach((b) => b.addEventListener('click', () => (via = b.dataset.via)));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $('.form-err', f); err.textContent = '';
      let ok = true;
      ['name', 'email', 'service'].forEach((n) => { const el = f.elements[n]; const bad = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value)); el.closest('.fl').classList.toggle('bad', bad); if (bad) ok = false; });
      if (!ok) { err.textContent = RTL ? 'يرجى تعبئة الاسم والبريد الإلكتروني واختيار الخدمة.' : 'Please fill in your name, email and service interest.'; return; }
      const v = (n) => f.elements[n].value.trim();
      const lines = [(RTL ? 'الاسم: ' : 'Name: ') + v('name'), (RTL ? 'البريد: ' : 'Email: ') + v('email')];
      if (v('phone')) lines.push((RTL ? 'الجوال: ' : 'Phone: ') + v('phone'));
      if (v('company')) lines.push((RTL ? 'الجهة: ' : 'Company: ') + v('company'));
      lines.push((RTL ? 'الخدمة: ' : 'Service: ') + v('service'));
      if (v('msg')) lines.push('', v('msg'));
      const body = lines.join('\n');
      if (via === 'wa') window.open('https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(body), '_blank');
      else location.href = 'mailto:' + f.dataset.mail + '?subject=' + encodeURIComponent('DAR ME — ' + v('service')) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- micro interactions ---------- */
  function setupMicro() {
    if (matchMedia('(hover:hover)').matches && hasG && !REDUCED) {
      $$('[data-magnetic]').forEach((el) => {
        el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' }); });
        el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,.4)' }));
      });
      $$('.cap').forEach((c) => c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
    }
    // legal toc
    const toc = $$('.lg-toc a');
    if (toc.length && hasG) $$('.lg-s').forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 40%', end: 'bottom 40%', onToggle: (st) => st.isActive && toc.forEach((a, k) => a.classList.toggle('on', k === i)) }));
  }

  /* ---------- boot ---------- */
  setupReveals(); setupModel(); setupEngagement(); setupDomains(); setupOM(); setupFilters(); setupForm(); setupMicro();
  if (window.DARFX) DARFX.start();
  const start = () => { heroIn(); if (window.ScrollTrigger) ScrollTrigger.refresh(); };
  if ($('#intro')) runIntro(start); else wipeOut(start);
  addEventListener('load', () => window.ScrollTrigger && ScrollTrigger.refresh());
})();
