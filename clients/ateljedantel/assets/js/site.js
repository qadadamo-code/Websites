/* Ateljé Dantel — site behaviour: intro, smooth scroll, reveals, cart, wishlist, search, shop filters, product page. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const T = k => (window.AD && AD.t[k]) || k;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const kr = n => (Math.round(n * 100) / 100).toLocaleString('sv-SE', { minimumFractionDigits: n % 1 ? 2 : 0 }).replace(/\s/g, ' ') + ' kr';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const svg = n => ({
  heart: '<svg class="i" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
  bag: '<svg class="i" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>', minus: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>', arrow: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
}[n]);

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  const el = $('#toast'); if (!el) return;
  el.innerHTML = svg('check') + '<span>' + esc(msg) + '</span>';
  el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- catalogue (cart, wishlist, search) ---------- */
let CAT = null, PROD = {}, VAR = {};
const catReady = fetch(AD.cat, { credentials: 'same-origin' }).then(r => r.json()).then(list => {
  CAT = list; list.forEach(p => { PROD[p.id] = p; p.v.forEach(v => { VAR[v.id] = { p, v }; }); });
  pruneCart(); renderCart(); renderWish(); counts();
  return list;
}).catch(() => { CAT = []; });

/* ---------- cart ---------- */
const getCart = () => store.get('ad_cart', []);
const setCart = c => { store.set('ad_cart', c); renderCart(); counts(true); };
function pruneCart() { if (!CAT) return; const c = getCart().filter(i => VAR[i.v]); if (c.length !== getCart().length) store.set('ad_cart', c); }
function addToCart(vid, q = 1) {
  const c = getCart(); const hit = c.find(i => i.v === vid);
  const info = VAR[vid]; const max = info && !info.v.order ? Math.max(1, info.v.stock) : 9;
  if (hit) hit.q = Math.min(max, hit.q + q); else c.push({ v: vid, q: Math.min(max, q) });
  setCart(c); toast(T('ui.added'));
  setTimeout(() => openPanel('cart'), 350);
}
function cartTotal() { return getCart().reduce((s, i) => s + (VAR[i.v] ? VAR[i.v].v.price * i.q : 0), 0); }
function renderCart() {
  const list = $('#cartList'); if (!list) return;
  const c = getCart();
  if (!c.length || !CAT) {
    list.innerHTML = '<div class="empty">' + svg('bag') + '<p>' + T('ui.cartempty') + '</p><a class="btn btn--line btn--sm" href="butik.php">' + T('ui.continue') + '</a></div>';
    $('#cartFt').hidden = true; return;
  }
  $('#cartFt').hidden = false;
  list.innerHTML = c.map(i => {
    const x = VAR[i.v]; if (!x) return '';
    const meta = [x.v.color, x.v.size && (T('ui.size') + ' ' + x.v.size)].filter(Boolean).join(' · ');
    return '<div class="li"><a href="produkt.php?p=' + esc(x.p.slug) + '"><img src="' + esc(x.v.img || x.p.img) + '" alt=""></a><div><h4>' + esc(x.p.title) + '</h4><small>' + esc(meta) + '</small>' +
      (x.v.order ? '<small>' + T('ui.order') + '</small>' : '') +
      '<div class="qty"><button data-q="-1" data-v="' + esc(i.v) + '" aria-label="-">' + svg('minus') + '</button><span>' + i.q + '</span><button data-q="1" data-v="' + esc(i.v) + '" aria-label="+">' + svg('plus') + '</button></div></div>' +
      '<div style="text-align:right"><span class="price">' + kr(x.v.price * i.q) + '</span><br><button class="li__x" data-rm="' + esc(i.v) + '">' + T('ui.remove') + '</button></div></div>';
  }).join('');
  $('#cartSub').textContent = kr(cartTotal());
}
document.addEventListener('click', e => {
  const q = e.target.closest('[data-q][data-v]');
  if (q) { const c = getCart(); const it = c.find(i => i.v === q.dataset.v); if (!it) return; const x = VAR[it.v]; const max = x && !x.v.order ? Math.max(1, x.v.stock) : 9; it.q = Math.max(1, Math.min(max, it.q + (+q.dataset.q))); setCart(c); return; }
  const rm = e.target.closest('[data-rm]');
  if (rm) { setCart(getCart().filter(i => i.v !== rm.dataset.rm)); }
});

