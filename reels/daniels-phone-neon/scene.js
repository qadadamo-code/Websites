// Daniel's Phone neon ident — shot-for-shot structure of the reference reel, deterministic renderAt(t).
const W = 1080, H = 1920, CX = 540, CY = 960;
window.DURATION = 37.8;
const cv = document.getElementById('c'), x = cv.getContext('2d');
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const lin = (v) => cl(v);
const oc = (v) => 1 - Math.pow(1 - cl(v), 3);
const oq = (v) => 1 - Math.pow(1 - cl(v), 5);
const io = (v) => { v = cl(v); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const ob = (v) => { v = cl(v); const c = 1.7; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };
const seg = (u, a, d, e = oc) => e((u - a) / d);
const bump = (u, a, d) => { const p = (u - a) / d; return p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0; };

// warm neon palette (brand orange + magenta + amber + cream)
const MG = '#FF3D8B', OR = '#FF7A00', AM = '#FFC14A', CR = '#FFEBD0', RD = '#FF4A1C', VI = '#C24DFF';
const mark = new Image(); mark.src = 'assets/mark.png';
const logo = new Image(); logo.src = 'assets/logo.png';

const G = 1.32; // vertical-format upscale of the reference layout
function cam(s = 1, fx = CX, fy = CY, ox = 0, oy = 0) { s *= G; x.setTransform(s, 0, 0, s, fx - s * fx + ox, fy - s * fy + oy); }
function grad(x0, y0, x1, y1, stops) { const g = x.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function aura(px, py, r, col, a = 1, sx = 1, sy = 1) {
  if (a <= 0) return; x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = cl(a);
  x.translate(px, py); x.scale(sx, sy); const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(-r, -r, 2 * r, 2 * r); x.restore();
}
// neon stroke: blurred halo + bright body + hot core
function neon(path, style, w = 6, a = 1, core = 'rgba(255,248,235,0.95)') {
  if (a <= 0) return; x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = style;
  x.globalAlpha = .55 * a; x.lineWidth = w * 5; x.filter = `blur(${w * 3.2}px)`; path(); x.stroke();
  x.globalAlpha = .9 * a; x.lineWidth = w * 1.8; x.filter = `blur(${w * .7}px)`; path(); x.stroke();
  x.filter = 'none'; x.globalAlpha = a; x.lineWidth = w; path(); x.stroke();
  if (core) { x.strokeStyle = core; x.globalAlpha = .75 * a; x.lineWidth = w * .35; path(); x.stroke(); }
  x.restore();
}
function rrPath(cx, cy, w, h, r) { w = Math.max(0, w); h = Math.max(0, h); r = Math.max(0, Math.min(r, w / 2, h / 2)); return () => { x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, r); }; }
function fillRR(cx, cy, w, h, r, col, a = 1) { x.save(); x.globalAlpha = a; x.fillStyle = col; rrPath(cx, cy, w, h, r)(); x.fill(); x.restore(); }
// perimeter points of a rounded rect, starting top-centre going counter-clockwise (left first)
function rrPoints(cx, cy, w, h, r, n = 240) {
  const pts = []; const L = w / 2 - r, T = h / 2 - r; const segs = [];
  segs.push((p) => [cx - p * L, cy - h / 2], 1);
  const per = [];
  const add = (len, f) => per.push({ len, f });
  add(L, (p) => [cx - p * L, cy - h / 2]);
  add(Math.PI * r / 2, (p) => { const a = -Math.PI / 2 - p * Math.PI / 2; return [cx - L + r * Math.cos(a), cy - T + r * Math.sin(a)]; });
  add(2 * T, (p) => [cx - w / 2, cy - T + p * 2 * T]);
  add(Math.PI * r / 2, (p) => { const a = Math.PI - p * Math.PI / 2; return [cx - L + r * Math.cos(a), cy + T + r * Math.sin(a)]; });
  add(2 * L, (p) => [cx - L + p * 2 * L, cy + h / 2]);
  add(Math.PI * r / 2, (p) => { const a = Math.PI / 2 - p * Math.PI / 2; return [cx + L + r * Math.cos(a), cy + T + r * Math.sin(a)]; });
  add(2 * T, (p) => [cx + w / 2, cy + T - p * 2 * T]);
  add(Math.PI * r / 2, (p) => { const a = -p * Math.PI / 2; return [cx + L + r * Math.cos(a), cy - T + r * Math.sin(a)]; });
  add(L, (p) => [cx + L - p * L, cy - h / 2]);
  const tot = per.reduce((s, q) => s + q.len, 0);
  for (let i = 0; i <= n; i++) { let d = i / n * tot; for (const q of per) { if (d <= q.len + 1e-6) { pts.push(q.f(q.len ? d / q.len : 0)); break; } d -= q.len; } }
  return pts;
}
function polyPath(pts, frac) { return () => { x.beginPath(); const m = Math.max(2, Math.round(pts.length * cl(frac))); x.moveTo(...pts[0]); for (let i = 1; i < m; i++) x.lineTo(...pts[i]); }; }

function font(size, wt = 600, fam = 'Plex') { x.font = `${wt} ${size}px ${fam}, Man`; }
// RTL typing anchored on the right edge of the full string, so it grows leftwards like real Arabic typing
function typeAr(str, p, cx, cy, size, { wt = 600, col = '#fff', a = 1, glow = 'rgba(255,255,255,.55)', caret = true, anchor = 'center' } = {}) {
  if (a <= 0 || p <= 0) return; x.save(); font(size, wt); x.direction = 'rtl'; x.textBaseline = 'middle';
  const full = x.measureText(str).width; const right = anchor === 'right' ? cx : cx + full / 2;
  const n = Math.round(str.length * cl(p)); const s = str.slice(0, n);
  x.textAlign = 'right'; x.globalAlpha = a; x.fillStyle = col; x.shadowColor = glow; x.shadowBlur = size * .45; x.fillText(s, right, cy);
  const wNow = x.measureText(s).width;
  if (caret && p < 1) { x.shadowBlur = 0; x.fillStyle = OR; x.fillRect(right - wNow - size * .12 - 3, cy - size * .5, 3, size); }
  x.restore(); return right - wNow;
}
function cursor(px, py, s = 1, fill = null, a = 1) {
  if (a <= 0) return; x.save(); x.globalAlpha = a; x.translate(px, py); x.scale(s, s);
  x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 30); x.lineTo(8, 22.5); x.lineTo(13.5, 34); x.lineTo(18, 32); x.lineTo(12.5, 20.5); x.lineTo(23, 20.5); x.closePath();
  x.lineJoin = 'round'; if (fill) { x.shadowColor = fill; x.shadowBlur = 18; x.fillStyle = fill; x.fill(); x.shadowBlur = 0; }
  x.strokeStyle = 'rgba(255,255,255,.92)'; x.lineWidth = 2.2; x.stroke(); x.restore();
}
function star4(px, py, r, col, rot = 0, a = 1) {
  if (a <= 0 || r <= 0) return; x.save(); x.globalAlpha = a; x.translate(px, py); x.rotate(rot);
  x.beginPath(); for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2; x.lineTo(Math.cos(an) * r, Math.sin(an) * r); const bn = an + Math.PI / 4; x.quadraticCurveTo(0, 0, Math.cos(an + Math.PI / 2) * r, Math.sin(an + Math.PI / 2) * r); }
  x.closePath(); x.shadowColor = col; x.shadowBlur = r * 1.2; x.fillStyle = col; x.fill(); x.restore();
}
function cross(px, py, s, a = 1) { x.save(); x.globalAlpha = a; x.strokeStyle = '#fff'; x.lineWidth = 3; x.shadowColor = '#fff'; x.shadowBlur = 10; x.beginPath(); x.moveTo(px - s, py); x.lineTo(px + s, py); x.moveTo(px, py - s); x.lineTo(px, py + s); x.stroke(); x.restore(); }

