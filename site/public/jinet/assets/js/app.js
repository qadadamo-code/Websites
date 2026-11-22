/* Jinet Agriculture Corporation — interactions */
(function(){
'use strict';

/* ================= i18n ================= */
const T={
ar:{
 'loader':'مؤسسة زراعية',
 'nav.about':'من نحن','nav.services':'خدماتنا','nav.project':'غرب المنيا','nav.values':'قيمنا','nav.contact':'تواصل معنا',
 'cta.talk':'لنبدأ الحديث',
 'hero.eyebrow':'مؤسسة زراعية · إحدى شركات حسن علام القابضة',
 'hero.title':'منظومة زراعية متكاملة، بروح مصرية أصيلة.',
 'hero.sub':'نحوّل الأراضي غير المستغلة إلى مساحات خصبة، ونبني سلسلة غذاء مستدامة من التربة حتى الأسواق.',
 'hero.cta1':'اكتشف خدماتنا','hero.cta2':'مشروع غرب المنيا','hero.badge':'فدان في غرب المنيا','hero.scroll':'مرّر للأسفل',
 'reveal.kicker':'جينيت للزراعة','reveal.title':'التميّز والتفوّق<br>في كل تفصيلة.',
 'about.label':'من نحن','about.title':'نزرع المستقبل على أرض مصر.',
 'about.p1':'جينيت للزراعة، إحدى شركات حسن علام القابضة، ملتزمة بتطوير ممارسات زراعية مستدامة وأساليب مبتكرة في إدارة الأراضي. نتخصص في استصلاح الأراضي وتحويل المساحات غير المستغلة إلى أراضٍ خصبة من خلال تحسين التربة وتطوير أنظمة الري.',
 'about.p2':'ويمتد نهجنا الشامل ليشمل التصنيع الغذائي والتوزيع المحلي والدولي، بما يسهم بشكل ملموس في الأمن الغذائي والنمو الاقتصادي والاستدامة البيئية، ونسعى من خلاله إلى تحويل استخدام الأراضي وتعزيز ممارسات زراعية حديثة وفعّالة.',
 'stat.1':'فدان نطوّرها في غرب المنيا','stat.2u':'مليون','stat.2':'فدان: المشروع القومي الذي نشارك فيه','stat.3':'عام الانطلاق تحت مظلة حسن علام القابضة','stat.4':'مجالات متكاملة من التربة حتى الأسواق',
 'svc.label':'خدماتنا','svc.title':'من استصلاح الأرض حتى وصول المنتج إلى العالم.',
 's1.t':'استصلاح الأراضي','s1.d':'تحويل الأراضي الصحراوية وغير المستغلة إلى مساحات زراعية منتجة، بخطط تطوير متكاملة وأساليب إدارة مبتكرة.',
 's2.t':'تحسين التربة','s2.d':'رفع خصوبة التربة ومعالجتها لتهيئة بيئة نمو مثالية، وتحويل الأرض الفقيرة إلى أرض قادرة على العطاء.',
 's3.t':'تطوير أنظمة الري','s3.d':'تصميم وتطوير شبكات ري حديثة تضمن كفاءة استخدام المياه وتحافظ على الموارد الطبيعية.',
 's4.t':'الزراعة الحديثة','s4.d':'زراعة محاصيل متنوعة بتقنيات حديثة وممارسات فعّالة، لتلبية احتياجات السوق المحلي وفتح آفاق التصدير.',
 's5.t':'التصنيع الغذائي','s5.d':'بنية تحتية متطورة لما بعد الحصاد، لإنتاج منتجات غذائية ذات قيمة مضافة بمعايير تنافسية عالمية.',
 's6.t':'التوزيع المحلي والدولي','s6.d':'سلاسل توزيع وتصدير تنقل منتجاتنا من الحقل إلى الأسواق المحلية والعالمية بكفاءة وموثوقية.',
 'marquee':['الاستدامة','الجودة الفائقة','الأصالة','الأمن الغذائي','من التربة إلى الأسواق'],
 'proj.label':'مشروعنا','proj.mapLabel':'غرب المنيا','proj.cairo':'القاهرة',
 'proj.title':'14,100 فدان في امتداد غرب المنيا.',
 'proj.p1':'وقّعت جينيت عقد استثمار مع شركة تنمية الريف المصري الجديد لتطوير مشروع زراعي متكامل على مساحة 14,100 فدان، ضمن المشروع القومي لاستصلاح وتنمية 1.5 مليون فدان.',
 'proj.l1':'محاصيل متنوعة تلبي احتياجات السوق المحلي وتوسّع فرص التصدير',
 'proj.l2':'تقنيات زراعة حديثة وممارسات تحافظ على الموارد الطبيعية',
 'proj.l3':'استثمار في بنية تحتية لما بعد الحصاد والتصنيع الغذائي',
 'proj.l4':'خلق فرص عمل ودعم الاقتصاد الوطني تماشيًا مع رؤية مصر 2030',
 'piv.k':'من الصحراء إلى الخضرة','piv.u':'فدان','piv.d':'مرّر لتشاهد كيف تتحول الأرض: كل دائرة ري محوري خطوة نحو أرض منتجة.',
 'val.label':'قيمنا','val.title':'ملتزمون بالاستدامة، والجودة الفائقة، والأصالة.',
 'v1.t':'الاستدامة','v1.d':'ممارسات زراعية تحمي الموارد الطبيعية وتحافظ على الأرض والمياه للأجيال القادمة.',
 'v2.t':'الجودة الفائقة','v2.d':'منتجات غذائية بمعايير تنافسية عالمية، من الحقل وحتى التعبئة والتوزيع.',
 'v3.t':'الأصالة','v3.d':'جذور مصرية راسخة، ورؤية تمتد بخبرة مجموعة حسن علام القابضة.',
 'imp.label':'أثرنا','imp.title':'من التربة إلى المائدة، أثر يمتد للوطن.',
 'imp.1t':'الأمن الغذائي','imp.1d':'زيادة الإنتاج الزراعي وتقليل الاعتماد على الاستيراد.',
 'imp.2t':'النمو الاقتصادي','imp.2d':'صادرات محاصيل عالية القيمة وصناعات غذائية بقيمة مضافة.',
 'imp.3t':'الاستدامة البيئية','imp.3d':'إدارة مسؤولة للأرض والمياه، وتحويل الصحراء إلى مساحات خضراء.',
 'grp.k':'جزء من','grp.name':'مجموعة حسن علام القابضة',
 'grp.d':'تنطلق جينيت بخبرة واحدة من أكبر المجموعات الصناعية والتنموية في مصر والمنطقة، لتضيف إلى التزامها بتنمية المجتمعات بُعدًا جديدًا: الزراعة والأمن الغذائي.',
 'ct.label':'تواصل معنا','ct.title':'لنزرع شراكة تثمر.','ct.d':'للشراكات، والتوريد، والتصدير، وفرص العمل، يسعدنا تواصلكم.',
 'ct.addrK':'العنوان','ct.addr':'المنطقة الصناعية، قطعة 5، مساكن شيراتون، مصر الجديدة، القاهرة، مصر','ct.telK':'هاتف','ct.faxK':'فاكس',
 'f.name':'الاسم بالكامل','f.company':'الشركة','f.email':'البريد الإلكتروني','f.phone':'رقم الهاتف',
 'f.t1':'شراكة','f.t2':'توريد','f.t3':'تصدير','f.t4':'وظائف','f.t5':'أخرى','f.msg':'رسالتك','f.send':'إرسال الرسالة',
 'f.okT':'شكرًا لتواصلك!','f.okD':'تم استلام رسالتك، وسيتواصل معك فريقنا قريبًا.',
 'ftr.tag':'ملتزمون بالاستدامة، والجودة الفائقة، والأصالة.','ftr.copy':'© 2026 جينيت للزراعة. إحدى شركات حسن علام القابضة.','ftr.by':'تصميم وتطوير Planet',
 'title':'جينيت للزراعة | Jinet Agriculture Corporation'
},
en:{
 'loader':'Agriculture Corporation',
 'nav.about':'About','nav.services':'Services','nav.project':'West Minya','nav.values':'Values','nav.contact':'Contact',
 'cta.talk':"Let's talk",
 'hero.eyebrow':'Agriculture Corporation · A Hassan Allam Holding company',
 'hero.title':'A fully fledged operation across the Egyptian culture.',
 'hero.sub':'We transform underutilized land into fertile areas and build a sustainable food chain, from the soil to the market.',
 'hero.cta1':'Explore our services','hero.cta2':'West Minya project','hero.badge':'feddans in West Minya','hero.scroll':'Scroll',
 'reveal.kicker':'Jinet Agriculture','reveal.title':'Exemplifying excellence<br>and superiority in every aspect.',
 'about.label':'About Jinet','about.title':'Growing the future on Egyptian land.',
 'about.p1':'Jinet Agriculture Corporation, a subsidiary of Hassan Allam Holding, is committed to advancing sustainable agricultural practices and innovative land management. We specialize in land reclamation, transforming underutilized land into fertile areas through soil enhancement and irrigation development.',
 'about.p2':'Our comprehensive approach includes food processing and local and international distribution, significantly contributing to food security, economic growth and environmental sustainability. Through it, we aim to transform land use and promote modern, efficient farming practices.',
 'stat.1':'feddans under development in West Minya','stat.2u':'million','stat.2':'feddans: the national project we are part of','stat.3':'launched under Hassan Allam Holding','stat.4':'integrated fields, from soil to market',
 'svc.label':'Our services','svc.title':'From reclaiming the land to delivering produce to the world.',
 's1.t':'Land Reclamation','s1.d':'Turning desert and underutilized land into productive farmland, through integrated development plans and innovative land management.',
 's2.t':'Soil Enhancement','s2.d':'Treating and enriching the soil to create ideal growing conditions, turning poor land into land that gives.',
 's3.t':'Irrigation Development','s3.d':'Designing and developing modern irrigation networks that use water efficiently and protect natural resources.',
 's4.t':'Modern Farming','s4.d':'Cultivating a diverse range of crops with modern, efficient practices to meet local demand and expand export opportunities.',
 's5.t':'Food Processing','s5.d':'Advanced post-harvest infrastructure producing value-added food products that compete globally.',
 's6.t':'Local & International Distribution','s6.d':'Distribution and export chains that move our produce from the field to local and global markets, efficiently and reliably.',
 'marquee':['Sustainability','Premium Quality','Authenticity','Food Security','From soil to market'],
 'proj.label':'Our project','proj.mapLabel':'West Minya','proj.cairo':'Cairo',
 'proj.title':'14,100 feddans in the West Minya extension.',
 'proj.p1':'Jinet signed an investment contract with the Egyptian Countryside Development Company (El Reef El Masry) to develop an integrated agricultural project on 14,100 feddans, part of the national 1.5 million-feddan reclamation and development initiative.',
 'proj.l1':'A diverse range of crops for local market demand and expanded exports',
 'proj.l2':'Modern cultivation techniques that protect natural resources',
 'proj.l3':'Investment in post-harvest and food processing infrastructure',
 'proj.l4':'New jobs and support for the national economy, in line with Egypt Vision 2030',
 'piv.k':'From desert to green','piv.u':'feddans','piv.d':'Scroll to watch the land transform: every center-pivot circle is a step towards productive land.',
 'val.label':'Our values','val.title':'Committed to Sustainability, Premium Quality, and Authenticity.',
 'v1.t':'Sustainability','v1.d':'Farming practices that protect natural resources, preserving land and water for generations to come.',
 'v2.t':'Premium Quality','v2.d':'Globally competitive food products, from the field through packing and distribution.',
 'v3.t':'Authenticity','v3.d':'Deep Egyptian roots, and a vision carried by the experience of Hassan Allam Holding.',
 'imp.label':'Our impact','imp.title':'From soil to table, an impact that reaches the nation.',
 'imp.1t':'Food Security','imp.1d':'Higher agricultural output and less dependence on imports.',
 'imp.2t':'Economic Growth','imp.2d':'High-value crop exports and value-added food industries.',
 'imp.3t':'Environmental Sustainability','imp.3d':'Responsible land and water management, turning desert into green.',
 'grp.k':'Part of','grp.name':'Hassan Allam Holding',
 'grp.d':"Jinet draws on the experience of one of Egypt's and the region's leading industrial and development groups, adding a new dimension to its commitment to developing communities: agriculture and food security.",
 'ct.label':'Contact','ct.title':"Let's grow a partnership.",'ct.d':'For partnerships, supply, export and careers, we would be glad to hear from you.',
 'ct.addrK':'Address','ct.addr':'Industrial Zone, Lot 5, Sheraton Heliopolis Housing, Cairo, Egypt','ct.telK':'Telephone','ct.faxK':'Fax',
 'f.name':'Full name','f.company':'Company','f.email':'Email','f.phone':'Phone number',
 'f.t1':'Partnership','f.t2':'Supply','f.t3':'Export','f.t4':'Careers','f.t5':'Other','f.msg':'Your message','f.send':'Send message',
 'f.okT':'Thank you!','f.okD':'Your message has been received. Our team will be in touch shortly.',
 'ftr.tag':'Committed to Sustainability, Premium Quality, and Authenticity.','ftr.copy':'© 2026 Jinet Agriculture Corporation. A Hassan Allam Holding company.','ftr.by':'Designed & developed by Planet',
 'title':'Jinet Agriculture Corporation | جينيت للزراعة'
}};

const qs=new URLSearchParams(location.search);
let lang=qs.get('lang');
try{ if(!lang) lang=localStorage.getItem('jinet-lang'); }catch(e){}
if(lang!=='en') lang='ar';
try{ localStorage.setItem('jinet-lang',lang); }catch(e){}
const L=T[lang], RTL=lang==='ar', DIR=RTL?1:-1;
document.documentElement.lang=lang;
document.documentElement.dir=RTL?'rtl':'ltr';
document.title=L.title;
document.querySelectorAll('[data-i18n]').forEach(el=>{const v=L[el.dataset.i18n]; if(typeof v==='string') el.innerHTML=v;});
document.querySelector('#langBtn span').textContent=RTL?'EN':'ع';
document.getElementById('langBtn').addEventListener('click',()=>{
  const n=RTL?'en':'ar'; try{localStorage.setItem('jinet-lang',n);}catch(e){}
  const u=new URL(location.href); u.searchParams.set('lang',n); location.href=u.toString();
});

/* ================= LOGO (vector, from the brand manual) ================= */
const LG=window.JINET_LOGO, NS='http://www.w3.org/2000/svg';
const P=LG.parts;
function svgEl(vb,cls){const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox',vb);if(cls)s.setAttribute('class',cls);return s;}
function addPaths(svg,arr,cls){arr.forEach(d=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);if(cls)p.setAttribute('class',cls);svg.appendChild(p);});}
const WORD=['J','i','idot','n','e','t','reg'];
function wordmark(cls,split){
  const s=svgEl(`0 0 ${LG.W} ${LG.H}`,cls);
  WORD.forEach(k=>{ if(split){const g=document.createElementNS(NS,'g');g.setAttribute('class','lt lt-'+k);addPaths(g,P[k]);s.appendChild(g);} else addPaths(s,P[k]); });
  return s;
}
document.querySelector('.logo-en').appendChild(wordmark('',false));
const ar=svgEl(`0 0 ${LG.ar.w} ${LG.ar.h}`); addPaths(ar,LG.ar.d); document.querySelector('.logo-ar').appendChild(ar);
// loader
const lm=document.getElementById('loaderMark');
WORD.forEach(k=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','lt lt-'+k);addPaths(g,P[k]);lm.appendChild(g);});
// footer giant wordmark
document.getElementById('ftrMark').appendChild(wordmark('',true));
// hero icon clip (J + bracket, without ®)
const iconD=[LG.icon.d[0],LG.icon.d[3]];
const clip=document.getElementById('iconClip'); addPaths(clip,iconD);
// reveal mask icon centred in 1600x900
const rev=document.getElementById('revIcon');
const iw=LG.icon.w, ih=LG.icon.h, rs=420/ih;
rev.setAttribute('transform',`translate(${800-iw*rs/2} ${450-ih*rs/2}) scale(${rs})`);
const revInner=document.createElementNS(NS,'g'); addPaths(revInner,iconD); rev.appendChild(revInner);

/* ================= split words ================= */
document.querySelectorAll('.split').forEach(el=>{
  const nodes=[...el.childNodes]; el.innerHTML='';
  nodes.forEach(n=>{
    if(n.nodeType===3){ n.textContent.split(/(\s+)/).forEach(w=>{ if(!w) return; if(/^\s+$/.test(w)){el.appendChild(document.createTextNode(' '));return;}
      const o=document.createElement('span');o.className='w';const i=document.createElement('span');i.textContent=w;o.appendChild(i);el.appendChild(o);});}
    else el.appendChild(n);
  });
});

/* ================= generated decorations ================= */
// soil grains
const grains=document.querySelector('.art-soil .grains');
for(let i=0;i<46;i++){
  const a=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*58;
  const c=document.createElementNS(NS,'circle');
  c.setAttribute('cx',(100+Math.cos(a)*r).toFixed(1)); c.setAttribute('cy',(100+Math.sin(a)*r*.8).toFixed(1));
  c.setAttribute('r',(3+Math.random()*5).toFixed(1));
  c.style.transform=`translate(${(Math.random()-.5)*160}px,${(Math.random()-.5)*160}px)`;
  c.style.transitionDelay=(Math.random()*.4).toFixed(2)+'s';
  if(i%5===0) c.style.fill='#E1E92F';
  grains.appendChild(c);
}
// distribution traveller
const trav=document.querySelector('.art-dist .trav');
const am=document.createElementNS(NS,'animateMotion'); am.setAttribute('dur','3s'); am.setAttribute('repeatCount','indefinite'); am.setAttribute('path','M30 150C60 40 140 40 170 150'); trav.appendChild(am);
// carrots
const cg=document.querySelector('.carrot-grid'); for(let i=0;i<9;i++) cg.appendChild(document.createElement('i'));
// marquee
const mq=document.getElementById('marquee');
let mqHtml=''; for(let r=0;r<4;r++) L.marquee.forEach(t=>mqHtml+=`<span>${t}</span>`); mq.innerHTML=mqHtml;
// pivots
const pivWrap=document.getElementById('pivots'); const PV=48; const pvs=[];
for(let i=0;i<PV;i++){const d=document.createElement('i');d.className='pv';pivWrap.appendChild(d);pvs.push(d);}
const pvOrder=pvs.map((_,i)=>i).sort(()=>Math.random()-.5);

/* ================= Egypt map (simplified, lon/lat projected) ================= */
const pj=(lon,lat)=>[((lon-24.6)*40+10).toFixed(1),((31.9-lat)*40+10).toFixed(1)];
const land=[[25,31.62],[25,22],[36.9,22],[36.3,22.9],[35.65,23.9],[35.45,24.6],[34.9,25.5],[34.3,26.4],[33.9,27.2],[33.55,27.75],[33.2,28.3],[32.75,29.1],[32.55,29.97],[32.75,29.6],[33.1,29.05],[33.6,28.35],[34.27,27.73],[34.45,28.1],[34.75,28.9],[34.9,29.5],[34.22,31.32],[33.6,31.12],[32.6,31.07],[32.3,31.27],[31.9,31.53],[31.4,31.55],[30.8,31.5],[30.35,31.47],[29.9,31.2],[29.0,30.9],[28.0,31.08],[27.25,31.35],[26.0,31.55]];
document.getElementById('egLand').setAttribute('d','M'+land.map(p=>pj(...p).join(' ')).join('L')+'Z');
const nile=[[32.9,22.4],[32.9,24.1],[32.75,25.2],[32.65,25.7],[32.3,26.1],[31.7,26.6],[31.2,27.2],[30.85,27.7],[30.75,28.1],[30.9,28.6],[31.1,29.07],[31.2,29.6],[31.24,30.04],[31.0,30.6],[30.6,31.1],[30.4,31.45]];
document.getElementById('egNile').setAttribute('d','M'+nile.map(p=>pj(...p).join(' ')).join('L'));
const [mx,my]=pj(30.1,28.15); document.getElementById('egMinya').setAttribute('transform',`translate(${mx} ${my})`);
const lab=document.getElementById('egLabel'); lab.setAttribute('transform',`translate(${mx} ${my})${RTL?' scale(-1 1)':''}`);
if(RTL){ const t=lab.querySelector('text'); t.setAttribute('transform','scale(-1 1)'); t.setAttribute('x','-150'); t.setAttribute('text-anchor','start'); }
const [cx,cy]=pj(31.24,30.04); const cd=document.createElementNS(NS,'circle'); cd.setAttribute('cx',cx); cd.setAttribute('cy',cy); cd.setAttribute('r',4.5); cd.setAttribute('fill','#215834'); document.getElementById('egypt').insertBefore(cd,document.getElementById('egMinya')); const cairo=document.getElementById('egCairo'); cairo.setAttribute('x',+cx+12); cairo.setAttribute('y',+cy+5); cairo.setAttribute('direction','ltr'); cairo.style.direction='ltr';

/* ================= header / menu ================= */
const hdr=document.getElementById('hdr');
document.getElementById('burger').addEventListener('click',()=>document.body.classList.toggle('menu-open'));
document.querySelectorAll('.hdr-nav a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu-open')));

