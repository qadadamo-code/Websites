/* Anwar Ghaleb — live 3D: hero constellation + case studio */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { phoneCase, earbuds, charger, watch, cable, powerbank, pad, studio as makeStudio } from './models.js';

const isMobile = matchMedia('(max-width: 760px)').matches;
const DPR = Math.min(devicePixelRatio || 1, isMobile ? 1.5 : 1.75);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function mkRenderer(canvas, keep = false) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: keep, powerPreference: 'high-performance' });
  r.setPixelRatio(DPR);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}
function visible(el, cb) { const io = new IntersectionObserver(es => es.forEach(e => cb(e.isIntersecting)), { rootMargin: '100px' }); io.observe(el); }

/* ================= HERO ================= */
async function hero() {
  const canvas = document.getElementById('heroGL'); if (!canvas) return;
  const r = mkRenderer(canvas);
  const scene = await makeStudio(r, { RoomEnvironment });
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 100); cam.position.set(0, 0, 9);
  const root = new THREE.Group(); scene.add(root);

  const ph = phoneCase({ color: '#5046FF', phoneColor: '#2b2f3a', screen: true }); ph.scale.setScalar(1.9);
  const phWrap = new THREE.Group(); phWrap.add(ph); root.add(phWrap);
  ph.rotation.y = -.35;

  // MagSafe pulse ring
  const pulse = new THREE.Mesh(new THREE.TorusGeometry(.42, .012, 8, 120), new THREE.MeshBasicMaterial({ color: '#D4FF3A', transparent: true, opacity: 0, toneMapped: false }));
  pulse.position.set(0, -.22, -.12); pulse.rotation.y = Math.PI; ph.add(pulse);

  const items = [
    [earbuds({ color: '#f3f4f7' }), [-1.85, 1.15, -.6], .95, [.4, .6, 0]],
    [charger({ color: '#f2f3f6', watts: '65W', ports: 3 }), [1.75, 1.35, -.9], .9, [.25, -.7, 0]],
    [watch({ band: '#D4FF3A' }), [1.9, -1.05, .2], 1.05, [.2, -.6, .1]],
    [powerbank({ color: '#1c1e26', cap: '20000' }), [-1.9, -1.25, -.4], .85, [.1, .5, -.15]],
    [cable({ color: '#5046FF' }), [.2, -2.05, -1.2], .8, [-.2, 0, 0]],
    [pad({ color: '#1c1e26', ring: '#D4FF3A' }), [-1.35, 2.2, -1.6], .8, [0, 0, 0]]
  ].map(([o, p, s, rr], i) => {
    const g = new THREE.Group(); g.add(o); o.rotation.set(...rr); g.position.set(...p); g.scale.setScalar(s * (isMobile ? .82 : 1));
    g.userData = { base: new THREE.Vector3(...p), ph: i * 1.3, sp: .5 + (i % 3) * .15 };
    root.add(g); return g;
  });

  let W = 0, H = 0;
  function layout() {
    W = canvas.clientWidth; H = canvas.clientHeight; r.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
    const rtl = document.documentElement.dir === 'rtl';
    if (isMobile || W < 760) { root.position.set(0, 1.45, 0); root.scale.setScalar(.36); }
    else { const x = W > 1300 ? 1.85 : 1.6; root.position.set(rtl ? -x : x, -.05, 0); root.scale.setScalar(W < 1100 ? .62 : .74); }
  }
  layout(); addEventListener('resize', layout); addEventListener('ag:lang', layout);

  const mouse = new THREE.Vector2(), sm = new THREE.Vector2();
  addEventListener('pointermove', e => { mouse.set(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5); });
  let scrollP = 0;
  addEventListener('scroll', () => { scrollP = Math.min(1, scrollY / innerHeight); }, { passive: true });

  // intro: items fly in
  items.forEach((g, i) => { g.userData.k = 0; });
  phWrap.scale.setScalar(.001);
  const t0 = performance.now();
  let on = true; visible(canvas, v => on = v);
  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    if (!on) return;
    const t = clock.getElapsedTime(), since = (performance.now() - t0) / 1000;
    const k = reduce ? 1 : Math.min(1, Math.max(0, (since - (document.getElementById('intro') ? 2.2 : .2)) / 1.4));
    const e = 1 - Math.pow(1 - k, 4);
    phWrap.scale.setScalar(.001 + e * .999);
    sm.lerp(mouse, .05);
    phWrap.rotation.y = (1 - e) * -2.5 + t * .25 + sm.x * .6 + scrollP * 1.4;
    phWrap.rotation.x = sm.y * .25 + Math.sin(t * .7) * .05;
    phWrap.position.y = Math.sin(t * .9) * .08 - scrollP * .6;
    items.forEach((g, i) => {
      const u = g.userData, ki = Math.min(1, Math.max(0, k * 1.6 - i * .1)), ei = 1 - Math.pow(1 - ki, 3);
      g.position.set(u.base.x * (.2 + .8 * ei) * (1 + scrollP * .5), u.base.y * (.2 + .8 * ei) + Math.sin(t * u.sp + u.ph) * .12 - scrollP * .8, u.base.z + sm.x * .3);
      g.rotation.y = Math.sin(t * .4 + u.ph) * .3 + sm.x * .4; g.rotation.x = Math.cos(t * .5 + u.ph) * .15;
      g.children[0].visible = ki > 0;
      g.scale.setScalar((isMobile ? .82 : 1) * [.95, .9, 1.05, .85, .8, .8][i] * ei);
    });
    const pp = (t * .6) % 1; pulse.scale.setScalar(1 + pp * .9); pulse.material.opacity = (1 - pp) * .9 * e;
    r.render(scene, cam);
  }
  loop();
}

