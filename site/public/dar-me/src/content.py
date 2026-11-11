# -*- coding: utf-8 -*-
# All site copy, taken from dar-me.com (EN) with a professional Arabic translation.
# Each text is a pair: (en, ar).

CONTACT = {
    'phone': '+966 13 8640933',
    'tel': '+966138640933',
    'wa': '966138640933',
    'email': 'info@dar-me.com',
    'linkedin': 'https://www.linkedin.com/company/dar-middle-east-technology-company',
    'x': 'https://x.com/darmiddleeast',
    'maps': 'https://www.google.com/maps/search/?api=1&query=Mohamadiya+Towers+Dhahran+Street+Al+Khobar',
}

ADDRESS = ('Mohamadiya Towers, Dhahran Street, Al Khobar, Saudi Arabia',
           'أبراج المحمدية، شارع الظهران، الخبر، المملكة العربية السعودية')
ADDRESS_LINES = (['Mohamadiya Towers,', 'Dhahran Street,', 'Al Khobar, Saudi Arabia'],
                 ['أبراج المحمدية،', 'شارع الظهران،', 'الخبر، المملكة العربية السعودية'])
LEGAL_NAME = ('DAR Middle East Information Technology Company', 'شركة دار الشرق الأوسط لتقنية المعلومات')

TAGLINE = ('The Power Behind Intelligent Operations.', 'القوة التي تقف خلف العمليات الذكية.')
TAG_1 = ('The Power Behind', 'القوة التي تقف خلف')
TAG_2 = ('Intelligent Operations.', 'العمليات الذكية.')
SINCE = ('Since 2006 · Al Khobar, KSA', 'منذ 2006 · الخبر، السعودية')
CTA_EXPERTS = ('Connect with Our Experts', 'تواصل مع خبرائنا')
CTA_SERVICES = ('Explore Our Services', 'استكشف خدماتنا')
CTA_SERVICES_S = ('Explore Services', 'استكشف الخدمات')
NEXT_P = ('Tell us where the friction is. We will bring the platforms, the method, and the people who have solved it before.',
          'أخبرنا أين تكمن العقبة، وسنأتيك بالمنصّات والمنهجية والفريق الذي سبق أن حلّها من قبل.')
ENT_DELIVERY = ('Enterprise technology delivery for regulated and high-impact organizations across Saudi Arabia and the GCC.',
                'تنفيذ تقني مؤسسي للجهات الخاضعة للتنظيم وعالية الأثر في المملكة العربية السعودية ودول الخليج.')
UPDATES = ('Follow DAR ME on LinkedIn and X for the latest updates, announcements, milestones, and insights from across our operations and regions.',
           'تابع DAR ME على لينكدإن وإكس لمعرفة آخر المستجدات والإعلانات والإنجازات والرؤى من مختلف عملياتنا ومناطقنا.')

NAV = [
    ('index', ('Home', 'الرئيسية')),
    ('about', ('About', 'من نحن')),
    ('services', ('Services', 'الخدمات')),
    ('clients', ('Clients', 'عملاؤنا')),
    ('contact', ('Contact', 'تواصل معنا')),
]

# ---------------------------------------------------------------- pillars
PILLARS = [
    {
        'key': 'automate', 'sub': 'sub-27.svg', 'n': '01',
        'name': ('Automate', 'الأتمتة'),
        'short': ('Intelligent automation, RPA, IDP, Arabic AI.', 'الأتمتة الذكية، أتمتة العمليات الروبوتية، المعالجة الذكية للمستندات، والذكاء الاصطناعي العربي.'),
        'home': ('Intelligent automation, RPA, IDP, and Arabic-first AI that put repetitive work on autopilot.',
                 'أتمتة ذكية وأتمتة روبوتية للعمليات ومعالجة ذكية للمستندات وذكاء اصطناعي عربي أولاً، تضع الأعمال المتكررة على الطيّار الآلي.'),
        'svc': ('Operational efficiency through intelligent automation.', 'كفاءة تشغيلية عبر الأتمتة الذكية.'),
        'caps': ['RPA', 'IDP', 'BPM', ('Conversational AI', 'الذكاء الاصطناعي التحاوري')],
        'tech': ['Blue Prism', 'Nintex', 'ABBYY', 'DOC AI'],
    },
    {
        'key': 'transform', 'sub': 'sub-28.svg', 'n': '02',
        'name': ('Transform', 'التحوّل'),
        'short': ('Modern architecture, ERP, integration.', 'بنية حديثة، تخطيط موارد المؤسسات، وتكامل الأنظمة.'),
        'home': ('Modern architecture, ERP, and integration that turn legacy systems into a connected core.',
                 'بنية حديثة وأنظمة تخطيط موارد المؤسسات وتكامل يحوّل الأنظمة القديمة إلى نواة تشغيلية مترابطة.'),
        'svc': ('Modernizing systems and digital operations.', 'تحديث الأنظمة والعمليات الرقمية.'),
        'caps': [('Enterprise Architecture', 'البنية المؤسسية'), ('App Modernization', 'تحديث التطبيقات'), ('API Integration', 'تكامل الواجهات البرمجية'), 'ERP'],
        'tech': ['IFS', 'Oracle Primavera', 'MRI', 'Hexagon', 'Cleopatra'],
    },
    {
        'key': 'comply', 'sub': 'sub-29.svg', 'n': '03',
        'name': ('Comply', 'الامتثال'),
        'short': ('GRC, risk, healthcare quality systems.', 'الحوكمة والمخاطر والامتثال وأنظمة جودة الرعاية الصحية.'),
        'home': ('GRC, risk, and healthcare quality systems that make compliance continuous, not annual.',
                 'أنظمة الحوكمة والمخاطر والامتثال وجودة الرعاية الصحية التي تجعل الامتثال عملاً مستمراً لا مراجعةً سنوية.'),
        'svc': ('GRC for regulated environments.', 'الحوكمة والمخاطر والامتثال للبيئات الخاضعة للتنظيم.'),
        'caps': [('Policy & Compliance', 'السياسات والامتثال'), ('Risk Reporting', 'تقارير المخاطر'), ('Governance Dashboards', 'لوحات الحوكمة'), ('Healthcare Quality', 'جودة الرعاية الصحية')],
        'tech': ['Ideagen Guardian', 'Ideagen InPhase'],
    },
    {
        'key': 'upskill', 'sub': 'sub-30.svg', 'n': '04',
        'name': ('Upskill', 'التأهيل'),
        'short': ('Certified training & enablement programs.', 'برامج تدريب معتمدة وتمكين للفرق.'),
        'home': ('Certified training and enablement that turn your teams into the technology’s owners.',
                 'تدريب معتمد وتمكين يحوّل فرقك إلى مالكين حقيقيين للتقنية.'),
        'svc': ('Training and certification for future-ready teams.', 'تدريب وشهادات معتمدة لفرق جاهزة للمستقبل.'),
        'caps': [('AI / RPA', 'الذكاء الاصطناعي / RPA'), ('Cybersecurity', 'الأمن السيبراني'), 'SAP / ERP', 'Cisco / Microsoft'],
        'tech': ['Pearson VUE', 'SANS', 'EC-Council', 'PECB', 'CompTIA'],
    },
]

