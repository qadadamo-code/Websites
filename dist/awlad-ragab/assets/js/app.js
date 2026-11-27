(() => {
'use strict';
const C = window.AR_CONFIG, M = window.AR_MENU;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement, body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
const url = new URL(location.href);
const TABLE = (url.searchParams.get('table') || '').replace(/\D/g, '').slice(0, 3);
const wa = (txt) => `https://wa.me/${C.whatsapp}${txt ? '?text=' + encodeURIComponent(txt) : ''}`;
const fmt = n => (Math.round(n * 10) / 10).toLocaleString('en-US');
const findItem = n => { for (const c of M) for (const it of c.items) if (it.n === n) return { c, it }; };
const priceOf = (n, l) => findItem(n).it.o.find(o => o.l === l).p;

/* static */
$('#phoneTxt').textContent = C.phone;
['#waBig', '#waVisit'].forEach(s => $(s).href = wa('أهلاً مشويات أولاد رجب، عايز أطلب 🔥'));
['#callBig', '#callVisit'].forEach(s => $(s).href = 'tel:' + C.phone);
const tick = ['كباب ضاني', 'كفتة ضاني', 'كفتة كندوز', 'طرب ضاني', 'ريش ريشة بريشة', 'فرخة شيش', 'حواوشي', 'أرز بسمتي بالكبدة', 'شوربة لسان عصفور', 'على الفحم'];
$('#ticker').innerHTML = [...tick, ...tick, ...tick, ...tick].map(t => `<span>${t}</span>`).join('');
if (TABLE) { root.classList.add('table-on'); $('#tableBar').hidden = false; $('#tableNo').textContent = TABLE; }
const clk = () => { const d = new Date(); let h = d.getHours(), m = d.getMinutes(); const ap = h < 12 ? 'ص' : 'م'; h = h % 12 || 12; $('#clock').textContent = `${h}:${String(m).padStart(2, '0')} ${ap}`; };
clk(); setInterval(clk, 20000);
fetch('assets/img/qr.svg').then(r => r.text()).then(s => $('#qrCode').innerHTML = s).catch(() => {});

/* intro */
const intro = $('#intro');
let introDone = false;
const endIntro = () => { if (introDone) return; introDone = true; intro.style.transition = 'opacity .6s, visibility .6s'; intro.style.opacity = 0; intro.style.visibility = 'hidden'; heroIn(); };
addEventListener('load', () => setTimeout(endIntro, reduce ? 0 : 2200));
setTimeout(endIntro, 4000);

/* smooth scroll */
let lenis = null;
if (window.Lenis && !reduce && !weak && matchMedia('(pointer:fine)').matches) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
const goTo = el => { if (!el) return; const y = el.getBoundingClientRect().top + scrollY - (TABLE ? 110 : 70); lenis ? lenis.scrollTo(y) : scrollTo({ top: y, behavior: 'smooth' }); };
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length < 2) return; e.preventDefault(); goTo($(id)); body.classList.remove('nav-open'); }));
const hdr = $('#hdr');
const onScroll = () => hdr.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$('#navBtn').onclick = () => body.classList.toggle('nav-open');

const G = window.gsap, ST = window.ScrollTrigger;
if (G && ST) { G.registerPlugin(ST); if (lenis) lenis.on('scroll', ST.update); }
function heroIn() {
  if (!G || reduce) return;
  G.from('.hero-title .ln>span', { yPercent: 110, duration: 1, ease: 'power4.out', stagger: .12 });
  G.from('.h-in', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: .25 });
  G.from('.hs', { y: 20, opacity: 0, duration: .8, stagger: .08, delay: .5 });
}

