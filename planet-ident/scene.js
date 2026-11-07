// Planet broadcast-style ident (15s). Deterministic: renderAt(t) draws the frame at time t.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

await document.fonts.load('800 100px "Inter Display"');
await document.fonts.load('900 100px "Inter Display"');
await document.fonts.load('700 100px "Inter Display"');
await document.fonts.load('800 50px AlexB', 'تسويق');
const Q = new URLSearchParams(location.search);
const W = +(Q.get('w') || 1920), H = +(Q.get('h') || 1080);
const VERT = H > W;

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;

const camera = new THREE.PerspectiveCamera(30, W / H, 0.3, 400);

const hemi = new THREE.HemisphereLight(0xffffff, 0x8a98ab, 1.15);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 2.3);
key.position.set(-12, 16, 30);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -30, right: 30, top: 22, bottom: -22, near: 1, far: 100 });
key.shadow.radius = 9;
key.shadow.blurSamples = 20;
key.shadow.bias = -0.0004;
scene.add(key, key.target);

// ---------- palette / helpers ----------
const C = {
  navy: 0x143659, mint: 0x92c5b4, white: 0xf3f5f7, yellow: 0xf5c243, coral: 0xef6f68,
  sky: 0xcfe4ea, lblue: 0xb7cde6, bgNavy: 0x1a4473, bgWhite: 0xeef1f4, night: 0x0e2240,
  floor: 0x0f2d4f, line: 0xc9d3de,
};
const col = (h) => new THREE.Color(h);
function M(c, o = {}) {
  return new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35 }, o));
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  out5: (t) => 1 - Math.pow(1 - t, 5),
  back: (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
const bump = (t, a, d) => { const k = seg(t, a, a + d); return Math.sin(Math.PI * k); };
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function rrShape(w, h, r) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
  s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
  return s;
}
function holeOf(shape) { return new THREE.Path(shape.getPoints(64).reverse()); }
function frameShape(w, h, r, wi, hi, ri) { const s = rrShape(w, h, r); s.holes.push(holeOf(rrShape(wi, hi, ri))); return s; }
function ringShape(ro, ri) {
  const s = new THREE.Shape(); s.absarc(0, 0, ro, 0, Math.PI * 2, false);
  const h = new THREE.Path(); h.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(h); return s;
}
function ext(shape, depth, bevel, mat, curve = 40) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, depth - 2 * bevel), bevelEnabled: bevel > 0, bevelThickness: bevel,
    bevelSize: bevel * 0.95, bevelOffset: -bevel * 0.95, bevelSegments: 6, curveSegments: curve,
  });
  g.translate(0, 0, bevel);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
function circShape(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }
const slab = (w, h, r, d, b, mat) => ext(Math.abs(w - h) < 1e-6 && r >= w / 2 - 1e-6 ? circShape(w / 2) : rrShape(w, h, r), d, b, mat);
function ball(r, mat) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), mat); m.castShadow = m.receiveShadow = true; return m; }
function grp(...ch) { const g = new THREE.Group(); ch.forEach((c) => g.add(c)); return g; }
function at(o, x, y, z = 0) { o.position.set(x, y, z); return o; }

function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function decal(w, h, tex, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial(Object.assign({ map: tex, transparent: true, roughness: 0.5, depthWrite: false }, o)));
  m.receiveShadow = true; return m;
}
const css = (h) => '#' + h.toString(16).padStart(6, '0');
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); }

// ---------- backdrop ----------
const bgMat = new THREE.MeshStandardMaterial({ color: C.bgNavy, roughness: 0.92 });
const bg = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), bgMat);
bg.receiveShadow = true; scene.add(bg);
const wipeMat = new THREE.MeshStandardMaterial({ color: C.bgWhite, roughness: 0.92 });
const wipe = new THREE.Mesh(new THREE.CircleGeometry(1, 128), wipeMat);
wipe.position.z = 0.01; wipe.receiveShadow = true; scene.add(wipe);

// ---------- logo ----------
let logoShapes = null;
async function loadLogo() {
  const txt = await (await fetch('assets/p.svg')).text();
  const data = new SVGLoader().parse(txt);
  logoShapes = [];
  data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((s) => logoShapes.push(s)));
}
function makeLogo(size, depth, pCol, dotCol) {
  const s = size / 414; const g = new THREE.Group();
  const geo = new THREE.ExtrudeGeometry(logoShapes, { depth: depth / s * 0.6, bevelEnabled: true, bevelThickness: depth / s * 0.2, bevelSize: 7, bevelOffset: -7, bevelSegments: 5, curveSegments: 24 });
  geo.translate(-209, -207, depth / s * 0.2);
  const m = new THREE.Mesh(geo, M(pCol)); m.scale.set(s, -s, s); m.castShadow = true; g.add(m);
  const d = slab(102 * s, 102 * s, 51 * s, depth, depth * 0.25, M(dotCol));
  d.position.set((364 - 209) * s, -(362 - 207) * s, 0); g.add(d);
  return g;
}

// ============ TOGGLE (used in S1 and S7) ============
function makeToggle(knobContent) {
  const root = new THREE.Group();
  const slot = new THREE.Group(); root.add(slot);
  const rimMat = new THREE.MeshStandardMaterial({ color: C.bgNavy, roughness: 0.9 });
  slot.add(ext(frameShape(9.4, 3.8, 1.9, 8.3, 2.75, 1.375), 0.5, 0.14, rimMat));
  const floor = slab(8.4, 2.85, 1.42, 0.05, 0, M(C.floor, { roughness: 0.8, clearcoat: 0 }));
  slot.add(floor);
  const fill = new THREE.Mesh(new THREE.BufferGeometry(), M(C.mint, { roughness: 0.5 }));
  fill.castShadow = false; fill.receiveShadow = true; slot.add(fill);
  let lastW = -1;
  function setFill(w) {
    w = Math.max(2.35, w); if (Math.abs(w - lastW) < 0.004) return; lastW = w;
    fill.geometry.dispose();
    const g = new THREE.ExtrudeGeometry(rrShape(w, 2.35, 1.175), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelOffset: -0.05, bevelSegments: 3, curveSegments: 24 });
    g.translate(-4.0 + w / 2 + 0.05, 0, 0.06); fill.geometry = g;
  }
  const knob = new THREE.Group();
  const disc = slab(2.45, 2.45, 1.225, 1.0, 0.42, M(0xe8eff7, { clearcoat: 0.6, clearcoatRoughness: 0.2 }));
  knob.add(disc);
  if (knobContent) { knobContent.position.z = 0.95; knob.add(knobContent); }
  root.add(knob);
  return { root, slot, knob, disc, setFill, fill };
}

