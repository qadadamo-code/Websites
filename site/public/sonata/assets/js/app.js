/* Sonata Social House – app */
(function(){
'use strict';
const D = window.SONATA, C = D.config;
const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const html = document.documentElement;
const store = { get(k){try{return localStorage.getItem(k)}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,v)}catch(e){}} };
const weak = (navigator.hardwareConcurrency||4) <= 4 || matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- i18n ---------- */
const T = {
  nav_story:['الحكاية','Story'], nav_moves:['التجربة','Experience'], nav_menu:['المنيو','Menu'], nav_amb:['الأجواء','Ambience'], nav_branches:['الفروع','Locations'],
  reserve:['احجز طاولة','Reserve'], see_menu:['استعرض المنيو','View the menu'],
  hero_eye:['مطبخ عالمي · القاهرة','International cuisine · Cairo'],
  hero_lead:['كل طبق مقطوعة، وكل زيارة حفلة صغيرة. من فطور الصباح حتى آخر الليل.','Every plate a composition, every visit a small concert. From morning coffee to late night.'],
  m1a:['من الفطور','Breakfast'], m1b:['حتى آخر الليل','to late night'], m2a:['مطبخ عالمي','International'], m2b:['بروح قاهرية','with a Cairo soul'], m3a:['قهوة مختصة','Specialty coffee'], m3b:['وموكتيلز توقيع','& signature mocktails'],
  st_eye:['الافتتاحية','Overture'], st_h:['مطبخ من حول العالم، مؤلَّف على إيقاع واحد.','A kitchen from around the world, composed in one rhythm.'],
  st_p1:['سوناتا سوشيال هاوس بيت اجتماعي في قلب القاهرة: مكان تبدأ فيه يومك بفنجان قهوة مختصة، وتكمل فيه غداء عمل، وتنهيه بعشاء مع من تحب.','Sonata Social House is a social home in the heart of Cairo: start your day with specialty coffee, carry on over a business lunch, and close it with dinner among the people you love.'],
  st_p2:['نختار مكوناتنا بعناية، ونقدّم أطباقًا عالمية من إيطاليا إلى آسيا بلمسة سوناتا، في أجواء راقية وهادئة تليق بكل مناسبة.','We source with care and serve international plates, from Italy to Asia, with a Sonata touch, in a calm, refined room made for every occasion.'],
  n1:['الصباح','Morning'], n1s:['فطور وقهوة','Breakfast & coffee'], n2:['الظهيرة','Midday'], n2s:['غداء وعمل','Lunch & meetings'], n3:['المساء','Evening'], n3s:['عشاء ولقاءات','Dinner & gatherings'], n4:['الختام','Finale'], n4s:['حلو وموكتيلز','Sweets & mocktails'],
  mv_eye:['أربع حركات','Four movements'], mv_h:['يومك في سوناتا، كمقطوعة من أربع حركات.','Your day at Sonata, a piece in four movements.'],
  mv1:['صباح بإيقاع خفيف','A light-footed morning'], mv1p:['بيض بنديكت، ساوردو بالأفوكادو، كرواسون طازج وفنجان قهوة يبدأ اليوم صح.','Eggs Benedict, avocado sourdough, fresh croissants and a cup that starts the day right.'],
  mv2:['غداء وعشاء على مهل','Lunch & dinner, unhurried'], mv2p:['ستيك ريب آي، سالمون بالزبدة والليمون، باستا بالترافل وأطباق من مطابخ العالم.','Ribeye, lemon-butter salmon, truffle pasta and plates from kitchens around the world.'],
  mv3:['لحظة حلوة','A sweet interlude'], mv3p:['فوندان الشوكولاتة الذائبة، تشيز كيك سان سيباستيان وتيراميسو على الأصول.','Molten chocolate fondant, San Sebastián cheesecake and a proper tiramisu.'],
  mv4:['ختام يليق بالسهرة','A finale worth the evening'], mv4p:['موكتيلز توقيع سوناتا ومشروبات مبتكرة على البار حتى آخر الليل.','Sonata signature mocktails and crafted drinks at the bar until late.'],
  sg_eye:['أطباق التوقيع','Signatures'], sg_h:['اختيارات الشيف','Chef’s selection'],
  mn_eye:['المنيو','The menu'], mn_h:['النوتة الكاملة','The full score'], mn_p:['الأسعار بالجنيه المصري وتشمل الضريبة. اسأل فريقنا عن أطباق اليوم.','Prices in EGP, taxes included. Ask our team about today’s specials.'],
  search:['ابحث في المنيو','Search the menu'], lg_sig:['توقيع سوناتا','Sonata signature'], lg_veg:['نباتي','Vegetarian'], lg_new:['جديد','New'], all:['الكل','All'], none:['لا توجد نتائج','No matching dishes'],
  am_eye:['الأجواء','Ambience'], am_h:['مكان يليق بلقاءاتك','A room worthy of your gatherings'], am1:['الصالة الرئيسية','Main hall'], am2:['التراس الخارجي','The terrace'], am3:['بار القهوة','Coffee bar'], am4:['مناسبات خاصة','Private dining'],
  ev_h:['مناسبات خاصة وفعاليات','Private events'], ev_p:['أعياد ميلاد، اجتماعات عمل، عشاء خطوبة أو حجز كامل للمكان. نجهّز لك القائمة والديكور والتفاصيل.','Birthdays, business meetings, engagement dinners or a full buy-out. We tailor the menu, setting and every detail.'], ev_btn:['اطلب عرض سعر','Request a quote'],
  br_eye:['الفروع','Locations'], br_h:['أقرب سوناتا إليك','Find your Sonata'], dir:['الاتجاهات','Directions'], book:['احجز هنا','Book here'],
  rs_eye:['الحجز','Reservations'], rs_h:['احجز طاولتك','Reserve your table'], rs_p:['اختر الفرع والموعد، وسيؤكد فريقنا الحجز معك على واتساب خلال دقائق.','Choose a location and time, and our team will confirm on WhatsApp within minutes.'],
  wa:['واتساب','WhatsApp'], call:['اتصل بنا','Call us'],
  f_name:['الاسم','Name'], f_phone:['رقم الموبايل','Mobile'], f_branch:['الفرع','Location'], f_guests:['عدد الأشخاص','Guests'], f_date:['التاريخ','Date'], f_time:['الوقت','Time'], f_occ:['المناسبة','Occasion'], f_note:['ملاحظات','Notes'],
  f_note_p:['طاولة على التراس، تورتة عيد ميلاد…','Terrace table, birthday cake…'], f_send:['أرسل طلب الحجز عبر واتساب','Send request via WhatsApp'],
  order:['اطلب عبر واتساب','Order on WhatsApp'], order_hint:['يصلك تأكيد الطلب والتوصيل من فريق سوناتا على واتساب.','Sonata\u2019s team confirms your order and delivery on WhatsApp.'],
  ft_tag:['مطبخ عالمي، مؤلَّف في القاهرة.','International cuisine, composed in Cairo.'], ft_by:['تصميم وتطوير','Designed & built by']
};
const OCC = [['casual','عادي','Casual'],['birthday','عيد ميلاد','Birthday'],['business','عمل','Business'],['date','عشاء رومانسي','Date night'],['event','مناسبة خاصة','Private event']];
let lang = store.get('sonata_lang') || 'ar';
const L = o => (o && typeof o==='object') ? (o[lang]||o.en) : o;
const tr = k => T[k] ? T[k][lang==='ar'?0:1] : k;
const cur = () => L(C.currency);

