/* عائلة قدادة — interactive, animated, editable family tree (grows upward like an olive tree) */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const API = 'api.php';
  const svg = $('#ftSvg'), stage = $('#ftStage');
  if (!svg) return;

  const LEVEL = 172, SLOT = 128, GROUND = 250;
  const STATUS = { confirmed: 'مؤكَّد من العائلة', documented: 'موثَّق بمصدر', narrative: 'رواية عائلية', proposed: 'موضعٌ مقترح' };
  const PLACES = ['غزة', 'يافا', 'القاهرة', 'كفر الشيخ', 'عمّان', 'الخبر', 'تركيا', 'بلغاريا', 'نيوجيرسي', 'جرين باي', 'تورنتو'];

  const state = { members: [], byId: new Map(), kids: new Map(), admin: false, setup: false, csrf: '', pending: 0, collapsed: new Set(), sel: null };
  let rootId = null;

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm = s => String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();

  /* ---------------- API ---------------- */
  async function api(action, body, isForm) {
    const opt = { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: {} };
    if (body) {
      opt.headers['X-CSRF'] = state.csrf;
      if (isForm) opt.body = body;
      else { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    }
    const r = await fetch(`${API}?action=${action}`, opt);
    let j;
    try { j = await r.json(); } catch (e) { throw new Error('تعذّر الاتصال بالخادم'); }
    if (!j.ok) throw new Error(j.error || 'حدث خطأ');
    if (j.csrf) state.csrf = j.csrf;
    return j;
  }
  async function load() {
    try {
      const j = await api('tree');
      state.admin = j.admin; state.setup = j.setup; state.pending = j.pending || 0;
      setMembers(j.members);
      state.online = true;
    } catch (e) {
      const r = await fetch('data/seed.json');
      setMembers((await r.json()).members);
      state.online = false;
    }
    updateAdminBtn();
  }
  function setMembers(list) {
    state.members = list;
    state.byId = new Map(list.map(m => [m.id, m]));
    state.kids = new Map();
    rootId = null;
    list.forEach(m => {
      if (!m.parent || !state.byId.has(m.parent)) { if (!rootId) rootId = m.id; return; }
      if (!state.kids.has(m.parent)) state.kids.set(m.parent, []);
      state.kids.get(m.parent).push(m.id);
    });
    const gens = depthOf();
    $('#ftCount').textContent = `في الشجرة ${list.length} فردًا عبر ${gens} أجيال`;
  }
  function depthOf() {
    let max = 0;
    const walk = (id, d) => { max = Math.max(max, d); (state.kids.get(id) || []).forEach(k => walk(k, d + 1)); };
    if (rootId) walk(rootId, 1);
    return max;
  }
  const nasab = (id, withLinks) => {
    const parts = [];
    let m = state.byId.get(id), first = true;
    while (m) {
      const nm = esc(m.name);
      parts.push(withLinks && !first ? `<a data-go="${m.id}">${nm}</a>` : nm);
      const p = state.byId.get(m.parent);
      if (p) parts.push(m.gender === 'f' && first ? 'بنت' : 'بن');
      first = false;
      m = p;
    }
    let s = parts.join(' ');
    if (!/قدادة/.test(state.byId.get(id)?.name || '') && !/قدادة/.test(s)) s += ' قدادة';
    return s;
  };

  /* ---------------- Layout ---------------- */
  function layout() {
    const pos = new Map();
    let slot = 0;
    const walk = (id, d) => {
      const kids = state.collapsed.has(id) ? [] : (state.kids.get(id) || []);
      let x;
      if (!kids.length) { x = slot * SLOT; slot += (state.byId.get(id).featured ? 1.25 : 1); }
      else {
        const xs = kids.map(k => walk(k, d + 1));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      pos.set(id, { x, y: -d * LEVEL, d });
      return x;
    };
    if (rootId) walk(rootId, 0);
    // right-to-left: the first child sits on the right
    const rx = pos.get(rootId)?.x || 0;
    pos.forEach(p => (p.x = rx - p.x));
    return pos;
  }
  function descCount(id) {
    let n = 0;
    (state.kids.get(id) || []).forEach(k => (n += 1 + descCount(k)));
    return n;
  }

  /* ---------------- Scene ---------------- */
  const defs = el('defs', {}, svg);
  defs.innerHTML = `
    <linearGradient id="tBark" x1="0" x2="1"><stop offset="0" stop-color="#3f2009"/><stop offset=".5" stop-color="#8b5a2b"/><stop offset="1" stop-color="#4a250a"/></linearGradient>
    <linearGradient id="tSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3216"/><stop offset=".08" stop-color="#2e2010"/><stop offset="1" stop-color="#0d1f12"/></linearGradient>
    <radialGradient id="tMedal" cx=".35" cy=".3"><stop offset="0" stop-color="#2c7046"/><stop offset="1" stop-color="#0d2a18"/></radialGradient>
    <radialGradient id="tMedalF" cx=".35" cy=".3"><stop offset="0" stop-color="#9aa755"/><stop offset="1" stop-color="#4c5a22"/></radialGradient>
    <linearGradient id="tGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dd95"/><stop offset=".5" stop-color="#c9a43c"/><stop offset="1" stop-color="#94761f"/></linearGradient>
    <filter id="tShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0d2a18" flood-opacity=".28"/></filter>`;
  const cam = el('g', {}, svg);
  const gGround = el('g', {}, cam);
  const gEdges = el('g', {}, cam);
  const gLeaves = el('g', {}, cam);
  const gNodes = el('g', {}, cam);

  // ground, trunk and roots (static, relative to the root at 0,0)
  let trunkParts = [], rootParts = [];
  function buildGround() {
    gGround.innerHTML = '';
    el('rect', { x: -6000, y: GROUND, width: 12000, height: 1400, fill: 'url(#tSoil)' }, gGround);
    el('path', { d: `M-6000 ${GROUND} Q -300 ${GROUND - 14} 0 ${GROUND - 6} T 6000 ${GROUND}`, fill: '#5a7a34', opacity: .35 }, gGround);
    rootParts = [];
    let s = 7;
    const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const root = (x, y, a, len, w, d) => {
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      const p = el('path', { d: `M${x} ${y} Q${x + Math.cos(a + .4) * len * .5} ${y + Math.sin(a + .2) * len * .5} ${x2} ${y2}`, stroke: '#2a1505', 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, opacity: .9 }, gGround);
      rootParts.push(p);
      if (d) for (let i = 0; i < 2; i++) root(x2, y2, a + (r() - .5) * 1.3, len * (.55 + r() * .2), w * .6, d - 1);
    };
    [2.8, 2.3, 1.9, 1.25, .85, .35].forEach((a, i) => root((i - 2.5) * 8, GROUND, a, 110 + r() * 60, 12 - Math.abs(i - 2.5) * 2, 3));
    const gold = el('path', { d: `M4 ${GROUND} C 20 ${GROUND + 70}, 0 ${GROUND + 120}, 0 ${GROUND + 170}`, stroke: '#e8cd7a', 'stroke-width': 3, fill: 'none', pathLength: 1, style: 'filter:drop-shadow(0 0 6px rgba(232,205,122,.8))' }, gGround);
    rootParts.push(gold);
    const t = el('text', { x: 0, y: GROUND + 214, class: 't-ground-txt' }, gGround); t.textContent = 'الجذور: غزة · فلسطين';
    const t2 = el('text', { x: 0, y: GROUND + 240, class: 't-ground-sub' }, gGround); t2.textContent = 'محلة الدرج · ومنها إلى يافا والعالم';
    // braided trunk from ground to the root medallion
    trunkParts = [];
    for (let k = 0; k < 3; k++) {
      let d = '';
      for (let i = 0; i <= 24; i++) {
        const tt = i / 24, y = GROUND - (GROUND - 70) * tt, w = 22 - 12 * tt;
        d += (i ? 'L' : 'M') + (Math.sin(tt * Math.PI * 2.2 + k * 2.094) * w).toFixed(1) + ' ' + y.toFixed(1);
      }
      trunkParts.push(el('path', { d, stroke: 'url(#tBark)', 'stroke-width': 20 - k * 2, fill: 'none', 'stroke-linecap': 'round', pathLength: 1 }, gGround));
    }
  }

  const nodeEls = new Map(), edgeEls = new Map();
  const LEAF_D = 'M0 0 C5 -4 15 -4 21 0 C15 4 5 4 0 0Z';
  const LEAF_C = ['#6e7b34', '#8a9a45', '#4c5a22', '#9aa755', '#5d6b2a'];
  function nodeEl(id) {
    if (nodeEls.has(id)) return nodeEls.get(id);
    const m = state.byId.get(id);
    const big = !!m.featured;
    const R = big ? 34 : 26;
    const g = el('g', { class: 't-node', 'data-id': id, tabindex: 0, role: 'button', 'aria-label': m.name }, gNodes);
    const medal = el('g', { class: 't-medal', filter: 'url(#tShadow)' }, g);
    el('circle', { r: R + 3, fill: 'url(#tGold)' }, medal);
    if (m.photo) {
      const cid = 'clip-' + id;
      const cp = el('clipPath', { id: cid }, defs);
      el('circle', { r: R - 1 }, cp);
      el('circle', { r: R - 1, fill: '#0d2a18' }, medal);
      el('image', { href: m.photo, x: -R, y: -R, width: R * 2, height: R * 2, 'clip-path': `url(#${cid})`, preserveAspectRatio: 'xMidYMid slice' }, medal);
    } else {
      el('circle', { r: R - 1, fill: m.gender === 'f' ? 'url(#tMedalF)' : 'url(#tMedal)' }, medal);
      const t = el('text', { class: 't-initial', y: 1, style: big ? 'font-size:28px' : '' }, medal);
      t.textContent = (m.name || '؟').trim().charAt(0);
    }
    const dash = m.status === 'narrative' ? '5 4' : m.status === 'proposed' ? '1.5 4' : '';
    el('circle', { r: R + 7, fill: 'none', stroke: m.status === 'proposed' ? '#94761f' : '#c9a43c', 'stroke-width': 1.6, 'stroke-dasharray': dash, class: 't-ring', opacity: .9 }, medal);
    if (big) {
      const star = el('path', { d: 'M0 -9 L2.6 -2.6 9 0 2.6 2.6 0 9 -2.6 2.6 -9 0 -2.6 -2.6Z', fill: 'url(#tGold)', transform: `translate(0 ${-R - 16})` }, medal);
      star.setAttribute('stroke', '#94761f');
    }
    // name plate
    const hasTitle = !!m.title;
    const plateH = hasTitle ? 48 : 31, plateY = R + 10;
    const nameW = Math.max(70, (m.name.length * 12.5) + 30, hasTitle ? m.title.length * 7.2 + 24 : 0);
    el('rect', { x: -nameW / 2, y: plateY, width: nameW, height: plateH, rx: 14, fill: big ? '#0d2a18' : '#fffaf0', stroke: '#c9a43c', 'stroke-width': 1.2, filter: 'url(#tShadow)' }, g);
    const tn = el('text', { class: 't-name', y: plateY + 21, style: big ? 'fill:#f3dd95;stroke:#0d2a18' : '' }, g); tn.textContent = m.name;
    if (hasTitle) { const tt = el('text', { class: 't-title', y: plateY + 40, style: big ? 'fill:#e8cd7a;stroke:#0d2a18' : '' }, g); tt.textContent = m.title; }
    // collapse toggle
    let tog = null;
    if ((state.kids.get(id) || []).length) {
      tog = el('g', { class: 't-toggle', transform: `translate(${R + 8} ${-R + 2})` }, g);
      el('circle', { r: 10 }, tog);
      el('text', { y: 0 }, tog);
    }
    g.addEventListener('click', e => {
      if (moved) return;
      if (tog && tog.contains(e.target)) { toggle(id); return; }
      select(id);
    });
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); } });
    const o = { g, R, tog, bottom: plateY + plateH };
    nodeEls.set(id, o);
    return o;
  }
  function edgeEl(id) {
    if (edgeEls.has(id)) return edgeEls.get(id);
    const main = el('path', { class: 't-branch', stroke: '#6b3d16', pathLength: 1 }, gEdges);
    const hi = el('path', { class: 't-branch', stroke: '#a87444', opacity: .55, pathLength: 1 }, gEdges);
    const leaves = [];
    const n = 4;
    for (let i = 0; i < n; i++) {
      const lg = el('g', {}, gLeaves);
      const side = i % 2 ? 1 : -1;
      const a0 = side * 52 - 6, a1 = side * 52 + 8;
      const l = el('path', { d: LEAF_D, fill: LEAF_C[(i + id.length) % LEAF_C.length], class: 't-leaf', style: `--r0:${a0}deg;--r1:${a1}deg;animation-delay:${-(i * 1.3 + id.length * .7) % 4.5}s` }, lg);
      let olive = null;
      if ((i + id.length) % 3 === 0) olive = el('ellipse', { rx: 3.6, ry: 4.8, cx: side * 9, cy: -4, fill: i % 2 ? '#3f4a17' : '#8f9b38' }, lg);
      leaves.push({ g: lg, t: .22 + i * .19, side, l, olive });
    }
    const o = { main, hi, leaves };
    edgeEls.set(id, o);
    return o;
  }
  function removeEls(id) {
    const n = nodeEls.get(id); if (n) { n.g.remove(); nodeEls.delete(id); const c = document.getElementById('clip-' + id); if (c) c.remove(); }
    const e = edgeEls.get(id); if (e) { e.main.remove(); e.hi.remove(); e.leaves.forEach(l => l.g.remove()); edgeEls.delete(id); }
  }
  function clearAll() { [...nodeEls.keys()].forEach(removeEls); [...edgeEls.keys()].forEach(removeEls); }

  /* ---------------- Rendering ---------------- */
  let cur = new Map();        // id -> {x,y,d,a}  current rendered
  let from = new Map(), to = new Map(), tAnim = 1, animStart = 0, ANIM = 750;
  let grow = reduced ? 1 : 0; // intro growth 0..1
  let maxD = 1;

  const bez = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const bezD = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
  };

  function render() {
    const e = tAnim >= 1 ? 1 : (1 - Math.pow(1 - tAnim, 3));
    const ids = new Set([...from.keys(), ...to.keys()]);
    cur = new Map();
    ids.forEach(id => {
      const a = from.get(id), b = to.get(id);
      const A = a || b, B = b || a;
      cur.set(id, { x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e, d: B.d, a: (a ? a.a : 0) + ((b ? 1 : 0) - (a ? a.a : 0)) * e });
    });
    const G = grow * (maxD + 1.4);
    // trunk + roots
    const tf = clamp(G * 1.6, 0, 1);
    trunkParts.forEach(p => (p.style.strokeDashoffset = 1 - tf));
    rootParts.forEach(p => (p.style.strokeDashoffset = 1 - clamp(G * 1.2, 0, 1)));
    cur.forEach((p, id) => {
      const m = state.byId.get(id);
      if (!m) return;
      const n = nodeEl(id);
      const ownFrac = id === rootId ? clamp(G * 1.6 - .2, 0, 1) : clamp(G - (p.d - 1) - .6, 0, 1);
      const sc = clamp((ownFrac - .55) / .45, 0, 1) * p.a;
      const s = sc < 1 ? (1 - Math.pow(1 - sc, 3)) * (1 + Math.sin(sc * Math.PI) * .12) : 1;
      n.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${Math.max(0.001, s).toFixed(3)})`);
      n.g.style.opacity = p.a < 1 ? p.a : '';
      n.g.style.pointerEvents = sc > .9 ? '' : 'none';
      if (n.tog) n.tog.lastChild.textContent = state.collapsed.has(id) ? '+' : '−';
      n.g.classList.toggle('is-sel', state.sel === id);
      // branch from parent
      if (id === rootId || !m.parent) return;
      const pp = cur.get(m.parent);
      if (!pp) return;
      const pn = nodeEl(m.parent);
      const x0 = pp.x, y0 = pp.y - pn.R - 4, x3 = p.x, y3 = p.y + n.bottom - 4;
      const k = (y0 - y3) * .55;
      const y1 = y0 - k, y2 = y3 + k * .9;
      const frac = clamp(G - (p.d - 1), 0, 1) * p.a;
      const w = 3 + Math.min(15, Math.sqrt(descCount(id) + 1) * 2.6);
      const ed = edgeEl(id);
      const d = `M${x0.toFixed(1)} ${y0.toFixed(1)} C${x0.toFixed(1)} ${y1.toFixed(1)} ${x3.toFixed(1)} ${y2.toFixed(1)} ${x3.toFixed(1)} ${y3.toFixed(1)}`;
      ed.main.setAttribute('d', d); ed.main.setAttribute('stroke-width', w.toFixed(1));
      ed.hi.setAttribute('d', d); ed.hi.setAttribute('stroke-width', (w * .32).toFixed(1));
      ed.hi.setAttribute('transform', `translate(${(-w * .18).toFixed(1)} 0)`);
      ed.main.style.strokeDasharray = ed.hi.style.strokeDasharray = '1 1';
      ed.main.style.strokeDashoffset = ed.hi.style.strokeDashoffset = (1 - frac).toFixed(3);
      ed.leaves.forEach(L => {
        const lx = bez(x0, x0, x3, x3, L.t), ly = bez(y0, y1, y2, y3, L.t);
        const dx = bezD(x0, x0, x3, x3, L.t), dy = bezD(y0, y1, y2, y3, L.t);
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        const show = clamp((frac - L.t) * 6, 0, 1);
        L.g.setAttribute('transform', `translate(${(lx + L.side * w * .3).toFixed(1)} ${ly.toFixed(1)}) rotate(${ang.toFixed(0)}) scale(${show.toFixed(2)})`);
      });
    });
  }

  let rafId = 0;
  function tick(now) {
    rafId = 0;
    let again = false;
    if (tAnim < 1) {
      tAnim = clamp((now - animStart) / ANIM, 0, 1);
      if (tAnim >= 1) {
        from.forEach((_, id) => { if (!to.has(id)) removeEls(id); });
        from = new Map(to);
      }
      again = tAnim < 1;
    }
    if (growing) {
      grow = clamp((now - growStart) / 3600, 0, 1);
      again = again || grow < 1;
      if (grow >= 1) growing = false;
    }
    if (camAnim) again = stepCam(now) || again;
    render();
    applyCam();
    if (again) rafId = requestAnimationFrame(tick);
  }
  const kick = () => { if (!rafId) rafId = requestAnimationFrame(tick); };

  function relayout(animated) {
    const pos = layout();
    maxD = 0; pos.forEach(p => (maxD = Math.max(maxD, p.d)));
    const next = new Map();
    pos.forEach((p, id) => next.set(id, { ...p, a: 1 }));
    if (!animated || reduced) {
      from.forEach((_, id) => { if (!next.has(id)) removeEls(id); });
      from = new Map(next); to = next; tAnim = 1;
    } else {
      const start = new Map(cur.size ? cur : from);
      // new nodes grow out of their nearest visible ancestor; hidden ones fold back into it
      next.forEach((p, id) => {
        if (!start.has(id)) {
          let a = state.byId.get(id).parent;
          while (a && !start.has(a)) a = state.byId.get(a)?.parent;
          const s = a ? start.get(a) : p;
          start.set(id, { x: s.x, y: s.y, d: p.d, a: 0 });
        }
      });
      start.forEach((p, id) => {
        if (!next.has(id)) {
          let a = state.byId.get(id)?.parent;
          while (a && !next.has(a)) a = state.byId.get(a)?.parent;
          const s = a ? next.get(a) : p;
          next.set(id, { x: s.x, y: s.y, d: p.d, a: 0 });
        }
      });
      from = start; to = next; tAnim = 0; animStart = performance.now();
      // after the animation, faded-out nodes are dropped
      const keep = new Set(pos.keys());
      setTimeout(() => { to.forEach((_, id) => { if (!keep.has(id)) { to.delete(id); from.delete(id); removeEls(id); } }); }, ANIM + 40);
    }
    kick();
  }

  /* ---------------- Camera ---------------- */
  const camS = { x: 0, y: -300, k: .8 };
  let camAnim = null;
  function size() { return { W: stage.clientWidth, H: stage.clientHeight }; }
  function applyCam() {
    const { W, H } = size();
    cam.setAttribute('transform', `translate(${(W / 2 - camS.x * camS.k).toFixed(1)} ${(H / 2 - camS.y * camS.k).toFixed(1)}) scale(${camS.k.toFixed(4)})`);
  }
  function animateCam(x, y, k, dur = 900) {
    if (reduced) { Object.assign(camS, { x, y, k }); applyCam(); return; }
    camAnim = { from: { ...camS }, to: { x, y, k }, t0: performance.now(), dur };
    kick();
  }
  function stepCam(now) {
    const t = clamp((now - camAnim.t0) / camAnim.dur, 0, 1), e = 1 - Math.pow(1 - t, 4);
    const f = camAnim.from, g = camAnim.to;
    camS.x = f.x + (g.x - f.x) * e; camS.y = f.y + (g.y - f.y) * e;
    camS.k = Math.exp(Math.log(f.k) + (Math.log(g.k) - Math.log(f.k)) * e);
    if (t >= 1) { camAnim = null; return false; }
    return true;
  }
  function bounds() {
    let x0 = -150, x1 = 150, y0 = 0, y1 = GROUND + 260;
    const pos = to.size ? to : layout();
    pos.forEach(p => { if (p.a === 0) return; x0 = Math.min(x0, p.x - 90); x1 = Math.max(x1, p.x + 90); y0 = Math.min(y0, p.y - 70); });
    return { x0, x1, y0, y1 };
  }
  function fit(dur) {
    const b = bounds(), { W, H } = size();
    const k = clamp(Math.min(W / (b.x1 - b.x0), H / (b.y1 - b.y0)) * .94, .22, 1.3);
    animateCam((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, k, dur);
  }
  function initialView() {
    const b = bounds(), { W, H } = size(), mob = W < 700;
    const k = clamp(Math.min(W / (b.x1 - b.x0), H / (b.y1 - b.y0)) * .96, mob ? .5 : .5, 1.2);
    camS.k = k; camS.x = mob ? 0 : (b.x0 + b.x1) / 2;
    camS.y = (b.y1 - b.y0) * k <= H ? (b.y0 + b.y1) / 2 : b.y1 - H / 2 / k;
  }
  function focus(id) {
    const p = (to.get(id) || cur.get(id));
    if (!p) return;
    animateCam(p.x, p.y + 20, Math.max(camS.k, window.innerWidth < 700 ? .85 : 1.05), 1000);
  }
  // pointer pan / pinch / wheel
  const pts = new Map();
  let moved = false, downAt = null, pinch0 = null;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('.ft__legend')) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false; downAt = { x: e.clientX, y: e.clientY, cx: camS.x, cy: camS.y };
    camAnim = null;
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), k: camS.k, cx: camS.x, cy: camS.y, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    }
  });
  stage.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && pinch0) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const k = clamp(pinch0.k * d / pinch0.d, .2, 2.4);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      camS.k = k;
      camS.x = pinch0.cx - (mx - pinch0.mx) / k;
      camS.y = pinch0.cy - (my - pinch0.my) / k;
      moved = true; applyCam(); return;
    }
    if (!downAt) return;
    const dx = e.clientX - downAt.x, dy = e.clientY - downAt.y;
    if (!moved && Math.abs(dx) + Math.abs(dy) > 5) { moved = true; stage.classList.add('is-drag'); hideHint(); try { stage.setPointerCapture(e.pointerId); } catch (x) {} }
    camS.x = downAt.cx - dx / camS.k; camS.y = downAt.cy - dy / camS.k;
    applyCam();
  });
  const up = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch0 = null;
    if (!pts.size) { downAt = null; stage.classList.remove('is-drag'); setTimeout(() => (moved = false), 0); }
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    hideHint();
    const r = stage.getBoundingClientRect(), { W, H } = size();
    const mx = e.clientX - r.left - W / 2, my = e.clientY - r.top - H / 2;
    const k = clamp(camS.k * Math.exp(-e.deltaY * .0015), .2, 2.4);
    const wx = camS.x + mx / camS.k, wy = camS.y + my / camS.k;
    camS.k = k; camS.x = wx - mx / k; camS.y = wy - my / k;
    camAnim = null; applyCam();
  }, { passive: false });
  // stop the page smooth-scroller from hijacking the wheel over the tree
  stage.setAttribute('data-lenis-prevent', '');
  let hintHidden = false;
  function hideHint() { if (hintHidden) return; hintHidden = true; $('#ftHint').style.opacity = 0; }

  function toggle(id) {
    if (state.collapsed.has(id)) state.collapsed.delete(id); else state.collapsed.add(id);
    relayout(true);
  }

  /* ---------------- Panel ---------------- */
  const tp = $('#tp'), tpBody = $('#tpBody');
  function select(id) {
    state.sel = id;
    const m = state.byId.get(id);
    if (!m) return;
    const kids = (state.kids.get(id) || []).map(k => state.byId.get(k));
    const dead = m.deceased ? (m.gender === 'f' ? 'رحمها الله' : 'رحمه الله') : '';
    const facts = [];
    if (m.place) facts.push(['المكان', m.place]);
    if (m.branch) facts.push(['الفرع', m.branch]);
    if (m.born) facts.push(['سنة الميلاد', m.born]);
    if (m.died) facts.push(['سنة الوفاة', m.died]);
    facts.push(['الجيل', String((to.get(id) || cur.get(id) || { d: 0 }).d + 1)]);
    if (kids.length) facts.push(['الأبناء', String(kids.length)]);
    tpBody.innerHTML = `
      <div class="tp__hero">
        ${m.photo ? `<img class="tp__photo" src="${esc(m.photo)}" alt="${esc(m.name)}">` : `<div class="tp__photo">${esc(m.name.charAt(0))}</div>`}
        <div class="tp__name">${esc(m.title && /مختار|المرحوم|الأستاذ|اللواء|المهندس|الدكتور|الحاج/.test(m.title) && !/فرع|الجد/.test(m.title) && m.title.length < 12 ? m.title + ' ' : '')}${esc(m.name)}</div>
        ${m.title ? `<div class="tp__title">${esc(m.title)}</div>` : ''}
        <div class="tp__badges"><span class="tp__b">${STATUS[m.status] || STATUS.confirmed}</span>${dead ? `<span class="tp__b">${dead}</span>` : ''}</div>
      </div>
      <div class="tp__sec"><h4>النسب الكامل</h4><p class="tp__nasab">${nasab(id, true)}</p></div>
      <div class="tp__sec"><div class="tp__facts">${facts.map(f => `<div><small>${f[0]}</small><b>${esc(f[1])}</b></div>`).join('')}</div></div>
      ${m.note ? `<div class="tp__sec"><h4>ملاحظة</h4><p class="tp__note">${esc(m.note)}</p></div>` : ''}
      ${kids.length ? `<div class="tp__sec"><h4>الأبناء</h4><div class="tp__kids">${kids.map(k => `<button data-go="${k.id}">${esc(k.name)}</button>`).join('')}</div></div>` : ''}
      <div class="tp__actions">
        ${state.admin ? `
          <button class="btn btn--gold" data-a="add">إضافة ابن أو ابنة</button>
          <button class="btn btn--line" data-a="edit">تعديل</button>
          <button class="btn btn--line" data-a="photo">${m.photo ? 'تغيير الصورة' : 'إضافة صورة'}</button>
          ${kids.length ? '' : '<button class="btn btn--danger" data-a="del">حذف</button>'}`
        : `<button class="btn btn--gold" data-a="suggest">اقترح إضافة ابن أو ابنة</button>`}
      </div>`;
    tp.classList.add('is-open'); tp.setAttribute('aria-hidden', 'false');
    kick();
    focus(id);
  }
  function closePanel() { tp.classList.remove('is-open'); tp.setAttribute('aria-hidden', 'true'); state.sel = null; kick(); }
  $('#tpClose').addEventListener('click', closePanel);
  tpBody.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { reveal(go.dataset.go); return; }
    const a = e.target.closest('[data-a]');
    if (!a) return;
    const id = state.sel;
    ({ add: () => memberForm({ parent: id }), edit: () => memberForm({ id }), photo: () => photoForm(id), del: () => delMember(id), suggest: () => suggestForm(id) })[a.dataset.a]();
  });
  function reveal(id) {
    // open collapsed ancestors so the node becomes visible
    let p = state.byId.get(id)?.parent, changed = false;
    while (p) { if (state.collapsed.delete(p)) changed = true; p = state.byId.get(p)?.parent; }
    if (changed) relayout(true);
    setTimeout(() => select(id), changed ? ANIM : 0);
  }

  /* ---------------- Modals & forms ---------------- */
  const modal = $('#modal'), modalBody = $('#modalBody');
  function openModal(html) {
    modalBody.innerHTML = html;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    window.QLenis && window.QLenis.stop();
    setTimeout(() => modalBody.querySelector('input:not([type=hidden]):not(.hp),select,textarea')?.focus(), 200);
  }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); window.QLenis && window.QLenis.start(); }
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { if (modal.classList.contains('is-open')) closeModal(); else closePanel(); } });
  const toastEl = $('#toast');
  let toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200); }
  const placeList = `<datalist id="placesDL">${PLACES.map(p => `<option value="${p}">`).join('')}</datalist>`;
  function parentOptions(sel) {
    return [...state.members].map(m => ({ id: m.id, t: nasab(m.id) }))
      .sort((a, b) => a.t.length - b.t.length)
      .map(o => `<option value="${o.id}" ${o.id === sel ? 'selected' : ''}>${esc(o.t)}</option>`).join('');
  }
  function bindForm(onSubmit) {
    const f = modalBody.querySelector('form');
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const err = f.querySelector('.form__err'), btn = f.querySelector('[type=submit]');
      err.textContent = ''; btn.disabled = true;
      try { await onSubmit(Object.fromEntries(new FormData(f)), f); }
      catch (x) { err.textContent = x.message; }
      btn.disabled = false;
    });
  }
  function needOnline() {
    if (state.online) return true;
    toast('خدمة الإضافة تعمل على الموقع المنشور فقط');
    return false;
  }
  function memberForm({ id, parent }) {
    if (!needOnline()) return;
    const m = id ? state.byId.get(id) : { gender: 'm', status: 'confirmed', branch: state.byId.get(parent)?.branch || '' };
    const pName = parent ? nasab(parent) : '';
    openModal(`
      <h3>${id ? 'تعديل بيانات ' + esc(m.name) : 'إضافة فرد جديد'}</h3>
      <p class="sub">${id ? esc(nasab(id)) : 'إلى: ' + esc(pName)}</p>
      <form class="form" autocomplete="off">
        <label class="full">الاسم الأول *<input name="name" required maxlength="60" value="${esc(m.name || '')}" placeholder="مثال: أحمد"></label>
        <label class="full">اللقب أو الصفة<input name="title" maxlength="60" value="${esc(m.title || '')}" placeholder="مثال: المهندس، اللواء، مختار العائلة"></label>
        <label>الجنس<select name="gender"><option value="m" ${m.gender !== 'f' ? 'selected' : ''}>ذكر</option><option value="f" ${m.gender === 'f' ? 'selected' : ''}>أنثى</option></select></label>
        <label>مكان الإقامة<input name="place" list="placesDL" maxlength="40" value="${esc(m.place || '')}"></label>
        <label>سنة الميلاد<input name="born" inputmode="numeric" pattern="[0-9]{1,4}" maxlength="4" value="${esc(m.born || '')}" placeholder="1950"></label>
        <label>سنة الوفاة<input name="died" inputmode="numeric" pattern="[0-9]{1,4}" maxlength="4" value="${esc(m.died || '')}"></label>
        <label>الفرع<input name="branch" maxlength="30" value="${esc(m.branch || '')}" placeholder="غزة / يافا"></label>
        <label>درجة التوثيق<select name="status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${m.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="chk full"><input type="checkbox" name="deceased" value="1" ${m.deceased ? 'checked' : ''}> متوفّى (يظهر «رحمه الله»)</label>
        <label class="full">ملاحظة<textarea name="note" maxlength="600">${esc(m.note || '')}</textarea></label>
        ${placeList}
        <p class="form__err"></p>
        <div class="form__actions"><button class="btn btn--gold" type="submit">حفظ</button><button class="btn btn--line" type="button" data-close>إلغاء</button></div>
      </form>`);
    bindForm(async data => {
      data.deceased = !!data.deceased;
      if (id) data.id = id; else data.parent = parent;
      const j = await api('save', data);
      closeModal();
      await refresh();
      toast(id ? 'تم حفظ التعديلات' : 'تمت إضافة ' + j.member.name + ' إلى الشجرة');
      reveal(j.member.id);
    });
  }
  function photoForm(id) {
    if (!needOnline()) return;
    openModal(`
      <h3>صورة ${esc(state.byId.get(id).name)}</h3>
      <p class="sub">JPG أو PNG أو WEBP، بحد أقصى 6 ميجابايت.</p>
      <form class="form"><label class="full">الصورة<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required></label>
      <p class="form__err"></p><div class="form__actions"><button class="btn btn--gold" type="submit">رفع الصورة</button></div></form>`);
    bindForm(async (_, f) => {
      const fd = new FormData(f); fd.append('id', id);
      await api('photo', fd, true);
      closeModal(); await refresh(); toast('تم تحديث الصورة'); select(id);
    });
  }
  async function delMember(id) {
    if (!needOnline()) return;
    openModal(`<h3>حذف ${esc(state.byId.get(id).name)}؟</h3><p class="sub">${esc(nasab(id))}</p>
      <form class="form"><p class="form__err"></p><div class="form__actions"><button class="btn btn--danger" type="submit">نعم، احذف</button><button class="btn btn--line" type="button" data-close>إلغاء</button></div></form>`);
    bindForm(async () => { await api('delete', { id }); closeModal(); closePanel(); await refresh(); toast('تم الحذف'); });
  }
  function suggestForm(parent) {
    if (!needOnline()) return;
    openModal(`
      <h3>اقترح إضافة فرد إلى الشجرة</h3>
      <p class="sub">يصل اقتراحك إلى القائمين على الموقع، ويُضاف إلى الشجرة بعد المراجعة.</p>
      <form class="form" autocomplete="off">
        <label class="full">ابن أو ابنة لـ *<select name="parent" required>${parentOptions(parent)}</select></label>
        <label>الاسم الأول *<input name="name" required maxlength="60"></label>
        <label>الجنس<select name="gender"><option value="m">ذكر</option><option value="f">أنثى</option></select></label>
        <label>سنة الميلاد<input name="born" inputmode="numeric" pattern="[0-9]{1,4}" maxlength="4"></label>
        <label>مكان الإقامة<input name="place" list="placesDL" maxlength="40"></label>
        <label class="full">معلومة أو ملاحظة<textarea name="note" maxlength="600" placeholder="مثال: اللقب، المهنة، أو مصدر المعلومة"></textarea></label>
        <label>اسمك<input name="by" maxlength="60"></label>
        <label>رقم للتواصل (اختياري)<input name="contact" maxlength="60" inputmode="tel"></label>
        <input class="hp" name="website" tabindex="-1" autocomplete="off">
        ${placeList}
        <p class="form__err"></p>
        <div class="form__actions"><button class="btn btn--gold" type="submit">إرسال الاقتراح</button></div>
      </form>`);
    bindForm(async data => { await api('suggest', data); closeModal(); toast('شكرًا لك، وصل اقتراحك وسيُراجَع قريبًا'); });
  }
  function authForm() {
    const setup = state.setup;
    openModal(`
      <h3>${setup ? 'إنشاء كلمة مرور الإدارة' : 'دخول الإدارة'}</h3>
      <p class="sub">${setup ? 'هذه أول مرة تُفتح فيها الإدارة. اختر كلمة مرور قوية (8 أحرف على الأقل) واحتفظ بها.' : 'للقائمين على شجرة العائلة فقط.'}</p>
      <form class="form"><label class="full">كلمة المرور<input type="password" name="password" required minlength="${setup ? 8 : 1}" autocomplete="${setup ? 'new-password' : 'current-password'}"></label>
      <p class="form__err"></p><div class="form__actions"><button class="btn btn--gold" type="submit">${setup ? 'إنشاء والدخول' : 'دخول'}</button></div></form>`);
    bindForm(async data => {
      await api(setup ? 'setup' : 'login', data);
      closeModal(); await refresh(); toast('مرحبًا بك في وضع الإدارة');
    });
  }
  async function adminMenu() {
    let items = [];
    try { items = (await api('pending')).items; } catch (e) { toast(e.message); return; }
    openModal(`
      <h3>إدارة الشجرة</h3>
      <p class="sub">اضغط على أي فرد في الشجرة لإضافة أبنائه أو تعديل بياناته أو صورته.</p>
      <h4 style="font-family:var(--f-display);margin:8px 0">اقتراحات العائلة (${items.length})</h4>
      <div class="pend">${items.length ? items.map(it => `
        <div class="pend__it" data-pid="${esc(it.pid)}">
          <b>${esc(it.member.name)}</b> <span class="muted">${it.member.gender === 'f' ? 'بنت' : 'بن'} ${esc(state.byId.get(it.parent) ? nasab(it.parent) : '—')}</span>
          <p>${[it.member.born && 'مواليد ' + it.member.born, it.member.place, it.member.note].filter(Boolean).map(esc).join(' · ')}</p>
          <p class="muted">من: ${esc(it.by || 'غير مذكور')} ${it.contact ? ' · ' + esc(it.contact) : ''}</p>
          <div class="row"><button class="btn btn--gold" data-rv="1">اعتماد</button><button class="btn btn--line" data-rv="0">رفض</button></div>
        </div>`).join('') : '<p class="muted">لا توجد اقتراحات جديدة.</p>'}</div>
      <div class="form__actions" style="margin-top:22px">
        <a class="btn btn--line" href="${API}?action=export">تنزيل نسخة احتياطية</a>
        <button class="btn btn--line" data-adm="pw">تغيير كلمة المرور</button>
        <button class="btn btn--danger" data-adm="out">تسجيل الخروج</button>
      </div>`);
    modalBody.onclick = async e => {
      const rv = e.target.closest('[data-rv]');
      if (rv) {
        const box = rv.closest('[data-pid]');
        try { await api('review', { pid: box.dataset.pid, approve: rv.dataset.rv === '1' }); box.remove(); await refresh(); toast(rv.dataset.rv === '1' ? 'تم الاعتماد والإضافة إلى الشجرة' : 'تم رفض الاقتراح'); }
        catch (x) { toast(x.message); }
        return;
      }
      const adm = e.target.closest('[data-adm]');
      if (!adm) return;
      if (adm.dataset.adm === 'out') { await api('logout', {}); closeModal(); await refresh(); toast('تم تسجيل الخروج'); }
      if (adm.dataset.adm === 'pw') {
        modalBody.onclick = null;
        openModal(`<h3>تغيير كلمة المرور</h3><form class="form"><label class="full">كلمة المرور الجديدة<input type="password" name="password" minlength="8" required autocomplete="new-password"></label><p class="form__err"></p><div class="form__actions"><button class="btn btn--gold" type="submit">حفظ</button></div></form>`);
        bindForm(async d => { await api('password', d); closeModal(); toast('تم تغيير كلمة المرور'); });
      }
    };
  }
  function updateAdminBtn() {
    const b = $('#ftAdmin');
    b.classList.toggle('is-admin', state.admin);
    b.textContent = state.admin ? `وضع الإدارة${state.pending ? ' · ' + state.pending + ' اقتراح' : ''}` : 'إدارة الشجرة';
  }
  $('#ftAdmin').addEventListener('click', () => {
    if (!state.online) { toast('الإدارة تعمل على الموقع المنشور فقط'); return; }
    state.admin ? adminMenu() : authForm();
  });

  async function refresh() {
    const keepSel = state.sel;
    await load();
    clearAll();
    from = new Map(); cur = new Map();
    relayout(false);
    if (keepSel && state.byId.has(keepSel) && tp.classList.contains('is-open')) select(keepSel);
  }

  /* ---------------- Toolbar & search ---------------- */
  document.querySelector('.ft__tools').addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'zoomin') animateCam(camS.x, camS.y, clamp(camS.k * 1.35, .2, 2.4), 400);
    if (act === 'zoomout') animateCam(camS.x, camS.y, clamp(camS.k / 1.35, .2, 2.4), 400);
    if (act === 'fit') fit(800);
    if (act === 'expand') { state.collapsed.clear(); relayout(true); setTimeout(() => fit(800), ANIM); }
    if (act === 'suggest') suggestForm(state.sel || rootId);
  });
  const sIn = $('#ftSearch'), sRes = $('#ftResults');
  sIn.addEventListener('input', () => {
    const q = norm(sIn.value);
    if (!q) { sRes.classList.remove('is-open'); return; }
    const hits = state.members.map(m => ({ m, t: nasab(m.id) })).filter(o => norm(o.t).includes(q) || norm(o.m.title).includes(q)).slice(0, 12);
    sRes.innerHTML = hits.length ? hits.map(o => `<li data-go="${o.m.id}">${esc((o.m.title ? o.m.title + ' ' : '') + o.m.name)}<small>${esc(o.t)}</small></li>`).join('') : '<li>لا توجد نتائج</li>';
    sRes.classList.add('is-open');
  });
  sRes.addEventListener('click', e => { const li = e.target.closest('[data-go]'); if (!li) return; sRes.classList.remove('is-open'); sIn.value = ''; reveal(li.dataset.go); });
  sIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sRes.querySelector('[data-go]')?.click(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.ft__search')) sRes.classList.remove('is-open'); });

  /* ---------------- Falling leaves ---------------- */
  const fallBox = $('#ftFalling');
  let stageVisible = false;
  function spawnLeaf() {
    if (!stageVisible || reduced || document.hidden) return;
    const f = document.createElement('i');
    f.className = 'fleaf';
    f.style.left = Math.random() * 100 + '%';
    f.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    f.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    f.style.animationDuration = (7 + Math.random() * 6) + 's';
    f.style.background = LEAF_C[(Math.random() * LEAF_C.length) | 0];
    fallBox.appendChild(f);
    setTimeout(() => f.remove(), 14000);
  }
  setInterval(spawnLeaf, 2200);

  /* ---------------- Boot ---------------- */
  let growing = false, growStart = 0, started = false;
  window.QTree = { suggest: () => suggestForm(state.sel || rootId) };
  (async () => {
    buildGround();
    await load();
    relayout(false);
    initialView();
    applyCam(); render();
    new IntersectionObserver(es => {
      stageVisible = es[0].isIntersecting;
      if (stageVisible && !started) {
        started = true;
        if (!reduced) { growing = true; growStart = performance.now(); }
        kick();
      }
    }, { threshold: .25 }).observe(stage);
    addEventListener('resize', () => { applyCam(); });
  })();
})();
