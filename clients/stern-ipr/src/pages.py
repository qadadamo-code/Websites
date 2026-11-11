# -*- coding: utf-8 -*-
from build import *
import build as B
from data import *


def num(n):
    return n


# ================================================================ HOME
def home():
    stats = "".join(
        f'<div class="st"><b data-count="{v}">{v}</b><sup>{s}</sup><span>{T(en, ar)}</span></div>'
        for v, s, en, ar in STATS)
    prac = ""
    for i, (slug, en, ar, den, dar, ic) in enumerate(PRACTICE):
        prac += f'''<a class="px" href="{link(slug)}" data-i="{i}">
  <em>0{i+1}</em><h3>{T(en, ar)}</h3><p>{T(den, dar)}</p>{icon(ic, 'px-ic')}<span class="px-go">{arrow()}</span></a>'''
    treat = "".join(f'<li>{T(en, ar)}</li>' for en, ar in TREAT)
    clients = "".join(f'<span class="cw cw-{k}">{n}</span>' for n, _, _, k in CLIENTS) * 2
    regions = "".join(
        f'<a class="rg" href="{link("jurisdictions")}#{k}"><b>{c}</b><span>{T(en, ar)}</span></a>'
        for k, en, ar, _, c in REGIONS[:3])
    body = f'''
<div class="stage">
<canvas class="e3d" id="e3d" aria-hidden="true"></canvas>
<section class="hero hx" id="top">
  <div class="hx-word" aria-hidden="true"><span>STERN</span></div>
  <div class="hero-eagle hx-fb" aria-hidden="true">{eagle('', 'glow')}</div>
  <div class="hx-meta wrap" aria-hidden="true"><span>30.0444° N · 31.2357° E</span><span>{T('Cairo · Est. 2008','القاهرة · منذ 2008')}</span></div>
  <div class="wrap hero-in hx-in">
    {kicker(T('Intellectual Property Law Firm','مكتب محاماة للملكية الفكرية'))}
    <h1 class="hero-t" data-split>{T('Power in protecting.','قوّةٌ في الحماية.')}</h1>
    <div class="hx-row">
      <p class="hero-l">{T('Patents, trademarks, designs and copyrights — protected in Egypt, across Africa and the Middle East, and worldwide through our network of agents in every major city.','براءات الاختراع والعلامات التجارية والنماذج الصناعية وحقوق المؤلف، محميّة في مصر وعبر أفريقيا والشرق الأوسط، وحول العالم من خلال شبكة وكلائنا في كبرى المدن.')}</p>
      <div class="hero-b">
        <a class="btn btn-l" href="{link('contact')}"><span>{T('Request a free quotation','اطلب عرض أتعاب مجاني')}</span>{arrow()}</a>
        <a class="btn btn-g" href="{link('jurisdictions')}"><span>{T('Explore our coverage','استكشف نطاق تغطيتنا')}</span></a>
      </div>
    </div>
  </div>
  <div class="hx-scroll" aria-hidden="true"><i></i>{T('Scroll','مرّر')}</div>
</section>

<section class="hx-st">
  <div class="wrap hx-st-g">
    <div class="hx-st-t">
      {kicker(T('Welcome to STERN IP','مرحبًا بكم في ستيرن'), '01')}
      <p class="big-q" data-words>{T('We are STERN IP, an Intellectual Property Law Firm based in Cairo, Egypt, with representations worldwide. Our services cover all aspects of intellectual property — not only in Egypt, but also in Africa and the Middle East.','نحن ستيرن، مكتب محاماة متخصص في الملكية الفكرية مقرّه القاهرة، وله تمثيل حول العالم. تغطي خدماتنا جميع جوانب الملكية الفكرية، ليس في مصر فحسب، بل في أفريقيا والشرق الأوسط أيضًا.')}</p>
      <div class="why why-d">
        <div class="why-c"><span class="why-n">{icon('shield')}</span><h3>{T('Power in protecting','قوّةٌ في الحماية')}</h3><p>{T('A global IP law company with Egyptian roots, operating with the dynamism of a start-up.','شركة عالمية للملكية الفكرية بجذور مصرية، تعمل بحيوية الشركات الناشئة.')}</p></div>
        <div class="why-c"><span class="why-n">{icon('star')}</span><h3>{T('Creative + Innovative = Quality Service','إبداع + ابتكار = خدمة متميّزة')}</h3><p>{T('Pioneering innovation in all of our practices and confirming our leadership locally and internationally.','نقود الابتكار في جميع مجالات ممارستنا ونؤكد ريادتنا محليًا ودوليًا.')}</p></div>
        <div class="why-c"><span class="why-n">{icon('globe')}</span><h3>{T('A solid worldwide network','شبكة عالمية متينة')}</h3><p>{T('Protect your trademarks, brand names, ideas and inventions through agents in all major cities of the world.','احمِ علاماتك وأسماءك التجارية وأفكارك واختراعاتك عبر وكلائنا في كبرى مدن العالم.')}</p></div>
      </div>
    </div>
  </div>
</section>
</div>

<div class="hero-tick hx-tick"><div class="tk">
    <span>{T('Best IP Firm in Egypt · 2015','أفضل مكتب ملكية فكرية في مصر · 2015')}</span><span>{T('Best IP Firm in Egypt · 2019','أفضل مكتب ملكية فكرية في مصر · 2019')}</span><span>{T('Top 5 IP firms in Egypt — Managing Intellectual Property','ضمن أفضل 5 مكاتب في مصر — Managing Intellectual Property')}</span><span>{T('Member of the Egyptian Patent Attorneys Organization','عضو منظمة وكلاء البراءات المصرية')}</span><span>{T('INTA member','عضو الرابطة الدولية للعلامات التجارية INTA')}</span>
</div></div>

<section class="stats sec-night">
  <div class="wrap st-g">{stats}</div>
</section>

<section class="prac prac-d sec-night">
  <div class="wrap">
    <div class="sh"><div>{kicker(T('Areas of practice','مجالات الممارسة'), '02')}<h2 data-split>{T('Treat your IP.','اعتنِ بملكيتك الفكرية.')}</h2></div>
    <p>{T('Protect your ideas and intellectual property through our professional services and expertise.','احمِ أفكارك وملكيتك الفكرية من خلال خدماتنا المهنية وخبرتنا.')}</p></div>
    <div class="px-g">{prac}</div>
    <ul class="treat">{treat}</ul>
  </div>
</section>

<section class="cover sec-night">
  <div class="wrap cover-g">
    <div class="cover-t">
      {kicker(T('Eagle’s-eye coverage','تغطية بعين النسر'), '03')}
      <h2 data-split>{T('From Cairo, side by side with our clients — wherever they are.','من القاهرة، جنبًا إلى جنب مع عملائنا أينما كانوا.')}</h2>
      <p>{T('Offices across North Africa and the Middle East — Egypt, Jordan, Saudi Arabia, UAE, Kuwait, Algeria, Sudan, Kenya, Ethiopia, OAPI, ARIPO and South Africa — and an extensive network of 50 liaison and correspondent offices worldwide.','مكاتب في شمال أفريقيا والشرق الأوسط: مصر والأردن والسعودية والإمارات والكويت والجزائر والسودان وكينيا وإثيوبيا والأوابي والأريبو وجنوب أفريقيا، وشبكة واسعة من 50 مكتب اتصال ومراسلة حول العالم.')}</p>
      <div class="rg-g">{regions}</div>
      <a class="btn btn-l" href="{link('jurisdictions')}"><span>{T('Open the jurisdictions map','افتح خريطة التغطية')}</span>{arrow()}</a>
    </div>
    <div class="cover-v"><canvas class="mini-map" id="miniMap"></canvas></div>
  </div>
</section>

<section class="chair sec-paper">
  <div class="wrap chair-g">
    <div class="chair-mark chair-3d" aria-hidden="true"><img src="{B.A()}img/3d/e-front.webp" alt="" width="1400" height="520" loading="lazy"><span class="chair-q">“</span></div>
    <div>
      {kicker(T('Chairman’s message','كلمة رئيس مجلس الإدارة'), '04')}
      <blockquote class="chair-b" data-words>{T('We are not the first IP attorney in Egypt & the Middle East. But we are always trying to be the best ones in this field.','لسنا أول وكيل ملكية فكرية في مصر والشرق الأوسط، لكننا نسعى دائمًا لأن نكون الأفضل في هذا المجال.')}</blockquote>
      <div class="sig"><span class="sig-s">Mahmoud Adel</span><span><b>{T('HE Mr. Mahmoud Adel','سعادة الأستاذ محمود عادل')}</b>{T('Chairman & CEO, STERN IP LTD','رئيس مجلس الإدارة والرئيس التنفيذي، ستيرن')}</span></div>
      <a class="lnk" href="{link('chairman')}">{T('Read the full message','اقرأ الكلمة كاملة')}{arrow()}</a>
    </div>
  </div>
</section>

<section class="cl sec-light">
  <div class="wrap sh sh-c">{kicker(T('Trusted by','موضع ثقة'), '05')}<h2 data-split>{T('Clients from more than 200 countries and areas.','عملاء من أكثر من 200 دولة ومنطقة.')}</h2></div>
  <div class="mq"><div class="mq-in">{clients}</div></div>
  <div class="wrap sh-c"><a class="lnk" href="{link('clients')}">{T('View our clients','تعرّف على عملائنا')}{arrow()}</a></div>
</section>
{cta()}'''
    return page("index", T("STERN IP — Intellectual Property Law Firm, Cairo", "ستيرن للملكية الفكرية — مكتب محاماة متخصص، القاهرة"),
                T("STERN IP is an Intellectual Property Law Firm based in Cairo, Egypt, covering patents, trademarks, designs and copyrights across Egypt, Africa and the Middle East.",
                  "ستيرن مكتب محاماة متخصص في الملكية الفكرية مقرّه القاهرة، يغطي براءات الاختراع والعلامات التجارية والنماذج الصناعية وحقوق المؤلف في مصر وأفريقيا والشرق الأوسط."),
                body, "home", ("dots.js", "cities.js", "eagle3d.js", "home3d.js"))