STATS_HOME = [
    ('2006', '', ('Founded', 'سنة التأسيس'), False),
    ('100', '+', ('Enterprise Projects', 'مشروع مؤسسي'), True),
    ('60', '+', ('Specialists', 'متخصص'), True),
    ('1000', '+', ('Automated Processes', 'عملية مؤتمتة'), True),
    ('30000', '+', ('Individuals Trained', 'متدرّب ومعتمد'), True),
    ('12000', '+', ('Training Courses', 'دورة تدريبية'), True),
]

ENGAGEMENT = [
    ('compass', ('Discover', 'الاستكشاف'), ('Process assessment and opportunity analysis.', 'تقييم العمليات وتحليل الفرص.')),
    ('pen', ('Design', 'التصميم'), ('Custom solution architecture and roadmaps.', 'تصميم بنية الحلول وخرائط الطريق المخصّصة.')),
    ('rocket', ('Deploy', 'التنفيذ'), ('Implementation, testing, and training.', 'التطبيق والاختبار والتدريب.')),
    ('cycle', ('Drive', 'الاستدامة'), ('Ongoing support, optimization, and scaling.', 'دعم مستمر وتحسين وتوسّع.')),
]
ENG_LABEL = ('Engagement Model', 'منهجية العمل')
ENG_TITLE = ('From Assessment to Scaled Impact.', 'من التقييم إلى أثرٍ واسع النطاق.')
ENG_P = ('DAR ME follows a proven phased approach to ensure smooth implementation, measurable impact, and long-term success.',
         'تتّبع DAR ME منهجية مرحلية مُثبتة تضمن تنفيذاً سلساً وأثراً قابلاً للقياس ونجاحاً طويل الأمد.')

REGIONS = [
    ('Saudi Arabia', 'السعودية', 26.28, 50.21, True),
    ('Kuwait', 'الكويت', 29.37, 47.98, False),
    ('Bahrain', 'البحرين', 26.07, 50.56, False),
    ('UAE', 'الإمارات', 25.20, 55.27, False),
    ('Jordan', 'الأردن', 31.95, 35.93, False),
]

# ---------------------------------------------------------------- clients
SECTORS = {
    'fin': ('Banking & Finance', 'البنوك والمال'),
    'energy': ('Energy & Industry', 'الطاقة والصناعة'),
    'tel': ('Telecom', 'الاتصالات'),
    'gov': ('Government & Mobility', 'الحكومة والتنقّل'),
    'health': ('Healthcare', 'الرعاية الصحية'),
    'ent': ('Enterprise & Services', 'المؤسسات والخدمات'),
}
CLIENTS = [
    ('client-02', ('Aramco', 'أرامكو'), 'energy'),
    ('client-07', ('Riyad Bank', 'بنك الرياض'), 'fin'),
    ('client-05', ('Ooredoo', 'Ooredoo'), 'tel'),
    ('client-12', ('RTA', 'هيئة الطرق والمواصلات'), 'gov'),
    ('client-08', ('NBK', 'بنك الكويت الوطني'), 'fin'),
    ('client-03', ('Tatweer Petroleum', 'تطوير للبترول'), 'energy'),
    ('client-15', ('Batelco', 'بتلكو'), 'tel'),
    ('client-13', ('Al-Dawaa', 'الدواء'), 'health'),
    ('client-10', ('KFH', 'بيت التمويل الكويتي'), 'fin'),
    ('client-04', ('International Maritime Industries', 'العالمية للصناعات البحرية'), 'energy'),
    ('client-01', ('Kuwait Clearing Company', 'الشركة الكويتية للمقاصة'), 'fin'),
    ('client-06', ('Jordan Commercial Bank', 'البنك التجاري الأردني'), 'fin'),
    ('client-09', ('Bayan', 'بيان'), 'ent'),
    ('client-11', ('Investbank', 'البنك الاستثماري'), 'fin'),
    ('client-14', ('Maestro', 'مايسترو'), 'ent'),
    ('client-16', ('Makeen', 'مكين'), 'ent'),
]
CLIENTS_LABEL = ('Clients', 'عملاؤنا')
CLIENTS_TITLE = ('Trusted Across the Region’s Critical Sectors.', 'موثوقون في أهم القطاعات الحيوية بالمنطقة.')

# ---------------------------------------------------------------- partners
PARTNERS = {
    'automate': [('blueprism', 'SS&C Blue Prism'), ('abbyy', 'ABBYY'), ('nintex', 'Nintex'), ('ctwo', 'CTWO'), ('docai', 'DocAI by DAR ME')],
    'transform': [('ifs', 'IFS'), ('boomi', 'Boomi'), ('elevatus', 'Elevatus'), ('hexagon', 'Hexagon'), ('oracle', 'Oracle'), ('weldeye', 'WeldEye'), ('mri', 'MRI Software'), ('isms', 'ISMS.online')],
    'comply': [('ideagen', 'Ideagen')],
    'upskill': [('sap', 'SAP Training'), ('sans', 'SANS'), ('pecb', 'PECB'), ('oracle-1', 'Oracle'), ('microsoft', 'Microsoft'), ('cisco', 'Cisco'), ('comptia', 'CompTIA'), ('pearson', 'Pearson VUE'), ('ec-council', 'EC-Council')],
}

