// Planet intro reel v2 — shot-for-shot timing of the reference montage, Planet content. renderAt(t), 1080x1920
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOut = (p) => 1 - Math.pow(1 - p, 3);
const eIn = (p) => p * p * p;
const eIO = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const eBack = (p) => { const c = 1.6, c3 = c + 1; return 1 + c3 * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ch = (s) => Array.from(s);
const sub = (s, n) => ch(s).slice(0, Math.max(0, Math.floor(n))).join('');
const LAYERS = ['Lglitch', 'Lhello', 'Lhead', 'Leye', 'Lroles', 'Lname', 'Lend'];
const show = (id) => LAYERS.forEach((l) => ($(l).style.display = l === id ? 'block' : 'none'));
const cur = (t, solid) => `<span class="cur" style="opacity:${solid || Math.floor(t * 2.6) % 2 === 0 ? 1 : 0}"></span>`;
// typed with selection block on the last char (reference look)
function typedSel(str, n, sel, cls = '') {
  const c = ch(str), k = clamp(Math.floor(n), 0, c.length);
  if (!sel || k === 0) return `<span class="${cls}">${c.slice(0, k).join('')}</span>`;
  return `<span class="${cls}">${c.slice(0, k - 1).join('')}<span class="sel">${c[k - 1]}</span></span>`;
}
const dotCur = (on) => `<svg width="22" height="22" viewBox="0 0 10 10" style="align-self:flex-start;margin:6px 4px 0;opacity:${on ? 1 : 0}"><circle cx="5" cy="5" r="3.4" fill="#5fa892"/></svg>`;

// glitch dashes
['glines', 'hlines'].forEach((id) => { const g = $(id); for (let i = 0; i < 18; i++) { const d = document.createElement('div'); d.className = 'gl'; g.appendChild(d); } });
// iris fibres
(function () { const g = $('fibres'); let h = ''; for (let i = 0; i < 90; i++) h += `<line data-a="${(i / 90) * Math.PI * 2 + rnd(i) * 0.05}" data-l="${0.55 + rnd(i + 9) * 0.4}" stroke="${i % 3 ? '#d8f3ea' : '#0d4a3d'}" stroke-width="${1 + rnd(i + 3) * 1.6}" stroke-linecap="round"/>`; g.innerHTML = h; })();

const SIL = { w: 752, h: 1344, top: 112, cx: 377, hw: 337 };
function head(s, top, cx = 540) { const k = (s * 528 / SIL.hw); const im = $('silimg'); im.style.width = SIL.w * k + 'px'; im.style.height = SIL.h * k + 'px'; im.style.left = (cx - SIL.cx * k) + 'px'; im.style.top = (top - SIL.top * k) + 'px'; }
const EYE_N = 151, POR_N = 151, EYE_OFF = 2.9, POR_OFF = 3.3;
let _pend = [];
function setSrc(img, src) { if (img.getAttribute('src') !== src) { img.setAttribute('src', src); _pend.push(new Promise((r) => { if (img.complete && img.naturalWidth) r(); else { img.onload = img.onerror = () => r(); } })); } }
function lens(w, h, cx = 540, cy = 960) { return `M ${cx - w / 2} ${cy} Q ${cx} ${cy - h} ${cx + w / 2} ${cy} Q ${cx} ${cy + h} ${cx - w / 2} ${cy} Z`; }

const ROLE = { stat: 'خبراء', w: ['مواقع', 'متاجر إلكترونية', 'هويات بصرية'], stat2: 'صنّاع', w2: 'محتوى' };
const TITLES = ['مواقع', 'متاجر', 'هويات بصرية', 'محتوى'];

window.renderAt = function (t) { _pend = []; draw(t); return Promise.all(_pend); };
function draw(t) {
  // ---------- 0.00-0.48 glitch "أ"
  if (t < 0.48) {
    show('Lglitch');
    const f = Math.floor(t * 30), on = t > 0.12 && (t > 0.3 || rnd(f) > 0.35);
    const sc = lerp(0.3, 1, eOut(prog(t, 0.12, 0.45)));
    const jx = (rnd(f + 3) - 0.5) * (t < 0.3 ? 30 : 8);
    $('gH').style.transform = `translateX(${jx}px) scale(${sc})`;
    $('gH').innerHTML = on ? `<span style="background:#2c6b5a;padding:0 .14em;border-radius:3px">أ</span>` : '';
    Array.from($('glines').children).forEach((d, i) => { const r = rnd(i * 17 + f); d.style.cssText = `left:${150 + r * 700}px;top:${930 + (rnd(i * 5 + f) - .5) * 110}px;width:${20 + rnd(i + f * 3) * 140}px;background:${r > .7 ? '#2c6b5a' : '#333'};opacity:${t > .1 && r > .4 ? 1 : 0}`; });
    return;
  }
  // ---------- 0.48-1.05 "أهلاً" + wave
  if (t < 1.05) {
    show('Lhello');
    const w = 'أهلاً', n = 1 + (t - 0.5) / 0.07, done = n >= 5.5;
    $('hello').innerHTML = typedSel(w, n, !done) + cur(t, !done);
    const f = Math.floor(t * 24);
    Array.from($('hlines').children).forEach((d, i) => { const r = rnd(i * 29 + f); d.style.cssText = `left:${60 + r * 900}px;top:${860 + rnd(i * 11 + f) * 200}px;width:${15 + rnd(i * 2 + f) * 90}px;height:2px;background:#d4d7d6;opacity:${t < 0.95 && r > .5 ? 1 : 0}`; });
    const e = $('emoji');
    if (t >= 0.8) { const p = eBack(prog(t, 0.8, 0.9)); e.style.display = 'block'; e.style.cssText += `;left:300px;top:842px;font-size:58px;transform:scale(${p}) rotate(${Math.sin((t - 0.8) * 22) * 14}deg)`; e.style.display = 'block'; }
    else e.style.display = 'none';
    return;
  }
  // ---------- 1.05-3.90 silhouette head
  if (t < 3.9) {
    show('Lhead');
    const im = $('im'), nm = $('nm'), ball = $('ball');
    if (t < 1.65) {
      const s = lerp(1.95, 2.02, prog(t, 1.05, 1.65));
      head(s, 170 - (s - 1.95) * 150);
      im.style.top = '575px'; im.style.height = '170px';
      const n = (t - 1.04) / 0.035;
      im.innerHTML = (t < 1.45 ? `<span>${sub('إحنا', n)}</span>` : '') + `<span class="cur" style="background:#92C5B4;width:7px"></span>`;
      nm.innerHTML = ''; ball.style.display = 'none';
      return;
    }
    im.innerHTML = '';
    const drop = eIn(prog(t, 3.62, 3.9));
    head(0.82, 1175 + drop * 700);
    nm.style.top = '985px'; nm.style.height = '80px';
    let html = '';
    if (t < 2.35) {
      const n = (t - 1.65) / 0.045, k = Math.floor(n);
      const a = sub('بلانت', Math.min(k, 5)), b = k > 6 ? 'Planet'.slice(0, k - 6) : '';
      html = `<span style="display:inline-flex;direction:ltr;align-items:center"><span style="font-weight:300;margin-right:${k > 5 ? '.3em' : '0'}">${a}</span><span style="font-weight:700">${b}</span>${cur(t, k < 12)}</span>`;
    } else if (t < 2.55) {
      const p = prog(t, 2.35, 2.5);
      html = t > 2.5 ? `<span style="font-weight:700">Planet</span>` + cur(t, true) : `<span style="display:inline-flex;direction:ltr"><span style="font-weight:300;margin-right:.3em;opacity:${1 - p};filter:blur(${p * 10}px)">بلانت</span><span style="font-weight:700">Planet</span></span>`;
    } else if (t < 2.9) {
      const k = 6 - Math.floor((t - 2.55) / 0.05);
      html = `<span style="display:inline-flex;direction:ltr"><span style="font-weight:700">${'Planet'.slice(0, Math.max(0, k))}</span>${cur(t, true)}</span>`;
    } else {
      const n = (t - 2.9) / 0.05, w = 'فريقك', done = n >= 5.2;
      const fade = prog(t, 3.6, 3.7);
      html = `<span style="opacity:${1 - fade};display:inline-flex">${typedSel(w, n, !done && n > 0)}</span>` + (t < 3.6 ? cur(t, !done) : '');
      if (n <= 0) html = cur(t, true);
    }
    nm.innerHTML = html;
    nm.style.transform = `translateY(${drop * 140}px)`;
    if (t >= 3.6) {
      const p = prog(t, 3.6, 3.9);
      const d = lerp(20, 120, eIn(p) * 0.6 + p * 0.4);
      const y = lerp(1010, 905, eOut(p));
      ball.style.display = 'block';
      ball.style.width = ball.style.height = d + 'px';
      ball.style.left = (lerp(470, 540, eOut(p)) - d / 2) + 'px'; ball.style.top = (y - d / 2) + 'px';
      ball.style.boxShadow = `0 0 0 ${Math.max(1, d * 0.05)}px #3f8b75`;
    } else ball.style.display = 'none';
    return;
  }
  // ---------- 3.90-5.30 eye (real macro video)
  if (t < 5.3) {
    show('Leye');
    const open = eOut(prog(t, 3.9, 4.05));
    const fi = clamp(Math.floor((EYE_OFF + (t - 3.9) * 1.5) * 30), 0, EYE_N - 1);
    setSrc($('eyeimg'), `assets/eye/${String(fi + 1).padStart(4, '0')}.jpg`);
    const grow = prog(t, 3.9, 5.1);
    const zoom = 1 + eIn(prog(t, 5.02, 5.3)) * 5;
    const box = $('eyebox');
    const hh = lerp(6, 900, open);
    box.style.clipPath = open < 1 ? `ellipse(640px ${hh / 2}px at 540px 960px)` : 'none';
    box.style.transformOrigin = '330px 960px';
    box.style.transform = `scale(${(1 + grow * 0.12) * zoom})`;
    const tIn = prog(t, 4.66, 4.74);
    $('etxt').innerHTML = ROLE.stat; $('etxt').style.opacity = tIn * (1 - prog(t, 5.1, 5.22));
    $('etxt').style.textShadow = '0 2px 18px rgba(0,0,0,.35)';
    const fl = prog(t, 5.12, 5.28);
    $('flash').style.opacity = fl;
    $('etxt2').innerHTML = ROLE.stat; $('etxt2').style.opacity = fl;
    return;
  }
  // ---------- 5.30-7.80 roles
  if (t < 7.8) {
    show('Lroles');
    let stat = ROLE.stat, word = '', sel = false, typing = false, grey = false, x = false;
    const T = (s, a, per) => (t - a) / per;
    if (t < 5.35) word = '';
    else if (t < 6.35) { const n = T(0, 5.35, 0.045); word = typedSel(ROLE.w[0], n, n < 5.5); typing = n < 5.5; }
    else if (t < 6.53) { const k = 5 - Math.floor((t - 6.35) / 0.03); word = typedSel(ROLE.w[0], k, false); typing = true; }
    else if (t < 6.9) { const n = T(0, 6.55, 0.017); word = typedSel(ROLE.w[1], n, n < 15.5); typing = n < 15.5; }
    else if (t < 7.0) { const k = 15 - Math.floor((t - 6.9) / 0.0065); word = typedSel(ROLE.w[1], k, false); typing = true; }
    else if (t < 7.4) { const n = T(0, 7.0, 0.02); word = typedSel(ROLE.w[2], n, n < 11.5); typing = n < 11.5; grey = t > 7.3; x = t > 7.3; }
    else { stat = ROLE.stat2; const n = T(0, 7.42, 0.035); word = typedSel(ROLE.w2, n, n < 5.5); typing = n < 5.5; }
    const sq = t > 5.88 ? 'text-decoration:underline wavy #5fa892;text-decoration-thickness:3px;text-underline-offset:14px;' : '';
    const icon = (!typing && t > 5.7) ? `<svg width="26" height="26" viewBox="0 0 24 24" style="align-self:flex-start;margin:0 6px;transform:translateY(-6px)"><path d="M4 20l4-1 10-10-3-3L5 16l-1 4z" fill="none" stroke="#5fa892" stroke-width="2.2" stroke-linejoin="round"/></svg>` : dotCur(true);
    const xm = x ? `<span style="color:#5fa892;font-size:.5em;align-self:flex-start;margin:0 6px">×</span>` : (t > 7.4 ? dotCur(true) : icon);
    $('roles').innerHTML = `<span style="font-weight:300;${stat === ROLE.stat ? sq : 'text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:14px;'};margin-left:.28em">${stat}</span><span style="font-weight:700;display:inline-flex">${word}</span>${xm}`;
    $('roles').style.opacity = grey ? 0.42 : 1;
    const b = prog(t, 7.66, 7.8);
    $('roles').style.filter = b ? `blur(${b * 16}px)` : 'none';
    if (b) $('roles').style.opacity = 1 - b * 0.7;
    return;
  }
  // ---------- 7.80-9.50 name -> dot -> photo
  if (t < 9.5) {
    show('Lname');
    const bi = prog(t, 7.8, 7.95);
    $('nm2').innerHTML = `<span style="display:flex;gap:14px;direction:ltr;align-items:baseline"><span style="font-weight:300">بلانت</span><span style="font-weight:700">Planet</span></span>`;
    $('nm2').style.filter = `blur(${(1 - bi) * 12}px)`; $('nm2').style.opacity = bi;
    const c = $('circ');
    if (t >= 8.0) {
      const pop = eBack(prog(t, 8.0, 8.08));
      const g1 = eOut(prog(t, 8.14, 8.26)), g2 = eIn(prog(t, 8.26, 8.4));
      let r = lerp(9, 36, g1) * pop; r = lerp(r, 340, eOut(prog(t, 8.24, 8.32))); r = lerp(r, 1250, g2);
      const cx = lerp(560, 540, g1), cy = lerp(lerp(884, 900, g1), 900, g2);
      c.style.display = 'block'; c.style.width = c.style.height = 2 * r + 'px'; c.style.left = (cx - r) + 'px'; c.style.top = (cy - r) + 'px';
      c.style.background = t < 8.14 ? '#5fa892' : '#000';
      const ph = $('photo'); ph.style.left = (-(cx - r)) + 'px'; ph.style.top = (-(cy - r)) + 'px';
      ph.style.opacity = t < 8.14 ? 0 : 1;
      setSrc($('pimg'), `assets/por/${String(clamp(Math.floor((t - 8.14) * 30 + POR_OFF * 30), 0, POR_N - 1) + 1).padStart(4, '0')}.jpg`); $('pimg').style.transform = `scale(${lerp(1.12, 1.0, eOut(prog(t, 8.14, 9.5)))})`;
      const ci = prog(t, 8.36, 8.48);
      $('card').style.opacity = ci; $('card').style.transform = `translateY(${(1 - eOut(ci)) * 40}px)`;
      let tt = ''; TITLES.forEach((s, i) => { const a = prog(t, 8.58 + i * 0.19, 8.66 + i * 0.19); if (a > 0) tt += `${i ? '<span style="color:#92C5B4">  •  </span>' : ''}<span style="opacity:${a}">${s}</span>`; });
      $('titles').innerHTML = tt;
      $('nm2').style.opacity = bi * (1 - g2);
    } else c.style.display = 'none';
    $('dim').style.opacity = prog(t, 9.33, 9.47) * 0.9 + (t > 9.47 ? 0.1 : 0);
    return;
  }
  // ---------- 9.50-11.4 end
  show('Lend');
  const n = Math.floor((t - 9.56) / 0.045);
  const parts = [['THE', 700, '#fff'], [' ', 300, '#fff'], ['PLANET', 700, '#fff'], [' ', 300, '#fff'], ['CO', 300, '#cfd6d6'], ['.', 700, '#92C5B4']];
  let left = Math.max(0, n), h = '';
  for (const [s, w, c] of parts) { const k = Math.min(left, s.length); left -= k; if (k) h += `<span style="font-weight:${w};color:${c};letter-spacing:.38em">${s.slice(0, k)}</span>`; }
  $('endw').innerHTML = h;
};

document.fonts.ready
  .then(() => Promise.all(Array.from(document.images).map((i) => (i.complete ? 1 : new Promise((r) => (i.onload = i.onerror = r))))))
  .then(() => { window.ready = true; });
