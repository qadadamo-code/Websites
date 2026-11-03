// Planet 3D scenes. One renderer, five "chapters" placed far apart in the same scene.
// The camera cuts between them behind a glitch transition, like igloo.inc.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V3 = THREE.Vector3;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ---------- noise ----------
function hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}
function fbm(x, y, oct = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
function ridge(x, y, oct = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * (1 - Math.abs(vnoise(x * f, y * f))); f *= 2.1; a *= 0.5; } return s; }

function noiseTexture(size = 256, scale = 8, contrast = 1) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    // blend four shifted copies so the texture tiles without seams
    const u = x / size, v = y / size, S = scale;
    const n = (fbm(u * S, v * S, 5) * (1 - u) * (1 - v) + fbm((u - 1) * S, v * S, 5) * u * (1 - v) + fbm(u * S, (v - 1) * S, 5) * (1 - u) * v + fbm((u - 1) * S, (v - 1) * S, 5) * u * v) * contrast * 1.4;
    const val = Math.floor(clamp(0.5 + n * 0.5) * 255);
    const i = (y * size + x) * 4; data[i] = data[i + 1] = data[i + 2] = val; data[i + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true;
  return t;
}

// ---------- the Planet "P" ----------
// Inside test for the P letter (12 units tall), used to lay bricks and sample particles.
const P_C = { x: 4.6, y: 8.4, R: 3.6, r: 1.55 };
export function insideP(x, y) {
  if (y < 0 || y > 12) return false;
  if (x >= 0 && x <= 3.2) return true;
  if (x < 3.2) return false;
  const inOuter = (x <= P_C.x && y >= P_C.y - P_C.R && y <= P_C.y + P_C.R) || Math.hypot(x - P_C.x, y - P_C.y) <= P_C.R && x >= P_C.x;
  const inHole = (x <= P_C.x && y >= P_C.y - P_C.r && y <= P_C.y + P_C.r) || (Math.hypot(x - P_C.x, y - P_C.y) <= P_C.r && x >= P_C.x);
  return inOuter && !inHole;
}
function pShape(inset = 0) {
  const s = new THREE.Shape();
  const R = P_C.R - inset, r = P_C.r + inset;
  s.moveTo(inset, inset); s.lineTo(3.2 - inset, inset); s.lineTo(3.2 - inset, P_C.y - R); s.lineTo(P_C.x, P_C.y - R);
  s.absarc(P_C.x, P_C.y, R, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(inset, 12 - inset); s.lineTo(inset, inset);
  const h = new THREE.Path();
  h.moveTo(3.2 + inset, P_C.y - r); h.lineTo(P_C.x, P_C.y - r); h.absarc(P_C.x, P_C.y, r, -Math.PI / 2, Math.PI / 2, false); h.lineTo(3.2 + inset, P_C.y + r); h.lineTo(3.2 + inset, P_C.y - r);
  s.holes.push(h);
  return s;
}

const GLOW = new THREE.Color(0.75, 1.0, 0.9); // mint-white light from inside the ice

export function createScene(canvas, { mobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.3 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = mobile ? 0.5 : 0.75;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  scene.background = new THREE.Color(0xa9b4bf);
  scene.fog = new THREE.FogExp2(0xa9b4bf, 0.016);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 600);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color(0xd5dce3) }, uBottom: { value: new THREE.Color(0xa9b4bf) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform vec3 uTop, uBottom; varying vec3 vP; void main(){ float k = smoothstep(-.05, .55, vP.y); gl_FragColor = vec4(mix(uBottom, uTop, k), 1.); }',
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), skyMat);
  sky.frustumCulled = false; sky.renderOrder = -1;
  scene.add(sky);

  // ---------- post ----------
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.32, 0.5, 0.92);
  composer.addPass(bloom);
  const finalPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGlitch: { value: 0 }, uCA: { value: 0.0018 }, uRes: { value: new THREE.Vector2(1, 1) }, uGrain: { value: 0.045 }, uWash: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime, uGlitch, uCA, uGrain, uWash; uniform vec2 uRes; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        vec2 uv = vUv; float g = uGlitch;
        float t = floor(uTime * 24.);
        float rows = mix(10., 46., h(vec2(t, 1.)));
        float by = floor(uv.y * rows);
        float r = h(vec2(by, t));
        if (r < g * 0.75) uv.x += (h(vec2(by * 1.3, t + 3.)) - .5) * .32 * g;
        float bx = floor(uv.x * 14.);
        if (h(vec2(bx, by + t)) < g * .18) uv.y += (h(vec2(bx, t)) - .5) * .08 * g;
        vec2 d = uv - .5;
        float ca = uCA * (.4 + dot(d, d) * 2.4) + g * .035;
        vec3 c;
        c.r = texture2D(tDiffuse, uv + d * ca * 1.2 + vec2(g * .012, 0.)).r;
        c.g = texture2D(tDiffuse, uv).g;
        c.b = texture2D(tDiffuse, uv - d * ca * 1.2 - vec2(g * .012, 0.)).b;
        float l = dot(c, vec3(.299,.587,.114));
        c = mix(c, vec3(l) * 1.05 + .08, g * .45 + uWash);
        c += (h(vUv * uRes + fract(uTime) * 91.) - .5) * uGrain;
        c *= mix(1., smoothstep(1.05, .25, length(d * vec2(1.15, 1.))), .55);
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  composer.addPass(finalPass);
  composer.addPass(new OutputPass());

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xeaf2f6, 0x5b6b78, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.position.set(-30, 40, 25);
  sun.castShadow = !mobile;
  sun.shadow.mapSize.set(mobile ? 1024 : 4096, mobile ? 1024 : 4096);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 200 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
  scene.add(sun); scene.add(sun.target);

  const stoneTex = noiseTexture(256, 10, 1.4); stoneTex.repeat.set(1, 1);
  const snowTex = noiseTexture(512, 24, 0.35); snowTex.repeat.set(6, 6); snowTex.colorSpace = THREE.SRGBColorSpace;
  const snowBump = noiseTexture(512, 60, 1.0); snowBump.repeat.set(14, 14);

  const chapters = [];
  const updaters = [];
  const hoverables = [];

  // =====================================================================
  // CHAPTER 0: the P monument on a frozen landscape
  // =====================================================================
  const hero = new THREE.Group(); scene.add(hero); chapters.push(hero);
  const heroState = { bricks: [], lifted: [] };
  {
    // terrain
    const SIZE = 320, SEG = mobile ? 160 : 260;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const height = (x, z) => {
      const d = Math.hypot(x, z * 1.2);
      const near = fbm(x * 0.045, z * 0.045, 5) * 2.4 * smooth(9, 26, d);
      const mound = 1.4 * Math.exp(-(x * x + z * z) / 110);
      const far = (ridge(x * 0.014 + 3, z * 0.014, 6) - 0.4) * 52 * smooth(32, 110, d) * smooth(-6, -50, z);
      const sides = (ridge(x * 0.02, z * 0.02 + 7, 4) - 0.4) * 14 * smooth(28, 70, Math.abs(x)) * smooth(30, -10, z);
      const detail = fbm(x * 0.4, z * 0.4, 3) * 0.18;
      return near + mound + Math.max(0, far) + Math.max(0, sides) + detail;
    };
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
    geo.computeVertexNormals();
    const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xe9eef2, roughness: 0.92, map: snowTex, bumpMap: snowBump, bumpScale: 0.9 }));
    terrain.receiveShadow = true;
    hero.add(terrain);
    const groundY = height(0, 0);

    // bricks of the P
    const monument = new THREE.Group();
    monument.position.set(-4.4, groundY - 0.15, 0);
    hero.add(monument);
    const BW = 1.08, BH = 0.6, GAP = 0.075, DEPTH = 1.7;
    const bGeo = new RoundedBoxGeometry(BW - GAP, BH - GAP, DEPTH, 2, 0.09);
    const bMat = new THREE.MeshStandardMaterial({ color: 0x9eabb8, roughness: 0.78, metalness: 0.0, bumpMap: stoneTex, bumpScale: 3, emissive: new THREE.Color(0x92c5b4), emissiveIntensity: 0 });
    let idx = 0;
    for (let row = 0; row * BH < 12; row++) {
      const y = row * BH + BH / 2;
      const off = row % 2 ? BW / 2 : 0;
      for (let x = -BW + off; x < 9; x += BW) {
        const cx = x + BW / 2;
        if (!insideP(cx, y) && !(insideP(cx - 0.3, y) && insideP(cx + 0.3, y))) continue;
        if (!insideP(cx, y)) continue;
        const m = new THREE.Mesh(bGeo, bMat.clone());
        m.castShadow = true; m.receiveShadow = true;
        m.position.set(cx, y, 0);
        m.userData = { home: m.position.clone(), lift: 0, target: 0, dir: new V3((Math.random() - 0.5) * 0.6, Math.random() * 0.4, 1).normalize(), rot: new V3((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.6), id: 10 + ((idx * 37) % 89), scatter: Math.random() };
        monument.add(m); heroState.bricks.push(m); idx++;
      }
    }
    // glowing core inside the letter, seen through the joints
    const core = new THREE.Mesh(new THREE.ExtrudeGeometry(pShape(0.18), { depth: DEPTH * 0.7, bevelEnabled: false, curveSegments: 40 }), new THREE.MeshBasicMaterial({ color: GLOW.clone().multiplyScalar(1.3), toneMapped: false }));
    core.position.z = -DEPTH * 0.35; monument.add(core);
    const coreLight = new THREE.PointLight(0xbff2e2, 6, 20, 1.8); coreLight.position.set(4, 6, 2.5); monument.add(coreLight);
    // the dot: glass sphere with light inside
    const dotG = new THREE.Group(); dotG.position.set(9.6, 1.7, 0); monument.add(dotG);
    const dotGlass = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 3), new THREE.MeshPhysicalMaterial({ color: 0xe6f6f0, roughness: 0.12, transmission: 1, thickness: 2.4, ior: 1.38, iridescence: 0.7, iridescenceIOR: 1.3, clearcoat: 1, attenuationColor: new THREE.Color(0x92c5b4), attenuationDistance: 3, flatShading: true }));
    dotGlass.castShadow = true; dotG.add(dotGlass);
    const dotCore = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 24), new THREE.MeshBasicMaterial({ color: GLOW.clone().multiplyScalar(1.6), toneMapped: false }));
    dotG.add(dotCore);
    heroState.dot = dotG;

    // snow particles
    const N = mobile ? 900 : 2200;
    const sp = new Float32Array(N * 3), sv = new Float32Array(N);
    for (let i = 0; i < N; i++) { sp[i * 3] = (Math.random() - 0.5) * 70; sp[i * 3 + 1] = Math.random() * 30; sp[i * 3 + 2] = (Math.random() - 0.5) * 60; sv[i] = 0.5 + Math.random(); }
    const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const snow = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false }));
    hero.add(snow);

    heroState.monument = monument; heroState.core = core;
    hoverables.push({ chapter: 0, objects: heroState.bricks });

    updaters.push((t, dt, st) => {
      // snow drifts with the wind
      const a = sGeo.attributes.position.array;
      for (let i = 0; i < N; i++) {
        a[i * 3] += dt * (1.8 + sv[i]) ; a[i * 3 + 1] -= dt * sv[i] * 0.9; a[i * 3 + 2] += Math.sin(t + i) * dt * 0.3;
        if (a[i * 3 + 1] < 0 || a[i * 3] > 35) { a[i * 3] = -35; a[i * 3 + 1] = Math.random() * 30; }
      }
      sGeo.attributes.position.needsUpdate = true;
      dotG.position.y = 1.7 + Math.sin(t * 1.2) * 0.25;
      dotGlass.rotation.y = t * 0.2; dotGlass.rotation.x = t * 0.13;
      // bricks: hover lift, scroll explode, idle shimmer
      const local = st.chapter === 0 ? st.local : st.chapter > 0 ? 1 : 0;
      const explode = smooth(0.35, 1, local);
      const hit = st.hoverPoint; // in monument space
      heroState.lifted.length = 0;
      for (const b of heroState.bricks) {
        const u = b.userData;
        let target = 0;
        if (hit) { const d = Math.hypot(u.home.x - hit.x, u.home.y - hit.y); target = Math.pow(clamp(1 - d / 2.9), 1.4); }
        const idle = Math.max(0, Math.sin(t * 0.7 + u.scatter * 40) - 0.985) * 40; // a brick pops now and then
        target = Math.max(target, idle * 0.35, explode * (0.4 + u.scatter * 1.6));
        u.lift += (target - u.lift) * Math.min(1, dt * 6);
        const L = u.lift;
        b.position.set(u.home.x + u.dir.x * L * 1.3, u.home.y + u.dir.y * L * 1.1, u.home.z + u.dir.z * L * 2.2);
        b.rotation.set(u.rot.x * L, u.rot.y * L, u.rot.z * L);
        b.material.emissiveIntensity = L * 0.9;
        if (L > 0.35) heroState.lifted.push(b);
      }
      heroState.lifted.sort((a, b) => b.userData.lift - a.userData.lift);
      core.material.color.copy(GLOW).multiplyScalar(1.25 + explode * 2.2 + Math.sin(t * 2) * 0.08);
      coreLight.intensity = 6 + explode * 30;
    });

    hero.userData.camera = (t, mx, my) => {
      const k = ease(clamp(t));
      const pos = new V3(lerp(0, 2.5, k) + mx * 1.6, lerp(6.5, 4.5, k) - my * 0.8, lerp(30, 11, k));
      const look = new V3(lerp(0.3, 2.5, k), lerp(5.6, 3.5, k), 0);
      return { pos, look, fov: lerp(36, 46, k) };
    };
    hero.userData.env = { bg: 0xa9b4bf, fog: 0.0105, sun: 1.9, hemi: 0.75 };
  }

  // =====================================================================
  // Shared: ice crystal material and geometry
  // =====================================================================
  const iceMat = () => new THREE.MeshPhysicalMaterial({
    color: 0xeef6fb, roughness: 0.1, metalness: 0, transmission: 1, thickness: 3.2, ior: 1.42,
    iridescence: 0.85, iridescenceIOR: 1.35, iridescenceThicknessRange: [200, 700], clearcoat: 1, clearcoatRoughness: 0.15,
    attenuationColor: new THREE.Color(0xa9d8ca), attenuationDistance: 7, specularIntensity: 1, envMapIntensity: 1.3, flatShading: true,
  });
  function crystalGeo(seed, h = 7, r = 1.9) {
    const g = new THREE.CylinderGeometry(r * 0.55, r, h, 6, 5, false);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = fbm(x * 0.6 + seed, y * 0.4 + z * 0.6, 3);
      const top = y > h / 2 - 0.01 ? 1 : 0;
      p.setXYZ(i, x * (1 + n * 0.22) * (top ? 0.25 : 1), y + (top ? 1.6 + n : n * 0.3), z * (1 + n * 0.22) * (top ? 0.25 : 1));
    }
    g.computeVertexNormals();
    return g;
  }
  const glowMat = (k = 2.4) => new THREE.MeshBasicMaterial({ color: GLOW.clone().multiplyScalar(k), toneMapped: false });

  // icons frozen inside the service crystals
  function icon(code) {
    const g = new THREE.Group(); const m = glowMat(1.5);
    const bar = (w, h, d, x, y, z = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
    if (code === 'WEB') { bar(2, 0.1, 0.1, 0, 0.65); bar(2, 0.1, 0.1, 0, -0.65); bar(0.1, 1.4, 0.1, -1, 0); bar(0.1, 1.4, 0.1, 1, 0); bar(2, 0.06, 0.06, 0, 0.35); bar(0.7, 0.35, 0.05, -0.5, -0.05); bar(0.8, 0.08, 0.05, 0.45, 0); bar(0.6, 0.08, 0.05, 0.35, -0.25); }
    if (code === 'ADS') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.8, 1.5, 24, 1, true), new THREE.MeshBasicMaterial({ color: m.color, toneMapped: false, side: THREE.DoubleSide })); c.rotation.z = -Math.PI / 2; g.add(c); bar(0.5, 0.55, 0.5, -1, 0); for (let i = 0; i < 3; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.9 + i * 0.35, 0.03, 6, 40, 1.2), m); w.position.x = 0.4; w.rotation.z = -0.6; g.add(w); } }
    if (code === 'CONTENT') { const s = new THREE.Shape(); s.moveTo(-0.55, -0.7); s.lineTo(0.75, 0); s.lineTo(-0.55, 0.7); s.lineTo(-0.55, -0.7); const p = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: false }), m); p.position.z = -0.09; g.add(p); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.05, 8, 60), m); g.add(ring); }
    if (code === 'BRAND') { const s = new THREE.Shape(); s.moveTo(0, -1.1); s.lineTo(0.6, 0.1); s.lineTo(0.35, 0.9); s.lineTo(-0.35, 0.9); s.lineTo(-0.6, 0.1); s.lineTo(0, -1.1); const h = new THREE.Path(); h.absarc(0, 0.15, 0.16, 0, Math.PI * 2, true); s.holes.push(h); const p = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false }), m); p.position.z = -0.08; g.add(p); bar(0.04, 0.7, 0.05, 0, -0.55); }
    if (code === 'SYSTEMS') { [0.6, 1.0, 0.8, 1.45].forEach((hh, i) => bar(0.32, hh, 0.32, -0.75 + i * 0.5, -0.7 + hh / 2)); }
    return g;
  }

  // HUD anchor helper: returns a few points around an object for labels and lines
  function anchorsOf(obj, pts) { return pts.map((p) => obj.localToWorld(p.clone())); }

  // =====================================================================
  // CHAPTER 1: services, five crystals in the fog
  // =====================================================================
  const services = new THREE.Group(); services.position.set(3000, 0, 0); scene.add(services); chapters.push(services);
  const SPACING = 15;
  const svc = [];
  ['WEB', 'ADS', 'CONTENT', 'BRAND', 'SYSTEMS'].forEach((code, i) => {
    const g = new THREE.Group(); g.position.set(i * SPACING, 0, 0); services.add(g);
    const c = new THREE.Mesh(crystalGeo(i * 3.1), iceMat()); c.rotation.z = (i % 2 ? 1 : -1) * 0.12;
    const small = new THREE.Mesh(crystalGeo(i * 7.7, 3.6, 1), iceMat()); small.position.set(1.9, -2.1, 0.6); small.rotation.z = -0.6;
    const small2 = new THREE.Mesh(crystalGeo(i * 5.3, 2.6, 0.8), iceMat()); small2.position.set(-1.8, -2.6, -0.4); small2.rotation.z = 0.7;
    const ic = icon(code); ic.position.y = 0.2; ic.scale.setScalar(0.9);
    const inner = new THREE.PointLight(0xbff2e2, 8, 9, 1.8); inner.position.y = 0.2;
    g.add(ic, c, small, small2, inner);
    c.userData.hoverRoot = g;
    svc.push({ g, c, ic, inner, hover: 0, spin: 0, anchors: [new V3(0, 4.6, 0), new V3(1.6, 1.2, 0.8), new V3(-1.4, -1.6, 0.6)] });
  });
  hoverables.push({ chapter: 1, objects: svc.map((s) => s.c) });
  // floating dust
  function dust(count, spread) {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) { p[i * 3] = (Math.random() - 0.5) * spread.x; p[i * 3 + 1] = (Math.random() - 0.5) * spread.y; p[i * 3 + 2] = (Math.random() - 0.5) * spread.z; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.7, depthWrite: false }));
  }
  const d1 = dust(mobile ? 600 : 1500, new V3(110, 30, 40)); d1.position.x = 30; services.add(d1);
  services.userData.camera = (t, mx, my) => {
    const f = clamp(t) * 4; // 0..4 across five crystals
    const i = Math.min(3, Math.floor(f)), k = f - i;
    const hold = smooth(0.2, 0.8, k);
    const x = (i + hold) * SPACING;
    const swing = Math.sin(hold * Math.PI) * 2.5;
    return { pos: new V3(x + mx * 1.2 - (svcSide * 3.2), 0.6 - my * 0.6, 18 - swing), look: new V3(x - svcSide * 3.2, 0.4, 0), fov: 40 };
  };
  services.userData.env = { bg: 0x98a3ae, fog: 0.028, sun: 1.2, hemi: 1.0 };
  services.userData.active = (t) => Math.round(clamp(t) * 4);
  let svcSide = 0; // shifts the crystal to one side so text fits beside it
  updaters.push((t, dt, st) => {
    svc.forEach((s, i) => {
      s.hover += ((st.hovered === s.c ? 1 : 0) - s.hover) * Math.min(1, dt * 5);
      s.spin += dt * (0.15 + s.hover * 1.2);
      s.g.rotation.y = s.spin + (st.chapter === 1 ? st.local * 3 : 0);
      s.g.position.y = Math.sin(t * 0.8 + i) * 0.35;
      s.ic.rotation.y = -s.spin * 1.6; s.ic.rotation.x = Math.sin(t + i) * 0.2;
      s.c.material.iridescence = 0.7 + s.hover * 0.3;
      s.inner.intensity = 7 + s.hover * 18 + Math.sin(t * 3 + i) * 1.5;
    });
    d1.rotation.y = t * 0.01;
  });

  // =====================================================================
  // CHAPTER 2: works, ice blocks with live client sites frozen inside
  // =====================================================================
  const works = new THREE.Group(); works.position.set(6000, 0, 0); scene.add(works); chapters.push(works);
  const WSP = 17;
  const blocks = [];
  const texLoader = new THREE.TextureLoader();
  function addWorkBlock(i, imgUrl) {
    const g = new THREE.Group(); g.position.set(i * WSP, 0, 0); works.add(g);
    const tex = texLoader.load(imgUrl); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.15) }));
    g.add(screen);
    const mat = iceMat(); mat.flatShading = false; mat.roughness = 0.42; mat.thickness = 1.6; mat.iridescence = 0.5;
    const block = new THREE.Mesh(new RoundedBoxGeometry(7.6, 5.2, 1.6, 4, 0.35), mat);
    block.material.bumpMap = stoneTex; block.material.bumpScale = 0.4;
    g.add(block);
    // shards orbiting the block
    const shards = [];
    for (let k = 0; k < 7; k++) {
      const s = new THREE.Mesh(new THREE.TetrahedronGeometry(0.25 + Math.random() * 0.45, 0), iceMat());
      s.userData = { a: Math.random() * 6, r: 5 + Math.random() * 2, y: (Math.random() - 0.5) * 5, sp: 0.2 + Math.random() * 0.3 };
      g.add(s); shards.push(s);
    }
    const light = new THREE.PointLight(0xd7fff2, 10, 12, 1.8); light.position.set(0, 0, 3); g.add(light);
    block.userData.hoverRoot = g;
    blocks.push({ g, block, screen, shards, hover: 0, anchors: [new V3(3.8, 2.6, 0.8), new V3(-3.8, -2.6, 0.8)] });
  }
  works.userData.camera = (t, mx, my) => {
    const f = clamp(t) * 2;
    const i = Math.min(1, Math.floor(f)), k = f - i;
    const x = (i + smooth(0.2, 0.8, k)) * WSP;
    return { pos: new V3(x + mx * 1.4 - svcSide * 4.2, 0.3 - my * 0.6, 17), look: new V3(x - svcSide * 4.2, 0, 0), fov: 40 };
  };
  works.userData.env = { bg: 0x8d99a5, fog: 0.026, sun: 1.2, hemi: 1.0 };
  works.userData.active = (t) => Math.round(clamp(t) * 2);
  const d2 = dust(mobile ? 500 : 1200, new V3(80, 30, 40)); d2.position.x = 17; works.add(d2);
  updaters.push((t, dt, st) => {
    blocks.forEach((b, i) => {
      b.hover += ((st.hovered === b.block ? 1 : 0) - b.hover) * Math.min(1, dt * 5);
      b.block.material.roughness = lerp(0.42, 0.04, b.hover);
      b.block.material.thickness = lerp(1.6, 0.6, b.hover);
      b.g.rotation.y = Math.sin(t * 0.4 + i) * 0.18 + st.mx * 0.25 * b.hover;
      b.g.rotation.x = Math.sin(t * 0.5 + i) * 0.06 - st.my * 0.15 * b.hover;
      b.g.position.y = Math.sin(t * 0.7 + i * 2) * 0.25;
      b.shards.forEach((s) => { const u = s.userData; const a = u.a + t * u.sp; s.position.set(Math.cos(a) * u.r, u.y + Math.sin(a * 2) * 0.4, Math.sin(a) * u.r * 0.5); s.rotation.set(a, a * 1.3, 0); });
    });
  });
  hoverables.push({ chapter: 2, objects: () => blocks.map((b) => b.block) });

  // =====================================================================
  // CHAPTER 3: manifesto, the shattered orbit ring assembles around the dot
  // =====================================================================
  const mani = new THREE.Group(); mani.position.set(9000, 0, 0); scene.add(mani); chapters.push(mani);
  const segs = [];
  {
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x8792a0, roughness: 0.75, bumpMap: stoneTex, bumpScale: 2.5, emissive: new THREE.Color(0x92c5b4), emissiveIntensity: 0 });
    const makeRing = (R, w, depth, n, gapA, seedOff) => {
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * Math.PI * 2 + gapA / 2, a1 = ((i + 1) / n) * Math.PI * 2 - gapA / 2;
        const s = new THREE.Shape();
        s.absarc(0, 0, R + w / 2, a0, a1, false); s.absarc(0, 0, R - w / 2, a1, a0, true);
        const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.16, bevelSegments: 3, curveSegments: 18 });
        geo.translate(0, 0, -depth / 2);
        const m = new THREE.Mesh(geo, ringMat.clone()); m.castShadow = true;
        const r = 14 + Math.random() * 16, a = Math.random() * Math.PI * 2;
        m.userData = { from: new V3(Math.cos(a) * r, Math.sin(a) * r * 0.7, (Math.random() - 0.5) * 30), fromRot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6), delay: Math.random() * 0.35 + seedOff };
        mani.add(m); segs.push(m);
      }
    };
    makeRing(7.2, 1.5, 1.8, 11, 0.05, 0);
    makeRing(4.4, 0.9, 1.3, 7, 0.22, 0.1);
    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.5, 12, 120), glowMat(1.8)); glowRing.scale.z = 0.6; mani.add(glowRing);
    const glowRing2 = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.3, 12, 90), glowMat(1.6)); mani.add(glowRing2);
    const planet = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 4), new THREE.MeshPhysicalMaterial({ color: 0xe6f6f0, roughness: 0.1, transmission: 1, thickness: 3, ior: 1.4, iridescence: 0.8, clearcoat: 1, attenuationColor: new THREE.Color(0x92c5b4), attenuationDistance: 3, flatShading: true }));
    const pcore = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 24), glowMat(2.8));
    const pl = new THREE.PointLight(0xbff2e2, 40, 20, 1.6);
    mani.add(planet, pcore, pl);
    mani.userData.camera = (t, mx, my) => ({ pos: new V3(mx * 3, -my * 2 + lerp(3, 0, t), lerp(40, 30, ease(clamp(t)))), look: new V3(0, 0, 0), fov: 42 });
    mani.userData.env = { bg: 0x7f8c99, fog: 0.012, sun: 1.3, hemi: 0.9 };
    updaters.push((t, dt, st) => {
      const local = st.chapter === 3 ? st.local : st.chapter > 3 ? 1 : 0;
      segs.forEach((m) => {
        const u = m.userData;
        const k = ease(smooth(u.delay, u.delay + 0.5, local * 1.05));
        m.position.copy(u.from).lerp(new V3(0, 0, 0), k);
        m.rotation.set(u.fromRot.x * (1 - k), u.fromRot.y * (1 - k), u.fromRot.z * (1 - k));
        m.material.emissiveIntensity = k * 0.08;
      });
      const done = smooth(0.55, 0.9, local);
      glowRing.material.color.copy(GLOW).multiplyScalar(done * 2.2);
      glowRing2.material.color.copy(GLOW).multiplyScalar(done * 2);
      mani.rotation.y = Math.sin(t * 0.25) * 0.35 + st.mx * 0.3;
      mani.rotation.x = Math.sin(t * 0.2) * 0.15 - st.my * 0.2 + 0.25;
      planet.rotation.y = t * 0.3;
      pl.intensity = 8 + done * 22;
    });
  }

  // =====================================================================
  // CHAPTER 4: contact, the P as a living point cloud on a pedestal
  // =====================================================================
  const contact = new THREE.Group(); contact.position.set(12000, 0, 0); scene.add(contact); chapters.push(contact);
  const cloud = { mouse: new V3(999, 999, 0) };
  {
    // pedestal
    const ped = new THREE.Group(); ped.position.y = -4.2; contact.add(ped);
    const pm = new THREE.MeshStandardMaterial({ color: 0xaeb9c4, roughness: 0.55, metalness: 0.1, bumpMap: stoneTex, bumpScale: 1.2 });
    [[16, 0.6, -1.2], [11, 0.7, -0.6], [6.5, 0.8, 0]].forEach(([r, h, y], i) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.2, h, 96), pm); c.position.y = y; c.receiveShadow = true; ped.add(c);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(r + 0.05, 0.06, 8, 160), glowMat(2.2)); rim.rotation.x = Math.PI / 2; rim.position.y = y + h / 2; ped.add(rim);
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.35, 16, 120), glowMat(2.4)); halo.rotation.x = Math.PI / 2; halo.position.y = 11; contact.add(halo);
    // points sampled inside the P (and the dot)
    const N = mobile ? 9000 : 22000;
    const pos = new Float32Array(N * 3), rnd = new Float32Array(N);
    let n = 0;
    while (n < N) {
      const isDot = Math.random() < 0.12;
      let x, y, z;
      if (isDot) { const v = new V3().randomDirection().multiplyScalar(Math.cbrt(Math.random()) * 1.6); x = 9.6 + v.x; y = 1.7 + v.y; z = v.z; }
      else { x = Math.random() * 8.4; y = Math.random() * 12; if (!insideP(x, y)) continue; z = (Math.random() - 0.5) * 1.8; }
      pos[n * 3] = x - 4.8; pos[n * 3 + 1] = y - 3.4; pos[n * 3 + 2] = z; rnd[n] = Math.random(); n++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
    const pmat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uMouse: { value: cloud.mouse }, uPix: { value: renderer.getPixelRatio() }, uScatter: { value: 0 } },
      vertexShader: `
        uniform float uTime, uPix, uScatter; uniform vec3 uMouse; attribute float aRnd; varying float vA; varying float vG;
        void main(){
          vec3 p = position;
          p.x += sin(uTime * .8 + p.y * 1.7 + aRnd * 6.) * .04;
          p.y += cos(uTime * .7 + p.x * 1.3 + aRnd * 6.) * .04;
          vec3 d = p - uMouse; float dist = length(d.xy);
          float push = smoothstep(2.6, 0., dist);
          p += normalize(d + vec3(0., 0., .001)) * push * (1.4 + aRnd);
          p.y += uScatter * (aRnd * 14.); p.x += uScatter * (aRnd - .5) * 8.;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.6 + aRnd * 2.2) * uPix * (18. / -mv.z);
          vA = .55 + aRnd * .45; vG = push + step(.97, aRnd);
        }`,
      fragmentShader: `
        varying float vA; varying float vG;
        void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); if (d > .5) discard;
          vec3 col = mix(vec3(.82,.87,.92), vec3(.75,1.25,1.05), clamp(vG,0.,1.));
          gl_FragColor = vec4(col, vA * smoothstep(.5, .1, d)); }`,
    });
    const points = new THREE.Points(g, pmat);
    contact.add(points);
    const d3 = dust(mobile ? 400 : 900, new V3(60, 30, 40)); contact.add(d3);
    cloud.points = points;
    contact.userData.camera = (t, mx, my) => ({ pos: new V3(Math.sin(t * 0.6 - 0.3) * 6 + mx * 2.5, 3.2 - my * 1.2, lerp(26, 22, t)), look: new V3(0, 2.2, 0), fov: 44 });
    contact.userData.env = { bg: 0xa3aeb9, fog: 0.02, sun: 1.3, hemi: 1.0 };
    updaters.push((t, dt, st) => {
      pmat.uniforms.uTime.value = t;
      const local = st.chapter === 4 ? st.local : 0;
      pmat.uniforms.uScatter.value = st.chapter === 4 ? smooth(0.92, 1, local) : 0;
      points.rotation.y = Math.sin(t * 0.3) * 0.5;
      halo.material.color.copy(GLOW).multiplyScalar(2 + Math.sin(t * 2) * 0.3);
    });
  }

  // ---------- picking ----------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null, hoverPoint = null;
  const plane = new THREE.Plane(new V3(0, 0, 1), 0);

  // ---------- resize ----------
  function resize(w, h) {
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    finalPass.uniforms.uRes.value.set(w, h);
    bloom.resolution.set(w / 2, h / 2);
  }

  const bgA = new THREE.Color(), tmp = new V3();
  let last = performance.now();
  let curChapter = -1;

  function frame(st) {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    svcSide = st.side; // -1, 0 or 1: pushes the subject left/right for the text
    // which chapter is the camera in
    const ch = chapters[st.chapter];
    if (curChapter !== st.chapter) {
      curChapter = st.chapter;
      chapters.forEach((c, i) => (c.visible = i === st.chapter || (i === 0 && st.chapter === 0)));
      const e = ch.userData.env;
      // shadows follow the active chapter
      sun.target.position.copy(ch.position); sun.position.copy(ch.position).add(new V3(-30, 40, 25));
    }
    const e = ch.userData.env;
    bgA.set(e.bg);
    scene.background.lerp(bgA, Math.min(1, dt * 6)); scene.fog.color.copy(scene.background);
    scene.fog.density += (e.fog - scene.fog.density) * Math.min(1, dt * 6);
    sun.intensity = e.sun; hemi.intensity = e.hemi;

    sky.position.copy(camera.position);
    skyMat.uniforms.uBottom.value.copy(scene.background);
    skyMat.uniforms.uTop.value.copy(scene.background).lerp(new THREE.Color(0xffffff), 0.35);
    const cam = ch.userData.camera(st.local, st.mx, st.my);
    // tall screens: pull the camera back so the subject still fits the width
    const asp = camera.aspect, back = asp < 1 ? Math.min(1.75, 0.72 / asp) : 1;
    if (back > 1) cam.pos.sub(cam.look).multiplyScalar(back).add(cam.look);
    camera.position.copy(cam.pos).add(ch.position);
    tmp.copy(cam.look).add(ch.position);
    camera.lookAt(tmp);
    if (Math.abs(camera.fov - cam.fov) > 0.01) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }

    // hover picking (only in the active chapter)
    hovered = null; hoverPoint = null;
    if (st.pointer) {
      ndc.set(st.pointer.x, st.pointer.y);
      ray.setFromCamera(ndc, camera);
      const hv = hoverables.find((h) => h.chapter === st.chapter);
      if (hv) {
        const objs = typeof hv.objects === 'function' ? hv.objects() : hv.objects;
        const hit = ray.intersectObjects(objs, false)[0];
        if (hit) {
          hovered = hit.object;
          if (st.chapter === 0) hoverPoint = heroState.monument.worldToLocal(hit.point.clone());
        }
      }
      if (st.chapter === 4) {
        plane.constant = -contact.position.z;
        const p = new V3();
        if (ray.ray.intersectPlane(plane, p)) cloud.mouse.copy(cloud.points.worldToLocal(p));
      }
    } else cloud.mouse.set(999, 999, 0);

    const state = { chapter: st.chapter, local: st.local, hovered, hoverPoint, mx: st.mx, my: st.my };
    for (const fn of updaters) fn(t, dt, state);

    finalPass.uniforms.uTime.value = t;
    finalPass.uniforms.uGlitch.value = st.glitch;
    finalPass.uniforms.uWash.value = st.wash || 0;
    composer.render();

    // HUD data
    const hud = { hovered: !!hovered, labels: [] };
    const toScreen = (v) => { const p = v.clone().project(camera); return { x: (p.x * 0.5 + 0.5) * st.w, y: (-p.y * 0.5 + 0.5) * st.h, z: p.z }; };
    if (st.chapter === 0) {
      hud.labels = heroState.lifted.slice(0, 5).map((b) => ({ ...toScreen(b.getWorldPosition(new V3())), id: b.userData.id }));
    } else if (st.chapter === 1) {
      const s = svc[services.userData.active(st.local)];
      hud.anchors = anchorsOf(s.g, s.anchors).map(toScreen);
      hud.center = toScreen(s.g.getWorldPosition(new V3()));
    } else if (st.chapter === 2) {
      const b = blocks[works.userData.active(st.local)];
      if (b) { hud.anchors = anchorsOf(b.g, b.anchors).map(toScreen); hud.center = toScreen(b.g.getWorldPosition(new V3())); }
    }
    hud.hoverWork = st.chapter === 2 && hovered ? blocks.findIndex((b) => b.block === hovered) : -1;
    return hud;
  }

  return { renderer, resize, frame, addWorkBlock, compile: () => renderer.compile(scene, camera) };
}