# ================================================================ ABOUT
def about():
    tl = [
        ("2006", T("Our founder registers as a lawyer at the Bar.", "مؤسس المكتب يُقيَّد محاميًا في نقابة المحامين.")),
        ("2008", T("STERN IP LTD is established in Cairo; registered as trademark and patent attorneys at the Ministry of Trade.", "تأسيس ستيرن في القاهرة، والقيد وكيلًا للعلامات التجارية وبراءات الاختراع لدى وزارة التجارة.")),
        ("2015", T("Awarded Best IP Firm in Egypt.", "الحصول على جائزة أفضل مكتب ملكية فكرية في مصر.")),
        ("2018", T("Contributed to updating the Egyptian intellectual property law alongside the Trademark Office.", "المساهمة في تحديث قانون الملكية الفكرية المصري بالتعاون مع مكتب العلامات التجارية.")),
        ("2019", T("Best IP Firm in Egypt, again — and ranked among the top 5 IP firms in Egypt by Managing Intellectual Property.", "أفضل مكتب ملكية فكرية في مصر مجددًا، وضمن أفضل 5 مكاتب في مصر وفق Managing Intellectual Property.")),
        (T("Today", "اليوم"), T("11 offices across the Arab world and Africa and 50 liaison and correspondent offices worldwide.", "11 مكتبًا في العالم العربي وأفريقيا و50 مكتب اتصال ومراسلة حول العالم.")),
    ]
    tlh = "".join(f'<li class="tl-i"><b>{y}</b><p>{t}</p></li>' for y, t in tl)
    values = [
        (T("Client first", "العميل أولًا"), T("Client first is our principal value. We deliver excellent services efficiently to meet the needs of clients from more than 200 countries and areas, and develop a proper strategy for their business.", "العميل أولًا هي قيمتنا الأساسية. نقدّم خدمات متميزة بكفاءة لتلبية احتياجات عملاء من أكثر من 200 دولة ومنطقة، ونضع الاستراتيجية المناسبة لأعمالهم.")),
        (T("Highest quality", "أعلى جودة"), T("Deliver the highest quality work, always exceeding client expectations while maximising the result of all our interactions.", "تقديم عمل بأعلى جودة، يتجاوز توقعات العملاء دائمًا، مع تعظيم نتائج كل تعاملاتنا.")),
        (T("Integrity", "النزاهة"), T("Conduct ourselves in the highest moral and ethical standards.", "الالتزام بأعلى المعايير الأخلاقية والمهنية.")),
        (T("Continuous growth", "التطوّر المستمر"), T("Continually push ourselves to develop new skills and capabilities, building upon our existing knowledge base.", "السعي الدائم لتطوير مهارات وقدرات جديدة، بالبناء على معرفتنا وخبراتنا القائمة.")),
        (T("Respect & merit", "الاحترام والجدارة"), T("Create and maintain a caring and respectful environment where individuals can excel and grow, rewarding individuals based on merit.", "بناء بيئة يسودها الاحترام والرعاية، يتميّز فيها الأفراد وينمون، ويُكافأون وفق الجدارة.")),
        (T("Our people", "الاستثمار في فريقنا"), T("Invest in our future through our people.", "نستثمر في مستقبلنا من خلال فريقنا.")),
    ]
    vh = "".join(f'<div class="val"><em>0{i+1}</em><h3>{a}</h3><p>{b}</p></div>' for i, (a, b) in enumerate(values))
    group = ["ADEL IP LTD", "MA IP LTD", "ASHRY & ADEL IP", "MAHMOUD ADVOCATES LIMITED", "STERN GLOBAL IP LTD"]
    gh = "".join(f'<li>{g}</li>' for g in group)
    mem = [T("The Egyptian Patent Attorneys Organization", "منظمة وكلاء البراءات المصرية"), T("International Trademark Association (INTA)", "الرابطة الدولية للعلامات التجارية (INTA)"), T("Law Society of Egypt", "نقابة المحامين المصرية"), T("Egyptian Trademarks Agent Association", "جمعية وكلاء العلامات التجارية المصرية")]
    mh = "".join(f'<li>{icon("shield")}<span>{m}</span></li>' for m in mem)
    body = page_hero("about", T("About STERN IP", "عن ستيرن"),
                     T("One of the most effective IP offices in Egypt, the Middle East and Africa.", "من أكثر مكاتب الملكية الفكرية فاعليةً في مصر والشرق الأوسط وأفريقيا."),
                     T("Patent agents specialised in registering trademarks, patents and industrial designs — and in rendering every related service.", "وكلاء براءات متخصصون في تسجيل العلامات التجارية وبراءات الاختراع والنماذج الصناعية، وفي تقديم جميع الخدمات المرتبطة بها."))
    body += f'''
<section class="sec-light">
  <div class="wrap two">
    <div>{kicker(T('Who we are','من نحن'), '01')}<h2 data-split>{T('A MENA pioneer in the registration and protection of IP rights.','رائد في تسجيل وحماية حقوق الملكية الفكرية في منطقة الشرق الأوسط وشمال أفريقيا.')}</h2></div>
    <div class="prose">
      <p>{T('Our firm handles payment of annuities and renewals for patents, designs and trademarks, as well as applications for assignments and license agreements, oppositions and petitions for local and international trademarks registered in Egypt — and the rendering of all related services.','يتولّى مكتبنا سداد الرسوم السنوية وتجديد براءات الاختراع والنماذج والعلامات التجارية، إلى جانب طلبات التنازل وعقود الترخيص والمعارضات والتظلّمات للعلامات المحلية والدولية المسجّلة في مصر، وتقديم جميع الخدمات المرتبطة بها.')}</p>
      <p>{T('STERN IP LTD is part of the Egyptian Patent Attorneys Organization and is regarded as one of the largest Intellectual Property firms in MENA on the basis of market reach, wide range of IP services and professional employees. We serve through our office in Cairo and 50 correspondents around the world.','ستيرن عضو في منظمة وكلاء البراءات المصرية، وتُعدّ من أكبر مكاتب الملكية الفكرية في منطقة الشرق الأوسط وشمال أفريقيا من حيث الانتشار في السوق وتنوّع الخدمات وكفاءة الفريق. نخدم عملاءنا من مكتبنا في القاهرة ومن خلال 50 مراسلًا حول العالم.')}</p>
      <p>{T('Established in Cairo in 2008, we adhere to high ethical and professional standards and employ a qualified in-house team of professionals as well as state-of-the-art technology, providing a comprehensive range of IP services tailored to our clients’ needs.','منذ تأسيسنا في القاهرة عام 2008 نلتزم بأعلى المعايير الأخلاقية والمهنية، ونعتمد على فريق داخلي مؤهّل وأحدث التقنيات، لنقدّم مجموعة شاملة من خدمات الملكية الفكرية المصمّمة وفق احتياجات عملائنا.')}</p>
    </div>
  </div>
</section>
<section class="sec-night tl-s">
  <div class="wrap">{kicker(T('Our history','مسيرتنا'), '02')}<h2 data-split>{T('Since 2008.','منذ 2008.')}</h2>
  <ol class="tl">{tlh}</ol></div>
</section>
<section class="sec-paper">
  <div class="wrap">
    <div class="sh">{kicker(T('Our values','قيمنا'), '03')}<h2 data-split>{T('Client first is our principal value.','العميل أولًا هي قيمتنا الأساسية.')}</h2></div>
    <div class="val-g">{vh}</div>
  </div>
</section>
<section class="sec-light">
  <div class="wrap mv">
    <div class="mv-c"><span class="mv-k">{T('Mission','رسالتنا')}</span><p>{T('We hope to be your overseas legal representative of Patent and Trademark, especially in Egypt and North Africa. It is our mission to share both our experience and proficiency in intellectual property law with our valued clients.','نطمح أن نكون ممثّلكم القانوني لبراءات الاختراع والعلامات التجارية، خاصةً في مصر وشمال أفريقيا. ورسالتنا أن نشارك عملاءنا الكرام خبرتنا وكفاءتنا في قانون الملكية الفكرية.')}</p></div>
    <div class="mv-c"><span class="mv-k">{T('Extension','امتداد لمكتبك')}</span><p>{T('We shall work side by side with you; our office is an extension of your office, assuring you always of our best attention and services.','نعمل جنبًا إلى جنب معكم؛ فمكتبنا امتداد لمكتبكم، مع التزامنا الدائم بأفضل رعاية وخدمة.')}</p></div>
    <div class="mv-c"><span class="mv-k">{T('Partnership','الشراكة')}</span><p>{T('We invite associates to consider our organisation when related services are needed in the countries where we operate — with the most competitive fee rates and special discounts on our service fees.','ندعو الزملاء والشركاء إلى الاستعانة بنا عند الحاجة إلى خدماتنا في الدول التي نعمل بها، بأكثر الأتعاب تنافسية وخصومات خاصة على رسوم خدماتنا.')}</p></div>
  </div>
</section>
<section class="sec-paper">
  <div class="wrap two">
    <div>{kicker(T('The group','المجموعة'), '04')}<h2 data-split>{T('The mother firm of an IP practice group.','الشركة الأم لمجموعة متخصصة في الملكية الفكرية.')}</h2><ul class="grp">{gh}</ul></div>
    <div>{kicker(T('Memberships','العضويات'), '05')}<ul class="mem">{mh}</ul></div>
  </div>
</section>
{cta()}'''
    return page("about", T("About — STERN IP", "عن ستيرن — ستيرن للملكية الفكرية"),
                T("Established in Cairo in 2008, STERN IP LTD is a MENA pioneer in the registration and protection of IPR.", "تأسّست ستيرن في القاهرة عام 2008، وهي من رواد تسجيل وحماية حقوق الملكية الفكرية في المنطقة."), body)


