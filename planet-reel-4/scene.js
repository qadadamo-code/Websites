import * as THREE from 'three';
import { SVGLoader } from './assets/SVGLoader.js';

const Q = new URLSearchParams(location.search);
const W = +(Q.get('w') || 1080), H = +(Q.get('h') || 1920);
const S = W / 1080; // 2D overlay scale
const C = { mintS: '#62AE95', cream: '#EEE6D4', paper: '#F7F3E9', navy: '#143659', navy2: '#24497A', mint: '#92C5B4', mintD: '#5E9C88', mintL: '#C9E3DA' };
const col = (h) => new THREE.Color(h);

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eo = (x) => 1 - Math.pow(1 - x, 3);
const ei = (x) => x * x * x;
const eoExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const eiExpo = (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10));
const eioExpo = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
const back = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- renderer ----------
const out = document.getElementById('out'); out.width = W; out.height = H;
const octx = out.getContext('2d');
const gl = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
gl.setPixelRatio(1); gl.setSize(W, H);
gl.outputColorSpace = THREE.SRGBColorSpace;
gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = col(C.cream);
const cam = new THREE.PerspectiveCamera(50, W / H, 0.05, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d0bd, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(6, 14, 8); scene.add(sun); scene.add(sun.target);
sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 }); sun.shadow.radius = 6;

// ---------- canvas helpers ----------
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; return t; }
function rr(x, ctx, X, Y, w, h, r) { ctx.beginPath(); ctx.roundRect(X, Y, w, h, r); }
// text canvas: returns {c, w, h}
function textCanvas(text, o = {}) {
  const size = o.size || 200, font = `${o.style || ''} ${o.weight || 700} ${size}px ${o.family || 'Plex'}`;
  const m = cv(8, 8).getContext('2d'); m.font = font; m.direction = o.dir || 'rtl';
  const lines = String(text).split('\n');
  const lh = size * (o.lh || 1.15);
  const tw = Math.max(...lines.map((l) => m.measureText(l).width));
  const pad = o.pad ?? size * 0.25;
  const c = cv(Math.ceil(tw + pad * 2), Math.ceil(lh * lines.length + pad * 2));
  const x = c.getContext('2d');
  if (o.bg) { x.fillStyle = o.bg; rr(0, x, o.bgInset || 0, o.bgInset || 0, c.width - 2 * (o.bgInset || 0), c.height - 2 * (o.bgInset || 0), o.radius ?? c.height / 2); x.fill(); if (o.bgStroke) { x.lineWidth = o.bgStrokeW || 8; x.strokeStyle = o.bgStroke; x.stroke(); } }
  x.font = font; x.direction = o.dir || 'rtl'; x.textAlign = 'center'; x.textBaseline = 'middle';
  lines.forEach((l, i) => {
    const y = pad + lh * (i + 0.5) + (o.dy || 0) * size;
    if (o.stroke) { x.lineJoin = 'round'; x.lineWidth = o.strokeW || size * 0.06; x.strokeStyle = o.stroke; x.strokeText(l, c.width / 2, y); }
    if (o.color !== 'none') { x.fillStyle = o.color || C.navy; x.fillText(l, c.width / 2, y); }
  });
  return c;
}
// plane from canvas, width in world units
function planeOf(c, width, o = {}) {
  const h = width * c.height / c.width;
  const m = new THREE.MeshBasicMaterial({ map: o.map || tex(c), transparent: true, alphaTest: o.alphaTest ?? 0.03, side: THREE.DoubleSide, depthWrite: o.depthWrite ?? true, fog: o.fog ?? false, opacity: o.opacity ?? 1 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(width, h), m); p.userData.h = h; return p;
}
// extruded text: face canvas + side canvas stacked
function extruded(text, o) {
  const g = new THREE.Group();
  const faceC = textCanvas(text, { ...o, color: o.face, stroke: o.faceStroke, strokeW: o.faceStrokeW });
  const sideC = textCanvas(text, { ...o, color: o.side, stroke: o.side, strokeW: o.sideStrokeW ?? (o.size || 200) * 0.03 });
  const width = o.width; const n = o.layers ?? 18; const depth = o.depth ?? width * 0.08;
  const sideTex = tex(sideC);
  for (let i = n; i >= 1; i--) { const p = planeOf(sideC, width, { map: sideTex, alphaTest: 0.5 }); p.position.z = -depth * i / n; g.add(p); }
  const f = planeOf(faceC, width, { alphaTest: 0.3 }); f.position.z = 0.002; g.add(f);
  g.userData.h = width * faceC.height / faceC.width; g.userData.face = f;
  return g;
}
function line3(points, color, opacity = 1) {
  const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
}
function torusRing(r, tube, color, opacity = 1) {
  return new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 128), new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, fog: true }));
}
function tickRing(r, n, len, color, tube = 0.012) {
  const g = new THREE.Group(); g.add(torusRing(r, tube, color));
  const geo = new THREE.BoxGeometry(tube * 1.6, tube * 1.6, len); const m = new THREE.MeshBasicMaterial({ color });
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const b = new THREE.Mesh(geo, m); const L = i % 5 === 0 ? 1.8 : 1; b.scale.z = L; b.position.set(Math.cos(a) * (r + len * L / 2), Math.sin(a) * (r + len * L / 2), 0); b.lookAt(0, 0, 0); g.add(b); }
  return g; // ring in XY plane
}
function gridTex(lineCol, bg, cells = 1, lw = 3, sub = 0) {
  const c = cv(512, 512), x = c.getContext('2d');
  if (bg) { x.fillStyle = bg; x.fillRect(0, 0, 512, 512); }
  x.strokeStyle = lineCol; x.lineWidth = lw;
  const s = 512 / cells;
  for (let i = 0; i <= cells; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, 512); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(512, i * s); x.stroke(); }
  if (sub) { x.globalAlpha = 0.35; x.lineWidth = lw * 0.5; const s2 = s / sub; for (let i = 0; i <= cells * sub; i++) { x.beginPath(); x.moveTo(i * s2, 0); x.lineTo(i * s2, 512); x.stroke(); x.beginPath(); x.moveTo(0, i * s2); x.lineTo(512, i * s2); x.stroke(); } }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function floor(lineCol, cell = 2, size = 300, opacity = 0.55, sub = 0) {
  const t = gridTex(lineCol, null, 1, 3, sub); t.repeat.set(size / cell, size / cell);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity, depthWrite: false, fog: true }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = -1; return m;
}
function shadowFloor(size = 200) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShadowMaterial({ opacity: 0.18, color: col(C.navy) }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.001; m.receiveShadow = true; return m;
}
function dots(n, spread, color, seed, size = 0.05) {
  const r = rng(seed); const g = new THREE.Group(); const geo = new THREE.SphereGeometry(size, 8, 8); const m = new THREE.MeshBasicMaterial({ color });
  for (let i = 0; i < n; i++) { const d = new THREE.Mesh(geo, m); d.position.set((r() - 0.5) * spread, r() * spread * 0.6, (r() - 0.5) * spread); d.scale.setScalar(0.5 + r() * 1.5); g.add(d); }
  return g;
}
function monoLabel(text, o = {}) {
  return textCanvas(text, { family: 'Mono', weight: 500, size: o.size || 64, color: o.color || C.navy, dir: 'ltr', pad: 18, bg: o.bg, bgStroke: o.bgStroke, bgStrokeW: 5, radius: o.radius ?? 14 });
}
function setCam(p, look, roll = 0, fov = 50) {
  cam.position.set(...p); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(...look);
  if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
const V = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function path(keys, t) { // keys: [[time, [x,y,z]], ...] with eio between
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [ta, a, e] = keys[i], [tb, b] = keys[i + 1]; if (t <= tb) return V(a, b, (e || eio)(seg(t, ta, tb))); }
  return keys[keys.length - 1][1];
}
function num(keys, t) { return path(keys.map(([a, v, e]) => [a, [v, 0, 0], e]), t)[0]; }

