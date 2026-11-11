# -*- coding: utf-8 -*-
"""Bilingual copy for the AAA For Intellectual Property site.
Every user-facing string is an (en, ar) tuple. Source: aaa-ip.com + the firm's Facebook page.
"""

BRAND = ('AAA For Intellectual Property', 'AAA للملكية الفكرية')
SHORT = 'AAA IP'
TAGLINE = ('Power of Protection.', 'قوّة الحماية.')
MOTTO = ('We work hard to be your primary choice & the best for your business.',
         'نعمل بجدٍّ لنكون خيارك الأول، والأفضل لأعمالك.')

CONTACT = {
    'wa': '201122417017',
    'phone': '+20 112 241 7017',
    'email': 'Info@AAA-IP.com',
    'ceo_email': 'Abdelhamed@AAA-IP.org',
    'pr_email': 'PR@AAA-IP.org',
    'city': ('Cairo, Egypt', 'القاهرة، مصر'),
    'fb': 'https://www.facebook.com/profile.php?id=100063674328940',
    'ig': 'https://www.instagram.com/aaa4intellectual.property/',
    'li': 'https://www.linkedin.com/in/aaa-for-intellectual-property-abdelhamed-ip-law-firm-166255147/',
    'x': 'https://www.x.com/Aaa4Property',
}

HOURS = [
    (('Saturday – Thursday', 'السبت – الخميس'), '09:00 – 17:00'),
    (('Friday', 'الجمعة'), ('Closed', 'مغلق')),
]

NAV = [
    ('index', ('Home', 'الرئيسية')),
    ('about', ('The Firm', 'عن المكتب')),
    ('services', ('Services', 'الخدمات')),
    ('jurisdictions', ('Jurisdictions', 'النطاق الدولي')),
    ('team', ('Our Team', 'فريق العمل')),
    ('policies', ('Policies', 'السياسات')),
    ('contact', ('Contact', 'تواصل معنا')),
]

