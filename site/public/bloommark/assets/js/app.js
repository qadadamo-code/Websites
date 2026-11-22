/* BloomMark IP — multi-page interactions (v3) */
(() => {
'use strict';
const C = window.BM_CONTENT, L = window.BM_LOGO;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const hasG = typeof gsap !== 'undefined';
if (hasG) gsap.registerPlugin(ScrollTrigger);
const PAGE = document.body.dataset.page;

const LANGS = ['ar', 'en', 'fr', 'es', 'de', 'zh', 'ru'];
let lang = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(q)) return q;
  try { const s = localStorage.getItem('bm-lang'); if (LANGS.includes(s)) return s; } catch (e) {}
  return 'ar';
})();
let T = C[lang];
const get = (path, o = T) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const pad = n => String(n).padStart(2, '0');
const isRTL = () => lang === 'ar';

/* ---------- icons ---------- */
const ICO = {
  tm: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 16.5v-9h3.2a2.6 2.6 0 010 5.2H9.5M12.6 12.7l2.6 3.8"/></svg>',
  pt: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z"/><path d="M12 7v4M10 9h4"/></svg>',
  ds: '<svg viewBox="0 0 24 24"><path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/></svg>',
  um: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"/></svg>',
  cr: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9.6a3.6 3.6 0 100 4.8"/></svg>',
  lt: '<svg viewBox="0 0 24 24"><path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 6a3 3 0 006 0zM19 7l-3 6a3 3 0 006 0z"/></svg>'
};
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
const INFO = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" class="arr"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const LI = 'https://www.linkedin.com/in/bloommark-ip-ltd-mena-region-5b4b47244/recent-activity/all/';

/* ---------- logo ---------- */
const MONO_VB = '300 150 2250 1720';
function mono(svg, { parts = ['B', 'M'], vb = MONO_VB, grad = false } = {}) {
  if (!svg) return;
  svg.setAttribute('viewBox', vb); svg.innerHTML = '';
  if (grad) svg.insertAdjacentHTML('beforeend', '<defs><linearGradient id="monoGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/></linearGradient></defs>');
  parts.forEach(p => { const el = document.createElementNS(NS, 'path'); el.setAttribute('d', L[p]); el.setAttribute('fill-rule', 'evenodd'); svg.appendChild(el); });
}
function fullLogo(svg) {
  if (!svg) return;
  mono(svg, { parts: ['B', 'M', 'script'], vb: L.vb });
  const t = document.createElementNS(NS, 'text');
  t.setAttribute('x', '150'); t.setAttribute('y', '1612'); t.setAttribute('font-size', '58'); t.setAttribute('letter-spacing', '38');
  t.setAttribute('font-family', 'Inter, Helvetica, sans-serif'); t.textContent = 'IP PROTECTION'; svg.appendChild(t);
}
mono($('#brandMark')); mono($('#heroMono'), { grad: true }); mono($('#chairMark')); mono($('#portalMark'));
mono($('#sigMark'), { parts: ['script'], vb: '600 1230 1150 230' });
mono($('#ptMark'), { parts: ['B', 'M'] });
fullLogo($('#footMark'));

