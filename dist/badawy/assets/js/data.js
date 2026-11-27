/* Al Badawy Furniture — kids rooms. SAMPLE content: prices, address, hours are placeholders. */
window.BD = {
  config: {
    whatsapp: '201203101104',          // Planet number (sample)
    phone: '+201203101104',
    phoneDisplay: '0120 310 1104',
    frames: 60
  },
  ages: [
    { id: 'baby',  img: 'col_baby' },
    { id: 'tod',   img: 'col_montessori' },
    { id: 'kid',   img: 'col_bunk' },
    { id: 'teen',  img: 'col_teen' }
  ],
  worlds: [
    { id: 'princess',   img: 'col_princess',   tint: '#E9B8B0' },
    { id: 'explorer',   img: 'col_explorer',   tint: '#D9A740' },
    { id: 'space',      img: 'col_space',      tint: '#8FA9D6' },
    { id: 'bunk',       img: 'col_bunk',       tint: '#9DB8A0' },
    { id: 'baby',       img: 'col_baby',       tint: '#E8D9BE' },
    { id: 'montessori', img: 'col_montessori', tint: '#CDB28A' },
    { id: 'twins',      img: 'col_twins',      tint: '#C98F72' },
    { id: 'teen',       img: 'col_teen',       tint: '#8EA7C2' }
  ],
  tones: [
    { id: 'oak',   img: 'hero_room',  c: '#D2A86E' },
    { id: 'white', img: 'tone_white', c: '#F6F3EC' },
    { id: 'sage',  img: 'tone_sage',  c: '#9DB59A' },
    { id: 'blush', img: 'tone_blush', c: '#EBB9B4' },
    { id: 'sky',   img: 'tone_sky',   c: '#A6C3E0' }
  ],
  sizes: [
    { id: 's90',  price: 0 },
    { id: 's120', price: 2500 },
    { id: 'bunk', price: 9500 }
  ],
  addons: [
    { id: 'canopy',  price: 1800 },
    { id: 'drawers', price: 2200 },
    { id: 'shelf',   price: 4800 },
    { id: 'desk',    price: 6500 },
    { id: 'name',    price: 650 }
  ],
  basePrice: 14900,
  products: [
    { id: 'house',    cat: 'beds',    img: 'p_house',    price: 14900, tag: 'best' },
    { id: 'castle',   cat: 'beds',    img: 'p_castle',   price: 23500 },
    { id: 'car',      cat: 'beds',    img: 'p_car',      price: 21900, tag: 'new' },
    { id: 'bunk',     cat: 'beds',    img: 'p_bunk',     price: 27900, tag: 'best' },
    { id: 'loft',     cat: 'study',   img: 'p_loft',     price: 29500 },
    { id: 'crib',     cat: 'baby',    img: 'p_crib',     price: 12900 },
    { id: 'wardrobe', cat: 'storage', img: 'p_wardrobe', price: 16800 },
    { id: 'dresser',  cat: 'storage', img: 'p_dresser',  price: 9900 },
    { id: 'desk',     cat: 'study',   img: 'p_desk',     price: 8900, tag: 'new' },
    { id: 'bench',    cat: 'storage', img: 'p_bench',    price: 5400 },
    { id: 'tree',     cat: 'storage', img: 'p_tree',     price: 6200 },
    { id: 'cloud',    cat: 'baby',    img: 'p_cloud',    price: 3900 }
  ]
};
