# -*- coding: utf-8 -*-
"""Facts taken from stern-ipr.com (content kept as published by the firm)."""

EMAIL = "mahmoud@stern-ipr.com"
PHONE_INTL = "+20 101 337 7119"
PHONE_RAW = "201013377119"
PHONE_LOCAL = "002 01013377119"

EAGLE_D = (
    "M289 12 280 14 272 35 265 56 265 58 280 84 296 110 294 108 258 62 258 61 130 50 3 38 2 39 23 53 44 68 81 75 118 83 189 97 260 110 258 111 194 101 176 98 115 89 55 79 54 80 86 98 92 100 278 116 277 117 194 113 110 110 105 111 138 119 170 127 224 123 280 120 233 126 186 131 187 132 208 136 228 139 255 131 282 124 283 125 263 132 242 139 240 141 248 142 257 142 271 135 286 127 286 128 262 142 271 143 280 143 291 130 279 146 265 164 262 167 262 182 264 193 278 164 293 135 294 135 279 168 264 202 264 204 280 215 297 226 298 225 302 130 302 148 303 186 305 226 316 220 326 213 333 209 340 204 337 198 324 168 311 139 311 138 325 165 340 193 341 184 341 168 330 154 318 137 324 143 332 143 340 142 329 136 318 129 316 127 331 134 346 142 355 141 363 141 360 139 320 125 321 124 347 131 374 139 395 136 416 132 416 131 324 121 324 120 334 121 344 121 432 127 466 119 500 110 496 110 348 116 332 116 423 108 515 99 531 90 548 80 542 80 444 96 346 111 343 110 362 107 380 103 504 79 531 73 559 68 580 53 601 39 600 38 474 50 348 61 346 61 328 84 307 110 324 81 339 57 331 36 323 14 314 12 301 11Z"
    "M283 29 291 30 289 26 286 26Z"
    "M314 30 322 29 319 26Z"
    "M297 32 293 38 297 52 302 65 310 36 302 29Z"
    "M296 39 300 40 297 36Z"
    "M303 40 307 38 306 36Z"
)
# point where every feather converges (the "heart" of the mark)
HEART = (301, 124)
RAY_TIPS = [(2, 38), (54, 80), (105, 111), (186, 131), (240, 141), (601, 38), (548, 80), (500, 110),
            (416, 131), (363, 141), (264, 203), (298, 226), (305, 226), (340, 204), (301, 11)]

STATS = [
    ("2008", "", "Founded in Cairo", "تأسّست في القاهرة"),
    ("11", "", "Offices across the Arab world & Africa", "مكتبًا في العالم العربي وأفريقيا"),
    ("50", "", "Liaison & correspondent offices worldwide", "مكتب اتصال ومراسلة حول العالم"),
    ("200", "+", "Countries & areas our clients come from", "دولة ومنطقة يأتي منها عملاؤنا"),
]

PRACTICE = [
    # slug, en, ar, en desc, ar desc, icon
    ("trademarks", "Trademarks", "العلامات التجارية",
     "Search, filing, renewal, assignment, licensing, opposition, invalidation, cancellation, litigation, investigation and watch.",
     "البحث والإيداع والتجديد والتنازل والترخيص والمعارضة والإبطال والشطب والتقاضي والتحرّي والمراقبة.", "tm"),
    ("patents", "Patents", "براءات الاختراع",
     "Drafting, filing, validation, anti-infringement, published-patent searches and annuity management, nationally and through the GCC Patent Office.",
     "الصياغة والإيداع والتحقّق ومكافحة التعدّي والبحث في البراءات المنشورة وإدارة الرسوم السنوية، محليًا وعبر مكتب براءات الخليج.", "pt"),
    ("designs", "Industrial Designs", "النماذج الصناعية",
     "Protection for the appearance of products: from packaging and furniture to lighting, jewellery, electronics and textiles.",
     "حماية المظهر الخارجي للمنتجات: من العبوات والأثاث إلى الإضاءة والمجوهرات والأجهزة الإلكترونية والمنسوجات.", "ds"),
    ("designs#utility", "Utility Models", "نماذج المنفعة",
     "The “petty patent”: an exclusive right for an invention, for a limited period of time.",
     "«البراءة الصغرى»: حق استئثاري على الاختراع لمدة زمنية محددة.", "um"),
    ("designs#copyright", "Copyrights", "حقوق المؤلف",
     "Securing authorship rights and the commercial life of creative works, with licensing and franchising.",
     "تأمين حقوق المؤلف والحياة التجارية للأعمال الإبداعية، مع الترخيص والامتياز التجاري.", "cr"),
    ("trademarks#litigation", "Litigation & Consultancy", "التقاضي والاستشارات",
     "Enforcement, anti-counterfeiting and IP-law consultancy in Egypt, Africa and the Middle East.",
     "إنفاذ الحقوق ومكافحة التقليد والاستشارات في قانون الملكية الفكرية في مصر وأفريقيا والشرق الأوسط.", "lt"),
]