# ================================================================ CHAIRMAN
def chairman():
    edu = [("2004", T("University of Cairo", "جامعة القاهرة")), ("2008", T("School of Law", "كلية الحقوق")),
           ("2010", T("Diploma in Judicial Sciences", "دبلوم العلوم القضائية")), ("2012", T("Diploma in Intellectual Property Rights", "دبلوم حقوق الملكية الفكرية")),
           ("2014", T("Diploma in General Law", "دبلوم القانون العام"))]
    eh = "".join(f'<li><b>{y}</b><span>{t}</span></li>' for y, t in edu)
    body = page_hero("chairman", T("Chairman’s message", "كلمة رئيس مجلس الإدارة"),
                     T("Dear clients, colleagues, associates and friends.", "عملاءنا وزملاءنا وشركاءنا وأصدقاءنا الأعزاء."),
                     T("HE Mr. Mahmoud Adel — Chairman & CEO, STERN IP LTD", "سعادة الأستاذ محمود عادل — رئيس مجلس الإدارة والرئيس التنفيذي لستيرن"),
                     crumbs=T("Chairman", "رئيس مجلس الإدارة"))
    body += f'''
<section class="sec-light">
  <div class="wrap letter">
    <aside class="letter-a">
      <div class="por">{eagle('', 'brand')}<span class="por-i">MA</span></div>
      <p class="por-n">{T('Mahmoud Adel','محمود عادل')}</p><p class="por-r">{T('Chairman & CEO','رئيس مجلس الإدارة والرئيس التنفيذي')}</p>
      <a class="lnk" href="mailto:{EMAIL}">{EMAIL}</a>
    </aside>
    <div class="prose prose-l">
      <p class="drop">{T('STERN Intellectual Property has been meeting the Intellectual Property needs of our distinguished international clients regionally and globally since 2008. Over this period, we have grown into a truly international firm.','تلبّي ستيرن للملكية الفكرية احتياجات عملائنا الدوليين المتميّزين إقليميًا وعالميًا منذ عام 2008، وقد نمونا خلال هذه الفترة لنصبح مكتبًا دوليًا بحق.')}</p>
      <p>{T('To provide complete coverage of the region, STERN IP LTD has 11 offices in the Arab world and Africa: Jordan, Saudi Arabia, UAE, Kuwait, Algeria, Sudan, Kenya, Ethiopia, OAPI, ARIPO and South Africa. To serve our clients at the global level, STERN IP LTD has an extensive network of 50 liaison and correspondent offices worldwide.','ولتوفير تغطية كاملة للمنطقة، تمتلك ستيرن 11 مكتبًا في العالم العربي وأفريقيا: الأردن والسعودية والإمارات والكويت والجزائر والسودان وكينيا وإثيوبيا والأوابي والأريبو وجنوب أفريقيا. ولخدمة عملائنا على المستوى العالمي، نمتلك شبكة واسعة من 50 مكتب اتصال ومراسلة حول العالم.')}</p>
      <p>{T('Throughout this growth, STERN IP LTD has maintained its unwavering commitment to its mission of providing clients with the best-quality service available in the field of IP protection.','وطوال هذا النمو حافظت ستيرن على التزامها الراسخ برسالتها: أن تقدّم لعملائها أفضل خدمة متاحة في مجال حماية الملكية الفكرية.')}</p>
      <p>{T('Our goal is two-fold: to help provide our clients the protection their efforts deserve, and to help further the advancement of the people. To this end, we greatly appreciate your continued business and the relationship we have developed over the years. I assure you that we shall continue to do our utmost in providing you with the highest levels of service.','هدفنا مزدوج: أن نوفّر لعملائنا الحماية التي تستحقها جهودهم، وأن نسهم في تقدّم المجتمع. ولهذا نقدّر كثيرًا ثقتكم المستمرة والعلاقة التي بنيناها معًا عبر السنين، وأؤكد لكم أننا سنواصل بذل أقصى جهدنا لنقدّم لكم أعلى مستويات الخدمة.')}</p>
      <div class="sig"><span class="sig-s">Mahmoud Adel</span><span><b>{T('HE Mr. Mahmoud Adel','سعادة الأستاذ محمود عادل')}</b>{T('Chairman & CEO','رئيس مجلس الإدارة والرئيس التنفيذي')}</span></div>
    </div>
  </div>
</section>
<section class="sec-night">
  <div class="wrap two">
    <div>{kicker(T('Biography','السيرة الذاتية'), '01')}<h2 data-split>{T('More than 12 years advising on global IP portfolios.','أكثر من 12 عامًا في إدارة محافظ الملكية الفكرية العالمية.')}</h2></div>
    <div class="prose prose-d">
      <p>{T('Mr. Mahmoud Adel heads STERN IP’s Intellectual Property Practice Group in Egypt — the mother firm of ADEL IP LTD, MA IP LTD, ASHRY & ADEL IP, MAHMOUD ADVOCATES LIMITED and STERN GLOBAL IP LTD. He advises on global trademark and patent portfolio management, global brand protection, intellectual property enforcement, licensing and anti-counterfeiting matters.','يرأس الأستاذ محمود عادل مجموعة ستيرن لممارسة الملكية الفكرية في مصر، وهي الشركة الأم لكل من ADEL IP LTD وMA IP LTD وASHRY & ADEL IP وMAHMOUD ADVOCATES LIMITED وSTERN GLOBAL IP LTD. ويقدّم الاستشارات في إدارة محافظ العلامات التجارية وبراءات الاختراع عالميًا، وحماية العلامات، وإنفاذ حقوق الملكية الفكرية، والترخيص، ومكافحة التقليد.')}</p>
      <p>{T('He contributed to updating the intellectual property law in 2018, supported by the Trademark Office and local trademark attorneys. He has been registered as a lawyer at the Bar since 2006 and as a trademark and patent attorney at the Ministry of Trade since 2008.','أسهم في تحديث قانون الملكية الفكرية عام 2018 بدعم من مكتب العلامات التجارية وعدد من وكلاء العلامات المحليين. وهو مقيّد محاميًا في النقابة منذ 2006، ووكيلًا للعلامات التجارية وبراءات الاختراع لدى وزارة التجارة منذ 2008.')}</p>
      <h3>{T('Practice focus','محور الممارسة')}</h3>
      <p>{T('Global trademark and design portfolio management and global brand protection; advice on worldwide corporate branding availability; coordination of global and Egyptian trademark portfolios for various clients.','إدارة محافظ العلامات التجارية والنماذج عالميًا وحماية العلامات، والاستشارات حول توفّر العلامات المؤسسية عالميًا، وتنسيق محافظ العلامات العالمية والمصرية لعملاء متعددين.')}</p>
      <h3>{T('Languages','اللغات')}</h3>
      <p>{T('English · Arabic · French','الإنجليزية · العربية · الفرنسية')}</p>
    </div>
  </div>
</section>
<section class="sec-paper">
  <div class="wrap two">
    <div>{kicker(T('Education','المؤهلات العلمية'), '02')}<ol class="edu">{eh}</ol></div>
    <div>{kicker(T('Professional associations','العضويات المهنية'), '03')}
      <ul class="mem">
        <li>{icon('shield')}<span>{T('International Trademark Association (INTA)','الرابطة الدولية للعلامات التجارية (INTA)')}</span></li>
        <li>{icon('shield')}<span>{T('Law Society of Egypt','نقابة المحامين المصرية')}</span></li>
        <li>{icon('shield')}<span>{T('Egyptian Trademarks Agent Association','جمعية وكلاء العلامات التجارية المصرية')}</span></li>
        <li>{icon('shield')}<span>{T('The Egyptian Patent Attorneys Organization','منظمة وكلاء البراءات المصرية')}</span></li>
      </ul></div>
  </div>
</section>
{cta()}'''
    return page("chairman", T("Chairman’s Message — STERN IP", "كلمة رئيس مجلس الإدارة — ستيرن للملكية الفكرية"),
                T("A message from HE Mr. Mahmoud Adel, Chairman & CEO of STERN IP LTD.", "كلمة سعادة الأستاذ محمود عادل، رئيس مجلس إدارة ستيرن."), body)


