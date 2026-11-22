/* Anwar Ghaleb — procedural 3D accessory models (Three.js r170).
   Used live in the hero and offline (render.html) to bake product shots. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------- materials ---------- */
export function mat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial(Object.assign({
    color, roughness: .42, metalness: 0, clearcoat: .6, clearcoatRoughness: .25, envMapIntensity: 1
  }, o));
}
export const M = {
  metal: (c = '#c9ccd3') => mat(c, { metalness: 1, roughness: .22, clearcoat: 0 }),
  glass: () => mat('#0b0d14', { roughness: .05, metalness: .2, clearcoat: 1, clearcoatRoughness: .02 }),
  rubber: (c = '#15171d') => mat(c, { roughness: .8, clearcoat: 0 }),
  plastic: (c) => mat(c, { roughness: .35, clearcoat: .8, clearcoatRoughness: .15 }),
  matte: (c) => mat(c, { roughness: .62, clearcoat: .15 }),
  clear: (tint = '#ffffff') => mat(tint, { transmission: 1, thickness: .06, roughness: .06, ior: 1.45, clearcoat: 1, transparent: true, opacity: 1 }),
  lens: () => mat('#05060a', { roughness: .02, metalness: .4, clearcoat: 1, clearcoatRoughness: 0 }),
  glow: (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false })
};

/* ---------- geometry helpers ---------- */
function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
/* rounded-rect slab centred on origin, thickness d along Z */
export function slab(w, h, d, r, bev = 0.02, holes = []) {
  const s = rrShape(w - bev * 2, h - bev * 2, Math.max(r - bev, 0.005));
  holes.forEach(hh => { const p = rrShape(hh.w, hh.h, hh.r); p.curves.forEach(c => { if (c.v0) { c.v0.x += hh.x; c.v0.y += hh.y; } if (c.v1) { c.v1.x += hh.x; c.v1.y += hh.y; } if (c.v2) { c.v2.x += hh.x; c.v2.y += hh.y; } }); s.holes.push(new THREE.Path(p.getPoints(24))); });
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(d - bev * 2, 0.001), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 5, curveSegments: 24 });
  g.translate(0, 0, -(d - bev * 2) / 2);
  g.computeVertexNormals();
  return g;
}
function cyl(r, h, c, seg = 48) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), c); return m; }
function add(p, m, x = 0, y = 0, z = 0) { m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; }

/* canvas texture helper */
function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const BRAND = { ink: '#0A0B12', indigo: '#5046FF', volt: '#D4FF3A' };

export function screenTex(kind = 'lock') {
  return tex(512, 1080, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#1b1660'); gr.addColorStop(.55, '#4a3cff'); gr.addColorStop(1, '#0a0b12');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const rg = g.createRadialGradient(w * .75, h * .7, 10, w * .75, h * .7, w);
    rg.addColorStop(0, 'rgba(212,255,58,.55)'); rg.addColorStop(1, 'rgba(212,255,58,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.textAlign = 'center';
    g.font = '600 150px "Inter Tight", Manrope, sans-serif'; g.fillText('9:41', w / 2, 300);
    g.font = '500 34px Manrope, sans-serif'; g.globalAlpha = .8; g.fillText('100% · Charged', w / 2, 360); g.globalAlpha = 1;
    // pill
    g.fillStyle = '#000'; g.beginPath(); g.roundRect(w / 2 - 70, 26, 140, 40, 20); g.fill();
    // charging ring
    g.strokeStyle = BRAND.volt; g.lineWidth = 14; g.lineCap = 'round';
    g.beginPath(); g.arc(w / 2, 720, 120, -Math.PI / 2, Math.PI * 1.5); g.stroke();
    g.fillStyle = BRAND.volt; g.beginPath();
    g.moveTo(w / 2 + 12, 650); g.lineTo(w / 2 - 34, 730); g.lineTo(w / 2 - 2, 730); g.lineTo(w / 2 - 14, 790); g.lineTo(w / 2 + 34, 708); g.lineTo(w / 2 + 2, 708); g.closePath(); g.fill();
  });
}