# ------------------------------------------------------------------ IP rights (six)
RIGHTS = [
    {'key': 'trademarks', 'glyph': '™', 'code': 'TM',
     'name': ('Trademarks', 'العلامات التجارية'),
     'short': ('Names, logos & marks that carry your reputation.', 'الأسماء والشعارات والعلامات التي تحمل سمعتك.'),
     'intro': ('We are experienced in the following types of trademark work:', 'خبرتنا في أعمال العلامات التجارية تشمل:'),
     'items': [
         ('Filing and prosecuting local as well as international trademark applications.', 'إيداع ومتابعة طلبات تسجيل العلامات التجارية محلياً ودولياً.'),
         ('Prosecuting trademark oppositions and cancellations before the Trademark Trial and Appeal Board.', 'مباشرة دعاوى الاعتراض والشطب أمام لجان التظلمات والطعون الخاصة بالعلامات.'),
         ('Rendering legal opinions concerning the ability to use and register trademarks.', 'إبداء الرأي القانوني حول إمكانية استخدام العلامات وتسجيلها.'),
         ('Preparing cease and desist letters in the event of infringement and resolving infringement situations to a successful conclusion.', 'إعداد إنذارات الكفّ عن التعدي وحل حالات التعدي حتى نهايتها الناجحة.'),
         ('Litigating trademark and trade-dress disputes, including court proceedings and appeal boards.', 'التقاضي في منازعات العلامات والمظهر التجاري أمام المحاكم ولجان الطعون.'),
         ('Preparing and negotiating trademark license agreements and assignments.', 'إعداد عقود ترخيص العلامات ونقل ملكيتها والتفاوض عليها.'),
         ('Conducting due diligence in connection with mergers and acquisitions.', 'إجراء الفحص النافي للجهالة في عمليات الاندماج والاستحواذ.'),
         ('Change of name / address applications.', 'طلبات تغيير الاسم أو العنوان.'),
     ]},
    {'key': 'patents', 'glyph': 'P', 'code': 'PT',
     'name': ('Patents', 'براءات الاختراع'),
     'short': ('Exclusive rights for the inventions you create.', 'حقوق استئثارية للاختراعات التي تبتكرها.'),
     'intro': ('Our patent services include:', 'تشمل خدماتنا في براءات الاختراع:'),
     'items': [
         ('Filing and prosecuting patent applications.', 'إيداع طلبات براءات الاختراع ومتابعتها.'),
         ('Analysing prior art and rendering patentability opinions.', 'تحليل حالة التقنية السابقة وإبداء الرأي في قابلية الاختراع للبراءة.'),
         ('Preparing and filing patent appeal briefs.', 'إعداد مذكرات الطعن في قرارات البراءات وإيداعها.'),
         ('Rendering legal opinions on the validity and infringement of patents, and providing expert testimony in patent lawsuits.', 'إبداء الرأي القانوني في صحة البراءات والتعدي عليها، وتقديم الشهادة الفنية في دعاوى البراءات.'),
         ('Counselling patent owners regarding strategies and likelihood of success.', 'تقديم المشورة لمالكي البراءات حول الاستراتيجيات وفرص النجاح.'),
         ('Preparing cease and desist letters and resolving infringement situations to a successful conclusion.', 'إعداد إنذارات الكفّ عن التعدي وحل حالات التعدي بنجاح.'),
         ('Litigating patent and related IP disputes.', 'التقاضي في منازعات البراءات وما يتصل بها من حقوق الملكية الفكرية.'),
         ('Preparing and negotiating patent license agreements and assignments.', 'إعداد عقود ترخيص البراءات ونقل ملكيتها والتفاوض عليها.'),
     ]},
    {'key': 'designs', 'glyph': 'D', 'code': 'ID',
     'name': ('Industrial Designs', 'النماذج الصناعية'),
     'short': ('Protect the shape, look and feel of your products.', 'حماية شكل منتجاتك ومظهرها وطابعها.'),
     'intro': ('Our industrial design services include:', 'تشمل خدماتنا في النماذج الصناعية:'),
     'items': [
         ('Filing and prosecuting industrial design applications.', 'إيداع طلبات تسجيل النماذج الصناعية ومتابعتها.'),
         ('Analysing prior art and rendering registrability opinions.', 'تحليل النماذج السابقة وإبداء الرأي في قابلية التسجيل.'),
         ('Preparing and filing design appeal briefs.', 'إعداد مذكرات الطعن الخاصة بالنماذج وإيداعها.'),
         ('Rendering opinions on validity and infringement, and expert testimony in design lawsuits.', 'إبداء الرأي في الصحة والتعدي، والشهادة الفنية في دعاوى النماذج.'),
         ('Counselling design owners regarding strategies and likelihood of success.', 'تقديم المشورة لمالكي النماذج حول الاستراتيجيات وفرص النجاح.'),
         ('Preparing cease and desist letters and resolving infringement situations.', 'إعداد إنذارات الكفّ عن التعدي وحل حالاته.'),
         ('Litigating design and related IP disputes.', 'التقاضي في منازعات النماذج الصناعية وما يتصل بها.'),
         ('Preparing and negotiating design license agreements and assignments.', 'إعداد عقود ترخيص النماذج ونقل ملكيتها والتفاوض عليها.'),
     ]},
    {'key': 'copyrights', 'glyph': '©', 'code': 'CR',
     'name': ('Copyrights', 'حقوق المؤلف'),
     'short': ('Your creative works — written, visual and digital.', 'أعمالك الإبداعية: المكتوبة والمرئية والرقمية.'),
     'intro': ('Our firm’s copyright experience includes:', 'تشمل خبرة المكتب في حقوق المؤلف:'),
     'items': [
         ('Copyright searching and evaluating whether works are in the public domain.', 'البحث في حقوق المؤلف وتقييم ما إذا كانت المصنفات قد آلت إلى الملك العام.'),
         ('Filing and prosecuting copyright applications.', 'إيداع طلبات حقوق المؤلف ومتابعتها.'),
         ('Prosecuting and defending copyright infringement situations.', 'مباشرة قضايا التعدي على حقوق المؤلف والدفاع فيها.'),
         ('Rendering legal opinions concerning the ability to use a particular work.', 'إبداء الرأي القانوني حول إمكانية استخدام مصنف بعينه.'),
         ('Preparing cease and desist letters and resolving infringement situations to a successful conclusion.', 'إعداد إنذارات الكفّ عن التعدي وحل حالاته حتى نهايتها الناجحة.'),
         ('Preparing copyright license agreements and assignments.', 'إعداد عقود ترخيص حقوق المؤلف والتنازل عنها.'),
     ]},
    {'key': 'plant', 'glyph': 'V', 'code': 'PV',
     'name': ('Plant Variety', 'الأصناف النباتية'),
     'short': ('Exclusive rights for new plants and crops.', 'حقوق استئثارية للأصناف والمحاصيل الجديدة.'),
     'intro': ('A key driver for plant breeders — from individuals to large enterprises.', 'محرّك أساسي لمربّي النباتات، من الأفراد حتى المؤسسات الكبرى.'),
     'items': [
         ('A key driver for all plant breeders, from individuals to small, medium and large enterprises, to disclose their creations and innovative ideas in new agricultural and horticultural products with improved characteristics.', 'حافز أساسي لكل مربّي النباتات، أفراداً ومؤسسات صغيرة ومتوسطة وكبيرة، للإفصاح عن ابتكاراتهم في منتجات زراعية وبستانية جديدة ذات خصائص محسّنة.'),
         ('Plant variety protection is a form of intellectual property where breeders are given exclusive rights to have their new plants and crops protected for a period of time — in some jurisdictions it is treated as an alternative patent.', 'حماية الأصناف النباتية شكل من أشكال الملكية الفكرية يمنح المربّين حقوقاً استئثارية لحماية أصنافهم ومحاصيلهم الجديدة لمدة محددة، وتُعامل في بعض الأنظمة كبديل لبراءة الاختراع.'),
         ('At AAA IP we provide our clients with all useful information related to this key element of intellectual property protection.', 'نقدّم في AAA لعملائنا كل ما يلزم من معلومات حول هذا الركن المهم من أركان الحماية.'),
     ]},
    {'key': 'domains', 'glyph': '@', 'code': 'DN',
     'name': ('Domain Names', 'أسماء النطاقات'),
     'short': ('Your brand, secured across the internet.', 'علامتك مؤمّنة على شبكة الإنترنت.'),
     'intro': ('Expertise from domain name issues to internet-based IP enforcement:', 'خبرة تمتد من قضايا أسماء النطاقات حتى إنفاذ الحقوق على الإنترنت:'),
     'items': [
         ('Transfer of infringing domain names to the trademark owner.', 'نقل أسماء النطاقات المتعدية إلى مالك العلامة التجارية.'),
         ('Agreements for website development and IP protection.', 'إعداد عقود تطوير المواقع الإلكترونية وحماية ملكيتها الفكرية.'),
         ('Procurement, evaluation and opinions on patents directed to internet and e-commerce inventions.', 'استصدار وتقييم البراءات الخاصة باختراعات الإنترنت والتجارة الإلكترونية وإبداء الرأي فيها.'),
         ('Advising clients on the relevant issues so their business rights are protected and enforced.', 'إرشاد العملاء في المسائل ذات الصلة لضمان حماية حقوقهم التجارية وإنفاذها.'),
     ]},
]