TREAT = [
    ("Trademarks, Patents, Utility models, Designs", "العلامات والبراءات ونماذج المنفعة والنماذج الصناعية"),
    ("Search for Published Trademarks", "البحث في العلامات التجارية المنشورة"),
    ("Trademark Watch Service", "خدمة مراقبة العلامات التجارية"),
    ("Patent Drafting", "صياغة براءات الاختراع"),
    ("Patent Validation System", "نظام التحقّق من البراءات"),
    ("Patent Anti-Infringement", "مكافحة التعدّي على البراءات"),
    ("Search for Published Patents", "البحث في البراءات المنشورة"),
    ("IP-Renewals", "تجديدات الملكية الفكرية"),
    ("Licensing and Franchising", "الترخيص والامتياز التجاري"),
    ("IP Portfolio Management", "إدارة محافظ الملكية الفكرية"),
    ("Brand Protection", "حماية العلامة"),
]

TM_SERVICES = [
    ("Trademark Search", "البحث عن العلامة", "Full availability search, improve the rate of success for registration.", "بحث شامل عن مدى توفّر العلامة، يرفع فرص نجاح التسجيل."),
    ("Trademark Application", "طلب تسجيل العلامة", "Filing local and global trademark applications.", "إيداع طلبات تسجيل العلامات محليًا ودوليًا."),
    ("Trademark Renewal", "تجديد العلامة", "Maintaining your trademark rights through efficient renewal management.", "الحفاظ على حقوقك في العلامة عبر إدارة فعّالة للتجديدات."),
    ("Change of Name / Address", "تغيير الاسم / العنوان", "Update the records of the trademark registrar once the owner’s name or address changes.", "تحديث سجلات مكتب العلامات عند تغيّر اسم المالك أو عنوانه."),
    ("Trademark Assignment", "التنازل عن العلامة", "Transfer and assign the interest of a trademark from one person or party to another.", "نقل الحقوق في العلامة والتنازل عنها من شخص أو جهة إلى أخرى."),
    ("Trademark License", "ترخيص العلامة", "Authorise a third person or party to use your registered mark.", "تفويض شخص أو جهة أخرى باستخدام علامتك المسجّلة."),
    ("Trademark Opposition", "المعارضة", "Oppose trademark applications during the opposition legal term.", "الاعتراض على طلبات تسجيل العلامات خلال المدة القانونية للمعارضة."),
    ("Trademark Invalidation", "إبطال العلامة", "Remove a registered trademark from the register as if it had never been registered.", "شطب علامة مسجّلة من السجل وكأنها لم تُسجّل قط."),
    ("Trademark Cancellation", "شطب العلامة", "Remove a registered trademark on the grounds of non-use or fraud.", "شطب علامة مسجّلة بسبب عدم الاستعمال أو الغش."),
    ("Trademark Litigation", "التقاضي في العلامات", "Legal procedures to revoke pending and/or registered trademarks.", "الإجراءات القانونية لإلغاء العلامات قيد التسجيل أو المسجّلة."),
    ("Investigation", "التحرّي", "Discover possible infringements and counterfeiting.", "كشف حالات التعدّي والتقليد المحتملة."),
    ("Watch Service", "خدمة المراقبة", "Monitor third parties who may own trademark rights conflicting with yours.", "رصد الأطراف التي قد تملك حقوقًا متعارضة مع علامتك."),
]