# ---------------------------------------------------------------- automate
AUTOMATE = {
    'label': ('Intelligent Automation', 'الأتمتة الذكية'),
    't1': ('Agentic AI Automation,', 'أتمتة بالذكاء الاصطناعي الوكيلي،'),
    't2': ('Built to Scale.', 'مصمَّمة للتوسّع.'),
    'p': ('Orchestrate AI agents, people, and systems seamlessly at enterprise scale.',
          'نسّق بين وكلاء الذكاء الاصطناعي والأفراد والأنظمة بسلاسة وعلى نطاق مؤسسي.'),
    'stats': [('1000', '+', ('Automated Processes', 'عملية مؤتمتة')), ('8000000', '+', ('Completed Transactions', 'معاملة منجزة')),
              ('99', '%', ('SLA Adherence', 'التزام باتفاقيات مستوى الخدمة')), ('20', '+', ('Years of Experience', 'عاماً من الخبرة'))],
    'caps_t': ('What Automate Delivers.', 'ما تقدّمه الأتمتة.'),
    'caps': [
        ('bot', ('Digital Workforce Automation', 'أتمتة القوى العاملة الرقمية'), ('Automate repetitive tasks using enterprise-grade digital workers operating across systems and applications.', 'أتمتة المهام المتكررة بعمالة رقمية بمستوى مؤسسي تعمل عبر الأنظمة والتطبيقات.')),
        ('agent', ('AI Agents', 'وكلاء الذكاء الاصطناعي'), ('Deploy intelligent AI agents that analyze, decide, and act within defined business processes.', 'تشغيل وكلاء ذكاء اصطناعي يحلّلون ويقرّرون وينفّذون ضمن عمليات أعمال محدّدة.')),
        ('doc', ('Intelligent Document Automation', 'الأتمتة الذكية للمستندات'), ('Transform document-heavy operations with AI-driven extraction, validation, and processing.', 'تحويل العمليات كثيفة المستندات عبر الاستخراج والتحقق والمعالجة بالذكاء الاصطناعي.')),
        ('flow', ('Process Orchestration', 'تنسيق العمليات'), ('Coordinate workflows across people, systems, AI, and digital workers for seamless execution.', 'تنسيق سير العمل بين الأفراد والأنظمة والذكاء الاصطناعي والعمالة الرقمية لتنفيذ سلس.')),
        ('chat', ('AI Assistants', 'المساعدات الذكية'), ('Enable employees and customers with multilingual AI-powered assistants across digital channels.', 'تمكين الموظفين والعملاء بمساعدات ذكية متعددة اللغات عبر القنوات الرقمية.')),
        ('gov', ('Automation Strategy & CoE', 'استراتيجية الأتمتة ومركز التميّز'), ('Build governance, standards, and scalable operating models for enterprise automation success.', 'بناء الحوكمة والمعايير ونماذج التشغيل القابلة للتوسّع لنجاح الأتمتة المؤسسية.')),
    ],
    'appr_l': ('Our Approach', 'نهجنا'),
    'appr_t': ('Operational Efficiency Through Automation.', 'كفاءة تشغيلية عبر الأتمتة.'),
    'appr_p': ('Scalable, secure, and Arabic-enabled AI and automation solutions that streamline operations and reduce human dependency, powered by a team of seasoned engineers, automation architects, and industry experts. With a proven go-to-market strategy across healthcare, finance, government, and more, our solutions are tailored for real-world challenges and delivered regionally across Saudi Arabia, Kuwait, Bahrain, UAE, and Jordan.',
               'حلول ذكاء اصطناعي وأتمتة آمنة وقابلة للتوسّع وتدعم اللغة العربية، تبسّط العمليات وتقلّل الاعتماد على الجهد البشري، يقودها فريق من المهندسين المتمرّسين ومعماريي الأتمتة وخبراء القطاعات. وبفضل استراتيجية مُثبتة في قطاعات الرعاية الصحية والمال والحكومة وغيرها، نصمّم حلولنا لتحديات واقعية ونقدّمها إقليمياً في السعودية والكويت والبحرين والإمارات والأردن.'),
    'sectors': [('Healthcare', 'الرعاية الصحية'), ('Finance', 'المال'), ('Government', 'الحكومة'), ('And more', 'وغيرها')],
    'bp_l': ('Award-Winning Automation Expertise', 'خبرة أتمتة حائزة على جوائز'),
    'bp_t': ('Trusted Elite Gold Partner of SS&C Blue Prism', 'شريك ذهبي متميّز موثوق لدى SS&C Blue Prism'),
    'bp_p': ('As an Elite Gold Certified SS&C Blue Prism partner, DAR ME is recognized across EMEA for delivering award-winning implementation services and automation best practices.',
             'بصفتها شريكاً ذهبياً متميّزاً معتمداً من SS&C Blue Prism، تحظى DAR ME بتقدير واسع في أوروبا والشرق الأوسط وأفريقيا لتقديمها خدمات تنفيذ حائزة على جوائز وأفضل ممارسات الأتمتة.'),
    'next': ('Put Automation to Work.', 'ضع الأتمتة في خدمة أعمالك.'),
}

TRANSFORM = {
    'label': ('Digital Transformation', 'التحوّل الرقمي'),
    't1': ('Modernize, Integrate,', 'حدِّث، كامِل،'),
    't2': ('and Scale.', 'وتوسَّع.'),
    'p': ('Modernize, integrate, and scale your digital infrastructure to streamline operations, eliminate inefficiencies, and enable long-term business growth.',
          'حدِّث بنيتك الرقمية وكامِلها ووسِّعها لتبسيط العمليات والقضاء على الهدر وتمكين نموٍّ مستدام للأعمال.'),
    'stats': [('30', '+', ('Transformation Projects', 'مشروع تحوّل')), ('20', '+', ('Legacy Systems', 'نظاماً قديماً تم تحديثه')), ('10', '+', ('Multi-Industry', 'قطاعات متعددة'))],
    'caps_t': ('What Transform Delivers.', 'ما يقدّمه التحوّل.'),
    'caps': [
        ('arch', ('Enterprise Architecture Consulting', 'استشارات البنية المؤسسية'), ('Align systems, data, and operations into one coherent technology architecture.', 'مواءمة الأنظمة والبيانات والعمليات ضمن بنية تقنية واحدة متّسقة.')),
        ('modern', ('Application Modernization', 'تحديث التطبيقات'), ('Replace legacy limitations with scalable, maintainable, future-ready applications.', 'استبدال قيود الأنظمة القديمة بتطبيقات قابلة للتوسّع وسهلة الصيانة وجاهزة للمستقبل.')),
        ('api', ('API & System Integration', 'تكامل الأنظمة والواجهات البرمجية'), ('Connect platforms, data flows, and services into a unified operating core.', 'ربط المنصّات وتدفقات البيانات والخدمات في نواة تشغيلية موحّدة.')),
        ('workflow', ('Digital Workflow Design', 'تصميم سير العمل الرقمي'), ('Redesign manual workflows into controlled, measurable digital processes.', 'إعادة تصميم سير العمل اليدوي إلى عمليات رقمية منضبطة وقابلة للقياس.')),
        ('roadmap', ('Strategic Technology Roadmaps', 'خرائط الطريق التقنية الاستراتيجية'), ('Plan modernization in phases tied to business priorities and measurable value.', 'تخطيط التحديث على مراحل مرتبطة بأولويات الأعمال وقيمة قابلة للقياس.')),
        ('industry', ('Industrial Solutions driven by AI', 'حلول صناعية مدعومة بالذكاء الاصطناعي'), ('Smart Solutions that enable real-time visibility, actionable insights, and performance optimization across upstream, midstream, and downstream operations.', 'حلول ذكية توفّر رؤية لحظية ورؤى قابلة للتنفيذ وتحسيناً للأداء عبر عمليات المنبع والنقل والمصب.')),
        ('managed', ('Managed Services', 'الخدمات المُدارة'), ('Run, maintain, and continuously optimize your technology stack through a single accountable partner, combining ongoing support, managed operations, and the right people to keep everything performing long after delivery.', 'تشغيل منظومتك التقنية وصيانتها وتحسينها باستمرار عبر شريك واحد مسؤول، يجمع الدعم المستمر والعمليات المُدارة والكفاءات المناسبة لضمان الأداء طويلاً بعد التسليم.')),
    ],
    'appr_l': ('Our Approach', 'نهجنا'),
    'appr_t': ('Enabling Scalable Digital Change.', 'تمكين تغيير رقمي قابل للتوسّع.'),
    'appr_p': ('At DAR ME, we help organizations redefine their digital infrastructure and modernize legacy systems. Backed by 30+ transformation projects, our Transform division empowers enterprises to streamline operations, unlock efficiencies, embrace next-generation infrastructure, and gain real-time visibility into operational performance through connected systems and integrated data environments.',
               'في DAR ME نساعد المؤسسات على إعادة تعريف بنيتها الرقمية وتحديث أنظمتها القديمة. وبرصيد يتجاوز 30 مشروع تحوّل، يمكّن قطاع التحوّل لدينا المؤسسات من تبسيط عملياتها ورفع كفاءتها وتبنّي بنية الجيل القادم، والحصول على رؤية لحظية للأداء التشغيلي عبر أنظمة مترابطة وبيئات بيانات متكاملة.'),
    'next': ('Put Transformation to Work.', 'ضع التحوّل في خدمة أعمالك.'),
}