function applyLang(){
  html.lang = lang; html.dir = lang==='ar'?'rtl':'ltr';
  $$('[data-t]').forEach(el=>{ el.textContent = tr(el.dataset.t); });
  $$('[data-tp]').forEach(el=>{ el.placeholder = tr(el.dataset.tp); });
  renderAll();
  if(window.ScrollTrigger) requestAnimationFrame(()=>ScrollTrigger.refresh());
}

/* ---------- theme ---------- */
let theme = store.get('sonata_theme') || 'dark';
function applyTheme(){ html.dataset.theme = theme; $('meta[name=theme-color]').content = theme==='dark'?'#0c0a08':'#f6f1e8'; }
applyTheme();
$('#themeBtn').addEventListener('click',()=>{ theme = theme==='dark'?'light':'dark'; store.set('sonata_theme',theme); applyTheme(); });
$('#langBtn').addEventListener('click',()=>{ lang = lang==='ar'?'en':'ar'; store.set('sonata_lang',lang); applyLang(); });

/* ---------- contacts ---------- */
const waLink = (msg)=>`https://wa.me/${C.whatsapp}${msg?`?text=${encodeURIComponent(msg)}`:''}`;
function contacts(){
  $$('[data-wa]').forEach(a=>{ a.href = waLink(lang==='ar'?'مرحبًا سوناتا، أريد الاستفسار':'Hello Sonata, I have an enquiry'); a.target='_blank'; a.rel='noopener'; });
  $$('[data-tel]').forEach(a=>a.href='tel:'+C.phone);
  $$('[data-phone]').forEach(b=>b.textContent=C.phone);
  $$('[data-ig]').forEach(a=>a.href=C.instagram);
}