# name_en, name_ar, region, filing, nice, time, exam, protection, nonuse(yrs), grace, office(bool)
J = [
    ("Egypt", "مصر", "me", "Single & multi-class", "11th", "12–18 months", "Substantive", "10 years from filing", "5", "6 months with penalty · 3 years with super penalty", True),
    ("Saudi Arabia", "السعودية", "gcc", "Single class", "11th", "4–5 months", "Substantive", "10 Hijri years from filing", "5", "6 months with penalty", True),
    ("UAE", "الإمارات", "gcc", "Single class", "11th", "10–12 months", "Substantive", "10 years from filing", "5", "3 months with penalty", True),
    ("Kuwait", "الكويت", "gcc", "Single class", "Nice", "10–12 months", "Substantive", "10 years from filing", "5", "6 months with penalty", True),
    ("Qatar", "قطر", "gcc", "Single class", "11th", "12–18 months", "Substantive", "10 years from filing", "5", "6 months with penalty", False),
    ("Bahrain", "البحرين", "gcc", "Single class", "11th", "12–18 months", "Substantive", "10 years from filing", "5", "6 months with penalty", False),
    ("Jordan", "الأردن", "me", "Single class", "11th", "12–18 months", "Substantive", "10 years from filing", "3", "12 months with penalty", True),
    ("Lebanon", "لبنان", "me", "Single & multi-class", "11th", "2 months", "No examination", "15 years from registration", "5", "3 months with penalty", False),
    ("Syria", "سوريا", "me", "Single class", "11th", "18–24 months", "Substantive", "10 years from filing", "3", "6 months with penalty", False),
    ("Iraq", "العراق", "me", "Single & multi-class", "Special", "16–20 months", "Substantive", "10 years from filing", "5", "6 months with penalty", False),
    ("Palestine", "فلسطين", "me", "Single class", "10th", "12–18 months", "Substantive", "7 / 10 years from filing", "2", "1 – 6 months with penalty", False),
    ("Yemen", "اليمن", "me", "Single class", "10th", "10–14 months", "Substantive", "10 years from filing", "5", "12 months with penalty", False),
    ("Turkey", "تركيا", "me", "Single & multi-class", "11th", "12–18 months", "Formal only", "10 years from filing", "5", "6 months with penalty", False),
    ("Cyprus", "قبرص", "me", "Single class", "11th", "12–18 months", "Substantive", "10 years from filing", "—", "3 months with penalty", False),
    ("Sudan", "السودان", "af", "Single class", "10th", "20–24 months", "Substantive", "10 years from filing", "5", "6 months with penalty", True),
    ("Libya", "ليبيا", "af", "Single class", "10th", "7+ years", "Substantive", "10 years from filing", "5", "6 months with penalty", False),
    ("Tunisia", "تونس", "af", "Single & multi-class", "11th", "12–18 months", "Formal only", "10 years from filing", "5", "6 months with penalty", False),
    ("Algeria", "الجزائر", "af", "Single & multi-class", "10th", "16 months", "Substantive", "10 years from filing", "3", "6 months with penalty", True),
    ("Morocco", "المغرب", "af", "Single & multi-class", "11th", "12–16 months", "Formal only", "10 years from filing", "3", "6 months with penalty", False),
]
# map names (world-atlas) for the countries above
J_MAP = {"Egypt": "Egypt", "Saudi Arabia": "Saudi Arabia", "UAE": "United Arab Emirates", "Kuwait": "Kuwait",
         "Qatar": "Qatar", "Bahrain": "Bahrain", "Jordan": "Jordan", "Lebanon": "Lebanon", "Syria": "Syria",
         "Iraq": "Iraq", "Palestine": "Palestine", "Yemen": "Yemen", "Turkey": "Turkey", "Cyprus": "Cyprus",
         "Sudan": "Sudan", "Libya": "Libya", "Tunisia": "Tunisia", "Algeria": "Algeria", "Morocco": "Morocco"}
