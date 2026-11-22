/* مأكولات التيسير — بيانات الموقع
   ملاحظة: الأسعار والأرقام هنا مؤقتة (نموذج عرض) لحين استلام منيو العميل. */
window.TS_CONFIG = {
  whatsapp: '201203101104',          // مؤقت: رقم Planet
  phone: '01203101104',
  email: 'info@theplanetco.com',
  currency: ['ج.م', 'EGP'],
  deliveryFee: 15,
  freeDeliveryOver: 400,
  openHour: 11, closeHour: 2,        // من 11 الصبح لـ 2 بالليل
  address: ['ديروط – أبو جبل، شارع 30، بجوار أورنج – أسيوط', 'Abu Gabal, 30th St. (next to Orange), Dairut – Assiut'],
  map: 'https://maps.google.com/?q=Abu+Gabal+Square+Dairut+Assiut',
  promo: { TAYSEER10: 0.10, EASY15: 0.15, FAMILY20: 0.20 }
};

window.TS_CATS = [
  { id: 'shawarma', ico: '🥙', n: ['شاورما', 'Shawarma'], s: ['سوري على أصوله', 'Syrian, the real way'], img: 'shawarma', glow: '#ff9f1c' },
  { id: 'crepe', ico: '🌯', n: ['كريب', 'Crêpe'], s: ['حادق وحلو', 'Savory & sweet'], img: 'crepe', glow: '#ffc93c' },
  { id: 'pizza', ico: '🍕', n: ['بيتزا', 'Pizza'], s: ['شرقي وغربي', 'Eastern & Western'], img: 'pizza', glow: '#ff6b35' },
  { id: 'feteer', ico: '🥧', n: ['فطائر', 'Feteer'], s: ['مشلتت وحشوات', 'Flaky Egyptian pies'], img: 'feteer', glow: '#f4a261' },
  { id: 'sandwich', ico: '🍔', n: ['ساندوتشات', 'Sandwiches'], s: ['لكل وقت ومزاج', 'For every mood'], img: 'burger', glow: '#ffb703' },
  { id: 'grill', ico: '🔥', n: ['مشويات', 'Charcoal Grill'], s: ['على الفحم', 'Over real charcoal'], img: 'grill', glow: '#e85d04' },
  { id: 'meals', ico: '🍱', n: ['وجبات وعروض', 'Meals & Combos'], s: ['للفرد وللمّة', 'Solo & family'], img: 'tray', glow: '#ffd166' },
  { id: 'sides', ico: '🍟', n: ['إضافات ومشروبات', 'Sides & Drinks'], s: ['تكمّل الطلب', 'Complete the order'], img: 'drinks', glow: '#ffe066' }
];