/* ---------- menu ---------- */
const ITEMS = [];
D.menu.forEach(cat=>cat.items.forEach(it=>ITEMS.push({cat, en:it[0], ar:it[1], price:it[2], dEn:it[3]||'', dAr:it[4]||'', img:it[5]||null, tag:it[6]||null})));
const nm = it => lang==='ar'?it.ar:it.en, ds = it => lang==='ar'?it.dAr:it.dEn;
let activeCat = 'all', query = '';
const catImg = cat => (cat.items.find(i=>i[5])||[])[5] || 'table';
const camSvg = '<svg class="mitem__cam" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8.5 7 10 4.5h4L15.5 7"/></svg>';

function renderTabs(){
  const tabs = [`<button class="mtab ${activeCat==='all'?'is-on':''}" data-cat="all">${tr('all')}</button>`]
    .concat(D.menu.map(c=>`<button class="mtab ${activeCat===c.id?'is-on':''}" data-cat="${c.id}"><i>${c.num}</i>${L(c.name)}</button>`));
  $('#menuTabs').innerHTML = tabs.join('');
}
function renderMenu(){
  const q = query.trim().toLowerCase();
  const cats = D.menu.filter(c=>activeCat==='all'||c.id===activeCat);
  let out = '';
  cats.forEach(c=>{
    const list = ITEMS.filter(i=>i.cat===c && (!q || (i.en+' '+i.ar+' '+i.dEn+' '+i.dAr).toLowerCase().includes(q)));
    if(!list.length) return;
    out += `<div class="mgroup" data-gcat="${c.id}"><div class="mgroup__h"><b>${c.num}</b><h3>${L(c.name)}</h3>${c.note?`<small>${L(c.note)}</small>`:''}</div>`+
      list.map(i=>`<button class="mitem" data-i="${ITEMS.indexOf(i)}"><div class="mitem__row"><span class="mitem__name">${i.tag?`<i class="tg tg--${i.tag}"></i>`:''}${nm(i)}${i.img?camSvg:''}</span><span class="mitem__dots"></span><span class="mitem__price">${i.price} <small>${cur()}</small></span></div>${ds(i)?`<p class="mitem__desc">${ds(i)}</p>`:''}</button>`).join('')+`</div>`;
  });
  $('#menuList').innerHTML = out || `<p class="menu__empty">${tr('none')}</p>`;
  const c0 = cats[0] || D.menu[0];
  setAside(c0);
  observeGroups();
}
let lastAside = null;
function setAside(c){
  if(lastAside===c.id+lang) return; lastAside = c.id+lang;
  const ph = $('#menuPhoto'); ph.style.opacity = 0;
  setTimeout(()=>{ ph.src = `assets/img/${catImg(c)}-s.webp`; ph.onload=()=>ph.style.opacity=1; },220);
  $('#menuCat').innerHTML = `<b>${c.num}</b><div><span>${L(c.name)}</span><small>${c.items.length} ${lang==='ar'?'أصناف':'dishes'}</small></div>`;
}
let gObs;
function observeGroups(){
  if(gObs) gObs.disconnect();
  gObs = new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ const c=D.menu.find(m=>m.id===e.target.dataset.gcat); if(c) setAside(c); } }); },{rootMargin:'-40% 0px -50% 0px'});
  $$('.mgroup').forEach(g=>gObs.observe(g));
}
$('#menuTabs').addEventListener('click',e=>{
  const b = e.target.closest('.mtab'); if(!b) return;
  activeCat = b.dataset.cat; renderTabs(); renderMenu();
  const top = $('#menu .menu__bar').getBoundingClientRect().top + scrollY - 90;
  if(scrollY > top + 40) scrollToY(top);
  if(window.ScrollTrigger) ScrollTrigger.refresh();
});
$('#menuSearch').addEventListener('input',e=>{ query = e.target.value; if(query && activeCat!=='all'){activeCat='all';renderTabs();} renderMenu(); });
$('#menuList').addEventListener('click',e=>{ const b=e.target.closest('.mitem'); if(b) openSheet(ITEMS[+b.dataset.i]); });