# other STERN office countries (no published table)
OFFICE_EXTRA = {"Kenya": ("كينيا", "Kenya"), "Ethiopia": ("إثيوبيا", "Ethiopia"), "South Africa": ("جنوب أفريقيا", "South Africa")}

AR_TERMS = {
    "Single & multi-class": "فئة واحدة ومتعدد الفئات", "Single class": "فئة واحدة",
    "11th": "الطبعة 11 من تصنيف نيس", "10th": "الطبعة 10 من تصنيف نيس", "Nice": "تصنيف نيس", "Special": "تصنيف خاص",
    "Substantive": "فحص موضوعي", "Formal only": "فحص شكلي فقط", "No examination": "دون فحص",
    "10 years from filing": "10 سنوات من تاريخ الإيداع", "10 Hijri years from filing": "10 سنوات هجرية من تاريخ الإيداع",
    "15 years from registration": "15 سنة من تاريخ التسجيل", "7 / 10 years from filing": "7 / 10 سنوات من تاريخ الإيداع",
    "6 months with penalty · 3 years with super penalty": "6 أشهر بغرامة · 3 سنوات بغرامة مضاعفة",
    "6 months with penalty": "6 أشهر بغرامة", "3 months with penalty": "3 أشهر بغرامة",
    "12 months with penalty": "12 شهرًا بغرامة", "1 – 6 months with penalty": "من شهر إلى 6 أشهر بغرامة",
    "12–18 months": "12–18 شهرًا", "4–5 months": "4–5 أشهر", "10–12 months": "10–12 شهرًا", "2 months": "شهران",
    "18–24 months": "18–24 شهرًا", "16–20 months": "16–20 شهرًا", "10–14 months": "10–14 شهرًا",
    "20–24 months": "20–24 شهرًا", "7+ years": "أكثر من 7 سنوات", "16 months": "16 شهرًا", "12–16 months": "12–16 شهرًا",
}

REGIONS = [
    ("me", "Arab & Middle East", "العالم العربي والشرق الأوسط",
     "ALGERIA · BAHRAIN · CYPRUS · COMOROS (OAPI) · DJIBOUTI · EGYPT · IRAQ BAGHDAD · IRAQ KURDISTAN · IRAN · JORDAN · KUWAIT · LIBYA · LEBANON · MOROCCO · MAURITANIA (OAPI) · OMAN · PALESTINE – GAZA · PALESTINE – WEST BANK · QATAR · SUDAN · SAUDI ARABIA · SYRIA · SOMALIA · TUNIS · TURKEY · UAE · YEMEN SANA’A",
     27),
    ("af", "Africa", "أفريقيا",
     "Angola · Algeria · Burundi · Cape Verde · Republic of Congo · Djibouti · Egypt · Ethiopia · Eritrea · Gambia · Ghana · Kenya · Libya · Mauritius · Madagascar · Mozambique · Morocco · Namibia · Nigeria · Rwanda · Sierra Leone · Seychelles · South Africa · Sudan · Somalia · Tanzania · Tunisia · Uganda · Zimbabwe · plus OAPI & ARIPO member states",
     54),
    ("as", "Asian Countries", "الدول الآسيوية",
     "Afghanistan · Armenia · Bahrain · Bangladesh · Bhutan · Brunei · Cambodia · China · Cyprus · India · Indonesia · Iran · Iraq · Japan · Jordan · Kuwait · Kyrgyzstan · Laos · Lebanon · Malaysia · Maldives · Mongolia · Myanmar · Nepal · North Korea · Oman · Pakistan · Philippines · Qatar · Russia · Saudi Arabia · Singapore · South Korea · Sri Lanka · Syria · Taiwan · Tajikistan · Thailand · Turkey · Turkmenistan · UAE · Uzbekistan · Vietnam · Yemen",
     44),
    ("eu", "EU & USA", "الاتحاد الأوروبي والولايات المتحدة",
     "European Union trademarks & designs, and United States filings through our partner network.", 2),
]