# ================================================================ TEAM
def initials(n):
    p = n.replace("AbdelHamed", "Abdel Hamed").split()
    return (p[0][0] + p[-1][0]).upper()


def team():
    cards = ""
    for i, (en, ar, ren, rar, mail, tier) in enumerate(TEAM):
        cards += f'''<article class="tm tm-{tier}">
  <div class="tm-av"><span>{initials(en)}</span>{eagle('tm-e', 'light')}</div>
  <div class="tm-b"><h3>{T(en, ar)}</h3><p>{T(ren, rar)}</p>
  <a href="mailto:{mail}">{icon('mail')}<span>{mail}</span></a></div></article>'''
    body = page_hero("team", T("Our team", "فريق العمل"),
                     T("Attorneys, lawyers and specialists — side by side.", "وكلاء ومحامون ومتخصصون، جنبًا إلى جنب."),
                     T("A qualified in-house team of trademark and patent attorneys, lawyers, translators and managers serving clients from Cairo.", "فريق داخلي مؤهّل من وكلاء العلامات والبراءات والمحامين والمترجمين والمديرين، يخدم عملاءنا من القاهرة."),
                     crumbs=T("Our team", "فريق العمل"))
    body += f'''
<section class="sec-light">
  <div class="wrap">
    <div class="tm-g">{cards}</div>
  </div>
</section>
{cta()}'''
    return page("team", T("Our Team — STERN IP", "فريق العمل — ستيرن للملكية الفكرية"),
                T("Meet the attorneys and specialists of STERN IP.", "تعرّف على وكلاء ومتخصصي ستيرن."), body)


# ================================================================ PRACTICE
def practice():
    rows = ""
    for i, (slug, en, ar, den, dar, ic) in enumerate(PRACTICE):
        rows += f'''<a class="pc" href="{link(slug)}"><div class="pc-ic">{icon(ic)}</div><em>0{i+1}</em><h3>{T(en, ar)}</h3><p>{T(den, dar)}</p><span class="lnk">{T('Learn more','المزيد')}{arrow()}</span></a>'''
    treat = "".join(f'<li>{icon("shield")}<span>{T(en, ar)}</span></li>' for en, ar in TREAT)
    body = page_hero("practice", T("Areas of practice", "مجالات الممارسة"),
                     T("All aspects of intellectual property.", "جميع جوانب الملكية الفكرية."),
                     T("Patents, trademarks, designs and copyrights — with litigation and consultancy in Egypt, Africa and the Middle East.", "براءات الاختراع والعلامات التجارية والنماذج الصناعية وحقوق المؤلف، مع التقاضي والاستشارات في مصر وأفريقيا والشرق الأوسط."))
    body += f'''
<section class="sec-light">
  <div class="wrap"><div class="pc-g">{rows}</div></div>
</section>
<section class="sec-night">
  <div class="wrap two">
    <div>{kicker(T('Treat your IP','اعتنِ بملكيتك الفكرية'))}<h2 data-split>{T('Every service your portfolio needs.','كل خدمة تحتاجها محفظتك.')}</h2>
    <p class="lead-d">{T('It is our firm policy not to charge clients and associates for reviewing and reporting office actions, rejection and opposition notices, for legal opinions on registrability or chances of success, or for status reports.','من سياسة مكتبنا ألّا نتقاضى أتعابًا من العملاء والشركاء مقابل مراجعة قرارات المكاتب والإبلاغ عنها، أو إشعارات الرفض والمعارضة، أو الآراء القانونية حول قابلية التسجيل وفرص النجاح، أو تقارير سير المعاملات.')}</p></div>
    <ul class="chk">{treat}</ul>
  </div>
</section>
{cta()}'''
    return page("practice", T("Areas of Practice — STERN IP", "مجالات الممارسة — ستيرن للملكية الفكرية"),
                T("Trademarks, patents, utility models, industrial designs, copyrights, litigation and consultancy.", "العلامات التجارية وبراءات الاختراع ونماذج المنفعة والنماذج الصناعية وحقوق المؤلف والتقاضي والاستشارات."), body)


def acc(items):
    return '<div class="acc">' + "".join(
        f'<details class="ac"{" open" if i == 0 else ""}><summary><span>{t}</span>{icon("plus", "ac-ic")}</summary><div class="ac-b">{b}</div></details>'
        for i, (t, b) in enumerate(items)) + "</div>"


def ul(items):
    return "<ul class='dl'>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"