const FONTS=['900 100px Kufi','700 100px Plex','300 100px Plex','500 100px Plex','700 100px Marhey','900 100px Cairo','800 100px Inter','500 100px Mono'];
await Promise.all(FONTS.map((f)=>document.fonts.load(f))); await document.fonts.ready;
// ---------- shots ----------
const shots = [];
function shot(t0, t1, build) { const g = new THREE.Group(); g.visible = false; scene.add(g); const s = { t0, t1, g, ...build(g) }; shots.push(s); return s; }

// S1a  0.00-0.95  "إنت" outlined inside a mint circle
shot(0, 0.95, (g) => {
  g.add(floor(C.navy, 2, 300, 0.22));
  const ring = torusRing(2.7, 0.035, C.mintD); ring.position.set(0, 2.4, -0.6); g.add(ring);
  const ring2 = tickRing(3.4, 72, 0.12, C.mintD, 0.01); ring2.position.set(0, 2.4, -0.8); g.add(ring2);
  const outl = textCanvas('إنت', { family: 'Kufi', weight: 900, size: 360, color: 'rgba(247,243,233,0.55)', stroke: C.navy, strokeW: 14 });
  const t1 = planeOf(outl, 5.2); t1.position.set(0, 2.4, 0); g.add(t1);
  const shadowC = textCanvas('إنت', { family: 'Kufi', weight: 900, size: 360, color: 'rgba(20,54,89,0.10)' });
  for (let i = 1; i <= 8; i++) { const p = planeOf(shadowC, 5.2, { alphaTest: 0.05 }); p.position.set(0, 2.4, -i * 0.03); g.add(p); }
  [[-1.8, 0.6], [1.6, -0.4], [0.2, 1.4], [2.6, 1.2]].forEach(([x, z]) => { g.add(line3([[x, 0, z], [x, 2.2, z]], C.mintD)); const r = torusRing(0.18, 0.01, C.mintD); r.rotation.x = Math.PI / 2; r.position.set(x, 0.01, z); g.add(r); });
  g.add(dots(30, 14, C.navy, 3, 0.035));
  return {
    update(t) {
      ring.rotation.z = t * 0.6; ring2.rotation.z = -t * 0.4;
      const k = eo(seg(t, 0, 0.95));
      const p = path([[0, [-2.6, 2.4, 9.5]], [0.62, [1.0, 2.2, 6.4], eo], [0.95, [3.6, 1.6, 2.4]]], t);
      const look = path([[0, [0.2, 2.4, 0]], [0.62, [0, 2.4, 0]], [0.95, [-2.5, 2.2, -1]]], t);
      setCam(p, look, lerp(0.12, -0.05, k));
    },
    blur(t) { return t > 0.7 ? 5 : 1; },
  };
});

// S1b 0.95-2.05  "عارف" / "إنك محتاج" billboards
shot(0.95, 2.05, (g) => {
  g.add(floor(C.navy, 2, 300, 0.22));
  const a = extruded('عارف', { family: 'Kufi', weight: 900, size: 260, face: C.mint, side: C.navy, faceStroke: C.navy, faceStrokeW: 6, width: 4.4, depth: 0.45, layers: 22, pad: 40 });
  a.position.set(0.1, 3.55, 0); a.rotation.set(0.05, 0.08, -0.06); g.add(a);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(4.9, 1.55, 0.25), new THREE.MeshBasicMaterial({ color: C.mint }));
  slab.position.set(0.2, 1.95, -0.35); slab.rotation.set(0, 0.08, -0.04); g.add(slab);
  const slabE = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: C.navy })); slab.add(slabE);
  const b = extruded('إنك محتاج', { family: 'Kufi', weight: 900, size: 220, face: C.navy, side: C.navy2, width: 4.6, depth: 0.3, layers: 14, pad: 30 });
  b.position.set(0.1, 2.05, 0); b.rotation.set(0, 0.08, -0.04); g.add(b);
  const l1 = planeOf(monoLabel('+24/7'), 0.9); l1.position.set(1.4, 1.0, 0.1); g.add(l1);
  const l2 = planeOf(monoLabel('+12.4 K', { size: 44 }), 0.6); l2.position.set(-1.7, 4.9, 0); g.add(l2);
  const c2 = torusRing(0.42, 0.01, C.navy); c2.position.set(-1.7, 4.95, -0.05); g.add(c2);
  [[-1.2, 0], [0.9, 0], [1.6, 0]].forEach(([x]) => g.add(line3([[x, 0, -0.3], [x, 1.2, -0.3]], C.mintD)));
  const bigR = tickRing(4.2, 90, 0.15, C.mintD, 0.012); bigR.rotation.x = Math.PI / 2; bigR.position.set(0, 0.02, 0); g.add(bigR);
  g.add(dots(26, 14, C.navy, 7, 0.035));
  return {
    update(t) {
      const lt = t - 0.95;
      a.scale.setScalar(lerp(0.9, 1, back(seg(lt, 0, 0.25)))); b.scale.setScalar(lerp(0.85, 1, back(seg(lt, 0.06, 0.3))));
      bigR.rotation.z = lt * 0.5;
      const p = path([[0, [-3.2, 1.4, 4.2]], [0.75, [1.6, 2.6, 6.4], eo], [1.1, [4.5, 3.5, 2.0]]], lt);
      const look = path([[0, [0, 3.0, 0]], [0.75, [0, 2.8, 0]], [1.1, [3, 3, -3]]], lt);
      setCam(p, look, lerp(-0.18, 0.06, eo(seg(lt, 0, 0.75))) + (lt > 0.75 ? -0.3 * ei(seg(lt, 0.75, 1.1)) : 0));
    },
    blur(t) { return t < 1.05 || t > 1.75 ? 5 : 1; },
  };
});