/* HERO frame sequence */
const canvas = $('#seq'), ctx = canvas.getContext('2d'), poster = $('#seqPoster');
const mob = () => innerWidth <= 640;
const SEQ = { d: { n: 80, path: 'assets/seq/d/' }, m: { n: 80, path: 'assets/seq/m/' } };
let key = null, frames = [], cur = -1, prog = 0;
function loadSeq() {
  const k = mob() ? 'm' : 'd'; if (k === key) return; key = k; frames = []; cur = -1;
  const S = SEQ[k];
  for (let i = 0; i < S.n; i++) {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { if (i === 0 || i === target()) draw(true); };
    im.src = `${S.path}${String(i + 1).padStart(3, '0')}.webp`; frames.push(im);
  }
}
function size() { const dpr = Math.min(devicePixelRatio || 1, weak ? 1 : 1.5); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; draw(true); }
const target = () => Math.round(Math.min(1, prog / .85) * (SEQ[key || 'd'].n - 1));
function draw(force) {
  let t = target(); if (!force && t === cur) return;
  let im = frames[t];
  if (!im || !im.complete || !im.naturalWidth) { for (let j = t; j >= 0; j--) { if (frames[j] && frames[j].complete && frames[j].naturalWidth) { im = frames[j]; t = j; break; } } }
  if (!im || !im.naturalWidth) return;
  cur = t;
  const cw = canvas.width, ch = canvas.height;
  if (key === 'm') {
    const r = Math.max(cw / im.naturalWidth, (ch * .66) / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
    ctx.fillStyle = '#0e0a08'; ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(im, (cw - w) / 2, Math.min(ch * .04, ch - h), w, h);
  } else {
    const r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
    ctx.drawImage(im, (cw - w) * .3, (ch - h) / 2, w, h);
  }
  poster.classList.add('off');
}
loadSeq(); size();
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { loadSeq(); size(); emSize(); }, 150); });
if (G && ST) {
  ST.create({ trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => { prog = s.progress; requestAnimationFrame(() => draw()); } });
  if (!mob()) G.to('.hero-copy', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '#hero', start: '55% bottom', end: '85% bottom', scrub: true } });
  G.to('.hero-stats,.scroll-hint', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=300', scrub: true } });
  G.to('.fam-bg img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.family', start: 'top bottom', end: 'bottom top', scrub: true } });
  G.to('.craft-media img', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.craft', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* embers */
const em = $('#embers'), ex = em.getContext('2d');
let parts = [], emOn = true;
function emSize() { em.width = em.clientWidth; em.height = em.clientHeight; }
emSize();
const N = reduce ? 0 : (mob() || weak ? 26 : 60);
const spawn = (init) => ({ x: Math.random() * em.width, y: init ? Math.random() * em.height : em.height + 10, r: Math.random() * 2 + .6, vy: Math.random() * .9 + .4, vx: (Math.random() - .5) * .5, a: Math.random() * .6 + .4, w: Math.random() * 6.28 });
for (let i = 0; i < N; i++) parts.push(spawn(true));
new IntersectionObserver(es => emOn = es[0].isIntersecting).observe($('#hero'));
(function loop() {
  requestAnimationFrame(loop); if (!emOn || !N) return;
  ex.clearRect(0, 0, em.width, em.height);
  for (const p of parts) {
    p.y -= p.vy; p.w += .03; p.x += p.vx + Math.sin(p.w) * .3; p.a -= .0016;
    if (p.y < -10 || p.a <= 0) Object.assign(p, spawn(false));
    ex.beginPath(); ex.arc(p.x, p.y, p.r, 0, 6.28);
    ex.fillStyle = `rgba(255,${120 + (p.r * 30 | 0)},40,${p.a})`; ex.shadowBlur = 8; ex.shadowColor = '#ff7a2a'; ex.fill();
  }
})();

/* MOODS */
const minP = c => Math.min(...c.items.flatMap(i => i.o.map(o => o.p)));
$('#moodGrid').innerHTML = M.map(c => `<a class="mood rv" href="#menu" data-cat="${c.id}">
    <img src="assets/img/${c.img}.webp" alt="${c.t}" loading="lazy">
    <span class="go"><svg viewBox="0 0 24 24"><path d="M17 7L7 17M8 7h9v9"/></svg></span>
    <div class="mood-tx"><h3>${c.t}</h3><p>${c.s}</p><span class="from">من ${fmt(minP(c))} ج</span></div></a>`).join('');
$$('.mood').forEach(m => m.addEventListener('click', e => { e.preventDefault(); setTab(m.dataset.cat); goTo($('#menu')); }));

/* CART */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('ar-cart') || '[]'); } catch (e) {}
const save = () => { try { localStorage.setItem('ar-cart', JSON.stringify(cart)); } catch (e) {} };
const toast = t => { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1600); };
function push(item) { const k = item.name + '|' + item.size; const f = cart.find(x => x.k === k); f ? f.q += item.q : cart.push({ ...item, k }); }
function add(item) {
  push(item); save(); renderCart();
  const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast(`✓ ${item.name}${item.size ? ' – ' + item.size : ''} في السلة`);
}
function renderCart() {
  const n = cart.reduce((a, x) => a + x.q, 0), tot = cart.reduce((a, x) => a + x.q * x.unit, 0);
  $('#cartCount').textContent = n; $('#fabCount').textContent = n; $('#fabTotal').textContent = fmt(tot); $('#cartTotal').textContent = fmt(tot);
  const fab = $('#fab'); fab.hidden = false; fab.classList.toggle('show', n > 0 && !body.classList.contains('cart-open'));
  $('#cartList').innerHTML = cart.length ? cart.map((x, i) => `
    <div class="ci"><div><b>${x.name}</b><small>${[x.cat, x.size].filter(Boolean).join(' · ')}</small></div>
    <div class="ci-p">${fmt(x.q * x.unit)} ج</div>
    <div class="qty"><button data-i="${i}" data-d="-1">−</button><b>${x.q}</b><button data-i="${i}" data-d="1">+</button></div></div>`).join('')
    : `<div class="cart-empty">السلة فاضية… الشواية مستنياك 🔥</div>`;
}
$('#cartList').addEventListener('click', e => {
  const b = e.target.closest('button[data-i]'); if (!b) return;
  const x = cart[+b.dataset.i]; x.q += +b.dataset.d; if (x.q <= 0) cart.splice(+b.dataset.i, 1); save(); renderCart();
});
const openCart = o => { body.classList.toggle('cart-open', o); renderCart(); if (lenis) o ? lenis.stop() : lenis.start(); };
$('#cartBtn').onclick = () => openCart(true); $('#fab').onclick = () => openCart(true);
$('#cartClose').onclick = () => openCart(false); $('#scrim').onclick = () => openCart(false);
addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });
function seg(el, idx) { $$('button', el).forEach((b, i) => b.classList.toggle('on', i === idx)); $('.seg-ind', el).style.transform = `translateX(${-idx * 100}%)`; }