/* ================= form ================= */
const form=document.getElementById('ctForm');
form.addEventListener('submit',e=>{
  e.preventDefault(); let ok=true;
  form.querySelectorAll('[required]').forEach(f=>{const bad=!f.value.trim()||(f.type==='email'&&!/^\S+@\S+\.\S+$/.test(f.value)); f.closest('.f').classList.toggle('err',bad); if(bad) ok=false;});
  if(ok) form.classList.add('sent');
});

/* ================= motion ================= */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=()=>innerWidth<=760;
gsap.registerPlugin(ScrollTrigger);

let lenis=null;
if(!reduce && window.Lenis){
  lenis=new Lenis({duration:1.15,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const id=a.getAttribute('href'); if(id.length<2) return; const t=document.querySelector(id); if(!t) return;
  e.preventDefault(); lenis?lenis.scrollTo(t,{offset:id==='#top'?0:-10,duration:1.6}):t.scrollIntoView({behavior:'smooth'});
}));

/* ---- loader ---- */
function runLoader(done){
  const num=document.getElementById('loaderNum');
  const o={v:0};
  const tl=gsap.timeline({onComplete:done});
  gsap.set('#loaderMark .lt',{opacity:0});
  gsap.set('#loaderMark .lt-J',{xPercent:-40*DIR*-1});
  tl.to(o,{v:100,duration:2.2,ease:'power2.inOut',onUpdate:()=>num.textContent=Math.round(o.v)},0)
    .to('.lb',{scaleY:1,duration:.8,ease:'expo.out'},.1)
    .fromTo('#loaderMark .lt-J',{opacity:0,y:60},{opacity:1,y:0,xPercent:0,duration:.9,ease:'expo.out'},.25)
    .fromTo('#loaderMark .lt-i,#loaderMark .lt-n,#loaderMark .lt-e',{opacity:0,y:60},{opacity:1,y:0,duration:.9,stagger:.09,ease:'expo.out'},.4)
    .fromTo('#loaderMark .lt-t',{opacity:0,x:40},{opacity:1,x:0,duration:.9,ease:'expo.out'},.65)
    .fromTo('#loaderMark .lt-idot',{opacity:0,y:-120},{opacity:1,y:0,duration:.8,ease:'bounce.out'},1.0)
    .fromTo('#loaderMark .lt-reg',{opacity:0,scale:0,transformOrigin:'50% 50%'},{opacity:1,scale:1,duration:.4},1.4)
    .to('.lb-l',{x:()=>-innerWidth*.6,duration:1,ease:'expo.inOut'},2.35)
    .to('.lb-r',{x:()=>innerWidth*.6,duration:1,ease:'expo.inOut'},2.35)
    .to('#loaderMark',{scale:.6,opacity:0,duration:.7,ease:'expo.in'},2.3)
    .to('.loader-meta',{opacity:0,duration:.4},2.3)
    .to('#loader',{clipPath:'inset(0 0 100% 0)',duration:1,ease:'expo.inOut'},2.75);
}

