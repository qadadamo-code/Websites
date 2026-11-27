(() => {
'use strict';
const C = window.CO_CONFIG, M = window.CO_MENU, SZ = window.CO_SIZES, B = window.CO_BUILDER;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement, body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 4) <= 2;
const url = new URL(location.href);
const TABLE = (url.searchParams.get('table') || '').replace(/\D/g, '').slice(0, 3);
const wa = (txt) => `https://wa.me/${C.whatsapp}${txt ? '?text=' + encodeURIComponent(txt) : ''}`;

/* ---------- i18n ---------- */
const T = {
  tableBar: ['أنت على ترابيزة رقم', 'You are at table'], tableSub: ['اطلب من موبايلك والطلب يوصل للمطبخ على طول', 'Order from your phone, it goes straight to the kitchen'],
  nMenu: ['المنيو', 'Menu'], nBuilder: ['اعمل الكريب بتاعك', 'Build your crepe'], nPizza: ['البيتزا', 'Pizza'], nStory: ['حكايتنا', 'Our story'], nVisit: ['تواصل', 'Contact'],
  heroEye: ['من 2010 · كريب وبيتزا', 'Since 2010 · Crepes & Pizza'],
  heroL1: ['الصاج سخن.', 'The griddle is hot.'], heroL2: ['والفرن ولّع.', 'The oven is on.'],
  heroSub: ['كريب بيتعمل قدامك على الصاج، وبيتزا طالعة من الفرن على طول. نفس الطعم اللي حبيته من 2010، بفرق تحسه من أول قطمة.', 'Crepes made on the griddle right in front of you, and pizza straight out of the oven. The taste you have loved since 2010, with a difference you feel from the first bite.'],
  ctaOrder: ['اطلب دلوقتي', 'Order now'], ctaBuild: ['اعمل الكريب بتاعك', 'Build your crepe'],
  st1: ['البداية', 'Since'], st2: ['صنف في المنيو', 'Menu items'], st3: ['دقيقة توصيل تقريبا', 'Min delivery approx.'],
  scroll: ['انزل وشوف الكريب بيتعمل', 'Scroll to watch it being made'],
  step1: ['1 العجينة', '1 Batter'], step2: ['2 الحشو', '2 Filling'], step3: ['3 الجبنة', '3 Cheese'], step4: ['4 التطبيقة', '4 The fold'],
  firesK: ['نارين… ومطبخ واحد', 'Two fires, one kitchen'], firesH: ['صاج للكريب، وفرن للبيتزا', 'A griddle for crepes, an oven for pizza'], firesP: ['اسحب الخط واختار مزاجك النهارده.', 'Drag the line and pick your mood today.'],
  dCrepe: ['الكريب', 'Crepes'], dCrepeS: ['رقيق، مقرمش من بره، ومليان من جوه', 'Thin, crispy outside, loaded inside'], seeCrepe: ['منيو الكريب', 'Crepe menu'],
  dPizza: ['البيتزا', 'Pizza'], dPizzaS: ['عجينة بتختمر كل يوم، وجبنة بتشد', 'Dough proofed daily, cheese that stretches'], seePizza: ['منيو البيتزا', 'Pizza menu'],
  sigBadge: ['الأكثر طلبا', 'Best seller'], sigK: ['سيجنتشر Crepe One', 'Crepe One Signature'], sigH: ['لما الكريب قابل البيتزا', 'When crepe met pizza'],
  sigP: ['صوص بيتزا، موتزاريلا بتشد، بيبروني وزيتون… كلهم جوه كريب مقرمش متقفل زي البوكس. اختراعنا اللي الناس بتيجي مخصوص علشانه.', 'Pizza sauce, stretchy mozzarella, pepperoni and olives, all sealed inside a crispy crepe box. Our own invention that people come for.'],
  sigL1: ['عجينة كريب طازة كل يوم', 'Fresh crepe batter every day'], sigL2: ['موتزاريلا 100%', '100% mozzarella'], sigL3: ['بيتقفل على الصاج قدامك', 'Sealed on the griddle in front of you'],
  egp: ['ج', 'EGP'], addCart: ['أضف للسلة', 'Add to cart'],
  bK: ['ستوديو الكريب', 'Crepe Studio'], bH: ['اعمل الكريب بتاعك', 'Build your own crepe'], bP: ['اختار الحشو والإضافات والصوص وطريقة التطبيق، والسعر بيتحسب قدامك.', 'Pick fillings, extras, sauce and fold. The price updates live.'],
  kSav: ['حادق', 'Savory'], kSwt: ['حلو', 'Sweet'], g1: ['الحشو الأساسي', 'Main filling'], g1s: ['اختار لحد 2', 'Up to 2'], g2: ['الإضافات', 'Extras'], g3: ['الصوص', 'Sauce'], g4: ['طريقة التطبيق', 'Fold'],
  pzK: ['من الفرن على طول', 'Straight from the oven'], pzH: ['بيتزا بعجينة بتختمر 24 ساعة', 'Pizza on 24-hour proofed dough'], pzP: ['اختار البيتزا والحجم، وإحنا علينا الباقي.', 'Pick your pizza and size, we handle the rest.'],
  mK: ['المنيو كامل', 'Full menu'], mH: ['كل اللي نفسك فيه', 'Everything you crave'], mP: ['دوس على السعر والصنف يتضاف للسلة على طول.', 'Tap a price to add it to your cart.'],
  searchPh: ['دور على صنف… كفتة، نوتيلا، بيبروني', 'Search… kofta, Nutella, pepperoni'],
  sampleNote: ['* الأسعار والأصناف تجريبية للعرض، وهتتحدث بمنيو المطعم الحقيقي.', '* Items and prices are a sample and will be replaced with the real menu.'],
  sK: ['حكايتنا', 'Our story'], sH: ['من صاج واحد في 2010… لاسم الناس بتسأل عليه', 'From one griddle in 2010 to a name people ask for'],
  sP: ['بدأنا بصاج كريب واحد وفكرة بسيطة: كل حاجة تتعمل طازة وقدام الزبون. السنين عدت، والمنيو كبر، ودخل الفرن، بس الفكرة زي ما هي. علشان كده بنقولها بثقة: جرب الفرق.', 'We started with one crepe griddle and a simple idea: everything made fresh, in front of the guest. Years passed, the menu grew and the oven arrived, but the idea stayed. That is why we say it with confidence: try the difference.'],
  n1: ['سنة خبرة', 'Years'], n2: ['صنف', 'Items'], n3: ['% طازة كل يوم', '% fresh daily'],
  qrTable: ['ترابيزة 7', 'Table 7'], qK: ['جوه المطعم', 'Dine in'], qH: ['امسح الكود… واطلب من ترابيزتك', 'Scan the code, order from your table'],
  qP: ['على كل ترابيزة كود QR. بتمسحه، الموقع بيعرف رقم ترابيزتك، وطلبك بيوصل للمطبخ على واتساب من غير ما تستنى حد.', 'Every table has a QR code. Scan it, the site knows your table number, and your order reaches the kitchen on WhatsApp without waiting.'],
  qTry: ['جرب كأنك على ترابيزة 7', 'Try it as table 7'],
  vK: ['تواصل معانا', 'Get in touch'], vH: ['جعان؟ إحنا على بعد رسالة', 'Hungry? We are one message away'],
  vWa: ['اطلب على واتساب', 'Order on WhatsApp'], vCall: ['اتصل بينا', 'Call us'], vHours: ['مواعيدنا', 'Opening hours'], vAddr: ['العنوان', 'Address'],
  fTag: ['كريب وبيتزا من 2010 · Try the difference', 'Crepes & pizza since 2010 · Try the difference'], fBy: ['تصميم وتطوير', 'Designed & built by'],
  viewCart: ['عرض السلة', 'View cart'], cartH: ['طلبك', 'Your order'], mDel: ['توصيل', 'Delivery'], mPick: ['استلام', 'Pickup'], mTable: ['ترابيزة', 'Table'],
  phName: ['الاسم', 'Name'], phPhone: ['رقم الموبايل', 'Mobile number'], phAddr: ['العنوان بالتفصيل', 'Full address'], phTable: ['رقم الترابيزة', 'Table number'], phNote: ['ملاحظات (بدون بصل، سبايسي زيادة…)', 'Notes (no onions, extra spicy…)'],
  total: ['الإجمالي', 'Total'], sendWa: ['ابعت الطلب على واتساب', 'Send order on WhatsApp']
};
const D = {
  ticker: [['كريب على الصاج', 'بيتزا من الفرن', 'بيتزا كريب', 'كريب حلو', 'من 2010', 'Try the difference', 'توصيل سريع'], ['Griddle crepes', 'Oven pizza', 'Pizza crepe', 'Sweet crepes', 'Since 2010', 'Try the difference', 'Fast delivery']],
  all: ['الكل', 'All'], items: ['صنف', 'items'], price: ['السعر', 'Price'], emptyCart: ['السلة فاضية… اختار حاجة حلوة من المنيو', 'Your cart is empty. Pick something tasty from the menu'],
  noRes: ['مفيش صنف بالاسم ده… جرب كلمة تانية', 'No match. Try another word'], added: ['في السلة', 'added'], cartEmpty: ['السلة فاضية', 'Cart is empty'],
  needAddr: ['اكتب العنوان علشان نوصلك', 'Please add your address'], needTable: ['اكتب رقم الترابيزة', 'Please add the table number'],
  hot: ['الأكثر طلبا', 'Popular'], chef: ['اختيار الشيف', "Chef's pick"], custom: ['كريب على مزاجك', 'Custom crepe'],
  sauce: ['صوص', 'sauce'], fold: ['تطبيق', 'fold'], pickFill: ['اختار حشو واحد على الأقل', 'Pick at least one filling'], max2: ['لحد 2 بس', 'Up to 2 only'],
  delFee: (f, o) => [`التوصيل ${f} ج · مجاني للطلبات فوق ${o} ج`, `Delivery ${f} EGP · free over ${o} EGP`],
  waHi: ['أهلا Crepe One، عايز أطلب', 'Hi Crepe One, I would like to order'],
  order: ['طلب جديد – Crepe One', 'New order – Crepe One'], to: ['توصيل إلى', 'Deliver to'], pickup: ['استلام من المحل', 'Pickup from store'], tbl: ['ترابيزة رقم', 'Table'],
  name: ['الاسم', 'Name'], mob: ['الموبايل', 'Mobile'], notes: ['ملاحظات', 'Notes'], dfee: ['التوصيل', 'Delivery'], free: ['مجاني', 'Free'], sum: ['الإجمالي', 'Total'], cur: ['ج', 'EGP']
};
let L = 'ar';
try { L = url.searchParams.get('lang') === 'en' ? 'en' : (localStorage.getItem('co-lang') || 'ar'); } catch (e) {}
const li = () => (L === 'ar' ? 0 : 1);
const tx = (k) => (Array.isArray(D[k]) ? D[k][li()] : k);
const nm = (o) => o[L] || o.ar;

function applyLang() {
  root.lang = L; root.dir = L === 'ar' ? 'rtl' : 'ltr';
  $$('[data-t]').forEach(el => { const v = T[el.dataset.t]; if (v) el.textContent = v[li()]; });
  $$('[data-tp]').forEach(el => { const v = T[el.dataset.tp]; if (v) el.placeholder = v[li()]; });
  $('#langBtn').textContent = L === 'ar' ? 'EN' : 'ع';
  document.title = L === 'ar' ? 'Crepe One | كريب وان – كريب وبيتزا' : 'Crepe One | Crepes & Pizza since 2010';
  const tk = D.ticker[li()]; $('#ticker').innerHTML = [...tk, ...tk, ...tk, ...tk].map(t => `<span>${t}</span>`).join('');
  $('#hoursTxt').textContent = C.hours[L]; $('#addrTxt').textContent = C.address[L];
  $('#delNote').textContent = D.delFee(C.delivery, C.freeOver)[li()];
  $('#bFoldShape').innerHTML = FOLD_SVG[bs.fold] || '';
  renderTabs(); renderMenu(); renderCart(); bRender(true); pzRender(true);
  $$('#pzSize button').forEach((b, i) => b.textContent = SZ[L][i]);
  [['#mode', mode]].forEach(() => setMode(mode));
  if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 50);
}
$('#langBtn').onclick = () => { L = L === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('co-lang', L); } catch (e) {} applyLang(); };