/* ---------- wishlist ---------- */
const getWish = () => store.get('ad_wish', []).filter(x => typeof x === 'string' && x.length > 1);
function toggleWish(id, btn) {
  let w = getWish(); const on = !w.includes(id);
  w = on ? [id, ...w] : w.filter(x => x !== id); store.set('ad_wish', w);
  $$('[data-wish="' + CSS.escape(id) + '"]').forEach(b => { b.classList.toggle('on', on); if (on) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } });
  renderWish(); counts(true);
  if (on) toast(T('ui.wishadd'));
}
function markWish() { const w = getWish(); $$('button[data-wish], a[data-wish]').forEach(b => b.classList.toggle('on', w.includes(b.dataset.wish))); }
function renderWish() {
  markWish();
  const list = $('#wishList'); if (!list) return;
  const w = getWish().filter(id => !CAT || PROD[id]);
  if (!w.length) { list.innerHTML = '<div class="empty">' + svg('heart') + '<p>' + T('ui.wishempty') + '</p></div>'; return; }
  if (!CAT) return;
  list.innerHTML = w.map(id => { const p = PROD[id]; return '<div class="li"><a href="produkt.php?p=' + esc(p.slug) + '"><img src="' + esc(p.img) + '" alt=""></a><div><h4>' + esc(p.title) + '</h4><small>' + esc(p.brand) + '</small><span class="price">' + (p.max > p.price ? T('ui.from') + ' ' : '') + kr(p.price) + '</span></div><div style="text-align:right"><a class="btn btn--sm" href="produkt.php?p=' + esc(p.slug) + '">' + T('ui.view') + '</a><br><br><button class="li__x" data-wish-rm="' + esc(id) + '">' + T('ui.remove') + '</button></div></div>'; }).join('');
}
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-wish], a[data-wish]'); if (b) { e.preventDefault(); toggleWish(b.dataset.wish, b); return; }
  const r = e.target.closest('[data-wish-rm]'); if (r) toggleWish(r.dataset.wishRm);
});
function counts(bump) {
  const n = getCart().reduce((s, i) => s + i.q, 0), w = getWish().length;
  $$('[data-count="cart"]').forEach(el => { el.textContent = n; if (el.classList.contains('count')) { el.hidden = !n; if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } } });
  $$('[data-count="wish"]').forEach(el => { el.textContent = w; if (el.classList.contains('count')) el.hidden = !w; });
}
counts(); markWish();
window.addEventListener('storage', e => { if (e.key === 'ad_cart' || e.key === 'ad_wish') { renderCart(); renderWish(); counts(); } });

/* ---------- panels ---------- */
let lastFocus = null;
function openPanel(id) {
  closePanels(true);
  const el = document.querySelector('[data-panel="' + id + '"]') || document.getElementById(id); if (!el) return;
  lastFocus = document.activeElement;
  el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.classList.add('has-panel');
  if (window.__lenis) window.__lenis.stop();
  if (id === 'search') setTimeout(() => $('#q').focus(), 300);
  else setTimeout(() => { const f = el.querySelector('button,a,input'); f && f.focus({ preventScroll: true }); }, 350);
}
function closePanels(silent) {
  $$('.open[data-panel],.modal.open,.filters.open').forEach(el => { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); });
  document.body.classList.remove('has-panel');
  if (window.__lenis) window.__lenis.start();
  if (!silent && lastFocus) lastFocus.focus({ preventScroll: true });
}
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openPanel(o.dataset.open); return; }
  if (e.target.closest('[data-close]')) closePanels();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePanels();
  if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openPanel('search'); }
});
$('#modal') && $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closePanels(); });

/* ---------- theme ---------- */
document.addEventListener('click', e => {
  if (!e.target.closest('[data-theme-toggle]')) return;
  const r = document.documentElement; const dark = r.dataset.theme !== 'dark';
  r.dataset.theme = dark ? 'dark' : 'light'; store.set('ad_theme_x', 1);
  try { localStorage.setItem('ad_theme', r.dataset.theme); } catch (er) {}
});