/* ---------- signatures ---------- */
function renderSig(){
  const sig = ITEMS.filter(i=>i.tag==='sig' && i.img).slice(0,6);
  $('#sigGrid').innerHTML = sig.map(i=>`<button class="dish rv" data-i="${ITEMS.indexOf(i)}"><div class="dish__img"><img src="assets/img/${i.img}-s.webp" alt="${nm(i)}" loading="lazy"></div><div class="dish__meta"><div><h3>${nm(i)}</h3><small>${L(i.cat.name)}</small></div><span class="dish__price">${i.price}<small>${cur()}</small></span></div></button>`).join('');
}
$('#sigGrid').addEventListener('click',e=>{ const b=e.target.closest('.dish'); if(b) openSheet(ITEMS[+b.dataset.i]); });

/* ---------- sheet ---------- */
const sheet = $('#sheet');
let shItem=null;
function shLink(){ const q=+$('#shQty').value, i=shItem, tot=q*i.price;
  const msg = lang==='ar' ? `طلب من سوناتا سوشيال هاوس\n${q} × ${i.ar} (${i.price} ج.م)\nالإجمالي: ${tot} ج.م\nالاسم:\nالعنوان:` : `Order – Sonata Social House\n${q} × ${i.en} (${i.price} EGP)\nTotal: ${tot} EGP\nName:\nAddress:`;
  $('#shOrder').href = waLink(msg); $('#shPrice').textContent = `${tot} ${cur()}`; }