function phonePath(cx, cy, w, h) { w = Math.max(0, w); h = Math.max(0, h); return () => { x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, Math.min(w, h) * .17); }; }
function phoneDetails(cx, cy, w, h, a) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(255,240,225,.85)'; x.beginPath(); x.roundRect(cx - w * .14, cy - h / 2 + h * .035, w * .28, h * .035, h * .02); x.fill();
  x.fillRect(cx - w / 2 - 5, cy - h * .2, 3, h * .1); x.fillRect(cx + w / 2 + 2, cy - h * .25, 3, h * .16); x.restore(); }
function battery(cx, cy, w, h, k, a) { if (a <= 0) return; fillRR(cx, cy, w, h, 12, '#16121c', a);
  if (k > 0) { x.save(); x.globalAlpha = a; x.fillStyle = grad(cx - w / 2, 0, cx + w / 2, 0, [RD, OR, AM]); x.beginPath(); x.roundRect(cx - w / 2 + 6, cy - h / 2 + 6, (w - 12) * k, h - 12, 7); x.fill(); x.restore(); aura(cx, cy, 130, 'rgba(255,110,0,.5)', k * a); }
  neon(rrPath(cx, cy, w, h, 12), 'rgba(255,245,230,.85)', 2.5, a, null); neon(rrPath(cx + w / 2 + 8, cy, 8, h * .4, 3), 'rgba(255,245,230,.85)', 2.5, a, null);
  x.save(); x.globalAlpha = a * (.4 + .6 * k); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx + 6, cy - h * .32); x.lineTo(cx - 10, cy + 3); x.lineTo(cx, cy + 3); x.lineTo(cx - 6, cy + h * .32); x.lineTo(cx + 12, cy - 4); x.lineTo(cx + 2, cy - 4); x.closePath(); x.fill(); x.restore(); }
function iconRow(cx, cy, a) { if (a <= 0) return; const st = 'rgba(255,236,215,.9)';
  // earbuds
  neon(() => { x.beginPath(); x.arc(cx - 128, cy - 8, 12, 0, 7); x.moveTo(cx - 122, cy + 2); x.lineTo(cx - 118, cy + 26); x.moveTo(cx - 94, cy - 8); x.arc(cx - 106, cy - 8, 12, 0, 7); x.moveTo(cx - 100, cy + 2); x.lineTo(cx - 96, cy + 26); }, st, 2.2, a, null);
  // charger
  neon(() => { x.beginPath(); x.roundRect(cx - 20, cy - 16, 40, 40, 8); x.moveTo(cx - 9, cy - 16); x.lineTo(cx - 9, cy - 30); x.moveTo(cx + 9, cy - 16); x.lineTo(cx + 9, cy - 30); }, st, 2.2, a, null);
  // smartwatch
  neon(() => { x.beginPath(); x.roundRect(cx + 96, cy - 16, 34, 40, 9); x.moveTo(cx + 104, cy - 16); x.lineTo(cx + 106, cy - 32); x.lineTo(cx + 120, cy - 32); x.lineTo(cx + 122, cy - 16); x.moveTo(cx + 104, cy + 24); x.lineTo(cx + 106, cy + 40); x.lineTo(cx + 120, cy + 40); x.lineTo(cx + 122, cy + 24); }, st, 2.2, a, null); }
