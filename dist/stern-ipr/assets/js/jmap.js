/* STERN IP — jurisdictions map */
(function(){
  var d=document,w=window,M=w.STERN_MAP,J=w.STERN_J,C=w.STERN_CITIES,host=d.getElementById('jmap');
  if(!M||!J||!host)return;
  var NS='http://www.w3.org/2000/svg';
  var svg=d.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','120 90 800 700');svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  var g=d.createElementNS(NS,'g');svg.appendChild(g);
  var paths={};
  var officeNames=['Egypt','Saudi Arabia','United Arab Emirates','Kuwait','Jordan','Sudan','Algeria','Kenya','Ethiopia','South Africa'];
  M.c.forEach(function(c){
    var p=d.createElementNS(NS,'path');p.setAttribute('d',c.d);
    if(J.j[c.n]){p.classList.add('has');p.setAttribute('tabindex','0');p.setAttribute('role','button');p.setAttribute('aria-label',J.j[c.n].n)}
    if(officeNames.indexOf(c.n)>-1)p.classList.add('off');
    if(J.ox[c.n]){p.classList.add('has');p.setAttribute('tabindex','0');p.setAttribute('aria-label',J.ox[c.n])}
    p.dataset.c=c.n;g.appendChild(p);paths[c.n]=p;
  });
  // office pins
  var pins=['cairo','amman','riyadh','dubai','kuwait','algiers','khartoum','nairobi','addis','joburg'];
  pins.forEach(function(k,i){
    var c=C[k];if(!c)return;
    var r=d.createElementNS(NS,'circle');r.setAttribute('cx',c[0]);r.setAttribute('cy',c[1]);r.setAttribute('r',k==='cairo'?5:3.2);r.setAttribute('class','pin');g.appendChild(r);
    var ring=d.createElementNS(NS,'circle');ring.setAttribute('cx',c[0]);ring.setAttribute('cy',c[1]);ring.setAttribute('r',6);ring.setAttribute('class','pin-r');
    ring.innerHTML='<animate attributeName="r" from="4" to="'+(k==='cairo'?22:14)+'" dur="2.4s" begin="'+(i*.2)+'s" repeatCount="indefinite"/><animate attributeName="opacity" from=".8" to="0" dur="2.4s" begin="'+(i*.2)+'s" repeatCount="indefinite"/>';
    g.appendChild(ring);
  });
  host.appendChild(svg);
  var nameEl=d.getElementById('jname'),tagEl=d.getElementById('jtag'),facts=d.getElementById('jfacts');
  function select(n,scroll){
    Object.keys(paths).forEach(function(k){paths[k].classList.toggle('sel',k===n)});
    d.querySelectorAll('.jc').forEach(function(b){b.classList.toggle('sel',b.dataset.c===n)});
    var j=J.j[n];
    if(j){nameEl.textContent=j.n;tagEl.textContent=j.o?J.office:J.corr;
      facts.innerHTML=j.f.map(function(f){return '<div><dt>'+f[0]+'</dt><dd>'+f[1]+'</dd></div>'}).join('');}
    else if(J.ox[n]){nameEl.textContent=J.ox[n];tagEl.textContent=J.office;facts.innerHTML='<div><dd style="grid-column:1/-1;color:#c6cedd">'+J.noTable+'</dd></div>'}
    if(w.gsap){gsap.fromTo([nameEl,tagEl],{y:10,opacity:0},{y:0,opacity:1,duration:.5,stagger:.05,ease:'power3.out'});
      gsap.fromTo(facts.children,{x:d.documentElement.dir==='rtl'?-14:14,opacity:0},{x:0,opacity:1,duration:.5,stagger:.04,ease:'power3.out'})}
    if(scroll&&innerWidth<960){var p=d.getElementById('jpanel');w.__lenis?w.__lenis.scrollTo(p,{offset:-80}):p.scrollIntoView({behavior:'smooth'})}
  }
  g.addEventListener('click',function(e){var p=e.target.closest('path.has');if(p)select(p.dataset.c,true)});
  g.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('has')){e.preventDefault();select(e.target.dataset.c,true)}});
  d.querySelectorAll('.jc').forEach(function(b){b.addEventListener('click',function(){select(b.dataset.c,true)})});
  d.querySelectorAll('.jf button').forEach(function(b){b.addEventListener('click',function(){
    d.querySelectorAll('.jf button').forEach(function(x){x.classList.toggle('on',x===b)});
    var f=b.dataset.f;d.querySelectorAll('.jc').forEach(function(c){c.classList.toggle('hid',f!=='all'&&c.dataset.r!==f)});
  })});
  select('Egypt');
  if(w.gsap&&!w.matchMedia('(prefers-reduced-motion: reduce)').matches){
    gsap.from(g.querySelectorAll('path'),{opacity:0,duration:1.2,stagger:{each:.006,from:'center'},ease:'power2.out',scrollTrigger:{trigger:host,start:'top 85%',once:true}});
  }
})();
