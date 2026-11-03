/* Granny's Secrets — menu & settings.
   PRICES, PHONE AND DELIVERY FEE ARE PLACEHOLDERS: confirm with the client before launch. */
window.GS_CONFIG = {
  whatsapp: '201203101104',          // TEMP (Planet). Replace with the kitchen's WhatsApp number.
  phone: '+20 120 310 1104',
  deliveryFee: 30,                   // EGP, placeholder
  freeDeliveryOver: 1000,            // EGP, placeholder
  hours: { ar: 'يوميًا من 12 الظهر لـ 11 بالليل', en: 'Daily, 12 pm to 11 pm' },
  hoursNum: { ar: 'يوميًا 12 ظهرًا – 11 مساءً', en: 'Daily 12 pm – 11 pm' },
  area: { ar: 'توصيل داخل القاهرة والجيزة', en: 'Delivery across Cairo & Giza' },
  instagram: '#', facebook: '#', tiktok: '#'
};

window.GS_CATS = [
  { id: 'tagines', ar: 'الطواجن', en: 'Clay Tagines', noteAr: 'الطاجن الفخار بيستنى في الفرن على مهله… والصبر هو أول سر.', noteEn: 'The clay pot waits in the oven, slowly. Patience is the first secret.', no: '01' },
  { id: 'mahshi', ar: 'المحاشي', en: 'Mahshi', noteAr: 'كل صباع ملفوف بالإيد، رفيع زي القلم… زي ما تيتة علّمتنا.', noteEn: 'Every roll is wrapped by hand, pencil-thin, the way Granny taught us.', no: '02' },
  { id: 'oven', ar: 'من فرن الجدة', en: "From Granny's Oven", noteAr: 'صواني الجمعة اللي ريحتها بتجمّع العيلة قبل ما تتحط على السفرة.', noteEn: 'The Friday trays whose smell gathers the family before they reach the table.', no: '03' },
  { id: 'stews', ar: 'طبيخ البيت', en: 'Home Stews', noteAr: 'طبيخ كل يوم بالسمنة البلدي، وبيتقدّم مع رز بالشعرية.', noteEn: 'Everyday stews in real ghee, served with vermicelli rice.', no: '04' },
  { id: 'sides', ar: 'جنب الطبق', en: 'On the Side', noteAr: 'السفرة ما تكملش من غير الحاجات الصغيرة دي.', noteEn: 'No table is complete without these little things.', no: '05' },
  { id: 'sweets', ar: 'حلو الجدة', en: "Granny's Sweets", noteAr: 'آخر القعدة… وأحلى ذكرى.', noteEn: 'The end of the meal, and the sweetest memory.', no: '06' },
  { id: 'frozen', ar: 'جاهز للطبخ', en: 'Ready to Cook', noteAr: 'لفّيناه ليكي… عليكي بس الحلّة والنار.', noteEn: 'We rolled it for you. You only need the pot and the fire.', no: '07' },
  { id: 'boxes', ar: 'العزومات', en: 'Feast Boxes', noteAr: 'عزومة كاملة توصلك سخنة… وإنتِ تاخدي التعظيم.', noteEn: 'A whole feast arrives hot, and you take the compliments.', no: '08' }
];