/* ---------- static ---------- */
$('#waNum').textContent = '+20 ' + C.phone.slice(1);
$('#phoneNum').textContent = C.phone;
$('#mapBtn').href = C.maps;
$('#callBig').href = 'tel:' + C.phone;
$('#waBig').onclick = (e) => { e.preventDefault(); window.open(wa(tx('waHi')), '_blank'); };
$('#waBig').href = wa();
if (TABLE) { root.classList.add('table-on'); $('#tableBar').hidden = false; $('#tableNo').textContent = TABLE; }
fetch('assets/img/qr.svg').then(r => r.text()).then(s => $('#qrCode').innerHTML = s).catch(() => {});

/* ---------- intro ---------- */
const intro = $('#intro');
let introDone = false;
const endIntro = () => { if (introDone) return; introDone = true; intro.style.transition = 'opacity .7s, visibility .7s'; intro.style.opacity = 0; intro.style.visibility = 'hidden'; heroIn(); };
addEventListener('load', () => setTimeout(endIntro, reduce ? 0 : 2200));
setTimeout(endIntro, 4200);

/* ---------- smooth scroll ---------- */
let lenis = null;
if (window.Lenis && !reduce && !weak && matchMedia('(pointer:fine)').matches) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
const offs = () => (TABLE ? 120 : 64);
const goTo = (el) => { if (!el) return; const y = el.getBoundingClientRect().top + scrollY - offs(); lenis ? lenis.scrollTo(y) : scrollTo({ top: y, behavior: 'smooth' }); };
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href'); if (id.length < 2) return; e.preventDefault();
  if (a.dataset.cat) setTab(a.dataset.cat);
  goTo(id === '#top' ? body : $(id)); body.classList.remove('nav-open');
});
const hdr = $('#hdr');
const onScroll = () => hdr.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$('#navBtn').onclick = () => body.classList.toggle('nav-open');

