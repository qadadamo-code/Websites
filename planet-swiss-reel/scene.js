// Planet "Swiss intro" reel: shot-for-shot remake of a 30s minimal type-led intro, in Planet brand.
// renderAt(t) draws the frame at time t (seconds). 1080x1920.
const W = 1080, H = 1920;
const DARK = '#0E1520', PAPER = '#E7EAE8', MINT = '#92C5B4', NAVY = '#143659', INK = '#0E1520', CREAM = '#F3EEE2';
const B = 60 / 112.5; // beat = 0.5333s
const st = document.getElementById('stage');
let HEAD = '';
fetch('assets/head.path').then(r => r.text()).then(d => { HEAD = d.trim(); window.ready = true; });

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eo5 = k => 1 - Math.pow(1 - k, 5);
const typed = (s, t, t0, cps) => { const a = [...s]; return a.slice(0, clamp(Math.floor((t - t0) * cps + 1e-6), 0, a.length)).join(''); };
const blink = (t) => (Math.floor(t * 3.2) % 2 === 0);
const cur = (col, on = true) => on ? `<span class="cur" style="background:${col}"></span>` : `<span class="cur" style="background:transparent"></span>`;
const mono = (txt, x, y, col, size = 20, align = 'left') => `<div class="ab mono" style="${align === 'right' ? `right:${W - x}px` : `left:${x}px`};top:${y}px;font-size:${size}px;color:${col}">${txt}</div>`;
const bg = c => `<div class="ab" style="inset:0;background:${c}"></div>`;
const WORD = (col, size, boldCol) => `<span class="lt" style="font-size:${size}px;color:${col};letter-spacing:-.02em"><span style="font-weight:300">The Planet </span><span style="font-weight:700;color:${boldCol || col}">Co.</span></span>`;

// ------------------------------------------------------------------ scenes
function sGrid(t, dark) {
  // construction grid: two horizontals, two verticals with ring markers, dashed centre
  const k = eo(prog(t, 0.05, 0.75));
  const col = dark ? 'rgba(255,255,255,.16)' : 'rgba(14,21,32,.16)';
  const y1 = 860, y2 = 1060, x1 = 300, x2 = 780;
  let h = '';
  h += `<div class="ab" style="left:0;top:${y1}px;width:${W * k}px;height:2px;background:${col}"></div>`;
  h += `<div class="ab" style="right:0;top:${y2}px;width:${W * k}px;height:2px;background:${col}"></div>`;
  h += `<div class="ab" style="left:${x1}px;top:0;width:2px;height:${H * k}px;background:${col}"></div>`;
  h += `<div class="ab" style="left:${x2}px;bottom:0;width:2px;height:${H * k}px;background:${col}"></div>`;
  h += `<div class="ab" style="left:540px;top:${700}px;width:0;height:${520 * k}px;border-left:2px dashed ${col}"></div>`;
  const m = prog(t, 0.45, 0.8);
  for (const [x, y] of [[x1, y1], [x2, y1], [x1, y2], [x2, y2]]) h += `<div class="ab" style="left:${x - 9}px;top:${y - 9}px;width:20px;height:20px;border-radius:50%;border:2px solid ${col};opacity:${m}"></div>`;
  return h;
}

function sHello(t) {
  // 1.07 - 2.0 : paper, typing أهلاً with guides + mono coordinates
  let h = bg(PAPER) + sGrid(9, false);
  const lab = 'rgba(14,21,32,.45)';
  h += mono('X 312', 316, 832, lab, 16) + mono('X 768', 796, 832, lab, 16) + mono('Y 960', 556, 1230, lab, 16) + mono('180 PX', 316, 1072, lab, 16);
  const s = typed('أهلاً', t, 1.1, 9);
  const done = t > 1.1 + 5 / 9;
  const dot = t > 1.78 ? `<span style="color:${MINT}">.</span>` : '';
  h += `<div class="c ar" style="top:820px;height:280px;font-size:210px;font-weight:700;color:${INK}">${s}${dot}${!dot ? cur(MINT, !done || blink(t)) : ''}</div>`;
  return h;
}

