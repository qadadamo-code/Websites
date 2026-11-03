/* Disha's Catering — menu + contact config.
   Edit prices / items / phone here, then bump ?v= in index.html. */
window.DISHA_CONFIG = {
  // TEMP: Planet WhatsApp until the client sends their own number
  whatsapp: '201203101104',
  phone: '01203101104',
  instagram: 'https://www.instagram.com/dishascatering',
  currency: { ar: 'جنيه', en: 'EGP' },
  addon: {
    price: 50,
    name: { ar: 'إضافة جاتوه + مياه + بيبسي', en: 'Gateau + water + Pepsi add-on' }
  }
};

/* icon keys map to inline SVGs in app.js */
window.DISHA_SETS = [
  {
    id: 1, price: 180, img: 'set1',
    name: { ar: 'سِت الفرخة', en: 'The Chicken Set' },
    tag: { ar: 'الأكثر طلبًا للعزومات', en: 'The gathering favourite' },
    items: [
      { i: 'rice',    ar: 'أرز خلطة',      en: 'Khalta rice with nuts' },
      { i: 'kofta',   ar: '2 صباع كفتة',   en: '2 kofta fingers' },
      { i: 'beef',    ar: 'شريحة لحمة',    en: 'Roast beef slice' },
      { i: 'chicken', ar: 'ربع فرخة',      en: 'Grilled chicken quarter' },
      { i: 'can',     ar: '1 كانز',        en: '1 soft-drink can' }
    ]
  },
  {
    id: 2, price: 210, img: 'set2',
    name: { ar: 'سِت الرومي', en: 'The Turkey Set' },
    tag: { ar: 'لحمة ورومي في طبق واحد', en: 'Beef and turkey on one plate' },
    items: [
      { i: 'rice',    ar: 'أرز خلطة',      en: 'Khalta rice with nuts' },
      { i: 'kofta',   ar: '2 صباع كفتة',   en: '2 kofta fingers' },
      { i: 'beef',    ar: 'شريحة لحمة',    en: 'Roast beef slice' },
      { i: 'turkey',  ar: 'شريحة رومي',    en: 'Smoked turkey slice' },
      { i: 'samosa',  ar: '1 سمبوسة',      en: '1 sambousek' }
    ]
  },
  {
    id: 3, price: 190, img: 'set3',
    name: { ar: 'سِت البشاميل', en: 'The Béchamel Set' },
    tag: { ar: 'طعم البيت اللي الكل بيحبه', en: 'The home taste everyone loves' },
    items: [
      { i: 'rice',    ar: 'أرز خلطة',      en: 'Khalta rice with nuts' },
      { i: 'bech',    ar: 'قطعة بشاميل',   en: 'Béchamel pasta square' },
      { i: 'beef',    ar: 'شريحة لحمة',    en: 'Roast beef slice' },
      { i: 'turkey',  ar: 'شريحة رومي',    en: 'Smoked turkey slice' },
      { i: 'kofta',   ar: '1 كفتة',        en: '1 kofta finger' },
      { i: 'samosa',  ar: '1 سمبوسة',      en: '1 sambousek' }
    ]
  },
  {
    id: 4, price: 240, img: 'set4',
    name: { ar: 'سِت المحشي', en: 'The Mahshi Set' },
    tag: { ar: 'أغنى سِت في المنيو', en: 'Our richest set' },
    items: [
      { i: 'rice',    ar: 'أرز خلطة',      en: 'Khalta rice with nuts' },
      { i: 'leaf',    ar: '2 محشي',        en: '2 stuffed cabbage rolls' },
      { i: 'leaf',    ar: '2 ورق عنب',     en: '2 stuffed vine leaves' },
      { i: 'beef',    ar: 'شريحة لحمة',    en: 'Roast beef slice' },
      { i: 'kofta',   ar: '2 صباع كفتة',   en: '2 kofta fingers' },
      { i: 'samosa',  ar: '1 سمبوسة',      en: '1 sambousek' }
    ]
  },
  {
    id: 5, price: 150, img: 'set5',
    name: { ar: 'سِت الشيش', en: 'The Shish Set' },
    tag: { ar: 'أوفر سِت… ومشبّع', en: 'Best value, still generous' },
    items: [
      { i: 'rice',    ar: 'أرز خلطة',      en: 'Khalta rice with nuts' },
      { i: 'skewer',  ar: 'خلة شيش',       en: 'Shish tawook skewer' },
      { i: 'breast',  ar: 'شريحة صدر مشوي', en: 'Grilled chicken breast slice' },
      { i: 'kofta',   ar: '2 صباع كفتة',   en: '2 kofta fingers' },
      { i: 'samosa',  ar: '1 سمبوسة',      en: '1 sambousek' }
    ]
  }
];