COMPLY = {
    'label': ('DAR ME Comply', 'DAR ME Comply'),
    't1': ('Governance, Risk,', 'الحوكمة والمخاطر،'),
    't2': ('Compliance & Digital Trust.', 'الامتثال والثقة الرقمية.'),
    'p': ('DAR ME helps organizations manage risk, compliance, reporting, healthcare quality, and governance through locally adapted GRC platforms and implementation expertise.',
          'تساعد DAR ME المؤسسات على إدارة المخاطر والامتثال والتقارير وجودة الرعاية الصحية والحوكمة، عبر منصّات حوكمة ومخاطر وامتثال مكيّفة محلياً وخبرة تنفيذية متخصصة.'),
    'caps_t': ('What Comply Delivers.', 'ما يقدّمه الامتثال.'),
    'caps': [
        ('policy', ('Policy & Compliance Management', 'إدارة السياسات والامتثال'), ('Centralize policies, obligations, controls, and compliance activities.', 'توحيد السياسات والالتزامات والضوابط وأنشطة الامتثال في مكان واحد.')),
        ('risk', ('Risk Assessment & Reporting', 'تقييم المخاطر وإعداد تقاريرها'), ('Identify, assess, monitor, and report risks with clearer ownership.', 'تحديد المخاطر وتقييمها ومراقبتها والإبلاغ عنها بملكية أوضح.')),
        ('dash', ('Governance Dashboards', 'لوحات الحوكمة'), ('Give leadership visibility into risk, compliance, audit, and performance indicators.', 'منح القيادة رؤية واضحة لمؤشرات المخاطر والامتثال والتدقيق والأداء.')),
        ('audit', ('Audit & Performance Data Integration', 'تكامل بيانات التدقيق والأداء'), ('Connect evidence, performance data, reports, and operational inputs into one view.', 'ربط الأدلة وبيانات الأداء والتقارير والمدخلات التشغيلية في عرض واحد.')),
        ('health', ('Healthcare Quality & Safety Reporting', 'تقارير جودة وسلامة الرعاية الصحية'), ('Support quality, safety, incident, and performance reporting for healthcare environments.', 'دعم تقارير الجودة والسلامة والحوادث والأداء في بيئات الرعاية الصحية.')),
        ('eye', ('Compliance Visibility & Control', 'وضوح الامتثال والتحكّم به'), ('Move from scattered reporting to structured, traceable, and accountable compliance operations.', 'الانتقال من تقارير متناثرة إلى عمليات امتثال منظّمة وقابلة للتتبّع والمساءلة.')),
    ],
    'gov_l': ('Governance Overview', 'نظرة عامة على الحوكمة'),
    'gov_t': ('Five Connected Domains of Governance Control.', 'خمسة مجالات مترابطة للتحكّم بالحوكمة.'),
    'gov_p': ('DAR ME Comply brings healthcare, quality, EHS, assurance, and compliance operations into a clearer digital governance model, helping teams see what needs attention, who owns it, and how evidence, actions, and reporting connect.',
              'يجمع DAR ME Comply عمليات الرعاية الصحية والجودة والصحة والسلامة والبيئة والضمان والامتثال في نموذج حوكمة رقمي أوضح، يساعد الفرق على معرفة ما يحتاج إلى اهتمام، ومن يملكه، وكيف تترابط الأدلة والإجراءات والتقارير.'),
    'sol_l': ('Solution Areas', 'مجالات الحلول'),
    'sol_t': ('Designed for the Teams Behind Governance, Quality, Compliance, and Safety.', 'مصمَّمة للفرق التي تقف خلف الحوكمة والجودة والامتثال والسلامة.'),
    'sol_p': ('Different teams manage different risks, evidence, quality records, safety processes, audit activities, policies, documents, and reporting needs. DAR ME Comply helps organizations bring these operating areas into a clearer governance model with stronger visibility, ownership, traceability, and accountability.',
              'تدير الفرق المختلفة مخاطر وأدلة وسجلات جودة وعمليات سلامة وأنشطة تدقيق وسياسات ومستندات واحتياجات تقارير متباينة. ويساعد DAR ME Comply المؤسسات على جمع هذه المجالات التشغيلية في نموذج حوكمة أوضح، برؤية أقوى وملكية وقابلية تتبّع ومساءلة أعلى.'),
    'domains': [
        ('health', ('Healthcare', 'الرعاية الصحية'), ('Support healthcare quality, safety, incident, audit, document review, and assurance workflows with clearer reporting, traceability, and follow-up.', 'دعم سير عمل جودة الرعاية الصحية والسلامة والحوادث والتدقيق ومراجعة المستندات والضمان، بتقارير أوضح وقابلية تتبّع ومتابعة.'),
         ['Healthcare Guardian', ('Document Review & Co-Authoring', 'مراجعة المستندات والتأليف المشترك'), 'Please Review']),
        ('target', ('Quality', 'الجودة'), ('Standardize quality operations, inspections, supplier-related processes, food safety activities, and quality improvement actions with clearer workflows and evidence.', 'توحيد عمليات الجودة والتفتيش والعمليات المرتبطة بالموردين وأنشطة سلامة الغذاء وإجراءات تحسين الجودة، بسير عمل وأدلة أوضح.'),
         [('Quality Management', 'إدارة الجودة'), ('Quality Control', 'ضبط الجودة'), ('Food & Beverage', 'الأغذية والمشروبات'), ('Food Safety', 'سلامة الغذاء'), ('Supply Chain Management', 'إدارة سلاسل الإمداد')]),
        ('shield', ('EHS', 'الصحة والسلامة والبيئة'), ('Support safer operations through environmental, health, safety, incident, training, workplace risk, aviation safety, and corrective action processes.', 'دعم عمليات أكثر أماناً عبر إجراءات البيئة والصحة والسلامة والحوادث والتدريب ومخاطر بيئة العمل وسلامة الطيران والإجراءات التصحيحية.'),
         ['Ideagen EHS', 'Ideagen Wearable Safety', ('Aviation Safety', 'سلامة الطيران'), ('Workplace Training', 'التدريب في بيئة العمل'), ('Incident Management', 'إدارة الحوادث')]),
        ('audit', ('Assurance', 'الضمان'), ('Strengthen enterprise risk, internal audit, audit quality, assurance workflows, stakeholder reporting, evidence tracking, and board-level visibility.', 'تعزيز إدارة المخاطر المؤسسية والتدقيق الداخلي وجودة التدقيق وسير عمل الضمان وتقارير أصحاب المصلحة وتتبّع الأدلة والرؤية على مستوى مجلس الإدارة.'),
         [('Enterprise Risk Management', 'إدارة المخاطر المؤسسية'), ('Internal Audit', 'التدقيق الداخلي'), ('Internal Audit & Enterprise Risk Management', 'التدقيق الداخلي وإدارة المخاطر المؤسسية'), ('Audit Quality Management', 'إدارة جودة التدقيق'), 'SoQM']),
        ('policy', ('Compliance', 'الامتثال'), ('Manage regulatory intelligence, software validation, contracts, policies, compliant documentation, and controlled information workflows through more proactive and traceable processes.', 'إدارة الاستخبارات التنظيمية والتحقق من البرمجيات والعقود والسياسات والتوثيق المتوافق وسير المعلومات المضبوط، عبر عمليات أكثر استباقية وقابلية للتتبّع.'),
         [('Regulatory Intelligence', 'الاستخبارات التنظيمية'), ('Software Validation Services', 'خدمات التحقق من البرمجيات'), 'CompliancePath', ('Contract Management', 'إدارة العقود'), ('Policy Management', 'إدارة السياسات'), 'Mail Manager Enterprise']),
    ],
    'layer_l': ('Connected Operating Layer', 'طبقة تشغيل مترابطة'),
    'layer_t': ('One Layer for Productivity, Notifications, Workflows, and Collaboration.', 'طبقة واحدة للإنتاجية والتنبيهات وسير العمل والتعاون.'),
    'layer_p': ('Across Quality, Assurance, Compliance, and EHS, organizations need more than separate tools. They need shared workflows, timely notifications, collaborative ownership, and clearer productivity across governance activity.',
                'في الجودة والضمان والامتثال والصحة والسلامة والبيئة، تحتاج المؤسسات إلى ما هو أكثر من أدوات منفصلة: سير عمل مشترك، وتنبيهات في وقتها، وملكية تعاونية، وإنتاجية أوضح عبر أنشطة الحوكمة.'),
    'layer': [
        ('bolt', ('Productivity', 'الإنتاجية'), ('Reduce manual coordination, duplicated work, scattered reporting, and time spent chasing updates across departments.', 'تقليل التنسيق اليدوي والعمل المكرر والتقارير المتناثرة والوقت المهدور في ملاحقة التحديثات بين الإدارات.')),
        ('bell', ('Notifications', 'التنبيهات'), ('Keep teams aware of deadlines, approvals, incidents, overdue actions, evidence requests, and required updates.', 'إبقاء الفرق على اطّلاع بالمواعيد النهائية والموافقات والحوادث والإجراءات المتأخرة وطلبات الأدلة والتحديثات المطلوبة.')),
        ('workflow', ('Workflows', 'سير العمل'), ('Standardize reviews, approvals, escalations, corrective actions, audit preparation, reporting cycles, and follow-up activities.', 'توحيد المراجعات والموافقات والتصعيد والإجراءات التصحيحية والتحضير للتدقيق ودورات التقارير وأنشطة المتابعة.')),
        ('users', ('Collaboration', 'التعاون'), ('Connect leadership, risk, compliance, audit, quality, safety, and operational teams around shared evidence, actions, and reporting.', 'ربط فرق القيادة والمخاطر والامتثال والتدقيق والجودة والسلامة والعمليات حول أدلة وإجراءات وتقارير مشتركة.')),
    ],
    'ch_l': ('The Challenge', 'التحدّي'),
    'ch_t': ('Why Compliance Programs Struggle', 'لماذا تتعثّر برامج الامتثال'),
    'challenges': [
        ('folder', ('Scattered Evidence', 'أدلة متناثرة'), ('Compliance evidence sits across emails, spreadsheets, folders, systems, and departments.', 'تتوزّع أدلة الامتثال بين رسائل البريد وجداول البيانات والمجلدات والأنظمة والإدارات.')),
        ('report', ('Manual Reporting', 'تقارير يدوية'), ('Teams spend too much time collecting, formatting, and reconciling compliance data.', 'تقضي الفرق وقتاً طويلاً في جمع بيانات الامتثال وتنسيقها ومطابقتها.')),
        ('eye', ('Limited Risk Visibility', 'رؤية محدودة للمخاطر'), ('Leadership cannot easily see active risks, overdue actions, control gaps, or trend movement.', 'لا تستطيع القيادة بسهولة رؤية المخاطر القائمة أو الإجراءات المتأخرة أو فجوات الضوابط أو اتجاهات التغيّر.')),
        ('user-q', ('Unclear Ownership', 'ملكية غير واضحة'), ('Policies, risks, issues, and corrective actions lose momentum when accountability is unclear.', 'تفقد السياسات والمخاطر والقضايا والإجراءات التصحيحية زخمها عندما تغيب المساءلة الواضحة.')),
        ('clock', ('Audit Pressure', 'ضغط التدقيق'), ('Audit preparation becomes stressful when evidence, controls, and performance data are not organized.', 'يصبح التحضير للتدقيق مرهقاً حين لا تكون الأدلة والضوابط وبيانات الأداء منظّمة.')),
        ('unlink', ('Disconnected Quality & Safety Data', 'بيانات جودة وسلامة غير مترابطة'), ('Healthcare and regulated operations need clearer reporting around incidents, performance, quality, and safety.', 'تحتاج عمليات الرعاية الصحية والقطاعات المنظّمة إلى تقارير أوضح حول الحوادث والأداء والجودة والسلامة.')),
    ],
    'core_l': ('Core Capabilities', 'القدرات الأساسية'),
    'core_t': ('Core Comply Capabilities', 'القدرات الأساسية لـ Comply'),
    'core_p': ('DAR ME Comply helps organizations strengthen governance, risk visibility, compliance tracking, audit readiness, and performance reporting through structured digital operations.',
               'يساعد DAR ME Comply المؤسسات على تعزيز الحوكمة ووضوح المخاطر وتتبّع الامتثال والجاهزية للتدقيق وتقارير الأداء، من خلال عمليات رقمية منظّمة.'),
    'value_l': ('Value', 'القيمة'),
    'use_l': ('Use Cases', 'حالات الاستخدام'),
    'core': [
        (('Policy & Compliance Management', 'إدارة السياسات والامتثال'),
         ('Policy and compliance management helps organizations centralize policies, obligations, controls, evidence, and compliance activities so teams can track what needs to be done, who owns it, and what status it is in.', 'تساعد إدارة السياسات والامتثال المؤسسات على توحيد السياسات والالتزامات والضوابط والأدلة وأنشطة الامتثال، لتعرف الفرق ما المطلوب إنجازه ومن المسؤول عنه وما حالته.'),
         [('Improves policy visibility', 'تحسين وضوح السياسات'), ('Clarifies compliance ownership', 'توضيح ملكية الامتثال'), ('Reduces scattered documentation', 'تقليل تشتّت التوثيق'), ('Supports audit readiness', 'دعم الجاهزية للتدقيق'), ('Helps teams track obligations and actions', 'مساعدة الفرق على تتبّع الالتزامات والإجراءات')],
         [('Policy tracking', 'تتبّع السياسات'), ('Compliance obligation management', 'إدارة التزامات الامتثال'), ('Control ownership', 'ملكية الضوابط'), ('Evidence organization', 'تنظيم الأدلة'), ('Corrective action follow-up', 'متابعة الإجراءات التصحيحية'), ('Compliance status reporting', 'تقارير حالة الامتثال')]),
        (('Risk Assessment & Reporting', 'تقييم المخاطر وإعداد تقاريرها'),
         ('Risk assessment and reporting helps organizations identify, evaluate, monitor, and communicate risks with clearer ownership, impact visibility, and follow-up actions.', 'يساعد تقييم المخاطر وإعداد تقاريرها المؤسسات على تحديد المخاطر وتقييمها ومراقبتها والإبلاغ عنها، بملكية أوضح ورؤية للأثر وإجراءات متابعة.'),
         [('Improves risk visibility', 'تحسين وضوح المخاطر'), ('Clarifies accountability', 'توضيح المساءلة'), ('Supports leadership decision-making', 'دعم قرارات القيادة'), ('Tracks mitigation actions', 'تتبّع إجراءات المعالجة'), ('Helps teams monitor risk movement over time', 'مساعدة الفرق على مراقبة تغيّر المخاطر بمرور الوقت')],
         [('Risk registers', 'سجلات المخاطر'), ('Risk assessments', 'تقييمات المخاطر'), ('Mitigation action tracking', 'تتبّع إجراءات المعالجة'), ('Risk reporting', 'تقارير المخاطر'), ('Control gap visibility', 'وضوح فجوات الضوابط'), ('Management reporting', 'تقارير الإدارة')]),
        (('Governance Dashboards', 'لوحات الحوكمة'),
         ('Governance dashboards give leadership and teams a clearer view of compliance status, risk trends, audit actions, performance indicators, and overdue items.', 'تمنح لوحات الحوكمة القيادة والفرق رؤية أوضح لحالة الامتثال واتجاهات المخاطر وإجراءات التدقيق ومؤشرات الأداء والبنود المتأخرة.'),
         [('Improves executive visibility', 'تحسين الرؤية التنفيذية'), ('Reduces manual status reporting', 'تقليل تقارير الحالة اليدوية'), ('Highlights overdue actions', 'إبراز الإجراءات المتأخرة'), ('Supports faster decisions', 'دعم قرارات أسرع'), ('Connects governance activity with operational performance', 'ربط أنشطة الحوكمة بالأداء التشغيلي')],
         [('Executive dashboards', 'لوحات تنفيذية'), ('Risk and compliance indicators', 'مؤشرات المخاطر والامتثال'), ('Audit action tracking', 'تتبّع إجراءات التدقيق'), ('Performance reporting', 'تقارير الأداء'), ('Overdue action visibility', 'وضوح الإجراءات المتأخرة'), ('Governance committee reporting', 'تقارير لجان الحوكمة')]),
        (('Audit & Performance Data Integration', 'تكامل بيانات التدقيق والأداء'),
         ('Audit and performance data integration connects evidence, operational inputs, reports, actions, and performance indicators so teams can reduce manual reporting and improve audit readiness.', 'يربط تكامل بيانات التدقيق والأداء الأدلة والمدخلات التشغيلية والتقارير والإجراءات ومؤشرات الأداء، لتقلّل الفرق التقارير اليدوية وترفع جاهزيتها للتدقيق.'),
         [('Reduces manual data collection', 'تقليل جمع البيانات يدوياً'), ('Improves reporting consistency', 'تحسين اتّساق التقارير'), ('Strengthens traceability', 'تعزيز قابلية التتبّع'), ('Supports audit preparation', 'دعم التحضير للتدقيق'), ('Connects performance with compliance visibility', 'ربط الأداء بوضوح الامتثال')],
         [('Evidence collection', 'جمع الأدلة'), ('Audit preparation', 'التحضير للتدقيق'), ('Performance data consolidation', 'توحيد بيانات الأداء'), ('Finding and action tracking', 'تتبّع الملاحظات والإجراءات'), ('Report generation', 'إعداد التقارير'), ('Compliance evidence mapping', 'ربط أدلة الامتثال')]),
        (('Healthcare Quality & Safety Reporting', 'تقارير جودة وسلامة الرعاية الصحية'),
         ('Healthcare quality and safety reporting supports structured visibility into incidents, quality indicators, safety actions, performance trends, and follow-up activities.', 'تدعم تقارير جودة وسلامة الرعاية الصحية رؤية منظّمة للحوادث ومؤشرات الجودة وإجراءات السلامة واتجاهات الأداء وأنشطة المتابعة.'),
         [('Improves quality and safety visibility', 'تحسين وضوح الجودة والسلامة'), ('Supports structured incident reporting', 'دعم الإبلاغ المنظّم عن الحوادث'), ('Tracks corrective actions', 'تتبّع الإجراءات التصحيحية'), ('Helps teams monitor performance indicators', 'مساعدة الفرق على مراقبة مؤشرات الأداء'), ('Strengthens accountability in healthcare environments', 'تعزيز المساءلة في بيئات الرعاية الصحية')],
         [('Incident reporting', 'الإبلاغ عن الحوادث'), ('Quality indicators', 'مؤشرات الجودة'), ('Safety action tracking', 'تتبّع إجراءات السلامة'), ('Performance reporting', 'تقارير الأداء'), ('Corrective action follow-up', 'متابعة الإجراءات التصحيحية'), ('Healthcare governance dashboards', 'لوحات حوكمة الرعاية الصحية')]),
        (('Compliance Operating Visibility', 'الرؤية التشغيلية للامتثال'),
         ('Compliance operating visibility helps organizations understand what is happening across risk, compliance, audit, quality, and governance activities through structured reporting and clear ownership.', 'تساعد الرؤية التشغيلية للامتثال المؤسسات على فهم ما يجري عبر أنشطة المخاطر والامتثال والتدقيق والجودة والحوكمة، من خلال تقارير منظّمة وملكية واضحة.'),
         [('Reduces blind spots', 'تقليل النقاط العمياء'), ('Improves accountability', 'تحسين المساءلة'), ('Helps leadership identify gaps', 'مساعدة القيادة على تحديد الفجوات'), ('Connects compliance activity to operational control', 'ربط أنشطة الامتثال بالتحكّم التشغيلي')],
         [('Status tracking', 'تتبّع الحالة'), ('Action ownership', 'ملكية الإجراءات'), ('Escalation visibility', 'وضوح التصعيد'), ('Compliance reporting', 'تقارير الامتثال'), ('Governance meetings', 'اجتماعات الحوكمة'), ('Continuous improvement reviews', 'مراجعات التحسين المستمر')]),
    ],
    'om_l': ('Operating Model', 'نموذج التشغيل'),
    'om_t': ('Centralize → Monitor → Report → Improve', 'وحِّد ← راقِب ← أبلِغ ← حسِّن'),
    'om_p': ('Comply is not about adding another disconnected tool. It is about creating a clearer operating rhythm for compliance, risk, audit, quality, and governance activities.',
             'لا يعني Comply إضافة أداة منفصلة أخرى، بل بناء إيقاع تشغيلي أوضح لأنشطة الامتثال والمخاطر والتدقيق والجودة والحوكمة.'),
    'om': [
        (('Centralize', 'وحِّد'), ('Bring policies, risks, controls, evidence, performance data, and reporting inputs into a structured view.', 'اجمع السياسات والمخاطر والضوابط والأدلة وبيانات الأداء ومدخلات التقارير في عرض منظّم.')),
        (('Monitor', 'راقِب'), ('Track risks, issues, actions, obligations, incidents, quality indicators, and compliance status.', 'تتبّع المخاطر والقضايا والإجراءات والالتزامات والحوادث ومؤشرات الجودة وحالة الامتثال.')),
        (('Report', 'أبلِغ'), ('Give leadership and teams dashboards, reports, and audit-ready visibility.', 'امنح القيادة والفرق لوحات وتقارير ورؤية جاهزة للتدقيق.')),
        (('Improve', 'حسِّن'), ('Use findings, trends, gaps, and corrective actions to strengthen governance over time.', 'استثمر الملاحظات والاتجاهات والفجوات والإجراءات التصحيحية لتعزيز الحوكمة بمرور الوقت.')),
    ],
    'aud_l': ('Audiences', 'الفئات المستفيدة'),
    'aud_t': ('Where Comply Creates Value', 'أين يصنع Comply القيمة'),
    'aud': [
        ('target', ('Executive Leadership', 'القيادة التنفيذية'), ('Risk visibility, governance dashboards, performance trends, and decision support.', 'وضوح المخاطر ولوحات الحوكمة واتجاهات الأداء ودعم القرار.')),
        ('policy', ('Compliance Teams', 'فرق الامتثال'), ('Policy tracking, obligation management, evidence readiness, and compliance reporting.', 'تتبّع السياسات وإدارة الالتزامات وجاهزية الأدلة وتقارير الامتثال.')),
        ('risk', ('Risk Teams', 'فرق المخاطر'), ('Risk registers, assessments, controls, mitigation actions, and risk reporting.', 'سجلات المخاطر والتقييمات والضوابط وإجراءات المعالجة وتقارير المخاطر.')),
        ('audit', ('Audit Teams', 'فرق التدقيق'), ('Evidence collection, audit trails, finding follow-up, and corrective action tracking.', 'جمع الأدلة ومسارات التدقيق ومتابعة الملاحظات وتتبّع الإجراءات التصحيحية.')),
        ('health', ('Healthcare Quality & Safety Teams', 'فرق جودة وسلامة الرعاية الصحية'), ('Incident reporting, quality indicators, safety actions, and performance reporting.', 'الإبلاغ عن الحوادث ومؤشرات الجودة وإجراءات السلامة وتقارير الأداء.')),
        ('users', ('Operations Teams', 'فرق العمليات'), ('Action ownership, issue escalation, compliance tasks, and performance visibility.', 'ملكية الإجراءات وتصعيد القضايا ومهام الامتثال ووضوح الأداء.')),
    ],
    'next': ('Put Compliance to Work.', 'ضع الامتثال في خدمة أعمالك.'),
}