# ------------------------------------------------------------------ practice areas (four)
AREAS = [
    {'key': 'protection', 'n': '01',
     'name': ('Intellectual Property Protection', 'حماية الملكية الفكرية'),
     'lead': ('Registering and defending the six rights that make your work yours.', 'تسجيل الحقوق الست التي تجعل عملك ملكاً لك، والدفاع عنها.'),
     'items': [('Trademarks', 'العلامات التجارية'), ('Patents', 'براءات الاختراع'), ('Industrial Designs', 'النماذج الصناعية'), ('Copyrights', 'حقوق المؤلف'), ('Plant Variety', 'الأصناف النباتية'), ('Domain Names', 'أسماء النطاقات')]},
    {'key': 'litigation', 'n': '02',
     'name': ('Litigation & Law Enforcement', 'التقاضي وإنفاذ القانون'),
     'lead': ('When rights are challenged, we enforce them — in the office, the market and the court.', 'حين تُمسّ حقوقك نتولّى إنفاذها: في المكاتب الرسمية، وفي السوق، وأمام القضاء.'),
     'items': [('Litigation', 'التقاضي'), ('Anti-Counterfeit', 'مكافحة التقليد'), ('Corporate & Commercial Law', 'قانون الشركات والقانون التجاري')]},
    {'key': 'corporate', 'n': '03',
     'name': ('Companies Services', 'خدمات الشركات'),
     'lead': ('From incorporation to restructuring, handled by a dedicated department.', 'من التأسيس حتى إعادة الهيكلة، يتولاها قسم متخصص.'),
     'items': [('Companies Incorporation', 'تأسيس الشركات'), ('Amendments', 'تعديلات الشركات'), ('Merger through Absorption', 'الاندماج بطريق الضم'), ('Company Split-Up', 'تقسيم الشركات'), ('GOEIC Services', 'خدمات هيئة الرقابة على الصادرات والواردات')]},
    {'key': 'related', 'n': '04',
     'name': ('Related Services', 'خدمات مساندة'),
     'lead': ('The practical services that complete a protected brand.', 'الخدمات العملية التي تكتمل بها حماية العلامة.'),
     'items': [('Barcode Registration', 'تسجيل الباركود'), ('Market Investigation', 'التحرّي في السوق'), ('Translation', 'الترجمة')]},
]

LITIGATION = [
    {'n': '02.1', 'name': ('Litigation', 'التقاضي'),
     'text': ('We litigate trademark, trade-dress, patent, design and copyright disputes — preparing the case, the evidence and the expert opinion, and pursuing it through the competent courts and appeal boards.',
              'نتولّى التقاضي في منازعات العلامات التجارية والمظهر التجاري والبراءات والنماذج وحقوق المؤلف؛ نُعدّ القضية وأدلتها والرأي الفني، ونتابعها أمام المحاكم المختصة ولجان الطعون.'),
     'points': [('Oppositions & cancellations', 'الاعتراضات ودعاوى الشطب'), ('Infringement suits', 'دعاوى التعدي'), ('Appeal briefs', 'مذكرات الطعن'), ('Expert testimony', 'الشهادة الفنية')]},
    {'n': '02.2', 'name': ('Anti-Counterfeit', 'مكافحة التقليد'),
     'text': ('Counterfeits erode value and trust. We trace infringing goods, document the infringement, issue cease and desist letters and pursue the infringer until the situation reaches a successful conclusion.',
              'السلع المقلّدة تستنزف القيمة والثقة. نتتبّع السلع المتعدية ونوثّق التعدي ونوجّه إنذارات الكفّ، ونلاحق المتعدي حتى تصل الحالة إلى نهايتها الناجحة.'),
     'points': [('Market investigation', 'التحرّي في السوق'), ('Evidence & documentation', 'جمع الأدلة والتوثيق'), ('Cease & desist letters', 'إنذارات الكفّ عن التعدي'), ('Enforcement actions', 'إجراءات الإنفاذ')]},
    {'n': '02.3', 'name': ('Corporate & Commercial Law', 'قانون الشركات والقانون التجاري'),
     'text': ('IP lives inside contracts. We prepare and negotiate licence agreements and assignments, and conduct due diligence for mergers and acquisitions, so your rights stay protected at every transaction.',
              'الملكية الفكرية تعيش داخل العقود. نُعدّ عقود الترخيص ونقل الملكية ونفاوض عليها، ونجري الفحص النافي للجهالة في الاندماج والاستحواذ، لتبقى حقوقك محمية في كل صفقة.'),
     'points': [('Licence agreements', 'عقود الترخيص'), ('Assignments', 'عقود نقل الملكية'), ('M&A due diligence', 'الفحص في الاندماج والاستحواذ'), ('Legal opinions', 'الآراء القانونية')]},
]

CORPORATE = [
    {'name': ('Companies Incorporation', 'تأسيس الشركات'),
     'text': ('Establishing your company on solid legal ground, from the first documents to the final registration.', 'تأسيس شركتك على أرضية قانونية صلبة، من أول مستند حتى القيد النهائي.')},
    {'name': ('Amendments', 'تعديلات الشركات'),
     'text': ('Amending the company’s data, capital, partners or activities in line with the applicable procedures.', 'تعديل بيانات الشركة أو رأس مالها أو شركائها أو أنشطتها وفق الإجراءات المعمول بها.')},
    {'name': ('Merger through Absorption', 'الاندماج بطريق الضم'),
     'text': ('Structuring and completing the merger of one company into another.', 'هيكلة وإتمام اندماج شركة في أخرى بطريق الضم.')},
    {'name': ('Company Split-Up', 'تقسيم الشركات'),
     'text': ('Dividing a company into separate entities with clear legal standing.', 'تقسيم الشركة إلى كيانات مستقلة ذات مراكز قانونية واضحة.')},
    {'name': ('GOEIC Services', 'خدمات هيئة الرقابة على الصادرات والواردات'),
     'text': ('Services before the General Organization for Export & Import Control (GOEIC).', 'الخدمات أمام الهيئة العامة للرقابة على الصادرات والواردات (GOEIC).')},
]

RELATED = [
    {'n': '04.1', 'name': ('Barcode Registration', 'تسجيل الباركود'),
     'text': ('Registering product barcodes so your goods can be identified and traded through retail and distribution channels.', 'تسجيل الباركود لمنتجاتك لتُعرَّف وتُتداول عبر قنوات البيع والتوزيع.')},
    {'n': '04.2', 'name': ('Market Investigation', 'التحرّي في السوق'),
     'text': ('Investigating the market to detect use, imitation or infringement of your rights before and after registration.', 'التحرّي في السوق لرصد استخدام حقوقك أو تقليدها أو التعدي عليها، قبل التسجيل وبعده.')},
    {'n': '04.3', 'name': ('Translation', 'الترجمة'),
     'text': ('Translating the documents, specifications and correspondence your filings require.', 'ترجمة المستندات والمواصفات والمراسلات التي تتطلبها طلبات الإيداع.')},
]

