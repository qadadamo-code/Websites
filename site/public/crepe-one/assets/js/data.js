/* Crepe One – sample data. ALL PRICES ARE SAMPLE (EGP) until the client sends the real menu. */
window.CO_CONFIG = {
  whatsapp: '201203101104',          // Planet number (temporary for the sample)
  phone: '01203101104',
  email: 'info@theplanetco.com',
  hours: { ar: 'يوميا من 12 الظهر لـ 3 الفجر', en: 'Daily, 12 PM – 3 AM' },
  address: { ar: 'العنوان يضاف بعد تأكيد العميل', en: 'Address to be added by the client' },
  maps: 'https://maps.google.com/?q=Crepe+One',
  delivery: 20, freeOver: 400
};

window.CO_SIZES = { ar: ['صغير', 'وسط', 'كبير'], en: ['S', 'M', 'L'] };

/* p: one price, or [S, M, L] for pizzas */
window.CO_MENU = [
  { id: 'signature', ar: 'سيجنتشر Crepe One', en: 'Crepe One Signatures', sar: 'الأصناف اللي اتعرفنا بيها', sen: 'The ones we are known for', img: 'pizza-crepe',
    items: [
      { ar: 'بيتزا كريب', en: 'Pizza Crepe', p: 165, tag: 'hot', dar: 'كريب محشي صوص بيتزا وموتزاريلا وبيبروني وزيتون', den: 'Crepe stuffed with pizza sauce, mozzarella, pepperoni & olives' },
      { ar: 'كريب وان سبيشيال', en: 'Crepe One Special', p: 185, tag: 'chef', dar: 'فراخ بانيه وكفتة وسجق مع 3 أنواع جبن', den: 'Crispy chicken, kofta & sausage with 3 cheeses' },
      { ar: 'كريب بوكس', en: 'Crepe Box', p: 265, dar: '2 كريب حادق + بطاطس + مشروب', den: '2 savory crepes + fries + drink' },
      { ar: 'ميني كريب حلو (8 قطع)', en: 'Mini Sweet Crepes (8 pcs)', p: 145, dar: 'نوتيلا ولوتس وبستاشيو', den: 'Nutella, Lotus & pistachio' }
    ] },
  { id: 'savory', ar: 'كريب حادق', en: 'Savory Crepes', sar: 'على الصاج قدامك', sen: 'Made on the griddle in front of you', img: 'crepe-chicken',
    items: [
      { ar: 'كريب فراخ بانيه', en: 'Crispy Chicken Crepe', p: 135 },
      { ar: 'كريب زنجر', en: 'Zinger Crepe', p: 145, tag: 'hot' },
      { ar: 'كريب شاورما فراخ', en: 'Chicken Shawarma Crepe', p: 140 },
      { ar: 'كريب كرسبي رانش', en: 'Crispy Ranch Crepe', p: 150 },
      { ar: 'كريب كفتة', en: 'Kofta Crepe', p: 150 },
      { ar: 'كريب سجق', en: 'Sausage Crepe', p: 130 },
      { ar: 'كريب بسطرمة', en: 'Pastrami Crepe', p: 145 },
      { ar: 'كريب هوت دوج', en: 'Hot Dog Crepe', p: 120 },
      { ar: 'كريب تونة', en: 'Tuna Crepe', p: 125 },
      { ar: 'كريب 4 جبن', en: '4 Cheese Crepe', p: 130 },
      { ar: 'كريب ميكس لحوم', en: 'Mixed Meat Crepe', p: 175 },
      { ar: 'كريب جمبري', en: 'Shrimp Crepe', p: 215 }
    ] },
  { id: 'sweet', ar: 'كريب حلو', en: 'Sweet Crepes', sar: 'نهاية تليق بيك', sen: 'A sweet ending', img: 'crepe-nutella',
    items: [
      { ar: 'كريب نوتيلا', en: 'Nutella Crepe', p: 95 },
      { ar: 'نوتيلا موز', en: 'Nutella Banana', p: 110 },
      { ar: 'نوتيلا فراولة', en: 'Nutella Strawberry', p: 115, tag: 'hot' },
      { ar: 'كريب لوتس', en: 'Lotus Crepe', p: 115 },
      { ar: 'لوتس آيس كريم', en: 'Lotus Ice Cream', p: 135 },
      { ar: 'كريب بستاشيو', en: 'Pistachio Crepe', p: 145 },
      { ar: 'كريب كيندر', en: 'Kinder Crepe', p: 130 },
      { ar: 'ميكس شوكولاتة', en: 'Mixed Chocolate', p: 120 },
      { ar: 'ريد فيلفت', en: 'Red Velvet', p: 125 }
    ] },
  { id: 'pizza', ar: 'بيتزا', en: 'Pizza', sar: 'من الفرن على طول', sen: 'Straight from the oven', img: 'pizzas', sized: true,
    items: [
      { ar: 'مارجريتا', en: 'Margherita', p: [110, 150, 195] },
      { ar: 'خضروات', en: 'Vegetables', p: [120, 165, 210] },
      { ar: 'بيبروني', en: 'Pepperoni', p: [150, 205, 260], tag: 'hot' },
      { ar: 'فراخ باربكيو', en: 'BBQ Chicken', p: [155, 210, 265] },
      { ar: 'فراخ رانش', en: 'Chicken Ranch', p: [155, 210, 265] },
      { ar: 'سوبريم', en: 'Supreme', p: [160, 215, 275], tag: 'chef' },
      { ar: 'ميكس لحوم', en: 'Mixed Meat', p: [170, 230, 290] },
      { ar: '4 جبن', en: 'Four Cheese', p: [145, 195, 250] },
      { ar: 'هوت دوج', en: 'Hot Dog', p: [140, 190, 240] },
      { ar: 'سي فود', en: 'Seafood', p: [190, 255, 320] }
    ] },
  { id: 'sides', ar: 'جانبي', en: 'Sides', sar: 'مكمل كل طلب', sen: 'Completes every order', img: null,
    items: [
      { ar: 'بطاطس', en: 'Fries', p: 45 },
      { ar: 'بطاطس بالجبنة', en: 'Cheese Fries', p: 65 },
      { ar: 'ودجز', en: 'Wedges', p: 55 },
      { ar: 'موتزاريلا ستيكس', en: 'Mozzarella Sticks', p: 85 },
      { ar: 'أونيون رينجز', en: 'Onion Rings', p: 60 }
    ] },
  { id: 'drinks', ar: 'مشروبات', en: 'Drinks', sar: 'ساقعة وفريش', sen: 'Cold & fresh', img: null,
    items: [
      { ar: 'مياه', en: 'Water', p: 10 },
      { ar: 'كانز', en: 'Soft Drink', p: 25 },
      { ar: 'ليمون نعناع', en: 'Lemon Mint', p: 50 },
      { ar: 'برتقال فريش', en: 'Fresh Orange', p: 55 },
      { ar: 'آيس كوفي', en: 'Iced Coffee', p: 70 },
      { ar: 'ميلك شيك نوتيلا', en: 'Nutella Milkshake', p: 85 },
      { ar: 'ميلك شيك لوتس', en: 'Lotus Milkshake', p: 85 }
    ] }
];

