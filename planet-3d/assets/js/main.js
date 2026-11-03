import { createScene } from './scene.js?v=10';
import { CHAPTERS, T, WA, EMAIL } from './content.js?v=10';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

let lang = 'ar';
try { const s = localStorage.getItem('planet3d-lang'); if (s === 'ar' || s === 'en') lang = s; } catch (e) {}
if (new URLSearchParams(location.search).get('lang') === 'en') lang = 'en';
const L = () => T[lang];
const mobile = matchMedia('(max-width: 860px), (pointer: coarse)').matches;

// ---------- text scramble ----------
const GLYPH = { ar: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي', en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };
const NUMS = '0123456789/#*+=';
const running = new WeakMap();
function scramble(el, text, dur = 700) {
  if (!el) return;
  const prev = running.get(el); if (prev) cancelAnimationFrame(prev);
  const pool = (/[؀-ۿ]/.test(text) ? GLYPH.ar : GLYPH.en) + NUMS;
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

// ---------- ambient sound, generated in the browser ----------
const sound = {
  ctx: null, on: false, master: null,
  start() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const ctx = (this.ctx = new C());
      this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
      const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.7;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = ctx.createGain(); lg.gain.value = 320; lfo.connect(lg); lg.connect(bp.frequency);
      const wg = ctx.createGain(); wg.gain.value = 0.16;
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
  whoosh() {
    if (!this.on) return; const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(300, ctx.currentTime); f.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.6);
    const g = ctx.createGain(); g.gain.value = 0.25; s.connect(f); f.connect(g); g.connect(this.master); s.start();
  },
};

// ---------- scroll layout ----------
let starts = [], total = 0;
function computeTrack() {
  starts = []; total = 0;
  CHAPTERS.forEach((c) => { starts.push(total); total += c.len; });
  $('#track').style.height = `${(total + 1) * 100}vh`;
}
function chapterAt(s) { for (let i = CHAPTERS.length - 1; i >= 0; i--) if (s >= starts[i]) return i; return 0; }
function goChapter(i) { window.scrollTo({ top: (starts[i] + (i ? 0.3 : 0)) * innerHeight, behavior: 'smooth' }); }

// ---------- text ----------
let lastPanel = '';
function applyText() {
  const t = L();
  document.documentElement.lang = lang; document.documentElement.dir = t.dir; document.title = t.title;
  $$('[data-t]').forEach((el) => {
    const v = el.dataset.t.split('.').reduce((o, k) => (o ? o[k] : undefined), t);
    if (typeof v === 'string') el.textContent = v;
  });
  $('#hero-h').innerHTML = t.hero.h.split('\n').map((l) => `<span>${l}</span>`).join('');
  $('#sound span').textContent = t.sound[sound.on ? 1 : 0];
  $('#chapters').innerHTML = CHAPTERS.map((c, i) => `<button data-ch="${i}"><i>0${i}</i><span>${t.chapters[c.id]}</span></button>`).join('');
  $$('#chapters button').forEach((b) => b.addEventListener('click', () => goChapter(+b.dataset.ch)));
  $('#menu-links').innerHTML = CHAPTERS.map((c, i) => `<a href="#" data-ch="${i}"><i>0${i}</i><span>${t.chapters[c.id]}</span></a>`).join('');
  $$('#menu-links a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(false); goChapter(+a.dataset.ch); }));
  $('#faq').innerHTML = t.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  $('#manifesto').innerHTML = t.manifesto.map((l) => `<p><span>${l}</span></p>`).join('');
  const c = t.contact;
  $('#inc').innerHTML = c.inc.map((x) => `<li>${x}</li>`).join('');
  const waText = encodeURIComponent(lang === 'ar' ? 'أهلاً بلانت، عايز أبدأ مشروع' : 'Hi Planet, I would like to start a project');
  $('#links').innerHTML = [[c.links[0], `${WA}?text=${waText}`], [c.links[1], `mailto:${EMAIL}`], [c.links[2], 'https://web.theplanetco.com/']]
    .map(([n, h]) => `<a href="${h}" ${h.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}><b>[</b><span data-hover>${n}</span><b>]</b></a>`).join('');
  $$('.wa-link').forEach((a) => (a.href = `${WA}?text=${waText}`));
  $$('.mail-link').forEach((a) => (a.href = `mailto:${EMAIL}`));
  lastPanel = '';
}

function showPanel(kind, i) {
  const key = kind + i + lang;
  if (key === lastPanel) return;
  lastPanel = key;
  const t = L();
  const p = $('#panel');
  p.classList.remove('in'); void p.offsetWidth; p.classList.add('in');
  let tags;
  if (kind === 'services') {
    const s = t.services[i];
    p.innerHTML = `<div class="p-meta"><span class="mono">0${i + 1} / 0${t.services.length}</span><span class="mono">${s.code}</span></div>
      <h2 data-s="${s.name}">${s.name}</h2><p class="lead">${s.line}</p>
      <ul>${s.items.map((x, k) => `<li><i class="mono">${String(k + 1).padStart(2, '0')}</i><span>${x}</span></li>`).join('')}</ul>
      <a class="bracket wa-link" target="_blank" rel="noopener" href="${WA}"><b>[</b><span>${lang === 'ar' ? 'اطلب الخدمة' : 'Ask for this'}</span><b>]</b></a>`;
    tags = [s.code + '.SYS', 'PLANET // 0' + (i + 1), (lang === 'ar' ? 'خدمة ' : 'SERVICE ') + '0' + (i + 1)];
  } else {
    const w = t.works[i];
    p.innerHTML = `<div class="p-meta"><span class="mono">${w.code}</span><span class="mono">0${i + 1} / 03</span></div>
      <h2 data-s="${w.name}">${w.name}</h2><p class="type">${w.type}</p><p class="lead">${w.line}</p>
      <a class="bracket" target="_blank" rel="noopener" href="${w.url}"><b>[</b><span>${t.open}</span><b>]</b></a>`;
    tags = [w.code, w.url.replace('https://', '').replace(/\/$/, ''), 'LIVE ●'];
  }
  if (kind === 'services') $$('.wa-link', p).forEach((a) => (a.href = $('.wa-link').href));
  $$('.tag-float').forEach((el, k) => scramble(el, tags[k] || '', 900));
  scramble($('h2', p), $('h2', p).dataset.s, 650);
  sound.blip(660, 0.09, 0.04);
}

function toggleMenu(open) {
  const m = $('#menu');
  const o = open ?? !m.classList.contains('open');
  m.classList.toggle('open', o);
  document.body.classList.toggle('menu-open', o);
  $('#menu-btn span').textContent = o ? L().close : L().menu;
  sound.blip(o ? 520 : 400, 0.1, 0.04);
}

// ---------- boot ----------
async function boot() {
  computeTrack();
  applyText();
  const canvas = $('#gl');
  let ok = true;
  try { ok = !!document.createElement('canvas').getContext('webgl2'); } catch (e) { ok = false; }
  if (!ok) { document.body.classList.add('no-gl'); $('#loader').classList.add('done'); return; }

  const loaderTxt = $('#loader .l-txt'), lpct = $('#loader .l-pct');
  let fake = 0;
  const li = setInterval(() => { fake = Math.min(94, fake + Math.random() * 9); lpct.textContent = String(Math.round(fake)).padStart(3, '0'); scramble(loaderTxt, L().loading, 400); }, 260);

  try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}
  const S = createScene(canvas, { mobile });
  L().works.forEach((w, i) => S.addWorkBlock(i, w.img));
  const resize = () => S.resize(innerWidth, innerHeight);
  resize(); addEventListener('resize', resize);
  await new Promise((r) => setTimeout(r, 50));
  try { S.compile(); } catch (e) {}

  const st = { chapter: 0, local: 0, glitch: 0, mx: 0, my: 0, pointer: null, w: innerWidth, h: innerHeight, side: 0 };
  const mouse = { x: 0, y: 0, on: false };
  const cursor = $('#cursor');
  addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true;
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  document.addEventListener('mouseleave', () => (mouse.on = false));
  addEventListener('pointerdown', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; });

  let sSmooth = scrollY / innerHeight, lastCh = -1, lastMani = -1, hoverWork = -1, wasHover = false;
  const hudSvg = $('#hud-lines'), hudNums = $('#hud-nums');
  canvas.addEventListener('click', () => {
    if (st.chapter === 2 && hoverWork >= 0) { sound.blip(990, 0.12, 0.05); window.open(L().works[hoverWork].url, '_blank', 'noopener'); }
  });

  let lastT = performance.now();
  function loop() {
    const now = performance.now(), dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    st.w = innerWidth; st.h = innerHeight;
    const target = scrollY / innerHeight;
    sSmooth += (target - sSmooth) * (1 - Math.exp(-dt * 5.5));
    if (Math.abs(target - sSmooth) < 0.0005) sSmooth = target;
    const s = clamp(sSmooth, 0, total - 0.0001);
    const ch = chapterAt(s);
    const local = clamp((s - starts[ch]) / CHAPTERS[ch].len);
    let g = 0;
    for (let i = 1; i < starts.length; i++) g = Math.max(g, 1 - Math.abs(s - starts[i]) / 0.32);
    g = Math.pow(clamp(g), 1.5);
    st.chapter = ch; st.local = local; st.glitch = g;
    const km = 1 - Math.exp(-dt * 3.5);
    st.mx += ((mouse.on ? mouse.x / st.w - 0.5 : 0) - st.mx) * km;
    st.my += ((mouse.on ? mouse.y / st.h - 0.5 : 0) - st.my) * km;
    st.pointer = mouse.on && !document.body.classList.contains('menu-open') ? { x: (mouse.x / st.w) * 2 - 1, y: -(mouse.y / st.h) * 2 + 1 } : null;
    st.side = innerWidth < 860 ? 0 : L().dir === 'rtl' ? -1 : 1;

    const hud = S.frame(st);

    if (ch !== lastCh) {
      lastCh = ch;
      document.body.dataset.ch = CHAPTERS[ch].id;
      $$('#chapters button').forEach((b, i) => b.classList.toggle('on', i === ch));
      sound.whoosh();
      if (CHAPTERS[ch].id === 'contact') scramble($('#contact-h'), L().contact.h, 900);
    }

    let svg = '';
    if (ch === 0 && hud.labels.length && g < 0.3) {
      const pts = hud.labels;
      hudNums.innerHTML = pts.map((p) => `<span style="transform:translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)">${p.id}</span>`).join('');
      for (let i = 1; i < pts.length; i++) svg += `<line x1="${pts[i - 1].x}" y1="${pts[i - 1].y}" x2="${pts[i].x}" y2="${pts[i].y}"/>`;
      pts.forEach((p) => (svg += `<circle cx="${p.x}" cy="${p.y}" r="2.4"/>`));
    } else hudNums.innerHTML = '';

    const panelOn = (ch === 1 || ch === 2) && g < 0.45;
    $('#panel').classList.toggle('show', panelOn);
    $('#tags').classList.toggle('show', panelOn);
    if (ch === 1) showPanel('services', Math.round(local * 4));
    if (ch === 2) showPanel('works', Math.round(local * 2));
    if (panelOn && hud.anchors) {
      const tags = $$('.tag-float');
      const dir = L().dir === 'rtl' ? 1 : -1;
      hud.anchors.forEach((a, i) => {
        const tg = tags[i]; if (!tg) return;
        const ox = (i === 0 ? 60 : i === 1 ? 110 : -120) * dir * (mobile ? 0.5 : 1), oy = i === 0 ? -36 : i === 1 ? 24 : 40;
        tg.style.transform = `translate(${(a.x + ox).toFixed(1)}px, ${(a.y + oy).toFixed(1)}px)`;
        svg += `<polyline points="${a.x},${a.y} ${a.x + ox * 0.45},${a.y + oy} ${a.x + ox},${a.y + oy}"/><circle cx="${a.x}" cy="${a.y}" r="2.6"/>`;
      });
    }
    hudSvg.innerHTML = svg;

    hoverWork = hud.hoverWork;
    if (hud.hovered !== wasHover) { wasHover = hud.hovered; if (wasHover) sound.blip(1200, 0.05, 0.03); }
    cursor.classList.toggle('big', hud.hovered);
    cursor.dataset.label = ch === 2 && hud.hovered ? L().open : '';
    canvas.style.cursor = ch === 2 && hud.hovered ? 'pointer' : '';

    if (ch === 3) {
      const n = Math.floor(clamp((local - 0.1) / 0.6) * L().manifesto.length + 0.0001);
      if (n !== lastMani) {
        $$('#manifesto p').forEach((p, i) => {
          const on = i < n, was = p.classList.contains('on');
          p.classList.toggle('on', on);
          if (on && !was) { scramble($('span', p), L().manifesto[i], 800); sound.blip(440 + i * 110, 0.12, 0.04); }
        });
        lastMani = n;
      }
    } else if (lastMani !== -1) { lastMani = -1; $$('#manifesto p').forEach((p) => p.classList.remove('on')); }

    document.body.style.setProperty('--hero', (ch === 0 ? 1 - clamp(local * 2.2) : 0).toFixed(3));
    $('#scroll-hint').classList.toggle('hide', s > 0.12);
    $('#progress b').style.transform = `scaleY(${(s / total).toFixed(4)})`;
    requestAnimationFrame(loop);
  }

  clearInterval(li); lpct.textContent = '100';
  requestAnimationFrame(loop);
  setTimeout(() => { $('#loader').classList.add('done'); document.body.classList.add('ready'); scramble($('#mission'), L().mission, 1400); }, 450);
}

// ---------- controls ----------
$('#lang').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  try { localStorage.setItem('planet3d-lang', lang); } catch (e) {}
  applyText();
  scramble($('#mission'), L().mission, 900);
});
$('#sound').addEventListener('click', () => {
  if (sound.on) sound.stop(); else sound.start();
  $('#sound span').textContent = L().sound[sound.on ? 1 : 0];
  $('#sound').classList.toggle('on', sound.on);
});
$('#menu-btn').addEventListener('click', () => toggleMenu());
addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
document.addEventListener('pointerover', (e) => {
  const el = e.target.closest('[data-hover]');
  if (el && !el._busy) { el._busy = true; scramble(el, el.textContent, 380); setTimeout(() => (el._busy = false), 420); sound.blip(1500, 0.03, 0.02); }
});

boot();
