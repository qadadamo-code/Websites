/* Ali Elbadry — royal medallion armchair that builds itself (sketch → frame → carving → upholstery) */
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const AB = window.AB || (window.AB = {});
const canvas = document.getElementById('chair3d');
const done = () => { AB.ready3d = true; dispatchEvent(new Event('ab:ready')); };
const fail = () => { document.documentElement.classList.add('no-webgl'); done(); };

let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { fail(); }
if (renderer) { try { init(); } catch (e) { console.error(e); fail(); } }

function init() {
  const small = () => matchMedia('(max-width: 820px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.5 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  const target = new THREE.Vector3(0, 0.52, 0);

  const key = new THREE.DirectionalLight(0xfff3e0, 2.1);
  key.position.set(-2.2, 4.2, 3.2);
  key.castShadow = true;
  const sm = small() ? 1024 : 2048;
  key.shadow.mapSize.set(sm, sm);
  Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5, near: 0.5, far: 12 });
  key.shadow.radius = 5; key.shadow.bias = -0.0005;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6d9c2, 0.55));
  const rim = new THREE.DirectionalLight(0xffdca0, 1.1); rim.position.set(2.5, 2.2, -2.5); scene.add(rim);
  const sweep = new THREE.PointLight(0xffe2a0, 0, 3, 1.6); scene.add(sweep);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.17 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // pedestal rings on the floor
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xb8893a, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.706, 160), ringMat);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(0.78, 0.783, 160), ringMat);
  [ring1, ring2].forEach(r => { r.rotation.x = -Math.PI / 2; r.position.y = 0.002; scene.add(r); });

  // ---------- materials ----------
  const base = {
    fabric: new THREE.MeshPhysicalMaterial({ color: 0xe6dac4, roughness: 0.9, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xfff4e0) }),
    button: new THREE.MeshStandardMaterial({ color: 0xc9a052, metalness: 1, roughness: 0.3 }),
    wood: new THREE.MeshPhysicalMaterial({ color: 0xc9a052, metalness: 1, roughness: 0.27 }),
    trim: new THREE.MeshPhysicalMaterial({ color: 0xd4ab5c, metalness: 1, roughness: 0.22 })
  };
  const FINISH = {
    gold:   { wood: { color: 0xc9a052, metalness: 1, roughness: 0.27, clearcoat: 0 }, trim: { color: 0xd4ab5c, metalness: 1, roughness: 0.22, clearcoat: 0 } },
    black:  { wood: { color: 0x0d0c0b, metalness: 0, roughness: 0.32, clearcoat: 1 }, trim: { color: 0xd4ab5c, metalness: 1, roughness: 0.22, clearcoat: 0 } },
    walnut: { wood: { color: 0x4a2c18, metalness: 0, roughness: 0.48, clearcoat: 0.6 }, trim: { color: 0x5c3820, metalness: 0, roughness: 0.42, clearcoat: 0.6 } },
    ivory:  { wood: { color: 0xeee6d6, metalness: 0, roughness: 0.5, clearcoat: 0.3 }, trim: { color: 0xd4ab5c, metalness: 1, roughness: 0.22, clearcoat: 0 } }
  };

  const lineColor = 0xb8893a;
  const chair = new THREE.Group(); scene.add(chair);
  const ghost = new THREE.Group(); scene.add(ghost);
  const parts = [];

  function part(name, win, off) {
    const g = new THREE.Group(); chair.add(g);
    const lg = new THREE.Group(); ghost.add(lg);
    const p = { name, win, off: new THREE.Vector3(...off), g, lg, mats: [], lineMats: [] };
    parts.push(p); return p;
  }
  function mat(p, role) {
    const m = base[role].clone(); m.transparent = true; m.opacity = 0;
    p.mats.push({ m, role }); return m;
  }
  function lineMat(p) {
    const m = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0 });
    p.lineMats.push(m); return m;
  }
  function add(p, geo, role, pos, rot, scl, opts = {}) {
    const mesh = new THREE.Mesh(geo, opts.m || mat(p, role));
    if (pos) mesh.position.set(...pos);
    if (rot) mesh.rotation.set(...rot);
    if (scl) mesh.scale.set(...scl);
    mesh.castShadow = true;
    p.g.add(mesh);
    if (!opts.noLine) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, opts.edge || 22), lineMat(p));
      e.position.copy(mesh.position); e.rotation.copy(mesh.rotation); e.scale.copy(mesh.scale);
      p.lg.add(e);
    }
    return mesh;
  }
  function addCurve(p, curve, r, role, closed) {
    const geo = new THREE.TubeGeometry(curve, 180, r, 12, closed);
    const mesh = new THREE.Mesh(geo, mat(p, role)); mesh.castShadow = true; p.g.add(mesh);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(160)), lineMat(p));
    p.lg.add(line);
    return mesh;
  }
  const lathe = (pts, seg = 14) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);

  // seat outline (shape y = backwards)
  function seatShape(k = 1) {
    const s = new THREE.Shape();
    s.moveTo(-0.26 * k, 0.24 * k);
    s.lineTo(0.26 * k, 0.24 * k);
    s.quadraticCurveTo(0.315 * k, 0.04 * k, 0.31 * k, -0.24 * k);
    s.quadraticCurveTo(0, -0.34 * k, -0.31 * k, -0.24 * k);
    s.quadraticCurveTo(-0.315 * k, 0.04 * k, -0.26 * k, 0.24 * k);
    return s;
  }

  // ---------- 1. legs ----------
  const legs = part('legs', [0.1, 0.26], [0, -0.7, 0]);
  const legGeo = lathe([[0, 0], [0.017, 0], [0.024, 0.012], [0.02, 0.03], [0.016, 0.06], [0.021, 0.2], [0.026, 0.27], [0.034, 0.285], [0.028, 0.3], [0.032, 0.315], [0.036, 0.33], [0.036, 0.4], [0, 0.4]]);
  [[0.265, 0.205], [-0.265, 0.205], [0.235, -0.2], [-0.235, -0.2]].forEach(([x, z]) => add(legs, legGeo, 'wood', [x, 0, z], null, null, { edge: 28 }));

  // ---------- 2. seat rail + apron carving ----------
  const rail = part('rail', [0.17, 0.33], [0, 0.55, 0]);
  const railGeo = new THREE.ExtrudeGeometry(seatShape(1), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 28 });
  railGeo.rotateX(-Math.PI / 2);
  add(rail, railGeo, 'wood', [0, 0.36, 0]);
  const shell = new THREE.SphereGeometry(0.05, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  add(rail, shell, 'trim', [0, 0.355, 0.295], [Math.PI / 2 + 0.3, 0, 0], [1, 0.55, 0.9]);
  const scrollGeo = new THREE.TorusGeometry(0.024, 0.006, 8, 28, Math.PI * 1.6);
  add(rail, scrollGeo, 'trim', [0.075, 0.385, 0.285], [0, 0, 0.6]);
  add(rail, scrollGeo, 'trim', [-0.075, 0.385, 0.285], [0, Math.PI, 0.6]);

  // ---------- 3. back posts ----------
  const posts = part('posts', [0.28, 0.4], [0, 0.45, -0.1]);
  const postGeo = lathe([[0.024, 0], [0.02, 0.04], [0.026, 0.07], [0.018, 0.12], [0.022, 0.26], [0.026, 0.32], [0, 0.32]], 12);
  [0.2, -0.2].forEach(x => add(posts, postGeo, 'wood', [x, 0.42, -0.215]));

  // ---------- 4. medallion back frame + crest ----------
  const RX = 0.25, RY = 0.31;
  const back = part('back', [0.33, 0.5], [0, 0.7, -0.35]);
  back.g.position.set(0, 0, 0);
  const backPivot = new THREE.Group(); backPivot.position.set(0, 0.93, -0.235); backPivot.rotation.x = -0.14;
  const backPivotL = backPivot.clone();
  back.g.add(backPivot); back.lg.add(backPivotL);
  const ellipse = (rx, ry) => new THREE.CatmullRomCurve3(new THREE.EllipseCurve(0, 0, rx, ry, 0, Math.PI * 2).getPoints(96).slice(0, -1).map(v => new THREE.Vector3(v.x, v.y, 0)), true);
  function addToPivot(p, pivot, pivotL, mesh, line) { pivot.add(mesh); if (line) pivotL.add(line); }
  {
    const c1 = ellipse(RX, RY), c2 = ellipse(RX - 0.03, RY - 0.03);
    const t1 = new THREE.Mesh(new THREE.TubeGeometry(c1, 200, 0.021, 14, true), mat(back, 'trim'));
    const t2 = new THREE.Mesh(new THREE.TubeGeometry(c2, 200, 0.007, 8, true), mat(back, 'trim'));
    t1.castShadow = t2.castShadow = true;
    const l1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c1.getPoints(160)), lineMat(back));
    const l2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c2.getPoints(160)), lineMat(back));
    addToPivot(back, backPivot, backPivotL, t1, l1); addToPivot(back, backPivot, backPivotL, t2, l2);
    // crest: finial + scrolls + leaves
    const fin = new THREE.Mesh(lathe([[0, 0], [0.03, 0.005], [0.02, 0.03], [0.028, 0.05], [0.01, 0.08], [0.016, 0.095], [0, 0.12]], 16), mat(back, 'trim'));
    fin.position.set(0, RY - 0.005, 0.005); fin.castShadow = true;
    const fl = new THREE.LineSegments(new THREE.EdgesGeometry(fin.geometry, 25), lineMat(back)); fl.position.copy(fin.position);
    addToPivot(back, backPivot, backPivotL, fin, fl);
    [1, -1].forEach(sx => {
      const sc = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 8, 30, Math.PI * 1.55), mat(back, 'trim'));
      sc.position.set(sx * 0.07, RY - 0.02, 0.01); sc.rotation.set(0, sx > 0 ? 0 : Math.PI, 0.9); sc.castShadow = true;
      addToPivot(back, backPivot, backPivotL, sc);
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 8), mat(back, 'trim'));
      leaf.position.set(sx * 0.13, RY - 0.06, 0.012); leaf.scale.set(1.5, 0.45, 0.5); leaf.rotation.z = sx * -0.5; leaf.castShadow = true;
      addToPivot(back, backPivot, backPivotL, leaf);
    });
    const drop = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 10), mat(back, 'trim'));
    drop.position.set(0, -RY + 0.01, 0.012); drop.scale.set(1.4, 0.7, 0.5); drop.castShadow = true;
    addToPivot(back, backPivot, backPivotL, drop);
  }

  // ---------- 5. arms ----------
  const arms = part('arms', [0.4, 0.55], [0, 0.25, 0.25]);
  [1, -1].forEach(sx => {
    const c = new THREE.CatmullRomCurve3([
      [0.27, 0.42, 0.2], [0.285, 0.56, 0.215], [0.3, 0.655, 0.15], [0.3, 0.675, 0.02], [0.285, 0.69, -0.12], [0.21, 0.73, -0.215]
    ].map(([x, y, z]) => new THREE.Vector3(sx * x, y, z)));
    addCurve(arms, c, 0.017, 'trim');
    add(arms, new THREE.TorusGeometry(0.026, 0.008, 8, 28, Math.PI * 1.6), 'trim', [sx * 0.29, 0.6, 0.222], [0, Math.PI / 2, 0.4]);
  });

  // ---------- 6. seat cushion ----------
  const seat = part('seat', [0.55, 0.69], [0, 0.85, 0.1]);
  const cushGeo = new THREE.ExtrudeGeometry(seatShape(0.94), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 6, curveSegments: 32 });
  cushGeo.rotateX(-Math.PI / 2);
  add(seat, cushGeo, 'fabric', [0, 0.46, 0.004], null, null, { edge: 35 });

  // ---------- 7. back upholstery + tufting ----------
  const panel = part('panel', [0.6, 0.75], [0, 0.05, 0.8]);
  const panelPivot = backPivot.clone(); panelPivot.clear();
  const panelPivotL = panelPivot.clone();
  panel.g.add(panelPivot); panel.lg.add(panelPivotL);
  {
    const s = new THREE.Shape(); s.absellipse(0, 0, RX - 0.025, RY - 0.025, 0, Math.PI * 2, false, 0);
    const pg = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.018, bevelSegments: 6, curveSegments: 64 });
    pg.translate(0, 0, -0.03);
    const pm = new THREE.Mesh(pg, mat(panel, 'fabric')); pm.castShadow = true;
    const pl = new THREE.LineSegments(new THREE.EdgesGeometry(pg, 35), lineMat(panel));
    addToPivot(panel, panelPivot, panelPivotL, pm, pl);
    const bGeo = new THREE.SphereGeometry(0.0095, 12, 8);
    const bm = mat(panel, 'button');
    for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
      const x = (i + (j % 2 ? 0.5 : 0)) * 0.075, y = j * 0.075;
      if ((x / (RX - 0.06)) ** 2 + (y / (RY - 0.06)) ** 2 > 1) continue;
      const b = new THREE.Mesh(bGeo, bm); b.position.set(x, y, 0.016); panelPivot.add(b);
    }
  }

  // ---------- 8. arm pads ----------
  const pads = part('pads', [0.66, 0.79], [0, 0.4, 0]);
  [1, -1].forEach(sx => add(pads, new RoundedBoxGeometry(0.062, 0.032, 0.21, 4, 0.014), 'fabric', [sx * 0.3, 0.695, 0.02], [0.08, 0, 0]));

  // ---------- state ----------
  let fabricHex = 0xe6dac4, finish = 'gold';
  function applyLook() {
    const f = FINISH[finish];
    parts.forEach(p => p.mats.forEach(({ m, role }) => {
      if (role === 'fabric') m.color.setHex(fabricHex);
      else if (role === 'wood' || role === 'trim') { const o = f[role]; m.color.setHex(o.color); m.metalness = o.metalness; m.roughness = o.roughness; m.clearcoat = o.clearcoat; }
      else if (role === 'button') { m.color.setHex(f.trim.metalness ? f.trim.color : 0x2a1a10); m.metalness = f.trim.metalness; }
    }));
  }
  AB.chairSet = (kind, val) => {
    if (kind === 'fabric') fabricHex = parseInt(String(val).replace('#', ''), 16);
    if (kind === 'frame') finish = val;
    applyLook(); flash = 1;
  };
  let flash = 0;

  // ---------- interaction ----------
  let userRot = 0, vel = 0, dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; vel = 0; });
  addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * 0.006; userRot += vel; });
  addEventListener('pointerup', () => { dragging = false; });
  addEventListener('pointercancel', () => { dragging = false; });

  // ---------- size ----------
  let W = 0, H = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    W = w; H = h;
    renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.5 : 1.8));
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    needs = true;
  }
  new ResizeObserver(resize).observe(canvas);

  let visible = true, needs = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(canvas);

  const ease = t => 1 - Math.pow(1 - t, 3);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let cur = 0, time = 0, last = performance.now();

  function update(p) {
    const sketch = ease(clamp((time - 0.4) / 2.2));
    for (const pt of parts) {
      const [s, e] = pt.win;
      const t = clamp((p - s) / (e - s));
      const k = ease(t);
      pt.g.position.copy(pt.off).multiplyScalar(1 - k);
      pt.g.visible = t > 0.001;
      for (const { m } of pt.mats) { m.opacity = t; m.transparent = t < 0.999; m.depthWrite = t > 0.5; }
      const lo = 0.75 * sketch * (1 - clamp(t * 1.4));
      for (const lm of pt.lineMats) lm.opacity = lo;
      pt.lg.visible = lo > 0.01;
    }
    const fin = clamp((p - 0.8) / 0.2);
    ringMat.opacity = 0.55 * fin;
    ring1.scale.setScalar(0.8 + 0.2 * ease(fin)); ring2.scale.setScalar(0.7 + 0.3 * ease(fin));
    // gold sweep on the finished chair
    sweep.intensity = (fin > 0 && fin < 1 ? Math.sin(fin * Math.PI) * 2.2 : 0) + flash * 1.4;
    sweep.position.set(Math.cos(fin * Math.PI) * 0.9, 0.9, 0.7);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible) return;
    time += dt;
    resize();
    const tgt = clamp(AB.heroTarget || 0);
    const before = cur;
    cur += (tgt - cur) * Math.min(1, dt * 6);
    if (Math.abs(tgt - cur) < 0.0005) cur = tgt;
    if (!dragging) { vel *= 0.94; userRot += vel; }
    flash *= 0.92;

    update(cur);
    const mob = W < 560;
    const aspectFix = camera.aspect < 1 ? Math.pow(1 / camera.aspect, 0.55) : 1;
    const idle = cur > 0.95 ? Math.sin(time * 0.35) * 0.22 : 0;
    const th = 0.75 - 1.15 * cur + userRot + idle;
    const r = (3.95 - 0.4 * ease(cur)) * aspectFix * (mob ? 0.86 : 1);
    const y = 1.55 - 0.5 * cur;
    camera.position.set(Math.sin(th) * r, y, Math.cos(th) * r);
    target.y = 0.6;
    camera.lookAt(target);
    renderer.render(scene, camera);
    needs = false;
    void before;
  }

  applyLook();
  update(0);
  requestAnimationFrame(t => { last = t; frame(t); });
  done();
}
