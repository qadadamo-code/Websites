/* Lamset Decor content. Every text is {ar, en}. Prices are starting-from placeholders until the client sends real ones. */
window.LD = {
  config: {
    // TEMP: Planet's WhatsApp until the client sends theirs
    whatsapp: '201203101104',
    phone: '+201203101104',
    phoneTxt: '0120 310 1104'
  },

  // hero frame sequences (0 = use the two stills and blend)
  seq: { d: 40, m: 40 },

  wa: {
    hello: { ar: 'أهلًا لمسة ديكور، عايز أعرف أكتر عن تصميم وفرش شقتي', en: 'Hello Lamset Decor, I would like to know more about designing and furnishing my home' },
    visit: { ar: 'أهلًا لمسة ديكور، عايز أحجز زيارة معاينة ومقاسات للشقة', en: 'Hello Lamset Decor, I would like to book a site visit for my apartment' },
    partner: { ar: 'أهلًا لمسة ديكور، عندي معرض/مصنع/ورشة وعايز أبقى شريك معاكم', en: 'Hello Lamset Decor, I own a showroom/factory/workshop and want to become a partner' }
  },

  // hero pins: position in the end frame (px of the 1120x630 / 630x1120 frames), and when they pop (0..1 of the furnishing phase)
  pins: [
    { d: [505, 535], m: [130, 690], at: .66, t: { ar: 'كنبة مخمل تركواز', en: 'Teal velvet sofa' }, s: { ar: 'مصنع شريك · دمياط', en: 'Partner factory · Damietta' } },
    { d: [830, 423], m: [480, 620], at: .76, t: { ar: 'فوتيه بوكليه', en: 'Bouclé armchair' }, s: { ar: 'ورشة تنجيد شريكة', en: 'Partner upholstery workshop' } },
    { d: [540, 400], m: [300, 700], at: .82, t: { ar: 'ترابيزات جوز وترافرتين', en: 'Walnut & travertine tables' }, s: { ar: 'ورشة نجارة شريكة', en: 'Partner joinery workshop' } },
    { d: [935, 330], m: [530, 500], at: .88, t: { ar: 'أباجورة نحاس', en: 'Brass floor lamp' }, s: { ar: 'معرض إضاءة شريك', en: 'Partner lighting showroom' } },
    { d: [530, 170], m: [315, 160], at: .36, t: { ar: 'تجليد خشب ونور مخفي', en: 'Wood cladding & cove light' }, s: { ar: 'فريق التشطيب بتاعنا', en: 'Our finishing crew' } }
  ],

  // the network: who Lamsa connects
  nodes: [
    { k: 'show', t: { ar: 'معارض الموبيليا', en: 'Furniture showrooms' } },
    { k: 'fact', t: { ar: 'مصانع الأثاث', en: 'Furniture factories' } },
    { k: 'work', t: { ar: 'ورش النجارة والتنجيد', en: 'Joinery & upholstery' } },
    { k: 'light', t: { ar: 'معارض الإضاءة', en: 'Lighting showrooms' } },
    { k: 'decor', t: { ar: 'الديكور والسجاد', en: 'Decor & rugs' } },
    { k: 'crew', t: { ar: 'فرق التشطيب', en: 'Finishing crews' } }
  ],

  styles: [
    { k: 'living', t: { ar: 'مودرن دافي', en: 'Warm modern' }, d: { ar: 'خشب بلوط، مخمل تركواز، ترافرتين ونور مخفي في السقف.', en: 'Oak, teal velvet, travertine and hidden ceiling light.' } },
    { k: 'neoclassic', t: { ar: 'نيو كلاسيك', en: 'Neo-classic' }, d: { ar: 'بانوهات حوائط، نجفة كريستال، باركيه سمكة وقماش حرير.', en: 'Wall mouldings, crystal chandelier, herringbone parquet and silk.' } },
    { k: 'japandi', t: { ar: 'جابندي هادي', en: 'Calm Japandi' }, d: { ar: 'خشب فاتح، كتان، جوت ولمبة ورق. مساحة بتتنفس.', en: 'Pale wood, linen, jute and a paper lantern. A room that breathes.' } }
  ],

  cats: [
    { k: 'all', t: { ar: 'الكل', en: 'All' } },
    { k: 'living', t: { ar: 'معيشة وأنتريه', en: 'Living' } },
    { k: 'bed', t: { ar: 'غرف نوم', en: 'Bedroom' } },
    { k: 'dining', t: { ar: 'سفرة', en: 'Dining' } },
    { k: 'light', t: { ar: 'إضاءة', en: 'Lighting' } },
    { k: 'decor', t: { ar: 'سجاد وديكور', en: 'Rugs & decor' } }
  ],

  products: [
    { id: 'sofa', cat: 'living', img: 'p-sofa', price: 18500, t: { ar: 'كنبة «مدى» مخمل تركواز', en: '“Mada” teal velvet sofa' }, s: { ar: 'مصنع شريك · دمياط', en: 'Partner factory · Damietta' }, m: { ar: '3 مقاعد · 230 سم · رجل بلوط', en: '3 seats · 230 cm · oak legs' } },
    { id: 'armchair', cat: 'living', img: 'p-armchair', price: 9800, t: { ar: 'فوتيه «غيمة» بوكليه', en: '“Ghaima” bouclé armchair' }, s: { ar: 'ورشة تنجيد شريكة', en: 'Partner upholstery workshop' }, m: { ar: 'هيكل جوز · قماش بوكليه', en: 'Walnut frame · bouclé' } },
    { id: 'coffee', cat: 'living', img: 'p-coffee', price: 7400, t: { ar: 'طقم ترابيزات «قمرين»', en: '“Qamarein” nesting tables' }, s: { ar: 'ورشة نجارة شريكة', en: 'Partner joinery workshop' }, m: { ar: 'جوز طبيعي + ترافرتين', en: 'Solid walnut + travertine' } },
    { id: 'tv', cat: 'living', img: 'p-tv', price: 12500, t: { ar: 'وحدة تلفزيون «خطوط»', en: '“Khotout” media console' }, s: { ar: 'ورشة نجارة شريكة', en: 'Partner joinery workshop' }, m: { ar: 'بلوط مضلّع · سطح ترافرتين', en: 'Fluted oak · travertine top' } },
    { id: 'bed', cat: 'bed', img: 'p-bed', price: 24000, t: { ar: 'سرير «سكون» كينج', en: '“Sukoon” king bed' }, s: { ar: 'مصنع شريك', en: 'Partner factory' }, m: { ar: '180×200 · ظهر مبطّن', en: '180×200 · padded headboard' } },
    { id: 'wardrobe', cat: 'bed', img: 'p-wardrobe', price: 16000, t: { ar: 'دولاب «رواق» بابين', en: '“Rewaq” two-door wardrobe' }, s: { ar: 'ورشة نجارة شريكة', en: 'Partner joinery workshop' }, m: { ar: 'بلوط مضلّع · مقابض نحاس', en: 'Fluted oak · brass pulls' } },
    { id: 'dining', cat: 'dining', img: 'p-dining', price: 32000, t: { ar: 'سفرة «مدار» + 4 كراسي', en: '“Madar” table + 4 chairs' }, s: { ar: 'معرض موبيليا شريك', en: 'Partner showroom' }, m: { ar: 'ترافرتين · كراسي بلوط', en: 'Travertine · oak chairs' } },
    { id: 'lamp', cat: 'light', img: 'p-lamp', price: 4200, t: { ar: 'أباجورة «نخلة» نحاس', en: '“Nakhla” brass floor lamp' }, s: { ar: 'معرض إضاءة شريك', en: 'Partner lighting showroom' }, m: { ar: 'نحاس مطفي · شيد كتان', en: 'Brushed brass · linen shade' } },
    { id: 'chand', cat: 'light', img: 'p-chandelier', price: 8900, t: { ar: 'نجفة «أفلاك»', en: '“Aflak” chandelier' }, s: { ar: 'معرض إضاءة شريك', en: 'Partner lighting showroom' }, m: { ar: 'حلقات نحاس · كور أوبال', en: 'Brass rings · opal globes' } },
    { id: 'rug', cat: 'decor', img: 'p-rug', price: 6300, t: { ar: 'سجادة «قناطر» هاند ميد', en: '“Qanater” handmade rug' }, s: { ar: 'معرض ديكور شريك', en: 'Partner decor showroom' }, m: { ar: '200×300 · قطن وجوت', en: '200×300 · cotton & jute' } }
  ],

  // shop the look: hotspots in % of the photo. p = product id, or an inline item
  rooms: [
    { k: 'living', t: { ar: 'المعيشة', en: 'Living' }, spots: [
      { x: 44, y: 84, p: 'sofa' }, { x: 74, y: 67, p: 'armchair' }, { x: 49, y: 69, p: 'coffee' }, { x: 84, y: 52, p: 'lamp' }, { x: 49, y: 59, p: 'tv' }, { x: 22, y: 95, p: 'rug' }
    ] },
    { k: 'bedroom', t: { ar: 'النوم', en: 'Bedroom' }, spots: [
      { x: 42, y: 52, p: 'bed' },
      { x: 66, y: 76, i: { t: { ar: 'بنش مخمل تركواز', en: 'Teal velvet bench' }, s: { ar: 'ورشة تنجيد شريكة', en: 'Partner upholstery workshop' }, price: 5600 } },
      { x: 8, y: 66, i: { t: { ar: 'كومود ترافرتين', en: 'Travertine nightstand' }, s: { ar: 'معرض ديكور شريك', en: 'Partner decor showroom' }, price: 4800 } },
      { x: 30, y: 14, i: { t: { ar: 'تجليد حائط خشب مضلّع', en: 'Fluted wood wall cladding' }, s: { ar: 'ورشة نجارة شريكة', en: 'Partner joinery workshop' }, price: 2200, unit: { ar: 'للمتر', en: 'per m²' } } }
    ] },
    { k: 'dining', t: { ar: 'السفرة', en: 'Dining' }, spots: [
      { x: 52, y: 56, p: 'dining' },
      { x: 58, y: 12, i: { t: { ar: 'نجفة نحاس منحوتة', en: 'Sculpted brass pendant' }, s: { ar: 'معرض إضاءة شريك', en: 'Partner lighting showroom' }, price: 11500 } },
      { x: 18, y: 58, i: { t: { ar: 'بوفيه جوز', en: 'Walnut sideboard' }, s: { ar: 'ورشة نجارة شريكة', en: 'Partner joinery workshop' }, price: 14000 } },
      { x: 34, y: 76, i: { t: { ar: 'كرسي سفرة بلوط', en: 'Oak dining chair' }, s: { ar: 'مصنع شريك', en: 'Partner factory' }, price: 3900 } }
    ] },
    { k: 'kitchen', t: { ar: 'المطبخ', en: 'Kitchen' }, spots: [
      { x: 46, y: 66, i: { t: { ar: 'مطبخ تركواز مطفي + بلوط', en: 'Matte teal + oak kitchen' }, s: { ar: 'مصنع مطابخ شريك', en: 'Partner kitchen factory' }, price: 9500, unit: { ar: 'للمتر الطولي', en: 'per linear m' } } },
      { x: 29, y: 82, i: { t: { ar: 'كرسي بار بلوط', en: 'Oak bar stool' }, s: { ar: 'ورشة نجارة شريكة', en: 'Partner joinery workshop' }, price: 2700 } },
      { x: 57, y: 15, i: { t: { ar: 'إضاءة معلّقة نحاس', en: 'Brass pendant lights' }, s: { ar: 'معرض إضاءة شريك', en: 'Partner lighting showroom' }, price: 1900 } }
    ] }
  ],

  steps: [
    { t: { ar: 'زيارة ومقاسات', en: 'Visit & measure' }, d: { ar: 'مهندسنا بيزورك، بيقيس كل حيطة، وبيسمع إنت عايز تعيش إزاي.', en: 'Our engineer visits, measures every wall and listens to how you want to live.' } },
    { t: { ar: 'تصميم 2D و3D', en: '2D & 3D design' }, d: { ar: 'مخطط فرش كامل وصور 3D واقعية لكل أوضة، وتعديلات لحد ما تقول «هو ده».', en: 'A full layout and realistic 3D renders of every room, revised until you say “that’s it”.' } },
    { t: { ar: 'اختيار من الشركاء', en: 'Pick from partners' }, d: { ar: 'بنرشّح لك قطع من معارض ومصانع وورش شريكة، بأسعار المصنع وخامات شايفها بعينك.', en: 'We shortlist pieces from partner showrooms, factories and workshops at factory prices, in materials you can touch.' } },
    { t: { ar: 'تنفيذ ومتابعة', en: 'Build & supervise' }, d: { ar: 'فريقنا بيتابع التصنيع في الورشة والتشطيب في الموقع خطوة بخطوة، وبيبعت لك صور.', en: 'Our team supervises the workshop and the site step by step, and sends you photos.' } },
    { t: { ar: 'فرش وتسليم المفتاح', en: 'Furnish & hand over' }, d: { ar: 'بنركّب ونفرش ونرتّب لحد آخر مخدة. بتدخل بيتك جاهز.', en: 'We install, furnish and style down to the last cushion. You walk into a ready home.' } }
  ],

  services: [
    { img: 'designer', t: { ar: 'التصميم الداخلي', en: 'Interior design' }, d: { ar: 'مخططات، 3D، لوحة خامات وألوان، وجدول كميات واضح.', en: 'Layouts, 3D, a materials board and a clear bill of quantities.' } },
    { img: 'workshop', t: { ar: 'التنفيذ والتشطيب', en: 'Build & finishing' }, d: { ar: 'جبس، دهانات، أرضيات، تجاليد ونجارة، بإشراف مهندس.', en: 'Gypsum, paint, floors, cladding and joinery, engineer-supervised.' } },
    { img: 'showroom', t: { ar: 'الفرش الكامل', en: 'Full furnishing' }, d: { ar: 'كل قطعة في البيت من شبكة شركائنا، بعقد واحد وضمان واحد.', en: 'Every piece from our partner network, one contract and one warranty.' } },
    { img: 'living', t: { ar: 'تسليم مفتاح', en: 'Turnkey' }, d: { ar: 'من الطوب للمفتاح. إنت تختار، وإحنا نشيل الباقي.', en: 'From bare walls to keys. You choose, we carry the rest.' } }
  ],

  gallery: [
    { img: 'living', t: { ar: 'معيشة مودرن دافية', en: 'Warm modern living' } },
    { img: 'bedroom', t: { ar: 'نوم رئيسية بتجليد خشب', en: 'Master bedroom, wood clad' } },
    { img: 'dining', t: { ar: 'سفرة ترافرتين', en: 'Travertine dining' } },
    { img: 'kitchen', t: { ar: 'مطبخ مفتوح تركواز', en: 'Open teal kitchen' } },
    { img: 'kids', t: { ar: 'أوضة أطفال بقوس', en: 'Arched kids room' } },
    { img: 'office', t: { ar: 'مكتب منزلي', en: 'Home office' } },
    { img: 'neoclassic', t: { ar: 'ريسبشن نيو كلاسيك', en: 'Neo-classic reception' } },
    { img: 'japandi', t: { ar: 'معيشة جابندي', en: 'Japandi living' } }
  ],

  plan: {
    types: [{ ar: 'شقة', en: 'Apartment' }, { ar: 'دوبلكس', en: 'Duplex' }, { ar: 'فيلا', en: 'Villa' }, { ar: 'مكتب / عيادة', en: 'Office / clinic' }],
    stages: [{ ar: 'على الطوب', en: 'Bare shell' }, { ar: 'نص تشطيب', en: 'Semi-finished' }, { ar: 'متشطبة', en: 'Finished' }],
    rooms: [{ ar: 'ريسبشن', en: 'Reception' }, { ar: 'معيشة', en: 'Living' }, { ar: 'نوم رئيسية', en: 'Master bedroom' }, { ar: 'أطفال', en: 'Kids' }, { ar: 'سفرة', en: 'Dining' }, { ar: 'مطبخ', en: 'Kitchen' }, { ar: 'مكتب', en: 'Office' }],
    services: [{ ar: 'تصميم بس', en: 'Design only' }, { ar: 'تصميم + فرش', en: 'Design + furnishing' }, { ar: 'تسليم مفتاح', en: 'Turnkey' }]
  }
};
