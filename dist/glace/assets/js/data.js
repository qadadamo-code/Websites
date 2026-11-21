/* glacé — menu & config (PLACEHOLDER prices/contacts until the client sends real ones) */
window.GL_CONFIG = {
  whatsapp: '201203101104',          // TEMP: Planet WhatsApp
  phone: '01203101104',
  email: 'info@theplanetco.com',
  currency: { ar: 'ج.م', en: 'EGP' },
  hours: { open: 10, close: 26 },     // 10 AM – 2 AM (26 = 2 AM next day)
  delivery: 25, freeOver: 350
};

/* Gelato flavors: c = scoop color, d = darker shade for frill, x = extra price per scoop */
window.GL_FLAVORS = [
  { id:'velvet',   ar:'ريد فيلفت جلاسيه', en:'Glacé Red Velvet', c:'#9B2A3E', d:'#6E1526', x:10, tag:{ar:'توقيعنا',en:'Signature'}, note:{ar:'كيكة ريد فيلفت وكريم تشيز في جيلاتو واحد.',en:'Red velvet cake folded into cream-cheese gelato.'} },
  { id:'pistachio',ar:'بستاشيو',          en:'Pistachio',        c:'#B5C27E', d:'#8D9C55', x:15, note:{ar:'فستق حلبي محمّص ببطء، طعم صريح ومالح خفيف.',en:'Slow-roasted pistachio, honest and lightly salted.'} },
  { id:'vanilla',  ar:'فانيليا مدغشقر',    en:'Madagascar Vanilla',c:'#F4E7C8', d:'#DCC79A', x:0,  note:{ar:'حبوب فانيليا حقيقية، الكلاسيك اللي ما بيغلطش.',en:'Real vanilla beans — the classic that never misses.'} },
  { id:'choc',     ar:'شوكولاتة داكنة',    en:'Dark Chocolate',   c:'#5B3324', d:'#3E2015', x:0,  note:{ar:'كاكاو 70% كثيف وناعم.',en:'Dense, silky 70% cacao.'} },
  { id:'straw',    ar:'فراولة طازجة',      en:'Fresh Strawberry', c:'#F2A3B1', d:'#D97A8C', x:0,  note:{ar:'فراولة موسمية بدون ألوان صناعية.',en:'Seasonal strawberries, no artificial colour.'} },
  { id:'caramel',  ar:'كراميل مملّح',       en:'Salted Caramel',   c:'#CC8E52', d:'#A96B32', x:0,  note:{ar:'كراميل محروق على مهل مع رشة ملح بحري.',en:'Slow-burnt caramel with a pinch of sea salt.'} },
  { id:'lotus',    ar:'لوتس',              en:'Lotus Biscoff',    c:'#BE8048', d:'#94592A', x:10, note:{ar:'بسكويت لوتس وكريمة لوتس في كل معلقة.',en:'Biscoff crumbs and spread in every spoon.'} },
  { id:'mango',    ar:'مانجو',             en:'Mango',            c:'#F7C04A', d:'#DB9C1E', x:0,  note:{ar:'مانجو عويسي، سوربيه منعش بدون ألبان.',en:'Ewais mango sorbet, dairy-free.'} },
  { id:'rose',     ar:'ورد وهيل',          en:'Rose & Cardamom',  c:'#EDBBC6', d:'#CF93A1', x:5,  note:{ar:'لمسة شرقية: ماء ورد وهيل مطحون.',en:'An Eastern touch: rose water and ground cardamom.'} },
  { id:'blue',     ar:'توت أزرق',          en:'Blueberry',        c:'#8277B5', d:'#5F5493', x:0,  note:{ar:'توت أزرق وزبادي، حامض وحلو.',en:'Blueberry ripple yoghurt, tangy-sweet.'} },
  { id:'mint',     ar:'نعناع وشوكولاتة',    en:'Mint Choc Chip',   c:'#AEDDC6', d:'#83BFA2', x:0,  note:{ar:'نعناع منعش مع رقائق شوكولاتة.',en:'Cool mint with dark chocolate shards.'} },
  { id:'lemon',    ar:'ليمون ونعناع',       en:'Lemon & Mint',     c:'#F2E58C', d:'#D6C65C', x:0,  note:{ar:'سوربيه ليمون بالنعناع، صيفي جدًا.',en:'Lemon-mint sorbet, pure summer.'} }
];

window.GL_VESSELS = [
  { id:'cup',   ar:'كوب',         en:'Cup',          p:0 },
  { id:'cone',  ar:'كون',          en:'Cone',         p:0 },
  { id:'waffle',ar:'كون وافل',     en:'Waffle cone',  p:15 }
];
window.GL_SCOOP_PRICE = [0, 65, 115, 155]; // 1,2,3 scoops
window.GL_TOPPINGS = [
  { id:'choc',   ar:'صوص شوكولاتة', en:'Chocolate sauce', c:'#3B1D12', p:10, kind:'sauce' },
  { id:'caramel',ar:'صوص كراميل',   en:'Caramel drizzle', c:'#C47F38', p:10, kind:'sauce' },
  { id:'pist',   ar:'فستق مجروش',   en:'Crushed pistachio',c:'#9DB062', p:20, kind:'crumb' },
  { id:'sprinkle',ar:'سبرينكلز',     en:'Sprinkles',       c:'multi',   p:8,  kind:'sprinkle' },
  { id:'lotus',  ar:'فتات لوتس',    en:'Lotus crumb',     c:'#A86A33', p:12, kind:'crumb' },
  { id:'cream',  ar:'كريمة',        en:'Whipped cream',   c:'#FFF8EE', p:10, kind:'cream' }
];