# ------------------------------------------------------------------ why us / beliefs
WHY = [
    (('High quality + competitive charges', 'جودة عالية + أتعاب تنافسية'),
     ('Both privileges together — without affecting the quality of our services.', 'الميزتان معاً، دون أي مساس بجودة خدماتنا.'), None),
    (('Office actions with our professional opinion', 'الإجراءات الرسمية مع رأينا المهني'),
     ('We deliver all office actions together with our professional opinion.', 'نوافيك بكل الإجراءات الرسمية مرفقة برأينا المهني.'), True),
    (('Inquiries answered in no time', 'الرد على الاستفسارات فوراً'),
     ('Every inquiry is answered promptly.', 'كل استفسار يُجاب عنه في أسرع وقت.'), True),
    (('A reminder system for every deadline', 'نظام تذكير بكل المواعيد'),
     ('Our reminder system alerts you to all deadlines, so no case is ever missed.', 'نظام التذكير لدينا ينبّهك بكل المواعيد النهائية حتى لا تفوت أي قضية.'), True),
    (('No hidden or additional fees', 'بلا رسوم خفية أو إضافية'),
     ('What we quote is what you pay.', 'ما نعرضه عليك هو ما تدفعه.'), None),
    (('A strong network of partner firms', 'شبكة قوية من المكاتب الشريكة'),
     ('Leveraging high-profile partner firms, your client’s rights can be protected wherever they need.', 'بالاستناد إلى شبكة من المكاتب الشريكة المرموقة، نحمي حقوق عملائك أينما احتاجوا.'), None),
]

BELIEFS = [
    (('Well-Trained Work Group', 'فريق عمل مدرَّب'),
     ('To assist small, medium, large organizations & individuals to establish, protect & enforce their intellectual property rights.', 'لمساعدة المؤسسات الصغيرة والمتوسطة والكبيرة والأفراد على إنشاء حقوق ملكيتهم الفكرية وحمايتها وإنفاذها.')),
    (('Close Cooperation', 'تعاون وثيق'),
     ('Close cooperation among legal professionals, with emphasis on truly understanding clients’ problems and finding practical solutions.', 'تعاون وثيق بين المختصين القانونيين، مع التركيز على الفهم الحقيقي لمشكلات العملاء وإيجاد حلول عملية لتحقيق أهدافهم.')),
    (('Accurate Detection', 'رصد دقيق'),
     ('Our accurate detection of, and prompt reaction to, changes in law & society enables the most effective legal solutions.', 'رصدنا الدقيق لتغيّرات القانون والمجتمع واستجابتنا السريعة لها يتيحان لنا تقديم أنجع الحلول القانونية.')),
    (('Nonstop Learning', 'تعلّم لا يتوقف'),
     ('Strong tenacity and continuous innovation are the backbone of AAA’s service model.', 'المثابرة القوية والابتكار المستمر هما العمود الفقري لنموذج خدمات AAA.')),
]

STATS = [
    ('5000', '+', ('Successful cases', 'قضية ناجحة')),
    ('6', '', ('IP rights protected', 'حقوق ملكية فكرية نحميها')),
    ('4', '', ('Practice areas', 'مجالات ممارسة')),
    ('24', ('h', ' س'), ('Inquiry response', 'للرد على الاستفسار')),
]

# Egyptian trademark path (facts from the firm's Egypt guide)
PROCESS = [
    (('Filing', 'الإيداع'), ('Notarized & legalized power of attorney — one POA covers all applications of the same applicant, and may follow within six months at no extra fee.', 'توكيل موثّق ومصدّق حتى القنصلية المصرية؛ توكيل واحد يكفي لكل طلبات المودِع نفسه، ويمكن تقديمه خلال ستة أشهر دون رسوم إضافية.'), ('Day 0', 'اليوم 0')),
    (('Classification', 'التصنيف'), ('International classification of goods & services, with multi-class filing since 2007. Paris Convention priority may be claimed.', 'التصنيف الدولي للسلع والخدمات، مع إمكانية الإيداع متعدد الفئات منذ 2007، وجواز المطالبة بالأولوية وفق اتفاقية باريس.'), ('Examination', 'الفحص')),
    (('Publication', 'النشر'), ('The accepted mark is published in the Official Trademark Gazette.', 'تُنشر العلامة المقبولة في جريدة العلامات التجارية الرسمية.'), ('Gazette', 'الجريدة')),
    (('Opposition', 'الاعتراض'), ('A two-month window during which third parties may oppose.', 'مهلة شهرين يجوز للغير خلالها الاعتراض.'), ('2 months', 'شهران')),
    (('Registration', 'التسجيل'), ('Protection for 10 years from the filing date — first to file.', 'حماية لمدة 10 سنوات من تاريخ الإيداع، والحق للأسبق في الإيداع.'), ('10 years', '10 سنوات')),
    (('Renewal', 'التجديد'), ('Renewed for further 10-year terms; the renewal is filed within 12 months before expiry.', 'تُجدَّد لمدد مماثلة كل منها 10 سنوات، ويُقدَّم طلب التجديد خلال 12 شهراً قبل الانتهاء.'), ('∞', '∞')),
]