/* ---------- phone ---------- */
export function phone({ color = '#2b2f3a', screen = true } = {}) {
  const g = new THREE.Group(); g.name = 'phone';
  const W = .74, H = 1.56, D = .075;
  add(g, new THREE.Mesh(slab(W, H, D, .12, .018), M.metal(color)));
  if (screen) {
    const sc = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(W - .05, H - .05, .1), 24), new THREE.MeshPhysicalMaterial({ map: screenTex(), roughness: .08, clearcoat: 1, emissive: '#ffffff', emissiveMap: screenTex(), emissiveIntensity: .55 }));
    const uv = sc.geometry.attributes.uv, pos = sc.geometry.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / (W - .05) + .5, pos.getY(i) / (H - .05) + .5);
    add(g, sc, 0, 0, D / 2 + .001);
  }
  // back glass
  const bk = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(W - .03, H - .03, .1), 24), mat(color, { roughness: .3, clearcoat: 1 }));
  bk.rotation.y = Math.PI; add(g, bk, 0, 0, -D / 2 - .001);
  // camera plateau
  const cam = new THREE.Group(); cam.position.set(.155, .5, -D / 2 - .012); g.add(cam);
  add(cam, new THREE.Mesh(slab(.33, .33, .022, .08, .008), mat(color, { roughness: .25, metalness: .3, clearcoat: 1 })));
  [[-.075, .075], [-.075, -.075], [.08, 0]].forEach(([x, y]) => {
    const ring = cyl(.062, .03, M.metal('#9aa0ab')); ring.rotation.x = Math.PI / 2; add(cam, ring, x, y, -.012);
    const l = cyl(.048, .032, M.lens()); l.rotation.x = Math.PI / 2; add(cam, l, x, y, -.014);
  });
  const fl = cyl(.018, .02, M.glow('#fff4d6')); fl.rotation.x = Math.PI / 2; add(cam, fl, .08, .1, -.012);
  return g;
}

/* ---------- case (viewed from the back) ---------- */
export function phoneCase({ color = '#5046FF', style = 'silicone', magsafe = true, withPhone = true, phoneColor = '#d9dbe1', screen = false } = {}) {
  const g = new THREE.Group(); g.name = 'case';
  const W = .82, H = 1.64, D = .11;
  if (withPhone) { const p = phone({ color: phoneColor, screen }); p.position.z = .008; g.add(p); }
  const hole = { x: .155, y: .5, w: .38, h: .38, r: .1 };
  const m = style === 'clear' ? M.clear(color) : style === 'leather' ? mat(color, { roughness: .7, clearcoat: .25, sheen: .25, sheenColor: '#ffffff', sheenRoughness: .8 }) : style === 'carbon' ? mat(color, { roughness: .35, clearcoat: 1, clearcoatRoughness: .05 }) : M.matte(color);
  // back plate with camera hole
  const back = new THREE.Mesh(slab(W, H, .03, .15, .012, [hole]), m); add(g, back, 0, 0, -D / 2 + .015);
  // rim (frame)
  const rim = new THREE.Mesh(slab(W, H, D, .15, .02, [{ x: 0, y: 0, w: W - .07, h: H - .07, r: .11 }]), m); add(g, rim, 0, 0, 0);
  // camera surround
  const sur = new THREE.Mesh(slab(.42, .42, .04, .12, .012, [{ x: 0, y: 0, w: .37, h: .37, r: .1 }]), style === 'clear' ? M.metal('#c9ccd3') : M.rubber('#101218'));
  add(g, sur, hole.x, hole.y, -D / 2 - .002);
  // buttons
  [.3, .12].forEach(y => { const b = new THREE.Mesh(new RoundedBoxGeometry(.02, .14, .05, 3, .01), m); add(g, b, -W / 2 - .006, y, 0); });
  add(g, new THREE.Mesh(new RoundedBoxGeometry(.02, .2, .05, 3, .01), m), W / 2 + .006, .2, 0);
  if (magsafe) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.2, .009, 12, 96), style === 'clear' ? M.matte('#e8eaf0') : M.metal('#e9ebef'));
    add(g, ring, 0, -.12, -D / 2 - .002);
    const dot = new THREE.Mesh(new RoundedBoxGeometry(.012, .07, .01, 2, .004), ring.material); add(g, dot, 0, -.38, -D / 2 - .002);
  }
  if (style === 'carbon') {
    const t = tex(256, 256, (c, w, h) => { c.fillStyle = '#0d0e12'; c.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { c.fillStyle = (i + j) % 2 ? '#1d2028' : '#2a2e38'; c.fillRect(i * 16, j * 16, 16, 16); c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(i * 16, j * 16, 16, 3); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 6);
    back.material = back.material.clone(); back.material.map = t; back.material.color.set('#ffffff');
  }
  return g;
}

/* ---------- charger brick ---------- */
export function charger({ color = '#f2f3f6', watts = '65W', ports = 3 } = {}) {
  const g = new THREE.Group(); g.name = 'charger';
  const s = .46, body = mat(color, { roughness: .5, clearcoat: .4 });
  add(g, new THREE.Mesh(new RoundedBoxGeometry(s, s * 1.15, s * .9, 6, .07), body));
  // ports on front (+z)
  for (let i = 0; i < ports; i++) {
    const y = .14 - i * .12;
    add(g, new THREE.Mesh(new RoundedBoxGeometry(.11, .04, .02, 3, .018), M.rubber('#0c0d11')), 0, y, s * .45);
  }
  // label
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(.3, .12), new THREE.MeshBasicMaterial({ transparent: true, map: tex(300, 120, (c, w, h) => { c.fillStyle = color === '#f2f3f6' ? '#5046FF' : '#D4FF3A'; c.font = '700 70px "Inter Tight", Manrope, sans-serif'; c.textAlign = 'center'; c.fillText(watts, w / 2, 84); }) }));
  add(g, lab, 0, -.19, s * .451);
  // prongs (back)
  [-.07, .07].forEach(x => { const p = new THREE.Mesh(new RoundedBoxGeometry(.03, .1, .16, 2, .008), M.metal()); add(g, p, x, 0, -s * .45 - .07); });
  // LED
  add(g, new THREE.Mesh(new THREE.SphereGeometry(.008, 12, 12), M.glow(BRAND.volt)), .17, .21, s * .45);
  return g;
}