// S2 2.05-4.05 tower with counter ; 4.05-4.75 mint card wipe
let towerCounter = { c: null, t: null, last: '' };
shot(2.05, 4.75, (g) => {
  g.add(floor(C.navy, 2, 300, 0.2));
  const navyM = new THREE.MeshStandardMaterial({ color: C.navy, roughness: 0.6 });
  const mintM = new THREE.MeshStandardMaterial({ color: C.mint, roughness: 0.5 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 1.8), navyM); base.position.y = 0.18; g.add(base);
  // ruler column
  const rc = cv(256, 1536), x = rc.getContext('2d'); x.fillStyle = C.navy; x.fillRect(0, 0, 256, 1536);
  for (let i = 0; i < 60; i++) { const y = 1536 - i * 25.6; x.fillStyle = i % 5 === 0 ? C.mint : 'rgba(146,197,180,0.7)'; const L = i % 5 === 0 ? 70 : 38; x.fillRect(18, y - 3, L, 6); x.fillRect(238 - L, y - 3, L, 6); }
  x.font = '500 54px Mono'; x.fillStyle = C.paper; x.textAlign = 'center';
  [5, 10, 15, 20].forEach((n, i) => x.fillText(String(n).padStart(2, '0'), 128, 1536 - (i + 1) * 300 + 18));
  const colG = new THREE.BoxGeometry(1.1, 6.2, 0.85);
  const rulerM = new THREE.MeshStandardMaterial({ map: tex(rc), roughness: 0.6 });
  const column = new THREE.Mesh(colG, [navyM, navyM, navyM, navyM, rulerM, rulerM]); column.position.y = 3.45; g.add(column);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 1.6), mintM); cap.position.y = 6.85; g.add(cap);
  const capE = new THREE.LineSegments(new THREE.EdgesGeometry(cap.geometry), new THREE.LineBasicMaterial({ color: C.navy })); cap.add(capE);
  // counter pill on cap
  const cc = cv(512, 128); towerCounter.c = cc; towerCounter.t = tex(cc);
  const pill = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: towerCounter.t, transparent: true }));
  pill.position.set(0, 6.85, 0.81); g.add(pill);
  // highlight band
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.18, 0.9), new THREE.MeshBasicMaterial({ color: C.mintL, transparent: true, opacity: 0.85 })); g.add(band);
  const rings = [1.2, 3.2, 5.2].map((y, i) => { const r = tickRing(2.6 + i * 0.25, 80, 0.14, C.mintD, 0.014); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); return r; });
  const ground = tickRing(3.4, 100, 0.2, C.navy, 0.02); ground.rotation.x = Math.PI / 2; ground.position.y = 0.02; g.add(ground);
  g.add(dots(40, 16, C.mintD, 11, 0.04));
  g.add(shadowFloor());
  // mint card for wipe
  const cardC = cv(512, 700), cx = cardC.getContext('2d'); cx.fillStyle = C.mint; rr(0, cx, 0, 0, 512, 700, 60); cx.fill();
  cx.fillStyle = C.navy; cx.font = '900 150px Kufi'; cx.textAlign = 'center'; cx.direction = 'rtl'; cx.fillText('بلانت', 256, 420);
  const card = planeOf(cardC, 2.6); g.add(card);
  return {
    update(t) {
      const lt = t - 2.05;
      const val = 5 + 10.2 * eio(seg(lt, 0.1, 1.9));
      const s = '+' + val.toFixed(1) + ' K';
      if (s !== towerCounter.last) { const x = cc.getContext('2d'); x.clearRect(0, 0, 512, 128); x.fillStyle = C.paper; rr(0, x, 6, 6, 500, 116, 58); x.fill(); x.fillStyle = C.navy; x.font = '500 72px Mono'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 256, 68); towerCounter.t.needsUpdate = true; towerCounter.last = s; }
      band.position.y = 0.8 + 5.6 * eio(seg(lt, 0.1, 1.9));
      rings.forEach((r, i) => { r.rotation.z = lt * (i % 2 ? -0.5 : 0.4); r.position.y = [1.2, 3.2, 5.2][i] + Math.sin(lt * 2 + i) * 0.1; });
      const ang = lerp(-0.5, 1.2, eio(seg(lt, 0, 2.0)));
      const rad = lerp(6.0, 8.5, eio(seg(lt, 0, 2.0)));
      const y = lerp(0.8, 6.2, eio(seg(lt, 0, 2.0)));
      setCam([Math.sin(ang) * rad, y, Math.cos(ang) * rad], [0, lerp(2.4, 4.6, eio(seg(lt, 0, 2))), 0], lerp(0.12, -0.08, seg(lt, 0, 2)));
      // card wipe 4.05-4.75
      const k = seg(t, 4.05, 4.75);
      card.visible = t > 4.05;
      if (card.visible) {
        const cp = cam.position.clone(); const dir = new THREE.Vector3(); cam.getWorldDirection(dir);
        const right = new THREE.Vector3().crossVectors(dir, cam.up).normalize(); const up = new THREE.Vector3().crossVectors(right, dir).normalize();
        const d = lerp(3.5, 0.6, eiExpo(k) * 0.4 + eio(k) * 0.6);
        const pos = cp.clone().add(dir.clone().multiplyScalar(d)).add(right.clone().multiplyScalar(lerp(-2.5, 0.1, eo(k)))).add(up.clone().multiplyScalar(lerp(-3.2, 0, eo(k))));
        card.position.copy(pos); card.quaternion.copy(cam.quaternion); card.rotateZ(lerp(0.8, 0.1, eo(k))); card.rotateY(lerp(-0.6, 0, k));
      }
    },
    blur(t) { return t < 2.25 || t > 4.1 ? 5 : 1; },
  };
});

// S3 5.0-8.3 blueprint grid, rings stacking + mini city
shot(4.75, 8.3, (g) => {
  g.add(floor(C.mintD, 2, 300, 0.55, 4));
  const r = rng(21);
  const ringsG = new THREE.Group(); g.add(ringsG);
  const bandTex = (() => { const c = cv(2048, 128), x = c.getContext('2d'); x.fillStyle = C.paper; x.fillRect(0, 0, 2048, 128); x.fillStyle = C.mintD; x.fillRect(0, 0, 2048, 6); x.fillRect(0, 122, 2048, 6); for (let i = 0; i < 160; i++) { const L = i % 10 === 0 ? 60 : 26; x.fillRect(i * 12.8, 6, 2, L); } x.font = '500 46px Mono'; x.fillStyle = C.mintD; for (let k = 0; k < 4; k++) x.fillText(['MARKETING','SOCIAL MEDIA','BRANDING','WEB · APPS'][k], 120 + k * 512, 104); return tex(c); })();
  const rings = [];
  for (let i = 0; i < 7; i++) {
    const R = 2.4 + (i % 2) * 0.25 - i * 0.03; const h = 0.45;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(R, R, h, 96, 1, true), new THREE.MeshBasicMaterial({ map: bandTex, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }));
    const top = torusRing(R, 0.015, C.mintD); top.rotation.x = Math.PI / 2; top.position.y = h / 2; m.add(top);
    const bot = top.clone(); bot.position.y = -h / 2; m.add(bot);
    ringsG.add(m); rings.push(m);
  }
  const blds = [];
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, d = 4 + r() * 9, hh = 0.4 + r() * 3.2, w = 0.25 + r() * 0.7;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1, w), new THREE.MeshBasicMaterial({ color: r() < 0.3 ? C.mint : C.paper, transparent: true, opacity: 0.9 }));
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: C.mintD })); b.add(e);
    b.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); b.userData = { hh, d0: r() * 0.8 }; g.add(b); blds.push(b);
  }
  // spark in center (grass)
  const spark = new THREE.Group(); for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.5, 4), new THREE.MeshBasicMaterial({ color: C.navy })); const a = (i / 9) * Math.PI * 2; c.position.set(Math.cos(a) * 0.08, 0.22, Math.sin(a) * 0.08); c.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); spark.add(c); } g.add(spark);
  const ground = tickRing(3.0, 120, 0.15, C.mintD, 0.014); ground.rotation.x = Math.PI / 2; ground.position.y = 0.01; g.add(ground);
  return {
    update(t) {
      const lt = t - 5.0;
      spark.scale.setScalar(back(seg(lt, 0, 0.4)) + 0.001);
      rings.forEach((m, i) => { const k = back(seg(lt, 0.15 + i * 0.32, 0.65 + i * 0.32), 1.4); m.position.y = lerp(-0.6, 0.3 + i * 0.62, k); m.scale.setScalar(Math.max(0.001, k)); m.rotation.y = lt * (i % 2 ? 0.3 : -0.25); m.visible = k > 0.001; });
      blds.forEach((b) => { const k = eo(seg(lt, 0.8 + b.userData.d0, 1.6 + b.userData.d0)); b.scale.y = Math.max(0.001, k * b.userData.hh); b.position.y = b.scale.y / 2; b.visible = k > 0.01; });
      ground.rotation.z = lt * 0.2;
      const p = path([[-0.25, [0.5, 11, 3.5]], [0, [0.4, 9.5, 2.6], eo], [1.6, [2.5, 6.5, 6.5]], [3.3, [6.0, 6.8, 7.5]]], lt);
      setCam(p, [0, lerp(0, 1.8, eio(seg(lt, 0, 3.3))), 0], lerp(0.25, -0.1, eio(seg(lt, -0.25, 3.3))));
    },
    blur(t) { return t > 8.1 ? 5 : 1; },
    overlay(t, x) { // mint blur flash 4.75-5.0
      if (t < 5.02) { const k = seg(t, 4.75, 5.02); x.save(); x.globalAlpha = 1 - eo(k) * 1; x.fillStyle = C.mint; x.fillRect(0, 0, W, H); x.filter = `blur(${40 * S}px)`; x.globalAlpha *= 0.5; x.fillStyle = C.navy; x.font = `900 ${900 * S}px Kufi`; x.textAlign = 'center'; x.direction = 'rtl'; x.fillText('ب', W * 0.5 + k * 200 * S, H * 0.62); x.restore(); }
    },
  };
});

