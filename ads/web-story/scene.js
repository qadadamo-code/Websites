// Planet "websites" story ad. render(t) draws the whole frame for time t (seconds).
const DUR = 48;
const NAVY = '#143659', MINT = '#92C5B4', CREAM = '#F6F1E7', RED = '#E5484D', GREEN = '#25D366', GOLD = '#F5B841';

// ---------- helpers ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const back = k => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const pop = (t, a, d = .35) => back(prog(t, a, a + d));
const win = (t, a, b, f = .3) => Math.min(eo(prog(t, a, a + f)), 1 - eio(prog(t, b - f, b)));
function keys(t, ks) { // [[t,v],...] linear between keys, eased
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) return lerp(ks[i - 1][1], ks[i][1], eio((t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0])));
  return ks[ks.length - 1][1];
}
function walk(t, ks) { // linear (no ease) for walking, returns [x, moving]
  if (t <= ks[0][0]) return [ks[0][1], false];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const k = (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]); return [lerp(ks[i - 1][1], ks[i][1], k), ks[i][1] !== ks[i - 1][1]]; }
  return [ks[ks.length - 1][1], false];
}
const mix = (c1, c2, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const a = p(c1), b = p(c2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join(''); };
const g = (attrs, inner) => `<g ${attrs}>${inner}</g>`;
const rect = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const circ = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const txt = (x, y, s, size, fill, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="middle" ${extra}>${s}</text>`;
const tr = (x, y, s = 1, r = 0) => `transform="translate(${x} ${y}) scale(${s}) rotate(${r})"`;
const fmt = n => Math.round(n).toLocaleString('en-US');

// ---------- caption words (VO timings) ----------
const W = [
  [0.00, 'فتحت'], [0.28, 'معرض'], [0.62, 'صغير'], [1.02, 'في'], [1.20, 'شارع'], [1.48, 'جانبي'],
  [1.88, 'أول'], [2.42, 'زبون'], [2.68, 'دخل'], [3.14, 'اتفرّج'], [3.80, 'اشترى'], [4.42, 'ومشي'], [4.82, 'مبسوط', MINT],
  [5.38, 'الناس'], [5.80, 'حبّت'], [6.14, 'الشغل'], [6.56, 'وبقوا'], [6.84, 'يسألوا'], [7.18, 'عليّا'],
  [7.66, 'فعملت'], [8.10, 'صفحة'], [8.46, 'على'], [8.58, 'فيسبوك', '#7FA8FF'],
  [9.10, 'والرسايل'], [9.62, 'كترت', GOLD], [10.04, 'السعر'], [10.58, 'كام؟'], [10.92, 'فين'], [11.26, 'العنوان؟'], [11.86, 'عندك'], [12.22, 'المقاس'], [12.62, 'ده؟'],
  [12.94, 'وبقيت'], [13.26, 'أرد'], [13.50, 'لحد'], [14.04, 'اتنين', GOLD], [14.32, 'بالليل'],
  [14.70, 'واللي'], [15.20, 'اتأخرت'], [15.78, 'عليه'], [16.08, 'راح'], [16.54, 'للمحل'], [16.88, 'اللي'], [17.08, 'جنبي', RED],
  [17.40, 'فبعت'], [18.00, 'للناس'], [18.28, 'كتالوج'], [18.58, 'PDF', RED], [19.04, 'محدش'], [19.62, 'فتحه'],
  [20.10, 'ولما'], [20.60, 'شركة'], [20.94, 'كبيرة'], [21.16, 'سألتني'], [21.74, 'عندكم'], [22.28, 'موقع'], [22.58, 'إلكتروني؟'], [23.22, 'اتكسفت', RED],
  [24.16, 'فعملت'], [24.82, 'موقع'], [25.14, 'إلكتروني'], [25.60, 'مع'], [25.72, 'Planet', MINT],
  [26.18, 'دلوقتي'], [26.76, 'الزبون'], [27.10, 'بيشوف'], [27.44, 'كل'], [27.64, 'المنتجات'], [28.24, 'والأسعار'], [28.70, 'لوحده'],
  [29.20, 'ويطلب'], [29.60, 'على'], [29.74, 'واتساب', GREEN], [30.12, 'بضغطة'],
  [30.66, 'وبيلاقيني'], [31.20, 'على'], [31.36, 'جوجل', GOLD], [31.72, 'وأنا'], [31.98, 'نايم'],
  [32.32, 'والطلبات'], [32.94, 'بقت'], [33.30, 'تيجي', MINT], [33.64, 'من'], [33.84, 'غير'], [34.10, 'ما'], [34.22, 'أرد'], [34.40, 'على'], [34.54, 'كل'], [34.76, 'رسالة'],
  [35.32, 'وعرض'], [35.74, '11.11', GOLD], [36.30, 'من'], [36.56, 'Planet', MINT],
  [37.04, 'موقعك'], [37.62, 'الإلكتروني'], [38.18, 'الكامل'],
  [38.64, '10,999', MINT], [40.06, 'جنيه'], [40.94, 'بدل'], [41.28, '12,500', RED],
  [42.14, 'لحد'], [42.92, '20'], [43.38, 'نوفمبر'], [43.90, 'بس!', GOLD],
  [44.24, 'كلّمنا'], [44.78, 'واتساب', GREEN], [45.16, 'دلوقتي'], [46.2, '']
];

// ---------- scene pieces ----------
function sky(t, night) {
  const top = mix('#9FD3EA', '#0B1730', night), bot = mix('#E8F5F8', '#22406E', night);
  let s = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient>
  <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter><filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0b1a33" flood-opacity=".28"/></filter></defs>`;
  s += rect(0, 0, 1080, 1920, 0, 'url(#sk)');
  // stars + moon
  if (night > 0) {
    let st = ''; for (let i = 0; i < 40; i++) { const x = (i * 263) % 1080, y = (i * 137) % 900 + 40; st += circ(x, y, 2 + (i % 3), '#fff', `opacity="${(.4 + .6 * Math.abs(Math.sin(t * 3 + i))) * night}"`); }
    s += st + circ(860, 260, 70, '#F4F1DE', `opacity="${night}"`) + circ(830, 240, 64, top, `opacity="${night}"`);
  }
  // sun
  s += circ(170, 250, 80, '#FFE08A', `opacity="${(1 - night) * .95}"`) + circ(170, 250, 130, '#FFE08A', `opacity="${(1 - night) * .25}"`);
  // clouds
  const cl = (x, y, k) => g(`opacity="${(1 - night * .7) * .95}" ${tr(x, y, k)}`, circ(0, 0, 40, '#fff') + circ(45, -15, 50, '#fff') + circ(95, 0, 38, '#fff') + rect(-40, 0, 175, 38, 19, '#fff'));
  s += cl(((t * 14) % 1400) - 200, 420, 1) + cl(((t * 9 + 700) % 1400) - 200, 300, .7) + cl(((t * 11 + 300) % 1400) - 200, 560, .55);
  return s;
}
function city(night) { // far skyline
  const c = mix('#C9DCE6', '#1A2F55', night), w = mix('#E3EEF3', '#F6D77A', night);
  let s = '';
  const b = [[-300, 260], [-180, 380], [-60, 300], [80, 420], [210, 330], [960, 360], [1090, 280], [1200, 420], [1330, 300]];
  b.forEach(([x, h], i) => { s += rect(x, 1350 - h, 120, h, 6, c); for (let r = 0; r < h / 60 - 1; r++) for (let q = 0; q < 3; q++) s += rect(x + 18 + q * 32, 1350 - h + 30 + r * 60, 18, 26, 3, w, `opacity="${.5 + .5 * night * ((i + r + q) % 2)}"`); });
  return s;
}
function road(t) {
  let s = rect(-600, 1350, 2400, 40, 0, '#D8CDB8') + rect(-600, 1390, 2400, 230, 0, '#3B4250');
  for (let i = -6; i < 16; i++) s += rect(i * 160 + 20, 1498, 90, 12, 6, '#F3E9D2', 'opacity=".8"');
  s += rect(-600, 1620, 2400, 400, 0, '#CDBF9F');
  for (let i = -6; i < 18; i++) s += rect(i * 130 + 40, 1660, 70, 10, 5, '#BCAD8B');
  return s;
}
function person(x, y, o) { // o: {shirt, skin, hair, moving, ph, s, bag, phone, suit, owner, flip, mood, glow}
  const s = o.s || 1, ph = o.ph || 0, sw = o.moving ? Math.sin(ph) * 22 : 0, bob = o.moving ? Math.abs(Math.sin(ph)) * 4 : 0;
  const pants = o.suit ? '#1d2a44' : (o.pants || '#2E3A55');
  let b = '';
  b += `<line x1="-10" y1="-62" x2="${-10 + sw * .6}" y2="-4" stroke="${pants}" stroke-width="15" stroke-linecap="round"/>`;
  b += `<line x1="10" y1="-62" x2="${10 - sw * .6}" y2="-4" stroke="${pants}" stroke-width="15" stroke-linecap="round"/>`;
  b += rect(-30, -132, 60, 78, 24, o.suit ? '#1d2a44' : o.shirt);
  if (o.suit) b += `<path d="M-10 -132 L0 -110 L10 -132 Z" fill="#fff"/><path d="M-4 -118 L4 -118 L6 -82 L0 -74 L-6 -82Z" fill="${RED}"/>`;
  if (o.owner) b += rect(-24, -112, 48, 58, 10, NAVY) + rect(-10, -100, 20, 4, 2, MINT);
  const arm = o.phone ? -40 : -sw;
  b += `<line x1="-26" y1="-120" x2="${-34 - arm * .3}" y2="-72" stroke="${o.suit ? '#1d2a44' : o.shirt}" stroke-width="14" stroke-linecap="round"/>`;
  b += `<line x1="26" y1="-120" x2="${o.phone ? 14 : 34 + sw * .3}" y2="${o.phone ? -110 : -72}" stroke="${o.suit ? '#1d2a44' : o.shirt}" stroke-width="14" stroke-linecap="round"/>`;
  if (o.bag) b += rect(30 + sw * .3, -82, 34, 38, 6, GOLD) + `<path d="M${38 + sw * .3} -82 q9 -16 18 0" stroke="#9a6a10" stroke-width="4" fill="none"/>`;
  if (o.phone) b += rect(4, -134, 18, 30, 4, '#111') + rect(6, -131, 14, 24, 2, o.glow ? '#BFE8FF' : '#5ad') + (o.glow ? circ(13, -118, 40, '#BFE8FF', 'opacity=".25"') : '');
  // head
  b += circ(0, -158, 26, o.skin || '#E8B98F');
  b += `<path d="M-26 -162 q2 -28 26 -28 q24 0 26 28 q-8 -12 -26 -12 q-18 0 -26 12z" fill="${o.hair || '#2b1d14'}"/>`;
  if (o.owner) b += `<path d="M-10 -146 q10 6 20 0" stroke="#2b1d14" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const m = o.mood || 'ok';
  b += circ(-9, -160, 3.2, '#1b1b1b') + circ(9, -160, 3.2, '#1b1b1b');
  if (m === 'happy') b += `<path d="M-8 -146 q8 8 16 0" stroke="#1b1b1b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if (m === 'sad') b += `<path d="M-7 -142 q7 -6 14 0" stroke="#1b1b1b" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if (m === 'blush') b += circ(-15, -150, 6, '#FF7A7A', 'opacity=".7"') + circ(15, -150, 6, '#FF7A7A', 'opacity=".7"') + `<path d="M-6 -144 l12 0" stroke="#1b1b1b" stroke-width="3" stroke-linecap="round"/>` + `<path d="M24 -178 q6 10 0 14 q-6 -4 0 -14z" fill="#7cc8ff"/>`;
  else if (m === 'sleep') b = b.replace(/<circle cx="-9"[^>]*\/><circle cx="9"[^>]*\/>/, '') + `<path d="M-13 -160 h8 M5 -160 h8" stroke="#1b1b1b" stroke-width="3"/>`;
  return g(`transform="translate(${x} ${y - bob}) scale(${o.flip ? -s : s} ${s})"`, b);
}
function heart(x, y, k, op) { return g(`${tr(x, y, k)} opacity="${op}"`, `<path d="M0 10 C-22 -6 -14 -24 0 -14 C14 -24 22 -6 0 10Z" fill="${RED}"/>`); }
function sofa(x, y, c) { return g(tr(x, y), rect(-80, -40, 160, 40, 12, c) + rect(-90, -62, 30, 62, 10, c) + rect(60, -62, 30, 62, 10, c) + rect(-60, -70, 120, 34, 10, mix(c, '#ffffff', .15)) + rect(-76, 0, 8, 12, 2, '#5b4636') + rect(68, 0, 8, 12, 2, '#5b4636')); }
function lamp(x, y) { return g(tr(x, y), rect(-3, -110, 6, 110, 3, '#3a3a3a') + `<path d="M-26 -110 L26 -110 L16 -148 L-16 -148Z" fill="${GOLD}"/>` + rect(-18, -4, 36, 6, 3, '#3a3a3a')); }

function shop(t, night) {
  const k = eo(prog(t, 0, .9)), wallH = 590 * k;
  let s = '';
  // building
  s += rect(230, 1350 - wallH, 620, wallH, 14, mix('#F6EBD9', '#8C8170', night * .6));
  s += rect(230, 1350 - wallH, 620, 30, 10, mix('#E7D6BC', '#6f6556', night * .6));
  if (k > .5) {
    const k2 = eo(prog(t, .35, 1.1));
    // upper floor window (owner's flat)
    s += rect(300, 820, 140, 110, 10, night > .3 ? '#F7D774' : '#BFE3F0', `opacity="${k2}"`) + rect(365, 820, 8, 110, 0, '#E7D6BC', `opacity="${k2}"`);
    s += rect(640, 820, 140, 110, 10, night > .3 ? '#2b3a5a' : '#BFE3F0', `opacity="${k2}"`) + rect(705, 820, 8, 110, 0, '#E7D6BC', `opacity="${k2}"`);
    // display window
    s += rect(262, 1010, 400, 300, 12, night > .3 ? mix('#FFF4CF', '#F7D774', .5) : '#D6EEF5', `opacity="${k2}"`);
    s += g(`opacity="${k2}"`, sofa(400, 1300, '#3E7C6C') + lamp(600, 1300) + rect(280, 1150, 0, 0, 0, '#000'));
    // door
    s += rect(690, 1080, 130, 270, 10, '#5b4636', `opacity="${k2}"`) + rect(706, 1100, 98, 120, 8, '#9FD3EA', `opacity="${k2 * .7}"`) + circ(800, 1230, 6, GOLD, `opacity="${k2}"`);
    // awning
    const aw = eo(prog(t, .6, 1.2));
    let st = ''; for (let i = 0; i < 10; i++) st += `<path d="M${240 + i * 60} 960 h60 v${46 * aw} q-30 22 -60 0z" fill="${i % 2 ? '#fff' : NAVY}"/>`;
    s += st;
    // sign
    const sg = pop(t, .9, .45);
    s += g(`transform="translate(540 760) scale(${sg})"`, rect(-170, -50, 340, 96, 18, NAVY, 'filter="url(#sh)"') + txt(0, 22, 'معرضي', 58, '#fff') + circ(150, -32, 9, MINT));
    // www badge after website
    const wb = pop(t, 25.0, .5);
    if (t > 25) s += g(`transform="translate(800 712) scale(${wb})"`, rect(-80, -30, 160, 60, 30, MINT, 'filter="url(#sh)"') + txt(0, 14, '.com', 38, NAVY));
    // night shutter (S12 only)
    const sh = win(t, 30.7, 32.3, .25);
    if (sh > 0) { let r = ''; for (let i = 0; i < 12; i++) r += rect(262, 1010 + i * 25, 400, 22, 2, '#9aa3ad'); s += `<clipPath id="shc"><rect x="262" y="1010" width="400" height="${300 * sh}"/></clipPath>` + g(`clip-path="url(#shc)"`, r); }
  }
  return s;
}
function neighbor(t, night) {
  let s = rect(880, 1000, 340, 350, 12, mix('#E9C7A1', '#7a6450', night * .6));
  s += rect(910, 1100, 170, 200, 8, night > .3 ? '#F2C76B' : '#F5E6C8') + rect(1100, 1150, 90, 200, 6, '#6b4a33');
  s += rect(895, 1020, 310, 64, 12, '#C2410C') + txt(1050, 1064, 'المحل اللي جنبي', 34, '#fff');
  return s;
}

// HUD scoreboard (top)
function hud(t, cells, op) {
  if (op <= 0) return '';
  const n = cells.length, w = 400 * n - 20 * (n - 1) + 40, x0 = 540 - w / 2;
  let s = rect(x0, 60, w, 210, 28, '#0F2341', 'filter="url(#sh)"') + rect(x0 + 10, 70, w - 20, 190, 22, '#13305A');
  cells.forEach((c, i) => {
    const cx = x0 + 20 + i * 380 + 180;
    s += txt(cx, 122, c.label, 34, '#C9D8EA', 'font-weight="500"');
    s += txt(cx, 226, c.value, 92, c.color || MINT, 'class="cap"');
  });
  return g(`opacity="${op}" transform="translate(540 165) scale(${.85 + .15 * op}) translate(-540 -165)"`, s);
}

// phone mockup (screen coords). content: fn(w,h) returning svg in phone-screen coords
function phone(yTop, content) {
  const W2 = 500, H2 = 980, x = 540 - W2 / 2;
  let s = rect(x - 14, yTop - 14, W2 + 28, H2 + 28, 64, '#0d0f14', 'filter="url(#sh)"');
  s += `<clipPath id="pc"><rect x="${x}" y="${yTop}" width="${W2}" height="${H2}" rx="52"/></clipPath>`;
  s += g(`clip-path="url(#pc)"`, rect(x, yTop, W2, H2, 52, '#fff') + g(`transform="translate(${x} ${yTop})"`, content(W2, H2)));
  s += rect(540 - 70, yTop + 14, 140, 34, 17, '#0d0f14');
  return s;
}
function bubble(x, y, w, s, mine, k) {
  return g(`transform="translate(${x} ${y}) scale(${k})" opacity="${clamp(k)}"`,
    (mine ? '' : circ(-34, 22, 22, '#cfd8e3') + circ(-34, 16, 9, '#fff')) + rect(0, 0, w, 56, 22, mine ? '#DCF8C6' : '#EEF1F5') + `<text x="${w - 20}" y="37" font-size="27" fill="#1d2433" text-anchor="end" font-weight="500">${s}</text>`);
}
const MSGS = ['السعر كام؟', 'فين العنوان؟', 'عندك المقاس ده؟', 'متاح؟', 'بكام ده؟', 'السعر؟؟', 'فيه توصيل؟', 'ردّ لو سمحت', 'بكام الطقم؟', 'السعر كام؟', 'مكانكم فين؟', 'ألو؟'];
function inboxScreen(t) {
  return (w, h) => {
    let s = '';
    const n = Math.floor(prog(t, 9.2, 12.9) * 26);
    const scroll = Math.max(0, n - 9) * 84;
    let list = '';
    for (let i = 0; i <= Math.min(n, 25); i++) {
      const k = pop(t, 9.2 + i * (3.7 / 26), .25);
      list += bubble(70, 180 + i * 84 - scroll, 300 + (i * 37 % 90), MSGS[i % MSGS.length], false, k);
    }
    s += `<clipPath id="ib"><rect x="0" y="150" width="${w}" height="${h}"/></clipPath>` + g(`clip-path="url(#ib)"`, list);
    s += rect(0, 0, w, 150, 0, '#3D6FD6') + txt(w / 2, 102, 'صفحة المعرض', 34, '#fff') + circ(60, 92, 26, '#fff') + txt(60, 102, 'م', 26, '#3D6FD6');
    // unread badge
    const cnt = 12 + n * 4;
    s += circ(w - 60, 92, 30, RED) + txt(w - 60, 103, cnt > 99 ? '99+' : cnt, 26, '#fff');
    return s;
  };
}
function pdfScreen(t) {
  return (w, h) => {
    let s = rect(0, 0, w, 150, 0, '#3D6FD6') + txt(w / 2, 102, 'رسايل', 34, '#fff');
    for (let i = 0; i < 3; i++) {
      const y = 200 + i * 250, k = pop(t, 17.6 + i * .35, .35);
      s += g(`transform="translate(${w - 40} ${y}) scale(${k})"`, rect(-380, 0, 380, 200, 24, '#DCF8C6') + rect(-360, 20, 110, 140, 10, '#fff', 'stroke="#ddd"') + rect(-345, 40, 80, 10, 4, '#ccc', 'filter="url(#blur6)"') + rect(-345, 64, 70, 10, 4, '#ccc', 'filter="url(#blur6)"') + rect(-345, 88, 80, 10, 4, '#ccc', 'filter="url(#blur6)"') + rect(-360, 120, 60, 34, 6, RED) + `<text x="-330" y="146" font-size="22" fill="#fff" text-anchor="middle">PDF</text>` +
        `<text x="-30" y="70" font-size="28" fill="#1d2433" text-anchor="end">كتالوج.pdf</text><text x="-30" y="112" font-size="22" fill="#6b7480" text-anchor="end" font-weight="500">24 MB</text>` + `<text x="-30" y="176" font-size="24" fill="#9aa3ad" text-anchor="end" font-weight="500">لم يُفتح ✓</text>`);
    }
    const z = pop(t, 19.3, .4);
    s += g(`transform="translate(${w / 2} 880) scale(${z})"`, rect(-170, -60, 340, 110, 55, RED) + txt(0, 14, 'فتحوه: 0', 44, '#fff', 'class="cap"'));
    return s;
  };
}
function siteScreen(t) {
  return (w, h) => {
    const sc = keys(t, [[26.4, 0], [27.6, 0], [28.6, 520], [29.3, 520]]);
    let s = g(`transform="translate(0 ${-sc})"`, (() => {
      let p = rect(0, 0, w, 130, 0, NAVY) + txt(w - 90, 90, 'معرضي', 34, '#fff') + rect(30, 62, 40, 6, 3, '#fff') + rect(30, 76, 40, 6, 3, '#fff') + rect(30, 90, 40, 6, 3, '#fff');
      p += rect(0, 130, w, 330, 0, '#E5F1EC') + sofa(w / 2, 400, '#3E7C6C') + lamp(w / 2 + 140, 400) + txt(w / 2, 220, 'أثاث يليق ببيتك', 40, NAVY);
      const prods = [['كنبة مودرن', '8,900'], ['فوتيه', '3,450'], ['ترابيزة', '2,200'], ['أباجورة', '1,150'], ['سرير', '12,800'], ['دولاب', '9,600']];
      prods.forEach(([n, pr], i) => {
        const cx = 30 + (i % 2) * 230, cy = 490 + Math.floor(i / 2) * 270;
        p += rect(cx, cy, 210, 250, 18, '#F4F6F8') + rect(cx + 15, cy + 15, 180, 130, 12, ['#D9EAF2', '#F3E3D3', '#E3EFE6'][i % 3]) + (i % 2 ? lamp(cx + 105, cy + 140) : sofa(cx + 105, cy + 130, ['#C2410C', '#3E7C6C', NAVY][i % 3]));
        p += `<text x="${cx + 195}" y="${cy + 188}" font-size="26" fill="#1d2433" text-anchor="end">${n}</text><text x="${cx + 195}" y="${cy + 228}" font-size="26" fill="${MINT}" text-anchor="end" stroke="#3E7C6C" stroke-width=".6">${pr} ج.م</text>`;
      });
      return p;
    })());
    // sticky whatsapp button
    const bk = pop(t, 29.1, .35), tap = prog(t, 30.0, 30.4);
    s += g(`transform="translate(${w / 2} ${h - 90}) scale(${bk * (1 - .08 * Math.sin(tap * Math.PI))})"`, rect(-200, -46, 400, 92, 46, GREEN, 'filter="url(#sh)"') + txt(20, 14, 'اطلب على واتساب', 34, '#fff') + circ(-150, 0, 24, '#fff') + circ(-150, 0, 16, GREEN) + circ(-150, 0, 9, '#fff'));
    if (tap > 0) s += circ(w / 2 + 60, h - 90, 30 + 120 * tap, '#fff', `opacity="${.6 * (1 - tap)}"`);
    // finger
    const fk = prog(t, 29.5, 30.0);
    if (t > 29.5) s += g(`transform="translate(${w / 2 + 60 + 120 * (1 - eo(fk))} ${h - 70 + 160 * (1 - eo(fk))})"`, `<path d="M0 0 q-10 -40 6 -42 q14 0 14 30 l0 6 q30 -6 34 14 l4 60 l-60 10 q-24 -30 -30 -50 q0 -14 16 -8z" fill="#E8B98F" stroke="#b98a62" stroke-width="3"/>`);
    // toast
    const to = pop(t, 30.35, .3);
    if (t > 30.35) s += g(`transform="translate(${w / 2} 200) scale(${to})"`, rect(-210, -50, 420, 100, 24, '#0f2341', 'filter="url(#sh)"') + circ(-160, 0, 26, GREEN) + `<path d="M-172 0 l9 10 l18 -20" stroke="#fff" stroke-width="6" fill="none"/>` + txt(30, 13, 'طلب جديد وصل!', 34, '#fff'));
    return s;
  };
}

// website build (sky, S9)
function siteBuild(t) {
  const op = win(t, 24.2, 26.6, .3);
  if (op <= 0) return '';
  const x = 110, y = 170, w = 860, h = 600;
  const st = i => eo(prog(t, 24.4 + i * .22, 24.4 + i * .22 + .35));
  let s = rect(x, y, w, h, 26, '#fff', 'filter="url(#sh)"') + rect(x, y, w, 60, 26, '#E9EDF2') + rect(x, y + 34, w, 26, 0, '#E9EDF2');
  s += circ(x + 36, y + 30, 9, '#FF5F57') + circ(x + 64, y + 30, 9, '#FEBC2E') + circ(x + 92, y + 30, 9, '#28C840') + rect(x + 140, y + 14, 580, 34, 17, '#fff') + `<text x="${x + 430}" y="${y + 40}" font-size="22" fill="#5b6575" text-anchor="middle" font-weight="500">www.maarady.com</text>`;
  s += g(`opacity="${st(0)}" transform="translate(0 ${(1 - st(0)) * -30})"`, rect(x + 20, y + 80, w - 40, 70, 14, NAVY) + `<text x="${x + w - 50}" y="${y + 126}" font-size="30" fill="#fff" text-anchor="end">معرضي</text>` + `<text x="${x + 60}" y="${y + 124}" font-size="22" fill="${MINT}" font-weight="500">الرئيسية · المنتجات · تواصل</text>`);
  s += g(`opacity="${st(1)}" transform="translate(0 ${(1 - st(1)) * 40})"`, rect(x + 20, y + 165, w - 40, 190, 14, '#E5F1EC') + sofa(x + 250, y + 335, '#3E7C6C') + lamp(x + 380, y + 340) + `<text x="${x + w - 50}" y="${y + 240}" font-size="40" fill="${NAVY}" text-anchor="end">أثاث يليق ببيتك</text>` + rect(x + w - 260, y + 270, 210, 54, 27, GREEN) + `<text x="${x + w - 155}" y="${y + 306}" font-size="24" fill="#fff" text-anchor="middle">اطلب واتساب</text>`);
  for (let i = 0; i < 4; i++) { const k = st(2 + i); s += g(`opacity="${k}" transform="translate(${x + 20 + i * 207} ${y + 375 + (1 - k) * 50})"`, rect(0, 0, 193, 200, 14, '#F4F6F8') + rect(12, 12, 169, 100, 10, ['#D9EAF2', '#F3E3D3', '#E3EFE6', '#EDE4F5'][i]) + rect(60, 130, 120, 16, 8, '#cfd6de') + rect(100, 160, 80, 18, 9, MINT)); }
  // Planet stamp
  const pk = pop(t, 25.6, .45);
  if (t > 25.6) s += g(`transform="translate(${x + 80} ${y + h - 10}) scale(${pk}) rotate(-8)"`, rect(-90, -40, 220, 80, 40, NAVY, 'filter="url(#sh)"') + `<image href="mark-light.png" x="-78" y="-30" width="60" height="60"/>` + `<text x="40" y="12" font-size="34" fill="#fff" text-anchor="middle">Planet</text>`);
  return g(`opacity="${op}" transform="translate(540 470) scale(${.7 + .3 * eo(prog(t, 24.2, 24.6))}) translate(-540 -470)"`, s);
}
// search card (S12)
function searchCard(t) {
  const op = win(t, 30.75, 32.4, .25);
  if (op <= 0) return '';
  const q = 'معرض أثاث قريب مني', n = Math.floor(prog(t, 30.9, 31.5) * q.length);
  let s = rect(110, 190, 860, 520, 30, '#fff', 'filter="url(#sh)"');
  s += rect(150, 230, 780, 84, 42, '#F1F3F6') + circ(220, 272, 18, 'none', `stroke="${NAVY}" stroke-width="6"`) + `<line x1="233" y1="285" x2="250" y2="302" stroke="${NAVY}" stroke-width="6" stroke-linecap="round"/>` + `<text x="890" y="285" font-size="34" fill="#1d2433" text-anchor="end" font-weight="500">${q.slice(0, n)}${Math.floor(t * 4) % 2 ? '|' : ''}</text>`;
  const r1 = eo(prog(t, 31.5, 31.85));
  s += g(`opacity="${r1}" transform="translate(0 ${(1 - r1) * 30})"`, rect(150, 345, 780, 190, 22, '#EAF6F1', `stroke="${MINT}" stroke-width="4"`) + `<text x="890" y="405" font-size="40" fill="${NAVY}" text-anchor="end">معرضي — الموقع الرسمي</text><text x="890" y="450" font-size="26" fill="#1a7f4f" text-anchor="end" font-weight="500">www.maarady.com</text><text x="890" y="505" font-size="32" fill="${GOLD}" text-anchor="end">★★★★★ <tspan fill="#1d2433">4.9</tspan></text>` + rect(175, 370, 90, 56, 28, NAVY) + txt(220, 408, '#1', 32, '#fff'));
  s += g(`opacity="${r1 * .5}"`, rect(150, 560, 780, 50, 14, '#F1F3F6') + rect(150, 630, 600, 50, 14, '#F1F3F6'));
  return g(`opacity="${op}" transform="translate(540 40) scale(.85) translate(-540 -150)"`, s);
}
function nightToasts(t) {
  let s = '';
  for (let i = 0; i < 3; i++) { const a = 31.4 + i * .3, k = pop(t, a, .3) * win(t, a, 32.4, .2); if (k <= 0) continue; s += g(`transform="translate(${[250, 820, 560][i]} ${[790, 760, 900][i]}) scale(${k})"`, rect(-130, -40, 260, 80, 22, '#0f2341', 'filter="url(#sh)"') + circ(-88, 0, 22, GREEN) + `<path d="M-98 0 l7 8 l14 -16" stroke="#fff" stroke-width="5" fill="none"/>` + txt(25, 11, 'طلب جديد', 30, '#fff')); }
  return s;
}
function zzz(t) { if (t < 30.7 || t > 32.4) return ''; let s = ''; for (let i = 0; i < 3; i++) { const k = ((t * .9 + i / 3) % 1); s += txt(440 + k * 60 + i * 10, 820 - k * 120, 'Z', 40 + i * 10, '#fff', `opacity="${1 - k}"`); } return s; }

// offer panel (S14)
function offer(t) {
  const op = win(t, 35.3, 44.3, .35);
  if (op <= 0) return '';
  const k = eo(prog(t, 35.3, 35.75));
  let s = rect(70, 130, 940, 1080, 44, NAVY, 'filter="url(#sh)"');
  // confetti dots
  for (let i = 0; i < 26; i++) s += circ(110 + (i * 97) % 860, 170 + (i * 173) % 1000, 5 + (i % 4) * 3, [MINT, GOLD, '#fff'][i % 3], `opacity="${.25 + .2 * Math.sin(t * 4 + i)}"`);
  s += g(`transform="translate(540 330) scale(${pop(t, 35.6, .45)})"`, rect(-220, -110, 440, 200, 40, GOLD) + `<text x="0" y="50" font-size="150" fill="${NAVY}" text-anchor="middle" class="cap">11.11</text>`);
  s += txt(540, 520, 'عرض', 44, MINT) ;
  const mk = eo(prog(t, 37.0, 37.5));
  s += g(`opacity="${mk}"`, txt(540, 610, 'موقعك الإلكتروني الكامل', 62, '#fff'));
  // old price
  const ok = eo(prog(t, 38.3, 38.7)), strike = eo(prog(t, 41.25, 41.6));
  s += g(`opacity="${ok}"`, txt(540, 720, '12,500 ج.م', 64, '#9FB3C8') + (strike > 0 ? `<line x1="390" y1="702" x2="${390 + 300 * strike}" y2="${702 - 8 * strike}" stroke="${RED}" stroke-width="10" stroke-linecap="round"/>` : ''));
  // new price
  const nk = pop(t, 38.64, .5);
  s += g(`transform="translate(540 900) scale(${nk})"`, `<text x="0" y="0" font-size="200" fill="${MINT}" text-anchor="middle" class="cap">10,999</text>` + txt(0, 80, 'جنيه بس', 52, '#fff'));
  // until chip
  const ck = pop(t, 42.6, .4);
  s += g(`transform="translate(540 1110) scale(${ck})"`, rect(-210, -50, 420, 96, 48, RED) + txt(0, 16, 'لغاية 20/11', 46, '#fff'));
  return g(`opacity="${op}" transform="translate(540 90) scale(${(.8 + .2 * k) * .8}) translate(-540 -130)"`, s);
}
// end card
function endCard(t) {
  const op = eo(prog(t, 44.1, 44.5));
  if (op <= 0) return '';
  let s = rect(0, 0, 1080, 1920, 0, NAVY);
  for (let i = 0; i < 4; i++) s += circ(540, 700, 260 + i * 140 + (t * 40) % 140, 'none', `stroke="${MINT}" stroke-width="2" opacity="${.18 - i * .04}"`);
  const lk = pop(t, 44.3, .55);
  s += g(`transform="translate(540 640) scale(${lk})"`, `<image href="mark-light.png" x="-150" y="-150" width="300" height="300"/>`);
  s += g(`opacity="${eo(prog(t, 44.6, 45))}"`, `<text x="540" y="900" font-size="110" fill="#fff" text-anchor="middle" letter-spacing="8">Planet</text>` + txt(540, 980, 'مواقع إلكترونية بتبيع وانت نايم', 44, MINT, 'font-weight="500"'));
  const wk = pop(t, 45.0, .45);
  s += g(`transform="translate(540 1130) scale(${wk})"`, rect(-330, -62, 660, 124, 62, GREEN, 'filter="url(#sh)"') + circ(-250, 0, 36, '#fff') + circ(-250, 0, 26, GREEN) + `<path d="M-262 -8 q12 24 26 18" stroke="#fff" stroke-width="6" fill="none"/>` + `<text x="40" y="20" font-size="60" fill="#fff" text-anchor="middle" letter-spacing="2">01203101104</text>`);
  s += g(`opacity="${eo(prog(t, 45.4, 45.8))}"`, txt(540, 1280, 'www.theplanetco.com', 40, '#C9D8EA', 'font-weight="500"') + rect(390, 1330, 300, 70, 35, GOLD) + txt(540, 1378, 'عرض 11.11', 38, NAVY));
  // pulsing tap hint on button
  const pl = (t * 1.2) % 1;
  if (t > 45.6) s += rect(540 - 330 - pl * 40, 1130 - 62 - pl * 20, 660 + pl * 80, 124 + pl * 40, 82, 'none', `stroke="${GREEN}" stroke-width="5" opacity="${1 - pl}"`);
  return g(`opacity="${op}"`, s);
}
// caption
function caption(t, y) {
  let i = -1; for (let j = 0; j < W.length; j++) if (t >= W[j][0]) i = j;
  if (i < 0 || !W[i][1]) return '';
  const [st, w, col] = W[i];
  const k = back(prog(t, st, st + .16)), sc = .6 + .4 * k;
  const big = /[0-9]/.test(w) ? 150 : 118;
  return g(`transform="translate(540 ${y}) scale(${sc})"`,
    `<text x="0" y="0" font-size="${big}" class="cap" text-anchor="middle" fill="none" stroke="#0b1a33" stroke-width="22" stroke-linejoin="round" opacity=".55">${w}</text>` +
    `<text x="0" y="0" font-size="${big}" class="cap" text-anchor="middle" fill="${col || '#fff'}" stroke="#0b1a33" stroke-width="8" stroke-linejoin="round" paint-order="stroke">${w}</text>`);
}

// ---------- people choreography ----------
const SHIRTS = ['#E76F51', '#2A9D8F', '#8E7DBE', '#F4A261', '#457B9D', '#E9C46A', '#D16BA5', '#6A994E'];
const SKINS = ['#E8B98F', '#C98E62', '#F1C9A5', '#A86F48', '#DDA77B'];
function crowd(t) {
  let s = '';
  // S2 first customer
  {
    const [x, mv] = walk(t, [[1.9, -120], [2.9, 755], [3.8, 755], [5.3, 1300]]);
    const inside = t > 2.95 && t < 3.75;
    if (t > 1.9 && t < 5.4 && !inside) s += person(x, 1350, { shirt: SHIRTS[0], skin: SKINS[1], moving: mv, ph: x * .09, bag: t > 3.75, mood: t > 3.75 ? 'happy' : 'ok', flip: false });
  }
  // S3..S6 crowd: arrive 5.4-7.4 then stand; S6 leave to neighbor one by one; S13 come back
  for (let i = 0; i < 7; i++) {
    const home = 200 + i * 85, nb = 960 + (i % 4) * 55;
    const arr = 5.4 + i * .25, leave = 15.0 + i * .33, back2 = 32.5 + i * .3;
    const ks = [[arr, -140 - i * 30], [arr + 1.3, home], [leave, home], [leave + 1.1, nb], [17.35, nb]];
    if (t < 17.4) {
      if (t > arr) { const [x, mv] = walk(t, ks); const happy = t < 9 ; s += person(x, 1350, { shirt: SHIRTS[(i + 1) % 8], skin: SKINS[i % 5], moving: mv, ph: x * .09 + i, s: .92, phone: t > 9.1 && t < leave && !mv, glow: false, mood: t > 12.9 ? 'sad' : (happy ? 'happy' : 'ok'), flip: false });
        if (t > 5.6 && t < 7.9) { const hk = ((t - arr) * .9) % 1; s += heart(home + 10, 1150 - hk * 120, 1.2, (1 - hk) * win(t, arr + 1.2, 7.9, .2)); } }
    } else if (t > 32.3 && t < 35.4) {
      const [x, mv] = walk(t, [[back2, nb], [back2 + 1.2, home - 40]]);
      s += person(x, 1350, { shirt: SHIRTS[(i + 1) % 8], skin: SKINS[i % 5], moving: mv, ph: x * .09 + i, s: .92, mood: 'happy', flip: true });
    } else if (t >= 35.4 && t < 44.3) {
      const jump = Math.max(0, Math.sin(t * 7 + i)) * 26;
      s += person(home - 40, 1350 - jump, { shirt: SHIRTS[(i + 1) % 8], skin: SKINS[i % 5], s: .92, mood: 'happy' });
    }
  }
  return s;
}
function owner(t, night) {
  // inside window by default; outside door during S8; sleeping upstairs S12
  if (t > 30.7 && t < 32.35) return rect(305, 900, 130, 24, 8, '#fff') + rect(305, 906, 130, 24, 8, '#E9D9C0') + g(tr(445, 902, .62, -90), person(0, 0, { shirt: MINT, skin: SKINS[0], owner: true, mood: 'sleep' }));
  if (t > 20.0 && t < 24.2) return person(620, 1350, { shirt: MINT, skin: SKINS[0], owner: true, mood: t > 23.2 ? 'blush' : 'ok', flip: true });
  const busy = t > 9.1 && t < 17.4;
  const mood = t < 9.1 ? 'happy' : (t < 17.4 ? (t > 12.9 ? 'sad' : 'ok') : (t > 26 ? 'happy' : 'ok'));
  return person(310, 1300, { shirt: MINT, skin: SKINS[0], owner: true, phone: busy || (t > 17.4 && t < 20), glow: night > .3, mood, s: .95 });
}
function suit(t) {
  if (t < 20.1 || t > 24.3) return '';
  const [x, mv] = walk(t, [[20.1, -120], [20.9, 470]]);
  let s = person(x, 1350, { suit: true, skin: SKINS[3], hair: '#555', moving: mv, ph: x * .09, s: 1.05 });
  s += g(`transform="translate(440 1110) scale(${pop(t, 21.7, .35) * (1 - prog(t, 24.0, 24.2))})"`, rect(-150, -110, 300, 100, 30, '#fff', 'filter="url(#sh)"') + `<path d="M-10 -12 l20 0 l-20 30z" fill="#fff"/>` + txt(0, -48, 'عندكم موقع؟', 40, NAVY));
  // building of the company behind? small briefcase
  s += rect(x + 30, 1270, 46, 36, 6, '#5b4636');
  return s;
}

// ---------- master ----------
function render(t) {
  const night = Math.max(win(t, 12.9, 17.4, .6), win(t, 30.66, 32.35, .25));
  // camera
  const zo = Math.max(win(t, 14.2, 17.5, .6), win(t, 32.3, 35.4, .5));
  const s = lerp(1.45, .95, zo), px = lerp(0, -170, zo);
  const shake = (t > 23.2 && t < 23.6) ? Math.sin(t * 90) * 6 : 0;
  let out = sky(t, night);
  out += `<g transform="translate(${540 + px + shake} 1350) scale(${s}) translate(-540 -1350)">`;
  out += city(night) + road(t) + (zo > 0 ? g(`opacity="${zo}"`, neighbor(t, night)) : '') + shop(t, night) + owner(t, night) + crowd(t) + suit(t) + zzz(t);
  out += `</g>`;
  // flash at website moment
  const fl = 1 - prog(t, 24.16, 24.5);
  // HUD
  const h1 = win(t, 9.3, 12.95, .25), h2 = win(t, 12.95, 17.4, .25), h3 = win(t, 32.4, 35.3, .3);
  if (h1 > 0) out += hud(t, [{ label: 'رسايل مستنية رد', value: fmt(12 + prog(t, 9.3, 12.9) * 106), color: GOLD }], h1);
  if (h2 > 0) { const hr = keys(t, [[12.95, 22], [14.2, 26]]); const hh = Math.floor(hr) % 24, mm = Math.floor((hr % 1) * 60); out += hud(t, [{ label: 'الساعة', value: `${String(hh % 12 || 12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, color: '#fff' }, { label: 'زباين راحوا لغيري', value: Math.min(7, Math.max(0, Math.floor((t - 15.3) / .33) + 1)), color: RED }], h2); }
  if (h3 > 0) out += hud(t, [{ label: 'طلبات النهارده', value: fmt(keys(t, [[32.4, 3], [35.0, 48]])), color: MINT }, { label: 'رسايل مستنية', value: 0, color: '#fff' }], h3);
  out += siteBuild(t) + searchCard(t) + nightToasts(t);
  // phone
  const pv = Math.max(win(t, 7.7, 12.95, .4), win(t, 17.45, 20.1, .35), win(t, 26.2, 30.66, .35));
  let capY = 1505;
  if (pv > 0) {
    const yTop = lerp(1960, 900, eo(pv));
    const scr = t < 13 ? inboxScreen(t) : (t < 21 ? pdfScreen(t) : siteScreen(t));
    out += phone(yTop, scr);
    capY = lerp(1505, 400, eo(pv));
  }
  out += offer(t);
  if (fl > 0 && t > 24.16) out += rect(0, 0, 1080, 1920, 0, '#fff', `opacity="${fl}"`);
  out += endCard(t);
  if (t > 35.3 && t < 44.2) capY = 1505;
  if (t >= 44.2) capY = 1560;
  out += caption(t, capY);
  document.getElementById('s').innerHTML = out;
}
window.render = render; window.DUR = DUR;
const q = new URLSearchParams(location.search); render(parseFloat(q.get('t') || '0'));