// ============ S1: toggle intro ============
const s1 = makeToggle(null);
scene.add(s1.root);
const s1dash = at(slab(0.9, 0.22, 0.11, 0.25, 0.08, M(0xffffff)), -0.6, 3.2, 0); s1dash.rotation.z = 0.35;
const s1dot = at(ball(0.2, M(C.mint)), 6.2, -2.6, 0.2);
const s1dot2 = at(ball(0.12, M(0xffffff)), -6.8, 1.9, 0.12);
s1.root.add(s1dash, s1dot, s1dot2);

// ============ S2: dial ============
const dial = new THREE.Group(); scene.add(dial);
const bezel = ext(ringShape(3.3, 2.72), 1.4, 0.22, M(C.white, { clearcoat: 0.7, clearcoatRoughness: 0.15 }));
const face = slab(5.6, 5.6, 2.8, 1.12, 0.1, M(C.navy, { roughness: 0.5 }));
dial.add(bezel, face);
function faceTex(time) {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff'; g.font = '800 250px "Inter Display"'; g.fillText(time, w / 2, h / 2 + 10);
    g.fillStyle = 'rgba(255,255,255,.9)'; rr(g, w / 2 - 55, 300, 110, 26, 13);
    g.fillStyle = css(C.mint); g.beginPath(); g.arc(w / 2 - 70, 730, 18, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; rr(g, w / 2 - 35, 718, 110, 24, 12);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, 430, 0, 7); g.stroke();
  });
}
const faceTexA = faceTex('08:59'), faceTexB = faceTex('09:00');
const faceDecal = decal(5.3, 5.3, faceTexA); faceDecal.position.z = 1.125; dial.add(faceDecal);
const arcMat = new THREE.MeshStandardMaterial({ color: C.mint, emissive: C.mint, emissiveIntensity: 0.25, roughness: 0.4 });
const arc = new THREE.Mesh(new THREE.BufferGeometry(), arcMat); arc.position.z = 1.13; dial.add(arc);
let lastArc = -1;
function setArc(len) {
  if (Math.abs(len - lastArc) < 0.002) return; lastArc = len;
  arc.geometry.dispose();
  arc.geometry = new THREE.RingGeometry(2.42, 2.58, 160, 1, Math.PI / 2 - Math.max(0.001, len), Math.max(0.001, len));
}
const orbit = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.045, 12, 200), M(0xb9c6d6));
orbit.position.z = 0.2; dial.add(orbit);
const orbBall = ball(0.24, M(C.mint)); dial.add(orbBall);
const dialPill = at(slab(0.9, 0.3, 0.15, 0.3, 0.1, M(C.navy)), 0, -4.9, 0); dial.add(dialPill);
const dialDot = at(ball(0.16, M(C.coral)), 4.9, -3.6, 0.16); dial.add(dialDot);

// ============ S3: calendar + social confetti ============
const cal = new THREE.Group(); scene.add(cal);
const calBase = at(slab(5.4, 5.8, 1.0, 0.55, 0.16, M(C.navy)), 0.32, -0.32, 0);
cal.add(calBase);
const pageNums = [30, 26, 21, 15, 9, 5, 1];
const flipT = [5.06, 4.96, 4.85, 4.72, 4.58, 4.38]; // for pages index 6..1
const pages = pageNums.map((n, i) => {
  const piv = new THREE.Group(); piv.position.set(0, 2.8, 0.58 + i * 0.075);
  const pg = slab(5.2, 5.6, 0.9, 0.07, 0.025, M(0xf8f9fb, { clearcoat: 0.1 }));
  pg.position.y = -2.8; piv.add(pg);
  const tex = canvasTex(520, 560, (g, w, h) => {
    g.fillStyle = css(C.navy); rr(g, w / 2 - 60, 60, 120, 26, 13);
    g.fillStyle = css(C.navy); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 290px "Inter Display"'; g.fillText(String(n).padStart(2, '0'), w / 2, h / 2 + 20);
    g.fillStyle = css(C.mint); rr(g, w / 2 - 50, 470, 100, 22, 11);
  });
  const d = decal(5.0, 5.4, tex); d.position.set(0, -2.8, 0.072); piv.add(d);
  cal.add(piv); return piv;
});
// heart shape
function heartShape(s) {
  const h = new THREE.Shape(); h.moveTo(0, -0.9 * s);
  h.bezierCurveTo(-0.2 * s, -0.7 * s, -1.0 * s, -0.2 * s, -1.0 * s, 0.3 * s);
  h.bezierCurveTo(-1.0 * s, 0.75 * s, -0.6 * s, 1.0 * s, -0.3 * s, 1.0 * s);
  h.bezierCurveTo(-0.1 * s, 1.0 * s, 0, 0.85 * s, 0, 0.7 * s);
  h.bezierCurveTo(0, 0.85 * s, 0.1 * s, 1.0 * s, 0.3 * s, 1.0 * s);
  h.bezierCurveTo(0.6 * s, 1.0 * s, 1.0 * s, 0.75 * s, 1.0 * s, 0.3 * s);
  h.bezierCurveTo(1.0 * s, -0.2 * s, 0.2 * s, -0.7 * s, 0, -0.9 * s); return h;
}
function triShape(s) { const t = new THREE.Shape(); t.moveTo(-0.45 * s, -0.55 * s); t.lineTo(0.6 * s, 0); t.lineTo(-0.45 * s, 0.55 * s); t.closePath(); return t; }
function squiggle(len, amp, n, r, mat) {
  const pts = []; for (let i = 0; i <= 60; i++) { const k = i / 60; pts.push(new THREE.Vector3(-len / 2 + len * k, Math.sin(k * Math.PI * 2 * n) * amp, 0)); }
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, r, 10), mat); m.castShadow = true; return m;
}
function txtDecal(w, h, text, color, font, spacing = 0) {
  const cw0 = 1024, ch0 = Math.round(1024 * h / w);
  return decal(w, h, canvasTex(cw0, ch0, (g, cw, ch) => {
    g.fillStyle = css(color); g.textAlign = 'center'; g.textBaseline = 'middle';
    let px = parseInt(font.match(/(\d+)px/)[1]) * 2; const f = (n) => font.replace(/\d+px/, n + 'px');
    g.font = f(px); if (spacing) g.letterSpacing = spacing + 'px';
    while (g.measureText(text).width > cw * 0.94 && px > 8) { px -= 2; g.font = f(px); }
    g.fillText(text, cw / 2, ch / 2 + px * 0.04);
  }));
}
const conf = [];
function addConf(obj, x, y, rz = 0) { obj.userData = { x, y, rz }; cal.add(obj); conf.push(obj); }
{
  const heart = grp(slab(2.5, 1.0, 0.5, 0.5, 0.16, M(C.coral)), at(ext(heartShape(0.3), 0.66, 0.07, M(0xffffff)), -0.62, -0.04, 0), at(slab(0.85, 0.18, 0.09, 0.62, 0.05, M(0xffffff)), 0.42, 0, 0));
  addConf(heart, -6.8, 1.6, 0.12);
  const bub = grp(slab(2.0, 1.3, 0.5, 0.45, 0.14, M(C.mint)));
  [-0.5, 0, 0.5].forEach((x) => bub.add(at(ball(0.13, M(0xffffff)), x, 0, 0.5)));
  const tail = ext(triShape(0.5), 0.45, 0.1, M(C.mint)); tail.rotation.z = -2.2; tail.position.set(-0.55, -0.68, 0); bub.add(tail);
  addConf(bub, 6.5, 2.4, -0.1);
  addConf(ball(0.58, M(C.yellow)), -7.8, -1.7);
  addConf(grp(slab(1.15, 1.15, 0.28, 0.36, 0.09, M(C.lblue)), at(txtDecal(1.0, 1.0, '#', C.navy, '900 380px "Inter Display"'), 0, 0, 0.37)), 5.7, -1.0, 0.18);
  addConf(grp(slab(1.3, 1.3, 0.65, 0.4, 0.12, M(C.navy)), at(ext(triShape(0.62), 0.55, 0.06, M(0xffffff)), 0.06, 0, 0)), 7.9, -2.9);
  addConf(ball(0.32, M(C.coral)), 6.3, -4.1);
  addConf(ball(0.24, M(C.navy)), -3.6, 4.2);
  addConf(ball(0.3, M(C.mint)), -5.4, -3.8);
  addConf(ball(0.2, M(C.yellow)), 3.8, 4.4);
  addConf(squiggle(2.0, 0.18, 1.5, 0.07, M(C.coral)), 7.6, 0.7, 0.2);
  addConf(squiggle(1.6, 0.15, 1.2, 0.06, M(C.mint)), -8.6, 3.3, -0.3);
  addConf(grp(at(slab(0.5, 1.1, 0.12, 0.35, 0.08, M(C.mint)), -0.5, 0, 0), at(slab(0.5, 1.1, 0.12, 0.45, 0.08, M(C.navy)), 0, 0, 0), at(slab(0.5, 1.1, 0.12, 0.35, 0.08, M(C.yellow)), 0.5, 0, 0)), -9.4, 0.2, 0.25);
  addConf(grp(slab(1.4, 0.8, 0.22, 0.32, 0.08, M(C.yellow)), at(txtDecal(1.2, 0.6, 'AD', C.navy, '900 220px "Inter Display"'), 0, 0, 0.33)), 3.6, -4.3, -0.15);
  addConf(at(slab(0.7, 0.2, 0.1, 0.22, 0.07, M(C.navy)), 0, 0, 0), -2.2, -4.6, 0.4);
}