// S4 8.3-16.6 ring stack with kinetic text
shot(8.3, 16.65, (g) => {
  g.add(floor(C.mintD, 2, 300, 0.4, 4)); g.position.y = 0;
  function bandCanvas(text, o = {}) {
    const Wc = 4096, Hc = o.hc || 320; const c = cv(Wc, Hc), x = c.getContext('2d');
    x.fillStyle = o.bg || C.paper; x.fillRect(0, 0, Wc, Hc);
    x.fillStyle = o.edge || C.mintD; x.fillRect(0, 0, Wc, 6); x.fillRect(0, Hc - 6, Wc, 6);
    if (o.chev) { x.strokeStyle = o.edge || C.mintD; x.lineWidth = 7; for (let i = 0; i < 70; i++) { const cx = i * 58 + 20; x.beginPath(); x.moveTo(cx, Hc * 0.3); x.lineTo(cx + 18, Hc * 0.5); x.lineTo(cx, Hc * 0.7); x.stroke(); } }
    if (o.ticks) { x.fillStyle = o.edge || C.mintD; for (let i = 0; i < 320; i++) { const L = i % 10 === 0 ? Hc * 0.35 : Hc * 0.15; x.fillRect(i * 12.8, 6, 3, L); } }
    if (o.mono) { x.font = `500 ${Hc * 0.28}px Mono`; x.fillStyle = o.edge || C.mintD; for (let k = 0; k < 4; k++) x.fillText(o.mono, 80 + k * 1024, Hc * 0.82); }
    if (text) {
      x.font = `${o.weight || 700} ${o.size || Hc * 0.62}px ${o.family || 'Kufi'}`; x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'middle';
      const reps = o.reps || 2;
      if (o.arc) { x.font = `${o.weight || 700} ${o.size || Hc * 0.66}px ${o.family || 'Kufi'}`; const mw = x.measureText(text).width, lim = Wc * o.arc; if (mw > lim) x.font = `${o.weight || 700} ${Math.floor((o.size || Hc * 0.66) * lim / mw)}px ${o.family || 'Kufi'}`;
        [0, Wc].forEach((cx) => { if (o.shadow) { x.fillStyle = o.shadow; x.fillText(text, cx + 10, Hc * 0.52 + 10); } x.fillStyle = o.color || C.navy; x.fillText(text, cx, Hc * 0.52); });
        const t = tex(c); return t; }
      { const slot = Wc / reps * 0.74; const mw = x.measureText(text).width; if (mw > slot) x.font = `${o.weight || 700} ${Math.floor((o.size || Hc * 0.62) * slot / mw)}px ${o.family || 'Kufi'}`; }
      for (let k = 0; k < reps; k++) { const cx = (k + 0.5) * Wc / reps; if (o.shadow) { x.fillStyle = o.shadow; x.fillText(text, cx + 8, Hc * 0.52 + 8); } x.fillStyle = o.color || C.navy; x.fillText(text, cx, Hc * 0.52); }
    }
    const t = tex(c); return t;
  }
  function ringMesh(R, h, map, backCol = C.paper) {
    const grp = new THREE.Group();
    const front = new THREE.Mesh(new THREE.CylinderGeometry(R, R, h, 128, 1, true), new THREE.MeshBasicMaterial({ map, side: THREE.FrontSide, fog: true }));
    const backM = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.999, R * 0.999, h, 128, 1, true), new THREE.MeshBasicMaterial({ color: backCol, side: THREE.BackSide, fog: true }));
    grp.add(front, backM);
    [h / 2, -h / 2].forEach((y) => { const tr = torusRing(R, 0.012, C.mintD); tr.rotation.x = Math.PI / 2; tr.position.y = y; grp.add(tr); });
    return grp;
  }
  const spec = [
    { y: -1.6, R: 2.5, h: 0.5, o: { ticks: 1, mono: 'MARKETING · 01' } },
    { y: -0.9, R: 2.6, h: 0.5, o: { chev: 1 } },
    { y: 0.0, R: 2.5, h: 0.85, text: 'محتاج وكالة', o: { arc: 0.2, shadow: C.mintS }, t: 8.75, key: 1 },
    { y: 0.95, R: 2.55, h: 0.75, text: 'تكبّر براندك', o: { arc: 0.2, shadow: C.mintS }, t: 9.6, key: 1 },
    { y: 1.8, R: 2.45, h: 0.45, o: { ticks: 1, mono: 'BRANDING · 02' } },
    { y: 2.55, R: 2.6, h: 0.85, text: 'تسويق · براندينج · تطبيقات', o: { arc: 0.36, bg: C.navy, color: C.paper, family: 'Plex', weight: 300, edge: C.mint }, back: C.navy, t: 10.8, key: 1 },
    { y: 3.4, R: 2.5, h: 0.6, o: { bg: C.mintS, edge: C.navy, chev: 1 }, back: C.mintS },
    { y: 4.15, R: 2.45, h: 0.45, o: { chev: 1 } },
    { y: 4.9, R: 2.55, h: 0.8, text: 'إدارة منصاتك', o: { arc: 0.2, shadow: C.mintS }, t: 13.3, key: 1 },
    { y: 5.75, R: 2.5, h: 0.45, o: { ticks: 1, mono: 'SOCIAL · APPS' } },
    { y: 6.55, R: 2.6, h: 0.9, text: 'بنعرف', o: { arc: 0.14, family: 'Kufi', weight: 900, color: C.navy, shadow: C.mintS }, t: 14.45, key: 1 },
    { y: 7.45, R: 2.5, h: 0.75, text: 'نحوّل المتابعين', o: { arc: 0.22, family: 'Plex', weight: 700, color: C.navy }, t: 15.0, key: 1 },
    { y: 8.3, R: 2.55, h: 0.8, text: 'لعملاء', o: { arc: 0.15, chev: 1, color: C.navy, shadow: C.mintS }, t: 15.55, key: 1 },
    { y: 9.1, R: 2.45, h: 0.45, o: { ticks: 1, mono: 'THEPLANETCO.COM' } },
  ];
  const rings = spec.map((s, i) => { const m = ringMesh(s.R, s.h, bandCanvas(s.text, s.o), s.back); m.position.y = s.y; m.userData = s; g.add(m); return m; });
  // text spin-in: rings rotate fast and settle so text faces camera
  const blds = []; const r = rng(5);
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d = 15 + r() * 10, hh = 0.5 + r() * 5, w = 0.3 + r() * 0.6; const b = new THREE.Mesh(new THREE.BoxGeometry(w, hh, w), new THREE.MeshBasicMaterial({ color: r() < 0.3 ? C.mintL : C.paper, fog: true })); b.add(new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: C.mintD }))); b.position.set(Math.cos(a) * d, hh / 2 - 2, Math.sin(a) * d); g.add(b); }
  const fl = g.children[0]; fl.position.y = -2;
  return {
    update(t) {
      scene.fog = new THREE.Fog(C.cream, 6, 30);
      // camera keys: [time, camY, lookY, radius, angle]
      const K = [
        [8.3, -1.4, -0.5, 13.0, 0.5], [8.75, 0.15, 0.0, 8.8, 0.05], [9.5, 0.3, 0.1, 9.2, -0.1], [9.6, 1.0, 0.95, 8.8, 0.05], [10.6, 1.3, 1.0, 9.4, -0.1],
        [10.8, 2.6, 2.55, 8.2, 0.1], [11.6, 2.55, 2.55, 7.8, -0.1], [12.45, 2.9, 2.7, 7.6, -0.35],
        [13.0, 6.5, 3.5, 12.0, 0.4], [13.3, 4.95, 4.9, 8.8, 0.1], [14.35, 5.1, 4.9, 9.4, -0.1],
        [14.45, 6.6, 6.55, 8.6, 0.05], [15.0, 7.45, 7.3, 8.9, -0.05], [15.55, 8.3, 8.15, 8.7, 0.05], [16.65, 9.0, 8.4, 10.0, -0.15],
      ];
      let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
      const [ta, ya, la, ra, aa] = K[i], [tb, yb, lb, rb, ab] = K[i + 1];
      const k = (tb - ta) < 0.32 ? eioExpo(seg(t, ta, tb)) : eio(seg(t, ta, tb));
      const y = lerp(ya, yb, k), ly = lerp(la, lb, k), rad = lerp(ra, rb, k), ang = lerp(aa, ab, k);
      setCam([Math.sin(ang) * rad, y, Math.cos(ang) * rad], [0, ly, 0], Math.sin(t * 1.3) * 0.08 + (t > 10.8 && t < 12.5 ? -0.1 : 0));
      rings.forEach((m) => {
        const s = m.userData;
        if (s.key) { const kk = eoExpo(seg(t, s.t - 0.08, s.t + 0.5)); m.rotation.y = lerp(-3.1, 0, kk) + Math.max(0, t - s.t) * 0.06; }
        else m.rotation.y = t * (s.y % 2 > 1 ? 0.25 : -0.2);
      });
    },
    blur(t) { const ts = [8.75, 9.6, 10.8, 13.0, 13.3, 14.45, 15.0, 15.55, 16.55]; return ts.some((x) => Math.abs(t - x) < 0.14) ? 5 : 1; },
    end() { scene.fog = null; },
  };
});

