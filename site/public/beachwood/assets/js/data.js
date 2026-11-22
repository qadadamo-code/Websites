/* Beachwood content. Every text is {ar, en}. */
window.BW = {
  config: {
    // TEMP: Planet's WhatsApp until the client sends theirs
    whatsapp: '201203101104',
    phone: '+201203101104',
    phoneTxt: '0120 310 1104'
  },

  wa: {
    hello: { ar: 'أهلًا بيتش وود، عايز أستفسر عن التشطيبات الخشب', en: 'Hello Beachwood, I would like to ask about wood finishing' },
    visit: { ar: 'أهلًا بيتش وود، عايز أحجز زيارة للمعرض. ممكن اللوكيشن والمواعيد؟', en: 'Hello Beachwood, I would like to book a showroom visit. Location and hours please?' }
  },

  services: [
    {
      id: 'doors', no: '01', img: 'door',
      t: { ar: 'الأبواب الداخلية', en: 'Interior doors' },
      d: { ar: 'أبواب خشب طبيعي وقشرة بتصميمات هادية، بحلوق ومفصلات خفية وأكسسوار نحاس. بتتقفل بهدوء وبتعيش سنين.', en: 'Solid wood and veneer doors with calm designs, hidden hinges and brass hardware. They close softly and last for years.' },
      items: { ar: ['أبواب شقق وفلل', 'أبواب جرار ومخفية', 'حلوق وبانوهات', 'أبواب مداخل'], en: ['Apartment & villa doors', 'Sliding & hidden doors', 'Frames & trims', 'Entrance doors'] }
    },
    {
      id: 'kitchens', no: '02', img: 'kitchen',
      t: { ar: 'المطابخ', en: 'Kitchens' },
      d: { ar: 'مطابخ خشب وقشرة على مقاس المكان بالملّي، بتقسيمات داخلية ذكية ومفصلات بتقفل لوحدها.', en: 'Wood and veneer kitchens fitted to the millimetre, with smart inner storage and soft-close hinges.' },
      items: { ar: ['مطابخ مودرن ونيو كلاسيك', 'جزر وبارات', 'قشرة طبيعية', 'تقسيمات وأدراج'], en: ['Modern & neo-classic', 'Islands & bars', 'Natural veneer', 'Organisers & drawers'] }
    },
    {
      id: 'dressing', no: '03', img: 'dressing',
      t: { ar: 'الدريسنج والدواليب', en: 'Dressing rooms & wardrobes' },
      d: { ar: 'دريسنج رومز ودواليب حيطة لحيطة، بإضاءة مخفية وتقسيم مدروس لكل قطعة هدوم عندك.', en: 'Walk-in dressing rooms and wall-to-wall wardrobes with hidden lighting and a place for every piece.' },
      items: { ar: ['دريسنج روم مفتوح', 'دواليب بضلف مضلعة', 'إضاءة LED مخفية', 'وحدات أحذية وشنط'], en: ['Open walk-ins', 'Fluted door wardrobes', 'Hidden LED light', 'Shoe & bag units'] }
    },
    {
      id: 'walls', no: '04', img: 'bedroom',
      t: { ar: 'تجاليد الحوائط والأسقف', en: 'Wall & ceiling cladding' },
      d: { ar: 'شرائح خشب وبانوهات وتجاليد أسقف بتدفّي المكان وبتحسّن صوته. بتغيّر شكل الأوضة في يوم.', en: 'Wood slats, panels and ceiling cladding that warm the room and soften its sound. A new room in a day.' },
      items: { ar: ['شرائح خشب مضلعة', 'خلفيات سراير وتلفزيون', 'تجاليد أسقف', 'بانوهات ديكورية'], en: ['Fluted slats', 'Bed & TV walls', 'Ceiling cladding', 'Decor panels'] }
    },
    {
      id: 'furniture', no: '05', img: 'dining',
      t: { ar: 'الأثاث والمفروشات', en: 'Furniture' },
      d: { ar: 'سفرة، ترابيزات، كراسي ووحدات تلفزيون من نفس الخشب ونفس اللون، علشان البيت كله يبقى حكاية واحدة.', en: 'Dining tables, coffee tables, chairs and TV units in the same wood and tone, so the whole home tells one story.' },
      items: { ar: ['سفرة ونيش', 'ترابيزات وكونسول', 'وحدات تلفزيون', 'مكتبات'], en: ['Dining & buffets', 'Tables & consoles', 'TV units', 'Bookshelves'] }
    },
    {
      id: 'offices', no: '06', img: 'office',
      t: { ar: 'المكاتب والمشاريع', en: 'Offices & projects' },
      d: { ar: 'تشطيب مكاتب إدارية، عيادات ومحلات بالخشب. جدول تنفيذ واضح وفريق تركيب بيشتغل من غير ما يعطّلك.', en: 'Wood finishing for offices, clinics and shops, with a clear schedule and an install team that keeps you running.' },
      items: { ar: ['مكاتب إدارية', 'استقبال وكاونترات', 'عيادات ومحلات', 'مشاريع سكنية كاملة'], en: ['Executive offices', 'Receptions & counters', 'Clinics & retail', 'Full residential projects'] }
    }
  ],

  // wood species: CSS filter on the grain photo + meters (0..5)
  woods: [
    { id: 'beech', latin: 'Fagus sylvatica', tag: 'BEECH', filter: 'none',
      n: { ar: 'زان', en: 'Beech' },
      d: { ar: 'خشب العيلة. لونه عسلي فاتح وعروقه ناعمة ومنتظمة، بيستحمل وبياخد أي دهان.', en: 'Our namesake. Light honey tone with fine, even grain. Strong, and takes any finish.' },
      best: { ar: 'الأبواب، الكراسي، المطابخ', en: 'Doors, chairs, kitchens' },
      m: [4, 4, 3] },
    { id: 'oak', latin: 'Quercus robur', tag: 'OAK', filter: 'saturate(.55) brightness(1.12) hue-rotate(-6deg) contrast(1.05)',
      n: { ar: 'أرو', en: 'Oak' },
      d: { ar: 'عروقه واضحة وشخصيته قوية. اختيار كلاسيكي ما بيقدمش، وبيعيش عمر كامل.', en: 'Bold, visible grain with a strong character. A classic that never ages.' },
      best: { ar: 'الأرضيات، التجاليد، السفرة', en: 'Floors, cladding, dining' },
      m: [5, 5, 4] },
    { id: 'walnut', latin: 'Juglans regia', tag: 'WALNUT', filter: 'brightness(.52) saturate(.85) contrast(1.15) hue-rotate(-8deg)',
      n: { ar: 'جوز', en: 'Walnut' },
      d: { ar: 'غامق ودافي وفخم. أجمل خشب للمكاتب والأماكن اللي محتاجة هيبة وهدوء.', en: 'Dark, warm and rich. The finest choice for offices and calm, confident spaces.' },
      best: { ar: 'المكاتب، الأبواب الرئيسية، الوحدات', en: 'Offices, main doors, units' },
      m: [4, 4, 5] },
    { id: 'mahogany', latin: 'Swietenia', tag: 'MAHOGANY', filter: 'brightness(.66) saturate(1.25) hue-rotate(-16deg) contrast(1.1)',
      n: { ar: 'ماهوجني', en: 'Mahogany' },
      d: { ar: 'لونه نبيتي دافي بيغمق مع الوقت. ثابت جدًا وما بيتأثرش بالرطوبة.', en: 'A warm red-brown that deepens with time. Very stable and resists humidity.' },
      best: { ar: 'الأبواب الخارجية، الأثاث الكلاسيك', en: 'Entrance doors, classic furniture' },
      m: [4, 5, 5] },
    { id: 'ash', latin: 'Fraxinus', tag: 'WHITE ASH', filter: 'saturate(.3) brightness(1.28) contrast(.95)',
      n: { ar: 'أش أبيض', en: 'White ash' },
      d: { ar: 'فاتح جدًا وهادي، بيكبّر المساحة ويديها نور. مثالي للستايل الإسكندنافي.', en: 'Very light and calm, it opens up the space. Perfect for a Scandinavian look.' },
      best: { ar: 'الدريسنج، غرف النوم، الأطفال', en: 'Dressing rooms, bedrooms, kids' },
      m: [4, 3, 3] }
  ],
  meters: { ar: ['الصلابة', 'الثبات', 'الفخامة'], en: ['Hardness', 'Stability', 'Luxury'] },

  steps: [
    { t: { ar: 'معاينة ومقاسات', en: 'Visit & measure' }, d: { ar: 'بنجيلك، نسمع منك ونقيس المساحة بالظبط.', en: 'We visit, listen and measure the space exactly.' } },
    { t: { ar: 'تصميم 3D', en: '3D design' }, d: { ar: 'تشوف شكل المكان قبل ما نقطع لوح واحد، وتعدّل براحتك.', en: 'See your space before a single plank is cut, and adjust freely.' } },
    { t: { ar: 'اختيار الخشب', en: 'Choose the wood' }, d: { ar: 'تختار النوع واللون والتشطيب من عيناتنا في المعرض.', en: 'Pick species, tone and finish from our showroom samples.' } },
    { t: { ar: 'التصنيع', en: 'Making' }, d: { ar: 'في مصنعنا: تجفيف، تقطيع، تعشيق ودهان على مراحل.', en: 'In our factory: drying, cutting, joinery and layered finishing.' } },
    { t: { ar: 'التركيب والتسليم', en: 'Install & hand over' }, d: { ar: 'فريقنا بيركّب وبينضّف وبيسلّمك المكان جاهز.', en: 'Our team installs, cleans up and hands you a ready space.' } }
  ],

  details: [
    { t: { ar: 'خشب متجفف صح', en: 'Properly dried wood' }, d: { ar: 'نسبة رطوبة مضبوطة قبل التصنيع، علشان ما يلفّش ولا يشرخ بعدين.', en: 'Controlled moisture before making, so it never warps or cracks later.' } },
    { t: { ar: 'تعشيق مش مسامير', en: 'Joinery, not just nails' }, d: { ar: 'وصلات خشب في خشب بتشيل الحمل وبتعيش.', en: 'Wood-to-wood joints that carry the load and last.' } },
    { t: { ar: 'دهان على طبقات', en: 'Layered finishing' }, d: { ar: 'سنفرة ودهان على أكتر من مرحلة لحد ما الملمس يبقى حرير.', en: 'Sanded and finished in stages until it feels like silk.' } },
    { t: { ar: 'تركيب نضيف', en: 'Clean installation' }, d: { ar: 'فريقنا بيحمي أرضيتك وحيطانك، وبيمشي والمكان أنضف من الأول.', en: 'We protect your floors and walls, and leave it cleaner than we found it.' } }
  ],

  filters: [
    { id: 'all', t: { ar: 'الكل', en: 'All' } },
    { id: 'doors', t: { ar: 'أبواب', en: 'Doors' } },
    { id: 'kitchens', t: { ar: 'مطابخ', en: 'Kitchens' } },
    { id: 'rooms', t: { ar: 'غرف ودريسنج', en: 'Rooms & dressing' } },
    { id: 'living', t: { ar: 'معيشة وسفرة', en: 'Living & dining' } },
    { id: 'offices', t: { ar: 'مكاتب', en: 'Offices' } }
  ],
  projects: [
    { img: 'hero', cat: 'living', wide: true, t: { ar: 'ليفينج بتجاليد زان مضلعة', en: 'Living room in fluted beech' }, p: { ar: 'تجاليد · باب داخلي · ترابيزة', en: 'Cladding · door · table' } },
    { img: 'kitchen', cat: 'kitchens', t: { ar: 'مطبخ قشرة أرو فاتح', en: 'Light oak veneer kitchen' }, p: { ar: 'مطبخ · جزيرة', en: 'Kitchen · island' } },
    { img: 'door', cat: 'doors', t: { ar: 'باب جوز بمقبض نحاس', en: 'Walnut door, brass handle' }, p: { ar: 'باب داخلي', en: 'Interior door' } },
    { img: 'dressing', cat: 'rooms', t: { ar: 'دريسنج روم بإضاءة مخفية', en: 'Walk-in with hidden light' }, p: { ar: 'دريسنج · إضاءة', en: 'Dressing · lighting' } },
    { img: 'bedroom', cat: 'rooms', t: { ar: 'غرفة نوم بخلفية شرائح', en: 'Bedroom with slatted wall' }, p: { ar: 'تجاليد · كومودينو', en: 'Cladding · nightstand' } },
    { img: 'office', cat: 'offices', t: { ar: 'مكتب إداري زان وجوز', en: 'Beech & walnut office' }, p: { ar: 'مكتب · مكتبة · تجاليد', en: 'Desk · shelves · cladding' } },
    { img: 'dining', cat: 'living', t: { ar: 'سفرة زان وسقف شرائح', en: 'Beech dining, slatted ceiling' }, p: { ar: 'سفرة · سقف', en: 'Dining · ceiling' } },
    { img: 'heroM', cat: 'doors', t: { ar: 'مدخل بباب زان طبيعي', en: 'Natural beech entrance' }, p: { ar: 'باب · تجاليد', en: 'Door · cladding' } }
  ],

  quote: {
    spaces: [
      { ar: 'أبواب', en: 'Doors' }, { ar: 'مطبخ', en: 'Kitchen' }, { ar: 'دريسنج / دواليب', en: 'Dressing / wardrobes' },
      { ar: 'تجاليد حوائط', en: 'Wall cladding' }, { ar: 'أثاث', en: 'Furniture' }, { ar: 'مكتب / مشروع تجاري', en: 'Office / commercial' }
    ],
    woods: [
      { ar: 'زان', en: 'Beech' }, { ar: 'أرو', en: 'Oak' }, { ar: 'جوز', en: 'Walnut' }, { ar: 'ماهوجني', en: 'Mahogany' }, { ar: 'أش أبيض', en: 'White ash' }, { ar: 'محتاج نصيحتكم', en: 'Advise me' }
    ],
    sizes: [
      { ar: 'قطعة أو أوضة', en: 'One piece or room' }, { ar: 'شقة كاملة', en: 'Full apartment' }, { ar: 'فيلا', en: 'Villa' }, { ar: 'مكتب / محل', en: 'Office / shop' }
    ]
  }
};