/* ---------- GSAP ---------- */
const G = window.gsap, ST = window.ScrollTrigger;
if (G && ST) { G.registerPlugin(ST); if (lenis) lenis.on('scroll', ST.update); }
function heroIn() {
  if (!G || reduce) return;
  G.from('.hero-title .ln>span', { yPercent: 110, duration: 1.05, ease: 'power4.out', stagger: .12 });
  G.from('.h-in', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1, delay: .25 });
  G.from('.hs', { y: 20, opacity: 0, duration: .8, stagger: .08, delay: .5 });
}

/* ---------- HERO sequence ---------- */
const canvas = $('#seq'), ctx = canvas.getContext('2d'), poster = $('#seqPoster');
const mob = () => innerWidth <= 640;
const SEQ = { d: { n: 90, path: 'assets/seq/d/' }, m: { n: 90, path: 'assets/seq/m/' } };
let key = null, frames = [], cur = -1, prog = 0;
function loadSeq() {
  const k = mob() ? 'm' : 'd'; if (k === key) return; key = k; frames = []; cur = -1;
  const S = SEQ[k];
  const order = []; for (let s = 8; s >= 1; s = s / 2 | 0) { for (let i = 0; i < S.n; i += s) if (!order.includes(i)) order.push(i); if (s === 1) break; }
  frames = new Array(S.n);
  order.forEach((i, n) => setTimeout(() => {
    const im = new Image(); im.decoding = 'async';
    im.onload = () => { if (i === 0 || i === target()) draw(true); };
    im.src = `${S.path}${String(i + 1).padStart(3, '0')}.webp`; frames[i] = im;
  }, n < 12 ? 0 : 20 + n * 6));
}
function size() { const dpr = Math.min(devicePixelRatio || 1, weak ? 1 : 1.5); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; draw(true); }
const target = () => Math.round(Math.min(1, prog / .9) * (SEQ[key || 'd'].n - 1));
function draw(force) {
  let t = target(); if (!force && t === cur) return;
  let im = frames[t];
  if (!im || !im.complete || !im.naturalWidth) { im = null; for (let j = t; j >= 0; j--) { const f = frames[j]; if (f && f.complete && f.naturalWidth) { im = f; t = j; break; } } }
  if (!im) return;
  cur = t;
  const cw = canvas.width, ch = canvas.height;
  if (key === 'm') {
    const r = Math.max(cw / im.naturalWidth, (ch * .62) / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
    ctx.fillStyle = '#0e100f'; ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(im, (cw - w) / 2, 0, w, h);
  } else {
    const r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
    const ox = L === 'ar' ? (cw - w) * .2 : (cw - w) * .8;
    ctx.drawImage(im, ox, (ch - h) / 2, w, h);
  }
  poster.classList.add('off');
}
loadSeq(); size();
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { loadSeq(); size(); }, 150); });
const steps = $$('.hero-steps span');
if (G && ST) {
  ST.create({ trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => {
    prog = s.progress; requestAnimationFrame(() => draw());
    const k = Math.min(3, Math.floor(prog / .9 * 4)); steps.forEach((el, i) => el.classList.toggle('on', i <= k));
  } });
  G.to('.hero-stats,.scroll-hint', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=300', scrub: true } });
  if (!mob()) G.to('.hero-copy', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '#hero', start: '60% bottom', end: '92% bottom', scrub: true } });
  else G.to('.hero-copy', { opacity: 0, y: -40, ease: 'none', scrollTrigger: { trigger: '#hero', start: '35% bottom', end: '60% bottom', scrub: true } });
  G.to('.sig-media img', { scale: 1, ease: 'none', scrollTrigger: { trigger: '.sig', start: 'top bottom', end: 'bottom top', scrub: true } });
}
steps[0] && steps[0].classList.add('on');

