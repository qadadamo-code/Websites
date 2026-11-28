/* Komy's Furniture — sample content (placeholder prices & contacts) */
window.KM = {
  config: {
    whatsapp: '201203101104',
    phone: '+201203101104',
    phoneDisplay: '0120 310 1104',
    email: 'info@theplanetco.com'
  },
  rooms: [
    { id: 'living', img: 'assets/img/fab_clay.webp', count: 48 },
    { id: 'bedroom', img: 'assets/img/col_bedroom.webp', count: 36 },
    { id: 'dining', img: 'assets/img/col_dining.webp', count: 22 },
    { id: 'kids', img: 'assets/img/col_kids.webp', count: 18 },
    { id: 'office', img: 'assets/img/col_office.webp', count: 15 },
    { id: 'outdoor', img: 'assets/img/col_outdoor.webp', count: 12 },
    { id: 'entry', img: 'assets/img/col_entry.webp', count: 20 }
  ],
  fabrics: [
    { id: 'clay', img: 'assets/img/fab_clay.webp', c: '#B5583A', add: 0 },
    { id: 'olive', img: 'assets/img/fab_olive.webp', c: '#4E5A34', add: 0 },
    { id: 'ivory', img: 'assets/img/fab_ivory.webp', c: '#E9DFCC', add: 1500 },
    { id: 'navy', img: 'assets/img/fab_navy.webp', c: '#1D2748', add: 2500 },
    { id: 'blush', img: 'assets/img/fab_blush.webp', c: '#D3A3A0', add: 1500 }
  ],
  sofaBase: 38500,
  products: [
    { id: 'p01', cat: 'living', price: 38500, old: 42000, tag: 'best' },
    { id: 'p02', cat: 'living', price: 14900, tag: 'new' },
    { id: 'p03', cat: 'living', price: 56000 },
    { id: 'p04', cat: 'living', price: 9800 },
    { id: 'p05', cat: 'dining', price: 27500, tag: 'best' },
    { id: 'p06', cat: 'dining', price: 4600 },
    { id: 'p07', cat: 'bedroom', price: 31000, tag: 'new' },
    { id: 'p08', cat: 'dining', price: 21500 },
    { id: 'p09', cat: 'living', price: 16800 },
    { id: 'p10', cat: 'bedroom', price: 6900 },
    { id: 'p11', cat: 'office', price: 18900 },
    { id: 'p12', cat: 'outdoor', price: 11500, tag: 'new' }
  ],
  planner: {
    rooms: [
      { id: 'living', base: 65000 },
      { id: 'bedroom', base: 58000 },
      { id: 'dining', base: 42000 },
      { id: 'full', base: 210000 }
    ],
    sizes: [{ id: 's', k: 0.85 }, { id: 'm', k: 1 }, { id: 'l', k: 1.3 }],
    moods: [
      { id: 'warm', c: ['#B5583A', '#E9DFCC', '#6B4A2F'] },
      { id: 'calm', c: ['#4E5A34', '#EFE8DA', '#A88B66'] },
      { id: 'bold', c: ['#1D2748', '#C9A15A', '#E9DFCC'] }
    ]
  }
};
