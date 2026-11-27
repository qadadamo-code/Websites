(() => {
'use strict';
const C = window.DJ_CONFIG, M = window.DJ_MENU, SZ = window.DJ_SIZES;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement, body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
const url = new URL(location.href);
const TABLE = (url.searchParams.get('table') || '').replace(/\D/g, '').slice(0, 3);
const wa = (txt) => `https://wa.me/${C.whatsapp}${txt ? '?text=' + encodeURIComponent(txt) : ''}`;

/* ---------- static bits ---------- */
const fmt = n => (Math.round(n * 10) / 10).toString();
$('#phoneTxt').textContent = C.phone;
['#waBig', '#waVisit'].forEach(s => $(s).href = wa('أهلاً فلافل دجلة، عايز أطلب 🧆'));
['#callBig', '#callVisit'].forEach(s => $(s).href = 'tel:' + C.phone);
const tick = ['طعمية سخنة', 'فول مدمس', 'ساندوتشات بيض', 'بطاطس', 'فينو بلدي', 'كبدة إسكندراني', 'شاورما', 'أطباق وعلب', 'خدمة توصيل الطلبات'];
$('#ticker').innerHTML = [...tick, ...tick, ...tick, ...tick].map(t => `<span>${t}</span>`).join('');

if (TABLE) {
  root.classList.add('table-on'); $('#tableBar').hidden = false; $('#tableNo').textContent = TABLE;
}

/* clock */
const clk = () => { const d = new Date(); let h = d.getHours(), m = d.getMinutes(); const ap = h < 12 ? 'ص' : 'م'; h = h % 12 || 12; $('#clock').textContent = `${h}:${String(m).padStart(2, '0')} ${ap}`; };
clk(); setInterval(clk, 20000);

/* QR (table 7 demo) */
fetch('assets/img/qr.svg').then(r => r.text()).then(s => $('#qrCode').innerHTML = s).catch(() => {});

/* ---------- intro ---------- */
const intro = $('#intro');
const endIntro = () => { if (!intro) return; intro.style.transition = 'opacity .6s, visibility .6s'; intro.style.opacity = 0; intro.style.visibility = 'hidden'; heroIn(); };
window.addEventListener('load', () => setTimeout(endIntro, reduce ? 0 : 2300));
setTimeout(endIntro, 4000);

/* ---------- smooth scroll ---------- */
let lenis = null;
if (window.Lenis && !reduce && !weak && matchMedia('(pointer:fine)').matches) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
const goTo = (el) => { if (!el) return; const y = el.getBoundingClientRect().top + scrollY - (TABLE ? 110 : 70); lenis ? lenis.scrollTo(y) : scrollTo({ top: y, behavior: 'smooth' }); };
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length < 2) return; e.preventDefault(); goTo($(id)); body.classList.remove('nav-open'); }));

/* header */
const hdr = $('#hdr');
const onScroll = () => hdr.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$('#navBtn').onclick = () => body.classList.toggle('nav-open');

/* ---------- GSAP ---------- */
const G = window.gsap, ST = window.ScrollTrigger;
if (G && ST) { G.registerPlugin(ST); if (lenis) lenis.on('scroll', ST.update); }

function heroIn() {
  if (!G || reduce) return;
  G.from('.hero-title .ln>span', { yPercent: 110, duration: 1, ease: 'power4.out', stagger: .12 });
  G.from('.h-in', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: .25 });
  G.from('.hs', { y: 20, opacity: 0, duration: .8, stagger: .08, delay: .5 });
}