# ------------------------------------------------------------------ team
DIRECTORS = [
    {'ini': 'AA', 'name': ('Abdelhamed Adel', 'عبد الحميد عادل'), 'title': ('CEO & Founder', 'الرئيس التنفيذي والمؤسس'),
     'role': ('AAA For Intellectual Property is founded and managed by Mr. Abdelhamed Adel — the natural extension of a well-known family with long experience in law, and in intellectual property especially.',
              'أسّس الأستاذ عبد الحميد عادل مكتب AAA للملكية الفكرية ويتولّى إدارته، وهو امتداد طبيعي لعائلة معروفة ذات خبرة طويلة في مجال القانون، والملكية الفكرية على وجه الخصوص.'),
     'mail': 'Abdelhamed@AAA-IP.org'},
    {'ini': 'MA', 'name': ('Mahmoud Adel', 'محمود عادل'), 'title': ('Consultant & Partner', 'مستشار وشريك'),
     'role': ('Patent & Trademark Attorney. Director of the Trademark and Patent Department.', 'وكيل براءات وعلامات تجارية، ومدير إدارة العلامات التجارية وبراءات الاختراع.')},
    {'ini': 'MA', 'name': ('Mohamed Adel', 'محمد عادل'), 'title': ('Consultant & Partner', 'مستشار وشريك'),
     'role': ('Companies Incorporation Attorney. Director of the Companies Services & Incorporation Department.', 'محامي تأسيس الشركات، ومدير إدارة خدمات الشركات والتأسيس.')},
    {'ini': 'DA', 'name': ('Dina Ahmed', 'دينا أحمد'), 'title': ('Partner', 'شريك'),
     'role': ('Advocate & Legal Adviser. Director of the Legal Affairs Department.', 'محامية ومستشارة قانونية، ومديرة إدارة الشؤون القانونية.')},
]

TEAM = [
    ('MS', ('Mohamed Souror', 'محمد سرور'), ('Trademark Department', 'إدارة العلامات التجارية')),
    ('AS', ('Afaf Sayed', 'عفاف سيد'), ('Trademark Department', 'إدارة العلامات التجارية')),
    ('KF', ('Kholoud Faheem', 'خلود فهيم'), ('Patent & Design Department', 'إدارة البراءات والنماذج')),
    ('MS', ('Mohamed Salem', 'محمد سالم'), ('Human Resources Department', 'إدارة الموارد البشرية')),
    ('RA', ('Reem Abdelkarem', 'ريم عبد الكريم'), ('Administrative Officer', 'مسؤولة إدارية')),
    ('JA', ('Jana Adel', 'جنى عادل'), ('Offers Department', 'إدارة العروض')),
    ('AS', ('Assma’ Salah', 'أسماء صلاح'), ('Public Relations Department', 'إدارة العلاقات العامة')),
    ('NM', ('Nada Mossa’d', 'ندى مسعد'), ('Marketing Department', 'إدارة التسويق')),
]