/* ---------- search ---------- */
const qi = $('#q');
function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function runSearch() {
  const box = $('#qres'); if (!box || !CAT) return;
  const q = norm(qi.value.trim());
  if (!q) { box.innerHTML = ''; return; }
  const terms = q.split(/\s+/);
  const res = CAT.filter(p => { const h = norm(p.q); return terms.every(t => h.includes(t)); }).slice(0, 18);
  box.innerHTML = res.length ? res.map(p => '<a class="sr" href="produkt.php?p=' + esc(p.slug) + '"><img src="' + esc(p.img) + '" alt="" loading="lazy"><b>' + esc(p.title) + '</b><span>' + (p.max > p.price ? T('ui.from') + ' ' : '') + kr(p.price) + '</span></a>').join('')
    : '<p class="muted" style="grid-column:1/-1">' + T('ui.noresults') + '</p>';
}
if (qi) {
  qi.addEventListener('input', () => catReady.then(runSearch));
  qi.addEventListener('keydown', e => { if (e.key === 'Enter') { const a = $('#qres a'); if (a) location.href = a.href; } });
  $$('[data-q]').forEach(b => { if (!b.dataset.v) b.addEventListener('click', () => { qi.value = b.dataset.q; catReady.then(runSearch); qi.focus(); }); });
}

/* ---------- quick view ---------- */
function variantPicker(p, opts = {}) {
  const colors = []; p.v.forEach(v => { if (!colors.find(c => c.hex === v.hex)) colors.push({ hex: v.hex, name: v.color }); });
  return { colors };
}
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-quick]'); if (!b) return;
  e.preventDefault(); await catReady;
  const p = PROD[b.dataset.quick]; if (!p) return;
  const body = $('#modalBody');
  let cur = p.v.find(v => v.stock > 0 || v.order) || p.v[0];
  const colors = variantPicker(p).colors.filter(c => c.hex);
  const draw = () => {
    const sizes = p.v.filter(v => !colors.length || v.hex === cur.hex);
    body.innerHTML = '<div class="qv"><div class="qv__img"><img src="' + esc(cur.img || p.img) + '" alt=""></div><div class="qv__body">' +
      '<span class="pinfo__brand">' + esc(p.brand) + '</span><h3>' + esc(p.title) + '</h3>' +
      '<div class="pinfo__price">' + (cur.compare ? '<s>' + kr(cur.compare) + '</s>' : '') + '<span>' + kr(cur.price) + '</span></div>' +
      (colors.length > 1 ? '<div class="opt"><div class="opt__hd"><span>' + T('ui.color') + ': <b>' + esc(cur.color) + '</b></span></div><div class="swatches">' + colors.map(c => '<button class="swatch' + (c.hex === cur.hex ? ' on' : '') + '" style="--c:' + esc(c.hex) + '" data-qc="' + esc(c.hex) + '" aria-label="' + esc(c.name) + '"></button>').join('') + '</div></div>' : '') +
      (sizes.some(v => v.size) ? '<div class="opt"><div class="opt__hd"><span>' + T('ui.size') + '</span></div><div class="sizes">' + sizes.map(v => '<button class="size' + (v.id === cur.id ? ' on' : '') + (v.stock > 0 || v.order ? '' : ' out') + '" data-qs="' + esc(v.id) + '">' + esc(v.size || '—') + '</button>').join('') + '</div></div>' : '') +
      '<button class="btn btn--block" data-qadd ' + (cur.stock > 0 || cur.order ? '' : 'disabled') + '>' + svg('bag') + ' ' + (cur.stock > 0 || cur.order ? T('ui.add') : T('ui.soldout')) + '</button>' +
      '<a class="link" href="produkt.php?p=' + esc(p.slug) + '">' + T('ui.view') + ' ' + svg('arrow') + '</a></div></div>';
  };
  draw();
  body.onclick = ev => {
    const c = ev.target.closest('[data-qc]'); if (c) { cur = p.v.find(v => v.hex === c.dataset.qc && (v.stock > 0 || v.order)) || p.v.find(v => v.hex === c.dataset.qc); draw(); return; }
    const s = ev.target.closest('[data-qs]'); if (s) { cur = p.v.find(v => v.id === s.dataset.qs); draw(); return; }
    if (ev.target.closest('[data-qadd]')) { closePanels(true); addToCart(cur.id); }
  };
  openPanel('modal');
});

/* ---------- newsletter ---------- */
$$('[data-news]').forEach(f => f.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = f.parentElement.querySelector('.news__msg'); const fd = new FormData(f);
  try {
    const r = await fetch('api/newsletter.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: fd.get('email'), website: fd.get('website'), lang: AD.lang }) });
    const d = await r.json();
    msg.style.color = d.ok ? '' : 'var(--red)'; msg.textContent = d.ok ? T('home.newsOk') : (d.msg || T('f.err'));
    if (d.ok) f.reset();
  } catch (er) { msg.style.color = 'var(--red)'; msg.textContent = T('f.err'); }
}));

