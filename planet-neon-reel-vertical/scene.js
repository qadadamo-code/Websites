// Planet neon reel — shot-for-shot remake of a 37.8s neon brand film, Planet content.
// renderAt(t) draws one frame at time t (seconds) on a 1920x1080 canvas.
const W = 1080, H = 1920, DUR = 37.8;
const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
const BG = '#0A0F1D';
const MINT = '#92C5B4', AQUA = '#5FE6D2', SKY = '#5FA8FF', BLUE = '#3346FF', DEEP = '#3A1FD6', WARM = '#FFE6B0', GOLD = '#FFA94D', WHITE = '#FFFFFF', LILAC = '#A35CFF', PINK = '#F45CE8';

// ---------- helpers
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, x) => a + (b - a) * x;
const eo = (x) => 1 - Math.pow(1 - x, 3);
const ei = (x) => x * x * x;
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eback = (x) => { const c = 1.7; return Math.max(0, 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2)); };
const hash = (n) => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const win = (t, a, b, fi = 0.12, fo = 0.12) => Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function lin(x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function conic(a, cx, cy, stops) { const g = ctx.createConicGradient(a, cx, cy); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function rad(cx, cy, r, stops) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); stops.forEach((s) => g.addColorStop(s[0], s[1])); return g; }
function cloud(cx, cy, rx, ry, color, a) { // soft glow ellipse
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(cx, cy); ctx.scale(1, ry / rx);
  ctx.fillStyle = rad(0, 0, rx, [[0, rgba(color, a)], [0.45, rgba(color, a * 0.45)], [1, rgba(color, 0)]]);
  ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill(); ctx.restore();
}
function rrPath(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function rrLen(w, h, r) { r = Math.min(r, w / 2, h / 2); return 2 * (w + h - 4 * r) + 2 * Math.PI * r; }
// neon stroke: path() must build the path (beginPath included)
function neon(path, style, w, o = {}) {
  const a = o.alpha ?? 1, g = o.glow ?? 1, core = (o.core ?? 0.85) * 0.35;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
  if (o.dash) ctx.setLineDash(o.dash), (ctx.lineDashOffset = o.dashOff || 0);
  const passes = [[w * 10, 40 * g, 0.5], [w * 3.6, 12 * g, 0.95], [w * 1.4, 1.5, 1.0]];
  for (const [lw, b, al] of passes) { ctx.filter = `blur(${b}px)`; ctx.globalAlpha = al * a; ctx.strokeStyle = style; ctx.lineWidth = lw; path(); ctx.stroke(); }
  ctx.filter = 'none';
  if (core > 0) { ctx.globalAlpha = a * core; ctx.strokeStyle = o.coreColor || 'rgba(255,255,255,0.9)'; ctx.lineWidth = Math.max(1, w * 0.32); path(); ctx.stroke(); }
  ctx.restore();
}
// ---------- text
const F = (size, wt = 400) => `${wt} ${size}px R`;
function measure(s, size, wt) { ctx.font = F(size, wt); ctx.direction = 'rtl'; return ctx.measureText(s).width; }
// runs: [{s, wt, fill}] drawn RTL, right edge at xr, baseline-middle at y. typed: 0..1
function drawRuns(runs, xr, y, size, o = {}) {
  const typed = o.typed ?? 1, alpha = o.alpha ?? 1, bloom = o.bloom ?? 0.45, t = o.t || 0;
  const total = runs.reduce((n, r) => n + Array.from(r.s).length, 0);
  let left = Math.round(total * clamp(typed));
  let x = xr; let lead = xr;
  ctx.save(); ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const r of runs) {
    const ch = Array.from(r.s); const n = Math.min(left, ch.length); left -= n;
    const fullW = measure(r.s, size, r.wt || 400);
    if (n > 0) {
      const sub = ch.slice(0, n).join(''); ctx.font = F(size, r.wt || 400);
      const sw = ctx.measureText(sub).width;
      const fill = typeof r.fill === 'function' ? r.fill(x, sw) : (r.fill || '#F4F7FA');
      if (bloom > 0) { ctx.save(); ctx.filter = `blur(${size * 0.22}px)`; ctx.globalAlpha = alpha * bloom; ctx.fillStyle = fill; ctx.fillText(sub, x, y); ctx.restore(); }
      ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fillText(sub, x, y);
      lead = x - sw;
    }
    x -= fullW;
  }
  ctx.restore();
  if (typed > 0 && typed < 1 && o.glitch !== false) glitch(lead, y, size, t, alpha);
  return { lead, left: x, width: xr - x };
}
const GL = ['ب', 'ت', 'ن', 'ي', 'م', 'ك', 'ـ', 'ه', 'ة', 'ر'];
function glitch(x, y, size, t, a) {
  const k = Math.floor(t * 24);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.textBaseline = 'middle'; ctx.textAlign = 'right'; ctx.direction = 'rtl';
  for (let i = 0; i < 2; i++) {
    const c = GL[Math.floor(hash(k * 3 + i) * GL.length)];
    ctx.font = F(size * (0.7 + 0.3 * hash(k + i * 7)), 400);
    ctx.fillStyle = i ? rgba(SKY, 0.8 * a) : rgba(AQUA, 0.95 * a);
    ctx.filter = `blur(${i ? 2 : 0.6}px)`;
    ctx.fillText(c, x - 2 - i * size * 0.35 + (hash(k * 5 + i) - 0.5) * 6, y + (hash(k * 9 + i) - 0.5) * size * 0.5);
  }
  ctx.restore();
}
function textC(s, cx, y, size, o = {}) { // centered single run
  if (size < 60) size = Math.round(size * 1.55);
  const w = measure(s, size, o.wt || 400);
  return drawRuns([{ s, wt: o.wt || 400, fill: o.fill }], cx + w / 2, y, size, o);
}
// ---------- cursor (navigation arrow pointing up-left)
function cursor(x, y, s, o = {}) {
  const a = o.alpha ?? 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  const p = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(36, 13); ctx.lineTo(17, 18); ctx.lineTo(12, 37); ctx.closePath(); };
  if (o.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(10px)'; ctx.globalAlpha = a * o.glow; ctx.fillStyle = o.fill || WHITE; p(); ctx.fill(); ctx.restore(); }
  ctx.globalAlpha = a; p();
  ctx.fillStyle = o.fill || 'rgba(10,15,29,0.85)'; ctx.fill();
  ctx.lineJoin = 'round'; ctx.lineWidth = 2.6 / Math.max(s, 0.4); ctx.strokeStyle = o.stroke || 'rgba(230,236,245,0.95)'; ctx.stroke();
  ctx.restore();
}
function star4(x, y, r, o = {}) { // 4-point sparkle
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.quadraticCurveTo(Math.cos(a - Math.PI / 4) * r * 0.16, Math.sin(a - Math.PI / 4) * r * 0.16, Math.cos(a) * r, Math.sin(a) * r); }
  ctx.quadraticCurveTo(Math.cos(-Math.PI / 4) * r * 0.16, Math.sin(-Math.PI / 4) * r * 0.16, r, 0);
  ctx.closePath(); ctx.restore();
}
function sparkle(x, y, r, o = {}) {
  const a = o.alpha ?? 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (o.fill) {
    ctx.filter = `blur(${r * 0.35}px)`; ctx.globalAlpha = a * 0.8; ctx.fillStyle = o.fill; star4(x, y, r * 1.15, o); ctx.fill();
    ctx.filter = 'none'; ctx.globalAlpha = a; ctx.fillStyle = o.fill; star4(x, y, r, o); ctx.fill();
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = WHITE; star4(x, y, r * 0.45, o); ctx.fill();
  } else {
    ctx.filter = 'blur(3px)'; ctx.globalAlpha = a * 0.6; ctx.strokeStyle = WHITE; ctx.lineWidth = 3; star4(x, y, r, o); ctx.stroke();
    ctx.filter = 'none'; ctx.globalAlpha = a; ctx.lineWidth = 1.8; star4(x, y, r, o); ctx.stroke();
  }
  ctx.restore();
}
// ---------- assets
const IMG = {}; function img(n, src) { const i = new Image(); i.src = src; IMG[n] = i; return new Promise((r) => (i.onload = r)); }
let PPATH = null;
// =====================================================================
// SHOTS
// =====================================================================
// S1 0-2.05: big typing "كل مشروع بيبدأ" -> shrinks -> "... بـفكرة." -> disperses
function s1(t) {
  const sh = eio(seg(t, 0.8, 0.98));
  const big = 104, small = 56;
  const size = lerp(big, small, sh);
  const wt = sh < 0.5 ? 600 : 400;
  const head = 'كل ', mid = 'مشروع بيبدأ', tail = ' بـ', key = 'فكرة.';
  const wBig = measure(head + mid, big, 600);
  const wSmall = measure(head + mid + tail, small, 400) + measure(key, small, 700);
  const xr = lerp(W * 0.5 + wBig / 2, W / 2 + wSmall / 2, sh);
  const nHM = Array.from(head + mid).length, nAll = Array.from(head + mid + tail + key).length;
  const typedChars = t < 0.8 ? lerp(1, nHM, eo(seg(t, 0.02, 0.78))) : lerp(nHM, nAll, seg(t, 1.0, 1.5));
  const disp = seg(t, 1.84, 2.05);
  const tint = seg(t, 1.6, 1.85);
  const headFill = (x, w) => (sh < 1 ? lin(x - w, 0, x, 0, [rgba(AQUA, 1 - sh), rgba(WARM, 1 - sh * 0.2)]) : lin(x - w, 0, x, 0, [tint > 0 ? AQUA : '#F4F7FA', '#F4F7FA']));
  const baseFill = tint > 0 ? lin(xr - wSmall, 0, xr, 0, [rgba(AQUA, 1), rgba(SKY, 1)]) : '#F4F7FA';
  ctx.save();
  if (disp > 0) { ctx.filter = `blur(${disp * 6}px)`; }
  const r = drawRuns([
    { s: head, wt, fill: headFill }, { s: mid, wt, fill: tint > 0 ? baseFill : '#F4F7FA' },
    { s: tail, wt: 400, fill: baseFill }, { s: key, wt: sh < 0.5 ? 600 : 700, fill: tint > 0 ? baseFill : WHITE },
  ], xr, H * 0.5, size, { typed: typedChars / nAll, alpha: 1 - disp, bloom: lerp(0.55, 0.35, sh), t, glitch: !(t > 0.78 && t < 1.0) && t < 1.52 });
  ctx.restore();
  if (disp > 0) { // particles
    for (let i = 0; i < 26; i++) {
      const px = lerp(xr - wSmall, xr, hash(i)), py = H * 0.5 + (hash(i + 40) - 0.5) * 18;
      const dx = (hash(i + 9) - 0.5) * 160 * disp, dy = (hash(i + 19) - 0.5) * 50 * disp;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = (1 - disp) * 0.9; ctx.fillStyle = i % 3 ? LILAC : AQUA;
      ctx.beginPath(); ctx.arc(px + dx, py + dy, 2.2 + hash(i + 3) * 2, 0, 7); ctx.fill(); ctx.restore();
    }
  }
  // cursor
  const cs = lerp(1.7, 1.0, sh);
  const cx = r.lead - lerp(40, 26, sh), cy = H * 0.5 + lerp(84, 40, sh);
  let fill = null, glow = 0;
  if (t > 1.3) { fill = t < 1.55 ? GOLD : t < 1.75 ? BLUE : MINT; glow = 0.8; }
  if (t < 1.95) cursor(Math.min(cx, W * 0.9), cy, cs, { fill, glow, alpha: 1 - seg(t, 1.85, 1.95) });
}
// S2 2.0-3.5: dot -> pill "خطوة صغيرة."
function s2(t) {
  const cx = W / 2, cy = H / 2;
  const pw = 820, ph = 170;
  const out = seg(t, 3.3, 3.5);
  if (t < 2.2) { // glowing dot pops in on the right
    const k = eback(seg(t, 2.02, 2.15));
    const x = W * 0.72, r = 40 * k;
    cloud(x, cy, 90, 90, LILAC, 0.5 * k);
    ctx.save(); ctx.fillStyle = lin(x - r, cy - r, x + r, cy + r, [AQUA, BLUE]); ctx.beginPath(); ctx.arc(x, cy, r, 0, 7); ctx.fill(); ctx.restore();
    neon(() => { ctx.beginPath(); ctx.arc(x, cy, r, 0, 7); }, MINT, 3, { glow: 0.6 });
    return;
  }
  const k = eo(seg(t, 2.2, 2.42));
  const w = lerp(120, pw, k) * (1 - out * 0.15), h = lerp(70, ph, k) * (1 - out * 0.15);
  const x = lerp(W * 0.72, cx, k);
  const a = 1 - out;
  // blue cloud growing on the left (where RTL text grows)
  const cg = seg(t, 2.4, 2.9);
  cloud(x + w * 0.42, cy - 10, 330 * (0.4 + cg), 250 * (0.4 + cg), BLUE, 1.0 * cg * a);
  cloud(x + w * 0.34, cy, 200 * (0.4 + cg), 150 * (0.4 + cg), LILAC, 0.8 * cg * a);
  cloud(x - w * 0.5, cy, 70, 70, WARM, 0.6 * cg * a);
  // fill: gradient that darkens
  const dk = seg(t, 2.3, 2.62);
  ctx.save(); ctx.globalAlpha = a; rrPath(x - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = lin(x - w / 2, 0, x + w / 2, 0, [BLUE, AQUA, MINT]); ctx.fill();
  ctx.globalAlpha = a * dk; ctx.fillStyle = '#070B16'; ctx.fill(); ctx.restore();
  const rot = t * 2.2;
  neon(() => rrPath(x - w / 2, cy - h / 2, w, h, h / 2), conic(rot, x, cy, [WARM, MINT, SKY, BLUE, LILAC, WARM]), 3.2, { alpha: a, glow: 0.8 });
  // travelling spark on outline
  const sp = seg(t, 2.7, 3.3);
  if (sp > 0 && sp < 1) { const ang = Math.PI * (0.9 - sp * 1.2); cloud(x + Math.cos(ang) * w * 0.45, cy - Math.sin(ang) * h * 0.5, 18, 18, WHITE, 0.9 * a); }
  textC('خطوة صغيرة.', x, cy + 2, 44, { typed: seg(t, 2.36, 2.98), alpha: a, t, bloom: 0.3 });
}
// S3 3.5-4.5: sparkle -> gold star -> blue/aqua small stars
function s3(t) {
  if (t < 4.05) { const k = seg(t, 3.52, 3.62); sparkle(W * 0.72, H * 0.43, 30 * eback(k), { rot: (t - 3.5) * 2.2, alpha: k }); return; }
  if (t < 4.12) { const k = seg(t, 4.05, 4.12); ctx.save(); ctx.translate(W * 0.6, H * 0.44); ctx.scale(1 + k * 2, 0.4); ctx.translate(-W * 0.6, -H * 0.44); sparkle(W * 0.6, H * 0.44, 30, { alpha: 0.7 }); ctx.restore(); return; }
  if (t < 4.24) { const k = seg(t, 4.12, 4.24); sparkle(lerp(W * 0.38, W * 0.33, k), H * 0.44, 70 * (1 - k * 0.3), { fill: GOLD, rot: 0.3 + k * 0.4 }); return; }
  if (t < 4.33) { const k = seg(t, 4.24, 4.33); sparkle(lerp(W * 0.42, W * 0.4, k), H * 0.36, 22, { fill: BLUE, rot: 0.5 }); return; }
  const k = seg(t, 4.33, 4.5);
  sparkle(lerp(W * 0.36, W * 0.32, k), lerp(H * 0.3, H * 0.27, k), 14 * (1 - k * 0.5), { fill: AQUA, rot: 0.6 + k, alpha: 1 - k * 0.6 });
  // text caret appears
  ctx.save(); ctx.globalAlpha = 0.6 * k; ctx.fillStyle = '#cfd6e2'; ctx.fillRect(W * 0.5, H * 0.5 - 14, 2, 28); ctx.restore();
}
// S4 4.5-6.9: line + "رد سريع." -> toggle
function s4(t) {
  const cy = H * 0.55;
  const L = 820;
  const toggle = seg(t, 5.72, 5.9);
  const xL = W / 2 - L / 2, xR = W / 2 + L / 2;
  const sweep = seg(t, 6.68, 6.9);
  const a = 1 - seg(t, 6.82, 6.9);
  if (toggle < 1) {
    const grow = eo(seg(t, 4.5, 4.95));
    const lit = seg(t, 4.85, 5.05) * (1 - seg(t, 5.55, 5.72));
    const len = L * grow * (1 - toggle * 0.9);
    ctx.save(); ctx.translate(W / 2, cy); ctx.rotate(-0.025); ctx.translate(-W / 2, -cy);
    const x0 = W / 2 + L / 2 - len - toggle * 200, x1 = x0 + len;
    // underglow
    if (lit > 0) { cloud(lerp(x0, x1, 0.6), cy + 34, len * 0.6, 72, BLUE, 1.0 * lit); cloud(lerp(x0, x1, 0.25), cy + 26, len * 0.3, 50, PINK, 0.85 * lit); cloud(lerp(x0, x1, 0.8), cy + 20, len * 0.25, 40, LILAC, 0.8 * lit); }
    ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * lit; ctx.strokeStyle = lin(x0, 0, x1, 0, [SKY, BLUE, LILAC, WARM]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke(); ctx.restore();
    if (lit > 0) neon(() => { ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); }, lin(x0, 0, x1, 0, [AQUA, BLUE, LILAC, WARM]), 3, { alpha: lit, glow: 0.7 });
    ctx.restore();
  }
  // text
  const txt = 'هوية تشبهك.';
  const tw = measure(txt, 72, 400);
  const txR = lerp(xR - 60, W / 2 + tw / 2 + 90, toggle);
  const ty = lerp(cy - 46, H * 0.5, toggle);
  if (t > 4.95) {
    ctx.save(); if (sweep > 0) { ctx.globalAlpha = 1 - sweep; }
    drawRuns([{ s: txt, wt: 400 }], txR, ty, 72, { typed: seg(t, 4.98, 5.5), t, alpha: a, bloom: 0.3 });
    ctx.restore();
  }
  // star above
  const st = win(t, 5.25, 5.75, 0.08, 0.1);
  if (st > 0) sparkle(lerp(xR - 300, xR - 200, seg(t, 5.25, 5.7)), cy - 105, 9, { fill: WHITE, alpha: st });
  // toggle (to the left of RTL text)
  if (toggle > 0) {
    const tx = txR - tw - 110, w = 132 * eback(toggle), h = 66;
    const on = eio(seg(t, 6.05, 6.3));
    const bob = Math.sin(t * 3) * 3;
    neon(() => rrPath(tx - w / 2, H * 0.5 - h / 2 + bob, w, h, h / 2), conic(t * 2, tx, H * 0.5, [LILAC, BLUE, SKY, WHITE, LILAC]), 2.6, { alpha: a * (1 - sweep), glow: 0.7 });
    const kx = tx + lerp(-w * 0.22, w * 0.22, on);
    cloud(kx, H * 0.5 + bob, 26, 26, on > 0.5 ? MINT : WHITE, 0.9 * a * (1 - sweep));
    ctx.save(); ctx.globalAlpha = a * (1 - sweep); ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(kx, H * 0.5 + bob, 9, 0, 7); ctx.fill(); ctx.restore();
  }
  if (sweep > 0) { // streak sweeps across
    const sx = lerp(W * 0.3, W * 0.62, eio(sweep));
    neon(() => { ctx.beginPath(); ctx.moveTo(sx - 260, H * 0.5); ctx.lineTo(sx + 260, H * 0.5); }, lin(sx - 260, 0, sx + 260, 0, [rgba(BLUE, 0), BLUE, GOLD, rgba(GOLD, 0)]), 5, { glow: 1.2, alpha: Math.sin(sweep * Math.PI) });
  }
}
// S5 6.9-9.37: card draws itself, "وموقعك ينوّر."
function s5(t) {
  const cx = W / 2, cy = H * 0.5;
  const cam = 1 + 0.05 * seg(t, 7.0, 9.37);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(cam, cam); ctx.translate(-cx, -cy);
  const w = 840, h = 1080, r = 80, x = cx - w / 2, y = cy - h / 2;
  if (t < 7.02) { cloud(W * 0.3, H * 0.4, 170, 60, LILAC, 0.6 * seg(t, 6.9, 6.98)); ctx.restore(); return; }
  const dr = eio(seg(t, 7.0, 7.6));
  const full = rrLen(w, h, r);
  const glowK = seg(t, 7.45, 7.9);
  // outer glow field
  if (glowK > 0) {
    cloud(cx + 160, cy + 380, 760 * glowK, 900 * glowK, BLUE, 0.9);
    cloud(cx + 380, cy - 200, 420 * glowK, 700 * glowK, DEEP, 0.7);
    cloud(x + 30, y + h - 10, 200, 160, WARM, 0.85 * glowK);
    cloud(cx, y, 420, 120, LILAC, 0.45 * glowK);
    ctx.save(); rrPath(x, y, w, h, r); ctx.fillStyle = BG; ctx.globalAlpha = 0.97; ctx.fill(); ctx.restore();
  } else { cloud(cx - 200, y - 10, 300, 70, LILAC, 0.5 * dr); }
  // stroke drawn from top-middle anticlockwise (towards left)
  const stroke = conic(-Math.PI / 2, cx, cy, [LILAC, SKY, BLUE, LILAC, WARM, WHITE, LILAC]);
  neon(() => { ctx.save(); ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.translate(-cx, -cy); rrPath(x, y, w, h, r); ctx.restore(); }, stroke, 3.6, { dash: [full * dr, full], dashOff: -w / 2 + r, glow: 0.9 });
  // text + cursor
  if (t > 7.55) {
    const res = textC('وموقعك ينوّر.', cx, cy - 10, 46, { typed: seg(t, 7.6, 8.75), t, bloom: 0.3 });
    const px = lerp(res.lead - 10, cx - 40, seg(t, 8.8, 9.3)), py = cy + 70 + Math.sin(t * 2) * 3;
    cursor(px, py, 0.8, { alpha: 0.8 });
    if (t > 8.6) { ctx.save(); ctx.strokeStyle = 'rgba(230,236,245,0.85)'; ctx.lineWidth = 2; const ax = x + w - 50, ay = y + h - 48; ctx.beginPath(); ctx.moveTo(ax - 9, ay); ctx.lineTo(ax + 9, ay); ctx.moveTo(ax, ay - 9); ctx.lineTo(ax, ay + 9); ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();
}
// S6 9.37-11.1: macro on the card corner, comet, crosshair, click -> chat bubble
function s6(t) {
  const cornerX = W * 0.74, lineY = H * 0.64, R = 90;
  const pan = seg(t, 9.37, 11.0);
  ctx.save(); ctx.translate(-pan * 30, -pan * 12);
  // outside field (right of vertical, below horizontal)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rad(cornerX, lineY, W * 0.75, [[0, rgba('#F4A6FF', 0.95)], [0.18, rgba(LILAC, 0.9)], [0.45, rgba(BLUE, 0.9)], [1, rgba(DEEP, 0.6)]]); ctx.fillRect(cornerX + 6, -100, W, H + 200); ctx.fillRect(-100, lineY + 6, cornerX + 106, H);
  ctx.restore();
  cloud(cornerX, lineY, 520, 320, SKY, 0.5);
  // inside dark (card) with rounded corner
  ctx.save(); ctx.fillStyle = BG; ctx.beginPath(); ctx.moveTo(-100, -100); ctx.lineTo(cornerX, -100); ctx.lineTo(cornerX, lineY - R); ctx.arcTo(cornerX, lineY, cornerX - R, lineY, R); ctx.lineTo(-100, lineY); ctx.closePath(); ctx.fill(); ctx.restore();
  cloud(W * 0.2, lineY - 8, 400, 40, WARM, 0.35);
  neon(() => { ctx.beginPath(); ctx.moveTo(-100, lineY); ctx.lineTo(cornerX - R, lineY); ctx.arcTo(cornerX, lineY, cornerX, lineY - R, R); ctx.lineTo(cornerX, -100); }, lin(0, lineY, cornerX, 0, [WARM, LILAC, SKY, WHITE]), 4, { glow: 1 });
  // comet
  const cm = seg(t, 9.37, 9.95);
  if (cm < 1) { const cxm = lerp(W * 0.06, W * 0.48, eo(cm)); cloud(cxm, lineY, 110, 16, WHITE, 1 - cm * 0.8); cloud(cxm - 70, lineY, 160, 12, WARM, 0.7 * (1 - cm)); }
  // crosshair
  const chx = W * 0.5, chy = H * 0.42;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = WHITE; ctx.lineWidth = 4; ctx.filter = 'blur(4px)'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(chx - 34, chy); ctx.lineTo(chx + 34, chy); ctx.moveTo(chx, chy - 34); ctx.lineTo(chx, chy + 34); ctx.stroke();
  ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  // cursor path towards crosshair with colour changes
  const mv = eio(seg(t, 9.9, 10.62));
  const kx = lerp(W * 0.62, chx + 18, mv), ky = lerp(lineY - 60, chy + 18, mv);
  const cols = [null, '#F07BD8', AQUA, GOLD, GOLD];
  const ci = Math.min(4, Math.floor(seg(t, 9.95, 10.65) * 4.99));
  const click = seg(t, 10.62, 10.8);
  if (t < 10.85) cursor(kx, ky, 1.4, { fill: cols[ci], glow: ci ? 0.9 : 0, alpha: 1 - click });
  if (click > 0 && t < 10.85) cloud(chx, chy, 110 * eo(click), 110 * eo(click), WHITE, 0.9 * (1 - click * 0.4));
  // chat bubble
  const bb = seg(t, 10.78, 10.9);
  if (bb > 0) {
    const r = 86 * eback(bb);
    cloud(chx, chy, r * 2.2, r * 2.2, LILAC, 0.55);
    ctx.save(); ctx.fillStyle = rad(chx - r * 0.3, chy - r * 0.35, r * 1.4, [[0, '#B7F5E6'], [0.35, MINT], [0.75, BLUE], [1, DEEP]]); ctx.beginPath(); ctx.arc(chx, chy, r, 0, 7); ctx.fill(); ctx.restore();
    neon(() => { ctx.beginPath(); ctx.arc(chx, chy, r, 0, 7); }, conic(0, chx, chy, [WHITE, LILAC, SKY, WHITE]), 2.4, { glow: 0.6 });
    ctx.save(); ctx.fillStyle = WHITE; for (let i = -1; i <= 1; i++) { const bo = Math.sin(t * 14 + i) * 3; ctx.beginPath(); ctx.arc(chx + i * 16, chy + bo, 5, 0, 7); ctx.fill(); } ctx.restore();
  }
  ctx.restore();
}
// S7 11.0-13.5: bubble -> glowing ball -> ring of customers "العملاء بيتجمّعوا."
function s7(t) {
  const cx = W / 2, cy = H * 0.52;
  if (t < 11.25) { // bubble shrinks to centre, becomes warm ball
    const k = eo(seg(t, 11.0, 11.12)), w2 = seg(t, 11.08, 11.2);
    const x = lerp(W * 0.5, cx, k), y = lerp(H * 0.42, cy, k);
    const r = lerp(58, 46, k);
    cloud(x, y, r * 2.6, r * 2.6, w2 > 0 ? WARM : LILAC, 0.7);
    ctx.save(); ctx.fillStyle = rad(x, y, r, [[0, '#FFFDF3'], [0.6, w2 > 0.5 ? '#FFF2C8' : MINT], [1, rgba(w2 > 0.5 ? GOLD : BLUE, 0.9)]]); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.restore();
    return;
  }
  const out = seg(t, 13.2, 13.4);
  const sc = 1 - eio(out) * 0.75;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  const RR = 380, n = 9, rc = 70;
  const ap = seg(t, 11.25, 11.7);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    const k = eback(seg(ap * n, i * 0.6, i * 0.6 + 2.5));
    const x = cx + Math.cos(a) * RR, y = cy + Math.sin(a) * RR;
    if (k <= 0) continue;
    ctx.save(); ctx.globalAlpha = 0.85 * (1 - out); ctx.strokeStyle = lin(x - rc, y - rc, x + rc, y + rc, [rgba(DEEP, 1), rgba(LILAC, 0.9)]); ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.arc(x, y, rc * k * 0.85, 0, 7); ctx.stroke(); ctx.restore();
  }
  // travelling bright ring
  const mv = seg(t, 11.3, 13.25);
  const ang = lerp(-Math.PI * 0.18, Math.PI * 0.62, eio(mv)) + (t < 11.4 ? 0 : 0);
  const k0 = eo(seg(t, 11.22, 11.42));
  const bx = lerp(cx, cx + Math.cos(ang) * RR, k0), by = lerp(cy, cy + Math.sin(ang) * RR, k0);
  const ang2 = ang - 0.32; const gx = cx + Math.cos(ang2) * RR, gy = cy + Math.sin(ang2) * RR;
  ctx.save(); ctx.globalAlpha = 0.5 * k0 * (1 - out); ctx.strokeStyle = LILAC; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(gx, gy, rc * 0.8, 0, 7); ctx.stroke(); ctx.restore();
  cloud(bx, by, 170, 170, PINK, 0.45); cloud(bx + 20, by, 110, 110, '#FF4D6D', 0.35);
  neon(() => { ctx.beginPath(); ctx.arc(bx, by, rc * 0.85, 0, 7); }, conic(t * 3, bx, by, [PINK, '#FF4D6D', GOLD, PINK, LILAC, PINK]), 10, { glow: 1.2, core: 0.6 });
  ctx.save(); ctx.fillStyle = '#0B1222'; ctx.beginPath(); ctx.arc(bx, by, rc * 0.62, 0, 7); ctx.fill(); ctx.restore();
  // text
  textC('جمهورك بيكبر.', cx, cy, 40, { typed: seg(t, 11.45, 12.4), t, alpha: 1 - out, bloom: 0.3 });
  const gd = win(t, 11.5, 13.0); if (gd > 0) cloud(cx + 175 + Math.sin(t * 3) * 20, cy - 6, 9, 9, GOLD, gd);
  ctx.restore();
  if (out > 0.4) { // white ball drops (becomes the pupil)
    const k = seg(t, 13.28, 13.5);
    const y = lerp(cy, H * 0.58, eo(k));
    cloud(cx, y, 70, 70, WHITE, 0.8); ctx.save(); ctx.fillStyle = WHITE; ctx.beginPath(); ctx.arc(cx, y, 30, 0, 7); ctx.fill(); ctx.restore();
  }
}
// eye helper
function eyePath(cx, cy, w, h) { ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.quadraticCurveTo(cx, cy - h, cx + w / 2, cy); ctx.quadraticCurveTo(cx, cy + h, cx - w / 2, cy); ctx.closePath(); }
// S8 13.45-17.05: eye opens; iris -> pill "ويشوفوك بشكل مختلف."; blink; blue reopen; shrink to ring
function s8(t) {
  const cx = W / 2, cy = H / 2;
  let w = 1000, hOpen = 500;
  let open = eo(seg(t, 13.48, 13.95));
  const blink = seg(t, 16.15, 16.3) * (1 - seg(t, 16.32, 16.5));
  open *= 1 - blink * 0.92;
  const phase2 = t > 16.32;
  let sc = lerp(0.35, 1, eo(seg(t, 13.45, 13.95)));
  if (phase2) sc = 1.05 - eio(seg(t, 16.85, 17.05)) * 0.75;
  const tilt = t < 16.3 ? Math.sin((t - 14) * 1.3) * 0.05 : 0;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  const h = hOpen * open;
  const fade = 1 - seg(t, 16.95, 17.05);
  if (phase2) { cloud(cx - 300, cy - 80, 800, 900, BLUE, 0.85 * (1 - seg(t, 16.8, 17.05))); cloud(cx - 300, cy, 500, 400, DEEP, 0.5); }
  // inner glow ellipse (sclera band)
  const ie = clamp(open * 1.1);
  if (ie > 0.05) {
    neon(() => { ctx.beginPath(); ctx.ellipse(cx, cy, 270, 200 * open, 0, 0, 7); }, conic(0, cx, cy, [WARM, WHITE, GOLD, LILAC, BLUE, LILAC, WARM]), 9, { glow: 1.4, alpha: 0.85 * fade, core: 0.4 });
    cloud(cx + 200, cy, 160, 200 * open, WARM, 0.35 * fade);
  }
  neon(() => eyePath(cx, cy, w, Math.max(h, 8)), phase2 ? lin(cx - w / 2, 0, cx + w / 2, 0, [BLUE, SKY, LILAC, GOLD]) : lin(cx - w / 2, 0, cx + w / 2, 0, [LILAC, PINK, LILAC, BLUE]), 10, { glow: 1.3, alpha: fade, core: 0.55 });
  // iris
  const pill = eio(seg(t, 14.42, 14.62)) * (1 - eio(seg(t, 16.08, 16.22)));
  const irisR = phase2 ? 150 : 115;
  if (pill < 1) {
    const ir = irisR * open;
    ctx.save(); ctx.fillStyle = '#05070F'; ctx.beginPath(); ctx.arc(cx, cy, ir * 0.85, 0, 7); ctx.fill(); ctx.restore();
    neon(() => { ctx.beginPath(); ctx.arc(cx, cy, Math.max(ir, 1), 0, 7); }, conic(1, cx, cy, [GOLD, WARM, GOLD, '#FF9A5C', GOLD]), 6, { glow: 1, alpha: (1 - pill) * fade, core: 0.5 });
  }
  if (pill > 0) {
    const pw = lerp(230, 680, pill), ph = lerp(230, 120, pill);
    const dx = Math.sin((t - 14.6) * 1.6) * 30 * pill, dy = Math.cos((t - 14.6) * 1.2) * 14 * pill;
    ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(-0.06 * Math.sin((t - 14.6) * 1.1));
    cloud(0, 0, pw * 0.7, ph * 1.3, WHITE, 0.35 * pill);
    rrPath(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = '#06080F'; ctx.globalAlpha = pill; ctx.fill(); ctx.globalAlpha = 1;
    ctx.restore();
    neon(() => { ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(-0.06 * Math.sin((t - 14.6) * 1.1)); rrPath(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.restore(); }, rgba(WHITE, 0.8), 2, { glow: 0.8, alpha: pill * 0.8, core: 0.3 });
    ctx.save(); ctx.translate(cx + dx, cy + dy); ctx.rotate(-0.06 * Math.sin((t - 14.6) * 1.1));
    textC('ويشوفوك بشكل مختلف.', 0, 2, 36, { typed: seg(t, 14.55, 15.2), t, alpha: pill, bloom: 0.2 });
    ctx.restore();
  }
  ctx.restore();
}
// S9 17.0-19.45: ring -> iridescent 3D blob "براندك ياخد شكله."
function s9(t) {
  const cx = W / 2, cy = H / 2;
  const ringA = 1 - seg(t, 17.62, 17.85);
  if (ringA > 0) {
    const r = lerp(75, 70, seg(t, 17.0, 17.6)) * (1 + seg(t, 17.5, 17.8) * 0.6);
    const col = t < 17.3 ? conic(0, cx, cy, ['#F7B8E8', WARM, '#F7B8E8']) : t < 17.45 ? WHITE : conic(t * 4, cx, cy, [AQUA, BLUE, GOLD, WHITE, LILAC, AQUA]);
    neon(() => { ctx.beginPath(); ctx.ellipse(cx, cy, r, r * (1 - seg(t, 17.5, 17.75) * 0.25), seg(t, 17.5, 17.8), 0, 7); }, col, 6, { alpha: ringA, glow: 1 });
  }
  const bk = eo(seg(t, 17.55, 17.95));
  if (bk > 0) {
    const zoom = 1 + ei(seg(t, 19.0, 19.45)) * 5;
    const bx = cx, by = lerp(H * 0.5, H * 0.44, eo(seg(t, 17.7, 18.2)));
    const size = lerp(220, 1150, bk) * zoom;
    const c = Blob3D.render(1.5 + t * 0.9, 0.4 + 0.6 * bk);
    ctx.save(); ctx.globalAlpha = bk;
    ctx.translate(bx, by); ctx.drawImage(c, -size / 2, -size / 2, size, size);
    ctx.restore();
    cloud(bx, by, size * 0.55, size * 0.45, BLUE, 0.18 * bk);
    // little bubbles
    const zA = 1 - seg(t, 19.05, 19.3);
    [[-0.62, -0.05, 9], [-0.2, -0.62, 11], [0.0, 0.47, 17], [-0.78, 0.35, 7]].forEach(([u, v, r], i) => {
      const x = bx + u * 760 * zoom + Math.sin(t * 1.3 + i) * 10, y = by + v * 760 * zoom * 0.62 + Math.cos(t * 1.1 + i) * 8;
      neon(() => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); }, conic(t + i, x, y, [AQUA, GOLD, BLUE, WHITE, AQUA]), 2.5, { glow: 0.4, alpha: bk * zA });
    });
    if (zA > 0) drawRuns([{ s: 'تطبيقك ياخد شكله.', wt: 400 }], W / 2 + measure('تطبيقك ياخد شكله.', 68, 400) / 2, H * 0.76, 68, { typed: seg(t, 17.85, 18.55), t, alpha: bk * (1 - seg(t, 18.9, 19.15)), bloom: 0.25 });
  }
}
// S10 19.4-22.9: giant pill pan "موقع حيّ."
function s10(t) {
  const k = seg(t, 19.4, 22.9);
  const y0 = H * 0.31, y1 = H * 0.69, ph = y1 - y0;
  // left end x moves from right to far left
  const leftX = lerp(W * 0.4, -W * 0.12, eio(seg(t, 19.4, 21.1))) - 120 * seg(t, 21.1, 22.9);
  const rightX = lerp(W * 2.2, W * 0.98, eio(seg(t, 21.9, 22.85)));
  const pulse = 1 + 0.06 * Math.sin(t * 9) * seg(t, 21.2, 22.9);
  const intro = seg(t, 19.4, 19.6);
  // aura
  const topC = t < 22.2 ? AQUA : MINT, botC = t < 21.6 ? PINK : t < 22.3 ? WARM : AQUA;
  ctx.save(); const pad = 150; rrPath(leftX - pad, y0 - pad, rightX - leftX + pad * 2, ph + pad * 2, (ph + pad * 2) / 2); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = intro;
  ctx.fillStyle = lin(0, y0 - pad, 0, y1 + pad, [rgba(topC, 0.0), rgba(topC, 0.95), rgba(topC, 0.2), rgba(botC, 0.2), rgba(botC, 0.95), rgba(botC, 0.0)]); ctx.fillRect(leftX - pad, 0, W * 3, H);
  ctx.restore();
  cloud(leftX + 40, H / 2, 420 * pulse, 620, BLUE, 0.95 * intro);
  cloud(leftX + 160, y0 + 40, 380, 180, AQUA, 0.6 * intro);
  cloud(leftX + 160, y1 - 40, 380, 180, botC, 0.6 * intro);
  ctx.save(); rrPath(leftX, y0, rightX - leftX, ph, ph / 2); ctx.fillStyle = '#05070F'; ctx.fill(); ctx.restore();
  neon(() => rrPath(leftX, y0, rightX - leftX, ph, ph / 2), lin(0, y0, 0, y1, [WHITE, rgba(SKY, 1), WHITE]), 4, { glow: 1.2 * pulse, alpha: intro });
  // text
  if (t > 21.15) {
    const tx = lerp(W * 0.95, W * 0.84, eo(seg(t, 21.2, 22.1))) - 30 * seg(t, 22.1, 22.9);
    drawRuns([{ s: 'حملات بتنبض.', wt: 400 }], tx, H * 0.5, 100, { typed: seg(t, 21.2, 21.95), t, bloom: 0.35 });
  }
}
// S11+S12 22.85-27.6: cursor draws a line -> dotted frame "مش مجرد صفحة." -> neon frame "شغّال 24/7."
function s11(t) {
  const cx = W / 2, cy = H / 2;
  if (t < 23.95) {
    const dx = W * 0.78, dy = cy;
    const ln = eo(seg(t, 23.15, 23.6));
    const L = 620 * ln;
    if (ln > 0) {
      const lit = 1 - seg(t, 23.6, 23.8);
      ctx.save(); ctx.strokeStyle = 'rgba(200,210,225,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(dx - L, dy); ctx.lineTo(dx, dy); ctx.stroke(); ctx.restore();
      if (lit > 0) neon(() => { ctx.beginPath(); ctx.moveTo(dx - L, dy); ctx.lineTo(dx, dy); }, lin(dx - L, 0, dx, 0, [AQUA, BLUE, LILAC]), 3, { alpha: lit, glow: 0.6 });
      const sp = seg(t, 23.82, 23.95);
      if (sp > 0) { ctx.save(); ctx.strokeStyle = 'rgba(200,210,225,0.5)'; ctx.setLineDash([3, 5]); ctx.lineWidth = 1.4; ctx.strokeRect(dx - L, dy - 50 * sp, L, 100 * sp); ctx.restore(); }
    }
    cloud(dx - L, dy, 10, 10, GOLD, 0.9);
    cursor(dx + 4, dy + 6, 0.8, {});
    return;
  }
  const big = eio(seg(t, 25.45, 25.75));
  const coll = eio(seg(t, 27.3, 27.55));
  const w = lerp(820, 900, big), h = lerp(220, 1150, big) * (1 - coll * 0.94);
  const x = cx - w / 2, y = cy - h / 2;
  const a = 1 - seg(t, 27.5, 27.6);
  // dotted frame
  const dot = 1 - seg(t, 25.5, 25.8);
  ctx.save(); ctx.globalAlpha = 0.6 * a; ctx.strokeStyle = '#C5CEDC'; ctx.setLineDash([3, 6]); ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h); ctx.restore();
  // handles
  ctx.save(); ctx.fillStyle = '#E6ECF5'; ctx.globalAlpha = a; [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([u, v]) => ctx.fillRect(u - 4, v - 4, 8, 8)); ctx.restore();
  if (big > 0) {
    const gk = seg(t, 25.5, 25.9) * (1 - coll * 0.5);
    cloud(cx + w * 0.15, y + h, w * 0.32, 90, GOLD, 0.8 * gk * a);
    cloud(cx - w * 0.2, y, w * 0.3, 60, PINK, 0.55 * gk * a);
    neon(() => rrPath(x, y, w, h, Math.min(36, h / 2)), conic(-Math.PI * 0.75, cx, cy, [PINK, PINK, GOLD, GOLD, GOLD, BLUE, BLUE, PINK]), 3.4, { alpha: gk * a, glow: 1 });
  }
  if (t < 25.55) textC('مش مجرد بوست.', cx, cy, 40, { typed: seg(t, 24.0, 24.55), t, alpha: dot, bloom: 0.25 });
  if (t > 25.7) textC('محتوى شغّال 24/7.', cx, cy, 42, { typed: seg(t, 25.75, 26.8), t, alpha: 1 - seg(t, 27.25, 27.4), bloom: 0.3 });
  // cursor journey
  let px, py, fill = null, glow = 0, sc = 0.8;
  if (t < 24.6) { px = x + w + 6; py = y + h + 8; }
  else if (t < 24.85) { px = x + w + 6; py = y + h + 8; fill = '#7FE3CB'; glow = 0.8; }
  else if (t < 25.15) { const k = eio(seg(t, 24.85, 25.15)); px = lerp(x + w - 30, x + 20, k); py = lerp(y + h - 20, y + 20, k); fill = GOLD; glow = 1.2; sc = 0.9; }
  else { px = x + 4; py = y + 4; }
  if (t > 24.85 && t < 25.15) cloud(px + 10, py + 8, 46, 30, GOLD, 0.8);
  cursor(px, py, sc * 1.3, { fill, glow, alpha: a });
}
// S13 27.5-31.05: bar -> wave "بصوتك إنت."
function wave(cx, cy, w, amp, t, a, flat = 0, stretch = 0) {
  const cols = [AQUA, BLUE, LILAC, GOLD, WHITE];
  for (let s = 0; s < 5; s++) {
    neon(() => {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const u = i / 120 * 2 - 1; const x = cx + u * w / 2 * (1 + stretch * 3) - stretch * w * 1.4;
        const env = Math.exp(-u * u * 5.5) * (1 - flat);
        const y = cy + Math.sin(u * 9 + t * 5 + s * 0.9) * amp * env * (0.7 + 0.3 * Math.sin(s * 2.1 + t));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
    }, cols[s], s === 4 ? 2.6 : 2, { alpha: a * (s === 4 ? 1 : 0.85), glow: 0.55, core: s === 4 ? 0.9 : 0.35 });
  }
}
function s13(t) {
  const cx = W / 2, cy = H * 0.5;
  if (t < 28.45) {
    const k = seg(t, 27.55, 28.4);
    const L = lerp(900, 30, eio(k));
    const x0 = cx - L / 2 + lerp(0, 60, k);
    neon(() => { ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x0 + L, cy); }, lin(x0, 0, x0 + L, 0, [WHITE, BLUE, WHITE, GOLD, '#FF7A6B']), 4, { glow: 0.8 });
    if (t < 28.3) cursor(x0 - 10, cy + 6, 0.75, {});
    return;
  }
  const g = eo(seg(t, 28.45, 29.0));
  const flat = seg(t, 30.72, 30.95), str = ei(seg(t, 30.8, 31.05));
  wave(cx, cy, lerp(60, 960, g), 110 * g, t, 1, flat, str);
  if (t < 29.05) cursor(lerp(cx + 120, cx + 520, seg(t, 28.5, 29.05)), cy + 40, 0.7, { alpha: 1 - seg(t, 28.9, 29.05) });
  textC('بصوت براندك.', cx, H * 0.4, 36, { typed: seg(t, 29.0, 29.95), t, alpha: 1 - seg(t, 30.6, 30.85), bloom: 0.3 });
}
// S14 31.0-34.3: neon conduits -> cross flash -> P mark builds from pieces
function corner(x, y, r, dir, len1, len2, style, a, w = 3.2) {
  // dir: 'ru' = comes from left, turns up; 'ur' = comes from below, turns right; 'dl' = from right turns down ...
  neon(() => {
    ctx.beginPath();
    if (dir === 'ru') { ctx.moveTo(x - len1, y); ctx.lineTo(x - r, y); ctx.arcTo(x, y, x, y - r, r); ctx.lineTo(x, y - len2); }
    if (dir === 'ur') { ctx.moveTo(x, y + len1); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.lineTo(x + len2, y); }
    if (dir === 'arcTR') { ctx.arc(x, y, r, -Math.PI * 0.05, Math.PI * 0.5); }
    if (dir === 'arcBL') { ctx.arc(x, y, r, Math.PI * 0.95, Math.PI * 1.5); }
  }, style, w, { alpha: a, glow: 0.9 });
}
function s14(t) {
  const cx = W / 2, cy = H / 2;
  if (t < 33.0) {
    // camera travels; line from left turning up
    const p = seg(t, 31.0, 32.95);
    const draw = eo(seg(t, 31.0, 31.45));
    const ox = lerp(0, -W * 0.35, eio(p)), oy = lerp(0, -H * 0.27, eio(p));
    ctx.save(); ctx.translate(ox, oy);
    const X = W * 0.88, Y = H * 0.5;
    const st = lin(0, Y, X, Y - 400, [LILAC, BLUE, SKY, AQUA, WARM]);
    neon(() => { ctx.beginPath(); ctx.moveTo(-W, Y); ctx.lineTo(lerp(-W, X - 80, draw), Y); if (draw > 0.98) { ctx.arcTo(X, Y, X, Y - 80, 80); ctx.lineTo(X, Y - 80 - 800 * seg(t, 31.45, 31.8)); } }, st, 3.4, { glow: 1 });
    ctx.restore();
    // second piece from bottom
    const b = eo(seg(t, 32.15, 32.9));
    if (b > 0) {
      const bx = lerp(W * 0.42, W * 0.36, seg(t, 32.15, 33)), byTurn = lerp(H * 0.7, H * 0.55, b);
      neon(() => { ctx.beginPath(); ctx.moveTo(bx, H + 50); ctx.lineTo(bx, byTurn + 70); if (b > 0.45) { ctx.arcTo(bx, byTurn, bx + 70, byTurn, 70); ctx.lineTo(bx + 70 + 520 * seg(b, 0.45, 1), byTurn); } }, lin(bx, H, bx + 600, byTurn, [LILAC, PINK, GOLD, WARM]), 3.4, { glow: 1 });
    }
    return;
  }
  // 33.0+: cross + fragments
  const fr = 1 - seg(t, 34.0, 34.3);
  const flash = seg(t, 33.0, 33.1) * (1 - seg(t, 33.1, 33.35));
  const sp = eo(seg(t, 33.1, 33.4));
  if (t < 33.12) {
    neon(() => { ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(cx - 60, cy); ctx.arcTo(cx, cy, cx, cy - 60, 60); ctx.lineTo(cx, 0); }, lin(0, cy, cx, 0, [LILAC, BLUE, AQUA]), 3.4, { glow: 1 });
    neon(() => { ctx.beginPath(); ctx.moveTo(cx, H); ctx.lineTo(cx, cy + 60); ctx.arcTo(cx, cy, cx + 60, cy, 60); ctx.lineTo(W, cy); }, lin(cx, H, W, cy, [LILAC, GOLD, WHITE]), 3.4, { glow: 1 });
  } else {
    // fragments drift outwards
    const d = lerp(0, 1, sp);
    corner(lerp(cx, W * 0.24, d), lerp(cy, H * 0.33, d), 60, 'ru', 600, 120, lin(0, 0, W * 0.3, 0, [LILAC, BLUE, AQUA]), fr);
    corner(lerp(cx, W * 0.66, d), lerp(cy, H * 0.69, d), 60, 'ur', 120, 700, lin(W * 0.6, 0, W, 0, [LILAC, GOLD, WHITE]), fr);
    corner(lerp(cx, W * 0.66, d), lerp(cy, H * 0.25, d), 70, 'arcTR', 0, 0, lin(W * 0.6, 0, W * 0.7, 0, [LILAC, PINK]), fr * sp);
    corner(lerp(cx, W * 0.3, d), lerp(cy, H * 0.78, d), 80, 'arcBL', 0, 0, lin(W * 0.25, 0, W * 0.35, 0, [BLUE, SKY]), fr * sp);
  }
  if (flash > 0) { cloud(cx, cy, 160, 160, WHITE, flash); sparkle(cx, cy, 60 * flash, { fill: WHITE, alpha: flash }); }
  // P mark assembles from neon bars
  markBuild(t);
}
function markShape(cx, cy, hgt) { // returns transform helpers for P svg (419x414) + dot
  const s = hgt / 414; return { s, ox: cx - 419 * s / 2, oy: cy - 414 * s / 2 };
}
function drawMark(cx, cy, hgt, o = {}) {
  const { s, ox, oy } = markShape(cx, cy, hgt);
  const a = o.alpha ?? 1;
  ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s);
  if (o.clip) { ctx.beginPath(); o.clip(); ctx.clip(); }
  if (o.glow) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = `blur(${18 / s}px)`; ctx.globalAlpha = a * o.glow; ctx.fillStyle = o.glowColor || LILAC; ctx.fill(PPATH); ctx.restore(); }
  ctx.globalAlpha = a; ctx.fillStyle = o.fill || WHITE; ctx.fill(PPATH);
  if (o.dot !== false) { ctx.fillStyle = MINT; ctx.globalAlpha = a * (o.dotA ?? 1); ctx.beginPath(); ctx.arc(362, 362, 51 * (o.dotS ?? 1), 0, 7); ctx.fill(); }
  ctx.restore();
}
function markBuild(t) {
  if (t < 33.3) return;
  const cx = W / 2, cy = H / 2, hgt = 220;
  const { s, ox, oy } = markShape(cx, cy, hgt);
  // pieces: horizontal strips of the mark revealed in random order, first as aqua outline then white
  const strips = 7;
  for (let i = 0; i < strips; i++) {
    const order = [3, 0, 5, 1, 6, 2, 4][i];
    const k = seg(t, 33.3 + order * 0.08, 33.5 + order * 0.08);
    if (k <= 0) continue;
    const y0 = i * 414 / strips, y1 = (i + 1) * 414 / strips;
    const shift = (1 - eo(k)) * (i % 2 ? 60 : -60);
    ctx.save(); ctx.translate(shift, 0);
    const outline = k < 0.6;
    drawMark(cx, cy, hgt, { clip: () => ctx.rect(-10, y0, 440, y1 - y0 + 1), fill: outline ? rgba(AQUA, 0.9) : (i % 3 === 0 && k < 0.9 ? PINK : WHITE), dot: i >= 5 && k > 0.8, glow: 0.6, glowColor: outline ? AQUA : LILAC });
    ctx.restore();
  }
}
// S15 34.3-37.8: mark glows -> flash -> lockup P + PLANET + CTA
function s15(t) {
  const cx = W / 2, cy = H / 2;
  cloud(cx, cy - 150, 600, 700, DEEP, 0.3);
  const fl = seg(t, 35.1, 35.25) * (1 - seg(t, 35.25, 35.6));
  const lk = eo(seg(t, 35.15, 35.5));
  const end = 1 - seg(t, 37.45, 37.8);
  const markH = lerp(220, 280, lk);
  const ww = 760, wh = ww * IMG.word.height / IMG.word.width;
  const mx = cx, my = lerp(cy, cy - 330, lk);
  const breathe = 0.5 + 0.15 * Math.sin(t * 2.4);
  drawMark(mx, my, markH, { glow: breathe, glowColor: LILAC, alpha: end, dotS: t < 35.2 ? 1 : 1 + 0.3 * Math.sin(seg(t, 35.2, 35.5) * Math.PI) });
  if (lk > 0) {
    const wy = cy - 60;
    ctx.save(); ctx.globalAlpha = lk * end;
    ctx.beginPath(); ctx.rect(cx - (ww / 2 + 20) * lk, wy - 60, (ww + 40) * lk, 400); ctx.clip();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'blur(16px)'; ctx.globalAlpha = lk * end * 0.45; ctx.drawImage(IMG.word, cx - ww / 2, wy, ww, wh); ctx.restore();
    ctx.drawImage(IMG.word, cx - ww / 2, wy, ww, wh);
    { const tw2 = ww * 500 / 631, th2 = tw2 * 42 / 500; ctx.globalAlpha = lk * end * seg(t, 35.4, 35.8); ctx.drawImage(IMG.tag, cx - tw2 / 2, wy + wh + 34, tw2, th2); }
    ctx.restore();
  }
  if (fl > 0) { cloud(cx, cy - 120, 520 * fl + 120, 420 * fl + 80, WHITE, fl * 0.9); cloud(cx, cy - 60, 600, 300, LILAC, fl * 0.6); }
  const ct = seg(t, 35.9, 36.4) * end;
  if (ct > 0) {
    const d = (1 - ct) * 14;
    ctx.save(); ctx.globalAlpha = ct; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = F(58, 600); ctx.fillStyle = MINT; ctx.direction = 'ltr'; ctx.fillText('web.theplanetco.com', cx, cy + 270 + d);
    ctx.font = F(42, 400); ctx.fillStyle = '#C3CBD8'; ctx.direction = 'rtl'; ctx.fillText('تسويق · إدارة منصات · براندينج', cx, cy + 370 + d);
    ctx.fillText('مواقع · تطبيقات', cx, cy + 430 + d);
    // whatsapp pill
    ctx.font = F(48, 600); const wt = 'واتساب 01203101104'; const tw = ctx.measureText(wt).width;
    rrPath(cx - tw / 2 - 44, cy + 500 + d, tw + 88, 96, 48); ctx.fillStyle = rgba(MINT, 0.14); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(MINT, 0.8); ctx.stroke();
    ctx.fillStyle = WHITE; ctx.fillText(wt, cx, cy + 548 + d);
    ctx.restore();
  }
}
// =====================================================================
const SHOTS = [[0, 2.06, s1], [2.0, 3.52, s2], [3.5, 4.51, s3], [4.5, 6.9, s4], [6.9, 9.37, s5], [9.37, 11.0, s6], [11.0, 13.5, s7], [13.45, 17.06, s8], [17.0, 19.45, s9], [19.4, 22.87, s10], [22.87, 27.6, s11], [27.55, 31.05, s13], [31.0, 34.3, s14], [34.0, 37.81, s15]];
window.renderAt = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, H * 0.62); vg.addColorStop(0, 'rgba(22,32,58,0.35)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [a, b, fn] of SHOTS) {
    if (t >= a && t < b) {
      if (fn === s15 && t < 34.3) { // mark hand-off: s14 draws the build until 34.3
        continue;
      }
      ctx.save(); fn(t); ctx.restore();
    }
  }
  // film grain-free subtle vignette
  const v2 = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.62); v2.addColorStop(0, 'rgba(0,0,0,0)'); v2.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = v2; ctx.fillRect(0, 0, W, H);
};
(async () => {
  const d = await (await fetch('assets/p.svg')).text();
  PPATH = new Path2D(d.match(/ d="([^"]+)"/)[1]);
  await Promise.all([img('word', 'assets/wordmark.png'), img('tag', 'assets/tagline.png'), document.fonts.load(F(40, 400)), document.fonts.load(F(40, 600)), document.fonts.load(F(40, 700)),
    document.fonts.load('400 40px R', 'كل'), document.fonts.load('600 40px R', 'كل'), document.fonts.load('700 40px R', 'كل')]);
  await document.fonts.ready;
  window.renderAt(0); window.ready = true;
})();
