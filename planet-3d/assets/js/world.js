// Planet world: a floating island with one district per Planet service.
// Everything is built from simple shapes in code, so there are no model files to load.
import * as THREE from 'three';

export const C = {
  white: 0xf7f9f8, off: 0xeaf0ee, pad: 0xf0f4f2, road: 0xd8e0de, line: 0xffffff,
  navy: 0x143659, navy2: 0x1f4b78, ink: 0x0b1a33, mint: 0x92c5b4, mintD: 0x6aa893,
  mintL: 0xc9e4da, sand: 0xece4d6, glass: 0xd3e7ee, rock: 0xd4dfdc, rock2: 0xb9c9c6,
  red: 0xff5a5f, gold: 0xf2c46d,
};

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshLambertMaterial({ color, ...opts }));
  return matCache.get(key);
}

function mesh(geo, color, opts) {
  const m = new THREE.Mesh(geo, typeof color === 'object' ? color : mat(color, opts));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
const box = (w, h, d, c, o) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return mesh(g, c, o); };
const cyl = (rt, rb, h, c, seg = 24, o) => { const g = new THREE.CylinderGeometry(rt, rb, h, seg); g.translate(0, h / 2, 0); return mesh(g, c, o); };
const sph = (r, c, o, seg = 24) => mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), c, o);
function at(o, x, y, z) { o.position.set(x, y, z); return o; }

// Rounded slab (rounded in plan view), a nicer stand-in for plain boxes.
function rbox(w, h, d, r, c) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 });
  g.rotateX(-Math.PI / 2);
  return mesh(g, c);
}

// Canvas texture helper for screens, billboards and floor lettering.
export function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function floorLabel(text, w, d) {
  const tex = canvasTex(1024, 256, (ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(20,54,89,0.16)';
    ctx.font = '800 150px Alexandria, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H / 2 + 8);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  return m;
}

function person(color = C.navy) {
  const g = new THREE.Group();
  g.add(at(cyl(0.22, 0.26, 0.9, color, 8), 0, 0, 0));
  g.add(at(sph(0.2, 0xf1d3bd, {}, 10), 0, 1.1, 0));
  return g;
}

function tree(scale = 1) {
  const g = new THREE.Group();
  g.add(cyl(0.18, 0.24, 1.2, 0x9aa9a5, 6));
  const top = mesh(new THREE.IcosahedronGeometry(1.1, 0), Math.random() > 0.35 ? C.mint : C.mintD, { flatShading: true });
  top.position.y = 1.9; top.scale.set(1, 1.25, 1);
  g.add(top);
  g.scale.setScalar(scale);
  return g;
}

function van(body = C.navy) {
  const g = new THREE.Group();
  g.add(at(box(2.6, 1.3, 1.2, body), -0.25, 0.35, 0));
  g.add(at(box(0.9, 1.0, 1.2, C.white), 1.45, 0.35, 0));
  g.add(at(box(0.05, 0.45, 1.0, C.ink), 1.91, 0.75, 0));
  g.add(at(box(2.62, 0.18, 1.22, C.mint), -0.25, 0.95, 0));
  for (const x of [-1, 1.2]) for (const z of [-0.6, 0.6]) {
    const w = mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), C.ink);
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z); g.add(w);
  }
  return g;
}

// The Planet "P" with its dot, extruded into a building.
function pLogo(depth = 3) {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(3, 0); s.lineTo(3, 5); s.lineTo(4.6, 5);
  s.absarc(4.6, 8.5, 3.5, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(0, 12); s.lineTo(0, 0);
  const h = new THREE.Path();
  h.moveTo(3, 7); h.lineTo(4.6, 7); h.absarc(4.6, 8.5, 1.5, -Math.PI / 2, Math.PI / 2, false); h.lineTo(3, 10); h.lineTo(3, 7);
  s.holes.push(h);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.2, bevelSegments: 3, curveSegments: 32 });
  g.translate(-4, 0, -depth / 2);
  return g;
}

export function polar(deg, r) { const a = THREE.MathUtils.degToRad(deg); return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r); }

export const TOP = 3; // island top height
export const SPOTS = {
  hq: new THREE.Vector3(0, TOP, 0),
  web: polar(200, 34).setY(TOP),
  ads: polar(255, 34).setY(TOP),
  content: polar(310, 34).setY(TOP),
  brand: polar(10, 34).setY(TOP),
  launch: polar(75, 34).setY(TOP),
  data: polar(135, 34).setY(TOP),
};