let mode = TABLE ? 'table' : 'delivery';
function setMode(m) { mode = m; seg($('#mode'), ['delivery', 'pickup', 'table'].indexOf(m)); $('#fAddr').hidden = m !== 'delivery'; $('#fTable').hidden = m !== 'table'; }
$$('#mode button').forEach(b => b.onclick = () => setMode(b.dataset.m));
if (TABLE) $('#fTable').value = TABLE;
setMode(mode);
try { const s = JSON.parse(localStorage.getItem('ar-who') || '{}'); $('#fName').value = s.n || ''; $('#fPhone').value = s.p || ''; $('#fAddr').value = s.a || ''; } catch (e) {}
$('#sendWa').onclick = () => {
  if (!cart.length) { toast('السلة فاضية'); return; }
  const n = $('#fName').value.trim(), p = $('#fPhone').value.trim(), a = $('#fAddr').value.trim(), t = $('#fTable').value.trim(), note = $('#fNote').value.trim();
  if (mode === 'delivery' && !a) { toast('اكتب العنوان علشان نوصلك'); $('#fAddr').focus(); return; }
  if (mode === 'table' && !t) { toast('اكتب رقم الترابيزة'); $('#fTable').focus(); return; }
  try { localStorage.setItem('ar-who', JSON.stringify({ n, p, a })); } catch (e) {}
  const tot = cart.reduce((s, x) => s + x.q * x.unit, 0);
  const lines = cart.map(x => `• ${x.q} × ${x.name}${x.size ? ' (' + x.size + ')' : ''} = ${fmt(x.q * x.unit)} ج`);
  const how = mode === 'delivery' ? `🛵 توصيل إلى: ${a}` : mode === 'pickup' ? '🏃 استلام من المحل' : `🍽️ ترابيزة رقم: ${t}`;
  const msg = ['🔥 طلب جديد – مشويات أولاد رجب', '', ...lines, '', `الإجمالي: ${fmt(tot)} ج`, how, n ? `الاسم: ${n}` : '', p ? `الموبايل: ${p}` : '', note ? `ملاحظات: ${note}` : ''].filter((l, i, arr) => l !== '' || arr[i - 1] !== '').join('\n');
  window.open(wa(msg), '_blank');
};

