/* STERN IP — logo intro: a single star (Stern) at the eagle's heart, feathers shoot out as rays,
   the outline is drawn along them, the wings spread and the mark fills with light. Once per session. */
(function(){
  var d=document,w=window;
  var reduce=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen=false;try{seen=sessionStorage.getItem('stern-intro')==='1'}catch(e){}
  function heroIn(delay){
    if(!w.gsap)return;
    var h=d.querySelector('.hero');if(!h)return;
    var tl=gsap.timeline({delay:delay||0});
    tl.from(h.querySelectorAll('.hero-t .w>span'),{yPercent:115,duration:1.2,stagger:.07,ease:'power4.out'})
      .from(h.querySelectorAll('.kk,.hero-l,.hero-b>*'),{y:26,opacity:0,duration:1,stagger:.08,ease:'power3.out'},'-=.9')
      .from('.hero-eagle',{opacity:0,scale:.92,duration:2.2,ease:'power2.out'},0)
      .from('.hero-tick,.hero-legend',{opacity:0,y:20,duration:1,ease:'power3.out'},'-=1');
    var hd=d.getElementById('hd');if(hd)tl.from(hd,{opacity:0,duration:.9,ease:'power2.out'},.2);
    var e=d.querySelector('.hero-eagle');
    if(e)gsap.to(e,{yPercent:-30,opacity:.02,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  }
  function start(){
    if(seen||reduce||!w.gsap){d.documentElement.classList.remove('io');heroIn(.05);return}
    try{sessionStorage.setItem('stern-intro','1')}catch(e){}
    var src=d.querySelector('.hero-eagle svg');if(!src){heroIn(0);return}
    var D=src.querySelector('.e-fill').getAttribute('d');
    var rays=src.querySelector('.e-rays').innerHTML;
    var ov=d.createElement('div');ov.className='intro-ov';ov.setAttribute('aria-hidden','true');
    ov.innerHTML='<canvas></canvas><button class="io-skip" type="button">SKIP</button>'+
      '<div class="io-c"><svg class="eagle" viewBox="0 6 604 224"><defs>'+
      '<linearGradient id="ioG" x1="0" x2="1"><stop offset="0" stop-color="#1b3673"/><stop offset=".55" stop-color="#4c72bd"/><stop offset="1" stop-color="#a9c1f2"/></linearGradient>'+
      '<radialGradient id="ioS"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#cfe0ff" stop-opacity=".9"/><stop offset="1" stop-color="#5d83cc" stop-opacity="0"/></radialGradient>'+
      '<clipPath id="ioC"><circle id="ioCc" cx="301" cy="124" r="0"/></clipPath></defs>'+
      '<g id="ioW" style="transform-origin:301px 124px"><g class="e-rays">'+rays+'</g>'+
      '<path class="io-outline" d="'+D+'"/>'+
      '<path clip-path="url(#ioC)" fill="url(#ioG)" fill-rule="evenodd" d="'+D+'"/></g>'+
      '<circle id="ioStar" cx="301" cy="124" r="40" fill="url(#ioS)"/></svg>'+
      '<div class="io-wm"><b>STERN IPR</b><i>INTELLECTUAL PROPERTY</i></div></div>'+
      '<div class="io-meta"><span>CAIRO · EST. 2008</span><span id="ioN">PROTECTING 000</span></div>';
    d.body.appendChild(ov);d.documentElement.classList.remove('io');
    d.documentElement.style.overflow='hidden';
    if(w.__lenis)w.__lenis.stop();
    /* starfield */
    var cv=ov.querySelector('canvas'),ctx=cv.getContext('2d'),dpr=Math.min(w.devicePixelRatio||1,2),W,H,stars=[],run=true,t0=performance.now();
    function size(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    size();
    for(var i=0;i<260;i++)stars.push({a:Math.random()*Math.PI*2,r:Math.random(),z:Math.random()*.9+.1});
    (function loop(now){if(!run)return;requestAnimationFrame(loop);var t=(now-t0)/1000;ctx.clearRect(0,0,W,H);
      var cx=W/2,cy=H/2-H*.06,R=Math.hypot(W,H)/2;
      for(var i=0;i<stars.length;i++){var s=stars[i],k=(s.r+t*.05*s.z)%1,rr=k*k*R;
        ctx.globalAlpha=Math.min(1,k*2)*.7*s.z;ctx.fillStyle='#dfe8ff';ctx.beginPath();ctx.arc(cx+Math.cos(s.a)*rr,cy+Math.sin(s.a)*rr,.4+k*1.3*s.z,0,7);ctx.fill()}
      ctx.globalAlpha=1})(t0);
    var outline=ov.querySelector('.io-outline'),L=outline.getTotalLength?outline.getTotalLength():4000;
    outline.style.strokeDasharray=L;outline.style.strokeDashoffset=L;
    var lines=ov.querySelectorAll('.e-rays line');
    lines.forEach(function(l){var len=Math.hypot(l.x2.baseVal.value-l.x1.baseVal.value,l.y2.baseVal.value-l.y1.baseVal.value);l.style.strokeDasharray=len;l.style.strokeDashoffset=len;l.style.opacity=1});
    var wm=ov.querySelector('.io-wm'),n={v:0},nEl=ov.querySelector('#ioN');
    var tl=gsap.timeline({onComplete:done});
    tl.fromTo('#ioStar',{scale:0,transformOrigin:'301px 124px'},{scale:1.4,duration:.55,ease:'back.out(3)'})
      .to(lines,{strokeDashoffset:0,duration:.75,stagger:{each:.035,from:'random'},ease:'power3.out'},'-=.15')
      .fromTo('#ioW',{scaleX:.72},{scaleX:1,duration:1.5,ease:'power3.inOut'},'<')
      .to(outline,{strokeDashoffset:0,duration:1.15,ease:'power2.inOut'},'-=1.1')
      .to('#ioCc',{attr:{r:420},duration:1.0,ease:'power2.in'},'-=.55')
      .to(lines,{opacity:0,duration:.5},'-=.5')
      .to('#ioStar',{scale:.5,opacity:.0,duration:.6},'-=.6')
      .to(outline,{opacity:.35,duration:.6},'-=.5')
      .from(wm.children,{opacity:0,letterSpacing:'1.1em',duration:1.1,stagger:.12,ease:'power3.out'},'-=.7')
      .to(n,{v:100,duration:2.6,ease:'power1.inOut',onUpdate:function(){nEl.textContent='PROTECTING '+String(Math.round(n.v)).padStart(3,'0')}},0)
      .to({},{duration:.35});
    function done(){
      var ex=gsap.timeline({onComplete:function(){run=false;ov.remove();d.documentElement.style.overflow='';if(w.__lenis)w.__lenis.start();if(w.ScrollTrigger)ScrollTrigger.refresh()}});
      ex.to('.io-c',{scale:.86,opacity:0,duration:.7,ease:'power3.in'})
        .to('.io-meta,.io-skip',{opacity:0,duration:.4},0)
        .to(ov,{clipPath:'inset(0 0 100% 0)',duration:.9,ease:'power4.inOut'},'-=.2');
      heroIn(.75);
    }
    ov.querySelector('.io-skip').addEventListener('click',function(){tl.progress(1)});
  }
  d.addEventListener('DOMContentLoaded',start);
})();