// ============ S4: content-calendar tablet ============
const tab = new THREE.Group(); scene.add(tab);
tab.add(ext(frameShape(13.2, 9.6, 1.3, 11.8, 8.2, 0.7), 0.8, 0.22, M(C.white, { clearcoat: 0.6, clearcoatRoughness: 0.2 })));
tab.add(slab(11.9, 8.3, 0.7, 0.08, 0, M(C.line, { roughness: 0.8, clearcoat: 0 })));
tab.add(at(slab(1.7, 0.55, 0.27, 0.95, 0.15, M(C.mint)), 0, 4.95, -0.1));
for (let c = 0; c < 7; c++) tab.add(at(slab(0.95, 0.22, 0.11, 0.2, 0.06, M(c === 3 ? C.mint : C.navy)), -5.06 + c * 1.686, 3.55, 0.08));
const ICONS = ['heart', 'play', 'bars', 'ad', 'star', 'ring', 'lines', 'at', 'cam', 'pie'];
function iconTex(kind, fg) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = fg; g.strokeStyle = fg; g.lineCap = 'round'; g.lineJoin = 'round';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const cx = w / 2, cy = h / 2;
    if (kind === 'heart') { g.beginPath(); g.moveTo(cx, cy + 45); g.bezierCurveTo(cx - 80, cy - 5, cx - 50, cy - 70, cx, cy - 30); g.bezierCurveTo(cx + 50, cy - 70, cx + 80, cy - 5, cx, cy + 45); g.fill(); }
    if (kind === 'play') { g.beginPath(); g.moveTo(cx - 30, cy - 45); g.lineTo(cx + 48, cy); g.lineTo(cx - 30, cy + 45); g.closePath(); g.fill(); }
    if (kind === 'bars') { [[-55, 40], [-15, 70], [25, 55], [65, 95]].forEach(([x, hh]) => rr(g, cx + x - 16, cy + 50 - hh, 32, hh, 8)); }
    if (kind === 'ad') { g.font = '900 110px "Inter Display"'; g.fillText('AD', cx, cy + 6); }
    if (kind === 'star') { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 30 : 70; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill(); }
    if (kind === 'ring') { g.lineWidth = 22; g.beginPath(); g.arc(cx, cy, 52, 0, 7); g.stroke(); }
    if (kind === 'lines') { [[-50, 120], [-15, 90], [20, 110], [55, 60]].forEach(([y, ww]) => rr(g, cx - 60, cy + y - 9, ww, 18, 9)); }
    if (kind === 'at') { g.font = '800 140px "Inter Display"'; g.fillText('@', cx, cy + 6); }
    if (kind === 'cam') { rr(g, cx - 70, cy - 40, 140, 95, 22); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(cx, cy + 8, 30, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; rr(g, cx - 30, cy - 58, 60, 22, 8); }
    if (kind === 'pie') { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 65, -Math.PI / 2, Math.PI); g.closePath(); g.fill(); }
  });
}
function cityTex() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = css(C.sky); g.fillRect(0, 0, w, h);
    g.fillStyle = css(C.yellow); g.beginPath(); g.arc(330, 190, 62, 0, 7); g.fill();
    g.fillStyle = '#e8eef3'; g.fillRect(0, 395, w, 117);
    const b = [[40, 300, 60, C.coral], [110, 250, 50, C.navy], [170, 210, 70, C.navy], [250, 280, 55, C.mint], [315, 260, 60, C.yellow], [385, 310, 70, C.lblue]];
    b.forEach(([x, y, ww, c]) => { g.fillStyle = css(c); rr(g, x, y, ww, 395 - y, 10); });
  });
}
const tiles = [];
const ROWS = 4, COLS = 7, CW = 1.62, CH = 1.7;
seed = 11;
const palette = [C.mint, C.navy, C.yellow, C.coral, C.lblue, C.mint, C.navy, 0xffffff];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const x = -5.06 + c * 1.686, y = 2.5 - r * 1.78;
  const piv = new THREE.Group(); piv.position.set(x, y, 0.1);
  const front = slab(CW, CH, 0.16, 0.14, 0.04, M(0xffffff, { clearcoat: 0.2 }));
  const isCity = r === 1 && c === 3;
  const bc = isCity ? C.sky : palette[Math.floor(rnd() * palette.length)];
  const back = slab(CW, CH, 0.16, 0.14, 0.04, M(bc, { clearcoat: 0.3 }));
  back.rotation.y = Math.PI;
  let fg = bc === 0xffffff || bc === C.yellow || bc === C.lblue || bc === C.mint ? css(C.navy) : '#ffffff';
  const ic = isCity ? decal(CW - 0.12, CH - 0.12, cityTex(), { transparent: false }) : decal(1.0, 1.0, iconTex(ICONS[Math.floor(rnd() * ICONS.length)], fg));
  ic.position.z = 0.145; back.add(ic);
  // faint front marks
  if (rnd() < 0.35) { const fd = at(ball(0.07, M(C.line)), 0, 0, 0.15); front.add(fd); }
  piv.add(front, back);
  tab.add(piv);
  tiles.push({ piv, r, c, x, y, isCity, d: Math.hypot(c - 3, (r - 1.5) * 1.1) });
}
// ribbons
function ribbon(points, radius, color) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, 240, radius, 10);
  const m = new THREE.Mesh(g, M(color, { roughness: 0.35 })); m.castShadow = true; m.userData.count = g.index.count; return m;
}
const rib1 = ribbon([[-9.5, 3.6, 1.0], [-5, 2.2, 1.8], [-2, 3.2, 2.2], [0.5, 1.0, 1.6], [-1.2, -0.6, 2.0], [1.5, -1.2, 2.2], [5, 0.2, 1.8], [10, -2.5, 1.2]], 0.13, C.yellow);
const rib2 = ribbon([[10, 3.8, 1.2], [5, 2.0, 2.0], [2.5, -1.5, 2.2], [-1, -2.4, 1.8], [-3, -0.4, 2.2], [-6, -2.8, 1.8], [-10, -1.8, 1.0]], 0.11, C.mint);
tab.add(rib1, rib2);
// side widgets
const sideL = new THREE.Group(); sideL.position.set(-8.4, 0.6, 0);
sideL.add(slab(1.8, 0.07, 0.035, 0.1, 0, M(C.navy)));
const sideKnob = ball(0.24, M(C.lblue)); sideL.add(sideKnob); tab.add(sideL);
const sideR = new THREE.Group(); sideR.position.set(8.6, 2.6, 0);
sideR.add(slab(2.3, 0.62, 0.31, 0.32, 0.1, M(0xffffff)));
const sideFill = slab(2.1, 0.44, 0.22, 0.38, 0.08, M(C.coral)); sideFill.position.x = 0; sideR.add(sideFill); tab.add(sideR);
const pie = new THREE.Group(); pie.position.set(8.2, 0.2, 0);
{ const s = new THREE.Shape(); s.moveTo(0, 0); s.absarc(0, 0, 0.62, -Math.PI / 2, Math.PI / 2, false); s.closePath();
  const s2 = new THREE.Shape(); s2.moveTo(0, 0); s2.absarc(0, 0, 0.62, Math.PI / 2, Math.PI * 1.5, false); s2.closePath();
  pie.add(ext(s, 0.4, 0.06, M(C.yellow)), ext(s2, 0.4, 0.06, M(0xffffff))); }