# ------------------------------------------------------------------ jurisdictions
JUR = [
    {'key': 'E', 'code': 'EG', 'name': ('Egypt', 'مصر'), 'office': ('Internal Trade Development Authority (ITDA)', 'جهاز تنمية التجارة الداخلية (ITDA)'),
     'lead': ('Egypt is one of the first countries concerned with the protection and preservation of IP rights — with judicial rulings on trademarks as early as 1924. It is our home jurisdiction.',
              'مصر من أوائل الدول التي اهتمت بحماية حقوق الملكية الفكرية وصونها، وتعود الأحكام القضائية في العلامات التجارية فيها إلى عام 1924. وهي مقر عملنا الرئيسي.'),
     'blocks': [
         (('Trademarks — required documents', 'العلامات التجارية — المستندات المطلوبة'), [
             ('Notarized & legalized power of attorney up to the Egyptian consulate (one POA for all applications of the same applicant; may be submitted within six months at no extra fee).', 'توكيل موثّق ومصدّق حتى القنصلية المصرية (توكيل واحد لكل طلبات المودِع، ويمكن تقديمه خلال ستة أشهر دون رسوم إضافية).'),
             ('Certified copy of the priority application, if priority is claimed (within 6 months of the first filing under the Paris Convention).', 'صورة معتمدة من طلب الأولوية عند المطالبة بها (خلال 6 أشهر من أول إيداع وفق اتفاقية باريس).'),
             ('Renewal: a power of attorney notarized & legalized up to the Egyptian consulate.', 'التجديد: توكيل موثّق ومصدّق حتى القنصلية المصرية.')]),
         (('Trademarks — general information', 'العلامات التجارية — معلومات عامة'), [
             ('Classification: international, multi-class filing as of 2007.', 'التصنيف: دولي، مع الإيداع متعدد الفئات منذ 2007.'),
             ('Priority under Paris Convention: yes. Legal effect: first to file.', 'الأولوية وفق اتفاقية باريس: نعم. الأثر القانوني: الحق للأسبق في الإيداع.'),
             ('Publication: Official Trademark Gazette. Opposition period: 2 months.', 'النشر: جريدة العلامات التجارية الرسمية. مهلة الاعتراض: شهران.'),
             ('Registration: 10 years from filing. Renewal: 10 years, filed within 12 months before expiry.', 'مدة التسجيل: 10 سنوات من الإيداع. التجديد: 10 سنوات، ويُقدَّم خلال 12 شهراً قبل الانتهاء.')]),
         (('Patents', 'براءات الاختراع'), [
             ('PCT national phase: legalized POA (may follow within 4 months), search & preliminary examination reports, PCT publication.', 'المرحلة الوطنية لمعاهدة التعاون (PCT): توكيل مصدّق (يمكن تقديمه خلال 4 أشهر)، وتقريرا البحث والفحص التمهيدي، ونشرة الطلب الدولي.'),
             ('Priority (12-month) applications: legalized POA, incorporation certificate / business licence and deed of assignment (each may follow within 3–4 months), certified priority documents.', 'طلبات الأولوية (12 شهراً): توكيل مصدّق، وشهادة التأسيس أو الترخيص التجاري، وعقد التنازل (يمكن تقديم كل منها خلال 3 إلى 4 أشهر)، وصورة معتمدة من مستندات الأولوية.')]),
         (('Industrial designs', 'النماذج الصناعية'), [
             ('Legalized POA, legalized commercial register, and certified priority copy if claimed (within 6 months).', 'توكيل مصدّق، وسجل تجاري مصدّق، وصورة معتمدة من طلب الأولوية إن وُجد (خلال 6 أشهر).'),
             ('Registration normally takes 14–16 months. Protection: 10 years from filing, extendable once by 5 years.', 'يستغرق التسجيل عادةً من 14 إلى 16 شهراً. مدة الحماية: 10 سنوات من الإيداع، قابلة للمد مرة واحدة 5 سنوات.')]),
     ]},
    {'key': 'G', 'code': 'GCC', 'name': ('GCC', 'دول الخليج'), 'office': ('GCC Patent Office — patents only', 'مكتب براءات الاختراع لدول مجلس التعاون — للبراءات فقط'),
     'lead': ('A GCC patent secures the inventor’s rights in all six member states: Bahrain, Kuwait, Qatar, Oman, Saudi Arabia and the UAE.',
              'براءة الاختراع الخليجية تحمي حقوق المخترع في الدول الأعضاء الست: البحرين والكويت وقطر وعُمان والسعودية والإمارات.'),
     'blocks': [
         (('Term & annuities', 'المدة والرسوم السنوية'), [
             ('Valid for 20 years from filing, provided annuities are paid.', 'سارية 20 عاماً من تاريخ الإيداع بشرط سداد الرسوم السنوية.'),
             ('Annuities fall due each year and are payable from January 1 to March 31; late payment possible within 3 more months with a surcharge.', 'تُستحق الرسوم سنوياً وتُسدَّد من 1 يناير حتى 31 مارس، ويجوز السداد المتأخر خلال 3 أشهر تالية مقابل رسم إضافي.')]),
         (('Filing requirements', 'متطلبات الإيداع'), [
             ('POA, incorporation certificate, business licence and deed of assignment — each notarized and legalized up to a GCC member-state consulate.', 'التوكيل وشهادة التأسيس والترخيص التجاري وعقد التنازل، وكلها موثّقة ومصدّقة حتى قنصلية إحدى دول المجلس.'),
             ('Certified copy of the priority document if the Paris Convention is claimed.', 'صورة معتمدة من مستند الأولوية عند المطالبة بها وفق اتفاقية باريس.')]),
     ]},
    {'key': 'O', 'code': 'OAPI', 'name': ('OAPI', 'الأوابي'), 'office': ('African Intellectual Property Organization', 'المنظمة الأفريقية للملكية الفكرية'),
     'lead': ('One application covers all 17 French-speaking member states — Benin, Burkina Faso, Cameroon, CAR, Chad, Congo, Equatorial Guinea, Gabon, Guinea, Guinea-Bissau, Ivory Coast, Mali, Mauritania, Niger, Senegal, Togo and more.',
              'طلب واحد يغطي كل الدول الأعضاء الناطقة بالفرنسية: بنين وبوركينا فاسو والكاميرون وأفريقيا الوسطى وتشاد والكونغو وغينيا الاستوائية والغابون وغينيا وغينيا بيساو وساحل العاج ومالي وموريتانيا والنيجر والسنغال وتوغو.'),
     'blocks': [
         (('Trademarks', 'العلامات التجارية'), [
             ('Multi-class filing, Nice Classification 11th edition; Madrid Protocol: yes.', 'إيداع متعدد الفئات وفق تصنيف نيس (الطبعة 11)، وعضوية بروتوكول مدريد: نعم.'),
             ('About 12 months to registration; protection 10 years from application.', 'نحو 12 شهراً حتى التسجيل؛ والحماية 10 سنوات من تاريخ الطلب.'),
             ('Opposition period 6 months; non-use for 5 years exposes the mark to cancellation.', 'مهلة الاعتراض 6 أشهر؛ وعدم الاستخدام 5 سنوات متتالية يعرّض العلامة للشطب.'),
             ('Renewal within 1 year before expiry; 6-month grace period with penalty.', 'التجديد خلال سنة قبل الانتهاء، مع مهلة سماح 6 أشهر بغرامة.')]),
         (('Patents & designs', 'البراءات والنماذج'), [
             ('Patents: 20 years under the Bangui Agreement, annuities yearly; Paris priority 12 months; PCT member.', 'البراءات: 20 عاماً وفق اتفاقية بانغي مع رسوم سنوية؛ أولوية باريس 12 شهراً؛ عضو في معاهدة PCT.'),
             ('Designs: 5 years renewable twice (15 years); Paris priority 6 months; annuities every 5 years.', 'النماذج: 5 سنوات قابلة للتجديد مرتين (15 عاماً)؛ أولوية باريس 6 أشهر؛ رسوم كل 5 سنوات.')]),
     ]},
    {'key': 'R', 'code': 'ARIPO', 'name': ('ARIPO', 'الأريبو'), 'office': ('African Regional Intellectual Property Organization', 'المنظمة الإقليمية الأفريقية للملكية الفكرية'),
     'lead': ('The regional route for English-speaking Africa — Botswana, Gambia, Ghana, Kenya, Lesotho, Liberia, Malawi, Mozambique, Namibia, Rwanda, Sierra Leone, Sudan, Tanzania, Uganda, Zambia, Zimbabwe and more.',
              'المسار الإقليمي لأفريقيا الناطقة بالإنجليزية: بوتسوانا وغامبيا وغانا وكينيا وليسوتو وليبيريا وملاوي وموزمبيق وناميبيا ورواندا وسيراليون والسودان وتنزانيا وأوغندا وزامبيا وزيمبابوي وغيرها.'),
     'blocks': [
         (('Trademarks — Banjul Protocol', 'العلامات — بروتوكول بانجول'), [
             ('Adopted 19 November 1993; a single application filed at a contracting state or directly with ARIPO.', 'اعتُمد في 19 نوفمبر 1993؛ طلب واحد يُودَع لدى إحدى الدول المتعاقدة أو مباشرة لدى الأريبو.'),
             ('Revised since 1997 for compatibility with TRIPS and the Trademark Law Treaty.', 'نُقّح منذ 1997 ليتوافق مع اتفاقية تريبس ومعاهدة قانون العلامات.')]),
         (('Patents & designs — Harare Protocol', 'البراءات والنماذج — بروتوكول هراري'), [
             ('Adopted 10 December 1982, in force 1984.', 'اعتُمد في 10 ديسمبر 1982 ودخل حيز النفاذ عام 1984.'),
             ('One application may designate any of the Harare Protocol contracting states.', 'طلب واحد يجوز فيه تعيين أي من الدول المتعاقدة في بروتوكول هراري.')]),
     ]},
    {'key': 'U', 'code': 'EUIPO', 'name': ('European Union', 'الاتحاد الأوروبي'), 'office': ('European Union Intellectual Property Office', 'مكتب الاتحاد الأوروبي للملكية الفكرية'),
     'lead': ('A four-tier system for trademark protection across the EU member states — national, regional (Benelux), European and international routes.',
              'نظام من أربعة مسارات لحماية العلامات في دول الاتحاد الأوروبي: الوطني، والإقليمي (البنلوكس)، والأوروبي، والدولي.'),
     'blocks': [
         (('Trademarks — four routes', 'العلامات — أربعة مسارات'), [
             ('National route: file directly at the national office of one member state.', 'المسار الوطني: الإيداع مباشرة لدى المكتب الوطني لدولة عضو واحدة.'),
             ('Regional route: BOIP for Belgium, the Netherlands and Luxembourg.', 'المسار الإقليمي: مكتب البنلوكس لبلجيكا وهولندا ولوكسمبورغ.'),
             ('European route: an EU trade mark from EUIPO, renewable indefinitely every 10 years.', 'المسار الأوروبي: علامة الاتحاد الأوروبي من EUIPO، قابلة للتجديد بلا حد كل 10 سنوات.'),
             ('International route: extend protection to Madrid Protocol countries.', 'المسار الدولي: مد الحماية إلى دول بروتوكول مدريد.')]),
         (('Designs — registered or unregistered', 'النماذج — مسجّلة أو غير مسجّلة'), [
             ('Registered Community Design (RCD) before commercialisation, or rely on the Unregistered Community Design (UCD).', 'نموذج مجتمعي مسجّل قبل الطرح التجاري، أو الاعتماد على النموذج المجتمعي غير المسجّل.'),
             ('Both prohibit manufacturing, marketing, offering, importing or exporting the protected design without consent — but differ in scope and duration.', 'كلاهما يحظر تصنيع النموذج المحمي أو تسويقه أو عرضه أو استيراده أو تصديره دون موافقة، مع اختلاف في النطاق والمدة.')]),
     ]},
    {'key': 'S', 'code': 'USPTO', 'name': ('United States', 'الولايات المتحدة'), 'office': ('United States Patent and Trademark Office', 'مكتب براءات الاختراع والعلامات التجارية الأمريكي'),
     'lead': ('The federal agency for granting U.S. patents and registering trademarks.', 'الجهة الفيدرالية المختصة بمنح البراءات الأمريكية وتسجيل العلامات التجارية.'),
     'blocks': [
         (('Trademarks — filing basis', 'العلامات — أساس الإيداع'), [
             ('Use in commerce: submit a specimen and the dates of first use.', 'الاستخدام التجاري: تقديم عيّنة الاستخدام وتواريخ أول استخدام.'),
             ('Intent to use: a bona fide intent to use; registration follows proof of use.', 'نيّة الاستخدام: نيّة جادّة للاستخدام، ويتم التسجيل بعد إثبات الاستخدام.')]),
         (('Patents — three types', 'البراءات — ثلاثة أنواع'), [
             ('Utility patents — new and useful processes, machines, articles or compositions.', 'براءات المنفعة: العمليات أو الآلات أو المنتجات أو التركيبات الجديدة والمفيدة.'),
             ('Design patents — new, original, ornamental designs.', 'براءات التصميم: التصاميم الزخرفية الجديدة والأصيلة.'),
             ('Plant patents — distinct and new asexually reproduced plant varieties.', 'براءات النبات: الأصناف النباتية الجديدة المتميزة المتكاثرة لا جنسياً.')]),
     ]},
    {'key': 'A', 'code': 'ASIA', 'name': ('Asia', 'آسيا'), 'office': ('Through our associate network', 'عبر شبكة المكاتب الشريكة'),
     'lead': ('It is our pleasure to receive your inquiry in respect of IP protection in any Asian country.', 'يسعدنا تلقّي استفسارك بشأن حماية الملكية الفكرية في أي دولة آسيوية.'),
     'blocks': []},
    {'key': 'F', 'code': 'AFRICA', 'name': ('All Africa', 'كل أفريقيا'), 'office': ('National offices across the continent', 'المكاتب الوطنية في أنحاء القارة'),
     'lead': ('It is our pleasure to receive your inquiry in respect of IP protection in any African country.', 'يسعدنا تلقّي استفسارك بشأن حماية الملكية الفكرية في أي دولة أفريقية.'),
     'blocks': []},
    {'key': 'M', 'code': 'MENA', 'name': ('Middle East', 'الشرق الأوسط'), 'office': ('Regional offices & associates', 'مكاتب وشركاء في المنطقة'),
     'lead': ('It is our pleasure to receive your inquiry in respect of IP protection in any Middle Eastern country.', 'يسعدنا تلقّي استفسارك بشأن حماية الملكية الفكرية في أي دولة من دول الشرق الأوسط.'),
     'blocks': []},
]