/* ---------- USB-C plug ---------- */
function plug(color, kind = 'c') {
  const g = new THREE.Group();
  add(g, new THREE.Mesh(new RoundedBoxGeometry(.075, .22, .045, 4, .02), mat(color, { roughness: .4 })), 0, 0, 0);
  add(g, new THREE.Mesh(new RoundedBoxGeometry(kind === 'l' ? .04 : .055, .09, kind === 'l' ? .012 : .022, 3, kind === 'l' ? .005 : .01), M.metal()), 0, .15, 0);
  add(g, new THREE.Mesh(new THREE.CylinderGeometry(.02, .028, .06, 24), mat(color, { roughness: .5 })), 0, -.13, 0);
  return g;
}

/* ---------- coiled cable ---------- */
export function cable({ color = '#5046FF', braided = true, ends = ['c', 'c'] } = {}) {
  const g = new THREE.Group(); g.name = 'cable';
  const pts = [];
  const loops = 4.2, n = 300;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * Math.PI * 2 * loops;
    const r = .34 + Math.sin(t * Math.PI * 7) * .015;
    pts.push(V(Math.cos(a) * r, Math.sin(a) * r * .92, (t - .5) * .34));
  }
  // leads
  const s0 = pts[0], s1 = pts[pts.length - 1];
  const curve = new THREE.CatmullRomCurve3([V(s0.x + .1, s0.y - .42, s0.z + .1), V(s0.x + .08, s0.y - .16, s0.z), ...pts, V(s1.x - .05, s1.y + .18, s1.z), V(s1.x - .2, s1.y + .42, s1.z + .1)]);
  const tube = new THREE.TubeGeometry(curve, 900, .032, 16, false);
  let m = mat(color, { roughness: braided ? .65 : .4, clearcoat: braided ? .1 : .6 });
  if (braided) {
    const t = tex(128, 32, (c, w, h) => { c.fillStyle = '#888'; c.fillRect(0, 0, w, h); for (let i = -4; i < 20; i++) { c.strokeStyle = i % 2 ? '#fff' : '#555'; c.lineWidth = 5; c.beginPath(); c.moveTo(i * 8, 0); c.lineTo(i * 8 + 32, h); c.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(220, 1); t.colorSpace = THREE.NoColorSpace;
    m.bumpMap = t; m.bumpScale = 2.5;
  }
  add(g, new THREE.Mesh(tube, m));
  const pA = plug(color, ends[0]); pA.scale.setScalar(1.5); pA.position.copy(curve.getPoint(0)); pA.lookAt(curve.getPoint(0).add(curve.getTangent(0).multiplyScalar(-1))); pA.rotateX(Math.PI / 2); pA.translateY(.15); g.add(pA);
  const pB = plug(color, ends[1]); pB.scale.setScalar(1.5); const e = curve.getPoint(1); pB.position.copy(e); pB.lookAt(e.clone().add(curve.getTangent(1))); pB.rotateX(Math.PI / 2); pB.translateY(.15); g.add(pB);
  g.rotation.set(-.6, .3, 0);
  return g;
}

/* ---------- earbuds + case ---------- */
function bud(color) {
  const g = new THREE.Group(), m = M.plastic(color);
  add(g, new THREE.Mesh(new THREE.SphereGeometry(.085, 32, 24), m));
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.055, 24, 16), M.rubber('#c9ccd5')); tip.scale.set(1, 1, .8); add(g, tip, -.04, .02, .06);
  const stem = new THREE.Mesh(new THREE.CapsuleGeometry(.03, .2, 8, 20), m); add(g, stem, .03, -.15, -.01); stem.rotation.z = .15;
  add(g, cyl(.02, .01, M.metal()), .045, -.26, 0).rotation.z = .15;
  return g;
}
export function earbuds({ color = '#f3f4f7', open = true } = {}) {
  const g = new THREE.Group(); g.name = 'earbuds';
  const m = M.plastic(color);
  const base = new THREE.Mesh(new RoundedBoxGeometry(.62, .34, .26, 8, .12), m); add(g, base, 0, -.08, 0);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(.62, .2, .26, 8, .1), m);
  const hinge = new THREE.Group(); hinge.position.set(0, .07, -.13); g.add(hinge);
  lid.position.set(0, .06, .13); hinge.add(lid);
  if (open) hinge.rotation.x = -1.75;
  add(g, new THREE.Mesh(new THREE.SphereGeometry(.012, 12, 12), M.glow(BRAND.volt)), 0, -.05, .131);
  if (!open) add(g, new THREE.Mesh(new RoundedBoxGeometry(.6, .006, .25, 2, .003), M.rubber('#cfd2da')), 0, .087, 0);
  if (open) {
    const a = bud(color); a.position.set(-.14, .2, .03); a.rotation.set(.3, .4, .25); g.add(a);
    const b = bud(color); b.position.set(.16, .14, .05); b.rotation.set(.2, -2.6, -.25); g.add(b);
  }
  return g;
}