/* img = file name in assets/food (webp). serves = persons. */
window.GS_MENU = [
  // Tagines
  { id: 't1', cat: 'tagines', ar: 'طاجن بامية باللحمة الضاني', en: 'Okra & Lamb Tagine', dAr: 'بامية صغيرة ولحمة ضاني بتتسوّى في صلصة طماطم وتقلية توم وكسبرة.', dEn: 'Baby okra and lamb slow-baked in tomato with garlic and coriander.', price: 320, tag: 'best' },
  { id: 't2', cat: 'tagines', ar: 'طاجن تورلي باللحمة', en: 'Turli Vegetable Tagine', dAr: 'كوسة وبطاطس وجزر وبسلة وفاصوليا خضرا مع لحمة كندوز.', dEn: 'Zucchini, potato, carrot, peas and green beans with beef.', price: 290 },
  { id: 't3', cat: 'tagines', ar: 'طاجن رز معمّر بالفراخ', en: 'Ruz Me’ammar with Chicken', dAr: 'رز بالقشطة واللبن متسوّي في الفرن، ووشّه دهبي، وفوقه ربع فرخة.', dEn: 'Oven-baked creamy rice with a golden top and a quarter chicken.', price: 260, tag: 'best' },
  { id: 't4', cat: 'tagines', ar: 'طاجن لسان عصفور باللحمة', en: 'Orzo & Beef Tagine', dAr: 'لسان عصفور محمّر في السمنة مع مكعبات لحمة وصلصة.', dEn: 'Ghee-toasted orzo with beef cubes in tomato sauce.', price: 280 },
  { id: 't5', cat: 'tagines', ar: 'طاجن كفتة داوود باشا', en: 'Dawood Basha Kofta Tagine', dAr: 'كرات كفتة متبّلة في صلصة طماطم بالبصل والفلفل.', dEn: 'Spiced meatballs baked in a tomato, onion and pepper sauce.', price: 270 },

  // Mahshi
  { id: 'm1', cat: 'mahshi', ar: 'ورق عنب', en: 'Stuffed Vine Leaves', dAr: 'ورق عنب رفيع بالرز والخضرة، متسوّي على ريش ضاني. 20 صباع.', dEn: 'Thin vine-leaf rolls with herbed rice, cooked over lamb chops. 20 pcs.', price: 190, tag: 'best' },
  { id: 'm2', cat: 'mahshi', ar: 'محشي كرنب', en: 'Stuffed Cabbage', dAr: 'كرنب ملفوف بالرز والشبت والكمون. 20 صباع.', dEn: 'Cabbage rolls with dill and cumin rice. 20 pcs.', price: 175 },
  { id: 'm3', cat: 'mahshi', ar: 'محشي مشكّل', en: 'Mixed Mahshi', dAr: 'كوسة وباذنجان وفلفل وطماطم محشيين بخلطة الجدة.', dEn: "Zucchini, eggplant, peppers and tomatoes with Granny's filling.", price: 195 },
  { id: 'm4', cat: 'mahshi', ar: 'محشي بصل', en: 'Stuffed Onions', dAr: 'طبقات بصل محشية ومتحمّرة بدبس الرمان.', dEn: 'Onion layers stuffed and caramelised with pomegranate molasses.', price: 210, tag: 'new' },
  { id: 'm5', cat: 'mahshi', ar: 'صينية محشي العيلة', en: 'Family Mahshi Tray', dAr: 'صينية كاملة من كل الأنواع تكفّي 4 أفراد.', dEn: 'A full tray of every kind. Serves 4.', price: 680, serves: 4 },

  // Oven
  { id: 'o1', cat: 'oven', ar: 'مكرونة بشاميل', en: 'Béchamel Pasta', dAr: 'مكرونة قلم ولحمة مفرومة وبشاميل كريمي بوشّ محمّر.', dEn: 'Penne, spiced minced beef and creamy béchamel with a golden top.', price: 220, tag: 'best' },
  { id: 'o2', cat: 'oven', ar: 'فتّة باللحمة', en: 'Fattah with Beef', dAr: 'عيش محمّص ورز وصلصة خل وتوم ولحمة موزة.', dEn: 'Toasted bread, rice, garlic-vinegar tomato sauce and beef shank.', price: 340 },
  { id: 'o3', cat: 'oven', ar: 'رقاق باللحمة', en: 'Roqaq with Minced Beef', dAr: 'رقاق مقرمش بالسمنة البلدي ومحشي لحمة مفرومة.', dEn: 'Crisp ghee pastry sheets layered with minced beef.', price: 250 },
  { id: 'o4', cat: 'oven', ar: 'صينية بطاطس باللحمة', en: 'Potato & Beef Tray', dAr: 'بطاطس ولحمة في صلصة طماطم بالفلفل والبصل.', dEn: 'Potatoes and beef baked in tomato with peppers and onion.', price: 290 },
  { id: 'o5', cat: 'oven', ar: 'نص فرخة محمّرة بالرز', en: 'Half Roast Chicken & Rice', dAr: 'فرخة متسلّقة بالبهارات ومتحمّرة، مع رز بالشعرية.', dEn: 'Spiced, simmered then roasted chicken with vermicelli rice.', price: 260 },
  { id: 'o6', cat: 'oven', ar: 'حمام محشي فريك', en: 'Pigeon Stuffed with Freekeh', dAr: 'جوز حمام محشي فريك ومتحمّر في السمنة.', dEn: 'A pair of pigeons stuffed with freekeh, ghee-roasted.', price: 380, tag: 'chef' },

  // Stews
  { id: 's1', cat: 'stews', ar: 'ملوخية بالفراخ', en: 'Molokhia with Chicken', dAr: 'ملوخية خضرا بشهقة التقلية، وربع فرخة ورز.', dEn: 'Green molokhia with the famous garlic ta’leya, chicken and rice.', price: 230, tag: 'best' },
  { id: 's2', cat: 'stews', ar: 'ملوخية بالأرانب', en: 'Molokhia with Rabbit', dAr: 'ملوخية بشوربة الأرانب ونص أرنب محمّر.', dEn: 'Molokhia in rabbit broth with half a roasted rabbit.', price: 310 },
  { id: 's3', cat: 'stews', ar: 'فاصوليا بيضا باللحمة', en: 'White Beans with Beef', dAr: 'فاصوليا بيضا متسوّية على مهلها مع لحمة ورز.', dEn: 'Slow-cooked white beans with beef and rice.', price: 215 },
  { id: 's4', cat: 'stews', ar: 'بسلّة بالجزر واللحمة', en: 'Peas & Carrots with Beef', dAr: 'بسلة وجزر في صلصة خفيفة مع لحمة ورز.', dEn: 'Peas and carrots in a light tomato sauce with beef and rice.', price: 215 },
  { id: 's5', cat: 'stews', ar: 'شوربة لسان عصفور', en: 'Orzo Soup', dAr: 'شوربة لحمة بلسان عصفور وليمونة.', dEn: 'Beef broth with orzo and a squeeze of lemon.', price: 75 },

  // Sides
  { id: 'd1', cat: 'sides', ar: 'رز بالشعرية', en: 'Vermicelli Rice', dAr: 'رز مصري بالشعرية المحمّرة في السمنة.', dEn: 'Egyptian rice with ghee-toasted vermicelli.', price: 45 },
  { id: 'd2', cat: 'sides', ar: 'سلطة بلدي', en: 'Baladi Salad', dAr: 'طماطم وخيار وبصل وفلفل بالليمون والكمون.', dEn: 'Tomato, cucumber, onion and pepper with lemon and cumin.', price: 40 },
  { id: 'd3', cat: 'sides', ar: 'طحينة', en: 'Tahini', dAr: 'طحينة بالليمون والتوم.', dEn: 'Tahini with lemon and garlic.', price: 35 },
  { id: 'd4', cat: 'sides', ar: 'بابا غنوج', en: 'Baba Ghanoush', dAr: 'باذنجان مشوي على الفحم بالطحينة.', dEn: 'Charcoal-grilled eggplant with tahini.', price: 50 },
  { id: 'd5', cat: 'sides', ar: 'مخلل بيتي', en: 'Homemade Pickles', dAr: 'لفت وجزر وخيار مخلل في البيت.', dEn: 'House-pickled turnip, carrot and cucumber.', price: 30 },

  // Sweets
  { id: 'w1', cat: 'sweets', ar: 'أم علي بالمكسرات', en: 'Om Ali with Nuts', dAr: 'رقاق ولبن وقشطة ومكسرات، طالعة من الفرن.', dEn: 'Pastry, milk, cream and nuts, straight from the oven.', price: 115, tag: 'best' },
  { id: 'w2', cat: 'sweets', ar: 'رز بلبن بالفرن', en: 'Baked Rice Pudding', dAr: 'رز بلبن بوشّ محمّر وقرفة.', dEn: 'Rice pudding with a caramelised top and cinnamon.', price: 70 },
  { id: 'w3', cat: 'sweets', ar: 'مهلبية بالفستق', en: 'Pistachio Muhallabia', dAr: 'مهلبية بماء الورد وفستق حلبي.', dEn: 'Rose-water milk pudding with pistachios.', price: 70 },
  { id: 'w4', cat: 'sweets', ar: 'بسبوسة بالقشطة', en: 'Basbousa with Cream', dAr: 'بسبوسة بالسمنة محشية قشطة.', dEn: 'Ghee semolina cake filled with clotted cream.', price: 95 },
  { id: 'w5', cat: 'sweets', ar: 'كنافة بالقشطة', en: 'Kunafa with Cream', dAr: 'كنافة بلدي مقرمشة بالقشطة والشربات.', dEn: 'Crisp kunafa with cream and syrup.', price: 130 },

  // Frozen / ready to cook
  { id: 'f1', cat: 'frozen', ar: 'ورق عنب ملفوف (1 كيلو)', en: 'Rolled Vine Leaves (1 kg)', dAr: 'ملفوف ومتجمّد، جاهز للحلّة.', dEn: 'Hand-rolled and frozen, ready for your pot.', price: 340 },
  { id: 'f2', cat: 'frozen', ar: 'كرنب ملفوف (1 كيلو)', en: 'Rolled Cabbage (1 kg)', dAr: 'ملفوف ومتجمّد، جاهز للحلّة.', dEn: 'Hand-rolled and frozen, ready for your pot.', price: 290 },
  { id: 'f3', cat: 'frozen', ar: 'كفتة متبّلة (1 كيلو)', en: 'Seasoned Kofta (1 kg)', dAr: 'لحمة كندوز بتتبيلة الجدة.', dEn: "Beef with Granny's seasoning.", price: 430 },
  { id: 'f4', cat: 'frozen', ar: 'ملوخية مخروطة (1 كيلو)', en: 'Chopped Molokhia (1 kg)', dAr: 'ملوخية طازة مخروطة ومتجمّدة.', dEn: 'Fresh molokhia, finely chopped and frozen.', price: 95 },

  // Boxes
  { id: 'b1', cat: 'boxes', ar: 'عزومة صغيرة', en: 'Small Feast', dAr: 'محشي مشكّل + فرخة محمّرة + ملوخية + رز + سلطة.', dEn: 'Mixed mahshi, roast chicken, molokhia, rice and salad.', price: 1150, serves: 4, tag: 'best' },
  { id: 'b2', cat: 'boxes', ar: 'عزومة كبيرة', en: 'Grand Feast', dAr: 'صينية محشي + بطة + فتة + مكرونة بشاميل + أم علي.', dEn: 'Mahshi tray, duck, fattah, béchamel pasta and Om Ali.', price: 2350, serves: 8 },
  { id: 'b3', cat: 'boxes', ar: 'غدا الأسبوع', en: 'Weekly Lunch Box', dAr: '5 وجبات غدا لأيام الشغل، صنف مختلف كل يوم.', dEn: 'Five weekday lunches, a different dish each day.', price: 1250, serves: 1, tag: 'new' }
];

