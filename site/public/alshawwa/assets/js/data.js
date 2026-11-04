/* Alshawwa | الشوَّا — all content pulled from alshawwa.restaurant (Nov 2026).
   Edit prices / items here. Prices in EGP, before 14% VAT + 12% service. */
window.SH_CONFIG = {
  whatsapp: '201038400687',
  phone: '01038400687',
  phoneIntl: '+201038400687',
  addressAr: 'كرافت زون، بلوك 10 - مدينتي',
  addressEn: 'Craft Zone, Block 10 - Madinaty',
  mapsUrl: 'https://maps.app.goo.gl/FRxfZbF286oEXDgi7',
  mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3236.8105760385606!2d31.674795999999997!3d30.077057000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1457f5004c9c1629%3A0x66288ff7185561a5!2z2KfZhNi02YjYpw!5e1!3m2!1sar!2seg!4v1791362914613!5m2!1sar!2seg',
  facebook: 'https://www.facebook.com/alshawwa.eg',
  instagram: 'https://www.instagram.com/alshawwa__restaurant',
  tiktok: 'https://www.tiktok.com/@alshawwa_restaurant',
  taxAr: 'الأسعار لا تشمل ضريبة القيمة المضافة (14%) ورسوم الخدمة (12%).',
  taxEn: 'Prices do not include 14% VAT and 12% service charge.'
};

window.SH_CATS = [
  { id: 'meat',    ar: 'مشاوي لحوم',        en: 'Grilled Meats',        icon: '🔥' },
  { id: 'chicken', ar: 'مشاوي دجاج',        en: 'Grilled Chicken',      icon: '🔥' },
  { id: 'sand',    ar: 'ساندوتشات المشاوي', en: 'Grilled Sandwiches',   icon: '🔥' },
  { id: 'salad',   ar: 'سلطات و مقبلات',    en: 'Salads & Appetizers',  icon: '🔥' },
  { id: 'kunafa',  ar: 'كنافة',             en: 'Kunafa',               icon: '🔥' },
  { id: 'drinks',  ar: 'مشروبات',           en: 'Beverages',            icon: '🔥' }
];