NETWORK = ('Operating from its headquarters in Egypt, AAA IP has offices in many major Arab cities, and liaises with a worldwide network of associates in North America, South America, Africa, Asia and Oceania.',
           'من مقره الرئيسي في مصر، يمتلك AAA مكاتب في كثير من المدن العربية الكبرى، ويتعاون مع شبكة عالمية من المكاتب الشريكة في أمريكا الشمالية والجنوبية وأفريقيا وآسيا وأوقيانوسيا.')

# ------------------------------------------------------------------ about texts
WELCOME = ('We have the pleasure to introduce ourselves: we are AAA IP, an Intellectual Property law firm based in Cairo, Egypt, with representation worldwide.',
           'يسعدنا أن نقدّم أنفسنا: نحن AAA، مكتب محاماة متخصص في الملكية الفكرية، مقرّه القاهرة، وله تمثيل حول العالم.')
ABOUT = ('One of the most active IP firms in Egypt & the Middle East — a well-established law firm providing a full spectrum of intellectual property services: trademarks, patents, industrial designs & copyrights. We assist small, medium and large organizations & individuals to establish, protect & enforce their rights in Egypt, the Middle East and all African countries.',
         'من أنشط مكاتب الملكية الفكرية في مصر والشرق الأوسط، ومكتب راسخ يقدّم الطيف الكامل من خدمات الملكية الفكرية: العلامات التجارية وبراءات الاختراع والنماذج الصناعية وحقوق المؤلف. نساعد المؤسسات الصغيرة والمتوسطة والكبيرة والأفراد على إنشاء حقوقهم وحمايتها وإنفاذها في مصر والشرق الأوسط وجميع الدول الأفريقية.')
