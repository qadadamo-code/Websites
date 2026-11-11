/* BloomMark — 3D extruded BM monogram (home hero) */
import * as THREE from 'three';
import { SVGLoader } from './vendor/SVGLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const cv = document.getElementById('gl');
const L = window.BM_LOGO;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function fail() { document.body.classList.add('gl-off'); }

try {
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  /* --- geometry from the traced logo --- */
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="300 150 2250 1720"><path fill-rule="evenodd" d="${L.B}"/><path fill-rule="evenodd" d="${L.M}"/><path fill-rule="evenodd" d="${L.script}"/></svg>`;
  const data = new SVGLoader().parse(svg);
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x2a2a2e, metalness: 1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.25 });
  const edgeMat = new THREE.MeshPhysicalMaterial({ color: 0xcdb991, metalness: 1, roughness: 0.25, clearcoat: 1, envMapIntensity: 1.4 });
  const scriptMat = new THREE.MeshPhysicalMaterial({ color: 0xd9c49a, metalness: 1, roughness: 0.22, clearcoat: 1, envMapIntensity: 1.5 });
  data.paths.forEach((p, i) => {
    const isScript = i === 2;
    SVGLoader.createShapes(p).forEach(shape => {
      const geo = new THREE.ExtrudeGeometry(shape, isScript
        ? { depth: 40, bevelEnabled: true, bevelThickness: 6, bevelSize: 2, bevelSegments: 2, curveSegments: 6 }
        : { depth: 150, bevelEnabled: true, bevelThickness: 14, bevelSize: 6, bevelSegments: 3, curveSegments: 5 });
      if (isScript) geo.translate(0, 0, 55);
      group.add(new THREE.Mesh(geo, isScript ? [scriptMat, scriptMat] : [mat, edgeMat]));
    });
  });
  const box = new THREE.Box3().setFromObject(group);
  const c = box.getCenter(new THREE.Vector3());
  group.children.forEach(m => m.geometry.translate(-c.x, -c.y, -c.z));
  const size = box.getSize(new THREE.Vector3());
  const s = 5.2 / size.x;
  const logo = new THREE.Group();
  group.scale.set(s, -s, s);
  logo.add(group);
  scene.add(logo);

  /* --- lights --- */
  const warm = new THREE.PointLight(0xe8d4a8, 60, 30); warm.position.set(4, 3, 5); scene.add(warm);
  const cool = new THREE.PointLight(0xaab8d0, 40, 30); cool.position.set(-5, -2, 4); scene.add(cool);
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  /* --- dust particles --- */
  const N = 900, pos = new Float32Array(N * 3), sp = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 3 + Math.random() * 7, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * .6; pos[i * 3 + 2] = r * Math.cos(ph) - 2;
    sp[i] = Math.random();
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement('canvas'); dot.width = dot.height = 32;
  const dctx = dot.getContext('2d'); const gr = dctx.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); dctx.fillStyle = gr; dctx.fillRect(0, 0, 32, 32);
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.05, map: new THREE.CanvasTexture(dot), transparent: true, opacity: 0.55, depthWrite: false, color: 0xe9e2d2 }));
  scene.add(pts);

  /* --- interaction --- */
  let mx = 0, my = 0, tx = 0, ty = 0, scrollF = 0, intro = 0, introStart = null, run = true;
  const isRTL = document.documentElement.dir === 'rtl';
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  addEventListener('scroll', () => { scrollF = Math.min(1, scrollY / innerHeight); }, { passive: true });
  new IntersectionObserver(([en]) => { run = en.isIntersecting; if (run) requestAnimationFrame(loop); }).observe(cv);

  function resize() {
    const w = cv.clientWidth, h = cv.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    // place the logo on the free side on wide screens, centred behind text on narrow ones
    const wide = w / h > 1.25;
    const side = (document.documentElement.dir === 'rtl') ? -1 : 1;
    logo.userData.baseX = wide ? side * Math.min(2.45, 2.45 * (w / h) / 1.6) : 0;
    logo.userData.baseY = wide ? 0.25 : 1.55;
    logo.userData.baseS = wide ? 0.76 : Math.min(0.7, 0.55 * (w / h) / 0.46);
  }
  resize(); addEventListener('resize', resize);
  new MutationObserver(resize).observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });

  const start = () => { introStart = performance.now(); };
  if (window.__bmReady) start(); else addEventListener('bm:ready', start, { once: true });

  const ease = t => 1 - Math.pow(1 - t, 4);
  const clock = new THREE.Clock();
  function loop() {
    if (!run) return;
    const t = clock.getElapsedTime();
    if (introStart !== null) intro = Math.min(1, (performance.now() - introStart) / 2400);
    const e = reduce ? 1 : ease(intro);
    tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
    const u = logo.userData;
    logo.position.x = u.baseX + tx * 0.4;
    logo.position.y = u.baseY - ty * 0.25 + Math.sin(t * .8) * 0.06 + scrollF * 1.6;
    logo.position.z = -scrollF * 2;
    const sc = u.baseS * (0.6 + 0.4 * e);
    logo.scale.setScalar(sc);
    logo.rotation.y = (1 - e) * -2.4 + tx * 0.7 + Math.sin(t * .35) * 0.12 + scrollF * 0.9;
    logo.rotation.x = ty * 0.35 + Math.cos(t * .3) * 0.04;
    mat.opacity = e;
    warm.position.x = 4 + Math.sin(t * .6) * 2; warm.position.y = 3 + Math.cos(t * .5) * 1.5;
    cool.position.x = -5 + Math.cos(t * .4) * 2;
    pts.rotation.y = t * 0.02 + tx * 0.15; pts.rotation.x = ty * 0.08;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
} catch (err) { console.warn('GL off', err); fail(); }
