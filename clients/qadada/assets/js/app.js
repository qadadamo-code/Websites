/* عائلة قدادة — site motion, hero olive tree, Gaza roots map, world presence map */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  if (reduced || !hasGsap) document.documentElement.classList.add('reduced');
  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  // deterministic random so the tree is the same on every visit
  let seed = 1175;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const rr = (a, b) => a + (b - a) * rnd();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  window.QLenis = lenis;
  const scrollToEl = target => {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -60, duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(t);
    if (a.hasAttribute('data-suggest')) setTimeout(() => window.QTree && window.QTree.suggest(), 900);
  }));

  /* ---------- Header & menu ---------- */
  const hdr = $('#hdr'), nav = $('#nav'), menuBtn = $('#menuBtn');
  const onScroll = () => hdr.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Hero olive tree (braided trunk like the family seal) ---------- */
  const tree = $('#heroTree');
  const groups = { trunk: [], branches: [], leaves: [], roots: [], gold: null };
  function buildHeroTree() {
    const defs = el('defs', {}, tree);
    const bark = el('linearGradient', { id: 'bark', x1: 0, x2: 1 }, defs);
    [['0', '#3b1d07'], ['.45', '#8b5a2b'], ['.7', '#6b3d16'], ['1', '#2e1604']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, bark));
    const glow = el('radialGradient', { id: 'heroGlow' }, defs);
    el('stop', { offset: 0, 'stop-color': '#e8cd7a', 'stop-opacity': '.35' }, glow);
    el('stop', { offset: 1, 'stop-color': '#e8cd7a', 'stop-opacity': '0' }, glow);
    el('ellipse', { cx: 500, cy: 470, rx: 470, ry: 380, fill: 'url(#heroGlow)' }, tree);

    const GROUND = 820, TOP = 560, CX = 500;
    const rootsG = el('g', {}, tree);
    const canopy = el('g', { class: 'ht-canopy' }, tree);
    const branchG = el('g', {}, canopy);
    const leafG = el('g', {}, canopy);

    // roots
    function root(x, y, ang, len, w, d) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      const cx = x + Math.cos(ang + rr(-.5, .5)) * len * .5, cy = y + Math.sin(ang + rr(-.3, .3)) * len * .5;
      const p = el('path', { d: `M${x} ${y} Q${cx} ${cy} ${x2} ${y2}`, class: 'ht-root', 'stroke-width': w, pathLength: 1 }, rootsG);
      groups.roots.push(p);
      if (d > 0) for (let i = 0; i < 2; i++) root(x2, y2, ang + rr(-.7, .7), len * rr(.55, .75), w * .6, d - 1);
    }
    [Math.PI * .92, Math.PI * .75, Math.PI * .55, Math.PI * .38, Math.PI * .2, Math.PI * .08].forEach((a, i) => root(CX + (i - 2.5) * 6, GROUND - 4, a, rr(70, 120), 9 - Math.abs(i - 2.5), 2));
    // golden root reaching down to Gaza
    const gold = el('path', { d: `M${CX + 4} ${GROUND} C ${CX + 30} ${GROUND + 60}, ${CX + 90} ${GROUND + 70}, ${CX + 120} ${GROUND + 128}`, class: 'ht-root ht-root--gold', 'stroke-width': 3, pathLength: 1 }, rootsG);
    groups.gold = gold;
    const pin = el('g', { opacity: 0 }, rootsG);
    el('circle', { cx: CX + 120, cy: GROUND + 134, r: 6, fill: '#e8cd7a' }, pin);
    el('circle', { cx: CX + 120, cy: GROUND + 134, r: 6, class: 'gm-pulse' }, pin);
    const t1 = el('text', { x: CX + 140, y: GROUND + 142, class: 'ht-label', 'text-anchor': 'end' }, pin); t1.textContent = 'غزة';
    const t2 = el('text', { x: CX + 196, y: GROUND + 142, class: 'ht-label-s', 'text-anchor': 'end' }, pin); t2.textContent = '';
    groups.pin = pin;

    // braided trunk: three strands twisting around each other
    for (let s = 0; s < 3; s++) {
      let d = '';
      for (let i = 0; i <= 30; i++) {
        const t = i / 30, y = GROUND - (GROUND - TOP) * t;
        const w = 30 - 16 * t;
        const x = CX + Math.sin(t * Math.PI * 2.4 + s * 2.094) * w + (t > .85 ? (s - 1) * (t - .85) * 120 : 0);
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      const p = el('path', { d, class: 'ht-branch', stroke: 'url(#bark)', 'stroke-width': 26 - s * 2, pathLength: 1 }, branchG);
      groups.trunk.push(p);
    }
    const leafColors = ['#6e7b34', '#8a9a45', '#4c5a22', '#a3ad62', '#5d6b2a', '#7d8b3a'];
    function leafCluster(x, y, ang, n) {
      const g = el('g', {}, leafG);
      for (let i = 0; i < n; i++) {
        const a = ang + rr(-1.6, 1.6), len = rr(16, 26);
        const lx = x + rr(-14, 14), ly = y + rr(-12, 12);
        const L = el('path', {
          d: `M0 0 C${len * .3} ${-len * .17} ${len * .75} ${-len * .17} ${len} 0 C${len * .75} ${len * .17} ${len * .3} ${len * .17} 0 0Z`,
          fill: leafColors[(rnd() * leafColors.length) | 0],
          transform: `translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${(a * 180 / Math.PI).toFixed(0)})`,
          class: 'ht-leaf'
        }, g);
        groups.leaves.push(L);
      }
      if (rnd() < .45) {
        const o = el('ellipse', { cx: x + rr(-8, 8), cy: y + rr(-4, 8), rx: 4.2, ry: 5.6, fill: rnd() < .5 ? '#8f9b38' : '#3f4a17' }, g);
        groups.leaves.push(o);
      }
    }
    function branch(x, y, ang, len, w, d) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      const bend = rr(-.35, .35);
      const cx = x + Math.cos(ang + bend) * len * .55, cy = y + Math.sin(ang + bend) * len * .55;
      const p = el('path', { d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, class: 'ht-branch', stroke: 'url(#bark)', 'stroke-width': Math.max(1.4, w).toFixed(1), pathLength: 1 }, branchG);
      (groups.branches[6 - d] = groups.branches[6 - d] || []).push(p);
      if (d <= 3) leafCluster(x2, y2, ang, d <= 1 ? 9 : 6);
      if (d <= 2) leafCluster((x + x2) / 2, (y + y2) / 2, ang, 4);
      if (d > 0) {
        const kids = d > 4 ? 2 : (rnd() < .6 ? 2 : 3);
        for (let i = 0; i < kids; i++) {
          const spread = kids === 2 ? (i ? 1 : -1) * rr(.32, .6) : (i - 1) * rr(.45, .62);
          let na = ang + spread;
          na = Math.max(-Math.PI + .12, Math.min(-.12, na + (na < -Math.PI / 2 ? .06 : -.06) * 0));
          branch(x2, y2, na, len * rr(.7, .8), w * .66, d - 1);
        }
      }
    }
    const mains = [-1.05, -.6, -.2, .2, .6, 1.05];
    mains.forEach((m, i) => branch(CX + (i - 2.5) * 5, TOP + 6, -Math.PI / 2 + m * 1.05, rr(120, 150) * (1 - Math.abs(m) * .12), 15, 5));
    groups.canopy = canopy;
  }

  function animateHero() {
    const title = $$('.hero__line');
    if (reduced || !hasGsap) {
      groups.pin.setAttribute('opacity', 1);
      return;
    }
    const all = [...groups.trunk, ...groups.branches.flat(), ...groups.roots, groups.gold];
    all.forEach(p => { p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; });
    gsap.set(groups.leaves, { scale: 0, transformOrigin: '0% 50%' });
    gsap.set('.hero__eyebrow, .hero__motto, .hero__lead, .hero__actions, .hero__scroll', { opacity: 0, y: 24 });
    gsap.set(title, { yPercent: 110 });
    const tl = gsap.timeline({ delay: .2 });
    tl.to(groups.roots, { strokeDashoffset: 0, duration: 1.4, stagger: .01, ease: 'power2.out' }, 0)
      .to(groups.trunk, { strokeDashoffset: 0, duration: 1.3, stagger: .12, ease: 'power2.inOut' }, .2);
    groups.branches.forEach((lvl, i) => lvl && tl.to(lvl, { strokeDashoffset: 0, duration: .7, stagger: { amount: .25 }, ease: 'power1.out' }, 1.1 + i * .32));
    tl.to(groups.leaves, { scale: 1, duration: .6, ease: 'back.out(2.4)', stagger: { amount: 1.6, from: 'random' } }, 1.9)
      .to(groups.gold, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 2.4)
      .to(groups.pin, { attr: { opacity: 1 }, duration: .6 }, 3.3)
      .to(title, { yPercent: 0, duration: 1.1, stagger: .14, ease: 'power4.out' }, .5)
      .to('.hero__eyebrow, .hero__motto, .hero__lead, .hero__actions, .hero__scroll', { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out' }, .9);
    // gentle breathing of the canopy
    gsap.to(groups.canopy, { rotation: .9, svgOrigin: '500 820', duration: 4.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 });
    // scroll: tree rises, content drifts
    gsap.to('#heroTree', { yPercent: -8, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { y: -80, opacity: .1, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'center center', end: 'bottom top', scrub: true } });
  }

  /* ---------- Loader ---------- */
  let booted = false;
  function hideLoader() {
    if (booted) return;
    booted = true;
    const l = $('#loader');
    l.classList.add('is-done');
    setTimeout(() => l.remove(), 900);
    animateHero();
    initScrollFx();
  }

  /* ---------- Scroll reveals & small drawings ---------- */
  function initScrollFx() {
    if (reduced || !hasGsap) {
      $$('[pathLength]').forEach(p => (p.style.strokeDashoffset = 0));
      $$('.tl__item').forEach(i => i.classList.add('is-on'));
      return;
    }
    $$('.reveal').forEach(r => gsap.to(r, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: r, start: 'top 88%' } }));
    gsap.to('#spinePath', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#roots', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    $$('[data-count]').forEach(b => {
      const end = +b.dataset.count, pre = b.dataset.prefix || '', o = { v: 0 };
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 90%' }, onUpdate: () => (b.textContent = pre + Math.round(o.v)) });
    });
    gsap.to('.mk__link path', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: '.mk', start: 'top 60%' } });
    gsap.from('.sons__list li', { opacity: 0, y: 30, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.sons__list', start: 'top 85%' } });
    gsap.from('.mk__frame img', { scale: 1.3, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '.mk', start: 'top 75%' } });
    // genealogy chain grows link by link
    const items = $$('.chain__list li');
    gsap.set(items, { opacity: 0, y: -14 });
    gsap.to(items, { opacity: 1, y: 0, duration: .55, stagger: .22, ease: 'power2.out', scrollTrigger: { trigger: '#chain', start: 'top 75%' } });
    gsap.to('.fork__lines path', { strokeDashoffset: 0, duration: 1.2, stagger: .2, ease: 'power2.inOut', scrollTrigger: { trigger: '.fork', start: 'top 75%' } });
    // timeline
    gsap.to('.tl__line i', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#timeline', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    $$('.tl__item').forEach(it => {
      ScrollTrigger.create({ trigger: it, start: 'top 62%', onEnter: () => it.classList.add('is-on'), onLeaveBack: () => it.classList.remove('is-on') });
      gsap.from(it.children, { opacity: 0, x: (i) => (i ? -40 : 40), duration: .9, ease: 'power3.out', scrollTrigger: { trigger: it, start: 'top 82%' } });
    });
    gsap.from('.hyp__card', { rotateX: -18, transformPerspective: 900, transformOrigin: '50% 0%', duration: 1.1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.hyp', start: 'top 80%' } });
    initMap();
  }

  /* ---------- Gaza & Jaffa mini map ---------- */
  function buildGazaMini() {
    const svg = $('#gazaMini');
    if (!svg || !window.QGEO) return;
    svg.setAttribute('viewBox', '0 0 300 360'); svg.setAttribute('direction', 'ltr');
    const B = { x0: 34.12, x1: 35.22, y0: 31.12, y1: 32.26 };
    const k = Math.cos(31.7 * Math.PI / 180);
    const sx = 300 / ((B.x1 - B.x0) * k), sy = 360 / (B.y1 - B.y0);
    const s = Math.min(sx, sy);
    const P = (lon, lat) => [((lon - B.x0) * k * s), (B.y1 - lat) * s];
    const ring = str => str.split(' ').map(p => { const [a, b] = p.split(',').map(Number); return P(a, b).map(v => v.toFixed(1)).join(','); }).join(' ');
    const defs = el('defs', {}, svg);
    const g = el('linearGradient', { id: 'gmFill', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#c8102e', 'stop-opacity': '.85' }, g);
    el('stop', { offset: 1, 'stop-color': '#7d0a1c', 'stop-opacity': '.85' }, g);
    (QGEO.countries.ps || []).forEach(r => el('polygon', { points: ring(r), class: 'gm-pal' }, svg));
    const coast = [[34.22, 31.32], [34.36, 31.45], [34.49, 31.6], [34.57, 31.69], [34.65, 31.82], [34.71, 31.95], [34.75, 32.05], [34.79, 32.15], [34.81, 32.26]];
    el('polyline', { points: coast.map(c => P(...c).map(v => v.toFixed(1)).join(',')).join(' '), class: 'gm-coast' }, svg);
    if (QGEO.gaza) el('polygon', { points: ring(QGEO.gaza), class: 'gm-strip' }, svg);
    const gz = P(34.4667, 31.5017), jf = P(34.7522, 32.0504);
    const arc = el('path', { d: `M${jf[0]} ${jf[1]} Q ${jf[0] + 60} ${(jf[1] + gz[1]) / 2} ${gz[0]} ${gz[1]}`, class: 'gm-arc' }, svg);
    const sea = el('text', { x: 18, y: 120, class: 'gm-txt', opacity: '.45', 'text-anchor': 'start' }, svg); sea.textContent = 'البحر المتوسط';
    [[gz, 'غزة', true], [jf, 'يافا', false]].forEach(([p, name, big]) => {
      el('circle', { cx: p[0], cy: p[1], r: big ? 5.5 : 4, class: 'gm-pin' }, svg);
      if (big) el('circle', { cx: p[0], cy: p[1], r: 6, class: 'gm-pulse' }, svg);
      const t = el('text', { x: p[0] + 14, y: p[1] + 6, class: 'gm-txt' + (big ? ' gm-txt--big' : ''), 'text-anchor': 'start' }, svg);
      t.textContent = name;
    });
    if (hasGsap && !reduced) gsap.fromTo(arc, { strokeDashoffset: 120 }, { strokeDashoffset: 0, duration: 6, repeat: -1, ease: 'none' });
  }

  /* ---------- World presence map (canvas, scroll story) ---------- */
  const CITIES = [
    { id: 'gaza', name: 'غزة', country: 'فلسطين', code: 'PS', lon: 34.4667, lat: 31.5017, stage: 0, origin: true },
    { id: 'jaffa', name: 'يافا', country: 'فلسطين · قبل 1948', code: 'PS', lon: 34.7522, lat: 32.0504, stage: 0, hideAt: 1.3, hideM: .85 },
    { id: 'cairo', name: 'القاهرة', country: 'مصر', code: 'EG', lon: 31.2357, lat: 30.0444, stage: 1, hideAt: 2.3 },
    { id: 'kfs', name: 'كفر الشيخ', country: 'مصر', code: 'EG', lon: 30.9397, lat: 31.1107, stage: 1, hideAt: 1.9, hideM: 1.05 },
    { id: 'amman', name: 'عمّان', country: 'الأردن', code: 'JO', lon: 35.9106, lat: 31.9539, stage: 1, hideAt: 2.3 },
    { id: 'khobar', name: 'الخبر', country: 'السعودية', code: 'SA', lon: 50.2083, lat: 26.2172, stage: 1 },
    { id: 'tr', name: 'تركيا', country: '', code: 'TR', lon: 32.85, lat: 39.93, stage: 2 },
    { id: 'bg', name: 'بلغاريا', country: '', code: 'BG', lon: 25.48, lat: 42.73, stage: 2 },
    { id: 'nj', name: 'نيوجيرسي', country: 'الولايات المتحدة', code: 'US', lon: -74.41, lat: 40.06, stage: 3 },
    { id: 'gb', name: 'جرين باي', country: 'ويسكونسن · الولايات المتحدة', code: 'US', lon: -88.0198, lat: 44.5192, stage: 3 },
    { id: 'to', name: 'تورنتو', country: 'كندا', code: 'CA', lon: -79.3832, lat: 43.6532, stage: 3 }
  ];
  function buildCityList() {
    const ul = $('#citiesList');
    CITIES.forEach(c => {
      const li = document.createElement('li');
      if (c.origin) li.className = 'is-origin';
      li.innerHTML = `<span class="flag">${c.code}</span><div><b>${c.name}</b><small>${c.country || (c.code === 'TR' ? 'الجمهورية التركية' : 'جمهورية بلغاريا')}</small></div>`;
      ul.appendChild(li);
    });
  }

  function initMap() {
    const canvas = $('#mapCanvas');
    if (!canvas || !window.QGEO) return;
    const ctx = canvas.getContext('2d');
    const labelsBox = $('#mapLabels');
    const steps = $$('.mstep'), prog = $('#mapProg');
    let W = 0, H = 0, DPR = 1, progress = 0, visible = false, raf = 0;
    const toRad = d => d * Math.PI / 180;
    const merc = (lon, lat) => [toRad(lon), Math.log(Math.tan(Math.PI / 4 + toRad(lat) / 2))];
    // parse geometry once into mercator radians
    const parse = s => s.split(' ').map(p => { const [a, b] = p.split(',').map(Number); return merc(a, b); });
    const land = QGEO.land.map(parse);
    const countries = {};
    for (const k in QGEO.countries) countries[k] = QGEO.countries[k].map(parse);
    const gaza = QGEO.gaza ? parse(QGEO.gaza) : null;
    const cityM = CITIES.map(c => ({ ...c, m: merc(c.lon, c.lat) }));
    const origin = cityM[0];
    // camera keyframes: [lon, lat, visible longitude span]
    const CAMS = [[34.6, 31.75, 3.2], [38.5, 30.2, 30], [33, 35.5, 44], [-19, 38, 150]];
    const CAMS_M = [[34.6, 31.75, 2.6], [40, 29.5, 29], [33, 36, 30], [-19, 40, 150]];
    const labels = cityM.map(c => {
      const d = document.createElement('div');
      d.className = 'mlabel' + (c.origin ? ' mlabel--origin' : '');
      d.innerHTML = c.name + (c.country && !c.origin ? `<small>${c.country}</small>` : c.origin ? '<small>الجذر الأول</small>' : '');
      labelsBox.appendChild(d);
      return d;
    });

    let dots = null;
    function makePattern() {
      const p = document.createElement('canvas');
      const s = Math.round(7 * DPR);
      p.width = p.height = s;
      const c = p.getContext('2d');
      c.fillStyle = 'rgba(232,205,122,.34)';
      c.beginPath(); c.arc(s / 2, s / 2, 1.05 * DPR, 0, Math.PI * 2); c.fill();
      dots = ctx.createPattern(p, 'repeat');
    }
    function resize() {
      DPR = Math.min(2, devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      makePattern();
      draw(performance.now());
    }
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function camera(s) {
      const i = Math.min(2, Math.floor(s)), t = ease(Math.min(1, Math.max(0, s - i)));
      const cams = W < 760 ? CAMS_M : CAMS;
      const a = cams[i], b = cams[i + 1];
      const lon = a[0] + (b[0] - a[0]) * t, lat = a[1] + (b[1] - a[1]) * t;
      const span = Math.exp(Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * t);
      const mobile = W < 760;
      const usableW = mobile ? W : W * .62;
      const scale = usableW / toRad(span);
      const c = merc(lon, lat);
      const cx = mobile ? W / 2 : W * .33, cy = mobile ? H * .34 : H * .5;
      return { scale, c, cx, cy };
    }
    function pathRings(rings, cam) {
      ctx.beginPath();
      for (const r of rings) {
        for (let i = 0; i < r.length; i++) {
          const x = cam.cx + (r[i][0] - cam.c[0]) * cam.scale, y = cam.cy - (r[i][1] - cam.c[1]) * cam.scale;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
      }
    }
    const proj = (m, cam) => [cam.cx + (m[0] - cam.c[0]) * cam.scale, cam.cy - (m[1] - cam.c[1]) * cam.scale];
    function arcPoint(a, b, t) {
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1], dist = Math.hypot(dx, dy);
      const h = Math.min(dist * .32, 260);
      const cx = mx + (dy / (dist || 1)) * h * (dx < 0 ? 1 : -1), cy = my - Math.abs(dx / (dist || 1)) * h - h * .2;
      const u = 1 - t;
      return [u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]];
    }
    function draw(now) {
      if (!W) return;
      const s = progress * 3;
      const cam = camera(s);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const bg = ctx.createRadialGradient(W * .35, H * .5, 0, W * .6, H * .5, Math.max(W, H) * .8);
      bg.addColorStop(0, '#0b2615'); bg.addColorStop(1, '#04120a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // land
      pathRings(land, cam);
      ctx.fillStyle = '#0f3220'; ctx.fill('evenodd');
      ctx.fillStyle = dots; ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(232,205,122,.16)'; ctx.lineWidth = 1; ctx.stroke();
      // family countries
      const litStage = { eg: 1, jo: 1, sa: 1, tr: 2, bg: 2, us: 3, ca: 3 };
      for (const k in litStage) {
        const a = Math.max(0, Math.min(1, (s - litStage[k] + .7) * 1.6));
        if (!a || !countries[k]) continue;
        pathRings(countries[k], cam);
        ctx.fillStyle = `rgba(201,164,60,${.13 * a})`; ctx.fill();
        ctx.strokeStyle = `rgba(232,205,122,${.45 * a})`; ctx.lineWidth = 1; ctx.stroke();
      }
      if (countries.ps) {
        pathRings(countries.ps, cam);
        ctx.fillStyle = 'rgba(232,205,122,.28)'; ctx.fill();
        ctx.strokeStyle = 'rgba(232,205,122,.9)'; ctx.lineWidth = 1.4; ctx.stroke();
      }
      if (gaza) {
        pathRings([gaza], cam);
        ctx.fillStyle = 'rgba(200,16,46,.75)'; ctx.fill();
        ctx.strokeStyle = '#f3dd95'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      const o = proj(origin.m, cam);
      // arcs
      cityM.forEach((c, i) => {
        if (c.origin) return;
        const start = c.stage === 0 ? 0 : c.stage - 1 + .35, len = c.stage === 0 ? .5 : .55;
        const t = Math.max(0, Math.min(1, (s - start) / len));
        c._t = t;
        const p = proj(c.m, cam);
        c._p = p;
        if (!t) return;
        ctx.beginPath();
        const N = 48;
        for (let j = 0; j <= N * t; j++) { const q = arcPoint(o, p, j / N); j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        const grad = ctx.createLinearGradient(o[0], o[1], p[0], p[1]);
        grad.addColorStop(0, 'rgba(243,221,149,.95)'); grad.addColorStop(1, 'rgba(201,164,60,.6)');
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6; ctx.stroke();
        if (t >= 1) {
          // light travelling from Gaza
          const ph = ((now / 2600) + i * .17) % 1;
          const q = arcPoint(o, p, ph);
          ctx.fillStyle = 'rgba(255,240,190,.95)';
          ctx.beginPath(); ctx.arc(q[0], q[1], 2.2, 0, Math.PI * 2); ctx.fill();
          const pr = (now / 1800 + i * .3) % 1;
          ctx.strokeStyle = `rgba(232,205,122,${1 - pr})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(p[0], p[1], 4 + pr * 14, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = '#f3dd95';
          ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill();
        }
      });
      // origin
      for (let r = 0; r < 3; r++) {
        const pr = ((now / 2200) + r / 3) % 1;
        ctx.strokeStyle = `rgba(200,16,46,${.9 * (1 - pr)})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(o[0], o[1], 6 + pr * 34, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = '#f3dd95'; ctx.beginPath(); ctx.arc(o[0], o[1], 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c8102e'; ctx.beginPath(); ctx.arc(o[0], o[1], 3.5, 0, Math.PI * 2); ctx.fill();
      // labels
      cityM.forEach((c, i) => {
        const p = c.origin ? o : c._p;
        const hideAt = W < 760 && c.hideM ? c.hideM : c.hideAt;
        const on = c.origin || (c._t >= 1 && !(hideAt && s > hideAt));
        labels[i].classList.toggle('is-on', !!on);
        labels[i].style.transform = `translate(${p[0]}px,${p[1]}px) translate(-50%,-140%)`;
      });
      // steps
      const step = Math.min(3, Math.floor(s + .35));
      steps.forEach((st, i) => st.classList.toggle('is-on', i === step));
      if (prog) prog.style.transform = `scaleX(${progress})`;
    }
    function loop(now) { draw(now); raf = visible ? requestAnimationFrame(loop) : 0; }
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    }).observe(canvas);
    addEventListener('resize', resize);
    resize();
    if (hasGsap && !reduced) {
      ScrollTrigger.create({ trigger: '#mapPin', pin: true, start: 'top top', end: '+=320%', scrub: true, onUpdate: self => (progress = self.progress) });
    } else {
      progress = 1;
    }
  }

  /* ---------- Boot ---------- */
  buildHeroTree();
  buildGazaMini();
  buildCityList();
  const ready = () => setTimeout(hideLoader, reduced ? 0 : 1500);
  if (document.readyState === 'complete') ready(); else addEventListener('load', ready);
  // safety: never leave the loader up
  setTimeout(() => $('#loader') && !$('#loader').classList.contains('is-done') && hideLoader(), 6000);
})();