/* ---------- motion ---------- */
function splitLines(el) {
  if (el.dataset.split) return [];
  el.dataset.split = 1;
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  el.innerHTML = text.split(' ').map(w => '<span class="w" style="display:inline-block">' + esc(w) + '</span>').join(' ');
  const words = $$('.w', el); const lines = []; let top = null, cur = null;
  words.forEach(w => { const t = w.offsetTop; if (t !== top) { cur = []; lines.push(cur); top = t; } cur.push(w.textContent); });
  el.innerHTML = lines.map(l => '<span class="tr-line"><span>' + esc(l.join(' ')) + '</span><i class="tr-block"></i></span>').join('');
  return $$('.tr-line', el);
}

function initMotion() {
  const G = window.gsap, ST = window.ScrollTrigger;
  if (!G || !ST || reduce) { document.documentElement.classList.add('no-motion'); runIntro(null); return; }
  G.registerPlugin(ST);
  let lenis = null;
  if (window.Lenis && !matchMedia('(pointer:coarse)').matches) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis;
    lenis.on('scroll', ST.update);
    G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); } }));
  }

  /* headline line reveal with a red block wipe */
  const lineReveal = (el, delay = 0) => {
    const lines = splitLines(el);
    lines.forEach((ln, i) => {
      const inner = ln.firstElementChild, block = ln.lastElementChild;
      G.set(inner, { opacity: 0 });
      const tl = G.timeline({ delay: delay + i * 0.12, paused: true });
      tl.to(block, { scaleX: 1, duration: .45, ease: 'power3.inOut', transformOrigin: 'left' })
        .set(inner, { opacity: 1 })
        .to(block, { scaleX: 0, duration: .5, ease: 'power3.inOut', transformOrigin: 'right' });
      ln._tl = tl;
    });
    return lines;
  };
  const heroTitle = $('.hero__title');
  const heroLines = heroTitle ? lineReveal(heroTitle, 0) : [];
  $$('[data-lines]').forEach(el => {
    if (el === heroTitle) return;
    const lines = lineReveal(el);
    ST.create({ trigger: el, start: 'top 86%', once: true, onEnter: () => lines.forEach(l => l._tl.play()) });
  });
  /* rise */
  const heroRise = $$('.hero [data-rise]');
  ST.batch($$('[data-rise]').filter(el => !heroRise.includes(el)), { start: 'top 90%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .08 }) });

  const heroIn = () => {
    heroLines.forEach(l => l._tl.play());
    G.to(heroRise, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .1, delay: .25 });
    G.from('.arch--hero', { clipPath: 'inset(100% 0 0 0 round 999px 999px 18px 18px)', duration: 1.5, ease: 'expo.inOut' });
    G.from('.arch--hero video', { scale: 1.3, duration: 2, ease: 'expo.out' });
    G.fromTo('.arch--mini', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, delay: .6, ease: 'expo.out' });
    G.fromTo('.hero__stamp', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 1.2, delay: .9, ease: 'back.out(1.6)', clearProps: 'transform' });
    countUp();
  };
  runIntro(heroIn);

  /* parallax */
  $$('[data-speed]').forEach(el => G.fromTo(el, { yPercent: -parseFloat(el.dataset.speed) * 50 }, { yPercent: parseFloat(el.dataset.speed) * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('[data-float]').forEach(el => G.to(el, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));

  /* ribbon marquee reacting to scroll velocity */
  $$('[data-marquee]').forEach(tr => {
    let x = 0, dir = -1, v = 0;
    const w = () => tr.scrollWidth / 3;
    ST.create({ trigger: tr, start: 'top bottom', end: 'bottom top', onUpdate: s => { v = s.getVelocity() / 300; dir = s.direction === 1 ? -1 : 1; } });
    G.ticker.add(() => { x += (0.6 + Math.min(Math.abs(v), 8)) * dir; v *= 0.92; const W = w(); if (x < -W) x += W; if (x > 0) x -= W; tr.style.transform = 'translate3d(' + x + 'px,0,0)'; });
  });

  /* fitting-room mirror */
  const mirror = $('.mirror');
  if (mirror) {
    const slides = $$('.mirror__slide', mirror), infos = $$('.mirror__info', mirror), dots = $$('.mirror__list li', mirror), now = $('.mirror__now', mirror);
    const n = slides.length;
    const tl = G.timeline({ scrollTrigger: { trigger: mirror, start: 'top top+=' + 76, end: 'bottom bottom', scrub: .6,
      onUpdate: s => { const i = Math.min(n - 1, Math.floor(s.progress * n * 0.999 + 0.15)); infos.forEach((el, k) => el.classList.toggle('on', k === i)); dots.forEach((el, k) => el.classList.toggle('on', k === i)); if (now) now.textContent = String(i + 1).padStart(2, '0'); } } });
    slides.forEach((s, i) => {
      const img = s.firstElementChild;
      if (i > 0) tl.fromTo(s, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'none', duration: 1 }, i - 1).fromTo(img, { scale: 1.3, yPercent: 8 }, { scale: 1.08, yPercent: 0, ease: 'none', duration: 1 }, i - 1);
      else tl.fromTo(img, { scale: 1.15 }, { scale: 1.05, ease: 'none', duration: .6 }, 0);
    });
    tl.to({}, { duration: .4 });
  }

  /* journey thread draws while you scroll */
  const thread = $('.journey__thread path');
  if (thread) { const L = thread.getTotalLength(); G.fromTo(thread, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.journey__steps', start: 'top 80%', end: 'bottom 50%', scrub: true } }); }

  /* product cards rise in grids */
  ST.batch($$('.grid .card, .related .card'), { start: 'top 94%', once: true, onEnter: b => G.from(b, { y: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: .06, clearProps: 'transform,opacity' }) });

  /* header hide on scroll down */
  const hd = $('#hd'); let lastY = 0;
  ST.create({ start: 0, end: 'max', onUpdate: s => { const y = s.scroll(); hd.classList.toggle('is-scrolled', y > 10); hd.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('has-panel')); lastY = y; } });
  window.addEventListener('load', () => ST.refresh());
}

function countUp() {
  $$('[data-count-to]').forEach(el => { const to = +el.dataset.countTo; const o = { v: 0 }; window.gsap && gsap.to(o, { v: to, duration: 2.2, delay: .6, ease: 'expo.out', onUpdate: () => { el.textContent = Math.round(o.v); } }); });
}

/* intro: D strokes in, the red ribbon unrolls, letters rise, curtains part */
function runIntro(after) {
  const intro = $('#intro');
  const done = () => { if (intro) intro.remove(); after && after(); };
  if (!intro || document.documentElement.classList.contains('no-intro') || !window.gsap || reduce) { done(); return; }
  try { sessionStorage.setItem('ad_intro', 1); } catch (e) {}
  const G = gsap, logo = $('.intro__logo', intro);
  const D = $('#d', logo), red = $('#red', logo), at = $$('#at path', logo), da = $$('#da path', logo), tg = $('#tg', logo);
  const L = D.getTotalLength ? D.getTotalLength() : 3000;
  G.set(D, { fill: 'transparent', stroke: 'currentColor', strokeWidth: 3, strokeDasharray: L, strokeDashoffset: L });
  G.set(red, { clipPath: 'inset(0 0 100% 0)' });
  G.set([...at, ...da], { opacity: 0, y: 40 });
  G.set(tg, { opacity: 0, letterSpacing: 0 });
  G.set(logo, { opacity: 1 });
  if (window.__lenis) window.__lenis.stop();
  document.documentElement.style.overflow = 'hidden';
  const tl = G.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { document.documentElement.style.overflow = ''; if (window.__lenis) window.__lenis.start(); done(); } });
  tl.to(D, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' })
    .to(D, { fill: 'currentColor', strokeWidth: 0, duration: .5 }, '-=.25')
    .to(red, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.inOut' }, '-=.9')
    .to(da, { opacity: 1, y: 0, duration: .9, stagger: .06 }, '-=.6')
    .to(at, { opacity: 1, y: 0, duration: .8, stagger: .04 }, '-=.7')
    .to(tg, { opacity: 1, duration: .8 }, '-=.4')
    .to(logo, { scale: .92, opacity: 0, duration: .6, ease: 'power2.in' }, '+=.35')
    .to('.intro__curtain--l', { xPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=.15')
    .to('.intro__curtain--r', { xPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
    .add(() => { after && after(); after = null; }, '-=.75');
  intro.addEventListener('click', () => tl.progress(1));
}

/* ---------- featured rail: drag, arrows, progress ---------- */
$$('[data-rail]').forEach(rail => {
  const bar = rail.parentElement.querySelector('[data-rail-bar]');
  const upd = () => { if (!bar) return; const max = rail.scrollWidth - rail.clientWidth; const r = rail.clientWidth / rail.scrollWidth; bar.style.width = (r * 100) + '%'; bar.style.transform = 'translateX(' + (max > 0 ? rail.scrollLeft / max * (1 / r - 1) * 100 : 0) + '%)'; };
  rail.addEventListener('scroll', upd, { passive: true }); upd(); window.addEventListener('resize', upd);
  let down = false, sx = 0, sl = 0, moved = 0;
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; });
  window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 5) rail.classList.add('drag'); rail.scrollLeft = sl - dx; });
  window.addEventListener('pointerup', () => { down = false; setTimeout(() => rail.classList.remove('drag'), 0); });
  rail.addEventListener('click', e => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
  $$('[data-slide]', rail.closest('section')).forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: (+b.dataset.slide) * rail.clientWidth * .8, behavior: 'smooth' })));
});

