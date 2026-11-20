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
  const PLACES = ['غزة', 'يافا', 'القاهرة', 'كفر الشيخ', 'عمّان', 'الخبر', 'تركيا', 'بلغاريا', 'روسيا', 'بلجيكا', 'إيرلندا', 'السويد', 'إسبانيا', 'جرين باي', 'تورنتو'];

  const state = { members: [], byId: new Map(), kids: new Map(), admin: false, user: null, setup: false, csrf: '', pending: 0, collapsed: new Set(), sel: null, view: 'vt', fv: null, path: [] };
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
      state.admin = j.admin; state.user = j.user || null; state.setup = j.setup; state.pending = j.pending || 0;
      setMembers(j.members);
      state.online = true;
    } catch (e) {
      const r = await fetch('data/seed.json');
      setMembers((await r.json()).members);
      state.online = false; state.admin = false; state.user = null;
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

  // the admin edits everything; a branch account edits its branch head and all of his descendants
  function canEdit(id) {
    if (state.admin) return true;
    if (!state.user || !state.user.root) return false;
    for (let m = state.byId.get(id), guard = 0; m && guard < 400; m = state.byId.get(m.parent), guard++)
      if (m.id === state.user.root) return true;
    return false;
  }
  const editor = () => state.admin || !!state.user;

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
    const t2 = el('text', { x: 0, y: GROUND + 240, class: 't-ground-sub' }, gGround); t2.textContent = 'محلة الدرج · ثم يافا · ثم العودة إلى غزة';
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
    const tn = el('text', { class: 't-name', y: plateY + 21, style: big ? 'fill:#f3dd95' : '' }, g); tn.textContent = m.name;
    if (hasTitle) { const tt = el('text', { class: 't-title', y: plateY + 40, style: big ? 'fill:#e8cd7a' : '' }, g); tt.textContent = m.title; }
    // collapse toggle
    let tog = null;
    if ((state.kids.get(id) || []).length) {
      tog = el('g', { class: 't-toggle', transform: `translate(${R + 10} ${-R + 2})` }, g);
      el('circle', { r: 13 }, tog);
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
    if (mob && to.get('m14')) { const p = to.get('m14'); camS.k = .62; camS.x = p.x; camS.y = p.y - 40; return; }
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
    facts.push(['الجيل', String(genOf(id))]);
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
        ${canEdit(id) ? `
          <button class="btn btn--gold" data-a="add">إضافة ابن أو ابنة</button>
          <button class="btn btn--gold" data-a="bulk">إضافة عدة أبناء دفعة واحدة</button>
          <button class="btn btn--line" data-a="edit">تعديل البيانات</button>
          <button class="btn btn--line" data-a="photo">${m.photo ? 'تغيير الصورة' : 'إضافة صورة'}</button>
          ${m.photo ? '<button class="btn btn--line" data-a="unphoto">إزالة الصورة</button>' : ''}
          ${kids.length || (!state.admin && state.user && state.user.root === id) ? '' : '<button class="btn btn--danger" data-a="del">حذف</button>'}`
        : `<button class="btn btn--gold" data-a="suggest">اقترح إضافة ابن أو ابنة</button>
           ${state.user ? '<p class="tp__lock">هذا الفرد خارج الفرع المسموح لك بتعديله.</p>' : ''}`}
      </div>`;
    tp.classList.add('is-open'); tp.setAttribute('aria-hidden', 'false');
    kick();
    if (state.view === 'tree') focus(id);
  }
  function closePanel() { tp.classList.remove('is-open'); tp.setAttribute('aria-hidden', 'true'); state.sel = null; kick(); }
  $('#tpClose').addEventListener('click', closePanel);
  tpBody.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { reveal(go.dataset.go); return; }
    const a = e.target.closest('[data-a]');
    if (!a) return;
    const id = state.sel;
    ({ add: () => memberForm({ parent: id }), bulk: () => bulkForm(id), edit: () => memberForm({ id }), photo: () => photoForm(id), unphoto: () => unphoto(id), del: () => delMember(id), suggest: () => suggestForm(id) })[a.dataset.a]();
  });
  function reveal(id) {
    if (state.view === 'family') { if (tp.classList.contains('is-open')) closePanel(); fvGo(id); return; }
    if (state.view === 'vt') { vtReveal(id); select(id); return; }
    // open collapsed ancestors so the node becomes visible
    let p = state.byId.get(id)?.parent, changed = false;
    while (p) { if (state.collapsed.delete(p)) changed = true; p = state.byId.get(p)?.parent; }
    if (changed) relayout(true);
    setTimeout(() => select(id), changed ? ANIM : 0);
  }

  /* ---------------- Family cards view (clear on phones) ---------------- */
  const ft = $('#ft'), fv = $('#fv');
  const fvCrumbs = $('#fvCrumbs'), fvFocus = $('#fvFocus'), fvKids = $('#fvKids'), fvSibs = $('#fvSibs');
  const dispName = m => {
    const t = m.title && /المرحوم|الأستاذ|اللواء|المهندس|الدكتور|الحاج|الحاجة/.test(m.title) && m.title.length < 12 ? m.title + ' ' : '';
    return t + m.name;
  };
  const avatar = (m, cls) => m.photo
    ? `<span class="${cls}"><img src="${esc(m.photo)}" alt="" loading="lazy"></span>`
    : `<span class="${cls} ${cls}--i${m.gender === 'f' ? ' is-f' : ''}">${esc((m.name || '؟').trim().charAt(0))}</span>`;
  function fvRender(anim) {
    if (!fv || !state.members.length) return;
    let id = state.fv && state.byId.has(state.fv) ? state.fv : rootId;
    state.fv = id;
    const m = state.byId.get(id);
    // ancestors
    const chain = [];
    for (let a = m, g = 0; a && g < 60; a = state.byId.get(a.parent), g++) chain.unshift(a);
    fvCrumbs.innerHTML = chain.map((a, i) => i === chain.length - 1
      ? `<b>${esc(a.name)}</b>` : `<button data-fv="${a.id}">${esc(a.name)}</button><i aria-hidden="true">‹</i>`).join('');
    requestAnimationFrame(() => { fvCrumbs.scrollLeft = -fvCrumbs.scrollWidth; });
    const kids = (state.kids.get(id) || []).map(k => state.byId.get(k));
    const parent = state.byId.get(m.parent);
    const sibs = parent ? (state.kids.get(parent.id) || []).filter(k => k !== id).map(k => state.byId.get(k)) : [];
    const dead = m.deceased ? (m.gender === 'f' ? 'رحمها الله' : 'رحمه الله') : '';
    const gen = chain.length;
    const ed = canEdit(id);
    fvFocus.innerHTML = `
      <div class="fvc">
        ${avatar(m, 'fvc__ph')}
        <div class="fvc__txt">
          ${m.title && !/^(الحاج|المرحوم)$/.test(m.title) ? `<span class="fvc__title">${esc(m.title)}</span>` : ''}
          <h3 class="fvc__name">${esc(dispName(m))}</h3>
          <p class="fvc__nasab">${esc(nasab(id))}</p>
          <div class="fvc__badges"><span>الجيل ${gen}</span>${dead ? `<span>${dead}</span>` : ''}${m.place ? `<span>${esc(m.place)}</span>` : ''}${m.status === 'proposed' ? '<span class="is-warn">موضع مقترح</span>' : m.status === 'narrative' ? '<span>رواية عائلية</span>' : ''}</div>
        </div>
      </div>
      <div class="fvc__acts">
        ${parent ? `<button class="btn btn--line" data-fv="${parent.id}">↑ الأب: ${esc(parent.name)}</button>` : ''}
        <button class="btn btn--line" data-fva="info">التفاصيل والنسب</button>
        ${ed ? `<button class="btn btn--gold" data-fva="add">+ إضافة ابن أو ابنة</button><button class="btn btn--gold" data-fva="bulk">+ عدة أبناء</button>`
             : `<button class="btn btn--gold" data-fva="suggest">اقترح إضافة</button>`}
      </div>`;
    fvKids.innerHTML = kids.length ? kids.map(k => {
      const n = (state.kids.get(k.id) || []).length, all = descCount(k.id);
      return `<button class="fvk" data-fv="${k.id}">
        ${avatar(k, 'fvk__ph')}
        <span class="fvk__t">${k.title && k.title.length < 12 ? `<small>${esc(k.title)}</small>` : ''}<b>${esc(k.name)}</b>
        <em>${n ? `${n} ${n === 1 ? 'ابن' : n === 2 ? 'ابنان' : n <= 10 ? 'أبناء' : 'ابنًا'}${all > n ? ` · ${all} من الذرية` : ''}` : 'لم يُضف أبناء بعد'}</em></span>
        <i class="fvk__go" aria-hidden="true">‹</i>
      </button>`;
    }).join('') : `<p class="fv__empty">لم نُضف أبناء ${esc(m.name)} بعد${ed ? '. أضفهم من الزر أعلاه.' : '. إن كنت تعرفهم فاقترح إضافتهم.'}</p>`;
    $('#fvKidsTitle').textContent = kids.length ? `أبناء ${m.name} (${kids.length})` : `أبناء ${m.name}`;
    fvSibs.parentElement.hidden = !sibs.length;
    fvSibs.innerHTML = sibs.map(k => `<button data-fv="${k.id}">${avatar(k, 'fvs__ph')}<span>${esc(k.name)}</span></button>`).join('');
    if (anim && window.gsap && !reduced) {
      gsap.fromTo(fvFocus.firstElementChild, { opacity: 0, y: anim > 0 ? 26 : -26 }, { opacity: 1, y: 0, duration: .55, ease: 'power3.out' });
      gsap.fromTo(fvKids.children, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power3.out', delay: .08 });
    }
  }
  function fvGo(id) {
    const old = state.fv;
    state.fv = id;
    const down = old && state.byId.get(id)?.parent === old ? 1 : -1;
    fvRender(down);
    const top = fv.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * .6) (window.QLenis ? window.QLenis.scrollTo(fv, { offset: -90 }) : fv.scrollIntoView({ behavior: 'smooth' }));
  }
  fv && fv.addEventListener('click', e => {
    const b = e.target.closest('[data-fv]');
    if (b) { fvGo(b.dataset.fv); return; }
    const a = e.target.closest('[data-fva]');
    if (!a) return;
    const id = state.fv;
    ({ info: () => select(id), add: () => memberForm({ parent: id }), bulk: () => bulkForm(id), suggest: () => suggestForm(id) })[a.dataset.fva]();
  });
  function setView(v) {
    state.view = v;
    ft.classList.toggle('ft--family', v === 'family');
    document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('is-on', b.dataset.view === v));
    ft.classList.toggle('ft--vt', v === 'vt');
    ft.classList.toggle('ft--tree', v === 'tree');
    if (v === 'family') fvRender(1);
    else if (v === 'vt') vtRender();
    else { ensureSvg(); requestAnimationFrame(() => { initialView(); applyCam(); kick(); if (!started) { started = true; if (!reduced) { growing = true; growStart = performance.now(); } kick(); } }); }
  }
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

  /* ---------------- Vertical tree (top to bottom, tap a name to open his sons) ---------------- */
  let svgReady = false;
  function ensureSvg() {
    if (svgReady) return;
    svgReady = true;
    buildGround(); defaultCollapse(); relayout(false); initialView(); applyCam(); render();
  }
  function genOf(id) { let g = 0; for (let a = state.byId.get(id); a && g < 80; a = state.byId.get(a.parent)) g++; return g; }
  const vt = $('#vt'), vtList = $('#vtList');
  const kidsWord = n => n === 1 ? 'ابن واحد' : n === 2 ? 'ابنان' : n <= 10 ? `${n} أبناء` : `${n} ابنًا`;
  // the open line: root, then one opened son per generation; every generation is a full-width band
  function vtDefaultOpen() {
    state.path = [];
    if (!rootId) return;
    const f = state.byId.has('m30') ? 'm30' : rootId;
    for (let a = state.byId.get(f); a; a = state.byId.get(a.parent)) state.path.unshift(a.id);
  }
  function vtChip(id, on) {
    const m = state.byId.get(id);
    const kids = state.kids.get(id) || [];
    const all = kids.length ? descCount(id) : 0;
    const t = m.title && m.title.length < 16 ? m.title : '';
    const ph = m.photo
      ? `<span class="vc__ph"><img src="${esc(m.photo)}" alt="" loading="lazy" decoding="async" width="60" height="60"></span>`
      : `<span class="vc__ph vc__ph--i${m.gender === 'f' ? ' is-f' : ''}">${esc((m.name || '؟').trim().charAt(0))}</span>`;
    const prev = kids.slice(0, 6).map(k => state.byId.get(k).name).join('، ') + (kids.length > 6 ? '…' : '');
    return `<div class="vc${on ? ' is-on' : ''}${m.photo ? ' has-ph' : ''}${m.featured ? ' is-feat' : ''}">
      <button class="vc__b" data-vt="${id}" ${kids.length ? `aria-expanded="${on ? 'true' : 'false'}"` : ''}>
        ${ph}
        <span class="vc__t">${t ? `<small>${esc(t)}</small>` : ''}<b>${esc(m.name)}</b>
          <em>${kids.length ? `${kidsWord(kids.length)}${all > kids.length ? ` · ${all} من الذرية` : ''}` : 'اضغط للتفاصيل'}</em>
          ${kids.length ? `<span class="vc__k">${esc(prev)}</span>` : ''}</span>
        ${kids.length ? `<i class="vc__chev" aria-hidden="true"></i>` : ''}
      </button>
      <button class="vc__i" data-vti="${id}" aria-label="تفاصيل ${esc(m.name)}">i</button>
    </div>`;
  }
  function vtBand(parentId, g, anim) {
    const kids = state.kids.get(parentId) || [];
    const p = state.byId.get(parentId);
    const sel = state.path[g];
    return `<section class="vb${anim ? ' is-new' : ''}" data-g="${g}">
      <h4 class="vb__h"><span>الجيل ${g + 1}</span>أبناء ${esc(dispName(p))} <em>${kids.length}</em></h4>
      <div class="vb__grid${kids.length === 1 ? ' is-one' : ''}">${kids.map((k, j) => `<div class="vb__c" style="--i:${j}">${vtChip(k, k === sel)}</div>`).join('')}</div>
    </section>`;
  }
  function vtRender(fromG) {
    if (!vtList || !rootId) return;
    if (!state.path || !state.path.length || state.path[0] !== rootId) state.path = [rootId];
    // drop anything in the path that no longer exists after an edit
    for (let g = 1; g < state.path.length; g++) if (state.byId.get(state.path[g])?.parent !== state.path[g - 1]) { state.path.length = g; break; }
    let h = `<section class="vb vb--root" data-g="0"><div class="vb__grid is-one"><div class="vb__c">${vtChip(rootId, true)}</div></div></section>`;
    state.path.forEach((id, g) => { if ((state.kids.get(id) || []).length) h += vtBand(id, g + 1, fromG !== undefined && g + 1 > fromG); });
    vtList.innerHTML = h;
  }
  function scrollToEl(el, frac) {
    const y = scrollY + el.getBoundingClientRect().top - innerHeight * frac;
    window.QLenis ? window.QLenis.scrollTo(y, { duration: .9 }) : scrollTo({ top: y, behavior: 'smooth' });
  }
  function vtToggle(id) {
    const m = state.byId.get(id);
    if (!m) return;
    const kids = state.kids.get(id) || [];
    const g = genOf(id) - 1;              // index of this person in the path
    if (!kids.length) { select(id); return; }
    if (state.path[g] === id) {           // already open: fold its descendants
      if (g === 0) return;
      state.path.length = g;
      vtRender();
      return;
    }
    state.path.length = g; state.path.push(id);
    vtRender(g);
    const band = vtList.querySelector(`.vb[data-g="${g + 1}"]`);
    if (band) scrollToEl(band, .22);
  }
  function vtReveal(id) {
    const chain = [];
    for (let a = state.byId.get(id); a; a = state.byId.get(a.parent)) chain.unshift(a.id);
    if (!(state.kids.get(id) || []).length) chain.pop();
    state.path = chain;
    vtRender();
    const b = vtList.querySelector(`[data-vt="${id}"]`);
    if (!b) return;
    const c = b.parentElement;
    c.classList.remove('is-flash'); void c.offsetWidth; c.classList.add('is-flash');
    scrollToEl(c, .3);
  }
  vt && vt.addEventListener('click', e => {
    const info = e.target.closest('[data-vti]');
    if (info) { select(info.dataset.vti); return; }
    const c = e.target.closest('[data-vt]');
    if (c) vtToggle(c.dataset.vt);
  });

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
        <label class="full">اللقب أو الصفة<input name="title" maxlength="60" value="${esc(m.title || '')}" placeholder="مثال: المهندس، اللواء، الحاج"></label>
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
      if (state.view === 'family') { if (!id) fvRender(); } else reveal(j.member.id);
    });
  }
  function photoForm(id) {
    if (!needOnline()) return;
    openModal(`
      <h3>صورة ${esc(state.byId.get(id).name)}</h3>
      <p class="sub">JPG أو PNG أو WEBP، بحد أقصى 12 ميجابايت. تُصغَّر الصورة وتُضبط تلقائيًا.</p>
      <form class="form"><label class="full">الصورة<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required></label>
      <p class="form__err"></p><div class="form__actions"><button class="btn btn--gold" type="submit">رفع الصورة</button></div></form>`);
    bindForm(async (_, f) => {
      const fd = new FormData(f); fd.append('id', id);
      await api('photo', fd, true);
      closeModal(); await refresh(); toast('تم تحديث الصورة'); select(id);
    });
  }
  function bulkForm(parent) {
    if (!needOnline()) return;
    openModal(`
      <h3>إضافة عدة أبناء دفعة واحدة</h3>
      <p class="sub">إلى: ${esc(nasab(parent))}</p>
      <form class="form" autocomplete="off">
        <label class="full">الأسماء الأولى *<textarea name="names" required rows="6" placeholder="اكتب كل اسم في سطر، أو افصل بينها بفاصلة&#10;أحمد&#10;محمد&#10;فاطمة"></textarea></label>
        <label>الجنس<select name="gender"><option value="m">ذكور</option><option value="f">إناث</option></select></label>
        <label>مكان الإقامة<input name="place" list="placesDL" maxlength="40"></label>
        ${placeList}
        <p class="form__err"></p>
        <div class="form__actions"><button class="btn btn--gold" type="submit">إضافة إلى الشجرة</button><button class="btn btn--line" type="button" data-close>إلغاء</button></div>
      </form>`);
    bindForm(async data => {
      data.parent = parent;
      const j = await api('bulk', data);
      state.collapsed.delete(parent);
      closeModal(); await refresh();
      toast(`تمت إضافة ${j.added.length} إلى الشجرة`);
      if (state.view !== 'family') select(parent);
    });
  }
  function unphoto(id) {
    if (!needOnline()) return;
    openModal(`<h3>إزالة صورة ${esc(state.byId.get(id).name)}؟</h3>
      <form class="form"><p class="form__err"></p><div class="form__actions"><button class="btn btn--danger" type="submit">نعم، أزل الصورة</button><button class="btn btn--line" type="button" data-close>إلغاء</button></div></form>`);
    bindForm(async () => { await api('unphoto', { id }); closeModal(); await refresh(); toast('تمت إزالة الصورة'); select(id); });
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
      <p class="sub">يصلنا اقتراحك، ونضيفه إلى الشجرة بعد التأكد منه.</p>
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
      <p class="sub">${setup ? 'هذه أول مرة تُفتح فيها الإدارة. اختر كلمة مرور قوية (8 أحرف على الأقل) واحتفظ بها.' : 'للمدير، ولأصحاب حسابات الفروع. المدير يترك اسم المستخدم فارغًا أو يكتب admin.'}</p>
      <form class="form" autocomplete="on">
      ${setup ? '' : '<label class="full">اسم المستخدم<input name="username" dir="ltr" autocapitalize="off" autocomplete="username" maxlength="40" placeholder="admin"></label>'}
      <label class="full">كلمة المرور<input type="password" name="password" dir="ltr" required minlength="${setup ? 8 : 1}" autocomplete="${setup ? 'new-password' : 'current-password'}"></label>
      <p class="form__err"></p><div class="form__actions"><button class="btn btn--gold" type="submit">${setup ? 'إنشاء والدخول' : 'دخول'}</button></div></form>`);
    bindForm(async data => {
      await api(setup ? 'setup' : 'login', data);
      closeModal(); await refresh();
      if (state.admin) toast('مرحبًا بك في وضع الإدارة');
      else if (state.user) { toast('أهلًا بك، يمكنك الآن تعديل فرع ' + (state.byId.get(state.user.root)?.name || '')); if (state.view === 'family') fvGo(state.user.root); else reveal(state.user.root); }
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
        <button class="btn btn--gold" data-adm="users">حسابات الفروع</button>
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
      if (adm.dataset.adm === 'users') { modalBody.onclick = null; usersMenu(); return; }
      if (adm.dataset.adm === 'out') { await api('logout', {}); closeModal(); await refresh(); toast('تم تسجيل الخروج'); }
      if (adm.dataset.adm === 'pw') {
        modalBody.onclick = null;
        openModal(`<h3>تغيير كلمة المرور</h3><form class="form"><label class="full">كلمة المرور الجديدة<input type="password" name="password" minlength="8" required autocomplete="new-password"></label><p class="form__err"></p><div class="form__actions"><button class="btn btn--gold" type="submit">حفظ</button></div></form>`);
        bindForm(async d => { await api('password', d); closeModal(); toast('تم تغيير كلمة المرور'); });
      }
    };
  }
  function branchMenu() {
    const r = state.byId.get(state.user.root);
    openModal(`
      <h3>حساب الفرع: <span dir="ltr">${esc(state.user.u)}</span></h3>
      <p class="sub">يمكنك إضافة وتعديل الأسماء والصور في فرع: <b>${r ? esc(nasab(r.id)) : '—'}</b> وكل أبنائه وأحفاده. أي تعديل يظهر في الموقع فورًا.</p>
      <div class="form__actions" style="margin-top:18px">
        <button class="btn btn--gold" data-um="go">اذهب إلى فرعي</button>
        <button class="btn btn--line" data-um="pw">تغيير كلمة المرور</button>
        <button class="btn btn--danger" data-um="out">تسجيل الخروج</button>
      </div>`);
    modalBody.onclick = async e => {
      const b = e.target.closest('[data-um]');
      if (!b) return;
      modalBody.onclick = null;
      if (b.dataset.um === 'go') { closeModal(); document.getElementById('tree').scrollIntoView({ behavior: 'smooth' }); reveal(state.user.root); }
      if (b.dataset.um === 'out') { await api('logout', {}); closeModal(); closePanel(); await refresh(); toast('تم تسجيل الخروج'); }
      if (b.dataset.um === 'pw') {
        openModal(`<h3>تغيير كلمة المرور</h3><form class="form"><label class="full">كلمة المرور الجديدة<input type="password" name="password" minlength="6" required autocomplete="new-password" dir="ltr"></label><p class="form__err"></p><div class="form__actions"><button class="btn btn--gold" type="submit">حفظ</button></div></form>`);
        bindForm(async d => { await api('password', d); closeModal(); toast('تم تغيير كلمة المرور'); });
      }
    };
  }
  async function usersMenu() {
    let users = [];
    try { users = (await api('users')).users; } catch (x) { toast(x.message); return; }
    const head = id => state.byId.get(id) ? nasab(id) : 'فرد محذوف';
    openModal(`
      <h3>حسابات الفروع</h3>
      <p class="sub">أعطِ كل فرع اسم مستخدم وكلمة مرور. صاحب الحساب يضيف ويعدّل الأسماء والصور في الفرع الذي تختاره له فقط (رأس الفرع وكل أبنائه وأحفاده)، والتعديل يظهر فورًا.</p>
      <div class="pend">${users.length ? users.map(u => `
        <div class="pend__it" data-u="${esc(u.u)}">
          <b dir="ltr">${esc(u.u)}</b> ${u.label ? `<span class="muted">· ${esc(u.label)}</span>` : ''}
          <p>الفرع: ${esc(head(u.root))}</p>
          <div class="row"><button class="btn btn--line" data-ua="edit">تعديل أو كلمة مرور جديدة</button><button class="btn btn--danger" data-ua="del">حذف الحساب</button></div>
        </div>`).join('') : '<p class="muted">لا توجد حسابات بعد.</p>'}</div>
      <div class="form__actions" style="margin-top:20px"><button class="btn btn--gold" data-ua="new">إضافة حساب جديد</button><button class="btn btn--line" data-ua="back">رجوع</button></div>`);
    modalBody.onclick = async e => {
      const b = e.target.closest('[data-ua]');
      if (!b) return;
      const box = b.closest('[data-u]'), u = box && users.find(x => x.u === box.dataset.u);
      if (b.dataset.ua === 'back') { modalBody.onclick = null; adminMenu(); return; }
      if (b.dataset.ua === 'del') {
        if (box.dataset.sure !== '1') { box.dataset.sure = '1'; b.textContent = 'اضغط مرة أخرى للتأكيد'; return; }
        try { await api('user_delete', { u: u.u }); toast('تم حذف الحساب'); modalBody.onclick = null; usersMenu(); } catch (x) { toast(x.message); }
        return;
      }
      modalBody.onclick = null;
      userForm(b.dataset.ua === 'edit' ? u : null);
    };
  }
  function userForm(u) {
    openModal(`
      <h3>${u ? 'تعديل حساب ' + esc(u.u) : 'حساب فرع جديد'}</h3>
      <p class="sub">اختر رأس الفرع؛ صاحب الحساب يعدّل هذا الفرد وكل من تحته في الشجرة.</p>
      <form class="form" autocomplete="off">
        <label class="full">رأس الفرع *<select name="root" required>${parentOptions(u ? u.root : state.sel)}</select></label>
        <label class="full">وصف الحساب<input name="label" maxlength="60" value="${esc(u?.label || '')}" placeholder="مثال: أبناء المرحوم خميس"></label>
        <label>اسم المستخدم (بالإنجليزية) *<input name="u" dir="ltr" required pattern="[a-zA-Z0-9._\-]{3,40}" maxlength="40" value="${esc(u?.u || '')}" ${u ? 'readonly' : ''} placeholder="khamis"></label>
        <label>${u ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}<input name="password" dir="ltr" ${u ? '' : 'required'} minlength="6" maxlength="80" autocomplete="new-password"></label>
        <p class="form__err"></p>
        <div class="form__actions"><button class="btn btn--gold" type="submit">حفظ الحساب</button><button class="btn btn--line" type="button" data-back>رجوع</button></div>
      </form>`);
    modalBody.querySelector('[data-back]').onclick = () => usersMenu();
    bindForm(async d => {
      d.u = d.u.trim().toLowerCase();
      await api('user_save', d);
      toast(u ? 'تم حفظ الحساب' : `تم إنشاء الحساب «${d.u}». أرسل له اسم المستخدم وكلمة المرور ورابط الموقع.`);
      usersMenu();
    });
  }
  function updateAdminBtn() {
    const b = $('#ftAdmin');
    b.classList.toggle('is-admin', editor());
    b.textContent = state.admin ? `وضع الإدارة${state.pending ? ' · ' + state.pending + ' اقتراح' : ''}`
      : state.user ? `حساب الفرع: ${state.byId.get(state.user.root)?.name || state.user.u}` : 'دخول الإدارة والفروع';
  }
  $('#ftAdmin').addEventListener('click', () => {
    if (!state.online) { toast('الإدارة تعمل على الموقع المنشور فقط'); return; }
    state.admin ? adminMenu() : state.user ? branchMenu() : authForm();
  });

  async function refresh() {
    const keepSel = state.sel;
    await load();
    if (svgReady) { clearAll(); from = new Map(); cur = new Map(); relayout(false); }
    if (state.view === 'family') fvRender();
    if (state.view === 'vt') vtRender();
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

  // first look: keep the mukhtars' line open and fold the deeper branches, so the tree reads clearly
  function defaultCollapse() {
    const keep = new Set();
    const focusId = state.byId.has('m30') ? 'm30' : null;
    for (let a = state.byId.get(focusId); a; a = state.byId.get(a.parent)) keep.add(a.id);
    const walk = (id, d) => {
      const kids = state.kids.get(id) || [];
      if (d >= 5 && kids.length && !keep.has(id)) state.collapsed.add(id);
      kids.forEach(k => walk(k, d + 1));
    };
    if (rootId) walk(rootId, 0);
  }

  /* ---------------- Boot ---------------- */
  let growing = false, growStart = 0, started = false;
  window.QTree = { suggest: () => suggestForm(state.sel || rootId) };
  (async () => {
    await load();
    vtDefaultOpen();
    setView('vt');
    new IntersectionObserver(es => {
      stageVisible = es[0].isIntersecting;
      if (stageVisible && !started && svgReady && state.view === 'tree') {
        started = true;
        if (!reduced) { growing = true; growStart = performance.now(); }
        kick();
      }
    }, { threshold: .25 }).observe(stage);
    addEventListener('resize', () => { applyCam(); });
  })();
})();
