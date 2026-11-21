/* glacé — interactions */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const html=document.documentElement;
const CFG=window.GL_CONFIG, MENU=window.GL_MENU, FL=window.GL_FLAVORS, VES=window.GL_VESSELS, TOPS=window.GL_TOPPINGS, SP=window.GL_SCOOP_PRICE;
const hasGsap=!!window.gsap;
if(hasGsap&&window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
const isMobile=()=>innerWidth<=760;
const weak=(navigator.hardwareConcurrency||8)<=4||matchMedia('(pointer:coarse)').matches;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
let lang=html.lang==='en'?'en':'ar';
const L=o=>o?(o[lang]||o.ar||''):'';
const cur=()=>CFG.currency[lang];
const money=n=>`${n}<small class="cur"> ${cur()}</small>`;
const T={
  added:{ar:'اتضاف لطلبك ✓',en:'Added to your order ✓'},
  pick:{ar:'اختار سكوب واحد على الأقل',en:'Pick at least one scoop'},
  full:{ar:'الكوب مليان، 3 سكوبات بس',en:'Cup is full — 3 scoops max'},
  open:{ar:'مفتوح دلوقتي',en:'Open now'}, closed:{ar:'مقفول دلوقتي',en:'Closed now'},
  custom:{ar:'كوب على مزاجك',en:'Your custom cup'},
  name:{ar:'اكتب اسمك',en:'Please add your name'}, addr:{ar:'اكتب العنوان',en:'Please add the address'},
  stamp:{ar:'السكوب العاشر علينا 🎉',en:'The 10th scoop is on us 🎉'},
  scoop:{ar:'سكوب',en:'scoop'}
};

/* ---------- toast ---------- */
let tt; function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2200)}

/* ---------- i18n ---------- */
$$('[data-en]').forEach(el=>el.dataset.ar=el.innerHTML);
$$('[data-en-ph]').forEach(el=>el.dataset.arPh=el.placeholder);
function applyLang(){
  html.lang=lang; html.dir=lang==='en'?'ltr':'rtl';
  $$('[data-en]').forEach(el=>el.innerHTML=lang==='en'?el.dataset.en:el.dataset.ar);
  $$('[data-en-ph]').forEach(el=>el.placeholder=lang==='en'?el.dataset.enPh:el.dataset.arPh);
  $('#langBtn').textContent=lang==='en'?'ع':'EN';
  $$('.cur').forEach(e=>e.textContent=' '+cur());
  buildMarquee(); buildFlavorDots(); showFlavor(flIdx,false); buildStudio(); renderMenu(); renderCart(); openState();
  if(window.ScrollTrigger) setTimeout(()=>ScrollTrigger.refresh(),60);
}
$('#langBtn').addEventListener('click',()=>{lang=lang==='en'?'ar':'en';try{localStorage.setItem('gl-lang',lang)}catch(e){};applyLang()});
$('#themeBtn').addEventListener('click',()=>{const t=html.dataset.theme==='dark'?'light':'dark';html.dataset.theme=t;try{localStorage.setItem('gl-theme',t)}catch(e){}});

/* ---------- header ---------- */
const hdr=$('#hdr');
function onScroll(){hdr.classList.toggle('solid',scrollY>innerHeight*.75)}
addEventListener('scroll',onScroll,{passive:true});onScroll();
$('#navBtn').addEventListener('click',()=>hdr.classList.toggle('nav-open'));
$$('.nav a').forEach(a=>a.addEventListener('click',()=>hdr.classList.remove('nav-open')));

/* ---------- open state ---------- */
function openState(){
  let h=new Date().getHours()+new Date().getMinutes()/60;
  try{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).split(':');h=+p[0]+(+p[1])/60}catch(e){}
  const o=CFG.hours.open,c=CFG.hours.close; const isOpen=(h>=o&&h<Math.min(c,24))||(c>24&&h<c-24);
  const pill=$('#openPill');pill.classList.toggle('closed',!isOpen);$('span',pill).textContent=L(isOpen?T.open:T.closed);
}

