import * as THREE from 'three';
import { createWorld, SPOTS, C } from './world.js?v=2';
import { STEPS, T, WA, EMAIL } from './content.js?v=2';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

let lang = 'ar';
try { const saved = localStorage.getItem('planet3d-lang'); if (saved === 'en' || saved === 'ar') lang = saved; } catch (e) {}
if (new URLSearchParams(location.search).get('lang') === 'en') lang = 'en';

// ---------- Static text ----------
const ICONS = {
  hq: '<path d="M7 20V4h6a5 5 0 0 1 0 10H7"/><circle cx="17.5" cy="18.5" r="2" fill="currentColor" stroke="none"/>',
  web: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M2 20h20M3 8h18"/>',
  ads: '<path d="M4 10v4h3l7 4V6L7 10H4z"/><path d="M17.5 8.5a5 5 0 0 1 0 7M20 6a8.5 8.5 0 0 1 0 12"/>',
  content: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  brand: '<path d="M14.5 4.5l5 5L9 20H4v-5z"/><path d="M12.5 6.5l5 5"/>',
  launch: '<path d="M12 2c3 2.5 4.5 6 4.5 10l-2 4h-5l-2-4C7.5 8 9 4.5 12 2z"/><circle cx="12" cy="10" r="1.6"/><path d="M9.5 16l-2.5 4M14.5 16l2.5 4M12 17v4"/>',
  data: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

function applyText() {
  const t = T[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;
  document.title = t.title;
  $$('[data-t]').forEach((el) => {
    const v = el.dataset.t.split('.').reduce((o, k) => (o ? o[k] : undefined), t);
    if (typeof v === 'string') el.textContent = v;
  });
  $('#pkg-items').innerHTML = t.pkg.items.map((i) => `<li><span class="tick"></span>${i}</li>`).join('');
  $('#dock').innerHTML = STEPS.slice(1, 8).map((s, i) => `<button data-go="${i + 1}" aria-label="${t.dock[s.id]}">${svg(s.id)}<span>${t.dock[s.id]}</span></button>`).join('') + '<i class="dock-bar"><b></b></i>';
  $('#hotspots').innerHTML = STEPS.slice(1, 8).map((s, i) => `<button class="hs" data-go="${i + 1}" data-spot="${s.spot}"><i>+</i><span>${t.dock[s.id]}</span></button>`).join('');
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => goStep(+b.dataset.go)));
  $$('.wa-link').forEach((a) => (a.href = WA + '?text=' + encodeURIComponent(lang === 'ar' ? 'أهلاً بلانت، عايز أبدأ مشروع' : 'Hi Planet, I would like to start a project')));
  $$('.mail-link').forEach((a) => (a.href = 'mailto:' + EMAIL));
  lastCard = -1;
  if (world) world.paintScreens(lang);
}