function sIm(t) {
  // 2.0 - 5.87 : إحنا -> name typed -> silhouette -> إحنا فريقك
  let h = bg(PAPER);
  // إحنا : big at 2.0, slides up + shrinks at 2.5
  const k = eio(prog(t, 2.5, 2.85));
  const imY = lerp(890, 700, k), imS = lerp(210, 72, k);
  if (t < 5.33) h += `<div class="c ar" style="top:${imY}px;height:${imS * 1.5}px;font-size:${imS}px;font-weight:700;color:${INK}">إحنا</div>`;
  // name typed (LTR wordmark), deleted at 4.55
  if (t >= 2.75 && t < 4.85) {
    const full = 'The Planet Co.';
    let n = clamp(Math.floor((t - 2.78) * 16), 0, full.length);
    if (t > 4.55) n = clamp(full.length - Math.floor((t - 4.55) * 48), 0, full.length);
    const a = full.slice(0, Math.min(n, 11)), b = n > 11 ? full.slice(11, n) : '';
    const typing = n < full.length;
    h += `<div class="c lt" style="top:850px;height:200px;font-size:128px;color:${INK};letter-spacing:-.025em"><span style="font-weight:300;white-space:pre">${a}</span><span style="font-weight:700">${b}</span>${typing ? cur(MINT) : ''}</div>`;
    // mono subtitle
    if (t > 3.45 && t < 4.55) h += `<div class="c mono" style="top:1035px;height:40px;font-size:22px;color:rgba(14,21,32,.62)">${typed('WEBSITES · BRANDING · MARKETING', t, 3.45, 40)}</div>`;
  }
  // silhouette rises at 4.0, then jumps to the right-bottom at 5.33
  if (t >= 3.95 && HEAD) {
    let sy, sx, sc;
    if (t < 5.33) { const r = eo5(prog(t, 3.95, 4.5)); sy = lerp(H + 50, 1150, r); sx = 450; sc = 1.0; }
    else { sy = 1330; sx = 140; sc = 0.85; }
    h += silhouette(sx, sy, sc);
  }
  if (t >= 5.33) {
    const s = typed('إحنا فريقك', t, 5.36, 26);
    h += `<div class="c ar" style="top:880px;height:180px;font-size:104px;font-weight:600;color:${INK}">${s}${cur(MINT)}</div>`;
  }
  return h;
}
function silhouette(x, y, sc) {
  // head.path is ~ 1080 px wide artwork; scale to ~ 560 px tall bust
  return `<svg class="ab" style="left:${x}px;top:${y}px;overflow:visible" width="10" height="10"><g transform="scale(${0.62 * sc}) translate(-120,-60)"><path d="${HEAD}" fill="${DARK}"/></g></svg>`;
}

const ROLES = [
  { a: 'تصميم', b: 'مواقع', bg: PAPER, fg: INK, acc: MINT, shape: 'sq' },
  { a: 'متاجر', b: 'إلكترونية', bg: DARK, fg: '#fff', acc: MINT, shape: 'sq' },
  { a: 'هوية', b: 'بصرية', bg: MINT, fg: NAVY, acc: '#fff', shape: 'tri' },
  { a: 'شريك', b: 'نجاحك', bg: NAVY, fg: '#fff', acc: MINT, shape: 'plus' },
];
function sRoles(t) {
  const i = clamp(Math.floor((t - 5.87) / B), 0, 3), r = ROLES[i];
  const lt = (t - 5.87) - i * B;
  let h = bg(r.bg);
  const lab = r.fg === '#fff' ? 'rgba(255,255,255,.55)' : 'rgba(14,21,32,.5)';
  h += mono('SERVICE', 64, 830, lab, 18) + mono(`0${i + 1} / 04`, W - 64, 830, lab, 18, 'right');
  const sh = r.shape === 'sq' ? `<span style="display:inline-block;width:22px;height:22px;background:${r.acc}"></span>`
    : r.shape === 'tri' ? `<svg width="26" height="24"><path d="M13 0 L26 24 L0 24Z" fill="${r.acc}"/></svg>`
      : `<svg width="26" height="26"><path d="M10 0h6v10h10v6H16v10h-6V16H0v-6h10z" fill="${r.acc}"/></svg>`;
  const pop = eo(prog(lt, 0, 0.12));
  h += `<div class="c ar" style="top:880px;height:180px;font-size:122px;color:${r.fg};transform:translateY(${(1 - pop) * 14}px)"><span style="font-weight:300">${r.a}&nbsp;</span><span style="font-weight:700">${r.b}</span><span style="position:relative;top:-46px;margin-right:12px;display:inline-flex">${sh}</span></div>`;
  return h;
}

function sName(t) {
  // 7.99 - 9.07 paper, wordmark then snaps tiny
  let h = bg(PAPER);
  const k = eio(prog(t, 8.62, 8.85));
  const s = lerp(132, 30, k);
  h += `<div class="c" style="top:${960 - s * .75}px;height:${s * 1.5}px">${WORD(INK, s)}</div>`;
  return h;
}