tab.add(pie);
const sq3 = at(squiggle(1.3, 0.14, 1.5, 0.06, M(C.navy)), 9.5, 0.2, 0.15); tab.add(sq3);
const tabDots = [at(slab(0.5, 0.14, 0.07, 0.15, 0.05, M(C.lblue)), -2.5, -5.6, 0), at(slab(0.3, 0.14, 0.07, 0.15, 0.05, M(C.coral)), 0.4, -5.6, 0), at(slab(0.5, 0.14, 0.07, 0.15, 0.05, M(C.mint)), 3.4, -5.6, 0)];
tabDots.forEach((d) => tab.add(d));

// ============ S5/S6: city day -> night ============
const city = new THREE.Group(); scene.add(city);
const GY = -3.5;
const ground = new THREE.Mesh(new RoundedBoxGeometry(70, 1.4, 10, 4, 0.25), M(0xe9eef3, { roughness: 0.7, clearcoat: 0.1 }));
ground.position.set(0, GY - 0.7, 5); ground.receiveShadow = true; city.add(ground);
const road = at(new THREE.Mesh(new THREE.BoxGeometry(70, 0.04, 1.1), M(0xd7dfe7, { roughness: 0.8, clearcoat: 0 })), 0, GY + 0.02, 7.9); road.receiveShadow = true; city.add(road);
const builds = []; const windows = [];
function rbox(w, h, d, c) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(0.22, w / 4, d / 4)), M(c)); m.castShadow = m.receiveShadow = true; m.position.y = h / 2; return m; }
function cone(r, h, c) { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 64), M(c, { roughness: 0.5 })); m.castShadow = m.receiveShadow = true; m.position.y = h / 2; return m; }
function arch(w, h, d, c) {
  const g = new THREE.Group(); const bh = h - w / 2;
  g.add(rbox(w, bh, d, c));
  const top = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, d, 64, 1, false, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), M(c));
  top.position.y = bh - 0.01; top.castShadow = top.receiveShadow = true; g.add(top); return g;
}
function house(w, h, d, c, roofC) {
  const g = new THREE.Group(); g.add(rbox(w, h, d, c));
  const s = new THREE.Shape(); s.moveTo(-w / 2 - 0.15, 0); s.lineTo(0, w * 0.55); s.lineTo(w / 2 + 0.15, 0); s.closePath();
  const roof = ext(s, d + 0.2, 0.06, M(roofC)); roof.position.set(0, h, -d / 2 - 0.1); g.add(roof); return g;
}
function addB(obj, x, z, t0, wins) {
  const g = new THREE.Group(); g.position.set(x, GY, z); g.add(obj); g.userData.t0 = t0; city.add(g); builds.push(g);
  if (wins) wins.forEach(([wx, wy, c]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.38), new THREE.MeshStandardMaterial({ color: 0x2a4a6e, emissive: c, emissiveIntensity: 0, roughness: 0.4 }));
    m.position.set(wx, wy, wins.zf); g.add(m); windows.push({ m, t: 10.95 + rnd() * 0.6 });
  });
  return g;
}
function winGrid(w, h, d, cols, rows, y0, c = 0xffd56b) {
  const a = []; a.zf = d / 2 + 0.01;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) a.push([-w / 2 + (i + 0.5) * w / cols, y0 + j * 0.62, rnd() < 0.3 ? C.mint : c]);
  return a;
}
seed = 3;
// mountains
addB(cone(2.4, 6.4, 0xdde7f1), -7.2, 1.2, 8.70);
addB(cone(2.0, 7.2, 0xe7eef5), 4.4, 1.0, 8.78);
addB(cone(1.6, 4.6, 0xdde7f1), 8.8, 1.3, 8.86);
addB(cone(2.0, 5.2, 0xe7eef5), -11.4, 1.3, 8.74);
addB(cone(1.8, 5.6, 0xdde7f1), 12.0, 1.1, 8.92);
// arches / towers
addB(arch(3.2, 4.8, 1.6, C.coral), -5.0, 2.4, 9.00);
addB(arch(2.6, 4.2, 1.5, C.mint), 2.5, 2.2, 9.13);
addB(arch(2.2, 3.2, 1.4, C.navy), 10.2, 2.7, 9.25);
addB(rbox(1.8, 4.8, 1.6, C.navy), -2.6, 2.9, 9.06, winGrid(1.8, 4.8, 1.6, 2, 5, 1.0));
addB(rbox(2.2, 3.8, 1.8, C.yellow), 5.3, 3.0, 9.19, winGrid(2.2, 3.8, 1.8, 3, 4, 0.8, 0xffffff));
addB(rbox(1.6, 2.6, 1.6, C.mint), 7.7, 3.4, 9.31, winGrid(1.6, 2.6, 1.6, 2, 2, 0.9));
addB(rbox(2.0, 3.0, 1.6, C.lblue), -8.9, 3.0, 9.37, winGrid(2.0, 3.0, 1.6, 2, 3, 0.8));
// HQ with logo
const hq = rbox(2.5, 6.2, 2.1, C.navy);
const hqG = addB(hq, 0.2, 3.4, 9.45, winGrid(2.5, 6.2, 2.1, 3, 5, 0.7));
const hqLogoHolder = new THREE.Group(); hqG.add(hqLogoHolder);
const hqAnt = at(ball(0.22, M(C.mint, { emissive: C.mint, emissiveIntensity: 0.3 })), 0, 6.55, 0); hqG.add(hqAnt);
hqG.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 12), M(C.navy)), 0, 6.3, 0));
// front small
addB(house(2.0, 1.7, 1.8, 0xf6f7f9, C.coral), -4.0, 5.2, 9.56);
addB(rbox(1.6, 1.4, 1.4, C.lblue), 3.4, 5.4, 9.62);
{ const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.7, 48), M(C.coral)); tank.position.y = 0.85; tank.castShadow = tank.receiveShadow = true; addB(tank, 6.1, 5.5, 9.68); }
addB(rbox(1.4, 1.2, 1.2, C.yellow), -6.9, 5.6, 9.74);
addB(rbox(2.0, 1.6, 1.4, C.mint), -10.2, 5.2, 9.80);
addB(house(1.6, 1.3, 1.4, C.lblue, C.navy), 9.0, 5.4, 9.86);
[[-2.9, 6.6, C.mint], [1.9, 6.8, C.navy], [4.7, 6.5, C.mint], [-8.4, 6.7, C.navy], [8.0, 6.6, C.mint], [-5.6, 7.0, C.navy]].forEach(([x, z, c], i) => {
  const tr = new THREE.Group(); tr.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 12), M(0x8a6b55)), 0, 0.2, 0));
  const cn = cone(0.42, 1.25, c); cn.position.y = 0.4 + 0.62; tr.add(cn); addB(tr, x, z, 9.6 + i * 0.07);
});
[[-1.2, 7.3, C.coral], [5.6, 7.3, C.navy], [-7.2, 7.4, C.mint]].forEach(([x, z, c], i) => {
  const p = new THREE.Group(); p.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.0, 12), M(0x9aa8b8)), 0, 0.5, 0));
  p.add(at(new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.6, 0.34, 3, 0.15), M(c)), 0, 1.15, 0)); p.children[1].castShadow = true;
  addB(p, x, z, 9.9 + i * 0.08);
});
// sun -> planet
const sunMat = M(C.yellow, { emissive: C.yellow, emissiveIntensity: 0.15, roughness: 0.5, clearcoat: 0.2 });
const sun = ball(2.0, sunMat); sun.castShadow = false; city.add(sun);
const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.22, 24, 160), M(0xe9f4f0, { emissive: C.mint, emissiveIntensity: 0.15 }));
ringMesh.scale.z = 0.35; sun.add(ringMesh);
// car
const car = new THREE.Group();
car.add(at(new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.55, 0.7, 4, 0.25), M(C.mint)), 0, 0.42, 0));
car.add(at(new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.4, 0.62, 4, 0.18), M(0xffffff)), -0.05, 0.8, 0));
[-0.4, 0.4].forEach((x) => car.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.74, 24).rotateX(Math.PI / 2), M(C.navy)), x, 0.18, 0)));
car.traverse((o) => { if (o.isMesh) o.castShadow = true; });
city.add(car);
// stars
const stars = [];
seed = 21;
for (let i = 0; i < 46; i++) {
  const s = ball(0.05 + rnd() * 0.07, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 }));
  s.castShadow = false; s.position.set(-17 + rnd() * 34, 0.5 + rnd() * 10, 0.1); s.userData = { t: 10.8 + rnd() * 0.6, ph: rnd() * 6 };
  city.add(s); stars.push(s);
}