/* ---------- page transition / loader ---------- */
const pt = $('#pt');
let firstVisit = true;
try { firstVisit = !sessionStorage.getItem('bm-seen'); sessionStorage.setItem('bm-seen', '1'); } catch (e) {}
function ready() { window.__bmReady = true; dispatchEvent(new Event('bm:ready')); }
function enter(done) {
  document.body.classList.remove('is-loading');
  if (!hasG || reduce) { pt.classList.add('gone'); ready(); done(); return; }
  const paths = $$('path', $('#ptMark'));
  if (firstVisit) {
    pt.classList.add('first');
    paths.forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.timeline()
      .to(paths, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .15 })
      .to('#ptBar', { width: '100%', duration: 1.7, ease: 'power1.inOut' }, 0)
      .to(paths, { fill: '#f4f2ee', strokeOpacity: 0, duration: .5 }, 1.3)
      .to('.pt-center', { opacity: 0, y: -20, duration: .4 }, 1.9)
      .add(() => { ready(); done(); }, 2.0)
      .to('.pt-panel', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 2.0)
      .set(pt, { className: 'pt gone' });
  } else {
    paths.forEach(p => { p.style.fill = '#f4f2ee'; });
    gsap.timeline()
      .set('.pt-line, .pt-txt', { display: 'none' })
      .to('.pt-center', { opacity: 0, scale: .9, duration: .35, delay: .15 })
      .add(() => { ready(); done(); }, .3)
      .to('.pt-panel', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, .3)
      .set(pt, { className: 'pt gone' });
  }
}
function leave(url) {
  if (!hasG || reduce) { location.href = url; return; }
  pt.className = 'pt leaving';
  gsap.set('.pt-panel', { yPercent: 100 }); gsap.set('.pt-center', { opacity: 0, scale: 1, y: 0 }); gsap.set('.pt-line, .pt-txt', { display: 'none' });
  $$('path', $('#ptMark')).forEach(p => { p.style.fill = '#f4f2ee'; p.style.strokeOpacity = 0; });
  gsap.timeline({ onComplete: () => { location.href = url; } })
    .to('.pt-panel', { yPercent: 0, duration: .7, ease: 'expo.inOut' })
    .to('.pt-center', { opacity: 1, duration: .25 }, .45);
}
addEventListener('pageshow', e => { if (e.persisted) { pt.className = 'pt gone'; } });
document.addEventListener('click', e => {
  const a = e.target.closest('a'); if (!a) return;
  const h = a.getAttribute('href') || '';
  if (h.startsWith('#')) {
    if (h.length < 2) return;
    e.preventDefault(); closeMenu(); goTo(h); return;
  }
  if (a.target === '_blank' || /^(https?:|mailto:|tel:)/.test(h) || e.metaKey || e.ctrlKey) return;
  if (!/\.html/.test(h)) return;
  e.preventDefault(); closeMenu();
  const u = new URL(h, location.href);
  if (u.pathname === location.pathname && !u.hash) { goTo('#top'); return; }
  leave(u.href);
});

/* ---------- render ---------- */
function units(txt) { return lang === 'zh' ? [...txt] : txt.split(/\s+/); }
function joinU(arr) { return arr.join(lang === 'zh' ? '' : ' '); }
function splitWords(el) { el.innerHTML = joinU(units(el.textContent.trim()).map(u => `<span class="w"><span>${u}</span></span>`)); }
function splitChars(el) {
  const txt = el.textContent.trim();
  if (lang === 'ar') { splitWords(el); return; }
  el.innerHTML = txt.split(' ').map(w => `<span class="w">${[...w].map(c => `<span class="c">${c}</span>`).join('')}</span>`).join(' ');
}
const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; return el; };

