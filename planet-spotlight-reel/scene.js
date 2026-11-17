// Planet "spotlight" reel — shot-for-shot remake of a flashlight-reveal motion reel.
// renderAt(t) draws one frame (1080x1920). Everything procedural (canvas 2D).
const W = 1080, H = 1920, DUR = 10.0;
const NAVY = '#143659', MINT = '#92C5B4', MINT_D = '#3F9A80', DARK = '#050A12', PAPER = '#FBFCFC', INK = '#0F2236';
const cv = document.getElementById('c'), X = cv.getContext('2d');
const pg = document.createElement('canvas'); pg.width = W; pg.height = H; const P = pg.getContext('2d');
const acc = document.createElement('canvas'); acc.width = W; acc.height = H; const A = acc.getContext('2d');
const D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eOut = (k) => 1 - Math.pow(1 - clamp(k), 3);
const eIn = (k) => Math.pow(clamp(k), 3);
const seg = (t, a, b) => clamp((t - a) / (b - a));

// ---------- monotone cubic keyframe interpolation (no overshoot on holds) ----------
function mono(keys, ch) {
  const n = keys.length, xs = keys.map(k => k[0]), ys = keys.map(k => k[ch]);
  const d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const tau = 3 / Math.sqrt(s); m[i] = tau * a * d[i]; m[i + 1] = tau * b * d[i]; }
  }
  return (t) => {
    if (t <= xs[0]) return ys[0]; if (t >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (t > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], u = (t - xs[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h * m[i + 1];
  };
}
// torch path: [t, x, y, theta(deg, 0=up, clockwise), halfAngle, beamLength, scale]
const K = [
  [1.00, 540, 960, 0, 9, 3200, 1.0],
  [1.28, 548, 958, 7, 10, 3200, 1.0],
  [1.45, 470, 1050, -3, 12, 3200, 0.95],
  [1.62, 320, 1250, 16, 21, 3200, 0.88],
  [1.80, 122, 1528, 34, 30, 3200, 0.78],
  [1.92, 108, 1532, 36, 31.5, 3200, 0.76],
  [2.62, 100, 1542, 39, 31, 3200, 0.76],
  [2.71, 216, 1380, 32, 26, 3200, 0.78],
  [2.80, 460, 1010, 110, 24, 3200, 0.8],
  [2.90, 765, 550, 176, 23, 3200, 0.78],
  [3.00, 910, 333, 199, 22.5, 3200, 0.76],
  [3.10, 963, 279, 205, 22.5, 3200, 0.76],
  [3.76, 968, 276, 208, 22.5, 3200, 0.76],
  [3.85, 837, 288, 191, 25, 3200, 0.76],
  [3.92, 594, 318, 180, 30, 3200, 0.76],
  [4.00, 288, 360, 156, 28, 3200, 0.76],
  [4.10, 153, 414, 145, 27.6, 3200, 0.76],
  [4.76, 146, 420, 148, 27.6, 3200, 0.76],
  [4.85, 117, 432, 151, 25, 3200, 0.76],
  [4.92, 225, 594, 140, 22, 3200, 0.78],
  [5.00, 468, 964, 70, 20, 3200, 0.8],
  [5.10, 783, 1397, -14, 21, 3200, 0.78],
  [5.20, 927, 1631, -26, 22.7, 3200, 0.76],
  [5.30, 963, 1676, -28.5, 22.7, 3200, 0.76],
  [5.86, 966, 1680, -31, 22.7, 3200, 0.76],
  [5.93, 972, 1442, -70, 16, 3200, 0.76],
  [6.00, 958, 1063, -90, 9, 3200, 0.76],
  [6.13, 958, 990, -93, 6, 3000, 0.76],
  [6.20, 954, 950, -135, 5, 1400, 0.76],
  [6.27, 960, 952, -200, 3, 160, 0.76],
  [6.33, 963, 955, -270, 4, 110, 0.76],
  [6.53, 950, 955, -270, 8, 260, 0.78],
  [6.60, 621, 955, -270, 28, 1100, 0.8],
  [6.68, 150, 955, -270, 48, 2800, 0.8],
];
const KF = [1, 2, 3, 4, 5, 6].map(c => mono(K, c));
const torchAt = (t) => KF.map(f => f(t));

// ---------- icons (24-unit glyphs) ----------
const ICON = {
  mega: (c) => { c.beginPath(); c.moveTo(4, 10); c.lineTo(4, 14); c.lineTo(8, 14); c.lineTo(17, 19); c.lineTo(17, 5); c.lineTo(8, 10); c.closePath(); c.moveTo(7, 14); c.lineTo(8.5, 19.5); c.lineTo(11, 19.5); c.lineTo(10, 15); c.moveTo(19.5, 9.5); c.quadraticCurveTo(21.5, 12, 19.5, 14.5); c.stroke(); },
  chart: (c) => { c.beginPath(); c.moveTo(4, 20); c.lineTo(20, 20); c.moveTo(5, 16); c.lineTo(10, 11); c.lineTo(13.5, 14); c.lineTo(19.5, 6.5); c.moveTo(15.5, 6.5); c.lineTo(19.5, 6.5); c.lineTo(19.5, 10.5); c.stroke(); },
  target: (c) => { c.beginPath(); c.arc(12, 12, 8.5, 0, 7); c.stroke(); c.beginPath(); c.arc(12, 12, 4.8, 0, 7); c.stroke(); c.beginPath(); c.arc(12, 12, 1.6, 0, 7); c.fill(); },
  chat: (c) => { c.beginPath(); c.moveTo(4, 6.5); c.quadraticCurveTo(4, 4.5, 6, 4.5); c.lineTo(18, 4.5); c.quadraticCurveTo(20, 4.5, 20, 6.5); c.lineTo(20, 14); c.quadraticCurveTo(20, 16, 18, 16); c.lineTo(10, 16); c.lineTo(6, 19.5); c.lineTo(6.5, 16); c.quadraticCurveTo(4, 16, 4, 14); c.closePath(); c.moveTo(8, 9); c.lineTo(16, 9); c.moveTo(8, 12); c.lineTo(13, 12); c.stroke(); },
  heart: (c) => { c.beginPath(); c.moveTo(12, 19.5); c.bezierCurveTo(4, 14, 2.5, 9.5, 4.8, 6.6); c.bezierCurveTo(7, 3.9, 10.6, 4.8, 12, 7.6); c.bezierCurveTo(13.4, 4.8, 17, 3.9, 19.2, 6.6); c.bezierCurveTo(21.5, 9.5, 20, 14, 12, 19.5); c.closePath(); c.fill(); },
  cursor: (c) => { c.beginPath(); c.moveTo(6, 4); c.lineTo(18, 13); c.lineTo(12.5, 14); c.lineTo(15.5, 20); c.lineTo(13, 21); c.lineTo(10, 15); c.lineTo(6, 18.5); c.closePath(); c.stroke(); },
  code: (c) => { c.beginPath(); c.moveTo(8, 7); c.lineTo(3.5, 12); c.lineTo(8, 17); c.moveTo(16, 7); c.lineTo(20.5, 12); c.lineTo(16, 17); c.moveTo(13.5, 5.5); c.lineTo(10.5, 18.5); c.stroke(); },
  globe: (c) => { c.beginPath(); c.arc(12, 12, 8.5, 0, 7); c.moveTo(3.5, 12); c.lineTo(20.5, 12); c.stroke(); c.beginPath(); c.ellipse(12, 12, 3.8, 8.5, 0, 0, 7); c.stroke(); },
  bag: (c) => { c.beginPath(); c.moveTo(5, 8); c.lineTo(19, 8); c.lineTo(18, 20.5); c.lineTo(6, 20.5); c.closePath(); c.moveTo(9, 10.5); c.lineTo(9, 7); c.arc(12, 7, 3, Math.PI, 0); c.lineTo(15, 10.5); c.stroke(); },
  cart: (c) => { c.beginPath(); c.moveTo(3, 4.5); c.lineTo(6, 4.5); c.lineTo(8.2, 15); c.lineTo(18, 15); c.lineTo(20, 7.5); c.lineTo(7, 7.5); c.stroke(); c.beginPath(); c.arc(9.5, 19, 1.6, 0, 7); c.moveTo(18.1, 19); c.arc(16.5, 19, 1.6, 0, 7); c.stroke(); },
  card: (c) => { c.beginPath(); c.roundRect(3, 6, 18, 12.5, 2.2); c.moveTo(3, 10); c.lineTo(21, 10); c.moveTo(6.5, 15); c.lineTo(10, 15); c.stroke(); },
  pen: (c) => { c.beginPath(); c.moveTo(12, 3); c.lineTo(18, 11); c.lineTo(14.5, 20); c.lineTo(9.5, 20); c.lineTo(6, 11); c.closePath(); c.moveTo(12, 3); c.lineTo(12, 13); c.stroke(); c.beginPath(); c.arc(12, 14.2, 1.4, 0, 7); c.stroke(); },
  palette: (c) => { c.beginPath(); c.moveTo(12, 3.5); c.bezierCurveTo(4.5, 3.5, 2.5, 11, 4.5, 15.5); c.bezierCurveTo(6, 19, 10, 17, 11, 18.5); c.bezierCurveTo(12, 20.5, 13.5, 20.8, 15, 20.3); c.bezierCurveTo(20.5, 18.5, 21.5, 12.5, 19.5, 8.5); c.bezierCurveTo(18, 5.3, 15.2, 3.5, 12, 3.5); c.stroke(); for (const [x, y] of [[8, 10.5], [11.5, 7.5], [15.5, 8.8]]) { c.beginPath(); c.arc(x, y, 1.3, 0, 7); c.fill(); } },
  type: (c) => { c.save(); c.font = '700 13px IT'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Aa', 12, 12.8); c.restore(); },
  qr: (c) => { for (const [x, y] of [[4, 4], [14, 4], [4, 14]]) { c.beginPath(); c.roundRect(x, y, 6, 6, 1.2); c.stroke(); } c.fillRect(14.5, 14.5, 2.4, 2.4); c.fillRect(18, 18, 2.4, 2.4); c.fillRect(18, 14.5, 2.4, 2.4); c.fillRect(14.5, 18, 2.4, 2.4); },
  phone: (c) => { c.beginPath(); c.roundRect(7, 3, 10, 18, 2.4); c.moveTo(10.5, 18); c.lineTo(13.5, 18); c.stroke(); },
  fork: (c) => { c.beginPath(); c.moveTo(7, 3.5); c.lineTo(7, 9); c.moveTo(10, 3.5); c.lineTo(10, 9); c.moveTo(4, 3.5); c.lineTo(4, 9); c.quadraticCurveTo(4, 11.5, 7, 11.5); c.quadraticCurveTo(10, 11.5, 10, 9); c.moveTo(7, 11.5); c.lineTo(7, 20.5); c.moveTo(17, 20.5); c.lineTo(17, 3.5); c.quadraticCurveTo(13.5, 6, 13.8, 12); c.lineTo(17, 12.5); c.stroke(); },
};
function tile(c, x, y, kind, filled, a, s = 1) {
  if (a <= 0) return;
  const sz = (filled ? 84 : 76) * s;
  c.save(); c.globalAlpha = a; c.translate(x, y);
  c.beginPath(); c.roundRect(-sz / 2, -sz / 2, sz, sz, 15 * s);
  if (filled) { c.fillStyle = MINT; c.fill(); }
  else { c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = 'rgba(15,34,54,.55)'; c.stroke(); }
  const g = sz * 0.5 / 24; c.translate(-12 * g, -12 * g); c.scale(g, g);
  c.lineWidth = 1.9; c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = c.fillStyle = filled ? NAVY : 'rgba(15,34,54,.8)';
  ICON[kind](c); c.restore();
}

// ---------- scenes (what the light reveals) ----------
const SC = [
  { a: 1.55, b: 2.80, ar: 'تسويق', en: 'marketing', x: 560, y: 860, blush: [980, 120], icons: [[459, 678, 'mega', 0], [954, 666, 'chart', 0], [627, 1150, 'target', 1]] },
  { a: 2.88, b: 3.88, ar: 'منصّات', en: 'social media', fs: 140, dx: 40, x: 500, y: 1035, blush: [60, 1850], icons: [[175, 1062, 'chat', 0], [783, 855, 'heart', 1], [552, 1422, 'phone', 0]] },
  { a: 3.92, b: 4.95, ar: 'هويّة', en: 'branding', x: 440, y: 1105, blush: [120, 1800], icons: [[306, 892, 'pen', 0], [981, 1424, 'palette', 1], [470, 1405, 'type', 0]] },
  { a: 5.05, b: 6.08, ar: 'مواقع', en: 'web & apps', fs: 150, dx: 120, x: 440, y: 990, blush: [80, 80], icons: [[189, 865, 'cursor', 0], [630, 712, 'code', 0], [801, 1252, 'globe', 1]] },
];
function blush(c, x, y, r, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(146,197,180,${0.42 * a})`); g.addColorStop(0.45, `rgba(146,197,180,${0.16 * a})`); g.addColorStop(1, 'rgba(146,197,180,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function grid(c, a) {
  c.save(); c.strokeStyle = `rgba(20,54,89,${0.045 * a})`; c.lineWidth = 2;
  for (let x = 30; x < W; x += 140) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  for (let y = 40; y < H; y += 140) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.restore();
}
function word(c, s, t) {
  const kin = seg(t, s.a, s.a + 0.22), kout = seg(t, s.b - 0.02, s.b + 0.12);
  const a = eOut(kin) * (1 - kout); if (a <= 0) return;
  c.save();
  // bold Arabic word, fades in from soft grey with a little blur (like the reference)
  c.globalAlpha = a; c.filter = `blur(${(1 - eOut(kin)) * 10 + kout * 8}px)`;
  c.direction = 'rtl'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = '700 150px Plex'; c.fillStyle = INK;
  const lift = (1 - eOut(kin)) * 26;
  c.fillText(s.ar, s.x, s.y + 40 + lift);
  const wA = c.measureText(s.ar).width;
  // Latin script word overlapping, offset to the right and lower
  c.direction = 'ltr'; c.textAlign = 'center'; c.font = `${s.fs || 160}px Script`; c.fillStyle = MINT_D;
  const k2 = eOut(seg(t, s.a + 0.06, s.a + 0.34));
  c.globalAlpha = a * k2;
  c.fillText(s.en, s.x + (s.dx ?? wA * 0.3), s.y + 112 + (1 - k2) * 20);
  c.restore();
  // icons pop in, staggered
  s.icons.forEach(([x, y, k, f], i) => {
    const ki = eOut(seg(t, s.a + 0.1 + i * 0.06, s.a + 0.3 + i * 0.06));
    tile(c, x, y, k, f, ki * (1 - kout), 0.8 + 0.2 * ki);
  });
}
// P logo (from the brand vector) + mint dot
const PPATH = new Path2D('M 3 207.045 L 3 414.158 43.250 413.754 C 77.062 413.414, 84.460 413.080, 89.500 411.666 C 111.693 405.440, 127.708 389.436, 136.199 365 L 139.500 355.500 139.772 225.750 L 140.044 96 196.862 96 C 257.722 96, 261.970 96.313, 272.099 101.551 C 290.101 110.860, 297.302 138.725, 287.074 159.500 C 280.128 173.610, 266.280 180.974, 246.614 181.015 C 223.776 181.062, 206.885 192.216, 198.931 212.500 C 196.693 218.209, 196.561 219.896, 196.209 247.250 L 195.839 276 230.170 275.997 C 278.250 275.992, 297.667 273.770, 322.756 265.403 C 372.722 248.739, 402.968 215.662, 413.674 165.976 C 416.199 154.254, 416.203 123.352, 413.681 110.730 C 401.841 51.485, 360.489 15.813, 288.500 2.743 C 276.614 0.585, 275.206 0.561, 139.750 0.248 L 3 -0.068 3 207.045');
function logo(c, cx, cy, size, t0, t) {
  // emblem: navy ring + P + mint dot
  const s = size / 419;
  c.save(); c.translate(cx, cy);
  c.lineWidth = 9; c.strokeStyle = NAVY; c.beginPath(); c.arc(0, 0, size * 0.78, 0, 7); c.stroke();
  c.save(); c.scale(s * 0.86, s * 0.86); c.translate(-215, -207); c.fillStyle = NAVY; c.fill(PPATH); c.restore();
  const dk = t0 == null ? 1 : eOut(seg(t, t0, t0 + 0.25));
  c.fillStyle = MINT; c.beginPath(); c.arc(size * 0.306, size * 0.318, size * 0.105 * (0.4 + 0.6 * dk) * (1 + 0.25 * Math.sin(dk * Math.PI)), 0, 7); c.fill();
  c.restore();
}
function endPage(c, t) {
  c.fillStyle = PAPER; c.fillRect(0, 0, W, H); grid(c, 1); blush(c, 1080, 1920, 1100, 1);
  logo(c, 540, 905, 190, null, t);
  // end-card extras (after the reveal)
  const k1 = eOut(seg(t, 7.05, 7.45)), k2 = eOut(seg(t, 7.35, 7.75)), k3 = eOut(seg(t, 7.7, 8.1));
  c.save(); c.textAlign = 'center';
  c.globalAlpha = k1; c.direction = 'rtl'; c.font = '700 64px Plex'; c.fillStyle = INK; c.fillText('بلانت', 540 - 0, 1180 + (1 - k1) * 20);
  c.direction = 'ltr'; c.font = '500 27px Mono'; c.fillStyle = MINT_D; c.letterSpacing = '6px'; c.fillText('PLANET CREATIVE MARKETING', 543, 1236 + (1 - k1) * 20); c.letterSpacing = '0px';
  c.globalAlpha = k2; c.direction = 'rtl'; c.font = '600 46px Plex'; c.fillStyle = 'rgba(15,34,54,.78)'; c.fillText('وكالة تسويق متكاملة', 540, 1350 + (1 - k2) * 16); c.font = '400 38px Plex'; c.fillStyle = 'rgba(15,34,54,.6)'; c.fillText('بنسلّط الضوء على مشروعك', 540, 1416 + (1 - k2) * 16);
  c.globalAlpha = k3; c.direction = 'ltr'; c.font = '500 34px IT'; c.fillStyle = NAVY;
  c.fillText('theplanetco.com', 540, 1640 + (1 - k3) * 14);
  c.font = '700 38px IT'; c.fillStyle = INK; c.textAlign = 'left'; c.fillText('01203101104', 548, 1702 + (1 - k3) * 14); c.direction = 'rtl'; c.textAlign = 'right'; c.font = '600 36px Plex'; c.fillText('واتساب', 528, 1700 + (1 - k3) * 14);
  c.restore();
}
function drawPage(c, t) {
  if (t >= 6.22) { endPage(c, t); return; }
  c.fillStyle = PAPER; c.fillRect(0, 0, W, H); grid(c, 0.6);
  // blush follows the active scene
  let bi = 0; for (let i = 0; i < SC.length; i++) if (t >= SC[i].a - 0.15) bi = i;
  blush(c, SC[bi].blush[0], SC[bi].blush[1], 1000, 1);
  for (const s of SC) if (t > s.a - 0.01 && t < s.b + 0.2) word(c, s, t);
}

// ---------- the flashlight ----------
function torch(c, x, y, th, s, headOff = null) {
  // pivot = lens. local -y = beam direction. head is a half-disc (flat side to the beam), body a rounded capsule.
  const r = 25 * s, gap = 6 * s, w = 52 * s, len = 74 * s;
  c.save(); c.translate(x, y); c.rotate(th * D2R);
  c.fillStyle = '#F4F7F6';
  c.beginPath(); c.roundRect(-w / 2, r + gap, w, len, 17 * s); c.fill();
  if (!headOff) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI); c.closePath(); c.fill(); }
  c.restore();
  if (headOff) { // detached spinning head (intro)
    c.save(); c.translate(headOff[0], headOff[1]); c.rotate(headOff[2] * D2R);
    c.fillStyle = '#F4F7F6'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI); c.closePath(); c.fill(); c.restore();
  }
}
function glow(c, x, y, r, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,255,255,${0.55 * a})`); g.addColorStop(0.35, `rgba(220,240,234,${0.18 * a})`); g.addColorStop(1, 'rgba(146,197,180,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
}
function beamPath(c, x, y, th, ha, L) {
  const a1 = (th - ha) * D2R, a2 = (th + ha) * D2R;
  c.beginPath(); c.moveTo(x, y);
  c.lineTo(x + Math.sin(a1) * L, y - Math.cos(a1) * L);
  if (L < 3000) { // short beam: rounded front
    const steps = 10; for (let i = 1; i < steps; i++) { const a = lerp(a1, a2, i / steps); c.lineTo(x + Math.sin(a) * L, y - Math.cos(a) * L); }
  }
  c.lineTo(x + Math.sin(a2) * L, y - Math.cos(a2) * L); c.closePath();
}

function frame(c, t) {
  c.fillStyle = DARK; c.fillRect(0, 0, W, H);
  if (t < 1.0) { intro(c, t); return; }
  if (t >= 6.70) { // full reveal
    drawPage(c, t);
    const f = 1 - eOut(seg(t, 6.70, 6.95)); // white flash on the hit
    if (f > 0) { c.fillStyle = `rgba(255,255,255,${0.85 * f})`; c.fillRect(0, 0, W, H); }
    return;
  }
  const [x, y, th, ha, L, s] = torchAt(t);
  // flicker when switching on
  let on = 1; if (t < 1.12) on = t < 1.033 ? 0.95 : t < 1.066 ? 0.55 : t < 1.09 ? 0.85 : 1;
  drawPage(P, t);
  c.save(); beamPath(c, x, y, th, ha, L); c.clip(); c.globalAlpha = on; c.drawImage(pg, 0, 0); c.restore();
  // soft edge glow along the beam source
  glow(c, x, y, 120 * s, on);
  torch(c, x, y, th, s);
}
function intro(c, t) {
  // body tossed in from the bottom, cap flips into the air, spins, lands, then the light turns on (t=1.0)
  const restX = 540, restY = 960;
  let bx, by, br;
  if (t < 0.13) { const k = eOut(t / 0.13); bx = lerp(510, 560, k); by = lerp(1750, 800, k); br = lerp(-40, 22, k); }
  else if (t < 0.62) { const k = ease(seg(t, 0.13, 0.62)); bx = lerp(560, restX, k); by = lerp(800, restY, k); br = lerp(22, 0, k); }
  else { bx = restX; by = restY; br = 0; }
  // little squash/bounce when the cap lands
  const land = seg(t, 0.93, 1.0); by += Math.sin(land * Math.PI) * 8;
  let head = null;
  if (t > 0.2 && t < 0.93) {
    const k = seg(t, 0.2, 0.93);
    const up = eOut(seg(t, 0.2, 0.42)), down = eIn(seg(t, 0.72, 0.93));
    const hy = lerp(lerp(by, 545, up), restY, down);
    const hx = restX + Math.sin(k * Math.PI * 2.2) * 34 * (1 - down);
    const hr = 900 * (1 - Math.pow(1 - k, 1.6)) - 900 + 0; // spins, ends upright
    head = [hx, hy, hr];
  }
  torch(c, bx, by, br, 1.0, head);
}

window.renderAt = (t) => {
  // motion blur: average 5 sub-frames over a 1/60s shutter
  const N = 16, sh = 1 / 60;
  A.clearRect(0, 0, W, H);
  for (let i = 0; i < N; i++) {
    const ti = t - sh / 2 + sh * (i + 0.5) / N;
    frame(X, Math.max(0, ti));
    A.globalAlpha = 1 / (i + 1); A.drawImage(cv, 0, 0);
  }
  A.globalAlpha = 1; X.drawImage(acc, 0, 0);
};
window.DUR = DUR;
document.fonts.load('700 150px Plex', 'مواقع').then(() => Promise.all([
  document.fonts.load('178px Script', 'websites'), document.fonts.load('500 30px Mono', 'A'), document.fonts.load('500 34px IT', 'a'), document.fonts.load('700 38px IT', '0'),
  document.fonts.load('600 46px Plex', 'ب')])).then(() => { window.ready = true; });