function intro(){
  document.body.classList.remove('is-loading');
  document.getElementById('loader').style.display='none';
  lenis&&lenis.start();
  const tl=gsap.timeline();
  tl.from('.hdr',{y:-40,opacity:0,duration:1,ease:'expo.out'},0)
    .from('.frame span',{scaleY:0,duration:1.4,ease:'expo.inOut'},0)
    .from('.hero .eyebrow',{y:20,opacity:0,duration:.8,ease:'expo.out'},.1)
    .from('.hero-title .w>span',{yPercent:110,duration:1.1,stagger:.06,ease:'expo.out'},.15)
    .from('.hero-sub,.hero-ctas',{y:30,opacity:0,duration:1,stagger:.12,ease:'expo.out'},.55)
    .from('.hero-icon',{scale:.6,opacity:0,duration:1.4,ease:'expo.out',transformOrigin:'50% 60%'},.2)
    .from('.hero-icon-img',{scale:1.6,duration:2.2,ease:'expo.out'},.2)
    .from('.veg',{scale:0,rotate:-25,opacity:0,duration:1.2,stagger:.12,ease:'back.out(1.6)'},.6)
    .from('.hero-badge',{x:-30*DIR*-1,opacity:0,duration:.9,ease:'expo.out'},1)
    .from('.sh',{scale:0,duration:.9,stagger:.08,ease:'back.out(2)'},.7)
    .from('.sh-dots,.scroll-cue',{opacity:0,duration:1},1);
}

