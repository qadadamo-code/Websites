// Daniel's Phone reel — deterministic renderAt(t), 1080x1920. Same beats as the reference reel.
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
const OR = '#F57A0A';
const SCENES = ['s1', 's2', 's5', 's6', 's7', 's9'];
function show(id) { SCENES.forEach((s) => ($(s).style.display = s === id ? 'block' : 'none')); }
function cursor(t, solid, col) { const c = col || OR; return (solid || Math.floor(t * 2.4) % 2 === 0) ? `<span class="cur" style="background:${c}"></span>` : '<span class="cur" style="opacity:0"></span>'; }

// grid (design-guide lines like the reference)
(function () {
  const g = $('grid');
  [[300, 'v'], [780, 'v'], [860, 'h'], [1060, 'h']].forEach(([p, d], i) => { const e = document.createElement('div'); e.className = d === 'v' ? 'gv' : 'gh'; e.style[d === 'v' ? 'left' : 'top'] = p + 'px'; e.dataset.i = i; g.appendChild(e); });
  [['120px', 320, 830], ['24pt', 800, 1075], ['1080', 150, 870], ['RTL', 820, 840]].forEach(([s, x, y]) => { const l = document.createElement('div'); l.className = 'glab'; l.textContent = s; l.style.left = x + 'px'; l.style.top = y + 'px'; g.appendChild(l); });
})();
// iris fibres
(function () {
  const f = $('fib'); let h = '';
  for (let i = 0; i < 90; i++) { const a = (i / 90) * Math.PI * 2 + rnd(i) * 0.03; const r1 = 104 + rnd(i + 3) * 10, r2 = 170 + rnd(i + 9) * 58; h += `<line x1="${Math.cos(a) * r1}" y1="${Math.sin(a) * r1}" x2="${Math.cos(a) * r2}" y2="${Math.sin(a) * r2}" stroke="${i % 3 ? '#b85200' : '#ffc070'}" stroke-width="${i % 3 ? 2.2 : 1.4}" opacity=".55"/>`; }
  f.innerHTML = h;
})();

const ROLES = [
  { w: 'أحدث الأجهزة', cps: 26, hold: 0.3, del: 50 },
  { w: 'كل الإكسسوارات', cps: 32, hold: 0.25, del: 52 },
  { w: 'صيانة لكل جهاز', cps: 32, hold: 0.25, del: 52 },
  { w: 'بدّل قديمك', cps: 30, hold: 0.35, del: 0 },
];
let s0 = 5.62; ROLES.forEach((r) => { const n = chars(r.w).length; r.a = s0; r.b = s0 + n / r.cps; r.c = r.b + r.hold; r.d = r.del ? r.c + n / r.del : r.c; s0 = r.d + 0.03; });
const ROLES_END = ROLES[3].c;
const CHIPS = ['موبايلات', 'إكسسوارات', 'صيانة', 'بيت جالا'];