const S = (ar, en, p) => [ar, en, p];
window.TS_MENU = [
  // شاورما
  { id: 'sh1', cat: 'shawarma', img: 'shawarma', tag: 'best', n: ['شاورما فراخ سوري', 'Syrian Chicken Shawarma'], d: ['عيش صاج، ثومية، مخلل وبطاطس', 'Saj bread, toum, pickles & fries'], p: [S('عادي', 'Regular', 45), S('سوبر', 'Super', 65), S('تربل', 'Triple', 90)] },
  { id: 'sh2', cat: 'shawarma', img: 'shawarma', n: ['شاورما لحمة', 'Beef Shawarma'], d: ['لحمة متبلة، طحينة وبصل بالسماق', 'Spiced beef, tahini & sumac onion'], p: [S('عادي', 'Regular', 60), S('سوبر', 'Super', 85), S('تربل', 'Triple', 115)] },
  { id: 'sh3', cat: 'shawarma', img: 'arabi', tag: 'best', n: ['وجبة شاورما عربي', 'Shawarma Arabi Meal'], d: ['مقطّعة مربعات + بطاطس + ثومية + مخلل', 'Cut squares, fries, toum & pickles'], p: [S('فراخ', 'Chicken', 110), S('لحمة', 'Beef', 140)] },
  { id: 'sh4', cat: 'shawarma', img: 'arabi', n: ['فتة شاورما', 'Shawarma Fatteh'], d: ['عيش محمص، رز، شاورما وصوص الثوم', 'Crispy bread, rice, shawarma & garlic'], p: [S('فراخ', 'Chicken', 95), S('لحمة', 'Beef', 125)] },
  { id: 'sh5', cat: 'shawarma', img: 'shawarma', tag: 'new', n: ['ماريا شاورما', 'Maria Shawarma'], d: ['عيش محمص بالجبنة الموتزاريلا', 'Toasted wrap with melted mozzarella'], p: [S('فراخ', 'Chicken', 75), S('لحمة', 'Beef', 95)] },
  { id: 'sh6', cat: 'shawarma', img: 'shawarma', tag: 'hot', n: ['متر شاورما', 'Shawarma Meter'], d: ['متر كامل يكفي 4-6 أفراد، استخدم حاسبة المتر', '1 full meter for 4-6, try the meter tool'], p: 380 },

  // كريب
  { id: 'cr1', cat: 'crepe', img: 'crepe', tag: 'best', n: ['كريب فراخ بانيه', 'Chicken Pane Crêpe'], d: ['بانيه، موتزاريلا، فلفل وصوص', 'Breaded chicken, mozzarella, peppers'], p: 85 },
  { id: 'cr2', cat: 'crepe', img: 'crepe', n: ['كريب زنجر', 'Zinger Crêpe'], d: ['زنجر حار، شيدر وهالابينو', 'Spicy zinger, cheddar & jalapeño'], p: 90 },
  { id: 'cr3', cat: 'crepe', img: 'crepe', n: ['كريب شاورما', 'Shawarma Crêpe'], d: ['شاورما فراخ وثومية وبطاطس', 'Chicken shawarma, toum & fries'], p: 85 },
  { id: 'cr4', cat: 'crepe', img: 'crepe', n: ['كريب سجق وبسطرمة', 'Sausage & Pastrami Crêpe'], d: ['سجق بلدي، بسطرمة وموتزاريلا', 'Sausage, pastrami & mozzarella'], p: 80 },
  { id: 'cr5', cat: 'crepe', img: 'crepe', tag: 'hot', n: ['كريب التيسير ميكس', 'Tayseer Mix Crêpe'], d: ['بانيه + شاورما + كفتة + 3 أجبان', 'Pane + shawarma + kofta + 3 cheeses'], p: 120 },
  { id: 'cr6', cat: 'crepe', img: 'sweet', n: ['كريب نوتيلا موز', 'Nutella Banana Crêpe'], d: ['نوتيلا، موز وفراولة', 'Nutella, banana & strawberry'], p: 70 },
  { id: 'cr7', cat: 'crepe', img: 'sweet', n: ['كريب لوتس', 'Lotus Crêpe'], d: ['صوص لوتس وبسكويت مطحون', 'Lotus spread & crumbs'], p: 75 },

  // بيتزا
  { id: 'pz1', cat: 'pizza', img: 'pizza', tag: 'best', n: ['بيتزا مارجريتا', 'Margherita'], d: ['صوص طماطم وموتزاريلا', 'Tomato sauce & mozzarella'], p: [S('صغير', 'S', 70), S('وسط', 'M', 100), S('كبير', 'L', 135)] },
  { id: 'pz2', cat: 'pizza', img: 'pizza', n: ['بيتزا بيبروني', 'Pepperoni'], d: ['بيبروني بقري وموتزاريلا', 'Beef pepperoni & mozzarella'], p: [S('صغير', 'S', 90), S('وسط', 'M', 125), S('كبير', 'L', 165)] },
  { id: 'pz3', cat: 'pizza', img: 'pizza', n: ['بيتزا فراخ رانش', 'Chicken Ranch'], d: ['فراخ مشوية، رانش ومشروم', 'Grilled chicken, ranch & mushroom'], p: [S('صغير', 'S', 95), S('وسط', 'M', 130), S('كبير', 'L', 170)] },
  { id: 'pz4', cat: 'pizza', img: 'pizza', tag: 'hot', n: ['بيتزا شرقي سجق', 'Eastern Sausage Pizza'], d: ['عجينة شرقي، سجق، فلفل وطماطم', 'Eastern dough, sausage & peppers'], p: [S('صغير', 'S', 80), S('وسط', 'M', 110), S('كبير', 'L', 145)] },
  { id: 'pz5', cat: 'pizza', img: 'pizza', n: ['بيتزا سي فود', 'Seafood Pizza'], d: ['جمبري، كاليماري وتونة', 'Shrimp, calamari & tuna'], p: [S('وسط', 'M', 170), S('كبير', 'L', 220)] },
  { id: 'pz6', cat: 'pizza', img: 'pizza', n: ['بيتزا 4 أجبان', 'Four Cheese'], d: ['موتزاريلا، شيدر، رومي وريكفورد', 'Mozzarella, cheddar, roumy & blue'], p: [S('صغير', 'S', 95), S('وسط', 'M', 130), S('كبير', 'L', 170)] },

  // فطائر
  { id: 'ft1', cat: 'feteer', img: 'feteer', tag: 'best', n: ['فطير مشلتت', 'Feteer Meshaltet'], d: ['بالسمنة البلدي مع عسل وجبنة', 'Ghee layers with honey & cheese'], p: [S('صغير', 'S', 70), S('كبير', 'L', 120)] },
  { id: 'ft2', cat: 'feteer', img: 'feteer', n: ['فطير لحمة مفرومة', 'Minced Beef Feteer'], d: ['لحمة، بصل وفلفل وموتزاريلا', 'Beef, onion, peppers & mozzarella'], p: [S('صغير', 'S', 90), S('كبير', 'L', 150)] },
  { id: 'ft3', cat: 'feteer', img: 'feteer', n: ['فطير سجق وجبنة', 'Sausage & Cheese Feteer'], d: ['سجق بلدي وجبنة رومي', 'Sausage & roumy cheese'], p: [S('صغير', 'S', 80), S('كبير', 'L', 135)] },
  { id: 'ft4', cat: 'feteer', img: 'feteer', n: ['فطير حلو بالقشطة', 'Sweet Feteer with Cream'], d: ['قشطة، عسل وسكر بودرة', 'Cream, honey & powdered sugar'], p: [S('صغير', 'S', 75), S('كبير', 'L', 125)] },

  // ساندوتشات
  { id: 'sw1', cat: 'sandwich', img: 'burger', tag: 'best', n: ['دبل تشيز برجر', 'Double Cheeseburger'], d: ['2 بيف 150 جم، شيدر وصوص التيسير', '2 beef patties, cheddar & house sauce'], p: 110 },
  { id: 'sw2', cat: 'sandwich', img: 'burger', n: ['كلاسيك برجر', 'Classic Burger'], d: ['بيف، خس، طماطم ومخلل', 'Beef, lettuce, tomato & pickles'], p: 75 },
  { id: 'sw3', cat: 'sandwich', img: 'drumstick', tag: 'hot', n: ['زنجر سوبريم', 'Zinger Supreme'], d: ['صدر فراخ حار مقرمش وجبنة', 'Crispy spicy chicken & cheese'], p: 80 },
  { id: 'sw4', cat: 'sandwich', img: 'sandwich', n: ['كفتة مشوية', 'Grilled Kofta'], d: ['عيش بلدي محمص، طحينة ومخلل', 'Toasted baladi bread, tahini'], p: 45 },
  { id: 'sw5', cat: 'sandwich', img: 'sandwich', n: ['كبدة إسكندراني', 'Alexandrian Liver'], d: ['كبدة بالفلفل الحار والليمون', 'Liver with chili & lemon'], p: 40 },
  { id: 'sw6', cat: 'sandwich', img: 'sandwich', n: ['سجق بلدي', 'Egyptian Sausage'], d: ['سجق بالفلفل والطماطم', 'Sausage with peppers & tomato'], p: 40 },
  { id: 'sw7', cat: 'sandwich', img: 'sandwich', n: ['فراخ بانيه', 'Chicken Pane'], d: ['بانيه، خس ومايونيز', 'Pane, lettuce & mayo'], p: 55 },

  // مشويات
  { id: 'gr1', cat: 'grill', img: 'grill', tag: 'best', n: ['كفتة على الفحم', 'Charcoal Kofta'], d: ['بالكيلو، معاها عيش وسلطات وطحينة', 'By weight, with bread, salads & tahini'], p: [S('ربع', '¼ kg', 120), S('نص', '½ kg', 230), S('كيلو', '1 kg', 450)] },
  { id: 'gr2', cat: 'grill', img: 'grill', n: ['شيش طاووق', 'Shish Tawook'], d: ['صدور متبلة بالزبادي والثوم', 'Yogurt-garlic marinated chicken'], p: [S('ربع', '¼ kg', 100), S('نص', '½ kg', 190), S('كيلو', '1 kg', 370)] },
  { id: 'gr3', cat: 'grill', img: 'grill', n: ['كباب ضاني', 'Lamb Kebab'], d: ['قطع ضاني مشوية على الفحم', 'Charcoal grilled lamb cubes'], p: [S('ربع', '¼ kg', 170), S('نص', '½ kg', 330), S('كيلو', '1 kg', 650)] },
  { id: 'gr4', cat: 'grill', img: 'grill', tag: 'hot', n: ['ريش ضاني', 'Lamb Chops'], d: ['ريش متبلة على الفحم', 'Marinated charcoal lamb chops'], p: [S('ربع', '¼ kg', 190), S('نص', '½ kg', 370), S('كيلو', '1 kg', 720)] },
  { id: 'gr5', cat: 'grill', img: 'grill', n: ['فرخة مشوية على الفحم', 'Charcoal Chicken'], d: ['بالأرز والسلطات والثومية', 'With rice, salads & toum'], p: [S('نص', 'Half', 120), S('كاملة', 'Whole', 220)] },
  { id: 'gr6', cat: 'grill', img: 'grill', n: ['مشكل مشويات', 'Mixed Grill'], d: ['كفتة + طاووق + كباب + ريش', 'Kofta, tawook, kebab & chops'], p: [S('فرد', 'Solo', 200), S('عائلي', 'Family', 750)] },

  // وجبات وعروض
  { id: 'ml1', cat: 'meals', img: 'tray', tag: 'best', n: ['وجبة عم تيسير', 'Uncle Tayseer Meal'], d: ['الوجبة الأشهر: شاورما عربي + كفتة + بطاطس + مشروب', 'The icon: arabi + kofta + fries + drink'], p: 160 },
  { id: 'ml2', cat: 'meals', img: 'tray', tag: 'hot', n: ['صينية اللمة (4-5 أفراد)', 'Gathering Tray (4-5)'], d: ['بيتزا وسط + شاورما عربي + كفتة + طاووق + كريب + بطاطس', 'Pizza, arabi, kofta, tawook, crêpe, fries'], p: 650 },
  { id: 'ml3', cat: 'meals', img: 'burger-set', n: ['كومبو برجر', 'Burger Combo'], d: ['برجر + بطاطس + بيبسي', 'Burger, fries & soda'], p: 105 },
  { id: 'ml4', cat: 'meals', img: 'burger-set', n: ['كومبو كرسبي', 'Crispy Combo'], d: ['3 قطع دجاج + بطاطس + كول سلو + بيبسي', '3 pcs chicken, fries, coleslaw, soda'], p: 135 },
  { id: 'ml5', cat: 'meals', img: 'pizza', n: ['عرض 2 بيتزا وسط', '2 Medium Pizzas'], d: ['أي 2 بيتزا وسط من الكلاسيك', 'Any 2 classic medium pizzas'], p: 199 },

  // إضافات ومشروبات
  { id: 'sd1', cat: 'sides', img: 'fries', n: ['بطاطس', 'Fries'], d: ['مقرمشة ومملحة', 'Crispy & salted'], p: [S('صغير', 'S', 20), S('كبير', 'L', 35)] },
  { id: 'sd2', cat: 'sides', img: 'drinks', n: ['بطاطس بالجبنة', 'Cheese Fries'], d: ['صوص شيدر سخن', 'Hot cheddar sauce'], p: 40 },
  { id: 'sd3', cat: 'sides', img: 'drinks', n: ['عصير مانجا فريش', 'Fresh Mango'], d: ['مانجا طبيعي', 'Natural mango'], p: 35 },
  { id: 'sd4', cat: 'sides', img: 'drinks', n: ['ليمون نعناع', 'Lemon Mint'], d: ['منعش ومثلج', 'Iced & refreshing'], p: 30 },
  { id: 'sd5', cat: 'sides', img: 'drinks', n: ['بيبسي / سفن', 'Soft Drink'], d: ['كانز', 'Can'], p: 20 },
  { id: 'sd6', cat: 'sides', img: 'fries', n: ['ثومية إضافية', 'Extra Toum'], d: ['صوص الثوم السوري', 'Syrian garlic sauce'], p: 10 }
];

/* عجلة الحظ: الجوائز */
window.TS_PRIZES = [
  { ar: 'خصم 10%', en: '10% OFF', code: 'TAYSEER10' },
  { ar: 'بطاطس هدية', en: 'Free Fries', code: 'FRIES' },
  { ar: 'خصم 15%', en: '15% OFF', code: 'EASY15' },
  { ar: 'توصيل مجاني', en: 'Free Delivery', code: 'FREEDEL' },
  { ar: 'مشروب هدية', en: 'Free Drink', code: 'DRINK' },
  { ar: 'خصم 10%', en: '10% OFF', code: 'TAYSEER10' },
  { ar: 'ثومية هدية', en: 'Free Toum', code: 'TOUM' },
  { ar: 'خصم 20% للعيلة', en: '20% Family', code: 'FAMILY20' }
];
