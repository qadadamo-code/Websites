/* Ciao 7 — hand-built SVG illustrations for every menu item.
   Each item gets its own drawing from its data (toppings, sauce, filling, drink colour). */
(function () {
  // small seeded random so the same item always looks the same
  function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  const F = n => Math.round(n * 10) / 10;

  const TOP = {
    pepperoni: (x, y, r, R) => `<g transform="translate(${x} ${y})"><circle r="9.5" fill="#b3261e"/><circle r="9.5" fill="none" stroke="#7d1510" stroke-width="1.4"/><circle cx="-3" cy="-2" r="1.3" fill="#7d1510"/><circle cx="3" cy="2.5" r="1.1" fill="#7d1510"/><circle cx="2" cy="-4" r=".9" fill="#7d1510"/></g>`,
    mushroom: (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-8 1 Q0 -11 8 1 Z" fill="#e6d6b8" stroke="#a88c63" stroke-width="1"/><rect x="-2.6" y="0" width="5.2" height="6" rx="1.5" fill="#d8c4a0" stroke="#a88c63" stroke-width="1"/></g>`,
    olive: (x, y) => `<circle cx="${x}" cy="${y}" r="4.6" fill="none" stroke="#1d1a17" stroke-width="3"/>`,
    pepper: (x, y, r, R) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-7 0 Q0 -8 7 0" fill="none" stroke="${['#3f8a2e', '#d23a22', '#f2b51d'][Math.floor(R * 3)]}" stroke-width="3.4" stroke-linecap="round"/>`,
    onion: (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-8 2 Q0 -7 8 2" fill="none" stroke="#c48bd0" stroke-width="2.2" stroke-linecap="round"/>`,
    tomato: (x, y) => `<g transform="translate(${x} ${y})"><circle r="7.5" fill="#e2412b"/><circle r="4.5" fill="#f06a4f"/><circle cx="-1.5" cy="-1" r="1" fill="#f6d34f"/><circle cx="1.6" cy="1.2" r="1" fill="#f6d34f"/></g>`,
    basil: (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 -9 C7 -4 7 5 0 9 C-7 5 -7 -4 0 -9Z" fill="#2f7d32" stroke="#1f5a22" stroke-width=".8"/>`,
    beef: (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-4 -3 L2 -5 L5 0 L2 4 L-4 3 Z" fill="#6b3a22"/>`,
    sausage: (x, y) => `<g transform="translate(${x} ${y})"><circle r="6.5" fill="#8c3b26"/><circle r="6.5" fill="none" stroke="#5f2516" stroke-width="1.2"/><circle cx="-2" cy="-1" r="1" fill="#c56a4a"/></g>`,
    chicken: (x, y, r) => `<rect transform="translate(${x} ${y}) rotate(${r})" x="-6" y="-4" width="12" height="8" rx="3" fill="#e3b77a" stroke="#b9874a" stroke-width="1"/>`,
    tuna: (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-5 -2 Q0 -6 5 -2 Q3 4 -4 3Z" fill="#d9a189"/>`,
    corn: (x, y) => `<circle cx="${x}" cy="${y}" r="3.3" fill="#f6c31b" stroke="#d49b10" stroke-width=".8"/>`,
    jalapeno: (x, y) => `<g transform="translate(${x} ${y})"><circle r="5.5" fill="none" stroke="#4f9b2f" stroke-width="2.6"/><circle r="1" fill="#e9f0c9"/></g>`,
    chili: (x, y, r) => `<rect transform="translate(${x} ${y}) rotate(${r})" x="-2" y="-1" width="4" height="2" fill="#e02b16"/>`,
    shrimp: (x, y, r) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-6 3 A6.5 6.5 0 1 1 5 4" fill="none" stroke="#f08a5d" stroke-width="4.2" stroke-linecap="round"/>`,
    calamari: (x, y) => `<circle cx="${x}" cy="${y}" r="5.6" fill="none" stroke="#f3e5c6" stroke-width="2.8"/>`,
    truffle: (x, y) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#2b1d16"/>`,
    strawberry: (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 7 C-8 1 -6 -6 0 -4 C6 -6 8 1 0 7Z" fill="#e2394f"/><circle cx="-2" cy="0" r=".7" fill="#f8e08e"/><circle cx="2" cy="1" r=".7" fill="#f8e08e"/></g>`,
    sugar: (x, y) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fffaf0"/>`,
    crumbs: (x, y, r) => `<rect transform="translate(${x} ${y}) rotate(${r})" x="-2.5" y="-2.5" width="5" height="5" fill="#a96c32"/>`,
    mozz: (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff4d6" opacity=".9"/>`,
    cheddar: (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="#f2a53a" opacity=".85"/>`
  };
  const DRIZZLE = { bbq: '#5a2a14', ranch: '#fff8e8', caramel: '#c9822b' };
  const COUNT = { truffle: 14, chili: 10, sugar: 26, crumbs: 12, corn: 9, basil: 4, mozz: 6, cheddar: 5, beef: 9 };

  function zigzag(color, R) {
    let d = 'M-60 -40', y = -40;
    for (let i = 0; i < 7; i++) { y += 13; d += ` L${i % 2 ? -55 : 55} ${y}`; }
    return `<path d="${d}" transform="rotate(${F(R() * 60 - 30)})" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  }

  function pizzaBody(it, R) {
    const sauce = it.nutella ? '#4a2412' : it.lotus ? '#b8742f' : it.white ? '#f1e2bf' : '#c8361d';
    let s = `<circle r="96" fill="#d9893b"/><circle r="96" fill="url(#crustG)"/><circle r="84" fill="${sauce}"/>`;
    if (!it.nutella && !it.lotus) {
      for (let i = 0; i < 11; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * 68; s += `<circle cx="${F(Math.cos(a) * d)}" cy="${F(Math.sin(a) * d)}" r="${F(12 + R() * 14)}" fill="#f7d37a" opacity=".92"/>`; }
      s += `<circle r="84" fill="url(#cheeseG)"/>`;
    } else {
      for (let i = 0; i < 6; i++) { const a = R() * 6.28, d = Math.sqrt(R()) * 60; s += `<circle cx="${F(Math.cos(a) * d)}" cy="${F(Math.sin(a) * d)}" r="${F(8 + R() * 10)}" fill="${it.nutella ? '#5d2f17' : '#c88443'}"/>`; }
    }
    const tops = it.t || [];
    tops.forEach(t => {
      if (DRIZZLE[t]) { s += zigzag(DRIZZLE[t], R); return; }
      const fn = TOP[t]; if (!fn) return;
      const n = COUNT[t] || Math.max(4, Math.round(16 / Math.max(1, tops.length) + 3));
      for (let i = 0; i < n; i++) { const a = R() * 6.28, d = 12 + Math.sqrt(R()) * 62; s += fn(F(Math.cos(a) * d), F(Math.sin(a) * d), F(R() * 360), R()); }
    });
    // slice cuts
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; s += `<line x1="${F(Math.cos(a) * -88)}" y1="${F(Math.sin(a) * -88)}" x2="${F(Math.cos(a) * 88)}" y2="${F(Math.sin(a) * 88)}" stroke="rgba(60,20,8,.22)" stroke-width="1.4"/>`; }
    return s;
  }

  const DEFS = `<defs>
    <radialGradient id="crustG" cx="50%" cy="50%" r="50%"><stop offset="80%" stop-color="#000" stop-opacity="0"/><stop offset="92%" stop-color="#f4c27a" stop-opacity=".55"/><stop offset="100%" stop-color="#7a3d14" stop-opacity=".55"/></radialGradient>
    <radialGradient id="cheeseG" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#fff" stop-opacity=".18"/><stop offset="100%" stop-color="#000" stop-opacity=".12"/></radialGradient>
    <radialGradient id="plateG" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#2c231e"/><stop offset="100%" stop-color="#120d0b"/></radialGradient>
    <linearGradient id="glassG" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".25" stop-color="#fff" stop-opacity=".04"/><stop offset=".8" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
    <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c070"/><stop offset="1" stop-color="#c77a2e"/></linearGradient>
  </defs>`;

  function pizza(it) {
    const R = rng(it.id * 7 + 3), id = 'p' + it.id;
    if (it.calzone) {
      return `<svg viewBox="-110 -110 220 220" class="art art--pizza">${DEFS}<ellipse cx="0" cy="60" rx="92" ry="16" fill="#000" opacity=".35"/>
        <path d="M-92 30 A92 92 0 0 1 92 30 Z" fill="url(#goldG)" stroke="#9c5a22" stroke-width="3"/>
        <path d="M-92 30 Q0 46 92 30" fill="none" stroke="#e7a95a" stroke-width="12" stroke-linecap="round"/>
        ${[-60, -36, -12, 12, 36, 60].map(x => `<path d="M${x} 36 l-4 9 M${x + 6} 36 l-4 9" stroke="#8a4a1c" stroke-width="2.4" stroke-linecap="round"/>`).join('')}
        <g fill="#7a3d14" opacity=".6"><circle cx="-30" cy="-20" r="5"/><circle cx="20" cy="-40" r="4"/><circle cx="45" cy="-5" r="6"/><circle cx="-55" cy="5" r="4"/></g>
        <path d="M-40 -6 q10 -14 22 0" stroke="#fff5dc" stroke-width="3" fill="none" opacity=".5"/>
        <g transform="translate(70 -62)"><ellipse rx="22" ry="9" fill="#2a1a12"/><ellipse rx="18" ry="6" fill="#c8361d"/></g></svg>`;
    }
    const wedge = 'M0 0 L88 0 A88 88 0 0 0 62.2 -62.2 Z';
    const body = pizzaBody(it, R);
    return `<svg viewBox="-110 -110 220 220" class="art art--pizza">${DEFS}
      <defs><clipPath id="w${id}"><path d="M0 0 L100 0 A100 100 0 0 0 70.7 -70.7 Z"/></clipPath><g id="${id}">${body}</g></defs>
      <circle r="104" fill="#000" opacity=".35" transform="translate(4 8)"/>
      <circle r="104" fill="#1c1411" stroke="#2c201b" stroke-width="2"/>
      <g class="pz-spin"><use href="#${id}"/>
        <path class="pz-hole" d="${wedge}" fill="#1c1411"/>
        <g class="pz-strings"><path d="M20 -6 q14 -10 30 -24 M34 -4 q14 -12 30 -22 M14 -14 q10 -14 22 -30" stroke="#ffe9a8" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>
        <g class="pz-lift"><use href="#${id}" clip-path="url(#w${id})"/></g>
      </g></svg>`;
  }

  const SAUCE = {
    white: { n: '#f1dfb0', s: '#f8ecd0', d: '#fff8e8' }, red: { n: '#f0c070', s: '#c8361d', d: '#e2412b' },
    pink: { n: '#f2c79a', s: '#e8846a', d: '#f3a183' }, meat: { n: '#efc172', s: '#a8341e', d: '#6b3a22' },
    green: { n: '#ead08a', s: '#4e8f2e', d: '#7bb34b' }
  };
  function pasta(it) {
    const R = rng(it.id * 13 + 1);
    let inner = '';
    if (it.s === 'lasagna') {
      inner = `<rect x="-62" y="-50" width="124" height="100" rx="10" fill="#c46a2a"/><rect x="-58" y="-46" width="116" height="92" rx="9" fill="#f0b54e"/>`;
      for (let i = 0; i < 26; i++) inner += `<circle cx="${F(R() * 108 - 54)}" cy="${F(R() * 84 - 42)}" r="${F(3 + R() * 7)}" fill="${R() > .5 ? '#c4651f' : '#fbe08a'}" opacity=".8"/>`;
      inner += `<path d="M-58 30 q30 -8 58 0 t58 0" stroke="#a8341e" stroke-width="5" fill="none" opacity=".6"/>`;
    } else {
      const c = SAUCE[it.s] || SAUCE.white;
      inner = `<circle r="66" fill="${c.s}"/>`;
      for (let i = 0; i < 22; i++) {
        const a = R() * 6.28, d = R() * 44, x = Math.cos(a) * d, y = Math.sin(a) * d, r = 10 + R() * 18, a0 = R() * 6.28;
        inner += `<path d="M${F(x + Math.cos(a0) * r)} ${F(y + Math.sin(a0) * r)} A${F(r)} ${F(r)} 0 1 1 ${F(x + Math.cos(a0 + 2.6) * r)} ${F(y + Math.sin(a0 + 2.6) * r)}" fill="none" stroke="${c.n}" stroke-width="${it.c === 'pasta' && /Penne/.test(it.en) ? 7 : 4.5}" stroke-linecap="round"/>`;
      }
      for (let i = 0; i < 10; i++) inner += `<circle cx="${F(R() * 90 - 45)}" cy="${F(R() * 90 - 45)}" r="${F(2 + R() * 4)}" fill="${c.d}" opacity=".85"/>`;
    }
    let herbs = '';
    for (let i = 0; i < 14; i++) herbs += `<circle cx="${F(R() * 100 - 50)}" cy="${F(R() * 100 - 50)}" r="1.6" fill="#3b8a2e"/>`;
    return `<svg viewBox="-110 -110 220 220" class="art art--pasta">${DEFS}<circle r="100" fill="#000" opacity=".35" transform="translate(4 8)"/>
      <circle r="98" fill="url(#plateG)" stroke="#3a2e27" stroke-width="3"/><circle r="78" fill="#18110e"/>
      <g class="ps-spin">${inner}${herbs}<path transform="translate(26 -30) rotate(-20)" d="M0 -9 C7 -4 7 5 0 9 C-7 5 -7 -4 0 -9Z" fill="#2f7d32"/></g>
      <g class="ps-fork" transform="rotate(-38)"><rect x="-3" y="-104" width="6" height="70" rx="3" fill="#d9dde2"/><path d="M-10 -36 h20 v10 a10 10 0 0 1 -20 0z" fill="#c9ced4"/>${[-8, -3, 2, 7].map(x => `<rect x="${x}" y="-26" width="2.4" height="22" rx="1" fill="#c9ced4"/>`).join('')}</g></svg>`;
  }

  function feteer(it) {
    const R = rng(it.id * 17 + 5), f = it.f || '#f4d27a', sweet = it.sw;
    let flakes = '';
    for (let i = 0; i < 9; i++) flakes += `<path transform="translate(${F(R() * 170 - 85)} ${F(R() * 170 - 85)}) rotate(${F(R() * 360)})" d="M0 0 l6 -3 l4 4 l-5 4z" fill="#f2c46b" opacity=".85"/>`;
    let top = '';
    for (let i = -3; i <= 3; i++) top += `<path d="M${i * 18 - 40} -66 L${i * 18 + 40} 66" stroke="rgba(140,70,20,.25)" stroke-width="1.5"/>`;
    let dust = '';
    if (sweet) for (let i = 0; i < 40; i++) dust += `<circle cx="${F(R() * 120 - 60)}" cy="${F(R() * 120 - 60)}" r="${F(.8 + R() * 1.4)}" fill="#fffaf0" opacity=".9"/>`;
    const drizzle = sweet ? `<path d="M-50 -30 q12 14 24 0 t24 0 t24 0 t24 0 M-46 10 q12 14 24 0 t24 0 t24 0 t20 0" stroke="${f}" stroke-width="4" fill="none" stroke-linecap="round"/>` : '';
    return `<svg viewBox="-110 -110 220 220" class="art art--feteer">${DEFS}<g>${flakes}</g>
      <g class="ft-body" transform="rotate(45)"><rect x="-72" y="-72" width="144" height="144" rx="18" fill="#000" opacity=".35" transform="translate(5 7)"/>
      <rect x="-72" y="-72" width="144" height="144" rx="18" fill="url(#goldG)" stroke="#a65d22" stroke-width="3"/>
      <rect x="-60" y="-60" width="120" height="120" rx="12" fill="none" stroke="#f8d79a" stroke-width="2" opacity=".6"/>
      <rect x="-48" y="-48" width="96" height="96" rx="10" fill="none" stroke="#f8d79a" stroke-width="1.5" opacity=".45"/>
      ${top}<path d="M-72 -72 L72 72 M72 -72 L-72 72" stroke="#8a4a1c" stroke-width="2.5" opacity=".5"/></g>
      <g class="ft-open"><path d="M0 0 L50 -50 L62 -6 Z" fill="${f}" stroke="#7a3d14" stroke-width="1.5"/><path d="M0 0 L50 -50 L62 -6 Z" fill="url(#cheeseG)"/></g>
      ${drizzle}<g>${dust}</g></svg>`;
  }

  function drink(it) {
    const liq = it.liq || '#3a1d0e', cup = it.cup, hot = it.c === 'hot';
    const steam = hot ? `<g class="steam" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"><path d="M-14 -70 q-8 -12 0 -24 t0 -24"/><path d="M0 -74 q-8 -12 0 -24 t0 -24"/><path d="M14 -70 q-8 -12 0 -24 t0 -24"/></g>` : '';
    let body = '';
    if (cup === 'espresso') body = `<ellipse cx="0" cy="58" rx="62" ry="14" fill="#a3171d"/><ellipse cx="0" cy="54" rx="62" ry="14" fill="#d01f25"/><path d="M-36 -20 h72 l-8 62 a12 12 0 0 1 -12 10 h-32 a12 12 0 0 1 -12 -10z" fill="#d01f25"/><path d="M36 -6 q24 0 20 22 q-4 16 -24 14" fill="none" stroke="#d01f25" stroke-width="7"/><ellipse cx="0" cy="-20" rx="36" ry="9" fill="${liq}"/><ellipse cx="0" cy="-20" rx="30" ry="6" fill="#c08a52" opacity=".75"/>`;
    else if (cup === 'cup') body = `<ellipse cx="0" cy="62" rx="70" ry="14" fill="#e8dcc8"/><path d="M-50 -30 h100 l-10 74 a16 16 0 0 1 -16 14 h-48 a16 16 0 0 1 -16 -14z" fill="#f4ede1"/><path d="M50 -14 q30 0 26 26 q-4 20 -30 16" fill="none" stroke="#f4ede1" stroke-width="8"/><ellipse cx="0" cy="-30" rx="50" ry="11" fill="${liq}"/>${it.foam ? '<ellipse cx="0" cy="-30" rx="40" ry="7" fill="#fbf3e4"/><path d="M-10 -32 q10 -8 20 0 q-10 6 -20 0" fill="#c79a6b"/>' : ''}`;
    else if (cup === 'mug') body = `<path d="M-46 -40 h92 v90 a14 14 0 0 1 -14 14 h-64 a14 14 0 0 1 -14 -14z" fill="#d01f25"/><path d="M46 -20 q34 0 30 30 q-4 22 -30 20" fill="none" stroke="#d01f25" stroke-width="9"/><ellipse cx="0" cy="-40" rx="46" ry="10" fill="${liq}"/><text x="0" y="22" text-anchor="middle" font-family="Bowlby One, sans-serif" font-size="34" fill="#f2d6a2">7</text>`;
    else if (cup === 'glass') body = `<path d="M-34 -70 h68 l-6 130 h-56z" fill="${liq}"/><path d="M-34 -70 h68 l-1 26 h-66z" fill="#fbf1de"/><path d="M-30 -10 h60" stroke="#fff" stroke-opacity=".12"/><path d="M-38 -76 h76 l-8 140 h-60z" fill="url(#glassG)" stroke="#ffffff55" stroke-width="2"/>`;
    else if (cup === 'tall') {
      let ice = '';
      if (it.ice) ice = [[-14, -40], [12, -20], [-8, 4], [14, 26]].map(([x, y]) => `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="4" fill="#fff" opacity=".35" transform="rotate(${x} ${x} ${y})"/>`).join('');
      body = `<path d="M-36 -64 h72 l-7 128 h-58z" fill="${liq}"/>${ice}${it.mint ? '<path d="M8 -72 C22 -86 34 -76 26 -62 C18 -56 10 -62 8 -72Z M-4 -70 C-16 -88 -30 -76 -22 -64 C-14 -58 -6 -62 -4 -70Z" fill="#3f9a3a"/>' : ''}${it.cream ? '<path d="M-38 -64 q4 -24 18 -18 q6 -20 22 -10 q14 -14 22 6 q14 2 14 22z" fill="#fff8ec"/>' : ''}<rect x="14" y="-108" width="7" height="70" rx="3" fill="#d01f25" transform="rotate(12 17 -70)"/><path d="M-40 -70 h80 l-8 138 h-64z" fill="url(#glassG)" stroke="#ffffff55" stroke-width="2"/>`;
    } else if (cup === 'can') body = `<rect x="-34" y="-66" width="68" height="130" rx="10" fill="${liq}"/><rect x="-30" y="-74" width="60" height="12" rx="5" fill="#cfd4da"/><rect x="-34" y="-10" width="68" height="30" fill="#fff" opacity=".9"/><text x="0" y="12" text-anchor="middle" font-family="Bowlby One, sans-serif" font-size="20" fill="#d01f25">CIAO</text><rect x="-34" y="-66" width="10" height="130" fill="#fff" opacity=".15"/>`;
    else body = `<path d="M-10 -96 h20 v18 q22 16 22 40 v104 a10 10 0 0 1 -10 10 h-44 a10 10 0 0 1 -10 -10 v-104 q0 -24 22 -40z" fill="${liq}" opacity=".7" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><rect x="-11" y="-104" width="22" height="12" rx="3" fill="#2a6fb0"/><rect x="-32" y="-10" width="64" height="34" fill="#fff" opacity=".85"/><text x="0" y="12" text-anchor="middle" font-family="Readex Pro, sans-serif" font-weight="700" font-size="14" fill="#2a6fb0">ACQUA</text>`;
    return `<svg viewBox="-110 -110 220 220" class="art art--drink"><defs>${DEFS.replace(/<\/?defs>/g, '')}</defs><ellipse cx="0" cy="80" rx="70" ry="12" fill="#000" opacity=".35"/>${steam}<g class="dk-body">${body}</g></svg>`;
  }

  function starter(it) {
    const R = rng(it.id * 19 + 7), t = it.st;
    let s = `<circle r="96" fill="url(#plateG)" stroke="#3a2e27" stroke-width="3"/>`;
    if (t === 'bread' || t === 'cheesebread') {
      for (let i = 0; i < 5; i++) {
        const x = -60 + i * 30, y = -10 + (i % 2) * 18;
        s += `<g transform="translate(${x} ${y}) rotate(${-20 + i * 8})"><ellipse rx="22" ry="34" fill="#c77a2e"/><ellipse rx="18" ry="29" fill="#f4d79a"/>${t === 'cheesebread' ? '<path d="M-16 -10 q8 -16 16 -4 q8 -14 16 4 q-2 22 -16 26 q-16 -4 -16 -26z" fill="#fff1c4"/>' : ''}<circle cx="-5" cy="-6" r="2" fill="#3b8a2e"/><circle cx="6" cy="8" r="2" fill="#3b8a2e"/></g>`;
      }
    } else if (t === 'sticks') {
      for (let i = 0; i < 6; i++) s += `<rect x="-62" y="${-48 + i * 17}" width="${86 + (i % 2) * 14}" height="12" rx="6" fill="#d9892e" transform="rotate(${-10 + i * 3})"/>`;
      s += `<circle cx="52" cy="40" r="26" fill="#2a1a12"/><circle cx="52" cy="40" r="21" fill="#c8361d"/>`;
    } else if (t === 'wedges') {
      for (let i = 0; i < 9; i++) { const a = R() * 6.28, d = R() * 48; s += `<path transform="translate(${F(Math.cos(a) * d)} ${F(Math.sin(a) * d)}) rotate(${F(R() * 360)})" d="M-20 6 Q0 -18 20 6 Z" fill="#e6a548" stroke="#a8641e" stroke-width="2"/>`; }
      for (let i = 0; i < 20; i++) s += `<circle cx="${F(R() * 110 - 55)}" cy="${F(R() * 110 - 55)}" r="1.5" fill="#3b8a2e"/>`;
    } else if (t === 'wings') {
      for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; s += `<g transform="translate(${F(Math.cos(a) * 46)} ${F(Math.sin(a) * 46)}) rotate(${F(a * 57)})"><ellipse rx="20" ry="12" fill="#a8341e"/><ellipse rx="14" ry="7" cx="-2" cy="-2" fill="#c9502a"/><rect x="16" y="-3" width="10" height="6" rx="3" fill="#f3e3c6"/></g>`; }
      s += `<circle r="20" fill="#fff6e4"/><circle r="15" fill="#f2e2c0"/>`;
    } else {
      for (let i = 0; i < 16; i++) { const a = R() * 6.28, d = R() * 60; s += `<path transform="translate(${F(Math.cos(a) * d)} ${F(Math.sin(a) * d)}) rotate(${F(R() * 360)})" d="M0 -18 C14 -8 14 8 0 18 C-14 8 -14 -8 0 -18Z" fill="${R() > .5 ? '#5aa33a' : '#86c24f'}" opacity=".95"/>`; }
      for (let i = 0; i < 6; i++) s += `<rect x="${F(R() * 90 - 45)}" y="${F(R() * 90 - 45)}" width="11" height="11" rx="2" fill="#e3b467"/>`;
      for (let i = 0; i < 5; i++) s += `<rect x="${F(R() * 80 - 40)}" y="${F(R() * 80 - 40)}" width="16" height="9" rx="3" fill="#e9c08a" stroke="#b9874a"/>`;
      for (let i = 0; i < 30; i++) s += `<circle cx="${F(R() * 110 - 55)}" cy="${F(R() * 110 - 55)}" r="1.4" fill="#fff8e2"/>`;
    }
    return `<svg viewBox="-110 -110 220 220" class="art art--starter">${DEFS}<circle r="100" fill="#000" opacity=".35" transform="translate(4 8)"/><g class="st-spin">${s}</g></svg>`;
  }

  window.CiaoArt = function (it) {
    switch (it.c) {
      case 'classic': case 'special': return pizza(it);
      case 'pasta': return pasta(it);
      case 'feteer': return feteer(it);
      case 'sweet': return it.sw ? feteer(it) : pizza(it);
      case 'starters': return starter(it);
      default: return drink(it);
    }
  };
  window.CiaoArt.slicePattern = function (kind) {
    // little pattern used on the menu wheel slices
    return kind;
  };
})();
