import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createWorld, SPOTS, TOP, C } from './world.js?v=11';
import { STEPS, T, WA, EMAIL } from './content.js?v=11';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

// ---------- text scramble (letters shuffle before they settle) ----------
const GLYPH = { ar: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };
const NUMS = '0123456789/#*+=';
const running = new WeakMap();
function scramble(el, text, dur = 700) {
  if (!el) return;
  const prev = running.get(el); if (prev) cancelAnimationFrame(prev);
  const pool = (/[\u0600-\u06FF]/.test(text) ? GLYPH.ar : GLYPH.en) + NUMS;
  const start = performance.now();
  const step = (now) => {
    const k = clamp((now - start) / dur);
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ' || ch === '\n') { out += ch; continue; }
      out += i / text.length < k ? ch : pool[(Math.random() * pool.length) | 0];
    }
    el.textContent = out;
    if (k < 1) running.set(el, requestAnimationFrame(step)); else running.delete(el);
  };
  running.set(el, requestAnimationFrame(step));
}

// ---------- ambient sound, generated in the browser (off until the visitor turns it on) ----------
const sound = {
  ctx: null, on: false, master: null,
  start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
      const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.7;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 320; lfo.connect(lg); lg.connect(bp.frequency);
      const wg = ctx.createGain(); wg.gain.value = 0.12;
      noise.connect(bp); bp.connect(wg); wg.connect(this.master); noise.start(); lfo.start();
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(this.master);
      [110, 164.8, 220.5, 329.6].forEach((f, i) => { const o = ctx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 6; const g = ctx.createGain(); g.gain.value = 0.035; o.connect(g); g.connect(lp); o.start(); });
    }
    this.ctx.resume(); this.on = true;
    this.master.gain.setTargetAtTime(0.6, this.ctx.currentTime, 0.8);
  },
  stop() { if (!this.ctx) return; this.on = false; this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3); },
  blip(freq = 880, len = 0.08, vol = 0.05) {
    if (!this.on) return; const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(freq, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + len);
    g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + len); o.connect(g); g.connect(this.master); o.start(); o.stop(ctx.currentTime + len + 0.02);
  },
  thump() {
    if (!this.on) return; const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0.35, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5); o.connect(g); g.connect(this.master); o.start(); o.stop(ctx.currentTime + 0.55);
  },
  whoosh() {
    if (!this.on) return; const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(300, ctx.currentTime); f.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.6);
    const g = ctx.createGain(); g.gain.value = 0.2; s.connect(f); f.connect(g); g.connect(this.master); s.start();
  },
};

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
  scramble($('h2', card), s.h, 650);
  scramble($('.tag', card), s.tag, 500);
  $('.more', card)?.addEventListener('click', (ev) => { const o = card.classList.toggle('open'); ev.currentTarget.setAttribute('aria-expanded', o); });
  $('[data-next]', card)?.addEventListener('click', () => goStep(i + 1));
  $('#launch-btn', card)?.addEventListener('click', () => world.launchRocket(clock.elapsedTime, true));
}

function goStep(i) {
  const tour = $('#tour');
  window.scrollTo({ top: tour.offsetTop + i * innerHeight, behavior: 'smooth' });
}