// ---------- icons (white, 44px)
const IC = {
  pen: '<path d="M4 40 L10 22 L30 2 L42 14 L22 34 Z M10 22 L22 34" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><circle cx="19" cy="25" r="3.5" fill="#fff"/>',
  move: '<path d="M22 2 L28 9 H24.5 V19.5 H35 V16 L42 22 L35 28 V24.5 H24.5 V35 H28 L22 42 L16 35 H19.5 V24.5 H9 V28 L2 22 L9 16 V19.5 H19.5 V9 H16 Z" fill="#fff"/>',
  cursor: '<path d="M6 2 L38 22 L24 25 L32 40 L26 43 L18 28 L8 37 Z" fill="#fff"/>',
  aa: '<rect x="1" y="5" width="42" height="34" rx="5" fill="#fff"/><text x="22" y="31" font-family="IT" font-weight="700" font-size="22" text-anchor="middle" fill="#143659">Aa</text>',
  eraser: '<path d="M4 30 L24 10 L38 24 L22 40 H12 Z" fill="#fff"/><path d="M4 30 L12 40" stroke="#143659" stroke-width="3"/><path d="M14 20 L28 34" stroke="#143659" stroke-width="3"/>',
  pin: '<path d="M26 2 L42 18 L36 20 L28 28 L28 36 L24 40 L4 20 L8 16 L16 16 L24 8 Z M14 30 L2 42" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>',
  swap: '<path d="M6 14 H36 M28 6 L36 14 L28 22 M38 30 H8 M16 22 L8 30 L16 38" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
  undo: '<path d="M10 14 A15 15 0 1 1 8 28" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M3 6 L10 15 L19 9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
  tri: '<path d="M22 4 L42 40 H2 Z" fill="#fff"/>',
  sq: '<rect x="5" y="5" width="34" height="34" fill="#fff"/>',
  zoom: '<circle cx="18" cy="18" r="13" fill="none" stroke="#fff" stroke-width="4.5"/><path d="M28 28 L41 41" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
  brush: '<path d="M40 3 L18 26 L23 31 L44 8 Z" fill="#fff"/><path d="M16 28 C8 28 8 36 3 41 C12 42 22 40 21 33 Z" fill="#fff"/>',
  T: '<rect x="2" y="2" width="40" height="40" rx="5" fill="#fff"/><path d="M12 12 H32 M22 12 V34" stroke="#143659" stroke-width="5"/>',
  drop: '<path d="M30 4 L40 14 L34 18 L14 38 L6 38 L6 30 L26 10 Z" fill="#fff"/>',
  bucket: '<path d="M6 20 L22 4 L38 20 L22 36 Z" fill="#fff"/><path d="M38 24 C42 30 44 34 40 38 C36 34 36 30 38 24 Z" fill="#fff"/>',
  crop: '<path d="M10 2 V34 H42 M2 10 H34 V42" fill="none" stroke="#fff" stroke-width="4.5"/>',
  frame: '<rect x="3" y="3" width="38" height="38" rx="4" fill="none" stroke="#fff" stroke-width="4.5"/><rect x="13" y="13" width="18" height="18" fill="#fff"/>',
};
const icon = (n, s = 54) => `<svg width="${s}" height="${s}" viewBox="0 0 44 44" style="flex:none">${IC[n]}</svg>`;
const icRow = (names, s = 46, gap = 26) => `<div style="display:flex;gap:${gap}px;justify-content:center;align-items:center">${names.map(n => icon(n, s)).join('')}</div>`;

function guidesCircle() {
  const c = 'rgba(255,255,255,.10)';
  return `<svg class="ab" style="left:0;top:0" width="${W}" height="${H}"><circle cx="540" cy="960" r="330" fill="none" stroke="${c}" stroke-width="2"/><circle cx="540" cy="960" r="190" fill="none" stroke="${c}" stroke-width="2"/><path d="M540 560 V1360 M150 960 H930" stroke="${c}" stroke-width="2"/></svg>`;
}
const brk = (col) => (inner) => `<span style="position:relative;display:inline-block;padding:0 10px">${inner}` +
  ['left:0;top:0;border-left:3px solid;border-top:3px solid', 'right:0;top:0;border-right:3px solid;border-top:3px solid', 'left:0;bottom:0;border-left:3px solid;border-bottom:3px solid', 'right:0;bottom:0;border-right:3px solid;border-bottom:3px solid']
    .map(s => `<span style="position:absolute;width:16px;height:16px;${s};border-color:${col}"></span>`).join('') + '</span>';