/* ---------- DUAL slider ---------- */
const dual = $('#dual'), handle = $('#dualHandle');
let dx = 50, dragging = false;
const setX = (v) => { dx = Math.max(6, Math.min(94, v)); dual.style.setProperty('--x', dx + '%'); handle.setAttribute('aria-valuenow', Math.round(dx)); };
const fromEv = (e) => { const r = dual.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; setX(x / r.width * 100); };
handle.addEventListener('pointerdown', e => { dragging = true; dual.classList.add('drag'); handle.setPointerCapture(e.pointerId); });
handle.addEventListener('pointermove', e => { if (dragging) fromEv(e); });
handle.addEventListener('pointerup', () => { dragging = false; dual.classList.remove('drag'); });
dual.addEventListener('click', e => { if (e.target.closest('a')) return; fromEv(e); });
handle.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') setX(dx - 5); if (e.key === 'ArrowRight') setX(dx + 5); });
if (G && ST && !reduce) { const o = { v: 82 }; setX(82); G.to(o, { v: 50, duration: 1.4, ease: 'power3.inOut', onUpdate: () => setX(o.v), scrollTrigger: { trigger: dual, start: 'top 70%', once: true } }); }

/* ---------- CART ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('co-cart') || '[]'); } catch (e) {}
const save = () => { try { localStorage.setItem('co-cart', JSON.stringify(cart)); } catch (e) {} };
const toast = (t) => { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1700); };
/* item: {n:{ar,en}, s:[ar,en]|null, x:[ar,en]|null, unit, q} */
const lbl = (o) => (o ? o[li()] : '');
function add(item) {
  const k = [item.n.ar, lbl(item.s), lbl(item.x)].join('|');
  const f = cart.find(x => x.k === k);
  f ? f.q += item.q : cart.push({ ...item, k });
  save(); renderCart();
  const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast(`✓ ${nm(item.n)}${item.s ? ' – ' + lbl(item.s) : ''} ${tx('added')}`);
}
function renderCart() {
  const n = cart.reduce((a, x) => a + x.q, 0), tot = cart.reduce((a, x) => a + x.q * x.unit, 0);
  $('#cartCount').textContent = n; $('#fabCount').textContent = n; $('#fabTotal').textContent = tot; $('#cartTotal').textContent = tot;
  const fab = $('#fab'); fab.hidden = false; fab.classList.toggle('show', n > 0 && !body.classList.contains('cart-open'));
  $('#cartList').innerHTML = cart.length ? cart.map((x, i) => `
    <div class="ci"><div><b>${nm(x.n)}</b><small>${[lbl(x.s), lbl(x.x)].filter(Boolean).join(' · ')}</small></div>
    <div class="ci-p">${x.q * x.unit} ${tx('cur')}</div>
    <div class="qty"><button data-i="${i}" data-d="-1">−</button><b>${x.q}</b><button data-i="${i}" data-d="1">+</button></div></div>`).join('')
    : `<div class="cart-empty">${tx('emptyCart')}</div>`;
}
$('#cartList').addEventListener('click', e => {
  const b = e.target.closest('button[data-i]'); if (!b) return;
  const x = cart[+b.dataset.i]; x.q += +b.dataset.d; if (x.q <= 0) cart.splice(+b.dataset.i, 1); save(); renderCart();
});
const openCart = (o) => { body.classList.toggle('cart-open', o); renderCart(); if (lenis) o ? lenis.stop() : lenis.start(); };
$('#cartBtn').onclick = () => openCart(true); $('#fab').onclick = () => openCart(true);
$('#cartClose').onclick = () => openCart(false); $('#scrim').onclick = () => openCart(false);
addEventListener('keydown', e => { if (e.key === 'Escape') openCart(false); });