// neon line-art of the Q625 gimbal, drawn on progressively (p 0..1)
function gimbal(cx, cy, p, a) { const st = grad(cx - 200, cy + 300, cx + 200, cy - 300, [MG, OR, AM, CR]); const q = (i) => cl(p * 6 - i);
  neon(() => { x.beginPath(); x.moveTo(cx - 10, cy + 150); x.lineTo(cx - 130, cy + 330 * 1); x.moveTo(cx - 10, cy + 150); x.lineTo(cx + 120, cy + 330); x.moveTo(cx - 10, cy + 150); x.lineTo(cx - 10, cy + 150 + 190 * q(0)); }, st, 4, a * cl(q(0) * 3));
  neon(() => { x.beginPath(); x.roundRect(cx - 34, cy - 60 + (1 - q(1)) * 200, 52, 210, 24); }, st, 4.5, a * q(1));
  if (q(2) > 0) { x.save(); x.globalAlpha = a * q(2); x.fillStyle = OR; x.shadowColor = OR; x.shadowBlur = 18; x.beginPath(); x.arc(cx - 8, cy + 10, 11, 0, 7); x.fill(); x.fillStyle = '#fff'; [40, 66].forEach((d) => { x.beginPath(); x.arc(cx - 8, cy + d, 5, 0, 7); x.fill(); }); x.restore(); }
  neon(() => { x.beginPath(); x.moveTo(cx - 8, cy - 60); x.lineTo(cx - 8, cy - 60 - 120 * q(3)); if (q(3) >= 1) { x.lineTo(cx - 8 + 90 * q(4), cy - 180 - 40 * q(4)); } }, st, 5, a * cl(q(3) * 2));
  neon(() => { x.beginPath(); x.arc(cx - 8, cy - 180, 16, 0, 7); }, AM, 3, a * q(4), null);
  const pp = q(5); if (pp > 0) { const px = cx + 90, py = cy - 250; fillRR(px, py, 300 * pp, 150 * pp, 22, '#0d0b12', a); neon(phonePath(px, py, 300 * pp, 150 * pp), grad(px - 150, py, px + 150, py, [CR, OR, MG]), 4, a); aura(px, py, 220, 'rgba(255,120,0,.35)', a * pp); x.save(); x.globalAlpha = a * pp; x.fillStyle = '#fff'; x.beginPath(); x.arc(px - 110, py, 9, 0, 7); x.fill(); x.restore(); }
}
// ---------------------------------------------------------------- shots
const SHOTS = [
  [0, 2.0, (u) => { // 1 typing + zoom out
    const s = lerp(2.5, 1, seg(u, 0, 1.3, oc)); cam(s);
    const a = 1 - seg(u, 1.8, 0.2, lin); const str = 'كل شي بيبلّش من موبايلك.';
    const p = seg(u, 0.05, 1.35, lin);
    const left = typeAr(str, p, CX, CY, 52, { wt: 600, col: grad(CX - 260, 0, CX + 260, 0, [AM, '#fff', MG]), a, caret: true });
    if (u > .7) typeAr(str, p, CX, CY, 52, { wt: 600, col: '#fff', a: a * seg(u, .7, .5, lin), caret: false });
    const cx0 = (left ?? CX + 200) - 40, cy0 = CY + 34 + 40 * (1 - seg(u, 0, 1, oc));
    cursor(cx0, cy0, 1 / s * 1.6, u > 1.45 ? OR : null, a);
  }],
  [2.0, 3.3, (u) => { // 2 dot -> pill "one press"
    cam(1); const out = 1 - seg(u, 1.1, .2, io); const m = seg(u, .18, .32, io);
    const w = lerp(68, 250, m) * out, h = lerp(68, 470, m) * out; if (w < 2) return;
    const sc = seg(u, 0, .2, ob);
    aura(CX + 150 * m, CY + 10, 300 * m * out, 'rgba(255,110,0,.55)', m, 1.7, .9);
    aura(CX + 260 * m, CY - 40, 220 * m * out, 'rgba(255,61,139,.45)', m, 1.4, .8);
    x.save(); x.translate(CX, CY); x.scale(sc, sc); x.translate(-CX, -CY);
    if (m < .05) { neon(() => { x.beginPath(); x.arc(CX, CY, 30, 0, 7); }, grad(CX - 30, 0, CX + 30, 0, [MG, VI]), 10, 1); }
    else { const rr = lerp(34, 42, m); fillRR(CX, CY, w, h, rr, '#0f0c14', .96); neon(rrPath(CX, CY, w, h, rr), grad(CX - w / 2, CY - h / 2, CX + w / 2, CY + h / 2, [CR, AM, MG, VI]), 4, 1); phoneDetails(CX, CY, w, h, seg(u, .45, .2, lin) * out); }
    x.restore();
    typeAr('أحدث الأجهزة', seg(u, .45, .4, lin), CX, CY + 2, 32, { wt: 700, a: out });
  }],
  [3.3, 4.6, (u) => { // 3 sparkles
    cam(1);
    star4(CX + 70, CY - 30, 22 * bump(u, .02, .45), '#fff', u * 2, 1);
    const b = u < .95 ? seg(u, .42, .25, ob) * (1 - seg(u, .8, .15, io)) : 0;
    star4(CX, CY, 78 * b, OR, .3 - u * .8, 1); aura(CX, CY, 200 * b, 'rgba(255,120,0,.5)', b);
    star4(CX - 40, CY - 70, 14 * bump(u, .92, .35), CR, u * 3, 1);
    if (u > 1.0) { x.save(); x.globalAlpha = bump(u, 1.0, .3); x.fillStyle = '#fff'; x.fillRect(CX - 1.5, CY - 16, 3, 32); x.restore(); }
  }],
  [4.6, 6.8, (u) => { // 4 line + "turns on" + toggle
    cam(1); const out = 1 - seg(u, 2.0, .2, lin);
    const lw = 560 * seg(u, 0, .4, oc) * (1 - seg(u, .9, .35, io));
    if (lw > 2) { neon(() => { x.beginPath(); x.moveTo(CX - lw / 2, CY + 42); x.lineTo(CX + lw / 2, CY + 42); }, grad(CX - 280, 0, CX + 280, 0, [VI, MG, OR, AM]), 4, 1);
      neon(() => { x.beginPath(); x.roundRect(CX + lw / 2 - 2, CY + 30, 34, 24, 5); x.moveTo(CX + lw / 2 + 32, CY + 37); x.lineTo(CX + lw / 2 + 44, CY + 37); x.moveTo(CX + lw / 2 + 32, CY + 47); x.lineTo(CX + lw / 2 + 44, CY + 47); }, AM, 2.5, 1, null); }
    const tx = CX + 75 * seg(u, .95, .4, io);
    const left = typeAr('شحن سريع.', seg(u, .15, .45, lin), tx, CY, 46, { wt: 600, a: out });
    star4((left ?? CX) - 26, CY - 30, 12 * bump(u, .5, .45), '#fff', u * 4);
    const tg = seg(u, 1.1, .3, ob) * out; if (tg > .01) battery(CX - 190, CY, 124 * tg, 60 * tg, seg(u, 1.45, .5, io), out);
  }],
  [6.8, 7.3, (u) => { // 5 bracket draws into frame
    cam(1); const pts = rrPoints(CX, CY, 620, 300, 46); const p = seg(u, 0, .5, io);
    neon(polyPath(pts, .12 + .5 * p), grad(CX - 310, CY - 150, CX + 310, CY + 150, [MG, VI, AM, CR]), 5, 1);
    aura(CX + 120, CY - 150, 240 * p, 'rgba(255,61,139,.35)', p, 1.6, .6);
  }],
  [7.3, 9.3, (u) => { // 6 glowing card "the picture speaks"
    cam(1 + .06 * u / 2);
    const k = seg(u, 0, .35, oc);
    aura(CX + 260, CY + 30, 520, 'rgba(255,110,0,.55)', k, 1.2, 1);
    aura(CX + 120, CY - 200, 380, 'rgba(255,61,139,.5)', k, 1.5, .7);
    aura(CX - 320, CY + 150, 170, 'rgba(255,214,140,.6)', k);
    fillRR(CX, CY, 620, 300, 46, '#0d0b12', .97);
    neon(rrPath(CX, CY, 620, 300, 46), grad(CX - 310, CY + 150, CX + 310, CY - 150, [CR, AM, MG, OR]), 3.5, 1);
    typeAr('وكل الإكسسوارات.', seg(u, .1, .8, lin), CX, CY - 40, 36, { wt: 600 });
    iconRow(CX, CY + 60, seg(u, .7, .4, oc));
    if (u > 1.3) cross(CX + 250, CY + 105, 10, seg(u, 1.3, .2, lin));
  }],
  [9.3, 10.7, (u) => { // 7 zoom into the corner, light streak + click
    cam(1 + .08 * u / 1.4);
    const yL = CY + 170, xC = CX + 230, r = 110;
    aura(xC + 260, yL - 420, 900, 'rgba(255,100,0,.75)', 1, .8, 1.1);
    aura(xC + 120, yL - 120, 420, 'rgba(255,61,139,.6)', 1, 1, 1);
    aura(xC + 300, yL - 800, 420, 'rgba(255,190,90,.45)', 1);
    neon(() => { x.beginPath(); x.moveTo(-100, yL); x.lineTo(xC - r, yL); x.arcTo(xC, yL, xC, yL - r, r); x.lineTo(xC, -200); }, grad(0, yL, xC, 0, [AM, CR, MG, OR]), 9, 1);
    const sp = seg(u, 0, .65, oc), sx = lerp(-260, xC - 220, sp);
    x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 30; x.beginPath(); x.roundRect(sx - 120, yL - 9, 120, 18, 9); x.fill(); x.restore();
    const cp = seg(u, .65, .4, io); const kx = lerp(sx + 10, CX - 40, cp), ky = lerp(yL - 4, CY + 40, cp);
    cross(CX - 60, CY + 30, 26, 1);
    const clk = bump(u, 1.05, .35); aura(CX - 60, CY + 30, 140, 'rgba(255,255,240,.9)', clk);
    cursor(kx, ky, 1.5, u > 1.05 ? AM : null, 1);
  }],
  [10.7, 11.0, (u) => { // 8 white ball flash
    cam(1); const b = Math.sin(cl(u / .3) * Math.PI);
    aura(CX, CY, 260, 'rgba(255,200,120,.8)', b); x.save(); x.globalAlpha = b; x.fillStyle = '#fff8ea'; x.shadowColor = AM; x.shadowBlur = 60; x.beginPath(); x.arc(CX, CY, 70 + 20 * b, 0, 7); x.fill(); x.restore();
  }],
  [11.0, 13.3, (u) => { // 9 pattern ring + orbiting light "follows you"
    cam(1); const k = seg(u, 0, .45, oc), out = 1 - seg(u, 2.05, .25, io); const R = 300 * (.6 + .4 * k) * (0.4 + .6 * out);
    const rot = u * .5;
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI * 2 / 10; x.save(); x.globalAlpha = .5 * k * out; x.strokeStyle = 'rgba(255,140,70,.8)'; x.lineWidth = 4; x.beginPath(); x.arc(CX + R * Math.cos(a), CY + R * Math.sin(a), 34, 0, 7); x.stroke(); x.restore(); }
    const oa = rot - Math.PI / 2 + seg(u, .1, 2, io) * Math.PI * 2, ox = CX + R * Math.cos(oa), oy = CY + R * Math.sin(oa);
    aura(ox, oy, 120, 'rgba(255,61,139,.55)', k * out);
    neon(() => { x.beginPath(); x.arc(ox, oy, 38, 0, 7); }, grad(ox - 38, oy - 38, ox + 38, oy + 38, [MG, OR, AM]), 7, k * out);
    typeAr('كل الماركات', seg(u, .2, .5, lin), CX, CY - 30, 50, { wt: 700, a: out, glow: 'rgba(255,122,0,.6)' });
    typeAr('بمكان واحد', seg(u, .75, .4, lin), CX, CY + 32, 34, { wt: 600, a: out, col: '#ddd' });
  }],
  [13.3, 17.0, (u) => { // 10 the eye
    const pulse = 1 + .05 * seg(u, 1.5, 1.2, io) - .05 * seg(u, 2.7, .3, io);
    cam(lerp(.3, 1, seg(u, 0, .6, oc)) * pulse);
    const o = seg(u, 0, .7, oc), E = 390;
    const flash = bump(u, 3.0, .8); aura(CX - 120, CY - 60, 800, 'rgba(255,110,0,.7)', flash, 1.1, .9); aura(CX + 200, CY + 80, 500, 'rgba(255,61,139,.5)', flash);
    aura(CX, CY, 330, 'rgba(255,61,139,.22)', o, 1.4, .7);
    neon(() => { x.beginPath(); x.moveTo(CX - E, CY); x.quadraticCurveTo(CX, CY - 290 * o, CX + E, CY); x.quadraticCurveTo(CX, CY + 290 * o, CX - E, CY); x.closePath(); }, grad(CX - E, 0, CX + E, 0, [MG, VI, AM, OR, MG]), 8, 1);
    const pill = seg(u, 1.0, .3, ob) * (1 - seg(u, 2.9, .3, io)); const ir = lerp(96, 124, seg(u, 3.0, .4, oc));
    const ia = 1 - pill * .9; neon(() => { x.beginPath(); x.arc(CX, CY, ir * o, 0, 7); }, grad(CX - ir, 0, CX + ir, 0, [AM, CR, OR]), 9, ia * seg(u, .25, .3, lin));
    const fb = seg(u, .45, .35, ob) * (1 - seg(u, 1.0, .2, lin)) + seg(u, 3.1, .3, ob); if (fb > .01) { const B = 175 * (2 - Math.min(1, fb)) / 1, L = 46; neon(() => { x.beginPath(); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { x.moveTo(CX + a * B, CY + b * B - b * L); x.lineTo(CX + a * B, CY + b * B); x.lineTo(CX + a * B - a * L, CY + b * B); }); }, 'rgba(255,245,230,.9)', 3, Math.min(1, fb), null); }
    if (pill > .01) { const fy = CY + 6 * Math.sin(u * 3); fillRR(CX, fy, 480 * pill, 84 * pill, 42 * pill, '#0d0b12', .96); neon(rrPath(CX, fy, 480 * pill, 84 * pill, 42 * pill), 'rgba(255,240,225,.8)', 2, pill, null); typeAr('فحص دقيق لجهازك.', seg(u, 1.1, .5, lin), CX, fy + 1, 32, { wt: 600, a: pill }); }
  }],
  [17.0, 17.8, (u) => { // 11 iris shrinks to iridescent ring
    cam(1); const r = lerp(124, 48, seg(u, 0, .5, io)); const sq = 1 - .15 * bump(u, .5, .3);
    [[MG, 0], [OR, 2.1], [AM, 4.2]].forEach(([c, ph]) => { const ox = 6 * Math.cos(u * 6 + ph), oy = 6 * Math.sin(u * 6 + ph); neon(() => { x.beginPath(); x.ellipse(CX + ox, CY + oy, r, r * sq, 0, 0, 7); }, c, 5, .9, null); });
    neon(() => { x.beginPath(); x.ellipse(CX, CY, r, r * sq, 0, 0, 7); }, 'rgba(255,250,240,.9)', 2, 1, null);
  }],
  [17.8, 19.4, (u) => { // 12 it takes shape -> a cracked screen gets repaired
    cam(1); const sc = Math.max(0, seg(u, 0, .4, ob)), fix = seg(u, .55, .6, io), fl = 8 * Math.sin(u * 2.5);
    const pw = 300 * sc, ph = 600 * sc, py = CY - 60 + fl;
    aura(CX, py, 420, 'rgba(255,110,0,.3)', sc);
    fillRR(CX, py, pw, ph, 50 * sc, '#0d0b12', 1);
    if (sc > .05) {
      x.save(); x.beginPath(); x.roundRect(CX - pw / 2, py - ph / 2, pw, ph, Math.max(0, 50 * sc)); x.clip();
      // crack lines fade as the repair sweep passes
      const ca = 1 - fix; if (ca > 0) { x.strokeStyle = `rgba(255,255,255,${.75 * ca})`; x.lineWidth = 2; x.beginPath();
        [[[0, 0], [-60, -90], [-80, -200], [-130, -260]], [[0, 0], [70, -60], [90, -170], [140, -230]], [[0, 0], [-40, 110], [-110, 160], [-150, 260]], [[0, 0], [90, 80], [100, 200], [150, 290]], [[-60, -90], [-140, -70]], [[70, -60], [150, -40]], [[-40, 110], [40, 170], [60, 260]]].forEach((pts) => { pts.forEach(([a, b], i) => { const px = CX + 20 + a * sc, yy = py + 40 + b * sc; i ? x.lineTo(px, yy) : x.moveTo(px, yy); }); }); x.stroke(); }
      // repair sweep
      const sy = py + ph / 2 - ph * fix; if (fix > 0 && fix < 1) { const g = x.createLinearGradient(0, sy - 60, 0, sy + 60); g.addColorStop(0, 'rgba(255,140,0,0)'); g.addColorStop(.5, 'rgba(255,190,90,.55)'); g.addColorStop(1, 'rgba(255,140,0,0)'); x.fillStyle = g; x.fillRect(CX - pw / 2, sy - 60, pw, 120); }
      if (fix >= 1) { x.globalAlpha = .9 * seg(u, 1.15, .3, oc); x.drawImage(mark, CX - 90, py - 70, 180, 180 * mark.height / mark.width); }
      x.restore();
      neon(phonePath(CX, py, pw, ph), grad(CX - pw / 2, py - ph / 2, CX + pw / 2, py + ph / 2, [CR, AM, MG, OR]), 4, 1); phoneDetails(CX, py, pw, ph, sc);
    }
    [[CX - 330, 0.9, 14], [CX + 360, .4, 10], [CX - 250, 1.4, 20], [CX + 280, 1.2, 7], [CX - 120, .2, 9]].forEach(([bx, d, r], i) => { const y = CY + 330 - 520 * ((u * .35 + d * .3) % 1); neon(() => { x.beginPath(); x.arc(bx, y, r, 0, 7); }, [MG, OR, AM][i % 3], 2.5, .8 * sc, null); });
    typeAr('تصليح شاشات وبطاريات', seg(u, .3, .7, lin), CX, CY + 400, 40, { wt: 700, glow: 'rgba(255,122,0,.5)' });
  }],
  [19.4, 22.9, (u) => { // 13 giant pill zoom-out "one click"
    const z = lerp(5, 1, seg(u, 0, 1.4, io)); const dr = 120 * seg(u, 2.3, 1.2, io);
    cam(z, CX - 330, CY, dr, 0);
    const pw = 980, ph = 420, out = 1 - seg(u, 3.2, .3, lin);
    neon(rrPath(CX, CY, pw, ph, ph / 2), grad(CX - pw / 2, CY - ph / 2, CX + pw / 2, CY + ph / 2, [AM, OR, MG, VI]), 60, .55 * out, null);
    fillRR(CX, CY, pw, ph, ph / 2, '#0b0a10', 1);
    neon(rrPath(CX, CY, pw, ph, ph / 2), grad(CX - pw / 2, CY - ph / 2, CX + pw / 2, CY + ph / 2, [CR, AM, MG, OR]), 10, out);
    x.setTransform(1, 0, 0, 1, 0, 0);
    typeAr('وصيانة لكل الأجهزة', seg(u, 1.35, .7, lin), CX + dr * .6 * G, CY, 92, { wt: 700, a: out });
  }],
  [22.9, 26.0, (u) => { // 14 cursor draws a line -> selection frame "frame"
    cam(1);
    const lp = seg(u, .4, .4, io), ex = seg(u, .9, .3, io), dg = seg(u, 2.2, .85, io);
    const fw = lerp(lerp(0, 280, lp), 420, ex) + 100 * dg, fh = lerp(4, 140, ex) + 480 * dg;
    if (ex < .02 && lp > 0) neon(() => { x.beginPath(); x.moveTo(CX - 140, CY); x.lineTo(CX - 140 + 280 * lp, CY); }, grad(CX - 140, 0, CX + 140, 0, [AM, OR, MG]), 4, 1);
    if (ex > .02) {
      x.save(); x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1.6; x.strokeRect(CX - fw / 2, CY - fh / 2, fw, fh);
      x.fillStyle = '#fff'; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => x.fillRect(CX + a * fw / 2 - 4, CY + b * fh / 2 - 4, 8, 8)); x.restore();
      typeAr('حماية لجهازك', seg(u, 1.1, .45, lin), CX, CY, 32, { wt: 700 });
    }
    let kx, ky; const c0 = [CX + 60, CY + 50];
    if (u < .4) { kx = c0[0]; ky = c0[1]; } else if (u < .9) { kx = CX - 140 + 280 * lp; ky = CY; }
    else if (u < 1.4) { kx = CX + 140; ky = CY; } else { const m = seg(u, 1.4, .5, io); kx = lerp(CX + 140, CX + fw / 2, m); ky = lerp(CY, CY + fh / 2, m); }
    cursor(kx, ky, 1.4, u > 2.0 ? OR : null, seg(u, .05, .2, lin));
  }],
  [26.0, 27.4, (u) => { // 15 frame lights up "no more shake"
    cam(1); const k = seg(u, 0, .3, oc);
    aura(CX + 90, CY + 150, 320, 'rgba(255,120,0,.75)', k, 1.6, .45);
    aura(CX - 200, CY - 120, 260, 'rgba(255,61,139,.35)', k, 1.4, .6);
    neon(rrPath(CX, CY, 520, 620, 34), grad(CX - 260, CY - 310, CX + 260, CY + 310, [VI, MG, AM, OR]), 4.5, k);
    x.save(); x.fillStyle = '#fff'; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => x.fillRect(CX + a * 260 - 4, CY + b * 310 - 4, 8, 8)); x.restore();
    const sh = seg(u, 0, .45, ob), sy0 = CY - 70; neon(() => { x.beginPath(); x.moveTo(CX, sy0 - 120 * sh); x.quadraticCurveTo(CX + 50 * sh, sy0 - 95 * sh, CX + 100 * sh, sy0 - 95 * sh); x.quadraticCurveTo(CX + 105 * sh, sy0 + 40 * sh, CX, sy0 + 120 * sh); x.quadraticCurveTo(CX - 105 * sh, sy0 + 40 * sh, CX - 100 * sh, sy0 - 95 * sh); x.quadraticCurveTo(CX - 50 * sh, sy0 - 95 * sh, CX, sy0 - 120 * sh); x.closePath(); }, grad(CX - 100, sy0 - 120, CX + 100, sy0 + 120, [AM, OR, MG]), 5, k);
    neon(() => { x.beginPath(); x.moveTo(CX - 40 * sh, sy0); x.lineTo(CX - 8 * sh, sy0 + 32 * sh); x.lineTo(CX + 46 * sh, sy0 - 30 * sh); }, '#fff', 4, k * seg(u, .35, .3, lin), null);
    typeAr('كفرات وشاشات حماية.', seg(u, .35, .6, lin), CX, CY + 130, 36, { wt: 600 });
    cursor(CX - 260, CY - 310, 1.4, null, 1);
  }],
  [27.4, 28.4, (u) => { // 16 frame collapses to a bar, then a line
    cam(1); const c = seg(u, 0, .35, io), t2 = seg(u, .45, .45, io);
    const w = lerp(lerp(520, 560, c), 420, t2), h = lerp(lerp(620, 16, c), 4, t2);
    neon(rrPath(CX, CY, w, h, Math.min(34, h / 2)), grad(CX - w / 2, 0, CX + w / 2, 0, [VI, MG, CR, OR]), lerp(4.5, 3, t2), 1);
    if (c > .8) { x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = .5 * (1 - t2); x.fillStyle = grad(CX - w / 2, 0, CX + w / 2, 0, [MG, OR]); rrPath(CX, CY, w, h, h / 2)(); x.fill(); x.restore(); }
    cursor(CX - w / 2 - 6, CY + 6, 1.4, null, 1);
  }],
  [28.4, 31.0, (u) => { // 17 the line becomes a wave "your frequency"
    cam(1); const amp = 115 * seg(u, 0, .7, oc), out = 1 - seg(u, 2.35, .25, lin);
    [[MG, 0], [OR, 1.1], [AM, 2.2], [CR, 3.3]].forEach(([c, ph], i) => {
      neon(() => { x.beginPath(); for (let px = CX - 310; px <= CX + 310; px += 4) { const env = Math.exp(-Math.pow((px - CX) / 175, 2)); const y = CY + amp * env * Math.sin((px - CX) * 2 * Math.PI / 200 + u * 5 + ph) * (i % 2 ? .8 : 1); px === CX - 310 ? x.moveTo(px, y) : x.lineTo(px, y); } }, c, 3.5, .85 * out, i === 3 ? 'rgba(255,255,255,.9)' : null);
    });
    typeAr('وسماعات بصوت نقي.', seg(u, .6, .7, lin), CX, CY - 190, 36, { wt: 600, a: out });
    cursor(CX - 316, CY + 6, 1.4, null, 1 - seg(u, .3, .3, lin));
  }],
  [31.0, 33.4, (u) => { // 18 neon lines sweep in and cross
    cam(1); const r = 100, m = seg(u, 1.4, .6, io), out = 1 - seg(u, 2.15, .25, io);
    const ax = lerp(CX + 80, CX, m), ay = lerp(CY - 280, CY, m);
    const bx = lerp(CX - 60, CX, m), by = lerp(CY + 150, CY, m);
    const pa = seg(u, 0, .6, oc), pb = seg(u, .45, .6, oc);
    const A = []; for (let i = 0; i <= 120; i++) { const d = i / 120; if (d < .7) A.push([lerp(-40, ax - r, d / .7), ay]); else { const a = Math.PI / 2 + (d - .7) / .3 * Math.PI / 2; A.push([ax - r - r * Math.cos(a) , ay - r + r * Math.sin(a) - r + r]); } }
    const Ap = () => { x.beginPath(); x.moveTo(-40, ay); x.lineTo(lerp(-40, ax + 200, pa) < ax - r ? lerp(-40, ax + 200, pa) : ax - r, ay); if (pa > .7) { x.arcTo(ax, ay, ax, ay - r, r); x.lineTo(ax, lerp(ay - r, -60, (pa - .7) / .3)); } };
    const Bp = () => { x.beginPath(); x.moveTo(bx, H + 40); const yy = lerp(H + 40, by + r, Math.min(1, pb / .6)); x.lineTo(bx, yy); if (pb > .6) { x.arcTo(bx, by, bx + r, by, r); x.lineTo(lerp(bx + r, W + 60, (pb - .6) / .4), by); } };
    neon(Ap, grad(0, ay, ax, 0, [VI, MG, AM]), 7, out);
    neon(Bp, grad(bx, H, W, by, [OR, MG, CR]), 7, out);
    if (m > .3) { neon(() => { x.beginPath(); x.moveTo(ax, ay); x.lineTo(ax + 300 * m, ay); }, grad(ax, 0, ax + 300, 0, [AM, CR]), 7, out * m); neon(() => { x.beginPath(); x.moveTo(bx, by); x.lineTo(bx, by - 300 * m); }, grad(0, by, 0, by - 300, [MG, OR]), 7, out * m); }
    const fl = bump(u, 1.85, .45); aura(CX, CY, 260, 'rgba(255,230,190,.9)', fl);
  }],
  [33.4, 37.8, (u) => { // 19-20 logo assembles in slices, settles, end info
    cam(1 / G);
    const arcsA = seg(u, 0, .3, lin) * (1 - seg(u, 1.6, .5, lin)); const sp = 20 * u;
    [[-1, -1, MG], [1, -1, OR], [-1, 1, AM], [1, 1, VI]].forEach(([a, b, c]) => { const px = CX + a * (330 + sp), py = CY - 60 + b * (300 + sp); neon(() => { x.beginPath(); x.arc(px, py, 60, a < 0 ? (b < 0 ? Math.PI : Math.PI / 2) : (b < 0 ? -Math.PI / 2 : 0), (a < 0 ? (b < 0 ? Math.PI : Math.PI / 2) : (b < 0 ? -Math.PI / 2 : 0)) + Math.PI / 2); }, c, 5, arcsA, null); });
    if (!logo.complete) return;
    const lw = 760, lh = lw * logo.height / logo.width, lx = CX - lw / 2, ly = CY - 80 - lh / 2;
    const settle = seg(u, 1.4, .6, oc), end = 1 - seg(u, 4.0, .4, lin);
    aura(CX, CY - 60, 520, 'rgba(255,110,0,.28)', settle * end);
    const N = 14;
    for (let i = 0; i < N; i++) {
      const st = ((i * 7) % N) / N * .9 + .1; const p = seg(u, st, .35, oq); if (p <= 0) continue;
      const jit = (1 - p) * ((i % 2 ? 1 : -1) * 90) * (1 - settle);
      const sy0 = i / N * logo.height, sh = logo.height / N;
      x.save(); x.globalAlpha = cl(p * 1.5) * end; x.shadowColor = 'rgba(255,120,0,.7)'; x.shadowBlur = 30 + 20 * Math.sin(u * 2.4) * settle;
      x.drawImage(logo, 0, sy0, logo.width, sh, lx + jit, ly + i / N * lh, lw, lh / N + .6); x.restore();
    }
    const info = seg(u, 2.0, .5, oc) * end;
    if (info > 0) {
      x.save(); x.globalAlpha = info; x.fillStyle = grad(CX - 200, 0, CX + 200, 0, ['rgba(255,122,0,0)', OR, 'rgba(255,122,0,0)']); x.fillRect(CX - 200 * info, CY + 290, 400 * info, 3); x.restore();
      typeAr('لسنا مجرد خيار... نحن المعيار', 1, CX, CY + 360, 40, { wt: 700, a: info, caret: false, glow: 'rgba(255,122,0,.45)' });
      x.save(); x.globalAlpha = info * .9; font(32, 500, 'Man'); x.direction = 'ltr'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#e8e2da';
      x.fillText('@the.danielsphone  ·  +970 599 996 762', CX, CY + 500); x.restore();
      typeAr('بيت جالا · شارع معصرة الزيتون', 1, CX, CY + 430, 32, { wt: 600, a: info * .9, caret: false, col: '#e8e2da', glow: 'rgba(0,0,0,0)' });
    }
  }],
];

function bg() {
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.shadowBlur = 0;
  x.fillStyle = '#0c0a11'; x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(CX, CY, 200, CX, CY, 1150); g.addColorStop(0, 'rgba(30,22,40,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
}
window.renderAt = async function (t) {
  bg();
  for (const [a, b, f] of SHOTS) if (t >= a && t < b) { x.save(); f(t - a); x.restore(); x.setTransform(1, 0, 0, 1, 0, 0); }
  // fade to black at the very end
  if (t > 37.4) { x.fillStyle = `rgba(0,0,0,${cl((t - 37.4) / .4)})`; x.fillRect(0, 0, W, H); }
};
Promise.all([document.fonts.ready, mark.decode(), logo.decode()]).then(() => { window.ready = true; });
