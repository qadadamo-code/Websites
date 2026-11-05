/* Tablia Catering — real menu data (from their Facebook menus, Nov 2026) */
window.TB = {
  wa: '201203101104',            // TEMP: Planet WhatsApp
  phone: '+201203101104',
  email: 'info@theplanetco.com',

  // قائمة الوجبات اليومية
  meals: [
    { id: 1,  img: 1,  price: 75,  ar: 'محشي مشكل وكفتة', en: 'Mixed Mahshi & Kofta',
      inc: { ar: ['محشي مشكل', '2 كفتة', 'استربس', 'مخلل', 'عيش', 'حلو'], en: ['Mixed mahshi', '2 kofta', 'Strips', 'Pickles', 'Bread', 'Dessert'] }, tag: 'fav' },
    { id: 2,  img: 2,  price: 75,  ar: 'كبدة', en: 'Liver Plate',
      inc: { ar: ['كبدة', 'أرز', 'طحينة', 'عيش', 'حلو', 'مخلل'], en: ['Liver', 'Rice', 'Tahini', 'Bread', 'Dessert', 'Pickles'] } },
    { id: 3,  img: 3,  price: 75,  ar: 'سجق شرقي', en: 'Oriental Sausage',
      inc: { ar: ['سجق شرقي', 'أرز', 'طحينة', 'مخلل', 'عيش', 'حلو'], en: ['Oriental sausage', 'Rice', 'Tahini', 'Pickles', 'Bread', 'Dessert'] } },
    { id: 4,  img: 4,  price: 75,  ar: 'كفتة داود باشا', en: 'Dawood Basha Kofta',
      inc: { ar: ['كفتة داود باشا', 'أرز', 'طحينة', 'مخلل', 'عيش', 'حلو'], en: ['Dawood Basha meatballs', 'Rice', 'Tahini', 'Pickles', 'Bread', 'Dessert'] } },
    { id: 5,  img: 5,  price: 75,  ar: 'ممبار ومكرونة', en: 'Mombar & Pasta',
      inc: { ar: ['ممبار', 'مكرونة بالصلصة', '2 استربس', 'عيش', 'مخلل', 'حلو'], en: ['Mombar', 'Pasta in tomato sauce', '2 strips', 'Bread', 'Pickles', 'Dessert'] } },
    { id: 6,  img: 6,  price: 80,  ar: 'فراخ بانيه', en: 'Chicken Pané',
      inc: { ar: ['فراخ بانيه', 'أرز', 'خضار', 'عيش', 'مخلل', 'حلو'], en: ['Chicken pané', 'Rice', 'Vegetable stew', 'Bread', 'Pickles', 'Dessert'] } },
    { id: 7,  img: 7,  price: 90,  ar: 'شاورما فراخ', en: 'Chicken Shawarma',
      inc: { ar: ['شاورما فراخ', 'أرز', 'طحينة', 'مخلل', 'عيش', 'حلو'], en: ['Chicken shawarma', 'Rice', 'Tahini', 'Pickles', 'Bread', 'Dessert'] } },
    { id: 8,  img: 8,  price: 125, ar: 'ربع فرخة وملوخية', en: 'Quarter Chicken & Molokhia',
      inc: { ar: ['ربع فرخة', 'أرز', 'ملوخية', 'مخلل', 'عيش', 'حلو'], en: ['Quarter chicken', 'Rice', 'Molokhia', 'Pickles', 'Bread', 'Dessert'] }, tag: 'fav' },
    { id: 9,  img: 9,  price: 125, ar: 'ثمن كفتة', en: 'Kofta (⅛ kg)',
      inc: { ar: ['ثمن كفتة', 'أرز', 'خضار', 'مخلل', 'عيش', 'حلو'], en: ['⅛ kg kofta', 'Rice', 'Vegetable stew', 'Pickles', 'Bread', 'Dessert'] } },
    { id: 10, img: 10, price: 145, ar: 'ربع فرخة و2 كفتة', en: 'Chicken & Kofta Mix',
      inc: { ar: ['ربع فرخة', '2 كفتة', '⅛ أرز', 'خضار', 'عيش', 'حلو'], en: ['Quarter chicken', '2 kofta', 'Rice', 'Vegetable stew', 'Bread', 'Dessert'] } },
    { id: 11, img: 11, price: 200, ar: 'طاجن لحمة بالخضار', en: 'Beef & Vegetable Tagine',
      inc: { ar: ['طاجن لحمة بالخضار', 'أرز', 'مخلل', 'عيش', 'حلو'], en: ['Beef & veg tagine', 'Rice', 'Pickles', 'Bread', 'Dessert'] }, tag: 'chef' },
    { id: 12, img: 12, price: 200, ar: 'نص فرخة محشية', en: 'Stuffed Half Chicken',
      inc: { ar: ['نص فرخة محشية', 'طاجن خضار', 'طحينة', 'مخلل', 'عيش', 'حلو'], en: ['Stuffed half chicken', 'Vegetable tagine', 'Tahini', 'Pickles', 'Bread', 'Dessert'] }, tag: 'chef' }
  ],

  addons: [
    { id: 'a1', ar: 'محشي مشكل', en: 'Mixed mahshi', price: 50 },
    { id: 'a2', ar: 'ممبار', en: 'Mombar', price: 50 },
    { id: 'a3', ar: 'خضار', en: 'Vegetable stew', price: 25 },
    { id: 'a4', ar: 'طحينة', en: 'Tahini', price: 10 },
    { id: 'a5', ar: 'مخلل', en: 'Pickles', price: 10 }
  ],

  // وجبات الخير
  khair: [
    { id: 'k1', price: 50, ar: '2 كفتة', en: '2 Kofta', inc: { ar: 'أرز + سلطة + عيش', en: 'Rice + salad + bread' } },
    { id: 'k2', price: 50, ar: '2 كبدة بالردة', en: '2 Liver (bran bread)', inc: { ar: 'أرز + سلطة + عيش', en: 'Rice + salad + bread' } },
    { id: 'k3', price: 65, ar: 'سجق شرقي', en: 'Oriental Sausage', inc: { ar: 'أرز + سلطة + عيش', en: 'Rice + salad + bread' } },
    { id: 'k4', price: 65, ar: 'كبدة اسكندراني', en: 'Alexandrian Liver', inc: { ar: 'أرز + سلطة + عيش', en: 'Rice + salad + bread' } },
    { id: 'k5', price: 85, ar: '4 كفتة', en: '4 Kofta', inc: { ar: 'أرز + سلطة + عيش', en: 'Rice + salad + bread' } },
    { id: 'k6', price: 85, ar: '2 بانيه', en: '2 Chicken Pané', inc: { ar: 'مكرونة + سلطة + عيش', en: 'Pasta + salad + bread' } },
    { id: 'k7', price: 85, ar: 'ربع فرخة', en: 'Quarter Chicken', inc: { ar: 'أرز + سلطة + عيش', en: 'Rice + salad + bread' } }
  ],

  // باكدجات المناسبات (سعر الفرد)
  events: {
    hightea: [
      { name: { ar: 'هاي تي 1', en: 'High Tea 1' }, price: 125,
        groups: [
          { t: { ar: 'القسم الرئيسي', en: 'Main' }, i: { ar: ['ساندوتش كفتة', 'ساندوتش بانيه', 'قطعة ميني بيتزا', 'باتون سالية'], en: ['Kofta sandwich', 'Pané sandwich', 'Mini pizza', 'Baton salé'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['2 قطعة سواريه'], en: ['2 soirée pieces'] } } ] },
      { name: { ar: 'هاي تي 2', en: 'High Tea 2' }, price: 160,
        groups: [
          { t: { ar: 'القسم الرئيسي', en: 'Main' }, i: { ar: ['ساندوتش كفتة', 'ساندوتش بانيه', 'ساندوتش برجر', 'سمبوسك جبنة', 'ميني بيتزا'], en: ['Kofta sandwich', 'Pané sandwich', 'Burger sandwich', 'Cheese sambousek', 'Mini pizza'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['قطعة جاتوه'], en: ['Gateau slice'] } } ] },
      { name: { ar: 'هاي تي 3', en: 'High Tea 3' }, price: 180,
        groups: [
          { t: { ar: 'القسم الرئيسي', en: 'Main' }, i: { ar: ['ساندوتش كفتة', 'ساندوتش بانيه', 'ساندوتش لحمة باردة', 'قطعة ميني باتيه', 'قطعة ميني بيتزا', 'باتون سالية'], en: ['Kofta sandwich', 'Pané sandwich', 'Cold cuts sandwich', 'Mini pâté', 'Mini pizza', 'Baton salé'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['قطعة جاتوه'], en: ['Gateau slice'] } } ] }
    ],
    set: [
      { name: { ar: 'سِت منيو 220', en: 'Set Menu 220' }, price: 220,
        groups: [
          { t: { ar: 'الأطباق الرئيسية', en: 'Mains' }, i: { ar: ['قطعة كفتة لحم', 'قطعة شيش طاووق', 'سمبوسك جبنة', 'ورق عنب', 'أرز بالخلطة'], en: ['Beef kofta', 'Shish tawook', 'Cheese sambousek', 'Vine leaves', 'Spiced rice'] } },
          { t: { ar: 'السلطات', en: 'Salads' }, i: { ar: ['مخلل', 'كولسلو', 'بابا غنوج', 'طحينة'], en: ['Pickles', 'Coleslaw', 'Baba ghanoush', 'Tahini'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['حلويات شرقية', 'جاتوه سواريه'], en: ['Oriental sweets', 'Gateau soirée'] } } ] },
      { name: { ar: 'سِت منيو 235', en: 'Set Menu 235' }, price: 235, min: 100,
        groups: [
          { t: { ar: 'الأطباق الرئيسية', en: 'Mains' }, i: { ar: ['بيكاتا فراخ', 'أرز أبيض', '2 كفتة مشوية', 'قطعة شيش طاووق', 'ورق عنب', 'سمبوسك جبنة'], en: ['Chicken piccata', 'White rice', '2 grilled kofta', 'Shish tawook', 'Vine leaves', 'Cheese sambousek'] } },
          { t: { ar: 'السلطات', en: 'Salads' }, i: { ar: ['مخلل', 'كولسلو', 'بابا غنوج', 'طحينة'], en: ['Pickles', 'Coleslaw', 'Baba ghanoush', 'Tahini'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['كريم كراميل'], en: ['Crème caramel'] } } ] },
      { name: { ar: 'سِت منيو 250', en: 'Set Menu 250' }, price: 250,
        groups: [
          { t: { ar: 'الأطباق الرئيسية', en: 'Mains' }, i: { ar: ['ربع فرخة مخلية', '2 قطعة كفتة مشوية', 'شريحة لحم بيكاتا', 'سمبوسك جبنة', 'سبرنج رول', 'أرز بالخلطة'], en: ['Deboned quarter chicken', '2 grilled kofta', 'Beef piccata', 'Cheese sambousek', 'Spring roll', 'Spiced rice'] } },
          { t: { ar: 'السلطات', en: 'Salads' }, i: { ar: ['طحينة', 'بابا غنوج', 'كولسلو', 'مخلل'], en: ['Tahini', 'Baba ghanoush', 'Coleslaw', 'Pickles'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['حلويات شرقية', 'جاتوه سواريه'], en: ['Oriental sweets', 'Gateau soirée'] } } ] },
      { name: { ar: 'سِت منيو 270', en: 'Set Menu 270' }, price: 270, min: 100, note: { ar: 'السعر شامل الأطباق والشوك والسكاكين والكاسات والشيفات', en: 'Includes plates, cutlery, glasses and chafing dishes' },
        groups: [
          { t: { ar: 'الأطباق الرئيسية', en: 'Mains' }, i: { ar: ['ربع فرخة مخلية', '2 قطعة كفتة مشوية على الفحم', 'شريحة صدور رومي', 'شريحة لحم باردة', 'محاشي مشكلة', 'سمبوسك لحمة', 'رز بسمتي بالمكسرات'], en: ['Deboned quarter chicken', '2 charcoal kofta', 'Turkey breast slice', 'Cold beef slice', 'Mixed mahshi', 'Meat sambousek', 'Basmati rice with nuts'] } },
          { t: { ar: 'السلطات', en: 'Salads' }, i: { ar: ['طحينة', 'بابا غنوج', 'كولسلو', 'مخلل'], en: ['Tahini', 'Baba ghanoush', 'Coleslaw', 'Pickles'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['أم علي'], en: ['Om Ali'] } } ] }
    ],
    buffet: [
      { name: { ar: 'أوبن بوفيه 370', en: 'Open Buffet 370' }, price: 370, min: 100,
        groups: [
          { t: { ar: 'الأطباق الرئيسية', en: 'Mains' }, i: { ar: ['بيكاتا بصوص الماشروم', 'شيش طاووق على الفحم', 'كفتة مشوية على الفحم', 'ديك رومي لكل 50 فرد مع أرز بالخلطة والمكسرات'], en: ['Piccata in mushroom sauce', 'Charcoal shish tawook', 'Charcoal kofta', 'Turkey per 50 guests with spiced rice & nuts'] } },
          { t: { ar: 'المقبلات', en: 'Starters' }, i: { ar: ['محاشي مشكلة', 'ورق عنب', 'كوبية', 'مكرونة بشاميل أو لازانيا', 'سمبوسك لحمة/جبنة'], en: ['Mixed mahshi', 'Vine leaves', 'Kobeba', 'Béchamel pasta or lasagna', 'Meat/cheese sambousek'] } },
          { t: { ar: 'السلطات', en: 'Salads' }, i: { ar: ['كولسلو', 'بطاطس مايونيز', 'طحينة', 'تومية', 'باذنجان مخلل', 'فتوش', 'بابا غنوج', 'مخلل'], en: ['Coleslaw', 'Potato mayo', 'Tahini', 'Toumia', 'Pickled eggplant', 'Fattoush', 'Baba ghanoush', 'Pickles'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['حلويات شرقية', 'جاتوه سواريه', 'كريم كراميل', 'أو سرفيس أم علي بالمكسرات والقشطة'], en: ['Oriental sweets', 'Gateau soirée', 'Crème caramel', 'Or Om Ali station with nuts & cream'] } } ] },
      { name: { ar: 'أوبن بوفيه 410', en: 'Open Buffet 410' }, price: 410, min: 100,
        groups: [
          { t: { ar: 'الأطباق الرئيسية', en: 'Mains' }, i: { ar: ['بيكاتا بصوص الماشروم', 'داود باشا بالخضار', 'شيش طاووق على الفحم', 'كفتة مشوي على الفحم', 'فاهيتا فراخ', 'ديك رومي لكل 50 شخص مع أرز بالخلطة والمكسرات'], en: ['Piccata in mushroom sauce', 'Dawood Basha with veg', 'Charcoal shish tawook', 'Charcoal kofta', 'Chicken fajita', 'Turkey per 50 guests with spiced rice & nuts'] } },
          { t: { ar: 'المقبلات', en: 'Starters' }, i: { ar: ['محاشي مشكلة', 'ورق عنب', 'كوبية', 'مكرونة بشاميل أو لازانيا', 'سمبوسك لحمة/جبنة'], en: ['Mixed mahshi', 'Vine leaves', 'Kobeba', 'Béchamel pasta or lasagna', 'Meat/cheese sambousek'] } },
          { t: { ar: 'السلطات', en: 'Salads' }, i: { ar: ['كولسلو', 'بطاطس مايونيز', 'طحينة', 'تومية', 'باذنجان مخلل', 'فتوش', 'بابا غنوج', 'مخلل'], en: ['Coleslaw', 'Potato mayo', 'Tahini', 'Toumia', 'Pickled eggplant', 'Fattoush', 'Baba ghanoush', 'Pickles'] } },
          { t: { ar: 'الحلو', en: 'Dessert' }, i: { ar: ['حلويات شرقية', 'جاتوه سواريه', 'كريم كراميل', 'أو سرفيس أم علي بالمكسرات والقشطة'], en: ['Oriental sweets', 'Gateau soirée', 'Crème caramel', 'Or Om Ali station with nuts & cream'] } } ] }
    ]
  },

  finger: {
    a: [['فراخ جريل','Grilled chicken',35],['لحمة باردة','Cold cuts',35],['كلوب اسموك','Club smoked',35],['كفتة','Kofta',35],['برجر','Burger',35],['تونة','Tuna',35],['بانيه','Pané',35],['كريسبي','Crispy',35],['شاورما فراخ','Chicken shawarma',35],['جمبري كنافة','Kunafa shrimp',35],['اسبرنج أو تمبورا','Spring roll / tempura',35],['سموك سالمون','Smoked salmon',35],['تشيكن شاورما سوري','Syrian chicken shawarma',35],['تشيكن فاهيتا تورتيلا','Chicken fajita tortilla',35],['شيش طاووق','Shish tawook',35],['لحم بقري مشوي','Grilled beef',35],['فاهيتا فراخ تورتيلا','Fajita tortilla',40]],
    b: [['كرواسون سموك بيف','Smoked beef croissant',35],['سموك تركي','Smoked turkey',35],['شاورما لحمة سوري','Syrian beef shawarma',45],['روست بيف','Roast beef',45],['حواوشي','Hawawshi',45],['ورق عنب بدبس الرمان','Vine leaves, pomegranate',25],['باتيه جبنة','Cheese pâté',25],['كرواسون شيدر','Cheddar croissant',25],['كبيبة لحم','Meat kibbeh',15],['سمبوسك لحم','Meat sambousek',15],['سبرنج رول','Spring roll',15],['سمبوسك جبنة','Cheese sambousek',15],['قطعة جاتوه سواريه','Gateau soirée',20],['قطعة حلويات شرقي','Oriental sweet',6]],
    extra: [['استاند الساندوتشات','Sandwich stand',250],['الويتر','Waiter',450]]
  }
};
