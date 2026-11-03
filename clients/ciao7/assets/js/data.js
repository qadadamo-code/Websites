/* Ciao 7 Pizza — content & menu.
   Edit contacts in CIAO.config, prices/items in CIAO.menu. All prices in EGP. */
window.CIAO = {
  config: {
    whatsapp: '201203101104',          // TEMP: Planet number until the client sends theirs
    phone: '01203101104',
    phoneIntl: '+201203101104',
    hoursAr: 'يومياً من 12 ظهراً حتى 2 بعد منتصف الليل',
    hoursEn: 'Daily, 12 PM – 2 AM',
    addressAr: 'القاهرة — العنوان التفصيلي يضاف قريباً',
    addressEn: 'Cairo — full address coming soon',
    mapsUrl: 'https://maps.google.com/?q=Ciao+7+Pizza',
    instagram: '#', facebook: '#', tiktok: '#',
    deliveryFee: 25,
    luckyCode: 'CIAO7',               // roulette jackpot code (7% off). Set '' to disable.
    luckyPct: 7
  },

  sizes: {
    pizza: [
      { k: 'S', ar: 'صغير', en: 'Small', cm: 22 },
      { k: 'M', ar: 'وسط', en: 'Medium', cm: 28 },
      { k: 'L', ar: 'كبير', en: 'Large', cm: 34 }
    ]
  },
  crusts: [
    { k: 'classic', ar: 'عجينة كلاسيك', en: 'Classic crust', p: 0 },
    { k: 'thin', ar: 'رفيعة ومقرمشة', en: 'Thin & crispy', p: 0 },
    { k: 'stuffed', ar: 'حواف محشية جبنة', en: 'Cheese-stuffed edge', p: 35 }
  ],

  /* 8 slices of the menu wheel */
  cats: [
    { id: 'classic', ar: 'بيتزا كلاسيك', en: 'Classic Pizza', it: 'Le Classiche', color: '#d01f25', kind: 'pizza' },
    { id: 'special', ar: 'تشاو سبيشال', en: 'Ciao Specials', it: 'Le Speciali', color: '#f5a524', kind: 'pizza' },
    { id: 'pasta', ar: 'مكرونات', en: 'Pasta', it: 'La Pasta', color: '#f2d6a2', kind: 'pasta' },
    { id: 'feteer', ar: 'فطير حادق', en: 'Savory Feteer', it: 'Feteer Salato', color: '#e08a2e', kind: 'feteer' },
    { id: 'sweet', ar: 'فطير وبيتزا حلوة', en: 'Sweet Feteer & Pizza', it: 'I Dolci', color: '#8a4a2b', kind: 'sweet' },
    { id: 'starters', ar: 'مقبلات', en: 'Starters', it: 'Antipasti', color: '#3f8a2e', kind: 'starter' },
    { id: 'hot', ar: 'مشروبات ساخنة', en: 'Hot Drinks', it: 'Caldo', color: '#6b3a22', kind: 'hot' },
    { id: 'cold', ar: 'مشروبات باردة', en: 'Cold Drinks', it: 'Freddo', color: '#2fa39a', kind: 'cold' }
  ],

  /* t = toppings used to draw the pizza illustration
     p = single price, ps = [S,M,L] prices */
  menu: [
    // ---------- Classic ----------
    { id: 1, c: 'classic', ar: 'مارجريتا', en: 'Margherita', it: 'Margherita',
      dAr: 'صلصة طماطم مطهية ببطء، موتزاريلا طازجة، ريحان وزيت زيتون.', dEn: 'Slow-cooked tomato sauce, fresh mozzarella, basil and olive oil.',
      ps: [145, 195, 245], t: ['basil', 'mozz'], tag: 'veg' },
    { id: 2, c: 'classic', ar: 'بيبروني', en: 'Pepperoni', it: 'Pepperoni',
      dAr: 'شرائح بيبروني بقري سخية تتحمّص حوافها في الفرن فوق الموتزاريلا.', dEn: 'Generous beef pepperoni that crisps at the edges over mozzarella.',
      ps: [185, 245, 305], t: ['pepperoni', 'pepperoni'], tag: 'best' },
    { id: 3, c: 'classic', ar: 'خضار الحديقة', en: 'Garden Veggie', it: 'Ortolana',
      dAr: 'فلفل ألوان، مشروم، زيتون أسود، بصل وطماطم طازجة.', dEn: 'Bell peppers, mushrooms, black olives, onion and fresh tomato.',
      ps: [165, 215, 265], t: ['pepper', 'mushroom', 'olive', 'onion', 'tomato'], tag: 'veg' },
    { id: 4, c: 'classic', ar: 'الفصول الأربعة', en: 'Four Seasons', it: 'Quattro Stagioni',
      dAr: 'أربعة أرباع في بيتزا واحدة: مشروم، زيتون، فلفل، وبيبروني.', dEn: 'Four quarters in one pie: mushroom, olive, pepper and pepperoni.',
      ps: [195, 255, 315], t: ['mushroom', 'olive', 'pepper', 'pepperoni'] },
    { id: 5, c: 'classic', ar: 'أربع أجبان', en: 'Four Cheese', it: 'Quattro Formaggi',
      dAr: 'موتزاريلا، شيدر، بارميزان وجبنة زرقاء.. لعشّاق الجبنة فقط.', dEn: 'Mozzarella, cheddar, parmesan and blue cheese. For cheese lovers only.',
      ps: [205, 265, 325], t: ['mozz', 'cheddar', 'mozz'], tag: 'veg' },
    { id: 6, c: 'classic', ar: 'تونة', en: 'Tuna', it: 'Tonno',
      dAr: 'تونة قطع، بصل، زيتون أسود وفلفل أخضر.', dEn: 'Chunk tuna, onion, black olives and green pepper.',
      ps: [185, 240, 295], t: ['tuna', 'onion', 'olive'] },
    { id: 7, c: 'classic', ar: 'سجق شرقي', en: 'Oriental Sausage', it: 'Salsiccia',
      dAr: 'سجق شرقي متبّل، فلفل وطماطم، ولمسة شطة خفيفة.', dEn: 'Spiced oriental sausage, peppers, tomato and a light chili kick.',
      ps: [175, 230, 285], t: ['sausage', 'pepper', 'tomato'] },
    { id: 8, c: 'classic', ar: 'سوبر سوبريم', en: 'Super Supreme', it: 'Suprema',
      dAr: 'بيبروني، لحم مفروم، سجق، فلفل، مشروم وزيتون.. كل شيء في قطعة.', dEn: 'Pepperoni, minced beef, sausage, peppers, mushrooms and olives.',
      ps: [215, 285, 355], t: ['pepperoni', 'beef', 'sausage', 'pepper', 'mushroom', 'olive'], tag: 'best' },

    // ---------- Specials ----------
    { id: 11, c: 'special', ar: 'تشاو 7 الأصلية', en: 'The Ciao 7', it: 'La Sette',
      dAr: 'سبع إضافات في بيتزا واحدة: بيبروني، سجق، مشروم، فلفل، زيتون، ذرة، وريحان. توقيعنا.', dEn: 'Seven toppings, one pie: pepperoni, sausage, mushroom, pepper, olive, corn and basil. Our signature.',
      ps: [235, 305, 375], t: ['pepperoni', 'sausage', 'mushroom', 'pepper', 'olive', 'corn', 'basil'], tag: 'sig' },
    { id: 12, c: 'special', ar: 'باربكيو تشيكن', en: 'BBQ Chicken', it: 'Pollo BBQ',
      dAr: 'دجاج مشوي، بصل أحمر، صوص باربكيو مدخّن وموتزاريلا.', dEn: 'Grilled chicken, red onion, smoky BBQ sauce and mozzarella.',
      ps: [205, 270, 335], t: ['chicken', 'onion', 'bbq'], tag: 'best' },
    { id: 13, c: 'special', ar: 'تشيكن رانش', en: 'Chicken Ranch', it: 'Pollo Ranch',
      dAr: 'دجاج متبّل، مشروم، ذرة وصوص رانش كريمي.', dEn: 'Seasoned chicken, mushrooms, corn and creamy ranch.',
      ps: [205, 270, 335], t: ['chicken', 'mushroom', 'corn', 'ranch'] },
    { id: 14, c: 'special', ar: 'ديافولا الحارّة', en: 'Diavola', it: 'Diavola',
      dAr: 'بيبروني حار، هالابينو، شطة ورشة عسل حار. ليست للضعفاء!', dEn: 'Spicy pepperoni, jalapeño, chili and hot honey. Not for the faint-hearted!',
      ps: [215, 280, 345], t: ['pepperoni', 'jalapeno', 'chili'], tag: 'hot' },
    { id: 15, c: 'special', ar: 'سي فود', en: 'Frutti di Mare', it: 'Frutti di Mare',
      dAr: 'جمبري، كاليماري وتونة على صلصة طماطم بالثوم.', dEn: 'Shrimp, calamari and tuna over garlic tomato sauce.',
      ps: [265, 345, 425], t: ['shrimp', 'calamari', 'tuna', 'basil'] },
    { id: 16, c: 'special', ar: 'مشروم ترافل', en: 'Truffle Mushroom', it: 'Tartufo',
      dAr: 'صوص أبيض، مشروم سوتيه، زيت الكمأة وبارميزان.', dEn: 'White sauce, sautéed mushrooms, truffle oil and parmesan.',
      ps: [225, 295, 365], t: ['mushroom', 'mushroom', 'truffle'], white: 1, tag: 'veg' },
    { id: 17, c: 'special', ar: 'كالزوني', en: 'Calzone', it: 'Calzone',
      dAr: 'بيتزا مطوية محشوة لحم مفروم وموتزاريلا وفلفل، تُقدَّم بصلصة جانبية.', dEn: 'Folded pizza stuffed with minced beef, mozzarella and peppers, sauce on the side.',
      p: 210, t: ['beef', 'pepper'], calzone: 1 },

    // ---------- Pasta ----------
    { id: 21, c: 'pasta', ar: 'فيتوتشيني ألفريدو بالدجاج', en: 'Chicken Fettuccine Alfredo', it: 'Fettuccine Alfredo',
      dAr: 'صوص كريمة وبارميزان، دجاج مشوي وبقدونس.', dEn: 'Cream and parmesan sauce, grilled chicken and parsley.', p: 175, s: 'white', tag: 'best' },
    { id: 22, c: 'pasta', ar: 'بيني أرابياتا', en: 'Penne Arrabbiata', it: 'Penne all\'Arrabbiata',
      dAr: 'صلصة طماطم حارة بالثوم والشطة.', dEn: 'Spicy tomato sauce with garlic and chili.', p: 135, s: 'red', tag: 'hot' },
    { id: 23, c: 'pasta', ar: 'بيني بالصوص الوردي', en: 'Pink Sauce Penne', it: 'Penne Rosa',
      dAr: 'خليط الطماطم والكريمة مع الدجاج والمشروم.', dEn: 'Tomato-cream sauce with chicken and mushrooms.', p: 165, s: 'pink' },
    { id: 24, c: 'pasta', ar: 'سباجيتي بولونيز', en: 'Spaghetti Bolognese', it: 'Spaghetti alla Bolognese',
      dAr: 'لحم مفروم مطهو ببطء في صلصة الطماطم.', dEn: 'Minced beef slow-cooked in tomato sauce.', p: 165, s: 'meat' },
    { id: 25, c: 'pasta', ar: 'بيستو بالدجاج', en: 'Pesto Chicken', it: 'Pasta al Pesto',
      dAr: 'صوص ريحان أخضر، صنوبر، بارميزان ودجاج.', dEn: 'Green basil pesto, pine nuts, parmesan and chicken.', p: 185, s: 'green' },
    { id: 26, c: 'pasta', ar: 'كاربونارا', en: 'Carbonara', it: 'Carbonara',
      dAr: 'صوص كريمي بالبيض والبارميزان مع بيف بيكون.', dEn: 'Creamy egg and parmesan sauce with beef bacon.', p: 185, s: 'white' },
    { id: 27, c: 'pasta', ar: 'مكرونة سي فود', en: 'Seafood Pasta', it: 'Pasta ai Frutti di Mare',
      dAr: 'جمبري وكاليماري في صوص أحمر أو أبيض حسب رغبتك.', dEn: 'Shrimp and calamari in red or white sauce, your call.', p: 245, s: 'pink' },
    { id: 28, c: 'pasta', ar: 'لازانيا باللحم', en: 'Beef Lasagna', it: 'Lasagna',
      dAr: 'طبقات من العجين واللحم والبشاميل، مخبوزة بالجبنة.', dEn: 'Layers of pasta, beef ragù and béchamel, baked with cheese.', p: 195, s: 'lasagna' },
    { id: 29, c: 'pasta', ar: 'نجرسكو', en: 'Negresco', it: 'Negresco',
      dAr: 'المفضلة المصرية: مكرونة بالدجاج والبشاميل، وجه ذهبي مقرمش.', dEn: 'The Egyptian favourite: chicken pasta in béchamel with a golden crust.', p: 175, s: 'lasagna' },

    // ---------- Feteer (savory) ----------
    { id: 31, c: 'feteer', ar: 'فطير جبن مشكّل', en: 'Mixed Cheese Feteer', it: 'Feteer ai Formaggi',
      dAr: 'رومي، موتزاريلا وشيدر بين طبقات العجين المقرمشة.', dEn: 'Roumi, mozzarella and cheddar between crispy layers.', p: 145, f: '#f4d27a', tag: 'veg' },
    { id: 32, c: 'feteer', ar: 'فطير سجق', en: 'Sausage Feteer', it: 'Feteer Salsiccia',
      dAr: 'سجق شرقي، فلفل، طماطم وموتزاريلا.', dEn: 'Oriental sausage, pepper, tomato and mozzarella.', p: 165, f: '#a8432a' },
    { id: 33, c: 'feteer', ar: 'فطير لحم مفروم', en: 'Minced Beef Feteer', it: 'Feteer Carne',
      dAr: 'لحم مفروم متبّل مع بصل وفلفل.', dEn: 'Seasoned minced beef with onion and pepper.', p: 175, f: '#7a3b22', tag: 'best' },
    { id: 34, c: 'feteer', ar: 'فطير بسطرمة', en: 'Pastrami Feteer', it: 'Feteer Pastrami',
      dAr: 'بسطرمة، رومي وبيض، كما تحبها.', dEn: 'Basterma, roumi cheese and egg, just how you like it.', p: 180, f: '#9c2f2f' },
    { id: 35, c: 'feteer', ar: 'فطير تشيكن رانش', en: 'Chicken Ranch Feteer', it: 'Feteer Pollo',
      dAr: 'دجاج، مشروم وصوص رانش.', dEn: 'Chicken, mushrooms and ranch sauce.', p: 175, f: '#e8c48a' },
    { id: 36, c: 'feteer', ar: 'فطير تونة', en: 'Tuna Feteer', it: 'Feteer Tonno',
      dAr: 'تونة، بصل، زيتون وفلفل.', dEn: 'Tuna, onion, olives and pepper.', p: 165, f: '#c98b6b' },
    { id: 37, c: 'feteer', ar: 'فطير سوبر تشاو', en: 'Super Ciao Feteer', it: 'Feteer Super Ciao',
      dAr: 'مشكّل لحوم: سجق، بسطرمة، لحم مفروم وبيبروني.', dEn: 'Mixed meats: sausage, basterma, minced beef and pepperoni.', p: 210, f: '#b2382b', tag: 'sig' },
    { id: 38, c: 'feteer', ar: 'فطير مشلتت سادة', en: 'Plain Meshaltet', it: 'Meshaltet',
      dAr: 'مئة طبقة بالسمن البلدي، يُقدَّم مع عسل وقشطة أو جبنة قديمة.', dEn: 'A hundred ghee layers, served with honey & cream or aged cheese.', p: 120, f: '#f2c46b', tag: 'veg' },

    // ---------- Sweet ----------
    { id: 41, c: 'sweet', ar: 'فطير نوتيلا', en: 'Nutella Feteer', it: 'Feteer Nutella',
      dAr: 'نوتيلا سخية بين الطبقات وسكر بودرة.', dEn: 'Generous Nutella between the layers with icing sugar.', p: 140, f: '#5a2d17', sw: 'feteer', tag: 'best' },
    { id: 42, c: 'sweet', ar: 'نوتيلا وموز', en: 'Nutella & Banana', it: 'Nutella e Banana',
      dAr: 'نوتيلا مع شرائح موز طازجة.', dEn: 'Nutella with fresh banana slices.', p: 155, f: '#5a2d17', sw: 'feteer' },
    { id: 43, c: 'sweet', ar: 'فطير لوتس', en: 'Lotus Feteer', it: 'Feteer Lotus',
      dAr: 'كريمة لوتس وبسكويت مطحون.', dEn: 'Lotus spread and crushed biscuits.', p: 150, f: '#b9773a', sw: 'feteer' },
    { id: 44, c: 'sweet', ar: 'قشطة وعسل', en: 'Cream & Honey', it: 'Panna e Miele',
      dAr: 'الكلاسيكي المصري: قشطة بلدي وعسل نحل.', dEn: 'The Egyptian classic: fresh cream and honey.', p: 130, f: '#f6e7c4', sw: 'feteer' },
    { id: 45, c: 'sweet', ar: 'فطير بستاشيو', en: 'Pistachio Feteer', it: 'Feteer Pistacchio',
      dAr: 'كريمة فستق حلبي وفستق مجروش.', dEn: 'Pistachio cream and crushed pistachios.', p: 185, f: '#8fae4a', sw: 'feteer', tag: 'sig' },
    { id: 46, c: 'sweet', ar: 'بيتزا نوتيلا', en: 'Nutella Pizza', it: 'Pizza Nutella',
      dAr: 'عجينة البيتزا بالنوتيلا والفراولة والسكر البودرة.', dEn: 'Pizza dough with Nutella, strawberries and icing sugar.', ps: [150, 195], t: ['strawberry', 'sugar'], nutella: 1 },
    { id: 47, c: 'sweet', ar: 'بيتزا لوتس', en: 'Lotus Pizza', it: 'Pizza Lotus',
      dAr: 'كريمة لوتس، بسكويت مقرمش وصوص كراميل.', dEn: 'Lotus spread, crunchy biscuits and caramel drizzle.', ps: [160, 205], t: ['crumbs', 'caramel'], lotus: 1 },

    // ---------- Starters ----------
    { id: 51, c: 'starters', ar: 'خبز بالثوم', en: 'Garlic Bread', it: 'Pane all\'Aglio',
      dAr: 'زبدة الثوم والبقدونس على خبز ساخن.', dEn: 'Garlic-parsley butter on warm bread.', p: 65, st: 'bread', tag: 'veg' },
    { id: 52, c: 'starters', ar: 'خبز بالثوم والجبنة', en: 'Cheesy Garlic Bread', it: 'Pane Formaggio',
      dAr: 'نفس الحب.. ومعه موتزاريلا ذائبة.', dEn: 'Same love, plus melted mozzarella.', p: 85, st: 'cheesebread', tag: 'best' },
    { id: 53, c: 'starters', ar: 'أصابع موتزاريلا', en: 'Mozzarella Sticks', it: 'Bastoncini',
      dAr: '6 أصابع مقرمشة مع صوص مارينارا.', dEn: '6 crispy sticks with marinara dip.', p: 95, st: 'sticks' },
    { id: 54, c: 'starters', ar: 'بطاطس ودجز', en: 'Potato Wedges', it: 'Patate',
      dAr: 'بطاطس متبّلة بالأعشاب الإيطالية.', dEn: 'Potato wedges with Italian herbs.', p: 70, st: 'wedges', tag: 'veg' },
    { id: 55, c: 'starters', ar: 'أجنحة دجاج', en: 'Chicken Wings', it: 'Alette di Pollo',
      dAr: '8 قطع، باربكيو أو بافلو حار.', dEn: '8 pieces, BBQ or spicy buffalo.', p: 140, st: 'wings' },
    { id: 56, c: 'starters', ar: 'سلطة سيزر', en: 'Caesar Salad', it: 'Insalata Caesar',
      dAr: 'خس، دجاج مشوي، خبز محمّص وبارميزان.', dEn: 'Lettuce, grilled chicken, croutons and parmesan.', p: 120, st: 'salad' },

    // ---------- Hot ----------
    { id: 61, c: 'hot', ar: 'إسبريسو', en: 'Espresso', it: 'Espresso', dAr: 'سنجل أو دبل، بكريمة ذهبية.', dEn: 'Single or double, golden crema.', p: 45, cup: 'espresso', liq: '#3a1d0e' },
    { id: 62, c: 'hot', ar: 'أمريكانو', en: 'Americano', it: 'Americano', dAr: 'إسبريسو مع ماء ساخن.', dEn: 'Espresso with hot water.', p: 55, cup: 'mug', liq: '#2b150a' },
    { id: 63, c: 'hot', ar: 'كابتشينو', en: 'Cappuccino', it: 'Cappuccino', dAr: 'رغوة حليب كثيفة ورشة كاكاو.', dEn: 'Thick milk foam and a dust of cocoa.', p: 70, cup: 'cup', liq: '#c79a6b', foam: 1, tag: 'best' },
    { id: 64, c: 'hot', ar: 'لاتيه', en: 'Latte', it: 'Caffè Latte', dAr: 'إسبريسو وحليب مخفوق ناعم.', dEn: 'Espresso and silky steamed milk.', p: 70, cup: 'glass', liq: '#d8b48a', foam: 1 },
    { id: 65, c: 'hot', ar: 'سبانيش لاتيه', en: 'Spanish Latte', it: 'Latte Spagnolo', dAr: 'لاتيه بالحليب المكثّف المحلّى.', dEn: 'Latte sweetened with condensed milk.', p: 80, cup: 'glass', liq: '#cfa173', foam: 1 },
    { id: 66, c: 'hot', ar: 'موكا', en: 'Mocha', it: 'Mocha', dAr: 'إسبريسو وشوكولاتة وحليب.', dEn: 'Espresso, chocolate and milk.', p: 80, cup: 'cup', liq: '#7a4429', foam: 1 },
    { id: 67, c: 'hot', ar: 'هوت شوكليت', en: 'Hot Chocolate', it: 'Cioccolata Calda', dAr: 'شوكولاتة ساخنة كثيفة على الطريقة الإيطالية.', dEn: 'Thick Italian-style hot chocolate.', p: 75, cup: 'mug', liq: '#5b2c16' },
    { id: 68, c: 'hot', ar: 'قهوة تركي', en: 'Turkish Coffee', it: 'Caffè Turco', dAr: 'سادة، مظبوط أو زيادة.', dEn: 'Plain, medium or sweet.', p: 40, cup: 'espresso', liq: '#2a160b' },
    { id: 69, c: 'hot', ar: 'شاي بالنعناع', en: 'Mint Tea', it: 'Tè alla Menta', dAr: 'شاي أسود ونعناع طازج.', dEn: 'Black tea with fresh mint.', p: 30, cup: 'glass', liq: '#a4451c' },
    { id: 70, c: 'hot', ar: 'سحلب بالمكسرات', en: 'Sahlab with Nuts', it: 'Sahlab', dAr: 'سحلب كريمي بالقرفة وجوز الهند والمكسرات.', dEn: 'Creamy sahlab with cinnamon, coconut and nuts.', p: 70, cup: 'mug', liq: '#f1e4c8', tag: 'sig' },

    // ---------- Cold ----------
    { id: 81, c: 'cold', ar: 'آيس لاتيه', en: 'Iced Latte', it: 'Latte Freddo', dAr: 'إسبريسو وحليب بارد على ثلج.', dEn: 'Espresso and cold milk over ice.', p: 80, cup: 'tall', liq: '#c9a27a', ice: 1 },
    { id: 82, c: 'cold', ar: 'آيس سبانيش لاتيه', en: 'Iced Spanish Latte', it: 'Spagnolo Freddo', dAr: 'المفضّل.. بارد.', dEn: 'The favourite, iced.', p: 90, cup: 'tall', liq: '#c08f5f', ice: 1, tag: 'best' },
    { id: 83, c: 'cold', ar: 'فرابيه كراميل', en: 'Caramel Frappé', it: 'Frappé Caramello', dAr: 'قهوة مثلّجة مخفوقة وكراميل وكريمة.', dEn: 'Blended iced coffee, caramel and whipped cream.', p: 95, cup: 'tall', liq: '#b07a45', cream: 1 },
    { id: 84, c: 'cold', ar: 'موهيتو ليمون ونعناع', en: 'Lemon Mint Mojito', it: 'Mojito', dAr: 'ليمون، نعناع، صودا وثلج كثير.', dEn: 'Lemon, mint, soda and lots of ice.', p: 70, cup: 'tall', liq: '#cde98a', ice: 1, mint: 1, tag: 'best' },
    { id: 85, c: 'cold', ar: 'موهيتو باشن فروت', en: 'Passion Fruit Mojito', it: 'Mojito Passion', dAr: 'باشن فروت ونعناع وصودا.', dEn: 'Passion fruit, mint and soda.', p: 80, cup: 'tall', liq: '#f2a73b', ice: 1, mint: 1 },
    { id: 86, c: 'cold', ar: 'برتقال فريش', en: 'Fresh Orange', it: 'Spremuta d\'Arancia', dAr: 'برتقال يُعصَر عند الطلب.', dEn: 'Squeezed to order.', p: 60, cup: 'tall', liq: '#ff9a1f' },
    { id: 87, c: 'cold', ar: 'ليمون نعناع', en: 'Lemon Mint', it: 'Limonata', dAr: 'منعش بعد البيتزا مباشرة.', dEn: 'The perfect after-pizza refresher.', p: 55, cup: 'tall', liq: '#b9e06a', mint: 1 },
    { id: 88, c: 'cold', ar: 'سموذي فراولة', en: 'Strawberry Smoothie', it: 'Frullato Fragola', dAr: 'فراولة طازجة مخفوقة.', dEn: 'Fresh blended strawberries.', p: 75, cup: 'tall', liq: '#e2445c' },
    { id: 89, c: 'cold', ar: 'ميلك شيك أوريو', en: 'Oreo Milkshake', it: 'Frappè Oreo', dAr: 'آيس كريم فانيليا وأوريو.', dEn: 'Vanilla ice cream and Oreo.', p: 95, cup: 'tall', liq: '#d9d2c8', cream: 1 },
    { id: 90, c: 'cold', ar: 'ميلك شيك لوتس', en: 'Lotus Milkshake', it: 'Frappè Lotus', dAr: 'آيس كريم ولوتس وكراميل.', dEn: 'Ice cream, Lotus and caramel.', p: 95, cup: 'tall', liq: '#c88d52', cream: 1 },
    { id: 91, c: 'cold', ar: 'مشروب غازي', en: 'Soft Drink', it: 'Bibita', dAr: 'كانز بارد.', dEn: 'Chilled can.', p: 30, cup: 'can', liq: '#d01f25' },
    { id: 92, c: 'cold', ar: 'مياه معدنية', en: 'Water', it: 'Acqua', dAr: 'زجاجة صغيرة.', dEn: 'Small bottle.', p: 15, cup: 'bottle', liq: '#bfe6f2' }
  ],

  offers: [
    { id: 101, ar: 'تشاو دو', en: 'Ciao Duo', p: 499, old: 590,
      dAr: '2 بيتزا وسط من الكلاسيك + 2 مشروب غازي', dEn: '2 medium classic pizzas + 2 soft drinks' },
    { id: 102, ar: 'عيلة تشاو', en: 'Famiglia Ciao', p: 899, old: 1085,
      dAr: '2 بيتزا كبير + مكرونة + خبز بالثوم والجبنة + 4 مشروبات', dEn: '2 large pizzas + a pasta + cheesy garlic bread + 4 drinks' },
    { id: 103, ar: 'صندوق السبعة', en: 'Sette Box', p: 399, old: 470,
      dAr: '7 بيتزا ميني بسبع نكهات مختلفة.. جرّب كل شيء', dEn: '7 mini pizzas in 7 flavours. Taste them all' }
  ],

  reviews: [
    { n: 'سارة م.', ar: 'الجبنة فعلاً بتشدّ زي الإعلانات! البيتزا وصلت سخنة والعجينة خفيفة جداً.', en: 'The cheese really stretches like in the ads! Arrived hot, super light dough.', r: 5 },
    { n: 'Omar K.', ar: 'تشاو 7 الأصلية فيها كل حاجة بحبها. هرجع تاني أكيد.', en: 'The Ciao 7 has everything I love. Definitely coming back.', r: 5 },
    { n: 'منى ع.', ar: 'فطير النوتيلا خطير، والطبقات مقرمشة من بره وطرية من جوه.', en: 'The Nutella feteer is crazy good: crispy outside, soft inside.', r: 5 },
    { n: 'Youssef H.', ar: 'طلبت على واتساب ووصل في 35 دقيقة. الخدمة محترمة جداً.', en: 'Ordered on WhatsApp, delivered in 35 minutes. Great service.', r: 5 },
    { n: 'نور الدين', ar: 'الفيتوتشيني ألفريدو كريمي بشكل مثالي، والكمية ممتازة.', en: 'The Alfredo is perfectly creamy and the portion is generous.', r: 4 },
    { n: 'Laila S.', ar: 'جوّ المكان إيطالي ولطيف، وحجزنا طاولة لعيد ميلاد بسهولة.', en: 'Lovely Italian vibe, and booking a birthday table was easy.', r: 5 },
    { n: 'كريم ف.', ar: 'الديافولا حارة فعلاً، بس العسل الحار مخليها حكاية!', en: 'The Diavola is truly spicy, but the hot honey makes it magic!', r: 5 }
  ]
};
