// Planet marketing-service ad. Deterministic: window.renderAt(t) draws frame at time t (seconds).
const W = 1080, H = 1920, DUR = 46;
const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eout = (x) => 1 - Math.pow(1 - x, 3);
const back = (x) => { const c1 = 1.9, c3 = c1 + 1; return x <= 0 ? 0 : x >= 1 ? 1 : 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, x) => a + (b - a) * x;
const between = (t, a, b) => t >= a && t < b;
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const fmt = (n) => Math.round(n).toLocaleString('en-US');

// ---------- captions (word, start) from the voice-over ----------
const WORDS = [[0,'كريم'],[.28,'فتح'],[.56,'محل'],[.96,'هدوم'],[1.2,'نزّل'],[1.88,'أول'],[2.12,'بوست'],[2.4,'على'],[2.5,'الصفحة'],[3,'تلات'],[3.54,'لايكات'],[3.98,'واحد'],[5.1,'منهم'],[5.4,'مامته'],[5.78,'قال'],[6.02,'خلاص'],[6.94,'أعمل'],[7.38,'إعلان'],[7.76,'ودفع'],[8.36,'ألفين جنيه'],[9,'والرسايل'],[9.7,'جت'],[9.98,'بكام؟'],[10.54,'بكام؟'],[11.1,'بكام؟'],[11.64,'وسين'],[12.32,'ولا'],[12.92,'عملية'],[13.44,'بيع'],[13.72,'واحدة'],[14.24,'وفي'],[14.44,'نفس'],[14.66,'الشارع'],[15.1,'محل'],[15.68,'تاني'],[16,'والزحمة'],[16.54,'على'],[16.82,'بابه'],[17.32,'الفرق'],[17.74,'مش'],[17.9,'الحظ'],[18.4,'الفرق'],[19.08,'إن'],[19.34,'عنده'],[19.58,'خطة'],[20.04,'أول'],[20.32,'خطوة'],[20.84,'يعرف'],[21.22,'زبونه'],[21.64,'مين'],[21.82,'بالظبط'],[22.4,'تاني'],[22.78,'خطوة'],[23.22,'محتوى'],[23.78,'وريلز'],[24.2,'توقّف'],[24.72,'الصباع'],[25.16,'وهو'],[25.4,'بيقلّب'],[25.84,'تالت'],[26.4,'خطوة'],[26.84,'إعلان'],[27.24,'يوصل'],[27.56,'للي'],[27.88,'هيشتري'],[28.28,'مش'],[28.58,'لأي'],[28.84,'حد'],[29.16,'ورابع'],[29.74,'خطوة'],[30.16,'كل'],[30.44,'أسبوع'],[30.92,'يقيس'],[31.44,'ويعدّل'],[32.18,'كريم'],[32.64,'كلّم'],[32.86,'Planet'],[33.38,'وبعد'],[33.8,'كام'],[34.02,'أسبوع'],[34.48,'الرسايل'],[35.12,'بقت'],[35.3,'طلبات'],[35.84,'والمحل'],[36.52,'اتملى'],[36.82,'ودلوقتي'],[37.58,'خصم'],[38.04,'35%'],[39.1,'على'],[39.34,'باقات'],[39.66,'التسويق'],[40.28,'ابعتلنا'],[40.76,'واتساب'],[41.24,'وخلّي'],[41.68,'Planet'],[42.08,'تسوّقلك'],[42.64,'صح']];
const HIGHLIGHT = new Set(['بكام؟','وسين','الحظ','خطة','بالظبط','الصباع','هيشتري','ويعدّل','Planet','طلبات','اتملى','35%','واتساب','صح']);

