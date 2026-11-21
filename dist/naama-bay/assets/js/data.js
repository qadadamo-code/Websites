/* Naama Bay Cafe — data. Prices are SAMPLE prices (the menu on Facebook is from 2022). */
window.NB_CONFIG = {
  whatsapp: '201288989933',          // from the Facebook page (WhatsApp)
  phone: '+201008804272',            // from the Facebook page
  phone2: '+201129698000',           // from the 2022 events flyer
  facebook: 'https://www.facebook.com/khalegneamaa',
  mapQuery: 'Tahta, Sohag, Egypt',
  currency: { ar: 'ج.م', en: 'EGP' }
};

window.NB_CATS = [
  { id: 'hot',    ar: 'مشروبات سخنة',        en: 'Hot drinks',        icon: 'cup' },
  { id: 'fresh',  ar: 'عصاير فريش',          en: 'Fresh juices',      icon: 'glass' },
  { id: 'shake',  ar: 'ميلك شيك وسموزي',     en: 'Shakes & smoothies', icon: 'shake' },
  { id: 'iced',   ar: 'قهوة مثلجة وآيس كريم', en: 'Iced coffee & ice cream', icon: 'ice' },
  { id: 'sweet',  ar: 'حلويات',              en: 'Desserts',          icon: 'cake' },
  { id: 'shisha', ar: 'ركن الشيشة',          en: 'Shisha corner',     icon: 'shisha' },
  { id: 'soft',   ar: 'مشروبات غازية ومياه',  en: 'Soft drinks & water', icon: 'can' }
];

