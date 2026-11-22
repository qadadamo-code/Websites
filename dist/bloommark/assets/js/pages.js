/* Page-level copy for the multi-page build (merged into BM_CONTENT[lang].pg) */
(function () {
const P = {
ar: {
  nav: { home: 'الرئيسية', insights: 'مستجدات' },
  idx: { firm: '01', practice: '02', process: '03', egypt: '04', insights: '05', contact: '06' },
  heads: {
    firm: { t: 'المكتب', s: 'تسعة عشر عامًا من حماية الملكية الفكرية من قلب القاهرة.' },
    practice: { t: 'مجالات العمل', s: 'ستة مجالات متكاملة تغطي كل ما تملكه من أصول فكرية.' },
    process: { t: 'منهجيتنا', s: 'ست مراحل واضحة، من الفكرة حتى الحق المسجّل والمحمي.' },
    egypt: { t: 'الحماية في مصر', s: 'الإطار القانوني ومدد الحماية والمستندات المطلوبة للإيداع.' },
    insights: { t: 'مستجدات', s: 'نتابع التشريعات حول العالم ونشارك أهم ما يمس علامتك.' },
    contact: { t: 'تواصل معنا', s: 'مكتبنا امتداد لمكتبك. أخبرنا بما تريد حمايته.' }
  },
  home: {
    drag: 'حرّك الماوس',
    introK: 'بلوم مارك',
    intro: 'لسنا أول مكتب للملكية الفكرية في مصر، لكننا نعمل كل يوم لنكون الأفضل.',
    indexK: 'ما نحميه', indexT: 'ستة مجالات. التزام واحد.', open: 'اكتشف',
    firmK: 'المكتب', firmT: 'مكتبنا امتداد لمكتبك', firmP: 'منذ 2007 نعمل جنبًا إلى جنب مع الشركات ومكاتب الملكية الفكرية حول العالم، بفريق قانوني يراجع كل ملف كل صباح.', firmCta: 'تعرّف على المكتب',
    procK: 'منهجيتنا', procT: 'من الفكرة إلى الحق المسجّل', procCta: 'اعرف خطواتنا',
    egyptK: 'الحماية في مصر', egyptT: 'المدد والاتفاقيات والمستندات، في مكان واحد', egyptCta: 'استعرض الإطار القانوني',
    newsK: 'مستجدات', newsCta: 'كل المستجدات',
    ctaT: 'هل لديك علامة أو اختراع أو تصميم يستحق الحماية؟', ctaB: 'ابدأ الآن'
  },
  next: 'الصفحة التالية',
  practiceHint: 'مرّر للتنقل بين المجالات'
},
en: {
  nav: { home: 'Home', insights: 'Insights' },
  idx: { firm: '01', practice: '02', process: '03', egypt: '04', insights: '05', contact: '06' },
  heads: {
    firm: { t: 'The Firm', s: 'Nineteen years protecting intellectual property from the heart of Cairo.' },
    practice: { t: 'Practice', s: 'Six integrated areas covering every intellectual asset you own.' },
    process: { t: 'Approach', s: 'Six clear stages, from idea to a registered, protected right.' },
    egypt: { t: 'Egypt IP', s: 'The legal framework, terms of protection and filing requirements.' },
    insights: { t: 'Insights', s: 'We follow legislation worldwide and share what matters to your brand.' },
    contact: { t: 'Contact', s: 'Our office is an extension of yours. Tell us what you need protected.' }
  },
  home: {
    drag: 'Move your cursor',
    introK: 'BloomMark',
    intro: 'We are not the first IP firm in Egypt, but every day we work to be the best one.',
    indexK: 'What we protect', indexT: 'Six practices. One commitment.', open: 'Explore',
    firmK: 'The Firm', firmT: 'Our office is an extension of yours', firmP: 'Since 2007 we have worked side by side with companies and IP firms worldwide, with a legal team that reviews every matter every morning.', firmCta: 'Meet the firm',
    procK: 'Approach', procT: 'From idea to registered right', procCta: 'See our process',
    egyptK: 'Egypt IP', egyptT: 'Terms, treaties and documents, in one place', egyptCta: 'Explore the framework',
    newsK: 'Insights', newsCta: 'All insights',
    ctaT: 'Have a mark, an invention or a design worth protecting?', ctaB: 'Start now'
  },
  next: 'Next page',
  practiceHint: 'Scroll to move between practices'
},
fr: {
  nav: { home: 'Accueil', insights: 'Actualités' },
  idx: { firm: '01', practice: '02', process: '03', egypt: '04', insights: '05', contact: '06' },
  heads: {
    firm: { t: 'Le cabinet', s: 'Dix-neuf ans de protection de la propriété intellectuelle au cœur du Caire.' },
    practice: { t: 'Expertises', s: 'Six domaines intégrés couvrant tous vos actifs immatériels.' },
    process: { t: 'Méthode', s: 'Six étapes claires, de l’idée au droit enregistré et protégé.' },
    egypt: { t: 'PI en Égypte', s: 'Le cadre juridique, les durées de protection et les pièces requises.' },
    insights: { t: 'Actualités', s: 'Nous suivons la législation mondiale et partageons l’essentiel pour votre marque.' },
    contact: { t: 'Contact', s: 'Notre cabinet est le prolongement du vôtre. Dites-nous ce que vous souhaitez protéger.' }
  },
  home: {
    drag: 'Déplacez le curseur',
    introK: 'BloomMark',
    intro: 'Nous ne sommes pas le premier cabinet de PI en Égypte, mais chaque jour nous travaillons à être le meilleur.',
    indexK: 'Ce que nous protégeons', indexT: 'Six expertises. Un engagement.', open: 'Découvrir',
    firmK: 'Le cabinet', firmT: 'Notre cabinet, le prolongement du vôtre', firmP: 'Depuis 2007, nous travaillons aux côtés d’entreprises et de cabinets de PI du monde entier, avec une équipe qui examine chaque dossier chaque matin.', firmCta: 'Découvrir le cabinet',
    procK: 'Méthode', procT: 'De l’idée au droit enregistré', procCta: 'Voir notre méthode',
    egyptK: 'PI en Égypte', egyptT: 'Durées, traités et pièces, au même endroit', egyptCta: 'Explorer le cadre',
    newsK: 'Actualités', newsCta: 'Toutes les actualités',
    ctaT: 'Une marque, une invention ou un design à protéger ?', ctaB: 'Commencer'
  },
  next: 'Page suivante',
  practiceHint: 'Faites défiler pour parcourir les expertises'
},
zh: {
  nav: { home: '首页', insights: '行业动态' },
  idx: { firm: '01', practice: '02', process: '03', egypt: '04', insights: '05', contact: '06' },
  heads: {
    firm: { t: '关于我们', s: '扎根开罗，守护知识产权十九年。' },
    practice: { t: '业务领域', s: '六大综合领域，覆盖您的每一项知识资产。' },
    process: { t: '服务流程', s: '六个清晰阶段，从创意到受保护的注册权利。' },
    egypt: { t: '埃及知识产权', s: '法律框架、保护期限与申请材料。' },
    insights: { t: '行业动态', s: '追踪全球立法，分享与您品牌相关的要闻。' },
    contact: { t: '联系我们', s: '我们的办公室就是您办公室的延伸。告诉我们您需要保护什么。' }
  },
  home: {
    drag: '移动鼠标',
    introK: 'BloomMark',
    intro: '我们不是埃及第一家知识产权事务所，但我们每天都在努力成为最好的一家。',
    indexK: '我们保护什么', indexT: '六大领域，一个承诺。', open: '了解',
    firmK: '关于我们', firmT: '我们是您办公室的延伸', firmP: '自2007年起，我们与全球企业及知识产权事务所并肩合作，法律团队每天早晨审阅每一个案件。', firmCta: '认识我们',
    procK: '服务流程', procT: '从创意到注册权利', procCta: '查看流程',
    egyptK: '埃及知识产权', egyptT: '期限、条约与材料，一站了解', egyptCta: '了解法律框架',
    newsK: '行业动态', newsCta: '全部动态',
    ctaT: '您是否有值得保护的商标、发明或设计？', ctaB: '立即开始'
  },
  next: '下一页',
  practiceHint: '滚动浏览各业务领域'
}
};
for (const l in P) { const c = window.BM_CONTENT[l]; c.pg = P[l]; Object.assign(c.nav, P[l].nav); }
})();