export function createWorld() {
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);
  const updaters = [];
  const onUpdate = (fn) => updaters.push(fn);

  // ---------- Spring physics: every building can be lifted, pushed and wobbled ----------
  // Each entry keeps its own offset so the regular animations still own the base pose.
  const springs = [];
  const spotKey = (v) => Object.keys(SPOTS).find((k) => SPOTS[k] === v);
  function addSpring(obj, key, kind = 'build') {
    const e = { obj, key, kind, y: 0, v: 0, rx: 0, rz: 0, vx: 0, vz: 0, ty: 0, tx: 0, tz: 0, oy: 0, ox: 0, oz: 0, k: kind === 'tree' ? 70 : 140, d: kind === 'tree' ? 5 : 8 };
    obj.userData.spring = e; springs.push(e); return e;
  }

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0xbfd6cf, 1.45);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(-40, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80; sc.near = 1; sc.far = 220;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(sun);

  // ---------- Island ----------
  const R = 64;
  const top = mesh(new THREE.CylinderGeometry(R, R, TOP, 96), C.white);
  top.position.y = TOP / 2; root.add(top);
  const rim = mesh(new THREE.CylinderGeometry(R + 0.4, R + 0.4, 0.8, 96), C.mint);
  rim.position.y = 0.1; root.add(rim);
  // underside: layered low-poly rock, like a slice cut out of a planet
  const under = mesh(new THREE.ConeGeometry(R, 34, 28, 4), C.rock, { flatShading: true });
  under.rotation.x = Math.PI; under.position.y = -17.3;
  const pos = under.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < 16.9 && y > -16.9) { const k = 1 + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.12; pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k); }
  }
  under.geometry.computeVertexNormals();
  root.add(under);
  const under2 = mesh(new THREE.ConeGeometry(R * 0.55, 20, 18, 2), C.rock2, { flatShading: true });
  under2.rotation.x = Math.PI; under2.position.set(6, -30, -4); root.add(under2);
  // floating rocks
  const rocks = [];
  for (let i = 0; i < 9; i++) {
    const r = mesh(new THREE.DodecahedronGeometry(1.2 + Math.random() * 2.2, 0), i % 3 ? C.rock : C.mint, { flatShading: true });
    const p = polar(i * 40 + 10, R + 8 + Math.random() * 12); r.position.set(p.x, -6 - Math.random() * 14, p.z);
    r.userData.base = r.position.y; r.userData.ph = Math.random() * 6;
    root.add(r); rocks.push(r);
  }
  onUpdate((t) => rocks.forEach((r) => { r.position.y = r.userData.base + Math.sin(t * 0.6 + r.userData.ph) * 1.2; r.rotation.y = t * 0.1 + r.userData.ph; }));

  // ---------- Roads ----------
  const ringIn = 48.5, ringOut = 52.5;
  const ring = mesh(new THREE.RingGeometry(ringIn, ringOut, 128), C.road);
  ring.rotation.x = -Math.PI / 2; ring.position.y = TOP + 0.02; ring.castShadow = false; root.add(ring);
  // dashed centre line
  const dashGeo = new THREE.PlaneGeometry(1.4, 0.18);
  const dashes = new THREE.InstancedMesh(dashGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), 90);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    e.set(-Math.PI / 2, 0, -a - Math.PI / 2); q.setFromEuler(e);
    m4.compose(new THREE.Vector3(Math.cos(a) * 50.5, TOP + 0.04, Math.sin(a) * 50.5), q, new THREE.Vector3(1, 1, 1));
    dashes.setMatrixAt(i, m4);
  }
  root.add(dashes);
  // spokes from HQ plaza to each district, and from districts out to the ring
  for (const key of Object.keys(SPOTS)) {
    if (key === 'hq') continue;
    const p = SPOTS[key];
    const ang = Math.atan2(p.z, p.x);
    const addRoad = (r0, r1) => {
      const len = r1 - r0;
      const rd = mesh(new THREE.PlaneGeometry(len, 3), C.road);
      rd.castShadow = false; rd.rotation.x = -Math.PI / 2; rd.rotation.z = -ang;
      const mid = (r0 + r1) / 2;
      rd.position.set(Math.cos(ang) * mid, TOP + 0.015, Math.sin(ang) * mid);
      root.add(rd);
    };
    addRoad(11, 22); addRoad(45, 49);
  }

  // ---------- Plazas + floor labels ----------
  const plaza = (p, r, label) => {
    const pad = mesh(new THREE.CylinderGeometry(r, r, 0.35, 64), C.pad);
    pad.position.set(p.x, TOP + 0.17, p.z); root.add(pad);
    const edge = mesh(new THREE.TorusGeometry(r, 0.12, 6, 96), C.mint);
    edge.rotation.x = Math.PI / 2; edge.position.set(p.x, TOP + 0.36, p.z); root.add(edge);
    if (label) {
      const l = floorLabel(label, r * 1.5, r * 0.38);
      const ang = Math.atan2(p.z, p.x);
      const off = polar(THREE.MathUtils.radToDeg(ang), r * 0.62);
      l.position.set(p.x + off.x, TOP + 0.38, p.z + off.z);
      l.rotation.z = Math.PI / 4; // face the isometric camera
      root.add(l);
    }
  };
  plaza(SPOTS.hq, 11, null);
  plaza(SPOTS.web, 12.5, 'WEB');
  plaza(SPOTS.ads, 12.5, 'ADS');
  plaza(SPOTS.content, 12.5, 'CONTENT');
  plaza(SPOTS.brand, 12.5, 'BRAND');
  plaza(SPOTS.launch, 12.5, 'LAUNCH');
  plaza(SPOTS.data, 12.5, 'DATA');

  const place = (obj, spot, x = 0, z = 0, y = 0.35) => { obj.position.set(spot.x + x, TOP + y, spot.z + z); root.add(obj); if (!obj.userData.spring) addSpring(obj, spotKey(spot)); return obj; };

  // ---------- HQ: the P building ----------
  {
    const g = new THREE.Group();
    const P = mesh(pLogo(3.2), C.navy);
    P.scale.setScalar(1.05);
    g.add(P);
    // windows strip on the stem
    for (let i = 0; i < 5; i++) g.add(at(box(2.2, 0.35, 0.1, C.mintL), -2.4, 1.2 + i * 2, 1.9));
    const dot = sph(1.9, C.mint, {}, 40);
    dot.position.set(5.8, 1.9, 0); g.add(dot);
    const glow = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.06, 8, 64), new THREE.MeshBasicMaterial({ color: C.mint, transparent: true, opacity: 0.8 }));
    glow.rotation.x = Math.PI / 2; glow.position.copy(dot.position); g.add(glow);
    g.rotation.y = Math.PI / 4; // face the camera
    place(g, SPOTS.hq, -1, 1);
    // people around the plaza
    const walkers = [];
    for (let i = 0; i < 7; i++) { const p = person(i % 2 ? C.navy : C.mintD); root.add(p); walkers.push({ p, r: 8 + (i % 3), ph: i * 0.9, s: 0.12 + (i % 3) * 0.03 }); }
    onUpdate((t) => {
      dot.position.y = 1.9 + Math.sin(t * 1.4) * 0.35;
      glow.position.y = dot.position.y; glow.scale.setScalar(1 + 0.08 * Math.sin(t * 2.5)); glow.rotation.z = t * 0.5;
      walkers.forEach((w) => { const a = t * w.s + w.ph; w.p.position.set(Math.cos(a) * w.r, TOP + 0.35, Math.sin(a) * w.r); });
    });
  }

  // ---------- WEB: giant laptop + crane stacking UI blocks ----------
  const screens = {};
  {
    const s = SPOTS.web;
    const lap = new THREE.Group();
    lap.add(rbox(11, 0.5, 7.5, 0.6, 0xc8d3d1));
    lap.add(at(box(9.5, 0.06, 4, 0x9fb0ad), 0, 0.5, -0.9));
    const lid = new THREE.Group();
    lid.add(at(rbox(11, 0.35, 7.2, 0.6, 0xc8d3d1), 0, 0, 0));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(10.2, 6.4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scr.rotation.x = -Math.PI / 2; scr.position.y = 0.37; lid.add(scr);
    screens.web = scr;
    lid.position.set(0, 0.5, -3.7); lid.rotation.x = -1.92; // open lid
    lid.children.forEach((c) => (c.position.z += 3.6));
    lap.add(lid);
    lap.rotation.y = Math.PI / 4 + 0.25;
    place(lap, s, -2, -2.5);

    // gantry crane, the Planet take on the Emons crane
    const crane = new THREE.Group();
    for (const x of [-5, 5]) for (const z of [-2.2, 2.2]) crane.add(at(box(0.45, 9, 0.45, C.mint), x, 0, z));
    crane.add(at(box(11, 0.6, 0.5, C.mint), 0, 9, -2.2));
    crane.add(at(box(11, 0.6, 0.5, C.mint), 0, 9, 2.2));
    const trolley = at(box(1.4, 0.6, 5, C.navy), 0, 9.3, 0); crane.add(trolley);
    const cable = at(box(0.08, 1, 0.08, C.ink), 0, 0, 0); crane.add(cable);
    const cargo = at(box(2.6, 0.8, 2.6, C.navy2), 0, 0, 0); crane.add(cargo);
    const stack = new THREE.Group(); stack.position.set(3, 0, 0); crane.add(stack);
    const blockColors = [C.navy, C.mint, 0xffffff, C.navy2, C.mintL];
    crane.rotation.y = Math.PI / 4;
    place(crane, s, 6, 4);
    let lastCycle = -1;
    onUpdate((t) => {
      const T = 3.2, cyc = Math.floor(t / T), f = (t % T) / T;
      if (cyc !== lastCycle) {
        lastCycle = cyc;
        if (stack.children.length >= 6) stack.clear();
        cargo.material = mat(blockColors[cyc % blockColors.length]);
      }
      const h = stack.children.length * 0.8;
      // move from pickup (-3.5) to stack (3), lower, release, go back
      let x, y;
      if (f < 0.35) { x = -3.5 + (6.5 * f) / 0.35; y = 6; }
      else if (f < 0.6) { x = 3; y = 6 - ((f - 0.35) / 0.25) * (6 - h - 0.4); }
      else { x = 3 - ((f - 0.6) / 0.4) * 6.5; y = h + 0.4 + ((f - 0.6) / 0.4) * (6 - h); }
      if (f >= 0.6 && stack.userData.dropped !== cyc) {
        stack.userData.dropped = cyc;
        const b = at(box(2.6, 0.8, 2.6, blockColors[cyc % blockColors.length]), 0, h, 0);
        stack.add(b);
      }
      trolley.position.x = x;
      cargo.visible = f < 0.6;
      cargo.position.set(x, y, 0);
      cable.position.set(x, f < 0.6 ? y + 0.8 : y, 0);
      cable.scale.y = Math.max(0.1, 9.3 - (f < 0.6 ? y + 0.8 : y));
    });
    // floating browser windows
    const wins = [];
    for (let i = 0; i < 3; i++) {
      const w = new THREE.Group();
      w.add(at(rbox(3.4, 0.2, 2.4, 0.25, 0xffffff), 0, 0, 0));
      w.add(at(box(3.4, 0.22, 0.45, C.navy), 0, 0, -0.98));
      w.add(at(box(1.6, 0.24, 0.3, C.mint), -0.6, 0, 0.1));
      w.add(at(box(2.6, 0.24, 0.2, C.off), 0, 0, 0.7));
      w.rotation.x = -1.1; w.rotation.y = Math.PI / 4;
      place(w, s, -8 + i * 2.5, 5 + i * 1.5, 8 + i * 1.6);
      w.userData.base = w.position.y; wins.push(w);
    }
    onUpdate((t) => wins.forEach((w, i) => { w.position.y = w.userData.base + Math.sin(t * 1.2 + i) * 0.5; }));
    for (let i = 0; i < 3; i++) place(person(i ? C.navy : C.mintD), s, -6 + i * 1.5, 6 - i);
  }

  // ---------- ADS: billboard tower, broadcast dish, rising likes ----------
  {
    const s = SPOTS.ads;
    const tower = new THREE.Group();
    tower.add(cyl(1.4, 1.8, 14, 0xffffff, 6));
    tower.add(at(cyl(2.2, 2.2, 0.6, C.navy, 6), 0, 14, 0));
    const dish = new THREE.Group();
    const bowl = mesh(new THREE.SphereGeometry(2.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3), C.mint, { side: THREE.DoubleSide });
    bowl.rotation.x = Math.PI; dish.add(bowl);
    dish.add(at(cyl(0.12, 0.12, 2.4, C.navy, 8), 0, -2.4, 0));
    dish.rotation.x = -0.9;
    const dishPivot = new THREE.Group(); dishPivot.position.y = 17; dishPivot.add(dish); tower.add(dishPivot);
    place(tower, s, -4, -3);
    const waves = [];
    for (let i = 0; i < 3; i++) {
      const w = new THREE.Mesh(new THREE.TorusGeometry(3, 0.12, 8, 48), new THREE.MeshBasicMaterial({ color: C.mint, transparent: true }));
      w.rotation.x = Math.PI / 2; w.position.set(s.x - 4, TOP + 17.5, s.z - 3); root.add(w); waves.push(w);
    }
    // billboard
    const bb = new THREE.Group();
    bb.add(at(box(0.4, 6, 0.4, C.navy), -3.5, 0, 0));
    bb.add(at(box(0.4, 6, 0.4, C.navy), 3.5, 0, 0));
    bb.add(at(box(10, 5.6, 0.5, C.navy), 0, 5.5, 0));
    const board = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    board.position.set(0, 8.3, 0.27); bb.add(board); screens.ads = board;
    bb.rotation.y = Math.PI / 4;
    place(bb, s, 4, 3);
    // megaphone
    const mega = new THREE.Group();
    const cone = mesh(new THREE.CylinderGeometry(0.5, 2, 3.4, 24, 1, true), C.mint, { side: THREE.DoubleSide });
    cone.rotation.z = -Math.PI / 2; mega.add(cone);
    mega.add(at(box(1.2, 1.4, 1.2, C.navy), -2.2, -0.7, 0));
    mega.rotation.y = Math.PI * 0.75; mega.rotation.z = 0.35;
    place(mega, s, 6, -5, 2.4);
    // like / heart particles
    const likeTex = canvasTex(128, 128, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(64, 64, 60, 0, 7); ctx.fill();
      ctx.fillStyle = '#ff5a5f'; ctx.beginPath();
      ctx.moveTo(64, 96); ctx.bezierCurveTo(10, 60, 30, 18, 64, 44); ctx.bezierCurveTo(98, 18, 118, 60, 64, 96); ctx.fill();
    });
    const thumbTex = canvasTex(128, 128, (ctx) => {
      ctx.fillStyle = '#143659'; ctx.beginPath(); ctx.arc(64, 64, 60, 0, 7); ctx.fill();
      ctx.fillStyle = '#92C5B4'; rr(ctx, 34, 58, 16, 38, 4); ctx.fill(); rr(ctx, 54, 54, 40, 42, 8); ctx.fill(); rr(ctx, 60, 26, 16, 34, 8); ctx.fill();
    });
    const parts = [];
    for (let i = 0; i < 10; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: i % 2 ? likeTex : thumbTex, transparent: true, depthWrite: false }));
      sp.scale.setScalar(1.6); root.add(sp);
      parts.push({ sp, ph: i / 10, x: (Math.random() - 0.5) * 12, z: (Math.random() - 0.5) * 12 });
    }
    onUpdate((t) => {
      dishPivot.rotation.y = t * 0.6;
      waves.forEach((w, i) => { const f = (t * 0.5 + i / 3) % 1; w.scale.setScalar(1 + f * 3); w.material.opacity = (1 - f) * 0.7; });
      parts.forEach((p) => { const f = (t * 0.18 + p.ph) % 1; p.sp.position.set(s.x + p.x, TOP + 2 + f * 16, s.z + p.z); p.sp.material.opacity = Math.sin(f * Math.PI); });
    });
    for (let i = 0; i < 4; i++) place(person(i % 2 ? C.navy : 0x7a8b88), s, 1 + i * 1.3, 8 - i * 0.4);
  }

  // ---------- CONTENT: film set ----------
  {
    const s = SPOTS.content;
    // cyclorama backdrop
    const cyc = mesh(new THREE.CylinderGeometry(7, 7, 7, 32, 1, true, Math.PI * 0.75, Math.PI * 1.0), 0xffffff, { side: THREE.DoubleSide });
    cyc.geometry.translate(0, 3.5, 0);
    place(cyc, s, -1, -1);
    const floor = mesh(new THREE.CircleGeometry(7, 32, Math.PI * 0.75, Math.PI), C.mintL);
    floor.rotation.x = -Math.PI / 2; place(floor, s, -1, -1, 0.37);
    // product on a turning pedestal (a coffee cup)
    const ped = new THREE.Group();
    ped.add(cyl(1.4, 1.4, 1.6, C.navy, 32));
    const cup = new THREE.Group();
    cup.add(at(cyl(0.9, 0.7, 1.8, 0xffffff, 32), 0, 0, 0));
    cup.add(at(cyl(0.95, 0.95, 0.5, C.mint, 32), 0, 0.7, 0));
    cup.add(at(cyl(0.98, 0.98, 0.2, C.navy, 32), 0, 1.8, 0));
    cup.position.y = 1.6; ped.add(cup);
    place(ped, s, -2.5, -2.5);
    // camera rig
    const cam = new THREE.Group();
    for (let i = 0; i < 3; i++) { const leg = box(0.15, 3.6, 0.15, C.ink); leg.position.set(Math.cos(i * 2.1) * 0.8, 0, Math.sin(i * 2.1) * 0.8); leg.rotation.set(Math.sin(i * 2.1) * 0.22, 0, -Math.cos(i * 2.1) * 0.22); cam.add(leg); }
    const head = new THREE.Group(); head.position.y = 3.4;
    head.add(at(box(2.2, 1.4, 1.2, C.ink), 0, 0, 0));
    const lens = mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.2, 20), C.navy); lens.rotation.z = Math.PI / 2; lens.position.set(-1.6, 0.7, 0); head.add(lens);
    const rec = at(sph(0.14, C.red, { emissive: C.red, emissiveIntensity: 0.6 }, 10), 0.8, 1.55, 0.3); head.add(rec);
    cam.add(head);
    place(cam, s, 5, 4);
    head.lookAt(new THREE.Vector3(-7.5, 3.4, -6.5)); head.rotateY(Math.PI / 2);
    // softbox lights with soft beams
    const lights = [];
    for (const [x, z] of [[4, -4.5], [-5, 4]]) {
      const l = new THREE.Group();
      l.add(cyl(0.1, 0.1, 6, C.ink, 8));
      l.add(at(box(2, 2, 0.6, 0xffffff), 0, 5.5, 0));
      const beam = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff6dd, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
      beam.rotation.x = Math.PI / 2; beam.position.set(0, 6.5, 3.2); l.add(beam);
      l.lookAt(new THREE.Vector3(s.x - 2.5, 0, s.z - 2.5).sub(new THREE.Vector3(s.x + x, 0, s.z + z)).add(new THREE.Vector3()));
      place(l, s, x, z);
      l.lookAt(s.x - 2.5, TOP + 0.35, s.z - 2.5);
      lights.push(beam);
    }
    // a phone showing a reel
    const phone = new THREE.Group();
    phone.add(rbox(2.4, 0.3, 4.6, 0.4, C.ink));
    const ps = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 4.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ps.rotation.x = -Math.PI / 2; ps.position.y = 0.31; phone.add(ps); screens.reel = ps;
    phone.rotation.set(-1.15, Math.PI / 4, 0, 'YXZ');
    place(phone, s, 7, -4, 4.5);
    phone.userData.base = phone.position.y;
    onUpdate((t) => {
      cup.rotation.y = t * 0.8;
      rec.visible = Math.sin(t * 5) > 0;
      lights.forEach((b, i) => (b.material.opacity = 0.14 + 0.06 * Math.sin(t * 2 + i)));
      phone.position.y = phone.userData.base + Math.sin(t * 1.3) * 0.4;
    });
    for (let i = 0; i < 3; i++) place(person(i === 1 ? C.mintD : C.navy), s, 3 + i * 1.4, 7 - i * 1.2);
  }

  // ---------- BRAND: pencil drawing a curve + colour swatches ----------
  {
    const s = SPOTS.brand;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0, 3), new THREE.Vector3(-3, 0, -3), new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(3, 0, -4), new THREE.Vector3(6, 0, 1),
    ]);
    const tube = new THREE.TubeGeometry(curve, 160, 0.28, 8, false);
    const stroke = mesh(tube, C.navy); stroke.castShadow = false;
    place(stroke, s, 0, -1, 0.5);
    const total = tube.index.count;
    const anchors = curve.points.map((p) => { const a = mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), 0xffffff); a.position.copy(p); stroke.add(a); const b = mesh(new THREE.BoxGeometry(0.5, 0.72, 0.5), C.mint); b.position.copy(p); stroke.add(b); return a; });
    const pencil = new THREE.Group();
    const body = cyl(0.55, 0.55, 7, C.mint, 6); body.position.y = 1.6; pencil.add(body);
    const tip = mesh(new THREE.ConeGeometry(0.55, 1.6, 6), C.sand); tip.rotation.x = Math.PI; tip.position.y = 0.8; pencil.add(tip);
    const lead = mesh(new THREE.ConeGeometry(0.2, 0.6, 6), C.ink); lead.rotation.x = Math.PI; lead.position.y = 0.3; pencil.add(lead);
    pencil.add(at(cyl(0.56, 0.56, 0.8, C.navy, 6), 0, 8.6, 0));
    pencil.rotation.z = 0.45; pencil.rotation.x = -0.2;
    const pencilWrap = new THREE.Group(); pencilWrap.add(pencil); root.add(pencilWrap);
    // swatches fan
    const fan = new THREE.Group();
    const cols = [C.navy, C.mint, 0xffffff, C.sand, C.navy2, C.mintL];
    cols.forEach((c, i) => {
      const card = new THREE.Group();
      card.add(at(box(1.8, 0.2, 5, c), 0, 0, -2.5));
      card.add(at(box(1.8, 0.22, 1.3, 0xffffff), 0, 0, -0.75));
      card.position.y = i * 0.22; card.userData.i = i; fan.add(card);
    });
    fan.position.set(s.x + 5, TOP + 0.4, s.z + 6); root.add(fan);
    // big "Aa"
    const aa = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ map: canvasTex(512, 340, (ctx, W, H) => { ctx.fillStyle = '#143659'; ctx.font = '700 230px Alexandria, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Aa', W / 2, H / 2 + 10); }), transparent: true, side: THREE.DoubleSide }));
    aa.rotation.y = Math.PI / 4; place(aa, s, -6, -6, 3.2);
    onUpdate((t) => {
      const f = (t * 0.16) % 1.25; const k = Math.min(1, f);
      tube.setDrawRange(0, Math.floor(total * k / 3) * 3);
      anchors.forEach((a, i) => { a.visible = k >= i / (anchors.length - 1) - 0.01; });
      const p = curve.getPointAt(Math.min(0.999, k));
      pencilWrap.position.set(s.x + p.x, TOP + 0.9 + (f > 1 ? (f - 1) * 8 : 0), s.z - 1 + p.z);
      fan.children.forEach((c) => { c.rotation.y = (c.userData.i - 2.5) * (0.22 + 0.12 * Math.sin(t * 1.2)); });
      aa.position.y = TOP + 3.2 + Math.sin(t * 1.1) * 0.3;
    });
    for (let i = 0; i < 2; i++) place(person(C.navy), s, -2 + i * 1.6, 8);
  }

  // ---------- LAUNCH: rocket pad ----------
  const rocketState = { launchAt: -100 };
  {
    const s = SPOTS.launch;
    const pad = new THREE.Group();
    pad.add(cyl(5, 5.5, 1, 0xdfe6e4, 8));
    pad.add(at(cyl(3, 3, 0.1, C.navy, 32), 0, 1, 0));
    const towerG = new THREE.Group();
    towerG.add(at(box(1.2, 16, 1.2, C.navy), 0, 0, 0));
    for (let i = 0; i < 4; i++) towerG.add(at(box(3, 0.3, 0.4, C.navy), -1.6, 4 + i * 3.5, 0));
    towerG.position.set(4.2, 1, 0); pad.add(towerG);
    const rocket = new THREE.Group();
    rocket.add(at(cyl(1.3, 1.3, 9, 0xffffff, 32), 0, 0, 0));
    rocket.add(at(cyl(1.32, 1.32, 1.2, C.mint, 32), 0, 5, 0));
    const nose = mesh(new THREE.ConeGeometry(1.3, 3.4, 32), C.navy); nose.position.y = 10.7; rocket.add(nose);
    const win = at(sph(0.5, C.navy, {}, 16), 0, 7.4, 1.15); rocket.add(win);
    for (let i = 0; i < 4; i++) { const fin = box(0.2, 3, 2, C.navy); fin.position.set(Math.cos(i * Math.PI / 2) * 1.3, 0, Math.sin(i * Math.PI / 2) * 1.3); fin.rotation.y = -i * Math.PI / 2 + Math.PI / 2; rocket.add(fin); }
    const flame = mesh(new THREE.ConeGeometry(0.9, 3.5, 16), C.gold, { emissive: 0xff9a3c, emissiveIntensity: 0.9 });
    flame.rotation.x = Math.PI; flame.position.y = -1.7; rocket.add(flame);
    rocket.position.y = 1.1; pad.add(rocket);
    place(pad, s, 0, 0);
    // smoke puffs
    const puffs = [];
    for (let i = 0; i < 14; i++) { const p = sph(1, 0xffffff, { transparent: true, opacity: 0.9, flatShading: true }, 8); p.castShadow = false; p.visible = false; root.add(p); puffs.push({ p, a: (i / 14) * Math.PI * 2 }); }
    onUpdate((t) => {
      const dt = t - rocketState.launchAt;
      const D = 6.5;
      if (dt >= 0 && dt < D) {
        const k = dt < 0.8 ? 0 : Math.pow(dt - 0.8, 2.2) * 3.2;
        rocket.position.y = 1.1 + k;
        rocket.position.x = Math.sin(dt * 40) * (dt < 0.8 ? 0.06 : 0);
        flame.visible = true; flame.scale.set(1, 1 + Math.sin(t * 40) * 0.2 + Math.min(1, dt), 1);
        puffs.forEach((pp, i) => {
          const f = Math.min(1, dt / 3.5);
          pp.p.visible = true;
          const r = 2 + f * (6 + (i % 3));
          pp.p.position.set(s.x + Math.cos(pp.a) * r, TOP + 1.5 + Math.sin(i) * 0.6 + f, s.z + Math.sin(pp.a) * r);
          pp.p.scale.setScalar(0.6 + f * 1.8);
          pp.p.material.opacity = 0.9 * (1 - Math.max(0, (dt - 3) / 3.5));
        });
      } else {
        // descend back gently after the launch, otherwise idle
        if (dt >= D && dt < D + 2.5) { rocket.position.y = 1.1 + (1 - (dt - D) / 2.5) * 0 ; }
        rocket.position.y = 1.1; rocket.position.x = 0;
        flame.visible = false; flame.scale.set(1, 0.3, 1);
        puffs.forEach((pp) => (pp.p.visible = false));
      }
      rocket.visible = !(dt >= 0 && rocket.position.y > 70);
    });
    for (let i = 0; i < 3; i++) place(person(i ? C.navy : C.mintD), s, -6 + i * 1.3, -5 + i);
  }

  // ---------- DATA: animated bar chart + server towers ----------
  {
    const s = SPOTS.data;
    const bars = [];
    for (let i = 0; i < 6; i++) {
      const b = box(1.8, 1, 1.8, i % 2 ? C.mint : C.navy);
      b.position.set(s.x - 5 + i * 2.2, TOP + 0.35, s.z - 3 - i * 0.6);
      root.add(b); bars.push(b); addSpring(b, 'data');
    }
    // line graph above bars
    const pts = [];
    for (let i = 0; i < 6; i++) pts.push(new THREE.Vector3(-5 + i * 2.2, 0, -3 - i * 0.6));
    const servers = [];
    for (let i = 0; i < 3; i++) {
      const rack = new THREE.Group();
      rack.add(rbox(2.6, 6.5, 2.6, 0.3, C.ink));
      for (let j = 0; j < 6; j++) {
        const led = at(box(1.6, 0.18, 0.06, C.mint, { emissive: C.mint, emissiveIntensity: 0.4 }), 0, 0.8 + j * 0.95, 1.31);
        rack.add(led); servers.push({ led, ph: Math.random() * 6 });
      }
      rack.rotation.y = Math.PI / 4;
      place(rack, s, 3 + i * 0, 4 + i * 0, 0.35);
      rack.position.x = s.x + 1 + i * 3.1; rack.position.z = s.z + 5 - i * 1.4;
    }
    const ledMats = servers.map((sv) => { sv.led.material = new THREE.MeshLambertMaterial({ color: C.mint, emissive: C.mint, emissiveIntensity: 0.3 }); return sv; });
    const dotMesh = [];
    for (let i = 0; i < 6; i++) { const d = sph(0.4, 0xffffff, {}, 12); root.add(d); dotMesh.push(d); }
    let lineObj = null;
    onUpdate((t) => {
      const hs = bars.map((b, i) => 2 + 3.2 * (0.55 + 0.45 * Math.sin(t * 0.9 + i * 0.8)) + i * 0.9);
      bars.forEach((b, i) => { b.scale.y = hs[i]; });
      dotMesh.forEach((d, i) => d.position.set(s.x + pts[i].x, TOP + 0.35 + hs[i] + 1.3, s.z + pts[i].z));
      if (lineObj) { root.remove(lineObj); lineObj.geometry.dispose(); }
      const c = new THREE.CatmullRomCurve3(dotMesh.map((d) => d.position.clone()));
      lineObj = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.12, 6, false), mat(C.navy));
      root.add(lineObj);
      ledMats.forEach((sv) => { sv.led.material.emissiveIntensity = Math.sin(t * 4 + sv.ph) > 0.2 ? 0.9 : 0.1; });
    });
    for (let i = 0; i < 2; i++) place(person(C.mintD), s, -6 + i * 1.4, 6);
  }

  // ---------- Trees ----------
  const avoid = Object.values(SPOTS).map((p) => ({ p, r: p.length() < 1 ? 12.5 : 14 }));
  let placed = 0, tries = 0;
  while (placed < 120 && tries < 4000) {
    tries++;
    const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 54;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (r > ringIn - 1.5 && r < ringOut + 1.5) continue;
    if (r > 61) continue;
    if (avoid.some((s) => Math.hypot(s.p.x - x, s.p.z - z) < s.r)) continue;
    // keep spokes clear
    const ang = Math.atan2(z, x);
    if (Object.values(SPOTS).some((p) => p.length() > 1 && Math.abs(Math.atan2(Math.sin(ang - Math.atan2(p.z, p.x)), Math.cos(ang - Math.atan2(p.z, p.x)))) * r < 2.4)) continue;
    const t = tree(0.7 + Math.random() * 0.6); t.position.set(x, TOP, z); t.rotation.y = Math.random() * 6; t.rotation.order = 'YXZ'; root.add(t); addSpring(t, 'tree', 'tree'); placed++;
  }

  // ---------- Vans on the ring road ----------
  const vans = [];
  for (let i = 0; i < 8; i++) {
    const v = van(i % 3 === 2 ? C.mintD : C.navy);
    root.add(v);
    vans.push({ v, lane: i % 2 ? 49.6 : 51.4, dir: i % 2 ? 1 : -1, ph: (i / 8) * Math.PI * 2, sp: 0.05 + (i % 3) * 0.008 });
  }
  onUpdate((t) => vans.forEach((o) => {
    const a = o.ph + t * o.sp * o.dir;
    o.v.position.set(Math.cos(a) * o.lane, TOP, Math.sin(a) * o.lane);
    o.v.rotation.y = -a + (o.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
  }));

  // ---------- Clouds ----------
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    for (let j = 0; j < 4; j++) { const p = sph(1.4 + Math.random() * 1.4, 0xffffff, { flatShading: true, transparent: true, opacity: 0.92 }, 7); p.castShadow = true; p.receiveShadow = false; p.scale.y = 0.55; p.position.set(j * 2 - 3, Math.random() * 0.5, Math.random() * 1.6); g.add(p); }
    g.userData = { r: 20 + Math.random() * 48, a: i * 1.3, y: 34 + Math.random() * 8, s: 0.008 + Math.random() * 0.008 };
    root.add(g); clouds.push(g);
  }
  onUpdate((t) => clouds.forEach((c) => { const a = c.userData.a + t * c.userData.s; c.position.set(Math.cos(a) * c.userData.r, c.userData.y, Math.sin(a) * c.userData.r); }));

  // ---------- Orbit ring + satellite (the "planet" layer) ----------
  const orbit = new THREE.Group();
  const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(80, 0.18, 8, 200), new THREE.MeshBasicMaterial({ color: C.mint, transparent: true, opacity: 0.55 }));
  orbitRing.rotation.x = Math.PI / 2; orbit.add(orbitRing);
  const sat = new THREE.Group();
  sat.add(at(box(2, 2, 2, 0xffffff), 0, -1, 0));
  sat.add(at(box(5, 0.1, 1.6, C.navy), -3.6, 0, 0));
  sat.add(at(box(5, 0.1, 1.6, C.navy), 3.6, 0, 0));
  sat.add(at(sph(0.5, C.mint, {}, 12), 0, 1.3, 0));
  orbit.add(sat);
  orbit.rotation.set(0.25, 0, 0.12);
  orbit.position.y = 2;
  scene.add(orbit);
  onUpdate((t) => { const a = t * 0.12; sat.position.set(Math.cos(a) * 80, 0, Math.sin(a) * 80); sat.rotation.y = -a; });

  // The brand "dot" as a moon behind the island
  const moon = sph(9, C.mint, {}, 48);
  moon.castShadow = false; moon.receiveShadow = false;
  moon.position.set(-70, 46, -80);
  scene.add(moon);
  onUpdate((t) => { moon.position.y = 46 + Math.sin(t * 0.3) * 2; });

  // ---------- Stars (visible in the dark intro) ----------
  const starGeo = new THREE.BufferGeometry();
  const N = 1400, arr = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(260 + Math.random() * 120);
    arr.set([v.x, v.y, v.z], i * 3);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 1, depthWrite: false }));
  scene.add(stars);

  // ---------- Screen textures (drawn after fonts load) ----------
  function paintScreens(lang) {
    const ar = lang === 'ar';
    const F = (w, s) => `${w} ${s}px Alexandria, "IBM Plex Sans Arabic", sans-serif`;
    screens.web.material.map?.dispose();
    screens.web.material.map = canvasTex(1024, 640, (ctx, W, H) => {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#eef3f1'; ctx.fillRect(0, 0, W, 54);
      ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(30 + i * 26, 27, 8, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#ffffff'; rr(ctx, 130, 12, 520, 30, 15); ctx.fill();
      ctx.fillStyle = '#7d8f8b'; ctx.font = F(400, 17); ctx.textAlign = 'left'; ctx.fillText('yourbrand.com', 150, 33);
      const g = ctx.createLinearGradient(0, 54, W, H); g.addColorStop(0, '#143659'); g.addColorStop(1, '#1f4b78');
      ctx.fillStyle = g; ctx.fillRect(0, 54, W, 360);
      ctx.fillStyle = '#92C5B4'; ctx.beginPath(); ctx.arc(ar ? 170 : W - 170, 230, 110, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = ar ? 'right' : 'left';
      const X = ar ? W - 60 : 60;
      ctx.font = F(800, 62); ctx.fillText(ar ? 'موقعك على' : 'Your site,', X, 175);
      ctx.fillText(ar ? 'كوكب تاني' : 'out of this world', X, 250);
      ctx.font = F(400, 24); ctx.fillStyle = '#c9e4da'; ctx.fillText(ar ? 'تصميم • لوحة تحكم • دفع أونلاين' : 'Design • Dashboard • Payments', X, 305);
      ctx.fillStyle = '#92C5B4'; rr(ctx, ar ? X - 220 : X, 335, 220, 54, 27); ctx.fill();
      ctx.fillStyle = '#143659'; ctx.font = F(700, 22); ctx.textAlign = 'center'; ctx.fillText(ar ? 'اطلب الآن' : 'Order now', ar ? X - 110 : X + 110, 370);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = '#f2f6f4'; rr(ctx, 40 + i * 325, 440, 295, 170, 18); ctx.fill(); ctx.fillStyle = i === 1 ? '#92C5B4' : '#143659'; rr(ctx, 60 + i * 325, 460, 90, 90, 14); ctx.fill(); ctx.fillStyle = '#d7e1de'; rr(ctx, 165 + i * 325, 470, 150, 16, 8); ctx.fill(); rr(ctx, 165 + i * 325, 500, 110, 16, 8); ctx.fill(); }
    });
    screens.web.material.needsUpdate = true;
    screens.ads.material.map?.dispose();
    screens.ads.material.map = canvasTex(1024, 545, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#92C5B4'); g.addColorStop(1, '#c9e4da');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#143659'; ctx.beginPath(); ctx.arc(ar ? 170 : W - 170, H / 2, 150, 0, 7); ctx.fill();
      ctx.fillStyle = '#92C5B4'; ctx.beginPath(); ctx.arc(ar ? 220 : W - 120, H / 2 + 70, 34, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = F(800, 120); ctx.textAlign = 'center'; ctx.fillText('P', ar ? 160 : W - 180, H / 2 + 42);
      ctx.fillStyle = '#143659'; ctx.textAlign = ar ? 'right' : 'left';
      const X = ar ? W - 60 : 60;
      ctx.font = F(800, 74); ctx.fillText(ar ? 'إعلانك هنا' : 'Your ad here', X, 210);
      ctx.font = F(500, 34); ctx.fillText(ar ? 'يوصل للعميل الصح' : 'reaching the right people', X, 280);
      ctx.fillStyle = '#143659'; rr(ctx, ar ? X - 300 : X, 340, 300, 76, 38); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = F(700, 30); ctx.textAlign = 'center'; ctx.fillText(ar ? 'راسلنا واتساب' : 'Message us', ar ? X - 150 : X + 150, 390);
    });
    screens.ads.material.needsUpdate = true;
    screens.reel.material.map?.dispose();
    screens.reel.material.map = canvasTex(400, 800, (ctx, W, H) => {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1f4b78'); g.addColorStop(1, '#0b1a33');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#92C5B4'; ctx.beginPath(); ctx.arc(W / 2, H * 0.42, 110, 0, 7); ctx.fill();
      ctx.fillStyle = '#143659'; ctx.beginPath(); ctx.moveTo(W / 2 - 30, H * 0.42 - 45); ctx.lineTo(W / 2 + 50, H * 0.42); ctx.lineTo(W / 2 - 30, H * 0.42 + 45); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = F(700, 40); ctx.textAlign = 'center'; ctx.fillText(ar ? 'ريلز بتوقف السكرول' : 'Reels that stop', W / 2, H * 0.68);
      if (!ar) ctx.fillText('the scroll', W / 2, H * 0.68 + 50);
      ['#ff5a5f', '#ffffff', '#ffffff'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(W - 45, H - 230 + i * 70, 20, 0, 7); ctx.fill(); });
    });
    screens.reel.material.needsUpdate = true;
  }

  // ---------- Shockwave rings (click on the planet) ----------
  const ripples = [];
  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 96), new THREE.MeshBasicMaterial({ color: C.mint, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    r.rotation.x = -Math.PI / 2; r.visible = false; r.renderOrder = 2; root.add(r);
    ripples.push({ r, t0: -99 });
  }
  let rippleI = 0;
  const kicks = []; // delayed impulses so the wave travels outwards
  const cursor = { p: new THREE.Vector3(), on: false };

  function stepSprings(t, dt) {
    // queued shockwave kicks
    for (let i = kicks.length - 1; i >= 0; i--) {
      const k = kicks[i]; if (t < k.at) continue;
      const e = k.e; e.v += k.up; e.vx += k.wx; e.vz += k.wz; kicks.splice(i, 1);
    }
    const h = Math.min(dt, 1 / 30) / 2;
    for (const e of springs) {
      // trees lean away from the cursor
      if (e.kind === 'tree') {
        e.tx = 0; e.tz = 0;
        if (cursor.on) {
          const dx = e.obj.position.x - cursor.p.x, dz = e.obj.position.z - cursor.p.z, d = Math.hypot(dx, dz);
          if (d < 9) { const f = (1 - d / 9) * 0.55; e.tz = -dx / (d + 0.01) * f; e.tx = dz / (d + 0.01) * f; e.ty = (1 - d / 9) * 0.6; } else e.ty = 0;
        } else e.ty = 0;
      }
      for (let s = 0; s < 2; s++) {
        e.v += (e.k * (e.ty - e.y) - e.d * e.v) * h; e.y += e.v * h;
        e.vx += (e.k * 0.8 * (e.tx - e.rx) - e.d * 0.8 * e.vx) * h; e.rx += e.vx * h;
        e.vz += (e.k * 0.8 * (e.tz - e.rz) - e.d * 0.8 * e.vz) * h; e.rz += e.vz * h;
      }
    }
    ripples.forEach((o) => {
      const a = t - o.t0; o.r.visible = a >= 0 && a < 1.6;
      if (o.r.visible) { const k = a / 1.6; o.r.scale.setScalar(1 + k * 40); o.r.material.opacity = (1 - k) * 0.85; }
    });
  }

  return {
    scene, root, stars, moon, orbit, sun, hemi, springs,
    pickables: springs.filter((e) => e.kind !== 'tree').map((e) => e.obj),
    setCursor(p) { if (p) { cursor.p.copy(p); cursor.on = true; } else cursor.on = false; },
    shockwave(p, t, power = 1) {
      const o = ripples[rippleI++ % ripples.length]; o.t0 = t; o.r.position.set(p.x, TOP + 0.45, p.z);
      for (const e of springs) {
        const dx = e.obj.position.x - p.x, dz = e.obj.position.z - p.z, d = Math.hypot(dx, dz);
        if (d > 34) continue;
        const f = (1 - d / 34) ** 1.5 * power;
        kicks.push({ e, at: t + d / 26, up: 16 * f * (e.kind === 'tree' ? 0.7 : 1), wx: dz / (d + 0.01) * 5 * f, wz: -dx / (d + 0.01) * 5 * f });
      }
    },
    paintScreens,
    launchRocket(t, force) { const dt = t - rocketState.launchAt; if (dt > 9 || (force && dt > 2.5)) rocketState.launchAt = t; },
    update(t, dt = 0.016) {
      // take last frame's spring offset off, let the animations run, then add the new offset
      for (const e of springs) { e.obj.position.y -= e.oy; e.obj.rotation.x -= e.ox; e.obj.rotation.z -= e.oz; }
      for (const fn of updaters) fn(t);
      stepSprings(t, dt);
      for (const e of springs) { e.oy = e.y; e.ox = e.rx; e.oz = e.rz; e.obj.position.y += e.oy; e.obj.rotation.x += e.ox; e.obj.rotation.z += e.oz; }
    },
  };
}
