/* Rose House — corner sofa that assembles itself as you scroll */
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const RH = window.RH || (window.RH = {});
const canvas = document.getElementById('sofa3d');

function fail() { document.documentElement.classList.add('no-webgl'); RH.ready3d = true; dispatchEvent(new Event('rh:ready')); }

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { fail(); }

if (renderer) init();

function init() {
  const mobile = matchMedia('(max-width: 640px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.6 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.65;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  // lights
  const key = new THREE.DirectionalLight(0xfff1e0, 2.0);
  key.position.set(-3.5, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
  key.shadow.radius = 6; key.shadow.bias = -0.0004;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8c8b4, 0.5));
  const rim = new THREE.DirectionalLight(0xffd9a0, 0.8); rim.position.set(4, 3, -4); scene.add(rim);

  // shadow catcher
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  // materials
  const fabric = new THREE.MeshPhysicalMaterial({ color: 0xd9c7ad, roughness: 0.92, sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color(0xf3e6d2), transparent: true });
  const fabricDark = new THREE.MeshPhysicalMaterial({ color: 0xc9b597, roughness: 0.95, sheen: 0.8, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff), transparent: true });
  const pillowRed = new THREE.MeshPhysicalMaterial({ color: 0xc8161f, roughness: 0.8, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xff9a9a), transparent: true });
  const pillowCream = new THREE.MeshPhysicalMaterial({ color: 0xf1ebe1, roughness: 0.9, sheen: 1, sheenRoughness: 0.5, transparent: true });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 1, roughness: 0.28, transparent: true });
  const wood = new THREE.MeshStandardMaterial({ color: 0x5a3c26, roughness: 0.55, transparent: true });
  const rugMat = new THREE.MeshStandardMaterial({ color: 0xe9e0d2, roughness: 1, transparent: true });
  const marble = new THREE.MeshPhysicalMaterial({ color: 0xf4f1ec, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.15, transparent: true });
  const solids = [fabric, fabricDark, pillowRed, pillowCream, brass, wood, rugMat, marble];

  const lineMat = new THREE.LineBasicMaterial({ color: 0xd7141e, transparent: true, opacity: 0.9 });
  const lineMat2 = new THREE.LineBasicMaterial({ color: 0x9a7a4a, transparent: true, opacity: 0.6 });

  const sofa = new THREE.Group(); scene.add(sofa);
  const parts = [];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // part: final position/rotation + exploded start + stagger order
  function part(geo, mat, pos, rot = [0, 0, 0], order = 0, opts = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = opts.shadow !== false; m.receiveShadow = true;
    const g = new THREE.Group(); g.add(m);
    // blueprint edges (box outline of the same size)
    if (!opts.noLine) {
      geo.computeBoundingBox();
      const s = new THREE.Vector3(); geo.boundingBox.getSize(s);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s.x, s.y, s.z)), opts.line2 ? lineMat2 : lineMat);
      g.add(e); g.userData.line = e;
    }
    const fin = { p: new THREE.Vector3(...pos), r: new THREE.Euler(...rot) };
    const dir = new THREE.Vector3(pos[0] * 1.2 + (rnd() - .5) * 2.4, 0, pos[2] * 1.6 + (rnd() - .5) * 2).normalize();
    const spread = opts.spread ?? (0.9 + rnd() * 0.9);
    const start = {
      p: new THREE.Vector3(pos[0] + dir.x * spread, pos[1] + (opts.lift ?? (0.35 + rnd() * 0.9)), pos[2] + dir.z * spread),
      r: new THREE.Euler(rot[0] + (rnd() - .5) * 1.6, rot[1] + (rnd() - .5) * 2.2, rot[2] + (rnd() - .5) * 1.4)
    };
    g.position.copy(start.p); g.rotation.copy(start.r);
    g.userData = { ...g.userData, fin, start, order, mesh: m, scaleIn: opts.scaleIn };
    sofa.add(g); parts.push(g);
    return g;
  }
  const RB = (w, h, d, r = 0.05, s = 4) => new RoundedBoxGeometry(w, h, d, s, r);

  // ---- corner sofa (L) ----  main run along X, chaise on +X towards the viewer
  const W = 2.7, D = 0.98, legH = 0.12;
  // rug
  part(new THREE.BoxGeometry(4.2, 0.012, 2.9), rugMat, [0.05, 0.01, 0.35], [0, 0, 0], 0, { noLine: true, lift: 0, spread: 0, scaleIn: true, shadow: false });
  // legs
  const legGeo = new THREE.CylinderGeometry(0.028, 0.02, legH, 16);
  [[-1.28, -0.4], [1.28, -0.4], [-1.28, 0.4], [0.2, 0.4], [1.28, 1.25], [0.55, 1.25]].forEach(([x, z], i) =>
    part(legGeo, brass, [x, legH / 2, z], [0, 0, 0], 1 + i * 0.02, { line2: true, lift: 1.2 }));
  // plinths
  part(RB(W, 0.2, D, 0.04), fabricDark, [0, legH + 0.1, 0], [0, 0, 0], 2);
  part(RB(0.92, 0.2, 0.92, 0.04), fabricDark, [W / 2 - 0.46, legH + 0.1, D / 2 + 0.44], [0, 0, 0], 2.1);
  // back frame + arm
  part(RB(W, 0.5, 0.2, 0.06), fabricDark, [0, legH + 0.2 + 0.25, -D / 2 + 0.1], [0, 0, 0], 3);
  part(RB(0.2, 0.42, D, 0.07), fabric, [-W / 2 + 0.1, legH + 0.2 + 0.21, 0], [0, 0, 0], 3.2);
  // seat cushions
  const seatY = legH + 0.2 + 0.085;
  [-0.75, 0.05].forEach((x, i) => part(RB(0.8, 0.17, 0.76, 0.07, 5), fabric, [x, seatY, 0.1], [0, 0, 0], 4 + i * 0.15));
  part(RB(0.86, 0.17, 1.66, 0.07, 5), fabric, [W / 2 - 0.46, seatY, 0.48], [0, 0, 0], 4.3);
  // back cushions
  [-0.75, 0.05, 0.88].forEach((x, i) => part(RB(0.8, 0.46, 0.2, 0.09, 5), fabric, [x, seatY + 0.3, -D / 2 + 0.3], [-0.16, 0, 0], 5 + i * 0.15));
  // throw pillows
  part(RB(0.42, 0.42, 0.13, 0.08, 4), pillowRed, [-0.95, seatY + 0.3, -0.12], [-0.25, 0.25, 0.08], 6);
  part(RB(0.4, 0.4, 0.12, 0.08, 4), pillowCream, [-0.58, seatY + 0.28, -0.1], [-0.22, -0.1, -0.06], 6.15);
  part(RB(0.38, 0.38, 0.12, 0.08, 4), pillowRed, [0.95, seatY + 0.28, -0.12], [-0.22, -0.3, 0.1], 6.3);
  // side table (marble top + brass leg)
  part(new THREE.CylinderGeometry(0.3, 0.3, 0.035, 48), marble, [-1.75, 0.55, -0.05], [0, 0, 0], 7, { line2: true });
  part(new THREE.CylinderGeometry(0.03, 0.03, 0.53, 16), brass, [-1.75, 0.265, -0.05], [0, 0, 0], 6.9, { line2: true });
  part(new THREE.CylinderGeometry(0.18, 0.2, 0.02, 32), brass, [-1.75, 0.01, -0.05], [0, 0, 0], 6.8, { line2: true });
  // coffee table
  part(RB(1.0, 0.05, 0.6, 0.02), marble, [-0.45, 0.36, 1.05], [0, 0.08, 0], 7.2, { line2: true });
  part(RB(0.8, 0.3, 0.4, 0.02), wood, [-0.45, 0.17, 1.05], [0, 0.08, 0], 7.1, { line2: true });

  sofa.position.set(0, 0, -0.2);

  // colour change
  const target = new THREE.Color(0xd9c7ad);
  const targetDark = new THREE.Color(0xc9b597);
  function setFabric(hex) {
    target.set(hex);
    targetDark.copy(target).offsetHSL(0, 0, -0.06);
    needs = true;
  }
  addEventListener('rh:color', e => setFabric(e.detail));
  // auto palette while passing the "colour" step
  const scrollPalette = ['#d9c7ad', '#4a4d52', '#22324d', '#5c6b4a', '#d9c7ad'];
  let lastAuto = -1, userPicked = false;
  addEventListener('rh:color', () => { userPicked = true; });

  // camera path
  const camA = { pos: new THREE.Vector3(5.2, 6.4, 6.2), look: new THREE.Vector3(0, 0.75, 0.2) };
  const camB = { pos: new THREE.Vector3(-4.2, 2.2, 5.4), look: new THREE.Vector3(0.1, 0.45, 0.25) };
  const tmpV = new THREE.Vector3(), tmpL = new THREE.Vector3();

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOutBack = t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  let p = 0, pSm = 0, needs = true, mx = 0, my = 0, mxs = 0, mys = 0;
  addEventListener('rh:hero', e => { p = e.detail; needs = true; });
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; needs = true; }, { passive: true });

  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the sofa framed: wider fov on portrait screens
    camera.fov = w / h < 0.8 ? 54 : w / h < 1.2 ? 40 : 30;
    camera.updateProjectionMatrix();
    // on wide screens the text sits on the right (RTL) -> push sofa left
    wide = w > 900; baseX = 0;
    if (wide) camera.setViewOffset(w, h, w * 0.24, 0, w, h); else camera.clearViewOffset();
    sofa.position.y = w / h < 0.8 ? 0.55 : 0;
    needs = true;
  }
  addEventListener('resize', layout);

  let baseX = 0, wide = true;
  const maxOrder = 7.3;
  function frame() {
    requestAnimationFrame(frame);
    pSm += (p - pSm) * 0.12;
    mxs += (mx - mxs) * 0.05; mys += (my - mys) * 0.05;
    const moving = Math.abs(p - pSm) > 0.0004 || Math.abs(mx - mxs) > 0.001 || Math.abs(my - mys) > 0.001;
    // colour lerp
    const cMoving = Math.abs(fabric.color.r - target.r) + Math.abs(fabric.color.g - target.g) + Math.abs(fabric.color.b - target.b) > 0.002;
    if (!needs && !moving && !cMoving && !idle) return;
    needs = false;

    // assembly 0..1 between p .10 and .70
    const a = clamp((pSm - 0.06) / 0.62);
    for (const g of parts) {
      const { fin, start, order, scaleIn } = g.userData;
      const t0 = (order / maxOrder) * 0.72;
      const lt = clamp((a - t0) / 0.28);
      const e = lt < 1 ? easeOutBack(lt) : 1;
      if (scaleIn) { g.position.copy(fin.p); g.rotation.copy(fin.r); g.scale.set(Math.max(0.001, ease(lt)), 1, Math.max(0.001, ease(clamp(lt * 1.4)))); }
      else {
        g.position.lerpVectors(start.p, fin.p, e);
        g.rotation.set(
          start.r.x + (fin.r.x - start.r.x) * e,
          start.r.y + (fin.r.y - start.r.y) * e,
          start.r.z + (fin.r.z - start.r.z) * e);
        // gentle floating while exploded
        if (lt < 1) g.position.y += Math.sin(performance.now() / 900 + order * 3) * 0.04 * (1 - lt);
      }
      if (g.userData.line) g.userData.line.material.opacity = 1;
    }
    // blueprint -> solid
    const solid = clamp((a - 0.05) / 0.4);
    solids.forEach(m => { m.opacity = 0.08 + solid * 0.92; m.transparent = solid < 0.999; m.depthWrite = solid > 0.5; });
    const introDim = 0.45 + 0.55 * clamp((pSm - 0.03) / 0.07);
    lineMat.opacity = 0.9 * introDim * (1 - clamp((a - 0.25) / 0.45));
    lineMat2.opacity = 0.6 * (1 - clamp((a - 0.25) / 0.45));
    floor.material.opacity = 0.16 * solid;

    // auto colour cycle in the colour step if user hasn't chosen
    if (!userPicked && pSm > 0.72) {
      const idx = Math.min(scrollPalette.length - 1, Math.floor(clamp((pSm - 0.72) / 0.24) * scrollPalette.length));
      if (idx !== lastAuto) { lastAuto = idx; setFabric(scrollPalette[idx]); }
    }
    fabric.color.lerp(target, 0.08);
    fabricDark.color.lerp(targetDark, 0.08);

    // camera: high blueprint view -> eye level, then slow orbit
    const c = ease(clamp((pSm - 0.02) / 0.7));
    tmpV.lerpVectors(camA.pos, camB.pos, c);
    tmpL.lerpVectors(camA.look, camB.look, c);
    const orbit = clamp((pSm - 0.7) / 0.3) * 0.75;
    const ang = Math.atan2(tmpV.z, tmpV.x) - orbit + mxs * 0.18;
    const rad = Math.hypot(tmpV.x, tmpV.z) * (1 - clamp((pSm - .75) / .25) * 0.1);
    camera.position.set(Math.cos(ang) * rad, tmpV.y - mys * 0.4, Math.sin(ang) * rad);
    camera.lookAt(tmpL);

    renderer.render(scene, camera);
    idle = a < 1; // keep floating animation alive until assembled
  }
  let idle = true;
  layout();
  frame();
  // shader warm-up done after first render
  requestAnimationFrame(() => { RH.ready3d = true; dispatchEvent(new Event('rh:ready')); });

  // pause when hero not visible
  const io = new IntersectionObserver(([en]) => { idle = en.isIntersecting && clamp((pSm - 0.06) / 0.62) < 1; needs = en.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
}