/* ---------- cursor image reveal (story) ---------- */
$$('[data-reveal-img]').forEach(box => {
  if (matchMedia('(pointer:coarse)').matches) { box.style.setProperty('--rr', '2000px'); box.style.cursor = 'auto'; return; }
  let tx = 50, ty = 50, x = 50, y = 50, r = 0, tr = 0, raf = 0;
  const loop = () => { x += (tx - x) * .16; y += (ty - y) * .16; r += (tr - r) * .12; box.style.setProperty('--mx', x + '%'); box.style.setProperty('--my', y + '%'); box.style.setProperty('--rr', r + 'px'); if (Math.abs(tr - r) > .5 || Math.abs(tx - x) > .1) raf = requestAnimationFrame(loop); else raf = 0; };
  const go = () => { if (!raf) raf = requestAnimationFrame(loop); };
  box.addEventListener('pointermove', e => { const b = box.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width * 100; ty = (e.clientY - b.top) / b.height * 100; tr = Math.max(130, b.width * .26); go(); });
  box.addEventListener('pointerleave', () => { tr = 0; go(); });
});

/* ---------- services hover list ---------- */
$$('[data-svc]').forEach(w => {
  const lis = $$('li', w), imgs = $$('.svc__view img', w);
  lis.forEach((li, i) => li.addEventListener('pointerenter', () => { lis.forEach(l => l.classList.toggle('on', l === li)); imgs.forEach((im, k) => im.classList.toggle('on', k === i)); }));
});