ORGS = [
    ("GCC", "مكتب براءات الخليج",
     "Gulf Cooperation Council Patent Office", "مكتب براءات الاختراع لمجلس التعاون الخليجي",
     "One patent application covers Bahrain, Kuwait, Qatar, Oman, Saudi Arabia and the UAE. Office in Riyadh; protection for 20 years from filing, subject to annual annuities.",
     "طلب براءة واحد يغطي البحرين والكويت وقطر وعُمان والسعودية والإمارات. مقرّ المكتب في الرياض؛ والحماية 20 عامًا من تاريخ الإيداع بشرط سداد الرسوم السنوية."),
    ("ARIPO", "الأريبو",
     "African Regional Intellectual Property Organization", "المنظمة الإقليمية الأفريقية للملكية الفكرية",
     "For English-speaking Africa. Under the Banjul Protocol an applicant may designate any or all member states in a single filing.",
     "لدول أفريقيا الناطقة بالإنجليزية. وفق بروتوكول بانجول يمكن للمودِع تعيين أي من الدول الأعضاء أو جميعها في طلب واحد."),
    ("OAPI", "الأوابي",
     "African Intellectual Property Organization", "المنظمة الأفريقية للملكية الفكرية",
     "For French-speaking Africa. One application covers all member states; national registration in a single member state is not possible.",
     "لدول أفريقيا الناطقة بالفرنسية. طلب واحد يغطي جميع الدول الأعضاء، ولا يمكن التسجيل الوطني في دولة عضو واحدة."),
]

TEAM = [
    # name_en, name_ar, role_en, role_ar, email, tier
    ("Mahmoud Adel", "محمود عادل", "Chairman", "رئيس مجلس الإدارة", "mahmoud@stern-ipr.com", 0),
    ("AbdelHamed Adel", "عبد الحميد عادل", "Partner & Trademark and Patent Attorney", "شريك ووكيل علامات تجارية وبراءات اختراع", "abdelhamed@stern-ipr.com", 1),
    ("Maha Fathi", "مها فتحي", "Partner", "شريكة", "ip@stern-ipr.info", 1),
    ("Mohammed Adel", "محمد عادل", "Partner & Companies Incorporation Attorney", "شريك ومحامي تأسيس شركات", "adel@stern-ipr.com", 1),
    ("Medhat Ibrahim", "مدحت إبراهيم", "Trademark and Patent Attorney & Lawyer", "وكيل علامات وبراءات ومحامٍ", "medhat@stern-ipr.com", 2),
    ("Ahmed Osman", "أحمد عثمان", "Trademark and Patent Attorney", "وكيل علامات تجارية وبراءات اختراع", "osman@stern-ipr.com", 2),
    ("Mohamed Shapoury", "محمد شابوري", "Trademark & Patent Attorney · Manager of International Patents & Marketing", "وكيل علامات وبراءات · مدير البراءات الدولية وفريق التسويق", "shapoury@stern-ipr.com", 2),
    ("Ahmed Shoukry", "أحمد شكري", "Patent Translator & Trademark Attorney", "مترجم براءات ووكيل علامات تجارية", "A.Shoukry@stern-ipglobal.net", 2),
    ("Ali Samir", "علي سمير", "Trademark & Patent Attorney", "وكيل علامات تجارية وبراءات اختراع", "admin@stern-ipglobal.info", 2),
    ("Mohammed Salem", "محمد سالم", "Trademark & Patent Attorney", "وكيل علامات تجارية وبراءات اختراع", "international@stern-ipglobal.info", 2),
    ("Mohammed Owen", "محمد أوين", "Trademark Attorney & Lawyer", "وكيل علامات تجارية ومحامٍ", "m.owen@stern-ipr.com", 2),
    ("Mahmoud Rashad", "محمود رشاد", "Lawyer", "محامٍ", "stern@stern-ipglobal.org", 2),
    ("Ahmed Fathallah", "أحمد فتح الله", "Manager of Accounts Department", "مدير قسم الحسابات", "accounts@stern-ipr.com", 3),
    ("Ahmed Yehia", "أحمد يحيى", "HR Manager", "مدير الموارد البشرية", "hr@stern-ipglobal.info", 3),
    ("Mohammed Mostafa", "محمد مصطفى", "Public Relations", "العلاقات العامة", "m.sorour@stern-ipr.com", 3),
]