/* ---------- marquee ---------- */
function buildMarquee(){
  const w=['ICE CREAM','آيس كريم','COFFEE','قهوة مختصة','AND MORE','وافل وكريب','GELATO','جيلاتو طازة'];
  const one=w.map(x=>`<span class="${/[a-z]/i.test(x)?'':'ar'}">${x}<svg><use href="#spark"/></svg></span>`).join('');
  $('#mq').innerHTML=one+one;
}

/* ---------- hero sparkles ---------- */
(function(){
  const box=$('#heroSparks');let s='';
  const n=isMobile()?9:16;
  for(let i=0;i<n;i++){const z=6+Math.random()*12;s+=`<svg style="left:${Math.random()*100}%;top:${Math.random()*90}%;width:${z}px;height:${z}px;--d:${2.4+Math.random()*3}s;--dl:${Math.random()*4}s"><use href="#spark"/></svg>`}
  box.innerHTML=s;
})();

/* ---------- swirls: prepare dash ---------- */
$$('.swirl path').forEach(p=>{const l=p.getTotalLength();p.style.strokeDasharray=l;p.style.strokeDashoffset=l;p.dataset.l=l});
function drawSwirls(root,dur=2.4){if(!hasGsap){$$('path',root).forEach(p=>p.style.strokeDashoffset=0);return}gsap.to($$('path',root),{strokeDashoffset:0,duration:dur,ease:'power2.inOut',stagger:.25})}

/* ---------- flavor wall ---------- */
let flIdx=0;
function buildFlavorDots(){
  $('#flDots').innerHTML=FL.map((f,i)=>`<button class="fl-dot${i===flIdx?' on':''}" style="--c:${f.c}" role="tab" aria-label="${L(f)}" data-i="${i}"></button>`).join('');
  $$('.fl-dot').forEach(b=>b.addEventListener('click',()=>showFlavor(+b.dataset.i,true)));
}
function showFlavor(i,anim){
  flIdx=i;const f=FL[i];
  $$('.fl-dot').forEach((d,k)=>d.classList.toggle('on',k===i));
  const sh=$('.fl-show');sh.style.setProperty('--c',f.c);sh.style.setProperty('--d',f.d);
  $('#flName').textContent=L(f);$('#flNote').textContent=L(f.note);$('#flTag').textContent=f.tag?L(f.tag):(f.x?`+${f.x} ${cur()}`:'');
  if(anim){const s=$('#flScoop');s.classList.remove('pop');void s.getBoundingClientRect();s.classList.add('pop')}
}
$('#flAdd').addEventListener('click',()=>{const f=FL[flIdx];addToCart({key:'scoop-'+f.id,name:{ar:'سكوب '+f.ar,en:f.en+' scoop'},desc:{ar:'سكوب واحد',en:'Single scoop'},price:SP[1]+f.x,img:'case'})});