GOAL = ('To make your interests our interests — in the hands of a well-trained work group, working hard to achieve common goals and provide professional services that match your expectations.',
        'أن نجعل مصالحك مصالحنا، بين أيدي فريق عمل مدرَّب، يعمل بجد لتحقيق الأهداف المشتركة وتقديم خدمات مهنية ترقى إلى توقعاتك.')
TREAT = ('Protect your ideas and intellectual property through our professional services and expertise. The key element in our firm is the methods and strategies used when performing a job — to the highest level our clients are used to. Our team works as one entity, so the final result is rendered to the standard we accept to comply with — no less.',
         'احمِ أفكارك وملكيتك الفكرية بخبرتنا وخدماتنا المهنية. جوهر عملنا هو المنهجية والاستراتيجية التي نؤدي بها كل مهمة، على أعلى مستوى اعتاده عملاؤنا. يعمل فريقنا ككيان واحد، لتخرج النتيجة النهائية بالمعيار الذي التزمنا به، لا أقل.')
TRAINING = ('We focus on training and developing the professional capacities of our people and providing them with the latest technology, so they perform to advanced professional standards and earn the confidence and respect of clients all over the world.',
            'نركّز على تدريب كوادرنا وتطوير قدراتهم المهنية وتزويدهم بأحدث التقنيات، ليؤدّوا عملهم وفق أرقى المعايير المهنية وينالوا ثقة العملاء واحترامهم في كل أنحاء العالم.')
BELIEF_LONG = ('The spirit of nonstop learning, strong tenacity and continuous innovation is the backbone of AAA’s service model. Our accurate detection of, and prompt reaction to, changes in law and society enables us to provide the most effective legal solutions to our clients.',
               'روح التعلّم الذي لا يتوقف، والمثابرة القوية، والابتكار المستمر هي العمود الفقري لنموذج خدمات AAA. ورصدنا الدقيق لتغيّرات القانون والمجتمع واستجابتنا السريعة لها يمكّناننا من تقديم أنجع الحلول القانونية لعملائنا.')

SERVE = [
    (('Individuals', 'الأفراد'), ('Inventors, creators and founders protecting their first idea.', 'المخترعون والمبدعون والمؤسسون الذين يحمون فكرتهم الأولى.')),
    (('Small & medium businesses', 'الشركات الصغيرة والمتوسطة'), ('Brands growing into new markets and new categories.', 'علامات تنمو نحو أسواق وفئات جديدة.')),
    (('Large organizations', 'المؤسسات الكبرى'), ('Portfolios managed across many classes and countries.', 'محافظ حقوق تُدار عبر فئات ودول متعددة.')),
    (('Foreign IP firms', 'مكاتب الملكية الفكرية الأجنبية'), ('Associates who need a trusted partner in Egypt, the Middle East & Africa.', 'شركاء يحتاجون إلى مكتب موثوق في مصر والشرق الأوسط وأفريقيا.')),
]

POLICY_MAIN = [
    ('Our main policy is to make your interests our interests; we work hard to achieve common goals and provide professional services which match your expectations.', 'سياستنا الأساسية أن نجعل مصالحك مصالحنا؛ نعمل بجد لتحقيق الأهداف المشتركة وتقديم خدمات مهنية تلبّي توقعاتك.'),
    ('Providing the requirements with the highest levels of professionalism, at very competitive prices, and putting them in progress once we receive your instructions.', 'تنفيذ المتطلبات بأعلى درجات الاحتراف، وبأسعار تنافسية جداً، والبدء فيها فور تلقّي تعليماتك.'),
]
POLICY_BILLING = [
    ('Bank charges should be paid by the sender, not the beneficiary.', 'الرسوم البنكية يتحمّلها المُرسِل لا المستفيد.'),
    ('Payment should be sent to our bank account, as detailed in the invoice.', 'يُرسَل السداد إلى حسابنا البنكي وفق البيانات الموضحة في الفاتورة.'),
]
POLICY_PLAIN = ('We know legal action can sometimes be overwhelming. We are dedicated to helping you in language you can understand. If you don’t feel you understand your options, just ask — we will find an explanation that works for you.',
                'ندرك أن الإجراءات القانونية قد تبدو مربكة أحياناً، لذلك نلتزم بمساعدتك بلغة تفهمها. إن شعرت أن خياراتك غير واضحة، فقط اسأل، وسنجد الشرح الذي يناسبك.')
DISCLAIMER = ('AAA accepts no responsibility or liability whatsoever with regard to the information on this site or the operation thereof. The articles and information on this website are not intended to be a definitive analysis of legislation or other issues; the material is of a general nature, intended as a guide only, and may not reflect the most current legal developments. It is not intended to constitute, and should not be considered, legal reference or legal advice. Professional advice should be taken before any course of action is pursued. Receipt of our publications does not constitute an attorney-client relationship. The information is offered free of charge and, accordingly, AAA IP takes no responsibility for any loss occasioned by its use for whatever reason.',
              'لا يتحمّل AAA أي مسؤولية من أي نوع فيما يتعلق بالمعلومات الواردة في هذا الموقع أو تشغيله. المقالات والمعلومات المنشورة هنا ليست تحليلاً نهائياً للتشريعات أو غيرها من المسائل، وهي ذات طابع عام يُقصد بها الإرشاد فقط، وقد لا تعكس أحدث المستجدات القانونية، ولا تُعدّ مرجعاً قانونياً أو استشارة قانونية. ينبغي الحصول على استشارة مهنية قبل اتخاذ أي إجراء. ولا يُنشئ تلقّي منشوراتنا علاقة محامٍ بموكّل. تُقدَّم هذه المعلومات مجاناً، وبالتالي لا يتحمّل AAA أي مسؤولية عن أي خسارة تنشأ عن استخدامها لأي سبب كان.')