/* ---------- HERO frame sequence ---------- */
const canvas = $('#seq'), ctx = canvas.getContext('2d'), poster = $('#seqPoster');
const mob = () => innerWidth <= 640;
const SEQ = { d: { n: 72, path: 'assets/seq/d/' }, m: { n: 72, path: 'assets/seq/m/' } };
let key = null, frames = [], cur = -1, prog = 0, loaded = 0;
function loadSeq() {
  const k = mob() ? 'm' : 'd'; if (k === key) return; key = k; frames = []; cur = -1; loaded = 0;
  const S = SEQ[k];
  for (let i = 0; i < S.n; i++) {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { loaded++; if (i === 0 || i === target()) draw(true); };
    im.src = `${S.path}${String(i + 1).padStart(3, '0')}.webp`; frames.push(im);
  }
}
function size() {
  const dpr = Math.min(devicePixelRatio || 1, weak ? 1 : 1.5);
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; draw(true);
}
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
    ctx.fillStyle = '#071a1e'; ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(im, (cw - w) / 2, Math.min(ch * .04, ch - h), w, h);
  } else {
    const r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
    ctx.drawImage(im, (cw - w) * .35, (ch - h) / 2, w, h);
  }
  poster.classList.add('off');
}
loadSeq(); size();
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { loadSeq(); size(); }, 150); });
if (G && ST) {
  ST.create({ trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => { prog = s.progress; requestAnimationFrame(() => draw()); } });
  if (!mob()) G.to('.hero-copy', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '#hero', start: '55% bottom', end: '85% bottom', scrub: true } });
  G.to('.hero-stats,.scroll-hint', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=300', scrub: true } });
  G.to('.fam-bg img', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.family', start: 'top bottom', end: 'bottom top', scrub: true } });
  G.to('.craft-media img', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '.craft', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------- MOODS ---------- */
const moodCats = ['taamia', 'foul', 'eggs', 'potato', 'fino', 'meat', 'plates', 'boxes'];
const minP = c => Math.min(...c.items.flatMap(i => i.p.filter(v => v != null)));
$('#moodGrid').innerHTML = moodCats.map(id => {
  const c = M.find(x => x.id === id);
  return `<a class="mood rv" href="#menu" data-cat="${id}">
    <img src="assets/img/${c.img}.webp" alt="${c.t}" loading="lazy">
    <span class="go"><svg viewBox="0 0 24 24"><path d="M17 7L7 17M8 7h9v9"/></svg></span>
    <div class="mood-tx"><h3>${c.t}</h3><p>${c.s}</p><span class="from">من ${minP(c)} ج</span></div></a>`;
}).join('');
$$('.mood').forEach(m => m.addEventListener('click', e => { e.preventDefault(); setTab(m.dataset.cat); goTo($('#menu')); }));

/* ---------- CART ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('dj-cart') || '[]'); } catch (e) {}
const save = () => { try { localStorage.setItem('dj-cart', JSON.stringify(cart)); } catch (e) {} };
const toast = (t) => { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1600); };
function add(item) {
  const k = [item.name, item.size, (item.extras || []).join('+')].join('|');
  const f = cart.find(x => x.k === k);
  f ? f.q += item.q : cart.push({ ...item, k });
  save(); renderCart();
  const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast(`✓ ${item.name}${item.size ? ' – ' + item.size : ''} في السلة`);
}
function renderCart() {
  const n = cart.reduce((a, x) => a + x.q, 0), tot = cart.reduce((a, x) => a + x.q * x.unit, 0);
  $('#cartCount').textContent = n; $('#fabCount').textContent = n; $('#fabTotal').textContent = fmt(tot); $('#cartTotal').textContent = fmt(tot);
  const fab = $('#fab'); fab.hidden = false; fab.classList.toggle('show', n > 0 && !body.classList.contains('cart-open'));
  $('#cartList').innerHTML = cart.length ? cart.map((x, i) => `
    <div class="ci"><div><b>${x.name}</b><small>${[x.cat, x.size, (x.extras || []).length ? '+ ' + x.extras.join('، ') : ''].filter(Boolean).join(' · ')}</small></div>
    <div class="ci-p">${fmt(x.q * x.unit)} ج</div>
    <div class="qty"><button data-i="${i}" data-d="-1">−</button><b>${x.q}</b><button data-i="${i}" data-d="1">+</button></div></div>`).join('')
    : `<div class="cart-empty">السلة فاضية… اختار حاجة من المنيو 🧆</div>`;
}
$('#cartList').addEventListener('click', e => {
  const b = e.target.closest('button[data-i]'); if (!b) return;
  const x = cart[+b.dataset.i]; x.q += +b.dataset.d; if (x.q <= 0) cart.splice(+b.dataset.i, 1); save(); renderCart();
});
const openCart = (o) => { body.classList.toggle('cart-open', o); renderCart(); if (lenis) o ? lenis.stop() : lenis.start(); };
$('#cartBtn').onclick = () => openCart(true); $('#fab').onclick = () => openCart(true);
$('#cartClose').onclick = () => openCart(false); $('#scrim').onclick = () => openCart(false);
addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });

/* segmented controls */
function seg(el, idx) { const bs = $$('button', el); bs.forEach((b, i) => b.classList.toggle('on', i === idx)); $('.seg-ind', el).style.transform = `translateX(${-idx * 100}%)`; }

/* order mode */
let mode = TABLE ? 'table' : 'delivery';
function setMode(m) {
  mode = m; seg($('#mode'), ['delivery', 'pickup', 'table'].indexOf(m));
  $('#fAddr').hidden = m !== 'delivery'; $('#fTable').hidden = m !== 'table';
}
$$('#mode button').forEach(b => b.onclick = () => setMode(b.dataset.m));
if (TABLE) $('#fTable').value = TABLE;
setMode(mode);
try { const s = JSON.parse(localStorage.getItem('dj-who') || '{}'); $('#fName').value = s.n || ''; $('#fPhone').value = s.p || ''; $('#fAddr').value = s.a || ''; } catch (e) {}

$('#sendWa').onclick = () => {
  if (!cart.length) { toast('السلة فاضية'); return; }
  const n = $('#fName').value.trim(), p = $('#fPhone').value.trim(), a = $('#fAddr').value.trim(), t = $('#fTable').value.trim(), note = $('#fNote').value.trim();
  if (mode === 'delivery' && !a) { toast('اكتب العنوان علشان نوصلك'); $('#fAddr').focus(); return; }
  if (mode === 'table' && !t) { toast('اكتب رقم الترابيزة'); $('#fTable').focus(); return; }
  try { localStorage.setItem('dj-who', JSON.stringify({ n, p, a })); } catch (e) {}
  const tot = cart.reduce((s, x) => s + x.q * x.unit, 0);
  const lines = cart.map(x => `• ${x.q} × ${x.name}${x.size ? ' (' + x.size + ')' : ''}${(x.extras || []).length ? ' + ' + x.extras.join('، ') : ''} = ${fmt(x.q * x.unit)} ج`);
  const how = mode === 'delivery' ? `🛵 توصيل إلى: ${a}` : mode === 'pickup' ? '🏃 استلام من المحل' : `🍽️ ترابيزة رقم: ${t}`;
  const msg = ['🧆 طلب جديد – فلافل دجلة', '', ...lines, '', `الإجمالي: ${fmt(tot)} ج`, how, n ? `الاسم: ${n}` : '', p ? `الموبايل: ${p}` : '', note ? `ملاحظات: ${note}` : ''].filter((l, i, arr) => l !== '' || arr[i - 1] !== '').join('\n');
  window.open(wa(msg), '_blank');
};

/* ---------- STUDIO ---------- */
const stCats = ['taamia', 'foul', 'eggs', 'potato', 'fino', 'meat'];
const find = n => { for (const c of M) for (const it of c.items) if (it.n === n) return it; };
const extras = ['قرص طعمية', 'بيضة مسلوقة', 'مخلل', 'علبة ثومية', 'طبق بطاطس محمرة'].map(n => ({ n, p: find(n).p[0] }));
const stItems = id => M.find(x => x.id === id).items.filter(it => it.p.length === 3);
let st = { cat: 'taamia', item: 0, size: 1, q: 1, ex: new Set() };
$('#stType').innerHTML = stCats.map(id => `<button class="chip" data-c="${id}">${M.find(c => c.id === id).t.replace('ساندوتشات ', '')}</button>`).join('');
$('#stExtras').innerHTML = extras.map((e, i) => `<button class="chip" data-x="${i}">${e.n} +${fmt(e.p)}</button>`).join('');
function stRender(swap) {
  const c = M.find(x => x.id === st.cat), its = stItems(st.cat);
  $$('#stType .chip').forEach(b => b.classList.toggle('on', b.dataset.c === st.cat));
  if (swap) {
    $('#stItem').innerHTML = its.map((it, i) => `<option value="${i}">${it.n}</option>`).join('');
    st.item = 0;
    const img = $('#discImg'); img.style.opacity = 0;
    setTimeout(() => { img.src = `assets/img/${c.img}.webp`; img.onload = () => img.style.opacity = 1; }, 180);
  }
  const it = its[st.item];
  if (it.p[st.size] == null) st.size = it.p.findIndex(v => v != null);
  $$('#stSize button').forEach((b, i) => b.disabled = it.p[i] == null);
  $('#stItem').value = st.item;
  seg($('#stSize'), st.size);
  $('#disc').style.transform = `scale(${[.72, .86, 1][st.size]})`;
  $$('.plate-ring').forEach((r, i) => r.classList.toggle('on', i === st.size));
  $$('.size-tags span').forEach((s, i) => s.classList.toggle('on', i === st.size));
  $$('#stExtras .chip').forEach(b => b.classList.toggle('on', st.ex.has(+b.dataset.x)));
  $('#qVal').textContent = st.q;
  $('#stPrice').textContent = fmt(unitPrice() * st.q);
}
const unitPrice = () => { let p = stItems(st.cat)[st.item].p[st.size]; st.ex.forEach(i => p += extras[i].p); return p; };
$('#discImg').style.transition = 'opacity .25s';
$('#stType').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; st.cat = b.dataset.c; stRender(true); };
$('#stItem').onchange = e => { st.item = +e.target.value; stRender(); };
$$('#stSize button').forEach(b => b.onclick = () => { st.size = +b.dataset.i; stRender(); });
$$('.size-tags span').forEach(s => s.onclick = () => { st.size = +s.dataset.i; stRender(); });
$('#stExtras').onclick = e => { const b = e.target.closest('[data-x]'); if (!b) return; const i = +b.dataset.x; st.ex.has(i) ? st.ex.delete(i) : st.ex.add(i); stRender(); };
$('#qMinus').onclick = () => { st.q = Math.max(1, st.q - 1); stRender(); };
$('#qPlus').onclick = () => { st.q = Math.min(30, st.q + 1); stRender(); };
$('#stAdd').onclick = () => {
  const c = M.find(x => x.id === st.cat);
  add({ name: stItems(st.cat)[st.item].n, cat: c.t, size: SZ[st.size], extras: [...st.ex].map(i => extras[i].n), unit: unitPrice(), q: st.q });
  st.q = 1; st.ex.clear(); stRender();
};
stRender(true);

/* ---------- FAMILY TRAY ---------- */
const TRAY = [
  ['طبق فول مدمس', n => Math.ceil(n / 2)], ['طبق طعمية سادة', n => Math.ceil(n / 2)], ['طبق بطاطس محمرة', n => Math.ceil(n / 3)],
  ['طبق عجة بيض سادة', n => Math.ceil(n / 4)], ['بيضة مسلوقة', n => Math.ceil(n / 3)], ['سلطة بلدي', n => Math.ceil(n / 4)],
  ['طبق طحينة', n => Math.ceil(n / 5)], ['مخلل', n => Math.ceil(n / 4)], ['رغيف عيش بلدي كبير', n => n * 2]
];
let ppl = 4, trayRows = [];
function trayRender() {
  $('#pN').textContent = ppl; $('#pRange').value = ppl; $('#trayPpl').textContent = ppl === 1 ? 'لفرد واحد' : `لـ ${ppl} أفراد`;
  trayRows = TRAY.map(([n, f]) => ({ n, q: f(ppl), p: find(n).p[0] }));
  const tot = trayRows.reduce((a, r) => a + r.q * r.p, 0);
  $('#trayList').innerHTML = trayRows.map(r => `<div class="tr"><span class="tq-n">${r.q}×</span><span>${r.n}</span><b>${fmt(r.q * r.p)} ج</b></div>`).join('');
  $('#trayTot').textContent = fmt(tot); $('#trayPer').textContent = `يعني حوالي ${Math.round(tot / ppl)} ج للفرد`;
}
$('#pMinus').onclick = () => { ppl = Math.max(1, ppl - 1); trayRender(); };
$('#pPlus').onclick = () => { ppl = Math.min(12, ppl + 1); trayRender(); };
$('#pRange').oninput = e => { ppl = +e.target.value; trayRender(); };
$('#trayAdd').onclick = () => {
  trayRows.forEach(r => { const k = [r.n, '', ''].join('|'); const f = cart.find(x => x.k === k); f ? f.q += r.q : cart.push({ name: r.n, cat: 'فطار العيلة', size: '', extras: [], unit: r.p, q: r.q, k }); });
  save(); renderCart(); toast(`✓ فطار ${ppl} أفراد في السلة`); openCart(true);
};
trayRender();

/* ---------- MENU ---------- */
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
      <div class="cat-hd">${c.img ? `<div class="ph"><img src="assets/img/${c.img}-s.webp" alt="${c.t}" loading="lazy"></div>` : '<div class="ph ph-ic">🥣</div>'}<div><h3>${c.t}</h3><p>${c.s}</p></div><span class="cnt">${c.items.length} صنف</span></div>
      <div class="items">${items.map(({ it, i }) => { const sized = it.p.length === 3; return `<div class="it"><div class="nm"><span>${it.n}</span>${it.tag ? `<span class="tag">${it.tag}</span>` : ''}</div>
        <div class="pbs ${sized ? '' : 'one'}">${it.p.map((p, s) => p == null ? `<span class="pb na"><small>${SZ[s]}</small><b>—</b></span>` : `<button class="pb" data-c="${c.id}" data-i="${i}" data-s="${s}" aria-label="${it.n} ${sized ? SZ[s] : ''} ${fmt(p)} جنيه"><small>${sized ? SZ[s] : 'السعر'}</small><b>${fmt(p)}<i>ج</i></b></button>`).join('')}</div></div>`; }).join('')}</div></div>`;
  }).join('');
  $('#menuBody').innerHTML = html || `<div class="empty">مفيش صنف بالاسم ده… جرّب كلمة تانية</div>`;
  if (ST) ST.refresh();
}
$('#menuBody').addEventListener('click', e => {
  const b = e.target.closest('button.pb'); if (!b) return;
  const c = M.find(x => x.id === b.dataset.c), it = c.items[+b.dataset.i], s = +b.dataset.s;
  add({ name: it.n, cat: c.t, size: it.p.length === 3 ? SZ[s] : '', extras: [], unit: it.p[s], q: 1 });
  b.classList.add('added'); setTimeout(() => b.classList.remove('added'), 700);
});
renderMenu(); renderCart();

/* ---------- reveals ---------- */
if (G && ST && !reduce) {
  ST.batch('.rv', { start: 'top 90%', once: true, onEnter: els => G.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }) });
  $$('.sec-head, .studio-panel, .fam-copy, .tray, .craft-in, .del-copy, .qr-in, .visit-card').forEach(el => G.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }));
} else $$('.rv').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; });
})();