def trademarks():
    sv = "".join(f'<div class="sv" id="{"litigation" if en=="Trademark Litigation" else ""}"><em>{i+1:02d}</em><h3>{T(en, ar)}</h3><p>{T(den, dar)}</p></div>'
                 for i, (en, ar, den, dar) in enumerate(TM_SERVICES))
    req = acc([
        (T("Trademark application requirements", "متطلبات طلب تسجيل العلامة"), ul([
            T("Full name, address and nationality of the applicant.", "الاسم الكامل للمودِع وعنوانه وجنسيته."),
            T("Power of attorney notarized and legalized up to the Egyptian Consulate.", "توكيل موثّق ومصدّق حتى القنصلية المصرية."),
            T("Trademark image.", "صورة العلامة."),
            T("List of goods/services to be covered by the application.", "قائمة السلع/الخدمات المشمولة بالطلب."),
            T("Certified copy of the priority document if claimed (accepted within six months).", "نسخة معتمدة من مستند الأولوية في حال المطالبة بها (تُقبل خلال ستة أشهر)."),
            T("The application can be submitted without the POA; the scanned legalized POA must follow within 6 months without additional fees, and the original before receiving the registration certificate.", "يمكن تقديم الطلب دون التوكيل، على أن تُقدَّم نسخة ممسوحة من التوكيل المصدّق خلال 6 أشهر دون رسوم إضافية، والأصل قبل استلام شهادة التسجيل."),
        ])),
        (T("Trademark renewal requirements", "متطلبات تجديد العلامة"), ul([
            T("Power of attorney notarized and legalized up to the Egyptian Consulate.", "توكيل موثّق ومصدّق حتى القنصلية المصرية."),
            T("Scanned copy of the trademark registration certificate.", "نسخة ممسوحة من شهادة تسجيل العلامة.")])),
        (T("Trademark assignment requirements", "متطلبات التنازل عن العلامة"), ul([
            T("Power of attorney signed by the assignee, notarized and legalized up to the Egyptian Consulate.", "توكيل موقّع من المتنازَل إليه، موثّق ومصدّق حتى القنصلية المصرية."),
            T("Assignee’s business license / incorporation certificate / commercial registry, notarized and legalized.", "الترخيص التجاري أو شهادة التأسيس أو السجل التجاري للمتنازَل إليه، موثّقًا ومصدّقًا."),
            T("Assignment contract signed by both parties, or by the assignor at least, notarized and legalized.", "عقد التنازل موقّعًا من الطرفين أو من المتنازِل على الأقل، موثّقًا ومصدّقًا."),
            T("Copy of the trademark registration certificate.", "نسخة من شهادة تسجيل العلامة.")])),
        (T("Change of name / address requirements", "متطلبات تغيير الاسم / العنوان"), ul([
            T("POA reflecting the new name/address, notarized and legalized up to the Egyptian Consulate.", "توكيل بالاسم/العنوان الجديد، موثّق ومصدّق حتى القنصلية المصرية."),
            T("Certificate of change of name/address, notarized and legalized up to the Egyptian Consulate.", "شهادة تغيير الاسم/العنوان، موثّقة ومصدّقة حتى القنصلية المصرية.")])),
    ])
    facts = [(T("Filing system", "نظام الإيداع"), T("Single & multi-class", "فئة واحدة ومتعدد الفئات")), (T("Classification", "التصنيف"), T("Nice, 11th edition", "نيس، الطبعة 11")),
             (T("Filing to certificate", "من الإيداع إلى الشهادة"), T("12–18 months", "12–18 شهرًا")), (T("Search turnaround", "مدة البحث"), T("30 days", "30 يومًا")),
             (T("Protection", "مدة الحماية"), T("10 years, renewable", "10 سنوات قابلة للتجديد")), (T("Renewal grace", "مهلة التجديد"), T("6 months · 3 years with super penalty", "6 أشهر · 3 سنوات بغرامة مضاعفة"))]
    fh = "".join(f'<div class="fx"><span>{a}</span><b>{b}</b></div>' for a, b in facts)
    body = page_hero("trademarks", T("Trademarks", "العلامات التجارية"),
                     T("Your brand, guarded at every stage.", "علامتك، محميّة في كل مرحلة."),
                     T("From the first availability search to watch, opposition and litigation — locally and globally.", "من أول بحث عن توفّر العلامة إلى المراقبة والمعارضة والتقاضي، محليًا ودوليًا."),
                     crumbs=T("Trademarks", "العلامات التجارية"))
    body += f'''
<section class="sec-light"><div class="wrap"><div class="sv-g">{sv}</div></div></section>
<section class="sec-night">
  <div class="wrap two">
    <div>{kicker(T('No hidden expenses','بلا مصروفات خفية'))}<h2 data-split>{T('Free fee quotation. Response within 24 hours.','عرض أتعاب مجاني، ورد خلال 24 ساعة.')}</h2></div>
    <div class="prose prose-d"><p>{T('Our quoted charges are highly competitive and inclusive of all disbursements up to registration, with no other charges in normal cases. No hidden expenses will be incurred during the processing of the trademark into final registration — no printing, post or the like will be added to our charges.','أتعابنا المعروضة تنافسية للغاية وتشمل جميع المصروفات حتى التسجيل، دون أي رسوم أخرى في الحالات العادية. لا مصروفات خفية خلال إجراءات العلامة حتى التسجيل النهائي، ولا تُضاف إلى أتعابنا أي تكاليف طباعة أو بريد أو ما شابه.')}</p>
    <p>{T('It is also firm policy not to charge for reviewing and reporting office actions, rejection and opposition notices, for legal opinions on registrability or chances of success of appeals or oppositions, or for responding to inquiries and providing status reports.','ومن سياسة مكتبنا أيضًا ألّا نتقاضى أتعابًا مقابل مراجعة قرارات المكتب والإبلاغ عنها، أو إشعارات الرفض والمعارضة، أو الآراء القانونية حول قابلية التسجيل وفرص نجاح التظلّمات والمعارضات، أو الرد على الاستفسارات وتقديم تقارير سير المعاملات.')}</p></div>
  </div>
</section>
<section class="sec-paper">
  <div class="wrap two">
    <div>{kicker(T('Trademarks in Egypt','العلامات التجارية في مصر'))}<h2 data-split>{T('Requirements & key facts.','المتطلبات والمعلومات الأساسية.')}</h2><div class="fx-g">{fh}</div>
    <p class="note">{T('If there is no Egyptian Consulate in your country, legalization can be made by any Arab consulate.','إذا لم تكن هناك قنصلية مصرية في بلدك، يمكن التصديق لدى أي قنصلية عربية.')}</p></div>
    <div>{req}</div>
  </div>
</section>
{cta()}'''
    return page("trademarks", T("Trademark Services — STERN IP", "خدمات العلامات التجارية — ستيرن للملكية الفكرية"),
                T("Trademark search, application, renewal, assignment, license, opposition, invalidation, cancellation, litigation, investigation and watch.", "خدمات البحث والتسجيل والتجديد والتنازل والترخيص والمعارضة والإبطال والشطب والتقاضي والتحرّي والمراقبة."), body)