if(reduce){ intro(); } else { runLoader(intro); }

/* ---- hero mouse parallax ---- */
if(matchMedia('(hover:hover)').matches && !reduce){
  const vegs=[...document.querySelectorAll('.veg')];
  const shapes=document.querySelector('.hero-shapes');
  window.addEventListener('mousemove',e=>{
    const x=e.clientX/innerWidth-.5, y=e.clientY/innerHeight-.5;
    vegs.forEach(v=>{const d=+v.dataset.depth; gsap.to(v,{x:x*60*d,y:y*50*d,rotate:x*12*d,duration:1.2,ease:'power3.out'});});
    gsap.to(shapes,{x:x*-30,y:y*-20,duration:1.4,ease:'power3.out'});
    gsap.to('.hero-icon-img',{x:x*-14,y:y*-10,duration:1.4,ease:'power3.out'});
  });
}
// hero scroll-out
gsap.to('.hero-inner',{yPercent:-12,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.veg-1',{y:-160,rotate:20,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.veg-3',{y:-90,rotate:-15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

/* ---- icon zoom reveal ---- */
const revTl=gsap.timeline({scrollTrigger:{trigger:'.reveal',start:'top top',end:'bottom bottom',scrub:.6}});
revTl.to(revInner,{scale:40,transformOrigin:'32% 30%',ease:'power2.in',duration:1},0)
     .to('#revealImg',{scale:1,ease:'none',duration:1.3},0)
     .to('.reveal-text',{opacity:1,y:0,duration:.3},.85)
     .from('.reveal-title',{y:60,duration:.4},.85);

/* ---- section themes: header + frame colours ---- */
const THEMES={green:{fg:'#E1E92F',bg:'rgba(33,88,52,.88)'},beige:{fg:'#215834',bg:'rgba(208,205,202,.88)'},lime:{fg:'#215834',bg:'rgba(225,233,47,.9)'},brown:{fg:'#E1E92F',bg:'rgba(104,66,51,.9)'},dark:{fg:'#E1E92F',bg:'rgba(0,0,0,.72)'}};
function setTheme(t){const th=THEMES[t]||THEMES.green; document.documentElement.style.setProperty('--fg',th.fg); document.documentElement.style.setProperty('--frame',th.fg); hdr.style.setProperty('--hbg',th.bg);}
document.querySelectorAll('[data-theme]').forEach(sec=>{
  ScrollTrigger.create({trigger:sec,start:'top 60px',end:'bottom 60px',onEnter:()=>setTheme(sec.dataset.theme),onEnterBack:()=>setTheme(sec.dataset.theme)});
});
setTheme('green');
// nav active
['about','services','project','values','contact'].forEach(id=>{
  const a=document.querySelector(`.hdr-nav a[href="#${id}"]`), s=document.getElementById(id);
  ScrollTrigger.create({trigger:s,start:'top 50%',end:'bottom 50%',onToggle:self=>a.classList.toggle('on',self.isActive)});
});
// header hide/show
let lastY=0;
ScrollTrigger.create({start:0,end:'max',onUpdate:self=>{
  const y=self.scroll(); hdr.classList.toggle('solid',y>80);
  if(!document.body.classList.contains('menu-open')) hdr.classList.toggle('hide',y>lastY && y>400);
  lastY=y;
}});

/* ---- headings reveal ---- */
document.querySelectorAll('.split:not(.hero-title)').forEach(el=>{
  gsap.from(el.querySelectorAll('.w>span'),{yPercent:110,duration:1.1,stagger:.05,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%'}});
});
gsap.utils.toArray('.sec-head').forEach(el=>gsap.from(el.children,{y:20,opacity:0,duration:.8,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}}));
gsap.utils.toArray('.about-copy p,.proj-copy .lead,.proj-list li,.ct-info>p,.ct-list li,.group-d,.group-k,.pivots-copy>*').forEach(el=>{
  gsap.from(el,{y:36,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 90%'}});
});

/* ---- counters ---- */
document.querySelectorAll('.count').forEach(el=>{
  const to=+el.dataset.to, dec=+(el.dataset.dec||0), plain=el.dataset.plain;
  const fmt=v=>plain?String(Math.round(v)):v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
  el.textContent=fmt(0);
  ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>{
    const o={v:plain?to-40:0}; gsap.to(o,{v:to,duration:2.2,ease:'power3.out',onUpdate:()=>el.textContent=fmt(o.v)});
  }});
});
gsap.from('.stat',{y:40,opacity:0,duration:1,stagger:.1,ease:'expo.out',scrollTrigger:{trigger:'.stats',start:'top 88%'}});

/* ---- services horizontal scroll ---- */
const track=document.getElementById('svcTrack');
const cards=[...track.children];
const mm=gsap.matchMedia();
mm.add('(min-width: 761px)',()=>{
  const dist=()=>Math.max(0,track.scrollWidth-innerWidth);
  const tw=gsap.to(track,{x:()=>DIR*dist(),ease:'none',scrollTrigger:{trigger:'.services',start:'top top',end:()=>'+='+dist(),pin:true,scrub:.8,invalidateOnRefresh:true,anticipatePin:1,
    onUpdate:self=>{gsap.set('#svcBar',{scaleX:self.progress});}}});
  return ()=>{};
});
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('on'); }),{threshold:.55});
const io2=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); }),{threshold:.12});
cards.forEach(c=>{io.observe(c);io2.observe(c);});