/* ---------- over-ear headphones ---------- */
export function headphones({ color = '#1c1e26', accent = '#D4FF3A' } = {}) {
  const g = new THREE.Group(); g.name = 'headphones';
  const band = new THREE.Mesh(new THREE.TorusGeometry(.42, .035, 16, 80, Math.PI), M.matte(color)); band.scale.set(1, 1.1, 1.6); add(g, band, 0, .05, 0);
  const pad = new THREE.Mesh(new THREE.TorusGeometry(.42, .03, 12, 60, Math.PI * .6), M.rubber('#2b2e38')); pad.rotation.z = Math.PI * .2; pad.position.set(0, .06, 0); pad.scale.set(.96, 1.05, 1.6); g.add(pad);
  [-1, 1].forEach(s => {
    const cup = new THREE.Group(); cup.position.set(s * .44, -.18, 0); g.add(cup);
    const shell = new THREE.Mesh(new THREE.CapsuleGeometry(.15, .1, 12, 32), M.matte(color)); shell.scale.set(.75, 1, 1); shell.rotation.z = 0; add(cup, shell);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(.12, .045, 16, 48), M.rubber('#22252e')); cushion.rotation.y = Math.PI / 2; cushion.scale.set(1, 1.3, 1); add(cup, cushion, -s * .07, 0, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.1, .008, 8, 48), M.glow(accent)); ring.rotation.y = Math.PI / 2; ring.scale.set(1, 1.3, 1); add(cup, ring, s * .115, 0, 0);
    const arm = new THREE.Mesh(new RoundedBoxGeometry(.03, .18, .05, 3, .012), M.metal('#a7acb6')); add(cup, arm, 0, .2, 0);
  });
  g.rotation.y = -.5;
  return g;
}