function render() {
  const H = document.documentElement;
  H.lang = T.htmlLang; H.dir = T.dir;
  const head = PAGE !== 'index' ? T.pg.heads[PAGE].t + ' | ' : '';
  document.title = head + T.meta.title;
  $('meta[name=description]').setAttribute('content', T.meta.desc);
  if (lang === 'zh') { const z = $('#zhFonts'); if (z && z.dataset.href) { z.href = z.dataset.href; z.media = 'all'; z.removeAttribute('data-href'); } }
  $$('[data-t]').forEach(el => { const v = get(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
  $('#langCur').textContent = T.label;
  $$('[data-lang]').forEach(b => b.classList.toggle('cur', b.dataset.lang === lang));
  // internal links keep the language
  $$('a.pl, .nav a, .mnav a, .ftr-nav a').forEach(a => { const h = a.getAttribute('href').split('?')[0].split('#'); a.setAttribute('href', h[0] + '?lang=' + lang + (h[1] ? '#' + h[1] : '')); });

  const hs = $('#heroSub'); if (hs) hs.innerHTML = joinU(units(T.hero.sub).map(u => `<span class="sw">${u}</span>`));
  set('#stats', T.stats.map(s => `<div class="stat"><b><span class="cnt" data-n="${s.n}">${s.n}</span>${s.suf ? `<sup>${s.suf}</sup>` : ''}</b><span>${s.l}</span></div>`).join(''));
  const mq = T.marquee.map(m => `<span>${m}</span>`).join(''); set('#marquee', mq);
  const st = $('#statement'); if (st) st.innerHTML = joinU(units(get(st.dataset.src)).map(u => `<span class="sw">${u}</span>`));
  set('#firmCols', T.firm.cols.map((c, i) => `<div class="firm-col fade"><span class="n">${pad(i + 1)}</span><h3>${c.h}</h3><p>${c.p}</p></div>`).join(''));
  // home index list
  set('#idxList', T.practice.items.map((it, i) => `<li><a class="idx-row pl" href="practice.html?lang=${lang}#p${i + 1}" data-i="${i}"><span class="idx-n">${pad(i + 1)}</span><span class="idx-t">${it.h}</span><span class="idx-k">${it.list.length} · ${T.practice.more}</span><span class="idx-go">${ARROW}</span></a></li>`).join(''));
  set('#portalSteps', T.process.steps.map((s, i) => `<li><b>${pad(i + 1)}</b>${s.h}</li>`).join(''));
  set('#portalNums', T.egypt.terms.map(t => `<div><b>${t.n}</b><small>${t.u}</small><span>${t.h}</span></div>`).join(''));
  // practice horizontal panels
  set('#hzTrack', T.practice.items.map((it, i) => `
    <article class="hz-panel" id="p${i + 1}">
      <div class="hz-big" aria-hidden="true">${pad(i + 1)}</div>
      <div class="hz-l">
        <span class="hz-ico">${ICO[it.k]}</span>
        <h2 class="hz-h">${it.h}</h2>
        <p class="hz-p">${it.p}</p><p class="hz-d">${it.d}</p>
        <a href="contact.html?lang=${lang}" class="btn btn-shine pl" data-svc="${i}"><span>${T.nav.cta}</span>${ARROW}</a>
      </div>
      <div class="hz-r"><p class="kicker">${T.practice.more}</p><ul>${it.list.map((x, k) => `<li><b>${pad(k + 1)}</b><span>${x}</span></li>`).join('')}</ul></div>
    </article>`).join(''));
  set('#hzDots', T.practice.items.map((it, i) => `<button data-i="${i}" aria-label="${it.h}"><span>${it.h}</span></button>`).join(''));
  // process
  set('#ringTxt', T.process.steps.map((s, i) => `<div class="ring-step${i ? '' : ' on'}"><span class="kicker">${T.process.kicker} · ${pad(i + 1)}</span><h2>${s.h}</h2><p>${s.p}</p></div>`).join(''));
  set('#ringTicks', T.process.steps.map((s, i) => `<i style="--a:${i * 60}deg"></i>`).join(''));
  set('#steps', T.process.steps.map((s, i) => `<li class="step on"><div class="step-card"><span class="sn">${pad(i + 1)}</span><h3>${s.h}</h3><p>${s.p}</p></div></li>`).join(''));
  // egypt
  set('#terms', T.egypt.terms.map(t => `<div class="term fade"><div class="term-n"><b class="cnt" data-n="${t.n}">${t.n}</b><small>${t.u}</small></div><h4>${t.h}</h4><p>${t.p}</p></div>`).join(''));
  set('#treaties', T.egypt.treaties.map(t => `<li>${t}</li>`).join(''));
  set('#netPts', T.network.points.map(p => `<li>${CHECK}<span>${p}</span></li>`).join(''));
  const gl = $('#globeLabel'); if (gl) gl.textContent = T.network.cairo;
  const tabs = $('#tabs');
  if (tabs) { $$('.tab', tabs).forEach(t => t.remove()); tabs.insertAdjacentHTML('beforeend', T.req.tabs.map((t, i) => `<button class="tab" role="tab" data-i="${i}">${t.h}</button>`).join('')); setTab(curTab, false); }
  set('#values-grid', T.values.items.map((v, i) => `<div class="val"><span class="vn">${pad(i + 1)}</span><h3>${v.h}</h3><p>${v.p}</p></div>`).join(''));
  set('#news', T.insights.items.map((n, i) => `<a class="nw fade" href="${LI}" target="_blank" rel="noopener"><span class="nw-tag">${n.tag}</span><span class="nw-n">${pad(i + 1)}</span><h3>${n.h}</h3><p>${n.p}</p></a>`).join(''));
  set('#mails', T.contact.mails.map(m => `<li><span>${m.l}</span><a href="mailto:${m.e}" dir="ltr">${m.e}</a></li>`).join(''));
  const svc = set('#svcSelect', T.practice.items.map(it => `<option>${it.h}</option>`).join(''));
  if (svc) { const q = new URLSearchParams(location.search).get('svc'); if (q) svc.selectedIndex = +q; }
  $$('.split').forEach(splitWords);
  const pht = $('.ph-t'); if (pht) splitChars(pht);
  startRotator();
  try { localStorage.setItem('bm-lang', lang); } catch (e) {}
  const u = new URL(location.href); u.searchParams.set('lang', lang); history.replaceState(null, '', u);
}

/* ---------- rotator ---------- */
let rotTimer;
function startRotator() {
  clearInterval(rotTimer);
  const el = $('#rot'); if (!el) return;
  const words = T.hero.rotate; let i = 0;
  const show = w => {
    el.innerHTML = lang === 'ar' ? `<span class="ch">${w}</span>` : [...w].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    if (hasG && !reduce) gsap.fromTo($$('.ch', el), { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .7, stagger: .03, ease: 'power3.out' });
  };
  show(words[0]);
  rotTimer = setInterval(() => {
    const next = () => { i = (i + 1) % words.length; show(words[i]); };
    if (hasG && !reduce) gsap.to($$('.ch', el), { opacity: 0, y: -24, filter: 'blur(8px)', duration: .4, stagger: .015, ease: 'power2.in', onComplete: next }); else next();
  }, 2800);
}

/* ---------- tabs ---------- */
let curTab = 0;
function fixInd() { const on = $$('.tab')[curTab], ind = $('#tabInd'); if (on && ind) { ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px'; } }
function setTab(i, anim = true) {
  curTab = i; const tabs = $$('.tab'); if (!tabs.length) return;
  tabs.forEach((t, k) => t.classList.toggle('on', k === i)); fixInd();
  const tab = T.req.tabs[i]; const P = $('#tabPanel');
  P.innerHTML = tab.groups.map(g => `<div class="req-card"><h4>${g.t || tab.h}</h4><ul>${g.list.map(x => `<li><i>${CHECK}</i><span>${x}</span></li>`).join('')}</ul></div>`).join('') + (tab.note ? `<div class="req-note">${INFO}<span>${tab.note}</span></div>` : '');
  if (anim && hasG && !reduce) gsap.from($$('.req-card, .req-note', P), { opacity: 0, y: 20, duration: .6, stagger: .08, ease: 'power3.out' });
}
document.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) setTab(+b.dataset.i); });
addEventListener('resize', fixInd);
if (document.fonts) document.fonts.ready.then(fixInd);

/* ---------- language switch ---------- */
const langEl = $('#lang');
$('#langBtn').addEventListener('click', e => { e.stopPropagation(); langEl.classList.toggle('open'); });
document.addEventListener('click', () => langEl.classList.remove('open'));
$$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
function setLang(l) {
  langEl.classList.remove('open'); if (l === lang) return;
  // reload through the curtain so every pinned section rebuilds cleanly
  const u = new URL(location.href); u.searchParams.set('lang', l);
  try { localStorage.setItem('bm-lang', l); } catch (e) {}
  leave(u.href);
}

/* ---------- day / night ---------- */
const themeBtn = $('#themeBtn');
if (themeBtn) themeBtn.addEventListener('click', () => {
  const H = document.documentElement, dark = H.dataset.theme !== 'dark';
  H.classList.add('theme-anim');
  if (dark) H.dataset.theme = 'dark'; else delete H.dataset.theme;
  try { localStorage.setItem('bm-theme', dark ? 'dark' : 'light'); } catch (e) {}
  const m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', dark ? '#0d0d0f' : '#f4f2ee');
  dispatchEvent(new Event('bm:theme'));
  setTimeout(() => H.classList.remove('theme-anim'), 700);
});

/* ---------- smooth scroll ---------- */
let lenis = null;
if (typeof Lenis !== 'undefined' && !reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
}
function goTo(h, off = -70) { const t = h === '#top' ? document.body : $(h); if (!t) return; if (/^#p\d$/.test(h)) off = -150; lenis ? lenis.scrollTo(h === '#top' ? 0 : t, { offset: off }) : t.scrollIntoView({ behavior: 'smooth' }); }
const burger = $('#burger');
function closeMenu() { document.body.classList.remove('menu-open'); }
burger.addEventListener('click', () => {
  document.body.classList.toggle('menu-open');
  if (document.body.classList.contains('menu-open') && hasG) gsap.fromTo('.mnav a', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .05, duration: .7, ease: 'power3.out' });
});

/* ---------- header ---------- */
const hdr = $('#hdr');
function hdrState() {
  hdr.classList.toggle('scrolled', scrollY > 40);
  let onLight = false;
  for (const s of $$('.light, .paper2')) { const r = s.getBoundingClientRect(); if (r.top <= 40 && r.bottom > 40) { onLight = true; break; } }
  hdr.classList.toggle('on-light', onLight);
}
addEventListener('scroll', hdrState, { passive: true });

/* ---------- custom cursor ---------- */
if (fine && !reduce) {
  const cur = $('#cur'), ring = $('.cur-ring'), lbl = $('#curLbl');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  document.body.classList.add('has-cur');
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.style.opacity = 1; }, { passive: true });
  (function tick() { rx += (x - rx) * .16; ry += (y - ry) * .16; cur.style.setProperty('--x', x + 'px'); cur.style.setProperty('--y', y + 'px'); cur.style.setProperty('--rx', rx + 'px'); cur.style.setProperty('--ry', ry + 'px'); requestAnimationFrame(tick); })();
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a, button, .idx-row, .hz-panel, input, textarea, select, #gl');
    cur.classList.toggle('hov', !!t && !t.matches('input, textarea, select'));
    cur.classList.toggle('txt', !!t && t.matches('input, textarea, select'));
    const big = e.target.closest('.idx-row, .portal, .nw, .next');
    cur.classList.toggle('big', !!big);
    lbl.textContent = big ? (T.pg.home.open) : (e.target.closest('#hero') && !t ? T.pg.home.drag : '');
    cur.classList.toggle('drag', !big && !!e.target.closest('#hero') && !t);
  });
}

