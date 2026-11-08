/* Al Dali Furniture KSA — site content (AR + EN). Prices are placeholders. */
window.AD = {
  config: {
    whatsapp: '201203101104', // TEMP: Planet number until the client sends theirs
    phone: '+201203101104',
    email: 'info@theplanetco.com',
    currency: { ar: 'ر.س', en: 'SAR' }
  },

  rooms: [
    { id: 'bedroom', img: 'bedroom', n: '01',
      ar: { t: 'غرف النوم', s: 'هدوء يليق بنهاية يومك', d: 'أسرّة بمقاسات كينج وكوين، كوميدينوهات، تسريحات ودواليب. خامات ناعمة وألوان تريّح العين.', items: ['أسرّة', 'كوميدينو', 'تسريحات', 'دواليب', 'مراتب'] },
      en: { t: 'Bedrooms', s: 'Calm for the end of your day', d: 'King and queen beds, nightstands, dressers and wardrobes in soft materials and restful tones.', items: ['Beds', 'Nightstands', 'Dressers', 'Wardrobes', 'Mattresses'] } },
    { id: 'corners', img: 'corners', n: '02',
      ar: { t: 'الركنات والمعيشة', s: 'قلب البيت ومكان اللمّة', d: 'ركنات L و U بمقاسات حسب مساحتك، كنب، كراسي فوتيه ووحدات تلفزيون.', items: ['ركنات', 'كنب', 'فوتيه', 'وحدات تلفزيون', 'ترابيزات وسط'] },
      en: { t: 'Corner sofas & living', s: 'Where the family gathers', d: 'L and U corner sofas made to your space, sofas, lounge chairs and TV units.', items: ['Corner sofas', 'Sofas', 'Armchairs', 'TV units', 'Coffee tables'] } },
    { id: 'dining', img: 'dining', n: '03',
      ar: { t: 'السفرة والترابيزات', s: 'سفرة تجمع الكل', d: 'سفرات رخام وخشب من 4 إلى 12 كرسي، بوفيهات، ترابيزات وسط وجانبية.', items: ['سفرات', 'كراسي سفرة', 'بوفيهات', 'ترابيزات وسط', 'ترابيزات جانبية'] },
      en: { t: 'Dining & tables', s: 'A table for everyone', d: 'Marble and wood dining sets for 4 to 12, sideboards, coffee and side tables.', items: ['Dining sets', 'Dining chairs', 'Sideboards', 'Coffee tables', 'Side tables'] } },
    { id: 'majlis', img: 'majlis', n: '04',
      ar: { t: 'المجالس', s: 'ضيافة على أصولها', d: 'مجالس عربية معاصرة وجلسات أرضية بتفصيل حسب طول الجدار، مع مساند وطاولات تقديم.', items: ['مجالس عربية', 'جلسات أرضية', 'مساند', 'طاولات تقديم'] },
      en: { t: 'Majlis', s: 'Hospitality done right', d: 'Contemporary Arabic majlis and floor seating tailored to your wall length, with bolsters and serving tables.', items: ['Arabic majlis', 'Floor seating', 'Bolsters', 'Serving tables'] } },
    { id: 'kids', img: 'kids', n: '05',
      ar: { t: 'غرف الأطفال', s: 'عالم صغير يكبر معهم', d: 'أسرّة أطفال آمنة، مكاتب مذاكرة، رفوف ودواليب بألوان مرحة وخامات صديقة للطفل.', items: ['أسرّة أطفال', 'مكاتب', 'رفوف', 'دواليب'] },
      en: { t: 'Kids rooms', s: 'A little world that grows with them', d: 'Safe kids beds, study desks, shelves and wardrobes in playful, child-friendly finishes.', items: ['Kids beds', 'Desks', 'Shelves', 'Wardrobes'] } },
    { id: 'entrance', img: 'entrance', n: '06',
      ar: { t: 'المداخل والكونسول', s: 'أول انطباع عن بيتك', d: 'كونسولات بمرايا، بنشات، جزامات ووحدات تخزين أنيقة للمدخل.', items: ['كونسول', 'مرايا', 'بنشات', 'جزامات'] },
      en: { t: 'Entrances & consoles', s: 'Your home\'s first impression', d: 'Consoles with mirrors, benches, shoe cabinets and elegant entry storage.', items: ['Consoles', 'Mirrors', 'Benches', 'Shoe cabinets'] } },
    { id: 'office', img: 'office', n: '07',
      ar: { t: 'المكاتب المنزلية', s: 'تركيز بشياكة', d: 'مكاتب خشب جوز، كراسي جلد مريحة ومكتبات حائط بالمقاس.', items: ['مكاتب', 'كراسي مكتب', 'مكتبات'] },
      en: { t: 'Home office', s: 'Focus, with style', d: 'Walnut desks, comfortable leather chairs and made-to-measure bookshelves.', items: ['Desks', 'Office chairs', 'Bookshelves'] } },
    { id: 'dressing', img: 'dressing', n: '08',
      ar: { t: 'الدريسنج', s: 'كل شيء في مكانه', d: 'غرف ملابس بتصميم كامل، دواليب زجاج بإضاءة، جزر وسطية وبفات.', items: ['دواليب', 'جزر وسطية', 'بفات', 'مرايا'] },
      en: { t: 'Dressing rooms', s: 'Everything in its place', d: 'Complete walk-in closets, lit glass wardrobes, islands and ottomans.', items: ['Wardrobes', 'Islands', 'Ottomans', 'Mirrors'] } }
  ],

  styles: [
    { id: 'warm', img: 'hero', pal: ['#F5EFE6', '#E4D6C3', '#6E0E14', '#B8925A'],
      ar: { t: 'عصري دافئ', k: 'أبيض دافئ · مخمل أحمر · ترافرتين', d: 'خطوط بسيطة مع لمسة دفء. الأبيض أساس والأحمر نجم القعدة.', f: 'لمن يحب البيت الهادي اللي فيه شخصية' },
      en: { t: 'Warm modern', k: 'Warm white · red velvet · travertine', d: 'Simple lines with warmth. White as the base, red as the star.', f: 'For calm homes with character' } },
    { id: 'modern', img: 's-modern', pal: ['#FFFFFF', '#D9D9D9', '#111111', '#6E0E14'],
      ar: { t: 'مودرن مينيمال', k: 'أبيض وأسود · زجاج · كروم', d: 'أقل قطع، أوضح خطوط، ومساحة تتنفس.', f: 'لمن يحب الترتيب والوضوح' },
      en: { t: 'Modern minimal', k: 'Black & white · glass · chrome', d: 'Fewer pieces, clearer lines, room to breathe.', f: 'For lovers of order and clarity' } },
    { id: 'neo', img: 's-neo', pal: ['#F7F2EA', '#E8DCC8', '#C9A66B', '#7A1A20'],
      ar: { t: 'نيو كلاسيك', k: 'كابتونيه · بانوهات · ذهبي ناعم', d: 'فخامة الكلاسيك بروح أخف وأحدث.', f: 'لمن يحب الفخامة بدون مبالغة' },
      en: { t: 'Neo-classic', k: 'Tufting · wall panels · soft gold', d: 'Classic luxury with a lighter, modern spirit.', f: 'For understated luxury' } },
    { id: 'classic', img: 's-classic', pal: ['#5A0A10', '#8E1B22', '#C8A04A', '#2B1A12'],
      ar: { t: 'كلاسيك ملكي', k: 'خشب محفور · دمسكو · كريستال', d: 'تفاصيل غنية وألوان عميقة وحضور ملكي.', f: 'لمن يحب الهيبة والتفاصيل' },
      en: { t: 'Royal classic', k: 'Carved wood · damask · crystal', d: 'Rich details, deep colours and a regal presence.', f: 'For grandeur and detail' } },
    { id: 'japandi', img: 's-japandi', pal: ['#EFE8DD', '#D7C4A8', '#A9744F', '#7C2E1E'],
      ar: { t: 'طبيعي هادئ', k: 'خشب فاتح · كتان · جوت', d: 'خامات طبيعية وألوان ترابية وسكينة يابانية إسكندنافية.', f: 'لمن يحب الطبيعة والهدوء' },
      en: { t: 'Natural calm', k: 'Light oak · linen · jute', d: 'Natural materials, earthy tones and Japandi serenity.', f: 'For nature and quiet' } },
    { id: 'majlis', img: 's-majlis', pal: ['#F4EDE2', '#6E0E14', '#B8925A', '#4A2B1A'],
      ar: { t: 'مجلس عربي معاصر', k: 'مشربية · سدو · نحاس', d: 'روح الضيافة السعودية بتصميم عصري.', f: 'لمن يعتز بالهوية ويحب الضيافة' },
      en: { t: 'Contemporary Arabian', k: 'Mashrabiya · Sadu · brass', d: 'Saudi hospitality in a contemporary design.', f: 'For heritage and hospitality' } }
  ],

  quiz: [
    { ar: 'أي لوحة ألوان تريّحك أكثر؟', en: 'Which palette feels most like you?',
      o: [ { ar: 'أبيض وبيج مع أحمر', en: 'White, beige & red', s: { warm: 2, neo: 1 } },
           { ar: 'أبيض وأسود صافي', en: 'Pure black & white', s: { modern: 2 } },
           { ar: 'أحمر عميق وذهبي', en: 'Deep red & gold', s: { classic: 2, majlis: 1 } },
           { ar: 'ألوان ترابية وخشب', en: 'Earthy tones & wood', s: { japandi: 2 } } ] },
    { ar: 'كيف تقضي سهرتك في البيت؟', en: 'How do you spend an evening at home?',
      o: [ { ar: 'ضيوف وقهوة ومجلس عامر', en: 'Guests, coffee, a full majlis', s: { majlis: 2, classic: 1 } },
           { ar: 'لمّة العيلة قدام التلفزيون', en: 'Family time in front of the TV', s: { warm: 2 } },
           { ar: 'كتاب وهدوء', en: 'A book and quiet', s: { japandi: 2, modern: 1 } },
           { ar: 'عشاء أنيق على السفرة', en: 'An elegant dinner', s: { neo: 2, classic: 1 } } ] },
    { ar: 'أي خامة تحب تلمسها؟', en: 'Which material do you love to touch?',
      o: [ { ar: 'مخمل ناعم', en: 'Soft velvet', s: { warm: 1, neo: 1, classic: 1 } },
           { ar: 'رخام وزجاج', en: 'Marble & glass', s: { modern: 2, neo: 1 } },
           { ar: 'كتان وخشب طبيعي', en: 'Linen & natural wood', s: { japandi: 2 } },
           { ar: 'خشب محفور ونحاس', en: 'Carved wood & brass', s: { majlis: 2, classic: 1 } } ] },
    { ar: 'بيتك بكلمة واحدة؟', en: 'Your home in one word?',
      o: [ { ar: 'دافئ', en: 'Warm', s: { warm: 2 } },
           { ar: 'فخم', en: 'Grand', s: { classic: 2, neo: 1 } },
           { ar: 'بسيط', en: 'Simple', s: { modern: 2, japandi: 1 } },
           { ar: 'أصيل', en: 'Authentic', s: { majlis: 2 } } ] }
  ],

  filters: [
    { id: 'all', ar: 'الكل', en: 'All' },
    { id: 'bedroom', ar: 'النوم', en: 'Bedroom' },
    { id: 'corners', ar: 'المعيشة والركنات', en: 'Living' },
    { id: 'dining', ar: 'السفرة والترابيزات', en: 'Dining & tables' },
    { id: 'majlis', ar: 'المجالس', en: 'Majlis' },
    { id: 'entrance', ar: 'المداخل', en: 'Entrance' }
  ],

  products: [
    { id: 'corner', img: 'p-corner', room: 'corners', price: 8900, tag: 'new', colors: ['#EFE8DE', '#C9B9A3', '#6E0E14'],
      ar: { t: 'ركنة «لُجين»', s: 'ركنة L بوكليه بمقاس حسب المساحة', size: '320 × 220 سم' }, en: { t: 'Lujain corner sofa', s: 'Bouclé L-shape, made to your space', size: '320 × 220 cm' } },
    { id: 'sofa', img: 'p-sofa', room: 'corners', price: 5400, colors: ['#EAE2D6', '#8C7A66', '#6E0E14'],
      ar: { t: 'كنبة «نَجد»', s: 'كنبة 3 مقاعد كتان بقاعدة جوز', size: '230 × 95 سم' }, en: { t: 'Najd sofa', s: 'Three-seater linen on walnut base', size: '230 × 95 cm' } },
    { id: 'armchair', img: 'p-armchair', room: 'corners', price: 2300, tag: 'best', colors: ['#6E0E14', '#2E3B33', '#D9CBB8'],
      ar: { t: 'فوتيه «رُمّان»', s: 'مخمل أحمر بأرجل نحاسية', size: '85 × 80 سم' }, en: { t: 'Rumman armchair', s: 'Red velvet on brass legs', size: '85 × 80 cm' } },
    { id: 'coffee', img: 'p-coffee', room: 'dining', price: 1900, colors: ['#D8C7AE', '#EDEAE4'],
      ar: { t: 'ترابيزة «ترافرتين»', s: 'ترابيزة وسط حجر طبيعي', size: 'قطر 100 سم' }, en: { t: 'Travertine table', s: 'Natural stone coffee table', size: 'Ø 100 cm' } },
    { id: 'tv', img: 'p-tv', room: 'corners', price: 3200, colors: ['#5B3A24', '#C9A27A'],
      ar: { t: 'وحدة تلفزيون «سدير»', s: 'خشب جوز بأبواب مضلّعة', size: '220 × 55 سم' }, en: { t: 'Sudair TV unit', s: 'Walnut with fluted doors', size: '220 × 55 cm' } },
    { id: 'bed', img: 'p-bed', room: 'bedroom', price: 7600, tag: 'new', colors: ['#EFE8DE', '#B9A994', '#6E0E14'],
      ar: { t: 'سرير «الغيم»', s: 'كينج بظهر كابتونيه طولي', size: '200 × 200 سم' }, en: { t: 'Al Ghaim bed', s: 'King with channel-tufted headboard', size: '200 × 200 cm' } },
    { id: 'night', img: 'p-night', room: 'bedroom', price: 1150, colors: ['#5B3A24', '#EDE6DA'],
      ar: { t: 'كوميدينو «جوز»', s: 'درجين بمقابض نحاسية', size: '55 × 45 سم' }, en: { t: 'Jouz nightstand', s: 'Two drawers, brass pulls', size: '55 × 45 cm' } },
    { id: 'wardrobe', img: 'p-wardrobe', room: 'bedroom', price: 6800, colors: ['#F1EBDF', '#D8CDBD'],
      ar: { t: 'دولاب «لؤلؤ»', s: '4 ضلف لاكيه عاجي', size: '200 × 230 سم' }, en: { t: 'Lulu wardrobe', s: 'Four-door ivory lacquer', size: '200 × 230 cm' } },
    { id: 'dining', img: 'p-dining', room: 'dining', price: 9800, tag: 'best', colors: ['#F2F0EC', '#6E0E14'],
      ar: { t: 'سفرة «رُخام»', s: 'رخام أبيض مع 6 كراسي مخمل', size: '200 × 100 سم' }, en: { t: 'Rukham dining set', s: 'White marble with six velvet chairs', size: '200 × 100 cm' } },
    { id: 'chair', img: 'p-chair', room: 'dining', price: 890, colors: ['#6E0E14', '#D9CBB8', '#2E3B33'],
      ar: { t: 'كرسي «مخمل»', s: 'كرسي سفرة مبطن بأرجل جوز', size: '50 × 58 سم' }, en: { t: 'Makhmal chair', s: 'Upholstered dining chair, walnut legs', size: '50 × 58 cm' } },
    { id: 'console', img: 'p-console', room: 'entrance', price: 2700, colors: ['#5B3A24', '#B8925A'],
      ar: { t: 'كونسول «قوس»', s: 'كونسول جوز مع مراية نحاس', size: '140 × 40 سم' }, en: { t: 'Qaws console', s: 'Walnut console with brass mirror', size: '140 × 40 cm' } },
    { id: 'majlis', img: 'p-majlis', room: 'majlis', price: 4500, tag: 'custom', colors: ['#F1E9DC', '#6E0E14', '#B8925A'],
      ar: { t: 'مجلس «سَدو»', s: 'جلسة عربية بالمتر مع مساند', size: 'السعر للمتر الطولي' }, en: { t: 'Sadu majlis', s: 'Arabic seating per metre with bolsters', size: 'Price per running metre' } }
  ],

  steps: [
    { ar: ['نتعرّف على ذوقك', 'جلسة استشارة نفهم فيها أسلوبك وألوانك وطريقة عيشك.'], en: ['We learn your taste', 'A consultation to understand your style, colours and lifestyle.'] },
    { ar: ['نقيس المساحة', 'نزور البيت أو تبعت لنا المقاسات، ونخطط توزيع كل غرفة.'], en: ['We measure the space', 'We visit or you send measurements, and we plan each room.'] },
    { ar: ['نختار القطع والخامات', 'عيّنات أقمشة وأخشاب ورخام قدامك، وتصميم يجمع البيت كله.'], en: ['We choose pieces & materials', 'Fabric, wood and marble samples, one design for the whole home.'] },
    { ar: ['نوصّل ونركّب', 'فريقنا يوصّل ويركّب ويرتّب لين يصير البيت جاهز للسكن.'], en: ['We deliver & install', 'Our team delivers, installs and styles until it is ready to live in.'] }
  ],

  promises: [
    { ar: ['تفصيل بالمقاس', 'كل ركنة ومجلس ودولاب حسب مساحتك.'], en: ['Made to measure', 'Every sofa, majlis and wardrobe fits your space.'] },
    { ar: ['استشارة ذوق مجانية', 'نساعدك تختار الأسلوب المناسب لبيتك.'], en: ['Free taste consultation', 'We help you choose the right style.'] },
    { ar: ['توصيل وتركيب', 'لباب البيت، وتركيب على يد فريقنا.'], en: ['Delivery & installation', 'To your door, installed by our team.'] },
    { ar: ['ضمان على الصناعة', 'خامات مختارة وتشطيب نفتخر فيه.'], en: ['Craft warranty', 'Selected materials, finishing we are proud of.'] }
  ],

  cities: [
    { ar: 'الرياض', en: 'Riyadh' }, { ar: 'جدة', en: 'Jeddah' }, { ar: 'الدمام والخبر', en: 'Dammam & Khobar' },
    { ar: 'مكة المكرمة', en: 'Makkah' }, { ar: 'المدينة المنورة', en: 'Madinah' }, { ar: 'مدينة أخرى', en: 'Other city' }
  ]
};