/* ---------- power bank ---------- */
export function powerbank({ color = '#1c1e26', magsafe = false, cap = '20000' } = {}) {
  const g = new THREE.Group(); g.name = 'powerbank';
  const w = magsafe ? .62 : .58, h = magsafe ? .98 : 1.12, d = magsafe ? .12 : .17;
  add(g, new THREE.Mesh(slab(w, h, d, magsafe ? .12 : .1, .03), M.matte(color)));
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(w * .62, .2), new THREE.MeshBasicMaterial({ transparent: true, map: tex(320, 100, (c, W, H) => { c.fillStyle = '#05060a'; c.beginPath(); c.roundRect(0, 0, W, H, 22); c.fill(); c.fillStyle = BRAND.volt; c.font = '700 54px "Inter Tight", Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('100%', W / 2 - 30, 70); c.fillRect(W - 70, 32, 44, 36); c.fillRect(W - 26, 42, 6, 16); }) }));
  add(g, disp, 0, h * .3, d / 2 + .002);
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(w * .8, .14), new THREE.MeshBasicMaterial({ transparent: true, map: tex(400, 70, (c, W, H) => { c.fillStyle = /^#(e|f)/i.test(color) ? 'rgba(10,11,18,.65)' : 'rgba(255,255,255,.75)'; c.font = '600 40px "Inter Tight", Manrope, sans-serif'; c.textAlign = 'center'; c.fillText(cap + ' mAh', W / 2, 48); }) }));
  add(g, lab, 0, -h * .32, d / 2 + .002);
  // ports top
  for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(new RoundedBoxGeometry(.1, .02, .04, 2, .01), M.rubber('#05060a')); add(g, p, -.08 + i * .16, h / 2, 0); }
  if (magsafe) { const r = new THREE.Mesh(new THREE.TorusGeometry(.2, .01, 12, 80), M.metal('#e9ebef')); add(g, r, 0, 0, -d / 2 - .002); }
  return g;
}

/* ---------- smartwatch ---------- */
export function watch({ color = '#1c1e26', band = '#5046FF' } = {}) {
  const g = new THREE.Group(); g.name = 'watch';
  add(g, new THREE.Mesh(slab(.44, .52, .12, .13, .03), M.metal(color)));
  const face = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(.39, .47, .11), 24), new THREE.MeshBasicMaterial({ toneMapped: false, map: tex(390, 470, (c, w, h) => {
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    const rings = [[BRAND.volt, .85], ['#7d74ff', .65], ['#38e1ff', .5]];
    rings.forEach(([col, p], i) => { const r = 150 - i * 34; c.lineCap = 'round'; c.lineWidth = 26; c.strokeStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.arc(w / 2, h / 2 + 30, r, 0, Math.PI * 2); c.stroke(); c.strokeStyle = col; c.beginPath(); c.arc(w / 2, h / 2 + 30, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); c.stroke(); });
    c.fillStyle = '#fff'; c.font = '600 54px "Inter Tight", Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('10:09', w / 2, 70);
  }) }));
  const uv = face.geometry.attributes.uv, pos = face.geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / .39 + .5, pos.getY(i) / .47 + .5);
  add(g, face, 0, 0, .061);
  const crown = cyl(.03, .05, M.metal('#b8bcc6')); crown.rotation.z = Math.PI / 2; add(g, crown, .24, .1, 0);
  add(g, new THREE.Mesh(new RoundedBoxGeometry(.02, .1, .03, 2, .008), M.metal('#b8bcc6')), .23, -.07, 0);
  // straps: curved via a bent tube of rounded segments
  [1, -1].forEach(s => {
    const curve = new THREE.CatmullRomCurve3([V(0, s * .22, 0), V(0, s * .45, -.06), V(0, s * .6, -.28), V(0, s * .58, -.55)]);
    const shape = rrShape(.32, .03, .014);
    const geo = new THREE.ExtrudeGeometry(shape, { steps: 60, bevelEnabled: false, extrudePath: curve });
    add(g, new THREE.Mesh(geo, M.matte(band)));
  });
  return g;
}

/* ---------- tempered glass protector ---------- */
export function glass({ tint = '#ffffff', privacy = false } = {}) {
  const g = new THREE.Group(); g.name = 'glass';
  const p = phone({ color: '#2b2f3a' }); p.rotation.y = 0; g.add(p);
  const gl = new THREE.Mesh(slab(.76, 1.58, .012, .12, .005), privacy ? mat('#0a0b12', { transmission: .6, roughness: .05, transparent: true, opacity: .8, clearcoat: 1 }) : mat('#bfe3ff', { transmission: .85, thickness: .1, roughness: .03, ior: 1.6, clearcoat: 1, iridescence: .6, iridescenceIOR: 1.3, transparent: true }));
  gl.position.set(.1, .12, .2); gl.rotation.set(-.12, .18, -.05); g.add(gl);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(.01, .002, 4, 4), M.glow('#fff')); edge.visible = false; g.add(edge);
  return g;
}

/* ---------- wireless charging pad / 3-in-1 ---------- */
export function pad({ color = '#f2f3f6', ring = '#5046FF' } = {}) {
  const g = new THREE.Group(); g.name = 'pad';
  const base = cyl(.4, .06, M.matte(color), 96); add(g, base);
  const top = cyl(.36, .012, M.rubber('#22252e'), 96); add(g, top, 0, .035, 0);
  const r = new THREE.Mesh(new THREE.TorusGeometry(.37, .008, 8, 120), M.glow(ring)); r.rotation.x = Math.PI / 2; add(g, r, 0, -.01, 0);
  add(g, new THREE.Mesh(new THREE.TorusGeometry(.2, .006, 8, 80), M.metal('#d8dbe2')), 0, .043, 0).rotation.x = Math.PI / 2;
  g.rotation.x = .55;
  return g;
}
export function stand3({ color = '#1c1e26' } = {}) {
  const g = new THREE.Group(); g.name = 'stand3';
  const m = M.matte(color);
  add(g, new THREE.Mesh(new RoundedBoxGeometry(1.0, .07, .55, 6, .03), m), 0, -.62, 0);
  const pole = new THREE.Mesh(new RoundedBoxGeometry(.08, 1.1, .08, 4, .035), M.metal('#b8bcc6')); pole.rotation.x = -.18; add(g, pole, -.18, -.1, -.08);
  const disc = cyl(.2, .05, m, 64); disc.rotation.x = Math.PI / 2 - .18; add(g, disc, -.18, .35, .01);
  const ph = phone({ color: '#d9dbe1' }); ph.scale.setScalar(.62); ph.rotation.x = -.18; ph.position.set(-.18, .3, .06); g.add(ph);
  const wpad = cyl(.12, .03, M.rubber('#22252e'), 48); add(g, wpad, .3, -.57, .05);
  const w = watch({ band: '#5046FF' }); w.scale.setScalar(.45); w.rotation.x = -1.2; w.position.set(.3, -.48, .06); g.add(w);
  const bc = new THREE.Mesh(new RoundedBoxGeometry(.2, .12, .09, 5, .04), M.plastic('#f3f4f7')); add(g, bc, .3, -.48, -.17);
  return g;
}

/* ---------- car mount ---------- */
export function carMount({ color = '#1c1e26' } = {}) {
  const g = new THREE.Group(); g.name = 'carmount';
  const disc = cyl(.3, .08, M.matte(color), 96); disc.rotation.x = Math.PI / 2; add(g, disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.2, .012, 10, 96), M.metal('#e9ebef')); add(g, ring, 0, 0, .042);
  const led = new THREE.Mesh(new THREE.TorusGeometry(.29, .006, 8, 96), M.glow(BRAND.volt)); add(g, led, 0, 0, .0);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.07, 32, 24), M.metal('#9aa0ab')); add(g, ball, 0, 0, -.1);
  const arm = new THREE.Mesh(new RoundedBoxGeometry(.08, .08, .22, 3, .03), M.matte(color)); add(g, arm, 0, 0, -.22);
  [-1, 1].forEach(s => add(g, new THREE.Mesh(new RoundedBoxGeometry(.03, .12, .22, 2, .01), M.rubber()), s * .03, 0, -.4));
  g.rotation.set(.2, -.85, 0);
  return g;
}