function sCreativity(t) {
  // 9.07 - 14.5 on navy
  let h = bg(NAVY) + guidesCircle();
  const F = 92, wc = '#fff';
  if (t < 10.5) {
    const l1a = 'الإبداع', l1b = t > 9.6 ? 'عندنا' : '';
    const sel = t > 9.6 && t < 10.05;
    const l2 = t > 10.0;
    const b1 = sel ? brk('rgba(255,255,255,.9)')(`<span style="color:${MINT}">${l1b}</span>`) : l1b;
    h += `<div class="c ar" style="top:${l2 ? 840 : 900}px;height:130px;font-size:${F}px;font-weight:400;color:${wc}">${l1a}${l1b ? '&nbsp;' : ''}${b1}</div>`;
    if (l2) h += `<div class="c ar" style="top:965px;height:130px;font-size:${F}px;font-weight:400;color:${wc}">زي&nbsp;${brk('#fff')(`<span style="color:${MINT}">لعبة</span>`)}،</div>`;
  } else if (t < 11.0) {
    // words turn into tool icons
    const k = prog(t, 10.5, 10.75);
    h += `<div class="c" style="top:850px;height:120px;gap:30px;direction:rtl">${icRow(['pen', 'move', 'cursor', 'aa'].slice(0, 1 + Math.floor(k * 3.99)))}<span class="ar" style="font-size:${F}px;color:#fff">${t < 10.75 ? 'عندنا' : ''}</span></div>`;
    h += `<div class="c ar" style="top:965px;height:130px;font-size:${F}px;color:#fff">زي&nbsp;${t < 10.62 ? 'لعبة،' : icRow(['swap', 'tri'], 44, 18)}</div>`;
  } else if (t < 12.9) {
    const sets = [[['pen', 'move', 'brush', 'aa'], ['eraser', 'crop', 'swap', 'tri']], [['frame', 'move', 'brush', 'sq'], ['eraser', 'pin', 'swap', 'undo']], [['zoom', 'brush', 'sq'], ['tri', 'pin', 'swap', 'undo']], [['zoom', 'brush', 'frame'], ['tri', 'pin', 'swap']], [['crop', 'brush', 'frame'], ['T', 'pin', 'swap']], [['T', 'drop', 'frame'], ['T', 'drop', 'bucket']]];
    const i = clamp(Math.floor((t - 11.0) / 0.32), 0, sets.length - 1), s = sets[i];
    const jig = Math.sin(t * 14) * 3;
    h += `<div class="c" style="top:${830 + jig}px;height:60px">${icRow(s[0])}</div>`;
    h += `<div class="c ar" style="top:900px;height:130px;font-size:${F}px;color:#fff">بنحب</div>`;
    h += `<div class="c" style="top:${1045 - jig}px;height:60px">${icRow(s[1])}</div>`;
  } else if (t < 13.6) {
    h += `<div class="c ar" style="top:840px;height:130px;font-size:${F}px;color:#fff">وأيوه، إحنا</div>`;
    const bold = t > 13.12;
    h += `<div class="c ar" style="top:965px;height:130px;font-size:${F}px;color:#fff">بنحب&nbsp;${bold ? `<b style="font-weight:700">نلعب</b><span style="color:${MINT}">.</span>` : ''}</div>`;
  } else {
    // نلعب centred big, then shrinks and slides right with mint dot
    const k = eio(prog(t, 13.95, 14.4));
    const fs = lerp(110, 60, k), x = lerp(0, 330, k);
    h += `<div class="c ar" style="top:${960 - fs * .7}px;height:${fs * 1.4}px;font-size:${fs}px;font-weight:700;color:#fff;transform:translateX(${x}px)">نلعب<span style="color:${MINT};font-size:.9em">${k > .5 ? '&nbsp;•' : '.'}</span></div>`;
    if (t > 14.3) h += wheel(t);
  }
  return h;
}