/* ---- marquee ---- */
const mqW=()=>mq.scrollWidth/4;
gsap.fromTo(mq,{x:0},{x:()=>DIR*mqW(),duration:26,ease:'none',repeat:-1});
gsap.to('.marquee',{skewX:0,scrollTrigger:{trigger:'.marquee',start:'top bottom',end:'bottom top',scrub:true,onUpdate:s=>gsap.to(mq,{skewX:s.getVelocity()/-400,duration:.4,overwrite:'auto'})}});

/* ---- map draw ---- */
['#egLand','#egNile'].forEach(sel=>{const p=document.querySelector(sel); const l=p.getTotalLength(); gsap.set(p,{strokeDasharray:l,strokeDashoffset:l});});
const mapTl=gsap.timeline({scrollTrigger:{trigger:'.proj-map',start:'top 78%'}});
mapTl.to('#egLand',{strokeDashoffset:0,duration:2.2,ease:'power2.inOut'})
     .from('#egLand',{fillOpacity:0,duration:1},1.2)
     .to('#egNile',{strokeDashoffset:0,duration:1.6,ease:'power2.inOut'},.9)
     .from('#egMinya',{scale:0,transformOrigin:'50% 50%',duration:.7,ease:'back.out(3)'},2)
     .from('#egLabel path',{opacity:0,duration:.5},2.3)
     .from('#egLabel text,#egCairo',{opacity:0,y:10,duration:.6},2.4);