function seg(el, idx) { const bs = $$('button', el); bs.forEach((b, i) => b.classList.toggle('on', i === idx)); const ind = $('.seg-ind', el); ind.style.width = `calc((100% - 8px) / ${bs.length})`; ind.style.transform = `translateX(${(L === 'ar' ? -1 : 1) * idx * 100}%)`; }

let mode = TABLE ? 'table' : 'delivery';
function setMode(m) { mode = m; seg($('#mode'), ['delivery', 'pickup', 'table'].indexOf(m)); $('#fAddr').hidden = m !== 'delivery'; $('#fTable').hidden = m !== 'table'; $('#delNote').hidden = m !== 'delivery'; }
$$('#mode button').forEach(b => b.onclick = () => setMode(b.dataset.m));
if (TABLE) $('#fTable').value = TABLE;
try { const s = JSON.parse(localStorage.getItem('co-who') || '{}'); $('#fName').value = s.n || ''; $('#fPhone').value = s.p || ''; $('#fAddr').value = s.a || ''; } catch (e) {}

$('#sendWa').onclick = () => {
  if (!cart.length) { toast(tx('cartEmpty')); return; }
  const n = $('#fName').value.trim(), p = $('#fPhone').value.trim(), a = $('#fAddr').value.trim(), t = $('#fTable').value.trim(), note = $('#fNote').value.trim();
  if (mode === 'delivery' && !a) { toast(tx('needAddr')); $('#fAddr').focus(); return; }
  if (mode === 'table' && !t) { toast(tx('needTable')); $('#fTable').focus(); return; }
  try { localStorage.setItem('co-who', JSON.stringify({ n, p, a })); } catch (e) {}
  const sub = cart.reduce((s, x) => s + x.q * x.unit, 0);
  const fee = mode === 'delivery' && sub < C.freeOver ? C.delivery : 0;
  const cur = tx('cur');
  const lines = cart.map(x => `• ${x.q} × ${nm(x.n)}${x.s ? ' (' + lbl(x.s) + ')' : ''}${x.x ? ' – ' + lbl(x.x) : ''} = ${x.q * x.unit} ${cur}`);
  const how = mode === 'delivery' ? `🛵 ${tx('to')}: ${a}` : mode === 'pickup' ? `🏃 ${tx('pickup')}` : `🍽️ ${tx('tbl')}: ${t}`;
  const msg = [`🔥 ${tx('order')}`, '', ...lines, '',
    mode === 'delivery' ? `${tx('dfee')}: ${fee ? fee + ' ' + cur : tx('free')}` : '',
    `${tx('sum')}: ${sub + fee} ${cur}`, how,
    n ? `${tx('name')}: ${n}` : '', p ? `${tx('mob')}: ${p}` : '', note ? `${tx('notes')}: ${note}` : ''].filter(Boolean).join('\n');
  window.open(wa(msg), '_blank');
};