/* SCALE */
const meats = M.flatMap(c => c.items.filter(it => it.o.length === 3 && it.o[2].l === 'كيلو').map(it => ({ it, c })));
const GRAMS = [250, 500, 1000];
let sc = { m: 0, w: 1, q: 1 };
(function buildDial() {
  const cx = 200, cy = 200, R = 186, a0 = -135, a1 = 135;
  let s = `<defs><linearGradient id="emb" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#c8321a"/><stop offset=".6" stop-color="#ff7a2a"/><stop offset="1" stop-color="#ffc24a"/></linearGradient></defs>`;
  s += `<circle cx="200" cy="200" r="196" fill="#15100c" stroke="rgba(255,236,214,.08)" stroke-width="2"/>`;
  for (let g = 0; g <= 1000; g += 50) {
    const a = (a0 + (a1 - a0) * g / 1000) * Math.PI / 180, big = g % 250 === 0, r2 = big ? R - 22 : R - 12;
    const x1 = cx + Math.sin(a) * (R - 2), y1 = cy - Math.cos(a) * (R - 2), x2 = cx + Math.sin(a) * r2, y2 = cy - Math.cos(a) * r2;
    s += `<line class="tk${big ? ' big' : ''}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    if (big) { const xt = cx + Math.sin(a) * (R - 40), yt = cy - Math.cos(a) * (R - 40) + 5; s += `<text x="${xt.toFixed(1)}" y="${yt.toFixed(1)}" text-anchor="middle">${['0', '¼', '½', '¾', '1'][g / 250]}</text>`; }
  }
  const len = 2 * Math.PI * (R - 50) * 270 / 360;
  s += `<path class="arc" id="arc" d="${arcPath(cx, cy, R - 50, a0, a1)}" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${len.toFixed(1)}" data-len="${len.toFixed(1)}"/>`;
  $('#dial').innerHTML = s;
  function arcPath(cx, cy, r, s, e) { const p = a => [cx + Math.sin(a * Math.PI / 180) * r, cy - Math.cos(a * Math.PI / 180) * r]; const [x1, y1] = p(s), [x2, y2] = p(e); return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 1 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; }
})();
$('#scMeat').innerHTML = meats.map((m, i) => `<button class="chip" data-m="${i}">${m.it.n.replace(' (ريشة بريشة)', '')}</button>`).join('');
function scRender(swap) {
  const { it, c } = meats[sc.m], g = GRAMS[sc.w];
  $$('#scMeat .chip').forEach((b, i) => b.classList.toggle('on', i === sc.m));
  seg($('#scW'), sc.w);
  $('#needle').style.transform = `rotate(${-135 + 270 * g / 1000}deg)`;
  const arc = $('#arc'), L = +arc.dataset.len; arc.style.strokeDashoffset = L * (1 - g / 1000);
  $('#dialG').textContent = g.toLocaleString('en-US');
  $('#dish').style.transform = `scale(${[.72, .86, 1][sc.w]})`;
  if (swap) { const im = $('#dishImg'); im.style.opacity = 0; setTimeout(() => { im.src = `assets/img/${c.img}.webp`; im.onload = () => im.style.opacity = 1; }, 160); }
  $('#kiloNote').innerHTML = `سعر الكيلو: <b>${fmt(it.o[2].p)} ج</b> · النص ${fmt(it.o[1].p)} · الربع ${fmt(it.o[0].p)}`;
  $('#qVal').textContent = sc.q;
  $('#scPrice').textContent = fmt(it.o[sc.w].p * sc.q);
}
$('#scMeat').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; sc.m = +b.dataset.m; scRender(true); };
$$('#scW button').forEach(b => b.onclick = () => { sc.w = +b.dataset.i; scRender(); });
$('#qMinus').onclick = () => { sc.q = Math.max(1, sc.q - 1); scRender(); };
$('#qPlus').onclick = () => { sc.q = Math.min(20, sc.q + 1); scRender(); };
$('#scAdd').onclick = () => { const { it, c } = meats[sc.m]; add({ name: it.n, cat: c.t, size: it.o[sc.w].l, unit: it.o[sc.w].p, q: sc.q }); sc.q = 1; scRender(); };
scRender();
if (ST) ST.create({ trigger: '#scale', start: 'top 70%', once: true, onEnter: () => { const a = $('#arc'); a.style.transition = 'none'; a.style.strokeDashoffset = a.dataset.len; void a.getBoundingClientRect(); a.style.transition = ''; scRender(); } });