// S6 16.65-18.55 "لمّا" / "تبدأ" pill / ransom "مشروعك"
shot(16.65, 18.55, (g) => {
  g.add(floor(C.navy, 2.5, 300, 0.28));
  const lines = new THREE.Group(); for (let i = -6; i <= 6; i++) lines.add(line3([[0, 0.01, 0], [Math.sin(i * 0.25) * 60, 0.01, -Math.cos(i * 0.25) * 60]], C.navy, 0.35)); g.add(lines);
  const w1 = extruded('لمّا', { family: 'Kufi', weight: 900, size: 260, face: C.navy, side: '#0B2440', width: 3.6, depth: 0.25, layers: 12, pad: 40 }); w1.position.set(0, 2.6, 0); g.add(w1);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.55, 0.12), new THREE.MeshBasicMaterial({ color: C.mint })); bar.position.set(0.15, 2.15, -0.35); bar.rotation.z = -0.03; g.add(bar);
  const pillC = textCanvas('تبدأ', { family: 'Kufi', weight: 900, size: 220, color: C.mint, bg: C.navy, bgStroke: C.mint, bgStrokeW: 14, pad: 70, radius: 90, bgInset: 10 });
  const pill = extruded('', { width: 1 }); g.remove(pill);
  const pillP = planeOf(pillC, 3.0); const pillG = new THREE.Group(); pillG.add(pillP); for (let i = 1; i <= 8; i++) { const p = planeOf(textCanvas('تبدأ', { family: 'Kufi', weight: 900, size: 220, color: '#0B2440', bg: '#0B2440', pad: 70, radius: 90, bgInset: 10 }), 3.0, { alphaTest: 0.5 }); p.position.z = -i * 0.03; pillG.add(p); }
  pillG.position.set(0, 2.6, 0.2); g.add(pillG);
  // ransom tiles
  const letters = ['م', 'ش', 'ر', 'و', 'ع', 'ك'];
  const styles = [
    { bg: C.navy, color: C.paper, family: 'Kufi', weight: 900 }, { bg: C.paper, color: C.navy, family: 'Plex', weight: 700, stroke: C.navy },
    { bg: C.mint, color: C.navy, family: 'Cairo', weight: 900 }, { bg: '#ffffff', color: C.navy, family: 'Marhey', weight: 700, stroke: C.navy },
    { bg: C.navy, color: C.mint, family: 'Cairo', weight: 900 }, { bg: C.mintL, color: C.navy, family: 'Kufi', weight: 900 },
  ];
  const tiles = letters.map((L, i) => {
    const st = styles[i]; const c = cv(300, 340), x = c.getContext('2d'); x.fillStyle = st.bg; x.fillRect(10, 10, 280, 320); if (st.stroke) { x.lineWidth = 8; x.strokeStyle = st.stroke; x.strokeRect(14, 14, 272, 312); }
    x.fillStyle = st.color; x.font = `${st.weight} 220px ${st.family}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(L, 150, 175);
    const p = planeOf(c, 1.05); const row = i < 3 ? 0 : 1; const colI = i % 3;
    p.userData = { x: (1 - colI) * 1.12 + (row ? -0.25 : 0.2), y: 3.4 - row * 1.3, rz: (rng(i + 40)() - 0.5) * 0.35, t: 17.88 + i * 0.07 };
    g.add(p); return p;
  });
  const small = planeOf(textCanvas('يلا', { family: 'Plex', weight: 700, size: 90, color: C.paper, bg: C.navy, radius: 10, pad: 22 }), 0.8); small.position.set(1.2, 4.35, 0.05); small.rotation.z = 0.1; g.add(small);
  const bits = dots(40, 10, C.mintD, 77, 0.05); bits.position.y = 0.5; g.add(bits);
  return {
    update(t) {
      const lt = t - 16.65;
      const showW1 = t < 17.45, showPill = t >= 17.42 && t < 17.9, showR = t >= 17.86;
      w1.visible = bar.visible = showW1; pillG.visible = showPill; tiles.forEach((p) => (p.visible = showR)); small.visible = showR && t > 17.84;
      w1.scale.setScalar(back(seg(t, 16.85, 17.1)) + 0.001); bar.scale.x = eoExpo(seg(t, 16.95, 17.2)) + 0.001;
      pillG.scale.setScalar(back(seg(t, 17.42, 17.6), 2.2) + 0.001); pillG.rotation.z = lerp(-0.25, 0.04, eo(seg(t, 17.42, 17.65)));
      tiles.forEach((p) => { const u = p.userData; const k = back(seg(t, u.t, u.t + 0.18), 2.0); p.position.set(u.x, u.y, 0); p.scale.setScalar(Math.max(0.001, k)); p.rotation.z = u.rz * k + (1 - k) * 0.6; });
      small.scale.setScalar(back(seg(t, 17.84, 18.0)) + 0.001);
      let p, look, roll;
      if (t < 17.42) { p = path([[16.65, [-6, 6.5, 2.5], eoExpo], [16.95, [-1.0, 3.2, 8.6]], [17.42, [0.7, 3.0, 7.6]]], t); look = [0, 2.5, 0]; roll = lerp(0.9, 0.05, eoExpo(seg(t, 16.65, 16.95))); }
      else if (t < 17.86) { p = path([[17.42, [1.0, 3.1, 8.0]], [17.86, [-0.5, 2.8, 7.0]]], t); look = [0, 2.6, 0]; roll = -0.06; }
      else { p = path([[17.86, [1.3, 3.0, 8.6]], [18.35, [-0.3, 2.9, 7.6]], [18.55, [0, 2.9, 1.8], eiExpo]], t); look = [0, 2.85, 0]; roll = lerp(0.08, -0.05, seg(t, 17.86, 18.4)); }
      setCam(p, look, roll);
    },
    blur(t) { return t < 16.95 || Math.abs(t - 17.43) < 0.06 || t > 18.4 ? 5 : 1; },
  };
});

// S7 18.55-20.3 handwritten lines
let scriptC, scriptT;
shot(18.55, 20.3, (g) => {
  g.add(floor(C.mintD, 2, 300, 0.25));
  scriptC = cv(1400, 2000); scriptT = tex(scriptC);
  const p = planeOf(scriptC, 5.6, { map: scriptT }); p.position.set(0, 3.6, 0); g.add(p);
  const vlines = new THREE.Group(); for (let i = -3; i <= 3; i++) vlines.add(line3([[i * 1.5, 0, -2], [i * 1.5, 9, -2]], C.mintD, 0.35)); g.add(vlines);
  const L = [['بلانت', 18.75], ['بتكلّم', 19.05], ['عملاءك', 19.35], ['بلغتهم', 19.7]];
  return {
    update(t) {
      const x = scriptC.getContext('2d'); x.clearRect(0, 0, 1400, 2000);
      x.direction = 'rtl'; x.textBaseline = 'alphabetic';
      L.forEach(([s, t0], i) => {
        const k = eo(seg(t, t0, t0 + 0.32)); if (k <= 0) return;
        const size = i === 0 ? 300 : 250; x.font = `700 ${size}px Marhey`;
        const w = x.measureText(s).width; const cx = 700 + (i % 2 ? -60 : 60); const y = 420 + i * 400;
        x.save(); x.beginPath(); x.rect(cx + w / 2 - w * k - 20, y - size, w * k + 40, size * 1.6); x.clip();
        x.fillStyle = C.navy; x.textAlign = 'center'; x.fillText(s, cx, y); x.restore();
        // doodles
        x.strokeStyle = C.mintD; x.lineWidth = 16; x.lineCap = 'round';
        const dk = eo(seg(t, t0 + 0.2, t0 + 0.5));
        if (i === 1 && dk > 0) { x.beginPath(); for (let j = 0; j <= 40 * dk; j++) { const xx = cx + w / 2 - j * (w / 40); const yy = y + 70 + Math.sin(j * 0.7) * 16; j ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }
        if (i === 2 && dk > 0) { x.save(); x.translate(cx - w / 2 - 110, y - 120); x.scale(dk, dk); x.fillStyle = C.mint; x.beginPath(); for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5 - Math.PI / 2, rr2 = j % 2 ? 36 : 90; x.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } x.closePath(); x.fill(); x.restore(); }
        if (i === 3 && dk > 0) { x.beginPath(); x.ellipse(cx, y - 80, (w / 2 + 70), 170, -0.04, Math.PI * 0.9, Math.PI * 0.9 + Math.PI * 2 * dk); x.stroke(); }
        if (i === 0 && dk > 0) { x.beginPath(); x.moveTo(cx + w / 2 + 40, y + 40); x.lineTo(cx + w / 2 + 40 - (w + 80) * dk, y + 40); x.lineWidth = 22; x.strokeStyle = C.mint; x.stroke(); }
      });
      scriptT.needsUpdate = true;
      const lt = t - 18.55;
      const pp = path([[0, [0.6, 3.9, 2.0], eoExpo], [0.3, [0.2, 3.7, 7.2]], [1.75, [-0.6, 3.5, 7.8]]], lt);
      setCam(pp, [0, 3.6, 0], lerp(0.15, -0.05, eo(seg(lt, 0, 1.75))));
      p.rotation.y = lerp(0.12, -0.08, eio(seg(lt, 0, 1.75)));
    },
    blur(t) { return t < 18.75 ? 5 : 1; },
  };
});

// S8 20.3-22.05 notification pills explosion
shot(20.3, 22.05, (g) => {
  g.add(floor(C.navy, 2.5, 300, 0.25));
  const words = ['متابع جديد', 'عميل جديد', 'رسالة واتساب', 'طلب جديد', 'تعليق جديد', 'مشاركة', 'عميل جديد', 'طلب جديد'];
  const sty = [
    { bg: C.navy, color: C.mint }, { bg: C.mintS, color: C.navy }, { bg: C.paper, color: C.navy, bgStroke: C.navy }, { bg: C.navy, color: C.paper },
  ];
  const r = rng(99); const pills = [];
  const cache = {};
  for (let i = 0; i < 70; i++) {
    const w = words[i % words.length], s = sty[(i * 7) % 4]; const key = w + i % 4;
    if (!cache[key]) { const c = textCanvas(w, { family: 'Plex', weight: 700, size: 110, color: s.color, bg: s.bg, bgStroke: s.bgStroke, bgStrokeW: 10, pad: 48, bgInset: 6 }); const sc = textCanvas(w, { family: 'Plex', weight: 700, size: 110, color: '#0B2440', bg: '#0B2440', pad: 48, bgInset: 6 }); cache[key] = { c, ft: tex(c), sc, st: tex(sc) }; }
    const cc = cache[key]; const grp = new THREE.Group(); const wdt = 2.0 + r() * 2.0;
    for (let j = 8; j >= 1; j--) { const p = planeOf(cc.sc, wdt, { map: cc.st, alphaTest: 0.5 }); p.position.z = -j * 0.035; grp.add(p); }
    grp.add(planeOf(cc.c, wdt, { map: cc.ft }));
    const ang = r() * Math.PI * 2, rad = 1.3 + r() * 2.6;
    grp.userData = { x: Math.cos(ang) * rad, y: 3 + Math.sin(ang) * rad * 0.9, z: -r() * 30 + 6, rx: (r() - 0.5) * 1.2, ry: (r() - 0.5) * 1.4, rz: (r() - 0.5) * 1.6, sp: (r() - 0.5) * 2, t: 19.95 + r() * 0.75 };
    g.add(grp); pills.push(grp);
  }
  // typing bubble
  const bc = cv(600, 300), bx = bc.getContext('2d'); bx.fillStyle = C.navy; rr(0, bx, 10, 10, 580, 230, 115); bx.fill(); bx.beginPath(); bx.moveTo(420, 230); bx.lineTo(520, 295); bx.lineTo(480, 225); bx.fill();
  [170, 300, 430].forEach((xx) => { bx.fillStyle = C.mint; bx.beginPath(); bx.arc(xx, 125, 46, 0, 7); bx.fill(); bx.fillStyle = C.navy; bx.beginPath(); bx.arc(xx, 125, 20, 0, 7); bx.fill(); });
  const bub = planeOf(bc, 3.0); g.add(bub);
  return {
    update(t) {
      scene.fog = new THREE.Fog(C.cream, 16, 44);
      const lt = t - 20.3;
      const cz = lerp(14, -20, eio(seg(lt, 0, 1.75)) * 0.7 + seg(lt, 0, 1.75) * 0.3);
      pills.forEach((p) => { const u = p.userData; const k = eo(seg(t, u.t, u.t + 0.4)); p.position.set(u.x * lerp(0.2, 1, k), u.y, u.z); p.rotation.set(u.rx + lt * u.sp * 0.4, u.ry + lt * u.sp * 0.3, u.rz + lt * u.sp * 0.5); p.scale.setScalar(Math.max(0.001, k)); });
      const bk = back(seg(t, 21.3, 21.55)); bub.visible = t > 21.3; bub.scale.setScalar(bk + 0.001); bub.position.set(0.3, 3.1, cz - 4.2);
      [0, 1, 2].forEach(() => {});
      setCam([Math.sin(lt * 1.2) * 0.8, 3.1 + Math.sin(lt * 2) * 0.2, cz], [Math.sin(lt * 1.2) * 0.3, 3.0, cz - 10], lerp(-0.25, 0.2, eio(seg(lt, 0, 1.75))));
    },
    blur(t) { return t < 20.45 || t > 21.9 ? 5 : 2; },
    end() { scene.fog = null; },
  };
});

// S9 22.05-24.45 poster "عشان / موسم النمو / بدأ"
shot(22.05, 24.45, (g) => {
  g.add(floor(C.navy, 2.5, 300, 0.22));
  const discC = cv(1024, 1024), dx = discC.getContext('2d'); dx.fillStyle = C.paper; dx.beginPath(); dx.arc(512, 512, 500, 0, 7); dx.fill(); dx.strokeStyle = 'rgba(20,54,89,0.25)'; dx.lineWidth = 3; [500, 440].forEach((rr2) => { dx.beginPath(); dx.arc(512, 512, rr2, 0, 7); dx.stroke(); });
  const disc = planeOf(discC, 7.2); disc.position.set(0, 3.4, -0.4); g.add(disc);
  const corners = new THREE.Group(); [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => { corners.add(line3([[sx * 2.6, sy * 2.5, 0], [sx * 2.6, sy * 2.1, 0]], C.navy)); corners.add(line3([[sx * 2.6, sy * 2.5, 0], [sx * 2.2, sy * 2.5, 0]], C.navy)); }); corners.position.set(0, 3.4, 0); g.add(corners);
  const cause = planeOf(textCanvas('عشان', { family: 'Marhey', weight: 700, size: 130, color: C.navy }), 1.5); cause.position.set(1.5, 5.4, 0); g.add(cause);
  const dash = line3([[-2.0, 5.4, 0], [0.6, 5.4, 0]], C.mintD); g.add(dash);
  const w1 = extruded('موسم', { family: 'Kufi', weight: 900, size: 300, face: C.navy, side: '#0B2440', width: 3.7, depth: 0.2, layers: 10, pad: 30, lh: 1.0 }); g.add(w1);
  const w2 = extruded('النمو', { family: 'Kufi', weight: 900, size: 300, face: C.navy, side: '#0B2440', width: 3.7, depth: 0.2, layers: 10, pad: 30, lh: 1.0 }); g.add(w2);
  const w3 = extruded('بدأ', { family: 'Marhey', weight: 700, size: 260, face: C.mint, side: C.navy, faceStroke: C.navy, faceStrokeW: 6, width: 2.0, depth: 0.18, layers: 10, pad: 30 }); g.add(w3);
  const bottom = planeOf(monoLabel('THEPLANETCO.COM  ·  01203101104', { size: 50 }), 4.2); bottom.position.set(0, 0.95, 0.05); g.add(bottom);
  const bl = line3([[-2.6, 0.75, 0], [2.6, 0.75, 0]], C.navy); g.add(bl);
  const pts = dots(30, 9, C.navy, 123, 0.05); pts.position.set(0, 0, -1); g.add(pts);
  return {
    update(t) {
      const lt = t - 22.05;
      const drop = (m, t0, y) => { const k = seg(t, t0, t0 + 0.32); const yy = k < 1 ? lerp(y + 4, y, eiExpo(Math.min(1, k * 1.25))) : y; m.position.set(0, yy, 0); const sq = Math.max(0, 1 - Math.abs(seg(t, t0 + 0.25, t0 + 0.45) - 0.5) * 2); m.scale.set(1 + sq * 0.12, 1 - sq * 0.15, 1); m.visible = t > t0; };
      drop(w1, 22.3, 4.3); drop(w2, 22.6, 3.15);
      w3.visible = t > 23.0; w3.position.set(-1.1, 2.0, 0.3); w3.scale.setScalar(back(seg(t, 23.0, 23.25), 2) + 0.001); w3.rotation.z = 0.12;
      cause.scale.setScalar(back(seg(t, 22.15, 22.35)) + 0.001);
      bottom.visible = bl.visible = t > 23.3; bottom.scale.x = eoExpo(seg(t, 23.3, 23.6)) + 0.001;
      disc.rotation.z = lt * 0.1;
      const p = path([[0, [1.2, 4.5, 3.0], eoExpo], [0.3, [0.25, 3.4, 10.2]], [2.0, [-0.2, 3.3, 9.2]], [2.4, [0, 3.0, 1.2], eiExpo]], lt);
      setCam(p, [0, 3.3, 0], lerp(-0.18, 0.04, eo(seg(lt, 0, 0.6))));
    },
    blur(t) { return t < 22.3 || t > 24.2 ? 5 : 1; },
  };
});

// S10 24.45-25.05 dark flash "معانا" + shards
shot(24.45, 25.05, (g) => {
  const pill = planeOf(textCanvas('معانا', { family: 'Kufi', weight: 900, size: 200, color: C.navy, bg: C.mint, pad: 60, bgInset: 6 }), 2.8); pill.position.set(0, 0, 0); g.add(pill);
  const burst = new THREE.Group(); const r = rng(55);
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2; const L = 0.6 + r() * 2; const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, L, 0.02), new THREE.MeshBasicMaterial({ color: r() < 0.5 ? C.mint : C.paper })); m.position.set(Math.cos(a) * (0.6 + L / 2), Math.sin(a) * (0.6 + L / 2), -0.2); m.rotation.z = a - Math.PI / 2; m.userData = a; burst.add(m); }
  g.add(burst);
  const shards = new THREE.Group();
  for (let i = 0; i < 60; i++) { const geo = r() < 0.5 ? new THREE.TetrahedronGeometry(0.12 + r() * 0.2) : new THREE.BoxGeometry(0.2, 0.2, 0.2); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: [C.mint, C.paper, C.navy2, C.mintD][i % 4] })); m.userData = { v: new THREE.Vector3(r() - 0.5, r() - 0.5, r() * 0.8).normalize().multiplyScalar(4 + r() * 8), s: r() * 6 }; shards.add(m); }
  g.add(shards);
  return {
    update(t) {
      const lt = t - 24.45;
      scene.background = col(t < 24.98 ? '#0E2742' : C.cream);
      pill.scale.setScalar(back(seg(lt, 0, 0.15), 2.5) + 0.001);
      burst.scale.setScalar(eoExpo(seg(lt, 0.02, 0.3)) * 1.4 + 0.001); burst.children.forEach((m) => (m.scale.y = 1 - seg(lt, 0.25, 0.55)));
      shards.children.forEach((m) => { m.position.copy(m.userData.v).multiplyScalar(eo(seg(lt, 0.05, 0.6)) * 0.9); m.rotation.set(lt * m.userData.s, lt * m.userData.s * 0.7, 0); });
      setCam([0, 0, lerp(5.5, 4.2, eo(seg(lt, 0, 0.6)))], [0, 0, 0], lerp(0.06, -0.1, lt / 0.6));
    },
    blur(t) { return 3; },
    end() { scene.background = col(C.cream); },
  };
});

// S11 25.05-30.0 primitives rain + P logo end card
let logoG;
shot(25.05, 30.01, (g) => {
  g.add(floor(C.navy, 2, 300, 0.2)); g.add(shadowFloor());
  const r = rng(2026); const objs = [];
  const stripeTex = (a, b) => { const c = cv(256, 64), x = c.getContext('2d'); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? a : b; x.fillRect(i * 16, 0, 16, 64); } const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const mats = [
    new THREE.MeshStandardMaterial({ color: C.mintS, roughness: 0.4 }), new THREE.MeshStandardMaterial({ color: C.navy, roughness: 0.45 }),
    new THREE.MeshStandardMaterial({ color: C.paper, roughness: 0.6 }), new THREE.MeshStandardMaterial({ map: stripeTex(C.navy, C.mint), roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: stripeTex(C.paper, C.mintD), roughness: 0.5 }), new THREE.MeshStandardMaterial({ color: C.mintD, roughness: 0.45 }),
  ];
  const star = (() => { const s = new THREE.Shape(); for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5 + Math.PI / 2, rr2 = j % 2 ? 0.22 : 0.5; j ? s.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : s.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } return new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: false }); })();
  const geos = [() => new THREE.SphereGeometry(0.5 + r() * 0.4, 32, 24), () => new THREE.TorusGeometry(0.5, 0.2, 18, 48), () => new THREE.BoxGeometry(0.6, 0.6, 0.6), () => new THREE.ConeGeometry(0.4, 0.8, 32), () => new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32), () => star, () => new THREE.OctahedronGeometry(0.45), () => new THREE.SphereGeometry(0.25, 24, 16)];
  for (let i = 0; i < 120; i++) {
    const gi = i % geos.length; const geo = geos[gi]();
    const m = new THREE.Mesh(geo, gi === 1 ? mats[3 + (i % 2)] : gi === 0 && i % 3 === 0 ? mats[4] : mats[i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : (i % 2 ? 2 : 5)]);
    m.scale.setScalar(1.1 + r() * 0.9); m.castShadow = true;
    const ang = r() * Math.PI * 2, d = 1.6 + Math.sqrt(r()) * 5.2; if (Math.sin(ang) * d > 2.2 && Math.abs(Math.cos(ang) * d) < 3.5) { /* keep clear of end-card text */ }
    const bb = new THREE.Box3().setFromObject(m); const hy = -bb.min.y;
    let ox = Math.cos(ang) * d, oz = Math.sin(ang) * d; if (oz > 2.2 && Math.abs(ox) < 3.8) { ox = Math.sign(ox || 1) * (3.8 + r() * 2); }
    m.userData = { x: ox, z: oz, y0: 3 + r() * 8, t0: 24.1 + r() * 1.7, hy, rx: r() * 6, ry: r() * 6, sp: 2 + r() * 4, rest: gi === 1 ? [Math.PI / 2, 0, 0] : [0, r() * 6, 0] };
    g.add(m); objs.push(m);
    const sr = torusRing(0.7, 0.012, C.mintD, 0.8); sr.rotation.x = Math.PI / 2; sr.position.set(m.userData.x, 0.01, m.userData.z); m.userData.ring = sr; g.add(sr);
  }
  // P logo
  logoG = new THREE.Group(); g.add(logoG);
  return {
    update(t) {
      const grav = 22;
      objs.forEach((m) => {
        const u = m.userData; const lt = t - u.t0; const fallT = Math.sqrt(2 * (u.y0 - u.hy) / grav);
        let y, k = 0;
        if (lt < 0) y = 99; else if (lt < fallT) y = u.y0 - 0.5 * grav * lt * lt; else { const tb = lt - fallT; const v = grav * fallT * 0.35; const b1 = 2 * v / grav; if (tb < b1) y = u.hy + v * tb - 0.5 * grav * tb * tb; else { const v2 = v * 0.35, b2 = 2 * v2 / grav; const tc = tb - b1; y = tc < b2 ? u.hy + v2 * tc - 0.5 * grav * tc * tc : u.hy; } k = 1; }
        m.position.set(u.x, Math.max(u.hy, y), u.z); m.visible = lt > 0;
        const rk = eo(clamp((lt - fallT) / 0.5));
        m.rotation.set(lerp(u.rx + lt * u.sp, u.rest[0], rk), lerp(u.ry + lt * u.sp, u.rest[1], rk), lerp(lt * u.sp * 0.5, u.rest[2], rk));
        u.ring.visible = k > 0; u.ring.scale.setScalar(0.4 + eo(clamp((lt - fallT) / 0.3)) * 0.6);
      });
      // logo drop
      const lk = t - 27.75; const ly0 = 10, ly1 = 0; let ly;
      if (lk < 0) ly = 99; else if (lk < 0.35) ly = lerp(ly0, ly1, ei(lk / 0.35)); else ly = ly1 + Math.abs(Math.sin((lk - 0.35) * 9)) * Math.exp(-(lk - 0.35) * 7) * 0.8;
      logoG.position.set(0, ly, 1.2); logoG.visible = lk > 0;
      logoG.rotation.y = lerp(-0.6, 0.15, eo(seg(t, 27.75, 28.6))) + Math.sin(t) * 0.05;
      const sq = lk > 0.33 && lk < 0.55 ? Math.sin((lk - 0.33) / 0.22 * Math.PI) * 0.15 : 0; logoG.scale.set(1 + sq, 1 - sq, 1 + sq);
      let p, look;
      if (t < 27.7) { const k = seg(t, 25.05, 27.7); const ang = lerp(0.2, 0.9, k); p = [Math.sin(ang) * lerp(8.0, 9.5, k), lerp(4.2, 5.2, k), Math.cos(ang) * lerp(8.0, 9.5, k)]; look = [0, lerp(1.4, 0.6, eo(k)), 0]; }
      else { const k = seg(t, 27.7, 30); const ang = lerp(-0.25, 0.05, eo(k)); const rad = lerp(12.5, 11.0, eo(k)); p = [Math.sin(ang) * rad, lerp(3.6, 3.0, eo(k)), Math.cos(ang) * rad + 1]; look = [0, lerp(1.6, 1.25, eo(k)), 1]; }
      setCam(p, look, t < 27.7 ? lerp(-0.12, 0.05, seg(t, 25.05, 27.7)) : 0);
      sun.castShadow = true;
    },
    blur(t) { return t < 25.2 ? 4 : 1; },
    end() { sun.castShadow = false; },
    overlay(t, x) {
      const k = eo(seg(t, 28.35, 28.85)), k2 = eo(seg(t, 28.65, 29.15));
      if (k <= 0) return;
      x.save(); x.textAlign = 'center'; x.direction = 'ltr';
      x.globalAlpha = k; x.fillStyle = C.navy; x.font = `800 ${64 * S}px Inter`;
      x.fillText('www.theplanetco.com', W / 2, H * 0.84 + (1 - k) * 40 * S);
      x.fillStyle = C.mintD; x.font = `800 ${34 * S}px Inter`; x.letterSpacing = `${8 * S}px`;
      x.fillText('PLANET CREATIVE MARKETING', W / 2, H * 0.79 + (1 - k) * 40 * S); x.letterSpacing = '0px';
      x.globalAlpha = k2; const pw = 620 * S, ph = 104 * S, px = W / 2 - pw / 2, py = H * 0.875 + (1 - k2) * 40 * S;
      x.fillStyle = C.navy; x.beginPath(); x.roundRect(px, py, pw, ph, ph / 2); x.fill();
      x.fillStyle = C.mint; x.font = `700 ${50 * S}px Plex`; x.direction = 'rtl'; x.fillText('واتساب  01203101104', W / 2, py + ph * 0.66);
      x.restore();
    },
  };
});

// ---------- P logo from svg ----------
async function buildLogo() {
  const txt = await (await fetch('assets/p.svg')).text();
  const data = new SVGLoader().parse(txt);
  const shapes = []; data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((s) => shapes.push(s)));
  const geo = new THREE.ExtrudeGeometry(shapes, { depth: 70, bevelEnabled: true, bevelThickness: 8, bevelSize: 6, bevelSegments: 3, curveSegments: 24 });
  geo.center(); geo.computeBoundingBox();
  const m = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ color: C.navy, roughness: 0.35, metalness: 0.1 }), new THREE.MeshStandardMaterial({ color: '#0E2742', roughness: 0.5 })]);
  const s = 3.0 / 414; m.scale.set(s, -s, s); m.castShadow = true;
  const bb = geo.boundingBox; m.position.y = (bb.max.y - bb.min.y) * s / 2;
  logoG.add(m);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 24), new THREE.MeshStandardMaterial({ color: C.mint, roughness: 0.35 })); dot.position.set(1.45, 0.32, 0.1); dot.castShadow = true; logoG.add(dot);
  // mint planet ring around logo
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.05, 16, 128), new THREE.MeshStandardMaterial({ color: C.mint, roughness: 0.4 })); ring.rotation.x = Math.PI / 2 - 0.25; ring.position.y = 1.6; ring.castShadow = true; logoG.add(ring);
}

// ---------- grain / vignette ----------
const grains = [0, 1, 2, 3].map((i) => { const c = cv(512, 512), x = c.getContext('2d'); const id = x.createImageData(512, 512); const r = rng(500 + i); for (let j = 0; j < id.data.length; j += 4) { const v = r() * 255; id.data[j] = id.data[j + 1] = id.data[j + 2] = v; id.data[j + 3] = 255; } x.putImageData(id, 0, 0); return c; });
function post(t) {
  octx.save(); octx.globalCompositeOperation = 'multiply'; octx.fillStyle = 'rgba(246,228,200,0.28)'; octx.fillRect(0, 0, W, H); octx.globalCompositeOperation = 'soft-light'; octx.fillStyle = 'rgba(120,80,40,0.10)'; octx.fillRect(0, 0, W, H); octx.restore();
  const fi = Math.floor(t * 30) % 4;
  octx.save(); octx.globalCompositeOperation = 'overlay'; octx.globalAlpha = 0.11; const pat = octx.createPattern(grains[fi], 'repeat'); octx.fillStyle = pat; octx.fillRect(0, 0, W, H); octx.restore();
  const g = octx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(20,54,89,0)'); g.addColorStop(1, 'rgba(20,54,89,0.16)'); octx.fillStyle = g; octx.fillRect(0, 0, W, H);
}

// ---------- render ----------
let active = null;
function setup(t) {
  const s = shots.find((s) => t >= s.t0 && t < s.t1) || shots[shots.length - 1];
  if (s !== active) { if (active) { active.g.visible = false; active.end && active.end(); } active = s; s.g.visible = true; }
  s.update(t); return s;
}
window.renderAt = (t) => {
  const s = setup(t);
  const n = Math.max(1, Math.round(s.blur ? s.blur(t) : 1));
  const sh = (1 / 30) * 0.85;
  for (let i = 0; i < n; i++) {
    const ti = t - (n > 1 ? sh * i / (n - 1) : 0);
    const si = setup(Math.max(0, ti));
    gl.render(scene, cam);
    octx.globalAlpha = 1 / (i + 1); octx.drawImage(gl.domElement, 0, 0); octx.globalAlpha = 1;
  }
  const sf = setup(t);
  if (sf.overlay) sf.overlay(t, octx);
  post(t);
};
await buildLogo();
window.ready = true;
export { shots };