/* signature */
$('#sigAdd').onclick = () => { const it = M[0].items[0]; add({ n: { ar: it.ar, en: it.en }, s: null, x: null, unit: it.p, q: 1 }); };

/* ---------- BUILDER ---------- */
const FOLD_SVG = {
  tri: '<svg viewBox="0 0 48 48"><path d="M6 10h36L24 42z" opacity=".95"/><path d="M6 10h36l-6 6H12z" fill="#0e100f" opacity=".25"/></svg>',
  cone: '<svg viewBox="0 0 48 48"><path d="M10 12c6-6 22-6 28 0L24 44z"/><ellipse cx="24" cy="12" rx="14" ry="5" fill="#0e100f" opacity=".25"/></svg>',
  roll: '<svg viewBox="0 0 48 48"><rect x="6" y="16" width="36" height="16" rx="8"/><ellipse cx="38" cy="24" rx="4" ry="8" fill="#0e100f" opacity=".25"/></svg>',
  box: '<svg viewBox="0 0 48 48"><rect x="9" y="9" width="30" height="30" rx="4"/><path d="M9 9l15 15L39 9M9 39l15-15 15 15" stroke="#0e100f" stroke-opacity=".3" stroke-width="2" fill="none"/></svg>'
};
const bs = { kind: 'savory', fill: new Set([0]), extra: new Set([0]), sauce: 0, fold: 'tri', q: 1 };
function bPrice() { const k = B[bs.kind]; let p = k.base; bs.fill.forEach(i => p += k.fill[i].p); bs.extra.forEach(i => p += k.extra[i].p); return p; }
function bRender(rebuild) {
  const k = B[bs.kind];
  seg($('#bKind'), bs.kind === 'savory' ? 0 : 1);
  if (rebuild) {
    $('#bFill').innerHTML = k.fill.map((f, i) => `<button class="chip" data-g="fill" data-i="${i}">${nm(f)} <small>+${f.p}</small></button>`).join('');
    $('#bExtra').innerHTML = k.extra.map((f, i) => `<button class="chip" data-g="extra" data-i="${i}">${nm(f)} <small>+${f.p}</small></button>`).join('');
    $('#bSauce').innerHTML = k.sauce.map((f, i) => `<button class="chip" data-g="sauce" data-i="${i}">${nm(f)}</button>`).join('');
    $('#bFold').innerHTML = B.fold.map(f => `<button class="chip" data-g="fold" data-f="${f.id}">${FOLD_SVG[f.id]}<span>${nm(f)}</span></button>`).join('');
  }
  $$('#bFill .chip').forEach(b => b.classList.toggle('on', bs.fill.has(+b.dataset.i)));
  $$('#bExtra .chip').forEach(b => b.classList.toggle('on', bs.extra.has(+b.dataset.i)));
  $$('#bSauce .chip').forEach(b => b.classList.toggle('on', +b.dataset.i === bs.sauce));
  $$('#bFold .chip').forEach(b => b.classList.toggle('on', b.dataset.f === bs.fold));
  $('#bFoldShape').innerHTML = FOLD_SVG[bs.fold];
  $('#bQ').textContent = bs.q;
  $('#bPrice').textContent = bPrice() * bs.q;
  $('#bSummary').textContent = bSummary();
  /* floating chips around the plate */
  const picks = [...[...bs.fill].map(i => k.fill[i]), ...[...bs.extra].map(i => k.extra[i]), k.sauce[bs.sauce]];
  const pos = [[4, 10], [64, 4], [78, 34], [2, 46], [70, 64], [8, 78], [44, 90], [40, 0], [82, 84], [0, 28], [60, 92], [86, 16], [24, 94], [-2, 64]];
  $('#bFloat').innerHTML = picks.slice(0, pos.length).map((f, i) => `<span class="fchip" style="left:${pos[i][0]}%;top:${pos[i][1]}%;animation-delay:${i * 40}ms">${nm(f)}</span>`).join('');
}
function bSummary() {
  const k = B[bs.kind];
  const parts = [...bs.fill].map(i => nm(k.fill[i])).concat([...bs.extra].map(i => nm(k.extra[i])));
  return `${parts.join(' + ')} · ${tx('sauce')} ${nm(k.sauce[bs.sauce])} · ${nm(B.fold.find(f => f.id === bs.fold))}`;
}
$('#bKind').onclick = e => {
  const b = e.target.closest('[data-k]'); if (!b || b.dataset.k === bs.kind) return;
  bs.kind = b.dataset.k; bs.fill = new Set([0]); bs.extra = new Set([0]); bs.sauce = 0;
  const img = $('#bImg'); img.style.opacity = 0; img.style.transform = 'scale(.85) rotate(-20deg)';
  setTimeout(() => { img.src = `assets/img/${B[bs.kind].img}.webp`; img.onload = () => { img.style.opacity = 1; img.style.transform = 'none'; }; }, 220);
  bRender(true);
};
$('.b-panel').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  const g = b.dataset.g, i = +b.dataset.i;
  if (g === 'fill') { if (bs.fill.has(i)) { if (bs.fill.size > 1) bs.fill.delete(i); else toast(tx('pickFill')); } else if (bs.fill.size >= 2) toast(tx('max2')); else bs.fill.add(i); }
  if (g === 'extra') bs.extra.has(i) ? bs.extra.delete(i) : bs.extra.add(i);
  if (g === 'sauce') bs.sauce = i;
  if (g === 'fold') bs.fold = b.dataset.f;
  const img = $('#bImg'); img.style.transform = 'scale(1.04) rotate(4deg)'; setTimeout(() => img.style.transform = 'none', 260);
  bRender();
});
$('#bMinus').onclick = () => { bs.q = Math.max(1, bs.q - 1); bRender(); };
$('#bPlus').onclick = () => { bs.q = Math.min(20, bs.q + 1); bRender(); };
$('#bAdd').onclick = () => {
  const keep = L; const sum = []; ['ar', 'en'].forEach(l => { L = l; sum.push(bSummary()); }); L = keep;
  add({ n: { ar: D.custom[0] + (bs.kind === 'savory' ? ' (حادق)' : ' (حلو)'), en: D.custom[1] + (bs.kind === 'savory' ? ' (savory)' : ' (sweet)') }, s: null, x: sum, unit: bPrice(), q: bs.q });
  bs.q = 1; bRender();
};