const SERV = ['مواقع احترافية', 'متاجر إلكترونية', 'هوية بصرية', 'سوشيال ميديا', 'إعلانات ممولة', 'منيو ذكي', 'تصوير منتجات', 'موشن جرافيك', 'تحسين محركات البحث', 'كتابة محتوى', 'استراتيجية تسويق'];
function wheel(t) {
  // rotating drum list left of "نلعب •"
  const fade = prog(t, 14.3, 14.8);
  const steps = (t - 14.6) / B; // one step per beat
  const base = Math.floor(steps), fr = steps - base;
  const pos = Math.max(0, base + eio(clamp(fr / 0.45)));
  const R = 330, A = 17 * Math.PI / 180;
  let h = `<div class="ab" style="left:0;top:0;width:${W}px;height:${H}px;opacity:${fade}">`;
  h += mono('SERVICES', 64, 360, 'rgba(255,255,255,.5)', 18) + mono('11', W - 64, 360, 'rgba(255,255,255,.5)', 18, 'right');
  if (t > 19.9) { const o = prog(t, 19.9, 20.2); h += `<div style="opacity:${o}">${mono('THE PLANET CO.', 64, 1560, 'rgba(255,255,255,.5)', 18)}${mono('03 / 11', W - 64, 1560, 'rgba(255,255,255,.5)', 18, 'right')}</div>`; }
  h += `<div class="ab" style="left:0;top:0;width:${W}px;height:${H}px;transform:rotate(-7deg);transform-origin:620px 960px">`;
  const N = SERV.length;
  for (let j = -6; j <= 6; j++) {
    const idx = Math.round(pos) + j;
    const ang = (idx - pos) * A;
    if (Math.abs(ang) > Math.PI / 2) continue;
    const y = 960 + R * Math.sin(ang), sy = Math.cos(ang);
    const name = SERV[((idx % N) + N) % N];
    const isC = Math.abs(idx - pos) < 0.5;
    const hl = t > 20.25 && isC;
    const op = isC ? 1 : 0.18 + 0.32 * Math.pow(sy, 3);
    h += `<div class="ab ar" style="right:${W - 600}px;top:${y - 40}px;height:80px;line-height:80px;font-size:58px;font-weight:${isC ? 500 : 400};color:${hl ? MINT : '#fff'};opacity:${op};transform:scaleY(${sy});white-space:nowrap">${name}</div>`;
  }
  return h + '</div></div>';
}