function openSheet(i){
  shItem = i; $('#shQty').value = 1;
  $('#shImg').src = `assets/img/${i.img || catImg(i.cat)}.webp`;
  $('#shCat').textContent = L(i.cat.name);
  $('#shName').textContent = nm(i);
  $('#shDesc').textContent = ds(i);
  $('#shDesc').style.display = ds(i) ? '' : 'none';
  shLink();
  sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden','false');
  lenis && lenis.stop();
}
$$('[data-q]').forEach(b=>b.addEventListener('click',()=>{ const i=$('#shQty'); i.value=Math.min(20,Math.max(1,(+i.value)+(+b.dataset.q))); shLink(); }));
function closeSheet(){ sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden','true'); lenis && lenis.start(); }
sheet.addEventListener('click',e=>{ if(e.target.closest('[data-close]')) closeSheet(); });
addEventListener('keydown',e=>{ if(e.key==='Escape') closeSheet(); });

/* ---------- branches ---------- */
function renderBranches(){
  $('#brGrid').innerHTML = D.branches.map(b=>`<article class="br rv"><div class="br__img"><img src="assets/img/${b.img}-s.webp" alt="" loading="lazy"></div><div class="br__body"><span class="br__area">${L(b.area)}</span><h3>${L(b.name)}</h3><p>${L(b.addr)}</p><p>${L(b.hours)}</p><div class="br__acts">${b.map?`<a class="btn btn--line btn--sm" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${b.map}">${tr('dir')}</a>`:''}<a class="btn btn--gold btn--sm" href="#reserve" data-branch="${b.id}">${tr('book')}</a></div></div></article>`).join('');
  $('#fBranch').innerHTML = D.branches.map(b=>`<option value="${b.id}">${L(b.name)}</option>`).join('');
}
$('#brGrid').addEventListener('click',e=>{ const a=e.target.closest('[data-branch]'); if(a) $('#fBranch').value=a.dataset.branch; });

/* ---------- reservation form ---------- */
let occ = 'casual';
function renderForm(){
  $('#occChips').innerHTML = OCC.map(o=>`<button type="button" class="chip ${occ===o[0]?'is-on':''}" data-occ="${o[0]}">${lang==='ar'?o[1]:o[2]}</button>`).join('');
  const t = $('#fTime'), keep = t.value; let opts='';
  for(let h=8; h<=25; h++){ for(const m of [0,30]){ if(h===25&&m) continue; const hh=h%24, v=`${String(hh).padStart(2,'0')}:${m?'30':'00'}`; const h12=((hh+11)%12)+1, ap = hh<12?(lang==='ar'?'ص':'AM'):(lang==='ar'?'م':'PM'); opts+=`<option value="${v}">${h12}:${m?'30':'00'} ${ap}</option>`; } }
  t.innerHTML = opts; t.value = keep || '20:00';
}
$('#occChips').addEventListener('click',e=>{ const c=e.target.closest('.chip'); if(!c) return; occ=c.dataset.occ; renderForm(); });
document.addEventListener('click',e=>{ const a=e.target.closest('[data-occasion]'); if(a){ occ=a.dataset.occasion; renderForm(); } });
$$('[data-step]').forEach(b=>b.addEventListener('click',()=>{ const i=$('[name=guests]'); i.value=Math.min(40,Math.max(1,(+i.value)+(+b.dataset.step))); }));
const dIn = $('[name=date]'); const today = new Date(); dIn.min = today.toISOString().slice(0,10); dIn.value = dIn.min;
$('#rform').addEventListener('submit',e=>{
  e.preventDefault(); const f = new FormData(e.target);
  const br = D.branches.find(b=>b.id===f.get('branch')); const o = OCC.find(x=>x[0]===occ);
  const tm = $('#fTime').selectedOptions[0]?.textContent || f.get('time');
  const msg = lang==='ar'
    ? `طلب حجز – سوناتا سوشيال هاوس\nالاسم: ${f.get('name')}\nالموبايل: ${f.get('phone')}\nالفرع: ${L(br.name)}\nالتاريخ: ${f.get('date')}\nالوقت: ${tm}\nعدد الأشخاص: ${f.get('guests')}\nالمناسبة: ${o[1]}${f.get('note')?`\nملاحظات: ${f.get('note')}`:''}`
    : `Reservation – Sonata Social House\nName: ${f.get('name')}\nMobile: ${f.get('phone')}\nLocation: ${L(br.name)}\nDate: ${f.get('date')}\nTime: ${tm}\nGuests: ${f.get('guests')}\nOccasion: ${o[2]}${f.get('note')?`\nNotes: ${f.get('note')}`:''}`;
  window.open(waLink(msg),'_blank','noopener');
});

function renderAll(){ contacts(); renderTabs(); renderMenu(); renderSig(); renderBranches(); renderForm(); revealNew(); }

/* ---------- header / nav ---------- */
const hdr = $('#hdr'); let lastY = 0;
function onScroll(){
  const y = scrollY;
  hdr.classList.toggle('is-solid', y > 60);
  hdr.classList.toggle('is-hidden', y > 500 && y > lastY && !document.body.classList.contains('nav-open'));
  lastY = y;
}
addEventListener('scroll', onScroll, {passive:true});
$('#burger').addEventListener('click',()=>document.body.classList.toggle('nav-open'));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('nav-open')));

/* ---------- smooth scroll ---------- */
let lenis = null;
if(window.Lenis && !weak){ lenis = new Lenis({lerp:.1, smoothWheel:true}); }
function scrollToY(y){ lenis ? lenis.scrollTo(y,{duration:1}) : scrollTo({top:y,behavior:'smooth'}); }
document.addEventListener('click',e=>{
  const a = e.target.closest('a[href^="#"]'); if(!a) return; const id=a.getAttribute('href'); if(id.length<2) return;
  const t = $(id); if(!t) return; e.preventDefault(); scrollToY(t.getBoundingClientRect().top + scrollY - (id==='#top'?0:70));
});