window.renderAt = function (t) {
  // ===== S1: glitch + "مرحبا"
  if (t < 1.45) {
    show('s1');
    const dark = t < 0.5;
    $('s1').style.background = dark ? '#000' : 'var(--paper)';
    const h = $('hello');
    Array.from($('grid').children).forEach((e, i) => { e.style.opacity = dark ? 0 : clamp(prog(t, 0.5 + i * 0.03, 0.62 + i * 0.03)) * (1 - prog(t, 1.2, 1.4)); });
    if (dark) {
      const on = t > 0.14 && rnd(Math.floor(t * 30)) > 0.35;
      const jx = (rnd(Math.floor(t * 30) + 7) - 0.5) * 36;
      h.style.transform = `translateX(${jx}px) scale(${lerp(0.4, 0.55, prog(t, 0.1, 0.5))})`;
      h.innerHTML = on ? `<span style="background:${OR};color:#000;padding:0 .12em">م</span>` : '';
    } else {
      const txt = 'مرحبا';
      const n = Math.min(chars(txt).length, 1 + (t - 0.5) * 10);
      const done = n >= chars(txt).length;
      h.style.transform = `scale(${lerp(0.9, 1, eOut(prog(t, 0.5, 0.7)))})`;
      const blkW = done ? lerp(0.42, 0, prog(t, 1.02, 1.16)) : 0.42;
      h.innerHTML = `<span>${sub(txt, n)}</span>` + (blkW > 0.01 ? `<span class="blk" style="width:${blkW}em"></span>` : '') + cursor(t, !done) +
        (t > 1.1 ? `<svg width="64" height="64" viewBox="-10 -10 20 20" style="position:relative;top:-80px;margin-right:-14px;transform:scale(${eBack(prog(t, 1.1, 1.28))}) rotate(${(t - 1.1) * 160}deg)"><path d="M0-9C1-2 2-1 9 0 2 1 1 2 0 9-1 2-2 1-9 0-2-1-1-2 0-9Z" fill="#9a9a9a"/></svg>` : '');
    }
    return;
  }

  // ===== S2: giant silhouette "إحنا" -> zoom out -> "Daniel's Phone" -> "كل شي بدك ياه" -> dot drops
  if (t < 4.3) {
    show('s2'); $('s2').style.background = 'var(--paper)';
    const enter = eOut(prog(t, 1.45, 1.6));
    const z = eIO(prog(t, 2.0, 2.35));
    const fall = eIn(prog(t, 3.98, 4.3));
    const sc = lerp(lerp(2.1, 1.9, enter), 0.5, z);
    const ty = lerp(lerp(1700, 1511, enter), 80, z) + fall * 1300;
    const sil = $('sil');
    sil.style.transform = `translateY(${ty}px) scale(${sc})`;
    // phone back centre in screen coords (phone sits ~ y=640 in the 1920 frame)
    const py = 1920 - (1920 - 640) * sc + ty;
    const im = $('im'); im.style.top = (py - 200) + 'px';
    if (t < 2.0) { const w = 'إحنا'; const n = (t - 1.55) * 26; im.innerHTML = (t < 1.92 ? sub(w, n) : '') + cursor(t, n < 4, OR); im.style.opacity = 1; } else im.style.opacity = 0;
    const sm = $('small'); const topY = 1920 - (1920 - 156) * sc + ty;
    sm.style.top = (topY - 170) + 'px';
    let html = '';
    if (t >= 2.3 && t < 3.55) {
      const name = "Daniel's Phone"; const total = chars(name).length; let n;
      if (t < 3.1) n = (t - 2.3) * 22; else n = total - (t - 3.1) * 40;
      n = clamp(Math.floor(n), 0, total);
      const a = sub(name, Math.min(n, 8)), b = n > 8 ? sub(name, n).slice(8) : '';
      html = `<span style="direction:ltr;display:flex;align-items:center;white-space:pre"><span style="font-weight:300">${a}</span><span style="font-weight:800">${b}</span>${cursor(t, n < total)}</span>`;
    } else if (t >= 3.55) {
      const w = 'كل شي بدك ياه'; const n = (t - 3.58) * 36; const dotOn = t > 3.95;
      html = `<span class="ar" style="font-weight:700">${sub(w, n)}</span>` + (dotOn ? '' : cursor(t, n < chars(w).length));
      const d = $('drop');
      if (dotOn) {
        d.style.display = 'block';
        const p = prog(t, 3.95, 4.3);
        const y = topY - 230 + eIn(p) * 1500;
        d.style.left = (540 - 17) + 'px'; d.style.top = y + 'px';
        d.style.transform = `scale(${eBack(prog(t, 3.95, 4.05))})`;
      } else d.style.display = 'none';
    }
    if (t < 3.55) $('drop').style.display = 'none';
    sm.innerHTML = html;
    sm.style.opacity = 1 - prog(t, 4.05, 4.3);
    return;
  }

  // ===== S5: eye opens on black, orange lens-iris, "عنا", iris slides, zoom into the white
  if (t < 5.5) {
    show('s5');
    const cx = 540, cy = 960, W = 1120;
    const open = eOut(prog(t, 4.3, 4.68));
    const hh = lerp(6, 330, open);
    const d = `M ${cx - W / 2} ${cy} Q ${cx} ${cy - hh} ${cx + W / 2} ${cy} Q ${cx} ${cy + hh} ${cx - W / 2} ${cy} Z`;
    $('eyeW').setAttribute('d', d); $('eyeclipP').setAttribute('d', d);
    const zoom = eIn(prog(t, 5.05, 5.5));
    const S = lerp(1, 7, zoom);
    $('eyeG').setAttribute('transform', `translate(${cx} ${cy}) scale(${S}) translate(${-cx} ${-cy})`);
    const ip = eBack(prog(t, 4.4, 4.75));
    const slide = eIO(prog(t, 4.85, 5.3));
    const ix = cx + slide * 330 + Math.sin(t * 9) * 4 * (1 - slide), iy = cy;
    $('irisG').setAttribute('transform', `translate(${ix} ${iy}) scale(${lerp(0.5, 1, ip) * (0.92 + 0.08 * open)})`);
    const et = $('etxt');
    et.setAttribute('x', cx - 40); et.setAttribute('y', cy + 30);
    et.textContent = 'عنا';
    et.setAttribute('opacity', prog(t, 4.78, 4.95));
    return;
  }

  // ===== S6: "عنا" + cycling bold words
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
    const sq = t > 5.95 ? `text-decoration:underline wavy ${OR};text-decoration-thickness:4px;text-underline-offset:22px;` : '';
    const icon = `<svg width="40" height="40" viewBox="0 0 10 10" style="align-self:flex-start;margin-top:14px;margin-right:8px"><rect x="2.6" y="0.8" width="4.8" height="8.4" rx="1.2" fill="none" stroke="#0A0A0A" stroke-width=".9"/><circle cx="8.6" cy="1.4" r="${typing ? 1.3 : 1.1 + Math.sin(t * 14) * 0.25}" fill="${OR}"/></svg>`;
    $('roles').innerHTML = `<span style="font-weight:300;${sq}">عنا</span>&nbsp;<span style="font-weight:700">${word}</span>${t < 5.62 ? cursor(t) : icon}`;
    const blur = prog(t, ROLES_END, ROLES_END + 0.22);
    $('roles').style.filter = blur > 0 ? `blur(${blur * 26}px)` : 'none';
    $('roles').style.opacity = 1 - blur;
    $('roles').style.transform = `scale(${1 + blur * 0.15})`;
    return;
  }

  // ===== S7: name + dot -> circle -> portrait card
  if (t < 12.25) {
    show('s7'); $('s7').style.background = 'var(--paper)';
    const nm = $('nm');
    const bi = prog(t, 9.12, 9.32);
    nm.style.filter = `blur(${(1 - bi) * 18}px)`;
    nm.innerHTML = `<span style="display:flex;gap:16px;align-items:baseline;direction:ltr"><span style="font-weight:300">Daniel's</span><b style="font-weight:800">Phone</b></span>`;
    const d = $('ndot');
    const pop = eBack(prog(t, 9.32, 9.45));
    const drop = eIO(prog(t, 9.45, 9.68));
    const grow = eIn(prog(t, 9.62, 10.2));
    const r = lerp(14, 1250, grow) * pop;
    const cx = 540 + 190 * (1 - drop) * (1 - grow);
    const cy = lerp(lerp(880, 1070, drop), 960, grow);
    d.style.width = d.style.height = 2 * r + 'px';
    d.style.left = (cx - r) + 'px'; d.style.top = (cy - r) + 'px';
    d.style.display = t > 9.32 ? 'block' : 'none';
    d.style.background = r < 30 ? OR : '#000';
    const mw = $('mwrap'); mw.style.left = -(cx - r) + 'px'; mw.style.top = -(cy - r) + 'px';
    const pz = lerp(1.18, 1.0, eOut(prog(t, 9.62, 12.2)));
    $('portrait').style.transform = `scale(${pz})`; $('portrait').style.opacity = clamp((r - 40) / 140);
    nm.style.opacity = bi * (1 - grow);
    const card = $('card'); const ci = eOut(prog(t, 10.05, 10.4));
    card.style.opacity = ci; card.style.transform = `translateY(${(1 - ci) * 60}px)`;
    let ch = '';
    CHIPS.forEach((c, i) => { const a = prog(t, 10.35 + i * 0.3, 10.5 + i * 0.3); ch += `<span style="opacity:${a};display:inline-block;transform:translateY(${(1 - a) * 16}px)">${i ? `<span style="color:${OR};margin:0 14px">•</span>` : ''}${c}</span>`; });
    $('chips').innerHTML = ch;
    $('fade').style.opacity = eIO(prog(t, 11.85, 12.25));
    return;
  }

  // ===== S9: end card
  show('s9');
  const W = [["DANIEL'S ", 300, '#fff'], ['PHONE', 800, '#fff'], ['.', 800, OR]];
  const n = Math.floor((t - 12.4) / 0.055);
  let left = Math.max(0, n), html = '';
  for (const [str, w, c] of W) { const k = Math.min(left, str.length); left -= k; if (k) html += `<span style="font-family:Man;font-weight:${w};color:${c};white-space:pre">${str.slice(0, k)}</span>`; }
  $('endw').innerHTML = html + (n < 15 ? cursor(t, true) : '');
  const lg = eBack(prog(t, 13.3, 13.6));
  $('logo').style.transform = `scale(${lg})`; $('logo').style.opacity = clamp(lg);
  const e2 = eOut(prog(t, 13.5, 13.8)), e3 = eOut(prog(t, 13.7, 14.0)), e4 = eOut(prog(t, 13.9, 14.2));
  $('end2').textContent = 'بيت جالا · شارع معصرة الزيتون'; $('end2').style.opacity = e2; $('end2').style.transform = `translateY(${(1 - e2) * 20}px)`;
  $('end3').innerHTML = 'واتساب&nbsp; <span style="font-family:Man;direction:ltr;unicode-bidi:isolate">01203101104</span>'; $('end3').style.opacity = e3; $('end3').style.transform = `translateY(${(1 - e3) * 20}px)`;
  $('end4').textContent = 'web.theplanetco.com/daniels-phone'; $('end4').style.opacity = e4;
};

document.fonts.ready.then(() => Promise.all(Array.from(document.images).map((i) => i.complete ? 1 : new Promise((r) => (i.onload = i.onerror = r))))).then(() => { window.ready = true; });