/* ---------- bluetooth speaker ---------- */
export function speaker({ color = '#5046FF' } = {}) {
  const g = new THREE.Group(); g.name = 'speaker';
  const fab = tex(64, 64, (c, w, h) => { c.fillStyle = '#777'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = '#ddd'; c.beginPath(); c.arc(i * 8 + 4, j * 8 + 4, 2.4, 0, 7); c.fill(); } });
  fab.wrapS = fab.wrapT = THREE.RepeatWrapping; fab.repeat.set(24, 10); fab.colorSpace = THREE.NoColorSpace;
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.28, .6, 16, 64), mat(color, { roughness: .85, clearcoat: 0, bumpMap: fab, bumpScale: 3 }));
  body.rotation.z = Math.PI / 2; add(g, body);
  [-1, 1].forEach(s => { const cap = new THREE.Mesh(new THREE.SphereGeometry(.283, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.6), M.rubber('#15171d')); cap.rotation.z = -s * Math.PI / 2; add(g, cap, s * .3, 0, 0); });
  const logo = new THREE.Mesh(new RoundedBoxGeometry(.26, .05, .02, 2, .01), M.rubber('#15171d')); add(g, logo, 0, .02, .282);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(.08, .015, 8, 32, Math.PI), M.rubber('#15171d')); add(g, strap, -.66, 0, 0).rotation.z = Math.PI / 2;
  g.rotation.set(.25, -.4, 0);
  return g;
}