/* ---------- magnetic buttons ---------- */
if (fine && !reduce) {
  document.addEventListener('pointermove', e => {
    const b = e.target.closest('.btn, .hcta-btn');
    $$('.mag-on').forEach(x => { if (x !== b) { x.classList.remove('mag-on'); x.style.transform = ''; } });
    if (b) { const r = b.getBoundingClientRect(); const k = b.classList.contains('hcta-btn') ? .35 : .25; b.classList.add('mag-on'); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * k}px,${(e.clientY - r.top - r.height / 2) * k}px)`; }
  }, { passive: true });
}

/* ---------- canvas hairlines (page heads) ---------- */
$$('.ph-canvas').forEach(cv => {
  const ctx = cv.getContext('2d'); let w, h, run = true; const t0 = performance.now();
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); w = cv.offsetWidth; h = cv.offsetHeight; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener('resize', size);
  new IntersectionObserver(([en]) => { run = en.isIntersecting; if (run) requestAnimationFrame(draw); }).observe(cv);
  let mx = .5; addEventListener('pointermove', e => { mx = e.clientX / innerWidth; }, { passive: true });
  function draw(now) {
    if (!run) return; const t = (now - t0) / 1000; ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const k = i / 40; ctx.strokeStyle = document.documentElement.dataset.theme === 'dark' ? `rgba(255,255,255,${0.02 + 0.07 * Math.sin(k * Math.PI)})` : `rgba(13,13,15,${0.015 + 0.05 * Math.sin(k * Math.PI)})`; ctx.lineWidth = .7; ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 16) {
        const p = x / w; const y = h * (.15 + k * .9) + Math.sin(p * 4 + t * .3 + k * 5) * 30 * (1 - k * .5) + Math.sin((p - mx) * 3) * 40 * k - p * 60;
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
});

/* ---------- home: index list floating preview ---------- */
const idxList = $('#idxList');
if (idxList && fine) {
  const fl = $('#idxFloat'); let fx = 0, fy = 0, cx = 0, cy = 0, on = false;
  idxList.addEventListener('pointerover', e => {
    const r = e.target.closest('.idx-row'); if (!r) return;
    const it = T.practice.items[+r.dataset.i];
    $('#idxIco').innerHTML = ICO[it.k]; $('#idxTxt').textContent = it.p; fl.classList.add('on'); on = true;
  });
  idxList.addEventListener('pointerleave', () => { fl.classList.remove('on'); on = false; });
  addEventListener('pointermove', e => { fx = e.clientX; fy = e.clientY; }, { passive: true });
  (function tick() { cx += (fx - cx) * .12; cy += (fy - cy) * .12; fl.style.transform = `translate(${cx + (isRTL() ? -360 : 30)}px,${cy - 120}px) rotate(${(fx - cx) * .04}deg)`; requestAnimationFrame(tick); })();
}

/* ---------- globe (firm page) ---------- */
function globe() {
  const cv = $('#globe'); if (!cv) return;
  const ctx = cv.getContext('2d'), lbl = $('#globeLabel'), land = window.BM_LAND || [], D = Math.PI / 180;
  const pts = []; for (let i = 0; i < land.length; i += 2) pts.push([land[i] * D, land[i + 1] * D]);
  const cairo = [30.04 * D, 31.24 * D];
  const cities = [[51.5, -0.12], [48.86, 2.35], [50.11, 8.68], [40.71, -74], [39.9, 116.4], [31.23, 121.47], [35.68, 139.7], [25.2, 55.27], [24.71, 46.67], [19.07, 72.88], [6.52, 3.38], [-26.2, 28.04], [-23.55, -46.63], [1.35, 103.82], [41.0, 28.97], [33.89, 35.5]].map(c => [c[0] * D, c[1] * D]);
  let w, R, rot = -0.35, tilt = 0.32, run = false, drag = null; const t0 = performance.now();
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); w = cv.offsetWidth; cv.width = w * d; cv.height = w * d; ctx.setTransform(d, 0, 0, d, 0, 0); R = w * .42; };
  size(); addEventListener('resize', size);
  new IntersectionObserver(([en]) => { run = en.isIntersecting; if (run) requestAnimationFrame(draw); }).observe(cv);
  cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, r: rot }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (drag) rot = drag.r + (e.clientX - drag.x) * .006; });
  cv.addEventListener('pointerup', () => drag = null);
  const proj = ([lat, lon]) => { const x0 = Math.cos(lat) * Math.sin(lon + rot), y0 = Math.sin(lat), z0 = Math.cos(lat) * Math.cos(lon + rot); const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt); return [w / 2 + x0 * R, w / 2 - y * R, z]; };
  const slerp = (a, b, f) => { const v = ([la, lo]) => [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]; const A = v(a), B = v(b); const d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])); const s = Math.sin(d), k1 = Math.sin((1 - f) * d) / s, k2 = Math.sin(f * d) / s; const x = A[0] * k1 + B[0] * k2, y = A[1] * k1 + B[1] * k2, z = A[2] * k1 + B[2] * k2; return [Math.atan2(z, Math.hypot(x, y)), Math.atan2(y, x), d]; };
  function draw(now) {
    if (!run) return; const t = (now - t0) / 1000; if (!drag && !reduce) rot += 0.0016;
    ctx.clearRect(0, 0, w, w);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(w / 2, w / 2, R, 0, 7); ctx.stroke();
    const ds = Math.max(1, w / 520);
    for (const p of pts) { const [x, y, z] = proj(p); if (z < -0.05) continue; ctx.fillStyle = `rgba(244,242,238,${0.12 + z * 0.6})`; ctx.fillRect(x - ds * .7, y - ds * .7, ds * 1.4, ds * 1.4); }
    cities.forEach((c, i) => {
      const d = slerp(cairo, c, .5)[2], lift = 1 + Math.min(.35, d * .22), phase = ((t * .35 + i * .137) % 1); let prev = null; ctx.lineWidth = 1.1;
      for (let s = 0; s <= 48; s++) { const f = s / 48; const [la, lo] = slerp(cairo, c, f); const hh = 1 + (lift - 1) * Math.sin(f * Math.PI); let [x, y, z] = proj([la, lo]); x = w / 2 + (x - w / 2) * hh; y = w / 2 + (y - w / 2) * hh;
        if (prev && z > -0.1 && prev[2] > -0.1) { const near = Math.abs(f - phase) < .12 ? 1 - Math.abs(f - phase) / .12 : 0; ctx.strokeStyle = `rgba(205,185,145,${0.16 + near * 0.8})`; ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(x, y); ctx.stroke(); }
        prev = [x, y, z]; }
      const [ex, ey, ez] = proj(c); if (ez > 0) { ctx.fillStyle = 'rgba(244,242,238,.9)'; ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, 7); ctx.fill(); }
    });
    const [cx, cy, cz] = proj(cairo);
    if (cz > 0) { const pr = (t % 2) / 2; ctx.strokeStyle = `rgba(205,185,145,${1 - pr})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, 4 + pr * 22, 0, 7); ctx.stroke(); ctx.fillStyle = '#cdb991'; ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, 7); ctx.fill(); lbl.style.opacity = 1; lbl.style.left = (cx / w * 100) + '%'; lbl.style.top = (cy / w * 100) + '%'; } else lbl.style.opacity = 0;
    requestAnimationFrame(draw);
  }
}

