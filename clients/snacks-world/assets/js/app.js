/* Snacks World — interactions */
(() => {
'use strict';
const T = window.SW_T.ar, C = window.SW_CONFIG;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const mq = matchMedia('(max-width:760px)');
const isMobile = () => mq.matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
gsap.registerPlugin(ScrollTrigger);

/* ---------- WhatsApp & contacts ---------- */
const wa = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg || T.wa_hi)}`;
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.msg ? 'أهلًا Snacks World 👋 ' + a.dataset.msg : ''); a.target = '_blank'; a.rel = 'noopener'; });
$('#ctCall').href = 'tel:+2' + C.phone; $('#ctNum').textContent = C.phone;
$('#ctIg').href = C.instagram;
$('#yr').textContent = new Date().getFullYear();

/* ---------- theme ---------- */
const themeLbl = $('#themeLbl');
const setThemeLbl = () => themeLbl.textContent = root.dataset.theme === 'day' ? T.theme_day : T.theme_night;
setThemeLbl();
$('#themeBtn').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'day' ? 'night' : 'day';
  try { localStorage.setItem('sw-theme', root.dataset.theme); } catch (e) {}
  setThemeLbl();
});

/* ---------- smooth scroll ---------- */
ScrollTrigger.config({ ignoreMobileResize: true });
let lenis = null;
if (!reduce && !weak && !('ontouchstart' in window)) {
  lenis = new Lenis({ lerp: .11, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const goTo = (target) => { const el = typeof target === 'string' ? $(target) : target; if (!el) return; lenis ? lenis.scrollTo(el, { offset: -10 }) : el.scrollIntoView({ behavior: 'smooth' }); };
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  e.preventDefault(); nav.classList.remove('open'); goTo(id);
}));

/* ---------- nav ---------- */
const nav = $('#nav');
$('#burger').addEventListener('click', () => nav.classList.toggle('open'));
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 60);
  nav.classList.toggle('hide', y > lastY && y > innerHeight * 1.2 && !nav.classList.contains('open'));
  lastY = y;
}, { passive: true });
const navMap = $$('.nav-links a').map(a => [a, $(a.getAttribute('href'))]);
navMap.forEach(([a, sec]) => sec && ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('on', s.isActive) }));

/* ======================================================
   INTRO — splat sprayed, letters drop, mascot pops
   ====================================================== */
function runIntro() {
  const intro = $('#intro');
  const done = () => {
    gsap.to(intro, { autoAlpha: 0, duration: .55, ease: 'power2.inOut', onComplete: () => { intro.classList.add('gone'); intro.style.display = 'none'; heroIn(); } });
  };
  if (reduce) { intro.style.display = 'none'; heroIn(); return; }
  document.body.style.overflow = 'hidden';
  // spray particles
  const cv = $('#introSpray'), cx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.scale(dpr, dpr);
  const box = $('#introLogo').getBoundingClientRect();
  const parts = [];
  const sprayBurst = (n, col) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = (.35 + Math.random() * .4) * box.width * .6;
      parts.push({ x: box.left + box.width * .55, y: box.top + box.height * .55, tx: box.left + box.width * .55 + Math.cos(a) * r, ty: box.top + box.height * .55 + Math.sin(a) * r * .7, s: Math.random() * 3 + .6, c: col, t: 0 });
    }
  };
  let sprayOn = true;
  const drawSpray = () => {
    if (!sprayOn) return;
    for (const p of parts) {
      if (p.t >= 1) continue;
      p.t = Math.min(1, p.t + .06);
      const e = 1 - Math.pow(1 - p.t, 3);
      cx.fillStyle = p.c; cx.globalAlpha = .55;
      cx.beginPath(); cx.arc(p.x + (p.tx - p.x) * e, p.y + (p.ty - p.y) * e, p.s, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(drawSpray);
  };
  drawSpray();
  const tl = gsap.timeline({ onComplete: () => { document.body.style.overflow = ''; setTimeout(done, 350); } });
  tl.set('.il-splat,.il-text,.il-mascot', { autoAlpha: 0 })
    .add(() => sprayBurst(220, '#D7262E'), .15)
    .fromTo('.il-splat', { autoAlpha: 0, scale: .25, rotate: -14, clipPath: 'circle(0% at 55% 55%)' }, { autoAlpha: 1, scale: 1, rotate: 0, clipPath: 'circle(75% at 55% 55%)', duration: .75, ease: 'expo.out' }, .2)
    .to('.drip', { height: (i) => [46, 30, 60][i], duration: 1.1, ease: 'power1.in', stagger: .12 }, .6)
    .add(() => sprayBurst(90, '#FFD60A'), .55)
    .fromTo('.il-text', { autoAlpha: 0, y: -90, scaleY: 1.25, scaleX: .9 }, { autoAlpha: 1, y: 0, scaleY: 1, scaleX: 1, duration: .55, ease: 'back.out(2.2)' }, .6)
    .to('.il-text', { scaleY: .9, scaleX: 1.06, duration: .08, yoyo: true, repeat: 1, transformOrigin: '50% 100%' }, 1.1)
    .fromTo('.il-mascot', { autoAlpha: 0, x: -120, rotate: -30 }, { autoAlpha: 1, x: 0, rotate: 0, duration: .6, ease: 'back.out(2)' }, .95)
    .to('.il-mascot', { rotate: 8, duration: .14, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1.5)
    .to('.intro-tag', { autoAlpha: 1, letterSpacing: '.42em', duration: .8, ease: 'power2.out' }, 1.1)
    .add(() => { sprayOn = false; }, 1.9);
  $('#introSkip').addEventListener('click', () => { tl.progress(1); });
}

/* ======================================================
   HERO — shutter-opening frame sequence on scroll
   ====================================================== */
const hero = $('#hero'), canvas = $('#heroCanvas'), ctx = canvas.getContext('2d');
const SEQ = { d: { n: 56, path: 'assets/seq/d/' }, m: { n: 50, path: 'assets/seq/m/' } };
let seqKey = null, frames = [], curFrame = -1, heroP = 0;
function pickSeq() { return (innerWidth / innerHeight < .9) ? 'm' : 'd'; }
function loadSeq() {
  const k = pickSeq(); if (k === seqKey) return; seqKey = k; frames = []; curFrame = -1;
  const s = SEQ[k]; $('#heroPoster').src = s.path + '000.webp';
  // load first, then the rest in order
  for (let i = 0; i < s.n; i++) {
    const im = new Image(); im.decoding = 'async';
    im.src = s.path + String(i).padStart(3, '0') + '.webp';
    im.onload = () => { if (i === 0 || Math.abs(i - targetFrame()) < 2) draw(true); };
    frames.push(im);
  }
}
function sizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, isMobile() ? 2 : 1.5);
  canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr);
  curFrame = -1; draw(true);
}
const targetFrame = () => Math.round(Math.min(1, heroP / .72) * (SEQ[seqKey || 'd'].n - 1));
function draw(force) {
  let f = targetFrame();
  // nearest loaded frame
  let im = frames[f];
  if (!im || !im.complete || !im.naturalWidth) { for (let d = 1; d < 12; d++) { const a = frames[f - d]; if (a && a.complete && a.naturalWidth) { im = a; f = f - d; break; } } }
  if (!im || !im.complete || !im.naturalWidth) return;
  if (f === curFrame && !force) return; curFrame = f;
  const cw = canvas.width, ch = canvas.height, iw = im.naturalWidth, ih = im.naturalHeight;
  const sc = Math.max(cw / iw, ch / ih), w = iw * sc, h = ih * sc;
  // keep the truck a bit lower on wide screens so the headline has room
  const oy = (ch - h) * (seqKey === 'd' ? .78 : .62);
  ctx.drawImage(im, (cw - w) / 2, oy, w, h);
  $('#heroPoster').style.opacity = 0;
}
loadSeq(); sizeCanvas();
addEventListener('resize', () => { loadSeq(); sizeCanvas(); ScrollTrigger.refresh(); });

function heroIn() {
  const tl = gsap.timeline();
  tl.from('.hero-eyebrow', { y: 20, autoAlpha: 0, duration: .5 })
    .from('.ht1>span', { yPercent: 110, duration: .8, ease: 'expo.out' }, .1)
    .from('.pull', { y: -200, duration: 1, ease: 'bounce.out' }, .2)
    .from('.hero-chips li', { y: 30, autoAlpha: 0, stagger: .08, duration: .5 }, .5);
}
gsap.set('.ht2>span', { yPercent: 110 });
gsap.set('.hero-more', { autoAlpha: 0, y: 24 });
ScrollTrigger.create({
  trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true,
  onUpdate: s => {
    heroP = s.progress; draw();
    const pull = $('#pull');
    pull.style.setProperty('--pull', Math.min(1, heroP / .3) * 90 + 'px');
    pull.style.opacity = heroP < .3 ? 1 : Math.max(0, 1 - (heroP - .3) * 6);
  }
});
gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: .6 } })
  .to('.ht2>span', { yPercent: 0, duration: .12, ease: 'none' }, .4)
  .to('.hero-more', { autoAlpha: 1, y: 0, duration: .12 }, .5)
  .to('.hero-side', { opacity: 1, duration: .12 }, .42)
  .to({}, { duration: .36 });

/* ---------- tape ticker ---------- */
$$('.tape-run').forEach((run, k) => {
  const words = k ? ['أكل حلو', 'مود حلو', 'وقت حلو'] : ['GOOD FOOD', 'GOOD MOOD', 'GOOD TIME'];
  let html = '';
  for (let i = 0; i < 8; i++) words.forEach(w => html += `<span class="${k ? 'ar' : ''}">${w}<i>${k ? '✦' : '★'}</i></span>`);
  run.innerHTML = html + html;
  run._x = 0; run._dir = +run.dataset.dir;
});
let vel = 0;
ScrollTrigger.create({ onUpdate: s => { vel = Math.min(30, Math.abs(s.getVelocity()) / 120); } });
gsap.ticker.add(() => {
  vel *= .94;
  $$('.tape-run').forEach(run => {
    const half = run.scrollWidth / 2; if (!half) return;
    run._x = (run._x + run._dir * (0.6 + vel)) % half;
    run.style.transform = `translate3d(${run._x - (run._dir > 0 ? half : 0)}px,0,0)`;
  });
});

/* ======================================================
   PASSPORT
   ====================================================== */
const STOPS = window.SW_STOPS;
const STAMP_COL = ['#C8102E', '#1E2A6E', '#0E7C4A', '#7A2E9A', '#C8102E', '#B8540B', '#1E2A6E', '#D6336C', '#0E7C4A'];
const picked = new Set(); // shared with planner (ids)
function stampSVG(i) {
  const c = STAMP_COL[i], id = STOPS[i];
  const shapes = [
    `<circle cx="80" cy="80" r="72" fill="none" stroke="${c}" stroke-width="5"/><circle cx="80" cy="80" r="60" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="3 4"/>`,
    `<rect x="10" y="22" width="140" height="116" rx="14" fill="none" stroke="${c}" stroke-width="5"/><rect x="20" y="32" width="120" height="96" rx="8" fill="none" stroke="${c}" stroke-width="2"/>`,
    `<path d="M80 6 L150 80 L80 154 L10 80Z" fill="none" stroke="${c}" stroke-width="5"/><path d="M80 22 L134 80 L80 138 L26 80Z" fill="none" stroke="${c}" stroke-width="2"/>`
  ];
  return `<svg class="stamp" viewBox="0 0 160 160" aria-hidden="true">
    <defs><filter id="ink${i}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${i + 3}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25"/><feComposite in="SourceGraphic" operator="in"/></filter></defs>
    <g filter="url(#ink${i})" opacity=".9">${shapes[i % 3]}
      <text x="80" y="54" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="12" letter-spacing="2" fill="${c}">SNACKS WORLD</text>
      <text x="80" y="90" text-anchor="middle" font-family="Alexandria,sans-serif" font-weight="900" font-size="${Math.min(22, Math.round(150 / Math.max(5, T['s_' + id].length)))}" fill="${c}" direction="rtl">${T['s_' + id]}</text>
      <text x="80" y="114" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="11" letter-spacing="1.5" fill="${c}">★ ${String(i + 1).padStart(2, '0')} · TASTED ★</text>
    </g></svg>`;
}
function pageHTML(i) {
  const id = STOPS[i];
  return `<div class="pc-row"><span>${T.pp_station} ${String(i + 1).padStart(2, '0')}/09</span><span>TASTE THE WORLD</span></div>
    <h3>${T['s_' + id]}</h3>
    <span class="pc-origin">✈ ${T.pp_origin}: ${T['o_' + id]}</span>
    <p>${T['d_' + id]}</p>
    <button class="pp-add ${picked.has(id) ? 'on' : ''}" data-id="${id}">${picked.has(id) ? T.pp_added : T.pp_add}</button>`;
}
const stamped = new Set();
function updateCounter() {
  $('#ppCount').textContent = stamped.size;
  $$('#ppDots li').forEach((li, k) => li.classList.toggle('got', stamped.has(k)));
  $('#ppDone').classList.toggle('show', stamped.size === STOPS.length);
}
document.addEventListener('click', e => {
  const b = e.target.closest('.pp-add'); if (!b) return;
  const id = b.dataset.id;
  if (picked.has(id)) { picked.delete(id); planner.removeAll(id); } else { picked.add(id); planner.add(id); }
  $$(`.pp-add[data-id="${id}"]`).forEach(x => { x.classList.toggle('on', picked.has(id)); x.textContent = picked.has(id) ? T.pp_added : T.pp_add; });
  gsap.fromTo(b, { scale: .9 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
});
function slamStamp(el) {
  gsap.fromTo(el, { autoAlpha: 0, scale: 2.4, rotate: gsap.utils.random(-40, 40) }, { autoAlpha: 1, scale: 1, rotate: gsap.utils.random(-16, 16), duration: .32, ease: 'power4.in', onComplete: () => {
    const book = el.closest('.pp-book, .pp-m');
    gsap.fromTo(book, { x: -4, y: 3 }, { x: 0, y: 0, duration: .35, ease: 'elastic.out(1.2,.3)' });
  } });
}

function buildPassportDesktop() {
  const imgs = $('#ppImgs'), dots = $('#ppDots');
  imgs.innerHTML = STOPS.map(id => `<img src="assets/img/snack/${id}.webp" alt="${T['s_' + id]}">`).join('');
  dots.innerHTML = STOPS.map(id => `<li><img src="assets/img/snack/${id}.webp" alt=""></li>`).join('');
  const content = $('#ppContent'), stamps = $('#ppStamps'), leaf = $('#ppLeaf'), info = $('#ppInfo');
  let cur = -1;
  const show = (i, dir) => {
    if (i === cur) return;
    const prev = cur; cur = i;
    // leaf flip: snapshot old page, flip it away
    if (prev >= 0) {
      leaf.innerHTML = info.innerHTML; leaf.style.display = 'block';
      const r = info.getBoundingClientRect(), br = $('#ppBook').getBoundingClientRect();
      leaf.style.left = (r.left - br.left) + 'px'; leaf.style.width = r.width + 'px';
      const rtl = root.dir === 'rtl';
      const originRight = rtl ? 'right center' : 'left center';
      gsap.fromTo(leaf, { rotateY: 0, transformOrigin: rtl ? 'right center' : 'left center', filter: 'brightness(1)' },
        { rotateY: (rtl ? 1 : -1) * (dir > 0 ? 1 : -1) * 170, filter: 'brightness(.6)', duration: .7, ease: 'power2.inOut', onComplete: () => { leaf.style.display = 'none'; } });
      void originRight;
    }
    content.innerHTML = pageHTML(i);
    stamps.innerHTML = stampSVG(i);
    $('#ppNum').textContent = String(i + 1).padStart(2, '0');
    const all = $$('img', imgs);
    all.forEach((im, k) => {
      if (k === i) gsap.fromTo(im, { autoAlpha: 0, scale: .6, y: 40, rotate: -10 }, { autoAlpha: 1, scale: 1, y: 0, rotate: 0, duration: .8, ease: 'back.out(1.6)', delay: .15 });
      else if (k === prev) gsap.to(im, { autoAlpha: 0, scale: 1.2, y: -30, duration: .4 });
      else gsap.set(im, { autoAlpha: 0 });
    });
    content.classList.remove('in'); void content.offsetWidth; content.classList.add('in');
    if (!stamped.has(i)) { for (let k = 0; k <= i; k++) stamped.add(k); setTimeout(() => slamStamp($('.stamp', stamps)), 650); updateCounter(); }
    else gsap.set($('.stamp', stamps), { autoAlpha: 1, rotate: (i * 37 % 30) - 15 });
    $$('#ppDots li').forEach((li, k) => li.classList.toggle('cur', k === i));
  };
  show(0, 1);
  ScrollTrigger.create({
    trigger: '.passport', start: 'top top', end: () => '+=' + innerHeight * 4.2, pin: '.pp-pin', scrub: true, anticipatePin: 1,
    onUpdate: s => { const i = Math.min(STOPS.length - 1, Math.floor(s.progress * STOPS.length * .999)); show(i, s.direction); }
  });
  $$('#ppDots li').forEach((li, k) => li.addEventListener('click', () => {
    const st = ScrollTrigger.getAll().find(t => t.pin === $('.pp-pin'));
    if (st) { const y = st.start + (st.end - st.start) * ((k + .5) / STOPS.length); lenis ? lenis.scrollTo(y) : scrollTo({ top: y, behavior: 'smooth' }); }
  }));
}
function buildPassportMobile() {
  const book = $('#ppBook');
  book.innerHTML = STOPS.map((id, i) => `<article class="pp-m"><div class="pm-img"><img src="assets/img/snack/${id}.webp" alt="${T['s_' + id]}" loading="lazy"></div><div class="pm-body"><div class="pp-stamps">${stampSVG(i)}</div><div class="pp-content">${pageHTML(i)}</div></div></article>`).join('');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio > .6) {
      const i = [...book.children].indexOf(e.target);
      if (!stamped.has(i)) { stamped.add(i); slamStamp($('.stamp', e.target)); updateCounter(); }
    }
  }), { root: book, threshold: [.6] });
  [...book.children].forEach(c => io.observe(c));
}
isMobile() ? buildPassportMobile() : buildPassportDesktop();

/* ======================================================
   TICKETS — dealt like cards + tilt
   ====================================================== */
$$('.ticket').forEach(t => t.insertAdjacentHTML('beforeend', '<i class="shine"></i>'));
gsap.from('.ticket', {
  scrollTrigger: { trigger: '#tickets', start: 'top 80%' },
  y: 160, x: (i) => (i % 3 - 1) * -120, rotate: (i) => (i % 2 ? 14 : -12), autoAlpha: 0, duration: .9, ease: 'back.out(1.3)', stagger: .09
});
if (!('ontouchstart' in window)) {
  $$('.ticket').forEach(t => {
    t.addEventListener('pointermove', e => {
      const r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      gsap.to(t, { rotateY: (px - .5) * 12, rotateX: (.5 - py) * 10, duration: .4, ease: 'power2.out' });
      t.style.setProperty('--mx', px * 100 + '%'); t.style.setProperty('--my', py * 100 + '%');
    });
    t.addEventListener('pointerleave', () => gsap.to(t, { rotateY: 0, rotateX: 0, duration: .7, ease: 'elastic.out(1,.5)' }));
  });
}

/* ======================================================
   STRENGTH GAME — high striker
   ====================================================== */
(() => {
  const btn = $('#stBtn'), lbl = $('#stBtnLbl'), puck = $('#stPuck'), fill = $('#stFill'), meter = $('#stMeter'), hammer = $('#stHammer'), bell = $('#stBell'), tower = $('.st-tower');
  const scale = $('#stScale');
  scale.innerHTML = [100, 80, 60, 40, 20, 0].map(v => `<span data-v="${v}">${v}</span>`).join('');
  let best = 0; try { best = +localStorage.getItem('sw-best') || 0; } catch (e) {}
  $('#gBest').textContent = String(best).padStart(2, '0');
  let charging = false, t0 = 0, power = 0, raf = 0, busy = false;
  let actx = null;
  const tone = (f, d, type = 'sine', v = .2) => {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, actx.currentTime); g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + d);
      o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + d);
    } catch (e) {}
  };
  const loop = () => {
    if (!charging) return;
    const t = (performance.now() - t0) / 1000;
    // ping-pong power: 0 → 100 → 0 every 1.5 s, easing so the top is brief
    const ph = (t % 1.5) / 1.5, tri = ph < .5 ? ph * 2 : 2 - ph * 2;
    power = Math.round(Math.pow(tri, 1.6) * 100);
    meter.style.width = power + '%';
    gsap.set(hammer, { rotate: -20 - power * .9 });
    raf = requestAnimationFrame(loop);
  };
  const start = (e) => {
    e.preventDefault(); if (busy) return;
    charging = true; t0 = performance.now(); btn.classList.add('charging'); lbl.textContent = T.gm_release;
    $('#gVerdict').innerHTML = '&nbsp;'; loop();
  };
  const release = () => {
    if (!charging) return; charging = false; cancelAnimationFrame(raf); busy = true;
    btn.classList.remove('charging'); lbl.textContent = T.gm_hold;
    const p = power;
    const H = tower.clientHeight - 34;
    const tl = gsap.timeline({ onComplete: () => { busy = false; } });
    tl.to(hammer, { rotate: 70, duration: .16, ease: 'power3.in' })
      .add(() => { tone(90, .15, 'square', .25); gsap.fromTo('#stPad', { scaleY: .7 }, { scaleY: 1, duration: .3, ease: 'elastic.out(1,.4)' }); })
      .to(puck, { y: -H * p / 100, duration: .25 + p / 160, ease: 'power2.out', onUpdate: () => {
          const cur = -gsap.getProperty(puck, 'y') / H * 100;
          fill.style.height = Math.max(0, cur) * (H / 100) + 'px';
          $$('span', scale).forEach(s => s.classList.toggle('lit', +s.dataset.v <= cur + 1));
        } })
      .add(() => {
        const score = Math.min(99, p);
        $('#gScore').textContent = String(score).padStart(2, '0');
        const lv = p >= 96 ? 4 : p >= 75 ? 3 : p >= 50 ? 2 : p >= 25 ? 1 : 0;
        $('#gVerdict').textContent = T['gm_l' + lv];
        gsap.fromTo('#gVerdict', { scale: .6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .5, ease: 'back.out(3)' });
        if (score > best) { best = score; $('#gBest').textContent = String(best).padStart(2, '0'); try { localStorage.setItem('sw-best', best); } catch (e) {} }
        if (p >= 96) { tone(1320, 1.2, 'triangle', .3); tone(1760, 1.4, 'sine', .15); gsap.fromTo(bell, { rotate: -18 }, { rotate: 0, duration: 1.2, ease: 'elastic.out(1.4,.2)' }); confetti(); }
        else tone(300 + p * 6, .25, 'sine', .15);
      })
      .to(puck, { y: 0, duration: .55, ease: 'bounce.out', delay: .35, onUpdate: () => {
          const cur = -gsap.getProperty(puck, 'y') / H * 100;
          fill.style.height = Math.max(0, cur) * (H / 100) + 'px';
          $$('span', scale).forEach(s => s.classList.toggle('lit', +s.dataset.v <= cur + 1));
        } }, '>')
      .to(hammer, { rotate: -20, duration: .5, ease: 'power2.out' }, '<')
      .to(meter, { width: 0, duration: .4 }, '<');
  };
  btn.addEventListener('pointerdown', start);
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !charging && !e.repeat) start(e); });
  btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') release(); });
  btn.addEventListener('contextmenu', e => e.preventDefault());

  const cv = $('#confetti'), cx = cv.getContext('2d');
  function confetti() {
    const r = cv.getBoundingClientRect(); cv.width = r.width; cv.height = r.height;
    const cols = ['#FFD60A', '#D7262E', '#1E2A6E', '#fff', '#22C55E'];
    const ps = Array.from({ length: 140 }, () => ({ x: r.width / 2, y: 90, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 2, s: Math.random() * 7 + 4, c: cols[Math.random() * 5 | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
    let n = 0;
    const step = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(p => { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
      if (++n < 150) requestAnimationFrame(step); else cx.clearRect(0, 0, cv.width, cv.height);
    };
    step();
  }
})();

/* ======================================================
   PLANNER — drop stations on the lawn
   ====================================================== */
const planner = (() => {
  const ST = window.SW_STATIONS, board = $('#plBoard'), pal = $('#plPalette'), list = $('#plList');
  let group = 'food'; const toks = []; let seq = 0;
  const icon = s => s.img ? `<img src="assets/img/snack/${s.img}.webp" alt="">` : s.ico;
  const renderPal = () => {
    pal.innerHTML = ST.filter(s => s.g === group).map(s => `<button class="chip" data-id="${s.id}"><span class="ci">${icon(s)}</span>${T['st_' + s.id]}<span class="cn"></span></button>`).join('');
    refresh();
  };
  $$('#plTabs button').forEach(b => b.addEventListener('click', () => { $$('#plTabs button').forEach(x => x.classList.toggle('on', x === b)); group = b.dataset.g; renderPal(); gsap.from('.chip', { y: 14, autoAlpha: 0, stagger: .03, duration: .3 }); }));
  pal.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) add(c.dataset.id, c); });
  // free slot search: spiral-ish grid avoiding others
  const freeSpot = () => {
    const cols = isMobile() ? 3 : 5, rows = isMobile() ? 4 : 3;
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ x: (c + .5) / cols * 100, y: 12 + (r + .5) / rows * 74 });
    cells.sort(() => Math.random() - .5);
    let bestC = cells[0], bestD = -1;
    for (const c of cells) {
      const d = toks.length ? Math.min(...toks.map(t => Math.hypot(t.x - c.x, (t.y - c.y) * .7))) : 99;
      if (d > bestD) { bestD = d; bestC = c; }
    }
    return { x: bestC.x + gsap.utils.random(-4, 4), y: bestC.y + gsap.utils.random(-4, 4) };
  };
  function add(id, fromEl) {
    const s = ST.find(x => x.id === id); if (!s) return;
    const p = freeSpot();
    const el = document.createElement('div');
    el.className = 'tok'; el.dataset.g = s.g; el.dataset.k = ++seq;
    el.innerHTML = `<div class="tb">${icon(s)}</div><span class="tl">${T['st_' + id]}</span><button class="tx" aria-label="حذف">×</button>`;
    el.style.left = p.x + '%'; el.style.top = p.y + '%';
    const sh = document.createElement('i'); sh.className = 'tok-shadow'; sh.style.left = p.x + '%'; sh.style.top = (p.y + 6) + '%';
    board.append(sh, el);
    const tk = { id, k: seq, el, sh, x: p.x, y: p.y }; toks.push(tk);
    // drop from the sky with squash
    gsap.fromTo(el, { yPercent: -50 - 260, scale: 1.3, rotate: gsap.utils.random(-30, 30) }, { yPercent: -50, scale: 1, rotate: 0, duration: .7, ease: 'bounce.out' });
    gsap.fromTo(sh, { scale: .2, opacity: 0 }, { scale: 1, opacity: 1, duration: .7, ease: 'bounce.out' });
    if (fromEl) gsap.fromTo(fromEl, { scale: .9 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
    if (ST.find(x => x.id === id).img) { picked.add(id); syncPassport(id); }
    drag(tk); refresh();
  }
  function remove(tk) {
    const i = toks.indexOf(tk); if (i < 0) return; toks.splice(i, 1);
    gsap.to(tk.el, { scale: 0, rotate: 90, duration: .3, ease: 'back.in(2)', onComplete: () => tk.el.remove() });
    gsap.to(tk.sh, { scale: 0, duration: .3, onComplete: () => tk.sh.remove() });
    if (!toks.some(t => t.id === tk.id)) { picked.delete(tk.id); syncPassport(tk.id); }
    refresh();
  }
  function removeAll(id) { toks.filter(t => t.id === id).forEach(remove); }
  function syncPassport(id) { $$(`.pp-add[data-id="${id}"]`).forEach(x => { x.classList.toggle('on', picked.has(id)); x.textContent = picked.has(id) ? T.pp_added : T.pp_add; }); }
  function drag(tk) {
    const el = tk.el;
    el.querySelector('.tx').addEventListener('click', e => { e.stopPropagation(); remove(tk); });
    el.addEventListener('pointerdown', e => {
      if (e.target.closest('.tx')) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('drag');
      gsap.to(el, { scale: 1.15, duration: .2 });
      const r = board.getBoundingClientRect();
      const move = ev => {
        tk.x = Math.max(6, Math.min(94, (ev.clientX - r.left) / r.width * 100));
        tk.y = Math.max(8, Math.min(88, (ev.clientY - r.top) / r.height * 100));
        el.style.left = tk.x + '%'; el.style.top = tk.y + '%';
        tk.sh.style.left = tk.x + '%'; tk.sh.style.top = (tk.y + 6) + '%';
      };
      const up = () => { el.classList.remove('drag'); gsap.to(el, { scale: 1, duration: .5, ease: 'elastic.out(1,.4)' }); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }
  function counts() { const m = new Map(); toks.forEach(t => m.set(t.id, (m.get(t.id) || 0) + 1)); return m; }
  function refresh() {
    const m = counts();
    $('#plCount').textContent = toks.length;
    $('#plEmpty').style.display = toks.length ? 'none' : '';
    list.innerHTML = [...m].map(([id, n]) => `<li>${T['st_' + id]}${n > 1 ? `<b>×${n}</b>` : ''}</li>`).join('');
    $$('.chip', pal).forEach(c => { const n = m.get(c.dataset.id) || 0; c.classList.toggle('has', n > 0); $('.cn', c).textContent = n; });
    $('#plSend').href = wa(message());
  }
  function message() {
    const m = counts();
    const type = $('#plType .on').dataset.v, g = $('#plGuests').value, d = $('#plDate').value, pl = $('#plPlace').value.trim();
    let s = T.pl_msg + '\n';
    s += `• ${'نوع المناسبة'}: ${type}\n• ${'عدد الضيوف'}: ${g}\n`;
    if (d) s += `• ${'التاريخ'}: ${d}\n`;
    if (pl) s += `• ${'المكان'}: ${pl}\n`;
    s += m.size ? `• المحطات:\n${[...m].map(([id, n]) => `   - ${T['st_' + id]}${n > 1 ? ' ×' + n : ''}`).join('\n')}` : '• المحطات: (لسه هختار)';
    return s;
  }
  $$('#plType button').forEach(b => b.addEventListener('click', e => { e.preventDefault(); $$('#plType button').forEach(x => x.classList.toggle('on', x === b)); refresh(); }));
  $('#plGuests').addEventListener('input', e => { $('#plGuestsV').textContent = e.target.value; refresh(); });
  $('#plDate').addEventListener('change', refresh); $('#plPlace').addEventListener('input', refresh);
  $('#plClear').addEventListener('click', () => [...toks].forEach(remove));
  $('#plSend').target = '_blank'; $('#plSend').rel = 'noopener';
  renderPal();
  return { add: id => add(id), removeAll };
})();

/* ======================================================
   MOMENTS — polaroids on a string of lights (drag + sway)
   ====================================================== */
(() => {
  const wrap = $('#lineWrap'), track = $('#lineTrack'), path = $('#wirePath'), wire = $('#lineWire');
  const M = window.SW_MOMENTS;
  track.innerHTML = M.map((id, i) => `<figure class="pola" data-i="${i}"><i class="bulb"></i><i class="pin"></i><div class="card"><img src="assets/img/real/${id}.webp" alt="${T['m_' + id]}" loading="lazy"><figcaption>${T['m_' + id]}</figcaption></div></figure>`).join('');
  const polas = $$('.pola', track);
  let x = 0, v = 0, dragging = false, sx = 0, lx = 0, moved = 0, minX = 0;
  const rtl = root.dir === 'rtl';
  const measure = () => { minX = Math.min(0, wrap.clientWidth - track.scrollWidth); if (rtl && x === 0) x = minX; };
  measure(); addEventListener('resize', measure);
  // sag of the wire: y = base + sag * sin(pi * t) per span
  const sagY = (px) => { const W = wrap.clientWidth, span = 360; const t = ((px % span) + span) % span / span; return 34 + Math.sin(Math.PI * t) * 26; };
  const angles = polas.map(() => ({ a: 0, va: 0 }));
  wrap.addEventListener('pointerdown', e => { dragging = true; sx = lx = e.clientX; moved = 0; wrap.classList.add('drag'); wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; x += dx; v = dx; moved += Math.abs(dx); });
  const end = e => { if (!dragging) return; dragging = false; wrap.classList.remove('drag');
    if (moved < 6) { const f = e.target.closest('.pola'); if (f) openLB(+f.dataset.i); } };
  wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
  // auto drift until user interacts
  let idle = true; wrap.addEventListener('pointerdown', () => idle = false, { once: true });
  let inView = false; new IntersectionObserver(es => inView = es[0].isIntersecting).observe(wrap);
  gsap.ticker.add(() => {
    if (!inView) return;
    if (!dragging) { if (idle) v = rtl ? .5 : -.5; x += v; v *= idle ? 1 : .94; }
    if (x > 0) { x *= .85; if (idle) v = -Math.abs(v); }
    if (x < minX) { x = minX + (x - minX) * .85; if (idle) v = Math.abs(v); }
    track.style.transform = `translate3d(${x}px,0,0)`;
    // wire path following the track
    const W = wrap.clientWidth; let d = '';
    for (let px = 0; px <= W; px += 12) d += (px ? 'L' : 'M') + px + ' ' + sagY(px - x).toFixed(1);
    path.setAttribute('d', d); wire.setAttribute('viewBox', `0 0 ${W} 120`);
    // pendulum sway
    const wr = wrap.getBoundingClientRect().left;
    polas.forEach((p, i) => {
      const s = angles[i];
      s.va += (-s.a * .06) - v * .012; s.va *= .92; s.a += s.va;
      const cx = p.offsetLeft + p.offsetWidth / 2 + x;
      p.style.setProperty('--by', (sagY(cx - x) - 6) + 'px');
      p.style.transform = `rotate(${Math.max(-14, Math.min(14, s.a)).toFixed(2)}deg)`;
    });
    void wr;
  });
  // lightbox
  const lb = $('#lightbox');
  function openLB(i) { const id = M[i]; $('#lbImg').src = `assets/img/real/${id}.webp`; $('#lbCap').textContent = T['m_' + id]; lb.classList.add('open'); }
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-x')) lb.classList.remove('open'); });
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
})();

/* ---------- occasions: words light up with scroll ---------- */
(() => {
  const box = $('#ocWords'); const W = T.oc_list.split('|');
  box.innerHTML = W.map(w => `<span>${w}</span>`).join('');
  const sp = $$('span', box); let last = -1;
  ScrollTrigger.create({ trigger: box, start: 'top 75%', end: 'bottom 35%', scrub: true, onUpdate: s => {
    const n = Math.round(s.progress * sp.length);
    if (n === last) return;
    sp.forEach((x, k) => { const on = k < n; if (on && !x.classList.contains('on')) { x.classList.remove('flick'); void x.offsetWidth; x.classList.add('flick'); } x.classList.toggle('on', on); });
    last = n;
  } });
})();

/* ---------- Chef Felfel ---------- */
(() => {
  const lines = [T.ff_b1, T.ff_b2, T.ff_b3, T.ff_b4]; let i = 0;
  gsap.to('#ffImg', { rotate: 2.5, y: -8, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.from('#ffImg', { scrollTrigger: { trigger: '#felfel', start: 'top 70%' }, y: 200, autoAlpha: 0, duration: 1, ease: 'back.out(1.4)' });
  gsap.from('.ff-sun', { scrollTrigger: { trigger: '#felfel', start: 'top 70%' }, scale: 0, duration: 1.1, ease: 'expo.out' });
  let timer = null;
  ScrollTrigger.create({ trigger: '#felfel', start: 'top 70%', end: 'bottom 20%',
    onToggle: s => {
      clearInterval(timer);
      if (s.isActive) timer = setInterval(() => {
        i = (i + 1) % lines.length;
        gsap.timeline().to('#ffBubble', { scale: .6, autoAlpha: 0, duration: .18 })
          .add(() => { $('#ffText').textContent = lines[i]; })
          .to('#ffBubble', { scale: 1, autoAlpha: 1, duration: .45, ease: 'back.out(2.6)' });
      }, 2600);
    } });
})();

/* ---------- generic reveals ---------- */
$$('.sec-head').forEach(h => gsap.from(h.children, { scrollTrigger: { trigger: h, start: 'top 85%' }, y: 40, autoAlpha: 0, stagger: .1, duration: .8, ease: 'power3.out' }));
gsap.from('.ct-splat', { scrollTrigger: { trigger: '#contact', start: 'top 75%' }, scale: .3, rotate: -30, autoAlpha: 0, duration: 1, ease: 'expo.out' });
gsap.from('.ct-title', { scrollTrigger: { trigger: '#contact', start: 'top 65%' }, y: 60, autoAlpha: 0, duration: .8, ease: 'back.out(1.6)' });
gsap.from('.faq details', { scrollTrigger: { trigger: '.faq-list', start: 'top 85%' }, y: 30, autoAlpha: 0, stagger: .08, duration: .6 });
gsap.from('.striker', { scrollTrigger: { trigger: '#game', start: 'top 75%' }, y: 120, autoAlpha: 0, duration: 1, ease: 'back.out(1.2)' });

runIntro();
addEventListener('load', () => ScrollTrigger.refresh());
})();