// ============ S7/S8: logo toggle + end card ============
let s7 = null, endG = null, urlPill = null, wordmark = null, tagline = null, miniTog = null, endDots = null, s7corner = null;
function buildEnd() {
  const kc = makeLogo(1.55, 0.3, C.navy, C.mint);
  s7 = makeToggle(kc); scene.add(s7.root);
  s7.disc.material = M(0xffffff, { clearcoat: 0.8, clearcoatRoughness: 0.12 });
  s7corner = new THREE.Group(); scene.add(s7corner);
  const ct = grp(slab(2.4, 0.7, 0.35, 0.25, 0.08, M(C.floor)), at(ball(0.24, M(0xffffff)), -0.75, 0, 0.2)); at(ct, -11.4, 6.3, 0); s7corner.add(ct);
  const cy = grp(slab(3.4, 0.9, 0.45, 0.3, 0.1, M(C.floor)), at(slab(2.3, 0.7, 0.35, 0.36, 0.08, M(C.mint)), 0.45, 0, 0), at(ball(0.3, M(0xffffff)), -1.2, 0, 0.25)); at(cy, 8.4, -6.0, 0); s7corner.add(cy);
  // end card
  endG = new THREE.Group(); scene.add(endG);
  const ringGlass = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.13, 24, 160), M(0xffffff, { clearcoat: 1, clearcoatRoughness: 0.05, roughness: 0.15 }));
  ringGlass.position.z = 0.5; ringGlass.castShadow = true; endG.add(ringGlass); endG.userData.ring = ringGlass;
  wordmark = txtDecal(6.4, 1.1, 'PLANET', C.navy, '900 150px "Inter Display"', 24);
  wordmark.material.map.image.getContext('2d'); wordmark.position.set(0, -3.75, 0.05); endG.add(wordmark);
  tagline = decal(9, 0.7, canvasTex(2048, 160, (g, w, h) => {
    g.fillStyle = css(C.navy); g.globalAlpha = 0.85; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
    g.font = '800 92px AlexB'; g.fillText('تسويق  •  سوشيال ميديا  •  مواقع إلكترونية', w / 2, h / 2 + 6);
  }));
  tagline.position.set(0, -4.85, 0.05); endG.add(tagline);
  urlPill = new THREE.Group();
  urlPill.add(slab(6.2, 1.05, 0.525, 0.38, 0.12, M(0xffffff, { clearcoat: 0.7 })));
  const ut = txtDecal(5.0, 0.8, 'www.theplanetco.com', C.navy, '700 64px "Inter Display"'); ut.position.set(-0.35, 0, 0.385); urlPill.add(ut);
  urlPill.add(at(ball(0.22, M(C.mint)), 2.6, 0, 0.3));
  at(urlPill, 9.3, -6.0, 0); scene.add(urlPill);
  miniTog = grp(slab(1.9, 0.55, 0.275, 0.18, 0.06, M(0xe2e7ed)), at(ball(0.18, M(0xffffff)), 0.6, 0, 0.14));
  at(miniTog, -12.0, 6.5, 0); scene.add(miniTog);
  endDots = grp(at(ball(0.13, M(C.coral)), -8.2, -5.6, 0.1), at(ball(0.11, M(C.mint)), -5.4, -5.9, 0.1), at(ball(0.09, M(C.navy)), 2.6, 6.3, 0.1));
  scene.add(endDots);
  // HQ sign logo
  const hl = makeLogo(1.3, 0.18, 0xffffff, C.mint); hl.position.set(0, 4.95, 1.06); hqLogoHolder.add(hl);
}