/* ---------- form ---------- */
const form = $('#form');
if (form) {
  const msg = () => { const v = n => form.elements[n].value.trim(); return `BloomMark IP — ${v('service')}\n${T.contact.form.name}: ${v('name')}\n${T.contact.form.company}: ${v('company')}\n${T.contact.form.email}: ${v('email')}\n\n${v('msg')}`; };
  form.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    ['name', 'email'].forEach(n => { const el = form.elements[n]; const bad = !el.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(el.value)); el.classList.toggle('err', bad); if (bad) ok = false; });
    if (!ok) return; $('#formOk').classList.add('show');
    window.open('https://wa.me/201116162530?text=' + encodeURIComponent(msg()), '_blank', 'noopener');
  });
  $('#mailLink').addEventListener('click', e => { e.preventDefault(); location.href = 'mailto:info@bloommark-ip.com?subject=' + encodeURIComponent('BloomMark IP — ' + form.elements.service.value) + '&body=' + encodeURIComponent(msg()); });
}
document.addEventListener('click', e => { const b = e.target.closest('[data-svc]'); if (b) { const a = b.getAttribute('href'); if (a) b.setAttribute('href', a.split('?')[0] + '?lang=' + lang + '&svc=' + b.dataset.svc); } }, true);
$('#yr').textContent = new Date().getFullYear();

