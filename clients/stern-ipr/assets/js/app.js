/* STERN IP — shared behaviour */
(function(){
  var d=document,w=window,root=d.documentElement,body=d.body;
  var RTL=root.dir==='rtl';
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)body.classList.add('reduce');
  var hasG=!!w.gsap;
  if(hasG&&w.ScrollTrigger)gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  var lenis=null;
  if(w.Lenis&&!reduce){
    lenis=new Lenis({duration:1.1,smoothWheel:true});
    w.__lenis=lenis;
    if(hasG){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
    else{(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0)}
  }

  /* header */
  var hd=d.getElementById('hd'),lastY=0;
  function onScroll(){
    var y=w.scrollY||0;
    hd.classList.toggle('sc',y>40);
    var open=body.classList.contains('mm-open');
    hd.classList.toggle('hide',!open&&y>lastY&&y>400);
    lastY=y;
  }
  w.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* mobile menu */
  var bg=d.getElementById('burger'),mm=d.getElementById('mm');
  function setMenu(o){
    body.classList.toggle('mm-open',o);root.classList.toggle('mm-open',o);
    bg.setAttribute('aria-expanded',o);mm.setAttribute('aria-hidden',!o);
    if(lenis){o?lenis.stop():lenis.start()}
    body.style.overflow=o?'hidden':'';
    if(o&&hasG&&!reduce){gsap.fromTo(mm.querySelectorAll('.mm-l,.mm-sub,.mm-ft'),{y:30,opacity:0},{y:0,opacity:1,stagger:.05,duration:.7,delay:.2,ease:'power3.out'})}
  }
  bg&&bg.addEventListener('click',function(){setMenu(!body.classList.contains('mm-open'))});
  mm&&mm.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&body.classList.contains('mm-open'))setMenu(false)});

  /* anchors through lenis */
  d.addEventListener('click',function(e){
    var a=e.target.closest('a[href*="#"]');if(!a)return;
    var u=new URL(a.href,location.href);
    if(u.pathname===location.pathname&&u.hash&&u.hash.length>1){var t=d.querySelector(u.hash);if(t){e.preventDefault();lenis?lenis.scrollTo(t,{offset:-90}):t.scrollIntoView({behavior:'smooth'})}}
  });

  /* split headings into words */
  function split(el){
    if(el.dataset.done)return;el.dataset.done=1;
    var out=[];
    (function walk(node){
      node.childNodes.forEach(function(n){
        if(n.nodeType===3){
          n.textContent.split(/(\s+)/).forEach(function(p){
            if(!p)return;
            if(/^\s+$/.test(p))out.push(d.createTextNode(' '));
            else{var s=d.createElement('span');s.className='w';var i=d.createElement('span');i.textContent=p;s.appendChild(i);out.push(s)}
          });
        }else if(n.nodeName==='BR'){out.push(d.createElement('br'))}
        else{walk(n)}
      });
    })(el);
    el.textContent='';out.forEach(function(n){el.appendChild(n)});
  }
  var splits=d.querySelectorAll('[data-split]');
  splits.forEach(split);

  /* word highlight on scroll */
  d.querySelectorAll('[data-words]').forEach(function(el){
    var words=el.textContent.trim().split(/\s+/);el.textContent='';
    words.forEach(function(wd,i){var s=d.createElement('span');s.className='wd';s.textContent=wd;el.appendChild(s);if(i<words.length-1)el.appendChild(d.createTextNode(' '))});
    var spans=el.querySelectorAll('.wd');
    if(!hasG||reduce){spans.forEach(function(s){s.classList.add('on')});return}
    ScrollTrigger.create({trigger:el,start:'top 82%',end:'bottom 45%',scrub:true,onUpdate:function(st){
      var n=Math.round(st.progress*spans.length);spans.forEach(function(s,i){s.classList.toggle('on',i<n)})}});
  });

  /* reveals */
  var revealSel='.sh,.why-c,.px,.pc,.val,.mv-c,.tm,.sv,.org,.rgc,.nw,.clc,.ct-c,.cf,.mem li,.edu li,.tl-i,.st,.fx,.ac,.chk li,.treat li,.grp li,.prose>p,.rg,.jc';
  if(hasG&&!reduce){
    d.querySelectorAll(revealSel).forEach(function(el){el.classList.add('rv')});
    ScrollTrigger.batch('.rv',{start:'top 90%',once:true,onEnter:function(b){gsap.to(b,{opacity:1,y:0,duration:.9,stagger:.06,ease:'power3.out',overwrite:true})}});
    d.querySelectorAll('[data-split]').forEach(function(el){
      if(el.closest('.hero'))return; // hero handled by intro
      gsap.from(el.querySelectorAll('.w>span'),{yPercent:110,duration:1.05,stagger:.045,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });
    /* page hero entrance */
    var ph=d.querySelector('.ph');
    if(ph){gsap.from(ph.querySelectorAll('.crumb,.kk,.ph-l'),{y:24,opacity:0,duration:1,stagger:.1,delay:.15,ease:'power3.out'});
      gsap.from('.ph-eagle',{opacity:0,scale:.9,duration:2,ease:'power2.out'});
      gsap.to('.ph-eagle',{yPercent:18,ease:'none',scrollTrigger:{trigger:ph,start:'top top',end:'bottom top',scrub:true}})}
    var ce=d.querySelector('.chair-mark .eagle');
    if(ce)gsap.from(ce,{scale:.6,opacity:0,rotate:-6,duration:1.6,ease:'power3.out',scrollTrigger:{trigger:ce,start:'top 85%',once:true}});
    /* stats counter */
    d.querySelectorAll('[data-count]').forEach(function(el){
      var to=+el.dataset.count,from=to>1900?1990:0,o={v:from};
      ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:function(){gsap.to(o,{v:to,duration:2,ease:'power3.out',onUpdate:function(){el.textContent=Math.round(o.v)}})}});
    });
  }

  /* ---------- rays canvas: page heroes + CTA (the eagle's converging feathers) */
  function rays(cv){
    var ctx=cv.getContext('2d'),W,H,dpr=Math.min(w.devicePixelRatio||1,2),t0=performance.now(),vis=true,mode=cv.dataset.rays;
    var N=mode==='burst'?64:42,seeds=[];
    for(var i=0;i<N;i++)seeds.push({a:Math.random(),s:.3+Math.random()*.7,p:Math.random()*Math.PI*2});
    var stars=[];for(var j=0;j<90;j++)stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.2+.2,p:Math.random()*6});
    function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    size();w.addEventListener('resize',size);
    if('IntersectionObserver' in w)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);
    function frame(now){
      requestAnimationFrame(frame);if(!vis)return;
      var t=(now-t0)/1000;ctx.clearRect(0,0,W,H);
      var cx=mode==='burst'?W/2:(RTL?W*.22:W*.78),cy=mode==='burst'?H*1.05:H*.15;
      var R=Math.hypot(W,H)*1.1;
      var g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*.6);g.addColorStop(0,'rgba(93,131,204,.28)');g.addColorStop(1,'rgba(4,9,24,0)');
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      for(var j=0;j<stars.length;j++){var st=stars[j];ctx.globalAlpha=.25+.35*Math.sin(t*1.3+st.p)*.5+.2;ctx.fillStyle='#dfe8ff';ctx.beginPath();ctx.arc(st.x*W,st.y*H,st.r,0,7);ctx.fill()}
      ctx.globalAlpha=1;
      for(var i=0;i<N;i++){
        var s=seeds[i],ang;
        if(mode==='burst')ang=Math.PI+.08+s.a*(Math.PI-.16);
        else ang=RTL?(.04+s.a*Math.PI*.46):(Math.PI*.5+s.a*Math.PI*.46);
        var x2=cx+Math.cos(ang)*R,y2=cy+Math.sin(ang)*R;
        var pulse=(Math.sin(t*s.s+s.p)+1)/2;
        var lg=ctx.createLinearGradient(cx,cy,x2,y2);
        lg.addColorStop(0,'rgba(169,193,242,'+(.22*pulse+.05)+')');lg.addColorStop(.6,'rgba(169,193,242,0)');
        ctx.strokeStyle=lg;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x2,y2);ctx.stroke();
        // travelling spark
        var k=((t*.08*s.s+s.a)%1);ctx.fillStyle='rgba(223,232,255,'+(.8*(1-k))+')';
        ctx.beginPath();ctx.arc(cx+(x2-cx)*k*.6,cy+(y2-cy)*k*.6,1.1,0,7);ctx.fill();
      }
      ctx.fillStyle='#fff';ctx.shadowColor='#a9c1f2';ctx.shadowBlur=24;ctx.beginPath();ctx.arc(cx,cy,2.2,0,7);ctx.fill();ctx.shadowBlur=0;
    }
    if(reduce){frame(performance.now());}else requestAnimationFrame(frame);
  }
  d.querySelectorAll('canvas[data-rays]').forEach(rays);

  /* ---------- dot maps (home mini map + contact HQ) */
  function dotMap(cv,opts){
    if(!w.STERN_DOTS||!w.STERN_CITIES)return;
    var D=w.STERN_DOTS,C=w.STERN_CITIES,ctx=cv.getContext('2d'),W,H,dpr=Math.min(w.devicePixelRatio||1,2),sc,ox,oy,vis=true,t0=performance.now();
    var vb=opts.vb||[0,0,D.w,D.h];
    function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      sc=Math.max(W/vb[2],H/vb[3])*(opts.cover?1:0)||Math.min(W/vb[2],H/vb[3]);ox=(W-vb[2]*sc)/2-vb[0]*sc;oy=(H-vb[3]*sc)/2-vb[1]*sc}
    size();w.addEventListener('resize',size);
    if('IntersectionObserver' in w)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);
    var offices=['amman','riyadh','dubai','kuwait','algiers','khartoum','nairobi','addis','yaounde','harare','joburg'];
    function P(k){var c=C[k];return[ox+c[0]*sc,oy+c[1]*sc]}
    function frame(now){
      requestAnimationFrame(frame);if(!vis)return;
      var t=(now-t0)/1000;ctx.clearRect(0,0,W,H);
      var r=Math.max(.8,sc*D.s*.2);
      ctx.fillStyle='rgba(169,193,242,.28)';
      for(var i=0;i<D.p.length;i+=2){var x=ox+D.p[i]*sc,y=oy+D.p[i+1]*sc;if(x<-5||y<-5||x>W+5||y>H+5)continue;ctx.fillRect(x-r/2,y-r/2,r,r)}
      var hq=P('cairo');
      if(opts.arcs){
        offices.forEach(function(k,i){
          var p=P(k),mx=(hq[0]+p[0])/2,my=(hq[1]+p[1])/2-Math.hypot(p[0]-hq[0],p[1]-hq[1])*.28;
          ctx.strokeStyle='rgba(169,193,242,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hq[0],hq[1]);ctx.quadraticCurveTo(mx,my,p[0],p[1]);ctx.stroke();
          var k2=((t*.25+i*.13)%1),q=1-k2,x=q*q*hq[0]+2*q*k2*mx+k2*k2*p[0],y=q*q*hq[1]+2*q*k2*my+k2*k2*p[1];
          ctx.fillStyle='rgba(255,255,255,'+(1-k2)+')';ctx.beginPath();ctx.arc(x,y,1.8,0,7);ctx.fill();
          ctx.fillStyle='#a9c1f2';ctx.shadowColor='#a9c1f2';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(p[0],p[1],3,0,7);ctx.fill();ctx.shadowBlur=0;
        });
      }
      var pr=(t%2.4)/2.4;
      ctx.strokeStyle='rgba(255,255,255,'+(1-pr)+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(hq[0],hq[1],4+pr*(opts.arcs?26:40),0,7);ctx.stroke();
      ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(hq[0],hq[1],4,0,7);ctx.fill();ctx.shadowBlur=0;
    }
    requestAnimationFrame(frame);
  }
  var mini=d.getElementById('miniMap');if(mini)dotMap(mini,{arcs:true,vb:[150,120,720,660]});
  var hq=d.getElementById('hqMap');if(hq)dotMap(hq,{cover:true,vb:[400,150,340,220]});

  /* ---------- contact form */
  var cf=d.getElementById('cf');
  if(cf){
    var via='mail';
    cf.querySelectorAll('[data-via]').forEach(function(b){b.addEventListener('click',function(){via=b.dataset.via})});
    cf.addEventListener('submit',function(e){
      e.preventDefault();var ok=true,f=cf.elements;
      ['first','last','email','msg'].forEach(function(n){var el=f[n],v=el.value.trim(),bad=!v||(n==='email'&&!/^\S+@\S+\.\S+$/.test(v));el.classList.toggle('bad',bad);if(bad)ok=false});
      var note=d.getElementById('cfn');
      if(!ok){note.textContent=RTL?'من فضلك أكمل الحقول المطلوبة.':'Please complete the required fields.';return}
      var name=f.first.value.trim()+' '+f.last.value.trim(),sub=f.subject.value;
      var txt=(RTL?'الاسم: ':'Name: ')+name+'\n'+(RTL?'البريد: ':'Email: ')+f.email.value.trim()+'\n'+(RTL?'الموضوع: ':'Subject: ')+sub+'\n\n'+f.msg.value.trim();
      if(via==='wa')w.open('https://wa.me/'+cf.dataset.wa+'?text='+encodeURIComponent(txt),'_blank','noopener');
      else location.href='mailto:'+cf.dataset.mail+'?subject='+encodeURIComponent('STERN IP — '+sub)+'&body='+encodeURIComponent(txt);
      note.textContent=RTL?'شكرًا لك، تم تجهيز رسالتك للإرسال.':'Thank you — your message is ready to send.';
    });
  }

  /* jurisdictions anchors from other pages */
  w.addEventListener('load',function(){if(location.hash){var t=d.querySelector(location.hash);if(t&&lenis)setTimeout(function(){lenis.scrollTo(t,{offset:-90,immediate:true})},60)}if(hasG)ScrollTrigger.refresh()});
})();
