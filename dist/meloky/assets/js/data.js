/* Meloky Furniture — content data (sample: prices are placeholders, contact = Planet) */
window.ML = {
  config: { whatsapp: '201203101104', phone: '+201203101104', phoneDisplay: '01203101104' },
  collections: [
    { id: 'living', img: 'col_living', cat: 'living' },
    { id: 'bedroom', img: 'col_bedroom', cat: 'bedroom' },
    { id: 'dining', img: 'col_dining', cat: 'dining' },
    { id: 'niche', img: 'col_niche', cat: 'storage' },
    { id: 'coffee', img: 'col_coffee', cat: 'storage' },
    { id: 'wardrobe', img: 'col_wardrobe', cat: 'bedroom' },
    { id: 'console', img: 'col_console', cat: 'decor' }
  ],
  products: [
    { id: 'p_sofa', cat: 'living', price: 38500, dims: '240 × 100 × 78' },
    { id: 'p_armchair', cat: 'living', price: 12900, dims: '82 × 80 × 76' },
    { id: 'p_coffee', cat: 'living', price: 9800, dims: 'Ø 90 × 38' },
    { id: 'p_dining', cat: 'dining', price: 42000, dims: 'Ø 120 × 76' },
    { id: 'p_chair', cat: 'dining', price: 5400, dims: '52 × 56 × 82' },
    { id: 'p_bed', cat: 'bedroom', price: 46000, dims: '200 × 180 × 140' },
    { id: 'p_night', cat: 'bedroom', price: 7200, dims: '55 × 42 × 55' },
    { id: 'p_wardrobe', cat: 'storage', price: 58000, dims: '240 × 60 × 250' },
    { id: 'p_niche', cat: 'storage', price: 34500, dims: '120 × 45 × 210' },
    { id: 'p_coffeebar', cat: 'storage', price: 39000, dims: '160 × 50 × 230' },
    { id: 'p_sideboard', cat: 'storage', price: 27500, dims: '180 × 48 × 80' },
    { id: 'p_console', cat: 'decor', price: 21000, dims: '130 × 40 × 85' }
  ],
  craft: [
    { id: 1, img: 'craft_draw' },
    { id: 2, img: 'craft_wood' },
    { id: 3, img: 'craft_upholstery' },
    { id: 4, img: 'craft_finish' },
    { id: 5, img: 'export' }
  ],
  /* configurator */
  types: [
    { id: 'buffet', w: 160, h: 90, wr: [100, 260], hr: [70, 110], rate: 170 },
    { id: 'niche', w: 140, h: 210, wr: [100, 220], hr: [180, 240], rate: 250 },
    { id: 'coffee', w: 160, h: 230, wr: [120, 260], hr: [200, 240], rate: 245 },
    { id: 'wardrobe', w: 200, h: 240, wr: [120, 300], hr: [200, 260], rate: 270 }
  ],
  finishes: [
    { id: 'walnut', c: '#5a3520', c2: '#7a4a2c', f: 1.15 },
    { id: 'oak', c: '#b88a57', c2: '#cfa477', f: 1 },
    { id: 'ivory', c: '#ece3d3', c2: '#f7f1e6', f: 1.08 },
    { id: 'taupe', c: '#857a6f', c2: '#9b9086', f: 1.05 }
  ],
  handles: [
    { id: 'gold', c: '#d6ab55' },
    { id: 'black', c: '#1b1714' },
    { id: 'none', c: 'transparent' }
  ]
};