// ---------- frame update ----------
const show = (o, v) => { o.visible = v; };
function setCam(x, y, z, lx = 0, ly = 0, lz = 0) { camera.position.set(x, y, z); camera.lookAt(lx, ly, lz); }
const base = VERT ? 1.0 : 1.0;

function update(t) {
  // reset lights
  hemi.intensity = 1.15; key.intensity = 2.3; key.color.set(0xffffff); scene.environmentIntensity = 0.6;
  key.position.set(-12, 16, 30); key.target.position.set(0, 0, 0);
  wipe.visible = false;
  const camZ0 = VERT ? 56 : 30;

  // ----- backdrop + camera by phase -----
  if (t < 8.62) {
    // S1-S4 share frontal camera
    let z = camZ0, x = 0, y = 0, lx = 0, ly = 0;
    if (t < 0.7) z = camZ0 * lerp(1.1, 1, E.out(seg(t, 0, 0.7)));
    if (t > 5.3) z = camZ0 * lerp(1, 0.88, E.inOut(seg(t, 5.3, 8.2)));
    if (t > 8.2) {
      const k = seg(t, 8.2, 8.58); const tt = tiles.find((q) => q.isCity);
      const tx = tt.x, ty = tt.y + 0.25;
      x = lerp(0, tx, E.inOut(seg(t, 8.2, 8.45))); y = lerp(0, ty, E.inOut(seg(t, 8.2, 8.45)));
      z = lerp(camZ0 * 0.88, 1.55, 1 - Math.pow(1 - E.in(k), 1) ) ; z = Math.max(1.55, lerp(camZ0 * 0.88, 1.55, E.inOut(k))); lx = x; ly = y;
    }
    setCam(x, y, z, lx, ly, 0);
    if (t < 1.12) bgMat.color.set(C.bgNavy);
    else if (t < 1.62) { bgMat.color.set(C.bgNavy); wipe.visible = true; const k = E.inOut(seg(t, 1.12, 1.62)); wipe.scale.setScalar(0.01 + k * 40); wipe.position.set(lerp(2.8, 0, seg(t, 1.0, 1.45)), 0, 0.01); }
    else bgMat.color.set(C.bgWhite);
  } else if (t < 12.0) {
    const k = seg(t, 8.62, 12.0);
    const cx = lerp(-1.8, 1.6, E.inOut(k));
    const cz = lerp(31, 28.5, E.out(k));
    setCam(cx, 1.6, VERT ? cz * 1.75 : cz, cx * 0.7, 1.1, 0);
    const n = E.inOut(seg(t, 10.35, 10.95));
    bgMat.color.copy(col(C.sky)).lerp(col(C.night), n);
    hemi.intensity = lerp(1.15, 0.32, n); key.intensity = lerp(2.3, 0.55, n); key.color.copy(col(0xffffff)).lerp(col(0x9fb6ff), n);
    scene.environmentIntensity = lerp(0.6, 0.22, n);
  } else {
    let z = camZ0; if (t > 13.0) z = camZ0 * lerp(1, 0.965, E.out(seg(t, 13.0, 15)));
    setCam(0, 0, z);
    bgMat.color.set(C.bgNavy);
    if (t >= 13.0 && t < 13.5) { wipe.visible = true; wipe.position.set(0, 0, 0.01); wipe.scale.setScalar(0.01 + E.inOut(seg(t, 13.0, 13.48)) * 40); }
    if (t >= 13.48) bgMat.color.set(C.bgWhite);
  }

  // ----- S1 toggle -----
  show(s1.root, t < 1.5);
  if (t < 1.5) {
    const kx = lerp(-2.8, 2.8, E.inOut(seg(t, 0.3, 0.56)));
    const sq = bump(t, 0.3, 0.26);
    const pop = E.back(seg(t, 0, 0.35));
    s1.slot.scale.set(lerp(0.85, 1, pop), lerp(0.85, 1, pop), 1);
    s1.setFill(kx + 4.0 + 1.18);
    const out = E.in(seg(t, 0.98, 1.3));
    s1.slot.scale.multiplyScalar(1 - out * 0.999);
    s1.slot.position.x = out * 2.8;
    const grow = E.inOut(seg(t, 1.0, 1.45));
    const kk = lerp(1, 2.68, grow);
    s1.knob.position.set(lerp(kx, 0, grow), 0, 0);
    s1.knob.scale.set(kk * (1 + sq * 0.12), kk * (1 - sq * 0.06), 1);
    [s1dash, s1dot, s1dot2].forEach((o, i) => { o.scale.setScalar(Math.max(0.001, E.back(seg(t, 0.1 + i * 0.06, 0.45 + i * 0.06)) * (1 - out))); });
    s1dash.position.y = 3.2 + Math.sin(t * 3) * 0.1;
  }

  // ----- S2 dial -----
  show(dial, t >= 1.38 && t < 3.95);
  if (t >= 1.38 && t < 3.95) {
    // keep enlarged knob as base under the dial until bezel rises
    s1.root.visible = t < 1.75; if (t >= 1.5 && t < 1.75) { s1.slot.visible = false; s1.knob.position.set(0, 0, 0); s1.knob.scale.set(2.68, 2.68, 1); [s1dash, s1dot, s1dot2].forEach((o) => (o.visible = false)); }
    const rise = E.back(seg(t, 1.38, 1.7));
    bezel.scale.set(1, 1, Math.max(0.01, rise)); bezel.visible = true;
    const fpop = E.back(seg(t, 1.45, 1.78));
    face.scale.set(Math.max(0.001, fpop), Math.max(0.001, fpop), 1);
    faceDecal.scale.setScalar(Math.max(0.001, E.out(seg(t, 1.6, 1.9))));
    faceDecal.material.map = t < 2.05 ? faceTexA : faceTexB;
    setArc(E.inOut(seg(t, 1.7, 3.45)) * Math.PI * 2);
    arc.visible = t > 1.72;
    const beep = Math.max(bump(t, 2.05, 0.14), bump(t, 2.3, 0.14));
    arcMat.emissiveIntensity = 0.25 + beep * 1.2;
    const exit = E.in(seg(t, 3.5, 3.92));
    const sc = (1 + beep * 0.05) * (1 - exit) + 0.001;
    dial.scale.set(sc, sc, sc);
    dial.rotation.z = Math.sin(t * 1.6) * 0.04 - exit * Math.PI * 1.4;
    dial.position.y = Math.sin(t * 2.0) * 0.06;
    orbit.scale.setScalar(Math.max(0.001, E.out(seg(t, 1.55, 2.0))));
    const oa = t * 2.2; orbBall.position.set(Math.cos(oa) * 4.1, Math.sin(oa) * 4.1, 0.3);
    orbBall.scale.setScalar(Math.max(0.001, E.back(seg(t, 1.7, 2.0))));
    dialPill.scale.setScalar(Math.max(0.001, E.back(seg(t, 1.8, 2.1))));
    dialDot.scale.setScalar(Math.max(0.001, E.back(seg(t, 1.9, 2.2))));
  }

  // ----- S3 calendar -----
  show(cal, t >= 3.78 && t < 5.32);
  if (t >= 3.78 && t < 5.32) {
    const pop = E.back(seg(t, 3.78, 4.2));
    const out = E.in(seg(t, 5.0, 5.28));
    const s = Math.max(0.001, pop * (1 - out));
    calBase.scale.setScalar(1); cal.scale.set(1, 1, 1);
    cal.rotation.z = lerp(-0.35, 0, E.out(seg(t, 3.78, 4.3)));
    // scale calendar body (base + pages) around center
    calBase.scale.set(s, s, s); calBase.position.set(0.32 * s, -0.32 * s, 0);
    pages.forEach((p, i) => {
      p.scale.set(s, s, s); p.position.set(0, 2.8 * s, (0.58 + i * 0.075) * s);
      const idx = 6 - i; // top page index 6 flips first
      let ang = 0;
      if (i >= 1) { const ft = flipT[6 - i]; const k = seg(t, ft, ft + 0.3); ang = -Math.PI * 0.97 * E.inOut(k); p.visible = k < 0.75; if (k > 0.45) { const f = 1 - seg(k, 0.45, 0.75); p.scale.set(s * f, s * f, s); } }
      else p.visible = true;
      p.rotation.x = ang;
    });
    conf.forEach((o, i) => {
      const u = o.userData; const t0 = 4.0 + (i % 7) * 0.035;
      const k = E.back(seg(t, t0, t0 + 0.5)); const ko = E.in(seg(t, 4.95 + (i % 5) * 0.03, 5.22 + (i % 5) * 0.03));
      const sc = Math.max(0.001, k * (1 - ko));
      o.scale.setScalar(sc);
      o.position.set(lerp(0, u.x, E.out(seg(t, t0, t0 + 0.45))) * (1 - ko * 0.4), lerp(0, u.y, E.out(seg(t, t0, t0 + 0.45))) * (1 - ko * 0.4) + Math.sin(t * 2.4 + i) * 0.1, 0.05);
      o.rotation.z = u.rz + Math.sin(t * 1.7 + i * 1.3) * 0.12 + (1 - k) * 1.2;
      o.rotation.y = Math.sin(t * 1.3 + i) * 0.15;
    });
  }

  // ----- S4 tablet -----
  show(tab, t >= 4.98 && t < 8.62);
  if (t >= 4.98 && t < 8.62) {
    const pop = E.back(seg(t, 4.98, 5.45));
    const s = lerp(0.3, 1, pop);
    tab.scale.set(s, s, s); tab.position.set(0, 0.25, 0);
    tab.rotation.x = lerp(0.5, 0, E.out(seg(t, 4.98, 5.5)));
    tab.visible = pop > 0.001;
    tiles.forEach((q) => {
      const t0 = 5.45 + (q.c + q.r) * 0.075;
      const k = E.inOut(seg(t, t0, t0 + 0.4));
      const pp = bump(t, 7.0 + q.d * 0.11, 0.34);
      q.piv.rotation.y = k * Math.PI;
      q.piv.position.z = 0.1 + Math.sin(Math.PI * k) * 0.95 + pp * 0.55;
      const ps = 1 + pp * 0.08; q.piv.scale.set(ps, ps, 1);
    });
    const draw = (m, a, b, tail = 0.38) => { const p = seg(t, a, b); const n = m.userData.count; const head = Math.floor(E.inOut(p) * n), tl = Math.floor(E.inOut(clamp01((p - tail) / (1 - tail))) * n); const s0 = Math.floor(tl / 3) * 3; m.geometry.setDrawRange(s0, Math.max(0, Math.floor((head - tl) / 3) * 3)); m.visible = p > 0 && p < 1; };
    draw(rib1, 5.4, 6.5); draw(rib2, 7.05, 8.1);
    sideKnob.position.x = Math.sin(t * 2.2) * 0.8;
    const fw = 0.25 + 0.75 * E.inOut(seg(t, 5.6, 7.6)); sideFill.scale.x = fw; sideFill.position.x = -1.05 * (1 - fw);
    sideFill.material.color.copy(col(C.coral)).lerp(col(C.mint), seg(t, 7.2, 7.6));
    pie.rotation.z = -t * 1.4;
    [sideL, sideR, pie, sq3, ...tabDots].forEach((o, i) => o.scale.setScalar(Math.max(0.001, E.back(seg(t, 5.3 + i * 0.05, 5.7 + i * 0.05)))));
  }

  // ----- S5/S6 city -----
  show(city, t >= 8.62 && t < 12.0);
  if (t >= 8.62 && t < 12.0) {
    builds.forEach((g) => { const k = E.back(seg(t, g.userData.t0, g.userData.t0 + 0.42)); g.scale.set(Math.max(0.001, lerp(0.6, 1, Math.min(1, k * 1.2))), Math.max(0.001, k), Math.max(0.001, lerp(0.6, 1, Math.min(1, k * 1.2)))); });
    const n = E.inOut(seg(t, 10.35, 10.95));
    const sy = lerp(-1.5, 5.4, E.out5(seg(t, 8.66, 9.5))) - n * 0.6;
    sun.position.set(3.2, sy, 0.6);
    sunMat.color.copy(col(C.yellow)).lerp(col(C.mint), n);
    sunMat.emissive.copy(col(C.yellow)).lerp(col(C.mint), n);
    sunMat.emissiveIntensity = lerp(0.15, 0.45, n);
    const rk = E.back(seg(t, 10.85, 11.35));
    ringMesh.visible = rk > 0.001; ringMesh.scale.set(Math.max(0.001, rk), Math.max(0.001, rk), 0.35 * Math.max(0.001, rk));
    ringMesh.rotation.set(1.25, -0.35, 0.15 + t * 0.15);
    sun.rotation.z = 0.25;
    windows.forEach((w) => { w.m.material.emissiveIntensity = 1.6 * E.out(seg(t, w.t, w.t + 0.15)); w.m.material.color.set(t > w.t ? 0x334f73 : 0x2a4a6e); });
    stars.forEach((s) => { const k = E.back(seg(t, s.userData.t, s.userData.t + 0.3)); s.scale.setScalar(Math.max(0.001, k * (0.75 + 0.25 * Math.sin(t * 6 + s.userData.ph)))); s.visible = k > 0.001; });
    car.position.set(lerp(-17, 17, seg(t, 9.0, 11.9)), GY + 0.0, 7.9);
    car.position.y = GY + Math.abs(Math.sin(t * 14)) * 0.04;
    hqAnt.material.emissiveIntensity = 0.3 + n * 1.5 * (0.6 + 0.4 * Math.sin(t * 8));
  }

  // ----- S7 logo toggle -----
  const in7 = t >= 12.0 && t < 15.1;
  show(s7.root, in7); show(s7corner, t >= 12.0 && t < 13.2);
  if (in7) {
    const pop = E.back(seg(t, 12.0, 12.28));
    const kx = lerp(-2.8, 2.8, E.inOut(seg(t, 12.36, 12.6)));
    const sq = bump(t, 12.36, 0.24);
    s7.setFill(kx + 4.0 + 1.18);
    const out = E.in(seg(t, 12.72, 13.02));
    const ss = lerp(0.7, 1, pop) * (1 - out) + 0.001;
    s7.slot.scale.set(ss, ss, 1); s7.slot.position.x = out * 2.8;
    s7.slot.visible = out < 1;
    const grow = E.inOut(seg(t, 12.72, 13.12));
    const kk = lerp(1, 1.95, grow) * lerp(0.7, 1, pop);
    s7.knob.position.set(lerp(kx, 0, grow), Math.sin(Math.max(0, t - 13.2) * 2) * 0.06, 0);
    s7.knob.scale.set(kk * (1 + sq * 0.12), kk * (1 - sq * 0.06), lerp(1, 1.4, grow));
    s7.knob.rotation.y = Math.sin(Math.max(0, t - 13.3) * 1.6) * 0.08;
    s7corner.children.forEach((c, i) => c.scale.setScalar(Math.max(0.001, E.back(seg(t, 12.05 + i * 0.06, 12.35 + i * 0.06)) * (1 - E.in(seg(t, 12.95, 13.15))))));
    s7corner.children[1].children[1].position.x = lerp(-0.45, 0.45, E.inOut(seg(t, 12.4, 12.65)));
  }
  // ----- S8 end card -----
  const in8 = t >= 13.1;
  show(endG, in8); show(urlPill, in8); show(miniTog, in8); show(endDots, in8);
  if (in8) {
    const r = endG.userData.ring; const rk = E.back(seg(t, 13.15, 13.55));
    r.scale.setScalar(Math.max(0.001, rk)); r.position.y = s7.knob.position.y;
    const wk = E.out(seg(t, 13.45, 13.85)); wordmark.material.opacity = wk; wordmark.position.y = lerp(-4.2, -3.75, wk);
    const tk = E.out(seg(t, 13.62, 14.05)); tagline.material.opacity = tk; tagline.position.y = lerp(-5.25, -4.85, tk);
    urlPill.position.x = lerp(18, 9.3, E.out5(seg(t, 13.4, 13.8)));
    miniTog.scale.setScalar(Math.max(0.001, E.back(seg(t, 13.5, 13.8))));
    miniTog.children[1].position.x = lerp(-0.6, 0.6, E.inOut(seg(t, 13.9, 14.15)));
    endDots.children.forEach((d, i) => d.scale.setScalar(Math.max(0.001, E.back(seg(t, 13.55 + i * 0.07, 13.85 + i * 0.07)))));
    // knob disc becomes white on white bg
  }
  if (in7) {
    const rimC = t >= 13.48 ? C.bgWhite : C.bgNavy;
    s7.slot.children[0].material.color.set(rimC);
  }
}

window.renderAt = (t) => { update(t); renderer.render(scene, camera); };
window.ready = (async () => {
  await document.fonts.load('800 100px "Inter Display"');
  await document.fonts.load('900 100px "Inter Display"');
  await document.fonts.load('700 100px "Inter Display"');
  await document.fonts.load('800 50px AlexB', 'تسويق');
  await loadLogo();
  buildEnd();
  // re-render text textures now that fonts are loaded is handled since textures are created after load below
  return true;
})();