/* ---------- STUDIO ---------- */
const st={v:'cup',scoops:['velvet'],tops:[]};let lastDrop=-1;
const FB={body:'M60 172 C34 116 82 44 150 44 C218 44 266 116 240 172 Z',frill:'M46 168 C58 150 70 182 84 166 C98 150 108 186 124 168 C138 152 150 190 166 168 C180 150 192 184 208 166 C222 150 236 180 254 168 C258 186 246 200 230 198 C214 214 196 196 182 206 C166 220 150 200 136 210 C118 222 104 200 90 208 C70 220 58 200 46 168 Z',hi:'M96 92 C112 70 136 62 156 62'};
const SAUCE='M80 104 C92 60 208 56 220 104 C226 122 218 134 212 126 C206 118 204 110 196 116 C188 124 192 158 181 158 C170 158 174 126 168 118 C160 110 152 122 148 138 C144 152 132 152 132 138 C132 122 126 112 117 116 C108 122 112 138 101 138 C90 138 76 124 80 104 Z';
const CREAM='<path d="M100 60 C96 38 204 38 200 60 C206 74 186 80 150 80 C114 80 94 74 100 60Z"/><path d="M116 38 C114 20 186 20 184 38 C188 50 172 56 150 56 C128 56 112 50 116 38Z"/><path d="M130 18 C130 4 170 4 170 18 C170 28 160 32 150 32 C140 32 130 28 130 18Z"/><path d="M150 -14 C160 0 166 6 160 14 C154 20 144 18 142 10 C140 2 146 -6 150 -14Z"/>';
function rnd(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}
function vesselSVG(){
  if(st.v==='cup') return `<g class="vessel"><path d="M86 332 L116 488 C117 496 123 500 131 500 H269 C277 500 283 496 284 488 L314 332 Z" fill="#FBF7F1"/><path d="M86 332 L116 488 C117 496 123 500 131 500 H200 V332 Z" fill="#000" opacity=".04"/><rect x="78" y="324" width="244" height="16" rx="8" fill="#EDE3D4"/><use href="#gmark" x="184" y="378" width="32" height="58" style="color:#721A2A"/><text x="200" y="462" text-anchor="middle" font-family="Quicksand,sans-serif" font-weight="600" font-size="20" fill="#721A2A">glacé</text><path d="M98 400 C140 380 170 420 214 404" fill="none" stroke="#721A2A" stroke-width="1.2" opacity=".4"/><use href="#spark" x="262" y="350" width="10" height="10" style="color:#721A2A"/></g>`;
  const dark=st.v==='waffle';const base=dark?'#B9763A':'#E1AE6E',ln=dark?'#8A5222':'#B98446';
  let lines='';for(let i=-6;i<8;i++){lines+=`<path d="M${120+i*24} 330 L${200+i*24*.1+i*10} 520" stroke="${ln}" stroke-width="2.2"/><path d="M${280-i*24} 330 L${200-i*24*.1-i*10} 520" stroke="${ln}" stroke-width="2.2"/>`}
  return `<g class="vessel"><defs><clipPath id="coneClip"><path d="M114 334 L200 508 L286 334 Z"/></clipPath></defs><path d="M114 334 L200 508 L286 334 Z" fill="${base}"/><g clip-path="url(#coneClip)" opacity=".9">${lines}<path d="M114 334 L200 508 L200 334Z" fill="#000" opacity=".06"/></g>${dark?`<rect x="104" y="324" width="192" height="22" rx="11" fill="${base}"/><path d="M110 335 H290" stroke="${ln}" stroke-width="2" stroke-dasharray="6 6"/>`:''}</g>`;
}
function scoopSVG(f,i,n){
  const W=[168,152,138][i], s=W/184, by=st.v==='cup'?352-i*78:350-i*78, cx=200+(i===1?12:i===2?-8:0);
  const tx=cx-150*s, ty=by-176*s;
  return `<g class="scoop-g" data-i="${i}"><g transform="translate(${tx} ${ty}) scale(${s})"><path d="${FB.frill}" fill="${f.d}"/><path d="${FB.body}" fill="${f.c}"/><path d="${FB.hi}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="8" stroke-linecap="round"/></g></g>`;
}
function topsSVG(){
  const n=st.scoops.length;if(!n) return '';
  const i=n-1, W=[168,152,138][i], s=W/184, by=(st.v==='cup'?352:350)-i*78, cx=200+(i===1?12:i===2?-8:0);
  const g=c=>`<g class="top-g" transform="translate(${cx-150*s} ${by-176*s}) scale(${s})">${c}</g>`;
  let out='';
  if(st.tops.includes('choc')) out+=g(`<path d="${SAUCE}" fill="#3B1D12"/><path d="M104 84 C120 70 140 66 156 66" stroke="rgba(255,255,255,.35)" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  if(st.tops.includes('caramel')) out+=g(`<path d="M70 120 C110 92 130 132 160 100 C186 74 206 118 236 96" fill="none" stroke="#C47F38" stroke-width="7" stroke-linecap="round"/><path d="M82 146 C112 122 140 156 170 128 C196 108 214 140 230 128" fill="none" stroke="#C47F38" stroke-width="6" stroke-linecap="round"/>`);
  const crumbs=(col,seed,shape)=>{const r=rnd(seed);let c='';for(let k=0;k<26;k++){const a=r()*Math.PI,rr=40+r()*48;const x=150+Math.cos(a)*rr*1.1*(r()>.5?1:-1),y=118-Math.sin(a)*rr*.95;if(shape==='sp'){const cols=['#F2A3B1','#F7C04A','#AEDDC6','#8277B5','#FBF7F1','#E0707F'];c+=`<rect x="${x}" y="${y}" width="12" height="4" rx="2" fill="${cols[k%6]}" transform="rotate(${r()*180} ${x+6} ${y+2})"/>`}else{c+=`<path d="M${x} ${y} l${4+r()*5} ${-2-r()*3} l${2+r()*3} ${5+r()*3} l${-6-r()*3} ${2}z" fill="${col}"/>`}}return c};
  if(st.tops.includes('pist')) out+=g(crumbs('#8FA552',7));
  if(st.tops.includes('lotus')) out+=g(crumbs('#9A5E2C',19));
  if(st.tops.includes('sprinkle')) out+=g(crumbs('',33,'sp'));
  if(st.tops.includes('cream')) out+=g(`<g fill="#FFF8EE" stroke="#E8DCCB" stroke-width="2">${CREAM}</g>`);
  return out;
}
function drawStudio(){
  const svg=$('#stSvg');
  svg.innerHTML=`<ellipse cx="200" cy="508" rx="110" ry="9" fill="rgba(0,0,0,.18)"/>`+st.scoops.map((id,i)=>scoopSVG(FL.find(f=>f.id===id),i)).join('')+vesselSVG()+topsSVG();
  // cup sits in front of first scoop's base; cones hold scoops on top
  if(st.v!=='cup'){const v=$('.vessel',svg);svg.insertBefore(v,svg.children[1])}
  if(lastDrop>=0&&hasGsap){const g=$(`.scoop-g[data-i="${lastDrop}"]`,svg);if(g)gsap.from(g,{y:-260,duration:.9,ease:'bounce.out'});const tg=$$('.top-g',svg);if(tg.length)gsap.from(tg,{y:-160,opacity:0,duration:.6,ease:'back.out(2)'})}
  lastDrop=-1;
  $('#stPrice').textContent=studioPrice();
  $('#stCount').textContent=`${st.scoops.length}/3`;
}
function studioPrice(){if(!st.scoops.length)return 0;return SP[st.scoops.length]+VES.find(v=>v.id===st.v).p+st.scoops.reduce((a,id)=>a+FL.find(f=>f.id===id).x,0)+st.tops.reduce((a,id)=>a+TOPS.find(t=>t.id===id).p,0)}
function buildStudio(){
  $('#stVessels').innerHTML=VES.map(v=>`<button class="chip${st.v===v.id?' on':''}" data-v="${v.id}">${L(v)}${v.p?`<small>+${v.p}</small>`:''}</button>`).join('');
  $('#stFlavors').innerHTML=FL.map(f=>`<button class="sw" data-f="${f.id}" style="--c:${f.c}"><i></i><b>${L(f)}</b></button>`).join('');
  $('#stTops').innerHTML=TOPS.map(t=>`<button class="chip${st.tops.includes(t.id)?' on':''}" data-t="${t.id}"><span class="dot" style="--c:${t.c==='multi'?'conic-gradient(#F2A3B1,#F7C04A,#AEDDC6,#8277B5,#F2A3B1)':t.c}"></span>${L(t)}<small>+${t.p}</small></button>`).join('');
  $$('#stVessels .chip').forEach(b=>b.onclick=()=>{st.v=b.dataset.v;buildStudio()});
  $$('#stFlavors .sw').forEach(b=>b.onclick=()=>{if(st.scoops.length>=3){toast(L(T.full));return}st.scoops.push(b.dataset.f);lastDrop=st.scoops.length-1;buildStudio()});
  $$('#stTops .chip').forEach(b=>b.onclick=()=>{const id=b.dataset.t;const k=st.tops.indexOf(id);if(k>-1)st.tops.splice(k,1);else{st.tops.push(id);lastDrop=-2}buildStudio()});
  $('#stPicked').innerHTML=st.scoops.map((id,i)=>{const f=FL.find(x=>x.id===id);return `<button data-i="${i}" style="--c:${f.c}"><i></i>${L(f)}</button>`}).join('');
  $$('#stPicked button').forEach(b=>b.onclick=()=>{st.scoops.splice(+b.dataset.i,1);buildStudio()});
  $$('#stFlavors .sw').forEach(b=>b.classList.toggle('full',st.scoops.length>=3));
  if(lastDrop===-2){lastDrop=-1;drawStudio();if(hasGsap){const tg=$$('.top-g',$('#stSvg'));const nt=tg[tg.length-1];if(nt)gsap.from(nt,{y:-120,opacity:0,duration:.6,ease:'back.out(2)'})}}else drawStudio();
}
$('#stReset').onclick=()=>{st.v='cup';st.scoops=[];st.tops=[];buildStudio()};
$('#stAdd').onclick=()=>{
  if(!st.scoops.length){toast(L(T.pick));return}
  const v=VES.find(x=>x.id===st.v);const fl=st.scoops.map(id=>FL.find(f=>f.id===id));const tp=st.tops.map(id=>TOPS.find(t=>t.id===id));
  const d=k=>[v[k],fl.map(f=>f[k]).join(' + '),tp.map(t=>t[k]).join('، ')].filter(Boolean).join(' · ');
  addToCart({key:'custom-'+st.v+st.scoops.join('-')+st.tops.join('-'),name:T.custom,desc:{ar:d('ar'),en:d('en')},price:studioPrice(),img:'case'});
};

/* ---------- MENU ---------- */
let query='';
function renderMenu(){
  $('#tabs').innerHTML=MENU.map((c,i)=>`<button class="tab${i===0?' on':''}" data-c="${c.id}">${L(c)}</button>`).join('');
  $$('.tab').forEach(t=>t.onclick=()=>goCat(t.dataset.c));
  const q=query.trim().toLowerCase();let any=false;
  $('#menuBody').innerHTML=MENU.map(c=>{
    const items=c.items.filter(it=>!q||(it.ar+' '+it.en+' '+L(it.d)).toLowerCase().includes(q));
    if(!items.length)return '';any=true;
    return `<div class="menu-cat" id="cat-${c.id}"><div class="mc-side"><figure class="mc-img"><img src="assets/img/${c.img}.webp" alt="" loading="lazy"><figcaption><h3>${L(c)}</h3><p>${L(c.sub)}</p></figcaption></figure></div><div class="mc-items">${items.map(it=>`<button class="item" data-id="${it.id}"><div class="it-main"><div class="it-top"><span class="it-name">${L(it)}</span><span class="it-fill"></span><span class="it-price">${it.o?`<small>${lang==='en'?'from':'من'}</small> `:''}${it.p}<small>${cur()}</small></span></div>${it.d?`<p class="it-desc">${L(it.d)}</p>`:''}${it.tag?`<span class="it-tag">${L(it.tag)}</span>`:''}</div><span class="it-add">+</span></button>`).join('')}</div></div>`;
  }).join('')||'';
  if(!any)$('#menuBody').innerHTML=`<p class="menu-empty">${lang==='en'?'Nothing matches — try another word.':'مفيش نتايج، جرّب كلمة تانية.'}</p>`;
  $$('.item').forEach(b=>b.onclick=()=>openSheet(b.dataset.id));
  if(window.ScrollTrigger) setupCatSpy();
}
$('#q').addEventListener('input',e=>{query=e.target.value;renderMenu()});
function scrollToEl(el,off=0){const y=el.getBoundingClientRect().top+scrollY-off;if(lenis)lenis.scrollTo(y,{duration:1.2});else scrollTo({top:y,behavior:'smooth'})}
function goCat(id){const el=$('#cat-'+id);if(el)scrollToEl(el,isMobile()?150:140)}
let spies=[];
function setupCatSpy(){spies.forEach(s=>s.kill());spies=$$('.menu-cat').map(el=>ScrollTrigger.create({trigger:el,start:'top 55%',end:'bottom 55%',refreshPriority:-1,onToggle:s=>{if(s.isActive){const id=el.id.slice(4);$$('.tab').forEach(t=>t.classList.toggle('on',t.dataset.c===id));const on=$(`.tab[data-c="${id}"]`);if(on){const tb=$('#tabs');tb.scrollTo({left:on.offsetLeft-tb.clientWidth/2+on.clientWidth/2,behavior:'smooth'})}}}}))}
$$('[data-cat]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goCat(a.dataset.cat)}));

/* ---------- sheet ---------- */
let sh={it:null,cat:null,opt:0,qty:1};
const findItem=id=>{for(const c of MENU){const it=c.items.find(i=>i.id===id);if(it)return{it,c}}};
function openSheet(id){
  const {it,c}=findItem(id);sh={it,cat:c,opt:0,qty:1};
  $('#shImg').src=`assets/img/${c.img}.webp`;$('#shCat').textContent=L(c);$('#shName').textContent=L(it);$('#shDesc').textContent=it.d?L(it.d):L(c.sub);
  $('#shOpts').innerHTML=it.o?it.o.map((o,i)=>`<button class="chip${i===0?' on':''}" data-i="${i}">${L(o)} <small>${o.p}</small></button>`).join(''):'';
  $$('#shOpts .chip').forEach(b=>b.onclick=()=>{sh.opt=+b.dataset.i;$$('#shOpts .chip').forEach(x=>x.classList.toggle('on',x===b));shTotal()});
  shTotal();open('#sheet');
}
function shPrice(){return sh.it.o?sh.it.o[sh.opt].p:sh.it.p}
function shTotal(){$('#shQty').textContent=sh.qty;$('#shTotal').innerHTML=money(shPrice()*sh.qty)}
$('#shMinus').onclick=()=>{sh.qty=Math.max(1,sh.qty-1);shTotal()};
$('#shPlus').onclick=()=>{sh.qty++;shTotal()};
$('#shAdd').onclick=()=>{const it=sh.it,o=it.o?it.o[sh.opt]:null;addToCart({key:it.id+(o?'-'+sh.opt:''),name:{ar:it.ar,en:it.en},desc:o?{ar:o.ar,en:o.en}:null,price:shPrice(),img:sh.cat.img},sh.qty);close('#sheet')};

/* ---------- overlays ---------- */
function open(s){const el=$(s);el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.classList.add('lock');lenis&&lenis.stop()}
function close(s){const el=$(s);el.classList.remove('open');el.setAttribute('aria-hidden','true');if(!$('.sheet.open,.cart.open')){document.body.classList.remove('lock');lenis&&lenis.start()}}
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>{close('#sheet');close('#cart')}));
addEventListener('keydown',e=>{if(e.key==='Escape'){close('#sheet');close('#cart')}});

/* ---------- cart ---------- */
let cart=[];try{cart=JSON.parse(localStorage.getItem('gl-cart')||'[]')}catch(e){}
let mode='pickup';
function save(){try{localStorage.setItem('gl-cart',JSON.stringify(cart))}catch(e){}}
function addToCart(item,q=1){const ex=cart.find(c=>c.key===item.key);if(ex)ex.q+=q;else cart.push({...item,q});save();renderCart();toast(L(T.added));const b=$('#cartBtn');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
function renderCart(){
  const n=cart.reduce((a,c)=>a+c.q,0);const cc=$('#cartCount');cc.textContent=n;cc.classList.toggle('on',n>0);
  $('#cart').classList.toggle('empty',!cart.length);
  $('#cartList').innerHTML=cart.map((c,i)=>`<div class="ci"><span class="ci-dot"><img src="assets/img/${c.img}.webp" alt=""></span><div class="ci-main"><b>${L(c.name)}</b>${c.desc?`<small>${L(c.desc)}</small>`:''}</div><div class="ci-q"><button data-a="-" data-i="${i}">−</button><span>${c.q}</span><button data-a="+" data-i="${i}">+</button></div><span class="ci-p">${c.price*c.q}</span></div>`).join('');
  $$('.ci-q button').forEach(b=>b.onclick=()=>{const c=cart[+b.dataset.i];c.q+=b.dataset.a==='+'?1:-1;if(c.q<1)cart.splice(+b.dataset.i,1);save();renderCart()});
  const sub=cart.reduce((a,c)=>a+c.price*c.q,0);const del=mode==='delivery'&&sub<CFG.freeOver?CFG.delivery:0;
  $('#cSub').innerHTML=money(sub);$('#cDel').innerHTML=del?money(del):(lang==='en'?'Free':'مجاني');$('#cTot').innerHTML=money(sub+del);
  $('#cDelRow').classList.toggle('hide',mode!=='delivery');$('#cAddr').classList.toggle('hide',mode!=='delivery');
}
$$('#mode button').forEach(b=>b.onclick=()=>{mode=b.dataset.v;$$('#mode button').forEach(x=>x.classList.toggle('on',x===b));renderCart()});
$('#cartBtn').onclick=()=>open('#cart');
$('#togoBtn').onclick=()=>{cart.length?open('#cart'):goCat('gelato')};
$('#sendWa').onclick=()=>{
  const name=$('#cName').value.trim(),addr=$('#cAddr').value.trim(),note=$('#cNote').value.trim();
  if(!name){toast(L(T.name));$('#cName').focus();return}
  if(mode==='delivery'&&!addr){toast(L(T.addr));$('#cAddr').focus();return}
  const en=lang==='en';const sub=cart.reduce((a,c)=>a+c.price*c.q,0);const del=mode==='delivery'&&sub<CFG.freeOver?CFG.delivery:0;
  const modes={pickup:en?'Pick up':'استلام من الفرع',delivery:en?'Delivery':'توصيل',dinein:en?'Dine in':'في الكافيه'};
  let m=(en?'Hi glacé! New order 🍦':'أهلًا جلاسيه! طلب جديد 🍦')+'\n\n';
  cart.forEach(c=>{m+=`• ${c.q}× ${L(c.name)}${c.desc?' ('+L(c.desc)+')':''} — ${c.price*c.q} ${cur()}\n`});
  m+=`\n${en?'Subtotal':'المجموع'}: ${sub} ${cur()}`;if(mode==='delivery')m+=`\n${en?'Delivery':'التوصيل'}: ${del} ${cur()}`;m+=`\n${en?'Total':'الإجمالي'}: ${sub+del} ${cur()}\n\n`;
  m+=`${en?'Type':'النوع'}: ${modes[mode]}\n${en?'Name':'الاسم'}: ${name}`;if(addr)m+=`\n${en?'Address':'العنوان'}: ${addr}`;if(note)m+=`\n${en?'Notes':'ملاحظات'}: ${note}`;
  window.open(`https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(m)}`,'_blank');
};

/* ---------- loyalty ---------- */
(function(){
  const box=$('#stamps');let n=3;
  function r(){box.innerHTML=Array.from({length:10},(_,i)=>`<button class="stamp${i<n?' on':''}${i===9?' gift':''}" data-i="${i}" aria-label="${i+1}"><svg><use href="#gmark"/></svg>${i===9?'<svg class="gift-i"><use href="#spark"/></svg>':''}</button>`).join('');
    $$('.stamp',box).forEach(b=>b.onclick=()=>{const i=+b.dataset.i;n=(i+1===n)?i:i+1;r();if(n===10)toast(L(T.stamp))})}
  r();
})();

/* ---------- Lenis ---------- */
let lenis=null;
if(window.Lenis&&!weak&&!reduce){lenis=new Lenis({duration:1.1,smoothWheel:true});if(hasGsap){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}else{const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf)}}
$$('a[href^="#"]').forEach(a=>{if(a.dataset.cat)return;a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length<2)return;const el=$(id);if(!el)return;e.preventDefault();scrollToEl(el,id==='#top'?0:60)})});

/* ---------- initial render ---------- */
applyLang();

/* ---------- intro + motion ---------- */
function heroIn(){
  if(!hasGsap)return;
  const tl=gsap.timeline();
  tl.from('.hero-photo img',{scale:1.12,duration:2.2,ease:'power3.out'},0)
    .from('.hero-h .line>*',{yPercent:110,duration:1.1,ease:'power4.out',stagger:.12},.1)
    .from(['.eyebrow','.hero-sub','.hero-cta','.hero-facts li'],{y:24,opacity:0,duration:.9,ease:'power3.out',stagger:.08},.35)
    .from('.hdr',{y:-30,opacity:0,duration:.8,ease:'power3.out'},.2);
  drawSwirls($('.hero-swirl'),2.6);
}
function runIntro(){
  const intro=$('#intro');
  if(!hasGsap||reduce){intro.remove();return}
  document.body.classList.add('lock');lenis&&lenis.stop();
  gsap.set('.im-drips',{scaleY:0,transformOrigin:'50% 0%',visibility:'visible'});
  const tl=gsap.timeline({onComplete:()=>{intro.remove();document.body.classList.remove('lock');lenis&&lenis.start()}});
  tl.to('.im-bowl',{strokeDashoffset:0,duration:.9,ease:'power2.inOut'})
    .to('.im-stem',{strokeDashoffset:0,duration:.75,ease:'power2.inOut'},'-=.25')
    .to('.im-drips',{scaleY:1,duration:1.1,ease:'elastic.out(1,.55)'},'-=.15')
    .to('.intro-word span',{opacity:1,y:0,duration:.6,ease:'back.out(2)',stagger:.06},'-=.8')
    .to('.intro-tag',{opacity:.85,duration:.6},'-=.3')
    .to('.intro-spark',{opacity:1,scale:1.2,rotate:45,duration:.5,stagger:.12,yoyo:true,repeat:1},'-=.8')
    .fromTo('.im-drop',{opacity:1,y:0},{y:120,opacity:0,duration:.7,ease:'power2.in'},'-=.6')
    .to(intro,{yPercent:-118,duration:1.1,ease:'power3.inOut',onStart:heroIn},'+=.15');
}
runIntro();

if(hasGsap&&window.ScrollTrigger){
  // section reveals
  $$('.sec-head,.arch,.fl-copy,.fl-show,.st-stage,.st-panel,.togo-copy,.card-stamp,.visit-card,.menu-bar').forEach(el=>el.classList.add('rv'));
  ScrollTrigger.batch('.rv',{start:'top 88%',once:true,onEnter:b=>gsap.to(b,{opacity:1,y:0,duration:1,ease:'power3.out',stagger:.1})});
  // swirls on scroll
  $$('.swirl:not(.hero-swirl)').forEach(s=>ScrollTrigger.create({trigger:s.parentElement,start:'top 70%',once:true,onEnter:()=>drawSwirls(s,2.8)}));
  // hero parallax
  gsap.to('.hero-photo img',{yPercent:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-copy',{y:-60,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  // to-go pics
  gsap.from('.tp1',{yPercent:10,ease:'none',scrollTrigger:{trigger:'.togo',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.from('.tp2',{yPercent:-14,rotate:4,ease:'none',scrollTrigger:{trigger:'.togo',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.to('.visit-photo img',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.visit',start:'top bottom',end:'bottom top',scrub:true}});
  // affogato
  const steps=$$('#affoSteps li');
  gsap.set('#affoCover',{scaleY:0,transformOrigin:'50% 0%'});
  const atl=gsap.timeline({defaults:{ease:'none'}});
  atl.to('#affoStream',{strokeDashoffset:0,duration:1})
     .to('#affoCover',{scaleY:1,duration:1.2},'.6')
     .to('#affoFill',{attr:{y:330},duration:1.6},'.8')
     .to('#affoCrema',{y:-110,duration:1.6},'.8')
     .to('#affoStream',{opacity:0,duration:.3},2.2)
     .to('#affoSteam',{opacity:1,duration:.4},2.3)
     .to('#affoSteam path',{y:-10,duration:.6},2.4);
  const desktop=!isMobile();
  ScrollTrigger.create({trigger:desktop?'#affo':'.affo-art',start:desktop?'top top':'top 65%',end:desktop?'+=1400':'bottom 20%',pin:desktop?'.affo-pin':false,scrub:.6,animation:atl,
    onUpdate:s=>{const k=s.progress<.3?0:s.progress<.7?1:2;steps.forEach((li,i)=>li.classList.toggle('on',i===k))}});
  addEventListener('load',()=>ScrollTrigger.refresh());
}
})();