/* ---------- lens protector ---------- */
export function lensGuard({ color = '#c9ccd3' } = {}) {
  const g = new THREE.Group(); g.name = 'lens';
  const p = phone({ color: '#2b2f3a', screen: false }); p.rotation.y = Math.PI; g.add(p);
  [[-.075, .075], [-.075, -.075], [.08, 0]].forEach(([x, y]) => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(.066, .012, 12, 48), M.metal(color)); add(g, r, -.155 - x, .5 + y, .1);
    const gl = cyl(.06, .006, M.clear()); gl.rotation.x = Math.PI / 2; add(g, gl, -.155 - x, .5 + y, .1);
  });
  return g;
}

/* ---------- ring grip / stand ---------- */
export function ringGrip({ color = '#D4FF3A' } = {}) {
  const g = new THREE.Group(); g.name = 'ring';
  const p = phone({ color: '#2b2f3a', screen: false }); p.rotation.y = Math.PI; g.add(p);
  const base = cyl(.17, .025, M.metal(color), 64); base.rotation.x = Math.PI / 2; add(g, base, 0, -.15, .05);
  const piv = new THREE.Group(); piv.position.set(0, -.15, .07); piv.rotation.x = -.75; g.add(piv);
  const r = new THREE.Mesh(new THREE.TorusGeometry(.2, .028, 16, 80), M.metal(color)); add(piv, r, 0, .2, 0);
  return g;
}

export const BUILDERS = { phone, phoneCase, charger, cable, earbuds, headphones, powerbank, watch, glass, pad, stand3, carMount, speaker, lensGuard, ringGrip };

/* shared studio: renderer-agnostic scene setup */
export async function studio(renderer, { RoomEnvironment }) {
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight('#8f86ff', 2.2); rim.position.set(-3, 1.5, -2); scene.add(rim);
  const fill = new THREE.DirectionalLight('#e9ffb0', .6); fill.position.set(3, -2, 1); scene.add(fill);
  return scene;
}