/* ---------- PIZZA picker ---------- */
const PZ = M.find(c => c.id === 'pizza');
const pzImgs = ['pizza-pull-s', 'pizzas-s', 'pizza-oven-s'];
const ps = { i: 2, s: 1 };
function pzRender(rebuild) {
  if (rebuild) $('#pzList').innerHTML = PZ.items.map((it, i) => `<button class="pz-it" data-i="${i}"><b>${nm(it)}</b><small>${it.p[0]}–${it.p[2]} ${tx('cur')}</small></button>`).join('');
  $$('.pz-it').forEach(b => b.classList.toggle('on', +b.dataset.i === ps.i));
  seg($('#pzSize'), ps.s);
  $('#pzPrice').textContent = PZ.items[ps.i].p[ps.s];
  $('.pz-disc').style.transform = `scale(${[.78, .9, 1][ps.s]})`;
}
$('#pzList').onclick = e => { const b = e.target.closest('.pz-it'); if (!b) return; ps.i = +b.dataset.i; const im = $('#pzImg'); im.src = `assets/img/${pzImgs[ps.i % 3]}.webp`; pzRender(); };
$$('#pzSize button').forEach(b => b.onclick = () => { ps.s = +b.dataset.i; pzRender(); });
$('#pzAdd').onclick = () => { const it = PZ.items[ps.i]; add({ n: { ar: 'بيتزا ' + it.ar, en: it.en + ' Pizza' }, s: [SZ.ar[ps.s], SZ.en[ps.s]], x: null, unit: it.p[ps.s], q: 1 }); };
/* oven video: load when near */
const vid = $('#pzVideo');
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { const s = $('source', vid); if (s.dataset.src) { s.src = s.dataset.src; delete s.dataset.src; vid.load(); } vid.play().catch(() => {}); } else vid.pause();
}), { rootMargin: '200px' });
io.observe(vid);