/* [id, cat, ar, en, price, photo, featured]  — photo = assets/img/dish/<photo>.webp */
window.SH_MENU = [
  ['kebab-1',   'meat', 'كيلو كباب', '1 kg Kebab', 850, 'kebab', 1],
  ['kebab-h',   'meat', 'نص كيلو كباب', 'Half Kilo Kebab', 425, 'kebab'],
  ['kebab-q',   'meat', 'ربع كيلو كباب', 'Quarter Kilo Kebab', 215, 'kebab'],
  ['fillet-1',  'meat', 'كيلو فيليه', '1 kg Fillet', 1200, 'fillet', 1],
  ['fillet-h',  'meat', 'نص كيلو فيليه', 'Half Kilo Fillet', 600, 'fillet'],
  ['fillet-q',  'meat', 'ربع كيلو فيليه', 'Quarter Kilo Fillet', 300, 'fillet'],
  ['liver-1',   'meat', 'كيلو كبدة مشوية', '1 kg Grilled Liver', 850, 'liver'],
  ['liver-h',   'meat', 'نص كيلو كبدة مشوية', '½ kg Grilled Liver', 425, 'liver'],
  ['liver-q',   'meat', 'ربع كيلو كبدة مشوية', '¼ kg Grilled Liver', 215, 'liver'],
  ['chops-1',   'meat', 'كيلو ريش', '1 kg Lamb Chops', 1300, 'chops', 1],
  ['chops-h',   'meat', 'نص كيلو ريش', '½ kg Lamb Chops', 650, 'chops'],
  ['fat',       'meat', 'سيخ لية مشوي', 'Grilled Lamb Fat Skewer', 50, 'fat'],

  ['chicken-w', 'chicken', 'دجاجة كاملة على الفحم', 'Whole Charcoal-Grilled Chicken', 500, 'chicken', 1],
  ['chicken-h', 'chicken', 'نص دجاجة مشوية', 'Half Grilled Chicken', 250, 'chicken'],
  ['shish-1',   'chicken', 'كيلو شيش طاووق', '1 kg Shish Tawook', 600, 'shish', 1],
  ['shish-h',   'chicken', 'نص كيلو شيش طاووق', 'Half Kilo Shish Tawook', 300, 'shish'],
  ['shish-q',   'chicken', 'ربع كيلو شيش طاووق', 'Quarter Kilo Shish Tawook', 150, 'shish'],
  ['steak-1',   'chicken', 'كيلو ستيك دجاج على الفحم', '1 kg Chicken Steak', 600, 'csteak'],
  ['steak-h',   'chicken', 'نص كيلو ستيك دجاج على الفحم', '½ kg Chicken Steak', 300, 'csteak'],
  ['steak-q',   'chicken', 'ربع كيلو ستيك دجاج على الفحم', '¼ kg Chicken Steak', 150, 'csteak'],
  ['mos-1',     'chicken', 'كيلو دجاج مسحب', '1 kg Boneless Chicken', 600, 'boneless', 1],
  ['mos-h',     'chicken', 'نص كيلو دجاج مسحب', '½ kg Boneless Chicken', 300, 'boneless'],
  ['mos-q',     'chicken', 'ربع كيلو دجاج مسحب', '¼ kg Boneless Chicken', 150, 'boneless'],
  ['drum-1',    'chicken', 'كيلو دبوس مشوي على الفحم', '1 kg Chicken Drumsticks', 350, 'drum'],
  ['drum-h',    'chicken', 'نص كيلو دبوس مشوي على الفحم', '½ kg Chicken Drumsticks', 175, 'drum'],
  ['wing-1',    'chicken', 'كيلو جناح على الفحم', '1 kg Chicken Wings', 300, 'wings'],
  ['wing-h',    'chicken', 'نص كيلو جناح مشوي', '½ kg Chicken Wings', 150, 'wings'],

  ['s-kebab',   'sand', 'سندويش كباب', 'Kebab Sandwich', 100, 's-kebab'],
  ['s-fillet',  'sand', 'سندويش فيليه', 'Fillet Sandwich', 155, 's-fillet'],
  ['s-liver',   'sand', 'سندويش كبدة', 'Liver Sandwich', 130, 's-liver'],
  ['s-arayes',  'sand', 'سندويش عرايس', 'Arayes Sandwich', 70, 's-arayes'],
  ['s-shish',   'sand', 'سندويش شيش', 'Shish Tawook Sandwich', 80, 's-chicken'],
  ['s-steak',   'sand', 'سندويش ستيك', 'Steak Sandwich', 80, 's-chicken'],
  ['s-mos',     'sand', 'سندويش مسحب', 'Boneless Chicken Sandwich', 80, 's-chicken'],
  ['w-kebab',   'sand', 'سندويش راب كباب', 'Kebab Wrap', 160, 'w-kebab'],
  ['w-fillet',  'sand', 'سندويش راب فيليه', 'Fillet Wrap', 220, 'w-fillet'],
  ['w-liver',   'sand', 'سندويش راب كبدة', 'Liver Wrap', 190, 'w-fillet'],
  ['w-shish',   'sand', 'سندويش راب شيش', 'Shish Tawook Wrap', 130, 'w-shish'],
  ['w-steak',   'sand', 'سندويش راب ستيك', 'Steak Wrap', 130, 'w-steak'],
  ['w-mos',     'sand', 'سندويش راب مسحب', 'Boneless Chicken Wrap', 130, 'w-mos'],

  ['veg',       'salad', 'سلطة خضار', 'Fresh Vegetable Salad', 65, 'veg'],
  ['hot',       'salad', 'سلطة سخنة', 'Hot Salad', 65, 'hot'],
  ['dagga',     'salad', 'دقة غزاوية', 'Gazan Dukkah', 65, 'dagga'],
  ['hummus',    'salad', 'حمص', 'Hummus', 60, 'hummus'],
  ['tahini',    'salad', 'طحينة', 'Tahini', 50, 'tahini'],
  ['mutabal',   'salad', 'متبل باذنجان', 'Smoky Eggplant Moutabal', 65, 'mutabal'],
  ['toum',      'salad', 'ثومية', 'Garlic Sauce', 40, 'toum'],
  ['corn',      'salad', 'ذرة بالمايونيز', 'Corn with Mayonnaise', 65, 'corn'],
  ['coleslaw',  'salad', 'كولسلو', 'Coleslaw', 65, 'coleslaw'],
  ['cabbage',   'salad', 'كرنب أحمر بالمايونيز', 'Red Cabbage with Mayonnaise', 65, 'cabbage'],
  ['turkish',   'salad', 'سلطة تركية', 'Turkish Salad', 65, 'turkish'],
  ['rice',      'salad', 'طبق أرز', 'Rice', 50, 'rice'],
  ['fries',     'salad', 'بطاطس', 'Fries', 50, 'fries'],
  ['pickles',   'salad', 'مخللات', 'Pickles', 35, 'pickles'],
  ['bread',     'salad', 'خبز مخصوص', 'Special Bread', 4, 'bread'],
  ['saj',       'salad', 'صاج سوري', 'Syrian Saj Bread', 6, 'saj'],

  ['kunafa',    'kunafa', 'كنافة', 'Kunafa', 120, 'kunafa', 1],

  ['soda',      'drinks', 'مشروبات غازية', 'Soft Drinks', 20, 'soda'],
  ['ayran',     'drinks', 'لبن عيران', 'Ayran', 30, 'ayran'],
  ['water-s',   'drinks', 'مياه صغيرة', 'Small Bottled Water', 15, 'water'],
  ['water-l',   'drinks', 'مياه كبيرة', 'Large Bottled Water', 25, 'water'],
  ['yogurt',    'drinks', 'زبادي', 'Yogurt', 20, 'yogurt']
];

/* Size groups: items sharing a photo in these cats show as ONE card with a size picker */
window.SH_GROUPS = {
  kebab:    { ar: 'كباب', en: 'Kebab' },
  fillet:   { ar: 'فيليه', en: 'Beef Fillet' },
  liver:    { ar: 'كبدة مشوية', en: 'Grilled Liver' },
  chops:    { ar: 'ريش', en: 'Lamb Chops' },
  chicken:  { ar: 'دجاج على الفحم', en: 'Charcoal Chicken' },
  shish:    { ar: 'شيش طاووق', en: 'Shish Tawook' },
  csteak:   { ar: 'ستيك دجاج على الفحم', en: 'Charcoal Chicken Steak' },
  boneless: { ar: 'دجاج مسحب', en: 'Boneless Chicken' },
  drum:     { ar: 'دبوس مشوي على الفحم', en: 'Chicken Drumsticks' },
  wings:    { ar: 'جناح على الفحم', en: 'Chicken Wings' },
  water:    { ar: 'مياه معدنية', en: 'Bottled Water' }
};
window.SH_SIZES = {
  '1': { ar: 'كيلو', en: '1 kg' },
  'h': { ar: 'نص كيلو', en: '½ kg' },
  'q': { ar: 'ربع كيلو', en: '¼ kg' },
  'w': { ar: 'كاملة', en: 'Whole' },
  'chicken-h': { ar: 'نص فرخة', en: 'Half' },
  's': { ar: 'صغيرة', en: 'Small' },
  'l': { ar: 'كبيرة', en: 'Large' }
};