// ---------- rapid montage comps (all carry the wordmark)
const WM = (c, s = 96, bc) => `<div class="c" style="top:${960 - s * .75}px;height:${s * 1.5}px">${WORD(c, s, bc)}</div>`;
function circlesComp(bgc, line, txt) {
  let s = `<svg class="ab" style="left:0;top:0" width="${W}" height="${H}">`;
  for (const [x, y] of [[540, 580], [540, 1340], [160, 960], [920, 960], [540, 960]]) s += `<circle cx="${x}" cy="${y}" r="380" fill="none" stroke="${line}" stroke-width="2.5"/>`;
  for (const [x, y] of [[270, 690], [810, 690], [270, 1230], [810, 1230], [540, 960 - 380], [540, 1340]]) s += `<path d="M${x - 9} ${y - 9} L${x + 9} ${y + 9} M${x + 9} ${y - 9} L${x - 9} ${y + 9}" stroke="${line}" stroke-width="2.5"/>`;
  return bg(bgc) + s + '</svg>' + WM(txt);
}
function lineComp(bgc, line, txt) {
  return bg(bgc) + `<div class="ab" style="left:539px;top:300px;width:3px;height:520px;background:${line}"></div><div class="ab" style="left:539px;top:1100px;width:3px;height:520px;background:${line}"></div>
  <div class="ab" style="left:526px;top:282px;width:28px;height:28px;border-radius:50%;border:3px solid ${line}"></div><div class="ab" style="left:528px;top:1610px;width:24px;height:24px;border-radius:50%;background:${line}"></div>` +
    mono('WEB', 540 - 24, 236, line, 16) + mono('BRAND', 540 - 36, 1652, line, 16) + WM(txt);
}
function paletteComp(variant) {
  const rows = variant ? [['NAVY', NAVY, '#143659'], ['DEEP', '#0B2440', '#0B2440'], ['NIGHT', DARK, '#0E1520'], ['PAPER', PAPER, '#E7EAE8'], ['INK', '#1A2230', '#1A2230']]
    : [['MINT', MINT, '#92C5B4'], ['CREAM', CREAM, '#F3EEE2'], ['PAPER', '#F6F7F6', '#F6F7F6'], ['NIGHT', DARK, '#0E1520'], ['MIST', PAPER, '#E7EAE8']];
  let h = '';
  rows.forEach(([n, c, hex], i) => {
    const dark = ['NAVY', 'DEEP', 'NIGHT', 'INK'].includes(n);
    const lc = dark ? 'rgba(255,255,255,.6)' : 'rgba(14,21,32,.6)';
    h += `<div class="ab" style="left:0;top:${i * 384}px;width:${W}px;height:384px;background:${c}">${mono(n, 40, 24, lc, 16)}${mono(`HEX ${hex}<br>RGB · CMYK<br>PANTONE`, W - 40, 24, lc, 14, 'right')}</div>`;
  });
  return h + `<div class="c" style="top:${384 * 2 + 120}px;height:150px">${WORD(variant ? MINT : NAVY, 96)}</div>`;
}
function raysComp(bgc, ray, dots, txt) {
  let s = `<svg class="ab" style="left:0;top:0" width="${W}" height="${H}"><defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="${ray}" stop-opacity=".95"/><stop offset="1" stop-color="${ray}" stop-opacity="0"/></linearGradient><filter id="bl"><feGaussianBlur stdDeviation="16"/></filter></defs><g filter="url(#bl)">`;
  for (let i = -4; i <= 4; i++) s += `<path d="M0 960 L700 ${960 + i * 190 - 50} L700 ${960 + i * 190 + 50} Z" fill="url(#rg)"/>`;
  s += '</g>';
  for (let i = 0; i < 12; i++) { const y = 380 + i * 106, r = 28 - Math.abs(i - 3.5) * 1.6; s += `<circle cx="880" cy="${y}" r="${Math.max(10, r)}" fill="${dots}"/><circle cx="960" cy="${y + 50}" r="${Math.max(10, r - 2)}" fill="${dots}"/>`; }
  return bg(bgc) + s + '</svg>' + WM(txt, 92);
}
function linesArcComp(bgc, line, txt) {
  return bg(bgc) + `<svg class="ab" style="left:0;top:0" width="${W}" height="${H}"><path d="M380 0 V${H} M460 0 V${H} M700 0 V${H}" stroke="${line}" stroke-width="2.5"/><path d="M380 520 H460 M380 1400 H460 M100 960 H260" stroke="${line}" stroke-width="2.5"/><circle cx="1200" cy="960" r="480" fill="none" stroke="${line}" stroke-width="2.5"/></svg>` + WM(txt);
}
function posterComp(bgc, txt, lab, pat) {
  let p = '';
  for (let r = 0; r < 4; r++) for (let i = 0; i < 18; i++) p += `<div class="ab" style="left:${20 + i * 60}px;top:${1500 + r * 60}px;width:40px;height:14px;border-radius:7px;background:${pat}"></div>`;
  return bg(bgc) + mono('BUILT TO BE SEEN.<br>BUILT TO SELL.', 60, 540, lab, 22) + WM(txt) + mono('WEB · BRAND · MARKETING — 2026', 60, 1360, lab, 18) + `<div class="ab" style="left:0;top:1460px;width:${W}px;height:460px;background:rgba(0,0,0,.18)"></div>` + p;
}
function tiltComp(bgc, card, dot, sh, txt) {
  let d = '';
  for (const [x, y, r] of [[110, 140, 70], [520, 90, 56], [780, 330, 66], [160, 900, 90], [860, 700, 60]]) d += `<div class="ab" style="left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 1.5}px;border-radius:50%;background:${dot}"></div>`;
  return bg(bgc) + `<div class="ab" style="left:120px;top:1150px;width:300px;height:300px;background:${sh};transform:rotate(28deg) skewX(-14deg)"></div><div class="ab" style="left:380px;top:1180px;width:360px;height:260px;background:#fff;opacity:.9;transform:rotate(28deg) skewX(-14deg)"></div>
  <div class="ab" style="left:140px;top:560px;width:900px;height:800px;background:${card};transform:rotate(28deg) skewX(-16deg);box-shadow:0 60px 80px rgba(0,0,0,.35);overflow:hidden">${d}</div>` + WM(txt, 92);
}
function cardComp(g1, g2, card, txt, lab) {
  return `<div class="ab" style="inset:0;background:linear-gradient(${g1},${g2})"></div><div class="ab" style="left:120px;top:690px;width:840px;height:540px;background:${card};border-radius:14px;box-shadow:0 40px 90px rgba(0,0,0,.28)">${mono('WEB · BRAND · MARKETING', 40, 34, lab, 15)}${mono('2026', 800, 34, lab, 15, 'right')}${mono('THEPLANETCO.COM', 800, 490, lab, 15, 'right')}<div class="ab" style="left:40px;top:494px;width:14px;height:14px;border-radius:50%;background:${MINT}"></div></div>` + WM(txt, 92);
}
function selectComp(bgc, line, txt) {
  return bg(bgc) + mono('WEBSITE 01', 540 - 80, 560, line, 16) + `<div class="ab" style="left:250px;top:880px;width:580px;height:160px;border:2.5px solid ${line}"></div>` +
    [[250, 880], [830, 880], [250, 1040], [830, 1040]].map(([x, y]) => `<div class="ab" style="left:${x - 8}px;top:${y - 8}px;width:16px;height:16px;background:${bgc};border:2.5px solid ${line}"></div>`).join('') + WM(txt, 92) +
    `<div class="c" style="top:1400px;height:20px;gap:12px">${[1, 0, 0, 0].map(a => `<span style="width:10px;height:10px;border-radius:50%;background:${line};opacity:${a ? 1 : .4}"></span>`).join('')}</div>`;
}
function workComp(bgc, imgs, txtc, off) {
  // Planet's real client sites in three phone frames
  let h = bg(bgc);
  imgs.forEach((src, i) => {
    const x = 60 + i * 330, y = 520 + (i === 1 ? -80 : 40) + off;
    h += `<div class="ab" style="left:${x}px;top:${y}px;width:300px;height:650px;border-radius:40px;border:7px solid #0B1420;overflow:hidden;background:#000;box-shadow:0 40px 70px rgba(0,0,0,.35)"><img src="assets/work/${src}.jpg" style="width:100%;height:100%;object-fit:cover;object-position:top"></div>`;
  });
  return h + `<div class="c" style="top:1380px;height:120px">${WORD(txtc, 70)}</div>` + mono('SELECTED WORK', 64, 380, txtc, 18) + mono('2026', W - 64, 380, txtc, 18, 'right');
}
const COMPS = {
  A: () => circlesComp(MINT, 'rgba(20,54,89,.45)', NAVY),
  Bc: () => circlesComp(NAVY, 'rgba(255,255,255,.25)', '#fff'),
  C: () => lineComp(PAPER, INK, INK),
  D: () => lineComp(DARK, 'rgba(255,255,255,.8)', '#fff'),
  E: () => paletteComp(0),
  F: () => paletteComp(1),
  G: () => raysComp(DARK, '#F3E9CF', CREAM, '#fff'),
  Hh: () => raysComp('#F4F5F4', '#3C6E9E', NAVY, NAVY),
  I: () => linesArcComp(PAPER, 'rgba(14,21,32,.3)', INK),
  J: () => linesArcComp(DARK, 'rgba(255,255,255,.25)', '#fff'),
  K: () => posterComp(MINT, NAVY, 'rgba(20,54,89,.75)', 'rgba(20,54,89,.35)'),
  L: () => posterComp(NAVY, '#fff', 'rgba(255,255,255,.7)', 'rgba(146,197,180,.45)'),
  M: () => tiltComp('#E9ECEA', MINT, NAVY, DARK, NAVY),
  N: () => tiltComp('#161D29', NAVY, PAPER, '#000', '#fff'),
  O: () => cardComp('#F6F2EA', MINT, '#F7F8F7', INK, 'rgba(14,21,32,.55)'),
  P: () => cardComp('#0B2440', '#1F4F80', DARK, '#fff', 'rgba(255,255,255,.55)'),
  Q: () => selectComp(MINT, NAVY, NAVY),
  R: () => selectComp(NAVY, 'rgba(255,255,255,.85)', '#fff'),
  W1: () => workComp(PAPER, ['s03', 's08', 's12'], INK, 0),
  W2: () => workComp(NAVY, ['s15', 's19', 's22'], '#fff', 0),
  W3: () => workComp(MINT, ['s05', 's25', 's10'], NAVY, 0),
  W4: () => workComp(DARK, ['s01', 's17', 's24'], '#fff', 0),
};
const SEQ = ['A', 'Bc', 'C', 'D', 'E', 'F', 'G', 'Hh', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'W1', 'W2', 'E', 'F', 'K', 'L', 'M', 'N', 'W3', 'W4', 'C', 'D', 'I', 'J'];
function sMontage(t) {
  const i = clamp(Math.floor((t - 21.33) / (B / 4)), 0, SEQ.length - 1);
  return COMPS[SEQ[i]]();
}

