/* Zaza Cuisine – data. Menu transcribed from Zaza's published Egypt menu (prices in EGP, excl. service & tax). */
window.ZAZA = {
  config: {
    whatsapp: '201122055111',          // Zaza WhatsApp (from zazacuisine.com contact page)
    reservations: '01200001585',       // Sahel reservations line
    hotline: '01115558268',
    email: 'info@zazacuisine.com'
  },
  branches: [
    { id:'zamalek', city:{ar:'القاهرة', en:'Cairo'}, name:{ar:'الزمالك', en:'Zamalek'},
      addr:{ar:'شارع 26 يوليو – صن مول، الزمالك', en:'26th of July St., Sun Mall, Zamalek'},
      phone:'01115558268', map:'30.060696689816,31.221206893773', img:'hero-s', tag:{ar:'الفرع الأول', en:'The original'} },
    { id:'mamsha', city:{ar:'القاهرة', en:'Cairo'}, name:{ar:'ممشى النيل', en:'Nile Mamsha'},
      addr:{ar:'على النيل – الممشى، أمام فندق فيرمونت نايل سيتي', en:'On the Nile walk, facing Fairmont Nile City'},
      phone:'01118782111', map:'30.073689917257,31.227285729934', img:'nile-s', tag:{ar:'إطلالة على النيل', en:'Nile view'} },
    { id:'amwaj', city:{ar:'الساحل الشمالي', en:'North Coast'}, name:{ar:'أمواج', en:'Amwaj'},
      addr:{ar:'الكيلو 135 بين سي شل وأمواج', en:'Km 135, between Seashell & Amwaj'},
      phone:'01200001585', map:'30.964652098635,28.759514829495', img:'sahel-s', tag:{ar:'موسم الصيف', en:'Summer season'} },
    { id:'marassi', city:{ar:'الساحل الشمالي', en:'North Coast'}, name:{ar:'مراسي', en:'Marassi'},
      addr:{ar:'مراسي – مارينا ريزيدنس 1', en:'Marassi, Marina Residence 1'},
      phone:'01200001585', map:'30.991304422024,28.682782850205', img:'shrimp-s', tag:{ar:'على المارينا', en:'Marina side'} },
    { id:'kuwait', city:{ar:'الكويت', en:'Kuwait'}, name:{ar:'الكويت', en:'Kuwait'},
      addr:{ar:'منيو الكويت متاح – العنوان يُضاف بعد التأكيد', en:'Kuwait menu available – address to be confirmed'},
      phone:'', map:'', img:'fattah-s', tag:{ar:'خارج مصر', en:'Abroad'} }
  ],
  soon: [
    { ar:'الشيخ زايد', en:'Sheikh Zayed' },
    { ar:'التجمع الخامس', en:'New Cairo' },
    { ar:'الساحل 2027', en:'North Coast 2027' }
  ],
  menu: [
    { id:'tajin', icon:'pot', name:{ar:'طواجن', en:'Tagines'}, items:[
      ['Molokhia with Half Chicken','طاجن ملوخية مع نصف فرخة',390,'Grilled or fried','محمّرة أو مشوية','molokhia'],
      ['Molokhia with Meat','طاجن ملوخية باللحمة',430],
      ['Okra with Meat Tagine','طاجن بامية باللحمة',430],
      ['Meat & Pearl Onion Tagine','طاجن كباب حلة',430],
      ['Rice Muammar Tagine','طاجن أرز معمّر',185],
      ['Lesan Asfour with Veal','طاجن لسان عصفور باللحمة',450],
      ['Veal Shank with Shreya','طاجن موزة بتلو بالشعرية',450],
      ['Veal Shank with Lesan Asfour','طاجن موزة بلسان عصفور',450],
      ['Kofta Dawood Basha','كفتة داوود باشا بالصلصة',370],
      ['Waraket Lahma with Vegetables','ورقة لحمة بالخضار',450],
      ['Waraket Ferakh with Vegetables','ورقة فراخ بالخضار',420],
      ['Vine Leaves with Knuckles','ورق عنب بالكوارع',515],
      ['Rice Muammar with Pigeon','طاجن أرز معمّر بالحمام',370],
      ['Rice Muammar with Quails','طاجن أرز معمّر بالسمان',320],
      ['Rice Muammar with Meat','طاجن أرز معمّر باللحمة',370],
      ['Rice Muammar with Chicken','طاجن أرز معمّر بالفراخ',320],
      ['Potato Tagine with Meat','طاجن بطاطس باللحمة',430]
    ]},
    { id:'grill', icon:'fire', name:{ar:'مشويات على الفحم', en:'On Coal Grills'}, note:{ar:'تُقدّم مع أرز أو خضار سوتيه أو بطاطس بيوريه', en:'Served with rice, sautéed vegetables or mashed potato'}, items:[
      ['Mix Grill','ميكس جريل',570,'','','grill'],
      ['Grilled Kofta','كفتة مشوية',390],
      ['½ Grilled Chicken','نصف فرخة مشوية',350],
      ['Shish Tawook','شيش طاووق',340],
      ['Shish Tawook Breasts','شيش طاووق صدور',390],
      ['Grilled Quails','سمان مشوي',390],
      ['Stuffed Pigeon','حمام محشي',330,'','','pigeon'],
      ['Tarb','طرب',440],
      ['Grilled Chops','ريش مشوية',620],
      ['Kabab','كباب',440]
    ]},
    { id:'fattah', icon:'bowl', name:{ar:'فتة وكبسة', en:'Fattah & Kabsa'}, items:[
      ['Egyptian Fattah with Veal Shank','فتة مصري بالموزة',450,'','','fattah'],
      ['Knuckles Fattah','فتة كوارع',530],
      ['Fattah with Meat','فتة باللحمة',460],
      ['Fattah Shawarma Meat','فتة شاورما لحمة',340],
      ['Fattah Shawarma Chicken','فتة شاورما فراخ',320],
      ['Kabsa Meat','كبسة لحمة',490],
      ['Kabsa Chicken','كبسة فراخ',440],
      ['Plain Molokhia','ملوخية سادة',95],
      ['Plain Rice','أرز سادة',75]
    ]},
    { id:'main', icon:'plate', name:{ar:'أطباق رئيسية', en:'Main Course'}, items:[
      ['Zaza Fillet','فيليه Zaza',625,'With mushroom & cream sauce','بصوص المشروم والكريمة'],
      ['Fillet Poivre','فيليه بوافر',590],
      ['Fillet Mushroom','فيليه مشروم',625],
      ['Black & White Fillet','فيليه بلاك آند وايت',625],
      ['Classic Fillet','فيليه كلاسيك',590],
      ['Chicken White Sauce','فراخ وايت صوص',340,'Mushroom & melted cheese','مشروم وجبنة سايحة'],
      ['Lemon Sauce Chicken','فراخ ليمون صوص',340],
      ['Fried Chicken','فراخ بانيه',275],
      ['Alexandrian Veal Liver','كبدة إسكندراني',235],
      ['Alexandrian Soujouk','سجق إسكندراني',295],
      ['Mexican Sausage','سجق مكسيكي',235],
      ['Chicken Pan','طاسة فراخ',345],
      ['Shawerma Meat','شاورما لحمة',340],
      ['Shawerma Chicken','شاورما فراخ',300],
      ['Shawerma Mix','شاورما ميكس',380]
    ]},
    { id:'sea', icon:'wave', name:{ar:'مأكولات بحرية', en:'Seafood'}, items:[
      ['Grilled Salmon','جريلد سالمون',625],
      ['Fried Shrimp','جمبري مقلي',590],
      ['Pan Grilled Shrimp','جمبري مشوي طاسة',590,'','','shrimp'],
      ['Mix Seafood','ميكس سي فود',590]
    ]},
    { id:'feteer', icon:'layers', name:{ar:'فطير ورول', en:'Feteer & Roll'}, note:{ar:'السعر: فطيرة / رول', en:'Price: Feteer / Roll'}, items:[
      ['Zaza Longest Feteer in Egypt','أطول فطيرة في مصر',900,'Our record-length feteer, for the whole table','فطيرتنا القياسية… للسفرة كلها','feteer'],
      ['Feteer Meshaltet','فطير مشلتت',320],
      ['Mix Cheese','مكس جبن',[255,185]],
      ['BBQ Chicken','فراخ باربيكيو',[255,210]],
      ['Chicken Fajita','فاهيتا فراخ',[275,210]],
      ['Alex Soujouk','سجق',[275,210]],
      ['Pastrami','بسطرمة',[270,210]],
      ['Tuna','تونة',[270,210]],
      ['Meat Lovers','مشكل لحوم',[325,235]],
      ['Seafood','سي فود',[385,305]],
      ['Turkey','تركي مدخن',[255,180]],
      ['Roumy','جبنة رومي',[220,180]],
      ['Honey & Cream','عسل وقشطة',[170,145]],
      ['Custard & Cream','قشطة كاسترد',[170,145]],
      ['Lotus','لوتس',[200,170]],
      ['Halawa & Cream','حلاوة وقشطة',[185,145]],
      ['Nutella & Bananas with Nuts','نوتيلا وموز مع المكسرات',[315,215]]
    ]},
    { id:'breakfast', icon:'sun', name:{ar:'الفطار المصري', en:'Egyptian Breakfast'}, note:{ar:'يُقدَّم من 7 صباحًا حتى 2 ظهرًا', en:'Served 7 AM – 2 PM'}, items:[
      ['Egyptian Tray for Two','صينية فطار مصري لفردين',345,'Foul, tameya, eggs, eggplant, bissara, cheese, meshaltet','فول، طعمية، بيض، باذنجان، بصارة، جبنة، فطير مشلتت','breakfast'],
      ['Continental Breakfast','فطار كونتيننتال',340],
      ['English Breakfast','إنجلش بريكفاست',305],
      ['Spanish Omelette','أومليت إسباني',90],
      ['French Toast','فرنش توست',80],
      ['Bean Plate','طبق الفول',75],
      ['Tameya Plate','طبق طعمية',75],
      ['Club Sandwich','شطيرة كلوب',180]
    ]},
    { id:'starters', icon:'leaf', name:{ar:'شوربة ومقبلات', en:'Soups & Starters'}, items:[
      ['Pigeon Soup','شوربة حمام',180],
      ['Knuckles Soup','شوربة كوارع',220],
      ['Lesan Asfour Soup','شوربة لسان عصفور',120],
      ['Seafood Soup','شوربة سي فود',190],
      ['Lentil Soup','شوربة عدس',145],
      ['Mix Appetizers','مقبلات مشكلة',520,'Vine leaves, sambousak, mombar, kobeba, hawawshi','ورق عنب، سمبوسك، ممبار، كبيبة، حواوشي'],
      ['Vine Leaves','ورق عنب',170],
      ['Mombar','ممبار',150],
      ['Rouqaq with Meat','رقاق باللحمة',195],
      ['Kobeba','كبيبة',145],
      ['Bissara','بصارة',120],
      ['Fattoush','فتوش',150],
      ['Rocca Salad','سلطة جرجير',225],
      ['Avocado Seafood','أفوكادو سي فود',355]
    ]},
    { id:'dessert', icon:'star', name:{ar:'حلو', en:'Desserts'}, items:[
      ['Konafa on Coal','كنافة على الفحم',150,'','','kunafa'],
      ['Om Ali','أم علي',120],
      ['Feteera Konafa Pistachio','فطيرة كنافة بستاشيو',350],
      ['Feteera Cinnamon','فطيرة بلح بالقرفة والقشطة',185],
      ['Molten Lava Cake','مولتن لافا كيك',180],
      ['Cheesecake','تشيز كيك',170],
      ['Oreo Madness','أوريو مادنيس',180],
      ['Fruit Platter','طبق فواكه',190],
      ['Gazal Beirut','غزل بيروت',155]
    ]},
    { id:'drinks', icon:'cup', name:{ar:'مشروبات', en:'Drinks'}, items:[
      ['Cocktail Zaza','كوكتيل Zaza',155],
      ['Zaza Lemon','Zaza ليمون',125,'Lemon, orange, pineapple, kiwi syrup','ليمون، برتقال، أناناس، كيوي سيرب'],
      ['Zaza Guava','جوافة Zaza',100],
      ['Natural Passion Fruit','باشون فروت طبيعي',160],
      ['Strawberry Passion','ستروبيري باشن',160],
      ['Electric Mojito','إليكتريك موهيتو',100],
      ['Signature Shake','سيجنتشر شيك',135],
      ['Turkish Coffee on Coal','قهوة تركي على الفحم',85],
      ['Sahlab Nuts','سحلب مكسرات',80],
      ['Herbs Cocktail','كوكتيل أعشاب',80]
    ]}
  ]
};