/* Dish of the day, by weekday (0 = Sunday). Placeholder rotation. */
window.GS_DAILY = { 0: 'o1', 1: 't1', 2: 'm3', 3: 'o2', 4: 'o6', 5: 'o5', 6: 's1' };

/* Granny's secrets (flip cards). */
window.GS_SECRETS = [
  { ar: 'الشهقة', en: 'The gasp', qAr: 'ليه بنشهق وإحنا بنحط التقلية؟', qEn: 'Why do we gasp when the garlic goes in?', aAr: 'التوم يتحمّر في السمنة لحد ما يبقى دهبي، ويدخل الملوخية وهي بتغلي. الشهقة؟ دي بركة الجدة.', aEn: 'Garlic fries in ghee until golden and meets the molokhia at a boil. The gasp is Granny’s blessing.' },
  { ar: 'الصباع الرفيع', en: 'The thin roll', qAr: 'إيه سر ورق العنب اللي بيدوب؟', qEn: 'What makes vine leaves melt?', aAr: 'ورقة صغيرة، حشوة قليلة، ولفّة مشدودة. وتحت الحلّة ريش ضاني.', aEn: 'A small leaf, a little filling and a tight roll, cooked over lamb chops.' },
  { ar: 'نار هادية', en: 'A low flame', qAr: 'ليه الطاجن بيطلع طعمه أحلى؟', qEn: 'Why does a tagine taste better?', aAr: 'الفخار بيسخن على مهله وبيحبس البخار… فاللحمة بتستوي في عصيرها.', aEn: 'Clay heats slowly and traps the steam, so the meat cooks in its own juices.' },
  { ar: 'السمنة البلدي', en: 'Real ghee', qAr: 'إيه اللي بيفرّق أكل البيت؟', qEn: 'What makes home food different?', aAr: 'سمنة بلدي، بهارات بنطحنها بإيدينا، ومفيش أي حاجة جاهزة.', aEn: 'Real ghee, spices we grind ourselves and nothing out of a packet.' }
];

window.GS_REVIEWS = [
  { n: 'منى ع.', nEn: 'Mona A.', ar: 'الملوخية فكّرتني بأكل ستّي بالظبط. وصلت سخنة ومتغلّفة حلو.', en: 'The molokhia tasted exactly like my grandmother’s. Arrived hot and beautifully packed.' },
  { n: 'أحمد س.', nEn: 'Ahmed S.', ar: 'طلبنا عزومة لـ 8 أفراد، والكل سأل جبتوا الأكل ده منين.', en: 'We ordered the 8-person feast and everyone asked where the food came from.' },
  { n: 'سارة م.', nEn: 'Sara M.', ar: 'ورق العنب رفيع ومظبوط، والكرنب المجمّد وفّر عليّ يوم كامل.', en: 'The vine leaves are thin and perfect, and the frozen cabbage saved me a whole day.' }
];