// ---------- svg builders ----------
function el(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function svgHTML(parent, html) { const g = el('g', {}, parent); g.innerHTML = html; return g; }
const scene = $('scene');
const defs = el('defs', {}, scene);
defs.innerHTML = `
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f0"/><stop offset="1" stop-color="#e6f6fb"/></linearGradient>
<linearGradient id="awn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#143659"/><stop offset="1" stop-color="#143659"/></linearGradient>
<pattern id="stripes" width="80" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="#143659"/><rect x="40" width="40" height="10" fill="#f4f1ea"/></pattern>
<pattern id="stripes2" width="80" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="#d9534f"/><rect x="40" width="40" height="10" fill="#f4f1ea"/></pattern>
<pattern id="bricks" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#efe3cf"/><path d="M0 15H60M30 0V15M0 15V30M60 15V30" stroke="#e2d2b8" stroke-width="3"/></pattern>
<pattern id="bricks2" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#e7eef3"/><path d="M0 15H60M30 0V15M0 15V30M60 15V30" stroke="#d3dee6" stroke-width="3"/></pattern>
<radialGradient id="sunG"><stop offset="0" stop-color="#fff6c9"/><stop offset=".55" stop-color="#ffe08a" stop-opacity=".9"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient>`;

el('rect', { width: W, height: H, fill: 'url(#sky)' }, scene);
el('circle', { cx: 860, cy: 520, r: 190, fill: 'url(#sunG)' }, scene);
el('circle', { cx: 860, cy: 520, r: 70, fill: '#fff3b8' }, scene);
const clouds = el('g', {}, scene);
function cloud(x, y, s) { return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#fff"/><ellipse cx="-50" cy="8" rx="45" ry="22" fill="#fff"/><ellipse cx="55" cy="8" rx="50" ry="22" fill="#fff"/><ellipse cx="10" cy="-20" rx="40" ry="28" fill="#fff"/></g>`; }
clouds.innerHTML = cloud(120, 470, 1) + cloud(620, 380, .8) + cloud(1000, 640, .9) + cloud(1500, 450, 1) + cloud(1950, 560, .85);
const skyline = el('g', {}, scene);
{ let s = ''; for (let i = 0; i < 26; i++) { const x = i * 110 - 60, h = 220 + rnd(i) * 300, w = 90 + rnd(i + 9) * 50; s += `<rect x="${x}" y="${1250 - h}" width="${w}" height="${h}" rx="6" fill="#bcd9e6"/>`; for (let r = 0; r < Math.floor(h / 60) - 1; r++) s += `<rect x="${x + 18}" y="${1250 - h + 30 + r * 60}" width="${w - 36}" height="16" rx="4" fill="#cfe5ee"/>`; } skyline.innerHTML = s; }

const world = el('g', {}, scene);
// ground
svgHTML(world, `<rect x="-600" y="1250" width="4200" height="90" fill="#d9d4cc"/><rect x="-600" y="1250" width="4200" height="10" fill="#c9c2b8"/>
<rect x="-600" y="1340" width="4200" height="300" fill="#3b4250"/><rect x="-600" y="1340" width="4200" height="16" fill="#2c323d"/>
${Array.from({ length: 40 }, (_, i) => `<rect x="${-600 + i * 110}" y="1484" width="60" height="12" rx="6" fill="#e8e3d6" opacity=".8"/>`).join('')}
<rect x="-600" y="1640" width="4200" height="300" fill="#2a2f39"/>`);

function shop(x, name, pat, stripe, accent, items) {
  return `<g transform="translate(${x} 0)">
  <rect x="0" y="690" width="800" height="560" fill="url(#${pat})"/>
  <rect x="-14" y="676" width="828" height="30" rx="8" fill="${accent}"/>
  <rect x="150" y="712" width="500" height="112" rx="22" fill="${accent}"/>
  <text x="400" y="790" text-anchor="middle" font-family="Alx" font-weight="900" font-size="64" fill="#fff">${name}</text>
  <path d="M-10 858 H810 L790 948 H10 Z" fill="url(#${stripe})"/>
  ${Array.from({ length: 10 }, (_, i) => `<path d="M${-10 + i * 82} 948 q41 34 82 0" fill="${i % 2 ? '#f4f1ea' : accent}"/>`).join('')}
  <rect x="40" y="990" width="300" height="230" rx="10" fill="#bfe3f0" stroke="${accent}" stroke-width="12"/>
  <rect x="460" y="990" width="300" height="230" rx="10" fill="#bfe3f0" stroke="${accent}" stroke-width="12"/>
  ${items}
  <rect x="320" y="1010" width="160" height="240" rx="8" fill="${accent}"/><rect x="336" y="1026" width="128" height="224" rx="4" fill="#9cc7d9"/><circle cx="446" cy="1140" r="8" fill="#ffd36b"/>
  <rect x="0" y="1236" width="800" height="14" fill="#cfc6b6"/></g>`;
}
function hangers(x0, cols) { let s = `<line x1="${x0 + 20}" y1="1020" x2="${x0 + 260}" y2="1020" stroke="#8a6d4a" stroke-width="6"/>`; cols.forEach((c, i) => { const x = x0 + 50 + i * 70; s += `<path d="M${x} 1020 l0 14 l-30 18 v100 h60 v-100 l-30 -18" fill="${c}"/>`; }); return s; }
const shop1 = svgHTML(world, shop(140, 'كريم ستور', 'bricks', 'stripes', '#143659', hangers(180, ['#ff8a5b', '#5fb0e8', '#ffd36b', '#92C5B4']) + hangers(600, ['#c77dff', '#ff5a7a', '#5fe0a1', '#f4f1ea'])));
const shop2 = svgHTML(world, shop(1240, 'محل تاني', 'bricks2', 'stripes2', '#b23a48', hangers(1280, ['#ffd36b', '#5fb0e8', '#ff8a5b', '#c77dff']) + hangers(1700, ['#5fe0a1', '#ff5a7a', '#ffd36b', '#5fb0e8'])));
// planters / props
svgHTML(world, `<g><rect x="90" y="1180" width="60" height="70" rx="8" fill="#c97b4a"/><circle cx="120" cy="1160" r="42" fill="#5cb85c"/><circle cx="100" cy="1140" r="26" fill="#6fcf6f"/></g>
<g><rect x="1000" y="1060" width="16" height="190" fill="#56606e"/><circle cx="1008" cy="1050" r="22" fill="#ffd36b"/></g>`);

const fx = el('g', {}, world);       // world-space effects (rings, arrows)
const people = el('g', {}, world);
const over = el('g', {}, scene);     // screen-space svg overlays

// ---------- characters ----------
const SKIN = ['#f6c08f', '#e0a172', '#c98a5b', '#f1c9a5', '#a8714a'];
const SHIRT = ['#ff8a5b', '#5fb0e8', '#ffd36b', '#c77dff', '#5fe0a1', '#ff5a7a', '#7d8cff', '#f29f4b', '#4fc3c7', '#e85d75'];
const PANTS = ['#2f3e56', '#4b5563', '#1f4e79', '#5b4636', '#334155'];
function makePerson(o) {
  const g = el('g', {}, people);
  const hair = o.hijab ? `<path d="M-44 -238 a44 46 0 0 1 88 0 v40 q-44 26 -88 0z" fill="${o.hairC}"/>` : `<path d="M-38 -258 q38 -40 76 0 v-6 q-38 -28 -76 0z" fill="${o.hairC}"/><path d="M-39 -252 q4 -30 39 -32 q35 2 39 32 q-20 -12 -39 -10 q-20 -2 -39 10z" fill="${o.hairC}"/>`;
  g.innerHTML = `<g class="sh"><ellipse cx="0" cy="2" rx="46" ry="10" fill="rgba(0,0,0,.15)"/></g>
  <g class="body">
    <g class="legL"><rect x="-26" y="-92" width="24" height="92" rx="12" fill="${o.pants}"/><rect x="-32" y="-14" width="34" height="16" rx="8" fill="#222"/></g>
    <g class="legR"><rect x="2" y="-92" width="24" height="92" rx="12" fill="${o.pants}"/><rect x="0" y="-14" width="34" height="16" rx="8" fill="#222"/></g>
    <rect x="-40" y="-200" width="80" height="120" rx="30" fill="${o.shirt}"/>
    <g class="armL"><rect x="-56" y="-192" width="20" height="96" rx="10" fill="${o.shirt}"/><circle cx="-46" cy="-94" r="11" fill="${o.skin}"/></g>
    <g class="armR"><rect x="36" y="-192" width="20" height="96" rx="10" fill="${o.shirt}"/><circle cx="46" cy="-94" r="11" fill="${o.skin}"/></g>
    <rect x="-10" y="-212" width="20" height="18" fill="${o.skin}"/>
    <g class="head"><circle cx="0" cy="-246" r="40" fill="${o.skin}"/>${hair}
      <circle class="eyeL" cx="-14" cy="-246" r="5" fill="#1b1b1b"/><circle class="eyeR" cx="14" cy="-246" r="5" fill="#1b1b1b"/>
      <path class="mouth" d="M-12 -228 q12 10 24 0" stroke="#7a3b2e" stroke-width="5" fill="none" stroke-linecap="round"/></g>
    ${o.bag ? `<g class="bag" opacity="0"><rect x="44" y="-110" width="44" height="50" rx="6" fill="${o.bag}"/><path d="M54 -110 q12 -20 24 0" stroke="${o.bag}" stroke-width="5" fill="none"/></g>` : ''}
  </g>
  <g class="tag" opacity="0"></g>`;
  const P = { g, o, legL: g.querySelector('.legL'), legR: g.querySelector('.legR'), armL: g.querySelector('.armL'), armR: g.querySelector('.armR'), body: g.querySelector('.body'), mouth: g.querySelector('.mouth'), tag: g.querySelector('.tag'), bag: g.querySelector('.bag') };
  return P;
}
function pose(P, x, y, s, dir, walkPh, opts = {}) {
  // dir: 1 facing right, -1 left. walkPh: radians (NaN = standing)
  const sw = isNaN(walkPh) ? 0 : Math.sin(walkPh) * 26;
  const bob = isNaN(walkPh) ? (opts.bob || 0) : Math.abs(Math.cos(walkPh)) * -6;
  P.g.setAttribute('transform', `translate(${x} ${y}) scale(${s * dir} ${s})`);
  P.g.setAttribute('opacity', opts.op == null ? 1 : opts.op);
  P.body.setAttribute('transform', `translate(0 ${bob})`);
  P.legL.setAttribute('transform', `rotate(${sw} -14 -92)`);
  P.legR.setAttribute('transform', `rotate(${-sw} 14 -92)`);
  const aL = opts.armsUp ? 150 + Math.sin(opts.armsUp) * 15 : -sw * .8 + (opts.armL || 0);
  const aR = opts.armsUp ? -150 - Math.sin(opts.armsUp) * 15 : sw * .8 + (opts.armR || 0);
  P.armL.setAttribute('transform', `rotate(${aL} -46 -186)`);
  P.armR.setAttribute('transform', `rotate(${aR} 46 -186)`);
  P.mouth.setAttribute('d', opts.sad ? 'M-12 -224 q12 -10 24 0' : opts.wow ? 'M-8 -230 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0' : 'M-12 -228 q12 10 24 0');
  if (P.bag) P.bag.setAttribute('opacity', opts.bag ? 1 : 0);
}

const karim = makePerson({ skin: '#e0a172', shirt: '#92C5B4', pants: '#143659', hairC: '#2b1d14' });
const crowd = [];
for (let i = 0; i < 12; i++) crowd.push(makePerson({ skin: SKIN[i % 5], shirt: SHIRT[i % 10], pants: PANTS[(i * 3) % 5], hairC: i % 4 === 1 ? '#5b3a29' : '#1f1a17', hijab: i % 3 === 2, bag: ['#ffd36b', '#ff8a5b', '#92C5B4', '#c77dff'][i % 4] }));
const queue2 = [];
for (let i = 0; i < 7; i++) queue2.push(makePerson({ skin: SKIN[(i + 2) % 5], shirt: SHIRT[(i + 4) % 10], pants: PANTS[(i + 1) % 5], hairC: '#1f1a17', hijab: i % 3 === 0, bag: ['#b23a48', '#ffd36b', '#5fb0e8'][i % 3] }));
// highlight targets for steps 1 & 3
const TARGETS = [1, 4, 7];

// tags above heads
function setTag(P, html, op, sc = 1) { if (P._tag !== html) { P.tag.innerHTML = html; P._tag = html; } P.tag.setAttribute('opacity', op); P.tag.setAttribute('transform', `translate(0 -330) scale(${sc})`); }
const PIN = `<g><circle cx="0" cy="0" r="34" fill="#143659"/><circle cx="0" cy="0" r="22" fill="none" stroke="#92C5B4" stroke-width="6"/><circle cx="0" cy="0" r="8" fill="#92C5B4"/><path d="M-12 30 L0 52 L12 30z" fill="#143659"/></g>`;
const HEARTB = `<g><rect x="-44" y="-36" width="88" height="66" rx="24" fill="#fff"/><path d="M-8 30 L0 46 L8 30z" fill="#fff"/><path d="M0 14 C-28 -6 -18 -26 0 -14 C18 -26 28 -6 0 14z" fill="#ff4d6d"/></g>`;
const XB = `<g><circle r="26" fill="#ff5a5f"/><path d="M-10 -10 L10 10 M10 -10 L-10 10" stroke="#fff" stroke-width="7" stroke-linecap="round"/></g>`;

// ---------- overlays ----------
const tumble = svgHTML(world, `<g id="tw"><circle r="44" fill="none" stroke="#a5814f" stroke-width="5"/><path d="M-40 -10 Q0 -50 40 10 M-30 30 Q0 -20 36 -26 M-20 -38 Q10 20 -36 24 M0 -44 Q30 0 0 44" stroke="#a5814f" stroke-width="4" fill="none"/></g>`);
const money = el('g', {}, over);
for (let i = 0; i < 14; i++) svgHTML(money, `<g><rect x="-56" y="-28" width="112" height="56" rx="8" fill="#6cc070" stroke="#3f8f45" stroke-width="4"/><circle r="16" fill="none" stroke="#3f8f45" stroke-width="4"/><text y="9" text-anchor="middle" font-family="Alx" font-weight="900" font-size="22" fill="#2f6f35">200</text></g>`);
const clover = svgHTML(over, `<g transform="translate(540 820)"><g fill="#4caf50"><circle cx="-55" cy="-55" r="62"/><circle cx="55" cy="-55" r="62"/><circle cx="-55" cy="55" r="62"/><circle cx="55" cy="55" r="62"/></g><path d="M0 40 Q30 160 90 210" stroke="#3d8b40" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M-170 -170 L170 170" stroke="#ff5a5f" stroke-width="34" stroke-linecap="round" class="slash"/></g>`);
const dim = el('rect', { width: W, height: H, fill: '#0b1d33', opacity: 0 }, over);
// chart card (step 4)
const chart = svgHTML(over, `<g transform="translate(540 900)">
 <rect x="-380" y="-330" width="760" height="620" rx="44" fill="#fff"/>
 <text x="330" y="-250" text-anchor="end" font-family="Alx" font-weight="900" font-size="46" fill="#143659">تقرير الأسبوع</text>
 <g class="bars">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-300 + i * 100}" y="200" width="64" height="0" rx="12" fill="${i < 3 ? '#cfd8e3' : '#92C5B4'}"/>`).join('')}</g>
 <polyline class="line" points="" fill="none" stroke="#143659" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
 <g class="gear" transform="translate(-270 -230)"><circle r="40" fill="#143659"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-12" y="-58" width="24" height="26" rx="5" fill="#143659" transform="rotate(${i * 45})"/>`).join('')}<circle r="16" fill="#fff"/></g>
 <line x1="-330" y1="214" x2="330" y2="214" stroke="#e3e8ee" stroke-width="6"/></g>`);
const confetti = el('g', {}, over);
for (let i = 0; i < 70; i++) el('rect', { width: 18, height: 30, rx: 4, fill: ['#92C5B4', '#ffd36b', '#ff5a7a', '#5fb0e8', '#c77dff', '#143659'][i % 6] }, confetti);
const hearts = el('g', {}, over);
for (let i = 0; i < 12; i++) svgHTML(hearts, `<path d="M0 22 C-40 -6 -26 -36 0 -18 C26 -36 40 -6 0 22z" fill="${i % 2 ? '#ff4d6d' : '#ff7a93'}"/>`);
const offerRings = $('offer');
for (let i = 0; i < 6; i++) { const d = document.createElement('div'); d.className = 'ring'; const r = 300 + i * 220; Object.assign(d.style, { width: r + 'px', height: r + 'px', left: (540 - r / 2) + 'px', top: (720 - r / 2) + 'px' }); offerRings.prepend(d); }

// DMs
const DMN = 13;
const dmBox = $('pv-dm');
const DMA = ['#ff8a5b', '#5fb0e8', '#ffd36b', '#c77dff', '#5fe0a1', '#ff5a7a', '#7d8cff', '#f29f4b', '#4fc3c7', '#e85d75', '#8bc34a', '#ffb74d', '#90a4ae'];
const DMT = ['بكام؟', 'بكام؟', 'السعر؟', 'بكام؟', 'بكام ده؟', 'بكام؟', 'كام؟', 'بكام؟', 'السعر لو سمحت', 'بكام؟', 'بكام؟', 'كام سعره؟', 'بكام؟'];
dmBox.innerHTML = `<div class="dmin">` + DMT.map((t, i) => `<div class="dm"><div class="a" style="background:${DMA[i]}"></div><div class="t">${t}</div><div class="s">Seen ✓✓</div></div>`).join('') + `</div>`;
const dmRows = [...dmBox.querySelectorAll('.dm')], dmIn = dmBox.querySelector('.dmin');
const dmT = (i) => 9.0 + i * 0.2;
// feed for step 2
$('pv-feed').innerHTML = `<div id="feedin" style="position:absolute;left:0;right:0;top:0">` + Array.from({ length: 9 }, (_, i) => {
  const mine = i === 7; const c = ['#ffd1dc', '#c8e6ff', '#fff1b8', '#d9f7e8', '#e8dcff', '#ffe0cc', '#d2f0f7', '#143659', '#ffd1dc'][i];
  return `<div class="reel" style="top:${i * 864}px;background:${c}">${mine ? `<svg width="464" height="864" viewBox="0 0 464 864"><rect width="464" height="864" fill="#cdeaf6"/><rect x="40" y="300" width="384" height="300" fill="#efe3cf"/><rect x="90" y="320" width="284" height="60" rx="14" fill="#143659"/><text x="232" y="362" text-anchor="middle" font-family="Alx" font-weight="900" font-size="32" fill="#fff">كريم ستور</text><path d="M30 400 H434 L424 440 H40z" fill="#143659"/><rect x="60" y="470" width="120" height="110" fill="#bfe3f0"/><rect x="284" y="470" width="120" height="110" fill="#bfe3f0"/><rect x="196" y="480" width="72" height="120" fill="#143659"/><rect x="0" y="600" width="464" height="264" fill="#d9d4cc"/><circle cx="232" cy="200" r="56" fill="rgba(255,255,255,.9)"/><path d="M216 172 L256 200 L216 228z" fill="#143659"/><text x="232" y="700" text-anchor="middle" font-family="Alx" font-weight="900" font-size="44" fill="#143659">تشكيلة الشتا 🔥</text><text x="232" y="770" text-anchor="middle" font-family="Alx" font-weight="700" font-size="28" fill="#56606e">♥ 12.4K   💬 860</text></svg>` : `<div style="position:absolute;left:40px;right:40px;top:200px;height:420px;border-radius:30px;background:rgba(255,255,255,.55)"></div><div style="position:absolute;left:40px;top:660px;width:260px;height:26px;border-radius:13px;background:rgba(0,0,0,.12)"></div><div style="position:absolute;left:40px;top:704px;width:180px;height:26px;border-radius:13px;background:rgba(0,0,0,.08)"></div>`}</div>`;
}).join('') + `</div>`;
const feedIn = $('feedin');
// thumb
const thumb = svgHTML(over, `<g><path d="M0 0 c-10 -60 30 -70 36 -20 l6 70 c30 -10 70 0 72 40 l-8 110 h-120 l-40 -120 c-10 -30 20 -40 40 -10z" fill="#f1c9a5" stroke="#d9a37c" stroke-width="4"/></g>`);

// ---------- timeline helpers ----------
function show(id, v, extra = '') { const e = $(id); e.style.opacity = v; e.style.display = v > 0.001 ? '' : 'none'; if (extra) e.style.transform = extra; }
function popS(t, t0, d = .35) { return back(seg(t, t0, t0 + d)); }

// crowd paths
function crowdPos(i, t) {
  const ti = TARGETS.indexOf(i);
  if (ti >= 0 && t >= 20 && t < 33.3) { const dir = ti === 1 ? 1 : -1; return { x: [230, 560, 870][ti] + dir * (t - 20) * 12, dir, ph: t * 5.5 + i }; }
  const sp = 70 + rnd(i) * 50, dir = i % 2 ? 1 : -1;
  const span = 1600, off = rnd(i + 3) * span;
  let x = ((off + dir * sp * t) % span + span) % span - 260;
  return { x, dir, ph: t * (5.2 + rnd(i) * 1.2) + i };
}

window.renderAt = function (t) {
  // ----- camera -----
  let camX = 0;
  if (t >= 14.2 && t < 20.0) camX = 1100 * eio(seg(t, 14.2, 15.1));
  let shake = 0; if (t > 38.04 && t < 38.4) shake = Math.sin(t * 90) * 14 * (1 - seg(t, 38.04, 38.4));
  world.setAttribute('transform', `translate(${-camX} 0)`);
  skyline.setAttribute('transform', `translate(${-camX * .35} 0)`);
  clouds.setAttribute('transform', `translate(${-camX * .2 - t * 6} 0)`);
  $('stage').style.transform = `translate(${shake}px, ${shake * .6}px)`;

  // ----- shop build (0 - 1.0) -----
  const b1 = back(seg(t, 0.05, 0.75));
  shop1.setAttribute('transform', `translate(540 1250) scale(${lerp(.6, 1, b1)} ${b1}) translate(-540 -1250)`);

  // ----- Karim -----
  const kIn = popS(t, .3, .4);
  const sad = between(t, 9.6, 14.2);
  const happy = t >= 34.4;
  let kx = 300, ky = 1300, kph = NaN;
  if (t < 1.1) { kx = lerp(-80, 300, eout(seg(t, .3, 1.1))); kph = t * 9; }
  pose(karim, kx, ky + (1 - kIn) * 30, 1.12, 1, kph, { sad, armsUp: happy ? t * 9 : 0, wow: between(t, 5.9, 6.9), armR: between(t, 6.0, 8.9) ? -40 : 0 });
  karim.g.setAttribute('opacity', kIn);

  // ----- crowd -----
  const inStreet = t < 14.2 || (t >= 20 && t < 32.1) || t >= 33.3;
  const scanned = seg(t, 21.3, 21.7);
  const queueing = seg(t, 33.4, 35.6);
  crowd.forEach((P, i) => {
    if (!inStreet || t >= 36.8) { P.g.setAttribute('opacity', 0); return; }
    let { x, dir, ph } = crowdPos(i, t);
    let op = 1, bag = false;
    if (t >= 33.3) {
      // walk into a queue at Karim's door
      const qx = 640 + (i % 6) * 78 + (i >= 6 ? 440 : 0), qy = 1300 - (i >= 6 ? 0 : 0);
      const from = crowdPos(i, 33.3);
      const k = eio(clamp((t - 33.3 - (i % 6) * .08) / 1.6));
      x = lerp(from.x, i >= 6 ? 1280 - (i - 6) * 70 : qx, k);
      dir = (i >= 6 ? 1280 - (i - 6) * 70 : qx) < from.x ? -1 : 1;
      if (k >= 1) { ph = NaN; dir = -1; bag = t > 35.3 && i % 2 === 0; }
    }
    if (t >= 20 && t < 32.1 && !TARGETS.includes(i)) op = 1 - .65 * scanned;
    pose(P, x, 1305 + (i % 3) * 6, .92, dir, ph, { op, bag, bob: Math.sin(t * 6 + i) * 2 });
    // tags
    if (t >= 21.3 && t < 25.8 && TARGETS.includes(i)) setTag(P, PIN, 1, popS(t, 21.4 + TARGETS.indexOf(i) * .12));
    else if (t >= 26.9 && t < 32.1 && TARGETS.includes(i)) setTag(P, HEARTB, 1, popS(t, 27.1 + TARGETS.indexOf(i) * .2));
    else if (t >= 28.3 && t < 32.1 && !TARGETS.includes(i)) setTag(P, XB, .9, popS(t, 28.3 + (i % 5) * .05));
    else if (t >= 35.3 && t < 36.8 && i % 3 === 0) setTag(P, HEARTB, 1, popS(t, 35.3 + (i % 6) * .08));
    else setTag(P, '', 0);
  });
  // highlight rings under targets
  if (t >= 21.3 && t < 32.1) {
    let s = '';
    TARGETS.forEach((i, k) => { const { x } = crowdPos(i, t); const sc = popS(t, 21.4 + k * .12); s += `<ellipse cx="${x}" cy="${1310 + (i % 3) * 6}" rx="${70 * sc}" ry="${18 * sc}" fill="none" stroke="#92C5B4" stroke-width="8"/>`; });
    // radar sweep
    const rs = seg(t, 20.9, 21.6); if (rs > 0 && rs < 1) s += `<circle cx="540" cy="1150" r="${rs * 900}" fill="none" stroke="#92C5B4" stroke-width="${14 * (1 - rs)}" opacity="${1 - rs}"/>`;
    // ad arrows step 3
    if (t >= 26.8) TARGETS.forEach((i, k) => {
      const a = seg(t, 26.84 + k * .2, 27.5 + k * .2); if (a <= 0) return;
      const { x } = crowdPos(i, t); const x0 = 540, y0 = 760, x1 = x, y1 = 1000; const cx = (x0 + x1) / 2, cy = 560;
      const tt = eout(a); const px = (1 - tt) * (1 - tt) * x0 + 2 * (1 - tt) * tt * cx + tt * tt * x1, py = (1 - tt) * (1 - tt) * y0 + 2 * (1 - tt) * tt * cy + tt * tt * y1;
      s += `<path d="M${x0} ${y0} Q${cx} ${cy} ${px} ${py}" stroke="#143659" stroke-width="9" stroke-dasharray="22 16" fill="none" stroke-linecap="round" opacity="${1 - seg(t, 29.0, 29.2)}"/>`;
      s += `<g transform="translate(${px} ${py}) rotate(${a < 1 ? -20 : 0})" opacity="${1 - seg(t, 29.0, 29.2)}"><path d="M-30 -18 L34 0 L-30 18 L-18 0z" fill="#92C5B4" stroke="#143659" stroke-width="5" stroke-linejoin="round"/></g>`;
    });
    fx.innerHTML = s;
  } else if (t >= 14.6 && t < 17.3) {
    fx.innerHTML = '';
  } else fx.innerHTML = '';
  // competitor queue
  queue2.forEach((P, i) => {
    const vis = t >= 14.2 && t < 20;
    if (!vis) { P.g.setAttribute('opacity', 0); return; }
    const x = 1760 + i * 74, isIn = i === 0 && (t % 1.2) < .6;
    pose(P, x - (i === 0 ? 0 : 0), 1305 + (i % 2) * 5, .9, -1, NaN, { bob: Math.sin(t * 7 + i) * 3, bag: i % 2 === 1 });
    setTag(P, i % 3 === 1 ? HEARTB : '', i % 3 === 1 ? 1 : 0, popS(t, 15.4 + i * .1));
  });
  // tumbleweed
  { const a = seg(t, 12.2, 14.2); const x = lerp(1180, -150, a); tumble.setAttribute('transform', `translate(${x} ${1290}) rotate(${-a * 900})`); tumble.setAttribute('opacity', a > 0 && a < 1 ? 1 : 0); }

  // ----- phone (post / dm / feed) -----
  let phoneOp = 0, phoneY = 0;
  if (t >= 1.2 && t < 12.3) { const a = back(seg(t, 1.2, 1.6)), b = seg(t, 12.0, 12.3); phoneOp = 1; phoneY = (1 - a) * 900 + b * 1200; }
  if (t >= 22.4 && t < 25.8) { const a = back(seg(t, 22.4, 22.8)), b = seg(t, 25.55, 25.8); phoneOp = 1; phoneY = (1 - a) * 900 + b * 1200; }
  show('phone', phoneOp, `translateY(${phoneY}px)`);
  const postMode = t < 9.0, dmMode = t >= 9.0 && t < 12.3, feedMode = t >= 22.4;
  $('pv-post').style.display = postMode ? '' : 'none';
  $('pv-dm').style.display = dmMode ? '' : 'none';
  $('pv-feed').style.display = feedMode && t < 25.8 ? '' : 'none';
  if (postMode) {
    const likes = t < 3.0 ? 0 : t < 3.25 ? 1 : t < 3.5 ? 2 : 3;
    $('likes').textContent = likes;
    const pressed = between(t, 7.3, 7.55);
    const pulse = between(t, 6.4, 7.3) ? 1 + Math.sin((t - 6.4) * 18) * .04 : 1;
    $('adbtn').style.transform = `scale(${pressed ? .92 : pulse})`;
    $('adbtn').style.background = t >= 7.38 ? '#0f5bd0' : '#1877f2';
    $('adbtn').textContent = t >= 7.38 ? '✓ الإعلان شغّال' : '⚡ ترويج المنشور';
    $('postimg').innerHTML = `<svg width="100%" height="100%" viewBox="0 0 420 330"><rect width="420" height="330" fill="#ffe2c4"/><path d="M150 70 l20 -20 h80 l20 20 l60 30 l-24 60 l-36 -14 v150 h-120 v-150 l-36 14 l-24 -60z" fill="#92C5B4"/><text x="210" y="320" text-anchor="middle" font-family="Alx" font-weight="900" font-size="30" fill="#143659" opacity=".6">جديد 🔥</text></svg>`;
  }
  { const m = t >= 5.1 && t < 9.0 ? popS(t, 5.1) : 0; show('mama', m > 0 ? 1 : 0, `translateY(${phoneY}px) scale(${m})`); }
  if (dmMode) {
    let shown = 0;
    dmRows.forEach((r, i) => { const a = seg(t, dmT(i), dmT(i) + .18); r.style.opacity = a; r.style.transform = `translateX(${(1 - eout(a)) * 120}px) scale(${lerp(.8, 1, back(a))})`; if (a > 0) shown = i + 1; r.querySelector('.s').style.opacity = t >= 11.64 + i * .03 ? 1 : 0; });
    const rowH = 88, maxVis = 8;
    dmIn.style.transform = `translateY(${-Math.max(0, (seg(t, 9.0, 11.6) * DMN) - maxVis) * rowH}px)`;
  }
  if (feedMode && t < 25.8) {
    // fast scroll that decelerates and stops on reel #7
    const k = eout(seg(t, 22.8, 24.25));
    feedIn.style.transform = `translateY(${-k * 7 * 864}px)`;
  }
  // thumb swipe
  { const on = t >= 22.9 && t < 24.6; const a = (t - 22.9) % .45 / .45; const y = on ? (t < 24.2 ? 1150 - a * 260 : 1000) : 2200; thumb.setAttribute('transform', `translate(700 ${y}) scale(1.4)`); thumb.setAttribute('opacity', on ? 1 : 0); }
  // hearts float
  [...hearts.children].forEach((h, i) => { const st = 24.3 + i * .1, a = seg(t, st, st + 1.2); const on = a > 0 && a < 1 && t < 25.8; h.setAttribute('opacity', on ? 1 - a * a : 0); h.setAttribute('transform', `translate(${560 + Math.sin(i * 2.3 + a * 5) * 140} ${1100 - a * 620}) scale(${1.4 + rnd(i) * .8})`); });

  // ----- money flying to board (7.76-8.9) -----
  [...money.children].forEach((m, i) => { const st = 7.76 + i * .06, a = seg(t, st, st + .7); const on = a > 0 && a < 1; const x = lerp(540 + (rnd(i) - .5) * 200, 240 + (rnd(i + 5) - .5) * 120, eio(a)), y = lerp(1180, 230, eio(a)) - Math.sin(a * Math.PI) * 120; m.setAttribute('opacity', on ? 1 : 0); m.setAttribute('transform', `translate(${x} ${y}) rotate(${(rnd(i) - .5) * 80 + a * 200}) scale(${lerp(1.2, .5, a)})`); });

  // ----- scoreboard -----
  let bOp = 0, bY = 0;
  if (t >= 7.5 && t < 14.2) { bOp = 1; bY = (1 - back(seg(t, 7.5, 7.9))) * -400; }
  if (t >= 33.4 && t < 36.8) { bOp = 1; bY = (1 - back(seg(t, 33.4, 33.8))) * -400; }
  show('board', bOp, `translateY(${bY}px)`);
  if (t < 20) {
    $('l1').textContent = 'صرفت'; $('l2').textContent = 'رسايل'; $('l3').textContent = 'مبيعات';
    $('v1').className = 'val amber'; $('v1').textContent = fmt(2000 * eio(seg(t, 7.9, 8.85)));
    $('v2').className = 'val'; $('v2').textContent = fmt(Math.min(DMN, Math.floor(seg(t, 9.0, 11.6) * DMN + .001)) * 4);
    $('v3').className = 'val red'; $('v3').textContent = '0';
    $('v3').style.transform = t > 12.3 ? `scale(${1 + Math.abs(Math.sin((t - 12.3) * 6)) * .18})` : 'none';
  } else {
    $('l1').textContent = 'زيارات'; $('l2').textContent = t >= 35.12 ? 'طلبات' : 'رسايل'; $('l3').textContent = 'مبيعات';
    $('v1').className = 'val'; $('v1').textContent = fmt(12400 * eio(seg(t, 33.8, 36.0)));
    $('v2').className = t >= 35.12 ? 'val green' : 'val'; $('v2').textContent = fmt(t < 35.12 ? 186 * eio(seg(t, 33.8, 35.1)) : 186);
    $('v3').className = 'val green'; $('v3').textContent = fmt(143 * eio(seg(t, 35.1, 36.6)));
    $('v3').style.transform = 'none';
  }

  // ----- "not luck" + plan -----
  { const c = t >= 17.74 && t < 18.4 ? popS(t, 17.74, .3) : 0; clover.setAttribute('opacity', c > 0 ? 1 : 0); clover.setAttribute('transform', `translate(540 820) scale(${c}) translate(-540 -820)`); clover.querySelector('.slash').setAttribute('stroke-dasharray', `${seg(t, 17.9, 18.1) * 480} 999`); }
  let dimOp = 0;
  if (t >= 17.7 && t < 20.0) dimOp = .45 * seg(t, 17.7, 17.9);
  if (t >= 29.1 && t < 33.3) dimOp = .45 * seg(t, 29.1, 29.3);
  dim.setAttribute('opacity', dimOp);
  { const p = t >= 18.4 && t < 20.0 ? popS(t, 18.4, .4) : 0; show('plan', p > 0 ? 1 : 0, `scale(${p})`);
    for (let i = 1; i <= 4; i++) { const ok = t >= 19.58 + (i - 1) * .1; $('pb' + i).className = 'bx' + (ok ? ' ok' : ''); $('pb' + i).textContent = ok ? '✓' : ''; } }

  // ----- step chip -----
  const steps = [[20.04, 22.4, '1', 'اعرف زبونك'], [22.4, 25.84, '2', 'محتوى يوقّف الصباع'], [25.84, 29.16, '3', 'إعلان للي هيشتري'], [29.16, 32.1, '4', 'قِيس وعدّل']];
  let chip = null; steps.forEach((s) => { if (t >= s[0] && t < s[1]) chip = s; });
  if (chip) { $('chipn').textContent = chip[2]; $('chipt').textContent = chip[3]; const p = popS(t, chip[0], .35); show('chip', 1, `translateX(-50%) scale(${p})`); show('dots', 1, 'translateX(-50%)'); [...$('dots').children].forEach((d, i) => d.className = i < +chip[2] ? 'on' : ''); }
  else { show('chip', 0); show('dots', 0); }
  // chip sits above the phone during step 2
  $('chip').style.top = '380px'; $('dots').style.top = '505px';
  if (chip && chip[2] === '2') { $('chip').style.top = '230px'; $('dots').style.top = '355px'; }

  // ----- chart (step 4) -----
  { const on = t >= 29.2 && t < 32.1; const p = on ? popS(t, 29.2, .4) : 0; chart.setAttribute('opacity', on ? 1 : 0); chart.setAttribute('transform', `translate(540 900) scale(${p}) translate(-540 -900)`);
    const hs = [90, 70, 110, 190, 260, 360]; const bars = chart.querySelectorAll('.bars rect');
    bars.forEach((r, i) => { const a = back(seg(t, 29.6 + i * .12, 30.0 + i * .12)); const hh = hs[i] * (i >= 3 ? lerp(.55, 1, seg(t, 31.44, 31.8)) : 1) * a; r.setAttribute('height', hh); r.setAttribute('y', 200 - hh); });
    const lk = seg(t, 30.3, 31.9); const pts = hs.map((h, i) => [-268 + i * 100, 200 - h * (i >= 3 ? lerp(.55, 1, seg(t, 31.44, 31.8)) : 1) - 40]); const n = Math.max(1, Math.ceil(lk * 6));
    chart.querySelector('.line').setAttribute('points', pts.slice(0, n).map((p) => p.join(',')).join(' '));
    chart.querySelector('.gear').setAttribute('transform', `translate(-270 -230) rotate(${seg(t, 31.3, 32.0) * 360})`); }

  // ----- call -----
  { const on = t >= 32.1 && t < 33.4; const p = on ? popS(t, 32.1, .35) : 0; show('call', on ? 1 : 0, `scale(${p}) translateY(${t > 33.1 ? seg(t, 33.1, 33.4) * 1300 : 0}px)`);
    $('callst').textContent = t >= 32.86 ? 'متصل ✓' : 'بيتصل…'; $('callok').style.transform = t < 32.86 ? `scale(${1 + Math.abs(Math.sin(t * 9)) * .12})` : 'scale(.0)'; }

  // ----- confetti -----
  [...confetti.children].forEach((c, i) => { const a = seg(t, 36.4 + rnd(i) * .2, 37.6 + rnd(i) * .4); const on = a > 0 && a < 1; const ang = rnd(i + 1) * Math.PI - Math.PI; const v = 900 + rnd(i + 2) * 700; const x = 540 + Math.cos(ang) * v * a * 0.9, y = 1150 + Math.sin(ang) * v * a + 1400 * a * a; c.setAttribute('opacity', on ? 1 : 0); c.setAttribute('transform', `translate(${x} ${y}) rotate(${a * 720 * (rnd(i) - .5) * 3})`); });

  // ----- offer -----
  { const on = t >= 36.82; const r = eio(seg(t, 36.82, 37.25)) * 1400; $('offer').style.display = on ? '' : 'none'; $('offer').style.clipPath = `circle(${r}px at 540px 1000px)`;
    const kh = popS(t, 37.58); $('off-kh').style.transform = `scale(${kh})`;
    const pa = seg(t, 38.04, 38.3); $('off-pct').style.opacity = pa > 0 ? 1 : 0; $('off-pct').style.transform = `scale(${lerp(2.6, 1, eout(pa))}) rotate(${lerp(-8, -4, pa)}deg)`;
    const sb = seg(t, 39.1, 39.4); $('off-sub').style.opacity = sb; $('off-sub').style.transform = `translateY(${(1 - eout(sb)) * 40}px)`;
    const lm = popS(t, 39.66); $('off-lim').style.transform = `translateX(-50%) scale(${lm})`;
    const wa = popS(t, 40.28); $('off-wa').style.transform = `scale(${wa * (t > 41 ? 1 + Math.sin((t - 41) * 5) * .025 : 1)})`;
    const lg = popS(t, 37.2); $('off-logo').style.transform = `scale(${lg})`;
    [...offerRings.querySelectorAll('.ring')].forEach((d, i) => d.style.transform = `scale(${1 + ((t * .12 + i * .17) % 1) * .3})`); }
  { const f = t >= 38.04 && t < 38.25 ? 1 - seg(t, 38.04, 38.25) : t >= 20.0 && t < 20.12 ? 1 - seg(t, 20.0, 20.12) : 0; $('flash').style.opacity = f * .85; }

  // ----- captions -----
  let w = null; for (const x of WORDS) if (t >= x[0]) w = x; else break;
  const cap = $('cap');
  const capOn = w && t < 43.4 && !(t >= 38.04 && t < 39.1);
  if (capOn) {
    cap.textContent = w[1]; cap.className = /[A-Za-z0-9]/.test(w[1]) ? 'latin' : '';
    const p = back(seg(t, w[0], w[0] + .14));
    cap.style.transform = `scale(${lerp(.6, 1, p)})`; cap.style.opacity = 1;
    cap.style.color = HIGHLIGHT.has(w[1]) ? '#ffd36b' : '#fff';
    cap.style.top = t >= 36.82 ? '1260px' : '1440px';
  } else cap.style.opacity = 0;
};
window.DUR = DUR;
document.fonts.ready.then(() => { window.renderAt(0); window.ready = true; });