/* FEAST */
const SPLIT = [['كفتة ضاني', .35], ['كباب ضاني', .25], ['طرب ضاني', .2], ['كفتة كندوز', .2]];
const WL = ['ربع كيلو', 'نص كيلو', 'كيلو'];
let ppl = 6, rows = [];
function weightRows(name, grams) {
  let q = Math.max(1, Math.round(grams / 250)); const out = [];
  const k = Math.floor(q / 4); q %= 4;
  if (k) out.push({ name, size: 'كيلو', q: k });
  if (q >= 2) { out.push({ name, size: 'نص كيلو', q: 1 }); q -= 2; }
  if (q) out.push({ name, size: 'ربع كيلو', q: 1 });
  return out;
}
function feast() {
  $('#pN').textContent = ppl; $('#pRange').value = ppl; $('#trayPpl').textContent = `لـ ${ppl} أفراد`;
  const meat = ppl * 300 * .8;
  rows = SPLIT.flatMap(([n, f]) => weightRows(n, meat * f));
  const halves = Math.ceil(ppl / 4);
  if (Math.floor(halves / 2)) rows.push({ name: 'فرخة شيش كاملة', size: 'السعر', q: Math.floor(halves / 2) });
  if (halves % 2) rows.push({ name: 'نص فرخة شيش', size: 'السعر', q: 1 });
  rows.push({ name: 'أرز بسمتي عادي', size: 'عائلي', q: Math.ceil(ppl / 4) });
  rows.push({ name: 'شوربة لسان عصفور', size: 'السعر', q: ppl });
  rows.forEach(r => { const f = findItem(r.name); r.cat = f.c.t; r.unit = priceOf(r.name, r.size); });
  const tot = rows.reduce((a, r) => a + r.q * r.unit, 0);
  $('#trayList').innerHTML = rows.map(r => `<div class="tr"><span class="tq-n">${r.q} ×</span><span>${r.name}${r.size !== 'السعر' ? `<small>${r.size}</small>` : ''}</span><b>${fmt(r.q * r.unit)} ج</b></div>`).join('');
  $('#trayTot').textContent = fmt(tot); $('#trayPer').textContent = `يعني حوالي ${Math.round(tot / ppl)} ج للفرد`;
}
$('#pMinus').onclick = () => { ppl = Math.max(2, ppl - 1); feast(); };
$('#pPlus').onclick = () => { ppl = Math.min(30, ppl + 1); feast(); };
$('#pRange').oninput = e => { ppl = +e.target.value; feast(); };
$('#trayAdd').onclick = () => { rows.forEach(r => push({ name: r.name, cat: r.cat, size: r.size === 'السعر' ? '' : r.size, unit: r.unit, q: r.q })); save(); renderCart(); toast(`✓ عزومة ${ppl} أفراد في السلة`); openCart(true); };
feast();