/* ================= STUDIO ================= */
async function caseStudio() {
  const canvas = document.getElementById('studioGL'); if (!canvas) return;
  const r = mkRenderer(canvas, true);
  const scene = await makeStudio(r, { RoomEnvironment });
  const cam = new THREE.PerspectiveCamera(28, 1, .1, 50); cam.position.set(0, .1, 6.3);
  const holder = new THREE.Group(); scene.add(holder);
  let cur = null, state = { mat: 'silicone', color: '#5046FF', name: '' };

  function engraveTex(text, color) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d');
    const lum = (() => { const h = color.replace('#', ''); const n = parseInt(h, 16); return (((n >> 16) & 255) * .3 + ((n >> 8) & 255) * .59 + (n & 255) * .11) / 255; })();
    g.fillStyle = lum > .55 ? 'rgba(10,11,18,.78)' : 'rgba(255,255,255,.85)';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const ar = /[؀-ۿ]/.test(text);
    g.font = `700 ${ar ? 84 : 76}px ${ar ? '"IBM Plex Sans Arabic"' : '"Inter Tight"'}, sans-serif`;
    g.fillText(text, 256, 84);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function build() {
    if (cur) { holder.remove(cur); cur.traverse(o => { o.geometry && o.geometry.dispose(); }); }
    const style = state.mat;
    cur = phoneCase({ color: style === 'clear' ? '#ffffff' : style === 'carbon' ? '#22252d' : state.color, style, phoneColor: style === 'clear' ? state.color : '#2b2f3a', magsafe: style !== 'leather', screen: true });
    if (state.name && state.name.trim()) {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(.62, .19), new THREE.MeshBasicMaterial({ map: engraveTex(state.name.trim(), style === 'clear' ? '#ffffff' : style === 'carbon' ? '#22252d' : state.color), transparent: true, depthWrite: false }));
      pl.rotation.y = Math.PI; pl.position.set(0, -.6, -.0585); cur.add(pl);
    }
    cur.scale.setScalar(1.22);
    holder.add(cur);
  }
  addEventListener('ag:studio', e => { const d = e.detail; const changed = d.mat !== state.mat || d.color !== state.color || d.name !== state.name; state = d; if (changed || !cur) { build(); if (window.gsap) gsap.fromTo(holder.scale, { x: .94, y: .94, z: .94 }, { x: 1, y: 1, z: 1, duration: .6, ease: 'back.out(2)' }); } });
  build();
  dispatchEvent(new CustomEvent('ag:scene-ready'));

  function layout() { const w = canvas.clientWidth, h = canvas.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < .9 ? 34 : 28; cam.updateProjectionMatrix(); }
  layout(); addEventListener('resize', layout);

  // drag rotate
  let rotY = Math.PI + .5, vel = 0, drag = false, lastX = 0, idle = 0, rotX = .1;
  canvas.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * .01; rotY += vel; idle = 0; });
  addEventListener('pointerup', () => drag = false);

  window.AGStudioShot = () => {
    const prev = holder.rotation.y; holder.rotation.y = Math.PI + .4; r.render(scene, cam);
    const src = r.domElement, c = document.createElement('canvas'); const s = 200; c.width = s; c.height = s;
    const g = c.getContext('2d'); const m = Math.min(src.width, src.height); g.drawImage(src, (src.width - m) / 2, (src.height - m) / 2, m, m, 0, 0, s, s);
    holder.rotation.y = prev; return c.toDataURL('image/png');
  };

  let on = false; visible(canvas, v => on = v);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    const dt = clock.getDelta(); if (!on) return;
    if (!drag) { vel *= .94; rotY += vel; idle += dt; if (idle > 2.5 && !reduce) rotY += dt * .35; }
    holder.rotation.y = rotY; holder.rotation.x = rotX + Math.sin(clock.elapsedTime * .8) * .03;
    holder.position.y = Math.sin(clock.elapsedTime * 1.1) * .04;
    r.render(scene, cam);
  })();
}

try { await document.fonts.ready; } catch (e) {}
hero().catch(e => console.error(e));
caseStudio().catch(e => console.error(e));