/* t: tag (sig = signature, new, hot = winter pick) */
window.NB_MENU = [
  // hot
  { id: 'h1', c: 'hot', ar: 'هوت سيدر', en: 'Hot apple cider', p: 50, img: 'hot0', t: 'sig', dar: 'تفاح وقرفة وقعدة على النيل', den: 'Apple, cinnamon and a Nile breeze' },
  { id: 'h2', c: 'hot', ar: 'شاي بالنعناع', en: 'Mint tea', p: 25, img: 'hot1' },
  { id: 'h3', c: 'hot', ar: 'شاي أخضر', en: 'Green tea', p: 25 },
  { id: 'h4', c: 'hot', ar: 'ينسون', en: 'Anise', p: 25 },
  { id: 'h5', c: 'hot', ar: 'كركديه سخن', en: 'Hot hibiscus', p: 25 },
  { id: 'h6', c: 'hot', ar: 'قرفة باللبن', en: 'Cinnamon with milk', p: 35 },
  { id: 'h7', c: 'hot', ar: 'جنزبيل بالليمون', en: 'Ginger lemon', p: 30 },
  { id: 'h8', c: 'hot', ar: 'سحلب مكسرات', en: 'Sahlab with nuts', p: 55, img: 'hot3', t: 'hot' },
  { id: 'h9', c: 'hot', ar: 'قهوة تركي', en: 'Turkish coffee', p: 35 },
  { id: 'h10', c: 'hot', ar: 'قهوة بندق', en: 'Hazelnut coffee', p: 45 },
  { id: 'h11', c: 'hot', ar: 'قهوة فرنساوي', en: 'French coffee', p: 45 },
  { id: 'h12', c: 'hot', ar: 'كابتشينو', en: 'Cappuccino', p: 55, img: 'hot5' },
  { id: 'h13', c: 'hot', ar: 'هوت شوكليت', en: 'Hot chocolate', p: 60, img: 'hot4', t: 'hot' },
  { id: 'h14', c: 'hot', ar: 'نسكافيه بلاك', en: 'Black Nescafé', p: 35 },
  // fresh
  { id: 'f1', c: 'fresh', ar: 'عصير مانجو', en: 'Mango juice', p: 55, img: 'cold0' },
  { id: 'f2', c: 'fresh', ar: 'عصير فراولة', en: 'Strawberry juice', p: 50, img: 'cold1' },
  { id: 'f3', c: 'fresh', ar: 'ليمون نعناع', en: 'Mint lemonade', p: 45, img: 'cold2' },
  { id: 'f4', c: 'fresh', ar: 'عصير جوافة', en: 'Guava juice', p: 45, img: 'cold7' },
  { id: 'f5', c: 'fresh', ar: 'عصير برتقال', en: 'Orange juice', p: 50 },
  { id: 'f6', c: 'fresh', ar: 'موز باللبن', en: 'Banana with milk', p: 55 },
  { id: 'f7', c: 'fresh', ar: 'موهيتو', en: 'Virgin mojito', p: 60, img: 'cold6' },
  { id: 'f8', c: 'fresh', ar: 'كوكتيل خليج نعمة', en: 'Naama Bay cocktail', p: 75, img: 'cold8', t: 'sig', dar: 'طبقات فواكه على طريقتنا', den: 'Layers of fresh fruit, our way' },
  // shakes
  { id: 's1', c: 'shake', ar: 'ميلك شيك أوريو', en: 'Oreo milkshake', p: 75, img: 'cold3' },
  { id: 's2', c: 'shake', ar: 'سموزي بلوبيري', en: 'Blueberry smoothie', p: 70, img: 'real-berry', t: 'sig', real: 1, dar: 'من كاميرا خليج نعمة نفسها', den: 'Shot at Naama Bay itself' },
  { id: 's3', c: 'shake', ar: 'سموزي بلوبيري بالطبقات', en: 'Layered berry smoothie', p: 70, img: 'cold4' },
  { id: 's4', c: 'shake', ar: 'ميلك شيك فانيليا', en: 'Vanilla milkshake', p: 65 },
  { id: 's5', c: 'shake', ar: 'ميلك شيك شوكولاتة', en: 'Chocolate milkshake', p: 65 },
  { id: 's6', c: 'shake', ar: 'ميلك شيك لوتس', en: 'Lotus milkshake', p: 75 },
  { id: 's7', c: 'shake', ar: 'زبادي فواكه', en: 'Fruit yogurt', p: 55 },
  { id: 's8', c: 'shake', ar: 'زبادي عسل', en: 'Honey yogurt', p: 50 },
  // iced
  { id: 'i1', c: 'iced', ar: 'آيس لاتيه', en: 'Iced latte', p: 65, img: 'cold5' },
  { id: 'i2', c: 'iced', ar: 'فرابتشينو موكا', en: 'Mocha frappuccino', p: 70 },
  { id: 'i3', c: 'iced', ar: 'فرابتشينو لاتيه', en: 'Latte frappuccino', p: 70 },
  { id: 'i4', c: 'iced', ar: 'آيس كريم سادة', en: 'Ice cream (plain)', p: 40 },
  { id: 'i5', c: 'iced', ar: 'آيس كريم مكسرات', en: 'Ice cream with nuts', p: 55 },
  { id: 'i6', c: 'iced', ar: 'آيس كريم فواكه', en: 'Ice cream with fruit', p: 55 },
  // sweets
  { id: 'd1', c: 'sweet', ar: 'حلو خليج نعمة بالبستاشيو', en: 'Naama pistachio dessert', p: 70, img: 'real-dessert', t: 'sig', real: 1, dar: 'كريمة وبستاشيو وتوت', den: 'Cream, pistachio and berries' },
  { id: 'd2', c: 'sweet', ar: 'مولتن كيك', en: 'Molten cake', p: 80, img: 'hot6' },
  { id: 'd3', c: 'sweet', ar: 'وافل نوتيلا وأوريو', en: 'Nutella & Oreo waffle', p: 85, img: 'hot7' },
  { id: 'd4', c: 'sweet', ar: 'كنافة بالقشطة', en: 'Kunafa with cream', p: 70, img: 'hot8' },
  { id: 'd5', c: 'sweet', ar: 'طاجن شوكولاتة', en: 'Chocolate tagine', p: 75 },
  { id: 'd6', c: 'sweet', ar: 'ديسباسيتو ميني', en: 'Mini Despacito', p: 60 },
  { id: 'd7', c: 'sweet', ar: 'سلطة فواكه', en: 'Fruit salad', p: 55 },
  // shisha
  { id: 'n1', c: 'shisha', ar: 'معسل سلوم', en: 'Classic molasses', p: 50, img: 'shisha' },
  { id: 'n2', c: 'shisha', ar: 'قص حجرين', en: 'Two-head cut', p: 40 },
  { id: 'n3', c: 'shisha', ar: 'تفاح', en: 'Apple', p: 60 },
  { id: 'n4', c: 'shisha', ar: 'بطيخ', en: 'Watermelon', p: 60 },
  { id: 'n5', c: 'shisha', ar: 'كانتلوب', en: 'Cantaloupe', p: 60 },
  { id: 'n6', c: 'shisha', ar: 'مانجو', en: 'Mango', p: 60 },
  { id: 'n7', c: 'shisha', ar: 'ليمون بالنعناع', en: 'Lemon mint', p: 65 },
  { id: 'n8', c: 'shisha', ar: 'بلوبيري', en: 'Blueberry', p: 65 },
  { id: 'n9', c: 'shisha', ar: 'عنب ميكس', en: 'Grape mix', p: 65 },
  { id: 'n10', c: 'shisha', ar: 'كيوي', en: 'Kiwi', p: 60 },
  // soft
  { id: 'o1', c: 'soft', ar: 'بيبسي', en: 'Pepsi', p: 25 },
  { id: 'o2', c: 'soft', ar: 'سبرايت', en: 'Sprite', p: 25 },
  { id: 'o3', c: 'soft', ar: 'شويبس رمان', en: 'Schweppes pomegranate', p: 30 },
  { id: 'o4', c: 'soft', ar: 'شويبس جولد', en: 'Schweppes gold', p: 30 },
  { id: 'o5', c: 'soft', ar: 'بيريل', en: 'Birell', p: 35 },
  { id: 'o6', c: 'soft', ar: 'مياه معدنية صغيرة', en: 'Water (small)', p: 10 },
  { id: 'o7', c: 'soft', ar: 'مياه معدنية كبيرة', en: 'Water (large)', p: 20 }
];

/* Time-of-day mood picker */
window.NB_MOODS = [
  { id: 'dawn',  ar: 'الصبح بدري', en: 'Early morning', time: '7:00', ar2: 'النيل لسه صاحي وهادي', en2: 'The Nile is calm and just waking up', items: ['h2', 'h9', 'h8'] },
  { id: 'noon',  ar: 'العصرية',    en: 'Afternoon',     time: '16:00', ar2: 'شمس وجنينة وحاجة ساقعة', en2: 'Sun, garden and something cold', items: ['f1', 'f7', 'i1'] },
  { id: 'dusk',  ar: 'وقت الغروب', en: 'Sunset',        time: '17:30', ar2: 'أحلى ساعة على التراس', en2: 'The best hour on the terrace', items: ['h1', 'f8', 'n1'] },
  { id: 'night', ar: 'السهرة',     en: 'Late night',    time: '23:00', ar2: 'لمبات منورة وماتش وصحاب', en2: 'Lights on, a match and friends', items: ['h12', 'd3', 'd2'] }
];