function sEnd(t) {
  // 25.6 - 30 dark end card
  let h = bg(DARK);
  const lc = 'rgba(255,255,255,.85)';
  if (t < 25.95) {
    h += lineComp(DARK, lc, '#fff');
    return h;
  }
  const g = eo(prog(t, 25.95, 26.5));
  const s = lerp(92, 128, g);
  const up = eio(prog(t, 26.45, 26.7)) * 26;
  h += `<div class="c" style="top:${960 - s * .75 - up}px;height:${s * 1.5}px">${WORD('#F3F4F4', s)}</div>`;
  if (t > 26.6) h += `<div class="c mono" style="top:${1020}px;height:40px;font-size:24px;color:rgba(255,255,255,.62)">${typed('WEBSITES · BRANDING · MARKETING', t, 26.6, 38)}</div>`;
  // guides flash 27.35 - 28.6
  if (t > 27.35 && t < 28.6) {
    const k = eo(prog(t, 27.35, 27.6)), o = 1 - prog(t, 28.3, 28.6);
    const gc = `rgba(255,255,255,${.22 * o})`;
    h += `<div class="ab" style="left:${540 - 540 * k}px;top:888px;width:${W * k}px;height:2px;background:${gc}"></div><div class="ab" style="left:${540 - 540 * k}px;top:1000px;width:${W * k}px;height:2px;background:${gc}"></div>`;
    h += `<div class="ab" style="left:178px;top:${960 - 700 * k}px;width:2px;height:${1400 * k}px;background:${gc}"></div><div class="ab" style="left:902px;top:${960 - 700 * k}px;width:2px;height:${1400 * k}px;background:${gc}"></div>`;
    h += `<div style="opacity:${o * k}">${mono('X 178', 186, 862, 'rgba(255,255,255,.4)', 14)}${mono('X 902', 910, 862, 'rgba(255,255,255,.4)', 14)}${mono('128 PX', 186, 1008, 'rgba(255,255,255,.4)', 14)}</div>`;
  }
  // logo + contacts
  if (t > 28.1) {
    const k = eo(prog(t, 28.1, 28.5));
    h += `<svg class="ab" style="left:${540 - 46}px;top:${640 + (1 - k) * 20}px;opacity:${k}" width="92" height="92" viewBox="0 0 419 414"><path d="${PLOGO}" fill="${MINT}"/></svg><div class="ab" style="left:${540 + 34}px;top:${640 + 66 + (1 - k) * 20}px;width:22px;height:22px;border-radius:50%;background:#fff;opacity:${k}"></div>`;
    const k2 = eo(prog(t, 28.3, 28.7));
    h += `<div class="c lt" style="top:${1240 + (1 - k2) * 20}px;height:60px;font-size:40px;font-weight:500;color:#fff;opacity:${k2};letter-spacing:.01em">www.theplanetco.com</div>`;
    h += `<div class="c mono" style="top:${1310 + (1 - k2) * 20}px;height:40px;font-size:22px;color:${MINT};opacity:${k2}">WHATSAPP · 01203101104</div>`;
  }
  const fo = prog(t, 29.45, 30);
  if (fo > 0) h += `<div class="ab" style="inset:0;background:#000;opacity:${fo}"></div>`;
  return h;
}
const PLOGO = 'M 3 207.045 L 3 414.158 43.250 413.754 C 77.062 413.414, 84.460 413.080, 89.500 411.666 C 111.693 405.440, 127.708 389.436, 136.199 365 L 139.500 355.500 139.772 225.750 L 140.044 96 196.862 96 C 257.722 96, 261.970 96.313, 272.099 101.551 C 290.101 110.860, 297.302 138.725, 287.074 159.500 C 280.128 173.610, 266.280 180.974, 246.614 181.015 C 223.776 181.062, 206.885 192.216, 198.931 212.500 C 196.693 218.209, 196.561 219.896, 196.209 247.250 L 195.839 276 230.170 275.997 C 278.250 275.992, 297.667 273.770, 322.756 265.403 C 372.722 248.739, 402.968 215.662, 413.674 165.976 C 416.199 154.254, 416.203 123.352, 413.681 110.730 C 401.841 51.485, 360.489 15.813, 288.500 2.743 C 276.614 0.585, 275.206 0.561, 139.750 0.248 L 3 -0.068 3 207.045';

window.renderAt = function (t) {
  let h;
  if (t < 1.07) h = bg(DARK) + sGrid(t, true);
  else if (t < 2.0) h = sHello(t);
  else if (t < 5.87) h = sIm(t);
  else if (t < 7.99) h = sRoles(t);
  else if (t < 9.07) h = sName(t);
  else if (t < 21.33) h = sCreativity(t);
  else if (t < 25.6) h = sMontage(t);
  else h = sEnd(t);
  st.innerHTML = h;
};
