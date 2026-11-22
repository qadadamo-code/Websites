/* Anwar Ghaleb — catalogue data. Prices are SAMPLE values in EGP.
   Each product: id, cat, n (model name, language-neutral), price, old?, tag?, f (feature keys -> i18n),
   v: colour variants [hex swatch, render options], b: 3D builder, r: render rotation. */
window.AG = {
  whatsapp: '201203101104',          // TEMP: Planet number (sample site)
  phone: '+20 120 310 1104',
  email: 'info@theplanetco.com',
  cats: ['cases', 'chargers', 'cables', 'audio', 'power', 'protection', 'wearables', 'car'],
  products: [
    { id: 'c1', cat: 'cases', n: 'Silk MagSafe Case', price: 450, old: 550, tag: 'hot', b: 'phoneCase', r: [.1, 2.7, .1], f: ['magsafe', 'microfiber', 'drop2m'],
      v: [['#5046FF', { color: '#5046FF' }], ['#D4FF3A', { color: '#C9F23A', phoneColor: '#2b2f3a' }], ['#1c1e26', { color: '#1c1e26' }], ['#d8cbb5', { color: '#d8cbb5' }]] },
    { id: 'c2', cat: 'cases', n: 'Crystal Clear MagSafe', price: 390, tag: 'new', b: 'phoneCase', r: [.1, 2.7, .1], f: ['magsafe', 'antiyellow', 'slim'],
      v: [['#ffffff', { style: 'clear', color: '#ffffff', phoneColor: '#5046FF' }], ['#2b2f3a', { style: 'clear', color: '#ffffff', phoneColor: '#2b2f3a' }]] },
    { id: 'c3', cat: 'cases', n: 'Carbon Armor', price: 650, b: 'phoneCase', r: [.1, 2.7, .1], f: ['magsafe', 'aramid', 'drop3m'],
      v: [['#1c1e26', { style: 'carbon', color: '#22252d' }]] },
    { id: 'c4', cat: 'cases', n: 'Atelier Leather', price: 890, b: 'phoneCase', r: [.1, 2.7, .1], f: ['leather', 'magsafe', 'slim'],
      v: [['#6b3a22', { style: 'leather', color: '#6b3a22' }], ['#1d2b4a', { style: 'leather', color: '#1d2b4a' }], ['#4a5233', { style: 'leather', color: '#4a5233' }]] },

    { id: 'ch1', cat: 'chargers', n: 'Volt GaN 65W', price: 1250, old: 1450, tag: 'hot', b: 'charger', r: [.25, -.6, 0], f: ['gan', 'w65', 'ports3'],
      v: [['#f2f3f6', { color: '#f2f3f6', watts: '65W', ports: 3 }], ['#1c1e26', { color: '#1c1e26', watts: '65W', ports: 3 }]] },
    { id: 'ch2', cat: 'chargers', n: 'Volt 35W Dual', price: 750, b: 'charger', r: [.25, -.6, 0], f: ['pd', 'w35', 'ports2'],
      v: [['#f2f3f6', { color: '#f2f3f6', watts: '35W', ports: 2 }], ['#1c1e26', { color: '#1c1e26', watts: '35W', ports: 2 }]] },
    { id: 'ch3', cat: 'chargers', n: 'Volt 20W Mini', price: 420, b: 'charger', r: [.25, -.6, 0], f: ['pd', 'w20', 'compact'],
      v: [['#f2f3f6', { color: '#f2f3f6', watts: '20W', ports: 1 }]] },
    { id: 'ch4', cat: 'chargers', n: 'Halo Wireless Pad', price: 690, tag: 'new', b: 'pad', r: [0, 0, 0], f: ['qi2', 'w15', 'led'],
      v: [['#f2f3f6', { color: '#f2f3f6', ring: '#5046FF' }], ['#1c1e26', { color: '#1c1e26', ring: '#D4FF3A' }]] },
    { id: 'ch5', cat: 'chargers', n: 'Trio 3-in-1 Station', price: 2450, b: 'stand3', r: [.1, -.5, 0], f: ['threeinone', 'qi2', 'w15'],
      v: [['#1c1e26', { color: '#1c1e26' }], ['#f2f3f6', { color: '#e9eaee' }]] },

    { id: 'cb1', cat: 'cables', n: 'Flex Braided C-C 2m', price: 240, tag: 'value', b: 'cable', r: [0, 0, 0], f: ['braided', 'w60', 'bend'],
      v: [['#5046FF', { color: '#5046FF' }], ['#D4FF3A', { color: '#C9F23A' }], ['#1c1e26', { color: '#2a2d36' }]] },
    { id: 'cb2', cat: 'cables', n: 'Flex C to Lightning 1m', price: 220, b: 'cable', r: [0, 0, 0], f: ['mfi', 'pd', 'braided'],
      v: [['#f2f3f6', { color: '#eceef2', ends: ['c', 'l'] }]] },
    { id: 'cb3', cat: 'cables', n: 'Flex 240W Pro 1m', price: 340, tag: 'new', b: 'cable', r: [0, 0, 0], f: ['w240', 'data40', 'braided'],
      v: [['#C9F23A', { color: '#C9F23A' }], ['#f2f3f6', { color: '#eceef2' }]] },

    { id: 'a1', cat: 'audio', n: 'Aura Buds Pro', price: 2150, old: 2490, tag: 'hot', b: 'earbuds', r: [.35, -.4, 0], f: ['anc', 'h36', 'bt54'],
      v: [['#f3f4f7', { color: '#f3f4f7' }], ['#1c1e26', { color: '#25282f' }]] },
    { id: 'a2', cat: 'audio', n: 'Aura Buds Lite', price: 990, b: 'earbuds', r: [.35, -.4, 0], f: ['enc', 'h24', 'ipx5'],
      v: [['#a9a2ff', { color: '#a9a2ff' }], ['#f3f4f7', { color: '#f3f4f7' }]] },
    { id: 'a3', cat: 'audio', n: 'Aura Max Headphones', price: 3650, b: 'headphones', r: [0, 0, 0], f: ['anc', 'h60', 'hires'],
      v: [['#1c1e26', { color: '#1c1e26', accent: '#D4FF3A' }], ['#e9eaee', { color: '#e9eaee', accent: '#5046FF' }]] },
    { id: 'a4', cat: 'audio', n: 'Pulse Speaker', price: 1450, b: 'speaker', r: [0, 0, 0], f: ['ip67', 'h20', 'bass'],
      v: [['#5046FF', { color: '#5046FF' }], ['#C9F23A', { color: '#B9E32F' }], ['#1c1e26', { color: '#2a2d36' }]] },

    { id: 'p1', cat: 'power', n: 'Core 20000 PD', price: 1350, b: 'powerbank', r: [.1, -.5, .1], f: ['mah20', 'w45', 'display'],
      v: [['#1c1e26', { color: '#1c1e26', cap: '20000' }], ['#5046FF', { color: '#4038d9', cap: '20000' }]] },
    { id: 'p2', cat: 'power', n: 'Snap MagSafe 10000', price: 1190, tag: 'new', b: 'powerbank', r: [.1, -.5, .1], f: ['magsafe', 'mah10', 'slim'],
      v: [['#f2f3f6', { color: '#eceef2', magsafe: true, cap: '10000' }], ['#5046FF', { color: '#5046FF', magsafe: true, cap: '10000' }]] },

    { id: 'g1', cat: 'protection', n: 'Shield 9H Glass', price: 180, tag: 'value', b: 'glass', r: [.1, -.4, 0], f: ['h9', 'fit', 'freeinstall'],
      v: [['#bfe3ff', {}]] },
    { id: 'g2', cat: 'protection', n: 'Shield Privacy Glass', price: 260, b: 'glass', r: [.1, -.4, 0], f: ['privacy', 'h9', 'freeinstall'],
      v: [['#0a0b12', { privacy: true }]] },
    { id: 'g3', cat: 'protection', n: 'Lens Guard Rings', price: 220, b: 'lensGuard', r: [.2, -.5, 0], f: ['lens', 'sapphire', 'freeinstall'],
      v: [['#c9ccd3', { color: '#c9ccd3' }], ['#5046FF', { color: '#5046FF' }], ['#D4FF3A', { color: '#C9F23A' }]] },

    { id: 'w1', cat: 'wearables', n: 'Pulse Watch S', price: 2850, tag: 'hot', b: 'watch', r: [.2, -.5, 0], f: ['amoled', 'gps', 'd7'],
      v: [['#5046FF', { band: '#5046FF' }], ['#C9F23A', { band: '#C9F23A' }], ['#1c1e26', { band: '#22252d', color: '#3a3d46' }]] },
    { id: 'w2', cat: 'wearables', n: 'Pulse Watch Active', price: 1990, b: 'watch', r: [.2, -.5, 0], f: ['hr', 'ip68', 'd10'],
      v: [['#f2f3f6', { band: '#eceef2', color: '#b8bcc6' }], ['#ff6b4a', { band: '#ff6b4a' }]] },

    { id: 'k1', cat: 'car', n: 'Drive Mag Vent Mount', price: 520, b: 'carMount', r: [0, 0, 0], f: ['magsafe', 'rot360', 'strong'],
      v: [['#1c1e26', { color: '#1c1e26' }]] },
    { id: 'k2', cat: 'car', n: 'Loop Ring Grip', price: 150, b: 'ringGrip', r: [.3, -.5, 0], f: ['stand', 'rot360', 'strong'],
      v: [['#D4FF3A', { color: '#C9F23A' }], ['#c9ccd3', { color: '#c9ccd3' }], ['#5046FF', { color: '#5046FF' }]] }
  ],
  /* bundles reference product ids (first variant) */
  bundles: [
    { id: 'starter', items: ['c1', 'g1', 'cb1'], save: 15 },
    { id: 'power', items: ['ch1', 'cb3', 'p2'], save: 12 },
    { id: 'pro', items: ['a1', 'w1', 'ch5'], save: 10 }
  ],
  studio: {
    models: ['iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17', 'Galaxy S26 Ultra', 'Galaxy S26+', 'Galaxy A57'],
    materials: [['silicone', 450], ['clear', 390], ['leather', 890], ['carbon', 650]],
    colors: ['#5046FF', '#C9F23A', '#1c1e26', '#ff6b4a', '#d8cbb5', '#1d2b4a', '#6b3a22', '#e9eaee'],
    engrave: 75
  }
};