/* ---------- shop: filters, sort ---------- */
const shop = $('#shop');
if (shop) {
  const grid = $('#grid'), cards = $$('.card', grid), form = $('#filters'), countEl = $('#count'), sortSel = $('#sort');
  const state = () => {
    const fd = new FormData(form);
    return { cat: $('.chip.on[data-cat]')?.dataset.cat || '', sizes: fd.getAll('size'), colors: fd.getAll('color'), brands: fd.getAll('brand'),
      min: +fd.get('min') || 0, max: +fd.get('max') || 1e9, sale: fd.get('sale') === '1', stock: fd.get('stock') === '1', sort: sortSel.value };
  };
  const apply = (push = true) => {
    const s = state(); let n = 0;
    cards.forEach(c => {
      const d = c.dataset;
      const ok = (!s.cat || d.cat === s.cat) && (!s.sizes.length || s.sizes.some(z => d.sizes.includes('|' + z + '|'))) && (!s.colors.length || s.colors.some(z => d.colors.includes('|' + z + '|')))
        && (!s.brands.length || s.brands.includes(d.brand)) && +d.price >= s.min && +d.price <= s.max && (!s.sale || d.sale === '1') && (!s.stock || d.stock === '1');
      c.classList.toggle('hide', !ok); if (ok) n++;
    });
    const by = { rec: (a, b) => (+b.dataset.feat - +a.dataset.feat) || (+b.dataset.stock - +a.dataset.stock) || (+b.dataset.new - +a.dataset.new), new: (a, b) => +b.dataset.new - +a.dataset.new, low: (a, b) => +a.dataset.price - +b.dataset.price, high: (a, b) => +b.dataset.price - +a.dataset.price }[s.sort] || null;
    if (by) [...cards].sort(by).forEach(c => grid.appendChild(c));
    $('#nores').hidden = n > 0;
    countEl.textContent = n;
    $$('[data-fcount]').forEach(el => { const k = form.querySelectorAll('input:checked').length + (s.min || s.max < 1e9 ? 1 : 0); el.textContent = k ? '(' + k + ')' : ''; });
    if (push) {
      const u = new URL(location.href);
      const slug = $('.chip.on[data-cat]')?.dataset.slug || '';
      slug ? u.searchParams.set('kat', slug) : u.searchParams.delete('kat');
      s.sort !== 'rec' ? u.searchParams.set('sort', s.sort) : u.searchParams.delete('sort');
      history.replaceState(null, '', u);
    }
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  $$('.chip[data-cat]').forEach(ch => ch.addEventListener('click', e => { e.preventDefault(); $$('.chip[data-cat]').forEach(x => x.classList.toggle('on', x === ch)); apply(); }));
  form.addEventListener('input', () => apply());
  sortSel.addEventListener('change', () => apply());
  $$('[data-clear]').forEach(b => b.addEventListener('click', () => { form.reset(); apply(); }));
  $('#filterBtn')?.addEventListener('click', () => { $('.filters').classList.add('open'); document.body.classList.add('has-panel'); });
  $$('[data-fclose]').forEach(b => b.addEventListener('click', () => { $('.filters').classList.remove('open'); document.body.classList.remove('has-panel'); }));
  apply(false);
}

/* ---------- product page ---------- */
const pd = $('#pd');
if (pd) {
  const P = JSON.parse($('#pdata').textContent);
  const main = $('.gal__main'), thumbs = $('.gal__thumbs'), dotsBox = $('.gal__dots');
  const ok = v => v.stock > 0 || v.order;
  let cur = P.v.find(v => v.id === new URLSearchParams(location.search).get('v')) || P.v.find(ok) || P.v[0];
  let imgs = [], gi = 0, sized = P.v.some(v => v.size) && P.v.length > 1, sizeChosen = !sized || P.v.filter(v => v.hex === cur.hex).length === 1;
  const colors = []; P.v.forEach(v => { if (v.hex && !colors.find(c => c.hex === v.hex)) colors.push({ hex: v.hex, name: v.color }); });
  function setImgs() {
    imgs = cur.images.length ? cur.images : P.images;
    gi = 0;
    thumbs.innerHTML = imgs.map((s, i) => '<button class="' + (i === 0 ? 'on' : '') + '" data-gi="' + i + '" aria-label="' + (i + 1) + '"><img src="' + esc(s) + '" alt="" loading="lazy"></button>').join('');
    dotsBox.innerHTML = imgs.map((s, i) => '<i class="' + (i === 0 ? 'on' : '') + '"></i>').join('');
    show(0);
  }
  function show(i) {
    gi = (i + imgs.length) % imgs.length;
    const im = main.querySelector('img');
    im.style.opacity = 0;
    setTimeout(() => { im.src = imgs[gi]; im.onload = () => { im.style.opacity = 1; }; if (im.complete) im.style.opacity = 1; }, 160);
    $$('button', thumbs).forEach((b, k) => b.classList.toggle('on', k === gi));
    $$('i', dotsBox).forEach((d, k) => d.classList.toggle('on', k === gi));
  }
  function draw() {
    const sw = $('#swatches'), sz = $('#sizes');
    if (sw) sw.innerHTML = colors.map(c => { const any = P.v.some(v => v.hex === c.hex && ok(v)); return '<button class="swatch' + (c.hex === cur.hex ? ' on' : '') + (any ? '' : ' out') + '" style="--c:' + esc(c.hex) + '" data-c="' + esc(c.hex) + '" aria-label="' + esc(c.name) + '" title="' + esc(c.name) + '"></button>'; }).join('');
    $('#colorName') && ($('#colorName').textContent = cur.color || '');
    if (sz) {
      const list = P.v.filter(v => !colors.length || v.hex === cur.hex);
      sz.innerHTML = list.map(v => '<button class="size' + (v.id === cur.id && sizeChosen ? ' on' : '') + (ok(v) ? '' : ' out') + '" data-s="' + esc(v.id) + '"' + (ok(v) ? '' : ' aria-disabled="true"') + '>' + esc(v.size || '—') + (v.order ? '<small>B</small>' : '') + '</button>').join('');
    }
    $('#pprice').innerHTML = (cur.compare ? '<s>' + kr(cur.compare) + '</s>' : '') + '<span>' + kr(cur.price) + '</span>' + (cur.compare ? '<span class="save">-' + Math.round((1 - cur.price / cur.compare) * 100) + '%</span>' : '');
    const st = $('#pstock');
    st.className = 'pinfo__stock' + (cur.order ? ' is-order' : (cur.stock > 0 ? '' : ' is-out'));
    st.innerHTML = '<i></i><span>' + (cur.order ? T('ui.order') : (cur.stock > 0 ? (cur.stock === 1 ? T('ui.onlyone') : T('ui.instock')) : T('ui.soldout'))) + '</span>';
    $('#psku') && ($('#psku').textContent = cur.sku || '');
    const add = $('#addBtn'); add.disabled = !ok(cur);
    add.innerHTML = svg('bag') + ' <span>' + (!ok(cur) ? T('ui.soldout') : (sizeChosen ? T('ui.add') : T('ui.choose'))) + '</span>';
    $('.sticky-buy .price') && ($('.sticky-buy .price').textContent = kr(cur.price));
    const u = new URL(location.href); if (P.v.length > 1) { u.searchParams.set('v', cur.id); history.replaceState(null, '', u); }
  }
  pd.addEventListener('click', e => {
    const c = e.target.closest('[data-c]'); if (c) { const keep = cur.size; cur = P.v.find(v => v.hex === c.dataset.c && v.size === keep && ok(v)) || P.v.find(v => v.hex === c.dataset.c && ok(v)) || P.v.find(v => v.hex === c.dataset.c); sizeChosen = !sized || P.v.filter(v => v.hex === cur.hex).length === 1; setImgs(); draw(); return; }
    const s = e.target.closest('[data-s]'); if (s) { const v = P.v.find(x => x.id === s.dataset.s); if (!ok(v)) return; const imgChange = v.images[0] !== cur.images[0]; cur = v; sizeChosen = true; if (imgChange) setImgs(); draw(); return; }
    const g = e.target.closest('[data-gi]'); if (g) { show(+g.dataset.gi); return; }
    const nv = e.target.closest('[data-gnav]'); if (nv) { show(gi + (+nv.dataset.gnav)); return; }
  });
  const addFn = () => {
    if (!sizeChosen) { $('#sizes').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 320 }); toast(T('ui.choose')); return; }
    catReady.then(() => addToCart(cur.id));
  };
  $('#addBtn').addEventListener('click', addFn);
  $('#stickyAdd') && $('#stickyAdd').addEventListener('click', addFn);
  /* zoom on desktop, swipe on touch */
  main.addEventListener('click', e => { if (e.target.closest('[data-gnav]') || matchMedia('(pointer:coarse)').matches) return; main.classList.toggle('zoom'); });
  main.addEventListener('pointermove', e => { if (!main.classList.contains('zoom')) return; const b = main.getBoundingClientRect(); main.querySelector('img').style.transformOrigin = ((e.clientX - b.left) / b.width * 100) + '% ' + ((e.clientY - b.top) / b.height * 100) + '%'; });
  main.addEventListener('pointerleave', () => main.classList.remove('zoom'));
  let tsx = 0; main.addEventListener('touchstart', e => { tsx = e.touches[0].clientX; }, { passive: true });
  main.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tsx; if (Math.abs(dx) > 40) show(gi + (dx < 0 ? 1 : -1)); }, { passive: true });
  /* share */
  $('[data-share]')?.addEventListener('click', async () => { try { if (navigator.share) await navigator.share({ title: P.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast(T('ui.copied')); } } catch (e) {} });
  /* sticky buy bar on mobile */
  const sb = $('.sticky-buy');
  if (sb && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => sb.classList.toggle('show', !en.isIntersecting && en.boundingClientRect.top < 0), { threshold: 0 }).observe($('#addBtn'));
  /* recently viewed */
  const rv = store.get('ad_recent', []).filter(x => x !== P.id); rv.unshift(P.id); store.set('ad_recent', rv.slice(0, 12));
  setImgs(); draw();
}

/* ---------- size guide modal ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-sizeguide]'); if (!b) return;
  e.preventDefault();
  const body = $('#modalBody');
  body.innerHTML = '<div style="padding:40px 30px">' + ($('#sizeguideTpl') ? $('#sizeguideTpl').innerHTML : '') + '</div>';
  openPanel('modal');
});

/* ---------- boot ---------- */
const boot = () => { initMotion(); };
if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
window.AD.addToCart = addToCart; window.AD.getCart = getCart; window.AD.setCart = setCart; window.AD.catReady = catReady; window.AD.VAR = VAR; window.AD.kr = kr; window.AD.esc = esc; window.AD.toast = toast; window.AD.getWish = getWish; window.AD.PROD = PROD;
})();