/* ---------- animations ---------- */
function counter(el) {
  const n = +el.dataset.n; const o = { v: n > 1000 ? n - 40 : 0 };
  gsap.to(o, { v: n, duration: 2, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v), scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
}
function pageIntro() {
  if (!hasG || reduce) { $$('.reveal-up, #heroSub .sw').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; e.style.filter = 'none'; }); return; }
  const tl = gsap.timeline();
  if (PAGE === 'index') {
    tl.from('.hl > *', { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: .12 }, .2)
      .to('.reveal-up', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .1 }, .5)
      .to('#heroSub .sw', { opacity: 1, filter: 'blur(0px)', y: 0, duration: .8, ease: 'power2.out', stagger: lang === 'zh' ? .008 : .025 }, .6);
  } else {
    tl.from('.ph-t .c, .ph-t .w > span', { yPercent: 120, rotate: isRTL() ? 0 : 8, opacity: 0, duration: 1.1, ease: 'power4.out', stagger: .025 }, .1)
      .from('.ph-crumb, .ph-s', { opacity: 0, y: 20, duration: .9, stagger: .1, ease: 'power3.out' }, .5)
      .from('.ph-idx', { opacity: 0, scale: .8, duration: 1.6, ease: 'power3.out' }, 0);
  }
  tl.from('.hdr', { y: -30, opacity: 0, duration: .9, ease: 'power3.out' }, 0);
}
function initAnims() {
  if (!hasG || reduce) { $$('.statement .sw').forEach(s => s.style.opacity = 1); $$('.ring-step').forEach(s => s.classList.add('on')); $$('.hz-panel').forEach(p => p.classList.add('seen')); return; }
  $$('.split').forEach(h => gsap.from($$('.w > span', h), { yPercent: 110, duration: 1, ease: 'power4.out', stagger: lang === 'zh' ? .02 : .06, scrollTrigger: { trigger: h, start: 'top 86%', once: true } }));
  $$('.sec .kicker, .sec .lead').forEach(el => gsap.from(el, { opacity: 0, y: 18, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  ['#firmCols', '#terms', '#news'].forEach(sel => { const items = $$(sel + ' .fade'); if (items.length) gsap.from(items, { opacity: 0, y: 50, duration: 1, ease: 'power3.out', stagger: .09, clearProps: 'transform,opacity', scrollTrigger: { trigger: sel, start: 'top 85%', once: true } }); });
  const sw = $$('.statement .sw'); if (sw.length) gsap.to(sw, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '#statement', start: 'top 80%', end: 'bottom 45%', scrub: .6 } });
  if ($('.chair')) gsap.from('.chair', { opacity: 0, y: 70, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.chair', start: 'top 85%', once: true } });
  $$('.cnt').forEach(counter);
  if ($('#treaties')) gsap.from('#treaties li', { opacity: 0, x: isRTL() ? 30 : -30, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '#treaties', start: 'top 85%', once: true } });
  if ($('#netPts')) { gsap.from('#netPts li', { opacity: 0, y: 20, duration: .8, stagger: .1, scrollTrigger: { trigger: '#netPts', start: 'top 88%', once: true } }); gsap.from('.globe-box', { opacity: 0, scale: .85, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.globe-box', start: 'top 85%', once: true } }); }
  if ($('.val')) gsap.from('.val', { rotateX: -25, y: 60, opacity: 0, transformOrigin: '50% 100%', duration: 1.1, stagger: .1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#values-grid', start: 'top 85%', once: true } });
  if ($('.ct')) gsap.from('.ct-info > *, .ct-form', { opacity: 0, y: 40, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.ct', start: 'top 85%', once: true } });
  if ($('.tabs')) gsap.from('.tabs', { opacity: 0, y: 20, duration: .8, scrollTrigger: { trigger: '.tabs', start: 'top 90%', once: true } });
  $$('.ftr-word').forEach(f => gsap.from(f, { yPercent: 40, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 95%', once: true } }));
  // page head parallax
  if ($('.ph')) { gsap.to('.ph-in', { y: -90, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.ph', start: 'top top', end: 'bottom top', scrub: true } }); gsap.to('.ph-idx', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.ph', start: 'top top', end: 'bottom top', scrub: true } }); }
  // dark sections open from a rounded frame
  $$('.sec.dark, .hstats, .hcta').forEach(s => { gsap.fromTo(s, { clipPath: 'inset(4% 3% 0% 3% round 44px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: s, start: 'top 95%', end: 'top 30%', scrub: true } }); });

  /* home */
  if (PAGE === 'index') {
    gsap.to('.h3d-in', { y: -100, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: '40% top', end: 'bottom top', scrub: true } });
    gsap.from('.idx-row', { opacity: 0, y: 40, duration: .9, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '#idxList', start: 'top 85%', once: true } });
    gsap.from('.idx-row', { '--line': 0, duration: 1.2, stagger: .07, ease: 'power3.inOut', scrollTrigger: { trigger: '#idxList', start: 'top 85%', once: true } });
    gsap.from('.portal', { y: 80, opacity: 0, rotateX: -12, transformOrigin: '50% 100%', duration: 1.1, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.portals', start: 'top 85%', once: true } });
    gsap.from('.stat', { opacity: 0, y: 60, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.hstats', start: 'top 80%', once: true } });
    gsap.fromTo('.hcta-t .w > span', { yPercent: 110 }, { yPercent: 0, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.hcta', start: 'top 80%', end: 'center 60%', scrub: .6 } });
    gsap.from('.svc-strip span', { opacity: 0, y: 16, duration: .8, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: '.svc-strip', start: 'top 92%', once: true } });
  }

  /* practice: vertical cards + clickable chips */
  const track = $('#hzTrack');
  if (track) {
    const panels = $$('.hz-panel', track), dots = $$('#hzDots button');
    dots.forEach((d, k) => d.onclick = () => { panels[k].classList.add('seen'); goTo('#p' + (k + 1)); });
    const io = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; const k = panels.indexOf(en.target); en.target.classList.add('seen'); dots.forEach((d, j) => d.classList.toggle('on', j === k)); }), { rootMargin: '-35% 0px -55% 0px' });
    panels.forEach(p => io.observe(p));
    panels.forEach(p => gsap.from(p, { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: p, start: 'top 90%', once: true, onEnter: () => setTimeout(() => p.classList.add('seen'), 250) } }));
    if (location.hash) setTimeout(() => goTo(location.hash), 400);
  }

  /* process: ring stepper */
  const ringSec = $('#ringSec');
  if (ringSec) {
    const steps = $$('.ring-step'), fg = $('#ringFg'), C0 = 2 * Math.PI * 88; fg.style.strokeDasharray = C0; fg.style.strokeDashoffset = C0;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      let cur = -1;
      ScrollTrigger.create({ trigger: ringSec, pin: true, start: 'top top', end: '+=' + innerHeight * 3.2, scrub: true,
        onUpdate: s => {
          fg.style.strokeDashoffset = C0 * (1 - s.progress);
          const i = Math.min(steps.length - 1, Math.floor(s.progress * steps.length * .999));
          if (i !== cur) {
            cur = i; $('#ringNum').textContent = pad(i + 1);
            steps.forEach((st, k) => st.classList.toggle('on', k === i));
            $$('#ringTicks i').forEach((t, k) => t.classList.toggle('on', k <= i));
            gsap.fromTo($$('h2, p', steps[i]), { y: 30, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .6, stagger: .08, ease: 'power3.out' });
          }
        } });
    });
    mm.add('(max-width: 900px)', () => { steps.forEach(s => s.classList.add('on')); fg.style.strokeDashoffset = 0; });
    gsap.from('.steps-grid .step-card', { opacity: 0, y: 50, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.steps-grid', start: 'top 85%', once: true } });
  }
  // next-page band
  const nx = $('.next'); if (nx) gsap.from('.next-t', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: nx, start: 'top 90%', once: true } });
}

/* ---------- drawer kept for compatibility (unused pages) ---------- */
const drawer = $('#drawer');
drawer && drawer.addEventListener('click', e => { if (e.target.closest('[data-close]')) drawer.classList.remove('open'); });

/* ---------- boot ---------- */
render(); hdrState(); globe();
enter(() => { pageIntro(); initAnims(); hdrState(); setTimeout(() => ScrollTrigger.refresh(), 400); });
if (document.fonts) document.fonts.ready.then(() => hasG && ScrollTrigger.refresh());
})();
