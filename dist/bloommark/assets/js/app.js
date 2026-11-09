/* BloomMark IP — interactions */
(() => {
'use strict';
const C = window.BM_CONTENT, L = window.BM_LOGO;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasG = typeof gsap !== 'undefined';
if (hasG) gsap.registerPlugin(ScrollTrigger);

const LANGS = ['ar', 'en', 'fr', 'zh'];
let lang = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(q)) return q;
  try { const s = localStorage.getItem('bm-lang'); if (LANGS.includes(s)) return s; } catch (e) {}
  return 'ar';
})();
let T = C[lang];
const get = (path, o = T) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

/* ---------- icons ---------- */
const ICO = {
  tm: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 16.5v-9h3.2a2.6 2.6 0 010 5.2H9.5M12.6 12.7l2.6 3.8"/></svg>',
  pt: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z"/><path d="M12 7v4M10 9h4"/></svg>',
  ds: '<svg viewBox="0 0 24 24"><path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/></svg>',
  um: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"/></svg>',
  cr: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9.6a3.6 3.6 0 100 4.8"/></svg>',
  lt: '<svg viewBox="0 0 24 24"><path d="M12 3v18M7 21h10M5 7h14M12 5l0 0"/><path d="M5 7l-3 6a3 3 0 006 0zM19 7l-3 6a3 3 0 006 0z"/></svg>'
};
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
const INFO = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const pad = n => String(n).padStart(2, '0');

/* ---------- logo builder ---------- */
const MONO_VB = '300 150 2250 1720';
function mono(svg, { parts = ['B', 'M'], vb = MONO_VB, grad = false } = {}) {
  if (!svg) return;
  svg.setAttribute('viewBox', vb);
  svg.innerHTML = '';
  if (grad) {
    svg.insertAdjacentHTML('beforeend', '<defs><linearGradient id="monoGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".10"/><stop offset=".55" stop-color="#ffffff" stop-opacity=".02"/><stop offset="1" stop-color="#ffffff" stop-opacity=".07"/></linearGradient><linearGradient id="monoStroke" gradientUnits="userSpaceOnUse" x1="300" y1="150" x2="2550" y2="1870"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#e8dcc3" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/><animateTransform attributeName="gradientTransform" type="translate" values="-2600 -2000;2600 2000" dur="7s" repeatCount="indefinite"/></linearGradient></defs>');
  }
  parts.forEach(p => { const el = document.createElementNS(NS, 'path'); el.setAttribute('d', L[p]); el.setAttribute('fill-rule', 'evenodd'); el.dataset.part = p; svg.appendChild(el); });
}
function fullLogo(svg) {
  mono(svg, { parts: ['B', 'M', 'script'], vb: L.vb });
  const t = document.createElementNS(NS, 'text');
  t.setAttribute('x', '150'); t.setAttribute('y', '1612'); t.setAttribute('font-size', '58'); t.setAttribute('letter-spacing', '38');
  t.setAttribute('font-family', 'Manrope, Helvetica, sans-serif'); t.textContent = 'IP PROTECTION';
  svg.appendChild(t);
}
mono($('#brandMark'));
mono($('#heroMono'), { grad: true });
mono($('#chairMark'));
mono($('#sigMark'), { parts: ['script'], vb: '600 1230 1150 230' });
fullLogo($('#footMark'));