/* ---- pivots: desert to green ---- */
const pivCount=document.getElementById('pivCount');
ScrollTrigger.create({trigger:'.pivots-wrap',start:'top 75%',end:'bottom 45%',scrub:true,onUpdate:s=>{
  const n=Math.round(s.progress*PV);
  pvOrder.forEach((idx,k)=>pvs[idx].classList.toggle('g',k<n));
  pivCount.textContent=Math.round(s.progress*14100).toLocaleString('en-US');
}});

/* ---- values ---- */
gsap.from('.values-circles i',{scale:0,duration:1.4,stagger:.15,ease:'elastic.out(1,.6)',scrollTrigger:{trigger:'.values',start:'top 70%'}});
gsap.to('.values-circles',{y:-120,ease:'none',scrollTrigger:{trigger:'.values',start:'top bottom',end:'bottom top',scrub:true}});
gsap.from('.val',{y:70,opacity:0,duration:1.1,stagger:.12,ease:'expo.out',scrollTrigger:{trigger:'.values-grid',start:'top 85%'}});

/* ---- mosaic ---- */
gsap.utils.toArray('.tile').forEach((t,i)=>{
  gsap.fromTo(t,{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:1.2,delay:(i%4)*.08,ease:'expo.inOut',scrollTrigger:{trigger:t,start:'top 92%'}});
});
gsap.utils.toArray('.tile [data-par]').forEach(img=>{
  gsap.fromTo(img,{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
});
gsap.from('.carrot-grid i',{scaleY:0,transformOrigin:'50% 0',duration:.8,stagger:.06,ease:'expo.out',scrollTrigger:{trigger:'.t-carrots',start:'top 85%'}});
gsap.from('.t-red i',{scale:0,duration:1,stagger:.12,ease:'back.out(2)',scrollTrigger:{trigger:'.t-red',start:'top 90%'}});

/* ---- group ---- */
gsap.fromTo('.group',{backgroundColor:'#000'},{backgroundColor:'#0e140f',scrollTrigger:{trigger:'.group',start:'top bottom',end:'bottom top',scrub:true}});

/* ---- footer mark ---- */
gsap.from('#ftrMark .lt:not(.lt-idot)',{yPercent:100,opacity:0,duration:1.2,stagger:.07,ease:'expo.out',scrollTrigger:{trigger:'#ftrMark',start:'top 92%'}});
gsap.from('#ftrMark .lt-idot',{y:-200,opacity:0,duration:1.2,ease:'bounce.out',scrollTrigger:{trigger:'#ftrMark',start:'top 85%'}});

/* ---- cursor ---- */
const cur=document.getElementById('cursor');
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  const xTo=gsap.quickTo(cur,'x',{duration:.35,ease:'power3'}), yTo=gsap.quickTo(cur,'y',{duration:.35,ease:'power3'});
  window.addEventListener('mousemove',e=>{xTo(e.clientX);yTo(e.clientY);cur.classList.add('live');});
  document.addEventListener('mouseover',e=>cur.classList.toggle('hov',!!e.target.closest('a,button,label,input,textarea')));
  window.addEventListener('mousedown',()=>cur.classList.add('down'));
  window.addEventListener('mouseup',()=>cur.classList.remove('down'));
  // magnetic buttons
  document.querySelectorAll('.magnetic').forEach(b=>{
    b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect(); gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.5,ease:'power3.out'});});
    b.addEventListener('mouseleave',()=>gsap.to(b,{x:0,y:0,duration:.8,ease:'elastic.out(1,.4)'}));
  });
}

window.addEventListener('load',()=>ScrollTrigger.refresh());
document.fonts&&document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