UPSKILL = {
    'label': ('Training & Development', 'التدريب والتطوير'),
    't1': ('Future-Ready Talent.', 'كفاءات جاهزة للمستقبل.'),
    't2': ('Built Around You.', 'مصمَّمة حولك.'),
    'p': ('Tailored programs that empower individuals with the skills they need to excel, paired with strategic guidance that helps organizations navigate complex challenges and reach their goals.',
          'برامج مصمّمة خصيصاً تمكّن الأفراد من المهارات التي يحتاجونها للتميّز، مقرونة بتوجيه استراتيجي يساعد المؤسسات على تجاوز التحديات المعقّدة وبلوغ أهدافها.'),
    'stats': [('12000', '+', ('Training Courses Completed', 'دورة تدريبية منجزة')), ('30000', '+', ('Individuals Trained or Certified', 'فرد تم تدريبه أو اعتماده')), ('100', '+', ('Professional Trainers Engaged', 'مدرّب محترف'))],
    'caps_t': ('What Upskill Delivers.', 'ما يقدّمه التأهيل.'),
    'caps': [
        ('digital', ('Digital Technology Training', 'التدريب على التقنيات الرقمية'), ('Foundation skills in modern systems, cloud, and digital operations for digital-ready teams.', 'مهارات أساسية في الأنظمة الحديثة والحوسبة السحابية والعمليات الرقمية لفرق جاهزة رقمياً.')),
        ('it', ('Information Technology Training', 'التدريب على تقنية المعلومات'), ('IT infrastructure, systems management, and operational excellence for enterprise environments.', 'البنية التحتية لتقنية المعلومات وإدارة الأنظمة والتميّز التشغيلي في البيئات المؤسسية.')),
        ('shield', ('Cybersecurity Training', 'التدريب على الأمن السيبراني'), ('Specialized security training for regulated industries and high-security operations.', 'تدريب أمني متخصص للقطاعات المنظّمة والعمليات عالية الحساسية.')),
        ('sap', ('SAP Training', 'التدريب على SAP'), ('Enterprise resource planning expertise for finance, supply chain, procurement, and operations teams.', 'خبرة تخطيط موارد المؤسسات لفرق المالية وسلاسل الإمداد والمشتريات والعمليات.')),
        ('custom', ('Customized Training', 'التدريب المخصّص'), ('Role-based programs tailored to your organization’s unique challenges and strategic goals.', 'برامج مبنية على الأدوار ومصمّمة وفق تحديات مؤسستك الفريدة وأهدافها الاستراتيجية.')),
    ],
    'why_l': ('Why DAR ME', 'لماذا DAR ME'),
    'why_t': ('A Trusted Force in Professional Development.', 'قوة موثوقة في التطوير المهني.'),
    'why_p': ('Since 2006, DAR ME has supported organizations in improving performance, building capability, and driving sustainable growth. With a strong commitment to excellence and innovation, we continue to be a trusted force in professional development and organizational success, and a proud partner in advancing Vision 2030’s national goals for human capital development.',
              'منذ عام 2006، تدعم DAR ME المؤسسات في تحسين الأداء وبناء القدرات وتحقيق نموٍّ مستدام. وبالتزام راسخ بالتميّز والابتكار، نواصل دورنا قوةً موثوقة في التطوير المهني ونجاح المؤسسات، وشريكاً فخوراً في تحقيق مستهدفات رؤية 2030 الوطنية لتنمية القدرات البشرية.'),
    'isc_l': ('ISC2 Official Training Partner', 'شريك تدريب رسمي لـ ISC2'),
    'isc_t': ('Globally Recognized Cybersecurity Certifications.', 'شهادات أمن سيبراني معترف بها عالمياً.'),
    'isc_p': ('Authorized to deliver ISC2’s globally recognized cybersecurity certifications including CISSP, CCSP, and SSCP across the GCC.',
              'معتمدون لتقديم شهادات ISC2 المعترف بها عالمياً في الأمن السيبراني، ومنها CISSP وCCSP وSSCP، في دول مجلس التعاون الخليجي.'),
    'isc_b': ('ISC2 Official Page', 'صفحة ISC2 الرسمية'),
    'next': ('Put Your Talent to Work.', 'ضع كفاءاتك في خدمة أعمالك.'),
}