/* Menu. img = category banner. p = price (EGP). o = options [{ar,en,p}] (p = absolute price) */
window.GL_MENU = [
  { id:'gelato', ar:'جيلاتو', en:'Gelato', img:'case', sub:{ar:'12 نكهة طازجة كل يوم — اختار سكوب أو اعمل كوبك في الاستوديو.',en:'12 flavors churned daily — grab a scoop or build yours in the studio.'}, items:[
    { id:'g1', ar:'سكوب واحد', en:'Single scoop', p:65, d:{ar:'كوب أو كون، أي نكهة.',en:'Cup or cone, any flavor.'} },
    { id:'g2', ar:'سكوبين', en:'Double scoop', p:115, d:{ar:'نكهتين على مزاجك.',en:'Two flavors of your choice.'} },
    { id:'g3', ar:'تلات سكوبات', en:'Triple scoop', p:155, d:{ar:'للي مش عارف يختار.',en:'For the indecisive.'} },
    { id:'g4', ar:'علبة نص كيلو', en:'Half-kilo tub', p:290, d:{ar:'لحد 3 نكهات، تيك أواي.',en:'Up to 3 flavors, to take home.'}, tag:{ar:'للبيت',en:'Take home'} },
    { id:'g5', ar:'علبة كيلو', en:'One-kilo tub', p:540, d:{ar:'لحد 4 نكهات + صوص مجاني.',en:'Up to 4 flavors + free sauce.'} }
  ]},
  { id:'sig', ar:'توقيعات جلاسيه', en:'Glacé Signatures', img:'sundae', sub:{ar:'الحاجات اللي اتعرفنا بيها.',en:'The ones we are known for.'}, items:[
    { id:'s1', ar:'رويال صنداي جلاسيه', en:'Glacé Royal Sundae', p:145, d:{ar:'ريد فيلفت وفانيليا وفراولة، براونيز، كريمة وكرزة.',en:'Red velvet, vanilla & strawberry, brownie, cream, cherry.'}, tag:{ar:'الأكثر طلبًا',en:'Best seller'} },
    { id:'s2', ar:'كوب كنافة بستاشيو', en:'Pistachio Kunafa Cup', p:125, d:{ar:'كنافة مقرمشة دافية وسكوب بستاشيو وفستق.',en:'Warm crisp kunafa, pistachio scoop, crushed nuts.'}, tag:{ar:'جديد',en:'New'} },
    { id:'s3', ar:'أفوجاتو', en:'Affogato', p:95, d:{ar:'سكوب فانيليا وشوت إسبريسو سخن فوقه.',en:'Vanilla scoop drowned in a hot espresso shot.'} },
    { id:'s4', ar:'براوني صنداي', en:'Brownie Sundae', p:135, d:{ar:'براوني دافي، سكوبين، صوص شوكولاتة.',en:'Warm brownie, two scoops, fudge sauce.'} },
    { id:'s5', ar:'بنانا سبليت', en:'Banana Split', p:140, d:{ar:'موز، 3 سكوبات، صوصات وكريمة.',en:'Banana, three scoops, sauces and cream.'} },
    { id:'s6', ar:'ساندوتش جيلاتو بريوش', en:'Gelato Brioche', p:110, d:{ar:'بريوش دافي محشي سكوب على اختيارك.',en:'Warm brioche stuffed with a scoop of your choice.'} }
  ]},
  { id:'hot', ar:'قهوة سخنة', en:'Hot Coffee', img:'latte', sub:{ar:'بن مختص محمّص طازة، وحليب على مزاجك.',en:'Freshly roasted specialty beans, milk your way.'}, items:[
    { id:'h1', ar:'إسبريسو', en:'Espresso', p:45, o:[{ar:'سينجل',en:'Single',p:45},{ar:'دبل',en:'Double',p:60}] },
    { id:'h2', ar:'أمريكانو', en:'Americano', p:55 },
    { id:'h3', ar:'كابتشينو', en:'Cappuccino', p:70, o:[{ar:'وسط',en:'Regular',p:70},{ar:'كبير',en:'Large',p:85}] },
    { id:'h4', ar:'لاتيه', en:'Latte', p:75, o:[{ar:'وسط',en:'Regular',p:75},{ar:'كبير',en:'Large',p:90}] },
    { id:'h5', ar:'فلات وايت', en:'Flat White', p:80 },
    { id:'h6', ar:'سبانش لاتيه', en:'Spanish Latte', p:85 },
    { id:'h7', ar:'موكا', en:'Mocha', p:85 },
    { id:'h8', ar:'لاتيه جلاسيه بالورد والهيل', en:'Glacé Rose & Cardamom Latte', p:90, tag:{ar:'توقيعنا',en:'Signature'}, d:{ar:'لاتيه ناعم بلمسة ورد وهيل.',en:'Silky latte with rose and cardamom.'} },
    { id:'h9', ar:'قهوة تركي', en:'Turkish Coffee', p:40, o:[{ar:'سينجل',en:'Single',p:40},{ar:'دبل',en:'Double',p:55}] },
    { id:'h10', ar:'V60 فلتر', en:'V60 Pour-over', p:95, d:{ar:'بن الأسبوع، اسأل الباريستا.',en:'Bean of the week — ask the barista.'} },
    { id:'h11', ar:'هوت شوكليت', en:'Hot Chocolate', p:75 }
  ]},
  { id:'iced', ar:'قهوة مثلجة', en:'Iced Coffee', img:'iced', sub:{ar:'تلج كتير، طعم تقيل.',en:'Lots of ice, bold taste.'}, items:[
    { id:'i1', ar:'آيس لاتيه', en:'Iced Latte', p:80 },
    { id:'i2', ar:'آيس سبانش لاتيه', en:'Iced Spanish Latte', p:90, tag:{ar:'الأكثر طلبًا',en:'Best seller'} },
    { id:'i3', ar:'آيس كراميل ماكياتو', en:'Iced Caramel Macchiato', p:95 },
    { id:'i4', ar:'آيس موكا', en:'Iced Mocha', p:90 },
    { id:'i5', ar:'كولد برو', en:'Cold Brew', p:85, d:{ar:'منقوع 18 ساعة.',en:'Steeped for 18 hours.'} },
    { id:'i6', ar:'آيس ريد فيلفت لاتيه', en:'Iced Red Velvet Latte', p:95, tag:{ar:'توقيعنا',en:'Signature'} }
  ]},
  { id:'shake', ar:'فرابيه وميلك شيك', en:'Frappé & Shakes', img:'shakes', sub:{ar:'معمولين بالجيلاتو بتاعنا، مش بودرة.',en:'Blended with our own gelato, never powder.'}, items:[
    { id:'f1', ar:'كراميل فرابيه', en:'Caramel Frappé', p:100 },
    { id:'f2', ar:'موكا فرابيه', en:'Mocha Frappé', p:100 },
    { id:'f3', ar:'ميلك شيك فراولة', en:'Strawberry Shake', p:105 },
    { id:'f4', ar:'ميلك شيك بستاشيو', en:'Pistachio Shake', p:125, tag:{ar:'جديد',en:'New'} },
    { id:'f5', ar:'ميلك شيك لوتس', en:'Lotus Shake', p:115 },
    { id:'f6', ar:'ميلك شيك أوريو', en:'Oreo Shake', p:110 }
  ]},
  { id:'waffle', ar:'وافل وكريب', en:'Waffles & Crêpes', img:'waffle', sub:{ar:'دافي من المكنة، وسكوب جيلاتو فوقه.',en:'Hot off the iron, crowned with gelato.'}, items:[
    { id:'w1', ar:'وافل كلاسيك + سكوب', en:'Classic Waffle + Scoop', p:120 },
    { id:'w2', ar:'وافل نوتيلا وفراولة', en:'Nutella Strawberry Waffle', p:135 },
    { id:'w3', ar:'وافل لوتس', en:'Lotus Waffle', p:140 },
    { id:'w4', ar:'كريب نوتيلا وموز', en:'Nutella Banana Crêpe', p:110 },
    { id:'w5', ar:'كريب بستاشيو', en:'Pistachio Crêpe', p:135 },
    { id:'w6', ar:'ميني بان كيك', en:'Mini Pancakes', p:100 }
  ]},
  { id:'dessert', ar:'حلويات', en:'Desserts', img:'pistachio', sub:{ar:'قطعة جنب القهوة.',en:'A slice beside your coffee.'}, items:[
    { id:'d1', ar:'تشيز كيك بستاشيو', en:'Pistachio Cheesecake', p:115 },
    { id:'d2', ar:'سان سباستيان', en:'San Sebastián Cheesecake', p:110 },
    { id:'d3', ar:'مولتن كيك + سكوب', en:'Molten Cake + Scoop', p:120 },
    { id:'d4', ar:'تيراميسو', en:'Tiramisu', p:105 }
  ]},
  { id:'fresh', ar:'فريش وأكتر', en:'Fresh & More', img:'fresh', sub:{ar:'والـ "More" اللي على الكوباية.',en:'The "and more" on our cups.'}, items:[
    { id:'r1', ar:'موهيتو باشن فروت', en:'Passion Fruit Mojito', p:85 },
    { id:'r2', ar:'سموزي مانجو', en:'Mango Smoothie', p:80 },
    { id:'r3', ar:'برتقال فريش', en:'Fresh Orange', p:60 },
    { id:'r4', ar:'ليمون نعناع', en:'Lemon Mint', p:55 },
    { id:'r5', ar:'مياه معدنية', en:'Mineral Water', p:15 },
    { id:'r6', ar:'مياه فوارة', en:'Sparkling Water', p:35 }
  ]}
];