/* ---------- loader ---------- */
const loaderSvg = $('#loaderMark');
mono(loaderSvg, { parts: ['B', 'M', 'script'], vb: '300 150 2250 1500' });
function runLoader(done) {
  const paths = $$('path', loaderSvg);
  if (!hasG || reduce) { $('#loader').remove(); document.body.classList.remove('is-loading'); done(); return; }
  paths.forEach(p => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
  const tl = gsap.timeline({ onComplete: () => { $('#loader').remove(); document.body.classList.remove('is-loading'); } });
  tl.to(paths.slice(0, 2), { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: .15 })
    .to('#loaderBar', { width: '100%', duration: 1.9, ease: 'power1.inOut' }, 0)
    .to(paths[2], { strokeDashoffset: 0, duration: .9, ease: 'power1.inOut' }, 1)
    .to(paths, { fill: '#f4f2ee', strokeOpacity: 0, duration: .6 }, 1.55)
    .to('.loader-txt', { opacity: 0, duration: .3 }, 2.1)
    .add(done, 2.1)
    .to('#loader', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 2.2);
}

/* ---------- render language ---------- */
function splitWords(el) {
  const txt = el.textContent.trim();
  const units = lang === 'zh' ? [...txt] : txt.split(/\s+/);
  el.innerHTML = units.map(u => `<span class="w"><span>${u}</span></span>`).join(lang === 'zh' ? '' : ' ');
}
function render() {
  const H = document.documentElement;
  H.lang = T.htmlLang; H.dir = T.dir;
  document.title = T.meta.title;
  $('meta[name=description]').setAttribute('content', T.meta.desc);
  if (lang === 'zh') { const z = $('#zhFonts'); if (z.dataset.href) { z.href = z.dataset.href; z.media = 'all'; z.removeAttribute('data-href'); } }
  $$('[data-t]').forEach(el => { const v = get(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
  const hs = $('#heroSub'); const hu = lang === 'zh' ? [...T.hero.sub] : T.hero.sub.split(/\s+/);
  hs.innerHTML = hu.map(u => `<span class="sw">${u}</span>`).join(lang === 'zh' ? '' : ' ');
  $('#langCur').textContent = T.label;
  $$('[data-lang]').forEach(b => b.classList.toggle('cur', b.dataset.lang === lang));

  // stats
  $('#stats').innerHTML = T.stats.map(s => `<div class="stat"><b><span class="cnt" data-n="${s.n}">${s.n}</span>${s.suf ? `<sup>${s.suf}</sup>` : ''}</b><span>${s.l}</span></div>`).join('');
  // marquee
  const mq = T.marquee.map(m => `<span>${m}</span>`).join('');
  $('#marquee').innerHTML = mq + mq;
  // firm
  const st = $('#statement');
  const units = lang === 'zh' ? [...T.firm.statement] : T.firm.statement.split(/\s+/);
  st.innerHTML = units.map(u => `<span class="sw">${u}</span>`).join(lang === 'zh' ? '' : ' ');
  $('#firmCols').innerHTML = T.firm.cols.map((c, i) => `<div class="firm-col fade"><span class="n">${pad(i + 1)}</span><h3>${c.h}</h3><p>${c.p}</p></div>`).join('');
  // practice
  $('#bento').innerHTML = T.practice.items.map((it, i) => `
    <button class="card fade" data-i="${i}">
      <span class="card-num">${pad(i + 1)}</span>
      <span class="card-ico">${ICO[it.k]}</span>
      <h3>${it.h}</h3><p>${it.p}</p>
      <span class="card-more">${T.practice.more}${ARROW}</span>
      <span class="card-big">${['TM', 'P', 'D', 'U', '©', '§'][i]}</span>
    </button>`).join('');
  // process
  const steps = $('#steps');
  $$('.step', steps).forEach(s => s.remove());
  steps.insertAdjacentHTML('beforeend', T.process.steps.map((s, i) => `<li class="step"><div class="step-card"><span class="sn">${pad(i + 1)}</span><h3>${s.h}</h3><p>${s.p}</p></div></li>`).join(''));
  // egypt
  $('#terms').innerHTML = T.egypt.terms.map(t => `<div class="term fade"><div class="term-n"><b class="cnt" data-n="${t.n}">${t.n}</b><small>${t.u}</small></div><h4>${t.h}</h4><p>${t.p}</p></div>`).join('');
  $('#treaties').innerHTML = T.egypt.treaties.map(t => `<li>${t}</li>`).join('');
  // network
  $('#netPts').innerHTML = T.network.points.map(p => `<li>${CHECK}<span>${p}</span></li>`).join('');
  $('#globeLabel').textContent = T.network.cairo;
  // requirements
  const tabs = $('#tabs');
  $$('.tab', tabs).forEach(t => t.remove());
  tabs.insertAdjacentHTML('beforeend', T.req.tabs.map((t, i) => `<button class="tab" role="tab" data-i="${i}">${t.h}</button>`).join(''));
  setTab(curTab, false);
  // values
  $('#values-grid').innerHTML = T.values.items.map((v, i) => `<div class="val fade"><span class="vn">${pad(i + 1)}</span><h3>${v.h}</h3><p>${v.p}</p></div>`).join('');
  // news
  $('#news').innerHTML = T.insights.items.map(n => `<a class="nw fade" href="https://www.linkedin.com/in/bloommark-ip-ltd-mena-region-5b4b47244/recent-activity/all/" target="_blank" rel="noopener"><span class="nw-tag">${n.tag}</span><h3>${n.h}</h3><p>${n.p}</p></a>`).join('');
  // contact
  $('#mails').innerHTML = T.contact.mails.map(m => `<li><span>${m.l}</span><a href="mailto:${m.e}" dir="ltr">${m.e}</a></li>`).join('');
  $('#svcSelect').innerHTML = T.practice.items.map(it => `<option>${it.h}</option>`).join('');
  // headings split
  $$('.split').forEach(splitWords);
  // rotator
  startRotator();
  try { localStorage.setItem('bm-lang', lang); } catch (e) {}
  const u = new URL(location.href); u.searchParams.set('lang', lang); history.replaceState(null, '', u);
}

/* ---------- rotating word (blur-in, 21st "flip words") ---------- */
let rotTimer, rotIdx = 0;
function startRotator() {
  clearInterval(rotTimer);
  const el = $('#rot'); const words = T.hero.rotate; rotIdx = 0;
  const show = w => {
    if (lang === 'ar') el.innerHTML = `<span class="ch">${w}</span>`;
    else el.innerHTML = [...w].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    if (hasG && !reduce) gsap.fromTo($$('.ch', el), { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7, stagger: .03, ease: 'power3.out' });
  };
  show(words[0]);
  rotTimer = setInterval(() => {
    const chs = $$('.ch', el);
    const next = () => { rotIdx = (rotIdx + 1) % words.length; show(words[rotIdx]); };
    if (hasG && !reduce) gsap.to(chs, { opacity: 0, y: -24, filter: 'blur(8px)', duration: .4, stagger: .015, ease: 'power2.in', onComplete: next });
    else next();
  }, 2800);
}

/* ---------- tabs ---------- */
let curTab = 0;
function setTab(i, anim = true) {
  curTab = i;
  const tabs = $$('.tab'); tabs.forEach((t, k) => t.classList.toggle('on', k === i));
  const on = tabs[i]; const ind = $('#tabInd');
  if (on) { ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px'; }
  const tab = T.req.tabs[i];
  const P = $('#tabPanel');
  P.innerHTML = tab.groups.map(g => `<div class="req-card">${g.t ? `<h4>${g.t}</h4>` : `<h4>${tab.h}</h4>`}<ul>${g.list.map(x => `<li><i>${CHECK}</i><span>${x}</span></li>`).join('')}</ul></div>`).join('') + (tab.note ? `<div class="req-note">${INFO}<span>${tab.note}</span></div>` : '');
  if (anim && hasG && !reduce) gsap.from($$('.req-card, .req-note', P), { opacity: 0, y: 20, duration: .6, stagger: .08, ease: 'power3.out' });
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) setTab(+b.dataset.i); });
const fixInd = () => { const on = $$('.tab')[curTab], ind = $('#tabInd'); if (on) { ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px'; } };
addEventListener('resize', fixInd);
if (document.fonts) document.fonts.ready.then(fixInd);
setTimeout(fixInd, 1500);

/* ---------- drawer ---------- */
const drawer = $('#drawer');
function openDrawer(i) {
  const it = T.practice.items[i];
  $('#drawerBody').innerHTML = `<div class="dw-ico">${ICO[it.k]}</div><p class="kicker">${T.practice.more}</p><h3 class="dw-h">${it.h}</h3><p class="dw-p">${it.p}</p><p class="dw-p">${it.d}</p><ul class="dw-list">${it.list.map((x, k) => `<li><b>${pad(k + 1)}</b><span>${x}</span></li>`).join('')}</ul><a href="#contact" class="btn btn-shine dw-cta" data-close data-svc="${i}"><span>${T.nav.cta}</span><svg viewBox="0 0 24 24" class="arr"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>`;
  drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
  lenis && lenis.stop();
  if (hasG && !reduce) gsap.from($$('#drawerBody > *, .dw-list li'), { opacity: 0, x: lang === 'ar' ? -30 : 30, duration: .6, stagger: .03, delay: .2, ease: 'power3.out' });
}
function closeDrawer() { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); lenis && lenis.start(); }
$('#bento').addEventListener('click', e => { const c = e.target.closest('.card'); if (c) openDrawer(+c.dataset.i); });
drawer.addEventListener('click', e => {
  const c = e.target.closest('[data-close]'); if (!c) return;
  if (c.dataset.svc) { $('#svcSelect').selectedIndex = +c.dataset.svc; }
  closeDrawer();
  if (c.getAttribute('href') === '#contact') { e.preventDefault(); setTimeout(() => goTo('#contact'), 350); }
});
addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
$('#bento').addEventListener('pointermove', e => {
  const c = e.target.closest('.card'); if (!c) return;
  const r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px');
});

/* ---------- language switch ---------- */
const langEl = $('#lang');
$('#langBtn').addEventListener('click', e => { e.stopPropagation(); langEl.classList.toggle('open'); $('#langBtn').setAttribute('aria-expanded', langEl.classList.contains('open')); });
document.addEventListener('click', () => langEl.classList.remove('open'));
$$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
function setLang(l) {
  if (l === lang) { langEl.classList.remove('open'); return; }
  lang = l; T = C[l];
  langEl.classList.remove('open');
  const y = scrollY;
  const swap = () => { killAnims(); render(); initAnims(true); requestAnimationFrame(() => { ScrollTrigger.refresh(); }); if (document.fonts) document.fonts.ready.then(fixInd); setTimeout(fixInd, 800); };
  if (hasG && !reduce) gsap.to('main, .ftr', { opacity: 0, duration: .25, onComplete: () => { swap(); gsap.to('main, .ftr', { opacity: 1, duration: .45 }); } });
  else swap();
}

/* ---------- smooth scroll ---------- */
let lenis = null;
if (typeof Lenis !== 'undefined' && !reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}
function goTo(h) { const t = $(h); if (!t) return; lenis ? lenis.scrollTo(t, { offset: h === '#top' ? 0 : -70 }) : t.scrollIntoView({ behavior: 'smooth' }); }
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || a.closest('.drawer')) return;
  const h = a.getAttribute('href'); if (h.length < 2) return;
  e.preventDefault(); document.body.classList.remove('menu-open'); goTo(h);
});
$('#burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));

/* ---------- header state ---------- */
const hdr = $('#hdr');
const lightSecs = () => $$('.sec.light, .sec.paper2');
function hdrState() {
  hdr.classList.toggle('scrolled', scrollY > 40);
  const y = 40; let onLight = false;
  for (const s of lightSecs()) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { onLight = true; break; } }
  hdr.classList.toggle('on-light', onLight && scrollY > 40);
  // active nav
  let act = null;
  $$('.nav a').forEach(a => { const s = $(a.getAttribute('href')); if (s) { const r = s.getBoundingClientRect(); if (r.top < innerHeight * .4 && r.bottom > innerHeight * .4) act = a; } });
  $$('.nav a').forEach(a => a.classList.toggle('act', a === act));
}
addEventListener('scroll', hdrState, { passive: true });

/* ---------- hero spotlight + cursor glow ---------- */
const hero = $('#hero'), glow = $('#glow');
hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); hero.style.setProperty('--mx', (e.clientX - r.left) + 'px'); hero.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
addEventListener('pointermove', e => { glow.style.opacity = 1; glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });

/* ---------- hero canvas: flowing hairlines (21st "background paths") ---------- */
(function heroLines() {
  const cv = $('#heroCanvas'), ctx = cv.getContext('2d');
  let w, h, dpr, run = true, t0 = performance.now();
  const N = 34;
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.offsetWidth; h = cv.offsetHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener('resize', size);
  new IntersectionObserver(([en]) => { run = en.isIntersecting; if (run) requestAnimationFrame(draw); }).observe(cv);
  function draw(now) {
    if (!run) return;
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < N; i++) {
      const k = i / N;
      const a = 0.025 + 0.07 * Math.sin(k * Math.PI);
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.lineWidth = 0.6 + k * 0.6;
      ctx.beginPath();
      const off = (k - .5) * h * 1.3;
      for (let x = -20; x <= w + 20; x += 18) {
        const p = x / w;
        const y = h * .62 + off * (1 - p * .7) - Math.sin(p * 3 + t * .25 + k * 4) * 60 * (0.5 + k) - p * h * .45 + Math.cos(t * .2 + k * 6 + p * 5) * 18;
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ---------- globe ---------- */
(function globe() {
  const cv = $('#globe'), ctx = cv.getContext('2d'), lbl = $('#globeLabel');
  const land = window.BM_LAND || [];
  const D = Math.PI / 180;
  const pts = []; for (let i = 0; i < land.length; i += 2) pts.push([land[i] * D, land[i + 1] * D]);
  const cairo = [30.04 * D, 31.24 * D];
  const cities = [[51.5, -0.12], [48.86, 2.35], [50.11, 8.68], [40.71, -74], [39.9, 116.4], [31.23, 121.47], [35.68, 139.7], [25.2, 55.27], [24.71, 46.67], [19.07, 72.88], [6.52, 3.38], [-26.2, 28.04], [-23.55, -46.63], [1.35, 103.82], [41.0, 28.97], [33.89, 35.5]].map(c => [c[0] * D, c[1] * D]);
  let w, R, dpr, rot = -0.35, tilt = 0.32, run = false, t0 = performance.now(), drag = null;
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); w = cv.offsetWidth; cv.width = w * dpr; cv.height = w * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); R = w * .42; }
  size(); addEventListener('resize', size);
  new IntersectionObserver(([en]) => { run = en.isIntersecting; if (run) requestAnimationFrame(draw); }).observe(cv);
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, r: rot }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (drag) rot = drag.r + (e.clientX - drag.x) * .006; });
  cv.addEventListener('pointerup', () => drag = null);
  function proj([lat, lon]) {
    const x0 = Math.cos(lat) * Math.sin(lon + rot), y0 = Math.sin(lat), z0 = Math.cos(lat) * Math.cos(lon + rot);
    const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
    return [w / 2 + x0 * R, w / 2 - y * R, z];
  }
  function slerp(a, b, f) {
    const v = ([la, lo]) => [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    const A = v(a), B = v(b); const d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
    const s = Math.sin(d); const k1 = Math.sin((1 - f) * d) / s, k2 = Math.sin(f * d) / s;
    const x = A[0] * k1 + B[0] * k2, y = A[1] * k1 + B[1] * k2, z = A[2] * k1 + B[2] * k2;
    return [Math.atan2(z, Math.hypot(x, y)), Math.atan2(y, x), d];
  }
  function draw(now) {
    if (!run) return;
    const t = (now - t0) / 1000;
    if (!drag && !reduce) rot += 0.0016;
    ctx.clearRect(0, 0, w, w);
    // halo
    const g = ctx.createRadialGradient(w / 2, w / 2, R * .8, w / 2, w / 2, R * 1.25);
    g.addColorStop(0, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w / 2, w / 2, R * 1.25, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(w / 2, w / 2, R, 0, 7); ctx.stroke();
    // dots
    const ds = Math.max(1, w / 520);
    for (const p of pts) {
      const [x, y, z] = proj(p);
      if (z < -0.05) continue;
      ctx.fillStyle = `rgba(244,242,238,${0.12 + z * 0.6})`;
      ctx.fillRect(x - ds * .7, y - ds * .7, ds * 1.4, ds * 1.4);
    }
    // arcs
    cities.forEach((c, i) => {
      const segs = 48, d = slerp(cairo, c, .5)[2], lift = 1 + Math.min(.35, d * .22);
      const phase = ((t * .35 + i * .137) % 1);
      ctx.lineWidth = 1.1;
      let prev = null;
      for (let s = 0; s <= segs; s++) {
        const f = s / segs; const [la, lo] = slerp(cairo, c, f);
        const h = 1 + (lift - 1) * Math.sin(f * Math.PI);
        let [x, y, z] = proj([la, lo]); x = w / 2 + (x - w / 2) * h; y = w / 2 + (y - w / 2) * h;
        if (prev && z > -0.1 && prev[2] > -0.1) {
          const near = Math.abs(f - phase) < .12 ? 1 - Math.abs(f - phase) / .12 : 0;
          ctx.strokeStyle = `rgba(205,185,145,${0.16 + near * 0.8})`;
          ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(x, y); ctx.stroke();
        }
        prev = [x, y, z];
      }
      const [ex, ey, ez] = proj(c);
      if (ez > 0) { ctx.fillStyle = 'rgba(244,242,238,.9)'; ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, 7); ctx.fill(); }
    });
    // cairo
    const [cx, cy, cz] = proj(cairo);
    if (cz > 0) {
      const pr = (t % 2) / 2;
      ctx.strokeStyle = `rgba(205,185,145,${1 - pr})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, 4 + pr * 22, 0, 7); ctx.stroke();
      ctx.fillStyle = '#cdb991'; ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, 7); ctx.fill();
      lbl.style.opacity = 1; lbl.style.left = (cx / w * 100) + '%'; lbl.style.top = (cy / w * 100) + '%';
    } else lbl.style.opacity = 0;
    requestAnimationFrame(draw);
  }
})();

/* ---------- form ---------- */
function formMsg() {
  const f = $('#form'); const v = n => f.elements[n].value.trim();
  return `BloomMark IP — ${v('service')}\n${T.contact.form.name}: ${v('name')}\n${T.contact.form.company}: ${v('company')}\n${T.contact.form.email}: ${v('email')}\n\n${v('msg')}`;
}
$('#form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target; let ok = true;
  ['name', 'email'].forEach(n => { const el = f.elements[n]; const bad = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value)); el.classList.toggle('err', bad); if (bad) ok = false; });
  if (!ok) return;
  $('#formOk').classList.add('show');
  window.open('https://wa.me/201116162530?text=' + encodeURIComponent(formMsg()), '_blank', 'noopener');
});
$('#mailLink').addEventListener('click', e => { e.preventDefault(); location.href = 'mailto:info@bloommark-ip.com?subject=' + encodeURIComponent('BloomMark IP — ' + $('#form').elements.service.value) + '&body=' + encodeURIComponent(formMsg()); });
$('#yr').textContent = new Date().getFullYear();

/* ---------- scroll animations ---------- */
function killAnims() { if (hasG) ScrollTrigger.getAll().forEach(s => s.kill()); }
function counter(el) {
  const n = +el.dataset.n; const from = n > 1000 ? n - 40 : 0; const o = { v: from };
  gsap.to(o, { v: n, duration: 2, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v), scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
}
function initAnims(again) {
  if (!hasG || reduce) { $$('.reveal-up, #heroSub .sw').forEach(e => { e.style.opacity = 1; e.style.filter = 'none'; e.style.transform = 'none'; }); $$('.step').forEach(s => s.classList.add('on')); $$('.statement .sw').forEach(s => s.style.opacity = 1); return; }
  // split headings
  $$('.split').forEach(h => gsap.from($$('.w > span', h), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: lang === 'zh' ? .02 : .06, scrollTrigger: { trigger: h, start: 'top 86%', once: true } }));
  // kicker + lead
  $$('.sec .kicker, .sec .lead').forEach(el => gsap.from(el, { opacity: 0, y: 18, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  // fades in groups
  ['#firmCols', '#bento', '#terms', '#news'].forEach(sel => {
    const items = $$(sel + ' .fade'); if (!items.length) return;
    gsap.from(items, { opacity: 0, y: 50, duration: 1, ease: 'power3.out', stagger: .09, clearProps: 'transform,opacity', scrollTrigger: { trigger: sel, start: 'top 82%', once: true } });
  });
  // statement scrub
  const sw = $$('.statement .sw');
  gsap.to(sw, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '#statement', start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  // chairman
  gsap.from('.chair', { opacity: 0, y: 70, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.chair', start: 'top 85%', once: true } });
  // counters
  $$('.cnt').forEach(counter);
  // treaties
  gsap.from('#treaties li', { opacity: 0, x: lang === 'ar' ? 30 : -30, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '#treaties', start: 'top 85%', once: true } });
  gsap.from('#netPts li', { opacity: 0, y: 20, duration: .8, stagger: .1, scrollTrigger: { trigger: '#netPts', start: 'top 88%', once: true } });
  gsap.from('.globe-box', { opacity: 0, scale: .85, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.globe-box', start: 'top 85%', once: true } });
  // process
  const steps = $$('.step');
  gsap.to('#stepsFill', { height: '100%', ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 60%', end: 'bottom 60%', scrub: .5 } });
  steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 62%', onEnter: () => { s.classList.add('on'); $('#procNum').textContent = pad(i + 1); }, onLeaveBack: () => { s.classList.remove('on'); $('#procNum').textContent = pad(Math.max(1, i)); } }));
  // tabs/cards in req
  gsap.from('.tabs', { opacity: 0, y: 20, duration: .8, scrollTrigger: { trigger: '.tabs', start: 'top 90%', once: true } });
  // contact
  gsap.from('.ct-info > *, .ct-form', { opacity: 0, y: 40, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.ct', start: 'top 82%', once: true } });
  // hero monogram parallax
  gsap.to('.hero-mono', { yPercent: -18, rotate: lang === 'ar' ? -4 : 4, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-in', { y: -80, opacity: .2, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'center 40%', end: 'bottom top', scrub: true } });
  // dark sections open from a rounded frame
  ['#practice', '#egypt', '#contact'].forEach(sel => {
    gsap.fromTo(sel, { clipPath: 'inset(4% 3% 0% 3% round 44px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: sel, start: 'top 95%', end: 'top 25%', scrub: true } });
  });
  // kicker scramble (latin scripts)
  if (lang === 'en' || lang === 'fr') $$('.sec .kicker').forEach(k => ScrollTrigger.create({ trigger: k, start: 'top 90%', once: true, onEnter: () => scramble(k) }));
  // process cards lift
  $$('.step-card').forEach(c => gsap.from(c, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 88%', once: true } }));
  // values cards stagger in 3D
  gsap.from('.val', { rotateX: -25, y: 60, opacity: 0, transformOrigin: '50% 100%', duration: 1.1, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#values-grid', start: 'top 82%', once: true } });
  // footer word
  gsap.from('.ftr-word', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.ftr-word', start: 'top 95%', once: true } });
  if (again) { gsap.set('#heroSub .sw', { opacity: 1, filter: 'blur(0px)', y: 0 }); gsap.set('.reveal-up, .hl > *', { clearProps: 'all' }); $$('.reveal-up').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); }
}

function heroIntro() {
  if (!hasG || reduce) { $$('.reveal-up, #heroSub .sw').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; e.style.filter = 'none'; }); return; }
  const tl = gsap.timeline();
  const monoP = $$('#heroMono path');
  monoP.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
  tl.from('.hl > *', { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: .12 })
    .to('.reveal-up', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .1 }, .3)
    .to('#heroSub .sw', { opacity: 1, filter: 'blur(0px)', y: 0, duration: .8, ease: 'power2.out', stagger: lang === 'zh' ? .008 : .025 }, .55)
    .to(monoP, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', stagger: .2 }, 0)
    .from('.stat', { opacity: 0, y: 30, duration: .9, stagger: .08, ease: 'power3.out' }, .7)
    .from('.hdr', { y: -30, opacity: 0, duration: .9, ease: 'power3.out' }, .2);
}

/* ---------- scramble text ---------- */
function scramble(el) {
  const final = el.textContent; const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let f = 0; const total = 22;
  const tick = () => {
    el.textContent = [...final].map((c, i) => (c === ' ' || i < (f / total) * final.length) ? c : chars[(Math.random() * chars.length) | 0]).join('');
    if (++f <= total) requestAnimationFrame(tick); else el.textContent = final;
  };
  tick();
}

/* ---------- magnetic buttons + card tilt + monogram tilt ---------- */
if (matchMedia('(hover:hover)').matches && !reduce) {
  document.addEventListener('pointermove', e => {
    const b = e.target.closest('.btn');
    $$('.btn.mag-on').forEach(x => { if (x !== b) { x.classList.remove('mag-on'); x.style.transform = ''; } });
    if (b) { const r = b.getBoundingClientRect(); const dx = (e.clientX - r.left - r.width / 2) * .25, dy = (e.clientY - r.top - r.height / 2) * .35; b.classList.add('mag-on'); b.style.transform = `translate(${dx}px,${dy}px)`; }
  }, { passive: true });
  $('#bento').addEventListener('pointermove', e => {
    const c = e.target.closest('.card'); if (!c) return;
    const r = c.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    c.style.setProperty('--ry', (px * 7) + 'deg'); c.style.setProperty('--rx', (-py * 7) + 'deg');
  });
  $('#bento').addEventListener('pointerout', e => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); } });
  if (hasG) {
    const ms = $('#heroMono');
    hero.addEventListener('pointermove', e => { const px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5; gsap.to(ms, { rotateY: px * 14, rotateX: -py * 10, x: px * 30, y: py * 20, duration: 1.2, ease: 'power3.out' }); });
  }
}

/* ---------- boot ---------- */
document.documentElement.classList.remove('no-js');
render();
hdrState();
runLoader(() => { heroIntro(); initAnims(false); hdrState(); });
})();