CLIENTS = [
    ("TESLA", "Automotive", "السيارات", "tesla"),
    ("amazon", "E-commerce", "التجارة الإلكترونية", "amazon"),
    ("HUAWEI", "Technology", "التكنولوجيا", "huawei"),
    ("MG", "Automotive", "السيارات", "mg"),
    ("Cottonil", "Apparel", "الملابس", "cottonil"),
    ("realme", "Technology", "التكنولوجيا", "realme"),
    ("OPPO", "Technology", "التكنولوجيا", "oppo"),
]

NEWS = [
    ("2023-01-11", "Saudi Arabia", "السعودية",
     "Apostille Convention enters into force", "دخول اتفاقية أبوستيل حيّز التنفيذ",
     ["The Convention Abolishing the Requirement of Legalization for Foreign Public Documents (1961 Apostille Convention) entered into force for Saudi Arabia on December 7, 2022, following the deposit of its instrument of accession on April 8, 2022.",
      "On December 19, 2022, the Saudi Authority for Intellectual Property (SAIP) issued an official notification abolishing the consular legalization requirement for documents issued in a contracting state of the Convention.",
      "An apostille issued by the state of origin is now sufficient to certify a document’s validity, removing the need for double certification. The update is bound to reduce complexity, timelines and costs for the private sector."],
     ["دخلت اتفاقية إلغاء شرط التصديق على الوثائق العامة الأجنبية (اتفاقية أبوستيل لعام 1961) حيّز التنفيذ في المملكة العربية السعودية في 7 ديسمبر 2022، بعد إيداع وثيقة الانضمام في 8 أبريل 2022.",
      "وفي 19 ديسمبر 2022 أصدرت الهيئة السعودية للملكية الفكرية إشعارًا رسميًا بإلغاء شرط التصديق القنصلي للوثائق الصادرة في الدول المتعاقدة في الاتفاقية.",
      "أصبحت شهادة الأبوستيل الصادرة من دولة المنشأ كافية لإثبات صحة الوثيقة دون الحاجة إلى تصديق مزدوج، وهو ما يقلّل التعقيد والمدد والتكاليف على القطاع الخاص."]),
    ("2022-10-20", "Lebanon", "لبنان",
     "IP Office resumes online filing", "مكتب الملكية الفكرية يستأنف الإيداع الإلكتروني",
     ["The Lebanese Ministry of Economy and Trade announced that the Intellectual Property Office has resumed the online filing system from October 12, 2022.",
      "The system is open for trademark applications every Wednesday. For urgent applications, applicants may submit a request to the IPO to expedite the process."],
     ["أعلنت وزارة الاقتصاد والتجارة اللبنانية استئناف مكتب الملكية الفكرية العمل بنظام الإيداع الإلكتروني اعتبارًا من 12 أكتوبر 2022.",
      "يستقبل النظام طلبات العلامات التجارية كل يوم أربعاء، ويمكن للمودعين تقديم طلب لتسريع الإجراءات في الحالات العاجلة."]),
    ("2022-10-08", "United Arab Emirates", "الإمارات",
     "Update on POA requirements for patents and designs", "تحديث متطلبات التوكيل للبراءات والنماذج الصناعية",
     ["On 21 September 2022 the Ministry of Economy announced that powers of attorney and other documents for patents and industrial designs no longer need legalization by the UAE Consulate; notarization by a notary public suffices.",
      "A stamp of a UAE public entity is regarded as equivalent to notarization. Where the inventor is an employee of a UAE company, a certificate of employment or employment contract may replace the deed of assignment."],
     ["في 21 سبتمبر 2022 أعلنت وزارة الاقتصاد أن التوكيلات والوثائق المطلوبة للبراءات والنماذج الصناعية لم تعد تحتاج إلى تصديق القنصلية الإماراتية، ويكفي توثيقها لدى كاتب العدل.",
      "ويُعدّ ختم أي جهة حكومية إماراتية معادلًا للتوثيق، وإذا كان المخترع موظفًا في شركة إماراتية يمكن تقديم شهادة عمل أو عقد العمل بدلًا من سند التنازل."]),
    ("2022-08-25", "Kenya", "كينيا",
     "Mandatory IPR recordation for imported goods", "التسجيل الإلزامي لحقوق الملكية للبضائع المستوردة",
     ["Trademarks for goods imported into Kenya must be recorded with the Anti-Counterfeit Authority (ACA), whether registered locally or through WIPO.",
      "Importing goods whose trademarks have not been recorded with the ACA is an offence. Recordation must be made through a licensed agent, and the ACA confirms or denies it within 60 days. We can represent you in this field."],
     ["يجب تسجيل العلامات التجارية للبضائع المستوردة إلى كينيا لدى هيئة مكافحة التقليد (ACA)، سواء كانت مسجّلة محليًا أو عبر الويبو.",
      "ويُعدّ استيراد بضائع لم تُسجّل علاماتها لدى الهيئة مخالفة. يتم التسجيل عبر وكيل مرخّص، وتؤكد الهيئة القبول أو الرفض خلال 60 يومًا، ويمكننا تمثيلكم في ذلك."]),
    ("2020-12-19", "Kurdistan Region of Iraq", "إقليم كردستان العراق",
     "Temporary closure of the Trademark Office", "إغلاق مؤقت لمكتب العلامات التجارية",
     ["The Trademark Office in Erbil announced it would be closed from 15 December 2020 until 7 January 2021, with no new filings or services during that period."],
     ["أعلن مكتب العلامات التجارية في أربيل إغلاقه من 15 ديسمبر 2020 حتى 7 يناير 2021، دون استقبال طلبات جديدة أو تقديم خدمات خلال تلك الفترة."]),
    ("2020-12-01", "Lebanon", "لبنان",
     "Our Lebanon office remains fully operational", "مكتبنا في لبنان يعمل بكامل طاقته",
     ["The explosion in Beirut’s port on 04 August 2020 caused much destruction to the National Office for the Protection of Intellectual Property, which temporarily suspended all IP activities.",
      "Our office in Lebanon remained unscathed and fully operational, responding promptly to client communications, queries and instructions."],
     ["تسبّب انفجار مرفأ بيروت في 4 أغسطس 2020 في أضرار كبيرة للمكتب الوطني لحماية الملكية الفكرية، الذي علّق أنشطته مؤقتًا.",
      "وبقي مكتبنا في لبنان سليمًا ويعمل بكامل طاقته، ويستجيب لمراسلات العملاء واستفساراتهم وتعليماتهم دون تأخير."]),
    ("2020-12-01", "United Arab Emirates", "الإمارات",
     "Reduced official fees for IP matters", "تخفيض الرسوم الرسمية لمعاملات الملكية الفكرية",
     ["The Ministry of Economy reduced official fees for IP matters, published in the official gazette on March 31, 2020 and in force from April 5, 2020: registration, renewal, amendment, assignment, opposition and hearing fees."],
     ["خفّضت وزارة الاقتصاد الرسوم الرسمية لمعاملات الملكية الفكرية بقرار نُشر في الجريدة الرسمية في 31 مارس 2020 وسرى من 5 أبريل 2020، ويشمل رسوم التسجيل والتجديد والتعديل والتنازل والمعارضة وجلسات الاستماع."]),
    ("2020-12-01", "Jordan", "الأردن",
     "Substantive examination fees for patents", "رسوم الفحص الموضوعي لبراءات الاختراع",
     ["The Ministry of Industry, Trade and Supply activated Article 20 of Patent Law No. 97, collecting substantive examination fees retroactively for pending applications filed since December 9, 2018.",
      "Applicants who do not pay within 60 days of the Registrar’s request will see their applications abandoned."],
     ["فعّلت وزارة الصناعة والتجارة والتموين المادة 20 من قانون براءات الاختراع رقم 97، وتُحصَّل رسوم الفحص الموضوعي بأثر رجعي على الطلبات المعلّقة المودعة منذ 9 ديسمبر 2018.",
      "ويُعدّ الطلب متروكًا إذا لم تُسدّد الرسوم خلال 60 يومًا من مطالبة المسجّل."]),
]