def patents():
    svc = [(T("Patent Drafting", "صياغة البراءات"), T("Specifications, abstracts and claims prepared for filing.", "إعداد المواصفات والملخصات وعناصر الحماية للإيداع.")),
           (T("Patent Validation System", "نظام التحقّق من البراءات"), T("Validation of granted patents in the jurisdictions you need.", "التحقق من البراءات الممنوحة في الدول التي تحتاجها.")),
           (T("Patent Anti-Infringement", "مكافحة التعدّي"), T("Protecting your patented technology against unauthorised exploitation.", "حماية تقنيتك المحمية ببراءة من الاستغلال غير المصرّح به.")),
           (T("Search for Published Patents", "البحث في البراءات المنشورة"), T("Prior-art and published-patent searches before you invest.", "البحث في حالة التقنية السابقة والبراءات المنشورة قبل أن تستثمر.")),
           (T("Annuities & Renewals", "الرسوم السنوية والتجديدات"), T("Payment of annuities and renewals for patents and designs.", "سداد الرسوم السنوية وتجديد البراءات والنماذج.")),
           (T("Patent Translation", "ترجمة البراءات"), T("Arabic translation of full specifications, abstracts and claims by our patent translators.", "ترجمة المواصفات الكاملة والملخصات وعناصر الحماية إلى العربية على يد مترجمي البراءات لدينا."))]
    sv = "".join(f'<div class="sv"><em>{i+1:02d}</em><h3>{a}</h3><p>{b}</p></div>' for i, (a, b) in enumerate(svc))
    gcc = acc([
        (T("Requirements for filing in the GCC", "متطلبات الإيداع لدى مكتب الخليج"), ul([
            T("POA notarized and legalized up to the Saudi Consulate or any GCC member state consulate.", "توكيل موثّق ومصدّق حتى القنصلية السعودية أو قنصلية أي دولة خليجية."),
            T("Incorporation certificate, notarized and legalized.", "شهادة التأسيس موثّقة ومصدّقة."),
            T("Business license, notarized and legalized.", "الترخيص التجاري موثّقًا ومصدّقًا."),
            T("Deed of assignment, notarized and legalized.", "سند التنازل موثّقًا ومصدّقًا."),
            T("Certified copy of the priority document if the Paris Convention is claimed.", "نسخة معتمدة من مستند الأولوية عند المطالبة بها وفق اتفاقية باريس.")])),
        (T("General information", "معلومات عامة"), ul([
            T("Priority may be claimed under the Paris Convention within 12 months from the first filing date.", "يمكن المطالبة بالأولوية وفق اتفاقية باريس خلال 12 شهرًا من تاريخ أول إيداع."),
            T("Not a member of the PCT.", "ليس عضوًا في معاهدة التعاون بشأن البراءات (PCT)."),
            T("Period of protection: 20 years, subject to annual annuities payable by 31 March of each year.", "مدة الحماية 20 عامًا بشرط سداد الرسوم السنوية قبل 31 مارس من كل عام."),
            T("Arabic translation of the full specification, abstract and claims must be submitted with the application.", "يجب تقديم ترجمة عربية للمواصفة الكاملة والملخص وعناصر الحماية مع الطلب."),
            T("All required documents may be submitted within 90 days from the filing date.", "يمكن تقديم جميع المستندات المطلوبة خلال 90 يومًا من تاريخ الإيداع."),
            T("The patentee shall exploit the invention in the GCC member states within 3 years from grant.", "يلتزم مالك البراءة باستغلال الاختراع في دول المجلس خلال 3 سنوات من المنح.")])),
    ])
    body = page_hero("patents", T("Patents", "براءات الاختراع"),
                     T("The right to exclude others from your invention.", "حقّك في منع الآخرين من استغلال اختراعك."),
                     T("A patent gives its owner the right to exclude others from making, using or selling the patented invention.", "تمنح البراءة مالكها الحق في منع الآخرين من صنع الاختراع المحمي أو استخدامه أو بيعه."),
                     crumbs=T("Patents", "براءات الاختراع"))
    body += f'''
<section class="sec-light">
  <div class="wrap two">
    <div>{kicker(T('What can be patented','ما الذي يمكن حمايته ببراءة'))}<h2 data-split>{T('New. Inventive. Industrially applicable.','جديد. ينطوي على خطوة ابتكارية. قابل للتطبيق الصناعي.')}</h2></div>
    <div class="prose"><p>{T('A patent shall be granted to any industrially applicable invention which is new and involves an inventive step — whether connected with new industrial products, new industrial processes, or a new application of known industrial processes.','تُمنح البراءة لكل اختراع قابل للتطبيق الصناعي يكون جديدًا وينطوي على خطوة ابتكارية، سواء تعلّق بمنتجات صناعية جديدة أو بطرق صناعية مستحدثة أو بتطبيق جديد لطرق صناعية معروفة.')}</p>
    <p>{T('A patent is also granted, independently, for any modification, improvement or addition to a previously patented invention that meets the same criteria — in which case it is granted to the owner of the modification, improvement or addition.','كما تُمنح البراءة استقلالًا عن كل تعديل أو تحسين أو إضافة ترد على اختراع سبق منحه براءة متى توفّرت فيه الشروط ذاتها، وتُمنح في هذه الحالة لصاحب التعديل أو التحسين أو الإضافة.')}</p></div>
  </div>
</section>
<section class="sec-paper"><div class="wrap"><div class="sh">{kicker(T('Patent services','خدمات البراءات'))}<h2 data-split>{T('From drafting to annuities.','من الصياغة إلى الرسوم السنوية.')}</h2></div><div class="sv-g sv-3">{sv}</div></div></section>
<section class="sec-night">
  <div class="wrap two">
    <div>{kicker(T('GCC Patent Office','مكتب براءات الخليج'))}<h2 data-split>{T('One application. Six Gulf states.','طلب واحد. ست دول خليجية.')}</h2>
    <p class="lead-d">{T('Approved by the GCC Supreme Council in 1992, the GCC Patent Office in Riyadh grants patents that secure protection in Bahrain, Kuwait, Qatar, Oman, Saudi Arabia and the UAE.','أُقرّ مكتب براءات الاختراع لمجلس التعاون الخليجي من المجلس الأعلى عام 1992، ومقرّه الرياض، ويمنح براءات تؤمّن الحماية في البحرين والكويت وقطر وعُمان والسعودية والإمارات.')}</p></div>
    <div class="acc-d">{gcc}</div>
  </div>
</section>
{cta()}'''
    return page("patents", T("Patents — STERN IP", "براءات الاختراع — ستيرن للملكية الفكرية"),
                T("Patent drafting, filing, validation, anti-infringement and GCC patents.", "صياغة البراءات وإيداعها والتحقق منها ومكافحة التعدّي وبراءات الخليج."), body)


def designs():
    body = page_hero("designs", T("Designs & Utility Models", "النماذج الصناعية ونماذج المنفعة"),
                     T("Protect the form, the function and the work.", "احمِ الشكل والوظيفة والعمل الإبداعي."),
                     T("Industrial designs, utility models and copyrights — with licensing, franchising, portfolio management and brand protection.", "النماذج الصناعية ونماذج المنفعة وحقوق المؤلف، مع الترخيص والامتياز التجاري وإدارة المحافظ وحماية العلامات."),
                     crumbs=T("Designs & Utility Models", "النماذج الصناعية ونماذج المنفعة"))
    body += f'''
<section class="sec-light" id="designs">
  <div class="wrap two">
    <div>{kicker(T('Industrial designs','النماذج الصناعية'), '01')}<h2 data-split>{T('The appearance of novelty, protected.','حماية المظهر المبتكر.')}</h2></div>
    <div class="prose"><p>{T('An industrial design is any composition of lines or any three-dimensional form, whether or not associated with colours, provided that it gives a special appearance of novelty and is industrially applicable.','النموذج الصناعي هو كل ترتيب للخطوط أو كل شكل مجسّم، بألوان أو بغير ألوان، يمنح مظهرًا مميزًا ومبتكرًا ويكون قابلًا للاستخدام الصناعي.')}</p>
    <div class="tags"><span>{T('Packages & containers','العبوات والحاويات')}</span><span>{T('Furnishing & household goods','الأثاث والأدوات المنزلية')}</span><span>{T('Lighting equipment','معدات الإضاءة')}</span><span>{T('Jewellery','المجوهرات')}</span><span>{T('Electronic devices','الأجهزة الإلكترونية')}</span><span>{T('Textiles','المنسوجات')}</span></div></div>
  </div>
</section>
<section class="sec-night" id="utility">
  <div class="wrap two">
    <div>{kicker(T('Utility models','نماذج المنفعة'), '02')}<h2 data-split>{T('The “petty patent”.','«البراءة الصغرى».')}</h2></div>
    <div class="prose prose-d"><p>{T('A utility model is an exclusive right granted for an invention, which allows the right holder to prevent others from commercially using the protected invention without authorisation, for a limited period of time.','نموذج المنفعة حق استئثاري يُمنح على اختراع، ويتيح لصاحبه منع الآخرين من استغلال الاختراع المحمي تجاريًا دون إذنه، لمدة زمنية محدودة.')}</p>
    <p>{T('Utility models are similar to patents; they are sometimes referred to as “petty patents” or “innovation patents”.','تشبه نماذج المنفعة براءات الاختراع، ويُطلق عليها أحيانًا «البراءات الصغرى» أو «براءات الابتكار».')}</p></div>
  </div>
</section>
<section class="sec-paper" id="copyright">
  <div class="wrap two">
    <div>{kicker(T('Copyrights & commercialisation','حقوق المؤلف والاستثمار التجاري'), '03')}<h2 data-split>{T('Rights that work for your business.','حقوق تعمل لصالح أعمالك.')}</h2></div>
    <div class="sv-g sv-2">
      <div class="sv"><em>01</em><h3>{T('Copyrights','حقوق المؤلف')}</h3><p>{T('Protection of creative works as part of every IP matter we handle.','حماية الأعمال الإبداعية ضمن كل معاملات الملكية الفكرية التي نتولاها.')}</p></div>
      <div class="sv"><em>02</em><h3>{T('Licensing & Franchising','الترخيص والامتياز التجاري')}</h3><p>{T('Licence agreements and their recordal, so others can use your rights on your terms.','عقود الترخيص وقيدها، ليستخدم الآخرون حقوقك وفق شروطك.')}</p></div>
      <div class="sv"><em>03</em><h3>{T('IP Portfolio Management','إدارة محافظ الملكية الفكرية')}</h3><p>{T('Renewals, annuities and records kept in order across jurisdictions.','إدارة التجديدات والرسوم السنوية والسجلات عبر مختلف الدول.')}</p></div>
      <div class="sv"><em>04</em><h3>{T('Brand Protection','حماية العلامة')}</h3><p>{T('Watch, investigation and anti-counterfeiting to keep your brand yours.','المراقبة والتحرّي ومكافحة التقليد لتبقى علامتك ملكك.')}</p></div>
    </div>
  </div>
</section>
{cta()}'''
    return page("designs", T("Industrial Designs, Utility Models & Copyrights — STERN IP", "النماذج الصناعية ونماذج المنفعة وحقوق المؤلف — ستيرن"),
                T("Industrial design, utility model and copyright protection with STERN IP.", "حماية النماذج الصناعية ونماذج المنفعة وحقوق المؤلف مع ستيرن."), body)