/* ---------- lazy videos ---------- */
const vObs = new IntersectionObserver(es=>es.forEach(e=>{ const v=e.target; if(e.isIntersecting){ if(v.preload==='none'){v.preload='auto';v.load();} v.play().catch(()=>{}); } else v.pause(); }),{rootMargin:'200px'});
$$('video[data-lazyvid]').forEach(v=>vObs.observe(v));

/* ---------- reveal ---------- */
let revealReady = false;
function revealNew(){
  if(!revealReady || !window.gsap) { $$('.rv').forEach(el=>{ if(!window.gsap) el.classList.remove('rv'); }); return; }
  $$('.rv:not([data-rv])').forEach(el=>{ el.dataset.rv=1;
    gsap.to(el,{opacity:1,y:0,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}); });
}

/* ---------- intro + GSAP ---------- */
function intro(done){
  const el = $('#intro');
  if(!window.gsap){ el.remove(); done(); return; }
  const strokes = $$('.il-stroke path', el);
  strokes.forEach(p=>{ const l=p.getTotalLength(); p.style.strokeDasharray=l; p.style.strokeDashoffset=l; });
  const num = $('#introNum'), o = {v:0};
  const tl = gsap.timeline({onComplete:()=>{ el.remove(); done(); }});
  tl.to('.intro__staff i',{scaleX:1,duration:1,stagger:.08,ease:'power3.inOut'},0)
    .to(strokes,{strokeDashoffset:0,duration:1.5,stagger:.04,ease:'power2.inOut'},.25)
    .to(o,{v:100,duration:2,ease:'power1.inOut',onUpdate:()=>num.textContent=String(Math.round(o.v)).padStart(2,'0')},0)
    .to('.il-fill',{opacity:1,duration:.6},1.7)
    .to('.il-stroke',{opacity:0,duration:.5},1.9)
    .to('.intro__staff i',{opacity:0,duration:.5},2.1)
    .to(el,{yPercent:-100,duration:1,ease:'expo.inOut'},2.5);
}

function boot(){
  const hv = $('#heroVid'); hv.preload='auto'; hv.play().catch(()=>{});
  document.body.classList.remove('is-loading');
  if(!window.gsap){ return; }
  gsap.registerPlugin(ScrollTrigger);
  if(lenis){ lenis.on('scroll',ScrollTrigger.update); gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0); }

  // hero entrance
  gsap.from('.hero__eye, .hero__lead, .hero__cta, .hero__meta',{opacity:0,y:30,duration:1.2,stagger:.1,ease:'power3.out',delay:.1});
  gsap.from('.hero__logo',{opacity:0,scale:.94,duration:1.6,ease:'power3.out'});
  gsap.to('.hero__media video',{yPercent:12,scale:1.14,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero__in',{yPercent:-18,opacity:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom 30%',scrub:true}});

  // generic reveals
  $$('.eyebrow, .h2, .lead, .notes, .frame, .move__txt, .events, .amb__grid figure, .reserve__contact, .rform, .menu__bar').forEach(el=>el.classList.add('rv'));
  revealReady = true; revealNew();
  gsap.fromTo('.frame--small',{yPercent:20},{yPercent:-10,ease:'none',scrollTrigger:{trigger:'.story',start:'top bottom',end:'bottom top',scrub:true}});

  // movements: horizontal pin
  const track = $('#movesTrack');
  const dist = ()=> Math.max(0, track.scrollWidth - innerWidth);
  const rtl = ()=> html.dir==='rtl';
  gsap.to(track,{x:()=> rtl()? dist() : -dist(), ease:'none',
    scrollTrigger:{trigger:'.moves__pin',start:'top top',end:()=>'+='+dist(),pin:true,scrub:.6,invalidateOnRefresh:true,anticipatePin:1,
      onUpdate:s=>gsap.set('#movesBar',{scaleX:s.progress})}});

  // nav active
  ['story','movements','menu','ambience','branches'].forEach(id=>{
    ScrollTrigger.create({trigger:'#'+id,start:'top 50%',end:'bottom 50%',onToggle:s=>{ const a=$(`#nav a[href="#${id}"]`); a && a.classList.toggle('is-on',s.isActive); }});
  });
  ScrollTrigger.refresh();
}

applyLang();
onScroll();
intro(boot);
})();