// ---------- Three.js ----------
let world, renderer, camera, clock, composer, bloom, finalPass;
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TOP);
const pointer = { x: 0, y: 0, on: false, moved: false };
let hovered = null, hoverPt = new THREE.Vector3(), hoverKey = null, glitch = 0, lastActive = -1;
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
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); finalPass.uniforms.uRes.value.set(w, h); }
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
  // camera follows the mouse on a soft spring, so it overshoots a little and settles
  mouse.vx = (mouse.vx || 0) + ((mouse.x - mouse.sx) * 9 - (mouse.vx || 0) * 4.2) * dt; mouse.sx += mouse.vx * dt;
  mouse.vy = (mouse.vy || 0) + ((mouse.y - mouse.sy) * 9 - (mouse.vy || 0) * 4.2) * dt; mouse.sy += mouse.vy * dt;
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

  // ---------- hover: raycast the buildings, lift what is under the cursor ----------
  hovered = null; hoverKey = null;
  camera.updateMatrixWorld();
  if (pointer.on && !isTouch) {
    ndc.set(pointer.x / innerWidth * 2 - 1, -(pointer.y / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(world.pickables, true)[0];
    if (hit) {
      let o = hit.object; while (o && !o.userData.spring) o = o.parent;
      if (o) { hovered = o.userData.spring; hoverKey = hovered.key; hoverPt.copy(hit.point); }
    }
    const gp = ray.ray.intersectPlane(ground, tmpV);
    world.setCursor(gp && Math.hypot(gp.x, gp.z) < 64 ? gp : null);
    // anywhere on a district's plaza counts as hovering that district
    if (!hoverKey && gp) for (const k of ICON_KEYS) if (Math.hypot(gp.x - SPOTS[k].x, gp.z - SPOTS[k].z) < (k === 'hq' ? 11 : 12.5)) { hoverKey = k; hoverPt.copy(gp); break; }
  } else world.setCursor(null);
  for (const e of world.springs) if (e.kind !== 'tree') e.ty = e === hovered ? 2.2 : hoverKey && e.key === hoverKey ? 0.7 : 0;

  world.update(t, dt);
  // the rocket fires by itself when you arrive at the launch pad
  const active = Math.round(p);
  if (STEPS[active].id === 'launch' && Math.abs(p - active) < 0.15) world.launchRocket(t);
  if (active !== lastActive) { if (lastActive >= 0) { glitch = 1; sound.whoosh(); } lastActive = active; }
  glitch = Math.max(0, glitch - dt * 2.4);

  bloom.strength = lerp(0.06, 0.28, dark);
  bloom.threshold = 0.97;
  finalPass.uniforms.uTime.value = t;
  finalPass.uniforms.uGlitch.value = glitch * glitch;
  composer.render();
  updateHoverUI();

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

// HUD label that follows the hovered building, joined to it with a thin line
const ICON_KEYS = ['hq', 'web', 'ads', 'content', 'brand', 'launch', 'data'];
let lastHoverKey = null;
function updateHoverUI() {
  const tag = $('#htag'), svgEl = $('#hud-lines'), cur = $('#cursor');
  cur.style.transform = `translate(${pointer.x}px, ${pointer.y}px)`;
  const on = !!hoverKey && ICON_KEYS.includes(hoverKey);
  cur.classList.toggle('big', on);
  canvas.style.cursor = on ? 'pointer' : '';
  if (!on) { tag.classList.remove('show'); svgEl.innerHTML = ''; lastHoverKey = null; return; }
  tmpV.copy(hoverPt).project(camera);
  const ax = (tmpV.x * 0.5 + 0.5) * innerWidth, ay = (-tmpV.y * 0.5 + 0.5) * innerHeight;
  const rtl = T[lang].dir === 'rtl';
  const tx = pointer.x + (rtl ? -46 : 46), ty = pointer.y - 54;
  tag.style.transform = `translate(${tx}px, ${ty}px)`;
  tag.classList.add('show');
  tag.classList.toggle('flip', rtl);
  svgEl.innerHTML = `<circle cx="${ax}" cy="${ay}" r="3"/><polyline points="${ax},${ay} ${pointer.x},${pointer.y} ${tx},${ty}"/>`;
  if (hoverKey !== lastHoverKey) {
    lastHoverKey = hoverKey;
    const idx = ICON_KEYS.indexOf(hoverKey);
    scramble($('b', tag), T[lang].dock[hoverKey], 500);
    scramble($('i', tag), `0${idx} // ${hoverKey.toUpperCase()}`, 400);
    cur.dataset.label = lang === 'ar' ? 'ادخل' : 'ENTER';
    sound.blip(1100, 0.05, 0.03);
  }
}

function setupPost() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(world.scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.3, 0.55, 0.9);
  composer.addPass(bloom);
  finalPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uGlitch: { value: 0 }, uCA: { value: 0.0016 }, uRes: { value: new THREE.Vector2(1, 1) }, uGrain: { value: 0.022 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime, uGlitch, uCA, uGrain; uniform vec2 uRes; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
      void main(){
        vec2 uv = vUv; float g = uGlitch;
        float t = floor(uTime * 24.);
        float rows = mix(10., 46., h(vec2(t, 1.)));
        float by = floor(uv.y * rows);
        if (h(vec2(by, t)) < g * 0.75) uv.x += (h(vec2(by * 1.3, t + 3.)) - .5) * .28 * g;
        float bx = floor(uv.x * 14.);
        if (h(vec2(bx, by + t)) < g * .18) uv.y += (h(vec2(bx, t)) - .5) * .08 * g;
        vec2 d = uv - .5;
        float ca = uCA * (.4 + dot(d, d) * 2.4) + g * .03;
        vec3 c;
        c.r = texture2D(tDiffuse, uv + d * ca * 1.2 + vec2(g * .01, 0.)).r;
        c.g = texture2D(tDiffuse, uv).g;
        c.b = texture2D(tDiffuse, uv - d * ca * 1.2 - vec2(g * .01, 0.)).b;
        float l = dot(c, vec3(.299,.587,.114));
        c = mix(c, vec3(l) * 1.05 + .06, g * .4);
        c += (h(vUv * uRes + fract(uTime) * 91.) - .5) * uGrain;
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  composer.addPass(finalPass);
  composer.addPass(new OutputPass());
}

const isTouch = matchMedia('(pointer: coarse)').matches;
// the scroll sections sit above the canvas, so treat everything except real UI as the scene
const onScene = (el) => !el.closest('a, button, input, #card, #dock, header, .panel, #intro');

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
  setupPost();
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (ev) => {
    mouse.x = ev.clientX / innerWidth - 0.5; mouse.y = ev.clientY / innerHeight - 0.5;
    pointer.x = ev.clientX; pointer.y = ev.clientY; pointer.on = onScene(ev.target);
  });
  document.addEventListener('pointerleave', () => (pointer.on = false));
  // click on the planet: a shockwave runs across the ground and everything near it jumps
  addEventListener('pointerdown', (ev) => {
    if (!onScene(ev.target) || $('#veil').style.opacity > 0.5) return;
    ndc.set(ev.clientX / innerWidth * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const gp = ray.ray.intersectPlane(ground, new THREE.Vector3());
    if (!gp || Math.hypot(gp.x, gp.z) > 66) return;
    world.shockwave(gp, clock.elapsedTime, 1);
    glitch = Math.max(glitch, 0.35);
    sound.thump();
    if (!isTouch && hoverKey && ICON_KEYS.includes(hoverKey)) {
      const i = STEPS.findIndex((s, k) => k > 0 && k < 8 && s.spot === hoverKey);
      if (i > 0 && i !== Math.round(pSmooth)) setTimeout(() => goStep(i), 260);
    }
  });
  renderer.compile(world.scene, camera);
  tick(100);
  requestAnimationFrame(frame);
  setTimeout(() => $('#loader').classList.add('done'), 350);
}

$('#sound').addEventListener('click', () => {
  if (sound.on) sound.stop(); else { sound.start(); sound.blip(880, 0.1, 0.05); }
  $('#sound').classList.toggle('on', sound.on);
});

$('#lang').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  try { localStorage.setItem('planet3d-lang', lang); } catch (e) {}
  applyText();
});

boot();