/* MENU */
let tab = 'all', q = '';
$('#tabs').innerHTML = `<button class="tab on" data-t="all">الكل</button>` + M.map(c => `<button class="tab" data-t="${c.id}">${c.t}</button>`).join('');
function setTab(t) { tab = t; $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === t)); renderMenu(); const b = $(`.tab[data-t="${t}"]`); b && b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }
$('#tabs').onclick = e => { const b = e.target.closest('.tab'); if (b) setTab(b.dataset.t); };
$('#q').oninput = e => { q = e.target.value.trim(); renderMenu(); };
const norm = s => s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
function renderMenu() {
  const nq = norm(q);
  const html = M.filter(c => tab === 'all' || c.id === tab).map(c => {
    const items = c.items.map((it, i) => ({ it, i })).filter(({ it }) => !nq || norm(it.n + ' ' + c.t).includes(nq));
    if (!items.length) return '';
    return `<div class="cat" id="cat-${c.id}">
      <div class="cat-hd"><div class="ph"><img src="assets/img/${c.img}-s.webp" alt="${c.t}" loading="lazy"></div><div><h3>${c.t}</h3><p>${c.s}</p></div><span class="cnt">${c.items.length} ${c.items.length > 1 ? 'أصناف' : 'صنف'}</span></div>
      <div class="items">${items.map(({ it, i }) => `<div class="it"><div class="nm"><span>${it.n}</span>${it.tag ? `<span class="tag">${it.tag}</span>` : ''}</div>${it.d ? `<p class="ds">${it.d}</p>` : ''}
        <div class="pbs ${it.o.length === 1 ? 'one' : ''}" style="--n:${it.o.length}">${it.o.map((o, s) => `<button class="pb" data-c="${c.id}" data-i="${i}" data-s="${s}" aria-label="${it.n} ${o.l} ${o.p} جنيه"><small>${o.l}</small><b>${fmt(o.p)}<i>ج</i></b></button>`).join('')}</div></div>`).join('')}</div></div>`;
  }).join('');
  $('#menuBody').innerHTML = html || `<div class="empty">مفيش صنف بالاسم ده… جرّب كلمة تانية</div>`;
  if (ST) ST.refresh();
}
$('#menuBody').addEventListener('click', e => {
  const b = e.target.closest('button.pb'); if (!b) return;
  const c = M.find(x => x.id === b.dataset.c), it = c.items[+b.dataset.i], o = it.o[+b.dataset.s];
  add({ name: it.n, cat: c.t, size: o.l === 'السعر' ? '' : o.l, unit: o.p, q: 1 });
  b.classList.add('added'); setTimeout(() => b.classList.remove('added'), 700);
});
renderMenu(); renderCart();

/* reveals */
if (G && ST && !reduce) {
  ST.batch('.rv', { start: 'top 90%', once: true, onEnter: els => G.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }) });
  $$('.sec-head, .scale-panel, .fam-copy, .tray, .real-in>div, .craft-in, .del-copy, .qr-in, .visit-card').forEach(el => G.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }));
} else $$('.rv').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });
})();