ABOUT = {
    'label': ('Established 2006 · Al Khobar, KSA', 'تأسست عام 2006 · الخبر، السعودية'),
    'p': ('Enterprise technology delivery for regulated and high-impact organizations across Saudi Arabia and the GCC. Two decades of operational intelligence for complex environments.',
          'تنفيذ تقني مؤسسي للجهات الخاضعة للتنظيم وعالية الأثر في المملكة العربية السعودية ودول الخليج. عقدان من الذكاء التشغيلي للبيئات المعقّدة.'),
    'stats': [('20', '', ('Years of Enterprise Tech', 'عاماً في التقنية المؤسسية')), ('100', '+', ('Enterprise Projects', 'مشروع مؤسسي')), ('60', '+', ('Technology Specialists', 'متخصصاً تقنياً')), ('2006', '', ('Founded', 'سنة التأسيس'))],
    'om_l': ('Operating Model', 'نموذج التشغيل'),
    'om_t': ('Operational Intelligence, Delivered End to End.', 'ذكاء تشغيلي يُقدَّم من البداية إلى النهاية.'),
    'om_p': ('At DAR ME, we design and deliver technology as an operational system, not isolated solutions. From strategy and architecture to implementation, enablement, and long-term support, we help organizations build clarity, control, and resilience into their most critical operations.',
             'في DAR ME نصمّم التقنية ونقدّمها منظومةً تشغيلية متكاملة، لا حلولاً معزولة. من الاستراتيجية والبنية إلى التنفيذ والتمكين والدعم طويل الأمد، نساعد المؤسسات على بناء الوضوح والتحكّم والمرونة في أكثر عملياتها أهمية.'),
    'next': ('Put DAR ME to Work.', 'ضع DAR ME في خدمة أعمالك.'),
}