/* Crepe builder */
window.CO_BUILDER = {
  savory: {
    base: 85,
    img: 'crepe-kofta',
    fill: [
      { ar: 'فراخ بانيه', en: 'Crispy chicken', p: 45 }, { ar: 'زنجر', en: 'Zinger', p: 50 }, { ar: 'شاورما', en: 'Shawarma', p: 45 },
      { ar: 'كفتة', en: 'Kofta', p: 50 }, { ar: 'سجق', en: 'Sausage', p: 35 }, { ar: 'بسطرمة', en: 'Pastrami', p: 45 },
      { ar: 'هوت دوج', en: 'Hot dog', p: 30 }, { ar: 'تونة', en: 'Tuna', p: 35 }, { ar: 'جمبري', en: 'Shrimp', p: 95 }
    ],
    extra: [
      { ar: 'موتزاريلا', en: 'Mozzarella', p: 20 }, { ar: 'شيدر', en: 'Cheddar', p: 20 }, { ar: 'رومي', en: 'Roumy', p: 20 },
      { ar: 'فلفل ألوان', en: 'Peppers', p: 10 }, { ar: 'مشروم', en: 'Mushroom', p: 15 }, { ar: 'زيتون', en: 'Olives', p: 10 },
      { ar: 'هالابينو', en: 'Jalapeño', p: 10 }, { ar: 'مخلل', en: 'Pickles', p: 5 }
    ],
    sauce: [{ ar: 'رانش', en: 'Ranch' }, { ar: 'باربكيو', en: 'BBQ' }, { ar: 'سبايسي', en: 'Spicy' }, { ar: 'طحينة', en: 'Tahini' }, { ar: 'ثومية', en: 'Garlic' }]
  },
  sweet: {
    base: 65,
    img: 'crepe-lotus',
    fill: [
      { ar: 'نوتيلا', en: 'Nutella', p: 35 }, { ar: 'لوتس', en: 'Lotus', p: 40 }, { ar: 'بستاشيو', en: 'Pistachio', p: 60 },
      { ar: 'كيندر', en: 'Kinder', p: 45 }, { ar: 'وايت شوكليت', en: 'White chocolate', p: 35 }, { ar: 'عسل', en: 'Honey', p: 20 }
    ],
    extra: [
      { ar: 'موز', en: 'Banana', p: 15 }, { ar: 'فراولة', en: 'Strawberry', p: 20 }, { ar: 'آيس كريم', en: 'Ice cream', p: 25 },
      { ar: 'بندق', en: 'Hazelnut', p: 20 }, { ar: 'أوريو', en: 'Oreo', p: 15 }, { ar: 'مارشميلو', en: 'Marshmallow', p: 15 }
    ],
    sauce: [{ ar: 'شوكولاتة', en: 'Chocolate' }, { ar: 'كراميل', en: 'Caramel' }, { ar: 'وايت', en: 'White' }, { ar: 'بدون', en: 'None' }]
  },
  fold: [
    { id: 'tri', ar: 'مثلث', en: 'Triangle' }, { id: 'cone', ar: 'كون', en: 'Cone' }, { id: 'roll', ar: 'رول', en: 'Roll' }, { id: 'box', ar: 'بوكس', en: 'Box' }
  ]
};
