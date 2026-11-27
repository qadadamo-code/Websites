/* Gamal Elraay — content. Contacts are TEMPORARY (Planet Creative Marketing number) until the client sends theirs. */
window.GR = {
  config: {
    whatsapp: '201203101104',
    phone: '+201203101104',
    phoneDisplay: '01203101104'
  },
  collections: [
    { id: 'classic', img: 'col_classic', n: '01' },
    { id: 'living', img: 'col_living', n: '02' },
    { id: 'corner', img: 'col_corner', n: '03' },
    { id: 'bedroom', img: 'col_bedroom', n: '04' },
    { id: 'dining', img: 'col_dining', n: '05' },
    { id: 'office', img: 'col_office', n: '06' }
  ],
  fabrics: [
    { id: 'ivory', img: 'hero_end', c: '#E9E1D0' },
    { id: 'emerald', img: 'fab_emerald', c: '#1F5A43' },
    { id: 'navy', img: 'fab_navy', c: '#1C2747' },
    { id: 'caramel', img: 'fab_caramel', c: '#A35A26' },
    { id: 'rose', img: 'fab_rose', c: '#C98E86' },
    { id: 'charcoal', img: 'fab_charcoal', c: '#4A4A4A' }
  ],
  /* price = placeholder EGP "from" price */
  products: [
    { id: 'p_classic_sofa', cat: 'classic', price: 52000, name: { ar: 'كنبة صالون «ملكي» مذهبة', en: 'Royal gilded salon sofa', fr: 'Canapé de salon doré Royal', es: 'Sofá de salón dorado Real', de: 'Vergoldetes Salonsofa Royal', zh: '皇家鎏金沙龙沙发', ru: 'Золочёный диван «Роял»' } },
    { id: 'p_classic_chair', cat: 'classic', price: 16500, name: { ar: 'فوتيه كلاسيك روز مذهب', en: 'Gilded blush classic armchair', fr: 'Fauteuil classique doré rose', es: 'Butaca clásica dorada rosa', de: 'Vergoldeter Sessel Rosé', zh: '鎏金玫瑰古典单椅', ru: 'Золочёное кресло, розовый бархат' } },
    { id: 'p_classic_table', cat: 'classic', price: 18900, name: { ar: 'ترابيزة وسط مذهبة برخام', en: 'Gilded marble-top coffee table', fr: 'Table basse dorée marbre', es: 'Mesa de centro dorada con mármol', de: 'Vergoldeter Couchtisch mit Marmor', zh: '鎏金大理石茶几', ru: 'Золочёный стол с мраморной столешницей' } },
    { id: 'p_recliner', cat: 'living', price: 58000, name: { ar: 'ركنة بريكلاينر كهرباء', en: 'Sectional with power recliner', fr: 'Canapé d’angle relax électrique', es: 'Esquinero con reclinable eléctrico', de: 'Ecksofa mit Relaxfunktion', zh: '电动躺椅转角沙发', ru: 'Угловой диван с электрореклайнером' } },
    { id: 'p_sofa', cat: 'living', price: 38500, name: { ar: 'كنبة «زمرد» قطيفة', en: 'Emerald velvet sofa', fr: 'Canapé velours émeraude', es: 'Sofá terciopelo esmeralda', de: 'Samtsofa Smaragd', zh: '祖母绿丝绒沙发', ru: 'Бархатный диван «Изумруд»' } },
    { id: 'p_armchair', cat: 'living', price: 14900, name: { ar: 'فوتيه «سحاب» بوكليه', en: 'Cloud bouclé armchair', fr: 'Fauteuil bouclette Nuage', es: 'Butaca bouclé Nube', de: 'Bouclé-Sessel Wolke', zh: '云朵圈圈绒单椅', ru: 'Кресло букле «Облако»' } },
    { id: 'p_corner', cat: 'living', price: 64000, name: { ar: 'ركنة «ميدان» قطيفة', en: 'Maidan velvet sectional', fr: 'Canapé d’angle Maidan', es: 'Esquinero Maidan', de: 'Ecksofa Maidan', zh: 'Maidan 丝绒转角沙发', ru: 'Угловой диван «Майдан»' } },
    { id: 'p_coffee', cat: 'living', price: 11500, name: { ar: 'ترابيزة وسط ترافرتين', en: 'Travertine coffee table', fr: 'Table basse travertin', es: 'Mesa de centro travertino', de: 'Couchtisch Travertin', zh: '洞石茶几', ru: 'Журнальный стол из травертина' } },
    { id: 'p_ottoman', cat: 'living', price: 5900, name: { ar: 'بوف جلد كراميل', en: 'Caramel leather ottoman', fr: 'Pouf cuir caramel', es: 'Puf de piel caramelo', de: 'Lederpouf Karamell', zh: '焦糖皮革脚凳', ru: 'Пуф из кожи «Карамель»' } },
    { id: 'p_bed', cat: 'bedroom', price: 42000, name: { ar: 'سرير «تاج» شامبين', en: 'Taj champagne bed', fr: 'Lit Taj champagne', es: 'Cama Taj champán', de: 'Bett Taj Champagner', zh: 'Taj 香槟色软床', ru: 'Кровать «Тадж» шампань' } },
    { id: 'p_night', cat: 'bedroom', price: 6800, name: { ar: 'كومودينو جوز', en: 'Walnut nightstand', fr: 'Chevet en noyer', es: 'Mesita de nogal', de: 'Nachttisch Nussbaum', zh: '胡桃木床头柜', ru: 'Тумба из ореха' } },
    { id: 'p_mirror', cat: 'decor', price: 7400, name: { ar: 'مراية قوس ذهبية', en: 'Golden arch mirror', fr: 'Miroir arche doré', es: 'Espejo arco dorado', de: 'Bogenspiegel Gold', zh: '金色拱形落地镜', ru: 'Арочное зеркало' } },
    { id: 'p_dining', cat: 'dining', price: 36000, name: { ar: 'ترابيزة سفرة بيضاوي', en: 'Oval dining table', fr: 'Table ovale', es: 'Mesa ovalada', de: 'Ovaler Esstisch', zh: '椭圆餐桌', ru: 'Овальный обеденный стол' } },
    { id: 'p_chair', cat: 'dining', price: 4900, name: { ar: 'كرسي سفرة «هلال»', en: 'Crescent dining chair', fr: 'Chaise Croissant', es: 'Silla Media luna', de: 'Esszimmerstuhl Halbmond', zh: '新月餐椅', ru: 'Стул «Полумесяц»' } },
    { id: 'p_sideboard', cat: 'dining', price: 24500, name: { ar: 'بوفيه جوز ورخام', en: 'Walnut & marble sideboard', fr: 'Buffet noyer et marbre', es: 'Aparador nogal y mármol', de: 'Sideboard Nussbaum & Marmor', zh: '胡桃木大理石餐边柜', ru: 'Буфет орех и мрамор' } },
    { id: 'p_tv', cat: 'decor', price: 16800, name: { ar: 'وحدة تلفزيون مضلعة', en: 'Fluted TV unit', fr: 'Meuble TV cannelé', es: 'Mueble TV acanalado', de: 'TV-Möbel gerillt', zh: '凹槽电视柜', ru: 'ТВ-тумба с рифлёным фасадом' } }
  ],
  craft: [
    { id: 1, img: 'craft_wood' },
    { id: 2, img: 'craft_upholstery' },
    { id: 3, img: 'craft_detail' },
    { id: 4, img: 'craft_delivery' }
  ],
  tailor: {
    room: ['living', 'bedroom', 'dining', 'kids', 'office'],
    piece: ['sofa', 'corner', 'set', 'bed', 'table', 'unit'],
    style: ['modern', 'neo', 'minimal', 'luxury'],
    fabric: ['ivory', 'emerald', 'navy', 'caramel', 'rose', 'charcoal']
  }
};