# ================================================================ JURISDICTIONS
def jurisdictions():
    import json
    rows = ""
    jd = {}
    for en, ar, rg, fil, nice, tm, ex, pr, nu, gr, off in J:
        tr = (lambda s: AR_TERMS.get(s, s)) if B.LANG == "ar" else (lambda s: T(s, s))
        key = J_MAP[en]
        jd[key] = {"n": T(en, ar), "o": off, "r": rg, "f": [
            [T("Filing system", "نظام الإيداع"), tr(fil)],
            [T("Classification", "التصنيف"), T({"Special": "Special classification", "Nice": "Nice classification"}.get(nice, "Nice, " + nice + " edition"), AR_TERMS[nice])],
            [T("Filing to certificate", "من الإيداع إلى الشهادة"), tr(tm)],
            [T("Examination", "نوع الفحص"), tr(ex)],
            [T("Protection", "مدة الحماية"), tr(pr)],
            [T("Non-use cancellation", "الشطب لعدم الاستعمال"), ("—" if nu == "—" else T(f"after {nu} consecutive years", f"بعد {nu} سنوات متتالية" if nu != "2" else "بعد سنتين متتاليتين"))],
            [T("Renewal grace period", "مهلة التجديد بعد الانتهاء"), tr(gr)],
        ]}
        rows += f'<button class="jc" data-c="{key}" data-r="{rg}"><span>{T(en, ar)}</span>{"<i class=jo>" + T("Office", "مكتب") + "</i>" if off else ""}</button>'
    offx = {k: T(v[1], v[0]) for k, v in OFFICE_EXTRA.items()}
    reg = ""
    for k, en, ar, lst, c in REGIONS:
        reg += f'<div class="rgc" id="{k}"><div class="rgc-h"><b>{c}</b><h3>{T(en, ar)}</h3></div><p>{lst}</p></div>'
    orgs = "".join(f'<div class="org"><b>{a}</b><h3>{T(c, d)}</h3><p>{T(e, f)}</p></div>' for a, b, c, d, e, f in ORGS)
    data = json.dumps({"j": jd, "ox": offx, "hint": T("Select a country", "اختر دولة"),
                       "office": T("STERN office", "مكتب ستيرن"), "corr": T("Through our network", "عبر شبكتنا"),
                       "tm": T("Trademarks at a glance", "العلامات التجارية في لمحة"),
                       "noTable": T("STERN office — contact us for current requirements.", "مكتب ستيرن — تواصل معنا لمعرفة المتطلبات الحالية.")}, ensure_ascii=False)
    body = page_hero("jurisdictions", T("Jurisdictions", "نطاق التغطية"),
                     T("An eagle’s-eye view of where we protect.", "نظرة بعين النسر على حيث نحمي حقوقك."),
                     T("Offices across North Africa and the Middle East, regional organisations, and 50 correspondents worldwide. Select a country for trademark facts.", "مكاتب في شمال أفريقيا والشرق الأوسط، ومنظمات إقليمية، و50 مراسلًا حول العالم. اختر دولة لعرض معلومات العلامات التجارية فيها."),
                     crumbs=T("Jurisdictions", "نطاق التغطية"))
    body += f'''
<section class="jx sec-night">
  <div class="wrap jx-g">
    <div class="jx-map"><div id="jmap" class="jmap" role="img" aria-label="{T('Map of jurisdictions','خريطة نطاق التغطية')}"></div>
      <div class="jx-leg"><span><i class="lg-of"></i>{T('STERN office','مكتب ستيرن')}</span><span><i class="lg-co"></i>{T('Trademark facts available','معلومات العلامات متاحة')}</span></div></div>
    <aside class="jx-p" id="jpanel" aria-live="polite">
      <p class="kk"><span>{T('Trademarks at a glance','العلامات التجارية في لمحة')}</span></p>
      <h3 id="jname">{T('Egypt','مصر')}</h3><p id="jtag" class="jtag"></p>
      <dl id="jfacts" class="jfacts"></dl>
      <a class="btn btn-l btn-w" href="{link('contact')}"><span>{T('Ask about this jurisdiction','استفسر عن هذه الدولة')}</span>{arrow()}</a>
    </aside>
  </div>
  <div class="wrap">
    <div class="jf" role="tablist"><button class="on" data-f="all">{T('All','الكل')}</button><button data-f="gcc">{T('GCC','الخليج')}</button><button data-f="me">{T('Middle East','الشرق الأوسط')}</button><button data-f="af">{T('North Africa','شمال أفريقيا')}</button></div>
    <div class="jc-g" id="jlist">{rows}</div>
  </div>
</section>
<section class="sec-light">
  <div class="wrap">
    <div class="sh">{kicker(T('Regional organisations','المنظمات الإقليمية'))}<h2 data-split>{T('One filing, many states.','إيداع واحد، دول متعددة.')}</h2></div>
    <div class="org-g">{orgs}</div>
  </div>
</section>
<section class="sec-paper">
  <div class="wrap">
    <div class="sh">{kicker(T('Worldwide reach','انتشار عالمي'))}<h2 data-split>{T('Through our solid network of agents.','عبر شبكة وكلائنا المتينة.')}</h2></div>
    <div class="rgc-g">{reg}</div>
  </div>
</section>
<script>window.STERN_J={data};</script>
{cta()}'''
    return page("jurisdictions", T("Jurisdictions — STERN IP", "نطاق التغطية — ستيرن للملكية الفكرية"),
                T("STERN IP coverage across the Arab world, Africa, Asia, the EU and USA, with trademark facts per country.", "تغطية ستيرن في العالم العربي وأفريقيا وآسيا وأوروبا وأمريكا، مع معلومات العلامات التجارية لكل دولة."),
                body, "", ("map.js", "cities.js", "jmap.js"))


# ================================================================ CLIENTS
def clients():
    cards = "".join(f'<div class="clc"><span class="cw cw-{k}">{n}</span><i>{T(en, ar)}</i></div>' for n, en, ar, k in CLIENTS)
    cards += f'<a class="clc clc-x" href="{link("contact")}"><b>200<sup>+</sup></b><i>{T("Countries & areas — yours next", "دولة ومنطقة… وعلامتك التالية")}</i></a>'
    body = page_hero("clients", T("Clients", "العملاء"),
                     T("Brands that trust us with what makes them theirs.", "علامات تأتمننا على ما يجعلها مميّزة."),
                     T("We deliver excellent services efficiently to clients from more than 200 countries and areas — from global technology and automotive names to regional leaders.", "نقدّم خدماتنا بكفاءة لعملاء من أكثر من 200 دولة ومنطقة، من الأسماء العالمية في التكنولوجيا والسيارات إلى الروّاد الإقليميين."),
                     crumbs=T("Clients", "العملاء"))
    body += f'''
<section class="sec-light">
  <div class="wrap">
    <div class="clc-g">{cards}</div>
    <p class="note note-c">{T('Client names are shown as featured on STERN IP’s communications. Trademarks belong to their respective owners.','تُعرض أسماء العملاء كما وردت في مواد ستيرن التعريفية، والعلامات التجارية مملوكة لأصحابها.')}</p>
  </div>
</section>
<section class="stats sec-night"><div class="wrap st-g">{"".join(f'<div class="st"><b data-count="{v}">{v}</b><sup>{s}</sup><span>{T(en, ar)}</span></div>' for v, s, en, ar in STATS)}</div></section>
{cta()}'''
    return page("clients", T("Clients — STERN IP", "العملاء — ستيرن للملكية الفكرية"),
                T("Clients of STERN IP from more than 200 countries and areas.", "عملاء ستيرن من أكثر من 200 دولة ومنطقة."), body)