SERVICES = {
    'label': ('Capabilities', 'القدرات'),
    't1': ('Four Capabilities.', 'أربع قدرات.'),
    't2': ('One Integrated Operating Model.', 'نموذج تشغيلي واحد متكامل.'),
    'p': ('DAR ME delivers end-to-end technology services for organizations operating in regulated, high-impact environments.',
          'تقدّم DAR ME خدمات تقنية متكاملة من البداية إلى النهاية للمؤسسات العاملة في بيئات خاضعة للتنظيم وعالية الأثر.'),
    'next': ('Put the Model to Work.', 'ضع النموذج في خدمة أعمالك.'),
}

CONTACT_PAGE = {
    'label': ('Contact DAR ME', 'تواصل مع DAR ME'),
    't1': ('Connect with', 'تواصل مع'),
    't2': ('Our Experts.', 'خبرائنا.'),
    'p': ('Tell us what you need. Our team will help you identify the right path across automation, transformation, compliance, training, and enterprise technology delivery.',
          'أخبرنا بما تحتاجه، وسيساعدك فريقنا على تحديد المسار الصحيح في الأتمتة والتحوّل والامتثال والتدريب والتنفيذ التقني المؤسسي.'),
    'f_name': ('Full Name', 'الاسم الكامل'),
    'f_email': ('Email Address', 'البريد الإلكتروني'),
    'f_phone': ('Phone', 'رقم الجوال'),
    'f_company': ('Company / Organization', 'الشركة / الجهة'),
    'f_service': ('Service Interest', 'الخدمة المطلوبة'),
    'f_select': ('- Select Service Interest -', '- اختر الخدمة -'),
    'f_opts': ['DAR ME Automate', 'DAR ME Transform', 'DAR ME Comply', 'DAR ME Upskill', ('General Inquiry', 'استفسار عام')],
    'f_msg': ('Type your message here', 'اكتب رسالتك هنا'),
    'f_send': ('Send via Email', 'إرسال عبر البريد'),
    'f_wa': ('Send via WhatsApp', 'إرسال عبر واتساب'),
    'hq': ('Head Quarters', 'المقر الرئيسي'),
    'call': ('Call', 'اتصل'),
    'email': ('Email', 'البريد'),
    'nav': ('Navigate', 'الاتجاهات'),
    'maps': ('Open in Google Maps', 'افتح في خرائط Google'),
    'company': ('DAR ME Information Technology Co.', 'DAR ME لتقنية المعلومات'),
}

CLIENTS_PAGE = {
    'label': ('Clients', 'عملاؤنا'),
    't1': ('Trusted Across the Region’s', 'موثوقون في أهم'),
    't2': ('Critical Sectors.', 'القطاعات الحيوية.'),
    'p': ('Enterprise technology delivery for regulated and high-impact organizations across Saudi Arabia and the GCC.',
          'تنفيذ تقني مؤسسي للجهات الخاضعة للتنظيم وعالية الأثر في المملكة العربية السعودية ودول الخليج.'),
    'all': ('All', 'الكل'),
    'regions_l': ('Delivered Regionally', 'حضور إقليمي'),
    'regions_t': ('Saudi Arabia, Kuwait, Bahrain, UAE, and Jordan.', 'السعودية والكويت والبحرين والإمارات والأردن.'),
    'next': ('Put DAR ME to Work.', 'ضع DAR ME في خدمة أعمالك.'),
}
