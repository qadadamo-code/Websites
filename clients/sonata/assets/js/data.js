/* Sonata Social House – site data.
   NOTE: menu + branches below are a SAMPLE until the client's real menu/bio data is added.
   Contact is Planet Creative Marketing's number (sample-site rule). */
window.SONATA = {
  config: {
    whatsapp: '201203101104',
    phone: '01203101104',
    email: 'info@theplanetco.com',
    instagram: 'https://www.instagram.com/sonatacafe.eg/',
    currency: { ar: 'ج.م', en: 'EGP' }
  },

  branches: [
    { id:'b1', name:{ar:'الفرع الأول', en:'Branch I'}, area:{ar:'القاهرة', en:'Cairo'},
      addr:{ar:'العنوان يُضاف بعد التأكيد', en:'Address to be confirmed'}, hours:{ar:'يوميًا 8 ص – 2 ص', en:'Daily 8 AM – 2 AM'}, img:'interior', map:'' },
    { id:'b2', name:{ar:'الفرع الثاني', en:'Branch II'}, area:{ar:'القاهرة', en:'Cairo'},
      addr:{ar:'العنوان يُضاف بعد التأكيد', en:'Address to be confirmed'}, hours:{ar:'يوميًا 8 ص – 2 ص', en:'Daily 8 AM – 2 AM'}, img:'terrace', map:'' },
    { id:'b3', name:{ar:'الفرع الثالث', en:'Branch III'}, area:{ar:'القاهرة', en:'Cairo'},
      addr:{ar:'العنوان يُضاف بعد التأكيد', en:'Address to be confirmed'}, hours:{ar:'يوميًا 8 ص – 2 ص', en:'Daily 8 AM – 2 AM'}, img:'table', map:'' }
  ],

  /* item: [en, ar, price, descEn, descAr, img, tag]  tag: 'sig' | 'new' | 'veg' */
  menu: [
    { id:'breakfast', num:'I', name:{ar:'الفطور', en:'Breakfast'}, note:{ar:'حتى 1 ظهرًا', en:'Served until 1 PM'}, items:[
      ['Eggs Benedict','بيض بنديكت',285,'Poached eggs, smoked turkey, hollandaise, toasted brioche','بيض بوشيه، تيركي مدخن، صوص هولنديز، بريوش محمّص','brunch','sig'],
      ['Avocado Sourdough','أفوكادو على خبز ساوردو',245,'Smashed avocado, feta, cherry tomato, chili flakes, poached egg','أفوكادو مهروس، فيتا، طماطم شيري، بيض بوشيه'],
      ['Shakshuka Skillet','شكشوكة في المقلاة',210,'Spiced tomato, peppers, eggs, warm bread','طماطم متبّلة، فلفل، بيض، خبز دافئ'],
      ['French Toast','فرنش توست',225,'Brioche, berries, mascarpone, maple','بريوش، توت، ماسكاربوني، شراب القيقب'],
      ['Sonata Breakfast Board','طبق سوناتا للفطور',495,'For two: eggs your way, cheeses, cold cuts, croissants, jams','لشخصين: بيض حسب الطلب، أجبان، لحوم باردة، كرواسون، مربى',null,'sig'],
      ['Granola Bowl','بول جرانولا',175,'Greek yogurt, house granola, honey, seasonal fruit','زبادي يوناني، جرانولا، عسل، فاكهة الموسم',null,'veg']
    ]},
    { id:'starters', num:'II', name:{ar:'المقبلات والسلطات', en:'Starters & Salads'}, items:[
      ['Burrata & Heirloom Tomato','بوراتا وطماطم',345,'Basil oil, balsamic pearls, sourdough crisp','زيت ريحان، لآلئ بلسميك، خبز مقرمش','burrata','sig'],
      ['Truffle Fries','بطاطس بالترافل',165,'Parmesan, truffle oil, herbs','بارميزان، زيت ترافل، أعشاب'],
      ['Crispy Calamari','كاليماري مقرمش',265,'Lemon aioli, chili salt','أيولي ليمون، ملح حار'],
      ['Caesar Salad','سلطة سيزر',235,'Romaine, parmesan, croutons, grilled chicken','خس روماني، بارميزان، خبز محمّص، دجاج مشوي'],
      ['Beef Carpaccio','كارباتشيو لحم',325,'Rocket, parmesan, capers, truffle mayo','جرجير، بارميزان، كابر، مايونيز ترافل'],
      ['Quinoa & Roasted Beet','كينوا وبنجر مشوي',215,'Goat cheese, walnuts, citrus dressing','جبنة ماعز، عين جمل، صوص حمضيات',null,'veg']
    ]},
    { id:'mains', num:'III', name:{ar:'الأطباق الرئيسية', en:'Mains'}, items:[
      ['Ribeye Steak 300g','ستيك ريب آي 300 جم',895,'Peppercorn sauce, roasted garlic, mash','صوص الفلفل، ثوم محمّص، بطاطس مهروسة','steak','sig'],
      ['Grilled Salmon','سالمون مشوي',725,'Lemon butter, asparagus, herbs','زبدة بالليمون، هليون، أعشاب','salmon'],
      ['Chicken Milanese','دجاج ميلانيز',395,'Rocket salad, parmesan, lemon','سلطة جرجير، بارميزان، ليمون'],
      ['Beef Tenderloin Medallions','ميدالية فيليه',825,'Mushroom sauce, gratin potato','صوص مشروم، بطاطس جراتان'],
      ['Shrimp Thai Curry','كاري تايلندي بالجمبري',545,'Coconut, lemongrass, jasmine rice','جوز هند، ليمون عشبي، أرز ياسمين'],
      ['Wagyu Burger','برجر واجيو',465,'Cheddar, caramelised onion, brioche, truffle fries','شيدر، بصل مكرمل، بريوش، بطاطس ترافل','burger','sig']
    ]},
    { id:'pasta', num:'IV', name:{ar:'الباستا والريزوتو', en:'Pasta & Risotto'}, items:[
      ['Truffle Tagliatelle','تالياتيلي بالترافل',475,'Black truffle, parmesan cream','ترافل أسود، كريمة بارميزان','pasta','sig'],
      ['Penne Arrabbiata','بيني أرابياتا',245,'Spicy tomato, basil, garlic','طماطم حارة، ريحان، ثوم',null,'veg'],
      ['Fettuccine Alfredo','فيتوتشيني ألفريدو',325,'Chicken, mushroom, cream','دجاج، مشروم، كريمة'],
      ['Seafood Linguine','لينجويني بحري',565,'Shrimp, calamari, mussels, white sauce','جمبري، كاليماري، بلح بحر، صوص أبيض'],
      ['Mushroom Risotto','ريزوتو مشروم',365,'Porcini, parmesan, truffle oil','بورتشيني، بارميزان، زيت ترافل',null,'veg']
    ]},
    { id:'desserts', num:'V', name:{ar:'الحلويات', en:'Desserts'}, items:[
      ['Chocolate Fondant','فوندان شوكولاتة',225,'Vanilla bean ice cream, gold leaf','آيس كريم فانيليا، ورق ذهب','dessert','sig'],
      ['San Sebastián Cheesecake','تشيز كيك سان سيباستيان',215,'Burnt Basque style, berry compote','على الطريقة الباسكية، صوص توت'],
      ['Tiramisu','تيراميسو',195,'Espresso, mascarpone, cocoa','إسبريسو، ماسكاربوني، كاكاو'],
      ['Pistachio Kunafa Crème','كريمة كنافة بالفستق',235,'A Sonata twist on a classic','لمسة سوناتا على الكلاسيك',null,'new']
    ]},
    { id:'coffee', num:'VI', name:{ar:'القهوة', en:'Coffee'}, items:[
      ['Espresso','إسبريسو',85,'Single origin','محصول واحد'],
      ['Flat White','فلات وايت',125,'',''],
      ['Spanish Latte','سبانيش لاتيه',140,'Hot or iced','ساخن أو مثلج','coffee','sig'],
      ['Pistachio Latte','لاتيه بالفستق',155,'',''],
      ['V60 Pour-Over','في 60',145,'Ask for today\'s beans','اسأل عن محصول اليوم'],
      ['Turkish Coffee','قهوة تركي',80,'',''],
    ]},
    { id:'drinks', num:'VII', name:{ar:'المشروبات والموكتيلز', en:'Drinks & Mocktails'}, items:[
      ['Sonata Signature','سوناتا سيجنتشر',175,'Orange, passion fruit, vanilla, soda','برتقال، باشون فروت، فانيليا، صودا','mocktail','sig'],
      ['Berry Nocturne','بيري نوكتيرن',165,'Mixed berries, mint, lime','توت مشكّل، نعناع، ليم'],
      ['Classic Mojito','موهيتو كلاسيك',145,'Lime, mint, soda','ليم، نعناع، صودا'],
      ['Fresh Juices','عصائر فريش',125,'Orange · Mango · Strawberry','برتقال · مانجو · فراولة'],
      ['Matcha Tonic','ماتشا تونيك',160,'',''],
      ['Still / Sparkling Water','مياه عادية / فوّارة',55,'','']
    ]}
  ]
};