# ================================================================ INSIGHTS
MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def fdate(d):
    y, m, dd = d.split("-")
    if B.LANG == "zh":
        return f"{y}年{int(m)}月{int(dd)}日"
    return f"{int(dd)} {T(MONTHS_EN[int(m)-1], MONTHS_AR[int(m)-1])} {y}"


def insights():
    cards = ""
    for i, (d, cen, car, ten, tar, pen, par) in enumerate(NEWS):
        ps = "".join(f"<p>{p}</p>" for p in (par if B.LANG == "ar" else [T(x, x) for x in pen]))
        cards += f'''<article class="nw{' nw-f' if i == 0 else ''}"><div class="nw-m"><span class="nw-c">{T(cen, car)}</span><time datetime="{d}">{fdate(d)}</time></div>
<h3>{T(ten, tar)}</h3><details><summary>{T('Read','اقرأ')}{icon('plus', 'ac-ic')}</summary><div class="nw-b">{ps}</div></details></article>'''
    body = page_hero("insights", T("Insights", "المستجدات"),
                     T("Updates from the IP offices we work with.", "مستجدات مكاتب الملكية الفكرية التي نتعامل معها."),
                     T("Regulatory changes, office notices and practice updates across our jurisdictions.", "التغييرات التنظيمية وإشعارات المكاتب ومستجدات الممارسة في الدول التي نغطيها."),
                     crumbs=T("Insights", "المستجدات"))
    body += f'''
<section class="sec-light"><div class="wrap"><div class="nw-g">{cards}</div></div></section>
{cta()}'''
    return page("insights", T("Insights — STERN IP", "المستجدات — ستيرن للملكية الفكرية"),
                T("IP news and office updates from STERN IP.", "أخبار الملكية الفكرية ومستجدات المكاتب من ستيرن."), body)


# ================================================================ CONTACT
def contact():
    body = page_hero("contact", T("Contact", "تواصل معنا"),
                     T("Let’s protect what you’ve built.", "لنحمِ معًا ما بنيته."),
                     T("For more information, questions and comments — or a free fee quotation within 24 hours — write to us.", "لمزيد من المعلومات أو الاستفسارات أو الملاحظات، أو لطلب عرض أتعاب مجاني خلال 24 ساعة، راسلنا."),
                     crumbs=T("Contact", "تواصل معنا"))
    body += f'''
<section class="sec-light">
  <div class="wrap ct-g">
    <form class="cf" id="cf" data-mail="{EMAIL}" data-wa="{PHONE_RAW}" novalidate>
      <div class="cf-r"><label><span>{T('First name','الاسم الأول')} *</span><input name="first" required autocomplete="given-name"></label>
      <label><span>{T('Last name','اسم العائلة')} *</span><input name="last" required autocomplete="family-name"></label></div>
      <div class="cf-r"><label><span>{T('Email','البريد الإلكتروني')} *</span><input name="email" type="email" required autocomplete="email"></label>
      <label><span>{T('Subject','الموضوع')}</span><select name="subject">
        <option>{T('Fee quotation','عرض أتعاب')}</option><option>{T('Trademarks','العلامات التجارية')}</option><option>{T('Patents','براءات الاختراع')}</option><option>{T('Industrial designs','النماذج الصناعية')}</option><option>{T('Litigation','التقاضي')}</option><option>{T('Partnership / associates','شراكة / زملاء المهنة')}</option><option>{T('Other','أخرى')}</option></select></label></div>
      <label><span>{T('Comment or message','التعليق أو الرسالة')} *</span><textarea name="msg" rows="6" required></textarea></label>
      <div class="cf-b"><button class="btn btn-l" type="submit" data-via="mail"><span>{T('Send by email','أرسل بالبريد')}</span>{arrow()}</button>
      <button class="btn btn-o" type="submit" data-via="wa"><span>{T('Send on WhatsApp','أرسل عبر واتساب')}</span>{icon('wa')}</button></div>
      <p class="cf-n" id="cfn" role="status"></p>
    </form>
    <aside class="ct-a">
      <div class="ct-c">{icon('mail')}<div><span>{T('Email Mr. Mahmoud directly','راسل الأستاذ محمود مباشرة')}</span><a href="mailto:{EMAIL}">{EMAIL}</a></div></div>
      <div class="ct-c">{icon('phone')}<div><span>{T('Mobile','الجوال')}</span><a href="tel:+{PHONE_RAW}" dir="ltr">{PHONE_LOCAL}</a></div></div>
      <div class="ct-c">{icon('wa')}<div><span>WhatsApp</span><a href="https://wa.me/{PHONE_RAW}" target="_blank" rel="noopener" dir="ltr">{PHONE_INTL}</a></div></div>
      <div class="ct-c">{icon('pin')}<div><span>{T('Address','العنوان')}</span><p>{T('P.O. Box 6 El-Malek El-Saleh, Code 11559, Cairo, Egypt','ص.ب 6 الملك الصالح، الرمز البريدي 11559، القاهرة، مصر')}</p></div></div>
      <div class="ct-hq"><canvas id="hqMap"></canvas><span>{T('Cairo · 30.04° N, 31.24° E','القاهرة · 30.04° شمالًا، 31.24° شرقًا')}</span></div>
    </aside>
  </div>
</section>'''
    return page("contact", T("Contact — STERN IP", "تواصل معنا — ستيرن للملكية الفكرية"),
                T("Contact STERN IP in Cairo: mahmoud@stern-ipr.com, +20 101 337 7119.", "تواصل مع ستيرن في القاهرة: mahmoud@stern-ipr.com"), body, "", ("dots.js", "cities.js"))


def privacy():
    body = page_hero("privacy", T("Privacy policy", "سياسة الخصوصية"),
                     T("Your information, handled with care.", "معلوماتك، بعناية تامة."),
                     T("How this website treats the information you share with us.", "كيف يتعامل هذا الموقع مع المعلومات التي تشاركها معنا."),
                     crumbs=T("Privacy policy", "سياسة الخصوصية"))
    body += f'''
<section class="sec-light"><div class="wrap narrow prose">
<h3>{T('Information you send us','المعلومات التي ترسلها إلينا')}</h3>
<p>{T('This website does not store the contents of the contact form. When you submit it, your own email application or WhatsApp opens with your message addressed to STERN IP, and you decide whether to send it.','لا يحتفظ هذا الموقع بمحتوى نموذج التواصل. عند الإرسال يُفتح تطبيق البريد لديك أو واتساب برسالتك موجّهةً إلى ستيرن، ولك أن تقرّر إرسالها.')}</p>
<h3>{T('How we use it','كيف نستخدمها')}</h3>
<p>{T('We use the details you send us only to answer your enquiry, prepare fee quotations and handle the IP matters you instruct us on. We treat all client communications as confidential.','نستخدم البيانات التي ترسلها فقط للرد على استفسارك وإعداد عروض الأتعاب ومباشرة معاملات الملكية الفكرية التي توكلنا بها، ونتعامل مع جميع مراسلات العملاء بسرية تامة.')}</p>
<h3>{T('Cookies','ملفات تعريف الارتباط')}</h3>
<p>{T('The site uses no advertising or tracking cookies. Your browser may remember small preferences, such as having already seen the opening animation.','لا يستخدم الموقع ملفات ارتباط إعلانية أو للتتبّع، وقد يحتفظ متصفحك بتفضيلات بسيطة مثل مشاهدتك للحركة الافتتاحية.')}</p>
<h3>{T('Contact','التواصل')}</h3>
<p>{T('For any privacy question, write to','لأي استفسار يخص الخصوصية، راسلنا على')} <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
</div></section>'''
    return page("privacy", T("Privacy Policy — STERN IP", "سياسة الخصوصية — ستيرن للملكية الفكرية"),
                T("Privacy policy of the STERN IP website.", "سياسة الخصوصية لموقع ستيرن."), body)


PAGES = [("index", home), ("about", about), ("chairman", chairman), ("team", team), ("practice", practice),
         ("trademarks", trademarks), ("patents", patents), ("designs", designs), ("jurisdictions", jurisdictions),
         ("clients", clients), ("insights", insights), ("contact", contact), ("privacy", privacy)]