// ---------- Card ----------
let lastCard = -1;
function renderCard(i) {
  if (i === lastCard) return;
  lastCard = i;
  const t = T[lang], s = T[lang].steps[STEPS[i].id];
  const card = $('#card');
  card.classList.remove('in');
  void card.offsetWidth;
  card.innerHTML = `
    <div class="card-head"><span class="tag">${s.tag}</span>${s.li.length ? `<button class="more" aria-label="details" aria-expanded="false"><i></i></button>` : ''}</div>
    <h2>${s.h}</h2>
    <p>${s.p}</p>
    ${s.li.length ? `<ul>${s.li.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
    <div class="card-actions">
      <a class="btn btn-primary wa-link" target="_blank" rel="noopener" href="${WA}">${t.cta1}</a>
      ${STEPS[i].id === 'launch' ? `<button class="btn btn-ghost" id="launch-btn">${t.launchBtn}</button>` : i < 8 ? `<button class="btn btn-ghost" data-next>${t.cta2}</button>` : `<a class="btn btn-ghost" href="#package">${t.pkg.kicker}</a>`}
    </div>`;
  card.classList.add('in');
  card.classList.remove('open');
  $('.more', card)?.addEventListener('click', (ev) => { const o = card.classList.toggle('open'); ev.currentTarget.setAttribute('aria-expanded', o); });
  $('[data-next]', card)?.addEventListener('click', () => goStep(i + 1));
  $('#launch-btn', card)?.addEventListener('click', () => world.launchRocket(clock.elapsedTime, true));
}

function goStep(i) {
  const tour = $('#tour');
  window.scrollTo({ top: tour.offsetTop + i * innerHeight, behavior: 'smooth' });
}

// ---------- Three.js ----------
let world, renderer, camera, clock;
const canvas = $('#gl');
function webglOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

const DARK = new THREE.Color(0x060a1a), LIGHT = new THREE.Color(0xeef4f2);
const bg = new THREE.Color();
const DIR = new THREE.Vector3(1, 1.02, 1).normalize();
let baseH = 120;
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
let isMobile = false;

// zoom factor for each step (1 = whole island)
function stepFrame(i) {
  const id = STEPS[i].id;
  const spot = SPOTS[STEPS[i].spot];
  if (id === 'intro') return { pos: new THREE.Vector3(0, isMobile ? 46 : 40, 0), zoom: isMobile ? 0.62 : 0.5, dark: 1, shift: 0 };
  if (id === 'outro') return { pos: new THREE.Vector3(0, -4, 0), zoom: isMobile ? 0.8 : 0.72, dark: 1, shift: 0.55 };
  const z = id === 'hq' ? (isMobile ? 3.4 : 2.2) : (isMobile ? 4.0 : 2.75);
  return { pos: new THREE.Vector3(spot.x, spot.y + (id === 'hq' ? 4 : 3), spot.z), zoom: z, dark: 0, shift: 1 };
}

function resize() {
  const w = innerWidth, h = innerHeight;
  isMobile = w < 860;
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.6 : 2));
  renderer.setSize(w, h, false);
  const aspect = w / h;
  baseH = Math.max(118, 150 / aspect);
  camera.left = (-baseH * aspect) / 2; camera.right = (baseH * aspect) / 2;
  camera.top = baseH / 2; camera.bottom = -baseH / 2;
  camera.updateProjectionMatrix();
}

let pSmooth = 0;
const tmpV = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();
let glow;

function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;
  const tour = $('#tour');
  const vh = innerHeight;
  const raw = (scrollY - tour.offsetTop) / vh;
  const pTarget = clamp(raw, 0, STEPS.length - 1);
  pSmooth += (pTarget - pSmooth) * Math.min(1, dt * 3.2);
  const p = pSmooth;

  const i = Math.min(STEPS.length - 2, Math.floor(p));
  const f = p - i;
  const e = smooth(clamp((f - 0.12) / 0.76));
  const A = stepFrame(i), B = stepFrame(i + 1);
  const pos = A.pos.clone().lerp(B.pos, e);
  let zoom = Math.exp(lerp(Math.log(A.zoom), Math.log(B.zoom), e));
  if (A.zoom > 1.5 && B.zoom > 1.5) zoom *= 1 - 0.38 * Math.sin(Math.PI * e); // pull back while flying between districts
  const dark = lerp(A.dark, B.dark, smooth(clamp((f - 0.05) / 0.9)));
  const shift = lerp(A.shift, B.shift, e);

  // camera direction: slow drift in the dark intro, mouse parallax everywhere
  mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
  const az = Math.sin(t * 0.12) * 0.7 * dark + mouse.sx * 0.08;
  const dir = DIR.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), az);
  dir.y += mouse.sy * 0.06; dir.normalize();
  // after the tour: drift the planet back and dim it so the text panels read clearly
  const post = clamp((raw - (STEPS.length - 1)) / 1.2);
  zoom *= 1 - 0.35 * smooth(post);
  $('#veil').style.opacity = smooth(post).toFixed(3);
  camera.zoom = zoom;
  camera.position.copy(pos).addScaledVector(dir, 220);
  camera.lookAt(pos);
  camera.updateMatrixWorld();
  right.setFromMatrixColumn(camera.matrixWorld, 0);
  up.setFromMatrixColumn(camera.matrixWorld, 1);
  const visW = (camera.right - camera.left) / zoom, visH = (camera.top - camera.bottom) / zoom;
  const rtl = T[lang].dir === 'rtl';
  if (isMobile) camera.position.addScaledVector(up, -visH * 0.12 * shift);
  else camera.position.addScaledVector(right, (rtl ? 1 : -1) * visW * 0.19 * shift);
  camera.updateProjectionMatrix();

  // colours and light
  bg.copy(LIGHT).lerp(DARK, dark);
  renderer.setClearColor(bg, 1);
  world.stars.material.opacity = dark;
  world.stars.visible = dark > 0.01;
  world.hemi.intensity = lerp(1.45, 1.0, dark);
  glow.material.opacity = 0.75 * dark;
  glow.position.copy(pos).addScaledVector(dir, -160);
  document.body.style.setProperty('--dark', dark.toFixed(3));
  document.body.classList.toggle('is-dark', dark > 0.5);

  world.update(t);
  // the rocket fires by itself when you arrive at the launch pad
  const active = Math.round(p);
  if (STEPS[active].id === 'launch' && Math.abs(p - active) < 0.15) world.launchRocket(t);

  renderer.render(world.scene, camera);

  // ---------- UI sync ----------
  const intro = $('#intro');
  intro.style.opacity = clamp(1 - p * 2.2);
  intro.style.transform = `translateY(${-p * 80}px) scale(${1 + p * 0.12})`;
  intro.style.visibility = p > 0.5 ? 'hidden' : 'visible';

  const after = raw > STEPS.length - 1 + 0.35;
  const showCard = p > 0.55 && !after;
  $('#card').classList.toggle('show', showCard);
  if (showCard) renderCard(clamp(Math.round(p), 1, 8));
  $('#dock').classList.toggle('show', p > 0.55 && !after);
  const bar = $('.dock-bar b');
  if (bar) bar.style.transform = `scaleX(${clamp((p - 1) / 6)})`;
  $$('#dock button').forEach((b) => b.classList.toggle('on', +b.dataset.go === Math.round(p)));

  // hotspots
  const hsOn = dark < 0.3 && !after;
  $$('#hotspots .hs').forEach((b) => {
    const s = SPOTS[b.dataset.spot];
    tmpV.set(s.x, s.y + 11, s.z).project(camera);
    const x = (tmpV.x * 0.5 + 0.5) * innerWidth, y = (-tmpV.y * 0.5 + 0.5) * innerHeight;
    const onScreen = x > 20 && x < innerWidth - 20 && y > 70 && y < innerHeight - 90;
    const isCur = +b.dataset.go === Math.round(p);
    b.style.transform = `translate(${x}px, ${y}px)`;
    b.classList.toggle('show', hsOn && onScreen);
    b.classList.toggle('cur', isCur);
  });
  $('#scroll-hint').classList.toggle('hide', p > 0.15);
  requestAnimationFrame(frame);
}

async function boot() {
  const bar = $('#loader .lbar b'), pct = $('#loader .lpct');
  let shown = 0;
  const tick = (to) => { shown = to; bar.style.transform = `scaleX(${to / 100})`; pct.textContent = Math.round(to); };
  applyText();
  tick(10);
  if (!webglOK()) { document.body.classList.add('no-gl'); $('#loader').classList.add('done'); return; }
  try { await Promise.race([document.fonts.load('800 40px Alexandria'), new Promise((r) => setTimeout(r, 2500))]); await document.fonts.ready; } catch (e) {}
  tick(35);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  clock = new THREE.Clock();
  await new Promise((r) => setTimeout(r, 30));
  world = createWorld();
  tick(75);
  world.paintScreens(lang);
  // soft mint halo behind the planet for the dark scenes
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(146,197,180,0.55)'); g.addColorStop(0.45, 'rgba(146,197,180,0.16)'); g.addColorStop(1, 'rgba(146,197,180,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })();
  glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, transparent: true, depthWrite: false }));
  glow.scale.setScalar(300); world.scene.add(glow);
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (ev) => { mouse.x = ev.clientX / innerWidth - 0.5; mouse.y = ev.clientY / innerHeight - 0.5; });
  renderer.compile(world.scene, camera);
  tick(100);
  requestAnimationFrame(frame);
  setTimeout(() => $('#loader').classList.add('done'), 350);
}

$('#lang').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  try { localStorage.setItem('planet3d-lang', lang); } catch (e) {}
  applyText();
});

boot();
