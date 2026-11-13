// Planet intro reel — deterministic renderAt(t), 1080x1920
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOut = (p) => 1 - Math.pow(1 - p, 3);
const eIn = (p) => p * p * p;
const eIO = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const eBack = (p) => { const c = 1.7, c3 = c + 1; return 1 + c3 * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const chars = (s) => Array.from(s);
const sub = (s, n) => chars(s).slice(0, Math.max(0, Math.floor(n))).join('');

const SCENES = ['s1', 's2', 's5', 's6', 's7', 's9'];
function show(id) { SCENES.forEach((s) => ($(s).style.display = s === id ? 'block' : 'none')); }

function ringPath(cx, cy, R, back) {
  const rx = R * 1.78, ry = R * 0.36;
  return back
    ? `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`
    : `M ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy}`;
}
function cursor(t, solid) { return (solid || Math.floor(t * 2.4) % 2 === 0) ? '<span class="cur"></span>' : '<span class="cur" style="opacity:0"></span>'; }

// ---------- words ----------
const ROLES = [
  { w: 'موقع احترافي', cps: 26, hold: 0.3, del: 50 },
  { w: 'متجر إلكتروني', cps: 32, hold: 0.25, del: 52 },
  { w: 'منيو ذكي', cps: 32, hold: 0.25, del: 52 },
  { w: 'هوية بصرية', cps: 32, hold: 0.3, del: 0 },
];
let s = 5.62; ROLES.forEach((r) => { const n = chars(r.w).length; r.a = s; r.b = s + n / r.cps; r.c = r.b + r.hold; r.d = r.del ? r.c + n / r.del : r.c; s = r.d + 0.03; });
const ROLES_END = ROLES[3].c; // blur out after
const CHIPS = ['مواقع', 'متاجر', 'منيوهات', 'هويات بصرية'];

// ---------- mosaic ----------
const IMGS = Array.from({ length: 27 }, (_, i) => `assets/work/s${String(i + 1).padStart(2, '0')}.jpg`);
const ORDER = [3, 9, 14, 20, 1, 24, 6, 17, 11, 26, 0, 13, 22, 5, 18, 8, 2, 25, 15, 10, 21, 4, 16, 7, 19, 12, 23];
(function buildMosaic() {
  const m = $('mos'); let k = 0;
  for (let c = 0; c < 4; c++) {
    const col = document.createElement('div'); col.className = 'col';
    for (let i = 0; i < 7; i++) { const d = document.createElement('div'); d.className = 'tile'; d.innerHTML = `<img src="${IMGS[ORDER[k++ % 27]]}">`; col.appendChild(d); }
    m.appendChild(col);
  }
})();

// glitch lines for intro
(function () { const g = $('glines'); for (let i = 0; i < 14; i++) { const d = document.createElement('div'); d.className = 'gl'; g.appendChild(d); } })();

window.renderAt = function (t) {
  // ===== S0 / S1 : glitch + "أهلاً"
  if (t < 1.45) {
    show('s1');
    const dark = t < 0.55;
    $('s1').style.background = dark ? 'var(--dark)' : 'var(--paper)';
    const h = $('hello');
    const gl = $('glines').children;
    if (dark) {
      const on = t > 0.12 && rnd(Math.floor(t * 30)) > 0.3;
      const jx = (rnd(Math.floor(t * 30) + 7) - 0.5) * 40;
      const sc = lerp(0.35, 0.5, prog(t, 0.1, 0.55));
      h.style.fontSize = '170px';
      h.style.transform = `translateX(${jx}px) scale(${sc})`;
      h.innerHTML = on ? `<span style="background:var(--mint);color:var(--dark);padding:0 .12em;border-radius:.08em">أ</span>` : '';
      for (let i = 0; i < gl.length; i++) { const r = rnd(i * 13 + Math.floor(t * 24)); gl[i].style.cssText = `left:${200 + r * 500}px;top:${900 + (rnd(i + Math.floor(t * 24) * 3) - .5) * 120}px;width:${30 + r * 160}px;background:${r > .6 ? 'var(--mint)' : '#33465a'};opacity:${t > .1 && r > .45 ? 1 : 0}`; }
    } else {
      const txt = 'أهلاً';
      const n = Math.min(chars(txt).length, 1 + (t - 0.55) * 11);
      const typed = sub(txt, n);
      const done = n >= chars(txt).length;
      const pop = eBack(prog(t, 0.55, 0.75));
      h.style.transform = `scale(${lerp(0.85, 1, pop)})`;
      const blkW = done ? lerp(0.5, 0, prog(t, 1.0, 1.15)) : 0.5;
      h.innerHTML = `<span>${typed}</span>` + (blkW > 0.01 ? `<span class="blk" style="width:${blkW}em"></span>` : cursor(t)) +
        (t > 1.12 ? `<svg width="70" height="70" viewBox="-10 -10 20 20" style="position:relative;top:-70px;margin-right:-20px;transform:scale(${eBack(prog(t, 1.12, 1.3))}) rotate(${(t - 1.12) * 180}deg)"><path d="M0-9C1-2 2-1 9 0 2 1 1 2 0 9-1 2-2 1-9 0-2-1-1-2 0-9Z" fill="#92C5B4"/></svg>` : '');
      for (let i = 0; i < gl.length; i++) { const f = Math.floor(t * 20); const r = rnd(i * 31 + f); const vis = t < 1.05 && r > 0.55; gl[i].style.cssText = `left:${120 + r * 760}px;top:${840 + rnd(i * 7 + f) * 240}px;width:${20 + rnd(i + f) * 180}px;background:${r > .8 ? 'var(--mint)' : '#cfd6d3'};opacity:${vis ? 1 : 0}`; }
    }
    return;
  }

  // ===== S2-S4 : planet "إحنا" -> zoom out -> "Planet بلانت" -> "بنعملك" -> drop
  if (t < 4.3) {
    show('s2'); $('s2').style.background = 'var(--paper)';
    const z = eIO(prog(t, 2.02, 2.42));
    const enter = eOut(prog(t, 1.45, 1.75));
    let R = lerp(lerp(760, 660, enter), 175, z);
    let cy = lerp(1270, 1430, z);
    const fall = eIn(prog(t, 3.98, 4.3));
    cy += fall * 1300;
    const cx = 540;
    $('sphere').setAttribute('cx', cx); $('sphere').setAttribute('cy', cy); $('sphere').setAttribute('r', R);
    const tilt = -16 + (t - 1.45) * 4;
    ['ringB', 'ringF'].forEach((id, i) => { const p = $(id); p.setAttribute('d', ringPath(cx, cy, R, i === 0)); p.setAttribute('stroke-width', R * 0.075); p.setAttribute('transform', `rotate(${tilt} ${cx} ${cy})`); });
    // "إحنا" on the planet
    const im = $('im');
    im.style.top = (cy - R * 0.42 - 90) + 'px'; im.style.height = '180px';
    if (t < 2.02) {
      const word = 'إحنا'; const n = (t - 1.52) * 30; const typed = t < 1.92 ? sub(word, n) : '';
      im.innerHTML = typed + (t > 1.5 ? '<span class="cur" style="background:#92C5B4"></span>' : '');
      im.style.opacity = 1;
    } else im.style.opacity = 0;
    // small line above planet
    const sm = $('small'); sm.style.top = (cy - R * 1.0 - 200) + 'px'; sm.style.height = '90px';
    let html = '';
    if (t >= 2.3 && t < 3.55) {
      const full = [['بلانت', 'ar', 300], [' ', '', 300], ['Planet', '', 800]];
      const total = 12; let n;
      if (t < 3.15) n = (t - 2.3) * 18; else n = total - (t - 3.15) * 32;
      n = clamp(Math.floor(n), 0, total);
      let left = n; const parts = [];
      for (const [str, cls, w] of full) { const k = Math.min(left, chars(str).length); left -= k; if (k > 0) parts.push(`<span class="${cls}" style="font-weight:${w};${cls ? '' : 'font-family:Man'}">${sub(str, k)}</span>`); }
      // RTL visual: arabic on right, latin on left
      html = `<span style="direction:rtl;display:flex;gap:0;align-items:center;white-space:pre">${parts.join('')}${cursor(t, n < total)}</span>`;
    } else if (t >= 3.55) {
      const n = (t - 3.58) * 22; const w = 'بنعملك';
      const dotOn = t > 3.92;
      html = `<span class="ar" style="font-weight:600">${sub(w, n)}</span>` + (dotOn ? '' : cursor(t, n < 6));
      const d = $('drop');
      if (dotOn) {
        d.style.display = 'block';
        const p = prog(t, 3.92, 4.3);
        const sc = eBack(prog(t, 3.92, 4.02));
        const y = (cy - fall * 1300) - R - 180 + eIn(p) * 1400;
        d.style.left = (540 - 13 - 120) + 'px'; d.style.top = y + 'px';
        d.style.transform = `scale(${sc})`;
      } else d.style.display = 'none';
    }
    if (t < 3.55) $('drop').style.display = 'none';
    sm.innerHTML = html;
    sm.style.transform = `translateY(${fall * 260}px)`; sm.style.opacity = 1 - prog(t, 4.05, 4.3);
    return;
  }

  // ===== S5 : browser-window "eye" opens, mint planet iris, match-cut zoom
  if (t < 5.5) {
    show('s5');
    const win = $('win');
    const open = eOut(prog(t, 4.3, 4.62));
    const H = lerp(8, 600, open);
    const zoom = eIn(prog(t, 5.05, 5.5));
    const S = lerp(1, 5.2, zoom);
    win.style.height = H + 'px';
    win.style.borderRadius = lerp(4, 40, open) + 'px';
    win.style.transform = `translate(-50%,-50%) scale(${S})`;
    win.style.marginTop = '0';
    win.style.left = '50%'; win.style.top = '50%';
    win.style.width = '880px'; win.style.marginLeft = '0';
    $('wbar').style.opacity = clamp(open * 1.4 - 0.4) * (1 - zoom * 3);
    $('iris').style.top = ((H - 600) / 2) + 'px';
    const ip = eBack(prog(t, 4.36, 4.72));
    const slide = eIn(prog(t, 4.95, 5.25));
    const icx = 440 + slide * 760, icy = 300;
    const ig = $('ig');
    ig.setAttribute('transform', `translate(${icx} ${icy}) scale(${lerp(0.35, 1, ip)}) translate(${-icx} ${-icy})`);
    $('isph').setAttribute('cx', icx); $('isph').setAttribute('cy', icy);
    $('ihl').setAttribute('cx', icx - 72); $('ihl').setAttribute('cy', icy - 84);
    const tl = -18 + (t - 4.3) * 10;
    ['iRingB', 'iRingF'].forEach((id, i) => { const p = $(id); p.setAttribute('d', ringPath(icx, icy, 190, i === 0)); p.setAttribute('transform', `rotate(${tl} ${icx} ${icy})`); });
    const wt = $('wtxt');
    const tIn = prog(t, 4.7, 4.85);
    const col = prog(t, 4.98, 5.15);
    wt.style.opacity = tIn;
    wt.style.color = 'var(--ink)';
    wt.style.fontWeight = 300;
    wt.style.transform = `scale(${(70 + 18 * zoom) / (70 * S)})`;
    wt.innerHTML = 'بنعملك';
    // keep paper colour filling when zoomed
    $('s5').style.background = zoom > 0.98 ? 'var(--paper)' : 'var(--dark)';
    return;
  }

  // ===== S6 : "بنعملك" + cycling bold words
  if (t < 9.12) {
    show('s6'); $('s6').style.background = 'var(--paper)';
    let word = '', typing = false;
    for (const r of ROLES) {
      if (t >= r.a && t < r.d + 0.03) {
        const n = chars(r.w).length;
        let k = t < r.b ? (t - r.a) * r.cps : t < r.c ? n : n - (t - r.c) * r.del;
        k = clamp(Math.floor(k), 0, n); word = sub(r.w, k); typing = t < r.b || t > r.c;
      }
    }
    if (t >= ROLES[3].a) word = sub(ROLES[3].w, Math.min(chars(ROLES[3].w).length, (t - ROLES[3].a) * ROLES[3].cps));
    const sq = t > 5.95 ? `text-decoration:underline wavy #92C5B4;text-decoration-thickness:4px;text-underline-offset:18px;` : '';
    const dot = `<svg width="34" height="34" viewBox="0 0 10 10" style="align-self:flex-start;margin-top:18px;margin-right:6px"><circle cx="5" cy="5" r="${typing ? 3.6 : 3 + Math.sin(t * 14) * 0.6}" fill="#92C5B4"/></svg>`;
    $('roles').innerHTML = `<span style="font-weight:300;${sq}">بنعملك</span>&nbsp;<span style="font-weight:700">${word}</span>${t < 5.62 ? cursor(t) : dot}`;
    const blur = prog(t, ROLES_END, ROLES_END + 0.22);
    $('roles').style.filter = blur > 0 ? `blur(${blur * 26}px)` : 'none';
    $('roles').style.opacity = 1 - blur;
    $('roles').style.transform = `scale(${1 + blur * 0.15})`;
    return;
  }

  // ===== S7/S8 : name + dot -> circle -> portfolio mosaic card
  if (t < 12.25) {
    show('s7'); $('s7').style.background = 'var(--paper)';
    const nm = $('nm');
    const bi = prog(t, 9.12, 9.32);
    nm.style.filter = `blur(${(1 - bi) * 18}px)`; nm.style.opacity = bi;
    nm.innerHTML = `<span style="display:flex;gap:16px;align-items:baseline;direction:ltr"><b style="font-family:Man;font-weight:800">Planet</b><span class="ar" style="font-weight:300">بلانت</span></span>`;
    const d = $('ndot');
    const pop = eBack(prog(t, 9.32, 9.45));
    const drop = eIO(prog(t, 9.45, 9.68));
    const grow = eIn(prog(t, 9.62, 10.2));
    const r = lerp(13, 1250, grow) * pop;
    const cx = 540 + 150 * (1 - drop) * (1 - grow);
    const cy = lerp(lerp(870, 1060, drop), 960, grow);
    d.style.width = d.style.height = 2 * r + 'px';
    d.style.left = (cx - r) + 'px'; d.style.top = (cy - r) + 'px';
    d.style.display = t > 9.32 ? 'block' : 'none';
    // inner wrap stays fixed to the screen
    const mw = $('mwrap'); mw.style.left = (540 - (cx - r)) + 'px'; mw.style.top = (960 - (cy - r)) + 'px'; mw.style.margin = '-960px 0 0 -540px';
    $('mos').style.opacity = clamp((r - 40) / 120);
    const st = t - 9.5;
    const mz = lerp(1.25, 1.05, eOut(prog(t, 9.62, 11.9)));
    $('mos').style.transform = `rotate(-9deg) scale(${mz})`;
    Array.from($('mos').children).forEach((c, i) => { const dir = i % 2 ? 1 : -1; c.style.transform = `translateY(${(i % 2 ? -900 : -300) + dir * st * 210}px)`; });
    nm.style.opacity = bi * (1 - grow);
    const card = $('card'); const ci = eOut(prog(t, 10.05, 10.4));
    card.style.opacity = ci; card.style.transform = `translateY(${(1 - ci) * 60}px)`;
    let ch = '';
    CHIPS.forEach((c, i) => { const a = prog(t, 10.35 + i * 0.3, 10.5 + i * 0.3); ch += `<span style="opacity:${a};display:inline-block;transform:translateY(${(1 - a) * 16}px)">${i ? '<span style="color:#92C5B4;margin:0 14px">•</span>' : ''}${c}</span>`; });
    $('chips').innerHTML = ch;
    $('fade').style.opacity = eIO(prog(t, 11.85, 12.25));
    return;
  }

  // ===== S9 : end card
  show('s9');
  const W = [['THE ', 300, '#fff'], ['PLANET ', 800, '#fff'], ['CO', 300, '#fff'], ['.', 800, '#92C5B4']];
  const n = Math.floor((t - 12.4) / 0.055);
  let left = Math.max(0, n), html = '';
  for (const [str, w, c] of W) { const k = Math.min(left, str.length); left -= k; if (k) html += `<span style="font-family:Man;font-weight:${w};color:${c};white-space:pre">${str.slice(0, k)}</span>`; }
  $('endw').innerHTML = html + (n < 14 ? cursor(t, true) : '');
  const lg = eBack(prog(t, 13.25, 13.55));
  $('logo').style.transform = `scale(${lg})`; $('logo').style.opacity = clamp(lg);
  const e2 = eOut(prog(t, 13.5, 13.8)), e3 = eOut(prog(t, 13.7, 14.0));
  $('end2').textContent = 'theplanetco.com'; $('end2').style.opacity = e2; $('end2').style.transform = `translateY(${(1 - e2) * 20}px)`;
  $('end3').innerHTML = 'واتساب <span style="font-family:Man;direction:ltr;unicode-bidi:isolate">01203101104</span>'; $('end3').style.opacity = e3; $('end3').style.transform = `translateY(${(1 - e3) * 20}px)`;
};

document.fonts.ready.then(() => Promise.all(Array.from(document.images).map((i) => i.complete ? 1 : new Promise((r) => (i.onload = i.onerror = r))))).then(() => {
  // warm up fonts for every weight
  window.ready = true;
});