/* ---------- MENU ---------- */
let tab = 'all', q = '';
function renderTabs() { $('#tabs').innerHTML = `<button class="tab" data-t="all">${tx('all')}</button>` + M.map(c => `<button class="tab" data-t="${c.id}">${nm(c)}</button>`).join(''); $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === tab)); }
function setTab(t) { tab = t; $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.t === t)); renderMenu(); const b = $(`.tab[data-t="${t}"]`); b && b.scrollIntoView({ inline: 'center', block: 'nearest' }); }
$('#tabs').onclick = e => { const b = e.target.closest('.tab'); if (b) setTab(b.dataset.t); };
$('#q').oninput = e => { q = e.target.value.trim(); renderMenu(); };
const norm = s => s.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
function renderMenu() {
  const nq = norm(q);
  const html = M.filter(c => tab === 'all' || c.id === tab).map(c => {
    const items = c.items.map((it, i) => ({ it, i })).filter(({ it }) => !nq || norm(it.ar + ' ' + it.en + ' ' + c.ar + ' ' + c.en).includes(nq));
    if (!items.length) return '';
    return `<div class="cat" id="cat-${c.id}">
      <div class="cat-hd">${c.img ? `<div class="ph"><img src="assets/img/${c.img}-s.webp" alt="" loading="lazy"></div>` : ''}<div><h3>${nm(c)}</h3><p>${L === 'ar' ? c.sar : c.sen}</p></div><span class="cnt">${c.items.length} ${tx('items')}</span></div>
      <div class="items">${items.map(({ it, i }) => {
        const ps = Array.isArray(it.p) ? it.p : [it.p];
        const ds = L === 'ar' ? it.dar : it.den;
        return `<div class="it"><div><div class="nm"><span>${nm(it)}</span>${it.tag ? `<span class="tag ${it.tag}">${tx(it.tag)}</span>` : ''}</div>${ds ? `<p class="ds">${ds}</p>` : ''}</div>
        <div class="pbs ${c.sized ? '' : 'one'}">${ps.map((p, s) => `<button class="pb" data-c="${c.id}" data-i="${i}" data-s="${s}"><small>${c.sized ? SZ[L][s] : tx('price')}</small><b>${p}<i>${tx('cur')}</i></b></button>`).join('')}</div></div>`;
      }).join('')}</div></div>`;
  }).join('');
  $('#menuBody').innerHTML = html || `<div class="empty">${tx('noRes')}</div>`;
  if (ST) ST.refresh();
}
$('#menuBody').addEventListener('click', e => {
  const b = e.target.closest('.pb'); if (!b) return;
  const c = M.find(x => x.id === b.dataset.c), it = c.items[+b.dataset.i], s = +b.dataset.s;
  const pre = c.id === 'pizza' ? ['بيتزا ', ' Pizza'] : ['', ''];
  add({ n: { ar: pre[0] + it.ar, en: it.en + pre[1] }, s: c.sized ? [SZ.ar[s], SZ.en[s]] : null, x: null, unit: Array.isArray(it.p) ? it.p[s] : it.p, q: 1 });
  b.classList.add('added'); setTimeout(() => b.classList.remove('added'), 700);
});

/* ---------- counters + reveals ---------- */
if (G && ST && !reduce) {
  ST.batch('.rv', { start: 'top 90%', once: true, onEnter: els => G.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }) });
  $$('.sec-head, .sig-copy, .story-copy, .qr-in, .b-panel, .pz-in').forEach(el => G.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
  $$('.cnt[data-n]').forEach(el => { const o = { v: 0 }; G.to(o, { v: +el.dataset.n, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v), scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); });
} else { $$('.rv').forEach(e => { e.style.opacity = 1; e.style.transform = 'none'; }); $$('.cnt[data-n]').forEach(el => el.textContent = el.dataset.n); }

applyLang();
})();
